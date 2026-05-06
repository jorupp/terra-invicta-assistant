"use client";

import { ShowEffects, combineEffects, ShowEffectsProps } from "@/components/showEffects";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SmartAccordion } from "@/components/ui/smart-accordion";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Analysis } from "@/lib/analysis";
import { MissionDataName } from "@/lib/template-types-generated";
import { MinusCircleIcon, PlusCircleIcon } from "lucide-react";
import { ScoringWeights } from "./scoringWeights";
import { Administration, MissionIcons, TraitIcons, UnknownIcon } from "@/components/icons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SmartTabs } from "@/components/ui/smart-tabs";
import { twMerge } from "tailwind-merge";
import { useScoring } from "./scoring-context";

// ─── Table Components ───

export function CouncilorTableHeader({ hasOrgs }: { hasOrgs?: boolean }) {
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
          persuasion={stats.persuasion} command={stats.command} investigation={stats.investigation}
          espionage={stats.espionage} administration={stats.administration} science={stats.science}
          security={stats.security} Persuasion={stats.Persuasion} Command={stats.Command}
          Investigation={stats.Investigation} Espionage={stats.Espionage} Administration={stats.Administration}
          Science={stats.Science} Security={stats.Security} ApparentLoyalty={stats.ApparentLoyalty}
          Loyalty={stats.Loyalty} maxLoyalty={stats.maxLoyalty} xpModifier={stats.xpModifier}
          xp={stats.xp} traitTemplateNames={stats.traitTemplateNames} typeTemplateName={stats.typeTemplateName}
          playerIntel={stats.playerIntel} playerMaxIntel={stats.playerMaxIntel}
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
          incomeBoost_month={stats.incomeBoost_month} incomeMoney_month={stats.incomeMoney_month}
          incomeInfluence_month={stats.incomeInfluence_month} incomeOps_month={stats.incomeOps_month}
          incomeMissionControl={stats.incomeMissionControl} incomeResearch_month={stats.incomeResearch_month}
          projectCapacityGranted={stats.projectCapacityGranted}
        />
      </TableCell>
      <TableCell>
        <span className="text-wrap leading-6 -my-2 inline-block">
          <ShowEffects
            economyBonus={stats.economyBonus} welfareBonus={stats.welfareBonus}
            environmentBonus={stats.environmentBonus} knowledgeBonus={stats.knowledgeBonus}
            governmentBonus={stats.governmentBonus} unityBonus={stats.unityBonus}
            militaryBonus={stats.militaryBonus} oppressionBonus={stats.oppressionBonus}
            spoilsBonus={stats.spoilsBonus} spaceDevBonus={stats.spaceDevBonus}
            spaceflightBonus={stats.spaceflightBonus} MCBonus={stats.MCBonus} miningBonus={stats.miningBonus}
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
          <ShowEffects missionsGrantedNames={stats.missionsGrantedNames} highlightMissionClassName={highlightMissionClassName} />
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

const orgTransferFactor = 0.2;

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
  function traitIcon(trait: MissionDataName, Fallback: typeof PlusCircleIcon) {
    return TraitIcons[trait as keyof typeof TraitIcons] || Fallback;
  }
  return (
    <TableRow key={org.id} className={twMerge(org.isAdminOrg ? "bg-green-100" : "", org.type === "unassigned" ? "bg-yellow-100" : "")}>
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
                  const Icon = traitIcon(trait as MissionDataName, PlusCircleIcon);
                  return <Icon key={ix} className="inline h-4 w-4 stroke-green-700 -mt-1" />;
                })
              : missingRequiredTraits.map((trait, ix) => {
                  const Icon = traitIcon(trait as MissionDataName, MinusCircleIcon);
                  return <Icon key={ix} className="inline h-4 w-4 stroke-destructive -mt-1" />;
                })}
          </span>
        )}
        {org.template?.prohibitedOwnerTraits && (
          <span className="mr-1" title={"Prohibited Traits: " + org.template.prohibitedOwnerTraits.join(", ")}>
            {org.template.prohibitedOwnerTraits.map((trait, ix) => {
              const Icon = traitIcon(trait as MissionDataName, MinusCircleIcon);
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
            costMoney={(org.costMoney || 0) * orgTransferFactor}
            costInfluence={(org.costInfluence || 0) * orgTransferFactor}
            costOps={(org.costOps || 0) * orgTransferFactor}
            costBoost={(org.costBoost || 0) * orgTransferFactor}
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
          incomeBoost_month={org.incomeBoost_month} incomeMoney_month={org.incomeMoney_month}
          incomeInfluence_month={org.incomeInfluence_month} incomeOps_month={org.incomeOps_month}
          incomeMissionControl={org.incomeMissionControl} incomeResearch_month={org.incomeResearch_month}
          projectCapacityGranted={org.projectCapacityGranted}
        />
      </TableCell>
      <TableCell>
        <ShowEffects
          persuasion={org.persuasion} command={org.command} investigation={org.investigation}
          espionage={org.espionage} administration={org.administration} science={org.science}
          security={org.security} economyBonus={org.economyBonus} welfareBonus={org.welfareBonus}
          environmentBonus={org.environmentBonus} knowledgeBonus={org.knowledgeBonus}
          governmentBonus={org.governmentBonus} unityBonus={org.unityBonus}
          militaryBonus={org.militaryBonus} oppressionBonus={org.oppressionBonus}
          spoilsBonus={org.spoilsBonus} spaceDevBonus={org.spaceDevBonus}
          spaceflightBonus={org.spaceflightBonus} MCBonus={org.MCBonus} miningBonus={org.miningBonus}
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

// ─── Scoring Types & Utilities ───

interface ScoreResult {
  value: number;
  noMissionScore: number;
  details: string;
}

function getScore(
  props: ShowEffectsProps,
  weights: ScoringWeights,
  haveMissions: Map<MissionDataName, number>,
  ignoreTier: boolean = false,
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
    details.push(
      `${name}: ${parseFloat(actualValue.toFixed(2))} × ${parseFloat(actualWeight.toFixed(3))} = ${contribution.toFixed(3)}`
    );
  };

  addScore("persuasion", props.persuasion, weights.persuasion, true);
  addScore("command", props.command, weights.command, true);
  addScore("investigation", props.investigation, weights.investigation, true);
  addScore("espionage", props.espionage, weights.espionage, true);
  addScore("administration", props.administration, weights.administration, true);
  addScore("science", props.science, weights.science, true);
  addScore("security", props.security, weights.security, true);
  addScore("Persuasion", props.Persuasion, weights.persuasion, true);
  addScore("Command", props.Command, weights.command, true);
  addScore("Investigation", props.Investigation, weights.investigation, true);
  addScore("Espionage", props.Espionage, weights.espionage, true);
  addScore("Administration", props.Administration, weights.administration, true);
  addScore("Science", props.Science, weights.science, true);
  addScore("Security", props.Security, weights.security, true);
  addScore("xpModifier", props.xpModifier, weights.xpModifier);
  addScore("xp", props.xp, weights.xp);
  addScore("incomeBoost_month", props.incomeBoost_month, weights.incomeBoost_month);
  addScore("incomeMoney_month", props.incomeMoney_month, weights.incomeMoney_month);
  addScore("incomeInfluence_month", props.incomeInfluence_month, weights.incomeInfluence_month);
  addScore("incomeOps_month", props.incomeOps_month, weights.incomeOps_month);
  addScore("incomeMissionControl", props.incomeMissionControl, weights.incomeMissionControl);
  addScore("incomeResearch_month", props.incomeResearch_month, weights.incomeResearch_month);
  addScore("projectCapacityGranted", props.projectCapacityGranted, weights.projectCapacityGranted);
  addScore("costMoney", props.costMoney, weights.costMoney);
  addScore("costInfluence", props.costInfluence, weights.costInfluence);
  addScore("costOps", props.costOps, weights.costOps);
  addScore("costBoost", props.costBoost, weights.costBoost);
  addScore("economyBonus", props.economyBonus, weights.economyBonus);
  addScore("welfareBonus", props.welfareBonus, weights.welfareBonus);
  addScore("environmentBonus", props.environmentBonus, weights.environmentBonus);
  addScore("knowledgeBonus", props.knowledgeBonus, weights.knowledgeBonus);
  addScore("governmentBonus", props.governmentBonus, weights.governmentBonus);
  addScore("unityBonus", props.unityBonus, weights.unityBonus);
  addScore("militaryBonus", props.militaryBonus, weights.militaryBonus);
  addScore("oppressionBonus", props.oppressionBonus, weights.oppressionBonus);
  addScore("spoilsBonus", props.spoilsBonus, weights.spoilsBonus);
  addScore("spaceDevBonus", props.spaceDevBonus, weights.spaceDevBonus);
  addScore("spaceflightBonus", props.spaceflightBonus, weights.spaceflightBonus);
  addScore("MCBonus", props.MCBonus, weights.MCBonus);
  addScore("miningBonus", props.miningBonus, weights.miningBonus);

  const councilorTechBonuses = weights.councilorTechBonus;
  const techBonuses = weights.techBonuses;
  if (councilorTechBonuses && props?.councilorTechBonus) {
    for (const { category, bonus } of props.councilorTechBonus) {
      const weight = councilorTechBonuses[category as keyof typeof councilorTechBonuses];
      addScore(`councilorTechBonus[${category}]`, bonus, weight);
    }
  }
  if (techBonuses && props?.techBonuses) {
    for (const { category, bonus } of props.techBonuses) {
      const weight = techBonuses[category as keyof typeof techBonuses];
      addScore(`techBonus[${category}]`, bonus, weight);
    }
  }

  let noMissionScore = totalScore;
  if (weights.missions && props?.missionsGrantedNames) {
    for (const missionName of props.missionsGrantedNames) {
      const weight = weights.missions[missionName as MissionDataName];
      addScore(`mission[${missionName}]`, 1, weight);
      if (weights.extraWeightForMissingMissions && (haveMissions.get(missionName) || 0) === 0) {
        totalScore += weights.extraWeightForMissingMissions;
        details.push(`mission[${missionName}]: missing bonus × ${weights.extraWeightForMissingMissions.toFixed(3)} = ${weights.extraWeightForMissingMissions.toFixed(3)}`);
      }
      if (weights.extraWeightForSingleMissions && (haveMissions.get(missionName) || 0) === 1) {
        totalScore += weights.extraWeightForSingleMissions;
        details.push(`mission[${missionName}]: single bonus × ${weights.extraWeightForSingleMissions.toFixed(3)} = ${weights.extraWeightForSingleMissions.toFixed(3)}`);
      }
    }
  }

  const tier = props.tier || 1;
  let finalScore = totalScore;
  if (tier > 1 && !ignoreTier) {
    const tierFactor = Math.pow(tier, weights.orgTierExponent);
    finalScore = totalScore / tierFactor;
    noMissionScore /= tierFactor;
    details.push(`Subtotal: ${totalScore.toFixed(3)}`);
    details.push(`Divided by ${tierFactor.toFixed(2)} for tier ${tier}: ${finalScore.toFixed(3)}`);
  }

  return { value: finalScore, noMissionScore, details: details.join("\n") };
}

function getBaseCouncilorScore(
  councilor: Analysis["playerCouncilors"][number],
  weights: ScoringWeights,
  haveMissions: Map<MissionDataName, number>,
): ScoreResult {
  return getScore(councilor.effectsBaseAndUnaugmentedTraits, weights, haveMissions, true);
}

function getModifiedCouncilorScore(
  councilor: Analysis["playerCouncilors"][number],
  weights: ScoringWeights,
  haveMissions: Map<MissionDataName, number>,
): ScoreResult {
  return getScore(councilor.effectsWithOrgsAndAugments, weights, haveMissions, true);
}

function getOrganizationScore(
  org: Analysis["playerAvailableOrgs"][number] & { type: string },
  weights: ScoringWeights,
  haveMissions: Map<MissionDataName, number>,
): ScoreResult {
  return getScore(
    {
      ...org,
      techBonuses: org.template?.techBonuses,
      missionsGrantedNames: org.template?.missionsGrantedNames || [],
      ...(org.type === "available"
        ? {}
        : {
            costMoney: (org.costMoney || 0) * orgTransferFactor,
            costInfluence: (org.costInfluence || 0) * orgTransferFactor,
            costOps: (org.costOps || 0) * orgTransferFactor,
            costBoost: (org.costBoost || 0) * orgTransferFactor,
          }),
    },
    weights,
    haveMissions,
  );
}

function scoreAndSort<T>(
  items: T[],
  weights: ScoringWeights,
  haveMissions: Map<MissionDataName, number>,
  scoreFn: (item: T, weights: ScoringWeights, haveMissions: Map<MissionDataName, number>) => ScoreResult,
  scoreSort: "value" | "noMissionScore" = "value",
) {
  const scoredItems = items.map((item) => {
    const scoreResult = scoreFn(item, weights, haveMissions);
    return { ...item, score: scoreResult };
  });
  scoredItems.sort((a, b) => (b as any).score[scoreSort] - (a as any).score[scoreSort]);
  return scoredItems;
}

// ─── Section Components ───

interface ScoreDetailsProps {
  analysis: Analysis;
  weights: ScoringWeights;
}

export function ScoreDetails({ analysis, weights }: ScoreDetailsProps) {
  const { playerMissionCounts, playerCouncilors, playerAvailableOrgs, playerUnassignedOrgs } = analysis;

  const scoredModifiedCouncilors = scoreAndSort(playerCouncilors, weights, playerMissionCounts, getModifiedCouncilorScore);
  const scoredAvailableCouncilors = scoreAndSort(analysis.playerAvailableCouncilors, weights, playerMissionCounts, getBaseCouncilorScore);
  const scoredBaseCouncilors = scoreAndSort(playerCouncilors, weights, playerMissionCounts, getBaseCouncilorScore);
  const scoredOrgs = scoreAndSort(
    analysis.playerAvailableOrgs.map((i) => ({ type: "available", ...i }))
      .concat(analysis.playerUnassignedOrgs.map((i) => ({ type: "unassigned", ...i }))),
    weights, playerMissionCounts, getOrganizationScore, "noMissionScore"
  ).toSorted((a, b) => (a.isAdminOrg === b.isAdminOrg ? 0 : a.isAdminOrg ? -1 : 1));
  const usedOrgs = playerCouncilors.flatMap((c) => c.orgs.map((o) => ({ ...o, type: "used", councilor: c.displayName, councilorId: c.id })));
  const scoredUsedOrgs = scoreAndSort(usedOrgs, weights, playerMissionCounts, getOrganizationScore);
  const scoredOwnedOrgs = scoreAndSort(
    analysis.playerUnassignedOrgs.map((i) => ({ type: "unassigned", ...i })).concat(usedOrgs),
    weights, playerMissionCounts, getOrganizationScore
  );

  const bestAvailableCouncilor = scoredAvailableCouncilors[0]?.score.value;
  const worstExistingCouncilor = scoredBaseCouncilors[scoredBaseCouncilors.length - 1]?.score.value;
  const bestAvailableOrg = scoredOrgs[0]?.score.value;
  const worstExistingOrg = scoredUsedOrgs[scoredUsedOrgs.length - 1]?.score.value;

  const councilEffects = scoredModifiedCouncilors.reduce((acc, c) => combineEffects(acc, c.effectsWithOrgsAndAugments), {} as ShowEffectsProps);

  function currentHighlightMissionClassName(missionName: MissionDataName) {
    const count = playerMissionCounts.get(missionName) || 0;
    if (count === 2) return "bg-yellow-300/50";
    if (count === 1) return "bg-red-300/50";
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border p-4 space-y-2">
        <h3 className="font-semibold">Summary</h3>
        <p>Councilors: {worstExistingCouncilor?.toFixed(0)} (worst) vs {bestAvailableCouncilor?.toFixed(0)} (best available)</p>
        <p>Organizations: {worstExistingOrg?.toFixed(2)} (worst) vs {bestAvailableOrg?.toFixed(2)} (best available)</p>
      </div>

      <div>
        <h3 className="font-semibold mb-2">Current Council Effects</h3>
        <ShowEffects
          incomeBoost_month={councilEffects.incomeBoost_month} incomeMoney_month={councilEffects.incomeMoney_month}
          incomeInfluence_month={councilEffects.incomeInfluence_month} incomeOps_month={councilEffects.incomeOps_month}
          incomeMissionControl={councilEffects.incomeMissionControl} incomeResearch_month={councilEffects.incomeResearch_month}
          projectCapacityGranted={councilEffects.projectCapacityGranted}
          economyBonus={councilEffects.economyBonus} welfareBonus={councilEffects.welfareBonus}
          environmentBonus={councilEffects.environmentBonus} knowledgeBonus={councilEffects.knowledgeBonus}
          governmentBonus={councilEffects.governmentBonus} unityBonus={councilEffects.unityBonus}
          militaryBonus={councilEffects.militaryBonus} oppressionBonus={councilEffects.oppressionBonus}
          spoilsBonus={councilEffects.spoilsBonus} spaceDevBonus={councilEffects.spaceDevBonus}
          spaceflightBonus={councilEffects.spaceflightBonus} MCBonus={councilEffects.MCBonus} miningBonus={councilEffects.miningBonus}
          councilorTechBonus={councilEffects.councilorTechBonus} techBonuses={councilEffects.techBonuses}
        />
      </div>

      <div>
        <h3 className="font-semibold mb-2">Modified Councilors (with orgs)</h3>
        <Table>
          <CouncilorTableHeader hasOrgs />
          <TableBody>
            {scoredModifiedCouncilors.map((c) => (
              <CouncilorTableRow key={c.id} councilor={c} stats={c.effectsWithOrgsAndAugments}
                label={c.displayName!} hasOrgs highlightMissionClassName={currentHighlightMissionClassName} />
            ))}
          </TableBody>
        </Table>
      </div>

      <div>
        <h3 className="font-semibold mb-2">Base Councilors (without orgs)</h3>
        <Table>
          <CouncilorTableHeader />
          <TableBody>
            {scoredBaseCouncilors.map((c) => (
              <CouncilorTableRow key={`${c.id}-base`} councilor={c} stats={c.effectsBaseAndUnaugmentedTraits}
                label={`${c.displayName} (base)`} />
            ))}
          </TableBody>
        </Table>
      </div>

      <div>
        <h3 className="font-semibold mb-2">Available Councilors</h3>
        <Table>
          <CouncilorTableHeader />
          <TableBody>
            {scoredAvailableCouncilors.map((c) => (
              <CouncilorTableRow key={c.id} councilor={c} stats={c.effectsBaseAndUnaugmentedTraits}
                label={c.displayName!} />
            ))}
          </TableBody>
        </Table>
      </div>

      <div>
        <h3 className="font-semibold mb-2">Available Organizations</h3>
        <Table>
          <OrgTableHeader />
          <TableBody>
            {scoredOrgs.map((org) => (
              <OrgTableRow key={org.id} org={org} playerNationIds={new Set(analysis.playerNationIds)}
                playerTraits={new Set(analysis.playerCouncilors.flatMap((i) => i.traitTemplateNames))} />
            ))}
          </TableBody>
        </Table>
      </div>

      <Collapsible>
        <CollapsibleTrigger className="text-xs text-muted-foreground hover:text-foreground">Debug Data</CollapsibleTrigger>
        <CollapsibleContent>
          <pre>{JSON.stringify(analysis.playerFaction, null, 2)}</pre>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

export function ExistingCouncil({ analysis, weights }: { analysis: Analysis; weights: ScoringWeights }) {
  const { playerMissionCounts, playerCouncilors, playerAvailableOrgs, playerUnassignedOrgs } = analysis;

  const scoredModifiedCouncilors = scoreAndSort(playerCouncilors, weights, playerMissionCounts, getModifiedCouncilorScore);
  const scoredOrgs = scoreAndSort(
    analysis.playerAvailableOrgs.map((i) => ({ type: "available", ...i }))
      .concat(analysis.playerUnassignedOrgs.map((i) => ({ type: "unassigned", ...i }))),
    weights, playerMissionCounts, getOrganizationScore, "noMissionScore"
  ).toSorted((a, b) => (a.isAdminOrg === b.isAdminOrg ? 0 : a.isAdminOrg ? -1 : 1));

  const unusedAdmin = playerCouncilors
    .map((c) =>
      Math.min(25, Math.max(0, (c.effectsWithOrgsAndAugments.Administration || 0) + (c.effectsWithOrgsAndAugments.administration || 0))) -
      c.orgs.reduce((a, b) => a + b.tier, 0)
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

  const playerNationIds = new Set(analysis.playerNationIds);
  const playerTraits = new Set(analysis.playerCouncilors.flatMap((i) => i.traitTemplateNames));

  const councilEffects = scoredModifiedCouncilors.reduce((acc, c) => combineEffects(acc, c.effectsWithOrgsAndAugments), {} as ShowEffectsProps);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border p-3">
        <p>Unused Administration points: {unusedAdmin.toFixed(0)} <Administration /></p>
      </div>

      <div>
        <h3 className="font-semibold mb-2">Council Effects</h3>
        <ShowEffects
          incomeBoost_month={councilEffects.incomeBoost_month} incomeMoney_month={councilEffects.incomeMoney_month}
          incomeInfluence_month={councilEffects.incomeInfluence_month} incomeOps_month={councilEffects.incomeOps_month}
          incomeMissionControl={councilEffects.incomeMissionControl} incomeResearch_month={councilEffects.incomeResearch_month}
          projectCapacityGranted={councilEffects.projectCapacityGranted}
          economyBonus={councilEffects.economyBonus} welfareBonus={councilEffects.welfareBonus}
          environmentBonus={councilEffects.environmentBonus} knowledgeBonus={councilEffects.knowledgeBonus}
          governmentBonus={councilEffects.governmentBonus} unityBonus={councilEffects.unityBonus}
          militaryBonus={councilEffects.militaryBonus} oppressionBonus={councilEffects.oppressionBonus}
          spoilsBonus={councilEffects.spoilsBonus} spaceDevBonus={councilEffects.spaceDevBonus}
          spaceflightBonus={councilEffects.spaceflightBonus} MCBonus={councilEffects.MCBonus} miningBonus={councilEffects.miningBonus}
          councilorTechBonus={councilEffects.councilorTechBonus} techBonuses={councilEffects.techBonuses}
        />
      </div>

      <div>
        <h3 className="font-semibold mb-2">Current Council</h3>
        <Table>
          <CouncilorTableHeader hasOrgs />
          <TableBody>
            {scoredModifiedCouncilors.map((c) => (
              <CouncilorTableRow key={c.id} councilor={c} stats={c.effectsWithOrgsAndAugments}
                label={c.displayName!} hasOrgs highlightMissionClassName={currentHighlightMissionClassName} />
            ))}
          </TableBody>
        </Table>
      </div>

      <div>
        <h3 className="font-semibold mb-2">Available Organizations</h3>
        <Table>
          <OrgTableHeader />
          <TableBody>
            {scoredOrgs.map((org) => (
              <OrgTableRow key={org.id} org={org} playerNationIds={playerNationIds} playerTraits={playerTraits}
                highlightMissionClassName={availableHighlightMissionClassName} />
            ))}
          </TableBody>
        </Table>
      </div>

      <Collapsible>
        <CollapsibleTrigger className="text-xs text-muted-foreground hover:text-foreground">Debug Data</CollapsibleTrigger>
        <CollapsibleContent>
          <pre>{JSON.stringify(analysis.playerFaction, null, 2)}</pre>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

export function FindNewCouncilors({ analysis, weights }: { analysis: Analysis; weights: ScoringWeights }) {
  const { playerMissionCounts } = analysis;

  const scoredAvailableCouncilors = scoreAndSort(analysis.playerAvailableCouncilors, weights, playerMissionCounts, getBaseCouncilorScore);
  const scoredBaseCouncilors = scoreAndSort(analysis.playerCouncilors, weights, playerMissionCounts, getBaseCouncilorScore);

  function availableHighlightMissionClassName(missionName: MissionDataName) {
    const count = playerMissionCounts.get(missionName) || 0;
    if (count === 1) return "bg-yellow-300/50";
    if (count === 0) return "bg-green-300/50";
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold mb-2">Available Councilors</h3>
        <Table>
          <CouncilorTableHeader />
          <TableBody>
            {scoredAvailableCouncilors.map((c) => (
              <CouncilorTableRow key={c.id} councilor={c} stats={c.effectsBaseAndUnaugmentedTraits}
                label={c.displayName!} highlightMissionClassName={availableHighlightMissionClassName} />
            ))}
          </TableBody>
        </Table>
      </div>

      <div>
        <h3 className="font-semibold mb-2">Unmodified Active Councilors</h3>
        <Table>
          <CouncilorTableHeader />
          <TableBody>
            {scoredBaseCouncilors.map((c) => (
              <CouncilorTableRow key={`${c.id}-base`} councilor={c} stats={c.effectsBaseAndUnaugmentedTraits}
                label={`${c.displayName}`} highlightMissionClassName={availableHighlightMissionClassName} />
            ))}
          </TableBody>
        </Table>
      </div>

      <Collapsible>
        <CollapsibleTrigger className="text-xs text-muted-foreground hover:text-foreground">Debug Data</CollapsibleTrigger>
        <CollapsibleContent>
          <pre>{JSON.stringify(analysis.playerAvailableCouncilors, null, 2)}</pre>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

export function CurrentOrgs({ analysis, weights }: { analysis: Analysis; weights: ScoringWeights }) {
  const { playerMissionCounts, playerCouncilors, playerUnassignedOrgs } = analysis;

  const usedOrgs = playerCouncilors.flatMap((c) => c.orgs.map((o) => ({ ...o, type: "used", councilor: c.displayName, councilorId: c.id })));
  const scoredOwnedOrgs = scoreAndSort(
    analysis.playerUnassignedOrgs.map((i) => ({ type: "unassigned", ...i })).concat(usedOrgs),
    weights, playerMissionCounts, getOrganizationScore
  );

  function availableHighlightMissionClassName(missionName: MissionDataName) {
    const count = playerMissionCounts.get(missionName) || 0;
    if (count === 1) return "bg-yellow-300/50";
    if (count === 0) return "bg-green-300/50";
  }

  const playerNationIds = new Set(analysis.playerNationIds);
  const playerTraits = new Set(analysis.playerCouncilors.flatMap((i) => i.traitTemplateNames));

  return (
    <div className="space-y-2">
      <Table>
        <OrgTableHeader costHeader="Councilor" />
        <TableBody>
          {scoredOwnedOrgs.toReversed().map((org) => (
            <OrgTableRow key={org.id} org={org} playerNationIds={playerNationIds} playerTraits={playerTraits}
              highlightMissionClassName={availableHighlightMissionClassName} />
          ))}
        </TableBody>
      </Table>

      <Collapsible>
        <CollapsibleTrigger className="text-xs text-muted-foreground hover:text-foreground">Debug Data</CollapsibleTrigger>
        <CollapsibleContent>
          <pre>{JSON.stringify(analysis.playerUnassignedOrgs, null, 2)}</pre>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

export function Takeover({ analysis, weights }: { analysis: Analysis; weights: ScoringWeights }) {
  const { playerMissionCounts, playerFaction, playerStealableOrgs, factionsById } = analysis;

  const scoredStealableOrgs = scoreAndSort(
    playerStealableOrgs.map((i) => ({ type: "stealable", ...i })),
    weights, playerMissionCounts, getOrganizationScore, "noMissionScore"
  );

  const stealableOrgsByFaction = scoredStealableOrgs.reduce((acc, org) => {
    const key = org.faction?.id || 0;
    if (!acc.has(key)) acc.set(key, []);
    acc.get(key)!.push(org);
    return acc;
  }, new Map<number, typeof scoredStealableOrgs>());

  function availableHighlightMissionClassName(missionName: MissionDataName) {
    const count = playerMissionCounts.get(missionName) || 0;
    if (count === 1) return "bg-yellow-300/50";
    if (count === 0) return "bg-green-300/50";
  }

  const playerNationIds = new Set(analysis.playerNationIds);
  const playerTraits = new Set(analysis.playerCouncilors.flatMap((i) => i.traitTemplateNames));

  return (
    <div className="space-y-2">
      <SmartTabs storageKey="councilorsTakeoverTabs"
        defaultValue={`faction-${Array.from(stealableOrgsByFaction.keys())[0]}`}>
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
                  <OrgTableRow key={org.id} org={org} playerNationIds={playerNationIds} playerTraits={playerTraits}
                    highlightMissionClassName={availableHighlightMissionClassName} isTakeover />
                ))}
              </TableBody>
            </Table>
          </TabsContent>
        ))}
      </SmartTabs>

      <Collapsible>
        <CollapsibleTrigger className="text-xs text-muted-foreground hover:text-foreground">Debug Data</CollapsibleTrigger>
        <CollapsibleContent>
          <pre>{JSON.stringify(analysis.playerFaction, null, 2)}</pre>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

export function Missions({ analysis, weights }: { analysis: Analysis; weights: ScoringWeights }) {
  const { playerMissionCounts, playerCouncilors, playerVisibleCouncilors, playerAvailableOrgs, playerUnassignedOrgs, playerFaction, playerStealableOrgs, factionsById } = analysis;

  type MissionSource =
    | { type: "councilor"; councilor: Analysis["playerCouncilors"][number]; factionId: number | undefined; missions: MissionDataName[] }
    | { type: "org"; org: Analysis["playerAvailableOrgs"][number]; factionId: number | undefined; missions: MissionDataName[] };

  const sourcesByFactionByMission = [
    ...[...playerCouncilors, ...playerVisibleCouncilors].map((i) => ({
      type: "councilor" as const,
      councilor: i,
      factionId: i.factionId,
      missions: i.effectsWithOrgsAndAugments.missionsGrantedNames || [],
    })),
    ...[...playerAvailableOrgs, ...playerUnassignedOrgs].map((i) => ({
      type: "org" as const,
      org: i,
      factionId: playerFaction?.id,
      missions: i.template?.missionsGrantedNames || [],
    })),
    ...playerStealableOrgs.map((i) => ({
      type: "org" as const,
      org: i,
      factionId: i.faction?.id,
      missions: i.template?.missionsGrantedNames || [],
    })),
  ].reduce((acc, o) => {
      const key = o.factionId || 0;
      if (!acc.has(key)) acc.set(key, new Map<string, MissionSource[]>());
      const effectsMap = acc.get(key)!;
      o.missions.forEach((m) => {
        if (!effectsMap.has(m)) effectsMap.set(m, []);
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

  function availableHighlightMissionClassName(missionName: MissionDataName) {
    const count = playerMissionCounts.get(missionName) || 0;
    if (count === 1) return "bg-yellow-300/50";
    if (count === 0) return "bg-green-300/50";
  }

  const playerNationIds = new Set(analysis.playerNationIds);
  const playerTraits = new Set(analysis.playerCouncilors.flatMap((i) => i.traitTemplateNames));

  return (
    <div className="space-y-2">
      <SmartTabs storageKey="councilorsMissionsTabs" defaultValue={`faction-${factions[0]?.id}`}>
        <TabsList>
          {factions.map((faction) => (
            <TabsTrigger key={faction.id} value={`faction-${faction.id}`}>
              {faction.displayName || "Unknown Faction"} ({sourcesByFactionByMission.get(faction.id)?.size || 0})
              {importantMissions
                .filter((m) => sourcesByFactionByMission.get(faction.id)?.get(m)?.filter((i) => i.type === "councilor")?.length ?? 0 > 0)
                .map((m) => {
                  const MissionIcon = MissionIcons[m] || UnknownIcon;
                  return <span key={m} className="inline-block -mt-2"><MissionIcon className="h-4 w-4" /></span>;
                })}
            </TabsTrigger>
          ))}
        </TabsList>
        {factions.map((faction) => (
          <TabsContent key={faction.id} value={`faction-${faction.id}`}>
            <SmartAccordion type="single" collapsible storageKey={`councilorsMissions-${faction.id}`}>
              {Array.from(new Set([...importantMissions, ...Array.from(sourcesByFactionByMission.get(faction.id)?.keys() || [])])).map((missionName) => {
                const sources = sourcesByFactionByMission.get(faction.id)?.get(missionName) || [];
                const MissionIcon = MissionIcons[missionName] || UnknownIcon;
                return (
                  <AccordionItem key={missionName} value={missionName}>
                    <AccordionTrigger>
                      <span>
                        <MissionIcon /> {missionName} –{" "}
                        {sources.filter((i) => i.type === "councilor").length} Councilors ←{" "}
                        {sources.filter((i) => i.type === "org").length} Orgs
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <Table>
                        <OrgTableHeader costHeader="Takeover" />
                        <TableBody>
                          {sources?.map((src) =>
                            src.type === "org" ? (
                              <OrgTableRow key={`councilor-${src.org.id}-mission-${missionName}`}
                                org={src.org} playerNationIds={playerNationIds} playerTraits={playerTraits} />
                            ) : (
                              <CouncilorTableRow key={`org-${src.councilor.id}-mission-${missionName}`}
                                councilor={src.councilor} stats={src.councilor.effectsWithOrgsAndAugments}
                                label={src.councilor.displayName!} />
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

      <Collapsible>
        <CollapsibleTrigger className="text-xs text-muted-foreground hover:text-foreground">Debug Data</CollapsibleTrigger>
        <CollapsibleContent>
          <pre>{JSON.stringify(analysis.playerFaction, null, 2)}</pre>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

export function OtherCouncilors({ analysis, weights }: { analysis: Analysis; weights: ScoringWeights }) {
  const { playerVisibleCouncilors, factionsById } = analysis;

  const scoredBaseCouncilors = scoreAndSort(
    playerVisibleCouncilors, weights, new Map<MissionDataName, number>(), getBaseCouncilorScore
  );

  const councilorsByFactionId = scoredBaseCouncilors.reduce((acc, councilor) => {
    const factionId = councilor.factionId || 0;
    if (!factionId) return acc;
    if (!acc.has(factionId)) acc.set(factionId, []);
    acc.get(factionId)!.push(councilor);
    return acc;
  }, new Map<number, Analysis["playerCouncilors"][number][]>());

  const factions = Array.from(councilorsByFactionId.keys())
    .map((i) => factionsById.get(i!)!)
    .filter((i) => i.id !== analysis.alienFaction.id);

  return (
    <div className="space-y-2">
      <Tabs defaultValue={`faction-${factions[0]?.id}`}>
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
                  <CouncilorTableRow key={councilor.id} councilor={councilor}
                    stats={councilor.effectsBaseAndUnaugmentedTraits}
                    label={councilor.displayName!} />
                ))}
              </TableBody>
            </Table>
          </TabsContent>
        ))}
      </Tabs>

      <Collapsible>
        <CollapsibleTrigger className="text-xs text-muted-foreground hover:text-foreground">Debug Data</CollapsibleTrigger>
        <CollapsibleContent>
          <pre>{JSON.stringify(analysis.playerFaction, null, 2)}</pre>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

// ─── Legacy: getCouncilorsUi (kept for compatibility, no longer used by tree nav) ───

export function getCouncilorsUi(_analysis: Analysis) {
  return {
    key: "councilors",
    tab: "Councilors",
    content: <div>Use tree navigation instead</div>,
  };
}
