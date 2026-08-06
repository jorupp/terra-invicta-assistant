"use client";

import {
  Boost,
  CombatScore,
  FactionIcons,
  HabPower,
  MissionControl,
  TechIcons,
  UnknownIcon,
  Water,
  Volatiles,
  Metals,
  Nobles,
  Fissiles,
  ControlPoint,
} from "@/components/icons";
import { combineEffects, ShowEffects, ShowEffectsProps } from "@/components/showEffects";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Analysis } from "@/lib/analysis";
import { formatDateTime, noDate } from "@/lib/utils";
import { Fragment, useState } from "react";
import { useTechnologyGoals, TechnologyGoalsDialog, TechnologyGoalsList } from "./technologyGoals";
import { ResearchLink } from "./researchLink";
import { twMerge } from "tailwind-merge";
import { User, Factory, ArrowUp, Pickaxe } from "lucide-react";
import type { GameNavigationGroup } from "./navigation-types";

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
      alienDetection={effects.alienDetection}
      humanDetection={effects.humanDetection}
      publicCampaignStrength={effects.publicCampaignStrength}
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
        {hab.hasUnnecessaryFactory && (
          <span title="Active factory with no construction - consider turning it off" className="p-1">
            <Factory className="inline h-4 w-4 text-red-600" />
          </span>
        )}
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
                    hab.miningUpgradeInfo.factoryTier === 3 ? "bg-green-200 rounded" : "",
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
        {hab.needsOperationsCenterUpgrade && (
          <span className="p-1" title="Operations Center upgrade available">
            <MissionControl />
          </span>
        )}
        {hab.needsAdminTowerUpgrade && <span className="p-1" title="Admin Tower upgrade available"></span>}
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
        {hab.mineTier > 0 && (
          <span
            className={twMerge(
              "text-black p-1 rounded text-xs",
              hab.mineTier === 1 ? "bg-blue-100" : hab.mineTier === 2 ? "bg-blue-300" : "bg-blue-500 text-white",
            )}
          >
            M{hab.mineTier}
          </span>
        )}{" "}
        {hab.highestActiveFactoryTier > 0 && (
          <span
            className={twMerge(
              "text-black p-1 rounded text-xs",
              hab.highestActiveFactoryTier === 1
                ? "bg-green-100"
                : hab.highestActiveFactoryTier === 2
                  ? "bg-green-300"
                  : "bg-green-500",
              hab.highestActiveFactoryCount === 2
                ? "outline outline-1 outline-black"
                : hab.highestActiveFactoryCount >= 3
                  ? "outline outline-2 outline-black"
                  : "",
            )}
          >
            F{hab.highestActiveFactoryTier}
          </span>
        )}
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

type MineResourceType = "water" | "volatiles" | "metals" | "nobles" | "fissiles" | null;
type MineSortDirection = "asc" | "desc" | null;

