import { CouncilorAttributes, DateTime, SaveFile } from "./savefile";
import { templates } from "./templates";
import { combineEffects, ShowEffectsProps } from "@/components/showEffects";

export async function analyzeData(saveFile: SaveFile) {
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

  const factions = saveFile.gamestates["PavonisInteractive.TerraInvicta.TIFactionState"].map(({ Value: faction }) => ({
    id: faction.ID.value,
    templateName: faction.templateName,
    displayName: faction.displayName,
    techNameContributionHistory: faction.techNameContributionHistory,
    unlockedVictoryObjective: faction.unlockedVictoryObjective,
    finishedProjectNames: faction.finishedProjectNames,
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
    })),
  }));
  const shipDesignsByDataName = new Map<string, (typeof factions)[0]["shipDesigns"][0]>(
    factions.flatMap((faction) => faction.shipDesigns).map((design) => [design.dataName, design])
  );

  const playerFaction = factions.find((faction) => faction.id === player.faction);
  if (!playerFaction) {
    throw new Error("Player faction data not found in save file.");
  }

  const controlPoints = saveFile.gamestates["PavonisInteractive.TerraInvicta.TIControlPoint"].map(({ Value: cp }) => ({
    id: cp.ID.value,
    factionId: cp.faction?.value,
    nationId: cp.nation?.value,
    displayName: cp.displayName,
    benefitsDisabled: cp.benefitsDisabled,
    defended: cp.defended,
    // TODO: can we get a CP cost somewhere?
  }));
  const playerNationIds = new Set<number>(
    controlPoints.filter((cp) => cp.factionId === playerFaction.id && cp.nationId).map((cp) => cp.nationId!)
  );

  const time = saveFile.gamestates["PavonisInteractive.TerraInvicta.TITimeState"][0].Value;

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
  }));
  const shipsById = new Map<number, (typeof ships)[0]>(ships.map((ship) => [ship.id, ship]));
  const fleets = saveFile.gamestates["PavonisInteractive.TerraInvicta.TISpaceFleetState"].map(({ Value: fleet }) => {
    // TODO: can the player see the mission before it arrives?
    const operation = fleet.trajectory?.arrivalTime
      ? null
      : sortByDateTime(fleet.currentOperations ?? [], (op) => op.startDate)?.[0] || null;
    const fleetShips = fleet.ships
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
    return {
      id: fleet.ID.value,
      faction: fleet.faction.value,
      displayName: fleet.displayNameByFaction.find((dn) => dn.Key.value === playerFaction.id)?.Value || "UNKNOWN",
      // TODO: shipInfo - can the player always see this?
      originOrbitId: fleet.trajectory?.originOrbit?.value,
      targetOrbitId: fleet.trajectory?.destinationOrbit?.value ?? fleet.orbitState?.value,
      arrivalTime: fleet.trajectory?.arrivalTime,
      daysToTarget: fleet.trajectory?.arrivalTime
        ? toDays(diffDateTime(fleet.trajectory.arrivalTime, time.currentDateTime))
        : null,
      operation: operation?.operationDataName,
      operationComplete: operation?.completionDate ? formatDateTime(operation.completionDate) : null,
      operationCompleteDays: operation?.completionDate
        ? toDays(diffDateTime(operation.completionDate, time.currentDateTime))
        : null,
    };
  });
  const habs = saveFile.gamestates["PavonisInteractive.TerraInvicta.TIHabState"].map(({ Value: hab }) => ({
    id: hab.ID.value,
    faction: hab.faction.value,
    displayName: hab.displayName,
    habSiteId: hab.habSite?.value,
    orbitStateId: hab.orbitState?.value,
  }));

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
  const habSites = saveFile.gamestates["PavonisInteractive.TerraInvicta.TIHabSiteState"];
  for (const hab of playerHabs) {
    playerBarycenters.add(habSites.find((site) => site.Key.value === hab.habSiteId)?.Value.parentBody?.value);
  }
  const planets = saveFile.gamestates["PavonisInteractive.TerraInvicta.TISpaceBodyState"];
  const sol = planets.find((i) => i.Value.templateName === "Sol")?.Key.value;
  if (!sol) {
    throw new Error("Sol planet data not found in save file.");
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
    [...playerPlanetIds].concat(
      planets.filter((i) => playerPlanetIds.has(i.Value.barycenter?.value ?? 0)).map((i) => i.Key.value)
    )
  );
  const playerInterestedOrbitIds = new Set<number>(
    saveFile.gamestates["PavonisInteractive.TerraInvicta.TIOrbitState"]
      .filter((orbit) => playerInterestedBodyIds.has(orbit.Value.barycenter.value))
      .map((i) => i.Key.value)
  );

  const alienFaction = saveFile.gamestates["PavonisInteractive.TerraInvicta.TIFactionState"].find(
    (faction) => faction.Value.templateName === "AlienCouncil"
  )?.Value;
  if (!alienFaction) {
    throw new Error("Alien faction data not found in save file.");
  }
  const alienFleetsToPlayerOrbits = fleets
    .filter((fleet) => fleet.faction === alienFaction.ID.value)
    .filter((fleet) => fleet.targetOrbitId && playerInterestedOrbitIds.has(fleet.targetOrbitId));

  const regions = saveFile.gamestates["PavonisInteractive.TerraInvicta.TIRegionState"].map(({ Value: region }) => ({
    id: region.ID.value,
    templateName: region.templateName,
    nation: region.nation.value,
  }));
  const regionsById = new Map<number, (typeof regions)[0]>(regions.map((region) => [region.id, region]));
  const nations = saveFile.gamestates["PavonisInteractive.TerraInvicta.TINationState"].map(({ Value: nation }) => ({
    id: nation.ID.value,
    templateName: nation.templateName,
    displayName: nation.displayName,
  }));
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
    const homeNationId = regionsById.get(homeRegionId || -1)?.nation;
    const homeNation = homeNationId ? nationsById.get(homeNationId) : undefined;
    return {
      id: org.ID.value,
      displayName: org.displayName,
      templateName: org.templateName,
      template,
      assignedCouncilorId: org.assignedCouncilor?.value,
      factionOrbitId: org.factionOrbit?.value,
      homeRegionId,
      homeNationId,
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
    };
  });
  const playerUnassignedOrgs = orgs.filter((org) => playerFaction?.unassignedOrgIds.includes(org.id));
  const playerAvailableOrgs = orgs.filter((org) => playerFaction?.availableOrgIds.includes(org.id));

  const councilorTraitTemplates = (await templates.traits()).map((trait) => ({
    dataName: trait.dataName,
    friendlyName: trait.friendlyName,
    xpCost: trait.XPCost,
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

  function computeCouncilorEffects(
    attributes: CouncilorAttributes,
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
            techBonuses: trait?.techBonuses,
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
        }
        for (const { priority, bonus } of trait.priorityBonuses || []) {
          if (priority && bonus) {
            const key = `${priority[0].toLowerCase()}${priority.substring(1)}Bonus` as keyof ShowEffectsProps;
            (finalEffects as any)[key] = ((finalEffects as any)[key] || 0) + bonus;
          }
        }
      }
      return finalEffects;
    }

    // Start with base attributes
    const effectsBaseAndUnaugmentedTraits = addTraits(
      { ...attributes },
      traitTemplates.filter((t) => !(t.tags || []).includes("Augmented"))
    );

    const effectsWithAugments = addTraits(
      effectsBaseAndUnaugmentedTraits,
      traitTemplates.filter((t) => (t.tags || []).includes("Augmented"))
    );

    // Add org effects to create the full effects value
    const effectsWithOrgsAndAugments = councilorOrgs.reduce<ShowEffectsProps>((acc, org) => {
      return combineEffects(acc, { ...org, techBonuses: org.template?.techBonuses });
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

      const { effectsBaseAndUnaugmentedTraits, effectsWithOrgsAndAugments } = computeCouncilorEffects(
        councilor.attributes,
        traitTemplates,
        councilorOrgs
      );

      return {
        id: councilor.ID.value,
        displayName: councilor.displayName,
        factionId: councilor.faction?.value,
        traitTemplateNames: councilor.traitTemplateNames,
        traitTemplates,
        attributes: councilor.attributes,
        orgs: councilorOrgs,
        homeRegionId: councilor.homeRegion?.value,
        homeNationId: regionsById.get(councilor.homeRegion?.value || -1)?.nation,
        typeTemplateName: councilor.typeTemplateName,
        xp: councilor.XP,
        effectsBaseAndUnaugmentedTraits,
        effectsWithOrgsAndAugments,
      };
    }
  );
  const playerCouncilors = councilors.filter((councilor) => playerFaction?.councilorIds.includes(councilor.id));
  const playerAvailableCouncilors = councilors.filter((councilor) =>
    playerFaction?.availableCouncilorIds.includes(councilor.id)
  );

  return {
    player,
    playerFaction,
    playerHabs,
    playerFleets,
    playerPlanets,
    alienFleetsToPlayerOrbits,
    playerUnassignedOrgs,
    playerAvailableOrgs,
    playerNationIds: [...playerNationIds],
    playerCouncilors,
    playerAvailableCouncilors,
  };
}

