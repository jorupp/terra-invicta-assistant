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
    <div>
      <header className="flex items-center gap-2 px-3 py-1.5 bg-card border-b text-xs sticky top-0 z-10 shadow-sm">
        <span className="font-bold text-sm tracking-tight text-foreground">Terra Invicta</span>
        <span className="text-border select-none">|</span>
        <span className="font-semibold text-primary">{analysis.playerFaction.displayName}</span>
        <span className="text-border select-none">|</span>
        <span className="text-muted-foreground">{analysis.gameCurrentDateTimeFormatted.split(" ")[0]}</span>
        <span className="ml-auto text-muted-foreground truncate max-w-xs text-right">
          {analysis.fileName} · {analysis.lastModified?.toLocaleString()}
        </span>
      </header>
      <div className="px-2">
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
    </div>
  );
}
