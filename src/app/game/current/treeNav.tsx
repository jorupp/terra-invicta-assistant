"use client";

import { ChevronDown, ChevronRight, PanelLeft, PanelLeftClose } from "lucide-react";
import { ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import { useLocalStorage } from "@/hooks/useLocalStorage";

export type TreeLeaf = {
  id: string;
  label: ReactNode;
};

export type TreeGroup = {
  id: string;
  label: ReactNode;
  subtitle?: ReactNode;
  leaves: TreeLeaf[];
};

export type SectionResult = {
  group: TreeGroup;
  contents: Map<string, ReactNode>;
};

export function TreeNav({
  groups,
  selectedId,
  onSelect,
}: {
  groups: TreeGroup[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const [collapsed, setCollapsed] = useLocalStorage("gameTreeNav.collapsed", false);
  const [expandedGroups, setExpandedGroups] = useLocalStorage<string[]>(
    "gameTreeNav.expandedGroups",
    groups.map((g) => g.id)
  );

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) =>
      prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId]
    );
  };

  if (collapsed) {
    return (
      <aside className="w-8 border-r flex flex-col items-center pt-2 shrink-0">
        <button onClick={() => setCollapsed(false)} title="Expand navigation">
          <PanelLeft className="h-5 w-5 text-muted-foreground" />
        </button>
      </aside>
    );
  }

  return (
    <aside className="w-52 border-r flex flex-col shrink-0 sticky top-0 max-h-screen overflow-hidden">
      <div className="flex justify-end p-1 border-b shrink-0">
        <button onClick={() => setCollapsed(true)} title="Collapse navigation">
          <PanelLeftClose className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
      <nav className="overflow-y-auto flex-1">
        {groups.map((group) => (
          <div key={group.id}>
            <button
              className="w-full text-left px-2 py-1.5 flex items-start gap-1 hover:bg-muted/50 font-semibold text-sm border-b"
              onClick={() => toggleGroup(group.id)}
            >
              <span className="shrink-0 mt-0.5">
                {expandedGroups.includes(group.id) ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </span>
              <div className="min-w-0">
                <div className="truncate">{group.label}</div>
                {group.subtitle && (
                  <div className="text-xs text-muted-foreground font-normal">{group.subtitle}</div>
                )}
              </div>
            </button>
            {expandedGroups.includes(group.id) && (
              <div>
                {group.leaves.map((leaf) => (
                  <button
                    key={leaf.id}
                    className={twMerge(
                      "w-full text-left pl-5 pr-2 py-1 text-sm hover:bg-muted/50 border-b border-muted/20",
                      selectedId === leaf.id && "bg-primary/10 font-medium"
                    )}
                    onClick={() => onSelect(leaf.id)}
                  >
                    {leaf.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
}
