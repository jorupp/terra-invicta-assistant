"use client";

import { Analysis } from "@/lib/analysis";
import { useEffect, useState } from "react";
import { ChevronDown, ChevronRight, Target, Users, BrainCircuit, MapPin, Shield, Ship, Pickaxe, Rocket, Zap } from "lucide-react";
import { MissionControl, PrioritySpoils, Boost } from "@/components/icons";

export type TreeSectionId =
  | "councilors-score"
  | "councilors-existing"
  | "councilors-new"
  | "councilors-orgs"
  | "councilors-takeover"
  | "councilors-missions"
  | "councilors-other"
  | "fleets-alien"
  | "fleets-human"
  | "fleets-player"
  | "fleets-construction"
  | "habs-current-bonuses"
  | "habs-future-bonuses"
  | "habs-boost-mc"
  | "habs-alien-hate"
  | "habs-buildings"
  | "habs-projects"
  | "habs-tech-goals"
  | "habs-habs"
  | "habs-mines"
  | "resources-transactions"
  | "resources-owned"
  | "resources-spoils"
  | "resources-mcboost"
  | "resources-claims"
  | "resources-unification"
  | "drives-systems"
  | "drives-calculator";

interface TreeItem {
  id: string;
  label: string;
  subtitle?: string;
  icon?: React.ComponentType<{ className?: string }>;
  children?: TreeItem[];
}

// Minimal scoring helpers just for tree labels
function getTreeItems(analysis: Analysis): TreeItem[] {
  const { playerMissionCounts, playerHabs, playerFaction, playerFleets, alienFleetsToPlayerOrbits, humanEnemyFleetsToPlayerOrbits, playerShipsUnderConstruction } = analysis;

  // Quick scoring for councilors (just use basic counts for labels)
  const worstExistingCouncilor = analysis.playerCouncilors.length > 0 ? "~" : "0";
  const bestAvailableCouncilor = analysis.playerAvailableCouncilors.length > 0 ? "~" : "0";

  const missingMines = playerHabs.filter((h) => h.missingMine);
  const unnecessaryFactoryHabs = playerHabs.filter((h) => h.hasUnnecessaryFactory);
  const upgradablePowerHabs = playerHabs.filter((h) => h.canUpgradePower);

  // Resources summary
  const spoils = playerFaction.monthlyTransactionSummary
    .filter((i) => i.resource === "Money" && i.source === "Spoils")
    .reduce((sum, i) => sum + i.amount, 0);

  // Fleets urgency
  const byTarget = alienFleetsToPlayerOrbits.reduce((acc, fleet) => {
    const key = fleet.planetName || "Unknown Orbit";
    if (!acc.has(key)) acc.set(key, []);
    acc.get(key)!.push(fleet);
    return acc;
  }, new Map<string, typeof alienFleetsToPlayerOrbits>());

  const urgentPlanets = [...byTarget.entries()]
    .filter(([_, fleets]) => {
      const active = fleets.filter((f) => f.deltaV > 0 && (f.daysToTarget || 0) > 0);
      return active.some((f) => (f.daysToTarget || 999) < 60);
    })
    .map(([key]) => key);

  return [
    {
      id: "councilors",
      label: "Councilors",
      icon: Users,
      children: [
        {
          id: "councilors-score",
          label: "Score Overview",
          subtitle: worstExistingCouncilor + " vs " + bestAvailableCouncilor,
          icon: Target,
        },
        {
          id: "councilors-existing",
          label: "Existing Council",
          subtitle: "Scored councilors & orgs",
          icon: Users,
        },
        {
          id: "councilors-new",
          label: "Find New",
          subtitle: "Available councilors",
          icon: Target,
        },
        {
          id: "councilors-orgs",
          label: "Organizations",
          subtitle: "Owned orgs",
          icon: BrainCircuit,
        },
        {
          id: "councilors-takeover",
          label: "Hostile Takeover",
          subtitle: "Steal orgs",
          icon: Zap,
        },
        {
          id: "councilors-missions",
          label: "Missions",
          subtitle: "Mission sources",
          icon: MissionControl,
        },
        {
          id: "councilors-other",
          label: "Other Councilors",
          subtitle: "Other factions",
          icon: Users,
        },
      ],
    },
    {
      id: "fleets",
      label: "Fleets",
      icon: Ship,
      children: [
        {
          id: "fleets-alien",
          label: "Alien Fleets",
          subtitle: urgentPlanets.length > 0
            ? urgentPlanets.slice(0, 3).join(", ") + (urgentPlanets.length > 3 ? "..." : "")
            : "None detected",
          icon: Shield,
        },
        {
          id: "fleets-human",
          label: "Human Fleets",
          subtitle: humanEnemyFleetsToPlayerOrbits.length > 0
            ? humanEnemyFleetsToPlayerOrbits.length + " fleet(s)"
            : "None detected",
          icon: Shield,
        },
        {
          id: "fleets-player",
          label: "Player Fleets",
          subtitle: playerFleets.length + " fleet(s)",
          icon: Ship,
        },
        {
          id: "fleets-construction",
          label: "Under Construction",
          subtitle: playerShipsUnderConstruction.length + " ships",
          icon: Ship,
        },
      ],
    },
    {
      id: "habs",
      label: "Habs",
      icon: MapPin,
      children: [
        {
          id: "habs-current-bonuses",
          label: "Current Bonuses",
          subtitle: playerHabs.length + " habs",
          icon: BrainCircuit,
        },
        {
          id: "habs-future-bonuses",
          label: "Future Bonuses",
          subtitle: "Including unpowered",
          icon: BrainCircuit,
        },
        {
          id: "habs-boost-mc",
          label: "MC/Boost Income",
          subtitle: playerFaction.nationHistory.currentMC.toFixed(0) + " MC",
          icon: MissionControl,
        },
        {
          id: "habs-alien-hate",
          label: "Alien Hate",
          subtitle: "Alien strategy & goals",
          icon: Shield,
        },
        {
          id: "habs-buildings",
          label: "Buildings",
          subtitle: "Building summary",
          icon: Pickaxe,
        },
        {
          id: "habs-projects",
          label: "Projects",
          subtitle: "Available projects",
          icon: Rocket,
        },
        {
          id: "habs-tech-goals",
          label: "Tech Goals",
          subtitle: "Research goals",
          icon: Rocket,
        },
        {
          id: "habs-habs",
          label: "Manage Habs",
          subtitle: missingMines.length + " missing" +
                   (unnecessaryFactoryHabs.length > 0 ? " | " + unnecessaryFactoryHabs.length : "") +
                   (upgradablePowerHabs.length > 0 ? " | " + upgradablePowerHabs.length + " pw" : ""),
          icon: MapPin,
        },
        {
          id: "habs-mines",
          label: "Manage Mines",
          subtitle: "Mining details",
          icon: Pickaxe,
        },
      ],
    },
    {
      id: "resources",
      label: "Resources",
      icon: PrioritySpoils,
      children: [
        {
          id: "resources-transactions",
          label: "Transactions",
          subtitle: "Income matrix",
          icon: PrioritySpoils,
        },
        {
          id: "resources-owned",
          label: "Owned Nations",
          subtitle: "Scored nations",
          icon: MapPin,
        },
        {
          id: "resources-spoils",
          label: "Spoil Targets",
          subtitle: spoils.toFixed(0) + " spoils/mo",
          icon: PrioritySpoils,
        },
        {
          id: "resources-mcboost",
          label: "MC/Boost Targets",
          subtitle: "MC & boost targets",
          icon: Boost,
        },
        {
          id: "resources-claims",
          label: "Nation Claims",
          subtitle: "Claim targets",
          icon: Target,
        },
        {
          id: "resources-unification",
          label: "Unification",
          subtitle: "Unification candidates",
          icon: Target,
        },
      ],
    },
    {
      id: "drives",
      label: "Drives",
      icon: Rocket,
      children: [
        {
          id: "drives-systems",
          label: "Drive Systems",
          subtitle: "All drives & ratings",
          icon: Rocket,
        },
        {
          id: "drives-calculator",
          label: "Drive Calculator",
          subtitle: "Ship delta-V calculator",
          icon: Rocket,
        },
      ],
    },
  ];
}

