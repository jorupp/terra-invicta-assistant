import { SaveFile } from "../savefile";
import type { DateTime } from "../savefile";

type ControlPoint = {
  id: number;
  factionId: number | undefined;
  nationId: number | undefined;
  displayName: string | null;
  benefitsDisabled: boolean;
  crackdownExpiration: DateTime | null;
  defended: boolean;
  controlPointPriorities: Record<string, number>;
};

type FactionWithNationHistory = {
  id: number;
  nationHistory: {
    historyMissionControl: number[];
    historyBoost: number[];
    currentBoost: number;
    currentMC: number;
    boostMonthlyChange: number;
    mcMonthlyChange: number;
  };
};

export function processNations(
  saveFile: SaveFile,
  controlPoints: ControlPoint[],
  playerFactionId: number,
  factions: FactionWithNationHistory[],
) {
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
      const totalCpCost = Math.pow(nation.GDP / 1000000000, 0.6) / 2;
      const totalSpoilsPerCpCost = totalCpCost > 0 ? totalSpoils / totalCpCost : 0;
      const totalSpoilsPerControlPoint = cpCount > 0 ? totalSpoils / cpCount : 0;
      const nationControlPoints = controlPointsByNationId.get(nation.ID.value) || [];
      const nationRegions = regionsByNationId.get(nation.ID.value) || [];
      const mc = nationRegions.reduce((acc, r) => acc + r.missionControl, 0);
      const boostPerMonth = nationRegions.reduce((acc, r) => acc + r.boostPerYear, 0) / 12;
      const ipPerCpCost = totalCpCost > 0 ? investmentPoints / totalCpCost : 0;
      const possibleBoostPerCpCost = boostPerMonth > 0 ? ipPerCpCost : 0;
      const mcPerCpCost = totalCpCost > 0 ? mc / totalCpCost : 0;
      const boostPerMonthPerCpCost = totalCpCost > 0 ? boostPerMonth / totalCpCost : 0;
      const populationInMillions = nationRegions.reduce((acc, r) => acc + r.populationInMillions, 0);
      // allocate priorities like they work in game - as % within CP, then averaged across CPs
      const allocatedPriorities = nationControlPoints
        .map((cp) => {
          const priorities = cp.controlPointPriorities;
          const totalPriorities = Object.values(priorities).reduce((acc, val) => acc + val, 0);
          const entries = Object.entries(priorities) as [keyof typeof priorities, number][];
          return Object.fromEntries(
            entries.map(([key, val]) => [key, totalPriorities > 0 ? val / totalPriorities / nationControlPoints.length : 0]),
          ) as typeof priorities;
        })
        .reduce(
          (acc, pri) => {
            (Object.keys(pri) as (keyof typeof pri)[]).forEach((key) => {
              acc[key] = (acc[key] || 0) + pri[key];
            });
            return acc;
          },
          {} as Record<keyof (typeof nationControlPoints)[0]["controlPointPriorities"], number>,
        );

      const wastedOppression = allocatedPriorities.Oppression > 0 && nation.unrest <= 0.01;
      const tooHighUnrest = nation.unrest > 2 && (allocatedPriorities.Oppression || 0) < 0.5;
      const spoilsWithoutAllCPs =
        allocatedPriorities.Spoils > 0 &&
        nationControlPoints.some((cp) => cp.benefitsDisabled || cp.factionId !== playerFactionId);
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
        controlPoints: nationControlPoints,
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
  const nationsById = new Map<number, (typeof nations)[0]>(nations.map((nation) => [nation.id, nation]));

  // Add nation history to factions - aggregate all nations where faction has CPs
  const allNationStates = saveFile.gamestates["PavonisInteractive.TerraInvicta.TINationState"]
    .filter((i) => i.Value.exists && !!i.Value.capital)
    .map((i) => i.Value);

  for (const faction of factions) {
    const controlledNationsWithCPs: Array<{
      nation: (typeof allNationStates)[0];
      factionCPs: number;
      totalCPs: number;
    }> = [];

    for (const nationState of allNationStates) {
      const nationId = nationState.ID.value;
      const nationCPs = controlPointsByNationId.get(nationId) || [];
      const factionCPCount = nationCPs.filter((cp) => cp.factionId === faction.id).length;

      if (factionCPCount > 0) {
        controlledNationsWithCPs.push({
          nation: nationState,
          factionCPs: factionCPCount,
          totalCPs: nationCPs.length,
        });
      }
    }

    if (controlledNationsWithCPs.length > 0) {
      const maxMCLength = Math.max(
        ...controlledNationsWithCPs.map((n) => (n.nation.historyMissionControl || []).length),
      );
      const maxBoostLength = Math.max(...controlledNationsWithCPs.map((n) => (n.nation.historyBoost || []).length));

      faction.nationHistory.historyMissionControl = Array.from({ length: maxMCLength }, (_, index) => {
        return controlledNationsWithCPs.reduce((sum, { nation, factionCPs, totalCPs }) => {
          const history = nation.historyMissionControl || [];
          const value = history[index] || 0;
          return sum + (value / totalCPs) * factionCPs;
        }, 0);
      });

      faction.nationHistory.historyBoost = Array.from({ length: maxBoostLength }, (_, index) => {
        return controlledNationsWithCPs.reduce((sum, { nation, factionCPs, totalCPs }) => {
          const history = nation.historyBoost || [];
          const value = history[index] || 0;
          return sum + (value / totalCPs) * factionCPs;
        }, 0);
      });

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

  return { regions, regionsById, nations, nationsById };
}

export type NationEntry = ReturnType<typeof processNations>["nations"][0];
export type RegionEntry = ReturnType<typeof processNations>["regions"][0];
