"use client";

import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Analysis } from "@/lib/analysis";
import { getCouncilorsUi } from "./councilors";
import { getFleetsUi } from "./fleets";
import { getHabsUi } from "./habs";
import { getResourcesUi } from "./resources";
import { getDrivesUi } from "./drives";

export function RenderGameComponent({ analysis }: { analysis: Analysis }) {
  const navItems = [
    {
      key: "councilors",
      title: "Councilors",
      subtitle: `Councilors (${analysis.playerCouncilors?.length ?? 0})`,
      content: getCouncilorsUi(analysis),
    },
    {
      key: "fleets",
      title: "Fleets",
      subtitle: `Fleets (${analysis.playerFleets?.length ?? 0})`,
      content: getFleetsUi(analysis),
    },
    {
      key: "habs",
      title: "Habs",
      subtitle: `Habs (${analysis.playerHabs?.length ?? 0})`,
      content: getHabsUi(analysis),
    },
    {
      key: "resources",
      title: "Resources",
      subtitle: undefined,
      content: getResourcesUi(analysis),
    },
    {
      key: "drives",
      title: "Drives",
      subtitle: `Drives (${analysis.drives?.length ?? 0})`,
      content: getDrivesUi(analysis),
    },
  ];

  const [selectedKey, setSelectedKey] = useLocalStorage("mainTree", navItems[0].key);

  const selectedItem = navItems.find((i) => i.key === selectedKey) || navItems[0];

  return (
    <div className="flex h-full">
      <nav className="w-64 border-r border-gray-200 bg-white p-2">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.key} className="cursor-pointer">
              <div
                className={`flex flex-col py-1.5 px-2 rounded-md hover:bg-gray-200 transition-colors ${item.key === selectedKey ? "bg-gray-100" : ""}`}
                onClick={() => setSelectedKey(item.key)}
              >
                <span className="font-semibold">{item.title}</span>
                {item.subtitle && <span className="text-xs text-gray-500">{item.subtitle}</span>}
              </div>
            </li>
          ))}
        </ul>
      </nav>
      <main className="flex-1 p-4">{selectedItem.content}</main>
    </div>
  );
}

