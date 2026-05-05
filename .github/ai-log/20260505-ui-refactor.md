# Refactor RenderGameComponent tree-style navigation

**Session ID:** ses_2095716b7ffenVGH6d5kYQfZbz
**Created:** 5/5/2026, 12:42:38 AM
**Updated:** 5/5/2026, 1:14:48 AM

---

## User

This app has a very complicated UI that has been built up over a long time by adding lots of little pieces in a surgical manner.  We need to completely reorganize the mini-app in the RenderGameComponent displayed on the page /game/current.  Instead of a series of tabs at the top and expand/collapse sections in the page, there should instead be a (collapsible) tree-style navigation along the left side of the page to select the information to display in the main part of the page.  For example, there should be a "Councilors" tree item, which has the score details as a subtitle, then options below that for "Existing Council", "Find new", etc.  This way each individual thing is more focused, and that tree allows for quickly switching between parts. 

---

## Assistant (Build · Qwen 3.6-35B-A3B (local) · 301.3s)

_Thinking:_

The user wants me to reorganize a UI in a React/mini-app. Let me first explore the codebase to understand the current structure, the RenderGameComponent, and how the game UI is currently organized.

**Tool: task**

**Input:**
```json
{
  "description": "Explore codebase structure",
  "prompt": "Explore the codebase at terra-invicta-assistant to understand the project structure. I need to know:\n1. What framework/technologies are used (React? Vue? etc.)\n2. Where the game-related components are located\n3. Specifically find RenderGameComponent and the /game/current route\n4. Understand the current tab/expand-collapse UI structure\n5. Find all the sub-components and sections that make up the game UI\n\nBe very thorough - search for files matching patterns like *Game*, *Render*, *Council*, *Score*, *Tab*, and look at the src/ directory structure. Return a detailed summary of the file structure, relevant file paths, and how the current UI is organized.",
  "subagent_type": "explore"
}
```

**Output:**
```
task_id: ses_20956b815ffecnhEI7Wwu29ej5 (for resuming to continue this task if needed)

<task_result>
Now I have a thorough understanding of the entire codebase. Here is the comprehensive summary:

---

## Codebase Summary: Terra Invicta Assistant

### 1. Framework / Technologies

| Category | Technology |
|---|---|
| **Framework** | **Next.js 16.1.1** (App Router) |
| **Language** | TypeScript 5 |
| **UI Library** | **React 19.2.3** (client components with `"use client"`) |
| **Styling** | **Tailwind CSS 4** (`@tailwindcss/postcss`) |
| **Component Primitives** | **Radix UI** (`radix-ui` package) for Tabs, Accordion, Collapsible, Dialog, Select, Tooltip, etc. |
| **Styling Utilities** | `class-variance-authority`, `clsx`, `tailwind-merge` |
| **Icons** | `lucide-react` (generic icons like ChevronDown, HeartIcon, Trash2, Plus, etc.) + custom game icons loaded from wiki images |
| **Notifications** | `sonner` (toast notifications) |
| **Theme** | `next-themes` |
| **Other** | `json5` for parsing, `sonner` for toasts |

### 2. Top-Level Directory Structure

```
terra-invicta-assistant\
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── game/
│   │   │   ├── current/        # Main game UI route (/game/current)
│   │   │   └── static-current/ # Static version of current game
│   │   ├── debug/
│   │   │   ├── game/           # Debug page
│   │   │   └── templates/      # Debug page
│   │   ├── api/
│   │   │   └── game/
│   │   │       └── current/    # SSE API endpoint
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Home page (default Next.js placeholder)
│   │   ├── globals.css         # Global CSS
│   │   └── favicon.ico
│   ├── components/
│   │   ├── ui/                 # Shared UI primitives (Radix-based)
│   │   │   ├── accordion.tsx
│   │   │   ├── button.tsx
│   │   │   ├── collapsible.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── select.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── smart-accordion.tsx   # Persists accordion state to localStorage
│   │   │   ├── smart-tabs.tsx        # Persists tab state to localStorage
│   │   │   └── ... (more UI components)
│   │   ├── showEffects.tsx     # Main effects display component
│   │   └── icons.tsx           # All game-specific icon components
│   ├── hooks/
│   │   └── useLocalStorage.ts  # Custom localStorage hook
│   └── lib/
│       ├── analysis/           # Game data analysis engine
│       │   ├── index.ts        # Main analyzeData() entry point
│       │   ├── habs.ts
│       │   ├── planets.ts
│       │   ├── research.ts
│       │   ├── factions.ts
│       │   ├── nations.ts
│       │   ├── fleets.ts
│       │   ├── orgs.ts
│       │   ├── alien-goals.ts
│       │   ├── drives.ts
│       │   ├── player-interest.ts
│       │   ├── habSites.ts
│       │   └── ...
│       ├── savefile.ts         # Save file loading/parsing
│       ├── templates.ts        # Template definitions
│       ├── template-types.ts
│       ├── template-types-generated.ts
│       ├── localization.ts
│       └── utils.ts
├── docs/
├── public/
├── package.json
├── next.config.ts
├── tsconfig.json
├── .env / .env.template
└── README.md
```

### 3. `RenderGameComponent` and `/game/current` Route

The rendering flow for the game UI is:

```
/game/current/page.tsx          (Server Component - triggers analysis HMR)
    └── renderCurrentGame.tsx   (Client Component - loads game file via SSE + server action)
        └── RenderGameComponent  (Client Component - renders the full UI)
            └── component.tsx   (exports RenderGameComponent)
```

**File: `terra-invicta-assistant\src\app\game\current\page.tsx`**
- Server component that reads `CURRENT_GAME` env var
- Calls `analyzeData` intentionally to trigger HMR when analysis code changes
- Passes a random `renderKey` to force re-render/re-load

**File: `terra-invicta-assistant\src\app\game\current\renderCurrentGame.tsx`**
- Client component that uses `useCurrent()` to get the latest game file via Server-Sent Events (SSE) from `/api/game/current`
- Uses `loadAndAnalyzeFile()` (server action) to parse the save file
- Has retry logic (up to 5 attempts with 1s delay)
- Returns `<RenderGameComponent analysis={analysis} />` or a loading spinner

**File: `terra-invicta-assistant\src\app\game\current\component.tsx`** -- This is `RenderGameComponent`:
- **Top-level UI structure:** Shows game filename, last modified date, game date, and faction name
- **Main navigation:** Uses `SmartTabs` (localStorage-persisted tabs)
- **5 top-level tabs:**

  | Tab Key | Tab Name | Source File |
  |---|---|---|
  | `councilors` | Councilors + Orgs | `councilors.tsx` |
  | `fleets` | Fleets | `fleets.tsx` |
  | `habs` | Habs | `habs.tsx` |
  | `resources` | Resources | `resources.tsx` |
  | `drives` | Drives | `drives.tsx` |

### 4. Tab/Expand-Collapse UI Structure

The project uses **two layers of collapsible UI**, with localStorage persistence:

#### Layer 1: Main Tabs (persisted)
- Component: `SmartTabs` (`src/components/ui/smart-tabs.tsx`)
- Wraps Radix `Tabs` and persists the selected tab key to localStorage via `useLocalStorage`
- Used at the top level in `component.tsx` with `storageKey="mainTabs"`

#### Layer 2: Accordion Sections (persisted within each tab)
- Component: `SmartAccordion` (`src/components/ui/smart-accordion.tsx`)
- Wraps Radix `Accordion` and persists open/closed state to localStorage
- Supports both `type="single"` (one open at a time) and `type="multiple"` (many open)
- Supports `collapsible` (allows closing all sections)
- Each tab has its own storage key for independent persistence

#### Layer 3: Nested Tabs (within accordions)
- Some accordion sections contain nested `SmartTabs` for sub-categorization (e.g., in councilors tab: takeover by faction, missions by faction)

#### Layer 4: Collapsible (non-persisted debug buttons)
- Uses Radix `Collapsible` for "Debug Data" sections at the bottom of each tab (not persisted)

### 5. Sub-Components and Sections by Tab

#### Tab 1: Councilors (`councilors.tsx`) -- The most complex tab

**SmartAccordion sections (type="single", collapsible, storageKey="councilorsSections"):**

| Section Key | Section Title |
|---|---|
| `existing` | "Manage Existing Council" (default open) |
| `new-councilors` | "Find New Councilors" |
| `current-orgs` | "Current Organizations" |
| `takeover` | "Hostile Takeover" |
| `missions` | "Missions" |
| `other-councilors` | "Other Councilors" |

**Within "existing":** Councilor table + Available organizations table
**Within "takeover":** Nested SmartTabs (one per faction for stealable orgs)
**Within "missions":** Nested SmartTabs (one per faction) with nested SmartAccordions (one per mission)
**Within "other-councilors":** Nested Tabs (one per faction showing visible councilors)

**Supporting sub-components in councilors.tsx:**
- `CouncilorTableHeader` / `CouncilorTableRow` -- Councilor table display
- `OrgTableHeader` / `OrgTableRow` -- Organization table display
- `CouncilorsComponent` -- Main councilor panel with scoring
- `OtherCouncilorsByFaction` -- Displays other factions' councilors
- `scoreAndSort` / `getBaseCouncilorScore` / `getModifiedCouncilorScore` / `getOrganizationScore` / `getScore` -- Scoring engine
- `ScoringWeightsDialog` -- Configurable scoring weights dialog

**Bottom of tab:** "Configure Scoring" dialog button + Collapsible "Debug Data"

#### Tab 2: Fleets (`fleets.tsx`)

**SmartAccordion sections (type="multiple", storageKey="fleetsSections"):**

| Section Key | Section Title |
|---|---|
| `alien-fleets` | "Alien Fleets" |
| `human-enemy-fleets` | "Other Human Factions" |
| `player-fleets` | "Player Fleets" |
| `ships-under-construction` | "Ships Under Construction" |

**Within "alien-fleets":** Fleet table + Planetary Defense Summary table
**Bottom:** Collapsible "Debug Data"

#### Tab 3: Habs (`habs.tsx`)

**SmartAccordion sections (type="multiple", storageKey="habs"):**

| Section Key | Section Title |
|---|---|
| `current-bonuses` | "Current Hab bonuses" |
| `future-bonuses` | "Future Hab bonuses" |
| `boost-mc-summary` | "MC/Boost Income Summary" |
| `alien-hate` | "Alien Hate" |
| `building-details` | "Building Details" |
| `available-boost-projects` | "Available Boost Projects" (conditional) |
| `available-cp-projects` | "Available Control Point Projects" (default open) |
| `available-max-org-projects` | "Available Max Org Projects" (conditional) |
| `available-expand-nation-projects` | "Available Expand Nations" (conditional) |
| `available-stealable-projects` | "Available Stealable Projects" (conditional) |
| `technology-goals` | "Technology goals" |
| `habs` | "Manage Habs" |
| `mines` | "Manage Mines" |

**Within "technology-goals":** TechnologyGoalsDialog + TechnologyGoalsList
**Within "mines":** Mining bonuses card + Base income cards + Mines table with sorting
**Bottom:** Collapsible "Debug Data"

#### Tab 4: Resources (`resources.tsx`)

**SmartAccordion sections (type="single", collapsible, storageKey="resources-accordion"):**

| Section Key | Section Title |
|---|---|
| `transactions` | "Transactions" (default open) |
| `owned` | "Owned nations" |
| `spoils` | "Spoil targets" |
| `space` | "MC/Boost targets" |
| `nation-claims` | "Nation Claims" |
| `unification-candidates` | "Unification Candidates" |

**Within "nation-claims":** Nested SmartAccordion (one per nation claim target)
**Bottom:** Collapsible "Debug Data"

#### Tab 5: Drives (`drives.tsx`)

**SmartAccordion sections (type="multiple", storageKey="drives-accordion"):**

| Section Key | Section Title |
|---|---|
| `drive-table` | "Drive Systems" |
| `drive-calculator` | "Drive Calculator" |

**Within "drive-table":** Sortable table with goal management buttons (add/remove technology goals), showing drives with stats, reactor/radiator info, etc.
**Within "drive-calculator":** Interactive calculator with inputs for dry mass, radiator, target delta-V, target distance; outputs computed rows for each drive

### Key Supporting Files (cross-cutting)

| File | Purpose |
|---|---|
| `showEffects.tsx` | Renders game effects (stats, bonuses, resources, missions, traits) as icon+value displays |
| `icons.tsx` | All game-specific icon components (resources, factions, missions, tech categories, etc.) |
| `scoringWeights.tsx` | Configurable scoring weight system with prebuilt configs (midLate, earlyGame, etc.) |
| `technologyGoals.tsx` | Technology goal management (add/remove tech/projects, display prerequisites) |
| `researchLink.tsx` | Links to external tech tree viewer (optional, via env var) |
| `useCurrent.ts` | React hook for SSE-based game state updates |
| `actions.ts` | Server action for loading and analyzing game save files |
| `smart-accordion.tsx` | Accordion with localStorage persistence |
| `smart-tabs.tsx` | Tabs with localStorage persistence |

### Data Flow Summary

```
.env (CURRENT_GAME, SAVE_GAME_DIR)
  ↓
game/current/page.tsx (Server Component)
  ↓
renderCurrentGame.tsx (Client Component)
  ↓ SSE from /api/game/current → useCurrent() hook → filename
  ↓ loadAndAnalyzeFile() server action → loadSaveFile() + analyzeData()
  ↓
Analysis object (comprehensive game state)
  ↓
RenderGameComponent (component.tsx)
  ↓ Calls getXxxUi(analysis) for each tab
  ↓
[councilors.tsx, fleets.tsx, habs.tsx, resources.tsx, drives.tsx]
  ↓
SmartTabs → SmartAccordion → nested tabs/accordions
  ↓
Table rows, ShowEffects displays, icons, tooltips
```
</task_result>
```

---

## Assistant (Build · Qwen 3.6-35B-A3B (local) · 13.2s)

_Thinking:_

Now I have a thorough understanding of the codebase. Let me read the key files to understand the current implementation in detail before planning the restructure:

1. `component.tsx` - The main RenderGameComponent
2. The individual tab files to understand their content
3. The SmartTabs and SmartAccordion components

Let me read these files to understand exactly what needs to be restructured.

**Tool: read**

**Input:**
```json
{
  "filePath": "terra-invicta-assistant\\src\\app\\game\\current\\component.tsx"
}
```

**Output:**
```
<path>terra-invicta-assistant\src\app\game\current\component.tsx</path>
<type>file</type>
<content>
1: "use client";
2: 
3: import { TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
4: import { SmartTabs } from "@/components/ui/smart-tabs";
5: import { Analysis } from "@/lib/analysis";
6: import { getCouncilorsUi } from "./councilors";
7: import { getFleetsUi } from "./fleets";
8: import { getHabsUi } from "./habs";
9: import { getResourcesUi } from "./resources";
10: import { getDrivesUi } from "./drives";
11: 
12: export function RenderGameComponent({ analysis }: { analysis: Analysis }) {
13:   const tabs = [
14:     getCouncilorsUi(analysis),
15:     getFleetsUi(analysis),
16:     getHabsUi(analysis),
17:     getResourcesUi(analysis),
18:     getDrivesUi(analysis),
19:   ];
20:   return (
21:     <div className="mx-2">
22:       <h2>
23:         Game: {analysis.fileName} ({analysis.lastModified?.toLocaleString()}) - Game date:{" "}
24:         {analysis.gameCurrentDateTimeFormatted.split(" ")[0]}
25:       </h2>
26:       <h3>Faction: {analysis.playerFaction.displayName}</h3>
27: 
28:       <SmartTabs storageKey="mainTabs" defaultValue={tabs[0].key}>
29:         <TabsList>
30:           {tabs.map((tab) => (
31:             <TabsTrigger key={tab.key} value={tab.key}>
32:               {tab.tab}
33:             </TabsTrigger>
34:           ))}
35:         </TabsList>
36:         {tabs.map((tab) => (
37:           <TabsContent key={tab.key} value={tab.key}>
38:             {tab.content}
39:           </TabsContent>
40:         ))}
41:       </SmartTabs>
42:     </div>
43:   );
44: }

(End of file - total 44 lines)
</content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "terra-invicta-assistant\\src\\components\\ui\\smart-tabs.tsx"
}
```

**Output:**
```
<path>terra-invicta-assistant\src\components\ui\smart-tabs.tsx</path>
<type>file</type>
<content>
1: "use client";
2: 
3: import { Tabs } from "@/components/ui/tabs";
4: import { useLocalStorage } from "@/hooks/useLocalStorage";
5: import * as React from "react";
6: import { Tabs as TabsPrimitive } from "radix-ui";
7: 
8: interface SmartTabsProps extends Omit<React.ComponentProps<typeof TabsPrimitive.Root>, "value" | "onValueChange" | "defaultValue"> {
9:   storageKey: string;
10:   defaultValue: string;
11: }
12: 
13: /**
14:  * A Tabs component that persists the selected tab to localStorage.
15:  * Multiple instances with the same storageKey will stay in sync.
16:  */
17: export function SmartTabs({ storageKey, defaultValue, children, ...props }: SmartTabsProps) {
18:   const [value, setValue] = useLocalStorage(storageKey, defaultValue);
19: 
20:   return (
21:     <Tabs value={value} onValueChange={setValue} {...props}>
22:       {children}
23:     </Tabs>
24:   );
25: }

(End of file - total 25 lines)
</content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "terra-invicta-assistant\\src\\components\\ui\\smart-accordion.tsx"
}
```

**Output:**
```
<path>terra-invicta-assistant\src\components\ui\smart-accordion.tsx</path>
<type>file</type>
<content>
1: "use client";
2: 
3: import { Accordion } from "@/components/ui/accordion";
4: import { useLocalStorage } from "@/hooks/useLocalStorage";
5: import * as React from "react";
6: import { Accordion as AccordionPrimitive } from "radix-ui";
7: 
8: type SmartAccordionSingleProps = Omit<React.ComponentProps<typeof AccordionPrimitive.Root> & { type: "single" }, "value" | "onValueChange" | "defaultValue"> & {
9:   storageKey: string;
10:   defaultValue?: string;
11: };
12: 
13: type SmartAccordionMultipleProps = Omit<React.ComponentProps<typeof AccordionPrimitive.Root> & { type: "multiple" }, "value" | "onValueChange" | "defaultValue"> & {
14:   storageKey: string;
15:   defaultValue?: string[];
16: };
17: 
18: type SmartAccordionProps = SmartAccordionSingleProps | SmartAccordionMultipleProps;
19: 
20: /**
21:  * An Accordion component that persists the open/closed state to localStorage.
22:  * Multiple instances with the same storageKey will stay in sync.
23:  */
24: export function SmartAccordion({ storageKey, defaultValue, children, ...props }: SmartAccordionProps) {
25:   const [value, setValue] = useLocalStorage(storageKey, defaultValue || (props.type === "multiple" ? [] : ""));
26: 
27:   return (
28:     <Accordion value={value as any} onValueChange={setValue as any} {...props}>
29:       {children}
30:     </Accordion>
31:   );
32: }

(End of file - total 32 lines)
</content>
```

---

## Assistant (Build · Qwen 3.6-35B-A3B (local) · 8.2s)

_Thinking:_

Now let me read the individual tab files to understand their content and structure. I need to understand what sections/subsections each tab has so I can build the tree navigation properly.

**Tool: read**

**Input:**
```json
{
  "filePath": "terra-invicta-assistant\\src\\app\\game\\current\\councilors.tsx"
}
```

**Output:**
```
<path>terra-invicta-assistant\src\app\game\current\councilors.tsx</path>
<type>file</type>
<content>
1: "use client";
2: 
3: import { useState, useEffect } from "react";
4: import { combineEffects, ShowEffects, ShowEffectsProps } from "@/components/showEffects";
5: import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
6: import { SmartAccordion } from "@/components/ui/smart-accordion";
7: import { Button } from "@/components/ui/button";
8: import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
9: import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
10: import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
11: import { Analysis } from "@/lib/analysis";
12: import { MissionDataName, TraitDataName } from "@/lib/template-types-generated";
13: import { MinusCircleIcon, PlusCircleIcon } from "lucide-react";
14: import { defaultScoringWeights, loadWeightsFromStorage, ScoringWeights, ScoringWeightsDialog } from "./scoringWeights";
15: import { Administration, MissionIcons, TraitIcons, UnknownIcon } from "@/components/icons";
16: import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
17: import { SmartTabs } from "@/components/ui/smart-tabs";
18: import { twMerge } from "tailwind-merge";
19: 
20: function CouncilorTableHeader({ hasOrgs }: { hasOrgs?: boolean }) {
21:   return (
22:     <TableHeader>
23:       <TableRow>
24:         <TableHead>Name</TableHead>
25:         <TableHead>Modified Stats</TableHead>
26:         {hasOrgs && <TableHead>Org Tiers</TableHead>}
27:         <TableHead>Monthly Effects</TableHead>
28:         <TableHead>Priorities</TableHead>
29:         <TableHead>Science</TableHead>
30:         <TableHead>Missions</TableHead>
31:         <TableHead>Score</TableHead>
32:         <TableHead>NM Score</TableHead>
33:         <TableHead>CP Cap</TableHead>
34:       </TableRow>
35:     </TableHeader>
36:   );
37: }
38: 
39: function OrgTableHeader({ costHeader }: { costHeader?: string }) {
40:   return (
41:     <TableHeader>
42:       <TableRow>
43:         <TableHead>Org Name</TableHead>
44:         <TableHead>Requirements</TableHead>
45:         <TableHead>Tier</TableHead>
46:         {costHeader ? <TableHead>{costHeader}</TableHead> : <TableHead>Purchase / Transfer</TableHead>}
47:         <TableHead>Monthly</TableHead>
48:         <TableHead>Effects</TableHead>
49:         <TableHead>Score</TableHead>
50:         <TableHead>NM Score</TableHead>
51:       </TableRow>
52:     </TableHeader>
53:   );
54: }
55: 
56: function CouncilorTableRow({
57:   councilor,
58:   stats,
59:   label,
60:   hasOrgs,
61:   highlightMissionClassName,
62: }: {
63:   councilor: Analysis["playerCouncilors"][number] & { score?: ScoreResult };
64:   stats: Analysis["playerCouncilors"][number]["effectsWithOrgsAndAugments"];
65:   label: string;
66:   hasOrgs?: boolean;
67:   highlightMissionClassName?: (missionName: MissionDataName) => string | undefined;
68: }) {
69:   const admin = Math.min(25, Math.max(0, (stats.administration || 0) + (stats.Administration || 0)));
70:   const orgTiers = councilor.orgs.reduce((a, b) => a + b.tier, 0);
71:   const cpCap =
72:     Math.min(25, Math.max(0, stats.persuasion || 0) + Math.max(0, stats.Persuasion || 0)) +
73:     Math.min(25, Math.max(0, stats.command || 0) + Math.max(0, stats.Command || 0)) +
74:     Math.min(25, Math.max(0, stats.administration || 0) + Math.max(0, stats.Administration || 0));
75:   return (
76:     <TableRow key={`${councilor.id}-${label}`}>
77:       <TableCell>{label}</TableCell>
78:       <TableCell>
79:         <ShowEffects
80:           persuasion={stats.persuasion}
81:           command={stats.command}
82:           investigation={stats.investigation}
83:           espionage={stats.espionage}
84:           administration={stats.administration}
85:           science={stats.science}
86:           security={stats.security}
87:           Persuasion={stats.Persuasion}
88:           Command={stats.Command}
89:           Investigation={stats.Investigation}
90:           Espionage={stats.Espionage}
91:           Administration={stats.Administration}
92:           Science={stats.Science}
93:           Security={stats.Security}
94:           ApparentLoyalty={stats.ApparentLoyalty}
95:           Loyalty={stats.Loyalty}
96:           maxLoyalty={stats.maxLoyalty}
97:           xpModifier={stats.xpModifier}
98:           xp={stats.xp}
99:           traitTemplateNames={stats.traitTemplateNames}
100:           typeTemplateName={stats.typeTemplateName}
101:           playerIntel={stats.playerIntel}
102:           playerMaxIntel={stats.playerMaxIntel}
103:           lastRecordedLoyalty={stats.lastRecordedLoyalty}
104:           // TODO: is there a case where we should show this?
105:           // Loyalty={stats.Loyalty}
106:         />
107:       </TableCell>
108:       {hasOrgs && (
109:         <TableCell>
110:           <ShowEffects tier={stats.tier} highlightTier={orgTiers < admin} />
111:         </TableCell>
112:       )}
113:       <TableCell>
114:         <ShowEffects
115:           incomeBoost_month={stats.incomeBoost_month}
116:           incomeMoney_month={stats.incomeMoney_month}
117:           incomeInfluence_month={stats.incomeInfluence_month}
118:           incomeOps_month={stats.incomeOps_month}
119:           incomeMissionControl={stats.incomeMissionControl}
120:           incomeResearch_month={stats.incomeResearch_month}
121:           projectCapacityGranted={stats.projectCapacityGranted}
122:         />
123:       </TableCell>
124:       <TableCell>
125:         <span className="text-wrap leading-6 -my-2 inline-block">
126:           <ShowEffects
127:             economyBonus={stats.economyBonus}
128:             welfareBonus={stats.welfareBonus}
129:             environmentBonus={stats.environmentBonus}
130:             knowledgeBonus={stats.knowledgeBonus}
131:             governmentBonus={stats.governmentBonus}
132:             unityBonus={stats.unityBonus}
133:             militaryBonus={stats.militaryBonus}
134:             oppressionBonus={stats.oppressionBonus}
135:             spoilsBonus={stats.spoilsBonus}
136:             spaceDevBonus={stats.spaceDevBonus}
137:             spaceflightBonus={stats.spaceflightBonus}
138:             MCBonus={stats.MCBonus}
139:             miningBonus={stats.miningBonus}
140:           />
141:         </span>
142:       </TableCell>
143:       <TableCell>
144:         <span className="text-wrap leading-6 -my-2 inline-block">
145:           <ShowEffects councilorTechBonus={stats.councilorTechBonus} techBonuses={stats.techBonuses} />
146:         </span>
147:       </TableCell>
148:       <TableCell>
149:         <span className="text-wrap leading-6 -my-2 inline-block">
150:           <ShowEffects
151:             missionsGrantedNames={stats.missionsGrantedNames}
152:             highlightMissionClassName={highlightMissionClassName}
153:           />
154:         </span>
155:       </TableCell>
156:       {councilor.score === undefined ? null : (
157:         <>
158:           <TableCell>
159:             <Tooltip>
160:               <TooltipTrigger>{councilor.score.value?.toFixed(2)}</TooltipTrigger>
161:               <TooltipContent align="end" className="max-w-auto">
162:                 <pre className="p-2">{councilor.score.details}</pre>
163:               </TooltipContent>
164:             </Tooltip>
165:           </TableCell>
166:           <TableCell>{councilor.score.noMissionScore?.toFixed(2)}</TableCell>
167:           <TableCell>{cpCap?.toFixed(0)}</TableCell>
168:         </>
169:       )}
170:     </TableRow>
171:   );
172: }
173: 
174: function OrgTableRow({
175:   org,
176:   playerNationIds,
177:   playerTraits,
178:   highlightMissionClassName,
179:   isTakeover,
180: }: {
181:   org: Analysis["playerAvailableOrgs"][number] & {
182:     type?: string;
183:     score?: ScoreResult;
184:     councilor?: string;
185:     councilorId?: number;
186:   };
187:   playerNationIds: Set<number>;
188:   playerTraits: Set<string>;
189:   highlightMissionClassName?: (missionName: MissionDataName) => string | undefined;
190:   isTakeover?: boolean;
191: }) {
192:   const missingRequiredTraits = org.template?.requiredOwnerTraits?.filter((t) => !playerTraits.has(t)) || [];
193:   function traitIcon(trait: TraitDataName, Fallback: typeof PlusCircleIcon) {
194:     return TraitIcons[trait] || Fallback;
195:   }
196:   return (
197:     <TableRow
198:       key={org.id}
199:       className={twMerge(org.isAdminOrg ? "bg-green-100" : "", org.type === "unassigned" ? "bg-yellow-100" : "")}
200:     >
201:       <TableCell>{org.displayName}</TableCell>
202:       <TableCell>
203:         {org.template?.requiresNationality && (
204:           <span className="mr-1" title={`Required Nation: ${org.homeNationName || ""}`}>
205:             {playerNationIds.has(org.homeNationId || -1) ? (
206:               <PlusCircleIcon className="inline h-4 w-4 stroke-green-700 -mt-1 bg-transparent" />
207:             ) : (
208:               <MinusCircleIcon className="inline h-4 w-4 stroke-destructive -mt-1" />
209:             )}
210:           </span>
211:         )}
212:         {org.template?.requiredOwnerTraits && (
213:           <span className="mr-1" title={"Required Traits: " + org.template.requiredOwnerTraits.join(", ")}>
214:             {missingRequiredTraits.length === 0
215:               ? org.template.requiredOwnerTraits.map((trait, ix) => {
216:                   const Icon = traitIcon(trait, PlusCircleIcon);
217:                   return <Icon key={ix} className="inline h-4 w-4 stroke-green-700 -mt-1" />;
218:                 })
219:               : missingRequiredTraits.map((trait, ix) => {
220:                   const Icon = traitIcon(trait, MinusCircleIcon);
221:                   return <Icon key={ix} className="inline h-4 w-4 stroke-destructive -mt-1" />;
222:                 })}
223:           </span>
224:         )}
225:         {org.template?.prohibitedOwnerTraits && (
226:           <span className="mr-1" title={"Prohibited Traits: " + org.template.prohibitedOwnerTraits.join(", ")}>
227:             {org.template.prohibitedOwnerTraits.map((trait, ix) => {
228:               const Icon = traitIcon(trait, MinusCircleIcon);
229:               return <Icon key={ix} className="inline h-4 w-4 stroke-blue-700 -mt-1" />;
230:             })}
231:           </span>
232:         )}
233:       </TableCell>
234:       <TableCell>
235:         <ShowEffects tier={org.tier} />
236:       </TableCell>
237:       <TableCell>
238:         {org.type === "unassigned" && "T "}
239:         {org.type === "available" || org.type === "unassigned" ? (
240:           <ShowEffects
241:             costMoney={(org.costMoney || 0) * (org.type === "available" ? 1 : orgTransferFactor)}
242:             costInfluence={(org.costInfluence || 0) * (org.type === "available" ? 1 : orgTransferFactor)}
243:             costOps={(org.costOps || 0) * (org.type === "available" ? 1 : orgTransferFactor)}
244:             costBoost={(org.costBoost || 0) * (org.type === "available" ? 1 : orgTransferFactor)}
245:           />
246:         ) : org.type == "stealable" && isTakeover ? (
247:           (() => {
248:             const target = org as any as Analysis["playerStealableOrgs"][number];
249:             return (
250:               <>
251:                 {target.councilor ?? "Unassigned"} from {target.faction?.displayName}, Admin: {target.admin} +
252:                 takeoverDefense: {target.takeoverDefense}
253:               </>
254:             );
255:           })()
256:         ) : org.type === "used" ? (
257:           <>{org.councilor ?? "Unassigned"}</>
258:         ) : null}
259:       </TableCell>
260:       <TableCell>
261:         <ShowEffects
262:           incomeBoost_month={org.incomeBoost_month}
263:           incomeMoney_month={org.incomeMoney_month}
264:           incomeInfluence_month={org.incomeInfluence_month}
265:           incomeOps_month={org.incomeOps_month}
266:           incomeMissionControl={org.incomeMissionControl}
267:           incomeResearch_month={org.incomeResearch_month}
268:           projectCapacityGranted={org.projectCapacityGranted}
269:         />
270:       </TableCell>
271:       <TableCell>
272:         <ShowEffects
273:           persuasion={org.persuasion}
274:           command={org.command}
275:           investigation={org.investigation}
276:           espionage={org.espionage}
277:           administration={org.administration}
278:           science={org.science}
279:           security={org.security}
280:           economyBonus={org.economyBonus}
281:           welfareBonus={org.welfareBonus}
282:           environmentBonus={org.environmentBonus}
283:           knowledgeBonus={org.knowledgeBonus}
284:           governmentBonus={org.governmentBonus}
285:           unityBonus={org.unityBonus}
286:           militaryBonus={org.militaryBonus}
287:           oppressionBonus={org.oppressionBonus}
288:           spoilsBonus={org.spoilsBonus}
289:           spaceDevBonus={org.spaceDevBonus}
290:           spaceflightBonus={org.spaceflightBonus}
291:           MCBonus={org.MCBonus}
292:           miningBonus={org.miningBonus}
293:           techBonuses={org.template?.techBonuses}
294:           missionsGrantedNames={org.template?.missionsGrantedNames || []}
295:           highlightMissionClassName={highlightMissionClassName}
296:         />
297:       </TableCell>
298:       {org.score === undefined ? null : (
299:         <>
300:           <TableCell>
301:             <Tooltip>
302:               <TooltipTrigger>{org.score.value?.toFixed(2)}</TooltipTrigger>
303:               <TooltipContent align="end" className="max-w-auto">
304:                 <pre className="p-2">{org.score.details}</pre>
305:               </TooltipContent>
306:             </Tooltip>
307:           </TableCell>
308:           <TableCell>{org.score.noMissionScore?.toFixed(2)}</TableCell>
309:         </>
310:       )}
311:     </TableRow>
312:   );
313: }
314: 
315: export function getCouncilorsUi(analysis: Analysis) {
316:   const { playerMissionCounts } = analysis;
317:   const [weights, setWeights] = useState<ScoringWeights>(defaultScoringWeights);
318: 
319:   useEffect(() => {
320:     setWeights(loadWeightsFromStorage());
321:   }, []);
322: 
323:   const scoredModifiedCouncilors = scoreAndSort(
324:     analysis.playerCouncilors,
325:     weights,
326:     playerMissionCounts,
327:     getModifiedCouncilorScore
328:   );
329:   const scoredAvailableCouncilors = scoreAndSort(
330:     analysis.playerAvailableCouncilors,
331:     weights,
332:     playerMissionCounts,
333:     getBaseCouncilorScore
334:   );
335:   const scoredBaseCouncilors = scoreAndSort(
336:     analysis.playerCouncilors,
337:     weights,
338:     playerMissionCounts,
339:     getBaseCouncilorScore
340:   );
341:   const scoredOrgs = scoreAndSort(
342:     analysis.playerAvailableOrgs
343:       .map((i) => ({ type: "available", ...i }))
344:       .concat(analysis.playerUnassignedOrgs.map((i) => ({ type: "unassigned", ...i }))),
345:     weights,
346:     playerMissionCounts,
347:     getOrganizationScore,
348:     "noMissionScore" // ignore missions when sorting orgs
349:   ).toSorted((a, b) => (a.isAdminOrg === b.isAdminOrg ? 0 : a.isAdminOrg ? -1 : 1)); // admin orgs first
350:   const usedOrgs = analysis.playerCouncilors.flatMap((councilor) =>
351:     councilor.orgs.map((o) => ({ ...o, type: "used", councilor: councilor.displayName, councilorId: councilor.id }))
352:   );
353:   const scoredUsedOrgs = scoreAndSort(usedOrgs, weights, playerMissionCounts, getOrganizationScore);
354:   const scoredOwnedOrgs = scoreAndSort(
355:     analysis.playerUnassignedOrgs.map((i) => ({ type: "unassigned", ...i })).concat(usedOrgs),
356:     weights,
357:     playerMissionCounts,
358:     getOrganizationScore
359:   );
360: 
361:   const bestAvailableCouncilor = scoredAvailableCouncilors[0]?.score.value;
362:   const worstExistingCouncilor = scoredBaseCouncilors[scoredBaseCouncilors.length - 1]?.score.value;
363:   const bestAvailableOrg = scoredOrgs[0]?.score.value;
364:   const worstExistingOrg = scoredUsedOrgs[scoredUsedOrgs.length - 1]?.score.value;
365: 
366:   return {
367:     key: "councilors",
368:     tab: (
369:       <>
370:         Councilors ({worstExistingCouncilor?.toFixed(0)} vs. {bestAvailableCouncilor?.toFixed(0)}) / Orgs (
371:         {worstExistingOrg?.toFixed(2)} vs {bestAvailableOrg?.toFixed(2)})
372:       </>
373:     ),
374:     content: (
375:       <CouncilorsComponent
376:         {...{
377:           analysis,
378:           weights,
379:           setWeights,
380:           scoredModifiedCouncilors,
381:           scoredAvailableCouncilors,
382:           scoredBaseCouncilors,
383:           scoredOrgs,
384:           scoredUsedOrgs,
385:           scoredOwnedOrgs,
386:         }}
387:       />
388:     ),
389:   };
390: }
391: 
392: function CouncilorsComponent({
393:   analysis,
394:   weights,
395:   setWeights,
396:   scoredModifiedCouncilors,
397:   scoredAvailableCouncilors,
398:   scoredBaseCouncilors,
399:   scoredOrgs,
400:   scoredOwnedOrgs,
401: }: {
402:   analysis: Analysis;
403:   weights: ScoringWeights;
404:   setWeights: (weights: ScoringWeights) => void;
405:   scoredModifiedCouncilors: (Analysis["playerCouncilors"][number] & { score: ScoreResult })[];
406:   scoredAvailableCouncilors: (Analysis["playerAvailableCouncilors"][number] & { score: ScoreResult })[];
407:   scoredBaseCouncilors: (Analysis["playerCouncilors"][number] & { score: ScoreResult })[];
408:   scoredOrgs: (Analysis["playerAvailableOrgs"][number] & { type: string; score: ScoreResult })[];
409:   scoredOwnedOrgs: (Analysis["playerAvailableOrgs"][number] & {
410:     type: string;
411:     score: ScoreResult;
412:     councilor?: string;
413:     councilorId?: number;
414:   })[];
415: }) {
416:   const {
417:     playerMissionCounts,
418:     playerVisibleCouncilors,
419:     playerCouncilors,
420:     playerAvailableOrgs,
421:     playerUnassignedOrgs,
422:     playerFaction,
423:     playerStealableOrgs,
424:     factionsById,
425:   } = analysis;
426:   const scoredStealableOrgs = scoreAndSort(
427:     analysis.playerStealableOrgs.map((i) => ({ type: "stealable", ...i })),
428:     weights,
429:     playerMissionCounts,
430:     getOrganizationScore,
431:     "noMissionScore"
432:   );
433: 
434:   function currentHighlightMissionClassName(missionName: MissionDataName) {
435:     // if we have exactly 2, show yellow BG, if we have 1, show red, otherwise no change to bg
436:     const count = playerMissionCounts.get(missionName) || 0;
437:     if (count === 2) {
438:       return "bg-yellow-300/50";
439:     } else if (count === 1) {
440:       return "bg-red-300/50";
441:     }
442:   }
443:   function availableHighlightMissionClassName(missionName: MissionDataName) {
444:     // if we have 1, show yellow BG, if we have 0, show green, otherwise no change to bg
445:     const count = playerMissionCounts.get(missionName) || 0;
446:     if (count === 1) {
447:       return "bg-yellow-300/50";
448:     } else if (count === 0) {
449:       return "bg-green-300/50";
450:     }
451:   }
452:   const playerNationIds = new Set(analysis.playerNationIds);
453:   const playerTraits = new Set(analysis.playerCouncilors.flatMap((i) => i.traitTemplateNames));
454:   const unusedAdmin = analysis.playerCouncilors
455:     .map(
456:       (c) =>
457:         Math.min(
458:           25,
459:           Math.max(
460:             0,
461:             (c.effectsWithOrgsAndAugments.Administration || 0) + (c.effectsWithOrgsAndAugments.administration || 0)
462:           )
463:         ) - c.orgs.reduce((a, b) => a + b.tier, 0)
464:     )
465:     .reduce((a, b) => a + b, 0);
466: 
467:   const stealableOrgsByFaction = scoredStealableOrgs.reduce((acc, org) => {
468:     const key = org.faction?.id || 0;
469:     if (!acc.has(key)) {
470:       acc.set(key, []);
471:     }
472:     acc.get(key)!.push(org);
473:     return acc;
474:   }, new Map<number, typeof scoredStealableOrgs>());
475: 
476:   type MissionSource =
477:     | {
478:         type: "councilor";
479:         councilor: Analysis["playerCouncilors"][number];
480:         factionId: number | undefined;
481:         missions: MissionDataName[];
482:       }
483:     | {
484:         type: "org";
485:         org: Analysis["playerAvailableOrgs"][number];
486:         factionId: number | undefined;
487:         missions: MissionDataName[];
488:       };
489: 
490:   const sourcesByFactionByMission = [...playerCouncilors, ...playerVisibleCouncilors]
491:     .map(
492:       (i) =>
493:         ({
494:           type: "councilor",
495:           councilor: i,
496:           factionId: i.factionId,
497:           missions: i.effectsWithOrgsAndAugments.missionsGrantedNames || [],
498:         } as MissionSource)
499:     )
500:     .concat(
501:       [...playerAvailableOrgs, ...playerUnassignedOrgs].map((i) => ({
502:         type: "org",
503:         org: i,
504:         factionId: playerFaction?.id,
505:         missions: i.template?.missionsGrantedNames || [],
506:       }))
507:     )
508:     .concat(
509:       playerStealableOrgs.map((i) => ({
510:         type: "org",
511:         org: i,
512:         factionId: i.faction?.id,
513:         missions: i.template?.missionsGrantedNames || [],
514:       }))
515:     )
516:     .reduce((acc, o) => {
517:       const key = o.factionId || 0;
518:       if (!acc.has(key)) {
519:         acc.set(key, new Map<string, MissionSource[]>());
520:       }
521:       const effectsMap = acc.get(key)!;
522:       o.missions.forEach((m) => {
523:         if (!effectsMap.has(m)) {
524:           effectsMap.set(m, []);
525:         }
526:         effectsMap.get(m)!.push(o);
527:       });
528:       return acc;
529:     }, new Map<number, Map<string, MissionSource[]>>());
530:   const factions = Array.from(sourcesByFactionByMission.keys())
531:     .map((factionId) => factionsById.get(factionId)!)
532:     .filter((f) => f)
533:     .toSorted((a, b) => {
534:       if (a.id === playerFaction.id) return -1;
535:       if (b.id === playerFaction.id) return 1;
536:       return (a.displayName || "").localeCompare(b.displayName || "");
537:     });
538: 
539:   const importantMissions = ["Assassinate"];
540: 
541:   const councilEffects = scoredModifiedCouncilors.reduce((acc, councilor) => {
542:     return combineEffects(acc, councilor.effectsWithOrgsAndAugments);
543:   }, {} as ShowEffectsProps);
544: 
545:   // TODO: would be cool to click an effect icon and sort everything by that (ie. click persuasion icon to see who/org gives most persuasion)
546:   return (
547:     <div className="space-y-2">
548:       <SmartAccordion type="single" collapsible storageKey="councilorsSections" defaultValue="existing">
549:         <AccordionItem value="existing">
550:           <AccordionTrigger>
551:             <span>
552:               Manage Existing Council ({unusedAdmin.toFixed(0)} <Administration />)
553:             </span>
554:           </AccordionTrigger>
555:           <AccordionContent>
556:             <div className="py-1">
557:               <ShowEffects
558:                 incomeBoost_month={councilEffects.incomeBoost_month}
559:                 incomeMoney_month={councilEffects.incomeMoney_month}
560:                 incomeInfluence_month={councilEffects.incomeInfluence_month}
561:                 incomeOps_month={councilEffects.incomeOps_month}
562:                 incomeMissionControl={councilEffects.incomeMissionControl}
563:                 incomeResearch_month={councilEffects.incomeResearch_month}
564:                 projectCapacityGranted={councilEffects.projectCapacityGranted}
565:               />
566:               <ShowEffects
567:                 economyBonus={councilEffects.economyBonus}
568:                 welfareBonus={councilEffects.welfareBonus}
569:                 environmentBonus={councilEffects.environmentBonus}
570:                 knowledgeBonus={councilEffects.knowledgeBonus}
571:                 governmentBonus={councilEffects.governmentBonus}
572:                 unityBonus={councilEffects.unityBonus}
573:                 militaryBonus={councilEffects.militaryBonus}
574:                 oppressionBonus={councilEffects.oppressionBonus}
575:                 spoilsBonus={councilEffects.spoilsBonus}
576:                 spaceDevBonus={councilEffects.spaceDevBonus}
577:                 spaceflightBonus={councilEffects.spaceflightBonus}
578:                 MCBonus={councilEffects.MCBonus}
579:                 miningBonus={councilEffects.miningBonus}
580:               />
581:               <ShowEffects
582:                 councilorTechBonus={councilEffects.councilorTechBonus}
583:                 techBonuses={councilEffects.techBonuses}
584:               />
585:             </div>
586:             <Table>
587:               <CouncilorTableHeader hasOrgs />
588:               <TableBody>
589:                 {scoredModifiedCouncilors.map((councilor) => (
590:                   <CouncilorTableRow
591:                     key={councilor.id}
592:                     councilor={councilor}
593:                     stats={councilor.effectsWithOrgsAndAugments}
594:                     label={councilor.displayName!}
595:                     hasOrgs
596:                     highlightMissionClassName={currentHighlightMissionClassName}
597:                   />
598:                 ))}
599:               </TableBody>
600:             </Table>
601:             <h3 className="mt-1">Available Organizations:</h3>
602:             <Table>
603:               <OrgTableHeader />
604:               <TableBody>
605:                 {scoredOrgs.map((org) => (
606:                   <OrgTableRow
607:                     key={org.id}
608:                     org={org}
609:                     playerNationIds={playerNationIds}
610:                     playerTraits={playerTraits}
611:                     highlightMissionClassName={availableHighlightMissionClassName}
612:                   />
613:                 ))}
614:               </TableBody>
615:             </Table>
616:           </AccordionContent>
617:         </AccordionItem>
618:         <AccordionItem value="new-councilors">
619:           <AccordionTrigger>Find New Councilors</AccordionTrigger>
620:           <AccordionContent>
621:             <h3>Available Councilors:</h3>
622:             <Table>
623:               <CouncilorTableHeader />
624:               <TableBody>
625:                 {scoredAvailableCouncilors.map((councilor) => (
626:                   <CouncilorTableRow
627:                     key={councilor.id}
628:                     councilor={councilor}
629:                     stats={councilor.effectsBaseAndUnaugmentedTraits}
630:                     label={councilor.displayName!}
631:                     highlightMissionClassName={availableHighlightMissionClassName}
632:                   />
633:                 ))}
634:               </TableBody>
635:             </Table>
636: 
637:             <h3 className="mt-1">Unmodified Active Councilors:</h3>
638:             <Table>
639:               <CouncilorTableHeader />
640:               <TableBody>
641:                 {scoredBaseCouncilors.map((councilor) => (
642:                   <CouncilorTableRow
643:                     key={`${councilor.id}-base`}
644:                     councilor={councilor}
645:                     stats={councilor.effectsBaseAndUnaugmentedTraits}
646:                     label={`${councilor.displayName}`}
647:                     highlightMissionClassName={currentHighlightMissionClassName}
648:                   />
649:                 ))}
650:               </TableBody>
651:             </Table>
652:           </AccordionContent>
653:         </AccordionItem>
654:         <AccordionItem value="current-orgs">
655:           <AccordionTrigger>Current Organizations</AccordionTrigger>
656:           <AccordionContent>
657:             <Table>
658:               <OrgTableHeader costHeader="Councilor" />
659:               <TableBody>
660:                 {scoredOwnedOrgs.toReversed().map((org) => (
661:                   <OrgTableRow
662:                     key={org.id}
663:                     org={org}
664:                     playerNationIds={playerNationIds}
665:                     playerTraits={playerTraits}
666:                     highlightMissionClassName={availableHighlightMissionClassName}
667:                   />
668:                 ))}
669:               </TableBody>
670:             </Table>
671:           </AccordionContent>
672:         </AccordionItem>
673:         <AccordionItem value="takeover">
674:           <AccordionTrigger>Hostile Takeover</AccordionTrigger>
675:           <AccordionContent>
676:             <SmartTabs
677:               storageKey="councilorsTakeoverTabs"
678:               defaultValue={`faction-${Array.from(stealableOrgsByFaction.keys())[0]}`}
679:             >
680:               <TabsList>
681:                 {Array.from(stealableOrgsByFaction.entries()).map(([factionId, orgs]) => (
682:                   <TabsTrigger key={factionId} value={`faction-${factionId}`}>
683:                     {orgs[0].faction?.displayName || "Unknown Faction"} ({orgs.length})
684:                   </TabsTrigger>
685:                 ))}
686:               </TabsList>
687:               {Array.from(stealableOrgsByFaction.entries()).map(([factionId, orgs]) => (
688:                 <TabsContent key={factionId} value={`faction-${factionId}`}>
689:                   <Table>
690:                     <OrgTableHeader costHeader="Takeover" />
691:                     <TableBody>
692:                       {orgs.map((org) => (
693:                         <OrgTableRow
694:                           key={org.id}
695:                           org={org}
696:                           playerNationIds={playerNationIds}
697:                           playerTraits={playerTraits}
698:                           highlightMissionClassName={availableHighlightMissionClassName}
699:                           isTakeover
700:                         />
701:                       ))}
702:                     </TableBody>
703:                   </Table>
704:                 </TabsContent>
705:               ))}
706:             </SmartTabs>
707:           </AccordionContent>
708:         </AccordionItem>
709:         <AccordionItem value="missions">
710:           <AccordionTrigger>Missions</AccordionTrigger>
711:           <AccordionContent>
712:             <SmartTabs storageKey="councilorsMissionsTabs" defaultValue={`faction-${factions[0].id}`}>
713:               <TabsList>
714:                 {factions.map((faction) => (
715:                   <TabsTrigger key={faction.id} value={`faction-${faction.id}`}>
716:                     {faction.displayName || "Unknown Faction"} ({sourcesByFactionByMission.get(faction.id)?.size || 0})
717:                     {importantMissions
718:                       .filter(
719:                         (m) =>
720:                           sourcesByFactionByMission
721:                             .get(faction.id)
722:                             ?.get(m)
723:                             ?.filter((i) => i.type === "councilor")?.length ?? 0 > 0
724:                       )
725:                       .map((m) => {
726:                         const MissionIcon = MissionIcons[m] || UnknownIcon;
727:                         return (
728:                           <span key={m} className="inline-block -mt-2">
729:                             <MissionIcon className="h-4 w-4" />
730:                           </span>
731:                         );
732:                       })}
733:                   </TabsTrigger>
734:                 ))}
735:               </TabsList>
736:               {factions.map((faction) => (
737:                 <TabsContent key={faction.id} value={`faction-${faction.id}`}>
738:                   <SmartAccordion type="single" collapsible storageKey={`councilorsMissions-${faction.id}`}>
739:                     {Array.from(
740:                       new Set([
741:                         ...importantMissions,
742:                         ...Array.from(sourcesByFactionByMission.get(faction.id)?.keys() || []),
743:                       ])
744:                     ).map((missionName) => {
745:                       const sources = sourcesByFactionByMission.get(faction.id)?.get(missionName) || [];
746:                       const MissionIcon = MissionIcons[missionName] || UnknownIcon;
747:                       return (
748:                         <AccordionItem key={missionName} value={missionName}>
749:                           <AccordionTrigger>
750:                             <span>
751:                               <MissionIcon /> {missionName} &ndash;{" "}
752:                               {sources.filter((i) => i.type === "councilor").length} Councilors &lt;-{" "}
753:                               {sources.filter((i) => i.type === "org").length} Orgs
754:                             </span>
755:                           </AccordionTrigger>
756:                           <AccordionContent>
757:                             <Table>
758:                               <OrgTableHeader costHeader="Takeover" />
759:                               <TableBody>
760:                                 {sources?.map((src) =>
761:                                   src.type === "org" ? (
762:                                     <OrgTableRow
763:                                       key={`councilor-${src.org.id}-mission-${missionName}`}
764:                                       org={src.org}
765:                                       playerNationIds={playerNationIds}
766:                                       playerTraits={playerTraits}
767:                                     />
768:                                   ) : (
769:                                     <CouncilorTableRow
770:                                       key={`org-${src.councilor.id}-mission-${missionName}`}
771:                                       councilor={src.councilor}
772:                                       stats={src.councilor.effectsWithOrgsAndAugments}
773:                                       label={src.councilor.displayName!}
774:                                     />
775:                                   )
776:                                 )}
777:                               </TableBody>
778:                             </Table>
779:                           </AccordionContent>
780:                         </AccordionItem>
781:                       );
782:                     })}
783:                   </SmartAccordion>
784:                 </TabsContent>
785:               ))}
786:             </SmartTabs>
787:           </AccordionContent>
788:         </AccordionItem>
789:         <AccordionItem value="other-councilors">
790:           <AccordionTrigger>Other Councilors</AccordionTrigger>
791:           <AccordionContent>
792:             <OtherCouncilorsByFaction {...{ analysis, weights }} />
793:           </AccordionContent>
794:         </AccordionItem>
795:       </SmartAccordion>
796: 
797:       <div className="my-4">
798:         <ScoringWeightsDialog weights={weights} onWeightsChange={setWeights} />
799:       </div>
800: 
801:       <Collapsible>
802:         <CollapsibleTrigger asChild>
803:           <Button variant="outline">Debug Data</Button>
804:         </CollapsibleTrigger>
805:         <CollapsibleContent>
806:           {/* <pre>{JSON.stringify(analysis.playerCouncilors, null, 2)}</pre>
807:           <pre>{JSON.stringify(analysis.playerAvailableCouncilors, null, 2)}</pre>
808:           <pre>{JSON.stringify(analysis.playerAvailableOrgs, null, 2)}</pre>
809:           <pre>{JSON.stringify(analysis.playerUnassignedOrgs, null, 2)}</pre> */}
810:           <pre>{JSON.stringify(analysis.playerFaction, null, 2)}</pre>
811:         </CollapsibleContent>
812:       </Collapsible>
813:     </div>
814:   );
815: }
816: 
817: function OtherCouncilorsByFaction({ analysis, weights }: { analysis: Analysis; weights: ScoringWeights }) {
818:   const { playerVisibleCouncilors, factionsById } = analysis;
819: 
820:   const scoredBaseCouncilors = scoreAndSort(
821:     playerVisibleCouncilors,
822:     weights,
823:     new Map<MissionDataName, number>(),
824:     getBaseCouncilorScore
825:   );
826: 
827:   const councilorsByFactionId = scoredBaseCouncilors.reduce((acc, councilor) => {
828:     const factionId = councilor.factionId || 0;
829:     if (!factionId) return acc;
830:     if (!acc.has(factionId)) {
831:       acc.set(factionId, []);
832:     }
833:     acc.get(factionId)!.push(councilor);
834:     return acc;
835:   }, new Map<number, Analysis["playerCouncilors"][number][]>());
836: 
837:   const factions = Array.from(councilorsByFactionId.keys())
838:     .map((i) => factionsById.get(i!)!)
839:     .filter((i) => i.id !== analysis.alienFaction.id);
840: 
841:   return (
842:     <Tabs defaultValue={`faction-${factions[0].id}`}>
843:       <TabsList>
844:         {factions
845:           .filter((i) => i.id !== analysis.alienFaction.id)
846:           .map((faction) => (
847:             <TabsTrigger key={faction.id} value={`faction-${faction.id}`}>
848:               {faction.displayName || "Unknown Faction"} ({councilorsByFactionId.get(faction.id)?.length || 0})
849:             </TabsTrigger>
850:           ))}
851:       </TabsList>
852:       {factions.map((faction) => (
853:         <TabsContent key={faction.id} value={`faction-${faction.id}`}>
854:           <Table>
855:             <CouncilorTableHeader />
856:             <TableBody>
857:               {councilorsByFactionId.get(faction.id)?.map((councilor) => (
858:                 <CouncilorTableRow
859:                   key={councilor.id}
860:                   councilor={councilor}
861:                   stats={councilor.effectsBaseAndUnaugmentedTraits}
862:                   label={councilor.displayName!}
863:                 />
864:               ))}
865:             </TableBody>
866:           </Table>
867:         </TabsContent>
868:       ))}
869:     </Tabs>
870:   );
871: }
872: 
873: function scoreAndSort<T>(
874:   items: T[],
875:   weights: ScoringWeights,
876:   haveMissions: Map<MissionDataName, number>,
877:   scoreFn: (item: T, weights: ScoringWeights, haveMissions: Map<MissionDataName, number>) => ScoreResult,
878:   scoreSort: "value" | "noMissionScore" = "value"
879: ) {
880:   const scoredItems = items.map((item) => {
881:     const scoreResult = scoreFn(item, weights, haveMissions);
882:     return { ...item, score: scoreResult };
883:   });
884:   scoredItems.sort((a, b) => b.score[scoreSort] - a.score[scoreSort]);
885:   return scoredItems;
886: }
887: 
888: function getBaseCouncilorScore(
889:   councilor: Analysis["playerCouncilors"][number],
890:   weights: ScoringWeights,
891:   haveMissions: Map<MissionDataName, number>
892: ): ScoreResult {
893:   return getScore(councilor.effectsBaseAndUnaugmentedTraits, weights, haveMissions, true);
894: }
895: 
896: function getModifiedCouncilorScore(
897:   councilor: Analysis["playerCouncilors"][number],
898:   weights: ScoringWeights,
899:   haveMissions: Map<MissionDataName, number>
900: ): ScoreResult {
901:   return getScore(councilor.effectsWithOrgsAndAugments, weights, haveMissions, true);
902: }
903: 
904: const orgTransferFactor = 0.2;
905: function getOrganizationScore(
906:   org: Analysis["playerAvailableOrgs"][number] & { type: string },
907:   weights: ScoringWeights,
908:   haveMissions: Map<MissionDataName, number>
909: ): ScoreResult {
910:   return getScore(
911:     {
912:       ...org,
913:       techBonuses: org.template?.techBonuses,
914:       missionsGrantedNames: org.template?.missionsGrantedNames || [],
915:       ...(org.type === "available"
916:         ? {}
917:         : {
918:             // already-purchased orgs seem to cost ~30% to transfer
919:             costMoney: (org.costMoney || 0) * orgTransferFactor,
920:             costInfluence: (org.costInfluence || 0) * orgTransferFactor,
921:             costOps: (org.costOps || 0) * orgTransferFactor,
922:             costBoost: (org.costBoost || 0) * orgTransferFactor,
923:           }),
924:     },
925:     weights,
926:     haveMissions
927:   );
928: }
929: 
930: interface ScoreResult {
931:   value: number;
932:   noMissionScore: number;
933:   details: string;
934: }
935: 
936: function getScore(
937:   org: ShowEffectsProps,
938:   weights: ScoringWeights,
939:   haveMissions: Map<MissionDataName, number>,
940:   ignoreTier: boolean = false
941: ): ScoreResult {
942:   let totalScore = 0;
943:   const details: string[] = [];
944: 
945:   // Helper to add score for a numeric attribute
946:   const addScore = (name: string, value: number | undefined, weight: number | undefined, noNegative?: boolean) => {
947:     let actualValue = value || 0;
948:     if (noNegative) {
949:       actualValue = Math.max(0, actualValue);
950:     }
951:     const actualWeight = weight ?? 0;
952: 
953:     // Skip if value or weight is 0/undefined/null
954:     if (!actualValue || !actualWeight) return;
955: 
956:     const contribution = actualValue * actualWeight;
957:     totalScore += contribution;
958:     details.push(
959:       `${name}: ${parseFloat(actualValue.toFixed(2))} × ${parseFloat(actualWeight.toFixed(3))} = ${contribution.toFixed(
960:         3
961:       )}`
962:     );
963:   };
964: 
965:   // Councilor attributes
966:   addScore("persuasion", org.persuasion, weights.persuasion, true);
967:   addScore("command", org.command, weights.command, true);
968:   addScore("investigation", org.investigation, weights.investigation, true);
969:   addScore("espionage", org.espionage, weights.espionage, true);
970:   addScore("administration", org.administration, weights.administration, true);
971:   addScore("science", org.science, weights.science, true);
972:   addScore("security", org.security, weights.security, true);
973:   addScore("Persuasion", org.Persuasion, weights.persuasion, true);
974:   addScore("Command", org.Command, weights.command, true);
975:   addScore("Investigation", org.Investigation, weights.investigation, true);
976:   addScore("Espionage", org.Espionage, weights.espionage, true);
977:   addScore("Administration", org.Administration, weights.administration, true);
978:   addScore("Science", org.Science, weights.science, true);
979:   addScore("Security", org.Security, weights.security, true);
980:   addScore("xpModifier", org.xpModifier, weights.xpModifier);
981:   addScore("xp", org.xp, weights.xp);
982: 
983:   // Monthly income/costs
984:   addScore("incomeBoost_month", org.incomeBoost_month, weights.incomeBoost_month);
985:   addScore("incomeMoney_month", org.incomeMoney_month, weights.incomeMoney_month);
986:   addScore("incomeInfluence_month", org.incomeInfluence_month, weights.incomeInfluence_month);
987:   addScore("incomeOps_month", org.incomeOps_month, weights.incomeOps_month);
988:   addScore("incomeMissionControl", org.incomeMissionControl, weights.incomeMissionControl);
989:   addScore("incomeResearch_month", org.incomeResearch_month, weights.incomeResearch_month);
990:   addScore("projectCapacityGranted", org.projectCapacityGranted, weights.projectCapacityGranted);
991: 
992:   // Purchase costs
993:   addScore("costMoney", org.costMoney, weights.costMoney);
994:   addScore("costInfluence", org.costInfluence, weights.costInfluence);
995:   addScore("costOps", org.costOps, weights.costOps);
996:   addScore("costBoost", org.costBoost, weights.costBoost);
997: 
998:   // Priority bonuses
999:   addScore("economyBonus", org.economyBonus, weights.economyBonus);
1000:   addScore("welfareBonus", org.welfareBonus, weights.welfareBonus);
1001:   addScore("environmentBonus", org.environmentBonus, weights.environmentBonus);
1002:   addScore("knowledgeBonus", org.knowledgeBonus, weights.knowledgeBonus);
1003:   addScore("governmentBonus", org.governmentBonus, weights.governmentBonus);
1004:   addScore("unityBonus", org.unityBonus, weights.unityBonus);
1005:   addScore("militaryBonus", org.militaryBonus, weights.militaryBonus);
1006:   addScore("oppressionBonus", org.oppressionBonus, weights.oppressionBonus);
1007:   addScore("spoilsBonus", org.spoilsBonus, weights.spoilsBonus);
1008:   addScore("spaceDevBonus", org.spaceDevBonus, weights.spaceDevBonus);
1009:   addScore("spaceflightBonus", org.spaceflightBonus, weights.spaceflightBonus);
1010:   addScore("MCBonus", org.MCBonus, weights.MCBonus);
1011:   addScore("miningBonus", org.miningBonus, weights.miningBonus);
1012: 
1013:   // Tech bonuses from councilor/traits
1014:   if (weights.councilorTechBonus && org?.councilorTechBonus) {
1015:     for (const { category, bonus } of org.councilorTechBonus) {
1016:       const weight = weights.councilorTechBonus[category];
1017:       addScore(`councilorTechBonus[${category}]`, bonus, weight);
1018:     }
1019:   }
1020: 
1021:   // Tech bonuses from orgs
1022:   if (weights.techBonuses && org?.techBonuses) {
1023:     for (const { category, bonus } of org.techBonuses) {
1024:       const weight = weights.techBonuses[category];
1025:       addScore(`techBonus[${category}]`, bonus, weight);
1026:     }
1027:   }
1028: 
1029:   let noMissionScore = totalScore;
1030: 
1031:   // Missions granted
1032:   if (weights.missions && org?.missionsGrantedNames) {
1033:     for (const missionName of org.missionsGrantedNames) {
1034:       const weight = weights.missions[missionName];
1035:       addScore(`mission[${missionName}]`, 1, weight);
1036: 
1037:       // Extra weight for missions we don't have yet or only have one councilor for
1038:       if (weights.extraWeightForMissingMissions && (haveMissions.get(missionName) || 0) === 0) {
1039:         totalScore += weights.extraWeightForMissingMissions;
1040:         details.push(
1041:           `mission[${missionName}]: missing bonus × ${parseFloat(
1042:             weights.extraWeightForMissingMissions.toFixed(3)
1043:           )} = ${weights.extraWeightForMissingMissions.toFixed(3)}`
1044:         );
1045:       }
1046:       if (weights.extraWeightForSingleMissions && (haveMissions.get(missionName) || 0) === 1) {
1047:         totalScore += weights.extraWeightForSingleMissions;
1048:         details.push(
1049:           `mission[${missionName}]: single bonus × ${parseFloat(
1050:             weights.extraWeightForSingleMissions.toFixed(3)
1051:           )} = ${weights.extraWeightForSingleMissions.toFixed(3)}`
1052:         );
1053:       }
1054:     }
1055:   }
1056: 
1057:   // Divide by tier to normalize for org cost/power
1058:   const tier = org.tier || 1;
1059:   let finalScore = totalScore;
1060: 
1061:   if (tier > 1 && !ignoreTier) {
1062:     const tierFactor = Math.pow(tier, weights.orgTierExponent);
1063:     finalScore = totalScore / tierFactor;
1064:     noMissionScore /= tierFactor;
1065:     details.push(`Subtotal: ${totalScore.toFixed(3)}`);
1066:     details.push(`Divided by ${tierFactor.toFixed(2)} for tier ${tier}: ${finalScore.toFixed(3)}`);
1067:   }
1068: 
1069:   return {
1070:     value: finalScore,
1071:     noMissionScore,
1072:     details: details.join("\n"),
1073:   };
1074: }

(End of file - total 1074 lines)
</content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "terra-invicta-assistant\\src\\app\\game\\current\\fleets.tsx"
}
```

**Output:**
```
<path>terra-invicta-assistant\src\app\game\current\fleets.tsx</path>
<type>file</type>
<content>
1: import { Analysis } from "@/lib/analysis";
2: import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
3: import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
4: import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
5: import { SmartAccordion } from "@/components/ui/smart-accordion";
6: import { Button } from "@/components/ui/button";
7: import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
8: import { diffDateTime, sortByDateTime, toDays } from "@/lib/utils";
9: import { Fragment } from "react/jsx-runtime";
10: import { FactionIcons, MissionControl } from "@/components/icons";
11: import { twMerge } from "tailwind-merge";
12: 
13: export function getFleetsUi(analysis: Analysis) {
14:   const byTarget = analysis.alienFleetsToPlayerOrbits.reduce((acc, fleet) => {
15:     const key = fleet.planetName || "Unknown Orbit";
16:     if (!acc.has(key)) {
17:       acc.set(key, []);
18:     }
19:     acc.get(key)!.push(fleet);
20:     return acc;
21:   }, new Map<string, typeof analysis.alienFleetsToPlayerOrbits>());
22:   const label = [
23:     ...byTarget.entries().map(([target, rawFleets]) => {
24:       const fleets = rawFleets.filter((f) => f.deltaV > 0 && (f.daysToTarget || 0) > 0);
25:       const surv = rawFleets.filter((f) => f.operation === "AlienEarthSurveillanceOperation" && !f.arrivalTime);
26:       const survInfo = surv.length ? (
27:         <>
28:           <span className="text-white bg-destructive rounded py-2 px-3 font-bold">
29:             {surv
30:               .map((f) => f.operationCompleteDays || 0)
31:               .reduce((a, b) => Math.min(a, b), 9999999999)
32:               .toFixed(0)}
33:             d Surveillance
34:           </span>{" "}
35:         </>
36:       ) : null;
37:       if (fleets.length === 0) {
38:         if (survInfo) {
39:           return (
40:             <span>
41:               {target}: {survInfo}
42:             </span>
43:           );
44:         }
45:         return null;
46:       }
47:       // now that we know the arrival of the first one, find all arriving within 14 days to summarize MC
48:       const firstFleet = sortByDateTime(fleets, (f) => f.arrivalTime || analysis.gameCurrentDateTime)[0];
49:       const firstFleets = fleets.filter(
50:         (f) =>
51:           toDays(
52:             diffDateTime(
53:               f.arrivalTime || analysis.gameCurrentDateTime,
54:               firstFleet.arrivalTime || analysis.gameCurrentDateTime,
55:             ),
56:           ) < 14,
57:       );
58:       const firstMc = firstFleets.reduce((sum, f) => sum + f.totalMC, 0);
59: 
60:       // tier 2 hab (60d), fusion power, and defense module (90d) take a total of 150 days
61:       // tier 3 hab (90d), fusion power, and defense module (180d) take a total of 270 days.
62:       // T2 hab should be able to stop a bombard from a 10MC fleet, and T3 is the best we can do anyway, plus the turn time of 30 days should make for enough warning
63:       // before that, we'll still have the nameplate warning and can look at details in the fleets tab
64:       const warningNeeded = (firstMc > 10 ? 270 : 150) + 30;
65:       const daysToTarget = firstFleet.daysToTarget || 0;
66:       const farFuture = daysToTarget > warningNeeded;
67:       const className = twMerge(
68:         farFuture && "px-1 -mx-1 py-0.5 -my-0.5 rounded bg-green-500",
69:         farFuture &&
70:           (daysToTarget < warningNeeded + 50
71:             ? "bg-red-200"
72:             : daysToTarget < warningNeeded + 100
73:               ? "bg-yellow-200"
74:               : "bg-green-200"),
75:       );
76:       return (
77:         <span
78:           className={className}
79:           title={`${fleets.length} fleet(s) targeting ${target}, arriving in ${daysToTarget.toFixed(
80:             0,
81:           )} days, using ${firstMc.toFixed(0)} MC`}
82:         >
83:           {target}
84:           {fleets.length > 1 ? `(${fleets.length})` : ""}
85:           {farFuture ? (
86:             ""
87:           ) : (
88:             <>
89:               : {daysToTarget.toFixed(0)}d <MissionControl />
90:               {firstMc.toFixed(0)}
91:             </>
92:           )}
93:           {survInfo && <>,{survInfo}</>}
94:         </span>
95:       );
96:     }),
97:   ].filter((i) => !!i);
98: 
99:   return {
100:     key: "fleets",
101:     tab: (
102:       <>
103:         Fleets
104:         {label.length > 0 ? (
105:           <>
106:             {" - "}
107:             {label.map((i, ix) => (
108:               <Fragment key={ix}>
109:                 {i}
110:                 {ix < label.length - 1 ? " | " : ""}
111:               </Fragment>
112:             ))}
113:           </>
114:         ) : (
115:           ""
116:         )}
117:       </>
118:     ),
119:     content: <FleetsComponent analysis={analysis} />,
120:   };
121: }
122: 
123: function FleetsComponent({ analysis }: { analysis: Analysis }) {
124:   const alienFleets = analysis.alienFleetsToPlayerOrbits;
125:   const humanEnemyFleets = analysis.humanEnemyFleetsToPlayerOrbits;
126:   const playerFleets = analysis.playerFleets;
127:   const shipsUnderConstruction = analysis.playerShipsUnderConstruction;
128: 
129:   return (
130:     <SmartAccordion
131:       type="multiple"
132:       storageKey="fleetsSections"
133:       defaultValue={["alien-fleets", "human-enemy-fleets", "player-fleets", "ships-under-construction"]}
134:     >
135:       {/* Alien Fleets */}
136:       <AccordionItem value="alien-fleets">
137:         <AccordionTrigger>Alien Fleets ({alienFleets.length})</AccordionTrigger>
138:         <AccordionContent>
139:           {alienFleets.length === 0 ? (
140:             <div className="p-4 text-muted-foreground">No alien fleets detected heading to player orbits.</div>
141:           ) : (
142:             <div className="space-y-2">
143:               <p>Tracking planets: {analysis.playerInterestedPlanets.map((p) => p.displayName).join(", ")}</p>
144:               <Table>
145:                 <TableHeader>
146:                   <TableRow>
147:                     <TableHead>Fleet Name</TableHead>
148:                     <TableHead>Planet</TableHead>
149:                     <TableHead>Target Orbit</TableHead>
150:                     <TableHead>Arrival Date</TableHead>
151:                     <TableHead className="text-right">Days to Arrival</TableHead>
152:                     <TableHead className="text-right">MC Used</TableHead>
153:                     <TableHead className="text-right">Marine CP</TableHead>
154:                     <TableHead className="text-right">Total Mass</TableHead>
155:                     <TableHead className="text-right">Max Ship Mass</TableHead>
156:                     <TableHead>Ships Hulls</TableHead>
157:                     <TableHead>Ships Roles</TableHead>
158:                     <TableHead>Operation</TableHead>
159:                     <TableHead>Operation Complete</TableHead>
160:                   </TableRow>
161:                 </TableHeader>
162:                 <TableBody>
163:                   {alienFleets.map((fleet) => (
164:                     <TableRow key={fleet.id} className={twMerge(fleet.deltaV === 0 ? "bg-gray-500/5" : "")}>
165:                       <TableCell className="font-medium">{fleet.displayName}</TableCell>
166:                       <TableCell>{fleet.planetName}</TableCell>
167:                       <TableCell>{fleet.targetOrbitName}</TableCell>
168:                       <TableCell>{fleet.arrivalTimeFormatted || "-"}</TableCell>
169:                       <TableCell className="text-right">
170:                         {fleet.daysToTarget !== null ? `${fleet.daysToTarget.toFixed(0)}` : "—"}
171:                       </TableCell>
172:                       <TableCell className="text-right">{fleet.totalMC.toFixed(0)}</TableCell>
173:                       <TableCell className="text-right">{fleet.marineCombatPower > 0 ? fleet.marineCombatPower : "—"}</TableCell>
174:                       <TableCell className="text-right">{(fleet.totalMass / 1000000).toFixed(0)} Mkg</TableCell>
175:                       <TableCell className="text-right">{(fleet.maxShipMass / 1000000).toFixed(0)} Mkg</TableCell>
176:                       <TableCell className="whitespace-normal">
177:                         {fleet.shipsByHullType.length > 0
178:                           ? fleet.shipsByHullType
179:                               .map((ship) => {
180:                                 const name = `${ship.count} ${ship.hullName.replace("Alien ", "")}${ship.count > 1 ? "s" : ""}`;
181:                                 return ship.avgNoseArmor > 0 ? `${name} (${ship.avgNoseArmor})` : name;
182:                               })
183:                               .join(" + ")
184:                           : "-"}
185:                       </TableCell>
186:                       <TableCell className="whitespace-normal">
187:                         {fleet.shipsByRole.length > 0
188:                           ? fleet.shipsByRole
189:                               .map((ship) => `${ship.count} ${ship.role}${ship.count > 1 ? "s" : ""}`)
190:                               .join(" + ")
191:                           : "-"}
192:                       </TableCell>
193:                       <TableCell>{fleet.operation || "-"}</TableCell>
194:                       <TableCell>
195:                         {fleet.operationComplete
196:                           ? `${fleet.operationComplete}${
197:                               fleet.operationCompleteDays !== null
198:                                 ? ` (${fleet.operationCompleteDays.toFixed(0)}d)`
199:                                 : ""
200:                             }`
201:                           : "-"}
202:                       </TableCell>
203:                     </TableRow>
204:                   ))}
205:                 </TableBody>
206:               </Table>
207: 
208:               {/* Planetary Defense Summary */}
209:               <div className="mt-8">
210:                 <h2 className="text-2xl font-bold mb-4">Planetary Defense Summary</h2>
211:                 <Table>
212:                   <TableHeader>
213:                     <TableRow>
214:                       <TableHead>Planet</TableHead>
215:                       <TableHead className="text-right">Days to Arrival</TableHead>
216:                       <TableHead className="text-right">Alien Fleet MC</TableHead>
217:                       <TableHead className="text-right">Player Fleet MC</TableHead>
218:                       <TableHead>Habs (Active / Potential Combat)</TableHead>
219:                     </TableRow>
220:                   </TableHeader>
221:                   <TableBody>
222:                     {(() => {
223:                       const planetsWithFleets = new Set(
224:                         analysis.alienFleetsToPlayerOrbits.map((f) => f.planetName || "Unknown"),
225:                       );
226:                       const defenseData = Array.from(planetsWithFleets)
227:                         .map((planet) => {
228:                           const fleetsAtPlanet = analysis.alienFleetsToPlayerOrbits.filter(
229:                             (f) => f.planetName === planet,
230:                           );
231:                           const totalAlienMC = fleetsAtPlanet.reduce((sum, f) => sum + (f.totalMC || 0), 0);
232:                           const incomingFleets = fleetsAtPlanet.filter(
233:                             (f) => f.daysToTarget !== null && f.daysToTarget > 0,
234:                           );
235:                           const daysToArrival =
236:                             incomingFleets.length > 0
237:                               ? Math.min(...incomingFleets.map((f) => f.daysToTarget!))
238:                               : null;
239:                           const playerFleetsAtPlanet = analysis.playerFleets.filter(
240:                             (f) => f.planetName === planet,
241:                           );
242:                           const relevantPlayerFleets = playerFleetsAtPlanet.filter((f) => {
243:                             if (f.daysToTarget === null || f.daysToTarget <= 0) return true;
244:                             if (daysToArrival === null) return false;
245:                             return f.daysToTarget < daysToArrival;
246:                           });
247:                           const totalPlayerMC = relevantPlayerFleets.reduce((sum, f) => sum + (f.totalMC || 0), 0);
248:                           const habsAtPlanet = analysis.playerHabs.filter((h) => h.planetName === planet);
249:                           return { planet, totalAlienMC, totalPlayerMC, daysToArrival, habs: habsAtPlanet };
250:                         })
251:                         .filter((d) => d.habs.length > 0)
252:                         .toSorted((a, b) => {
253:                           if (a.daysToArrival === null && b.daysToArrival === null) return 0;
254:                           if (a.daysToArrival === null) return 1;
255:                           if (b.daysToArrival === null) return -1;
256:                           return a.daysToArrival - b.daysToArrival;
257:                         });
258: 
259:                       return defenseData.map(({ planet, totalAlienMC, totalPlayerMC, daysToArrival, habs }) => (
260:                         <TableRow key={planet}>
261:                           <TableCell className="font-medium">{planet}</TableCell>
262:                           <TableCell className="text-right">
263:                             {daysToArrival !== null ? daysToArrival.toFixed(0) : "—"}
264:                           </TableCell>
265:                           <TableCell className="text-right">{totalAlienMC.toFixed(0)}</TableCell>
266:                           <TableCell className="text-right">{totalPlayerMC.toFixed(0)}</TableCell>
267:                           <TableCell>
268:                             <TooltipProvider>
269:                               <div className="flex gap-2 flex-wrap">
270:                                 {habs
271:                                   .toSorted((a, b) => {
272:                                     if (a.habType === "Station" && b.habType !== "Station") return -1;
273:                                     if (a.habType !== "Station" && b.habType === "Station") return 1;
274:                                     return 0;
275:                                   })
276:                                   .map((hab) => {
277:                                     const activeCombat = hab.activeEffects.combatScore || 0;
278:                                     const potentialCombat = hab.potentialEffects.combatScore || 0;
279:                                     const combatDisplay =
280:                                       activeCombat === potentialCombat
281:                                         ? activeCombat.toFixed(0)
282:                                         : `${activeCombat.toFixed(0)} / ${potentialCombat.toFixed(0)}`;
283:                                     const bgColor = hab.habType === "Station" ? "bg-yellow-100" : "bg-green-100";
284:                                     return (
285:                                       <Tooltip key={hab.id}>
286:                                         <TooltipTrigger asChild>
287:                                           <span className={`cursor-help ${bgColor} px-1.5 py-0.5 rounded`}>
288:                                             {combatDisplay}
289:                                           </span>
290:                                         </TooltipTrigger>
291:                                         <TooltipContent>
292:                                           <div>{hab.displayName}</div>
293:                                         </TooltipContent>
294:                                       </Tooltip>
295:                                     );
296:                                   })}
297:                               </div>
298:                             </TooltipProvider>
299:                           </TableCell>
300:                         </TableRow>
301:                       ));
302:                     })()}
303:                   </TableBody>
304:                 </Table>
305:               </div>
306: 
307:               <Collapsible>
308:                 <CollapsibleTrigger asChild>
309:                   <Button>Debug Data</Button>
310:                 </CollapsibleTrigger>
311:                 <CollapsibleContent>
312:                   <pre>{JSON.stringify(alienFleets, null, 2)}</pre>
313:                 </CollapsibleContent>
314:               </Collapsible>
315:             </div>
316:           )}
317:         </AccordionContent>
318:       </AccordionItem>
319: 
320:       {/* Other Human Factions Fleets */}
321:       <AccordionItem value="human-enemy-fleets">
322:         <AccordionTrigger>Other Human Factions ({humanEnemyFleets.length})</AccordionTrigger>
323:         <AccordionContent>
324:           {humanEnemyFleets.length === 0 ? (
325:             <div className="p-4 text-muted-foreground">No other human faction fleets detected heading to player orbits.</div>
326:           ) : (
327:             <Table>
328:               <TableHeader>
329:                 <TableRow>
330:                   <TableHead>Faction</TableHead>
331:                   <TableHead>Fleet Name</TableHead>
332:                   <TableHead>Planet</TableHead>
333:                   <TableHead>Target Orbit</TableHead>
334:                   <TableHead>Arrival Date</TableHead>
335:                   <TableHead className="text-right">Days to Arrival</TableHead>
336:                   <TableHead className="text-right">MC Used</TableHead>
337:                   <TableHead className="text-right">Marine CP</TableHead>
338:                   <TableHead className="text-right">Total Mass</TableHead>
339:                   <TableHead className="text-right">Max Ship Mass</TableHead>
340:                   <TableHead>Ship Hulls</TableHead>
341:                   <TableHead>Ship Roles</TableHead>
342:                   <TableHead>Operation</TableHead>
343:                   <TableHead>Operation Complete</TableHead>
344:                 </TableRow>
345:               </TableHeader>
346:               <TableBody>
347:                 {humanEnemyFleets.map((fleet) => {
348:                   const FactionIcon = fleet.factionTemplateName
349:                     ? FactionIcons[fleet.factionTemplateName as keyof typeof FactionIcons]
350:                     : null;
351:                   return (
352:                     <TableRow key={fleet.id} className={twMerge(fleet.deltaV === 0 ? "bg-gray-500/5" : "")}>
353:                       <TableCell>
354:                         <div className="flex items-center gap-1">
355:                           {FactionIcon && <FactionIcon className="p-1 rounded" />}
356:                           <span className="text-sm">{fleet.factionDisplayName ?? fleet.factionTemplateName ?? "Unknown"}</span>
357:                         </div>
358:                       </TableCell>
359:                       <TableCell className="font-medium">{fleet.displayName}</TableCell>
360:                       <TableCell>{fleet.planetName}</TableCell>
361:                       <TableCell>{fleet.targetOrbitName}</TableCell>
362:                       <TableCell>{fleet.arrivalTimeFormatted || "-"}</TableCell>
363:                       <TableCell className="text-right">
364:                         {fleet.daysToTarget !== null ? `${fleet.daysToTarget.toFixed(0)}` : "—"}
365:                       </TableCell>
366:                       <TableCell className="text-right">{fleet.totalMC.toFixed(0)}</TableCell>
367:                       <TableCell className="text-right">{fleet.marineCombatPower > 0 ? fleet.marineCombatPower : "—"}</TableCell>
368:                       <TableCell className="text-right">{(fleet.totalMass / 1000000).toFixed(0)} Mkg</TableCell>
369:                       <TableCell className="text-right">{(fleet.maxShipMass / 1000000).toFixed(0)} Mkg</TableCell>
370:                       <TableCell className="whitespace-normal">
371:                         {fleet.shipsByHullType.length > 0
372:                           ? fleet.shipsByHullType
373:                               .map((ship) => {
374:                                 const name = `${ship.count} ${ship.hullName}${ship.count > 1 ? "s" : ""}`;
375:                                 return ship.avgNoseArmor > 0 ? `${name} (${ship.avgNoseArmor})` : name;
376:                               })
377:                               .join(" + ")
378:                           : "-"}
379:                       </TableCell>
380:                       <TableCell className="whitespace-normal">
381:                         {fleet.shipsByRole.length > 0
382:                           ? fleet.shipsByRole.map((s) => `${s.count} ${s.role}${s.count > 1 ? "s" : ""}`).join(" + ")
383:                           : "-"}
384:                       </TableCell>
385:                       <TableCell>{fleet.operation || "-"}</TableCell>
386:                       <TableCell>
387:                         {fleet.operationComplete
388:                           ? `${fleet.operationComplete}${fleet.operationCompleteDays !== null ? ` (${fleet.operationCompleteDays.toFixed(0)}d)` : ""}`
389:                           : "-"}
390:                       </TableCell>
391:                     </TableRow>
392:                   );
393:                 })}
394:               </TableBody>
395:             </Table>
396:           )}
397:         </AccordionContent>
398:       </AccordionItem>
399: 
400:       {/* Player Fleets */}
401:       <AccordionItem value="player-fleets">
402:         <AccordionTrigger>Player Fleets ({playerFleets.length})</AccordionTrigger>
403:         <AccordionContent>
404:           {playerFleets.length === 0 ? (
405:             <div className="p-4 text-muted-foreground">No player fleets found.</div>
406:           ) : (
407:             <Table>
408:               <TableHeader>
409:                 <TableRow>
410:                   <TableHead>Fleet Name</TableHead>
411:                   <TableHead>Planet</TableHead>
412:                   <TableHead>Target Orbit</TableHead>
413:                   <TableHead>Arrival Date</TableHead>
414:                   <TableHead className="text-right">Days to Arrival</TableHead>
415:                   <TableHead className="text-right">MC Used</TableHead>
416:                   <TableHead className="text-right">Marine CP</TableHead>
417:                   <TableHead className="text-right">Total Mass</TableHead>
418:                   <TableHead className="text-right">Max Ship Mass</TableHead>
419:                   <TableHead>Ship Hulls</TableHead>
420:                   <TableHead>Ship Classes</TableHead>
421:                 </TableRow>
422:               </TableHeader>
423:               <TableBody>
424:                 {playerFleets.map((fleet) => (
425:                   <TableRow key={fleet.id}>
426:                     <TableCell className="font-medium">{fleet.displayName}</TableCell>
427:                     <TableCell>{fleet.planetName}</TableCell>
428:                     <TableCell>{fleet.targetOrbitName}</TableCell>
429:                     <TableCell>{fleet.arrivalTimeFormatted || "-"}</TableCell>
430:                     <TableCell className="text-right">
431:                       {fleet.daysToTarget !== null ? `${fleet.daysToTarget.toFixed(0)}` : "—"}
432:                     </TableCell>
433:                     <TableCell className="text-right">{fleet.totalMC.toFixed(0)}</TableCell>
434:                     <TableCell className="text-right">{fleet.marineCombatPower > 0 ? fleet.marineCombatPower : "—"}</TableCell>
435:                     <TableCell className="text-right">{(fleet.totalMass / 1000000).toFixed(0)} Mkg</TableCell>
436:                     <TableCell className="text-right">{(fleet.maxShipMass / 1000000).toFixed(0)} Mkg</TableCell>
437:                     <TableCell className="whitespace-normal">
438:                       {fleet.shipsByHullType.length > 0
439:                         ? fleet.shipsByHullType.map((ship, i) => (
440:                             <Fragment key={ship.hullName}>
441:                               {i > 0 && <br />}
442:                               {ship.count} {ship.hullName}
443:                               {ship.count > 1 ? "s" : ""}
444:                             </Fragment>
445:                           ))
446:                         : "-"}
447:                     </TableCell>
448:                     <TableCell className="whitespace-normal">
449:                       {fleet.shipsByClass.length > 0
450:                         ? fleet.shipsByClass.map((cls, i) => (
451:                             <Fragment key={cls.className}>
452:                               {i > 0 && <br />}
453:                               {cls.count}× {cls.className}{cls.noseArmor > 0 ? ` (${cls.noseArmor})` : ""}
454:                             </Fragment>
455:                           ))
456:                         : "-"}
457:                     </TableCell>
458:                   </TableRow>
459:                 ))}
460:               </TableBody>
461:             </Table>
462:           )}
463:         </AccordionContent>
464:       </AccordionItem>
465: 
466:       {/* Ships Under Construction */}
467:       <AccordionItem value="ships-under-construction">
468:         <AccordionTrigger>Ships Under Construction ({shipsUnderConstruction.length})</AccordionTrigger>
469:         <AccordionContent>
470:           {shipsUnderConstruction.length === 0 ? (
471:             <div className="p-4 text-muted-foreground">No ships under construction.</div>
472:           ) : (
473:             <Table>
474:               <TableHeader>
475:                 <TableRow>
476:                   <TableHead>Planet</TableHead>
477:                   <TableHead>Design</TableHead>
478:                   <TableHead>Hull</TableHead>
479:                   <TableHead className="text-right">Nose Armor</TableHead>
480:                   <TableHead className="text-right">Count</TableHead>
481:                   <TableHead>Days to Complete</TableHead>
482:                 </TableRow>
483:               </TableHeader>
484:               <TableBody>
485:                 {(() => {
486:                   const byPlanetDesign = shipsUnderConstruction.reduce((acc, ship) => {
487:                     const key = `${ship.planetName}||${ship.designName}`;
488:                     if (!acc.has(key))
489:                       acc.set(key, {
490:                         planetName: ship.planetName,
491:                         designName: ship.designName,
492:                         hullName: ship.hullName,
493:                         noseArmor: ship.noseArmor,
494:                         entries: [] as { days: number; status: "building" | "queued" | "waiting" }[],
495:                       });
496:                     acc.get(key)!.entries.push({ days: ship.daysToCompletion, status: ship.status });
497:                     return acc;
498:                   }, new Map<string, { planetName: string; designName: string; hullName: string; noseArmor: number; entries: { days: number; status: "building" | "queued" | "waiting" }[] }>());
499: 
500:                   return [...byPlanetDesign.values()]
501:                     .toSorted((a, b) => a.planetName.localeCompare(b.planetName) || a.designName.localeCompare(b.designName))
502:                     .map(({ planetName, designName, hullName, noseArmor, entries }) => (
503:                       <TableRow key={`${planetName}||${designName}`}>
504:                         <TableCell>{planetName}</TableCell>
505:                         <TableCell className="font-medium">{designName}</TableCell>
506:                         <TableCell>{hullName}</TableCell>
507:                         <TableCell className="text-right">{noseArmor > 0 ? noseArmor : "-"}</TableCell>
508:                         <TableCell className="text-right">{entries.length}</TableCell>
509:                         <TableCell>
510:                           {entries
511:                             .toSorted((a, b) => a.days - b.days)
512:                             .map((e, i) => (
513:                               <Fragment key={i}>
514:                                 {i > 0 && ", "}
515:                                 {e.status === "waiting" ? (
516:                                   <span title="Waiting for materials">⚠️{e.days.toFixed(0)}</span>
517:                                 ) : e.status === "queued" ? (
518:                                   <span className="text-muted-foreground" title="Queued">({e.days.toFixed(0)})</span>
519:                                 ) : (
520:                                   e.days.toFixed(0)
521:                                 )}
522:                               </Fragment>
523:                             ))}
524:                         </TableCell>
525:                       </TableRow>
526:                     ));
527:                 })()}
528:               </TableBody>
529:             </Table>
530:           )}
531:         </AccordionContent>
532:       </AccordionItem>
533:     </SmartAccordion>
534:   );
535: }

(End of file - total 535 lines)
</content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "terra-invicta-assistant\\src\\app\\game\\current\\habs.tsx"
}
```

**Output:**
```
<path>terra-invicta-assistant\src\app\game\current\habs.tsx</path>
<type>file</type>
<content>
1: "use client";
2: 
3: import {
4:   Boost,
5:   CombatScore,
6:   FactionIcons,
7:   HabPower,
8:   MissionControl,
9:   TechIcons,
10:   UnknownIcon,
11:   Water,
12:   Volatiles,
13:   Metals,
14:   Nobles,
15:   Fissiles,
16:   ControlPoint,
17: } from "@/components/icons";
18: import { combineEffects, ShowEffects, ShowEffectsProps } from "@/components/showEffects";
19: import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
20: import { Button } from "@/components/ui/button";
21: import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
22: import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
23: import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
24: import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
25: import { Analysis } from "@/lib/analysis";
26: import { formatDateTime, noDate } from "@/lib/utils";
27: import { Fragment, useState } from "react";
28: import { useTechnologyGoals, TechnologyGoalsDialog, TechnologyGoalsList } from "./technologyGoals";
29: import { ResearchLink } from "./researchLink";
30: import { twMerge } from "tailwind-merge";
31: import { User, Factory, ArrowUp, Pickaxe } from "lucide-react";
32: import { SmartAccordion } from "@/components/ui/smart-accordion";
33: 
34: type AlienGoal = Analysis["expandedAlienGoals"][0];
35: 
36: function AlienGoalList({ goals }: { goals: AlienGoal[] }) {
37:   return (
38:     <ul className="ml-4 mt-1 text-sm space-y-0.5">
39:       {goals.map((goal) => (
40:         <li key={goal.id}>
41:           <strong>{goal.type}</strong> ({goal.importance}){goal.nation && `: ${goal.nation.displayName}`}
42:           {goal.hab && `: ${goal.hab.displayName}${goal.hab.bodyName ? ` (${goal.hab.bodyName})` : ""}`}
43:           {goal.attackTarget && `: ${goal.attackTarget.displayName}`}
44:           {goal.attackTargetFleet && `: Target Fleet: ${goal.attackTargetFleet.displayName}`}
45:           {goal.assignedFleet && `, Assigned: ${goal.assignedFleet.displayName}`}
46:           {goal.pendingFleets &&
47:             goal.pendingFleets.length > 0 &&
48:             `, Pending: ${goal.pendingFleets.map((f) => f.displayName).join(", ")}`}
49:           {goal.enemyFaction && `: vs ${goal.enemyFaction.displayName}`}
50:         </li>
51:       ))}
52:     </ul>
53:   );
54: }
55: 
56: function HabScienceHeader() {
57:   return (
58:     <TableHeader>
59:       <TableRow>
60:         <TableHead>Name</TableHead>
61:         <TableHead>
62:           <CombatScore />
63:         </TableHead>
64:         <TableHead>Most important upcoming completion</TableHead>
65:         <TableHead title="Days to complete">D2C</TableHead>
66:         <TableHead>Alerts</TableHead>
67:         <TableHead title="Current Power">
68:           <HabPower />
69:         </TableHead>
70:         <TableHead title="Future Power">
71:           <HabPower />
72:         </TableHead>
73:         <TableHead>Current bonuses</TableHead>
74:         <TableHead>Future bonuses</TableHead>
75:       </TableRow>
76:     </TableHeader>
77:   );
78: }
79: 
80: function ShowHabCombatEffects({ effects }: { effects: ShowEffectsProps }) {
81:   return <ShowEffects combatScore={effects.combatScore} />;
82: }
83: 
84: function ShowHabScienceEffects({ effects }: { effects: ShowEffectsProps }) {
85:   return (
86:     <ShowEffects
87:       incomeBoost_month={effects.incomeBoost_month}
88:       incomeInfluence_month={effects.incomeInfluence_month}
89:       incomeMissionControl={effects.incomeMissionControl}
90:       incomeMoney_month={effects.incomeMoney_month}
91:       incomeOps_month={effects.incomeOps_month}
92:       incomeResearch_month={effects.incomeResearch_month}
93:       projectCapacityGranted={effects.projectCapacityGranted}
94:       economyBonus={effects.economyBonus}
95:       welfareBonus={effects.welfareBonus}
96:       environmentBonus={effects.environmentBonus}
97:       knowledgeBonus={effects.knowledgeBonus}
98:       governmentBonus={effects.governmentBonus}
99:       unityBonus={effects.unityBonus}
100:       militaryBonus={effects.militaryBonus}
101:       oppressionBonus={effects.oppressionBonus}
102:       spoilsBonus={effects.spoilsBonus}
103:       spaceDevBonus={effects.spaceDevBonus}
104:       spaceflightBonus={effects.spaceflightBonus}
105:       MCBonus={effects.MCBonus}
106:       miningBonus={effects.miningBonus}
107:       techBonuses={effects.techBonuses}
108:       controlPoints={effects.controlPoints}
109:       miltechBonus={effects.miltechBonus}
110:       alienDetection={effects.alienDetection}
111:       humanDetection={effects.humanDetection}
112:       publicCampaignStrength={effects.publicCampaignStrength}
113:     />
114:   );
115: }
116: 
117: function HabScienceTableRow({ hab, time }: { hab: Analysis["playerHabs"][0]; time: string }) {
118:   const { highlightedCompletions, emptyModuleCount, missingMine, activeEffects, potentialEffects } = hab;
119: 
120:   return (
121:     <TableRow key={hab.id}>
122:       <TableCell>
123:         <span title={`site: ${hab.habSiteId}, body: ${hab.orbitStateId}`}>{hab.displayName}</span>
124:       </TableCell>
125:       <TableCell>
126:         <ShowHabCombatEffects effects={activeEffects} />
127:       </TableCell>
128:       <TableCell className="whitespace-normal">
129:         {highlightedCompletions.map((highlightedCompletion, ix) => (
130:           <Fragment key={ix}>
131:             {ix > 0 && ", "}
132:             {highlightedCompletion.displayName} in {highlightedCompletion.daysToCompletion?.toFixed(0)} days
133:           </Fragment>
134:         ))}
135:       </TableCell>
136:       <TableCell>{hab.maxDaysToCompletion ? hab.maxDaysToCompletion.toFixed(0) : ""}</TableCell>
137:       <TableCell>
138:         {emptyModuleCount > 0 && <>{emptyModuleCount} empty slots </>}
139:         {missingMine && <span className="bg-yellow-300 text-black p-1 rounded">Missing Mine </span>}
140:         {hab.hasUnnecessaryFactory && (
141:           <span title="Active factory with no construction - consider turning it off" className="p-1">
142:             <Factory className="inline h-4 w-4 text-red-600" />
143:           </span>
144:         )}
145:         {hab.canUpgradePower && <HabPower title="Power module can be upgraded" />}
146:         {hab.canUpgradeCombat && <CombatScore title="Combat module can be upgraded" />}
147:         {hab.canUpgradeFarm && (
148:           <span title="Farm can be upgraded to support more crew" className="p-1">
149:             <User className="inline h-4 w-4" />
150:           </span>
151:         )}
152:         {hab.canUpgradeFactory && (
153:           <span title="Factory can be upgraded" className="p-1">
154:             <Factory className="inline h-4 w-4" />
155:           </span>
156:         )}
157:         {hab.canUpgradeMining && hab.miningUpgradeInfo && hab.site && (
158:           <TooltipProvider>
159:             <Tooltip>
160:               <TooltipTrigger asChild>
161:                 <span
162:                   className={twMerge(
163:                     "p-1 cursor-help",
164:                     hab.miningUpgradeInfo.factoryTier === 3 ? "bg-green-200 rounded" : "",
165:                   )}
166:                 >
167:                   <Pickaxe className="inline h-4 w-4" />
168:                 </span>
169:               </TooltipTrigger>
170:               <TooltipContent>
171:                 <div className="space-y-1">
172:                   <div className="font-bold">Mining Upgrade Available</div>
173:                   <div>Upgrade to: {hab.miningUpgradeInfo.upgradeName}</div>
174:                   <div>Best factory: {hab.miningUpgradeInfo.factoryName}</div>
175:                   <div className="mt-2 text-sm">
176:                     <div className="font-semibold">Mining effects with best mine:</div>
177:                     <ShowHabMineEffects effects={hab.bestMineEffects} />
178:                   </div>
179:                 </div>
180:               </TooltipContent>
181:             </Tooltip>
182:           </TooltipProvider>
183:         )}
184:         {hab.needsOperationsCenterUpgrade && (
185:           <span className="p-1" title="Operations Center upgrade available">
186:             <MissionControl />
187:           </span>
188:         )}
189:         {hab.needsAdminTowerUpgrade && <span className="p-1" title="Admin Tower upgrade available"></span>}
190:         {hab.upgradeableModuleNames.length > 0 && (
191:           <span title={`Can upgrade to:\n${hab.upgradeableModuleNames.join("\n")}`} className="p-1">
192:             <ArrowUp className="inline h-4 w-4" />
193:           </span>
194:         )}
195:       </TableCell>
196:       <TableCell>{hab.activePower?.toFixed(0)}</TableCell>
197:       <TableCell>
198:         <span className={twMerge(hab.futurePower < 0 ? "bg-red-100 p-1 rounded" : "")}>
199:           {hab.futurePower?.toFixed(0)}
200:         </span>
201:       </TableCell>
202:       <TableCell>
203:         <ShowHabScienceEffects effects={activeEffects} />
204:       </TableCell>
205:       <TableCell>
206:         <ShowHabScienceEffects effects={potentialEffects} />
207:       </TableCell>
208:     </TableRow>
209:   );
210: }
211: 
212: function HabMineHeader() {
213:   return (
214:     <TableHeader>
215:       <TableRow>
216:         <TableHead>Name</TableHead>
217:         <TableHead>
218:           <CombatScore />
219:         </TableHead>
220:         <TableHead>Most important upcoming completion</TableHead>
221:         <TableHead>Alerts</TableHead>
222:         <TableHead>Current income</TableHead>
223:         <TableHead>Current if powered</TableHead>
224:         <TableHead>Best unlocked mine</TableHead>
225:       </TableRow>
226:     </TableHeader>
227:   );
228: }
229: 
230: function ShowHabMineEffects({ effects }: { effects: Analysis["playerHabs"][0]["currentMineEffects"] }) {
231:   return (
232:     <ShowEffects
233:       water={effects.water_month}
234:       volatiles={effects.volatiles_month}
235:       metals={effects.metals_month}
236:       nobles={effects.nobles_month}
237:       fissiles={effects.fissiles_month}
238:     />
239:   );
240: }
241: 
242: function HabMineTableRow({ hab, time }: { hab: Analysis["playerHabs"][0]; time: string }) {
243:   const { highlightedCompletions, emptyModuleCount, missingMine } = hab;
244: 
245:   return (
246:     <TableRow key={hab.id}>
247:       <TableCell>{hab.displayName}</TableCell>
248:       <TableCell>
249:         <ShowHabCombatEffects effects={hab.activeEffects} />
250:       </TableCell>
251:       <TableCell>
252:         <span className="whitespace-normal">
253:           {highlightedCompletions.map((highlightedCompletion, ix) => (
254:             <Fragment key={ix}>
255:               {ix > 0 && ", "}
256:               {highlightedCompletion.templateName} in {highlightedCompletion.daysToCompletion?.toFixed(0)} days
257:             </Fragment>
258:           ))}
259:         </span>
260:       </TableCell>
261:       <TableCell>
262:         {emptyModuleCount > 0 && <>{emptyModuleCount} empty slots </>}
263:         {missingMine && <span className="bg-yellow-300 text-black p-1 rounded">Missing Mine </span>}
264:         {hab.mineTier > 0 && (
265:           <span
266:             className={twMerge(
267:               "text-black p-1 rounded text-xs",
268:               hab.mineTier === 1 ? "bg-blue-100" : hab.mineTier === 2 ? "bg-blue-300" : "bg-blue-500 text-white",
269:             )}
270:           >
271:             M{hab.mineTier}
272:           </span>
273:         )}{" "}
274:         {hab.highestActiveFactoryTier > 0 && (
275:           <span
276:             className={twMerge(
277:               "text-black p-1 rounded text-xs",
278:               hab.highestActiveFactoryTier === 1
279:                 ? "bg-green-100"
280:                 : hab.highestActiveFactoryTier === 2
281:                   ? "bg-green-300"
282:                   : "bg-green-500",
283:               hab.highestActiveFactoryCount === 2
284:                 ? "outline outline-1 outline-black"
285:                 : hab.highestActiveFactoryCount >= 3
286:                   ? "outline outline-2 outline-black"
287:                   : "",
288:             )}
289:           >
290:             F{hab.highestActiveFactoryTier}
291:           </span>
292:         )}
293:       </TableCell>
294:       <TableCell>
295:         <ShowHabMineEffects effects={hab.currentMineEffects} />
296:       </TableCell>
297:       <TableCell>
298:         <ShowHabMineEffects effects={hab.currentMinePoweredEffects} />
299:       </TableCell>
300:       <TableCell>
301:         <ShowHabMineEffects effects={hab.bestMineEffects} />
302:       </TableCell>
303:     </TableRow>
304:   );
305: }
306: 
307: type MineResourceType = "water" | "volatiles" | "metals" | "nobles" | "fissiles" | null;
308: type MineSortDirection = "asc" | "desc" | null;
309: 
310: export function getHabsUi(analysis: Analysis) {
311:   const { playerHabs } = analysis;
312: 
313:   const missingMines = playerHabs.filter((h) => h.missingMine);
314:   const unnecessaryFactoryHabs = playerHabs.filter((h) => h.hasUnnecessaryFactory);
315:   const upgradablePowerHabs = playerHabs.filter((h) => h.canUpgradePower);
316:   const upgradableCombatHabs = playerHabs.filter((h) => h.canUpgradeCombat);
317:   const upgradableFarmHabs = playerHabs.filter((h) => h.canUpgradeFarm);
318:   const upgradableFactoryHabs = playerHabs.filter((h) => h.canUpgradeFactory);
319:   const upgradableMiningHabs = playerHabs.filter((h) => h.canUpgradeMining);
320:   const upgradableOtherHabs = playerHabs.filter((h) => h.upgradeableModuleNames.length > 0);
321:   const nextCompletion = playerHabs
322:     .flatMap((i) => i.highlightedCompletions)
323:     .filter((i) => i)
324:     .toSorted((a, b) => {
325:       return a.daysToCompletion < b.daysToCompletion ? -1 : 1;
326:     })[0];
327: 
328:   // can't use a tooltip for this because it's in the button that is the tab label, which would be nested buttons and cause hydration issues
329:   const missingMinesTitle =
330:     missingMines.length > 0 ? `Missing mines: ${missingMines.map((h) => h.displayName).join(", ")}` : "";
331:   const unnecessaryFactoryTitle =
332:     unnecessaryFactoryHabs.length > 0
333:       ? `${unnecessaryFactoryHabs.length} hab${unnecessaryFactoryHabs.length > 1 ? "s have" : " has"} unnecessary active factories`
334:       : "";
335:   const upgradablePowerTitle =
336:     upgradablePowerHabs.length > 0
337:       ? `${upgradablePowerHabs.length} hab${upgradablePowerHabs.length > 1 ? "s" : ""} can upgrade power modules`
338:       : "";
339:   const upgradableCombatTitle =
340:     upgradableCombatHabs.length > 0
341:       ? `${upgradableCombatHabs.length} hab${upgradableCombatHabs.length > 1 ? "s" : ""} can upgrade combat modules`
342:       : "";
343:   const upgradableFarmTitle =
344:     upgradableFarmHabs.length > 0
345:       ? `${upgradableFarmHabs.length} hab${upgradableFarmHabs.length > 1 ? "s" : ""} can upgrade farms for more crew`
346:       : "";
347:   const upgradableFactoryTitle =
348:     upgradableFactoryHabs.length > 0
349:       ? `${upgradableFactoryHabs.length} hab${upgradableFactoryHabs.length > 1 ? "s" : ""} can upgrade factories`
350:       : "";
351:   const upgradableMiningTitle =
352:     upgradableMiningHabs.length > 0
353:       ? `${upgradableMiningHabs.length} hab${upgradableMiningHabs.length > 1 ? "s" : ""} can upgrade mining modules`
354:       : "";
355:   const upgradableOtherTitle =
356:     upgradableOtherHabs.length > 0
357:       ? `${upgradableOtherHabs.length} hab${
358:           upgradableOtherHabs.length > 1 ? "s have" : " has"
359:         } other upgradeable modules`
360:       : "";
361: 
362:   return {
363:     key: "habs",
364:     tab: (
365:       <>
366:         Habs ({playerHabs.length}){nextCompletion && <> {nextCompletion.daysToCompletion?.toFixed(0)}d</>}
367:         {missingMines.length > 0 && (
368:           <>
369:             {" "}
370:             <span className="bg-yellow-300 text-black p-1 rounded" title={missingMinesTitle}>
371:               M
372:             </span>
373:           </>
374:         )}
375:         {unnecessaryFactoryHabs.length > 0 && (
376:           <>
377:             {" "}
378:             <span title={unnecessaryFactoryTitle}>
379:               <Factory className="inline h-4 w-4 text-red-600" />
380:             </span>
381:           </>
382:         )}
383:         {upgradablePowerHabs.length > 0 && (
384:           <>
385:             {" "}
386:             <HabPower title={upgradablePowerTitle} />
387:           </>
388:         )}
389:         {upgradableCombatHabs.length > 0 && (
390:           <>
391:             {" "}
392:             <CombatScore title={upgradableCombatTitle} />
393:           </>
394:         )}
395:         {upgradableFarmHabs.length > 0 && (
396:           <>
397:             {" "}
398:             <span title={upgradableFarmTitle}>
399:               <User className="inline h-4 w-4" />
400:             </span>
401:           </>
402:         )}
403:         {upgradableFactoryHabs.length > 0 && (
404:           <>
405:             {" "}
406:             <span title={upgradableFactoryTitle}>
407:               <Factory className="inline h-4 w-4" />
408:             </span>
409:           </>
410:         )}
411:         {upgradableMiningHabs.length > 0 && (
412:           <>
413:             {" "}
414:             <span title={upgradableMiningTitle}>
415:               <Pickaxe className="inline h-4 w-4" />
416:             </span>
417:           </>
418:         )}
419:         {upgradableOtherHabs.length > 0 && (
420:           <>
421:             {" "}
422:             <span title={upgradableOtherTitle}>
423:               <ArrowUp className="inline h-4 w-4" />
424:             </span>
425:           </>
426:         )}
427:       </>
428:     ),
429:     content: (
430:       <HabsComponent
431:         {...{
432:           analysis,
433:         }}
434:       />
435:     ),
436:   };
437: }
438: 
439: function HabsComponent({ analysis }: { analysis: Analysis }) {
440:   // State for sorting mines table
441:   const [mineSortResource, setMineSortResource] = useState<MineResourceType>(null);
442:   const [mineSortDirection, setMineSortDirection] = useState<MineSortDirection>(null);
443: 
444:   const {
445:     playerHabs,
446:     playerFaction: {
447:       availableBoostProjects,
448:       availableCPProjects,
449:       availableMaxOrgProjects,
450:       availableExpandNationProjects,
451:     },
452:     playerStealableProjects,
453:   } = analysis;
454:   const time = formatDateTime(analysis.gameCurrentDateTime);
455:   const { goals, addGoal, removeGoal } = useTechnologyGoals(analysis);
456:   const activeEffects = playerHabs.reduce<ShowEffectsProps>((acc, hab) => combineEffects(acc, hab.activeEffects), {});
457:   const potentialEffects = playerHabs.reduce<ShowEffectsProps>(
458:     (acc, hab) => combineEffects(acc, hab.potentialEffects),
459:     {},
460:   );
461: 
462:   // Handler for clicking mining bonus resources to sort
463:   const handleMineResourceSort = (resource: MineResourceType) => {
464:     if (mineSortResource === resource) {
465:       // Same resource clicked - cycle through asc -> desc -> null
466:       if (mineSortDirection === "desc") {
467:         setMineSortDirection("asc");
468:       } else if (mineSortDirection === "asc") {
469:         setMineSortResource(null);
470:         setMineSortDirection(null);
471:       }
472:     } else {
473:       // New resource clicked - start with ascending
474:       setMineSortResource(resource);
475:       setMineSortDirection("desc");
476:     }
477:   };
478: 
479:   // Sort habs for mines table
480:   const sortedMineHabs = [...playerHabs]
481:     .filter((i) => i.habType === "Base")
482:     .sort((a, b) => {
483:       if (!mineSortResource || !mineSortDirection) return 0;
484: 
485:       const resourceKey = `${mineSortResource}_month` as keyof typeof a.currentMinePoweredEffects;
486:       const aValue = a.currentMinePoweredEffects[resourceKey];
487:       const bValue = b.currentMinePoweredEffects[resourceKey];
488: 
489:       if (mineSortDirection === "asc") {
490:         return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
491:       } else {
492:         return bValue < aValue ? -1 : bValue > aValue ? 1 : 0;
493:       }
494:     });
495: 
496:   const activeMineSummary = playerHabs
497:     .filter((h) => h.site)
498:     .reduce(
499:       (acc, hab) => {
500:         const effects = hab.currentMineEffects;
501:         if (
502:           effects.water_month > 0 ||
503:           effects.volatiles_month > 0 ||
504:           effects.metals_month > 0 ||
505:           effects.nobles_month > 0 ||
506:           effects.fissiles_month > 0
507:         ) {
508:           acc.count++;
509:           acc.water_month += effects.water_month;
510:           acc.volatiles_month += effects.volatiles_month;
511:           acc.metals_month += effects.metals_month;
512:           acc.nobles_month += effects.nobles_month;
513:           acc.fissiles_month += effects.fissiles_month;
514:         }
515:         return acc;
516:       },
517:       {
518:         count: 0,
519:         water_month: 0,
520:         volatiles_month: 0,
521:         metals_month: 0,
522:         nobles_month: 0,
523:         fissiles_month: 0,
524:         miningModifier: 0,
525:       },
526:     );
527:   const mineSummary = playerHabs
528:     .filter((h) => h.site)
529:     .reduce(
530:       (acc, hab) => {
531:         const effects = hab.bestMineEffects;
532:         acc.count++;
533:         acc.water_month += effects.water_month;
534:         acc.volatiles_month += effects.volatiles_month;
535:         acc.metals_month += effects.metals_month;
536:         acc.nobles_month += effects.nobles_month;
537:         acc.fissiles_month += effects.fissiles_month;
538:         return acc;
539:       },
540:       {
541:         count: 0,
542:         water_month: 0,
543:         volatiles_month: 0,
544:         metals_month: 0,
545:         nobles_month: 0,
546:         fissiles_month: 0,
547:         miningModifier: 0,
548:       },
549:     );
550: 
551:   const techGoals = useTechnologyGoals(analysis);
552:   const habsWithoutSolarPowerMultipler = playerHabs
553:     .filter((hab) => hab.hasSolar && !hab.solarMultiplier)
554:     .toSorted((a, b) => a.finderSortOverride - b.finderSortOverride);
555: 
556:   return (
557:     <div className="space-y-2">
558:       <SmartAccordion
559:         type="multiple"
560:         defaultValue={["current-bonuses", "future-bonuses", "available-cp-projects"]}
561:         storageKey="habs"
562:       >
563:         <AccordionItem value="current-bonuses">
564:           <AccordionTrigger>
565:             <span>Current Hab bonuses</span>
566:           </AccordionTrigger>
567:           <AccordionContent>
568:             <ShowHabScienceEffects effects={activeEffects} />
569:           </AccordionContent>
570:         </AccordionItem>
571:         <AccordionItem value="future-bonuses">
572:           <AccordionTrigger>
573:             <span>Future Hab bonuses (including unpowered/under-construction)</span>
574:           </AccordionTrigger>
575:           <AccordionContent>
576:             <ShowHabScienceEffects effects={potentialEffects} />
577:           </AccordionContent>
578:         </AccordionItem>
579:         <AccordionItem value="boost-mc-summary">
580:           <AccordionTrigger>
581:             <span>MC/Boost Income Summary</span>
582:           </AccordionTrigger>
583:           <AccordionContent>
584:             <div className="flex space-x-4 pb-4">
585:               <span>
586:                 <Boost />
587:                 {analysis.playerFaction.nationHistory.currentBoost.toFixed(2)}
588:                 {analysis.playerFaction.nationHistory.boostMonthlyChange !== 0 && (
589:                   <span
590:                     className={
591:                       analysis.playerFaction.nationHistory.boostMonthlyChange > 0 ? "text-green-600" : "text-red-600"
592:                     }
593:                   >
594:                     {" "}
595:                     ({analysis.playerFaction.nationHistory.boostMonthlyChange > 0 ? "+" : ""}
596:                     {analysis.playerFaction.nationHistory.boostMonthlyChange.toFixed(2)})
597:                   </span>
598:                 )}
599:               </span>
600:               <span>
601:                 <MissionControl />
602:                 {analysis.playerFaction.nationHistory.currentMC.toFixed(0)}
603:                 {analysis.playerFaction.nationHistory.mcMonthlyChange !== 0 && (
604:                   <span
605:                     className={
606:                       analysis.playerFaction.nationHistory.mcMonthlyChange > 0 ? "text-green-600" : "text-red-600"
607:                     }
608:                   >
609:                     {" "}
610:                     ({analysis.playerFaction.nationHistory.mcMonthlyChange > 0 ? "+" : ""}
611:                     {analysis.playerFaction.nationHistory.mcMonthlyChange.toFixed(0)})
612:                   </span>
613:                 )}
614:               </span>
615:             </div>
616:           </AccordionContent>
617:         </AccordionItem>
618:         <AccordionItem value="alien-hate">
619:           <AccordionTrigger>
620:             <span>Alien Hate</span>
621:           </AccordionTrigger>
622:           <AccordionContent>
623:             <div className="space-y-1">
624:               <div>
625:                 <strong>Current Alien Strategy:</strong>{" "}
626:                 {analysis.alienFaction.defaultPriorityPresetTemplateName || "Unknown"}
627:               </div>
628:               <div>
629:                 <strong>Active Goals (Top 10 of {analysis.expandedAlienGoals.length} by Importance):</strong>
630:                 <AlienGoalList goals={analysis.expandedAlienGoals.slice(0, 10)} />
631:                 {analysis.expandedAlienGoals.length > 10 && (
632:                   <Collapsible className="mt-2">
633:                     <CollapsibleTrigger className="text-sm text-blue-500 hover:underline ml-4">
634:                       Show {analysis.expandedAlienGoals.length - 10} more goals...
635:                     </CollapsibleTrigger>
636:                     <CollapsibleContent>
637:                       <AlienGoalList goals={analysis.expandedAlienGoals.slice(10)} />
638:                     </CollapsibleContent>
639:                   </Collapsible>
640:                 )}
641:               </div>
642:               <div>
643:                 <strong>Alien Hate of Player:</strong>{" "}
644:                 {analysis.alienFaction.factionHate?.get(analysis.playerFaction.id)?.toFixed(1) ?? "Unknown"}
645:               </div>
646:               <div>
647:                 <strong>Assessed Alien Hate of Player:</strong>{" "}
648:                 {analysis.playerFaction.assessedAlienHateOfMe?.toFixed(1) ?? "Unknown"}
649:               </div>
650:               <div>
651:                 <strong>Last Fixed Hate Date:</strong>{" "}
652:                 {analysis.playerFaction.lastDateOfFixedAlienHate
653:                   ? formatDateTime(analysis.playerFaction.lastDateOfFixedAlienHate)
654:                   : "Never"}
655:               </div>
656:             </div>
657:           </AccordionContent>
658:         </AccordionItem>
659:         <AccordionItem value="building-details">
660:           <AccordionTrigger>
661:             <span>Building Details</span>
662:           </AccordionTrigger>
663:           <AccordionContent>
664:             <Table>
665:               <TableHeader>
666:                 <TableRow>
667:                   <TableHead>Building</TableHead>
668:                   <TableHead className="text-right">Current Count</TableHead>
669:                   <TableHead className="text-right">Future Count</TableHead>
670:                   <TableHead>Current Bonuses</TableHead>
671:                   <TableHead>Future Bonuses</TableHead>
672:                 </TableRow>
673:               </TableHeader>
674:               <TableBody>
675:                 {analysis.buildingSummary.map((building) => (
676:                   <TableRow key={building.templateName}>
677:                     <TableCell>{building.friendlyName}</TableCell>
678:                     <TableCell className="text-right">{building.currentCount}</TableCell>
679:                     <TableCell className="text-right">{building.futureCount}</TableCell>
680:                     <TableCell>
681:                       <ShowHabScienceEffects effects={building.currentEffects} />
682:                     </TableCell>
683:                     <TableCell>
684:                       <ShowHabScienceEffects effects={building.futureEffects} />
685:                     </TableCell>
686:                   </TableRow>
687:                 ))}
688:               </TableBody>
689:             </Table>
690:           </AccordionContent>
691:         </AccordionItem>
692:         {availableBoostProjects.length > 0 && (
693:           <AccordionItem value="available-boost-projects">
694:             <AccordionTrigger>
695:               <span>Available Boost Projects</span>
696:             </AccordionTrigger>
697:             <AccordionContent>
698:               <ul>
699:                 {availableBoostProjects
700:                   .toSorted((a, b) => a.researchCost - b.researchCost)
701:                   .map((project, ix) => {
702:                     const Icon = TechIcons[project.techCategory] || UnknownIcon;
703:                     return (
704:                       <li key={ix}>
705:                         <Icon /> <ResearchLink name={project.dataName} displayName={project.friendlyName} /> (
706:                         {project.researchCost})
707:                       </li>
708:                     );
709:                   })}
710:               </ul>
711:             </AccordionContent>
712:           </AccordionItem>
713:         )}
714:         {availableCPProjects.length > 0 && (
715:           <AccordionItem value="available-cp-projects">
716:             <AccordionTrigger>
717:               <span>Available Control Point Projects</span>
718:             </AccordionTrigger>
719:             <AccordionContent>
720:               <ul>
721:                 {availableCPProjects
722:                   .toSorted((a, b) => {
723:                     // Sort by efficiency: CP gained per research remaining (highest first)
724:                     const aRemaining = a.researchCost - a.currentProgress;
725:                     const bRemaining = b.researchCost - b.currentProgress;
726:                     const aEfficiency = aRemaining > 0 ? a.cpBonus / aRemaining : 0;
727:                     const bEfficiency = bRemaining > 0 ? b.cpBonus / bRemaining : 0;
728:                     return bEfficiency - aEfficiency;
729:                   })
730:                   .map((project, ix) => {
731:                     const Icon = TechIcons[project.techCategory] || UnknownIcon;
732:                     return (
733:                       <li key={ix}>
734:                         <Icon /> <ResearchLink name={project.dataName} displayName={project.friendlyName} /> (
735:                         {project.currentProgress.toFixed(0)}/{project.researchCost}, +{project.cpBonus} CP)
736:                       </li>
737:                     );
738:                   })}
739:               </ul>
740:             </AccordionContent>
741:           </AccordionItem>
742:         )}
743:         {availableMaxOrgProjects.length > 0 && (
744:           <AccordionItem value="available-max-org-projects">
745:             <AccordionTrigger>
746:               <span>Available Max Org Projects</span>
747:             </AccordionTrigger>
748:             <AccordionContent>
749:               <ul>
750:                 {availableMaxOrgProjects
751:                   .toSorted((a, b) => a.researchCost - b.researchCost)
752:                   .map((project, ix) => {
753:                     const Icon = TechIcons[project.techCategory] || UnknownIcon;
754:                     return (
755:                       <li key={ix}>
756:                         <Icon /> <ResearchLink name={project.dataName} displayName={project.friendlyName} /> (
757:                         {project.researchCost})
758:                       </li>
759:                     );
760:                   })}
761:               </ul>
762:             </AccordionContent>
763:           </AccordionItem>
764:         )}
765:         {availableExpandNationProjects.length > 0 && (
766:           <AccordionItem value="available-expand-nation-projects">
767:             <AccordionTrigger>
768:               <span>Available Expand Nations</span>
769:             </AccordionTrigger>
770:             <AccordionContent>
771:               <ul>
772:                 {availableExpandNationProjects
773:                   .toSorted((a, b) => {
774:                     // Sort by progress (most complete first)
775:                     const aRemaining = a.researchCost - a.currentProgress;
776:                     const bRemaining = b.researchCost - b.currentProgress;
777:                     return aRemaining - bRemaining;
778:                   })
779:                   .map((project, ix) => {
780:                     const Icon = TechIcons[project.techCategory] || UnknownIcon;
781:                     return (
782:                       <li key={ix}>
783:                         <Icon /> <ResearchLink name={project.dataName} displayName={project.friendlyName} /> (
784:                         {project.currentProgress.toFixed(0)}/{project.researchCost}, {project.requiresNation})
785:                       </li>
786:                     );
787:                   })}
788:               </ul>
789:             </AccordionContent>
790:           </AccordionItem>
791:         )}
792:         {playerStealableProjects.length > 0 && (
793:           <AccordionItem value="available-stealable-projects">
794:             <AccordionTrigger>
795:               <span>Available Stealable Projects</span>
796:             </AccordionTrigger>
797:             <AccordionContent>
798:               <ul>
799:                 {playerStealableProjects.map(({ projectName, factionId }, ix) => {
800:                   const faction = analysis.factionsById.get(factionId);
801:                   if (!faction) return null;
802:                   const FactionIcon = faction.templateName
803:                     ? FactionIcons[faction.templateName]
804:                     : UnknownIcon || UnknownIcon;
805:                   const project = analysis.projects.get(projectName);
806:                   if (!project) return null;
807:                   const Icon = TechIcons[project.techCategory] || UnknownIcon;
808:                   return (
809:                     <li key={ix}>
810:                       <FactionIcon title={faction.displayName!} /> {faction.displayName} <Icon />{" "}
811:                       <ResearchLink name={projectName} displayName={project.displayName!} /> ({project.researchCost})
812:                     </li>
813:                   );
814:                 })}
815:               </ul>
816:             </AccordionContent>
817:           </AccordionItem>
818:         )}
819:         <AccordionItem value="technology-goals">
820:           <AccordionTrigger>
821:             <span>Technology goals</span>
822:           </AccordionTrigger>
823:           <AccordionContent>
824:             <TechnologyGoalsDialog
825:               analysis={analysis}
826:               goals={techGoals.goals}
827:               onAdd={techGoals.addGoal}
828:               onRemove={techGoals.removeGoal}
829:             />
830:             <ResearchLink displayName="Tech Tree" className="ml-5" />
831:             <br />
832:             <br />
833:             <TechnologyGoalsList analysis={analysis} goals={techGoals.goals} onRemove={techGoals.removeGoal} />
834:           </AccordionContent>
835:         </AccordionItem>
836:         <AccordionItem value="habs">
837:           <AccordionTrigger>
838:             <span>Manage Habs</span>
839:           </AccordionTrigger>
840:           <AccordionContent>
841:             <>
842:               {habsWithoutSolarPowerMultipler.length > 0 && (
843:                 <>
844:                   <h3>Habs without Solar Power Multiplier</h3>
845:                   <ul>
846:                     {habsWithoutSolarPowerMultipler.map((hab) => (
847:                       <li key={hab.id}>
848:                         {hab.displayName} - site/orbit id: {hab.habSiteId || hab.orbitStateId}
849:                       </li>
850:                     ))}
851:                   </ul>
852:                 </>
853:               )}
854:               <Table>
855:                 <HabScienceHeader />
856:                 <TableBody>
857:                   {playerHabs.map((hab) => (
858:                     <HabScienceTableRow hab={hab} key={hab.id} time={time} />
859:                   ))}
860:                 </TableBody>
861:               </Table>
862:             </>
863:           </AccordionContent>
864:         </AccordionItem>
865:         <AccordionItem value="mines">
866:           <AccordionTrigger>
867:             <span>Manage Mines</span>
868:           </AccordionTrigger>
869:           <AccordionContent innerClassName="py-2 space-y-2">
870:             <Card>
871:               <CardHeader>
872:                 <CardTitle>Mining Bonuses</CardTitle>
873:               </CardHeader>
874:               <CardContent>
875:                 <div className="flex gap-4 text-sm">
876:                   <button
877:                     className="flex items-center gap-1 cursor-pointer hover:underline"
878:                     onClick={() => handleMineResourceSort("water")}
879:                   >
880:                     <Water />
881:                     {((analysis.playerFaction.miningMultipliers.water - 1) * 100).toFixed(0)}%
882:                   </button>
883:                   <button
884:                     className="flex items-center gap-1 cursor-pointer hover:underline"
885:                     onClick={() => handleMineResourceSort("volatiles")}
886:                   >
887:                     <Volatiles />
888:                     {((analysis.playerFaction.miningMultipliers.volatiles - 1) * 100).toFixed(0)}%
889:                   </button>
890:                   <button
891:                     className="flex items-center gap-1 cursor-pointer hover:underline"
892:                     onClick={() => handleMineResourceSort("metals")}
893:                   >
894:                     <Metals />
895:                     {((analysis.playerFaction.miningMultipliers.metals - 1) * 100).toFixed(0)}%
896:                   </button>
897:                   <button
898:                     className="flex items-center gap-1 cursor-pointer hover:underline"
899:                     onClick={() => handleMineResourceSort("nobles")}
900:                   >
901:                     <Nobles />
902:                     {((analysis.playerFaction.miningMultipliers.nobles - 1) * 100).toFixed(0)}%
903:                   </button>
904:                   <button
905:                     className="flex items-center gap-1 cursor-pointer hover:underline"
906:                     onClick={() => handleMineResourceSort("fissiles")}
907:                   >
908:                     <Fissiles />
909:                     {((analysis.playerFaction.miningMultipliers.fissiles - 1) * 100).toFixed(0)}%
910:                   </button>
911:                 </div>
912:               </CardContent>
913:             </Card>
914:             <Card>
915:               <CardHeader>
916:                 <CardTitle>Base income from active mines</CardTitle>
917:               </CardHeader>
918:               <CardContent>
919:                 <span>{activeMineSummary.count} active mines</span> <ShowHabMineEffects effects={activeMineSummary} />
920:               </CardContent>
921:             </Card>
922:             <Card>
923:               <CardHeader>
924:                 <CardTitle>Base income from potential mines</CardTitle>
925:               </CardHeader>
926:               <CardContent>
927:                 <span>{mineSummary.count} potential mines</span> <ShowHabMineEffects effects={mineSummary} />
928:               </CardContent>
929:             </Card>
930:             <Table>
931:               <HabMineHeader />
932:               <TableBody>
933:                 {sortedMineHabs.map((hab) => (
934:                   <HabMineTableRow hab={hab} key={hab.id} time={time} />
935:                 ))}
936:               </TableBody>
937:             </Table>
938:           </AccordionContent>
939:         </AccordionItem>
940:       </SmartAccordion>
941: 
942:       <Collapsible>
943:         <CollapsibleTrigger asChild>
944:           <Button variant="outline">Debug Data</Button>
945:         </CollapsibleTrigger>
946:         <CollapsibleContent>
947:           <pre>{JSON.stringify(analysis.playerHabs, null, 2)}</pre>
948:         </CollapsibleContent>
949:       </Collapsible>
950:     </div>
951:   );
952: }

(End of file - total 952 lines)
</content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "terra-invicta-assistant\\src\\app\\game\\current\\resources.tsx"
}
```

**Output:**
```
<path>terra-invicta-assistant\src\app\game\current\resources.tsx</path>
<type>file</type>
<content>
1: "use client";
2: 
3: import { Boost, ControlPoint, FactionIcons, MissionControl, PrioritySpoils, ResourceIcons } from "@/components/icons";
4: import { pct } from "@/components/showEffects";
5: import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
6: import { Button } from "@/components/ui/button";
7: import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
8: import { SmartAccordion } from "@/components/ui/smart-accordion";
9: import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
10: import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
11: import { Analysis } from "@/lib/analysis";
12: import { ClaimCoverage } from "@/lib/analysis/nations";
13: import { diffDateTime, smartRound, sortByDateTime, toDays } from "@/lib/utils";
14: import { Trash2 } from "lucide-react";
15: import { twMerge } from "tailwind-merge";
16: 
17: function getNationBg(
18:   nation: Pick<Analysis["nations"][0], "wastedOppression" | "tooHighUnrest" | "couldBuildBoost" | "spoilsWithoutAllCPs">
19: ) {
20:   return twMerge(
21:     nation.couldBuildBoost ? "bg-green-100" : "",
22:     nation.tooHighUnrest ? "bg-yellow-100" : "",
23:     nation.spoilsWithoutAllCPs ? "bg-yellow-100" : "",
24:     nation.wastedOppression ? "bg-red-100" : ""
25:   );
26: }
27: 
28: export function getResourcesUi(analysis: Analysis) {
29:   const spoils = analysis.playerFaction.monthlyTransactionSummary
30:     .filter((i) => i.resource === "Money" && i.source === "Spoils")
31:     .reduce((sum, i) => sum + i.amount, 0);
32:   const { mcUsage, mcCurrentLimit, mcAlienWarLimit, mcHateFloor } = analysis.playerFaction;
33:   const nationBg = getNationBg(
34:     analysis.nations
35:       .filter((i) => i.controlPoints.some((cp) => cp.factionId === analysis.playerFaction.id))
36:       .reduce(
37:         (acc, nation) => {
38:           acc.wastedOppression = acc.wastedOppression || nation.wastedOppression;
39:           acc.tooHighUnrest = acc.tooHighUnrest || nation.tooHighUnrest;
40:           acc.couldBuildBoost = acc.couldBuildBoost || nation.couldBuildBoost;
41:           acc.spoilsWithoutAllCPs = acc.spoilsWithoutAllCPs || nation.spoilsWithoutAllCPs;
42:           return acc;
43:         },
44:         {
45:           wastedOppression: false as boolean,
46:           tooHighUnrest: false as boolean,
47:           couldBuildBoost: false as boolean,
48:           spoilsWithoutAllCPs: false as boolean,
49:         }
50:       )
51:   );
52: 
53:   // once you're using over 300mc, you're not worried about your MC hate floor anymore.
54:   const showMcInfo = mcUsage < 300;
55:   return {
56:     key: "resources",
57:     tab: (
58:       <>
59:         <span className={twMerge(nationBg, "px-1 py-0.5 -mx-1 -my-0.5 rounded")}>Resources</span>
60:         (<PrioritySpoils /> ${spoils.toFixed(0)}
61:         {showMcInfo ? (
62:           <>
63:             , <MissionControl /> {mcUsage.toFixed(0)}/{mcCurrentLimit.toFixed(0)} -
64:             <span title="If more MC is used than this, alien hate will never fall below 50">
65:               Lim {mcAlienWarLimit.toFixed(0)}
66:             </span>
67:             <span title="Current hate floor (alien hate cannot go below this due to your MC usage)">
68:               Flr {mcHateFloor.toFixed(0)}
69:             </span>
70:           </>
71:         ) : null}
72:         )
73:       </>
74:     ),
75:     content: (
76:       <ResourcesComponent
77:         {...{
78:           analysis,
79:         }}
80:       />
81:     ),
82:   };
83: }
84: 
85: function ResourcesComponent({ analysis }: { analysis: Analysis }) {
86:   const {
87:     playerFaction: { monthlyTransactionSummary, permaAbandonedNationIds, id: playerFactionId },
88:     nations,
89:     factionsById,
90:   } = analysis;
91: 
92:   const bySourceByResource = monthlyTransactionSummary.reduce((acc, curr) => {
93:     if (!acc.has(curr.source)) {
94:       acc.set(curr.source, new Map<string, { amount: number; transactions: { date: string; amount: number }[] }>());
95:     }
96:     const resourceMap = acc.get(curr.source)!;
97:     const existing = resourceMap.get(curr.resource) || { amount: 0, transactions: [] };
98:     existing.amount += curr.amount;
99:     if (curr.transactions && curr.transactions.length > 0) {
100:       existing.transactions.push(...curr.transactions);
101:     }
102:     resourceMap.set(curr.resource, existing);
103:     return acc;
104:   }, new Map<string, Map<string, { amount: number; transactions: { date: string; amount: number }[] }>>());
105: 
106:   const byResource = monthlyTransactionSummary.reduce((acc, curr) => {
107:     if (!acc.has(curr.resource)) {
108:       acc.set(curr.resource, 0);
109:     }
110:     acc.set(curr.resource, acc.get(curr.resource)! + curr.amount);
111:     return acc;
112:   }, new Map<string, number>());
113: 
114:   const resourcesSet = new Set([
115:     "Money",
116:     "Influence",
117:     "Operations",
118:     "Research",
119:     "Boost",
120:     "Water",
121:     "Volatiles",
122:     "Metals",
123:     "NobleMetals",
124:     "Fissiles",
125:     "Antimatter",
126:     "Exotics",
127:     ...byResource.keys(),
128:   ]);
129:   // these aren't really an "income"-style resource
130:   resourcesSet.delete("Projects");
131:   resourcesSet.delete("MissionControl");
132:   const resources = [...resourcesSet];
133: 
134:   return (
135:     <div className="space-y-2">
136:       <SmartAccordion type="single" collapsible defaultValue="transactions" storageKey="resources-accordion">
137:         <AccordionItem value="transactions">
138:           <AccordionTrigger>
139:             <span>Transactions</span>
140:           </AccordionTrigger>
141:           <AccordionContent>
142:             <Table>
143:               <TableHeader>
144:                 <TableRow>
145:                   <TableHead>Source</TableHead>
146:                   {resources.map((resource) => (
147:                     <TableHead key={resource}>
148:                       {(() => {
149:                         const Icon = ResourceIcons[resource as keyof typeof ResourceIcons];
150:                         return Icon ? <Icon /> : null;
151:                       })()}{" "}
152:                       {resource}
153:                     </TableHead>
154:                   ))}
155:                 </TableRow>
156:               </TableHeader>
157:               <TableBody>
158:                 {[...bySourceByResource.entries()].map(([source, resourceMap]) => (
159:                   <TableRow key={source}>
160:                     <TableCell>{source}</TableCell>
161:                     {resources.map((resource) => {
162:                       const data = resourceMap.get(resource);
163:                       if (!data) return <TableCell key={resource}></TableCell>;
164:                       
165:                       const hasTooltip = (resource === "Exotics" || resource === "Antimatter") && data.transactions.length > 0;
166:                       const content = smartRound(data.amount);
167:                       
168:                       return (
169:                         <TableCell key={resource}>
170:                           {hasTooltip ? (
171:                             <TooltipProvider>
172:                               <Tooltip>
173:                                 <TooltipTrigger asChild>
174:                                   <span className="cursor-help">{content}</span>
175:                                 </TooltipTrigger>
176:                                 <TooltipContent>
177:                                   <div className="space-y-1">
178:                                     {data.transactions.map((txn, i) => (
179:                                       <div key={i}>{txn.date}: {smartRound(txn.amount)}</div>
180:                                     ))}
181:                                   </div>
182:                                 </TooltipContent>
183:                               </Tooltip>
184:                             </TooltipProvider>
185:                           ) : (
186:                             content
187:                           )}
188:                         </TableCell>
189:                       );
190:                     })}
191:                   </TableRow>
192:                 ))}
193:               </TableBody>
194:               <TableFooter>
195:                 <TableRow>
196:                   <TableHead>Total</TableHead>
197:                   {resources.map((resource) => (
198:                     <TableHead key={resource}>{smartRound(byResource.get(resource) || 0)}</TableHead>
199:                   ))}
200:                 </TableRow>
201:               </TableFooter>
202:             </Table>
203:           </AccordionContent>
204:         </AccordionItem>
205:         <AccordionItem value="owned">
206:           <AccordionTrigger>Owned nations</AccordionTrigger>
207:           <AccordionContent>
208:             <Table>
209:               <TableHeader>
210:                 <TableRow>
211:                   <TableHead>Nation</TableHead>
212:                   <TableHead>Control Points</TableHead>
213:                   <TableHead>Opp P</TableHead>
214:                   <TableHead>Boost P</TableHead>
215:                   <TableHead>MC P</TableHead>
216:                   <TableHead>Spoil P</TableHead>
217:                   <TableHead>Unrest</TableHead>
218:                   <TableHead>Total Spoils</TableHead>
219:                   <TableHead>Total Spoils Per Point</TableHead>
220:                   <TableHead>Total Spoils Per CP Cost</TableHead>
221:                   <TableHead>Current MC / Boost</TableHead>
222:                   <TableHead>Boost/mo Per CP Cost</TableHead>
223:                   <TableHead>MC Per CP Cost</TableHead>
224:                 </TableRow>
225:               </TableHeader>
226:               <TableBody>
227:                 {nations
228:                   .filter((i) => i.controlPoints.some((cp) => cp.factionId === playerFactionId))
229:                   .toSorted((a, b) => (a.totalSpoilsPerCpCost < b.totalSpoilsPerCpCost ? 1 : -1))
230:                   .map((nation) => (
231:                     <TableRow key={nation.id} className={getNationBg(nation)}>
232:                       <TableCell>{nation.displayName}</TableCell>
233:                       <TableCell>
234:                         <NationCPDetails {...{ analysis, nation }} />
235:                       </TableCell>
236:                       <TableCell>
237:                         {nation.allocatedPriorities.Oppression ? pct(nation.allocatedPriorities.Oppression) : null}
238:                       </TableCell>
239:                       <TableCell>
240:                         {nation.allocatedPriorities.LaunchFacilities
241:                           ? pct(nation.allocatedPriorities.LaunchFacilities)
242:                           : null}
243:                       </TableCell>
244:                       <TableCell>
245:                         {nation.allocatedPriorities.MissionControl
246:                           ? pct(nation.allocatedPriorities.MissionControl)
247:                           : null}
248:                       </TableCell>
249:                       <TableCell>
250:                         {nation.allocatedPriorities.Spoils ? pct(nation.allocatedPriorities.Spoils) : null}
251:                       </TableCell>
252:                       <TableCell>{nation.unrest.toFixed(2)}</TableCell>
253:                       <TableCell>
254:                         <span
255:                           title={`${nation.valuePerSpoilsIP.toFixed(1)} per IP * ${nation.investmentPoints.toFixed(
256:                             2
257:                           )} IP`}
258:                         >
259:                           {nation.totalSpoils.toFixed(0)}
260:                         </span>
261:                       </TableCell>
262:                       <TableCell>{nation.totalSpoilsPerControlPoint.toFixed(0)}</TableCell>
263:                       <TableCell>{nation.totalSpoilsPerCpCost.toFixed(2)}</TableCell>
264:                       <TableCell>
265:                         {nation.mc.toFixed(0)} <MissionControl /> / {nation.boostPerMonth.toFixed(2)} <Boost />
266:                       </TableCell>
267:                       <TableCell>{nation.boostPerMonthPerCpCost.toFixed(2)}</TableCell>
268:                       <TableCell>{nation.mcPerCpCost.toFixed(2)}</TableCell>
269:                     </TableRow>
270:                   ))}
271:               </TableBody>
272:             </Table>
273:           </AccordionContent>
274:         </AccordionItem>
275:         <AccordionItem value="spoils">
276:           <AccordionTrigger>Spoil targets</AccordionTrigger>
277:           <AccordionContent>
278:             <Table>
279:               <TableHeader>
280:                 <TableRow>
281:                   <TableHead>Nation</TableHead>
282:                   <TableHead>Control Points</TableHead>
283:                   <TableHead>Unrest</TableHead>
284:                   <TableHead>Total Spoils</TableHead>
285:                   <TableHead>Total Spoils Per Point</TableHead>
286:                   <TableHead>Total Spoils Per CP Cost</TableHead>
287:                 </TableRow>
288:               </TableHeader>
289:               <TableBody>
290:                 {nations
291:                   .toSorted((a, b) => (a.totalSpoilsPerCpCost < b.totalSpoilsPerCpCost ? 1 : -1))
292:                   .map((nation) => (
293:                     <TableRow key={nation.id}>
294:                       <TableCell>{nation.displayName}</TableCell>
295:                       <TableCell>
296:                         <NationCPDetails {...{ analysis, nation }} />
297:                       </TableCell>
298:                       <TableCell>{nation.unrest.toFixed(2)}</TableCell>
299:                       <TableCell>
300:                         <span
301:                           title={`${nation.valuePerSpoilsIP.toFixed(1)} per IP * ${nation.investmentPoints.toFixed(
302:                             2
303:                           )} IP`}
304:                         >
305:                           {nation.totalSpoils.toFixed(0)}
306:                         </span>
307:                       </TableCell>
308:                       <TableCell>{nation.totalSpoilsPerControlPoint.toFixed(0)}</TableCell>
309:                       <TableCell>{nation.totalSpoilsPerCpCost.toFixed(2)}</TableCell>
310:                     </TableRow>
311:                   ))}
312:               </TableBody>
313:             </Table>
314:           </AccordionContent>
315:         </AccordionItem>
316:         <AccordionItem value="space">
317:           <AccordionTrigger>MC/Boost targets</AccordionTrigger>
318:           <AccordionContent>
319:             <Table>
320:               <TableHeader>
321:                 <TableRow>
322:                   <TableHead>Nation</TableHead>
323:                   <TableHead>Control Points</TableHead>
324:                   <TableHead>Possible Boost IP Per CP Cost</TableHead>
325:                   <TableHead>Current MC / Boost</TableHead>
326:                   <TableHead>Boost/mo Per CP Cost</TableHead>
327:                   <TableHead>MC Per CP Cost</TableHead>
328:                 </TableRow>
329:               </TableHeader>
330:               <TableBody>
331:                 {nations
332:                   .toSorted((a, b) => {
333:                     if (a.boostPerMonthPerCpCost !== b.boostPerMonthPerCpCost) {
334:                       return b.possibleBoostPerCpCost - a.possibleBoostPerCpCost;
335:                     }
336:                     return a.boostPerMonthPerCpCost < b.boostPerMonthPerCpCost ? 1 : -1;
337:                   })
338:                   .map((nation) => (
339:                     <TableRow key={nation.id}>
340:                       <TableCell>{nation.displayName}</TableCell>
341:                       <TableCell>
342:                         <NationCPDetails {...{ analysis, nation }} />
343:                       </TableCell>
344:                       <TableCell>{nation.possibleBoostPerCpCost.toFixed(2)}</TableCell>
345:                       <TableCell>
346:                         {nation.mc.toFixed(0)} <MissionControl /> / {nation.boostPerMonth.toFixed(2)} <Boost />
347:                       </TableCell>
348:                       <TableCell>{nation.boostPerMonthPerCpCost.toFixed(2)}</TableCell>
349:                       <TableCell>{nation.mcPerCpCost.toFixed(2)}</TableCell>
350:                     </TableRow>
351:                   ))}
352:               </TableBody>
353:             </Table>
354:           </AccordionContent>
355:         </AccordionItem>
356:         <AccordionItem value="nation-claims">
357:           <AccordionTrigger>Nation Claims</AccordionTrigger>
358:           <AccordionContent>
359:             <NationClaimsSection analysis={analysis} />
360:           </AccordionContent>
361:         </AccordionItem>
362:         <AccordionItem value="unification-candidates">
363:           <AccordionTrigger>Unification Candidates ({analysis.unificationCandidates.length})</AccordionTrigger>
364:           <AccordionContent>
365:             <UnificationCandidatesSection analysis={analysis} />
366:           </AccordionContent>
367:         </AccordionItem>
368:       </SmartAccordion>
369: 
370:       <Collapsible>
371:         <CollapsibleTrigger asChild>
372:           <Button variant="outline">Debug Data</Button>
373:         </CollapsibleTrigger>
374:         <CollapsibleContent>
375:           <pre>{JSON.stringify(monthlyTransactionSummary, null, 2)}</pre>
376:           <pre>{JSON.stringify(nations, null, 2)}</pre>
377:         </CollapsibleContent>
378:       </Collapsible>
379:     </div>
380:   );
381: }
382: 
383: const NationCPDetails = ({ analysis, nation }: { nation: Analysis["nations"][0]; analysis: Analysis }) => {
384:   const {
385:     factionsById,
386:     playerFaction: { permaAbandonedNationIds, id: playerFactionId },
387:   } = analysis;
388:   return (
389:     <>
390:       {nation.controlPoints.length
391:         ? nation.controlPoints.map((cp) => {
392:             const faction = factionsById.get(cp.factionId!);
393:             const FactionIcon = faction
394:               ? FactionIcons[faction.templateName as keyof typeof FactionIcons]
395:               : ControlPoint;
396:             return (
397:               <FactionIcon
398:                 key={cp.id}
399:                 className={twMerge(
400:                   cp.benefitsDisabled ? "bg-red-200" : "",
401:                   "p-1 rounded",
402:                   cp.defended ? "bg-green-100" : ""
403:                 )}
404:               />
405:             );
406:           })
407:         : null}{" "}
408:       ({smartRound(nation.totalCpCost)} cost, {smartRound(nation.investmentPoints)} IP)
409:       {(() => {
410:         const earliestCrackdown = sortByDateTime(
411:           nation.controlPoints.filter((cp) => cp.crackdownExpiration),
412:           (cp) => cp.crackdownExpiration!
413:         )[0];
414:         if (earliestCrackdown) {
415:           return (
416:             <span>
417:               {" "}
418:               (expires in{" "}
419:               {toDays(diffDateTime(earliestCrackdown.crackdownExpiration!, analysis.gameCurrentDateTime)).toFixed(0)}
420:               d)
421:             </span>
422:           );
423:         }
424:         return null;
425:       })()}
426:       {nation.controlPoints.some((cp) => cp.benefitsDisabled && cp.factionId == playerFactionId) &&
427:         permaAbandonedNationIds.includes(nation.id) && (
428:           <span title="Perma-abandoned nation">
429:             <Trash2 className="inline-block h-4 w-4 stroke-destructive -mt-1 mx-1" />
430:           </span>
431:         )}
432:     </>
433:   );
434: };
435: 
436: const RELATIONSHIP_LABELS: Record<string, string> = {
437:   war: "War",
438:   federation: "Federation",
439:   ally: "Ally",
440:   neutral: "Neutral",
441:   rival: "Rival",
442: };
443: 
444: const RELATIONSHIP_COLORS: Record<string, string> = {
445:   war: "text-red-600 font-bold",
446:   federation: "text-blue-700 font-medium",
447:   ally: "text-green-700 font-medium",
448:   neutral: "",
449:   rival: "text-red-700 font-medium",
450: };
451: 
452: function ClaimCoverageCell({ coverage }: { coverage: ClaimCoverage }) {
453:   if (coverage.totalRegions === 0) return <span className="text-muted-foreground">N/A</span>;
454:   const allCovered = coverage.missing === 0;
455:   if (allCovered && coverage.hostile === 0) {
456:     return (
457:       <span className="text-green-600 font-medium" title="All regions covered, all non-hostile">
458:         ✓ all
459:       </span>
460:     );
461:   }
462:   if (allCovered) {
463:     return (
464:       <span className="text-amber-600 font-medium" title={`All regions covered, but ${coverage.hostile} hostile`}>
465:         ✓ all <span className="text-red-500 text-xs">({coverage.hostile}⚔)</span>
466:       </span>
467:     );
468:   }
469:   const missingLabel = `${coverage.missing} of ${coverage.totalRegions} missing`;
470:   const hostileNote = coverage.hostile > 0 ? `, ${coverage.hostile}⚔` : "";
471:   return (
472:     <span className="text-red-600 text-xs font-medium" title={missingLabel + hostileNote}>
473:       −{coverage.missing}/{coverage.totalRegions}
474:       {coverage.hostile > 0 && <span className="text-red-500"> ({coverage.hostile}⚔)</span>}
475:     </span>
476:   );
477: }
478: 
479: function NationClaimsSection({ analysis }: { analysis: Analysis }) {
480:   const { nationClaims } = analysis;
481: 
482:   if (nationClaims.length === 0) {
483:     return <p className="text-sm text-muted-foreground">No claims found on nations you control.</p>;
484:   }
485: 
486:   return (
487:     <SmartAccordion type="multiple" storageKey="nation-claims-accordion">
488:       {nationClaims.map((entry) => (
489:         <AccordionItem key={entry.nationId} value={String(entry.nationId)}>
490:           <AccordionTrigger>
491:             {entry.nationName}{" "}
492:             <span className="text-xs text-muted-foreground ml-1">({entry.targets.length} claim targets)</span>
493:           </AccordionTrigger>
494:           <AccordionContent>
495:             <Table>
496:               <TableHeader>
497:                 <TableRow>
498:                   <TableHead>Target Nation</TableHead>
499:                   <TableHead>Relationship</TableHead>
500:                   <TableHead title="Earliest date relations can improve (cooldown active if shown)">Relations After</TableHead>
501:                   <TableHead title="Earliest date war/rivalry action available (cooldown active if shown)">War After</TableHead>
502:                   <TableHead title="Faction controlling the Executive control point">Executive Faction</TableHead>
503:                   <TableHead title="Other player-controlled nations with a capital claim on this nation">Co-claimants</TableHead>
504:                   <TableHead title="Whether this nation has claims on ALL of the target's current regions">All Current?</TableHead>
505:                   <TableHead title="Whether this nation also has claims on all regions the target claims from other nations">All Claimed?</TableHead>
506:                 </TableRow>
507:               </TableHeader>
508:               <TableBody>
509:                 {entry.targets.map((target) => {
510:                   const FactionIcon = target.executiveFactionTemplateName
511:                     ? FactionIcons[target.executiveFactionTemplateName as keyof typeof FactionIcons]
512:                     : null;
513:                   return (
514:                     <TableRow key={target.targetNationId}>
515:                       <TableCell>
516:                         {target.targetNationName}
517:                         {target.isCapitalClaim && (
518:                           <span
519:                             className={`ml-1 text-xs font-medium ${target.isCapitalClaimHostile ? "text-red-600" : "text-amber-700"}`}
520:                             title={target.isCapitalClaimHostile ? "Hostile claim on capital region" : "Non-hostile claim on capital region"}
521:                           >
522:                             {target.isCapitalClaimHostile ? "⚔ capital" : "★ capital"}
523:                           </span>
524:                         )}
525:                         {(() => {
526:                           const gap = target.governmentGap;
527:                           const isWarning = gap > 1.5;
528:                           const sign = gap > 0 ? "+" : "";
529:                           return (
530:                             <span
531:                               className={`ml-1 text-xs font-medium ${isWarning ? "text-orange-600" : "text-green-600"}`}
532:                               title={`Government score difference (target − claimant): ${sign}${gap}`}
533:                             >
534:                               {isWarning ? "⚠" : ""} gov {sign}{gap}
535:                             </span>
536:                           );
537:                         })()}
538:                       </TableCell>
539:                       <TableCell className={RELATIONSHIP_COLORS[target.relationship]}>
540:                         {RELATIONSHIP_LABELS[target.relationship]}
541:                       </TableCell>
542:                       <TableCell className="text-sm">
543:                         {target.relationsCanImproveAfter ?? <span className="text-muted-foreground">–</span>}
544:                       </TableCell>
545:                       <TableCell className="text-sm">
546:                         {target.warActionAfter ?? <span className="text-muted-foreground">–</span>}
547:                       </TableCell>
548:                       <TableCell className="flex items-center gap-1">
549:                         {FactionIcon && <FactionIcon className="p-1 rounded" />}
550:                         {target.executiveFactionName ?? <span className="text-muted-foreground">Uncontrolled</span>}
551:                       </TableCell>
552:                       <TableCell className="text-sm">
553:                         {target.otherPlayerCapitalClaimants.length > 0
554:                           ? target.otherPlayerCapitalClaimants.map((c) => c.nationName).join(", ")
555:                           : <span className="text-muted-foreground">–</span>}
556:                       </TableCell>
557:                       <TableCell className="text-sm">
558:                         <ClaimCoverageCell coverage={target.currentRegionCoverage} />
559:                       </TableCell>
560:                       <TableCell className="text-sm">
561:                         <ClaimCoverageCell coverage={target.targetClaimCoverage} />
562:                       </TableCell>
563:                     </TableRow>
564:                   );
565:                 })}
566:               </TableBody>
567:             </Table>
568:           </AccordionContent>
569:         </AccordionItem>
570:       ))}
571:     </SmartAccordion>
572:   );
573: }
574: 
575: function UnificationCandidatesSection({ analysis }: { analysis: Analysis }) {
576:   const { unificationCandidates } = analysis;
577: 
578:   if (unificationCandidates.length === 0) {
579:     return <div className="p-4 text-muted-foreground">No unification candidates found.</div>;
580:   }
581: 
582:   return (
583:     <Table>
584:       <TableHeader>
585:         <TableRow>
586:           <TableHead title="Nation that has the capital claim">Claimant Nation</TableHead>
587:           <TableHead title="Nation whose capital is claimed">Target Nation</TableHead>
588:           <TableHead>Claim Type</TableHead>
589:           <TableHead>Relationship</TableHead>
590:           <TableHead title="Earliest date relations can improve (cooldown active if shown)">Relations After</TableHead>
591:           <TableHead title="Government scores: claimant / target (red if claimant is more than 1.5 below target)">Gov Scores</TableHead>
592:         </TableRow>
593:       </TableHeader>
594:       <TableBody>
595:         {unificationCandidates.map((candidate) => {
596:           const govGap = candidate.targetDemocracy - candidate.claimantDemocracy;
597:           const govWarning = govGap > 1.5;
598:           return (
599:           <TableRow key={`${candidate.claimantNationId}:${candidate.targetNationId}`}>
600:             <TableCell className="font-medium">{candidate.claimantNationName}</TableCell>
601:             <TableCell>{candidate.targetNationName}</TableCell>
602:             <TableCell>
603:               {candidate.isHostileClaim ? (
604:                 <span className="text-red-600 font-medium text-xs">⚔ hostile</span>
605:               ) : (
606:                 <span className="text-amber-700 font-medium text-xs">★ non-hostile</span>
607:               )}
608:             </TableCell>
609:             <TableCell className={RELATIONSHIP_COLORS[candidate.relationship]}>
610:               {RELATIONSHIP_LABELS[candidate.relationship]}
611:             </TableCell>
612:             <TableCell className="text-sm">
613:               {candidate.relationsCanImproveAfter ?? <span className="text-muted-foreground">–</span>}
614:             </TableCell>
615:             <TableCell className="text-sm">
616:               <span className={govWarning ? "text-red-600 font-medium" : ""}>
617:                 {candidate.claimantDemocracy}
618:               </span>
619:               {" / "}
620:               <span>{candidate.targetDemocracy}</span>
621:             </TableCell>
622:           </TableRow>
623:           );
624:         })}
625:       </TableBody>
626:     </Table>
627:   );
628: }

(End of file - total 628 lines)
</content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "terra-invicta-assistant\\src\\app\\game\\current\\drives.tsx"
}
```

**Output:**
```
<path>terra-invicta-assistant\src\app\game\current\drives.tsx</path>
<type>file</type>
<content>
1: import { Analysis } from "@/lib/analysis";
2: import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
3: import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
4: import { ShowEffects } from "@/components/showEffects";
5: import { useState, useMemo } from "react";
6: import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
7: import { smartRound, formatPercent, addMaterials } from "@/lib/utils";
8: import { ResearchLink } from "./researchLink";
9: import { useTechnologyGoals } from "./technologyGoals";
10: import { Button } from "@/components/ui/button";
11: import { Water, Volatiles, Metals, Nobles, Fissiles, Antimatter } from "@/components/icons";
12: import { Input } from "@/components/ui/input";
13: import { Label } from "@/components/ui/label";
14: import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
15: import { SmartAccordion } from "@/components/ui/smart-accordion";
16: import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
17: import { Materials } from "@/lib/templates";
18: import { twMerge } from "tailwind-merge";
19: 
20: type SortColumn =
21:   | "friendlyName"
22:   | "thrust_N"
23:   | "EV_kps"
24:   | "efficiency"
25:   | "cooling"
26:   | "powerRequiredGW"
27:   | "reactorAndRadiatorTons"
28:   | "thrustRating"
29:   | "exhaustRating"
30:   | "overallRating"
31:   | "unlockChance"
32:   | "tanksAffordable"
33:   | "techResearchRemaining"
34:   | "projectResearchRemaining"
35:   | "shipDeltaV"
36:   | "accelerationMilliGs"
37:   | "tripTime";
38: type SortDirection = "asc" | "desc";
39: 
40: function DrivesTable({ analysis }: { analysis: Analysis }) {
41:   const [sortColumn, setSortColumn] = useState<SortColumn>("friendlyName");
42:   const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
43:   const { goals, addGoal, removeGoal } = useTechnologyGoals(analysis);
44: 
45:   const handleSort = (column: SortColumn) => {
46:     if (sortColumn === column) {
47:       setSortDirection(sortDirection === "asc" ? "desc" : "asc");
48:     } else {
49:       setSortColumn(column);
50:       setSortDirection("asc");
51:     }
52:   };
53: 
54:   const drives = analysis.drives.toSorted((a, b) => {
55:     // First, check if drives are in goals
56:     const aInGoals = goals.some((g) => g.name === a.requiredProjectName);
57:     const bInGoals = goals.some((g) => g.name === b.requiredProjectName);
58: 
59:     // Goals always come first
60:     if (aInGoals !== bInGoals) {
61:       return aInGoals ? -1 : 1;
62:     }
63: 
64:     // Within same goal status, apply normal sort
65:     let compareValue = 0;
66: 
67:     switch (sortColumn) {
68:       case "friendlyName":
69:         compareValue = a.friendlyName.localeCompare(b.friendlyName);
70:         break;
71:       case "thrust_N":
72:         compareValue = a.thrust_N - b.thrust_N;
73:         break;
74:       case "EV_kps":
75:         compareValue = a.EV_kps - b.EV_kps;
76:         break;
77:       case "efficiency":
78:         compareValue = a.efficiency - b.efficiency;
79:         break;
80:       case "cooling":
81:         compareValue = a.cooling.localeCompare(b.cooling);
82:         break;
83:       case "powerRequiredGW":
84:         compareValue = a.powerRequiredGW - b.powerRequiredGW;
85:         break;
86:       case "reactorAndRadiatorTons":
87:         compareValue = (a.reactorAndRadiatorTons ?? Infinity) - (b.reactorAndRadiatorTons ?? Infinity);
88:         break;
89:       case "thrustRating":
90:         compareValue = a.thrustRating - b.thrustRating;
91:         break;
92:       case "exhaustRating":
93:         compareValue = a.exhaustRating - b.exhaustRating;
94:         break;
95:       case "overallRating":
96:         compareValue = a.overallRating - b.overallRating;
97:         break;
98:       case "unlockChance":
99:         compareValue = (a.unlockChance ?? 100) - (b.unlockChance ?? 100);
100:         break;
101:       case "tanksAffordable":
102:         compareValue = a.tanksAffordable - b.tanksAffordable;
103:         break;
104:       case "techResearchRemaining":
105:         compareValue = a.techResearchRemaining - b.techResearchRemaining;
106:         break;
107:       case "projectResearchRemaining":
108:         compareValue = a.projectResearchRemaining - b.projectResearchRemaining;
109:         break;
110:       case "shipDeltaV":
111:         compareValue = a.shipDeltaV - b.shipDeltaV;
112:         break;
113:       case "accelerationMilliGs":
114:         compareValue = a.accelerationMilliGs - b.accelerationMilliGs;
115:         break;
116:       case "tripTime":
117:         compareValue = a.tripTime - b.tripTime;
118:         break;
119:     }
120: 
121:     return sortDirection === "asc" ? compareValue : -compareValue;
122:   });
123: 
124:   const SortIcon = ({ column }: { column: SortColumn }) => {
125:     if (sortColumn !== column) return null;
126:     return sortDirection === "asc" ? (
127:       <ChevronUp className="inline h-4 w-4" />
128:     ) : (
129:       <ChevronDown className="inline h-4 w-4" />
130:     );
131:   };
132: 
133:   return (
134:     <div className="space-y-4">
135:       <div>
136:         {analysis.bestRadiator && (
137:           <p className="text-sm text-muted-foreground">
138:             Best available radiator: <span className="font-medium">{analysis.bestRadiator.friendlyName}</span> (
139:             {smartRound(1 / analysis.bestRadiator.gwPerTon)} ton/GW)
140:           </p>
141:         )}
142:         {!analysis.bestRadiator && <p className="text-sm text-muted-foreground">No radiators available yet</p>}
143:       </div>
144:       <Table>
145:         <TableHeader>
146:           <TableRow>
147:             <TableHead></TableHead>
148:             <TableHead colSpan={16}></TableHead>
149:             <TableHead
150:               colSpan={4}
151:               className="text-center border-l-2 whitespace-normal"
152:               title="10k tons dry + radiator + 50 fuel tanks"
153:             >
154:               Hypothetical Ship
155:             </TableHead>
156:           </TableRow>
157:           <TableRow>
158:             <TableHead title="Add/Remove Technology Goal">Goal</TableHead>
159:             <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("friendlyName")}>
160:               Drive Name <SortIcon column="friendlyName" />
161:             </TableHead>
162:             <TableHead
163:               className="text-right cursor-pointer hover:bg-muted/50"
164:               onClick={() => handleSort("thrust_N")}
165:               title="Thrust (kilonewtons)"
166:             >
167:               Thrust <SortIcon column="thrust_N" />
168:             </TableHead>
169:             <TableHead
170:               className="text-right cursor-pointer hover:bg-muted/50"
171:               onClick={() => handleSort("EV_kps")}
172:               title="Exhaust Velocity (km/s)"
173:             >
174:               EV <SortIcon column="EV_kps" />
175:             </TableHead>
176:             <TableHead
177:               className="text-right cursor-pointer hover:bg-muted/50"
178:               onClick={() => handleSort("efficiency")}
179:               title="Efficiency (%)"
180:             >
181:               Efficiency <SortIcon column="efficiency" />
182:             </TableHead>
183:             <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("cooling")}>
184:               Cooling <SortIcon column="cooling" />
185:             </TableHead>
186:             <TableHead>Propellant</TableHead>
187:             <TableHead title="Required Power Plant">Power Plant</TableHead>
188:             <TableHead
189:               className="text-right cursor-pointer hover:bg-muted/50"
190:               onClick={() => handleSort("powerRequiredGW")}
191:               title="Power Required (GW)"
192:             >
193:               Power <SortIcon column="powerRequiredGW" />
194:             </TableHead>
195:             <TableHead
196:               className="text-right cursor-pointer hover:bg-muted/50"
197:               onClick={() => handleSort("reactorAndRadiatorTons")}
198:               title="Reactor + Radiator Mass (tons)"
199:             >
200:               Reactor+Rad <SortIcon column="reactorAndRadiatorTons" />
201:             </TableHead>
202:             <TableHead
203:               className="text-right cursor-pointer hover:bg-muted/50"
204:               onClick={() => handleSort("thrustRating")}
205:               title="Thrust Rating"
206:             >
207:               Thrust <SortIcon column="thrustRating" />
208:             </TableHead>
209:             <TableHead
210:               className="text-right cursor-pointer hover:bg-muted/50"
211:               onClick={() => handleSort("exhaustRating")}
212:               title="Exhaust Rating"
213:             >
214:               Exhaust <SortIcon column="exhaustRating" />
215:             </TableHead>
216:             <TableHead
217:               className="text-right cursor-pointer hover:bg-muted/50"
218:               onClick={() => handleSort("overallRating")}
219:               title="Overall Rating"
220:             >
221:               Overall <SortIcon column="overallRating" />
222:             </TableHead>
223:             <TableHead
224:               className="text-right cursor-pointer hover:bg-muted/50"
225:               onClick={() => handleSort("unlockChance")}
226:               title="Base Unlock Chance (%)"
227:             >
228:               Unlock <SortIcon column="unlockChance" />
229:             </TableHead>
230:             <TableHead
231:               className="text-right cursor-pointer hover:bg-muted/50"
232:               onClick={() => handleSort("tanksAffordable")}
233:               title="Fuel tanks affordable with current resources"
234:             >
235:               Tanks <SortIcon column="tanksAffordable" />
236:             </TableHead>
237:             <TableHead
238:               className="text-right cursor-pointer hover:bg-muted/50"
239:               onClick={() => handleSort("techResearchRemaining")}
240:               title="Tech Research Remaining (thousands)"
241:             >
242:               Tech Res <SortIcon column="techResearchRemaining" />
243:             </TableHead>
244:             <TableHead
245:               className="text-right cursor-pointer hover:bg-muted/50"
246:               onClick={() => handleSort("projectResearchRemaining")}
247:               title="Project Research Remaining (thousands)"
248:             >
249:               Proj Res <SortIcon column="projectResearchRemaining" />
250:             </TableHead>
251:             <TableHead
252:               className="text-right cursor-pointer hover:bg-muted/50 border-l-2"
253:               onClick={() => handleSort("shipDeltaV")}
254:               title="Ship Delta-V (km/s, 10k tons + radiator + 50 fuel tanks)"
255:             >
256:               ΔV <SortIcon column="shipDeltaV" />
257:             </TableHead>
258:             <TableHead
259:               className="text-right cursor-pointer hover:bg-muted/50"
260:               onClick={() => handleSort("accelerationMilliGs")}
261:               title="Ship acceleration (milli-gs, at full fuel)"
262:             >
263:               Accel <SortIcon column="accelerationMilliGs" />
264:             </TableHead>
265:             <TableHead
266:               className="text-right cursor-pointer hover:bg-muted/50"
267:               onClick={() => handleSort("tripTime")}
268:               title="Time to travel 5 AU (days)"
269:             >
270:               5AU d <SortIcon column="tripTime" />
271:             </TableHead>
272:             <TableHead className="text-right" title="Final Delta-V after 5 AU trip (km/s)">
273:               F dV
274:             </TableHead>
275:           </TableRow>
276:         </TableHeader>
277:         <TableBody>
278:           {drives.map((drive) => {
279:             const isUnlocked = analysis.playerFaction.finishedProjectNames.includes(drive.requiredProjectName);
280: 
281:             // Propellant values are already multiplied by 10 in the analysis
282:             const propellantEffects = {
283:               water: drive.propellantMaterials.water,
284:               volatiles: drive.propellantMaterials.volatiles,
285:               metals: drive.propellantMaterials.metals,
286:               nobles: drive.propellantMaterials.nobleMetals,
287:               fissiles: drive.propellantMaterials.fissiles,
288:               antimatter: drive.propellantMaterials.antimatter,
289:             };
290: 
291:             // Check if this project is in the goals list
292:             const isComplete = isUnlocked;
293:             const goalForThisDrive = goals.find((g) => g.name === drive.requiredProjectName);
294:             const isInGoals = !!goalForThisDrive;
295: 
296:             // Determine row background based on goal status or tanks affordable
297:             const rowClassName = isInGoals
298:               ? "bg-green-50"
299:               : drive.tanksAffordable < 10
300:                 ? "bg-red-50"
301:                 : drive.tanksAffordable < 100
302:                   ? "bg-orange-50"
303:                   : drive.tanksAffordable < 500
304:                     ? "bg-yellow-50"
305:                     : "";
306: 
307:             return (
308:               <TableRow key={drive.dataName} className={rowClassName}>
309:                 <TableCell className="text-center">
310:                   {!isComplete && isInGoals && (
311:                     <Button
312:                       variant="outline"
313:                       size="sm"
314:                       onClick={() => removeGoal(goalForThisDrive.id)}
315:                       className="h-8 w-8 p-0 bg-white"
316:                       title="Remove from goals"
317:                     >
318:                       <Trash2 className="h-4 w-4" />
319:                     </Button>
320:                   )}
321:                   {!isComplete && !isInGoals && (
322:                     <Button
323:                       variant="outline"
324:                       size="sm"
325:                       onClick={() => addGoal("project", drive.requiredProjectName)}
326:                       className="h-8 w-8 p-0 bg-white"
327:                       title="Add to goals"
328:                     >
329:                       <Plus className="h-4 w-4" />
330:                     </Button>
331:                   )}
332:                 </TableCell>
333:                 <TableCell className="font-medium">
334:                   <ResearchLink name={drive.requiredProjectName} displayName={drive.friendlyName} />
335:                 </TableCell>
336:                 <TableCell className="text-right" title={`${(drive.thrust_N / 1000).toFixed(1)} kN`}>
337:                   {Math.round(drive.thrust_N / 1000)}
338:                 </TableCell>
339:                 <TableCell className="text-right" title={`${drive.EV_kps.toFixed(1)} km/s`}>
340:                   {Math.round(drive.EV_kps)}
341:                 </TableCell>
342:                 <TableCell className="text-right">{formatPercent(drive.efficiency * 100)}</TableCell>
343:                 <TableCell title={drive.propellant}>{drive.cooling || "None"}</TableCell>
344:                 <TableCell className="text-xs">
345:                   <ShowEffects {...propellantEffects} />
346:                 </TableCell>
347:                 <TableCell className="text-xs">{drive.requiredPowerPlantDisplayName || "None"}</TableCell>
348:                 <TableCell
349:                   className="text-right"
350:                   title={
351:                     !isNaN(drive.powerRequiredGW)
352:                       ? [
353:                           `Thrust Rating: ${smartRound(drive.thrustRating_GW)} GW`,
354:                           `Required Power (accounts for efficiency): ${smartRound(drive.reqPower_GW)} GW`,
355:                           `Drive Efficiency: ${formatPercent(drive.efficiency * 100)}`,
356:                           drive.thrusters > 1 ? `Number of Thrusters: ${drive.thrusters}` : null,
357:                           drive.reactorEfficiency !== undefined
358:                             ? `\nReactor Efficiency: ${formatPercent(drive.reactorEfficiency * 100)}`
359:                             : null,
360:                           drive.wasteHeatGW !== undefined
361:                             ? `Waste Heat: ${smartRound(drive.powerRequiredGW)} GW × ${formatPercent((1 - (drive.reactorEfficiency || 0)) * 100)} = ${smartRound(drive.wasteHeatGW)} GW`
362:                             : null,
363:                         ]
364:                           .filter(Boolean)
365:                           .join("\n")
366:                       : undefined
367:                   }
368:                 >
369:                   {!isNaN(drive.powerRequiredGW) ? smartRound(drive.powerRequiredGW) : "-"}
370:                 </TableCell>
371:                 <TableCell className="text-right">
372:                   {drive.reactorAndRadiatorTons !== undefined ? (
373:                     <TooltipProvider>
374:                       <Tooltip>
375:                         <TooltipTrigger asChild>
376:                           <span className="cursor-help">{smartRound(drive.reactorAndRadiatorTons)}</span>
377:                         </TooltipTrigger>
378:                         <TooltipContent>
379:                           <div className="space-y-2">
380:                             {drive.reactorName && (
381:                               <div>
382:                                 <div className="font-semibold mb-1">Reactor: {drive.reactorName}</div>
383:                                 <div className="ml-2 text-xs space-y-1">
384:                                   {drive.reactorGW !== undefined && (
385:                                     <div>Power Output: {smartRound(drive.reactorGW)} GW</div>
386:                                   )}
387:                                   {drive.reactorTonsPerGW !== undefined && (
388:                                     <div>Specific Power: {smartRound(drive.reactorTonsPerGW)} t/GW</div>
389:                                   )}
390:                                   {drive.reactorTons !== undefined && (
391:                                     <div>Mass: {smartRound(drive.reactorTons)} tons</div>
392:                                   )}
393:                                   {drive.reactorResources !== undefined && (
394:                                     <div>Resources: {smartRound(drive.reactorResources)}</div>
395:                                   )}
396:                                   {drive.reactorMaterials && (
397:                                     <div className="flex items-center gap-1">
398:                                       <ShowEffects
399:                                         water={drive.reactorMaterials.water || undefined}
400:                                         volatiles={drive.reactorMaterials.volatiles || undefined}
401:                                         metals={drive.reactorMaterials.metals || undefined}
402:                                         nobles={drive.reactorMaterials.nobleMetals || undefined}
403:                                       />
404:                                     </div>
405:                                   )}
406:                                 </div>
407:                               </div>
408:                             )}
409:                             {drive.radiatorName && (
410:                               <div>
411:                                 <div className="font-semibold mb-1">Radiator: {drive.radiatorName}</div>
412:                                 <div className="ml-2 text-xs space-y-1">
413:                                   {drive.wasteHeatGW !== undefined && (
414:                                     <div>Waste Heat: {smartRound(drive.wasteHeatGW)} GW</div>
415:                                   )}
416:                                   {drive.radiatorGWperTon !== undefined && (
417:                                     <div>Cooling: {smartRound(drive.radiatorGWperTon)} GW/t</div>
418:                                   )}
419:                                   {drive.radiatorTons !== undefined && (
420:                                     <div>Mass: {smartRound(drive.radiatorTons)} tons</div>
421:                                   )}
422:                                   {drive.radiatorResources !== undefined && (
423:                                     <div>Resources: {smartRound(drive.radiatorResources)}</div>
424:                                   )}
425:                                   {drive.radiatorMaterials && (
426:                                     <div className="flex items-center gap-1">
427:                                       <ShowEffects
428:                                         volatiles={drive.radiatorMaterials.volatiles || undefined}
429:                                         metals={drive.radiatorMaterials.metals || undefined}
430:                                         nobles={drive.radiatorMaterials.nobleMetals || undefined}
431:                                         exotics={drive.radiatorMaterials.exotics || undefined}
432:                                       />
433:                                     </div>
434:                                   )}
435:                                 </div>
436:                               </div>
437:                             )}
438:                           </div>
439:                         </TooltipContent>
440:                       </Tooltip>
441:                     </TooltipProvider>
442:                   ) : (
443:                     <span title={drive.reactorDebugInfo || "No reactor found"}>-</span>
444:                   )}
445:                 </TableCell>
446:                 <TableCell className="text-right">{drive.thrustRating.toFixed(2)}</TableCell>
447:                 <TableCell className="text-right">{drive.exhaustRating.toFixed(2)}</TableCell>
448:                 <TableCell className="text-right">{drive.overallRating.toFixed(2)}</TableCell>
449:                 <TableCell className="text-right">
450:                   {drive.unlockChance !== undefined ? `${drive.unlockChance}%` : ""}
451:                 </TableCell>
452:                 <TableCell className="text-right">
453:                   {drive.tanksAffordable}{" "}
454:                   {drive.limitingResourceName &&
455:                     (() => {
456:                       const ResourceIcon = {
457:                         Water,
458:                         Volatiles,
459:                         Metals,
460:                         NobleMetals: Nobles,
461:                         Fissiles,
462:                         Antimatter,
463:                       }[drive.limitingResourceName];
464:                       return ResourceIcon ? <ResourceIcon /> : null;
465:                     })()}
466:                 </TableCell>
467:                 <TableCell
468:                   className="text-right"
469:                   title={
470:                     drive.requiredTechs.length > 0
471:                       ? drive.requiredTechs
472:                           .map((name: string) => analysis.techs.get(name)?.displayName || name)
473:                           .join("\n")
474:                       : undefined
475:                   }
476:                 >
477:                   {drive.techResearchRemaining > 0 ? smartRound(drive.techResearchRemaining / 1000) : "-"}
478:                 </TableCell>
479:                 <TableCell
480:                   className="text-right"
481:                   title={
482:                     drive.requiredProjects.length > 0
483:                       ? drive.requiredProjects
484:                           .map((name: string) => analysis.projects.get(name)?.displayName || name)
485:                           .join("\n")
486:                       : undefined
487:                   }
488:                 >
489:                   {drive.projectResearchRemaining > 0 ? smartRound(drive.projectResearchRemaining / 1000) : "-"}
490:                 </TableCell>
491:                 <TableCell className="text-right">{smartRound(drive.shipDeltaV / 1000)}</TableCell>
492:                 <TableCell className="text-right">{smartRound(drive.accelerationMilliGs)}</TableCell>
493:                 <TableCell className="text-right" title={drive.tripType}>
494:                   {smartRound(drive.tripTime / 86400)}
495:                 </TableCell>
496:                 <TableCell className="text-right">
497:                   {drive.remainingDeltaV > 0 ? smartRound(drive.remainingDeltaV / 1000) : "-"}
498:                 </TableCell>
499:               </TableRow>
500:             );
501:           })}
502:         </TableBody>
503:       </Table>
504:     </div>
505:   );
506: }
507: 
508: type CalcSortColumn =
509:   | "driveName"
510:   | "driveEfficiency"
511:   | "reactorEfficiency"
512:   | "tanks"
513:   | "driveMass"
514:   | "fuelMass"
515:   | "reactorMass"
516:   | "radiatorMass"
517:   | "totalTons"
518:   | "totalCost"
519:   | "deltaV"
520:   | "acceleration"
521:   | "travelDays"
522:   | "techResearchRemaining"
523:   | "projectResearchRemaining"
524:   | "unlockChance";
525: 
526: interface CalcParams {
527:   dryMassTons: number;
528:   radiatorDataName: string;
529:   targetDeltaVKps: number;
530:   targetDistanceAU: number;
531: }
532: 
533: function computeCalcRow(
534:   drive: Analysis["drives"][0],
535:   radiator: Analysis["radiators"][0] | undefined,
536:   params: CalcParams,
537: ) {
538:   if (drive.reactorTons === undefined) return null;
539: 
540:   const needsRadiator = drive.cooling === "Calc" || drive.cooling === "Closed";
541:   const radiatorTons = needsRadiator && radiator ? (drive.wasteHeatGW || 0) / radiator.gwPerTon : 0;
542: 
543:   const fixedMassTons = params.dryMassTons + (drive.reactorTons || 0) + radiatorTons;
544: 
545:   const EV_ms = drive.EV_kps * 1000;
546:   const targetDV_ms = params.targetDeltaVKps * 1000;
547:   const massRatio = Math.exp(targetDV_ms / EV_ms);
548:   const requiredFuelMassTons = fixedMassTons * (massRatio - 1);
549:   const requiredTanks = Math.ceil(requiredFuelMassTons / 100);
550:   if (requiredTanks > 1000) return null; // can't reach target deltaV within 1000-tank limit
551:   const tanksNeeded = Math.max(1, requiredTanks);
552: 
553:   const fuelMassTons = tanksNeeded * 100;
554:   const totalMassTons = fixedMassTons + fuelMassTons;
555: 
556:   const actualDeltaVMs = EV_ms * Math.log(totalMassTons / fixedMassTons);
557:   const actualDeltaVKps = actualDeltaVMs / 1000;
558: 
559:   const totalMassKg = totalMassTons * 1000;
560:   const accelerationMs2 = drive.thrust_N / totalMassKg;
561:   const accelerationMilliGs = (accelerationMs2 / 9.81) * 1000;
562: 
563:   const targetDistanceM = params.targetDistanceAU * 149597870700;
564:   const midpointDistance = targetDistanceM / 2;
565:   const avgMassKg = ((totalMassTons + fixedMassTons) / 2) * 1000;
566:   const avgAcceleration = drive.thrust_N / avgMassKg;
567:   const timeToMidpoint = Math.sqrt((2 * midpointDistance) / avgAcceleration);
568:   const velocityAtMidpoint = avgAcceleration * timeToMidpoint;
569:   const deltaVNeeded = 2 * velocityAtMidpoint;
570: 
571:   let travelDays: number;
572:   if (deltaVNeeded <= actualDeltaVMs) {
573:     travelDays = (timeToMidpoint * 2) / 86400;
574:   } else {
575:     const maxVelocity = actualDeltaVMs / 2;
576:     const accelDistance = (maxVelocity * maxVelocity) / (2 * avgAcceleration);
577:     const coastDistance = targetDistanceM - 2 * accelDistance;
578:     const accelTime = maxVelocity / avgAcceleration;
579:     travelDays = coastDistance > 0 ? (2 * accelTime + coastDistance / maxVelocity) / 86400 : (2 * accelTime) / 86400;
580:   }
581: 
582:   // Material costs
583:   const radiatorResources = radiatorTons / 10;
584:   const radiatorCost =
585:     radiator && needsRadiator ? addMaterials(radiator.weightedBuildMaterials, undefined, radiatorResources) : {};
586: 
587:   const fuelCost = addMaterials(drive.propellantMaterials, undefined, tanksNeeded);
588: 
589:   const rc: Materials = drive.reactorMaterials || {};
590:   const driveRes = (drive.flatMass_tons || 0) / 10;
591:   const driveCost = drive.driveBuildMaterials ? addMaterials(drive.driveBuildMaterials, undefined, driveRes) : {};
592: 
593:   const totalCost = addMaterials(rc, addMaterials(radiatorCost, addMaterials(fuelCost, driveCost)));
594: 
595:   const totalCostResources = Object.values(totalCost).reduce((a, b) => a + b, 0);
596:   const hardwareMass = (drive.reactorTons || 0) + radiatorTons + (drive.flatMass_tons || 0);
597:   const totalTons =
598:     params.dryMassTons + (drive.flatMass_tons || 0) + (drive.reactorTons || 0) + radiatorTons + fuelMassTons;
599: 
600:   return {
601:     dataName: drive.dataName,
602:     driveName: drive.friendlyName,
603:     driveEfficiency: drive.efficiency,
604:     propellant: drive.propellant,
605:     reactorEfficiency: drive.reactorEfficiency,
606:     techResearchRemaining: drive.techResearchRemaining,
607:     projectResearchRemaining: drive.projectResearchRemaining,
608:     unlockChance: drive.unlockChance,
609:     requiredTechs: drive.requiredTechs,
610:     requiredProjects: drive.requiredProjects,
611:     reactorName: drive.reactorName,
612:     reactorTonsPerGW: drive.reactorTonsPerGW,
613:     powerRequiredGW: drive.powerRequiredGW,
614:     wasteHeatGW: drive.wasteHeatGW,
615:     radiatorName: needsRadiator && radiator ? radiator.friendlyName : undefined,
616:     radiatorGWperTon: needsRadiator && radiator ? radiator.gwPerTon : undefined,
617:     tanks: tanksNeeded,
618:     hardwareMass,
619:     totalTons,
620:     driveMassTons: drive.flatMass_tons || 0,
621:     fuelMassTons,
622:     reactorMassTons: drive.reactorTons || 0,
623:     radiatorMassTons: radiatorTons,
624:     driveCost,
625:     fuelCost,
626:     reactorCost: rc,
627:     radiatorCost,
628:     totalCost,
629:     totalCostResources,
630:     deltaV: actualDeltaVKps,
631:     acceleration: accelerationMilliGs,
632:     travelDays,
633:     isUnlocked: false, // filled below
634:   };
635: }
636: 
637: function DriveCalculator({ analysis }: { analysis: Analysis }) {
638:   const bestUnlockedRadiator = analysis.radiators
639:     .filter((r) => r.isUnlocked)
640:     .reduce((best, r) => (!best || r.gwPerTon > best.gwPerTon ? r : best), null as Analysis["radiators"][0] | null);
641: 
642:   const [dryMassInput, setDryMassInput] = useState("10000");
643:   const [radiatorDataName, setRadiatorDataName] = useState(bestUnlockedRadiator?.dataName ?? "");
644:   const [targetDeltaVInput, setTargetDeltaVInput] = useState("250");
645:   const [targetDistanceInput, setTargetDistanceInput] = useState("5");
646:   const [params, setParams] = useState<CalcParams>({
647:     dryMassTons: 10000,
648:     radiatorDataName: bestUnlockedRadiator?.dataName ?? "",
649:     targetDeltaVKps: 250,
650:     targetDistanceAU: 5,
651:   });
652:   const [calcSortColumn, setCalcSortColumn] = useState<CalcSortColumn>("driveName");
653:   const [calcSortDirection, setCalcSortDirection] = useState<"asc" | "desc">("asc");
654: 
655:   const unlockedProjectNames = new Set(analysis.playerFaction.finishedProjectNames);
656: 
657:   const handleUpdate = () => {
658:     const dryMass = parseFloat(dryMassInput);
659:     const targetDV = parseFloat(targetDeltaVInput);
660:     const targetDist = parseFloat(targetDistanceInput);
661:     if (!isNaN(dryMass) && !isNaN(targetDV) && !isNaN(targetDist)) {
662:       setParams({ dryMassTons: dryMass, radiatorDataName, targetDeltaVKps: targetDV, targetDistanceAU: targetDist });
663:     }
664:   };
665: 
666:   const selectedRadiator = useMemo(
667:     () => analysis.radiators.find((r) => r.dataName === params.radiatorDataName),
668:     [analysis.radiators, params.radiatorDataName],
669:   );
670: 
671:   const rows = useMemo(() => {
672:     return analysis.drives
673:       .map((drive) => {
674:         const row = computeCalcRow(drive, selectedRadiator, params);
675:         if (!row) return null;
676:         return { ...row, isUnlocked: unlockedProjectNames.has(drive.requiredProjectName) };
677:       })
678:       .filter((r): r is NonNullable<typeof r> => r !== null);
679:     // eslint-disable-next-line react-hooks/exhaustive-deps
680:   }, [analysis.drives, params, selectedRadiator]);
681: 
682:   const handleCalcSort = (col: CalcSortColumn) => {
683:     if (calcSortColumn === col) {
684:       setCalcSortDirection(calcSortDirection === "asc" ? "desc" : "asc");
685:     } else {
686:       setCalcSortColumn(col);
687:       setCalcSortDirection("asc");
688:     }
689:   };
690: 
691:   const sortedRows = useMemo(() => {
692:     return rows.toSorted((a, b) => {
693:       let cmp = 0;
694:       switch (calcSortColumn) {
695:         case "driveName":
696:           cmp = a.driveName.localeCompare(b.driveName);
697:           break;
698:         case "driveEfficiency":
699:           cmp = a.driveEfficiency - b.driveEfficiency;
700:           break;
701:         case "reactorEfficiency":
702:           cmp = (a.reactorEfficiency ?? 0) - (b.reactorEfficiency ?? 0);
703:           break;
704:         case "tanks":
705:           cmp = a.tanks - b.tanks;
706:           break;
707:         case "driveMass":
708:           cmp = a.driveMassTons - b.driveMassTons;
709:           break;
710:         case "fuelMass":
711:           cmp = a.fuelMassTons - b.fuelMassTons;
712:           break;
713:         case "reactorMass":
714:           cmp = a.reactorMassTons - b.reactorMassTons;
715:           break;
716:         case "radiatorMass":
717:           cmp = a.radiatorMassTons - b.radiatorMassTons;
718:           break;
719:         case "totalTons":
720:           cmp = a.totalTons - b.totalTons;
721:           break;
722:         case "totalCost":
723:           cmp = a.totalCostResources - b.totalCostResources;
724:           break;
725:         case "deltaV":
726:           cmp = a.deltaV - b.deltaV;
727:           break;
728:         case "acceleration":
729:           cmp = a.acceleration - b.acceleration;
730:           break;
731:         case "travelDays":
732:           cmp = a.travelDays - b.travelDays;
733:           break;
734:         case "techResearchRemaining":
735:           cmp = a.techResearchRemaining - b.techResearchRemaining;
736:           break;
737:         case "projectResearchRemaining":
738:           cmp = a.projectResearchRemaining - b.projectResearchRemaining;
739:           break;
740:         case "unlockChance":
741:           cmp = (a.unlockChance ?? 100) - (b.unlockChance ?? 100);
742:           break;
743:       }
744:       return calcSortDirection === "asc" ? cmp : -cmp;
745:     });
746:   }, [rows, calcSortColumn, calcSortDirection]);
747: 
748:   const CalcSortIcon = ({ col }: { col: CalcSortColumn }) => {
749:     if (calcSortColumn !== col) return null;
750:     return calcSortDirection === "asc" ? (
751:       <ChevronUp className="inline h-4 w-4" />
752:     ) : (
753:       <ChevronDown className="inline h-4 w-4" />
754:     );
755:   };
756: 
757:   return (
758:     <div className="space-y-4">
759:       <div className="flex flex-wrap gap-4 items-end p-4 bg-muted/30 rounded-lg">
760:         <div className="space-y-1">
761:           <Label htmlFor="calc-dry-mass">Dry Mass (tons)</Label>
762:           <Input
763:             id="calc-dry-mass"
764:             type="number"
765:             className="w-32"
766:             value={dryMassInput}
767:             onChange={(e) => setDryMassInput(e.target.value)}
768:           />
769:         </div>
770:         <div className="space-y-1">
771:           <Label htmlFor="calc-radiator">Radiator</Label>
772:           <Select value={radiatorDataName} onValueChange={setRadiatorDataName}>
773:             <SelectTrigger id="calc-radiator" className="w-56">
774:               <SelectValue placeholder="Select radiator" />
775:             </SelectTrigger>
776:             <SelectContent>
777:               {analysis.radiators
778:                 .filter((r) => !r.dataName.toLowerCase().includes("collector"))
779:                 .toSorted((a, b) => b.gwPerTon - a.gwPerTon)
780:                 .map((r) => (
781:                   <SelectItem key={r.dataName} value={r.dataName}>
782:                     {r.friendlyName}
783:                     {r.isUnlocked ? "" : " 🔒"} ({smartRound(1 / r.gwPerTon)} t/GW)
784:                   </SelectItem>
785:                 ))}
786:             </SelectContent>
787:           </Select>
788:         </div>
789:         <div className="space-y-1">
790:           <Label htmlFor="calc-deltav">Target ΔV (km/s)</Label>
791:           <Input
792:             id="calc-deltav"
793:             type="number"
794:             className="w-28"
795:             value={targetDeltaVInput}
796:             onChange={(e) => setTargetDeltaVInput(e.target.value)}
797:           />
798:         </div>
799:         <div className="space-y-1">
800:           <Label htmlFor="calc-distance">Target Distance (AU)</Label>
801:           <Input
802:             id="calc-distance"
803:             type="number"
804:             className="w-28"
805:             value={targetDistanceInput}
806:             onChange={(e) => setTargetDistanceInput(e.target.value)}
807:           />
808:         </div>
809:         <Button onClick={handleUpdate}>Update</Button>
810:       </div>
811:       <p className="text-xs text-muted-foreground">
812:         Dry mass is hull/payload (drive + reactor + radiator added on top). Tanks clamped to [1, 1000]. 🔒 = locked
813:         radiator.
814:       </p>
815:       <Table>
816:         <TableHeader>
817:           <TableRow>
818:             <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleCalcSort("driveName")}>
819:               Drive <CalcSortIcon col="driveName" />
820:             </TableHead>
821:             <TableHead
822:               className="text-right cursor-pointer hover:bg-muted/50"
823:               onClick={() => handleCalcSort("driveEfficiency")}
824:               title="Drive efficiency"
825:             >
826:               Drive Eff <CalcSortIcon col="driveEfficiency" />
827:             </TableHead>
828:             <TableHead
829:               className="text-right cursor-pointer hover:bg-muted/50"
830:               onClick={() => handleCalcSort("reactorEfficiency")}
831:               title="Reactor efficiency"
832:             >
833:               React Eff <CalcSortIcon col="reactorEfficiency" />
834:             </TableHead>
835:             <TableHead
836:               className="text-right cursor-pointer hover:bg-muted/50"
837:               onClick={() => handleCalcSort("tanks")}
838:               title="Propellant tanks needed"
839:             >
840:               Tanks <CalcSortIcon col="tanks" />
841:             </TableHead>
842:             <TableHead
843:               className="text-right cursor-pointer hover:bg-muted/50"
844:               onClick={() => handleCalcSort("driveMass")}
845:               title="Drive hardware mass (tons)"
846:             >
847:               Drive t <CalcSortIcon col="driveMass" />
848:             </TableHead>
849:             <TableHead
850:               className="text-right cursor-pointer hover:bg-muted/50"
851:               onClick={() => handleCalcSort("fuelMass")}
852:               title="Fuel/propellant mass (tons)"
853:             >
854:               Fuel t <CalcSortIcon col="fuelMass" />
855:             </TableHead>
856:             <TableHead
857:               className="text-right cursor-pointer hover:bg-muted/50"
858:               onClick={() => handleCalcSort("reactorMass")}
859:               title="Reactor mass (tons)"
860:             >
861:               Reactor t <CalcSortIcon col="reactorMass" />
862:             </TableHead>
863:             <TableHead
864:               className="text-right cursor-pointer hover:bg-muted/50"
865:               onClick={() => handleCalcSort("radiatorMass")}
866:               title="Radiator mass (tons)"
867:             >
868:               Radiator t <CalcSortIcon col="radiatorMass" />
869:             </TableHead>
870:             <TableHead
871:               className="text-right cursor-pointer hover:bg-muted/50"
872:               onClick={() => handleCalcSort("totalTons")}
873:               title="Total ship mass: dry + drive + reactor + radiator + fuel (tons)"
874:             >
875:               Total t <CalcSortIcon col="totalTons" />
876:             </TableHead>
877:             <TableHead
878:               className="cursor-pointer hover:bg-muted/50"
879:               onClick={() => handleCalcSort("totalCost")}
880:               title="Total material cost (sortable by total resources)"
881:             >
882:               Total Cost <CalcSortIcon col="totalCost" />
883:             </TableHead>
884:             <TableHead
885:               className="text-right cursor-pointer hover:bg-muted/50"
886:               onClick={() => handleCalcSort("deltaV")}
887:               title="Actual delta-V achieved (km/s)"
888:             >
889:               ΔV (km/s) <CalcSortIcon col="deltaV" />
890:             </TableHead>
891:             <TableHead
892:               className="text-right cursor-pointer hover:bg-muted/50"
893:               onClick={() => handleCalcSort("acceleration")}
894:               title="Acceleration at full fuel (milli-g)"
895:             >
896:               Accel (mg) <CalcSortIcon col="acceleration" />
897:             </TableHead>
898:             <TableHead
899:               className="text-right cursor-pointer hover:bg-muted/50"
900:               onClick={() => handleCalcSort("travelDays")}
901:               title={`Days to travel ${params.targetDistanceAU} AU`}
902:             >
903:               Travel Days <CalcSortIcon col="travelDays" />
904:             </TableHead>
905:             <TableHead
906:               className="text-right cursor-pointer hover:bg-muted/50"
907:               onClick={() => handleCalcSort("unlockChance")}
908:               title="Base Unlock Chance (%)"
909:             >
910:               Unlock <CalcSortIcon col="unlockChance" />
911:             </TableHead>
912:             <TableHead
913:               className="text-right cursor-pointer hover:bg-muted/50"
914:               onClick={() => handleCalcSort("techResearchRemaining")}
915:               title="Tech Research Remaining (thousands)"
916:             >
917:               Tech Res <CalcSortIcon col="techResearchRemaining" />
918:             </TableHead>
919:             <TableHead
920:               className="text-right cursor-pointer hover:bg-muted/50"
921:               onClick={() => handleCalcSort("projectResearchRemaining")}
922:               title="Project Research Remaining (thousands)"
923:             >
924:               Proj Res <CalcSortIcon col="projectResearchRemaining" />
925:             </TableHead>
926:           </TableRow>
927:         </TableHeader>
928:         <TableBody>
929:           {sortedRows.map((row) => (
930:             <TableRow key={row.dataName} className={row.isUnlocked ? "" : "opacity-60"}>
931:               <TableCell className="font-medium">
932:                 {row.driveName}
933:                 {!row.isUnlocked && <span className="ml-1 text-muted-foreground text-xs">(locked)</span>}
934:                 {row.reactorName && <div className="text-xs text-muted-foreground">{row.reactorName}</div>}
935:               </TableCell>
936:               <TableCell className="text-right">{formatPercent(row.driveEfficiency * 100)}</TableCell>
937:               <TableCell className="text-right">
938:                 {row.reactorEfficiency !== undefined ? formatPercent(row.reactorEfficiency * 100) : "-"}
939:               </TableCell>
940:               <TableCell className="text-right">{row.tanks}</TableCell>
941:               <TooltipProvider>
942:                 <Tooltip>
943:                   <TooltipTrigger asChild>
944:                     <TableCell className="text-right cursor-help">
945:                       {row.driveMassTons > 0 ? smartRound(row.driveMassTons) : "-"}
946:                     </TableCell>
947:                   </TooltipTrigger>
948:                   <TooltipContent>
949:                     <div className="text-xs font-semibold mb-1">Drive materials</div>
950:                     <ShowEffects {...row.driveCost} />
951:                   </TooltipContent>
952:                 </Tooltip>
953:               </TooltipProvider>
954:               <TooltipProvider>
955:                 <Tooltip>
956:                   <TooltipTrigger asChild>
957:                     <TableCell className="text-right cursor-help">
958:                       <span
959:                         className={twMerge(
960:                           row.propellant === "Hydrogen" && "bg-blue-100 py-0.5 px-1 -mx-1 rounded",
961:                           row.propellant === "NobleGases" && "bg-green-100 py-0.5 px-1 -mx-1 rounded",
962:                         )}
963:                       >
964:                         {smartRound(row.fuelMassTons)}
965:                       </span>
966:                     </TableCell>
967:                   </TooltipTrigger>
968:                   <TooltipContent>
969:                     <div className="text-xs font-semibold mb-1">
970:                       Fuel materials ({row.tanks} tanks, {row.propellant})
971:                     </div>
972:                     <ShowEffects {...row.fuelCost} />
973:                   </TooltipContent>
974:                 </Tooltip>
975:               </TooltipProvider>
976:               <TooltipProvider>
977:                 <Tooltip>
978:                   <TooltipTrigger asChild>
979:                     <TableCell className="text-right cursor-help">
980:                       {row.reactorMassTons > 0 ? smartRound(row.reactorMassTons) : "-"}
981:                     </TableCell>
982:                   </TooltipTrigger>
983:                   <TooltipContent>
984:                     <div className="space-y-1">
985:                       <div className="text-xs font-semibold">{row.reactorName ?? "Reactor"}</div>
986:                       {row.powerRequiredGW !== undefined && !isNaN(row.powerRequiredGW) && (
987:                         <div className="text-xs">Power required: {smartRound(row.powerRequiredGW)} GW</div>
988:                       )}
989:                       {row.reactorEfficiency !== undefined && (
990:                         <div className="text-xs">Efficiency: {formatPercent(row.reactorEfficiency * 100)}</div>
991:                       )}
992:                       {row.wasteHeatGW !== undefined && (
993:                         <div className="text-xs">Waste heat: {smartRound(row.wasteHeatGW)} GW</div>
994:                       )}
995:                       {row.reactorTonsPerGW !== undefined && (
996:                         <div className="text-xs">
997:                           Specific power: {smartRound(row.reactorTonsPerGW)} t/GW (
998:                           {smartRound(1 / row.reactorTonsPerGW)} GW/t)
999:                         </div>
1000:                       )}
1001:                       {row.reactorMassTons > 0 && (
1002:                         <div className="text-xs">Mass: {smartRound(row.reactorMassTons)} t</div>
1003:                       )}
1004:                       <div className="text-xs font-semibold mt-1">Materials</div>
1005:                       <ShowEffects {...row.reactorCost} />
1006:                     </div>
1007:                   </TooltipContent>
1008:                 </Tooltip>
1009:               </TooltipProvider>
1010:               <TooltipProvider>
1011:                 <Tooltip>
1012:                   <TooltipTrigger asChild>
1013:                     <TableCell className="text-right cursor-help">
1014:                       {row.radiatorMassTons > 0 ? smartRound(row.radiatorMassTons) : "-"}
1015:                     </TableCell>
1016:                   </TooltipTrigger>
1017:                   <TooltipContent>
1018:                     <div className="space-y-1">
1019:                       <div className="text-xs font-semibold">{row.radiatorName ?? "Radiator"}</div>
1020:                       {row.wasteHeatGW !== undefined && (
1021:                         <div className="text-xs">Waste heat to dissipate: {smartRound(row.wasteHeatGW)} GW</div>
1022:                       )}
1023:                       {row.radiatorGWperTon !== undefined && (
1024:                         <div className="text-xs">
1025:                           Cooling: {smartRound(row.radiatorGWperTon)} GW/t ({smartRound(1 / row.radiatorGWperTon)} t/GW)
1026:                         </div>
1027:                       )}
1028:                       {row.radiatorMassTons > 0 && (
1029:                         <div className="text-xs">Mass: {smartRound(row.radiatorMassTons)} t</div>
1030:                       )}
1031:                       <div className="text-xs font-semibold mt-1">Materials</div>
1032:                       <ShowEffects {...row.radiatorCost} />
1033:                     </div>
1034:                   </TooltipContent>
1035:                 </Tooltip>
1036:               </TooltipProvider>
1037:               <TableCell
1038:                 className="text-right"
1039:                 title={`Dry ${smartRound(params.dryMassTons)} + Drive ${smartRound(row.driveMassTons)} + Reactor ${smartRound(row.reactorMassTons)} + Radiator ${smartRound(row.radiatorMassTons)} + Fuel ${smartRound(row.fuelMassTons)}`}
1040:               >
1041:                 {smartRound(row.totalTons)}
1042:               </TableCell>
1043:               <TableCell>
1044:                 <ShowEffects {...row.totalCost} />
1045:               </TableCell>
1046:               <TableCell className="text-right">{smartRound(row.deltaV)}</TableCell>
1047:               <TableCell className="text-right">{smartRound(row.acceleration)}</TableCell>
1048:               <TableCell className="text-right">{smartRound(row.travelDays)}</TableCell>
1049:               <TableCell className="text-right">
1050:                 {row.unlockChance !== undefined ? `${row.unlockChance}%` : ""}
1051:               </TableCell>
1052:               <TableCell
1053:                 className="text-right"
1054:                 title={
1055:                   row.requiredTechs.length > 0
1056:                     ? row.requiredTechs.map((name: string) => analysis.techs.get(name)?.displayName || name).join("\n")
1057:                     : undefined
1058:                 }
1059:               >
1060:                 {row.techResearchRemaining > 0 ? smartRound(row.techResearchRemaining / 1000) : "-"}
1061:               </TableCell>
1062:               <TableCell
1063:                 className="text-right"
1064:                 title={
1065:                   row.requiredProjects.length > 0
1066:                     ? row.requiredProjects
1067:                         .map((name: string) => analysis.projects.get(name)?.displayName || name)
1068:                         .join("\n")
1069:                     : undefined
1070:                 }
1071:               >
1072:                 {row.projectResearchRemaining > 0 ? smartRound(row.projectResearchRemaining / 1000) : "-"}
1073:               </TableCell>
1074:             </TableRow>
1075:           ))}
1076:         </TableBody>
1077:       </Table>
1078:     </div>
1079:   );
1080: }
1081: 
1082: export function getDrivesUi(analysis: Analysis) {
1083:   return {
1084:     key: "drives",
1085:     tab: "Drives",
1086:     content: (
1087:       <SmartAccordion type="multiple" storageKey="drives-accordion" defaultValue={["drive-table", "drive-calculator"]}>
1088:         <AccordionItem value="drive-table">
1089:           <AccordionTrigger>Drive Systems</AccordionTrigger>
1090:           <AccordionContent>
1091:             <DrivesTable analysis={analysis} />
1092:           </AccordionContent>
1093:         </AccordionItem>
1094:         <AccordionItem value="drive-calculator">
1095:           <AccordionTrigger>Drive Calculator</AccordionTrigger>
1096:           <AccordionContent>
1097:             <DriveCalculator analysis={analysis} />
1098:           </AccordionContent>
1099:         </AccordionItem>
1100:       </SmartAccordion>
1101:     ),
1102:   };
1103: }

(End of file - total 1103 lines)
</content>
```

---

## Assistant (Build · Qwen 3.6-35B-A3B (local) · 100.2s)

_Thinking:_

Now I have a thorough understanding of the codebase. Let me also check what UI components are available (like collapsible, tree, sidebar components):

**Tool: read**

**Input:**
```json
{
  "filePath": "terra-invicta-assistant\\src\\components\\ui\\collapsible.tsx"
}
```

**Output:**
```
<path>terra-invicta-assistant\src\components\ui\collapsible.tsx</path>
<type>file</type>
<content>
1: "use client"
2: 
3: import { Collapsible as CollapsiblePrimitive } from "radix-ui"
4: 
5: function Collapsible({
6:   ...props
7: }: React.ComponentProps<typeof CollapsiblePrimitive.Root>) {
8:   return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />
9: }
10: 
11: function CollapsibleTrigger({
12:   ...props
13: }: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleTrigger>) {
14:   return (
15:     <CollapsiblePrimitive.CollapsibleTrigger
16:       data-slot="collapsible-trigger"
17:       {...props}
18:     />
19:   )
20: }
21: 
22: function CollapsibleContent({
23:   ...props
24: }: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleContent>) {
25:   return (
26:     <CollapsiblePrimitive.CollapsibleContent
27:       data-slot="collapsible-content"
28:       {...props}
29:     />
30:   )
31: }
32: 
33: export { Collapsible, CollapsibleTrigger, CollapsibleContent }

(End of file - total 33 lines)
</content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "terra-invicta-assistant\\src\\components\\ui\\accordion.tsx"
}
```

**Output:**
```
<path>terra-invicta-assistant\src\components\ui\accordion.tsx</path>
<type>file</type>
<content>
1: "use client";
2: 
3: import * as React from "react";
4: import { Accordion as AccordionPrimitive } from "radix-ui";
5: 
6: import { cn } from "@/lib/utils";
7: import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
8: 
9: function Accordion({ className, ...props }: React.ComponentProps<typeof AccordionPrimitive.Root>) {
10:   return (
11:     <AccordionPrimitive.Root
12:       data-slot="accordion"
13:       className={cn("overflow-hidden rounded-md border flex w-full flex-col", className)}
14:       {...props}
15:     />
16:   );
17: }
18: 
19: function AccordionItem({ className, ...props }: React.ComponentProps<typeof AccordionPrimitive.Item>) {
20:   return (
21:     <AccordionPrimitive.Item
22:       data-slot="accordion-item"
23:       className={cn("data-open:bg-muted/50 not-last:border-b", className)}
24:       {...props}
25:     />
26:   );
27: }
28: 
29: function AccordionTrigger({ className, children, ...props }: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
30:   return (
31:     <AccordionPrimitive.Header className="flex">
32:       <AccordionPrimitive.Trigger
33:         data-slot="accordion-trigger"
34:         className={cn(
35:           "**:data-[slot=accordion-trigger-icon]:text-muted-foreground gap-6 p-2 text-left text-xs/relaxed font-medium hover:underline **:data-[slot=accordion-trigger-icon]:ml-auto **:data-[slot=accordion-trigger-icon]:size-4 group/accordion-trigger relative flex flex-1 items-start justify-between border border-transparent transition-all outline-none disabled:pointer-events-none disabled:opacity-50",
36:           className
37:         )}
38:         {...props}
39:       >
40:         {children}
41:         <ChevronDownIcon
42:           data-slot="accordion-trigger-icon"
43:           className="pointer-events-none shrink-0 group-aria-expanded/accordion-trigger:hidden"
44:         />
45:         <ChevronUpIcon
46:           data-slot="accordion-trigger-icon"
47:           className="pointer-events-none hidden shrink-0 group-aria-expanded/accordion-trigger:inline"
48:         />
49:       </AccordionPrimitive.Trigger>
50:     </AccordionPrimitive.Header>
51:   );
52: }
53: 
54: function AccordionContent({
55:   className,
56:   children,
57:   innerClassName,
58:   ...props
59: }: React.ComponentProps<typeof AccordionPrimitive.Content> & { innerClassName?: string }) {
60:   const ref = React.useRef<HTMLDivElement>(null);
61:   const contentRef = React.useRef<HTMLDivElement>(null);
62: 
63:   // Radix Accordion doesnt update height when children updates.
64:   // We need to manualy add a resize observer on children of the Content component
65:   // to update the CSS variable height of the content.
66: 
67:   // based on https://github.com/radix-ui/primitives/discussions/2562#discussioncomment-12014729 but using an additional div and MutationObserver
68:   // not sure if the change was needed due to the structure Shadcn set up or if it's because we're using an accordion-tab-accordion rendering
69:   React.useEffect(() => {
70:     const content = contentRef.current;
71:     if (!content) return;
72: 
73:     let resizeObserver: ResizeObserver | null = null;
74: 
75:     const mutationObserver = new MutationObserver(() => {
76:       const current = ref.current;
77:       if (resizeObserver) {
78:         if (current) return;
79:         resizeObserver.disconnect();
80:         resizeObserver = null;
81:       } else {
82:         if (!current) return;
83:         resizeObserver = new ResizeObserver(() => {
84:           const currentHeight = ref.current?.clientHeight;
85:           if (currentHeight === undefined) return;
86: 
87:           content.style.cssText = `--radix-accordion-content-height: ${currentHeight}px;`;
88:         });
89: 
90:         resizeObserver.observe(current);
91:       }
92:     });
93:     mutationObserver.observe(content!, {
94:       attributes: true,
95:       attributeFilter: ["data-state"],
96:       childList: false,
97:       subtree: false,
98:     });
99: 
100:     return () => {
101:       resizeObserver?.disconnect();
102:       mutationObserver.disconnect();
103:     };
104:   }, []);
105: 
106:   return (
107:     <AccordionPrimitive.Content
108:       data-slot="accordion-content"
109:       className="data-open:animate-accordion-down data-closed:animate-accordion-up px-2 text-xs/relaxed overflow-hidden"
110:       ref={contentRef}
111:       {...props}
112:     >
113:       <div
114:         className={cn(
115:           "pt-0 pb-4 [&_a]:hover:text-foreground h-(--radix-accordion-content-height) [&_a]:underline [&_a]:underline-offset-3 [&_p:not(:last-child)]:mb-4",
116:           className
117:         )}
118:       >
119:         <div className={innerClassName} ref={ref}>
120:           {children}
121:         </div>
122:       </div>
123:     </AccordionPrimitive.Content>
124:   );
125: }
126: 
127: export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };

(End of file - total 127 lines)
</content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "terra-invicta-assistant\\src\\app\\game\\current\\renderCurrentGame.tsx"
}
```

**Output:**
```
<path>terra-invicta-assistant\src\app\game\current\renderCurrentGame.tsx</path>
<type>file</type>
<content>
1: "use client";
2: 
3: import { useCurrent } from "./useCurrent";
4: import { useEffect, useState } from "react";
5: import { loadAndAnalyzeFile } from "./actions";
6: import { Loader } from "lucide-react";
7: import { Analysis } from "@/lib/analysis";
8: import { RenderGameComponent } from "./component";
9: 
10: // change renderKey to force re-loading the game state, useful for HMR during development when analysis.ts changes
11: export default function RenderCurrentGame({ renderKey }: { renderKey?: any }) {
12:   const filename = useCurrent();
13:   // TODO: tanstackquery?
14:   const [analysis, setAnalysis] = useState<Analysis | null>(null);
15:   useEffect(() => {
16:     if (!filename) {
17:       setAnalysis(null);
18:       return;
19:     }
20:     (async () => {
21:       let attempts = 0;
22:       while (true) {
23:         try {
24:           const data = await loadAndAnalyzeFile(filename);
25:           setAnalysis(data);
26:           return;
27:         } catch (e) {
28:           if (attempts >= 5) {
29:             console.error("Failed to load and analyze file after multiple attempts", e);
30:             return;
31:           }
32:           await new Promise((resolve) => setTimeout(resolve, 1000));
33:           attempts++;
34:         }
35:       }
36:     })();
37:   }, [filename, renderKey]);
38: 
39:   if (!analysis) {
40:     return (
41:       <div>
42:         Waiting for game state....
43:         <Loader />
44:       </div>
45:     );
46:   }
47: 
48:   return <RenderGameComponent analysis={analysis} />;
49: }

(End of file - total 49 lines)
</content>
```

---

## Assistant (Build · Qwen 3.6-35B-A3B (local) · 21.8s)

_Thinking:_

Now I have a thorough understanding of the codebase. Let me plan the reorganization:

Current structure:
- Top-level: game info header + SmartTabs with 5 tabs (Councilors, Fleets, Habs, Resources, Drives)
- Each tab uses SmartAccordion with sections

New structure should be:
- Left sidebar: collapsible tree navigation (using Accordion for tree levels)
- Right side: main content area showing the selected item
- Each tree item corresponds to a leaf in the tree (e.g., "Score Details", "Existing Council", "Find New", etc.)

The tree structure would be:


- Councilors (expandable)
  - Score Details (expandable)
    - Modified Councilors
    - Base Councilors
    - Available Councilors
  - Existing Council (expandable)
    - Council
    - Organizations
  - Find New Councilors
  - Current Organizations
  - Hostile Takeover
  - Missions
  - Other Councilors
- Fleets (expandable)
  - Alien Fleets
  - Other Human Factions
  - Player Fleets
  - Ships Under Construction
- Habs (expandable)
  - Current Bonuses
  - Future Bonuses
  - MC/Boost Summary
  - Alien Hate
  - Building Details
  - Available Projects (expandable)
    - Boost Projects
    - CP Projects
    - Max Org Projects
    - Expand Nations
    - Stealable Projects
  - Technology Goals
  - Manage Habs
  - Manage Mines
- Resources (expandable)
  - Transactions
  - Owned Nations
  - Spoil Targets
  - MC/Boost Targets
  - Nation Claims
  - Unification Candidates
- Drives (expandable)
  - Drive Systems
  - Drive Calculator

I'm thinking through a cleaner approach here. The real goal is to replace those top tabs and accordion sections with a left sidebar tree navigation that lets users jump between different views. Each leaf in the tree would map to a focused section of content displayed on the right side, with the tree staying collapsed by default and expandable as needed.

The trick is preserving the scoring calculations and data transformations that currently live inside each component. I need to decide whether to keep those calculations where they are or extract them somewhere more centralized. The key insight is that each `getXxxUi` function returns a unified interface with a key, display name, and content, so I could restructure this to return a tree node format instead—either a container with children or a leaf node that directly references its content component.

Looking back at the user's example, they want a hierarchical structure where "Councilors" is a parent node with "score details" as a subtitle, followed by subsections like "Existing Council" and "Find new." So the UI needs to display a collapsible tree on the left side that users can navigate through this hierarchy.

I'm settling on a two-column layout: a fixed-width sidebar for the tree navigation and a main content area on the right. I'll refactor the tree structure to separate leaf nodes (which contain the actual content) from folder nodes (which are just containers for other nodes). This means updating the return types of the `getXxxUi` functions to produce this tree format, then building the tree renderer and content display components. Since each tab's accordion sections are currently independent components, I'll keep them that way and just wire them up as individual tree leaves.

Now I'm mapping out the actual tree structure I need to build out.

**Tool: read**

**Input:**
```json
{
  "filePath": "terra-invicta-assistant\\src\\app\\game\\current"
}
```

**Output:**
```
<path>terra-invicta-assistant\src\app\game\current</path>
<type>directory</type>
<entries>
actions.ts
component.tsx
councilors.tsx
drives.tsx
fleets.tsx
habs.tsx
page.tsx
renderCurrentGame.tsx
researchLink.tsx
resources.tsx
scoringWeights.tsx
technologyGoals.tsx
useCurrent.ts

(13 entries)
</entries>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "terra-invicta-assistant\\src\\app\\game\\current\\scoringWeights.tsx"
}
```

**Output:**
```
<path>terra-invicta-assistant\src\app\game\current\scoringWeights.tsx</path>
<type>file</type>
<content>
1: "use client";
2: 
3: import { useState, useEffect, ReactNode } from "react";
4: import { Button } from "@/components/ui/button";
5: import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
6: import { Input } from "@/components/ui/input";
7: import { Label } from "@/components/ui/label";
8: import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
9: import { MissionDataName, TechCategory } from "@/lib/template-types-generated";
10: import { InfoTooltip } from "@/components/infoTooltip";
11: 
12: interface SavedWeightConfigs {
13:   current: ScoringWeights;
14:   saved: Record<string, ScoringWeights>;
15: }
16: 
17: const STORAGE_KEY = "councilorScoringWeights";
18: 
19: export function loadWeightsFromStorage(): ScoringWeights {
20:   if (typeof window === "undefined") return defaultScoringWeights;
21: 
22:   try {
23:     const stored = localStorage.getItem(STORAGE_KEY);
24:     if (stored) {
25:       const parsed: SavedWeightConfigs = JSON.parse(stored);
26:       return parsed.current || defaultScoringWeights;
27:     }
28:   } catch (e) {
29:     console.error("Failed to load scoring weights:", e);
30:   }
31:   return defaultScoringWeights;
32: }
33: 
34: function saveWeightsToStorage(weights: ScoringWeights, savedConfigs: Record<string, ScoringWeights>) {
35:   if (typeof window === "undefined") return;
36: 
37:   try {
38:     const data: SavedWeightConfigs = {
39:       current: weights,
40:       saved: savedConfigs,
41:     };
42:     localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
43:   } catch (e) {
44:     console.error("Failed to save scoring weights:", e);
45:   }
46: }
47: 
48: function loadSavedConfigsFromStorage(): Record<string, ScoringWeights> {
49:   if (typeof window === "undefined") return {};
50: 
51:   try {
52:     const stored = localStorage.getItem(STORAGE_KEY);
53:     if (stored) {
54:       const parsed: SavedWeightConfigs = JSON.parse(stored);
55:       return parsed.saved || {};
56:     }
57:   } catch (e) {
58:     console.error("Failed to load saved configs:", e);
59:   }
60:   return {};
61: }
62: 
63: function NumberInput({
64:   label,
65:   value,
66:   onChange,
67: }: {
68:   label: ReactNode;
69:   value: number | undefined;
70:   onChange: (v: number) => void;
71: }) {
72:   return (
73:     <div className="flex items-center gap-1.5">
74:       <Label className="text-xs whitespace-nowrap flex-shrink-0" style={{ width: "8rem" }}>
75:         {label}
76:       </Label>
77:       <Input
78:         type="number"
79:         step="0.001"
80:         value={value ?? 0}
81:         onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
82:         className="text-sm flex-shrink-0"
83:         style={{ height: "1.75rem", width: "6rem" }}
84:       />
85:     </div>
86:   );
87: }
88: 
89: export function ScoringWeightsDialog({
90:   weights,
91:   onWeightsChange,
92: }: {
93:   weights: ScoringWeights;
94:   onWeightsChange: (weights: ScoringWeights) => void;
95: }) {
96:   const [open, setOpen] = useState(false);
97:   const [editedWeights, setEditedWeights] = useState<ScoringWeights>(weights);
98:   const [savedConfigs, setSavedConfigs] = useState<Record<string, ScoringWeights>>({});
99:   const [selectedConfig, setSelectedConfig] = useState<string>("");
100:   const [newConfigName, setNewConfigName] = useState("");
101: 
102:   useEffect(() => {
103:     setEditedWeights(weights);
104:   }, [weights]);
105: 
106:   useEffect(() => {
107:     if (open) {
108:       setSavedConfigs(loadSavedConfigsFromStorage());
109:     }
110:   }, [open]);
111: 
112:   const handleSave = () => {
113:     if (newConfigName.trim()) {
114:       const updated = { ...savedConfigs, [newConfigName.trim()]: editedWeights };
115:       setSavedConfigs(updated);
116:       saveWeightsToStorage(editedWeights, updated);
117:       setNewConfigName("");
118:       setSelectedConfig(newConfigName.trim());
119:     }
120:   };
121: 
122:   const handleLoad = () => {
123:     if (selectedConfig) {
124:       const config = prebuiltScoringWeights[selectedConfig] || savedConfigs[selectedConfig];
125:       if (config) {
126:         setEditedWeights(config);
127:       }
128:     }
129:   };
130: 
131:   const handleApply = () => {
132:     onWeightsChange(editedWeights);
133:     saveWeightsToStorage(editedWeights, savedConfigs);
134:     setOpen(false);
135:   };
136: 
137:   const handleDelete = () => {
138:     if (selectedConfig && !prebuiltScoringWeights[selectedConfig] && savedConfigs[selectedConfig]) {
139:       const updated = { ...savedConfigs };
140:       delete updated[selectedConfig];
141:       setSavedConfigs(updated);
142:       saveWeightsToStorage(editedWeights, updated);
143:       setSelectedConfig("");
144:     }
145:   };
146: 
147:   const updateWeight = (key: keyof ScoringWeights, value: number) => {
148:     setEditedWeights({ ...editedWeights, [key]: value });
149:   };
150: 
151:   const updateCouncilorTechBonus = (category: TechCategory, value: number) => {
152:     setEditedWeights({
153:       ...editedWeights,
154:       councilorTechBonus: { ...editedWeights.councilorTechBonus, [category]: value },
155:     });
156:   };
157: 
158:   const updateTechBonus = (category: TechCategory, value: number) => {
159:     setEditedWeights({
160:       ...editedWeights,
161:       techBonuses: { ...editedWeights.techBonuses, [category]: value },
162:     });
163:   };
164: 
165:   const updateMissionWeight = (mission: MissionDataName, value: number) => {
166:     setEditedWeights({
167:       ...editedWeights,
168:       missions: { ...editedWeights.missions, [mission]: value },
169:     });
170:   };
171: 
172:   return (
173:     <Dialog open={open} onOpenChange={setOpen}>
174:       <DialogTrigger asChild>
175:         <Button variant="outline">Configure Scoring</Button>
176:       </DialogTrigger>
177:       <DialogContent
178:         className="w-screen max-w-screen-2xl max-h-screen overflow-y-auto"
179:         style={{ maxWidth: "1400px", width: "95vw", maxHeight: "90vh" }}
180:       >
181:         <DialogHeader>
182:           <DialogTitle>Configure Scoring Weights</DialogTitle>
183:         </DialogHeader>
184: 
185:         <div className="space-y-3">
186:           {/* Save/Load Controls */}
187:           <div className="flex gap-2 items-center border-b pb-4">
188:             <Label className="whitespace-nowrap">Load Saved Configuration</Label>
189:             <div className="flex-1">
190:               <Select value={selectedConfig} onValueChange={setSelectedConfig}>
191:                 <SelectTrigger>
192:                   <SelectValue placeholder="Select a saved configuration" />
193:                 </SelectTrigger>
194:                 <SelectContent>
195:                   {Object.keys(prebuiltScoringWeights).map((name) => (
196:                     <SelectItem key={name} value={name}>
197:                       {name}
198:                     </SelectItem>
199:                   ))}
200:                   {Object.keys(savedConfigs).length > 0 && Object.keys(prebuiltScoringWeights).length > 0 && (
201:                     <SelectItem key="__separator__" value="__separator__" disabled>
202:                       ──────────
203:                     </SelectItem>
204:                   )}
205:                   {Object.keys(savedConfigs).map((name) => (
206:                     <SelectItem key={name} value={name}>
207:                       {name}
208:                     </SelectItem>
209:                   ))}
210:                 </SelectContent>
211:               </Select>
212:             </div>
213:             <Button onClick={handleLoad} disabled={!selectedConfig}>
214:               Load
215:             </Button>
216:             <Button
217:               onClick={handleDelete}
218:               variant="destructive"
219:               disabled={!selectedConfig || !!prebuiltScoringWeights[selectedConfig]}
220:             >
221:               Delete
222:             </Button>
223:           </div>
224: 
225:           <div className="flex gap-2 items-center border-b pb-4 mt-4">
226:             <Label className="whitespace-nowrap">Save Current Configuration</Label>
227:             <div className="flex-1">
228:               <Input
229:                 placeholder="Enter configuration name"
230:                 value={newConfigName}
231:                 onChange={(e) => setNewConfigName(e.target.value)}
232:               />
233:             </div>
234:             <Button onClick={handleSave} disabled={!newConfigName.trim()}>
235:               Save
236:             </Button>
237:           </div>
238: 
239:           <div className="grid gap-x-8 gap-y-3 items-start" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
240:             {/* Column 1 */}
241:             <div className="space-y-3">
242:               {/* Councilor Attributes */}
243:               <div>
244:                 <h3 className="font-semibold mb-1.5 text-sm">Councilor Attributes</h3>
245:                 <div className="space-y-1">
246:                   <NumberInput
247:                     label="Persuasion"
248:                     value={editedWeights.persuasion}
249:                     onChange={(v) => updateWeight("persuasion", v)}
250:                   />
251:                   <NumberInput
252:                     label="Command"
253:                     value={editedWeights.command}
254:                     onChange={(v) => updateWeight("command", v)}
255:                   />
256:                   <NumberInput
257:                     label="Investigation"
258:                     value={editedWeights.investigation}
259:                     onChange={(v) => updateWeight("investigation", v)}
260:                   />
261:                   <NumberInput
262:                     label="Espionage"
263:                     value={editedWeights.espionage}
264:                     onChange={(v) => updateWeight("espionage", v)}
265:                   />
266:                   <NumberInput
267:                     label="Administration"
268:                     value={editedWeights.administration}
269:                     onChange={(v) => updateWeight("administration", v)}
270:                   />
271:                   <NumberInput
272:                     label="Science"
273:                     value={editedWeights.science}
274:                     onChange={(v) => updateWeight("science", v)}
275:                   />
276:                   <NumberInput
277:                     label="Security"
278:                     value={editedWeights.security}
279:                     onChange={(v) => updateWeight("security", v)}
280:                   />
281:                   <NumberInput
282:                     label={
283:                       <>
284:                         XP Modifier{" "}
285:                         <InfoTooltip>
286:                           Assuming 4 XP per mission and 24 missions/year, this means a Quick Learner councilor would
287:                           gain about 1 extra level every ~2 years, so <code>-50</code> makes Quick Learner worth about 5
288:                           points over a ~10-year period (and Striver worth 10 points over the same period).
289:                         </InfoTooltip>
290:                       </>
291:                     }
292:                     value={editedWeights.xpModifier}
293:                     onChange={(v) => updateWeight("xpModifier", v)}
294:                   />
295:                   <NumberInput label="Raw XP" value={editedWeights.xp} onChange={(v) => updateWeight("xp", v)} />
296:                 </div>
297:               </div>
298: 
299:               {/* Monthly Income */}
300:               <div>
301:                 <h3 className="font-semibold mb-1.5 text-sm">Monthly Income</h3>
302:                 <div className="space-y-1">
303:                   <NumberInput
304:                     label="Boost"
305:                     value={editedWeights.incomeBoost_month}
306:                     onChange={(v) => updateWeight("incomeBoost_month", v)}
307:                   />
308:                   <NumberInput
309:                     label="Money"
310:                     value={editedWeights.incomeMoney_month}
311:                     onChange={(v) => updateWeight("incomeMoney_month", v)}
312:                   />
313:                   <NumberInput
314:                     label="Influence"
315:                     value={editedWeights.incomeInfluence_month}
316:                     onChange={(v) => updateWeight("incomeInfluence_month", v)}
317:                   />
318:                   <NumberInput
319:                     label="Ops"
320:                     value={editedWeights.incomeOps_month}
321:                     onChange={(v) => updateWeight("incomeOps_month", v)}
322:                   />
323:                   <NumberInput
324:                     label="Mission Control"
325:                     value={editedWeights.incomeMissionControl}
326:                     onChange={(v) => updateWeight("incomeMissionControl", v)}
327:                   />
328:                   <NumberInput
329:                     label="Research"
330:                     value={editedWeights.incomeResearch_month}
331:                     onChange={(v) => updateWeight("incomeResearch_month", v)}
332:                   />
333:                   <NumberInput
334:                     label="Project Capacity"
335:                     value={editedWeights.projectCapacityGranted}
336:                     onChange={(v) => updateWeight("projectCapacityGranted", v)}
337:                   />
338:                 </div>
339:               </div>
340: 
341:               {/* Purchase Costs */}
342:               <div>
343:                 <h3 className="font-semibold mb-1.5 text-sm">Purchase Costs</h3>
344:                 <div className="space-y-1">
345:                   <NumberInput
346:                     label="Money Cost"
347:                     value={editedWeights.costMoney}
348:                     onChange={(v) => updateWeight("costMoney", v)}
349:                   />
350:                   <NumberInput
351:                     label="Influence Cost"
352:                     value={editedWeights.costInfluence}
353:                     onChange={(v) => updateWeight("costInfluence", v)}
354:                   />
355:                   <NumberInput
356:                     label="Ops Cost"
357:                     value={editedWeights.costOps}
358:                     onChange={(v) => updateWeight("costOps", v)}
359:                   />
360:                   <NumberInput
361:                     label="Boost Cost"
362:                     value={editedWeights.costBoost}
363:                     onChange={(v) => updateWeight("costBoost", v)}
364:                   />
365:                 </div>
366:               </div>
367:             </div>
368: 
369:             {/* Column 2 */}
370:             <div className="space-y-3">
371:               {/* Priority Bonuses */}
372:               <div>
373:                 <h3 className="font-semibold mb-1.5 text-sm">Priority Bonuses</h3>
374:                 <div className="space-y-1">
375:                   <NumberInput
376:                     label="Economy"
377:                     value={editedWeights.economyBonus}
378:                     onChange={(v) => updateWeight("economyBonus", v)}
379:                   />
380:                   <NumberInput
381:                     label="Welfare"
382:                     value={editedWeights.welfareBonus}
383:                     onChange={(v) => updateWeight("welfareBonus", v)}
384:                   />
385:                   <NumberInput
386:                     label="Environment"
387:                     value={editedWeights.environmentBonus}
388:                     onChange={(v) => updateWeight("environmentBonus", v)}
389:                   />
390:                   <NumberInput
391:                     label="Knowledge"
392:                     value={editedWeights.knowledgeBonus}
393:                     onChange={(v) => updateWeight("knowledgeBonus", v)}
394:                   />
395:                   <NumberInput
396:                     label="Government"
397:                     value={editedWeights.governmentBonus}
398:                     onChange={(v) => updateWeight("governmentBonus", v)}
399:                   />
400:                   <NumberInput
401:                     label="Unity"
402:                     value={editedWeights.unityBonus}
403:                     onChange={(v) => updateWeight("unityBonus", v)}
404:                   />
405:                   <NumberInput
406:                     label="Military"
407:                     value={editedWeights.militaryBonus}
408:                     onChange={(v) => updateWeight("militaryBonus", v)}
409:                   />
410:                   <NumberInput
411:                     label="Oppression"
412:                     value={editedWeights.oppressionBonus}
413:                     onChange={(v) => updateWeight("oppressionBonus", v)}
414:                   />
415:                   <NumberInput
416:                     label="Spoils"
417:                     value={editedWeights.spoilsBonus}
418:                     onChange={(v) => updateWeight("spoilsBonus", v)}
419:                   />
420:                   <NumberInput
421:                     label="Space Dev"
422:                     value={editedWeights.spaceDevBonus}
423:                     onChange={(v) => updateWeight("spaceDevBonus", v)}
424:                   />
425:                   <NumberInput
426:                     label="Spaceflight"
427:                     value={editedWeights.spaceflightBonus}
428:                     onChange={(v) => updateWeight("spaceflightBonus", v)}
429:                   />
430:                   <NumberInput
431:                     label="MC Bonus"
432:                     value={editedWeights.MCBonus}
433:                     onChange={(v) => updateWeight("MCBonus", v)}
434:                   />
435:                   <NumberInput
436:                     label="Mining"
437:                     value={editedWeights.miningBonus}
438:                     onChange={(v) => updateWeight("miningBonus", v)}
439:                   />
440:                 </div>
441:               </div>
442: 
443:               {/* Tech Bonuses (from Councilor/Traits) */}
444:               <div>
445:                 <h3 className="font-semibold mb-1.5 text-sm">Councilor Tech Bonuses</h3>
446:                 <div className="space-y-1">
447:                   {[
448:                     "Energy",
449:                     "InformationScience",
450:                     "LifeScience",
451:                     "Materials",
452:                     "MilitaryScience",
453:                     "SocialScience",
454:                     "SpaceScience",
455:                   ].map((cat) => (
456:                     <NumberInput
457:                       key={cat}
458:                       label={cat}
459:                       value={editedWeights.councilorTechBonus?.[cat as TechCategory]}
460:                       onChange={(v) => updateCouncilorTechBonus(cat as TechCategory, v)}
461:                     />
462:                   ))}
463:                 </div>
464:               </div>
465: 
466:               {/* Tech Bonuses (from Orgs) */}
467:               <div>
468:                 <h3 className="font-semibold mb-1.5 text-sm">Org Tech Bonuses</h3>
469:                 <div className="space-y-1">
470:                   {[
471:                     "Energy",
472:                     "InformationScience",
473:                     "LifeScience",
474:                     "Materials",
475:                     "MilitaryScience",
476:                     "SocialScience",
477:                     "SpaceScience",
478:                   ].map((cat) => (
479:                     <NumberInput
480:                       key={cat}
481:                       label={cat}
482:                       value={editedWeights.techBonuses?.[cat as TechCategory]}
483:                       onChange={(v) => updateTechBonus(cat as TechCategory, v)}
484:                     />
485:                   ))}
486:                 </div>
487:               </div>
488:             </div>
489: 
490:             {/* Column 3 */}
491:             <div className="space-y-3">
492:               {/* Mission Weights */}
493:               <div>
494:                 <h3 className="font-semibold mb-1.5 text-sm">Mission Weights</h3>
495:                 <div className="space-y-1">
496:                   {Object.keys(editedWeights.missions || {}).map((mission) => (
497:                     <NumberInput
498:                       key={mission}
499:                       label={mission}
500:                       value={editedWeights.missions?.[mission as MissionDataName]}
501:                       onChange={(v) => updateMissionWeight(mission as MissionDataName, v)}
502:                     />
503:                   ))}
504:                 </div>
505:               </div>
506: 
507:               {/* Other Settings */}
508:               <div>
509:                 <h3 className="font-semibold mb-1.5 text-sm">Other Settings</h3>
510:                 <div className="space-y-1">
511:                   <NumberInput
512:                     label="Org Tier Exponent"
513:                     value={editedWeights.orgTierExponent}
514:                     onChange={(v) => updateWeight("orgTierExponent", v)}
515:                   />
516:                   <NumberInput
517:                     label="Missing Mission Wt"
518:                     value={editedWeights.extraWeightForMissingMissions}
519:                     onChange={(v) => updateWeight("extraWeightForMissingMissions", v)}
520:                   />
521:                   <NumberInput
522:                     label="Single Mission Wt"
523:                     value={editedWeights.extraWeightForSingleMissions}
524:                     onChange={(v) => updateWeight("extraWeightForSingleMissions", v)}
525:                   />
526:                 </div>
527:               </div>
528:             </div>
529:           </div>
530:         </div>
531: 
532:         <DialogFooter>
533:           <Button variant="outline" onClick={() => setOpen(false)}>
534:             Cancel
535:           </Button>
536:           <Button onClick={handleApply}>Apply</Button>
537:         </DialogFooter>
538:       </DialogContent>
539:     </Dialog>
540:   );
541: }
542: 
543: export interface ScoringWeights {
544:   // Councilor attributes
545:   persuasion?: number;
546:   command?: number;
547:   investigation?: number;
548:   espionage?: number;
549:   administration?: number;
550:   science?: number;
551:   security?: number;
552:   xpModifier?: number;
553:   xp?: number;
554: 
555:   // Monthly income/costs
556:   incomeBoost_month?: number;
557:   incomeMoney_month?: number;
558:   incomeInfluence_month?: number;
559:   incomeOps_month?: number;
560:   incomeMissionControl?: number;
561:   incomeResearch_month?: number;
562:   projectCapacityGranted?: number;
563: 
564:   // Purchase costs (typically negative weights since costs are bad)
565:   costMoney?: number;
566:   costInfluence?: number;
567:   costOps?: number;
568:   costBoost?: number;
569: 
570:   // Priority bonuses
571:   economyBonus?: number;
572:   welfareBonus?: number;
573:   environmentBonus?: number;
574:   knowledgeBonus?: number;
575:   governmentBonus?: number;
576:   unityBonus?: number;
577:   militaryBonus?: number;
578:   oppressionBonus?: number;
579:   spoilsBonus?: number;
580:   spaceDevBonus?: number;
581:   spaceflightBonus?: number;
582:   MCBonus?: number;
583:   miningBonus?: number;
584: 
585:   // Tech bonuses (weight per tech category)
586:   councilorTechBonus?: Partial<Record<TechCategory, number>>;
587:   techBonuses?: Partial<Record<TechCategory, number>>;
588: 
589:   // Missions (weight per mission name)
590:   missions?: Partial<Record<MissionDataName, number>>;
591: 
592:   orgTierExponent: number;
593:   extraWeightForMissingMissions: number;
594:   extraWeightForSingleMissions: number;
595: }
596: 
597: const zeroWeights: ScoringWeights = {
598:   persuasion: 0,
599:   command: 0,
600:   investigation: 0,
601:   espionage: 0,
602:   administration: 0,
603:   science: 0,
604:   security: 0,
605:   xpModifier: 0,
606:   xp: 0,
607:   incomeBoost_month: 0,
608:   incomeMoney_month: 0,
609:   incomeInfluence_month: 0,
610:   incomeOps_month: 0,
611:   incomeMissionControl: 0,
612:   incomeResearch_month: 0,
613:   projectCapacityGranted: 0,
614:   costMoney: 0,
615:   costInfluence: 0,
616:   costOps: 0,
617:   costBoost: 0,
618:   economyBonus: 0,
619:   welfareBonus: 0,
620:   environmentBonus: 0,
621:   knowledgeBonus: 0,
622:   governmentBonus: 0,
623:   unityBonus: 0,
624:   militaryBonus: 0,
625:   oppressionBonus: 0,
626:   spoilsBonus: 0,
627:   spaceDevBonus: 0,
628:   spaceflightBonus: 0,
629:   MCBonus: 0,
630:   miningBonus: 0,
631:   councilorTechBonus: {
632:     Energy: 0,
633:     InformationScience: 0,
634:     LifeScience: 0,
635:     Materials: 0,
636:     MilitaryScience: 0,
637:     SocialScience: 0,
638:     SpaceScience: 0,
639:   },
640:   techBonuses: {
641:     Energy: 0,
642:     InformationScience: 0,
643:     LifeScience: 0,
644:     Materials: 0,
645:     MilitaryScience: 0,
646:     SocialScience: 0,
647:     SpaceScience: 0,
648:   },
649:   missions: {
650:     Advise: 0,
651:     Assassinate: 0,
652:     AssaultAlienAsset: 0,
653:     AssumeControl: 0,
654:     BuildFacility: 0,
655:     Contact: 0,
656:     ControlSpaceAsset: 0,
657:     Coup: 0,
658:     Crackdown: 0,
659:     DefendInterests: 0,
660:     Deorbit: 0,
661:     Detain: 0,
662:     DetectCouncilActivity: 0,
663:     Extract: 0,
664:     GainInfluence: 0,
665:     GoToGround: 0,
666:     HostileTakeover: 0,
667:     Inspire: 0,
668:     InvestigateAlienActivity: 0,
669:     InvestigateCouncilor: 0,
670:     Orbit: 0,
671:     Propaganda: 0,
672:     Protect: 0,
673:     Purge: 0,
674:     SabotageFacilities: 0,
675:     SabotageHabModule: 0,
676:     SabotageProject: 0,
677:     SeizeSpaceAsset: 0,
678:     SetNationalPolicy: 0,
679:     Stabilize: 0,
680:     StealProject: 0,
681:     Turn: 0,
682:     Unrest: 0,
683:   },
684:   orgTierExponent: 1,
685:   extraWeightForMissingMissions: 0,
686:   extraWeightForSingleMissions: 0,
687: };
688: 
689: // initial defaults based on my old scoring system for mid/late game
690: export const midLate = {
691:   ...zeroWeights,
692:   // Councilor attributes - based on my old scoring system
693:   persuasion: 1,
694:   command: 1,
695:   investigation: 0.7,
696:   espionage: 0.7,
697:   administration: 0.3,
698:   science: 0.7,
699:   security: 0.3,
700:   xpModifier: -50, // -.1 (quick learner) is worth about 1 level every 2 years, so we want it to be worth 5
701:   xp: 1 / 20, // 20 xp is worth 1 level
702: 
703:   // Monthly income (valued highly as these compound over time)
704:   incomeBoost_month: 0.15, // probably should be higher early-game
705:   incomeMoney_month: 1 / 100,
706:   incomeInfluence_month: 1 / 60,
707:   incomeOps_month: 1 / 30,
708:   incomeMissionControl: 0.1, // probably should be higher early-game
709:   incomeResearch_month: 1 / 100,
710:   projectCapacityGranted: 0.3,
711: 
712:   // IMHO, purchase costs are pretty trivial past early-game
713:   costMoney: 0,
714:   costInfluence: 0,
715:   costOps: 0,
716:   costBoost: 0,
717: 
718:   // Priority bonuses (moderate value for most)
719:   economyBonus: 10,
720:   welfareBonus: 10,
721:   environmentBonus: 10,
722:   knowledgeBonus: 10,
723:   governmentBonus: 10,
724:   unityBonus: 25,
725:   militaryBonus: 10,
726:   oppressionBonus: 10,
727:   spoilsBonus: 40,
728:   spaceDevBonus: 1, // funding
729:   spaceflightBonus: 5, // seems to be both "build boost" and "create space program"
730:   MCBonus: 5, // didn't have this in my old thing - no idea what it's for
731:   miningBonus: 20,
732: 
733:   // Councilor Tech bonuses - from traits and orgs are easier to get them
734:   councilorTechBonus: {
735:     ...zeroWeights.councilorTechBonus,
736:     Energy: 15,
737:     InformationScience: 15,
738:     LifeScience: 15,
739:     Materials: 15,
740:     MilitaryScience: 15,
741:     SocialScience: 15,
742:     SpaceScience: 15,
743:   },
744: 
745:   // Org Tech bonuses - from orgs
746:   techBonuses: {
747:     ...zeroWeights.techBonuses,
748:     Energy: 10,
749:     InformationScience: 10,
750:     LifeScience: 10,
751:     Materials: 10,
752:     MilitaryScience: 10,
753:     SocialScience: 10,
754:     SpaceScience: 10,
755:   },
756: 
757:   missions: {
758:     ...zeroWeights.missions,
759:     // Missions (weighted by utility/frequency of use by ClaudeSonnet45)
760:     // Advise: 2.0,
761:     // Assassinate: 2.5,
762:     // AssaultAlienAsset: 2.0,
763:     // AssumeControl: 3.0,
764:     // BuildFacility: 1.5,
765:     // Contact: 1.0,
766:     // ControlSpaceAsset: 2.5,
767:     // Coup: 2.5,
768:     // Crackdown: 1.5,
769:     // DefendInterests: 2.0,
770:     // Deorbit: 1.0,
771:     // Detain: 2.0,
772:     // DetectCouncilActivity: 1.5,
773:     // Extract: 2.5,
774:     // GainInfluence: 2.5,
775:     // GoToGround: 0.5,
776:     // HostileTakeover: 2.0,
777:     // Inspire: 2.0,
778:     // InvestigateAlienActivity: 1.5,
779:     // InvestigateCouncilor: 1.5,
780:     // Orbit: 1.0,
781:     // Propaganda: 1.5,
782:     // Protect: 2.0,
783:     // Purge: 1.5,
784:     // SabotageFacilities: 2.0,
785:     // SabotageHabModule: 1.5,
786:     // SabotageProject: 2.0,
787:     // SeizeSpaceAsset: 2.0,
788:     // SetNationalPolicy: 2.5,
789:     // Stabilize: 2.0,
790:     // StealProject: 2.5,
791:     // Turn: 3.0,
792:     // Unrest: 1.5,
793: 
794:     // from my original scoring system
795:     Inspire: 10, // rare
796:     Coup: 2, // bit rare
797:     AssaultAlienAsset: 2, // bit rare
798:   },
799: 
800:   orgTierExponent: 0.95, // slight priority to higher tiers since you don't have unlimited org slots
801:   extraWeightForMissingMissions: 1, // extra weight to get missions you don't have yet
802:   extraWeightForSingleMissions: 0.5, // extra weight to get missions you only have one of
803: } satisfies ScoringWeights;
804: const earlyGame = {
805:   ...zeroWeights,
806:   // bunch of guesses here - emphasis on income and persuasion/command for early game
807:   persuasion: 1.5,
808:   command: 1,
809:   investigation: 0.7,
810:   espionage: 0.7,
811:   administration: 1,
812:   science: 0.7,
813:   security: 0.3,
814:   xpModifier: -75, // if we can get one of these early, that'd be great
815:   xp: 1 / 20, // 20 xp is worth 1 level
816: 
817:   incomeBoost_month: 1,
818:   incomeMoney_month: 1 / 20,
819:   incomeInfluence_month: 1 / 10,
820:   incomeOps_month: 1 / 5,
821:   incomeMissionControl: 1,
822:   incomeResearch_month: 1 / 30,
823:   projectCapacityGranted: 0.3,
824: 
825:   costMoney: -1 / 400,
826:   costInfluence: -1 / 40,
827:   costOps: -1 / 40,
828:   costBoost: -1 / 10,
829: 
830:   // Priority bonuses (moderate value for most)
831:   economyBonus: 10,
832:   welfareBonus: 10,
833:   environmentBonus: 10,
834:   knowledgeBonus: 10,
835:   governmentBonus: 10,
836:   unityBonus: 10,
837:   militaryBonus: 10,
838:   oppressionBonus: 10,
839:   spoilsBonus: 20,
840:   spaceDevBonus: 3, // funding
841:   spaceflightBonus: 7, // seems to be both "build boost" and "create space program"
842:   MCBonus: 7,
843:   miningBonus: 1,
844: 
845:   // Councilor Tech bonuses - from traits (going a bit higher here since we won't have habs online yet) and we should keep these a while
846:   councilorTechBonus: {
847:     ...zeroWeights.councilorTechBonus,
848:     Energy: 20,
849:     InformationScience: 20,
850:     LifeScience: 20,
851:     Materials: 20,
852:     MilitaryScience: 20,
853:     SocialScience: 20,
854:     SpaceScience: 20,
855:   },
856: 
857:   // Org Tech bonuses - from orgs (going a bit higher here since we won't have habs online yet)
858:   techBonuses: {
859:     ...zeroWeights.techBonuses,
860:     Energy: 15,
861:     InformationScience: 15,
862:     LifeScience: 15,
863:     Materials: 15,
864:     MilitaryScience: 15,
865:     SocialScience: 15,
866:     SpaceScience: 15,
867:   },
868: 
869:   missions: {
870:     ...zeroWeights.missions,
871:     // Missions (weighted by utility/frequency of use by ClaudeSonnet45)
872:     // Advise: 2.0,
873:     // Assassinate: 2.5,
874:     // AssaultAlienAsset: 2.0,
875:     // AssumeControl: 3.0,
876:     // BuildFacility: 1.5,
877:     // Contact: 1.0,
878:     // ControlSpaceAsset: 2.5,
879:     // Coup: 2.5,
880:     // Crackdown: 1.5,
881:     // DefendInterests: 2.0,
882:     // Deorbit: 1.0,
883:     // Detain: 2.0,
884:     // DetectCouncilActivity: 1.5,
885:     // Extract: 2.5,
886:     // GainInfluence: 2.5,
887:     // GoToGround: 0.5,
888:     // HostileTakeover: 2.0,
889:     // Inspire: 2.0,
890:     // InvestigateAlienActivity: 1.5,
891:     // InvestigateCouncilor: 1.5,
892:     // Orbit: 1.0,
893:     // Propaganda: 1.5,
894:     // Protect: 2.0,
895:     // Purge: 1.5,
896:     // SabotageFacilities: 2.0,
897:     // SabotageHabModule: 1.5,
898:     // SabotageProject: 2.0,
899:     // SeizeSpaceAsset: 2.0,
900:     // SetNationalPolicy: 2.5,
901:     // Stabilize: 2.0,
902:     // StealProject: 2.5,
903:     // Turn: 3.0,
904:     // Unrest: 1.5,
905: 
906:     Inspire: 2, // rare - boost this manually if you're having trouble getting it
907:     Coup: 1.5, // bit rare
908:     AssaultAlienAsset: 1.5, // bit rare
909:     // public campaign and control nation are critical early game, but control nation is _really_ common
910:     GainInfluence: 0.2,
911:     Propaganda: 3,
912:   },
913: 
914:   orgTierExponent: 1, // not using up all slots yet, so equal weighting
915:   extraWeightForMissingMissions: 1.5, // extra weight to get missions you don't have yet
916:   extraWeightForSingleMissions: 0.5, // extra weight to get missions you only have one of
917: } satisfies ScoringWeights;
918: 
919: const earlyInvestigate = {
920:   ...earlyGame,
921:   investigation: Math.max(earlyGame.investigation, 1) * 2,
922:   espionage: Math.max(earlyGame.espionage, 1) * 1.5,
923:   missions: {
924:     ...earlyGame.missions,
925:     InvestigateAlienActivity: Math.max(earlyGame.missions?.InvestigateAlienActivity || 0, 1) * 1.5,
926:     InvestigateCouncilor: Math.max(earlyGame.missions?.InvestigateCouncilor || 0, 1) * 3,
927:     Crackdown: Math.max(earlyGame.missions?.Crackdown || 0, 1) * 3,
928:     Purge: Math.max(earlyGame.missions?.Purge || 0, 1) * 1.5,
929:   },
930: } satisfies ScoringWeights;
931: 
932: const earlyPurge = {
933:   ...earlyGame,
934:   investigation: Math.max(earlyGame.investigation, 1) * 1.5,
935:   espionage: Math.max(earlyGame.espionage, 1) * 2,
936:   missions: {
937:     ...earlyGame.missions,
938:     InvestigateCouncilor: Math.max(earlyGame.missions?.InvestigateCouncilor || 0, 1) * 1.5,
939:     Crackdown: Math.max(earlyGame.missions?.Crackdown || 0, 1) * 1.5,
940:     Purge: Math.max(earlyGame.missions?.Purge || 0, 1) * 3,
941:   },
942: } satisfies ScoringWeights;
943: 
944: export const prebuiltScoringWeights: Record<string, ScoringWeights> = {
945:   "Preconfigured: Default": midLate,
946:   "Preconfigured: Early Game": earlyGame,
947:   "Preconfigured: Early Game (Investigate Focus)": earlyInvestigate,
948:   "Preconfigured: Early Game (Purge Focus)": earlyPurge,
949: };
950: 
951: export const defaultScoringWeights = prebuiltScoringWeights["Preconfigured: Default"];

(End of file - total 951 lines)
</content>
```

---

## Assistant (Build · Qwen 3.6-35B-A3B (local) · 57.5s)

_Thinking:_

Now I have a thorough understanding of the codebase. Let me create a plan and implement the tree-style navigation.

My approach:
1. Create a new `tree-nav.tsx` component with:
   - A collapsible tree navigation on the left side
   - Tree nodes that can be folders (expandable) or leaves (clickable content)
   - localStorage persistence for expanded/collapsed state and selected leaf

2. Create a `tree-content.tsx` component that maps selected leaf key to content

3. Refactor `component.tsx` to use the tree layout instead of tabs

4. Refactor each tab file (`councilors.tsx`, `fleets.tsx`, etc.) to return a tree node structure instead of a tab structure


5. I need to reconsider the architecture here. The current pattern has each tab file returning an object with a key, display name, and content component, but I need to restructure this to support a tree hierarchy. Instead of flat tabs, each category should return a tree node that can contain nested children nodes and potentially a leaf with associated content.

Now I'm thinking through the implementation details. I'll need a tree component with recursive nodes that handle expand/collapse state and click handling for leaf nodes, then build the content panel to render whatever component is associated with the selected leaf. The tricky part is that some components like the councilors scoring system have internal state that needs to be preserved when navigating between tree sections, so I'll need to be careful about how I manage that.

Let me start building the tree navigation component and the refactored main component. I see the user wants a collapsible tree navigation on the left with a hierarchical structure—Councilors as a parent node with Score Details as a subtitle, then sub-items like Existing Council, Find new, etc. Each item should be independently selectable to display its content on the right side. I'll refactor this with a tree navigation component, a content panel for rendering selected items, and update the main component to use this new layout. I need to verify the Accordion component's expand/collapse behavior with the `type="single"` prop. Since it collapses the previous item when a new one is selected, I should use `type="multiple"` instead to allow independent toggling of each node, which better suits a hierarchical tree navigation.

I'm planning to create two new files: a tree component that leverages the accordion with `type="multiple"` for independent node control, and a content panel to display selected items. Then I'll refactor the main component to use this tree structure. For the existing components, I need to decide whether to extract scoring logic into shared context or keep the heavy components self-contained—probably the latter to minimize changes. I'm going to map out the tree structure with proper hierarchy and then implement the tree navigation component along with the refactored main component that integrates it with the existing tab files. I'm settling on a tree node structure with folder nodes containing children and leaf nodes holding content. I'll create a Tree component using the Accordion primitive for expand/collapse behavior with localStorage persistence, then refactor the main component to use this tree layout with separate sidebar and content areas. I need to preserve the scoring state across tree selections, so I'll pass the scoring state through a context provider to keep the CouncilorsComponent working without major refactoring. Let me map out the implementation: create a tree navigation component with a sidebar, add a scoring context to preserve state, refactor the main component to use the tree layout, and update the councilors module to use the new tree structure while maintaining backward compatibility.

I'm settling on a simpler structure where each major category becomes a tree node with its sections as children—councilors will have items like score details, existing council, and find new, while fleets and habs will follow the same pattern with their respective sections.

For the implementation, I'll create a tree navigation component that uses the accordion for collapsible sections with localStorage persistence, then build the sidebar and refactor the main component to use this layout. The tricky part is that councilors.tsx currently manages its own accordion internally, so I need to either extract that section component and place it as a leaf node in the tree, or restructure it entirely to fit the new hierarchy.

The best approach is to extract each councilors section into its own component—ScoreDetailsComponent, ExistingCouncilComponent, NewCouncilorsComponent, CurrentOrgsComponent, and TakeoverComponent—then wire them up as individual leaves in the tree structure. This way the tree manages which section is displayed without the component needing its own accordion logic.

I need to extract the scoring calculations and state from CouncilorsComponent since they're currently computed inline, then pass those as props to each extracted component. This means the councilors.tsx file will export the computation logic separately alongside the section components.

For the other files, I'll keep them mostly intact since they already handle their own accordion sections internally. The new tree structure will just wire them up as leaf nodes in the sidebar.

Actually, I'm going to restructure this more cleanly. I'll create a unified tree node type and a tree navigation component, then update councilors.tsx to export individual sections instead of the whole accordion. The other files can stay as they are. The main component will wire everything together through the tree structure.

Let me start by defining the tree node structure...

Now I'm thinking through the component boundaries. The main changes are creating a tree navigation component and an InfoPanel for displaying selected items, then refactoring the councilors module to export individual section components. The scoring state will live in the main component and pass down through props. I'll keep the heavy logic in councilors.tsx but restructure what gets exported, and leave the other tab files mostly untouched since their sections will live as leaves in the tree.

For the tree itself, I'm planning a collapsible sidebar with a chevron icon for nodes and dots for leaves, plus active state highlighting. The Accordion component I'm using already handles the expand/collapse animations and chevron rotation automatically.

I need to add a custom variant for leaf nodes since the existing component only supports folders, and I'll keep the accordion logic in a shared utility. Then I can start implementing the tree navigation and content display components. I'm defining the tree structure with a base type that branches into either folder nodes with children or leaf nodes with content components, then mapping out how each module like Councilors and Fleets will return its tree structure.

Now I need to decide on the component architecture—whether to keep the existing `getXxxUi` functions and modify their return types, or create new functions that build the tree structure instead of just tab content.

The user wants individual items to be more focused with quick switching through the tree navigation, so I should extract each accordion section into its own component. For Councilors specifically, this means creating separate components for Score Details, Existing Council, New Councilors, Current Organizations, and Hostile Takeover, with the remaining sections following a similar pattern.

I'll extract the scoring state and computed values into a context provider so these components can access them without prop drilling. I need to be careful about how scoring state flows through the component hierarchy and ensure the context is properly initialized.

Now I'm ready to implement the refactoring. I'll start with the core infrastructure—a context provider for scoring state, a reusable tree navigation component, and the updated main layout. Then I'll update each tab file to return tree structures instead of tabs, with Councilors being the most involved change since it needs the context provider and section extraction. I'll skip extracting every single section into its own file to keep the changes manageable and minimize the overall refactoring effort. I need to make sure the context provider is only used on the client side. Then I'll map out the final structure with the tree navigation component, scoring context, and updated main component, followed by refactoring the councilors and fleets files to use the new tree structure and context where needed. I'll start by creating the tree navigation component, then move through the other files systematically, making sure each piece connects properly to the tree structure. I need to extract the scoring and rendering logic from the councilors accordion and convert each section into individual components that work as tree leaves, then create the supporting infrastructure for the new navigation structure.

Let me now read the tabs and infoTooltip components to complete my understanding:



**Tool: read**

**Input:**
```json
{
  "filePath": "terra-invicta-assistant\\src\\components\\ui\\tabs.tsx"
}
```

**Output:**
```
<path>terra-invicta-assistant\src\components\ui\tabs.tsx</path>
<type>file</type>
<content>
1: "use client"
2: 
3: import * as React from "react"
4: import { cva, type VariantProps } from "class-variance-authority"
5: import { Tabs as TabsPrimitive } from "radix-ui"
6: 
7: import { cn } from "@/lib/utils"
8: 
9: function Tabs({
10:   className,
11:   orientation = "horizontal",
12:   ...props
13: }: React.ComponentProps<typeof TabsPrimitive.Root>) {
14:   return (
15:     <TabsPrimitive.Root
16:       data-slot="tabs"
17:       data-orientation={orientation}
18:       className={cn(
19:         "gap-2 group/tabs flex data-[orientation=horizontal]:flex-col",
20:         className
21:       )}
22:       {...props}
23:     />
24:   )
25: }
26: 
27: const tabsListVariants = cva(
28:   "rounded-lg p-[3px] group-data-horizontal/tabs:h-8 data-[variant=line]:rounded-none group/tabs-list text-muted-foreground inline-flex w-fit items-center justify-center group-data-[orientation=vertical]/tabs:h-fit group-data-[orientation=vertical]/tabs:flex-col",
29:   {
30:     variants: {
31:       variant: {
32:         default: "bg-muted",
33:         line: "gap-1 bg-transparent",
34:       },
35:     },
36:     defaultVariants: {
37:       variant: "default",
38:     },
39:   }
40: )
41: 
42: function TabsList({
43:   className,
44:   variant = "default",
45:   ...props
46: }: React.ComponentProps<typeof TabsPrimitive.List> &
47:   VariantProps<typeof tabsListVariants>) {
48:   return (
49:     <TabsPrimitive.List
50:       data-slot="tabs-list"
51:       data-variant={variant}
52:       className={cn(tabsListVariants({ variant }), className)}
53:       {...props}
54:     />
55:   )
56: }
57: 
58: function TabsTrigger({
59:   className,
60:   ...props
61: }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
62:   return (
63:     <TabsPrimitive.Trigger
64:       data-slot="tabs-trigger"
65:       className={cn(
66:         "gap-1.5 rounded-md border border-transparent px-1.5 py-0.5 text-xs font-medium group-data-vertical/tabs:py-[calc(--spacing(1.25))] [&_svg:not([class*='size-'])]:size-3.5 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring text-foreground/60 hover:text-foreground dark:text-muted-foreground dark:hover:text-foreground relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center whitespace-nowrap transition-all group-data-[orientation=vertical]/tabs:w-full group-data-[orientation=vertical]/tabs:justify-start focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
67:         "group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-[state=active]:bg-transparent dark:group-data-[variant=line]/tabs-list:data-[state=active]:border-transparent dark:group-data-[variant=line]/tabs-list:data-[state=active]:bg-transparent",
68:         "data-[state=active]:bg-background dark:data-[state=active]:text-foreground dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 data-[state=active]:text-foreground",
69:         "after:bg-foreground after:absolute after:opacity-0 after:transition-opacity group-data-[orientation=horizontal]/tabs:after:inset-x-0 group-data-[orientation=horizontal]/tabs:after:bottom-[-5px] group-data-[orientation=horizontal]/tabs:after:h-0.5 group-data-[orientation=vertical]/tabs:after:inset-y-0 group-data-[orientation=vertical]/tabs:after:-right-1 group-data-[orientation=vertical]/tabs:after:w-0.5 group-data-[variant=line]/tabs-list:data-[state=active]:after:opacity-100",
70:         className
71:       )}
72:       {...props}
73:     />
74:   )
75: }
76: 
77: function TabsContent({
78:   className,
79:   ...props
80: }: React.ComponentProps<typeof TabsPrimitive.Content>) {
81:   return (
82:     <TabsPrimitive.Content
83:       data-slot="tabs-content"
84:       className={cn("text-xs/relaxed flex-1 outline-none", className)}
85:       {...props}
86:     />
87:   )
88: }
89: 
90: export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants }

(End of file - total 90 lines)
</content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "terra-invicta-assistant\\src\\components\\infoTooltip.tsx"
}
```

**Output:**
```
<path>terra-invicta-assistant\src\components\infoTooltip.tsx</path>
<type>file</type>
<content>
1: import { InfoIcon } from "lucide-react";
2: import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
3: import { ReactNode } from "react";
4: 
5: interface InfoTooltipProps {
6:   children: ReactNode;
7: }
8: 
9: export function InfoTooltip({ children }: InfoTooltipProps) {
10:   return (
11:     <Tooltip>
12:       <TooltipTrigger asChild>
13:         <button className="inline-flex items-center justify-center hover:text-muted-foreground transition-colors bg-blue-500 rounded-full ml-1">
14:           <InfoIcon className="h-4 w-4 stroke-white" />
15:         </button>
16:       </TooltipTrigger>
17:       <TooltipContent>{children}</TooltipContent>
18:     </Tooltip>
19:   );
20: }

(End of file - total 20 lines)
</content>
```

---

## Assistant (Build · Qwen 3.6-35B-A3B (local) · 17.2s)

_Thinking:_

Now I have a comprehensive understanding of the entire codebase. Let me start implementing the tree navigation.

My plan:
1. Create `tree-nav.tsx` - Tree navigation component using accordion for hierarchical navigation
2. Create `tree-content.tsx` - Main content display component 
3. Modify `scoringWeights.tsx` exports (already fine)
4. Create `councilors-context.tsx` - Context provider for councilor scoring state
5. Modify `councilors.tsx` - Extract section components and export tree structure
6. Modify `fleets.tsx` - Export tree structure (minimal changes)
7. Modify `habs.tsx` - Export tree structure (minimal changes)


8. Modify `resources.tsx` - Export tree structure (minimal changes)
9. Modify `drives.tsx` - Export tree structure (minimal changes)
10. Modify `component.tsx` - Use tree navigation + content panel

I'll start implementing these changes, beginning with the core components and then working through the individual file modifications.

I need to establish a tree node structure where each category exports its hierarchy, then build the tree navigation and content panel around it. The main component will use a context provider for scoring state, with the tree sidebar on the left and content area on the right.

I'm realizing the context approach has limitations when dealing with complex state objects like the scoring weights. Instead, I'll pass the scoring state directly as props through the tree structure, extracting each councilors section into its own component that receives the necessary data rather than relying on context. I'm outlining the file structure and implementation approach: creating a tree navigation component, refactoring the councilors module to export individual sections as tree leaves, and updating the main component to use this new structure while passing scoring state through props. Now I'll start writing the actual code, beginning with the tree navigation component and then working through each refactored file.

**Tool: todowrite**

**Input:**
```json
{
  "todos": [
    {
      "content": "Create tree-nav.tsx - reusable tree navigation component with accordion-based collapsible nodes",
      "status": "in_progress",
      "priority": "high"
    },
    {
      "content": "Create scoring-context.tsx - context for councilor scoring state",
      "status": "pending",
      "priority": "high"
    },
    {
      "content": "Refactor councilors.tsx - extract sections as tree leaves, export tree structure",
      "status": "pending",
      "priority": "high"
    },
    {
      "content": "Refactor fleets.tsx - export tree structure",
      "status": "pending",
      "priority": "medium"
    },
    {
      "content": "Refactor habs.tsx - export tree structure",
      "status": "pending",
      "priority": "medium"
    },
    {
      "content": "Refactor resources.tsx - export tree structure",
      "status": "pending",
      "priority": "medium"
    },
    {
      "content": "Refactor drives.tsx - export tree structure",
      "status": "pending",
      "priority": "medium"
    },
    {
      "content": "Refactor component.tsx - tree layout with sidebar + content panel",
      "status": "pending",
      "priority": "high"
    },
    {
      "content": "Test the app runs correctly",
      "status": "pending",
      "priority": "high"
    }
  ]
}
```

**Output:**
```
[
  {
    "content": "Create tree-nav.tsx - reusable tree navigation component with accordion-based collapsible nodes",
    "status": "in_progress",
    "priority": "high"
  },
  {
    "content": "Create scoring-context.tsx - context for councilor scoring state",
    "status": "pending",
    "priority": "high"
  },
  {
    "content": "Refactor councilors.tsx - extract sections as tree leaves, export tree structure",
    "status": "pending",
    "priority": "high"
  },
  {
    "content": "Refactor fleets.tsx - export tree structure",
    "status": "pending",
    "priority": "medium"
  },
  {
    "content": "Refactor habs.tsx - export tree structure",
    "status": "pending",
    "priority": "medium"
  },
  {
    "content": "Refactor resources.tsx - export tree structure",
    "status": "pending",
    "priority": "medium"
  },
  {
    "content": "Refactor drives.tsx - export tree structure",
    "status": "pending",
    "priority": "medium"
  },
  {
    "content": "Refactor component.tsx - tree layout with sidebar + content panel",
    "status": "pending",
    "priority": "high"
  },
  {
    "content": "Test the app runs correctly",
    "status": "pending",
    "priority": "high"
  }
]
```

---

## Assistant (Build · Qwen 3.6-35B-A3B (local) · 25.1s)

_Thinking:_

Now let me start implementing. I'll create the tree navigation component first.

**Tool: write**

**Input:**
```json
{
  "content": "\"use client\";\n\nimport * as React from \"react\";\nimport { ChevronRightIcon, ChevronDownIcon, Dot } from \"lucide-react\";\nimport { cn } from \"@/lib/utils\";\nimport { Collapsible, CollapsibleContent, CollapsibleTrigger } from \"@/components/ui/collapsible\";\n\nexport type TreeNode = TreeFolderNode | TreeLeafNode;\n\nexport interface TreeFolderNode {\n  type: \"folder\";\n  key: string;\n  label: React.ReactNode;\n  children: TreeNode[];\n  defaultValue?: boolean;\n}\n\nexport interface TreeLeafNode {\n  type: \"leaf\";\n  key: string;\n  label: React.ReactNode;\n  contentKey: string;\n  selected?: boolean;\n  onSelect?: () => void;\n}\n\nexport interface TreeNavProps {\n  nodes: TreeNode[];\n  storageKey: string;\n  className?: string;\n}\n\nexport function TreeNav({ nodes, storageKey, className }: TreeNavProps) {\n  const [expanded, setExpanded] = React.useState<Set<string>>(() => {\n    try {\n      const stored = localStorage.getItem(`treeNav-${storageKey}`);\n      if (stored) return new Set(JSON.parse(stored));\n    } catch {}\n    const defaults = new Set<string>();\n    nodes.forEach((n) => collectDefaults(n, defaults));\n    return defaults;\n  });\n\n  React.useEffect(() => {\n    try {\n      localStorage.setItem(`treeNav-${storageKey}`, JSON.stringify([...expanded]));\n    } catch {}\n  }, [expanded, storageKey]);\n\n  const toggle = React.useCallback(\n    (key: string) => {\n      setExpanded((prev) => {\n        const next = new Set(prev);\n        if (next.has(key)) next.delete(key);\n        else next.add(key);\n        return next;\n      });\n    },\n    [],\n  );\n\n  return (\n    <nav className={cn(\"flex flex-col gap-0.5\", className)}>\n      {nodes.map((node) => (\n        <TreeNodeItem key={node.key} node={node} expanded={expanded} onToggle={toggle} />\n      ))}\n    </nav>\n  );\n}\n\nfunction TreeNodeItem({\n  node,\n  expanded,\n  onToggle,\n}: {\n  node: TreeNode;\n  expanded: Set<string>;\n  onToggle: (key: string) => void;\n}) {\n  if (node.type === \"folder\") {\n    const isExpanded = expanded.has(node.key);\n    return (\n      <div className=\"flex flex-col\">\n        <Collapsible open={isExpanded} onOpenChange={() => onToggle(node.key)}>\n          <CollapsibleTrigger asChild>\n            <button\n              className={cn(\n                \"flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-muted/80\",\n                \"font-medium\",\n              )}\n            >\n              <span className=\"transition-transform duration-200\">\n                {isExpanded ? (\n                  <ChevronDownIcon className=\"h-3.5 w-3.5 shrink-0 opacity-60\" />\n                ) : (\n                  <ChevronRightIcon className=\"h-3.5 w-3.5 shrink-0 opacity-60\" />\n                )}\n              </span>\n              <span className=\"truncate\">{node.label}</span>\n            </button>\n          </CollapsibleTrigger>\n          <CollapsibleContent>\n            <div className=\"ml-3 pl-2 border-l border-muted-foreground/20 space-y-0.5\">\n              {node.children.map((child) => (\n                <TreeNodeItem key={child.key} node={child} expanded={expanded} onToggle={onToggle} />\n              ))}\n            </div>\n          </CollapsibleContent>\n        </Collapsible>\n      </div>\n    );\n  }\n\n  // leaf\n  return (\n    <button\n      onClick={node.onSelect}\n      className={cn(\n        \"flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-muted/80\",\n        \"text-muted-foreground hover:text-foreground\",\n        node.selected && \"bg-muted font-medium text-foreground\",\n      )}\n    >\n      <Dot className=\"h-3.5 w-3.5 shrink-0 opacity-60\" />\n      <span className=\"truncate\">{node.label}</span>\n    </button>\n  );\n}\n\nfunction collectDefaults(node: TreeNode, set: Set<string>) {\n  if (node.type === \"folder\" && node.defaultValue !== false) {\n    set.add(node.key);\n  }\n  if (node.type === \"folder\") {\n    for (const child of node.children) {\n      collectDefaults(child, set);\n    }\n  }\n}\n",
  "filePath": "terra-invicta-assistant\\src\\app\\game\\current\\tree-nav.tsx"
}
```

**Output:**
```
Wrote file successfully.
```

---

## Assistant (Build · Qwen 3.6-35B-A3B (local) · 7.1s)

_Thinking:_

Now let me create the scoring context and the refactored component.tsx with the tree layout. The scoring context will hold the weights state that councilor sections need.

**Tool: todowrite**

**Input:**
```json
{
  "todos": [
    {
      "content": "Create tree-nav.tsx - reusable tree navigation component with accordion-based collapsible nodes",
      "status": "completed",
      "priority": "high"
    },
    {
      "content": "Create scoring-context.tsx - context for councilor scoring state",
      "status": "in_progress",
      "priority": "high"
    },
    {
      "content": "Refactor councilors.tsx - extract sections as tree leaves, export tree structure",
      "status": "pending",
      "priority": "high"
    },
    {
      "content": "Refactor fleets.tsx - export tree structure",
      "status": "pending",
      "priority": "medium"
    },
    {
      "content": "Refactor habs.tsx - export tree structure",
      "status": "pending",
      "priority": "medium"
    },
    {
      "content": "Refactor resources.tsx - export tree structure",
      "status": "pending",
      "priority": "medium"
    },
    {
      "content": "Refactor drives.tsx - export tree structure",
      "status": "pending",
      "priority": "medium"
    },
    {
      "content": "Refactor component.tsx - tree layout with sidebar + content panel",
      "status": "pending",
      "priority": "high"
    },
    {
      "content": "Test the app runs correctly",
      "status": "pending",
      "priority": "high"
    }
  ]
}
```

**Output:**
```
[
  {
    "content": "Create tree-nav.tsx - reusable tree navigation component with accordion-based collapsible nodes",
    "status": "completed",
    "priority": "high"
  },
  {
    "content": "Create scoring-context.tsx - context for councilor scoring state",
    "status": "in_progress",
    "priority": "high"
  },
  {
    "content": "Refactor councilors.tsx - extract sections as tree leaves, export tree structure",
    "status": "pending",
    "priority": "high"
  },
  {
    "content": "Refactor fleets.tsx - export tree structure",
    "status": "pending",
    "priority": "medium"
  },
  {
    "content": "Refactor habs.tsx - export tree structure",
    "status": "pending",
    "priority": "medium"
  },
  {
    "content": "Refactor resources.tsx - export tree structure",
    "status": "pending",
    "priority": "medium"
  },
  {
    "content": "Refactor drives.tsx - export tree structure",
    "status": "pending",
    "priority": "medium"
  },
  {
    "content": "Refactor component.tsx - tree layout with sidebar + content panel",
    "status": "pending",
    "priority": "high"
  },
  {
    "content": "Test the app runs correctly",
    "status": "pending",
    "priority": "high"
  }
]
```

---

## Assistant (Build · Qwen 3.6-35B-A3B (local) · 39.7s)

_Thinking:_

Actually, I don't need a separate scoring context file. Instead of creating a context provider, I'll use a different approach: the scoring state and computed values will live in the main component and be passed down as props through the tree structure. The tree leaves that need scoring data will receive it via props.

Let me rethink the approach. Instead of a context, I'll:

1. Move the scoring state and computations into the main component (or a helper that the main component calls)
2. Pass the scoring data through props when rendering tree leaves
3. The tree component will just pass `onSelect` callbacks

But wait, the tree component doesn't know which leaves need what data. Let me think about this differently.

Option A: Pass all data through the component tree. 

The tree leaves that need scoring data will render inline in the main component, not as part of the tree-nav.tsx. The tree-nav.tsx just handles navigation, and the actual content is rendered in the main content area.

Option B: Use a different pattern. Each section component is rendered in the content panel, and the main component passes all the data as props to the content panel. The content panel renders the appropriate component based on the selected key.

Actually, Option B is cleaner. The main component will maintain state for the scoring weights and pass it along to the content panel, which then renders whichever section component matches the current selection.

So the flow is: main component manages scoring weights and selected leaf, content panel receives both and conditionally renders the right component with all necessary props. Now I'm mapping out the actual files I need to create or modify—tree-nav.tsx for the navigation, updating component.tsx with the new layout, refactoring councilors.tsx to export the scoring logic and section components, and making similar adjustments to fleets.tsx.

For the scoring state, I'll keep it in the main component and pass it down through props rather than using context, which keeps the architecture simpler and more explicit about what each component depends on.

Now I'm planning out the file structure: I need a tree navigation component and a content panel to display the selected section. For the content panel, I'll build a switch statement that renders the appropriate section based on the active key—each section gets its own component instance with the analysis and scoring weights passed through. This is straightforward but creates a large file, so I could either keep everything in one place or split the section components into separate files for better organization.

Actually, I realize the section components need access to the scoring weights, so I'll need to pass those down through props. But there's a structural issue—the councilors components are defined inside councilors.tsx, which means they won't be accessible from the content panel if I keep them scoped there. I need to restructure so these components can be imported where they're needed.

The cleanest approach is to move all the section components to the top level of councilors.tsx and export them, then import them in the content panel. I'll also need to refactor the tree structure to replace the old accordion sections with individual leaf nodes for each councilor section.

Now I'm planning out the actual changes: I'll create a content panel component that conditionally renders sections based on selection, update the tree navigation to use the new node structure, and refactor councilors.tsx to export each section component separately. The scoring weights and other shared state will live in the main component and get passed down as props to wherever they're needed.

Let me map out the file structure: I need a content panel that imports the section components, a refactored main component that holds all the state, and updated councilors.tsx where the heavy lifting components get moved to module scope and export the tree structure instead of the old accordion layout. I'll also need to update the other tab files to follow the same pattern.

Now I'm reconsidering the approach—instead of using a context provider for scoring state, I should pass the state and selectors down through props, which makes the data flow more explicit. The real issue is that the scoring calculations are tightly coupled to the UI components, so I need to extract those computations and make them available to the tree leaf components without creating circular dependencies or excessive prop drilling.

I'll restructure councilors.tsx to export the section components directly from module scope, pass the scoring state and weights through props, and update the main component to manage all the state and wiring.

Defining the component interfaces... I'm overcomplicating this. Let me step back and simplify: I'll extract the scoring logic into a hook, move the section components to module scope in councilors.tsx, and pass the scoring state as props wherever needed. The main component will manage the scoring weights and handle the state management, while the sections receive their data through the tree structure.

Now I'm ready to start implementing. I need to define the types for tree nodes, update the tree navigation component to support both folders and leaves, then create the content panel that maps selection keys to components. The trickiest part is handling the scoring state across the tree leaves—I think using a context provider in the main component is the cleanest solution here.

Setting up the context... I'm deciding between using a context provider or passing props directly through the tree structure. Context keeps things simple without prop drilling, but passing props makes dependencies explicit. I think context is the better choice here since it avoids cluttering the tree-nav component with extra props.

Now I'm mapping out the file structure: I need to create the scoring context, update the main component to provide it, refactor councilors to export sections that consume the context, and adjust the content panel to use context-aware sections. But actually, I'm reconsidering whether context is even necessary for this refactor.

Looking at the actual changes needed, I can keep the sections in councilors.tsx and pass scoring data through props instead. The main component already holds the scoring state and passes it to the old councilors component, so I just need to thread it through to the content panel and individual sections. This means extracting the scoring hook, moving section components to module scope in councilors.tsx, updating the content panel to pass props to sections, and adjusting component.tsx to wire everything together.

Actually, I'm overcomplicating this. Let me just start writing the code and figure out the details as I go. I'll create the tree navigation component, then refactor component.tsx to use it with a scoring context provider, extract the sections from councilors.tsx with context consumption, and update the other tab files to export tree structures instead of tab structures.

For the sections, I need to extract the scoring logic—extracting `scoreAndSort` and scoring helpers as module-level utilities, moving the section components outside `CouncilorsComponent`, and having them consume scoring data from the context. The main component will initialize and pass the scoring weights through the provider.

Now I'm going to start implementing this step by step. First, I'll write out the new component.tsx with the tree layout and scoring context, then refactor councilors.tsx to export the sections and tree structure, and finally update the other files.

Writing the refactored component.tsx... I see the issue now—the context is scoped to the `GameProvider` component, but I need to move the provider to the top level so `ScoringContext` is accessible throughout the tree. Let me restructure this so the context lives at the module level and the provider wraps the entire game component properly.

Now I'm ready to implement the full solution: creating the scoring context, refactoring the main component to use it as a provider, extracting the section components from councilors, and updating the tree structure to reference the new content keys.

Now let me start implementing. First, I'll create the scoring context, then refactor the component and councilors files.



**Tool: write**

**Input:**
```json
{
  "content": "\"use client\";\n\nimport { createContext, useContext, useState, useCallback, ReactNode } from \"react\";\nimport { ScoringWeights, defaultScoringWeights } from \"./scoringWeights\";\n\ninterface ScoringState {\n  weights: ScoringWeights;\n  setWeights: (w: ScoringWeights) => void;\n}\n\nconst ScoringContext = createContext<ScoringState | null>(null);\n\nexport function ScoringProvider({ children }: { children: ReactNode }) {\n  const [weights, setWeights] = useState<ScoringWeights>(() => defaultScoringWeights);\n  return (\n    <ScoringContext.Provider value={{ weights, setWeights }}>\n      {children}\n    </ScoringContext.Provider>\n  );\n}\n\nexport function useScoring() {\n  const ctx = useContext(ScoringContext);\n  if (!ctx) throw new Error(\"useScoring must be used within ScoringProvider\");\n  return ctx;\n}\n",
  "filePath": "terra-invicta-assistant\\src\\app\\game\\current\\scoring-context.tsx"
}
```

**Output:**
```
Wrote file successfully.
```

---

## Assistant (Build · Qwen 3.6-35B-A3B (local) · 72.9s)

_Thinking:_

Now let me write the refactored component.tsx with the tree layout.

**Tool: write**

**Input:**
```json
{
  "content": "\"use client\";\n\nimport { useState, useMemo } from \"react\";\nimport { ScoringProvider, useScoring } from \"./scoring-context\";\nimport { TreeNav, TreeNode } from \"./tree-nav\";\nimport { ScoringWeightsDialog } from \"./scoringWeights\";\nimport { ScoreDetails } from \"./councilors\";\nimport { Analysis } from \"@/lib/analysis\";\nimport { FleetsContent } from \"./fleets\";\nimport { HabsContent } from \"./habs\";\nimport { ResourcesContent } from \"./resources\";\nimport { DrivesContent } from \"./drives\";\n\nfunction GameContent({ analysis }: { analysis: Analysis }) {\n  const { weights, setWeights } = useScoring();\n  const [selectedKey, setSelectedKey] = useState<string | null>(null);\n  const [treeCollapsed, setTreeCollapsed] = useState(false);\n\n  const treeNodes = useMemo<TreeNode[]>(() => {\n    const nodes: TreeNode[] = [];\n\n    // Councilors\n    nodes.push({\n      type: \"folder\",\n      key: \"councilors\",\n      label: \"Councilors\",\n      defaultValue: true,\n      children: [\n        { type: \"leaf\", key: \"c-score\", label: \"Score Details\", contentKey: \"c-score\", onSelect: () => setSelectedKey(\"c-score\") },\n        { type: \"leaf\", key: \"c-existing\", label: \"Existing Council\", contentKey: \"c-existing\", onSelect: () => setSelectedKey(\"c-existing\") },\n        { type: \"leaf\", key: \"c-find-new\", label: \"Find New Councilors\", contentKey: \"c-find-new\", onSelect: () => setSelectedKey(\"c-find-new\") },\n        { type: \"leaf\", key: \"c-current-orgs\", label: \"Current Organizations\", contentKey: \"c-current-orgs\", onSelect: () => setSelectedKey(\"c-current-orgs\") },\n        { type: \"leaf\", key: \"c-takeover\", label: \"Hostile Takeover\", contentKey: \"c-takeover\", onSelect: () => setSelectedKey(\"c-takeover\") },\n        { type: \"leaf\", key: \"c-missions\", label: \"Missions\", contentKey: \"c-missions\", onSelect: () => setSelectedKey(\"c-missions\") },\n        { type: \"leaf\", key: \"c-other\", label: \"Other Councilors\", contentKey: \"c-other\", onSelect: () => setSelectedKey(\"c-other\") },\n      ],\n    });\n\n    // Fleets\n    nodes.push({\n      type: \"folder\",\n      key: \"fleets\",\n      label: \"Fleets\",\n      children: [\n        { type: \"leaf\", key: \"f-alien\", label: \"Alien Fleets\", contentKey: \"f-alien\", onSelect: () => setSelectedKey(\"f-alien\") },\n        { type: \"leaf\", key: \"f-human\", label: \"Other Human Factions\", contentKey: \"f-human\", onSelect: () => setSelectedKey(\"f-human\") },\n        { type: \"leaf\", key: \"f-player\", label: \"Player Fleets\", contentKey: \"f-player\", onSelect: () => setSelectedKey(\"f-player\") },\n        { type: \"leaf\", key: \"f-construction\", label: \"Ships Under Construction\", contentKey: \"f-construction\", onSelect: () => setSelectedKey(\"f-construction\") },\n      ],\n    });\n\n    // Habs\n    nodes.push({\n      type: \"folder\",\n      key: \"habs\",\n      label: \"Habs\",\n      children: [\n        { type: \"leaf\", key: \"h-current\", label: \"Current Bonuses\", contentKey: \"h-current\", onSelect: () => setSelectedKey(\"h-current\") },\n        { type: \"leaf\", key: \"h-future\", label: \"Future Bonuses\", contentKey: \"h-future\", onSelect: () => setSelectedKey(\"h-future\") },\n        { type: \"leaf\", key: \"h-boost-mc\", label: \"MC/Boost Summary\", contentKey: \"h-boost-mc\", onSelect: () => setSelectedKey(\"h-boost-mc\") },\n        { type: \"leaf\", key: \"h-alien-hate\", label: \"Alien Hate\", contentKey: \"h-alien-hate\", onSelect: () => setSelectedKey(\"h-alien-hate\") },\n        { type: \"leaf\", key: \"h-building\", label: \"Building Details\", contentKey: \"h-building\", onSelect: () => setSelectedKey(\"h-building\") },\n        { type: \"leaf\", key: \"h-boost-proj\", label: \"Available Boost Projects\", contentKey: \"h-boost-proj\", onSelect: () => setSelectedKey(\"h-boost-proj\") },\n        { type: \"leaf\", key: \"h-cp-projects\", label: \"Available CP Projects\", contentKey: \"h-cp-projects\", onSelect: () => setSelectedKey(\"h-cp-projects\") },\n        { type: \"leaf\", key: \"h-max-org\", label: \"Available Max Org Projects\", contentKey: \"h-max-org\", onSelect: () => setSelectedKey(\"h-max-org\") },\n        { type: \"leaf\", key: \"h-expand\", label: \"Available Expand Nations\", contentKey: \"h-expand\", onSelect: () => setSelectedKey(\"h-expand\") },\n        { type: \"leaf\", key: \"h-stealable\", label: \"Available Stealable Projects\", contentKey: \"h-stealable\", onSelect: () => setSelectedKey(\"h-stealable\") },\n        { type: \"leaf\", key: \"h-tech\", label: \"Technology Goals\", contentKey: \"h-tech\", onSelect: () => setSelectedKey(\"h-tech\") },\n        { type: \"leaf\", key: \"h-manage\", label: \"Manage Habs\", contentKey: \"h-manage\", onSelect: () => setSelectedKey(\"h-manage\") },\n        { type: \"leaf\", key: \"h-mines\", label: \"Manage Mines\", contentKey: \"h-mines\", onSelect: () => setSelectedKey(\"h-mines\") },\n      ],\n    });\n\n    // Resources\n    nodes.push({\n      type: \"folder\",\n      key: \"resources\",\n      label: \"Resources\",\n      children: [\n        { type: \"leaf\", key: \"r-transactions\", label: \"Transactions\", contentKey: \"r-transactions\", onSelect: () => setSelectedKey(\"r-transactions\") },\n        { type: \"leaf\", key: \"r-owned\", label: \"Owned Nations\", contentKey: \"r-owned\", onSelect: () => setSelectedKey(\"r-owned\") },\n        { type: \"leaf\", key: \"r-spoils\", label: \"Spoil Targets\", contentKey: \"r-spoils\", onSelect: () => setSelectedKey(\"r-spoils\") },\n        { type: \"leaf\", key: \"r-space\", label: \"MC/Boost Targets\", contentKey: \"r-space\", onSelect: () => setSelectedKey(\"r-space\") },\n        { type: \"leaf\", key: \"r-claims\", label: \"Nation Claims\", contentKey: \"r-claims\", onSelect: () => setSelectedKey(\"r-claims\") },\n        { type: \"leaf\", key: \"r-unification\", label: \"Unification Candidates\", contentKey: \"r-unification\", onSelect: () => setSelectedKey(\"r-unification\") },\n      ],\n    });\n\n    // Drives\n    nodes.push({\n      type: \"folder\",\n      key: \"drives\",\n      label: \"Drives\",\n      children: [\n        { type: \"leaf\", key: \"d-systems\", label: \"Drive Systems\", contentKey: \"d-systems\", onSelect: () => setSelectedKey(\"d-systems\") },\n        { type: \"leaf\", key: \"d-calculator\", label: \"Drive Calculator\", contentKey: \"d-calculator\", onSelect: () => setSelectedKey(\"d-calculator\") },\n      ],\n    });\n\n    return nodes;\n  }, []);\n\n  const renderContent = () => {\n    if (!selectedKey) {\n      return (\n        <div className=\"flex h-full items-center justify-center text-muted-foreground\">\n          Select an item from the navigation to view details\n        </div>\n      );\n    }\n\n    return (\n      <ContentPanel\n        analysis={analysis}\n        weights={weights}\n        setWeights={setWeights}\n        selectedKey={selectedKey}\n      />\n    );\n  };\n\n  return (\n    <div className=\"flex h-[calc(100vh-8rem)]\">\n      {!treeCollapsed && (\n        <div className=\"w-64 flex-shrink-0 overflow-y-auto border-r border-border bg-background p-2\">\n          <TreeNav nodes={treeNodes} storageKey=\"gameTree\" className=\"pb-4\" />\n          <div className=\"mt-4 px-2\">\n            <ScoringWeightsDialog weights={weights} onWeightsChange={setWeights} />\n          </div>\n        </div>\n      )}\n      <div className=\"flex flex-1 flex-col overflow-hidden\">\n        <div className=\"flex items-center border-b border-border px-3 py-1.5\">\n          <button\n            onClick={() => setTreeCollapsed((p) => !p)}\n            className=\"text-xs text-muted-foreground hover:text-foreground transition-colors\"\n          >\n            {treeCollapsed ? \"\\u2192 Show navigation\" : \"\\u2190 Hide navigation\"}\n          </button>\n          {selectedKey && (\n            <span className=\"ml-auto text-xs text-muted-foreground\">\n              {getNodeLabel(treeNodes, selectedKey) || selectedKey}\n            </span>\n          )}\n        </div>\n        <div className=\"flex-1 overflow-y-auto p-4\">\n          {renderContent()}\n        </div>\n      </div>\n    </div>\n  );\n}\n\nfunction getNodeLabel(nodes: TreeNode[], key: string): string | null {\n  for (const node of nodes) {\n    if (node.type === \"leaf\" && node.key === key) return String(node.label);\n    if (node.type === \"folder\") {\n      const found = getNodeLabel(node.children, key);\n      if (found) return found;\n    }\n  }\n  return null;\n}\n\nfunction ContentPanel({\n  analysis,\n  weights,\n  setWeights,\n  selectedKey,\n}: {\n  analysis: Analysis;\n  weights: ScoringWeights;\n  setWeights: (w: ScoringWeights) => void;\n  selectedKey: string;\n}) {\n  switch (selectedKey) {\n    // Councilors\n    case \"c-score\":\n      return <ScoreDetails analysis={analysis} weights={weights} />;\n    case \"c-existing\":\n      return <ExistingCouncil analysis={analysis} weights={weights} />;\n    case \"c-find-new\":\n      return <FindNewCouncilors analysis={analysis} weights={weights} />;\n    case \"c-current-orgs\":\n      return <CurrentOrgs analysis={analysis} weights={weights} />;\n    case \"c-takeover\":\n      return <Takeover analysis={analysis} weights={weights} />;\n    case \"c-missions\":\n      return <Missions analysis={analysis} weights={weights} />;\n    case \"c-other\":\n      return <OtherCouncilors analysis={analysis} weights={weights} />;\n\n    // Fleets\n    case \"f-alien\":\n      return <FleetsContent analysis={analysis} section=\"alien\" />;\n    case \"f-human\":\n      return <FleetsContent analysis={analysis} section=\"human\" />;\n    case \"f-player\":\n      return <FleetsContent analysis={analysis} section=\"player\" />;\n    case \"f-construction\":\n      return <FleetsContent analysis={analysis} section=\"construction\" />;\n\n    // Habs\n    case \"h-current\":\n      return <HabsContent analysis={analysis} section=\"current-bonuses\" />;\n    case \"h-future\":\n      return <HabsContent analysis={analysis} section=\"future-bonuses\" />;\n    case \"h-boost-mc\":\n      return <HabsContent analysis={analysis} section=\"boost-mc-summary\" />;\n    case \"h-alien-hate\":\n      return <HabsContent analysis={analysis} section=\"alien-hate\" />;\n    case \"h-building\":\n      return <HabsContent analysis={analysis} section=\"building-details\" />;\n    case \"h-boost-proj\":\n      return <HabsContent analysis={analysis} section=\"available-boost-projects\" />;\n    case \"h-cp-projects\":\n      return <HabsContent analysis={analysis} section=\"available-cp-projects\" />;\n    case \"h-max-org\":\n      return <HabsContent analysis={analysis} section=\"available-max-org-projects\" />;\n    case \"h-expand\":\n      return <HabsContent analysis={analysis} section=\"available-expand-nation-projects\" />;\n    case \"h-stealable\":\n      return <HabsContent analysis={analysis} section=\"available-stealable-projects\" />;\n    case \"h-tech\":\n      return <HabsContent analysis={analysis} section=\"technology-goals\" />;\n    case \"h-manage\":\n      return <HabsContent analysis={analysis} section=\"habs\" />;\n    case \"h-mines\":\n      return <HabsContent analysis={analysis} section=\"mines\" />;\n\n    // Resources\n    case \"r-transactions\":\n      return <ResourcesContent analysis={analysis} section=\"transactions\" />;\n    case \"r-owned\":\n      return <ResourcesContent analysis={analysis} section=\"owned\" />;\n    case \"r-spoils\":\n      return <ResourcesContent analysis={analysis} section=\"spoils\" />;\n    case \"r-space\":\n      return <ResourcesContent analysis={analysis} section=\"space\" />;\n    case \"r-claims\":\n      return <ResourcesContent analysis={analysis} section=\"nation-claims\" />;\n    case \"r-unification\":\n      return <ResourcesContent analysis={analysis} section=\"unification-candidates\" />;\n\n    // Drives\n    case \"d-systems\":\n      return <DrivesContent analysis={analysis} section=\"drive-table\" />;\n    case \"d-calculator\":\n      return <DrivesContent analysis={analysis} section=\"drive-calculator\" />;\n\n    default:\n      return <div className=\"text-muted-foreground\">Unknown section: {selectedKey}</div>;\n  }\n}\n\n// Import section components that are defined in councilors.tsx\nimport {\n  ExistingCouncil,\n  FindNewCouncilors,\n  CurrentOrgs,\n  Takeover,\n  Missions,\n  OtherCouncilors,\n} from \"./councilors\";\n\nexport function RenderGameComponent({ analysis }: { analysis: Analysis }) {\n  return (\n    <ScoringProvider>\n      <div className=\"mx-2\">\n        <div className=\"mb-2 flex items-center gap-4 text-xs text-muted-foreground\">\n          <span>Game: {analysis.fileName}</span>\n          <span>({analysis.lastModified?.toLocaleDateString()})</span>\n          <span>Game date: {analysis.gameCurrentDateTimeFormatted.split(\" \")[0]}</span>\n          <span className=\"font-medium text-foreground\">Faction: {analysis.playerFaction.displayName}</span>\n        </div>\n        <GameContent analysis={analysis} />\n      </div>\n    </ScoringProvider>\n  );\n}\n",
  "filePath": "terra-invicta-assistant\\src\\app\\game\\current\\component.tsx"
}
```

**Output:**
```
Wrote file successfully.
```

---

## Assistant (Build · Qwen 3.6-35B-A3B (local) · 7.3s)

_Thinking:_

Now I need to update the councilors.tsx file to export the section components. The section components need to be moved outside of `CouncilorsComponent` and exported. Let me carefully extract each section component and update the file.

**Tool: todowrite**

**Input:**
```json
{
  "todos": [
    {
      "content": "Create tree-nav.tsx - reusable tree navigation component with accordion-based collapsible nodes",
      "status": "completed",
      "priority": "high"
    },
    {
      "content": "Create scoring-context.tsx - context for councilor scoring state",
      "status": "completed",
      "priority": "high"
    },
    {
      "content": "Refactor councilors.tsx - extract sections as tree leaves, export tree structure",
      "status": "in_progress",
      "priority": "high"
    },
    {
      "content": "Refactor fleets.tsx - export tree structure",
      "status": "pending",
      "priority": "medium"
    },
    {
      "content": "Refactor habs.tsx - export tree structure",
      "status": "pending",
      "priority": "medium"
    },
    {
      "content": "Refactor resources.tsx - export tree structure",
      "status": "pending",
      "priority": "medium"
    },
    {
      "content": "Refactor drives.tsx - export tree structure",
      "status": "pending",
      "priority": "medium"
    },
    {
      "content": "Refactor component.tsx - tree layout with sidebar + content panel",
      "status": "completed",
      "priority": "high"
    },
    {
      "content": "Test the app runs correctly",
      "status": "pending",
      "priority": "high"
    }
  ]
}
```

**Output:**
```
[
  {
    "content": "Create tree-nav.tsx - reusable tree navigation component with accordion-based collapsible nodes",
    "status": "completed",
    "priority": "high"
  },
  {
    "content": "Create scoring-context.tsx - context for councilor scoring state",
    "status": "completed",
    "priority": "high"
  },
  {
    "content": "Refactor councilors.tsx - extract sections as tree leaves, export tree structure",
    "status": "in_progress",
    "priority": "high"
  },
  {
    "content": "Refactor fleets.tsx - export tree structure",
    "status": "pending",
    "priority": "medium"
  },
  {
    "content": "Refactor habs.tsx - export tree structure",
    "status": "pending",
    "priority": "medium"
  },
  {
    "content": "Refactor resources.tsx - export tree structure",
    "status": "pending",
    "priority": "medium"
  },
  {
    "content": "Refactor drives.tsx - export tree structure",
    "status": "pending",
    "priority": "medium"
  },
  {
    "content": "Refactor component.tsx - tree layout with sidebar + content panel",
    "status": "completed",
    "priority": "high"
  },
  {
    "content": "Test the app runs correctly",
    "status": "pending",
    "priority": "high"
  }
]
```

---

## Assistant (Build · Qwen 3.6-35B-A3B (local) · 245.9s)

_Thinking:_

Now I need to rewrite councilors.tsx. This is the most complex file. I need to:

1. Keep the utility functions (CouncilorTableHeader, OrgTableHeader, CouncilorTableRow, OrgTableRow, scoreAndSort, getScore, etc.)
2. Move the section components (ScoreDetails, ExistingCouncil, FindNewCouncilors, CurrentOrgs, Takeover, Missions, OtherCouncilors) to module scope
3. Have each section component accept props (analysis, weights)
4. Remove the old CouncilorsComponent that wrapped everything in an accordion
5. Export the section components for use in component.tsx's ContentPanel
6. Remove or modify `getCouncilorsUi` since we're using tree structure now
7. Keep the `ScoringWeightsDialog` import working

Let me carefully write this out, taking the relevant pieces from the original file and reorganizing them.

The section components need access to:
- `scoreAndSort` (utility function)
- `getScore`, `getBaseCouncilorScore`, `getModifiedCouncilorScore`, `getOrganizationScore` 
- `CouncilorTableRow`, `OrgTableRow` (table row components)
- `CouncilorTableHeader`, `OrgTableHeader` (table header components)
- `combineEffects`, `ShowEffects`
- Various analysis data

Let me write the new councilors.tsx:

**Tool: write**

**Input:**
```json
{
  "content": "\"use client\";\n\nimport { ShowEffects, combineEffects, ShowEffectsProps } from \"@/components/showEffects\";\nimport { AccordionContent, AccordionItem, AccordionTrigger } from \"@/components/ui/accordion\";\nimport { SmartAccordion } from \"@/components/ui/smart-accordion\";\nimport { Collapsible, CollapsibleContent, CollapsibleTrigger } from \"@/components/ui/collapsible\";\nimport { Tooltip, TooltipContent, TooltipTrigger } from \"@/components/ui/tooltip\";\nimport { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from \"@/components/ui/table\";\nimport { Analysis } from \"@/lib/analysis\";\nimport { MissionDataName } from \"@/lib/template-types-generated\";\nimport { MinusCircleIcon, PlusCircleIcon } from \"lucide-react\";\nimport { ScoringWeights } from \"./scoringWeights\";\nimport { Administration, MissionIcons, TraitIcons, UnknownIcon } from \"@/components/icons\";\nimport { Tabs, TabsContent, TabsList, TabsTrigger } from \"@/components/ui/tabs\";\nimport { SmartTabs } from \"@/components/ui/smart-tabs\";\nimport { twMerge } from \"tailwind-merge\";\nimport { useScoring } from \"./scoring-context\";\n\n// ─── Table Components ───\n\nexport function CouncilorTableHeader({ hasOrgs }: { hasOrgs?: boolean }) {\n  return (\n    <TableHeader>\n      <TableRow>\n        <TableHead>Name</TableHead>\n        <TableHead>Modified Stats</TableHead>\n        {hasOrgs && <TableHead>Org Tiers</TableHead>}\n        <TableHead>Monthly Effects</TableHead>\n        <TableHead>Priorities</TableHead>\n        <TableHead>Science</TableHead>\n        <TableHead>Missions</TableHead>\n        <TableHead>Score</TableHead>\n        <TableHead>NM Score</TableHead>\n        <TableHead>CP Cap</TableHead>\n      </TableRow>\n    </TableHeader>\n  );\n}\n\nfunction OrgTableHeader({ costHeader }: { costHeader?: string }) {\n  return (\n    <TableHeader>\n      <TableRow>\n        <TableHead>Org Name</TableHead>\n        <TableHead>Requirements</TableHead>\n        <TableHead>Tier</TableHead>\n        {costHeader ? <TableHead>{costHeader}</TableHead> : <TableHead>Purchase / Transfer</TableHead>}\n        <TableHead>Monthly</TableHead>\n        <TableHead>Effects</TableHead>\n        <TableHead>Score</TableHead>\n        <TableHead>NM Score</TableHead>\n      </TableRow>\n    </TableHeader>\n  );\n}\n\nfunction CouncilorTableRow({\n  councilor,\n  stats,\n  label,\n  hasOrgs,\n  highlightMissionClassName,\n}: {\n  councilor: Analysis[\"playerCouncilors\"][number] & { score?: ScoreResult };\n  stats: Analysis[\"playerCouncilors\"][number][\"effectsWithOrgsAndAugments\"];\n  label: string;\n  hasOrgs?: boolean;\n  highlightMissionClassName?: (missionName: MissionDataName) => string | undefined;\n}) {\n  const admin = Math.min(25, Math.max(0, (stats.administration || 0) + (stats.Administration || 0)));\n  const orgTiers = councilor.orgs.reduce((a, b) => a + b.tier, 0);\n  const cpCap =\n    Math.min(25, Math.max(0, stats.persuasion || 0) + Math.max(0, stats.Persuasion || 0)) +\n    Math.min(25, Math.max(0, stats.command || 0) + Math.max(0, stats.Command || 0)) +\n    Math.min(25, Math.max(0, stats.administration || 0) + Math.max(0, stats.Administration || 0));\n  return (\n    <TableRow key={`${councilor.id}-${label}`}>\n      <TableCell>{label}</TableCell>\n      <TableCell>\n        <ShowEffects\n          persuasion={stats.persuasion} command={stats.command} investigation={stats.investigation}\n          espionage={stats.espionage} administration={stats.administration} science={stats.science}\n          security={stats.security} Persuasion={stats.Persuasion} Command={stats.Command}\n          Investigation={stats.Investigation} Espionage={stats.Espionage} Administration={stats.Administration}\n          Science={stats.Science} Security={stats.Security} ApparentLoyalty={stats.ApparentLoyalty}\n          Loyalty={stats.Loyalty} maxLoyalty={stats.maxLoyalty} xpModifier={stats.xpModifier}\n          xp={stats.xp} traitTemplateNames={stats.traitTemplateNames} typeTemplateName={stats.typeTemplateName}\n          playerIntel={stats.playerIntel} playerMaxIntel={stats.playerMaxIntel}\n          lastRecordedLoyalty={stats.lastRecordedLoyalty}\n        />\n      </TableCell>\n      {hasOrgs && (\n        <TableCell>\n          <ShowEffects tier={stats.tier} highlightTier={orgTiers < admin} />\n        </TableCell>\n      )}\n      <TableCell>\n        <ShowEffects\n          incomeBoost_month={stats.incomeBoost_month} incomeMoney_month={stats.incomeMoney_month}\n          incomeInfluence_month={stats.incomeInfluence_month} incomeOps_month={stats.incomeOps_month}\n          incomeMissionControl={stats.incomeMissionControl} incomeResearch_month={stats.incomeResearch_month}\n          projectCapacityGranted={stats.projectCapacityGranted}\n        />\n      </TableCell>\n      <TableCell>\n        <span className=\"text-wrap leading-6 -my-2 inline-block\">\n          <ShowEffects\n            economyBonus={stats.economyBonus} welfareBonus={stats.welfareBonus}\n            environmentBonus={stats.environmentBonus} knowledgeBonus={stats.knowledgeBonus}\n            governmentBonus={stats.governmentBonus} unityBonus={stats.unityBonus}\n            militaryBonus={stats.militaryBonus} oppressionBonus={stats.oppressionBonus}\n            spoilsBonus={stats.spoilsBonus} spaceDevBonus={stats.spaceDevBonus}\n            spaceflightBonus={stats.spaceflightBonus} MCBonus={stats.MCBonus} miningBonus={stats.miningBonus}\n          />\n        </span>\n      </TableCell>\n      <TableCell>\n        <span className=\"text-wrap leading-6 -my-2 inline-block\">\n          <ShowEffects councilorTechBonus={stats.councilorTechBonus} techBonuses={stats.techBonuses} />\n        </span>\n      </TableCell>\n      <TableCell>\n        <span className=\"text-wrap leading-6 -my-2 inline-block\">\n          <ShowEffects missionsGrantedNames={stats.missionsGrantedNames} highlightMissionClassName={highlightMissionClassName} />\n        </span>\n      </TableCell>\n      {councilor.score === undefined ? null : (\n        <>\n          <TableCell>\n            <Tooltip>\n              <TooltipTrigger>{councilor.score.value?.toFixed(2)}</TooltipTrigger>\n              <TooltipContent align=\"end\" className=\"max-w-auto\">\n                <pre className=\"p-2\">{councilor.score.details}</pre>\n              </TooltipContent>\n            </Tooltip>\n          </TableCell>\n          <TableCell>{councilor.score.noMissionScore?.toFixed(2)}</TableCell>\n          <TableCell>{cpCap?.toFixed(0)}</TableCell>\n        </>\n      )}\n    </TableRow>\n  );\n}\n\nconst orgTransferFactor = 0.2;\n\nfunction OrgTableRow({\n  org,\n  playerNationIds,\n  playerTraits,\n  highlightMissionClassName,\n  isTakeover,\n}: {\n  org: Analysis[\"playerAvailableOrgs\"][number] & {\n    type?: string;\n    score?: ScoreResult;\n    councilor?: string;\n    councilorId?: number;\n  };\n  playerNationIds: Set<string>;\n  playerTraits: Set<string>;\n  highlightMissionClassName?: (missionName: MissionDataName) => string | undefined;\n  isTakeover?: boolean;\n}) {\n  const missingRequiredTraits = org.template?.requiredOwnerTraits?.filter((t) => !playerTraits.has(t)) || [];\n  function traitIcon(trait: MissionDataName, Fallback: typeof PlusCircleIcon) {\n    return TraitIcons[trait as keyof typeof TraitIcons] || Fallback;\n  }\n  return (\n    <TableRow key={org.id} className={twMerge(org.isAdminOrg ? \"bg-green-100\" : \"\", org.type === \"unassigned\" ? \"bg-yellow-100\" : \"\")}>\n      <TableCell>{org.displayName}</TableCell>\n      <TableCell>\n        {org.template?.requiresNationality && (\n          <span className=\"mr-1\" title={`Required Nation: ${org.homeNationName || \"\"}`}>\n            {playerNationIds.has(String(org.homeNationId)) ? (\n              <PlusCircleIcon className=\"inline h-4 w-4 stroke-green-700 -mt-1 bg-transparent\" />\n            ) : (\n              <MinusCircleIcon className=\"inline h-4 w-4 stroke-destructive -mt-1\" />\n            )}\n          </span>\n        )}\n        {org.template?.requiredOwnerTraits && (\n          <span className=\"mr-1\" title={\"Required Traits: \" + org.template.requiredOwnerTraits.join(\", \")}>\n            {missingRequiredTraits.length === 0\n              ? org.template.requiredOwnerTraits.map((trait, ix) => {\n                  const Icon = traitIcon(trait as MissionDataName, PlusCircleIcon);\n                  return <Icon key={ix} className=\"inline h-4 w-4 stroke-green-700 -mt-1\" />;\n                })\n              : missingRequiredTraits.map((trait, ix) => {\n                  const Icon = traitIcon(trait as MissionDataName, MinusCircleIcon);\n                  return <Icon key={ix} className=\"inline h-4 w-4 stroke-destructive -mt-1\" />;\n                })}\n          </span>\n        )}\n        {org.template?.prohibitedOwnerTraits && (\n          <span className=\"mr-1\" title={\"Prohibited Traits: \" + org.template.prohibitedOwnerTraits.join(\", \")}>\n            {org.template.prohibitedOwnerTraits.map((trait, ix) => {\n              const Icon = traitIcon(trait as MissionDataName, MinusCircleIcon);\n              return <Icon key={ix} className=\"inline h-4 w-4 stroke-blue-700 -mt-1\" />;\n            })}\n          </span>\n        )}\n      </TableCell>\n      <TableCell>\n        <ShowEffects tier={org.tier} />\n      </TableCell>\n      <TableCell>\n        {org.type === \"unassigned\" && \"T \"}\n        {org.type === \"available\" || org.type === \"unassigned\" ? (\n          <ShowEffects\n            costMoney={(org.costMoney || 0) * orgTransferFactor}\n            costInfluence={(org.costInfluence || 0) * orgTransferFactor}\n            costOps={(org.costOps || 0) * orgTransferFactor}\n            costBoost={(org.costBoost || 0) * orgTransferFactor}\n          />\n        ) : org.type == \"stealable\" && isTakeover ? (\n          (() => {\n            const target = org as any as Analysis[\"playerStealableOrgs\"][number];\n            return (\n              <>\n                {target.councilor ?? \"Unassigned\"} from {target.faction?.displayName}, Admin: {target.admin} +\n                takeoverDefense: {target.takeoverDefense}\n              </>\n            );\n          })()\n        ) : org.type === \"used\" ? (\n          <>{org.councilor ?? \"Unassigned\"}</>\n        ) : null}\n      </TableCell>\n      <TableCell>\n        <ShowEffects\n          incomeBoost_month={org.incomeBoost_month} incomeMoney_month={org.incomeMoney_month}\n          incomeInfluence_month={org.incomeInfluence_month} incomeOps_month={org.incomeOps_month}\n          incomeMissionControl={org.incomeMissionControl} incomeResearch_month={org.incomeResearch_month}\n          projectCapacityGranted={org.projectCapacityGranted}\n        />\n      </TableCell>\n      <TableCell>\n        <ShowEffects\n          persuasion={org.persuasion} command={org.command} investigation={org.investigation}\n          espionage={org.espionage} administration={org.administration} science={org.science}\n          security={org.security} economyBonus={org.economyBonus} welfareBonus={org.welfareBonus}\n          environmentBonus={org.environmentBonus} knowledgeBonus={org.knowledgeBonus}\n          governmentBonus={org.governmentBonus} unityBonus={org.unityBonus}\n          militaryBonus={org.militaryBonus} oppressionBonus={org.oppressionBonus}\n          spoilsBonus={org.spoilsBonus} spaceDevBonus={org.spaceDevBonus}\n          spaceflightBonus={org.spaceflightBonus} MCBonus={org.MCBonus} miningBonus={org.miningBonus}\n          techBonuses={org.template?.techBonuses}\n          missionsGrantedNames={org.template?.missionsGrantedNames || []}\n          highlightMissionClassName={highlightMissionClassName}\n        />\n      </TableCell>\n      {org.score === undefined ? null : (\n        <>\n          <TableCell>\n            <Tooltip>\n              <TooltipTrigger>{org.score.value?.toFixed(2)}</TooltipTrigger>\n              <TooltipContent align=\"end\" className=\"max-w-auto\">\n                <pre className=\"p-2\">{org.score.details}</pre>\n              </TooltipContent>\n            </Tooltip>\n          </TableCell>\n          <TableCell>{org.score.noMissionScore?.toFixed(2)}</TableCell>\n        </>\n      )}\n    </TableRow>\n  );\n}\n\n// ─── Scoring Types & Utilities ───\n\ninterface ScoreResult {\n  value: number;\n  noMissionScore: number;\n  details: string;\n}\n\nfunction getScore(\n  props: ShowEffectsProps,\n  weights: ScoringWeights,\n  haveMissions: Map<MissionDataName, number>,\n  ignoreTier: boolean = false,\n): ScoreResult {\n  let totalScore = 0;\n  const details: string[] = [];\n\n  const addScore = (name: string, value: number | undefined, weight: number | undefined, noNegative?: boolean) => {\n    let actualValue = value || 0;\n    if (noNegative) actualValue = Math.max(0, actualValue);\n    const actualWeight = weight ?? 0;\n    if (!actualValue || !actualWeight) return;\n    const contribution = actualValue * actualWeight;\n    totalScore += contribution;\n    details.push(\n      `${name}: ${parseFloat(actualValue.toFixed(2))} × ${parseFloat(actualWeight.toFixed(3))} = ${contribution.toFixed(3)}`\n    );\n  };\n\n  addScore(\"persuasion\", props.persuasion, weights.persuasion, true);\n  addScore(\"command\", props.command, weights.command, true);\n  addScore(\"investigation\", props.investigation, weights.investigation, true);\n  addScore(\"espionage\", props.espionage, weights.espionage, true);\n  addScore(\"administration\", props.administration, weights.administration, true);\n  addScore(\"science\", props.science, weights.science, true);\n  addScore(\"security\", props.security, weights.security, true);\n  addScore(\"Persuasion\", props.Persuasion, weights.persuasion, true);\n  addScore(\"Command\", props.Command, weights.command, true);\n  addScore(\"Investigation\", props.Investigation, weights.investigation, true);\n  addScore(\"Espionage\", props.Espionage, weights.espionage, true);\n  addScore(\"Administration\", props.Administration, weights.administration, true);\n  addScore(\"Science\", props.Science, weights.science, true);\n  addScore(\"Security\", props.Security, weights.security, true);\n  addScore(\"xpModifier\", props.xpModifier, weights.xpModifier);\n  addScore(\"xp\", props.xp, weights.xp);\n  addScore(\"incomeBoost_month\", props.incomeBoost_month, weights.incomeBoost_month);\n  addScore(\"incomeMoney_month\", props.incomeMoney_month, weights.incomeMoney_month);\n  addScore(\"incomeInfluence_month\", props.incomeInfluence_month, weights.incomeInfluence_month);\n  addScore(\"incomeOps_month\", props.incomeOps_month, weights.incomeOps_month);\n  addScore(\"incomeMissionControl\", props.incomeMissionControl, weights.incomeMissionControl);\n  addScore(\"incomeResearch_month\", props.incomeResearch_month, weights.incomeResearch_month);\n  addScore(\"projectCapacityGranted\", props.projectCapacityGranted, weights.projectCapacityGranted);\n  addScore(\"costMoney\", props.costMoney, weights.costMoney);\n  addScore(\"costInfluence\", props.costInfluence, weights.costInfluence);\n  addScore(\"costOps\", props.costOps, weights.costOps);\n  addScore(\"costBoost\", props.costBoost, weights.costBoost);\n  addScore(\"economyBonus\", props.economyBonus, weights.economyBonus);\n  addScore(\"welfareBonus\", props.welfareBonus, weights.welfareBonus);\n  addScore(\"environmentBonus\", props.environmentBonus, weights.environmentBonus);\n  addScore(\"knowledgeBonus\", props.knowledgeBonus, weights.knowledgeBonus);\n  addScore(\"governmentBonus\", props.governmentBonus, weights.governmentBonus);\n  addScore(\"unityBonus\", props.unityBonus, weights.unityBonus);\n  addScore(\"militaryBonus\", props.militaryBonus, weights.militaryBonus);\n  addScore(\"oppressionBonus\", props.oppressionBonus, weights.oppressionBonus);\n  addScore(\"spoilsBonus\", props.spoilsBonus, weights.spoilsBonus);\n  addScore(\"spaceDevBonus\", props.spaceDevBonus, weights.spaceDevBonus);\n  addScore(\"spaceflightBonus\", props.spaceflightBonus, weights.spaceflightBonus);\n  addScore(\"MCBonus\", props.MCBonus, weights.MCBonus);\n  addScore(\"miningBonus\", props.miningBonus, weights.miningBonus);\n\n  if (weights.councilorTechBonus && props?.councilorTechBonus) {\n    for (const { category, bonus } of props.councilorTechBonus) {\n      const weight = weights.councilorTechBonus[category as keyof typeof weights.councilorTechBonus!];\n      addScore(`councilorTechBonus[${category}]`, bonus, weight);\n    }\n  }\n  if (weights.techBonuses && props?.techBonuses) {\n    for (const { category, bonus } of props.techBonuses) {\n      const weight = weights.techBonuses[category as keyof typeof weights.techBonuses!];\n      addScore(`techBonus[${category}]`, bonus, weight);\n    }\n  }\n\n  let noMissionScore = totalScore;\n  if (weights.missions && props?.missionsGrantedNames) {\n    for (const missionName of props.missionsGrantedNames) {\n      const weight = weights.missions[missionName as MissionDataName];\n      addScore(`mission[${missionName}]`, 1, weight);\n      if (weights.extraWeightForMissingMissions && (haveMissions.get(missionName) || 0) === 0) {\n        totalScore += weights.extraWeightForMissingMissions;\n        details.push(`mission[${missionName}]: missing bonus × ${weights.extraWeightForMissingMissions.toFixed(3)} = ${weights.extraWeightForMissingMissions.toFixed(3)}`);\n      }\n      if (weights.extraWeightForSingleMissions && (haveMissions.get(missionName) || 0) === 1) {\n        totalScore += weights.extraWeightForSingleMissions;\n        details.push(`mission[${missionName}]: single bonus × ${weights.extraWeightForSingleMissions.toFixed(3)} = ${weights.extraWeightForSingleMissions.toFixed(3)}`);\n      }\n    }\n  }\n\n  const tier = props.tier || 1;\n  let finalScore = totalScore;\n  if (tier > 1 && !ignoreTier) {\n    const tierFactor = Math.pow(tier, weights.orgTierExponent);\n    finalScore = totalScore / tierFactor;\n    noMissionScore /= tierFactor;\n    details.push(`Subtotal: ${totalScore.toFixed(3)}`);\n    details.push(`Divided by ${tierFactor.toFixed(2)} for tier ${tier}: ${finalScore.toFixed(3)}`);\n  }\n\n  return { value: finalScore, noMissionScore, details: details.join(\"\\n\") };\n}\n\nfunction getBaseCouncilorScore(\n  councilor: Analysis[\"playerCouncilors\"][number],\n  weights: ScoringWeights,\n  haveMissions: Map<MissionDataName, number>,\n): ScoreResult {\n  return getScore(councilor.effectsBaseAndUnaugmentedTraits, weights, haveMissions, true);\n}\n\nfunction getModifiedCouncilorScore(\n  councilor: Analysis[\"playerCouncilors\"][number],\n  weights: ScoringWeights,\n  haveMissions: Map<MissionDataName, number>,\n): ScoreResult {\n  return getScore(councilor.effectsWithOrgsAndAugments, weights, haveMissions, true);\n}\n\nfunction getOrganizationScore(\n  org: Analysis[\"playerAvailableOrgs\"][number] & { type: string },\n  weights: ScoringWeights,\n  haveMissions: Map<MissionDataName, number>,\n): ScoreResult {\n  return getScore(\n    {\n      ...org,\n      techBonuses: org.template?.techBonuses,\n      missionsGrantedNames: org.template?.missionsGrantedNames || [],\n      ...(org.type === \"available\"\n        ? {}\n        : {\n            costMoney: (org.costMoney || 0) * orgTransferFactor,\n            costInfluence: (org.costInfluence || 0) * orgTransferFactor,\n            costOps: (org.costOps || 0) * orgTransferFactor,\n            costBoost: (org.costBoost || 0) * orgTransferFactor,\n          }),\n    },\n    weights,\n    haveMissions,\n  );\n}\n\nfunction scoreAndSort<T>(\n  items: T[],\n  weights: ScoringWeights,\n  haveMissions: Map<MissionDataName, number>,\n  scoreFn: (item: T, weights: ScoringWeights, haveMissions: Map<MissionDataName, number>) => ScoreResult,\n  scoreSort: \"value\" | \"noMissionScore\" = \"value\",\n) {\n  const scoredItems = items.map((item) => {\n    const scoreResult = scoreFn(item, weights, haveMissions);\n    return { ...item, score: scoreResult };\n  });\n  scoredItems.sort((a, b) => (b as any).score[scoreSort] - (a as any).score[scoreSort]);\n  return scoredItems;\n}\n\n// ─── Section Components ───\n\ninterface ScoreDetailsProps {\n  analysis: Analysis;\n  weights: ScoringWeights;\n}\n\nexport function ScoreDetails({ analysis, weights }: ScoreDetailsProps) {\n  const { playerMissionCounts, playerCouncilors, playerAvailableOrgs, playerUnassignedOrgs } = analysis;\n\n  const scoredModifiedCouncilors = scoreAndSort(playerCouncilors, weights, playerMissionCounts, getModifiedCouncilorScore);\n  const scoredAvailableCouncilors = scoreAndSort(analysis.playerAvailableCouncilors, weights, playerMissionCounts, getBaseCouncilorScore);\n  const scoredBaseCouncilors = scoreAndSort(playerCouncilors, weights, playerMissionCounts, getBaseCouncilorScore);\n  const scoredOrgs = scoreAndSort(\n    analysis.playerAvailableOrgs.map((i) => ({ type: \"available\", ...i }))\n      .concat(analysis.playerUnassignedOrgs.map((i) => ({ type: \"unassigned\", ...i }))),\n    weights, playerMissionCounts, getOrganizationScore, \"noMissionScore\"\n  ).toSorted((a, b) => (a.isAdminOrg === b.isAdminOrg ? 0 : a.isAdminOrg ? -1 : 1));\n  const usedOrgs = playerCouncilors.flatMap((c) => c.orgs.map((o) => ({ ...o, type: \"used\", councilor: c.displayName, councilorId: c.id })));\n  const scoredUsedOrgs = scoreAndSort(usedOrgs, weights, playerMissionCounts, getOrganizationScore);\n  const scoredOwnedOrgs = scoreAndSort(\n    analysis.playerUnassignedOrgs.map((i) => ({ type: \"unassigned\", ...i })).concat(usedOrgs),\n    weights, playerMissionCounts, getOrganizationScore\n  );\n\n  const bestAvailableCouncilor = scoredAvailableCouncilors[0]?.score.value;\n  const worstExistingCouncilor = scoredBaseCouncilors[scoredBaseCouncilors.length - 1]?.score.value;\n  const bestAvailableOrg = scoredOrgs[0]?.score.value;\n  const worstExistingOrg = scoredUsedOrgs[scoredUsedOrgs.length - 1]?.score.value;\n\n  const councilEffects = scoredModifiedCouncilors.reduce((acc, c) => combineEffects(acc, c.effectsWithOrgsAndAugments), {} as ShowEffectsProps);\n\n  function currentHighlightMissionClassName(missionName: MissionDataName) {\n    const count = playerMissionCounts.get(missionName) || 0;\n    if (count === 2) return \"bg-yellow-300/50\";\n    if (count === 1) return \"bg-red-300/50\";\n  }\n\n  return (\n    <div className=\"space-y-4\">\n      <div className=\"rounded-lg border p-4 space-y-2\">\n        <h3 className=\"font-semibold\">Summary</h3>\n        <p>Councilors: {worstExistingCouncilor?.toFixed(0)} (worst) vs {bestAvailableCouncilor?.toFixed(0)} (best available)</p>\n        <p>Organizations: {worstExistingOrg?.toFixed(2)} (worst) vs {bestAvailableOrg?.toFixed(2)} (best available)</p>\n      </div>\n\n      <div>\n        <h3 className=\"font-semibold mb-2\">Current Council Effects</h3>\n        <ShowEffects\n          incomeBoost_month={councilEffects.incomeBoost_month} incomeMoney_month={councilEffects.incomeMoney_month}\n          incomeInfluence_month={councilEffects.incomeInfluence_month} incomeOps_month={councilEffects.incomeOps_month}\n          incomeMissionControl={councilEffects.incomeMissionControl} incomeResearch_month={councilEffects.incomeResearch_month}\n          projectCapacityGranted={councilEffects.projectCapacityGranted}\n          economyBonus={councilEffects.economyBonus} welfareBonus={councilEffects.welfareBonus}\n          environmentBonus={councilEffects.environmentBonus} knowledgeBonus={councilEffects.knowledgeBonus}\n          governmentBonus={councilEffects.governmentBonus} unityBonus={councilEffects.unityBonus}\n          militaryBonus={councilEffects.militaryBonus} oppressionBonus={councilEffects.oppressionBonus}\n          spoilsBonus={councilEffects.spoilsBonus} spaceDevBonus={councilEffects.spaceDevBonus}\n          spaceflightBonus={councilEffects.spaceflightBonus} MCBonus={councilEffects.MCBonus} miningBonus={councilEffects.miningBonus}\n          councilorTechBonus={councilEffects.councilorTechBonus} techBonuses={councilEffects.techBonuses}\n        />\n      </div>\n\n      <div>\n        <h3 className=\"font-semibold mb-2\">Modified Councilors (with orgs)</h3>\n        <Table>\n          <CouncilorTableHeader hasOrgs />\n          <TableBody>\n            {scoredModifiedCouncilors.map((c) => (\n              <CouncilorTableRow key={c.id} councilor={c} stats={c.effectsWithOrgsAndAugments}\n                label={c.displayName!} hasOrgs highlightMissionClassName={currentHighlightMissionClassName} />\n            ))}\n          </TableBody>\n        </Table>\n      </div>\n\n      <div>\n        <h3 className=\"font-semibold mb-2\">Base Councilors (without orgs)</h3>\n        <Table>\n          <CouncilorTableHeader />\n          <TableBody>\n            {scoredBaseCouncilors.map((c) => (\n              <CouncilorTableRow key={`${c.id}-base`} councilor={c} stats={c.effectsBaseAndUnaugmentedTraits}\n                label={`${c.displayName} (base)`} />\n            ))}\n          </TableBody>\n        </Table>\n      </div>\n\n      <div>\n        <h3 className=\"font-semibold mb-2\">Available Councilors</h3>\n        <Table>\n          <CouncilorTableHeader />\n          <TableBody>\n            {scoredAvailableCouncilors.map((c) => (\n              <CouncilorTableRow key={c.id} councilor={c} stats={c.effectsBaseAndUnaugmentedTraits}\n                label={c.displayName!} />\n            ))}\n          </TableBody>\n        </Table>\n      </div>\n\n      <div>\n        <h3 className=\"font-semibold mb-2\">Available Organizations</h3>\n        <Table>\n          <OrgTableHeader />\n          <TableBody>\n            {scoredOrgs.map((org) => (\n              <OrgTableRow key={org.id} org={org} playerNationIds={new Set(analysis.playerNationIds)}\n                playerTraits={new Set(analysis.playerCouncilors.flatMap((i) => i.traitTemplateNames))} />\n            ))}\n          </TableBody>\n        </Table>\n      </div>\n\n      <Collapsible>\n        <CollapsibleTrigger className=\"text-xs text-muted-foreground hover:text-foreground\">Debug Data</CollapsibleTrigger>\n        <CollapsibleContent>\n          <pre>{JSON.stringify(analysis.playerFaction, null, 2)}</pre>\n        </CollapsibleContent>\n      </Collapsible>\n    </div>\n  );\n}\n\nexport function ExistingCouncil({ analysis, weights }: { analysis: Analysis; weights: ScoringWeights }) {\n  const { playerMissionCounts, playerCouncilors, playerAvailableOrgs, playerUnassignedOrgs } = analysis;\n\n  const scoredModifiedCouncilors = scoreAndSort(playerCouncilors, weights, playerMissionCounts, getModifiedCouncilorScore);\n  const scoredOrgs = scoreAndSort(\n    analysis.playerAvailableOrgs.map((i) => ({ type: \"available\", ...i }))\n      .concat(analysis.playerUnassignedOrgs.map((i) => ({ type: \"unassigned\", ...i }))),\n    weights, playerMissionCounts, getOrganizationScore, \"noMissionScore\"\n  ).toSorted((a, b) => (a.isAdminOrg === b.isAdminOrg ? 0 : a.isAdminOrg ? -1 : 1));\n\n  const unusedAdmin = playerCouncilors\n    .map((c) =>\n      Math.min(25, Math.max(0, (c.effectsWithOrgsAndAugments.Administration || 0) + (c.effectsWithOrgsAndAugments.administration || 0))) -\n      c.orgs.reduce((a, b) => a + b.tier, 0)\n    )\n    .reduce((a, b) => a + b, 0);\n\n  function currentHighlightMissionClassName(missionName: MissionDataName) {\n    const count = playerMissionCounts.get(missionName) || 0;\n    if (count === 2) return \"bg-yellow-300/50\";\n    if (count === 1) return \"bg-red-300/50\";\n  }\n  function availableHighlightMissionClassName(missionName: MissionDataName) {\n    const count = playerMissionCounts.get(missionName) || 0;\n    if (count === 1) return \"bg-yellow-300/50\";\n    if (count === 0) return \"bg-green-300/50\";\n  }\n\n  const playerNationIds = new Set(analysis.playerNationIds);\n  const playerTraits = new Set(analysis.playerCouncilors.flatMap((i) => i.traitTemplateNames));\n\n  const councilEffects = scoredModifiedCouncilors.reduce((acc, c) => combineEffects(acc, c.effectsWithOrgsAndAugments), {} as ShowEffectsProps);\n\n  return (\n    <div className=\"space-y-4\">\n      <div className=\"rounded-lg border p-3\">\n        <p>Unused Administration points: {unusedAdmin.toFixed(0)} <Administration /></p>\n      </div>\n\n      <div>\n        <h3 className=\"font-semibold mb-2\">Council Effects</h3>\n        <ShowEffects\n          incomeBoost_month={councilEffects.incomeBoost_month} incomeMoney_month={councilEffects.incomeMoney_month}\n          incomeInfluence_month={councilEffects.incomeInfluence_month} incomeOps_month={councilEffects.incomeOps_month}\n          incomeMissionControl={councilEffects.incomeMissionControl} incomeResearch_month={councilEffects.incomeResearch_month}\n          projectCapacityGranted={councilEffects.projectCapacityGranted}\n          economyBonus={councilEffects.economyBonus} welfareBonus={councilEffects.welfareBonus}\n          environmentBonus={councilEffects.environmentBonus} knowledgeBonus={councilEffects.knowledgeBonus}\n          governmentBonus={councilEffects.governmentBonus} unityBonus={councilEffects.unityBonus}\n          militaryBonus={councilEffects.militaryBonus} oppressionBonus={councilEffects.oppressionBonus}\n          spoilsBonus={councilEffects.spoilsBonus} spaceDevBonus={councilEffects.spaceDevBonus}\n          spaceflightBonus={councilEffects.spaceflightBonus} MCBonus={councilEffects.MCBonus} miningBonus={councilEffects.miningBonus}\n          councilorTechBonus={councilEffects.councilorTechBonus} techBonuses={councilEffects.techBonuses}\n        />\n      </div>\n\n      <div>\n        <h3 className=\"font-semibold mb-2\">Current Council</h3>\n        <Table>\n          <CouncilorTableHeader hasOrgs />\n          <TableBody>\n            {scoredModifiedCouncilors.map((c) => (\n              <CouncilorTableRow key={c.id} councilor={c} stats={c.effectsWithOrgsAndAugments}\n                label={c.displayName!} hasOrgs highlightMissionClassName={currentHighlightMissionClassName} />\n            ))}\n          </TableBody>\n        </Table>\n      </div>\n\n      <div>\n        <h3 className=\"font-semibold mb-2\">Available Organizations</h3>\n        <Table>\n          <OrgTableHeader />\n          <TableBody>\n            {scoredOrgs.map((org) => (\n              <OrgTableRow key={org.id} org={org} playerNationIds={playerNationIds} playerTraits={playerTraits}\n                highlightMissionClassName={availableHighlightMissionClassName} />\n            ))}\n          </TableBody>\n        </Table>\n      </div>\n\n      <Collapsible>\n        <CollapsibleTrigger className=\"text-xs text-muted-foreground hover:text-foreground\">Debug Data</CollapsibleTrigger>\n        <CollapsibleContent>\n          <pre>{JSON.stringify(analysis.playerFaction, null, 2)}</pre>\n        </CollapsibleContent>\n      </Collapsible>\n    </div>\n  );\n}\n\nexport function FindNewCouncilors({ analysis, weights }: { analysis: Analysis; weights: ScoringWeights }) {\n  const { playerMissionCounts } = analysis;\n\n  const scoredAvailableCouncilors = scoreAndSort(analysis.playerAvailableCouncilors, weights, playerMissionCounts, getBaseCouncilorScore);\n  const scoredBaseCouncilors = scoreAndSort(analysis.playerCouncilors, weights, playerMissionCounts, getBaseCouncilorScore);\n\n  function availableHighlightMissionClassName(missionName: MissionDataName) {\n    const count = playerMissionCounts.get(missionName) || 0;\n    if (count === 1) return \"bg-yellow-300/50\";\n    if (count === 0) return \"bg-green-300/50\";\n  }\n\n  return (\n    <div className=\"space-y-4\">\n      <div>\n        <h3 className=\"font-semibold mb-2\">Available Councilors</h3>\n        <Table>\n          <CouncilorTableHeader />\n          <TableBody>\n            {scoredAvailableCouncilors.map((c) => (\n              <CouncilorTableRow key={c.id} councilor={c} stats={c.effectsBaseAndUnaugmentedTraits}\n                label={c.displayName!} highlightMissionClassName={availableHighlightMissionClassName} />\n            ))}\n          </TableBody>\n        </Table>\n      </div>\n\n      <div>\n        <h3 className=\"font-semibold mb-2\">Unmodified Active Councilors</h3>\n        <Table>\n          <CouncilorTableHeader />\n          <TableBody>\n            {scoredBaseCouncilors.map((c) => (\n              <CouncilorTableRow key={`${c.id}-base`} councilor={c} stats={c.effectsBaseAndUnaugmentedTraits}\n                label={`${c.displayName}`} highlightMissionClassName={availableHighlightMissionClassName} />\n            ))}\n          </TableBody>\n        </Table>\n      </div>\n\n      <Collapsible>\n        <CollapsibleTrigger className=\"text-xs text-muted-foreground hover:text-foreground\">Debug Data</CollapsibleTrigger>\n        <CollapsibleContent>\n          <pre>{JSON.stringify(analysis.playerAvailableCouncilors, null, 2)}</pre>\n        </CollapsibleContent>\n      </Collapsible>\n    </div>\n  );\n}\n\nexport function CurrentOrgs({ analysis, weights }: { analysis: Analysis; weights: ScoringWeights }) {\n  const { playerMissionCounts, playerCouncilors, playerUnassignedOrgs } = analysis;\n\n  const usedOrgs = playerCouncilors.flatMap((c) => c.orgs.map((o) => ({ ...o, type: \"used\", councilor: c.displayName, councilorId: c.id })));\n  const scoredOwnedOrgs = scoreAndSort(\n    analysis.playerUnassignedOrgs.map((i) => ({ type: \"unassigned\", ...i })).concat(usedOrgs),\n    weights, playerMissionCounts, getOrganizationScore\n  );\n\n  function availableHighlightMissionClassName(missionName: MissionDataName) {\n    const count = playerMissionCounts.get(missionName) || 0;\n    if (count === 1) return \"bg-yellow-300/50\";\n    if (count === 0) return \"bg-green-300/50\";\n  }\n\n  const playerNationIds = new Set(analysis.playerNationIds);\n  const playerTraits = new Set(analysis.playerCouncilors.flatMap((i) => i.traitTemplateNames));\n\n  return (\n    <div className=\"space-y-2\">\n      <Table>\n        <OrgTableHeader costHeader=\"Councilor\" />\n        <TableBody>\n          {scoredOwnedOrgs.toReversed().map((org) => (\n            <OrgTableRow key={org.id} org={org} playerNationIds={playerNationIds} playerTraits={playerTraits}\n              highlightMissionClassName={availableHighlightMissionClassName} />\n          ))}\n        </TableBody>\n      </Table>\n\n      <Collapsible>\n        <CollapsibleTrigger className=\"text-xs text-muted-foreground hover:text-foreground\">Debug Data</CollapsibleTrigger>\n        <CollapsibleContent>\n          <pre>{JSON.stringify(analysis.playerUnassignedOrgs, null, 2)}</pre>\n        </CollapsibleContent>\n      </Collapsible>\n    </div>\n  );\n}\n\nexport function Takeover({ analysis, weights }: { analysis: Analysis; weights: ScoringWeights }) {\n  const { playerMissionCounts, playerFaction, playerStealableOrgs, factionsById } = analysis;\n\n  const scoredStealableOrgs = scoreAndSort(\n    playerStealableOrgs.map((i) => ({ type: \"stealable\", ...i })),\n    weights, playerMissionCounts, getOrganizationScore, \"noMissionScore\"\n  );\n\n  const stealableOrgsByFaction = scoredStealableOrgs.reduce((acc, org) => {\n    const key = org.faction?.id || 0;\n    if (!acc.has(key)) acc.set(key, []);\n    acc.get(key)!.push(org);\n    return acc;\n  }, new Map<number, typeof scoredStealableOrgs>());\n\n  function availableHighlightMissionClassName(missionName: MissionDataName) {\n    const count = playerMissionCounts.get(missionName) || 0;\n    if (count === 1) return \"bg-yellow-300/50\";\n    if (count === 0) return \"bg-green-300/50\";\n  }\n\n  const playerNationIds = new Set(analysis.playerNationIds);\n  const playerTraits = new Set(analysis.playerCouncilors.flatMap((i) => i.traitTemplateNames));\n\n  return (\n    <div className=\"space-y-2\">\n      <SmartTabs storageKey=\"councilorsTakeoverTabs\"\n        defaultValue={`faction-${Array.from(stealableOrgsByFaction.keys())[0]}`}>\n        <TabsList>\n          {Array.from(stealableOrgsByFaction.entries()).map(([factionId, orgs]) => (\n            <TabsTrigger key={factionId} value={`faction-${factionId}`}>\n              {orgs[0].faction?.displayName || \"Unknown Faction\"} ({orgs.length})\n            </TabsTrigger>\n          ))}\n        </TabsList>\n        {Array.from(stealableOrgsByFaction.entries()).map(([factionId, orgs]) => (\n          <TabsContent key={factionId} value={`faction-${factionId}`}>\n            <Table>\n              <OrgTableHeader costHeader=\"Takeover\" />\n              <TableBody>\n                {orgs.map((org) => (\n                  <OrgTableRow key={org.id} org={org} playerNationIds={playerNationIds} playerTraits={playerTraits}\n                    highlightMissionClassName={availableHighlightMissionClassName} isTakeover />\n                ))}\n              </TableBody>\n            </Table>\n          </TabsContent>\n        ))}\n      </SmartTabs>\n\n      <Collapsible>\n        <CollapsibleTrigger className=\"text-xs text-muted-foreground hover:text-foreground\">Debug Data</CollapsibleTrigger>\n        <CollapsibleContent>\n          <pre>{JSON.stringify(analysis.playerFaction, null, 2)}</pre>\n        </CollapsibleContent>\n      </Collapsible>\n    </div>\n  );\n}\n\nexport function Missions({ analysis, weights }: { analysis: Analysis; weights: ScoringWeights }) {\n  const { playerMissionCounts, playerCouncilors, playerVisibleCouncilors, playerAvailableOrgs, playerUnassignedOrgs, playerFaction, playerStealableOrgs, factionsById } = analysis;\n\n  type MissionSource =\n    | { type: \"councilor\"; councilor: Analysis[\"playerCouncilors\"][number]; factionId: number | undefined; missions: MissionDataName[] }\n    | { type: \"org\"; org: Analysis[\"playerAvailableOrgs\"][number]; factionId: number | undefined; missions: MissionDataName[] };\n\n  const sourcesByFactionByMission = [...playerCouncilors, ...playerVisibleCouncilors]\n    .map((i) => ({\n      type: \"councilor\" as const,\n      councilor: i,\n      factionId: i.factionId,\n      missions: i.effectsWithOrgsAndAugments.missionsGrantedNames || [],\n    }))\n    .concat(\n      [...playerAvailableOrgs, ...playerUnassignedOrgs].map((i) => ({\n        type: \"org\" as const,\n        org: i,\n        factionId: playerFaction?.id,\n        missions: i.template?.missionsGrantedNames || [],\n      }))\n    )\n    .concat(\n      playerStealableOrgs.map((i) => ({\n        type: \"org\" as const,\n        org: i,\n        factionId: i.faction?.id,\n        missions: i.template?.missionsGrantedNames || [],\n      }))\n    )\n    .reduce((acc, o) => {\n      const key = o.factionId || 0;\n      if (!acc.has(key)) acc.set(key, new Map<string, MissionSource[]>());\n      const effectsMap = acc.get(key)!;\n      o.missions.forEach((m) => {\n        if (!effectsMap.has(m)) effectsMap.set(m, []);\n        effectsMap.get(m)!.push(o);\n      });\n      return acc;\n    }, new Map<number, Map<string, MissionSource[]>>());\n\n  const factions = Array.from(sourcesByFactionByMission.keys())\n    .map((factionId) => factionsById.get(factionId)!)\n    .filter((f) => f)\n    .toSorted((a, b) => {\n      if (a.id === playerFaction.id) return -1;\n      if (b.id === playerFaction.id) return 1;\n      return (a.displayName || \"\").localeCompare(b.displayName || \"\");\n    });\n\n  const importantMissions = [\"Assassinate\"];\n\n  function availableHighlightMissionClassName(missionName: MissionDataName) {\n    const count = playerMissionCounts.get(missionName) || 0;\n    if (count === 1) return \"bg-yellow-300/50\";\n    if (count === 0) return \"bg-green-300/50\";\n  }\n\n  const playerNationIds = new Set(analysis.playerNationIds);\n  const playerTraits = new Set(analysis.playerCouncilors.flatMap((i) => i.traitTemplateNames));\n\n  return (\n    <div className=\"space-y-2\">\n      <SmartTabs storageKey=\"councilorsMissionsTabs\" defaultValue={`faction-${factions[0]?.id}`}>\n        <TabsList>\n          {factions.map((faction) => (\n            <TabsTrigger key={faction.id} value={`faction-${faction.id}`}>\n              {faction.displayName || \"Unknown Faction\"} ({sourcesByFactionByMission.get(faction.id)?.size || 0})\n              {importantMissions\n                .filter((m) => sourcesByFactionByMission.get(faction.id)?.get(m)?.filter((i) => i.type === \"councilor\")?.length ?? 0 > 0)\n                .map((m) => {\n                  const MissionIcon = MissionIcons[m] || UnknownIcon;\n                  return <span key={m} className=\"inline-block -mt-2\"><MissionIcon className=\"h-4 w-4\" /></span>;\n                })}\n            </TabsTrigger>\n          ))}\n        </TabsList>\n        {factions.map((faction) => (\n          <TabsContent key={faction.id} value={`faction-${faction.id}`}>\n            <SmartAccordion type=\"single\" collapsible storageKey={`councilorsMissions-${faction.id}`}>\n              {Array.from(new Set([...importantMissions, ...Array.from(sourcesByFactionByMission.get(faction.id)?.keys() || [])])).map((missionName) => {\n                const sources = sourcesByFactionByMission.get(faction.id)?.get(missionName) || [];\n                const MissionIcon = MissionIcons[missionName] || UnknownIcon;\n                return (\n                  <AccordionItem key={missionName} value={missionName}>\n                    <AccordionTrigger>\n                      <span>\n                        <MissionIcon /> {missionName} –{\" \"}\n                        {sources.filter((i) => i.type === \"councilor\").length} Councilors ←{\" \"}\n                        {sources.filter((i) => i.type === \"org\").length} Orgs\n                      </span>\n                    </AccordionTrigger>\n                    <AccordionContent>\n                      <Table>\n                        <OrgTableHeader costHeader=\"Takeover\" />\n                        <TableBody>\n                          {sources?.map((src) =>\n                            src.type === \"org\" ? (\n                              <OrgTableRow key={`councilor-${src.org.id}-mission-${missionName}`}\n                                org={src.org} playerNationIds={playerNationIds} playerTraits={playerTraits} />\n                            ) : (\n                              <CouncilorTableRow key={`org-${src.councilor.id}-mission-${missionName}`}\n                                councilor={src.councilor} stats={src.councilor.effectsWithOrgsAndAugments}\n                                label={src.councilor.displayName!} />\n                            )\n                          )}\n                        </TableBody>\n                      </Table>\n                    </AccordionContent>\n                  </AccordionItem>\n                );\n              })}\n            </SmartAccordion>\n          </TabsContent>\n        ))}\n      </SmartTabs>\n\n      <Collapsible>\n        <CollapsibleTrigger className=\"text-xs text-muted-foreground hover:text-foreground\">Debug Data</CollapsibleTrigger>\n        <CollapsibleContent>\n          <pre>{JSON.stringify(analysis.playerFaction, null, 2)}</pre>\n        </CollapsibleContent>\n      </Collapsible>\n    </div>\n  );\n}\n\nexport function OtherCouncilors({ analysis, weights }: { analysis: Analysis; weights: ScoringWeights }) {\n  const { playerVisibleCouncilors, factionsById } = analysis;\n\n  const scoredBaseCouncilors = scoreAndSort(\n    playerVisibleCouncilors, weights, new Map<MissionDataName, number>(), getBaseCouncilorScore\n  );\n\n  const councilorsByFactionId = scoredBaseCouncilors.reduce((acc, councilor) => {\n    const factionId = councilor.factionId || 0;\n    if (!factionId) return acc;\n    if (!acc.has(factionId)) acc.set(factionId, []);\n    acc.get(factionId)!.push(councilor);\n    return acc;\n  }, new Map<number, Analysis[\"playerCouncilors\"][number][]>());\n\n  const factions = Array.from(councilorsByFactionId.keys())\n    .map((i) => factionsById.get(i!)!)\n    .filter((i) => i.id !== analysis.alienFaction.id);\n\n  return (\n    <div className=\"space-y-2\">\n      <Tabs defaultValue={`faction-${factions[0]?.id}`}>\n        <TabsList>\n          {factions\n            .filter((i) => i.id !== analysis.alienFaction.id)\n            .map((faction) => (\n              <TabsTrigger key={faction.id} value={`faction-${faction.id}`}>\n                {faction.displayName || \"Unknown Faction\"} ({councilorsByFactionId.get(faction.id)?.length || 0})\n              </TabsTrigger>\n            ))}\n        </TabsList>\n        {factions.map((faction) => (\n          <TabsContent key={faction.id} value={`faction-${faction.id}`}>\n            <Table>\n              <CouncilorTableHeader />\n              <TableBody>\n                {councilorsByFactionId.get(faction.id)?.map((councilor) => (\n                  <CouncilorTableRow key={councilor.id} councilor={councilor}\n                    stats={councilor.effectsBaseAndUnaugmentedTraits}\n                    label={councilor.displayName!} />\n                ))}\n              </TableBody>\n            </Table>\n          </TabsContent>\n        ))}\n      </Tabs>\n\n      <Collapsible>\n        <CollapsibleTrigger className=\"text-xs text-muted-foreground hover:text-foreground\">Debug Data</CollapsibleTrigger>\n        <CollapsibleContent>\n          <pre>{JSON.stringify(analysis.playerFaction, null, 2)}</pre>\n        </CollapsibleContent>\n      </Collapsible>\n    </div>\n  );\n}\n\n// ─── Legacy: getCouncilorsUi (kept for compatibility, no longer used by tree nav) ───\n\nexport function getCouncilorsUi(_analysis: Analysis) {\n  return {\n    key: \"councilors\",\n    tab: \"Councilors\",\n    content: <div>Use tree navigation instead</div>,\n  };\n}\n",
  "filePath": "terra-invicta-assistant\\src\\app\\game\\current\\councilors.tsx"
}
```

**Output:**
```
Wrote file successfully.
```

---

## Assistant (Build · Qwen 3.6-35B-A3B (local) · 7.5s)

_Thinking:_

Now let me update the other tab files (fleets, habs, resources, drives) to export their content components. Each one needs to export a component that can render a specific section when selected from the tree.

Let me update fleets.tsx first:

**Tool: todowrite**

**Input:**
```json
{
  "todos": [
    {
      "content": "Create tree-nav.tsx - reusable tree navigation component with accordion-based collapsible nodes",
      "status": "completed",
      "priority": "high"
    },
    {
      "content": "Create scoring-context.tsx - context for councilor scoring state",
      "status": "completed",
      "priority": "high"
    },
    {
      "content": "Refactor councilors.tsx - extract sections as tree leaves, export tree structure",
      "status": "completed",
      "priority": "high"
    },
    {
      "content": "Refactor fleets.tsx - export tree structure",
      "status": "in_progress",
      "priority": "medium"
    },
    {
      "content": "Refactor habs.tsx - export tree structure",
      "status": "pending",
      "priority": "medium"
    },
    {
      "content": "Refactor resources.tsx - export tree structure",
      "status": "pending",
      "priority": "medium"
    },
    {
      "content": "Refactor drives.tsx - export tree structure",
      "status": "pending",
      "priority": "medium"
    },
    {
      "content": "Refactor component.tsx - tree layout with sidebar + content panel",
      "status": "completed",
      "priority": "high"
    },
    {
      "content": "Test the app runs correctly",
      "status": "pending",
      "priority": "high"
    }
  ]
}
```

**Output:**
```
[
  {
    "content": "Create tree-nav.tsx - reusable tree navigation component with accordion-based collapsible nodes",
    "status": "completed",
    "priority": "high"
  },
  {
    "content": "Create scoring-context.tsx - context for councilor scoring state",
    "status": "completed",
    "priority": "high"
  },
  {
    "content": "Refactor councilors.tsx - extract sections as tree leaves, export tree structure",
    "status": "completed",
    "priority": "high"
  },
  {
    "content": "Refactor fleets.tsx - export tree structure",
    "status": "in_progress",
    "priority": "medium"
  },
  {
    "content": "Refactor habs.tsx - export tree structure",
    "status": "pending",
    "priority": "medium"
  },
  {
    "content": "Refactor resources.tsx - export tree structure",
    "status": "pending",
    "priority": "medium"
  },
  {
    "content": "Refactor drives.tsx - export tree structure",
    "status": "pending",
    "priority": "medium"
  },
  {
    "content": "Refactor component.tsx - tree layout with sidebar + content panel",
    "status": "completed",
    "priority": "high"
  },
  {
    "content": "Test the app runs correctly",
    "status": "pending",
    "priority": "high"
  }
]
```

---

## Assistant (Build · Qwen 3.6-35B-A3B (local) · 115.9s)

_Thinking:_

Now I need to update fleets.tsx. The current structure has a `FleetsComponent` that renders all sections in an accordion. I need to:

1. Extract each section into a separate exported component (or extract the section rendering logic)
2. Export a `FleetsContent` component that can render a specific section based on a prop
3. Keep `getFleetsUi` for compatibility

Let me rewrite fleets.tsx to export individual section components and a `FleetsContent` component.

**Tool: write**

**Input:**
```json
{
  "content": "import { Analysis } from \"@/lib/analysis\";\nimport { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from \"@/components/ui/table\";\nimport { Collapsible, CollapsibleContent, CollapsibleTrigger } from \"@/components/ui/collapsible\";\nimport { SmartAccordion } from \"@/components/ui/smart-accordion\";\nimport { Button } from \"@/components/ui/button\";\nimport { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from \"@/components/ui/tooltip\";\nimport { diffDateTime, sortByDateTime, toDays } from \"@/lib/utils\";\nimport { Fragment } from \"react/jsx-runtime\";\nimport { FactionIcons, MissionControl } from \"@/components/icons\";\nimport { twMerge } from \"tailwind-merge\";\n\nexport function getFleetsUi(analysis: Analysis) {\n  const byTarget = analysis.alienFleetsToPlayerOrbits.reduce((acc, fleet) => {\n    const key = fleet.planetName || \"Unknown Orbit\";\n    if (!acc.has(key)) acc.set(key, []);\n    acc.get(key)!.push(fleet);\n    return acc;\n  }, new Map<string, typeof analysis.alienFleetsToPlayerOrbits>());\n\n  const label = [...byTarget.entries().map(([target, rawFleets]) => {\n    const fleets = rawFleets.filter((f) => f.deltaV > 0 && (f.daysToTarget || 0) > 0);\n    const surv = rawFleets.filter((f) => f.operation === \"AlienEarthSurveillanceOperation\" && !f.arrivalTime);\n    const survInfo = surv.length ? (\n      <span className=\"text-white bg-destructive rounded py-2 px-3 font-bold\">\n        {surv.map((f) => f.operationCompleteDays || 0).reduce((a, b) => Math.min(a, b), 9999999999).toFixed(0)}d Surveillance\n      </span>\n    ) : null;\n    if (fleets.length === 0) {\n      return survInfo ? <span>{target}: {survInfo}</span> : null;\n    }\n    const firstFleet = sortByDateTime(fleets, (f) => f.arrivalTime || analysis.gameCurrentDateTime)[0];\n    const firstFleets = fleets.filter((f) => toDays(diffDateTime(f.arrivalTime || analysis.gameCurrentDateTime, firstFleet.arrivalTime || analysis.gameCurrentDateTime)) < 14);\n    const firstMc = firstFleets.reduce((sum, f) => sum + f.totalMC, 0);\n    const warningNeeded = (firstMc > 10 ? 270 : 150) + 30;\n    const daysToTarget = firstFleet.daysToTarget || 0;\n    const farFuture = daysToTarget > warningNeeded;\n    const className = twMerge(farFuture && \"px-1 -mx-1 py-0.5 -my-0.5 rounded bg-green-500\", farFuture && (daysToTarget < warningNeeded + 50 ? \"bg-red-200\" : daysToTarget < warningNeeded + 100 ? \"bg-yellow-200\" : \"bg-green-200\"));\n    return (\n      <span className={className} title={`${fleets.length} fleet(s) targeting ${target}, arriving in ${daysToTarget.toFixed(0)} days, using ${firstMc.toFixed(0)} MC`}>\n        {target}\n        {fleets.length > 1 ? `(${fleets.length})` : \"\"}\n        {farFuture ? \"\" : <>: {daysToTarget.toFixed(0)}d <MissionControl />{firstMc.toFixed(0)}</>}\n        {survInfo && <>,{survInfo}</>}\n      </span>\n    );\n  }]).filter((i) => !!i);\n\n  return {\n    key: \"fleets\",\n    tab: (\n      <>\n        Fleets\n        {label.length > 0 ? (\n          <>{\" \"}\n            {label.map((i, ix) => <Fragment key={ix}>{i}{ix < label.length - 1 ? \" | \" : \"\"}</Fragment>)}\n          </>\n        ) : \"\"}\n      </>\n    ),\n    content: <FleetsComponent analysis={analysis} />,\n  };\n}\n\n// ─── Section Components ───\n\nexport function FleetsAlienSection({ analysis }: { analysis: Analysis }) {\n  const alienFleets = analysis.alienFleetsToPlayerOrbits;\n  if (alienFleets.length === 0) {\n    return <div className=\"p-4 text-muted-foreground\">No alien fleets detected heading to player orbits.</div>;\n  }\n\n  return (\n    <div className=\"space-y-2\">\n      <p>Tracking planets: {analysis.playerInterestedPlanets.map((p) => p.displayName).join(\", \")}</p>\n      <Table>\n        <TableHeader>\n          <TableRow>\n            <TableHead>Fleet Name</TableHead><TableHead>Planet</TableHead><TableHead>Target Orbit</TableHead>\n            <TableHead>Arrival Date</TableHead><TableHead className=\"text-right\">Days to Arrival</TableHead>\n            <TableHead className=\"text-right\">MC Used</TableHead><TableHead className=\"text-right\">Marine CP</TableHead>\n            <TableHead className=\"text-right\">Total Mass</TableHead><TableHead className=\"text-right\">Max Ship Mass</TableHead>\n            <TableHead>Ships Hulls</TableHead><TableHead>Ships Roles</TableHead>\n            <TableHead>Operation</TableHead><TableHead>Operation Complete</TableHead>\n          </TableRow>\n        </TableHeader>\n        <TableBody>\n          {alienFleets.map((fleet) => (\n            <TableRow key={fleet.id} className={twMerge(fleet.deltaV === 0 ? \"bg-gray-500/5\" : \"\")}>\n              <TableCell className=\"font-medium\">{fleet.displayName}</TableCell>\n              <TableCell>{fleet.planetName}</TableCell>\n              <TableCell>{fleet.targetOrbitName}</TableCell>\n              <TableCell>{fleet.arrivalTimeFormatted || \"-\"}</TableCell>\n              <TableCell className=\"text-right\">{fleet.daysToTarget !== null ? `${fleet.daysToTarget.toFixed(0)}` : \"—\"}</TableCell>\n              <TableCell className=\"text-right\">{fleet.totalMC.toFixed(0)}</TableCell>\n              <TableCell className=\"text-right\">{fleet.marineCombatPower > 0 ? fleet.marineCombatPower : \"—\"}</TableCell>\n              <TableCell className=\"text-right\">{(fleet.totalMass / 1000000).toFixed(0)} Mkg</TableCell>\n              <TableCell className=\"text-right\">{(fleet.maxShipMass / 1000000).toFixed(0)} Mkg</TableCell>\n              <TableCell className=\"whitespace-normal\">\n                {fleet.shipsByHullType.length > 0\n                  ? fleet.shipsByHullType.map((ship) => `${ship.count} ${ship.hullName.replace(\"Alien \", \"\")}${ship.count > 1 ? \"s\" : \"\"}`).join(\" + \")\n                  : \"-\"}\n              </TableCell>\n              <TableCell className=\"whitespace-normal\">\n                {fleet.shipsByRole.length > 0\n                  ? fleet.shipsByRole.map((ship) => `${ship.count} ${ship.role}${ship.count > 1 ? \"s\" : \"\"}`).join(\" + \")\n                  : \"-\"}\n              </TableCell>\n              <TableCell>{fleet.operation || \"-\"}</TableCell>\n              <TableCell>{fleet.operationComplete ? `${fleet.operationComplete}${fleet.operationCompleteDays !== null ? ` (${fleet.operationCompleteDays.toFixed(0)}d)` : \"\"}` : \"-\"}</TableCell>\n            </TableRow>\n          ))}\n        </TableBody>\n      </Table>\n      <PlanetaryDefenseSummary analysis={analysis} />\n      <Collapsible>\n        <CollapsibleTrigger asChild><Button variant=\"outline\" size=\"sm\">Debug Data</Button></CollapsibleTrigger>\n        <CollapsibleContent><pre>{JSON.stringify(alienFleets, null, 2)}</pre></CollapsibleContent>\n      </Collapsible>\n    </div>\n  );\n}\n\nfunction PlanetaryDefenseSummary({ analysis }: { analysis: Analysis }) {\n  const planetsWithFleets = new Set(analysis.alienFleetsToPlayerOrbits.map((f) => f.planetName || \"Unknown\"));\n  const defenseData = Array.from(planetsWithFleets)\n    .map((planet) => {\n      const fleetsAtPlanet = analysis.alienFleetsToPlayerOrbits.filter((f) => f.planetName === planet);\n      const totalAlienMC = fleetsAtPlanet.reduce((sum, f) => sum + (f.totalMC || 0), 0);\n      const incomingFleets = fleetsAtPlanet.filter((f) => f.daysToTarget !== null && f.daysToTarget > 0);\n      const daysToArrival = incomingFleets.length > 0 ? Math.min(...incomingFleets.map((f) => f.daysToTarget!)) : null;\n      const playerFleetsAtPlanet = analysis.playerFleets.filter((f) => f.planetName === planet);\n      const relevantPlayerFleets = playerFleetsAtPlanet.filter((f) => {\n        if (f.daysToTarget === null || f.daysToTarget <= 0) return true;\n        if (daysToArrival === null) return false;\n        return f.daysToTarget < daysToArrival;\n      });\n      const totalPlayerMC = relevantPlayerFleets.reduce((sum, f) => sum + (f.totalMC || 0), 0);\n      const habsAtPlanet = analysis.playerHabs.filter((h) => h.planetName === planet);\n      return { planet, totalAlienMC, totalPlayerMC, daysToArrival, habs: habsAtPlanet };\n    })\n    .filter((d) => d.habs.length > 0)\n    .toSorted((a, b) => {\n      if (a.daysToArrival === null && b.daysToArrival === null) return 0;\n      if (a.daysToArrival === null) return 1;\n      if (b.daysToArrival === null) return -1;\n      return a.daysToArrival - b.daysToArrival;\n    });\n\n  return (\n    <div className=\"mt-8\">\n      <h2 className=\"text-2xl font-bold mb-4\">Planetary Defense Summary</h2>\n      <Table>\n        <TableHeader>\n          <TableRow>\n            <TableHead>Planet</TableHead>\n            <TableHead className=\"text-right\">Days to Arrival</TableHead>\n            <TableHead className=\"text-right\">Alien Fleet MC</TableHead>\n            <TableHead className=\"text-right\">Player Fleet MC</TableHead>\n            <TableHead>Habs (Active / Potential Combat)</TableHead>\n          </TableRow>\n        </TableHeader>\n        <TableBody>\n          {defenseData.map(({ planet, totalAlienMC, totalPlayerMC, daysToArrival, habs }) => (\n            <TableRow key={planet}>\n              <TableCell className=\"font-medium\">{planet}</TableCell>\n              <TableCell className=\"text-right\">{daysToArrival !== null ? daysToArrival.toFixed(0) : \"—\"}</TableCell>\n              <TableCell className=\"text-right\">{totalAlienMC.toFixed(0)}</TableCell>\n              <TableCell className=\"text-right\">{totalPlayerMC.toFixed(0)}</TableCell>\n              <TableCell>\n                <TooltipProvider>\n                  <div className=\"flex gap-2 flex-wrap\">\n                    {habs.toSorted((a, b) => (a.habType === \"Station\" && b.habType !== \"Station\" ? -1 : a.habType !== \"Station\" && b.habType === \"Station\" ? 1 : 0))\n                      .map((hab) => {\n                        const activeCombat = hab.activeEffects.combatScore || 0;\n                        const potentialCombat = hab.potentialEffects.combatScore || 0;\n                        const combatDisplay = activeCombat === potentialCombat ? activeCombat.toFixed(0) : `${activeCombat.toFixed(0)} / ${potentialCombat.toFixed(0)}`;\n                        const bgColor = hab.habType === \"Station\" ? \"bg-yellow-100\" : \"bg-green-100\";\n                        return (\n                          <Tooltip key={hab.id}>\n                            <TooltipTrigger asChild>\n                              <span className={`cursor-help ${bgColor} px-1.5 py-0.5 rounded`}>{combatDisplay}</span>\n                            </TooltipTrigger>\n                            <TooltipContent><div>{hab.displayName}</div></TooltipContent>\n                          </Tooltip>\n                        );\n                      })}\n                  </div>\n                </TooltipProvider>\n              </TableCell>\n            </TableRow>\n          ))}\n        </TableBody>\n      </Table>\n    </div>\n  );\n}\n\nexport function FleetsHumanSection({ analysis }: { analysis: Analysis }) {\n  const humanEnemyFleets = analysis.humanEnemyFleetsToPlayerOrbits;\n  if (humanEnemyFleets.length === 0) {\n    return <div className=\"p-4 text-muted-foreground\">No other human faction fleets detected heading to player orbits.</div>;\n  }\n\n  return (\n    <Table>\n      <TableHeader>\n        <TableRow>\n          <TableHead>Faction</TableHead><TableHead>Fleet Name</TableHead><TableHead>Planet</TableHead>\n          <TableHead>Target Orbit</TableHead><TableHead>Arrival Date</TableHead>\n          <TableHead className=\"text-right\">Days to Arrival</TableHead><TableHead className=\"text-right\">MC Used</TableHead>\n          <TableHead className=\"text-right\">Marine CP</TableHead><TableHead className=\"text-right\">Total Mass</TableHead>\n          <TableHead className=\"text-right\">Max Ship Mass</TableHead><TableHead>Ship Hulls</TableHead>\n          <TableHead>Ship Roles</TableHead><TableHead>Operation</TableHead><TableHead>Operation Complete</TableHead>\n        </TableRow>\n      </TableHeader>\n      <TableBody>\n        {humanEnemyFleets.map((fleet) => {\n          const FactionIcon = fleet.factionTemplateName ? FactionIcons[fleet.factionTemplateName as keyof typeof FactionIcons] : null;\n          return (\n            <TableRow key={fleet.id} className={twMerge(fleet.deltaV === 0 ? \"bg-gray-500/5\" : \"\")}>\n              <TableCell>\n                <div className=\"flex items-center gap-1\">\n                  {FactionIcon && <FactionIcon className=\"p-1 rounded\" />}\n                  <span className=\"text-sm\">{fleet.factionDisplayName ?? fleet.factionTemplateName ?? \"Unknown\"}</span>\n                </div>\n              </TableCell>\n              <TableCell className=\"font-medium\">{fleet.displayName}</TableCell>\n              <TableCell>{fleet.planetName}</TableCell>\n              <TableCell>{fleet.targetOrbitName}</TableCell>\n              <TableCell>{fleet.arrivalTimeFormatted || \"-\"}</TableCell>\n              <TableCell className=\"text-right\">{fleet.daysToTarget !== null ? `${fleet.daysToTarget.toFixed(0)}` : \"—\"}</TableCell>\n              <TableCell className=\"text-right\">{fleet.totalMC.toFixed(0)}</TableCell>\n              <TableCell className=\"text-right\">{fleet.marineCombatPower > 0 ? fleet.marineCombatPower : \"—\"}</TableCell>\n              <TableCell className=\"text-right\">{(fleet.totalMass / 1000000).toFixed(0)} Mkg</TableCell>\n              <TableCell className=\"text-right\">{(fleet.maxShipMass / 1000000).toFixed(0)} Mkg</TableCell>\n              <TableCell className=\"whitespace-normal\">\n                {fleet.shipsByHullType.length > 0\n                  ? fleet.shipsByHullType.map((ship) => `${ship.count} ${ship.hullName}${ship.count > 1 ? \"s\" : \"\"}`).join(\" + \")\n                  : \"-\"}\n              </TableCell>\n              <TableCell className=\"whitespace-normal\">\n                {fleet.shipsByRole.length > 0\n                  ? fleet.shipsByRole.map((s) => `${s.count} ${s.role}${s.count > 1 ? \"s\" : \"\"}`).join(\" + \")\n                  : \"-\"}\n              </TableCell>\n              <TableCell>{fleet.operation || \"-\"}</TableCell>\n              <TableCell>{fleet.operationComplete ? `${fleet.operationComplete}${fleet.operationCompleteDays !== null ? ` (${fleet.operationCompleteDays.toFixed(0)}d)` : \"\"}` : \"-\"}</TableCell>\n            </TableRow>\n          );\n        })}\n      </TableBody>\n    </Table>\n  );\n}\n\nexport function FleetsPlayerSection({ analysis }: { analysis: Analysis }) {\n  const playerFleets = analysis.playerFleets;\n  if (playerFleets.length === 0) {\n    return <div className=\"p-4 text-muted-foreground\">No player fleets found.</div>;\n  }\n\n  return (\n    <Table>\n      <TableHeader>\n        <TableRow>\n          <TableHead>Fleet Name</TableHead><TableHead>Planet</TableHead><TableHead>Target Orbit</TableHead>\n          <TableHead>Arrival Date</TableHead><TableHead className=\"text-right\">Days to Arrival</TableHead>\n          <TableHead className=\"text-right\">MC Used</TableHead><TableHead className=\"text-right\">Marine CP</TableHead>\n          <TableHead className=\"text-right\">Total Mass</TableHead><TableHead className=\"text-right\">Max Ship Mass</TableHead>\n          <TableHead>Ship Hulls</TableHead><TableHead>Ship Classes</TableHead>\n        </TableRow>\n      </TableHeader>\n      <TableBody>\n        {playerFleets.map((fleet) => (\n          <TableRow key={fleet.id}>\n            <TableCell className=\"font-medium\">{fleet.displayName}</TableCell>\n            <TableCell>{fleet.planetName}</TableCell>\n            <TableCell>{fleet.targetOrbitName}</TableCell>\n            <TableCell>{fleet.arrivalTimeFormatted || \"-\"}</TableCell>\n            <TableCell className=\"text-right\">{fleet.daysToTarget !== null ? `${fleet.daysToTarget.toFixed(0)}` : \"—\"}</TableCell>\n            <TableCell className=\"text-right\">{fleet.totalMC.toFixed(0)}</TableCell>\n            <TableCell className=\"text-right\">{fleet.marineCombatPower > 0 ? fleet.marineCombatPower : \"—\"}</TableCell>\n            <TableCell className=\"text-right\">{(fleet.totalMass / 1000000).toFixed(0)} Mkg</TableCell>\n            <TableCell className=\"text-right\">{(fleet.maxShipMass / 1000000).toFixed(0)} Mkg</TableCell>\n            <TableCell className=\"whitespace-normal\">\n              {fleet.shipsByHullType.length > 0\n                ? fleet.shipsByHullType.map((ship, i) => <Fragment key={ship.hullName}>{i > 0 && <br />}{ship.count} {ship.hullName}{ship.count > 1 ? \"s\" : \"\"}</Fragment>)\n                : \"-\"}\n            </TableCell>\n            <TableCell className=\"whitespace-normal\">\n              {fleet.shipsByClass.length > 0\n                ? fleet.shipsByClass.map((cls, i) => <Fragment key={cls.className}>{i > 0 && <br />}{cls.count}× {cls.className}{cls.noseArmor > 0 ? ` (${cls.noseArmor})` : \"\"}</Fragment>)\n                : \"-\"}\n            </TableCell>\n          </TableRow>\n        ))}\n      </TableBody>\n    </Table>\n  );\n}\n\nexport function FleetsConstructionSection({ analysis }: { analysis: Analysis }) {\n  const shipsUnderConstruction = analysis.playerShipsUnderConstruction;\n  if (shipsUnderConstruction.length === 0) {\n    return <div className=\"p-4 text-muted-foreground\">No ships under construction.</div>;\n  }\n\n  return (\n    <Table>\n      <TableHeader>\n        <TableRow>\n          <TableHead>Planet</TableHead><TableHead>Design</TableHead><TableHead>Hull</TableHead>\n          <TableHead className=\"text-right\">Nose Armor</TableHead><TableHead className=\"text-right\">Count</TableHead>\n          <TableHead>Days to Complete</TableHead>\n        </TableRow>\n      </TableHeader>\n      <TableBody>\n        {(() => {\n          const byPlanetDesign = shipsUnderConstruction.reduce((acc, ship) => {\n            const key = `${ship.planetName}||${ship.designName}`;\n            if (!acc.has(key)) acc.set(key, { planetName: ship.planetName, designName: ship.designName, hullName: ship.hullName, noseArmor: ship.noseArmor, entries: [] as { days: number; status: \"building\" | \"queued\" | \"waiting\" }[] });\n            acc.get(key)!.entries.push({ days: ship.daysToCompletion, status: ship.status });\n            return acc;\n          }, new Map<string, { planetName: string; designName: string; hullName: string; noseArmor: number; entries: { days: number; status: \"building\" | \"queued\" | \"waiting\" }[] }>());\n\n          return [...byPlanetDesign.values()].toSorted((a, b) => a.planetName.localeCompare(b.planetName) || a.designName.localeCompare(b.designName))\n            .map(({ planetName, designName, hullName, noseArmor, entries }) => (\n              <TableRow key={`${planetName}||${designName}`}>\n                <TableCell>{planetName}</TableCell>\n                <TableCell className=\"font-medium\">{designName}</TableCell>\n                <TableCell>{hullName}</TableCell>\n                <TableCell className=\"text-right\">{noseArmor > 0 ? noseArmor : \"-\"}</TableCell>\n                <TableCell className=\"text-right\">{entries.length}</TableCell>\n                <TableCell>\n                  {entries.toSorted((a, b) => a.days - b.days).map((e, i) => (\n                    <Fragment key={i}>\n                      {i > 0 && \", \"}\n                      {e.status === \"waiting\" ? <span title=\"Waiting for materials\">⚠️{e.days.toFixed(0)}</span>\n                        : e.status === \"queued\" ? <span className=\"text-muted-foreground\" title=\"Queued\">({e.days.toFixed(0)})</span>\n                        : e.days.toFixed(0)}\n                    </Fragment>\n                  ))}\n                </TableCell>\n              </TableRow>\n            ));\n        })()}\n      </TableBody>\n    </Table>\n  );\n}\n\nexport function FleetsComponent({ analysis }: { analysis: Analysis }) {\n  return (\n    <SmartAccordion type=\"multiple\" storageKey=\"fleetsSections\"\n      defaultValue={[\"alien-fleets\", \"human-enemy-fleets\", \"player-fleets\", \"ships-under-construction\"]}>\n      <AccordionItem value=\"alien-fleets\">\n        <AccordionTrigger>Alien Fleets ({analysis.alienFleetsToPlayerOrbits.length})</AccordionTrigger>\n        <AccordionContent><FleetsAlienSection analysis={analysis} /></AccordionContent>\n      </AccordionItem>\n      <AccordionItem value=\"human-enemy-fleets\">\n        <AccordionTrigger>Other Human Factions ({analysis.humanEnemyFleetsToPlayerOrbits.length})</AccordionTrigger>\n        <AccordionContent><FleetsHumanSection analysis={analysis} /></AccordionContent>\n      </AccordionItem>\n      <AccordionItem value=\"player-fleets\">\n        <AccordionTrigger>Player Fleets ({analysis.playerFleets.length})</AccordionTrigger>\n        <AccordionContent><FleetsPlayerSection analysis={analysis} /></AccordionContent>\n      </AccordionItem>\n      <AccordionItem value=\"ships-under-construction\">\n        <AccordionTrigger>Ships Under Construction ({analysis.playerShipsUnderConstruction.length})</AccordionTrigger>\n        <AccordionContent><FleetsConstructionSection analysis={analysis} /></AccordionContent>\n      </AccordionItem>\n    </SmartAccordion>\n  );\n}\n\nimport { AccordionItem, AccordionTrigger, AccordionContent } from \"@/components/ui/accordion\";\n",
  "filePath": "terra-invicta-assistant\\src\\app\\game\\current\\fleets.tsx"
}
```

**Output:**
```
Wrote file successfully.
```

---

## Assistant (Build · Qwen 3.6-35B-A3B (local) · 154.9s)

_Thinking:_

Now let me update habs.tsx to export section components. This is the largest file. I need to extract each section and export a `HabsContent` component.

**Tool: write**

**Input:**
```json
{
  "content": "\"use client\";\n\nimport { Boost, CombatScore, FactionIcons, HabPower, MissionControl, TechIcons, UnknownIcon, Water, Volatiles, Metals, Nobles, Fissiles, ControlPoint } from \"@/components/icons\";\nimport { combineEffects, ShowEffects, ShowEffectsProps } from \"@/components/showEffects\";\nimport { AccordionContent, AccordionItem, AccordionTrigger } from \"@/components/ui/accordion\";\nimport { Button } from \"@/components/ui/button\";\nimport { Card, CardContent, CardHeader, CardTitle } from \"@/components/ui/card\";\nimport { Collapsible, CollapsibleContent, CollapsibleTrigger } from \"@/components/ui/collapsible\";\nimport { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from \"@/components/ui/table\";\nimport { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from \"@/components/ui/tooltip\";\nimport { Analysis } from \"@/lib/analysis\";\nimport { formatDateTime, noDate } from \"@/lib/utils\";\nimport { Fragment, useState } from \"react\";\nimport { useTechnologyGoals, TechnologyGoalsDialog, TechnologyGoalsList } from \"./technologyGoals\";\nimport { ResearchLink } from \"./researchLink\";\nimport { twMerge } from \"tailwind-merge\";\nimport { User, Factory, ArrowUp, Pickaxe } from \"lucide-react\";\nimport { SmartAccordion } from \"@/components/ui/smart-accordion\";\n\ntype AlienGoal = Analysis[\"expandedAlienGoals\"][0];\n\nfunction AlienGoalList({ goals }: { goals: AlienGoal[] }) {\n  return (\n    <ul className=\"ml-4 mt-1 text-sm space-y-0.5\">\n      {goals.map((goal) => (\n        <li key={goal.id}>\n          <strong>{goal.type}</strong> ({goal.importance}){goal.nation && `: ${goal.nation.displayName}`}\n          {goal.hab && `: ${goal.hab.displayName}${goal.hab.bodyName ? ` (${goal.hab.bodyName})` : \"\"}`}\n          {goal.attackTarget && `: ${goal.attackTarget.displayName}`}\n          {goal.attackTargetFleet && `: Target Fleet: ${goal.attackTargetFleet.displayName}`}\n          {goal.assignedFleet && `, Assigned: ${goal.assignedFleet.displayName}`}\n          {goal.pendingFleets && goal.pendingFleets.length > 0 && `, Pending: ${goal.pendingFleets.map((f) => f.displayName).join(\", \")}`}\n          {goal.enemyFaction && `: vs ${goal.enemyFaction.displayName}`}\n        </li>\n      ))}\n    </ul>\n  );\n}\n\nfunction HabScienceHeader() {\n  return (\n    <TableHeader>\n      <TableRow>\n        <TableHead>Name</TableHead>\n        <TableHead><CombatScore /></TableHead>\n        <TableHead>Most important upcoming completion</TableHead>\n        <TableHead title=\"Days to complete\">D2C</TableHead>\n        <TableHead>Alerts</TableHead>\n        <TableHead title=\"Current Power\"><HabPower /></TableHead>\n        <TableHead title=\"Future Power\"><HabPower /></TableHead>\n        <TableHead>Current bonuses</TableHead>\n        <TableHead>Future bonuses</TableHead>\n      </TableRow>\n    </TableHeader>\n  );\n}\n\nfunction ShowHabCombatEffects({ effects }: { effects: ShowEffectsProps }) {\n  return <ShowEffects combatScore={effects.combatScore} />;\n}\n\nfunction ShowHabScienceEffects({ effects }: { effects: ShowEffectsProps }) {\n  return (\n    <ShowEffects\n      incomeBoost_month={effects.incomeBoost_month} incomeInfluence_month={effects.incomeInfluence_month}\n      incomeMissionControl={effects.incomeMissionControl} incomeMoney_month={effects.incomeMoney_month}\n      incomeOps_month={effects.incomeOps_month} incomeResearch_month={effects.incomeResearch_month}\n      projectCapacityGranted={effects.projectCapacityGranted}\n      economyBonus={effects.economyBonus} welfareBonus={effects.welfareBonus}\n      environmentBonus={effects.environmentBonus} knowledgeBonus={effects.knowledgeBonus}\n      governmentBonus={effects.governmentBonus} unityBonus={effects.unityBonus}\n      militaryBonus={effects.militaryBonus} oppressionBonus={effects.oppressionBonus}\n      spoilsBonus={effects.spoilsBonus} spaceDevBonus={effects.spaceDevBonus}\n      spaceflightBonus={effects.spaceflightBonus} MCBonus={effects.MCBonus} miningBonus={effects.miningBonus}\n      techBonuses={effects.techBonuses} controlPoints={effects.controlPoints}\n      miltechBonus={effects.miltechBonus} alienDetection={effects.alienDetection}\n      humanDetection={effects.humanDetection} publicCampaignStrength={effects.publicCampaignStrength}\n    />\n  );\n}\n\nfunction HabScienceTableRow({ hab }: { hab: Analysis[\"playerHabs\"][0]; time?: string }) {\n  const { highlightedCompletions, emptyModuleCount, missingMine, activeEffects, potentialEffects } = hab;\n  return (\n    <TableRow key={hab.id}>\n      <TableCell><span title={`site: ${hab.habSiteId}, body: ${hab.orbitStateId}`}>{hab.displayName}</span></TableCell>\n      <TableCell><ShowHabCombatEffects effects={activeEffects} /></TableCell>\n      <TableCell className=\"whitespace-normal\">\n        {highlightedCompletions.map((highlightedCompletion, ix) => (\n          <Fragment key={ix}>{ix > 0 && \", \"}{highlightedCompletion.displayName} in {highlightedCompletion.daysToCompletion?.toFixed(0)} days</Fragment>\n        ))}\n      </TableCell>\n      <TableCell>{hab.maxDaysToCompletion ? hab.maxDaysToCompletion.toFixed(0) : \"\"}</TableCell>\n      <TableCell>\n        {emptyModuleCount > 0 && <>{emptyModuleCount} empty slots </>}\n        {missingMine && <span className=\"bg-yellow-300 text-black p-1 rounded\">Missing Mine </span>}\n        {hab.hasUnnecessaryFactory && <span title=\"Active factory with no construction - consider turning it off\" className=\"p-1\"><Factory className=\"inline h-4 w-4 text-red-600\" /></span>}\n        {hab.canUpgradePower && <HabPower title=\"Power module can be upgraded\" />}\n        {hab.canUpgradeCombat && <CombatScore title=\"Combat module can be upgraded\" />}\n        {hab.canUpgradeFarm && <span title=\"Farm can be upgraded to support more crew\" className=\"p-1\"><User className=\"inline h-4 w-4\" /></span>}\n        {hab.canUpgradeFactory && <span title=\"Factory can be upgraded\" className=\"p-1\"><Factory className=\"inline h-4 w-4\" /></span>}\n        {hab.canUpgradeMining && hab.miningUpgradeInfo && hab.site && (\n          <TooltipProvider>\n            <Tooltip>\n              <TooltipTrigger asChild>\n                <span className={twMerge(\"p-1 cursor-help\", hab.miningUpgradeInfo.factoryTier === 3 ? \"bg-green-200 rounded\" : \"\")}>\n                  <Pickaxe className=\"inline h-4 w-4\" />\n                </span>\n              </TooltipTrigger>\n              <TooltipContent>\n                <div className=\"space-y-1\">\n                  <div className=\"font-bold\">Mining Upgrade Available</div>\n                  <div>Upgrade to: {hab.miningUpgradeInfo.upgradeName}</div>\n                  <div>Best factory: {hab.miningUpgradeInfo.factoryName}</div>\n                  <div className=\"mt-2 text-sm\"><div className=\"font-semibold\">Mining effects with best mine:</div><ShowHabMineEffects effects={hab.bestMineEffects} /></div>\n                </div>\n              </TooltipContent>\n            </Tooltip>\n          </TooltipProvider>\n        )}\n        {hab.needsOperationsCenterUpgrade && <span className=\"p-1\" title=\"Operations Center upgrade available\"><MissionControl /></span>}\n        {hab.needsAdminTowerUpgrade && <span className=\"p-1\" title=\"Admin Tower upgrade available\"></span>}\n        {hab.upgradeableModuleNames.length > 0 && <span title={`Can upgrade to:\\n${hab.upgradeableModuleNames.join(\"\\n\")}`} className=\"p-1\"><ArrowUp className=\"inline h-4 w-4\" /></span>}\n      </TableCell>\n      <TableCell>{hab.activePower?.toFixed(0)}</TableCell>\n      <TableCell><span className={twMerge(hab.futurePower < 0 ? \"bg-red-100 p-1 rounded\" : \"\")}>{hab.futurePower?.toFixed(0)}</span></TableCell>\n      <TableCell><ShowHabScienceEffects effects={activeEffects} /></TableCell>\n      <TableCell><ShowHabScienceEffects effects={potentialEffects} /></TableCell>\n    </TableRow>\n  );\n}\n\nfunction HabMineHeader() {\n  return (\n    <TableHeader>\n      <TableRow>\n        <TableHead>Name</TableHead><TableHead><CombatScore /></TableHead>\n        <TableHead>Most important upcoming completion</TableHead><TableHead>Alerts</TableHead>\n        <TableHead>Current income</TableHead><TableHead>Current if powered</TableHead>\n        <TableHead>Best unlocked mine</TableHead>\n      </TableRow>\n    </TableHeader>\n  );\n}\n\nfunction ShowHabMineEffects({ effects }: { effects: Analysis[\"playerHabs\"][0][\"currentMineEffects\"] }) {\n  return <ShowEffects water={effects.water_month} volatiles={effects.volatiles_month} metals={effects.metals_month} nobles={effects.nobles_month} fissiles={effects.fissiles_month} />;\n}\n\nfunction HabMineTableRow({ hab }: { hab: Analysis[\"playerHabs\"][0]; time?: string }) {\n  const { highlightedCompletions, emptyModuleCount, missingMine } = hab;\n  return (\n    <TableRow key={hab.id}>\n      <TableCell>{hab.displayName}</TableCell>\n      <TableCell><ShowHabCombatEffects effects={hab.activeEffects} /></TableCell>\n      <TableCell>\n        <span className=\"whitespace-normal\">\n          {highlightedCompletions.map((highlightedCompletion, ix) => (\n            <Fragment key={ix}>{ix > 0 && \", \"}{highlightedCompletion.templateName} in {highlightedCompletion.daysToCompletion?.toFixed(0)} days</Fragment>\n          ))}\n        </span>\n      </TableCell>\n      <TableCell>\n        {emptyModuleCount > 0 && <>{emptyModuleCount} empty slots </>}\n        {missingMine && <span className=\"bg-yellow-300 text-black p-1 rounded\">Missing Mine </span>}\n        {hab.mineTier > 0 && <span className={twMerge(\"text-black p-1 rounded text-xs\", hab.mineTier === 1 ? \"bg-blue-100\" : hab.mineTier === 2 ? \"bg-blue-300\" : \"bg-blue-500 text-white\")}>M{hab.mineTier}</span>}\n        {hab.highestActiveFactoryTier > 0 && (\n          <span className={twMerge(\"text-black p-1 rounded text-xs\", hab.highestActiveFactoryTier === 1 ? \"bg-green-100\" : hab.highestActiveFactoryTier === 2 ? \"bg-green-300\" : \"bg-green-500\", hab.highestActiveFactoryCount === 2 ? \"outline outline-1 outline-black\" : hab.highestActiveFactoryCount >= 3 ? \"outline outline-2 outline-black\" : \"\")}>\n            F{hab.highestActiveFactoryTier}\n          </span>\n        )}\n      </TableCell>\n      <TableCell><ShowHabMineEffects effects={hab.currentMineEffects} /></TableCell>\n      <TableCell><ShowHabMineEffects effects={hab.currentMinePoweredEffects} /></TableCell>\n      <TableCell><ShowHabMineEffects effects={hab.bestMineEffects} /></TableCell>\n    </TableRow>\n  );\n}\n\n// ─── Section Components ───\n\nexport function HabsCurrentBonuses({ analysis }: { analysis: Analysis }) {\n  const activeEffects = analysis.playerHabs.reduce<ShowEffectsProps>((acc, hab) => combineEffects(acc, hab.activeEffects), {});\n  return <ShowHabScienceEffects effects={activeEffects} />;\n}\n\nexport function HabsFutureBonuses({ analysis }: { analysis: Analysis }) {\n  const potentialEffects = analysis.playerHabs.reduce<ShowEffectsProps>((acc, hab) => combineEffects(acc, hab.potentialEffects), {});\n  return <ShowHabScienceEffects effects={potentialEffects} />;\n}\n\nexport function HabsBoostMcSummary({ analysis }: { analysis: Analysis }) {\n  return (\n    <div className=\"flex space-x-4 pb-4\">\n      <span>\n        <Boost /> {analysis.playerFaction.nationHistory.currentBoost.toFixed(2)}\n        {analysis.playerFaction.nationHistory.boostMonthlyChange !== 0 && (\n          <span className={analysis.playerFaction.nationHistory.boostMonthlyChange > 0 ? \"text-green-600\" : \"text-red-600\"}>\n            {\" \"}({analysis.playerFaction.nationHistory.boostMonthlyChange > 0 ? \"+\" : \"\"}{analysis.playerFaction.nationHistory.boostMonthlyChange.toFixed(2)})\n          </span>\n        )}\n      </span>\n      <span>\n        <MissionControl /> {analysis.playerFaction.nationHistory.currentMC.toFixed(0)}\n        {analysis.playerFaction.nationHistory.mcMonthlyChange !== 0 && (\n          <span className={analysis.playerFaction.nationHistory.mcMonthlyChange > 0 ? \"text-green-600\" : \"text-red-600\"}>\n            {\" \"}({analysis.playerFaction.nationHistory.mcMonthlyChange > 0 ? \"+\" : \"\"}{analysis.playerFaction.nationHistory.mcMonthlyChange.toFixed(0)})\n          </span>\n        )}\n      </span>\n    </div>\n  );\n}\n\nexport function HabsAlienHate({ analysis }: { analysis: Analysis }) {\n  return (\n    <div className=\"space-y-1\">\n      <div><strong>Current Alien Strategy:</strong> {analysis.alienFaction.defaultPriorityPresetTemplateName || \"Unknown\"}</div>\n      <div>\n        <strong>Active Goals (Top 10 of {analysis.expandedAlienGoals.length} by Importance):</strong>\n        <AlienGoalList goals={analysis.expandedAlienGoals.slice(0, 10)} />\n        {analysis.expandedAlienGoals.length > 10 && (\n          <Collapsible className=\"mt-2\">\n            <CollapsibleTrigger className=\"text-sm text-blue-500 hover:underline ml-4\">Show {analysis.expandedAlienGoals.length - 10} more goals...</CollapsibleTrigger>\n            <CollapsibleContent><AlienGoalList goals={analysis.expandedAlienGoals.slice(10)} /></CollapsibleContent>\n          </Collapsible>\n        )}\n      </div>\n      <div><strong>Alien Hate of Player:</strong> {analysis.alienFaction.factionHate?.get(analysis.playerFaction.id)?.toFixed(1) ?? \"Unknown\"}</div>\n      <div><strong>Assessed Alien Hate of Player:</strong> {analysis.playerFaction.assessedAlienHateOfMe?.toFixed(1) ?? \"Unknown\"}</div>\n      <div><strong>Last Fixed Hate Date:</strong> {analysis.playerFaction.lastDateOfFixedAlienHate ? formatDateTime(analysis.playerFaction.lastDateOfFixedAlienHate) : \"Never\"}</div>\n    </div>\n  );\n}\n\nexport function HabsBuildingDetails({ analysis }: { analysis: Analysis }) {\n  return (\n    <Table>\n      <TableHeader>\n        <TableRow><TableHead>Building</TableHead><TableHead className=\"text-right\">Current Count</TableHead>\n          <TableHead className=\"text-right\">Future Count</TableHead><TableHead>Current Bonuses</TableHead><TableHead>Future Bonuses</TableHead></TableRow>\n      </TableHeader>\n      <TableBody>\n        {analysis.buildingSummary.map((building) => (\n          <TableRow key={building.templateName}>\n            <TableCell>{building.friendlyName}</TableCell>\n            <TableCell className=\"text-right\">{building.currentCount}</TableCell>\n            <TableCell className=\"text-right\">{building.futureCount}</TableCell>\n            <TableCell><ShowHabScienceEffects effects={building.currentEffects} /></TableCell>\n            <TableCell><ShowHabScienceEffects effects={building.futureEffects} /></TableCell>\n          </TableRow>\n        ))}\n      </TableBody>\n    </Table>\n  );\n}\n\nexport function HabsAvailableBoostProjects({ analysis }: { analysis: Analysis }) {\n  const { availableBoostProjects } = analysis;\n  if (availableBoostProjects.length === 0) return null;\n  return (\n    <ul>\n      {availableBoostProjects.toSorted((a, b) => a.researchCost - b.researchCost).map((project, ix) => {\n        const Icon = TechIcons[project.techCategory] || UnknownIcon;\n        return <li key={ix}><Icon /> <ResearchLink name={project.dataName} displayName={project.friendlyName} /> ({project.researchCost})</li>;\n      })}\n    </ul>\n  );\n}\n\nexport function HabsAvailableCPProjects({ analysis }: { analysis: Analysis }) {\n  const { availableCPProjects } = analysis;\n  if (availableCPProjects.length === 0) return null;\n  return (\n    <ul>\n      {availableCPProjects.toSorted((a, b) => {\n        const aRemaining = a.researchCost - a.currentProgress;\n        const bRemaining = b.researchCost - b.currentProgress;\n        const aEfficiency = aRemaining > 0 ? a.cpBonus / aRemaining : 0;\n        const bEfficiency = bRemaining > 0 ? b.cpBonus / bRemaining : 0;\n        return bEfficiency - aEfficiency;\n      }).map((project, ix) => {\n        const Icon = TechIcons[project.techCategory] || UnknownIcon;\n        return <li key={ix}><Icon /> <ResearchLink name={project.dataName} displayName={project.friendlyName} /> ({project.currentProgress.toFixed(0)}/{project.researchCost}, +{project.cpBonus} CP)</li>;\n      })}\n    </ul>\n  );\n}\n\nexport function HabsAvailableMaxOrgProjects({ analysis }: { analysis: Analysis }) {\n  const { availableMaxOrgProjects } = analysis;\n  if (availableMaxOrgProjects.length === 0) return null;\n  return (\n    <ul>\n      {availableMaxOrgProjects.toSorted((a, b) => a.researchCost - b.researchCost).map((project, ix) => {\n        const Icon = TechIcons[project.techCategory] || UnknownIcon;\n        return <li key={ix}><Icon /> <ResearchLink name={project.dataName} displayName={project.friendlyName} /> ({project.researchCost})</li>;\n      })}\n    </ul>\n  );\n}\n\nexport function HabsAvailableExpandNations({ analysis }: { analysis: Analysis }) {\n  const { availableExpandNationProjects } = analysis;\n  if (availableExpandNationProjects.length === 0) return null;\n  return (\n    <ul>\n      {availableExpandNationProjects.toSorted((a, b) => {\n        const aRemaining = a.researchCost - a.currentProgress;\n        const bRemaining = b.researchCost - b.currentProgress;\n        return aRemaining - bRemaining;\n      }).map((project, ix) => {\n        const Icon = TechIcons[project.techCategory] || UnknownIcon;\n        return <li key={ix}><Icon /> <ResearchLink name={project.dataName} displayName={project.friendlyName} /> ({project.currentProgress.toFixed(0)}/{project.researchCost}, {project.requiresNation})</li>;\n      })}\n    </ul>\n  );\n}\n\nexport function HabsAvailableStealableProjects({ analysis }: { analysis: Analysis }) {\n  const { playerStealableProjects, factionsById, projects } = analysis;\n  if (playerStealableProjects.length === 0) return null;\n  return (\n    <ul>\n      {playerStealableProjects.map(({ projectName, factionId }, ix) => {\n        const faction = factionsById.get(factionId);\n        if (!faction) return null;\n        const FactionIcon = faction.templateName ? FactionIcons[faction.templateName] : UnknownIcon;\n        const project = projects.get(projectName);\n        if (!project) return null;\n        const Icon = TechIcons[project.techCategory] || UnknownIcon;\n        return <li key={ix}><FactionIcon title={faction.displayName!} /> {faction.displayName} <Icon /> <ResearchLink name={projectName} displayName={project.displayName!} /> ({project.researchCost})</li>;\n      })}\n    </ul>\n  );\n}\n\nexport function HabsTechnologyGoals({ analysis }: { analysis: Analysis }) {\n  const { goals, addGoal, removeGoal } = useTechnologyGoals(analysis);\n  return (\n    <>\n      <TechnologyGoalsDialog analysis={analysis} goals={goals} onAdd={addGoal} onRemove={removeGoal} />\n      <ResearchLink displayName=\"Tech Tree\" className=\"ml-5\" />\n      <br /><br />\n      <TechnologyGoalsList analysis={analysis} goals={goals} onRemove={removeGoal} />\n    </>\n  );\n}\n\nexport function HabsManageHabs({ analysis }: { analysis: Analysis }) {\n  const time = formatDateTime(analysis.gameCurrentDateTime);\n  const { playerHabs } = analysis;\n  const habsWithoutSolarPowerMultipler = playerHabs.filter((hab) => hab.hasSolar && !hab.solarMultiplier).toSorted((a, b) => a.finderSortOverride - b.finderSortOverride);\n\n  return (\n    <>\n      {habsWithoutSolarPowerMultipler.length > 0 && (\n        <>\n          <h3>Habs without Solar Power Multiplier</h3>\n          <ul>{habsWithoutSolarPowerMultipler.map((hab) => <li key={hab.id}>{hab.displayName} - site/orbit id: {hab.habSiteId || hab.orbitStateId}</li>)}</ul>\n        </>\n      )}\n      <Table>\n        <HabScienceHeader />\n        <TableBody>\n          {playerHabs.map((hab) => <HabScienceTableRow hab={hab} key={hab.id} time={time} />)}\n        </TableBody>\n      </Table>\n    </>\n  );\n}\n\nexport function HabsManageMines({ analysis }: { analysis: Analysis }) {\n  const [mineSortResource, setMineSortResource] = useState<\"water\" | \"volatiles\" | \"metals\" | \"nobles\" | \"fissiles\" | null>(null);\n  const [mineSortDirection, setMineSortDirection] = useState<\"asc\" | \"desc\" | null>(null);\n  const { playerHabs } = analysis;\n\n  const handleMineResourceSort = (resource: \"water\" | \"volatiles\" | \"metals\" | \"nobles\" | \"fissiles\") => {\n    if (mineSortResource === resource) {\n      if (mineSortDirection === \"desc\") setMineSortDirection(\"asc\");\n      else if (mineSortDirection === \"asc\") { setMineSortResource(null); setMineSortDirection(null); }\n    } else {\n      setMineSortResource(resource);\n      setMineSortDirection(\"desc\");\n    }\n  };\n\n  const sortedMineHabs = [...playerHabs].filter((i) => i.habType === \"Base\").sort((a, b) => {\n    if (!mineSortResource || !mineSortDirection) return 0;\n    const resourceKey = `${mineSortResource}_month` as keyof typeof a.currentMinePoweredEffects;\n    const aValue = a.currentMinePoweredEffects[resourceKey];\n    const bValue = b.currentMinePoweredEffects[resourceKey];\n    return mineSortDirection === \"asc\" ? (aValue < bValue ? -1 : aValue > bValue ? 1 : 0) : (bValue < aValue ? -1 : bValue > aValue ? 1 : 0);\n  });\n\n  const activeMineSummary = playerHabs.filter((h) => h.site).reduce((acc, hab) => {\n    const effects = hab.currentMineEffects;\n    if (effects.water_month > 0 || effects.volatiles_month > 0 || effects.metals_month > 0 || effects.nobles_month > 0 || effects.fissiles_month > 0) {\n      acc.count++;\n      acc.water_month += effects.water_month; acc.volatiles_month += effects.volatiles_month;\n      acc.metals_month += effects.metals_month; acc.nobles_month += effects.nobles_month;\n      acc.fissiles_month += effects.fissiles_month;\n    }\n    return acc;\n  }, { count: 0, water_month: 0, volatiles_month: 0, metals_month: 0, nobles_month: 0, fissiles_month: 0, miningModifier: 0 } as any);\n\n  const mineSummary = playerHabs.filter((h) => h.site).reduce((acc, hab) => {\n    const effects = hab.bestMineEffects;\n    acc.count++;\n    acc.water_month += effects.water_month; acc.volatiles_month += effects.volatiles_month;\n    acc.metals_month += effects.metals_month; acc.nobles_month += effects.nobles_month;\n    acc.fissiles_month += effects.fissiles_month;\n    return acc;\n  }, { count: 0, water_month: 0, volatiles_month: 0, metals_month: 0, nobles_month: 0, fissiles_month: 0, miningModifier: 0 } as any);\n\n  return (\n    <div className=\"py-2 space-y-2\">\n      <Card>\n        <CardHeader><CardTitle>Mining Bonuses</CardTitle></CardHeader>\n        <CardContent>\n          <div className=\"flex gap-4 text-sm\">\n            <button className=\"flex items-center gap-1 cursor-pointer hover:underline\" onClick={() => handleMineResourceSort(\"water\")}><Water />{((analysis.playerFaction.miningMultipliers.water - 1) * 100).toFixed(0)}%</button>\n            <button className=\"flex items-center gap-1 cursor-pointer hover:underline\" onClick={() => handleMineResourceSort(\"volatiles\")}><Volatiles />{((analysis.playerFaction.miningMultipliers.volatiles - 1) * 100).toFixed(0)}%</button>\n            <button className=\"flex items-center gap-1 cursor-pointer hover:underline\" onClick={() => handleMineResourceSort(\"metals\")}><Metals />{((analysis.playerFaction.miningMultipliers.metals - 1) * 100).toFixed(0)}%</button>\n            <button className=\"flex items-center gap-1 cursor-pointer hover:underline\" onClick={() => handleMineResourceSort(\"nobles\")}><Nobles />{((analysis.playerFaction.miningMultipliers.nobles - 1) * 100).toFixed(0)}%</button>\n            <button className=\"flex items-center gap-1 cursor-pointer hover:underline\" onClick={() => handleMineResourceSort(\"fissiles\")}><Fissiles />{((analysis.playerFaction.miningMultipliers.fissiles - 1) * 100).toFixed(0)}%</button>\n          </div>\n        </CardContent>\n      </Card>\n      <Card><CardHeader><CardTitle>Base income from active mines</CardTitle></CardHeader><CardContent>\n        <span>{activeMineSummary.count} active mines</span> <ShowHabMineEffects effects={activeMineSummary} />\n      </CardContent></Card>\n      <Card><CardHeader><CardTitle>Base income from potential mines</CardTitle></CardHeader><CardContent>\n        <span>{mineSummary.count} potential mines</span> <ShowHabMineEffects effects={mineSummary} />\n      </CardContent></Card>\n      <Table><HabMineHeader /><TableBody>{sortedMineHabs.map((hab) => <HabMineTableRow hab={hab} key={hab.id} time={formatDateTime(analysis.gameCurrentDateTime)} />)}</TableBody></Table>\n    </div>\n  );\n}\n\nexport function HabsComponent({ analysis }: { analysis: Analysis }) {\n  return (\n    <SmartAccordion type=\"multiple\" defaultValue={[\"current-bonuses\", \"future-bonuses\", \"available-cp-projects\"]} storageKey=\"habs\">\n      <AccordionItem value=\"current-bonuses\"><AccordionTrigger><span>Current Hab bonuses</span></AccordionTrigger><AccordionContent><HabsCurrentBonuses analysis={analysis} /></AccordionContent></AccordionItem>\n      <AccordionItem value=\"future-bonuses\"><AccordionTrigger><span>Future Hab bonuses (including unpowered/under-construction)</span></AccordionTrigger><AccordionContent><HabsFutureBonuses analysis={analysis} /></AccordionContent></AccordionItem>\n      <AccordionItem value=\"boost-mc-summary\"><AccordionTrigger><span>MC/Boost Income Summary</span></AccordionTrigger><AccordionContent><HabsBoostMcSummary analysis={analysis} /></AccordionContent></AccordionItem>\n      <AccordionItem value=\"alien-hate\"><AccordionTrigger><span>Alien Hate</span></AccordionTrigger><AccordionContent><HabsAlienHate analysis={analysis} /></AccordionContent></AccordionItem>\n      <AccordionItem value=\"building-details\"><AccordionTrigger><span>Building Details</span></AccordionTrigger><AccordionContent><HabsBuildingDetails analysis={analysis} /></AccordionContent></AccordionItem>\n      {analysis.availableBoostProjects.length > 0 && <AccordionItem value=\"available-boost-projects\"><AccordionTrigger><span>Available Boost Projects</span></AccordionTrigger><AccordionContent><HabsAvailableBoostProjects analysis={analysis} /></AccordionContent></AccordionItem>}\n      {analysis.availableCPProjects.length > 0 && <AccordionItem value=\"available-cp-projects\"><AccordionTrigger><span>Available Control Point Projects</span></AccordionTrigger><AccordionContent><HabsAvailableCPProjects analysis={analysis} /></AccordionContent></AccordionItem>}\n      {analysis.availableMaxOrgProjects.length > 0 && <AccordionItem value=\"available-max-org-projects\"><AccordionTrigger><span>Available Max Org Projects</span></AccordionTrigger><AccordionContent><HabsAvailableMaxOrgProjects analysis={analysis} /></AccordionContent></AccordionItem>}\n      {analysis.availableExpandNationProjects.length > 0 && <AccordionItem value=\"available-expand-nation-projects\"><AccordionTrigger><span>Available Expand Nations</span></AccordionTrigger><AccordionContent><HabsAvailableExpandNations analysis={analysis} /></AccordionContent></AccordionItem>}\n      {analysis.playerStealableProjects.length > 0 && <AccordionItem value=\"available-stealable-projects\"><AccordionTrigger><span>Available Stealable Projects</span></AccordionTrigger><AccordionContent><HabsAvailableStealableProjects analysis={analysis} /></AccordionContent></AccordionItem>}\n      <AccordionItem value=\"technology-goals\"><AccordionTrigger><span>Technology goals</span></AccordionTrigger><AccordionContent><HabsTechnologyGoals analysis={analysis} /></AccordionContent></AccordionItem>\n      <AccordionItem value=\"habs\"><AccordionTrigger><span>Manage Habs</span></AccordionTrigger><AccordionContent><HabsManageHabs analysis={analysis} /></AccordionContent></AccordionItem>\n      <AccordionItem value=\"mines\"><AccordionTrigger><span>Manage Mines</span></AccordionTrigger><AccordionContent><HabsManageMines analysis={analysis} /></AccordionContent></AccordionItem>\n    </SmartAccordion>\n  );\n}\n\n// Section-specific content renderers for tree navigation\nexport function HabsContent({ analysis, section }: { analysis: Analysis; section: string }) {\n  switch (section) {\n    case \"current-bonuses\": return <HabsCurrentBonuses analysis={analysis} />;\n    case \"future-bonuses\": return <HabsFutureBonuses analysis={analysis} />;\n    case \"boost-mc-summary\": return <HabsBoostMcSummary analysis={analysis} />;\n    case \"alien-hate\": return <HabsAlienHate analysis={analysis} />;\n    case \"building-details\": return <HabsBuildingDetails analysis={analysis} />;\n    case \"available-boost-projects\": return <HabsAvailableBoostProjects analysis={analysis} />;\n    case \"available-cp-projects\": return <HabsAvailableCPProjects analysis={analysis} />;\n    case \"available-max-org-projects\": return <HabsAvailableMaxOrgProjects analysis={analysis} />;\n    case \"available-expand-nation-projects\": return <HabsAvailableExpandNations analysis={analysis} />;\n    case \"available-stealable-projects\": return <HabsAvailableStealableProjects analysis={analysis} />;\n    case \"technology-goals\": return <HabsTechnologyGoals analysis={analysis} />;\n    case \"habs\": return <HabsManageHabs analysis={analysis} />;\n    case \"mines\": return <HabsManageMines analysis={analysis} />;\n    default: return <div>Unknown section: {section}</div>;\n  }\n}\n\nimport { AccordionItem, AccordionTrigger, AccordionContent } from \"@/components/ui/accordion\";\n",
  "filePath": "terra-invicta-assistant\\src\\app\\game\\current\\habs.tsx"
}
```

**Output:**
```
Wrote file successfully.
```

---

## Assistant (Build · Qwen 3.6-35B-A3B (local) · 116.2s)

_Thinking:_

Now let me update resources.tsx and drives.tsx to export their section components.

**Tool: write**

**Input:**
```json
{
  "content": "\"use client\";\n\nimport { Boost, ControlPoint, FactionIcons, MissionControl, PrioritySpoils, ResourceIcons } from \"@/components/icons\";\nimport { pct } from \"@/components/showEffects\";\nimport { AccordionContent, AccordionItem, AccordionTrigger } from \"@/components/ui/accordion\";\nimport { Button } from \"@/components/ui/button\";\nimport { Collapsible, CollapsibleContent, CollapsibleTrigger } from \"@/components/ui/collapsible\";\nimport { SmartAccordion } from \"@/components/ui/smart-accordion\";\nimport { Table, TableBody, TableFooter, TableHead, TableHeader, TableRow } from \"@/components/ui/table\";\nimport { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from \"@/components/ui/tooltip\";\nimport { Analysis } from \"@/lib/analysis\";\nimport { ClaimCoverage } from \"@/lib/analysis/nations\";\nimport { diffDateTime, smartRound, sortByDateTime, toDays } from \"@/lib/utils\";\nimport { Trash2 } from \"lucide-react\";\nimport { twMerge } from \"tailwind-merge\";\n\nfunction getNationBg(nation: Pick<Analysis[\"nations\"][0], \"wastedOppression\" | \"tooHighUnrest\" | \"couldBuildBoost\" | \"spoilsWithoutAllCPs\">) {\n  return twMerge(nation.couldBuildBoost ? \"bg-green-100\" : \"\", nation.tooHighUnrest ? \"bg-yellow-100\" : \"\", nation.spoilsWithoutAllCPs ? \"bg-yellow-100\" : \"\", nation.wastedOppression ? \"bg-red-100\" : \"\");\n}\n\nconst NationCPDetails = ({ analysis, nation }: { nation: Analysis[\"nations\"][0]; analysis: Analysis }) => {\n  const { factionsById, playerFaction: { permaAbandonedNationIds, id: playerFactionId } } = analysis;\n  return (\n    <>\n      {nation.controlPoints.length\n        ? nation.controlPoints.map((cp) => {\n            const faction = factionsById.get(cp.factionId!);\n            const FactionIcon = faction ? FactionIcons[faction.templateName as keyof typeof FactionIcons] : ControlPoint;\n            return <FactionIcon key={cp.id} className={twMerge(cp.benefitsDisabled ? \"bg-red-200\" : \"\", \"p-1 rounded\")} />;\n          })\n        : null}{\" \"}\n      ({smartRound(nation.totalCpCost)} cost, {smartRound(nation.investmentPoints)} IP)\n      {(() => {\n        const earliestCrackdown = sortByDateTime(nation.controlPoints.filter((cp) => cp.crackdownExpiration), (cp) => cp.crackdownExpiration!)[0];\n        if (earliestCrackdown) return <span>{\" \"}({toDays(diffDateTime(earliestCrackdown.crackdownExpiration!, analysis.gameCurrentDateTime)).toFixed(0)}d)</span>;\n        return null;\n      })()}\n      {nation.controlPoints.some((cp) => cp.benefitsDisabled && cp.factionId == playerFactionId) && permaAbandonedNationIds.includes(nation.id) && (\n        <span title=\"Perma-abandoned nation\"><Trash2 className=\"inline-block h-4 w-4 stroke-destructive -mt-1 mx-1\" /></span>\n      )}\n    </>\n  );\n};\n\nconst RELATIONSHIP_LABELS: Record<string, string> = { war: \"War\", federation: \"Federation\", ally: \"Ally\", neutral: \"Neutral\", rival: \"Rival\" };\nconst RELATIONSHIP_COLORS: Record<string, string> = { war: \"text-red-600 font-bold\", federation: \"text-blue-700 font-medium\", ally: \"text-green-700 font-medium\", neutral: \"\", rival: \"text-red-700 font-medium\" };\n\nfunction ClaimCoverageCell({ coverage }: { coverage: ClaimCoverage }) {\n  if (coverage.totalRegions === 0) return <span className=\"text-muted-foreground\">N/A</span>;\n  const allCovered = coverage.missing === 0;\n  if (allCovered && coverage.hostile === 0) return <span className=\"text-green-600 font-medium\" title=\"All regions covered, all non-hostile\">✓ all</span>;\n  if (allCovered) return <span className=\"text-amber-600 font-medium\" title={`All regions covered, but ${coverage.hostile} hostile`}>✓ all <span className=\"text-red-500 text-xs\">({coverage.hostile}⚔)</span></span>;\n  return <span className=\"text-red-600 text-xs font-medium\" title={`${coverage.missing} of ${coverage.totalRegions} missing${coverage.hostile > 0 ? `, ${coverage.hostile}⚔` : \"\"}`}>−{coverage.missing}/{coverage.totalRegions}{coverage.hostile > 0 && <span className=\"text-red-500\"> ({coverage.hostile}⚔)</span>}</span>;\n}\n\n// ─── Section Components ───\n\nexport function ResourcesTransactions({ analysis }: { analysis: Analysis }) {\n  const { monthlyTransactionSummary, playerFaction } = analysis;\n  const bySourceByResource = monthlyTransactionSummary.reduce((acc, curr) => {\n    if (!acc.has(curr.source)) acc.set(curr.source, new Map<string, { amount: number; transactions: { date: string; amount: number }[] }>());\n    const resourceMap = acc.get(curr.source)!;\n    const existing = resourceMap.get(curr.resource) || { amount: 0, transactions: [] };\n    existing.amount += curr.amount;\n    if (curr.transactions && curr.transactions.length > 0) existing.transactions.push(...curr.transactions);\n    resourceMap.set(curr.resource, existing);\n    return acc;\n  }, new Map<string, Map<string, { amount: number; transactions: { date: string; amount: number }[] }>>());\n\n  const byResource = monthlyTransactionSummary.reduce((acc, curr) => {\n    if (!acc.has(curr.resource)) acc.set(curr.resource, 0);\n    acc.set(curr.resource, acc.get(curr.resource)! + curr.amount);\n    return acc;\n  }, new Map<string, number>());\n\n  const resourcesSet = new Set([\"Money\", \"Influence\", \"Operations\", \"Research\", \"Boost\", \"Water\", \"Volatiles\", \"Metals\", \"NobleMetals\", \"Fissiles\", \"Antimatter\", \"Exotics\", ...byResource.keys()]);\n  resourcesSet.delete(\"Projects\"); resourcesSet.delete(\"MissionControl\");\n  const resources = [...resourcesSet];\n\n  return (\n    <Table>\n      <TableHeader><TableRow><TableHead>Source</TableHead>\n        {resources.map((resource) => <TableHead key={resource}>{(() => { const Icon = ResourceIcons[resource as keyof typeof ResourceIcons]; return Icon ? <Icon /> : null; })()} {resource}</TableHead>)}</TableRow></TableHeader>\n      <TableBody>\n        {[...bySourceByResource.entries()].map(([source, resourceMap]) => (\n          <TableRow key={source}>\n            <TableCell>{source}</TableCell>\n            {resources.map((resource) => {\n              const data = resourceMap.get(resource);\n              if (!data) return <TableCell key={resource}></TableCell>;\n              const hasTooltip = (resource === \"Exotics\" || resource === \"Antimatter\") && data.transactions.length > 0;\n              const content = smartRound(data.amount);\n              return (\n                <TableCell key={resource}>\n                  {hasTooltip ? (\n                    <TooltipProvider><Tooltip><TooltipTrigger asChild><span className=\"cursor-help\">{content}</span></TooltipTrigger><TooltipContent>\n                      <div className=\"space-y-1\">{data.transactions.map((txn, i) => <div key={i}>{txn.date}: {smartRound(txn.amount)}</div>)}</div>\n                    </TooltipContent></Tooltip></TooltipProvider>\n                  ) : <>{content}</>}\n                </TableCell>\n              );\n            })}\n          </TableRow>\n        ))}\n      </TableBody>\n      <TableFooter>\n        <TableRow><TableHead>Total</TableHead>\n          {resources.map((resource) => <TableHead key={resource}>{smartRound(byResource.get(resource) || 0)}</TableHead>)}\n        </TableRow>\n      </TableFooter>\n    </Table>\n  );\n}\n\nexport function ResourcesOwnedNations({ analysis }: { analysis: Analysis }) {\n  const { nations, playerFaction } = analysis;\n  const playerFactionId = playerFaction.id;\n  return (\n    <Table>\n      <TableHeader>\n        <TableRow><TableHead>Nation</TableHead><TableHead>Control Points</TableHead><TableHead>Opp P</TableHead>\n          <TableHead>Boost P</TableHead><TableHead>MC P</TableHead><TableHead>Spoil P</TableHead><TableHead>Unrest</TableHead>\n          <TableHead>Total Spoils</TableHead><TableHead>Total Spoils Per Point</TableHead><TableHead>Total Spoils Per CP Cost</TableHead>\n          <TableHead>Current MC / Boost</TableHead><TableHead>Boost/mo Per CP Cost</TableHead><TableHead>MC Per CP Cost</TableHead></TableRow>\n      </TableHeader>\n      <TableBody>\n        {nations.filter((i) => i.controlPoints.some((cp) => cp.factionId === playerFactionId)).toSorted((a, b) => (a.totalSpoilsPerCpCost < b.totalSpoilsPerCpCost ? 1 : -1)).map((nation) => (\n          <TableRow key={nation.id} className={getNationBg(nation)}>\n            <TableCell>{nation.displayName}</TableCell>\n            <TableCell><NationCPDetails analysis={analysis} nation={nation} /></TableCell>\n            <TableCell>{nation.allocatedPriorities.Oppression ? pct(nation.allocatedPriorities.Oppression) : null}</TableCell>\n            <TableCell>{nation.allocatedPriorities.LaunchFacilities ? pct(nation.allocatedPriorities.LaunchFacilities) : null}</TableCell>\n            <TableCell>{nation.allocatedPriorities.MissionControl ? pct(nation.allocatedPriorities.MissionControl) : null}</TableCell>\n            <TableCell>{nation.allocatedPriorities.Spoils ? pct(nation.allocatedPriorities.Spoils) : null}</TableCell>\n            <TableCell>{nation.unrest.toFixed(2)}</TableCell>\n            <TableCell><span title={`${nation.valuePerSpoilsIP.toFixed(1)} per IP * ${nation.investmentPoints.toFixed(2)} IP`}>{nation.totalSpoils.toFixed(0)}</span></TableCell>\n            <TableCell>{nation.totalSpoilsPerControlPoint.toFixed(0)}</TableCell>\n            <TableCell>{nation.totalSpoilsPerCpCost.toFixed(2)}</TableCell>\n            <TableCell>{nation.mc.toFixed(0)} <MissionControl /> / {nation.boostPerMonth.toFixed(2)} <Boost /></TableCell>\n            <TableCell>{nation.boostPerMonthPerCpCost.toFixed(2)}</TableCell>\n            <TableCell>{nation.mcPerCpCost.toFixed(2)}</TableCell>\n          </TableRow>\n        ))}\n      </TableBody>\n    </Table>\n  );\n}\n\nexport function ResourcesSpoilTargets({ analysis }: { analysis: Analysis }) {\n  const { nations } = analysis;\n  return (\n    <Table>\n      <TableHeader>\n        <TableRow><TableHead>Nation</TableHead><TableHead>Control Points</TableHead><TableHead>Unrest</TableHead>\n          <TableHead>Total Spoils</TableHead><TableHead>Total Spoils Per Point</TableHead><TableHead>Total Spoils Per CP Cost</TableHead></TableRow>\n      </TableHeader>\n      <TableBody>\n        {nations.toSorted((a, b) => (a.totalSpoilsPerCpCost < b.totalSpoilsPerCpCost ? 1 : -1)).map((nation) => (\n          <TableRow key={nation.id}>\n            <TableCell>{nation.displayName}</TableCell>\n            <TableCell><NationCPDetails analysis={analysis} nation={nation} /></TableCell>\n            <TableCell>{nation.unrest.toFixed(2)}</TableCell>\n            <TableCell><span title={`${nation.valuePerSpoilsIP.toFixed(1)} per IP * ${nation.investmentPoints.toFixed(2)} IP`}>{nation.totalSpoils.toFixed(0)}</span></TableCell>\n            <TableCell>{nation.totalSpoilsPerControlPoint.toFixed(0)}</TableCell>\n            <TableCell>{nation.totalSpoilsPerCpCost.toFixed(2)}</TableCell>\n          </TableRow>\n        ))}\n      </TableBody>\n    </Table>\n  );\n}\n\nexport function ResourcesMcBoostTargets({ analysis }: { analysis: Analysis }) {\n  const { nations } = analysis;\n  return (\n    <Table>\n      <TableHeader>\n        <TableRow><TableHead>Nation</TableHead><TableHead>Control Points</TableHead>\n          <TableHead>Possible Boost IP Per CP Cost</TableHead><TableHead>Current MC / Boost</TableHead>\n          <TableHead>Boost/mo Per CP Cost</TableHead><TableHead>MC Per CP Cost</TableHead></TableRow>\n      </TableHeader>\n      <TableBody>\n        {nations.toSorted((a, b) => {\n          if (a.boostPerMonthPerCpCost !== b.boostPerMonthPerCpCost) return b.possibleBoostPerCpCost - a.possibleBoostPerCpCost;\n          return a.boostPerMonthPerCpCost < b.boostPerMonthPerCpCost ? 1 : -1;\n        }).map((nation) => (\n          <TableRow key={nation.id}>\n            <TableCell>{nation.displayName}</TableCell>\n            <TableCell><NationCPDetails analysis={analysis} nation={nation} /></TableCell>\n            <TableCell>{nation.possibleBoostPerCpCost.toFixed(2)}</TableCell>\n            <TableCell>{nation.mc.toFixed(0)} <MissionControl /> / {nation.boostPerMonth.toFixed(2)} <Boost /></TableCell>\n            <TableCell>{nation.boostPerMonthPerCpCost.toFixed(2)}</TableCell>\n            <TableCell>{nation.mcPerCpCost.toFixed(2)}</TableCell>\n          </TableRow>\n        ))}\n      </TableBody>\n    </Table>\n  );\n}\n\nexport function ResourcesNationClaims({ analysis }: { analysis: Analysis }) {\n  const { nationClaims } = analysis;\n  if (nationClaims.length === 0) return <p className=\"text-sm text-muted-foreground\">No claims found on nations you control.</p>;\n\n  return (\n    <SmartAccordion type=\"multiple\" storageKey=\"nation-claims-accordion\">\n      {nationClaims.map((entry) => (\n        <AccordionItem key={entry.nationId} value={String(entry.nationId)}>\n          <AccordionTrigger>{entry.nationName} <span className=\"text-xs text-muted-foreground ml-1\">({entry.targets.length} claim targets)</span></AccordionTrigger>\n          <AccordionContent>\n            <Table>\n              <TableHeader>\n                <TableRow><TableHead>Target Nation</TableHead><TableHead>Relationship</TableHead>\n                  <TableHead title=\"Earliest date relations can improve (cooldown active if shown)\">Relations After</TableHead>\n                  <TableHead title=\"Earliest date war/rivalry action available (cooldown active if shown)\">War After</TableHead>\n                  <TableHead title=\"Faction controlling the Executive control point\">Executive Faction</TableHead>\n                  <TableHead title=\"Other player-controlled nations with a capital claim on this nation\">Co-claimants</TableHead>\n                  <TableHead title=\"Whether this nation has claims on ALL of the target's current regions\">All Current?</TableHead>\n                  <TableHead title=\"Whether this nation also has claims on all regions the target claims from other nations\">All Claimed?</TableHead></TableRow>\n              </TableHeader>\n              <TableBody>\n                {entry.targets.map((target) => {\n                  const FactionIcon = target.executiveFactionTemplateName ? FactionIcons[target.executiveFactionTemplateName as keyof typeof FactionIcons] : null;\n                  return (\n                    <TableRow key={target.targetNationId}>\n                      <TableCell>\n                        {target.targetNationName}\n                        {target.isCapitalClaim && <span className={`ml-1 text-xs font-medium ${target.isCapitalClaimHostile ? \"text-red-600\" : \"text-amber-700\"}`} title={target.isCapitalClaimHostile ? \"Hostile claim on capital region\" : \"Non-hostile claim on capital region\"}>{target.isCapitalClaimHostile ? \"⚔ capital\" : \"★ capital\"}</span>}\n                        {(() => { const gap = target.governmentGap; const isWarning = gap > 1.5; const sign = gap > 0 ? \"+\" : \"\"; return <span className={`ml-1 text-xs font-medium ${isWarning ? \"text-orange-600\" : \"text-green-600\"}`} title={`Government score difference (target − claimant): ${sign}${gap}`}>{isWarning ? \"⚠\" : \"\"} gov {sign}{gap}</span>; })()}\n                      </TableCell>\n                      <TableCell className={RELATIONSHIP_COLORS[target.relationship]}>{RELATIONSHIP_LABELS[target.relationship]}</TableCell>\n                      <TableCell className=\"text-sm\">{target.relationsCanImproveAfter ?? <span className=\"text-muted-foreground\">–</span>}</TableCell>\n                      <TableCell className=\"text-sm\">{target.warActionAfter ?? <span className=\"text-muted-foreground\">–</span>}</TableCell>\n                      <TableCell className=\"flex items-center gap-1\">{FactionIcon && <FactionIcon className=\"p-1 rounded\" />}{target.executiveFactionName ?? <span className=\"text-muted-foreground\">Uncontrolled</span>}</TableCell>\n                      <TableCell className=\"text-sm\">{target.otherPlayerCapitalClaimants.length > 0 ? target.otherPlayerCapitalClaimants.map((c) => c.nationName).join(\", \") : <span className=\"text-muted-foreground\">–</span>}</TableCell>\n                      <TableCell className=\"text-sm\"><ClaimCoverageCell coverage={target.currentRegionCoverage} /></TableCell>\n                      <TableCell className=\"text-sm\"><ClaimCoverageCell coverage={target.targetClaimCoverage} /></TableCell>\n                    </TableRow>\n                  );\n                })}\n              </TableBody>\n            </Table>\n          </AccordionContent>\n        </AccordionItem>\n      ))}\n    </SmartAccordion>\n  );\n}\n\nexport function ResourcesUnificationCandidates({ analysis }: { analysis: Analysis }) {\n  const { unificationCandidates } = analysis;\n  if (unificationCandidates.length === 0) return <div className=\"p-4 text-muted-foreground\">No unification candidates found.</div>;\n\n  return (\n    <Table>\n      <TableHeader>\n        <TableRow><TableHead title=\"Nation that has the capital claim\">Claimant Nation</TableHead>\n          <TableHead title=\"Nation whose capital is claimed\">Target Nation</TableHead><TableHead>Claim Type</TableHead>\n          <TableHead>Relationship</TableHead><TableHead title=\"Earliest date relations can improve\">Relations After</TableHead>\n          <TableHead title=\"Government scores: claimant / target (red if claimant is more than 1.5 below target)\">Gov Scores</TableHead></TableRow>\n      </TableHeader>\n      <TableBody>\n        {unificationCandidates.map((candidate) => {\n          const govGap = candidate.targetDemocracy - candidate.claimantDemocracy;\n          const govWarning = govGap > 1.5;\n          return (\n            <TableRow key={`${candidate.claimantNationId}:${candidate.targetNationId}`}>\n              <TableCell className=\"font-medium\">{candidate.claimantNationName}</TableCell>\n              <TableCell>{candidate.targetNationName}</TableCell>\n              <TableCell>{candidate.isHostileClaim ? <span className=\"text-red-600 font-medium text-xs\">⚔ hostile</span> : <span className=\"text-amber-700 font-medium text-xs\">★ non-hostile</span>}</TableCell>\n              <TableCell className={RELATIONSHIP_COLORS[candidate.relationship]}>{RELATIONSHIP_LABELS[candidate.relationship]}</TableCell>\n              <TableCell className=\"text-sm\">{candidate.relationsCanImproveAfter ?? <span className=\"text-muted-foreground\">–</span>}</TableCell>\n              <TableCell className=\"text-sm\"><span className={govWarning ? \"text-red-600 font-medium\" : \"\"}>{candidate.claimantDemocracy}</span> / <span>{candidate.targetDemocracy}</span></TableCell>\n            </TableRow>\n          );\n        })}\n      </TableBody>\n    </Table>\n  );\n}\n\nexport function ResourcesComponent({ analysis }: { analysis: Analysis }) {\n  return (\n    <SmartAccordion type=\"single\" collapsible defaultValue=\"transactions\" storageKey=\"resources-accordion\">\n      <AccordionItem value=\"transactions\"><AccordionTrigger><span>Transactions</span></AccordionTrigger><AccordionContent><ResourcesTransactions analysis={analysis} /></AccordionContent></AccordionItem>\n      <AccordionItem value=\"owned\"><AccordionTrigger>Owned nations</AccordionTrigger><AccordionContent><ResourcesOwnedNations analysis={analysis} /></AccordionContent></AccordionItem>\n      <AccordionItem value=\"spoils\"><AccordionTrigger>Spoil targets</AccordionTrigger><AccordionContent><ResourcesSpoilTargets analysis={analysis} /></AccordionContent></AccordionItem>\n      <AccordionItem value=\"space\"><AccordionTrigger>MC/Boost targets</AccordionTrigger><AccordionContent><ResourcesMcBoostTargets analysis={analysis} /></AccordionContent></AccordionItem>\n      <AccordionItem value=\"nation-claims\"><AccordionTrigger>Nation Claims</AccordionTrigger><AccordionContent><ResourcesNationClaims analysis={analysis} /></AccordionContent></AccordionItem>\n      <AccordionItem value=\"unification-candidates\"><AccordionTrigger>Unification Candidates ({analysis.unificationCandidates.length})</AccordionTrigger><AccordionContent><ResourcesUnificationCandidates analysis={analysis} /></AccordionContent></AccordionItem>\n    </SmartAccordion>\n  );\n}\n\nexport function ResourcesContent({ analysis, section }: { analysis: Analysis; section: string }) {\n  switch (section) {\n    case \"transactions\": return <ResourcesTransactions analysis={analysis} />;\n    case \"owned\": return <ResourcesOwnedNations analysis={analysis} />;\n    case \"spoils\": return <ResourcesSpoilTargets analysis={analysis} />;\n    case \"space\": return <ResourcesMcBoostTargets analysis={analysis} />;\n    case \"nation-claims\": return <ResourcesNationClaims analysis={analysis} />;\n    case \"unification-candidates\": return <ResourcesUnificationCandidates analysis={analysis} />;\n    default: return <div>Unknown section: {section}</div>;\n  }\n}\n\nexport function getResourcesUi(analysis: Analysis) {\n  const spoils = analysis.playerFaction.monthlyTransactionSummary.filter((i) => i.resource === \"Money\" && i.source === \"Spoils\").reduce((sum, i) => sum + i.amount, 0);\n  const { mcUsage, mcCurrentLimit, mcAlienWarLimit, mcHateFloor } = analysis.playerFaction;\n  const nationBg = getNationBg(\n    analysis.nations.filter((i) => i.controlPoints.some((cp) => cp.factionId === analysis.playerFaction.id)).reduce((acc, nation) => {\n      acc.wastedOppression = acc.wastedOppression || nation.wastedOppression;\n      acc.tooHighUnrest = acc.tooHighUnrest || nation.tooHighUnrest;\n      acc.couldBuildBoost = acc.couldBuildBoost || nation.couldBuildBoost;\n      acc.spoilsWithoutAllCPs = acc.spoilsWithoutAllCPs || nation.spoilsWithoutAllCPs;\n      return acc;\n    }, { wastedOppression: false, tooHighUnrest: false, couldBuildBoost: false, spoilsWithoutAllCPs: false } as any)\n  );\n  const showMcInfo = mcUsage < 300;\n\n  return {\n    key: \"resources\",\n    tab: (\n      <>\n        <span className={twMerge(nationBg, \"px-1 py-0.5 -mx-1 -my-0.5 rounded\")}>Resources</span>\n        (<PrioritySpoils /> ${spoils.toFixed(0)}\n        {showMcInfo ? (<> , <MissionControl /> {mcUsage.toFixed(0)}/{mcCurrentLimit.toFixed(0)}\n          -<span title=\"If more MC is used than this, alien hate will never fall below 50\">Lim {mcAlienWarLimit.toFixed(0)}</span>\n          <span title=\"Current hate floor\">Flr {mcHateFloor.toFixed(0)}</span></>) : null}\n        )\n      </>\n    ),\n    content: <ResourcesComponent analysis={analysis} />,\n  };\n}\n\nimport { AccordionItem, AccordionTrigger, AccordionContent } from \"@/components/ui/accordion\";\n",
  "filePath": "terra-invicta-assistant\\src\\app\\game\\current\\resources.tsx"
}
```

**Output:**
```
Wrote file successfully.
```

---

## Assistant (Build · Qwen 3.6-35B-A3B (local) · 183.8s)

_Thinking:_

Now let me update drives.tsx to export its section components.

**Tool: write**

**Input:**
```json
{
  "content": "import { Analysis } from \"@/lib/analysis\";\nimport { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from \"@/components/ui/table\";\nimport { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from \"@/components/ui/tooltip\";\nimport { ShowEffects } from \"@/components/showEffects\";\nimport { useState, useMemo } from \"react\";\nimport { ChevronDown, ChevronUp, Plus, Trash2 } from \"lucide-react\";\nimport { smartRound, formatPercent, addMaterials } from \"@/lib/utils\";\nimport { ResearchLink } from \"./researchLink\";\nimport { useTechnologyGoals } from \"./technologyGoals\";\nimport { Button } from \"@/components/ui/button\";\nimport { Water, Volatiles, Metals, Nobles, Fissiles, Antimatter } from \"@/components/icons\";\nimport { Input } from \"@/components/ui/input\";\nimport { Label } from \"@/components/ui/label\";\nimport { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from \"@/components/ui/select\";\nimport { SmartAccordion } from \"@/components/ui/smart-accordion\";\nimport { AccordionItem, AccordionTrigger, AccordionContent } from \"@/components/ui/accordion\";\nimport { Materials } from \"@/lib/templates\";\nimport { twMerge } from \"tailwind-merge\";\n\ntype SortColumn = \"friendlyName\" | \"thrust_N\" | \"EV_kps\" | \"efficiency\" | \"cooling\" | \"powerRequiredGW\" | \"reactorAndRadiatorTons\" | \"thrustRating\" | \"exhaustRating\" | \"overallRating\" | \"unlockChance\" | \"tanksAffordable\" | \"techResearchRemaining\" | \"projectResearchRemaining\" | \"shipDeltaV\" | \"accelerationMilliGs\" | \"tripTime\";\ntype SortDirection = \"asc\" | \"desc\";\n\nfunction DrivesTable({ analysis }: { analysis: Analysis }) {\n  const [sortColumn, setSortColumn] = useState<SortColumn>(\"friendlyName\");\n  const [sortDirection, setSortDirection] = useState<SortDirection>(\"asc\");\n  const { goals, addGoal, removeGoal } = useTechnologyGoals(analysis);\n\n  const handleSort = (column: SortColumn) => {\n    if (sortColumn === column) setSortDirection(sortDirection === \"asc\" ? \"desc\" : \"asc\");\n    else { setSortColumn(column); setSortDirection(\"asc\"); }\n  };\n\n  const drives = analysis.drives.toSorted((a, b) => {\n    const aInGoals = goals.some((g) => g.name === a.requiredProjectName);\n    const bInGoals = goals.some((g) => g.name === b.requiredProjectName);\n    if (aInGoals !== bInGoals) return aInGoals ? -1 : 1;\n    let compareValue = 0;\n    switch (sortColumn) {\n      case \"friendlyName\": compareValue = a.friendlyName.localeCompare(b.friendlyName); break;\n      case \"thrust_N\": compareValue = a.thrust_N - b.thrust_N; break;\n      case \"EV_kps\": compareValue = a.EV_kps - b.EV_kps; break;\n      case \"efficiency\": compareValue = a.efficiency - b.efficiency; break;\n      case \"cooling\": compareValue = a.cooling.localeCompare(b.cooling); break;\n      case \"powerRequiredGW\": compareValue = a.powerRequiredGW - b.powerRequiredGW; break;\n      case \"reactorAndRadiatorTons\": compareValue = (a.reactorAndRadiatorTons ?? Infinity) - (b.reactorAndRadiatorTons ?? Infinity); break;\n      case \"thrustRating\": compareValue = a.thrustRating - b.thrustRating; break;\n      case \"exhaustRating\": compareValue = a.exhaustRating - b.exhaustRating; break;\n      case \"overallRating\": compareValue = a.overallRating - b.overallRating; break;\n      case \"unlockChance\": compareValue = (a.unlockChance ?? 100) - (b.unlockChance ?? 100); break;\n      case \"tanksAffordable\": compareValue = a.tanksAffordable - b.tanksAffordable; break;\n      case \"techResearchRemaining\": compareValue = a.techResearchRemaining - b.techResearchRemaining; break;\n      case \"projectResearchRemaining\": compareValue = a.projectResearchRemaining - b.projectResearchRemaining; break;\n      case \"shipDeltaV\": compareValue = a.shipDeltaV - b.shipDeltaV; break;\n      case \"accelerationMilliGs\": compareValue = a.accelerationMilliGs - b.accelerationMilliGs; break;\n      case \"tripTime\": compareValue = a.tripTime - b.tripTime; break;\n    }\n    return sortDirection === \"asc\" ? compareValue : -compareValue;\n  });\n\n  const SortIcon = ({ column }: { column: SortColumn }) => {\n    if (sortColumn !== column) return null;\n    return sortDirection === \"asc\" ? <ChevronUp className=\"inline h-4 w-4\" /> : <ChevronDown className=\"inline h-4 w-4\" />;\n  };\n\n  return (\n    <div className=\"space-y-4\">\n      <div>\n        {analysis.bestRadiator && <p className=\"text-sm text-muted-foreground\">Best available radiator: <span className=\"font-medium\">{analysis.bestRadiator.friendlyName}</span> ({smartRound(1 / analysis.bestRadiator.gwPerTon)} ton/GW)</p>}\n        {!analysis.bestRadiator && <p className=\"text-sm text-muted-foreground\">No radiators available yet</p>}\n      </div>\n      <Table>\n        <TableHeader>\n          <TableRow><TableHead></TableHead><TableHead colSpan={16}></TableHead>\n            <TableHead colSpan={4} className=\"text-center border-l-2 whitespace-normal\" title=\"10k tons dry + radiator + 50 fuel tanks\">Hypothetical Ship</TableHead></TableRow>\n          <TableRow>\n            <TableHead title=\"Add/Remove Technology Goal\">Goal</TableHead>\n            <TableHead className=\"cursor-pointer hover:bg-muted/50\" onClick={() => handleSort(\"friendlyName\")}>Drive Name <SortIcon column=\"friendlyName\" /></TableHead>\n            <TableHead className=\"text-right cursor-pointer hover:bg-muted/50\" onClick={() => handleSort(\"thrust_N\")} title=\"Thrust (kilonewtons)\">Thrust <SortIcon column=\"thrust_N\" /></TableHead>\n            <TableHead className=\"text-right cursor-pointer hover:bg-muted/50\" onClick={() => handleSort(\"EV_kps\")} title=\"Exhaust Velocity (km/s)\">EV <SortIcon column=\"EV_kps\" /></TableHead>\n            <TableHead className=\"text-right cursor-pointer hover:bg-muted/50\" onClick={() => handleSort(\"efficiency\")} title=\"Efficiency (%)\">Efficiency <SortIcon column=\"efficiency\" /></TableHead>\n            <TableHead className=\"cursor-pointer hover:bg-muted/50\" onClick={() => handleSort(\"cooling\")}>Cooling <SortIcon column=\"cooling\" /></TableHead>\n            <TableHead>Propellant</TableHead>\n            <TableHead title=\"Required Power Plant\">Power Plant</TableHead>\n            <TableHead className=\"text-right cursor-pointer hover:bg-muted/50\" onClick={() => handleSort(\"powerRequiredGW\")} title=\"Power Required (GW)\">Power <SortIcon column=\"powerRequiredGW\" /></TableHead>\n            <TableHead className=\"text-right cursor-pointer hover:bg-muted/50\" onClick={() => handleSort(\"reactorAndRadiatorTons\")} title=\"Reactor + Radiator Mass (tons)\">Reactor+Rad <SortIcon column=\"reactorAndRadiatorTons\" /></TableHead>\n            <TableHead className=\"text-right cursor-pointer hover:bg-muted/50\" onClick={() => handleSort(\"thrustRating\")} title=\"Thrust Rating\">Thrust <SortIcon column=\"thrustRating\" /></TableHead>\n            <TableHead className=\"text-right cursor-pointer hover:bg-muted/50\" onClick={() => handleSort(\"exhaustRating\")} title=\"Exhaust Rating\">Exhaust <SortIcon column=\"exhaustRating\" /></TableHead>\n            <TableHead className=\"text-right cursor-pointer hover:bg-muted/50\" onClick={() => handleSort(\"overallRating\")} title=\"Overall Rating\">Overall <SortIcon column=\"overallRating\" /></TableHead>\n            <TableHead className=\"text-right cursor-pointer hover:bg-muted/50\" onClick={() => handleSort(\"unlockChance\")} title=\"Base Unlock Chance (%)\">Unlock <SortIcon column=\"unlockChance\" /></TableHead>\n            <TableHead className=\"text-right cursor-pointer hover:bg-muted/50\" onClick={() => handleSort(\"tanksAffordable\")} title=\"Fuel tanks affordable with current resources\">Tanks <SortIcon column=\"tanksAffordable\" /></TableHead>\n            <TableHead className=\"text-right cursor-pointer hover:bg-muted/50\" onClick={() => handleSort(\"techResearchRemaining\")} title=\"Tech Research Remaining (thousands)\">Tech Res <SortIcon column=\"techResearchRemaining\" /></TableHead>\n            <TableHead className=\"text-right cursor-pointer hover:bg-muted/50\" onClick={() => handleSort(\"projectResearchRemaining\")} title=\"Project Research Remaining (thousands)\">Proj Res <SortIcon column=\"projectResearchRemaining\" /></TableHead>\n            <TableHead className=\"text-right cursor-pointer hover:bg-muted/50 border-l-2\" onClick={() => handleSort(\"shipDeltaV\")} title=\"Ship Delta-V (km/s, 10k tons + radiator + 50 fuel tanks)\">ΔV <SortIcon column=\"shipDeltaV\" /></TableHead>\n            <TableHead className=\"text-right cursor-pointer hover:bg-muted/50\" onClick={() => handleSort(\"accelerationMilliGs\")} title=\"Ship acceleration (milli-gs, at full fuel)\">Accel <SortIcon column=\"accelerationMilliGs\" /></TableHead>\n            <TableHead className=\"text-right cursor-pointer hover:bg-muted/50\" onClick={() => handleSort(\"tripTime\")} title=\"Time to travel 5 AU (days)\">5AU d <SortIcon column=\"tripTime\" /></TableHead>\n            <TableHead className=\"text-right\" title=\"Final Delta-V after 5 AU trip (km/s)\">F dV</TableHead>\n          </TableRow>\n        </TableHeader>\n        <TableBody>\n          {drives.map((drive) => {\n            const isUnlocked = analysis.playerFaction.finishedProjectNames.includes(drive.requiredProjectName);\n            const propellantEffects = { water: drive.propellantMaterials.water, volatiles: drive.propellantMaterials.volatiles, metals: drive.propellantMaterials.metals, nobles: drive.propellantMaterials.nobleMetals, fissiles: drive.propellantMaterials.fissiles, antimatter: drive.propellantMaterials.antimatter };\n            const goalForThisDrive = goals.find((g) => g.name === drive.requiredProjectName);\n            const isInGoals = !!goalForThisDrive;\n            const rowClassName = isInGoals ? \"bg-green-50\" : drive.tanksAffordable < 10 ? \"bg-red-50\" : drive.tanksAffordable < 500 ? (drive.tanksAffordable < 100 ? \"bg-orange-50\" : drive.tanksAffordable < 500 ? \"bg-yellow-50\" : \"\") : \"\";\n\n            return (\n              <TableRow key={drive.dataName} className={rowClassName}>\n                <TableCell className=\"text-center\">\n                  {!isUnlocked && isInGoals && <Button variant=\"outline\" size=\"sm\" onClick={() => removeGoal(goalForThisDrive!.id)} className=\"h-8 w-8 p-0 bg-white\" title=\"Remove from goals\"><Trash2 className=\"h-4 w-4\" /></Button>}\n                  {!isUnlocked && !isInGoals && <Button variant=\"outline\" size=\"sm\" onClick={() => addGoal(\"project\", drive.requiredProjectName)} className=\"h-8 w-8 p-0 bg-white\" title=\"Add to goals\"><Plus className=\"h-4 w-4\" /></Button>}\n                </TableCell>\n                <TableCell className=\"font-medium\"><ResearchLink name={drive.requiredProjectName} displayName={drive.friendlyName} /></TableCell>\n                <TableCell className=\"text-right\" title={`${(drive.thrust_N / 1000).toFixed(1)} kN`}>{Math.round(drive.thrust_N / 1000)}</TableCell>\n                <TableCell className=\"text-right\" title={`${drive.EV_kps.toFixed(1)} km/s`}>{Math.round(drive.EV_kps)}</TableCell>\n                <TableCell className=\"text-right\">{formatPercent(drive.efficiency * 100)}</TableCell>\n                <TableCell title={drive.propellant}>{drive.cooling || \"None\"}</TableCell>\n                <TableCell className=\"text-xs\"><ShowEffects {...propellantEffects} /></TableCell>\n                <TableCell className=\"text-xs\">{drive.requiredPowerPlantDisplayName || \"None\"}</TableCell>\n                <TableCell className=\"text-right\" title={!isNaN(drive.powerRequiredGW) ? [`Thrust Rating: ${smartRound(drive.thrustRating_GW)} GW`, `Required Power (accounts for efficiency): ${smartRound(drive.reqPower_GW)} GW`, `Drive Efficiency: ${formatPercent(drive.efficiency * 100)}`, drive.thrusters > 1 ? `Number of Thrusters: ${drive.thrusters}` : null, drive.reactorEfficiency !== undefined ? `\\nReactor Efficiency: ${formatPercent(drive.reactorEfficiency * 100)}` : null, drive.wasteHeatGW !== undefined ? `Waste Heat: ${smartRound(drive.powerRequiredGW)} GW × ${formatPercent((1 - (drive.reactorEfficiency || 0)) * 100)} = ${smartRound(drive.wasteHeatGW)} GW` : null].filter(Boolean).join(\"\\n\") : undefined}>\n                  {!isNaN(drive.powerRequiredGW) ? smartRound(drive.powerRequiredGW) : \"-\"}\n                </TableCell>\n                <TableCell className=\"text-right\">\n                  {drive.reactorAndRadiatorTons !== undefined ? (\n                    <TooltipProvider><Tooltip><TooltipTrigger asChild><span className=\"cursor-help\">{smartRound(drive.reactorAndRadiatorTons)}</span></TooltipTrigger>\n                      <TooltipContent>\n                        <div className=\"space-y-2\">\n                          {drive.reactorName && <div><div className=\"font-semibold mb-1\">Reactor: {drive.reactorName}</div><div className=\"ml-2 text-xs space-y-1\">\n                            {drive.reactorGW !== undefined && <div>Power Output: {smartRound(drive.reactorGW)} GW</div>}\n                            {drive.reactorTonsPerGW !== undefined && <div>Specific Power: {smartRound(drive.reactorTonsPerGW)} t/GW</div>}\n                            {drive.reactorTons !== undefined && <div>Mass: {smartRound(drive.reactorTons)} tons</div>}\n                            {drive.reactorResources !== undefined && <div>Resources: {smartRound(drive.reactorResources)}</div>}\n                            {drive.reactorMaterials && <div className=\"flex items-center gap-1\"><ShowEffects water={drive.reactorMaterials.water || undefined} volatiles={drive.reactorMaterials.volatiles || undefined} metals={drive.reactorMaterials.metals || undefined} nobles={drive.reactorMaterials.nobleMetals || undefined} /></div>}\n                          </div></div>}\n                          {drive.radiatorName && <div><div className=\"font-semibold mb-1\">Radiator: {drive.radiatorName}</div><div className=\"ml-2 text-xs space-y-1\">\n                            {drive.wasteHeatGW !== undefined && <div>Waste Heat: {smartRound(drive.wasteHeatGW)} GW</div>}\n                            {drive.radiatorGWperTon !== undefined && <div>Cooling: {smartRound(drive.radiatorGWperTon)} GW/t</div>}\n                            {drive.radiatorTons !== undefined && <div>Mass: {smartRound(drive.radiatorTons)} tons</div>}\n                            {drive.radiatorResources !== undefined && <div>Resources: {smartRound(drive.radiatorResources)}</div>}\n                            {drive.radiatorMaterials && <div className=\"flex items-center gap-1\"><ShowEffects volatiles={drive.radiatorMaterials.volatiles || undefined} metals={drive.radiatorMaterials.metals || undefined} nobles={drive.radiatorMaterials.nobles || undefined} exotics={drive.radiatorMaterials.exotics || undefined} /></div>}\n                          </div></div>}\n                        </div>\n                      </TooltipContent>\n                    </Tooltip></TooltipProvider>\n                  ) : <span title={drive.reactorDebugInfo || \"No reactor found\"}>-</span>}\n                </TableCell>\n                <TableCell className=\"text-right\">{drive.thrustRating.toFixed(2)}</TableCell>\n                <TableCell className=\"text-right\">{drive.exhaustRating.toFixed(2)}</TableCell>\n                <TableCell className=\"text-right\">{drive.overallRating.toFixed(2)}</TableCell>\n                <TableCell className=\"text-right\">{drive.unlockChance !== undefined ? `${drive.unlockChance}%` : \"\"}</TableCell>\n                <TableCell className=\"text-right\">\n                  {drive.tanksAffordable} {drive.limitingResourceName && (() => {\n                    const ResourceIcon = { Water, Volatiles, Metals, NobleMetals: Nobles, Fissiles, Antimatter }[drive.limitingResourceName];\n                    return ResourceIcon ? <ResourceIcon /> : null;\n                  })()}\n                </TableCell>\n                <TableCell className=\"text-right\" title={drive.requiredTechs.length > 0 ? drive.requiredTechs.map((name: string) => analysis.techs.get(name)?.displayName || name).join(\"\\n\") : undefined}>\n                  {drive.techResearchRemaining > 0 ? smartRound(drive.techResearchRemaining / 1000) : \"-\"}\n                </TableCell>\n                <TableCell className=\"text-right\" title={drive.requiredProjects.length > 0 ? drive.requiredProjects.map((name: string) => analysis.projects.get(name)?.displayName || name).join(\"\\n\") : undefined}>\n                  {drive.projectResearchRemaining > 0 ? smartRound(drive.projectResearchRemaining / 1000) : \"-\"}\n                </TableCell>\n                <TableCell className=\"text-right\">{smartRound(drive.shipDeltaV / 1000)}</TableCell>\n                <TableCell className=\"text-right\">{smartRound(drive.accelerationMilliGs)}</TableCell>\n                <TableCell className=\"text-right\" title={drive.tripType}>{smartRound(drive.tripTime / 86400)}</TableCell>\n                <TableCell className=\"text-right\">{drive.remainingDeltaV > 0 ? smartRound(drive.remainingDeltaV / 1000) : \"-\"}</TableCell>\n              </TableRow>\n            );\n          })}\n        </TableBody>\n      </Table>\n    </div>\n  );\n}\n\ntype CalcSortColumn = \"driveName\" | \"driveEfficiency\" | \"reactorEfficiency\" | \"tanks\" | \"driveMass\" | \"fuelMass\" | \"reactorMass\" | \"radiatorMass\" | \"totalTons\" | \"totalCost\" | \"deltaV\" | \"acceleration\" | \"travelDays\" | \"techResearchRemaining\" | \"projectResearchRemaining\" | \"unlockChance\";\n\ninterface CalcParams { dryMassTons: number; radiatorDataName: string; targetDeltaVKps: number; targetDistanceAU: number; }\n\nfunction computeCalcRow(drive: Analysis[\"drives\"][0], radiator: Analysis[\"radiators\"][0] | undefined, params: CalcParams) {\n  if (drive.reactorTons === undefined) return null;\n  const needsRadiator = drive.cooling === \"Calc\" || drive.cooling === \"Closed\";\n  const radiatorTons = needsRadiator && radiator ? (drive.wasteHeatGW || 0) / radiator.gwPerTon : 0;\n  const fixedMassTons = params.dryMassTons + (drive.reactorTons || 0) + radiatorTons;\n  const EV_ms = drive.EV_kps * 1000;\n  const targetDV_ms = params.targetDeltaVKps * 1000;\n  const massRatio = Math.exp(targetDV_ms / EV_ms);\n  const requiredFuelMassTons = fixedMassTons * (massRatio - 1);\n  const requiredTanks = Math.ceil(requiredFuelMassTons / 100);\n  if (requiredTanks > 1000) return null;\n  const tanksNeeded = Math.max(1, requiredTanks);\n  const fuelMassTons = tanksNeeded * 100;\n  const totalMassTons = fixedMassTons + fuelMassTons;\n  const actualDeltaVMs = EV_ms * Math.log(totalMassTons / fixedMassTons);\n  const actualDeltaVKps = actualDeltaVMs / 1000;\n  const totalMassKg = totalMassTons * 1000;\n  const accelerationMs2 = drive.thrust_N / totalMassKg;\n  const accelerationMilliGs = (accelerationMs2 / 9.81) * 1000;\n  const targetDistanceM = params.targetDistanceAU * 149597870700;\n  const midpointDistance = targetDistanceM / 2;\n  const avgMassKg = ((totalMassTons + fixedMassTons) / 2) * 1000;\n  const avgAcceleration = drive.thrust_N / avgMassKg;\n  const timeToMidpoint = Math.sqrt((2 * midpointDistance) / avgAcceleration);\n  const velocityAtMidpoint = avgAcceleration * timeToMidpoint;\n  const deltaVNeeded = 2 * velocityAtMidpoint;\n  let travelDays: number;\n  if (deltaVNeeded <= actualDeltaVMs) { travelDays = (timeToMidpoint * 2) / 86400; }\n  else {\n    const maxVelocity = actualDeltaVMs / 2;\n    const accelDistance = (maxVelocity * maxVelocity) / (2 * avgAcceleration);\n    const coastDistance = targetDistanceM - 2 * accelDistance;\n    const accelTime = maxVelocity / avgAcceleration;\n    travelDays = coastDistance > 0 ? (2 * accelTime + coastDistance / maxVelocity) / 86400 : (2 * accelTime) / 86400;\n  }\n  const radiatorResources = radiatorTons / 10;\n  const radiatorCost = radiator && needsRadiator ? addMaterials(radiator.weightedBuildMaterials, undefined, radiatorResources) : {};\n  const fuelCost = addMaterials(drive.propellantMaterials, undefined, tanksNeeded);\n  const rc = drive.reactorMaterials || {};\n  const driveRes = (drive.flatMass_tons || 0) / 10;\n  const driveCost = drive.driveBuildMaterials ? addMaterials(drive.driveBuildMaterials, undefined, driveRes) : {};\n  const totalCost = addMaterials(rc, addMaterials(radiatorCost, addMaterials(fuelCost, driveCost)));\n  const totalCostResources = Object.values(totalCost).reduce((a, b) => a + b, 0);\n  const hardwareMass = (drive.reactorTons || 0) + radiatorTons + (drive.flatMass_tons || 0);\n  const totalTons = params.dryMassTons + (drive.flatMass_tons || 0) + (drive.reactorTons || 0) + radiatorTons + fuelMassTons;\n  return { dataName: drive.dataName, driveName: drive.friendlyName, driveEfficiency: drive.efficiency, propellant: drive.propellant, reactorEfficiency: drive.reactorEfficiency, techResearchRemaining: drive.techResearchRemaining, projectResearchRemaining: drive.projectResearchRemaining, unlockChance: drive.unlockChance, requiredTechs: drive.requiredTechs, requiredProjects: drive.requiredProjects, reactorName: drive.reactorName, reactorTonsPerGW: drive.reactorTonsPerGW, powerRequiredGW: drive.powerRequiredGW, wasteHeatGW: drive.wasteHeatGW, radiatorName: needsRadiator && radiator ? radiator.friendlyName : undefined, radiatorGWperTon: needsRadiator && radiator ? radiator.gwPerTon : undefined, tanks: tanksNeeded, hardwareMass, totalTons, driveMassTons: drive.flatMass_tons || 0, fuelMassTons, reactorMassTons: drive.reactorTons || 0, radiatorMassTons: radiatorTons, driveCost, fuelCost, reactorCost: rc, radiatorCost, totalCost, totalCostResources, deltaV: actualDeltaVKps, acceleration: accelerationMilliGs, travelDays, isUnlocked: false };\n}\n\nfunction DriveCalculator({ analysis }: { analysis: Analysis }) {\n  const bestUnlockedRadiator = analysis.radiators.filter((r) => r.isUnlocked).reduce((best, r) => (!best || r.gwPerTon > best.gwPerTon ? r : best), null as Analysis[\"radiators\"][0] | null);\n  const [dryMassInput, setDryMassInput] = useState(\"10000\");\n  const [radiatorDataName, setRadiatorDataName] = useState(bestUnlockedRadiator?.dataName ?? \"\");\n  const [targetDeltaVInput, setTargetDeltaVInput] = useState(\"250\");\n  const [targetDistanceInput, setTargetDistanceInput] = useState(\"5\");\n  const [params, setParams] = useState<CalcParams>({ dryMassTons: 10000, radiatorDataName: bestUnlockedRadiator?.dataName ?? \"\", targetDeltaVKps: 250, targetDistanceAU: 5 });\n  const [calcSortColumn, setCalcSortColumn] = useState<CalcSortColumn>(\"driveName\");\n  const [calcSortDirection, setCalcSortDirection] = useState<\"asc\" | \"desc\">(\"asc\");\n  const unlockedProjectNames = new Set(analysis.playerFaction.finishedProjectNames);\n\n  const handleUpdate = () => {\n    const dryMass = parseFloat(dryMassInput);\n    const targetDV = parseFloat(targetDeltaVInput);\n    const targetDist = parseFloat(targetDistanceInput);\n    if (!isNaN(dryMass) && !isNaN(targetDV) && !isNaN(targetDist)) setParams({ dryMassTons: dryMass, radiatorDataName, targetDeltaVKps: targetDV, targetDistanceAU: targetDist });\n  };\n\n  const selectedRadiator = useMemo(() => analysis.radiators.find((r) => r.dataName === params.radiatorDataName), [analysis.radiators, params.radiatorDataName]);\n\n  const rows = useMemo(() => analysis.drives.map((drive) => {\n    const row = computeCalcRow(drive, selectedRadiator, params);\n    if (!row) return null;\n    return { ...row, isUnlocked: unlockedProjectNames.has(drive.requiredProjectName) };\n  }).filter((r): r is NonNullable<typeof r> => r !== null), [analysis.drives, params, selectedRadiator]);\n\n  const handleCalcSort = (col: CalcSortColumn) => {\n    if (calcSortColumn === col) setCalcSortDirection(calcSortDirection === \"asc\" ? \"desc\" : \"asc\");\n    else { setCalcSortColumn(col); setCalcSortDirection(\"asc\"); }\n  };\n\n  const sortedRows = useMemo(() => rows.toSorted((a, b) => {\n    let cmp = 0;\n    switch (calcSortColumn) {\n      case \"driveName\": cmp = a.driveName.localeCompare(b.driveName); break;\n      case \"driveEfficiency\": cmp = a.driveEfficiency - b.driveEfficiency; break;\n      case \"reactorEfficiency\": cmp = (a.reactorEfficiency ?? 0) - (b.reactorEfficiency ?? 0); break;\n      case \"tanks\": cmp = a.tanks - b.tanks; break;\n      case \"driveMass\": cmp = a.driveMassTons - b.driveMassTons; break;\n      case \"fuelMass\": cmp = a.fuelMassTons - b.fuelMassTons; break;\n      case \"reactorMass\": cmp = a.reactorMassTons - b.reactorMassTons; break;\n      case \"radiatorMass\": cmp = a.radiatorMassTons - b.radiatorMassTons; break;\n      case \"totalTons\": cmp = a.totalTons - b.totalTons; break;\n      case \"totalCost\": cmp = a.totalCostResources - b.totalCostResources; break;\n      case \"deltaV\": cmp = a.deltaV - b.deltaV; break;\n      case \"acceleration\": cmp = a.acceleration - b.acceleration; break;\n      case \"travelDays\": cmp = a.travelDays - b.travelDays; break;\n      case \"techResearchRemaining\": cmp = a.techResearchRemaining - b.techResearchRemaining; break;\n      case \"projectResearchRemaining\": cmp = a.projectResearchRemaining - b.projectResearchRemaining; break;\n      case \"unlockChance\": cmp = (a.unlockChance ?? 100) - (b.unlockChance ?? 100); break;\n    }\n    return calcSortDirection === \"asc\" ? cmp : -cmp;\n  }), [rows, calcSortColumn, calcSortDirection]);\n\n  const CalcSortIcon = ({ col }: { col: CalcSortColumn }) => {\n    if (calcSortColumn !== col) return null;\n    return calcSortDirection === \"asc\" ? <ChevronUp className=\"inline h-4 w-4\" /> : <ChevronDown className=\"inline h-4 w-4\" />;\n  };\n\n  return (\n    <div className=\"space-y-4\">\n      <div className=\"flex flex-wrap gap-4 items-end p-4 bg-muted/30 rounded-lg\">\n        <div className=\"space-y-1\"><Label htmlFor=\"calc-dry-mass\">Dry Mass (tons)</Label><Input id=\"calc-dry-mass\" type=\"number\" className=\"w-32\" value={dryMassInput} onChange={(e) => setDryMassInput(e.target.value)} /></div>\n        <div className=\"space-y-1\"><Label htmlFor=\"calc-radiator\">Radiator</Label><Select value={radiatorDataName} onValueChange={setRadiatorDataName}><SelectTrigger id=\"calc-radiator\" className=\"w-56\"><SelectValue placeholder=\"Select radiator\" /></SelectTrigger><SelectContent>\n          {analysis.radiators.filter((r) => !r.dataName.toLowerCase().includes(\"collector\")).toSorted((a, b) => b.gwPerTon - a.gwPerTon).map((r) => <SelectItem key={r.dataName} value={r.dataName}>{r.friendlyName} {r.isUnlocked ? \"\" : \" 🔒\"} ({smartRound(1 / r.gwPerTon)} t/GW)</SelectItem>)}\n        </SelectContent></Select></div>\n        <div className=\"space-y-1\"><Label htmlFor=\"calc-deltav\">Target ΔV (km/s)</Label><Input id=\"calc-deltav\" type=\"number\" className=\"w-28\" value={targetDeltaVInput} onChange={(e) => setTargetDeltaVInput(e.target.value)} /></div>\n        <div className=\"space-y-1\"><Label htmlFor=\"calc-distance\">Target Distance (AU)</Label><Input id=\"calc-distance\" type=\"number\" className=\"w-28\" value={targetDistanceInput} onChange={(e) => setTargetDistanceInput(e.target.value)} /></div>\n        <Button onClick={handleUpdate}>Update</Button>\n      </div>\n      <p className=\"text-xs text-muted-foreground\">Dry mass is hull/payload (drive + reactor + radiator added on top). Tanks clamped to [1, 1000]. 🔒 = locked radiator.</p>\n      <Table>\n        <TableHeader>\n          <TableRow>\n            <TableHead className=\"cursor-pointer hover:bg-muted/50\" onClick={() => handleCalcSort(\"driveName\")}>Drive <CalcSortIcon col=\"driveName\" /></TableHead>\n            <TableHead className=\"text-right cursor-pointer hover:bg-muted/50\" onClick={() => handleCalcSort(\"driveEfficiency\")}>Drive Eff <CalcSortIcon col=\"driveEfficiency\" /></TableHead>\n            <TableHead className=\"text-right cursor-pointer hover:bg-muted/50\" onClick={() => handleCalcSort(\"reactorEfficiency\")}>React Eff <CalcSortIcon col=\"reactorEfficiency\" /></TableHead>\n            <TableHead className=\"text-right cursor-pointer hover:bg-muted/50\" onClick={() => handleCalcSort(\"tanks\")}>Tanks <CalcSortIcon col=\"tanks\" /></TableHead>\n            <TableHead className=\"text-right cursor-pointer hover:bg-muted/50\" onClick={() => handleCalcSort(\"driveMass\")}>Drive t <CalcSortIcon col=\"driveMass\" /></TableHead>\n            <TableHead className=\"text-right cursor-pointer hover:bg-muted/50\" onClick={() => handleCalcSort(\"fuelMass\")}>Fuel t <CalcSortIcon col=\"fuelMass\" /></TableHead>\n            <TableHead className=\"text-right cursor-pointer hover:bg-muted/50\" onClick={() => handleCalcSort(\"reactorMass\")}>Reactor t <CalcSortIcon col=\"reactorMass\" /></TableHead>\n            <TableHead className=\"text-right cursor-pointer hover:bg-muted/50\" onClick={() => handleCalcSort(\"radiatorMass\")}>Radiator t <CalcSortIcon col=\"radiatorMass\" /></TableHead>\n            <TableHead className=\"text-right cursor-pointer hover:bg-muted/50\" onClick={() => handleCalcSort(\"totalTons\")}>Total t <CalcSortIcon col=\"totalTons\" /></TableHead>\n            <TableHead className=\"cursor-pointer hover:bg-muted/50\" onClick={() => handleCalcSort(\"totalCost\")}>Total Cost <CalcSortIcon col=\"totalCost\" /></TableHead>\n            <TableHead className=\"text-right cursor-pointer hover:bg-muted/50\" onClick={() => handleCalcSort(\"deltaV\")}>ΔV (km/s) <CalcSortIcon col=\"deltaV\" /></TableHead>\n            <TableHead className=\"text-right cursor-pointer hover:bg-muted/50\" onClick={() => handleCalcSort(\"acceleration\")}>Accel (mg) <CalcSortIcon col=\"acceleration\" /></TableHead>\n            <TableHead className=\"text-right cursor-pointer hover:bg-muted/50\" onClick={() => handleCalcSort(\"travelDays\")}>Travel Days <CalcSortIcon col=\"travelDays\" /></TableHead>\n            <TableHead className=\"text-right cursor-pointer hover:bg-muted/50\" onClick={() => handleCalcSort(\"unlockChance\")}>Unlock <CalcSortIcon col=\"unlockChance\" /></TableHead>\n            <TableHead className=\"text-right cursor-pointer hover:bg-muted/50\" onClick={() => handleCalcSort(\"techResearchRemaining\")}>Tech Res <CalcSortIcon col=\"techResearchRemaining\" /></TableHead>\n            <TableHead className=\"text-right cursor-pointer hover:bg-muted/50\" onClick={() => handleCalcSort(\"projectResearchRemaining\")}>Proj Res <CalcSortIcon col=\"projectResearchRemaining\" /></TableHead>\n          </TableRow>\n        </TableHeader>\n        <TableBody>\n          {sortedRows.map((row) => (\n            <TableRow key={row.dataName} className={row.isUnlocked ? \"\" : \"opacity-60\"}>\n              <TableCell className=\"font-medium\">\n                {row.driveName} {!row.isUnlocked && <span className=\"ml-1 text-muted-foreground text-xs\">(locked)</span>}\n                {row.reactorName && <div className=\"text-xs text-muted-foreground\">{row.reactorName}</div>}\n              </TableCell>\n              <TableCell className=\"text-right\">{formatPercent(row.driveEfficiency * 100)}</TableCell>\n              <TableCell className=\"text-right\">{row.reactorEfficiency !== undefined ? formatPercent(row.reactorEfficiency * 100) : \"-\"}</TableCell>\n              <TableCell className=\"text-right\">{row.tanks}</TableCell>\n              <TableCell className=\"text-right\">{row.driveMassTons > 0 ? smartRound(row.driveMassTons) : \"-\"}</TableCell>\n              <TableCell className=\"text-right\">{smartRound(row.fuelMassTons)}</TableCell>\n              <TableCell className=\"text-right\">{row.reactorMassTons > 0 ? smartRound(row.reactorMassTons) : \"-\"}</TableCell>\n              <TableCell className=\"text-right\">{row.radiatorMassTons > 0 ? smartRound(row.radiatorMassTons) : \"-\"}</TableCell>\n              <TableCell className=\"text-right\">{smartRound(row.totalTons)}</TableCell>\n              <TableCell><ShowEffects {...row.totalCost} /></TableCell>\n              <TableCell className=\"text-right\">{smartRound(row.deltaV)}</TableCell>\n              <TableCell className=\"text-right\">{smartRound(row.acceleration)}</TableCell>\n              <TableCell className=\"text-right\">{smartRound(row.travelDays)}</TableCell>\n              <TableCell className=\"text-right\">{row.unlockChance !== undefined ? `${row.unlockChance}%` : \"\"}</TableCell>\n              <TableCell className=\"text-right\" title={row.requiredTechs.length > 0 ? row.requiredTechs.map((n: string) => analysis.techs.get(n)?.displayName || n).join(\"\\n\") : undefined}>\n                {row.techResearchRemaining > 0 ? smartRound(row.techResearchRemaining / 1000) : \"-\"}\n              </TableCell>\n              <TableCell className=\"text-right\" title={row.requiredProjects.length > 0 ? row.requiredProjects.map((n: string) => analysis.projects.get(n)?.displayName || n).join(\"\\n\") : undefined}>\n                {row.projectResearchRemaining > 0 ? smartRound(row.projectResearchRemaining / 1000) : \"-\"}\n              </TableCell>\n            </TableRow>\n          ))}\n        </TableBody>\n      </Table>\n    </div>\n  );\n}\n\n// ─── Section Components ───\n\nexport function DrivesContent({ analysis, section }: { analysis: Analysis; section: string }) {\n  switch (section) {\n    case \"drive-table\": return <DrivesTable analysis={analysis} />;\n    case \"drive-calculator\": return <DriveCalculator analysis={analysis} />;\n    default: return <div>Unknown section: {section}</div>;\n  }\n}\n\nexport function getDrivesUi(analysis: Analysis) {\n  return {\n    key: \"drives\",\n    tab: \"Drives\",\n    content: <DrivesComponent analysis={analysis} />,\n  };\n}\n\nfunction DrivesComponent({ analysis }: { analysis: Analysis }) {\n  return (\n    <SmartAccordion type=\"multiple\" storageKey=\"drives-accordion\" defaultValue={[\"drive-table\", \"drive-calculator\"]}>\n      <AccordionItem value=\"drive-table\"><AccordionTrigger>Drive Systems</AccordionTrigger><AccordionContent><DrivesTable analysis={analysis} /></AccordionContent></AccordionItem>\n      <AccordionItem value=\"drive-calculator\"><AccordionTrigger>Drive Calculator</AccordionTrigger><AccordionContent><DriveCalculator analysis={analysis} /></AccordionContent></AccordionItem>\n    </SmartAccordion>\n  );\n}\n",
  "filePath": "terra-invicta-assistant\\src\\app\\game\\current\\drives.tsx"
}
```

**Output:**
```
Wrote file successfully.
```

---

## Assistant (Build · Qwen 3.6-35B-A3B (local) · 14.5s)

_Thinking:_

Now I need to fix the component.tsx to import the section components correctly. The current version imports them with named imports, but I need to make sure the imports match what's being exported. Let me also check if there are any issues with the imports and fix them.

Let me review the component.tsx and fix the import of the councilors section components. The section components are exported from councilors.tsx with the same names used in the switch statement.

Let me also check if there are TypeScript issues I need to fix. The FleetsComponent was exported from fleets.tsx with the section components, so let me make sure those are imported correctly in component.tsx.

Let me fix the imports in component.tsx and make sure everything aligns.

Now let me fix the component.tsx imports to match the exports:



**Tool: edit**

**Input:**
```json
{
  "filePath": "terra-invicta-assistant\\src\\app\\game\\current\\component.tsx",
  "oldString": "import { useState, useMemo } from \"react\";\nimport { ScoringProvider, useScoring } from \"./scoring-context\";\nimport { TreeNav, TreeNode } from \"./tree-nav\";\nimport { ScoringWeightsDialog } from \"./scoringWeights\";\nimport { ScoreDetails } from \"./councilors\";\nimport { Analysis } from \"@/lib/analysis\";\nimport { FleetsContent } from \"./fleets\";\nimport { HabsContent } from \"./habs\";\nimport { ResourcesContent } from \"./resources\";\nimport { DrivesContent } from \"./drives\";",
  "newString": "import { useState, useMemo } from \"react\";\nimport { ScoringProvider, useScoring } from \"./scoring-context\";\nimport { TreeNav, TreeNode } from \"./tree-nav\";\nimport { ScoringWeightsDialog } from \"./scoringWeights\";\nimport { Analysis } from \"@/lib/analysis\";\nimport { ExistingCouncil, FindNewCouncilors, CurrentOrgs, Takeover, Missions, OtherCouncilors, ScoreDetails } from \"./councilors\";\nimport { FleetsAlienSection as FleetsAlien, FleetsHumanSection as FleetsHuman, FleetsPlayerSection as FleetsPlayer, FleetsConstructionSection as FleetsConstruction } from \"./fleets\";\nimport { HabsCurrentBonuses, HabsFutureBonuses, HabsBoostMcSummary, HabsAlienHate, HabsBuildingDetails, HabsAvailableBoostProjects, HabsAvailableCPProjects, HabsAvailableMaxOrgProjects, HabsAvailableExpandNations, HabsAvailableStealableProjects, HabsTechnologyGoals, HabsManageHabs, HabsManageMines } from \"./habs\";\nimport { ResourcesTransactions, ResourcesOwnedNations, ResourcesSpoilTargets, ResourcesMcBoostTargets, ResourcesNationClaims, ResourcesUnificationCandidates } from \"./resources\";\nimport { DrivesContent } from \"./drives\";"
}
```

**Output:**
```
Edit applied successfully.
```

---

## Assistant (Build · Qwen 3.6-35B-A3B (local) · 42.5s)

_Thinking:_

Now I need to update the ContentPanel to use the renamed imports. Let me rewrite the ContentPanel to use the correct section component names.

**Tool: edit**

**Input:**
```json
{
  "filePath": "terra-invicta-assistant\\src\\app\\game\\current\\component.tsx",
  "oldString": "function ContentPanel({\n  analysis,\n  weights,\n  setWeights,\n  selectedKey,\n}: {\n  analysis: Analysis;\n  weights: ScoringWeights;\n  setWeights: (w: ScoringWeights) => void;\n  selectedKey: string;\n}) {\n  switch (selectedKey) {\n    // Councilors\n    case \"c-score\":\n      return <ScoreDetails analysis={analysis} weights={weights} />;\n    case \"c-existing\":\n      return <ExistingCouncil analysis={analysis} weights={weights} />;\n    case \"c-find-new\":\n      return <FindNewCouncilors analysis={analysis} weights={weights} />;\n    case \"c-current-orgs\":\n      return <CurrentOrgs analysis={analysis} weights={weights} />;\n    case \"c-takeover\":\n      return <Takeover analysis={analysis} weights={weights} />;\n    case \"c-missions\":\n      return <Missions analysis={analysis} weights={weights} />;\n    case \"c-other\":\n      return <OtherCouncilors analysis={analysis} weights={weights} />;\n\n    // Fleets\n    case \"f-alien\":\n      return <FleetsContent analysis={analysis} section=\"alien\" />;\n    case \"f-human\":\n      return <FleetsContent analysis={analysis} section=\"human\" />;\n    case \"f-player\":\n      return <FleetsContent analysis={analysis} section=\"player\" />;\n    case \"f-construction\":\n      return <FleetsContent analysis={analysis} section=\"construction\" />;\n\n    // Habs\n    case \"h-current\":\n      return <HabsContent analysis={analysis} section=\"current-bonuses\" />;\n    case \"h-future\":\n      return <HabsContent analysis={analysis} section=\"future-bonuses\" />;\n    case \"h-boost-mc\":\n      return <HabsContent analysis={analysis} section=\"boost-mc-summary\" />;\n    case \"h-alien-hate\":\n      return <HabsContent analysis={analysis} section=\"alien-hate\" />;\n    case \"h-building\":\n      return <HabsContent analysis={analysis} section=\"building-details\" />;\n    case \"h-boost-proj\":\n      return <HabsContent analysis={analysis} section=\"available-boost-projects\" />;\n    case \"h-cp-projects\":\n      return <HabsContent analysis={analysis} section=\"available-cp-projects\" />;\n    case \"h-max-org\":\n      return <HabsContent analysis={analysis} section=\"available-max-org-projects\" />;\n    case \"h-expand\":\n      return <HabsContent analysis={analysis} section=\"available-expand-nation-projects\" />;\n    case \"h-stealable\":\n      return <HabsContent analysis={analysis} section=\"available-stealable-projects\" />;\n    case \"h-tech\":\n      return <HabsContent analysis={analysis} section=\"technology-goals\" />;\n    case \"h-manage\":\n      return <HabsContent analysis={analysis} section=\"habs\" />;\n    case \"h-mines\":\n      return <HabsContent analysis={analysis} section=\"mines\" />;\n\n    // Resources\n    case \"r-transactions\":\n      return <ResourcesContent analysis={analysis} section=\"transactions\" />;\n    case \"r-owned\":\n      return <ResourcesContent analysis={analysis} section=\"owned\" />;\n    case \"r-spoils\":\n      return <ResourcesContent analysis={analysis} section=\"spoils\" />;\n    case \"r-space\":\n      return <ResourcesContent analysis={analysis} section=\"space\" />;\n    case \"r-claims\":\n      return <ResourcesContent analysis={analysis} section=\"nation-claims\" />;\n    case \"r-unification\":\n      return <ResourcesContent analysis={analysis} section=\"unification-candidates\" />;\n\n    // Drives\n    case \"d-systems\":\n      return <DrivesContent analysis={analysis} section=\"drive-table\" />;\n    case \"d-calculator\":\n      return <DrivesContent analysis={analysis} section=\"drive-calculator\" />;\n\n    default:\n      return <div className=\"text-muted-foreground\">Unknown section: {selectedKey}</div>;\n  }\n}\n\n// Import section components that are defined in councilors.tsx\nimport {\n  ExistingCouncil,\n  FindNewCouncilors,\n  CurrentOrgs,\n  Takeover,\n  Missions,\n  OtherCouncilors,\n} from \"./councilors\";",
  "newString": "function ContentPanel({\n  analysis,\n  weights,\n  setWeights,\n  selectedKey,\n}: {\n  analysis: Analysis;\n  weights: ScoringWeights;\n  setWeights: (w: ScoringWeights) => void;\n  selectedKey: string;\n}) {\n  switch (selectedKey) {\n    // Councilors\n    case \"c-score\":\n      return <ScoreDetails analysis={analysis} weights={weights} />;\n    case \"c-existing\":\n      return <ExistingCouncil analysis={analysis} weights={weights} />;\n    case \"c-find-new\":\n      return <FindNewCouncilors analysis={analysis} weights={weights} />;\n    case \"c-current-orgs\":\n      return <CurrentOrgs analysis={analysis} weights={weights} />;\n    case \"c-takeover\":\n      return <Takeover analysis={analysis} weights={weights} />;\n    case \"c-missions\":\n      return <Missions analysis={analysis} weights={weights} />;\n    case \"c-other\":\n      return <OtherCouncilors analysis={analysis} weights={weights} />;\n\n    // Fleets\n    case \"f-alien\":\n      return <FleetsAlien analysis={analysis} />;\n    case \"f-human\":\n      return <FleetsHuman analysis={analysis} />;\n    case \"f-player\":\n      return <FleetsPlayer analysis={analysis} />;\n    case \"f-construction\":\n      return <FleetsConstruction analysis={analysis} />;\n\n    // Habs\n    case \"h-current\":\n      return <HabsCurrentBonuses analysis={analysis} />;\n    case \"h-future\":\n      return <HabsFutureBonuses analysis={analysis} />;\n    case \"h-boost-mc\":\n      return <HabsBoostMcSummary analysis={analysis} />;\n    case \"h-alien-hate\":\n      return <HabsAlienHate analysis={analysis} />;\n    case \"h-building\":\n      return <HabsBuildingDetails analysis={analysis} />;\n    case \"h-boost-proj\":\n      return <HabsAvailableBoostProjects analysis={analysis} />;\n    case \"h-cp-projects\":\n      return <HabsAvailableCPProjects analysis={analysis} />;\n    case \"h-max-org\":\n      return <HabsAvailableMaxOrgProjects analysis={analysis} />;\n    case \"h-expand\":\n      return <HabsAvailableExpandNations analysis={analysis} />;\n    case \"h-stealable\":\n      return <HabsAvailableStealableProjects analysis={analysis} />;\n    case \"h-tech\":\n      return <HabsTechnologyGoals analysis={analysis} />;\n    case \"h-manage\":\n      return <HabsManageHabs analysis={analysis} />;\n    case \"h-mines\":\n      return <HabsManageMines analysis={analysis} />;\n\n    // Resources\n    case \"r-transactions\":\n      return <ResourcesTransactions analysis={analysis} />;\n    case \"r-owned\":\n      return <ResourcesOwnedNations analysis={analysis} />;\n    case \"r-spoils\":\n      return <ResourcesSpoilTargets analysis={analysis} />;\n    case \"r-space\":\n      return <ResourcesMcBoostTargets analysis={analysis} />;\n    case \"r-claims\":\n      return <ResourcesNationClaims analysis={analysis} />;\n    case \"r-unification\":\n      return <ResourcesUnificationCandidates analysis={analysis} />;\n\n    // Drives\n    case \"d-systems\":\n      return <DrivesContent analysis={analysis} section=\"drive-table\" />;\n    case \"d-calculator\":\n      return <DrivesContent analysis={analysis} section=\"drive-calculator\" />;\n\n    default:\n      return <div className=\"text-muted-foreground\">Unknown section: {selectedKey}</div>;\n  }\n}"
}
```

**Output:**
```
Edit applied successfully.
```

---

## Assistant (Build · Qwen 3.6-35B-A3B (local) · 9.9s)

_Thinking:_

Now I need to fix the Fleets section components to not require the section prop. Looking at the imports in component.tsx, I'm now importing `FleetsAlienSection as FleetsAlien`, `FleetsHumanSection as FleetsHuman`, etc. These are exported from fleets.tsx and they only take `analysis` as a prop, which is correct.

But wait, the content panel now uses `FleetsAlien analysis={analysis}` which calls the component directly - this should work since we renamed `FleetsAlienSection` to `FleetsAlien` in the import.

Let me now verify that the code compiles. Let me try to run the TypeScript compiler to check for errors.

**Tool: todowrite**

**Input:**
```json
{
  "todos": [
    {
      "content": "Create tree-nav.tsx - reusable tree navigation component with accordion-based collapsible nodes",
      "status": "completed",
      "priority": "high"
    },
    {
      "content": "Create scoring-context.tsx - context for councilor scoring state",
      "status": "completed",
      "priority": "high"
    },
    {
      "content": "Refactor councilors.tsx - extract sections as tree leaves, export tree structure",
      "status": "completed",
      "priority": "high"
    },
    {
      "content": "Refactor fleets.tsx - export tree structure",
      "status": "completed",
      "priority": "medium"
    },
    {
      "content": "Refactor habs.tsx - export tree structure",
      "status": "completed",
      "priority": "medium"
    },
    {
      "content": "Refactor resources.tsx - export tree structure",
      "status": "completed",
      "priority": "medium"
    },
    {
      "content": "Refactor drives.tsx - export tree structure",
      "status": "completed",
      "priority": "medium"
    },
    {
      "content": "Refactor component.tsx - tree layout with sidebar + content panel",
      "status": "completed",
      "priority": "high"
    },
    {
      "content": "Test the app compiles correctly",
      "status": "in_progress",
      "priority": "high"
    }
  ]
}
```

**Output:**
```
[
  {
    "content": "Create tree-nav.tsx - reusable tree navigation component with accordion-based collapsible nodes",
    "status": "completed",
    "priority": "high"
  },
  {
    "content": "Create scoring-context.tsx - context for councilor scoring state",
    "status": "completed",
    "priority": "high"
  },
  {
    "content": "Refactor councilors.tsx - extract sections as tree leaves, export tree structure",
    "status": "completed",
    "priority": "high"
  },
  {
    "content": "Refactor fleets.tsx - export tree structure",
    "status": "completed",
    "priority": "medium"
  },
  {
    "content": "Refactor habs.tsx - export tree structure",
    "status": "completed",
    "priority": "medium"
  },
  {
    "content": "Refactor resources.tsx - export tree structure",
    "status": "completed",
    "priority": "medium"
  },
  {
    "content": "Refactor drives.tsx - export tree structure",
    "status": "completed",
    "priority": "medium"
  },
  {
    "content": "Refactor component.tsx - tree layout with sidebar + content panel",
    "status": "completed",
    "priority": "high"
  },
  {
    "content": "Test the app compiles correctly",
    "status": "in_progress",
    "priority": "high"
  }
]
```

---

## Assistant (Build · Qwen 3.6-35B-A3B (local) · 5.1s)

_Thinking:_

Let me try to compile the TypeScript to check for errors.

**Tool: bash**

**Input:**
```json
{
  "command": "npx tsc --noEmit 2>&1 | head -100",
  "description": "Check TypeScript compilation",
  "timeout": 60000
}
```

**Output:**
```
src/app/game/current/fleets.tsx(46,4): error TS1005: ',' expected.
src/app/game/current/fleets.tsx(46,5): error TS1005: ',' expected.
src/app/game/current/fleets.tsx(46,6): error TS1134: Variable declaration expected.
src/app/game/current/fleets.tsx(46,13): error TS1005: ',' expected.

```

---

## Assistant (Build · Qwen 3.6-35B-A3B (local) · 3.5s)

_Thinking:_

There are syntax errors in fleets.tsx at line 46. Let me check what's at that line.

**Tool: read**

**Input:**
```json
{
  "filePath": "terra-invicta-assistant\\src\\app\\game\\current\\fleets.tsx",
  "offset": 40,
  "limit": 15
}
```

**Output:**
```
<path>terra-invicta-assistant\src\app\game\current\fleets.tsx</path>
<type>file</type>
<content>
40:         {target}
41:         {fleets.length > 1 ? `(${fleets.length})` : ""}
42:         {farFuture ? "" : <>: {daysToTarget.toFixed(0)}d <MissionControl />{firstMc.toFixed(0)}</>}
43:         {survInfo && <>,{survInfo}</>}
44:       </span>
45:     );
46:   }]).filter((i) => !!i);
47: 
48:   return {
49:     key: "fleets",
50:     tab: (
51:       <>
52:         Fleets
53:         {label.length > 0 ? (
54:           <>{" "}

(Showing lines 40-54 of 376. Use offset=55 to continue.)
</content>
```

---

## Assistant (Build · Qwen 3.6-35B-A3B (local) · 4.8s)

_Thinking:_

The issue is that the label computation in `getFleetsUi` is returning JSX elements (React elements) from within a reduce callback, but TypeScript doesn't understand JSX in .tsx files when the expression is complex. The problem is that `label` is being used as an array but the JSX elements inside are being treated as expressions.

Let me look at the broader context around that area:

**Tool: read**

**Input:**
```json
{
  "filePath": "terra-invicta-assistant\\src\\app\\game\\current\\fleets.tsx",
  "limit": 50,
  "offset": 1
}
```

**Output:**
```
<path>terra-invicta-assistant\src\app\game\current\fleets.tsx</path>
<type>file</type>
<content>
1: import { Analysis } from "@/lib/analysis";
2: import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
3: import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
4: import { SmartAccordion } from "@/components/ui/smart-accordion";
5: import { Button } from "@/components/ui/button";
6: import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
7: import { diffDateTime, sortByDateTime, toDays } from "@/lib/utils";
8: import { Fragment } from "react/jsx-runtime";
9: import { FactionIcons, MissionControl } from "@/components/icons";
10: import { twMerge } from "tailwind-merge";
11: 
12: export function getFleetsUi(analysis: Analysis) {
13:   const byTarget = analysis.alienFleetsToPlayerOrbits.reduce((acc, fleet) => {
14:     const key = fleet.planetName || "Unknown Orbit";
15:     if (!acc.has(key)) acc.set(key, []);
16:     acc.get(key)!.push(fleet);
17:     return acc;
18:   }, new Map<string, typeof analysis.alienFleetsToPlayerOrbits>());
19: 
20:   const label = [...byTarget.entries().map(([target, rawFleets]) => {
21:     const fleets = rawFleets.filter((f) => f.deltaV > 0 && (f.daysToTarget || 0) > 0);
22:     const surv = rawFleets.filter((f) => f.operation === "AlienEarthSurveillanceOperation" && !f.arrivalTime);
23:     const survInfo = surv.length ? (
24:       <span className="text-white bg-destructive rounded py-2 px-3 font-bold">
25:         {surv.map((f) => f.operationCompleteDays || 0).reduce((a, b) => Math.min(a, b), 9999999999).toFixed(0)}d Surveillance
26:       </span>
27:     ) : null;
28:     if (fleets.length === 0) {
29:       return survInfo ? <span>{target}: {survInfo}</span> : null;
30:     }
31:     const firstFleet = sortByDateTime(fleets, (f) => f.arrivalTime || analysis.gameCurrentDateTime)[0];
32:     const firstFleets = fleets.filter((f) => toDays(diffDateTime(f.arrivalTime || analysis.gameCurrentDateTime, firstFleet.arrivalTime || analysis.gameCurrentDateTime)) < 14);
33:     const firstMc = firstFleets.reduce((sum, f) => sum + f.totalMC, 0);
34:     const warningNeeded = (firstMc > 10 ? 270 : 150) + 30;
35:     const daysToTarget = firstFleet.daysToTarget || 0;
36:     const farFuture = daysToTarget > warningNeeded;
37:     const className = twMerge(farFuture && "px-1 -mx-1 py-0.5 -my-0.5 rounded bg-green-500", farFuture && (daysToTarget < warningNeeded + 50 ? "bg-red-200" : daysToTarget < warningNeeded + 100 ? "bg-yellow-200" : "bg-green-200"));
38:     return (
39:       <span className={className} title={`${fleets.length} fleet(s) targeting ${target}, arriving in ${daysToTarget.toFixed(0)} days, using ${firstMc.toFixed(0)} MC`}>
40:         {target}
41:         {fleets.length > 1 ? `(${fleets.length})` : ""}
42:         {farFuture ? "" : <>: {daysToTarget.toFixed(0)}d <MissionControl />{firstMc.toFixed(0)}</>}
43:         {survInfo && <>,{survInfo}</>}
44:       </span>
45:     );
46:   }]).filter((i) => !!i);
47: 
48:   return {
49:     key: "fleets",
50:     tab: (

(Showing lines 1-50 of 376. Use offset=51 to continue.)
</content>
```

---

## Assistant (Build · Qwen 3.6-35B-A3B (local) · 40.4s)

_Thinking:_

The issue is that `label` is an array of JSX elements mixed with nulls. The `.filter((i) => !!i)` at line 46 is causing the TypeScript error. The problem might be that TypeScript is having trouble with the JSX expression in the reduce.

Actually, looking at this more carefully, the issue is likely with the Fragment syntax `<>` used inside the arrow function body. TypeScript is getting confused. Let me fix this by using explicit `React.Fragment` or by using `[]` wrapping.

Actually, the issue is likely that the JSX in the reduce is returning an array of elements (since `<>...</>` is a Fragment), and TypeScript doesn't handle this well inside a `.map()` call. Let me simplify by wrapping in parentheses.

Wait, actually the issue is that the JSX return values are being treated as expressions and `.filter((i) => !!i)` can't be applied properly. Let me fix this by wrapping the entire expression properly.

Actually, looking at the original file again, the same pattern was used and it worked. The issue is likely that my simplified version has some syntax problem. Let me look at the error more carefully.

The error at line 46 is:
```
src/app/game/current/fleets.tsx(46,4): error TS1005: ',' expected.
src/app/game/current/fleets.tsx(46,5): error TS1005: ',' expected.
src/app/game/current/fleets.tsx(46,6): error TS1134: Variable declaration expected.
src/app/game/current/fleets.tsx(46,13): error TS1005: ',' expected.
```

Line 46, column 4 is `}]).filter`. The issue might be with the `<>` Fragment syntax inside the JSX expression. TypeScript might not recognize the Fragment properly.

Let me rewrite the label computation to be cleaner and avoid the Fragment issue.

**Tool: edit**

**Input:**
```json
{
  "filePath": "terra-invicta-assistant\\src\\app\\game\\current\\fleets.tsx",
  "oldString": " const label = [...byTarget.entries().map(([target, rawFleets]) => {\n    const fleets = rawFleets.filter((f) => f.deltaV > 0 && (f.daysToTarget || 0) > 0);\n    const surv = rawFleets.filter((f) => f.operation === \"AlienEarthSurveillanceOperation\" && !f.arrivalTime);\n    const survInfo = surv.length ? (\n      <span className=\"text-white bg-destructive rounded py-2 px-3 font-bold\">\n        {surv.map((f) => f.operationCompleteDays || 0).reduce((a, b) => Math.min(a, b), 9999999999).toFixed(0)}d Surveillance\n      </span>\n    ) : null;\n    if (fleets.length === 0) {\n      return survInfo ? <span>{target}: {survInfo}</span> : null;\n    }\n    const firstFleet = sortByDateTime(fleets, (f) => f.arrivalTime || analysis.gameCurrentDateTime)[0];\n    const firstFleets = fleets.filter((f) => toDays(diffDateTime(f.arrivalTime || analysis.gameCurrentDateTime, firstFleet.arrivalTime || analysis.gameCurrentDateTime)) < 14);\n    const firstMc = firstFleets.reduce((sum, f) => sum + f.totalMC, 0);\n    const warningNeeded = (firstMc > 10 ? 270 : 150) + 30;\n    const daysToTarget = firstFleet.daysToTarget || 0;\n    const farFuture = daysToTarget > warningNeeded;\n    const className = twMerge(farFuture && \"px-1 -mx-1 py-0.5 -my-0.5 rounded bg-green-500\", farFuture && (daysToTarget < warningNeeded + 50 ? \"bg-red-200\" : daysToTarget < warningNeeded + 100 ? \"bg-yellow-200\" : \"bg-green-200\"));\n    return (\n      <span className={className} title={`${fleets.length} fleet(s) targeting ${target}, arriving in ${daysToTarget.toFixed(0)} days, using ${firstMc.toFixed(0)} MC`}>\n        {target}\n        {fleets.length > 1 ? `(${fleets.length})` : \"\"}\n        {farFuture ? \"\" : <>: {daysToTarget.toFixed(0)}d <MissionControl />{firstMc.toFixed(0)}</>}\n        {survInfo && <>,{survInfo}</>}\n      </span>\n    );\n  }]).filter((i) => !!i);",
  "newString": " const label: React.ReactNode[] = [...byTarget.entries()].map(([target, rawFleets]) => {\n    const fleets = rawFleets.filter((f) => f.deltaV > 0 && (f.daysToTarget || 0) > 0);\n    const surv = rawFleets.filter((f) => f.operation === \"AlienEarthSurveillanceOperation\" && !f.arrivalTime);\n    const survInfo = surv.length ? (\n      <span className=\"text-white bg-destructive rounded py-2 px-3 font-bold\">\n        {surv.map((f) => f.operationCompleteDays || 0).reduce((a, b) => Math.min(a, b), 9999999999).toFixed(0)}d Surveillance\n      </span>\n    ) : null;\n    if (fleets.length === 0) {\n      return survInfo ? <span key={target}>{target}: {survInfo}</span> : null;\n    }\n    const firstFleet = sortByDateTime(fleets, (f) => f.arrivalTime || analysis.gameCurrentDateTime)[0];\n    const firstFleets = fleets.filter((f) => toDays(diffDateTime(f.arrivalTime || analysis.gameCurrentDateTime, firstFleet.arrivalTime || analysis.gameCurrentDateTime)) < 14);\n    const firstMc = firstFleets.reduce((sum, f) => sum + f.totalMC, 0);\n    const warningNeeded = (firstMc > 10 ? 270 : 150) + 30;\n    const daysToTarget = firstFleet.daysToTarget || 0;\n    const farFuture = daysToTarget > warningNeeded;\n    const className = twMerge(farFuture && \"px-1 -mx-1 py-0.5 -my-0.5 rounded bg-green-500\", farFuture && (daysToTarget < warningNeeded + 50 ? \"bg-red-200\" : daysToTarget < warningNeeded + 100 ? \"bg-yellow-200\" : \"bg-green-200\"));\n    return (\n      <span key={target} className={className} title={`${fleets.length} fleet(s) targeting ${target}, arriving in ${daysToTarget.toFixed(0)} days, using ${firstMc.toFixed(0)} MC`}>\n        {target}\n        {fleets.length > 1 ? `(${fleets.length})` : \"\"}\n        {farFuture ? null : <><>: {daysToTarget.toFixed(0)}d <MissionControl />{firstMc.toFixed(0)}</>}\n        {survInfo ? <>,{survInfo}</> : null}\n      </span>\n    );\n  }).filter((i): i is React.ReactElement => i !== null);"
}
```

**Output:**
```
Edit applied successfully.
```

---

## Assistant (Build · Qwen 3.6-35B-A3B (local) · 8.3s)

_Thinking:_

That fix won't work because `<>` inside JSX is a Fragment, not a valid expression. Let me fix it properly.

**Tool: edit**

**Input:**
```json
{
  "filePath": "terra-invicta-assistant\\src\\app\\game\\current\\fleets.tsx",
  "oldString": "       {farFuture ? null : <><>: {daysToTarget.toFixed(0)}d <MissionControl />{firstMc.toFixed(0)}</>}",
  "newString": "       {farFuture ? null : <span key={target + \"-info\"}: {daysToTarget.toFixed(0)}d <MissionControl />{firstMc.toFixed(0)}</span>}"
}
```

**Output:**
```
Edit applied successfully.
```

---

## Assistant (Build · Qwen 3.6-35B-A3B (local) · 5.0s)

_Thinking:_

Wait, that's wrong syntax. Let me fix it properly.

**Tool: edit**

**Input:**
```json
{
  "filePath": "terra-invicta-assistant\\src\\app\\game\\current\\fleets.tsx",
  "oldString": "      {farFuture ? null : <span key={target + \"-info\"}: {daysToTarget.toFixed(0)}d <MissionControl />{firstMc.toFixed(0)}</span>}",
  "newString": "      {farFuture ? null : <span key={target + \"-info\"}>{daysToTarget.toFixed(0)}d <MissionControl />{firstMc.toFixed(0)}</span>}"
}
```

**Output:**
```
Edit applied successfully.
```

---

## Assistant (Build · Qwen 3.6-35B-A3B (local) · 5.6s)

_Thinking:_

Now let me check TypeScript compilation again.

**Tool: bash**

**Input:**
```json
{
  "command": "npx tsc --noEmit 2>&1 | head -80",
  "description": "Check TypeScript compilation",
  "timeout": 60000
}
```

**Output:**
```
src/app/game/current/component.tsx(172,12): error TS2304: Cannot find name 'ScoringWeights'.
src/app/game/current/component.tsx(173,19): error TS2304: Cannot find name 'ScoringWeights'.
src/app/game/current/councilors.tsx(342,67): error TS17019: '!' at the end of a type is not valid TypeScript syntax. Did you mean to write 'Partial<Record<TechCategory, number>>'?
src/app/game/current/councilors.tsx(348,60): error TS17019: '!' at the end of a type is not valid TypeScript syntax. Did you mean to write 'Partial<Record<TechCategory, number>>'?
src/app/game/current/councilors.tsx(545,51): error TS2322: Type 'Set<number>' is not assignable to type 'Set<string>'.
  Type 'number' is not assignable to type 'string'.
src/app/game/current/councilors.tsx(637,51): error TS2322: Type 'Set<number>' is not assignable to type 'Set<string>'.
  Type 'number' is not assignable to type 'string'.
src/app/game/current/councilors.tsx(728,49): error TS2322: Type 'Set<number>' is not assignable to type 'Set<string>'.
  Type 'number' is not assignable to type 'string'.
src/app/game/current/councilors.tsx(785,55): error TS2322: Type 'Set<number>' is not assignable to type 'Set<string>'.
  Type 'number' is not assignable to type 'string'.
src/app/game/current/councilors.tsx(819,7): error TS2769: No overload matches this call.
  Overload 1 of 2, '(...items: ConcatArray<{ type: "councilor"; councilor: { id: number; displayName: string; factionId: number | undefined; councilorType: { dataName: string; friendlyName: string; missionNames: MissionDataName[]; } | undefined; ... 10 more ...; playerIntel: number; }; factionId: number | undefined; missions: MissionDataName[]; }>[]): { ...; }[]', gave the following error.
    Argument of type '{ type: "org"; org: { id: number; displayName: string; templateName: string | null; template: { dataName: string; friendlyName: string; orgType: string; requiresNationality: boolean; allowedOnMarket: boolean; ... 4 more ...; techBonuses: { ...; }[]; } | undefined; ... 40 more ...; isAdminOrg: boolean; }; factionId: ...' is not assignable to parameter of type 'ConcatArray<{ type: "councilor"; councilor: { id: number; displayName: string; factionId: number | undefined; councilorType: { dataName: string; friendlyName: string; missionNames: MissionDataName[]; } | undefined; ... 10 more ...; playerIntel: number; }; factionId: number | undefined; missions: MissionDataName[]; }>'.
      The types returned by 'slice(...)' are incompatible between these types.
        Type '{ type: "org"; org: { id: number; displayName: string; templateName: string | null; template: { dataName: string; friendlyName: string; orgType: string; requiresNationality: boolean; allowedOnMarket: boolean; ... 4 more ...; techBonuses: { ...; }[]; } | undefined; ... 40 more ...; isAdminOrg: boolean; }; factionId: ...' is not assignable to type '{ type: "councilor"; councilor: { id: number; displayName: string; factionId: number | undefined; councilorType: { dataName: string; friendlyName: string; missionNames: MissionDataName[]; } | undefined; ... 10 more ...; playerIntel: number; }; factionId: number | undefined; missions: MissionDataName[]; }[]'.
          Property 'councilor' is missing in type '{ type: "org"; org: { id: number; displayName: string; templateName: string | null; template: { dataName: string; friendlyName: string; orgType: string; requiresNationality: boolean; allowedOnMarket: boolean; ... 4 more ...; techBonuses: { ...; }[]; } | undefined; ... 40 more ...; isAdminOrg: boolean; }; factionId: ...' but required in type '{ type: "councilor"; councilor: { id: number; displayName: string; factionId: number | undefined; councilorType: { dataName: string; friendlyName: string; missionNames: MissionDataName[]; } | undefined; ... 10 more ...; playerIntel: number; }; factionId: number | undefined; missions: MissionDataName[]; }'.
  Overload 2 of 2, '(...items: ({ type: "councilor"; councilor: { id: number; displayName: string; factionId: number | undefined; councilorType: { dataName: string; friendlyName: string; missionNames: MissionDataName[]; } | undefined; ... 10 more ...; playerIntel: number; }; factionId: number | undefined; missions: MissionDataName[]; } | ConcatArray<...>)[]): { ...; }[]', gave the following error.
    Argument of type '{ type: "org"; org: { id: number; displayName: string; templateName: string | null; template: { dataName: string; friendlyName: string; orgType: string; requiresNationality: boolean; allowedOnMarket: boolean; ... 4 more ...; techBonuses: { ...; }[]; } | undefined; ... 40 more ...; isAdminOrg: boolean; }; factionId: ...' is not assignable to parameter of type '{ type: "councilor"; councilor: { id: number; displayName: string; factionId: number | undefined; councilorType: { dataName: string; friendlyName: string; missionNames: MissionDataName[]; } | undefined; ... 10 more ...; playerIntel: number; }; factionId: number | undefined; missions: MissionDataName[]; } | ConcatArr...'.
      Type '{ type: "org"; org: { id: number; displayName: string; templateName: string | null; template: { dataName: string; friendlyName: string; orgType: string; requiresNationality: boolean; allowedOnMarket: boolean; ... 4 more ...; techBonuses: { ...; }[]; } | undefined; ... 40 more ...; isAdminOrg: boolean; }; factionId: ...' is not assignable to type 'ConcatArray<{ type: "councilor"; councilor: { id: number; displayName: string; factionId: number | undefined; councilorType: { dataName: string; friendlyName: string; missionNames: MissionDataName[]; } | undefined; ... 10 more ...; playerIntel: number; }; factionId: number | undefined; missions: MissionDataName[]; }>'.
        The types returned by 'slice(...)' are incompatible between these types.
          Type '{ type: "org"; org: { id: number; displayName: string; templateName: string | null; template: { dataName: string; friendlyName: string; orgType: string; requiresNationality: boolean; allowedOnMarket: boolean; ... 4 more ...; techBonuses: { ...; }[]; } | undefined; ... 40 more ...; isAdminOrg: boolean; }; factionId: ...' is not assignable to type '{ type: "councilor"; councilor: { id: number; displayName: string; factionId: number | undefined; councilorType: { dataName: string; friendlyName: string; missionNames: MissionDataName[]; } | undefined; ... 10 more ...; playerIntel: number; }; factionId: number | undefined; missions: MissionDataName[]; }[]'.
            Property 'councilor' is missing in type '{ type: "org"; org: { id: number; displayName: string; templateName: string | null; template: { dataName: string; friendlyName: string; orgType: string; requiresNationality: boolean; allowedOnMarket: boolean; ... 4 more ...; techBonuses: { ...; }[]; } | undefined; ... 40 more ...; isAdminOrg: boolean; }; factionId: ...' but required in type '{ type: "councilor"; councilor: { id: number; displayName: string; factionId: number | undefined; councilorType: { dataName: string; friendlyName: string; missionNames: MissionDataName[]; } | undefined; ... 10 more ...; playerIntel: number; }; factionId: number | undefined; missions: MissionDataName[]; }'.
src/app/game/current/councilors.tsx(827,7): error TS2769: No overload matches this call.
  Overload 1 of 2, '(...items: ConcatArray<{ type: "councilor"; councilor: { id: number; displayName: string; factionId: number | undefined; councilorType: { dataName: string; friendlyName: string; missionNames: MissionDataName[]; } | undefined; ... 10 more ...; playerIntel: number; }; factionId: number | undefined; missions: MissionDataName[]; }>[]): { ...; }[]', gave the following error.
    Argument of type '{ type: "org"; org: { councilorId: number | undefined; councilor: string | undefined; admin: number | undefined; faction: { id: number; displayName: string | null; templateName: string | null; } | undefined; ... 44 more ...; isAdminOrg: boolean; }; factionId: number | undefined; missions: MissionDataName[]; }[]' is not assignable to parameter of type 'ConcatArray<{ type: "councilor"; councilor: { id: number; displayName: string; factionId: number | undefined; councilorType: { dataName: string; friendlyName: string; missionNames: MissionDataName[]; } | undefined; ... 10 more ...; playerIntel: number; }; factionId: number | undefined; missions: MissionDataName[]; }>'.
      The types returned by 'slice(...)' are incompatible between these types.
        Type '{ type: "org"; org: { councilorId: number | undefined; councilor: string | undefined; admin: number | undefined; faction: { id: number; displayName: string | null; templateName: string | null; } | undefined; ... 44 more ...; isAdminOrg: boolean; }; factionId: number | undefined; missions: MissionDataName[]; }[]' is not assignable to type '{ type: "councilor"; councilor: { id: number; displayName: string; factionId: number | undefined; councilorType: { dataName: string; friendlyName: string; missionNames: MissionDataName[]; } | undefined; ... 10 more ...; playerIntel: number; }; factionId: number | undefined; missions: MissionDataName[]; }[]'.
          Property 'councilor' is missing in type '{ type: "org"; org: { councilorId: number | undefined; councilor: string | undefined; admin: number | undefined; faction: { id: number; displayName: string | null; templateName: string | null; } | undefined; ... 44 more ...; isAdminOrg: boolean; }; factionId: number | undefined; missions: MissionDataName[]; }' but required in type '{ type: "councilor"; councilor: { id: number; displayName: string; factionId: number | undefined; councilorType: { dataName: string; friendlyName: string; missionNames: MissionDataName[]; } | undefined; ... 10 more ...; playerIntel: number; }; factionId: number | undefined; missions: MissionDataName[]; }'.
  Overload 2 of 2, '(...items: ({ type: "councilor"; councilor: { id: number; displayName: string; factionId: number | undefined; councilorType: { dataName: string; friendlyName: string; missionNames: MissionDataName[]; } | undefined; ... 10 more ...; playerIntel: number; }; factionId: number | undefined; missions: MissionDataName[]; } | ConcatArray<...>)[]): { ...; }[]', gave the following error.
    Argument of type '{ type: "org"; org: { councilorId: number | undefined; councilor: string | undefined; admin: number | undefined; faction: { id: number; displayName: string | null; templateName: string | null; } | undefined; ... 44 more ...; isAdminOrg: boolean; }; factionId: number | undefined; missions: MissionDataName[]; }[]' is not assignable to parameter of type '{ type: "councilor"; councilor: { id: number; displayName: string; factionId: number | undefined; councilorType: { dataName: string; friendlyName: string; missionNames: MissionDataName[]; } | undefined; ... 10 more ...; playerIntel: number; }; factionId: number | undefined; missions: MissionDataName[]; } | ConcatArr...'.
      Type '{ type: "org"; org: { councilorId: number | undefined; councilor: string | undefined; admin: number | undefined; faction: { id: number; displayName: string | null; templateName: string | null; } | undefined; ... 44 more ...; isAdminOrg: boolean; }; factionId: number | undefined; missions: MissionDataName[]; }[]' is not assignable to type 'ConcatArray<{ type: "councilor"; councilor: { id: number; displayName: string; factionId: number | undefined; councilorType: { dataName: string; friendlyName: string; missionNames: MissionDataName[]; } | undefined; ... 10 more ...; playerIntel: number; }; factionId: number | undefined; missions: MissionDataName[]; }>'.
        The types returned by 'slice(...)' are incompatible between these types.
          Type '{ type: "org"; org: { councilorId: number | undefined; councilor: string | undefined; admin: number | undefined; faction: { id: number; displayName: string | null; templateName: string | null; } | undefined; ... 44 more ...; isAdminOrg: boolean; }; factionId: number | undefined; missions: MissionDataName[]; }[]' is not assignable to type '{ type: "councilor"; councilor: { id: number; displayName: string; factionId: number | undefined; councilorType: { dataName: string; friendlyName: string; missionNames: MissionDataName[]; } | undefined; ... 10 more ...; playerIntel: number; }; factionId: number | undefined; missions: MissionDataName[]; }[]'.
            Property 'councilor' is missing in type '{ type: "org"; org: { councilorId: number | undefined; councilor: string | undefined; admin: number | undefined; faction: { id: number; displayName: string | null; templateName: string | null; } | undefined; ... 44 more ...; isAdminOrg: boolean; }; factionId: number | undefined; missions: MissionDataName[]; }' but required in type '{ type: "councilor"; councilor: { id: number; displayName: string; factionId: number | undefined; councilorType: { dataName: string; friendlyName: string; missionNames: MissionDataName[]; } | undefined; ... 10 more ...; playerIntel: number; }; factionId: number | undefined; missions: MissionDataName[]; }'.
src/app/game/current/councilors.tsx(903,47): error TS2322: Type 'Set<number>' is not assignable to type 'Set<string>'.
  Type 'number' is not assignable to type 'string'.
src/app/game/current/drives.tsx(140,255): error TS2339: Property 'nobles' does not exist on type 'Materials'.
src/app/game/current/habs.tsx(5,10): error TS2300: Duplicate identifier 'AccordionContent'.
src/app/game/current/habs.tsx(5,28): error TS2300: Duplicate identifier 'AccordionItem'.
src/app/game/current/habs.tsx(5,43): error TS2300: Duplicate identifier 'AccordionTrigger'.
src/app/game/current/habs.tsx(259,11): error TS2339: Property 'availableBoostProjects' does not exist on type '{ fileName: string; lastModified: Date; gameCurrentDateTime: DateTime; gameCurrentDateTimeFormatted: string; player: { id: number; faction: number; templateName: string | null; displayName: string | null; }; ... 29 more ...; unificationCandidates: UnificationCandidate[]; }'.
src/app/game/current/habs.tsx(263,41): error TS7006: Parameter 'a' implicitly has an 'any' type.
src/app/game/current/habs.tsx(263,44): error TS7006: Parameter 'b' implicitly has an 'any' type.
src/app/game/current/habs.tsx(263,88): error TS7006: Parameter 'project' implicitly has an 'any' type.
src/app/game/current/habs.tsx(263,97): error TS7006: Parameter 'ix' implicitly has an 'any' type.
src/app/game/current/habs.tsx(264,22): error TS7053: Element implicitly has an 'any' type because expression of type 'any' can't be used to index type '{ EnergyScience: { (props: ClassAttributes<HTMLImageElement> & ImgHTMLAttributes<HTMLImageElement> & { ...; }): Element; DisplayName: string; }; ... 14 more ...; Xenology: { ...; }; }'.
src/app/game/current/habs.tsx(272,11): error TS2339: Property 'availableCPProjects' does not exist on type '{ fileName: string; lastModified: Date; gameCurrentDateTime: DateTime; gameCurrentDateTimeFormatted: string; player: { id: number; faction: number; templateName: string | null; displayName: string | null; }; ... 29 more ...; unificationCandidates: UnificationCandidate[]; }'.
src/app/game/current/habs.tsx(276,38): error TS7006: Parameter 'a' implicitly has an 'any' type.
src/app/game/current/habs.tsx(276,41): error TS7006: Parameter 'b' implicitly has an 'any' type.
src/app/game/current/habs.tsx(282,15): error TS7006: Parameter 'project' implicitly has an 'any' type.
src/app/game/current/habs.tsx(282,24): error TS7006: Parameter 'ix' implicitly has an 'any' type.
src/app/game/current/habs.tsx(283,22): error TS7053: Element implicitly has an 'any' type because expression of type 'any' can't be used to index type '{ EnergyScience: { (props: ClassAttributes<HTMLImageElement> & ImgHTMLAttributes<HTMLImageElement> & { ...; }): Element; DisplayName: string; }; ... 14 more ...; Xenology: { ...; }; }'.
src/app/game/current/habs.tsx(291,11): error TS2339: Property 'availableMaxOrgProjects' does not exist on type '{ fileName: string; lastModified: Date; gameCurrentDateTime: DateTime; gameCurrentDateTimeFormatted: string; player: { id: number; faction: number; templateName: string | null; displayName: string | null; }; ... 29 more ...; unificationCandidates: UnificationCandidate[]; }'.
src/app/game/current/habs.tsx(295,42): error TS7006: Parameter 'a' implicitly has an 'any' type.
src/app/game/current/habs.tsx(295,45): error TS7006: Parameter 'b' implicitly has an 'any' type.
src/app/game/current/habs.tsx(295,89): error TS7006: Parameter 'project' implicitly has an 'any' type.
src/app/game/current/habs.tsx(295,98): error TS7006: Parameter 'ix' implicitly has an 'any' type.
src/app/game/current/habs.tsx(296,22): error TS7053: Element implicitly has an 'any' type because expression of type 'any' can't be used to index type '{ EnergyScience: { (props: ClassAttributes<HTMLImageElement> & ImgHTMLAttributes<HTMLImageElement> & { ...; }): Element; DisplayName: string; }; ... 14 more ...; Xenology: { ...; }; }'.
src/app/game/current/habs.tsx(304,11): error TS2339: Property 'availableExpandNationProjects' does not exist on type '{ fileName: string; lastModified: Date; gameCurrentDateTime: DateTime; gameCurrentDateTimeFormatted: string; player: { id: number; faction: number; templateName: string | null; displayName: string | null; }; ... 29 more ...; unificationCandidates: UnificationCandidate[]; }'.
src/app/game/current/habs.tsx(308,48): error TS7006: Parameter 'a' implicitly has an 'any' type.
src/app/game/current/habs.tsx(308,51): error TS7006: Parameter 'b' implicitly has an 'any' type.
src/app/game/current/habs.tsx(312,15): error TS7006: Parameter 'project' implicitly has an 'any' type.
src/app/game/current/habs.tsx(312,24): error TS7006: Parameter 'ix' implicitly has an 'any' type.
src/app/game/current/habs.tsx(313,22): error TS7053: Element implicitly has an 'any' type because expression of type 'any' can't be used to index type '{ EnergyScience: { (props: ClassAttributes<HTMLImageElement> & ImgHTMLAttributes<HTMLImageElement> & { ...; }): Element; DisplayName: string; }; ... 14 more ...; Xenology: { ...; }; }'.
src/app/game/current/habs.tsx(449,17): error TS2339: Property 'availableBoostProjects' does not exist on type '{ fileName: string; lastModified: Date; gameCurrentDateTime: DateTime; gameCurrentDateTimeFormatted: string; player: { id: number; faction: number; templateName: string | null; displayName: string | null; }; ... 29 more ...; unificationCandidates: UnificationCandidate[]; }'.
src/app/game/current/habs.tsx(450,17): error TS2339: Property 'availableCPProjects' does not exist on type '{ fileName: string; lastModified: Date; gameCurrentDateTime: DateTime; gameCurrentDateTimeFormatted: string; player: { id: number; faction: number; templateName: string | null; displayName: string | null; }; ... 29 more ...; unificationCandidates: UnificationCandidate[]; }'.
src/app/game/current/habs.tsx(451,17): error TS2339: Property 'availableMaxOrgProjects' does not exist on type '{ fileName: string; lastModified: Date; gameCurrentDateTime: DateTime; gameCurrentDateTimeFormatted: string; player: { id: number; faction: number; templateName: string | null; displayName: string | null; }; ... 29 more ...; unificationCandidates: UnificationCandidate[]; }'.
src/app/game/current/habs.tsx(452,17): error TS2339: Property 'availableExpandNationProjects' does not exist on type '{ fileName: string; lastModified: Date; gameCurrentDateTime: DateTime; gameCurrentDateTimeFormatted: string; player: { id: number; faction: number; templateName: string | null; displayName: string | null; }; ... 29 more ...; unificationCandidates: UnificationCandidate[]; }'.
src/app/game/current/habs.tsx(481,10): error TS2300: Duplicate identifier 'AccordionItem'.
src/app/game/current/habs.tsx(481,25): error TS2300: Duplicate identifier 'AccordionTrigger'.
src/app/game/current/habs.tsx(481,43): error TS2300: Duplicate identifier 'AccordionContent'.
src/app/game/current/resources.tsx(5,10): error TS2300: Duplicate identifier 'AccordionContent'.
src/app/game/current/resources.tsx(5,28): error TS2300: Duplicate identifier 'AccordionItem'.
src/app/game/current/resources.tsx(5,43): error TS2300: Duplicate identifier 'AccordionTrigger'.
src/app/game/current/resources.tsx(59,11): error TS2339: Property 'monthlyTransactionSummary' does not exist on type '{ fileName: string; lastModified: Date; gameCurrentDateTime: DateTime; gameCurrentDateTimeFormatted: string; player: { id: number; faction: number; templateName: string | null; displayName: string | null; }; ... 29 more ...; unificationCandidates: UnificationCandidate[]; }'.
src/app/game/current/resources.tsx(60,64): error TS7006: Parameter 'acc' implicitly has an 'any' type.
src/app/game/current/resources.tsx(60,69): error TS7006: Parameter 'curr' implicitly has an 'any' type.
src/app/game/current/resources.tsx(70,56): error TS7006: Parameter 'acc' implicitly has an 'any' type.

```

---

## Assistant (Build · Qwen 3.6-35B-A3B (local) · 17.8s)

_Thinking:_

There are many errors. Let me address the key ones:

1. **component.tsx**: `ScoringWeights` type not found - need to import it
2. **councilors.tsx**: Various type errors related to Sets and union types
3. **habs.tsx**: Duplicate imports of AccordionItem/etc at both top and bottom of file, plus missing properties on Analysis type
4. **resources.tsx**: Duplicate imports and missing properties
5. **drives.tsx**: Type error with nobles

Let me fix these issues:

1. First, fix component.tsx to import ScoringWeights
2. Fix the duplicate Accordion imports in habs.tsx and resources.tsx
3. Fix the Analysis type issues in habs.tsx and resources.tsx (the `analysis.availableBoostProjects` should be `analysis.playerFaction.availableBoostProjects`)

Let me start fixing these systematically.

Let me fix these errors systematically:



**Tool: edit**

**Input:**
```json
{
  "filePath": "terra-invicta-assistant\\src\\app\\game\\current\\component.tsx",
  "oldString": "import { ScoringWeightsDialog } from \"./scoringWeights\";",
  "newString": "import { ScoringWeightsDialog, ScoringWeights } from \"./scoringWeights\";"
}
```

**Output:**
```
Edit applied successfully.
```

---

## Assistant (Build · Qwen 3.6-35B-A3B (local) · 4.9s)

_Thinking:_

Now let me fix the habs.tsx duplicate imports. The imports are at line 5 and line 481. I need to remove the duplicate at line 481.

**Tool: read**

**Input:**
```json
{
  "filePath": "terra-invicta-assistant\\src\\app\\game\\current\\habs.tsx",
  "limit": 10,
  "offset": 1
}
```

**Output:**
```
<path>terra-invicta-assistant\src\app\game\current\habs.tsx</path>
<type>file</type>
<content>
1: "use client";
2: 
3: import { Boost, CombatScore, FactionIcons, HabPower, MissionControl, TechIcons, UnknownIcon, Water, Volatiles, Metals, Nobles, Fissiles, ControlPoint } from "@/components/icons";
4: import { combineEffects, ShowEffects, ShowEffectsProps } from "@/components/showEffects";
5: import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
6: import { Button } from "@/components/ui/button";
7: import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
8: import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
9: import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
10: import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

(Showing lines 1-10 of 481. Use offset=11 to continue.)
</content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "terra-invicta-assistant\\src\\app\\game\\current\\habs.tsx",
  "limit": 5,
  "offset": 478
}
```

**Output:**
```
<path>terra-invicta-assistant\src\app\game\current\habs.tsx</path>
<type>file</type>
<content>
478:   }
479: }
480: 
481: import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

(End of file - total 481 lines)
</content>
```

---

## Assistant (Build · Qwen 3.6-35B-A3B (local) · 5.0s)

_Thinking:_

I see the issue - the duplicate import is at line 481. I need to remove it. Also, the Analysis type doesn't have `availableBoostProjects` etc directly - they're on `playerFaction`. Let me fix these issues.

**Tool: edit**

**Input:**
```json
{
  "filePath": "terra-invicta-assistant\\src\\app\\game\\current\\habs.tsx",
  "oldString": "}\n\nimport { AccordionItem, AccordionTrigger, AccordionContent } from \"@/components/ui/accordion\";",
  "newString": "}"
}
```

**Output:**
```
Edit applied successfully.
```

---

## Assistant (Build · Qwen 3.6-35B-A3B (local) · 3.4s)

_Thinking:_

Now let me fix the habs.tsx Analysis type issues. The `availableBoostProjects` etc. are on `playerFaction`, not directly on `analysis`. Let me check and fix.

**Tool: read**

**Input:**
```json
{
  "filePath": "terra-invicta-assistant\\src\\app\\game\\current\\habs.tsx",
  "limit": 40,
  "offset": 255
}
```

**Output:**
```
<path>terra-invicta-assistant\src\app\game\current\habs.tsx</path>
<type>file</type>
<content>
255:   );
256: }
257: 
258: export function HabsAvailableBoostProjects({ analysis }: { analysis: Analysis }) {
259:   const { availableBoostProjects } = analysis;
260:   if (availableBoostProjects.length === 0) return null;
261:   return (
262:     <ul>
263:       {availableBoostProjects.toSorted((a, b) => a.researchCost - b.researchCost).map((project, ix) => {
264:         const Icon = TechIcons[project.techCategory] || UnknownIcon;
265:         return <li key={ix}><Icon /> <ResearchLink name={project.dataName} displayName={project.friendlyName} /> ({project.researchCost})</li>;
266:       })}
267:     </ul>
268:   );
269: }
270: 
271: export function HabsAvailableCPProjects({ analysis }: { analysis: Analysis }) {
272:   const { availableCPProjects } = analysis;
273:   if (availableCPProjects.length === 0) return null;
274:   return (
275:     <ul>
276:       {availableCPProjects.toSorted((a, b) => {
277:         const aRemaining = a.researchCost - a.currentProgress;
278:         const bRemaining = b.researchCost - b.currentProgress;
279:         const aEfficiency = aRemaining > 0 ? a.cpBonus / aRemaining : 0;
280:         const bEfficiency = bRemaining > 0 ? b.cpBonus / bRemaining : 0;
281:         return bEfficiency - aEfficiency;
282:       }).map((project, ix) => {
283:         const Icon = TechIcons[project.techCategory] || UnknownIcon;
284:         return <li key={ix}><Icon /> <ResearchLink name={project.dataName} displayName={project.friendlyName} /> ({project.currentProgress.toFixed(0)}/{project.researchCost}, +{project.cpBonus} CP)</li>;
285:       })}
286:     </ul>
287:   );
288: }
289: 
290: export function HabsAvailableMaxOrgProjects({ analysis }: { analysis: Analysis }) {
291:   const { availableMaxOrgProjects } = analysis;
292:   if (availableMaxOrgProjects.length === 0) return null;
293:   return (
294:     <ul>

(Showing lines 255-294 of 479. Use offset=295 to continue.)
</content>
```

---

## Assistant (Build · Qwen 3.6-35B-A3B (local) · 50.5s)

_Thinking:_

I see the issue - the Analysis type doesn't have `availableBoostProjects` directly. Let me check what the original habs.tsx had. In the original file, it was `analysis.playerFaction.availableBoostProjects`. I need to fix all these references in habs.tsx.

Let me fix all these at once with a find-and-replace approach.

**Tool: edit**

**Input:**
```json
{
  "filePath": "terra-invicta-assistant\\src\\app\\game\\current\\habs.tsx",
  "oldString": "export function HabsAvailableBoostProjects({ analysis }: { analysis: Analysis }) {\n  const { availableBoostProjects } = analysis;\n  if (availableBoostProjects.length === 0) return null;\n  return (\n    <ul>\n      {availableBoostProjects.toSorted((a, b) => a.researchCost - b.researchCost).map((project, ix) => {\n        const Icon = TechIcons[project.techCategory] || UnknownIcon;\n        return <li key={ix}><Icon /> <ResearchLink name={project.dataName} displayName={project.friendlyName} /> ({project.researchCost})</li>;\n      })}\n    </ul>\n  );\n}\n\nexport function HabsAvailableCPProjects({ analysis }: { analysis: Analysis }) {\n  const { availableCPProjects } = analysis;\n  if (availableCPProjects.length === 0) return null;\n  return (\n    <ul>\n      {availableCPProjects.toSorted((a, b) => {\n        const aRemaining = a.researchCost - a.currentProgress;\n        const bRemaining = b.researchCost - b.currentProgress;\n        const aEfficiency = aRemaining > 0 ? a.cpBonus / aRemaining : 0;\n        const bEfficiency = bRemaining > 0 ? b.cpBonus / bRemaining : 0;\n        return bEfficiency - aEfficiency;\n      }).map((project, ix) => {\n        const Icon = TechIcons[project.techCategory] || UnknownIcon;\n        return <li key={ix}><Icon /> <ResearchLink name={project.dataName} displayName={project.friendlyName} /> ({project.currentProgress.toFixed(0)}/{project.researchCost}, +{project.cpBonus} CP)</li>;\n      })}\n    </ul>\n  );\n}\n\nexport function HabsAvailableMaxOrgProjects({ analysis }: { analysis: Analysis }) {\n  const { availableMaxOrgProjects } = analysis;\n  if (availableMaxOrgProjects.length === 0) return null;\n  return (\n    <ul>\n      {availableMaxOrgProjects.toSorted((a, b) => a.researchCost - b.researchCost).map((project, ix) => {\n        const Icon = TechIcons[project.techCategory] || UnknownIcon;\n        return <li key={ix}><Icon /> <ResearchLink name={project.dataName} displayName={project.friendlyName} /> ({project.researchCost})</li>;\n      })}\n    </ul>\n  );\n}\n\nexport function HabsAvailableExpandNations({ analysis }: { analysis: Analysis }) {\n  const { availableExpandNationProjects } = analysis;\n  if (availableExpandNationProjects.length === 0) return null;\n  return (\n    <ul>\n      {availableExpandNationProjects.toSorted((a, b) => {\n        const aRemaining = a.researchCost - a.currentProgress;\n        const bRemaining = b.researchCost - b.currentProgress;\n        return aRemaining - bRemaining;\n      }).map((project, ix) => {\n        const Icon = TechIcons[project.techCategory] || UnknownIcon;\n        return <li key={ix}><Icon /> <ResearchLink name={project.dataName} displayName={project.friendlyName} /> ({project.currentProgress.toFixed(0)}/{project.researchCost}, {project.requiresNation})</li>;\n      })}\n    </ul>\n  );\n}\n\nexport function HabsAvailableStealableProjects({ analysis }: { analysis: Analysis }) {\n  const { playerStealableProjects, factionsById, projects } = analysis;\n  if (playerStealableProjects.length === 0) return null;\n  return (\n    <ul>\n      {playerStealableProjects.map(({ projectName, factionId }, ix) => {\n        const faction = factionsById.get(factionId);\n        if (!faction) return null;\n        const FactionIcon = faction.templateName ? FactionIcons[faction.templateName] : UnknownIcon;\n        const project = projects.get(projectName);\n        if (!project) return null;\n        const Icon = TechIcons[project.techCategory] || UnknownIcon;\n        return <li key={ix}><FactionIcon title={faction.displayName!} /> {faction.displayName} <Icon /> <ResearchLink name={projectName} displayName={project.displayName!} /> ({project.researchCost})</li>;\n      })}\n    </ul>\n  );\n}",
  "newString": "export function HabsAvailableBoostProjects({ analysis }: { analysis: Analysis }) {\n  const { availableBoostProjects } = analysis.playerFaction;\n  if (availableBoostProjects.length === 0) return null;\n  return (\n    <ul>\n      {availableBoostProjects.toSorted((a: any, b: any) => a.researchCost - b.researchCost).map((project: any, ix: number) => {\n        const Icon = TechIcons[project.techCategory as keyof typeof TechIcons] || UnknownIcon;\n        return <li key={ix}><Icon /> <ResearchLink name={project.dataName} displayName={project.friendlyName} /> ({project.researchCost})</li>;\n      })}\n    </ul>\n  );\n}\n\nexport function HabsAvailableCPProjects({ analysis }: { analysis: Analysis }) {\n  const { availableCPProjects } = analysis.playerFaction;\n  if (availableCPProjects.length === 0) return null;\n  return (\n    <ul>\n      {availableCPProjects.toSorted((a: any, b: any) => {\n        const aRemaining = a.researchCost - a.currentProgress;\n        const bRemaining = b.researchCost - b.currentProgress;\n        const aEfficiency = aRemaining > 0 ? a.cpBonus / aRemaining : 0;\n        const bEfficiency = bRemaining > 0 ? b.cpBonus / bRemaining : 0;\n        return bEfficiency - aEfficiency;\n      }).map((project: any, ix: number) => {\n        const Icon = TechIcons[project.techCategory as keyof typeof TechIcons] || UnknownIcon;\n        return <li key={ix}><Icon /> <ResearchLink name={project.dataName} displayName={project.friendlyName} /> ({project.currentProgress.toFixed(0)}/{project.researchCost}, +{project.cpBonus} CP)</li>;\n      })}\n    </ul>\n  );\n}\n\nexport function HabsAvailableMaxOrgProjects({ analysis }: { analysis: Analysis }) {\n  const { availableMaxOrgProjects } = analysis.playerFaction;\n  if (availableMaxOrgProjects.length === 0) return null;\n  return (\n    <ul>\n      {availableMaxOrgProjects.toSorted((a: any, b: any) => a.researchCost - b.researchCost).map((project: any, ix: number) => {\n        const Icon = TechIcons[project.techCategory as keyof typeof TechIcons] || UnknownIcon;\n        return <li key={ix}><Icon /> <ResearchLink name={project.dataName} displayName={project.friendlyName} /> ({project.researchCost})</li>;\n      })}\n    </ul>\n  );\n}\n\nexport function HabsAvailableExpandNations({ analysis }: { analysis: Analysis }) {\n  const { availableExpandNationProjects } = analysis.playerFaction;\n  if (availableExpandNationProjects.length === 0) return null;\n  return (\n    <ul>\n      {availableExpandNationProjects.toSorted((a: any, b: any) => {\n        const aRemaining = a.researchCost - a.currentProgress;\n        const bRemaining = b.researchCost - b.currentProgress;\n        return aRemaining - bRemaining;\n      }).map((project: any, ix: number) => {\n        const Icon = TechIcons[project.techCategory as keyof typeof TechIcons] || UnknownIcon;\n        return <li key={ix}><Icon /> <ResearchLink name={project.dataName} displayName={project.friendlyName} /> ({project.currentProgress.toFixed(0)}/{project.researchCost}, {project.requiresNation})</li>;\n      })}\n    </ul>\n  );\n}\n\nexport function HabsAvailableStealableProjects({ analysis }: { analysis: Analysis }) {\n  const { playerStealableProjects, factionsById, projects } = analysis;\n  if (playerStealableProjects.length === 0) return null;\n  return (\n    <ul>\n      {playerStealableProjects.map(({ projectName, factionId }: { projectName: string; factionId: number }, ix: number) => {\n        const faction = factionsById.get(factionId);\n        if (!faction) return null;\n        const FactionIcon = faction.templateName ? FactionIcons[faction.templateName as keyof typeof FactionIcons] : UnknownIcon;\n        const project = projects.get(projectName);\n        if (!project) return null;\n        const Icon = TechIcons[project.techCategory as keyof typeof TechIcons] || UnknownIcon;\n        return <li key={ix}><FactionIcon title={faction.displayName!} /> {faction.displayName} <Icon /> <ResearchLink name={projectName} displayName={project.displayName!} /> ({project.researchCost})</li>;\n      })}\n    </ul>\n  );\n}"
}
```

**Output:**
```
Edit applied successfully.
```

---

## Assistant (Build · Qwen 3.6-35B-A3B (local) · 3.1s)

_Thinking:_

Now fix the HabsComponent that references `analysis.availableBoostProjects` etc. - they should be `analysis.playerFaction.availableBoostProjects`.

**Tool: read**

**Input:**
```json
{
  "filePath": "terra-invicta-assistant\\src\\app\\game\\current\\habs.tsx",
  "limit": 30,
  "offset": 440
}
```

**Output:**
```
<path>terra-invicta-assistant\src\app\game\current\habs.tsx</path>
<type>file</type>
<content>
440: 
441: export function HabsComponent({ analysis }: { analysis: Analysis }) {
442:   return (
443:     <SmartAccordion type="multiple" defaultValue={["current-bonuses", "future-bonuses", "available-cp-projects"]} storageKey="habs">
444:       <AccordionItem value="current-bonuses"><AccordionTrigger><span>Current Hab bonuses</span></AccordionTrigger><AccordionContent><HabsCurrentBonuses analysis={analysis} /></AccordionContent></AccordionItem>
445:       <AccordionItem value="future-bonuses"><AccordionTrigger><span>Future Hab bonuses (including unpowered/under-construction)</span></AccordionTrigger><AccordionContent><HabsFutureBonuses analysis={analysis} /></AccordionContent></AccordionItem>
446:       <AccordionItem value="boost-mc-summary"><AccordionTrigger><span>MC/Boost Income Summary</span></AccordionTrigger><AccordionContent><HabsBoostMcSummary analysis={analysis} /></AccordionContent></AccordionItem>
447:       <AccordionItem value="alien-hate"><AccordionTrigger><span>Alien Hate</span></AccordionTrigger><AccordionContent><HabsAlienHate analysis={analysis} /></AccordionContent></AccordionItem>
448:       <AccordionItem value="building-details"><AccordionTrigger><span>Building Details</span></AccordionTrigger><AccordionContent><HabsBuildingDetails analysis={analysis} /></AccordionContent></AccordionItem>
449:       {analysis.availableBoostProjects.length > 0 && <AccordionItem value="available-boost-projects"><AccordionTrigger><span>Available Boost Projects</span></AccordionTrigger><AccordionContent><HabsAvailableBoostProjects analysis={analysis} /></AccordionContent></AccordionItem>}
450:       {analysis.availableCPProjects.length > 0 && <AccordionItem value="available-cp-projects"><AccordionTrigger><span>Available Control Point Projects</span></AccordionTrigger><AccordionContent><HabsAvailableCPProjects analysis={analysis} /></AccordionContent></AccordionItem>}
451:       {analysis.availableMaxOrgProjects.length > 0 && <AccordionItem value="available-max-org-projects"><AccordionTrigger><span>Available Max Org Projects</span></AccordionTrigger><AccordionContent><HabsAvailableMaxOrgProjects analysis={analysis} /></AccordionContent></AccordionItem>}
452:       {analysis.availableExpandNationProjects.length > 0 && <AccordionItem value="available-expand-nation-projects"><AccordionTrigger><span>Available Expand Nations</span></AccordionTrigger><AccordionContent><HabsAvailableExpandNations analysis={analysis} /></AccordionContent></AccordionItem>}
453:       {analysis.playerStealableProjects.length > 0 && <AccordionItem value="available-stealable-projects"><AccordionTrigger><span>Available Stealable Projects</span></AccordionTrigger><AccordionContent><HabsAvailableStealableProjects analysis={analysis} /></AccordionContent></AccordionItem>}
454:       <AccordionItem value="technology-goals"><AccordionTrigger><span>Technology goals</span></AccordionTrigger><AccordionContent><HabsTechnologyGoals analysis={analysis} /></AccordionContent></AccordionItem>
455:       <AccordionItem value="habs"><AccordionTrigger><span>Manage Habs</span></AccordionTrigger><AccordionContent><HabsManageHabs analysis={analysis} /></AccordionContent></AccordionItem>
456:       <AccordionItem value="mines"><AccordionTrigger><span>Manage Mines</span></AccordionTrigger><AccordionContent><HabsManageMines analysis={analysis} /></AccordionContent></AccordionItem>
457:     </SmartAccordion>
458:   );
459: }
460: 
461: // Section-specific content renderers for tree navigation
462: export function HabsContent({ analysis, section }: { analysis: Analysis; section: string }) {
463:   switch (section) {
464:     case "current-bonuses": return <HabsCurrentBonuses analysis={analysis} />;
465:     case "future-bonuses": return <HabsFutureBonuses analysis={analysis} />;
466:     case "boost-mc-summary": return <HabsBoostMcSummary analysis={analysis} />;
467:     case "alien-hate": return <HabsAlienHate analysis={analysis} />;
468:     case "building-details": return <HabsBuildingDetails analysis={analysis} />;
469:     case "available-boost-projects": return <HabsAvailableBoostProjects analysis={analysis} />;

(Showing lines 440-469 of 479. Use offset=470 to continue.)
</content>
```

---

## Assistant (Build · Qwen 3.6-35B-A3B (local) · 15.4s)

_Thinking:_

I need to fix the HabsComponent to reference `analysis.playerFaction.availableBoostProjects` etc. Let me fix those lines.

**Tool: edit**

**Input:**
```json
{
  "filePath": "terra-invicta-assistant\\src\\app\\game\\current\\habs.tsx",
  "oldString": "     {analysis.availableBoostProjects.length > 0 && <AccordionItem value=\"available-boost-projects\"><AccordionTrigger><span>Available Boost Projects</span></AccordionTrigger><AccordionContent><HabsAvailableBoostProjects analysis={analysis} /></AccordionContent></AccordionItem>}\n      {analysis.availableCPProjects.length > 0 && <AccordionItem value=\"available-cp-projects\"><AccordionTrigger><span>Available Control Point Projects</span></AccordionTrigger><AccordionContent><HabsAvailableCPProjects analysis={analysis} /></AccordionContent></AccordionItem>}\n      {analysis.availableMaxOrgProjects.length > 0 && <AccordionItem value=\"available-max-org-projects\"><AccordionTrigger><span>Available Max Org Projects</span></AccordionTrigger><AccordionContent><HabsAvailableMaxOrgProjects analysis={analysis} /></AccordionContent></AccordionItem>}\n      {analysis.availableExpandNationProjects.length > 0 && <AccordionItem value=\"available-expand-nation-projects\"><AccordionTrigger><span>Available Expand Nations</span></AccordionTrigger><AccordionContent><HabsAvailableExpandNations analysis={analysis} /></AccordionContent></AccordionItem>}",
  "newString": "     {analysis.playerFaction.availableBoostProjects.length > 0 && <AccordionItem value=\"available-boost-projects\"><AccordionTrigger><span>Available Boost Projects</span></AccordionTrigger><AccordionContent><HabsAvailableBoostProjects analysis={analysis} /></AccordionContent></AccordionItem>}\n      {analysis.playerFaction.availableCPProjects.length > 0 && <AccordionItem value=\"available-cp-projects\"><AccordionTrigger><span>Available Control Point Projects</span></AccordionTrigger><AccordionContent><HabsAvailableCPProjects analysis={analysis} /></AccordionContent></AccordionItem>}\n      {analysis.playerFaction.availableMaxOrgProjects.length > 0 && <AccordionItem value=\"available-max-org-projects\"><AccordionTrigger><span>Available Max Org Projects</span></AccordionTrigger><AccordionContent><HabsAvailableMaxOrgProjects analysis={analysis} /></AccordionContent></AccordionItem>}\n      {analysis.playerFaction.availableExpandNationProjects.length > 0 && <AccordionItem value=\"available-expand-nation-projects\"><AccordionTrigger><span>Available Expand Nations</span></AccordionTrigger><AccordionContent><HabsAvailableExpandNations analysis={analysis} /></AccordionContent></AccordionItem>}"
}
```

**Output:**
```
Edit applied successfully.
```

---

## Assistant (Build · Qwen 3.6-35B-A3B (local) · 4.3s)

_Thinking:_

Now let me fix resources.tsx - it has duplicate imports and missing properties on Analysis. Let me remove the duplicate import and fix the Analysis references.

**Tool: read**

**Input:**
```json
{
  "filePath": "terra-invicta-assistant\\src\\app\\game\\current\\resources.tsx",
  "limit": 10,
  "offset": 1
}
```

**Output:**
```
<path>terra-invicta-assistant\src\app\game\current\resources.tsx</path>
<type>file</type>
<content>
1: "use client";
2: 
3: import { Boost, ControlPoint, FactionIcons, MissionControl, PrioritySpoils, ResourceIcons } from "@/components/icons";
4: import { pct } from "@/components/showEffects";
5: import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
6: import { Button } from "@/components/ui/button";
7: import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
8: import { SmartAccordion } from "@/components/ui/smart-accordion";
9: import { Table, TableBody, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
10: import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

(Showing lines 1-10 of 337. Use offset=11 to continue.)
</content>
```

---

## Assistant (Build · Qwen 3.6-35B-A3B (local) · 4.1s)

_Thinking:_

The duplicate import for resources.tsx is likely at the bottom. Let me check and remove it. Also, I need to check if the Analysis type has `monthlyTransactionSummary` - it might be on `playerFaction`.

**Tool: bash**

**Input:**
```json
{
  "command": "tail -5 terra-invicta-assistant\\src\\app\\game\\current\\resources.tsx",
  "description": "Check end of resources.tsx"
}
```

**Output:**
```
    content: <ResourcesComponent analysis={analysis} />,
  };
}

import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

```

---

## Assistant (Build · Qwen 3.6-35B-A3B (local) · 3.6s)

_Thinking:_

I need to remove the duplicate import at the bottom of resources.tsx.

**Tool: edit**

**Input:**
```json
{
  "filePath": "terra-invicta-assistant\\src\\app\\game\\current\\resources.tsx",
  "oldString": "import { AccordionItem, AccordionTrigger, AccordionContent } from \"@/components/ui/accordion\";",
  "newString": ""
}
```

**Output:**
```
Edit applied successfully.
```

---

## Assistant (Build · Qwen 3.6-35B-A3B (local) · 3.5s)

_Thinking:_

Now let me check if `monthlyTransactionSummary` is on `playerFaction` or directly on `Analysis`. Looking at the original code, it was `analysis.playerFaction.monthlyTransactionSummary`. Let me fix the ResourcesTransactions component.

**Tool: read**

**Input:**
```json
{
  "filePath": "terra-invicta-assistant\\src\\app\\game\\current\\resources.tsx",
  "limit": 80,
  "offset": 1
}
```

**Output:**
```
<path>terra-invicta-assistant\src\app\game\current\resources.tsx</path>
<type>file</type>
<content>
1: "use client";
2: 
3: import { Boost, ControlPoint, FactionIcons, MissionControl, PrioritySpoils, ResourceIcons } from "@/components/icons";
4: import { pct } from "@/components/showEffects";
5: import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
6: import { Button } from "@/components/ui/button";
7: import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
8: import { SmartAccordion } from "@/components/ui/smart-accordion";
9: import { Table, TableBody, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
10: import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
11: import { Analysis } from "@/lib/analysis";
12: import { ClaimCoverage } from "@/lib/analysis/nations";
13: import { diffDateTime, smartRound, sortByDateTime, toDays } from "@/lib/utils";
14: import { Trash2 } from "lucide-react";
15: import { twMerge } from "tailwind-merge";
16: 
17: function getNationBg(nation: Pick<Analysis["nations"][0], "wastedOppression" | "tooHighUnrest" | "couldBuildBoost" | "spoilsWithoutAllCPs">) {
18:   return twMerge(nation.couldBuildBoost ? "bg-green-100" : "", nation.tooHighUnrest ? "bg-yellow-100" : "", nation.spoilsWithoutAllCPs ? "bg-yellow-100" : "", nation.wastedOppression ? "bg-red-100" : "");
19: }
20: 
21: const NationCPDetails = ({ analysis, nation }: { nation: Analysis["nations"][0]; analysis: Analysis }) => {
22:   const { factionsById, playerFaction: { permaAbandonedNationIds, id: playerFactionId } } = analysis;
23:   return (
24:     <>
25:       {nation.controlPoints.length
26:         ? nation.controlPoints.map((cp) => {
27:             const faction = factionsById.get(cp.factionId!);
28:             const FactionIcon = faction ? FactionIcons[faction.templateName as keyof typeof FactionIcons] : ControlPoint;
29:             return <FactionIcon key={cp.id} className={twMerge(cp.benefitsDisabled ? "bg-red-200" : "", "p-1 rounded")} />;
30:           })
31:         : null}{" "}
32:       ({smartRound(nation.totalCpCost)} cost, {smartRound(nation.investmentPoints)} IP)
33:       {(() => {
34:         const earliestCrackdown = sortByDateTime(nation.controlPoints.filter((cp) => cp.crackdownExpiration), (cp) => cp.crackdownExpiration!)[0];
35:         if (earliestCrackdown) return <span>{" "}({toDays(diffDateTime(earliestCrackdown.crackdownExpiration!, analysis.gameCurrentDateTime)).toFixed(0)}d)</span>;
36:         return null;
37:       })()}
38:       {nation.controlPoints.some((cp) => cp.benefitsDisabled && cp.factionId == playerFactionId) && permaAbandonedNationIds.includes(nation.id) && (
39:         <span title="Perma-abandoned nation"><Trash2 className="inline-block h-4 w-4 stroke-destructive -mt-1 mx-1" /></span>
40:       )}
41:     </>
42:   );
43: };
44: 
45: const RELATIONSHIP_LABELS: Record<string, string> = { war: "War", federation: "Federation", ally: "Ally", neutral: "Neutral", rival: "Rival" };
46: const RELATIONSHIP_COLORS: Record<string, string> = { war: "text-red-600 font-bold", federation: "text-blue-700 font-medium", ally: "text-green-700 font-medium", neutral: "", rival: "text-red-700 font-medium" };
47: 
48: function ClaimCoverageCell({ coverage }: { coverage: ClaimCoverage }) {
49:   if (coverage.totalRegions === 0) return <span className="text-muted-foreground">N/A</span>;
50:   const allCovered = coverage.missing === 0;
51:   if (allCovered && coverage.hostile === 0) return <span className="text-green-600 font-medium" title="All regions covered, all non-hostile">✓ all</span>;
52:   if (allCovered) return <span className="text-amber-600 font-medium" title={`All regions covered, but ${coverage.hostile} hostile`}>✓ all <span className="text-red-500 text-xs">({coverage.hostile}⚔)</span></span>;
53:   return <span className="text-red-600 text-xs font-medium" title={`${coverage.missing} of ${coverage.totalRegions} missing${coverage.hostile > 0 ? `, ${coverage.hostile}⚔` : ""}`}>−{coverage.missing}/{coverage.totalRegions}{coverage.hostile > 0 && <span className="text-red-500"> ({coverage.hostile}⚔)</span>}</span>;
54: }
55: 
56: // ─── Section Components ───
57: 
58: export function ResourcesTransactions({ analysis }: { analysis: Analysis }) {
59:   const { monthlyTransactionSummary, playerFaction } = analysis;
60:   const bySourceByResource = monthlyTransactionSummary.reduce((acc, curr) => {
61:     if (!acc.has(curr.source)) acc.set(curr.source, new Map<string, { amount: number; transactions: { date: string; amount: number }[] }>());
62:     const resourceMap = acc.get(curr.source)!;
63:     const existing = resourceMap.get(curr.resource) || { amount: 0, transactions: [] };
64:     existing.amount += curr.amount;
65:     if (curr.transactions && curr.transactions.length > 0) existing.transactions.push(...curr.transactions);
66:     resourceMap.set(curr.resource, existing);
67:     return acc;
68:   }, new Map<string, Map<string, { amount: number; transactions: { date: string; amount: number }[] }>>());
69: 
70:   const byResource = monthlyTransactionSummary.reduce((acc, curr) => {
71:     if (!acc.has(curr.resource)) acc.set(curr.resource, 0);
72:     acc.set(curr.resource, acc.get(curr.resource)! + curr.amount);
73:     return acc;
74:   }, new Map<string, number>());
75: 
76:   const resourcesSet = new Set(["Money", "Influence", "Operations", "Research", "Boost", "Water", "Volatiles", "Metals", "NobleMetals", "Fissiles", "Antimatter", "Exotics", ...byResource.keys()]);
77:   resourcesSet.delete("Projects"); resourcesSet.delete("MissionControl");
78:   const resources = [...resourcesSet];
79: 
80:   return (

(Showing lines 1-80 of 337. Use offset=81 to continue.)
</content>
```

---

## Assistant (Build · Qwen 3.6-35B-A3B (local) · 18.3s)

_Thinking:_

I see that `monthlyTransactionSummary` is accessed from `analysis` directly in my new code, but the original had it as `analysis.playerFaction.monthlyTransactionSummary`. Let me fix this.

**Tool: edit**

**Input:**
```json
{
  "filePath": "terra-invicta-assistant\\src\\app\\game\\current\\resources.tsx",
  "oldString": "export function ResourcesTransactions({ analysis }: { analysis: Analysis }) {\n  const { monthlyTransactionSummary, playerFaction } = analysis;\n  const bySourceByResource = monthlyTransactionSummary.reduce((acc, curr) => {\n    if (!acc.has(curr.source)) acc.set(curr.source, new Map<string, { amount: number; transactions: { date: string; amount: number }[] }>());\n    const resourceMap = acc.get(curr.source)!;\n    const existing = resourceMap.get(curr.resource) || { amount: 0, transactions: [] };\n    existing.amount += curr.amount;\n    if (curr.transactions && curr.transactions.length > 0) existing.transactions.push(...curr.transactions);\n    resourceMap.set(curr.resource, existing);\n    return acc;\n  }, new Map<string, Map<string, { amount: number; transactions: { date: string; amount: number }[] }>>());\n\n  const byResource = monthlyTransactionSummary.reduce((acc, curr) => {\n    if (!acc.has(curr.resource)) acc.set(curr.resource, 0);\n    acc.set(curr.resource, acc.get(curr.resource)! + curr.amount);\n    return acc;\n  }, new Map<string, number>());",
  "newString": "export function ResourcesTransactions({ analysis }: { analysis: Analysis }) {\n  const { monthlyTransactionSummary } = analysis.playerFaction;\n  const bySourceByResource = monthlyTransactionSummary.reduce((acc: Map<string, Map<string, { amount: number; transactions: { date: string; amount: number }[] }>>, curr: any) => {\n    if (!acc.has(curr.source)) acc.set(curr.source, new Map<string, { amount: number; transactions: { date: string; amount: number }[] }>());\n    const resourceMap = acc.get(curr.source)!;\n    const existing = resourceMap.get(curr.resource) || { amount: 0, transactions: [] };\n    existing.amount += curr.amount;\n    if (curr.transactions && curr.transactions.length > 0) existing.transactions.push(...curr.transactions);\n    resourceMap.set(curr.resource, existing);\n    return acc;\n  }, new Map<string, Map<string, { amount: number; transactions: { date: string; amount: number }[] }>>());\n\n  const byResource = monthlyTransactionSummary.reduce((acc: Map<string, number>, curr: any) => {\n    if (!acc.has(curr.resource)) acc.set(curr.resource, 0);\n    acc.set(curr.resource, acc.get(curr.resource)! + curr.amount);\n    return acc;\n  }, new Map<string, number>());"
}
```

**Output:**
```
Edit applied successfully.
```

---

## Assistant (Build · Qwen 3.6-35B-A3B (local) · 2.9s)

_Thinking:_

Now let me check the drives.tsx nobles issue.

**Tool: bash**

**Input:**
```json
{
  "command": "grep -n \"nobles\" terra-invicta-assistant\\src\\app\\game\\current\\drives.tsx",
  "description": "Find nobles usage in drives.tsx"
}
```

**Output:**
```
102:            const propellantEffects = { water: drive.propellantMaterials.water, volatiles: drive.propellantMaterials.volatiles, metals: drive.propellantMaterials.metals, nobles: drive.propellantMaterials.nobleMetals, fissiles: drive.propellantMaterials.fissiles, antimatter: drive.propellantMaterials.antimatter };
133:                            {drive.reactorMaterials && <div className="flex items-center gap-1"><ShowEffects water={drive.reactorMaterials.water || undefined} volatiles={drive.reactorMaterials.volatiles || undefined} metals={drive.reactorMaterials.metals || undefined} nobles={drive.reactorMaterials.nobleMetals || undefined} /></div>}
140:                            {drive.radiatorMaterials && <div className="flex items-center gap-1"><ShowEffects volatiles={drive.radiatorMaterials.volatiles || undefined} metals={drive.radiatorMaterials.metals || undefined} nobles={drive.radiatorMaterials.nobles || undefined} exotics={drive.radiatorMaterials.exotics || undefined} /></div>}

```

---

## Assistant (Build · Qwen 3.6-35B-A3B (local) · 7.8s)

_Thinking:_

The issue is on line 140 where it's using `drive.radiatorMaterials.nobles` but the Materials type doesn't have `nobles`. Let me check the original drives.tsx to see how it handled this. Looking at the original, it used `nobleMetals` not `nobles`. Let me fix this.

**Tool: edit**

**Input:**
```json
{
  "filePath": "terra-invicta-assistant\\src\\app\\game\\current\\drives.tsx",
  "oldString": "                           {drive.radiatorMaterials && <div className=\"flex items-center gap-1\"><ShowEffects volatiles={drive.radiatorMaterials.volatiles || undefined} metals={drive.radiatorMaterials.metals || undefined} nobles={drive.radiatorMaterials.nobles || undefined} exotics={drive.radiatorMaterials.exotics || undefined} /></div>}",
  "newString": "                           {drive.radiatorMaterials && <div className=\"flex items-center gap-1\"><ShowEffects volatiles={drive.radiatorMaterials.volatiles || undefined} metals={drive.radiatorMaterials.metals || undefined} nobles={drive.radiatorMaterials.nobleMetals || undefined} exotics={drive.radiatorMaterials.exotics || undefined} /></div>}"
}
```

**Output:**
```
Edit applied successfully.
```

---

## Assistant (Build · Qwen 3.6-35B-A3B (local) · 5.5s)

_Thinking:_

Now let me run the TypeScript compiler again to see how many errors remain.

**Tool: bash**

**Input:**
```json
{
  "command": "npx tsc --noEmit 2>&1 | head -60",
  "description": "Check TypeScript compilation",
  "timeout": 60000
}
```

**Output:**
```
src/app/game/current/councilors.tsx(342,67): error TS17019: '!' at the end of a type is not valid TypeScript syntax. Did you mean to write 'Partial<Record<TechCategory, number>>'?
src/app/game/current/councilors.tsx(348,60): error TS17019: '!' at the end of a type is not valid TypeScript syntax. Did you mean to write 'Partial<Record<TechCategory, number>>'?
src/app/game/current/councilors.tsx(545,51): error TS2322: Type 'Set<number>' is not assignable to type 'Set<string>'.
  Type 'number' is not assignable to type 'string'.
src/app/game/current/councilors.tsx(637,51): error TS2322: Type 'Set<number>' is not assignable to type 'Set<string>'.
  Type 'number' is not assignable to type 'string'.
src/app/game/current/councilors.tsx(728,49): error TS2322: Type 'Set<number>' is not assignable to type 'Set<string>'.
  Type 'number' is not assignable to type 'string'.
src/app/game/current/councilors.tsx(785,55): error TS2322: Type 'Set<number>' is not assignable to type 'Set<string>'.
  Type 'number' is not assignable to type 'string'.
src/app/game/current/councilors.tsx(819,7): error TS2769: No overload matches this call.
  Overload 1 of 2, '(...items: ConcatArray<{ type: "councilor"; councilor: { id: number; displayName: string; factionId: number | undefined; councilorType: { dataName: string; friendlyName: string; missionNames: MissionDataName[]; } | undefined; ... 10 more ...; playerIntel: number; }; factionId: number | undefined; missions: MissionDataName[]; }>[]): { ...; }[]', gave the following error.
    Argument of type '{ type: "org"; org: { id: number; displayName: string; templateName: string | null; template: { dataName: string; friendlyName: string; orgType: string; requiresNationality: boolean; allowedOnMarket: boolean; ... 4 more ...; techBonuses: { ...; }[]; } | undefined; ... 40 more ...; isAdminOrg: boolean; }; factionId: ...' is not assignable to parameter of type 'ConcatArray<{ type: "councilor"; councilor: { id: number; displayName: string; factionId: number | undefined; councilorType: { dataName: string; friendlyName: string; missionNames: MissionDataName[]; } | undefined; ... 10 more ...; playerIntel: number; }; factionId: number | undefined; missions: MissionDataName[]; }>'.
      The types returned by 'slice(...)' are incompatible between these types.
        Type '{ type: "org"; org: { id: number; displayName: string; templateName: string | null; template: { dataName: string; friendlyName: string; orgType: string; requiresNationality: boolean; allowedOnMarket: boolean; ... 4 more ...; techBonuses: { ...; }[]; } | undefined; ... 40 more ...; isAdminOrg: boolean; }; factionId: ...' is not assignable to type '{ type: "councilor"; councilor: { id: number; displayName: string; factionId: number | undefined; councilorType: { dataName: string; friendlyName: string; missionNames: MissionDataName[]; } | undefined; ... 10 more ...; playerIntel: number; }; factionId: number | undefined; missions: MissionDataName[]; }[]'.
          Property 'councilor' is missing in type '{ type: "org"; org: { id: number; displayName: string; templateName: string | null; template: { dataName: string; friendlyName: string; orgType: string; requiresNationality: boolean; allowedOnMarket: boolean; ... 4 more ...; techBonuses: { ...; }[]; } | undefined; ... 40 more ...; isAdminOrg: boolean; }; factionId: ...' but required in type '{ type: "councilor"; councilor: { id: number; displayName: string; factionId: number | undefined; councilorType: { dataName: string; friendlyName: string; missionNames: MissionDataName[]; } | undefined; ... 10 more ...; playerIntel: number; }; factionId: number | undefined; missions: MissionDataName[]; }'.
  Overload 2 of 2, '(...items: ({ type: "councilor"; councilor: { id: number; displayName: string; factionId: number | undefined; councilorType: { dataName: string; friendlyName: string; missionNames: MissionDataName[]; } | undefined; ... 10 more ...; playerIntel: number; }; factionId: number | undefined; missions: MissionDataName[]; } | ConcatArray<...>)[]): { ...; }[]', gave the following error.
    Argument of type '{ type: "org"; org: { id: number; displayName: string; templateName: string | null; template: { dataName: string; friendlyName: string; orgType: string; requiresNationality: boolean; allowedOnMarket: boolean; ... 4 more ...; techBonuses: { ...; }[]; } | undefined; ... 40 more ...; isAdminOrg: boolean; }; factionId: ...' is not assignable to parameter of type '{ type: "councilor"; councilor: { id: number; displayName: string; factionId: number | undefined; councilorType: { dataName: string; friendlyName: string; missionNames: MissionDataName[]; } | undefined; ... 10 more ...; playerIntel: number; }; factionId: number | undefined; missions: MissionDataName[]; } | ConcatArr...'.
      Type '{ type: "org"; org: { id: number; displayName: string; templateName: string | null; template: { dataName: string; friendlyName: string; orgType: string; requiresNationality: boolean; allowedOnMarket: boolean; ... 4 more ...; techBonuses: { ...; }[]; } | undefined; ... 40 more ...; isAdminOrg: boolean; }; factionId: ...' is not assignable to type 'ConcatArray<{ type: "councilor"; councilor: { id: number; displayName: string; factionId: number | undefined; councilorType: { dataName: string; friendlyName: string; missionNames: MissionDataName[]; } | undefined; ... 10 more ...; playerIntel: number; }; factionId: number | undefined; missions: MissionDataName[]; }>'.
        The types returned by 'slice(...)' are incompatible between these types.
          Type '{ type: "org"; org: { id: number; displayName: string; templateName: string | null; template: { dataName: string; friendlyName: string; orgType: string; requiresNationality: boolean; allowedOnMarket: boolean; ... 4 more ...; techBonuses: { ...; }[]; } | undefined; ... 40 more ...; isAdminOrg: boolean; }; factionId: ...' is not assignable to type '{ type: "councilor"; councilor: { id: number; displayName: string; factionId: number | undefined; councilorType: { dataName: string; friendlyName: string; missionNames: MissionDataName[]; } | undefined; ... 10 more ...; playerIntel: number; }; factionId: number | undefined; missions: MissionDataName[]; }[]'.
            Property 'councilor' is missing in type '{ type: "org"; org: { id: number; displayName: string; templateName: string | null; template: { dataName: string; friendlyName: string; orgType: string; requiresNationality: boolean; allowedOnMarket: boolean; ... 4 more ...; techBonuses: { ...; }[]; } | undefined; ... 40 more ...; isAdminOrg: boolean; }; factionId: ...' but required in type '{ type: "councilor"; councilor: { id: number; displayName: string; factionId: number | undefined; councilorType: { dataName: string; friendlyName: string; missionNames: MissionDataName[]; } | undefined; ... 10 more ...; playerIntel: number; }; factionId: number | undefined; missions: MissionDataName[]; }'.
src/app/game/current/councilors.tsx(827,7): error TS2769: No overload matches this call.
  Overload 1 of 2, '(...items: ConcatArray<{ type: "councilor"; councilor: { id: number; displayName: string; factionId: number | undefined; councilorType: { dataName: string; friendlyName: string; missionNames: MissionDataName[]; } | undefined; ... 10 more ...; playerIntel: number; }; factionId: number | undefined; missions: MissionDataName[]; }>[]): { ...; }[]', gave the following error.
    Argument of type '{ type: "org"; org: { councilorId: number | undefined; councilor: string | undefined; admin: number | undefined; faction: { id: number; displayName: string | null; templateName: string | null; } | undefined; ... 44 more ...; isAdminOrg: boolean; }; factionId: number | undefined; missions: MissionDataName[]; }[]' is not assignable to parameter of type 'ConcatArray<{ type: "councilor"; councilor: { id: number; displayName: string; factionId: number | undefined; councilorType: { dataName: string; friendlyName: string; missionNames: MissionDataName[]; } | undefined; ... 10 more ...; playerIntel: number; }; factionId: number | undefined; missions: MissionDataName[]; }>'.
      The types returned by 'slice(...)' are incompatible between these types.
        Type '{ type: "org"; org: { councilorId: number | undefined; councilor: string | undefined; admin: number | undefined; faction: { id: number; displayName: string | null; templateName: string | null; } | undefined; ... 44 more ...; isAdminOrg: boolean; }; factionId: number | undefined; missions: MissionDataName[]; }[]' is not assignable to type '{ type: "councilor"; councilor: { id: number; displayName: string; factionId: number | undefined; councilorType: { dataName: string; friendlyName: string; missionNames: MissionDataName[]; } | undefined; ... 10 more ...; playerIntel: number; }; factionId: number | undefined; missions: MissionDataName[]; }[]'.
          Property 'councilor' is missing in type '{ type: "org"; org: { councilorId: number | undefined; councilor: string | undefined; admin: number | undefined; faction: { id: number; displayName: string | null; templateName: string | null; } | undefined; ... 44 more ...; isAdminOrg: boolean; }; factionId: number | undefined; missions: MissionDataName[]; }' but required in type '{ type: "councilor"; councilor: { id: number; displayName: string; factionId: number | undefined; councilorType: { dataName: string; friendlyName: string; missionNames: MissionDataName[]; } | undefined; ... 10 more ...; playerIntel: number; }; factionId: number | undefined; missions: MissionDataName[]; }'.
  Overload 2 of 2, '(...items: ({ type: "councilor"; councilor: { id: number; displayName: string; factionId: number | undefined; councilorType: { dataName: string; friendlyName: string; missionNames: MissionDataName[]; } | undefined; ... 10 more ...; playerIntel: number; }; factionId: number | undefined; missions: MissionDataName[]; } | ConcatArray<...>)[]): { ...; }[]', gave the following error.
    Argument of type '{ type: "org"; org: { councilorId: number | undefined; councilor: string | undefined; admin: number | undefined; faction: { id: number; displayName: string | null; templateName: string | null; } | undefined; ... 44 more ...; isAdminOrg: boolean; }; factionId: number | undefined; missions: MissionDataName[]; }[]' is not assignable to parameter of type '{ type: "councilor"; councilor: { id: number; displayName: string; factionId: number | undefined; councilorType: { dataName: string; friendlyName: string; missionNames: MissionDataName[]; } | undefined; ... 10 more ...; playerIntel: number; }; factionId: number | undefined; missions: MissionDataName[]; } | ConcatArr...'.
      Type '{ type: "org"; org: { councilorId: number | undefined; councilor: string | undefined; admin: number | undefined; faction: { id: number; displayName: string | null; templateName: string | null; } | undefined; ... 44 more ...; isAdminOrg: boolean; }; factionId: number | undefined; missions: MissionDataName[]; }[]' is not assignable to type 'ConcatArray<{ type: "councilor"; councilor: { id: number; displayName: string; factionId: number | undefined; councilorType: { dataName: string; friendlyName: string; missionNames: MissionDataName[]; } | undefined; ... 10 more ...; playerIntel: number; }; factionId: number | undefined; missions: MissionDataName[]; }>'.
        The types returned by 'slice(...)' are incompatible between these types.
          Type '{ type: "org"; org: { councilorId: number | undefined; councilor: string | undefined; admin: number | undefined; faction: { id: number; displayName: string | null; templateName: string | null; } | undefined; ... 44 more ...; isAdminOrg: boolean; }; factionId: number | undefined; missions: MissionDataName[]; }[]' is not assignable to type '{ type: "councilor"; councilor: { id: number; displayName: string; factionId: number | undefined; councilorType: { dataName: string; friendlyName: string; missionNames: MissionDataName[]; } | undefined; ... 10 more ...; playerIntel: number; }; factionId: number | undefined; missions: MissionDataName[]; }[]'.
            Property 'councilor' is missing in type '{ type: "org"; org: { councilorId: number | undefined; councilor: string | undefined; admin: number | undefined; faction: { id: number; displayName: string | null; templateName: string | null; } | undefined; ... 44 more ...; isAdminOrg: boolean; }; factionId: number | undefined; missions: MissionDataName[]; }' but required in type '{ type: "councilor"; councilor: { id: number; displayName: string; factionId: number | undefined; councilorType: { dataName: string; friendlyName: string; missionNames: MissionDataName[]; } | undefined; ... 10 more ...; playerIntel: number; }; factionId: number | undefined; missions: MissionDataName[]; }'.
src/app/game/current/councilors.tsx(903,47): error TS2322: Type 'Set<number>' is not assignable to type 'Set<string>'.
  Type 'number' is not assignable to type 'string'.
src/app/game/current/resources.tsx(87,14): error TS2304: Cannot find name 'TableCell'.
src/app/game/current/resources.tsx(87,34): error TS2304: Cannot find name 'TableCell'.
src/app/game/current/resources.tsx(90,34): error TS2304: Cannot find name 'TableCell'.
src/app/game/current/resources.tsx(90,61): error TS2304: Cannot find name 'TableCell'.
src/app/game/current/resources.tsx(94,18): error TS2304: Cannot find name 'TableCell'.
src/app/game/current/resources.tsx(100,19): error TS2304: Cannot find name 'TableCell'.
src/app/game/current/resources.tsx(129,14): error TS2304: Cannot find name 'TableCell'.
src/app/game/current/resources.tsx(129,46): error TS2304: Cannot find name 'TableCell'.
src/app/game/current/resources.tsx(130,14): error TS2304: Cannot find name 'TableCell'.
src/app/game/current/resources.tsx(130,81): error TS2304: Cannot find name 'TableCell'.
src/app/game/current/resources.tsx(131,14): error TS2304: Cannot find name 'TableCell'.
src/app/game/current/resources.tsx(131,117): error TS2304: Cannot find name 'TableCell'.
src/app/game/current/resources.tsx(132,14): error TS2304: Cannot find name 'TableCell'.
src/app/game/current/resources.tsx(132,129): error TS2304: Cannot find name 'TableCell'.
src/app/game/current/resources.tsx(133,14): error TS2304: Cannot find name 'TableCell'.
src/app/game/current/resources.tsx(133,125): error TS2304: Cannot find name 'TableCell'.
src/app/game/current/resources.tsx(134,14): error TS2304: Cannot find name 'TableCell'.
src/app/game/current/resources.tsx(134,109): error TS2304: Cannot find name 'TableCell'.
src/app/game/current/resources.tsx(135,14): error TS2304: Cannot find name 'TableCell'.
src/app/game/current/resources.tsx(135,52): error TS2304: Cannot find name 'TableCell'.
src/app/game/current/resources.tsx(136,14): error TS2304: Cannot find name 'TableCell'.
src/app/game/current/resources.tsx(136,168): error TS2304: Cannot find name 'TableCell'.
src/app/game/current/resources.tsx(137,14): error TS2304: Cannot find name 'TableCell'.
src/app/game/current/resources.tsx(137,72): error TS2304: Cannot find name 'TableCell'.

```

---

## Assistant (Build · Qwen 3.6-35B-A3B (local) · 11.2s)

_Thinking:_

There are still many errors. Let me fix them:

1. councilors.tsx: Type errors with `!` on types, Set types, and union types
2. resources.tsx: Missing TableCell import (likely removed when I removed the duplicate import)

Let me fix the resources.tsx TableCell issue first - it's a missing import.

**Tool: read**

**Input:**
```json
{
  "filePath": "terra-invicta-assistant\\src\\app\\game\\current\\resources.tsx",
  "limit": 5,
  "offset": 8
}
```

**Output:**
```
<path>terra-invicta-assistant\src\app\game\current\resources.tsx</path>
<type>file</type>
<content>
8: import { SmartAccordion } from "@/components/ui/smart-accordion";
9: import { Table, TableBody, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
10: import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
11: import { Analysis } from "@/lib/analysis";
12: import { ClaimCoverage } from "@/lib/analysis/nations";

(Showing lines 8-12 of 337. Use offset=13 to continue.)
</content>
```

---

## Assistant (Build · Qwen 3.6-35B-A3B (local) · 4.6s)

_Thinking:_

I see - the TableCell import is missing from the table imports. Let me fix it.

**Tool: edit**

**Input:**
```json
{
  "filePath": "terra-invicta-assistant\\src\\app\\game\\current\\resources.tsx",
  "oldString": "import { Table, TableBody, TableFooter, TableHead, TableHeader, TableRow } from \"@/components/ui/table\";",
  "newString": "import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from \"@/components/ui/table\";"
}
```

**Output:**
```
Edit applied successfully.
```

---

## Assistant (Build · Qwen 3.6-35B-A3B (local) · 5.2s)

_Thinking:_

Now let me fix the councilors.tsx issues. The main ones are:
1. `!` at end of type - this is TypeScript not recognizing `!` as a valid type operator. The issue is with `weights.councilorTechBonus!` and `weights.techBonuses!` - these need to be handled differently.
2. `Set<number>` vs `Set<string>` - the `playerNationIds` is being created as `Set<number>` but the `OrgTableRow` expects `Set<string>`
3. Union type issues with `concat()`

Let me fix these.

**Tool: read**

**Input:**
```json
{
  "filePath": "terra-invicta-assistant\\src\\app\\game\\current\\councilors.tsx",
  "limit": 15,
  "offset": 335
}
```

**Output:**
```
<path>terra-invicta-assistant\src\app\game\current\councilors.tsx</path>
<type>file</type>
<content>
335:   addScore("spaceDevBonus", props.spaceDevBonus, weights.spaceDevBonus);
336:   addScore("spaceflightBonus", props.spaceflightBonus, weights.spaceflightBonus);
337:   addScore("MCBonus", props.MCBonus, weights.MCBonus);
338:   addScore("miningBonus", props.miningBonus, weights.miningBonus);
339: 
340:   if (weights.councilorTechBonus && props?.councilorTechBonus) {
341:     for (const { category, bonus } of props.councilorTechBonus) {
342:       const weight = weights.councilorTechBonus[category as keyof typeof weights.councilorTechBonus!];
343:       addScore(`councilorTechBonus[${category}]`, bonus, weight);
344:     }
345:   }
346:   if (weights.techBonuses && props?.techBonuses) {
347:     for (const { category, bonus } of props.techBonuses) {
348:       const weight = weights.techBonuses[category as keyof typeof weights.techBonuses!];
349:       addScore(`techBonus[${category}]`, bonus, weight);

(Showing lines 335-349 of 996. Use offset=350 to continue.)
</content>
```

---

## Assistant (Build · Qwen 3.6-35B-A3B (local) · 11.1s)

_Thinking:_

I see the issue - `weights.councilorTechBonus!` - the `!` is not valid TypeScript syntax in this context. It's a non-null assertion operator, not a type annotation. Let me fix these.

**Tool: edit**

**Input:**
```json
{
  "filePath": "terra-invicta-assistant\\src\\app\\game\\current\\councilors.tsx",
  "oldString": " if (weights.councilorTechBonus && props?.councilorTechBonus) {\n    for (const { category, bonus } of props.councilorTechBonus) {\n      const weight = weights.councilorTechBonus[category as keyof typeof weights.councilorTechBonus!];\n      addScore(`councilorTechBonus[${category}]`, bonus, weight);\n    }\n  }\n  if (weights.techBonuses && props?.techBonuses) {\n    for (const { category, bonus } of props.techBonuses) {\n      const weight = weights.techBonuses[category as keyof typeof weights.techBonuses!];\n      addScore(`techBonus[${category}]`, bonus, weight);",
  "newString": " if (weights.councilorTechBonus && props?.councilorTechBonus) {\n    for (const { category, bonus } of props.councilorTechBonus) {\n      const weight = weights.councilorTechBonus?.[category as keyof typeof weights.councilorTechBonus!];\n      addScore(`councilorTechBonus[${category}]`, bonus, weight);\n    }\n  }\n  if (weights.techBonuses && props?.techBonuses) {\n    for (const { category, bonus } of props.techBonuses) {\n      const weight = weights.techBonuses?.[category as keyof typeof weights.techBonuses!];\n      addScore(`techBonus[${category}]`, bonus, weight);"
}
```

**Output:**
```
Edit applied successfully.
```

---

## Assistant (Build · Qwen 3.6-35B-A3B (local) · 4.6s)

_Thinking:_

Now let me fix the `Set<number>` vs `Set<string>` issue. The `playerNationIds` is being created from `analysis.playerNationIds` which is `Set<number>` but `OrgTableRow` expects `Set<string>`. Let me check and fix the type.

**Tool: bash**

**Input:**
```json
{
  "command": "grep -n \"Set<number>\" terra-invicta-assistant\\src\\app\\game\\current\\councilors.tsx",
  "description": "Find Set<number> usages"
}
```

**Output:**
```
(no output)
```

---

## Assistant (Build · Qwen 3.6-35B-A3B (local) · 2.9s)

_Thinking:_

No `Set<number>` in councilors.tsx. Let me check the actual error lines.

**Tool: read**

**Input:**
```json
{
  "filePath": "terra-invicta-assistant\\src\\app\\game\\current\\councilors.tsx",
  "limit": 5,
  "offset": 543
}
```

**Output:**
```
<path>terra-invicta-assistant\src\app\game\current\councilors.tsx</path>
<type>file</type>
<content>
543:           <TableBody>
544:             {scoredOrgs.map((org) => (
545:               <OrgTableRow key={org.id} org={org} playerNationIds={new Set(analysis.playerNationIds)}
546:                 playerTraits={new Set(analysis.playerCouncilors.flatMap((i) => i.traitTemplateNames))} />
547:             ))}

(Showing lines 543-547 of 996. Use offset=548 to continue.)
</content>
```

---

## Assistant (Build · Qwen 3.6-35B-A3B (local) · 4.2s)

_Thinking:_

I see - the `OrgTableRow` component has `playerNationIds: Set<string>` but `analysis.playerNationIds` is `Set<number>`. Let me check the OrgTableRow type definition.

**Tool: bash**

**Input:**
```json
{
  "command": "grep -n \"playerNationIds\" terra-invicta-assistant\\src\\app\\game\\current\\councilors.tsx | head -10",
  "description": "Find playerNationIds usages"
}
```

**Output:**
```
149:  playerNationIds,
160:  playerNationIds: Set<string>;
175:            {playerNationIds.has(String(org.homeNationId)) ? (
545:              <OrgTableRow key={org.id} org={org} playerNationIds={new Set(analysis.playerNationIds)}
590:  const playerNationIds = new Set(analysis.playerNationIds);
637:              <OrgTableRow key={org.id} org={org} playerNationIds={playerNationIds} playerTraits={playerTraits}
719:  const playerNationIds = new Set(analysis.playerNationIds);
728:            <OrgTableRow key={org.id} org={org} playerNationIds={playerNationIds} playerTraits={playerTraits}
765:  const playerNationIds = new Set(analysis.playerNationIds);
785:                  <OrgTableRow key={org.id} org={org} playerNationIds={playerNationIds} playerTraits={playerTraits}

```

---

## Assistant (Build · Qwen 3.6-35B-A3B (local) · 14.5s)

_Thinking:_

I see the issue - line 160 defines `playerNationIds: Set<string>` but `analysis.playerNationIds` is `Set<number>`. I need to change the type to `Set<number>` and use `playerNationIds.has(org.homeNationId)` directly without `String()`.

**Tool: edit**

**Input:**
```json
{
  "filePath": "terra-invicta-assistant\\src\\app\\game\\current\\councilors.tsx",
  "oldString": " playerNationIds: Set<string>;\n  playerTraits: Set<string>;\n  highlightMissionClassName?: (missionName: MissionDataName) => string | undefined;\n  isTakeover?: boolean;\n}) {\n  const missingRequiredTraits = org.template?.requiredOwnerTraits?.filter((t) => !playerTraits.has(t)) || [];\n  function traitIcon(trait: MissionDataName, Fallback: typeof PlusCircleIcon) {\n    return TraitIcons[trait as keyof typeof TraitIcons] || Fallback;\n  }\n  return (\n    <TableRow key={org.id} className={twMerge(org.isAdminOrg ? \"bg-green-100\" : \"\", org.type === \"unassigned\" ? \"bg-yellow-100\" : \"\")}>\n      <TableCell>{org.displayName}</TableCell>\n      <TableCell>\n        {org.template?.requiresNationality && (\n          <span className=\"mr-1\" title={`Required Nation: ${org.homeNationName || \"\"}`}>\n            {playerNationIds.has(String(org.homeNationId)) ? (",
  "newString": " playerNationIds: Set<number>;\n  playerTraits: Set<string>;\n  highlightMissionClassName?: (missionName: MissionDataName) => string | undefined;\n  isTakeover?: boolean;\n}) {\n  const missingRequiredTraits = org.template?.requiredOwnerTraits?.filter((t) => !playerTraits.has(t)) || [];\n  function traitIcon(trait: MissionDataName, Fallback: typeof PlusCircleIcon) {\n    return TraitIcons[trait as keyof typeof TraitIcons] || Fallback;\n  }\n  return (\n    <TableRow key={org.id} className={twMerge(org.isAdminOrg ? \"bg-green-100\" : \"\", org.type === \"unassigned\" ? \"bg-yellow-100\" : \"\")}>\n      <TableCell>{org.displayName}</TableCell>\n      <TableCell>\n        {org.template?.requiresNationality && (\n          <span className=\"mr-1\" title={`Required Nation: ${org.homeNationName || \"\"}`}>\n            {playerNationIds.has(org.homeNationId || -1) ? ("
}
```

**Output:**
```
Edit applied successfully.
```

---

## Assistant (Build · Qwen 3.6-35B-A3B (local) · 4.7s)

_Thinking:_

Now let me fix the union type issue with `concat()`. The problem is that `concat()` tries to infer a narrow type from the first array. I need to cast properly.

**Tool: read**

**Input:**
```json
{
  "filePath": "terra-invicta-assistant\\src\\app\\game\\current\\councilors.tsx",
  "limit": 30,
  "offset": 810
}
```

**Output:**
```
<path>terra-invicta-assistant\src\app\game\current\councilors.tsx</path>
<type>file</type>
<content>
810: 
811:   const sourcesByFactionByMission = [...playerCouncilors, ...playerVisibleCouncilors]
812:     .map((i) => ({
813:       type: "councilor" as const,
814:       councilor: i,
815:       factionId: i.factionId,
816:       missions: i.effectsWithOrgsAndAugments.missionsGrantedNames || [],
817:     }))
818:     .concat(
819:       [...playerAvailableOrgs, ...playerUnassignedOrgs].map((i) => ({
820:         type: "org" as const,
821:         org: i,
822:         factionId: playerFaction?.id,
823:         missions: i.template?.missionsGrantedNames || [],
824:       }))
825:     )
826:     .concat(
827:       playerStealableOrgs.map((i) => ({
828:         type: "org" as const,
829:         org: i,
830:         factionId: i.faction?.id,
831:         missions: i.template?.missionsGrantedNames || [],
832:       }))
833:     )
834:     .reduce((acc, o) => {
835:       const key = o.factionId || 0;
836:       if (!acc.has(key)) acc.set(key, new Map<string, MissionSource[]>());
837:       const effectsMap = acc.get(key)!;
838:       o.missions.forEach((m) => {
839:         if (!effectsMap.has(m)) effectsMap.set(m, []);

(Showing lines 810-839 of 996. Use offset=840 to continue.)
</content>
```

---

## Assistant (Build · Qwen 3.6-35B-A3B (local) · 13.8s)

_Thinking:_

The issue is with `.concat()` - TypeScript infers the array type from the first element and doesn't allow adding different types. Let me use array spread instead.

**Tool: edit**

**Input:**
```json
{
  "filePath": "terra-invicta-assistant\\src\\app\\game\\current\\councilors.tsx",
  "oldString": " const sourcesByFactionByMission = [...playerCouncilors, ...playerVisibleCouncilors]\n    .map((i) => ({\n      type: \"councilor\" as const,\n      councilor: i,\n      factionId: i.factionId,\n      missions: i.effectsWithOrgsAndAugments.missionsGrantedNames || [],\n    }))\n    .concat(\n      [...playerAvailableOrgs, ...playerUnassignedOrgs].map((i) => ({\n        type: \"org\" as const,\n        org: i,\n        factionId: playerFaction?.id,\n        missions: i.template?.missionsGrantedNames || [],\n      }))\n    )\n    .concat(\n      playerStealableOrgs.map((i) => ({\n        type: \"org\" as const,\n        org: i,\n        factionId: i.faction?.id,\n        missions: i.template?.missionsGrantedNames || [],\n      }))\n    )\n    .reduce((acc, o) => {",
  "newString": " const sourcesByFactionByMission = [\n    ...[...playerCouncilors, ...playerVisibleCouncilors].map((i) => ({\n      type: \"councilor\" as const,\n      councilor: i,\n      factionId: i.factionId,\n      missions: i.effectsWithOrgsAndAugments.missionsGrantedNames || [],\n    })),\n    ...[...playerAvailableOrgs, ...playerUnassignedOrgs].map((i) => ({\n      type: \"org\" as const,\n      org: i,\n      factionId: playerFaction?.id,\n      missions: i.template?.missionsGrantedNames || [],\n    })),\n    ...playerStealableOrgs.map((i) => ({\n      type: \"org\" as const,\n      org: i,\n      factionId: i.faction?.id,\n      missions: i.template?.missionsGrantedNames || [],\n    })),\n  ].reduce((acc, o) => {"
}
```

**Output:**
```
Edit applied successfully.
```

---

## Assistant (Build · Qwen 3.6-35B-A3B (local) · 4.3s)

_Thinking:_

Now let me check if there's still the same issue at line 827 (OtherCouncilors section). Let me check:

**Tool: read**

**Input:**
```json
{
  "filePath": "terra-invicta-assistant\\src\\app\\game\\current\\councilors.tsx",
  "limit": 30,
  "offset": 900
}
```

**Output:**
```
<path>terra-invicta-assistant\src\app\game\current\councilors.tsx</path>
<type>file</type>
<content>
900:                             ) : (
901:                               <CouncilorTableRow key={`org-${src.councilor.id}-mission-${missionName}`}
902:                                 councilor={src.councilor} stats={src.councilor.effectsWithOrgsAndAugments}
903:                                 label={src.councilor.displayName!} />
904:                             )
905:                           )}
906:                         </TableBody>
907:                       </Table>
908:                     </AccordionContent>
909:                   </AccordionItem>
910:                 );
911:               })}
912:             </SmartAccordion>
913:           </TabsContent>
914:         ))}
915:       </SmartTabs>
916: 
917:       <Collapsible>
918:         <CollapsibleTrigger className="text-xs text-muted-foreground hover:text-foreground">Debug Data</CollapsibleTrigger>
919:         <CollapsibleContent>
920:           <pre>{JSON.stringify(analysis.playerFaction, null, 2)}</pre>
921:         </CollapsibleContent>
922:       </Collapsible>
923:     </div>
924:   );
925: }
926: 
927: export function OtherCouncilors({ analysis, weights }: { analysis: Analysis; weights: ScoringWeights }) {
928:   const { playerVisibleCouncilors, factionsById } = analysis;
929: 

(Showing lines 900-929 of 992. Use offset=930 to continue.)
</content>
```

---

## Assistant (Build · Qwen 3.6-35B-A3B (local) · 5.8s)

_Thinking:_

The OtherCouncilors function doesn't have the same `.concat()` issue. Let me run the TypeScript compiler again to see what errors remain.

**Tool: bash**

**Input:**
```json
{
  "command": "npx tsc --noEmit 2>&1 | head -40",
  "description": "Check TypeScript compilation",
  "timeout": 60000
}
```

**Output:**
```
src/app/game/current/councilors.tsx(342,69): error TS17019: '!' at the end of a type is not valid TypeScript syntax. Did you mean to write 'Partial<Record<TechCategory, number>>'?
src/app/game/current/councilors.tsx(348,62): error TS17019: '!' at the end of a type is not valid TypeScript syntax. Did you mean to write 'Partial<Record<TechCategory, number>>'?

```

---

## Assistant (Build · Qwen 3.6-35B-A3B (local) · 3.5s)

_Thinking:_

Still have the `!` issue. Let me look at the exact lines:

**Tool: read**

**Input:**
```json
{
  "filePath": "terra-invicta-assistant\\src\\app\\game\\current\\councilors.tsx",
  "limit": 5,
  "offset": 340
}
```

**Output:**
```
<path>terra-invicta-assistant\src\app\game\current\councilors.tsx</path>
<type>file</type>
<content>
340:   if (weights.councilorTechBonus && props?.councilorTechBonus) {
341:     for (const { category, bonus } of props.councilorTechBonus) {
342:       const weight = weights.councilorTechBonus?.[category as keyof typeof weights.councilorTechBonus!];
343:       addScore(`councilorTechBonus[${category}]`, bonus, weight);
344:     }

(Showing lines 340-344 of 992. Use offset=345 to continue.)
</content>
```

---

## Assistant (Build · Qwen 3.6-35B-A3B (local) · 11.3s)

_Thinking:_

The issue is that `typeof weights.councilorTechBonus!` is not valid. The `!` non-null assertion cannot be used with `typeof`. Let me fix this by extracting the type first.

**Tool: edit**

**Input:**
```json
{
  "filePath": "terra-invicta-assistant\\src\\app\\game\\current\\councilors.tsx",
  "oldString": " if (weights.councilorTechBonus && props?.councilorTechBonus) {\n    for (const { category, bonus } of props.councilorTechBonus) {\n      const weight = weights.councilorTechBonus?.[category as keyof typeof weights.councilorTechBonus!];\n      addScore(`councilorTechBonus[${category}]`, bonus, weight);\n    }\n  }\n  if (weights.techBonuses && props?.techBonuses) {\n    for (const { category, bonus } of props.techBonuses) {\n      const weight = weights.techBonuses?.[category as keyof typeof weights.techBonuses!];\n      addScore(`techBonus[${category}]`, bonus, weight);",
  "newString": " const councilorTechBonuses = weights.councilorTechBonus;\n  const techBonuses = weights.techBonuses;\n  if (councilorTechBonuses && props?.councilorTechBonus) {\n    for (const { category, bonus } of props.councilorTechBonus) {\n      const weight = councilorTechBonuses[category as keyof typeof councilorTechBonuses];\n      addScore(`councilorTechBonus[${category}]`, bonus, weight);\n    }\n  }\n  if (techBonuses && props?.techBonuses) {\n    for (const { category, bonus } of props.techBonuses) {\n      const weight = techBonuses[category as keyof typeof techBonuses];\n      addScore(`techBonus[${category}]`, bonus, weight);"
}
```

**Output:**
```
Edit applied successfully.
```

---

## Assistant (Build · Qwen 3.6-35B-A3B (local) · 5.2s)

_Thinking:_

Now let me run TypeScript again.

**Tool: bash**

**Input:**
```json
{
  "command": "npx tsc --noEmit 2>&1",
  "description": "Check TypeScript compilation",
  "timeout": 60000
}
```

**Output:**
```
(no output)
```

---

## Assistant (Build · Qwen 3.6-35B-A3B (local) · 7.9s)

_Thinking:_

The TypeScript compilation is clean now. Let me update the todo list and verify everything works by running the dev server briefly.

**Tool: todowrite**

**Input:**
```json
{
  "todos": [
    {
      "content": "Create tree-nav.tsx - reusable tree navigation component with accordion-based collapsible nodes",
      "status": "completed",
      "priority": "high"
    },
    {
      "content": "Create scoring-context.tsx - context for councilor scoring state",
      "status": "completed",
      "priority": "high"
    },
    {
      "content": "Refactor councilors.tsx - extract sections as tree leaves, export tree structure",
      "status": "completed",
      "priority": "high"
    },
    {
      "content": "Refactor fleets.tsx - export tree structure",
      "status": "completed",
      "priority": "medium"
    },
    {
      "content": "Refactor habs.tsx - export tree structure",
      "status": "completed",
      "priority": "medium"
    },
    {
      "content": "Refactor resources.tsx - export tree structure",
      "status": "completed",
      "priority": "medium"
    },
    {
      "content": "Refactor drives.tsx - export tree structure",
      "status": "completed",
      "priority": "medium"
    },
    {
      "content": "Refactor component.tsx - tree layout with sidebar + content panel",
      "status": "completed",
      "priority": "high"
    },
    {
      "content": "Verify the app compiles correctly",
      "status": "completed",
      "priority": "high"
    }
  ]
}
```

**Output:**
```
[
  {
    "content": "Create tree-nav.tsx - reusable tree navigation component with accordion-based collapsible nodes",
    "status": "completed",
    "priority": "high"
  },
  {
    "content": "Create scoring-context.tsx - context for councilor scoring state",
    "status": "completed",
    "priority": "high"
  },
  {
    "content": "Refactor councilors.tsx - extract sections as tree leaves, export tree structure",
    "status": "completed",
    "priority": "high"
  },
  {
    "content": "Refactor fleets.tsx - export tree structure",
    "status": "completed",
    "priority": "medium"
  },
  {
    "content": "Refactor habs.tsx - export tree structure",
    "status": "completed",
    "priority": "medium"
  },
  {
    "content": "Refactor resources.tsx - export tree structure",
    "status": "completed",
    "priority": "medium"
  },
  {
    "content": "Refactor drives.tsx - export tree structure",
    "status": "completed",
    "priority": "medium"
  },
  {
    "content": "Refactor component.tsx - tree layout with sidebar + content panel",
    "status": "completed",
    "priority": "high"
  },
  {
    "content": "Verify the app compiles correctly",
    "status": "completed",
    "priority": "high"
  }
]
```

---

## Assistant (Build · Qwen 3.6-35B-A3B (local) · 13.8s)

_Thinking:_

The TypeScript compilation passes cleanly. Let me also run the Next.js build to make sure everything works end-to-end. But first let me check if the dev server can start properly by doing a quick check.

The TypeScript compilation passes cleanly. Let me verify the app builds:



**Tool: bash**

**Input:**
```json
{
  "command": "npx next build 2>&1 | tail -30",
  "description": "Build the Next.js app",
  "timeout": 120000
}
```

**Output:**
```
  Running TypeScript ...
  Collecting page data using 15 workers ...
  Generating static pages using 15 workers (0/8) ...
Loaded save file in 575ms
Loaded and decompressed save file in 627ms
Loaded, decompressed, and parsed save file in 744ms
  Generating static pages using 15 workers (2/8) 
  Generating static pages using 15 workers (4/8) 
  Generating static pages using 15 workers (6/8) 
Loaded save file in 2ms
Loaded and decompressed save file in 148ms
Loaded, decompressed, and parsed save file in 535ms
(node:34016) Warning: `--localstorage-file` was provided without a valid path
(Use `node --trace-warnings ...` to show where the warning was created)
Γ£ô Generating static pages using 15 workers (8/8) in 2.6s
  Finalizing page optimization ...

Route (app)
Γöî Γùï /
Γö£ Γùï /_not-found
Γö£ ╞Æ /api/game/current
Γö£ Γùï /debug/game
Γö£ Γùï /debug/templates
Γö£ Γùï /game/current
Γöö Γùï /game/static-current


Γùï  (Static)   prerendered as static content
╞Æ  (Dynamic)  server-rendered on demand


```

---

## Assistant (Build · Qwen 3.6-35B-A3B (local) · 15.4s)

_Thinking:_

The build succeeded. All pages compiled correctly including `/game/current`. 

Let me provide a summary of the changes made.

The app builds successfully. Here's a summary of the reorganization:

**New Files Created:**
- `src/app/game/current/tree-nav.tsx` - Reusable tree navigation component with collapsible nodes using Radix Collapsible, with localStorage persistence for expanded state
- `src/app/game/current/scoring-context.tsx` - React Context for scoring weights state shared across councilor sections

**Refactored Files:**

`component.tsx` - Complete rewrite:
- Replaced top-level `SmartTabs` with a two-column layout (left sidebar tree nav + right content panel)
- Collapsible sidebar with `TreeNav` component showing hierarchical categories
- `ContentPanel` component renders the selected section based on tree selection
- `ScoringProvider` wraps everything to share scoring state

`councilors.tsx` - Major restructure:
- Extracted 7 section components: `ScoreDetails`, `ExistingCouncil`, `FindNewCouncilors`, `CurrentOrgs`, `Takeover`, `Missions`, `OtherCouncilors`
- Each section is independently selectable from the tree
- Scoring utilities remain as shared functions
- Removed old accordion-wrapped `CouncilorsComponent`

`fleets.tsx` - Extracted 4 section components: `FleetsAlienSection`, `FleetsHumanSection`, `FleetsPlayerSection`, `FleetsConstructionSection`

`habs.tsx` - Extracted 13 section components: `HabsCurrentBonuses`, `HabsFutureBonuses`, `HabsBoostMcSummary`, `HabsAlienHate`, `HabsBuildingDetails`, project sections, `HabsTechnologyGoals`, `HabsManageHabs`, `HabsManageMines`

`resources.tsx` - Extracted 6 section components: `ResourcesTransactions`, `ResourcesOwnedNations`, `ResourcesSpoilTargets`, `ResourcesMcBoostTargets`, `ResourcesNationClaims`, `ResourcesUnificationCandidates`

`drives.tsx` - Exported `DrivesContent` with `DrivesTable` and `DriveCalculator` as selectable leaves

**Tree Navigation Structure:**
```
Councilors
  ├── Score Details
  ├── Existing Council
  ├── Find New Councilors
  ├── Current Organizations
  ├── Hostile Takeover
  ├── Missions
  └── Other Councilors
Fleets
  ├── Alien Fleets
  ├── Other Human Factions
  ├── Player Fleets
  └── Ships Under Construction
Habs
  ├── Current Bonuses
  ├── Future Bonuses
  ├── MC/Boost Summary
  ├── ... (11 more sections)
Resources
  ├── Transactions
  ├── Owned Nations
  ├── ... (4 more sections)
Drives
  ├── Drive Systems
  └── Drive Calculator
```

---

## Session notes

4080 w/ 26 MOE layers offloaded to CPU, resulting in a full? 262k (`2^18`) context.

```
docker run --rm --gpus 1  -v local\vllm-hf-cache:/root/.cache/huggingface  -p 8080:8080 ghcr.io/ggml-org/llama.cpp:server-cuda  --hf-repo mradermacher/Qwen3.6-35B-A3B-i1-GGUF --hf-file Qwen3.6-35B-A3B.i1-Q4_K_S.gguf --host 0.0.0.0 --n-cpu-moe 26 -ngl 9999
``

Run took about 32m10s - substantially faster than the `--n-cpu-moe 20` with only a 147k context.
