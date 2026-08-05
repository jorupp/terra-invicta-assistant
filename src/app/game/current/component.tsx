"use client";

import { Analysis } from "@/lib/analysis";
import { useState } from "react";
import { TreeNavigation, getTreeItems, TreeSectionId } from "./treeNavigation";
import { SectionRenderer } from "./sectionRenderer";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function RenderGameComponent({ analysis }: { analysis: Analysis }) {
  const [activeSection, setActiveSection] = useState<TreeSectionId>("councilors-score");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const treeItems = getTreeItems(analysis);

  return (
    <div className="flex h-[calc(100vh-120px)]">
      {sidebarOpen && (
        <TreeNavigation
          items={treeItems}
          activeId={activeSection}
          onSectionSelect={setActiveSection}
        />
      )}
      <div className="flex-1 overflow-auto">
        <div className="flex items-center justify-between px-3 py-2 border-b bg-card sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              title={sidebarOpen ? "Close sidebar" : "Open sidebar"}
            >
              {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
            <h2 className="text-sm font-medium truncate">
              Game: {analysis.fileName} - {analysis.gameCurrentDateTimeFormatted?.split(" ")[0] || ""}
            </h2>
          </div>
          <div className="text-xs text-muted-foreground">
            Faction: {analysis.playerFaction.displayName}
          </div>
        </div>
        <div className="p-4">
          <SectionRenderer analysis={analysis} sectionId={activeSection} />
        </div>
      </div>
    </div>
  );
}
