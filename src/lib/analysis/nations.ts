import { DateTime, SaveFile } from "../savefile";

export interface AnalyzeNationsArgs {
  playerFactionId: number;
}

export function analyzeNations(saveFile: SaveFile, { playerFactionId }: AnalyzeNationsArgs) {
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
    controlPointType: cp.controlPointType,
  }));

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
      const totalCpCost = Math.pow(nation.GDP / 1000000000, 0.6) / 2; // https://www.reddit.com/r/TerraInvicta/comments/1c9t3c2/control_point_cost_formula/
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
          {} as Record<keyof (typeof controlPoints)[0]["controlPointPriorities"], number>,
        );

      const wastedOppression = allocatedPriorities.Oppression > 0 && nation.unrest <= 0.01; // oppression not really needed with no unrest
      const tooHighUnrest = nation.unrest > 2 && (allocatedPriorities.Oppression || 0) < 0.5; // unrest high enough to start losing IP and not doing anything about it
      const spoilsWithoutAllCPs =
        allocatedPriorities.Spoils > 0 &&
        controlPoints.some((cp) => cp.benefitsDisabled || cp.factionId !== playerFactionId); // spoils but not all CPs controlled by player
      const couldBuildBoost = allocatedPriorities.Spoils > 0 && boostPerMonth > 0; // spoils when we could be building boost

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
  const nationsById = new Map<number, (typeof nations)[0]>(nations.map((nation) => [nation.id, nation]));

  // Add nation history to factions - aggregate all nations where faction has CPs
  const allNationStates = saveFile.gamestates["PavonisInteractive.TerraInvicta.TINationState"]
    .filter((i) => i.Value.exists && !!i.Value.capital)
    .map((i) => i.Value);

  return { nations, nationsById, regions, regionsById, controlPoints, controlPointsByNationId, allNationStates };
}

export type NationRelationship = "federation" | "ally" | "neutral" | "rival";

function isDateInFuture(date: DateTime, current: DateTime): boolean {
  if (date.year !== current.year) return date.year > current.year;
  if (date.month !== current.month) return date.month > current.month;
  return date.day > current.day;
}

function formatDateShort(dt: DateTime): string {
  return `${dt.year}-${String(dt.month).padStart(2, "0")}-${String(dt.day).padStart(2, "0")}`;
}

export interface AnalyzeNationClaimsArgs {
  allNationStates: ReturnType<typeof analyzeNations>["allNationStates"];
  nationsById: ReturnType<typeof analyzeNations>["nationsById"];
  regionsById: ReturnType<typeof analyzeNations>["regionsById"];
  controlPointsByNationId: ReturnType<typeof analyzeNations>["controlPointsByNationId"];
  playerNationIds: number[];
  playerFactionId: number;
  factionsById: Map<number, { id: number; displayName: string | null; templateName: string | null }>;
  gameCurrentDateTime: DateTime;
}

export interface NationClaimTarget {
  targetNationId: number;
  targetNationName: string;
  relationship: NationRelationship;
  relationsCanImproveAfter: string | null;
  warActionAfter: string | null;
  executiveFactionId: number | null;
  executiveFactionName: string | null;
  executiveFactionTemplateName: string | null;
}

export interface NationClaimsEntry {
  nationId: number;
  nationName: string;
  targets: NationClaimTarget[];
}

export function analyzeNationClaims({
  allNationStates,
  nationsById,
  regionsById,
  controlPointsByNationId,
  playerNationIds,
  playerFactionId,
  factionsById,
  gameCurrentDateTime,
}: AnalyzeNationClaimsArgs): NationClaimsEntry[] {
  const nationStateById = new Map(allNationStates.map((n) => [n.ID.value, n]));

  const playerNationIdSet = new Set(playerNationIds);

  const result: NationClaimsEntry[] = [];

  for (const nationId of playerNationIdSet) {
    const nationState = nationStateById.get(nationId);
    const nation = nationsById.get(nationId);
    if (!nationState || !nation) continue;

    // Map claims (region IDs) to target nation IDs (excluding self-claims)
    const targetNationIds = new Set<number>();
    for (const claimRef of nationState.claims) {
      const region = regionsById.get(claimRef.value);
      if (region && region.nationId && region.nationId !== nationId) {
        targetNationIds.add(region.nationId);
      }
    }

    if (targetNationIds.size === 0) continue;

    // Build cooldown lookups for this nation
    const improveCooldowns = new Map<number, DateTime>(
      (nationState.improveRelationsCooldowns || []).map((kv) => [kv.Key.value, kv.Value]),
    );
    const rivalryCooldowns = new Map<number, DateTime>(
      (nationState.rivalryCooldowns || []).map((kv) => [kv.Key.value, kv.Value]),
    );

    const targets: NationClaimTarget[] = [];

    for (const targetId of targetNationIds) {
      const targetNation = nationsById.get(targetId);
      const targetState = nationStateById.get(targetId);
      if (!targetNation || !targetState) continue;

      // Determine relationship
      let relationship: NationRelationship = "neutral";
      if (
        nationState.federation &&
        targetState.federation &&
        nationState.federation.value === targetState.federation.value
      ) {
        relationship = "federation";
      } else if (nationState.allies.some((a) => a.value === targetId)) {
        relationship = "ally";
      } else if (nationState.rivals.some((r) => r.value === targetId)) {
        relationship = "rival";
      }

      // Cooldown dates (only show if in the future)
      const improveDate = improveCooldowns.get(targetId);
      const rivalryDate = rivalryCooldowns.get(targetId);
      const relationsCanImproveAfter =
        improveDate && isDateInFuture(improveDate, gameCurrentDateTime) ? formatDateShort(improveDate) : null;
      const warActionAfter =
        rivalryDate && isDateInFuture(rivalryDate, gameCurrentDateTime) ? formatDateShort(rivalryDate) : null;

      // Executive CP faction in target nation
      const targetCPs = controlPointsByNationId.get(targetId) || [];
      const executiveCP = targetCPs.find((cp) => cp.controlPointType === "Executive");
      const execFaction = executiveCP?.factionId ? factionsById.get(executiveCP.factionId) : null;

      targets.push({
        targetNationId: targetId,
        targetNationName: targetNation.displayName ?? targetNation.templateName ?? "",
        relationship,
        relationsCanImproveAfter,
        warActionAfter,
        executiveFactionId: execFaction?.id ?? null,
        executiveFactionName: execFaction?.displayName ?? null,
        executiveFactionTemplateName: execFaction?.templateName ?? null,
      });
    }

    // Sort targets by relationship priority then name
    const relationOrder: Record<NationRelationship, number> = { federation: 0, ally: 1, neutral: 2, rival: 3 };
    targets.sort((a, b) => {
      const ro = relationOrder[a.relationship] - relationOrder[b.relationship];
      return ro !== 0 ? ro : a.targetNationName.localeCompare(b.targetNationName);
    });

    result.push({
      nationId,
      nationName: nation.displayName ?? nation.templateName ?? "",
      targets,
    });
  }

  result.sort((a, b) => a.nationName.localeCompare(b.nationName));
  return result;
}
