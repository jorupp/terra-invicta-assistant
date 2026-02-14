import { Analysis } from "@/lib/analysis";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { diffDateTime, sortByDateTime, toDays } from "@/lib/utils";
import { Fragment } from "react/jsx-runtime";
import { MissionControl } from "@/components/icons";
import { twMerge } from "tailwind-merge";

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
    ...byTarget.entries().map(([target, rawFleets]) => {
      const fleets = rawFleets.filter((f) => f.deltaV > 0 && (f.daysToTarget || 0) > 0);
      const surv = rawFleets.filter((f) => f.operation === "AlienEarthSurveillanceOperation" && !f.arrivalTime);
      const survInfo = surv.length ? (
        <>
          <span className="text-white bg-destructive rounded py-2 px-3 font-bold">
            {surv
              .map((f) => f.operationCompleteDays || 0)
              .reduce((a, b) => Math.min(a, b), 9999999999)
              .toFixed(0)}
            d Surveillance
          </span>{" "}
        </>
      ) : null;
      if (fleets.length === 0) {
        return (
          <span>
            {target}: {survInfo}
          </span>
        );
      }
      // now that we know the arrival of the first one, find all arriving within 14 days to summarize MC
      const firstFleet = sortByDateTime(fleets, (f) => f.arrivalTime || analysis.gameCurrentDateTime)[0];
      const firstFleets = fleets.filter(
        (f) =>
          toDays(
            diffDateTime(
              f.arrivalTime || analysis.gameCurrentDateTime,
              firstFleet.arrivalTime || analysis.gameCurrentDateTime,
            ),
          ) < 14,
      );
      const firstMc = firstFleets.reduce((sum, f) => sum + f.totalMC, 0);

      // tier 2 hab (60d), fusion power, and defense module (90d) take a total of 150 days
      // tier 3 hab (90d), fusion power, and defense module (180d) take a total of 270 days.
      // T2 hab should be able to stop a bombard from a 10MC fleet, and T3 is the best we can do anyway, plus the turn time of 30 days should make for enough warning
      // before that, we'll still have the nameplate warning and can look at details in the fleets tab
      const warningNeeded = (firstMc > 10 ? 270 : 150) + 30;
      const daysToTarget = firstFleet.daysToTarget || 0;
      const farFuture = daysToTarget > warningNeeded;
      const className = twMerge(
        farFuture && "px-1 -mx-1 py-0.5 -my-0.5 rounded bg-green-500",
        farFuture &&
          (daysToTarget < warningNeeded + 50
            ? "bg-red-200"
            : daysToTarget < warningNeeded + 100
              ? "bg-yellow-200"
              : "bg-green-200"),
      );
      return (
        <span
          className={className}
          title={`${fleets.length} fleet(s) targeting ${target}, arriving in ${daysToTarget.toFixed(
            0,
          )} days, using ${firstMc.toFixed(0)} MC`}
        >
          {target}
          {fleets.length > 1 ? `(${fleets.length})` : ""}
          {farFuture ? (
            ""
          ) : (
            <>
              : {daysToTarget.toFixed(0)}d <MissionControl />
              {firstMc.toFixed(0)}
            </>
          )}
          {survInfo && <>,{survInfo}</>}
        </span>
      );
    }),
  ].filter((i) => !!i);

  return {
    key: "fleets",
    tab: (
      <>
        Alien Fleets
        {label.length > 0 ? (
          <>
            {" - "}
            {label.map((i, ix) => (
              <Fragment key={ix}>
                {i}
                {ix < label.length - 1 ? " | " : ""}
              </Fragment>
            ))}
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
    <div className="space-y-2">
      <p>Tracking planets: {analysis.playerInterestedPlanets.map((p) => p.displayName).join(", ")}</p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fleet Name</TableHead>
            <TableHead>Target Orbit</TableHead>
            <TableHead>Arrival Date</TableHead>
            <TableHead className="text-right">Days to Arrival</TableHead>
            <TableHead className="text-right">MC Used</TableHead>
            <TableHead className="text-right">Total Mass</TableHead>
            <TableHead className="text-right">Max Ship Mass</TableHead>
            {/* <TableHead className="text-right">DeltaV</TableHead> */}
            <TableHead>Ships Hulls</TableHead>
            <TableHead>Ships Roles</TableHead>
            <TableHead>Operation</TableHead>
            <TableHead>Operation Complete</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fleets.map((fleet) => (
            <TableRow key={fleet.id} className={twMerge(fleet.deltaV === 0 ? "bg-gray-500/5" : "")}>
              <TableCell className="font-medium">{fleet.displayName}</TableCell>
              <TableCell>{fleet.targetOrbitName}</TableCell>
              <TableCell>{fleet.arrivalTimeFormatted || "-"}</TableCell>
              <TableCell className="text-right">
                {fleet.daysToTarget !== null ? `${fleet.daysToTarget.toFixed(0)}` : "—"}
              </TableCell>
              <TableCell className="text-right">{fleet.totalMC.toFixed(0)}</TableCell>
              <TableCell className="text-right">{(fleet.totalMass / 1000000).toFixed(0)} Mkg</TableCell>
              <TableCell className="text-right">{(fleet.maxShipMass / 1000000).toFixed(0)} Mkg</TableCell>
              {/* <TableCell className="text-right">{fleet.deltaV !== null ? fleet.deltaV.toFixed(0) : "—"}</TableCell> */}
              <TableCell>
                {fleet.shipsByHullType.length > 0
                  ? fleet.shipsByHullType
                      .map((ship) => `${ship.count} ${ship.hullName}${ship.count > 1 ? "s" : ""}`)
                      .join(" + ")
                  : "-"}
              </TableCell>
              <TableCell>
                {fleet.shipsByRole.length > 0
                  ? fleet.shipsByRole
                      .map((ship) => `${ship.count} ${ship.role}${ship.count > 1 ? "s" : ""}`)
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
