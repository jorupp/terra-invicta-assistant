import { Analysis } from "@/lib/analysis";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ShowEffects } from "@/components/showEffects";
import { useState } from "react";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { smartRound } from "@/lib/utils";
import { ResearchLink } from "./researchLink";
import { useTechnologyGoals } from "./technologyGoals";
import { Button } from "@/components/ui/button";

type SortColumn =
  | "friendlyName"
  | "driveClassification"
  | "thrust_N"
  | "EV_kps"
  | "efficiency"
  | "cooling"
  | "powerRequiredGW"
  | "radiatorTons"
  | "thrustRating"
  | "exhaustRating"
  | "overallRating"
  | "unlockChance"
  | "tanksAffordable"
  | "techResearchRemaining"
  | "projectResearchRemaining"
  | "shipDeltaV"
  | "tripTime";
type SortDirection = "asc" | "desc";

function DrivesTable({ analysis }: { analysis: Analysis }) {
  const [sortColumn, setSortColumn] = useState<SortColumn>("driveClassification");
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
      case "driveClassification":
        compareValue = a.driveClassification.localeCompare(b.driveClassification);
        if (compareValue === 0) {
          compareValue = a.EV_kps - b.EV_kps;
        }
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
      case "radiatorTons":
        compareValue = (a.radiatorTons ?? Infinity) - (b.radiatorTons ?? Infinity);
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
        <h3 className="text-lg font-semibold">Drive Systems</h3>
        {analysis.bestRadiator && (
          <p className="text-sm text-muted-foreground mt-1">
            Best available radiator: <span className="font-medium">{analysis.bestRadiator.friendlyName}</span> (
            {smartRound(1 / analysis.bestRadiator.gwPerTon)} ton/GW)
          </p>
        )}
        {!analysis.bestRadiator && <p className="text-sm text-muted-foreground mt-1">No radiators available yet</p>}
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead colSpan={17}></TableHead>
            <TableHead
              colSpan={3}
              className="text-center border-l-2 whitespace-normal"
              title="10k tons dry + radiator + 100 fuel tanks"
            >
              Hypothetical Ship
            </TableHead>
            <TableHead></TableHead>
          </TableRow>
          <TableRow>
            <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("friendlyName")}>
              Drive Name <SortIcon column="friendlyName" />
            </TableHead>
            <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("driveClassification")}>
              Classification <SortIcon column="driveClassification" />
            </TableHead>
            <TableHead
              className="text-right cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort("thrust_N")}
              title="Thrust (kilonewtons)"
            >
              Thrust (kN) <SortIcon column="thrust_N" />
            </TableHead>
            <TableHead
              className="text-right cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort("EV_kps")}
              title="Exhaust Velocity (km/s)"
            >
              EV (km/s) <SortIcon column="EV_kps" />
            </TableHead>
            <TableHead className="text-right cursor-pointer hover:bg-muted/50" onClick={() => handleSort("efficiency")}>
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
              Power (GW) <SortIcon column="powerRequiredGW" />
            </TableHead>
            <TableHead
              className="text-right cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort("radiatorTons")}
              title="Radiator Mass (tons)"
            >
              Radiator (t) <SortIcon column="radiatorTons" />
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
              title="Base Unlock Chance"
            >
              Unlock % <SortIcon column="unlockChance" />
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
              title="Tech Research Remaining (in thousands)"
            >
              Tech Res. <SortIcon column="techResearchRemaining" />
            </TableHead>
            <TableHead
              className="text-right cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort("projectResearchRemaining")}
              title="Project Research Remaining (in thousands)"
            >
              Proj. Res. <SortIcon column="projectResearchRemaining" />
            </TableHead>
            <TableHead
              className="text-right cursor-pointer hover:bg-muted/50 border-l-2"
              onClick={() => handleSort("shipDeltaV")}
              title="Ship Delta-V (10k tons + radiator + 100 fuel tanks)"
            >
              ΔV (km/s) <SortIcon column="shipDeltaV" />
            </TableHead>
            <TableHead
              className="text-right cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort("tripTime")}
              title="Time to travel 5 AU (days)"
            >
              5AU Time (d) <SortIcon column="tripTime" />
            </TableHead>
            <TableHead className="text-right" title="Remaining Delta-V after 5 AU trip">
              Remaining ΔV
            </TableHead>
            <TableHead title="Add/Remove Technology Goal">Goal</TableHead>
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
                <TableCell className="font-medium">
                  <ResearchLink name={drive.requiredProjectName} displayName={drive.friendlyName} />
                </TableCell>
                <TableCell>{drive.driveClassificationDisplayName}</TableCell>
                <TableCell className="text-right">{(drive.thrust_N / 1000).toFixed(1)}</TableCell>
                <TableCell className="text-right">{drive.EV_kps.toFixed(1)}</TableCell>
                <TableCell className="text-right">{(drive.efficiency * 100).toFixed(1)}%</TableCell>
                <TableCell>{drive.cooling || "None"}</TableCell>
                <TableCell className="text-xs">
                  <ShowEffects {...propellantEffects} />
                </TableCell>
                <TableCell className="text-xs">{drive.requiredPowerPlantDisplayName || "None"}</TableCell>
                <TableCell className="text-right">
                  {!isNaN(drive.powerRequiredGW) ? smartRound(drive.powerRequiredGW) : "-"}
                </TableCell>
                <TableCell className="text-right">
                  {drive.radiatorTons !== undefined ? smartRound(drive.radiatorTons) : "-"}
                </TableCell>
                <TableCell className="text-right">{drive.thrustRating.toFixed(2)}</TableCell>
                <TableCell className="text-right">{drive.exhaustRating.toFixed(2)}</TableCell>
                <TableCell className="text-right">{drive.overallRating.toFixed(2)}</TableCell>
                <TableCell className="text-right">
                  {drive.unlockChance !== undefined ? `${drive.unlockChance}%` : ""}
                </TableCell>
                <TableCell className="text-right">{drive.tanksAffordable}</TableCell>
                <TableCell className="text-right">
                  {drive.techResearchRemaining > 0 ? smartRound(drive.techResearchRemaining / 1000) : "-"}
                </TableCell>
                <TableCell className="text-right">
                  {drive.projectResearchRemaining > 0 ? smartRound(drive.projectResearchRemaining / 1000) : "-"}
                </TableCell>
                <TableCell className="text-right">{smartRound(drive.shipDeltaV / 1000)}</TableCell>
                <TableCell className="text-right" title={drive.tripType}>
                  {smartRound(drive.tripTime / 86400)}
                </TableCell>
                <TableCell className="text-right">
                  {drive.remainingDeltaV > 0 ? smartRound(drive.remainingDeltaV / 1000) : "-"}
                </TableCell>
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
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

export function getDrivesUi(analysis: Analysis) {
  return {
    key: "drives",
    tab: "Drives",
    content: <DrivesTable analysis={analysis} />,
  };
}
