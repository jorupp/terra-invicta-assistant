import {
  SaveFile,
  FactionGoal_CaptureNation_Clean,
  FactionGoal_CaptureNation_Dirty,
  FactionGoal_NeutralizeNation,
  FactionGoal_AttackWithFleet,
  FactionGoal_DefendWithFleet,
  FactionGoal_WarOnFaction,
  FactionGoal_InvadeEarth,
  FactionGoal_BuildFullStation,
  FactionGoal_BuildFullBase,
} from "../savefile";
import { MissionDataName, templates } from "../templates";
import { combineEffects, ShowEffectsProps } from "@/components/showEffects";
import { diffDateTime, formatDateTime, noDate, sortByDateTime, toDays } from "../utils";
import { localizations } from "../localization";
import { analyzeHabSites } from "./habSites";
import { analyzePlanets } from "./planets";
import { analyzeResearch } from "./research";
import { analyzeFactions } from "./factions";
import { analyzeNations } from "./nations";
import { analyzeHabs } from "./habs";

export async function analyzeData(saveFile: SaveFile, fileName: string, lastModified: Date) {
  const metadata = saveFile.gamestates["PavonisInteractive.TerraInvicta.TIMetadataState"][0].Value;
  const { difficulty } = metadata;
  const time = saveFile.gamestates["PavonisInteractive.TerraInvicta.TITimeState"][0].Value;
  const gameCurrentDateTimeFormatted = formatDateTime(time.currentDateTime);
  const globalTechState = (() => {
    const globalTechState = saveFile.gamestates["PavonisInteractive.TerraInvicta.TIGlobalResearchState"][0].Value;
    return {
      ...globalTechState,
      techProgress: globalTechState.techProgress.map((tp) => ({
        ...tp,
        factionContributions: tp.factionContributions.reduce((acc, curr) => {
          acc.set(curr.Key.value, curr.Value);
          return acc;
        }, new Map<number, number>()),
      })),
    };
  })();

  const playerState = saveFile.gamestates["PavonisInteractive.TerraInvicta.TIPlayerState"].find(
    (i) => !i.Value.isAI,
  )?.Value;
  if (!playerState) {
    throw new Error("Player data not found in save file.");
  }
  const player = {
    id: playerState.ID.value,
    faction: playerState.faction.value,
    templateName: playerState.templateName,
    displayName: playerState.displayName,
  };
  const playerFactionId = player.faction;

  const { projects, techs } = await analyzeResearch(saveFile);

  const driveLocalization = await localizations.drive();
  const powerPlantLocalization = await localizations.powerPlant();

  // Load hab module templates early so we can use them in faction processing
  const habModuleTemplates = (await templates.habModules()).reduce((acc, mod) => {
    acc.set(mod.dataName, mod);
    return acc;
  }, new Map<string, Awaited<ReturnType<typeof templates.habModules>>[0]>());

  // TODO: can I use an expanding state thing?

  const { sol, earth, orbitsById, bodiesById, planets } = analyzePlanets(saveFile);
  const { nations, nationsById, regions, regionsById, controlPoints, controlPointsByNationId, allNationStates } =
    analyzeNations(saveFile, { playerFactionId });
  const { factions, factionsById, playerFaction, shipDesignsByDataName } = await analyzeFactions(saveFile, {
    projects,
    controlPoints,
    habModuleTemplates,
    playerFactionId,
  });
  const { habSites, habSitesById } = analyzeHabSites(saveFile);
  const { habs } = analyzeHabs(saveFile, {
    habSitesById,
    bodiesById,
    orbitsById,
    habModuleTemplates,
    gameCurrentDateTimeFormatted,
    factionsById,
  });

  const shipHulls = (await templates.shipHulls()).map((h) => ({
    dataName: h.dataName,
    friendlyName: h.friendlyName,
    noseHardpoints: h.noseHardpoints,
    hullHardpoints: h.hullHardpoints,
    internalModules: h.internalModules,
    missionControl: h.missionControl,
    constructionTier: h.consTier,
  }));
  const shipHullsByDataName = new Map<string, (typeof shipHulls)[0]>(shipHulls.map((hull) => [hull.dataName, hull]));
  const ships = saveFile.gamestates["PavonisInteractive.TerraInvicta.TISpaceShipState"].map(({ Value: ship }) => ({
    id: ship.ID.value,
    displayName: ship.displayName,
    templateName: ship.templateName,
    missionControlConsumption: ship.missionControlConsumption,
    currentMass_kg: ship.currentMass_kg,
    currentDeltaV_kps: ship.currentDeltaV_kps,
    currentMaxDeltaV_kps: ship.currentMaxDeltaV_kps,
  }));
  const shipsById = new Map<number, (typeof ships)[0]>(ships.map((ship) => [ship.id, ship]));

  const fleets = saveFile.gamestates["PavonisInteractive.TerraInvicta.TISpaceFleetState"].map(({ Value: rawFleet }) => {
    // TODO: can the player see the mission before it arrives?
    const operation = rawFleet.trajectory?.arrivalTime
      ? null
      : sortByDateTime(rawFleet.currentOperations ?? [], (op) => op.startDate)?.[0] || null;
    const fleetShips = rawFleet.ships
      .map(({ value: id }) => shipsById.get(id))
      .filter((s): s is (typeof ships)[0] => !!s)
      .map((ship) => {
        const design = ship.templateName ? shipDesignsByDataName.get(ship.templateName) : null;
        const hull = design?.hullName ? shipHullsByDataName.get(design.hullName) : null;
        // attempt to compensate for alien ships that are all 1 MC
        const estimatedMc =
          ship.missionControlConsumption > 1 || hull?.constructionTier === 1
            ? ship.missionControlConsumption
            : hull?.constructionTier || 1;
        return {
          ship,
          design,
          hull,
          estimatedMc,
        };
      });

    const totalMC = fleetShips.reduce((acc, i) => acc + i.estimatedMc, 0);
    const totalMass = fleetShips.reduce((acc, i) => acc + i.ship.currentMass_kg, 0);
    const maxShipMass = fleetShips.reduce((acc, i) => Math.max(acc, i.ship.currentMass_kg), 0);
    const deltaV = fleetShips.reduce((acc, i) => Math.min(acc, i.ship.currentDeltaV_kps), Infinity);
    const shipsByHullType = fleetShips.reduce((acc, { hull }) => {
      if (hull) {
        acc.set(hull.friendlyName, (acc.get(hull.friendlyName) || 0) + 1);
      }
      return acc;
    }, new Map<string, number>());
    const shipsByRole = fleetShips.reduce((acc, { design }) => {
      if (design) {
        acc.set(design.role, (acc.get(design.role) || 0) + 1);
      }
      return acc;
    }, new Map<string, number>());

    // Get target orbit body name
    const targetOrbitId = rawFleet.trajectory?.destinationOrbit?.value ?? rawFleet.orbitState?.value;
    const targetOrbit = targetOrbitId ? orbitsById.get(targetOrbitId) : null;
    const targetBody = targetOrbit ? bodiesById.get(targetOrbit.barycenterId) : null;
    const targetOrbitName = targetBody?.displayName || "Unknown";

    // For the planet name, use the parent body for moons, but stop at Sol
    let planetBody = targetBody;
    if (targetBody?.barycenterId) {
      const parentBody = bodiesById.get(targetBody.barycenterId);
      // Only use parent if it's not Sol (templateName check)
      if (parentBody && parentBody.templateName !== "Sol") {
        planetBody = parentBody;
      }
    }
    const planetName = planetBody?.displayName || "Unknown";

    return {
      id: rawFleet.ID.value,
      faction: rawFleet.faction.value,
      displayName: rawFleet.displayNameByFaction.find((dn) => dn.Key.value === playerFactionId)?.Value || "UNKNOWN",
      // TODO: shipInfo - can the player always see this?
      originOrbitId: rawFleet.trajectory?.originOrbit?.value,
      targetOrbitId,
      targetOrbitName,
      planetName,
      arrivalTime: rawFleet.trajectory?.arrivalTime,
      arrivalTimeFormatted: rawFleet.trajectory?.arrivalTime?.day
        ? formatDateTime(rawFleet.trajectory!.arrivalTime)
        : null,
      daysToTarget: rawFleet.trajectory?.arrivalTime?.day
        ? toDays(diffDateTime(rawFleet.trajectory.arrivalTime, time.currentDateTime))
        : null,
      operation: operation?.operationDataName,
      operationComplete: operation?.completionDate ? formatDateTime(operation.completionDate) : null,
      operationCompleteDays: operation?.completionDate?.day
        ? toDays(diffDateTime(operation.completionDate, time.currentDateTime))
        : null,
      fleetShips,
      totalMC,
      shipsByHullType: [...shipsByHullType.entries()]
        .map(([hullName, count]) => ({ hullName, count }))
        .toSorted((a, b) => a.count - b.count),
      shipsByRole: [...shipsByRole.entries()]
        .map(([role, count]) => ({ role, count }))
        .toSorted((a, b) => a.count - b.count),
      totalMass,
      maxShipMass,
      deltaV,
    };
  });
  const fleetsById = new Map<number, (typeof fleets)[0]>(fleets.map((fleet) => [fleet.id, fleet]));

  const alienFaction = factions.find((faction) => faction.templateName === "AlienCouncil");
  if (!alienFaction) {
    throw new Error("Alien faction data not found in save file.");
  }

  for (const faction of factions) {
    // Find all nations where this faction has at least one control point
    const controlledNationsWithCPs: Array<{
      nation: (typeof allNationStates)[0];
      factionCPs: number;
      totalCPs: number;
    }> = [];

    for (const nationState of allNationStates) {
      const nationId = nationState.ID.value;
      const controlPoints = controlPointsByNationId.get(nationId) || [];

      // Count how many CPs this faction has in this nation
      const factionCPCount = controlPoints.filter((cp) => cp.factionId === faction.id).length;

      if (factionCPCount > 0) {
        controlledNationsWithCPs.push({
          nation: nationState,
          factionCPs: factionCPCount,
          totalCPs: controlPoints.length,
        });
      }
    }

    // Aggregate histories across all controlled nations
    if (controlledNationsWithCPs.length > 0) {
      // Find the maximum history length
      const maxMCLength = Math.max(
        ...controlledNationsWithCPs.map((n) => (n.nation.historyMissionControl || []).length),
      );
      const maxBoostLength = Math.max(...controlledNationsWithCPs.map((n) => (n.nation.historyBoost || []).length));

      // Sum up histories across all nations, weighted by faction's share of CPs
      faction.nationHistory.historyMissionControl = Array.from({ length: maxMCLength }, (_, index) => {
        return controlledNationsWithCPs.reduce((sum, { nation, factionCPs, totalCPs }) => {
          const history = nation.historyMissionControl || [];
          const value = history[index] || 0;
          // Divide by total CPs and multiply by faction's CPs to get this faction's share
          return sum + (value / totalCPs) * factionCPs;
        }, 0);
      });

      faction.nationHistory.historyBoost = Array.from({ length: maxBoostLength }, (_, index) => {
        return controlledNationsWithCPs.reduce((sum, { nation, factionCPs, totalCPs }) => {
          const history = nation.historyBoost || [];
          const value = history[index] || 0;
          // Divide by total CPs and multiply by faction's CPs to get this faction's share
          return sum + (value / totalCPs) * factionCPs;
        }, 0);
      });

      // Calculate summary statistics
      const historyBoost = faction.nationHistory.historyBoost;
      const historyMC = faction.nationHistory.historyMissionControl;

      faction.nationHistory.currentBoost = historyBoost.length > 0 ? historyBoost[0] : 0;
      faction.nationHistory.currentMC = historyMC.length > 0 ? historyMC[0] : 0;

      faction.nationHistory.boostMonthlyChange =
        historyBoost.length > 0 ? historyBoost[0] - (historyBoost[historyBoost.length - 1] || 0) : 0;
      faction.nationHistory.mcMonthlyChange =
        historyMC.length > 0 ? historyMC[0] - (historyMC[historyMC.length - 1] || 0) : 0;
    }
  }

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

  // Calculate mining bonuses for each faction
  const effectsState = saveFile.gamestates["PavonisInteractive.TerraInvicta.TIEffectsState"][0]?.Value;

  factions.forEach((faction) => {
    if (faction.id !== playerFaction.id) return;
    // Start with base 1% multiplier for each resource
    let waterMultiplier = 1;
    let volatilesMultiplier = 1;
    let metalsMultiplier = 1;
    let noblesMultiplier = 1;
    let fissilesMultiplier = 1;

    // 1. Add councilor mining bonuses (applies to all resources)
    const factionCouncilors = councilors.filter((c) => c.factionId === faction.id);
    let spaceMiningMultiplier =
      factionCouncilors.reduce((sum, c) => sum + (c.effectsWithOrgsAndAugments.miningBonus || 0), 0) + 1;

    // 2. Add faction effects from TIEffectsState
    if (effectsState?.factionEffectsNames) {
      const factionEffects = effectsState.factionEffectsNames.find((kv) => kv.Key.value === faction.id)?.Value;

      if (factionEffects) {
        // SpaceMiningBonus is additive with councilor bonuses and can appear multiple times, so we need to loop through all of them
        const spaceMiningEffects = factionEffects.SpaceMiningBonus || [];
        spaceMiningEffects.forEach((effect) => {
          // Extract percentage from effect name like "Effect_SpaceMiningBonus5" = 5%
          const match = effect.match(/Effect_SpaceMiningBonus(\d+)/);
          if (match) {
            spaceMiningMultiplier += parseInt(match[1], 10) / 100;
          }
        });

        // Resource-specific bonuses (15% each), can appear multiple times, and are multiplicative, not additive
        waterMultiplier *= Math.pow(
          1.15,
          factionEffects.MiningWaterBonus?.filter((e) => e === "Effect_MiningWaterBonus").length || 0,
        );
        volatilesMultiplier *= Math.pow(
          1.15,
          factionEffects.MiningVolatilesBonus?.filter((e) => e === "Effect_MiningVolatilesBonus").length || 0,
        );
        metalsMultiplier *= Math.pow(
          1.15,
          factionEffects.MiningMetalsBonus?.filter((e) => e === "Effect_MiningMetalsBonus").length || 0,
        );
        noblesMultiplier *= Math.pow(
          1.15,
          factionEffects.MiningNoblesBonus?.filter((e) => e === "Effect_MiningNoblesBonus").length || 0,
        );
        fissilesMultiplier *= Math.pow(
          1.15,
          factionEffects.MiningFissilesBonus?.filter((e) => e === "Effect_MiningFissilesBonus").length || 0,
        );
      }
    }

    // now apply the all-resources modifier
    waterMultiplier *= spaceMiningMultiplier;
    volatilesMultiplier *= spaceMiningMultiplier;
    metalsMultiplier *= spaceMiningMultiplier;
    noblesMultiplier *= spaceMiningMultiplier;
    fissilesMultiplier *= spaceMiningMultiplier;

    faction.miningMultipliers = {
      water: waterMultiplier,
      volatiles: volatilesMultiplier,
      metals: metalsMultiplier,
      nobles: noblesMultiplier,
      fissiles: fissilesMultiplier,
    };
  });

  // Expand alien faction goals with details
  type ExpandedGoal = {
    id: number;
    importance: number;
    type: string;
    nation?: { id: number; displayName: string };
    hab?: { id: number; displayName: string; bodyName?: string };
    attackTargetFleet?: { id: number; displayName: string };
    assignedFleet?: { id: number; displayName: string };
    pendingFleets?: { id: number; displayName: string }[];
    enemyFaction?: { id: number; displayName: string };
    attackTarget?: { id: number; displayName: string; type: string };
  };

  const expandedAlienGoals: ExpandedGoal[] = [];

  // Helper functions to safely get typed goal states
  const getCaptureNationClean = (goalId: number): FactionGoal_CaptureNation_Clean | undefined => {
    return (saveFile.gamestates as any)["PavonisInteractive.TerraInvicta.FactionGoal_CaptureNation_Clean"]?.find(
      (g: any) => g.Value?.ID?.value === goalId,
    )?.Value as FactionGoal_CaptureNation_Clean | undefined;
  };
  const getCaptureNationDirty = (goalId: number): FactionGoal_CaptureNation_Dirty | undefined => {
    return (saveFile.gamestates as any)["PavonisInteractive.TerraInvicta.FactionGoal_CaptureNation_Dirty"]?.find(
      (g: any) => g.Value?.ID?.value === goalId,
    )?.Value as FactionGoal_CaptureNation_Dirty | undefined;
  };
  const getNeutralizeNation = (goalId: number): FactionGoal_NeutralizeNation | undefined => {
    return (saveFile.gamestates as any)["PavonisInteractive.TerraInvicta.FactionGoal_NeutralizeNation"]?.find(
      (g: any) => g.Value?.ID?.value === goalId,
    )?.Value as FactionGoal_NeutralizeNation | undefined;
  };
  const getAttackWithFleet = (goalId: number): FactionGoal_AttackWithFleet | undefined => {
    return (saveFile.gamestates as any)["PavonisInteractive.TerraInvicta.FactionGoal_AttackWithFleet"]?.find(
      (g: any) => g.Value?.ID?.value === goalId,
    )?.Value as FactionGoal_AttackWithFleet | undefined;
  };
  const getDefendWithFleet = (goalId: number): FactionGoal_DefendWithFleet | undefined => {
    return (saveFile.gamestates as any)["PavonisInteractive.TerraInvicta.FactionGoal_DefendWithFleet"]?.find(
      (g: any) => g.Value?.ID?.value === goalId,
    )?.Value as FactionGoal_DefendWithFleet | undefined;
  };
  const getWarOnFaction = (goalId: number): FactionGoal_WarOnFaction | undefined => {
    return (saveFile.gamestates as any)["PavonisInteractive.TerraInvicta.FactionGoal_WarOnFaction"]?.find(
      (g: any) => g.Value?.ID?.value === goalId,
    )?.Value as FactionGoal_WarOnFaction | undefined;
  };
  const getInvadeEarth = (goalId: number): FactionGoal_InvadeEarth | undefined => {
    return (saveFile.gamestates as any)["PavonisInteractive.TerraInvicta.FactionGoal_InvadeEarth"]?.find(
      (g: any) => g.Value?.ID?.value === goalId,
    )?.Value as FactionGoal_InvadeEarth | undefined;
  };
  const getBuildFullStation = (goalId: number): FactionGoal_BuildFullStation | undefined => {
    return (saveFile.gamestates as any)["PavonisInteractive.TerraInvicta.FactionGoal_BuildFullStation"]?.find(
      (g: any) => g.Value?.ID?.value === goalId,
    )?.Value as FactionGoal_BuildFullStation | undefined;
  };
  const getBuildFullBase = (goalId: number): FactionGoal_BuildFullBase | undefined => {
    return (saveFile.gamestates as any)["PavonisInteractive.TerraInvicta.FactionGoal_BuildFullBase"]?.find(
      (g: any) => g.Value?.ID?.value === goalId,
    )?.Value as FactionGoal_BuildFullBase | undefined;
  };

  // Process each goal type
  if (alienFaction.factionGoals) {
    // CaptureNationClean
    alienFaction.factionGoals.CaptureNationClean?.forEach((goalRef) => {
      const goal = getCaptureNationClean(goalRef.value);
      if (goal?.nation) {
        const nation = nationsById.get(goal.nation.value);
        if (nation) {
          expandedAlienGoals.push({
            id: goalRef.value,
            importance: goal.importance,
            type: "Capture Nation Clean",
            nation: { id: nation.id, displayName: nation.displayName || "Unknown" },
          });
        }
      }
    });

    // CaptureNationDirty
    alienFaction.factionGoals.CaptureNationDirty?.forEach((goalRef) => {
      const goal = getCaptureNationDirty(goalRef.value);
      if (goal?.nation) {
        const nation = nationsById.get(goal.nation.value);
        if (nation) {
          expandedAlienGoals.push({
            id: goalRef.value,
            importance: goal.importance,
            type: "Capture Nation Dirty",
            nation: { id: nation.id, displayName: nation.displayName || "Unknown" },
          });
        }
      }
    });

    // NeutralizeNation
    alienFaction.factionGoals.NeutralizeNation?.forEach((goalRef) => {
      const goal = getNeutralizeNation(goalRef.value);
      if (goal?.nation) {
        const nation = nationsById.get(goal.nation.value);
        if (nation) {
          expandedAlienGoals.push({
            id: goalRef.value,
            importance: goal.importance,
            type: "Neutralize Nation",
            nation: { id: nation.id, displayName: nation.displayName || "Unknown" },
          });
        }
      }
    });

    // AttackWithFleet
    alienFaction.factionGoals.AttackWithFleet?.forEach((goalRef) => {
      const goal = getAttackWithFleet(goalRef.value);
      if (goal) {
        const expanded: ExpandedGoal = {
          id: goalRef.value,
          importance: goal.importance,
          type: "Attack With Fleet",
        };

        if (goal.attackTarget) {
          // Check if it's a fleet or hab
          const targetFleet = fleets.find((f) => f.id === goal.attackTarget.value);
          if (targetFleet) {
            expanded.attackTargetFleet = {
              id: targetFleet.id,
              displayName: targetFleet.displayName || "Unknown",
            };
          } else {
            const targetHab = habs.find((h) => h.id === goal.attackTarget.value);
            if (targetHab) {
              expanded.attackTarget = {
                id: targetHab.id,
                displayName: targetHab.displayName || "Unknown",
                type: "Hab",
              };
            }
          }
        }

        if (goal.assignedFleet) {
          const assignedFleet = fleets.find((f) => f.id === goal.assignedFleet!.value);
          if (assignedFleet) {
            expanded.assignedFleet = {
              id: assignedFleet.id,
              displayName: assignedFleet.displayName || "Unknown",
            };
          }
        }

        if (goal.pendingFleets && goal.pendingFleets.length > 0) {
          expanded.pendingFleets = goal.pendingFleets
            .map((fleetRef) => {
              const fleet = fleets.find((f) => f.id === fleetRef.value);
              return fleet ? { id: fleet.id, displayName: fleet.displayName || "Unknown" } : null;
            })
            .filter((f): f is { id: number; displayName: string } => f !== null);
        }

        if (goal.enemyFaction) {
          const enemy = factionsById.get(goal.enemyFaction.value);
          if (enemy) {
            expanded.enemyFaction = { id: enemy.id, displayName: enemy.displayName || "Unknown" };
          }
        }

        expandedAlienGoals.push(expanded);
      }
    });

    // DefendWithFleet
    alienFaction.factionGoals.DefendWithFleet?.forEach((goalRef) => {
      const goal = getDefendWithFleet(goalRef.value);
      if (goal) {
        const expanded: ExpandedGoal = {
          id: goalRef.value,
          importance: goal.importance,
          type: "Defend With Fleet",
        };

        if (goal.hab) {
          const hab = habs.find((h) => h.id === goal.hab.value);
          if (hab) {
            expanded.hab = { id: hab.id, displayName: hab.displayName || "Unknown" };
          }
        }

        if (goal.assignedFleet) {
          const assignedFleet = fleets.find((f) => f.id === goal.assignedFleet!.value);
          if (assignedFleet) {
            expanded.assignedFleet = {
              id: assignedFleet.id,
              displayName: assignedFleet.displayName || "Unknown",
            };
          }
        }

        if (goal.pendingFleets && goal.pendingFleets.length > 0) {
          expanded.pendingFleets = goal.pendingFleets
            .map((fleetRef) => {
              const fleet = fleets.find((f) => f.id === fleetRef.value);
              return fleet ? { id: fleet.id, displayName: fleet.displayName || "Unknown" } : null;
            })
            .filter((f): f is { id: number; displayName: string } => f !== null);
        }

        expandedAlienGoals.push(expanded);
      }
    });

    // WarOnFaction
    alienFaction.factionGoals.WarOnFaction?.forEach((goalRef) => {
      const goal = getWarOnFaction(goalRef.value);
      if (goal) {
        const expanded: ExpandedGoal = {
          id: goalRef.value,
          importance: goal.importance,
          type: "War On Faction",
        };

        if (goal.targetFaction) {
          const enemy = factionsById.get(goal.targetFaction.value);
          if (enemy) {
            expanded.enemyFaction = { id: enemy.id, displayName: enemy.displayName || "Unknown" };
          }
        }

        expandedAlienGoals.push(expanded);
      }
    });

    // InvadeEarth
    alienFaction.factionGoals.InvadeEarth?.forEach((goalRef) => {
      const goal = getInvadeEarth(goalRef.value);
      if (goal) {
        const expanded: ExpandedGoal = {
          id: goalRef.value,
          importance: goal.importance,
          type: "Invade Earth",
        };

        if (goal.assignedFleet) {
          const assignedFleet = fleets.find((f) => f.id === goal.assignedFleet!.value);
          if (assignedFleet) {
            expanded.assignedFleet = {
              id: assignedFleet.id,
              displayName: assignedFleet.displayName || "Unknown",
            };
          }
        }

        if (goal.pendingFleets && goal.pendingFleets.length > 0) {
          expanded.pendingFleets = goal.pendingFleets
            .map((fleetRef) => {
              const fleet = fleets.find((f) => f.id === fleetRef.value);
              return fleet ? { id: fleet.id, displayName: fleet.displayName || "Unknown" } : null;
            })
            .filter((f): f is { id: number; displayName: string } => f !== null);
        }

        expandedAlienGoals.push(expanded);
      }
    });

    // BuildFullStation
    alienFaction.factionGoals.BuildFullStation?.forEach((goalRef) => {
      const goal = getBuildFullStation(goalRef.value);
      if (goal?.hab) {
        const hab = habs.find((h) => h.id === goal.hab.value);
        if (hab) {
          let bodyName: string | undefined;
          if (hab.site) {
            // Surface base/station - use site's parentBodyId
            bodyName = bodiesById.get(hab.site.parentBodyId)?.displayName ?? undefined;
          } else if (hab.orbitStateId) {
            // Orbital station - use orbit's barycenter
            const orbit = orbitsById.get(hab.orbitStateId);
            if (orbit) {
              bodyName = bodiesById.get(orbit.barycenterId)?.displayName ?? undefined;
            }
          }
          expandedAlienGoals.push({
            id: goalRef.value,
            importance: goal.importance,
            type: "Build Full Station",
            hab: { id: hab.id, displayName: hab.displayName || "Unknown", bodyName },
          });
        }
      }
    });

    // BuildFullBase
    alienFaction.factionGoals.BuildFullBase?.forEach((goalRef) => {
      const goal = getBuildFullBase(goalRef.value);
      if (goal?.hab) {
        const hab = habs.find((h) => h.id === goal.hab.value);
        if (hab) {
          let bodyName: string | undefined;
          if (hab.site) {
            // Surface base - use site's parentBodyId
            bodyName = bodiesById.get(hab.site.parentBodyId)?.displayName ?? undefined;
          } else if (hab.orbitStateId) {
            // Orbital base - use orbit's barycenter
            const orbit = orbitsById.get(hab.orbitStateId);
            if (orbit) {
              bodyName = bodiesById.get(orbit.barycenterId)?.displayName ?? undefined;
            }
          }
          expandedAlienGoals.push({
            id: goalRef.value,
            importance: goal.importance,
            type: "Build Full Base",
            hab: { id: hab.id, displayName: hab.displayName || "Unknown", bodyName },
          });
        }
      }
    });
  }

  // Sort by importance descending
  expandedAlienGoals.sort((a, b) => b.importance - a.importance);

  const playerHabs = habs.filter((hab) => hab.faction === playerFaction.id);
  const playerFleets = fleets.filter((fleet) => fleet.faction === playerFaction.id);

  // Create a map from hab ID to original hab data for looking up inEarthLEO
  const originalHabsById = new Map(
    saveFile.gamestates["PavonisInteractive.TerraInvicta.TIHabState"].map(({ Value: hab }) => [hab.ID.value, hab]),
  );

  // Create building summary: aggregate modules by template across all player habs
  const buildingSummary = new Map<
    string,
    {
      templateName: string;
      friendlyName: string;
      currentCount: number;
      futureCount: number;
      currentEffects: ShowEffectsProps;
      futureEffects: ShowEffectsProps;
    }
  >();

  for (const hab of playerHabs) {
    const originalHab = originalHabsById.get(hab.id);
    if (!originalHab) continue;

    for (const { active, template } of hab.moduleTemplates) {
      const templateName = template.dataName;
      if (!templateName) continue;

      const existing = buildingSummary.get(templateName) || {
        templateName,
        friendlyName: template.friendlyName || templateName,
        currentCount: 0,
        futureCount: 0,
        currentEffects: {},
        futureEffects: {},
      };

      // Count all modules (current + future under construction)
      existing.futureCount++;

      // Count only active modules as current
      if (active) {
        existing.currentCount++;
      }

      // Calculate effects for this module
      const {
        techBonuses,
        incomeInfluence_month,
        incomeMoney_month,
        incomeOps_month,
        incomeProjects,
        incomeResearch_month,
        supportMaterials_month,
        missionControl,
      } = template;

      const moduleEffects: ShowEffectsProps = {
        techBonuses,
        incomeBoost_month: -(supportMaterials_month?.boost || 0),
        incomeMissionControl: missionControl,
        incomeInfluence_month,
        incomeMoney_month: (incomeMoney_month || 0) - (supportMaterials_month?.money || 0),
        incomeOps_month,
        projectCapacityGranted: incomeProjects,
        incomeResearch_month,
        volatiles: -(supportMaterials_month?.volatiles || 0),
        metals: -(supportMaterials_month?.metals || 0),
        nobles: -(supportMaterials_month?.nobleMetals || 0),
      };

      if (originalHab.inEarthLEO) {
        if (template.controlPointCapacity) {
          moduleEffects.controlPoints = template.controlPointCapacity;
        }
        if (template.incomeProjects) {
          moduleEffects.projectCapacityGranted = template.incomeProjects;
        }
        if (template.specialRules?.includes("LEOBonusEconomy"))
          moduleEffects.economyBonus = (moduleEffects.economyBonus || 0) + template.specialRulesValue!;
        if (template.specialRules?.includes("LEOBonusEnvironment"))
          moduleEffects.environmentBonus = (moduleEffects.environmentBonus || 0) + template.specialRulesValue!;
        if (template.specialRules?.includes("LEOBonusGovernment"))
          moduleEffects.governmentBonus = (moduleEffects.governmentBonus || 0) + template.specialRulesValue!;
        if (template.specialRules?.includes("LEOBonusKnowledge"))
          moduleEffects.knowledgeBonus = (moduleEffects.knowledgeBonus || 0) + template.specialRulesValue!;
        if (template.specialRules?.includes("LEOBonusLaunchFacilities"))
          moduleEffects.spaceflightBonus = (moduleEffects.spaceflightBonus || 0) + template.specialRulesValue!;
        if (template.specialRules?.includes("LEOBonusMissionControl"))
          moduleEffects.MCBonus = (moduleEffects.MCBonus || 0) + template.specialRulesValue!;
        if (template.specialRules?.includes("LEOBonusOppression"))
          moduleEffects.oppressionBonus = (moduleEffects.oppressionBonus || 0) + template.specialRulesValue!;
        if (template.specialRules?.includes("LEOBonusWelfare"))
          moduleEffects.welfareBonus = (moduleEffects.welfareBonus || 0) + template.specialRulesValue!;
        if (template.specialRules?.includes("LEOBonusArmyCombatValue"))
          moduleEffects.miltechBonus = (moduleEffects.miltechBonus || 0) + template.specialRulesValue!;
      }

      // Add to future effects always
      existing.futureEffects = combineEffects(existing.futureEffects, moduleEffects);

      // Add to current effects only if active
      if (active) {
        existing.currentEffects = combineEffects(existing.currentEffects, moduleEffects);
      }

      buildingSummary.set(templateName, existing);
    }
  }

  const buildingSummaryArray = Array.from(buildingSummary.values()).sort((a, b) =>
    a.friendlyName.localeCompare(b.friendlyName),
  );

  // planets the player cares about: habs, fleet-origin, fleet-destination, fleet-orbiting
  const playerOrbitIds = new Set<number | null | undefined>();
  for (const hab of playerHabs) {
    playerOrbitIds.add(hab.orbitStateId);
  }
  for (const fleet of playerFleets) {
    playerOrbitIds.add(fleet.targetOrbitId);
    playerOrbitIds.add(fleet.originOrbitId);
  }
  const playerBarycenters = new Set<number | null | undefined>(
    saveFile.gamestates["PavonisInteractive.TerraInvicta.TIOrbitState"]
      .filter((orbit) => playerOrbitIds.has(orbit.Key.value))
      .map((i) => i.Value.barycenter.value),
  );
  for (const hab of playerHabs) {
    playerBarycenters.add(habSitesById.get(hab.habSiteId || 0)?.parentBodyId);
  }
  const playerPlanetIds = new Set<number>(
    planets
      .filter((planet) => playerBarycenters.has(planet.Key.value))
      .map((planet) => planet.Value)
      .map((p) => ((p.barycenter?.value ?? sol) === sol ? p.ID.value : p.barycenter!.value)),
  );
  const playerPlanets = planets
    .filter((planet) => playerPlanetIds.has(planet.Key.value))
    .map((p) => p.Value)
    .map((p) => ({
      id: p.ID.value,
      templateName: p.templateName,
      displayName: p.displayName,
      playerTag: p.playerTag,
    }));

  const playerInterestedBodyIds = new Set<number>(
    [...playerPlanetIds]
      .concat(planets.filter((i) => playerPlanetIds.has(i.Value.barycenter?.value ?? 0)).map((i) => i.Key.value))
      .concat([earth]),
  );
  const playerInterestedOrbitIds = new Set<number>(
    saveFile.gamestates["PavonisInteractive.TerraInvicta.TIOrbitState"]
      .filter((orbit) => playerInterestedBodyIds.has(orbit.Value.barycenter.value))
      .map((i) => i.Key.value),
  );
  const playerInterestedPlanets = planets
    .filter((planet) => playerInterestedBodyIds.has(planet.Key.value))
    .map((p) => p.Value);

  const alienFleetsToPlayerOrbits = sortByDateTime(
    fleets
      .filter((fleet) => fleet.faction === alienFaction.id)
      .filter((fleet) => fleet.targetOrbitId && playerInterestedOrbitIds.has(fleet.targetOrbitId)),
    (i) => i.arrivalTime,
  );

  const playerNationIds = new Set<number>(
    controlPoints
      .filter((cp) => cp.factionId === playerFaction.id && cp.nationId)
      .map((cp) => cp.nationId!)
      .concat(playerCouncilors.map((c) => c.homeNationId).filter((id): id is number => !!id)),
  );

  const playerAvailableCouncilors = councilors.filter((councilor) =>
    playerFaction?.availableCouncilorIds.includes(councilor.id),
  );
  const playerMissionCounts = playerCouncilors.reduce((acc, councilor) => {
    const missionNames = councilor.effectsWithOrgsAndAugments.missionsGrantedNames || [];
    for (const missionName of missionNames) {
      acc.set(missionName, (acc.get(missionName) || 0) + 1);
    }
    return acc;
  }, new Map<MissionDataName, number>());
  const factionAdminById = new Map<number, number>(
    factions.map((faction) => {
      // sum of all councilors' admin effects
      const factionCouncilors = councilors.filter((c) => c.factionId === faction.id);
      const totalAdmin = factionCouncilors.reduce((acc, c) => {
        return (
          acc +
          Math.max(
            0,
            (c.effectsWithOrgsAndAugments.administration || 0) + (c.effectsWithOrgsAndAugments.Administration || 0),
          )
        );
      }, 0);
      return [faction.id, totalAdmin / Math.max(1, factionCouncilors.length)];
    }),
  );
  const playerVisibleCouncilors = councilors.filter((i) => i.factionId !== playerFaction.id && i.playerIntel >= 0.25); // TODO: figure out exact intel threshold
  const playerVisibleFactionIds = new Set<number>(
    playerVisibleCouncilors.map((c) => c.factionId).filter((id): id is number => !!id),
  );
  const playerStealableOrgs = playerVisibleCouncilors
    .filter((c) => c.playerIntel >= 0.5) // TODO: figure out exact intel threshold for stealing
    .map((c) => [
      ...c.orgs.map((o) => {
        const faction = factionsById.get(c.factionId || -1);
        return {
          ...o,
          councilorId: c.id as number | undefined,
          councilor: c.displayName as string | undefined,
          admin: Math.max(
            0,
            (c.effectsWithOrgsAndAugments.administration || 0) + (c.effectsWithOrgsAndAugments.Administration || 0),
          ) as number | undefined,
          faction: faction && {
            id: faction.id,
            displayName: faction.displayName,
            templateName: faction.templateName,
          },
        };
      }),
    ])
    .flat()
    .concat(
      factions
        .filter((i) => i.id !== playerFaction.id)
        .filter((faction) => playerVisibleFactionIds.has(faction.id))
        .flatMap((faction) => {
          const factionOrgs = orgs.filter((org) => faction.unassignedOrgIds.includes(org.id));
          return factionOrgs.map((o) => {
            return {
              ...o,
              councilorId: undefined,
              councilor: undefined,
              admin: faction && factionAdminById.get(faction.id),
              faction: faction && {
                id: faction.id,
                displayName: faction.displayName,
                templateName: faction.templateName,
              },
            };
          });
        }),
    )
    .filter((o) => o.template?.allowedOnMarket);

  const playerStealableProjects = factions
    .filter((i) => i.id !== alienFaction.id)
    .filter((i) => playerVisibleFactionIds.has(i.id))
    .flatMap((faction) => {
      return faction.finishedProjectNames.map((projectName) => ({ projectName, factionId: faction.id }));
    })
    .filter(
      (i) =>
        !playerFaction.availableProjectNames.includes(i.projectName) &&
        !playerFaction.finishedProjectNames.includes(i.projectName),
    )
    .filter((i) => {
      const project = projects.get(i.projectName);
      if (!project) return true;
      if (project.oneTimeGlobally) return false;
      if (project.requiredMilestone && !playerFaction.milestones.includes(project.requiredMilestone)) return false;
      const prereqs = project.prereqs || [];
      if (!prereqs.every((i) => !i.startsWith("Project_") || playerFaction.finishedProjectNames.includes(i)))
        return false;
      const factionPrereq = project.factionPrereq || [];
      if (factionPrereq.length === 0) return true;
      return factionPrereq.includes(playerFaction.templateName!);
    });

  const allDrives = await templates.drives();
  const drivesByBaseName = new Map<string, (typeof allDrives)[0] & { baseName: string }>();
  for (const drive of allDrives) {
    // Skip disabled drives
    if (drive.disabled) {
      continue;
    }

    // Skip alien drives
    if (drive.requiredProjectName.startsWith("Project_Alien")) {
      continue;
    }

    // Try multiple patterns to remove thruster count suffix
    // Patterns: "_x1", " x1", "x1" at end of dataName or friendlyName
    const baseName = drive.dataName
      .replace(/_x\d+$/, "") // Pattern: Name_x1
      .replace(/\sx\d+$/, "") // Pattern: Name x1
      .replace(/x\d+$/, ""); // Pattern: Namex1

    const existing = drivesByBaseName.get(baseName);
    if (!existing || drive.thrusters > existing.thrusters) {
      drivesByBaseName.set(baseName, { ...drive, baseName });
    }
  }

  function calculateRemainingResearch(targetName: string): {
    techResearchRemaining: number;
    projectResearchRemaining: number;
    requiredTechs: string[];
    requiredProjects: string[];
  } {
    const complete = new Set([...globalTechState.finishedTechsNames, ...playerFaction!.finishedProjectNames]);
    const required = new Set<string>();

    if (!complete.has(targetName)) {
      required.add(targetName);
    }

    while (true) {
      let done = true;
      for (const req of Array.from(required)) {
        const prereqs = techs.get(req)?.prereqs || projects.get(req)?.prereqs;
        if (!prereqs) continue;
        for (const prereq of prereqs) {
          if (!complete.has(prereq) && !required.has(prereq)) {
            required.add(prereq);
            done = false;
          }
        }
      }
      if (done) break;
    }

    const accumulatedResearchByName = new Map<string, number>([
      ...globalTechState.techProgress.map((i) => [i.techTemplateName, i.accumulatedResearch] as const),
      ...playerFaction!.currentProjectProgress.map((i) => [i.projectTemplateName, i.accumulatedResearch] as const),
    ]);

    let techResearchRemaining = 0;
    let projectResearchRemaining = 0;
    const requiredTechs: string[] = [];
    const requiredProjects: string[] = [];

    for (const name of required) {
      const tech = techs.get(name);
      const project = projects.get(name);
      const both = tech || project;
      if (!both) continue;

      const accumulatedResearch = accumulatedResearchByName.get(name) || 0;
      const remainingCost = Math.max(both.researchCost - accumulatedResearch, 0);

      if (tech) {
        techResearchRemaining += remainingCost;
        requiredTechs.push(name);
      } else {
        projectResearchRemaining += remainingCost;
        requiredProjects.push(name);
      }
    }

    return { techResearchRemaining, projectResearchRemaining, requiredTechs, requiredProjects };
  }

  // Load radiators and calculate cooling efficiency (GW per ton)
  const allRadiators = await templates.radiators();
  const availableRadiators = allRadiators.filter((radiator) => {
    if (!radiator.requiredProjectName) return true;
    return playerFaction!.finishedProjectNames.includes(radiator.requiredProjectName);
  });

  // note: this was completely made up by claude-sonnet-4.5 - I told it to guess since I didn't know the formula and I know TI likes to model real-world physics.
  // Calculate GW per ton for each radiator
  // Power dissipated (W) = specificPower_2s_KWkg * 1000 (to convert kW to W) * mass (kg)
  // So for 1 ton (1000 kg): power = specificPower_2s_KWkg * 1000 * 1000 = specificPower_2s_KWkg * 1,000,000 W
  // Convert to GW: GW per ton = specificPower_2s_KWkg * 1,000,000 / 1,000,000,000 = specificPower_2s_KWkg / 1000
  const radiatorsWithEfficiency = availableRadiators.map((radiator) => ({
    ...radiator,
    gwPerTon: radiator.specificPower_2s_KWkg / 1000,
  }));

  // Find the best radiator (highest GW per ton)
  const bestRadiator =
    radiatorsWithEfficiency.length > 0
      ? radiatorsWithEfficiency.reduce((best, current) => {
          return current.gwPerTon > best.gwPerTon ? current : best;
        })
      : undefined;

  // Load power plants and filter to those unlocked by the player
  const allPowerPlants = await templates.powerPlants();
  const availablePowerPlants = allPowerPlants.filter((powerPlant) => {
    if (!powerPlant.requiredProjectName) return true;
    return playerFaction!.finishedProjectNames.includes(powerPlant.requiredProjectName);
  });

  const drives = Array.from(drivesByBaseName.values()).map((drive) => {
    const { techResearchRemaining, projectResearchRemaining, requiredTechs, requiredProjects } =
      calculateRemainingResearch(drive.requiredProjectName);

    const thrustRating = Math.log(drive.thrust_N) / Math.log(4); // log4
    const exhaustRating = Math.log2(drive.EV_kps);
    const overallRating = thrustRating * exhaustRating;

    const project = projects.get(drive.requiredProjectName);
    const unlockChance = project?.factionAvailableChance ?? 100;
    const isProjectComplete = playerFaction!.finishedProjectNames.includes(drive.requiredProjectName);

    // Multiply propellant materials by 10 for per-tank values
    const propellantMaterials = {
      water: drive.perTankPropellantMaterials.water * 10,
      volatiles: drive.perTankPropellantMaterials.volatiles * 10,
      metals: drive.perTankPropellantMaterials.metals * 10,
      nobleMetals: drive.perTankPropellantMaterials.nobleMetals * 10,
      fissiles: drive.perTankPropellantMaterials.fissiles * 10,
      antimatter: drive.perTankPropellantMaterials.antimatter * 10,
    };

    // Calculate how many tanks the player can afford with current resources
    const resourceAmounts = [
      {
        name: "Water",
        tanks: propellantMaterials.water > 0 ? playerFaction!.resources.Water / propellantMaterials.water : Infinity,
      },
      {
        name: "Volatiles",
        tanks:
          propellantMaterials.volatiles > 0
            ? playerFaction!.resources.Volatiles / propellantMaterials.volatiles
            : Infinity,
      },
      {
        name: "Metals",
        tanks: propellantMaterials.metals > 0 ? playerFaction!.resources.Metals / propellantMaterials.metals : Infinity,
      },
      {
        name: "NobleMetals",
        tanks:
          propellantMaterials.nobleMetals > 0
            ? playerFaction!.resources.NobleMetals / propellantMaterials.nobleMetals
            : Infinity,
      },
      {
        name: "Fissiles",
        tanks:
          propellantMaterials.fissiles > 0
            ? playerFaction!.resources.Fissiles / propellantMaterials.fissiles
            : Infinity,
      },
      {
        name: "Antimatter",
        tanks:
          propellantMaterials.antimatter > 0
            ? playerFaction!.resources.Antimatter / propellantMaterials.antimatter
            : Infinity,
      },
    ];

    const limitingResource = resourceAmounts.reduce((min, curr) => (curr.tanks < min.tanks ? curr : min));
    const tanksAffordable = Math.floor(limitingResource.tanks);
    const limitingResourceName = limitingResource.tanks !== Infinity ? limitingResource.name : undefined;

    // Clean up friendly name by removing thruster count suffix
    const displayName = drive.friendlyName
      .replace(/\sx\d+$/, "") // Remove " x6" etc
      .replace(/_x\d+$/, ""); // Remove "_x6" etc

    const driveClassificationDisplayName =
      driveLocalization.get(`TIDriveTemplate.Class.${drive.driveClassification}`) || drive.driveClassification;
    const powerPlantDisplayName = drive.requiredPowerPlant
      ? powerPlantLocalization.get(`TIPowerPlantTemplate.PowerPlantRequirement.${drive.requiredPowerPlant}`) ||
        drive.requiredPowerPlant
      : "";

    // Step 1: Calculate total reactor power required
    // Note: Values like "3,840.096" need comma stripping before parsing
    const thrustRating_GW = parseFloat(drive.thrustRating_GW.replace(/,/g, ""));
    const reqPower_GW = parseFloat(drive["req power"].replace(/,/g, ""));
    // req power already accounts for drive efficiency, so use it directly
    const powerRequiredGW = reqPower_GW;

    // Step 2 & 3: Find eligible reactors and select the appropriate one
    let reactorDebugInfo: string | undefined = undefined;

    let eligibleReactors = availablePowerPlants.filter((reactor) => {
      const powerPlantMatches =
        reactor.powerPlantClass === drive.requiredPowerPlant || drive.requiredPowerPlant === "Any_General";
      const powerSufficient = reactor.maxOutput_GW >= powerRequiredGW;
      return powerPlantMatches && powerSufficient;
    });

    // If no unlocked reactors found, fall back to all reactors (for future drives)
    let useFallback = false;
    if (eligibleReactors.length === 0) {
      useFallback = true;
      eligibleReactors = allPowerPlants.filter((reactor) => {
        const powerPlantMatches =
          reactor.powerPlantClass === drive.requiredPowerPlant || drive.requiredPowerPlant === "Any_General";
        const powerSufficient = reactor.maxOutput_GW >= powerRequiredGW;
        return powerPlantMatches && powerSufficient;
      });
    }

    // Generate debug info if no reactor found
    if (eligibleReactors.length === 0) {
      const matchingTypeReactors = allPowerPlants.filter(
        (reactor) => reactor.powerPlantClass === drive.requiredPowerPlant || drive.requiredPowerPlant === "Any_General",
      );

      if (matchingTypeReactors.length === 0) {
        reactorDebugInfo = `No reactors of required type: ${drive.requiredPowerPlant}`;
      } else {
        const maxAvailablePower = Math.max(...matchingTypeReactors.map((r) => r.maxOutput_GW));
        reactorDebugInfo = `No reactors with sufficient power.\nRequired: ${powerRequiredGW.toFixed(1)} GW\nHighest available (${matchingTypeReactors.find((r) => r.maxOutput_GW === maxAvailablePower)?.friendlyName}): ${maxAvailablePower.toFixed(1)} GW`;
      }
    }

    const bestReactor =
      eligibleReactors.length > 0
        ? eligibleReactors.reduce((best, current) => {
            // For unlocked reactors, use highest efficiency (best case)
            // For future drives, use lowest efficiency (worst case)
            return useFallback
              ? current.efficiency < best.efficiency
                ? current
                : best
              : current.efficiency > best.efficiency
                ? current
                : best;
          })
        : undefined;

    // Calculate reactor and radiator weight
    let reactorTons: number | undefined = undefined;
    let radiatorTons: number | undefined = undefined;
    let reactorAndRadiatorTons: number | undefined = undefined;
    let reactorName: string | undefined = undefined;
    let reactorGW: number | undefined = undefined;
    let reactorGWperTon: number | undefined = undefined;
    let wasteHeatGW: number | undefined = undefined;
    let radiatorName: string | undefined = undefined;
    let radiatorGWperTon: number | undefined = undefined;

    if (bestReactor) {
      reactorName = bestReactor.friendlyName;
      reactorGW = powerRequiredGW;
      reactorGWperTon = bestReactor.specificPower_tGW;

      // Reactor weight = power required / specific power (tons per GW)
      reactorTons = powerRequiredGW / bestReactor.specificPower_tGW;

      // For Calc/Closed cooling drives, add radiator weight
      if ((drive.cooling === "Calc" || drive.cooling === "Closed") && bestRadiator) {
        radiatorName = bestRadiator.friendlyName;
        radiatorGWperTon = bestRadiator.gwPerTon;

        // Step 4: Calculate waste heat using reactor efficiency
        wasteHeatGW = powerRequiredGW * (1 - bestReactor.efficiency);
        radiatorTons = wasteHeatGW / bestRadiator.gwPerTon;
      }

      reactorAndRadiatorTons = reactorTons + (radiatorTons || 0);
    }

    // Calculate resources required (1 resource = 10 tons)
    const reactorResources = reactorTons !== undefined ? reactorTons / 10 : undefined;
    const radiatorResources = radiatorTons !== undefined ? radiatorTons / 10 : undefined;
    const totalResources = reactorAndRadiatorTons !== undefined ? reactorAndRadiatorTons / 10 : undefined;

    // Calculate material breakdown for reactor
    const reactorMaterials =
      bestReactor && reactorResources !== undefined
        ? {
            water: bestReactor.weightedBuildMaterials.water * reactorResources,
            volatiles: bestReactor.weightedBuildMaterials.volatiles * reactorResources,
            metals: bestReactor.weightedBuildMaterials.metals * reactorResources,
            nobleMetals: bestReactor.weightedBuildMaterials.nobleMetals * reactorResources,
          }
        : undefined;

    // Calculate material breakdown for radiator
    const radiatorMaterials =
      bestRadiator && radiatorResources !== undefined
        ? {
            volatiles: bestRadiator.weightedBuildMaterials.volatiles * radiatorResources,
            metals: bestRadiator.weightedBuildMaterials.metals * radiatorResources,
            nobleMetals: bestRadiator.weightedBuildMaterials.nobleMetals * radiatorResources,
            exotics: bestRadiator.weightedBuildMaterials.exotics * radiatorResources,
          }
        : undefined;

    // Calculate hypothetical ship performance
    // Ship: 10,000 tons dry + reactor/radiator + 5,000 tons fuel (50 tanks)
    const dryMass = 10000 + (reactorAndRadiatorTons || 0); // tons
    const fuelMass = 5000; // 50 tanks @ 100 tons each
    const wetMass = dryMass + fuelMass;

    // Delta-V calculation using Tsiolkovsky rocket equation
    const exhaustVelocity = drive.EV_kps * 1000; // Convert km/s to m/s
    const shipDeltaV = exhaustVelocity * Math.log(wetMass / dryMass); // m/s

    // Trip calculation: 5 AU with constant thrust
    const tripDistance = 5 * 149597870700; // 5 AU in meters
    const midpointDistance = tripDistance / 2;

    // Calculate initial acceleration (at full fuel)
    const thrust = drive.thrust_N;
    const initialMass = wetMass * 1000; // Convert tons to kg
    const initialAcceleration = thrust / initialMass; // m/s²
    const accelerationMilliGs = (initialAcceleration / 9.81) * 1000; // Convert to milli-gs

    // Use average mass for trip time calculation
    const avgMass = ((wetMass + dryMass) / 2) * 1000; // Convert tons to kg
    const avgAcceleration = thrust / avgMass; // m/s²

    // For symmetric brachistochrone trajectory (accel to midpoint, then decel)
    // Time to midpoint: t = sqrt(2 * d / a)
    // Velocity at midpoint: v = sqrt(2 * a * d)
    const timeToMidpoint = Math.sqrt((2 * midpointDistance) / avgAcceleration); // seconds
    const velocityAtMidpoint = avgAcceleration * timeToMidpoint; // m/s
    const deltaVNeeded = 2 * velocityAtMidpoint; // m/s (accel + decel)

    // Determine if thrust-limited or deltaV-limited
    let tripTime: number;
    let remainingDeltaV: number;
    let tripType: "thrust-limited" | "deltaV-limited";

    if (deltaVNeeded <= shipDeltaV) {
      // Thrust-limited: have enough fuel, time limited by acceleration
      tripTime = timeToMidpoint * 2; // seconds
      remainingDeltaV = shipDeltaV - deltaVNeeded;
      tripType = "thrust-limited";
    } else {
      // DeltaV-limited: run out of fuel before reaching full speed
      tripType = "deltaV-limited";
      remainingDeltaV = 0;

      // Max velocity we can reach with available deltaV
      const maxVelocity = shipDeltaV / 2; // m/s (half for accel, half for decel)

      // Distance covered during acceleration: d = v²/(2a)
      const accelDistance = (maxVelocity * maxVelocity) / (2 * avgAcceleration);
      const coastDistance = tripDistance - 2 * accelDistance;

      // Time for acceleration phase
      const accelTime = maxVelocity / avgAcceleration;

      if (coastDistance > 0) {
        // Coast phase exists
        const coastTime = coastDistance / maxVelocity;
        tripTime = 2 * accelTime + coastTime;
      } else {
        // No coast phase, pure accel/decel
        tripTime = 2 * accelTime;
      }
    }

    return {
      dataName: drive.dataName,
      friendlyName: displayName,
      thrust_N: drive.thrust_N,
      EV_kps: drive.EV_kps,
      efficiency: drive.efficiency,
      propellant: drive.propellant,
      propellantMaterials,
      requiredProjectName: drive.requiredProjectName,
      requiredPowerPlant: drive.requiredPowerPlant,
      requiredPowerPlantDisplayName: powerPlantDisplayName,
      driveClassification: drive.driveClassification,
      driveClassificationDisplayName,
      thrusters: drive.thrusters,
      cooling: drive.cooling,
      powerRequiredGW,
      thrustRating_GW,
      reqPower_GW,
      reactorEfficiency: bestReactor?.efficiency,
      thrustRating,
      exhaustRating,
      overallRating,
      unlockChance: unlockChance === 100 || isProjectComplete ? undefined : unlockChance,
      tanksAffordable,
      limitingResourceName,
      reactorTons,
      radiatorTons,
      reactorAndRadiatorTons,
      reactorResources,
      radiatorResources,
      totalResources,
      reactorMaterials,
      radiatorMaterials,
      reactorName,
      reactorDebugInfo,
      reactorGW,
      reactorGWperTon,
      wasteHeatGW,
      radiatorName,
      radiatorGWperTon,
      techResearchRemaining,
      projectResearchRemaining,
      requiredTechs,
      requiredProjects,
      shipDeltaV,
      accelerationMilliGs,
      tripTime,
      tripType,
      remainingDeltaV,
    };
  });

  return {
    fileName,
    lastModified,
    gameCurrentDateTime: time.currentDateTime,
    gameCurrentDateTimeFormatted,
    player,
    playerFaction,
    alienFaction,
    expandedAlienGoals,
    playerHabs,
    buildingSummary: buildingSummaryArray,
    playerFleets,
    playerPlanets,
    alienFleetsToPlayerOrbits,
    playerUnassignedOrgs,
    playerAvailableOrgs,
    playerStealableOrgs,
    playerNationIds: [...playerNationIds],
    playerCouncilors,
    playerMissionCounts,
    playerAvailableCouncilors,
    nations,
    factionsById,
    playerInterestedPlanets,
    playerVisibleCouncilors,
    globalTechState,
    techs,
    projects,
    playerStealableProjects,
    drives,
    bestRadiator: bestRadiator
      ? {
          friendlyName: bestRadiator.friendlyName,
          gwPerTon: bestRadiator.gwPerTon,
        }
      : undefined,
  };
}

export type Analysis = Awaited<ReturnType<typeof analyzeData>>;
