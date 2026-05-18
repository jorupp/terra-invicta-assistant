"use client";

import { Analysis } from "@/lib/analysis";
import { SmartAccordion } from "@/components/ui/smart-accordion";
import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { SmartTabs } from "@/components/ui/smart-tabs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ShowEffects, ShowEffectsProps, combineEffects } from "@/components/showEffects";
import { FactionIcons, MissionIcons, UnknownIcon } from "@/components/icons";
import { defaultScoringWeights, loadWeightsFromStorage, ScoringWeights, ScoringWeightsDialog } from "../scoringWeights";
import { MissionDataName } from "@/lib/template-types-generated";
import { twMerge } from "tailwind-merge";
import { useState, useEffect } from "react";

type ScoreResult = { value: number; noMissionScore: number; details: string };

function getScore(
  stats: ShowEffectsProps,
  weights: ScoringWeights,
  haveMissions: Map<MissionDataName, number>,
  ignoreTier: boolean = false
): ScoreResult {
  let totalScore = 0;
  const details: string[] = [];
  const addScore = (name: string, value: number | undefined, weight: number | undefined, noNegative?: boolean) => {
    let actualValue = value || 0;
    if (noNegative) actualValue = Math.max(0, actualValue);
    const actualWeight = weight ?? 0;
    if (!actualValue || !actualWeight) return;
    const contribution = actualValue * actualWeight;
    totalScore += contribution;
    details.push(`${name}: ${parseFloat(actualValue.toFixed(2))} x ${parseFloat(actualWeight.toFixed(3))} = ${contribution.toFixed(3)}`);
  };

  addScore("persuasion", stats.persuasion, weights.persuasion, true);
  addScore("command", stats.command, weights.command, true);
  addScore("investigation", stats.investigation, weights.investigation, true);
  addScore("espionage", stats.espionage, weights.espionage, true);
  addScore("administration", stats.administration, weights.administration, true);
  addScore("science", stats.science, weights.science, true);
  addScore("security", stats.security, weights.security, true);
  addScore("Persuasion", stats.Persuasion, weights.persuasion, true);
  addScore("Command", stats.Command, weights.command, true);
  addScore("Investigation", stats.Investigation, weights.investigation, true);
  addScore("Espionage", stats.Espionage, weights.espionage, true);
  addScore("Administration", stats.Administration, weights.administration, true);
  addScore("Science", stats.Science, weights.science, true);
  addScore("Security", stats.Security, weights.security, true);
  addScore("xpModifier", stats.xpModifier, weights.xpModifier);
  addScore("xp", stats.xp, weights.xp);
  addScore("incomeBoost_month", stats.incomeBoost_month, weights.incomeBoost_month);
  addScore("incomeMoney_month", stats.incomeMoney_month, weights.incomeMoney_month);
  addScore("incomeInfluence_month", stats.incomeInfluence_month, weights.incomeInfluence_month);
  addScore("incomeOps_month", stats.incomeOps_month, weights.incomeOps_month);
  addScore("incomeMissionControl", stats.incomeMissionControl, weights.incomeMissionControl);
  addScore("incomeResearch_month", stats.incomeResearch_month, weights.incomeResearch_month);
  addScore("projectCapacityGranted", stats.projectCapacityGranted, weights.projectCapacityGranted);
  addScore("costMoney", stats.costMoney, weights.costMoney);
  addScore("costInfluence", stats.costInfluence, weights.costInfluence);
  addScore("costOps", stats.costOps, weights.costOps);
  addScore("costBoost", stats.costBoost, weights.costBoost);
  addScore("economyBonus", stats.economyBonus, weights.economyBonus);
  addScore("welfareBonus", stats.welfareBonus, weights.welfareBonus);
  addScore("environmentBonus", stats.environmentBonus, weights.environmentBonus);
  addScore("knowledgeBonus", stats.knowledgeBonus, weights.knowledgeBonus);
  addScore("governmentBonus", stats.governmentBonus, weights.governmentBonus);
  addScore("unityBonus", stats.unityBonus, weights.unityBonus);
  addScore("militaryBonus", stats.militaryBonus, weights.militaryBonus);
  addScore("oppressionBonus", stats.oppressionBonus, weights.oppressionBonus);
  addScore("spoilsBonus", stats.spoilsBonus, weights.spoilsBonus);
  addScore("spaceDevBonus", stats.spaceDevBonus, weights.spaceDevBonus);
  addScore("spaceflightBonus", stats.spaceflightBonus, weights.spaceflightBonus);
  addScore("MCBonus", stats.MCBonus, weights.MCBonus);
  addScore("miningBonus", stats.miningBonus, weights.miningBonus);

  if (weights.councilorTechBonus && stats?.councilorTechBonus) {
    for (const { category, bonus } of stats.councilorTechBonus) {
      const weight = weights.councilorTechBonus?.[category];
      addScore(`councilorTechBonus[${category}]`, bonus, weight);
    }
  }
  if (weights.techBonuses && stats?.techBonuses) {
    for (const { category, bonus } of stats.techBonuses) {
      const weight = weights.techBonuses?.[category];
      addScore(`techBonus[${category}]`, bonus, weight);
    }
  }

  let noMissionScore = totalScore;
  if (weights.missions && stats?.missionsGrantedNames) {
    for (const missionName of stats.missionsGrantedNames) {
      const weight = weights.missions?.[missionName];
      addScore(`mission[${missionName}]`, 1, weight);
      if (weights.extraWeightForMissingMissions && (haveMissions.get(missionName) || 0) === 0) {
        totalScore += weights.extraWeightForMissingMissions;
        details.push(`mission[${missionName}]: missing bonus x ${parseFloat(weights.extraWeightForMissingMissions.toFixed(3))} = ${weights.extraWeightForMissingMissions.toFixed(3)}`);
      }
      if (weights.extraWeightForSingleMissions && (haveMissions.get(missionName) || 0) === 1) {
        totalScore += weights.extraWeightForSingleMissions;
        details.push(`mission[${missionName}]: single bonus x ${parseFloat(weights.extraWeightForSingleMissions.toFixed(3))} = ${weights.extraWeightForSingleMissions.toFixed(3)}`);
      }
    }
  }

  const tier = stats.tier || 1;
  let finalScore = totalScore;
  if (tier > 1 && !ignoreTier) {
    const tierFactor = Math.pow(tier, weights.orgTierExponent ?? 1);
    finalScore = totalScore / tierFactor;
    noMissionScore /= tierFactor;
    details.push(`Subtotal: ${totalScore.toFixed(3)}`);
    details.push(`Divided by ${tierFactor.toFixed(2)} for tier ${tier}: ${finalScore.toFixed(3)}`);
  }
  return { value: finalScore, noMissionScore, details: details.join("\n") };
}

