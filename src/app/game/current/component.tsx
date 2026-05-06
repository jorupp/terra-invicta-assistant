"use client";

import { useEffect, Fragment } from "react";
import { Analysis } from "@/lib/analysis";
import { NavTree, NavTreeNode, findLeaf, getAllLeafKeys } from "@/components/ui/nav-tree";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { buildCouncilorsTree, CouncilorsSection } from "./councilors";
import { buildFleetsTree, FleetsSection } from "./fleets";
import { buildHabsTree, HabsSection } from "./habs";
import { buildResourcesTree, ResourcesSection } from "./resources";
import { buildDrivesTree, DrivesSection } from "./drives";

export function RenderGameComponent({ analysis }: { analysis: Analysis }) {
  const tree: NavTreeNode[] = [
    buildCouncilorsTree(analysis),
    buildFleetsTree(analysis),
    buildHabsTree(analysis),
    buildResourcesTree(analysis),
    buildDrivesTree(analysis),
  ];

  const allLeafKeys = getAllLeafKeys(tree);
  const [selectedKey, setSelectedKey] = useLocalStorage("mainNavSelectedKey", allLeafKeys[0] ?? "");

  // If selected key is no longer valid (e.g., conditional leaf was removed), fall back to first leaf
  useEffect(() => {
    if (selectedKey && !allLeafKeys.includes(selectedKey)) {
      setSelectedKey(allLeafKeys[0] ?? "");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedKey, allLeafKeys.join(",")]);

  function renderContent() {
    const leaf = findLeaf(tree, selectedKey);
    if (!leaf) return null;

    const [group, leafKey] = selectedKey.split("/");
    switch (group) {
      case "councilors":
        return <CouncilorsSection analysis={analysis} section={leafKey} />;
      case "fleets":
        return <FleetsSection analysis={analysis} section={leafKey} />;
      case "habs":
        return <HabsSection analysis={analysis} section={leafKey} />;
      case "resources":
        return <ResourcesSection analysis={analysis} section={leafKey} />;
      case "drives":
        return <DrivesSection analysis={analysis} section={leafKey} />;
      default:
        return null;
    }
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="px-2 py-1 border-b shrink-0">
        <span className="font-medium">{analysis.fileName}</span>
        <span className="text-muted-foreground text-sm ml-2">
          ({analysis.lastModified?.toLocaleString()}) — Game date:{" "}
          {analysis.gameCurrentDateTimeFormatted.split(" ")[0]}
        </span>
        <span className="ml-4 font-medium">{analysis.playerFaction.displayName}</span>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <NavTree
          nodes={tree}
          selectedKey={selectedKey}
          onSelect={setSelectedKey}
          storageKey="mainNav"
        />
        <main className="flex-1 overflow-y-auto p-2">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
