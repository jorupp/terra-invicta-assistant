import { combineEffects, ShowEffectsProps } from "@/components/showEffects";
import { SaveFile } from "../savefile";
import { analyzeFactions } from "./factions";
import { analyzeFleets } from "./fleets";
import { analyzeHabs } from "./habs";
import { analyzeHabSites } from "./habSites";
import { analyzePlanets } from "./planets";
import { analyzeResearch } from "./research";
import { analyzeOrgs } from "./orgs";
import { MissionDataName } from "../template-types-generated";
import { sortByDateTime } from "../utils";
import { analyzeNations } from "./nations";

export interface AnalyzePlayerInterestsArgs {
  habs: ReturnType<typeof analyzeHabs>["habs"];
  fleets: Awaited<ReturnType<typeof analyzeFleets>>["fleets"];
  playerFaction: Awaited<ReturnType<typeof analyzeFactions>>["playerFaction"];
  alienFaction: Awaited<ReturnType<typeof analyzeFactions>>["alienFaction"];
  habSitesById: ReturnType<typeof analyzeHabSites>["habSitesById"];
  planets: ReturnType<typeof analyzePlanets>["planets"];
  factions: Awaited<ReturnType<typeof analyzeFactions>>["factions"];
  projects: Awaited<ReturnType<typeof analyzeResearch>>["projects"];
  councilors: Awaited<ReturnType<typeof analyzeOrgs>>["councilors"];
  earth: ReturnType<typeof analyzePlanets>["earth"];
  sol: ReturnType<typeof analyzePlanets>["sol"];
  orgs: Awaited<ReturnType<typeof analyzeOrgs>>["orgs"];
  factionsById: Awaited<ReturnType<typeof analyzeFactions>>["factionsById"];
  controlPoints: ReturnType<typeof analyzeNations>["controlPoints"];
  playerCouncilors: Awaited<ReturnType<typeof analyzeOrgs>>["playerCouncilors"];
}

export function analyzePlayerInterests(
  saveFile: SaveFile,
  {
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
  }: AnalyzePlayerInterestsArgs,
) {
  const playerHabs = habs.filter((hab) => hab.faction === playerFaction.id);
  const playerFleets = fleets.filter((fleet) => fleet.faction === playerFaction.id);

  // Build hab planet lookup from already-analyzed habs
  const habPlanetByHabId = new Map(habs.map((hab) => [hab.id, hab.planetName]));

  // Build module → hab lookup: module ID → sector ID → hab ID
  const sectorByModuleId = new Map(
    saveFile.gamestates["PavonisInteractive.TerraInvicta.TISectorState"].flatMap(({ Value: sector }) =>
      sector.habModules.map((mod) => [mod.value, sector.hab.value]),
    ),
  );

  // Ships under construction: read from raw faction shipyard queues
  const playerFactionState = saveFile.gamestates["PavonisInteractive.TerraInvicta.TIFactionState"].find(
    ({ Value }) => Value.ID.value === playerFaction.id,
  )?.Value;
  const shipDesignsByDataName = new Map(playerFaction.shipDesigns.map((d) => [d.dataName, d]));
  const playerShipsUnderConstruction = (playerFactionState?.nShipyardQueues ?? []).flatMap(
    ({ Key: shipyardModuleId, Value: queue }) => {
      const habId = sectorByModuleId.get(shipyardModuleId.value);
      const planetName = (habId !== undefined ? habPlanetByHabId.get(habId) : undefined) ?? "Unknown";
      return queue.map((item, index) => {
        const design = shipDesignsByDataName.get(item.shipDesignTemplateName);
        const status = !item.costPaid
          ? ("waiting" as const)
          : index === 0
            ? ("building" as const)
            : ("queued" as const);
        return {
          designName: design?.displayName || item.shipDesignTemplateName,
          hullName: design?.hullName ?? "Unknown",
          noseArmor: design?.noseArmor?.armorValue ?? 0,
          daysToCompletion: item.daysToCompletion,
          planetName,
          status,
        };
      });
    },
  );

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
        if (template.specialRules?.includes("LEOBonusAlienDetection"))
          moduleEffects.alienDetection = (moduleEffects.alienDetection || 0) + template.tier!;
        if (template.specialRules?.includes("LEOBonusHumanDetection"))
          moduleEffects.humanDetection = (moduleEffects.humanDetection || 0) + template.tier!;
        if (template.specialRules?.includes("LEOBonusPropagandaStrength"))
          moduleEffects.publicCampaignStrength = (moduleEffects.publicCampaignStrength || 0) + template.tier!;
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
    playerStealableOrgs,
    playerStealableProjects,
    playerMissionCounts,
    playerAvailableCouncilors,
    playerVisibleCouncilors,
    buildingSummary: buildingSummaryArray,
    playerPlanets,
    alienFleetsToPlayerOrbits,
    playerHabs,
    playerFleets,
    playerShipsUnderConstruction,
    playerNationIds: [...playerNationIds],
    playerInterestedPlanets,
  };
}