function scoreAndSort<T>(
  items: T[],
  weights: ScoringWeights,
  haveMissions: Map<MissionDataName, number>,
  scoreFn: (item: T, weights: ScoringWeights, haveMissions: Map<MissionDataName, number>) => ScoreResult,
  scoreSort: "value" | "noMissionScore" = "value"
) {
  const scoredItems = items.map((item) => ({ ...item, score: scoreFn(item, weights, haveMissions) }));
  scoredItems.sort((a: any, b: any) => b.score[scoreSort] - a.score[scoreSort]);
  return scoredItems;
}

function getBaseCouncilorScore(councilor: any, weights: ScoringWeights, haveMissions: Map<MissionDataName, number>): ScoreResult {
  return getScore(councilor.effectsBaseAndUnaugmentedTraits, weights, haveMissions, true);
}

function getModifiedCouncilorScore(councilor: any, weights: ScoringWeights, haveMissions: Map<MissionDataName, number>): ScoreResult {
  return getScore(councilor.effectsWithOrgsAndAugments, weights, haveMissions, true);
}

function getOrganizationScore(org: any, weights: ScoringWeights, haveMissions: Map<MissionDataName, number>): ScoreResult {
  const orgTransferFactor = 0.2;
  return getScore({
    ...org,
    techBonuses: org.template?.techBonuses,
    missionsGrantedNames: org.template?.missionsGrantedNames || [],
    ...(org.type === "available" ? {} : {
      costMoney: (org.costMoney || 0) * orgTransferFactor,
      costInfluence: (org.costInfluence || 0) * orgTransferFactor,
      costOps: (org.costOps || 0) * orgTransferFactor,
      costBoost: (org.costBoost || 0) * orgTransferFactor,
    }),
  }, weights, haveMissions);
}

