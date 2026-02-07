"use client";

import { Boost, CombatScore, FactionIcons, HabPower, MissionControl, TechIcons, UnknownIcon } from "@/components/icons";
import { combineEffects, ShowEffects, ShowEffectsProps } from "@/components/showEffects";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Analysis } from "@/lib/analysis";
import { formatDateTime, noDate } from "@/lib/utils";
import { Fragment } from "react/jsx-runtime";
import { useTechnologyGoals, TechnologyGoalsDialog, TechnologyGoalsList } from "./technologyGoals";
import { ResearchLink } from "./researchLink";
import { twMerge } from "tailwind-merge";
import { User } from "lucide-react";
import { SmartAccordion } from "@/components/ui/smart-accordion";

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
        <span title={`site: ${hab.habSiteId}, body: ${hab.site?.parentBodyId}`}>{hab.displayName}</span>
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
        <TableHead>Current base income</TableHead>
        <TableHead>Future/potential base income</TableHead>
      </TableRow>
    </TableHeader>
  );
}

function ShowHabMineEffects({
  effects,
}: {
  effects: Partial<
    Pick<
      NonNullable<Analysis["playerHabs"][0]["site"]>,
      "water_day" | "volatiles_day" | "metals_day" | "nobles_day" | "fissiles_day"
    > &
      Pick<NonNullable<Analysis["playerHabs"][0]["mine"]["template"]>, "miningModifier">
  >;
}) {
  return (
    <ShowEffects
      water={(effects.water_day || 0) * (effects.miningModifier || 1) * 30}
      volatiles={(effects.volatiles_day || 0) * (effects.miningModifier || 1) * 30}
      metals={(effects.metals_day || 0) * (effects.miningModifier || 1) * 30}
      nobles={(effects.nobles_day || 0) * (effects.miningModifier || 1) * 30}
      fissiles={(effects.fissiles_day || 0) * (effects.miningModifier || 1) * 30}
    />
  );
}

function HabMineTableRow({ hab, time }: { hab: Analysis["playerHabs"][0]; time: string }) {
  const { highlightedCompletions, emptyModuleCount, missingMine } = hab;
  const effects = { ...hab.site, ...hab.mine?.template };

  return (
    <TableRow key={hab.id}>
      <TableCell>{hab.displayName}</TableCell>
      <TableCell>
        <ShowHabCombatEffects effects={hab.activeEffects} />
      </TableCell>
      <TableCell>
        {highlightedCompletions.map((highlightedCompletion, ix) => (
          <Fragment key={ix}>
            {ix > 0 && ", "}
            {highlightedCompletion.templateName} in {highlightedCompletion.daysToCompletion?.toFixed(0)} days
          </Fragment>
        ))}
      </TableCell>
      <TableCell>
        {emptyModuleCount > 0 && <>{emptyModuleCount} empty slots </>}
        {missingMine && <span className="bg-yellow-300 text-black p-1 rounded">Missing Mine </span>}
      </TableCell>
      <TableCell>{hab.mine?.powered ? <ShowHabMineEffects effects={effects} /> : null}</TableCell>
      <TableCell>
        <ShowHabMineEffects effects={effects} />
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

  const mineable = playerHabs
    .filter((h) => h.site)
    .map((hab) => {
      const mine = hab.mine;
      const miningModifier = mine?.template?.miningModifier || 1;
      const active = mine?.powered || false;
      return {
        active,
        miningModifier,
        water_day: (hab.site?.water_day || 0) * miningModifier,
        volatiles_day: (hab.site?.volatiles_day || 0) * miningModifier,
        metals_day: (hab.site?.metals_day || 0) * miningModifier,
        nobles_day: (hab.site?.nobles_day || 0) * miningModifier,
        fissiles_day: (hab.site?.fissiles_day || 0) * miningModifier,
      };
    });
  const activeMineSummary = mineable.reduce(
    (acc, cur) => {
      if (cur.active) {
        acc.count++;
        acc.water_day += cur.water_day;
        acc.volatiles_day += cur.volatiles_day;
        acc.metals_day += cur.metals_day;
        acc.nobles_day += cur.nobles_day;
        acc.fissiles_day += cur.fissiles_day;
      }
      return acc;
    },
    {
      count: 0,
      water_day: 0,
      volatiles_day: 0,
      metals_day: 0,
      nobles_day: 0,
      fissiles_day: 0,
    }
  );
  const mineSummary = mineable.reduce(
    (acc, cur) => {
      acc.count++;
      acc.water_day += cur.water_day;
      acc.volatiles_day += cur.volatiles_day;
      acc.metals_day += cur.metals_day;
      acc.nobles_day += cur.nobles_day;
      acc.fissiles_day += cur.fissiles_day;
      return acc;
    },
    {
      count: 0,
      water_day: 0,
      volatiles_day: 0,
      metals_day: 0,
      nobles_day: 0,
      fissiles_day: 0,
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
