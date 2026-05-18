"use client";

import { Analysis } from "@/lib/analysis";
import { SmartAccordion } from "@/components/ui/smart-accordion";
import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FactionIcons } from "@/components/icons";
import { twMerge } from "tailwind-merge";

export function FleetsSection({ analysis, section }: { analysis: Analysis; section?: string }) {
  const alienFleets = analysis.alienFleetsToPlayerOrbits;
  const humanEnemyFleets = analysis.humanEnemyFleetsToPlayerOrbits;
  const playerFleets = analysis.playerFleets;
  const shipsUnderConstruction = analysis.playerShipsUnderConstruction;

  return (
    <SmartAccordion type="multiple" storageKey="fleetsSections" defaultValue={["alien-fleets", "human-enemy-fleets", "player-fleets", "ships-under-construction"]}>
      {section !== "alien" && section !== "human" && section !== "player" && section !== "construction" && (
        <>
          <SectionAlien alienFleets={alienFleets} analysis={analysis} />
          <SectionHuman humanEnemyFleets={humanEnemyFleets} />
          <SectionPlayer playerFleets={playerFleets} />
          <SectionConstruction shipsUnderConstruction={shipsUnderConstruction} />
        </>
      )}
      {section === "alien" && <SectionAlien alienFleets={alienFleets} analysis={analysis} />}
      {section === "human" && <SectionHuman humanEnemyFleets={humanEnemyFleets} />}
      {section === "player" && <SectionPlayer playerFleets={playerFleets} />}
      {section === "construction" && <SectionConstruction shipsUnderConstruction={shipsUnderConstruction} />}
    </SmartAccordion>
  );
}

