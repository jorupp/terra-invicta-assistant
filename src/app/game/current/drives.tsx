import { Analysis } from "@/lib/analysis";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ShowEffects } from "@/components/showEffects";
import { useState, useMemo } from "react";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { smartRound, formatPercent, addMaterials } from "@/lib/utils";
import { ResearchLink } from "./researchLink";
import { useTechnologyGoals } from "./technologyGoals";
import { Button } from "@/components/ui/button";
import { Water, Volatiles, Metals, Nobles, Fissiles, Antimatter } from "@/components/icons";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SmartAccordion } from "@/components/ui/smart-accordion";
import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Materials } from "@/lib/templates";
import { twMerge } from "tailwind-merge";

type SortColumn =
  | "friendlyName"
  | "thrust_N"
  | "EV_kps"
  | "efficiency"
  | "cooling"
  | "powerRequiredGW"
  | "reactorAndRadiatorTons"
  | "thrustRating"
  | "exhaustRating"
  | "overallRating"
  | "unlockChance"
  | "tanksAffordable"
  | "techResearchRemaining"
  | "projectResearchRemaining"
  | "shipDeltaV"
  | "accelerationMilliGs"
  | "tripTime";
type SortDirection = "asc" | "desc";

function DrivesTable({ analysis }: { analysis: Analysis }) {
  const [sortColumn, setSortColumn] = useState<SortColumn>("friendlyName");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const { goals, addGoal, removeGoal } = useTechnologyGoals(analysis);

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const drives = analysis.drives.toSorted((a, b) => {
    // First, check if drives are in goals
    const aInGoals = goals.some((g) => g.name === a.requiredProjectName);
    const bInGoals = goals.some((g) => g.name === b.requiredProjectName);

    // Goals always come first
    if (aInGoals !== bInGoals) {
      return aInGoals ? -1 : 1;
    }

    // Within same goal status, apply normal sort
    let compareValue = 0;

    switch (sortColumn) {
      case "friendlyName":
        compareValue = a.friendlyName.localeCompare(b.friendlyName);
        break;
      case "thrust_N":
        compareValue = a.thrust_N - b.thrust_N;
        break;
      case "EV_kps":
        compareValue = a.EV_kps - b.EV_kps;
        break;
      case "efficiency":
        compareValue = a.efficiency - b.efficiency;
        break;
      case "cooling":
        compareValue = a.cooling.localeCompare(b.cooling);
        break;
      case "powerRequiredGW":
        compareValue = a.powerRequiredGW - b.powerRequiredGW;
        break;
      case "reactorAndRadiatorTons":
        compareValue = (a.reactorAndRadiatorTons ?? Infinity) - (b.reactorAndRadiatorTons ?? Infinity);
        break;
      case "thrustRating":
        compareValue = a.thrustRating - b.thrustRating;
        break;
      case "exhaustRating":
        compareValue = a.exhaustRating - b.exhaustRating;
        break;
      case "overallRating":
        compareValue = a.overallRating - b.overallRating;
        break;
      case "unlockChance":
        compareValue = (a.unlockChance ?? 100) - (b.unlockChance ?? 100);
        break;
      case "tanksAffordable":
        compareValue = a.tanksAffordable - b.tanksAffordable;
        break;
      case "techResearchRemaining":
        compareValue = a.techResearchRemaining - b.techResearchRemaining;
        break;
      case "projectResearchRemaining":
        compareValue = a.projectResearchRemaining - b.projectResearchRemaining;
        break;
      case "shipDeltaV":
        compareValue = a.shipDeltaV - b.shipDeltaV;
        break;
      case "accelerationMilliGs":
        compareValue = a.accelerationMilliGs - b.accelerationMilliGs;
        break;
      case "tripTime":
        compareValue = a.tripTime - b.tripTime;
        break;
    }

    return sortDirection === "asc" ? compareValue : -compareValue;
  });

  const SortIcon = ({ column }: { column: SortColumn }) => {
    if (sortColumn !== column) return null;
    return sortDirection === "asc" ? (
      <ChevronUp className="inline h-4 w-4" />
    ) : (
      <ChevronDown className="inline h-4 w-4" />
    );
  };

  return (
    <div className="space-y-4">
      <div>
        {analysis.bestRadiator && (
          <p className="text-sm text-muted-foreground">
            Best available radiator: <span className="font-medium">{analysis.bestRadiator.friendlyName}</span> (
            {smartRound(1 / analysis.bestRadiator.gwPerTon)} ton/GW)
          </p>
        )}
        {!analysis.bestRadiator && <p className="text-sm text-muted-foreground">No radiators available yet</p>}
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead></TableHead>
            <TableHead colSpan={16}></TableHead>
            <TableHead
              colSpan={4}
              className="text-center border-l-2 whitespace-normal"
              title="10k tons dry + radiator + 50 fuel tanks"
            >
              Hypothetical Ship
            </TableHead>
          </TableRow>
          <TableRow>
            <TableHead title="Add/Remove Technology Goal">Goal</TableHead>
            <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("friendlyName")}>
              Drive Name <SortIcon column="friendlyName" />
            </TableHead>
            <TableHead
              className="text-right cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort("thrust_N")}
              title="Thrust (kilonewtons)"
            >
              Thrust <SortIcon column="thrust_N" />
            </TableHead>
            <TableHead
              className="text-right cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort("EV_kps")}
              title="Exhaust Velocity (km/s)"
            >
              EV <SortIcon column="EV_kps" />
            </TableHead>
            <TableHead
              className="text-right cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort("efficiency")}
              title="Efficiency (%)"
            >
              Efficiency <SortIcon column="efficiency" />
            </TableHead>
            <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("cooling")}>
              Cooling <SortIcon column="cooling" />
            </TableHead>
            <TableHead>Propellant</TableHead>
            <TableHead title="Required Power Plant">Power Plant</TableHead>
            <TableHead
              className="text-right cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort("powerRequiredGW")}
              title="Power Required (GW)"
            >
              Power <SortIcon column="powerRequiredGW" />
            </TableHead>
            <TableHead
              className="text-right cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort("reactorAndRadiatorTons")}
              title="Reactor + Radiator Mass (tons)"
            >
              Reactor+Rad <SortIcon column="reactorAndRadiatorTons" />
            </TableHead>
            <TableHead
              className="text-right cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort("thrustRating")}
              title="Thrust Rating"
            >
              Thrust <SortIcon column="thrustRating" />
            </TableHead>
            <TableHead
              className="text-right cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort("exhaustRating")}
              title="Exhaust Rating"
            >
              Exhaust <SortIcon column="exhaustRating" />
            </TableHead>
            <TableHead
              className="text-right cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort("overallRating")}
              title="Overall Rating"
            >
              Overall <SortIcon column="overallRating" />
            </TableHead>
            <TableHead
              className="text-right cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort("unlockChance")}
              title="Base Unlock Chance (%)"
            >
              Unlock <SortIcon column="unlockChance" />
            </TableHead>
            <TableHead
              className="text-right cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort("tanksAffordable")}
              title="Fuel tanks affordable with current resources"
            >
              Tanks <SortIcon column="tanksAffordable" />
            </TableHead>
            <TableHead
              className="text-right cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort("techResearchRemaining")}
              title="Tech Research Remaining (thousands)"
            >
              Tech Res <SortIcon column="techResearchRemaining" />
            </TableHead>
            <TableHead
              className="text-right cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort("projectResearchRemaining")}
              title="Project Research Remaining (thousands)"
            >
              Proj Res <SortIcon column="projectResearchRemaining" />
            </TableHead>
            <TableHead
              className="text-right cursor-pointer hover:bg-muted/50 border-l-2"
              onClick={() => handleSort("shipDeltaV")}
              title="Ship Delta-V (km/s, 10k tons + radiator + 50 fuel tanks)"
            >
              ΔV <SortIcon column="shipDeltaV" />
            </TableHead>
            <TableHead
              className="text-right cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort("accelerationMilliGs")}
              title="Ship acceleration (milli-gs, at full fuel)"
            >
              Accel <SortIcon column="accelerationMilliGs" />
            </TableHead>
            <TableHead
              className="text-right cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort("tripTime")}
              title="Time to travel 5 AU (days)"
            >
              5AU d <SortIcon column="tripTime" />
            </TableHead>
            <TableHead className="text-right" title="Final Delta-V after 5 AU trip (km/s)">
              F dV
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {drives.map((drive) => {
            const isUnlocked = analysis.playerFaction.finishedProjectNames.includes(drive.requiredProjectName);

            // Propellant values are already multiplied by 10 in the analysis
            const propellantEffects = {
              water: drive.propellantMaterials.water,
              volatiles: drive.propellantMaterials.volatiles,
              metals: drive.propellantMaterials.metals,
              nobles: drive.propellantMaterials.nobleMetals,
              fissiles: drive.propellantMaterials.fissiles,
              antimatter: drive.propellantMaterials.antimatter,
            };

            // Check if this project is in the goals list
            const isComplete = isUnlocked;
            const goalForThisDrive = goals.find((g) => g.name === drive.requiredProjectName);
            const isInGoals = !!goalForThisDrive;

            // Determine row background based on goal status or tanks affordable
            const rowClassName = isInGoals
              ? "bg-green-50"
              : drive.tanksAffordable < 10
                ? "bg-red-50"
                : drive.tanksAffordable < 100
                  ? "bg-orange-50"
                  : drive.tanksAffordable < 500
                    ? "bg-yellow-50"
                    : "";

            return (
              <TableRow key={drive.dataName} className={rowClassName}>
                <TableCell className="text-center">
                  {!isComplete && isInGoals && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeGoal(goalForThisDrive.id)}
                      className="h-8 w-8 p-0 bg-white"
                      title="Remove from goals"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                  {!isComplete && !isInGoals && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addGoal("project", drive.requiredProjectName)}
                      className="h-8 w-8 p-0 bg-white"
                      title="Add to goals"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
                <TableCell className="font-medium">
                  <ResearchLink name={drive.requiredProjectName} displayName={drive.friendlyName} />
                </TableCell>
                <TableCell className="text-right" title={`${(drive.thrust_N / 1000).toFixed(1)} kN`}>
                  {Math.round(drive.thrust_N / 1000)}
                </TableCell>
                <TableCell className="text-right" title={`${drive.EV_kps.toFixed(1)} km/s`}>
                  {Math.round(drive.EV_kps)}
                </TableCell>
                <TableCell className="text-right">{formatPercent(drive.efficiency * 100)}</TableCell>
                <TableCell title={drive.propellant}>{drive.cooling || "None"}</TableCell>
                <TableCell className="text-xs">
                  <ShowEffects {...propellantEffects} />
                </TableCell>
                <TableCell className="text-xs">{drive.requiredPowerPlantDisplayName || "None"}</TableCell>
                <TableCell
                  className="text-right"
                  title={
                    !isNaN(drive.powerRequiredGW)
                      ? [
                          `Thrust Rating: ${smartRound(drive.thrustRating_GW)} GW`,
                          `Required Power (accounts for efficiency): ${smartRound(drive.reqPower_GW)} GW`,
                          `Drive Efficiency: ${formatPercent(drive.efficiency * 100)}`,
                          drive.thrusters > 1 ? `Number of Thrusters: ${drive.thrusters}` : null,
                          drive.reactorEfficiency !== undefined
                            ? `\nReactor Efficiency: ${formatPercent(drive.reactorEfficiency * 100)}`
                            : null,
                          drive.wasteHeatGW !== undefined
                            ? `Waste Heat: ${smartRound(drive.powerRequiredGW)} GW × ${formatPercent((1 - (drive.reactorEfficiency || 0)) * 100)} = ${smartRound(drive.wasteHeatGW)} GW`
                            : null,
                        ]
                          .filter(Boolean)
                          .join("\n")
                      : undefined
                  }
                >
                  {!isNaN(drive.powerRequiredGW) ? smartRound(drive.powerRequiredGW) : "-"}
                </TableCell>
                <TableCell className="text-right">
                  {drive.reactorAndRadiatorTons !== undefined ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="cursor-help">{smartRound(drive.reactorAndRadiatorTons)}</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="space-y-2">
                            {drive.reactorName && (
                              <div>
                                <div className="font-semibold mb-1">Reactor: {drive.reactorName}</div>
                                <div className="ml-2 text-xs space-y-1">
                                  {drive.reactorGW !== undefined && (
                                    <div>Power Output: {smartRound(drive.reactorGW)} GW</div>
                                  )}
                                  {drive.reactorTonsPerGW !== undefined && (
                                    <div>Specific Power: {smartRound(drive.reactorTonsPerGW)} t/GW</div>
                                  )}
                                  {drive.reactorTons !== undefined && (
                                    <div>Mass: {smartRound(drive.reactorTons)} tons</div>
                                  )}
                                  {drive.reactorResources !== undefined && (
                                    <div>Resources: {smartRound(drive.reactorResources)}</div>
                                  )}
                                  {drive.reactorMaterials && (
                                    <div className="flex items-center gap-1">
                                      <ShowEffects
                                        water={drive.reactorMaterials.water || undefined}
                                        volatiles={drive.reactorMaterials.volatiles || undefined}
                                        metals={drive.reactorMaterials.metals || undefined}
                                        nobles={drive.reactorMaterials.nobleMetals || undefined}
                                      />
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                            {drive.radiatorName && (
                              <div>
                                <div className="font-semibold mb-1">Radiator: {drive.radiatorName}</div>
                                <div className="ml-2 text-xs space-y-1">
                                  {drive.wasteHeatGW !== undefined && (
                                    <div>Waste Heat: {smartRound(drive.wasteHeatGW)} GW</div>
                                  )}
                                  {drive.radiatorGWperTon !== undefined && (
                                    <div>Cooling: {smartRound(drive.radiatorGWperTon)} GW/t</div>
                                  )}
                                  {drive.radiatorTons !== undefined && (
                                    <div>Mass: {smartRound(drive.radiatorTons)} tons</div>
                                  )}
                                  {drive.radiatorResources !== undefined && (
                                    <div>Resources: {smartRound(drive.radiatorResources)}</div>
                                  )}
                                  {drive.radiatorMaterials && (
                                    <div className="flex items-center gap-1">
                                      <ShowEffects
                                        volatiles={drive.radiatorMaterials.volatiles || undefined}
                                        metals={drive.radiatorMaterials.metals || undefined}
                                        nobles={drive.radiatorMaterials.nobleMetals || undefined}
                                        exotics={drive.radiatorMaterials.exotics || undefined}
                                      />
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    <span title={drive.reactorDebugInfo || "No reactor found"}>-</span>
                  )}
                </TableCell>
                <TableCell className="text-right">{drive.thrustRating.toFixed(2)}</TableCell>
                <TableCell className="text-right">{drive.exhaustRating.toFixed(2)}</TableCell>
                <TableCell className="text-right">{drive.overallRating.toFixed(2)}</TableCell>
                <TableCell className="text-right">
                  {drive.unlockChance !== undefined ? `${drive.unlockChance}%` : ""}
                </TableCell>
                <TableCell className="text-right">
                  {drive.tanksAffordable}{" "}
                  {drive.limitingResourceName &&
                    (() => {
                      const ResourceIcon = {
                        Water,
                        Volatiles,
                        Metals,
                        NobleMetals: Nobles,
                        Fissiles,
                        Antimatter,
                      }[drive.limitingResourceName];
                      return ResourceIcon ? <ResourceIcon /> : null;
                    })()}
                </TableCell>
                <TableCell
                  className="text-right"
                  title={
                    drive.requiredTechs.length > 0
                      ? drive.requiredTechs
                          .map((name: string) => analysis.techs.get(name)?.displayName || name)
                          .join("\n")
                      : undefined
                  }
                >
                  {drive.techResearchRemaining > 0 ? smartRound(drive.techResearchRemaining / 1000) : "-"}
                </TableCell>
                <TableCell
                  className="text-right"
                  title={
                    drive.requiredProjects.length > 0
                      ? drive.requiredProjects
                          .map((name: string) => analysis.projects.get(name)?.displayName || name)
                          .join("\n")
                      : undefined
                  }
                >
                  {drive.projectResearchRemaining > 0 ? smartRound(drive.projectResearchRemaining / 1000) : "-"}
                </TableCell>
                <TableCell className="text-right">{smartRound(drive.shipDeltaV / 1000)}</TableCell>
                <TableCell className="text-right">{smartRound(drive.accelerationMilliGs)}</TableCell>
                <TableCell className="text-right" title={drive.tripType}>
                  {smartRound(drive.tripTime / 86400)}
                </TableCell>
                <TableCell className="text-right">
                  {drive.remainingDeltaV > 0 ? smartRound(drive.remainingDeltaV / 1000) : "-"}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

type CalcSortColumn =
  | "driveName"
  | "driveEfficiency"
  | "reactorEfficiency"
  | "tanks"
  | "driveMass"
  | "fuelMass"
  | "reactorMass"
  | "radiatorMass"
  | "totalTons"
  | "totalCost"
  | "deltaV"
  | "acceleration"
  | "travelDays"
  | "techResearchRemaining"
  | "projectResearchRemaining"
  | "unlockChance";

interface CalcParams {
  dryMassTons: number;
  radiatorDataName: string;
  targetDeltaVKps: number;
  targetDistanceAU: number;
}

function computeCalcRow(
  drive: Analysis["drives"][0],
  radiator: Analysis["radiators"][0] | undefined,
  params: CalcParams,
) {
  if (drive.reactorTons === undefined) return null;

  const needsRadiator = drive.cooling === "Calc" || drive.cooling === "Closed";
  const radiatorTons = needsRadiator && radiator ? (drive.wasteHeatGW || 0) / radiator.gwPerTon : 0;

  const fixedMassTons = params.dryMassTons + (drive.reactorTons || 0) + radiatorTons;

  const EV_ms = drive.EV_kps * 1000;
  const targetDV_ms = params.targetDeltaVKps * 1000;
  const massRatio = Math.exp(targetDV_ms / EV_ms);
  const requiredFuelMassTons = fixedMassTons * (massRatio - 1);
  const requiredTanks = Math.ceil(requiredFuelMassTons / 100);
  if (requiredTanks > 1000) return null; // can't reach target deltaV within 1000-tank limit
  const tanksNeeded = Math.max(1, requiredTanks);

  const fuelMassTons = tanksNeeded * 100;
  const totalMassTons = fixedMassTons + fuelMassTons;

  const actualDeltaVMs = EV_ms * Math.log(totalMassTons / fixedMassTons);
  const actualDeltaVKps = actualDeltaVMs / 1000;

  const totalMassKg = totalMassTons * 1000;
  const accelerationMs2 = drive.thrust_N / totalMassKg;
  const accelerationMilliGs = (accelerationMs2 / 9.81) * 1000;

  const targetDistanceM = params.targetDistanceAU * 149597870700;
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

  // Material costs
  const radiatorResources = radiatorTons / 10;
  const radiatorCost =
    radiator && needsRadiator ? addMaterials(radiator.weightedBuildMaterials, undefined, radiatorResources) : {};

  const fuelCost = addMaterials(drive.propellantMaterials, undefined, tanksNeeded);

  const rc: Materials = drive.reactorMaterials || {};
  const driveRes = (drive.flatMass_tons || 0) / 10;
  const driveCost = drive.driveBuildMaterials ? addMaterials(drive.driveBuildMaterials, undefined, driveRes) : {};

  const totalCost = addMaterials(rc, addMaterials(radiatorCost, addMaterials(fuelCost, driveCost)));

  const totalCostResources = Object.values(totalCost).reduce((a, b) => a + b, 0);
  const hardwareMass = (drive.reactorTons || 0) + radiatorTons + (drive.flatMass_tons || 0);
  const totalTons =
    params.dryMassTons + (drive.flatMass_tons || 0) + (drive.reactorTons || 0) + radiatorTons + fuelMassTons;

  return {
    dataName: drive.dataName,
    driveName: drive.friendlyName,
    driveEfficiency: drive.efficiency,
    propellant: drive.propellant,
    reactorEfficiency: drive.reactorEfficiency,
    techResearchRemaining: drive.techResearchRemaining,
    projectResearchRemaining: drive.projectResearchRemaining,
    unlockChance: drive.unlockChance,
    requiredTechs: drive.requiredTechs,
    requiredProjects: drive.requiredProjects,
    reactorName: drive.reactorName,
    reactorTonsPerGW: drive.reactorTonsPerGW,
    powerRequiredGW: drive.powerRequiredGW,
    wasteHeatGW: drive.wasteHeatGW,
    radiatorName: needsRadiator && radiator ? radiator.friendlyName : undefined,
    radiatorGWperTon: needsRadiator && radiator ? radiator.gwPerTon : undefined,
    tanks: tanksNeeded,
    hardwareMass,
    totalTons,
    driveMassTons: drive.flatMass_tons || 0,
    fuelMassTons,
    reactorMassTons: drive.reactorTons || 0,
    radiatorMassTons: radiatorTons,
    driveCost,
    fuelCost,
    reactorCost: rc,
    radiatorCost,
    totalCost,
    totalCostResources,
    deltaV: actualDeltaVKps,
    acceleration: accelerationMilliGs,
    travelDays,
    isUnlocked: false, // filled below
  };
}

function DriveCalculator({ analysis }: { analysis: Analysis }) {
  const bestUnlockedRadiator = analysis.radiators
    .filter((r) => r.isUnlocked)
    .reduce((best, r) => (!best || r.gwPerTon > best.gwPerTon ? r : best), null as Analysis["radiators"][0] | null);

  const [dryMassInput, setDryMassInput] = useState("10000");
  const [radiatorDataName, setRadiatorDataName] = useState(bestUnlockedRadiator?.dataName ?? "");
  const [targetDeltaVInput, setTargetDeltaVInput] = useState("250");
  const [targetDistanceInput, setTargetDistanceInput] = useState("5");
  const [params, setParams] = useState<CalcParams>({
    dryMassTons: 10000,
    radiatorDataName: bestUnlockedRadiator?.dataName ?? "",
    targetDeltaVKps: 250,
    targetDistanceAU: 5,
  });
  const [calcSortColumn, setCalcSortColumn] = useState<CalcSortColumn>("driveName");
  const [calcSortDirection, setCalcSortDirection] = useState<"asc" | "desc">("asc");

  const unlockedProjectNames = new Set(analysis.playerFaction.finishedProjectNames);

  const handleUpdate = () => {
    const dryMass = parseFloat(dryMassInput);
    const targetDV = parseFloat(targetDeltaVInput);
    const targetDist = parseFloat(targetDistanceInput);
    if (!isNaN(dryMass) && !isNaN(targetDV) && !isNaN(targetDist)) {
      setParams({ dryMassTons: dryMass, radiatorDataName, targetDeltaVKps: targetDV, targetDistanceAU: targetDist });
    }
  };

  const selectedRadiator = useMemo(
    () => analysis.radiators.find((r) => r.dataName === params.radiatorDataName),
    [analysis.radiators, params.radiatorDataName],
  );

  const rows = useMemo(() => {
    return analysis.drives
      .map((drive) => {
        const row = computeCalcRow(drive, selectedRadiator, params);
        if (!row) return null;
        return { ...row, isUnlocked: unlockedProjectNames.has(drive.requiredProjectName) };
      })
      .filter((r): r is NonNullable<typeof r> => r !== null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analysis.drives, params, selectedRadiator]);

  const handleCalcSort = (col: CalcSortColumn) => {
    if (calcSortColumn === col) {
      setCalcSortDirection(calcSortDirection === "asc" ? "desc" : "asc");
    } else {
      setCalcSortColumn(col);
      setCalcSortDirection("asc");
    }
  };

  const sortedRows = useMemo(() => {
    return rows.toSorted((a, b) => {
      let cmp = 0;
      switch (calcSortColumn) {
        case "driveName":
          cmp = a.driveName.localeCompare(b.driveName);
          break;
        case "driveEfficiency":
          cmp = a.driveEfficiency - b.driveEfficiency;
          break;
        case "reactorEfficiency":
          cmp = (a.reactorEfficiency ?? 0) - (b.reactorEfficiency ?? 0);
          break;
        case "tanks":
          cmp = a.tanks - b.tanks;
          break;
        case "driveMass":
          cmp = a.driveMassTons - b.driveMassTons;
          break;
        case "fuelMass":
          cmp = a.fuelMassTons - b.fuelMassTons;
          break;
        case "reactorMass":
          cmp = a.reactorMassTons - b.reactorMassTons;
          break;
        case "radiatorMass":
          cmp = a.radiatorMassTons - b.radiatorMassTons;
          break;
        case "totalTons":
          cmp = a.totalTons - b.totalTons;
          break;
        case "totalCost":
          cmp = a.totalCostResources - b.totalCostResources;
          break;
        case "deltaV":
          cmp = a.deltaV - b.deltaV;
          break;
        case "acceleration":
          cmp = a.acceleration - b.acceleration;
          break;
        case "travelDays":
          cmp = a.travelDays - b.travelDays;
          break;
        case "techResearchRemaining":
          cmp = a.techResearchRemaining - b.techResearchRemaining;
          break;
        case "projectResearchRemaining":
          cmp = a.projectResearchRemaining - b.projectResearchRemaining;
          break;
        case "unlockChance":
          cmp = (a.unlockChance ?? 100) - (b.unlockChance ?? 100);
          break;
      }
      return calcSortDirection === "asc" ? cmp : -cmp;
    });
  }, [rows, calcSortColumn, calcSortDirection]);

  const CalcSortIcon = ({ col }: { col: CalcSortColumn }) => {
    if (calcSortColumn !== col) return null;
    return calcSortDirection === "asc" ? (
      <ChevronUp className="inline h-4 w-4" />
    ) : (
      <ChevronDown className="inline h-4 w-4" />
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 items-end p-4 bg-muted/30 rounded-lg">
        <div className="space-y-1">
          <Label htmlFor="calc-dry-mass">Dry Mass (tons)</Label>
          <Input
            id="calc-dry-mass"
            type="number"
            className="w-32"
            value={dryMassInput}
            onChange={(e) => setDryMassInput(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="calc-radiator">Radiator</Label>
          <Select value={radiatorDataName} onValueChange={setRadiatorDataName}>
            <SelectTrigger id="calc-radiator" className="w-56">
              <SelectValue placeholder="Select radiator" />
            </SelectTrigger>
            <SelectContent>
              {analysis.radiators
                .filter((r) => !r.dataName.toLowerCase().includes("collector"))
                .toSorted((a, b) => b.gwPerTon - a.gwPerTon)
                .map((r) => (
                  <SelectItem key={r.dataName} value={r.dataName}>
                    {r.friendlyName}
                    {r.isUnlocked ? "" : " 🔒"} ({smartRound(1 / r.gwPerTon)} t/GW)
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="calc-deltav">Target ΔV (km/s)</Label>
          <Input
            id="calc-deltav"
            type="number"
            className="w-28"
            value={targetDeltaVInput}
            onChange={(e) => setTargetDeltaVInput(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="calc-distance">Target Distance (AU)</Label>
          <Input
            id="calc-distance"
            type="number"
            className="w-28"
            value={targetDistanceInput}
            onChange={(e) => setTargetDistanceInput(e.target.value)}
          />
        </div>
        <Button onClick={handleUpdate}>Update</Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Dry mass is hull/payload (drive + reactor + radiator added on top). Tanks clamped to [1, 1000]. 🔒 = locked
        radiator.
      </p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleCalcSort("driveName")}>
              Drive <CalcSortIcon col="driveName" />
            </TableHead>
            <TableHead
              className="text-right cursor-pointer hover:bg-muted/50"
              onClick={() => handleCalcSort("driveEfficiency")}
              title="Drive efficiency"
            >
              Drive Eff <CalcSortIcon col="driveEfficiency" />
            </TableHead>
            <TableHead
              className="text-right cursor-pointer hover:bg-muted/50"
              onClick={() => handleCalcSort("reactorEfficiency")}
              title="Reactor efficiency"
            >
              React Eff <CalcSortIcon col="reactorEfficiency" />
            </TableHead>
            <TableHead
              className="text-right cursor-pointer hover:bg-muted/50"
              onClick={() => handleCalcSort("tanks")}
              title="Propellant tanks needed"
            >
              Tanks <CalcSortIcon col="tanks" />
            </TableHead>
            <TableHead
              className="text-right cursor-pointer hover:bg-muted/50"
              onClick={() => handleCalcSort("driveMass")}
              title="Drive hardware mass (tons)"
            >
              Drive t <CalcSortIcon col="driveMass" />
            </TableHead>
            <TableHead
              className="text-right cursor-pointer hover:bg-muted/50"
              onClick={() => handleCalcSort("fuelMass")}
              title="Fuel/propellant mass (tons)"
            >
              Fuel t <CalcSortIcon col="fuelMass" />
            </TableHead>
            <TableHead
              className="text-right cursor-pointer hover:bg-muted/50"
              onClick={() => handleCalcSort("reactorMass")}
              title="Reactor mass (tons)"
            >
              Reactor t <CalcSortIcon col="reactorMass" />
            </TableHead>
            <TableHead
              className="text-right cursor-pointer hover:bg-muted/50"
              onClick={() => handleCalcSort("radiatorMass")}
              title="Radiator mass (tons)"
            >
              Radiator t <CalcSortIcon col="radiatorMass" />
            </TableHead>
            <TableHead
              className="text-right cursor-pointer hover:bg-muted/50"
              onClick={() => handleCalcSort("totalTons")}
              title="Total ship mass: dry + drive + reactor + radiator + fuel (tons)"
            >
              Total t <CalcSortIcon col="totalTons" />
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleCalcSort("totalCost")}
              title="Total material cost (sortable by total resources)"
            >
              Total Cost <CalcSortIcon col="totalCost" />
            </TableHead>
            <TableHead
              className="text-right cursor-pointer hover:bg-muted/50"
              onClick={() => handleCalcSort("deltaV")}
              title="Actual delta-V achieved (km/s)"
            >
              ΔV (km/s) <CalcSortIcon col="deltaV" />
            </TableHead>
            <TableHead
              className="text-right cursor-pointer hover:bg-muted/50"
              onClick={() => handleCalcSort("acceleration")}
              title="Acceleration at full fuel (milli-g)"
            >
              Accel (mg) <CalcSortIcon col="acceleration" />
            </TableHead>
            <TableHead
              className="text-right cursor-pointer hover:bg-muted/50"
              onClick={() => handleCalcSort("travelDays")}
              title={`Days to travel ${params.targetDistanceAU} AU`}
            >
              Travel Days <CalcSortIcon col="travelDays" />
            </TableHead>
            <TableHead
              className="text-right cursor-pointer hover:bg-muted/50"
              onClick={() => handleCalcSort("unlockChance")}
              title="Base Unlock Chance (%)"
            >
              Unlock <CalcSortIcon col="unlockChance" />
            </TableHead>
            <TableHead
              className="text-right cursor-pointer hover:bg-muted/50"
              onClick={() => handleCalcSort("techResearchRemaining")}
              title="Tech Research Remaining (thousands)"
            >
              Tech Res <CalcSortIcon col="techResearchRemaining" />
            </TableHead>
            <TableHead
              className="text-right cursor-pointer hover:bg-muted/50"
              onClick={() => handleCalcSort("projectResearchRemaining")}
              title="Project Research Remaining (thousands)"
            >
              Proj Res <CalcSortIcon col="projectResearchRemaining" />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedRows.map((row) => (
            <TableRow key={row.dataName} className={row.isUnlocked ? "" : "opacity-60"}>
              <TableCell className="font-medium">
                {row.driveName}
                {!row.isUnlocked && <span className="ml-1 text-muted-foreground text-xs">(locked)</span>}
                {row.reactorName && <div className="text-xs text-muted-foreground">{row.reactorName}</div>}
              </TableCell>
              <TableCell className="text-right">{formatPercent(row.driveEfficiency * 100)}</TableCell>
              <TableCell className="text-right">
                {row.reactorEfficiency !== undefined ? formatPercent(row.reactorEfficiency * 100) : "-"}
              </TableCell>
              <TableCell className="text-right">{row.tanks}</TableCell>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <TableCell className="text-right cursor-help">
                      {row.driveMassTons > 0 ? smartRound(row.driveMassTons) : "-"}
                    </TableCell>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-xs font-semibold mb-1">Drive materials</div>
                    <ShowEffects {...row.driveCost} />
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <TableCell className="text-right cursor-help">
                      <span
                        className={twMerge(
                          row.propellant === "Hydrogen" && "bg-blue-100 py-0.5 px-1 -mx-1 rounded",
                          row.propellant === "NobleGases" && "bg-green-100 py-0.5 px-1 -mx-1 rounded",
                        )}
                      >
                        {smartRound(row.fuelMassTons)}
                      </span>
                    </TableCell>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-xs font-semibold mb-1">
                      Fuel materials ({row.tanks} tanks, {row.propellant})
                    </div>
                    <ShowEffects {...row.fuelCost} />
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <TableCell className="text-right cursor-help">
                      {row.reactorMassTons > 0 ? smartRound(row.reactorMassTons) : "-"}
                    </TableCell>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="space-y-1">
                      <div className="text-xs font-semibold">{row.reactorName ?? "Reactor"}</div>
                      {row.powerRequiredGW !== undefined && !isNaN(row.powerRequiredGW) && (
                        <div className="text-xs">Power required: {smartRound(row.powerRequiredGW)} GW</div>
                      )}
                      {row.reactorEfficiency !== undefined && (
                        <div className="text-xs">Efficiency: {formatPercent(row.reactorEfficiency * 100)}</div>
                      )}
                      {row.wasteHeatGW !== undefined && (
                        <div className="text-xs">Waste heat: {smartRound(row.wasteHeatGW)} GW</div>
                      )}
                      {row.reactorTonsPerGW !== undefined && (
                        <div className="text-xs">
                          Specific power: {smartRound(row.reactorTonsPerGW)} t/GW (
                          {smartRound(1 / row.reactorTonsPerGW)} GW/t)
                        </div>
                      )}
                      {row.reactorMassTons > 0 && (
                        <div className="text-xs">Mass: {smartRound(row.reactorMassTons)} t</div>
                      )}
                      <div className="text-xs font-semibold mt-1">Materials</div>
                      <ShowEffects {...row.reactorCost} />
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <TableCell className="text-right cursor-help">
                      {row.radiatorMassTons > 0 ? smartRound(row.radiatorMassTons) : "-"}
                    </TableCell>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="space-y-1">
                      <div className="text-xs font-semibold">{row.radiatorName ?? "Radiator"}</div>
                      {row.wasteHeatGW !== undefined && (
                        <div className="text-xs">Waste heat to dissipate: {smartRound(row.wasteHeatGW)} GW</div>
                      )}
                      {row.radiatorGWperTon !== undefined && (
                        <div className="text-xs">
                          Cooling: {smartRound(row.radiatorGWperTon)} GW/t ({smartRound(1 / row.radiatorGWperTon)} t/GW)
                        </div>
                      )}
                      {row.radiatorMassTons > 0 && (
                        <div className="text-xs">Mass: {smartRound(row.radiatorMassTons)} t</div>
                      )}
                      <div className="text-xs font-semibold mt-1">Materials</div>
                      <ShowEffects {...row.radiatorCost} />
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TableCell
                className="text-right"
                title={`Dry ${smartRound(params.dryMassTons)} + Drive ${smartRound(row.driveMassTons)} + Reactor ${smartRound(row.reactorMassTons)} + Radiator ${smartRound(row.radiatorMassTons)} + Fuel ${smartRound(row.fuelMassTons)}`}
              >
                {smartRound(row.totalTons)}
              </TableCell>
              <TableCell>
                <ShowEffects {...row.totalCost} />
              </TableCell>
              <TableCell className="text-right">{smartRound(row.deltaV)}</TableCell>
              <TableCell className="text-right">{smartRound(row.acceleration)}</TableCell>
              <TableCell className="text-right">{smartRound(row.travelDays)}</TableCell>
              <TableCell className="text-right">
                {row.unlockChance !== undefined ? `${row.unlockChance}%` : ""}
              </TableCell>
              <TableCell
                className="text-right"
                title={
                  row.requiredTechs.length > 0
                    ? row.requiredTechs.map((name: string) => analysis.techs.get(name)?.displayName || name).join("\n")
                    : undefined
                }
              >
                {row.techResearchRemaining > 0 ? smartRound(row.techResearchRemaining / 1000) : "-"}
              </TableCell>
              <TableCell
                className="text-right"
                title={
                  row.requiredProjects.length > 0
                    ? row.requiredProjects
                        .map((name: string) => analysis.projects.get(name)?.displayName || name)
                        .join("\n")
                    : undefined
                }
              >
                {row.projectResearchRemaining > 0 ? smartRound(row.projectResearchRemaining / 1000) : "-"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function getDrivesSections(analysis: Analysis) {
  return {
    group: {
      id: "drives",
      label: "Drives",
      leaves: [
        { id: "drives.systems", label: "Drive Systems" },
        { id: "drives.calculator", label: "Drive Calculator" },
      ],
    },
    contents: new Map([
      ["drives.systems", <DrivesTable key="drives-table" analysis={analysis} />],
      ["drives.calculator", <DriveCalculator key="drive-calc" analysis={analysis} />],
    ]),
  };
}
