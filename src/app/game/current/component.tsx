"use client";

import { Analysis } from "@/lib/analysis";
import { getCouncilorsViews } from "./councilors";
import { getFleetsViews } from "./fleets";
import { getHabsViews } from "./habs";
import { getResourcesViews } from "./resources";
import { getDrivesViews } from "./drives";
import { GameTreeView } from "./tree-navigation";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  Users,
  Ship,
  Building2,
  Landmark,
  Rocket,
} from "lucide-react";

export function RenderGameComponent({ analysis }: { analysis: Analysis }) {
  const [activeView, setActiveView] = useLocalStorage<string>(
    "gameActiveView",
    "councilors-score"
  );
  const [sidebarOpen, setSidebarOpen] = useLocalStorage<boolean>(
    "gameSidebarOpen",
    true
  );

  const allViews = [
    ...getCouncilorsViews(analysis),
    ...getFleetsViews(analysis),
    ...getHabsViews(analysis),
    ...getResourcesViews(analysis),
    ...getDrivesViews(analysis),
  ];

  const viewMap = new Map(allViews.map((v) => [v.id, v]));

  const groups: Parameters<typeof GameTreeView>[0]["groups"] = [
    {
      id: "councilors",
      label: "Councilors",
      icon: Users,
      items: getCouncilorsViews(analysis).map((v) => ({
        id: v.id,
        label: v.label,
        subtitle: v.subtitle,
      })),
    },
    {
      id: "fleets",
      label: "Fleets",
      icon: Ship,
      items: getFleetsViews(analysis).map((v) => ({
        id: v.id,
        label: v.label,
        subtitle: v.subtitle,
      })),
    },
    {
      id: "habs",
      label: "Habs",
      icon: Building2,
      items: getHabsViews(analysis).map((v) => ({
        id: v.id,
        label: v.label,
        subtitle: v.subtitle,
      })),
    },
    {
      id: "resources",
      label: "Resources",
      icon: Landmark,
      items: getResourcesViews(analysis).map((v) => ({
        id: v.id,
        label: v.label,
        subtitle: v.subtitle,
      })),
    },
    {
      id: "drives",
      label: "Drives",
      icon: Rocket,
      items: getDrivesViews(analysis).map((v) => ({
        id: v.id,
        label: v.label,
        subtitle: v.subtitle,
      })),
    },
  ];

  const activeViewData = viewMap.get(activeView);

  return (
    <div className="flex h-[calc(100vh-8rem)]">
      {/* Sidebar */}
      {sidebarOpen && (
        <aside className="w-56 shrink-0 border-r border-border/40 bg-muted/20">
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between px-3 py-2 border-b border-border/30">
              <span className="text-xs font-semibold text-foreground/60">Navigation</span>
              <Button
                variant="ghost"
                size="icon-xs"
                className="h-5 w-5"
                onClick={() => setSidebarOpen(false)}
              >
                <PanelLeft className="h-3.5 w-3.5" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <GameTreeView
                groups={groups}
                activeView={activeView}
                onViewSelect={setActiveView}
              />
            </div>
          </div>
        </aside>
      )}

      {/* Toggle sidebar button when closed */}
      {!sidebarOpen && (
        <div className="shrink-0">
          <Button
            variant="ghost"
            size="icon-xs"
            className="h-7 w-7 -ml-1"
            onClick={() => setSidebarOpen(true)}
          >
            <PanelLeft className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 overflow-y-auto px-4 py-3">
        <div>
          {/* Header */}
          <div className="mb-4">
            <h2 className="text-base font-semibold">
              Game: {analysis.fileName} ({analysis.lastModified?.toLocaleString()}) -{" "}
              Game date: {analysis.gameCurrentDateTimeFormatted.split(" ")[0]}
            </h2>
            <h3 className="text-sm font-medium text-muted-foreground">
              Faction: {analysis.playerFaction.displayName}
            </h3>
          </div>

          {/* Breadcrumb / View title */}
          {activeViewData && (
            <div className="mb-3 flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">
                {activeViewData.label}
              </span>
              {activeViewData.subtitle && (
                <span className="text-xs text-muted-foreground">
                  {activeViewData.subtitle}
                </span>
              )}
            </div>
          )}

          {/* Content */}
          <div className="min-h-[200px]">
            {activeViewData ? activeViewData.content : (
              <div className="p-8 text-center text-muted-foreground">
                Select an item from the navigation panel
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
