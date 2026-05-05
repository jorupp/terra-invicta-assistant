"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronRight, ChevronDown } from "lucide-react";

export interface TreeNavItem {
  key: string;
  label: string;
  subtitle?: string;
  icon?: React.ComponentType<{ className?: string }>;
  children?: TreeNavItem[];
  content?: React.ReactNode;
}

interface TreeNavigationProps {
  items: TreeNavItem[];
  selectedItemKey: string | null;
  onSelect: (key: string) => void;
  storageKey: string;
}

function TreeNode({
  node,
  depth,
  selectedItemKey,
  onSelect,
  expandedKeys,
  onToggle,
}: {
  node: TreeNavItem;
  depth: number;
  selectedItemKey: string | null;
  onSelect: (key: string) => void;
  expandedKeys: Set<string>;
  onToggle: (key: string) => void;
}) {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedKeys.has(node.key);
  const isSelected = selectedItemKey === node.key;
  const hasSelectedDescendant = hasChildren && node.children!.some((child) => isSelected || hasSelectedChild(child, selectedItemKey));

  function hasSelectedChild(n: TreeNavItem, key: string | null): boolean {
    if (key === n.key) return true;
    return n.children?.some((c) => hasSelectedChild(c, key)) || false;
  }

  const Icon = node.icon;

  return (
    <div>
      <button
        onClick={() => {
          if (hasChildren) {
            onToggle(node.key);
          }
          onSelect(node.key);
        }}
        className={cn(
          "w-full flex items-center gap-1.5 py-1.5 px-2 rounded-md text-left transition-colors cursor-pointer select-none",
          "hover:bg-accent hover:text-accent-foreground",
          isSelected
            ? "bg-accent text-accent-foreground font-medium"
            : hasSelectedDescendant
              ? "text-muted-foreground"
              : "text-foreground",
        )}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        title={node.subtitle || undefined}
      >
        {hasChildren ? (
          <span className="shrink-0">
            {isExpanded ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
          </span>
        ) : (
          <span className="w-4.5 shrink-0" />
        )}
        {Icon && <Icon className="h-4 w-4 shrink-0" />}
        <span className="flex-1 min-w-0">
          <span className={cn("text-sm truncate block", !node.subtitle && "font-medium")}>{node.label}</span>
          {node.subtitle && (
            <span className={cn("text-xs truncate block", isSelected && "text-accent-foreground")}>
              {node.subtitle}
            </span>
          )}
        </span>
      </button>
      {hasChildren && isExpanded && (
        <div>
          {node.children!.map((child) => (
            <TreeNode
              key={child.key}
              node={child}
              depth={depth + 1}
              selectedItemKey={selectedItemKey}
              onSelect={onSelect}
              expandedKeys={expandedKeys}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function TreeNavigation({ items, selectedItemKey, onSelect, storageKey }: TreeNavigationProps) {
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(`treeExpanded-${storageKey}`);
      if (stored) {
        return new Set(JSON.parse(stored) as string[]);
      }
    } catch {}
    const defaults = new Set<string>();
    items.forEach((item) => {
      if (item.children?.length) {
        defaults.add(item.key);
      }
    });
    return defaults;
  });

  useEffect(() => {
    try {
      localStorage.setItem(`treeExpanded-${storageKey}`, JSON.stringify([...expandedKeys]));
    } catch {}
  }, [expandedKeys, storageKey]);

  const handleToggle = useCallback(
    (key: string) => {
      setExpandedKeys((prev) => {
        const next = new Set(prev);
        if (next.has(key)) {
          next.delete(key);
        } else {
          next.add(key);
        }
        return next;
      });
    },
    [],
  );

  const defaultOpenKeys = useMemo(() => {
    const keys: string[] = [];
    function collect(items: TreeNavItem[]) {
      for (const item of items) {
        if (item.children?.length) {
          keys.push(item.key);
          collect(item.children);
        }
      }
    }
    collect(items);
    return keys;
  }, [items]);

 // Auto-expand parent nodes when a child is selected
  useEffect(() => {
    const key = selectedItemKey;
    if (!key) return;
    function expandParents(nodes: TreeNavItem[]) {
      const k = key as string;
      for (const node of nodes) {
        if (node.children?.some((c) => c.key === k || hasSelectedAncestor(c, k))) {
          setExpandedKeys((prev) => {
            const next = new Set(prev);
            next.add(node.key);
            return next;
          });
          expandParents(node.children!);
        }
      }
    }
    function hasSelectedAncestor(node: TreeNavItem, k: string): boolean {
      if (node.key === k) return true;
      return node.children?.some((c) => hasSelectedAncestor(c, k)) || false;
    }
    expandParents(items);
  }, [selectedItemKey, items]);

  return (
    <div className="overflow-y-auto overflow-x-hidden">
      {items.map((item) => (
        <TreeNode
          key={item.key}
          node={item}
          depth={0}
          selectedItemKey={selectedItemKey}
          onSelect={onSelect}
          expandedKeys={expandedKeys}
          onToggle={handleToggle}
        />
      ))}
    </div>
  );
}
