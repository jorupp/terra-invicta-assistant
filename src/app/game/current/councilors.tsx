"use client";

import { useState, useEffect } from "react";
import { combineEffects, ShowEffects, ShowEffectsProps } from "@/components/showEffects";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SmartAccordion } from "@/components/ui/smart-accordion";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Analysis } from "@/lib/analysis";
import { MissionDataName, TraitDataName } from "@/lib/template-types-generated";
import { MinusCircleIcon, PlusCircleIcon, BarChart3, UsersRound, UserPlus, Landmark, Target, Users } from "lucide-react";
import { defaultScoringWeights, loadWeightsFromStorage, ScoringWeights, ScoringWeightsDialog } from "./scoringWeights";
import { Administration, MissionIcons, TraitIcons, UnknownIcon } from "@/components/icons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SmartTabs } from "@/components/ui/smart-tabs";
import { twMerge } from "tailwind-merge";
import { ContentPanel } from "./tree-nav";
import {
  scoreAndSort,
  getBaseCouncilorScore,
  getModifiedCouncilorScore,
  getOrganizationScore,
  orgTransferFactor,
  ScoringWeights as ScoringWeightsType,
  ScoreResult,
} from "./scoringUtility";

function CouncilorTableHeader({ hasOrgs }: { hasOrgs?: boolean }) {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>Name</TableHead>
        <TableHead>Modified Stats</TableHead>
        {hasOrgs && <TableHead>Org Tiers</TableHead>}
        <TableHead>Monthly Effects</TableHead>
        <TableHead>Priorities</TableHead>
        <TableHead>Science</TableHead>
        <TableHead>Missions</TableHead>
        <TableHead>Score</TableHead>
        <TableHead>NM Score</TableHead>
        <TableHead>CP Cap</TableHead>
      </TableRow>
    </TableHeader>
  );
}

function OrgTableHeader({ costHeader }: { costHeader?: string }) {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>Org Name</TableHead>
        <TableHead>Requirements</TableHead>
        <TableHead>Tier</TableHead>
        {costHeader ? <TableHead>{costHeader}</TableHead> : <TableHead>Purchase / Transfer</TableHead>}
        <TableHead>Monthly</TableHead>
        <TableHead>Effects</TableHead>
        <TableHead>Score</TableHead>
        <TableHead>NM Score</TableHead>
      </TableRow>
    </TableHeader>
  );
}

