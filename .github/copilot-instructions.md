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
- Can load <http://localhost:3002/game/static-current> to view the current save file without needing SSE - useful for debugging save file parsing, analysis, and visualization.

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
