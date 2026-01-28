"use client";

import { Boost, ControlPoint, FactionIcons, MissionControl, PrioritySpoils } from "@/components/icons";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Analysis } from "@/lib/analysis";
import { diffDateTime, smartRound, sortByDateTime, toDays } from "@/lib/utils";
import { Trash2 } from "lucide-react";
import { twMerge } from "tailwind-merge";

export function getResourcesUi(analysis: Analysis) {
  const spoils = analysis.playerFaction.monthlyTransactionSummary
    .filter((i) => i.resource === "Money" && i.source === "Spoils")
    .reduce((sum, i) => sum + i.amount, 0);
  const { mcUsage, mcCurrentLimit, mcAlienWarLimit } = analysis.playerFaction;

  return {
    key: "resources",
    tab: (
      <>
        Resources (<PrioritySpoils /> ${spoils.toFixed(0)}, <MissionControl /> {mcUsage.toFixed(0)}/
        {mcCurrentLimit.toFixed(0)} -
        <span title="If more MC is used than this, alien hate will never fall below 50">
          Lim {mcAlienWarLimit.toFixed(0)}
        </span>
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
      acc.set(curr.source, new Map<string, number>());
    }
    const resourceMap = acc.get(curr.source)!;
    resourceMap.set(curr.resource, (resourceMap.get(curr.resource) || 0) + curr.amount);
    return acc;
  }, new Map<string, Map<string, number>>());

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
    "Nuclear",
    "Exotics",
    ...byResource.keys(),
  ]);
  // these aren't really an "income"-style resource
  resourcesSet.delete("Projects");
  resourcesSet.delete("MissionControl");
  const resources = [...resourcesSet];

  return (
    <>
      <Accordion type="single" collapsible defaultValue="transactions">
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
                    <TableHead key={resource}>{resource}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...bySourceByResource.entries()].map(([source, resourceMap]) => (
                  <TableRow key={source}>
                    <TableCell>{source}</TableCell>
                    {resources.map((resource) => (
                      <TableCell key={resource}>
                        {resourceMap.has(resource) ? smartRound(resourceMap.get(resource)!) : null}
                      </TableCell>
                    ))}
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
                  <TableHead>Current MC / Boost</TableHead>
                  <TableHead>Boost/mo Per CP Cost</TableHead>
                  <TableHead>MC Per CP Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {nations
                  .toSorted((a, b) => (a.boostPerMonthPerCpCost < b.boostPerMonthPerCpCost ? 1 : -1))
                  .map((nation) => (
                    <TableRow key={nation.id}>
                      <TableCell>{nation.displayName}</TableCell>
                      <TableCell>
                        <NationCPDetails {...{ analysis, nation }} />
                      </TableCell>
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
      </Accordion>

      <br />
      <Collapsible>
        <CollapsibleTrigger asChild>
          <Button variant="outline">Debug Data</Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <pre>{JSON.stringify(monthlyTransactionSummary, null, 2)}</pre>
          <pre>{JSON.stringify(nations, null, 2)}</pre>
        </CollapsibleContent>
      </Collapsible>
    </>
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
      ({nation.totalCpCost.toFixed(0)} cost, {nation.investmentPoints.toFixed(0)} IP)
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
