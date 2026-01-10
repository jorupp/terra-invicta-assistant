"use client";

import { useState, useEffect } from "react";
import { ShowEffects, ShowEffectsProps } from "@/components/showEffects";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Analysis } from "@/lib/analysis";
import { MissionDataName, TraitDataName } from "@/lib/template-types-generated";
import { MinusCircleIcon, PlusCircleIcon } from "lucide-react";
import { defaultScoringWeights, loadWeightsFromStorage, ScoringWeights, ScoringWeightsDialog } from "./scoringWeights";
import { Administration, TraitIcons } from "@/components/icons";

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

function OrgTableHeader({ isTakeover }: { isTakeover?: boolean }) {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>Org Name</TableHead>
        <TableHead>Requirements</TableHead>
        <TableHead>Tier</TableHead>
        {isTakeover ? <TableHead>Target</TableHead> : <TableHead>Purchase</TableHead>}
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
  councilor: Analysis["playerCouncilors"][number] & { score: ScoreResult };
  stats: Analysis["playerCouncilors"][number]["effectsWithOrgsAndAugments"];
  label: string;
  hasOrgs?: boolean;
  highlightMissionClassName?: (missionName: MissionDataName) => string | undefined;
}) {
  const admin = (stats.administration || 0) + (stats.Administration || 0);
  const orgTiers = councilor.orgs.reduce((a, b) => a + b.tier, 0);
  const cpCap =
    Math.max(0, stats.persuasion || 0) +
    Math.max(0, stats.command || 0) +
    Math.max(0, stats.administration || 0) +
    Math.max(0, stats.Persuasion || 0) +
    Math.max(0, stats.Command || 0) +
    Math.max(0, stats.Administration || 0);
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
          xpModifier={stats.xpModifier}
          xp={stats.xp}
          traitTemplateNames={stats.traitTemplateNames}
          typeTemplateName={stats.typeTemplateName}
          playerIntel={stats.playerIntel}
          playerMaxIntel={stats.playerMaxIntel}
          lastRecordedLoyalty={stats.lastRecordedLoyalty}
          // TODO: is there a case where we should show this?
          // Loyalty={stats.Loyalty}
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
      </TableCell>
      <TableCell>
        <ShowEffects councilorTechBonus={stats.councilorTechBonus} techBonuses={stats.techBonuses} />
      </TableCell>
      <TableCell>
        <ShowEffects
          missionsGrantedNames={stats.missionsGrantedNames}
          highlightMissionClassName={highlightMissionClassName}
        />
      </TableCell>
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
  org: Analysis["playerAvailableOrgs"][number] & { type: string; score: ScoreResult };
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
    <TableRow key={org.id}>
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
        {org.type === "available" ? (
          <ShowEffects
            costMoney={org.costMoney || 0}
            costInfluence={org.costInfluence || 0}
            costOps={org.costOps || 0}
            costBoost={org.costBoost || 0}
          />
        ) : org.type == "stealable" && isTakeover ? (
          (() => {
            const target = org as any as Analysis["playerStealableOrgs"][number];
            return (
              <>
                {target.councilor} from {target.faction?.displayName}, CAdmin: {target.councilorAdmin}, FAdmin:{" "}
                {target.factionAdmin}, takeoverDefense: {target.takeoverDefense}
              </>
            );
          })()
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
      <TableCell>
        <Tooltip>
          <TooltipTrigger>{org.score.value?.toFixed(2)}</TooltipTrigger>
          <TooltipContent align="end" className="max-w-auto">
            <pre className="p-2">{org.score.details}</pre>
          </TooltipContent>
        </Tooltip>
      </TableCell>
      <TableCell>{org.score.noMissionScore?.toFixed(2)}</TableCell>
    </TableRow>
  );
}

export function getCouncilorsUi(analysis: Analysis) {
  const { playerMissionCounts } = analysis;
  const [weights, setWeights] = useState<ScoringWeights>(defaultScoringWeights);

  useEffect(() => {
    setWeights(loadWeightsFromStorage());
  }, []);

  const scoredModifiedCouncilors = scoreAndSort(
    analysis.playerCouncilors,
    weights,
    playerMissionCounts,
    getModifiedCouncilorScore
  );
  const scoredAvailableCouncilors = scoreAndSort(
    analysis.playerAvailableCouncilors,
    weights,
    playerMissionCounts,
    getBaseCouncilorScore
  );
  const scoredBaseCouncilors = scoreAndSort(
    analysis.playerCouncilors,
    weights,
    playerMissionCounts,
    getBaseCouncilorScore
  );
  const scoredOrgs = scoreAndSort(
    analysis.playerAvailableOrgs
      .map((i) => ({ type: "available", ...i }))
      .concat(analysis.playerUnassignedOrgs.map((i) => ({ type: "unassigned", ...i }))),
    weights,
    playerMissionCounts,
    getOrganizationScore
  );
  const usedOrgs = analysis.playerCouncilors
    .flatMap((councilor) => councilor.orgs)
    .map((org) => ({ ...org, type: "used" }));
  const scoredUsedOrgs = scoreAndSort(usedOrgs, weights, playerMissionCounts, getOrganizationScore);

  const bestAvailableCouncilor = scoredAvailableCouncilors[0]?.score.value;
  const worstExistingCouncilor = scoredBaseCouncilors[scoredBaseCouncilors.length - 1]?.score.value;
  const bestAvailableOrg = scoredOrgs[0]?.score.value;
  const worstExistingOrg = scoredUsedOrgs[scoredUsedOrgs.length - 1]?.score.value;

  return {
    key: "councilors",
    tab: (
      <>
        Councilors ({worstExistingCouncilor?.toFixed(0)} vs. {bestAvailableCouncilor?.toFixed(0)}) / Orgs (
        {worstExistingOrg?.toFixed(2)} vs {bestAvailableOrg?.toFixed(2)})
      </>
    ),
    content: (
      <CouncilorsComponent
        {...{
          analysis,
          weights,
          setWeights,
          scoredModifiedCouncilors,
          scoredAvailableCouncilors,
          scoredBaseCouncilors,
          scoredOrgs,
          scoredUsedOrgs,
        }}
      />
    ),
  };
}

function CouncilorsComponent({
  analysis,
  weights,
  setWeights,
  scoredModifiedCouncilors,
  scoredAvailableCouncilors,
  scoredBaseCouncilors,
  scoredOrgs,
  scoredUsedOrgs,
}: {
  analysis: Analysis;
  weights: ScoringWeights;
  setWeights: (weights: ScoringWeights) => void;
  scoredModifiedCouncilors: (Analysis["playerCouncilors"][number] & { score: ScoreResult })[];
  scoredAvailableCouncilors: (Analysis["playerAvailableCouncilors"][number] & { score: ScoreResult })[];
  scoredBaseCouncilors: (Analysis["playerCouncilors"][number] & { score: ScoreResult })[];
  scoredOrgs: (Analysis["playerAvailableOrgs"][number] & { type: string; score: ScoreResult })[];
  scoredUsedOrgs: (Analysis["playerAvailableOrgs"][number] & { type: string; score: ScoreResult })[];
}) {
  const { playerMissionCounts } = analysis;
  const scoredStealableOrgs = scoreAndSort(
    analysis.playerStealableOrgs.map((i) => ({ type: "stealable", ...i })),
    weights,
    playerMissionCounts,
    getOrganizationScore
  );

  function currentHighlightMissionClassName(missionName: MissionDataName) {
    // if we have exactly 2, show yellow BG, if we have 1, show red, otherwise no change to bg
    const count = playerMissionCounts.get(missionName) || 0;
    if (count === 2) {
      return "bg-yellow-300/50";
    } else if (count === 1) {
      return "bg-red-300/50";
    }
  }
  function availableHighlightMissionClassName(missionName: MissionDataName) {
    // if we have 1, show yellow BG, if we have 0, show green, otherwise no change to bg
    const count = playerMissionCounts.get(missionName) || 0;
    if (count === 1) {
      return "bg-yellow-300/50";
    } else if (count === 0) {
      return "bg-green-300/50";
    }
  }
  const playerNationIds = new Set(analysis.playerNationIds);
  const playerTraits = new Set(analysis.playerCouncilors.flatMap((i) => i.traitTemplateNames));
  const unusedAdmin = analysis.playerCouncilors
    .map(
      (c) =>
        (c.effectsWithOrgsAndAugments.Administration || 0) +
        (c.effectsWithOrgsAndAugments.administration || 0) -
        c.orgs.reduce((a, b) => a + b.tier, 0)
    )
    .reduce((a, b) => a + b, 0);

  // TODO: would be cool to click an effect icon and sort everything by that (ie. click persuasion icon to see who/org gives most persuasion)
  return (
    <>
      <Accordion type="single" collapsible defaultValue="existing">
        <AccordionItem value="existing">
          <AccordionTrigger>
            <span>
              Manage Existing Council ({unusedAdmin.toFixed(0)} <Administration />)
            </span>
          </AccordionTrigger>
          <AccordionContent>
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
                    highlightMissionClassName={availableHighlightMissionClassName}
                  />
                ))}
              </TableBody>
            </Table>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="new-councilors">
          <AccordionTrigger>Find New Councilors</AccordionTrigger>
          <AccordionContent>
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

            <h3 className="mt-1">Unmodified Active Councilors:</h3>
            <Table>
              <CouncilorTableHeader />
              <TableBody>
                {scoredBaseCouncilors.map((councilor) => (
                  <CouncilorTableRow
                    key={`${councilor.id}-base`}
                    councilor={councilor}
                    stats={councilor.effectsBaseAndUnaugmentedTraits}
                    label={`${councilor.displayName}`}
                    highlightMissionClassName={currentHighlightMissionClassName}
                  />
                ))}
              </TableBody>
            </Table>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="current-orgs">
          <AccordionTrigger>Current Organizations</AccordionTrigger>
          <AccordionContent>
            <Table>
              <OrgTableHeader />
              <TableBody>
                {scoredUsedOrgs.toReversed().map((org) => (
                  <OrgTableRow
                    key={org.id}
                    org={org}
                    playerNationIds={playerNationIds}
                    playerTraits={playerTraits}
                    highlightMissionClassName={availableHighlightMissionClassName}
                  />
                ))}
              </TableBody>
            </Table>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="takeover">
          <AccordionTrigger>Hostile Takeover</AccordionTrigger>
          <AccordionContent>
            <Table>
              <OrgTableHeader isTakeover />
              <TableBody>
                {scoredStealableOrgs.map((org) => (
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
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="my-4">
        <ScoringWeightsDialog weights={weights} onWeightsChange={setWeights} />
      </div>

      <Collapsible>
        <CollapsibleTrigger asChild>
          <Button variant="outline">Debug Data</Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <pre>{JSON.stringify(analysis.playerCouncilors, null, 2)}</pre>
          <pre>{JSON.stringify(analysis.playerAvailableCouncilors, null, 2)}</pre>
          <pre>{JSON.stringify(analysis.playerAvailableOrgs, null, 2)}</pre>
          <pre>{JSON.stringify(analysis.playerUnassignedOrgs, null, 2)}</pre>
        </CollapsibleContent>
      </Collapsible>
    </>
  );
}

function scoreAndSort<T>(
  items: T[],
  weights: ScoringWeights,
  haveMissions: Map<MissionDataName, number>,
  scoreFn: (item: T, weights: ScoringWeights, haveMissions: Map<MissionDataName, number>) => ScoreResult
) {
  const scoredItems = items.map((item) => {
    const scoreResult = scoreFn(item, weights, haveMissions);
    return { ...item, score: scoreResult };
  });
  scoredItems.sort((a, b) => b.score.value - a.score.value);
  return scoredItems;
}

function getBaseCouncilorScore(
  councilor: Analysis["playerCouncilors"][number],
  weights: ScoringWeights,
  haveMissions: Map<MissionDataName, number>
): ScoreResult {
  return getScore(councilor.effectsBaseAndUnaugmentedTraits, weights, haveMissions, true);
}

function getModifiedCouncilorScore(
  councilor: Analysis["playerCouncilors"][number],
  weights: ScoringWeights,
  haveMissions: Map<MissionDataName, number>
): ScoreResult {
  return getScore(councilor.effectsWithOrgsAndAugments, weights, haveMissions, true);
}

function getOrganizationScore(
  org: Analysis["playerAvailableOrgs"][number] & { type: string },
  weights: ScoringWeights,
  haveMissions: Map<MissionDataName, number>
): ScoreResult {
  return getScore(
    {
      ...org,
      techBonuses: org.template?.techBonuses,
      missionsGrantedNames: org.template?.missionsGrantedNames || [],
      ...(org.type === "available" ? {} : { costMoney: 0, costInfluence: 0, costOps: 0, costBoost: 0 }), // ignore purchase costs for already-purchased orgs
    },
    weights,
    haveMissions
  );
}

interface ScoreResult {
  value: number;
  noMissionScore: number;
  details: string;
}

function getScore(
  org: ShowEffectsProps,
  weights: ScoringWeights,
  haveMissions: Map<MissionDataName, number>,
  ignoreTier: boolean = false
): ScoreResult {
  let totalScore = 0;
  const details: string[] = [];

  // Helper to add score for a numeric attribute
  const addScore = (name: string, value: number | undefined, weight: number | undefined, noNegative?: boolean) => {
    let actualValue = value || 0;
    if (noNegative) {
      actualValue = Math.max(0, actualValue);
    }
    const actualWeight = weight ?? 0;

    // Skip if value or weight is 0/undefined/null
    if (!actualValue || !actualWeight) return;

    const contribution = actualValue * actualWeight;
    totalScore += contribution;
    details.push(
      `${name}: ${parseFloat(actualValue.toFixed(2))} × ${parseFloat(actualWeight.toFixed(3))} = ${contribution.toFixed(
        3
      )}`
    );
  };

  // Councilor attributes
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

  // Monthly income/costs
  addScore("incomeBoost_month", org.incomeBoost_month, weights.incomeBoost_month);
  addScore("incomeMoney_month", org.incomeMoney_month, weights.incomeMoney_month);
  addScore("incomeInfluence_month", org.incomeInfluence_month, weights.incomeInfluence_month);
  addScore("incomeOps_month", org.incomeOps_month, weights.incomeOps_month);
  addScore("incomeMissionControl", org.incomeMissionControl, weights.incomeMissionControl);
  addScore("incomeResearch_month", org.incomeResearch_month, weights.incomeResearch_month);
  addScore("projectCapacityGranted", org.projectCapacityGranted, weights.projectCapacityGranted);

  // Purchase costs
  addScore("costMoney", org.costMoney, weights.costMoney);
  addScore("costInfluence", org.costInfluence, weights.costInfluence);
  addScore("costOps", org.costOps, weights.costOps);
  addScore("costBoost", org.costBoost, weights.costBoost);

  // Priority bonuses
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

  // Tech bonuses from councilor/traits
  if (weights.councilorTechBonus && org?.councilorTechBonus) {
    for (const { category, bonus } of org.councilorTechBonus) {
      const weight = weights.councilorTechBonus[category];
      addScore(`councilorTechBonus[${category}]`, bonus, weight);
    }
  }

  // Tech bonuses from orgs
  if (weights.techBonuses && org?.techBonuses) {
    for (const { category, bonus } of org.techBonuses) {
      const weight = weights.techBonuses[category];
      addScore(`techBonus[${category}]`, bonus, weight);
    }
  }

  let noMissionScore = totalScore;

  // Missions granted
  if (weights.missions && org?.missionsGrantedNames) {
    for (const missionName of org.missionsGrantedNames) {
      const weight = weights.missions[missionName];
      addScore(`mission[${missionName}]`, 1, weight);

      // Extra weight for missions we don't have yet or only have one councilor for
      if (weights.extraWeightForMissingMissions && (haveMissions.get(missionName) || 0) === 0) {
        totalScore += weights.extraWeightForMissingMissions;
        details.push(
          `mission[${missionName}]: missing bonus × ${parseFloat(
            weights.extraWeightForMissingMissions.toFixed(3)
          )} = ${weights.extraWeightForMissingMissions.toFixed(3)}`
        );
      }
      if (weights.extraWeightForSingleMissions && (haveMissions.get(missionName) || 0) === 1) {
        totalScore += weights.extraWeightForSingleMissions;
        details.push(
          `mission[${missionName}]: single bonus × ${parseFloat(
            weights.extraWeightForSingleMissions.toFixed(3)
          )} = ${weights.extraWeightForSingleMissions.toFixed(3)}`
        );
      }
    }
  }

  // Divide by tier to normalize for org cost/power
  const tier = org.tier || 1;
  let finalScore = totalScore;

  if (tier > 1 && !ignoreTier) {
    const tierFactor = Math.pow(tier, weights.orgTierExponent);
    finalScore = totalScore / tierFactor;
    noMissionScore /= tierFactor;
    details.push(`Subtotal: ${totalScore.toFixed(3)}`);
    details.push(`Divided by ${tierFactor.toFixed(2)} for tier ${tier}: ${finalScore.toFixed(3)}`);
  }

  return {
    value: finalScore,
    noMissionScore,
    details: details.join("\n"),
  };
}
