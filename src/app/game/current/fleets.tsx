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
    <SmartAccordion
      type="multiple"
      storageKey="fleetsSections"
      defaultValue={["alien-fleets", "human-enemy-fleets", "player-fleets", "ships-under-construction"]}
    >
      {/* Alien Fleets */}
      <AccordionItem value="alien-fleets">
        <AccordionTrigger>Alien Fleets ({alienFleets.length})</AccordionTrigger>
        <AccordionContent>
          {alienFleets.length === 0 ? (
            <div className="p-4 text-muted-foreground">No alien fleets detected heading to player orbits.</div>
          ) : (
            <div className="space-y-2">
              <p>Tracking planets: {analysis.playerInterestedPlanets.map((p) => p.displayName).join(", ")}</p>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fleet Name</TableHead>
                    <TableHead>Planet</TableHead>
                    <TableHead>Target Orbit</TableHead>
                    <TableHead>Arrival Date</TableHead>
                    <TableHead className="text-right">Days to Arrival</TableHead>
                    <TableHead className="text-right">MC Used</TableHead>
                    <TableHead className="text-right">Marine CP</TableHead>
                    <TableHead className="text-right">Total Mass</TableHead>
                    <TableHead className="text-right">Max Ship Mass</TableHead>
                    <TableHead>Ships Hulls</TableHead>
                    <TableHead>Ships Roles</TableHead>
                    <TableHead>Operation</TableHead>
                    <TableHead>Operation Complete</TableHead>
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
                      <TableCell className="text-right">{(fleet.totalMass / 1000000).toFixed(0)} Mkg</TableCell>
                      <TableCell className="text-right">{(fleet.maxShipMass / 1000000).toFixed(0)} Mkg</TableCell>
                      <TableCell className="whitespace-normal">
                        {fleet.shipsByHullType.length > 0
                          ? fleet.shipsByHullType
                              .map((ship) => {
                                const name = `${ship.count} ${ship.hullName.replace("Alien ", "")}${ship.count > 1 ? "s" : ""}`;
                                return ship.avgNoseArmor > 0 ? `${name} (${ship.avgNoseArmor})` : name;
                              })
                              .join(" + ")
                          : "-"}
                      </TableCell>
                      <TableCell className="whitespace-normal">
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
                              fleet.operationCompleteDays !== null
                                ? ` (${fleet.operationCompleteDays.toFixed(0)}d)`
                                : ""
                            }`
                          : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Planetary Defense Summary */}
              <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4">Planetary Defense Summary</h2>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Planet</TableHead>
                      <TableHead className="text-right">Days to Arrival</TableHead>
                      <TableHead className="text-right">Alien Fleet MC</TableHead>
                      <TableHead className="text-right">Player Fleet MC</TableHead>
                      <TableHead>Habs (Active / Potential Combat)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(() => {
                      const planetsWithFleets = new Set(
                        analysis.alienFleetsToPlayerOrbits.map((f) => f.planetName || "Unknown"),
                      );
                      const defenseData = Array.from(planetsWithFleets)
                        .map((planet) => {
                          const fleetsAtPlanet = analysis.alienFleetsToPlayerOrbits.filter(
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
                        })
                        .filter((d) => d.habs.length > 0)
                        .toSorted((a, b) => {
                          if (a.daysToArrival === null && b.daysToArrival === null) return 0;
                          if (a.daysToArrival === null) return 1;
                          if (b.daysToArrival === null) return -1;
                          return a.daysToArrival - b.daysToArrival;
                        });

                      return defenseData.map(({ planet, totalAlienMC, totalPlayerMC, daysToArrival, habs }) => (
                        <TableRow key={planet}>
                          <TableCell className="font-medium">{planet}</TableCell>
                          <TableCell className="text-right">
                            {daysToArrival !== null ? daysToArrival.toFixed(0) : "—"}
                          </TableCell>
                          <TableCell className="text-right">{totalAlienMC.toFixed(0)}</TableCell>
                          <TableCell className="text-right">{totalPlayerMC.toFixed(0)}</TableCell>
                          <TableCell>
                            <TooltipProvider>
                              <div className="flex gap-2 flex-wrap">
                                {habs
                                  .toSorted((a, b) => {
                                    if (a.habType === "Station" && b.habType !== "Station") return -1;
                                    if (a.habType !== "Station" && b.habType === "Station") return 1;
                                    return 0;
                                  })
                                  .map((hab) => {
                                    const activeCombat = hab.activeEffects.combatScore || 0;
                                    const potentialCombat = hab.potentialEffects.combatScore || 0;
                                    const combatDisplay =
                                      activeCombat === potentialCombat
                                        ? activeCombat.toFixed(0)
                                        : `${activeCombat.toFixed(0)} / ${potentialCombat.toFixed(0)}`;
                                    const bgColor = hab.habType === "Station" ? "bg-yellow-100" : "bg-green-100";
                                    return (
                                      <Tooltip key={hab.id}>
                                        <TooltipTrigger asChild>
                                          <span className={`cursor-help ${bgColor} px-1.5 py-0.5 rounded`}>
                                            {combatDisplay}
                                          </span>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <div>{hab.displayName}</div>
                                        </TooltipContent>
                                      </Tooltip>
                                    );
                                  })}
                              </div>
                            </TooltipProvider>
                          </TableCell>
                        </TableRow>
                      ));
                    })()}
                  </TableBody>
                </Table>
              </div>

              <Collapsible>
                <CollapsibleTrigger asChild>
                  <Button>Debug Data</Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <pre>{JSON.stringify(alienFleets, null, 2)}</pre>
                </CollapsibleContent>
              </Collapsible>
            </div>
          )}
        </AccordionContent>
      </AccordionItem>

      {/* Other Human Factions Fleets */}
      <AccordionItem value="human-enemy-fleets">
        <AccordionTrigger>Other Human Factions ({humanEnemyFleets.length})</AccordionTrigger>
        <AccordionContent>
          {humanEnemyFleets.length === 0 ? (
            <div className="p-4 text-muted-foreground">No other human faction fleets detected heading to player orbits.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Faction</TableHead>
                  <TableHead>Fleet Name</TableHead>
                  <TableHead>Planet</TableHead>
                  <TableHead>Target Orbit</TableHead>
                  <TableHead>Arrival Date</TableHead>
                  <TableHead className="text-right">Days to Arrival</TableHead>
                  <TableHead className="text-right">MC Used</TableHead>
                  <TableHead className="text-right">Marine CP</TableHead>
                  <TableHead className="text-right">Total Mass</TableHead>
                  <TableHead className="text-right">Max Ship Mass</TableHead>
                  <TableHead>Ship Hulls</TableHead>
                  <TableHead>Ship Roles</TableHead>
                  <TableHead>Operation</TableHead>
                  <TableHead>Operation Complete</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {humanEnemyFleets.map((fleet) => {
                  const FactionIcon = fleet.factionTemplateName
                    ? FactionIcons[fleet.factionTemplateName as keyof typeof FactionIcons]
                    : null;
                  return (
                    <TableRow key={fleet.id} className={twMerge(fleet.deltaV === 0 ? "bg-gray-500/5" : "")}>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {FactionIcon && <FactionIcon className="p-1 rounded" />}
                          <span className="text-sm">{fleet.factionDisplayName ?? fleet.factionTemplateName ?? "Unknown"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{fleet.displayName}</TableCell>
                      <TableCell>{fleet.planetName}</TableCell>
                      <TableCell>{fleet.targetOrbitName}</TableCell>
                      <TableCell>{fleet.arrivalTimeFormatted || "-"}</TableCell>
                      <TableCell className="text-right">
                        {fleet.daysToTarget !== null ? `${fleet.daysToTarget.toFixed(0)}` : "—"}
                      </TableCell>
                      <TableCell className="text-right">{fleet.totalMC.toFixed(0)}</TableCell>
                      <TableCell className="text-right">{fleet.marineCombatPower > 0 ? fleet.marineCombatPower : "—"}</TableCell>
                      <TableCell className="text-right">{(fleet.totalMass / 1000000).toFixed(0)} Mkg</TableCell>
                      <TableCell className="text-right">{(fleet.maxShipMass / 1000000).toFixed(0)} Mkg</TableCell>
                      <TableCell className="whitespace-normal">
                        {fleet.shipsByHullType.length > 0
                          ? fleet.shipsByHullType
                              .map((ship) => {
                                const name = `${ship.count} ${ship.hullName}${ship.count > 1 ? "s" : ""}`;
                                return ship.avgNoseArmor > 0 ? `${name} (${ship.avgNoseArmor})` : name;
                              })
                              .join(" + ")
                          : "-"}
                      </TableCell>
                      <TableCell className="whitespace-normal">
                        {fleet.shipsByRole.length > 0
                          ? fleet.shipsByRole.map((s) => `${s.count} ${s.role}${s.count > 1 ? "s" : ""}`).join(" + ")
                          : "-"}
                      </TableCell>
                      <TableCell>{fleet.operation || "-"}</TableCell>
                      <TableCell>
                        {fleet.operationComplete
                          ? `${fleet.operationComplete}${fleet.operationCompleteDays !== null ? ` (${fleet.operationCompleteDays.toFixed(0)}d)` : ""}`
                          : "-"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </AccordionContent>
      </AccordionItem>

      {/* Player Fleets */}
      <AccordionItem value="player-fleets">
        <AccordionTrigger>Player Fleets ({playerFleets.length})</AccordionTrigger>
        <AccordionContent>
          {playerFleets.length === 0 ? (
            <div className="p-4 text-muted-foreground">No player fleets found.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fleet Name</TableHead>
                  <TableHead>Planet</TableHead>
                  <TableHead>Target Orbit</TableHead>
                  <TableHead>Arrival Date</TableHead>
                  <TableHead className="text-right">Days to Arrival</TableHead>
                  <TableHead className="text-right">MC Used</TableHead>
                  <TableHead className="text-right">Marine CP</TableHead>
                  <TableHead className="text-right">Total Mass</TableHead>
                  <TableHead className="text-right">Max Ship Mass</TableHead>
                  <TableHead>Ship Hulls</TableHead>
                  <TableHead>Ship Classes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {playerFleets.map((fleet) => (
                  <TableRow key={fleet.id}>
                    <TableCell className="font-medium">{fleet.displayName}</TableCell>
                    <TableCell>{fleet.planetName}</TableCell>
                    <TableCell>{fleet.targetOrbitName}</TableCell>
                    <TableCell>{fleet.arrivalTimeFormatted || "-"}</TableCell>
                    <TableCell className="text-right">
                      {fleet.daysToTarget !== null ? `${fleet.daysToTarget.toFixed(0)}` : "—"}
                    </TableCell>
                    <TableCell className="text-right">{fleet.totalMC.toFixed(0)}</TableCell>
                    <TableCell className="text-right">{fleet.marineCombatPower > 0 ? fleet.marineCombatPower : "—"}</TableCell>
                    <TableCell className="text-right">{(fleet.totalMass / 1000000).toFixed(0)} Mkg</TableCell>
                    <TableCell className="text-right">{(fleet.maxShipMass / 1000000).toFixed(0)} Mkg</TableCell>
                    <TableCell className="whitespace-normal">
                      {fleet.shipsByHullType.length > 0
                        ? fleet.shipsByHullType.map((ship, i) => (
                            <Fragment key={ship.hullName}>
                              {i > 0 && <br />}
                              {ship.count} {ship.hullName}
                              {ship.count > 1 ? "s" : ""}
                            </Fragment>
                          ))
                        : "-"}
                    </TableCell>
                    <TableCell className="whitespace-normal">
                      {fleet.shipsByClass.length > 0
                        ? fleet.shipsByClass.map((cls, i) => (
                            <Fragment key={cls.className}>
                              {i > 0 && <br />}
                              {cls.count}× {cls.className}{cls.noseArmor > 0 ? ` (${cls.noseArmor})` : ""}
                            </Fragment>
                          ))
                        : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </AccordionContent>
      </AccordionItem>

      {/* Ships Under Construction */}
      <AccordionItem value="ships-under-construction">
        <AccordionTrigger>Ships Under Construction ({shipsUnderConstruction.length})</AccordionTrigger>
        <AccordionContent>
          {shipsUnderConstruction.length === 0 ? (
            <div className="p-4 text-muted-foreground">No ships under construction.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Planet</TableHead>
                  <TableHead>Design</TableHead>
                  <TableHead>Hull</TableHead>
                  <TableHead className="text-right">Nose Armor</TableHead>
                  <TableHead className="text-right">Count</TableHead>
                  <TableHead>Days to Complete</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(() => {
                  const byPlanetDesign = shipsUnderConstruction.reduce((acc, ship) => {
                    const key = `${ship.planetName}||${ship.designName}`;
                    if (!acc.has(key))
                      acc.set(key, {
                        planetName: ship.planetName,
                        designName: ship.designName,
                        hullName: ship.hullName,
                        noseArmor: ship.noseArmor,
                        entries: [] as { days: number; status: "building" | "queued" | "waiting" }[],
                      });
                    acc.get(key)!.entries.push({ days: ship.daysToCompletion, status: ship.status });
                    return acc;
                  }, new Map<string, { planetName: string; designName: string; hullName: string; noseArmor: number; entries: { days: number; status: "building" | "queued" | "waiting" }[] }>());

                  return [...byPlanetDesign.values()]
                    .toSorted((a, b) => a.planetName.localeCompare(b.planetName) || a.designName.localeCompare(b.designName))
                    .map(({ planetName, designName, hullName, noseArmor, entries }) => (
                      <TableRow key={`${planetName}||${designName}`}>
                        <TableCell>{planetName}</TableCell>
                        <TableCell className="font-medium">{designName}</TableCell>
                        <TableCell>{hullName}</TableCell>
                        <TableCell className="text-right">{noseArmor > 0 ? noseArmor : "-"}</TableCell>
                        <TableCell className="text-right">{entries.length}</TableCell>
                        <TableCell>
                          {entries
                            .toSorted((a, b) => a.days - b.days)
                            .map((e, i) => (
                              <Fragment key={i}>
                                {i > 0 && ", "}
                                {e.status === "waiting" ? (
                                  <span title="Waiting for materials">⚠️{e.days.toFixed(0)}</span>
                                ) : e.status === "queued" ? (
                                  <span className="text-muted-foreground" title="Queued">({e.days.toFixed(0)})</span>
                                ) : (
                                  e.days.toFixed(0)
                                )}
                              </Fragment>
                            ))}
                        </TableCell>
                      </TableRow>
                    ));
                })()}
              </TableBody>
            </Table>
          )}
        </AccordionContent>
      </AccordionItem>
    </SmartAccordion>
  );
}

// ── Tree-nav section components ──────────────────────────────────────────────

function AlienFleetsSection({ analysis }: { analysis: Analysis }) {
  const alienFleets = analysis.alienFleetsToPlayerOrbits;
  if (alienFleets.length === 0) {
    return <div className="p-4 text-muted-foreground">No alien fleets detected heading to player orbits.</div>;
  }
  return (
    <div className="space-y-2">
      <p>Tracking planets: {analysis.playerInterestedPlanets.map((p) => p.displayName).join(", ")}</p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fleet Name</TableHead>
            <TableHead>Planet</TableHead>
            <TableHead>Target Orbit</TableHead>
            <TableHead>Arrival Date</TableHead>
            <TableHead className="text-right">Days to Arrival</TableHead>
            <TableHead className="text-right">MC Used</TableHead>
            <TableHead className="text-right">Marine CP</TableHead>
            <TableHead className="text-right">Total Mass</TableHead>
            <TableHead className="text-right">Max Ship Mass</TableHead>
            <TableHead>Ships Hulls</TableHead>
            <TableHead>Ships Roles</TableHead>
            <TableHead>Operation</TableHead>
            <TableHead>Operation Complete</TableHead>
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
              <TableCell className="text-right">{(fleet.totalMass / 1000000).toFixed(0)} Mkg</TableCell>
              <TableCell className="text-right">{(fleet.maxShipMass / 1000000).toFixed(0)} Mkg</TableCell>
              <TableCell className="whitespace-normal">
                {fleet.shipsByHullType.length > 0
                  ? fleet.shipsByHullType
                      .map((ship) => {
                        const name = `${ship.count} ${ship.hullName.replace("Alien ", "")}${ship.count > 1 ? "s" : ""}`;
                        return ship.avgNoseArmor > 0 ? `${name} (${ship.avgNoseArmor})` : name;
                      })
                      .join(" + ")
                  : "-"}
              </TableCell>
              <TableCell className="whitespace-normal">
                {fleet.shipsByRole.length > 0
                  ? fleet.shipsByRole.map((ship) => `${ship.count} ${ship.role}${ship.count > 1 ? "s" : ""}`).join(" + ")
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

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Planetary Defense Summary</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Planet</TableHead>
              <TableHead className="text-right">Days to Arrival</TableHead>
              <TableHead className="text-right">Alien Fleet MC</TableHead>
              <TableHead className="text-right">Player Fleet MC</TableHead>
              <TableHead>Habs (Active / Potential Combat)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(() => {
              const planetsWithFleets = new Set(alienFleets.map((f) => f.planetName || "Unknown"));
              const defenseData = Array.from(planetsWithFleets)
                .map((planet) => {
                  const fleetsAtPlanet = alienFleets.filter((f) => f.planetName === planet);
                  const totalAlienMC = fleetsAtPlanet.reduce((sum, f) => sum + (f.totalMC || 0), 0);
                  const incomingFleets = fleetsAtPlanet.filter((f) => f.daysToTarget !== null && f.daysToTarget > 0);
                  const daysToArrival = incomingFleets.length > 0 ? Math.min(...incomingFleets.map((f) => f.daysToTarget!)) : null;
                  const playerFleetsAtPlanet = analysis.playerFleets.filter((f) => f.planetName === planet);
                  const relevantPlayerFleets = playerFleetsAtPlanet.filter((f) => {
                    if (f.daysToTarget === null || f.daysToTarget <= 0) return true;
                    if (daysToArrival === null) return false;
                    return f.daysToTarget < daysToArrival;
                  });
                  const totalPlayerMC = relevantPlayerFleets.reduce((sum, f) => sum + (f.totalMC || 0), 0);
                  const habsAtPlanet = analysis.playerHabs.filter((h) => h.planetName === planet);
                  return { planet, totalAlienMC, totalPlayerMC, daysToArrival, habs: habsAtPlanet };
                })
                .filter((d) => d.habs.length > 0)
                .toSorted((a, b) => {
                  if (a.daysToArrival === null && b.daysToArrival === null) return 0;
                  if (a.daysToArrival === null) return 1;
                  if (b.daysToArrival === null) return -1;
                  return a.daysToArrival - b.daysToArrival;
                });
              return defenseData.map(({ planet, totalAlienMC, totalPlayerMC, daysToArrival, habs }) => (
                <TableRow key={planet}>
                  <TableCell className="font-medium">{planet}</TableCell>
                  <TableCell className="text-right">{daysToArrival !== null ? daysToArrival.toFixed(0) : "—"}</TableCell>
                  <TableCell className="text-right">{totalAlienMC.toFixed(0)}</TableCell>
                  <TableCell className="text-right">{totalPlayerMC.toFixed(0)}</TableCell>
                  <TableCell>
                    <TooltipProvider>
                      <div className="flex gap-2 flex-wrap">
                        {habs
                          .toSorted((a, b) => {
                            if (a.habType === "Station" && b.habType !== "Station") return -1;
                            if (a.habType !== "Station" && b.habType === "Station") return 1;
                            return 0;
                          })
                          .map((hab) => {
                            const activeCombat = hab.activeEffects.combatScore || 0;
                            const potentialCombat = hab.potentialEffects.combatScore || 0;
                            const combatDisplay =
                              activeCombat === potentialCombat
                                ? activeCombat.toFixed(0)
                                : `${activeCombat.toFixed(0)} / ${potentialCombat.toFixed(0)}`;
                            const bgColor = hab.habType === "Station" ? "bg-yellow-100" : "bg-green-100";
                            return (
                              <Tooltip key={hab.id}>
                                <TooltipTrigger asChild>
                                  <span className={`cursor-help ${bgColor} px-1.5 py-0.5 rounded`}>
                                    {combatDisplay}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <div>{hab.displayName}</div>
                                </TooltipContent>
                              </Tooltip>
                            );
                          })}
                      </div>
                    </TooltipProvider>
                  </TableCell>
                </TableRow>
              ));
            })()}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function HumanEnemyFleetsSection({ analysis }: { analysis: Analysis }) {
  const humanEnemyFleets = analysis.humanEnemyFleetsToPlayerOrbits;
  if (humanEnemyFleets.length === 0) {
    return (
      <div className="p-4 text-muted-foreground">No other human faction fleets detected heading to player orbits.</div>
    );
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Faction</TableHead>
          <TableHead>Fleet Name</TableHead>
          <TableHead>Planet</TableHead>
          <TableHead>Target Orbit</TableHead>
          <TableHead>Arrival Date</TableHead>
          <TableHead className="text-right">Days to Arrival</TableHead>
          <TableHead className="text-right">MC Used</TableHead>
          <TableHead className="text-right">Marine CP</TableHead>
          <TableHead className="text-right">Total Mass</TableHead>
          <TableHead className="text-right">Max Ship Mass</TableHead>
          <TableHead>Ship Hulls</TableHead>
          <TableHead>Ship Roles</TableHead>
          <TableHead>Operation</TableHead>
          <TableHead>Operation Complete</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {humanEnemyFleets.map((fleet) => {
          const FactionIcon = fleet.factionTemplateName
            ? FactionIcons[fleet.factionTemplateName as keyof typeof FactionIcons]
            : null;
          return (
            <TableRow key={fleet.id} className={twMerge(fleet.deltaV === 0 ? "bg-gray-500/5" : "")}>
              <TableCell>
                <div className="flex items-center gap-1">
                  {FactionIcon && <FactionIcon className="p-1 rounded" />}
                  <span className="text-sm">{fleet.factionDisplayName ?? fleet.factionTemplateName ?? "Unknown"}</span>
                </div>
              </TableCell>
              <TableCell className="font-medium">{fleet.displayName}</TableCell>
              <TableCell>{fleet.planetName}</TableCell>
              <TableCell>{fleet.targetOrbitName}</TableCell>
              <TableCell>{fleet.arrivalTimeFormatted || "-"}</TableCell>
              <TableCell className="text-right">
                {fleet.daysToTarget !== null ? `${fleet.daysToTarget.toFixed(0)}` : "—"}
              </TableCell>
              <TableCell className="text-right">{fleet.totalMC.toFixed(0)}</TableCell>
              <TableCell className="text-right">{fleet.marineCombatPower > 0 ? fleet.marineCombatPower : "—"}</TableCell>
              <TableCell className="text-right">{(fleet.totalMass / 1000000).toFixed(0)} Mkg</TableCell>
              <TableCell className="text-right">{(fleet.maxShipMass / 1000000).toFixed(0)} Mkg</TableCell>
              <TableCell className="whitespace-normal">
                {fleet.shipsByHullType.length > 0
                  ? fleet.shipsByHullType
                      .map((ship) => {
                        const name = `${ship.count} ${ship.hullName}${ship.count > 1 ? "s" : ""}`;
                        return ship.avgNoseArmor > 0 ? `${name} (${ship.avgNoseArmor})` : name;
                      })
                      .join(" + ")
                  : "-"}
              </TableCell>
              <TableCell className="whitespace-normal">
                {fleet.shipsByRole.length > 0
                  ? fleet.shipsByRole.map((s) => `${s.count} ${s.role}${s.count > 1 ? "s" : ""}`).join(" + ")
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
          );
        })}
      </TableBody>
    </Table>
  );
}

function PlayerFleetsSection({ analysis }: { analysis: Analysis }) {
  const playerFleets = analysis.playerFleets;
  if (playerFleets.length === 0) {
    return <div className="p-4 text-muted-foreground">No player fleets found.</div>;
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Fleet Name</TableHead>
          <TableHead>Planet</TableHead>
          <TableHead>Target Orbit</TableHead>
          <TableHead>Arrival Date</TableHead>
          <TableHead className="text-right">Days to Arrival</TableHead>
          <TableHead className="text-right">MC Used</TableHead>
          <TableHead className="text-right">Marine CP</TableHead>
          <TableHead className="text-right">Total Mass</TableHead>
          <TableHead className="text-right">Max Ship Mass</TableHead>
          <TableHead>Ship Hulls</TableHead>
          <TableHead>Ship Classes</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {playerFleets.map((fleet) => (
          <TableRow key={fleet.id}>
            <TableCell className="font-medium">{fleet.displayName}</TableCell>
            <TableCell>{fleet.planetName}</TableCell>
            <TableCell>{fleet.targetOrbitName}</TableCell>
            <TableCell>{fleet.arrivalTimeFormatted || "-"}</TableCell>
            <TableCell className="text-right">
              {fleet.daysToTarget !== null ? `${fleet.daysToTarget.toFixed(0)}` : "—"}
            </TableCell>
            <TableCell className="text-right">{fleet.totalMC.toFixed(0)}</TableCell>
            <TableCell className="text-right">{fleet.marineCombatPower > 0 ? fleet.marineCombatPower : "—"}</TableCell>
            <TableCell className="text-right">{(fleet.totalMass / 1000000).toFixed(0)} Mkg</TableCell>
            <TableCell className="text-right">{(fleet.maxShipMass / 1000000).toFixed(0)} Mkg</TableCell>
            <TableCell className="whitespace-normal">
              {fleet.shipsByHullType.length > 0
                ? fleet.shipsByHullType.map((ship, i) => (
                    <Fragment key={ship.hullName}>
                      {i > 0 && <br />}
                      {ship.count} {ship.hullName}
                      {ship.count > 1 ? "s" : ""}
                    </Fragment>
                  ))
                : "-"}
            </TableCell>
            <TableCell className="whitespace-normal">
              {fleet.shipsByClass.length > 0
                ? fleet.shipsByClass.map((cls, i) => (
                    <Fragment key={cls.className}>
                      {i > 0 && <br />}
                      {cls.count}× {cls.className}
                      {cls.noseArmor > 0 ? ` (${cls.noseArmor})` : ""}
                    </Fragment>
                  ))
                : "-"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function ShipsUnderConstructionSection({ analysis }: { analysis: Analysis }) {
  const shipsUnderConstruction = analysis.playerShipsUnderConstruction;
  if (shipsUnderConstruction.length === 0) {
    return <div className="p-4 text-muted-foreground">No ships under construction.</div>;
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Planet</TableHead>
          <TableHead>Design</TableHead>
          <TableHead>Hull</TableHead>
          <TableHead className="text-right">Nose Armor</TableHead>
          <TableHead className="text-right">Count</TableHead>
          <TableHead>Days to Complete</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {(() => {
          const byPlanetDesign = shipsUnderConstruction.reduce((acc, ship) => {
            const key = `${ship.planetName}||${ship.designName}`;
            if (!acc.has(key))
              acc.set(key, {
                planetName: ship.planetName,
                designName: ship.designName,
                hullName: ship.hullName,
                noseArmor: ship.noseArmor,
                entries: [] as { days: number; status: "building" | "queued" | "waiting" }[],
              });
            acc.get(key)!.entries.push({ days: ship.daysToCompletion, status: ship.status });
            return acc;
          }, new Map<string, { planetName: string; designName: string; hullName: string; noseArmor: number; entries: { days: number; status: "building" | "queued" | "waiting" }[] }>());

          return [...byPlanetDesign.values()]
            .toSorted((a, b) => a.planetName.localeCompare(b.planetName) || a.designName.localeCompare(b.designName))
            .map(({ planetName, designName, hullName, noseArmor, entries }) => (
              <TableRow key={`${planetName}||${designName}`}>
                <TableCell>{planetName}</TableCell>
                <TableCell className="font-medium">{designName}</TableCell>
                <TableCell>{hullName}</TableCell>
                <TableCell className="text-right">{noseArmor > 0 ? noseArmor : "-"}</TableCell>
                <TableCell className="text-right">{entries.length}</TableCell>
                <TableCell>
                  {entries
                    .toSorted((a, b) => a.days - b.days)
                    .map((e, i) => (
                      <Fragment key={i}>
                        {i > 0 && ", "}
                        {e.status === "waiting" ? (
                          <span title="Waiting for materials">⚠️{e.days.toFixed(0)}</span>
                        ) : e.status === "queued" ? (
                          <span className="text-muted-foreground" title="Queued">
                            ({e.days.toFixed(0)})
                          </span>
                        ) : (
                          e.days.toFixed(0)
                        )}
                      </Fragment>
                    ))}
                </TableCell>
              </TableRow>
            ));
        })()}
      </TableBody>
    </Table>
  );
}

export function getFleetsSections(analysis: Analysis) {
  const alienFleets = analysis.alienFleetsToPlayerOrbits;
  const humanEnemyFleets = analysis.humanEnemyFleetsToPlayerOrbits;
  const playerFleets = analysis.playerFleets;
  const shipsUnderConstruction = analysis.playerShipsUnderConstruction;

  const incomingAlien = alienFleets.filter((f) => f.deltaV > 0 && (f.daysToTarget || 0) > 0);
  const subtitle =
    incomingAlien.length > 0
      ? `${incomingAlien.length} alien fleet(s) incoming`
      : alienFleets.length > 0
        ? `${alienFleets.length} alien fleet(s) tracked`
        : undefined;

  return {
    group: {
      id: "fleets",
      label: "Fleets",
      subtitle,
      leaves: [
        { id: "fleets.alien-fleets", label: `Alien Fleets (${alienFleets.length})` },
        { id: "fleets.human-enemy-fleets", label: `Other Human Factions (${humanEnemyFleets.length})` },
        { id: "fleets.player-fleets", label: `Player Fleets (${playerFleets.length})` },
        { id: "fleets.ships-under-construction", label: `Ships Under Construction (${shipsUnderConstruction.length})` },
      ],
    },
    contents: new Map([
      ["fleets.alien-fleets", <AlienFleetsSection key="alien" analysis={analysis} />],
      ["fleets.human-enemy-fleets", <HumanEnemyFleetsSection key="human-enemy" analysis={analysis} />],
      ["fleets.player-fleets", <PlayerFleetsSection key="player" analysis={analysis} />],
      ["fleets.ships-under-construction", <ShipsUnderConstructionSection key="ships" analysis={analysis} />],
    ]),
  };
}