function CouncilorTableRow({
  councilor,
  stats,
  label,
  hasOrgs,
  highlightMissionClassName,
}: {
  councilor: Analysis["playerCouncilors"][number] & { score?: ScoreResult };
  stats: Analysis["playerCouncilors"][number]["effectsWithOrgsAndAugments"];
  label: string;
  hasOrgs?: boolean;
  highlightMissionClassName?: (missionName: MissionDataName) => string | undefined;
}) {
  const admin = Math.min(25, Math.max(0, (stats.administration || 0) + (stats.Administration || 0)));
  const orgTiers = councilor.orgs.reduce((a, b) => a + b.tier, 0);
  const cpCap =
    Math.min(25, Math.max(0, stats.persuasion || 0) + Math.max(0, stats.Persuasion || 0)) +
    Math.min(25, Math.max(0, stats.command || 0) + Math.max(0, stats.Command || 0)) +
    Math.min(25, Math.max(0, stats.administration || 0) + Math.max(0, stats.Administration || 0));
  return (
    <TableRow key={`${councilor.id}-${label}`}>
      <TableCell>{label}</TableCell>
      <TableCell>
        <ShowEffects
          persuasion={stats.persuasion}
          command={stats.command}
          investigation={stats.investigation}
          espionage={stats.espionage}
          administration={stats.administration}
          science={stats.science}
          security={stats.security}
          Persuasion={stats.Persuasion}
          Command={stats.Command}
          Investigation={stats.Investigation}
          Espionage={stats.Espionage}
          Administration={stats.Administration}
          Science={stats.Science}
          Security={stats.Security}
          ApparentLoyalty={stats.ApparentLoyalty}
          Loyalty={stats.Loyalty}
          maxLoyalty={stats.maxLoyalty}
          xpModifier={stats.xpModifier}
          xp={stats.xp}
          traitTemplateNames={stats.traitTemplateNames}
          typeTemplateName={stats.typeTemplateName}
          playerIntel={stats.playerIntel}
          playerMaxIntel={stats.playerMaxIntel}
          lastRecordedLoyalty={stats.lastRecordedLoyalty}
        />
      </TableCell>
      {hasOrgs && (
        <TableCell>
          <ShowEffects tier={stats.tier} highlightTier={orgTiers < admin} />
        </TableCell>
      )}
      <TableCell>
        <ShowEffects
          incomeBoost_month={stats.incomeBoost_month}
          incomeMoney_month={stats.incomeMoney_month}
          incomeInfluence_month={stats.incomeInfluence_month}
          incomeOps_month={stats.incomeOps_month}
          incomeMissionControl={stats.incomeMissionControl}
          incomeResearch_month={stats.incomeResearch_month}
          projectCapacityGranted={stats.projectCapacityGranted}
        />
      </TableCell>
      <TableCell>
        <span className="text-wrap leading-6 -my-2 inline-block">
          <ShowEffects
            economyBonus={stats.economyBonus}
            welfareBonus={stats.welfareBonus}
            environmentBonus={stats.environmentBonus}
            knowledgeBonus={stats.knowledgeBonus}
            governmentBonus={stats.governmentBonus}
            unityBonus={stats.unityBonus}
            militaryBonus={stats.militaryBonus}
            oppressionBonus={stats.oppressionBonus}
            spoilsBonus={stats.spoilsBonus}
            spaceDevBonus={stats.spaceDevBonus}
            spaceflightBonus={stats.spaceflightBonus}
            MCBonus={stats.MCBonus}
            miningBonus={stats.miningBonus}
          />
        </span>
      </TableCell>
      <TableCell>
        <span className="text-wrap leading-6 -my-2 inline-block">
          <ShowEffects councilorTechBonus={stats.councilorTechBonus} techBonuses={stats.techBonuses} />
        </span>
      </TableCell>
      <TableCell>
        <span className="text-wrap leading-6 -my-2 inline-block">
          <ShowEffects
            missionsGrantedNames={stats.missionsGrantedNames}
            highlightMissionClassName={highlightMissionClassName}
          />
        </span>
      </TableCell>
      {councilor.score === undefined ? null : (
        <>
          <TableCell>
            <Tooltip>
              <TooltipTrigger>{councilor.score.value?.toFixed(2)}</TooltipTrigger>
              <TooltipContent align="end" className="max-w-auto">
                <pre className="p-2">{councilor.score.details}</pre>
              </TooltipContent>
            </Tooltip>
          </TableCell>
          <TableCell>{councilor.score.noMissionScore?.toFixed(2)}</TableCell>
          <TableCell>{cpCap?.toFixed(0)}</TableCell>
        </>
      )}
    </TableRow>
  );
}

