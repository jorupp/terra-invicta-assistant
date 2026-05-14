"use client";

import * as React from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocalStorage } from "@/hooks/useLocalStorage";

export interface TreeViewItem {
  id: string;
  label: string;
  subtitle?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface TreeViewGroup {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  items: TreeViewItem[];
}

export interface GameTreeViewProps {
  groups: TreeViewGroup[];
  activeView: string;
  onViewSelect: (viewId: string) => void;
  className?: string;
  defaultOpen?: string[];
}

export function GameTreeView({
  groups,
  activeView,
  onViewSelect,
  className,
  defaultOpen = [],
}: GameTreeViewProps) {
  const [openGroups, setOpenGroups] = useLocalStorage<string[]>("gameTreeViewOpen", defaultOpen);

  const toggleGroup = (groupId: string) => {
    setOpenGroups((prev) =>
      prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId]
    );
  };

  return (
    <nav className={cn("flex flex-col h-full", className)}>
      {groups.map((group) => {
        const isOpen = openGroups.includes(group.id);
        const hasActiveItem = group.items.some((item) => item.id === activeView);
        const hasVisibleItems = group.items.length > 0;

        if (!hasVisibleItems) return null;

        const GroupIcon = group.icon;

        return (
          <div key={group.id} className="border-b border-border/40 last:border-b-0">
            {/* Group header */}
            <button
              type="button"
              onClick={() => hasVisibleItems && toggleGroup(group.id)}
              className={cn(
                "flex items-center gap-1.5 w-full px-2 py-1.5 text-left text-sm font-semibold",
                "hover:bg-muted/60 transition-colors cursor-pointer select-none",
                "text-foreground/80"
              )}
            >
              {group.items.length > 1 && (
                <span className="shrink-0 opacity-60">
                  {isOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                </span>
              )}
              {GroupIcon && <GroupIcon className="h-4 w-4 shrink-0 opacity-70" />}
              <span className="truncate">{group.label}</span>
            </button>

            {/* Group items */}
            {isOpen && (
              <div className="flex flex-col pb-1">
                {group.items.map((item) => {
                  const isActive = item.id === activeView;
                  const ItemIcon = item.icon;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onViewSelect(item.id)}
                      className={cn(
                        "flex flex-col items-start gap-0 w-full px-2 py-1 px-4 text-left transition-colors select-none",
                        "hover:bg-muted/60",
                        isActive && "bg-muted/80 text-foreground font-medium"
                      )}
                    >
                      <span className="flex items-center gap-1.5 text-xs truncate">
                        {ItemIcon && <ItemIcon className="h-3.5 w-3.5 shrink-0 opacity-70" />}
                        <span className="truncate">{item.label}</span>
                      </span>
                      {item.subtitle && (
                        <span className={cn(
                          "text-[0.65rem] truncate ml-5",
                          isActive ? "text-foreground/60" : "text-foreground/40"
                        )}>
                          {item.subtitle}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
