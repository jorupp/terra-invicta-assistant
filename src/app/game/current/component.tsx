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
    <div className="p-4 space-y-6">
      <div className="flex flex-col gap-1 border-b pb-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Game: {analysis.fileName} 
          <span className="ml-3 text-sm font-normal text-muted-foreground">
            ({analysis.lastModified?.toLocaleString()})
          </span>
        </h2>
           <div className="flex items-center gap-2 text-lg">
             <span className="font-medium opacity-70">Faction:</span>
             <span className="text-primary font-semibold">{analysis.playerFaction.displayName}</span>
           </div>
      </div>

      <SmartTabs storageKey="mainTabs" defaultValue={tabs[0].key}>
        <TabsList className="grid w-full grid-cols-5 lg:w-fit">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.key} value={tab.key}>
              {tab.tab}
            </TabsTrigger>
          ))}
        </TabsList>
        {tabs.map((tab) => (
          <TabsContent key={tab.key} value={tab.key} className="mt-4 outline-none">
            {tab.content}
          </TabsContent>
        ))}
      </SmartTabs>
    </div>
  );
}
