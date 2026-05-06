"use client";

import { useState, useEffect } from "react";
import { Analysis } from "@/lib/analysis";
import { TreeNav, TreeItem, ContentPanel } from "./tree-nav";
import { PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCouncilorsContentPanels } from "./councilors";
import { getFleetsContentPanels } from "./fleets";
import { getHabsContentPanels } from "./habs";
import { getResourcesContentPanels } from "./resources";
import { getDrivesContentPanels } from "./drives";
import {
  Users,
  Ship,
  Building2,
  Coins,
  Rocket,
  BarChart3,
  UsersRound,
  UserPlus,
  Landmark,
  Target,
  Globe,
  Map as MapIcon,
  Swords,
  Crosshair,
  Construction,
  Sparkles,
  Zap,
  Eye,
  FolderOpen,
  Wrench,
  Pickaxe,
  ScrollText,
  Ruler,
  ListChecks,
} from "lucide-react";

function getTreeItems(analysis: Analysis): TreeItem[] {
  return [
    {
      key: "councilors",
      label: "Councilors",
      icon: FolderOpen,
      children: [
        ...getCouncilorsContentPanels(analysis).map((p) => ({
          key: `councilors:${p.key}`,
          label: p.label,
          icon: p.icon,
        })),
      ],
    },
    {
      key: "fleets",
      label: "Fleets",
      icon: FolderOpen,
      children: [
        ...getFleetsContentPanels(analysis).map((p) => ({
          key: `fleets:${p.key}`,
          label: p.label,
          icon: p.icon,
        })),
      ],
    },
    {
      key: "habs",
      label: "Habs",
      icon: FolderOpen,
      children: [
        ...getHabsContentPanels(analysis).map((p) => ({
          key: `habs:${p.key}`,
          label: p.label,
          icon: p.icon,
        })),
      ],
    },
    {
      key: "resources",
      label: "Resources",
      icon: FolderOpen,
      children: [
        ...getResourcesContentPanels(analysis).map((p) => ({
          key: `resources:${p.key}`,
          label: p.label,
          icon: p.icon,
        })),
      ],
    },
    {
      key: "drives",
      label: "Drives",
      icon: FolderOpen,
      children: [
        ...getDrivesContentPanels(analysis).map((p) => ({
          key: `drives:${p.key}`,
          label: p.label,
          icon: p.icon,
        })),
      ],
    },
  ];
}

export function TreeLayout({ analysis }: { analysis: Analysis }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedKey) {
      setSelectedKey("councilors:score-details");
    }
  }, [selectedKey]);

  const treeItems = getTreeItems(analysis);

  const allPanels = [
    ...getCouncilorsContentPanels(analysis),
    ...getFleetsContentPanels(analysis),
    ...getHabsContentPanels(analysis),
    ...getResourcesContentPanels(analysis),
    ...getDrivesContentPanels(analysis),
  ];

  const allPanelMap = new Map(allPanels.map((p) => [`${p.source}:${p.key}`, p])) as Map<string, ContentPanel>;

  const activePanel = selectedKey ? allPanelMap.get(selectedKey) : null;

  return (
    <div className="mx-2">
      <h2>
        Game: {analysis.fileName} ({analysis.lastModified?.toLocaleString()}) - Game date:{" "}
        {analysis.gameCurrentDateTimeFormatted.split(" ")[0]}
      </h2>
      <h3>Faction: {analysis.playerFaction.displayName}</h3>

      <div className="flex border rounded mt-2 min-h-[600px]">
        {/* Sidebar toggle */}
        <div
          className={`flex flex-col border-r bg-muted/20 transition-all duration-200 ${
            sidebarOpen ? "w-56" : "w-10"
          }`}
        >
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 m-1 p-0 self-start"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <PanelLeft className="h-4 w-4" />
          </Button>

          {sidebarOpen && (
            <div className="flex-1 overflow-y-auto">
              <TreeNav
                items={treeItems}
                selectedKey={selectedKey}
                onSelect={setSelectedKey}
              />
            </div>
          )}
        </div>

        {/* Content area */}
        <div className="flex-1 p-4 overflow-y-auto">
          {activePanel ? (
            <div>
              <h3 className="text-lg font-semibold mb-3">{activePanel.label}</h3>
              {activePanel.content}
            </div>
          ) : (
            <div className="text-muted-foreground">Select an item from the navigation</div>
          )}
        </div>
      </div>
    </div>
  );
}
