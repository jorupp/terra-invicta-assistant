import { Analysis } from "@/lib/analysis";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ShowEffects } from "@/components/showEffects";

function DrivesTable({ analysis }: { analysis: Analysis }) {
  const drives = analysis.drives.sort((a, b) => {
    // Sort by classification first, then by EV_kps
    if (a.driveClassification !== b.driveClassification) {
      return a.driveClassification.localeCompare(b.driveClassification);
    }
    return a.EV_kps - b.EV_kps;
  });

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Drive Systems</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Drive Name</TableHead>
            <TableHead>Classification</TableHead>
            <TableHead className="text-right">Thrust (kN)</TableHead>
            <TableHead className="text-right">Exhaust Velocity (km/s)</TableHead>
            <TableHead className="text-right">Efficiency</TableHead>
            <TableHead>Propellant (per tank)</TableHead>
            <TableHead>Required Power Plant</TableHead>
            <TableHead className="text-right">Tech Research Remaining</TableHead>
            <TableHead className="text-right">Project Research Remaining</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {drives.map((drive) => {
            const isUnlocked = analysis.playerFaction.finishedProjectNames.includes(drive.requiredProjectName);
            
            // Multiply by 10 and convert to per-day values for ShowEffects
            const propellantEffects = {
              water_day: drive.propellantMaterials.water * 10,
              volatiles_day: drive.propellantMaterials.volatiles * 10,
              metals_day: drive.propellantMaterials.metals * 10,
              nobles_day: drive.propellantMaterials.nobleMetals * 10,
              fissiles_day: drive.propellantMaterials.fissiles * 10,
              antimatter_day: drive.propellantMaterials.antimatter * 10,
            };

            return (
              <TableRow key={drive.dataName}>
                <TableCell className="font-medium">{drive.friendlyName}</TableCell>
                <TableCell>{drive.driveClassification}</TableCell>
                <TableCell className="text-right">{(drive.thrust_N / 1000).toFixed(1)}</TableCell>
                <TableCell className="text-right">{drive.EV_kps.toFixed(1)}</TableCell>
                <TableCell className="text-right">{(drive.efficiency * 100).toFixed(1)}%</TableCell>
                <TableCell className="text-xs">
                  <ShowEffects {...propellantEffects} />
                </TableCell>
                <TableCell className="text-xs">{drive.requiredPowerPlant || "None"}</TableCell>
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