function OrgTableRow({
  org,
  playerNationIds,
  playerTraits,
  highlightMissionClassName,
  isTakeover,
}: {
  org: Analysis["playerAvailableOrgs"][number] & {
    type?: string;
    score?: ScoreResult;
    councilor?: string;
    councilorId?: number;
  };
  playerNationIds: Set<number>;
  playerTraits: Set<string>;
  highlightMissionClassName?: (missionName: MissionDataName) => string | undefined;
  isTakeover?: boolean;
}) {
  const missingRequiredTraits = org.template?.requiredOwnerTraits?.filter((t) => !playerTraits.has(t)) || [];
  function traitIcon(trait: TraitDataName, Fallback: typeof PlusCircleIcon) {
    return TraitIcons[trait] || Fallback;
  }
  return (
    <TableRow
      key={org.id}
      className={twMerge(org.isAdminOrg ? "bg-green-100" : "", org.type === "unassigned" ? "bg-yellow-100" : "")}
    >
      <TableCell>{org.displayName}</TableCell>
      <TableCell>
        {org.template?.requiresNationality && (
          <span className="mr-1" title={`Required Nation: ${org.homeNationName || ""}`}>
            {playerNationIds.has(org.homeNationId || -1) ? (
              <PlusCircleIcon className="inline h-4 w-4 stroke-green-700 -mt-1 bg-transparent" />
            ) : (
              <MinusCircleIcon className="inline h-4 w-4 stroke-destructive -mt-1" />
            )}
          </span>
        )}
        {org.template?.requiredOwnerTraits && (
          <span className="mr-1" title={"Required Traits: " + org.template.requiredOwnerTraits.join(", ")}>
            {missingRequiredTraits.length === 0
              ? org.template.requiredOwnerTraits.map((trait, ix) => {
                  const Icon = traitIcon(trait, PlusCircleIcon);
                  return <Icon key={ix} className="inline h-4 w-4 stroke-green-700 -mt-1" />;
                })
              : missingRequiredTraits.map((trait, ix) => {
                  const Icon = traitIcon(trait, MinusCircleIcon);
                  return <Icon key={ix} className="inline h-4 w-4 stroke-destructive -mt-1" />;
                })}
          </span>
        )}
        {org.template?.prohibitedOwnerTraits && (
          <span className="mr-1" title={"Prohibited Traits: " + org.template.prohibitedOwnerTraits.join(", ")}>
            {org.template.prohibitedOwnerTraits.map((trait, ix) => {
              const Icon = traitIcon(trait, MinusCircleIcon);
              return <Icon key={ix} className="inline h-4 w-4 stroke-blue-700 -mt-1" />;
            })}
          </span>
        )}
      </TableCell>
      <TableCell>
        <ShowEffects tier={org.tier} />
      </TableCell>
      <TableCell>
        {org.type === "unassigned" && "T "}
        {org.type === "available" || org.type === "unassigned" ? (
          <ShowEffects
            costMoney={(org.costMoney || 0) * (org.type === "available" ? 1 : orgTransferFactor)}
            costInfluence={(org.costInfluence || 0) * (org.type === "available" ? 1 : orgTransferFactor)}
            costOps={(org.costOps || 0) * (org.type === "available" ? 1 : orgTransferFactor)}
            costBoost={(org.costBoost || 0) * (org.type === "available" ? 1 : orgTransferFactor)}
          />
        ) : org.type == "stealable" && isTakeover ? (
          (() => {
            const target = org as any as Analysis["playerStealableOrgs"][number];
            return (
              <>
                {target.councilor ?? "Unassigned"} from {target.faction?.displayName}, Admin: {target.admin} +
                takeoverDefense: {target.takeoverDefense}
              </>
            );
          })()
        ) : org.type === "used" ? (
          <>{org.councilor ?? "Unassigned"}</>
        ) : null}
      </TableCell>
      <TableCell>
        <ShowEffects
          incomeBoost_month={org.incomeBoost_month}
          incomeMoney_month={org.incomeMoney_month}
          incomeInfluence_month={org.incomeInfluence_month}
          incomeOps_month={org.incomeOps_month}
          incomeMissionControl={org.incomeMissionControl}
          incomeResearch_month={org.incomeResearch_month}
          projectCapacityGranted={org.projectCapacityGranted}
        />
      </TableCell>
      <TableCell>
        <ShowEffects
          persuasion={org.persuasion}
          command={org.command}
          investigation={org.investigation}
          espionage={org.espionage}
          administration={org.administration}
          science={org.science}
          security={org.security}
          economyBonus={org.economyBonus}
          welfareBonus={org.welfareBonus}
          environmentBonus={org.environmentBonus}
          knowledgeBonus={org.knowledgeBonus}
          governmentBonus={org.governmentBonus}
          unityBonus={org.unityBonus}
          militaryBonus={org.militaryBonus}
          oppressionBonus={org.oppressionBonus}
          spoilsBonus={org.spoilsBonus}
          spaceDevBonus={org.spaceDevBonus}
          spaceflightBonus={org.spaceflightBonus}
          MCBonus={org.MCBonus}
          miningBonus={org.miningBonus}
          techBonuses={org.template?.techBonuses}
          missionsGrantedNames={org.template?.missionsGrantedNames || []}
          highlightMissionClassName={highlightMissionClassName}
        />
      </TableCell>
      {org.score === undefined ? null : (
        <>
          <TableCell>
            <Tooltip>
              <TooltipTrigger>{org.score.value?.toFixed(2)}</TooltipTrigger>
              <TooltipContent align="end" className="max-w-auto">
                <pre className="p-2">{org.score.details}</pre>
              </TooltipContent>
            </Tooltip>
          </TableCell>
          <TableCell>{org.score.noMissionScore?.toFixed(2)}</TableCell>
        </>
      )}
    </TableRow>
  );
}