export function getHabsUi(analysis: Analysis) {
  const { playerHabs } = analysis;

  const missingMines = playerHabs.filter((h) => h.missingMine);
  const unnecessaryFactoryHabs = playerHabs.filter((h) => h.hasUnnecessaryFactory);
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
  const unnecessaryFactoryTitle =
    unnecessaryFactoryHabs.length > 0
      ? `${unnecessaryFactoryHabs.length} hab${unnecessaryFactoryHabs.length > 1 ? "s have" : " has"} unnecessary active factories`
      : "";
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

  const items: GameNavigationGroup["items"] = [
    {
      key: "habs-current-bonuses",
      label: "Current Bonuses",
      subtitle: "Active hab effects",
      content: <HabsComponent analysis={analysis} section="current-bonuses" />,
    },
    {
      key: "habs-future-bonuses",
      label: "Future Bonuses",
      subtitle: "Including unpowered and under-construction modules",
      content: <HabsComponent analysis={analysis} section="future-bonuses" />,
    },
    {
      key: "habs-boost-mc",
      label: "MC/Boost Summary",
      subtitle: "Current totals and monthly change",
      content: <HabsComponent analysis={analysis} section="boost-mc-summary" />,
    },
    {
      key: "habs-alien-hate",
      label: "Alien Hate",
      subtitle: "Alien strategy, goals, and hate values",
      content: <HabsComponent analysis={analysis} section="alien-hate" />,
    },
    {
      key: "habs-building-details",
      label: "Building Details",
      subtitle: `${analysis.buildingSummary.length} building types`,
      content: <HabsComponent analysis={analysis} section="building-details" />,
    },
    ...(analysis.playerFaction.availableBoostProjects.length > 0
      ? [
          {
            key: "habs-boost-projects",
            label: "Available Boost Projects",
            subtitle: `${analysis.playerFaction.availableBoostProjects.length} projects`,
            content: <HabsComponent analysis={analysis} section="available-boost-projects" />,
          },
        ]
      : []),
    ...(analysis.playerFaction.availableCPProjects.length > 0
      ? [
          {
            key: "habs-cp-projects",
            label: "Available Control Point Projects",
            subtitle: `${analysis.playerFaction.availableCPProjects.length} projects`,
            content: <HabsComponent analysis={analysis} section="available-cp-projects" />,
          },
        ]
      : []),
    ...(analysis.playerFaction.availableMaxOrgProjects.length > 0
      ? [
          {
            key: "habs-max-org-projects",
            label: "Available Max Org Projects",
            subtitle: `${analysis.playerFaction.availableMaxOrgProjects.length} projects`,
            content: <HabsComponent analysis={analysis} section="available-max-org-projects" />,
          },
        ]
      : []),
    ...(analysis.playerFaction.availableExpandNationProjects.length > 0
      ? [
          {
            key: "habs-expand-nation-projects",
            label: "Available Expand Nations",
            subtitle: `${analysis.playerFaction.availableExpandNationProjects.length} projects`,
            content: <HabsComponent analysis={analysis} section="available-expand-nation-projects" />,
          },
        ]
      : []),
    ...(analysis.playerStealableProjects.length > 0
      ? [
          {
            key: "habs-stealable-projects",
            label: "Available Stealable Projects",
            subtitle: `${analysis.playerStealableProjects.length} projects`,
            content: <HabsComponent analysis={analysis} section="available-stealable-projects" />,
          },
        ]
      : []),
    {
      key: "habs-technology-goals",
      label: "Technology Goals",
      subtitle: "Track research and project prerequisites",
      content: <HabsComponent analysis={analysis} section="technology-goals" />,
    },
    {
      key: "habs-manage-habs",
      label: "Manage Habs",
      subtitle: `${playerHabs.length} habitats`,
      content: <HabsComponent analysis={analysis} section="habs" />,
    },
    {
      key: "habs-manage-mines",
      label: "Manage Mines",
      subtitle: `${missingMines.length} missing mines · ${upgradableMiningHabs.length} upgrades`,
      content: <HabsComponent analysis={analysis} section="mines" />,
    },
    {
      key: "habs-debug",
      label: "Debug Data",
      subtitle: "Raw habitat analysis",
      content: <HabsComponent analysis={analysis} section="debug" />,
    },
  ];

  return {
    key: "habs",
    label: "Habs",
    subtitle: (
      <>
        {playerHabs.length} habitats{nextCompletion && ` · ${nextCompletion.daysToCompletion?.toFixed(0)}d`}
        {missingMines.length > 0 && <span title={missingMinesTitle}> · {missingMines.length} missing mines</span>}
        {unnecessaryFactoryHabs.length > 0 && <span title={unnecessaryFactoryTitle}> · factories</span>}
        {(upgradablePowerHabs.length > 0 ||
          upgradableCombatHabs.length > 0 ||
          upgradableFarmHabs.length > 0 ||
          upgradableFactoryHabs.length > 0 ||
          upgradableMiningHabs.length > 0 ||
          upgradableOtherHabs.length > 0) && (
          <span
            title={[
              upgradablePowerTitle,
              upgradableCombatTitle,
              upgradableFarmTitle,
              upgradableFactoryTitle,
              upgradableMiningTitle,
              upgradableOtherTitle,
            ]
              .filter(Boolean)
              .join(", ")}
          >
            {" "}
            · upgrades available
          </span>
        )}
      </>
    ),
    items,
  };
}

type HabSection =
  | "current-bonuses"
  | "future-bonuses"
  | "boost-mc-summary"
  | "alien-hate"
  | "building-details"
  | "available-boost-projects"
  | "available-cp-projects"
  | "available-max-org-projects"
  | "available-expand-nation-projects"
  | "available-stealable-projects"
  | "technology-goals"
  | "habs"
  | "mines"
  | "debug";

