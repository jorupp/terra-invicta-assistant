"use client";

import { useState, useMemo } from "react";
import { ScoringProvider, useScoring } from "./scoring-context";
import { TreeNav, TreeNode } from "./tree-nav";
import { ScoringWeightsDialog, ScoringWeights } from "./scoringWeights";
import { Analysis } from "@/lib/analysis";
import { ExistingCouncil, FindNewCouncilors, CurrentOrgs, Takeover, Missions, OtherCouncilors, ScoreDetails } from "./councilors";
import { FleetsAlienSection as FleetsAlien, FleetsHumanSection as FleetsHuman, FleetsPlayerSection as FleetsPlayer, FleetsConstructionSection as FleetsConstruction } from "./fleets";
import { HabsCurrentBonuses, HabsFutureBonuses, HabsBoostMcSummary, HabsAlienHate, HabsBuildingDetails, HabsAvailableBoostProjects, HabsAvailableCPProjects, HabsAvailableMaxOrgProjects, HabsAvailableExpandNations, HabsAvailableStealableProjects, HabsTechnologyGoals, HabsManageHabs, HabsManageMines } from "./habs";
import { ResourcesTransactions, ResourcesOwnedNations, ResourcesSpoilTargets, ResourcesMcBoostTargets, ResourcesNationClaims, ResourcesUnificationCandidates } from "./resources";
import { DrivesContent } from "./drives";

