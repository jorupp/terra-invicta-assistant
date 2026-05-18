"use client";

import { Analysis } from "@/lib/analysis";
import { SidebarNav } from "./sidebarNav";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { CouncilsSection } from "./sections/councils";
import { FleetsSection } from "./sections/fleets";
import { HabsSection } from "./sections/habs";
import { ResourcesSection } from "./sections/resources";
import { DrivesSection } from "./sections/drives";

export function RenderGameComponent({ analysis }: { analysis: Analysis }) {
  const [selectedValue, setSelectedValue] = useState("councilors-existing");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const content = renderContent(selectedValue, analysis);

  return (
    <div className="flex h-screen overflow-hidden">
      {sidebarOpen && (
        <>
          <SidebarNav nodes={getTreeView(analysis)} selectedValue={selectedValue} onSelect={setSelectedValue} />
          <button
            onClick={() => setSidebarOpen(false)}
            className="fixed top-2 left-64 z-10 bg-background border rounded p-1 hover:bg-accent"
            title="Collapse sidebar"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </>
      )}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed top-2 left-2 z-10 bg-background border rounded p-1 hover:bg-accent"
          title="Expand sidebar"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="mx-2">
          <h2>
            Game: {analysis.fileName} ({analysis.lastModified?.toLocaleString()}) - Game date:{" "}
            {analysis.gameCurrentDateTimeFormatted.split(" ")[0]}
          </h2>
          <h3>Faction: {analysis.playerFaction.displayName}</h3>
          <div className="mt-4">
            {content}
          </div>
        </div>
      </div>
    </div>
  );
}

function renderContent(selectedValue: string, analysis: Analysis) {
  switch (selectedValue) {
    case "councilors-existing":
    case "councilors-find-new":
    case "councilors-current-orgs":
    case "councilors-takeover":
    case "councilors-missions":
    case "councilors-other":
      return <CouncilsSection key={selectedValue} analysis={analysis} mode={selectedValue.replace("councilors-", "")} />;
    case "fleets-alien":
    case "fleets-human":
    case "fleets-player":
    case "fleets-construction":
      return <FleetsSection key={selectedValue} analysis={analysis} section={selectedValue.replace("fleets-", "")} />;
    case "habs-bonuses":
    case "habs-building":
    case "habs-projects":
    case "habs-tech-goals":
    case "habs-habs":
    case "habs-mines":
      return <HabsSection key={selectedValue} analysis={analysis} section={selectedValue.replace("habs-", "")} />;
    case "resources-transactions":
    case "resources-owned":
    case "resources-spoils":
    case "resources-mc-boost":
    case "resources-claims":
    case "resources-unification":
      return <ResourcesSection key={selectedValue} analysis={analysis} section={selectedValue.replace("resources-", "")} />;
    case "drives-table":
    case "drives-calculator":
      return <DrivesSection key={selectedValue} analysis={analysis} section={selectedValue.replace("drives-", "")} />;
    default:
      return <CouncilsSection key={selectedValue} analysis={analysis} />;
  }
}

function getTreeView(analysis: Analysis) {
  const worstExisting = analysis.playerCouncilors.length > 0 ? " (score)" : "";
  const bestAvailable = analysis.playerAvailableCouncilors.length > 0 ? " (score)" : "";

  return [
    {
      label: "Councilors",
      subtitle: worstExisting + bestAvailable,
      value: "councilors",
      children: [
        { label: "Existing Council", value: "councilors-existing" },
        { label: "Find New", value: "councilors-find-new" },
        { label: "Current Organizations", value: "councilors-current-orgs" },
        { label: "Hostile Takeover", value: "councilors-takeover" },
        { label: "Missions", value: "councilors-missions" },
        { label: "Other Councilors", value: "councilors-other" },
      ],
    },
    {
      label: "Fleets",
      value: "fleets",
      children: [
        { label: "Alien Fleets", value: "fleets-alien" },
        { label: "Human Enemy Fleets", value: "fleets-human" },
        { label: "Player Fleets", value: "fleets-player" },
        { label: "Ships Under Construction", value: "fleets-construction" },
      ],
    },
    {
      label: "Habs",
      value: "habs",
      children: [
        { label: "Bonuses", value: "habs-bonuses" },
        { label: "Building Details", value: "habs-building" },
        { label: "Projects", value: "habs-projects" },
        { label: "Technology Goals", value: "habs-tech-goals" },
        { label: "Manage Habs", value: "habs-habs" },
        { label: "Manage Mines", value: "habs-mines" },
      ],
    },
    {
      label: "Resources",
      value: "resources",
      children: [
        { label: "Transactions", value: "resources-transactions" },
        { label: "Owned Nations", value: "resources-owned" },
        { label: "Spoil Targets", value: "resources-spoils" },
        { label: "MC/Boost Targets", value: "resources-mc-boost" },
        { label: "Nation Claims", value: "resources-claims" },
        { label: "Unification Candidates", value: "resources-unification" },
      ],
    },
    {
      label: "Drives",
      value: "drives",
      children: [
        { label: "Drive Systems", value: "drives-table" },
        { label: "Drive Calculator", value: "drives-calculator" },
      ],
    },
  ];
}
