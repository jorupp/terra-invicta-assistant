"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronRight, ChevronDown } from "lucide-react";

export interface TreeItemData {
  value: string;
  label: React.ReactNode;
  subtitle?: React.ReactNode;
  children?: TreeItemData[];
  disabled?: boolean;
}

interface TreeContextValue {
  expanded: Set<string>;
  selected: string | null;
  toggleExpanded: (value: string) => void;
  onSelect: (value: string) => void;
}

const TreeContext = React.createContext<TreeContextValue | null>(null);

function useTree() {
  const ctx = React.useContext(TreeContext);
  if (!ctx) throw new Error("Tree component context not found");
  return ctx;
}

interface TreeProps {
  items: TreeItemData[];
  expanded?: string[];
  defaultExpanded?: string[];
  selected?: string | null;
  onExpandedChange?: (expanded: string[]) => void;
  onSelectionChange?: (value: string | null) => void;
  className?: string;
}

export function Tree({
  items,
  expanded: controlledExpanded,
  defaultExpanded,
  selected: controlledSelected,
  onExpandedChange,
  onSelectionChange,
  className,
}: TreeProps) {
  const [internalExpanded, setInternalExpanded] = React.useState(() => {
    if (defaultExpanded) return new Set(defaultExpanded);
    return new Set<string>();
  });

  const isControlled = controlledExpanded !== undefined;
  const expanded = isControlled ? new Set(controlledExpanded) : internalExpanded;

  const toggleExpanded = React.useCallback(
    (value: string) => {
      const next = new Set(expanded);
      if (next.has(value)) {
        next.delete(value);
      } else {
        next.add(value);
      }
      if (!isControlled) {
        setInternalExpanded(next);
      }
      onExpandedChange?.(Array.from(next));
    },
    [expanded, isControlled, onExpandedChange],
  );

  const [internalSelected, setInternalSelected] = React.useState<string | null>(null);
  const selected = controlledSelected !== undefined ? controlledSelected : internalSelected;

  const onSelect = React.useCallback(
    (value: string) => {
      if (!isControlled) {
        setInternalSelected(value);
      }
      onSelectionChange?.(value);
    },
    [isControlled, onSelectionChange],
  );

  const ctx: TreeContextValue = React.useMemo(
    () => ({ expanded, selected, toggleExpanded, onSelect }),
    [expanded, selected, toggleExpanded, onSelect],
  );

  return (
    <TreeContext.Provider value={ctx}>
      <div className={cn("space-y-0.5", className)} role="tree">
        {items.map((item) => (
          <TreeItem key={item.value} item={item} />
        ))}
      </div>
    </TreeContext.Provider>
  );
}

function TreeItem({ item }: { item: TreeItemData }) {
  const { expanded, selected, toggleExpanded, onSelect } = useTree();
  const hasChildren = item.children && item.children.length > 0;
  const isExpanded = expanded.has(item.value);
  const isSelected = selected === item.value;

  const handleClick = React.useCallback(() => {
    if (item.disabled) return;
    if (hasChildren) {
      toggleExpanded(item.value);
    }
    onSelect(item.value);
  }, [item.disabled, hasChildren, item.value, toggleExpanded, onSelect]);

  return (
    <div role="group">
      <button
        role="treeitem"
        aria-expanded={hasChildren ? isExpanded : undefined}
        aria-selected={isSelected}
        tabIndex={isSelected ? 0 : -1}
        className={cn(
          "flex items-center gap-1 w-full text-left rounded-sm px-1.5 py-1 text-sm outline-none transition-colors",
          "hover:bg-muted/60 focus:bg-muted/60 focus-visible:outline-none",
          isSelected && "bg-muted font-medium",
          item.disabled && "opacity-50 cursor-not-allowed",
        )}
        onClick={handleClick}
      >
        {hasChildren ? (
          <span className="shrink-0">
            {isExpanded ? (
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            )}
          </span>
        ) : (
          <span className="shrink-0 w-3.5" />
        )}
        <span className="flex-1 min-w-0">
          <span className="truncate">{item.label}</span>
          {item.subtitle && (
            <span className="block text-[11px] text-muted-foreground truncate">{item.subtitle}</span>
          )}
        </span>
      </button>
      {hasChildren && isExpanded && (
        <div role="group" className="ml-4 border-l border-border/40 pl-1">
          {item.children!.map((child) => (
            <TreeItem key={child.value} item={child} />
          ))}
        </div>
      )}
    </div>
  );
}
