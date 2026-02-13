"use client";

import { Boost, CombatScore, FactionIcons, HabPower, MissionControl, TechIcons, UnknownIcon } from "@/components/icons";
import { combineEffects, ShowEffects, ShowEffectsProps } from "@/components/showEffects";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Analysis } from "@/lib/analysis";
import { formatDateTime, noDate } from "@/lib/utils";
import { Fragment } from "react/jsx-runtime";
import { useTechnologyGoals, TechnologyGoalsDialog, TechnologyGoalsList } from "./technologyGoals";
import { ResearchLink } from "./researchLink";
import { twMerge } from "tailwind-merge";
import { User, Factory, ArrowUp, Pickaxe } from "lucide-react";
import { SmartAccordion } from "@/components/ui/smart-accordion";

type AlienGoal = Analysis["expandedAlienGoals"][0];

function AlienGoalList({ goals }: { goals: AlienGoal[] }) {
  return (
    <ul className="ml-4 mt-1 text-sm space-y-0.5">
      {goals.map((goal) => (
        <li key={goal.id}>
          <strong>{goal.type}</strong> ({goal.importance}){goal.nation && `: ${goal.nation.displayName}`}
          {goal.hab && `: ${goal.hab.displayName}${goal.hab.bodyName ? ` (${goal.hab.bodyName})` : ""}`}
          {goal.attackTarget && `: ${goal.attackTarget.displayName}`}
          {goal.attackTargetFleet && `: Target Fleet: ${goal.attackTargetFleet.displayName}`}
          {goal.assignedFleet && `, Assigned: ${goal.assignedFleet.displayName}`}
          {goal.pendingFleets &&
            goal.pendingFleets.length > 0 &&
            `, Pending: ${goal.pendingFleets.map((f) => f.displayName).join(", ")}`}
          {goal.enemyFaction && `: vs ${goal.enemyFaction.displayName}`}
        </li>
      ))}
    </ul>
  );
}

function HabScienceHeader() {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>Name</TableHead>
        <TableHead>
          <CombatScore />
        </TableHead>
        <TableHead>Most important upcoming completion</TableHead>
        <TableHead title="Days to complete">D2C</TableHead>
        <TableHead>Alerts</TableHead>
        <TableHead title="Current Power">
          <HabPower />
        </TableHead>
        <TableHead title="Future Power">
          <HabPower />
        </TableHead>
        <TableHead>Current bonuses</TableHead>
        <TableHead>Future bonuses</TableHead>
      </TableRow>
    </TableHeader>
  );
}

function ShowHabCombatEffects({ effects }: { effects: ShowEffectsProps }) {
  return <ShowEffects combatScore={effects.combatScore} />;
}

function ShowHabScienceEffects({ effects }: { effects: ShowEffectsProps }) {
  return (
    <ShowEffects
      incomeBoost_month={effects.incomeBoost_month}
      incomeInfluence_month={effects.incomeInfluence_month}
      incomeMissionControl={effects.incomeMissionControl}
      incomeMoney_month={effects.incomeMoney_month}
      incomeOps_month={effects.incomeOps_month}
      incomeResearch_month={effects.incomeResearch_month}
      projectCapacityGranted={effects.projectCapacityGranted}
      economyBonus={effects.economyBonus}
      welfareBonus={effects.welfareBonus}
      environmentBonus={effects.environmentBonus}
      knowledgeBonus={effects.knowledgeBonus}
      governmentBonus={effects.governmentBonus}
      unityBonus={effects.unityBonus}
      militaryBonus={effects.militaryBonus}
      oppressionBonus={effects.oppressionBonus}
      spoilsBonus={effects.spoilsBonus}
      spaceDevBonus={effects.spaceDevBonus}
      spaceflightBonus={effects.spaceflightBonus}
      MCBonus={effects.MCBonus}
      miningBonus={effects.miningBonus}
      techBonuses={effects.techBonuses}
      controlPoints={effects.controlPoints}
      miltechBonus={effects.miltechBonus}
    />
  );
}

