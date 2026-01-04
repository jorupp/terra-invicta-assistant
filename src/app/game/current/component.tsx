"use client";

import { Currency } from "@/components/icons";
import { ShowEffects } from "@/components/showEffects";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Analysis } from "@/lib/analysis";
import { Minus, MinusCircle, MinusCircleIcon, Plus, PlusCircleIcon } from "lucide-react";

export default function CurrentGameComponent({ analysis }: { analysis: Analysis }) {
  const playerNationIds = new Set(analysis.playerNationIds);
  return (
    <div>
      <h2>Current Game Component</h2>
      <h3>Faction: {analysis.playerFaction.displayName}</h3>

      <h3>Available orgs:</h3>
      <Table>
        <TableHeader>
          <TableHead>Org Name</TableHead>
          <TableHead>Nation</TableHead>
          <TableHead>Purchase</TableHead>
          <TableHead>Monthly</TableHead>
        </TableHeader>
        <TableBody>
          {analysis.playerAvailableOrgs
            .map((i) => ({ type: "available", ...i }))
            .concat(analysis.playerUnassignedOrgs.map((i) => ({ type: "unassigned", ...i })))
            .map((org) => (
              <TableRow key={org.id}>
                <TableCell>{org.displayName}</TableCell>
                <TableCell>
                  {org.template?.requiresNationality ? (
                    <span className="mr-1" title={org.homeNationName || ""}>
                      {playerNationIds.has(org.homeNationId || -1) ? (
                        <PlusCircleIcon className="inline h-4 w-4 -mt-1" />
                      ) : (
                        <MinusCircleIcon className="inline h-4 w-4 stroke-destructive -mt-1" />
                      )}
                    </span>
                  ) : (
                    ""
                  )}
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
                  />
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
      <pre>{JSON.stringify(analysis.playerAvailableOrgs?.[0], null, 2)}</pre>
    </div>
  );
}
