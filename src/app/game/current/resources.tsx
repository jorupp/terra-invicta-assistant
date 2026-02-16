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
import { diffDateTime, smartRound, sortByDateTime, toDays } from "@/lib/utils";
import { Trash2 } from "lucide-react";
import { twMerge } from "tailwind-merge";

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

export function getResourcesUi(analysis: Analysis) {
  const spoils = analysis.playerFaction.monthlyTransactionSummary
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

  // once you're using over 300mc, you're not worried about your MC hate floor anymore.
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
    content: (
      <ResourcesComponent
        {...{
          analysis,
        }}
      />
    ),
  };
}

function ResourcesComponent({ analysis }: { analysis: Analysis }) {
  const {
    playerFaction: { monthlyTransactionSummary, permaAbandonedNationIds, id: playerFactionId },
    nations,
    factionsById,
  } = analysis;

  const bySourceByResource = monthlyTransactionSummary.reduce((acc, curr) => {
    if (!acc.has(curr.source)) {
      acc.set(curr.source, new Map<string, { amount: number; transactions: { date: string; amount: number }[] }>());
    }
    const resourceMap = acc.get(curr.source)!;
    const existing = resourceMap.get(curr.resource) || { amount: 0, transactions: [] };
    existing.amount += curr.amount;
    if (curr.transactions && curr.transactions.length > 0) {
      existing.transactions.push(...curr.transactions);
    }
    resourceMap.set(curr.resource, existing);
    return acc;
  }, new Map<string, Map<string, { amount: number; transactions: { date: string; amount: number }[] }>>());

  const byResource = monthlyTransactionSummary.reduce((acc, curr) => {
    if (!acc.has(curr.resource)) {
      acc.set(curr.resource, 0);
    }
    acc.set(curr.resource, acc.get(curr.resource)! + curr.amount);
    return acc;
  }, new Map<string, number>());

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
  // these aren't really an "income"-style resource
  resourcesSet.delete("Projects");
  resourcesSet.delete("MissionControl");
  const resources = [...resourcesSet];

  return (
    <div className="space-y-2">
      <SmartAccordion type="single" collapsible defaultValue="transactions" storageKey="resources-accordion">
        <AccordionItem value="transactions">
          <AccordionTrigger>
            <span>Transactions</span>
          </AccordionTrigger>
          <AccordionContent>
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
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="owned">
          <AccordionTrigger>Owned nations</AccordionTrigger>
          <AccordionContent>
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
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="spoils">
          <AccordionTrigger>Spoil targets</AccordionTrigger>
          <AccordionContent>
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
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="space">
          <AccordionTrigger>MC/Boost targets</AccordionTrigger>
          <AccordionContent>
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
          </AccordionContent>
        </AccordionItem>
      </SmartAccordion>

      <Collapsible>
        <CollapsibleTrigger asChild>
          <Button variant="outline">Debug Data</Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <pre>{JSON.stringify(monthlyTransactionSummary, null, 2)}</pre>
          <pre>{JSON.stringify(nations, null, 2)}</pre>
        </CollapsibleContent>
      </Collapsible>
    </div>
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
