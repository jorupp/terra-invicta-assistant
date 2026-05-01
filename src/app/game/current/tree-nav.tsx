"use client";

import { useState } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";

export interface TreeItem {
  key: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  children?: TreeItem[];
}

export interface ContentPanel {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  source: string;
  content: React.ReactNode;
}

interface TreeNodeProps {
  item: TreeItem;
  depth: number;
  selectedKey: string | null;
  expandedKeys: Set<string>;
  onToggleExpand: (key: string) => void;
  onSelect: (key: string) => void;
}

function TreeNode({ item, depth, selectedKey, expandedKeys, onToggleExpand, onSelect }: TreeNodeProps) {
  const hasChildren = item.children && item.children.length > 0;
  const isExpanded = expandedKeys.has(item.key);
  const isSelected = selectedKey === item.key;

  const Icon = item.icon;

  return (
    <div>
      <button
        className={`w-full text-left flex items-center gap-1 py-1 px-2 rounded cursor-pointer transition-colors ${
          isSelected
            ? "bg-blue-100 text-blue-800 font-medium"
            : "text-foreground hover:bg-muted/50"
        }`}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={() => {
          if (hasChildren) {
            onToggleExpand(item.key);
          }
          onSelect(item.key);
        }}
      >
        {hasChildren ? (
          isExpanded ? (
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          )
        ) : (
          <span className="w-3.5 shrink-0" />
        )}
        {Icon && <Icon className="h-4 w-4 shrink-0" />}
        <span className="truncate text-sm">{item.label}</span>
      </button>
      {hasChildren && isExpanded && (
        <div>
          {item.children!.map((child) => (
            <TreeNode
              key={child.key}
              item={child}
              depth={depth + 1}
              selectedKey={selectedKey}
              expandedKeys={expandedKeys}
              onToggleExpand={onToggleExpand}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function TreeNav({
  items,
  selectedKey,
  onSelect,
}: {
  items: TreeItem[];
  selectedKey: string | null;
  onSelect: (key: string) => void;
}) {
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(
    new Set(items.filter((i) => i.children).map((i) => i.key))
  );

  const toggleExpand = (key: string) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  return (
    <div className="py-2 overflow-y-auto">
      {items.map((item) => (
        <TreeNode
          key={item.key}
          item={item}
          depth={0}
          selectedKey={selectedKey}
          expandedKeys={expandedKeys}
          onToggleExpand={toggleExpand}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
