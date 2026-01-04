"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Analysis } from "@/lib/analysis";
import { getCouncilorsUi } from "./councilors";

export default function CurrentGameComponent({ analysis }: { analysis: Analysis }) {
  const tabs = [getCouncilorsUi(analysis)];
  return (
    <div>
      <h2>Current Game Component</h2>
      <h3>Faction: {analysis.playerFaction.displayName}</h3>

      <Tabs>
        <TabsList>
          {tabs.map((tab) => (
            <TabsTrigger key={tab.key} value={tab.key}>
              {tab.tab}
            </TabsTrigger>
          ))}
        </TabsList>
        {tabs.map((tab) => (
          <div key={tab.key} data-slot="tabs-content" data-value={tab.key} className="mt-4">
            {tab.content}
          </div>
        ))}
      </Tabs>
    </div>
  );
}
