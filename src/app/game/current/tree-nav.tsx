"use client";

import * as React from "react";
import { ChevronRightIcon, ChevronDownIcon, Dot } from "lucide-react";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export type TreeNode = TreeFolderNode | TreeLeafNode;

export interface TreeFolderNode {
  type: "folder";
  key: string;
  label: React.ReactNode;
  children: TreeNode[];
  defaultValue?: boolean;
}

export interface TreeLeafNode {
  type: "leaf";
  key: string;
  label: React.ReactNode;
  contentKey: string;
  selected?: boolean;
  onSelect?: () => void;
}

export interface TreeNavProps {
  nodes: TreeNode[];
  storageKey: string;
  className?: string;
}

export function TreeNav({ nodes, storageKey, className }: TreeNavProps) {
  const [expanded, setExpanded] = React.useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(`treeNav-${storageKey}`);
      if (stored) return new Set(JSON.parse(stored));
    } catch {}
    const defaults = new Set<string>();
    nodes.forEach((n) => collectDefaults(n, defaults));
    return defaults;
  });

  React.useEffect(() => {
    try {
      localStorage.setItem(`treeNav-${storageKey}`, JSON.stringify([...expanded]));
    } catch {}
  }, [expanded, storageKey]);

  const toggle = React.useCallback(
    (key: string) => {
      setExpanded((prev) => {
        const next = new Set(prev);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        return next;
      });
    },
    [],
  );

  return (
    <nav className={cn("flex flex-col gap-0.5", className)}>
      {nodes.map((node) => (
        <TreeNodeItem key={node.key} node={node} expanded={expanded} onToggle={toggle} />
      ))}
    </nav>
  );
}

function TreeNodeItem({
  node,
  expanded,
  onToggle,
}: {
  node: TreeNode;
  expanded: Set<string>;
  onToggle: (key: string) => void;
}) {
  if (node.type === "folder") {
    const isExpanded = expanded.has(node.key);
    return (
      <div className="flex flex-col">
        <Collapsible open={isExpanded} onOpenChange={() => onToggle(node.key)}>
          <CollapsibleTrigger asChild>
            <button
              className={cn(
                "flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-muted/80",
                "font-medium",
              )}
            >
              <span className="transition-transform duration-200">
                {isExpanded ? (
                  <ChevronDownIcon className="h-3.5 w-3.5 shrink-0 opacity-60" />
                ) : (
                  <ChevronRightIcon className="h-3.5 w-3.5 shrink-0 opacity-60" />
                )}
              </span>
              <span className="truncate">{node.label}</span>
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="ml-3 pl-2 border-l border-muted-foreground/20 space-y-0.5">
              {node.children.map((child) => (
                <TreeNodeItem key={child.key} node={child} expanded={expanded} onToggle={onToggle} />
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  }

  // leaf
  return (
    <button
      onClick={node.onSelect}
      className={cn(
        "flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-muted/80",
        "text-muted-foreground hover:text-foreground",
        node.selected && "bg-muted font-medium text-foreground",
      )}
    >
      <Dot className="h-3.5 w-3.5 shrink-0 opacity-60" />
      <span className="truncate">{node.label}</span>
    </button>
  );
}

function collectDefaults(node: TreeNode, set: Set<string>) {
  if (node.type === "folder" && node.defaultValue !== false) {
    set.add(node.key);
  }
  if (node.type === "folder") {
    for (const child of node.children) {
      collectDefaults(child, set);
    }
  }
}
