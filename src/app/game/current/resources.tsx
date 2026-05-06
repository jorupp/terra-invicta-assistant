"use client";

import { Boost, ControlPoint, FactionIcons, MissionControl, PrioritySpoils, ResourceIcons } from "@/components/icons";
import { pct } from "@/components/showEffects";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { SmartAccordion } from "@/components/ui/smart-accordion";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Analysis } from "@/lib/analysis";
import { ClaimCoverage } from "@/lib/analysis/nations";
import { diffDateTime, smartRound, sortByDateTime, toDays } from "@/lib/utils";
import { Trash2 } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { ContentPanel } from "./tree-nav";
import {
  ListChecks,
  Landmark,
  Target,
  Map as MapIcon,
  ScrollText,
  Globe,
} from "lucide-react";

function getNationBg(
  nation: Pick<Analysis["nations"][0], "wastedOppression" | "tooHighUnrest" | "couldBuildBoost" | "spoilsWithoutAllCPs">
) {
  return twMerge(
    nation.couldBuildBoost ? "bg-green-100" : "",
    nation.tooHighUnrest ? "bg-yellow-100" : "",
    nation.spoilsWithoutAllCPs ? "bg-yellow-100" : "",
    nation.wastedOppression ? "bg-red-100" : ""
  );
}

const NationCPDetails = ({ analysis, nation }: { nation: Analysis["nations"][0]; analysis: Analysis }) => {
  const {
    factionsById,
    playerFaction: { permaAbandonedNationIds, id: playerFactionId },
  } = analysis;
  return (
    <>
      {nation.controlPoints.length
        ? nation.controlPoints.map((cp) => {
            const faction = factionsById.get(cp.factionId!);
            const FactionIcon = faction
              ? FactionIcons[faction.templateName as keyof typeof FactionIcons]
              : ControlPoint;
            return (
              <FactionIcon
                key={cp.id}
                className={twMerge(
                  cp.benefitsDisabled ? "bg-red-200" : "",
                  "p-1 rounded",
                  cp.defended ? "bg-green-100" : ""
                )}
              />
            );
          })
        : null}{" "}
      ({smartRound(nation.totalCpCost)} cost, {smartRound(nation.investmentPoints)} IP)
      {(() => {
        const earliestCrackdown = sortByDateTime(
          nation.controlPoints.filter((cp) => cp.crackdownExpiration),
          (cp) => cp.crackdownExpiration!
        )[0];
        if (earliestCrackdown) {
          return (
            <span>
              {" "}
              (expires in{" "}
              {toDays(diffDateTime(earliestCrackdown.crackdownExpiration!, analysis.gameCurrentDateTime)).toFixed(0)}
              d)
            </span>
          );
        }
        return null;
      })()}
      {nation.controlPoints.some((cp) => cp.benefitsDisabled && cp.factionId == playerFactionId) &&
        permaAbandonedNationIds.includes(nation.id) && (
          <span title="Perma-abandoned nation">
            <Trash2 className="inline-block h-4 w-4 stroke-destructive -mt-1 mx-1" />
          </span>
        )}
    </>
  );
};

const RELATIONSHIP_LABELS: Record<string, string> = {
  war: "War",
  federation: "Federation",
  ally: "Ally",
  neutral: "Neutral",
  rival: "Rival",
};

const RELATIONSHIP_COLORS: Record<string, string> = {
  war: "text-red-600 font-bold",
  federation: "text-blue-700 font-medium",
  ally: "text-green-700 font-medium",
  neutral: "",
  rival: "text-red-700 font-medium",
};

function ClaimCoverageCell({ coverage }: { coverage: ClaimCoverage }) {
  if (coverage.totalRegions === 0) return <span className="text-muted-foreground">N/A</span>;
  const allCovered = coverage.missing === 0;
  if (allCovered && coverage.hostile === 0) {
    return (
      <span className="text-green-600 font-medium" title="All regions covered, all non-hostile">
        ✓ all
      </span>
    );
  }
  if (allCovered) {
    return (
      <span className="text-amber-600 font-medium" title={`All regions covered, but ${coverage.hostile} hostile`}>
        ✓ all <span className="text-red-500 text-xs">({coverage.hostile}⚔)</span>
      </span>
    );
  }
  const missingLabel = `${coverage.missing} of ${coverage.totalRegions} missing`;
  const hostileNote = coverage.hostile > 0 ? `, ${coverage.hostile}⚔` : "";
  return (
    <span className="text-red-600 text-xs font-medium" title={missingLabel + hostileNote}>
      −{coverage.missing}/{coverage.totalRegions}
      {coverage.hostile > 0 && <span className="text-red-500"> ({coverage.hostile}⚔)</span>}
    </span>
  );
}

