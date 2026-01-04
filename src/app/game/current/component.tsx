"use client";

import { combineEffects, ShowEffects, ShowEffectsProps } from "@/components/showEffects";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Analysis } from "@/lib/analysis";
import { MinusCircleIcon, PlusCircleIcon } from "lucide-react";

export default function CurrentGameComponent({ analysis }: { analysis: Analysis }) {
  const playerNationIds = new Set(analysis.playerNationIds);
  return (
    <div>
      <h2>Current Game Component</h2>
      <h3>Faction: {analysis.playerFaction.displayName}</h3>

      <h3>Active Councilors:</h3>
      <Table>
        <TableHeader>
          <TableHead>Name</TableHead>
          <TableHead>Modified Stats</TableHead>
          <TableHead>Org Tiers</TableHead>
          <TableHead>Org Monthly Effects</TableHead>
          <TableHead>Org Stats</TableHead>
          <TableHead>Org Priorities</TableHead>
          <TableHead>Org Science</TableHead>
        </TableHeader>
        <TableBody>
          {analysis.playerCouncilors.map((councilor) => {
            // TODO: need to figure trait effects in somewhere too - ie. SocialScientist, Teacher, etc.
            const orgEffects = councilor.orgs.reduce<ShowEffectsProps>((acc, org) => {
              return combineEffects(acc, { ...org, techBonuses: org.template?.techBonuses });
            }, {});
            return (
              <TableRow key={councilor.id}>
                <TableCell>{councilor.displayName}</TableCell>
                <TableCell>
                  <ShowEffects
                    Persuasion={(councilor.attributes.Persuasion || 0) + (orgEffects.persuasion || 0)}
                    Command={(councilor.attributes.Command || 0) + (orgEffects.command || 0)}
                    Investigation={(councilor.attributes.Investigation || 0) + (orgEffects.investigation || 0)}
                    Espionage={(councilor.attributes.Espionage || 0) + (orgEffects.espionage || 0)}
                    Administration={(councilor.attributes.Administration || 0) + (orgEffects.administration || 0)}
                    Science={(councilor.attributes.Science || 0) + (orgEffects.science || 0)}
                    Security={(councilor.attributes.Security || 0) + (orgEffects.security || 0)}
                    ApparentLoyalty={councilor.attributes.ApparentLoyalty || 0}
                    // TODO: is there a case where we should show this?
                    // Loyalty={councilor.attributes.Loyalty}
                  />
                </TableCell>
                <TableCell>
                  <ShowEffects tier={orgEffects.tier} />
                </TableCell>
                <TableCell>
                  <ShowEffects
                    incomeBoost_month={orgEffects.incomeBoost_month}
                    incomeMoney_month={orgEffects.incomeMoney_month}
                    incomeInfluence_month={orgEffects.incomeInfluence_month}
                    incomeOps_month={orgEffects.incomeOps_month}
                    incomeMissionControl={orgEffects.incomeMissionControl}
                    incomeResearch_month={orgEffects.incomeResearch_month}
                    projectCapacityGranted={orgEffects.projectCapacityGranted}
                  />
                </TableCell>
                <TableCell>
                  <ShowEffects
                    persuasion={orgEffects.persuasion}
                    command={orgEffects.command}
                    investigation={orgEffects.investigation}
                    espionage={orgEffects.espionage}
                    administration={orgEffects.administration}
                    science={orgEffects.science}
                    security={orgEffects.security}
                  />
                </TableCell>
                <TableCell>
                  <ShowEffects
                    economyBonus={orgEffects.economyBonus}
                    welfareBonus={orgEffects.welfareBonus}
                    environmentBonus={orgEffects.environmentBonus}
                    knowledgeBonus={orgEffects.knowledgeBonus}
                    governmentBonus={orgEffects.governmentBonus}
                    unityBonus={orgEffects.unityBonus}
                    militaryBonus={orgEffects.militaryBonus}
                    oppressionBonus={orgEffects.oppressionBonus}
                    spoilsBonus={orgEffects.spoilsBonus}
                    spaceDevBonus={orgEffects.spaceDevBonus}
                    spaceflightBonus={orgEffects.spaceflightBonus}
                    MCBonus={orgEffects.MCBonus}
                    miningBonus={orgEffects.miningBonus}
                  />
                </TableCell>
                <TableCell>
                  <ShowEffects techBonuses={orgEffects.techBonuses} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <h3>Available orgs:</h3>
      <Table>
        <TableHeader>
          <TableHead>Org Name</TableHead>
          <TableHead>Nation</TableHead>
          <TableHead>Tier</TableHead>
          <TableHead>Purchase</TableHead>
          <TableHead>Monthly</TableHead>
          <TableHead>Effects</TableHead>
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
                  />
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
      <pre>{JSON.stringify(analysis.playerCouncilors, null, 2)}</pre>
      <pre>{JSON.stringify(analysis.playerAvailableCouncilors, null, 2)}</pre>
    </div>
  );
}
