"use client";

import { useState, useEffect } from "react";
import { ShowEffects, ShowEffectsProps } from "@/components/showEffects";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Analysis } from "@/lib/analysis";
import { MissionDataName } from "@/lib/template-types-generated";
import { MinusCircleIcon, PlusCircleIcon } from "lucide-react";
import { defaultScoringWeights, loadWeightsFromStorage, ScoringWeights, ScoringWeightsDialog } from "./scoringWeights";

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
          xpModifier={stats.xpModifier}
          xp={stats.xp}
          // TODO: is there a case where we should show this?
          // Loyalty={stats.Loyalty}
        />
      </TableCell>
      {hasOrgs && (
        <TableCell>
          <ShowEffects tier={stats.tier} />
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

  const bestAvailable = scoredAvailableCouncilors[0]?.score.value;
  const worstExisting = scoredBaseCouncilors[scoredBaseCouncilors.length - 1]?.score.value;
  const bestOrg = scoredOrgs[0]?.score.value;

  return {
    key: "councilors",
    tab: (
      <>
        Councilors ({worstExisting?.toFixed(0)} vs. {bestAvailable?.toFixed(0)}) / Orgs ({bestOrg?.toFixed(2)})
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
}: {
  analysis: Analysis;
  weights: ScoringWeights;
  setWeights: (weights: ScoringWeights) => void;
  scoredModifiedCouncilors: (Analysis["playerCouncilors"][number] & { score: ScoreResult })[];
  scoredAvailableCouncilors: (Analysis["playerAvailableCouncilors"][number] & { score: ScoreResult })[];
  scoredBaseCouncilors: (Analysis["playerCouncilors"][number] & { score: ScoreResult })[];
  scoredOrgs: (Analysis["playerAvailableOrgs"][number] & { type: string; score: ScoreResult })[];
}) {
  const { playerMissionCounts } = analysis;

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
  // TODO: would be cool to click an effect icon and sort everything by that (ie. click persuasion icon to see who/org gives most persuasion)
  return (
    <>
      <Accordion type="single" collapsible defaultValue="councilors">
        <AccordionItem value="councilors">
          <AccordionTrigger>Councilors</AccordionTrigger>
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
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="available-councilors">
          <AccordionTrigger>Available Councilors</AccordionTrigger>
          <AccordionContent>
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

            <h3>Unmodified Active Councilors:</h3>
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
        <AccordionItem value="available-organizations">
          <AccordionTrigger>Available Organizations</AccordionTrigger>
          <AccordionContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Org Name</TableHead>
                  <TableHead>Requirements</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Purchase</TableHead>
                  <TableHead>Monthly</TableHead>
                  <TableHead>Effects</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scoredOrgs.map((org) => (
                  <TableRow key={org.id}>
                    <TableCell>{org.displayName}</TableCell>
                    <TableCell>
                      {org.template?.requiresNationality && (
                        <span className="mr-1" title={`Required Nation: ${org.homeNationName || ""}`}>
                          {playerNationIds.has(org.homeNationId || -1) ? (
                            <PlusCircleIcon className="inline h-4 w-4 stroke-green-700 -mt-1" />
                          ) : (
                            <MinusCircleIcon className="inline h-4 w-4 stroke-destructive -mt-1" />
                          )}
                        </span>
                      )}
                      {org.template?.requiredOwnerTraits && (
                        <span
                          className="mr-1"
                          title={"Required Traits: " + org.template.requiredOwnerTraits.join(", ")}
                        >
                          {org.template.requiredOwnerTraits.every((t) => playerTraits.has(t)) ? (
                            <PlusCircleIcon className="inline h-4 w-4 stroke-green-700 -mt-1" />
                          ) : (
                            <MinusCircleIcon className="inline h-4 w-4 stroke-destructive -mt-1" />
                          )}
                        </span>
                      )}
                      {org.template?.prohibitedOwnerTraits && (
                        <span
                          className="mr-1"
                          title={"Prohibited Traits: " + org.template.prohibitedOwnerTraits.join(", ")}
                        >
                          {org.template.prohibitedOwnerTraits.every((t) => playerTraits.has(t)) ? (
                            <PlusCircleIcon className="inline h-4 w-4 stroke-orange-500 -mt-1" />
                          ) : (
                            <MinusCircleIcon className="inline h-4 w-4 stroke-green-700 -mt-1" />
                          )}
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
                        highlightMissionClassName={availableHighlightMissionClassName}
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
                  </TableRow>
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
  org: Analysis["playerAvailableOrgs"][number],
  weights: ScoringWeights,
  haveMissions: Map<MissionDataName, number>
): ScoreResult {
  return getScore(
    { ...org, techBonuses: org.template?.techBonuses, missionsGrantedNames: org.template?.missionsGrantedNames || [] },
    weights,
    haveMissions
  );
}

interface ScoreResult {
  value: number;
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
  const addScore = (name: string, value: number | undefined, weight: number | undefined) => {
    const actualValue = value || 0;
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
  addScore("persuasion", org.persuasion, weights.persuasion);
  addScore("command", org.command, weights.command);
  addScore("investigation", org.investigation, weights.investigation);
  addScore("espionage", org.espionage, weights.espionage);
  addScore("administration", org.administration, weights.administration);
  addScore("science", org.science, weights.science);
  addScore("security", org.security, weights.security);
  addScore("Persuasion", org.Persuasion, weights.persuasion);
  addScore("Command", org.Command, weights.command);
  addScore("Investigation", org.Investigation, weights.investigation);
  addScore("Espionage", org.Espionage, weights.espionage);
  addScore("Administration", org.Administration, weights.administration);
  addScore("Science", org.Science, weights.science);
  addScore("Security", org.Security, weights.security);
  addScore("xpModifier", org.xpModifier, weights.xpModifier);
  addScore("xpModifier", org.xp, weights.xp);

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
    details.push(`Subtotal: ${totalScore.toFixed(3)}`);
    details.push(`Divided by ${tierFactor.toFixed(2)} for tier ${tier}: ${finalScore.toFixed(3)}`);
  }

  return {
    value: finalScore,
    details: details.join("\n"),
  };
}
