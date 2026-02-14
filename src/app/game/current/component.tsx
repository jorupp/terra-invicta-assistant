"use client";

import { TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SmartTabs } from "@/components/ui/smart-tabs";
import { Analysis } from "@/lib/analysis";
import { getCouncilorsUi } from "./councilors";
import { getFleetsUi } from "./fleets";
import { getHabsUi } from "./habs";
import { getResourcesUi } from "./resources";
import { getDrivesUi } from "./drives";

export function RenderGameComponent({ analysis }: { analysis: Analysis }) {
  const tabs = [
    getCouncilorsUi(analysis),
    getFleetsUi(analysis),
    getHabsUi(analysis),
    getResourcesUi(analysis),
    getDrivesUi(analysis),
  ];
  return (
    <div className="mx-2">
      <h2>
        Game: {analysis.fileName} ({analysis.lastModified?.toLocaleString()}) - Game date:{" "}
        {analysis.gameCurrentDateTimeFormatted.split(" ")[0]}
      </h2>
      <h3>Faction: {analysis.playerFaction.displayName}</h3>

      <SmartTabs storageKey="mainTabs" defaultValue={tabs[0].key}>
        <TabsList>
          {tabs.map((tab) => (
            <TabsTrigger key={tab.key} value={tab.key}>
              {tab.tab}
            </TabsTrigger>
          ))}
        </TabsList>
        {tabs.map((tab) => (
          <TabsContent key={tab.key} value={tab.key}>
            {tab.content}
          </TabsContent>
        ))}
      </SmartTabs>
    </div>
  );
}
