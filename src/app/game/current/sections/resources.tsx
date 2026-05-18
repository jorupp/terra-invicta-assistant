"use client";

import { Analysis } from "@/lib/analysis";
import { SmartAccordion } from "@/components/ui/smart-accordion";
import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { FactionIcons } from "@/components/icons";
import { smartRound } from "@/lib/utils";
import { useState } from "react";

export function ResourcesSection({ analysis, section }: { analysis: Analysis; section?: string }) {
  const { playerFaction: { monthlyTransactionSummary, id: playerFactionId }, nations, factionsById } = analysis;

  const bySourceByResource = monthlyTransactionSummary.reduce((acc: any, curr: any) => {
    if (!acc.has(curr.source)) acc.set(curr.source, new Map());
    const resourceMap = acc.get(curr.source)!;
    const existing = resourceMap.get(curr.resource) || { amount: 0, transactions: [] };
    existing.amount += curr.amount;
    if (curr.transactions && curr.transactions.length > 0) existing.transactions.push(...curr.transactions);
    resourceMap.set(curr.resource, existing);
    return acc;
  }, new Map());

  const byResource = monthlyTransactionSummary.reduce((acc: any, curr: any) => {
    if (!acc.has(curr.resource)) acc.set(curr.resource, 0);
    acc.set(curr.resource, acc.get(curr.resource)! + curr.amount);
    return acc;
  }, new Map());

  const resourcesSet = new Set(["Money", "Influence", "Operations", "Research", "Boost", "Water", "Volatiles", "Metals", "NobleMetals", "Fissiles", "Antimatter", "Exotics", ...byResource.keys()]);
  resourcesSet.delete("Projects");
  resourcesSet.delete("MissionControl");
  const resources = [...resourcesSet];

  const getNationBg = (nation: any) => {
    const classes: string[] = [];
    if (nation.couldBuildBoost) classes.push("bg-green-100");
    if (nation.tooHighUnrest) classes.push("bg-yellow-100");
    if (nation.spoilsWithoutAllCPs) classes.push("bg-yellow-100");
    if (nation.wastedOppression) classes.push("bg-red-100");
    return classes.join(" ");
  };

  const RELATIONSHIP_LABELS: Record<string, string> = { war: "War", federation: "Federation", ally: "Ally", neutral: "Neutral", rival: "Rival" };
  const RELATIONSHIP_COLORS: Record<string, string> = { war: "text-red-600 font-bold", federation: "text-blue-700 font-medium", ally: "text-green-700 font-medium", neutral: "", rival: "text-red-700 font-medium" };

  function NationCPDetails({ nation }: { nation: Analysis["nations"][0] }) {
    return (
      <>
        {nation.controlPoints.length ? nation.controlPoints.map((cp: any) => {
          const faction = factionsById.get(cp.factionId!);
          const FactionIcon = faction ? FactionIcons[faction.templateName as keyof typeof FactionIcons] : null;
          return <span key={cp.id} className="inline-block p-1 rounded bg-green-100">+</span>;
        }) : null}
        ({smartRound(nation.totalCpCost)} cost, {smartRound(nation.investmentPoints)} IP)
      </>
    );
  }

  const CLAIM_COVERAGE_CELL = (coverage: any) => {
    if (coverage.totalRegions === 0) return <span className="text-muted-foreground">N/A</span>;
    const allCovered = coverage.missing === 0;
    if (allCovered && coverage.hostile === 0) return <span className="text-green-600 font-medium" title="All regions covered, all non-hostile">✓ all</span>;
    if (allCovered) return <span className="text-amber-600 font-medium" title={`All regions covered, but ${coverage.hostile} hostile`}>✓ all <span className="text-red-500 text-xs">({coverage.hostile}⚔)</span></span>;
    const missingLabel = `${coverage.missing} of ${coverage.totalRegions} missing`;
    const hostileNote = coverage.hostile > 0 ? `, ${coverage.hostile}⚔` : "";
    return <span className="text-red-600 text-xs font-medium" title={missingLabel + hostileNote}>−{coverage.missing}/{coverage.totalRegions}</span>;
  };

  if (section === "transactions") {
    return (
      <SmartAccordion type="single" collapsible defaultValue="transactions" storageKey="resourcesAccordion">
        <AccordionItem value="transactions">
          <AccordionTrigger><span>Transactions</span></AccordionTrigger>
          <AccordionContent>
            <Table>
              <TableHeader>
                <TableRow><TableHead>Source</TableHead>{resources.map((resource) => <TableHead key={resource}>{resource}</TableHead>)}</TableRow>
              </TableHeader>
              <TableBody>
                {[...bySourceByResource.entries()].map(([source, resourceMap]: any) => (
                  <TableRow key={source}>
                    <TableCell>{source}</TableCell>
                    {resources.map((resource: string) => {
                      const data = resourceMap.get(resource);
                      if (!data) return <TableCell key={resource}></TableCell>;
                      const hasTooltip = (resource === "Exotics" || resource === "Antimatter") && data.transactions.length > 0;
                      const content = smartRound(data.amount);
                      return (
                        <TableCell key={resource}>
                          {hasTooltip ? (
                            <TooltipProvider><Tooltip><TooltipTrigger asChild><span className="cursor-help">{content}</span></TooltipTrigger><TooltipContent><div className="space-y-1">{data.transactions.map((txn: any, i: number) => <div key={i}>{txn.date}: {smartRound(txn.amount)}</div>)}</div></TooltipContent></Tooltip></TooltipProvider>
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
                  {resources.map((resource: string) => <TableHead key={resource}>{smartRound(byResource.get(resource) || 0)}</TableHead>)}
                </TableRow>
              </TableFooter>
            </Table>
          </AccordionContent>
        </AccordionItem>
      </SmartAccordion>
    );
  }

  if (section === "owned") {
    return (
      <AccordionItem value="owned">
        <AccordionTrigger><span>Owned nations</span></AccordionTrigger>
        <AccordionContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nation</TableHead><TableHead>Control Points</TableHead><TableHead>Opp P</TableHead><TableHead>Boost P</TableHead><TableHead>MC P</TableHead><TableHead>Spoil P</TableHead>
                <TableHead>Unrest</TableHead><TableHead>Total Spoils</TableHead><TableHead>Total Spoils Per Point</TableHead><TableHead>Total Spoils Per CP Cost</TableHead>
                <TableHead>Current MC / Boost</TableHead><TableHead>Boost/mo Per CP Cost</TableHead><TableHead>MC Per CP Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {nations.filter((i: any) => i.controlPoints.some((cp: any) => cp.factionId === playerFactionId)).toSorted((a: any, b: any) => (a.totalSpoilsPerCpCost < b.totalSpoilsPerCpCost ? 1 : -1)).map((nation: any) => (
                <TableRow key={nation.id} className={getNationBg(nation)}>
                  <TableCell>{nation.displayName}</TableCell>
                  <TableCell><NationCPDetails nation={nation} /></TableCell>
                  <TableCell>{nation.allocatedPriorities.Oppression?.toFixed(2) ?? null}</TableCell>
                  <TableCell>{nation.allocatedPriorities.LaunchFacilities?.toFixed(2) ?? null}</TableCell>
                  <TableCell>{nation.allocatedPriorities.MissionControl?.toFixed(2) ?? null}</TableCell>
                  <TableCell>{nation.allocatedPriorities.Spoils?.toFixed(2) ?? null}</TableCell>
                  <TableCell>{nation.unrest.toFixed(2)}</TableCell>
                  <TableCell>{nation.totalSpoils.toFixed(0)}</TableCell>
                  <TableCell>{nation.totalSpoilsPerControlPoint.toFixed(0)}</TableCell>
                  <TableCell>{nation.totalSpoilsPerCpCost.toFixed(2)}</TableCell>
                  <TableCell>{nation.mc.toFixed(0)} MC / {nation.boostPerMonth.toFixed(2)} Boost</TableCell>
                  <TableCell>{nation.boostPerMonthPerCpCost.toFixed(2)}</TableCell>
                  <TableCell>{nation.mcPerCpCost.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </AccordionContent>
      </AccordionItem>
    );
  }

  if (section === "spoils") {
    return (
      <AccordionItem value="spoils">
        <AccordionTrigger><span>Spoil targets</span></AccordionTrigger>
        <AccordionContent>
          <Table>
            <TableHeader>
              <TableRow><TableHead>Nation</TableHead><TableHead>Control Points</TableHead><TableHead>Unrest</TableHead><TableHead>Total Spoils</TableHead><TableHead>Total Spoils Per Point</TableHead><TableHead>Total Spoils Per CP Cost</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {nations.toSorted((a: any, b: any) => (a.totalSpoilsPerCpCost < b.totalSpoilsPerCpCost ? 1 : -1)).map((nation: any) => (
                <TableRow key={nation.id}>
                  <TableCell>{nation.displayName}</TableCell>
                  <TableCell><NationCPDetails nation={nation} /></TableCell>
                  <TableCell>{nation.unrest.toFixed(2)}</TableCell>
                  <TableCell>{nation.totalSpoils.toFixed(0)}</TableCell>
                  <TableCell>{nation.totalSpoilsPerControlPoint.toFixed(0)}</TableCell>
                  <TableCell>{nation.totalSpoilsPerCpCost.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </AccordionContent>
      </AccordionItem>
    );
  }

  if (section === "mc-boost") {
    return (
      <AccordionItem value="space">
        <AccordionTrigger><span>MC/Boost targets</span></AccordionTrigger>
        <AccordionContent>
          <Table>
            <TableHeader>
              <TableRow><TableHead>Nation</TableHead><TableHead>Control Points</TableHead><TableHead>Possible Boost IP Per CP Cost</TableHead><TableHead>Current MC / Boost</TableHead><TableHead>Boost/mo Per CP Cost</TableHead><TableHead>MC Per CP Cost</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {nations.toSorted((a: any, b: any) => { if (a.boostPerMonthPerCpCost !== b.boostPerMonthPerCpCost) return b.possibleBoostPerCpCost - a.possibleBoostPerCpCost; return a.boostPerMonthPerCpCost < b.boostPerMonthPerCpCost ? 1 : -1; }).map((nation: any) => (
                <TableRow key={nation.id}>
                  <TableCell>{nation.displayName}</TableCell>
                  <TableCell><NationCPDetails nation={nation} /></TableCell>
                  <TableCell>{nation.possibleBoostPerCpCost.toFixed(2)}</TableCell>
                  <TableCell>{nation.mc.toFixed(0)} MC / {nation.boostPerMonth.toFixed(2)} Boost</TableCell>
                  <TableCell>{nation.boostPerMonthPerCpCost.toFixed(2)}</TableCell>
                  <TableCell>{nation.mcPerCpCost.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </AccordionContent>
      </AccordionItem>
    );
  }

  if (section === "claims") {
    if (analysis.nationClaims.length === 0) return <p className="text-sm text-muted-foreground">No claims found on nations you control.</p>;
    return (
      <SmartAccordion type="multiple" storageKey="nationClaimsAccordion">
        {analysis.nationClaims.map((entry: any) => (
          <AccordionItem key={entry.nationId} value={String(entry.nationId)}>
            <AccordionTrigger>{entry.nationName} ({entry.targets.length} targets)</AccordionTrigger>
            <AccordionContent>
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Target Nation</TableHead><TableHead>Relationship</TableHead><TableHead>Relations After</TableHead><TableHead>War After</TableHead><TableHead>Executive Faction</TableHead><TableHead>Co-claimants</TableHead><TableHead>All Current?</TableHead><TableHead>All Claimed?</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {entry.targets.map((target: any) => (
                    <TableRow key={target.targetNationId}>
                      <TableCell>{target.targetNationName}</TableCell>
                      <TableCell className={RELATIONSHIP_COLORS[target.relationship]}>{RELATIONSHIP_LABELS[target.relationship]}</TableCell>
                      <TableCell className="text-sm">{target.relationsCanImproveAfter ?? "–"}</TableCell>
                      <TableCell className="text-sm">{target.warActionAfter ?? "–"}</TableCell>
                      <TableCell className="text-sm">{target.executiveFactionName ?? "Uncontrolled"}</TableCell>
                      <TableCell className="text-sm">{target.otherPlayerCapitalClaimants.length > 0 ? target.otherPlayerCapitalClaimants.map((c: any) => c.nationName).join(", ") : "–"}</TableCell>
                      <TableCell className="text-sm">{CLAIM_COVERAGE_CELL(target.currentRegionCoverage)}</TableCell>
                      <TableCell className="text-sm">{CLAIM_COVERAGE_CELL(target.targetClaimCoverage)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </AccordionContent>
          </AccordionItem>
        ))}
      </SmartAccordion>
    );
  }

  if (section === "unification") {
    if (analysis.unificationCandidates.length === 0) return <div className="p-4 text-muted-foreground">No unification candidates found.</div>;
    return (
      <AccordionItem value="unification-candidates">
        <AccordionTrigger><span>Unification Candidates ({analysis.unificationCandidates.length})</span></AccordionTrigger>
        <AccordionContent>
          <Table>
            <TableHeader>
              <TableRow><TableHead>Claimant Nation</TableHead><TableHead>Target Nation</TableHead><TableHead>Claim Type</TableHead><TableHead>Relationship</TableHead><TableHead>Relations After</TableHead><TableHead>Gov Scores</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {analysis.unificationCandidates.map((candidate: any) => {
                const govGap = candidate.targetDemocracy - candidate.claimantDemocracy;
                const govWarning = govGap > 1.5;
                return (
                  <TableRow key={`${candidate.claimantNationId}:${candidate.targetNationId}`}>
                    <TableCell className="font-medium">{candidate.claimantNationName}</TableCell>
                    <TableCell>{candidate.targetNationName}</TableCell>
                    <TableCell>{candidate.isHostileClaim ? <span className="text-red-600 text-xs">⚔ hostile</span> : <span className="text-amber-700 text-xs">★ non-hostile</span>}</TableCell>
                    <TableCell className={RELATIONSHIP_COLORS[candidate.relationship]}>{RELATIONSHIP_LABELS[candidate.relationship]}</TableCell>
                    <TableCell className="text-sm">{candidate.relationsCanImproveAfter ?? "–"}</TableCell>
                    <TableCell className="text-sm"><span className={govWarning ? "text-red-600 font-medium" : ""}>{candidate.claimantDemocracy} / {candidate.targetDemocracy}</span></TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </AccordionContent>
      </AccordionItem>
    );
  }

  return null;
}
