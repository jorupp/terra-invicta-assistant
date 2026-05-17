"use client";

import { Analysis } from "@/lib/analysis";
import { getCouncilorsUi, ManageCouncilSection, FindNewCouncilorsSection, CurrentOrgsSection, HostileTakeoverSection, MissionsSection, OtherCouncilorsSection } from "./councilors";
import { getFleetsUi, AlienFleetsSection, HumanEnemyFleetsSection, PlayerFleetsSection, ShipsUnderConstructionSection } from "./fleets";
import { getHabsUi, CurrentBonusesSection, FutureBonusesSection, McBoostSummarySection, AlienHateSection, BuildingDetailsSection, AvailableProjectsSection, TechnologyGoalsSection, ManageHabsSection, ManageMinesSection } from "./habs";
import { getResourcesUi, TransactionsSection, OwnedNationsSection, SpoilTargetsSection, McBoostTargetsSection, NationClaimsSection, UnificationCandidatesSection } from "./resources";
import { getDrivesUi, DriveSystemsSection, DriveCalculatorSection } from "./drives";
import { GameSidebar } from "./sidebar";
import { useTechnologyGoals } from "./technologyGoals";
import { ScoringWeights, defaultScoringWeights, loadWeightsFromStorage, ScoringWeightsDialog } from "./scoringWeights";
import { combineEffects, ShowEffectsProps } from "@/components/showEffects";
import { useState, useEffect, useMemo, useCallback } from "react";
import { MissionDataName } from "@/lib/template-types-generated";
import { Administration } from "@/components/icons";

interface ScoreResult {
  value: number;
  noMissionScore: number;
  details: string;
}

