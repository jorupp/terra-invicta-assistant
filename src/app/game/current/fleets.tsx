import { Analysis } from "@/lib/analysis";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SmartAccordion } from "@/components/ui/smart-accordion";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { diffDateTime, sortByDateTime, toDays } from "@/lib/utils";
import { Fragment } from "react/jsx-runtime";
import { FactionIcons, MissionControl } from "@/components/icons";
import { twMerge } from "tailwind-merge";

export function getFleetsUi(analysis: Analysis) {
  const byTarget = analysis.alienFleetsToPlayerOrbits.reduce((acc, fleet) => {
    const key = fleet.planetName || "Unknown Orbit";
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
        if (survInfo) {
          return (
            <span>
              {target}: {survInfo}
            </span>
          );
        }
        return null;
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
          title={`${fleets.length} fleet(s) targeting ${target}, arriving in ${daysToTarget.toFixed(0)} days, using ${firstMc.toFixed(0)} MC`}
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
          {survInfo && <span/>}
        </span>
      );
    }),
  ].filter((i) => !!i);

  return {
    key: "fleets",
    tab: (
      <>
        Fleets
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
  const alienFleets = analysis.alienFleetsToPlayerOrbits;
  const humanEnemyFleets = analysis.humanEnemyFleetsToPlayerOrbits;
  const playerFleets = analysis.playerFleets;
  const shipsUnderConstruction = analysis.playerShipsUnderConstruction;

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold text-foreground mb-2">{("Alien Fleets")}</h1>
      <div className="bg-card p-6 rounded-lg shadow-sm border border-border/50 space-y-4">
        {/* Summary Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-2 border-b border-border/80">
          <div>
            <p className="text-sm text-muted-foreground uppercase tracking-wider">Total Fleets Tracked</p>
            <h3 className="text-4xl font-extrabold">{alienFleets.length}</h3>
          </div>
          <div>
            <p className="text-sm text-muted-foreground uppercase tracking-wider">Highest Threat (MC)</p>
            <h3 className={`text-4xl font-extrabold ${Math.max(0, ...alienFleets.map(f => f.totalMC)).toFixed(0) > 1e6 ? 'text-red-500' : 'text-yellow-500'}`}>
              {Math.max(0, ...alienFleets.map(f => f.totalMC)).toFixed(0)}
            </h3>
          </div>
          <div>
            <p className="text-sm text-muted-foreground uppercase tracking-wider">Planets Monitored</p>
            <h3 className="text-4xl font-extrabold">{new Set(alienFleets.map(f => f.planetName)).size}</h3>
          </div>
        </div >

        {/* Defense Summary Card - Highly visible, structured metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(() => {
            const planetsWithFleets = new Set(alienFleets.map((f) => f.planetName || "Unknown"));
            const defenseData = Array.from(planetsWithFleets)
              .map((planet) => {
                const fleetsAtPlanet = alienFleets.filter(
                  (f) => f.planetName === planet,
                );
                const totalAlienMC = fleetsAtPlanet.reduce((sum, f) => sum + (f.totalMC || 0), 0);
                const incomingFleets = fleetsAtPlanet.filter(
                  (f) => f.daysToTarget !== null && f.daysToTarget > 0,
                );
                const daysToArrival =
                  incomingFleets.length > 0
                    ? Math.min(...incomingFleets.map((f) => f.daysToTarget!))
                    : null;
                const playerFleetsAtPlanet = analysis.playerFleets.filter(
                  (f) => f.planetName === planet,
                );
                const relevantPlayerFleets = playerFleetsAtPlanet.filter((f) => {
                  if (f.daysToTarget === null || f.daysToTarget <= 0) return true;
                  if (daysToArrival === null) return false;
                  return f.daysToTarget < daysToArrival;
                });
                const totalPlayerMC = relevantPlayerFleets.reduce((sum, f) => sum + (f.totalMC || 0), 0);
                const habsAtPlanet = analysis.playerHabs.filter((h) => h.planetName === planet);
                return { planet, totalAlienMC, totalPlayerMC, daysToArrival, habs: habsAtPlanet };
              })()
              .filter((d) => d.habs.length > 0)
              .sort((a, b) => {
                if (a.daysToArrival === null && b.daysToArrival === null) return 0;
                if (a.daysToArrival === null) return 1;
                if (b.daysToArrival === null) return -1;
                return a.daysToArrival - b.daysToArrival;
              });

            return defenseData.map(({ planet, totalAlienMC, totalPlayerMC, daysToArrival, habs }) => (
<div key={planet} className="p-3 bg-secondary/50 rounded flex items-center justify-between">
                <span className="font-semibold text-lg">{planet}</span>
                <div className="flex gap-4 items-center md:gap-6">
                    <span title={`Days to Arrival for ${planet}`}>
                        <span className={daysToArrival === null ? "text-muted-foreground" : "text-xl font-bold text-red-600"}>
                            {daysToArrival !== null ? `${daysToArrival.toFixed(0)}d` : "—"}
                        </span>
                    </span>
                    <div className="flex flex-col">
                        <span title={`Alien MC at ${planet}`}>{totalAlienMC.toFixed(0)} MC</span>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        {habs.map((hab) => {
                            const activeCombat = hab.activeEffects.combatScore || 0;
                            const potentialCombat = hab.potentialEffects.combatScore || 0;
                            const combatDisplay =
                                activeCombat === potentialCombat
                                  ? activeCombat.toFixed(0)
                                  : `${activeCombat.toFixed(0)} / ${potentialCombat.toFixed(0)}`;
                            const bgColor = hab.habType === "Station" ? "bg-yellow-100 text-yellow-900 border border-yellow-400" : "bg-green-100 text-green-900 border border-green-400";
                            return (
                                <div key={hab.id} className={`px-3 py-1 rounded-full text-sm ${bgColor}`}>
                                    {combatDisplay}
                                </div>
                            );
                        })}
                    </div>
</div />
            ));
          }())
        </div >
                </div>
              </div>
            ));
          }())
        </div >

        {/* Fleets List Section - Retain Table structure but improve styling */}
        <div className="mt-6 pt-4 border-t border-border/80">
          <h2 className="text-xl font-bold mb-3">Detailed Fleet Tracking</h2>
          <Table>
            <TableHeader className="bg-muted/70">
              <TableRow>
                <TableHead className="w-[15%]">Fleet Name</TableHead>
                <TableHead className="w-[10%]">Planet</TableHead>
                <TableHead className="w-[15%]">Target Orbit</TableHead>
                <TableHead className="w-[10%]">Arrival Date</TableHead>
                <TableHead className="text-right w-[12%]">Days to Arrival</TableHead>
                <TableHead className="text-right w-[12%]">MC Used</TableHead>
                <TableHead className="text-right w-[8%]">Marine CP</TableHead>
                <TableHead className="text-right w-[10%]">Total Mass (Mkg)</TableHead>
                <TableHead className="text-right w-[10%]">Max Ship Mass (Mkg)</TableHead>
                <TableHead class="w-[25%]">Hulls</TableHead>
                <TableHead class="w-[25%]">Roles / Classes</TableHead>
                <TableHead className="w-[15%]">Status/Operation</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {alienFleets.map((fleet) => (
                <TableRow key={fleet.id} className={twMerge(fleet.deltaV === 0 ? "bg-gray-500/5" : "")}>
                  <TableCell className="font-medium">{fleet.displayName}</TableCell>
                  <TableCell>{fleet.planetName}</TableCell>
                  <TableCell>{fleet.targetOrbitName}</TableCell>
                  <TableCell>{fleet.arrivalTimeFormatted || "-"}</TableCell>
                  <TableCell className="text-right">
                    {fleet.daysToTarget !== null ? `${fleet.daysToTarget.toFixed(0)}` : "—"}
                  </TableCell>
                  <TableCell className="text-right">{fleet.totalMC.toFixed(0)}</TableCell>
                  <TableCell className="text-right">{fleet.marineCombatPower > 0 ? fleet.marineCombatPower : "—"}</TableCell>
                  <TableCell className="text-right">{(fleet.totalMass / 1000000).toFixed(0)}</TableCell>
                  <TableCell className="text-right">{(fleet.maxShipMass / 1000000).toFixed(0)}</TableCell>
                  <TableCell className="whitespace-normal">{fleet.shipsByHullType.length > 0 ? fleet.shipsByHullType.map((ship) => `${ship.count} ${ship.hullName}${ship.count > 1 ? "s" : ""}`).join(" + ") : "-"}</TableCell>
                  <TableCell className="whitespace-normal">{fleet.shipsByRole.length > 0 ? fleet.shipsByRole.map((s) => `${s.count} ${s.role}${s.count > 1 ? "s" : ""}`).join(" + ") : "-"}</TableCell>
                  <TableCell>{fleet.operation || "-"} / {fleet.operationComplete || "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>