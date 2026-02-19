# Code Organization Guidelines

This document describes how code in this project should be organized, including how server-side analysis logic and UI components should be structured and split across files.

## Overall Principles

- **Server-side analysis does the heavy lifting.** All game-specific calculations, data transformations, and derived insights belong in the `src/lib/analysis/` directory. UI components should receive fully-computed data and focus solely on presentation.
- **One area of concern per file.** Both analysis modules and UI components should be split by game domain (councilors, fleets, habs, nations, etc.) rather than by technical concern.
- **Shared types and utilities stay centralized.** Types used across multiple analysis modules live in a shared types file within the analysis directory. General utilities remain in `src/lib/utils.ts`.

## Server-Side Analysis (`src/lib/analysis/`)

The current monolithic `src/lib/analysis.ts` (~2800 lines) should be refactored into an `analysis/` directory with one file per major domain area, plus shared infrastructure.

### Directory Structure

```
src/lib/analysis/
├── index.ts              # Main entry point: exports analyzeData() and Analysis type
│                         # Orchestrates calls to domain modules and assembles the final result
│                         # Contains early setup code (loading templates, localization, player/time state)
├── types.ts              # Shared types used across multiple analysis modules
│                         # (e.g., intermediate lookup maps, common param types passed between modules)
├── councilors.ts         # Councilor analysis: trait computation, effects calculation,
│                         # XP, intel, mission availability, available/visible councilors
├── drives.ts             # Drive analysis: drive comparison, reactor/radiator calculations,
│                         # ship performance estimates, delta-V, trip calculations
├── factions.ts           # Faction analysis: MC calculations, control point logic, 
│                         # available projects (boost, CP, expand-nation, max-org), nation history,
│                         # alien faction goals expansion
├── fleets.ts             # Fleet analysis: ship aggregation, MC estimation, mass/delta-V,
│                         # hull types, fleet operations, alien fleet tracking
├── habs.ts               # Hab analysis: module processing, sector/tier logic, mining calculations,
│                         # solar/power bonuses, construction status, building summaries, upgrade tracking
├── nations.ts            # Nation analysis: spoils calculation, CP cost, boost/MC metrics,
│                         # region aggregation, priority bonuses, resource income
├── orgs.ts               # Org analysis: org template resolution, home nation lookup,
│                         # unassigned/available/stealable org filtering
├── research.ts           # Research/tech analysis: remaining research calculation,
│                         # stealable projects, tech prerequisite chain walking
└── space.ts              # Space body/orbit analysis: planet lookup, orbit mapping,
                          # player planet/orbit identification, interested planets
```

### Module Design Rules

1. **Each domain module exports one or more functions** that accept the parsed save file data and any required lookup maps/templates, and return the computed analysis for that domain.

2. **`index.ts` is the orchestrator.** It:
   - Loads templates and localization (as it does today in the top of `analyzeData()`)
   - Builds shared lookup maps (e.g., `orbitsById`, `bodiesById`, `nationsById`, `regionsById`)
   - Calls each domain module's analysis function(s)
   - Assembles and returns the final `Analysis` object
   - Exports the `Analysis` type (which should remain `Awaited<ReturnType<typeof analyzeData>>`)

3. **Shared state flows downward.** Domain modules should receive what they need as parameters rather than reaching into shared mutable state. The orchestrator in `index.ts` is responsible for building lookup maps and passing them to the modules that need them.

4. **Helper functions stay near their usage.** Small helpers like `getSolarMultiplier()` and `getMineMultipler()` belong in the module that uses them (e.g., `habs.ts`). Only promote a helper to `types.ts` or a shared utility if it's used by multiple modules.

5. **The `Analysis` return type should not change shape.** The refactoring should be transparent to the UI — the object returned by `analyzeData()` must remain identical.

### Migration Notes

- `calculateRemainingResearch()` is used by both drives and stealable projects — put it in `research.ts` and import where needed.
- `computeCouncilorEffects()` is only used by councilor analysis — keep it in `councilors.ts`.
- The alien goals expansion section (~320 lines of goal type helpers) belongs in `factions.ts` since it's about faction goal analysis.
- Building summary aggregation (across all player habs) can stay in `habs.ts` since it's hab-module-centric.

## UI Components (`src/app/game/current/`)

UI components are organized by tab/view and each file exports a `get*Ui()` function that returns `{ key, tab, content }` for the tab system.

### Current Structure (and how to extend it)

```
src/app/game/current/
├── component.tsx         # Main tab container — imports all get*Ui functions, renders SmartTabs
├── councilors.tsx        # Councilors tab (council management, hostile councilors, available councilors)
├── fleets.tsx            # Fleets tab (player fleets, alien incoming fleets)
├── habs.tsx              # Habs tab (hab details, building summary, bonuses, tech targets)
├── resources.tsx         # Resources tab (income sources, nation management)
├── drives.tsx            # Drives tab (drive comparison table)
├── scoringWeights.tsx    # Scoring/weights configuration (used within councilors and resources)
├── technologyGoals.tsx   # Technology goals display
├── researchLink.tsx      # Small shared component for research/project links
├── actions.ts            # Server actions for data loading
├── useCurrent.ts         # SSE hook for live updates
├── page.tsx              # Next.js page (server component)
└── renderCurrentGame.tsx # Handles server→client bridge
```

### Component Organization Rules

1. **Each tab is one file** exporting a `get*Ui(analysis: Analysis)` function. This pattern is established and should be maintained.

2. **Split large tab files when they exceed ~500 lines** or contain clearly distinct sub-views. For example, `councilors.tsx` (1000+ lines) could be split into:
   - `councilors.tsx` — main tab, council management
   - `councilors-hostile.tsx` — hostile councilor table
   - `councilors-available.tsx` — available councilor recruiting view
   
   The main file would import and compose the sub-components.

3. **Shared small components** (like `researchLink.tsx`, `infoTooltip.tsx`, `showEffects.tsx`) live in `src/components/` if they're used across multiple tabs, or alongside the tab file if they're tab-specific.

4. **`scoringWeights.tsx`** is a cross-cutting concern used by multiple tabs. It should remain as a standalone file.

5. **No game logic in UI components.** If you find yourself writing calculations, filtering, or data transformation in a UI file, move that logic into the appropriate analysis module instead. UI components should destructure and render, not compute.

## Shared Components (`src/components/`)

```
src/components/
├── ui/                   # shadcn/ui primitives (add via `npx shadcn@latest add <name>`)
├── icons.tsx             # Game-specific icon components
├── infoTooltip.tsx       # Reusable tooltip wrapper
└── showEffects.tsx       # Effect display component (used widely across tabs)
```

- `ui/` components are managed by shadcn and should not be manually edited.
- Game-specific shared components that are used by 2+ tab files belong here.
- Components used by only one tab file should live next to that tab file in `src/app/game/current/`.

## Library Code (`src/lib/`)

```
src/lib/
├── analysis/                      # (see above) Game analysis logic
├── savefile.ts                    # Save file parsing, reference resolution, type definitions
├── templates.ts                   # Template data loading from game files
├── template-types-generated.ts    # Auto-generated types from game data files
├── template-types.ts              # Manual template type extensions
├── localization.ts                # Game string localization
└── utils.ts                       # General utilities (date formatting, sorting, etc.)
```

- `savefile.ts`, `templates.ts`, `localization.ts`, and `utils.ts` are stable infrastructure and should rarely need structural changes.
- `template-types-generated.ts` is auto-generated — extend types in `template-types.ts` when real data shows additional fields.