function HabScienceTableRow({ hab, time }: { hab: Analysis["playerHabs"][0]; time: string }) {
  const { highlightedCompletions, emptyModuleCount, missingMine, activeEffects, potentialEffects } = hab;

  return (
    <TableRow key={hab.id}>
      <TableCell>
        <span title={`site: ${hab.habSiteId}, body: ${hab.orbitStateId}`}>{hab.displayName}</span>
      </TableCell>
      <TableCell>
        <ShowHabCombatEffects effects={activeEffects} />
      </TableCell>
      <TableCell className="whitespace-normal">
        {highlightedCompletions.map((highlightedCompletion, ix) => (
          <Fragment key={ix}>
            {ix > 0 && ", "}
            {highlightedCompletion.displayName} in {highlightedCompletion.daysToCompletion?.toFixed(0)} days
          </Fragment>
        ))}
      </TableCell>
      <TableCell>{hab.maxDaysToCompletion ? hab.maxDaysToCompletion.toFixed(0) : ""}</TableCell>
      <TableCell>
        {emptyModuleCount > 0 && <>{emptyModuleCount} empty slots </>}
        {missingMine && <span className="bg-yellow-300 text-black p-1 rounded">Missing Mine </span>}
        {hab.canUpgradePower && <HabPower title="Power module can be upgraded" />}
        {hab.canUpgradeCombat && <CombatScore title="Combat module can be upgraded" />}
        {hab.canUpgradeFarm && (
          <span title="Farm can be upgraded to support more crew" className="p-1">
            <User className="inline h-4 w-4" />
          </span>
        )}
        {hab.canUpgradeFactory && (
          <span title="Factory can be upgraded" className="p-1">
            <Factory className="inline h-4 w-4" />
          </span>
        )}
        {hab.canUpgradeMining && hab.miningUpgradeInfo && hab.site && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  className={twMerge(
                    "p-1 cursor-help",
                    hab.miningUpgradeInfo.factoryTier === 3 ? "bg-green-200 rounded" : ""
                  )}
                >
                  <Pickaxe className="inline h-4 w-4" />
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <div className="space-y-1">
                  <div className="font-bold">Mining Upgrade Available</div>
                  <div>Upgrade to: {hab.miningUpgradeInfo.upgradeName}</div>
                  <div>Best factory: {hab.miningUpgradeInfo.factoryName}</div>
                  <div className="mt-2 text-sm">
                    <div className="font-semibold">Mining effects with best mine:</div>
                    <ShowHabMineEffects effects={hab.bestMineEffects} />
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {hab.upgradeableModuleNames.length > 0 && (
          <span title={`Can upgrade to:\n${hab.upgradeableModuleNames.join("\n")}`} className="p-1">
            <ArrowUp className="inline h-4 w-4" />
          </span>
        )}
      </TableCell>
      <TableCell>{hab.activePower?.toFixed(0)}</TableCell>
      <TableCell>
        <span className={twMerge(hab.futurePower < 0 ? "bg-red-100 p-1 rounded" : "")}>
          {hab.futurePower?.toFixed(0)}
        </span>
      </TableCell>
      <TableCell>
        <ShowHabScienceEffects effects={activeEffects} />
      </TableCell>
      <TableCell>
        <ShowHabScienceEffects effects={potentialEffects} />
      </TableCell>
    </TableRow>
  );
}

function HabMineHeader() {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>Name</TableHead>
        <TableHead>
          <CombatScore />
        </TableHead>
        <TableHead>Most important upcoming completion</TableHead>
        <TableHead>Alerts</TableHead>
        <TableHead>Current income</TableHead>
        <TableHead>Current if powered</TableHead>
        <TableHead>Best unlocked mine</TableHead>
      </TableRow>
    </TableHeader>
  );
}

function ShowHabMineEffects({ effects }: { effects: Analysis["playerHabs"][0]["currentMineEffects"] }) {
  return (
    <ShowEffects
      water={effects.water_month}
      volatiles={effects.volatiles_month}
      metals={effects.metals_month}
      nobles={effects.nobles_month}
      fissiles={effects.fissiles_month}
    />
  );
}

