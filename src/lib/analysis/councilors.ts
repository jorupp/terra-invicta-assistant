import { combineEffects, ShowEffectsProps } from "@/components/showEffects";
import { MissionDataName, templates } from "../templates";
import { SaveFile } from "../savefile";
import type { OrgEntry } from "./orgs";
import type { RegionEntry } from "./nations";

export interface CouncilorTraitTemplate {
  dataName: string;
  friendlyName: string;
  xpCost?: number;
  xpModifier?: number;
  upgradesFrom?: string;
  boostCost?: number;
  opsCost?: number;
  detectionEspBonus?: number;
  incomeBoost?: number;
  incomeInfluence?: number;
  incomeMoney?: number;
  incomeResearch?: number;
  priorityBonuses?: { priority?: string; bonus?: number }[];
  statMods?: { stat?: string; operation?: string; strValue?: string; condition?: any }[];
  techBonuses?: any;
  missionsGrantedNames?: MissionDataName[];
  tags?: string[];
}

export interface CouncilorOrg {
  template?: { techBonuses?: any; missionsGrantedNames?: MissionDataName[] };
  [key: string]: any;
}

export function computeCouncilorEffects(
  attributes: ShowEffectsProps,
  traitTemplates: CouncilorTraitTemplate[],
  councilorOrgs: CouncilorOrg[],
): { effectsBaseAndUnaugmentedTraits: ShowEffectsProps; effectsWithOrgsAndAugments: ShowEffectsProps } {
  function addTraits(effects: ShowEffectsProps, traits: CouncilorTraitTemplate[]): ShowEffectsProps {
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

type FactionForCouncilors = {
  id: number;
  councilorIds: number[];
  availableCouncilorIds: number[];
  intel: Map<number, number>;
  highestIntel: Map<number, number>;
  lastRecordedLoyalty: Map<number, number>;
};

export async function processCouncilors(
  saveFile: SaveFile,
  orgs: OrgEntry[],
  playerFaction: FactionForCouncilors,
  regionsById: Map<number, RegionEntry>,
) {
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
  const playerCouncilors = councilors.filter((councilor) => playerFaction.councilorIds.includes(councilor.id));

  return { councilors, playerCouncilors };
}

export type CouncilorEntry = Awaited<ReturnType<typeof processCouncilors>>["councilors"][0];
