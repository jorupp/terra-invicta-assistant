import { SaveFile } from "../savefile";
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
import { analyzeFleets } from "./fleets";
import { analyzeOrgs } from "./orgs";
import { analyzeAlienGoals } from "./alien-goals";
import { analyzeDrives } from "./drives";

export async function analyzeData(saveFile: SaveFile, fileName: string, lastModified: Date) {
  const metadata = saveFile.gamestates["PavonisInteractive.TerraInvicta.TIMetadataState"][0].Value;
  const { difficulty } = metadata;
  const time = saveFile.gamestates["PavonisInteractive.TerraInvicta.TITimeState"][0].Value;
  const gameCurrentDateTimeFormatted = formatDateTime(time.currentDateTime);

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

  const { projects, techs, globalTechState } = await analyzeResearch(saveFile);

  // Load hab module templates early so we can use them in faction processing
  const habModuleTemplates = (await templates.habModules()).reduce((acc, mod) => {
    acc.set(mod.dataName, mod);
    return acc;
  }, new Map<string, Awaited<ReturnType<typeof templates.habModules>>[0]>());

  // TODO: can I use an expanding state thing?

  const { sol, earth, orbitsById, bodiesById, planets } = analyzePlanets(saveFile);
  const { nations, nationsById, regions, regionsById, controlPoints, controlPointsByNationId, allNationStates } =
    analyzeNations(saveFile, { playerFactionId });
  const { factions, factionsById, playerFaction, alienFaction } = await analyzeFactions(saveFile, {
    projects,
    controlPoints,
    habModuleTemplates,
    playerFactionId,
    allNationStates,
    controlPointsByNationId,
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
  const { fleets, fleetsById } = await analyzeFleets(saveFile, { factions, playerFactionId, orbitsById, bodiesById });
  const { orgs, orgsById, playerUnassignedOrgs, playerAvailableOrgs, councilors, playerCouncilors } = await analyzeOrgs(
    saveFile,
    { regionsById, nationsById, playerFaction },
  );
  const { expandedAlienGoals } = analyzeAlienGoals(saveFile, {
    factionsById,
    alienFaction,
    nationsById,
    habs,
    bodiesById,
    orbitsById,
    fleets,
  });
  const { drives, bestRadiator } = await analyzeDrives(saveFile, { playerFaction, techs, projects, globalTechState });

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
