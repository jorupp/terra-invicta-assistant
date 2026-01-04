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
          <TableHead>Monthly Effects</TableHead>
          <TableHead>Priorities</TableHead>
          <TableHead>Science</TableHead>
        </TableHeader>
        <TableBody>
          {analysis.playerCouncilors.map((councilor) => {
            // TODO: need to figure trait effects in somewhere too - ie. SocialScientist, Teacher, etc.
            // TODO: move all this to analysis so we can use it elsewhere
            const stats = councilor.orgs.reduce<ShowEffectsProps>(
              (acc, org) => {
                return combineEffects(acc, { ...org, techBonuses: org.template?.techBonuses });
              },
              councilor.traitTemplates.reduce<ShowEffectsProps>(
                (acc, trait) => {
                  return combineEffects(acc, {
                    incomeMoney_month: trait?.incomeMoney,
                    incomeBoost_month: trait?.incomeBoost,
                    incomeInfluence_month: trait?.incomeInfluence,
                    incomeResearch_month: trait?.incomeResearch,
                    techBonuses: trait?.techBonuses,
                  });
                },
                { ...councilor.attributes }
              )
            );
            for (const trait of councilor.traitTemplates) {
              for (const { stat, operation, strValue, condition } of trait.statMods || []) {
                if (stat && strValue && !condition && operation === "Additive") {
                  (stats as any)[stat] = ((stats as any)[stat] || 0) + Number(strValue);
                }
              }
              for (const { priority, bonus } of trait.priorityBonuses || []) {
                if (priority && bonus) {
                  const key = `${priority[0].toLowerCase()}${priority.substring(1)}Bonus` as keyof ShowEffectsProps;
                  (stats as any)[key] = ((stats as any)[key] || 0) + bonus;
                }
              }
            }
            return (
              <TableRow key={councilor.id}>
                <TableCell>{councilor.displayName}</TableCell>
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
                    // TODO: is there a case where we should show this?
                    // Loyalty={stats.Loyalty}
                  />
                </TableCell>
                <TableCell>
                  <ShowEffects tier={stats.tier} />
                </TableCell>
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
                  <ShowEffects techBonuses={stats.techBonuses} />
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
