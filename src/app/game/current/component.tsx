"use client";

import React, { useState, useEffect } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Analysis } from "@/lib/analysis";
import { getCouncilorsSections } from "./councilors";
import { getFleetsSections } from "./fleets";
import { getHabsSections } from "./habs";
import { getResourcesSections } from "./resources";
import { getDrivesSections } from "./drives";
import { TreeNav } from "./treeNav";
import { defaultScoringWeights, loadWeightsFromStorage, ScoringWeights } from "./scoringWeights";

export function RenderGameComponent({ analysis }: { analysis: Analysis }) {
  const [weights, setWeights] = useState<ScoringWeights>(defaultScoringWeights);
  useEffect(() => {
    setWeights(loadWeightsFromStorage());
  }, []);

  const allSections = [
    getCouncilorsSections(analysis, weights, setWeights),
    getFleetsSections(analysis),
    getHabsSections(analysis),
    getResourcesSections(analysis),
    getDrivesSections(analysis),
  ];

  const groups = allSections.map((s) => s.group);
  const contentMap = new Map<string, React.ReactNode>(
    allSections.flatMap((s) => [...s.contents.entries()]) as [string, React.ReactNode][]
  );
  const allLeafIds = groups.flatMap((g) => g.leaves.map((l) => l.id));

  const [selectedId, setSelectedId] = useLocalStorage("gameTreeNav.selectedId", allLeafIds[0] ?? "");

  const selectedContent = contentMap.get(selectedId) ?? (
    <div className="text-muted-foreground p-4">Select an item from the navigation.</div>
  );

  return (
    <div className="flex">
      <TreeNav groups={groups} selectedId={selectedId} onSelect={setSelectedId} />
      <div className="flex-1 min-w-0">
        <div className="px-4 py-2 border-b">
          <h2 className="text-sm font-medium">
            {analysis.fileName} ({analysis.lastModified?.toLocaleString()}) —{" "}
            {analysis.gameCurrentDateTimeFormatted.split(" ")[0]}
          </h2>
          <p className="text-xs text-muted-foreground">Faction: {analysis.playerFaction.displayName}</p>
        </div>
        <div className="p-2">{selectedContent}</div>
      </div>
    </div>
  );
}
