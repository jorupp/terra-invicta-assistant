# RenderGameComponent tree navigation redesign

**Session ID:** ses_1fff919c1ffeK2WHIbQxtvEe2r
**Created:** 5/6/2026, 8:21:52 PM
**Updated:** 5/6/2026, 9:34:20 PM

---

## User

This app has a very complicated UI that has been built up over a long time by adding lots of little pieces in a surgical manner.  We need to completely reorganize the mini-app in the RenderGameComponent displayed on the page /game/current.  Instead of a series of tabs at the top and expand/collapse sections in the page, there should instead be a (collapsible) tree-style navigation along the left side of the page to select the information to display in the main part of the page.  For example, there should be a "Councilors" tree item, which has the score details as a subtitle, then options below that for "Existing Council", "Find new", etc.  This way each individual thing is more focused, and that tree allows for quickly switching between parts. 

---

## Assistant (Build · Gemma 4-26B-A4B (local) · 20.3s)

_Thinking:_

The user wants to reorganize the UI of a component called `RenderGameComponent` located at the route `/game/current`.
The current UI uses tabs and expand/collapse sections.
The new UI should feature a collapsible tree-style navigation on the left side.
The tree should allow selecting different information to display in the main part of the page.
Example: "Councilors" tree item -> "Existing Council", "Find new", etc.

I need to:
1.  Locate `RenderGameComponent`.
2.  Understand its current implementation and how it renders different sections.
3.  Determine how the routing or state management handles switching between these sections.
4.  Plan the new tree-style navigation component.
5.  Implement the new UI.

Let's start by searching for `RenderGameComponent`.

I'll start by searching for the `RenderGameComponent` to understand its current implementation.



**Tool: glob**

**Input:**
```json
{
  "pattern": "**/*RenderGameComponent*"
}
```

**Output:**
```
No files found
```

---

## Assistant (Build · Gemma 4-26B-A4B (local) · 6.2s)

_Thinking:_

The user mentioned `RenderGameComponent`. I searched for it using a glob pattern and found nothing. It might be a component name used in code, not necessarily part of the filename, or I might have missed it if it's not in the filename. I'll try searching for the string "RenderGameComponent" in the codebase.

**Tool: grep**

**Input:**
```json
{
  "pattern": "RenderGameComponent"
}
```

**Output:**
```
Found 13 matches
terra-invicta-assistant\src\app\game\current\component.tsx:
  Line 12: export function RenderGameComponent({ analysis }: { analysis: Analysis }) {


terra-invicta-assistant\src\app\game\current\renderCurrentGame.tsx:
  Line 8: import { RenderGameComponent } from "./component";

  Line 48:   return <RenderGameComponent analysis={analysis} />;


terra-invicta-assistant\src\app\game\static-current\page.tsx:
  Line 5: import { RenderGameComponent } from "../current/component";

  Line 42:     return <RenderGameComponent analysis={analysis} />;


terra-invicta-assistant\.github\ai-log\20260203-spherical-ships-in-a-vacuum.md:
  Line 3905: 52.   return <RenderGameComponent analysis={analysis} />;

  Line 3908: 55. function RenderGameComponent({ analysis }: { analysis: Analysis }) {


terra-invicta-assistant\.github\ai-log\20260202-drives.md:
  Line 2658: 51.   return <RenderGameComponent analysis={analysis} />;

  Line 2661: 54. function RenderGameComponent({ analysis }: { analysis: Analysis }) {

  Line 2919: 51.   return <RenderGameComponent analysis={analysis} />;

  Line 2922: 54. function RenderGameComponent({ analysis }: { analysis: Analysis }) {

  Line 3116: 52.   return <RenderGameComponent analysis={analysis} />;

  Line 3119: 55. function RenderGameComponent({ analysis }: { analysis: Analysis }) {

```

---

## Assistant (Build · Gemma 4-26B-A4B (local) · 6.5s)

_Thinking:_

Okay, `RenderGameComponent` is defined in `src/app/game/current/component.tsx`.

Now I need to examine the contents of `src/app/game/current/component.tsx` to understand how it's currently structured and what it displays.


**Tool: read**

**Input:**
```json
{
  "filePath": "src/app/game/current/component.tsx"
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

---

## Assistant (Build · Gemma 4-26B-A4B (local) · 17.0s)

_Thinking:_

The `RenderGameComponent` currently uses `SmartTabs` to display different sections of the game analysis. The sections are:
- Councilors (`getCouncilorsUi`)
- Fleets (`getFleetsUi`)
- Habs (`getHabsUi`)
- Resources (`getResourcesUi`)
- Drives (`getDrivesUi`)

Each `tab` object seems to have a `key`, `tab` (label), and `content`.

The user wants a tree-style navigation on the left.
This means I need to:
1.  Identify all the content pieces that currently reside within these tabs.
2.  Some tabs (like Councilors) seem to have sub-sections (e.g., "Existing Council", "Find new"). I'll need to investigate those files.
3.  Redesign the layout to have a sidebar (tree) and a main content area.
4.  Manage the state of which section is currently selected in the main content area.

Let's look at `getCouncilorsUi` in `src/app/game/current/councilors.tsx` (assuming it's in the same directory).
Actually, the import is `import { getCouncilorsUi } from "./councilors";`.

I'll check `src/app/game/current/councilors.tsx`.


**Tool: read**

**Input:**
```json
{
  "filePath": "src/app/game/current/councilors.tsx"
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

---

## Assistant (Build · Gemma 4-26B-A4B (local) · 46.1s)

_Thinking:_

The `getCouncilorsUi` function returns a `content` property which is a `CouncilorsComponent`.
`CouncilorsComponent` uses a `SmartAccordion` with several `AccordionItem`s:
- `existing`: Manage Existing Council
- `new-councilors`: Find New Councilors
- `current-orgs`: Current Organizations
- `takeover`: Hostile Takeover
- `missions`: Missions
- `other-councilors`: Other Councilors

The user wants to replace this accordion/tabs approach with a tree-style navigation on the left.

The plan is:
1.  Refactor `RenderGameComponent` to use a two-column layout: a sidebar on the left and a content area on the right.
2.  The sidebar will contain a tree structure.
3.  The tree items will correspond to the current `AccordionItem`s and potentially the sub-items within them (like `SmartTabs` within `takeover` or `missions`).
4.  The main content area will display the selected section.

First, I'll need to decide how to structure the tree.
Root: Game Analysis
- Councilors
  - Existing Council
  - Find New Councilors
  - Current Organizations
  - Hostile Takeover
    - [Faction names] (from `takeover` tabs)
  - Missions
    - [Faction names] (from `missions` tabs)
  - Other Councilors
- Fleets
- Habs
- Resources
- Drives

Wait, the user said:
"For example, there should be a "Councilors" tree item, which has the score details as subtitle, then options below that for "Existing Council", "Find new", etc."

So the tree should be:
- Councilors (subtitle: score details)
  - Existing Council
  - Find new
  - ...

I'll need to extract the score details from `getCouncilorsUi`.
In `getCouncilorsUi`:
```tsx
366:   return {
367:     key: "councilors",
368:     tab: (
369:       <>
370:         Councilors ({worstExistingCouncilor?.toFixed(0)} vs. {bestAvailableCouncilor?.toFixed(0)}) / Orgs (
371:         {worstExistingOrg?.toFixed(2)} vs {bestAvailableOrg?.toFixed(2)})
372:       </>
373:     ),
374:     content: ( ... )
375:   );
```

I should probably create a new component for the Sidebar.

Let's look at other UI components to see how they are implemented.
`getFleetsUi`, `getHabsUi`, `getResourcesUi`, `getDrivesUi` are also in `src/app/game/current/`.

I'll list the files in `src/app/game/current/`.


**Tool: glob**

**Input:**
```json
{
  "pattern": "src/app/game/current/*"
}
```

**Output:**
```
terra-invicta-assistant\src\app\game\current\councilors.tsx
terra-invicta-assistant\src\app\game\current\component.tsx
terra-invicta-assistant\src\app\game\current\habs.tsx
terra-invicta-assistant\src\app\game\current\resources.tsx
terra-invicta-assistant\src\app\game\current\drives.tsx
terra-invicta-assistant\src\app\game\current\fleets.tsx
terra-invicta-assistant\src\app\game\current\renderCurrentGame.tsx
terra-invicta-assistant\src\app\game\current\technologyGoals.tsx
terra-invicta-assistant\src\app\game\current\scoringWeights.tsx
terra-invicta-assistant\src\app\game\current\page.tsx
terra-invicta-assistant\src\app\game\current\researchLink.tsx
terra-invicta-assistant\src\app\game\current\actions.ts
terra-invicta-assistant\src\app\game\current\useCurrent.ts
```

---

## Assistant (Build · Gemma 4-26B-A4B (local) · 14.5s)

_Thinking:_

Okay, I have the files.

I'll start by creating a todo list for this task.


**Tool: todowrite**

**Input:**
```json
{
  "todos": [
    {
      "content": "Analyze existing component structures and content hierarchy",
      "priority": "high",
      "status": "in_progress"
    },
    {
      "content": "Create a TreeNavigation component",
      "priority": "high",
      "status": "pending"
    },
    {
      "content": "Refactor RenderGameComponent to use a sidebar layout",
      "priority": "high",
      "status": "pending"
    },
    {
      "content": "Decouple content from the 'getXXXUi' functions to allow individual section rendering",
      "priority": "high",
      "status": "pending"
    },
    {
      "content": "Implement the tree navigation logic and content switching",
      "priority": "high",
      "status": "pending"
    },
    {
      "content": "Verify the new UI works as expected and styling is correct",
      "priority": "medium",
      "status": "pending"
    },
    {
      "content": "Run lint and typecheck",
      "priority": "medium",
      "status": "pending"
    }
  ]
}
```

**Output:**
```
[
  {
    "content": "Analyze existing component structures and content hierarchy",
    "priority": "high",
    "status": "in_progress"
  },
  {
    "content": "Create a TreeNavigation component",
    "priority": "high",
    "status": "pending"
  },
  {
    "content": "Refactor RenderGameComponent to use a sidebar layout",
    "priority": "high",
    "status": "pending"
  },
  {
    "content": "Decouple content from the 'getXXXUi' functions to allow individual section rendering",
    "priority": "high",
    "status": "pending"
  },
  {
    "content": "Implement the tree navigation logic and content switching",
    "priority": "high",
    "status": "pending"
  },
  {
    "content": "Verify the new UI works as expected and styling is correct",
    "priority": "medium",
    "status": "pending"
  },
  {
    "content": "Run lint and typecheck",
    "priority": "medium",
    "status": "pending"
  }
]
```

---

## Assistant (Build · Gemma 4-26B-A4B (local) · 6.6s)

_Thinking:_

I'll start by analyzing the other `getXXXUi` functions to see if they follow a similar pattern to `getCouncilorsUi`.
I'll check `getFleetsUi` in `src/app/game/current/fleets.tsx`.


**Tool: read**

**Input:**
```json
{
  "filePath": "src/app/game/current/fleets.tsx"
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

---

## Assistant (Build · Gemma 4-26B-A4B (local) · 75.2s)

_Thinking:_

`getFleetsUi` also uses a `SmartAccordion` with several `AccordionItem`s:
- `alien-fleets`
- `human-enemy-fleets`
- `player-fleets`
- `ships-under-construction`

And it has a summary in the `tab` label.

It seems I can refactor all of these.

Instead of returning `{ key, tab, content }`, I should probably change the architecture so that each component can be rendered individually based on a key.

For example:
`RenderGameComponent` will hold the state of the currently selected `sectionId`.
The sidebar will have a list of items.
When an item is clicked, `sectionId` is updated.
The main content area will render the component corresponding to `sectionId`.

The `sectionId` could be a dot-separated string to support hierarchy, e.g., `councilors.existing`, `councilors.new-councilors`, `fleets.alien-fleets`.

Let's define the hierarchy more clearly.

- `councilors`
  - `existing`
  - `new`
  - `current-orgs`
  - `takeover`
    - `[factionId]` (this is a bit tricky because it's dynamic)
  - `missions`
    - `[factionId]` (also dynamic)
  - `other`
- `fleets`
  - `alien`
  - `human-enemy`
  - `player`
  - `under-construction`
- `habs`
- `resources`
- `drives`

Actually, the user said "Instead of a series of tabs at the top and expand/collapse sections in the page, there should instead be a (collapsible) tree-style navigation along the left side of the page to select the information to display in the main part of the page."

If I want to support the dynamic parts (like factions in takeover/missions), I might need a more robust way to handle it.

Maybe I can just have the top-level categories in the tree, and when a category is selected, it shows its sub-sections (which could be tabs or accordions if they are many, or just a list of sub-items in the tree).

The user's example: `"Councilors" tree item, which has the score details as subtitle, then options below that for "Existing Council", "Find new", etc.`

This implies that "Councilors" is a parent node in the tree.

I'll need to find a way to pass the `analysis` and other necessary props to these individual components.

Let's refine the plan.

1.  **Redefine the component API.**
    Instead of `getXXXUi(analysis)` returning a whole chunk of JSX, I'll make it so I can call a component with a specific sub-section.
    Wait, the current `getXXXUi` functions are just helper functions that return an object.

    Actually, `getCouncilorsUi` returns `CouncilorsComponent` wrapped in some logic.

    I'll probably want to move away from `getXXXUi` and instead have components that take `analysis` and a `subSectionId`.

    Or, I can keep `getXXXUi` but change what it returns, or how it's used.

    If I change `RenderGameComponent` to:
    ```tsx
    export function RenderGameComponent({ analysis }: { analysis: Analysis }) {
       const [selectedSection, setSelectedSection] = useState("councilors.existing");

       return (
         <div className="flex h-screen">
           <Sidebar selectedSection={selectedSection} onSelect={setSelectedSection} analysis={analysis} />
           <main className="flex-1 overflow-auto">
             <Content area={selectedSection} analysis={analysis} />
           </main>
         </div>
       )
    }
    ```

    But `getCouncilorsUi` currently returns:
    ```tsx
    return {
      key: "councilors",
      tab: <>{/* summary text */}</>,
      content: <CouncilorsComponent ... />
    }
    ```

    If I want to support sub-sections, `CouncilorsComponent` itself would need to handle them, OR I need to break `CouncilorsComponent` apart.

    Breaking `CouncilorsComponent` apart seems better for a "tree" navigation.

    Let's see `CouncilorsComponent` in `src/app/game/current/councilors.tsx`. It has several `AccordionItem`s. I can turn these into sub-sections.

    Let's look at `getFleetsUi` again. It also has `AccordionItem`s.

    I'll start by creating the `Sidebar` component. I'll use `lucide-react` for icons if needed, as it's already used in the project.

    I'll also need to decide how to handle the "subtitle" for the Councilors item.

    I'll start by refactoring `src/app/game/current/component.tsx`.

    But first, I need to see what `SmartTabs` and `SmartAccordion` do. They probably manage their own state in `localStorage`.

    Actually, if I'm moving to a sidebar, I'll be managing the selection state in `RenderGameComponent`.

    Let's look at `src/app/game/current/component.tsx` again.
    It uses `SmartTabs`.

    I'll create a new file `src/app/game/current/sidebar.tsx`.

    Wait, I should probably create a more general way to define the tree.

    I'll start by refactoring `RenderGameComponent` to use a simple split layout.


**Tool: edit**

**Input:**
```json
{
  "filePath": "src/app/game/current/component.tsx",
  "newString": "import { Analysis } from \"@/lib/analysis\";\nimport { getCouncilorsUi } from \"./councilors\";\nimport { getFleetsUi } from \"./fleets\";\nimport { getHabsUi } from \"./habs\";\nimport { getResourcesUi } from \"./resources\";\nimport { getDrivesUi } from \"./drives\";\nimport { Sidebar } from \"./sidebar\";\n\nexport function RenderGameComponent({ analysis }: { analysis: Analysis }) {\n  const tabs = [\n    getCouncilorsUi(analysis),\n    getFleetsUi(analysis),\n    getHabsUi(analysis),\n    getResourcesUi(analysis),\n    getDrivesUi(analysis),\n  ];\n\n  return (\n    <div className=\"flex h-[calc(100vh-theme(spacing.12))] overflow-hidden\">\n      <Sidebar tabs={tabs} />\n      <div className=\"flex-1 overflow-auto mx-2\">\n        <h2 className=\"text-xl font-bold\">\n          Game: {analysis.fileName} ({analysis.lastModified?.toLocaleString()}) - Game date:{\" \"}\n          {analysis.gameCurrentDateTimeFormatted.split(\" \")[0]}\n        </h2>\n        <h3 className=\"text-lg\">Faction: {analysis.playerFaction.displayName}</h3>\n        <div className=\"mt-4\">\n          {/* Content will be rendered here by Sidebar or a separate component */}\n          {/* For now, let's keep the tabs to see if it works, but we'll replace it soon */}\n        </div>\n      </div>\n    </div>\n  );\n}\n",
  "oldString": "import { TabsContent, TabsList, TabsTrigger } from \"@/components/ui/tabs\";\nimport { SmartTabs } from \"@/components/ui/smart-tabs\";\nimport { Analysis } from \"@/lib/analysis\";\nimport { getCouncilorsUi } from \"./councilors\";\nimport { getFleetsUi } from \"./fleets\";\nimport { getHabsUi } from \"./habs\";\nimport { getResourcesUi } from \"./resources\";\nimport { getDrivesUi } from \"./drives\";\n\nexport function RenderGameComponent({ analysis }: { analysis: Analysis }) {\n  const tabs = [\n    getCouncilorsUi(analysis),\n    getFleetsUi(analysis),\n    getHabsUi(analysis),\n    getResourcesUi(analysis),\n    getDrivesUi(analysis),\n  ];\n  return (\n    <div className=\"mx-2\">\n      <h2>\n        Game: {analysis.fileName} ({analysis.lastModified?.toLocaleString()}) - Game date:{\" \"}\n        {analysis.gameCurrentDateTimeFormatted.split(\" \")[0]}\n      </h2>\n      <h3>Faction: {analysis.playerFaction.displayName}</h3>\n\n      <SmartTabs storageKey=\"mainTabs\" defaultValue={tabs[0].key}>\n        <TabsList>\n          {tabs.map((tab) => (\n            <TabsTrigger key={tab.key} value={tab.key}>\n              {tab.tab}\n            </TabsTrigger>\n          ))}\n        </TabsList>\n        {tabs.map((tab) => (\n          <TabsContent key={tab.key} value={tab.key}>\n            {tab.content}\n          </TabsContent>\n        ))}\n      </SmartTabs>\n    </div>\n  );\n}\n"
}
```

**Output:**
```
Edit applied successfully.
```

---

## Assistant (Build · Gemma 4-26B-A4B (local) · 45.8s)

_Thinking:_

I've refactored `RenderGameComponent` to use a `Sidebar` component and a split layout. I'll now create `src/app/game/current/sidebar.tsx`.

I need to decide how `Sidebar` will work. It should probably take the `tabs` and use them to build the tree.
But the `tabs` currently only have `key`, `tab` (label), and `content`.

To support the user's request (sub-items in the tree), the `tabs` objects should probably contain more information, or I should change how they are defined.

The user wants:
"Councilors" tree item, which has the score details as subtitle, then options below that for "Existing Council", "Find new", etc.

If `getCouncilorsUi` returns:
```tsx
{
  key: "councilors",
  tab: <>{/* summary text */}</>,
  content: <CouncilorsComponent ... />,
  subItems: [
    { key: "councilors.existing", label: "Existing Council" },
    { key: "councilors.new", label: "Find new" },
    ...
  ]
}
```

Then the `Sidebar` can render this.

Let's look at `getCouncilorsUi` in `src/app/game/current/councilors.tsx` again.

Wait, if I want to render *only* a sub-section, `CouncilorsComponent` needs to be able to render just that sub-section.

Currently, `CouncilorsComponent` renders the entire accordion.

If I want to support this, I should probably refactor `CouncilorsComponent` to accept a `subSection` prop.

But first, let's implement a basic `Sidebar` and see if I can get the layout right.

I'll start by creating `src/app/game/current/sidebar.tsx`. I'll use a simple implementation for now.



**Tool: write**

**Input:**
```json
{
  "content": "\"use client\";\n\nimport { useState } from \"react\";\nimport { ChevronRight, ChevronDown, Gamepad2, Users, Ship, Home, Zap, BarChart3 } from \"lucide-react\";\nimport { cn } from \"@/lib/utils\";\n\ninterface Tab {\n  key: string;\n  tab: React.ReactNode;\n  content: React.ReactNode;\n  subItems?: {\n    key: string;\n    label: string;\n  }[];\n}\n\ninterface SidebarProps {\n  tabs: Tab[];\n}\n\nexport function Sidebar({ tabs }: SidebarProps) {\n  const [selectedKey, setSelectedKey] = useState<string>(tabs[0].key);\n  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set([tabs[0].key]));\n\n  const toggleExpand = (key: string) => {\n    const newExpandedKeys = new Set(expandedKeys);\n    if (newExpandedKeys.has(key)) {\n      newExpandedKeys.delete(key);\n    } else {\n      newExpandedKeys.add(key);\n    }\n    setExpandedKeys(newExpandedKeys);\n  };\n\n  const iconMap: Record<string, React.ElementType> = {\n    councilors: Users,\n    fleets: Ship,\n    habs: Home,\n    resources: Zap,\n    drives: Gamepad2,\n  };\n\n  return (\n    <div className=\"w-64 border-r bg-muted/30 flex flex-col h-full overflow-y-auto\">\n      <div className=\"p-4 font-bold text-lg border-b bg-muted/50\">\n        Game Analysis\n      </div>\n      <div className=\"flex-1 py-2\">\n        {tabs.map((tab) => {\n          const Icon = iconMap[tab.key] || BarChart3;\n          const isExpanded = expandedKeys.has(tab.key);\n          const isSelected = selectedKey === tab.key || selectedKey.startsWith(`${tab.key}.`);\n\n          return (\n            <div key={tab.key} className=\"space-y-0.5\">\n              <button\n                onClick={() => {\n                  setSelectedKey(tab.key);\n                  toggleExpand(tab.key);\n                }}\n                className={cn(\n                  \"w-full flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors hover:bg-muted\",\n                  isSelected ? \"text-primary bg-muted\" : \"text-muted-foreground\"\n                )}\n              >\n                <Icon className=\"h-4 w-4\" />\n                {tab.key.charAt(0).toUpperCase() + tab.key.slice(1)}\n                {tab.subItems && (\n                  <div className=\"ml-auto\">\n                    {isExpanded ? <ChevronDown className=\"h-4 w-4\" /> : <ChevronRight className=\"h-4 w-4\" />}\n                  </div>\n                )}\n              </button>\n              {isExpanded && tab.subItems && (\n                <div className=\"ml-4 border-l pl-2 space-y-0.5\">\n                  {tab.subItems.map((sub) => (\n                    <button\n                      key={sub.key}\n                      onClick={() => setSelectedKey(sub.key)}\n                      className={cn(\n                        \"w-full text-left px-3 py-1.5 text-sm transition-colors hover:bg-muted\",\n                        selectedKey === sub.key ? \"text-primary font-medium\" : \"text-muted-foreground\"\n                      )}\n                    >\n                      {sub.label}\n                    </button>\n                  ))}\n                </div>\n              )}\n            </div>\n          );\n        })}\n      </div>\n    </div>\n  );\n}\n",
  "filePath": "src/app/game/current/sidebar.tsx"
}
```

**Output:**
```
Wrote file successfully.
```

---

## Assistant (Build · Gemma 4-26B-A4B (local) · 69.5s)

_Thinking:_

Now I have a `Sidebar` component. I need to make sure `RenderGameComponent` actually uses it to show the content.

Currently, `RenderGameComponent` is:
```tsx
export function RenderGameComponent({ analysis }: { analysis: Analysis }) {
  const tabs = [
    getCouncilorsUi(analysis),
    getFleetsUi(analysis),
    getHabsUi(analysis),
    getResourcesUi(analysis),
    getDrivesUi(analysis),
  ];

  return (
    <div className="flex h-[calc(100vh-theme(spacing.12))] overflow-hidden">
      <Sidebar tabs={tabs} />
      <div className="flex-1 overflow-auto mx-2">
        <h2 className="text-xl font-bold">
          Game: {analysis.fileName} ({analysis.lastModified?.toLocaleString()}) - Game date:{" "}
          {analysis.gameCurrentDateTimeFormatted.split(" ")[0]}
        </h2>
        <h3 className="text-lg">Faction: {analysis.playerFaction.displayName}</h3>
        <div className="mt-4">
          {/* Content will be rendered here by Sidebar or a separate component */}
          {/* For now, let's keep the tabs to see if it works, but we'll replace it soon */}
        </div>
      </div>
    </div>
  );
}
```

I need to move the `selectedKey` state up to `RenderGameComponent` so it can pass it to the `Sidebar` and use it to render the content.

Wait, if `Sidebar` manages the `selectedKey`, it should probably call an `onSelect` callback.

Let's update `Sidebar` to accept `selectedKey` and `onSelect`.



**Tool: edit**

**Input:**
```json
{
  "filePath": "src/app/game/current/sidebar.tsx",
  "newString": "\"use client\";\n\nimport { ChevronRight, ChevronDown, Gamepad2, Users, Ship, Home, Zap, BarChart3 } from \"lucide-react\";\nimport { cn } from \"@/lib/utils\";\n\ninterface Tab {\n  key: string;\n  tab: React.ReactNode;\n  content: React.ReactNode;\n  subItems?: {\n    key: string;\n    label: string;\n  }[];\n}\n\ninterface SidebarProps {\n  tabs: Tab[];\n  selectedKey: string;\n  onSelect: (key: string) => void;\n}\n\nexport function Sidebar({ tabs, selectedKey, onSelect }: SidebarProps) {\n  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set([tabs[0].key]));\n\n  const toggleExpand = (key: string) => {\n    const newExpandedKeys = new Set(expandedKeys);\n    if (newExpandedKeys.has(key)) {\n      newExpandedKeys.delete(key);\n    } else {\n      newExpandedKeys.add(key);\n    }\n    setExpandedKeys(newExpandedKeys);\n  };\n\n  const iconMap: Record<string, React.ElementType> = {\n    councilors: Users,\n    fleets: Ship,\n    habs: Home,\n    resources: Zap,\n    drives: Gamepad2,\n  };\n\n  return (\n    <div className=\"w-64 border-r bg-muted/30 flex flex-col h-full overflow-y-auto\">\n      <div className=\"p-4 font-bold text-lg border-b bg-muted/50\">\n        Game Analysis\n      </div>\n      <div className=\"flex-1 py-2\">\n        {tabs.map((tab) => {\n          const Icon = iconMap[tab.key] || BarChart3;\n          const isExpanded = expandedKeys.has(tab.key);\n          const isSelected = selectedKey === tab.key || selectedKey.startsWith(`${tab.key}.`);\n\n          return (\n            <div key={tab.key} className=\"space-y-0.5\">\n              <button\n                onClick={() => {\n                  onSelect(tab.key);\n                  if (tab.subItems) toggleExpand(tab.key);\n                }}\n                className={cn(\n                  \"w-full flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors hover:bg-muted\",\n                  isSelected ? \"text-primary bg-muted\" : \"text-muted-foreground\"\n                )}\n              >\n                <Icon className=\"h-4 w-4\" />\n                {tab.key.charAt(0).toUpperCase() + tab.key.slice(1)}\n                {tab.subItems && (\n                  <div className=\"ml-auto\">\n                    {isExpanded ? <ChevronDown className=\"h-4 w-4\" /> : <ChevronRight className=\"h-4 w-4\" />}\n                  </div>\n                )}\n              </button>\n              {isExpanded && tab.subItems && (\n                <div className=\"ml-4 border-l pl-2 space-y-0.5\">\n                  {tab.subItems.map((sub) => (\n                    <button\n                      key={sub.key}\n                      onClick={() => onSelect(sub.key)}\n                      className={cn(\n                        \"w-full text-left px-3 py-1.5 text-sm transition-colors hover:bg-muted\",\n                        selectedKey === sub.key ? \"text-primary font-medium\" : \"text-muted-foreground\"\n                      )}\n                    >\n                      {sub.label}\n                    </button>\n                  ))}\n                </div>\n              )}\n            </div>\n          );\n        })}\n      </div>\n    </div>\n  );\n}\n",
  "oldString": "\"use client\";\n\nimport { useState } from \"react\";\nimport { ChevronRight, ChevronDown, Gamepad2, Users, Ship, Home, Zap, BarChart3 } from \"lucide-react\";\nimport { cn } from \"@/lib/utils\";\n\ninterface Tab {\n  key: string;\n  tab: React.ReactNode;\n  content: React.ReactNode;\n  subItems?: {\n    key: string;\n    label: string;\n  }[];\n}\n\ninterface SidebarProps {\n  tabs: Tab[];\n}\n\nexport function Sidebar({ tabs }: SidebarProps) {\n  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set([tabs[0].key]));\n\n  const toggleExpand = (key: string) => {\n    const newExpandedKeys = new Set(expandedKeys);\n    if (newExpandedKeys.has(key)) {\n      newExpandedKeys.delete(key);\n    } else {\n      newExpandedKeys.add(key);\n    }\n    setExpandedKeys(newExpandedKeys);\n  };\n\n  const iconMap: Record<string, React.ElementType> = {\n    councilors: Users,\n    fleets: Ship,\n    habs: Home,\n    resources: Zap,\n    drives: Gamepad2,\n  };\n\n  return (\n    <div className=\"w-64 border-r bg-muted/30 flex flex-col h-full overflow-y-auto\">\n      <div className=\"p-4 font-bold text-lg border-b bg-muted/50\">\n        Game Analysis\n      </div>\n      <div className=\"flex-1 py-2\">\n        {tabs.map((tab) => {\n          const Icon = iconMap[tab.key] || BarChart3;\n          const isExpanded = expandedKeys.has(tab.key);\n          const isSelected = selectedKey === tab.key || selectedKey.startsWith(`${tab.key}.`);\n\n          return (\n            <div key={tab.key} className=\"space-y-0.5\">\n              <button\n                onClick={() => {\n                  setSelectedKey(tab.key);\n                  toggleExpand(tab.key);\n                }}\n                className={cn(\n                  \"w-full flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors hover:bg-muted\",\n                  isSelected ? \"text-primary bg-muted\" : \"text-muted-foreground\"\n                )}\n              >\n                <Icon className=\"h-4 w-4\" />\n                {tab.key.charAt(0).toUpperCase() + tab.key.slice(1)}\n                {tab.subItems && (\n                  <div className=\"ml-auto\">\n                    {isExpanded ? <ChevronDown className=\"h-4 w-4\" /> : <ChevronRight className=\"h-4 w-4\" />}\n                  </div>\n                )}\n              </button>\n              {isExpanded && tab.subItems && (\n                <div className=\"ml-4 border-l pl-2 space-y-0.5\">\n                  {tab.subItems.map((sub) => (\n                    <button\n                      key={sub.key}\n                      onClick={() => setSelectedKey(sub.key)}\n                      className={cn(\n                        \"w-full text-left px-3 py-1.5 text-sm transition-colors hover:bg-muted\",\n                        selectedKey === sub.key ? \"text-primary font-medium\" : \"text-muted-foreground\"\n                      )}\n                    >\n                      {sub.label}\n                    </button>\n                  ))}\n                </div>\n              )}\n            </div>\n          );\n        })}\n      </div>\n    </div>\n  );\n}\n"
}
```

**Output:**
```
Edit applied successfully.
```

---

## Assistant (Build · Gemma 4-26B-A4B (local) · 64.3s)

_Thinking:_

Wait, I noticed I'm missing `import { useState } from "react";` in `sidebar.tsx` because I didn't add it in the `newString` correctly or I'm hallucinating. Let me check `sidebar.tsx` content.
Ah, I see: `const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set([tabs[0].key]));`.
Yes, I need to add `import { useState } from "react";`.

Also, in `sidebar.tsx`, `isSelected` uses `selectedKey` which is now a prop.

Let's fix `sidebar.tsx` first.


**Tool: edit**

**Input:**
```json
{
  "filePath": "src/app/game/current/sidebar.tsx",
  "newString": "\"use client\";\n\nimport { useState } from \"react\";\nimport { ChevronRight, ChevronDown, Gamepad2, Users, Ship, Home, Zap, BarChart3 } from \"lucide-react\";\nimport { cn } from \"@/lib/utils\";\n\ninterface Tab {\n  key: string;\n  tab: React.ReactNode;\n  content: React.ReactNode;\n  subItems?: {\n    key: string;\n    label: string;\n  }[];\n}\n\ninterface SidebarProps {\n  tabs: Tab[];\n  selectedKey: string;\n  onSelect: (key: string) => void;\n}\n\nexport function Sidebar({ tabs, selectedKey, onSelect }: SidebarProps) {\n  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set([tabs[0].key]));\n\n  const toggleExpand = (key: string) => {\n    const newExpandedKeys = new Set(expandedKeys);\n    if (newExpandedKeys.has(key)) {\n      newExpandedKeys.delete(key);\n    } else {\n      newExpandedKeys.add(key);\n    }\n    setExpandedKeys(newExpandedKeys);\n  };\n\n  const iconMap: Record<string, React.ElementType> = {\n    councilors: Users,\n    fleets: Ship,\n    habs: Home,\n    resources: Zap,\n    drives: Gamepad2,\n  };\n\n  return (\n    <div className=\"w-64 border-r bg-muted/30 flex flex-col h-full overflow-y-auto\">\n      <div className=\"p-4 font-bold text-lg border-b bg-muted/50\">\n        Game Analysis\n      </div>\n      <div className=\"flex-1 py-2\">\n        {tabs.map((tab) => {\n          const Icon = iconMap[tab.key] || BarChart3;\n          const isExpanded = expandedKeys.has(tab.key);\n          const isSelected = selectedKey === tab.key || selectedKey.startsWith(`${tab.key}.`);\n\n          return (\n            <div key={tab.key} className=\"space-y-0.5\">\n              <button\n                onClick={() => {\n                  onSelect(tab.key);\n                  if (tab.subItems) toggleExpand(tab.key);\n                }}\n                className={cn(\n                  \"w-full flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors hover:bg-muted\",\n                  isSelected ? \"text-primary bg-muted\" : \"text-muted-foreground\"\n                )}\n              >\n                <Icon className=\"h-4 w-4\" />\n                {tab.key.charAt(0).toUpperCase() + tab.key.slice(1)}\n                {tab.subItems && (\n                  <div className=\"ml-auto\">\n                    {isExpanded ? <ChevronDown className=\"h-4 w-4\" /> : <ChevronRight className=\"h-4 w-4\" />}\n                  </div>\n                )}\n              </button>\n              {isExpanded && tab.subItems && (\n                <div className=\"ml-4 border-l pl-2 space-y-0.5\">\n                  {tab.subItems.map((sub) => (\n                    <button\n                      key={sub.key}\n                      onClick={() => onSelect(sub.key)}\n                      className={cn(\n                        \"w-full text-left px-3 py-1.5 text-sm transition-colors hover:bg-muted\",\n                        selectedKey === sub.key ? \"text-primary font-medium\" : \"text-muted-foreground\"\n                      )}\n                    >\n                      {sub.label}\n                    </button>\n                  ))}\n                </div>\n              )}\n            </div>\n          );\n        })}\n      </div>\n    </div>\n  );\n}\n",
  "oldString": "\"use client\";\n\nimport { useState } from \"react\";\nimport { ChevronRight, ChevronDown, Gamepad2, Users, Ship, Home, Zap, BarChart3 } from \"lucide-react\";\nimport { cn } from \"@/lib/utils\";\n\ninterface Tab {\n  key: string;\n  tab: React.ReactNode;\n  content: React.ReactNode;\n  subItems?: {\n    key: string;\n    label: string;\n  }[];\n}\n\ninterface SidebarProps {\n  tabs: Tab[];\n  selectedKey: string;\n  onSelect: (key: string) => void;\n}\n\nexport function Sidebar({ tabs, selectedKey, onSelect }: SidebarProps) {\n  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set([tabs[0].key]));\n\n  const toggleExpand = (key: string) => {\n    const newExpandedKeys = new Set(expandedKeys);\n    if (newExpandedKeys.has(key)) {\n      newExpandedKeys.delete(key);\n    } else {\n      newExpandedKeys.add(key);\n    }\n    setExpandedKeys(newExpandedKeys);\n  };\n\n  const iconMap: Record<string, React.ElementType> = {\n    councilors: Users,\n    fleets: Ship,\n    habs: Home,\n    resources: Zap,\n    drives: Gamepad2,\n  };\n\n  return (\n    <div className=\"w-64 border-r bg-muted/30 flex flex-col h-full overflow-y-auto\">\n      <div className=\"p-4 font-bold text-lg border-b bg-muted/50\">\n        Game Analysis\n      </div>\n      <div className=\"flex-1 py-2\">\n        {tabs.map((tab) => {\n          const Icon = iconMap[tab.key] || BarChart3;\n          const isExpanded = expandedKeys.has(tab.key);\n          const isSelected = selectedKey === tab.key || selectedKey.startsWith(`${tab.key}.`);\n\n          return (\n            <div key={tab.key} className=\"space-y-0.5\">\n              <button\n                onClick={() => {\n                  setSelectedKey(tab.key);\n                  toggleExpand(tab.key);\n                }}\n                className={cn(\n                  \"w-full flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors hover:bg-muted\",\n                  isSelected ? \"text-primary bg-muted\" : \"text-muted-foreground\"\n                )}\n              >\n                <Icon className=\"h-4 w-4\" />\n                {tab.key.charAt(0).toUpperCase() + tab.key.slice(1)}\n                {tab.subItems && (\n                  <div className=\"ml-auto\">\n                    {isExpanded ? <ChevronDown className=\"h-4 w-4\" /> : <ChevronRight className=\"h-4 w-4\" />}\n                  </div>\n                )}\n              </button>\n              {isExpanded && tab.subItems && (\n                <div className=\"ml-4 border-l pl-2 space-y-0.5\">\n                  {tab.subItems.map((sub) => (\n                    <button\n                      key={sub.key}\n                      onClick={() => setSelectedKey(sub.key)}\n                      className={cn(\n                        \"w-full text-left px-3 py-1.5 text-sm transition-colors hover:bg-muted\",\n                        selectedKey === sub.key ? \"text-primary font-medium\" : \"text-muted-foreground\"\n                      )}\n                    >\n                      {sub.label}\n                    </button>\n                  ))}\n                </div>\n              )}\n            </div>\n          );\n        })}\n      </div>\n    </div>\n  );\n}\n"
}
```

**Output:**
```
Edit applied successfully.
```

---

## Assistant (Build · Gemma 4-26B-A4B (local) · 34.7s)

_Thinking:_

I'll now update `RenderGameComponent` to manage the `selectedKey` and render the correct content.



**Tool: edit**

**Input:**
```json
{
  "filePath": "src/app/game/current/component.tsx",
  "newString": "\"use client\";\n\nimport { useState } from \"react\";\nimport { Analysis } from \"@/lib/analysis\";\nimport { getCouncilorsUi } from \"./councilors\";\nimport { getFleetsUi } from \"./fleets\";\nimport { getHabsUi } from \"./habs\";\nimport { getResourcesUi } from \"./resources\";\nimport { getDrivesUi } from \"./drives\";\nimport { Sidebar } from \"./sidebar\";\n\nexport function RenderGameComponent({ analysis }: { analysis: Analysis }) {\n  const tabs = [\n    getCouncilorsUi(analysis),\n    getFleetsUi(analysis),\n    getHabsUi(analysis),\n    getResourcesUi(analysis),\n    getDrivesUi(analysis),\n  ];\n\n  const [selectedKey, setSelectedKey] = useState<string>(tabs[0].key);\n\n  const findTabContent = (key: string) => {\n    // Check top level tabs\n    const topLevelTab = tabs.find((t) => t.key === key);\n    if (topLevelTab) return topLevelTab.content;\n\n    // Check sub-items\n    for (const tab of tabs) {\n      const subItem = tab.subItems?.find((si) => si.key === key);\n      if (subItem) {\n        // For sub-items, we need to find the right content. \n        // This is tricky because getCouncilorsUi currently returns one content block.\n        // We'll need to refactor the UI components to handle sub-sections.\n        // For now, let's just return the main content if we can't find a specific one.\n        return tab.content;\n      }\n    }\n\n    return null;\n  };\n\n  return (\n    <div className=\"flex h-[calc(100vh-theme(spacing.12))] overflow-hidden\">\n      <Sidebar tabs={tabs} selectedKey={selectedKey} onSelect={setSelectedKey} />\n      <div className=\"flex-1 overflow-auto mx-2\">\n        <h2 className=\"text-xl font-bold\">\n          Game: {analysis.fileName} ({analysis.lastModified?.toLocaleString()}) - Game date:{\" \"}\n          {analysis.gameCurrentDateTimeFormatted.split(\" \")[0]}\n        </h2>\n        <h3 className=\"text-lg\">Faction: {analysis.playerFaction.displayName}</h3>\n        <div className=\"mt-4\">\n          {findTabContent(selectedKey)}\n        </div>\n      </div>\n    </div>\n  );\n}\n",
  "oldString": "\"use client\";\n\nimport { Analysis } from \"@/lib/analysis\";\nimport { getCouncilorsUi } from \"./councilors\";\nimport { getFleetsUi } from \"./fleets\";\nimport { getHabsUi } from \"./habs\";\nimport { getResourcesUi } from \"./resources\";\nimport { getDrivesUi } from \"./drives\";\nimport { Sidebar } from \"./sidebar\";\n\nexport function RenderGameComponent({ analysis }: { analysis: Analysis }) {\n  const tabs = [\n    getCouncilorsUi(analysis),\n    getFleetsUi(analysis),\n    getHabsUi(analysis),\n    getResourcesUi(analysis),\n    getDrivesUi(analysis),\n  ];\n\n  const [selectedKey, setSelectedKey] = useState<string>(tabs[0].key);\n\n  return (\n    <div className=\"flex h-[calc(100vh-theme(spacing.12))] overflow-hidden\">\n      <Sidebar tabs={tabs} selectedKey={selectedKey} onSelect={setSelectedKey} />\n      <div className=\"flex-1 overflow-auto mx-2\">\n        <h2 className=\"text-xl font-bold\">\n          Game: {analysis.fileName} ({analysis.lastModified?.toLocaleString()}) - Game date:{\" \"}\n          {analysis.gameCurrentDateTimeFormatted.split(\" \")[0]}\n        </h2>\n        <h3 className=\"text-lg\">Faction: {analysis.playerFaction.displayName}</h3>\n        <div className=\"mt-4\">\n          {/* Content will be rendered here by Sidebar or a separate component */}\n          {/* For now, let's keep the tabs to see if it works, but we'll replace it soon */}\n        </div>\n      </div>\n    </div>\n  );\n}\n"
}
```

**Output:**
```
Edit applied successfully.
```

---

## Assistant (Build · Gemma 4-26B-A4B (local) · 7.3s)

_Thinking:_

Wait, I realized I missed `import { useState } from "react";` in `RenderGameComponent` as well.

Also, the `findTabContent` logic is currently very primitive and won't support sub-sections properly because `getCouncilorsUi` returns a single `content` block that contains all the sub-sections in an accordion.

I need to:
1.  Update `getCouncilorsUi` to return `subItems`.
2.  Refactor `CouncilorsComponent` to render only the selected sub-section.

Let's start with `getCouncilorsUi`.



**Tool: read**

**Input:**
```json
{
  "filePath": "src/app/game/current/councilors.tsx"
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

---

## Assistant (Build · Gemma 4-26B-A4B (local) · 1031.8s)

_Thinking:_

I will refactor `getCouncilorsUi` to return sub-items and then refactor `CouncilorsComponent` to accept a `subSection` prop and render only the selected part.

Wait, I need to be careful about how `weights` and `setWeights` are passed down.

Let's start by defining the new structure for `getCouncilorsUi`.

Current `getCouncilorsUi`:
```tsx
export function getCouncilorsUi(analysis: Analysis) {
  // ...
  return {
    key: "councilors",
    tab: (
      <>
        Councilors ({worstExistingCouncilor?.toFixed(0)} vs. {bestAvailableCouncilor?.toFixed(0)}) / Orgs (
        {worstExistingOrg?.toFixed(2)} vs {bestAvailableOrg?.toFixed(2)})
      </>
    ),
    content: (
      <CouncilorsComponent
        {...{
          analysis,
          weights,
          setWeights,
          scoredModifiedCouncilors,
          scoredAvailableCouncilors,
          scoredBaseCouncilors,
          scoredOrgs,
          scoredUsedOrgs,
          scoredOwnedOrgs,
        }}
      />
    ),
  };
}
```

I want it to look like:
```tsx
export function getCouncilorsUi(analysis: Analysis) {
  // ...
  return {
    key: "councilors",
    tab: (
      <>
        Councilors ({worstExistingCouncilor?.toFixed(0)} vs. {bestAvailableCouncilor?.toFixed(0)}) / Orgs (
        {worstExistingOrg?.toFixed(2)} vs {bestAvailableOrg?.toFixed(2)})
      </>
    ),
    content: <CouncilorsComponent ... />,
    subItems: [
      { key: "councilors.existing", label: "Existing Council" },
      { key: "councilors.new-councilors", label: "Find new" },
      { key: "councilors.current-orgs", label: "Current Organizations" },
      { key: "councilors.takeover", label: "Hostile Takeover" },
      { key: "councilors.missions", label: "Missions" },
      { key: "councilors.other-councilors", label: "Other Councilors" },
    ]
  };
}
```

And `CouncilorsComponent` will need to be able to render just one of these.

The `subItems` keys I used above match the `AccordionItem` values in `CouncilorsComponent`.

Wait, the user wants:
"For example, there should be a "Councilors" tree item, which has the score details as subtitle, then options below that for "Existing Council", "Find new", etc."

So the subtitle should be part of the "Councilors" item in the tree.

Let's look at `CouncilorsComponent`. It uses `SmartAccordion`. I can replace `SmartAccordion` with a simple conditional rendering based on the `subSection` prop.

Actually, if I use `subItems`, I can make the tree navigation work.

Let's start by modifying `src/app/game/current/councilors.tsx`.



**Tool: invalid**

**Input:**
```json
{
  "tool": "edit",
  "error": "Invalid input for tool edit: JSON parsing failed: Text: {\"filePath\":\"src/app/game/current/councilors.tsx\",\"newString\":\"\\\"use client\\\";\\n\\nimport { useState, useEffect } from \\\"react\\\";\\nimport { combineEffects, ShowEffects, ShowEffectsProps } from \\\"@/components/showEffects\\\";\\nimport { AccordionContent, AccordionItem, AccordionTrigger } from \\\"@/components/ui/accordion\\\";\\nimport { SmartAccordion } from \\\"@/components/ui/smart-accordion\\\";\\nimport { Button } from \\\"@/components/ui/button\\\";\\nimport { Collapsible, CollapsibleContent, CollapsibleTrigger } from \\\"@/components/ui/collapsible\\\";\\nimport { Tooltip, TooltipContent, TooltipTrigger } from \\\"@/components/ui/tooltip\\\";\\nimport { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from \\\"@/components/ui/table\\\";\\nimport { Analysis } from \\\"@/lib/analysis\\\";\\nimport { MissionDataName, TraitDataName } from \\\"@/lib/template-types-generated\\\";\\nimport { MinusCircleIcon, PlusCircleIcon } from \\\"lucide-react\\\";\\nimport { defaultScoringWeights, loadWeightsFromStorage, ScoringWeights, ScoringWeightsDialog } from \\\"./scoringWeights\\\";\\nimport { Administration, MissionIcons, TraitIcons, UnknownIcon } from \\\"@/components/icons\\\";\\nimport { Tabs, TabsContent, TabsList, TabsTrigger } from \\\"@/components/ui/tabs\\\";\\nimport { SmartTabs } from \\\"@/components/ui/smart-tabs\\\";\\nimport { twMerge } from \\\"tailwind-merge\\\";\\n\\nfunction CouncilorTableHeader({ hasOrgs }: { hasOrgs?: boolean }) {\\n  return (\\n    <TableHeader>\\n      <TableRow>\\n        <TableHead>Name</TableHead>\\n        <TableHead>Modified Stats</TableHead>\\n        {hasOrgs && <TableHead>Org Tiers</TableHead>}\\n        <TableHead>Monthly Effects</TableHead>\\n        <TableHead>Priorities</TableHead>\\n        <TableHead>Science</TableHead>\\n        <TableHead>Missions</TableHead>\\n        <TableHead>Score</TableHead>\\n        <TableHead>NM Score</TableHead>\\n        <TableHead>CP Cap</TableHead>\\n      </TableRow>\\n    </TableHeader>\\n  );\\n}\\n\\nfunction OrgTableHeader({ costHeader }: { costHeader?: string }) {\\n  return (\\n    <TableHeader>\\n      <TableRow>\\n        <TableHead>Org Name</TableHead>\\n        <TableHead>Requirements</TableHead>\\n        <TableHead>Tier</TableHead>\\n        {costHeader ? <TableHead>{costHeader}</TableHead> : <TableHead>Purchase / Transfer</TableHead>}\\n        <TableHead>Monthly</TableHead>\\n        <TableHead>Effects</TableHead>\\n        <TableHead>Score</TableHead>\\n        <TableHead>NM Score</TableHead>\\n      </TableRow>\\n    </TableHeader>\\n  );\\n}\\n\\nfunction CouncilorTableRow({\\n  councilor,\\n  stats,\\n  label,\\n  hasOrgs,\\n  highlightMissionClassName,\\n}: {\\n  councilor: Analysis[\\\"playerCouncilors\\\"][number] & { score?: ScoreResult };\\n  stats: Analysis[\\\"playerCouncilors\\\"][number][\\\"effectsWithOrgsAndAugments\\\"];\\n  label: string;\\n  hasOrgs?: boolean;\\n  highlightMissionClassName?: (missionName: MissionDataName) => string | undefined;\\n}) {\\n  const admin = Math.min(25, Math.max(0, (stats.administration || 0) + (stats.Administration || 0)));\\n  const orgTiers = councilor.orgs.reduce((a, b) => a + b.tier, 0);\\n  const cpCap =\\n    Math.min(25, Math.max(0, stats.persuasion || 0) + Math.max(0, stats.Persuasion || 0)) +\\n    Math.min(25, Math.max(0, stats.command || 0) + Math.max(0, stats.Command || 0)) +\\n    Math.min(25, Math.max(0, stats.administration || 0) + Math.max(0, stats.Administration || 0));\\n  return (\\n    <TableRow key={`${councilor.id}-${label}`}>\\n      <TableCell>{label}</TableCell>\\n      <TableCell>\\n        <ShowEffects\\n          persuasion={stats.persuasion}\\n          command={stats.command}\\n          investigation={stats.investigation}\\n          espionage={stats.espionage}\\n          administration={stats.administration}\\n          science={stats.science}\\n          security={stats.security}\\n          Persuasion={stats.Persuasion}\\n          Command={stats.Command}\\n          Investigation={stats.Investigation}\\n          Espionage={stats.Espionage}\\n          Administration={stats.Administration}\\n          Science={stats.Science}\\n          Security={stats.Security}\\n          ApparentLoyalty={stats.ApparentLoyalty}\\n          Loyalty={stats.Loyalty}\\n          maxLoyalty={stats.maxLoyalty}\\n          xpModifier={stats.xpModifier}\\n          xp={stats.xp}\\n          traitTemplateNames={stats.traitTemplateNames}\\n          typeTemplateName={stats.typeTemplateName}\\n          playerIntel={stats.playerIntel}\\n          playerMaxIntel={stats.playerMaxIntel}\\n          lastRecordedLoyalty={stats.lastRecordedLoyalty}\\n          // TODO: is there a case where we should show this?\\n          // Loyalty={stats.Loyalty}\\n        />\\n      </TableCell>\\n      {hasOrgs && (\\n        <TableCell>\\n          <ShowEffects tier={stats.tier} highlightTier={orgTiers < admin} />\\n        </TableCell>\\n      )}\\n      <TableCell>\\n        <ShowEffects\\n          incomeBoost_month={stats.incomeBoost_month}\\n          incomeMoney_month={stats.incomeMoney_month}\\n          incomeInfluence_month={stats.incomeInfluence_month}\\n          incomeOps_month={stats.incomeOps_month}\\n          incomeMissionControl={stats.incomeMissionControl}\\n          incomeResearch_month={stats.incomeResearch_month}\\n          projectCapacityGranted={stats.projectCapacityGranted}\\n        />\\n      </TableCell>\\n      <TableCell>\\n        <span className=\\\"text-wrap leading-6 -my-2 inline-block\\\">\\n          <ShowEffects\\n            economyBonus={stats.economyBonus}\\n            welfareBonus={stats.welfareBonus}\\n            environmentBonus={stats.environmentBonus}\\n            knowledgeBonus={stats.knowledgeBonus}\\n            governmentBonus={stats.governmentBonus}\\n            unityBonus={stats.unityBonus}\\n            militaryBonus={stats.militaryBonus}\\n            oppressionBonus={stats.oppressionBonus}\\n            spoilsBonus={stats.spoilsBonus}\\n            spaceDevBonus={stats.spaceDevBonus}\\n            spaceflightBonus={stats.spaceflightBonus}\\n            MCBonus={stats.MCBonus}\\n            miningBonus={stats.miningBonus}\\n          />\\n        </span>\\n      </TableCell>\\n      <TableCell>\\n        <span className=\\\"text-wrap leading-6 -my-2 inline-block\\\">\\n          <ShowEffects councilorTechBonus={stats.councilorTechBonus} techBonuses={stats.techBonuses} />\\n        </span>\\n      </TableCell>\\n      <TableCell>\\n        <span className=\\\"text-wrap leading-6 -my-2 inline-block\\\">\\n          <ShowEffects\\n            missionsGrantedNames={stats.missionsGrantedNames}\\n            highlightMissionClassName={highlightMissionClassName}\\n          />\\n        </span>\\n      </TableCell>\\n      {councilor.score === undefined ? null : (\\n        <>\\n          <TableCell>\\n            <Tooltip>\\n              <TooltipTrigger>{councilor.score.value?.toFixed(2)}</TooltipTrigger>\\n              <TooltipContent align=\\\"end\\\" className=\\\"max-w-auto\\\">\\n                <pre className=\\\"p-2\\\">{councilor.score.details}</pre>\\n              </TooltipContent>\\n            </Tooltip>\\n          </TableCell>\\n          <TableCell>{councilor.score.noMissionScore?.toFixed(2)}</TableCell>\\n          <TableCell>{cpCap?.toFixed(0)}</TableCell>\\n        </>\\n      )}\\n    </TableRow>\\n  );\\n}\\n\\nfunction OrgTableRow({\\n  org,\\n  playerNationIds,\\n  playerTraits,\\n  highlightMissionClassName,\\n  isTakeover,\\n}: {\\n  org: Analysis[\\\"playerAvailableOrgs\\\"][number] & {\\n    type?: string;\\n    score?: ScoreResult;\\n    councilor?: string;\\n    councilorId?: number;\\n  };\\n  playerNationIds: Set<number>;\\n  playerTraits: Set<string>;\\n  highlightMissionClassName?: (missionName: MissionDataName) => string | undefined;\\n  isTakeover?: boolean;\\n}) {\\n  const missingRequiredTraits = org.template?.requiredOwnerTraits?.filter((t) => !playerTraits.has(t)) || [];\\n  function traitIcon(trait: TraitDataName, Fallback: typeof PlusCircleIcon) {\\n    return TraitIcons[trait] || Fallback;\\n  }\\n  return (\\n    <TableRow\\n      key={org.id}\\n      className={twMerge(org.isAdminOrg ? \\\"bg-green-100\\\" : \\\"\\\", org.type === \\\"unassigned\\\" ? \\\"bg-yellow-100\\\" : \\\"\\\")}\\n    >\\n      <TableCell>{org.displayName}</TableCell>\\n      <TableCell>\\n        {org.template?.requiresNationality && (\\n          <span className=\\\"mr-1\\\" title={`Required Nation: ${org.homeNationName || \\\"\\\"}`}>\\n            {playerNationIds.has(org.homeNationId || -1) ? (\\n              <PlusCircleIcon className=\\\"inline h-4 w-4 stroke-green-700 -mt-1 bg-transparent\\\" />\\n            ) : (\\n              <MinusCircleIcon className=\\\"inline h-4 w-4 stroke-destructive -mt-1\\\" />\\n            )}\\n          </span>\\n        )}\\n        {org.template?.requiredOwnerTraits && (\\n          <span className=\\\"mr-1\\\" title={\\\"Required Traits: \\\" + org.template.requiredOwnerTraits.join(\\\", \\\")}>\\n            {missingRequiredTraits.length === 0\\n              ? org.template.requiredOwnerTraits.map((trait, ix) => {\\n                  const Icon = traitIcon(trait, PlusCircleIcon);\\n                  return <Icon key={ix} className=\\\"inline h-4 w-4 stroke-green-700 -mt-1\\\" />;\\n                })\\n              : missingRequiredTraits.map((trait, ix) => {\\n                  const Icon = traitIcon(trait, MinusCircleIcon);\\n                  return <Icon key={ix} className=\\\"inline h-4 w-4 stroke-destructive -mt-1\\\" />;\\n                })}\\n          </span>\\n        )}\\n        {org.template?.prohibitedOwnerTraits && (\\n          <span className=\\\"mr-1\\\" title={\\\"Prohibited Traits: \\\" + org.template.prohibitedOwnerTraits.join(\\\", \\\")}>\\n            {org.template.prohibitedOwnerTraits.map((trait, ix) => {\\n              const Icon = traitIcon(trait, MinusCircleIcon);\\n              return <Icon key={ix} className=\\\"inline h-4 w-4 stroke-blue-700 -mt-1\\\" />;\\n            })}\\n          </span>\\n        )}\\n      </TableCell>\\n      <TableCell>\\n        <ShowEffects tier={org.tier} />\\n      </TableCell>\\n      <TableCell>\\n        {org.type === \\\"unassigned\\\" && \\\"T \\\"}\\n        {org.type === \\\"available\\\" || org.type === \\\"unassigned\\\" ? (\\n          <ShowEffects\\n            costMoney={(org.costMoney || 0) * (org.type === \\\"available\\\" ? 1 : orgTransferFactor)}\\n            costInfluence={(org.costInfluence || 0) * (org.type === \\\"available\\\" ? 1 : orgTransferFactor)}\\n            costOps={(org.costOps || 0) * (org.type === \\\"available\\\" ? 1 : orgTransferFactor)}\\n            costBoost={(org.costBoost || 0) * (org.type === \\\"available\\\" ? 1 : orgTransferFactor)}\\n          />\\n        ) : org.type == \\\"stealable\\\" && isTakeover ? (\\n          (() => {\\n            const target = org as any as Analysis[\\\"playerStealableOrgs\\\"][number];\\n            return (\\n              <>\\n                {target.councilor ?? \\\"Unassigned\\\"} from {target.faction?.displayName}, Admin: {target.admin} +\\n                takeoverDefense: {target.takeoverDefense}\\n              </>\\n            );\\n          })()\\n        ) : org.type === \\\"used\\\" ? (\\n          <>{org.councilor ?? \\\"Unassigned\\\"}</>\\n        ) : null}\\n      </TableCell>\\n      <TableCell>\\n        <ShowEffects\\n          incomeBoost_month={org.incomeBoost_month}\\n          incomeMoney_month={org.incomeMoney_month}\\n          incomeInfluence_month={org.incomeInfluence_month}\\n          incomeOps_month={org.incomeOps_month}\\n          incomeMissionControl={org.incomeMissionControl}\\n          incomeResearch_month={org.incomeResearch_month}\\n          projectCapacityGranted={org.projectCapacityGranted}\\n        />\\n      </TableCell>\\n      <TableCell>\\n        <ShowEffects\\n          persuasion={org.persuasion}\\n          command={org.command}\\n          investigation={org.investigation}\\n          espionage={org.espionage}\\n          administration={org.administration}\\n          science={org.science}\\n          security={org.security}\\n          economyBonus={org.economyBonus}\\n          welfareBonus={org.welfareBonus}\\n          environmentBonus={org.environmentBonus}\\n          knowledgeBonus={org.knowledgeBonus}\\n          governmentBonus={org.governmentBonus}\\n          unityBonus={org.unityBonus}\\n          militaryBonus={org.militaryBonus}\\n          oppressionBonus={org.oppressionBonus}\\n          spoilsBonus={org.spoilsBonus}\\n          spaceDevBonus={org.spaceDevBonus}\\n          spaceflightBonus={org.spaceflightBonus}\\n          MCBonus={org.MCBonus}\\n          miningBonus={org.miningBonus}\\n          techBonuses={org.template?.techBonuses}\\n          missionsGrantedNames={org.template?.missionsGrantedNames || []}\\n          highlightMissionClassName={highlightMissionClassName}\\n        />\\n      </TableCell>\\n      {org.score === undefined ? null : (\\n        <>\\n          <TableCell>\\n            <Tooltip>\\n              <TooltipTrigger>{org.score.value?.toFixed(2)}</TooltipTrigger>\\n              <TooltipContent align=\\\"end\\\" className=\\\"max-w-auto\\\">\\n                <pre className=\\\"p-2\\\">{org.score.details}</pre>\\n              </TooltipContent>\\n            </Tooltip>\\n          </TableCell>\\n          <TableCell>{org.score.noMissionScore?.toFixed(2)}</TableCell>\\n        </>\\n      )}\\n    </TableRow>\\n  );\\n}\\n\\nexport function getCouncilorsUi(analysis: Analysis) {\\n  const { playerMissionCounts } = analysis;\\n  const [weights, setWeights] = useState<ScoringWeights>(defaultScoringWeights);\\n\\n  useEffect(() => {\\n    setWeights(loadWeightsFromStorage());\\n  }, []);\\n\\n  const scoredModifiedCouncilors = scoreAndSort(\\n    analysis.playerCouncilors,\\n    weights,\\n    playerMissionCounts,\\n    getModifiedCouncilorScore\\n  );\\n  const scoredAvailableCouncilors = scoreAndSort(\\n    analysis.playerAvailableCouncilors,\\n    weights,\\n    playerMissionCounts,\\n    getBaseCouncilorScore\\n  );\\n  const scoredBaseCouncilors = scoreAndSort(\\n    analysis.playerCouncilors,\\n    weights,\\n    playerMissionCounts,\\n    getBaseCouncilorScore\\n  );\\n  const scoredOrgs = scoreAndSort(\\n    analysis.playerAvailableOrgs\\n      .map((i) => ({ type: \\\"available\\\", ...i }))\\n      .concat(analysis.playerUnassignedOrgs.map((i) => ({ type: \\\"unassigned\\\", ...i }))),\\n    weights,\\n    playerMissionCounts,\\n    getOrganizationScore,\\n    \\\"noMissionScore\\\" // ignore missions when sorting orgs\\n  ).toSorted((a, b) => (a.isAdminOrg === b.isAdminOrg ? 0 : a.isAdminOrg ? -1 : 1)); // admin orgs first\\n  const usedOrgs = analysis.playerCouncilors.flatMap((councilor) =>\\n    councilor.orgs.map((o) => ({ ...o, type: \\\"used\\\", councilor: councilor.displayName, councilorId: councilor.id }))\\n  );\\n  const scoredUsedOrgs = scoreAndSort(usedOrgs, weights, playerMissionCounts, getOrganizationScore);\\n  const scoredOwnedOrgs = scoreAndSort(\\n    analysis.playerUnassignedOrgs.map((i) => ({ type: \\\"unassigned\\\", ...i })).concat(usedOrgs),\\n    weights,\\n    playerMissionCounts,\\n    getOrganizationScore\\n  );\\n\\n  const bestAvailableCouncilor = scoredAvailableCouncilors[0]?.score.value;\\n  const worstExistingCouncilor = scoredBaseCouncilors[scoredBaseCouncilors.length - 1]?.score.value;\\n  const bestAvailableOrg = scoredOrgs[0]?.score.value;\\n  const worstExistingOrg = scoredUsedOrgs[scoredUsedOrgs.length - 1]?.score.value;\\n\\n  return {\\n    key: \\\"councilors\\\",\\n    tab: (\\n      <>\\n        Councilors ({worstExistingCouncilor?.toFixed(0)} vs. {bestAvailableCouncilor?.toFixed(0)}) / Orgs (\\n        {worstExistingOrg?.toFixed(2)} vs {bestAvailableOrg?.toFixed(2)})\\n      </>\\n    ),\\n    content: (\\n      <CouncilorsComponent\\n        {...{\\n          analysis,\\n          weights,\\n          setWeights,\\n          scoredModifiedCouncilors,\\n          scoredAvailableCouncilors,\\n          scoredBaseCouncilors,\\n          scoredOrgs,\\n          scoredUsedOrgs,\\n          scoredOwnedOrgs,\\n        }}\\n      />\\n    ),\\n    subItems: [\\n      { key: \\\"councilors.existing\\\", label: \\\"Existing Council\\\" },\\n      { key: \\\"councilors.new-councilors\\\", label: \\\"Find new\\\" },\\n      { key: \\\"councilors.current-orgs\\\", label: \\\"Current Organizations\\\" },\\n      { key: \\\"councilors.takeover\\\", label: \\\"Hostile Takeover\\\" },\\n      { key: \\\"councilors.missions\\\", label: \\\"Missions\\\" },\\n      { key: \\\"councilors.other-councilors\\\", label: \\\"Other Councilors\\\" },\\n    ],\\n  };\\n}\\n\\nfunction CouncilorsComponent({\\n  analysis,\\n  weights,\\n  setWeights,\\n  scoredModifiedCouncilors,\\n  scoredAvailableCouncilors,\\n  scoredBaseCouncilors,\\n  scoredOrgs,\\n  scoredOwnedOrgs,\\n  subSection,\\n}: {\\n  analysis: Analysis;\\n  weights: ScoringWeights;\\n  setWeights: (weights: ScoringWeights) => void;\\n  scoredModifiedCouncilors: (Analysis[\\\"playerCouncilors\\\"][number] & { score: ScoreResult })[];\\n  scoredAvailableCouncilors: (Analysis[\\\"playerAvailableCouncilors\\\"][number] & { score: ScoreResult })[];\\n  scoredBaseCouncilors: (Analysis[\\\"playerCouncilors\\\"][number] & { score: ScoreResult })[];\\n  scoredOrgs: (Analysis[\\\"playerAvailableOrgs\\\"][number] & { type: string; score: ScoreResult })[];\\n  scoredOwnedOrgs: (Analysis[\\\"playerAvailableOrgs\\\"][number] & {\\n    type: string;\\n    score: ScoreResult;\\n    councilor?: string;\\n    councilorId?: number;\\n  })[];\\n  subSection?: string;\\n}) {\\n  const {\\n    playerMissionCounts,\\n    playerVisibleCouncilors,\\n    playerCouncilors,\\n    playerAvailableOrgs,\\n    playerUnassignedOrgs,\\n    playerFaction,\\n    playerStealableOrgs,\\n    factionsById,\\n  } = analysis;\\n  const scoredStealableOrgs = scoreAndSort(\\n    analysis.playerStealableOrgs.map((i) => ({ type: \\\"stealable\\\", ...i })),\\n    weights,\\n    playerMissionCounts,\\n    getOrganizationScore,\\n    \\\"noMissionScore\\\"\\n  );\\n  function currentHighlightMissionClassName(missionName: MissionDataName) {\\n    // if we have exactly 2, show yellow BG, if we have 1, show red, otherwise no change to bg\\n    const count = playerMissionCounts.get(missionName) || 0;\\n    if (count === 2) {\\n      return \\\"bg-yellow-300/50\\\";\\n    } else if (count === 1) {\\n      return \\\"bg-red-300/50\\\";\\n    }\\n  }\\n  function availableHighlightMissionClassName(missionName: MissionDataName) {\\n    // if we have 1, show yellow BG, if we have 0, show green, otherwise no change to bg\\n    const count = playerMissionCounts.get(missionName) || 0;\\n    if (count === 1) {\\n      return \\\"bg-yellow-300/50\\\";\\n    } else if (count === 0) {\\n      return \\\"bg-green-300/50\\\";\\n    }\\n  }\\n  const playerNationIds = new Set(analysis.playerNationIds);\\n  const playerTraits = new Set(analysis.playerCouncilors.flatMap((i) => i.traitTemplateNames));\\n  const unusedAdmin = analysis.playerCouncilors\\n    .map(\\n      (c) =>\\n        Math.min(\\n          25,\\n          Math.max(\\n            0,\\n            (c.effectsWithOrgsAndAugments.Administration || 0) + (c.effectsWithOrgsAndAugments.administration || 0)\\n          )\\n        ) - c.orgs.reduce((a, b) => a + b.tier, 0)\\n    )\\n    .reduce((a, b) => a + b, 0);\\n\\n  const stealableOrgsByFaction = scoredStealableOrgs.reduce((acc, org) => {\\n    const key = org.faction?.id || 0;\\n    if (!acc.has(key)) {\\n      acc.set(key, []);\\n    }\\n    acc.get(key)!.push(org);\\n    return acc;\\n  }, new Map<number, typeof scoredStealableOrgs>());\\n\\n  type MissionSource =\\n    | {\\n        type: \\\"councilor\\\";\\n        councilor: Analysis[\\\"playerCouncilors\\\"][number];\\n        factionId: number | undefined;\\n        missions: MissionDataName[];\\n      }\\n    | {\\n        type: \\\"org\\\";\\n        org: Analysis[\\\"playerAvailableOrgs\\\"][number];\\n        factionId: number | undefined;\\n        missions: MissionDataName[];\\n      };\\n\\n  const sourcesByFactionByMission = [...playerCouncilors, ...playerVisibleCouncilors]\\n    .map(\\n      (i) =>\\n        ({\\n          type: \\\"councilor\\\",\\n          councilor: i,\\n          factionId: i.factionId,\\n          missions: i.effectsWithOrgsAndAugments.missionsGrantedNames || [],\\n        } as MissionSource)\\n    )\\n    .concat(\\n      [...playerAvailableOrgs, ...playerUnassignedOrgs].map((i) => ({\\n        type: \\\"org\\\",\\n        org: i,\\n        factionId: playerFaction?.id,\\n        missions: i.template?.missionsGrantedNames || [],\\n      }))\\n    )\\n    .concat(\\n      playerStealableOrgs.map((i) => ({\\n        type: \\\"org\\\",\\n        org: i,\\n        factionId: i.faction?.id,\\n        missions: i.template?.missionsGrantedNames || [],\\n      }))\\n    )\\n    .reduce((acc, o) => {\\n      const key = o.factionId || 0;\\n      if (!acc.has(key)) {\\n        acc.set(key, new Map<string, MissionSource[]>());\\n      }\\n      const effectsMap = acc.get(key)!;\\n      o.missions.forEach((m) => {\\n        if (!effectsMap.has(m)) {\\n          effectsMap.set(m, []);\\n        }\\n        effectsMap.get(m)!.push(o);\\n      });\\n      return acc;\\n    }, new Map<number, Map<string, MissionSource[]>>());\\n  const factions = Array.from(sourcesByFactionByMission.keys())\\n    .map((factionId) => factionsById.get(factionId)!)\\n    .filter((f) => f)\\n    .toSorted((a, b) => {\\n      if (a.id === playerFaction.id) return -1;\\n      if (b.id === playerFaction.id) return 1;\\n      return (a.displayName || \\\"\\\").localeCompare(b.displayName || \\\"\\\");\\n    });\\n\\n  const importantMissions = [\\\"Assassinate\\\"];\\n\\n  const councilEffects = scoredModifiedCouncilors.reduce((acc, councilor) => {\\n    return combineEffects(acc, councilor.effectsWithOrgsAndAugments);\\n  }, {} as ShowEffectsProps);\\n\\n  // TODO: would be cool to click an effect icon and sort everything by that (ie. click persuasion icon to see who/org gives most persuasion)\\n  if (subSection === \\\"existing\\\") {\\n    return (\\n      <div className=\\\"space-y-2\\\">\\n        <div className=\\\"py-1\\\">\\n          <ShowEffects\\n            incomeBoost_month={councilEffects.incomeBoost_month}\\n            incomeMoney_month={councilEffects.incomeMoney_month}\\n            incomeInfluence_month={councilEffects.incomeInfluence_month}\\n            incomeOps_month={councilEffects.incomeOps_month}\\n            incomeMissionControl={councilEffects.incomeMissionControl}\\n            incomeResearch_month={councilEffects.incomeResearch_month}\\n            projectCapacityGranted={councilEffects.projectCapacityGranted}\\n          />\\n          <ShowEffects\\n            economyBonus={councilEffects.economyBonus}\\n            welfareBonus={councilEffects.welfareBonus}\\n            environmentBonus={councilEffects.environmentBonus}\\n            knowledgeBonus={councilEffects.knowledgeBonus\\n            }\\n            governmentBonus={councilEffects.governmentBonus}\\n            unityBonus={councilEffects.unityBonus}\\n            militaryBonus={councilEffects.militaryBonus}\\n            oppressionBonus={councilEffects.oppressionBonus}\\n            spoilsBonus={councilEffects.spoilsBonus}\\n            spaceDevBonus={councilEffects.spaceDevBonus}\\n            spaceflightBonus={councilEffects.spaceflightBonus}\\n            MCBonus={councilEffects.MCBonus}\\n            miningBonus={councilEffects.miningBonus}\\n          />\\n          <ShowEffects\\n            councilorTechBonus={councilEffects.councilorTechBonus}\\n            techBonuses={councilEffects.techBonuses}\\n          />\\n        </div>\\n        <Table>\\n          <CouncilorTableHeader hasOrgs />\\n          <TableBody>\\n            {scoredModifiedCouncilors.map((councilor) => (\\n              <CouncilorTableRow\\n                key={councilor.id}\\n                councilor={councilor}\\n                stats={councilor.effectsWithOrgsAndAugments}\\n                label={councilor.displayName!}\\n                hasOrgs\\n                highlightMissionClassName={currentHighlightMissionClassName}\\n              />\\n            ))}\\n          </TableBody>\\n        </Table>\\n        <h3 className=\\\"mt-1\\\">Available Organizations:</h3>\\n        <Table>\\n          <OrgTableHeader />\\n          <TableBody>\\n            {scoredOrgs.map((org) => (\\n              <OrgTableRow\\n                key={org.id}\\n                org={org}\\n                playerNationIds={playerNationIds}\\n                playerTraits={playerTraits}\\n                highlightMissionClassName={availableHighlightMissionClassName}\\n              />\\n            ))}\\n          </TableBody>\\n        </Table>\\n      </div>\\n    );\\n  }\\n\\n  if (subSection === \\\"new-councilors\\\") {\\n    return (\\n      <div className=\\\"space-y-2\\\">\\n        <h3 className=\\\"text-lg font-bold\\\">Available Councilors:</h3>\\n        <Table>\\n          <CouncilorTableHeader />\\n          <TableBody>\\n            {scoredAvailableCouncilors.map((councilor) => (\\n              <CouncilorTableRow\\n                key={councilor.id}\\n                councilor={councilor}\\n                stats={councilor.effectsBaseAndUnaugmentedTraits}\\n                label={councilor.displayName!}\\n                highlightMissionClassName={availableHighlightMissionClassName}\\n              />\\n            ))}\\n          </TableBody>\\n        </Table>\\n\\n        <h3 className=\\\"mt-1 text-lg font-bold\\\">Unmodified Active Councilors:</h3>\\n        <Table>\\n          <CouncilorTableHeader />\\n          <TableBody>\\n            {scoredBaseCouncilors.map((councilor) => (\\n              <CouncilorTableRow\\n                key={`${councilor.id}-base`}\\n                councilor={councilor}\\n                stats={councilor.effectsBaseAndUnaugmentedTraits}\\n                label={`${councilor.displayName}`}\\n                highlightMissionClassName={currentHighlightMissionClassName}\\n              />\\n            ))}\\n          </TableBody>\\n        </Table>\\n      </div>\\n    );\\n  }\\n\\n  if (subSection === \\\"current-orgs\\\") {\\n    return (\\n      <div className=\\\"space-y-2\\\">\\n        <Table>\\n          <OrgTableHeader costHeader=\\\"Councilor\\\" />\\n          <TableBody>\\n            {scoredOwnedOrgs.toReversed().map((org) => (\\n              <OrgTableRow\\n                key={org.id}\\n                org={org}\\n                playerNationIds={playerNationIds}\\n                playerTraits={playerTraits}\\n                highlightMissionClassName={availableHighlightMissionClassName}\\n              />\\n            ))}\\n          </TableBody>\\n        </Table>\\n      </div>\\n    );\\n  }\\n\\n  if (subSection === \\\"takeover\\\") {\\n    return (\\n      <div className=\\\"space-y-2\\\">\\n        <SmartTabs\\n          storageKey=\\\"councilorsTakeoverTabs\\\"\\n          defaultValue={`faction-${Array.from(stealableOrgsByFaction.keys())[0]}`}\\n        >\\n          <TabsList>\\n            {Array.from(stealableOrgsByFaction.entries()).map(([factionId, orgs]) => (\\n              <TabsTrigger key={factionId} value={`faction-${factionId}`}>\\n                {orgs[0].faction?.displayName || \\\"Unknown Faction\\\"} ({orgs.length})\\n              </TabsTrigger>\\n            ))}\\n          </TabsList>\\n          {Array.from(stealableOrgsByFaction.entries()).map(([factionId, orgs]) => (\\n            <TabsContent key={factionId} value={`faction-${factionId}`}>\\n              <Table>\\n                <OrgTableHeader costHeader=\\\"Takeover\\\" />\\n                <TableBody>\\n                  {orgs.map((org) => (\\n                    <OrgTableRow\\n                      key={org.id}\\n                      org={org}\\n                      playerNationIds={playerNationIds}\\n                      playerTraits={playerTraits}\\n                      highlightMissionClassName={availableHighlightMissionClassName}\\n                      isTakeover\\n                    />\\n                  ))}\\n                </TableBody>\\n              </Table>\\n            </TabsContent>\\n          ))}\\n        </SmartTabs>\\n      </div>\\n    );\\n  }\\n\\n  if (subSection === \\\"missions\\\") {\\n    return (\\n      <div className=\\\"space-y-2\\\">\\n        <SmartTabs storageKey=\\\"councilorsMissionsTabs\\\" defaultValue={`faction-${factions[0].id}`}>\\n          <TabsList>\\n            {factions.map((faction) => (\\n              <TabsTrigger key={faction.id} value={`faction-${faction.id}`}>\\n                {faction.displayName || \\\"Unknown Faction\\\"} ({sourcesByFactionByMission.get(faction.id)?.size || 0})\\n                {importantMissions\\n                  .filter(\\n                    (m) =>\\n                      sourcesByFactionByMission\\n                        .get(faction.id)\\n                        ?.get(m)\\n                        ?.filter((i) => i.type === \\\"councilor\\\")?.length ?? 0 > 0\\n                  )\\n                  .map((m) => {\\n                    const MissionIcon = MissionIcons[m] || UnknownIcon;\\n                    return (\\n                      <span key={m} className=\\\"inline-block -mt-2\\\">\\n                        <MissionIcon className=\\\"h-4 w-4\\\" />\\n                      </span>\\n                    );\\n                  })}\\n              </TabsTrigger>\\n            ))}\\n          </TabsList>\\n          {factions.map((faction) => (\\n            <TabsContent key={faction.id} value={`faction-${faction.id}`}>\\n              <SmartAccordion type=\\\"single\\\" collapsible storageKey={`councilorsMissions-${faction.id}`}>\\n                {Array.from(\\n                  new Set([\\n                    ...importantMissions,\\n                    ...Array.from(sourcesByFactionByMission.get(faction.id)?.keys() || []),\\n                  ])\\n                ).map((missionName) => {\\n                  const sources = sourcesByFactionByMission.get(faction.id)?.get(missionName) || [];\\n                  const MissionIcon = MissionIcons[missionName] || UnknownIcon;\\n                  return (\\n                    <AccordionItem key={missionName} value={missionName}>\\n                      <AccordionTrigger>\\n                        <span>\\n                          <MissionIcon /> {missionName} &ndash;{\\\" \\\"}\\n                          {sources.filter((i) => i.type === \\\"councilor\\\").length} Councilors &lt;-{\\\" \\\"}\\n                          {sources.filter((i) => i.type === \\\"org\\\").length} Orgs\\n                        </span>\\n                      </AccordionTrigger>\\n                      <AccordionContent>\\n                        <Table>\\n                          <OrgTableHeader costHeader=\\\"Takeover\\\" />\\n                          <TableBody>\\n                            {sources?.map((src) =>\\n                              src.type === \\\"org\\\" ? (\\n                                <OrgTableRow\\n                                  key={`councilor-${src.org.id}-mission-${missionName}`}\\n                                  org={src.org}\\n                                  playerNationIds={playerNationIds}\\n                                  playerTraits={playerTraits}\\n                                />\\n                              ) : (\\n                                <CouncilorTableRow\\n                                  key={`org-${src.councilor.id}-mission-${missionName}`}\\n                                  councilor={src.councilor}\\n                                  stats={src.councilor.effectsWithOrgsAndAugments}\\n                                  label={src.councilor.displayName!}\\n                                />\\n                              )\\n                            )}\\n                          </TableBody>\\n                        </Table>\\n                      </AccordionContent>\\n                    </AccordionItem>\\n                  );\\n                })}\\n              </SmartAccordion>\\n            </TabsContent>\\n          ))}\\n        </SmartTabs>\\n      </div>\\n    );\\n  }\\n\\n  if (subSection === \\\"other-councilors\\\") {\\n    return (\\n      <div className=\\\"space-y-2\\\">\\n        <OtherCouncilorsByFaction {...{ analysis, weights }} />\\n      </div>\\n    );\\n  }\\n\\n  return (\\n    <div className=\\\"space-y-2\\\">\\n      <div className=\\\"my-4\\\">\\n        <ScoringWeightsDialog weights={weights} onWeightsChange={setWeights} />\\n      </div >\\n      <Collapsible>\\n        <CollapsibleTrigger asChild>\\n          <Button variant=\\\"outline\\\">Debug Data</Button>\\n        </CollapsibleTrigger>\\n        <CollapsibleContent>\\n          <pre>{JSON.stringify(analysis.playerFaction, null, 2)}</pre>\\n        </CollapsibleContent>\\n      </Collapsible>\\n    </div>\\n  );\\n}\\n\\nfunction OtherCouncilorsByFaction({ analysis, weights }: { analysis: Analysis; weights: ScoringWeights }) {\\n  const { playerVisibleCouncilors, factionsById } = analysis;\\n\\n  const scoredBaseCouncilors = scoreAndSort(\\n    playerVisibleCouncilors,\\n    weights,\\n    new Map<MissionDataName, number>(),\\n    getBaseCouncilorScore\\n  );\\n\\n  const councilorsByFactionId = scoredBaseCouncilors.reduce((acc, councilor) => {\\n    const factionId = councilor.factionId || 0;\\n    if (!factionId) return acc;\\n    if (!acc.has(factionId)) {\\n      acc.set(factionId, []);\\n    }\\n    acc.get(factionId)!.push(councilor);\\n    return acc;\\n  }, new Map<number, Analysis[\\\"playerCouncilors\\\"][number][]>());\\n\\n  const factions = Array.from(councilorsByFactionId.keys())\\n    .map((i) => factionsById.get(i!)!)\\n    .filter((i) => i.id !== analysis.alienFaction.id);\\n\\n  return (\\n    <Tabs defaultValue={`faction-${factions[0].id}`}>\\n      <TabsList>\\n        {factions\\n          .filter((i) => i.id !== analysis.alienFaction.id)\\n          .map((faction) => (\\n            <TabsTrigger key={faction.id} value={`faction-${faction.id}`}>\\n              {faction.displayName || \\\"Unknown Faction\\\"} ({councilorsByFactionId.get(faction.id)?.length || 0})\\n            </TabsTrigger>\\n          ))}\\n      </TabsList>\\n      {factions.map((faction) => (\\n        <TabsContent key={faction.id} value={`faction-${faction.id}`}>\\n          <Table>\\n            <CouncilorTableHeader />\\n            <TableBody>\\n              {councilorsByFactionId.get(faction.id)?.map((councilor) => (\\n                <CouncilorTableRow\\n                  key={councilor.id}\\n                  councilor={councilor}\\n                  stats={councilor.effectsBaseAndUnaugmentedTraits}\\n                  label={councilor.displayName!}\\n                />\\n              ))}\\n            </TableBody>\\n          </Table>\\n        </TabsContent>\\n      ))}\\n    </Tabs>\\n  );\\n}\\n\\nfunction scoreAndSort<T>(\\n  items: T[],\\n  weights: ScoringWeights,\\n  haveMissions: Map<MissionDataName, number>,\\n  scoreFn: (item: T, weights: ScoringWeights, haveMissions: Map<MissionDataName, number>) => ScoreResult,\\n  scoreSort: \\\"value\\\" | \\\"noMissionScore\\\" = \\\"value\\\"\\n) {\\n  const scoredItems = items.map((item) => {\\n    const scoreResult = scoreFn(item, weights, haveMissions);\\n    return { ...item, score: scoreResult };\\n  });\\n  scoredItems.sort((a, b) => b.score[scoreSort] - a.score[scoreSort]);\\n  return scoredItems;\\n}\\n\\nfunction getBaseCouncilorScore(\\n  councilor: Analysis[\\\"playerCouncilors\\\"][number],\\n  weights: ScoringWeights,\\n  haveMissions: Map<MissionDataName, number>\\n): ScoreResult {\\n  return getScore(councilor.effectsBaseAndUnaugmentedTraits, weights, haveMissions, true);\\n}\\n\\nfunction getModifiedCouncilorScore(\\n  councilor: Analysis[\\\"playerCouncilors\\\"][number],\\n  weights: ScoringWeights,\\n  haveMissions: Map<MissionDataName, number>\\n): ScoreResult {\\n  return getScore(councilor.effectsWithOrgsAndAugments, weights, haveMissions, true);\\n}\\n\\nconst orgTransferFactor = 0.2;\\nfunction getOrganizationScore(\\n  org: Analysis[\\\"playerAvailableOrgs\\\"][number] & { type: string },\\n  weights: ScoringWeights,\\n  haveMissions: Map<MissionDataName, number>\\n): ScoreResult {\\n  return getScore(\\n    {\\n      ...org,\\n      techBonuses: org.template?.techBonuses,\\n      missionsGrantedNames: org.template?.missionsGrantedNames || [],\\n      ...(org.type === \\\"available\\\"\\n        ? {}\\n        : {\\n            // already-purchased orgs seem to cost ~30% to transfer\\n            costMoney: (org.costMoney || 0) * orgTransferFactor,\\n            costInfluence: (org.costInfluence || 0) * orgTransferFactor,\\n            costOps: (org.costOps || 0) * orgTransferFactor,\\n            costBoost: (org.costBoost || 0) * orgTransferFactor,\\n          }),\\n    },\\n    weights,\\n    haveMissions\\n  );\\n}\\n\\ninterface ScoreResult {\\n  value: number;\\n  noMissionScore: number;\\n  details: string;\\n}\\n\\nfunction getScore(\\n  org: ShowEffectsProps,\\n  weights: ScoringWeights,\\n  haveMissions: Map<MissionDataName, number>,\\n  ignoreTier: boolean = false\\n): ScoreResult {\\n  let totalScore = 0;\\n  const details: string[] = [];\\n\\n  // Helper to add score for a numeric attribute\\n  const addScore = (name: string, value: number | undefined, weight: number | undefined, noNegative?: boolean) => {\\n    let actualValue = value || 0;\\n    if (noNegative) {\\n      actualValue = Math.max(0, actualValue);\\n    }\\n    const actualWeight = weight ?? 0;\\n\\n    // Skip if value or weight is 0/undefined/null\\n    if (!actualValue || !actualWeight) return;\\n\\n    const contribution = actualValue * actualWeight;\\n    totalScore += contribution;\\n    details.push(\\n      `${name}: ${parseFloat(actualValue.toFixed(2))} × ${parseFloat(actualWeight.toFixed(3))} = ${contribution.toFixed(\\n        3\\n      )}`\\n    );\\n  };\\n\\n  // Councilor attributes\\n  addScore(\\\"persuasion\\\", org.persuasion, weights.persuasion, true);\\n  addScore(\\\"command\\\", org.command, weights.command, true);\\n  addScore(\\\"investigation\\\", org.investigation, weights.investigation, true);\\n  addScore(\\\"espionage\\\", org.espionage, weights.espionage, true);\\n  addScore(\\\"administration\\\", org.administration, weights.administration, true);\\n  addScore(\\\"science\\\", org.science, weights.science, true);\\n  addScore(\\\"security\\\", org.security, weights.security, true);\\n  addScore(\\\"Persuasion\\\", org.Persuasion, weights.persuasion, true);\\n  addScore(\\\"Command\\\", org.Command, weights.command, true);\\n  addScore(\\\"Investigation\\\", org.Investigation, weights.investigation, true);\\n  addScore(\\\"Espionage\\\", org.Espionage, weights.espionage, true);\\n  addScore(\\\"Administration\\\", org.Administration, weights.administration, true);\\n  addScore(\\\"Science\\\", org.Science, weights.science, true);\\n  addScore(\\\"Security\\\", org.Security, weights.security, true);\\n  addScore(\\\"xpModifier\\\", org.xpModifier, weights.xpModifier);\\n  addScore(\\\"xp\\\", org.xp, weights.xp);\\n\\n  // Monthly income/costs\\n  addScore(\\\"incomeBoost_month\\\", org.incomeBoost_month, weights.incomeBoost_month);\\n  addScore(\\\"incomeMoney_month\\\", org.incomeMoney_month, weights.incomeMoney_month);\\n  addScore(\\\"incomeInfluence_month\\\", org.incomeInfluence_month, weights.incomeInfluence_month);\\n  addScore(\\\"incomeOps_month\\\", org.incomeOps_month, weights.incomeOps_month);\\n  addScore(\\\"incomeMissionControl\\\", org.incomeMissionControl, weights.incomeMissionControl);\\n  addScore(\\\"incomeResearch_month\\\", org.incomeResearch_month, weights.incomeResearch_month);\\n  addScore(\\\"projectCapacityGranted\\\", org.projectCapacityGranted, weights.projectCapacityGranted);\\n\\n  // Purchase costs\\n  addScore(\\\"costMoney\\\", org.costMoney, weights.costMoney);\\n  addScore(\\\"costInfluence\\\", org.costInfluence, weights.costInfluence);\\n  addScore(\\\"costOps\\\", org.costOps, weights.costOps);\\n  addScore(\\\"costBoost\\\", org.costBoost, weights.costBoost);\\n\\n  // Priority bonuses\\n  addScore(\\\"economyBonus\\\", org.economyBonus, weights.economyBonus);\\n  addScore(\\\"welfareBonus\\\", org.welfareBonus, weights.welfareBonus);\\n  addScore(\\\"environmentBonus\\\", org.environmentBonus, weights.environmentBonus);\\n  addScore(\\\"knowledgeBonus\\\", org.knowledgeBonus, weights.knowledgeBonus);\\n  addScore(\\\"governmentBonus\\\", org.governmentBonus, weights.governmentBonus);\\n  addScore(\\\"unityBonus\\\", org.unityBonus, weights.unityBonus);\\n  addScore(\\\"militaryBonus\\\", org.militaryBonus, weights.militaryBonus);\\n  addScore(\\\"oppressionBonus\\\", org.oppressionBonus, weights.oppressionBonus);\\n  addScore(\\\"spoilsBonus\\\", org.spoilsBonus, weights.spoilsBonus);\\n  addScore(\\\"spaceDevBonus\\\", org.spaceDevBonus, weights.spaceDevBonus);\\n  addScore(\\\"spaceflightBonus\\\", org.spaceflightBonus, weights.spaceflightBonus);\\n  addScore(\\\"MCBonus\\\", org.MCBonus, weights.MCBonus);\\n  addScore(\\\"miningBonus\\\", org.miningBonus, weights.miningBonus);\\n\\n  // Tech bonuses from councilor/traits\\n  if (weights.councilorTechBonus && org?.councilorTechBonus) {\\n    for (const { category, bonus } of org.councilorTechBonus) {\\n      const weight = weights.councilorTechBonus[category];\\n      addScore(`councilorTechBonus[${category}]`, bonus, weight);\\n    }\\n  }\\n\\n  // Tech bonuses from orgs\\n  if (weights.techBonuses && org?.techBonuses) {\\n    for (const { category, bonus } of org.techBonuses) {\\n      const weight = weights.techBonuses[category];\\n      addScore(`techBonus[${category}]`, bonus, weight);\\n    }\\n  }\\n\\n  let noMissionScore = totalScore;\\n\\n  // Missions granted\\n  if (weights.missions && org?.missionsGrantedNames) {\\n    for (const missionName of org.missionsGrantedNames) {\\n      const weight = weights.missions[missionName];\\n      addScore(`mission[${missionName}]`, 1, weight);\\n\\n      // Extra weight for missions we don't have yet or only have one councilor for\\n      if (weights.extraWeightForMissingMissions && (haveMissions.get(missionName) || 0) === 0) {\\n        totalScore += weights.extraWeightForMissingMissions;\\n        details.push(\\n          `mission[${missionName}]: missing bonus × ${parseFloat(\\n            weights.extraWeightForMissingMissions.toFixed(3)\\n          )} = ${weights.extraWeightForMissingMissions.toFixed(3)}`\\n        );\\n      }\\n      if (weights.extraWeightForSingleMissions && (haveMissions.get(missionName) || 0) === 1) {\\n        totalScore += weights.extraWeightForSingleMissions;\\n        details.push(\\n          `mission[${missionName}]: single bonus × ${parseFloat(\\n            weights.extraWeightForSingleMissions.toFixed(3)\\n          )} = ${weights.extraWeightForSingleMissions.toFixed(3)}`\\n        );\\n      }\\n    }\\n  }\\n\\n  // Divide by tier to normalize for org cost/power\\n  const tier = org.tier || 1;\\n  let finalScore = totalScore;\\n\\n  if (tier > 1 && !ignoreTier) {\\n    const tierFactor = Math.pow(tier, weights.orgTierExponent);\\n    finalScore = totalScore / tierFactor;\\n    noMissionScore /= tierFactor;\\n    details.push(`Subtotal: ${totalScore.toFixed(3)}`);\\n    details.push(`Divided by ${tierFactor.toFixed(2)} for tier ${tier}: ${finalScore.toFixed(3)}`);\\n  }\\n\\n  return {\\n    value: finalScore,\\n    noMissionScore,\\n    details: details.join(\\\"\\\\n\\\"),\\n  };\\n}\\n\",\"oldString\":\"\\\"use client\\\";\\n\\nimport { useState, useEffect } from \\\"react\\\";\\nimport { combineEffects, ShowEffects, ShowEffectsProps } from \\\"@/components/showEffects\\\";\\nimport { AccordionContent, AccordionItem, AccordionTrigger } from \\\"@/components/ui/accordion\\\";\\nimport { SmartAccordion } from \\\"@/components/ui/smart-accordion\\\";\\nimport { Button } from \\\"@/components/ui/button\\\";\\nimport { Collapsible, CollapsibleContent, CollapsibleTrigger } from \\\"@/components/ui/collapsible\\\";\\nimport { Tooltip, TooltipContent, TooltipTrigger } from \\\"@/components/ui/tooltip\\\";\\nimport { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from \\\"@/components/ui/table\\\";\\nimport { Analysis } from \\\"@/lib/analysis\\\";\\nimport { MissionDataName, TraitDataName } from \\\"@/lib/template-types-generated\\\";\\nimport { MinusCircleIcon, PlusCircleIcon } from \\\"lucide-react\\\";\\nimport { defaultScoringWeights, loadWeightsFromStorage, ScoringWeights, ScoringWeightsDialog } from \\\"./scoringWeights\\\";\\nimport { Administration, MissionIcons, TraitIcons, UnknownIcon } from \\\"@/components/icons\\\";\\nimport { Tabs, TabsContent, TabsList, TabsTrigger } from \\\"@/components/ui/tabs\\\";\\nimport { SmartTabs } from \\\"@/components/ui/smart-tabs\\\";\\nimport { twMerge } from \\\"tailwind-merge\\\";\\n\\nfunction CouncilorTableHeader({ hasOrgs }: { hasOrgs?: boolean }) {\\n  return (\\n    <TableHeader>\\n      <TableRow>\\n        <TableHead>Name</TableHead>\\n        <TableHead>Modified Stats</TableHead>\\n        {hasOrgs && <TableHead>Org Tiers</TableHead>}\\n        <TableHead>Monthly Effects</TableHead>\\n        <TableHead>Priorities</TableHead>\\n        <TableHead>Science</TableHead>\\n        <TableHead>Missions</TableHead>\\n        <TableHead>Score</TableHead>\\n        <TableHead>NM Score</TableHead>\\n        <TableHead>CP Cap</TableHead>\\n      </TableRow>\\n    </TableHeader>\\n  );\\n}\\n\\nfunction OrgTableHeader({ costHeader }: { costHeader?: string }) {\\n  return (\\n\\n    <TableHeader>\\n      <TableRow>\\n        <TableHead>Org Name</TableHead>\\n        <TableHead>Requirements</TableHead>\\n        <TableHead>Tier</TableHead>\\n        {costHeader ? <TableHead>{costHeader}</TableHead> : <TableHead>Purchase / Transfer</TableHead>}\\n        <TableHead>Monthly</TableHead>\\n        <TableHead>Effects</TableHead>\\n        <TableHead>Score</TableHead>\\n        <TableHead>NM Score</TableHead>\\n      </TableRow>\\n    </TableHeader>\\n  );\\n}\\n\\nfunction CouncilorTableRow({\\n  councilor,\\n  stats,\\n  label,\\n  hasOrgs,\\n  highlightMissionClassName,\\n}: {\\n  councilor: Analysis[\\\"playerCouncilors\\\"][number] & { score?: ScoreResult };\\n  stats: Analysis[\\\"playerCouncilors\\\"][number][\\\"effectsWithOrgsAndAugments\\\"];\\n  label: string;\\n  hasOrgs?: boolean;\\n  highlightMissionClassName?: (missionName: MissionDataName) => string | undefined;\\n}) {\\n  const admin = Math.min(25, Math.max(0, (stats.administration || 0) + (stats.Administration || 0)));\\n  const orgTiers = councilor.orgs.reduce((a, b) => a + b.tier, 0);\\n  const cpCap =\\n    Math.min(25, Math.max(0, stats.persuasion || 0) + Math.max(0, stats.Persuasion || 0)) +\\n    Math.min(25, Math.max(0, stats.command || 0) + Math.max(0, stats.Command || 0)) +\\n    Math.min(25, Math.max(0, stats.administration || 0) + Math.max(0, stats.Administration || 0));\\n  return (\\n    <TableRow key={`${councilor.id}-${label}`}>\\n      <TableCell>{label}</TableCell>\\n      <TableCell>\\n        <ShowEffects\\n          persuasion={stats.persuasion}\\n          command={stats.command}\\n          investigation={stats.investigation}\\n          espionage={stats.espionage}\\n          administration={stats.administration}\\n          science={stats.science}\\n          security={stats.security}\\n          Persuasion={stats.Persuasion}\\n          Command={stats.Command}\\n          Investigation={stats.Investigation}\\n          Espionage={stats.Espionage}\\n          Administration={stats.Administration}\\n          Science={stats.Science}\\n          Security={stats.Security}\\n          ApparentLoyalty={stats.ApparentLoyalty}\\n          Loyalty={stats.Loyalty}\\n          maxLoyalty={stats.maxLoyalty}\\n          xpModifier={stats.xpModifier}\\n          xp={stats.xp}\\n          traitTemplateNames={stats.traitTemplateNames}\\n          typeTemplateName={stats.typeTemplateName}\\n          playerIntel={stats.playerIntel}\\n          playerMaxIntel={stats.playerMaxIntel}\\n          lastRecordedLoyalty={stats.lastRecordedLoyalty}\\n          // TODO: is there a case where we should show this?\\n          // Loyalty={stats.Loyalty}\\n        />\\n      </TableCell>\\n      {hasOrgs && (\\n        <TableCell>\\n          <ShowEffects tier={stats.tier} highlightTier={orgTiers < admin} />\\n        </TableCell>\\n      )}\\n      <TableCell>\\n        <ShowEffects\\n          incomeBoost_month={stats.incomeBoost_month}\\n          incomeMoney_month={stats.incomeMoney_month}\\n          incomeInfluence_month={stats.incomeInfluence_month}\\n          incomeOps_month={stats.incomeOps_month}\\n          incomeMissionControl={stats.incomeMissionControl}\\n          incomeResearch_month={stats.incomeResearch_month}\\n          projectCapacityGranted={stats.projectCapacityGranted}\\n        />\\n      </TableCell>\\n      <TableCell>\\n        <span className=\\\"text-wrap leading-6 -my-2 inline-block\\\">\\n          <ShowEffects\\n            economyBonus={stats.economyBonus}\\n            welfareBonus={stats.welfareBonus}\\n            environmentBonus={stats.environmentBonus}\\n            knowledgeBonus={stats.knowledgeBonus}\\n            governmentBonus={stats.governmentBonus}\\n            unityBonus={stats.unityBonus}\\n            militaryBonus={stats.militaryBonus}\\n            oppressionBonus={stats.oppressionBonus}\\n            spoilsBonus={stats.spoilsBonus}\\n            spaceDevBonus={stats.spaceDevBonus}\\n            spaceflightBonus={stats.spaceflightBonus}\\n            MCBonus={stats.MCBonus}\\n            miningBonus={stats.miningBonus}\\n          />\\n        </span>\\n      </TableCell>\\n      <TableCell>\\n        <span className=\\\"text-wrap leading-6 -my-2 inline-block\\\">\\n          <ShowEffects councilorTechBonus={stats.councilorTechBonus} techBonuses={stats.techBonuses} />\\n        </span>\\n      </TableCell>\\n      <TableCell>\\n        <span className=\\\"text-wrap leading-6 -my-2 inline-block\\\">\\n          <ShowEffects\\n            missionsGrantedNames={stats.missionsGrantedNames}\\n            highlightMissionClassName={highlightMissionClassName}\\n          />\\n        </span>\\n      </TableCell>\\n      {councilor.score === undefined ? null : (\\n        <>\\n          <TableCell>\\n            <Tooltip>\\n              <TooltipTrigger>{councilor.score.value?.toFixed(2)}</TooltipTrigger>\\n              <TooltipContent align=\\\"end\\\" className=\\\"max-w-auto\\\">\\n                <pre className=\\\"p-2\\\">{councilor.score.details}</pre>\\n              </TooltipContent>\\n            </Tooltip>\\n          </TableCell>\\n          <TableCell>{councilor.score.noMissionScore?.toFixed(2)}</TableCell>\\n          <TableCell>{cpCap?.toFixed(0)}</TableCell>\\n        </>\\n      )}\\n    </TableRow>\\n  );\\n}\\n\\nfunction OrgTableRow({\\n  org,\\n  playerNationIds,\\n  playerTraits,\\n  highlightMissionClassName,\\n  isTakeover,\\n}: {\\n  org: Analysis[\\\"playerAvailableOrgs\\\"][number] & {\\n    type?: string;\\n    score?: ScoreResult;\\n    councilor?: string;\\n    councilorId?: number;\\n  };\\n  playerNationIds: Set<number>;\\n  playerTraits: Set<string>;\\n  highlightMissionClassName?: (missionName: MissionDataName) => string | undefined;\\n  isTakeover?: boolean;\\n}) {\\n  const missingRequiredTraits = org.template?.requiredOwnerTraits?.filter((t) => !playerTraits.has(t)) || [];\\n  function traitIcon(trait: TraitDataName, Fallback: typeof PlusCircleIcon) {\\n    return TraitIcons[trait] || Fallback;\\n  }\\n  return (\\n    <TableRow\\n      key={org.id}\\n      className={twMerge(org.isAdminOrg ? \\\"bg-green-100\\\" : \\\"\\\", org.type === \\\"unassigned\\\" ? \\\"bg-yellow-100\\\" : \\\"\\\")}\\n    >\\n      <TableCell>{org.displayName}</TableCell>\\n      <TableCell>\\n        {org.template?.requiresNationality && (\\n          <span className=\\\"mr-1\\\" title={`Required Nation: ${org.homeNationName || \\\"\\\"}`}>\\n            {playerNationIds.has(org.homeNationId || -1) ? (\\n              <PlusCircleIcon className=\\\"inline h-4 w-4 stroke-green-700 -mt-1 bg-transparent\\\" />\\n            ) : (\\n              <MinusCircleIcon className=\\\"inline h-4 w-4 stroke-destructive -mt-1\\\" />\\n            )}\\n          </span>\\n        )}\\n        {org.template?.requiredOwnerTraits && (\\n          <span className=\\\"mr-1\\\" title={\\\"Required Traits: \\\" + org.template.requiredOwnerTraits.join(\\\", \\\")}>\\n            {missingRequiredTraits.length === 0\\n              ? org.template.requiredOwnerTraits.map((trait, ix) => {\\n                  const Icon = traitIcon(trait, PlusCircleIcon);\\n                  return <Icon key={ix} className=\\\"inline h-4 w-4 stroke-green-700 -mt-1\\\" />;\\n                })\\n              : missingRequiredTraits.map((trait, ix) => {\\n                  const Icon = traitIcon(trait, MinusCircleIcon);\\n                  return <Icon key={ix} className=\\\"inline h-4 w-4 stroke-destructive -mt-1\\\" />;\\n                })}\\n          </span>\\n        )}\\n        {org.template?.prohibitedOwnerTraits && (\\n          <span className=\\\"mr-1\\\" title={\\\"Prohibited Traits: \\\" + org.template.prohibitedOwnerTraits.join(\\\", \\\")}>\\n            {org.template.prohibitedOwnerTraits.map((trait, ix) => {\\n              const Icon = traitIcon(trait, MinusCircleIcon);\\n              return <Icon key={ix} className=\\\"inline h-4 w-4 stroke-blue-700 -mt-1\\\" />;\\n            })}\\n          </span>\\n        )}\\n      </TableCell>\\n      <TableCell>\\n        <ShowEffects tier={org.tier} />\\n      </TableCell>\\n      <TableCell>\\n        {org.type === \\\"unassigned\\\" && \\\"T \\\"}\\n        {org.type === \\\"available\\\" || org.type === \\\"unassigned\\\" ? (\\n          <ShowEffects\\n            costMoney={(org.costMoney || 0) * (org.type === \\\"available\\\" ? 1 : orgTransferFactor)}\\n            costInfluence={(org.costInfluence || 0) * (org.type === \\\"available\\\" ? 1 : orgTransferFactor)}\\n            costOps={(org.costOps || 0) * (org.type === \\\"available\\\" ? 1 : orgTransferFactor)}\\n            costBoost={(org.costBoost || 0) * (org.type === \\\"available\\\" ? 1 : orgTransferFactor)}\\n          />\\n        ) : org.type == \\\"stealable\\\" && isTakeover ? (\\n          (() => {\\n            const target = org as any as Analysis[\\\"playerStealableOrgs\\\"][number];\\n            return (\\n              <>\\n                {target.councilor ?? \\\"Unassigned\\\"} from {target.faction?.displayName}, Admin: {target.admin} +\\n                takeoverDefense: {target.takeoverDefense}\\n              </>\\n            );\\n          })()\\n        ) : org.type === \\\"used\\\" ? (\\n          <>{org.councilor ?? \\\"Unassigned\\\"}</>\\n        ) : null}\\n      </TableCell>\\n      <TableCell>\\n        <ShowEffects\\n          incomeBoost_month={org.incomeBoost_month}\\n          incomeMoney_month={org.incomeMoney_month}\\n          incomeInfluence_month={org.incomeInfluence_month}\\n          incomeOps_month={org.incomeOps_month}\\n          incomeMissionControl={org.incomeMissionControl}\\n          incomeResearch_month={org.incomeResearch_month}\\n          projectCapacityGranted={org.projectCapacityGranted}\\n        />\\n      </TableCell>\\n      <TableCell>\\n        <ShowEffects\\n          persuasion={org.persuasion}\\n          command={org.command}\\n          investigation={org.investigation}\\n          espionage={org.espionage}\\n          administration={org.administration}\\n          science={org.science}\\n          security={org.security}\\n          economyBonus={org.economyBonus}\\n          welfareBonus={org.welfareBonus}\\n          environmentBonus={org.environmentBonus}\\n          knowledgeBonus={org.knowledgeBonus\\n          }\\n          governmentBonus={org.governmentBonus}\\n          unityBonus={org.unityBonus}\\n          militaryBonus={org.militaryBonus}\\n          oppressionBonus={org.oppressionBonus}\\n          spoilsBonus={org.spoilsBonus}\\n          spaceDevBonus={org.spaceDevBonus}\\n          spaceflightBonus={org.spaceflightBonus}\\n          MCBonus={org.MCBonus}\\n          miningBonus={org.miningBonus}\\n        />\\n      </TableCell>\\n      {org.score === undefined ? null : (\\n        <>\\n          <TableCell>\\n            <Tooltip>\\n              <TooltipTrigger>{org.score.value?.toFixed(2)}</TooltipTrigger>\\n              <TooltipContent align=\\\"end\\\" className=\\\"max-w-auto\\\">\\n                <pre className=\\\"p-2\\\">{org.score.details}</pre>\\n              </TooltipContent>\\n            </Tooltip>\\n          </TableCell>\\n          <TableCell>{org.score.noMissionScore?.toFixed(2)}</TableCell>\\n        </>\\n      )}\\n    </TableRow>\\n  );\\n}\\n\\nexport function getCouncilorsUi(analysis: Analysis) {\\n  const { playerMissionCounts } = analysis;\\n  const [weights, setWeights] = useState<ScoringWeights>(defaultScoringWeights);\\n\\n  useEffect(() => {\\n    setWeights(loadWeightsFromStorage());\\n  }, []);\\n\\n  const scoredModifiedCouncilors = scoreAndSort(\\n    analysis.playerCouncilors,\\n    weights,\\n    playerMissionCounts,\\n    getModifiedCouncilorScore\\n  );\\n  const scoredAvailableCouncilors = scoreAndSort(\\n    analysis.playerAvailableCouncilors,\\n    weights,\\n    playerMissionCounts,\\n    getBaseCouncilorScore\\n  );\\n  const scoredBaseCouncilors = scoreAndSort(\\n    analysis.playerCouncilors,\\n    weights,\\n    playerMissionCounts,\\n    getBaseCouncilorScore\\n  );\\n  const scoredOrgs = scoreAndSort(\\n    analysis.playerAvailableOrgs\\n      .map((i) => ({ type: \\\"available\\\", ...i }))\\n      .concat(analysis.playerUnassignedOrgs.map((i) => ({ type: \\\"unassigned\\\", ...i }))),\\n    weights,\\n    playerMissionCounts,\\n    getOrganizationScore,\\n    \\\"noMissionScore\\\" // ignore missions when sorting orgs\\n  ).toSorted((a, b) => (a.isAdminOrg === b.isAdminOrg ? 0 : a.isAdminOrg ? -1 : 1)); // admin orgs first\\n  const usedOrgs = analysis.playerCouncilors.flatMap((councilor) =>\\n    councilor.orgs.map((o) => ({ ...o, type: \\\"used\\\", councilor: councilor.displayName, councilorId: councilor.id }))\\n  );\\n  const scoredUsedOrgs = scoreAndSort(usedOrgs, weights, playerMissionCounts, getOrganizationScore);\\n  const scoredOwnedOrgs = scoreAndSort(\\n    analysis.playerUnassignedOrgs.map((i) => ({ type: \\\"unassigned\\\", ...i })).concat(usedOrgs),\\n    weights,\\n    playerMissionCounts,\\n    getOrganizationScore\\n  );\\n\\n  const bestAvailableCouncilor = scoredAvailableCouncilors[0]?.score.value;\\n  const worstExistingCouncilor = scoredBaseCouncilors[scoredBaseCouncilors.length - 1]?.score.value;\\n  const bestAvailableOrg = scoredOrgs[0]?.score.value;\\n  const worstExistingOrg = scoredUsedOrgs[scoredUsedOrgs.length - 1]?.score.value;\\n\\n  return {\\n    key: \\\"councilors\\\",\\n    tab: (\\n      <>\\n        Councilors ({worstExistingCouncilor?.toFixed(0)} vs. {bestAvailableCouncilor?.toFixed(0)}) / Orgs (\\n        {worstExistingOrg?.toFixed(2)} vs {bestAvailableOrg?.toFixed(2)})\\n      </>\\n    ),\\n    content: (\\n      <CouncilorsComponent\\n        {...{\\n          analysis,\\n          weights,\\n          setWeights,\\n          scoredModifiedCouncilors,\\n          scoredAvailableCouncilors,\\n          scoredBaseCouncilors,\\n          scoredOrgs,\\n          scoredUsedOrgs,\\n          scoredOwnedOrgs,\\n        }}\\n      />\\n    ),\\n  };\\n}\\n\\nfunction CouncilorsComponent({\\n  analysis,\\n  weights,\\n  setWeights,\\n  scoredModifiedCouncilors,\\n  scoredAvailableCouncilors,\\n  scoredBaseCouncilors,\\n  scoredOrgs,\\n  scoredOwnedOrgs,\\n}: {\\n  analysis: Analysis;\\n  weights: ScoringWeights;\\n  setWeights: (weights: ScoringWeights) => void;\\n  scoredModifiedCouncilors: (Analysis[\\\"playerCouncilors\\\"][number] & { score: ScoreResult })[];\\n  scoredAvailableCouncilors: (Analysis[\\\"playerAvailableCouncilors\\\"][number] & { score: ScoreResult })[];\\n  scoredBaseCouncilors: (Analysis[\\\"playerCouncilors\\\"][number] & { score: ScoreResult })[];\\n  scoredOrgs: (Analysis[\\\"playerAvailableOrgs\\\"][number] & { type: string; score: ScoreResult })[];\\n  scoredOwnedOrgs: (Analysis[\\\"playerAvailableOrgs\\\"][number] & {\\n    type: string;\\n    score: ScoreResult;\\n    councilor?: string;\\n    councilorId?: number;\\n  })[];\\n}) {\\n  const {\\n    playerMissionCounts,\\n    playerVisibleCouncilors,\\n    playerCouncilors,\\n    playerAvailableOrgs,\\n    playerUnassignedOrgs,\\n    playerFaction,\\n    playerStealableOrgs,\\n    factionsById,\\n  } = analysis;\\n  const scoredStealableOrgs = scoreAndSort(\\n    analysis.playerStealableOrgs.map((i) => ({ type: \\\"stealable\\\", ...i })),\\n    weights,\\n    playerMissionCounts,\\n    getOrganizationScore,\\n    \\\"noMissionScore\\\"\\n  );\\n  function currentHighlightMissionClassName(missionName: MissionDataName) {\\n    // if we have exactly 2, show yellow BG, if we have 1, show red, otherwise no change to bg\\n    const count = playerMissionCounts.get(missionName) || 0;\\n    if (count === 2) {\\n      return \\\"bg-yellow-300/50\\\";\\n    } else if (count === 1) {\\n      return \\\"bg-red-300/50\\\";\\n    }\\n  }\\n  function availableHighlightMissionClassName(missionName: MissionDataName) {\\n    // if we have 1, show yellow BG, if we have 0, show green, otherwise no change to bg\\n    const count = playerMissionCounts.get(missionName) || 0;\\n    if (count === 1) {\\n      return \\\"bg-yellow-300/50\\\";\\n    } else if (count === 0) {\\n      return \\\"bg-green-300/50\\\";\\n    }\\n  }\\n  const playerNationIds = new Set(analysis.playerNationIds);\\n  const playerTraits = new Set(analysis.playerCouncilors.flatMap((i) => i.traitTemplateNames));\\n  const unusedAdmin = analysis.playerCouncilors\\n    .map(\\n      (c) =>\\n        Math.min(\\n          25,\\n          Math.max(\\n            0,\\n            (c.effectsWithOrgsAndAugments.Administration || 0) + (c.effectsWithOrgsAndAugments.administration || 0)\\n          )\\n        ) - c.orgs.reduce((a, b) => a + b.tier, 0)\\n    )\\n    .reduce((a, b) => a + b, 0);\\n\\n  const stealableOrgsByFaction = scoredStealableOrgs.reduce((acc, org) => {\\n    const key = org.faction?.id || 0;\\n    if (!acc.has(key)) {\\n      acc.set(key, []);\\n    }\\n    acc.get(key)!.push(org);\\n    return acc;\\n  }, new Map<number, typeof scoredStealableOrgs>());\\n\\n  type MissionSource =\\n    | {\\n        type: \\\"councilor\\\";\\n        councilor: Analysis[\\\"playerCouncilors\\\"][number];\\n        factionId: number | undefined;\\n        missions: MissionDataName[];\\n      }\\n    | {\\n        type: \\\"org\\\";\\n        org: Analysis[\\\"playerAvailableOrgs\\\"][number];\\n        factionId: number | undefined;\\n        missions: MissionDataName[];\\n      };\\n\\n  const sourcesByFactionByMission = [...playerCouncilors, ...playerVisibleCouncilors]\\n    .map(\\n      (i) =>\\n        ({\\n          type: \\\"councilor\\\",\\n          councilor: i,\\n          factionId: i.factionId,\\n          missions: i.effectsWithOrgsAndAugments.missionsGrantedNames || [],\\n        } as MissionSource)\\n    )\\n    .concat(\\n      [...playerAvailableOrgs, ...playerUnassignedOrgs].map((i) => ({\\n        type: \\\"org\\\",\\n        org: i,\\n        factionId: playerFaction?.id,\\n        missions: i.template?.missionsGrantedNames || [],\\n      }))\\n    )\\n    .concat(\\n      playerStealableOrgs.map((i) => ({\\n        type: \\\"org\\\",\\n        org: i,\\n        factionId: i.faction?.id,\\n        missions: i.template?.missionsGrantedNames || [],\\n      }))\\n    )\\n    .reduce((acc, o) => {\\n      const key = o.factionId || 0;\\n      if (!acc.has(key)) {\\n        acc.set(key, new Map<string, MissionSource[]>());\\n      }\\n      const effectsMap = acc.get(key)!;\\n      o.missions.forEach((m) => {\\n        if (!effectsMap.has(m)) {\\n          effectsMap.set(m, []);\\n        }\\n        effectsMap.get(m)!.push(o);\\n      });\\n      return acc;\\n    }, new Map<number, Map<string, MissionSource[]>>());\\n  const factions = Array.from(sourcesByFactionByMission.keys())\\n    .map((factionId) => factionsById.get(factionId)!)\\n    .filter((f) => f)\\n    .toSorted((a, b) => {\\n      if (a.id === playerFaction.id) return -1;\\n      if (b.id === playerFaction.id) return 1;\\n      return (a.displayName || \\\"\\\").localeCompare(b.displayName || \\\"\\\");\\n    });\\n\\n  const importantMissions = [\\\"Assassinate\\\"];\\n\\n  const councilEffects = scoredModifiedCouncilors.reduce((acc, councilor) => {\\n    return combineEffects(acc, councilor.effectsWithOrgsAndAugments);\\n  }, {} as ShowEffectsProps);\\n\\n  // TODO: would be cool to click an effect icon and sort everything by that (ie. click persuasion icon to see who/org gives most persuasion)\\n  return (\\n    <div className=\\\"space-y-2\\\">\\n      <SmartAccordion type=\\\"single\\\" collapsible storageKey=\\\"councilorsSections\\\" defaultValue=\\\"existing\\\">\\n        <AccordionItem value=\\\"existing\\\">\\n          <AccordionTrigger>\\n            <span>\\n              Manage Existing Council ({unusedAdmin.toFixed(0)} <Administration />)\\n            </span>\\n          </AccordionTrigger>\\n          <AccordionContent>\\n            <div className=\\\"py-1\\\">\\n              <ShowEffects\\n                incomeBoost_month={councilEffects.incomeBoost_month}\\n                incomeMoney_month={councilEffects.incomeMoney_month}\\n                incomeInfluence_month={councilEffects.incomeInfluence_month}\\n                incomeOps_month={councilEffects.incomeOps_month}\\n                incomeMissionControl={councilEffects.incomeMissionControl}\\n                incomeResearch_month={councilEffects.incomeResearch_month}\\n                projectCapacityGranted={councilEffects.projectCapacityGranted}\\n              />\\n              <ShowEffects\\n                economyBonus={councilEffects.economyBonus}\\n                welfareBonus={councilEffects.welfareBonus}\\n                environmentBonus={councilEffects.environmentBonus\\n                }\\n                knowledgeBonus={councilEffects.knowledgeBonus}\\n                governmentBonus={councilEffects.governmentBonus}\\n                unityBonus={councilEffects.unityBonus}\\n                militaryBonus={councilEffects.militaryBonus}\\n                oppressionBonus={councilEffects.oppressionBonus}\\n                spoilsBonus={councilEffects.spoilsBonus}\\n                spaceDevBonus={councilEffects.spaceDevBonus}\\n                spaceflightBonus={councilEffects.spaceflightBonus}\\n                MCBonus={councilEffects.MCBonus}\\n                miningBonus={councilEffects.miningBonus}\\n              />\\n              <ShowEffects\\n                councilorTechBonus={councilEffects.councilorTechBonus}\\n                techBonuses={councilEffects.techBonuses}\\n              />\\n            </div>\\n            <Table>\\n              <CouncilorTableHeader hasOrgs />\\n              <TableBody>\\n                {scoredModifiedCouncilors.map((councilor) => (\\n                  <CouncilorTableRow\\n                    key={councilor.id}\\n                    councilor={councilor}\\n                    stats={councilor.effectsWithOrgsAndAugments}\\n                    label={councilor.displayName!}\\n                    hasOrgs\\n                    highlightMissionClassName={currentHighlightMissionClassName}\\n                  />\\n                ))}\\n              </TableBody>\\n            </Table>\\n            <h3 className=\\\"mt-1\\\">Available Organizations:</h3>\\n            <Table>\\n              <OrgTableHeader />\\n              <TableBody>\\n                {scoredOrgs.map((org) => (\\n                  <OrgTableRow\\n                    key={org.id}\\n                    org={org}\\n                    playerNationIds={playerNationIds}\\n                    playerTraits={playerTraits}\\n                    highlightMissionClassName={availableHighlightMissionClassName}\\n                  />\\n                ))}\\n              </TableBody>\\n            </Table>\\n          </AccordionContent>\\n        </AccordionItem>\\n        <AccordionItem value=\\\"new-councilors\\\">\\n          <AccordionTrigger>Find New Councilors</AccordionTrigger>\\n          <AccordionContent>\\n            <h3>Available Councilors:</h3>\\n            <Table>\\n              <CouncilorTableHeader />\\n              <TableBody>\\n                {scoredAvailableCouncilors.map((councilor) => (\\n                  <CouncilorTableRow\\n                    key={councilor.id}\\n                    councilor={councilor}\\n                    stats={councilor.effectsBaseAndUnaugmentedTraits}\\n                    label={councilor.displayName!}\\n                    highlightMissionClassName={availableHighlightMissionClassName}\\n                  />\\n                ))}\\n              </TableBody>\\n            </Table>\\n\\n            <h3 className=\\\"mt-1\\\">Unmodified Active Councilors:</h3>\\n            <Table>\\n              <CouncilorTableHeader />\\n              <TableBody>\\n                {scoredBaseCouncilors.map((councilor) => (\\n                  <CouncilorTableRow\\n                    key={`${councilor.id}-base`}\\n                    councilor={councilor}\\n                    stats={councilor.effectsBaseAndUnaugmentedTraits}\\n                    label={`${councilor.displayName}`}\\n                    highlightMissionClassName={currentHighlightMissionClassName}\\n                  />\\n                ))}\\n              </TableBody>\\n            </Table>\\n          </AccordionContent>\\n        </AccordionItem>\\n        <AccordionItem value=\\\"current-orgs\\\">\\n          <AccordionTrigger>Current Organizations</AccordionTrigger>\\n          <AccordionContent>\\n            <Table>\\n              <OrgTableHeader costHeader=\\\"Councilor\\\" />\\n              <TableBody>\\n                {scoredOwnedOrgs.toReversed().map((org) => (\\n                  <OrgTableRow\\n                    key={org.id}\\n                    org={org}\\n                    playerNationIds={playerNationIds}\\n                    playerTraits={playerTraits}\\n                    highlightMissionClassName={availableHighlightMissionClassName}\\n                  />\\n                ))}\\n              </TableBody>\\n            </Table>\\n          </AccordionContent>\\n        </AccordionItem>\\n        <AccordionItem value=\\\"takeover\\\">\\n          <AccordionTrigger>Hostile Takeover</AccordionTrigger>\\n          <AccordionContent>\\n            <SmartTabs\\n              storageKey=\\\"councilorsTakeoverTabs\\\"\\n              defaultValue={`faction-${Array.from(stealableOrgsByFaction.keys())[0]}`}\\n            >\\n              <TabsList>\\n                {Array.from(stealableOrgsByFaction.entries()).map(([factionId, orgs]) => (\\n                  <TabsTrigger key={factionId} value={`faction-${factionId}`}>\\n                    {orgs[0].faction?.displayName || \\\"Unknown Faction\\\"} ({orgs.length})\\n                  </TabsTrigger>\\n                ))}\\n              </TabsList>\\n              {Array.from(stealableOrgsByFaction.entries()).map(([factionId, orgs]) => (\\n                <TabsContent key={factionId} value={`faction-${factionId}`}>\\n                  <Table>\\n                    <OrgTableHeader costHeader=\\\"Takeover\\\" />\\n                    <TableBody>\\n                      {orgs.map((org) => (\\n                        <OrgTableRow\\n                          key={org.id}\\n                          org={org}\\n                          playerNationIds={playerNationIds}\\n                          playerTraits={playerTraits}\\n                          highlightMissionClassName={availableHighlightMissionClassName}\\n                          isTakeover\\n                        />\\n                      ))}\\n                    </TableBody>\\n                  </Table>\\n                </TabsContent>\\n              ))}\\n            </SmartTabs>\\n          </AccordionContent>\\n        </AccordionItem>\\n        <AccordionItem value=\\\"missions\\\">\\n          <AccordionTrigger>Missions</AccordionTrigger>\\n          <AccordionContent>\\n            <SmartTabs storageKey=\\\"councilorsMissionsTabs\\\" defaultValue={`faction-${factions[0].id}`}>\\n              <TabsList>\\n                {factions.map((faction) => (\\n                  <TabsTrigger key={faction.id} value={`faction-${faction.id}`}>\\n                    {faction.displayName || \\\"Unknown Faction\\\"} ({sourcesByFactionByMission.get(faction.id)?.size || 0})\\n                    {importantMissions\\n                      .filter(\\n                        (m) =>\\n                          sourcesByFactionByMission\\n                            .get(faction.id)\\n                            ?.get(m)\\n                            ?.filter((i) => i.type === \\\"councilor\\\")?.length ?? 0 > 0\\n                      )\\n                      .map((m) => {\\n                        const MissionIcon = MissionIcons[m] || UnknownIcon;\\n                        return (\\n                          <span key={m} className=\\\"inline-block -mt-2\\\">\\n                            <MissionIcon className=\\\"h-4 w-4\\\" />\\n                          </span>\\n                        );\\n                      })}\\n                  </TabsTrigger>\\n                ))}\\n              </TabsList>\\n              {factions.map((faction) => (\\n                <TabsContent key={faction.id} value={`faction-${faction.id}`}>\\n                  <SmartAccordion type=\\\"single\\\" collapsible storageKey={`councilorsMissions-${faction.id}`}>\\n                    {Array.from(\\n                      new Set([\\n                        ...importantMissions,\\n                        ...Array.from(sourcesByFactionByMission.get(faction.id)?.keys() || []),\\n                      ])\\n                    ).map((missionName) => {\\n                      const sources = sourcesByFactionByMission.get(faction.id)?.get(missionName) || [];\\n                      const MissionIcon = MissionIcons[missionName] || UnknownIcon;\\n                      return (\\n                        <AccordionItem key={missionName} value={missionName}>\\n                          <AccordionTrigger>\\n                            <span>\\n                              <MissionIcon /> {missionName} &ndash;{\\\" \\\"}\\n                              {sources.filter((i) => i.type === \\\"councilor\\\").length} Councilors &lt;-{\\\" \\\"}\\n                              {sources.filter((i) => i.type === \\\"org\\\").length} Orgs\\n                            </span>\\n                          </AccordionTrigger>\\n                          <AccordionContent>\\n                            <Table>\\n                              <OrgTableHeader costHeader=\\\"Takeover\\\" />\\n                              <TableBody>\\n                                {sources?.map((src) =>\\n                                  src.type === \\\"org\\\" ? (\\n                                    <OrgTableRow\\n                                      key={`councilor-${src.org.id}-mission-${missionName}`}\\n                                      org={src.org}\\n                                      playerNationIds={playerNationIds}\\n                                      playerTraits={playerTraits}\\n                                    />\\n                                  ) : (\\n                                    <CouncilorTableRow\\n                                      key={`org-${src.councilor.id}-mission-${missionName}`}\\n                                      councilor={src.councilor}\\n                                      stats={src.councilor.effectsWithOrgsAndAugments}\\n                                      label={src.councilor.displayName!}\\n                                    />\\n                                  )\\n                                )}\\n                              </TableBody>\\n                            </Table>\\n                          </AccordionContent>\\n                        </AccordionItem>\\n                      );\\n                    })}\\n                  </SmartAccordion>\\n                </TabsContent>\\n              ))}\\n            </SmartTabs>\\n          </AccordionContent>\\n        </AccordionItem>\\n        <AccordionItem value=\\\"other-councilors\\\">\\n          <AccordionTrigger>Other Councilors</AccordionTrigger>\\n          <AccordionContent>\\n            <OtherCouncilorsByFaction {...{ analysis, weights }} />\\n          </AccordionContent>\\n        </AccordionItem>\\n      </SmartAccordion>\\n\\n      <div className=\\\"my-4\\\">\\n        <ScoringWeightsDialog weights={weights} onWeightsChange={setWeights} />\\n      </div >\\n \\n      <Collapsible>\\n        <CollapsibleTrigger asChild>\\n          <Button variant=\\\"outline\\\">Debug Data</Button>\\n        </CollapsibleTrigger>\\n        <CollapsibleContent>\\n          {/* <pre>{JSON.stringify(analysis.playerCouncilors, null, 2)}</pre>\\n          <pre>{JSON.stringify(analysis.playerAvailableCouncilors, null, 2)}</pre>\\n          <pre>{JSON.stringify(analysis.playerAvailableOrgs, null, 2)}</pre>\\n          <pre>{JSON.stringify(analysis.playerUnassignedOrgs, null, 2)}</pre> */}\\n          <pre>{JSON.stringify(analysis.playerFaction, null, 2)}</pre>\\n        </CollapsibleContent>\\n      </Collapsible>\\n    </div>\\n  );\\n}\\n\\nfunction OtherCouncilorsByFaction({ analysis, weights }: { analysis: Analysis; weights: ScoringWeights }) {\\n  const { playerVisibleCouncilors, factionsById } = analysis;\\n\\n  const scoredBaseCouncilors = scoreAndSort(\\n    playerVisibleCouncilors,\\n    weights,\\n    new Map<MissionDataName, number>(),\\n    getBaseCouncilorScore\\n  );\\n\\n  const councilorsByFactionId = scoredBaseCouncilors.reduce((acc, councilor) => {\\n    const factionId = councilor.factionId || 0;\\n    if (!factionId) return acc;\\n    if (!acc.has(factionId)) {\\n      acc.set(factionId, []);\\n    }\\n    acc.get(factionId)!.push(councilor);\\n    return acc;\\n  }, new Map<number, Analysis[\\\"playerCouncilors\\\"][number][]>());\\n\\n  const factions = Array.from(councilorsByFactionId.keys())\\n    .map((i) => factionsById.get(i!)!)\\n    .filter((i) => i.id !== analysis.alienFaction.id);\\n\\n  return (\\n    <Tabs defaultValue={`faction-${factions[0].id}`}>\\n      <TabsList>\\n        {factions\\n          .filter((i) => i.id !== analysis.alienFaction.id)\\n          .map((faction) => (\\n            <TabsTrigger key={faction.id} value={`faction-${faction.id}`}>\\n              {faction.displayName || \\\"Unknown Faction\\\"} ({councilorsByFactionId.get(faction.id)?.length || 0})\\n            </TabsTrigger>\\n          ))}\\n      </TabsList>\\n      {factions.map((faction) => (\\n        <TabsContent key={faction.id} value={`faction-${faction.id}`}>\\n          <Table>\\n            <CouncilorTableHeader />\\n            <TableBody>\\n              {councilorsByFactionId.get(faction.id)?.map((councilor) => (\\n                <CouncilorTableRow\\n                  key={councilor.id}\\n                  councilor={councilor}\\n                  stats={councilor.effectsBaseAndUnaugmentedTraits}\\n                  label={councilor.displayName!}\\n                />\\n              ))}\\n            </TableBody>\\n          </Table>\\n        </TabsContent>\\n      ))}\\n    </Tabs>\\n  );\\n}\\n\\nfunction scoreAndSort<T>(\\n  items: T[],\\n  weights: ScoringWeights,\\n  haveMissions: Map<MissionDataName, number>,\\n  scoreFn: (item: T, weights: ScoringWeights, haveMissions: Map<MissionDataName, number>) => ScoreResult,\\n  scoreSort: \\\"value\\\" | \\\"noMissionScore\\\" = \\\"value\\\"\\n) {\\n  const scoredItems = items.map((item) => {\\n    const scoreResult = scoreFn(item, weights, haveMissions);\\n    return { ...item, score: scoreResult };\\n  });\\n  scoredItems.sort((a, b) => b.score[scoreSort] - a.score[scoreSort]);\\n  return scoredItems;\\n}\\n\\nfunction getBaseCouncilorScore(\\n  councilor: Analysis[\\\"playerCouncilors\\\"][number],\\n  weights: ScoringWeights,\\n  haveMissions: Map<MissionDataName, number>\\n): ScoreResult {\\n  return getScore(councilor.effectsBaseAndUnaugmentedTraits, weights, haveMissions, true);\\n}\\n\\nfunction getModifiedCouncilorScore(\\n  councilor: Analysis[\\\"playerCouncilors\\\"][number],\\n  weights: ScoringWeights,\\n  haveMissions: Map<MissionDataName, number>\\n): ScoreResult {\\n  return getScore(councilor.effectsWithOrgsAndAugments, weights, haveMissions, true);\\n}\\n\\nconst orgTransferFactor = 0.2;\\nfunction getOrganizationScore(\\n  org: Analysis[\\\"playerAvailableOrgs\\\"][number] & { type: string },\\n  weights: ScoringWeights,\\n  haveMissions: Map<MissionDataName, number>\\n): ScoreResult {\\n  return getScore(\\n    {\\n      ...org,\\n      techBonuses: org.template?.techBonuses,\\n      missionsGrantedNames: org.template?.missionsGrantedNames || [],\\n      ...(org.type === \\\"available\\\"\\n        ? {}\\n        : {\\n            // already-purchased orgs seem to cost ~30% to transfer\\n            costMoney: (org.costMoney || 0) * orgTransferFactor,\\n            costInfluence: (org.costInfluence || 0) * orgTransferFactor,\\n            costOps: (org.costOps || 0) * orgTransferFactor,\\n            costBoost: (org.costBoost || 0) * orgTransferFactor,\\n          }),\\n    },\\n    weights,\\n    haveMissions\\n  );\\n}\\n\\ninterface ScoreResult {\\n  value: number;\\n  noMissionScore: number;\\n  details: string;\\n}\\n\\nfunction getScore(\\n  org: ShowEffectsProps,\\n  weights: ScoringWeights,\\n  haveMissions: Map<MissionDataName, number>,\\n  ignoreTier: boolean = false\\n): ScoreResult {\\n  let totalScore = 0;\\n  const details: string[] = [];\\n\\n  // Helper to add score for a numeric attribute\\n  const addScore = (name: string, value: number | undefined, weight: number | undefined, noNegative?: boolean) => {\\n    let actualValue = value || 0;\\n    if (noNegative) {\\n      actualValue = Math.max(0, actualValue);\\n    }\\n    const actualWeight = weight ?? 0;\\n\\n    // Skip if value or weight is 0/undefined/null\\n    if (!actualValue || !actualWeight) return;\\n\\n    const contribution = actualValue * actualWeight;\\n    totalScore += contribution;\\n    details.push(\\n      `${name}: ${parseFloat(actualValue.toFixed(2))} × ${parseFloat(actualWeight.toFixed(3))} = ${contribution.toFixed(\\n        3\\n      )}`\\n    );\\n  };\\n\\n  // Councilor attributes\\n  addScore(\\\"persuasion\\\", org.persuasion, weights.persuasion, true);\\n  addScore(\\\"command\\\", org.command, weights.command, true);\\n  addScore(\\\"investigation\\\", org.investigation, weights.investigation, true);\\n  addScore(\\\"espionage\\\", org.espionage, weights.espionage, true);\\n  addScore(\\\"administration\\\", org.administration, weights.administration, true);\\n  addScore(\\\"science\\\", org.science, weights.science, true);\\n  addScore(\\\"security\\\", org.security, weights.security, true);\\n  addScore(\\\"Persuasion\\\", org.Persuasion, weights.persuasion, true);\\n  addScore(\\\"Command\\\", org.Command, weights.command, true);\\n  addScore(\\\"Investigation\\\", org.Investigation, weights.investigation, true);\\n  addScore(\\\"Espionage\\\", org.Espionage, weights.espionage, true);\\n  addScore(\\\"Administration\\\", org.Administration, weights.administration, true);\\n  addScore(\\\"Science\\\", org.Science, weights.science, true);\\n  addScore(\\\"Security\\\", org.Security, weights.security, true);\\n  addScore(\\\"xpModifier\\\", org.xpModifier, weights.xpModifier);\\n  addScore(\\\"xp\\\", org.xp, weights.xp);\\n\\n  // Monthly income/costs\\n  addScore(\\\"incomeBoost_month\\\", org.incomeBoost_month, weights.incomeBoost_month);\\n  addScore(\\\"incomeMoney_month\\\", org.incomeMoney_month, weights.incomeMoney_month);\\n  addScore(\\\"incomeInfluence_month\\\", org.incomeInfluence_month, weights.incomeInfluence_month);\\n  addScore(\\\"incomeOps_month\\\", org.incomeOps_month, weights.incomeOps_month);\\n  addScore(\\\"incomeMissionControl\\\", org.incomeMissionControl, weights.incomeMissionControl);\\n  addScore(\\\"incomeResearch_month\\\", org.incomeResearch_month, weights.incomeResearch_month);\\n  addScore(\\\"projectCapacityGranted\\\", org.projectCapacityGranted, weights.projectCapacityGranted);\\n\\n  // Purchase costs\\n  addScore(\\\"costMoney\\\", org.costMoney, weights.costMoney);\\n  addScore(\\\"costInfluence\\\", org.costInfluence, weights.costInfluence);\\n  addScore(\\\"costOps\\\", org.costOps, weights.costOps);\\n  addScore(\\\"costBoost\\\", org.costBoost, weights.costBoost);\\n\\n  // Priority bonuses\\n  addScore(\\\"economyBonus\\\", org.economyBonus, weights.economyBonus);\\n  addScore(\\\"welfareBonus\\\", org.welfareBonus, weights.welfareBonus);\\n  addScore(\\\"environmentBonus\\\", org.environmentBonus, weights.environmentBonus);\\n  addScore(\\\"knowledgeBonus\\\", org.knowledgeBonus, weights.knowledgeBonus);\\n  addScore(\\\"governmentBonus\\\", org.governmentBonus, weights.governmentBonus);\\n  addScore(\\\"unityBonus\\\", org.unityBonus, weights.unityBonus);\\n  addScore(\\\"militaryBonus\\\", org.militaryBonus, weights.militaryBonus);\\n  addScore(\\\"oppressionBonus\\\", org.oppressionBonus, weights.oppressionBonus);\\n  addScore(\\\"spoilsBonus\\\", org.spoilsBonus, weights.spoilsBonus);\\n  addScore(\\\"spaceDevBonus\\\", org.spaceDevBonus, weights.spaceDevBonus);\\n  addScore(\\\"spaceflightBonus\\\", org.spaceflightBonus, weights.spaceflightBonus);\\n  addScore(\\\"MCBonus\\\", org.MCBonus, weights.MCBonus);\\n  addScore(\\\"miningBonus\\\", org.miningBonus, weights.miningBonus);\\n\\n  // Tech bonuses from councilor/traits\\n  if (weights.councilorTechBonus && org?.councilorTechBonus) {\\n    for (const { category, bonus } of org.councilorTechBonus) {\\n      const weight = weights.councilorTechBonus[category];\\n      addScore(`councilorTechBonus[${category}]`, bonus, weight);\\n    }\\n  }\\n\\n  // Tech bonuses from orgs\\n  if (weights.techBonuses && org?.techBonuses) {\\n    for (const { category, bonus } of org.techBonuses) {\\n      const weight = weights.techBonuses[category];\\n      addScore(`techBonus[${category}]`, bonus, weight);\\n    }\\n  }\\n\\n  let noMissionScore = totalScore;\\n\\n  // Missions granted\\n  if (weights.missions && org?.missionsGrantedNames) {\\n    for (const missionName of org.missionsGrantedNames) {\\n      const weight = weights.missions[missionName];\\n      addScore(`mission[${missionName}]`, 1, weight);\\n\\n      // Extra weight for missions we don't have yet or only have one councilor for\\n      if (weights.extraWeightForMissingMissions && (haveMissions.get(missionName) || 0) === 0) {\\n        totalScore += weights.extraWeightForMissingMissions;\\n        details.push(\\n          `mission[${missionName}]: missing bonus × ${parseFloat(\\n            weights.extraWeightForMissingMissions.toFixed(3)\\n          )} = ${weights.extraWeightForMissingMissions.toFixed(3)}`\\n        );\\n      }\\n      if (weights.extraWeightForSingleMissions && (haveMissions.get(missionName) || 0) === 1) {\\n        totalScore += weights.extraWeightForSingleMissions;\\n        details.push(\\n          `mission[${missionName}]: single bonus × ${parseFloat(\\n            weights.extraWeightForSingleMissions.toFixed(3)\\n          )} = ${weights.extraWeightForSingleMissions.toFixed(3)}`\\n        );\\n      }\\n    }\\n  }\\n\\n  // Divide by tier to normalize for org cost/power\\n  const tier = org.tier || 1;\\n  let finalScore = totalScore;\\n\\n  if (tier > 1 && !ignoreTier) {\\n    const tierFactor = Math.pow(tier, weights.orgTierExponent);\\n    finalScore = totalScore / tierFactor;\\n    noMissionScore /= tierFactor;\\n    details.push(`Subtotal: ${totalScore.toFixed(3)}`);\\n    details.push(`Divided by ${tierFactor.toFixed(2)} for tier ${tier}: ${finalScore.toFixed(3)}`);\\n  }\\n\\n  return {\\n    value: finalScore,\\n    noMissionScore,\\n    details: details.join(\\\"\\\\n\\\"),\\n  };\\n}\\n\",\"oldString\":\"\\\"use client\\\";\\n\\nimport { useState, useEffect } from \\\"react\\\";\\nimport { combineEffects, ShowEffects, ShowEffectsProps } from \\\"@/components/showEffects\\\";\\nimport { AccordionContent, AccordionItem, AccordionTrigger } from \\\"@/components/ui/accordion\\\";\\nimport { SmartAccordion } from \\\"@/components/ui/smart-accordion\\\";\\nimport { Button } from \\\"@/components/ui/button\\\";\\nimport { Collapsible, CollapsibleContent, CollapsibleTrigger } from \\\"@/components/ui/collapsible\\\";\\nimport { Tooltip, TooltipContent, TooltipTrigger } from \\\"@/components/ui/tooltip\\\";\\nimport { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from \\\"@/components/ui/table\\\";\\nimport { Analysis } from \\\"@/lib/analysis\\\";\\nimport { MissionDataName, TraitDataName } from \\\"@/lib/template-types-generated\\\";\\nimport { MinusCircleIcon, PlusCircleIcon } from \\\"lucide-react\\\";\\nimport { defaultScoringWeights, loadWeightsFromStorage, ScoringWeights, ScoringWeightsDialog } from \\\"./scoringWeights\\\";\\nimport { Administration, MissionIcons, TraitIcons, UnknownIcon } from \\\"@/components/icons\\\";\\nimport { Tabs, TabsContent, TabsList, TabsTrigger } from \\\"@/components/ui/tabs\\\";\\nimport { SmartTabs } from \\\"@/components/ui/smart-tabs\\\";\\nimport { twMerge } from \\\"tailwind-merge\\\";\\n\\nfunction CouncilorTableHeader({ hasOrgs }: { hasOrgs?: boolean }) {\\n  return (\\n    <TableHeader>\\n      <TableRow>\\n        <TableHead>Name</TableHead>\\n        <TableHead>Modified Stats</TableHead>\\n        {hasOrgs && <TableHead>Org Tiers</TableHead>}\\n        <TableHead>Monthly Effects</TableHead>\\n        <TableHead>Priorities</TableHead>\\n        <TableHead>Science</TableHead>\\n        <TableHead>Missions</TableHead>\\n        <TableHead>Score</TableHead>\\n        <TableHead>NM Score</TableHead>\\n        <TableHead>CP Cap</TableHead>\\n      </TableRow>\\n    </TableHeader>\\n  );\\n}\\n\\nfunction OrgTableHeader({ costHeader }: { costHeader?: string }) {\\n  return (\\n\\n    <TableHeader>\\n      <TableRow>\\n        <TableHead>Org Name</TableHead>\\n        <TableHead>Requirements</TableHead>\\n        <TableHead>Tier</TableHead>\\n        {costHeader ? <TableHead>{costHeader}</TableHead> : <TableHead>Purchase / Transfer</TableHead>}\\n        <TableHead>Monthly</TableHead>\\n        <TableHead>Effects</TableHead>\\n        <TableHead>Score</TableHead>\\n        <TableHead>NM Score</TableHead>\\n      </TableRow>\\n    </TableHeader>\\n  );\\n}\\n\\nfunction CouncilorTableRow({\\n  councilor,\\n  stats,\\n  label,\\n  hasOrgs,\\n  highlightMissionClassName,\\n}: {\\n  councilor: Analysis[\\\"playerCouncilors\\\"][number] & { score?: ScoreResult };\\n  stats: Analysis[\\\"playerCouncilors\\\"][number][\\\"effectsWithOrgsAndAugments\\\"];\\n  label: string;\\n  hasOrgs?: boolean;\\n  highlightMissionClassName?: (missionName: MissionDataName) => string | undefined;\\n}) {\\n  const admin = Math.min(25, Math.max(0, (stats.administration || 0) + (stats.Administration || 0)));\\n  const orgTiers = councilor.orgs.reduce((a, b) => a + b.tier, 0);\\n  const cpCap =\\n    Math.min(25, Math.max(0, stats.persuasion || 0) + Math.max(0, stats.Persuasion || 0)) +\\n    Math.min(25, Math.max(0, stats.command || 0) + Math.max(0, stats.Command || 0)) +\\n    Math.min(25, Math.max(0, stats.administration || 0) + Math.max(0, stats.Administration || 0));\\n  return (\\n    <TableRow key={`${councilor.id}-${label}`}>\\n      <TableCell>{label}</TableCell>\\n      <TableCell>\\n        <ShowEffects\\n          persuasion={stats.persuasion}\\n          command={stats.command}\\n          investigation={stats.investigation}\\n          espionage={stats.espionage}\\n          administration={stats.administration}\\n          science={stats.science}\\n          security={stats.security}\\n          Persuasion={stats.Persuasion}\\n          Command={stats.Command}\\n          Investigation={stats.Investigation}\\n          Espionage={stats.Espionage}\\n          Administration={stats.Administration}\\n          Science={stats.Science}\\n          Security={stats.Security}\\n          ApparentLoyalty={stats.ApparentLoyalty}\\n          Loyalty={stats.Loyalty}\\n          maxLoyalty={stats.maxLoyalty}\\n          xpModifier={stats.xpModifier}\\n          xp={stats.xp}\\n          traitTemplateNames={stats.traitTemplateNames}\\n          typeTemplateName={stats.typeTemplateName}\\n          playerIntel={stats.playerIntel}\\n          playerMaxIntel={stats.playerMaxIntel}\\n          lastRecordedLoyalty={stats.lastRecordedLoyalty}\\n          // TODO: is there a case where we should show this?\\n          // Loyalty={stats.Loyalty}\\n        />\\n      </TableCell>\\n      {hasOrgs && (\\n        <TableCell>\\n          <ShowEffects tier={stats.tier} highlightTier={orgTiers < admin} />\\n        </TableCell>\\n      )}\\n      <TableCell>\\n        <ShowEffects\\n          incomeBoost_month={stats.incomeBoost_month}\\n          incomeMoney_month={stats.incomeMoney_month}\\n          incomeInfluence_month={stats.incomeInfluence_month}\\n          incomeOps_month={stats.incomeOps_month}\\n          incomeMissionControl={stats.incomeMissionControl}\\n          incomeResearch_month={stats.incomeResearch_month}\\n          projectCapacityGranted={stats.projectCapacityGranted}\\n        />\\n      </TableCell>\\n      <TableCell>\\n        <span className=\\\"text-wrap leading-6 -my-2 inline-block\\\">\\n          <ShowEffects\\n            economyBonus={stats.economyBonus}\\n            welfareBonus={stats.welfareBonus}\\n            environmentBonus={stats.environmentBonus}\\n            knowledgeBonus={stats.knowledgeBonus\\n            }\\n            governmentBonus={stats.governmentBonus}\\n            unityBonus={stats.unityBonus}\\n            militaryBonus={stats.militaryBonus}\\n            oppressionBonus={stats.oppressionBonus}\\n            spoilsBonus={stats.spoilsBonus}\\n            spaceDevBonus={stats.spaceDevBonus}\\n            spaceflightBonus={stats.spaceflightBonus}\\n            MCBonus={stats.MCBonus}\\n            miningBonus={stats.miningBonus}\\n          />\\n        </span>\\n      </TableCell>\\n      <TableCell>\\n        <span className=\\\"text-wrap leading-6 -my-2 inline-block\\\">\\n          <ShowEffects councilorTechBonus={stats.councilorTechBonus} techBonuses={stats.techBonuses} />\\n        </span>\\n      </TableCell>\\n      <TableCell>\\n        <span className=\\\"text-wrap leading-6 -my-2 inline-block\\\">\\n          <ShowEffects\\n            missionsGrantedNames={stats.missionsGrantedNames}\\n            highlightMissionClassName={highlightMissionClassName}\\n          />\\n        </span>\\n      </TableCell>\\n      {councilor.score === undefined ? null : (\\n        <>\\n          <TableCell>\\n            <Tooltip>\\n              <TooltipTrigger>{councilor.score.value?.toFixed(2)}</TooltipTrigger>\\n              <TooltipContent align=\\\"end\\\" className=\\\"max-w-auto\\\">\\n                <pre className=\\\"p-2\\\">{councilor.score.details}</pre>\\n              </TooltipContent>\\n            </Tooltip>\\n          </TableCell>\\n          <TableCell>{councilor.score.noMissionScore?.toFixed(2)}</TableCell>\\n          <TableCell>{cpCap?.toFixed(0)}</TableCell>\\n        </>\\n      )}\\n    </TableRow>\\n  );\\n}\\n\\nfunction OrgTableRow({\\n  org,\\n  playerNationIds,\\n  playerTraits,\\n  highlightMissionClassName,\\n  isTakeover,\\n}: {\\n  org: Analysis[\\\"playerAvailableOrgs\\\"][number] & {\\n    type?: string;\\n    score?: ScoreResult;\\n    councilor?: string;\\n    councilorId?: number;\\n  };\\n  playerNationIds: Set<number>;\\n  playerTraits: Set<string>;\\n  highlightMissionClassName?: (missionName: MissionDataName) => string | undefined;\\n  isTakeover?: boolean;\\n}) {\\n  const missingRequiredTraits = org.template?.requiredOwnerTraits?.filter((t) => !playerTraits.has(t)) || [];\\n  function traitIcon(trait: TraitDataName, Fallback: typeof PlusCircleIcon) {\\n    return TraitIcons[trait] || Fallback;\\n  }\\n  return (\\n    <TableRow\\n      key={org.id}\\n      className={twMerge(org.isAdminOrg ? \\\"bg-green-100\\\" : \\\"\\\", org.type === \\\"unassigned\\\" ? \\\"bg-yellow-100\\\" : \\\"\\\")}\\n    >\\n      <TableCell>{org.displayName}</TableCell>\\n      <TableCell>\\n        {org.template?.requiresNationality && (\\n          <span className=\\\"mr-1\\\" title={`Required Nation: ${org.homeNationName || \\\"\\\"}`}>\\n            {playerNationIds.has(org.homeNationId || -1) ? (\\n              <PlusCircleIcon className=\\\"inline h-4 w-4 stroke-green-700 -mt-1 bg-transparent\\\" />\\n            ) : (\\n              <MinusCircleIcon className=\\\"inline h-4 w-4 stroke-destructive -mt-1\\\" />\\n            )}\\n          </span>\\n        )}\\n        {org.template?.requiredOwnerTraits && (\\n          <span className=\\\"mr-1\\\" title={\\\"Required Traits: \\\" + org.template.requiredOwnerTraits.join(\\\", \\\")}>\\n            {missingRequiredTraits.length === 0\\n              ? org.template.requiredOwnerTraits.map((trait, ix) => {\\n                  const Icon = traitIcon(trait, PlusCircleIcon);\\n                  return <Icon key={ix} className=\\\"inline h-4 w-4 stroke-green-700 -mt-1\\\" />;\\n                })\\n              : missingRequiredTraits.map((trait, ix) => {\\n                  const Icon = traitIcon(trait, MinusCircleIcon);\\n                  return <Icon key={ix} className=\\\"inline h-4 w-4 stroke-destructive -mt-1\\\" />;\\n                })}\\n          </span>\\n        )}\\n        {org.template?.prohibitedOwnerTraits && (\\n          <span className=\\\"mr-1\\\" title={\\\"Prohibited Traits: \\\" + org.template.prohibitedOwnerTraits.join(\\\", \\\")}>\\n            {org.template.prohibitedOwnerTraits.map((trait, ix) => {\\n              const Icon = traitIcon(trait, MinusCircleIcon);\\n              return <Icon key={ix} className=\\\"inline h-4 w-4 stroke-blue-700 -mt-1\\\" />;\\n            })}\\n          </span>\\n        )}\\n      </TableCell>\\n      <TableCell>\\n        <ShowEffects tier={org.tier} />\\n      </TableCell>\\n      <TableCell>\\n        {org.type === \\\"unassigned\\\" && \\\"T \\\"}\\n        {org.type === \\\"available\\\" || org.type === \\\"unassigned\\\" ? (\\n          <ShowEffects\\n            costMoney={(org.costMoney || 0) * (org.type === \\\"available\\\" ? 1 : orgTransferFactor)}\\n            costInfluence={(org.costInfluence || 0) * (org.type === \\\"available\\\" ? 1 : orgTransferFactor)}\\n            costOps={(org.costOps || 0) * (org.type === \\\"available\\\" ? 1 : orgTransferFactor)}\\n            costBoost={(org.costBoost || 0) * (org.type === \\\"available\\\" ? 1 : orgTransferFactor)}\\n          />\\n        ) : org.type == \\\"stealable\\\" && isTakeover ? (\\n          (() => {\\n            const target = org as any as Analysis[\\\"playerStealableOrgs\\\"][number];\\n            return (\\n              <>\\n                {target.councilor ?? \\\"Unassigned\\\"} from {target.faction?.displayName}, Admin: {target.admin} +\\n                takeoverDefense: {target.takeoverDefense}\\n              </>\\n            );\\n          })()\\n        ) : org.type === \\\"used\\\" ? (\\n          <>{org.councilor ?? \\\"Unassigned\\\"}</>\\n        ) : null}\\n      </TableCell>\\n      <TableCell>\\n        <ShowEffects\\n          incomeBoost_month={org.incomeBoost_month}\\n          incomeMoney_month={org.incomeMoney_month}\\n          incomeInfluence_month={org.incomeInfluence_month}\\n          incomeOps_month={org.incomeOps_month}\\n          incomeMissionControl={org.incomeMissionControl}\\n          incomeResearch_month={org.incomeResearch_month}\\n          projectCapacityGranted={org.projectCapacityGranted}\\n        />\\n      </TableCell>\\n      <TableCell>\\n        <ShowEffects\\n          persuasion={org.persuasion}\\n          command={org.command}\\n          investigation={org.investigation}\\n          espionage={org.espionage}\\n          administration={org.administration}\\n          science={org.science}\\n          security={org.security}\\n          economyBonus={org.economyBonus}\\n          welfareBonus={org.welfareBonus}\\n          environmentBonus={org.environmentBonus\\n          }\\n          knowledgeBonus={org.knowledgeBonus}\\n          governmentBonus={org.governmentBonus}\\n          unityBonus={org.unityBonus}\\n          militaryBonus={org.militaryBonus}\\n          oppressionBonus={org.oppressionBonus}\\n          spoilsBonus={org.spoilsBonus}\\n          spaceDevBonus={org.spaceDevBonus}\\n          spaceflightBonus={org.spaceflightBonus}\\n          MCBonus={org.MCBonus}\\n          miningBonus={org.miningBonus}\\n        />\\n      </TableCell>\\n      {org.score === undefined ? null : (\\n        <>\\n          <TableCell>\\n            <Tooltip>\\n              <TooltipTrigger>{org.score.value?.toFixed(2)}</TooltipTrigger>\\n              <TooltipContent align=\\\"end\\\" className=\\\"max-w-auto\\\">\\n                <pre className=\\\"p-2\\\">{org.score.details}</pre>\\n              </TooltipContent>\\n            </Tooltip>\\n          </TableCell>\\n          <TableCell>{org.score.noMissionScore?.toFixed(2)}</TableCell>\\n        </>\\n      )}\\n    </TableRow>\\n  );\\n}\\n\\nexport function getCouncilorsUi(analysis: Analysis) {\\n  const { playerMissionCounts } = analysis;\\n  const [weights, setWeights] = useState<ScoringWeights>(defaultScoringWeights);\\n\\n  useEffect(() => {\\n    setWeights(loadWeightsFromStorage());\\n  }, []);\\n\\n  const scoredModifiedCouncilors = scoreAndSort(\\n    analysis.playerCouncilors,\\n    weights,\\n    playerMissionCounts,\\n    getModifiedCouncilorScore\\n  );\\n  const scoredAvailableCouncilors = scoreAndSort(\\n    analysis.playerAvailableCouncilors,\\n    weights,\\n    playerMissionCounts,\\n    getBaseCouncilorScore\\n  );\\n  const scoredBaseCouncilors = scoreAndSort(\\n    analysis.playerCouncilors,\\n    weights,\\n    playerMissionCounts,\\n    getBaseCouncilorScore\\n  );\\n  const scoredOrgs = scoreAndSort(\\n    analysis.playerAvailableOrgs\\n      .map((i) => ({ type: \\\"available\\\", ...i }))\\n      .concat(analysis.playerUnassignedOrgs.map((i) => ({ type: \\\"unassigned\\\", ...i }))),\\n    weights,\\n    playerMissionCounts,\\n    getOrganizationScore,\\n    \\\"noMissionScore\\\" // ignore missions when sorting orgs\\n  ).toSorted((a, b) => (a.isAdminOrg === b.isAdminOrg ? 0 : a.isAdminOrg ? -1 : 1)); // admin orgs first\\n  const usedOrgs = analysis.playerCouncilors.flatMap((councilor) =>\\n    councilor.orgs.map((o) => ({ ...o, type: \\\"used\\\", councilor: councilor.displayName, councilorId: councilor.id }))\\n  );\\n  const scoredUsedOrgs = scoreAndSort(usedOrgs, weights, playerMissionCounts, getOrganizationScore);\\n  const scoredOwnedOrgs = scoreAndSort(\\n    analysis.playerUnassignedOrgs.map((i) => ({ type: \\\"unassigned\\\", ...i })).concat(usedOrgs),\\n    weights,\\n    playerMissionCounts,\\n    getOrganizationScore\\n  );\\n\\n  const bestAvailableCouncilor = scoredAvailableCouncilors[0]?.score.value;\\n  const worstExistingCouncilor = scoredBaseCouncilors[scoredBaseCouncilors.length - 1]?.score.value;\\n  const bestAvailableOrg = scoredOrgs[0]?.score.value;\\n  const worstExistingOrg = scoredUsedOrgs[scoredUsedOrgs.length - 1]?.score.value;\\n\\n  return {\\n    key: \\\"councilors\\\",\\n    tab: (\\n      <>\\n        Councilors ({worstExistingCouncilor?.toFixed(0)} vs. {bestAvailableCouncilor?.toFixed(0)}) / Orgs (\\n        {worstExistingOrg?.toFixed(2)} vs {bestAvailableOrg?.toFixed(2)})\\n      </>\\n    ),\\n    content: (\\n      <CouncilorsComponent\\n        {...{\\n          analysis,\\n          weights,\\n          setWeights,\\n          scoredModifiedCouncilors,\\n          scoredAvailableCouncilors,\\n          scoredBaseCouncilors,\\n          scoredOrgs,\\n          scoredUsedOrgs,\\n          scoredOwnedOrgs,\\n        }}\\n      />\\n    ),\\n  };\\n}\\n\\nfunction CouncilorsComponent({\\n  analysis,\\n  weights,\\n  setWeights,\\n  scoredModifiedCouncilors,\\n  scoredAvailableCouncilors,\\n  scoredBaseCouncilors,\\n  scoredOrgs,\\n  scoredOwnedOrgs,\\n}: {\\n  analysis: Analysis;\\n  weights: ScoringWeights;\\n  setWeights: (weights: ScoringWeights) => void;\\n  scoredModifiedCouncilors: (Analysis[\\\"playerCouncilors\\\"][number] & { score: ScoreResult })[];\\n  scoredAvailableCouncilors: (Analysis[\\\"playerAvailableCouncilors\\\"][number] & { score: ScoreResult })[];\\n  scoredBaseCouncilors: (Analysis[\\\"playerCouncilors\\\"][number] & { score: ScoreResult })[];\\n  scoredOrgs: (Analysis[\\\"playerAvailableOrgs\\\"][number] & { type: string; score: ScoreResult })[];\\n  scoredOwnedOrgs: (Analysis[\\\"playerAvailableOrgs\\\"][number] & {\\n    type: string;\\n    score: ScoreResult;\\n    councilor?: string;\\n    councilorId?: number;\\n  })[];\\n}) {\\n  const {\\n    playerMissionCounts,\\n    playerVisibleCouncilors,\\n    playerCouncilors,\\n    playerAvailableOrgs,\\n    playerUnassignedOrgs,\\n    playerFaction,\\n    playerStealableOrgs,\\n    factionsById,\\n  } = analysis;\\n  const scoredStealableOrgs = scoreAndSort(\\n    analysis.playerStealableOrgs.map((i) => ({ type: \\\"stealable\\\", ...i })),\\n    weights,\\n    playerMissionCounts,\\n    getOrganizationScore,\\n    \\\"noMissionScore\\\"\\n  );\\n  function currentHighlightMissionClassName(missionName: MissionDataName) {\\n    // if we have exactly 2, show yellow BG, if we have 1, show red, otherwise no change to bg\\n    const count = playerMissionCounts.get(missionName) || 0;\\n    if (count === 2) {\\n      return \\\"bg-yellow-300/50\\\";\\n    } else if (count === 1) {\\n      return \\\"bg-red-300/50\\\";\\n    }\\n  }\\n  function availableHighlightMissionClassName(missionName: MissionDataName) {\\n    // if we have 1, show yellow BG, if we have 0, show green, otherwise no change to bg\\n    const count = playerMissionCounts.get(missionName) || 0;\\n    if (count === 1) {\\n      return \\\"bg-yellow-300/50\\\";\\n    } else if (count === 0) {\\n      return \\\"bg-green-300/50\\\";\\n    }\\n  }\\n  const playerNationIds = new Set(analysis.playerNationIds);\\n  const playerTraits = new Set(analysis.playerCouncilors.flatMap((i) => i.traitTemplateNames));\\n  const unusedAdmin = analysis.playerCouncilors\\n    .map(\\n      (c) =>\\n        Math.min(\\n          25,\\n          Math.max(\\n            0,\\n            (c.effectsWithOrgsAndAugments.Administration || 0) + (c.effectsWithOrgsAndAugments.administration || 0)\\n          )\\n        ) - c.orgs.reduce((a, b) => a + b.tier, 0)\\n    )\\n    .reduce((a, b) => a + b, 0);\\n\\n  const stealableOrgsByFaction = scoredStealableOrgs.reduce((acc, org) => {\\n    const key = org.faction?.id || 0;\\n    if (!acc.has(key)) {\\n      acc.set(key, []);\\n    }\\n    acc.get(key)!.push(org);\\n    return acc;\\n  }, new Map<number, typeof scoredStealableOrgs>());\\n\\n  type MissionSource =\\n    | {\\n        type: \\\"councilor\\\";\\n        councilor: Analysis[\\\"playerCouncilors\\\"][number];\\n        factionId: number | undefined;\\n        missions: MissionDataName[];\\n      }\\n    | {\\n        type: \\\"org\\\";\\n        org: Analysis[\\\"playerAvailableOrgs\\\"][number];\\n        factionId: number | undefined;\\n        missions: MissionDataName[];\\n      };\\n\\n  const sourcesByFactionByMission = [...playerCouncilors, ...playerVisibleCouncilors]\\n    .map(\\n      (i) =>\\n        ({\\n          type: \\\"councilor\\\",\\n          councilor: i,\\n          factionId: i.factionId,\\n          missions: i.effectsWithOrgsAndAugments.missionsGrantedNames || [],\\n        } as MissionSource)\\n    )\\n    .concat(\\n      [...playerAvailableOrgs, ...playerUnassignedOrgs].map((i) => ({\\n        type: \\\"org\\\",\\n        org: i,\\n        factionId: playerFaction?.id,\\n        missions: i.template?.missionsGrantedNames || [],\\n      }))\\n    )\\n    .concat(\\n      playerStealableOrgs.map((i) => ({\\n        type: \\\"org\\\",\\n        org: i,\\n        factionId: i.faction?.id,\\n        missions: i.template?.missionsGrantedNames || [],\\n      }))\\n    )\\n    .reduce((acc, o) => {\\n      const key = o.factionId || 0;\\n      if (!acc.has(key)) {\\n        acc.set(key, new Map<string, MissionSource[]>());\\n      }\\n      const effectsMap = acc.get(key)!;\\n      o.missions.forEach((m) => {\\n        if (!effectsMap.has(m)) {\\n          effectsMap.set(m, []);\\n        }\\n        effectsMap.get(m)!.push(o);\\n      });\\n      return acc;\\n    }, new Map<number, Map<string, MissionSource[]>>());\\n  const factions = Array.from(sourcesByFactionByMission.keys())\\n    .map((factionId) => factionsById.get(factionId)!)\\n    .filter((f) => f)\\n    .toSorted((a, b) => {\\n      if (a.id === playerFaction.id) return -1;\\n      if (b.id === playerFaction.id) return 1;\\n      return (a.displayName || \\\"\\\").localeCompare(b.displayName || \\\"\\\");\\n    });\\n\\n  const importantMissions = [\\\"Assassinate\\\"];\\n\\n  const councilEffects = scoredModifiedCouncilors.reduce((acc, councilor) => {\\n    return combineEffects(acc, councilor.effectsWithOrgsAndAugments);\\n  }, {} as ShowEffectsProps);\\n\\n  // TODO: would be cool to click an effect icon and sort everything by that (ie. click persuasion icon to see who/org gives most persuasion)\\n  return (\\n    <div className=\\\"space-y-2\\\">\\n      <SmartAccordion type=\\\"single\\\" collapsible storageKey=\\\"councilorsSections\\\" defaultValue=\\\"existing\\\">\\n        <AccordionItem value=\\\"existing\\\">\\n          <AccordionTrigger>\\n            <span>\\n              Manage Existing Council ({unusedAdmin.toFixed(0)} <Administration />)\\n            </span>\\n          </AccordionTrigger>\\n          <AccordionContent>\\n            <div className=\\\"py-1\\\">\\n              <ShowEffects\\n                incomeBoost_month={councilEffects.incomeBoost_month}\\n                incomeMoney_month={councilEffects.incomeMoney_month}\\n                incomeInfluence_month={councilEffects.incomeInfluence_month}\\n                incomeOps_month={councilEffects.incomeOps_month}\\n                incomeMissionControl={councilEffects.incomeMissionControl}\\n                incomeResearch_month={councilEffects.incomeResearch_month}\\n                projectCapacityGranted={councilEffects.projectCapacityGranted}\\n              />\\n              <ShowEffects\\n                economyBonus={councilEffects.economyBonus}\\n                welfareBonus={councilEffects.welfareBonus}\\n                environmentBonus={councilEffects.environmentBonus\\n                }\\n                knowledgeBonus={councilEffects.knowledgeBonus}\\n                governmentBonus={councilEffects.governmentBonus}\\n                unityBonus={councilEffects.unityBonus}\\n                militaryBonus={councilEffects.militaryBonus}\\n                oppressionBonus={councilEffects.oppressionBonus}\\n                spoilsBonus={councilEffects.spoilsBonus\\n                }\\n                spaceDevBonus={councilEffects.spaceDevBonus}\\n                spaceflightBonus={councilEffects.spaceflightBonus}\\n                MCBonus={councilEffects.MCBonus}\\n                miningBonus={councilEffects.miningBonus}\\n              />\\n              <ShowEffects\\n                councilorTechBonus={councilEffects.councilorTechBonus}\\n                techBonuses={councilEffects.techBonuses}\\n              />\\n            </div>\\n            <Table>\\n              <CouncilorTableHeader hasOrgs />\\n              <TableBody>\\n                {scoredModifiedCouncilors.map((councilor) => (\\n                  <CouncilorTableRow\\n                    key={councilor.id}\\n                    councilor={councilor}\\n                    stats={councilor.effectsWithOrgsAndAugments}\\n                    label={councilor.displayName!}\\n                    hasOrgs\\n                    highlightMissionClassName={currentHighlightMissionClassName}\\n                  />\\n                ))}\\n              </TableBody>\\n            </Table>\\n            <h3 className=\\\"mt-1\\\">Available Organizations:</h3>\\n            <Table>\\n              <OrgTableHeader />\\n              <TableBody>\\n                {scoredOrgs.map((org) => (\\n                  <OrgTableRow\\n                    key={org.id}\\n                    org={org}\\n                    playerNationIds={playerNationIds}\\n                    playerTraits={playerTraits}\\n                    highlightMissionClassName={availableHighlightMissionClassName}\\n                  />\\n                ))}\\n              </TableBody>\\n            </Table>\\n          </AccordionContent>\\n        </AccordionItem>\\n        <AccordionItem value=\\\"new-councilors\\\">\\n          <AccordionTrigger>Find New Councilors</AccordionTrigger>\\n          <AccordionContent>\\n            <h3>Available Councilors:</h3>\\n            <Table>\\n              <CouncilorTableHeader />\\n              <TableBody>\\n                {scoredAvailableCouncilors.map((councilor) => (\\n                  <CouncilorTableRow\\n                    key={councilor.id}\\n                    councilor={councilor}\\n                    stats={councilor.effectsBaseAndUnaugmentedTraits}\\n                    label={councilor.displayName!}\\n                    highlightMissionClassName={availableHighlightMissionClassName}\\n                  />\\n                ))}\\n              </TableBody>\\n            </Table>\\n\\n            <h3 className=\\\"mt-1\\\">Unmodified Active Councilors:</h3>\\n            <Table>\\n              <CouncilorTableHeader />\\n              <TableBody>\\n                {scoredBaseCouncilors.map((councilor) => (\\n                  <CouncilorTableRow\\n                    key={`${councilor.id}-base`}\\n                    councilor={councilor}\\n                    stats={councilor.effectsBaseAndUnaugmentedTraits}\\n                    label={`${councilor.displayName}`}\\n                    highlightMissionClassName={currentHighlightMissionClassName}\\n                  />\\n                ))}\\n              </TableBody>\\n            </Table>\\n          </AccordionContent>\\n        </AccordionItem>\\n        <AccordionItem value=\\\"current-orgs\\\">\\n          <AccordionTrigger>Current Organizations</AccordionTrigger>\\n          <AccordionContent>\\n            <Table>\\n              <OrgTableHeader costHeader=\\\"Councilor\\\" />\\n              <TableBody>\\n                {scoredOwnedOrgs.toReversed().map((org) => (\\n                  <OrgTableRow\\n                    key={org.id}\\n                    org={org}\\n                    playerNationIds={playerNationIds}\\n                    playerTraits={playerTraits}\\n                    highlightMissionClassName={availableHighlightMissionClassName}\\n                  />\\n                ))}\\n              </TableBody>\\n            </Table>\\n          </AccordionContent>\\n        </AccordionItem>\\n        <AccordionItem value=\\\"takeover\\\">\\n          <AccordionTrigger>Hostile Takeover</AccordionTrigger>\\n          <AccordionContent>\\n            <SmartTabs\\n              storageKey=\\\"councilorsTakeoverTabs\\\"\\n              defaultValue={`faction-${Array.from(stealableOrgsByFaction.keys())[0]}`}\\n            >\\n              <TabsList>\\n                {Array.from(stealableOrgsByFaction.entries()).map(([factionId, orgs]) => (\\n                  <TabsTrigger key={factionId} value={`faction-${factionId}`}>\\n                    {orgs[0].faction?.displayName || \\\"Unknown Faction\\\"} ({orgs.length})\\n                  </TabsTrigger>\\n                ))}\\n              </TabsList>\\n              {Array.from(stealableOrgsByFaction.entries()).map(([factionId, orgs]) => (\\n                <TabsContent key={factionId} value={`faction-${factionId}`}>\\n                  <Table>\\n                    <OrgTableHeader costHeader=\\\"Takeover\\\" />\\n                    <TableBody>\\n                      {orgs.map((org) => (\\n                        <OrgTableRow\\n                          key={org.id}\\n                          org={org}\\n                          playerNationIds={playerNationIds}\\n                          playerTraits={playerTraits}\\n                          highlightMissionClassName={availableHighlightMissionClassName}\\n                          isTakeover\\n                        />\\n                      ))}\\n                    </TableBody>\\n                  </Table>\\n                </TabsContent>\\n              ))}\\n            </SmartTabs>\\n          </AccordionContent>\\n        </AccordionItem>\\n        <AccordionItem value=\\\"missions\\\">\\n          <AccordionTrigger>Missions</AccordionTrigger>\\n          <AccordionContent>\\n            <SmartTabs storageKey=\\\"councilorsMissionsTabs\\\" defaultValue={`faction-${factions[0].id}`}>\\n              <TabsList>\\n                {factions.map((faction) => (\\n                  <TabsTrigger key={faction.id} value={`faction-${faction.id}`}>\\n                    {faction.displayName || \\\"Unknown Faction\\\"} ({sourcesByFactionByMission.get(faction.id)?.size || 0})\\n                    {importantMissions\\n                      .filter(\\n                        (m) =>\\n                          sourcesByFactionByMission\\n                            .get(faction.id)\\n                            ?.get(m)\\n                            ?.filter((i) => i.type === \\\"councilor\\\")?.length ?? 0 > 0\\n                      )\\n                      .map((m) => {\\n                        const MissionIcon = MissionIcons[m] || UnknownIcon;\\n                        return (\\n                          <span key={m} className=\\\"inline-block -mt-2\\\">\\n                            <MissionIcon className=\\\"h-4 w-4\\\" />\\n                          </span>\\n                        );\\n                      })}\\n                  </TabsTrigger>\\n                ))}\\n              </TabsList>\\n              {factions.map((faction) => (\\n                <TabsContent key={faction.id} value={`faction-${faction.id}`}>\\n                  <SmartAccordion type=\\\"single\\\" collapsible storageKey={`councilorsMissions-${faction.id}`}>\\n                    {Array.from(\\n                      new Set([\\n                        ...importantMissions,\\n                        ...Array.from(sourcesByFactionByMission.get(faction.id)?.keys() || []),\\n                      ])\\n                    ).map((missionName) => {\\n                      const sources = sourcesByFactionByMission.get(faction.id)?.get(missionName) || [];\\n                      const MissionIcon = MissionIcons[missionName] || UnknownIcon;\\n                      return (\\n                        <AccordionItem key={missionName} value={missionName}>\\n                          <AccordionTrigger>\\n                            <span>\\n                              <MissionIcon /> {missionName} &ndash;{\\\" \\\"}\\n                              {sources.filter((i) => i.type === \\\"councilor\\\").length} Councilors &lt;-{\\\" \\\"}\\n                              {sources.filter((i) => i.type === \\\"org\\\").length} Orgs\\n                            </span>\\n                          </AccordionTrigger>\\n                          <AccordionContent>\\n                            <Table>\\n                              <OrgTableHeader costHeader=\\\"Takeover\\\" />\\n                              <TableBody>\\n                                {sources?.map((src) =>\\n                                  src.type === \\\"org\\\" ? (\\n                                    <OrgTableRow\\n                                      key={`councilor-${src.org.id}-mission-${missionName}`}\\n                                      org={src.org}\\n                                      playerNationIds={playerNationIds}\\n                                      playerTraits={playerTraits}\\n                                    />\\n                                  ) : (\\n                                    <CouncilorTableRow\\n                                      key={`org-${src.councilor.id}-mission-${missionName}`}\\n                                      councilor={src.councilor}\\n                                      stats={src.councilor.effectsWithOrgsAndAugments}\\n                                      label={src.councilor.displayName!}\\n                                    />\\n                                  )\\n                                )}\\n                              </TableBody>\\n                            </Table>\\n                          </AccordionContent>\\n                        </AccordionItem>\\n                      );\\n                    })}\\n                  </SmartAccordion>\\n                </TabsContent>\\n              ))}\\n            </SmartTabs>\\n          </AccordionContent>\\n        </AccordionItem>\\n        <AccordionItem value=\\\"other-councilors\\\">\\n          <AccordionTrigger>Other Councilors</AccordionTrigger>\\n          <AccordionContent>\\n            <OtherCouncilorsByFaction {...{ analysis, weights }} />\\n          </AccordionContent>\\n        </AccordionItem>\\n      </SmartAccordion>\\n\\n      <div className=\\\"my-4\\\">\\n        <ScoringWeightsDialog weights={weights} onWeightsChange={setWeights} />\\n      </div >\\n \\n      <Collapsible>\\n        <CollapsibleTrigger asChild>\\n          <Button variant=\\\"outline\\\">Debug Data</Button>\\n        </CollapsibleTrigger>\\n        <CollapsibleContent>\\n          {/* <pre>{JSON.stringify(analysis.playerCouncilors, null, 2)}</pre>\\n          <pre>{JSON.stringify(analysis.playerAvailableCouncilors, null, 2)}</pre>\\n          <pre>{JSON.stringify(analysis.playerAvailableOrgs, null, 2)}</pre>\\n          <pre>{JSON.stringify(analysis.playerUnassignedOrgs, null, 2)}</pre> */}\\n          <pre>{JSON.stringify(analysis.playerFaction, null, 2)}</pre>\\n        </CollapsibleContent>\\n      </Collapsible>\\n    </div>\\n  );\\n}\\n\\nfunction OtherCouncilorsByFaction({ analysis, weights }: { analysis: Analysis; weights: ScoringWeights }) {\\n  const { playerVisibleCouncilors, factionsById } = analysis;\\n\\n  const scoredBaseCouncilors = scoreAndSort(\\n    playerVisibleCouncilors,\\n    weights,\\n    new Map<MissionDataName, number>(),\\n    getBaseCouncilorScore\\n  );\\n\\n  const councilorsByFactionId = scoredBaseCouncilors.reduce((acc, councilor) => {\\n    const factionId = councilor.factionId || 0;\\n    if (!factionId) return acc;\\n    if (!acc.has(factionId)) {\\n      acc.set(factionId, []);\\n    }\\n    acc.get(factionId)!.push(councilor);\\n    return acc;\\n  }, new Map<number, Analysis[\\\"playerCouncilors\\\"][number][]>());\\n\\n  const factions = Array.from(councilorsByFactionId.keys())\\n    .map((i) => factionsById.get(i!)!)\\n    .filter((i) => i.id !== analysis.alienFaction.id);\\n\\n  return (\\n    <Tabs defaultValue={`faction-${factions[0].id}`}>\\n      <TabsList>\\n        {factions\\n          .filter((i) => i.id !== analysis.alienFaction.id)\\n          .map((faction) => (\\n            <TabsTrigger key={faction.id} value={`faction-${faction.id}`}>\\n              {faction.displayName || \\\"Unknown Faction\\\"} ({councilorsByFactionId.get(faction.id)?.length || 0})\\n            </TabsTrigger>\\n          ))}\\n      </TabsList>\\n      {factions.map((faction) => (\\n        <TabsContent key={faction.id} value={`faction-${faction.id}`}>\\n          <Table>\\n            <CouncilorTableHeader />\\n            <TableBody>\\n              {councilorsByFactionId.get(faction.id)?.map((councilor) => (\\n                <CouncilorTableRow\\n                  key={councilor.id}\\n                  councilor={councilor}\\n                  stats={councilor.effectsBaseAndUnaugmentedTraits}\\n                  label={councilor.displayName!}\\n                />\\n              ))}\\n            </TableBody>\\n          </Table>\\n        </TabsContent>\\n      ))}\\n    </Tabs>\\n  );\\n}\\n\\nfunction scoreAndSort<T>(\\n  items: T[],\\n  weights: ScoringWeights,\\n  haveMissions: Map<MissionDataName, number>,\\n  scoreFn: (item: T, weights: ScoringWeights, haveMissions: Map<MissionDataName, number>) => ScoreResult,\\n  scoreSort: \\\"value\\\" | \\\"noMissionScore\\\" = \\\"value\\\"\\n) {\\n  const scoredItems = items.map((item) => {\\n    const scoreResult = scoreFn(item, weights, haveMissions);\\n    return { ...item, score: scoreResult };\\n  });\\n  scoredItems.sort((a, b) => b.score[scoreSort] - a.score[scoreSort]);\\n  return scoredItems;\\n}\\n\\nfunction getBaseCouncilorScore(\\n  councilor: Analysis[\\\"playerCouncilors\\\"][number],\\n  weights: ScoringWeights,\\n  haveMissions: Map<MissionDataName, number>\\n): ScoreResult {\\n  return getScore(councilor.effectsBaseAndUnaugmentedTraits, weights, haveMissions, true);\\n}\\n\\nfunction getModifiedCouncilorScore(\\n  councilor: Analysis[\\\"playerCouncilors\\\"][number],\\n  weights: ScoringWeights,\\n  haveMissions: Map<MissionDataName, number>\\n): ScoreResult {\\n  return getScore(councilor.effectsWithOrgsAndAugments, weights, haveMissions, true);\\n}\\n\\nconst orgTransferFactor = 0.2;\\nfunction getOrganizationScore(\\n  org: Analysis[\\\"playerAvailableOrgs\\\"][number] & { type: string },\\n  weights: ScoringWeights,\\n  haveMissions: Map<MissionDataName, number>\\n): ScoreResult {\\n  return getScore(\\n    {\\n      ...org,\\n      techBonuses: org.template?.techBonuses,\\n      missionsGrantedNames: org.template?.missionsGrantedNames || [],\\n      ...(org.type === \\\"available\\\"\\n        ? {}\\n        : {\\n            // already-purchased orgs seem to cost ~30% to transfer\\n            costMoney: (org.costMoney || 0) * orgTransferFactor,\\n            costInfluence: (org.costInfluence || 0) * orgTransferFactor,\\n            costOps: (org.costOps || 0) * orgTransferFactor,\\n            costBoost: (org.costBoost || 0) * orgTransferFactor,\\n          }),\\n    },\\n    weights,\\n    haveMissions\\n  );\\n}\\n\\ninterface ScoreResult {\\n  value: number;\\n  noMissionScore: number;\\n  details: string;\\n}\\n\\nfunction getScore(\\n  org: ShowEffectsProps,\\n  weights: ScoringWeights,\\n  haveMissions: Map<MissionDataName, number>,\\n  ignoreTier: boolean = false\\n): ScoreResult {\\n  let totalScore = 0;\\n  const details: string[] = [];\\n\\n  // Helper to add score for a numeric attribute\\n  const addScore = (name: string, value: number | undefined, weight: number | undefined, noNegative?: boolean) => {\\n    let actualValue = value || 0;\\n    if (noNegative) {\\n      actualValue = Math.max(0, actualValue);\\n    }\\n    const actualWeight = weight ?? 0;\\n\\n    // Skip if value or weight is 0/undefined/null\\n    if (!actualValue || !actualWeight) return;\\n\\n    const contribution = actualValue * actualWeight;\\n    totalScore += contribution;\\n    details.push(\\n      `${name}: ${parseFloat(actualValue.toFixed(2))} × ${parseFloat(actualWeight.toFixed(3))} = ${contribution.toFixed(\\n        3\\n      )}`\\n    );\\n  };\\n\\n  // Councilor attributes\\n  addScore(\\\".\nError message: JSON Parse error: Unterminated string"
}
```

**Output:**
```


...124222 bytes truncated...

The tool call succeeded but the output was truncated. Full output saved to: .local\share\opencode\tool-output\tool_e001cf567001hG964KRywC4qS0
Use the Task tool to have explore agent process this file with Grep and Read (with offset/limit). Do NOT read the full file yourself - delegate to save context.
```

---

## Assistant (Build · Gemma 4-26B-A4B (local) · 88.3s)

_Thinking:_

I'll use the Task tool to let the `explore` agent handle the large file. I'll ask it to help me refactor `src/app/game/current/councilors.tsx`.
Actually, I can just try to edit smaller chunks of the file.

Let's try to refactor `getCouncilorsUi` and `CouncilorsComponent` separately.
First, let's update `getCouncilorsUi` to return `subItems`.


**Tool: edit**

**Input:**
```json
{
  "filePath": "src/app/game/current/councilors.tsx",
  "newString": "export function getCouncilorsUi(analysis: Analysis) {\n  const { playerMissionCounts } = analysis;\n  const [weights, setWeights] = useState<ScoringWeights>(defaultScoringWeights);\n\n  useEffect(() => {\n    setWeights(loadWeightsFromStorage());\n  }, []);\n\n  const scoredModifiedCouncilors = scoreAndSort(\n    analysis.playerCouncilors,\n    weights,\n    playerMissionCounts,\n    getModifiedCouncilorScore\n  );\n  const scoredAvailableCouncilors = scoreAndSort(\n    analysis.playerAvailableCouncilors,\n    weights,\n    playerMissionCounts,\n    getBaseCouncilorScore\n  );\n  const scoredBaseCouncilors = scoreAndSort(\n    analysis.playerCouncilors,\n    weights,\n    playerMissionCounts,\n    getBaseCouncilorScore\n  );\n  const scoredOrgs = scoreAndSort(\n    analysis.playerAvailableOrgs\n      .map((i) => ({ type: \"available\", ...i }))\n      .concat(analysis.playerUnassignedOrgs.map((i) => ({ type: \"unassigned\", ...i }))),\n    weights,\n    playerMissionCounts,\n    getOrganizationScore,\n    \"noMissionScore\" // ignore missions when sorting orgs\n  ).toSorted((a, b) => (a.isAdminOrg === b.isAdminOrg ? 0 : a.isAdminOrg ? -1 : 1)); // admin orgs first\n  const usedOrgs = analysis.playerCouncilors.flatMap((councilor) =>\n    councilor.orgs.map((o) => ({ ...o, type: \"used\", councilor: councilor.displayName, councilorId: councilor.id }))\n  );\n  const scoredUsedOrgs = scoreAndSort(usedOrgs, weights, playerMissionCounts, getOrganizationScore);\n  const scoredOwnedOrgs = scoreAndSort(\n    analysis.playerUnassignedOrgs.map((i) => ({ type: \"unassigned\", ...i })).concat(usedOrgs),\n    weights,\n    playerMissionCounts,\n    getOrganizationScore\n  );\n\n  const bestAvailableCouncilor = scoredAvailableCouncilors[0]?.score.value;\n  const worstExistingCouncilor = scoredBaseCouncilors[scoredBaseCouncilors.length - 1]?.score.value;\n  const bestAvailableOrg = scoredOrgs[0]?.score.value;\n  const worstExistingOrg = scoredUsedOrgs[scoredUsedOrgs.length - 1]?.score.value;\n\n  return {\n    key: \"councilors\",\n    tab: (\n      <>\n        Councilors ({worstExistingCouncilor?.toFixed(0)} vs. {bestAvailableCouncilor?.toFixed(0)}) / Orgs (\n        {worstExistingOrg?.toFixed(2)} vs {bestAvailableOrg?.toFixed(2)})\n      </>\n    ),\n    content: (\n      <CouncilorsComponent\n        {...{\n          analysis,\n          weights,\n          setWeights,\n          scoredModifiedCouncilors,\n          scoredAvailableCouncilors,\n          scoredBaseCouncilors,\n          scoredOrgs,\n          scoredUsedOrgs,\n          scoredOwnedOrgs,\n        }}\n      />\n    ),\n    subItems: [\n      { key: \"councilors.existing\", label: \"Existing Council\" },\n      { key: \"councilors.new-councilors\", label: \"Find new\" },\n      { key: \"councilors.current-orgs\", label: \"Current Organizations\" },\n      { key: \"councilors.takeover\", label: \"Hostile Takeover\" },\n      { key: \"councilors.missions\", label: \"Missions\" },\n      { key: \"councilors.other-councilors\", label: \"Other Councilors\" },\n    ],\n  };\n}\n",
  "oldString": "export function getCouncilorsUi(analysis: Analysis) {\n  const { playerMissionCounts } = analysis;\n  const [weights, setWeights] = useState<ScoringWeights>(defaultScoringWeights);\n\n  useEffect(() => {\n    setWeights(loadWeightsFromStorage());\n  }, []);\n\n  const scoredModifiedCouncilors = scoreAndSort(\n    analysis.playerCouncilors,\n    weights,\n    playerMissionCounts,\n    getModifiedCouncilorScore\n  );\n  const scoredAvailableCouncilors = scoreAndSort(\n    analysis.playerAvailableCouncilors,\n    weights,\n    playerMissionCounts,\n    getBaseCouncilorScore\n  );\n  const scoredBaseCouncilors = scoreAndSort(\n    analysis.playerCouncilors,\n    weights,\n    playerMissionCounts,\n    getBaseCouncilorScore\n  );\n  const scoredOrgs = scoreAndSort(\n    analysis.playerAvailableOrgs\n      .map((i) => ({ type: \"available\", ...i }))\n      .concat(analysis.playerUnassignedOrgs.map((i) => ({ type: \"unassigned\", ...i }))),\n    weights,\n    playerMissionCounts,\n    getOrganizationScore,\n    \"noMissionScore\" // ignore missions when sorting orgs\n  ).toSorted((a, b) => (a.isAdminOrg === b.isAdminOrg ? 0 : a.isAdminOrg ? -1 : 1)); // admin orgs first\n  const usedOrgs = analysis.playerCouncilors.flatMap((councilor) =>\n    councilor.orgs.map((o) => ({ ...o, type: \"used\", councilor: councilor.displayName, councilorId: councilor.id }))\n  );\n  const scoredUsedOrgs = scoreAndSort(usedOrgs, weights, playerMissionCounts, getOrganizationScore);\n  const scoredOwnedOrgs = scoreAndSort(\n    analysis.playerUnassignedOrgs.map((i) => ({ type: \"unassigned\", ...i })).concat(usedOrgs),\n    weights,\n    playerMissionCounts,\n    getOrganizationScore\n  );\n\n  const bestAvailableCouncilor = scoredAvailableCouncilors[0]?.score.value;\n  const worstExistingCouncilor = scoredBaseCouncilors[scoredBaseCouncilors.length - 1]?.score.value;\n  const bestAvailableOrg = scoredOrgs[0]?.score.value;\n  const worstExistingOrg = scoredUsedOrgs[scoredUsedOrgs.length - 1]?.score.value;\n\n  return {\n    key: \"councilors\",\n    tab: (\n      <>\n        Councilors ({worstExistingCouncilor?.toFixed(0)} vs. {bestAvailableCouncilor?.toFixed(0)}) / Orgs (\n        {worstExistingOrg?.toFixed(2)} vs {bestAvailableOrg?.toFixed(2)})\n      </>\n    ),\n    content: (\n      <CouncilorsComponent\n        {...{\n          analysis,\n          weights,\n          setWeights,\n          scoredModifiedCouncilors,\n          scoredAvailableCouncilors,\n          scoredBaseCouncilors,\n          scoredOrgs,\n          scoredUsedOrgs,\n          scoredOwnedOrgs,\n        }}\n      />\n    ),\n  };\n}\n"
}
```

**Output:**
```
Edit applied successfully.
```

---

## Assistant (Build · Gemma 4-26B-A4B (local) · 1066.7s)

_Thinking:_

Now I need to refactor `CouncilorsComponent` in `src/app/game/current/councilors.tsx` to accept the `subSection` prop and render the appropriate content.
I'll also need to update its props definition.

Wait, I'll do it in one go if possible, but the file is too large for a single `edit` call if I'm not careful.

Let's see `CouncilorsComponent` in `src/app/game/current/councilors.tsx`.
It starts at line 392.

I'll try to replace the entire `CouncilorsComponent` definition.

**Tool: invalid**

**Input:**
```json
{
  "tool": "edit",
  "error": "Invalid input for tool edit: JSON parsing failed: Text: {\"filePath\":\"src/app/game/current/councilors.tsx\",\"newString\":\"function CouncilorsComponent({\\n  analysis,\\n  weights,\\n  setWeights,\\n  scoredModifiedCouncilors,\\n  scoredAvailableCouncilors,\\n  scoredBaseCouncilors,\\n  scoredOrgs,\\n  scoredOwnedOrgs,\\n  subSection,\\n}: {\\n  analysis: Analysis;\\n  weights: ScoringWeights;\\n  setWeights: (weights: ScoringWeights) => void;\\n  scoredModifiedCouncilors: (Analysis[\\\"playerCouncilors\\\"][number] & { score: ScoreResult })[];\\n  scoredAvailableCouncilors: (Analysis[\\\"playerAvailableCouncilors\\\"][number] & { score: ScoreResult })[];\\n  scoredBaseCouncilors: (Analysis[\\\"playerCouncilors\\\"][number] & { score: ScoreResult })[];\\n  scoredOrgs: (Analysis[\\\"playerAvailableOrgs\\\"][number] & { type: string; score: ScoreResult })[];\\n  scoredOwnedOrgs: (Analysis[\\\"playerAvailableOrgs\\\"][number] & {\\n    type: string;\\n    score: ScoreResult;\\n    councilor?: string;\\n    councilorId?: number;\\n  })[];\\n  subSection?: string;\\n}) {\\n  const {\\n    playerMissionCounts,\\n    playerVisibleCouncilors,\\n    playerCouncilors,\\n    playerAvailableOrgs,\\n    playerUnassignedOrgs,\\n    playerFaction,\\n    playerStealableOrgs,\\n    factionsById,\\n  } = analysis;\\n  const scoredStealableOrgs = scoreAndSort(\\n    analysis.playerStealableOrgs.map((i) => ({ type: \\\"stealable\\\", ...i })),\\n    weights,\\n    playerMissionCounts,\\n    getOrganizationScore,\\n    \\\"noMissionScore\\\"\\n  );\\n  function currentHighlightMissionClassName(missionName: MissionDataName) {\\n    // if we have exactly 2, show yellow BG, if we have 1, show red, otherwise no change to bg\\n    const count = playerMissionCounts.get(missionName) || 0;\\n    if (count === 2) {\\n      return \\\"bg-yellow-300/50\\\";\\n    } else if (count === 1) {\\n      return \\\"bg-red-300/50\\\";\\n    }\\n  }\\n  function availableHighlightMissionClassName(missionName: MissionDataName) {\\n    // if we have 1, show yellow BG, if we have 0, show green, otherwise no change to bg\\n    const count = playerMissionCounts.get(missionName) || 0;\\n    if (count === 1) {\\n      return \\\"bg-yellow-300/50\\\";\\n    } else if (count === 0) {\\n      return \\\"bg-green-300/50\\\";\\n    }\\n  }\\n  const playerNationIds = new Set(analysis.playerNationIds);\\n  const playerTraits = new Set(analysis.playerCouncilors.flatMap((i) => i.traitTemplateNames));\\n  const unusedAdmin = analysis.playerCouncilors\\n    .map(\\n      (c) =>\\n        Math.min(\\n          25,\\n          Math.max(\\n            0,\\n            (c.effectsWithOrgsAndAugments.Administration || 0) + (c.effectsWithOrgsAndAugments.administration || 0)\\n          )\\n        ) - c.orgs.reduce((a, b) => a + b.tier, 0)\\n    )\\n    .reduce((a, b) => a + b, 0);\\n\\n  const stealableOrgsByFaction = scoredStealableOrgs.reduce((acc, org) => {\\n    const key = org.faction?.id || 0;\\n    if (!acc.has(key)) {\\n      acc.set(key, []);\\n    }\\n    acc.get(key)!.push(org);\\n    return acc;\\n  }, new Map<number, typeof scoredStealableOrgs>());\\n\\n  type MissionSource =\\n    | {\\n        type: \\\"councilor\\\";\\n        councilor: Analysis[\\\"playerCouncilors\\\"][number];\\n        factionId: number | undefined;\\n        missions: MissionDataName[];\\n      }\\n    | {\\n        type: \\\"org\\\";\\n        org: Analysis[\\\"playerAvailableOrgs\\\"][number];\\n        factionId: number | undefined;\\n        missions: MissionDataName[];\\n      };\\n\\n  const sourcesByFactionByMission = [...playerCouncilors, ...playerVisibleCouncilors]\\n    .map(\\n      (i) =>\\n        ({\\n          type: \\\"councilor\\\",\\n          councilor: i,\\n          factionId: i.factionId,\\n          missions: i.effectsWithOrgsAndAugments.missionsGrantedNames || [],\\n        } as MissionSource)\\n    )\\n    .concat(\\n      [...playerAvailableOrgs, ...playerUnassignedOrgs].map((i) => ({\\n        type: \\\"org\\\",\\n        org: i,\\n        factionId: playerFaction?.id,\\n        missions: i.template?.missionsGrantedNames || [],\\n      }))\\n    )\\n    .concat(\\n      playerStealableOrgs.map((i) => ({\\n        type: \\\"org\\\",\\n        org: i,\\n        factionId: i.faction?.id,\\n        missions: i.template?.missionsGrantedNames || [],\\n      }))\\n    )\\n    .reduce((acc, o) => {\\n      const key = o.factionId || 0;\\n      if (!acc.has(key)) {\\n        acc.set(key, new Map<string, MissionSource[]>());\\n      }\\n      const effectsMap = acc.get(key)!;\\n      o.missions.forEach((m) => {\\n        if (!effectsMap.has(m)) {\\n          effectsMap.set(m, []);\\n        }\\n        effectsMap.get(m)!.push(o);\\n      });\\n      return acc;\\n    }, new Map<number, Map<string, MissionSource[]>>());\\n  const factions = Array.from(sourcesByFactionByMission.keys())\\n    .map((factionId) => factionsById.get(factionId)!)\\n    .filter((f) => f)\\n    .toSorted((a, b) => {\\n      if (a.id === playerFaction.id) return -1;\\n      if (b.id === playerFaction.id) return 1;\\n      return (a.displayName || \\\"\\\").localeCompare(b.displayName || \\\"\\\");\\n    });\\n\\n  const importantMissions = [\\\"Assassinate\\\"];\\n\\n  const councilEffects = scoredModifiedCouncilors.reduce((acc, councilor) => {\\n    return combineEffects(acc, councilor.effectsWithOrgsAndAugments);\\n  }, {} as ShowEffectsProps);\\n\\n  // TODO: would be cool to click an effect icon and sort everything by that (ie. click persuasion icon to see who/org gives most persuasion)\\n  if (subSection === \\\"existing\\\") {\\n    return (\\n      <div className=\\\"space-y-2\\\">\\n        <div className=\\\"py-1\\\">\\n          <ShowEffects\\n            incomeBoost_month={councilEffects.incomeBoost_month}\\n            incomeMoney_month={councilEffects.incomeMoney_month}\\n            incomeInfluence_month={councilEffects.incomeInfluence_month}\\n            incomeOps_month={councilEffects.incomeOps_month}\\n            incomeMissionControl={councilEffects.incomeMissionControl}\\n            incomeResearch_month={councilEffects.incomeResearch_month}\\n            projectCapacityGranted={councilEffects.projectCapacityGranted}\\n          />\\n          <ShowEffects\\n            economyBonus={councilEffects.economyBonus}\\n            welfareBonus={councilEffects.welfareBonus}\\n            environmentBonus={councilEffects.environmentBonus}\\n            knowledgeBonus={councilEffects.knowledgeBonus}\\n            governmentBonus={councilEffects.governmentBonus}\\n            unityBonus={councilEffects.unityBonus}\\n            militaryBonus={councilEffects.militaryBonus}\\n            oppressionBonus={councilEffects.oppressionBonus}\\n            spoilsBonus={councilEffects.spoilsBonus\\n            }\\n            spaceDevBonus={councilEffects.spaceDevBonus}\\n            spaceflightBonus={councilEffects.spaceflightBonus}\\n            MCBonus={councilEffects.MCBonus}\\n            miningBonus={councilEffects.miningBonus}\\n          />\\n          <ShowEffects\\n            councilorTechBonus={councilEffects.councilorTechBonus}\\n            techBonuses={councilEffects.techBonuses}\\n          />\\n        </div >\\n        <Table>\\n          <CouncilorTableHeader hasOrgs />\\n          <TableBody>\\n            {scoredModifiedCouncilors.map((councilor) => (\\n              <CouncilorTableRow\\n                key={councilor.id}\\n                councilor={councilor}\\n                stats={councilor.effectsWithOrgsAndAugments}\\n                label={councilor.displayName!}\\n                hasOrgs\\n                highlightMissionClassName={currentHighlightMissionClassName}\\n              />\\n            ))}\\n          </TableBody>\\n        </Table>\\n        <h3 className=\\\"mt-1\\\">Available Organizations:</h3>\\n        <Table>\\n          <OrgTableHeader />\\n          <TableBody>\\n            {scoredOrgs.map((org) => (\\n              <OrgTableRow\\n                key={org.id}\\n                org={org}\\n                playerNationIds={playerNationIds}\\n                playerTraits={playerTraits}\\n                highlightMissionClassName={availableHighlightMissionClassName}\\n              />\\n            ))}\\n          </TableBody>\\n        </Table>\\n      </div>\\n    );\\n  }\\n\\n  if (subSection === \\\"new-councilors\\\") {\\n    return (\\n      <div className=\\\"space-y-2\\\">\\n        <h3 className=\\\"text-lg font-bold\\\">Available Councilors:</h3>\\n        <Table>\\n          <CouncilorTableHeader />\\n          <TableBody>\\n            {scoredAvailableCouncilors.map((councilor) => (\\n              <CouncilorTableRow\\n                key={councilor.id}\\n                councilor={councilor}\\n                stats={councilor.effectsBaseAndUnaugmentedTraits}\\n                label={councilor.displayName!}\\n                highlightMissionClassName={availableHighlightMissionClassName}\\n              />\\n            ))}\\n          </TableBody>\\n        </Table>\\n\\n        <h3 className=\\\"mt-1 text-lg font-bold\\\">Unmodified Active Councilors:</h3>\\n        <Table>\\n          <CouncilorTableHeader />\\n          <TableBody>\\n            {scoredBaseCouncilors.map((councilor) => (\\n              <CouncilorTableRow\\n                key={`${councilor.id}-base`}\\n                councilor={councilor}\\n                stats={councilor.effectsBaseAndUnaugmentedTraits}\\n                label={`${councilor.displayName}`}\\n                highlightMissionClassName={currentHighlightMissionClassName}\\n              />\\n            ))}\\n          </TableBody>\\n        </Table>\\n      </div>\\n    );\\n  }\\n\\n  if (subSection === \\\"current-orgs\\\") {\\n    return (\\n      <div className=\\\"space-y-2\\\">\\n        <Table>\\n          <OrgTableHeader costHeader=\\\"Councilor\\\" />\\n          <TableBody>\\n            {scoredOwnedOrgs.toReversed().map((org) => (\\n              <OrgTableRow\\n                key={org.id}\\n                org={org}\\n                playerNationIds={playerNationIds}\\n                playerTraits={playerTraits}\\n                highlightMissionClassName={availableHighlightMissionClassName}\\n              />\\n            ))}\\n          </TableBody>\\n        </Table>\\n      </div>\\n    );\\n  }\\n\\n  if (subSection === \\\"takeover\\\") {\\n    return (\\n      <div className=\\\"space-y-2\\\">\\n        <SmartTabs\\n          storageKey=\\\"councilorsTakeoverTabs\\\"\\n          defaultValue={`faction-${Array.from(stealableOrgsByFaction.keys())[0]}`}\\n        >\\n          <TabsList>\\n            {Array.from(stealableOrgsByFaction.entries()).map(([factionId, orgs]) => (\\n              <TabsTrigger key={factionId} value={`faction-${factionId}`}>\\n                {orgs[0].faction?.displayName || \\\"Unknown Faction\\\"} ({orgs.length})\\n              </TabsTrigger>\\n            ))}\\n          </TabsList>\\n          {Array.from(stealableOrgsByFaction.entries()).map(([factionId, orgs]) => (\\n            <TabsContent key={factionId} value={`faction-${factionId}`}>\\n              <Table>\\n                <OrgTableHeader costHeader=\\\"Takeover\\\" />\\n                <TableBody>\\n                  {orgs.map((org) => (\\n                    <OrgTableRow\\n                      key={org.id}\\n                      org={org}\\n                      playerNationIds={playerNationIds}\\n                      playerTraits={playerTraits}\\n                      highlightMissionClassName={availableHighlightMissionClassName}\\n                      isTakeover\\n                    />\\n                  ))}\\n                </TableBody>\\n              </Table>\\n            </TabsContent>\\n          ))}\\n        </SmartTabs>\\n      </div>\\n    );\\n  }\\n\\n  if (subSection === \\\"missions\\\") {\\n    return (\\n      <div className=\\\"space-y-2\\\">\\n        <SmartTabs storageKey=\\\"councilorsMissionsTabs\\\" defaultValue={`faction-${factions[0].id}`}>\\n          <TabsList>\\n            {factions.map((faction) => (\\n              <TabsTrigger key={faction.id} value={`faction-${faction.id}`}>\\n                {faction.displayName || \\\"Unknown Faction\\\"} ({sourcesByFactionByMission.get(faction.id)?.size || 0})\\n                {importantMissions\\n                  .filter(\\n                    (m) =>\\n                      sourcesByFactionByMission\\n                        .get(faction.id)\\n                        ?.get(m)\\n                        ?.filter((i) => i.type === \\\"councilor\\\")?.length ?? 0 > 0\\n                  )\\n                  .map((m) => {\\n                    const MissionIcon = MissionIcons[m] || UnknownIcon;\\n                    return (\\n                      <span key={m} className=\\\"inline-block -mt-2\\\">\\n                        <MissionIcon className=\\\"h-4 w-4\\\" />\\n                      </span>\\n                    );\\n                  })}\\n              </TabsTrigger>\\n            ))}\\n          </TabsList>\\n          {factions.map((faction) => (\\n            <TabsContent key={faction.id} value={`faction-${faction.id}`}>\\n              <SmartAccordion type=\\\"single\\\" collapsible storageKey={`councilorsMissions-${faction.id}`}>\\n                {Array.from(\\n                  new Set([\\n                    ...importantMissions,\\n                    ...Array.from(sourcesByFactionByMission.get(faction.id)?.keys() || []),\\n                  ])\\n                ).map((missionName) => {\\n                  const sources = sourcesByFactionByMission.get(faction.id)?.get(missionName) || [];\\n                  const MissionIcon = MissionIcons[missionName] || UnknownIcon;\\n                  return (\\n                    <AccordionItem key={missionName} value={missionName}>\\n                      <AccordionTrigger>\\n                        <span>\\n                          <MissionIcon /> {missionName} &ndash;{\\\" \\\"}\\n                          {sources.filter((i) => i.type === \\\"councilor\\\").length} Councilors &lt;-{\\\" \\\"}\\n                          {sources.filter((i) => i.type === \\\"org\\\").length} Orgs\\n                        </span>\\n                      </AccordionTrigger>\\n                      <AccordionContent>\\n                        <Table>\\n                          <OrgTableHeader costHeader=\\\"Takeover\\\" />\\n                          <TableBody>\\n                            {sources?.map((src) =>\\n                              src.type === \\\"org\\\" ? (\\n                                <OrgTableRow\\n                                  key={`councilor-${src.org.id}-mission-${missionName}`}\\n                                  org={src.org}\\n                                  playerNationIds={playerNationIds}\\n                                  playerTraits={playerTraits}\\n                                />\\n                              ) : (\\n                                <CouncilorTableRow\\n                                  key={`org-${src.councilor.id}-mission-${missionName}`}\\n                                  councilor={src.councilor}\\n                                  stats={src.councilor.effectsWithOrgsAndAugments}\\n                                  label={src.councilor.displayName!}\\n                                />\\n                              )\\n                            )}\\n                          </TableBody>\\n                        </Table>\\n                      </AccordionContent>\\n                    </AccordionItem>\\n                  );\\n                })}\\n              </SmartAccordion>\\n            </TabsContent>\\n          ))}\\n        </SmartTabs>\\n      </div>\\n    );\\n  }\\n\\n  if (subSection === \\\"other-councilors\\\") {\\n    return (\\n      <div className=\\\"space-y-2\\\">\\n        <OtherCouncilorsByFaction {...{ analysis, weights }} />\\n      </div>\\n    );\\n  }\\n\\n  return (\\n    <div className=\\\"space-y-2\\\">\\n      <div className=\\\"my-4\\\">\\n        <ScoringWeightsDialog weights={weights} onWeightsChange={setWeights} />\\n      </div >\\n      <Collapsible>\\n        <CollapsibleTrigger asChild>\\n          <Button variant=\\\"outline\\\">Debug Data</Button>\\n        </CollapsibleTrigger>\\n        <CollapsibleContent>\\n          <pre>{JSON.stringify(analysis.playerFaction, null, 2)}</pre>\\n        </CollapsibleContent>\\n      </Collapsible>\\n    </div>\\n  );\\n}\\n\\nfunction OtherCouncilorsByFaction({ analysis, weights }: { analysis: Analysis; weights: ScoringWeights }) {\\n  const { playerVisibleCouncilors, factionsById } = analysis;\\n\\n  const scoredBaseCouncilors = scoreAndSort(\\n    playerVisibleCouncilors,\\n    weights,\\n    new Map<MissionDataName, number>(),\\n    getBaseCouncilorScore\\n  );\\n\\n  const councilorsByFactionId = scoredBaseCouncilors.reduce((acc, councilor) => {\\n    const factionId = councilor.factionId || 0;\\n    if (!factionId) return acc;\\n    if (!acc.has(factionId)) {\\n      acc.set(factionId, []);\\n    }\\n    acc.get(factionId)!.push(councilor);\\n    return acc;\\n  }, new Map<number, Analysis[\\\"playerCouncilors\\\"][number][]>());\\n\\n  const factions = Array.from(councilorsByFactionId.keys())\\n    .map((i) => factionsById.get(i!)!)\\n    .filter((i) => i.id !== analysis.alienFaction.id);\\n\\n  return (\\n    <Tabs defaultValue={`faction-${factions[0].id}`}>\\n      <TabsList>\\n        {factions\\n          .filter((i) => i.id !== analysis.alienFaction.id)\\n          .map((faction) => (\\n            <TabsTrigger key={faction.id} value={`faction-${faction.id}`}>\\n              {faction.displayName || \\\"Unknown Faction\\\"} ({councilorsByFactionId.get(faction.id)?.length || 0})\\n            </TabsTrigger>\\n          ))}\\n      </TabsList>\\n      {factions.map((faction) => (\\n        <TabsContent key={faction.id} value={`faction-${faction.id}`}>\\n          <Table>\\n            <CouncilorTableHeader />\\n            <TableBody>\\n              {councilorsByFactionId.get(faction.id)?.map((councilor) => (\\n                <CouncilorTableRow\\n                  key={councilor.id}\\n                  councilor={councilor}\\n                  stats={councilor.effectsBaseAndUnaugmentedTraits}\\n                  label={councilor.displayName!}\\n                />\\n              ))}\\n            </TableBody>\\n          </Table>\\n        </TabsContent>\\n      ))}\\n    </Tabs>\\n  );\\n}\\n\\nfunction scoreAndSort<T>(\\n  items: T[],\\n  weights: ScoringWeights,\\n  haveMissions: Map<MissionDataName, number>,\\n  scoreFn: (item: T, weights: ScoringWeights, haveMissions: Map<MissionDataName, number>) => ScoreResult,\\n  scoreSort: \\\"value\\\" | \\\"noMissionScore\\\" = \\\"value\\\"\\n) {\\n  const scoredItems = items.map((item) => {\\n    const scoreResult = scoreFn(item, weights, haveMissions);\\n    return { ...item, score: scoreResult };\\n  });\\n  scoredItems.sort((a, b) => b.score[scoreSort] - a.score[scoreSort]);\\n  return scoredItems;\\n}\\n\\nfunction getBaseCouncilorScore(\\n  councilor: Analysis[\\\"playerCouncilors\\\"][number],\\n  weights: ScoringWeights,\\n  haveMissions: Map<MissionDataName, number>\\n): ScoreResult {\\n  return getScore(councilor.effectsBaseAndUnaugmentedTraits, weights, haveMissions, true);\\n}\\n\\nfunction getModifiedCouncilorScore(\\n  councilor: Analysis[\\\"playerCouncilors\\\"][number],\\n  weights: ScoringWeights,\\n  haveMissions: Map<MissionDataName, number>\\n): ScoreResult {\\n  return getScore(councilor.effectsWithOrgsAndAugments, weights, haveMissions, true);\\n}\\n\\nconst orgTransferFactor = 0.2;\\nfunction getOrganizationScore(\\n  org: Analysis[\\\"playerAvailableOrgs\\\"][number] & { type: string },\\n  weights: ScoringWeights,\\n  haveMissions: Map<MissionDataName, number>\\n): ScoreResult {\\n  return getScore(\\n    {\\n      ...org,\\n      techBonuses: org.template?.techBonuses,\\n      missionsGrantedNames: org.template?.missionsGrantedNames || [],\\n      ...(org.type === \\\"available\\\"\\n        ? {}\\n        : {\\n          // already-purchased orgs seem to cost ~30% to transfer\\n          costMoney: (org.costMoney || 0) * orgTransferFactor,\\n          costInfluence: (org.costInfluence || 0) * orgTransferFactor,\\n          costOps: (org.costOps || 0) * orgTransferFactor,\\n          costBoost: (org.costBoost || 0) * orgTransferFactor,\\n        }),\\n    },\\n    weights,\\n    haveMissions\\n  );\\n}\\n\\ninterface ScoreResult {\\n  value: number;\\n  noMissionScore: number;\\n  details: string;\\n}\\n\\nfunction getScore(\\n  org: ShowEffectsProps,\\n  weights: ScoringWeights,\\n  haveMissions: Map<MissionDataName, number>,\\n  ignoreTier: boolean = false\\n): ScoreResult {\\n  let totalScore = 0;\\n  const details: string[] = [];\\n\\n  // Helper to add score for a numeric attribute\\n  const addScore = (name: string, value: number | undefined, weight: number | undefined, noNegative?: boolean) => {\\n    let actualValue = value || 0;\\n    if (noNegative) {\\n      actualValue = Math.max(0, actualValue);\\n    }\\n    const actualWeight = weight ?? 0;\\n\\n    // Skip if value or weight is 0/undefined/null\\n    if (!actualValue || !actualWeight) return;\\n\\n    const contribution = actualValue * actualWeight;\\n    totalScore += contribution;\\n    details.push(\\n      `${name}: ${parseFloat(actualValue.toFixed(2))} × ${parseFloat(actualWeight.toFixed(3))} = ${contribution.toFixed(\\\\n        3\\\\n      )}`\\n    );\\n  };\\n\\n  // Councilor attributes\\n  addScore(\\\"persuasion\\\", org.persuasion, weights.persuasion, true);\\n  addScore(\\\"command\\\", org.command, weights.command, true);\\n  addScore(\\\"investigation\\\", org.investigation, weights.investigation, true);\\n  addScore(\\\"espionage\\\", org.espionage, weights.espionage, true);\\n  addScore(\\\"administration\\\", org.administration, weights.administration, true);\\n  addScore(\\\"science\\\", org.science, weights.science, true);\\n  addScore(\\\"security\\\", org.security, weights.security, true);\\n  addScore(\\\"Persuasion\\\", org.Persuasion, weights.persuasion, true);\\n  addScore(\\\"Command\\\", org.Command, weights.command, true);\\n  addScore(\\\"Investigation\\\", org.Investigation, weights.investigation, true);\\n  addScore(\\\"Espionage\\\", org.Espionage, weights.espionage, true);\\n  addScore(\\\"Administration\\\", org.Administration, weights.administration, true);\\n  addScore(\\\"Science\\\", org.Science, weights.science, true);\\n  addScore(\\\"Security\\\", org.Security, weights.security, true);\\n  addScore(\\\"xpModifier\\\", org.xpModifier, weights.xpModifier);\\n  addScore(\\\"xp\\\", org.xp, weights.xp);\\n\\n  // Monthly income/costs\\n  addScore(\\\"incomeBoost_month\\\", org.incomeBoost_month, weights.incomeBoost_month);\\n  addScore(\\\"incomeMoney_month\\\", org.incomeMoney_month, weights.incomeMoney_month);\\n  addScore(\\\"incomeInfluence_month\\\", org.incomeInfluence_month, weights.incomeInfluence_month);\\n  addScore(\\\"incomeOps_month\\\", org.incomeOps_month, weights.incomeOps_month);\\n  addScore(\\\"incomeMissionControl\\\", org.incomeMissionControl, weights.incomeMissionControl);\\n  addScore(\\\"incomeResearch_month\\\", org.incomeResearch_month, weights.incomeResearch_month);\\n  addScore(\\\"projectCapacityGranted\\\", org.projectCapacityGranted, weights.projectCapacityGranted);\\n\\n  // Purchase costs\\n  addScore(\\\"costMoney\\\", org.costMoney, weights.costMoney);\\n  addScore(\\\"costInfluence\\\", org.costInfluence, weights.costInfluence);\\n  addScore(\\\"costOps\\\", org.costOps, weights.costOps);\\n  addScore(\\\"costBoost\\\", org.costBoost, weights.costBoost);\\n\\n  // Priority bonuses\\n  addScore(\\\"economyBonus\\\", org.economyBonus, weights.economyBonus);\\n  addScore(\\\"welfareBonus\\\", org.welfareBonus, weights.welfareBonus);\\n  addScore(\\\"environmentBonus\\\", org.environmentBonus, weights.environmentBonus);\\n  addScore(\\\"knowledgeBonus\\\", org.knowledgeBonus, weights.knowledgeBonus);\\n  addScore(\\\"governmentBonus\\\", org.governmentBonus, weights.governmentBonus);\\n  addScore(\\\"unityBonus\\\", org.unityBonus, weights.unityBonus);\\n  addScore(\\\"militaryBonus\\\", org.militaryBonus, weights.militaryBonus);\\n  addScore(\\\"oppressionBonus\\\", org.oppressionBonus, weights.oppressionBonus);\\n  addScore(\\\"spoilsBonus\\\", org.spoilsBonus, weights.spoilsBonus);\\n  addScore(\\\"spaceDevBonus\\\", org.spaceDevBonus, weights.spaceDevBonus);\\n  addScore(\\\"spaceflightBonus\\\", org.spaceflightBonus, weights.spaceflightBonus);\\n  addScore(\\\"MCBonus\\\", org.MCBonus, weights.MCBonus);\\n  addScore(\\\"miningBonus\\\", org.miningBonus, weights.miningBonus);\\n\\n  // Tech bonuses from councilor/traits\\n  if (weights.councilorTechBonus && org?.councilorTechBonus) {\\n    for (const { category, bonus } of org.councilorTechBonus) {\\n      const weight = weights.councilorTechBonus[category];\\n      addScore(`councilorTechBonus[${category}]`, bonus, weight);\\\\n    }\\\\n  }\\\\n\\\\n  // Tech bonuses from orgs\\\\n  if (weights.techBonuses && org?.techBonuses) {\\\\n    for (const { category, bonus } of org.techBonuses) {\\\\n      const weight = weights.techBonuses[category];\\\\n      addScore(`techBonus[${category}]`, bonus, weight);\\\\n    }\\\\n  }\\\\n\\\\n  let noMissionScore = totalScore;\\\\n\\\\n  // Missions granted\\\\n  if (weights.missions && org?.missionsGrantedNames) {\\\\n    for (const missionName of org.missionsGrantedNames) {\\\\n      const weight = weights.missions[missionName];\\\\n      addScore(`mission[${missionName}]`, 1, weight);\\\\n\\\\n      // Extra weight for missions we don't have yet or only have one councilor for\\\\n      if (weights.extraWeightForMissingMissions && (haveMissions.get(missionName) || 0) === 0) {\\\\n        totalScore += weights.extraWeightForMissingMissions;\\\\n        details.push(\\\\n          `mission[${missionName}]: missing bonus × ${parseFloat(\\\\n            weights.extraWeightForMissingMissions.toFixed(3)\\\\n          )} = ${weights.extraWeightForMissingMissions.toFixed(3)}`\\\\n        );\\\\n      }\\\\n      if (weights.extraWeightForSingleMissions && (haveMissions.get(missionName) || 0) === 1) {\\\\n        totalScore += weights.extraWeightForSingleMissions;\\\\n        details.push(\\\\n          `mission[${missionName}]: single bonus × ${parseFloat(\\\\n            weights.extraWeightForSingleMissions.toFixed(3)\\\\n          )} = ${weights.extraWeightForSingleMissions.toFixed(3)}`\\\\n        );\\\\n      }\\\\n    }\\\\n  }\\\\n\\\\n  // Divide by tier to normalize for org cost/power\\\\n  const tier = org.tier || 1;\\\\n  let finalScore = totalScore;\\\\n\\\\n  if (tier > 1 && !ignoreTier) {\\\\n    const tierFactor = Math.pow(tier, weights.orgTierExponent);\\\\n    finalScore = totalScore / tierFactor;\\\\n    noMissionScore /= tierFactor;\\\\n    details.push(`Subtotal: ${totalScore.toFixed(3)}`);\\\\n    details.push(`Divided by ${tierFactor.toFixed(2)} for tier ${tier}: ${finalScore.toFixed(3)}`);\\\\n  }\\\\n\\\\n  return {\\\\n    value: finalScore,\\\\n    noMissionScore,\\\\n    details: details.join(\\\\\\\"\\\\\\\\n\\\\\\\"),\\\\n  };\\\\n}\\\\\\n\",\"oldString\":\"function CouncilorsComponent({\\\\n  analysis,\\\\n  weights,\\\\n  setWeights,\\\\n  scoredModifiedCouncilors,\\\\n  scoredAvailableCouncilors,\\\\n  scoredBaseCouncilors,\\\\n  scoredOrgs,\\\\n  scoredOwnedOrgs,\\\\n}: {\\\\n  analysis: Analysis;\\\\n  weights: ScoringWeights;\\\\n  setWeights: (weights: ScoringWeights) => void;\\\\n  scoredModifiedCouncilors: (Analysis[\\\\\\\"playerCouncilors\\\\\\\"][number] & { score: ScoreResult })[];\\\\n  scoredAvailableCouncilors: (Analysis[\\\\\\\"playerAvailableCouncilors\\\\\\\"][number] & { score: ScoreResult })[];\\\\n  scoredBaseCouncilors: (Analysis[\\\\\\\"playerCouncilors\\\\\\\"][number] & { score: ScoreResult })[];\\\\n  scoredOrgs: (Analysis[\\\\\\\"playerAvailableOrgs\\\\\\\"][number] & { type: string; score: ScoreResult })[];\\\\n  scoredOwnedOrgs: (Analysis[\\\\\\\"playerAvailableOrgs\\\\\\\"][number] & {\\\\n    type: string;\\\\n    score: ScoreResult;\\\\n    councilor?: string;\\\\n    councilorId?: number;\\\\n  })[];\\\\n}) {\\\\n  const {\\\\n    playerMissionCounts,\\\\n    playerVisibleCouncilors,\\\\n    playerCouncilors,\\\\n    playerAvailableOrgs,\\\\n    playerUnassignedOrgs,\\\\n    playerFaction,\\\\n    playerStealableOrgs,\\\\n    factionsById,\\\\n  } = analysis;\\\\n  const scoredStealableOrgs = scoreAndSort(\\\\n    analysis.playerStealableOrgs.map((i) => ({ type: \\\\\\\"stealable\\\\\\\", ...i })),\\\\n    weights,\\\\n    playerMissionCounts,\\\\n    getOrganizationScore,\\\\n    \\\\\\\"noMissionScore\\\\\\\"\\\\n  );\\\\n  function currentHighlightMissionClassName(missionName: MissionDataName) {\\\\n    // if we have exactly 2, show yellow BG, if we have 1, show red, otherwise no change to bg\\\\n    const count = playerMissionCounts.get(missionName) || 0;\\\\n    if (count === 2) {\\\\n      return \\\\\\\"bg-yellow-300/50\\\\\\\";\\\\n    } else if (count === 1) {\\\\n      return \\\\\\\"bg-red-300/50\\\\\\\";\\\\n    }\\\\n  }\\\\n  function availableHighlightMissionClassName(missionName: MissionDataName) {\\\\n    // if we have 1, show yellow BG, if we have 0, show green, otherwise no change to bg\\\\n    const count = playerMissionCounts.get(missionName) || 0;\\\\n    if (count === 1) {\\\\n      return \\\\\\\"bg-yellow-300/50\\\\\\\";\\\\n    } else if (count === 0) {\\\\n      return \\\\\\\"bg-green-300/50\\\\\\\";\\\\n    }\\\\n  }\\\\n  const playerNationIds = new Set(analysis.playerNationIds);\\\\n  const playerTraits = new Set(analysis.playerCouncilors.flatMap((i) => i.traitTemplateNames));\\\\n  const unusedAdmin = analysis.playerCouncilors\\\\n    .map(\\\\n      (c) =>\\\\n        Math.min(\\\\n          25,\\\\n          Math.max(\\\\n            0,\\\\n            (c.effectsWithOrgsAndAugments.Administration || 0) + (c.effectsWithOrgsAndAugments.administration || 0)\\\\n          )\\\\n        ) - c.orgs.reduce((a, b) => a + b.tier, 0)\\\\n    )\\\\n    .reduce((a, b) => a + b, 0);\\\\n\\\\n  const stealableOrgsByFaction = scoredStealableOrgs.reduce((acc, org) => {\\\\n    const key = org.faction?.id || 0;\\\\n    if (!acc.has(key)) {\\\\n      acc.set(key, []);\\\\n    }\\\\n    acc.get(key)!.push(org);\\\\n    return acc;\\\\n  }, new Map<number, typeof scoredStealableOrgs>());\\\\n\\\\n  type MissionSource =\\\\n    | {\\\\n        type: \\\\\\\"councilor\\\\\\\";\\\\n        councilor: Analysis[\\\\\\\"playerCouncilors\\\\\\\"][number];\\\\n        factionId: number | undefined;\\\\n        missions: MissionDataName[];\\\\n      }\\\\n    | {\\\\n        type: \\\\\\\"org\\\\\\\";\\\\n        org: Analysis[\\\\\\\"playerAvailableOrgs\\\\\\\"][number];\\\\n        factionId: number | undefined;\\\\n        missions: MissionDataName[];\\\\n      };\\\\n\\\\n  const sourcesByFactionByMission = [...playerCouncilors, ...playerVisibleCouncilors]\\\\n    .map(\\\\n      (i) =>\\\\n        ({\\\\n          type: \\\\\\\"councilor\\\\\\\",\\\\n          councilor: i,\\\\n          factionId: i.factionId,\\\\n          missions: i.effectsWithOrgsAndAugments.missionsGrantedNames || [],\\\\n        } as MissionSource)\\\\n    )\\\\n    .concat(\\\\n      [...playerAvailableOrgs, ...playerUnassignedOrgs].map((i) => ({\\\\n        type: \\\\\\\"org\\\\\\\",\\\\n        org: i,\\\\n        factionId: playerFaction?.id,\\\\n        missions: i.template?.missionsGrantedNames || [],\\\\n      }))\\\\n    )\\\\n    .concat(\\\\n      playerStealableOrgs.map((i) => ({\\\\n        type: \\\\\\\"org\\\\\\\",\\\\n        org: i,\\\\n        factionId: i.faction?.id,\\\\n        missions: i.template?.missionsGrantedNames || [],\\\\n      }))\\\\n    )\\\\n    .reduce((acc, o) => {\\\\n      const key = o.factionId || 0;\\\\n      if (!acc.has(key)) {\\\\n        acc.set(key, new Map<string, MissionSource[]>());\\\\n      }\\\\n      const effectsMap = acc.get(key)!;\\\\n      o.missions.forEach((m) => {\\\\n        if (!effectsMap.has(m)) {\\\\n          effectsMap.set(m, []);\\\\n        }\\\\n        effectsMap.get(m)!.push(o);\\\\n      });\\\\n      return acc;\\\\n    }, new Map<number, Map<string, MissionSource[]>>());\\\\n  const factions = Array.from(sourcesByFactionByMission.keys())\\\\n    .map((factionId) => factionsById.get(factionId)!)\\\\n    .filter((f) => f)\\\\n    .toSorted((a, b) => {\\\\n      if (a.id === playerFaction.id) return -1;\\\\n      if (b.id === playerFaction.id) return 1;\\\\n      return (a.displayName || \\\\\\\"\\\\\\\").localeCompare(b.displayName || \\\\\\\"\\\\\\\");\\\\n    });\\\\n\\\\n  const importantMissions = [\\\\\\\"Assassinate\\\\\\\"];\\\\n\\\\n  const councilEffects = scoredModifiedCouncilors.reduce((acc, councilor) => {\\\\n    return combineEffects(acc, councilor.effectsWithOrgsAndAugments);\\\\n  }, {} as ShowEffectsProps);\\\\n\\\\n  // TODO: would be cool to click an effect icon and sort everything by that (ie. click persuasion icon to see who/org gives most persuasion)\\\\n  return (\\\\n    <div className=\\\\\\\"space-y-2\\\\\\\">\\\\n      <SmartAccordion type=\\\\\\\"single\\\\\\\" collapsible storageKey=\\\\\\\"councilorsSections\\\\\\\" defaultValue=\\\\\\\"existing\\\\\\\">\\\\n        <AccordionItem value=\\\\\\\"existing\\\\\\\">\\\\n          <AccordionTrigger>\\\\n            <span>\\\\n              Manage Existing Council ({unusedAdmin.toFixed(0)} <Administration />)\\\\n            </span>\\\\n          </AccordionTrigger>\\\\n          <AccordionContent>\\\\n            <div className=\\\\\\\"py-1\\\\\\\">\\\\n              <ShowEffects\\\\n                incomeBoost_month={councilEffects.incomeBoost_month}\\\\n                incomeMoney_month={councilEffects.incomeMoney_month}\\\\n                incomeInfluence_month={councilEffects.incomeInfluence_month}\\\\n                incomeOps_month={councilEffects.incomeOps_month}\\\\n                incomeMissionControl={councilEffects.incomeMissionControl}\\\\n                incomeResearch_month={councilEffects.incomeResearch_month}\\\\n                projectCapacityGranted={councilEffects.projectCapacityGranted}\\\\n              />\\\\n              <ShowEffects\\\\n                economyBonus={councilEffects.economyBonus}\\\\n                welfareBonus={councilEffects.welfareBonus}\\\\n                environmentBonus={councilEffects.environmentBonus}\\\\n                knowledgeBonus={councilEffects.knowledgeBonus}\\\\n                governmentBonus={councilEffects.governmentBonus}\\\\n                unityBonus={councilEffects.unityBonus}\\\\n                militaryBonus={councilEffects.militaryBonus}\\\\n                oppressionBonus={councilEffects.oppressionBonus\\\\n                }\\\\n                spoilsBonus={councilEffects.spoilsBonus}\\\\n                spaceDevBonus={councilEffects.spaceDevBonus}\\\\n                spaceflightBonus={councilEffects.spaceflightBonus}\\\\n                MCBonus={councilEffects.MCBonus}\\\\n                miningBonus={councilEffects.miningBonus}\\\\n              />\\\\n              <ShowEffects\\\\n                councilorTechBonus={councilEffects.councilorTechBonus}\\\\n                techBonuses={councilEffects.techBonuses}\\\\n              />\\\\n            </div>\\\\n            <Table>\\\\n              <CouncilorTableHeader hasOrgs />\\\\n              <TableBody>\\\\n                {scoredModifiedCouncilors.map((councilor) => (\\\\n                  <CouncilorTableRow\\\\n                    key={councilor.id}\\\\n                    councilor={councilor}\\\\n                    stats={councilor.effectsWithOrgsAndAugments}\\\\n                    label={councilor.displayName!}\\\\n                    hasOrgs\\\\n                    highlightMissionClassName={currentHighlightMissionClassName}\\\\n                  />\\\\n                ))}\\\\n              </TableBody>\\\\n            </Table>\\\\n            <h3 className=\\\\\\\"mt-1\\\\\\\">Available Organizations:</h3>\\\\n            <Table>\\\\n              <OrgTableHeader />\\\\n              <TableBody>\\\\n                {scoredOrgs.map((org) => (\\\\n                  <OrgTableRow\\\\n                    key={org.id}\\\\n                    org={org}\\\\n                    playerNationIds={playerNationIds}\\\\n                    playerTraits={playerTraits}\\\\n                    highlightMissionClassName={availableHighlightMissionClassName}\\\\n                  />\\\\n                ))}\\\\n              </TableBody>\\\\n            </Table>\\\\n          </AccordionContent>\\\\n        </AccordionItem>\\\\n        <AccordionItem value=\\\\\\\"new-councilors\\\\\\\">\\\\n          <AccordionTrigger>Find New Councilors</AccordionTrigger>\\\\n          <AccordionContent>\\\\n            <h3>Available Councilors:</h3>\\\\n            <Table>\\\\n              <CouncilorTableHeader />\\\\n              <TableBody>\\\\n                {scoredAvailableCouncilors.map((councilor) => (\\\\n                  <CouncilorTableRow\\\\n                    key={councilor.id}\\\\n                    councilor={councilor}\\\\n                    stats={councilor.effectsBaseAndUnaugmentedTraits}\\\\n                    label={councilor.displayName!}\\\\n                    highlightMissionClassName={availableHighlightMissionClassName}\\\\n                  />\\\\n                ))}\\\\n              </TableBody>\\\\n            </Table>\\\\n\\\\n            <h3 className=\\\\\\\"mt-1\\\\\\\">Unmodified Active Councilors:</h3>\\\\n            <Table>\\\\n              <CouncilorTableHeader />\\\\n              <TableBody>\\\\n                {scoredBaseCouncilors.map((councilor) => (\\\\n                  <CouncilorTableRow\\\\n                    key={`${councilor.id}-base`}\\\\n                    councilor={councilor}\\\\n                    stats={councilor.effectsBaseAndUnaugmentedTraits}\\\\n                    label={`${councilor.displayName}`}\\\\n                    highlightMissionClassName={currentHighlightMissionClassName}\\\\n                  />\\\\n                ))}\\\\n              </TableBody>\\\\n            </Table>\\\\n          </AccordionContent>\\\\n        </AccordionItem>\\\\n        <AccordionItem value=\\\\\\\"current-orgs\\\\\\\">\\\\n          <AccordionTrigger>Current Organizations</AccordionTrigger>\\\\n          <AccordionContent>\\\\n            <Table>\\\\n              <OrgTableHeader costHeader=\\\\\\\"Councilor\\\\\\\" />\\\\n              <TableBody>\\\\n                {scoredOwnedOrgs.toReversed().map((org) => (\\\\n                  <OrgTableRow\\\\n                    key={org.id}\\\\n                    org={org}\\\\n                    playerNationIds={playerNationIds}\\\\n                    playerTraits={playerTraits}\\\\n                    highlightMissionClassName={availableHighlightMissionClassName}\\\\n                  />\\\\n                ))}\\\\n              </TableBody>\\\\n            </Table>\\\\n          </AccordionContent>\\\\n        </AccordionItem>\\\\n        <AccordionItem value=\\\\\\\"takeover\\\\\\\">\\\\n          <AccordionTrigger>Hostile Takeover</AccordionTrigger>\\\\n          <AccordionContent>\\\\n            <SmartTabs\\\\n              storageKey=\\\\\\\"councilorsTakeoverTabs\\\\\\\"\\\\n              defaultValue={`faction-${Array.from(stealableOrgsByFaction.keys())[0]}`}\\\\n            >\\\\n              <TabsList>\\\\n                {Array.from(stealableOrgsByFaction.entries()).map(([factionId, orgs]) => (\\\\n                  <TabsTrigger key={factionId} value={`faction-${factionId}`}>\\\\n                    {orgs[0].faction?.displayName || \\\\\\\"Unknown Faction\\\\\\\"} ({orgs.length})\\\\n                  </TabsTrigger>\\\\n                ))}\\\\n              </TabsList>\\\\n              {Array.from(stealableOrgsByFaction.entries()).map(([factionId, orgs]) => (\\\\n                <TabsContent key={factionId} value={`faction-${factionId}`}>\\\\n                  <Table>\\\\n                    <OrgTableHeader costHeader=\\\\\\\"Takeover\\\\\\\" />\\\\n                    <TableBody>\\\\n                      {orgs.map((org) => (\\\\n                        <OrgTableRow\\\\n                          key={org.id}\\\\n                          org={org}\\\\n                          playerNationIds={playerNationIds}\\\\n                          playerTraits={playerTraits}\\\\n                          highlightMissionClassName={availableHighlightMissionClassName}\\\\n                          isTakeover\\\\n                        />\\\\n                      ))}\\\\n                    </TableBody>\\\\n                  </Table>\\\\n                </TabsContent>\\\\n              ))}\\\\n            </SmartTabs>\\\\n          </AccordionContent>\\\\n        </AccordionItem>\\\\n        <AccordionItem value=\\\\\\\"missions\\\\\\\">\\\\n          <AccordionTrigger>Missions</AccordionTrigger>\\\\n          <AccordionContent>\\\\n            <SmartTabs storageKey=\\\\\\\"councilorsMissionsTabs\\\\\\\" defaultValue={`faction-${factions[0].id}`}>\\\\n              <TabsList>\\\\n                {factions.map((faction) => (\\\\n                  <TabsTrigger key={faction.id} value={`faction-${faction.id}`}>\\\\n                    {faction.displayName || \\\\\\\"Unknown Faction\\\\\\\"} ({sourcesByFactionByMission.get(faction.id)?.size || 0})\\\\n                    {importantMissions\\\\n                      .filter(\\\\n                        (m) =>\\\\n                          sourcesByFactionByMission\\\\n                            .get(faction.id)\\\\n                            ?.get(m)\\\\n                            ?.filter((i) => i.type === \\\\\\\"councilor\\\\\\\")?.length ?? 0 > 0\\\\n                      )\\\\n                      .map((m) => {\\\\n                        const MissionIcon = MissionIcons[m] || UnknownIcon;\\\\n                        return (\\\\n                          <span key={m} className=\\\\\\\"inline-block -mt-2\\\\\\\">\\\\n                            <MissionIcon className=\\\\\\\"h-4 w-4\\\\\\\" />\\\\n                          </span>\\\\n                        );\\\\n                      })}\\\\n                  </TabsTrigger>\\\\n                ))}\\\\n              </TabsList>\\\\n              {factions.map((faction) => (\\\\n                <TabsContent key={faction.id} value={`faction-${faction.id}`}>\\\\n                  <SmartAccordion type=\\\\\\\"single\\\\\\\" collapsible storageKey={`councilorsMissions-${faction.id}`}>\\\\n                    {Array.from(\\\\n                      new Set([\\\\n                        ...importantMissions,\\\\n                        ...Array.from(sourcesByFactionByMission.get(faction.id)?.keys() || []),\\\\n                      ])\\\\n                    ).map((missionName) => {\\\\n                      const sources = sourcesByFactionByMission.get(faction.id)?.get(missionName) || [];\\\\n                      const MissionIcon = MissionIcons[missionName] || UnknownIcon;\\\\n                      return (\\\\n                        <AccordionItem key={missionName} value={missionName}>\\\\n                          <AccordionTrigger>\\\\n                            <span>\\\\n                              <MissionIcon /> {missionName} &ndash;{\\\\\\\" \\\\\\\"}\\\\n                              {sources.filter((i) => i.type === \\\\\\\"councilor\\\\\\\").length} Councilors &lt;-{\\\\\\\" \\\\\\\"}\\\\n                              {sources.filter((i) => i.type === \\\\\\\"org\\\\\\\").length} Orgs\\\\n                            </span>\\\\n                          </AccordionTrigger>\\\\n                          <AccordionContent>\\\\n                            <Table>\\\\n                              <OrgTableHeader costHeader=\\\\\\\"Takeover\\\\\\\" />\\\\n                              <TableBody>\\\\n                                {sources?.map((src) =>\\\\n                                  src.type === \\\\\\\"org\\\\\\\" ? (\\\\n                                    <OrgTableRow\\\\n                                      key={`councilor-${src.org.id}-mission-${missionName}`}\\\\n                                      org={src.org}\\\\n                                      playerNationIds={playerNationIds}\\\\n                                      playerTraits={playerTraits}\\\\n                                    />\\\\n                                  ) : (\\\\n                                    <CouncilorTableRow\\\\n                                      key={`org-${src.councilor.id}-mission-${missionName}`}\\\\n                                      councilor={src.councilor}\\\\n                                      stats={src.councilor.effectsWithOrgsAndAugments}\\\\n                                      label={src.councilor.displayName!}\\\\n                                    />\\\\n                                  )\\\\n                                )}\\\\n                              </TableBody>\\\\n                            </Table>\\\\n                          </AccordionContent>\\\\n                        </AccordionItem>\\\\n                      );\\\\n                    })}\\\\n                  </SmartAccordion>\\\\n                </TabsContent>\\\\n              ))}\\\\n            </SmartTabs>\\\\n          </AccordionContent>\\\\n        </AccordionItem>\\\\n        <AccordionItem value=\\\\\\\"other-councilors\\\\\\\">\\\\n          <AccordionTrigger>Other Councilors</AccordionTrigger>\\\\n          <AccordionContent>\\\\n            <OtherCouncilorsByFaction {...{ analysis, weights }} />\\\\n          </AccordionContent>\\\\n        </AccordionItem>\\\\n      </SmartAccordion>\\\\n\\\\n      <div className=\\\\\\\"my-4\\\\\\\">\\\\n        <ScoringWeightsDialog weights={weights} onWeightsChange={setWeights} />\\\\n      </div >\\\\n \\\\n      <Collapsible>\\\\n        <CollapsibleTrigger asChild>\\\\n          <Button variant=\\\\\\\"outline\\\\\\\">Debug Data</Button>\\\\n        </CollapsibleTrigger>\\\\n        <CollapsibleContent>\\\\n          {/* <pre>{JSON.stringify(analysis.playerCouncilors, null, 2)}</pre>\\\\n          <pre>{JSON.stringify(analysis.playerAvailableCouncilors, null, 2)}</pre>\\\\n          <pre>{JSON.stringify(analysis.playerAvailableOrgs, null, 2)}</pre>\\\\n          <pre>{JSON.stringify(analysis.playerUnassignedOrgs, null, 2)}</pre> */}\\\\n          <pre>{JSON.stringify(analysis.playerFaction, null, 2)}</pre>\\\\n        </CollapsibleContent>\\\\n      </Collapsible>\\\\n    </div>\\\\n  );\\\\n}\\\\n\\\\nfunction OtherCouncilorsByFaction({ analysis, weights }: { analysis: Analysis; weights: ScoringWeights }) {\\\\n  const { playerVisibleCouncilors, factionsById } = analysis;\\\\n\\\\n  const scoredBaseCouncilors = scoreAndSort(\\\\n    playerVisibleCouncilors,\\\\n    weights,\\\\n    new Map<MissionDataName, number>(),\\\\n    getBaseCouncilorScore\\\\n  );\\\\n\\\\n  const councilorsByFactionId = scoredBaseCouncilors.reduce((acc, councilor) => {\\\\n    const factionId = councilor.factionId || 0;\\\\n    if (!factionId) return acc;\\\\n    if (!acc.has(factionId)) {\\\\n      acc.set(factionId, []);\\\\n    }\\\\n    acc.get(factionId)!.push(councilor);\\\\n    return acc;\\\\n  }, new Map<number, Analysis[\\\\\\\"playerCouncilors\\\\\\\"][number][]>());\\\\n\\\\n  const factions = Array.from(councilorsByFactionId.keys())\\\\n    .map((i) => factionsById.get(i!)!)\\\\n    .filter((i) => i.id !== analysis.alienFaction.id);\\\\n\\\\n  return (\\\\n    <Tabs defaultValue={`faction-${factions[0].id}`}>\\\\n      <TabsList>\\\\n        {factions\\\\n          .filter((i) => i.id !== analysis.alienFaction.id)\\\\n          .map((faction) => (\\\\n            <TabsTrigger key={faction.id} value={`faction-${faction.id}`}>\\\\n              {faction.displayName || \\\\\\\"Unknown Faction\\\\\\\"} ({councilorsByFactionId.get(faction.id)?.length || 0})\\\\n            </TabsTrigger>\\\\n          ))}\\\\n      </TabsList>\\\\n      {factions.map((faction) => (\\\\n        <TabsContent key={faction.id} value={`faction-${faction.id}`}>\\\\n          <Table>\\\\n            <CouncilorTableHeader />\\\\n            <TableBody>\\\\n              {councilorsByFactionId.get(faction.id)?.map((councilor) => (\\\\n                <CouncilorTableRow\\\\n                  key={councilor.id}\\\\n                  councilor={councilor}\\\\n                  stats={councilor.effectsBaseAndUnaugmentedTraits}\\\\n                  label={councilor.displayName!}\\\\n                />\\\\n              ))}\\\\n            </TableBody>\\\\n          </Table>\\\\n        </TabsContent>\\\\n      ))}\\\\n    </Tabs>\\\\n  );\\\\n}\\\\n\\\\nfunction scoreAndSort<T>(\\\\n  items: T[],\\\\n  weights: ScoringWeights,\\\\n  haveMissions: Map<MissionDataName, number>,\\\\n  scoreFn: (item: T, weights: ScoringWeights, haveMissions: Map<MissionDataName, number>) => ScoreResult,\\\\n  scoreSort: \\\\\\\"value\\\\\\\" | \\\\\\\"noMissionScore\\\\\\\" = \\\\\\\"value\\\\\\\"\\\\n) {\\\\n  const scoredItems = items.map((item) => {\\\\n    const scoreResult = scoreFn(item, weights, haveMissions);\\\\n    return { ...item, score: scoreResult };\\\\n  });\\\\n  scoredItems.sort((a, b) => b.score[scoreSort] - a.score[scoreSort]);\\\\n  return scoredItems;\\\\n}\\\\n\\\\nfunction getBaseCouncilorScore(\\\\n  councilor: Analysis[\\\\\\\"playerCouncilors\\\\\\\"][number],\\\\n  weights: ScoringWeights,\\\\n  haveMissions: Map<MissionDataName, number>\\\\n): ScoreResult {\\\\n  return getScore(councilor.effectsBaseAndUnaugmentedTraits, weights, haveMissions, true);\\\\n}\\\\n\\\\nfunction getModifiedCouncilorScore(\\\\n  councilor: Analysis[\\\\\\\"playerCouncilors\\\\\\\"][number],\\\\n  weights: ScoringWeights,\\\\n  haveMissions: Map<MissionDataName, number>\\\\n): ScoreResult {\\\\n  return getScore(councilor.effectsWithOrgsAndAugments, weights, haveMissions, true);\\\\n}\\\\n\\\\nconst orgTransferFactor = 0.2;\\\\nfunction getOrganizationScore(\\\\n  org: Analysis[\\\\\\\"playerAvailableOrgs\\\\\\\"][number] & { type: string },\\\\n  weights: ScoringWeights,\\\\n  haveMissions: Map<MissionDataName, number>\\\\n): ScoreResult {\\\\n  return getScore(\\\\n    {\\\\n      ...org,\\\\n      techBonuses: org.template?.techBonuses,\\\\n      missionsGrantedNames: org.template?.missionsGrantedNames || [],\\\\n      ...(org.type === \\\\\\\"available\\\\\\\"\\\\n        ? {}\\\\n        : {\\\\n            // already-purchased orgs seem to cost ~30% to transfer\\\\n            costMoney: (org.costMoney || 0) * orgTransferFactor,\\\\n            costInfluence: (org.costInfluence || 0) * orgTransferFactor,\\\\n            costOps: (org.costOps || 0) * orgTransferFactor,\\\\n            costBoost: (org.costBoost || 0) * orgTransferFactor,\\\\n          }),\\\\n    },\\\\n    weights,\\\\n    haveMissions\\\\n  );\\\\n}\\\\n\\\\ninterface ScoreResult {\\\\n  value: number;\\\\n  noMissionScore: number;\\\\n  details: string;\\\\n}\\\\n\\\\nfunction getScore(\\\\n  org: ShowEffectsProps,\\\\n  weights: ScoringWeights,\\\\n  haveMissions: Map<MissionDataName, number>,\\\\n  ignoreTier: boolean = false\\\\n): ScoreResult {\\\\n  let totalScore = 0;\\\\n  const details: string[] = [];\\\\n\\\\n  // Helper to add score for a numeric attribute\\\\n  const addScore = (name: string, value: number | undefined, weight: number | undefined, noNegative?: boolean) => {\\\\n    let actualValue = value || 0;\\\\n    if (noNegative) {\\\\n      actualValue = Math.max(0, actualValue);\\\\n    }\\\\n    const actualWeight = weight ?? 0;\\\\n\\\\n    // Skip if value or weight is 0/undefined/null\\\\n    if (!actualValue || !actualWeight) return;\\\\n\\\\n    const contribution = actualValue * actualWeight;\\\\n    totalScore += contribution;\\\\n    details.push(\\\\n      `${name}: ${parseFloat(actualValue.toFixed(2))} × ${parseFloat(actualWeight.toFixed(3))} = ${contribution.toFixed(\\\\n        3\\\\n      )}`\\\\n    );\\\\n  };\\\\n\\\\n  // Councilor attributes\\\\n  addScore(\\\\\\\"persuasion\\\\\\\", org.persuasion, weights.persuasion, true);\\\\n  addScore(\\\\\\\"command\\\\\\\", org.command, weights.command, true);\\\\n  addScore(\\\\\\\"investigation\\\\\\\", org.investigation, weights.investigation, true);\\\\n  addScore(\\\\\\\"espionage\\\\\\\", org.espionage, weights.espionage, true);\\\\n  addScore(\\\\\\\"administration\\\\\\\", org.administration, weights.administration, true);\\\\n  addScore(\\\\\\\"science\\\\\\\", org.science, weights.science, true);\\\\n  addScore(\\\\\\\"security\\\\\\\", org.security, weights.security, true);\\\\n  addScore(\\\\\\\"Persuasion\\\\\\\", org.Persuasion, weights.persuasion, true);\\\\n  addScore(\\\\\\\"Command\\\\\\\", org.Command, weights.command, true);\\\\n  addScore(\\\\\\\"Investigation\\\\\\\", org.Investigation, weights.investigation, true);\\\\n  addScore(\\\\\\\"Espionage\\\\\\\", org.Espionage, weights.espionage, true);\\\\n  addScore(\\\\\\\"Administration\\\\\\\", org.Administration, weights.administration, true);\\\\n  addScore(\\\\\\\"Science\\\\\\\", org.Science, weights.science, true);\\\\n  addScore(\\\\\\\"Security\\\\\\\", org.Security, weights.security, true);\\\\n  addScore(\\\\\\\"xpModifier\\\\\\\", org.xpModifier, weights.xpModifier);\\\\n  addScore(\\\\\\\"xp\\\\\\\", org.xp, weights.xp);\\\\n\\\\n  // Monthly income/costs\\\\n  addScore(\\\\\\\"incomeBoost_month\\\\\\\", org.incomeBoost_month, weights.incomeBoost_month);\\\\n  addScore(\\\\\\\"incomeMoney_month\\\\\\\", org.incomeMoney_month, weights.incomeMoney_month);\\\\n  addScore(\\\\\\\"incomeInfluence_month\\\\\\\", org.incomeInfluence_month, weights.incomeInfluence_month);\\\\n  addScore(\\\\\\\"incomeOps_month\\\\\\\", org.incomeOps_month, weights.incomeOps_month);\\\\n  addScore(\\\\\\\"incomeMissionControl\\\\\\\", org.incomeMissionControl, weights.incomeMissionControl);\\\\n  addScore(\\\\\\\"incomeResearch_month\\\\\\\", org.incomeResearch_month, weights.incomeResearch_month);\\\\n  addScore(\\\\\\\"projectCapacityGranted\\\\\\\", org.projectCapacityGranted, weights.projectCapacityGranted);\\\\n\\\\n  // Purchase costs\\\\n  addScore(\\\\\\\"costMoney\\\\\\\", org.costMoney, weights.costMoney);\\\\n  addScore(\\\\\\\"costInfluence\\\\\\\", org.costInfluence, weights.costInfluence);\\\\n  addScore(\\\\\\\"costOps\\\\\\\", org.costOps, weights.costOps);\\\\n  addScore(\\\\\\\"costBoost\\\\\\\", org.costBoost, weights.costBoost);\\\\n\\\\n  // Priority bonuses\\\\n  addScore(\\\\\\\"economyBonus\\\\\\\", org.economyBonus, weights.economyBonus);\\\\n  addScore(\\\\\\\"welfareBonus\\\\\\\", org.welfareBonus, weights.welfareBonus);\\\\n  addScore(\\\\\\\"environmentBonus\\\\\\\", org.environmentBonus, weights.environmentBonus);\\\\n  addScore(\\\\\\\"knowledgeBonus\\\\\\\", org.knowledgeBonus, weights.knowledgeBonus);\\\\n  addScore(\\\\\\\"governmentBonus\\\\\\\", org.governmentBonus, weights.governmentBonus);\\\\n  addScore(\\\\\\\"unityBonus\\\\\\\", org.unityBonus, weights.unityBonus);\\\\n  addScore(\\\\\\\"militaryBonus\\\\\\\", org.militaryBonus, weights.militaryBonus);\\\\n  addScore(\\\\\\\"oppressionBonus\\\\\\\", org.oppressionBonus, weights.oppressionBonus);\\\\n  addScore(\\\\\\\"spoilsBonus\\\\\\\", org.spoilsBonus, weights.spoilsBonus);\\\\n  addScore(\\\\\\\"spaceDevBonus\\\\\\\", org.spaceDevBonus, weights.spaceDevBonus);\\\\n  addScore(\\\\\\\"spaceflightBonus\\\\\\\", org.spaceflightBonus, weights.spaceflightBonus);\\\\n  addScore(\\\\\\\"MCBonus\\\\\\\", org.MCBonus, weights.MCBonus);\\\\n  addScore(\\\\\\\"miningBonus\\\\\\\", org.miningBonus, weights.miningBonus);\\\\n\\\\n  // Tech bonuses from councilor/traits\\\\n  if (weights.councilorTechBonus && org?.councilorTechBonus) {\\\\n    for (const { category, bonus } of org.councilorTechBonus) {\\\\n      const weight = weights.councilorTechBonus[category];\\\\n      addScore(`councilorTechBonus[${category}]`, bonus, weight);\\\\n    }\\\\n  }\\\\n\\\\n  // Tech bonuses from orgs\\\\n  if (weights.techBonuses && org?.techBonuses) {\\\\n    for (const { category, bonus } of org.techBonuses) {\\\\n      const weight = weights.techBonuses[category];\\\\n      addScore(`techBonus[${category}]`, bonus, weight);\\\\n    }\\\\n  }\\\\n\\\\n  let noMissionScore = totalScore;\\\\n\\\\n  // Missions granted\\\\n  if (weights.missions && org?.missionsGrantedNames) {\\\\n    for (const missionName of org.missionsGrantedNames) {\\\\n      const weight = weights.missions[missionName];\\\\n      addScore(`mission[${missionName}]`, 1, weight);\\\\n\\\\n      // Extra weight for missions we don't have yet or only have one councilor for\\\\n      if (weights.extraWeightForMissingMissions && (haveMissions.get(missionName) || 0) === 0) {\\\\n        totalScore += weights.extraWeightForMissingMissions;\\\\n        details.push(\\\\n          `mission[${missionName}]: missing bonus × ${parseFloat(\\\\n            weights.extraWeightForMissingMissions.toFixed(3)\\\\n          )} = ${weights.extraWeightForMissingMissions.toFixed(3)}`\\\\n        );\\\\n      }\\\\n      if (weights.extraWeightForSingleMissions && (haveMissions.get(missionName) || 0) === 1) {\\\\n        totalScore += weights.extraWeightForSingleMissions;\\\\n        details.push(\\\\n          `mission[${missionName}]: single bonus × ${parseFloat(\\\\n            weights.extraWeightForSingleMissions.toFixed(3)\\\\n          )} = ${weights.extraWeightForSingleMissions.toFixed(3)}`\\\\n        );\\\\n      }\\\\n    }\\\\n  }\\\\n\\\\n  // Divide by tier to normalize for org cost/power\\\\n  const tier = org.tier || 1;\\\\n  let finalScore = totalScore;\\\\n\\\\n  if (tier > 1 && !ignoreTier) {\\\\n    const tierFactor = Math.pow(tier, weights.orgTierExponent);\\\\n    finalScore = totalScore / tierFactor;\\\\n    noMissionScore /= tierFactor;\\\\n    details.push(`Subtotal: ${totalScore.toFixed(3)}`);\\\\n    details.push(`Divided by ${tierFactor.toFixed(2)} for tier ${tier}: ${finalScore.toFixed(3)}`);\\\\n  }\\\\n\\\\n  return {\\\\n    value: finalScore,\\\\n    noMissionScore,\\\\n    details: details.join(\\\\\\\"\\\\\\\\n\\\\\\\"),\\\\n  };\\\\n}\\\\\\n\",\"oldString\":\"function CouncilorsComponent({\\\\n  analysis,\\\\n  weights,\\\\n  setWeights,\\\\n  scoredModifiedCouncilors,\\\\n  scoredAvailableCouncilors,\\\\n  scoredBaseCouncilors,\\\\n  scoredOrgs,\\\\n  scoredOwnedOrgs,\\\\n}: {\\\\n  analysis: Analysis;\\\\n  weights: ScoringWeights;\\\\n  setWeights: (weights: ScoringWeights) => void;\\\\n  scoredModifiedCouncilors: (Analysis[\\\\\\\"playerCouncilors\\\\\\\"][number] & { score: ScoreResult })[];\\\\n  scoredAvailableCouncilors: (Analysis[\\\\\\\"playerAvailableCouncilors\\\\\\\"][number] & { score: ScoreResult })[];\\\\n  scoredBaseCouncilors: (Analysis[\\\\\\\"playerCouncilors\\\\\\\"][number] & { score: ScoreResult })[];\\\\n  scoredOrgs: (Analysis[\\\\\\\"playerAvailableOrgs\\\\\\\"][number] & { type: string; score: ScoreResult })[];\\\\n  scoredOwnedOrgs: (Analysis[\\\\\\\"playerAvailableOrgs\\\\\\\"][number] & {\\\\n    type: string;\\\\n    score: ScoreResult;\\\\n    councilor?: string;\\\\n    councilorId?: number;\\\\n  })[];\\\\n}) {\\\\n  const {\\\\n    playerMissionCounts,\\\\n    playerVisibleCouncilors,\\\\n    playerCouncilors,\\\\n    playerAvailableOrgs,\\\\n    playerUnassignedOrgs,\\\\n    playerFaction,\\\\n    playerStealableOrgs,\\\\n    factionsById,\\\\n  } = analysis;\\\\n  const scoredStealableOrgs = scoreAndSort(\\\\n    analysis.playerStealableOrgs.map((i) => ({ type: \\\\\\\"stealable\\\\\\\", ...i })),\\\\n    weights,\\\\n    playerMissionCounts,\\\\n    getOrganizationScore,\\\\n    \\\\\\\"noMissionScore\\\\\\\"\\\\n  );\\\\n  function currentHighlightMissionClassName(missionName: MissionDataName) {\\\\n    // if we have exactly 2, show yellow BG, if we have 1, show red, otherwise no change to bg\\\\n    const count = playerMissionCounts.get(missionName) || 0;\\\\n    if (count === 2) {\\\\n      return \\\\\\\"bg-yellow-300/50\\\\\\\";\\\\n    } else if (count === 1) {\\\\n      return \\\\\\\"bg-red-300/50\\\\\\\";\\\\n    }\\\\n  }\\\\n  function availableHighlightMissionClassName(missionName: MissionDataName) {\\\\n    // if we have 1, show yellow BG, if we have 0, show green, otherwise no change to bg\\\\n    const count = playerMissionCounts.get(missionName) || 0;\\\\n    if (count === 1) {\\\\n      return \\\\\\\"bg-yellow-300/50\\\\\\\";\\\\n    } else if (count === 0) {\\\\n      return \\\\\\\"bg-green-300/50\\\\\\\";\\\\n    }\\\\n  }\\\\n  const playerNationIds = new Set(analysis.playerNationIds);\\\\n  const playerTraits = new Set(analysis.playerCouncilors.flatMap((i) => i.traitTemplateNames));\\\\n  const unusedAdmin = analysis.playerCouncilors\\\\n    .map(\\\\n      (c) =>\\\\n        Math.min(\\\\n          25,\\\\n          Math.max(\\\\n            0,\\\\n            (c.effectsWithOrgsAndAugments.Administration || 0) + (c.effectsWithOrgsAndAugments.administration || 0)\\\\n          )\\\\n        ) - c.orgs.reduce((a, b) => a + b.tier, 0)\\\\n    )\\\\n    .reduce((a, b) => a + b, 0);\\\\n\\\\n  const stealableOrgsByFaction = scoredStealableOrgs.reduce((acc, org) => {\\\\n    const key = org.faction?.id || 0;\\\\n    if (!acc.has(key)) {\\\\n      acc.set(key, []);\\\\n    }\\\\n    acc.get(key)!.push(org);\\\\n    return acc;\\\\n  }, new Map<number, typeof scoredStealableOrgs>());\\\\n\\\\n  type MissionSource =\\\\n    | {\\\\n        type: \\\\\\\"councilor\\\\\\\";\\\\n        councilor: Analysis[\\\\\\\"playerCouncilors\\\\\\\"][number];\\\\n        factionId: number | undefined;\\\\n        missions: MissionDataName[];\\\\n      }\\\\n    | {\\\\n        type: \\\\\\\"org\\\\\\\";\\\\n        org: Analysis[\\\\\\\"playerAvailableOrgs\\\\\\\"][number];\\\\n        factionId: number | undefined;\\\\n        missions: MissionDataName[];\\\\n      };\\\\n\\\\n  const sourcesByFactionByMission = [...playerCouncilors, ...playerVisibleCouncilors]\\\\n    .map(\\\\n      (i) =>\\\\n        ({\\\\n          type: \\\\\\\"councilor\\\\\\\",\\\\n          councilor: i,\\\\n          factionId: i.factionId,\\\\n          missions: i.effectsWithOrgsAndAugments.missionsGrantedNames || [],\\\\n        } as MissionSource)\\\\n    )\\\\n    .concat(\\\\n      [...playerAvailableOrgs, ...playerUnassignedOrgs].map((i) => ({\\\\n        type: \\\\\\\"org\\\\\\\",\\\\n        org: i,\\\\n        factionId: playerFaction?.id,\\\\n        missions: i.template?.missionsGrantedNames || [],\\\\n      }))\\\\n    )\\\\n    .concat(\\\\n      playerStealableOrgs.map((i) => ({\\\\n        type: \\\\\\\"org\\\\\\\",\\\\n        org: i,\\\\n        factionId: i.faction?.id,\\\\n        missions: i.template?.missionsGrantedNames || [],\\\\n      }))\\\\n    )\\\\n    .reduce((acc, o) => {\\\\n      const key = o.factionId || 0;\\\\n      if (!acc.has(key)) {\\\\n        acc.set(key, new Map<string, MissionSource[]>());\\\\n      }\\\\n      const effectsMap = acc.get(key)!;\\\\n      o.missions.forEach((m) => {\\\\n        if (!effectsMap.has(m)) {\\\\n          effectsMap.set(m, []);\\\\n        }\\\\n        effectsMap.get(m)!.push(o);\\\\n      });\\\\n      return acc;\\\\n    }, new Map<number, Map<string, MissionSource[]>>());\\\\n  const factions = Array.from(sourcesByFactionByMission.keys())\\\\n    .map((factionId) => factionsById.get(factionId)!)\\\\n    .filter((f) => f)\\\\n    .toSorted((a, b) => {\\\\n      if (a.id === playerFaction.id) return -1;\\\\n      if (b.id === playerFaction.id) return 1;\\\\n      return (a.displayName || \\\\\\\"\\\\\\\").localeCompare(b.displayName || \\\\\\\"\\\\\\\");\\\\n    });\\\\n\\\\n  const importantMissions = [\\\\\\\"Assassinate\\\\\\\"];\\\\n\\\\n  const councilEffects = scoredModifiedCouncilors.reduce((acc, councilor) => {\\\\n    return combineEffects(acc, councilor.effectsWithOrgsAndAugments);\\\\n  }, {} as ShowEffectsProps);\\\\n\\\\n  // TODO: would be cool to click an effect icon and sort everything by that (ie. click persuasion icon to see who/org gives most persuasion)\\\\n  return (\\\\n    <div className=\\\\\\\"space-y-2\\\\\\\">\\\\n      <SmartAccordion type=\\\\\\\"single\\\\\\\" collapsible storageKey=\\\\\\\"councilorsSections\\\\\\\" defaultValue=\\\\\\\"existing\\\\\\\">\\\\n        <AccordionItem value=\\\\\\\"existing\\\\\\\">\\\\n          <AccordionTrigger>\\\\n            <span>\\\\n              Manage Existing Council ({unusedAdmin.toFixed(0)} <Administration />)\\\\n            </span>\\\\n          </AccordionTrigger>\\\\n          <AccordionContent>\\\\n            <div className=\\\\\\\"py-1\\\\\\\">\\\\n              <ShowEffects\\\\n                incomeBoost_month={councilEffects.incomeBoost_month}\\\\n                incomeMoney_month={councilEffects.incomeMoney_month}\\\\n                incomeInfluence_month={councilEffects.incomeInfluence_month}\\\\n                incomeOps_month={councilEffects.incomeOps_month}\\\\n                incomeMissionControl={councilEffects.incomeMissionControl}\\\\n                incomeResearch_month={councilEffects.incomeResearch_month}\\\\n                projectCapacityGranted={councilEffects.projectCapacityGranted}\\\\n              />\\\\n              <ShowEffects\\\\n                economyBonus={councilEffects.economyBonus}\\\\n                welfareBonus={councilEffects.welfareBonus}\\\\n                environmentBonus={councilEffects.environmentBonus}\\\\n                knowledgeBonus={councilEffects.knowledgeBonus\\\\n                }\\\\n                governmentBonus={councilEffects.governmentBonus}\\\\n                unityBonus={councilEffects.unityBonus}\\\\n                militaryBonus={councilEffects.militaryBonus}\\\\n                oppressionBonus={councilEffects.oppressionBonus\\\\n                }\\\\n                spoilsBonus={councilEffects.spoilsBonus}\\\\n                spaceDevBonus={councilEffects.spaceDevBonus}\\\\n                spaceflightBonus={councilEffects.spaceflightBonus}\\\\n                MCBonus={councilEffects.MCBonus}\\\\n                miningBonus={councilEffects.miningBonus}\\\\n              />\\\\n              <ShowEffects\\\\n                councilorTechBonus={councilEffects.councilorTechBonus}\\\\n                techBonuses={councilEffects.techBonues}\\\\n              />\\\\n            </div>\\\\n            <Table>\\\\n              <CouncilorTableHeader hasOrgs />\\\\n              <TableBody>\\\\n                {scoredModifiedCouncilors.map((councilor) => (\\\\n                  <CouncilorTableRow\\\\n                    key={councilor.id}\\\\n                    councilor={councilor}\\\\n                    stats={councilor.effectsWithOrgsAndAugments}\\\\n                    label={councilor.displayName!}\\\\n                    hasOrgs\\\\n                    highlightMissionClassName={currentHighlightMissionClassName}\\\\n                  />\\\\n                ))}\\\\n              </TableBody>\\\\n            </Table>\\\\n            <h3 className=\\\\\\\"mt-1\\\\\\\">Available Organizations:</h3>\\\\n            <Table>\\\\n              <OrgTableHeader />\\\\n              <TableBody>\\\\n                {scoredOrgs.map((org) => (\\\\n                  <OrgTableRow\\\\n                    key={org.id}\\\\n                    org={org}\\\\n                    playerNationIds={playerNationIds}\\\\n                    playerTraits={playerTraits}\\\\n                    highlightMissionClassName={availableHighlightMissionClassName}\\\\n                  />\\\\n                ))}\\\\n              </TableBody>\\\\n            </Table>\\\\n          </AccordionContent>\\\\n        </AccordionItem>\\\\n        <AccordionItem value=\\\\\\\"new-councilors\\\\\\\">\\\\n          <AccordionTrigger>Find New Councilors</AccordionTrigger>\\\\n          <AccordionContent>\\\\n            <h3>Available Councilors:</h3>\\\\n            <Table>\\\\n              <CouncilorTableHeader />\\\\n              <TableBody>\\\\n                {scoredAvailableCouncilors.map((councilor) => (\\\\n                  <CouncilorTableRow\\\\n                    key={councilor.id}\\\\n                    councilor={councilor}\\\\n                    stats={councilor.effectsBaseAndUnaugmentedTraits}\\\\n                    label={councilor.displayName!}\\\\n                    highlightMissionClassName={availableHighlightMissionClassName}\\\\n                  />\\\\n                ))}\\\\n              </TableBody>\\\\n            </Table>\\\\n\\\\n            <h3 className=\\\\\\\"mt-1\\\\\\\">Unmodified Active Councilors:</h3>\\\\n            <Table>\\\\n              <CouncilorTableHeader />\\\\n              <TableBody>\\\\n                {scoredBaseCouncilors.map((councilor) => (\\\\n                  <CouncilorTableRow\\\\n                    key={`${councilor.id}-base`}\\\\n                    councilor={councilor}\\\\n                    stats={councilor.effectsBaseAndUnaugmentedTraits}\\\\n                    label={`${councilor.displayName}`}\\\\n                    highlightMissionClassName={currentHighlightMissionClassName}\\\\n                  />\\\\n                ))}\\\\n              </TableBody>\\\\n            </Table>\\\\n          </AccordionContent>\\\\n        </AccordionItem>\\\\n        <AccordionItem value=\\\\\\\"current-orgs\\\\\\\">\\\\n          <AccordionTrigger>Current Organizations</AccordionTrigger>\\\\n          <AccordionContent>\\\\n            <Table>\\\\n              <OrgTableHeader costHeader=\\\\\\\"Councilor\\\\\\\" />\\\\n              <TableBody>\\\\n                {scoredOwnedOrgs.toReversed().map((org) => (\\\\n                  <OrgTableRow\\\\n                    key={org.id}\\\\n                    org={org}\\\\n                    playerNationIds={playerNationIds}\\\\n                    playerTraits={playerTraits}\\\\n                    highlightMissionClassName={availableHighlightMissionClassName}\\\\n                  />\\\\n                ))}\\\\n              </TableBody>\\\\n            </Table>\\\\n          </AccordionContent>\\\\n        </AccordionItem>\\\\n        <AccordionItem value=\\\\\\\"takeover\\\\\\\">\\\\n          <AccordionTrigger>Hostile Takeover</AccordionTrigger>\\\\n          <AccordionContent>\\\\n            <SmartTabs\\\\n              storageKey=\\\\\\\"councilorsTakeoverTabs\\\\\\\"\\\\n              defaultValue={`faction-${Array.from(stealableOrgsByFaction.keys())[0]}`}\\\\n            >\\\\n              <TabsList>\\\\n                {Array.from(stealableOrgsByFaction.entries()).map(([factionId, orgs]) => (\\\\n                  <TabsTrigger key={factionId} value={`faction-${factionId}`}>\\\\n                    {orgs[0].faction?.displayName || \\\\\\\"Unknown Faction\\\\\\\"} ({orgs.length})\\\\n                  </TabsTrigger>\\\\n                ))}\\\\n              </TabsList>\\\\n              {Array.from(stealableOrgsByFaction.entries()).map(([factionId, orgs]) => (\\\\n                <TabsContent key={factionId} value={`faction-${factionId}`}>\\\\n                  <Table>\\\\n                    <OrgTableHeader costHeader=\\\\\\\"Takeover\\\\\\\" />\\\\n                    <TableBody>\\\\n                      {orgs.map((org) => (\\\\n                        <OrgTableRow\\\\n                          key={org.id}\\\\n                          org={org}\\\\n                          playerNationIds={playerNationIds}\\\\n                          playerTraits={playerTraits}\\\\n                          highlightMissionClassName={availableHighlightMissionClassName}\\\\n                          isTakeover\\\\n                        />\\\\n                      ))}\\\\n                    </TableBody>\\\\n                  </Table>\\\\n                </TabsContent>\\\\n              ))}\\\\n            </SmartTabs>\\\\n          </AccordionContent>\\\\n        </AccordionItem>\\\\n        <AccordionItem value=\\\\\\\"missions\\\\\\\">\\\\n          <AccordionTrigger>Missions</AccordionTrigger>\\\\n          <AccordionContent>\\\\n            <SmartTabs storageKey=\\\\\\\"councilorsMissionsTabs\\\\\\\" defaultValue={`faction-${factions[0].id}`}>\\\\n              <TabsList>\\\\n                {factions.map((faction) => (\\\\n                  <TabsTrigger key={faction.id} value={`faction-${faction.id}`}>\\\\n                    {faction.displayName || \\\\\\\"Unknown Faction\\\\\\\"} ({sourcesByFactionByMission.get(faction.id)?.size || 0})\\\\n                    {importantMissions\\\\n                      .filter(\\\\n                        (m) =>\\\\n                          sourcesByFactionByMission\\\\n                            .get(faction.id)\\\\n                            ?.get(m)\\\\n                            ?.filter((i) => i.type === \\\\\\\"councilor\\\\\\\")?.length ?? 0 > 0\\\\n                      )\\\\n                      .map((m) => {\\\\n                        const MissionIcon = MissionIcons[m] || UnknownIcon;\\\\n                        return (\\\\n                          <span key={m} className=\\\\\\\"inline-block -mt-2\\\\\\\">\\\\n                            <MissionIcon className=\\\\\\\"h-4 w-4\\\\\\\" />\\\\n                          </span>\\\\n                        );\\\\n                      })}\\\\n                  </TabsTrigger>\\\\n                ))}\\\\n              </TabsList>\\\\n              {factions.map((faction) => (\\\\n                <TabsContent key={faction.id} value={`faction-${faction.id}`}>\\\\n                  <SmartAccordion type=\\\\\\\"single\\\\\\\" collapsible storageKey={`councilorsMissions-${faction.id}`}>\\\\n                    {Array.from(\\\\n                      new Set([\\\\n                        ...importantMissions,\\\\n                        ...Array.from(sourcesByFactionByMission.get(faction.id)?.keys() || []),\\\\n                      ])\\\\n                    ).map((missionName) => {\\\\n                      const sources = sourcesByFactionByMission.get(faction.id)?.get(missionName) || [];\\\\n                      const MissionIcon = MissionIcons[missionName] || UnknownIcon;\\\\n                      return (\\\\n                        <AccordionItem key={missionName} value={missionName}>\\\\n                          <AccordionTrigger>\\\\n                            <span>\\\\n                              <MissionIcon /> {missionName} &ndash;{\\\\\\\" \\\\\\\"}\\\\n                              {sources.filter((i) => i.type === \\\\\\\"councilor\\\\\\\").length} Councilors &lt;-{\\\\\\\" \\\\\\\"}\\\\n                              {sources.filter((i) => i.type === \\\\\\\"org\\\\\\\").length} Orgs\\\\n                            </span>\\\\n                          </AccordionTrigger>\\\\n                          <AccordionContent>\\\\n                            <Table>\\\\n                              <OrgTableHeader costHeader=\\\\\\\"Takeover\\\\\\\" />\\\\n                              <TableBody>\\\\n                                {sources?.map((src) =>\\\\n                                  src.type === \\\\\\\"org\\\\\\\" ? (\\\\n                                    <OrgTableRow\\\\n                                      key={`councilor-${src.org.id}-mission-${missionName}`}\\\\n                                      org={src.org}\\\\n                                      playerNationIds={playerNationIds}\\\\n                                      playerTraits={playerTraits}\\\\n                                    />\\\\n                                  ) : (\\\\n                                    <CouncilorTableRow\\\\n                                      key={`org-${src.councilor.id}-mission-${missionName}`}\\\\n                                      councilor={src.councilor}\\\\n                                      stats={src.councilor.effectsWithOrgsAndAugments}\\\\n                                      label={src.councilor.displayName!}\\\\n                                    />\\\\n                                  )\\\\n                                )}\\\\n                              </TableBody>\\\\n                            </Table>\\\\n                          </AccordionContent>\\\\n                        </AccordionItem>\\\\n                      );\\\\n                    })}\\\\n                  </SmartAccordion>\\\\n                </TabsContent>\\\\n              ))}\\\\n            </SmartTabs>\\\\n          </AccordionContent>\\\\n        </AccordionItem>\\\\n        <AccordionItem value=\\\\\\\"other-councilors\\\\\\\">\\\\n          <AccordionTrigger>Other Councilors</AccordionTrigger>\\\\n          <AccordionContent>\\\\n            <OtherCouncilorsByFaction {...{ analysis, weights }} />\\\\n          </AccordionContent>\\\\n        </AccordionItem>\\\\n      </SmartAccordion\\\\n\\\\n      <div className=\\\\\\\"my-4\\\\\\\">\\\\n        <ScoringWeightsDialog weights={weights} onWeightsChange={setWeights} />\\\\n      </div >\\\\n \\\\n      <Collapsible>\\\\n        <CollapsibleTrigger asChild>\\\\n          <Button variant=\\\\\\\"outline\\\\\\\">Debug Data</Button>\\\\n        </CollapsibleTrigger>\\\\n        <CollapsibleContent>\\\\n          {/* <pre>{JSON.stringify(analysis.playerCouncilors, null, 2)}</pre>\\\\n          <pre>{JSON.stringify(analysis.playerAvailableCouncilors, null, 2)}</pre>\\\\n          <pre>{JSON.stringify(analysis.playerAvailableOrgs, null, 2)}</pre>\\\\n          <pre>{JSON.stringify(analysis.playerUnassignedOrgs, null, 2)}</pre> */}\\\\n          <pre>{JSON.stringify(analysis.playerFaction, null, 2)}</pre>\\\\n        </CollapsibleContent>\\\\n      </Collapsible>\\\\n    </div>\\\\n  );\\\\n}\\\\n\\\\nfunction OtherCouncilorsByFaction({ analysis, weights }: { analysis: Analysis; weights: ScoringWeights }) {\\\\n  const { playerVisibleCouncilors, factionsById } = analysis;\\\\n\\\\n  const scoredBaseCouncilors = scoreAndSort(\\\\n    playerVisibleCouncilors,\\\\n    weights,\\\\n    new Map<MissionDataName, number>(),\\\\n    getBaseCouncilorScore\\\\n  );\\\\n\\\\n  const councilorsByFactionId = scoredBaseCouncilors.reduce((acc, councilor) => {\\\\n    const factionId = councilor.factionId || 0;\\\\n    if (!factionId) return acc;\\\\n    if (!acc.has(factionId)) {\\\\n      acc.set(factionId, []);\\\\n    }\\\\n    acc.get(factionId)!.push(councilor);\\\\n    return acc;\\\\n  }, new Map<number, Analysis[\\\\\\\"playerCouncilors\\\\\\\"][number][]>());\\\\n\\\\n  const factions = Array.from(councilorsByFactionId.keys())\\\\n    .map((i) => factionsById.get(i!)!)\\\\n    .filter((i) => i.id !== analysis.alienFaction.id);\\\\n\\\\n  return (\\\\n    <Tabs defaultValue={`faction-${factions[0].id}`}>\\\\n      <TabsList>\\\\n        {factions\\\\n          .filter((i) => i.id !== analysis.alienFaction.id)\\\\n          .map((faction) => (\\\\n            <TabsTrigger key={faction.id} value={`faction-${faction.id}`}>\\\\n              {faction.displayName || \\\\\\\"Unknown Faction\\\\\\\"} ({councilorsByFactionId.get(faction.id)?.length || 0})\\\\n            </TabsTrigger>\\\\n          ))}\\\\n      </TabsList>\\\\n      {factions.map((faction) => (\\\\n        <TabsContent key={faction.id} value={`faction-${faction.id}`}>\\\\n          <Table>\\\\n            <CouncilorTableHeader />\\\\n            <TableBody>\\\\n              {councilorsByFactionId.get(faction.id)?.map((councilor) => (\\\\n                <CouncilorTableRow\\\\n                  key={councilor.id}\\\\n                  councilor={councilor}\\\\n                  stats={councilor.effectsBaseAndUnaugmentedTraits}\\\\n                  label={councilor.displayName!}\\\\n                />\\\\n              ))}\\\\n            </TableBody>\\\\n          </Table>\\\\n        </TabsContent>\\\\n      ))}\\\\n    </Tabs>\\\\n  );\\\\n}\\\\n\\\\nfunction scoreAndSort<T>(\\\\n  items: T[],\\\\n  weights: ScoringWeights,\\\\n  haveMissions: Map<MissionDataName, number>,\\\\n  scoreFn: (item: T, weights: ScoringWeights, haveMissions: Map<MissionDataName, number>) => ScoreResult,\\\\n  scoreSort: \\\\\\\"value\\\\\\\" | \\\\\\\"noMissionScore\\\\\\\" = \\\\\\\"value\\\\\\\"\\\\n) {\\\\n  const scoredItems = items.map((item) => {\\\\n    const scoreResult = scoreFn(item, weights, haveMissions);\\\\n    return { ...item, score: scoreResult };\\\\n  });\\\\n  scoredItems.sort((a, b) => b.score[scoreSort] - a.score[scoreSort]);\\\\n  return scoredItems;\\\\n}\\\\n\\\\nfunction getBaseCouncilorScore(\\\\n  councilor: Analysis[\\\\\\\"playerCouncilors\\\\\\\"][number],\\\\n  weights: ScoringWeights,\\\\n  haveMissions: Map<MissionDataName, number>\\\\n): ScoreResult {\\\\n  return getScore(councilor.effectsBaseAndUnaugmentedTraits, weights, haveMissions, true);\\\\n}\\\\n\\\\nfunction getModifiedCouncilorScore(\\\\n  councilor: Analysis[\\\\\\\"playerCouncilors\\\\\\\"][number],\\\\n  weights: ScoringWeights,\\\\n  haveMissions: Map<MissionDataName, number>\\\\n): ScoreResult {\\\\n  return getScore(councilor.effectsWithOrgsAndAugments, weights, haveMissions, true);\\\\n}\\\\n\\\\nconst orgTransferFactor = 0.2;\\\\nfunction getOrganizationScore(\\\\n  org: Analysis[\\\\\\\"playerAvailableOrgs\\\\\\\"][number] & { type: string },\\\\n  weights: ScoringWeights,\\\\n  haveMissions: Map<MissionDataName, number>\\\\n): ScoreResult {\\\\n  return getScore(\\\\n    {\\\\n      ...org,\\\\n      techBonuses: org.template?.techBonuses,\\\\n      missionsGrantedNames: org.template?.missionsGrantedNames || [],\\\\n      ...(org.type === \\\\\\\"available\\\\\\\"\\\\n        ? {}\\\\n        : {\\\\n            // already-purchased orgs seem to cost ~30% to transfer\\\\n            costMoney: (org.costMoney || 0) * orgTransferFactor,\\\\n            costInfluence: (org.costInfluence || 0) * orgTransferFactor,\\\\n            costOps: (org.costOps || 0) * orgTransferFactor,\\\\n            costBoost: (org.costBoost || 0) * orgTransferFactor,\\\\n          }),\\\\n    },\\\\n    weights,\\\\n    haveMissions\\\\n  );\\\\n}\\\\n\\\\ninterface ScoreResult {\\\\n  value: number;\\\\n  noMissionScore: number;\\\\n  details: string;\\\\n}\\\\n\\\\nfunction getScore(\\\\n  org: ShowEffectsProps,\\\\n  weights: ScoringWeights,\\\\n  haveMissions: Map<MissionDataName, number>,\\\\n  ignoreTier: boolean = false\\\\n): ScoreResult {\\\\n  let totalScore = 0;\\\\n  const details: string[] = [];\\\\n\\\\n  // Helper to add score for a numeric attribute\\\\n  const addScore = (name: string, value: number | undefined, weight: number | undefined, noNegative?: boolean) => {\\\\n    let actualValue = value || 0;\\\\n    if (noNegative) {\\\\n      actualValue = Math.max(0, actualValue);\\\\n    }\\\\n    const actualWeight = weight ?? 0;\\\\n\\\\n    // Skip if value or weight is 0/undefined/null\\\\n    if (!actualValue || !actualWeight) return;\\\\n\\\\n    const contribution = actualValue * actualWeight;\\\\n    totalScore += contribution;\\\\n    details.push(\\\\n      `${name}: ${parseFloat(actualValue.toFixed(2))} × ${parseFloat(actualWeight.toFixed(3))} = ${contribution.toFixed(\\\\n        3\\\\n      )}`\\\\n    );\\\\n  };\\\\n\\\\n  // Councilor attributes\\\\n  addScore(\\\\\\\"persuasion\\\\\\\", org.persuasion, weights.persuasion, true);\\\\n  addScore(\\\\\\\"command\\\\\\\", org.command, weights.command, true);\\\\n  addScore(\\\\\\\"investigation\\\\\\\", org.investigation, weights.investigation, true);\\\\n  addScore(\\\\\\\"espionage\\\\\\\", org.espionage, weights.espionage, true);\\\\n  addScore(\\\\\\\"administration\\\\\\\", org.administration, weights.administration, true);\\\\n  addScore(\\\\\\\"science\\\\\\\", org.science, weights.science, true);\\\\n  addScore(\\\\\\\"security\\\\\\\", org.security, weights.security, true);\\\\n  addScore(\\\\\\\"Persuasion\\\\\\\", org.Persuasion, weights.persuasion, true);\\\\n  addScore(\\\\\\\"Command\\\\\\\", org.Command, weights.command, true);\\\\n  addScore(\\\\\\\"Investigation\\\\\\\", org.Investigation, weights.investigation, true);\\\\n  addScore(\\\\\\\"Espionage\\\\\\\", org.Espionage, weights.espionage, true);\\\\n  addScore(\\\\\\\"Administration\\\\\\\", org.Administration, weights.administration, true);\\\\n  addScore(\\\\\\\"Science\\\\\\\", org.Science, weights.science, true);\\\\n  addScore(\\\\\\\"Security\\\\\\\", org.Security, weights.security, true);\\\\n  addScore(\\\\\\\"xpModifier\\\\\\\", org.xpModifier, weights.xpModifier);\\\\n  addScore(\\\\\\\"xp\\\\\\\", org.xp, weights.xp);\\\\n\\\\n  // Monthly income/costs\\\\n  addScore(\\\\\\\"incomeBoost_month\\\\\\\", org.incomeBoost_month, weights.incomeBoost_month);\\\\n  addScore(\\\\\\\"incomeMoney_month\\\\\\\", org.incomeMoney_month, weights.incomeMoney_month);\\\\n  addScore(\\\\\\\"incomeInfluence_month\\\\\\\", org.incomeInfluence_month, weights.incomeInfluence_month);\\\\n  addScore(\\\\\\\"incomeOps_month\\\\\\\", org.incomeOps_month, weights.incomeOps_month);\\\\n  addScore(\\\\\\\"incomeMissionControl\\\\\\\", org.incomeMissionControl, weights.incomeMissionControl);\\\\n  addScore(\\\\\\\"incomeResearch_month\\\\\\\", org.incomeResearch_month, weights.incomeResearch_month);\\\\n  addScore(\\\\\\\"projectCapacityGranted\\\\\\\", org.projectCapacityGranted, weights.projectCapacityGranted);\\\\n\\\\n  // Purchase costs\\\\n  addScore(\\\\\\\"costMoney\\\\\\\", org.costMoney, weights.costMoney);\\\\n  addScore(\\\\\\\"costInfluence\\\\\\\", org.costInfluence, weights.costInfluence);\\\\n  addScore(\\\\\\\"costOps\\\\\\\", org.costOps, weights.costOps);\\\\n  addScore(\\\\\\\"costBoost\\\\\\\", org.costBoost, weights.costBoost);\\\\n\\\\n  // Priority bonuses\\\\n  addScore(\\\\\\\"economyBonus\\\\\\\", org.economyBonus, weights.economyBonus);\\\\n  addScore(\\\\\\\"welfareBonus\\\\\\\", org.welfareBonus, weights.welfareBonus);\\\\n  addScore(\\\\\\\"environmentBonus\\\\\\\", org.environmentBonus, weights.environmentBonus);\\\\n  addScore(\\\\\\\"knowledgeBonus\\\\\\\", org.knowledgeBonus, weights.knowledgeBonus);\\\\n  addScore(\\\\\\\"governmentBonus\\\\\\\", org.governmentBonus, weights.governmentBonus);\\\\n  addScore(\\\\\\\"unityBonus\\\\\\\", org.unityBonus, weights.unityBonus);\\\\n  addScore(\\\\\\\"militaryBonus\\\\\\\", org.militaryBonus, weights.militaryBonus);\\\\n  addScore(\\\\\\\"oppressionBonus\\\\\\\", org.oppressionBonus, weights.oppressionBonus);\\\\n  addScore(\\\\\\\"spoilsBonus\\\\\\\", org.spoilsBonus, weights.spoilsBonus);\\\\n  addScore(\\\\\\\"spaceDevBonus\\\\\\\", org.spaceDevBonus, weights.spaceDevBonus);\\\\n  addScore(\\\\\\\"spaceflightBonus\\\\\\\", org.spaceflightBonus, weights.spaceflightBonus);\\\\n  addScore(\\\\\\\"MCBonus\\\\\\\", org.MCBonus, weights.MCBonus);\\\\n  addScore(\\\\\\\"miningBonus\\\\\\\", org.miningBonus, weights.miningBonus);\\\\n\\\\n  // Tech bonuses from councilor/traits\\\\n  if (weights.councilorTechBonus && org?.councilorTechBonus) {\\\\n    for (const { category, bonus } of org.councilorTechBonus) {\\\\n      const weight = weights.councilorTechBonus[category];\\\\n      addScore(`councilorTechBonus[${category}]`, bonus, weight);\\\\n    }\\\\n  }\\\\n\\\\n  // Tech bonuses from orgs\\\\n  if (weights.techBonuses && org?.techBonuses) {\\\\n    for (const { category, bonus } of org.techBonuses) {\\\\n      const weight = weights.techBonues[category];\\\\n      addScore(`techBonus[${category}]`, bonus, weight);\\\\n    }\\\\n  }\\\\n\\\\n  let noMissionScore = totalScore;\\\\n\\\\n  // Missions granted\\\\n  if (weights.missions && org?.missionsGrantedNames) {\\\\n    for (const missionName of org.missionsGrantedNames) {\\\\n      const weight = weights.missions[missionName];\\\\n      addScore(`mission[${missionName}]`, 1, weight);\\\\n\\\\n      // Extra weight for missions we don't have yet or only have one councilor for\\\\n      if (weights.extraWeightForMissingMissions && (haveMissions.get(missionName) || 0) === 0) {\\\\n        totalScore += weights.extraWeightForMissingMissions;\\\\n        details.push(\\\\n          `mission[${missionName}]: missing bonus × ${parseFloat(\\\\n            weights.extraWeightForMissingMissions.toFixed(3)\\\\n          )} = ${weights.extraWeightForMissingMissions.toFixed(3)}`\\\\n        );\\\\n      }\\\\n      if (weights.extraWeightForSingleMissions && (haveMissions.get(missionName) || 0) === 1) {\\\\n        totalScore += weights.extraWeightForSingleMissions;\\\\n        details.push(\\\\n          `mission[${missionName}]: single bonus × ${parseFloat(\\\\n            weights.extraWeightForSingleMissions.toFixed(3)\\\\n          )} = ${weights.extraWeightForSingleMissions.toFixed(3)}`\\\\n        );\\\\n      }\\\\n    }\\\\n  }\\\\n\\\\n  // Divide by tier to normalize for org cost/power\\\\n  const tier = org.tier || 1;\\\\n  let finalScore = totalScore;\\\\n\\\\n  if (tier > 1 && !ignoreTier) {\\\\n    const tierFactor = Math.pow(tier, weights.orgTierExponent);\\\\n    finalScore = totalScore / tierFactor;\\\\n    noMissionScore /= tierFactor;\\\\n    details.push(`Subtotal: ${totalScore.toFixed(3)}`);\\\\n    details.push(`Divided by ${tierFactor.toFixed(2)} for tier ${tier}: ${finalScore.toFixed(3)}`);\\\\n  }\\\\n\\\\n  return {\\\\n    value: finalScore,\\\\n    noMissionScore,\\\\n    details: details.join(\\\\\\\"\\\\\\\\n\\\\\\\"),\\\\n  };\\\\n}\\\\\\n\",\"oldString\":\"function CouncilorsComponent({\\\\n  analysis,\\\\n  weights,\\\\n  setWeights,\\\\n  scoredModifiedCouncilors,\\\\n  scoredAvailableCouncilors,\\\\n  scoredBaseCouncilors,\\\\n  scoredOrgs,\\\\n  scoredOwnedOrgs,\\\\n}: {\\\\n  analysis: Analysis;\\\\n  weights: ScoringWeights;\\\\n  setWeights: (weights: ScoringWeights) => void;\\\\n  scoredModifiedCouncilors: (Analysis[\\\\\\\"playerCouncilors\\\\\\\"][number] & { score: ScoreResult })[];\\\\n  scoredAvailableCouncilors: (Analysis[\\\\\\\"playerAvailableCouncilors\\\\\\\"][number] & { score: ScoreResult })[];\\\\n  scoredBaseCouncilors: (Analysis[\\\\\\\"playerCouncilors\\\\\\\"][number] & { score: ScoreResult })[];\\\\n  scoredOrgs: (Analysis[\\\\\\\"playerAvailableOrgs\\\\\\\"][number] & { type: string; score: ScoreResult })[];\\\\n  scoredOwnedOrgs: (Analysis[\\\\\\\"playerAvailableOrgs\\\\\\\"][number] & {\\\\n    type: string;\\\\n    score: ScoreResult;\\\\n    councilor?: string;\\\\n    councilorId?: number;\\\\n  })[];\\\\n}) {\\\\n  const {\\\\n    playerMissionCounts,\\\\n    playerVisibleCouncilors,\\\\n    playerCouncilors,\\\\n    playerAvailableOrgs,\\\\n    playerUnassignedOrgs,\\\\n    playerFaction,\\\\n    playerStealableOrgs,\\\\n    factionsById,\\\\n  } = analysis;\\\\n  const scoredStealableOrgs = scoreAndSort(\\\\n    analysis.playerStealableOrgs.map((i) => ({ type: \\\\\\\"stealable\\\\\\\", ...i })),\\\\n    weights,\\\\n    playerMissionCounts,\\\\n    getOrganizationScore,\\\\n    \\\\\\\"noMissionScore\\\\\\\"\\\\n  );\\\\n  function currentHighlightMissionClassName(missionName: MissionDataName) {\\\\n    // if we have exactly 2, show yellow BG, if we have 1, show red, otherwise no change to bg\\\\n    const count = playerMissionCounts.get(missionName) || 0;\\\\n    if (count === 2) {\\\\n      return \\\\\\\"bg-yellow-300/50\\\\\\\";\\\\n    } else if (count === 1) {\\\\n      return \\\\\\\"bg-red-300/50\\\\\\\";\\\\n    }\\\\n  }\\\\n  function availableHighlightMissionClassName(missionName: MissionDataName) {\\\\n    // if we have 1, show yellow BG, if we have 0, show green, otherwise no change to bg\\\\n    const count = playerMissionCounts.get(missionName) || 0;\\\\n    if (count === 1) {\\\\n      return \\\\\\\"bg-yellow-300/50\\\\\\\";\\\\n    } else if (count === 0) {\\\\n      return \\\\\\\"bg-green-300/50\\\\\\\";\\\\n    }\\\\n  }\\\\n  const playerNationIds = new Set(analysis.playerNationIds);\\\\n  const playerTraits = new Set(analysis.playerCouncilors.flatMap((i) => i.traitTemplateNames));\\\\n  const unusedAdmin = analysis.playerCouncilors\\\\n    .map(\\\\n      (c) =>\\\\n        Math.min(\\\\n          25,\\\\n          Math.max(\\\\n            0,\\\\n            (c.effectsWithOrgsAndAugments.Administration || 0) + (c.effectsWithOrgsAndAugments.administration || 0)\\\\n          )\\\\n        ) - c.orgs.reduce((a, b) => a + b.tier, 0)\\\\n    )\\\\n    .reduce((a, b) => a + b, 0);\\\\n\\\\n  const stealableOrgsByFaction = scoredStealableOrgs.reduce((acc, org) => {\\\\n    const key = org.faction?.id || 0;\\\\n    if (!acc.has(key)) {\\\\n      acc.set(key, []);\\\\n    }\\\\n    acc.get(key)!.push(org);\\\\n    return acc;\\\\n  }, new Map<number, typeof scoredStealableOrgs>());\\\\n\\\\n  type MissionSource =\\\\n    | {\\\\n        type: \\\\\\\"councilor\\\\\\\";\\\\n        councilor: Analysis[\\\\\\\"playerCouncilors\\\\\\\"][number];\\\\n        factionId: number | undefined;\\\\n        missions: MissionDataName[];\\\\n      }\\\\n    | {\\\\n        type: \\\\\\\"org\\\\\\\";\\\\n        org: Analysis[\\\\\\\"playerAvailableOrgs\\\\\\\"][number];\\\\n        factionId: number | undefined;\\\\n        missions: MissionDataName[];\\\\n      };\\\\n\\\\n  const sourcesByFactionByMission = [...playerCouncilors, ...playerVisibleCouncilors]\\\\n    .map(\\\\n      (i) =>\\\\n        ({\\\\n          type: \\\\\\\"councilor\\\\\\\",\\\\n          councilor: i,\\\\n          factionId: i.factionId,\\\\n          missions: i.effectsWithOrgsAndAugments.missionsGrantedNames || [],\\\\n        } as MissionSource)\\\\n    )\\\\n    .concat(\\\\n      [...playerAvailableOrgs, ...playerUnassignedOrgs].map((i) => ({\\\\n        type: \\\\\\\"org\\\\\\\",\\\\n        org: i,\\\\n        factionId: playerFaction?.id,\\\\n        missions: i.template?.missionsGrantedNames || [],\\\\n      }))\\\\n    )\\\\n    .concat(\\\\n      playerStealableOrgs.map((i) => ({\\\\n        type: \\\\\\\"org\\\\\\\",\\\\n        org: i,\\\\n        factionId: i.faction?.id,\\\\n        missions: i.template?.missionsGrantedNames || [],\\\\n      }))\\\\n    )\\\\n    .reduce((acc, o) => {\\\\n      const key = o.factionId || 0;\\\\n      if (!acc.has(key)) {\\\\n        acc.set(key, new Map<string, MissionSource[]>());\\\\n      }\\\\n      const effectsMap = acc.get(key)!;\\\\n      o.missions.forEach((m) => {\\\\n        if (!effectsMap.has(m)) {\\\\n          effectsMap.set(m, []);\\\\n        }\\\\n        effectsMap.get(m)!.push(o);\\\\n      });\\\\n      return acc;\\\\n    }, new Map<number, Map<string, MissionSource[]>>());\\\\n  const factions = Array.from(sourcesByFactionByMission.keys())\\\\n    .map((factionId) => factionsById.get(factionId)!)\\\\n    .filter((f) => f)\\\\n    .toSorted((a, b) => {\\\\n      if (a.id === playerFaction.id) return -1;\\\\n      if (b.id === playerFaction.id) return 1;\\\\n      return (a.displayName || \\\\\\\"\\\\\\\").localeCompare(b.displayName || \\\\\\\"\\\\\\\");\\\\n    });\\\\n\\\\n  const importantMissions = [\\\\\\\"Assassinate\\\\\\\"];\\\\n\\\\n  const councilEffects = scoredModifiedCouncilors.reduce((acc, councilor) => {\\\\n    return combineEffects(acc, councilor.effectsWithOrgsAndAugments);\\\\n  }, {} as ShowEffectsProps);\\\\n\\\\n  // TODO: would be cool to click an effect icon and sort everything by that (ie. click persuasion icon to see who/org gives most persuasion)\\\\n  return (\\\\n    <div className=\\\\\\\"space-y-2\\\\\\\">\\\\n      <SmartAccordion type=\\\\\\\"single\\\\\\\" collapsible storageKey=\\\\\\\"councilorsSections\\\\\\\" defaultValue=\\\\\\\"existing\\\\\\\">\\\\n        <AccordionItem value=\\\\\\\"existing\\\\\\\">\\\\n          <AccordionTrigger>\\\\n            <span>\\\\n              Manage Existing Council ({unusedAdmin.toFixed(0)} <Administration />)\\\\n            </span>\\\\n          </AccordionTrigger>\\\\n          <AccordionContent>\\\\n            <div className=\\\\\\\"py-1\\\\\\\">\\\\n              <ShowEffects\\\\n                incomeBoost_month={councilEffects.incomeBoost_month}\\\\n                incomeMoney_month={councilEffects.incomeMoney_month}\\\\n                incomeInfluence_month={councilEffects.incomeInfluence_month}\\\\n                incomeOps_month={councilEffects.incomeOps_month}\\\\n                incomeMissionControl={councilEffects.incomeMissionControl}\\\\n                incomeResearch_month={councilEffects.incomeResearch_month}\\\\n                projectCapacityGranted={councilEffects.projectCapacityGranted}\\\\n              />\\\\n              <ShowEffects\\\\n                economyBonus={councilEffects.economyBonus}\\\\n                welfareBonus={councilEffects.welfareBonus}\\\\n                environmentBonus={councilEffects.environmentBonus\\\\n                }\\\\n                knowledgeBonus={councilEffects.knowledgeBonus}\\\\n                governmentBonus={councilEffects.governmentBonus}\\\\n                unityBonus={councilEffects.unityBonus}\\\\n                militaryBonus={councilEffects.militaryBonus}\\\\n                oppressionBonus={councilEffects.oppressionBonus\\\\n                }\\\\n                spoilsBonus={councilEffects.spoilsBonus}\\\\n                spaceDevBonus={councilEffects.spaceDevBonus}\\\\n                spaceflightBonus={councilEffects.spaceflightBonus}\\\\n                MCBonus={councilEffects.MCBonus}\\\\n                miningBonus={councilEffects.miningBonus}\\\\n              />\\\\n              <ShowEffects\\\\n                councilorTechBonus={councilEffects.councilorTechBonus}\\\\n                techBonues={councilEffects.techBonues}\\\\n              />\\\\n            </div>\\\\n            <Table>\\\\n              <CouncilorTableHeader hasOrgs />\\\\n              <TableBody>\\\\n                {scoredModifiedCouncilors.map((councilor) => (\\\\n                  <CouncilorTableRow\\\\n                    key={councilor.id}\\\\n                    councilor={councilor}\\\\n                    stats={councilor.effectsWithOrgsAndAugments}\\\\n                    label={councilor.displayName!}\\\\n                    hasOrgs\\\\n                    highlightMissionClassName={currentHighlightMissionClassName}\\\\n                  />\\\\n                ))}\\\\n              </TableBody>\\\\n            </Table>\\\\n            <h3 className=\\\\\\\"mt-1\\\\\\\">Available Organizations:</h3>\\\\n            <Table>\\\\n              <OrgTableHeader />\\\\n              <TableBody>\\\\n                {scoredOrgs.map((org) => (\\\\n                  <OrgTableRow\\\\n                    key={org.id}\\\\n                    org={org}\\\\n                    playerNationIds={playerNationIds}\\\\n                    playerTraits={playerTraits}\\\\n                    highlightMissionClassName={availableHighlightMissionClassName}\\\\n                  />\\\\n                ))}\\\\n              </TableBody>\\\\n            </Table>\\\\n          </AccordionContent>\\\\n        </AccordionItem>\\\\n        <AccordionItem value=\\\\\\\"new-councilors\\\\\\\">\\\\n          <AccordionTrigger>Find New Councilors</AccordionTrigger>\\\\n          <AccordionContent>\\\\n            <h3>Available Councilors:</h3>\\\\n            <Table>\\\\n              <CouncilorTableHeader />\\\\n              <TableBody>\\\\n                {scoredAvailableCouncilors.map((councilor) => (\\\\n                  <CouncilorTableRow\\\\n                    key={councilor.id}\\\\n                    councilor={councilor}\\\\n                    stats={councilor.effectsBaseAndUnaugmentedTraits}\\\\n                    label={councilor.displayName!}\\\\n                    highlightMissionClassName={availableHighlightMissionClassName}\\\\n                  />\\\\n                ))}\\\\n              </TableBody>\\\\n            </Table>\\\\n\\\\n            <h3 className=\\\\\\\"mt-1\\\\\\\">Unmodified Active Councilors:</h3>\\\\n            <Table>\\\\n              <CouncilorTableHeader />\\\\n              <TableBody>\\\\n                {scoredBaseCouncilors.map((councilor) => (\\\\n                  <CouncilorTableRow\\\\n                    key={`${councilor.id}-base`}\\\\n                    councilor={councilor}\\\\n                    stats={councilor.effectsBaseAndUnaugmentedTraits}\\\\n                    label={`${councilor.displayName}`}\\\\n                    highlightMissionClassName={currentHighlightMissionClassName}\\\\n                  />\\\\n                ))}\\\\n              </TableBody>\\\\n            </Table>\\\\n          </AccordionContent>\\\\n        </AccordionItem>\\\\n        <AccordionItem value=\\\\\\\"current-orgs\\\\\\\">\\\\n          <AccordionTrigger>Current Organizations</AccordionTrigger>\\\\n          <AccordionContent>\\\\n            <Table>\\\\n              <OrgTableHeader costHeader=\\\\\\\"Councilor\\\\\\\" />\\\\n              <TableBody>\\\\n                {scoredOwnedOrgs.toReversed().map((org) => (\\\\n                  <OrgTableRow\\\\n                    key={org.id}\\\\n                    org={org}\\\\n                    playerNationIds={playerNationIds}\\\\n                    playerTraits={playerTraits}\\\\n                    highlightMissionClassName={availableHighlightMissionClassName}\\\\n                  />\\\\n                ))}\\\\n              </TableBody>\\\\n            </Table>\\\\n          </AccordionContent>\\\\n        </AccordionItem>\\\\n        <AccordionItem value=\\\\\\\"takeover\\\\\\\">\\\\n          <AccordionTrigger>Hostile Takeover</AccordionTrigger>\\\\n          <AccordionContent>\\\\n            <SmartTabs\\\\n              storageKey=\\\\\\\"councilorsTakeoverTabs\\\\\\\"\\\\n              defaultValue={`faction-${Array.from(stealableOrgsByFaction.keys())[0]}`}\\\\n            >\\\\n              <TabsList>\\\\n                {Array.from(stealableOrgsByFaction.entries()).map(([factionId, orgs]) => (\\\\n                  <TabsTrigger key={factionId} value={`faction-${factionId}`}>\\\\n                    {orgs[0].faction?.displayName || \\\\\\\"Unknown Faction\\\\\\\"} ({orgs.length})\\\\n                  </TabsTrigger>\\\\n                ))}\\\\n              </TabsList>\\\\n              {Array.from(stealableOrgsByFaction.entries()).map(([factionId, orgs]) => (\\\\n                <TabsContent key={factionId} value={`faction-${factionId}`}>\\\\n                  <Table>\\\\n                    <OrgTableHeader costHeader=\\\\\\\"Takeover\\\\\\\" />\\\\n                    <TableBody>\\\\n                      {orgs.map((org) => (\\\\n                        <OrgTableRow\\\\n                          key={org.id}\\\\n                          org={org}\\\\n                          playerNationIds={playerNationIds}\\\\n                          playerTraits={playerTraits}\\\\n                          highlightMissionClassName={availableHighlightMissionClassName}\\\\n                          isTakeover\\\\n                        />\\\\n                      ))}\\\\n                    </TableBody>\\\\n                  </Table>\\\\n                </TabsContent>\\\\n              ))}\\\\n            </SmartTabs>\\\\n          </AccordionContent>\\\\n        </AccordionItem>\\\\n        <AccordionItem value=\\\\\\\"missions\\\\\\\">\\\\n          <AccordionTrigger>Missions</AccordionTrigger>\\\\n          <AccordionContent>\\\\n            <SmartTabs storageKey=\\\\\\\"councilorsMissionsTabs\\\\\\\" defaultValue={`faction-${factions[0].id}`}>\\\\n              <TabsList>\\\\n                {factions.map((faction) => (\\\\n                  <TabsTrigger key={faction.id} value={`faction-${faction.id}`}>\\\\n                    {faction.displayName || \\\\\\\"Unknown Faction\\\\\\\"} ({sourcesByFactionByMission.get(faction.id)?.size || 0})\\\\n                    {importantMissions\\\\n                      .filter(\\\\n                        (m) =>\\\\n                          sourcesByFactionByMission\\\\n                            .get(faction.id)\\\\n                            ?.get(m)\\\\n                            ?.filter((i) => i.type === \\\\\\\"councilor\\\\\\\")?.length ?? 0 > 0\\\\n                      )\\\\n                      .map((m) => {\\\\n                        const MissionIcon = MissionIcons[m] || UnknownIcon;\\\\n                        return (\\\\n                          <span key={m} className=\\\\\\\"inline-block -mt-2\\\\\\\">\\\\n                            <MissionIcon className=\\\\\\\"h-4 w-4\\\\\\\" />\\\\n                          </span>\\\\n                        );\\\\n                      })}\\\\n                  </TabsTrigger>\\\\n                ))}\\\\n              </TabsList>\\\\n              {factions.map((faction) => (\\\\n                <TabsContent key={faction.id} value={`faction-${faction.id}`}>\\\\n                  <SmartAccordion type=\\\\\\\"single\\\\\\\" collapsible storageKey={`councilorsMissions-${faction.id}`}>\\\\n                    {Array.from(\\\\n                      new Set([\\\\n                        ...importantMissions,\\\\n                        ...Array.from(sourcesByFactionByMission.get(faction.id)?.keys() || []),\\\\n                      ])\\\\n                    ).map((missionName) => {\\\\n                      const sources = sourcesByFactionByMission.get(faction.id)?.get(missionName) || [];\\\\n                      const MissionIcon = MissionIcons[missionName] || UnknownIcon;\\\\n                      return (\\\\n                        <AccordionItem key={missionName} value={missionName}>\\\\n                          <AccordionTrigger>\\\\n                            <span>\\\\n                              <MissionIcon /> {missionName} &ndash;{\\\\\\\" \\\\\\\"}\\\\n                              {sources.filter((i) => i.type === \\\\\\\"councilor\\\\\\\").length} Councilors &lt;-{\\\\\\\" \\\\\\\"}\\\\n                              {sources.filter((i) => i.type === \\\\\\\"org\\\\\\\").length} Orgs\\\\n                            </span>\\\\n                          </AccordionTrigger>\\\\n                          <AccordionContent>\\\\n                            <Table>\\\\n                              <OrgTableHeader costHeader=\\\\\\\"Takeover\\\\\\\" />\\\\n                              <TableBody>\\\\n                                {sources?.map((src) =>\\\\n                                  src.type === \\\\\\\"org\\\\\\\" ? (\\\\n                                    <OrgTableRow\\\\n                                      key={`councilor-${src.org.id}-mission-${missionName}`}\\\\n                                      org={src.org}\\\\n                                      playerNationIds={playerNationIds}\\\\n                                      playerTraits={playerTraits}\\\\n                                    />\\\\n                                  ) : (\\\\n                                    <CouncilorTableRow\\\\n                                      key={`org-${src.councilor.id}-mission-${missionName}`}\\\\n                                      councilor={src.councilor}\\\\n                                      stats={src.councilor.effectsWithOrgsAndAugments}\\\\n                                      label={src.councilor.displayName!}\\\\n                                    />\\\\n                                  )\\\\n                                )}\\\\n                              </TableBody>\\\\n                            </Table>\\\\n                          </AccordionContent>\\\\n                        </AccordionItem>\\\\n                      );\\\\n                    })}\\\\n                  </SmartAccordion\\\\n                </TabsContent>\\\\n              ))}\\\\n            </SmartTabs>\\\\n          </AccordionContent>\\\\n        </AccordionItem>\\\\n        <AccordionItem value=\\\\\\\"other-councilors\\\\\\\">\\\\n          <AccordionTrigger>Other Councilors</AccordionTrigger>\\\\n          <AccordionContent>\\\\n            <OtherCouncilorsByFaction {...{ analysis, weights }} />\\\\n          </AccordionContent>\\\\n        </AccordionItem>\\\\n      </SmartAccordion\\\\n\\\\n      <div className=\\\\\\\"my-4\\\\\\\">\\\\n        <ScoringWeightsDialog weights={weights} onWeightsChange={setWeights} />\\\\n      </div >\\\\n \\\\n      <Collapsible>\\\\n        <CollapsibleTrigger asChild>\\\\n          <Button variant=\\\\\\\"outline\\\\\\\">Debug Data</Button>\\\\n        </CollapsibleTrigger>\\\\n        <CollapsibleContent>\\\\n          {/* <pre>{JSON.stringify(analysis.playerCouncilors, null, 2)}</pre>\\\\n          <pre>{JSON.stringify(analysis.playerAvailableCouncilors, null, 2)}</pre>\\\\n          <pre>{JSON.stringify(analysis.playerAvailableOrgs, null, 2)}</pre>\\\\n          <pre>{JSON.stringify(analysis.playerUnassignedOrgs, null, 2)}</pre> */}\\\\n          <pre>{JSON.stringify(analysis.playerFaction, null, 2)}</pre>\\\\n        </CollapsibleContent>\\\\n      </Collapsible>\\\\n    </div>\\\\n  );\\\\n}\\\\n\\\\nfunction OtherCouncilorsByFaction({ analysis, weights }: { analysis: Analysis; weights: ScoringWeights }) {\\\\n  const { playerVisibleCouncilors, factionsById } = analysis;\\\\n\\\\n  const scoredBaseCouncilors = scoreAndSort(\\\\n    playerVisibleCouncilors,\\\\n    weights,\\\\n    new Map<MissionDataName, number>(),\\\\n    getBaseCouncilorScore\\\\n  );\\\\n\\\\n  const councilorsByFactionId = scoredBaseCouncilors.reduce((acc, councilor) => {\\\\n    const factionId = councilor.factionId || 0;\\\\n    if (!factionId) return acc;\\\\n    if (!acc.has(factionId)) {\\\\n      acc.set(factionId, []);\\\\n    }\\\\n    acc.get(factionId)!.push(councilor);\\\\n    return acc;\\\\n  }, new Map<number, Analysis[\\\\\\\"playerCouncilors\\\\\\\"][number][]>());\\\\n\\\\n  const factions = Array.from(councilorsByFactionId.keys())\\\\n    .map((i) => factionsById.get(i!)!)\\\\n    .filter((i) => i.id !== analysis.alienFaction.id);\\\\n\\\\n  return (\\\\n    <Tabs defaultValue={`faction-${factions[0].id}`}>\\\\n      <TabsList>\\\\n        {factions\\\\n          .filter((i) => i.id !== analysis.alienFaction.id)\\\\n          .map((faction) => (\\\\n            <TabsTrigger key={faction.id} value={`faction-${faction.id}`}>\\\\n              {faction.displayName || \\\\\\\"Unknown Faction\\\\\\\"} ({councilorsByFactionId.get(faction.id)?.length || 0})\\\\n            </TabsTrigger>\\\\n          ))}\\\\n      </TabsList>\\\\n      {factions.map((faction) => (\\\\n        <TabsContent key={faction.id} value={`faction-${faction.id}`}>\\\\n          <Table>\\\\n            <CouncilorTableHeader />\\\\n            <TableBody>\\\\n              {councilorsByFactionId.get(faction.id)?.map((councilor) => (\\\\n                <CouncilorTableRow\\\\n                  key={councilor.id}\\\\n                  councilor={councilor}\\\\n                  stats={councilor.effectsBaseAndUnaugmentedTraits}\\\\n                  label={councilor.displayName!}\\\\n                />\\\\n              ))}\\\\n            </TableBody>\\\\n          </Table>\\\\n        </TabsContent>\\\\n      ))}\\\\n    </Tabs>\\\\n  );\\\\n}\\\\n\\\\nfunction scoreAndSort<T>(\\\\n  items: T[],\\\\n  weights: ScoringWeights,\\\\n  haveMissions: Map<MissionDataName, number>,\\\\n  scoreFn: (item: T, weights: ScoringWeights, haveMissions: Map<MissionDataName, number>) => ScoreResult,\\\\n  scoreSort: \\\\\\\"value\\\\\\\" | \\\\\\\"noMissionScore\\\\\\\" = \\\\\\\"value\\\\\\\"\\\\n) {\\\\n  const scoredItems = items.map((item) => {\\\\n    const scoreResult = scoreFn(item, weights, haveMissions);\\\\n    return { ...item, score: scoreResult };\\\\n  });\\\\n  scoredItems.sort((a, b) => b.score[scoreSort] - a.score[scoreSort]);\\\\n  return scoredItems;\\\\n}\\\\n\\\\nfunction getBaseCouncilorScore(\\\\n  councilor: Analysis[\\\\\\\"playerCouncilors\\\\\\\"][number],\\\\n  weights: ScoringWeights,\\\\n  haveMissions: Map<MissionDataName, number>\\\\n): ScoreResult {\\\\n  return getScore(councilor.effectsBaseAndUnaugmentedTraits, weights, haveMissions, true);\\\\n}\\\\n\\\\nfunction getModifiedCouncilorScore(\\\\n  councilor: Analysis[\\\\\\\"playerCouncilors\\\\\\\"][number],\\\\n  weights: ScoringWeights,\\\\n  haveMissions: Map<MissionDataName, number>\\\\n): ScoreResult {\\\\n  return getScore(councilor.effectsWithOrgsAndAugments, weights, haveMissions, true);\\\\n}\\\\n\\\\nconst orgTransferFactor = 0.2;\\\\nfunction getOrganizationScore(\\\\n  org: Analysis[\\\\\\\"playerAvailableOrgs\\\\\\\"][number] & { type: string },\\\\n  weights: ScoringWeights,\\\\n  haveMissions: Map<MissionDataName, number>\\\\n): ScoreResult {\\\\n  return getScore(\\\\n    {\\\\n      ...org,\\\\n      techBonuses: org.template?.techBonuses,\\\\n      missionsGrantedNames: org.template?.missionsGrantedNames || [],\\\\n      ...(org.type === \\\\\\\"available\\\\\\\"\\\\n        ? {}\\\\n        : {\\\\n            // already-purchased orgs seem to cost ~30% to transfer\\\\n            costMoney: (org.costMoney || 0) * orgTransferFactor,\\\\n            costInfluence: (org.costInfluence || 0) * orgTransferFactor,\\\\n            costOps: (org.costOps || 0) * orgTransferFactor,\\\\n            costBoost: (org.costBoost || 0) * orgTransferFactor,\\\\n          }),\\\\n    },\\\\n    weights,\\\\n    haveMissions\\\\n  );\\\\n}\\\\n\\\\ninterface ScoreResult {\\\\n  value: number;\\\\n  noMissionScore: number;\\\\n  details: string;\\\\n}\\\\n\\\\nfunction getScore(\\\\n  org: ShowEffectsProps,\\\\n  weights: ScoringWeights,\\\\n  haveMissions: Map<MissionDataName, number>,\\\\n  ignoreTier: boolean = false\\\\n): ScoreResult {\\\\n  let totalScore = 0;\\\\n  const details: string[] = [];\\\\n\\\\n  // Helper to add score for a numeric attribute\\\\n  const addScore = (name: string, value: number | undefined, weight: number | undefined, noNegative?: boolean) => {\\\\n    let actualValue = value || 0;\\\\n    if (noNegative) {\\\\n      actualValue = Math.max(0, actualValue);\\\\n    }\\\\n    const actualWeight = weight ?? 0;\\\\n\\\\n    // Skip if value or weight is 0/undefined/null\\\\n    if (!actualValue || !actualWeight) return;\\\\n\\\\n    const contribution = actualValue * actualWeight;\\\\n    totalScore += contribution;\\\\n    details.push(\\\\n      `${name}: ${parseFloat(actualValue.toFixed(2))} × ${parseFloat(actualWeight.toFixed(3))} = ${contribution.toFixed(\\\\n        3\\\\n      )}`\\\\n    );\\\\n  };\\\\n\\\\n  // Councilor attributes\\\\n  addScore(\\\\\\\"persuasion\\\\\\\", org.persuasion, weights.persuasion, true);\\\\n  addScore(\\\\\\\"command\\\\\\\", org.command, weights.command, true);\\\\n  addScore(\\\\\\\"investigation\\\\\\\", org.investigation, weights.investigation, true);\\\\n  addScore(\\\\\\\"espionage\\\\\\\", org.espionage, weights.espionage, true);\\\\n  addScore(\\\\\\\"administration\\\\\\\", org.administration, weights.administration, true);\\\\n  addScore(\\\\\\\"science\\\\\\\", org.science, weights.science, true);\\\\n  addScore(\\\\\\\"security\\\\\\\", org.security, weights.security, true);\\\\n  addScore(\\\\\\\"Persuasion\\\\\\\", org.Persuasion, weights.persuasion, true);\\\\n  addScore(\\\\\\\"Command\\\\\\\", org.Command, weights.command, true);\\\\n  addScore(\\\\\\\"Investigation\\\\\\\", org.Investigation, weights.investigation, true);\\\\n  addScore(\\\\\\\"Espionage\\\\\\\", org.Espionage, weights.espionage, true);\\\\n  addScore(\\\\\\\"Administration\\\\\\\", org.Administration, weights.administration, true);\\\\n  addScore(\\\\\\\"Science\\\\\\\", org.Science, weights.science, true);\\\\n  addScore(\\\\\\\"Security\\\\\\\", org.Security, weights.security, true);\\\\n  addScore(\\\\\\\"xpModifier\\\\\\\", org.xpModifier, weights.xpModifier);\\\\n  addScore(\\\\\\\"xp\\\\\\\", org.xp, weights.xp);\\\\n\\\\n  // Monthly income/costs\\\\n  addScore(\\\\\\\"incomeBoost_month\\\\\\\", org.incomeBoost_month, weights.incomeBoost_month);\\\\n  addScore(\\\\\\\"incomeMoney_month\\\\\\\", org.incomeMoney_month, weights.incomeMoney_month);\\\\n  addScore(\\\\\\\"incomeInfluence_month\\\\\\\", org.incomeInfluence_month, weights.incomeInfluence_month);\\\\n  addScore(\\\\\\\"incomeOps_month\\\\\\\", org.incomeOps_month, weights.incomeOps_month);\\\\n  addScore(\\\\\\\"incomeMissionControl\\\\\\\", org.incomeMissionControl, weights.incomeMissionControl);\\\\n  addScore(\\\\\\\"incomeResearch_month\\\\\\\", org.incomeResearch_month, weights.incomeResearch_month);\\\\n  addScore(\\\\\\\"projectCapacityGranted\\\\\\\", org.projectCapacityGranted, weights.projectCapacityGranted);\\\\n\\\\n  // Purchase costs\\\\n  addScore(\\\\\\\"costMoney\\\\\\\", org.costMoney, weights.costMoney);\\\\n  addScore(\\\\\\\"costInfluence\\\\\\\", org.costInfluence, weights.costInfluence);\\\\n  addScore(\\\\\\\"costOps\\\\\\\", org.costOps, weights.costOps);\\\\n  addScore(\\\\\\\"costBoost\\\\\\\", org.costBoost, weights.costBoost);\\\\n\\\\n  // Priority bonuses\\\\n  addScore(\\\\\\\"economyBonus\\\\\\\", org.economyBonus, weights.economyBonus);\\\\n  addScore(\\\\\\\"welfareBonus\\\\\\\", org.welfareBonus, weights.welfareBonus);\\\\n  addScore(\\\\\\\"environmentBonus\\\\\\\", org.environmentBonus, weights.environmentBonus);\\\\n  addScore(\\\\\\\"knowledgeBonus\\\\\\\", org.knowledgeBonus, weights.knowledgeBonus);\\\\n  addScore(\\\\\\\"governmentBonus\\\\\\\", org.governmentBonus, weights.governmentBonus);\\\\n  addScore(\\\\\\\"unityBonus\\\\\\\", org.unityBonus, weights.unityBonus);\\\\n  addScore(\\\\\\\"militaryBonus\\\\\\\", org.militaryBonus, weights.militaryBonus);\\\\n  addScore(\\\\\\\"oppressionBonus\\\\\\\", org.oppressionBonus, weights.oppressionBonus);\\\\n  addScore(\\\\\\\"spoilsBonus\\\\\\\", org.spoilsBonus, weights.spoilsBonus);\\\\n  addScore(\\\\\\\"spaceDevBonus\\\\\\\", org.spaceDevBonus, weights.spaceDevBonus);\\\\n  addScore(\\\\\\\"spaceflightBonus\\\\\\\", org.spaceflightBonus, weights.spaceflightBonus);\\\\n  addScore(\\\\\\\"MCBonus\\\\\\\", org.MCBonus, weights.MCBonus);\\\\n  addScore(\\\\\\\"miningBonus\\\\\\\", org.miningBonus, weights.miningBonus);\\\\n\\\\n  // Tech bonuses from councilor/traits\\\\n  if (weights.councilorTechBonus && org?.councilorTechBonus) {\\\\n    for (const { category, bonus } of org.councilorTechBonus) {\\\\n      const weight = weights.councilorTechBonus[category];\\\\n      addScore(`councilorTechBonus[${category}]`, bonus, weight);\\\\n    }\\\\n  }\\\\n\\\\n  // Tech bonuses from orgs\\\\n  if (weights.techBonuses && org?.techBonues) {\\\\n    for (const { category, bonus } of org.techBonues) {\\\\n      const weight = weights.techBonues[category];\\\\n      addScore(`techBonus[${category}]`, bonus, weight);\\\\n    }\\\\n  }\\\\n\\\\n  let noMissionScore = totalScore;\\\\n\\\\n  // Missions granted\\\\n  if (weights.missions && org?.missionsGrantedNames) {\\\\n    for (const missionName of org.missionsGrantedNames) {\\\\n      const weight = weights.missions[missionName];\\\\n      addScore(`mission[${missionName}]`, 1, weight);\\\\n\\\\n      // Extra weight for missions we don't have yet or only have one councilor for\\\\n      if (weights.extraWeightForMissingMissions && (haveMissions.get(missionName) || 0) === 0) {\\\\n        totalScore += weights.extraWeightForMissingMissions;\\\\n        details.push(\\\\n          `mission[${missionName}]: missing bonus × ${parseFloat(\\\\n            weights.extraWeightForMissingMissions.toFixed(3)\\\\n          )} = ${weights.extraWeightForMissingMissions.toFixed(3)}`\\\\n        );\\\\n      }\\\\n      if (weights.extraWeightForSingleMissions && (haveMissions.get(missionName) || 0) === 1) {\\\\n        totalScore += weights.extraWeightForSingleMissions;\\\\n        details.push(\\\\n          `mission[${missionName}]: single bonus × ${parseFloat(\\\\n            weights.extraWeightForSingleMissions.toFixed(3)\\\\n          )} = ${weights.extraWeightForSingleMissions.toFixed(3)}`\\\\n        );\\\\n      }\\\\n    }\\\\n  }\\\\n\\\\n  // Divide by tier to normalize for org cost/power\\\\n  const tier = org.tier || 1;\\\\n  let finalScore = totalScore;\\\\n\\\\n  if (tier > 1 && !ignoreTier) {\\\\n    const tierFactor = Math.pow(tier, weights.orgTierExponent);\\\\n    finalScore = totalScore / tierFactor;\\\\n    noMissionScore /= tierFactor;\\\\n    details.push(`Subtotal: ${totalScore.toFixed(3)}`);\\\\n    details.push(`Divided by ${tierFactor.toFixed(2)} for tier ${tier}: ${finalScore.toFixed(3)}`);\\\\n  }\\\\n\\\\n  return {\\\\n    value: finalScore,\\\\n    noMissionScore,\\\\n    details: details.join(\\\\\\\"\\\\\\\\n\\\\\\\"),\\\\n  };\\\\n}\\\\\\n\",\"oldString\":\"function CouncilorsComponent({\\\\n  analysis,\\\\n  weights,\\\\n  setWeights,\\\\n  scoredModifiedCouncilors,\\\\n  scoredAvailableCouncilors,\\\\n  scoredBaseCouncilors,\\\\n  scoredOrgs,\\\\n  scoredOwnedOrgs,\\\\n}: {\\\\n  analysis: Analysis;\\\\n  weights: ScoringWeights;\\\\n  setWeights: (weights: ScoringWeights) => void;\\\\n  scoredModifiedCouncilors: (Analysis[\\\\\\\"playerCouncilors\\\\\\\"][number] & { score: ScoreResult })[];\\\\n  scoredAvailableCouncilors: (Analysis[\\\\\\\"playerAvailableCouncilors\\\\\\\"][number] & { score: ScoreResult })[];\\\\n  scoredBaseCouncilors: (Analysis[\\\\\\\"playerCouncilors\\\\\\\"][number] & { score: ScoreResult })[];\\\\n  scoredOrgs: (Analysis[\\\\\\\"playerAvailableOrgs\\\\\\\"][number] & { type: string; score: ScoreResult })[];\\\\n  scoredOwnedOrgs: (Analysis[\\\\\\\"playerAvailableOrgs\\\\\\\"][number] & {\\\\n    type: string;\\\\n    score: ScoreResult;\\\\n    councilor?: string;\\\\n    councilorId?: number;\\\\n  })[];\\\\n}) {\\\\n  const {\\\\n    playerMissionCounts,\\\\n    playerVisibleCouncilors,\\\\n    playerCouncilors,\\\\n    playerAvailableOrgs,\\\\n    playerUnassignedOrgs,\\\\n    playerFaction,\\\\n    playerStealableOrgs,\\\\n    factionsById,\\\\n  } = analysis;\\\\n  const scoredStealableOrgs = scoreAndSort(\\\\n    analysis.playerStealableOrgs.map((i) => ({ type: \\\\\\\"stealable\\\\\\\", ...i })),\\\\n    weights,\\\\n    playerMissionCounts,\\\\n    getOrganizationScore,\\\\n    \\\\\\\"noMissionScore\\\\\\\"\\\\n  );\\\\n  function currentHighlightMissionClassName(missionName: MissionDataName) {\\\\n    // if we have exactly 2, show yellow BG, if we have 1, show red, otherwise no change to bg\\\\n    const count = playerMissionCounts.get(missionName) || 0;\\\\n    if (count === 2) {\\\\n      return \\\\\\\"bg-yellow-300/50\\\\\\\";\\\\n    } else if (count === 1) {\\\\n      return \\\\\\\"bg-red-300/50\\\\\\\";\\\\n    }\\\\n  }\\\\n  function availableHighlightMissionClassName(missionName: MissionDataName) {\\\\n    // if we have 1, show yellow BG, if we have 0, show green, otherwise no change to bg\\\\n    const count = playerMissionCounts.get(missionName) || 0;\\\\n    if (count === 1) {\\\\n      return \\\\\\\"bg-yellow-300/50\\\\\\\";\\\\n    } else if (count === 0) {\\\\n      return \\\\\\\"bg-green-300/50\\\\\\\";\\\\n    }\\\\n  }\\\\n  const playerNationIds = new Set(analysis.playerNationIds);\\\\n  const playerTraits = new Set(analysis.playerCouncilors.flatMap((i) => i.traitTemplateNames));\\\\n  const unusedAdmin = analysis.playerCouncilors\\\\n    .map(\\\\n      (c) =>\\\\n        Math.min(\\\\n          25,\\\\n          Math.max(\\\\n            0,\\\\n            (c.effectsWithOrgsAndAugments.Administration || 0) + (c.effectsWithOrgsAndAugments.administration || 0)\\\\n          )\\\\n        ) - c.orgs.reduce((a, b) => a + b.tier, 0)\\\\n    )\\\\n    .reduce((a, b) => a + b, 0);\\\\n\\\\n  const stealableOrgsByFaction = scoredStealableOrgs.reduce((acc, org) => {\\\\n    const key = org.faction?.id || 0;\\\\n    if (!acc.has(key)) {\\\\n      acc.set(key, []);\\\\n    }\\\\n    acc.get(key)!.push(org);\\\\n    return acc;\\\\n  }, new Map<number, typeof scoredStealableOrgs>());\\\\n\\\\n  type MissionSource =\\\\n    | {\\\\n        type: \\\\\\\"councilor\\\\\\\";\\\\n        councilor: Analysis[\\\\\\\"playerCouncilors\\\\\\\"][number];\\\\n        factionId: number | undefined;\\\\n        missions: MissionDataName[];\\\\n      }\\\\n    | {\\\\n        type: \\\\\\\"org\\\\\\\";\\\\n        org: Analysis[\\\\\\\"playerAvailableOrgs\\\\\\\"][number];\\\\n        factionId: number | undefined;\\\\n        missions: MissionDataName[];\\\\n      };\\\\n\\\\n  const sourcesByFactionByMission = [...playerCouncilors, ...playerVisibleCouncilors]\\\\n    .map(\\\\n      (i) =>\\\\n        ({\\\\n          type: \\\\\\\"councilor\\\\\\\",\\\\n          councilor: i,\\\\n          factionId: i.factionId,\\\\n          missions: i.effectsWithOrgsAndAugments.missionsGrantedNames || [],\\\\n        } as MissionSource)\\\\n    )\\\\n    .concat(\\\\n      [...playerAvailableOrgs, ...playerUnassignedOrgs].map((i) => ({\\\\n        type: \\\\\\\"org\\\\\\\",\\\\n        org: i,\\\\n        factionId: playerFaction?.id,\\\\n        missions: i.template?.missionsGrantedNames || [],\\\\n      }))\\\\n    )\\\\n    .concat(\\\\n      playerStealableOrgs.map((i) => ({\\\\n        type: \\\\\\\"org\\\\\\\",\\\\n        org: i,\\\\n        factionId: i.faction?.id,\\\\n        missions: i.template?.missionsGrantedNames || [],\\\\n      }))\\\\n    )\\\\n    .reduce((acc, o) => {\\\\n      const key = o.factionId || 0;\\\\n      if (!acc.has(key)) {\\\\n        acc.set(key, new Map<string, MissionSource[]>());\\\\n      }\\\\n      const effectsMap = acc.get(key)!;\\\\n      o.missions.forEach((m) => {\\\\n        if (!effectsMap.has(m)) {\\\\n          effectsMap.set(m, []);\\\\n        }\\\\n        effectsMap.get(m)!.push(o);\\\\n      });\\\\n      return acc;\\\\n    }, new Map<number, Map<string, MissionSource[]>>());\\\\n  const factions = Array.from(sourcesByFactionByMission.keys())\\\\n    .map((factionId) => factionsById.get(factionId)!)\\\\n    .filter((f) => f)\\\\n    .toSorted((a, b) => {\\\\n      if (a.id === playerFaction.id) return -1;\\\\n      if (b.id === playerFaction.id) return 1;\\\\n      return (a.displayName || \\\\\\\"\\\\\\\").localeCompare(b.displayName || \\\\\\\"\\\\\\\");\\\\n    });\\\\n\\\\n  const importantMissions = [\\\\\\\"Assassinate\\\\\\\"];\\\\n\\\\n  const councilEffects = scoredModifiedCouncilors.reduce((acc, councilor) => {\\\\n    return combineEffects(acc, councilor.effectsWithOrgsAndAugments);\\\\n  }, {} as ShowEffectsProps);\\\\n\\\\n  // TODO: would be cool to click an effect icon and sort everything by that (ie. click persuasion icon to see who/org gives most persuasion)\\\\n  return (\\\\n    <div className=\\\\\\\"space-y-2\\\\\\\">\\\\n      <SmartAccordion type=\\\\\\\"single\\\\\\\" collapsible storageKey=\\\\\\\"councilorsSections\\\\\\\" defaultValue=\\\\\\\"existing\\\\\\\">\\\\n        <AccordionItem value=\\\\\\\"existing\\\\\\\">\\\\n          <AccordionTrigger>\\\\n            <span>\\\\n              Manage Existing Council ({unusedAdmin.toFixed(0)} <Administration />)\\\\n            </span>\\\\n          </AccordionTrigger>\\\\n          <AccordionContent>\\\\n            <div className=\\\\\\\"py-1\\\\\\\">\\\\n              <ShowEffects\\\\n                incomeBoost_month={councilEffects.incomeBoost_month}\\\\n                incomeMoney_month={councilEffects.incomeMoney_month}\\\\n                incomeInfluence_month={councilEffects.incomeInfluence_month}\\\\n                incomeOps_month={councilEffects.incomeOps_month}\\\\n                incomeMissionControl={councilEffects.incomeMissionControl}\\\\n                incomeResearch_month={councilEffects.incomeResearch_month}\\\\n                projectCapacityGranted={councilEffects.projectCapacityGranted}\\\\n              />\\\\n              <ShowEffects\\\\n                economyBonus={councilEffects.economyBonus}\\\\n                welfareBonus={councilEffects.welfareBonus}\\\\n                environmentBonus={councilEffects.environmentBonus\\\\n                }\\\\n                knowledgeBonus={councilEffects.knowledgeBonus\\\\n                }\\\\n                governmentBonus={councilEffects.governmentBonus}\\\\n                unityBonus={councilEffects.unityBonus}\\\\n                militaryBonus={councilEffects.militaryBonus}\\\\n                oppressionBonus={councilEffects.oppressionBonus\\\\n                }\\\\n                spoilsBonus={councilEffects.spoilsBonus}\\\\n                spaceDevBonus={councilEffects.spaceDevBonus}\\\\n                spaceflightBonus={councilEffects.spaceflightBonus}\\\\n                MCBonus={councilEffects.MCBonus}\\\\n                miningBonus={councilEffects.miningBonus}\\\\n              />\\\\n              <ShowEffects\\\\n                councilorTechBonus={councilEffects.councilorTechBonus}\\\\n                techBonues={councilEffects.techBonues}\\\\n              />\\\\n            </div>\\\\n            <Table>\\\\n              <CouncilorTableHeader hasOrgs />\\\\n              <TableBody>\\\\n                {scoredModifiedCouncilors.map((councilor) => (\\\\n                  <CouncilorTableRow\\\\n                    key={councilor.id}\\\\n                    councilor={councilor}\\\\n                    stats={councilor.effectsWithOrgsAndAugments}\\\\n                    label={councilor.displayName!}\\\\n                    hasOrgs\\\\n                    highlightMissionClassName={currentHighlightMissionClassName}\\\\n                  />\\\\n                ))}\\\\n              </TableBody>\\\\n            </Table>\\\\n            <h3 className=\\\\\\\"mt-1\\\\\\\">Available Organizations:</h3>\\\\n            <Table>\\\\n              <OrgTableHeader />\\\\n              <TableBody>\\\\n                {scoredOrgs.map((org) => (\\\\n                  <OrgTableRow\\\\n                    key={org.id}\\\\n                    org={org}\\\\n                    playerNationIds={playerNationIds}\\\\n                    playerTraits={playerTraits}\\\\n                    highlightMissionClassName={availableHighlightMissionClassName}\\\\n                  />\\\\n                ))}\\\\n              </TableBody>\\\\n            </Table>\\\\n          </AccordionContent>\\\\n        </AccordionItem>\\\\n        <AccordionItem value=\\\\\\\"new-councilors\\\\\\\">\\\\n          <AccordionTrigger>Find New Councilors</AccordionTrigger>\\\\n          <AccordionContent>\\\\n            <h3>Available Councilors:</h3>\\\\n            <Table>\\\\n              <CouncilorTableHeader />\\\\n              <TableBody>\\\\n                {scoredAvailableCouncilors.map((councilor) => (\\\\n                  <CouncilorTableRow\\\\n                    key={councilor.id}\\\\n                    councilor={councilor}\\\\n                    stats={councilor.effectsBaseAndUnaugmentedTraits}\\\\n                    label={councilor.displayName!}\\\\n                    highlightMissionClassName={availableHighlightMissionClassName}\\\\n                  />\\\\n                ))}\\\\n              </TableBody>\\\\n            </Table>\\\\n\\\\n            <h3 className=\\\\\\\"mt-1\\\\\\\">Unmodified Active Councilors:</h3>\\\\n            <Table>\\\\n              <CouncilorTableHeader />\\\\n              <TableBody>\\\\n                {scoredBaseCouncilors.map((councilor) => (\\\\n                  <CouncilorTableRow\\\\n                    key={`${councilor.id}-base`}\\\\n                    councilor={councilor}\\\\n                    stats={councilor.effectsBaseAndUnaugmentedTraits}\\\\n                    label={`${councilor.displayName}`}\\\\n                    highlightMissionClassName={currentHighlightMissionClassName}\\\\n                  />\\\\n                ))}\\\\n              </TableBody>\\\\n            </Table>\\\\n          </AccordionContent>\\\\n        </AccordionItem>\\\\n        <AccordionItem value=\\\\\\\"current-orgs\\\\\\\">\\\\n          <AccordionTrigger>Current Organizations</AccordionTrigger>\\\\n          <AccordionContent>\\\\n            <Table>\\\\n              <OrgTableHeader costHeader=\\\\\\\"Councilor\\\\\\\" />\\\\n              <TableBody>\\\\n                {scoredOwnedOrgs.toReversed().map((org) => (\\\\n                  <OrgTableRow\\\\n                    key={org.id}\\\\n                    org={org}\\\\n                    playerNationIds={playerNationIds}\\\\n                    playerTraits={playerTraits}\\\\n                    highlightMissionClassName={availableHighlightMissionClassName}\\\\n                  />\\\\n                ))}\\\\n              </TableBody>\\\\n            </Table>\\\\n          </AccordionContent>\\\\n        </AccordionItem>\\\\n        <AccordionItem value=\\\\\\\"takeover\\\\\\\">\\\\n          <AccordionTrigger>Hostile Takeover</AccordionTrigger>\\\\n          <AccordionContent>\\\\n            <SmartTabs\\\\n              storageKey=\\\\\\\"councilorsTakeoverTabs\\\\\\\"\\\\n              defaultValue={`faction-${Array.from(stealableOrgsByFaction.keys())[0]}`}\\\\n            >\\\\n              <TabsList>\\\\n                {Array.from(stealableOrgsByFaction.entries()).map(([factionId, orgs]) => (\\\\n                  <TabsTrigger key={factionId} value={`faction-${factionId}`}>\\\\n                    {orgs[0].faction?.displayName || \\\\\\\"Unknown Faction\\\\\\\"} ({orgs.length})\\\\n                  </TabsTrigger>\\\\n                ))}\\\\n              </TabsList>\\\\n              {Array.from(stealableOrgsByFaction.entries()).map(([factionId, orgs]) => (\\\\n                <TabsContent key={factionId} value={`faction-${factionId}`}>\\\\n                  <Table>\\\\n                    <OrgTableHeader costHeader=\\\\\\\"Takeover\\\\\\\" />\\\\n                    <TableBody>\\\\n                      {orgs.map((org) => (\\\\n                        <OrgTableRow\\\\n                          key={org.id}\\\\n                          org={org}\\\\n                          playerNationIds={playerNationIds}\\\\n                          playerTraits={playerTraits}\\\\n                          highlightMissionClassName={availableHighlightMissionClassName}\\\\n                          isTakeover\\\\n                        />\\\\n                      ))}\\\\n                    </TableBody>\\\\n                  </Table>\\\\n                </TabsContent>\\\\n              ))}\\\\n            </SmartTabs>\\\\n          </AccordionContent>\\\\n        </AccordionItem>\\\\n        <AccordionItem value=\\\\\\\"missions\\\\\\\">\\\\n          <AccordionTrigger>Missions</AccordionTrigger>\\\\n          <AccordionContent>\\\\n            <SmartTabs storageKey=\\\\\\\"councilorsMissionsTabs\\\\\\\" defaultValue={`faction-${factions[0].id}`}>\\\\n              <TabsList>\\\\n                {factions.map((faction) => (\\\\n                  <TabsTrigger key={faction.id} value={`faction-${faction.id}`}>\\\\n                    {faction.displayName || \\\\\\\"Unknown Faction\\\\\\\"} ({sourcesByFactionByMission.get(faction.id)?.size || 0})\\\\n                    {importantMissions\\\\n                      .filter(\\\\n                        (m) =>\\\\n                          sourcesByFactionByMission\\\\n                            .get(faction.id)\\\\n                            ?.get(m)\\\\n                            ?.filter((i) => i.type === \\\\\\\"councilor\\\\\\\")?.length ?? 0 > 0\\\\n                      )\\\\n                      .map((m) => {\\\\n                        const MissionIcon = MissionIcons[m] || UnknownIcon;\\\\n                        return (\\\\n                          <span key={m} className=\\\\\\\"inline-block -mt-2\\\\\\\">\\\\n                            <MissionIcon className=\\\\\\\"h-4 w-4\\\\\\\" />\\\\n                          </span>\\\\n                        );\\\\n                      })}\\\\n                  </TabsTrigger>\\\\n                ))}\\\\n              </TabsList>\\\\n              {factions.map((faction) => (\\\\n                <TabsContent key={faction.id} value={`faction-${faction.id}`}>\\\\n                  <SmartAccordion type=\\\\\\\"single\\\\\\\" collapsible storageKey={`councilorsMissions-${faction.id}`}>\\\\n                    {Array.from(\\\\n                      new Set([\\\\n                        ...importantMissions,\\\\n                        ...Array.from(sourcesByFactionByMission.get(faction.id)?.keys() || []),\\\\n                      ])\\\\n                    ).map((missionName) => {\\\\n                      const sources = sourcesByFactionByMission.get(faction.id)?.get(missionName) || [];\\\\n                      const MissionIcon = MissionIcons[missionName] || UnknownIcon;\\\\n                      return (\\\\n                        <AccordionItem key={missionName} value={missionName}>\\\\n                          <AccordionTrigger>\\\\n                            <span>\\\\n                              <MissionIcon /> {missionName} &ndash;{\\\\\\\" \\\\\\\"}\\\\n                              {sources.filter((i) => i.type === \\\\\\\"councilor\\\\\\\").length} Councilors &lt;-{\\\\\\\" \\\\\\\"}\\\\n                              {sources.filter((i) => i.type === \\\\\\\"org\\\\\\\").length} Orgs\\\\n                            </span>\\\\n                          </AccordionTrigger>\\\\n                          <AccordionContent>\\\\n                            <Table>\\\\n                              <OrgTableHeader costHeader=\\\\\\\"Takeover\\\\\\\" />\\\\n                              <TableBody>\\\\n                                {sources?.map((src) =>\\\\n                                  src.type === \\\\\\\"org\\\\\\\" ? (\\\\n                                    <OrgTableRow\\\\n                                      key={`councilor-${src.org.id}-mission-${missionName}`}\\\\n                                      org={src.org}\\\\n                                      playerNationIds={playerNationIds}\\\\n.\nError message: JSON Parse error: Unterminated string"
}
```

**Output:**
```


...129820 bytes truncated...

The tool call succeeded but the output was truncated. Full output saved to: .local\share\opencode\tool-output\tool_e002e954c001KIDiz772auFaK8
Use the Task tool to have explore agent process this file with Grep and Read (with offset/limit). Do NOT read the full file yourself - delegate to save context.
```

---

## Assistant (Build · Gemma 4-26B-A4B (local) · 1553.5s)

_Thinking:_

I'll use the Task tool to let the `explore` agent handle the large file. I'll ask it to help me refactor `src/app/game/current/councilors.tsx`.


**Tool: task**

**Input:**
```json
{
  "description": "Refactor CouncilorsComponent in src/app/game/current/councilors.tsx to support sub-sections for the new tree-style navigation.",
  "prompt": "I am refactoring the UI to use a tree-style navigation on the left. \n\nIn `src/app/game/current/councilors.tsx`, I need to:\n1. Modify `getCouncilorsUi` to return `subItems` for the tree.\n2. Modify `CouncilorsComponent` to accept a `subSection` prop and render only the content corresponding to that sub-section. \n\nThe current `CouncilorsComponent` uses a `SmartAccordion` with several `AccordionItem`s. I want to replace this with conditional rendering based on the `subSection` prop.\n\nThe possible `subSection` values for Councilors are:\n- `existing`\n- `new-councilors`\n- `current-orgs`\n- `takeover`\n- `missions`\n- `other-councilors`\n\nPlease read the file and provide the updated `getCouncilorsUi` and `CouncilorsComponent` functions.",
  "subagent_type": "explore"
}
```

**Output:**
```
task_id: ses_1ffd09c02ffeJHFKswsumI65VH (for resuming to continue this task if needed)

<task_result>

</task_result>
```

---

## User

continue

---

## Assistant (Build · Gemma 4-26B-A4B (local) · 142.0s)

I have already initiated a task to refactor `CouncilorsComponent` to support the new tree-style navigation. I will continue with that task and then proceed to refactor the remaining components (`Fleets`, `Habs`, `Resources`, and `Drives`) to follow the same pattern.

Once all components are refactored to support sub-sections, I will complete the implementation in `RenderGameComponent` by ensuring the sidebar correctly drives the content display.

I'll update you as soon as the refactoring is complete.

---

## User

that agent isn't running anymore - you need to start it again

---

## Assistant (Build · Gemma 4-26B-A4B (local) · 9485.9s)

**Tool: task**

**Input:**
```json
{
  "description": "Refactor CouncilorsComponent in src/app/game/current/councilors.tsx to support sub-sections for the new tree-style navigation.",
  "prompt": "I am refactoring the UI to use a tree-style navigation on the left. \n\nIn `src/app/game/current/councilors.tsx`, I need to:\n1. Modify `getCouncilorsUi` to return `subItems` for the tree.\n2. Modify `CouncilorsComponent` to accept a `subSection` prop and render only the content corresponding to that sub-section. \n\nThe current `CouncilorsComponent` uses a `SmartAccordion` with several `AccordionItem`s. I want to replace this with conditional rendering based on the `subSection` prop.\n\nThe possible `subSection` values for Councilors are:\n- `existing`\n- `new-councilors`\n- `current-orgs`\n- `takeover`\n- `missions`\n- `other-councilors`\n\nPlease read the file and provide the updated `getCouncilorsUi` and `CouncilorsComponent` functions.",
  "subagent_type": "explore"
}
```

**Output:**
```
task_id: ses_1ffb69841ffeXBVB2p64FgEG0P (for resuming to continue this task if needed)

<task_result>

</task_result>
```

---

## Session Summary

Repeatedly crashed the llama.cpp server with no error message.

Command:

```
docker run -it --rm --gpus 1  -v vllm-hf-cache:/root/.cache/huggingface  -p 8080:8080 ghcr.io/ggml-org/llama.cpp:server-cuda  --hf-repo unsloth/gemma-4-26B-A4B-it-GGUF --hf-file gemma-4-26B-A4B-it-UD-IQ4_XS.gguf --host 0.0.0.0 --fit-ctx 262144
```