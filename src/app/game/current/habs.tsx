"use client";

import { FactionIcons, TechIcons, UnknownIcon } from "@/components/icons";
import { combineEffects, ShowEffects, ShowEffectsProps } from "@/components/showEffects";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Analysis } from "@/lib/analysis";
import { formatDateTime, noDate } from "@/lib/utils";
import { Fragment } from "react/jsx-runtime";
import { useTechnologyGoals, TechnologyGoalsDialog, TechnologyGoalsList } from "./technologyGoals";

function HabScienceHeader() {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>Name</TableHead>
        <TableHead>Most important upcoming completion</TableHead>
        <TableHead>Alerts</TableHead>
        <TableHead>Current bonuses</TableHead>
        <TableHead>Future bonuses</TableHead>
      </TableRow>
    </TableHeader>
  );
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
    />
  );
}

function HabScienceTableRow({ hab, time }: { hab: Analysis["playerHabs"][0]; time: string }) {
  const { highlightedCompletions, emptyModuleCount, missingMine, activeEffects, potentialEffects } = hab;

  return (
    <TableRow key={hab.id}>
      <TableCell>{hab.displayName}</TableCell>
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
      water_day={(effects.water_day || 0) * (effects.miningModifier || 1)}
      volatiles_day={(effects.volatiles_day || 0) * (effects.miningModifier || 1)}
      metals_day={(effects.metals_day || 0) * (effects.miningModifier || 1)}
      nobles_day={(effects.nobles_day || 0) * (effects.miningModifier || 1)}
      fissiles_day={(effects.fissiles_day || 0) * (effects.miningModifier || 1)}
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
  const nextCompletion = playerHabs
    .flatMap((i) => i.highlightedCompletions)
    .filter((i) => i)
    .toSorted((a, b) => {
      return a.daysToCompletion < b.daysToCompletion ? -1 : 1;
    })[0];

  // can't use a tooltip for this because it's in the button that is the tab label, which would be nested buttons and cause hydration issues
  const missingMinesTitle =
    missingMines.length > 0 ? `Missing mines: ${missingMines.map((h) => h.displayName).join(", ")}` : "";

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

  return (
    <div className="space-y-2 mx-2">
      <Card>
        <CardHeader>
          <CardTitle>Current Hab bonuses</CardTitle>
        </CardHeader>
        <CardContent>
          <ShowHabScienceEffects effects={activeEffects} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Future Hab bonuses (including unpowered/under-construction)</CardTitle>
        </CardHeader>
        <CardContent>
          <ShowHabScienceEffects effects={potentialEffects} />
        </CardContent>
      </Card>
      {availableBoostProjects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Available Boost Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <ul>
              {availableBoostProjects
                .toSorted((a, b) => a.researchCost - b.researchCost)
                .map((project, ix) => {
                  const Icon = TechIcons[project.techCategory] || UnknownIcon;
                  return (
                    <li key={ix}>
                      <Icon /> {project.friendlyName} ({project.researchCost})
                    </li>
                  );
                })}
            </ul>
          </CardContent>
        </Card>
      )}
      {availableCPProjects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Available Control Point Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <ul>
              {availableCPProjects
                .toSorted((a, b) => a.researchCost - b.researchCost)
                .map((project, ix) => {
                  const Icon = TechIcons[project.techCategory] || UnknownIcon;
                  return (
                    <li key={ix}>
                      <Icon /> {project.friendlyName} ({project.researchCost})
                    </li>
                  );
                })}
            </ul>
          </CardContent>
        </Card>
      )}
      {availableMaxOrgProjects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Available Max Org Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <ul>
              {availableMaxOrgProjects
                .toSorted((a, b) => a.researchCost - b.researchCost)
                .map((project, ix) => {
                  const Icon = TechIcons[project.techCategory] || UnknownIcon;
                  return (
                    <li key={ix}>
                      <Icon /> {project.friendlyName} ({project.researchCost})
                    </li>
                  );
                })}
            </ul>
          </CardContent>
        </Card>
      )}
      {playerStealableProjects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Available Stealable Projects</CardTitle>
          </CardHeader>
          <CardContent>
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
                    <FactionIcon /> {faction.displayName} <Icon /> {project.displayName} ({project.researchCost})
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      )}
      <Accordion type="multiple" defaultValue={["technology-goals"]}>
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
            {process.env.NEXT_PUBLIC_TECH_TREE_VIEWER ? (
              <a
                href={process.env.NEXT_PUBLIC_TECH_TREE_VIEWER}
                target="_blank"
                rel="noopener noreferrer"
                className="underline ml-5"
              >
                Drill into details
              </a>
            ) : null}
            <br />
            <br />
            <TechnologyGoalsList analysis={analysis} goals={techGoals.goals} onRemove={techGoals.removeGoal} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <Accordion type="single" collapsible defaultValue="habs">
        <AccordionItem value="habs">
          <AccordionTrigger>
            <span>Manage Habs</span>
          </AccordionTrigger>
          <AccordionContent>
            <Table>
              <HabScienceHeader />
              <TableBody>
                {playerHabs.map((hab) => (
                  <HabScienceTableRow hab={hab} key={hab.id} time={time} />
                ))}
              </TableBody>
            </Table>
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
      </Accordion>

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
