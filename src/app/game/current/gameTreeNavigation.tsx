"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Users, Ship, Cpu, Package, House } from "lucide-react";
import { ResourceIcons } from "@/components/icons";

export type GameSectionKey =
  | "councilors-score"
  | "councilors-existing"
  | "councilors-new"
  | "councilors-orgs"
  | "councilors-takeover"
  | "councilors-missions"
  | "councilors-other"
  | "fleets-alien"
  | "fleets-human"
  | "fleets-player"
  | "fleets-construction"
  | "habs-current-bonuses"
  | "habs-future-bonuses"
  | "habs-mc-summary"
  | "habs-alien-hate"
  | "habs-building-details"
  | "habs-boost-projects"
  | "habs-cp-projects"
  | "habs-max-org-projects"
  | "habs-expand-nation-projects"
  | "habs-stealable-projects"
  | "habs-technology-goals"
  | "habs-habs"
  | "habs-mines"
  | "resources-transactions"
  | "resources-owned"
  | "resources-spoils"
  | "resources-space"
  | "resources-nation-claims"
  | "resources-unification"
  | "drives-table"
  | "drives-calculator";

export interface GameTreeSection {
  key: GameSectionKey;
  label: string;
  subtitle?: string;
  description?: string;
}

export interface GameTreeCategory {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  sections: GameTreeSection[];
}

export interface GameTreeNavigationProps {
  sections?: GameTreeSection[];
  categories?: GameTreeCategory[];
  activeSection: GameSectionKey | null;
  onSelectSection: (section: GameSectionKey) => void;
}

const sectionLabels: Record<GameSectionKey, string> = {
  "councilors-score": "Score Details",
  "councilors-existing": "Existing Council",
  "councilors-new": "Find New Councilors",
  "councilors-orgs": "Current Organizations",
  "councilors-takeover": "Hostile Takeover",
  "councilors-missions": "Missions",
  "councilors-other": "Other Councilors",
  "fleets-alien": "Alien Fleets",
  "fleets-human": "Human Enemy Fleets",
  "fleets-player": "Player Fleets",
  "fleets-construction": "Ships Under Construction",
  "habs-current-bonuses": "Current Bonuses",
  "habs-future-bonuses": "Future Bonuses",
  "habs-mc-summary": "MC/Boost Summary",
  "habs-alien-hate": "Alien Hate",
  "habs-building-details": "Building Details",
  "habs-boost-projects": "Available Boost Projects",
  "habs-cp-projects": "Available CP Projects",
  "habs-max-org-projects": "Available Max Org Projects",
  "habs-expand-nation-projects": "Available Expand Nations",
  "habs-stealable-projects": "Available Stealable Projects",
  "habs-technology-goals": "Technology Goals",
  "habs-habs": "Manage Habs",
  "habs-mines": "Manage Mines",
  "resources-transactions": "Transactions",
  "resources-owned": "Owned Nations",
  "resources-spoils": "Spoil Targets",
  "resources-space": "MC/Boost Targets",
  "resources-nation-claims": "Nation Claims",
  "resources-unification": "Unification Candidates",
  "drives-table": "Drive Systems",
  "drives-calculator": "Drive Calculator",
};

export function GameTreeNavigation({
  activeSection,
  onSelectSection,
}: GameTreeNavigationProps) {
  const categories: GameTreeCategory[] = [
    {
      label: "Councilors",
      icon: Users,
      sections: [
        { key: "councilors-score", label: "Score Details" },
        { key: "councilors-existing", label: "Existing Council" },
        { key: "councilors-new", label: "Find New Councilors" },
        { key: "councilors-orgs", label: "Current Organizations" },
        { key: "councilors-takeover", label: "Hostile Takeover" },
        { key: "councilors-missions", label: "Missions" },
        { key: "councilors-other", label: "Other Councilors" },
      ],
    },
    {
      label: "Fleets",
      icon: Ship,
      sections: [
        { key: "fleets-alien", label: "Alien Fleets" },
        { key: "fleets-human", label: "Human Enemy Fleets" },
        { key: "fleets-player", label: "Player Fleets" },
        { key: "fleets-construction", label: "Ships Under Construction" },
      ],
    },
    {
      label: "Habs",
      icon: House,
      sections: [
        { key: "habs-current-bonuses", label: "Current Bonuses" },
        { key: "habs-future-bonuses", label: "Future Bonuses" },
        { key: "habs-mc-summary", label: "MC/Boost Summary" },
        { key: "habs-alien-hate", label: "Alien Hate" },
        { key: "habs-building-details", label: "Building Details" },
        { key: "habs-boost-projects", label: "Available Boost Projects" },
        { key: "habs-cp-projects", label: "Available CP Projects" },
        { key: "habs-max-org-projects", label: "Available Max Org Projects" },
        { key: "habs-expand-nation-projects", label: "Available Expand Nations" },
        { key: "habs-stealable-projects", label: "Available Stealable Projects" },
        { key: "habs-technology-goals", label: "Technology Goals" },
        { key: "habs-habs", label: "Manage Habs" },
        { key: "habs-mines", label: "Manage Mines" },
      ],
    },
    {
      label: "Resources",
      icon: Package,
      sections: [
        { key: "resources-transactions", label: "Transactions" },
        { key: "resources-owned", label: "Owned Nations" },
        { key: "resources-spoils", label: "Spoil Targets" },
        { key: "resources-space", label: "MC/Boost Targets" },
        { key: "resources-nation-claims", label: "Nation Claims" },
        { key: "resources-unification", label: "Unification Candidates" },
      ],
    },
    {
      label: "Drives",
      icon: Cpu,
      sections: [
        { key: "drives-table", label: "Drive Systems" },
        { key: "drives-calculator", label: "Drive Calculator" },
      ],
    },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="px-3 py-2 border-b">
        <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Navigation
        </div>
      </div>
      <div className="flex-1 overflow-y-auto py-2">
        <Accordion type="multiple" defaultValue={["cat-councilors", "cat-fleets", "cat-habs", "cat-resources", "cat-drives"]} className="px-2">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <AccordionItem key={category.label} value={`cat-${category.label.toLowerCase()}`}>
                <AccordionTrigger className="px-2 py-1.5 hover:bg-muted/50 rounded-md [&[data-state=open]]:bg-muted/50">
                  <div className="flex items-center gap-2">
                    {Icon && <Icon className="h-4 w-4 shrink-0" />}
                    <span className="font-medium text-sm">{category.label}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-1">
                  {category.sections.map((section) => (
                    <Button
                      key={section.key}
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "w-full justify-start h-8 text-xs font-normal px-3",
                        activeSection === section.key && "bg-muted text-muted-foreground",
                      )}
                      onClick={() => onSelectSection(section.key)}
                    >
                      {section.label}
                    </Button>
                  ))}
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
    </div>
  );
}
