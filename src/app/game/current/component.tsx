"use client";

import React from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Analysis } from "@/lib/analysis";
import { getCouncilorsUi } from "./councilors";
import { getFleetsUi } from "./fleets";
import { getHabsUi } from "./habs";
import { getResourcesUi } from "./resources";
import { getDrivesUi } from "./drives";

export function RenderGameComponent({ analysis }: { analysis: Analysis }) {
  const tabs = [
    getCouncilorsUi(analysis),
    getFleetsUi(analysis),
    getHabsUi(analysis),
    getResourcesUi(analysis),
    getDrivesUi(analysis),
  ];

  const navItems = tabs.map((tab) => {
    const children = React.Children.toArray(tab.tab);
    // Extract string nodes from the fragment
    const text = children.filter((c) => typeof c === "string").join(" ");
    const match = text.match(/^([^(]+)\s*\((.*)\)$/);
    const title = match ? match[1].trim() : text.trim();
    const subtitle = match ? match[2].trim() : "";
    return { key: tab.key, title, subtitle, content: tab.content };
  });

  const [selectedKey, setSelectedKey] = useLocalStorage("gameNavSelected", navItems[0].key);
  const selectedItem = navItems.find((i) => i.key === selectedKey) || navItems[0];

  return (
    <div className="flex h-full">
      <nav className="w-64 bg-muted p-2 overflow-y-auto">
        {navItems.map((item) => (
          <div
            key={item.key}
            onClick={() => setSelectedKey(item.key)}
            className={`cursor-pointer rounded-md px-2 py-1 mb-1 ${item.key === selectedKey ? "bg-accent" : ""}`}
          >
            <div className="font-medium">{item.title}</div>
            {item.subtitle && <div className="text-xs text-muted-foreground">{item.subtitle}</div>}
          </div>
        ))}
      </nav>
      <main className="flex-1 p-4 overflow-y-auto">
        {selectedItem.content}
      </main>
    </div>
  );
}