export function useCouncilorScores(analysis: Analysis, weights: ScoringWeightsType) {
  const { playerMissionCounts, playerVisibleCouncilors, playerCouncilors, playerAvailableOrgs, playerUnassignedOrgs, playerStealableOrgs, factionsById, playerFaction } = analysis;

  const scoredModifiedCouncilors = scoreAndSort(
    playerCouncilors,
    weights,
    playerMissionCounts,
    getModifiedCouncilorScore
  );
  const scoredAvailableCouncilors = scoreAndSort(
    playerVisibleCouncilors,
    weights,
    playerMissionCounts,
    getBaseCouncilorScore
  );
  const scoredBaseCouncilors = scoreAndSort(
    playerCouncilors,
    weights,
    playerMissionCounts,
    getBaseCouncilorScore
  );
  const scoredOrgs = scoreAndSort(
    playerAvailableOrgs
      .map((i) => ({ type: "available", ...i }))
      .concat(playerUnassignedOrgs.map((i) => ({ type: "unassigned", ...i }))),
    weights,
    playerMissionCounts,
    getOrganizationScore,
    "noMissionScore"
  ).toSorted((a, b) => (a.isAdminOrg === b.isAdminOrg ? 0 : a.isAdminOrg ? -1 : 1));
  const usedOrgs = playerCouncilors.flatMap((councilor) =>
    councilor.orgs.map((o) => ({ ...o, type: "used", councilor: councilor.displayName, councilorId: councilor.id }))
  );
  const scoredUsedOrgs = scoreAndSort(usedOrgs, weights, playerMissionCounts, getOrganizationScore);
  const scoredOwnedOrgs = scoreAndSort(
    playerUnassignedOrgs.map((i) => ({ type: "unassigned", ...i })).concat(usedOrgs),
    weights,
    playerMissionCounts,
    getOrganizationScore
  );
  const scoredStealableOrgs = scoreAndSort(
    playerStealableOrgs.map((i) => ({ type: "stealable", ...i })),
    weights,
    playerMissionCounts,
    getOrganizationScore,
    "noMissionScore"
  );

  const bestAvailableCouncilor = scoredAvailableCouncilors[0]?.score.value;
  const worstExistingCouncilor = scoredBaseCouncilors[scoredBaseCouncilors.length - 1]?.score.value;
  const bestAvailableOrg = scoredOrgs[0]?.score.value;
  const worstExistingOrg = scoredUsedOrgs[scoredUsedOrgs.length - 1]?.score.value;

  const playerNationIds = new Set(analysis.playerNationIds);
  const playerTraits = new Set(analysis.playerCouncilors.flatMap((i) => i.traitTemplateNames));

  const stealableOrgsByFaction = scoredStealableOrgs.reduce((acc, org) => {
    const key = org.faction?.id || 0;
    if (!acc.has(key)) {
      acc.set(key, []);
    }
    acc.get(key)!.push(org);
    return acc;
  }, new Map<number, typeof scoredStealableOrgs>());

  type MissionSource =
    | { type: "councilor"; councilor: Analysis["playerCouncilors"][number]; factionId: number | undefined; missions: MissionDataName[] }
    | { type: "org"; org: Analysis["playerAvailableOrgs"][number]; factionId: number | undefined; missions: MissionDataName[] };

  const sourcesByFactionByMission = [...playerCouncilors, ...playerVisibleCouncilors]
    .map(
      (i) =>
        ({
          type: "councilor",
          councilor: i,
          factionId: i.factionId,
          missions: i.effectsWithOrgsAndAugments.missionsGrantedNames || [],
        } as MissionSource)
    )
    .concat(
      [...playerAvailableOrgs, ...playerUnassignedOrgs].map((i) => ({
        type: "org",
        org: i,
        factionId: playerFaction?.id,
        missions: i.template?.missionsGrantedNames || [],
      }))
    )
    .concat(
      playerStealableOrgs.map((i) => ({
        type: "org",
        org: i,
        factionId: i.faction?.id,
        missions: i.template?.missionsGrantedNames || [],
      }))
    )
    .reduce((acc, o) => {
      const key = o.factionId || 0;
      if (!acc.has(key)) {
        acc.set(key, new Map<string, MissionSource[]>());
      }
      const effectsMap = acc.get(key)!;
      o.missions.forEach((m) => {
        if (!effectsMap.has(m)) {
          effectsMap.set(m, []);
        }
        effectsMap.get(m)!.push(o);
      });
      return acc;
    }, new Map<number, Map<string, MissionSource[]>>());
  const factions = Array.from(sourcesByFactionByMission.keys())
    .map((factionId) => factionsById.get(factionId)!)
    .filter((f) => f)
    .toSorted((a, b) => {
      if (a.id === playerFaction.id) return -1;
      if (b.id === playerFaction.id) return 1;
      return (a.displayName || "").localeCompare(b.displayName || "");
    });

  const importantMissions = ["Assassinate"];

  const councilEffects = scoredModifiedCouncilors.reduce((acc, councilor) => {
    return combineEffects(acc, councilor.effectsWithOrgsAndAugments);
  }, {} as ShowEffectsProps);

  const unusedAdmin = playerCouncilors
    .map(
      (c) =>
        Math.min(
          25,
          Math.max(
            0,
            (c.effectsWithOrgsAndAugments.Administration || 0) + (c.effectsWithOrgsAndAugments.administration || 0)
          )
        ) - c.orgs.reduce((a, b) => a + b.tier, 0)
    )
    .reduce((a, b) => a + b, 0);

  function currentHighlightMissionClassName(missionName: MissionDataName) {
    const count = playerMissionCounts.get(missionName) || 0;
    if (count === 2) return "bg-yellow-300/50";
    if (count === 1) return "bg-red-300/50";
  }
  function availableHighlightMissionClassName(missionName: MissionDataName) {
    const count = playerMissionCounts.get(missionName) || 0;
    if (count === 1) return "bg-yellow-300/50";
    if (count === 0) return "bg-green-300/50";
  }

  return {
    scoredModifiedCouncilors,
    scoredAvailableCouncilors,
    scoredBaseCouncilors,
    scoredOrgs,
    scoredUsedOrgs,
    scoredOwnedOrgs,
    scoredStealableOrgs,
    bestAvailableCouncilor,
    worstExistingCouncilor,
    bestAvailableOrg,
    worstExistingOrg,
    playerNationIds,
    playerTraits,
    stealableOrgsByFaction,
    sourcesByFactionByMission,
    factions,
    importantMissions,
    councilEffects,
    unusedAdmin,
    currentHighlightMissionClassName,
    availableHighlightMissionClassName,
  };
}

