"use client";

import { useState, useMemo } from "react";
import { Analysis } from "@/lib/analysis";
import { GameTreeNavigation, GameSectionKey } from "./gameTreeNavigation";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { ScoringWeights, defaultScoringWeights, loadWeightsFromStorage } from "./scoringWeights";
import { useEffect } from "react";

// Section renderers - Councilors
import {
  renderCouncilorScoreSection,
  renderExistingCouncilSection,
  renderNewCouncilorsSection,
  renderCurrentOrgsSection,
  renderTakeoverSection,
  renderMissionsSection,
  renderOtherCouncilorsSection,
} from "./councilorSections";

// Section renderers - Fleets
import {
  renderAlienFleetsSection,
  renderHumanEnemyFleetsSection,
  renderPlayerFleetsSection,
  renderShipsUnderConstructionSection,
} from "./fleetSections";

// Section renderers - Habs
import {
  renderCurrentBonusesSection,
  renderFutureBonusesSection,
  renderMcSummarySection,
  renderAlienHateSection,
  renderBuildingDetailsSection,
  renderAvailableProjectsSection,
  renderTechnologyGoalsSection,
  renderHabsSection,
  renderMinesSection,
} from "./habsSections";

// Section renderers - Resources
import {
  renderTransactionsSection,
  renderOwnedNationsSection,
  renderSpoilTargetsSection,
  renderMcBoostTargetsSection,
  renderNationClaimsSection,
  renderUnificationCandidatesSection,
} from "./resourceSections";

// Section renderers - Drives
import {
  renderDriveTableSection,
  renderDriveCalculatorSection,
} from "./driveSections";

function renderSection(section: GameSectionKey, analysis: Analysis, weights: ScoringWeights, setWeights: (w: ScoringWeights) => void) {
  const props = { analysis, weights, setWeights };
  switch (section) {
    case "councilors-score": return renderCouncilorScoreSection(props);
    case "councilors-existing": return renderExistingCouncilSection(props);
    case "councilors-new": return renderNewCouncilorsSection(props);
    case "councilors-orgs": return renderCurrentOrgsSection(props);
    case "councilors-takeover": return renderTakeoverSection(props);
    case "councilors-missions": return renderMissionsSection(props);
    case "councilors-other": return renderOtherCouncilorsSection(props);
    case "fleets-alien": return renderAlienFleetsSection({ analysis });
    case "fleets-human": return renderHumanEnemyFleetsSection({ analysis });
    case "fleets-player": return renderPlayerFleetsSection({ analysis });
    case "fleets-construction": return renderShipsUnderConstructionSection({ analysis });
    case "habs-current-bonuses": return renderCurrentBonusesSection({ analysis });
    case "habs-future-bonuses": return renderFutureBonusesSection({ analysis });
    case "habs-mc-summary": return renderMcSummarySection({ analysis });
    case "habs-alien-hate": return renderAlienHateSection({ analysis });
    case "habs-building-details": return renderBuildingDetailsSection({ analysis });
    case "habs-boost-projects": return renderAvailableProjectsSection({ analysis });
    case "habs-cp-projects": return renderAvailableProjectsSection({ analysis });
    case "habs-max-org-projects": return renderAvailableProjectsSection({ analysis });
    case "habs-expand-nation-projects": return renderAvailableProjectsSection({ analysis });
    case "habs-stealable-projects": return renderAvailableProjectsSection({ analysis });
    case "habs-technology-goals": return renderTechnologyGoalsSection({ analysis });
    case "habs-habs": return renderHabsSection({ analysis });
    case "habs-mines": return renderMinesSection({ analysis });
    case "resources-transactions": return renderTransactionsSection({ analysis });
    case "resources-owned": return renderOwnedNationsSection({ analysis });
    case "resources-spoils": return renderSpoilTargetsSection({ analysis });
    case "resources-space": return renderMcBoostTargetsSection({ analysis });
    case "resources-nation-claims": return renderNationClaimsSection({ analysis });
    case "resources-unification": return renderUnificationCandidatesSection({ analysis });
    case "drives-table": return renderDriveTableSection({ analysis });
    case "drives-calculator": return renderDriveCalculatorSection({ analysis });
    default: return null;
  }
}

export function GameLayout({ analysis }: { analysis: Analysis }) {
  const [activeSection, setActiveSection] = useLocalStorage<GameSectionKey | "none">(
    "gameActiveSection",
    "councilors-score" as GameSectionKey,
  );

  const [weights, setWeights] = useState<ScoringWeights>(() => loadWeightsFromStorage() || defaultScoringWeights);

  useEffect(() => {
    setWeights(loadWeightsFromStorage() || defaultScoringWeights);
  }, []);

  const gameInfo = (
    <div className="px-4 py-3 border-b bg-background">
      <h2 className="text-base font-semibold">
        Game: {analysis.fileName} ({analysis.lastModified?.toLocaleString()}) - Game date:{" "}
        {analysis.gameCurrentDateTimeFormatted.split(" ")[0]}
      </h2>
      <h3 className="text-sm text-muted-foreground">Faction: {analysis.playerFaction.displayName}</h3>
    </div>
  );

  const nav = (
    <GameTreeNavigation
      activeSection={activeSection === "none" ? null : activeSection}
      onSelectSection={(section) => setActiveSection(section)}
    />
  );

  const content = activeSection && activeSection !== "none"
    ? renderSection(activeSection, analysis, weights, setWeights)
    : (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          <div className="text-center">
            <p className="text-lg font-medium mb-2">Select a section from the navigation</p>
            <p className="text-sm">Choose an item from the left panel to view its details.</p>
          </div>
        </div>
      );

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {gameInfo}
      <div className="flex flex-1 overflow-hidden">
        <div className="w-64 shrink-0 border-r overflow-hidden">
          {nav}
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {content}
        </div>
      </div>
    </div>
  );
}
