"use client";

import { Analysis } from "@/lib/analysis";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import {
  Building2,
  ChevronDown,
  ChevronRight,
  Circle,
  Coins,
  Gauge,
  PanelLeftClose,
  PanelLeftOpen,
  Rocket,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useEffect } from "react";
import { twMerge } from "tailwind-merge";
import { useCouncilorsUi } from "./councilors";
import { getFleetsUi } from "./fleets";
import { getHabsUi } from "./habs";
import { getResourcesUi } from "./resources";
import { getDrivesUi } from "./drives";
import type { GameNavigationGroup } from "./navigation-types";

const navigationGroupStyles: Record<string, { icon: LucideIcon; color: string }> = {
  councilors: { icon: Users, color: "text-blue-600" },
  fleets: { icon: Rocket, color: "text-red-600" },
  habs: { icon: Building2, color: "text-green-600" },
  resources: { icon: Coins, color: "text-amber-600" },
  drives: { icon: Gauge, color: "text-purple-600" },
};

export function RenderGameComponent({ analysis }: { analysis: Analysis }) {
  const groups: GameNavigationGroup[] = [
    useCouncilorsUi(analysis),
    getFleetsUi(analysis),
    getHabsUi(analysis),
    getResourcesUi(analysis),
    getDrivesUi(analysis),
  ];

  const items = groups.flatMap((group) => group.items);
  const defaultItemKey = items[0]?.key || "";
  const [selectedKey, setSelectedKey] = useLocalStorage("gameNavigationSelected", defaultItemKey);
  const [sidebarCollapsed, setSidebarCollapsed] = useLocalStorage("gameNavigationCollapsed", false);
  const [expandedGroups, setExpandedGroups] = useLocalStorage<Record<string, boolean>>(
    "gameNavigationExpanded",
    Object.fromEntries(groups.map((group) => [group.key, true])),
  );
  const selectedItem = items.find((item) => item.key === selectedKey) || items[0];
  const selectedItemKey = selectedItem?.key;
  const selectedGroup = groups.find((group) => group.items.some((item) => item.key === selectedItem?.key)) || groups[0];

  useEffect(() => {
    if (selectedItemKey && selectedItemKey !== selectedKey) {
      setSelectedKey(selectedItemKey);
    }
  }, [selectedItemKey, selectedKey, setSelectedKey]);

  const toggleGroup = (groupKey: string) => {
    setExpandedGroups((current) => ({ ...current, [groupKey]: !(current[groupKey] ?? true) }));
  };

  return (
    <div className="mx-2 flex min-h-[calc(100vh-1rem)] flex-col gap-3">
      <header className="border-b pb-2">
        <h2 className="text-sm font-semibold">
          Game: {analysis.fileName} ({analysis.lastModified?.toLocaleString()})
        </h2>
        <p className="text-xs text-muted-foreground">
          {analysis.playerFaction.displayName} · Game date: {analysis.gameCurrentDateTimeFormatted.split(" ")[0]}
        </p>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-3 lg:flex-row">
        <aside
          className={twMerge(
            "shrink-0 rounded-lg border bg-sidebar text-sidebar-foreground transition-[width] duration-200",
            sidebarCollapsed ? "lg:w-12" : "lg:w-64",
          )}
        >
          <div className="flex items-center justify-end border-b p-1">
            <button
              type="button"
              className="rounded-md p-1.5 text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              aria-label={sidebarCollapsed ? "Expand navigation" : "Collapse navigation"}
              title={sidebarCollapsed ? "Expand navigation" : "Collapse navigation"}
            >
              {sidebarCollapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
            </button>
          </div>

          {!sidebarCollapsed && (
            <nav aria-label="Game information" className="max-h-[calc(100vh-8rem)] overflow-y-auto p-2">
              {groups.map((group) => {
                const groupStyle = navigationGroupStyles[group.key] || { icon: Circle, color: "text-foreground" };
                const GroupIcon = groupStyle.icon;
                const isExpanded = expandedGroups[group.key] ?? true;
                const isGroupSelected = group.items.some((item) => item.key === selectedItem?.key);
                return (
                  <div key={group.key} className="mb-1 last:mb-0">
                    <div
                      className={twMerge(
                        "flex items-start rounded-md",
                        isGroupSelected && "bg-sidebar-accent/60",
                      )}
                    >
                      <button
                        type="button"
                        className="min-w-0 flex-1 px-2 py-1.5 text-left hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        onClick={() => {
                          if (group.items[0]) {
                            setSelectedKey(group.items[0].key);
                            setExpandedGroups((current) => ({ ...current, [group.key]: true }));
                          }
                        }}
                      >
                        <span className="flex items-center gap-2 text-xs font-semibold">
                          <span className={twMerge("flex size-5 shrink-0 items-center justify-center rounded border", groupStyle.color)}>
                            <GroupIcon className="size-3.5" />
                          </span>
                          <span className="min-w-0 truncate">{group.label}</span>
                        </span>
                        {group.subtitle && (
                          <span className="mt-0.5 block truncate pl-7 text-[0.65rem] leading-tight text-muted-foreground">
                            {group.subtitle}
                          </span>
                        )}
                      </button>
                      <button
                        type="button"
                        className="p-2 text-muted-foreground hover:text-foreground"
                        onClick={() => toggleGroup(group.key)}
                        aria-expanded={isExpanded}
                        aria-label={`${isExpanded ? "Collapse" : "Expand"} ${group.key}`}
                      >
                        {isExpanded ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="ml-4 border-l pl-2">
                        {group.items.map((item) => (
                          <button
                            type="button"
                            key={item.key}
                            className={twMerge(
                              "mb-0.5 block w-full rounded-md px-2 py-1.5 text-left text-xs hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                              selectedItem?.key === item.key &&
                                "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary",
                            )}
                            onClick={() => setSelectedKey(item.key)}
                          >
                            <span className="block truncate">{item.label}</span>
                            {item.subtitle && (
                              <span
                                className={twMerge(
                                  "mt-0.5 block truncate text-[0.65rem] leading-tight text-muted-foreground",
                                  selectedItem?.key === item.key && "text-sidebar-primary-foreground/75",
                                )}
                              >
                                {item.subtitle}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          )}
          {sidebarCollapsed && (
            <nav aria-label="Collapsed game information" className="flex gap-1 overflow-x-auto p-1 lg:flex-col">
              {groups.map((group) => {
                const groupStyle = navigationGroupStyles[group.key] || { icon: Circle, color: "text-foreground" };
                const GroupIcon = groupStyle.icon;
                return (
                  <button
                    type="button"
                    key={group.key}
                    className={twMerge(
                      "flex size-8 shrink-0 items-center justify-center rounded-md border text-xs font-semibold hover:bg-sidebar-accent",
                      groupStyle.color,
                      group.items.some((item) => item.key === selectedItem?.key) &&
                        "bg-sidebar-primary text-sidebar-primary-foreground",
                    )}
                    onClick={() => group.items[0] && setSelectedKey(group.items[0].key)}
                    title={group.key}
                  >
                    <GroupIcon className="size-3.5" />
                  </button>
                );
              })}
            </nav>
          )}
        </aside>

        <main className="min-w-0 flex-1 overflow-x-auto">
          <div className="mb-3 border-b pb-2">
            <h1 className="text-base font-semibold">{selectedItem?.label}</h1>
            <p className="text-xs text-muted-foreground">
              {selectedItem?.subtitle || selectedGroup?.label}
            </p>
          </div>
          {selectedItem?.content}
        </main>
      </div>
    </div>
  );
}
