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
    <div className="max-w-full mx-auto">
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-foreground truncate max-w-[320px]">
            {analysis.fileName}
          </span>
          <span className="text-xs text-muted-foreground">
            {analysis.lastModified?.toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          <span className="h-3 w-px bg-border/60 shrink-0" />
          <span className="text-xs text-muted-foreground">
            Game: {analysis.gameCurrentDateTimeFormatted.split(" ")[0]}
          </span>
          <span className="h-3 w-px bg-border/60 shrink-0" />
          <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
            {analysis.playerFaction.displayName}
          </span>
        </div>
      </div>

      <div className="px-4 pb-2">
        <SmartTabs storageKey="mainTabs" defaultValue={tabs[0].key}>
          <TabsList className="h-9 gap-0.5 bg-muted/50 border border-border/40 px-1">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.key}
                value={tab.key}
                className="h-7 px-3 text-xs font-medium rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground data-[state=active]:border data-[state=active]:border-border/60 transition-none"
              >
                {tab.tab}
              </TabsTrigger>
            ))}
          </TabsList>
        </SmartTabs>
      </div>

      <div className="px-4 pb-4">
        <SmartTabs storageKey="mainTabs" defaultValue={tabs[0].key}>
          {tabs.map((tab) => (
            <TabsContent key={tab.key} value={tab.key}>
              <div className="border border-border/40 rounded-lg bg-card px-3 py-2.5">
                {tab.content}
              </div>
            </TabsContent>
          ))}
        </SmartTabs>
      </div>
    </div>
  );
}
