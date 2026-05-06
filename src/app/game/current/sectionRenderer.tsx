"use client";

import { Analysis } from "@/lib/analysis";
import { TreeSectionId } from "./treeNavigation";
import { getCouncilorsUi, CouncilorTableHeader, OrgTableHeader, CouncilorTableRow, OrgTableRow } from "./councilors";
import { getFleetsUi } from "./fleets";
import { getHabsUi } from "./habs";
import { getResourcesUi } from "./resources";
import { getDrivesUi } from "./drives";
import { ShowEffects, ShowEffectsProps } from "@/components/showEffects";
import { combineEffects } from "@/components/showEffects";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SmartAccordion } from "@/components/ui/smart-accordion";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Boost, MissionControl as MCIcon } from "@/components/icons";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { MissionDataName, TraitDataName } from "@/lib/template-types-generated";
import { MinusCircleIcon, PlusCircleIcon } from "lucide-react";
import { Administration, MissionIcons, TraitIcons, UnknownIcon } from "@/components/icons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SmartTabs } from "@/components/ui/smart-tabs";
import { twMerge } from "tailwind-merge";
import { ScoringWeights, ScoringWeightsDialog, loadWeightsFromStorage } from "./scoringWeights";
import { useTechnologyGoals, TechnologyGoalsDialog, TechnologyGoalsList } from "./technologyGoals";
import { ResearchLink } from "./researchLink";
import { smartRound } from "@/lib/utils";
import { useEffect, useState } from "react";

// Re-export section components for use in the tree
export { CouncilorTableHeader, OrgTableHeader, CouncilorTableRow, OrgTableRow };

