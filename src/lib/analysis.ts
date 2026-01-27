import { SaveFile } from "./savefile";
import { MissionDataName, templates } from "./templates";
import { combineEffects, ShowEffectsProps } from "@/components/showEffects";
import { diffDateTime, formatDateTime, noDate, sortByDateTime, toDays } from "./utils";
import { localizations } from "./localization";

export async function analyzeData(saveFile: SaveFile, fileName: string, lastModified: Date) {
  const mcMaskingTechs = new Set(
    (await templates.projects())
      .filter((i) => i.effects?.some((e) => e === "Effect_MCUsageMasking"))
      .map((i) => i.dataName)
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
    (i) => !i.Value.isAI
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
  const factions = saveFile.gamestates["PavonisInteractive.TerraInvicta.TIFactionState"].map(({ Value: faction }) => {
    const mcMultiplier =
      (difficulty === "Cinematic"
        ? 0.05
        : difficulty === "Normal"
        ? 0.3
        : difficulty === "Veteran"
        ? 0.6
        : difficulty === "Brutal"
        ? 1
        : 9999) * Math.pow(0.8, faction.finishedProjectNames.filter((name) => mcMaskingTechs.has(name)).length);
    const mcDailyTransactions = sortByDateTime(
      faction.Transactions["Daily Income"]?.filter((i) => i.Resource === "MissionControl"),
      (i) => i.Date
    );
    const mcCurrentLimit =
      mcDailyTransactions.length > 0 ? mcDailyTransactions[mcDailyTransactions.length - 1].Amount : 0;
    const availableProjects = faction.availableProjectNames
      .map((name) => projects.get(name))
      .filter((i): i is NonNullable<typeof i> => !!i);
    const availableBoostProjects = availableProjects
      .filter((i) => i.effects?.some((ii) => ii.startsWith("Effect_LaunchFacilitiesPriorityBonus")) && !i.repeatable)
      .map(({ friendlyName, techCategory, researchCost }) => ({ friendlyName, techCategory, researchCost }));
    const availableCPProjects = availableProjects
      .filter((i) => i.effects?.some((ii) => ii.startsWith("Effect_ControlPointMaintenanceBonus")) && !i.repeatable)
      .map(({ friendlyName, techCategory, researchCost }) => ({ friendlyName, techCategory, researchCost }));
    const availableMaxOrgProjects = availableProjects
      .filter((i) => i.effects?.some((ii) => ii.startsWith("Effect_IncreaseMaxAvailableOrgs")) && !i.repeatable)
      .map(({ friendlyName, techCategory, researchCost }) => ({ friendlyName, techCategory, researchCost }));

    return {
      id: faction.ID.value,
      templateName: faction.templateName,
      displayName: faction.displayName,
      techNameContributionHistory: faction.techNameContributionHistory,
      unlockedVictoryObjective: faction.unlockedVictoryObjective,
      finishedProjectNames: faction.finishedProjectNames,
      currentProjectProgress: faction.currentProjectProgress,
      atrocities: faction.atrocities,
      milestones: faction.milestones,
      missionControlUsage: faction.missionControlUsage,
      passiveTechSlot: faction.PassiveTechSlot,
      councilorIds: faction.councilors.map((i) => i.value),
      turnedCouncilorIds: faction.turnedCouncilors.map((i) => i.value),
      unassignedOrgIds: faction.unassignedOrgs.map((i) => i.value),
      availableOrgIds: faction.availableOrgs.map((i) => i.value),
      availableCouncilorIds: faction.availableCouncilors.map((i) => i.value),
      shipDesigns: faction.shipDesigns.map((i) => ({
        hullName: i.hullName,
        noseArmor: i.noseArmor,
        lateralArmor: i.lateralArmor,
        tailArmor: i.tailArmor,
        dataName: i.dataName,
        friendlyName: i.friendlyName,
        displayName: i._displayName,
        role: i.role,
      })),
      intel: new Map((faction.intel || []).map((i) => [i.Key.value, i.Value])),
      highestIntel: new Map((faction.highestIntel || []).map((i) => [i.Key.value, i.Value])),
      lastRecordedLoyalty: new Map(
        Array.isArray(faction.lastRecordedLoyalty) ? faction.lastRecordedLoyalty.map((i) => [i.Key.value, i.Value]) : []
      ),
      monthlyTransactionSummary: [
        ...Object.entries(faction.Transactions)
          .flatMap(([source, transactions]) =>
            transactions.map((t) => ({
              source,
              resource: t.Resource,
              amount: t.Amount,
              date: t.Date,
            }))
          )
          .filter((t) => toDays(diffDateTime(lastMonth, t.date)) < 0)
          .reduce((acc, t) => {
            const key = `${t.source}||${t.resource}`;
            const resourceMap = acc.get(key) || { source: t.source, resource: t.resource, amount: 0 };
            resourceMap.amount += t.amount;
            acc.set(key, resourceMap);
            return acc;
          }, new Map<string, { source: string; resource: string; amount: number }>())
          .values(),
      ],
      permaAbandonedNationIds: faction.permaAbandonedNations.map((i) => i.value),
      mcUsage: faction.missionControlUsage,
      mcCurrentLimit,
      mcHateFloor: Math.floor(faction.missionControlUsage * mcMultiplier),
      mcAlienWarLimit: 50 / mcMultiplier,
      availableBoostProjects,
      availableCPProjects,
      availableMaxOrgProjects,
      availableProjectNames: faction.availableProjectNames,
      missedProjects: faction.missedProjects || [],
    };
  });
  const factionsById = new Map<number, (typeof factions)[0]>(factions.map((faction) => [faction.id, faction]));
  const shipDesignsByDataName = new Map<string, (typeof factions)[0]["shipDesigns"][0]>(
    factions.flatMap((faction) => faction.shipDesigns).map((design) => [design.dataName, design])
  );

  const playerFaction = factions.find((faction) => faction.id === player.faction);
  if (!playerFaction) {
    throw new Error("Player faction data not found in save file.");
  }

  const planets = saveFile.gamestates["PavonisInteractive.TerraInvicta.TISpaceBodyState"];
  const sol = planets.find((i) => i.Value.templateName === "Sol")?.Key.value;
  const earth = planets.find((i) => i.Value.templateName === "Earth")?.Key.value;
  if (!sol) {
    throw new Error("Sol planet data not found in save file.");
  }
  if (!earth) {
    throw new Error("Earth planet data not found in save file.");
  }
  const orbitsById = new Map(
    saveFile.gamestates["PavonisInteractive.TerraInvicta.TIOrbitState"].map(({ Value: orbit }) => [
      orbit.ID.value,
      {
        id: orbit.ID.value,
        displayName: orbit.displayName,
        templateName: orbit.templateName,
        barycenterId: orbit.barycenter.value,
      },
    ])
  );
  const bodiesById = new Map(
    planets.map(({ Value: body }) => [
      body.ID.value,
      {
        id: body.ID.value,
        displayName: body.displayName,
        templateName: body.templateName,
      },
    ])
  );

  const shipHulls = (await templates.shipHulls()).map((h) => ({
    dataName: h.dataName,
    friendlyName: h.friendlyName,
    noseHardpoints: h.noseHardpoints,
    hullHardpoints: h.hullHardpoints,
    internalModules: h.internalModules,
    missionControl: h.missionControl,
  }));
  const shipHullsByDataName = new Map<string, (typeof shipHulls)[0]>(shipHulls.map((hull) => [hull.dataName, hull]));
  const ships = saveFile.gamestates["PavonisInteractive.TerraInvicta.TISpaceShipState"].map(({ Value: ship }) => ({
    id: ship.ID.value,
    displayName: ship.displayName,
    templateName: ship.templateName,
    missionControlConsumption: ship.missionControlConsumption,
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
        return {
          ship,
          design,
          hull,
        };
      });

    const totalMC = fleetShips.reduce((acc, i) => acc + i.ship.missionControlConsumption, 0);
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

    return {
      id: rawFleet.ID.value,
      faction: rawFleet.faction.value,
      displayName: rawFleet.displayNameByFaction.find((dn) => dn.Key.value === playerFaction.id)?.Value || "UNKNOWN",
      // TODO: shipInfo - can the player always see this?
      originOrbitId: rawFleet.trajectory?.originOrbit?.value,
      targetOrbitId,
      targetOrbitName,
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
    };
  });
  const fleetsById = new Map<number, (typeof fleets)[0]>(fleets.map((fleet) => [fleet.id, fleet]));
  const habModuleTemplates = (await templates.habModules()).reduce((acc, mod) => {
    acc.set(mod.dataName, mod);
    return acc;
  }, new Map<string, Awaited<ReturnType<typeof templates.habModules>>[0]>());
  const habModules = saveFile.gamestates["PavonisInteractive.TerraInvicta.TIHabModuleState"].map(({ Value: mod }) => ({
    id: mod.ID.value,
    sectorId: mod.sector?.value,
    templateName: mod.templateName,
    displayName: mod.displayName,
    destroyed: mod.destroyed,
    startBuildDate: mod.startBuildDate,
    completionDate: mod.completionDate,
    decomissionDate: mod.decommissionDate,
    powered: mod.powered,
    slot: mod.slot,
    buildCost: mod.buildCost,
  }));
  const habModulesBySectorId = habModules.reduce((acc, mod) => {
    if (!mod.sectorId) return acc;
    if (!acc.has(mod.sectorId)) {
      acc.set(mod.sectorId, []);
    }
    acc.get(mod.sectorId)!.push(mod);
    return acc;
  }, new Map<number, typeof habModules>());
  const habSectors = saveFile.gamestates["PavonisInteractive.TerraInvicta.TISectorState"].map(({ Value: sector }) => ({
    id: sector.ID.value,
    faction: sector.faction?.value,
    habId: sector.hab?.value,
    sectorNum: sector.sectorNum,
    slots: sector.slots,
    exists: sector.exists,
    displayName: sector.displayName,
    habModuleIds: sector.habModules.map((i) => i.value),
    habModules: habModulesBySectorId.get(sector.ID.value) || [],
  }));
  const habSectorsByHabId = habSectors.reduce((acc, sector) => {
    if (!sector.habId) return acc;
    if (!acc.has(sector.habId)) {
      acc.set(sector.habId, []);
    }
    acc.get(sector.habId)!.push(sector);
    return acc;
  }, new Map<number, typeof habSectors>());

  function isImportant(module: (typeof habModules)[0]) {
    return (
      module.templateName?.includes("Mining") ||
      module.templateName?.includes("Mine") ||
      module.templateName?.includes("Dock") ||
      module.templateName?.includes("Depot") ||
      module.templateName?.includes(" Core")
    );
  }
  const habSites = saveFile.gamestates["PavonisInteractive.TerraInvicta.TIHabSiteState"].map(
    ({
      Key: { value: id },
      Value: {
        parentBody: { value: parentBodyId },
        water_day,
        volatiles_day,
        metals_day,
        nobles_day,
        fissiles_day,
      },
    }) => ({ id, parentBodyId, water_day, volatiles_day, metals_day, nobles_day, fissiles_day })
  );
  const habSitesById = new Map<number, (typeof habSites)[0]>(habSites.map((site) => [site.id, site]));
  const habs = saveFile.gamestates["PavonisInteractive.TerraInvicta.TIHabState"]
    .map(({ Value: hab }) => {
      const tier = hab.tier;
      const site = habSitesById.get(hab.habSite?.value || 0);
      // there's probably some data to indicate which sectors are populated for a given tier + habType (shrug)
      const validSectors = new Set(
        tier === 1 ? [0] : tier === 2 ? (hab.habType === "Station" ? [0, 2, 4] : [0, 1, 2]) : [0, 1, 2, 3, 4]
      );
      const sectors = (habSectorsByHabId.get(hab.ID.value) || []).filter(
        (s) => s.exists && validSectors.has(s.sectorNum)
      );
      const modules = sectors
        .flatMap((s) => s.habModules)
        .map((m) => ({ ...m, template: habModuleTemplates.get(m.templateName!) }));
      const empty = modules.filter((m) => m.destroyed || m.startBuildDate === noDate);
      const underConstruction = modules.filter((m) => m.completionDate >= gameCurrentDateTimeFormatted && !m.destroyed);
      const highlightedCompletions = underConstruction
        .toSorted((a, b) => {
          if (isImportant(a) && !isImportant(b)) return -1;
          if (!isImportant(a) && isImportant(b)) return 1;
          return a.completionDate.localeCompare(b.completionDate);
        })
        .map((completion) => ({
          ...completion,
          daysToCompletion:
            (new Date(completion.completionDate).getTime() - new Date(gameCurrentDateTimeFormatted).getTime()) /
            (1000 * 60 * 60 * 24),
        }))
        .filter((i, ix) => ix === 0 || isImportant(i));
      const nonEmpty = modules.filter((m) => !m.destroyed && m.startBuildDate !== noDate);
      const mine = nonEmpty.filter((m) => m.template?.miningModifier);
      const isBase = hab.habType === "Base";
      const missingMine = isBase && mine.length === 0;
      const moduleTemplates = modules
        .filter((i) => !i.destroyed)
        .map((i) => ({
          active: i.powered && (i.completionDate === noDate || i.completionDate <= gameCurrentDateTimeFormatted),
          template: habModuleTemplates.get(i.templateName!)!,
        }))
        .filter((i) => i.template);
      const moduleBonuses = moduleTemplates.map(({ active, template: t }) => {
        const {
          techBonuses,
          incomeInfluence_month,
          incomeMoney_month,
          incomeOps_month,
          incomeProjects,
          incomeResearch_month,
          supportMaterials_month,
          missionControl,
        } = t;

        const effects: ShowEffectsProps = {
          techBonuses,
          incomeBoost_month: -(supportMaterials_month?.boost || 0),
          incomeMissionControl: missionControl,
          incomeInfluence_month,
          incomeMoney_month,
          incomeOps_month,
          projectCapacityGranted: incomeProjects,
          incomeResearch_month,
        };
        if (hab.inEarthLEO) {
          if (t.controlPointCapacity) {
            effects.controlPoints = t.controlPointCapacity;
          }
          if (t.incomeProjects) {
            effects.projectCapacityGranted = t.incomeProjects;
          }
          if (t.specialRules?.includes("LEOBonusEconomy"))
            effects.economyBonus = (effects.economyBonus || 0) + t.specialRulesValue!;
          if (t.specialRules?.includes("LEOBonusEnvironment"))
            effects.environmentBonus = (effects.environmentBonus || 0) + t.specialRulesValue!;
          if (t.specialRules?.includes("LEOBonusGovernment"))
            effects.governmentBonus = (effects.governmentBonus || 0) + t.specialRulesValue!;
          if (t.specialRules?.includes("LEOBonusKnowledge"))
            effects.knowledgeBonus = (effects.knowledgeBonus || 0) + t.specialRulesValue!;
          if (t.specialRules?.includes("LEOBonusLaunchFacilities"))
            effects.spaceDevBonus = (effects.spaceDevBonus || 0) + t.specialRulesValue!;
          if (t.specialRules?.includes("LEOBonusMissionControl"))
            effects.MCBonus = (effects.MCBonus || 0) + t.specialRulesValue!;
          if (t.specialRules?.includes("LEOBonusOppression"))
            effects.oppressionBonus = (effects.oppressionBonus || 0) + t.specialRulesValue!;
          if (t.specialRules?.includes("LEOBonusWelfare"))
            effects.welfareBonus = (effects.welfareBonus || 0) + t.specialRulesValue!;
        }
        return { active, effects };
      });
      const activeEffects = moduleBonuses
        .filter((i) => i.active)
        .reduce<ShowEffectsProps>((acc, curr) => combineEffects(acc, curr.effects), {});
      const potentialEffects = moduleBonuses.reduce<ShowEffectsProps>(
        (acc, curr) => combineEffects(acc, curr.effects),
        {}
      );

      return {
        id: hab.ID.value,
        faction: hab.faction.value,
        displayName: hab.displayName,
        habSiteId: hab.habSite?.value,
        orbitStateId: hab.orbitState?.value,
        habType: hab.habType,
        tier: hab.tier,
        sectorIds: sectors.map((i) => i.id),
        sectors: sectors,
        emptyModuleCount: empty.length,
        underConstructionModuleCount: underConstruction.length,
        highlightedCompletions,
        missingMine,
        finderSortOverride: hab.finderSortOverride,
        activeEffects,
        potentialEffects,
        site,
        mine: mine[0],
      };
    })
    .toSorted((a, b) =>
      a.finderSortOverride === b.finderSortOverride ? 0 : a.finderSortOverride < b.finderSortOverride ? -1 : 1
    );

  const playerHabs = habs.filter((hab) => hab.faction === playerFaction.id);
  const playerFleets = fleets.filter((fleet) => fleet.faction === playerFaction.id);

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
      .map((i) => i.Value.barycenter.value)
  );
  for (const hab of playerHabs) {
    playerBarycenters.add(habSitesById.get(hab.habSiteId || 0)?.parentBodyId);
  }
  const playerPlanetIds = new Set<number>(
    planets
      .filter((planet) => playerBarycenters.has(planet.Key.value))
      .map((planet) => planet.Value)
      .map((p) => ((p.barycenter?.value ?? sol) === sol ? p.ID.value : p.barycenter!.value))
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
      .concat([earth])
  );
  const playerInterestedOrbitIds = new Set<number>(
    saveFile.gamestates["PavonisInteractive.TerraInvicta.TIOrbitState"]
      .filter((orbit) => playerInterestedBodyIds.has(orbit.Value.barycenter.value))
      .map((i) => i.Key.value)
  );
  const playerInterestedPlanets = planets
    .filter((planet) => playerInterestedBodyIds.has(planet.Key.value))
    .map((p) => p.Value);

  const alienFaction = saveFile.gamestates["PavonisInteractive.TerraInvicta.TIFactionState"].find(
    (faction) => faction.Value.templateName === "AlienCouncil"
  )?.Value;
  if (!alienFaction) {
    throw new Error("Alien faction data not found in save file.");
  }

  const alienFleetsToPlayerOrbits = sortByDateTime(
    fleets
      .filter((fleet) => fleet.faction === alienFaction.ID.value)
      .filter((fleet) => fleet.targetOrbitId && playerInterestedOrbitIds.has(fleet.targetOrbitId)),
    (i) => i.arrivalTime
  );

  const regions = saveFile.gamestates["PavonisInteractive.TerraInvicta.TIRegionState"].map(({ Value: region }) => ({
    id: region.ID.value,
    templateName: region.templateName,
    nationId: region.nation.value,
    boostPerYear: region.boostPerYear_dekatons,
    missionControl: region.missionControl,
    populationInMillions: region.populationInMillions,
  }));
  const regionsById = new Map<number, (typeof regions)[0]>(regions.map((region) => [region.id, region]));
  const regionsByNationId = regions.reduce((acc, region) => {
    if (!region.nationId) return acc;
    if (!acc.has(region.nationId)) {
      acc.set(region.nationId, []);
    }
    acc.get(region.nationId)!.push(region);
    return acc;
  }, new Map<number, typeof regions>());

  const controlPoints = saveFile.gamestates["PavonisInteractive.TerraInvicta.TIControlPoint"].map(({ Value: cp }) => ({
    id: cp.ID.value,
    factionId: cp.faction?.value,
    nationId: cp.nation?.value,
    displayName: cp.displayName,
    benefitsDisabled: cp.benefitsDisabled,
    crackdownExpiration: cp.crackdownExpiration,
    defended: cp.defended,
  }));
  const controlPointsByNationId = controlPoints.reduce((acc, cp) => {
    if (!cp.nationId) return acc;
    if (!acc.has(cp.nationId)) {
      acc.set(cp.nationId, []);
    }
    acc.get(cp.nationId)!.push(cp);
    return acc;
  }, new Map<number, typeof controlPoints>());
  const nations = saveFile.gamestates["PavonisInteractive.TerraInvicta.TINationState"]
    .filter((i) => i.Value.exists && !!i.Value.capital)
    .map(({ Value: nation }) => {
      const investmentPoints = nation.baseInvestmentPoints_month;
      const valuePerSpoilsIP =
        5 * investmentPoints +
        5 * nation.numMiningRegions_dailyCache +
        5 * nation.numOilRegions_dailyCache +
        2.5 * (10 - nation.democracy);
      const totalSpoils = valuePerSpoilsIP * investmentPoints;
      const cpCount = nation.controlPoints.length;
      const totalCpCost = Math.pow(nation.GDP / 1000000000, 0.6) / 2; // https://www.reddit.com/r/TerraInvicta/comments/1c9t3c2/control_point_cost_formula/
      const totalSpoilsPerCpCost = totalCpCost > 0 ? totalSpoils / totalCpCost : 0;
      const totalSpoilsPerControlPoint = cpCount > 0 ? totalSpoils / cpCount : 0;
      const controlPoints = controlPointsByNationId.get(nation.ID.value) || [];
      const regions = regionsByNationId.get(nation.ID.value) || [];
      const mc = regions.reduce((acc, r) => acc + r.missionControl, 0);
      const boostPerMonth = regions.reduce((acc, r) => acc + r.boostPerYear, 0) / 12;
      const mcPerCpCost = totalCpCost > 0 ? mc / totalCpCost : 0;
      const boostPerMonthPerCpCost = totalCpCost > 0 ? boostPerMonth / totalCpCost : 0;
      const populationInMillions = regions.reduce((acc, r) => acc + r.populationInMillions, 0);

      return {
        id: nation.ID.value,
        templateName: nation.templateName,
        displayName: nation.displayName,
        cpCount,
        totalCpCost,
        valuePerSpoilsIP,
        totalSpoils,
        totalSpoilsPerCpCost,
        totalSpoilsPerControlPoint,
        controlPoints,
        investmentPoints,
        unrest: nation.unrest,
        democracy: nation.democracy,
        GDP: nation.GDP,
        mc,
        mcPerCpCost,
        boostPerMonth,
        boostPerMonthPerCpCost,
        populationInMillions,
      };
    })
    .filter((i) => i.populationInMillions > 0);
  const nationsById = new Map<number, (typeof nations)[0]>(nations.map((nation) => [nation.id, nation]));

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
    ])
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
    councilorOrgs: typeof orgs
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
        { ...effects }
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
      traitTemplates.filter((t) => !(t.tags || []).includes("Augmented"))
    );

    const effectsWithAugments = addTraits(
      effectsBaseAndUnaugmentedTraits,
      traitTemplates.filter((t) => (t.tags || []).includes("Augmented"))
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
        councilorOrgs
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
    }
  );
  const playerCouncilors = councilors.filter((councilor) => playerFaction?.councilorIds.includes(councilor.id));
  const playerNationIds = new Set<number>(
    controlPoints
      .filter((cp) => cp.factionId === playerFaction.id && cp.nationId)
      .map((cp) => cp.nationId!)
      .concat(playerCouncilors.map((c) => c.homeNationId).filter((id): id is number => !!id))
  );

  const playerAvailableCouncilors = councilors.filter((councilor) =>
    playerFaction?.availableCouncilorIds.includes(councilor.id)
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
            (c.effectsWithOrgsAndAugments.administration || 0) + (c.effectsWithOrgsAndAugments.Administration || 0)
          )
        );
      }, 0);
      return [faction.id, totalAdmin / Math.max(1, factionCouncilors.length)];
    })
  );
  const playerVisibleCouncilors = councilors.filter((i) => i.factionId !== playerFaction.id && i.playerIntel >= 0.25); // TODO: figure out exact intel threshold
  const playerVisibleFactionIds = new Set<number>(
    playerVisibleCouncilors.map((c) => c.factionId).filter((id): id is number => !!id)
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
            (c.effectsWithOrgsAndAugments.administration || 0) + (c.effectsWithOrgsAndAugments.Administration || 0)
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
        })
    )
    .filter((o) => o.template?.allowedOnMarket);

  const playerStealableProjects = factions
    .filter((i) => i.id !== alienFaction.ID.value)
    .filter((i) => playerVisibleFactionIds.has(i.id))
    .flatMap((faction) => {
      return faction.finishedProjectNames.map((projectName) => ({ projectName, factionId: faction.id }));
    })
    .filter((i) => playerFaction.missedProjects.includes(i.projectName));

  return {
    fileName,
    lastModified,
    gameCurrentDateTime: time.currentDateTime,
    gameCurrentDateTimeFormatted,
    player,
    playerFaction,
    alienFaction,
    playerHabs,
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
  };
}

export type Analysis = Awaited<ReturnType<typeof analyzeData>>;