function ScoreDetailsPanel({
  analysis,
  weights,
  setWeights,
}: {
  analysis: Analysis;
  weights: ScoringWeights;
  setWeights: (weights: ScoringWeights) => void;
}) {
  const { scoredModifiedCouncilors, scoredAvailableCouncilors, scoredBaseCouncilors, worstExistingCouncilor, bestAvailableCouncilor } =
    useCouncilorScores(analysis, weights);

  return (
    <div className="space-y-4">
      <div className="flex gap-4 text-sm text-muted-foreground">
        <span>Worst existing: {worstExistingCouncilor?.toFixed(0)}</span>
        <span>vs.</span>
        <span>Best available: {bestAvailableCouncilor?.toFixed(0)}</span>
      </div>

      <h4 className="font-semibold">Existing Councilors (Scored)</h4>
      <Table>
        <CouncilorTableHeader hasOrgs />
        <TableBody>
          {scoredModifiedCouncilors.map((councilor) => (
            <CouncilorTableRow
              key={councilor.id}
              councilor={councilor}
              stats={councilor.effectsWithOrgsAndAugments}
              label={councilor.displayName!}
              hasOrgs
              highlightMissionClassName={() => undefined}
            />
          ))}
        </TableBody>
      </Table>

      <h4 className="font-semibold mt-4">Available Councilors (Scored)</h4>
      <Table>
        <CouncilorTableHeader />
        <TableBody>
          {scoredAvailableCouncilors.map((councilor) => (
            <CouncilorTableRow
              key={councilor.id}
              councilor={councilor}
              stats={councilor.effectsBaseAndUnaugmentedTraits}
              label={councilor.displayName!}
              highlightMissionClassName={() => undefined}
            />
          ))}
        </TableBody>
      </Table>

      <div className="my-4">
        <ScoringWeightsDialog weights={weights} onWeightsChange={setWeights} />
      </div>
    </div>
  );
}