export function RenderGameComponent({ analysis }: { analysis: Analysis }) {
  const councilors = getCouncilorsUi(analysis);
  const fleets = getFleetsUi(analysis);
  const habs = getHabsUi(analysis);
  const resources = getResourcesUi(analysis);
  const drives = getDrivesUi(analysis);

  const allTreeItems = useMemo(() => [
    councilors.treeItems[0],
    fleets.treeItems[0],
    habs.treeItems[0],
    resources.treeItems[0],
    drives.treeItems[0],
  ], [councilors.treeItems, fleets.treeItems, habs.treeItems, resources.treeItems, drives.treeItems]);

  const defaultExpanded = useMemo(() => {
    return [...allTreeItems.map((item) => item.value)];
  }, [allTreeItems]);

  const { weights, setWeights, scoredModifiedCouncilors, scoredAvailableCouncilors, scoredBaseCouncilors, scoredOrgs, scoredOwnedOrgs, scoredUsedOrgs, councilEffects, stealableOrgsByFaction, sourcesByFactionByMission, factions, playerNationIds, playerTraits, unusedAdmin } = useMemo(() => {
    const w = defaultScoringWeights;
    const pc = analysis.playerMissionCounts;
    const scoredModifiedCouncilors = scoreAndSort(analysis.playerCouncilors, w, pc, getModifiedCouncilorScore);
    const scoredAvailableCouncilors = scoreAndSort(analysis.playerAvailableCouncilors, w, pc, getBaseCouncilorScore);
    const scoredBaseCouncilors = scoreAndSort(analysis.playerCouncilors, w, pc, getBaseCouncilorScore);
    const scoredOrgs = scoreAndSort(
      analysis.playerAvailableOrgs.map((i) => ({ type: "available", ...i })).concat(analysis.playerUnassignedOrgs.map((i) => ({ type: "unassigned", ...i }))),
      w, pc, getOrganizationScore, "noMissionScore"
    ).toSorted((a, b) => (a.isAdminOrg === b.isAdminOrg ? 0 : a.isAdminOrg ? -1 : 1));
    const usedOrgs = analysis.playerCouncilors.flatMap((c) => c.orgs.map((o) => ({ ...o, type: "used", councilor: c.displayName, councilorId: c.id })));
    const scoredOwnedOrgs = scoreAndSort(usedOrgs, w, pc, getOrganizationScore);
    const councilEffects = scoredModifiedCouncilors.reduce((acc, c) => combineEffects(acc, c.effectsWithOrgsAndAugments), {} as ShowEffectsProps);

    const scoredStealableOrgs = scoreAndSort(analysis.playerStealableOrgs.map((i) => ({ type: "stealable", ...i })), w, pc, getOrganizationScore, "noMissionScore");
    const stealableOrgsByFaction = scoredStealableOrgs.reduce((acc, org) => {
      const key = org.faction?.id || 0;
      if (!acc.has(key)) acc.set(key, []);
      acc.get(key)!.push(org);
      return acc;
    }, new Map<number, typeof scoredOrgs>());

    type MissionSource = { type: "councilor"; councilor: Analysis["playerCouncilors"][number]; factionId: number | undefined; missions: MissionDataName[] } | { type: "org"; org: Analysis["playerAvailableOrgs"][number]; factionId: number | undefined; missions: MissionDataName[] } | { type: "org"; org: Analysis["playerStealableOrgs"][number]; factionId: number | undefined; missions: MissionDataName[] };
    const allMissionSources: MissionSource[] = [
      ...[...analysis.playerCouncilors, ...analysis.playerVisibleCouncilors].map((i) => ({ type: "councilor" as const, councilor: i, factionId: i.factionId, missions: i.effectsWithOrgsAndAugments.missionsGrantedNames || [] })),
      ...[...analysis.playerAvailableOrgs, ...analysis.playerUnassignedOrgs].map((i) => ({ type: "org" as const, org: i, factionId: analysis.playerFaction?.id, missions: i.template?.missionsGrantedNames || [] })),
      ...analysis.playerStealableOrgs.map((i) => ({ type: "org" as const, org: i, factionId: (i as unknown as { faction?: { id: number } }).faction?.id, missions: i.template?.missionsGrantedNames || [] })),
    ];
    const sourcesByFactionByMission = allMissionSources.reduce((acc, o) => {
      const key = o.factionId || 0;
      if (!acc.has(key)) acc.set(key, new Map<string, MissionSource[]>());
      const effectsMap = acc.get(key)!;
      o.missions.forEach((m) => { if (!effectsMap.has(m)) effectsMap.set(m, []); effectsMap.get(m)!.push(o); });
      return acc;
    }, new Map<number, Map<string, MissionSource[]>>());

    const factions = Array.from(sourcesByFactionByMission.keys())
      .map((fid) => analysis.factionsById.get(fid)!)
      .filter((f) => f)
      .toSorted((a, b) => { if (a.id === analysis.playerFaction.id) return -1; if (b.id === analysis.playerFaction.id) return 1; return (a.displayName || "").localeCompare(b.displayName || ""); });

    const playerNationIds = new Set(analysis.playerNationIds);
    const playerTraits = new Set(analysis.playerCouncilors.flatMap((i) => i.traitTemplateNames));
    const unusedAdmin = analysis.playerCouncilors
      .map((c) => Math.min(25, Math.max(0, (c.effectsWithOrgsAndAugments.Administration || 0) + (c.effectsWithOrgsAndAugments.administration || 0))) - c.orgs.reduce((a, b) => a + b.tier, 0))
      .reduce((a, b) => a + b, 0);

    return { weights: w, setWeights: (() => {}) as (w: ScoringWeights) => void, scoredModifiedCouncilors, scoredAvailableCouncilors, scoredBaseCouncilors, scoredOrgs, scoredOwnedOrgs, scoredUsedOrgs: scoreAndSort(usedOrgs, w, pc, getOrganizationScore), councilEffects, stealableOrgsByFaction, sourcesByFactionByMission, factions, playerNationIds, playerTraits, unusedAdmin };
  }, [analysis]);

  const [selected, setSelected] = useState<string>("councilors-existing");

  const highlightMissionClassName = useCallback((missionName: MissionDataName) => {
    const count = analysis.playerMissionCounts.get(missionName) || 0;
    if (count === 2) return "bg-yellow-300/50";
    if (count === 1) return "bg-red-300/50";
  }, [analysis.playerMissionCounts]);

  const availableHighlightMissionClassName = useCallback((missionName: MissionDataName) => {
    const count = analysis.playerMissionCounts.get(missionName) || 0;
    if (count === 1) return "bg-yellow-300/50";
    if (count === 0) return "bg-green-300/50";
  }, [analysis.playerMissionCounts]);

  const content = useMemo(() => {
    const map: Record<string, React.ReactNode> = {
      // Councilors sections
      "councilors-score": <CouncilorScoreSection analysis={analysis} />,
      "councilors-existing": <ManageCouncilSection scoredModifiedCouncilors={scoredModifiedCouncilors} scoredOrgs={scoredOrgs} playerNationIds={playerNationIds} playerTraits={playerTraits} unusedAdmin={unusedAdmin} highlightMissionClassName={highlightMissionClassName} availableHighlightMissionClassName={availableHighlightMissionClassName} councilEffects={councilEffects} />,
      "councilors-find-new": <FindNewCouncilorsSection scoredAvailableCouncilors={scoredAvailableCouncilors} scoredBaseCouncilors={scoredBaseCouncilors} highlightMissionClassName={highlightMissionClassName} availableHighlightMissionClassName={availableHighlightMissionClassName} />,
      "councilors-current-orgs": <CurrentOrgsSection scoredOwnedOrgs={scoredOwnedOrgs} playerNationIds={playerNationIds} playerTraits={playerTraits} availableHighlightMissionClassName={availableHighlightMissionClassName} />,
      "councilors-takeover": <HostileTakeoverSection stealableOrgsByFaction={stealableOrgsByFaction} playerNationIds={playerNationIds} playerTraits={playerTraits} availableHighlightMissionClassName={availableHighlightMissionClassName} />,
      "councilors-missions": <MissionsSection sourcesByFactionByMission={sourcesByFactionByMission} factions={factions} playerNationIds={playerNationIds} playerTraits={playerTraits} />,
      "councilors-other": <OtherCouncilorsSection analysis={analysis} weights={weights} />,
      // Fleets sections
      "fleets-alien": <AlienFleetsSection analysis={analysis} />,
      "fleets-human": <HumanEnemyFleetsSection analysis={analysis} />,
      "fleets-player": <PlayerFleetsSection analysis={analysis} />,
      "fleets-construction": <ShipsUnderConstructionSection analysis={analysis} />,
      // Habs sections
      "habs-current-bonuses": <CurrentBonusesSection effects={analysis.playerHabs.reduce((a, h) => combineEffects(a, h.activeEffects), {} as ShowEffectsProps)} />,
      "habs-future-bonuses": <FutureBonusesSection effects={analysis.playerHabs.reduce((a, h) => combineEffects(a, h.potentialEffects), {} as ShowEffectsProps)} />,
      "habs-mc-boost": <McBoostSummarySection analysis={analysis} />,
      "habs-alien-hate": <AlienHateSection analysis={analysis} />,
      "habs-building": <BuildingDetailsSection analysis={analysis} />,
      "habs-projects": <AvailableProjectsSection analysis={analysis} />,
      "habs-tech-goals": <TechnologyGoalsSection analysis={analysis} />,
      "habs-manage": <ManageHabsSection analysis={analysis} />,
      "habs-mines": <ManageMinesSection analysis={analysis} />,
      // Resources sections
      "resources-transactions": <TransactionsSection analysis={analysis} />,
      "resources-owned": <OwnedNationsSection analysis={analysis} />,
      "resources-spoils": <SpoilTargetsSection analysis={analysis} />,
      "resources-mc-boost": <McBoostTargetsSection analysis={analysis} />,
      "resources-claims": <NationClaimsSection analysis={analysis} />,
      "resources-unification": <UnificationCandidatesSection analysis={analysis} />,
      // Drives sections
      "drives-systems": <DriveSystemsSection analysis={analysis} />,
      "drives-calculator": <DriveCalculatorSection analysis={analysis} />,
    };
    return map;
  }, [analysis, scoredModifiedCouncilors, scoredOrgs, playerNationIds, playerTraits, unusedAdmin, highlightMissionClassName, availableHighlightMissionClassName, councilEffects, scoredAvailableCouncilors, scoredBaseCouncilors, scoredOwnedOrgs, stealableOrgsByFaction, sourcesByFactionByMission, factions, weights]);

  return (
    <GameSidebar treeItems={allTreeItems} defaultExpanded={defaultExpanded} analysis={analysis}>
      {content[selected!] || <div className="text-muted-foreground">Select an item from the tree to view details.</div>}
    </GameSidebar>
  );
}

