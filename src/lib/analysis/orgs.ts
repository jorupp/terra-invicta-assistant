import { combineEffects, ShowEffectsProps } from "@/components/showEffects";
import { SaveFile } from "../savefile";
import { templates } from "../templates";
import { analyzeFactions } from "./factions";
import { analyzeNations } from "./nations";

export interface AnalyzeOrgsArgs {
  regionsById: ReturnType<typeof analyzeNations>["regionsById"];
  nationsById: ReturnType<typeof analyzeNations>["nationsById"];
  playerFaction: Awaited<ReturnType<typeof analyzeFactions>>["playerFaction"];
}

export async function analyzeOrgs(saveFile: SaveFile, { regionsById, nationsById, playerFaction }: AnalyzeOrgsArgs) {
  const orgTemplates = new Map(
    (await templates.orgs()).map((org) => [
      org.dataName,
      {
        // may not need some of these, as they end up in the org state itself
        dataName: org.dataName,
        friendlyName: org.friendlyName,
        orgType: org.orgType,
        requiresNationality: org.requiresNationality,
        allowedOnMarket: org.allowedOnMarket,
        requiredOwnerTraits: org.requiredOwnerTraits,
        prohibitedOwnerTraits: org.prohibitedOwnerTraits,
        // homeRegionMapTemplateName: org.homeRegionMapTemplateName, // regionid is on org
        missionsGrantedNames: org.missionsGrantedNames,
        grantsMarked: org.grantsMarked,
        techBonuses: org.techBonuses,
      },
    ]),
  );

  const orgs = saveFile.gamestates["PavonisInteractive.TerraInvicta.TIOrgState"].map(({ Value: org }) => {
    const template = org.templateName ? orgTemplates.get(org.templateName) : undefined;
    const homeRegionId = org.homeRegion?.value;
    const homeNationId = regionsById.get(homeRegionId || -1)?.nationId;
    const homeNation = homeNationId ? nationsById.get(homeNationId) : undefined;
    return {
      id: org.ID.value,
      displayName: org.displayName!,
      templateName: org.templateName,
      template,
      assignedCouncilorId: org.assignedCouncilor?.value,
      factionOrbitId: org.factionOrbit?.value,
      homeRegionId,
      homeNationId,
      homeNationTemplateName: homeNation?.templateName,
      homeNationName: homeNation?.displayName,
      tier: org.tier,
      takeoverDefense: org.takeoverDefense,
      costMoney: org.costMoney,
      costInfluence: org.costInfluence,
      costOps: org.costOps,
      costBoost: org.costBoost,
      incomeMoney_month: org.incomeMoney_month,
      incomeInfluence_month: org.incomeInfluence_month,
      incomeOps_month: org.incomeOps_month,
      incomeBoost_month: org.incomeBoost_month,
      incomeMissionControl: org.incomeMissionControl,
      incomeResearch_month: org.incomeResearch_month,
      projectCapacityGranted: org.projectCapacityGranted,
      persuasion: org.persuasion,
      command: org.command,
      investigation: org.investigation,
      espionage: org.espionage,
      administration: org.administration,
      science: org.science,
      security: org.security,
      economyBonus: org.economyBonus,
      welfareBonus: org.welfareBonus,
      environmentBonus: org.environmentBonus,
      knowledgeBonus: org.knowledgeBonus,
      governmentBonus: org.governmentBonus,
      unityBonus: org.unityBonus,
      militaryBonus: org.militaryBonus,
      oppressionBonus: org.oppressionBonus,
      spoilsBonus: org.spoilsBonus,
      spaceDevBonus: org.spaceDevBonus,
      spaceflightBonus: org.spaceflightBonus,
      MCBonus: org.MCBonus,
      miningBonus: org.miningBonus,
      XPModifier: org.XPModifier,
      isAdminOrg: (org.tier || 0) < (org.administration || 0),
    };
  });
  const orgsById = new Map<number, (typeof orgs)[0]>(orgs.map((org) => [org.id, org]));
  const playerUnassignedOrgs = orgs.filter((org) => playerFaction?.unassignedOrgIds.includes(org.id));
  const playerAvailableOrgs = orgs.filter((org) => playerFaction?.availableOrgIds.includes(org.id));

  const councilorTraitTemplates = (await templates.traits()).map((trait) => ({
    dataName: trait.dataName,
    friendlyName: trait.friendlyName,
    xpCost: trait.XPCost,
    xpModifier: trait.XPModifier,
    upgradesFrom: trait.upgradesFrom,
    boostCost: trait.boostCost,
    opsCost: trait.opsCost,
    detectionEspBonus: trait.detectionEspBonus,
    incomeBoost: trait.incomeBoost,
    incomeInfluence: trait.incomeInfluence,
    incomeMoney: trait.incomeMoney,
    incomeResearch: trait.incomeResearch,
    priorityBonuses: trait.priorityBonuses,
    statMods: trait.statMods,
    techBonuses: trait.techBonuses,
    missionsGrantedNames: trait.missionsGrantedNames,
    tags: trait.tags,
  }));
  const councilorTraitTemplatesByDataName = new Map(councilorTraitTemplates.map((trait) => [trait.dataName, trait]));
  const councilorTypes = (await templates.councilorTypes()).map((type) => ({
    dataName: type.dataName,
    friendlyName: type.friendlyName,
    missionNames: type.missionNames,
  }));
  const councilorTypesByDataName = new Map(councilorTypes.map((type) => [type.dataName, type]));

  function computeCouncilorEffects(
    attributes: ShowEffectsProps,
    traitTemplates: typeof councilorTraitTemplates,
    councilorOrgs: typeof orgs,
  ): { effectsBaseAndUnaugmentedTraits: ShowEffectsProps; effectsWithOrgsAndAugments: ShowEffectsProps } {
    function addTraits(effects: ShowEffectsProps, traits: typeof councilorTraitTemplates): ShowEffectsProps {
      // Add trait effects
      let finalEffects = traits.reduce<ShowEffectsProps>(
        (acc, trait) => {
          return combineEffects(acc, {
            incomeMoney_month: trait?.incomeMoney,
            incomeBoost_month: trait?.incomeBoost,
            incomeInfluence_month: trait?.incomeInfluence,
            incomeResearch_month: trait?.incomeResearch,
            councilorTechBonus: trait?.techBonuses,
            missionsGrantedNames: trait?.missionsGrantedNames,
            xpModifier: trait?.xpModifier,
          });
        },
        { ...effects },
      );

      // Apply trait statMods and priorityBonuses
      for (const trait of traits) {
        for (const { stat, operation, strValue, condition } of trait.statMods || []) {
          if (stat && strValue && !condition && operation === "Additive") {
            (finalEffects as any)[stat] = ((finalEffects as any)[stat] || 0) + Number(strValue);
          }
          if (stat === "Loyalty" && strValue && !condition && operation === "Additive") {
            (finalEffects as any)["maxLoyalty"] = ((finalEffects as any)["maxLoyalty"] || 0) + Number(strValue);
          }
        }
        for (const { priority, bonus } of trait.priorityBonuses || []) {
          if (priority && bonus) {
            const key = `${priority[0].toLowerCase()}${priority.substring(1)}Bonus` as keyof ShowEffectsProps;
            (finalEffects as any)[key] = ((finalEffects as any)[key] || 0) + bonus;
          }
        }
      }
      for (const trait of traits) {
        for (const { stat, operation, strValue, condition } of trait.statMods || []) {
          if (stat && strValue && !condition && operation === "SetToAnotherAttribute") {
            (finalEffects as any)[stat] = (finalEffects as any)[strValue] || 0;
          }
        }
      }
      return finalEffects;
    }

    // Start with base attributes
    const effectsBaseAndUnaugmentedTraits = addTraits(
      { ...attributes, maxLoyalty: 25 },
      traitTemplates.filter((t) => !(t.tags || []).includes("Augmented")),
    );

    const effectsWithAugments = addTraits(
      effectsBaseAndUnaugmentedTraits,
      traitTemplates.filter((t) => (t.tags || []).includes("Augmented")),
    );

    // Add org effects to create the full effects value
    const effectsWithOrgsAndAugments = councilorOrgs.reduce<ShowEffectsProps>((acc, org) => {
      return combineEffects(acc, {
        ...org,
        techBonuses: org.template?.techBonuses,
        missionsGrantedNames: org.template?.missionsGrantedNames,
      });
    }, effectsWithAugments);

    return { effectsBaseAndUnaugmentedTraits, effectsWithOrgsAndAugments };
  }

  const councilors = saveFile.gamestates["PavonisInteractive.TerraInvicta.TICouncilorState"].map(
    ({ Value: councilor }) => {
      const orgIds = new Set(councilor.orgs.map((i) => i.value));
      const councilorOrgs = orgs.filter((org) => orgIds.has(org.id));
      const traitTemplates = councilor.traitTemplateNames
        .map((name) => councilorTraitTemplatesByDataName.get(name))
        .filter((t): t is (typeof councilorTraitTemplates)[0] => !!t);
      const councilorType = councilorTypesByDataName.get(councilor.typeTemplateName);
      const playerIntel = playerFaction.intel.get(councilor.ID.value) || 0;
      const playerMaxIntel = playerFaction.highestIntel.get(councilor.ID.value) || 0;
      const lastRecordedLoyalty = playerFaction.lastRecordedLoyalty.get(councilor.ID.value) || 0;

      const { effectsBaseAndUnaugmentedTraits, effectsWithOrgsAndAugments } = computeCouncilorEffects(
        {
          ...councilor.attributes,
          missionsGrantedNames: councilorType?.missionNames,
          xp: councilor.XP,
          traitTemplateNames: councilor.traitTemplateNames,
          typeTemplateName: councilor.typeTemplateName,
          playerIntel,
          playerMaxIntel,
          lastRecordedLoyalty,
        },
        traitTemplates,
        councilorOrgs,
      );

      // councilor.learnedMissionsTemplateNames is always [] - ignoring

      return {
        id: councilor.ID.value,
        displayName: councilor.displayName!,
        factionId: councilor.faction?.value,
        councilorType,
        traitTemplateNames: councilor.traitTemplateNames,
        traitTemplates,
        attributes: councilor.attributes,
        orgs: councilorOrgs,
        homeRegionId: councilor.homeRegion?.value,
        homeNationId: regionsById.get(councilor.homeRegion?.value || -1)?.nationId,
        typeTemplateName: councilor.typeTemplateName,
        xp: councilor.XP,
        effectsBaseAndUnaugmentedTraits,
        effectsWithOrgsAndAugments,
        playerIntel,
      };
    },
  );
  const playerCouncilors = councilors.filter((councilor) => playerFaction?.councilorIds.includes(councilor.id));

  return { orgs, orgsById, playerUnassignedOrgs, playerAvailableOrgs, councilors, playerCouncilors };
}