export function SectionRenderer({ analysis, sectionId }: { analysis: Analysis; sectionId: TreeSectionId }) {
  const { playerMissionCounts } = analysis;

  // Scored data
  const scoredModifiedCouncilors = getCouncilorsUi(analysis);
  const [weights, setWeights] = useState<ScoringWeights>(() => loadWeightsFromStorage());

  // Get scoring data
  const { scoredModifiedCouncilors: smc, scoredAvailableCouncilors: sac, scoredBaseCouncilors: sbc, scoredOrgs: so, scoredUsedOrgs: su, scoredOwnedOrgs: soo } =
    computeScoredData(analysis, weights, playerMissionCounts);

  const scoredStealableOrgs = computeStealableOrgs(analysis, weights, playerMissionCounts);
  const stealableOrgsByFaction = computeStealableByFaction(scoredStealableOrgs);
  const sourcesByFactionByMission = computeMissionSources(analysis);
  const factions = computeFactions(analysis, sourcesByFactionByMission);
  const councilEffects = computeCouncilEffects(smc);
  const playerNationIds = new Set(analysis.playerNationIds);
  const playerTraits = new Set(analysis.playerCouncilors.flatMap((i) => i.traitTemplateNames));
  const unusedAdmin = computeUnusedAdmin(analysis.playerCouncilors);

  const bestAvailableCouncilor = sac[0]?.score.value;
  const worstExistingCouncilor = sbc[sbc.length - 1]?.score.value;
  const bestAvailableOrg = so[0]?.score.value;
  const worstExistingOrg = su[su.length - 1]?.score.value;

  function currentHighlightMissionClassName(missionName: MissionDataName) {
    const count = playerMissionCounts.get(missionName) || 0;
    if (count === 2) return "bg-yellow-300/50";
    if (count === 1) return "bg-red-300/50";
  }

  function availableHighlightMissionClassName(missionName: MissionDataName) {
    const count = playerMissionCounts.get(missionName) || 0;
    if (count === 1) return "bg-yellow-300/50";
    if (count === 0) return "bg-green-300/50";
  }

  switch (sectionId) {
    case "councilors-score":
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border bg-card">
              <h3 className="font-medium mb-2">Councilor Score</h3>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Current (worst)</span>
                <span className="text-lg font-mono">{worstExistingCouncilor?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-muted-foreground">Available (best)</span>
                <span className="text-lg font-mono text-green-600">{bestAvailableCouncilor?.toFixed(2)}</span>
              </div>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <h3 className="font-medium mb-2">Organization Score</h3>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Current (worst)</span>
                <span className="text-lg font-mono">{worstExistingOrg?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-muted-foreground">Available (best)</span>
                <span className="text-lg font-mono text-green-600">{bestAvailableOrg?.toFixed(2)}</span>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-lg border bg-card">
            <h3 className="font-medium mb-2">Current Council Effects</h3>
            <ShowEffects
              incomeBoost_month={councilEffects.incomeBoost_month}
              incomeMoney_month={councilEffects.incomeMoney_month}
              incomeInfluence_month={councilEffects.incomeInfluence_month}
              incomeOps_month={councilEffects.incomeOps_month}
              incomeMissionControl={councilEffects.incomeMissionControl}
              incomeResearch_month={councilEffects.incomeResearch_month}
              projectCapacityGranted={councilEffects.projectCapacityGranted}
              economyBonus={councilEffects.economyBonus}
              welfareBonus={councilEffects.welfareBonus}
              environmentBonus={councilEffects.environmentBonus}
              knowledgeBonus={councilEffects.knowledgeBonus}
              governmentBonus={councilEffects.governmentBonus}
              unityBonus={councilEffects.unityBonus}
              militaryBonus={councilEffects.militaryBonus}
              oppressionBonus={councilEffects.oppressionBonus}
              spoilsBonus={councilEffects.spoilsBonus}
              spaceDevBonus={councilEffects.spaceDevBonus}
              spaceflightBonus={councilEffects.spaceflightBonus}
              MCBonus={councilEffects.MCBonus}
              miningBonus={councilEffects.miningBonus}
              councilorTechBonus={councilEffects.councilorTechBonus}
              techBonuses={councilEffects.techBonuses}
            />
          </div>
          <ScoringWeightsDialog weights={weights} onWeightsChange={setWeights} />
        </div>
      );

    case "councilors-existing":
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="text-foreground">{unusedAdmin.toFixed(0)} <Administration /></span>
          </div>
          <div className="py-1">
            <ShowEffects
              incomeBoost_month={councilEffects.incomeBoost_month}
              incomeMoney_month={councilEffects.incomeMoney_month}
              incomeInfluence_month={councilEffects.incomeInfluence_month}
              incomeOps_month={councilEffects.incomeOps_month}
              incomeMissionControl={councilEffects.incomeMissionControl}
              incomeResearch_month={councilEffects.incomeResearch_month}
              projectCapacityGranted={councilEffects.projectCapacityGranted}
              economyBonus={councilEffects.economyBonus}
              welfareBonus={councilEffects.welfareBonus}
              environmentBonus={councilEffects.environmentBonus}
              knowledgeBonus={councilEffects.knowledgeBonus}
              governmentBonus={councilEffects.governmentBonus}
              unityBonus={councilEffects.unityBonus}
              militaryBonus={councilEffects.militaryBonus}
              oppressionBonus={councilEffects.oppressionBonus}
              spoilsBonus={councilEffects.spoilsBonus}
              spaceDevBonus={councilEffects.spaceDevBonus}
              spaceflightBonus={councilEffects.spaceflightBonus}
              MCBonus={councilEffects.MCBonus}
              miningBonus={councilEffects.miningBonus}
              councilorTechBonus={councilEffects.councilorTechBonus}
              techBonuses={councilEffects.techBonuses}
            />
          </div>
          <Table>
            <CouncilorTableHeader hasOrgs />
            <TableBody>
              {smc.map((councilor) => (
                <CouncilorTableRow
                  key={councilor.id}
                  councilor={councilor}
                  stats={councilor.effectsWithOrgsAndAugments}
                  label={councilor.displayName!}
                  hasOrgs
                  highlightMissionClassName={currentHighlightMissionClassName}
                />
              ))}
            </TableBody>
          </Table>
          <h3 className="mt-4 mb-2">Available Organizations:</h3>
          <Table>
            <OrgTableHeader />
            <TableBody>
              {so.map((org) => (
                <OrgTableRow
                  key={org.id}
                  org={org}
                  playerNationIds={playerNationIds}
                  playerTraits={playerTraits}
                  highlightMissionClassName={availableHighlightMissionClassName}
                />
              ))}
            </TableBody>
          </Table>
          <Collapsible>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="mt-4">Debug Data</Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <pre>{JSON.stringify(analysis.playerFaction, null, 2)}</pre>
            </CollapsibleContent>
          </Collapsible>
        </div>
      );

    case "councilors-new":
      return (
        <div className="space-y-4">
          <h3>Available Councilors:</h3>
          <Table>
            <CouncilorTableHeader />
            <TableBody>
              {sac.map((councilor) => (
                <CouncilorTableRow
                  key={councilor.id}
                  councilor={councilor}
                  stats={councilor.effectsBaseAndUnaugmentedTraits}
                  label={councilor.displayName!}
                  highlightMissionClassName={availableHighlightMissionClassName}
                />
              ))}
            </TableBody>
          </Table>
          <h3 className="mt-4">Unmodified Active Councilors:</h3>
          <Table>
            <CouncilorTableHeader />
            <TableBody>
              {sbc.map((councilor) => (
                <CouncilorTableRow
                  key={`${councilor.id}-base`}
                  councilor={councilor}
                  stats={councilor.effectsBaseAndUnaugmentedTraits}
                  label={councilor.displayName!}
                  highlightMissionClassName={currentHighlightMissionClassName}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      );

    case "councilors-orgs":
      return (
        <div>
          <h3 className="mb-2">Owned Organizations:</h3>
          <Table>
            <OrgTableHeader costHeader="Councilor" />
            <TableBody>
              {soo.toReversed().map((org) => (
                <OrgTableRow
                  key={org.id}
                  org={org}
                  playerNationIds={playerNationIds}
                  playerTraits={playerTraits}
                  highlightMissionClassName={availableHighlightMissionClassName}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      );

    case "councilors-takeover": {
      const initialFaction = stealableOrgsByFaction.keys().next().value;
      return (
        <SmartTabs
          storageKey="councilorsTakeoverTabs"
          defaultValue={initialFaction ? `faction-${initialFaction}` : ""}
        >
          <TabsList>
            {stealableOrgsByFaction.entries().map(([factionId, orgs]: [number, typeof scoredStealableOrgs]) => (
              <TabsTrigger key={factionId} value={`faction-${factionId}`}>
                {orgs[0].faction?.displayName || "Unknown"} ({orgs.length})
              </TabsTrigger>
            ))}
          </TabsList>
          {[...stealableOrgsByFaction.entries()].map((entry: [number, typeof scoredStealableOrgs]) => {
          const [factionId, orgs] = entry;
          return (
            <TabsContent key={factionId} value={`faction-${factionId}`}>
              <Table>
                <OrgTableHeader costHeader="Takeover" />
                <TableBody>
                  {orgs.map((org: typeof scoredStealableOrgs[number]) => (
                    <OrgTableRow
                      key={org.id}
                      org={org}
                      playerNationIds={playerNationIds}
                      playerTraits={playerTraits}
                      highlightMissionClassName={availableHighlightMissionClassName}
                      isTakeover
                    />
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          );
        })}
        </SmartTabs>
      );
    }

    case "councilors-missions": {
      const initialFaction = factions[0]?.id;
      return (
        <SmartTabs storageKey="councilorsMissionsTabs" defaultValue={initialFaction ? `faction-${initialFaction}` : ""}>
          <TabsList>
            {factions.map((faction) => (
              <TabsTrigger key={faction.id} value={`faction-${faction.id}`}>
                {faction.displayName || "Unknown"} ({sourcesByFactionByMission.get(faction.id)?.size || 0})
              </TabsTrigger>
            ))}
          </TabsList>
          {factions.map((faction) => (
            <TabsContent key={faction.id} value={`faction-${faction.id}`}>
              <SmartAccordion type="single" collapsible storageKey={`councilorsMissions-${faction.id}`}>
                {Array.from(new Set(Array.from(sourcesByFactionByMission.get(faction.id)?.keys() || []))).map((missionName) => {
                  const sources = sourcesByFactionByMission.get(faction.id)?.get(missionName) || [];
                  const MissionIcon = MissionIcons[missionName as MissionDataName] || UnknownIcon;
                  return (
                    <AccordionItem key={missionName} value={missionName}>
                      <AccordionTrigger>
                        <span>
                          <MissionIcon /> {missionName} --{" "}
                          {sources.filter((i: any) => i.type === "councilor").length} Councilors &lt;-{" "}
                          {sources.filter((i: any) => i.type === "org").length} Orgs
                        </span>
                      </AccordionTrigger>
                      <AccordionContent>
                        <Table>
                          <OrgTableHeader costHeader="Takeover" />
                          <TableBody>
                            {sources.map((src: any) =>
                              src.type === "org" ? (
                                <OrgTableRow
                                  key={`councilor-${src.org.id}-mission-${missionName}`}
                                  org={src.org}
                                  playerNationIds={playerNationIds}
                                  playerTraits={playerTraits}
                                />
                              ) : (
                                <CouncilorTableRow
                                  key={`org-${src.councilor.id}-mission-${missionName}`}
                                  councilor={src.councilor}
                                  stats={src.councilor.effectsWithOrgsAndAugments}
                                  label={src.councilor.displayName!}
                                />
                              )
                            )}
                          </TableBody>
                        </Table>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </SmartAccordion>
            </TabsContent>
          ))}
        </SmartTabs>
      );
    }

    case "councilors-other": {
      const scoredBaseCouncilors2 = scoreAndSort(
        analysis.playerVisibleCouncilors,
        weights,
        new Map<MissionDataName, number>(),
        getBaseCouncilorScore
      );
      const councilorsByFactionId = scoredBaseCouncilors2.reduce((acc, councilor) => {
        const factionId = councilor.factionId || 0;
        if (!factionId) return acc;
        if (!acc.has(factionId)) acc.set(factionId, []);
        acc.get(factionId)!.push(councilor);
        return acc;
      }, new Map<number, Analysis["playerCouncilors"][number][]>());

      const otherFactions = Array.from(councilorsByFactionId.keys())
        .map((i) => analysis.factionsById.get(i!)!)
        .filter((i) => i.id !== analysis.alienFaction.id);

      return (
        <Tabs defaultValue={`faction-${otherFactions[0]?.id}`}>
          <TabsList>
            {otherFactions.map((faction) => (
              <TabsTrigger key={faction.id} value={`faction-${faction.id}`}>
                {faction.displayName || "Unknown"} ({councilorsByFactionId.get(faction.id)?.length || 0})
              </TabsTrigger>
            ))}
          </TabsList>
          {otherFactions.map((faction) => (
            <TabsContent key={faction.id} value={`faction-${faction.id}`}>
              <Table>
                <CouncilorTableHeader />
                <TableBody>
                  {councilorsByFactionId.get(faction.id)?.map((councilor) => (
                    <CouncilorTableRow
                      key={councilor.id}
                      councilor={councilor}
                      stats={councilor.effectsBaseAndUnaugmentedTraits}
                      label={councilor.displayName!}
                    />
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          ))}
        </Tabs>
      );
    }

    case "fleets-alien": {
      const alienFleets = analysis.alienFleetsToPlayerOrbits;
      return (
        <div className="space-y-2">
          {alienFleets.length === 0 ? (
            <div className="p-4 text-muted-foreground">No alien fleets detected heading to player orbits.</div>
          ) : (
            <>
              <p className="text-sm">Tracking planets: {analysis.playerInterestedPlanets.map((p) => p.displayName).join(", ")}</p>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fleet</TableHead>
                    <TableHead>Planet</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Arrival</TableHead>
                    <TableHead className="text-right">Days</TableHead>
                    <TableHead className="text-right">MC</TableHead>
                    <TableHead>Ships</TableHead>
                    <TableHead>Operation</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {alienFleets.map((fleet) => (
                    <TableRow key={fleet.id} className={twMerge(fleet.deltaV === 0 ? "bg-gray-500/5" : "")}>
                      <TableCell className="font-medium">{fleet.displayName}</TableCell>
                      <TableCell>{fleet.planetName}</TableCell>
                      <TableCell>{fleet.targetOrbitName}</TableCell>
                      <TableCell>{fleet.arrivalTimeFormatted || "-"}</TableCell>
                      <TableCell className="text-right">{fleet.daysToTarget !== null ? `${fleet.daysToTarget.toFixed(0)}` : "—"}</TableCell>
                      <TableCell className="text-right">{fleet.totalMC.toFixed(0)}</TableCell>
                      <TableCell className="whitespace-normal">
                        {fleet.shipsByHullType.length > 0
                          ? fleet.shipsByHullType.map((ship) => `${ship.count} ${ship.hullName.replace("Alien ", "")}${ship.count > 1 ? "s" : ""}`).join(" + ")
                          : "-"}
                      </TableCell>
                      <TableCell>{fleet.operation || "-"}{fleet.operationComplete ? ` (${fleet.operationCompleteDays?.toFixed(0)}d)` : ""}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-8">
                <h3 className="font-bold text-lg mb-4">Planetary Defense Summary</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Planet</TableHead>
                      <TableHead className="text-right">Days</TableHead>
                      <TableHead className="text-right">Alien MC</TableHead>
                      <TableHead className="text-right">Player MC</TableHead>
                      <TableHead>Habs</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...new Set(analysis.alienFleetsToPlayerOrbits.map((f) => f.planetName))]
                      .map((planet) => {
                        const fleetsAtPlanet = analysis.alienFleetsToPlayerOrbits.filter((f) => f.planetName === planet);
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
                      })
                      .map(({ planet, totalAlienMC, totalPlayerMC, daysToArrival, habs }) => (
                        <TableRow key={planet}>
                          <TableCell className="font-medium">{planet}</TableCell>
                          <TableCell className="text-right">{daysToArrival !== null ? daysToArrival.toFixed(0) : "—"}</TableCell>
                          <TableCell className="text-right">{totalAlienMC.toFixed(0)}</TableCell>
                          <TableCell className="text-right">{totalPlayerMC.toFixed(0)}</TableCell>
                          <TableCell>
                            <TooltipProvider>
                              <div className="flex gap-2 flex-wrap">
                                {habs
                                  .toSorted((a, b) => (a.habType === "Station" && b.habType !== "Station" ? -1 : b.habType === "Station" && a.habType !== "Station" ? 1 : 0))
                                  .map((hab) => {
                                    const activeCombat = hab.activeEffects.combatScore || 0;
                                    const potentialCombat = hab.potentialEffects.combatScore || 0;
                                    const combatDisplay = activeCombat === potentialCombat
                                      ? activeCombat.toFixed(0)
                                      : `${activeCombat.toFixed(0)} / ${potentialCombat.toFixed(0)}`;
                                    return (
                                      <Tooltip key={hab.id}>
                                        <TooltipTrigger asChild>
                                          <span className={`cursor-help ${hab.habType === "Station" ? "bg-yellow-100" : "bg-green-100"} px-1.5 py-0.5 rounded`}>
                                            {combatDisplay}
                                          </span>
                                        </TooltipTrigger>
                                        <TooltipContent><div>{hab.displayName}</div></TooltipContent>
                                      </Tooltip>
                                    );
                                  })}
                              </div>
                            </TooltipProvider>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </div>
      );
    }

    case "fleets-human": {
      const humanEnemyFleets = analysis.humanEnemyFleetsToPlayerOrbits;
      return (
        <div>
          {humanEnemyFleets.length === 0 ? (
            <div className="p-4 text-muted-foreground">No other human faction fleets detected.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Faction</TableHead>
                  <TableHead>Fleet</TableHead>
                  <TableHead>Planet</TableHead>
                  <TableHead>Days</TableHead>
                  <TableHead className="text-right">MC</TableHead>
                  <TableHead>Ships</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {humanEnemyFleets.map((fleet) => {
                  const FactionIcon = fleet.factionTemplateName ? getFactionIcon(fleet.factionTemplateName) : null;
                  return (
                    <TableRow key={fleet.id}>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {FactionIcon && <FactionIcon className="p-1 rounded" />}
                          <span className="text-sm">{fleet.factionDisplayName ?? "Unknown"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{fleet.displayName}</TableCell>
                      <TableCell>{fleet.planetName}</TableCell>
                      <TableCell className="text-right">{fleet.daysToTarget !== null ? `${fleet.daysToTarget.toFixed(0)}` : "—"}</TableCell>
                      <TableCell className="text-right">{fleet.totalMC.toFixed(0)}</TableCell>
                      <TableCell className="whitespace-normal">
                        {fleet.shipsByHullType.length > 0
                          ? fleet.shipsByHullType.map((ship) => `${ship.count} ${ship.hullName}${ship.count > 1 ? "s" : ""}`).join(" + ")
                          : "-"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      );
    }

    case "fleets-player": {
      const playerFleets = analysis.playerFleets;
      return (
        <div>
          {playerFleets.length === 0 ? (
            <div className="p-4 text-muted-foreground">No player fleets found.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fleet</TableHead>
                  <TableHead>Planet</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Days</TableHead>
                  <TableHead className="text-right">MC</TableHead>
                  <TableHead>Ships</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {playerFleets.map((fleet) => (
                  <TableRow key={fleet.id}>
                    <TableCell className="font-medium">{fleet.displayName}</TableCell>
                    <TableCell>{fleet.planetName}</TableCell>
                    <TableCell>{fleet.targetOrbitName}</TableCell>
                    <TableCell className="text-right">{fleet.daysToTarget !== null ? `${fleet.daysToTarget.toFixed(0)}` : "—"}</TableCell>
                    <TableCell className="text-right">{fleet.totalMC.toFixed(0)}</TableCell>
                    <TableCell className="whitespace-normal">
                      {fleet.shipsByClass.length > 0
                        ? fleet.shipsByClass.map((cls) => `${cls.count}x ${cls.className}`).join(" + ")
                        : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      );
    }

    case "fleets-construction": {
      const shipsUnderConstruction = analysis.playerShipsUnderConstruction;
      return (
        <div>
          {shipsUnderConstruction.length === 0 ? (
            <div className="p-4 text-muted-foreground">No ships under construction.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Planet</TableHead>
                  <TableHead>Design</TableHead>
                  <TableHead>Hull</TableHead>
                  <TableHead className="text-right">Armor</TableHead>
                  <TableHead className="text-right">Count</TableHead>
                  <TableHead>Days</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...shipsUnderConstruction.reduce((acc: Map<string, { planetName: string; designName: string; hullName: string; noseArmor: number; entries: { days: number; status: string }[] }>, ship: { planetName: string; designName: string; hullName: string; noseArmor: number; daysToCompletion: number; status: string }) => {
                  const key = `${ship.planetName}||${ship.designName}`;
                  if (!acc.has(key)) acc.set(key, { planetName: ship.planetName, designName: ship.designName, hullName: ship.hullName, noseArmor: ship.noseArmor, entries: [] });
                  acc.get(key)!.entries.push({ days: ship.daysToCompletion, status: ship.status });
                  return acc;
                }, new Map()).values()]
                  .toSorted((a: { planetName: string; designName: string }, b: { planetName: string; designName: string }) => a.planetName.localeCompare(b.planetName) || a.designName.localeCompare(b.designName))
                  .map(({ planetName, designName, hullName, noseArmor, entries }: { planetName: string; designName: string; hullName: string; noseArmor: number; entries: { days: number; status: string }[] }) => (
                    <TableRow key={`${planetName}||${designName}`}>
                      <TableCell>{planetName}</TableCell>
                      <TableCell className="font-medium">{designName}</TableCell>
                      <TableCell>{hullName}</TableCell>
                      <TableCell className="text-right">{noseArmor > 0 ? noseArmor : "-"}</TableCell>
                      <TableCell className="text-right">{entries.length}</TableCell>
                      <TableCell>
                        {entries.toSorted((a: { days: number }, b: { days: number }) => a.days - b.days).map((e: { days: number; status: string }, i: number) => (
                          <span key={i}>
                            {i > 0 && ", "}
                            {e.status === "waiting" ? `⚠${e.days.toFixed(0)}` : e.status === "queued" ? `(${e.days.toFixed(0)})` : e.days.toFixed(0)}
                          </span>
                        ))}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          )}
        </div>
      );
    }

    case "habs-current-bonuses": {
      const activeEffects = analysis.playerHabs.reduce<ShowEffectsProps>((acc, hab) => combineEffects(acc, hab.activeEffects), {});
      return (
        <div className="p-4 rounded-lg border bg-card">
          <h3 className="font-medium mb-3">Current Hab Bonuses ({analysis.playerHabs.length} habs)</h3>
          <ShowHabScienceEffects effects={activeEffects} />
        </div>
      );
    }

    case "habs-future-bonuses": {
      const potentialEffects = analysis.playerHabs.reduce<ShowEffectsProps>((acc, hab) => combineEffects(acc, hab.potentialEffects), {});
      return (
        <div className="p-4 rounded-lg border bg-card">
          <h3 className="font-medium mb-3">Future Hab Bonuses (including unpowered/under construction)</h3>
          <ShowHabScienceEffects effects={potentialEffects} />
        </div>
      );
    }

    case "habs-boost-mc":
      return (
        <div className="space-y-2">
          <div className="flex space-x-6 pb-4">
            <span>
              <Boost /> {analysis.playerFaction.nationHistory.currentBoost.toFixed(2)}
              {analysis.playerFaction.nationHistory.boostMonthlyChange !== 0 && (
                <span className={analysis.playerFaction.nationHistory.boostMonthlyChange > 0 ? "text-green-600" : "text-red-600"}>
                  {" "}({analysis.playerFaction.nationHistory.boostMonthlyChange > 0 ? "+" : ""}{analysis.playerFaction.nationHistory.boostMonthlyChange.toFixed(2)})
                </span>
              )}
            </span>
            <span>
              <MCIcon /> {analysis.playerFaction.nationHistory.currentMC.toFixed(0)}
              {analysis.playerFaction.nationHistory.mcMonthlyChange !== 0 && (
                <span className={analysis.playerFaction.nationHistory.mcMonthlyChange > 0 ? "text-green-600" : "text-red-600"}>
                  {" "}({analysis.playerFaction.nationHistory.mcMonthlyChange > 0 ? "+" : ""}{analysis.playerFaction.nationHistory.mcMonthlyChange.toFixed(0)})
                </span>
              )}
            </span>
          </div>
        </div>
      );

    case "habs-alien-hate":
      return (
        <div className="space-y-2">
          <div>
            <strong>Current Alien Strategy:</strong>{" "}
            {analysis.alienFaction.defaultPriorityPresetTemplateName || "Unknown"}
          </div>
          <div>
            <strong>Active Goals (Top 10 of {analysis.expandedAlienGoals.length}):</strong>
            <AlienGoalList goals={analysis.expandedAlienGoals.slice(0, 10)} />
            {analysis.expandedAlienGoals.length > 10 && (
              <div className="text-sm text-blue-500 ml-4">+{analysis.expandedAlienGoals.length - 10} more goals</div>
            )}
          </div>
          <div>
            <strong>Alien Hate of Player:</strong>{" "}
            {analysis.alienFaction.factionHate?.get(analysis.playerFaction.id)?.toFixed(1) ?? "Unknown"}
          </div>
          <div>
            <strong>Assessed Alien Hate of Player:</strong>{" "}
            {analysis.playerFaction.assessedAlienHateOfMe?.toFixed(1) ?? "Unknown"}
          </div>
        </div>
      );

    case "habs-buildings":
      return (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Building</TableHead>
              <TableHead className="text-right">Current</TableHead>
              <TableHead className="text-right">Future</TableHead>
              <TableHead>Current Bonuses</TableHead>
              <TableHead>Future Bonuses</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {analysis.buildingSummary.map((building) => (
              <TableRow key={building.templateName}>
                <TableCell>{building.friendlyName}</TableCell>
                <TableCell className="text-right">{building.currentCount}</TableCell>
                <TableCell className="text-right">{building.futureCount}</TableCell>
                <TableCell><ShowHabScienceEffects effects={building.currentEffects} /></TableCell>
                <TableCell><ShowHabScienceEffects effects={building.futureEffects} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      );

    case "habs-projects":
      return (
        <div className="space-y-4">
          {analysis.playerFaction.availableBoostProjects.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">Boost Projects</h3>
              <ul className="list-disc ml-6 space-y-1">
                {analysis.playerFaction.availableBoostProjects
                  .toSorted((a, b) => a.researchCost - b.researchCost)
                  .map((project, ix) => (
                    <li key={ix}><ResearchLink name={project.dataName} displayName={project.friendlyName} /> ({project.researchCost})</li>
                  ))}
              </ul>
            </div>
          )}
          {analysis.playerFaction.availableCPProjects.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">Control Point Projects</h3>
              <ul className="list-disc ml-6 space-y-1">
                {analysis.playerFaction.availableCPProjects
                  .toSorted((a, b) => {
                    const aRemaining = a.researchCost - a.currentProgress;
                    const bRemaining = b.researchCost - b.currentProgress;
                    const aEff = aRemaining > 0 ? a.cpBonus / aRemaining : 0;
                    const bEff = bRemaining > 0 ? b.cpBonus / bRemaining : 0;
                    return bEff - aEff;
                  })
                  .map((project, ix) => (
                    <li key={ix}><ResearchLink name={project.dataName} displayName={project.friendlyName} /> ({project.currentProgress.toFixed(0)}/{project.researchCost}, +{project.cpBonus} CP)</li>
                  ))}
              </ul>
            </div>
          )}
          {analysis.playerFaction.availableMaxOrgProjects.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">Max Org Projects</h3>
              <ul className="list-disc ml-6 space-y-1">
                {analysis.playerFaction.availableMaxOrgProjects
                  .toSorted((a, b) => a.researchCost - b.researchCost)
                  .map((project, ix) => (
                    <li key={ix}><ResearchLink name={project.dataName} displayName={project.friendlyName} /> ({project.researchCost})</li>
                  ))}
              </ul>
            </div>
          )}
          {analysis.playerFaction.availableExpandNationProjects.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">Expand Nations</h3>
              <ul className="list-disc ml-6 space-y-1">
                {analysis.playerFaction.availableExpandNationProjects
                  .toSorted((a, b) => (a.researchCost - a.currentProgress) - (b.researchCost - b.currentProgress))
                  .map((project, ix) => (
                    <li key={ix}><ResearchLink name={project.dataName} displayName={project.friendlyName} /> ({project.currentProgress.toFixed(0)}/{project.researchCost}, {project.requiresNation})</li>
                  ))}
              </ul>
            </div>
          )}
          {analysis.playerStealableProjects.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">Stealable Projects</h3>
              <ul className="list-disc ml-6 space-y-1">
                {analysis.playerStealableProjects.map(({ projectName, factionId }, ix) => {
                  const faction = analysis.factionsById.get(factionId);
                  if (!faction) return null;
                  const project = analysis.projects.get(projectName);
                  if (!project) return null;
                  return <li key={ix}>{faction.displayName} <ResearchLink name={projectName} displayName={project.displayName!} /> ({project.researchCost})</li>;
                })}
              </ul>
            </div>
          )}
        </div>
      );

    case "habs-tech-goals": {
      const { goals: techGoals, addGoal, removeGoal } = useTechnologyGoals(analysis);
      return (
        <div className="space-y-4">
          <TechnologyGoalsDialog analysis={analysis} goals={techGoals} onAdd={addGoal} onRemove={removeGoal} />
          <ResearchLink displayName="Tech Tree" />
          <TechnologyGoalsList analysis={analysis} goals={techGoals} onRemove={removeGoal} />
        </div>
      );
    }

    case "habs-habs": {
      const time = analysis.gameCurrentDateTimeFormatted?.split(" ")[0] || "";
      const habsWithoutSolar = analysis.playerHabs.filter((hab) => hab.hasSolar && !hab.solarMultiplier)
        .toSorted((a, b) => a.finderSortOverride - b.finderSortOverride);
      return (
        <div className="space-y-4">
          {habsWithoutSolar.length > 0 && (
            <div>
              <h3 className="font-medium mb-1 text-red-600">Habs without Solar Power Multiplier</h3>
              <ul className="list-disc ml-6 text-sm space-y-0.5">
                {habsWithoutSolar.map((hab) => (
                  <li key={hab.id}>{hab.displayName} - site/orbit: {hab.habSiteId || hab.orbitStateId}</li>
                ))}
              </ul>
            </div>
          )}
           <Table>
            <HabScienceHeader />
            <TableBody>
              {(() => {
                const time = analysis.gameCurrentDateTimeFormatted?.split(" ")[0] || "";
                return analysis.playerHabs.map((hab) => (
                  <HabScienceTableRow hab={hab} key={hab.id} time={time} />
                ));
              })()}
            </TableBody>
          </Table>
        </div>
      );
    }

    case "habs-mines": {
      const activeMineSummary = analysis.playerHabs
        .filter((h) => h.site)
        .reduce((acc, hab) => {
          const e = hab.currentMineEffects;
          if (e.water_month || e.volatiles_month || e.metals_month || e.nobles_month || e.fissiles_month) {
            acc.count++;
            acc.water_month += e.water_month;
            acc.volatiles_month += e.volatiles_month;
            acc.metals_month += e.metals_month;
            acc.nobles_month += e.nobles_month;
            acc.fissiles_month += e.fissiles_month;
          }
          return acc;
        }, { count: 0, water_month: 0, volatiles_month: 0, metals_month: 0, nobles_month: 0, fissiles_month: 0 });

      const mineSummary = analysis.playerHabs
        .filter((h) => h.site)
        .reduce((acc, hab) => {
          const e = hab.bestMineEffects;
          acc.count++;
          acc.water_month += e.water_month;
          acc.volatiles_month += e.volatiles_month;
          acc.metals_month += e.metals_month;
          acc.nobles_month += e.nobles_month;
          acc.fissiles_month += e.fissiles_month;
          return acc;
        }, { count: 0, water_month: 0, volatiles_month: 0, metals_month: 0, nobles_month: 0, fissiles_month: 0 });

      return (
        <div className="space-y-4">
          <div className="flex gap-4 text-sm">
            <span>{((analysis.playerFaction.miningMultipliers.water - 1) * 100).toFixed(0)}% water</span>
            <span>{((analysis.playerFaction.miningMultipliers.volatiles - 1) * 100).toFixed(0)}% volatiles</span>
            <span>{((analysis.playerFaction.miningMultipliers.metals - 1) * 100).toFixed(0)}% metals</span>
            <span>{((analysis.playerFaction.miningMultipliers.nobles - 1) * 100).toFixed(0)}% nobles</span>
            <span>{((analysis.playerFaction.miningMultipliers.fissiles - 1) * 100).toFixed(0)}% fissiles</span>
          </div>
          <div className="p-3 rounded border bg-card text-sm">
            <span>{activeMineSummary.count} active mines</span>
            <span className="ml-2"><ShowHabMineEffects effects={activeMineSummary} /></span>
          </div>
          <div className="p-3 rounded border bg-card text-sm">
            <span>{mineSummary.count} potential mines</span>
            <span className="ml-2"><ShowHabMineEffects effects={mineSummary} /></span>
          </div>
          <Table>
            <HabMineHeader />
            <TableBody>
              {(() => {
                const mineTime = analysis.gameCurrentDateTimeFormatted?.split(" ")[0] || "";
                return analysis.playerHabs.filter((h) => h.habType === "Base").map((hab) => (
                  <HabMineTableRow hab={hab} key={hab.id} time={mineTime} />
                ));
              })()}
            </TableBody>
          </Table>
        </div>
      );
    }

    case "resources-transactions": {
      const bySourceByResource = analysis.playerFaction.monthlyTransactionSummary.reduce((acc, curr) => {
        if (!acc.has(curr.source)) acc.set(curr.source, new Map<string, { amount: number; transactions: { date: string; amount: number }[] }>());
        const resourceMap = acc.get(curr.source)!;
        const existing = resourceMap.get(curr.resource) || { amount: 0, transactions: [] as { date: string; amount: number }[] };
        existing.amount += curr.amount;
        if (curr.transactions?.length) existing.transactions.push(...curr.transactions);
        resourceMap.set(curr.resource, existing);
        return acc;
      }, new Map<string, Map<string, { amount: number; transactions: { date: string; amount: number }[] }>>());

      const byResource = analysis.playerFaction.monthlyTransactionSummary.reduce((acc, curr) => {
        acc.set(curr.resource, (acc.get(curr.resource) || 0) + curr.amount);
        return acc;
      }, new Map<string, number>());

      const resources = ["Money", "Influence", "Operations", "Research", "Boost", "Water", "Volatiles", "Metals", "NobleMetals", "Fissiles", "Antimatter", "Exotics"];

      return (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Source</TableHead>
              {resources.map((r) => <TableHead key={r}>{r}</TableHead>)}
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...bySourceByResource.entries()].map(([source, resourceMap]) => (
              <TableRow key={source}>
                <TableCell>{source}</TableCell>
                {resources.map((resource) => {
                  const data = resourceMap.get(resource);
                  return <TableCell key={resource}>{data ? smartRound(data.amount) : ""}</TableCell>;
                })}
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell>Total</TableCell>
              {resources.map((resource) => (
                <TableCell key={resource}>{smartRound(byResource.get(resource) || 0)}</TableCell>
              ))}
            </TableRow>
          </TableFooter>
        </Table>
      );
    }

    case "resources-owned": {
      const ownedNations = analysis.nations
        .filter((i) => i.controlPoints.some((cp) => cp.factionId === analysis.playerFaction.id))
        .toSorted((a, b) => a.totalSpoilsPerCpCost < b.totalSpoilsPerCpCost ? 1 : -1);
      return (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nation</TableHead>
              <TableHead>CP</TableHead>
              <TableHead>Spoils</TableHead>
              <TableHead>Spoils/CP</TableHead>
              <TableHead>MC/Boost</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ownedNations.map((nation) => (
              <TableRow key={nation.id}>
                <TableCell>{nation.displayName}</TableCell>
                <TableCell>{nation.controlPoints.length ? <span className="text-green-600">{nation.controlPoints.length}</span> : "-"}</TableCell>
                <TableCell>{nation.totalSpoils.toFixed(0)}</TableCell>
                <TableCell>{nation.totalSpoilsPerCpCost.toFixed(2)}</TableCell>
                <TableCell>{nation.mc.toFixed(0)} MC / {nation.boostPerMonth.toFixed(2)} Boost</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      );
    }

    case "resources-spoils": {
      return (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nation</TableHead>
              <TableHead>CP</TableHead>
              <TableHead>Unrest</TableHead>
              <TableHead>Spoils</TableHead>
              <TableHead>Spoils/CP</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {analysis.nations
              .toSorted((a, b) => a.totalSpoilsPerCpCost < b.totalSpoilsPerCpCost ? 1 : -1)
              .map((nation) => (
                <TableRow key={nation.id}>
                  <TableCell>{nation.displayName}</TableCell>
                  <TableCell>{smartRound(nation.totalCpCost)}</TableCell>
                  <TableCell>{nation.unrest.toFixed(2)}</TableCell>
                  <TableCell>{nation.totalSpoils.toFixed(0)}</TableCell>
                  <TableCell>{nation.totalSpoilsPerCpCost.toFixed(2)}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      );
    }

    case "resources-mcboost": {
      return (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nation</TableHead>
              <TableHead>CP</TableHead>
              <TableHead>Boost/CP</TableHead>
              <TableHead>MC/CP</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {analysis.nations
              .toSorted((a, b) => b.possibleBoostPerCpCost - a.possibleBoostPerCpCost)
              .map((nation) => (
                <TableRow key={nation.id}>
                  <TableCell>{nation.displayName}</TableCell>
                  <TableCell>{smartRound(nation.totalCpCost)}</TableCell>
                  <TableCell>{nation.boostPerMonthPerCpCost.toFixed(2)}</TableCell>
                  <TableCell>{nation.mcPerCpCost.toFixed(2)}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      );
    }

    case "resources-claims": {
      if (analysis.nationClaims.length === 0) {
        return <p className="text-sm text-muted-foreground">No claims found.</p>;
      }
      return (
        <SmartAccordion type="multiple" storageKey="nation-claims-accordion">
          {analysis.nationClaims.map((entry) => (
            <AccordionItem key={entry.nationId} value={String(entry.nationId)}>
              <AccordionTrigger>
                {entry.nationName} <span className="text-xs text-muted-foreground">({entry.targets.length} targets)</span>
              </AccordionTrigger>
              <AccordionContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Target</TableHead>
                      <TableHead>Relation</TableHead>
                      <TableHead>Executive</TableHead>
                      <TableHead>All Regions?</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entry.targets.map((target) => (
                      <TableRow key={target.targetNationId}>
                        <TableCell>{target.targetNationName}</TableCell>
                        <TableCell>{target.relationship}</TableCell>
                        <TableCell>{target.executiveFactionName || "Uncontrolled"}</TableCell>
                        <TableCell>{target.currentRegionCoverage.missing === 0 ? "Covered" : `${target.currentRegionCoverage.missing}/${target.currentRegionCoverage.totalRegions}`}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </AccordionContent>
            </AccordionItem>
          ))}
        </SmartAccordion>
      );
    }

    case "resources-unification": {
      if (analysis.unificationCandidates.length === 0) {
        return <div className="p-4 text-muted-foreground">No unification candidates.</div>;
      }
      return (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Claimant</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Relation</TableHead>
              <TableHead>Gov</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {analysis.unificationCandidates.map((c) => (
              <TableRow key={`${c.claimantNationId}:${c.targetNationId}`}>
                <TableCell className="font-medium">{c.claimantNationName}</TableCell>
                <TableCell>{c.targetNationName}</TableCell>
                <TableCell>{c.isHostileClaim ? "Hostile" : "Non-hostile"}</TableCell>
                <TableCell>{c.relationship}</TableCell>
                <TableCell>{c.claimantDemocracy} / {c.targetDemocracy}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      );
    }

    case "drives-systems":
      return getDrivesUi(analysis).content;

    case "drives-calculator":
      return getDrivesUi(analysis).content;

    default:
      return <div className="p-4 text-muted-foreground">Section not found: {sectionId}</div>;
  }
}

// Helper components
function ShowHabScienceEffects({ effects }: { effects: ShowEffectsProps }) {
  return (
    <ShowEffects
      incomeBoost_month={effects.incomeBoost_month}
      incomeInfluence_month={effects.incomeInfluence_month}
      incomeMissionControl={effects.incomeMissionControl}
      incomeMoney_month={effects.incomeMoney_month}
      incomeOps_month={effects.incomeOps_month}
      incomeResearch_month={effects.incomeResearch_month}
      projectCapacityGranted={effects.projectCapacityGranted}
      economyBonus={effects.economyBonus}
      welfareBonus={effects.welfareBonus}
      environmentBonus={effects.environmentBonus}
      knowledgeBonus={effects.knowledgeBonus}
      governmentBonus={effects.governmentBonus}
      unityBonus={effects.unityBonus}
      militaryBonus={effects.militaryBonus}
      oppressionBonus={effects.oppressionBonus}
      spoilsBonus={effects.spoilsBonus}
      spaceDevBonus={effects.spaceDevBonus}
      spaceflightBonus={effects.spaceflightBonus}
      MCBonus={effects.MCBonus}
      miningBonus={effects.miningBonus}
      techBonuses={effects.techBonuses}
      controlPoints={effects.controlPoints}
      miltechBonus={effects.miltechBonus}
      alienDetection={effects.alienDetection}
      humanDetection={effects.humanDetection}
      publicCampaignStrength={effects.publicCampaignStrength}
    />
  );
}

function ShowHabMineEffects({ effects }: { effects: { water_month?: number; volatiles_month?: number; metals_month?: number; nobles_month?: number; fissiles_month?: number } }) {
  return (
    <ShowEffects
      water={effects.water_month}
      volatiles={effects.volatiles_month}
      metals={effects.metals_month}
      nobles={effects.nobles_month}
      fissiles={effects.fissiles_month}
    />
  );
}

function HabScienceHeader() {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>Name</TableHead>
        <TableHead>Combat</TableHead>
        <TableHead>Upcoming</TableHead>
        <TableHead>Alerts</TableHead>
        <TableHead>Power</TableHead>
        <TableHead>Bonuses</TableHead>
      </TableRow>
    </TableHeader>
  );
}

function HabScienceTableRow({ hab }: { hab: Analysis["playerHabs"][0]; time: string }) {
  return (
    <TableRow key={hab.id}>
      <TableCell>{hab.displayName}</TableCell>
      <TableCell><ShowEffects combatScore={hab.activeEffects.combatScore} /></TableCell>
      <TableCell className="whitespace-normal">
        {hab.highlightedCompletions.map((hc, ix) => (
          <span key={ix}>{ix > 0 && ", "}{hc.displayName} in {hc.daysToCompletion?.toFixed(0)}d</span>
        ))}
      </TableCell>
      <TableCell>
        {hab.emptyModuleCount > 0 && <span>{hab.emptyModuleCount} empty</span>}
        {hab.missingMine && <span className="bg-yellow-300 text-black px-1 rounded">Missing Mine</span>}
        {hab.hasUnnecessaryFactory && <span className="text-red-600">!</span>}
      </TableCell>
      <TableCell>{hab.futurePower?.toFixed(0)}</TableCell>
      <TableCell><ShowHabScienceEffects effects={hab.activeEffects} /></TableCell>
    </TableRow>
  );
}

function HabMineHeader() {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>Name</TableHead>
        <TableHead>Combat</TableHead>
        <TableHead>Upcoming</TableHead>
        <TableHead>Alerts</TableHead>
        <TableHead>Income</TableHead>
        <TableHead>Best</TableHead>
      </TableRow>
    </TableHeader>
  );
}

function HabMineTableRow({ hab }: { hab: Analysis["playerHabs"][0]; time: string }) {
  return (
    <TableRow key={hab.id}>
      <TableCell>{hab.displayName}</TableCell>
      <TableCell><ShowEffects combatScore={hab.activeEffects.combatScore} /></TableCell>
      <TableCell className="whitespace-normal">
        {hab.highlightedCompletions.map((hc, ix) => (
          <span key={ix}>{ix > 0 && ", "}{hc.templateName} in {hc.daysToCompletion?.toFixed(0)}d</span>
        ))}
      </TableCell>
      <TableCell>
        {hab.emptyModuleCount > 0 && <span>{hab.emptyModuleCount} empty</span>}
        {hab.missingMine && <span className="bg-yellow-300 text-black px-1 rounded">Missing Mine</span>}
      </TableCell>
      <TableCell><ShowHabMineEffects effects={hab.currentMinePoweredEffects} /></TableCell>
      <TableCell><ShowHabMineEffects effects={hab.bestMineEffects} /></TableCell>
    </TableRow>
  );
}

function AlienGoalList({ goals }: { goals: Analysis["expandedAlienGoals"] }) {
  return (
    <ul className="ml-4 mt-1 text-sm space-y-0.5">
      {goals.map((goal) => (
        <li key={goal.id}>
          <strong>{goal.type}</strong> ({goal.importance}){goal.nation && `: ${goal.nation.displayName}`}
        </li>
      ))}
    </ul>
  );
}

function getFactionIcon(templateName: string) {
  const { FactionIcons } = require("@/components/icons");
  return FactionIcons[templateName as keyof typeof FactionIcons] || null;
}

// Helper functions for scoring
function computeScoredData(
  analysis: Analysis,
  weights: ScoringWeights,
  playerMissionCounts: Map<MissionDataName, number>
) {
  const scoredModifiedCouncilors = scoreAndSort(
    analysis.playerCouncilors,
    weights,
    playerMissionCounts,
    getModifiedCouncilorScore
  );
  const scoredAvailableCouncilors = scoreAndSort(
    analysis.playerAvailableCouncilors,
    weights,
    playerMissionCounts,
    getBaseCouncilorScore
  );
  const scoredBaseCouncilors = scoreAndSort(
    analysis.playerCouncilors,
    weights,
    playerMissionCounts,
    getBaseCouncilorScore
  );
  const scoredOrgs = scoreAndSort(
    [...analysis.playerAvailableOrgs.map((i) => ({ type: "available" as const, ...i })), ...analysis.playerUnassignedOrgs.map((i) => ({ type: "unassigned" as const, ...i }))],
    weights,
    playerMissionCounts,
    getOrganizationScore,
    "noMissionScore"
  ).toSorted((a, b) => (a.isAdminOrg === b.isAdminOrg ? 0 : a.isAdminOrg ? -1 : 1));
  const usedOrgs = analysis.playerCouncilors.flatMap((c) =>
    c.orgs.map((o) => ({ ...o, type: "used" as const, councilor: c.displayName, councilorId: c.id }))
  );
  const scoredUsedOrgs = scoreAndSort(usedOrgs, weights, playerMissionCounts, getOrganizationScore);
  const scoredOwnedOrgs = scoreAndSort(
    [...analysis.playerUnassignedOrgs.map((i) => ({ type: "unassigned" as const, ...i })), ...usedOrgs],
    weights,
    playerMissionCounts,
    getOrganizationScore
  );
  return { scoredModifiedCouncilors, scoredAvailableCouncilors, scoredBaseCouncilors, scoredOrgs, scoredUsedOrgs, scoredOwnedOrgs };
}

function computeStealableOrgs(analysis: Analysis, weights: ScoringWeights, playerMissionCounts: Map<MissionDataName, number>) {
  return scoreAndSort(
    analysis.playerStealableOrgs.map((i) => ({ type: "stealable" as const, ...i })),
    weights,
    playerMissionCounts,
    getOrganizationScore,
    "noMissionScore"
  );
}

function computeStealableByFaction(scoredStealableOrgs: any) {
  return scoredStealableOrgs.reduce((acc: Map<number, any[]>, org: any) => {
    const key = org.faction?.id || 0;
    if (!acc.has(key)) acc.set(key, []);
    acc.get(key)!.push(org);
    return acc;
  }, new Map());
}

function computeMissionSources(analysis: Analysis) {
  const sourcesByFactionByMission = [
    ...[...analysis.playerCouncilors, ...analysis.playerVisibleCouncilors].map((i) => ({
      type: "councilor" as const,
      councilor: i,
      factionId: i.factionId,
      missions: i.effectsWithOrgsAndAugments.missionsGrantedNames || [],
    })),
    ...[...analysis.playerAvailableOrgs, ...analysis.playerUnassignedOrgs].map((i) => ({
      type: "org" as const,
      org: i,
      factionId: analysis.playerFaction?.id,
      missions: i.template?.missionsGrantedNames || [],
    })),
    ...analysis.playerStealableOrgs.map((i) => ({
      type: "org" as const,
      org: i,
      factionId: i.faction?.id,
      missions: i.template?.missionsGrantedNames || [],
    })),
  ]
    .reduce((acc, o) => {
      const key = o.factionId || 0;
      if (!acc.has(key)) acc.set(key, new Map<string, any[]>());
      const effectsMap = acc.get(key)!;
      o.missions.forEach((m) => {
        if (!effectsMap.has(m)) effectsMap.set(m, []);
        effectsMap.get(m)!.push(o);
      });
      return acc;
    }, new Map<number, Map<string, any[]>>());
  return sourcesByFactionByMission;
}

function computeFactions(analysis: Analysis, sourcesByFactionByMission: Map<number, Map<string, any[]>>) {
  return Array.from(sourcesByFactionByMission.keys())
    .map((factionId) => analysis.factionsById.get(factionId)!)
    .filter((f) => f)
    .toSorted((a, b) => {
      if (a.id === analysis.playerFaction.id) return -1;
      if (b.id === analysis.playerFaction.id) return 1;
      return (a.displayName || "").localeCompare(b.displayName || "");
    });
}

function computeCouncilEffects(smc: any[]) {
  return smc.reduce((acc, c) => combineEffects(acc, c.effectsWithOrgsAndAugments), {} as ShowEffectsProps);
}

function computeUnusedAdmin(councilors: Analysis["playerCouncilors"]) {
  return councilors
    .map((c) =>
      Math.min(25, Math.max(0,
        (c.effectsWithOrgsAndAugments.Administration || 0) + (c.effectsWithOrgsAndAugments.administration || 0)
      )) - c.orgs.reduce((a, b) => a + b.tier, 0)
    )
    .reduce((a, b) => a + b, 0);
}

function scoreAndSort<T>(
  items: T[],
  weights: ScoringWeights,
  haveMissions: Map<MissionDataName, number>,
  scoreFn: (item: T, weights: ScoringWeights, haveMissions: Map<MissionDataName, number>) => { value: number; noMissionScore: number; details: string },
  scoreSort: "value" | "noMissionScore" = "value"
) {
  const scoredItems = items.map((item) => {
    const scoreResult = scoreFn(item, weights, haveMissions);
    return { ...item, score: scoreResult };
  });
  scoredItems.sort((a, b) => b.score[scoreSort] - a.score[scoreSort]);
  return scoredItems as (T & { score: { value: number; noMissionScore: number; details: string } })[];
}

function getBaseCouncilorScore(
  councilor: Analysis["playerCouncilors"][number],
  weights: ScoringWeights,
  haveMissions: Map<MissionDataName, number>
): { value: number; noMissionScore: number; details: string } {
  return getScore(councilor.effectsBaseAndUnaugmentedTraits, weights, haveMissions, true);
}

function getModifiedCouncilorScore(
  councilor: Analysis["playerCouncilors"][number],
  weights: ScoringWeights,
  haveMissions: Map<MissionDataName, number>
): { value: number; noMissionScore: number; details: string } {
  return getScore(councilor.effectsWithOrgsAndAugments, weights, haveMissions, true);
}

const orgTransferFactor = 0.2;

function getOrganizationScore(
  org: any,
  weights: ScoringWeights,
  haveMissions: Map<MissionDataName, number>
): { value: number; noMissionScore: number; details: string } {
  return getScore(
    {
      ...org,
      techBonuses: org.template?.techBonuses,
      missionsGrantedNames: org.template?.missionsGrantedNames || [],
      ...(org.type === "available"
        ? {}
        : {
            costMoney: (org.costMoney || 0) * orgTransferFactor,
            costInfluence: (org.costInfluence || 0) * orgTransferFactor,
            costOps: (org.costOps || 0) * orgTransferFactor,
            costBoost: (org.costBoost || 0) * orgTransferFactor,
          }),
    },
    weights,
    haveMissions
  );
}

function getScore(
  org: ShowEffectsProps,
  weights: ScoringWeights,
  haveMissions: Map<MissionDataName, number>,
  ignoreTier: boolean = false
): { value: number; noMissionScore: number; details: string } {
  let totalScore = 0;
  const details: string[] = [];

  const addScore = (name: string, value: number | undefined, weight: number | undefined, noNegative?: boolean) => {
    let actualValue = value || 0;
    if (noNegative) actualValue = Math.max(0, actualValue);
    const actualWeight = weight ?? 0;
    if (!actualValue || !actualWeight) return;
    const contribution = actualValue * actualWeight;
    totalScore += contribution;
    details.push(`${name}: ${parseFloat(actualValue.toFixed(2))} x ${parseFloat(actualWeight.toFixed(3))} = ${contribution.toFixed(3)}`);
  };

  addScore("persuasion", org.persuasion, weights.persuasion, true);
  addScore("command", org.command, weights.command, true);
  addScore("administration", org.administration, weights.administration, true);
  addScore("science", org.science, weights.science, true);
  addScore("security", org.security, weights.security, true);

  const tier = org.tier || 1;
  let finalScore = totalScore;
  let noMissionScore = totalScore;

  if (tier > 1 && !ignoreTier) {
    const tierFactor = Math.pow(tier, weights.orgTierExponent);
    finalScore = totalScore / tierFactor;
    noMissionScore /= tierFactor;
    details.push(`Subtotal: ${totalScore.toFixed(3)}`);
    details.push(`Divided by ${tierFactor.toFixed(2)} for tier ${tier}: ${finalScore.toFixed(3)}`);
  }

  return { value: finalScore, noMissionScore, details: details.join("\n") };
}
