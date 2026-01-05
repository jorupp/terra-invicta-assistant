"use client";

import { ShowEffects, ShowEffectsProps } from "@/components/showEffects";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Analysis } from "@/lib/analysis";
import { MissionDataName, TechCategory } from "@/lib/template-types-generated";
import { MinusCircleIcon, PlusCircleIcon } from "lucide-react";

function CouncilorTableHeader({ hasOrgs }: { hasOrgs?: boolean }) {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>Name</TableHead>
        <TableHead>Modified Stats</TableHead>
        {hasOrgs && <TableHead>Org Tiers</TableHead>}
        <TableHead>Monthly Effects</TableHead>
        <TableHead>Priorities</TableHead>
        <TableHead>Science</TableHead>
        <TableHead>Missions</TableHead>
      </TableRow>
    </TableHeader>
  );
}

function CouncilorTableRow({
  councilor,
  stats,
  label,
  hasOrgs,
  highlightMissionClassName,
}: {
  councilor: Analysis["playerCouncilors"][number];
  stats: Analysis["playerCouncilors"][number]["effectsWithOrgsAndAugments"];
  label: string;
  hasOrgs?: boolean;
  highlightMissionClassName?: (missionName: string) => string | undefined;
}) {
  return (
    <TableRow key={`${councilor.id}-${label}`}>
      <TableCell>{label}</TableCell>
      <TableCell>
        <ShowEffects
          persuasion={stats.persuasion}
          command={stats.command}
          investigation={stats.investigation}
          espionage={stats.espionage}
          administration={stats.administration}
          science={stats.science}
          security={stats.security}
          Persuasion={stats.Persuasion}
          Command={stats.Command}
          Investigation={stats.Investigation}
          Espionage={stats.Espionage}
          Administration={stats.Administration}
          Science={stats.Science}
          Security={stats.Security}
          ApparentLoyalty={stats.ApparentLoyalty}
          // TODO: is there a case where we should show this?
          // Loyalty={stats.Loyalty}
        />
      </TableCell>
      {hasOrgs && (
        <TableCell>
          <ShowEffects tier={stats.tier} />
        </TableCell>
      )}
      <TableCell>
        <ShowEffects
          incomeBoost_month={stats.incomeBoost_month}
          incomeMoney_month={stats.incomeMoney_month}
          incomeInfluence_month={stats.incomeInfluence_month}
          incomeOps_month={stats.incomeOps_month}
          incomeMissionControl={stats.incomeMissionControl}
          incomeResearch_month={stats.incomeResearch_month}
          projectCapacityGranted={stats.projectCapacityGranted}
        />
      </TableCell>
      <TableCell>
        <ShowEffects
          economyBonus={stats.economyBonus}
          welfareBonus={stats.welfareBonus}
          environmentBonus={stats.environmentBonus}
          knowledgeBonus={stats.knowledgeBonus}
          governmentBonus={stats.governmentBonus}
          unityBonus={stats.unityBonus}
          militaryBonus={stats.militaryBonus}
          oppressionBonus={stats.oppressionBonus}
          spoilsBonus={stats.spoilsBonus}
          spaceDevBonus={stats.spaceDevBonus}
          spaceflightBonus={stats.spaceflightBonus}
          MCBonus={stats.MCBonus}
          miningBonus={stats.miningBonus}
        />
      </TableCell>
      <TableCell>
        <ShowEffects techBonuses={stats.techBonuses} />
      </TableCell>
      <TableCell>
        <ShowEffects
          missionsGrantedNames={stats.missionsGrantedNames}
          highlightMissionClassName={highlightMissionClassName}
        />
      </TableCell>
    </TableRow>
  );
}

export function getCouncilorsUi(analysis: Analysis) {
  return {
    key: "councilors",
    tab: (
      <>
        Councilors ({analysis.playerCouncilors.length}) / Orgs ({analysis.playerUnassignedOrgs.length})
      </>
    ),
    content: <CouncilorsComponent analysis={analysis} />,
  };
}

