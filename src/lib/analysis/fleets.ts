import { SaveFile } from "../savefile";
import { templates } from "../templates";
import { diffDateTime, formatDateTime, sortByDateTime, toDays } from "../utils";
import { GameTime } from "./core";

export interface Orbit {
  id: number;
  displayName: string | null;
  templateName: string | null;
  barycenterId: number;
}

export interface Body {
  id: number;
  displayName: string | null;
  templateName: string | null;
  barycenterId?: number;
  solarMirrorBonusByFactionId: Map<number, number>;
}

export interface ShipHull {
  dataName: string;
  friendlyName: string;
  noseHardpoints: number;
  hullHardpoints: number;
  internalModules: number;
  missionControl: number;
  constructionTier: number;
}

export interface Ship {
  id: number;
  displayName: string | null;
  templateName: string | null;
  missionControlConsumption: number;
  currentMass_kg: number;
  currentDeltaV_kps: number;
  currentMaxDeltaV_kps: number;
}

export interface Fleet {
  id: number;
  faction: number;
  displayName: string;
  originOrbitId?: number;
  targetOrbitId?: number;
  targetOrbitName: string;
  planetName: string;
  arrivalTime?: any;
  arrivalTimeFormatted: string | null;
  daysToTarget: number | null;
  operation?: string;
  operationComplete: string | null;
  operationCompleteDays: number | null;
  fleetShips: Array<{
    ship: Ship;
    design: any;
    hull: ShipHull | null | undefined;
    estimatedMc: number;
  }>;
  totalMC: number;
  shipsByHullType: Array<{ hullName: string; count: number }>;
  shipsByRole: Array<{ role: string; count: number }>;
  totalMass: number;
  maxShipMass: number;
  deltaV: number;
}

export async function loadSpaceData(saveFile: SaveFile) {
  const planets = saveFile.gamestates["PavonisInteractive.TerraInvicta.TISpaceBodyState"];
  const sol = planets.find((i) => i.Value.templateName === "Sol")?.Key.value;
  const earth = planets.find((i) => i.Value.templateName === "Earth")?.Key.value;
  
  if (!sol) {
    throw new Error("Sol planet data not found in save file.");
  }
  if (!earth) {
    throw new Error("Earth planet data not found in save file.");
  }

  const orbitsById = new Map<number, Orbit>(
    saveFile.gamestates["PavonisInteractive.TerraInvicta.TIOrbitState"].map(({ Value: orbit }) => [
      orbit.ID.value,
      {
        id: orbit.ID.value,
        displayName: orbit.displayName,
        templateName: orbit.templateName,
        barycenterId: orbit.barycenter.value,
      },
    ]),
  );

  const bodiesById = new Map<number, Body>(
    planets.map(({ Value: body }) => [
      body.ID.value,
      {
        id: body.ID.value,
        displayName: body.displayName,
        templateName: body.templateName,
        barycenterId: body.barycenter?.value,
        solarMirrorBonusByFactionId: new Map(body.solarMirrorBonus.map((i: any) => [i.Key.value, i.Value])),
      },
    ]),
  );

  return { sol, earth, planets, orbitsById, bodiesById };
}

export async function loadShipData(saveFile: SaveFile, shipDesignsByDataName: Map<string, any>) {
  const shipHulls: ShipHull[] = (await templates.shipHulls()).map((h) => ({
    dataName: h.dataName,
    friendlyName: h.friendlyName,
    noseHardpoints: h.noseHardpoints,
    hullHardpoints: h.hullHardpoints,
    internalModules: h.internalModules,
    missionControl: h.missionControl,
    constructionTier: h.consTier,
  }));

  const shipHullsByDataName = new Map<string, ShipHull>(shipHulls.map((hull) => [hull.dataName, hull]));

  const ships: Ship[] = saveFile.gamestates["PavonisInteractive.TerraInvicta.TISpaceShipState"].map(({ Value: ship }) => ({
    id: ship.ID.value,
    displayName: ship.displayName,
    templateName: ship.templateName,
    missionControlConsumption: ship.missionControlConsumption,
    currentMass_kg: ship.currentMass_kg,
    currentDeltaV_kps: ship.currentDeltaV_kps,
    currentMaxDeltaV_kps: ship.currentMaxDeltaV_kps,
  }));

  const shipsById = new Map<number, Ship>(ships.map((ship) => [ship.id, ship]));

  return { shipHulls, shipHullsByDataName, ships, shipsById };
}

export function analyzeFleets(
  saveFile: SaveFile,
  time: GameTime,
  playerFactionId: number,
  shipsById: Map<number, Ship>,
  shipDesignsByDataName: Map<string, any>,
  shipHullsByDataName: Map<string, ShipHull>,
  orbitsById: Map<number, Orbit>,
  bodiesById: Map<number, Body>,
): Fleet[] {
  return saveFile.gamestates["PavonisInteractive.TerraInvicta.TISpaceFleetState"].map(({ Value: rawFleet }) => {
    // TODO: can the player see the mission before it arrives?
    const operation = rawFleet.trajectory?.arrivalTime
      ? null
      : sortByDateTime(rawFleet.currentOperations ?? [], (op: any) => op.startDate)?.[0] || null;
    
    const fleetShips = rawFleet.ships
      .map(({ value: id }: any) => shipsById.get(id))
      .filter((s): s is Ship => !!s)
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
      displayName: rawFleet.displayNameByFaction.find((dn: any) => dn.Key.value === playerFactionId)?.Value || "UNKNOWN",
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
}