function HabMineTableRow({ hab, time }: { hab: Analysis["playerHabs"][0]; time: string }) {
  const { highlightedCompletions, emptyModuleCount, missingMine } = hab;

  return (
    <TableRow key={hab.id}>
      <TableCell>{hab.displayName}</TableCell>
      <TableCell>
        <ShowHabCombatEffects effects={hab.activeEffects} />
      </TableCell>
      <TableCell>
        <span className="whitespace-normal">
          {highlightedCompletions.map((highlightedCompletion, ix) => (
            <Fragment key={ix}>
              {ix > 0 && ", "}
              {highlightedCompletion.templateName} in {highlightedCompletion.daysToCompletion?.toFixed(0)} days
            </Fragment>
          ))}
        </span>
      </TableCell>
      <TableCell>
        {emptyModuleCount > 0 && <>{emptyModuleCount} empty slots </>}
        {missingMine && <span className="bg-yellow-300 text-black p-1 rounded">Missing Mine </span>}
      </TableCell>
      <TableCell>
        <ShowHabMineEffects effects={hab.currentMineEffects} />
      </TableCell>
      <TableCell>
        <ShowHabMineEffects effects={hab.currentMinePoweredEffects} />
      </TableCell>
      <TableCell>
        <ShowHabMineEffects effects={hab.bestMineEffects} />
      </TableCell>
    </TableRow>
  );
}

export function getHabsUi(analysis: Analysis) {
  const { playerHabs } = analysis;
  const missingMines = playerHabs.filter((h) => h.missingMine);
  const upgradablePowerHabs = playerHabs.filter((h) => h.canUpgradePower);
  const upgradableCombatHabs = playerHabs.filter((h) => h.canUpgradeCombat);
  const upgradableFarmHabs = playerHabs.filter((h) => h.canUpgradeFarm);
  const upgradableFactoryHabs = playerHabs.filter((h) => h.canUpgradeFactory);
  const upgradableMiningHabs = playerHabs.filter((h) => h.canUpgradeMining);
  const upgradableOtherHabs = playerHabs.filter((h) => h.upgradeableModuleNames.length > 0);
  const nextCompletion = playerHabs
    .flatMap((i) => i.highlightedCompletions)
    .filter((i) => i)
    .toSorted((a, b) => {
      return a.daysToCompletion < b.daysToCompletion ? -1 : 1;
    })[0];

  // can't use a tooltip for this because it's in the button that is the tab label, which would be nested buttons and cause hydration issues
  const missingMinesTitle =
    missingMines.length > 0 ? `Missing mines: ${missingMines.map((h) => h.displayName).join(", ")}` : "";
  const upgradablePowerTitle =
    upgradablePowerHabs.length > 0
      ? `${upgradablePowerHabs.length} hab${upgradablePowerHabs.length > 1 ? "s" : ""} can upgrade power modules`
      : "";
  const upgradableCombatTitle =
    upgradableCombatHabs.length > 0
      ? `${upgradableCombatHabs.length} hab${upgradableCombatHabs.length > 1 ? "s" : ""} can upgrade combat modules`
      : "";
  const upgradableFarmTitle =
    upgradableFarmHabs.length > 0
      ? `${upgradableFarmHabs.length} hab${upgradableFarmHabs.length > 1 ? "s" : ""} can upgrade farms for more crew`
      : "";
  const upgradableFactoryTitle =
    upgradableFactoryHabs.length > 0
      ? `${upgradableFactoryHabs.length} hab${upgradableFactoryHabs.length > 1 ? "s" : ""} can upgrade factories`
      : "";
  const upgradableMiningTitle =
    upgradableMiningHabs.length > 0
      ? `${upgradableMiningHabs.length} hab${upgradableMiningHabs.length > 1 ? "s" : ""} can upgrade mining modules`
      : "";
  const upgradableOtherTitle =
    upgradableOtherHabs.length > 0
      ? `${upgradableOtherHabs.length} hab${
          upgradableOtherHabs.length > 1 ? "s have" : " has"
        } other upgradeable modules`
      : "";

  return {
    key: "habs",
    tab: (
      <>
        Habs ({playerHabs.length}){nextCompletion && <> {nextCompletion.daysToCompletion?.toFixed(0)}d</>}
        {missingMines.length > 0 && (
          <>
            {" "}
            <span className="bg-yellow-300 text-black p-1 rounded" title={missingMinesTitle}>
              M
            </span>
          </>
        )}
        {upgradablePowerHabs.length > 0 && (
          <>
            {" "}
            <HabPower title={upgradablePowerTitle} />
          </>
        )}
        {upgradableCombatHabs.length > 0 && (
          <>
            {" "}
            <CombatScore title={upgradableCombatTitle} />
          </>
        )}
        {upgradableFarmHabs.length > 0 && (
          <>
            {" "}
            <span title={upgradableFarmTitle}>
              <User className="inline h-4 w-4" />
            </span>
          </>
        )}
        {upgradableFactoryHabs.length > 0 && (
          <>
            {" "}
            <span title={upgradableFactoryTitle}>
              <Factory className="inline h-4 w-4" />
            </span>
          </>
        )}
        {upgradableMiningHabs.length > 0 && (
          <>
            {" "}
            <span title={upgradableMiningTitle}>
              <Pickaxe className="inline h-4 w-4" />
            </span>
          </>
        )}
        {upgradableOtherHabs.length > 0 && (
          <>
            {" "}
            <span title={upgradableOtherTitle}>
              <ArrowUp className="inline h-4 w-4" />
            </span>
          </>
        )}
      </>
    ),
    content: (
      <HabsComponent
        {...{
          analysis,
        }}
      />
    ),
  };
}