function CouncilorScoreSection({ analysis }: { analysis: Analysis }) {
  const [weights, setWeights] = useState<ScoringWeights>(defaultScoringWeights);
  useEffect(() => { setWeights(loadWeightsFromStorage()); }, []);

  const { playerMissionCounts } = analysis;
  const scoredAvailable = scoreAndSort(analysis.playerAvailableCouncilors, weights, playerMissionCounts, getBaseCouncilorScore);
  const scoredBase = scoreAndSort(analysis.playerCouncilors, weights, playerMissionCounts, getBaseCouncilorScore);
  const scoredUsedOrgs = scoreAndSort(
    analysis.playerCouncilors.flatMap((c) => c.orgs.map((o) => ({ ...o, type: "used", councilor: c.displayName, councilorId: c.id }))),
    weights, playerMissionCounts, getOrganizationScore
  );
  const scoredOrgs = scoreAndSort(
    analysis.playerAvailableOrgs.map((i) => ({ type: "available", ...i })).concat(analysis.playerUnassignedOrgs.map((i) => ({ type: "unassigned", ...i }))),
    weights, playerMissionCounts, getOrganizationScore, "noMissionScore"
  ).toSorted((a, b) => (a.isAdminOrg === b.isAdminOrg ? 0 : a.isAdminOrg ? -1 : 1));

  const bestAvailable = scoredAvailable[0]?.score.value;
  const worstExisting = scoredBase[scoredBase.length - 1]?.score.value;
  const bestOrg = scoredOrgs[0]?.score.value;
  const worstOrg = scoredUsedOrgs[scoredUsedOrgs.length - 1]?.score.value;

  return (
    <div className="space-y-4">
      <div className="p-4 bg-muted/30 rounded-lg space-y-2">
        <h2 className="text-lg font-semibold">Councilor Scoring Summary</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground">Best Available Councilor</div>
            <div className="text-xl font-bold">{bestAvailable?.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Worst Existing Councilor</div>
            <div className="text-xl font-bold">{worstExisting?.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Best Available Org</div>
            <div className="text-xl font-bold">{bestOrg?.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Worst Owned Org</div>
            <div className="text-xl font-bold">{worstOrg?.toFixed(2)}</div>
          </div>
        </div>
      </div>
      <div className="flex justify-end">
        <ScoringWeightsDialog weights={weights} onWeightsChange={setWeights} />
      </div>
    </div>
  );
}

// Keep scoring utilities local to avoid duplication issues
function scoreAndSort<T>(items: T[], weights: ScoringWeights, haveMissions: Map<MissionDataName, number>, scoreFn: (item: T, weights: ScoringWeights, haveMissions: Map<MissionDataName, number>) => ScoreResult, scoreSort: "value" | "noMissionScore" = "value") {
  const scoredItems = items.map((item) => { const r = scoreFn(item, weights, haveMissions); return { ...item, score: r }; });
  scoredItems.sort((a, b) => b.score[scoreSort] - a.score[scoreSort]);
  return scoredItems;
}

function getBaseCouncilorScore(councilor: Analysis["playerCouncilors"][number], weights: ScoringWeights, haveMissions: Map<MissionDataName, number>): ScoreResult {
  return getScore(councilor.effectsBaseAndUnaugmentedTraits, weights, haveMissions, true);
}

function getModifiedCouncilorScore(councilor: Analysis["playerCouncilors"][number], weights: ScoringWeights, haveMissions: Map<MissionDataName, number>): ScoreResult {
  return getScore(councilor.effectsWithOrgsAndAugments, weights, haveMissions, true);
}

const orgTransferFactor = 0.2;
function getOrganizationScore(org: Analysis["playerAvailableOrgs"][number] & { type: string }, weights: ScoringWeights, haveMissions: Map<MissionDataName, number>): ScoreResult {
  return getScore({ ...org, techBonuses: org.template?.techBonuses, missionsGrantedNames: org.template?.missionsGrantedNames || [], ...(org.type === "available" ? {} : { costMoney: (org.costMoney || 0) * orgTransferFactor, costInfluence: (org.costInfluence || 0) * orgTransferFactor, costOps: (org.costOps || 0) * orgTransferFactor, costBoost: (org.costBoost || 0) * orgTransferFactor }) }, weights, haveMissions);
}

function getScore(org: ShowEffectsProps, weights: ScoringWeights, haveMissions: Map<MissionDataName, number>, ignoreTier: boolean = false): ScoreResult {
  let totalScore = 0;
  const details: string[] = [];
  const addScore = (name: string, value: number | undefined, weight: number | undefined, noNegative?: boolean) => {
    let v = value || 0; if (noNegative) v = Math.max(0, v);
    const w = weight ?? 0; if (!v || !w) return;
    totalScore += v * w;
    details.push(`${name}: ${parseFloat(v.toFixed(2))} × ${parseFloat(w.toFixed(3))} = ${(v * w).toFixed(3)}`);
  };
  addScore("persuasion", org.persuasion, weights.persuasion, true);
  addScore("command", org.command, weights.command, true);
  addScore("investigation", org.investigation, weights.investigation, true);
  addScore("espionage", org.espionage, weights.espionage, true);
  addScore("administration", org.administration, weights.administration, true);
  addScore("science", org.science, weights.science, true);
  addScore("security", org.security, weights.security, true);
  addScore("Persuasion", org.Persuasion, weights.persuasion, true);
  addScore("Command", org.Command, weights.command, true);
  addScore("Investigation", org.Investigation, weights.investigation, true);
  addScore("Espionage", org.Espionage, weights.espionage, true);
  addScore("Administration", org.Administration, weights.administration, true);
  addScore("Science", org.Science, weights.science, true);
  addScore("Security", org.Security, weights.security, true);
  addScore("xpModifier", org.xpModifier, weights.xpModifier);
  addScore("xp", org.xp, weights.xp);
  addScore("incomeBoost_month", org.incomeBoost_month, weights.incomeBoost_month);
  addScore("incomeMoney_month", org.incomeMoney_month, weights.incomeMoney_month);
  addScore("incomeInfluence_month", org.incomeInfluence_month, weights.incomeInfluence_month);
  addScore("incomeOps_month", org.incomeOps_month, weights.incomeOps_month);
  addScore("incomeMissionControl", org.incomeMissionControl, weights.incomeMissionControl);
  addScore("incomeResearch_month", org.incomeResearch_month, weights.incomeResearch_month);
  addScore("projectCapacityGranted", org.projectCapacityGranted, weights.projectCapacityGranted);
  addScore("costMoney", org.costMoney, weights.costMoney);
  addScore("costInfluence", org.costInfluence, weights.costInfluence);
  addScore("costOps", org.costOps, weights.costOps);
  addScore("costBoost", org.costBoost, weights.costBoost);
  addScore("economyBonus", org.economyBonus, weights.economyBonus);
  addScore("welfareBonus", org.welfareBonus, weights.welfareBonus);
  addScore("environmentBonus", org.environmentBonus, weights.environmentBonus);
  addScore("knowledgeBonus", org.knowledgeBonus, weights.knowledgeBonus);
  addScore("governmentBonus", org.governmentBonus, weights.governmentBonus);
  addScore("unityBonus", org.unityBonus, weights.unityBonus);
  addScore("militaryBonus", org.militaryBonus, weights.militaryBonus);
  addScore("oppressionBonus", org.oppressionBonus, weights.oppressionBonus);
  addScore("spoilsBonus", org.spoilsBonus, weights.spoilsBonus);
  addScore("spaceDevBonus", org.spaceDevBonus, weights.spaceDevBonus);
  addScore("spaceflightBonus", org.spaceflightBonus, weights.spaceflightBonus);
  addScore("MCBonus", org.MCBonus, weights.MCBonus);
  addScore("miningBonus", org.miningBonus, weights.miningBonus);
  if (weights.councilorTechBonus && org?.councilorTechBonus) for (const { category, bonus } of org.councilorTechBonus) { const w = weights.councilorTechBonus[category]; addScore(`councilorTechBonus[${category}]`, bonus, w); }
  if (weights.techBonuses && org?.techBonuses) for (const { category, bonus } of org.techBonuses) { const w = weights.techBonuses[category]; addScore(`techBonus[${category}]`, bonus, w); }
  let noMissionScore = totalScore;
  if (weights.missions && org?.missionsGrantedNames) {
    for (const missionName of org.missionsGrantedNames) {
      const weight = weights.missions[missionName];
      addScore(`mission[${missionName}]`, 1, weight);
      if (weights.extraWeightForMissingMissions && (haveMissions.get(missionName) || 0) === 0) { totalScore += weights.extraWeightForMissingMissions; details.push(`mission[${missionName}]: missing bonus × ${weights.extraWeightForMissingMissions.toFixed(3)}`); }
      if (weights.extraWeightForSingleMissions && (haveMissions.get(missionName) || 0) === 1) { totalScore += weights.extraWeightForSingleMissions; details.push(`mission[${missionName}]: single bonus × ${weights.extraWeightForSingleMissions.toFixed(3)}`); }
    }
  }
  const tier = org.tier || 1;
  let finalScore = totalScore;
  if (tier > 1 && !ignoreTier) { const tf = Math.pow(tier, weights.orgTierExponent); finalScore = totalScore / tf; noMissionScore /= tf; }
  return { value: finalScore, noMissionScore, details: details.join("\n") };
}