function ExistingCouncilPanel({
  analysis,
  weights,
}: {
  analysis: Analysis;
  weights: ScoringWeights;
}) {
  const { scoredModifiedCouncilors, scoredOrgs, councilEffects, unusedAdmin, currentHighlightMissionClassName, playerNationIds, playerTraits } =
    useCouncilorScores(analysis, weights);

  return (
    <div className="space-y-4">
      <div className="py-1">
        <ShowEffects
          incomeBoost_month={councilEffects.incomeBoost_month}
          incomeMoney_month={councilEffects.incomeMoney_month}
          incomeInfluence_month={councilEffects.incomeInfluence_month}
          incomeOps_month={councilEffects.incomeOps_month}
          incomeMissionControl={councilEffects.incomeMissionControl}
          incomeResearch_month={councilEffects.incomeResearch_month}
          projectCapacityGranted={councilEffects.projectCapacityGranted}
        />
        <ShowEffects
          economyBonus={councilEffects.economyBonus}
          welfareBonus={councilEffects.welfareBonus}
          environmentBonus={councilEffects.environmentBonus}
          knowledgeBonus={councilEffects.knowledgeBonus}
          governmentBonus={councilEffects.governmentBonus}
          unityBonus={councilEffects.unityBonus}
          militaryBonus={councilEffects.militaryBonus}
          oppressionBonus={councilEffects.oppressionBonus}
          spoilsBonus={councilEffects.spoilsBonus}
          spaceDevBonus={councilEffects.spaceDevBonus}
          spaceflightBonus={councilEffects.spaceflightBonus}
          MCBonus={councilEffects.MCBonus}
          miningBonus={councilEffects.miningBonus}
        />
        <ShowEffects
          councilorTechBonus={councilEffects.councilorTechBonus}
          techBonuses={councilEffects.techBonuses}
        />
      </div>
      <Table>
        <CouncilorTableHeader hasOrgs />
        <TableBody>
          {scoredModifiedCouncilors.map((councilor) => (
            <CouncilorTableRow
              key={councilor.id}
              councilor={councilor}
              stats={councilor.effectsWithOrgsAndAugments}
              label={councilor.displayName!}
              hasOrgs
              highlightMissionClassName={currentHighlightMissionClassName}
            />
          ))}
        </TableBody>
      </Table>
      <h3 className="mt-1">Available Organizations:</h3>
      <Table>
        <OrgTableHeader />
        <TableBody>
          {scoredOrgs.map((org) => (
            <OrgTableRow
              key={org.id}
              org={org}
              playerNationIds={playerNationIds}
              playerTraits={playerTraits}
              highlightMissionClassName={() => undefined}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function FindNewCouncilorsPanel({
  analysis,
  weights,
}: {
  analysis: Analysis;
  weights: ScoringWeights;
}) {
  const { scoredAvailableCouncilors, scoredBaseCouncilors, playerNationIds, playerTraits, availableHighlightMissionClassName } =
    useCouncilorScores(analysis, weights);

  return (
    <div className="space-y-4">
      <h3>Available Councilors:</h3>
      <Table>
        <CouncilorTableHeader />
        <TableBody>
          {scoredAvailableCouncilors.map((councilor) => (
            <CouncilorTableRow
              key={councilor.id}
              councilor={councilor}
              stats={councilor.effectsBaseAndUnaugmentedTraits}
              label={councilor.displayName!}
              highlightMissionClassName={availableHighlightMissionClassName}
            />
          ))}
        </TableBody>
      </Table>

      <h3 className="mt-4">Unmodified Active Councilors:</h3>
      <Table>
        <CouncilorTableHeader />
        <TableBody>
          {scoredBaseCouncilors.map((councilor) => (
            <CouncilorTableRow
              key={`${councilor.id}-base`}
              councilor={councilor}
              stats={councilor.effectsBaseAndUnaugmentedTraits}
              label={`${councilor.displayName}`}
              highlightMissionClassName={() => undefined}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function CurrentOrgsPanel({
  analysis,
  weights,
}: {
  analysis: Analysis;
  weights: ScoringWeights;
}) {
  const { scoredOwnedOrgs, playerNationIds, playerTraits } = useCouncilorScores(analysis, weights);

  return (
    <Table>
      <OrgTableHeader costHeader="Councilor" />
      <TableBody>
        {scoredOwnedOrgs.toReversed().map((org) => (
          <OrgTableRow
            key={org.id}
            org={org}
            playerNationIds={playerNationIds}
            playerTraits={playerTraits}
            highlightMissionClassName={() => undefined}
          />
        ))}
      </TableBody>
    </Table>
  );
}

function TakeoverPanel({
  analysis,
  weights,
}: {
  analysis: Analysis;
  weights: ScoringWeights;
}) {
  const { stealableOrgsByFaction, playerNationIds, playerTraits, availableHighlightMissionClassName } =
    useCouncilorScores(analysis, weights);

  const firstKey = Array.from(stealableOrgsByFaction.keys())[0];

  return (
    <SmartTabs
      storageKey="councilorsTakeoverTabs"
      defaultValue={`faction-${firstKey}`}
    >
      <TabsList>
        {Array.from(stealableOrgsByFaction.entries()).map(([factionId, orgs]) => (
          <TabsTrigger key={factionId} value={`faction-${factionId}`}>
            {orgs[0].faction?.displayName || "Unknown Faction"} ({orgs.length})
          </TabsTrigger>
        ))}
      </TabsList>
      {Array.from(stealableOrgsByFaction.entries()).map(([factionId, orgs]) => (
        <TabsContent key={factionId} value={`faction-${factionId}`}>
          <Table>
            <OrgTableHeader costHeader="Takeover" />
            <TableBody>
              {orgs.map((org) => (
                <OrgTableRow
                  key={org.id}
                  org={org}
                  playerNationIds={playerNationIds}
                  playerTraits={playerTraits}
                  highlightMissionClassName={availableHighlightMissionClassName}
                  isTakeover
                />
              ))}
            </TableBody>
          </Table>
        </TabsContent>
      ))}
    </SmartTabs>
  );
}

function MissionsPanel({ analysis, weights }: { analysis: Analysis; weights: ScoringWeights }) {
  const { factions, sourcesByFactionByMission, importantMissions, playerNationIds, playerTraits, availableHighlightMissionClassName } =
    useCouncilorScores(analysis, weights);

  const firstFaction = factions[0];
  if (!firstFaction) return <div className="text-muted-foreground">No faction data available.</div>;

  return (
    <SmartTabs storageKey="councilorsMissionsTabs" defaultValue={`faction-${firstFaction.id}`}>
      <TabsList>
        {factions.map((faction) => (
          <TabsTrigger key={faction.id} value={`faction-${faction.id}`}>
            {faction.displayName || "Unknown Faction"} ({sourcesByFactionByMission.get(faction.id)?.size || 0})
            {importantMissions
              .filter(
                (m) =>
                  sourcesByFactionByMission
                    .get(faction.id)
                    ?.get(m)
                    ?.filter((i) => i.type === "councilor")?.length ?? 0 > 0
              )
              .map((m) => {
                const MissionIcon = MissionIcons[m] || UnknownIcon;
                return (
                  <span key={m} className="inline-block -mt-2">
                    <MissionIcon className="h-4 w-4" />
                  </span>
                );
              })}
          </TabsTrigger>
        ))}
      </TabsList>
      {factions.map((faction) => (
        <TabsContent key={faction.id} value={`faction-${faction.id}`}>
          <SmartAccordion type="single" collapsible storageKey={`councilorsMissions-${faction.id}`}>
            {Array.from(
              new Set([
                ...importantMissions,
                ...Array.from(sourcesByFactionByMission.get(faction.id)?.keys() || []),
              ])
            ).map((missionName) => {
              const sources = sourcesByFactionByMission.get(faction.id)?.get(missionName) || [];
              const MissionIcon = MissionIcons[missionName] || UnknownIcon;
              return (
                <AccordionItem key={missionName} value={missionName}>
                  <AccordionTrigger>
                    <span>
                      <MissionIcon /> {missionName} &ndash;{" "}
                      {sources.filter((i) => i.type === "councilor").length} Councilors &lt;-{" "}
                      {sources.filter((i) => i.type === "org").length} Orgs
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <Table>
                      <OrgTableHeader costHeader="Takeover" />
                      <TableBody>
                        {sources?.map((src) =>
                          src.type === "org" ? (
                            <OrgTableRow
                              key={`councilor-${src.org.id}-mission-${missionName}`}
                              org={src.org}
                              playerNationIds={playerNationIds}
                              playerTraits={playerTraits}
                            />
                          ) : (
                            <CouncilorTableRow
                              key={`org-${src.councilor.id}-mission-${missionName}`}
                              councilor={src.councilor}
                              stats={src.councilor.effectsWithOrgsAndAugments}
                              label={src.councilor.displayName!}
                            />
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
  );
}

function OtherCouncilorsPanel({ analysis, weights }: { analysis: Analysis; weights: ScoringWeights }) {
  const { playerVisibleCouncilors, factionsById, playerFaction } = analysis;

  const scoredBaseCouncilors = scoreAndSort(
    playerVisibleCouncilors,
    weights,
    new Map<MissionDataName, number>(),
    getBaseCouncilorScore
  );

  const councilorsByFactionId = scoredBaseCouncilors.reduce((acc, councilor) => {
    const factionId = councilor.factionId || 0;
    if (!factionId) return acc;
    if (!acc.has(factionId)) {
      acc.set(factionId, []);
    }
    acc.get(factionId)!.push(councilor);
    return acc;
  }, new Map<number, Analysis["playerCouncilors"][number][]>());

  const factions = Array.from(councilorsByFactionId.keys())
    .map((i) => factionsById.get(i!)!)
    .filter((i) => i.id !== analysis.alienFaction.id);

  if (factions.length === 0) return <div className="text-muted-foreground">No other councilors found.</div>;

  return (
    <Tabs defaultValue={`faction-${factions[0].id}`}>
      <TabsList>
        {factions
          .filter((i) => i.id !== analysis.alienFaction.id)
          .map((faction) => (
            <TabsTrigger key={faction.id} value={`faction-${faction.id}`}>
              {faction.displayName || "Unknown Faction"} ({councilorsByFactionId.get(faction.id)?.length || 0})
            </TabsTrigger>
          ))}
      </TabsList>
      {factions.map((faction) => (
        <TabsContent key={faction.id} value={`faction-${faction.id}`}>
          <Table>
            <CouncilorTableHeader />
            <TableBody>
              {councilorsByFactionId.get(faction.id)?.map((councilor) => (
                <CouncilorTableRow
                  key={councilor.id}
                  councilor={councilor}
                  stats={councilor.effectsBaseAndUnaugmentedTraits}
                  label={councilor.displayName!}
                />
              ))}
            </TableBody>
          </Table>
        </TabsContent>
      ))}
    </Tabs>
  );
}

export function getCouncilorsContentPanels(analysis: Analysis): ContentPanel[] {
  const [weights, setWeights] = useState<ScoringWeights>(defaultScoringWeights);

  useEffect(() => {
    setWeights(loadWeightsFromStorage());
  }, []);

  return [
    {
      key: "score-details",
      label: "Score Details",
      icon: BarChart3,
      source: "councilors",
      content: <ScoreDetailsPanel analysis={analysis} weights={weights} setWeights={setWeights} />,
    },
    {
      key: "existing-council",
      label: "Existing Council",
      icon: UsersRound,
      source: "councilors",
      content: <ExistingCouncilPanel analysis={analysis} weights={weights} />,
    },
    {
      key: "find-new",
      label: "Find New",
      icon: UserPlus,
      source: "councilors",
      content: <FindNewCouncilorsPanel analysis={analysis} weights={weights} />,
    },
    {
      key: "current-orgs",
      label: "Current Organizations",
      icon: Landmark,
      source: "councilors",
      content: <CurrentOrgsPanel analysis={analysis} weights={weights} />,
    },
    {
      key: "takeover",
      label: "Hostile Takeover",
      icon: Target,
      source: "councilors",
      content: <TakeoverPanel analysis={analysis} weights={weights} />,
    },
    {
      key: "missions",
      label: "Missions",
      icon: MissionIcons.Assassinate || Target,
      source: "councilors",
      content: <MissionsPanel analysis={analysis} weights={weights} />,
    },
    {
      key: "other-councilors",
      label: "Other Councilors",
      icon: Users,
      source: "councilors",
      content: <OtherCouncilorsPanel analysis={analysis} weights={weights} />,
    },
  ];
}
