"use client";

import { useCallback, useMemo, useState } from "react";
import { Tree, TreeItemData } from "@/components/ui/tree";
import { Button } from "@/components/ui/button";
import { ChevronLeft, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Analysis } from "@/lib/analysis";

interface SidebarProps {
  treeItems: TreeItemData[];
  defaultExpanded?: string[];
  analysis: Analysis;
  children: React.ReactNode;
}

export function GameSidebar({ treeItems, defaultExpanded, analysis, children }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [expanded, setExpanded] = useState<string[]>(defaultExpanded || []);
  const [selected, setSelected] = useState<string | undefined>(undefined);

  const handleExpandedChange = useCallback((next: string[]) => {
    setExpanded(next);
  }, []);

  const handleSelectionChange = useCallback((value: string | null | undefined) => {
    setSelected(value ?? undefined);
  }, []);

  const headerContent = useMemo(() => (
    <div className="px-3 py-2 border-b border-border">
      <div className="text-xs font-medium truncate" title={analysis.fileName}>
        {analysis.fileName}
      </div>
      <div className="text-[11px] text-muted-foreground truncate">
        {analysis.gameCurrentDateTimeFormatted?.split(" ")[0] || ""}
      </div>
      <div className="text-xs font-medium mt-1 truncate" title={analysis.playerFaction.displayName || undefined}>
        {analysis.playerFaction.displayName}
      </div>
    </div>
  ), [analysis.fileName, analysis.gameCurrentDateTimeFormatted, analysis.playerFaction.displayName]);

  return (
    <div className="flex h-full">
      {isOpen && (
        <aside className="w-72 border-r border-border flex flex-col bg-card shrink-0">
          {headerContent}
          <div className="flex-1 overflow-y-auto py-2 px-2">
            <Tree
              items={treeItems}
              expanded={expanded}
              defaultExpanded={defaultExpanded}
              selected={selected}
              onExpandedChange={handleExpandedChange}
              onSelectionChange={handleSelectionChange}
            />
          </div>
        </aside>
      )}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center gap-1 px-2 py-1.5 border-b border-border">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
          </Button>
          {selected && (
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <ChevronLeft className="h-3 w-3" />
              {findLabel(treeItems, selected)}
            </span>
          )}
        </div>
        <main className="flex-1 overflow-y-auto p-4">
          {children}
        </main>
      </div>
    </div>
  );
}

function findLabel(items: TreeItemData[], value: string): React.ReactNode {
  for (const item of items) {
    if (item.value === value) return item.label;
    if (item.children) {
      const found = findLabel(item.children, value);
      if (found) return found;
    }
  }
  return value;
}
