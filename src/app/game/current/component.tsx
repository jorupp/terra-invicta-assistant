"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Analysis } from "@/lib/analysis";
import { getCouncilorsUi, CouncilorsTreeItem } from "./councilors";
import { getFleetsUi, FleetsTreeItem } from "./fleets";
import { getHabsUi, HabsTreeItem } from "./habs";
import { getResourcesUi, ResourcesTreeItem } from "./resources";
import { getDrivesUi, DrivesTreeItem } from "./drives";
import { TreeNavigation, TreeNavItem } from "./treeNavigation";
import { ChevronLeft, ChevronRight, PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AllTreeItems =
  | CouncilorsTreeItem
  | FleetsTreeItem
  | HabsTreeItem
  | ResourcesTreeItem
  | DrivesTreeItem;

const SIDEBAR_STORAGE_KEY = "gameSidebarWidth";

function findContent(items: AllTreeItems[], key: string): React.ReactNode | null {
  for (const item of items) {
    if (item.key === key) return item.content;
    if (item.children) {
      const found = findContent(item.children, key);
      if (found !== null) return found;
    }
  }
  return null;
}

function findLabel(items: AllTreeItems[], key: string): string {
  for (const item of items) {
    if (item.key === key) return item.label;
    if (item.children) {
      const found = findLabel(item.children, key);
      if (found !== null) return found;
    }
  }
  return "";
}

export function RenderGameComponent({ analysis }: { analysis: Analysis }) {
  const allItems = [
    ...getCouncilorsUi(analysis),
    ...getFleetsUi(analysis),
    ...getHabsUi(analysis),
    ...getResourcesUi(analysis),
    ...getDrivesUi(analysis),
  ];

  const [selectedKey, setSelectedKey] = useState<string | null>(allItems[0]?.key || null);
  const [collapsed, setCollapsed] = useState(false);

  const sidebarRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);

  // Find first leaf node for default selection
  useEffect(() => {
    if (!selectedKey || !findContent(allItems, selectedKey)) {
      // Find first leaf
      function findFirstLeaf(items: AllTreeItems[]): string | null {
        for (const item of items) {
          if (!item.children || item.children.length === 0) return item.key;
          const found = findFirstLeaf(item.children);
          if (found) return found;
        }
        return null;
      }
      const firstLeaf = findFirstLeaf(allItems);
      if (firstLeaf) setSelectedKey(firstLeaf);
    }
  }, [allItems]);

  // Load sidebar width from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
      if (stored) {
        const w = parseInt(stored, 10);
        if (w > 150 && w < 600) {
          // will be applied after mount via inline style
        }
      }
    } catch {}
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isDragging.current = true;
    startX.current = e.clientX;
    const rect = sidebarRef.current?.getBoundingClientRect();
    startWidth.current = rect?.width || 250;
    e.preventDefault();
  }, []);

  useEffect(() => {
    if (!isDragging.current) return;
    const handleMouseMove = (e: MouseEvent) => {
      const delta = e.clientX - startX.current;
      const newWidth = Math.max(150, Math.min(600, startWidth.current + delta));
      const el = sidebarRef.current;
      if (el) {
        el.style.width = `${newWidth}px`;
        localStorage.setItem(SIDEBAR_STORAGE_KEY, String(newWidth));
      }
    };
    const handleMouseUp = () => {
      isDragging.current = false;
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const selectedItem = useRef(findLabel(allItems, selectedKey || ""));

  useEffect(() => {
    selectedItem.current = findLabel(allItems, selectedKey || "");
  }, [selectedKey, allItems]);

  const handleSelect = useCallback((key: string) => {
    setSelectedKey(key);
  }, []);

  return (
    <div className="flex h-[calc(100vh-120px)] min-h-[400px]">
      {!collapsed && (
        <div
          ref={sidebarRef}
          className="relative shrink-0 flex flex-col bg-muted/30 border-r"
          style={{ width: "250px" }}
        >
          <div className="flex items-center px-3 py-2 border-b">
            <span className="text-sm font-medium truncate">Navigation</span>
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto h-7 w-7"
              onClick={() => setCollapsed(true)}
              title="Collapse sidebar"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
          <TreeNavigation
            items={allItems}
            selectedItemKey={selectedKey}
            onSelect={handleSelect}
            storageKey="gameNav"
          />
          <div
            className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-primary/20 transition-colors"
            onMouseDown={handleMouseDown}
          />
        </div>
      )}
      {collapsed && (
        <div className="shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setCollapsed(false)}
            title="Expand sidebar"
          >
            <PanelLeft className="h-4 w-4" />
          </Button>
        </div>
      )}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        <h2>
          Game: {analysis.fileName} ({analysis.lastModified?.toLocaleString()}) - Game date:{" "}
          {analysis.gameCurrentDateTimeFormatted.split(" ")[0]}
        </h2>
        <h3>Faction: {analysis.playerFaction.displayName}</h3>
        <div className="mt-2 mb-4">
          <span className="text-sm text-muted-foreground">{selectedItem.current}</span>
        </div>
        <div className="min-h-[400px]">
          {selectedKey ? findContent(allItems, selectedKey) || <div className="text-muted-foreground">Select a navigation item</div> : null}
        </div>
      </div>
    </div>
  );
}
