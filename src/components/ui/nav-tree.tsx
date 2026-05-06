"use client";

import { ReactNode } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { ChevronDown, ChevronRight, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { Button } from "@/components/ui/button";

export type NavTreeLeaf = {
  type: "leaf";
  key: string;
  label: ReactNode;
};

export type NavTreeGroup = {
  type: "group";
  key: string;
  label: ReactNode;
  subtitle?: ReactNode;
  children: NavTreeNode[];
};

export type NavTreeNode = NavTreeLeaf | NavTreeGroup;

/** Find a leaf node by key in the tree */
export function findLeaf(nodes: NavTreeNode[], key: string): NavTreeLeaf | undefined {
  for (const node of nodes) {
    if (node.type === "leaf") {
      if (node.key === key) return node;
    } else {
      const found = findLeaf(node.children, key);
      if (found) return found;
    }
  }
  return undefined;
}

/** Get all leaf keys in the tree, in order */
export function getAllLeafKeys(nodes: NavTreeNode[]): string[] {
  const keys: string[] = [];
  for (const node of nodes) {
    if (node.type === "leaf") {
      keys.push(node.key);
    } else {
      keys.push(...getAllLeafKeys(node.children));
    }
  }
  return keys;
}

interface NavTreeProps {
  nodes: NavTreeNode[];
  selectedKey: string;
  onSelect: (key: string) => void;
  storageKey: string;
}

export function NavTree({ nodes, selectedKey, onSelect, storageKey }: NavTreeProps) {
  const [isCollapsed, setIsCollapsed] = useLocalStorage(`${storageKey}:collapsed`, false);
  const defaultExpanded = nodes.filter((n) => n.type === "group").map((n) => n.key);
  const [expandedKeys, setExpandedKeys] = useLocalStorage<string[]>(`${storageKey}:expanded`, defaultExpanded);

  const toggleExpanded = (key: string) => {
    setExpandedKeys((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  };

  if (isCollapsed) {
    return (
      <div className="flex flex-col items-center py-2 border-r shrink-0">
        <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(false)} title="Expand navigation">
          <PanelLeftOpen className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col border-r w-52 shrink-0 overflow-y-auto">
      <div className="flex items-center justify-end p-1 border-b shrink-0">
        <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(true)} title="Collapse navigation">
          <PanelLeftClose className="h-4 w-4" />
        </Button>
      </div>
      <nav className="flex-1 p-1 space-y-0.5">
        {nodes.map((node) => renderNode(node, 0))}
      </nav>
    </div>
  );

  function renderNode(node: NavTreeNode, depth: number): ReactNode {
    if (node.type === "leaf") {
      const isSelected = selectedKey === node.key;
      return (
        <button
          key={node.key}
          onClick={() => onSelect(node.key)}
          className={twMerge(
            "w-full text-left py-1 rounded text-sm cursor-pointer hover:bg-accent transition-colors",
            isSelected && "bg-accent font-medium",
          )}
          style={{ paddingLeft: `${(depth + 1) * 12}px`, paddingRight: "8px" }}
        >
          {node.label}
        </button>
      );
    }

    const isExpanded = expandedKeys.includes(node.key);
    return (
      <div key={node.key}>
        <button
          onClick={() => toggleExpanded(node.key)}
          className="w-full text-left py-1 rounded text-sm cursor-pointer hover:bg-accent flex items-start gap-1 transition-colors"
          style={{ paddingLeft: `${(depth + 1) * 8}px`, paddingRight: "8px" }}
        >
          <span className="mt-0.5 shrink-0">
            {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          </span>
          <span className="flex flex-col min-w-0">
            <span className="font-semibold leading-tight">{node.label}</span>
            {node.subtitle && (
              <span className="text-xs text-muted-foreground leading-tight whitespace-normal">{node.subtitle}</span>
            )}
          </span>
        </button>
        {isExpanded && (
          <div className="space-y-0.5">{node.children.map((child) => renderNode(child, depth + 1))}</div>
        )}
      </div>
    );
  }
}
