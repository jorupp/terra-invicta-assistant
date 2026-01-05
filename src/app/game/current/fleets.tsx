import { Analysis } from "@/lib/analysis";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";

export function getFleetsUi(analysis: Analysis) {
  return {
    key: "fleets",
    tab: <>Alien Fleets ({analysis.alienFleetsToPlayerOrbits.length})</>,
    content: <FleetsComponent analysis={analysis} />,
  };
}

function FleetsComponent({ analysis }: { analysis: Analysis }) {
  const fleets = analysis.alienFleetsToPlayerOrbits;

  if (fleets.length === 0) {
    return <div className="p-4 text-muted-foreground">No alien fleets detected heading to player orbits.</div>;
  }

  return (
    <div className="p-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fleet Name</TableHead>
            <TableHead>Target Orbit</TableHead>
            <TableHead>Arrival Date</TableHead>
            <TableHead className="text-right">Days to Arrival</TableHead>
            <TableHead className="text-right">MC Used</TableHead>
            <TableHead>Ships</TableHead>
            <TableHead>Operation</TableHead>
            <TableHead>Operation Complete</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fleets.map((fleet) => (
            <TableRow key={fleet.id}>
              <TableCell className="font-medium">{fleet.displayName}</TableCell>
              <TableCell>{fleet.targetOrbitName}</TableCell>
              <TableCell>{fleet.arrivalTimeFormatted || "-"}</TableCell>
              <TableCell className="text-right">
                {fleet.daysToTarget !== null ? `${fleet.daysToTarget.toFixed(0)}` : "—"}
              </TableCell>
              <TableCell className="text-right">{fleet.totalMC.toFixed(0)}</TableCell>
              <TableCell>
                {fleet.shipsByHullType.length > 0
                  ? fleet.shipsByHullType
                      .map((ship) => `${ship.count} ${ship.hullName}${ship.count > 1 ? "s" : ""}`)
                      .join(" + ")
                  : "-"}
              </TableCell>
              <TableCell>{fleet.operation || "-"}</TableCell>
              <TableCell>
                {fleet.operationComplete
                  ? `${fleet.operationComplete}${
                      fleet.operationCompleteDays !== null ? ` (${fleet.operationCompleteDays.toFixed(0)}d)` : ""
                    }`
                  : "-"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Collapsible>
        <CollapsibleTrigger asChild>
          <Button>Debug Data</Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <pre>{JSON.stringify(fleets, null, 2)}</pre>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
