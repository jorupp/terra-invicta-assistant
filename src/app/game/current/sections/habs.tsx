"use client";

import { Analysis } from "@/lib/analysis";
import { SmartAccordion } from "@/components/ui/smart-accordion";
import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ShowEffects, ShowEffectsProps, combineEffects } from "@/components/showEffects";
import { TechnologyGoalsDialog, TechnologyGoalsList, useTechnologyGoals } from "../technologyGoals";
import { formatDateTime } from "@/lib/utils";
import { useState } from "react";

const MineResourceType = { Water: "water", Volatiles: "volatiles", Metals: "metals", Nobles: "nobles", Fissiles: "fissiles" };

type MineResourceType = "water" | "volatiles" | "metals" | "nobles" | "fissiles" | null;
type MineSortDirection = "asc" | "desc" | null;

export function HabsSection({ analysis, section }: { analysis: Analysis; section?: string }) {
  const { playerHabs } = analysis;
  const time = formatDateTime(analysis.gameCurrentDateTime);
  const { goals, addGoal, removeGoal } = useTechnologyGoals(analysis);
  const [mineSortResource, setMineSortResource] = useState<MineResourceType>(null);
  const [mineSortDirection, setMineSortDirection] = useState<MineSortDirection>(null);

  const activeEffects = playerHabs.reduce<ShowEffectsProps>((acc, hab) => combineEffects(acc, hab.activeEffects), {});
  const potentialEffects = playerHabs.reduce<ShowEffectsProps>((acc, hab) => combineEffects(acc, hab.potentialEffects), {});
  const habsWithoutSolarPowerMultipler = playerHabs.filter((hab: any) => hab.hasSolar && !hab.solarMultiplier).toSorted((a: any, b: any) => a.finderSortOverride - b.finderSortOverride);

  const sortedMineHabs = [...playerHabs].filter((i: any) => i.habType === "Base").sort((a: any, b: any) => {
    if (!mineSortResource || !mineSortDirection) return 0;
    const resourceKey = `${mineSortResource}_month` as keyof typeof a.currentMinePoweredEffects;
    const aValue = a.currentMinePoweredEffects[resourceKey];
    const bValue = b.currentMinePoweredEffects[resourceKey];
    return mineSortDirection === "asc" ? aValue < bValue ? -1 : aValue > bValue ? 1 : 0 : bValue < aValue ? -1 : bValue > aValue ? 1 : 0;
  });

  const handleMineResourceSort = (resource: MineResourceType) => {
    if (mineSortResource === resource) {
      if (mineSortDirection === "desc") setMineSortDirection("asc");
      else { setMineSortResource(null); setMineSortDirection(null); }
    } else {
      setMineSortResource(resource);
      setMineSortDirection("desc");
    }
  };

  const activeMineSummary = playerHabs.filter((h: any) => h.site).reduce((acc: any, hab: any) => {
    const effects = hab.currentMineEffects;
    if (effects.water_month > 0 || effects.volatiles_month > 0 || effects.metals_month > 0 || effects.nobles_month > 0 || effects.fissiles_month > 0) {
      acc.count++;
      acc.water_month += effects.water_month;
      acc.volatiles_month += effects.volatiles_month;
      acc.metals_month += effects.metals_month;
      acc.nobles_month += effects.nobles_month;
      acc.fissiles_month += effects.fissiles_month;
    }
    return acc;
  }, { count: 0, water_month: 0, volatiles_month: 0, metals_month: 0, nobles_month: 0, fissiles_month: 0, miningModifier: 0 });

  const mineSummary = playerHabs.filter((h: any) => h.site).reduce((acc: any, hab: any) => {
    const effects = hab.bestMineEffects;
    acc.count++;
    acc.water_month += effects.water_month;
    acc.volatiles_month += effects.volatiles_month;
    acc.metals_month += effects.metals_month;
    acc.nobles_month += effects.nobles_month;
    acc.fissiles_month += effects.fissiles_month;
    return acc;
  }, { count: 0, water_month: 0, volatiles_month: 0, metals_month: 0, nobles_month: 0, fissiles_month: 0, miningModifier: 0 });

  if (section === "bonuses") {
    return (
      <SmartAccordion type="multiple" storageKey="habsBonuses" defaultValue={["current-bonuses", "future-bonuses", "boost-mc-summary", "alien-hate"]}>
        <AccordionItem value="current-bonuses">
          <AccordionTrigger><span>Current Hab bonuses</span></AccordionTrigger>
          <AccordionContent><HabScienceEffects effects={activeEffects} /></AccordionContent>
        </AccordionItem>
        <AccordionItem value="future-bonuses">
          <AccordionTrigger><span>Future Hab bonuses</span></AccordionTrigger>
          <AccordionContent><HabScienceEffects effects={potentialEffects} /></AccordionContent>
        </AccordionItem>
        <AccordionItem value="boost-mc-summary">
          <AccordionTrigger><span>MC/Boost Income Summary</span></AccordionTrigger>
          <AccordionContent>
            <div className="flex space-x-4 pb-4">
              <span>
                Boost: {analysis.playerFaction.nationHistory.currentBoost.toFixed(2)}
                {analysis.playerFaction.nationHistory.boostMonthlyChange !== 0 && (
                  <span className={analysis.playerFaction.nationHistory.boostMonthlyChange > 0 ? "text-green-600" : "text-red-600"}>
                    {" "}({analysis.playerFaction.nationHistory.boostMonthlyChange > 0 ? "+" : ""}{analysis.playerFaction.nationHistory.boostMonthlyChange.toFixed(2)})
                  </span>
                )}
              </span>
              <span>
                MC: {analysis.playerFaction.nationHistory.currentMC.toFixed(0)}
                {analysis.playerFaction.nationHistory.mcMonthlyChange !== 0 && (
                  <span className={analysis.playerFaction.nationHistory.mcMonthlyChange > 0 ? "text-green-600" : "text-red-600"}>
                    {" "}({analysis.playerFaction.nationHistory.mcMonthlyChange > 0 ? "+" : ""}{analysis.playerFaction.nationHistory.mcMonthlyChange.toFixed(0)})
                  </span>
                )}
              </span>
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="alien-hate">
          <AccordionTrigger><span>Alien Hate</span></AccordionTrigger>
          <AccordionContent>
            <div className="space-y-1">
              <div><strong>Current Alien Strategy:</strong> {analysis.alienFaction.defaultPriorityPresetTemplateName || "Unknown"}</div>
              <div><strong>Active Goals (Top 10 of {analysis.expandedAlienGoals.length} by Importance):</strong></div>
              <ul className="ml-4 mt-1 text-sm space-y-0.5">
                {analysis.expandedAlienGoals.slice(0, 10).map((goal: any) => (
                  <li key={goal.id}>
                    <strong>{goal.type}</strong> ({goal.importance}){goal.nation && `: ${goal.nation.displayName}`}
                    {goal.hab && `: ${goal.hab.displayName}${goal.hab.bodyName ? ` (${goal.hab.bodyName})` : ""}`}
                    {goal.attackTarget && `: ${goal.attackTarget.displayName}`}
                    {goal.assignedFleet && `, Assigned: ${goal.assignedFleet.displayName}`}
                  </li>
                ))}
              </ul>
              {analysis.expandedAlienGoals.length > 10 && (
                <Collapsible className="mt-2">
                  <CollapsibleTrigger className="text-sm text-blue-500 hover:underline ml-4">Show {analysis.expandedAlienGoals.length - 10} more goals...</CollapsibleTrigger>
                  <CollapsibleContent>
                    <ul className="ml-4 mt-1 text-sm space-y-0.5">
                      {analysis.expandedAlienGoals.slice(10).map((goal: any) => (
                        <li key={goal.id}><strong>{goal.type}</strong> ({goal.importance})</li>
                      ))}
                    </ul>
                  </CollapsibleContent>
                </Collapsible>
              )}
              <div><strong>Alien Hate of Player:</strong> {analysis.alienFaction.factionHate?.get(analysis.playerFaction.id)?.toFixed(1) ?? "Unknown"}</div>
              <div><strong>Assessed Alien Hate of Player:</strong> {analysis.playerFaction.assessedAlienHateOfMe?.toFixed(1) ?? "Unknown"}</div>
              <div><strong>Last Fixed Hate Date:</strong> {analysis.playerFaction.lastDateOfFixedAlienHate ? String(analysis.playerFaction.lastDateOfFixedAlienHate) : "Never"}</div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </SmartAccordion>
    );
  }

  if (section === "building") {
    return (
      <AccordionItem value="building-details">
        <AccordionTrigger><span>Building Details</span></AccordionTrigger>
        <AccordionContent>
          <Table>
            <TableHeader><TableRow><TableHead>Building</TableHead><TableHead className="text-right">Current Count</TableHead><TableHead className="text-right">Future Count</TableHead><TableHead>Current Bonuses</TableHead><TableHead>Future Bonuses</TableHead></TableRow></TableHeader>
            <TableBody>
              {analysis.buildingSummary.map((building: any) => (
                <TableRow key={building.templateName}>
                  <TableCell>{building.friendlyName}</TableCell>
                  <TableCell className="text-right">{building.currentCount}</TableCell>
                  <TableCell className="text-right">{building.futureCount}</TableCell>
                  <TableCell><HabScienceEffects effects={building.currentEffects} /></TableCell>
                  <TableCell><HabScienceEffects effects={building.futureEffects} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </AccordionContent>
      </AccordionItem>
    );
  }

  if (section === "projects") {
    return (
      <SmartAccordion type="multiple" storageKey="habsProjects">
        {analysis.playerFaction.availableBoostProjects.length > 0 && (
          <AccordionItem value="available-boost-projects"><AccordionTrigger><span>Available Boost Projects</span></AccordionTrigger><AccordionContent><ul>{analysis.playerFaction.availableBoostProjects.toSorted((a: any, b: any) => a.researchCost - b.researchCost).map((project: any, ix: number) => <li key={ix}>{project.friendlyName} ({project.researchCost})</li>)}</ul></AccordionContent></AccordionItem>
        )}
        {analysis.playerFaction.availableCPProjects.length > 0 && (
          <AccordionItem value="available-cp-projects"><AccordionTrigger><span>Available Control Point Projects</span></AccordionTrigger><AccordionContent><ul>{analysis.playerFaction.availableCPProjects.toSorted((a: any, b: any) => { const aRem = a.researchCost - a.currentProgress; const bRem = b.researchCost - b.currentProgress; const aEff = aRem > 0 ? a.cpBonus / aRem : 0; const bEff = bRem > 0 ? b.cpBonus / bRem : 0; return bEff - aEff; }).map((project: any, ix: number) => <li key={ix}>{project.friendlyName} ({project.currentProgress.toFixed(0)}/{project.researchCost}, +{project.cpBonus} CP)</li>)}</ul></AccordionContent></AccordionItem>
        )}
        {analysis.playerFaction.availableMaxOrgProjects.length > 0 && (
          <AccordionItem value="available-max-org-projects"><AccordionTrigger><span>Available Max Org Projects</span></AccordionTrigger><AccordionContent><ul>{analysis.playerFaction.availableMaxOrgProjects.toSorted((a: any, b: any) => a.researchCost - b.researchCost).map((project: any, ix: number) => <li key={ix}>{project.friendlyName} ({project.researchCost})</li>)}</ul></AccordionContent></AccordionItem>
        )}
        {analysis.playerFaction.availableExpandNationProjects.length > 0 && (
          <AccordionItem value="available-expand-nation-projects"><AccordionTrigger><span>Available Expand Nations</span></AccordionTrigger><AccordionContent><ul>{analysis.playerFaction.availableExpandNationProjects.toSorted((a: any, b: any) => { const aRem = a.researchCost - a.currentProgress; const bRem = b.researchCost - b.currentProgress; return aRem - bRem; }).map((project: any, ix: number) => <li key={ix}>{project.friendlyName} ({project.currentProgress.toFixed(0)}/{project.researchCost}, {project.requiresNation})</li>)}</ul></AccordionContent></AccordionItem>
        )}
        {analysis.playerStealableProjects.length > 0 && (
          <AccordionItem value="available-stealable-projects"><AccordionTrigger><span>Available Stealable Projects</span></AccordionTrigger><AccordionContent><ul>{analysis.playerStealableProjects.map(({ projectName, factionId }: any, ix: number) => { const faction = analysis.factionsById.get(factionId); if (!faction) return null; const project = analysis.projects.get(projectName); if (!project) return null; return <li key={ix}>{faction.displayName} {project.displayName} ({project.researchCost})</li>; })}</ul></AccordionContent></AccordionItem>
        )}
      </SmartAccordion>
    );
  }

  if (section === "tech-goals") {
    return (
      <AccordionItem value="technology-goals">
        <AccordionTrigger><span>Technology goals</span></AccordionTrigger>
        <AccordionContent>
          <TechnologyGoalsDialog analysis={analysis} goals={goals} onAdd={addGoal} onRemove={removeGoal} />
          <br />
          <TechnologyGoalsList analysis={analysis} goals={goals} onRemove={removeGoal} />
        </AccordionContent>
      </AccordionItem>
    );
  }

  if (section === "habs") {
    return (
      <AccordionItem value="habs">
        <AccordionTrigger><span>Manage Habs</span></AccordionTrigger>
        <AccordionContent>
          {habsWithoutSolarPowerMultipler.length > 0 && (
            <><h3>Habs without Solar Power Multiplier</h3><ul>{habsWithoutSolarPowerMultipler.map((hab: any) => <li key={hab.id}>{hab.displayName} - site/orbit id: {hab.habSiteId || hab.orbitStateId}</li>)}</ul></>
          )}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead><TableHead>Combat</TableHead><TableHead>Upcoming Completion</TableHead><TableHead>Days to Complete</TableHead><TableHead>Alerts</TableHead><TableHead>Current Power</TableHead><TableHead>Future Power</TableHead><TableHead>Current Bonuses</TableHead><TableHead>Future Bonuses</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {playerHabs.map((hab: any) => (
                <TableRow key={hab.id}>
                  <TableCell>{hab.displayName}</TableCell>
                  <TableCell><ShowEffects combatScore={hab.activeEffects.combatScore} /></TableCell>
                  <TableCell>{hab.highlightedCompletions.map((hc: any, ix: number) => <span key={ix}>{ix > 0 && ", "}{hc.displayName} in {hc.daysToCompletion?.toFixed(0)} days</span>)}</TableCell>
                  <TableCell>{hab.maxDaysToCompletion?.toFixed(0) || ""}</TableCell>
                  <TableCell>
                    {hab.emptyModuleCount > 0 && <>{hab.emptyModuleCount} empty slots </>}
                    {hab.missingMine && <span className="bg-yellow-300 text-black p-1 rounded">Missing Mine </span>}
                    {hab.hasUnnecessaryFactory && <span className="text-red-600">⚠ unnecessary factory</span>}
                    {hab.canUpgradePower && <span>⬆ power</span>}
                    {hab.canUpgradeCombat && <span>⬆ combat</span>}
                    {hab.canUpgradeMining && <span>⬆ mining</span>}
                    {hab.upgradeableModuleNames.length > 0 && <span>⬆ modules</span>}
                  </TableCell>
                  <TableCell>{hab.activePower?.toFixed(0)}</TableCell>
                  <TableCell>{hab.futurePower?.toFixed(0)}</TableCell>
                  <TableCell><HabScienceEffects effects={hab.activeEffects} /></TableCell>
                  <TableCell><HabScienceEffects effects={hab.potentialEffects} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </AccordionContent>
      </AccordionItem>
    );
  }

  if (section === "mines") {
    return (
      <AccordionItem value="mines">
        <AccordionTrigger><span>Manage Mines</span></AccordionTrigger>
        <AccordionContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead><TableHead>Combat</TableHead><TableHead>Upcoming Completion</TableHead><TableHead>Alerts</TableHead><TableHead>Current income</TableHead><TableHead>Current if powered</TableHead><TableHead>Best unlocked mine</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedMineHabs.map((hab: any) => (
                <TableRow key={hab.id}>
                  <TableCell>{hab.displayName}</TableCell>
                  <TableCell><ShowEffects combatScore={hab.activeEffects.combatScore} /></TableCell>
                  <TableCell>{hab.highlightedCompletions.map((hc: any, ix: number) => <span key={ix}>{ix > 0 && ", "}{hc.templateName} in {hc.daysToCompletion?.toFixed(0)} days</span>)}</TableCell>
                  <TableCell>
                    {hab.emptyModuleCount > 0 && <>{hab.emptyModuleCount} empty slots </>}
                    {hab.missingMine && <span className="bg-yellow-300 text-black p-1 rounded">Missing Mine </span>}
                  </TableCell>
                  <TableCell><MineEffects effects={hab.currentMineEffects} /></TableCell>
                  <TableCell><MineEffects effects={hab.currentMinePoweredEffects} /></TableCell>
                  <TableCell><MineEffects effects={hab.bestMineEffects} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </AccordionContent>
      </AccordionItem>
    );
  }

  return null;
}

function HabScienceEffects({ effects }: { effects: ShowEffectsProps }) {
  return (
    <ShowEffects
      incomeBoost_month={effects.incomeBoost_month} incomeInfluence_month={effects.incomeInfluence_month} incomeMissionControl={effects.incomeMissionControl}
      incomeMoney_month={effects.incomeMoney_month} incomeOps_month={effects.incomeOps_month} incomeResearch_month={effects.incomeResearch_month}
      projectCapacityGranted={effects.projectCapacityGranted} economyBonus={effects.economyBonus} welfareBonus={effects.welfareBonus}
      environmentBonus={effects.environmentBonus} knowledgeBonus={effects.knowledgeBonus} governmentBonus={effects.governmentBonus}
      unityBonus={effects.unityBonus} militaryBonus={effects.militaryBonus} oppressionBonus={effects.oppressionBonus}
      spoilsBonus={effects.spoilsBonus} spaceDevBonus={effects.spaceDevBonus} spaceflightBonus={effects.spaceflightBonus}
      MCBonus={effects.MCBonus} miningBonus={effects.miningBonus} techBonuses={effects.techBonuses} controlPoints={effects.controlPoints}
      miltechBonus={effects.miltechBonus} alienDetection={effects.alienDetection} humanDetection={effects.humanDetection}
      publicCampaignStrength={effects.publicCampaignStrength} />
  );
}

function MineEffects({ effects }: { effects: any }) {
  return <ShowEffects water={effects.water_month} volatiles={effects.volatiles_month} metals={effects.metals_month} nobles={effects.nobles_month} fissiles={effects.fissiles_month} />;
}