function HabsComponent({ analysis }: { analysis: Analysis }) {
  const {
    playerHabs,
    playerFaction: { availableBoostProjects, availableCPProjects, availableMaxOrgProjects },
    playerStealableProjects,
  } = analysis;
  const time = formatDateTime(analysis.gameCurrentDateTime);
  const { goals, addGoal, removeGoal } = useTechnologyGoals(analysis);
  const activeEffects = playerHabs.reduce<ShowEffectsProps>((acc, hab) => combineEffects(acc, hab.activeEffects), {});
  const potentialEffects = playerHabs.reduce<ShowEffectsProps>(
    (acc, hab) => combineEffects(acc, hab.potentialEffects),
    {}
  );

  const activeMineSummary = playerHabs
    .filter((h) => h.site)
    .reduce(
      (acc, hab) => {
        const effects = hab.currentMineEffects;
        if (
          effects.water_month > 0 ||
          effects.volatiles_month > 0 ||
          effects.metals_month > 0 ||
          effects.nobles_month > 0 ||
          effects.fissiles_month > 0
        ) {
          acc.count++;
          acc.water_month += effects.water_month;
          acc.volatiles_month += effects.volatiles_month;
          acc.metals_month += effects.metals_month;
          acc.nobles_month += effects.nobles_month;
          acc.fissiles_month += effects.fissiles_month;
        }
        return acc;
      },
      {
        count: 0,
        water_month: 0,
        volatiles_month: 0,
        metals_month: 0,
        nobles_month: 0,
        fissiles_month: 0,
        miningModifier: 0,
      }
    );
  const mineSummary = playerHabs
    .filter((h) => h.site)
    .reduce(
      (acc, hab) => {
        const effects = hab.bestMineEffects;
        acc.count++;
        acc.water_month += effects.water_month;
        acc.volatiles_month += effects.volatiles_month;
        acc.metals_month += effects.metals_month;
        acc.nobles_month += effects.nobles_month;
        acc.fissiles_month += effects.fissiles_month;
        return acc;
      },
      {
        count: 0,
        water_month: 0,
        volatiles_month: 0,
        metals_month: 0,
        nobles_month: 0,
        fissiles_month: 0,
        miningModifier: 0,
      }
    );

  const techGoals = useTechnologyGoals(analysis);
  const habsWithoutSolarPowerMultipler = playerHabs
    .filter((hab) => hab.hasSolar && !hab.solarMultiplier)
    .toSorted((a, b) => a.finderSortOverride - b.finderSortOverride);

  return (
    <div className="space-y-2">
      <SmartAccordion
        type="multiple"
        defaultValue={["current-bonuses", "future-bonuses", "available-cp-projects"]}
        storageKey="habs"
      >
        <AccordionItem value="current-bonuses">
          <AccordionTrigger>
            <span>Current Hab bonuses</span>
          </AccordionTrigger>
          <AccordionContent>
            <ShowHabScienceEffects effects={activeEffects} />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="future-bonuses">
          <AccordionTrigger>
            <span>Future Hab bonuses (including unpowered/under-construction)</span>
          </AccordionTrigger>
          <AccordionContent>
            <ShowHabScienceEffects effects={potentialEffects} />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="boost-mc-summary">
          <AccordionTrigger>
            <span>MC/Boost Income Summary</span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex space-x-4 pb-4">
              <span>
                <Boost />
                {analysis.playerFaction.nationHistory.currentBoost.toFixed(2)}
                {analysis.playerFaction.nationHistory.boostMonthlyChange !== 0 && (
                  <span
                    className={
                      analysis.playerFaction.nationHistory.boostMonthlyChange > 0 ? "text-green-600" : "text-red-600"
                    }
                  >
                    {" "}
                    ({analysis.playerFaction.nationHistory.boostMonthlyChange > 0 ? "+" : ""}
                    {analysis.playerFaction.nationHistory.boostMonthlyChange.toFixed(2)})
                  </span>
                )}
              </span>
              <span>
                <MissionControl />
                {analysis.playerFaction.nationHistory.currentMC.toFixed(0)}
                {analysis.playerFaction.nationHistory.mcMonthlyChange !== 0 && (
                  <span
                    className={
                      analysis.playerFaction.nationHistory.mcMonthlyChange > 0 ? "text-green-600" : "text-red-600"
                    }
                  >
                    {" "}
                    ({analysis.playerFaction.nationHistory.mcMonthlyChange > 0 ? "+" : ""}
                    {analysis.playerFaction.nationHistory.mcMonthlyChange.toFixed(0)})
                  </span>
                )}
              </span>
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="alien-hate">
          <AccordionTrigger>
            <span>Alien Hate</span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-1">
              <div>
                <strong>Current Alien Strategy:</strong>{" "}
                {analysis.alienFaction.defaultPriorityPresetTemplateName || "Unknown"}
              </div>
              <div>
                <strong>Active Goals (Top 10 of {analysis.expandedAlienGoals.length} by Importance):</strong>
                <AlienGoalList goals={analysis.expandedAlienGoals.slice(0, 10)} />
                {analysis.expandedAlienGoals.length > 10 && (
                  <Collapsible className="mt-2">
                    <CollapsibleTrigger className="text-sm text-blue-500 hover:underline ml-4">
                      Show {analysis.expandedAlienGoals.length - 10} more goals...
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <AlienGoalList goals={analysis.expandedAlienGoals.slice(10)} />
                    </CollapsibleContent>
                  </Collapsible>
                )}
              </div>
              <div>
                <strong>Alien Hate of Player:</strong>{" "}
                {analysis.alienFaction.factionHate?.get(analysis.playerFaction.id)?.toFixed(1) ?? "Unknown"}
              </div>
              <div>
                <strong>Assessed Alien Hate of Player:</strong>{" "}
                {analysis.playerFaction.assessedAlienHateOfMe?.toFixed(1) ?? "Unknown"}
              </div>
              <div>
                <strong>Last Fixed Hate Date:</strong>{" "}
                {analysis.playerFaction.lastDateOfFixedAlienHate
                  ? formatDateTime(analysis.playerFaction.lastDateOfFixedAlienHate)
                  : "Never"}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="building-details">
          <AccordionTrigger>
            <span>Building Details</span>
          </AccordionTrigger>
          <AccordionContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Building</TableHead>
                  <TableHead className="text-right">Current Count</TableHead>
                  <TableHead className="text-right">Future Count</TableHead>
                  <TableHead>Current Bonuses</TableHead>
                  <TableHead>Future Bonuses</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analysis.buildingSummary.map((building) => (
                  <TableRow key={building.templateName}>
                    <TableCell>{building.friendlyName}</TableCell>
                    <TableCell className="text-right">{building.currentCount}</TableCell>
                    <TableCell className="text-right">{building.futureCount}</TableCell>
                    <TableCell>
                      <ShowHabScienceEffects effects={building.currentEffects} />
                    </TableCell>
                    <TableCell>
                      <ShowHabScienceEffects effects={building.futureEffects} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </AccordionContent>
        </AccordionItem>
        {availableBoostProjects.length > 0 && (
          <AccordionItem value="available-boost-projects">
            <AccordionTrigger>
              <span>Available Boost Projects</span>
            </AccordionTrigger>
            <AccordionContent>
              <ul>
                {availableBoostProjects
                  .toSorted((a, b) => a.researchCost - b.researchCost)
                  .map((project, ix) => {
                    const Icon = TechIcons[project.techCategory] || UnknownIcon;
                    return (
                      <li key={ix}>
                        <Icon /> <ResearchLink name={project.dataName} displayName={project.friendlyName} /> (
                        {project.researchCost})
                      </li>
                    );
                  })}
              </ul>
            </AccordionContent>
          </AccordionItem>
        )}
        {availableCPProjects.length > 0 && (
          <AccordionItem value="available-cp-projects">
            <AccordionTrigger>
              <span>Available Control Point Projects</span>
            </AccordionTrigger>
            <AccordionContent>
              <ul>
                {availableCPProjects
                  .toSorted((a, b) => {
                    // Sort by efficiency: CP gained per research remaining (highest first)
                    const aRemaining = a.researchCost - a.currentProgress;
                    const bRemaining = b.researchCost - b.currentProgress;
                    const aEfficiency = aRemaining > 0 ? a.cpBonus / aRemaining : 0;
                    const bEfficiency = bRemaining > 0 ? b.cpBonus / bRemaining : 0;
                    return bEfficiency - aEfficiency;
                  })
                  .map((project, ix) => {
                    const Icon = TechIcons[project.techCategory] || UnknownIcon;
                    return (
                      <li key={ix}>
                        <Icon /> <ResearchLink name={project.dataName} displayName={project.friendlyName} /> (
                        {project.currentProgress.toFixed(0)}/{project.researchCost}, +{project.cpBonus} CP)
                      </li>
                    );
                  })}
              </ul>
            </AccordionContent>
          </AccordionItem>
        )}
        {availableMaxOrgProjects.length > 0 && (
          <AccordionItem value="available-max-org-projects">
            <AccordionTrigger>
              <span>Available Max Org Projects</span>
            </AccordionTrigger>
            <AccordionContent>
              <ul>
                {availableMaxOrgProjects
                  .toSorted((a, b) => a.researchCost - b.researchCost)
                  .map((project, ix) => {
                    const Icon = TechIcons[project.techCategory] || UnknownIcon;
                    return (
                      <li key={ix}>
                        <Icon /> <ResearchLink name={project.dataName} displayName={project.friendlyName} /> (
                        {project.researchCost})
                      </li>
                    );
                  })}
              </ul>
            </AccordionContent>
          </AccordionItem>
        )}
        {playerStealableProjects.length > 0 && (
          <AccordionItem value="available-stealable-projects">
            <AccordionTrigger>
              <span>Available Stealable Projects</span>
            </AccordionTrigger>
            <AccordionContent>
              <ul>
                {playerStealableProjects.map(({ projectName, factionId }, ix) => {
                  const faction = analysis.factionsById.get(factionId);
                  if (!faction) return null;
                  const FactionIcon = faction.templateName
                    ? FactionIcons[faction.templateName]
                    : UnknownIcon || UnknownIcon;
                  const project = analysis.projects.get(projectName);
                  if (!project) return null;
                  const Icon = TechIcons[project.techCategory] || UnknownIcon;
                  return (
                    <li key={ix}>
                      <FactionIcon /> {faction.displayName} <Icon />{" "}
                      <ResearchLink name={projectName} displayName={project.displayName!} /> ({project.researchCost})
                    </li>
                  );
                })}
              </ul>
            </AccordionContent>
          </AccordionItem>
        )}
        <AccordionItem value="technology-goals">
          <AccordionTrigger>
            <span>Technology goals</span>
          </AccordionTrigger>
          <AccordionContent>
            <TechnologyGoalsDialog
              analysis={analysis}
              goals={techGoals.goals}
              onAdd={techGoals.addGoal}
              onRemove={techGoals.removeGoal}
            />
            <ResearchLink displayName="Tech Tree" className="ml-5" />
            <br />
            <br />
            <TechnologyGoalsList analysis={analysis} goals={techGoals.goals} onRemove={techGoals.removeGoal} />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="habs">
          <AccordionTrigger>
            <span>Manage Habs</span>
          </AccordionTrigger>
          <AccordionContent>
            <>
              {habsWithoutSolarPowerMultipler.length > 0 && (
                <>
                  <h3>Habs without Solar Power Multiplier</h3>
                  <ul>
                    {habsWithoutSolarPowerMultipler.map((hab) => (
                      <li key={hab.id}>
                        {hab.displayName} - site/orbit id: {hab.habSiteId || hab.orbitStateId}
                      </li>
                    ))}
                  </ul>
                </>
              )}
              <Table>
                <HabScienceHeader />
                <TableBody>
                  {playerHabs.map((hab) => (
                    <HabScienceTableRow hab={hab} key={hab.id} time={time} />
                  ))}
                </TableBody>
              </Table>
            </>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="mines">
          <AccordionTrigger>
            <span>Manage Mines</span>
          </AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardHeader>
                <CardTitle>Mining Bonuses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-2 text-sm">
                  <div>
                    <div className="font-semibold">Water</div>
                    <div>{((analysis.playerFaction.miningMultipliers.water - 1) * 100).toFixed(0)}%</div>
                  </div>
                  <div>
                    <div className="font-semibold">Volatiles</div>
                    <div>{((analysis.playerFaction.miningMultipliers.volatiles - 1) * 100).toFixed(0)}%</div>
                  </div>
                  <div>
                    <div className="font-semibold">Metals</div>
                    <div>{((analysis.playerFaction.miningMultipliers.metals - 1) * 100).toFixed(0)}%</div>
                  </div>
                  <div>
                    <div className="font-semibold">Nobles</div>
                    <div>{((analysis.playerFaction.miningMultipliers.nobles - 1) * 100).toFixed(0)}%</div>
                  </div>
                  <div>
                    <div className="font-semibold">Fissiles</div>
                    <div>{((analysis.playerFaction.miningMultipliers.fissiles - 1) * 100).toFixed(0)}%</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Base income from active mines</CardTitle>
              </CardHeader>
              <CardContent>
                <span>{activeMineSummary.count} active mines</span> <ShowHabMineEffects effects={activeMineSummary} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Base income from potential mines</CardTitle>
              </CardHeader>
              <CardContent>
                <span>{mineSummary.count} potential mines</span> <ShowHabMineEffects effects={mineSummary} />
              </CardContent>
            </Card>
            <Table>
              <HabMineHeader />
              <TableBody>
                {playerHabs.map((hab) => (
                  <HabMineTableRow hab={hab} key={hab.id} time={time} />
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
          <pre>{JSON.stringify(analysis.playerHabs, null, 2)}</pre>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
