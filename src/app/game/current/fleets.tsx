import { Analysis } from "@/lib/analysis";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { diffDateTime, sortByDateTime, toDays } from "@/lib/utils";
import { Fragment } from "react/jsx-runtime";
import { MissionControl } from "@/components/icons";

export function getFleetsUi(analysis: Analysis) {
  const byTarget = analysis.alienFleetsToPlayerOrbits.reduce((acc, fleet) => {
    const key = fleet.targetOrbitName || "Unknown Orbit";
    if (!acc.has(key)) {
      acc.set(key, []);
    }
    acc.get(key)!.push(fleet);
    return acc;
  }, new Map<string, typeof analysis.alienFleetsToPlayerOrbits>());
  const label = [
    ...byTarget.entries().map(([target, fleets]) => {
      // now that we know the arrival of the first one, find all arriving within 14 days to summarize MC
      const firstFleet = sortByDateTime(fleets, (f) => f.arrivalTime || analysis.gameCurrentDateTime)[0];
      const firstFleets = fleets.filter(
        (f) =>
          toDays(
            diffDateTime(
              f.arrivalTime || analysis.gameCurrentDateTime,
              firstFleet.arrivalTime || analysis.gameCurrentDateTime
            )
          ) < 14
      );
      const firstMc = firstFleets.reduce((sum, f) => sum + f.totalMC, 0);
      const surv = firstFleets.filter((f) => f.operation === "AlienEarthSurveillanceOperation" && !f.arrivalTime);
      const survInfo = surv.length ? (
        <>
          ,{" "}
          <span className="text-white bg-destructive rounded py-2 px-3 font-bold">
            {surv
              .map((f) => f.operationCompleteDays || 0)
              .reduce((a, b) => Math.min(a, b), 9999999999)
              .toFixed(0)}
            d Surveillance
          </span>{" "}
        </>
      ) : (
        ""
      );
      return (
        <>
          {target}: x{fleets.length}, 1st {(firstFleet.daysToTarget || 0).toFixed(0)}d w/ {firstMc.toFixed(0)}{" "}
          <MissionControl />
          {survInfo}
        </>
      );
    }),
  ];

  return {
    key: "fleets",
    tab: (
      <>
        Alien Fleets
        {label.length > 0 ? (
          <>
            (
            {label.map((i, ix) => (
              <Fragment key={ix}>{i}</Fragment>
            ))}
            )
          </>
        ) : (
          ""
        )}
      </>
    ),
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
      <p>Tracking planets: {analysis.playerInterestedPlanets.map((p) => p.displayName).join(", ")}</p>
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
