"use client";

import * as React from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
import { twMerge } from "tailwind-merge";

export interface TreeNode {
  label: string;
  subtitle?: string;
  value: string;
  children?: TreeNode[];
}

export interface SidebarNavProps {
  nodes: TreeNode[];
  selectedValue: string;
  onSelect: (value: string) => void;
}

export function SidebarNav({ nodes, selectedValue, onSelect }: SidebarNavProps) {
  return (
    <nav className="w-64 min-h-screen border-r bg-card p-2 overflow-y-auto">
      <TreeNodeList nodes={nodes} selectedValue={selectedValue} onSelect={onSelect} />
    </nav>
  );
}

function TreeNodeList({
  nodes,
  selectedValue,
  onSelect,
}: {
  nodes: TreeNode[];
  selectedValue: string;
  onSelect: (value: string) => void;
}) {
  return (
    <ul className="space-y-0.5">
      {nodes.map((node) => (
        <TreeNodeItem key={node.value} node={node} selectedValue={selectedValue} onSelect={onSelect} />
      ))}
    </ul>
  );
}

function TreeNodeItem({
  node,
  selectedValue,
  onSelect,
}: {
  node: TreeNode;
  selectedValue: string;
  onSelect: (value: string) => void;
}) {
  const [collapsed, setCollapsed] = React.useState(true);
  const hasChildren = !!node.children;
  const isSelected = selectedValue === node.value;

  const handleClick = () => {
    onSelect(node.value);
    if (hasChildren) {
      setCollapsed((prev) => !prev);
    }
  };

  return (
    <li>
      <button
        onClick={handleClick}
        className={twMerge(
          "w-full flex items-center gap-1 py-1 px-2 rounded text-left hover:bg-accent text-sm",
          isSelected ? "bg-accent font-medium" : ""
        )}
      >
        {hasChildren && (
          <span className="flex-shrink-0">
            {collapsed ? (
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            )}
          </span>
        )}
        {!hasChildren && <span className="w-4" />}
        <span className="flex-1 truncate">{node.label}</span>
        {node.subtitle && (
          <span className="text-xs text-muted-foreground truncate">{node.subtitle}</span>
        )}
      </button>
      {hasChildren && node.children && (
        <div className={twMerge("overflow-hidden", collapsed ? "h-0" : "h-auto")}>
          <TreeNodeList nodes={node.children} selectedValue={selectedValue} onSelect={onSelect} />
        </div>
      )}
    </li>
  );
}
