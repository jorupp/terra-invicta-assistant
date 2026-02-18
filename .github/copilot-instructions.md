# Terra Invicta Assistant - Development Guide

This is a Next.js companion app for the game Terra Invicta, designed to run on a second screen and provide deeper insights into game state without providing information that is hidden within the game.

## Build, Test, and Lint

```bash
npm run dev         # Start development server on http://localhost:3002 - This is already running in the background.
npm run type-check  # Check TypeScript types without building - USE THIS to verify types, NOT npm run build
```

**Important**:

- Always assume `npm run dev` is running in the background on port 3002
- Use `npm run type-check` to verify TypeScript types, NOT `npm run build`
- No test suite is currently configured
- Can load <http://localhost:3002/game/static-current> to view the current save file without needing SSE - useful for debugging save file parsing, analysis, and visualization. This is especially helpful when changing `analysis.ts` - HMR will detect the change and reload the page since it's a direct reference. There is a hydration issue if you have any of the sorts changed via local storage, but that's not too big of a deal.

## Architecture Overview

### Data Flow

1. **Save file watching**: Server-Sent Events (SSE) endpoint (`/api/game/current`) watches `SAVE_GAME_DIR` for new `.gz` files.
2. **Save file parsing**: `src/lib/savefile.ts` decompresses gzipped saves, resolves `$id/$ref` references in the JSON structure, and deals with a few non-JSON things in the file.
3. **Template data**: `src/lib/templates.ts` loads static game data from `TEMPLATE_DIR` (Terra Invicta game files).
4. **Localization**: `src/lib/localization.ts` loads static game localization data from `LOCALIZATION_DIR` (Terra Invicta game files).
5. **Analysis**: `src/lib/analysis.ts` combines save file and template data to produce insights. The intention is that _all_ game-specific logic lives here - the UI should just display data from the analysis.
6. **UI**: React components in `src/app/game/current/` display the analyzed data

### Key Data Structures

- **SaveFile**: Parsed game save containing `gamestates` dictionary with game entities.
- **Templates**: Static game data (missions, traits, councilor types, tech, orgs, etc.) loaded from Terra Invicta installation.
- **Analysis**: Computed insights combining save + template data (councilors, fleets, research, etc.).

### Important Patterns

- **Server Actions**: Use `"use server"` directives for server-side data loading (see `actions.ts`).
- **Type Generation**: `template-types-generated.ts` contains auto-generated types from game files.
- **Reference Resolution**: Save files use JSON `$id` and `$ref` for shared objects—`fixReferences()` resolves these into proper object references.
- **Special JSON Handling**: Save files can contain +/-Infinity and a BOM character—these are cleaned before parsing.

## Environment Variables

Required in `.env.local`:

```env
SAVE_GAME_DIR=C:\Users\YourName\Documents\My Games\TerraInvicta\Saves
TEMPLATE_DIR=C:\Program Files (x86)\Steam\steamapps\common\Terra Invicta\TerraInvicta_Data\StreamingAssets\Templates
```

Optional:

```env
NEXT_PUBLIC_TECH_TREE_VIEWER=https://pzixel.github.io/terra-invicta-techtree-update
IGNORE_UNCOMPRESSED_FILES=true  # Only watch .gz files, not .json
DUMP_JSON_ERROR=debug.json      # Write failed JSON parses to file - mainly useful in debugging save parsing.
```

## Code Conventions

- **Path Aliases**: Use `@/` for imports from `src/` (e.g., `@/lib/utils`, `@/components/ui/button`)
- **UI Components**: Built with shadcn/ui (Radix Mira style) + Tailwind CSS
  - Add new components: `npx shadcn@latest add <component-name>`
  - Config in `components.json`
- **TypeScript**: Strict mode enabled, use generated types from `template-types-generated.ts` when working with game data, or expand them as necessary when real data shows more fields or a different type.
- **Date Handling**: Game uses custom date format—use `formatDateTime()`, `diffDateTime()` from `src/lib/utils.ts` due to the way dates are represented in the save files.

## Common Tasks

### Adding a New Analysis View

1. Create component in `src/app/game/current/`
2. Add data to `Analysis` type in `src/lib/analysis.ts`
3. Compute data in `analyzeData()` function
4. Import and render in `src/app/game/current/component.tsx`

### Working with Game Data

- Councilors: `saveFile.gamestates["PavonisInteractive.TerraInvicta.TICouncilorState"]`
- Orgs: `saveFile.gamestates["PavonisInteractive.TerraInvicta.TIOrgState"]`
- Fleets: `saveFile.gamestates["PavonisInteractive.TerraInvicta.TISpaceFleetState"]`
- Research: `saveFile.gamestates["PavonisInteractive.TerraInvicta.TIGlobalResearchState"]`
- Templates: `await templates.councilors()`, `await templates.projects()`, etc.

### Adding Template Support

1. Add type to `src/lib/template-types-generated.ts` (or generate it)
2. Add filename mapping to `templateMap` in `src/lib/templates.ts`
3. Use `await templates.yourTemplate()` to load data