function getAllNodeIds(node: TreeItem): string[] {
  const ids = [node.id];
  if (node.children) {
    for (const child of node.children) {
      ids.push(...getAllNodeIds(child));
    }
  }
  return ids;
}

function TreeBranch({
  node,
  depth,
  activeId,
  onSectionSelect,
}: {
  node: TreeItem;
  depth: number;
  activeId: TreeSectionId | null;
  onSectionSelect: (id: TreeSectionId) => void;
}) {
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    if (activeId) {
      const nodeIds = getAllNodeIds(node);
      if (nodeIds.includes(activeId)) {
        setIsOpen(true);
      }
    }
  }, [activeId, node]);

  const Icon = node.icon;

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{ paddingLeft: depth * 12 + 4 }}
        className="w-full flex items-center gap-1 py-1 text-left text-xs font-medium transition-colors select-none cursor-pointer hover:bg-muted/50 text-foreground"
      >
        <span className="h-3 w-3 shrink-0">
          {isOpen ? (
            <ChevronDown className="h-3 w-3" />
          ) : (
            <ChevronRight className="h-3 w-3" />
          )}
        </span>
        {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}
        <span className="truncate">{node.label}</span>
      </button>
      {isOpen && node.children && (
        <div>
          {node.children.map((child) => renderLeaf(child, depth + 1, activeId, onSectionSelect))}
        </div>
      )}
    </div>
  );
}

function renderLeaf(
  node: TreeItem,
  depth: number,
  activeId: TreeSectionId | null,
  onSectionSelect: (id: TreeSectionId) => void,
) {
  const isActive = activeId === node.id;
  const paddingLeft = depth * 12 + 4;

  return (
    <button
      key={node.id}
      data-section-id={node.id}
      onClick={() => onSectionSelect(node.id as TreeSectionId)}
      style={{ paddingLeft: paddingLeft + 8 }}
      className={`w-full flex flex-col items-start py-1 text-left text-xs transition-colors select-none cursor-pointer ${
        isActive
          ? "text-foreground bg-muted font-medium"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
      }`}
    >
      <span className="flex items-center gap-1 w-full truncate">
        {node.icon && <node.icon className="h-3 w-3 shrink-0" />}
        <span className="truncate">{node.label}</span>
      </span>
      {node.subtitle && (
        <span className={`truncate ml-4 text-[10px] ${isActive ? "text-muted-foreground" : "text-muted-foreground/70"}`}>
          {node.subtitle}
        </span>
      )}
    </button>
  );
}

function TreeNavigation({
  items,
  activeId,
  onSectionSelect,
}: {
  items: TreeItem[];
  activeId: TreeSectionId | null;
  onSectionSelect: (id: TreeSectionId) => void;
}) {
  return (
    <nav className="w-56 shrink-0 overflow-y-auto overflow-x-hidden border-r py-2 pr-2">
      {items.map((node) => (
        <TreeBranch key={node.id} node={node} depth={0} activeId={activeId} onSectionSelect={onSectionSelect} />
      ))}
    </nav>
  );
}

export { TreeNavigation, getTreeItems };
export type { TreeItem };
