"use client";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Analysis } from "@/lib/analysis";
import { ChevronDown, ChevronRight } from "lucide-react";
import { ReactNode, useState } from "react";
import { getCouncilorsUi } from "./councilors";
import { getDrivesUi } from "./drives";
import { getFleetsUi } from "./fleets";
import { getHabsUi } from "./habs";
import { getResourcesUi } from "./resources";

type NavigationChild = {
  key: string;
  label: string;
};

type NavigationNode = {
  key: string;
  label: string;
  summary: ReactNode;
  children: NavigationChild[];
};

const navigationChildren = {
  councilors: [
    { key: "existing", label: "Existing Council" },
    { key: "new-councilors", label: "Find new" },
    { key: "current-orgs", label: "Current Organizations" },
    { key: "takeover", label: "Hostile Takeover" },
    { key: "missions", label: "Missions" },
    { key: "other-councilors", label: "Other Councilors" },
  ],
  fleets: [
    { key: "alien-fleets", label: "Alien Fleets" },
    { key: "human-enemy-fleets", label: "Other Human Factions" },
    { key: "player-fleets", label: "Player Fleets" },
    { key: "ships-under-construction", label: "Ships Under Construction" },
  ],
  resources: [
    { key: "transactions", label: "Transactions" },
    { key: "owned", label: "Owned nations" },
    { key: "spoils", label: "Spoil targets" },
    { key: "space", label: "MC/Boost targets" },
    { key: "nation-claims", label: "Nation Claims" },
    { key: "unification-candidates", label: "Unification Candidates" },
  ],
  drives: [
    { key: "drive-table", label: "Drive Systems" },
    { key: "drive-calculator", label: "Drive Calculator" },
  ],
} satisfies Record<string, NavigationChild[]>;

function getSection(route: string, category: string) {
  return route.startsWith(`${category}:`) ? route.slice(category.length + 1) : undefined;
}

