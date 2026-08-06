"use client";

import { ChevronDown, ChevronRight, ListTree, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useMemo } from "react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Analysis } from "@/lib/analysis";
import { getCouncilorsUi } from "./councilors";
import { getFleetsUi } from "./fleets";
import { getHabsUi } from "./habs";
import { getResourcesUi } from "./resources";
import { getDrivesUi } from "./drives";

type NavigationChild = {
  key: string;
  label: string;
  subtitle?: ReactNode;
};

type NavigationGroup = {
  key: string;
  label: string;
  children: NavigationChild[];
  subtitle?: ReactNode;
  content?: ReactNode;
};

function buildNavigationGroups(analysis: Analysis): NavigationGroup[] {
  const habChildren: NavigationChild[] = [
    { key: "habs-current-bonuses", label: "Current bonuses" },
    { key: "habs-future-bonuses", label: "Future bonuses" },
    { key: "habs-boost-mc-summary", label: "MC/Boost income" },
    { key: "habs-alien-hate", label: "Alien hate" },
    { key: "habs-building-details", label: "Building details" },
  ];

  if (analysis.playerFaction.availableBoostProjects.length > 0) {
    habChildren.push({ key: "habs-available-boost-projects", label: "Available boost projects" });
  }
  if (analysis.playerFaction.availableCPProjects.length > 0) {
    habChildren.push({ key: "habs-available-cp-projects", label: "Available control point projects" });
  }
  if (analysis.playerFaction.availableMaxOrgProjects.length > 0) {
    habChildren.push({ key: "habs-available-max-org-projects", label: "Available max org projects" });
  }
  if (analysis.playerFaction.availableExpandNationProjects.length > 0) {
    habChildren.push({ key: "habs-available-expand-nation-projects", label: "Available expand nations" });
  }
  if (analysis.playerStealableProjects.length > 0) {
    habChildren.push({ key: "habs-available-stealable-projects", label: "Available stealable projects" });
  }

  habChildren.push(
    { key: "habs-technology-goals", label: "Technology goals" },
    { key: "habs-habs", label: "Manage habs" },
    { key: "habs-mines", label: "Manage mines" },
  );

  return [
    {
      key: "councilors",
      label: "Councilors",
      children: [
        { key: "councilors-existing", label: "Existing council" },
        { key: "councilors-new-councilors", label: "Find new" },
        { key: "councilors-current-orgs", label: "Current organizations" },
        { key: "councilors-takeover", label: "Hostile takeover" },
        { key: "councilors-missions", label: "Missions" },
        { key: "councilors-other-councilors", label: "Other councilors" },
      ],
    },
    {
      key: "fleets",
      label: "Fleets",
      children: [
        { key: "fleets-alien-fleets", label: "Alien fleets" },
        { key: "fleets-human-enemy-fleets", label: "Other human factions" },
        { key: "fleets-player-fleets", label: "Player fleets" },
        { key: "fleets-ships-under-construction", label: "Ships under construction" },
      ],
    },
    {
      key: "habs",
      label: "Habs",
      children: habChildren,
    },
    {
      key: "resources",
      label: "Resources",
      children: [
        { key: "resources-transactions", label: "Transactions" },
        { key: "resources-owned", label: "Owned nations" },
        { key: "resources-spoils", label: "Spoil targets" },
        { key: "resources-space", label: "MC/Boost targets" },
        { key: "resources-nation-claims", label: "Nation claims" },
        { key: "resources-unification-candidates", label: "Unification candidates" },
      ],
    },
    {
      key: "drives",
      label: "Drives",
      children: [
        { key: "drives-drive-table", label: "Drive systems" },
        { key: "drives-drive-calculator", label: "Drive calculator" },
      ],
    },
  ];
}

function sectionFor(groupKey: string, activeKey: string, fallback: string) {
  return activeKey.startsWith(`${groupKey}-`) ? activeKey.slice(groupKey.length + 1) : fallback;
}

