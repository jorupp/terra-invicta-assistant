Let me explore the codebase to understand the current structure before planning the reorganization.

Good, now let me read the key files to understand the exact code structure before planning the implementation.

Let me read the other tab files quickly to understand their structure.

Let me read the full get*Ui functions in the other tab files to understand the accordion structure.

Let me read the full accordion structure of habs and resources files.

Let me read the full accordion content areas in the remaining files before writing code.

Let me check the useLocalStorage hook and the hooks directory.

Let me check if any other pages use the existing `get*Ui` functions before I replace them.

Let me check the rest of resources.tsx and the scoringWeights file.

Now I have a complete picture of the codebase. Let me implement the tree navigation. I'll create the tree nav component, add section-export functions to each tab file, and rewrite the main component.

Now let me add `getDrivesSections` to `drives.tsx` (simplest case — `DrivesTable` and `DriveCalculator` are already separate components):

Now I need to add the `ReactNode` import to `drives.tsx`. Let me check the current imports:

Now let me add `getFleetsSections` to `fleets.tsx`. I'll add the section functions after the existing `FleetsComponent`:

Now add section exports to `resources.tsx`. I need to extract the inline accordion content into named components:

Now I need to add `TransactionsSection`, `OwnedNationsSection`, `SpoilTargetsSection`, `MCBoostTargetsSection`, and `getResourcesSections`. Let me read the `ResourcesComponent` structure more completely:

Now I'll append all the new section functions and `getResourcesSections` to the end of `resources.tsx`:

Now add section exports to `habs.tsx`. I'll append new section functions and `getHabsSections` at the end:

Now I need to add the `React` import (for `React.ReactNode`) to `habs.tsx`. Let me check the existing imports:

Now the biggest change: refactoring `councilors.tsx`. I'll replace `getCouncilorsUi` with `getCouncilorsSections` and add section components:

Now I need to remove the `useState` and `useEffect` imports from the top of `councilors.tsx` (since `getCouncilorsUi` was the only thing using them at the top level) — actually let me check if anything else uses them:

Wait, does `CouncilorsComponent` or `OtherCouncilorsByFaction` use `useState`? Let me check:

Now let me rewrite `component.tsx` to use the new tree nav system:

Now let me check if there are TypeScript errors by running the build:

Two fixes needed. Let me fix the TypeScript errors:

**1. `component.tsx` — explicit Map type:**

Now add the React import to component.tsx:

**2. `councilors.tsx` — fix the concat type error in `MissionsSection`:**

Clean compile. Now let me verify the dev server starts correctly:

Build passes clean. Let me start the dev server and take a screenshot to verify the UI looks right:

The server is already running. Let me take a screenshot of the game page:

The Chrome extension isn't available right now. The build passes cleanly though — let me verify the key files look correct:

The implementation is complete. Here's a summary of what was built:

---

**What changed:**

**New file: [`treeNav.tsx`](src/app/game/current/treeNav.tsx)**
- `TreeNav` component — collapsible left sidebar with expand/collapse per group, selectable leaves, all state persisted to localStorage (`gameTreeNav.collapsed`, `gameTreeNav.expandedGroups`, `gameTreeNav.selectedId`)

**Rewritten: [`component.tsx`](src/app/game/current/component.tsx)**
- Replaced the `SmartTabs` layout with a two-panel flex layout (sidebar + main content)
- `weights` state (previously inside `getCouncilorsUi`) hoisted here and passed down
- Builds the full content map from each module's `get*Sections()` call

**Each tab file** got a new `get*Sections(analysis)` function and individual section components extracted from the accordion content:

| File | New sections |
|------|-------------|
| [`fleets.tsx`](src/app/game/current/fleets.tsx) | `AlienFleetsSection`, `HumanEnemyFleetsSection`, `PlayerFleetsSection`, `ShipsUnderConstructionSection` |
| [`habs.tsx`](src/app/game/current/habs.tsx) | `CurrentHabBonusesSection`, `FutureHabBonusesSection`, `MCBoostIncomeSummarySection`, `AlienHateSection`, `BuildingDetailsSection`, 5 conditional project sections, `TechnologyGoalsSection`, `ManageHabsSection`, `ManageMinesSection` |
| [`resources.tsx`](src/app/game/current/resources.tsx) | `TransactionsSection`, `OwnedNationsSection`, `SpoilTargetsSection`, `MCBoostTargetsSection` |
| [`drives.tsx`](src/app/game/current/drives.tsx) | Just wires `DrivesTable`/`DriveCalculator` into the tree |
| [`councilors.tsx`](src/app/game/current/councilors.tsx) | `ExistingCouncilSection`, `FindNewCouncilorsSection`, `CurrentOrgsSection`, `HostileTakeoverSection`, `MissionsSection` |

**Tree structure:** Councilors → Fleets → Habs → Resources → Drives, each expandable with named leaves. The Habs group conditionally shows "Available Projects" leaves only when relevant data exists. Group subtitles show key summary numbers (e.g. "48 vs 72 / Orgs 0.82 vs 1.40" for councilors, "$N spoils, MC X/Y" for resources).

## Session summary:

Used 33% of 5-hour limit
Used 3% of "weekly - all models" limit

Took about 20 minutes.