function SectionAlien({ alienFleets, analysis }: { alienFleets: any[]; analysis: Analysis }) {
  return (
    <AccordionItem value="alien-fleets">
      <AccordionTrigger>Alien Fleets ({alienFleets.length})</AccordionTrigger>
      <AccordionContent>
        {alienFleets.length === 0 ? (
          <div className="p-4 text-muted-foreground">No alien fleets detected heading to player orbits.</div>
        ) : (
          <div className="space-y-2">
            <p>Tracking planets: {analysis.playerInterestedPlanets.map((p: any) => p.displayName).join(", ")}</p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fleet Name</TableHead><TableHead>Planet</TableHead><TableHead>Target Orbit</TableHead>
                  <TableHead>Arrival Date</TableHead>
                  <TableHead className="text-right">Days to Arrival</TableHead>
                  <TableHead className="text-right">MC Used</TableHead>
                  <TableHead className="text-right">Marine CP</TableHead>
                  <TableHead className="text-right">Total Mass</TableHead>
                  <TableHead className="text-right">Max Ship Mass</TableHead>
                  <TableHead>Ships Hulls</TableHead><TableHead>Ships Roles</TableHead>
                  <TableHead>Operation</TableHead><TableHead>Operation Complete</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alienFleets.map((fleet: any) => (
                  <TableRow key={fleet.id} className={twMerge(fleet.deltaV === 0 ? "bg-gray-500/5" : "")}>
                    <TableCell className="font-medium">{fleet.displayName}</TableCell>
                    <TableCell>{fleet.planetName}</TableCell>
                    <TableCell>{fleet.targetOrbitName}</TableCell>
                    <TableCell>{fleet.arrivalTimeFormatted || "-"}</TableCell>
                    <TableCell className="text-right">{fleet.daysToTarget !== null ? `${fleet.daysToTarget.toFixed(0)}` : "—"}</TableCell>
                    <TableCell className="text-right">{fleet.totalMC.toFixed(0)}</TableCell>
                    <TableCell className="text-right">{fleet.marineCombatPower > 0 ? fleet.marineCombatPower : "—"}</TableCell>
                    <TableCell className="text-right">{(fleet.totalMass / 1000000).toFixed(0)} Mkg</TableCell>
                    <TableCell className="text-right">{(fleet.maxShipMass / 1000000).toFixed(0)} Mkg</TableCell>
                    <TableCell className="whitespace-normal">{fleet.shipsByHullType.length > 0 ? fleet.shipsByHullType.map((ship: any) => `${ship.count} ${ship.hullName.replace("Alien ", "")}${ship.count > 1 ? "s" : ""}${ship.avgNoseArmor > 0 ? ` (${ship.avgNoseArmor})` : ""}`).join(" + ") : "-"}</TableCell>
                    <TableCell className="whitespace-normal">{fleet.shipsByRole.length > 0 ? fleet.shipsByRole.map((ship: any) => `${ship.count} ${ship.role}${ship.count > 1 ? "s" : ""}`).join(" + ") : "-"}</TableCell>
                    <TableCell>{fleet.operation || "-"}</TableCell>
                    <TableCell>{fleet.operationComplete ? `${fleet.operationComplete}${fleet.operationCompleteDays !== null ? ` (${fleet.operationCompleteDays.toFixed(0)}d)` : ""}` : "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}

function SectionHuman({ humanEnemyFleets }: { humanEnemyFleets: any[] }) {
  return (
    <AccordionItem value="human-enemy-fleets">
      <AccordionTrigger>Other Human Factions ({humanEnemyFleets.length})</AccordionTrigger>
      <AccordionContent>
        {humanEnemyFleets.length === 0 ? (
          <div className="p-4 text-muted-foreground">No other human faction fleets detected heading to player orbits.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Faction</TableHead><TableHead>Fleet Name</TableHead><TableHead>Planet</TableHead>
                <TableHead>Target Orbit</TableHead><TableHead>Arrival Date</TableHead>
                <TableHead className="text-right">Days to Arrival</TableHead>
                <TableHead className="text-right">MC Used</TableHead>
                <TableHead className="text-right">Marine CP</TableHead>
                <TableHead className="text-right">Total Mass</TableHead>
                <TableHead className="text-right">Max Ship Mass</TableHead>
                <TableHead>Ship Hulls</TableHead><TableHead>Ship Roles</TableHead>
                <TableHead>Operation</TableHead><TableHead>Operation Complete</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {humanEnemyFleets.map((fleet: any) => {
                const FactionIcon = fleet.factionTemplateName ? FactionIcons[fleet.factionTemplateName as keyof typeof FactionIcons] : null;
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
                    <TableCell className="text-right">{fleet.daysToTarget !== null ? `${fleet.daysToTarget.toFixed(0)}` : "—"}</TableCell>
                    <TableCell className="text-right">{fleet.totalMC.toFixed(0)}</TableCell>
                    <TableCell className="text-right">{fleet.marineCombatPower > 0 ? fleet.marineCombatPower : "—"}</TableCell>
                    <TableCell className="text-right">{(fleet.totalMass / 1000000).toFixed(0)} Mkg</TableCell>
                    <TableCell className="text-right">{(fleet.maxShipMass / 1000000).toFixed(0)} Mkg</TableCell>
                    <TableCell className="whitespace-normal">{fleet.shipsByHullType.length > 0 ? fleet.shipsByHullType.map((ship: any) => `${ship.count} ${ship.hullName}${ship.count > 1 ? "s" : ""}${ship.avgNoseArmor > 0 ? ` (${ship.avgNoseArmor})` : ""}`).join(" + ") : "-"}</TableCell>
                    <TableCell className="whitespace-normal">{fleet.shipsByRole.length > 0 ? fleet.shipsByRole.map((s: any) => `${s.count} ${s.role}${s.count > 1 ? "s" : ""}`).join(" + ") : "-"}</TableCell>
                    <TableCell>{fleet.operation || "-"}</TableCell>
                    <TableCell>{fleet.operationComplete ? `${fleet.operationComplete}${fleet.operationCompleteDays !== null ? ` (${fleet.operationCompleteDays.toFixed(0)}d)` : ""}` : "-"}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}

function SectionPlayer({ playerFleets }: { playerFleets: any[] }) {
  return (
    <AccordionItem value="player-fleets">
      <AccordionTrigger>Player Fleets ({playerFleets.length})</AccordionTrigger>
      <AccordionContent>
        {playerFleets.length === 0 ? (
          <div className="p-4 text-muted-foreground">No player fleets found.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fleet Name</TableHead><TableHead>Planet</TableHead><TableHead>Target Orbit</TableHead>
                <TableHead>Arrival Date</TableHead>
                <TableHead className="text-right">Days to Arrival</TableHead>
                <TableHead className="text-right">MC Used</TableHead>
                <TableHead className="text-right">Marine CP</TableHead>
                <TableHead className="text-right">Total Mass</TableHead>
                <TableHead className="text-right">Max Ship Mass</TableHead>
                <TableHead>Ship Hulls</TableHead><TableHead>Ship Classes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {playerFleets.map((fleet: any) => (
                <TableRow key={fleet.id}>
                  <TableCell className="font-medium">{fleet.displayName}</TableCell>
                  <TableCell>{fleet.planetName}</TableCell>
                  <TableCell>{fleet.targetOrbitName}</TableCell>
                  <TableCell>{fleet.arrivalTimeFormatted || "-"}</TableCell>
                  <TableCell className="text-right">{fleet.daysToTarget !== null ? `${fleet.daysToTarget.toFixed(0)}` : "—"}</TableCell>
                  <TableCell className="text-right">{fleet.totalMC.toFixed(0)}</TableCell>
                  <TableCell className="text-right">{fleet.marineCombatPower > 0 ? fleet.marineCombatPower : "—"}</TableCell>
                  <TableCell className="text-right">{(fleet.totalMass / 1000000).toFixed(0)} Mkg</TableCell>
                  <TableCell className="text-right">{(fleet.maxShipMass / 1000000).toFixed(0)} Mkg</TableCell>
                  <TableCell className="whitespace-normal">{fleet.shipsByHullType.length > 0 ? fleet.shipsByHullType.map((ship: any, i: number) => <span key={ship.hullName}>{i > 0 && <br />}{ship.count} {ship.hullName}{ship.count > 1 ? "s" : ""}</span>).join("") : "-"}</TableCell>
                  <TableCell className="whitespace-normal">{fleet.shipsByClass.length > 0 ? fleet.shipsByClass.map((cls: any, i: number) => <span key={cls.className}>{i > 0 && <br />}{cls.count}× {cls.className}{cls.noseArmor > 0 ? ` (${cls.noseArmor})` : ""}</span>).join("") : "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}

function SectionConstruction({ shipsUnderConstruction }: { shipsUnderConstruction: any[] }) {
  const byPlanetDesign = shipsUnderConstruction.reduce((acc: any, ship: any) => {
    const key = `${ship.planetName}||${ship.designName}`;
    if (!acc.has(key)) acc.set(key, { planetName: ship.planetName, designName: ship.designName, hullName: ship.hullName, noseArmor: ship.noseArmor, entries: [] });
    acc.get(key)!.entries.push({ days: ship.daysToCompletion, status: ship.status });
    return acc;
  }, new Map());

  return (
    <AccordionItem value="ships-under-construction">
      <AccordionTrigger>Ships Under Construction ({shipsUnderConstruction.length})</AccordionTrigger>
      <AccordionContent>
        {shipsUnderConstruction.length === 0 ? (
          <div className="p-4 text-muted-foreground">No ships under construction.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow><TableHead>Planet</TableHead><TableHead>Design</TableHead><TableHead>Hull</TableHead><TableHead className="text-right">Nose Armor</TableHead><TableHead className="text-right">Count</TableHead><TableHead>Days to Complete</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {[...byPlanetDesign.values()].toSorted((a: any, b: any) => a.planetName.localeCompare(b.planetName) || a.designName.localeCompare(b.designName)).map(({ planetName, designName, hullName, noseArmor, entries }: any) => (
                <TableRow key={`${planetName}||${designName}`}>
                  <TableCell>{planetName}</TableCell>
                  <TableCell className="font-medium">{designName}</TableCell>
                  <TableCell>{hullName}</TableCell>
                  <TableCell className="text-right">{noseArmor > 0 ? noseArmor : "-"}</TableCell>
                  <TableCell className="text-right">{entries.length}</TableCell>
                  <TableCell>{entries.toSorted((a: any, b: any) => a.days - b.days).map((e: any, i: number) => <span key={i}>{i > 0 && ", "}{e.status === "waiting" ? `⚠️${e.days.toFixed(0)}` : e.status === "queued" ? `(${e.days.toFixed(0)})` : e.days.toFixed(0)}</span>)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}
