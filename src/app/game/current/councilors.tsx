"use client";

import { useState, useEffect } from "react";
import { combineEffects, ShowEffects, ShowEffectsProps } from "@/components/showEffects";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SmartAccordion } from "@/components/ui/smart-accordion";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Analysis } from "@/lib/analysis";
import { MissionDataName } from "@/lib/template-types-generated";
import { defaultScoringWeights, loadWeightsFromStorage, ScoringWeights, ScoringWeightsDialog } from "./scoringWeights";
import { scoreAndSort, getBaseCouncilorScore, getModifiedCouncilorScore, getOrganizationScore, orgTransferFactor, ScoreResult } from "./councilor-scoring";
import { CouncilorTableHeader, CouncilorTableRow, OrgTableHeader, OrgTableRow } from "./councilor-table";
import { Administration, MissionIcons, UnknownIcon } from "@/components/icons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SmartTabs } from "@/components/ui/smart-tabs";

export function getCouncilorsUi(analysis: Analysis) {
  const { playerMissionCounts } = analysis;
  const [weights, setWeights] = useState<ScoringWeights>(defaultScoringWeights);

  useEffect(() => {
    setWeights(loadWeightsFromStorage());
  }, []);

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
    analysis.playerAvailableOrgs
      .map((i) => ({ type: "available", ...i }))
      .concat(analysis.playerUnassignedOrgs.map((i) => ({ type: "unassigned", ...i }))),
    weights,
    playerMissionCounts,
    getOrganizationScore,
    "noMissionScore" // ignore missions when sorting orgs
  ).toSorted((a, b) => (a.isAdminOrg === b.isAdminOrg ? 0 : a.isAdminOrg ? -1 : 1)); // admin orgs first
  const usedOrgs = analysis.playerCouncilors.flatMap((councilor) =>
    councilor.orgs.map((o) => ({ ...o, type: "used", councilor: councilor.displayName, councilorId: councilor.id }))
  );
  const scoredUsedOrgs = scoreAndSort(usedOrgs, weights, playerMissionCounts, getOrganizationScore);
  const scoredOwnedOrgs = scoreAndSort(
    analysis.playerUnassignedOrgs.map((i) => ({ type: "unassigned", ...i })).concat(usedOrgs),
    weights,
    playerMissionCounts,
    getOrganizationScore
  );

  const bestAvailableCouncilor = scoredAvailableCouncilors[0]?.score.value;
  const worstExistingCouncilor = scoredBaseCouncilors[scoredBaseCouncilors.length - 1]?.score.value;
  const bestAvailableOrg = scoredOrgs[0]?.score.value;
  const worstExistingOrg = scoredUsedOrgs[scoredUsedOrgs.length - 1]?.score.value;

  return {
    key: "councilors",
    tab: (
      <>
        Councilors ({worstExistingCouncilor?.toFixed(0)} vs. {bestAvailableCouncilor?.toFixed(0)}) / Orgs (
        {worstExistingOrg?.toFixed(2)} vs {bestAvailableOrg?.toFixed(2)})
      </>
    ),
    content: (
      <CouncilorsComponent
        {...{
          analysis,
          weights,
          setWeights,
          scoredModifiedCouncilors,
          scoredAvailableCouncilors,
          scoredBaseCouncilors,
          scoredOrgs,
          scoredUsedOrgs,
          scoredOwnedOrgs,
        }}
      />
    ),
  };
}