const orgTransferFactor = 0.2;

function ShowEffectsCell(props: ShowEffectsProps) {
  return <ShowEffects {...props} />;
}

function CouncilorTableRow({ councilor, label, hasOrgs, highlightMissionClassName }: {
  councilor: any;
  label: string;
  hasOrgs?: boolean;
  highlightMissionClassName?: (missionName: MissionDataName) => string | undefined;
}) {
  const stats = councilor.effectsWithOrgsAndAugments || councilor.effectsBaseAndUnaugmentedTraits;
  const admin = Math.min(25, Math.max(0, (stats.administration || 0) + (stats.Administration || 0)));
  const orgTiers = councilor.orgs?.reduce((a: number, b: any) => a + b.tier, 0) || 0;
  const cpCap =
    Math.min(25, Math.max(0, stats.persuasion || 0) + Math.max(0, stats.Persuasion || 0)) +
    Math.min(25, Math.max(0, stats.command || 0) + Math.max(0, stats.Command || 0)) +
    Math.min(25, Math.max(0, stats.administration || 0) + Math.max(0, stats.Administration || 0));

  return (
    <TableRow key={`${councilor.id}-${label}`}>
      <TableCell>{label}</TableCell>
      <TableCell>
        <ShowEffectsCell
          persuasion={stats.persuasion} command={stats.command} investigation={stats.investigation}
          espionage={stats.espionage} administration={stats.administration} science={stats.science}
          security={stats.security} Persuasion={stats.Persuasion} Command={stats.Command}
          Investigation={stats.Investigation} Espionage={stats.Espionage} Administration={stats.Administration}
          Science={stats.Science} Security={stats.Security} ApparentLoyalty={stats.ApparentLoyalty}
          Loyalty={stats.Loyalty} maxLoyalty={stats.maxLoyalty} xpModifier={stats.xpModifier}
          xp={stats.xp} traitTemplateNames={stats.traitTemplateNames} typeTemplateName={stats.typeTemplateName}
          playerIntel={stats.playerIntel} playerMaxIntel={stats.playerMaxIntel}
          lastRecordedLoyalty={stats.lastRecordedLoyalty} />
      </TableCell>
      {hasOrgs && <TableCell><ShowEffectsCell tier={stats.tier} /></TableCell>}
      <TableCell>
        <ShowEffectsCell
          incomeBoost_month={stats.incomeBoost_month} incomeMoney_month={stats.incomeMoney_month}
          incomeInfluence_month={stats.incomeInfluence_month} incomeOps_month={stats.incomeOps_month}
          incomeMissionControl={stats.incomeMissionControl} incomeResearch_month={stats.incomeResearch_month}
          projectCapacityGranted={stats.projectCapacityGranted} />
      </TableCell>
      <TableCell>
        <span className="text-wrap leading-6 -my-2 inline-block">
          <ShowEffectsCell
            economyBonus={stats.economyBonus} welfareBonus={stats.welfareBonus} environmentBonus={stats.environmentBonus}
            knowledgeBonus={stats.knowledgeBonus} governmentBonus={stats.governmentBonus} unityBonus={stats.unityBonus}
            militaryBonus={stats.militaryBonus} oppressionBonus={stats.oppressionBonus} spoilsBonus={stats.spoilsBonus}
            spaceDevBonus={stats.spaceDevBonus} spaceflightBonus={stats.spaceflightBonus} MCBonus={stats.MCBonus}
            miningBonus={stats.miningBonus} />
        </span>
      </TableCell>
      <TableCell>
        <span className="text-wrap leading-6 -my-2 inline-block">
          <ShowEffectsCell councilorTechBonus={stats.councilorTechBonus} techBonuses={stats.techBonuses} />
        </span>
      </TableCell>
      <TableCell>
        <span className="text-wrap leading-6 -my-2 inline-block">
          <ShowEffectsCell missionsGrantedNames={stats.missionsGrantedNames} />
        </span>
      </TableCell>
      {councilor.score === undefined ? null : (
        <>
          <TableCell>
            <Tooltip><TooltipTrigger>{councilor.score.value?.toFixed(2)}</TooltipTrigger>
              <TooltipContent align="end" className="max-w-auto"><pre className="p-2">{councilor.score.details}</pre></TooltipContent>
            </Tooltip>
          </TableCell>
          <TableCell>{councilor.score.noMissionScore?.toFixed(2)}</TableCell>
          <TableCell>{cpCap?.toFixed(0)}</TableCell>
        </>
      )}
    </TableRow>
  );
}