function GameNavigation({
  nodes,
  activeRoute,
  onSelect,
}: {
  nodes: NavigationNode[];
  activeRoute: string;
  onSelect: (route: string) => void;
}) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>(
    Object.fromEntries(nodes.map((node) => [node.key, true])),
  );

  return (
    <aside className="min-w-0 rounded-md border bg-card text-card-foreground">
      <div className="border-b px-3 py-2 text-sm font-semibold">Game information</div>
      <nav className="p-1" aria-label="Game information">
        {nodes.map((node) => {
          const isCategoryActive = activeRoute.startsWith(`${node.key}:`);
          const firstChild = node.children[0];
          return (
            <Collapsible
              key={node.key}
              open={expanded[node.key]}
              onOpenChange={(open) => setExpanded((current) => ({ ...current, [node.key]: open }))}
            >
              <div className="flex items-start">
                <button
                  type="button"
                  className={`min-w-0 flex-1 rounded-sm px-2 py-1.5 text-left transition-colors hover:bg-muted ${
                    isCategoryActive ? "bg-muted" : ""
                  }`}
                  onClick={() => {
                    setExpanded((current) => ({ ...current, [node.key]: true }));
                    onSelect(`${node.key}:${firstChild.key}`);
                  }}
                >
                  <div className="font-medium">{node.label}</div>
                  <div className="truncate text-[0.6875rem] leading-tight text-muted-foreground">{node.summary}</div>
                </button>
                <CollapsibleTrigger asChild>
                  <button
                    type="button"
                    className="mt-1 rounded-sm p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                    aria-label={`${expanded[node.key] ? "Collapse" : "Expand"} ${node.label}`}
                  >
                    {expanded[node.key] ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
                  </button>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent>
                <div className="ml-3 border-l pl-2">
                  {node.children.map((child) => {
                    const route = `${node.key}:${child.key}`;
                    const isActive = activeRoute === route;
                    return (
                      <button
                        key={child.key}
                        type="button"
                        aria-current={isActive ? "page" : undefined}
                        className={`block w-full rounded-sm px-2 py-1.5 text-left text-xs transition-colors hover:bg-muted ${
                          isActive ? "bg-primary/10 font-medium text-primary" : "text-muted-foreground"
                        }`}
                        onClick={() => onSelect(route)}
                      >
                        {child.label}
                      </button>
                    );
                  })}
                </div>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </nav>
    </aside>
  );
}

export function RenderGameComponent({ analysis }: { analysis: Analysis }) {
  const [activeRoute, setActiveRoute] = useLocalStorage("gameNavigation", "councilors:existing");
  const [activeCategory, activeSection] = activeRoute.split(":");
  const validSections: Record<string, string[]> = {
    councilors: navigationChildren.councilors.map((child) => child.key),
    fleets: navigationChildren.fleets.map((child) => child.key),
    resources: navigationChildren.resources.map((child) => child.key),
    drives: navigationChildren.drives.map((child) => child.key),
    habs: [
      "current-bonuses",
      "future-bonuses",
      "boost-mc-summary",
      "alien-hate",
      "building-details",
      ...(analysis.playerFaction.availableBoostProjects.length > 0 ? ["available-boost-projects"] : []),
      ...(analysis.playerFaction.availableCPProjects.length > 0 ? ["available-cp-projects"] : []),
      ...(analysis.playerFaction.availableMaxOrgProjects.length > 0 ? ["available-max-org-projects"] : []),
      ...(analysis.playerFaction.availableExpandNationProjects.length > 0 ? ["available-expand-nation-projects"] : []),
      ...(analysis.playerStealableProjects.length > 0 ? ["available-stealable-projects"] : []),
      "technology-goals",
      "habs",
      "mines",
    ],
  };
  const routeIsValid = validSections[activeCategory]?.includes(activeSection) ?? false;
  const selectedRoute = routeIsValid ? activeRoute : "councilors:existing";

  const councilors = getCouncilorsUi(analysis, getSection(selectedRoute, "councilors"));
  const fleets = getFleetsUi(analysis, getSection(selectedRoute, "fleets"));
  const habs = getHabsUi(analysis, getSection(selectedRoute, "habs"));
  const resources = getResourcesUi(analysis, getSection(selectedRoute, "resources"));
  const drives = getDrivesUi(analysis, getSection(selectedRoute, "drives"));

  const habChildren = [
    { key: "current-bonuses", label: "Current Bonuses" },
    { key: "future-bonuses", label: "Future Bonuses" },
    { key: "boost-mc-summary", label: "MC/Boost Income Summary" },
    { key: "alien-hate", label: "Alien Hate" },
    { key: "building-details", label: "Building Details" },
    ...(analysis.playerFaction.availableBoostProjects.length > 0
      ? [{ key: "available-boost-projects", label: "Available Boost Projects" }]
      : []),
    ...(analysis.playerFaction.availableCPProjects.length > 0
      ? [{ key: "available-cp-projects", label: "Available Control Point Projects" }]
      : []),
    ...(analysis.playerFaction.availableMaxOrgProjects.length > 0
      ? [{ key: "available-max-org-projects", label: "Available Max Org Projects" }]
      : []),
    ...(analysis.playerFaction.availableExpandNationProjects.length > 0
      ? [{ key: "available-expand-nation-projects", label: "Available Expand Nations" }]
      : []),
    ...(analysis.playerStealableProjects.length > 0
      ? [{ key: "available-stealable-projects", label: "Available Stealable Projects" }]
      : []),
    { key: "technology-goals", label: "Technology Goals" },
    { key: "habs", label: "Manage Habs" },
    { key: "mines", label: "Manage Mines" },
  ];

  const nodes: NavigationNode[] = [
    { key: "councilors", label: "Councilors", summary: councilors.tab, children: navigationChildren.councilors },
    { key: "fleets", label: "Fleets", summary: fleets.tab, children: navigationChildren.fleets },
    { key: "habs", label: "Habs", summary: habs.tab, children: habChildren },
    { key: "resources", label: "Resources", summary: resources.tab, children: navigationChildren.resources },
    { key: "drives", label: "Drives", summary: drives.tab, children: navigationChildren.drives },
  ];

  const selectedCategory = selectedRoute.split(":")[0];
  const contentByCategory = {
    councilors: councilors.content,
    fleets: fleets.content,
    habs: habs.content,
    resources: resources.content,
    drives: drives.content,
  };
  const content = contentByCategory[selectedCategory as keyof typeof contentByCategory];

  return (
    <div className="mx-2 space-y-2">
      <div>
        <h2>
          Game: {analysis.fileName} ({analysis.lastModified?.toLocaleString()}) - Game date:{" "}
          {analysis.gameCurrentDateTimeFormatted.split(" ")[0]}
        </h2>
        <h3>Faction: {analysis.playerFaction.displayName}</h3>
      </div>

      <div className="grid min-w-0 grid-cols-[minmax(12rem,16rem)_minmax(0,1fr)] items-start gap-3">
        <GameNavigation nodes={nodes} activeRoute={selectedRoute} onSelect={setActiveRoute} />
        <main className="min-w-0">{content}</main>
      </div>
    </div>
  );
}
