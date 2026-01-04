"use client";

import { ShowEffects } from "@/components/showEffects";
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
            const stats = councilor.effectsWithOrgs;
            return (
              <>
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

                <TableRow key={`${councilor.id}-base`}>
                  <TableCell>{councilor.displayName} (Unmodified)</TableCell>
                  <TableCell>
                    <ShowEffects
                      persuasion={councilor.effectsBaseAndTraits.persuasion}
                      command={councilor.effectsBaseAndTraits.command}
                      investigation={councilor.effectsBaseAndTraits.investigation}
                      espionage={councilor.effectsBaseAndTraits.espionage}
                      administration={councilor.effectsBaseAndTraits.administration}
                      science={councilor.effectsBaseAndTraits.science}
                      security={councilor.effectsBaseAndTraits.security}
                      Persuasion={councilor.effectsBaseAndTraits.Persuasion}
                      Command={councilor.effectsBaseAndTraits.Command}
                      Investigation={councilor.effectsBaseAndTraits.Investigation}
                      Espionage={councilor.effectsBaseAndTraits.Espionage}
                      Administration={councilor.effectsBaseAndTraits.Administration}
                      Science={councilor.effectsBaseAndTraits.Science}
                      Security={councilor.effectsBaseAndTraits.Security}
                      ApparentLoyalty={councilor.effectsBaseAndTraits.ApparentLoyalty}
                      // TODO: is there a case where we should show this?
                      // Loyalty={councilor.effectsBaseAndTraits.Loyalty}
                    />
                  </TableCell>
                  <TableCell>
                    <ShowEffects tier={councilor.effectsBaseAndTraits.tier} />
                  </TableCell>
                  <TableCell>
                    <ShowEffects
                      incomeBoost_month={councilor.effectsBaseAndTraits.incomeBoost_month}
                      incomeMoney_month={councilor.effectsBaseAndTraits.incomeMoney_month}
                      incomeInfluence_month={councilor.effectsBaseAndTraits.incomeInfluence_month}
                      incomeOps_month={councilor.effectsBaseAndTraits.incomeOps_month}
                      incomeMissionControl={councilor.effectsBaseAndTraits.incomeMissionControl}
                      incomeResearch_month={councilor.effectsBaseAndTraits.incomeResearch_month}
                      projectCapacityGranted={councilor.effectsBaseAndTraits.projectCapacityGranted}
                    />
                  </TableCell>
                  <TableCell>
                    <ShowEffects
                      economyBonus={councilor.effectsBaseAndTraits.economyBonus}
                      welfareBonus={councilor.effectsBaseAndTraits.welfareBonus}
                      environmentBonus={councilor.effectsBaseAndTraits.environmentBonus}
                      knowledgeBonus={councilor.effectsBaseAndTraits.knowledgeBonus}
                      governmentBonus={councilor.effectsBaseAndTraits.governmentBonus}
                      unityBonus={councilor.effectsBaseAndTraits.unityBonus}
                      militaryBonus={councilor.effectsBaseAndTraits.militaryBonus}
                      oppressionBonus={councilor.effectsBaseAndTraits.oppressionBonus}
                      spoilsBonus={councilor.effectsBaseAndTraits.spoilsBonus}
                      spaceDevBonus={councilor.effectsBaseAndTraits.spaceDevBonus}
                      spaceflightBonus={councilor.effectsBaseAndTraits.spaceflightBonus}
                      MCBonus={councilor.effectsBaseAndTraits.MCBonus}
                      miningBonus={councilor.effectsBaseAndTraits.miningBonus}
                    />
                  </TableCell>
                  <TableCell>
                    <ShowEffects techBonuses={councilor.effectsBaseAndTraits.techBonuses} />
                  </TableCell>
                </TableRow>
              </>
            );
          })}
        </TableBody>
      </Table>

      <h3>Available Councilors:</h3>
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
          {analysis.playerAvailableCouncilors.map((councilor) => {
            const stats = councilor.effectsWithOrgs;
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
