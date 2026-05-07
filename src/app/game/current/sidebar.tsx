"use client";

import { useState } from "react";
import { ChevronRight, ChevronDown, Gamepad2, Users, Ship, Home, Zap, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Tab {
  key: string;
  tab: React.ReactNode;
  content: React.ReactNode;
  subItems?: {
    key: string;
    label: string;
  }[];
}

interface SidebarProps {
  tabs: Tab[];
  selectedKey: string;
  onSelect: (key: string) => void;
}

export function Sidebar({ tabs, selectedKey, onSelect }: SidebarProps) {
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set([tabs[0].key]));

  const toggleExpand = (key: string) => {
    const newExpandedKeys = new Set(expandedKeys);
    if (newExpandedKeys.has(key)) {
      newExpandedKeys.delete(key);
    } else {
      newExpandedKeys.add(key);
    }
    setExpandedKeys(newExpandedKeys);
  };

  const iconMap: Record<string, React.ElementType> = {
    councilors: Users,
    fleets: Ship,
    habs: Home,
    resources: Zap,
    drives: Gamepad2,
  };

  return (
    <div className="w-64 border-r bg-muted/30 flex flex-col h-full overflow-y-auto">
      <div className="p-4 font-bold text-lg border-b bg-muted/50">
        Game Analysis
      </div>
      <div className="flex-1 py-2">
        {tabs.map((tab) => {
          const Icon = iconMap[tab.key] || BarChart3;
          const isExpanded = expandedKeys.has(tab.key);
          const isSelected = selectedKey === tab.key || selectedKey.startsWith(`${tab.key}.`);

          return (
            <div key={tab.key} className="space-y-0.5">
              <button
                onClick={() => {
                  onSelect(tab.key);
                  if (tab.subItems) toggleExpand(tab.key);
                }}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors hover:bg-muted",
                  isSelected ? "text-primary bg-muted" : "text-muted-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.key.charAt(0).toUpperCase() + tab.key.slice(1)}
                {tab.subItems && (
                  <div className="ml-auto">
                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </div>
                )}
              </button>
              {isExpanded && tab.subItems && (
                <div className="ml-4 border-l pl-2 space-y-0.5">
                  {tab.subItems.map((sub) => (
                    <button
                      key={sub.key}
                      onClick={() => onSelect(sub.key)}
                      className={cn(
                        "w-full text-left px-3 py-1.5 text-sm transition-colors hover:bg-muted",
                        selectedKey === sub.key ? "text-primary font-medium" : "text-muted-foreground"
                      )}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}


interface SidebarProps {
  tabs: Tab[];
  selectedKey: string;
  onSelect: (key: string) => void;
}

export function Sidebar({ tabs, selectedKey, onSelect }: SidebarProps) {
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set([tabs[0].key]));

  const toggleExpand = (key: string) => {
    const newExpandedKeys = new Set(expandedKeys);
    if (newExpandedKeys.has(key)) {
      newExpandedKeys.delete(key);
    } else {
      newExpandedKeys.add(key);
    }
    setExpandedKeys(newExpandedKeys);
  };

  const iconMap: Record<string, React.ElementType> = {
    councilors: Users,
    fleets: Ship,
    habs: Home,
    resources: Zap,
    drives: Gamepad2,
  };

  return (
    <div className="w-64 border-r bg-muted/30 flex flex-col h-full overflow-y-auto">
      <div className="p-4 font-bold text-lg border-b bg-muted/50">
        Game Analysis
      </div>
      <div className="flex-1 py-2">
        {tabs.map((tab) => {
          const Icon = iconMap[tab.key] || BarChart3;
          const isExpanded = expandedKeys.has(tab.key);
          const isSelected = selectedKey === tab.key || selectedKey.startsWith(`${tab.key}.`);

          return (
            <div key={tab.key} className="space-y-0.5">
              <button
                onClick={() => {
                  onSelect(tab.key);
                  if (tab.subItems) toggleExpand(tab.key);
                }}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors hover:bg-muted",
                  isSelected ? "text-primary bg-muted" : "text-muted-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.key.charAt(0).toUpperCase() + tab.key.slice(1)}
                {tab.subItems && (
                  <div className="ml-auto">
                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </div>
                )}
              </button>
              {isExpanded && tab.subItems && (
                <div className="ml-4 border-l pl-2 space-y-0.5">
                  {tab.subItems.map((sub) => (
                    <button
                      key={sub.key}
                      onClick={() => onSelect(sub.key)}
                      className={cn(
                        "w-full text-left px-3 py-1.5 text-sm transition-colors hover:bg-muted",
                        selectedKey === sub.key ? "text-primary font-medium" : "text-muted-foreground"
                      )}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}


interface SidebarProps {
  tabs: Tab[];
}

export function Sidebar({ tabs }: SidebarProps) {
  const [selectedKey, setSelectedKey] = useState<string>(tabs[0].key);
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set([tabs[0].key]));

  const toggleExpand = (key: string) => {
    const newExpandedKeys = new Set(expandedKeys);
    if (newExpandedKeys.has(key)) {
      newExpandedKeys.delete(key);
    } else {
      newExpandedKeys.add(key);
    }
    setExpandedKeys(newExpandedKeys);
  };

  const iconMap: Record<string, React.ElementType> = {
    councilors: Users,
    fleets: Ship,
    habs: Home,
    resources: Zap,
    drives: Gamepad2,
  };

  return (
    <div className="w-64 border-r bg-muted/30 flex flex-col h-full overflow-y-auto">
      <div className="p-4 font-bold text-lg border-b bg-muted/50">
        Game Analysis
      </div>
      <div className="flex-1 py-2">
        {tabs.map((tab) => {
          const Icon = iconMap[tab.key] || BarChart3;
          const isExpanded = expandedKeys.has(tab.key);
          const isSelected = selectedKey === tab.key || selectedKey.startsWith(`${tab.key}.`);

          return (
            <div key={tab.key} className="space-y-0.5">
              <button
                onClick={() => {
                  setSelectedKey(tab.key);
                  toggleExpand(tab.key);
                }}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors hover:bg-muted",
                  isSelected ? "text-primary bg-muted" : "text-muted-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.key.charAt(0).toUpperCase() + tab.key.slice(1)}
                {tab.subItems && (
                  <div className="ml-auto">
                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </div>
                )}
              </button>
              {isExpanded && tab.subItems && (
                <div className="ml-4 border-l pl-2 space-y-0.5">
                  {tab.subItems.map((sub) => (
                    <button
                      key={sub.key}
                      onClick={() => setSelectedKey(sub.key)}
                      className={cn(
                        "w-full text-left px-3 py-1.5 text-sm transition-colors hover:bg-muted",
                        selectedKey === sub.key ? "text-primary font-medium" : "text-muted-foreground"
                      )}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