export type Analysis = Awaited<ReturnType<typeof analyzeData>>;

function compareDateTime(a?: DateTime, b?: DateTime): number {
  if (!a && !b) {
    return 0;
  }
  if (!a) {
    return -1;
  }
  if (!b) {
    return 1;
  }

  if (a.year !== b.year) {
    return a.year - b.year;
  }
  if (a.month !== b.month) {
    return a.month - b.month;
  }
  if (a.day !== b.day) {
    return a.day - b.day;
  }
  if (a.hour !== b.hour) {
    return a.hour - b.hour;
  }
  if (a.minute !== b.minute) {
    return a.minute - b.minute;
  }
  if (a.second !== b.second) {
    return a.second - b.second;
  }
  if (a.millisecond !== b.millisecond) {
    return a.millisecond - b.millisecond;
  }
  return 0;
}
export function sortByDateTime<T>(items: T[], getDateTime: (item: T) => DateTime | undefined): T[] {
  return items.toSorted((a, b) => compareDateTime(getDateTime(a), getDateTime(b)));
}
function diffDateTime(a: DateTime, b: DateTime): DateTime {
  let millisecond = a.millisecond - b.millisecond;
  let second = a.second - b.second;
  let minute = a.minute - b.minute;
  let hour = a.hour - b.hour;
  let day = a.day - b.day;
  let month = a.month - b.month;
  let year = a.year - b.year;
  if (millisecond < 0) {
    millisecond += 1000;
    second -= 1;
  }
  if (second < 0) {
    second += 60;
    minute -= 1;
  }
  if (minute < 0) {
    minute += 60;
    hour -= 1;
  }
  if (hour < 0) {
    hour += 24;
    day -= 1;
  }
  if (day < 0) {
    // Assuming 30 days in a month for simplicity
    day += 30;
    month -= 1;
  }
  if (month < 0) {
    month += 12;
    year -= 1;
  }

  return { year, month, day, hour, minute, second, millisecond };
}
function toDays(dt: DateTime): number {
  return (
    dt.year * 365 +
    dt.month * 30 +
    dt.day +
    dt.hour / 24 +
    dt.minute / 1440 +
    dt.second / 86400 +
    dt.millisecond / 86400000
  );
}
function formatDateTime(dt: DateTime): string {
  return `${dt.year}-${String(dt.month).padStart(2, "0")}-${String(dt.day).padStart(2, "0")} ${String(dt.hour).padStart(
    2,
    "0"
  )}:${String(dt.minute).padStart(2, "0")}:${String(dt.second).padStart(2, "0")}.${String(dt.millisecond).padStart(
    3,
    "0"
  )}`;
}