function NationClaimsSection({ analysis }: { analysis: Analysis }) {
  const { nationClaims } = analysis;

  if (nationClaims.length === 0) {
    return <p className="text-sm text-muted-foreground">No claims found on nations you control.</p>;
  }

  return (
    <SmartAccordion type="multiple" storageKey="nation-claims-accordion">
      {nationClaims.map((entry) => (
        <AccordionItem key={entry.nationId} value={String(entry.nationId)}>
          <AccordionTrigger>
            {entry.nationName}{" "}
            <span className="text-xs text-muted-foreground ml-1">({entry.targets.length} claim targets)</span>
          </AccordionTrigger>
          <AccordionContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Target Nation</TableHead>
                  <TableHead>Relationship</TableHead>
                  <TableHead title="Earliest date relations can improve (cooldown active if shown)">Relations After</TableHead>
                  <TableHead title="Earliest date war/rivalry action available (cooldown active if shown)">War After</TableHead>
                  <TableHead title="Faction controlling the Executive control point">Executive Faction</TableHead>
                  <TableHead title="Other player-controlled nations with a capital claim on this nation">Co-claimants</TableHead>
                  <TableHead title="Whether this nation has claims on ALL of the target's current regions">All Current?</TableHead>
                  <TableHead title="Whether this nation also has claims on all regions the target claims from other nations">All Claimed?</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entry.targets.map((target) => {
                  const FactionIcon = target.executiveFactionTemplateName
                    ? FactionIcons[target.executiveFactionTemplateName as keyof typeof FactionIcons]
                    : null;
                  return (
                    <TableRow key={target.targetNationId}>
                      <TableCell>
                        {target.targetNationName}
                        {target.isCapitalClaim && (
                          <span
                            className={`ml-1 text-xs font-medium ${target.isCapitalClaimHostile ? "text-red-600" : "text-amber-700"}`}
                            title={target.isCapitalClaimHostile ? "Hostile claim on capital region" : "Non-hostile claim on capital region"}
                          >
                            {target.isCapitalClaimHostile ? "⚔ capital" : "★ capital"}
                          </span>
                        )}
                        {(() => {
                          const gap = target.governmentGap;
                          const isWarning = gap > 1.5;
                          const sign = gap > 0 ? "+" : "";
                          return (
                            <span
                              className={`ml-1 text-xs font-medium ${isWarning ? "text-orange-600" : "text-green-600"}`}
                              title={`Government score difference (target − claimant): ${sign}${gap}`}
                            >
                              {isWarning ? "⚠" : ""} gov {sign}{gap}
                            </span>
                          );
                        })()}
                      </TableCell>
                      <TableCell className={RELATIONSHIP_COLORS[target.relationship]}>
                        {RELATIONSHIP_LABELS[target.relationship]}
                      </TableCell>
                      <TableCell className="text-sm">
                        {target.relationsCanImproveAfter ?? <span className="text-muted-foreground">–</span>}
                      </TableCell>
                      <TableCell className="text-sm">
                        {target.warActionAfter ?? <span className="text-muted-foreground">–</span>}
                      </TableCell>
                      <TableCell className="flex items-center gap-1">
                        {FactionIcon && <FactionIcon className="p-1 rounded" />}
                        {target.executiveFactionName ?? <span className="text-muted-foreground">Uncontrolled</span>}
                      </TableCell>
                      <TableCell className="text-sm">
                        {target.otherPlayerCapitalClaimants.length > 0
                          ? target.otherPlayerCapitalClaimants.map((c) => c.nationName).join(", ")
                          : <span className="text-muted-foreground">–</span>}
                      </TableCell>
                      <TableCell className="text-sm">
                        <ClaimCoverageCell coverage={target.currentRegionCoverage} />
                      </TableCell>
                      <TableCell className="text-sm">
                        <ClaimCoverageCell coverage={target.targetClaimCoverage} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </AccordionContent>
        </AccordionItem>
      ))}
    </SmartAccordion>
  );
}

function UnificationCandidatesSection({ analysis }: { analysis: Analysis }) {
  const { unificationCandidates } = analysis;

  if (unificationCandidates.length === 0) {
    return <div className="p-4 text-muted-foreground">No unification candidates found.</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead title="Nation that has the capital claim">Claimant Nation</TableHead>
          <TableHead title="Nation whose capital is claimed">Target Nation</TableHead>
          <TableHead>Claim Type</TableHead>
          <TableHead>Relationship</TableHead>
          <TableHead title="Earliest date relations can improve (cooldown active if shown)">Relations After</TableHead>
          <TableHead title="Government scores: claimant / target (red if claimant is more than 1.5 below target)">Gov Scores</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {unificationCandidates.map((candidate) => {
          const govGap = candidate.targetDemocracy - candidate.claimantDemocracy;
          const govWarning = govGap > 1.5;
          return (
          <TableRow key={`${candidate.claimantNationId}:${candidate.targetNationId}`}>
            <TableCell className="font-medium">{candidate.claimantNationName}</TableCell>
            <TableCell>{candidate.targetNationName}</TableCell>
            <TableCell>
              {candidate.isHostileClaim ? (
                <span className="text-red-600 font-medium text-xs">⚔ hostile</span>
              ) : (
                <span className="text-amber-700 font-medium text-xs">★ non-hostile</span>
              )}
            </TableCell>
            <TableCell className={RELATIONSHIP_COLORS[candidate.relationship]}>
              {RELATIONSHIP_LABELS[candidate.relationship]}
            </TableCell>
            <TableCell className="text-sm">
              {candidate.relationsCanImproveAfter ?? <span className="text-muted-foreground">–</span>}
            </TableCell>
            <TableCell className="text-sm">
              <span className={govWarning ? "text-red-600 font-medium" : ""}>
                {candidate.claimantDemocracy}
              </span>
              {" / "}
              <span>{candidate.targetDemocracy}</span>
            </TableCell>
          </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

export function getResourcesContentPanels(analysis: Analysis): ContentPanel[] {
  const playerFaction = analysis.playerFaction;
  const monthlyTxns = playerFaction.monthlyTransactionSummary as Array<{
    source: string;
    resource: string;
    amount: number;
    transactions: Array<{ date: string; amount: number }>;
  }>;
  const { permaAbandonedNationIds, id: playerFactionId } = playerFaction;
  const { nations, factionsById } = analysis;

  type TxGroup = { amount: number; transactions: Array<{ date: string; amount: number }> };
  const bySourceByResource = monthlyTxns.reduce(function(acc, curr) {
    if (!acc.has(curr.source)) {
      acc.set(curr.source, new Map([]) as Map<string, TxGroup>);
    }
    const resourceMap = acc.get(curr.source) as Map<string, TxGroup>;
    const existing = resourceMap.get(curr.resource) || { amount: 0, transactions: [] };
    existing.amount += curr.amount;
    if (curr.transactions && curr.transactions.length > 0) {
      existing.transactions.push(...curr.transactions);
    }
    resourceMap.set(curr.resource, existing);
    return acc;
  }, new Map([]) as Map<string, Map<string, TxGroup>>);

  const byResource = monthlyTxns.reduce((acc: Map<string, number>, curr) => {
    if (!acc.has(curr.resource)) {
      acc.set(curr.resource, 0);
    }
    acc.set(curr.resource, acc.get(curr.resource)! + curr.amount);
    return acc;
  }, new Map([]) as Map<string, number>);

  const resourcesSet = new Set([
    "Money",
    "Influence",
    "Operations",
    "Research",
    "Boost",
    "Water",
    "Volatiles",
    "Metals",
    "NobleMetals",
    "Fissiles",
    "Antimatter",
    "Exotics",
    ...byResource.keys(),
  ]);
  resourcesSet.delete("Projects");
  resourcesSet.delete("MissionControl");
  const resources = [...resourcesSet];

  return [
    {
      key: "transactions",
      label: "Transactions",
      icon: ListChecks,
      source: "resources",
      content: (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Source</TableHead>
              {resources.map((resource) => (
                <TableHead key={resource}>
                  {(() => {
                    const Icon = ResourceIcons[resource as keyof typeof ResourceIcons];
                    return Icon ? <Icon /> : null;
                  })()}{" "}
                  {resource}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...bySourceByResource.entries()].map(([source, resourceMap]) => (
              <TableRow key={source}>
                <TableCell>{source}</TableCell>
                {resources.map((resource) => {
                  const data = resourceMap.get(resource);
                  if (!data) return <TableCell key={resource}></TableCell>;
                  
                  const hasTooltip = (resource === "Exotics" || resource === "Antimatter") && data.transactions.length > 0;
                  const content = smartRound(data.amount);
                  
                  return (
                    <TableCell key={resource}>
                      {hasTooltip ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="cursor-help">{content}</span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="space-y-1">
                                {data.transactions.map((txn, i) => (
                                  <div key={i}>{txn.date}: {smartRound(txn.amount)}</div>
                                ))}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        content
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableHead>Total</TableHead>
              {resources.map((resource) => (
                <TableHead key={resource}>{smartRound(byResource.get(resource) || 0)}</TableHead>
              ))}
            </TableRow>
          </TableFooter>
        </Table>
      ),
    },
    {
      key: "owned",
      label: "Owned Nations",
      icon: Landmark,
      source: "resources",
      content: (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nation</TableHead>
              <TableHead>Control Points</TableHead>
              <TableHead>Opp P</TableHead>
              <TableHead>Boost P</TableHead>
              <TableHead>MC P</TableHead>
              <TableHead>Spoil P</TableHead>
              <TableHead>Unrest</TableHead>
              <TableHead>Total Spoils</TableHead>
              <TableHead>Total Spoils Per Point</TableHead>
              <TableHead>Total Spoils Per CP Cost</TableHead>
              <TableHead>Current MC / Boost</TableHead>
              <TableHead>Boost/mo Per CP Cost</TableHead>
              <TableHead>MC Per CP Cost</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {nations
              .filter((i) => i.controlPoints.some((cp) => cp.factionId === playerFactionId))
              .toSorted((a, b) => (a.totalSpoilsPerCpCost < b.totalSpoilsPerCpCost ? 1 : -1))
              .map((nation) => (
                <TableRow key={nation.id} className={getNationBg(nation)}>
                  <TableCell>{nation.displayName}</TableCell>
                  <TableCell>
                    <NationCPDetails {...{ analysis, nation }} />
                  </TableCell>
                  <TableCell>
                    {nation.allocatedPriorities.Oppression ? pct(nation.allocatedPriorities.Oppression) : null}
                  </TableCell>
                  <TableCell>
                    {nation.allocatedPriorities.LaunchFacilities
                      ? pct(nation.allocatedPriorities.LaunchFacilities)
                      : null}
                  </TableCell>
                  <TableCell>
                    {nation.allocatedPriorities.MissionControl
                      ? pct(nation.allocatedPriorities.MissionControl)
                      : null}
                  </TableCell>
                  <TableCell>
                    {nation.allocatedPriorities.Spoils ? pct(nation.allocatedPriorities.Spoils) : null}
                  </TableCell>
                  <TableCell>{nation.unrest.toFixed(2)}</TableCell>
                  <TableCell>
                    <span
                      title={`${nation.valuePerSpoilsIP.toFixed(1)} per IP * ${nation.investmentPoints.toFixed(
                        2
                      )} IP`}
                    >
                      {nation.totalSpoils.toFixed(0)}
                    </span>
                  </TableCell>
                  <TableCell>{nation.totalSpoilsPerControlPoint.toFixed(0)}</TableCell>
                  <TableCell>{nation.totalSpoilsPerCpCost.toFixed(2)}</TableCell>
                  <TableCell>
                    {nation.mc.toFixed(0)} <MissionControl /> / {nation.boostPerMonth.toFixed(2)} <Boost />
                  </TableCell>
                  <TableCell>{nation.boostPerMonthPerCpCost.toFixed(2)}</TableCell>
                  <TableCell>{nation.mcPerCpCost.toFixed(2)}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      ),
    },
    {
      key: "spoils",
      label: "Spoil Targets",
      icon: Target,
      source: "resources",
      content: (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nation</TableHead>
              <TableHead>Control Points</TableHead>
              <TableHead>Unrest</TableHead>
              <TableHead>Total Spoils</TableHead>
              <TableHead>Total Spoils Per Point</TableHead>
              <TableHead>Total Spoils Per CP Cost</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {nations
              .toSorted((a, b) => (a.totalSpoilsPerCpCost < b.totalSpoilsPerCpCost ? 1 : -1))
              .map((nation) => (
                <TableRow key={nation.id}>
                  <TableCell>{nation.displayName}</TableCell>
                  <TableCell>
                    <NationCPDetails {...{ analysis, nation }} />
                  </TableCell>
                  <TableCell>{nation.unrest.toFixed(2)}</TableCell>
                  <TableCell>
                    <span
                      title={`${nation.valuePerSpoilsIP.toFixed(1)} per IP * ${nation.investmentPoints.toFixed(
                        2
                      )} IP`}
                    >
                      {nation.totalSpoils.toFixed(0)}
                    </span>
                  </TableCell>
                  <TableCell>{nation.totalSpoilsPerControlPoint.toFixed(0)}</TableCell>
                  <TableCell>{nation.totalSpoilsPerCpCost.toFixed(2)}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      ),
    },
    {
      key: "space",
      label: "MC/Boost Targets",
      icon: MapIcon,
      source: "resources",
      content: (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nation</TableHead>
              <TableHead>Control Points</TableHead>
              <TableHead>Possible Boost IP Per CP Cost</TableHead>
              <TableHead>Current MC / Boost</TableHead>
              <TableHead>Boost/mo Per CP Cost</TableHead>
              <TableHead>MC Per CP Cost</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {nations
              .toSorted((a, b) => {
                if (a.boostPerMonthPerCpCost !== b.boostPerMonthPerCpCost) {
                  return b.possibleBoostPerCpCost - a.possibleBoostPerCpCost;
                }
                return a.boostPerMonthPerCpCost < b.boostPerMonthPerCpCost ? 1 : -1;
              })
              .map((nation) => (
                <TableRow key={nation.id}>
                  <TableCell>{nation.displayName}</TableCell>
                  <TableCell>
                    <NationCPDetails {...{ analysis, nation }} />
                  </TableCell>
                  <TableCell>{nation.possibleBoostPerCpCost.toFixed(2)}</TableCell>
                  <TableCell>
                    {nation.mc.toFixed(0)} <MissionControl /> / {nation.boostPerMonth.toFixed(2)} <Boost />
                  </TableCell>
                  <TableCell>{nation.boostPerMonthPerCpCost.toFixed(2)}</TableCell>
                  <TableCell>{nation.mcPerCpCost.toFixed(2)}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      ),
    },
    {
      key: "nation-claims",
      label: "Nation Claims",
      icon: ScrollText,
      source: "resources",
      content: <NationClaimsSection analysis={analysis} />,
    },
    {
      key: "unification-candidates",
      label: `Unification Candidates (${analysis.unificationCandidates.length})`,
      icon: Globe,
      source: "resources",
      content: <UnificationCandidatesSection analysis={analysis} />,
    },
  ];
}

export function getResourcesUi(analysis: Analysis) {
  const spoils = (analysis.playerFaction.monthlyTransactionSummary as Array<{resource: string; source: string; amount: number}>)
    .filter((i) => i.resource === "Money" && i.source === "Spoils")
    .reduce((sum, i) => sum + i.amount, 0);
  const { mcUsage, mcCurrentLimit, mcAlienWarLimit, mcHateFloor } = analysis.playerFaction;
  const nationBg = getNationBg(
    analysis.nations
      .filter((i) => i.controlPoints.some((cp) => cp.factionId === analysis.playerFaction.id))
      .reduce(
        (acc, nation) => {
          acc.wastedOppression = acc.wastedOppression || nation.wastedOppression;
          acc.tooHighUnrest = acc.tooHighUnrest || nation.tooHighUnrest;
          acc.couldBuildBoost = acc.couldBuildBoost || nation.couldBuildBoost;
          acc.spoilsWithoutAllCPs = acc.spoilsWithoutAllCPs || nation.spoilsWithoutAllCPs;
          return acc;
        },
        {
          wastedOppression: false as boolean,
          tooHighUnrest: false as boolean,
          couldBuildBoost: false as boolean,
          spoilsWithoutAllCPs: false as boolean,
        }
      )
  );

  const showMcInfo = mcUsage < 300;
  return {
    key: "resources",
    tab: (
      <>
        <span className={twMerge(nationBg, "px-1 py-0.5 -mx-1 -my-0.5 rounded")}>Resources</span>
        (<PrioritySpoils /> ${spoils.toFixed(0)}
        {showMcInfo ? (
          <>
            , <MissionControl /> {mcUsage.toFixed(0)}/{mcCurrentLimit.toFixed(0)} -
            <span title="If more MC is used than this, alien hate will never fall below 50">
              Lim {mcAlienWarLimit.toFixed(0)}
            </span>
            <span title="Current hate floor (alien hate cannot go below this due to your MC usage)">
              Flr {mcHateFloor.toFixed(0)}
            </span>
          </>
        ) : null}
        )
      </>
    ),
    content: <div />,
  };
}
