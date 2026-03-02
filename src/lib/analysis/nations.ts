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

export type NationRelationship = "war" | "federation" | "ally" | "neutral" | "rival";

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

export interface ClaimCoverage {
  totalRegions: number;
  nonHostile: number;
  hostile: number;
  missing: number;
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
  isCapitalClaim: boolean;
  isCapitalClaimHostile: boolean | null;
  otherPlayerCapitalClaimants: { nationId: number; nationName: string }[];
  currentRegionCoverage: ClaimCoverage;
  targetClaimCoverage: ClaimCoverage;
  /** Democracy score of target minus claimant (positive = target is higher) */
  governmentGap: number;
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

  // Build regionIdsByNationId from regionsById for coverage checks
  const regionIdsByNationId = new Map<number, Set<number>>();
  for (const [regionId, region] of regionsById) {
    if (!region.nationId) continue;
    if (!regionIdsByNationId.has(region.nationId)) regionIdsByNationId.set(region.nationId, new Set());
    regionIdsByNationId.get(region.nationId)!.add(regionId);
  }

  const playerNationIdSet = new Set(playerNationIds);

  // Pre-pass: build map of targetNationId → player nations that have a capital claim on it
  const capitalClaimantsByTarget = new Map<number, { nationId: number; nationName: string }[]>();
  for (const pNationId of playerNationIdSet) {
    const pState = nationStateById.get(pNationId);
    const pNation = nationsById.get(pNationId);
    if (!pState || !pNation) continue;
    const allPClaims = [...pState.claims, ...pState.hostileClaims];
    for (const claimRef of allPClaims) {
      const region = regionsById.get(claimRef.value);
      if (!region || !region.nationId || region.nationId === pNationId) continue;
      const targetState = nationStateById.get(region.nationId);
      if (targetState?.capital?.value === claimRef.value) {
        if (!capitalClaimantsByTarget.has(region.nationId)) {
          capitalClaimantsByTarget.set(region.nationId, []);
        }
        capitalClaimantsByTarget.get(region.nationId)!.push({
          nationId: pNationId,
          nationName: pNation.displayName ?? pNation.templateName ?? "",
        });
      }
    }
  }

  const result: NationClaimsEntry[] = [];

