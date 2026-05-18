"use client";

import { Analysis } from "@/lib/analysis";
import { SmartAccordion } from "@/components/ui/smart-accordion";
import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { ShowEffects } from "@/components/showEffects";
import { Water, Volatiles, Metals, Nobles, Fissiles, Antimatter } from "@/components/icons";
import { smartRound, formatPercent } from "@/lib/utils";
import { useState } from "react";
import { useTechnologyGoals, TechnologyGoalsDialog, TechnologyGoalsList } from "../technologyGoals";
import { twMerge } from "tailwind-merge";

const ChevronDown = ({ className }: { className?: string }) => <span className={className}>▼</span>;
const ChevronUp = ({ className }: { className?: string }) => <span className={className}>▲</span>;

const RESOURCE_ICONS: Record<string, any> = { Water, Volatiles, Metals, NobleMetals: Nobles, Fissiles, Antimatter };

export function DrivesSection({ analysis, section }: { analysis: Analysis; section?: string }) {
  const { goals, addGoal, removeGoal } = useTechnologyGoals(analysis);
  const [sortColumn, setSortColumn] = useState("friendlyName");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  if (section === "table") {
    return <DrivesTable analysis={analysis} goals={goals} addGoal={addGoal} removeGoal={removeGoal} sortColumn={sortColumn} sortDirection={sortDirection} handleSort={(col: string) => { setSortColumn(col); setSortDirection(sortDirection === "asc" ? "desc" : "asc"); }} />;
  }

  if (section === "calculator") {
    return <DriveCalculator analysis={analysis} />;
  }

  return null;
}