## Code Organization

### Server-Side Analysis (`src/lib/analysis/`)

The analysis layer is the heart of the application—it processes raw save file data and game templates into meaningful insights. Currently consolidated in `src/lib/analysis.ts` (~2600 lines), this should be refactored into a modular structure:

```
src/lib/
  analysis/
    index.ts              # Main analyzeData() orchestration, exports Analysis type
    core.ts               # Shared utilities, player data, time/date processing
    councilors.ts         # Councilor analysis (traits, missions, attributes, threats)
    research.ts           # Technology research progress, projects, goals
    fleets.ts             # Space fleet analysis (ships, locations, missions)
    habs.ts               # Space habitats and bases (modules, effects, production)
    factions.ts           # Faction goals, priorities, relations
    nations.ts            # Nation control points, priorities, military
    resources.ts          # Resource tracking (money, influence, boost, materials)
    [other domains...]    # Additional analysis domains as needed
```

**Principles:**

- **Server-side first**: All game logic, calculations, and data transformations belong in analysis. The UI should be a pure view layer.
- **Domain separation**: Each file focuses on one major game system (e.g., all hab-related calculations in `habs.ts`).
- **Shared utilities**: Common patterns (localization lookups, effect combination, template resolution) live in `core.ts`.
- **Type exports**: Each analysis module exports its own types alongside functions. The main `Analysis` type in `index.ts` composes these domain types.
- **Single source of truth**: Analysis output should be complete—UI components shouldn't recalculate, only display and format.

**Refactoring approach:**

1. Create `src/lib/analysis/` directory
2. Move domain-specific logic into separate files
3. Export domain-specific types and analysis functions from each file
4. Update `index.ts` to orchestrate by calling domain analysis functions
5. Ensure no circular dependencies between analysis modules

### UI Components (`src/app/game/current/` and `src/components/`)

The UI is split between page-specific components and shared components:

**Page Components (`src/app/game/current/`):**

Current structure that works well:

- `page.tsx` - Route entry point
- `component.tsx` - Main orchestration component
- `useCurrent.ts` - SSE hook for live save file updates
- `actions.ts` - Server actions for data loading
- `renderCurrentGame.tsx` - Main render logic
- Domain components: `councilors.tsx`, `fleets.tsx`, `habs.tsx`, `resources.tsx`, etc.

**Principles:**

- **One component per major section**: Each major game domain (councilors, fleets, habs) gets its own file.
- **Keep components focused**: If a component file grows beyond ~300-400 lines, consider splitting into sub-components.
- **Sub-components**: When splitting is needed, create a subdirectory:
  ```
  councilors/
    index.tsx            # Main Councilors component
    councilorCard.tsx    # Individual councilor display
    missionStatus.tsx    # Mission status indicators
  ```
- **Props from analysis**: Components receive fully-processed data from analysis, never raw save file data.
- **Minimal client-side logic**: Sorting, filtering, and basic UI state only. No game calculations.

**Shared Components (`src/components/`):**

- **UI primitives** (`src/components/ui/`): shadcn/ui components (buttons, cards, etc.)—don't modify these directly unless necessary.
- **App-specific shared** (`src/components/`): Reusable Terra Invicta components
  - `showEffects.tsx` - Effect display logic used across multiple domains
  - `icons.tsx` - Game-specific icons
  - `infoTooltip.tsx` - Standardized tooltip pattern

**When to create a shared component:**

- Used in 2+ different domain components
- Represents a Terra Invicta-specific pattern (not a generic UI element)
- Has complex logic worth isolating

**When to keep inline:**

- Used in only one place
- Trivial JSX (<20 lines)
- Tightly coupled to parent's state

### File Size Guidelines

- **Analysis modules**: 200-400 lines ideal, 600 max before splitting
- **Page components**: 200-400 lines ideal, 500 max before splitting  
- **Shared components**: 100-200 lines ideal, 300 max

When a file exceeds these guidelines, consider:

1. Can this be split into logical sub-domains?
2. Are there reusable pieces that should be extracted?
3. Is there complex logic that should move to analysis layer?

### Import Organization

Standard import order:

1. React and Next.js imports
2. Third-party libraries
3. Internal lib imports (`@/lib/*`)
4. Internal component imports (`@/components/*`)
5. Relative imports
6. Type-only imports (group at end with `import type`)

Example:

```typescript
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { analyzeData } from "@/lib/analysis";
import { formatDateTime } from "@/lib/utils";
import { showEffects } from "@/components/showEffects";
import type { Analysis } from "@/lib/analysis";
```

### Naming Conventions

- **Files**: kebab-case for UI primitives (`button.tsx`), camelCase for app code (`councilors.tsx`)
- **Components**: PascalCase (`CouncilorCard`)
- **Functions**: camelCase (`analyzeCouncilors`, `formatDateTime`)
- **Types**: PascalCase (`Analysis`, `CouncilorData`)
- **Constants**: UPPER_SNAKE_CASE for true constants, camelCase for config objects
