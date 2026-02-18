import { SaveFile } from "../savefile";

export interface Region {
  id: number;
  templateName: string | null;
  nationId: number;
  boostPerYear: number;
  missionControl: number;
  populationInMillions: number;
}

export interface ControlPoint {
  id: number;
  factionId?: number;
  nationId?: number;
  displayName: string | null;
  benefitsDisabled: boolean;
  crackdownExpiration: any;
  defended: boolean;
  controlPointPriorities: Record<string, number>;
}

export interface Nation {
  id: number;
  templateName: string | null;
  displayName: string | null;
  cpCount: number;
  totalCpCost: number;
  valuePerSpoilsIP: number;
  totalSpoils: number;
  totalSpoilsPerCpCost: number;
  totalSpoilsPerControlPoint: number;
  controlPoints: ControlPoint[];
  investmentPoints: number;
  unrest: number;
  democracy: number;
  GDP: number;
  mc: number;
  mcPerCpCost: number;
  boostPerMonth: number;
  boostPerMonthPerCpCost: number;
  populationInMillions: number;
  allocatedPriorities: Record<string, number>;
  wastedOppression: boolean;
  tooHighUnrest: boolean;
  spoilsWithoutAllCPs: boolean;
  couldBuildBoost: boolean;
  ipPerCpCost: number;
  possibleBoostPerCpCost: number;
}

export function analyzeRegions(saveFile: SaveFile) {
  const regions: Region[] = saveFile.gamestates["PavonisInteractive.TerraInvicta.TIRegionState"].map(
    ({ Value: region }) => ({
      id: region.ID.value,
      templateName: region.templateName,
      nationId: region.nation.value,
      boostPerYear: region.boostPerYear_dekatons,
      missionControl: region.missionControl,
      populationInMillions: region.populationInMillions,
    }),
  );

  const regionsById = new Map<number, Region>(regions.map((region) => [region.id, region]));

  const regionsByNationId = regions.reduce((acc, region) => {
    if (!region.nationId) return acc;
    if (!acc.has(region.nationId)) {
      acc.set(region.nationId, []);
    }
    acc.get(region.nationId)!.push(region);
    return acc;
  }, new Map<number, Region[]>());

  return { regions, regionsById, regionsByNationId };
}

export function analyzeNations(
  saveFile: SaveFile,
  controlPoints: ControlPoint[],
  regionsByNationId: Map<number, Region[]>,
  playerFactionId: number,
): Nation[] {
  const controlPointsByNationId = controlPoints.reduce((acc, cp) => {
    if (!cp.nationId) return acc;
    if (!acc.has(cp.nationId)) {
      acc.set(cp.nationId, []);
    }
    acc.get(cp.nationId)!.push(cp);
    return acc;
  }, new Map<number, ControlPoint[]>());

  return saveFile.gamestates["PavonisInteractive.TerraInvicta.TINationState"]
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
      const totalCpCost = Math.pow(nation.GDP / 1000000000, 0.6) / 2;
      const totalSpoilsPerCpCost = totalCpCost > 0 ? totalSpoils / totalCpCost : 0;
      const totalSpoilsPerControlPoint = cpCount > 0 ? totalSpoils / cpCount : 0;
      const controlPoints = controlPointsByNationId.get(nation.ID.value) || [];
      const regions = regionsByNationId.get(nation.ID.value) || [];
      const mc = regions.reduce((acc, r) => acc + r.missionControl, 0);
      const boostPerMonth = regions.reduce((acc, r) => acc + r.boostPerYear, 0) / 12;
      const ipPerCpCost = totalCpCost > 0 ? investmentPoints / totalCpCost : 0;
      const possibleBoostPerCpCost = boostPerMonth > 0 ? ipPerCpCost : 0;
      const mcPerCpCost = totalCpCost > 0 ? mc / totalCpCost : 0;
      const boostPerMonthPerCpCost = totalCpCost > 0 ? boostPerMonth / totalCpCost : 0;
      const populationInMillions = regions.reduce((acc, r) => acc + r.populationInMillions, 0);

      // allocate priorities like they work in game - as % within CP, then averaged across CPs
      const allocatedPriorities = controlPoints
        .map((cp) => {
          const priorities = cp.controlPointPriorities;
          const totalPriorities = Object.values(priorities).reduce((acc, val) => acc + val, 0);
          const entries = Object.entries(priorities) as [keyof typeof priorities, number][];
          return Object.fromEntries(
            entries.map(([key, val]) => [key, totalPriorities > 0 ? val / totalPriorities / controlPoints.length : 0]),
          ) as typeof priorities;
        })
        .reduce(
          (acc, pri) => {
            (Object.keys(pri) as (keyof typeof pri)[]).forEach((key) => {
              acc[key] = (acc[key] || 0) + pri[key];
            });
            return acc;
          },
          {} as Record<keyof ControlPoint["controlPointPriorities"], number>,
        );

      const wastedOppression = allocatedPriorities.Oppression > 0 && nation.unrest <= 0.01;
      const tooHighUnrest = nation.unrest > 2 && (allocatedPriorities.Oppression || 0) < 0.5;
      const spoilsWithoutAllCPs =
        allocatedPriorities.Spoils > 0 &&
        controlPoints.some((cp) => cp.benefitsDisabled || cp.factionId !== playerFactionId);
      const couldBuildBoost = allocatedPriorities.Spoils > 0 && boostPerMonth > 0;

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
        allocatedPriorities,
        wastedOppression,
        tooHighUnrest,
        spoilsWithoutAllCPs,
        couldBuildBoost,
        ipPerCpCost,
        possibleBoostPerCpCost,
      };
    })
    .filter((i) => i.populationInMillions > 0);
}

export function aggregateFactionNationHistory(
  saveFile: SaveFile,
  factions: any[],
  controlPointsByNationId: Map<number, ControlPoint[]>,
) {
  const allNationStates = saveFile.gamestates["PavonisInteractive.TerraInvicta.TINationState"]
    .filter((i: any) => i.Value.exists && !!i.Value.capital)
    .map((i: any) => i.Value);

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
}
