import {
  SaveFile,
} from "../savefile";
import { MissionDataName, templates } from "../templates";
import { diffDateTime, formatDateTime, sortByDateTime, toDays } from "../utils";
import { localizations } from "../localization";
import { processCouncilors } from "./councilors";
import { expandAlienGoals } from "./factions";
import { analyzeDrives } from "./drives";
import { processSpaceBodies } from "./space";
import { processFleets } from "./fleets";
import { processNations } from "./nations";
import { processOrgs } from "./orgs";
import { processHabInfrastructure, calculateMiningBonuses, processHabs, createBuildingSummary } from "./habs";
import { processFactions } from "./faction-state";

export async function analyzeData(saveFile: SaveFile, fileName: string, lastModified: Date) {
  const mcMaskingTechs = new Set(
    (await templates.projects())
      .filter((i) => i.effects?.some((e) => e === "Effect_MCUsageMasking"))
      .map((i) => i.dataName),
  );
  const metadata = saveFile.gamestates["PavonisInteractive.TerraInvicta.TIMetadataState"][0].Value;
  const { difficulty } = metadata;
  const time = saveFile.gamestates["PavonisInteractive.TerraInvicta.TITimeState"][0].Value;
  const lastMonth = {
    ...time.currentDateTime,
    month: time.currentDateTime.month === 1 ? 12 : time.currentDateTime.month - 1,
    year: time.currentDateTime.month === 1 ? time.currentDateTime.year - 1 : time.currentDateTime.year,
  };
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

  const projectLocalization = await localizations.project();
  async function getProjectLocalization(name: string) {
    return {
      displayName: projectLocalization.get(`TIProjectTemplate.displayName.${name}`),
      summary: projectLocalization.get(`TIProjectTemplate.summary.${name}`),
      description: projectLocalization.get(`TIProjectTemplate.description.${name}`),
    };
  }
  const projects = await (
    await templates.projects()
  ).reduce(async (acc, project) => {
    const map = await acc;
    map.set(project.dataName, { ...project, ...(await getProjectLocalization(project.dataName)) });
    return map;
  }, Promise.resolve(new Map<string, Awaited<ReturnType<typeof templates.projects>>[0] & { displayName?: string; summary?: string; description?: string }>()));
  const techLocalization = await localizations.tech();
  async function getTechLocalization(name: string) {
    return {
      displayName: techLocalization.get(`TITechTemplate.displayName.${name}`),
      summary: techLocalization.get(`TITechTemplate.summary.${name}`),
      description: techLocalization.get(`TITechTemplate.description.${name}`),
      quote: techLocalization.get(`TITechTemplate.quote.${name}`),
    };
  }
  const techs = await (
    await templates.techs()
  ).reduce(async (acc, tech) => {
    const map = await acc;
    map.set(tech.dataName, { ...tech, ...(await getTechLocalization(tech.dataName)) });
    return map;
  }, Promise.resolve(new Map<string, Awaited<ReturnType<typeof templates.techs>>[0] & { displayName?: string; summary?: string; description?: string; quote?: string }>()));

  const driveLocalization = await localizations.drive();
  const powerPlantLocalization = await localizations.powerPlant();

  // Load hab module templates early so we can use them in faction processing
  const habModuleTemplates = (await templates.habModules()).reduce((acc, mod) => {
    acc.set(mod.dataName, mod);
    return acc;
  }, new Map<string, Awaited<ReturnType<typeof templates.habModules>>[0]>());

  // Phase 1: Create upgrade map (old module -> new module)
  const moduleUpgradeMap = new Map<string, string>();
  for (const module of habModuleTemplates.values()) {
    if (module.upgradesFromName) {
      moduleUpgradeMap.set(module.upgradesFromName, module.dataName);
    }
  }

  // Load control points early so we can use them in faction processing
  const controlPoints = saveFile.gamestates["PavonisInteractive.TerraInvicta.TIControlPoint"].map(({ Value: cp }) => ({
    id: cp.ID.value,
    factionId: cp.faction?.value,
    nationId: cp.nation?.value,
    displayName: cp.displayName,
    benefitsDisabled: cp.benefitsDisabled,
    crackdownExpiration: cp.crackdownExpiration,
    defended: cp.defended,
    controlPointPriorities: cp.controlPointPriorities,
  }));

  const { factions, factionsById, shipDesignsByDataName } = processFactions(
    saveFile,
    difficulty,
    mcMaskingTechs,
    projects,
    controlPoints,
    habModuleTemplates,
    lastMonth,
  );

  const playerFaction = factions.find((faction) => faction.id === player.faction);
  if (!playerFaction) {
    throw new Error("Player faction data not found in save file.");
  }

  const { planets, sol, earth, orbitsById, bodiesById } = processSpaceBodies(saveFile);

  const { shipHulls, ships, shipsById, fleets, fleetsById } = await processFleets(
    saveFile,
    shipDesignsByDataName,
    orbitsById,
    bodiesById,
    playerFaction.id,
    time.currentDateTime,
  );
  const { habSectorsByHabId, habSitesById } = processHabInfrastructure(saveFile);

  const alienFaction = factions.find((faction) => faction.templateName === "AlienCouncil");
  if (!alienFaction) {
    throw new Error("Alien faction data not found in save file.");
  }

  const { regions, regionsById, regionsByNationId, controlPointsByNationId, nations, nationsById } = processNations(
    saveFile,
    controlPoints,
    playerFaction.id,
    factions,
  );

  const { orgTemplates, orgs, orgsById, playerUnassignedOrgs, playerAvailableOrgs } = await processOrgs(
    saveFile,
    regionsById,
    nationsById,
    playerFaction,
  );

  const { councilors, playerCouncilors } = await processCouncilors(saveFile, orgs, playerFaction, regionsById);

  // Calculate mining bonuses for each faction
  calculateMiningBonuses(saveFile, factions, councilors, playerFaction.id);

  const habs = processHabs(
    saveFile,
    habSitesById,
    habSectorsByHabId,
    bodiesById,
    orbitsById,
    factionsById,
    habModuleTemplates,
    moduleUpgradeMap,
    gameCurrentDateTimeFormatted,
  );

  const expandedAlienGoals = expandAlienGoals(
    saveFile,
    alienFaction.factionGoals,
    nationsById,
    habs,
    fleets,
    factionsById,
    bodiesById,
    orbitsById,
  );

  const playerHabs = habs.filter((hab) => hab.faction === playerFaction.id);
  const playerFleets = fleets.filter((fleet) => fleet.faction === playerFaction.id);

  const buildingSummaryArray = createBuildingSummary(playerHabs, saveFile);

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

  const { drives, bestRadiator } = await analyzeDrives(
    playerFaction!,
    globalTechState,
    techs,
    projects,
    driveLocalization,
    powerPlantLocalization,
  );

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
    bestRadiator,
  };
}

export type Analysis = Awaited<ReturnType<typeof analyzeData>>;
