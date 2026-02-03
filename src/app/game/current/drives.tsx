import { Analysis } from "@/lib/analysis";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ShowEffects } from "@/components/showEffects";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

type SortColumn =
  | "friendlyName"
  | "driveClassification"
  | "thrust_N"
  | "EV_kps"
  | "efficiency"
  | "cooling"
  | "thrustRating"
  | "exhaustRating"
  | "overallRating"
  | "unlockChance"
  | "techResearchRemaining"
  | "projectResearchRemaining";
type SortDirection = "asc" | "desc";

function DrivesTable({ analysis }: { analysis: Analysis }) {
  const [sortColumn, setSortColumn] = useState<SortColumn>("driveClassification");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const drives = analysis.drives.toSorted((a, b) => {
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
      case "techResearchRemaining":
        compareValue = a.techResearchRemaining - b.techResearchRemaining;
        break;
      case "projectResearchRemaining":
        compareValue = a.projectResearchRemaining - b.projectResearchRemaining;
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
      <h3 className="text-lg font-semibold">Drive Systems</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("friendlyName")}>
              Drive Name <SortIcon column="friendlyName" />
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort("driveClassification")}
            >
              Classification <SortIcon column="driveClassification" />
            </TableHead>
            <TableHead
              className="text-right cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort("thrust_N")}
            >
              Thrust (kN) <SortIcon column="thrust_N" />
            </TableHead>
            <TableHead
              className="text-right cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort("EV_kps")}
            >
              Exhaust Velocity (km/s) <SortIcon column="EV_kps" />
            </TableHead>
            <TableHead
              className="text-right cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort("efficiency")}
            >
              Efficiency <SortIcon column="efficiency" />
            </TableHead>
            <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("cooling")}>
              Cooling <SortIcon column="cooling" />
            </TableHead>
            <TableHead>Propellant (per tank)</TableHead>
            <TableHead>Required Power Plant</TableHead>
            <TableHead
              className="text-right cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort("thrustRating")}
            >
              Thrust Rating <SortIcon column="thrustRating" />
            </TableHead>
            <TableHead
              className="text-right cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort("exhaustRating")}
            >
              Exhaust Rating <SortIcon column="exhaustRating" />
            </TableHead>
            <TableHead
              className="text-right cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort("overallRating")}
            >
              Overall Rating <SortIcon column="overallRating" />
            </TableHead>
            <TableHead
              className="text-right cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort("unlockChance")}
            >
              Base Unlock Chance <SortIcon column="unlockChance" />
            </TableHead>
            <TableHead
              className="text-right cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort("techResearchRemaining")}
            >
              Tech Research Remaining <SortIcon column="techResearchRemaining" />
            </TableHead>
            <TableHead
              className="text-right cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort("projectResearchRemaining")}
            >
              Project Research Remaining <SortIcon column="projectResearchRemaining" />
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

            return (
              <TableRow key={drive.dataName} className={drive.expensivePropellant ? "bg-yellow-50" : ""}>
                <TableCell className="font-medium">{drive.friendlyName}</TableCell>
                <TableCell>{drive.driveClassification}</TableCell>
                <TableCell className="text-right">{(drive.thrust_N / 1000).toFixed(1)}</TableCell>
                <TableCell className="text-right">{drive.EV_kps.toFixed(1)}</TableCell>
                <TableCell className="text-right">{(drive.efficiency * 100).toFixed(1)}%</TableCell>
                <TableCell>{drive.cooling || "None"}</TableCell>
                <TableCell className="text-xs">
                  <ShowEffects {...propellantEffects} />
                </TableCell>
                <TableCell className="text-xs">{drive.requiredPowerPlant || "None"}</TableCell>
                <TableCell className="text-right">{drive.thrustRating.toFixed(2)}</TableCell>
                <TableCell className="text-right">{drive.exhaustRating.toFixed(2)}</TableCell>
                <TableCell className="text-right">{drive.overallRating.toFixed(2)}</TableCell>
                <TableCell className="text-right">
                  {drive.unlockChance !== undefined ? `${drive.unlockChance}%` : ""}
                </TableCell>
                <TableCell className="text-right">
                  {drive.techResearchRemaining > 0 ? drive.techResearchRemaining.toFixed(0) : "-"}
                </TableCell>
                <TableCell className="text-right">
                  {drive.projectResearchRemaining > 0 ? drive.projectResearchRemaining.toFixed(0) : "-"}
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
