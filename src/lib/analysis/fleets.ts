import { SaveFile } from "../savefile";
import { templates } from "../templates";
import { diffDateTime, formatDateTime, sortByDateTime, toDays } from "../utils";
import { analyzeFactions } from "./factions";
import { analyzePlanets } from "./planets";

export interface AnalyzeFleetArgs {
  factions: Awaited<ReturnType<typeof analyzeFactions>>["factions"];
  orbitsById: ReturnType<typeof analyzePlanets>["orbitsById"];
  bodiesById: ReturnType<typeof analyzePlanets>["bodiesById"];
  playerFactionId: number;
}

export async function analyzeFleets(
  saveFile: SaveFile,
  { factions, orbitsById, bodiesById, playerFactionId }: AnalyzeFleetArgs,
) {
  const time = saveFile.gamestates["PavonisInteractive.TerraInvicta.TITimeState"][0].Value;
  const shipDesignsByDataName = new Map<string, (typeof factions)[0]["shipDesigns"][0]>(
    factions.flatMap((faction) => faction.shipDesigns).map((design) => [design.dataName, design]),
  );

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
    const massByHullType = fleetShips.reduce((acc, { hull, ship }) => {
      if (hull) {
        acc.set(hull.friendlyName, (acc.get(hull.friendlyName) || 0) + ship.currentMass_kg);
      }
      return acc;
    }, new Map<string, number>());
    const noseArmorByHullType = fleetShips.reduce((acc, { hull, design }) => {
      if (hull && design) {
        const existing = acc.get(hull.friendlyName) || { total: 0, count: 0 };
        acc.set(hull.friendlyName, { total: existing.total + (design.noseArmor?.armorValue ?? 0), count: existing.count + 1 });
      }
      return acc;
    }, new Map<string, { total: number; count: number }>());
    const shipsByRole = fleetShips.reduce((acc, { design }) => {
      if (design) {
        acc.set(design.role, (acc.get(design.role) || 0) + 1);
      }
      return acc;
    }, new Map<string, number>());
    const shipsByClass = fleetShips.reduce((acc, { design, ship }) => {
      if (design) {
        const className = design.displayName || design.dataName || "Unknown";
        const existing = acc.get(className) || { count: 0, maxMass: 0, noseArmor: design.noseArmor?.armorValue ?? 0 };
        acc.set(className, { count: existing.count + 1, maxMass: Math.max(existing.maxMass, ship.currentMass_kg), noseArmor: existing.noseArmor });
      }
      return acc;
    }, new Map<string, { count: number; maxMass: number; noseArmor: number }>());

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
        .map(([hullName, count]) => {
          const armorData = noseArmorByHullType.get(hullName);
          const avgNoseArmor = armorData && armorData.count > 0 ? Math.round(armorData.total / armorData.count) : 0;
          return { hullName, count, avgNoseArmor };
        })
        .toSorted((a, b) => massByHullType.get(b.hullName)! - massByHullType.get(a.hullName)!),
      shipsByRole: [...shipsByRole.entries()]
        .map(([role, count]) => ({ role, count }))
        .toSorted((a, b) => a.count - b.count),
      shipsByClass: [...shipsByClass.entries()]
        .map(([className, { count, maxMass, noseArmor }]) => ({ className, count, maxMass, noseArmor }))
        .toSorted((a, b) => b.maxMass - a.maxMass),
      totalMass,
      maxShipMass,
      deltaV,
    };
  });
  const fleetsById = new Map<number, (typeof fleets)[0]>(fleets.map((fleet) => [fleet.id, fleet]));

  return { fleets, fleetsById };
}