function DrivesTable({ analysis, goals, addGoal, removeGoal, sortColumn, sortDirection, handleSort }: {
  analysis: Analysis;
  goals: any[];
  addGoal: any;
  removeGoal: any;
  sortColumn: string;
  sortDirection: string;
  handleSort: (col: string) => void;
}) {
  const unlockedProjectNames = new Set(analysis.playerFaction.finishedProjectNames);
  const SortIcon = ({ column }: { column: string }) => {
    if (sortColumn !== column) return null;
    return sortDirection === "asc" ? <ChevronUp className="inline h-3 w-3" /> : <ChevronDown className="inline h-3 w-3" />;
  };

  const drives = analysis.drives.toSorted((a: any, b: any) => {
    const aInGoals = goals.some((g: any) => g.name === a.requiredProjectName);
    const bInGoals = goals.some((g: any) => g.name === b.requiredProjectName);
    if (aInGoals !== bInGoals) return aInGoals ? -1 : 1;
    let compareValue = 0;
    switch (sortColumn) {
      case "friendlyName": compareValue = a.friendlyName.localeCompare(b.friendlyName); break;
      case "thrust_N": compareValue = a.thrust_N - b.thrust_N; break;
      case "EV_kps": compareValue = a.EV_kps - b.EV_kps; break;
      case "efficiency": compareValue = a.efficiency - b.efficiency; break;
      case "powerRequiredGW": compareValue = a.powerRequiredGW - b.powerRequiredGW; break;
      case "reactorAndRadiatorTons": compareValue = (a.reactorAndRadiatorTons ?? Infinity) - (b.reactorAndRadiatorTons ?? Infinity); break;
      case "thrustRating": compareValue = a.thrustRating - b.thrustRating; break;
      case "exhaustRating": compareValue = a.exhaustRating - b.exhaustRating; break;
      case "overallRating": compareValue = a.overallRating - b.overallRating; break;
      case "unlockChance": compareValue = (a.unlockChance ?? 100) - (b.unlockChance ?? 100); break;
      case "tanksAffordable": compareValue = a.tanksAffordable - b.tanksAffordable; break;
      case "techResearchRemaining": compareValue = a.techResearchRemaining - b.techResearchRemaining; break;
      case "projectResearchRemaining": compareValue = a.projectResearchRemaining - b.projectResearchRemaining; break;
      case "shipDeltaV": compareValue = a.shipDeltaV - b.shipDeltaV; break;
      case "accelerationMilliGs": compareValue = a.accelerationMilliGs - b.accelerationMilliGs; break;
      case "tripTime": compareValue = a.tripTime - b.tripTime; break;
    }
    return sortDirection === "asc" ? compareValue : -compareValue;
  });

  return (
    <SmartAccordion type="multiple" storageKey="drivesAccordion" defaultValue={["drive-table"]}>
      <AccordionItem value="drive-table">
        <AccordionTrigger>Drive Systems</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            {analysis.bestRadiator && (
              <p className="text-sm text-muted-foreground">Best available radiator: <span className="font-medium">{analysis.bestRadiator.friendlyName}</span> ({smartRound(1 / analysis.bestRadiator.gwPerTon)} ton/GW)</p>
            )}
            {!analysis.bestRadiator && <p className="text-sm text-muted-foreground">No radiators available yet</p>}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead></TableHead><TableHead>Drive Name</TableHead>
                  <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("friendlyName")}>Thrust <SortIcon column="thrust_N" /></TableHead>
                  <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("EV_kps")}>EV <SortIcon column="EV_kps" /></TableHead>
                  <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("efficiency")}>Eff % <SortIcon column="efficiency" /></TableHead>
                  <TableHead>Cooling</TableHead>
                  <TableHead>Propellant</TableHead>
                  <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("powerRequiredGW")}>Power GW <SortIcon column="powerRequiredGW" /></TableHead>
                  <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("reactorAndRadiatorTons")}>Rad t <SortIcon column="reactorAndRadiatorTons" /></TableHead>
                  <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("overallRating")}>Rating <SortIcon column="overallRating" /></TableHead>
                  <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("unlockChance")}>Unlock % <SortIcon column="unlockChance" /></TableHead>
                  <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("tanksAffordable")}>Tanks <SortIcon column="tanksAffordable" /></TableHead>
                  <TableHead>ΔV km/s</TableHead>
                  <TableHead>Accel mG</TableHead>
                  <TableHead>5AU d</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {drives.map((drive: any) => {
                  const isUnlocked = unlockedProjectNames.has(drive.requiredProjectName);
                  const goalForThisDrive = goals.find((g: any) => g.name === drive.requiredProjectName);
                  const isInGoals = !!goalForThisDrive;
                  const rowClassName = isInGoals ? "bg-green-50" : drive.tanksAffordable < 10 ? "bg-red-50" : drive.tanksAffordable < 100 ? "bg-orange-50" : "";

                  const propellantEffects = { water: drive.propellantMaterials.water, volatiles: drive.propellantMaterials.volatiles, metals: drive.propellantMaterials.metals, nobles: drive.propellantMaterials.nobleMetals, fissiles: drive.propellantMaterials.fissiles, antimatter: drive.propellantMaterials.antimatter };

                  return (
                    <TableRow key={drive.dataName} className={rowClassName}>
                      <TableCell>
                        {!isUnlocked && isInGoals && <Button variant="outline" size="sm" onClick={() => removeGoal(goalForThisDrive.id)} className="h-8 w-8 p-0 bg-white" title="Remove from goals">✕</Button>}
                        {!isUnlocked && !isInGoals && <Button variant="outline" size="sm" onClick={() => addGoal("project", drive.requiredProjectName)} className="h-8 w-8 p-0 bg-white" title="Add to goals">+</Button>}
                      </TableCell>
                      <TableCell className="font-medium">{drive.friendlyName}</TableCell>
                      <TableCell className="text-right">{Math.round(drive.thrust_N / 1000)} kN</TableCell>
                      <TableCell className="text-right">{Math.round(drive.EV_kps)}</TableCell>
                      <TableCell className="text-right">{formatPercent(drive.efficiency * 100)}</TableCell>
                      <TableCell>{drive.cooling || "None"}</TableCell>
                      <TableCell className="text-xs"><ShowEffects {...propellantEffects} /></TableCell>
                      <TableCell className="text-right">{!isNaN(drive.powerRequiredGW) ? smartRound(drive.powerRequiredGW) : "-"}</TableCell>
                      <TableCell className="text-right">{drive.reactorAndRadiatorTons !== undefined ? smartRound(drive.reactorAndRadiatorTons) : "-"}</TableCell>
                      <TableCell className="text-right">{drive.overallRating.toFixed(2)}</TableCell>
                      <TableCell className="text-right">{drive.unlockChance !== undefined ? `${drive.unlockChance}%` : ""}</TableCell>
                      <TableCell className="text-right">{drive.tanksAffordable} {drive.limitingResourceName && (() => { const ResourceIcon = RESOURCE_ICONS[drive.limitingResourceName as keyof typeof RESOURCE_ICONS]; return ResourceIcon ? <ResourceIcon /> : null; })()}</TableCell>
                      <TableCell className="text-right">{smartRound(drive.shipDeltaV / 1000)}</TableCell>
                      <TableCell className="text-right">{smartRound(drive.accelerationMilliGs)}</TableCell>
                      <TableCell className="text-right">{smartRound(drive.tripTime / 86400)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="drive-calculator">
        <AccordionTrigger>Drive Calculator</AccordionTrigger>
        <AccordionContent><DriveCalculator analysis={analysis} /></AccordionContent>
      </AccordionItem>
    </SmartAccordion>
  );
}

function DriveCalculator({ analysis }: { analysis: Analysis }) {
  const bestUnlockedRadiator = analysis.radiators.filter((r: any) => r.isUnlocked).reduce((best: any, r: any) => (!best || r.gwPerTon > best.gwPerTon ? r : best), null);
  const unlockedProjectNames = new Set(analysis.playerFaction.finishedProjectNames);
  const [dryMassInput, setDryMassInput] = useState("10000");
  const [radiatorDataName, setRadiatorDataName] = useState(bestUnlockedRadiator?.dataName ?? "");
  const [targetDeltaVInput, setTargetDeltaVInput] = useState("250");
  const [targetDistanceInput, setTargetDistanceInput] = useState("5");

  const dryMass = parseFloat(dryMassInput) || 10000;
  const targetDV = parseFloat(targetDeltaVInput) || 250;
  const targetDist = parseFloat(targetDistanceInput) || 5;

  const selectedRadiator = analysis.radiators.find((r: any) => r.dataName === radiatorDataName);

  const rows = analysis.drives.map((drive: any) => {
    const needsRadiator = drive.cooling === "Calc" || drive.cooling === "Closed";
    const radiatorTons = needsRadiator && selectedRadiator ? (drive.wasteHeatGW || 0) / selectedRadiator.gwPerTon : 0;
    const fixedMassTons = dryMass + (drive.reactorTons || 0) + radiatorTons;
    const EV_ms = drive.EV_kps * 1000;
    const targetDV_ms = targetDV * 1000;
    const massRatio = Math.exp(targetDV_ms / EV_ms);
    const requiredFuelMassTons = fixedMassTons * (massRatio - 1);
    const requiredTanks = Math.ceil(requiredFuelMassTons / 100);
    if (requiredTanks > 1000) return null;
    const tanksNeeded = Math.max(1, requiredTanks);
    const fuelMassTons = tanksNeeded * 100;
    const totalMassTons = fixedMassTons + fuelMassTons;
    const actualDeltaVMs = EV_ms * Math.log(totalMassTons / fixedMassTons);
    const actualDeltaVKps = actualDeltaVMs / 1000;
    const totalMassKg = totalMassTons * 1000;
    const accelerationMs2 = drive.thrust_N / totalMassKg;
    const accelerationMilliGs = (accelerationMs2 / 9.81) * 1000;
    const targetDistanceM = targetDist * 149597870700;
    const midpointDistance = targetDistanceM / 2;
    const avgMassKg = ((totalMassTons + fixedMassTons) / 2) * 1000;
    const avgAcceleration = drive.thrust_N / avgMassKg;
    const timeToMidpoint = Math.sqrt((2 * midpointDistance) / avgAcceleration);
    const velocityAtMidpoint = avgAcceleration * timeToMidpoint;
    const deltaVNeeded = 2 * velocityAtMidpoint;
    let travelDays: number;
    if (deltaVNeeded <= actualDeltaVMs) {
      travelDays = (timeToMidpoint * 2) / 86400;
    } else {
      const maxVelocity = actualDeltaVMs / 2;
      const accelDistance = (maxVelocity * maxVelocity) / (2 * avgAcceleration);
      const coastDistance = targetDistanceM - 2 * accelDistance;
      const accelTime = maxVelocity / avgAcceleration;
      travelDays = coastDistance > 0 ? (2 * accelTime + coastDistance / maxVelocity) / 86400 : (2 * accelTime) / 86400;
    }
    return { dataName: drive.dataName, driveName: drive.friendlyName, driveEfficiency: drive.efficiency, tanks: tanksNeeded, totalTons: totalMassTons, deltaV: actualDeltaVKps, acceleration: accelerationMilliGs, travelDays, isUnlocked: unlockedProjectNames.has(drive.requiredProjectName) };
  }).filter((r: any) => r !== null);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 items-end p-4 bg-muted/30 rounded-lg">
        <div className="space-y-1">
          <label htmlFor="calc-dry-mass">Dry Mass (tons)</label>
          <input id="calc-dry-mass" type="number" className="border p-1 w-24" value={dryMassInput} onChange={(e) => setDryMassInput(e.target.value)} />
        </div>
        <div className="space-y-1">
          <label htmlFor="calc-radiator">Radiator</label>
          <select id="calc-radiator" className="border p-1" value={radiatorDataName} onChange={(e) => setRadiatorDataName(e.target.value)}>
            <option value="">None</option>
            {analysis.radiators.filter((r: any) => !r.dataName.toLowerCase().includes("collector")).toSorted((a: any, b: any) => b.gwPerTon - a.gwPerTon).map((r: any) => (
              <option key={r.dataName} value={r.dataName}>{r.friendlyName} ({smartRound(1 / r.gwPerTon)} t/GW){r.isUnlocked ? "" : " 🔒"}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label htmlFor="calc-deltav">Target ΔV (km/s)</label>
          <input id="calc-deltav" type="number" className="border p-1 w-24" value={targetDeltaVInput} onChange={(e) => setTargetDeltaVInput(e.target.value)} />
        </div>
        <div className="space-y-1">
          <label htmlFor="calc-distance">Target Distance (AU)</label>
          <input id="calc-distance" type="number" className="border p-1 w-24" value={targetDistanceInput} onChange={(e) => setTargetDistanceInput(e.target.value)} />
        </div>
      </div>
      <p className="text-xs text-muted-foreground">Dry mass is hull/payload (drive + reactor + radiator added on top). Tanks clamped to [1, 1000].</p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Drive</TableHead><TableHead>Eff</TableHead><TableHead>Tanks</TableHead><TableHead>Total t</TableHead>
            <TableHead>ΔV (km/s)</TableHead><TableHead>Accel (mg)</TableHead><TableHead>Travel Days</TableHead><TableHead>Unlock</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row: any) => (
            <TableRow key={row.dataName} className={row.isUnlocked ? "" : "opacity-60"}>
              <TableCell className="font-medium">{row.driveName}</TableCell>
              <TableCell className="text-right">{formatPercent(row.driveEfficiency * 100)}</TableCell>
              <TableCell className="text-right">{row.tanks}</TableCell>
              <TableCell className="text-right">{smartRound(row.totalTons)}</TableCell>
              <TableCell className="text-right">{row.deltaV.toFixed(1)}</TableCell>
              <TableCell className="text-right">{row.acceleration.toFixed(2)}</TableCell>
              <TableCell className="text-right">{row.travelDays.toFixed(1)}</TableCell>
              <TableCell>{row.isUnlocked ? "✓" : "✕"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