function GameNavigation({
  groups,
  activeKey,
  onSelect,
}: {
  groups: NavigationGroup[];
  activeKey: string;
  onSelect: (key: string) => void;
}) {
  const [collapsed, setCollapsed] = useLocalStorage("game-navigation-collapsed", false);
  const [expanded, setExpanded] = useLocalStorage(
    "game-navigation-expanded",
    groups.map((group) => group.key),
  );

  const activeGroupKey = groups.find((group) => group.children.some((child) => child.key === activeKey))?.key;

  const toggleGroup = (key: string) => {
    setExpanded(expanded.includes(key) ? expanded.filter((item) => item !== key) : [...expanded, key]);
  };

  return (
    <aside
      className={cn(
        "sticky top-2 shrink-0 self-start rounded-lg border bg-card text-card-foreground transition-[width] duration-200",
        collapsed ? "w-11" : "w-64",
      )}
    >
      <div className="flex items-center justify-between border-b p-2">
        {!collapsed && <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Game</span>}
        <button
          type="button"
          className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expand game navigation" : "Collapse game navigation"}
          title={collapsed ? "Expand game navigation" : "Collapse game navigation"}
        >
          {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
        </button>
      </div>

      {collapsed ? (
        <div className="flex justify-center p-2">
          <ListTree className="size-4 text-muted-foreground" />
        </div>
      ) : (
        <nav aria-label="Game information" className="max-h-[calc(100vh-10rem)] overflow-y-auto p-1">
          {groups.map((group) => {
            const isActiveGroup = group.key === activeGroupKey;
            const isExpanded = expanded.includes(group.key);
            const firstChild = group.children[0];

            return (
              <div key={group.key}>
                <div className={cn("flex items-start rounded-md", isActiveGroup && "bg-muted/70")}>
                  <button
                    type="button"
                    className="mt-1 inline-flex size-6 shrink-0 items-center justify-center rounded text-muted-foreground hover:text-foreground"
                    onClick={() => toggleGroup(group.key)}
                    aria-label={`${isExpanded ? "Collapse" : "Expand"} ${group.label}`}
                    aria-expanded={isExpanded}
                  >
                    {isExpanded ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
                  </button>
                  <button
                    type="button"
                    className="min-w-0 flex-1 px-1 py-1.5 text-left"
                    onClick={() => {
                      if (!isExpanded) {
                        setExpanded([...expanded, group.key]);
                      }
                      onSelect(firstChild.key);
                    }}
                  >
                    <span className="block truncate text-xs font-semibold">{group.label}</span>
                    {group.subtitle && (
                      <span className="block truncate text-[0.65rem] leading-tight text-muted-foreground">
                        {group.subtitle}
                      </span>
                    )}
                  </button>
                </div>

                {isExpanded && (
                  <div className="ml-4 border-l pl-1">
                    {group.children.map((child) => {
                      const isActive = child.key === activeKey;
                      return (
                        <button
                          type="button"
                          key={child.key}
                          className={cn(
                            "my-0.5 block w-full rounded-md px-2 py-1.5 text-left text-xs transition-colors hover:bg-muted",
                            isActive && "bg-primary text-primary-foreground hover:bg-primary/90",
                          )}
                          onClick={() => onSelect(child.key)}
                          aria-current={isActive ? "page" : undefined}
                        >
                          <span className="block truncate">{child.label}</span>
                          {child.subtitle && (
                            <span
                              className={cn(
                                "block truncate text-[0.65rem] leading-tight text-muted-foreground",
                                isActive && "text-primary-foreground/75",
                              )}
                            >
                              {child.subtitle}
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
      )}
    </aside>
  );
}

export function RenderGameComponent({ analysis }: { analysis: Analysis }) {
  const navigationGroups = useMemo(() => buildNavigationGroups(analysis), [analysis]);
  const validKeys = useMemo(
    () => new Set(navigationGroups.flatMap((group) => group.children.map((child) => child.key))),
    [navigationGroups],
  );
  const [storedActiveKey, setStoredActiveKey] = useLocalStorage("game-navigation-active", "councilors-existing");
  const activeKey = validKeys.has(storedActiveKey) ? storedActiveKey : "councilors-existing";

  const councilorsUi = getCouncilorsUi(analysis, sectionFor("councilors", activeKey, "existing"));
  const fleetsUi = getFleetsUi(analysis, sectionFor("fleets", activeKey, "alien-fleets"));
  const habsUi = getHabsUi(analysis, sectionFor("habs", activeKey, "current-bonuses"));
  const resourcesUi = getResourcesUi(analysis, sectionFor("resources", activeKey, "transactions"));
  const drivesUi = getDrivesUi(analysis, sectionFor("drives", activeKey, "drive-table"));

  const groups: NavigationGroup[] = [
    { ...navigationGroups[0], subtitle: councilorsUi.summary, content: councilorsUi.content },
    { ...navigationGroups[1], subtitle: fleetsUi.summary, content: fleetsUi.content },
    { ...navigationGroups[2], subtitle: habsUi.summary, content: habsUi.content },
    { ...navigationGroups[3], subtitle: resourcesUi.summary, content: resourcesUi.content },
    { ...navigationGroups[4], subtitle: drivesUi.summary, content: drivesUi.content },
  ];
  const activeGroup = groups.find((group) => group.children.some((child) => child.key === activeKey)) || groups[0];
  const activeChild = activeGroup.children.find((child) => child.key === activeKey) || activeGroup.children[0];

  return (
    <div className="mx-2">
      <header className="mb-3">
        <h2>
          Game: {analysis.fileName} ({analysis.lastModified?.toLocaleString()}) - Game date:{" "}
          {analysis.gameCurrentDateTimeFormatted.split(" ")[0]}
        </h2>
        <h3>Faction: {analysis.playerFaction.displayName}</h3>
      </header>

      <div className="flex items-start gap-3">
        <GameNavigation groups={groups} activeKey={activeChild.key} onSelect={setStoredActiveKey} />
        <main className="min-w-0 flex-1">
          <div className="mb-2">
            <h1 className="text-base font-semibold">{activeChild.label}</h1>
            <p className="text-xs text-muted-foreground">{activeGroup.label}</p>
          </div>
          <div className="min-w-0 overflow-x-auto rounded-lg border bg-card/30 p-2">{activeGroup.content}</div>
        </main>
      </div>
    </div>
  );
}