function CouncilorsComponent({
  analysis,
  weights,
  setWeights,
  scoredModifiedCouncilors,
  scoredAvailableCouncilors,
  scoredBaseCouncilors,
  scoredOrgs,
  scoredOwnedOrgs,
}: {
  analysis: Analysis;
  weights: ScoringWeights;
  setWeights: (weights: ScoringWeights) => void;
  scoredModifiedCouncilors: (Analysis["playerCouncilors"][number] & { score: ScoreResult })[];
  scoredAvailableCouncilors: (Analysis["playerAvailableCouncilors"][number] & { score: ScoreResult })[];
  scoredBaseCouncilors: (Analysis["playerCouncilors"][number] & { score: ScoreResult })[];
  scoredOrgs: (Analysis["playerAvailableOrgs"][number] & { type: string; score: ScoreResult })[];
  scoredOwnedOrgs: (Analysis["playerAvailableOrgs"][number] & {
    type: string;
    score: ScoreResult;
    councilor?: string;
    councilorId?: number;
  })[];
}) {
  const {
    playerMissionCounts,
    playerVisibleCouncilors,
    playerCouncilors,
    playerAvailableOrgs,
    playerUnassignedOrgs,
    playerFaction,
    playerStealableOrgs,
    factionsById,
  } = analysis;
  const scoredStealableOrgs = scoreAndSort(
    analysis.playerStealableOrgs.map((i) => ({ type: "stealable", ...i })),
    weights,
    playerMissionCounts,
    getOrganizationScore,
    "noMissionScore"
  );

  function currentHighlightMissionClassName(missionName: MissionDataName) {
    // if we have exactly 2, show yellow BG, if we have 1, show red, otherwise no change to bg
    const count = playerMissionCounts.get(missionName) || 0;
    if (count === 2) {
      return "bg-yellow-300/50";
    } else if (count === 1) {
      return "bg-red-300/50";
    }
  }
  function availableHighlightMissionClassName(missionName: MissionDataName) {
    // if we have 1, show yellow BG, if we have 0, show green, otherwise no change to bg
    const count = playerMissionCounts.get(missionName) || 0;
    if (count === 1) {
      return "bg-yellow-300/50";
    } else if (count === 0) {
      return "bg-green-300/50";
    }
  }
  const playerNationIds = new Set(analysis.playerNationIds);
  const playerTraits = new Set(analysis.playerCouncilors.flatMap((i) => i.traitTemplateNames));
  const unusedAdmin = analysis.playerCouncilors
    .map(
      (c) =>
        Math.min(
          25,
          Math.max(
            0,
            (c.effectsWithOrgsAndAugments.Administration || 0) + (c.effectsWithOrgsAndAugments.administration || 0)
          )
        ) - c.orgs.reduce((a, b) => a + b.tier, 0)
    )
    .reduce((a, b) => a + b, 0);

  const stealableOrgsByFaction = scoredStealableOrgs.reduce((acc, org) => {
    const key = org.faction?.id || 0;
    if (!acc.has(key)) {
      acc.set(key, []);
    }
    acc.get(key)!.push(org);
    return acc;
  }, new Map<number, typeof scoredStealableOrgs>());

  type MissionSource =
    | {
        type: "councilor";
        councilor: Analysis["playerCouncilors"][number];
        factionId: number | undefined;
        missions: MissionDataName[];
      }
    | {
        type: "org";
        org: Analysis["playerAvailableOrgs"][number];
        factionId: number | undefined;
        missions: MissionDataName[];
      };

  const sourcesByFactionByMission = [...playerCouncilors, ...playerVisibleCouncilors]
    .map(
      (i) =>
        ({
          type: "councilor",
          councilor: i,
          factionId: i.factionId,
          missions: i.effectsWithOrgsAndAugments.missionsGrantedNames || [],
        } as MissionSource)
    )
    .concat(
      [...playerAvailableOrgs, ...playerUnassignedOrgs].map((i) => ({
        type: "org",
        org: i,
        factionId: playerFaction?.id,
        missions: i.template?.missionsGrantedNames || [],
      }))
    )
    .concat(
      playerStealableOrgs.map((i) => ({
        type: "org",
        org: i,
        factionId: i.faction?.id,
        missions: i.template?.missionsGrantedNames || [],
      }))
    )
    .reduce((acc, o) => {
      const key = o.factionId || 0;
      if (!acc.has(key)) {
        acc.set(key, new Map<string, MissionSource[]>());
      }
      const effectsMap = acc.get(key)!;
      o.missions.forEach((m) => {
        if (!effectsMap.has(m)) {
          effectsMap.set(m, []);
        }
        effectsMap.get(m)!.push(o);
      });
      return acc;
    }, new Map<number, Map<string, MissionSource[]>>());
  const factions = Array.from(sourcesByFactionByMission.keys())
    .map((factionId) => factionsById.get(factionId)!)
    .filter((f) => f)
    .toSorted((a, b) => {
      if (a.id === playerFaction.id) return -1;
      if (b.id === playerFaction.id) return 1;
      return (a.displayName || "").localeCompare(b.displayName || "");
    });

  const importantMissions = ["Assassinate"];

  const councilEffects = scoredModifiedCouncilors.reduce((acc, councilor) => {
    return combineEffects(acc, councilor.effectsWithOrgsAndAugments);
  }, {} as ShowEffectsProps);

  // TODO: would be cool to click an effect icon and sort everything by that (ie. click persuasion icon to see who/org gives most persuasion)
  return (
    <div className="space-y-2">
      <SmartAccordion type="single" collapsible storageKey="councilorsSections" defaultValue="existing">
        <AccordionItem value="existing">
          <AccordionTrigger>
            <span>
              Manage Existing Council ({unusedAdmin.toFixed(0)} <Administration />)
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="py-1">
              <ShowEffects
                incomeBoost_month={councilEffects.incomeBoost_month}
                incomeMoney_month={councilEffects.incomeMoney_month}
                incomeInfluence_month={councilEffects.incomeInfluence_month}
                incomeOps_month={councilEffects.incomeOps_month}
                incomeMissionControl={councilEffects.incomeMissionControl}
                incomeResearch_month={councilEffects.incomeResearch_month}
                projectCapacityGranted={councilEffects.projectCapacityGranted}
              />
              <ShowEffects
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
              />
              <ShowEffects
                councilorTechBonus={councilEffects.councilorTechBonus}
                techBonuses={councilEffects.techBonuses}
              />
            </div>
            <Table>
              <CouncilorTableHeader hasOrgs />
              <TableBody>
                {scoredModifiedCouncilors.map((councilor) => (
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
            <h3 className="mt-1">Available Organizations:</h3>
            <Table>
              <OrgTableHeader />
              <TableBody>
                {scoredOrgs.map((org) => (
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
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="new-councilors">
          <AccordionTrigger>Find New Councilors</AccordionTrigger>
          <AccordionContent>
            <h3>Available Councilors:</h3>
            <Table>
              <CouncilorTableHeader />
              <TableBody>
                {scoredAvailableCouncilors.map((councilor) => (
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

            <h3 className="mt-1">Unmodified Active Councilors:</h3>
            <Table>
              <CouncilorTableHeader />
              <TableBody>
                {scoredBaseCouncilors.map((councilor) => (
                  <CouncilorTableRow
                    key={`${councilor.id}-base`}
                    councilor={councilor}
                    stats={councilor.effectsBaseAndUnaugmentedTraits}
                    label={`${councilor.displayName}`}
                    highlightMissionClassName={currentHighlightMissionClassName}
                  />
                ))}
              </TableBody>
            </Table>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="current-orgs">
          <AccordionTrigger>Current Organizations</AccordionTrigger>
          <AccordionContent>
            <Table>
              <OrgTableHeader costHeader="Councilor" />
              <TableBody>
                {scoredOwnedOrgs.toReversed().map((org) => (
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
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="takeover">
          <AccordionTrigger>Hostile Takeover</AccordionTrigger>
          <AccordionContent>
            <SmartTabs
              storageKey="councilorsTakeoverTabs"
              defaultValue={`faction-${Array.from(stealableOrgsByFaction.keys())[0]}`}
            >
              <TabsList>
                {Array.from(stealableOrgsByFaction.entries()).map(([factionId, orgs]) => (
                  <TabsTrigger key={factionId} value={`faction-${factionId}`}>
                    {orgs[0].faction?.displayName || "Unknown Faction"} ({orgs.length})
                  </TabsTrigger>
                ))}
              </TabsList>
              {Array.from(stealableOrgsByFaction.entries()).map(([factionId, orgs]) => (
                <TabsContent key={factionId} value={`faction-${factionId}`}>
                  <Table>
                    <OrgTableHeader costHeader="Takeover" />
                    <TableBody>
                      {orgs.map((org) => (
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
              ))}
            </SmartTabs>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="missions">
          <AccordionTrigger>Missions</AccordionTrigger>
          <AccordionContent>
            <SmartTabs storageKey="councilorsMissionsTabs" defaultValue={`faction-${factions[0].id}`}>
              <TabsList>
                {factions.map((faction) => (
                  <TabsTrigger key={faction.id} value={`faction-${faction.id}`}>
                    {faction.displayName || "Unknown Faction"} ({sourcesByFactionByMission.get(faction.id)?.size || 0})
                    {importantMissions
                      .filter(
                        (m) =>
                          sourcesByFactionByMission
                            .get(faction.id)
                            ?.get(m)
                            ?.filter((i) => i.type === "councilor")?.length ?? 0 > 0
                      )
                      .map((m) => {
                        const MissionIcon = MissionIcons[m] || UnknownIcon;
                        return (
                          <span key={m} className="inline-block -mt-2">
                            <MissionIcon className="h-4 w-4" />
                          </span>
                        );
                      })}
                  </TabsTrigger>
                ))}
              </TabsList>
              {factions.map((faction) => (
                <TabsContent key={faction.id} value={`faction-${faction.id}`}>
                  <SmartAccordion type="single" collapsible storageKey={`councilorsMissions-${faction.id}`}>
                    {Array.from(
                      new Set([
                        ...importantMissions,
                        ...Array.from(sourcesByFactionByMission.get(faction.id)?.keys() || []),
                      ])
                    ).map((missionName) => {
                      const sources = sourcesByFactionByMission.get(faction.id)?.get(missionName) || [];
                      const MissionIcon = MissionIcons[missionName] || UnknownIcon;
                      return (
                        <AccordionItem key={missionName} value={missionName}>
                          <AccordionTrigger>
                            <span>
                              <MissionIcon /> {missionName} &ndash;{" "}
                              {sources.filter((i) => i.type === "councilor").length} Councilors &lt;-{" "}
                              {sources.filter((i) => i.type === "org").length} Orgs
                            </span>
                          </AccordionTrigger>
                          <AccordionContent>
                            <Table>
                              <OrgTableHeader costHeader="Takeover" />
                              <TableBody>
                                {sources?.map((src) =>
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
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="other-councilors">
          <AccordionTrigger>Other Councilors</AccordionTrigger>
          <AccordionContent>
            <OtherCouncilorsByFaction {...{ analysis, weights }} />
          </AccordionContent>
        </AccordionItem>
      </SmartAccordion>

      <div className="my-4">
        <ScoringWeightsDialog weights={weights} onWeightsChange={setWeights} />
      </div>

      <Collapsible>
        <CollapsibleTrigger asChild>
          <Button variant="outline">Debug Data</Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          {/* <pre>{JSON.stringify(analysis.playerCouncilors, null, 2)}</pre>
          <pre>{JSON.stringify(analysis.playerAvailableCouncilors, null, 2)}</pre>
          <pre>{JSON.stringify(analysis.playerAvailableOrgs, null, 2)}</pre>
          <pre>{JSON.stringify(analysis.playerUnassignedOrgs, null, 2)}</pre> */}
          <pre>{JSON.stringify(analysis.playerFaction, null, 2)}</pre>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

function OtherCouncilorsByFaction({ analysis, weights }: { analysis: Analysis; weights: ScoringWeights }) {
  const { playerVisibleCouncilors, factionsById } = analysis;

  const scoredBaseCouncilors = scoreAndSort(
    playerVisibleCouncilors,
    weights,
    new Map<MissionDataName, number>(),
    getBaseCouncilorScore
  );

  const councilorsByFactionId = scoredBaseCouncilors.reduce((acc, councilor) => {
    const factionId = councilor.factionId || 0;
    if (!factionId) return acc;
    if (!acc.has(factionId)) {
      acc.set(factionId, []);
    }
    acc.get(factionId)!.push(councilor);
    return acc;
  }, new Map<number, Analysis["playerCouncilors"][number][]>());

  const factions = Array.from(councilorsByFactionId.keys())
    .map((i) => factionsById.get(i!)!)
    .filter((i) => i.id !== analysis.alienFaction.id);

  return (
    <Tabs defaultValue={`faction-${factions[0].id}`}>
      <TabsList>
        {factions
          .filter((i) => i.id !== analysis.alienFaction.id)
          .map((faction) => (
            <TabsTrigger key={faction.id} value={`faction-${faction.id}`}>
              {faction.displayName || "Unknown Faction"} ({councilorsByFactionId.get(faction.id)?.length || 0})
            </TabsTrigger>
          ))}
      </TabsList>
      {factions.map((faction) => (
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