function CouncilorsComponent({ analysis }: { analysis: Analysis }) {
  const { playerMissionCounts } = analysis;
  function currentHighlightMissionClassName(missionName: string) {
    // if we have exactly 2, show yellow BG, if we have 1, show red, otherwise no change to bg
    const count = playerMissionCounts.get(missionName) || 0;
    if (count === 2) {
      return "bg-yellow-300/50";
    } else if (count === 1) {
      return "bg-red-300/50";
    }
  }
  function availableHighlightMissionClassName(missionName: string) {
    // if we have 1, show yellow BG, if we have 0, show green, otherwise no change to bg
    const count = playerMissionCounts.get(missionName) || 0;
    if (count === 1) {
      return "bg-yellow-300/50";
    } else if (count === 0) {
      return "bg-green-300/50";
    }
  }
  const playerNationIds = new Set(analysis.playerNationIds);
  // TODO: would be cool to click an effect icon and sort everything by that (ie. click persuasion icon to see who/org gives most persuasion)
  return (
    <>
      <Accordion type="single" collapsible defaultValue="councilors">
        <AccordionItem value="councilors">
          <AccordionTrigger>Councilors</AccordionTrigger>
          <AccordionContent>
            <Table>
              <CouncilorTableHeader hasOrgs />
              <TableBody>
                {analysis.playerCouncilors.map((councilor) => (
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
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="available-councilors">
          <AccordionTrigger>Available Councilors</AccordionTrigger>
          <AccordionContent>
            <Table>
              <CouncilorTableHeader />
              <TableBody>
                {analysis.playerAvailableCouncilors.map((councilor) => (
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

            <h3>Unmodified Active Councilors:</h3>
            <Table>
              <CouncilorTableHeader />
              <TableBody>
                {analysis.playerCouncilors.map((councilor) => (
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
        <AccordionItem value="available-organizations">
          <AccordionTrigger>Available Organizations</AccordionTrigger>
          <AccordionContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Org Name</TableHead>
                  <TableHead>Nation</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Purchase</TableHead>
                  <TableHead>Monthly</TableHead>
                  <TableHead>Effects</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analysis.playerAvailableOrgs
                  .map((i) => ({ type: "available", ...i }))
                  .concat(analysis.playerUnassignedOrgs.map((i) => ({ type: "unassigned", ...i })))
                  .map((org) => (
                    <TableRow key={org.id}>
                      <TableCell>{org.displayName}</TableCell>
                      <TableCell>
                        {org.template?.requiresNationality ? (
                          <span className="mr-1" title={org.homeNationName || ""}>
                            {playerNationIds.has(org.homeNationId || -1) ? (
                              <PlusCircleIcon className="inline h-4 w-4 -mt-1" />
                            ) : (
                              <MinusCircleIcon className="inline h-4 w-4 stroke-destructive -mt-1" />
                            )}
                          </span>
                        ) : (
                          ""
                        )}
                      </TableCell>
                      <TableCell>
                        <ShowEffects tier={org.tier} />
                      </TableCell>
                      <TableCell>
                        {org.type === "available" ? (
                          <ShowEffects
                            costMoney={org.costMoney || 0}
                            costInfluence={org.costInfluence || 0}
                            costOps={org.costOps || 0}
                            costBoost={org.costBoost || 0}
                          />
                        ) : null}
                      </TableCell>
                      <TableCell>
                        <ShowEffects
                          incomeBoost_month={org.incomeBoost_month}
                          incomeMoney_month={org.incomeMoney_month}
                          incomeInfluence_month={org.incomeInfluence_month}
                          incomeOps_month={org.incomeOps_month}
                          incomeMissionControl={org.incomeMissionControl}
                          incomeResearch_month={org.incomeResearch_month}
                          projectCapacityGranted={org.projectCapacityGranted}
                        />
                      </TableCell>
                      <TableCell>
                        <ShowEffects
                          persuasion={org.persuasion}
                          command={org.command}
                          investigation={org.investigation}
                          espionage={org.espionage}
                          administration={org.administration}
                          science={org.science}
                          security={org.security}
                          economyBonus={org.economyBonus}
                          welfareBonus={org.welfareBonus}
                          environmentBonus={org.environmentBonus}
                          knowledgeBonus={org.knowledgeBonus}
                          governmentBonus={org.governmentBonus}
                          unityBonus={org.unityBonus}
                          militaryBonus={org.militaryBonus}
                          oppressionBonus={org.oppressionBonus}
                          spoilsBonus={org.spoilsBonus}
                          spaceDevBonus={org.spaceDevBonus}
                          spaceflightBonus={org.spaceflightBonus}
                          MCBonus={org.MCBonus}
                          miningBonus={org.miningBonus}
                          techBonuses={org.template?.techBonuses}
                          missionsGrantedNames={org.template?.missionsGrantedNames || []}
                          highlightMissionClassName={availableHighlightMissionClassName}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Collapsible>
        <CollapsibleTrigger asChild>
          <Button>Debug Data</Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <pre>{JSON.stringify(analysis.playerCouncilors, null, 2)}</pre>
          <pre>{JSON.stringify(analysis.playerAvailableCouncilors, null, 2)}</pre>
        </CollapsibleContent>
      </Collapsible>
    </>
  );
}

interface ScoringWeights {
  // Councilor attributes
  persuasion?: number;
  command?: number;
  investigation?: number;
  espionage?: number;
  administration?: number;
  science?: number;
  security?: number;

  // Monthly income/costs
  incomeBoost_month?: number;
  incomeMoney_month?: number;
  incomeInfluence_month?: number;
  incomeOps_month?: number;
  incomeMissionControl?: number;
  incomeResearch_month?: number;
  projectCapacityGranted?: number;

  // Purchase costs (typically negative weights since costs are bad)
  costMoney?: number;
  costInfluence?: number;
  costOps?: number;
  costBoost?: number;

  // Priority bonuses
  economyBonus?: number;
  welfareBonus?: number;
  environmentBonus?: number;
  knowledgeBonus?: number;
  governmentBonus?: number;
  unityBonus?: number;
  militaryBonus?: number;
  oppressionBonus?: number;
  spoilsBonus?: number;
  spaceDevBonus?: number;
  spaceflightBonus?: number;
  MCBonus?: number;
  miningBonus?: number;

  // Tech bonuses (weight per tech category)
  techBonuses?: Record<TechCategory, number>;

  // Missions (weight per mission name)
  missions?: Record<MissionDataName, number>;
}

const defaultScoringWeights: ScoringWeights = {
  // Councilor attributes (typically valued 1-3 per point)
  persuasion: 1.5,
  command: 1.5,
  investigation: 1.5,
  espionage: 1.5,
  administration: 1.5,
  science: 2.0,
  security: 1.2,

  // Monthly income (valued highly as these compound over time)
  incomeBoost_month: 2.0,
  incomeMoney_month: 0.5,
  incomeInfluence_month: 1.5,
  incomeOps_month: 1.0,
  incomeMissionControl: 3.0,
  incomeResearch_month: 1.5,
  projectCapacityGranted: 5.0,

  // Purchase costs (negative weights since these are costs)
  costMoney: -0.05,
  costInfluence: -0.2,
  costOps: -0.1,
  costBoost: -0.3,

  // Priority bonuses (moderate value for most)
  economyBonus: 1.0,
  welfareBonus: 0.8,
  environmentBonus: 0.8,
  knowledgeBonus: 1.2,
  governmentBonus: 1.0,
  unityBonus: 1.0,
  militaryBonus: 1.0,
  oppressionBonus: 0.5,
  spoilsBonus: 0.8,
  spaceDevBonus: 1.5,
  spaceflightBonus: 1.5,
  MCBonus: 2.0,
  miningBonus: 1.2,

  // Tech bonuses (higher for critical tech categories)
  techBonuses: {
    Energy: 1.0,
    InformationScience: 1.2,
    LifeScience: 0.9,
    Materials: 1.1,
    MilitaryScience: 1.0,
    SocialScience: 0.8,
    SpaceScience: 1.3,
  },

  // Missions (weighted by utility/frequency of use)
  missions: {
    Abductions: 0.5,
    Advise: 2.0,
    AppeaseWin: 3.0,
    Assassinate: 2.5,
    AssaultAlienAsset: 2.0,
    AssumeControl: 3.0,
    BuildFacility: 1.5,
    Contact: 1.0,
    ControlSpaceAsset: 2.5,
    CooperateWin: 3.0,
    Coup: 2.5,
    Crackdown: 1.5,
    DefendInterests: 2.0,
    Deorbit: 1.0,
    DestroyWin: 3.0,
    Detain: 2.0,
    DetectCouncilActivity: 1.5,
    DominateNation: 3.0,
    EnthrallElites: 1.0,
    EnthrallOrg: 1.5,
    EnthrallPublic: 1.0,
    EnthrallUnalignedElites: 1.0,
    EscapeWin: 3.0,
    ExploitWin: 3.0,
    Extract: 2.5,
    GainInfluence: 2.5,
    GoToGround: 0.5,
    HostileTakeover: 2.0,
    Inspire: 2.0,
    InvestigateAlienActivity: 1.5,
    InvestigateCouncilor: 1.5,
    Orbit: 1.0,
    PassTechnology: 1.0,
    Propaganda: 1.5,
    Protect: 2.0,
    Purge: 1.5,
    ResistWin: 3.0,
    SabotageFacilities: 2.0,
    SabotageHabModule: 1.5,
    SabotageProject: 2.0,
    SeizeSpaceAsset: 2.0,
    SetNationalPolicy: 2.5,
    Stabilize: 2.0,
    StealProject: 2.5,
    SubmitWin: 3.0,
    TerrorizeRegion: 1.0,
    Transfer: 1.0,
    Turn: 3.0,
    Unrest: 1.5,
    Xenoform: 0.5,
  },
};

function getBaseCouncilorScore(councilor: Analysis["playerCouncilors"][number], weights: ScoringWeights): number {
  return getScore(councilor.effectsBaseAndUnaugmentedTraits, weights);
}

function getModifiedCouncilorScore(councilor: Analysis["playerCouncilors"][number], weights: ScoringWeights): number {
  return getScore(councilor.effectsWithOrgsAndAugments, weights);
}

function getOrganizationScore(org: Analysis["playerAvailableOrgs"][number], weights: ScoringWeights): number {
  return getScore(
    { ...org, techBonuses: org.template?.techBonuses, missionsGrantedNames: org.template?.missionsGrantedNames || [] },
    weights
  );
}

function getScore(org: ShowEffectsProps, weights: ScoringWeights): number {
  let totalScore = 0;

  // Helper to add score for a numeric attribute
  const addScore = (value: number | undefined, weight: number | undefined) => {
    if (weight !== undefined) {
      totalScore += (value || 0) * weight;
    }
  };

  // Councilor attributes
  addScore(org.persuasion, weights.persuasion);
  addScore(org.command, weights.command);
  addScore(org.investigation, weights.investigation);
  addScore(org.espionage, weights.espionage);
  addScore(org.administration, weights.administration);
  addScore(org.science, weights.science);
  addScore(org.security, weights.security);
  addScore(org.Persuasion, weights.persuasion);
  addScore(org.Command, weights.command);
  addScore(org.Investigation, weights.investigation);
  addScore(org.Espionage, weights.espionage);
  addScore(org.Administration, weights.administration);
  addScore(org.Science, weights.science);
  addScore(org.Security, weights.security);

  // Monthly income/costs
  addScore(org.incomeBoost_month, weights.incomeBoost_month);
  addScore(org.incomeMoney_month, weights.incomeMoney_month);
  addScore(org.incomeInfluence_month, weights.incomeInfluence_month);
  addScore(org.incomeOps_month, weights.incomeOps_month);
  addScore(org.incomeMissionControl, weights.incomeMissionControl);
  addScore(org.incomeResearch_month, weights.incomeResearch_month);
  addScore(org.projectCapacityGranted, weights.projectCapacityGranted);

  // Purchase costs
  addScore(org.costMoney, weights.costMoney);
  addScore(org.costInfluence, weights.costInfluence);
  addScore(org.costOps, weights.costOps);
  addScore(org.costBoost, weights.costBoost);

  // Priority bonuses
  addScore(org.economyBonus, weights.economyBonus);
  addScore(org.welfareBonus, weights.welfareBonus);
  addScore(org.environmentBonus, weights.environmentBonus);
  addScore(org.knowledgeBonus, weights.knowledgeBonus);
  addScore(org.governmentBonus, weights.governmentBonus);
  addScore(org.unityBonus, weights.unityBonus);
  addScore(org.militaryBonus, weights.militaryBonus);
  addScore(org.oppressionBonus, weights.oppressionBonus);
  addScore(org.spoilsBonus, weights.spoilsBonus);
  addScore(org.spaceDevBonus, weights.spaceDevBonus);
  addScore(org.spaceflightBonus, weights.spaceflightBonus);
  addScore(org.MCBonus, weights.MCBonus);
  addScore(org.miningBonus, weights.miningBonus);

  // Tech bonuses
  if (weights.techBonuses && org?.techBonuses) {
    for (const { category, bonus } of org.techBonuses) {
      const weight = weights.techBonuses[category];
      if (weight !== undefined) {
        totalScore += (bonus || 0) * weight;
      }
    }
  }

  // Missions granted
  if (weights.missions && org?.missionsGrantedNames) {
    for (const missionName of org.missionsGrantedNames) {
      const weight = weights.missions[missionName];
      if (weight !== undefined) {
        totalScore += weight;
      }
    }
  }

  // Divide by tier to normalize for org cost/power
  const tier = org.tier || 1;
  return totalScore / tier;
}