  for (const nationId of playerNationIdSet) {
    const nationState = nationStateById.get(nationId);
    const nation = nationsById.get(nationId);
    if (!nationState || !nation) continue;

    // Map claims (region IDs) to target nation IDs (excluding self-claims)
    // Track which region IDs are claimed per target nation (combined) and hostile
    const claimedRegionsByTargetNation = new Map<number, Set<number>>();
    const hostileClaimedRegionsByTargetNation = new Map<number, Set<number>>();

    const addClaim = (claimRef: { value: number }, isHostile: boolean) => {
      const region = regionsById.get(claimRef.value);
      if (region && region.nationId && region.nationId !== nationId) {
        if (!claimedRegionsByTargetNation.has(region.nationId)) {
          claimedRegionsByTargetNation.set(region.nationId, new Set());
        }
        claimedRegionsByTargetNation.get(region.nationId)!.add(claimRef.value);
        if (isHostile) {
          if (!hostileClaimedRegionsByTargetNation.has(region.nationId)) {
            hostileClaimedRegionsByTargetNation.set(region.nationId, new Set());
          }
          hostileClaimedRegionsByTargetNation.get(region.nationId)!.add(claimRef.value);
        }
      }
    };

    for (const claimRef of nationState.claims) addClaim(claimRef, false);
    for (const claimRef of nationState.hostileClaims) addClaim(claimRef, true);

    const targetNationIds = claimedRegionsByTargetNation.keys();

    if (claimedRegionsByTargetNation.size === 0) continue;

    // Build cooldown lookups for this nation
    const improveCooldowns = new Map<number, DateTime>(
      (Array.isArray(nationState.improveRelationsCooldowns) ? nationState.improveRelationsCooldowns : []).map(
        (kv) => [kv.Key.value, kv.Value],
      ),
    );
    const rivalryCooldowns = new Map<number, DateTime>(
      (Array.isArray(nationState.rivalryCooldowns) ? nationState.rivalryCooldowns : []).map(
        (kv) => [kv.Key.value, kv.Value],
      ),
    );

    const targets: NationClaimTarget[] = [];

    for (const targetId of targetNationIds) {
      const targetNation = nationsById.get(targetId);
      const targetState = nationStateById.get(targetId);
      if (!targetNation || !targetState) continue;

      // Determine relationship
      let relationship: NationRelationship = "neutral";
      if (nationState.wars?.some((w) => w.value === targetId)) {
        relationship = "war";
      } else if (
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

      // Check if the player already controls the executive of the target nation
      const playerOwnsExec = executiveCP?.factionId === playerFactionId;

      // Check if any claim is on the target nation's capital region
      const targetCapitalId = targetState.capital?.value;
      const claimedRegions = claimedRegionsByTargetNation.get(targetId)!;
      const isCapitalClaim = !!targetCapitalId && claimedRegions.has(targetCapitalId);
      const isCapitalClaimHostile = isCapitalClaim
        ? (hostileClaimedRegionsByTargetNation.get(targetId)?.has(targetCapitalId!) ?? false)
        : null;

      // Skip if player owns exec AND this is not a capital claim
      if (playerOwnsExec && !isCapitalClaim) continue;

      // Coverage checks — counts non-hostile, hostile, and missing claims per region set
      const buildCoverage = (regionIds: number[]): ClaimCoverage => {
        const hostileSet = hostileClaimedRegionsByTargetNation.get(targetId);
        let nonHostile = 0, hostile = 0, missing = 0;
        for (const rid of regionIds) {
          if (hostileSet?.has(rid)) hostile++;
          else if (claimedRegions.has(rid)) nonHostile++;
          else missing++;
        }
        return { totalRegions: regionIds.length, nonHostile, hostile, missing };
      };

      const targetCurrentRegionIds = regionIdsByNationId.get(targetId) ?? new Set<number>();
      const currentRegionCoverage = buildCoverage([...targetCurrentRegionIds]);

      // Target nation's irredentist claims (regions in OTHER nations that the target claims)
      const targetIrredentistClaims = (Array.isArray(targetState.claims) ? targetState.claims : [])
        .map((c) => c.value)
        .filter((rid) => !targetCurrentRegionIds.has(rid));
      const targetClaimCoverage = buildCoverage(targetIrredentistClaims);

      // Government gap warning: flag if claimant's democracy is >1.5 below target's
      const claimantDemocracy = nation.democracy;
      const targetDemocracy = targetNation.democracy;
      const rawGap = targetDemocracy - claimantDemocracy;
      const governmentGap = Math.round(rawGap * 10) / 10;

      targets.push({
        targetNationId: targetId,
        targetNationName: targetNation.displayName ?? targetNation.templateName ?? "",
        relationship,
        relationsCanImproveAfter,
        warActionAfter,
        executiveFactionId: execFaction?.id ?? null,
        executiveFactionName: execFaction?.displayName ?? null,
        executiveFactionTemplateName: execFaction?.templateName ?? null,
        isCapitalClaim,
        isCapitalClaimHostile,
        otherPlayerCapitalClaimants: (capitalClaimantsByTarget.get(targetId) ?? []).filter(
          (c) => c.nationId !== nationId,
        ),
        currentRegionCoverage,
        targetClaimCoverage,
        governmentGap,
      });
    }

    // Sort targets: no co-claimants first, then faction, relationship, nation name
    const relationOrder: Record<NationRelationship, number> = { war: 0, federation: 1, ally: 2, neutral: 3, rival: 4 };
    targets.sort((a, b) => {
      const aHasCo = a.otherPlayerCapitalClaimants.length > 0 ? 1 : 0;
      const bHasCo = b.otherPlayerCapitalClaimants.length > 0 ? 1 : 0;
      if (aHasCo !== bHasCo) return aHasCo - bHasCo;
      const aFac = a.executiveFactionName ?? "\uFFFF";
      const bFac = b.executiveFactionName ?? "\uFFFF";
      const fc = aFac.localeCompare(bFac);
      if (fc !== 0) return fc;
      const rc = relationOrder[a.relationship] - relationOrder[b.relationship];
      return rc !== 0 ? rc : a.targetNationName.localeCompare(b.targetNationName);
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

export interface UnificationCandidate {
  claimantNationId: number;
  claimantNationName: string;
  claimantDemocracy: number;
  targetNationId: number;
  targetNationName: string;
  targetDemocracy: number;
  isHostileClaim: boolean;
  relationship: NationRelationship;
  relationsCanImproveAfter: string | null;
}

export function analyzeUnificationCandidates({
  allNationStates,
  nationsById,
  regionsById,
  controlPointsByNationId,
  playerFactionId,
  gameCurrentDateTime,
}: Pick<
  AnalyzeNationClaimsArgs,
  "allNationStates" | "nationsById" | "regionsById" | "controlPointsByNationId" | "playerFactionId" | "gameCurrentDateTime"
>): UnificationCandidate[] {
  const nationStateById = new Map(allNationStates.map((n) => [n.ID.value, n]));

  // Collect all nation IDs where the player controls the executive CP
  const playerExecNationIds = new Set<number>(
    [...controlPointsByNationId.entries()]
      .filter(([, cps]) => cps.some((cp) => cp.controlPointType === "Executive" && cp.factionId === playerFactionId))
      .map(([nationId]) => nationId),
  );

  const results: UnificationCandidate[] = [];
  const seen = new Set<string>(); // deduplicate symmetric pairs

  for (const claimantId of playerExecNationIds) {
    const claimantState = nationStateById.get(claimantId);
    const claimantNation = nationsById.get(claimantId);
    if (!claimantState || !claimantNation) continue;

    const improveCooldowns = new Map<number, DateTime>(
      (Array.isArray(claimantState.improveRelationsCooldowns) ? claimantState.improveRelationsCooldowns : []).map(
        (kv) => [kv.Key.value, kv.Value],
      ),
    );

    const allClaims = [
      ...(Array.isArray(claimantState.claims) ? claimantState.claims : []).map((c) => ({ ref: c, hostile: false })),
      ...(Array.isArray(claimantState.hostileClaims) ? claimantState.hostileClaims : []).map((c) => ({ ref: c, hostile: true })),
    ];

    for (const { ref, hostile } of allClaims) {
      const region = regionsById.get(ref.value);
      if (!region?.nationId || region.nationId === claimantId) continue;
      const targetId = region.nationId;

      // Target must also be player-exec-controlled
      if (!playerExecNationIds.has(targetId)) continue;

      const targetState = nationStateById.get(targetId);
      const targetNation = nationsById.get(targetId);
      if (!targetState || !targetNation) continue;

      // This claim must be on the target's capital
      if (targetState.capital?.value !== ref.value) continue;

      // Deduplicate: only emit each (claimant, target) pair once
      const key = `${claimantId}:${targetId}`;
      if (seen.has(key)) continue;
      seen.add(key);

      // Relationship
      let relationship: NationRelationship = "neutral";
      if (claimantState.wars?.some((w) => w.value === targetId)) {
        relationship = "war";
      } else if (
        claimantState.federation &&
        targetState.federation &&
        claimantState.federation.value === targetState.federation.value
      ) {
        relationship = "federation";
      } else if (claimantState.allies.some((a) => a.value === targetId)) {
        relationship = "ally";
      } else if (claimantState.rivals.some((r) => r.value === targetId)) {
        relationship = "rival";
      }

      const improveDate = improveCooldowns.get(targetId);
      const relationsCanImproveAfter =
        improveDate && isDateInFuture(improveDate, gameCurrentDateTime) ? formatDateShort(improveDate) : null;

      results.push({
        claimantNationId: claimantId,
        claimantNationName: claimantNation.displayName ?? claimantNation.templateName ?? "",
        claimantDemocracy: Math.round(claimantNation.democracy * 10) / 10,
        targetNationId: targetId,
        targetNationName: targetNation.displayName ?? targetNation.templateName ?? "",
        targetDemocracy: Math.round(targetNation.democracy * 10) / 10,
        isHostileClaim: hostile,
        relationship,
        relationsCanImproveAfter,
      });
    }
  }

  const relationOrder: Record<NationRelationship, number> = { federation: 0, ally: 1, neutral: 2, rival: 3, war: 4 };
  results.sort((a, b) => {
    const rc = relationOrder[a.relationship] - relationOrder[b.relationship];
    return rc !== 0 ? rc : a.claimantNationName.localeCompare(b.claimantNationName);
  });

  return results;
}