function OrgTableRow({ org, playerNationIds, playerTraits, highlightMissionClassName, isTakeover }: {
  org: any;
  playerNationIds: Set<number>;
  playerTraits: Set<string>;
  highlightMissionClassName?: (missionName: MissionDataName) => string | undefined;
  isTakeover?: boolean;
}) {
  return (
    <TableRow key={org.id} className={twMerge(org.isAdminOrg ? "bg-green-100" : "", org.type === "unassigned" ? "bg-yellow-100" : "")}>
      <TableCell>{org.displayName}</TableCell>
      <TableCell>
        {org.template?.requiresNationality && (
          <span className="mr-1">
            {playerNationIds.has(org.homeNationId || -1) ? <span className="inline h-4 w-4 stroke-green-700">+</span> : <span className="inline h-4 w-4 stroke-destructive">-</span>}
          </span>
        )}
        {org.template?.requiredOwnerTraits && (
          <span className="mr-1">
            {org.template.requiredOwnerTraits.map((trait: string, ix: number) => {
              const has = playerTraits.has(trait);
              return <span key={ix} className={has ? "inline h-4 w-4 stroke-green-700" : "inline h-4 w-4 stroke-destructive"}>{has ? "+" : "-"}</span>;
            })}
          </span>
        )}
      </TableCell>
      <TableCell><ShowEffectsCell tier={org.tier} /></TableCell>
      <TableCell>
        {org.type === "unassigned" && "T "}
        {org.type === "available" || org.type === "unassigned" ? (
          <ShowEffectsCell costMoney={(org.costMoney || 0) * 0.2} costInfluence={(org.costInfluence || 0) * 0.2}
            costOps={(org.costOps || 0) * 0.2} costBoost={(org.costBoost || 0) * 0.2} />
        ) : org.type == "stealable" && isTakeover ? (
          <><span>{org.councilor ?? "Unassigned"} from {(org as any).faction?.displayName ?? "Unknown"}, Admin: {(org as any).admin}, takeoverDefense: {(org as any).takeoverDefense}</span></>
        ) : org.type === "used" ? <span>{org.councilor ?? "Unassigned"}</span> : null}
      </TableCell>
      <TableCell>
        <ShowEffectsCell incomeBoost_month={org.incomeBoost_month} incomeMoney_month={org.incomeMoney_month}
          incomeInfluence_month={org.incomeInfluence_month} incomeOps_month={org.incomeOps_month}
          incomeMissionControl={org.incomeMissionControl} incomeResearch_month={org.incomeResearch_month}
          projectCapacityGranted={org.projectCapacityGranted} />
      </TableCell>
      <TableCell>
        <ShowEffectsCell persuasion={org.persuasion} command={org.command} investigation={org.investigation}
          espionage={org.espionage} administration={org.administration} science={org.science} security={org.security}
          economyBonus={org.economyBonus} welfareBonus={org.welfareBonus} environmentBonus={org.environmentBonus}
          knowledgeBonus={org.knowledgeBonus} governmentBonus={org.governmentBonus} unityBonus={org.unityBonus}
          militaryBonus={org.militaryBonus} oppressionBonus={org.oppressionBonus} spoilsBonus={org.spoilsBonus}
          spaceDevBonus={org.spaceDevBonus} spaceflightBonus={org.spaceflightBonus} MCBonus={org.MCBonus}
          miningBonus={org.miningBonus} techBonuses={org.template?.techBonuses}
          missionsGrantedNames={org.template?.missionsGrantedNames || []} />
      </TableCell>
      {org.score === undefined ? null : (
        <>
          <TableCell>
            <Tooltip><TooltipTrigger>{org.score.value?.toFixed(2)}</TooltipTrigger>
              <TooltipContent align="end" className="max-w-auto"><pre className="p-2">{org.score.details}</pre></TooltipContent>
            </Tooltip>
          </TableCell>
          <TableCell>{org.score.noMissionScore?.toFixed(2)}</TableCell>
        </>
      )}
    </TableRow>
  );
}

