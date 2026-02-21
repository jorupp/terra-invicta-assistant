import { SaveFile } from "../savefile";
import { templates } from "../templates";
import { formatDateTime } from "../utils";
import { analyzeHabSites } from "./habSites";
import { analyzePlanets } from "./planets";
import { analyzeResearch } from "./research";
import { analyzeFactions, postProcessFactions } from "./factions";
import { analyzeNations } from "./nations";
import { analyzeHabs } from "./habs";
import { analyzeFleets } from "./fleets";
import { analyzeOrgs } from "./orgs";
import { analyzeAlienGoals } from "./alien-goals";
import { analyzeDrives } from "./drives";
import { analyzePlayerInterests } from "./player-interest";

export async function analyzeData(saveFile: SaveFile, fileName: string, lastModified: Date) {
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
  const { nations, nationsById, regionsById, controlPoints, controlPointsByNationId, allNationStates } = analyzeNations(
    saveFile,
    { playerFactionId },
  );
  const { factions, factionsById, playerFaction, alienFaction } = await analyzeFactions(saveFile, {
    projects,
    controlPoints,
    habModuleTemplates,
    playerFactionId,
    allNationStates,
    controlPointsByNationId,
  });
  const { orgs, playerUnassignedOrgs, playerAvailableOrgs, councilors, playerCouncilors } = await analyzeOrgs(
    saveFile,
    { regionsById, nationsById, playerFaction },
  );
  postProcessFactions(saveFile, { factions, playerFaction, councilors });
  const { habSitesById } = analyzeHabSites(saveFile);
  const { habs } = analyzeHabs(saveFile, {
    habSitesById,
    bodiesById,
    orbitsById,
    habModuleTemplates,
    gameCurrentDateTimeFormatted,
    factionsById,
  });
  const { fleets } = await analyzeFleets(saveFile, { factions, playerFactionId, orbitsById, bodiesById });
  const { expandedAlienGoals } = analyzeAlienGoals(saveFile, {
    factionsById,
    alienFaction,
    nationsById,
    habs,
    bodiesById,
    orbitsById,
    fleets,
  });
  const { drives, bestRadiator, allRadiatorsWithMeta } = await analyzeDrives(saveFile, { playerFaction, techs, projects, globalTechState });

  const {
    playerStealableOrgs,
    playerStealableProjects,
    playerMissionCounts,
    playerAvailableCouncilors,
    playerVisibleCouncilors,
    buildingSummary,
    playerPlanets,
    alienFleetsToPlayerOrbits,
    playerHabs,
    playerFleets,
    playerNationIds,
    playerInterestedPlanets,
  } = analyzePlayerInterests(saveFile, {
    habs,
    fleets,
    playerFaction,
    alienFaction,
    habSitesById,
    planets,
    factions,
    projects,
    councilors,
    earth,
    sol,
    orgs,
    factionsById,
    controlPoints,
    playerCouncilors,
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
    buildingSummary,
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
    bestRadiator: bestRadiator
      ? {
          friendlyName: bestRadiator.friendlyName,
          gwPerTon: bestRadiator.gwPerTon,
        }
      : undefined,
    radiators: allRadiatorsWithMeta,
  };
}

export type Analysis = Awaited<ReturnType<typeof analyzeData>>;