function HabsComponent({ analysis, section }: { analysis: Analysis; section: HabSection }) {
  // State for sorting mines table
  const [mineSortResource, setMineSortResource] = useState<MineResourceType>(null);
  const [mineSortDirection, setMineSortDirection] = useState<MineSortDirection>(null);

  const {
    playerHabs,
    playerFaction: {
      availableBoostProjects,
      availableCPProjects,
      availableMaxOrgProjects,
      availableExpandNationProjects,
    },
    playerStealableProjects,
  } = analysis;
  const time = formatDateTime(analysis.gameCurrentDateTime);
  const techGoals = useTechnologyGoals(analysis);
  const { goals, addGoal, removeGoal } = techGoals;
  const activeEffects = playerHabs.reduce<ShowEffectsProps>((acc, hab) => combineEffects(acc, hab.activeEffects), {});
  const potentialEffects = playerHabs.reduce<ShowEffectsProps>(
    (acc, hab) => combineEffects(acc, hab.potentialEffects),
    {},
  );

  // Handler for clicking mining bonus resources to sort
  const handleMineResourceSort = (resource: MineResourceType) => {
    if (mineSortResource === resource) {
      // Same resource clicked - cycle through asc -> desc -> null
      if (mineSortDirection === "desc") {
        setMineSortDirection("asc");
      } else if (mineSortDirection === "asc") {
        setMineSortResource(null);
        setMineSortDirection(null);
      }
    } else {
      // New resource clicked - start with ascending
      setMineSortResource(resource);
      setMineSortDirection("desc");
    }
  };

  // Sort habs for mines table
  const sortedMineHabs = [...playerHabs]
    .filter((i) => i.habType === "Base")
    .sort((a, b) => {
      if (!mineSortResource || !mineSortDirection) return 0;

      const resourceKey = `${mineSortResource}_month` as keyof typeof a.currentMinePoweredEffects;
      const aValue = a.currentMinePoweredEffects[resourceKey];
      const bValue = b.currentMinePoweredEffects[resourceKey];

      if (mineSortDirection === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return bValue < aValue ? -1 : bValue > aValue ? 1 : 0;
      }
    });

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
      },
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
      },
    );

  const habsWithoutSolarPowerMultipler = playerHabs
    .filter((hab) => hab.hasSolar && !hab.solarMultiplier)
    .toSorted((a, b) => a.finderSortOverride - b.finderSortOverride);

  return (
    <div className="space-y-2">
      {section === "current-bonuses" && (
        <div>
          <ShowHabScienceEffects effects={activeEffects} />
        </div>
      )}
      {section === "future-bonuses" && (
        <div>
          <ShowHabScienceEffects effects={potentialEffects} />
        </div>
      )}
      {section === "boost-mc-summary" && (
        <div>
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
        </div>
      )}
      {section === "alien-hate" && (
        <div>
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
        </div>
      )}
      {section === "building-details" && (
        <div>
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
        </div>
      )}
      {section === "available-boost-projects" && (
        <div>
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
        </div>
      )}
      {section === "available-cp-projects" && (
        <div>
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
        </div>
      )}
      {section === "available-max-org-projects" && (
        <div>
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
        </div>
      )}
      {section === "available-expand-nation-projects" && (
        <div>
              <ul>
                {availableExpandNationProjects
                  .toSorted((a, b) => {
                    // Sort by progress (most complete first)
                    const aRemaining = a.researchCost - a.currentProgress;
                    const bRemaining = b.researchCost - b.currentProgress;
                    return aRemaining - bRemaining;
                  })
                  .map((project, ix) => {
                    const Icon = TechIcons[project.techCategory] || UnknownIcon;
                    return (
                      <li key={ix}>
                        <Icon /> <ResearchLink name={project.dataName} displayName={project.friendlyName} /> (
                        {project.currentProgress.toFixed(0)}/{project.researchCost}, {project.requiresNation})
                      </li>
                    );
                  })}
              </ul>
        </div>
      )}
      {section === "available-stealable-projects" && (
        <div>
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
                      <FactionIcon title={faction.displayName!} /> {faction.displayName} <Icon />{" "}
                      <ResearchLink name={projectName} displayName={project.displayName!} /> ({project.researchCost})
                    </li>
                  );
                })}
              </ul>
        </div>
      )}
      {section === "technology-goals" && (
        <div>
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
        </div>
      )}
      {section === "habs" && (
        <div>
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
        </div>
      )}
      {section === "mines" && (
        <div className="space-y-2">
            <Card>
              <CardHeader>
                <CardTitle>Mining Bonuses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 text-sm">
                  <button
                    className="flex items-center gap-1 cursor-pointer hover:underline"
                    onClick={() => handleMineResourceSort("water")}
                  >
                    <Water />
                    {((analysis.playerFaction.miningMultipliers.water - 1) * 100).toFixed(0)}%
                  </button>
                  <button
                    className="flex items-center gap-1 cursor-pointer hover:underline"
                    onClick={() => handleMineResourceSort("volatiles")}
                  >
                    <Volatiles />
                    {((analysis.playerFaction.miningMultipliers.volatiles - 1) * 100).toFixed(0)}%
                  </button>
                  <button
                    className="flex items-center gap-1 cursor-pointer hover:underline"
                    onClick={() => handleMineResourceSort("metals")}
                  >
                    <Metals />
                    {((analysis.playerFaction.miningMultipliers.metals - 1) * 100).toFixed(0)}%
                  </button>
                  <button
                    className="flex items-center gap-1 cursor-pointer hover:underline"
                    onClick={() => handleMineResourceSort("nobles")}
                  >
                    <Nobles />
                    {((analysis.playerFaction.miningMultipliers.nobles - 1) * 100).toFixed(0)}%
                  </button>
                  <button
                    className="flex items-center gap-1 cursor-pointer hover:underline"
                    onClick={() => handleMineResourceSort("fissiles")}
                  >
                    <Fissiles />
                    {((analysis.playerFaction.miningMultipliers.fissiles - 1) * 100).toFixed(0)}%
                  </button>
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
                {sortedMineHabs.map((hab) => (
                  <HabMineTableRow hab={hab} key={hab.id} time={time} />
                ))}
              </TableBody>
            </Table>
        </div>
      )}

      {section === "debug" && (
        <Collapsible>
          <CollapsibleTrigger asChild>
            <Button variant="outline">Show Debug Data</Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <pre>{JSON.stringify(analysis.playerHabs, null, 2)}</pre>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}