function GameContent({ analysis }: { analysis: Analysis }) {
  const { weights, setWeights } = useScoring();
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [treeCollapsed, setTreeCollapsed] = useState(false);

  const treeNodes = useMemo<TreeNode[]>(() => {
    const nodes: TreeNode[] = [];

    // Councilors
    nodes.push({
      type: "folder",
      key: "councilors",
      label: "Councilors",
      defaultValue: true,
      children: [
        { type: "leaf", key: "c-score", label: "Score Details", contentKey: "c-score", onSelect: () => setSelectedKey("c-score") },
        { type: "leaf", key: "c-existing", label: "Existing Council", contentKey: "c-existing", onSelect: () => setSelectedKey("c-existing") },
        { type: "leaf", key: "c-find-new", label: "Find New Councilors", contentKey: "c-find-new", onSelect: () => setSelectedKey("c-find-new") },
        { type: "leaf", key: "c-current-orgs", label: "Current Organizations", contentKey: "c-current-orgs", onSelect: () => setSelectedKey("c-current-orgs") },
        { type: "leaf", key: "c-takeover", label: "Hostile Takeover", contentKey: "c-takeover", onSelect: () => setSelectedKey("c-takeover") },
        { type: "leaf", key: "c-missions", label: "Missions", contentKey: "c-missions", onSelect: () => setSelectedKey("c-missions") },
        { type: "leaf", key: "c-other", label: "Other Councilors", contentKey: "c-other", onSelect: () => setSelectedKey("c-other") },
      ],
    });

    // Fleets
    nodes.push({
      type: "folder",
      key: "fleets",
      label: "Fleets",
      children: [
        { type: "leaf", key: "f-alien", label: "Alien Fleets", contentKey: "f-alien", onSelect: () => setSelectedKey("f-alien") },
        { type: "leaf", key: "f-human", label: "Other Human Factions", contentKey: "f-human", onSelect: () => setSelectedKey("f-human") },
        { type: "leaf", key: "f-player", label: "Player Fleets", contentKey: "f-player", onSelect: () => setSelectedKey("f-player") },
        { type: "leaf", key: "f-construction", label: "Ships Under Construction", contentKey: "f-construction", onSelect: () => setSelectedKey("f-construction") },
      ],
    });

    // Habs
    nodes.push({
      type: "folder",
      key: "habs",
      label: "Habs",
      children: [
        { type: "leaf", key: "h-current", label: "Current Bonuses", contentKey: "h-current", onSelect: () => setSelectedKey("h-current") },
        { type: "leaf", key: "h-future", label: "Future Bonuses", contentKey: "h-future", onSelect: () => setSelectedKey("h-future") },
        { type: "leaf", key: "h-boost-mc", label: "MC/Boost Summary", contentKey: "h-boost-mc", onSelect: () => setSelectedKey("h-boost-mc") },
        { type: "leaf", key: "h-alien-hate", label: "Alien Hate", contentKey: "h-alien-hate", onSelect: () => setSelectedKey("h-alien-hate") },
        { type: "leaf", key: "h-building", label: "Building Details", contentKey: "h-building", onSelect: () => setSelectedKey("h-building") },
        { type: "leaf", key: "h-boost-proj", label: "Available Boost Projects", contentKey: "h-boost-proj", onSelect: () => setSelectedKey("h-boost-proj") },
        { type: "leaf", key: "h-cp-projects", label: "Available CP Projects", contentKey: "h-cp-projects", onSelect: () => setSelectedKey("h-cp-projects") },
        { type: "leaf", key: "h-max-org", label: "Available Max Org Projects", contentKey: "h-max-org", onSelect: () => setSelectedKey("h-max-org") },
        { type: "leaf", key: "h-expand", label: "Available Expand Nations", contentKey: "h-expand", onSelect: () => setSelectedKey("h-expand") },
        { type: "leaf", key: "h-stealable", label: "Available Stealable Projects", contentKey: "h-stealable", onSelect: () => setSelectedKey("h-stealable") },
        { type: "leaf", key: "h-tech", label: "Technology Goals", contentKey: "h-tech", onSelect: () => setSelectedKey("h-tech") },
        { type: "leaf", key: "h-manage", label: "Manage Habs", contentKey: "h-manage", onSelect: () => setSelectedKey("h-manage") },
        { type: "leaf", key: "h-mines", label: "Manage Mines", contentKey: "h-mines", onSelect: () => setSelectedKey("h-mines") },
      ],
    });

    // Resources
    nodes.push({
      type: "folder",
      key: "resources",
      label: "Resources",
      children: [
        { type: "leaf", key: "r-transactions", label: "Transactions", contentKey: "r-transactions", onSelect: () => setSelectedKey("r-transactions") },
        { type: "leaf", key: "r-owned", label: "Owned Nations", contentKey: "r-owned", onSelect: () => setSelectedKey("r-owned") },
        { type: "leaf", key: "r-spoils", label: "Spoil Targets", contentKey: "r-spoils", onSelect: () => setSelectedKey("r-spoils") },
        { type: "leaf", key: "r-space", label: "MC/Boost Targets", contentKey: "r-space", onSelect: () => setSelectedKey("r-space") },
        { type: "leaf", key: "r-claims", label: "Nation Claims", contentKey: "r-claims", onSelect: () => setSelectedKey("r-claims") },
        { type: "leaf", key: "r-unification", label: "Unification Candidates", contentKey: "r-unification", onSelect: () => setSelectedKey("r-unification") },
      ],
    });

    // Drives
    nodes.push({
      type: "folder",
      key: "drives",
      label: "Drives",
      children: [
        { type: "leaf", key: "d-systems", label: "Drive Systems", contentKey: "d-systems", onSelect: () => setSelectedKey("d-systems") },
        { type: "leaf", key: "d-calculator", label: "Drive Calculator", contentKey: "d-calculator", onSelect: () => setSelectedKey("d-calculator") },
      ],
    });

    return nodes;
  }, []);

  const renderContent = () => {
    if (!selectedKey) {
      return (
        <div className="flex h-full items-center justify-center text-muted-foreground">
          Select an item from the navigation to view details
        </div>
      );
    }

    return (
      <ContentPanel
        analysis={analysis}
        weights={weights}
        setWeights={setWeights}
        selectedKey={selectedKey}
      />
    );
  };

  return (
    <div className="flex h-[calc(100vh-8rem)]">
      {!treeCollapsed && (
        <div className="w-64 flex-shrink-0 overflow-y-auto border-r border-border bg-background p-2">
          <TreeNav nodes={treeNodes} storageKey="gameTree" className="pb-4" />
          <div className="mt-4 px-2">
            <ScoringWeightsDialog weights={weights} onWeightsChange={setWeights} />
          </div>
        </div>
      )}
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex items-center border-b border-border px-3 py-1.5">
          <button
            onClick={() => setTreeCollapsed((p) => !p)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {treeCollapsed ? "\u2192 Show navigation" : "\u2190 Hide navigation"}
          </button>
          {selectedKey && (
            <span className="ml-auto text-xs text-muted-foreground">
              {getNodeLabel(treeNodes, selectedKey) || selectedKey}
            </span>
          )}
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

function getNodeLabel(nodes: TreeNode[], key: string): string | null {
  for (const node of nodes) {
    if (node.type === "leaf" && node.key === key) return String(node.label);
    if (node.type === "folder") {
      const found = getNodeLabel(node.children, key);
      if (found) return found;
    }
  }
  return null;
}

function ContentPanel({
  analysis,
  weights,
  setWeights,
  selectedKey,
}: {
  analysis: Analysis;
  weights: ScoringWeights;
  setWeights: (w: ScoringWeights) => void;
  selectedKey: string;
}) {
  switch (selectedKey) {
    // Councilors
    case "c-score":
      return <ScoreDetails analysis={analysis} weights={weights} />;
    case "c-existing":
      return <ExistingCouncil analysis={analysis} weights={weights} />;
    case "c-find-new":
      return <FindNewCouncilors analysis={analysis} weights={weights} />;
    case "c-current-orgs":
      return <CurrentOrgs analysis={analysis} weights={weights} />;
    case "c-takeover":
      return <Takeover analysis={analysis} weights={weights} />;
    case "c-missions":
      return <Missions analysis={analysis} weights={weights} />;
    case "c-other":
      return <OtherCouncilors analysis={analysis} weights={weights} />;

    // Fleets
    case "f-alien":
      return <FleetsAlien analysis={analysis} />;
    case "f-human":
      return <FleetsHuman analysis={analysis} />;
    case "f-player":
      return <FleetsPlayer analysis={analysis} />;
    case "f-construction":
      return <FleetsConstruction analysis={analysis} />;

    // Habs
    case "h-current":
      return <HabsCurrentBonuses analysis={analysis} />;
    case "h-future":
      return <HabsFutureBonuses analysis={analysis} />;
    case "h-boost-mc":
      return <HabsBoostMcSummary analysis={analysis} />;
    case "h-alien-hate":
      return <HabsAlienHate analysis={analysis} />;
    case "h-building":
      return <HabsBuildingDetails analysis={analysis} />;
    case "h-boost-proj":
      return <HabsAvailableBoostProjects analysis={analysis} />;
    case "h-cp-projects":
      return <HabsAvailableCPProjects analysis={analysis} />;
    case "h-max-org":
      return <HabsAvailableMaxOrgProjects analysis={analysis} />;
    case "h-expand":
      return <HabsAvailableExpandNations analysis={analysis} />;
    case "h-stealable":
      return <HabsAvailableStealableProjects analysis={analysis} />;
    case "h-tech":
      return <HabsTechnologyGoals analysis={analysis} />;
    case "h-manage":
      return <HabsManageHabs analysis={analysis} />;
    case "h-mines":
      return <HabsManageMines analysis={analysis} />;

    // Resources
    case "r-transactions":
      return <ResourcesTransactions analysis={analysis} />;
    case "r-owned":
      return <ResourcesOwnedNations analysis={analysis} />;
    case "r-spoils":
      return <ResourcesSpoilTargets analysis={analysis} />;
    case "r-space":
      return <ResourcesMcBoostTargets analysis={analysis} />;
    case "r-claims":
      return <ResourcesNationClaims analysis={analysis} />;
    case "r-unification":
      return <ResourcesUnificationCandidates analysis={analysis} />;

    // Drives
    case "d-systems":
      return <DrivesContent analysis={analysis} section="drive-table" />;
    case "d-calculator":
      return <DrivesContent analysis={analysis} section="drive-calculator" />;

    default:
      return <div className="text-muted-foreground">Unknown section: {selectedKey}</div>;
  }
}

export function RenderGameComponent({ analysis }: { analysis: Analysis }) {
  return (
    <ScoringProvider>
      <div className="mx-2">
        <div className="mb-2 flex items-center gap-4 text-xs text-muted-foreground">
          <span>Game: {analysis.fileName}</span>
          <span>({analysis.lastModified?.toLocaleDateString()})</span>
          <span>Game date: {analysis.gameCurrentDateTimeFormatted.split(" ")[0]}</span>
          <span className="font-medium text-foreground">Faction: {analysis.playerFaction.displayName}</span>
        </div>
        <GameContent analysis={analysis} />
      </div>
    </ScoringProvider>
  );
}
