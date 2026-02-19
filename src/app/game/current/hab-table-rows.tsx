"use client";

import {
  CombatScore,
  HabPower,
  MissionControl,
  Water,
  Volatiles,
  Metals,
  Nobles,
  Fissiles,
} from "@/components/icons";
import { ShowEffects, ShowEffectsProps } from "@/components/showEffects";
import { TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Analysis } from "@/lib/analysis";
import { Fragment } from "react";
import { twMerge } from "tailwind-merge";
import { User, Factory, ArrowUp, Pickaxe } from "lucide-react";

// Science table components

export function HabScienceHeader() {
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

export function ShowHabScienceEffects({ effects }: { effects: ShowEffectsProps }) {
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

export function HabScienceTableRow({ hab, time }: { hab: Analysis["playerHabs"][0]; time: string }) {
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

// Mine table components

export function HabMineHeader() {
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

export function ShowHabMineEffects({ effects }: { effects: Analysis["playerHabs"][0]["currentMineEffects"] }) {
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

export function HabMineTableRow({ hab, time }: { hab: Analysis["playerHabs"][0]; time: string }) {
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
              hab.mineTier === 1 ? "bg-blue-100" : hab.mineTier === 2 ? "bg-blue-300" : "bg-blue-500 text-white"
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
                : ""
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