export function CouncilsSection({ analysis, mode }: { analysis: Analysis; mode?: string }) {
  const playerMissionCounts = analysis.playerMissionCounts;
  const [weights, setWeights] = useState<ScoringWeights>(loadWeightsFromStorage);
  const { playerMissionCounts: pmc, playerVisibleCouncilors, playerCouncilors, playerAvailableOrgs, playerUnassignedOrgs, playerFaction, playerStealableOrgs, factionsById } = analysis;

  const scoredModifiedCouncilors = scoreAndSort(playerCouncilors, weights, playerMissionCounts, getModifiedCouncilorScore);
  const scoredAvailableCouncilors = scoreAndSort(analysis.playerAvailableCouncilors, weights, playerMissionCounts, getBaseCouncilorScore);
  const scoredBaseCouncilors = scoreAndSort(playerCouncilors, weights, playerMissionCounts, getBaseCouncilorScore);
  const scoredOrgs = scoreAndSort(
    [...playerAvailableOrgs.map((i: any) => ({ type: "available", ...i })), ...playerUnassignedOrgs.map((i: any) => ({ type: "unassigned", ...i }))],
    weights, playerMissionCounts, getOrganizationScore, "noMissionScore"
  ).toSorted((a: any, b: any) => (a.isAdminOrg === b.isAdminOrg ? 0 : a.isAdminOrg ? -1 : 1));
  const usedOrgs = playerCouncilors.flatMap((councilor: any) => councilor.orgs.map((o: any) => ({ ...o, type: "used", councilor: councilor.displayName, councilorId: councilor.id })));
  const scoredUsedOrgs = scoreAndSort(usedOrgs, weights, playerMissionCounts, getOrganizationScore);
  const scoredOwnedOrgs = scoreAndSort([...playerUnassignedOrgs.map((i: any) => ({ type: "unassigned", ...i })), ...usedOrgs], weights, playerMissionCounts, getOrganizationScore);
  const scoredStealableOrgs = scoreAndSort(playerStealableOrgs.map((i: any) => ({ type: "stealable", ...i })), weights, playerMissionCounts, getOrganizationScore, "noMissionScore");

  function currentHighlightMissionClassName(missionName: MissionDataName) {
    const count = pmc.get(missionName) || 0;
    if (count === 2) return "bg-yellow-300/50";
    if (count === 1) return "bg-red-300/50";
  }
  function availableHighlightMissionClassName(missionName: MissionDataName) {
    const count = pmc.get(missionName) || 0;
    if (count === 1) return "bg-yellow-300/50";
    if (count === 0) return "bg-green-300/50";
  }
  const playerNationIds = new Set(analysis.playerNationIds);
  const playerTraits = new Set(analysis.playerCouncilors.flatMap((i: any) => i.traitTemplateNames));
  const unusedAdmin = playerCouncilors.map(
    (c: any) => Math.min(25, Math.max(0, (c.effectsWithOrgsAndAugments.Administration || 0) + (c.effectsWithOrgsAndAugments.administration || 0))) - c.orgs.reduce((a: number, b: any) => a + b.tier, 0)
  ).reduce((a: number, b: number) => a + b, 0);

  const stealableOrgsByFaction = scoredStealableOrgs.reduce((acc: any, org: any) => {
    const key = org.faction?.id || 0;
    if (!acc.has(key)) acc.set(key, []);
    acc.get(key)!.push(org);
    return acc;
  }, new Map());

  const sourcesByFactionByMission = ([...playerCouncilors, ...playerVisibleCouncilors].map((i: any) => ({ type: "councilor" as const, councilor: i, factionId: i.factionId, missions: i.effectsWithOrgsAndAugments.missionsGrantedNames || [] })) as any[])
    .concat([...playerAvailableOrgs, ...playerUnassignedOrgs].map((i: any) => ({ type: "org" as const, org: i, factionId: playerFaction?.id, missions: i.template?.missionsGrantedNames || [] })))
    .concat(playerStealableOrgs.map((i: any) => ({ type: "org" as const, org: i, factionId: i.faction?.id, missions: i.template?.missionsGrantedNames || [] })))
    .reduce((acc: any, o: any) => {
      const key = o.factionId || 0;
      if (!acc.has(key)) acc.set(key, new Map());
      const effectsMap = acc.get(key)!;
      o.missions.forEach((m: string) => { if (!effectsMap.has(m)) effectsMap.set(m, []); effectsMap.get(m)!.push(o); });
      return acc;
    }, new Map());
  const factions = Array.from(sourcesByFactionByMission.keys() as unknown[] as number[]).map((factionId: number) => factionsById.get(factionId)!).filter((f: any) => f).toSorted((a: any, b: any) => {
      if (a.id === playerFaction.id) return -1;
      if (b.id === playerFaction.id) return 1;
      return (a.displayName || "").localeCompare(b.displayName || "");
    });
  const importantMissions = ["Assassinate"];
  const councilEffects = scoredModifiedCouncilors.reduce((acc: any, councilor: any) => combineEffects(acc, councilor.effectsWithOrgsAndAugments), {});

  const councilorsByFactionId = scoreAndSort(playerVisibleCouncilors, weights, new Map(), getBaseCouncilorScore).reduce((acc: any, councilor: any) => {
    const factionId = councilor.factionId || 0;
    if (!factionId) return acc;
    if (!acc.has(factionId)) acc.set(factionId, []);
    acc.get(factionId)!.push(councilor);
    return acc;
  }, new Map());

  if (mode === "find-new") {
    return (
      <div className="space-y-4">
        <h3>Available Councilors:</h3>
        <Table>
          <TableHeader>
            <TableRow><TableHead>Name</TableHead><TableHead>Base Stats</TableHead><TableHead>Monthly Effects</TableHead><TableHead>Priorities</TableHead><TableHead>Science</TableHead><TableHead>Missions</TableHead><TableHead>Score</TableHead><TableHead>NM Score</TableHead></TableRow>
          </TableHeader>
          <TableBody>
            {scoredAvailableCouncilors.map((councilor: any) => (
              <CouncilorTableRow key={`${councilor.id}-available`} councilor={councilor} label={councilor.displayName!} highlightMissionClassName={availableHighlightMissionClassName} />
            ))}
          </TableBody>
        </Table>
        <h3>Unmodified Active Councilors:</h3>
        <Table>
          <TableHeader>
            <TableRow><TableHead>Name</TableHead><TableHead>Base Stats</TableHead><TableHead>Monthly Effects</TableHead><TableHead>Priorities</TableHead><TableHead>Science</TableHead><TableHead>Missions</TableHead><TableHead>Score</TableHead><TableHead>NM Score</TableHead></TableRow>
          </TableHeader>
          <TableBody>
            {scoredBaseCouncilors.map((councilor: any) => (
              <CouncilorTableRow key={`${councilor.id}-base`} councilor={councilor} label={councilor.displayName!} highlightMissionClassName={currentHighlightMissionClassName} />
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (mode === "current-orgs") {
    return (
      <div>
        <h3>Current Organizations:</h3>
        <Table>
          <TableHeader>
            <TableRow><TableHead>Org Name</TableHead><TableHead>Requirements</TableHead><TableHead>Tier</TableHead><TableHead>Councilor</TableHead><TableHead>Monthly</TableHead><TableHead>Effects</TableHead><TableHead>Score</TableHead><TableHead>NM Score</TableHead></TableRow>
          </TableHeader>
          <TableBody>
            {scoredOwnedOrgs.toReversed().map((org: any) => (
              <OrgTableRow key={org.id} org={org} playerNationIds={playerNationIds} playerTraits={playerTraits} highlightMissionClassName={availableHighlightMissionClassName} />
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (mode === "takeover") {
    return (
      <div>
        <SmartTabs storageKey="councilorsTakeoverTabs" defaultValue={`faction-${Array.from(stealableOrgsByFaction.keys())[0]}`}>
          <TabsList>
            {Array.from(stealableOrgsByFaction.entries() as any[]).map(([factionId, orgs]: [any, any]) => (
              <TabsTrigger key={factionId} value={`faction-${factionId}`}>
                {orgs[0].faction?.displayName || "Unknown Faction"} ({orgs.length})
              </TabsTrigger>
            ))}
          </TabsList>
          {Array.from(stealableOrgsByFaction.entries() as any[]).map(([factionId, orgs]: [any, any]) => (
            <TabsContent key={factionId} value={`faction-${factionId}`}>
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Org Name</TableHead><TableHead>Requirements</TableHead><TableHead>Tier</TableHead><TableHead>Takeover</TableHead><TableHead>Monthly</TableHead><TableHead>Effects</TableHead><TableHead>Score</TableHead><TableHead>NM Score</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {orgs.map((org: any) => (
                    <OrgTableRow key={org.id} org={org} playerNationIds={playerNationIds} playerTraits={playerTraits} highlightMissionClassName={availableHighlightMissionClassName} isTakeover />
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          ))}
        </SmartTabs>
      </div>
    );
  }

  if (mode === "missions") {
    return (
      <div>
        <SmartTabs storageKey="councilorsMissionsTabs" defaultValue={`faction-${factions[0]?.id}`}>
          <TabsList>
            {factions.map((faction: any) => (
              <TabsTrigger key={faction.id} value={`faction-${faction.id}`}>
                {faction.displayName || "Unknown Faction"} ({sourcesByFactionByMission.get(faction.id)?.size || 0})
                {importantMissions.filter((m: string) => sourcesByFactionByMission.get(faction.id)?.get(m)?.filter((i: any) => i.type === "councilor")?.length ?? 0 > 0).map((m: string) => {
                  const MissionIcon = MissionIcons[m] || UnknownIcon;
                  return <span key={m} className="inline-block -mt-2"><MissionIcon className="h-4 w-4" /></span>;
                })}
              </TabsTrigger>
            ))}
          </TabsList>
          {factions.map((faction: any) => (
            <TabsContent key={faction.id} value={`faction-${faction.id}`}>
              <SmartAccordion type="single" collapsible storageKey={`councilorsMissions-${faction.id}`}>
                {Array.from(new Set([...importantMissions, ...Array.from(sourcesByFactionByMission.get(faction.id)?.keys() || [])] as string[])).map((missionName: string) => {
                  const sources = sourcesByFactionByMission.get(faction.id)?.get(missionName) || [];
                  const MissionIcon = MissionIcons[missionName] || UnknownIcon;
                  return (
                    <AccordionItem key={missionName} value={missionName}>
                      <AccordionTrigger><span><MissionIcon /> {missionName} &ndash; {sources.filter((i: any) => i.type === "councilor").length} Councilors &lt;- {sources.filter((i: any) => i.type === "org").length} Orgs</span></AccordionTrigger>
                      <AccordionContent>
                        <Table>
                          <TableHeader>
                            <TableRow><TableHead>Name</TableHead><TableHead>Stats</TableHead><TableHead>Monthly</TableHead><TableHead>Effects</TableHead><TableHead>Score</TableHead><TableHead>NM Score</TableHead></TableRow>
                          </TableHeader>
                          <TableBody>
                            {sources?.map((src: any) =>
                              src.type === "org" ? (
                                <OrgTableRow key={`councilor-${src.org.id}-mission-${missionName}`} org={src.org} playerNationIds={playerNationIds} playerTraits={playerTraits} highlightMissionClassName={availableHighlightMissionClassName} />
                              ) : (
                                <CouncilorTableRow key={`org-${src.councilor.id}-mission-${missionName}`} councilor={src.councilor} label={src.councilor.displayName!} />
                              )
                            )}
                          </TableBody>
                        </Table>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </SmartAccordion>
            </TabsContent>
          ))}
        </SmartTabs>
      </div>
    );
  }

  if (mode === "other") {
    return (
      <div>
        <Tabs defaultValue={`faction-${factions[0]?.id || Array.from(councilorsByFactionId.keys())[0]}`}>
          <TabsList>
            {factions.filter((i: any) => i.id !== analysis.alienFaction.id).map((faction: any) => (
              <TabsTrigger key={faction.id} value={`faction-${faction.id}`}>
                {faction.displayName || "Unknown Faction"} ({councilorsByFactionId.get(faction.id)?.length || 0})
              </TabsTrigger>
            ))}
          </TabsList>
          {factions.filter((i: any) => i.id !== analysis.alienFaction.id).map((faction: any) => (
            <TabsContent key={faction.id} value={`faction-${faction.id}`}>
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Name</TableHead><TableHead>Base Stats</TableHead><TableHead>Monthly Effects</TableHead><TableHead>Priorities</TableHead><TableHead>Science</TableHead><TableHead>Missions</TableHead><TableHead>Score</TableHead><TableHead>NM Score</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {councilorsByFactionId.get(faction.id)?.map((councilor: any) => (
                    <CouncilorTableRow key={councilor.id} councilor={councilor} label={councilor.displayName!} highlightMissionClassName={availableHighlightMissionClassName} />
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    );
  }

  // Default: "existing" mode
  return (
    <div className="space-y-2">
      <SmartAccordion type="single" collapsible storageKey="councilorsExisting" defaultValue="existing">
        <AccordionItem value="existing">
          <AccordionTrigger><span>Manage Existing Council ({unusedAdmin.toFixed(0)} admin)</span></AccordionTrigger>
          <AccordionContent>
            <div className="py-1">
              <ShowEffectsCell incomeBoost_month={councilEffects.incomeBoost_month} incomeMoney_month={councilEffects.incomeMoney_month} incomeInfluence_month={councilEffects.incomeInfluence_month} incomeOps_month={councilEffects.incomeOps_month} incomeMissionControl={councilEffects.incomeMissionControl} incomeResearch_month={councilEffects.incomeResearch_month} projectCapacityGranted={councilEffects.projectCapacityGranted} />
              <ShowEffectsCell economyBonus={councilEffects.economyBonus} welfareBonus={councilEffects.welfareBonus} environmentBonus={councilEffects.environmentBonus} knowledgeBonus={councilEffects.knowledgeBonus} governmentBonus={councilEffects.governmentBonus} unityBonus={councilEffects.unityBonus} militaryBonus={councilEffects.militaryBonus} oppressionBonus={councilEffects.oppressionBonus} spoilsBonus={councilEffects.spoilsBonus} spaceDevBonus={councilEffects.spaceDevBonus} spaceflightBonus={councilEffects.spaceflightBonus} MCBonus={councilEffects.MCBonus} miningBonus={councilEffects.miningBonus} />
              <ShowEffectsCell councilorTechBonus={councilEffects.councilorTechBonus} techBonuses={councilEffects.techBonuses} />
            </div>
            <Table>
              <TableHeader>
                <TableRow><TableHead>Name</TableHead><TableHead>Modified Stats</TableHead><TableHead>Org Tiers</TableHead><TableHead>Monthly Effects</TableHead><TableHead>Priorities</TableHead><TableHead>Science</TableHead><TableHead>Missions</TableHead><TableHead>Score</TableHead><TableHead>NM Score</TableHead><TableHead>CP Cap</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {scoredModifiedCouncilors.map((councilor: any) => (
                  <CouncilorTableRow key={councilor.id} councilor={councilor} label={councilor.displayName!} hasOrgs highlightMissionClassName={currentHighlightMissionClassName} />
                ))}
              </TableBody>
            </Table>
            <h3 className="mt-1">Available Organizations:</h3>
            <Table>
              <TableHeader>
                <TableRow><TableHead>Org Name</TableHead><TableHead>Requirements</TableHead><TableHead>Tier</TableHead><TableHead>Purchase / Transfer</TableHead><TableHead>Monthly</TableHead><TableHead>Effects</TableHead><TableHead>Score</TableHead><TableHead>NM Score</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {scoredOrgs.map((org: any) => (
                  <OrgTableRow key={org.id} org={org} playerNationIds={playerNationIds} playerTraits={playerTraits} highlightMissionClassName={availableHighlightMissionClassName} />
                ))}
              </TableBody>
            </Table>
          </AccordionContent>
        </AccordionItem>
      </SmartAccordion>
      <div className="my-4"><ScoringWeightsDialog weights={weights} onWeightsChange={setWeights} /></div>
      <Collapsible>
        <CollapsibleTrigger asChild><Button variant="outline">Debug Data</Button></CollapsibleTrigger>
        <CollapsibleContent><pre>{JSON.stringify(analysis.playerFaction, null, 2)}</pre></CollapsibleContent>
      </Collapsible>
    </div>
  );
}
