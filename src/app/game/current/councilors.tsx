"use client";

import { ShowEffects } from "@/components/showEffects";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Analysis } from "@/lib/analysis";
import { MinusCircleIcon, PlusCircleIcon } from "lucide-react";

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
  councilor: Analysis["playerCouncilors"][number];
  stats: Analysis["playerCouncilors"][number]["effectsWithOrgsAndAugments"];
  label: string;
  hasOrgs?: boolean;
  highlightMissionClassName?: (missionName: string) => string | undefined;
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
        <ShowEffects techBonuses={stats.techBonuses} />
      </TableCell>
      <TableCell>
        <ShowEffects
          missionsGrantedNames={stats.missionsGrantedNames}
          highlightMissionClassName={highlightMissionClassName}
        />
      </TableCell>
    </TableRow>
  );
}

export function getCouncilorsUi(analysis: Analysis) {
  return {
    key: "councilors",
    tab: (
      <>
        Councilors ({analysis.playerCouncilors.length}) / Orgs ({analysis.playerUnassignedOrgs.length})
      </>
    ),
    content: <CouncilorsComponent analysis={analysis} />,
  };
}

function CouncilorsComponent({ analysis }: { analysis: Analysis }) {
  const { playerMissionCounts } = analysis;
  function currentHighlightMissionClassName(missionName: string) {
    // if we have exactly 2, show yellow BG, if we have 1, show red, otherwise no change to bg
    const count = playerMissionCounts.get(missionName) || 0;
    if (count === 2) {
      return "bg-yellow-300/50";
    } else if (count === 1) {
      return "bg-red-300/50";
    }
  }
  function availableHighlightMissionClassName(missionName: string) {
    // if we have 1, show yellow BG, if we have 0, show green, otherwise no change to bg
    const count = playerMissionCounts.get(missionName) || 0;
    if (count === 1) {
      return "bg-yellow-300/50";
    } else if (count === 0) {
      return "bg-green-300/50";
    }
  }
  const playerNationIds = new Set(analysis.playerNationIds);
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
                {analysis.playerCouncilors.map((councilor) => (
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
                {analysis.playerAvailableCouncilors.map((councilor) => (
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
                {analysis.playerCouncilors.map((councilor) => (
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
                  <TableHead>Nation</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Purchase</TableHead>
                  <TableHead>Monthly</TableHead>
                  <TableHead>Effects</TableHead>
                </TableRow>
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
                          missionsGrantedNames={org.template?.missionsGrantedNames || []}
                          highlightMissionClassName={availableHighlightMissionClassName}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Collapsible>
        <CollapsibleTrigger asChild>
          <Button>Debug Data</Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <pre>{JSON.stringify(analysis.playerCouncilors, null, 2)}</pre>
          <pre>{JSON.stringify(analysis.playerAvailableCouncilors, null, 2)}</pre>
        </CollapsibleContent>
      </Collapsible>
    </>
  );
}
