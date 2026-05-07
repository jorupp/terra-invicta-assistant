"use client";

import { useState } from "react";
import { Analysis } from "@/lib/analysis";
import { getCouncilorsUi } from "./councilors";
import { getFleetsUi } from "./fleets";
import { getHabsUi } from "./habs";
import { getResourcesUi } from "./resources";
import { getDrivesUi } from "./drives";
import { Sidebar } from "./sidebar";

export function RenderGameComponent({ analysis }: { analysis: Analysis }) {
  const tabs = [
    getCouncilorsUi(analysis),
    getFleetsUi(analysis),
    getHabsUi(analysis),
    getResourcesUi(analysis),
    getDrivesUi(analysis),
  ];

  const [selectedKey, setSelectedKey] = useState<string>(tabs[0].key);

  const findTabContent = (key: string) => {
    // Check top level tabs
    const topLevelTab = tabs.find((t) => t.key === key);
    if (topLevelTab) return topLevelTab.content;

    // Check sub-items
    for (const tab of tabs) {
      const subItem = tab.subItems?.find((si) => si.key === key);
      if (subItem) {
        // For sub-items, we need to find the right content. 
        // This is tricky because getCouncilorsUi currently returns one content block.
        // We'll need to refactor the UI components to handle sub-sections.
        // For now, let's just return the main content if we can't find a specific one.
        return tab.content;
      }
    }

    return null;
  };

  return (
    <div className="flex h-[calc(100vh-theme(spacing.12))] overflow-hidden">
      <Sidebar tabs={tabs} selectedKey={selectedKey} onSelect={setSelectedKey} />
      <div className="flex-1 overflow-auto mx-2">
        <h2 className="text-xl font-bold">
          Game: {analysis.fileName} ({analysis.lastModified?.toLocaleString()}) - Game date:{" "}
          {analysis.gameCurrentDateTimeFormatted.split(" ")[0]}
        </h2>
        <h3 className="text-lg">Faction: {analysis.playerFaction.displayName}</h3>
        <div className="mt-4">
          {findTabContent(selectedKey)}
        </div>
      </div>
    </div>
  );
}

