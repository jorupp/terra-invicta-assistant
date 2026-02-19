import {
  SaveFile,
} from "../savefile";
import { templates } from "../templates";
import { formatDateTime } from "../utils";
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
import { processPlayerView } from "./player-view";

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

  const spaceBodies = processSpaceBodies(saveFile);
  const { orbitsById, bodiesById } = spaceBodies;

  const { fleets } = await processFleets(
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

  const { regionsById, nations, nationsById } = processNations(
    saveFile,
    controlPoints,
    playerFaction.id,
    factions,
  );

  const { orgs, playerUnassignedOrgs, playerAvailableOrgs } = await processOrgs(
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

  const {
    playerHabs,
    playerFleets,
    playerPlanets,
    playerInterestedPlanets,
    alienFleetsToPlayerOrbits,
    playerNationIds,
    playerAvailableCouncilors,
    playerMissionCounts,
    playerVisibleCouncilors,
    playerStealableOrgs,
    playerStealableProjects,
  } = processPlayerView(
    saveFile,
    playerFaction,
    alienFaction,
    habs,
    fleets,
    spaceBodies,
    habSitesById,
    controlPoints,
    councilors,
    playerCouncilors,
    factions,
    factionsById,
    orgs,
    projects,
  );

  const buildingSummaryArray = createBuildingSummary(playerHabs, saveFile);

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
    playerNationIds,
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
