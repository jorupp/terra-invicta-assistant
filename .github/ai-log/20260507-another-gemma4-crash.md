# RenderGameComponent tree navigation redesign

**Session ID:** ses_1ff162201ffehAsakqkwFWq68m
**Created:** 5/7/2026, 12:29:47 AM
**Updated:** 5/7/2026, 1:46:58 AM

---

## User

This app has a very complicated UI that has been built up over a long time by adding lots of little pieces in a surgical manner.  We need to completely reorganize the mini-app in the RenderGameComponent displayed on the page /game/current.  Instead of a series of tabs at the top and expand/collapse sections in the page, there should instead be a (collapsible) tree-style navigation along the left side of the page to select the information to display in the main part of the page.  For example, there should be a "Councilors" tree item, which has the score details as a subtitle, then options below that for "Existing Council", "Find new", etc.  This way each individual thing is more focused, and that tree allows for quickly switching between parts. 

---

## Assistant (Build · Gemma 4-26B-A4B (local) · 24.0s)

_Thinking:_

The user wants to reorganize a UI component called `RenderGameComponent` located at the `/game/current` route.
The current UI uses tabs at the top and expand/collapse sections.
The new UI should feature:
- A collapsible tree-style navigation on the left side.
- The tree should allow selecting information to be displayed in the main part of the page.
- Example: "Councilors" tree item with "score details" as a subtitle, containing sub-options like "Existing Council", "Find new", etc.

Plan:
1.  **Explore the codebase** to find `RenderGameComponent` and understand how the current UI is implemented.
2.  **Analyze the current implementation** of `/game/current` and `RenderGameComponent`.
3.  **Identify the components and state management** used for the tabs and expand/collapse sections.
4.  **Design the new tree-style navigation**.
5.  **Implement the new UI**.
6.  **Verify the changes**.

Let's start by searching for `RenderGameComponent`.

I'll start by searching for the `RenderGameComponent` to understand its current implementation and the structure of the `/game/current` page.



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

## Assistant (Build · Gemma 4-26B-A4B (local) · 5.9s)

_Thinking:_

Since `glob` with `**/*RenderGameComponent*` didn't find anything, it might be a component name but not necessarily in the filename, or I might have misspelled it. I'll try searching for the string "RenderGameComponent" within the codebase using `grep`.


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

## Assistant (Build · Gemma 4-26B-A4B (local) · 6.4s)

_Thinking:_

Okay, the component is defined in `src/app/game/current/component.tsx`.

Now I'll read that file to understand its current structure.


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

---

## Assistant (Build · Gemma 4-26B-A4B (local) · 17.9s)

_Thinking:_

The current implementation uses `SmartTabs` from `@/components/ui/smart-tabs` and several helper functions to get the UI for different categories: `getCouncilorsUi`, `getFleetsUi`, `getHabsUi`, `getResourcesUi`, and `getDrivesUi`.

The `tabs` array is constructed using these functions. Each tab has a `key`, `tab` (the label), and `content`.

The user wants to replace this with a tree-style navigation on the left.

To do this, I need to:
1.  Understand what `getCouncilorsUi`, `getFleetsUi`, etc., return. They seem to return an object with `key`, `tab`, and `content`.
2.  The user mentioned: `For example, there should be a "Councilors" tree item, which has the score details as a subtitle, then options below that for "Existing Council", "Find new", etc.`
    This suggests that the current `getCouncilorsUi` might be returning a single tab, but the user wants it to be a tree node with sub-items.

Let's look at `src/app/game/current/councilors.tsx` to see what `getCouncilorsUi` returns and how it's structured.



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

---

## Assistant (Build · Gemma 4-26B-A4B (local) · 47.8s)

_Thinking:_

The `getCouncilorsUi` function returns an object with `key`, `tab` (which is the label, currently a complex JSX), and `content` (the actual UI).

Inside `CouncilorsComponent`, there's a `SmartAccordion` that manages several sections:
- `existing`: "Manage Existing Council"
- `new-councilors`: "Find New Councilors"
- `current-orgs`: "Current Organizations"
- `takeover`: "Hostile Takeover"
- `missions`: "Missions"
- `other-councilors`: "Other Councilors"

This is exactly what the user wants to turn into a tree structure.

The plan is:
1.  Refactor `RenderGameComponent` to use a layout with a sidebar and a main content area.
2.  The sidebar will contain the tree-style navigation.
3.  Instead of `SmartTabs` using `tabs` array, I'll use a state to track the currently selected "path" in the tree.
4.  I need to restructure how `getCouncilorsUi`, `getFleetsUi`, etc., provide their information so they can be represented in a tree.

Actually, the `tabs` in `RenderGameComponent` are:
- `getCouncilorsUi(analysis)`
- `getFleetsUi(analysis)`
- `getHabsUi(analysis)`
- `getResourcesUi(analysis)`
- `getDrivesUi(analysis)`

Each of these functions currently returns a single "tab". But `getCouncilorsUi` returns a component (`CouncilorsComponent`) which itself uses an accordion to switch between views.

The user wants:
- A tree-style navigation on the left.
- "Councilors" tree item, which has the score details as a subtitle, then options below that for "Existing Council", "Find new", etc.

Wait, "Existing Council", "Find new" etc. are already inside the `CouncilorsComponent` as accordion items.

So, the new structure should be:
- Sidebar (Tree)
  - Councilors (subtitle: score details)
    - Existing Council
    - Find new
    - Current Organizations
    - Hostile Takeover
    - Missions
    - Other Councilors
  - Fleets
    - ...
  - Habs
    - ...
  - Resources
    - ...
  - Drives
    - ...

This means I need to change the return type of `getCouncilorsUi` and the other `get*Ui` functions, OR I need to rethink how the whole thing is structured.

If I change the return type of `getCouncilorsUi` to something like:
```typescript
{
  key: "councilors",
  label: "Councilors",
  subtitle: "...",
  children: [
    { key: "councilors-existing", label: "Existing Council", content: ... },
    { key: "councilors-new", label: "Find new", content: ... },
    ...
  ]
}
```

But `RenderGameComponent` currently just maps over `tabs` and renders them as `TabsTrigger` and `TabsContent`.

Let's first see how `getFleetsUi` is implemented.

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

---

## Assistant (Build · Gemma 4-26B-A4B (local) · 33.3s)

_Thinking:_

`getFleetsUi` is also very similar to `getCouncilorsUi`. It returns an object with `key`, `tab` (which is a JSX label), and `content`.

The `tab` property in `getCouncilorsUi` is quite complex, as it includes some summary information.

The user wants a tree-style navigation. This means I should probably define a common interface for what these functions return, such that it can be rendered as a tree.

```typescript
interface NavItem {
  key: string;
  label: string;
  subtitle?: string;
  children?: NavItem[];
  content?: React.ReactNode;
}
```

Wait, if I have children, how do I know which `content` to show?
If a node has children, clicking it should probably just expand/collapse the children in the tree, and it might not have a `content` of its own, OR it might show a default content.
When a leaf node is clicked, its `content` should be shown in the main area.

Actually, the user said:
`there should be a (collapsible) tree-style navigation along the left side of the page to select the information to display in the main part of the page.`

So:
1.  Sidebar has a tree.
2.  Clicking a leaf node in the tree updates the main content area.

Let's look at the `RenderGameComponent` again.

```tsx
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
...
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
```

I'll propose a new structure.

I will:
1.  Define a `NavigationItem` type.
2.  Update all `get*Ui` functions to return `NavigationItem` instead of the current structure.
3.  Update `RenderGameComponent` to use a sidebar with a tree and a main content area.

Let's see what `getHabsUi`, `getResourcesUi`, and `getDrivesUi` look like.


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

---

## Assistant (Build · Gemma 4-26B-A4B (local) · 39.3s)

_Thinking:_

`getHabsUi` also returns an object with `key`, `tab` and `content`.

The common pattern is:
```typescript
{
  key: string;
  tab: React.ReactNode;
  content: React.ReactNode;
}
```

The user wants to reorganize this.

Let's define a new interface for the navigation structure.

```typescript
interface NavItem {
  id: string; // unique identifier for selection
  label: string; // display label
  subtitle?: string; // subtitle if it's a top-level item
  children?: NavItem[]; // if it has children
  content?: React.ReactNode; // if it's a leaf node, the content to show
}
```

And I will update `RenderGameComponent` to use a Sidebar with this structure.

Wait, if I change all the `get*Ui` functions, it might be a lot of work.
Let's see if I can just wrap them.

The current `get*Ui` functions return:
- `key`: a string (e.g., "councilors")
- `tab`: a JSX element (the label, often with extra info)
- `content`: a JSX element (the actual content)

If I want to support sub-items, I'll need to change how these functions are called or what they return.

The user specifically mentioned:
`For example, there should be a "Councilors" tree item, which has the score details as a subtitle, then options below that for "Existing Council", "Find new", etc.`

In `councilors.tsx`, the `CouncilorsComponent` uses an `Accordion` to show "existing", "new-councilors", "current-orgs", "takeover", "missions", "other-councilors".

I should probably refactor `CouncilorsComponent` to accept a prop that tells it which section to show, instead of using an `Accordion`.

Actually, the user wants the *entire* `RenderGameComponent` to be reorganized.

Here's my plan:

**Step 1: Define the new Navigation structure**
I'll create a new type for the navigation items.

**Step 2: Refactor `get*Ui` functions to return the new structure**
This is going to be the bulk of the work.
For `councilors.tsx`, instead of returning one `content` that contains an `Accordion`, I'll return a parent item with children.

Actually, instead of modifying all the `get*Ui` functions directly, maybe I can create a new way to define the navigation.

Wait, if I change the return type of `getCouncilorsUi` etc., I'll break `RenderGameComponent`.

Let's try to implement a prototype of the new `RenderGameComponent` first, and see how I can adapt the existing functions.

I'll start by creating a `todolist`.


**Tool: todowrite**

**Input:**
```json
{
  "todos": [
    {
      "content": "Define NavItem interface and a way to represent the navigation tree",
      "priority": "high",
      "status": "pending"
    },
    {
      "content": "Refactor getCouncilorsUi to return a tree structure with children for each accordion section",
      "priority": "high",
      "status": "pending"
    },
    {
      "content": "Refactor getFleetsUi, getHabsUi, getResourcesUi, getDrivesUi to follow the new tree structure (if applicable)",
      "priority": "medium",
      "status": "pending"
    },
    {
      "content": "Implement a Tree-style Sidebar component and a Main Content area in RenderGameComponent",
      "priority": "high",
      "status": "pending"
    },
    {
      "content": "Ensure the selection in the tree correctly updates the main content area",
      "priority": "high",
      "status": "pending"
    },
    {
      "content": "Verify the new UI works as expected and matches user requirements",
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
    "content": "Define NavItem interface and a way to represent the navigation tree",
    "priority": "high",
    "status": "pending"
  },
  {
    "content": "Refactor getCouncilorsUi to return a tree structure with children for each accordion section",
    "priority": "high",
    "status": "pending"
  },
  {
    "content": "Refactor getFleetsUi, getHabsUi, getResourcesUi, getDrivesUi to follow the new tree structure (if applicable)",
    "priority": "medium",
    "status": "pending"
  },
  {
    "content": "Implement a Tree-style Sidebar component and a Main Content area in RenderGameComponent",
    "priority": "high",
    "status": "pending"
  },
  {
    "content": "Ensure the selection in the tree correctly updates the main content area",
    "priority": "high",
    "status": "pending"
  },
  {
    "content": "Verify the new UI works as expected and matches user requirements",
    "priority": "medium",
    "status": "pending"
  }
]
```

---

## Assistant (Build · Gemma 4-26B-A4B (local) · 34.4s)

_Thinking:_

First, I'll define the `NavItem` interface. Since I'll be using it in multiple files, I should probably put it in a common place or just define it where needed. Given the structure, `src/lib/analysis.ts` or a new `src/types/navigation.ts` might work, but I'll start by just defining it in `RenderGameComponent` for now and see how it goes.

Actually, the `get*Ui` functions are in the same directory as `RenderGameComponent` (in `src/app/game/current/`).

Let's look at `src/app/game/current/component.tsx` again.

I'll start by refactoring `getCouncilorsUi` in `src/app/game/current/councilors.tsx`.
Currently, it returns:
```typescript
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
          scoredOwnedOrgs,
        }}
      />
    ),
  };
```

And `CouncilorsComponent` uses `SmartAccordion`.

I want it to look like:
- Councilor (subtitle: score details)
  - Existing Council
  - Find New
  - Current Organizations
  - Hostile Takeover
  - Missions
  - Other Councilors

So I'll change `getCouncilorsUi` to return a structure that includes these children.

Wait, `CouncilorsComponent` is a single component that renders the whole accordion. I should break it down so that I can render each section independently.

Let's look at `CouncilorsComponent` in `src/app/game/current/councilors.tsx`.

It has several sections:
1. `existing`
2. `new-councilors`
3. `current-orgs`
4. `takeover`
5. `missions`
6. `other-councilors`

I'll extract these into separate components or at least make them accessible.

Wait, if I change `getCouncilorsUi` to return children, then `RenderGameComponent` needs to be able to handle children.

Let's define the `NavItem` interface first.

I'll create a new file `src/app/game/current/navigation.tsx` to hold the `NavItem` type and maybe some common tree components.

Actually, I'll just define it in `src/app/game/current/component.tsx` for now to keep it simple.

Wait, I should probably see if I can find a better place.

Let's start by modifying `src/app/game/current/councilors.tsx` to expose the individual sections.

First, I'll read `src/app/game/current/councilors.tsx` again to make sure I have the full context. I already did.

I'll start by refactoring `CouncilorsComponent` to be more granular.

Actually, the user wants:
`there should be a (collapsible) tree-style navigation along the left side of the page to select the information to display in the main part of the page.`

So `RenderGameComponent` will manage the state of which leaf node is selected.

Let's try to refactor `getCouncilorsUi` to return a more structured object.

I'll first update `src/app/game/current/councilors.tsx`.
I'll change `getCouncilorsUi` to return an object that includes the subtitle and children.

But wait, the other functions `getFleetsUi`, etc., also need to be updated.

If I change the return type of all `get*Ui` functions, I'll have to update `RenderGameComponent`.

Let's start by defining the new `NavItem` interface. I'll put it in a new file `src/app/game/current/types.ts`.



**Tool: write**

**Input:**
```json
{
  "content": "import { ReactNode } from \"react\";\n\nexport interface NavItem {\n  key: string;\n  label: string;\n  subtitle?: ReactNode;\n  children?: NavItem[];\n  content?: ReactNode;\n}\n",
  "filePath": "terra-invicta-assistant\\src\\app\\game\\current\\types.ts"
}
```

**Output:**
```
Wrote file successfully.
```

---

## Assistant (Build · Gemma 4-26B-A4B (local) · 95.9s)

_Thinking:_

Now I'll update `src/app/game/current/councilors.tsx` to use this new `NavItem` type and return the tree structure.

I need to:
1.  Import `NavItem` from `./types`.
2.  Refactor `CouncilorsComponent` so that its sections can be rendered individually.
3.  Refactor `getCouncilorsUi` to return the `NavItem` tree.

Wait, `CouncilorsComponent` is currently one big component that renders the `SmartAccordion`. I'll refactor it to have sub-components for each section.

Sections in `CouncilorsComponent`:
- `existing`
- `new-councilors`
- `current-orgs`
- `takeover`
- `missions`
- `other-councilors`

Let's look at the code again.

```tsx
392: function CouncilorsComponent({
...
415: }) {
...
456:   const playerNationIds = new Set(analysis.playerNationIds);
...
467:   const stealableOrgsByFaction = scoredStealableOrgs.reduce((acc, org) => {
...
490:   const sourcesByFactionByMission = [...playerCouncilors, ...playerVisibleCouncilors]
...
546:   return (
547:     <div className="space-y-2">
548:       <SmartAccordion type="single" collapsible storageKey="councilorsSections" defaultValue="existing">
...
```

It uses a lot of local variables. I should probably extract these into a hook or just pass them down.

Let's try to extract the sections.

Sections are:
1. `Existing Council` (key: `councilors-existing`)
2. `Find New Councilors` (key: `councilors-new-councilors`)
3. `Current Organizations` (key: `councilors-current-orgs`)
4. `Hostile Takeover` (key: `councilors-takeover`)
5. `Missions` (key: `councilors-missions`)
6. `Other Councilors` (key: `councilors-other-councilors`)

I'll refactor `CouncilorsComponent` to accept a `section` prop.

But before that, I'll refactor `getCouncilorsUi`.

Wait, `getCouncilorsUi` is currently:
```typescript
315: export function getCouncilorsUi(analysis: Analysis) {
...
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
...
387:       />
388:     ),
389:   };
390: }
```

I'll change it to:
```typescript
export function getCouncilorsUi(analysis: Analysis): NavItem {
  // ... calculation of scores ...
  return {
    key: "councilors",
    label: "Councilors",
    subtitle: (
      <>
        ({worstExistingCouncilor?.toFixed(0)} vs. {bestAvailableCouncilor?.toFixed(0)}) / Orgs (
        {worstExistingOrg?.toFixed(2)} vs {bestAvailableOrg?.toFixed(2)})
      </>
    ),
    children: [
      { key: "councilors-existing", label: "Existing Council", content: <CouncilorsSection section="existing" ... /> },
      // ...
    ]
  }
}
```

Wait, `CouncilorsComponent` is currently a single component. I'll refactor it.

Actually, I'll first refactor `getCouncilorsUi` to return the children and see if I can make `CouncilorsComponent` work with that.

Wait, if `getCouncilorsUi` returns children, then `RenderGameComponent` must be updated to handle `children`.

Let's start by refactoring `CouncilorsComponent` in `src/app/game/current/councilors.tsx`.
I'll split it into smaller components.

Actually, I'll do it all at once.

First, let's see what's needed for each section. They all seem to need `analysis`, `weights`, `setWeights`, etc.

Wait, `CouncilorsComponent` also has some local state/calculations.

I'll try to create a `CouncilorsProvider` or just pass the props.

Actually, I'll just refactor `CouncilorsComponent` to take a `section` prop.

Let's see the current `CouncilorsComponent` again.

I'll start by extracting the calculations into a function or a hook.

Actually, I'll just do it step by step.

First, I'll update `getCouncilorsUi` in `src/app/game/current/councilors.tsx` to return `NavItem`. I'll need to change the return type of the function.

Wait, I'll also need to update `getFleetsUi` etc. to return `NavItem`.

Let's look at `getFleetsUi`.

```typescript
13: export function getFleetsUi(analysis: Analysis) {
...
99:   return {
100:     key: "fleets",
101:     tab: (
102:       <>
103:         Fleets
...
117:       </>
118:     ),
119:     content: <FleetsComponent analysis={analysis} />,
120:   };
121: }
```

This one is simpler. It has one main content. But it also has an `Accordion` inside `FleetsComponent`.

The user wants the *entire* thing to be a tree.

So `Fleets` should also be a tree item with children:
- Alien Fleets
- Other Human Factions
- Player Fleets
- Ships Under Construction

This means I need to refactor `FleetsComponent` too.

This is a significant refactoring. I'll follow my todo list.

**Task 1: Define NavItem interface and a way to represent the navigation tree** - Done.

**Task 2: Refactor getCouncilorsUi to return a tree structure with children for each accordion section**

Let's start with `src/app/game/current/councilors.tsx`.

I'll first refactor `CouncilorsComponent` to be able to render a specific section.

I'll move the calculations out of `CouncilorsComponent` into a wrapper function or a hook.

Actually, I'll just move them to `getCouncilorsUi` and pass them down.

Let's see.



**Tool: edit**

**Input:**
```json
{
  "filePath": "terra-invicta-assistant\\src\\app\\game\\current\\councilors.tsx",
  "newString": "import { Analysis } from \"@/lib/analysis\";\nimport { NavItem } from \"./types\";\n\nexport function getCouncilorsUi(analysis: Analysis): NavItem {\n  const { playerMissionCounts } = analysis;\n  const [weights, setWeights] = useState<ScoringWeights>(defaultScoringWeights);\n\n  useEffect(() => {\n    setWeights(loadWeightsFromStorage());\n  }, []);\n\n  const scoredModifiedCouncilors = scoreAndSort(\n    analysis.playerCouncilors,\n    weights,\n    playerMissionCounts,\n    getModifiedCouncilorScore\n  );\n  const scoredAvailableCouncilors = scoreAndSort(\n    analysis.playerAvailableCouncilors,\n    weights,\n    playerMissionCounts,\n    getBaseCouncilorScore\n  );\n  const scoredBaseCouncilors = scoreAndSort(\n    analysis.playerCouncilors,\n    weights,\n    playerMissionCounts,\n    getBaseCouncilorScore\n  );\n  const scoredOrgs = scoreAndSort(\n    analysis.playerAvailableOrgs\n      .map((i) => ({ type: \"available\", ...i }))\n      .concat(analysis.playerUnassignedOrgs.map((i) => ({ type: \"unassigned\", ...i }))),\n    weights,\n    playerMissionCounts,\n    getOrganizationScore,\n    \"noMissionScore\" // ignore missions when sorting orgs\n  ).toSorted((a, b) => (a.isAdminOrg === b.isAdminOrg ? 0 : a.isAdminOrg ? -1 : 1)); // admin orgs first\n  const usedOrgs = analysis.playerCouncilors.flatMap((councilor) =>\n    councilor.orgs.map((o) => ({ ...o, type: \"used\", councilor: councilor.displayName, councilorId: councilor.id }))\n  );\n  const scoredUsedOrgs = scoreAndSort(usedOrgs, weights, playerMissionCounts, getOrganizationScore);\n  const scoredOwnedOrgs = scoreAndSort(\n    analysis.playerUnassignedOrgs.map((i) => ({ type: \"unassigned\", ...i })).concat(usedOrgs),\n    weights,\n    playerMissionCounts,\n    getOrganizationScore\n  );\n\n  const bestAvailableCouncilor = scoredAvailableCouncilors[0]?.score.value;\n  const worstExistingCouncilor = scoredBaseCouncilors[scoredBaseCouncilors.length - 1]?.score.value;\n  const bestAvailableOrg = scoredOrgs[0]?.score.value;\n  const worstExistingOrg = scoredUsedOrgs[scoredUsedOrgs.length - 1]?.score.value;\n\n  return {\n    key: \"councilors\",\n    label: \"Councilors\",\n    subtitle: (\n      <>\n        ({worstExistingCouncilor?.toFixed(0)} vs. {bestAvailableCouncilor?.toFixed(0)}) / Orgs (\n        {worstExistingOrg?.toFixed(2)} vs {bestAvailableOrg?.toFixed(2)})\n      </>\n    ),\n    children: [\n      {\n        key: \"councilors-existing\",\n        label: \"Existing Council\",\n        content: (\n          <CouncilorsSection\n            {...{\n              analysis,\n              weights,\n              setWeights,\n              scoredModifiedCouncilors,\n              scoredAvailableCouncilors,\n              scoredBaseCouncilors,\n              scoredOrgs,\n              scoredOwnedOrgs,\n            }}\n            section=\"existing\"\n          />\n        ),\n      },\n      {\n        key: \"councilors-new-councilors\",\n        label: \"Find new\",\n        content: (\n          <CouncilorsSection\n            {...{\n              analysis,\n              weights,\n              setWeights,\n              scoredModifiedCouncilors,\n              scoredAvailableCouncilors,\n              scoredBaseCouncilors,\n              scoredOrgs,\n              scoredOwnedOrgs,\n            }}\n            section=\"new-councilors\"\n          />\n        ),\n      },\n      {\n        key: \"councilors-current-orgs\",\n        label: \"Current Organizations\",\n        content: (\n          <CouncilorsSection\n            {...{\n              analysis,\n              weights,\n              setWeights,\n              scoredModifiedCouncilors,\n              scoredAvailableCouncilors,\n              scoredBaseCouncilors,\n              scoredOrgs,\n              scoredOwnedOrgs,\n            }}\n            section=\"current-orgs\"\n          />\n        ),\n      },\n      {\n        key: \"councilors-takeover\",\n        label: \"Hostile Takeover\",\n        content: (\n          <CouncilorsSection\n            {...{\n              analysis,\n              weights,\n              setWeights,\n              scoredModifiedCouncilors,\n              scoredAvailableCouncilors,\n              scoredBaseCouncilors,\n              scoredOrgs,\n              scoredOwnedOrgs,\n            }}\n            section=\"takeover\"\n          />\n        ),\n      },\n      {\n        key: \"councilors-missions\",\n        label: \"Missions\",\n        content: (\n          <CouncilorsSection\n            {...{\n              analysis,\n              weights,\n              setWeights,\n              scoredModifiedCouncilors,\n              scoredAvailableCouncilors,\n              scoredBaseCouncilors,\n              scoredOrgs,\n              scoredOwnedOrgs,\n            }}\n            section=\"missions\"\n          />\n        ),\n      },\n      {\n        key: \"councilors-other-councilors\",\n        label: \"Other Councilors\",\n        content: (\n          <CouncilorsSection\n            {...{\n              analysis,\n              weights,\n              setWeights,\n              scoredModifiedCouncilors,\n              scoredAvailableCouncilors,\n              scoredBaseCouncilors,\n              scoredOrgs,\n              scoredOwnedOrgs,\n            }}\n            section=\"other-councilors\"\n          />\n        ),\n      },\n    ],\n  };\n}\n"
}
```

**Error:**
```
The edit tool was called with invalid arguments: [
  {
    "expected": "string",
    "code": "invalid_type",
    "path": [
      "oldString"
    ],
    "message": "Invalid input: expected string, received undefined"
  }
].
Please rewrite the input so it satisfies the expected schema.
```

---

## Assistant (Build · Gemma 4-26B-A4B (local) · 175.2s)

_Thinking:_

Ah, I forgot that `edit` requires `oldString`. I'll use `Read` to get the content first (though I already have it, I must provide it to `edit`).

Actually, I can't just provide the `newString` without the `oldString`.

Wait, I'll just rewrite the whole file using `Write`. It's easier than trying to find the exact `oldString` for such a large change.

But first, I need to prepare the content of the new file.

I'll refactor `CouncilorsComponent` into `CouncilorsSection` and make sure it works.

Wait, I also need to make sure I don't lose any imports or helper functions.

Let's look at `src/app/game/current/councilors.tsx` content again.

I'll create the new version of `src/app/game/current/councilors.tsx`.

Wait, I also need to update `getCouncilorsUi` return type and logic.

I'll define `CouncilorsSection` and then `getCouncilorsUi`.

Wait, `CouncilorsComponent` also had a `ScoringWeightsDialog` and a `Collapsible` for debug data. I should probably keep those or move them.

The user wants a tree navigation. The `ScoringWeightsDialog` should probably stay in the main view or be accessible.

If I put it in `CouncilorsSection`, it will only show up when a councilors section is selected. That's probably fine.

Let's try to write the new `src/app/game/current/councilors.tsx`.

I'll need to be careful about the imports.

Existing imports:
```tsx
import { useState, useEffect } from "react";
import { combineEffects, ShowEffects, ShowEffectsProps } from "@/components/showEffects";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SmartAccordion } from "@/components/ui/smart-accordion";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Analysis } from "@/lib/analysis";
import { MissionDataName, TraitDataName } from "@/lib/template-types-generated";
import { MinusCircleIcon, PlusCircleIcon } from "lucide-react";
import { defaultScoringWeights, loadWeightsFromStorage, ScoringWeights, ScoringWeightsDialog } from "./scoringWeights";
import { Administration, MissionIcons, TraitIcons, UnknownIcon } from "@/components/icons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SmartTabs } from "@/components/ui/smart-tabs";
import { twMerge } from "tailwind-merge";
```

New imports:
```tsx
import { useState, useEffect } from "react";
import { combineEffects, ShowEffects, ShowEffectsProps } from "@/components/showEffects";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Analysis } from "@/lib/analysis";
import { MissionDataName, TraitDataName } from "@/lib/template-types-generated";
import { MinusCircleIcon, PlusCircleIcon } from "lucide-react";
import { defaultScoringWeights, loadWeightsFromStorage, ScoringWeights, ScoringWeightsDialog } from "./scoringWeights";
import { Administration, MissionIcons, TraitIcons, UnknownIcon } from "@/components/icons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SmartTabs } from "@/components/ui/smart-tabs";
import { twMerge } from "tailwind-merge";
import { NavItem } from "./types"; // Added
```

And I'll replace `CouncilorsComponent` with `CouncilorsSection`.

Wait, I'll also need to make sure `scoredStealableOrgs` etc. are calculated correctly.

Let's prepare the full content for `src/app/game/current/councilors.tsx`.

Wait, I should also consider that `getCouncilorsUi` is currently used by `RenderGameComponent`.

If I change the return type of `getCouncilorsUi` to `NavItem`, I must update `RenderGameComponent`.

Actually, I'll do it in one go.

Wait, I'll first try to refactor `councilors.tsx` to be more modular.

I'll use `Write` to replace the whole file.



**Tool: write**

**Input:**
```json
{
  "content": "\"use client\";\n\nimport { useState, useEffect } from \"react\";\nimport { combineEffects, ShowEffects, ShowEffectsProps } from \"@/components/showEffects\";\nimport { AccordionContent, AccordionItem, AccordionTrigger } from \"@/components/ui/accordion\";\nimport { Button } from \"@/components/ui/button\";\nimport { Collapsible, CollapsibleContent, CollapsibleTrigger } from \"@/components/ui/collapsible\";\nimport { Tooltip, TooltipContent, TooltipTrigger } from \"@/components/ui/tooltip\";\nimport { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from \"@/components/ui/table\";\nimport { Analysis } from \"@/lib/analysis\";\nimport { MissionDataName, TraitDataName } from \"@/lib/template-types-generated\";\nimport { MinusCircleIcon, PlusCircleIcon } from \"lucide-react\";\nimport { defaultScoringWeights, loadWeightsFromStorage, ScoringWeights, ScoringWeightsDialog } from \"./scoringWeights\";\nimport { Administration, MissionIcons, TraitIcons, UnknownIcon } from \"@/components/icons\";\nimport { Tabs, TabsContent, TabsList, TabsTrigger } from \"@/components/ui/tabs\";\nimport { SmartTabs } from \"@/components/ui/smart-tabs\";\nimport { twMerge } from \"tailwind-merge\";\nimport { NavItem } from \"./types\";\n\nfunction CouncilorTableHeader({ hasOrgs }: { hasOrgs?: boolean }) {\n  return (\n    <TableHeader>\n      <TableRow>\n        <TableHead>Name</TableHead>\n        <TableHead>Modified Stats</TableHead>\n        {hasOrgs && <TableHead>Org Tiers</TableHead>}\n        <TableHead>Monthly Effects</TableHead>\n        <TableHead>Priorities</TableHead>\n        <TableHead>Science</TableHead>\n        <TableHead>Missions</TableHead>\n        <TableHead>Score</TableHead>\n        <TableHead>NM Score</TableHead>\n        <TableHead>CP Cap</TableHead>\n      </TableRow>\n    </TableHeader>\n  );\n}\n\nfunction OrgTableHeader({ costHeader }: { costHeader?: string }) {\n  return (\n    <TableHeader>\n      <TableRow>\n        <TableHead>Org Name</TableHead>\n        <TableHead>Requirements</TableHead>\n        <TableHead>Tier</TableHead>\n        {costHeader ? <TableHead>{costHeader}</TableHead> : <TableHead>Purchase / Transfer</TableHead>}\n        <TableHead>Monthly</TableHead>\n        <TableHead>Effects</TableHead>\n        <TableHead>Score</TableHead>\n        <TableHead>NM Score</TableHead>\n      </TableRow>\n    </TableHeader>\n  );\n}\n\nfunction CouncilorTableRow({\n  councilor,\n  stats,\n  label,\n  hasOrgs,\n  highlightMissionClassName,\n}: {\n  councilor: Analysis[\"playerCouncilors\"][number] & { score?: ScoreResult };\n  stats: Analysis[\"playerCouncilors\"][number][\"effectsWithOrgsAndAugments\"];\n  label: string;\n  hasOrgs?: boolean;\n  highlightMissionClassName?: (missionName: MissionDataName) => string | undefined;\n}) {\n  const admin = Math.min(25, Math.max(0, (stats.administration || 0) + (stats.Administration || 0)));\n  const orgTiers = councilor.orgs.reduce((a, b) => a + b.tier, 0);\n  const cpCap =\n    Math.min(25, Math.max(0, stats.persuasion || 0) + Math.max(0, stats.Persuasion || 0)) +\n    Math.min(25, Math.max(0, stats.command || 0) + Math.max(0, stats.Command || 0)) +\n    Math.min(25, Math.max(0, stats.administration || 0) + Math.max(0, stats.Administration || 0));\n  return (\n    <TableRow key={`${councilor.id}-${label}`}>\n      <TableCell>{label}</TableCell>\n      <TableCell>\n        <ShowEffects\n          persuasion={stats.persuasion}\n          command={stats.command}\n          investigation={stats.investigation}\n          espionage={stats.espionage}\n          administration={stats.administration}\n          science={stats.science}\n          security={stats.security}\n          Persuasion={stats.Persuasion}\n          Command={stats.Command}\n          Investigation={stats.Investigation}\n          Espionage={stats.Espionage}\n          Administration={stats.Administration}\n          Science={stats.Science}\n          Security={stats.Security}\n          ApparentLoyalty={stats.ApparentLoyalty}\n          Loyalty={stats.Loyalty}\n          maxLoyalty={stats.maxLoyalty}\n          xpModifier={stats.xpModifier}\n          xp={stats.xp}\n          traitTemplateNames={stats.traitTemplateNames}\n          typeTemplateName={stats.typeTemplateName}\n          playerIntel={stats.playerIntel}\n          playerMaxIntel={stats.playerMaxIntel}\n          lastRecordedLoyalty={stats.lastRecordedLoyalty}\n        />\n      </TableCell>\n      {hasOrgs && (\n        <TableCell>\n          <ShowEffects tier={stats.tier} highlightTier={orgTiers < admin} />\n        </TableCell>\n      )}\n      <TableCell>\n        <ShowEffects\n          incomeBoost_month={stats.incomeBoost_month}\n          incomeMoney_month={stats.incomeMoney_month}\n          incomeInfluence_month={stats.incomeInfluence_month}\n          incomeOps_month={stats.incomeOps_month}\n          incomeMissionControl={stats.incomeMissionControl}\n          incomeResearch_month={stats.incomeResearch_month}\n          projectCapacityGranted={stats.projectCapacityGranted}\n        />\n      </TableCell>\n      <TableCell>\n        <span className=\"text-wrap leading-6 -my-2 inline-block\">\n          <ShowEffects\n            economyBonus={stats.economyBonus}\n            welfareBonus={stats.welfareBonus}\n            environmentBonus={stats.environmentBonus}\n            knowledgeBonus={stats.knowledgeBonus}\n            governmentBonus={stats.governmentBonus}\n            unityBonus={stats.unityBonus}\n            militaryBonus={stats.militaryBonus}\n            oppressionBonus={stats.oppressionBonus}\n            spoilsBonus={stats.spoilsBonus}\n            spaceDevBonus={stats.spaceDevBonus}\n            spaceflightBonus={stats.spaceflightBonus}\n            MCBonus={stats.MCBonus}\n            miningBonus={stats.miningBonus}\n          />\n        </span>\n      </TableCell>\n      <TableCell>\n        <span className=\"text-wrap leading-6 -my-2 inline-block\">\n          <ShowEffects\n            councilorTechBonus={stats.councilorTechBonus}\n            techBonuses={stats.techBonuses}\n          />\n        </span>\n      </TableCell>\n      <TableCell>\n        <span className=\"text-wrap leading-6 -my-2 inline-block\">\n          <ShowEffects\n            missionsGrantedNames={stats.missionsGrantedNames}\n            highlightMissionClassName={highlightMissionClassName}\n          />\n        </span>\n      </TableCell>\n      {councilor.score === undefined ? null : (\n        <>\n          <TableCell>\n            <Tooltip>\n              <TooltipTrigger>{councilor.score.value?.toFixed(2)}</TooltipTrigger>\n              <TooltipContent align=\"end\" className=\"max-w-auto\">\n                <pre className=\"p-2\">{councilor.score.details}</pre>\n              </TooltipContent>\n            </Tooltip>\n          </TableCell>\n          <TableCell>{councilor.score.noMissionScore?.toFixed(2)}</TableCell>\n          <TableCell>{cpCap?.toFixed(0)}</TableCell>\n        </>\n      )}\n    </TableRow>\n  );\n}\n\nfunction OrgTableRow({\n  org,\n  playerNationIds,\n  playerTraits,\n  highlightMissionClassName,\n  isTakeover,\n}: {\n  org: Analysis[\"playerAvailableOrgs\"][number] & {\n    type?: string;\n    score?: ScoreResult;\n    councilor?: string;\n    councilorId?: number;\n  };\n  playerNationIds: Set<number>;\n  playerTraits: Set<string>;\n  highlightMissionClassName?: (missionName: MissionDataName) => string | undefined;\n  isTakeover?: boolean;\n}) {\n  const missingRequiredTraits = org.template?.requiredOwnerTraits?.filter((t) => !playerTraits.has(t)) || [];\n  function traitIcon(trait: TraitDataName, Fallback: typeof PlusCircleIcon) {\n    return TraitIcons[trait] || Fallback;\n  }\n  return (\n    <TableRow\n      key={org.id}\n      className={twMerge(org.isAdminOrg ? \"bg-green-100\" : \"\", org.type === \"unassigned\" ? \"bg-yellow-100\" : \"\")}\n    >\n      <TableCell>{org.displayName}</TableCell>\n      <TableCell>\n        {org.template?.requiresNationality && (\n          <span className=\"mr-1\" title={`Required Nation: ${org.homeNationName || \"\"}`}>\n            {playerNationIds.has(org.homeNationId || -1) ? (\n              <PlusCircleIcon className=\"inline h-4 w-4 stroke-green-700 -mt-1 bg-transparent\" />\n            ) : (\n              <MinusCircleIcon className=\"inline h-4 w-4 stroke-destructive -mt-1\" />\n            )}\n          </span>\n        )}\n        {org.template?.requiredOwnerTraits && (\n          <span className=\"mr-1\" title={\"Required Traits: \" + org.template.requiredOwnerTraits.join(\", \")}>\n            {missingRequiredTraits.length === 0\n              ? org.template.requiredOwnerTraits.map((trait, ix) => {\n                  const Icon = traitIcon(trait, PlusCircleIcon);\n                  return <Icon key={ix} className=\"inline h-4 w-4 stroke-green-700 -mt-1\" />;\n                })\n              : missingRequiredTraits.map((trait, ix) => {\n                  const Icon = traitIcon(trait, MinusCircleIcon);\n                  return <Icon key={ix} className=\"inline h-4 w-4 stroke-destructive -mt-1\" />;\n                })}\n          </span>\n        )}\n        {org.template?.prohibitedOwnerTraits && (\n          <span className=\"mr-1\" title={\"Prohibited Traits: \" + org.template.prohibitedOwnerTraits.join(\", \")}>\n            {org.template.prohibitedOwnerTraits.map((trait, ix) => {\n              const Icon = traitIcon(trait, MinusCircleIcon);\n              return <Icon key={ix} className=\"inline h-4 w-4 stroke-blue-700 -mt-1\" />;\n            })}\n          </span>\n        )}\n      </TableCell>\n      <TableCell>\n        <ShowEffects tier={org.tier} />\n      </TableCell>\n      <TableCell>\n        {org.type === \"unassigned\" && \"T \"}\n        {org.type === \"available\" || org.type === \"unassigned\" ? (\n          <ShowEffects\n            costMoney={(org.costMoney || 0) * (org.type === \"available\" ? 1 : orgTransferFactor)}\n            costInfluence={(org.costInfluence || 0) * (org.type === \"available\" ? 1 : orgTransferFactor)}\n            costOps={(org.costOps || 0) * (org.type === \"available\" ? 1 : orgTransferFactor)}\n            costBoost={(org.costBoost || 0) * (org.type === \"available\" ? 1 : orgTransferFactor)}\n          />\n        ) : org.type == \"stealable\" && isTakeover ? (\n          (() => {\n            const target = org as any as Analysis[\"playerStealableOrgs\"][number];\n            return (\n              <>\n                {target.councilor ?? \"Unassigned\"} from {target.faction?.displayName}, Admin: {target.admin} +\n                takeoverDefense: {target.takeoverDefense}\n              </>\n            );\n          })()\n        ) : org.type === \"used\" ? (\n          <>{org.councilor ?? \"Unassigned\"}</>\n        ) : null}\n      </TableCell>\n      <TableCell>\n        <ShowEffects\n          incomeBoost_month={org.incomeBoost_month}\n          incomeMoney_month={org.incomeMoney_month}\n          incomeInfluence_month={org.incomeInfluence_month}\n          incomeOps_month={org.incomeOps_month}\n          incomeMissionControl={org.incomeMissionControl}\n          incomeResearch_month={org.incomeResearch_month}\n          projectCapacityGranted={org.projectCapacityGranted}\n        />\n      </TableCell>\n      <TableCell>\n        <ShowEffects\n          persuasion={org.persuasion}\n          command={org.command}\n          investigation={org.investigation}\n          espionage={org.espionage}\n          administration={org.administration}\n          science={org.science}\n          security={org.security}\n          economyBonus={org.economyBonus}\n          welfareBonus={org.welfareBonus}\n          environmentBonus={org.environmentBonus}\n          knowledgeBonus={org.knowledgeBonus}\n          governmentBonus={org.governmentBonus}\n          unityBonus={org.unityBonus}\n          militaryBonus={org.militaryBonus}\n          oppressionBonus={org.oppressionBonus}\n          spoilsBonus={org.spoilsBonus}\n          spaceDevBonus={org.spaceDevBonus}\n          spaceflightBonus={org.spaceflightBonus}\n          MCBonus={org.MCBonus}\n          miningBonus={org.miningBonus}\n          techBonuses={org.template?.techBonuses}\n          missionsGrantedNames={org.template?.missionsGrantedNames || []}\n          highlightMissionClassName={highlightMissionClassName}\n        />\n      </TableCell>\n      {org.score === undefined ? null : (\n        <>\n          <TableCell>\n            <Tooltip>\n              <TooltipTrigger>{org.score.value?.toFixed(2)}</TooltipTrigger>\n              <TooltipContent align=\"end\" className=\"max-w-auto\">\n                <pre className=\"p-2\">{org.score.details}</pre>\n              </TooltipContent>\n            </Tooltip>\n          </TableCell>\n          <TableCell>{org.score.noMissionScore?.toFixed(2)}</TableCell>\n        </>\n      )}\n    </TableRow>\n  );\n}\n\nexport function getCouncilorsUi(analysis: Analysis): NavItem {\n  const { playerMissionCounts } = analysis;\n  // Note: we are not using state here because this function is called in the render loop of RenderGameComponent.\n  // Instead, we should move the state to RenderGameComponent and pass it down.\n  // But for now, we'll just use a placeholder or move the logic.\n  // Actually, since we want to return a tree, we can't use useState here easily if the caller is not a component.\n  // BUT getCouncilorsUi is called inside RenderGameComponent, which IS a component.\n  // Wait, the current implementation of RenderGameComponent:\n  //   const tabs = [getCouncilorsUi(analysis), ...];\n  // This means getCouncilorsUi is called every render.\n  // If getCouncilorsUi uses useState, it will cause issues because it's not a component.\n  // It's a function that returns a JSX element.\n  // In React, you can't call useState in a regular function.\n  // The current implementation is actually WRONG if it uses useState inside getCouncilorsUi.\n  // Let's check the current implementation.\n  // Line 317: const [weights, setWeights] = useState<ScoringWeights>(defaultScoringWeights);\n  // This IS a component! It's defined as a function that returns JSX.\n  // But it's being called like a regular function in RenderGameComponent.\n  // This is a known React anti-pattern (calling a component as a function).\n  // It should be <CouncilorsUi analysis={analysis} />.\n  // However, it's working (presumably) because it's being treated as a component by React if it returns JSX.\n  // No, if it's called as a function, hooks will fail.\n  // Let's look at RenderGameComponent again.\n  // Line 14: getCouncilorsUi(analysis),\n  // Yes, it's being called as a function. This shouldn't work if it has useState.\n  // Let's see if it actually has useState.\n  // Yes, line 317: const [weights, setWeights] = useState<ScoringWeights>(defaultScoringWeights);\n  // This is very strange. Maybe it's because it's a \"use client\" component.\n  // Actually, if it's called as a function, it's just a function that happens to return JSX.\n  // React doesn't know it's a component unless it's used in JSX.\n  // So useState will throw an error: \"Hooks can only be called inside of the body of a function component.\"\n  // Wait, if the user's app is running, then maybe it's NOT using useState in a way that breaks.\n  // Let's check.\n\n  // I will refactor it to be a proper component and use the new NavItem structure.\n  // For now, I'll keep the logic and just move it.\n\n  // Let's assume for now we'll handle the weights in the parent.\n\n  // Actually, I'll just keep it as is and fix the structure.\n  // But I need to move the weight state to the parent.\n\n  // Let's try a different approach. I'll move all the weight logic to RenderGameComponent.\n\n  // I will return a component instead of the UI.\n  // No, the user wants a NavItem.\n\n  // Let's try to keep it simple for now.\n  // I'll return the structure, and I'll move the weights state to RenderGameComponent.\n\n  // Wait, if I do that, I have to update all other functions too.\n\n  // Let's just proceed with the refactoring.\n\n  // I'll move the weight state to a context or just pass it down.\n\n  // For now, I'll just provide the structure.\n\n  return {\n    key: \"councilors\",\n    label: \"Councilors\",\n    subtitle: (\n      <>\n        Councilors ({worstExistingCouncilor?.toFixed(0)} vs. {bestAvailableCouncilor?.toFixed(0)}) / Orgs (\n        {worstExistingOrg?.toFixed(2)} vs {bestAvailableOrg?.toFixed(2)})\n      </>\n    ),\n    children: [], // I'll fill this in later\n  };\n}\n\n// ... (rest of the file)\n"
}
```

**Error:**
```
The write tool was called with invalid arguments: [
  {
    "expected": "string",
    "code": "invalid_type",
    "path": [
      "filePath"
    ],
    "message": "Invalid input: expected string, received undefined"
  }
].
Please rewrite the input so it satisfies the expected schema.
```

---

## Assistant (Build · Gemma 4-26B-A4B (local) · 37.3s)

_Thinking:_

I keep getting errors with `write` and `edit` because I'm not providing the full content correctly or something. Wait, `write` only needs `content` and `filePath`. I provided them.

Ah, I see what happened. I might have had an issue with the content itself or the tool call.

Wait, the error message says `filePath` was `undefined`. But I provided it.

Let me try again with `write`. I'll make the content smaller first to see if it works.
Actually, I'll try to use `edit` with the correct `oldString`.

The current content of `src/app/game/current/councilors.tsx` is about 1074 lines.

I'll try to refactor it in smaller pieces.

First, let's change the `getCouncilorsUi` function to return the `NavItem` structure, but keeping the `useState` for now (even if it's technically wrong, I'll see if it works or if I can fix it later).

Actually, I'll fix the anti-pattern. I'll move the weights to a state in `RenderGameComponent`.

But wait, I don't want to break everything at once.

Let's try to just change the return type of `getCouncilorsUi` to return the `NavItem` and see if I can get it to compile.

Wait, I need to import `NavItem` in `councilors.tsx`.

I'll do it in steps.

**Step 1: Add the import in `councilors.tsx`**


**Tool: edit**

**Input:**
```json
{
  "filePath": "terra-invicta-assistant\\src\\app\\game\\current\\councilors.tsx",
  "newString": "import { useState, useEffect } from \"react\";\nimport { combineEffects, ShowEffects, ShowEffectsProps } from \"@/components/showEffects\";\nimport { AccordionContent, AccordionItem, AccordionTrigger } from \"@/components/ui/accordion\";\nimport { SmartAccordion } from \"@/components/ui/smart-accordion\";\nimport { Button } from \"@/components/ui/button\";\nimport { Collapsible, CollapsibleContent, CollapsibleTrigger } from \"@/components/ui/collapsible\";\nimport { Tooltip, TooltipContent, TooltipTrigger } from \"@/components/ui/tooltip\";\nimport { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from \"@/components/ui/table\";\nimport { Analysis } from \"@/lib/analysis\";\nimport { MissionDataName, TraitDataName } from \"@/lib/template-types-generated\";\nimport { MinusCircleIcon, PlusCircleIcon } from \"lucide-react\";\nimport { defaultScoringWeights, loadWeightsFromStorage, ScoringWeights, ScoringWeightsDialog } from \"./scoringWeights\";\nimport { Administration, MissionIcons, TraitIcons, UnknownIcon } from \"@/components/icons\";\nimport { Tabs, TabsContent, TabsList, TabsTrigger } from \"@/components/ui/tabs\";\nimport { SmartTabs } from \"@/components/ui/smart-tabs\";\nimport { twMerge } from \"tailwind-merge\";\nimport { NavItem } from \"./types\";\n",
  "oldString": "import { useState, useEffect } from \"react\";\nimport { combineEffects, ShowEffects, ShowEffectsProps } from \"@/components/showEffects\";\nimport { AccordionContent, AccordionItem, AccordionTrigger } from \"@/components/ui/accordion\";\nimport { SmartAccordion } from \"@/components/ui/smart-accordion\";\nimport { Button } from \"@/components/ui/button\";\nimport { Collapsible, CollapsibleContent, CollapsibleTrigger } from \"@/components/ui/collapsible\";\nimport { Tooltip, TooltipContent, TooltipTrigger } from \"@/components/ui/tooltip\";\nimport { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from \"@/components/ui/table\";\nimport { Analysis } from \"@/lib/analysis\";\nimport { MissionDataName, TraitDataName } from \"@/lib/template-types-generated\";\nimport { MinusCircleIcon, PlusCircleIcon } from \"lucide-react\";\nimport { defaultScoringWeights, loadWeightsFromStorage, ScoringWeights, ScoringWeightsDialog } from \"./scoringWeights\";\nimport { Administration, MissionIcons, TraitIcons, UnknownIcon } from \"@/components/icons\";\nimport { Tabs, TabsContent, TabsList, TabsTrigger } from \"@/components/ui/tabs\";\nimport { SmartTabs } from \"@/components/ui/smart-tabs\";\nimport { twMerge } from \"tailwind-merge\";\n"
}
```

**Output:**
```
Edit applied successfully.
```

---

## Assistant (Build · Gemma 4-26B-A4B (local) · 52.5s)

_Thinking:_

Now I'll update the return type of `getCouncilorsUi` in `src/app/game/current/councilors.tsx`.

Currently:
```typescript
315: export function getCouncilorsUi(analysis: Analysis) {
```

To:
```typescript
315: export function getCouncilorsUi(analysis: Analysis): NavItem {
```

Wait, I also need to update the return value.

Actually, I'll do a larger edit.

I'll replace the entire `getCouncilorsUi` function.



**Tool: edit**

**Input:**
```json
{
  "filePath": "terra-invicta-assistant\\src\\app\\game\\current\\councilors.tsx",
  "newString": "export function getCouncilorsUi(analysis: Analysis): NavItem {\n  const { playerMissionCounts } = analysis;\n  const [weights, setWeights] = useState<ScoringWeights>(defaultScoringWeights);\n\n  useEffect(() => {\n    setWeights(loadWeightsFromStorage());\n  }, []);\n\n  const scoredModifiedCouncilors = scoreAndSort(\n    analysis.playerCouncilors,\n    weights,\n    playerMissionCounts,\n    getModifiedCouncilorScore\n  );\n  const scoredAvailableCouncilors = scoreAndSort(\n    analysis.playerAvailableCouncilors,\n    weights,\n    playerMissionCounts,\n    getBaseCouncilorScore\n  );\n  const scoredBaseCouncilors = scoreAndSort(\n    analysis.playerCouncilors,\n    weights,\n    playerMissionCounts,\n    getBaseCouncilorScore\n  );\n  const scoredOrgs = scoreAndSort(\n    analysis.playerAvailableOrgs\n      .map((i) => ({ type: \"available\", ...i }))\n      .concat(analysis.playerUnassignedOrgs.map((i) => ({ type: \"unassigned\", ...i }))),\n    weights,\n    playerMissionCounts,\n    getOrganizationScore,\n    \"noMissionScore\" // ignore missions when sorting orgs\n  ).toSorted((a, b) => (a.isAdminOrg === b.isAdminOrg ? 0 : a.isAdminOrg ? -1 : 1)); // admin orgs first\n  const usedOrgs = analysis.playerCouncilors.flatMap((councilor) =>\n    councilor.orgs.map((o) => ({ ...o, type: \"used\", councilor: councilor.displayName, councilorId: councilor.id }))\n  );\n  const scoredUsedOrgs = scoreAndSort(usedOrgs, weights, playerMissionCounts, getOrganizationScore);\n  const scoredOwnedOrgs = scoreAndSort(\n    analysis.playerUnassignedOrgs.map((i) => ({ type: \"unassigned\", ...i })).concat(usedOrgs),\n    weights,\n    playerMissionCounts,\n    getOrganizationScore\n  );\n\n  const bestAvailableCouncilor = scoredAvailableCouncilors[0]?.score.value;\n  const worstExistingCouncilor = scoredBaseCouncilors[scoredBaseCouncilors.length - 1]?.score.value;\n  const bestAvailableOrg = scoredOrgs[0]?.score.value;\n  const worstExistingOrg = scoredUsedOrgs[scoredUsedOrgs.length - 1]?.score.value;\n\n  return {\n    key: \"councilors\",\n    label: \"Councilors\",\n    subtitle: (\n      <>\n        ({worstExistingCouncilor?.toFixed(0)} vs. {bestAvailableCouncilor?.toFixed(0)}) / Orgs (\n        {worstExistingOrg?.toFixed(2)} vs {bestAvailableOrg?.toFixed(2)})\n      </>\n    ),\n    content: (\n      <CouncilorsComponent\n        {...{\n          analysis,\n          weights,\n          setWeights,\n          scoredModifiedCouncilors,\n          scoredAvailableCouncilors,\n          scoredBaseCouncilors,\n          scoredOrgs,\n          scoredOwnedOrgs,\n        }}\n      />\n    ),\n  };\n}\n",
  "oldString": "export function getCouncilorsUi(analysis: Analysis) {\n  const { playerMissionCounts } = analysis;\n  const [weights, setWeights] = useState<ScoringWeights>(defaultScoringWeights);\n\n  useEffect(() => {\n    setWeights(loadWeightsFromStorage());\n  }, []);\n\n  const scoredModifiedCouncilors = scoreAndSort(\n    analysis.playerCouncilors,\n    weights,\n    playerMissionCounts,\n    getModifiedCouncilorScore\n  );\n  const scoredAvailableCouncilors = scoreAndSort(\n    analysis.playerAvailableCouncilors,\n    weights,\n    playerMissionCounts,\n    getBaseCouncilorScore\n  );\n  const scoredBaseCouncilors = scoreAndSort(\n    analysis.playerCouncilors,\n    weights,\n    playerMissionCounts,\n    getBaseCouncilorScore\n  );\n  const scoredOrgs = scoreAndSort(\n    analysis.playerAvailableOrgs\n      .map((i) => ({ type: \"available\", ...i }))\n      .concat(analysis.playerUnassignedOrgs.map((i) => ({ type: \"unassigned\", ...i }))),\n    weights,\n    playerMissionCounts,\n    getOrganizationScore,\n    \"noMissionScore\" // ignore missions when sorting orgs\n  ).toSorted((a, b) => (a.isAdminOrg === b.isAdminOrg ? 0 : a.isAdminOrg ? -1 : 1)); // admin orgs first\n  const usedOrgs = analysis.playerCouncilors.flatMap((councilor) =>\n    councilor.orgs.map((o) => ({ ...o, type: \"used\", councilor: councilor.displayName, councilorId: councilor.id }))\n  );\n  const scoredUsedOrgs = scoreAndSort(usedOrgs, weights, playerMissionCounts, getOrganizationScore);\n  const scoredOwnedOrgs = scoreAndSort(\n    analysis.playerUnassignedOrgs.map((i) => ({ type: \"unassigned\", ...i })).concat(usedOrgs),\n    weights,\n    playerMissionCounts,\n    getOrganizationScore\n  );\n\n  const bestAvailableCouncilor = scoredAvailableCouncilors[0]?.score.value;\n  const worstExistingCouncilor = scoredBaseCouncilors[scoredBaseCouncilors.length - 1]?.score.value;\n  const bestAvailableOrg = scoredOrgs[0]?.score.value;\n  const worstExistingOrg = scoredUsedOrgs[scoredUsedOrgs.length - 1]?.score.value;\n\n  return {\n    key: \"councilors\",\n    tab: (\n      <>\n        Councilors ({worstExistingCouncilor?.toFixed(0)} vs. {bestAvailableCouncilor?.toFixed(0)}) / Orgs (\n        {worstExistingOrg?.toFixed(2)} vs {bestAvailableOrg?.toFixed(2)})\n      </>\n    ),\n    content: (\n      <CouncilorsComponent\n        {...{\n          analysis,\n          weights,\n          setWeights,\n          scoredModifiedCouncilors,\n          scoredAvailableCouncilors,\n          scoredBaseCouncilors,\n          scoredOrgs,\n          scoredOwnedOrgs,\n        }}\n      />\n    ),\n  };\n}\n"
}
```

**Output:**
```
Edit applied successfully.
```

---

## Assistant (Build · Gemma 4-26B-A4B (local) · 81.0s)

_Thinking:_

Now that `getCouncilorsUi` returns a `NavItem` (with `label` instead of `tab`), I must update `RenderGameComponent` to handle the change, otherwise it will break because it expects `tab` to exist on the objects in the `tabs` array.

Wait, I'll also need to update `getFleetsUi`, `getHabsUi`, etc.

Let's update `getFleetsUi` first.



**Tool: edit**

**Input:**
```json
{
  "filePath": "terra-invicta-assistant\\src\\app\\game\\current\\fleets.tsx",
  "newString": "export function getFleetsUi(analysis: Analysis): NavItem {\n  const byTarget = analysis.alienFleetsToPlayerOrbits.reduce((acc, fleet) => {\n    const key = fleet.planetName || \"Unknown Orbit\";\n    if (!acc.has(key)) {\n      acc.set(key, []);\n    }\n    acc.get(key)!.push(fleet);\n    return acc;\n  }, new Map<string, typeof analysis.alienFleetsToPlayerOrbits>());\n  const label = [\n    ...byTarget.entries().map(([target, rawFleets]) => {\n      const fleets = rawFleets.filter((f) => f.deltaV > 0 && (f.daysToTarget || 0) > 0);\n      const surv = rawFleets.filter((f) => f.operation === \"AlienEarthSurveillanceOperation\" && !f.arrivalTime);\n      const survInfo = surv.length ? (\n        <>\n          <span className=\"text-white bg-destructive rounded py-2 px-3 font-bold\">\n            {surv\n              .map((f) => f.operationCompleteDays || 0)\n              .reduce((a, b) => Math.min(a, b), 9999999999)\n              .toFixed(0)}\n            d Surveillance\n          </span >{\" \"}\n        </>\n      ) : null;\n      if (fleets.length === 0) {\n        if (survInfo) {\n          return (\n            <span\n              key={target}\n            >\n              {target}: {survInfo}\n            </span >\n          );\n        }\n        return null;\n      }\n      // now that we know the arrival of the first one, find all arriving within 14 days to summarize MC\n      const firstFleet = sortByDateTime(fleets, (f) => f.arrivalTime || analysis.gameCurrentDateTime)[0];\n      const firstFleets = fleets.filter(\n        (f) =>\n          toDays(\n            diffDateTime(\n              f.arrivalTime || analysis.gameCurrentDateTime,\n              firstFleet.arrivalTime || analysis.gameCurrentDateTime,\n            ),\n          ) < 14,\n      );\n      const firstMc = firstFleets.reduce((sum, f) => sum + f.totalMC, 0);\n\n      // tier 2 hab (60d), fusion power, and defense module (90d) take a total of 150 days\n      // tier 3 hab (90d), fusion power, and defense module (180d) take a total of 270 days.\n      // T2 hab should be able to stop a bombard from a 10MC fleet, and T3 is the best we can do anyway, plus the turn time of 30 days should make for enough warning\n      // before that, we'll still have the nameplate warning and can look at details in the fleets tab\n      const warningNeeded = (firstMc > 10 ? 270 : 150) + 30;\n      const daysToTarget = firstFleet.daysToTarget || 0;\n      const farFuture = daysToTarget > warningNeeded;\n      const className = twMerge(\n        farFuture && \"px-1 -mx-1 py-0.5 -my-0.5 rounded bg-green-500\",\n        farFuture &&\n          (daysToTarget < warningNeeded + 50\n            ? \"bg-red-200\"\n            : daysToTarget < warningNeeded + 100\n              ? \"bg-yellow-200\"\n              : \"bg-green-200\"),\n      );\n      return (\n        <span\n          key={target}\n          className={className}\n          title={`${fleets.length} fleet(s) targeting ${target}, arriving in ${daysToTarget.toFixed(\n            0,\n          )} days, using ${firstMc.toFixed(0)} MC`}\n        >\n          {target}\n          {fleets.length > 1 ? `(${fleets.length})` : \"\"}\n          {farFuture ? (\n            \"\"\n          ) : (\n            <>\n              : {daysToTarget.toFixed(0)}d <MissionControl />\n              {firstMc.toFixed(0)}\n            </>\n          )}\n          {survInfo && <>,{survInfo}</>}\n        </span >\n      );\n    }),\n  ].filter((i) => !!i);\n  return {\n    key: \"fleets\",\n    label: (\n      <>\n        Fleets\n        {label.length > 0 ? (\n          <>\n            {\" - \"}\n            {label.map((i, ix) => (\n              <Fragment key={ix}>\n                {i}\n                {ix < label.length - 1 ? \" | \" : \"\"}\n              </Fragment>\n            ))}\n          </>\n        ) : (\n          \"\"\n        )}\n      </>\n    ),\n    content: <FleetsComponent analysis={analysis} />,\n  };\n}\n",
  "oldString": "export function getFleetsUi(analysis: Analysis) {\n  const byTarget = analysis.alienFleetsToPlayerOrbits.reduce((acc, fleet) => {\n    const key = fleet.planetName || \"Unknown Orbit\";\n    if (!acc.has(key)) {\n      acc.set(key, []);\n    }\n    acc.get(key)!.push(fleet);\n    return acc;\n  }, new Map<string, typeof analysis.alienFleetsToPlayerOrbits>());\n  const label = [\n    ...byTarget.entries().map(([target, rawFleets]) => {\n      const fleets = rawFleets.filter((f) => f.deltaV > 0 && (f.daysToTarget || 0) > 0);\n      const surv = rawFleets.filter((f) => f.operation === \"AlienEarthSurveillanceOperation\" && !f.arrivalTime);\n      const survInfo = surv.length ? (\n        <>\n          <span className=\"text-white bg-destructive rounded py-2 px-3 font-bold\">\n            {surv\n              .map((f) => f.operationCompleteDays || 0)\n              .reduce((a, b) => Math.min(a, b), 9999999999)\n              .toFixed(0)}\n            d Surveillance\n          </span >{\" \"}\n        </>\n      ) : null;\n      if (fleets.length === 0) {\n        if (survInfo) {\n          return (\n            <span\n              key={target}\n            >\n              {target}: {survInfo}\n            </span >\n          );\n        }\n        return null;\n      }\n      // now that we know the arrival of the first one, find all arriving within 14 days to summarize MC\n      const firstFleet = sortByDateTime(fleets, (f) => f.arrivalTime || analysis.gameCurrentDateTime)[0];\n      const firstFleets = fleets.filter(\n        (f) =>\n          toDays(\n            diffDateTime(\n              f.arrivalTime || analysis.gameCurrentDateTime,\n              firstFleet.arrivalTime || analysis.gameCurrentDateTime,\n            ),\n          ) < 14,\n      );\n      const firstMc = firstFleets.reduce((sum, f) => sum + f.totalMC, 0);\n\n      // tier 2 hab (60d), fusion power, and defense module (90d) take a total of 150 days\n      // tier 3 hab (90d), fusion power, and defense module (180d) take a total of 270 days.\n      // T2 hab should be able to stop a bombard from a 10MC fleet, and T3 is the best we can do anyway, plus the turn time of 30 days should make for enough warning\n      // before that, we'll still have the nameplate warning and can look at details in the fleets tab\n      const warningNeeded = (firstMc > 10 ? 270 : 150) + 30;\n      const daysToTarget = firstFleet.daysToTarget || 0;\n      const farFuture = daysToTarget > warningNeeded;\n      const className = twMerge(\n        farFuture && \"px-1 -mx-1 py-0.5 -my-0.5 rounded bg-green-500\",\n        farFuture &&\n          (daysToTarget < warningNeeded + 50\n            ? \"bg-red-200\"\n            : daysToTarget < warningNeeded + 100\n              ? \"bg-yellow-200\"\n              : \"bg-green-200\"),\n      );\n      return (\n        <span\n          key={target}\n          className={className}\n          title={`${fleets.length} fleet(s) targeting ${target}, arriving in ${daysToTarget.toFixed(\n            0,\n          )} days, using ${firstMc.toFixed(0)} MC`}\n        >\n          {target}\n          {fleets.length > 1 ? `(${fleets.length})` : \"\"}\n          {farFuture ? (\n            \"\"\n          ) : (\n            <>\n              : {daysToTarget.toFixed(0)}d <MissionControl />\n              {firstMc.toFixed(0)}\n            </>\n          )}\n          {survInfo && <>,{survInfo}</>}\n        </span >\n      );\n    }),\n  ].filter((i) => !!i);\n  return {\n    key: \"fleets\",\n    tab: (\n      <>\n        Fleets\n        {label.length > 0 ? (\n          <>\n            {\" - \"}\n            {label.map((i, ix) => (\n              <Fragment key={ix}>\n                {i}\n                {ix < label.length - 1 ? \" | \" : \"\"}\n              </Fragment>\n            ))}\n          </>\n        ) : (\n          \"\"\n        )}\n      </>\n    ),\n    content: <FleetsComponent analysis={analysis} />,\n  };\n}\n"
}
```

**Output:**
```
Edit applied successfully.
```

---

## Assistant (Build · Gemma 4-26B-A4B (local) · 27.9s)

_Thinking:_

I'll also need to update the imports in `fleets.tsx` to include `NavItem`.

Wait, I should probably do it for all files.

Let's update `habs.tsx`.



**Tool: edit**

**Input:**
```json
{
  "filePath": "terra-invicta-assistant\\src\\app\\game\\current\\habs.tsx",
  "newString": "import {\n  Boost,\n  CombatScore,\n  FactionIcons,\n  HabPower,\n  MissionControl,\n  TechIcons,\n  UnknownIcon,\n  Water,\n  Volatiles,\n  Metals,\n  Nobles,\n  Fissiles,\n  ControlPoint,\n} from \"@/components/icons\";\nimport { combineEffects, ShowEffects, ShowEffectsProps } from \"@/components/showEffects\";\nimport { AccordionContent, AccordionItem, AccordionTrigger } from \"@/components/ui/accordion\";\nimport { Button } from \"@/components/ui/button\";\nimport { Card, CardContent, CardHeader, CardTitle } from \"@/components/ui/card\";\nimport { Collapsible, CollapsibleContent, CollapsibleTrigger } from \"@/components/ui/collapsible\";\nimport { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from \"@/components/ui/table\";\nimport { Analysis } from \"@/lib/analysis\";\nimport { formatDateTime, noDate } from \"@/lib/utils\";\nimport { Fragment, useState } from \"react\";\nimport { useTechnologyGoals, TechnologyGoalsDialog, TechnologyGoalsList } from \"./technologyGoals\";\nimport { ResearchLink } from \"./researchLink\";\nimport { twMerge } from \"tailwind-merge\";\nimport { User, Factory, ArrowUp, Pickaxe } from \"lucide-react\";\nimport { SmartAccordion } from \"@/components/ui/smart-accordion\";\nimport { NavItem } from \"./types\";\n",
  "oldString": "import {\n  Boost,\n  CombatScore,\n  FactionIcons,\n  HabPower,\n  MissionControl,\n  TechIcons,\n  UnknownIcon,\n  Water,\n  Volatiles,\n  Metals,\n  Nobles,\n  Fissiles,\n  ControlPoint,\n} from \"@/components/icons\";\nimport { combineEffects, ShowEffects, ShowEffectsProps } from \"@/components/showEffects\";\nimport { AccordionContent, AccordionItem, AccordionTrigger } from \"@/components/ui/accordion\";\nimport { Button } from \"@/components/ui/button\";\nimport { Card, CardContent, CardHeader, CardTitle } from \"@/components/ui/card\";\nimport { Collapsible, CollapsibleContent, CollapsibleTrigger } from \"@/components/ui/collapsible\";\nimport { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from \"@/components/ui/table\";\nimport { Analysis } from \"@/lib/analysis\";\nimport { formatDateTime, noDate } from \"@/lib/utils\";\nimport { Fragment, useState } from \"react\";\nimport { useTechnologyGoals, TechnologyGoalsDialog, TechnologyGoalsList } from \"./technologyGoals\";\nimport { ResearchLink } from \"./researchLink\";\nimport { twMerge } from \"tailwind-merge\";\nimport { User, Factory, ArrowUp, Pickaxe } from \"lucide-react\";\nimport { SmartAccordion } from \"@/components/ui/smart-accordion\";\n"
}
```

**Output:**
```
Edit applied successfully.
```

---

## Assistant (Build · Gemma 4-26B-A4B (local) · 92.9s)

_Thinking:_

Now updating `getHabsUi` in `habs.tsx`.



**Tool: edit**

**Input:**
```json
{
  "filePath": "terra-invicta-assistant\\src\\app\\game\\current\\habs.tsx",
  "newString": "export function getHabsUi(analysis: Analysis): NavItem {\n  const { playerHabs } = analysis;\n\n  const missingMines = playerHabs.filter((h) => h.missingMine);\n  const unnecessaryFactoryHabs = playerHabs.filter((h) => h.hasUnnecessaryFactory);\n  const upgradablePowerHabs = playerHabs.filter((h) => h.canUpgradePower);\n  const upgradableCombatHabs = playerHabs.filter((h) => h.canUpgradeCombat);\n  const upgradableFarmHabs = playerHabs.filter((h) => h.canUpgradeFarm);\n  const upgradableFactoryHabs = playerHabs.filter((h) => h.canUpgradeFactory);\n  const upgradableMiningHabs = playerHabs.filter((h) => h.canUpgradeMining);\n  const upgradableOtherHabs = playerHabs.filter((h) => h.upgradeableModuleNames.length > 0);\n  const nextCompletion = playerHabs\n    .flatMap((i) => i.highlightedCompletions)\n    .filter((i) => i)\n    .toSorted((a, b) => {\n      return a.daysToCompletion < b.daysToCompletion ? -1 : 1;\n    })[0];\n\n  // can't use a tooltip for this because it's in the button that is the tab label, which would be nested buttons and cause hydration issues\n  const missingMinesTitle =\n    missingMines.length > 0 ? `Missing mines: ${missingMines.map((h) => h.displayName).join(\", \")}` : \"\";\n  const unnecessaryFactoryTitle =\n    unnecessaryFactoryHabs.length > 0\n      ? `${unnecessaryFactoryHabs.length} hab${unnecessaryFactoryHabs.length > 1 ? \"s have\" : \" has\"} unnecessary active factories`\n      : \"\";\n  const upgradablePowerTitle =\n    upgradablePowerHabs.length > 0\n      ? `${upgradablePowerHabs.length} hab${upgradablePowerHabs.length > 1 ? \"s\" : \"\"} can upgrade power modules`\n      : \"\";\n  const upgradableCombatTitle =\n    upgradableCombatHabs.length > 0\n      ? `${upgradableCombatHabs.length} hab${upgradableCombatHabs.length > 1 ? \"s\" : \"\"} can upgrade combat modules`\n      : \"\";\n  const upgradableFarmTitle =\n    upgradableFarmHabs.length > 0\n      ? `${upgradableFarmHabs.length} hab${upgradableFarmHabs.length > 1 ? \"s\" : \"\"} can upgrade farms for more crew`\n      : \"\";\n  const upgradableFactoryTitle =\n    upgradableFactoryHabs.length > 0\n      ? `${upgradableFactoryHabs.length} hab${upgradableFactoryHabs.length > 1 ? \"s\" : \"\"} can upgrade factories`\n      : \"\";\n  const upgradableMiningTitle =\n    upgradableMiningHabs.length > 0\n      ? `${upgradableMiningHabs.length} hab${upgradableMiningHabs.length > 1 ? \"s\" : \"\"} can upgrade mining modules`\n      : \"\";\n  const upgradableOtherTitle =\n    upgradableOtherHabs.length > 0\n      ? `${upgradableOtherHabs.length} hab${\n          upgradableOtherHabs.length > 1 ? \"s have\" : \" has\"\n        } other upgradeable modules`\n      : \"\";\n\n  return {\n    key: \"habs\",\n    label: (\n      <>\n        Habs ({playerHabs.length}){nextCompletion && <> {nextCompletion.daysToCompletion?.toFixed(0)}d</>}\n        {missingMines.length > 0 && (\n          <>\n            {\" \"}\n            <span className=\"bg-yellow-300 text-black p-1 rounded\" title={missingMinesTitle}>\n              M\n            </span >\n          </>\n        )}\n        {unnecessaryFactoryHabs.length > 0 && (\n          <>\n            {\" \"}\n            <span title={unnecessaryFactoryTitle}>\n              <Factory className=\"inline h-4 w-4 text-red-600\" />\n            </span >\n          </>\n        )}\n        {upgradablePowerHabs.length > 0 && (\n          <>\n            {\" \"}\n            <HabPower title={upgradablePowerTitle} />\n          </>\n        )}\n        {upgradableCombatHabs.length > 0 && (\n          <>\n            {\" \"}\n            <CombatScore title={upgradableCombatTitle} />\n          </>\n        )}\n        {upgradableFarmHabs.length > 0 && (\n          <>\n            {\" \"}\n            <span title={upgradableFarmTitle}>\n              <User className=\"inline h-4 w-4\" />\n            </span >\n          </>\n        )}\n        {upgradableFactoryHabs.length > 0 && (\n          <>\n            {\" \"}\n            <span title={upgradableFactoryTitle}>\n              <Factory className=\"inline h-4 w-4\" />\n            </span >\n          </>\n        )}\n        {upgradableMiningHabs.length > 0 && (\n          <>\n            {\" \"}\n            <span title={upgradableMiningTitle}>\n              <Pickaxe className=\"inline h-4 w-4\" />\n            </span >\n          </>\n        )}\n        {upgradableOtherHabs.length > 0 && (\n          <>\n            {\" \"}\n            <span title={upgradableOtherTitle}>\n              <ArrowUp className=\"inline h-4 w-4\" />\n            </span >\n          </>\n        )}\n      </>\n    ),\n    content: (\n      <HabsComponent\n        {...{\n          analysis,\n        }}\n      />\n    ),\n  };\n}\n",
  "oldString": "export function getHabsUi(analysis: Analysis) {\n  const { playerHabs } = analysis;\n\n  const missingMines = playerHabs.filter((h) => h.missingMine);\n  const unnecessaryFactoryHabs = playerHabs.filter((h) => h.hasUnnecessaryFactory);\n  const upgradablePowerHabs = playerHabs.filter((h) => h.canUpgradePower);\n  const upgradableCombatHabs = playerHabs.filter((h) => h.canUpgradeCombat);\n  const upgradableFarmHabs = playerHabs.filter((h) => h.canUpgradeFarm);\n  const upgradableFactoryHabs = playerHabs.filter((h) => h.canUpgradeFactory);\n  const upgradableMiningHabs = playerHabs.filter((h) => h.canUpgradeMining);\n  const upgradableOtherHabs = playerHabs.filter((h) => h.upgradeableModuleNames.length > 0);\n  const nextCompletion = playerHabs\n    .flatMap((i) => i.highlightedCompletions)\n    .filter((i) => i)\n    .toSorted((a, b) => {\n      return a.daysToCompletion < b.daysToCompletion ? -1 : 1;\n    })[0];\n\n  // can't use a tooltip for this because it's in the button that is the tab label, which would be nested buttons and cause hydration issues\n  const missingMinesTitle =\n    missingMines.length > 0 ? `Missing mines: ${missingMines.map((h) => h.displayName).join(\", \")}` : \"\";\n  const unnecessaryFactoryTitle =\n    unnecessaryFactoryHabs.length > 0\n      ? `${unnecessaryFactoryHabs.length} hab${unnecessaryFactoryHabs.length > 1 ? \"s have\" : \" has\"} unnecessary active factories`\n      : \"\";\n  const upgradablePowerTitle =\n    upgradablePowerHabs.length > 0\n      ? `${upgradablePowerHabs.length} hab${upgradablePowerHabs.length > 1 ? \"s\" : \"\"} can upgrade power modules`\n      : \"\";\n  const upgradableCombatTitle =\n    upgradableCombatHabs.length > 0\n      ? `${upgradableCombatHabs.length} hab${upgradableCombatHabs.length > 1 ? \"s\" : \"\"} can upgrade combat modules`\n      : \"\";\n  const upgradableFarmTitle =\n    upgradableFarmHabs.length > 0\n      ? `${upgradableFarmHabs.length} hab${upgradableFarmHabs.length > 1 ? \"s\" : \"\"} can upgrade farms for more crew`\n      : \"\";\n  const upgradableFactoryTitle =\n    upgradableFactoryHabs.length > 0\n      ? `${upgradableFactoryHabs.length} hab${upgradableFactoryHabs.length > 1 ? \"s\" : \"\"} can upgrade factories`\n      : \"\";\n  const upgradableMiningTitle =\n    upgradableMiningHabs.length > 0\n      ? `${upgradableMiningHabs.length} hab${upgradableMiningHabs.length > 1 ? \"s\" : \"\"} can upgrade mining modules`\n      : \"\";\n  const upgradableOtherTitle =\n    upgradableOtherHabs.length > 0\n      ? `${upgradableOtherHabs.length} hab${\n          upgradableOtherHabs.length > 1 ? \"s have\" : \" has\"\n        } other upgradeable modules`\n      : \"\";\n\n  return {\n    key: \"habs\",\n    tab: (\n      <>\n        Habs ({playerHabs.length}){nextCompletion && <> {nextCompletion.daysToCompletion?.toFixed(0)}d</>}\n        {missingMines.length > 0 && (\n          <>\n            {\" \"}\n            <span className=\"bg-yellow-300 text-black p-1 rounded\" title={missingMinesTitle}>\n              M\n            </span >\n          </>\n        )}\n        {unnecessaryFactoryHabs.length > 0 && (\n          <>\n            {\" \"}\n            <span title={unnecessaryFactoryTitle}>\n              <Factory className=\"inline h-4 w-4 text-red-600\" />\n            </span >\n          </>\n        )}\n        {upgradablePowerHabs.length > 0 && (\n          <>\n            {\" \"}\n            <HabPower title={upgradablePowerTitle} />\n          </>\n        )}\n        {upgradableCombatHabs.length > 0 && (\n          <>\n            {\" \"}\n            <CombatScore title={upgradableCombatTitle} />\n          </>\n        )}\n        {upgradableFarmHabs.length > 0 && (\n          <>\n            {\" \"}\n            <span title={upgradableFarmTitle}>\n              <User className=\"inline h-4 w-4\" />\n            </span >\n          </>\n        )}\n        {upgradableFactoryHabs.length > 0 && (\n          <>\n            {\" \"}\n            <span title={upgradableFactoryTitle}>\n              <Factory className=\"inline h-4 w-4\" />\n            </span >\n          </>\n        )}\n        {upgradableMiningHabs.length > 0 && (\n          <>\n            {\" \"}\n            <span title={upgradableMiningTitle}>\n              <Pickaxe className=\"inline h-4 w-4\" />\n            </span >\n          </>\n        )}\n        {upgradableOtherHabs.length > 0 && (\n          <>\n            {\" \"}\n            <span title={upgradableOtherTitle}>\n              <ArrowUp className=\"inline h-4 w-4\" />\n            </span >\n          </>\n        )}\n      </>\n    ),\n    content: (\n      <HabsComponent\n        {...{\n          analysis,\n        }}\n      />\n    ),\n  };\n}\n"
}
```

**Output:**
```
Edit applied successfully.
```

---

## Assistant (Build · Gemma 4-26B-A4B (local) · 9.2s)

_Thinking:_

Now updating `getResourcesUi` and `getDrivesUi` in their respective files.

Wait, I need to find where they are.
`getResourcesUi` is in `src/app/game/current/resources.tsx` (I'll check).
`getDrivesUi` is in `src/app/game/current/drives.tsx` (I'll check).



**Tool: glob**

**Input:**
```json
{
  "pattern": "src/app/game/current/res*"
}
```

**Output:**
```
terra-invicta-assistant\src\app\game\current\resources.tsx
terra-invicta-assistant\src\app\game\current\researchLink.tsx
```

---

## Assistant (Build · Gemma 4-26B-A4B (local) · 4.6s)

_Thinking:_

Okay, `resources.tsx` exists.



**Tool: glob**

**Input:**
```json
{
  "pattern": "src/app/game/current/drives*"
}
```

**Output:**
```
terra-invicta-assistant\src\app\game\current\drives.tsx
```

---

## Assistant (Build · Gemma 4-26B-A4B (local) · 4.9s)

_Thinking:_

Okay, `drives.tsx` exists.

Let's update `resources.tsx`. I'll need to see the content first.



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

---

## Assistant (Build · Gemma 4-26B-A4B (local) · 27.2s)

_Thinking:_

I'll update `getResourcesUi` in `resources.tsx`.

Wait, I'll do it for all of them.

Actually, I'll first update `RenderGameComponent` to use the new navigation structure. This will make the changes more visible and easier to debug.

I'll need a tree-style sidebar component. I can use Radix UI or just standard Tailwind components. Since the app uses `@/components/ui/...`, I should probably look for an existing tree component or implement a simple one.

The user wants a "collapsible tree-style navigation".

Let's see if there is any tree component in `@/components/ui`.



**Tool: glob**

**Input:**
```json
{
  "pattern": "src/components/ui/*tree*"
}
```

**Output:**
```
No files found
```

---

## Assistant (Build · Gemma 4-26B-A4B (local) · 1004.5s)

_Thinking:_

Okay, I'll implement a simple tree component.

First, let's update `RenderGameComponent` in `src/app/game/current/component.tsx`.
I'll need to import `NavItem` and probably create a `TreeSidebar` component.

Wait, I'll also need to update all the `get*Ui` functions to return `NavItem`.

I'll start by updating `RenderGameComponent` to handle `NavItem` instead of the old structure.

Old structure:
```typescript
interface OldTab {
  key: string;
  tab: React.ReactNode;
  content: React.ReactNode;
}
```

New structure:
```typescript
interface NavItem {
  key: string;
  label: string;
  subtitle?: React.ReactNode;
  children?: NavItem[];
  content?: React.ReactNode;
}
```

I'll refactor `RenderGameComponent` to use a layout with a sidebar.

Wait, if I change the return type of `get*Ui` functions, I'll break `RenderGameComponent`. I'll do both together.

Let's plan the new `RenderGameComponent`.

```tsx
export function RenderGameComponent({ analysis }: { analysis: Analysis }) {
  const [selectedKey, setSelectedKey] = useState<string | undefined>();

  // Since we need to handle the weights state, and all get*Ui functions need it,
  // we should probably move the weight state to RenderGameComponent.
  // BUT, the current implementation of getCouncilorsUi has its own useState for weights.
  // This is problematic because it's called as a function.
  // To fix this properly, we should move the weights to a state in RenderGameComponent.
  // However, let's see if we can just pass the weights to all get*Ui functions.

  // For now, let's assume get*Ui functions take weights as an argument.
  // This is a better design.
}
```

Wait, if I change the signature of `get*Ui` functions, I have to update all of them.

Let's start by defining the `NavItem` in `src/app/game/current/types.ts` (already done).

Now, I'll update `src/app/game/current/component.tsx`.

I'll implement a `Sidebar` component inside `RenderGameComponent`.

Wait, I'll also need to update `getCouncilorsUi` etc. to return the tree.

Let's do `getCouncilorsUi` first, but I'll make it return a `NavItem` and I'll move the `weights` state to `RenderGameComponent`.

Wait, if I move the `weights` state to `RenderGameComponent`, I have to update `getCouncilorsUi`'s signature.

Let's see.

Currently:
`getCouncilorsUi(analysis: Analysis): { key: string, tab: React.ReactNode, content: React.ReactNode }`

New:
`getCouncilorsUi(analysis: Analysis, weights: ScoringWeights, setWeights: (w: ScoringWeights) => void): NavItem`

This will require updating all `get*Ui` functions.

Let's see `getFleetsUi`. It doesn't use weights.

`getHabsUi` doesn't seem to use weights (it uses `technologyGoals` which might use weights? No, it uses `useTechnologyGoals(analysis)`).

`getResourcesUi` doesn't use weights.

`getDrivesUi` doesn't use weights.

So only `getCouncilorsUi` needs the `weights` as an argument.

Wait, let me check `getHabsUi` again.
It uses `useTechnologyGoals(analysis)`.

Okay, so only `getCouncilorsUi` is special.

Let's start.

**Step 1: Update `src/app/game/current/types.ts`** (Done).

**Step 2: Update `src/app/game/current/councilors.tsx`**
- Update `getCouncilorsUi` signature.
- Update `getCouncilorsUi` to return `NavItem` with children.
- Refactor `CouncilorsComponent` into `CouncilorsSection` and other pieces.

Wait, I'll first try to update the signature of `getCouncilorsUi` in `councilors.tsx`.



**Tool: invalid**

**Input:**
```json
{
  "tool": "edit",
  "error": "Invalid input for tool edit: JSON parsing failed: Text: {\"filePath\":\"terra-invicta-assistant\\\\src\\\\app\\\\game\\\\current\\\\councilors.tsx\",\"newString\":\"export function getCouncilorsUi(analysis: Analysis, weights: ScoringWeights, setWeights: (weights: ScoringWeights) => void): NavItem {\\n  const { playerMissionCounts } = analysis;\\n\\n  const scoredModifiedCouncilors = scoreAndSort(\\n    analysis.playerCouncilors,\\n    weights,\\n    playerMissionCounts,\\n    getModifiedCouncilorScore\\n  );\\n  const scoredAvailableCouncilors = scoreAndSort(\\n    analysis.playerAvailableCouncilors,\\n    weights,\\n    playerMissionCounts,\\n    getBaseCouncilorScore\\n  );\\n  const scoredBaseCouncilors = scoreAndSort(\\n    analysis.playerCouncilors,\\n    weights,\\n    playerMissionCounts,\\n    getBaseCouncilorScore\\n  );\\n  const scoredOrgs = scoreAndSort(\\n    analysis.playerAvailableOrgs\\n      .map((i) => ({ type: \\\"available\\\", ...i }))\\n      .concat(analysis.playerUnassignedOrgs.map((i) => ({ type: \\\"unassigned\\\", ...i }))),\\n    weights,\\n    playerMissionCounts,\\n    getOrganizationScore,\\n    \\\"noMissionScore\\\" // ignore missions when sorting orgs\\n  ).toSorted((a, b) => (a.isAdminOrg === b.isAdminOrg ? 0 : a.isAdminOrg ? -1 : 1)); // admin orgs first\\n  const usedOrgs = analysis.playerCouncilors.flatMap((councilor) =>\\n    councilor.orgs.map((o) => ({ ...o, type: \\\"used\\\", councilor: councilor.displayName, councilorId: councilor.id }))\\n  );\\n  const scoredUsedOrgs = scoreAndSort(usedOrgs, weights, playerMissionCounts, getOrganizationScore);\\n  const scoredOwnedOrgs = scoreAndSort(\\n    analysis.playerUnassignedOrgs.map((i) => ({ type: \\\"unassigned\\\", ...i })).concat(usedOrgs),\\n    weights,\\n    playerMissionCounts,\\n    getOrganizationScore\\n  );\\n\\n  const bestAvailableCouncilor = scoredAvailableCouncilors[0]?.score.value;\\n  const worstExistingCouncilor = scoredBaseCouncilors[scoredBaseCouncilors.length - 1]?.score.value;\\n  const bestAvailableOrg = scoredOrgs[0]?.score.value;\\n  const worstExistingOrg = scoredUsedOrgs[scoredUsedOrgs.length - 1]?.score.value;\\n\\n  return {\\n    key: \\\"councilors\\\",\\n    label: \\\"Councilors\\\",\\n    subtitle: (\\n      <>\\n        ({worstExistingCouncilor?.toFixed(0)} vs. {bestAvailableCouncilor?.toFixed(0)}) / Orgs (\\n        {worstExistingOrg?.toFixed(2)} vs {bestAvailableOrg?.toFixed(2)})\\n      </>\\n    ),\\n    children: [\\n      {\\n        key: \\\"councilors-existing\\\",\\n        label: \\\"Existing Council\\\",\\n        content: (\\n          <CouncilorsSection\\n            {...{\\n              analysis,\\n              weights,\\n              setWeights,\\n              scoredModifiedCouncilors,\\n              scoredAvailableCouncilors,\\n              scoredBaseCouncilors,\\n              scoredOrgs,\\n              scoredOwnedOrgs,\\n            }}\\n            section=\\\"existing\\\"\\n          />\\n        ),\\n      },\\n      {\\n        key: \\\"councilors-new-councilors\\\",\\n        label: \\\"Find new\\\",\\n        content: (\\n          <CouncilorsSection\\n            {...{\\n              analysis,\\n              weights,\\n              setWeights,\\n              scoredModifiedCouncilors,\\n              scoredAvailableCouncilors,\\n              scoredBaseCouncilors,\\n              scoredOrgs,\\n              scoredOwnedOrgs,\\n            }}\\n            section=\\\"new-councilors\\\"\\n          />\\n        ),\\n      },\\n      {\\n        key: \\\"councilors-current-orgs\\\",\\n        label: \\\"Current Organizations\\\",\\n        content: (\\n          <CouncilorsSection\\n            {...{\\n              analysis,\\n              weights,\\n              setWeights,\\n              scoredModifiedCouncilors,\\n              scoredAvailableCouncilors,\\n              scoredBaseCouncilors,\\n              scoredOrgs,\\n              scoredOwnedOrgs,\\n            }}\\n            section=\\\"current-orgs\\\"\\n          />\\n        ),\\n      },\\n      {\\n        key: \\\"councilors-takeover\\\",\\n        label: \\\"Hostile Takeover\\\",\\n        content: (\\n          <CouncilorsSection\\n            {...{\\n              analysis,\\n              weights,\\n              setWeights,\\n              scoredModifiedCouncilors,\\n              scoredAvailableCouncilors,\\n              scoredBaseCouncilors,\\n              scoredOrgs,\\n              scoredOwnedOrgs,\\n            }}\\n            section=\\\"takeover\\\"\\n          />\\n        ),\\n      },\\n      {\\n        key: \\\"councilors-missions\\\",\\n        label: \\\"Missions\\\",\\n        content: (\\n          <CouncilorsSection\\n            {...{\\n              analysis,\\n              weights,\\n              setWeights,\\n              scoredModifiedCouncilors,\\n              scoredAvailableCouncilors,\\n              scoredBaseCouncilors,\\n              scoredOrgs,\\n              scoredOwnedOrgs,\\n            }}\\n            section=\\\"missions\\\"\\n          />\\n        ),\\n      },\\n      {\\n        key: \\\"councilors-other-councilors\\\",\\n        label: \\\"Other Councilors\\\",\\n        content: (\\n          <CouncilorsSection\\n            {...{\\n              analysis,\\n              weights,\\n              setWeights,\\n              scoredModifiedCouncilors,\\n              scoredAvailableCouncilors,\\n              scoredBaseCouncilors,\\n              scoredOrgs,\\n              scoredOwnedOrgs,\\n            }}\\n            section=\\\"other-councilors\\\"\\n          />\\n        ),\\n      },\\n    ],\\n  };\\n}\\n\\nfunction CouncilorsSection({\\n  analysis,\\n  weights,\\n  setWeights,\\n  scoredModifiedCouncilors,\\n  scoredAvailableCouncilors,\\n  scoredBaseCouncilors,\\n  scoredOrgs,\\n  scoredOwnedOrgs,\\n  section,\\n}: {\\n  analysis: Analysis;\\n  weights: ScoringWeights;\\n  setWeights: (weights: ScoringWeights) => void;\\n  scoredModifiedCouncilors: (Analysis[\\\"playerCouncilors\\\"][number] & { score: ScoreResult })[];\\n  scoredAvailableCouncilors: (Analysis[\\\"playerAvailableCouncilors\\\"][number] & { score: ScoreResult })[];\\n  scoredBaseCouncilors: (Analysis[\\\"playerCouncilors\\\"][number] & { score: ScoreResult })[];\\n  scoredOrgs: (Analysis[\\\"playerAvailableOrgs\\\"][number] & {\\n    type: string;\\n    score: ScoreResult;\\n  })[];\\n  scoredOwnedOrgs: (Analysis[\\\"playerAvailableOrgs\\\"][number] & {\\n    type: string;\\n    score: ScoreResult;\\n    councilor?: string;\\n    councilorId?: number;\\n  })[];\\n  section: \\\"existing\\\" | \\\"new-councilors\\\" | \\\"current-orgs\\\" | \\\"takeover\\\" | \\\"missions\\\" | \\\"other-councilors\\\";\\n}) {\\n  const {\\n    playerMissionCounts,\\n    playerVisibleCouncilors,\\n    playerCouncilors,\\n    playerAvailableOrgs,\\n    playerUnassignedOrgs,\\n    playerFaction,\\n    playerStealableOrgs,\\n    factionsById,\\n  } = analysis;\\n  const scoredStealableOrgs = scoreAndSort(\\n    analysis.playerStealableOrgs.map((i) => ({ type: \\\"stealable\\\", ...i })),\\n    weights,\\n    playerMissionCounts,\\n    getOrganizationScore,\\n    \\\"noMissionScore\\\"\\n  );\\n  function currentHighlightMissionClassName(missionName: MissionDataName) {\\n    const count = playerMissionCounts.get(missionName) || 0;\\n    if (count === 2) {\\n      return \\\"bg-yellow-300/50\\\";\\n    } else if (count === 1) {\\n      return \\\"bg-red-300/50\\\";\\n    }\\n  }\\n  function availableHighlightMissionClassName(missionName: MissionDataName) {\\n    const count = playerMissionCounts.get(missionName) || 0;\\n    if (count === 1) {\\n      return \\\"bg-yellow-300/50\\\";\\n    } else if (count === 0) {\\n      return \\\"bg-green-300/50\\\";\\n    }\\n  }\\n  const playerNationIds = new Set(analysis.playerNationIds);\\n  const playerTraits = new Set(analysis.playerCouncilors.flatMap((i) => i.traitTemplateNames));\\n  const unusedAdmin = analysis.playerCouncilors\\n    .map(\\n      (c) =>\\n        Math.min(\\n          25,\\n          Math.max(\\n            0,\\n            (c.effectsWithOrgsAndAugments.Administration || 0) + (c.effectsWithOrgsAndAugments.administration || 0)\\n          )\\n        ) - c.orgs.reduce((a, b) => a + b.tier, 0)\\n    )\\n    .reduce((a, b) => a + b, 0);\\n\\n  const stealableOrgsByFaction = scoredStealableOrgs.reduce((acc, org) => {\\n    const key = org.faction?.id || 0;\\n    if (!acc.has(key)) {\\n      acc.set(key, []);\\n    }\\n    acc.get(key)!.push(org);\\n    return acc;\\n  }, new Map<number, typeof scoredStealableOrgs>());\\n\\n  type MissionSource =\\n    | {\\n        type: \\\"councilor\\\";\\n        councilor: Analysis[\\\"playerCouncilors\\\"][number];\\n        factionId: number | undefined;\\n        missions: MissionDataName[];\\n      }\\n    | {\\n        type: \\\"org\\\";\\n        org: Analysis[\\\"playerAvailableOrgs\\\"][number];\\n        factionId: number | undefined;\\n        missions: MissionDataName[];\\n      };\\n\\n  const sourcesByFactionByMission = [...playerCouncilors, ...playerVisibleCouncilors]\\n    .map(\\n      (i) =>\\n        ({\\n          type: \\\"councilor\\\",\\n          councilor: i,\\n          factionId: i.factionId,\\n          missions: i.effectsWithOrgsAndAugments.missionsGrantedNames || [],\\n        } as MissionSource)\\n    )\\n    .concat(\\n      [...playerAvailableOrgs, ...playerUnassignedOrgs].map((i) => ({\\n        type: \\\"org\\\",\\n        org: i,\\n        factionId: playerFaction?.id,\\n        missions: i.template?.missionsGrantedNames || [],\\n      }))\\n    )\\n    .concat(\\n      playerStealableOrgs.map((i) => ({\\n        type: \\\"org\\\",\\n        org: i,\\n        factionId: i.faction?.id,\\n        missions: i.template?.missionsGrantedNames || [],\\n      }))\\n    )\\n    .reduce((acc, o) => {\\n      const key = o.factionId || 0;\\n      if (!acc.has(key)) {\\n        acc.set(key, new Map<string, MissionSource[]>());\\n      }\\n      const effectsMap = acc.get(key)!;\\n      o.missions.forEach((m) => {\\n        if (!effectsMap.has(m)) {\\n          effectsMap.set(m, []);\\n        }\\n        effectsMap.get(m)!.push(o);\\n      });\\n      return acc;\\n    }, new Map<number, Map<string, MissionSource[]>>());\\n  const factions = Array.from(sourcesByFactionByMission.keys())\\n    .map((factionId) => factionsById.get(factionId)!)\\n    .filter((f) => f)\\n    .toSorted((a, b) => {\\n      if (a.id === playerFaction.id) return -1;\\n      if (b.id === playerFaction.id) return 1;\\n      return (a.displayName || \\\"\\\").localeCompare(b.displayName || \\\"\\\");\\n    });\\n\\n  const importantMissions = [\\\"Assassinate\\\"];\\n\\n  const councilEffects = scoredModifiedCouncilors.reduce((acc, councilor) => {\\n    return combineEffects(acc, councilor.effectsWithOrgsAndAugments);\\n  }, {} as ShowEffectsProps);\\n\\n  if (section === \\\"existing\\\") {\\n    return (\\n      <div className=\\\"space-y-2\\\">\\n        <div className=\\\"py-1\\\">\\n          <ShowEffects\\n            incomeBoost_month={councilEffects.incomeBoost_month}\\n            incomeMoney_month={councilEffects.incomeMoney_month}\\n            incomeInfluence_month={councilEffects.incomeInfluence_month}\\n            incomeOps_month={councilEffects.incomeOps_month}\\n            incomeMissionControl={councilEffects.incomeMissionControl}\\n            incomeResearch_month={councilEffects.incomeResearch_month}\\n            projectCapacityGranted={councilEffects.projectCapacityGranted}\\n          />\\n          <ShowEffects\\n            economyBonus={councilEffects.economyBonus}\\n            welfareBonus={councilEffects.welfareBonus}\\n            environmentBonus={councilEffects.environmentBonus}\\n            knowledgeBonus={councilEffects.knowledgeBonus\\n            }\\n            governmentBonus={councilEffects.governmentBonus}\\n            unityBonus={councilEffects.unityBonus}\\n            militaryBonus={councilEffects.militaryBonus}\\n            oppressionBonus={councilEffects.oppressionBonus}\\n            spoilsBonus={councilEffects.spoilsBonus}\\n            spaceDevBonus={councilEffects.spaceDevBonus}\\n            spaceflightBonus={councilEffects.spaceflightBonus}\\n            MCBonus={councilEffects.MCBonus}\\n            miningBonus={councilEffects.miningBonus}\\n          />\\n          <ShowEffects\\n            councilorTechBonus={councilEffects.councilorTechBonus}\\n            techBonuses={councilEffects.techBonuses}\\n          />\\n        </div>\\n        <Table>\\n          <CouncilorTableHeader hasOrgs />\\n          <TableBody>\\n            {scoredModifiedCouncilors.map((councilor) => (\\n              <CouncilorTableRow\\n                key={councilor.id}\\n                councilor={councilor}\\n                stats={councilor.effectsWithOrgsAndAugments}\\n                label={councilor.displayName!}\\n                hasOrgs\\n                highlightMissionClassName={currentHighlightMissionClassName}\\n              />\\n            ))}\\n          </TableBody>\\n        </Table>\\n        <h3 className=\\\"mt-1\\\">Available Organizations:</h3>\\n        <Table>\\n          <OrgTableHeader />\\n          <TableBody>\\n            {scoredOrgs.map((org) => (\\n              <OrgTableRow\\n                key={org.id}\\n                org={org}\\n                playerNationIds={playerNationIds}\\n                playerTraits={playerTraits}\\n                highlightMissionClassName={availableHighlightMissionClassName}\\n              />\\n            ))}\\n          </TableBody>\\n        </Table>\\n      </div>\\n    );\\n  }\\n\\n  if (section === \\\"new-councilors\\\") {\\n    return (\\n      <div className=\\\"space-y-2\\\">\\n        <h3 className=\\\"mt-1\\\">Available Councilors:</h3>\\n        <Table>\\n          <CouncilorTableHeader />\\n          <TableBody>\\n            {scoredAvailableCouncilors.map((councilor) => (\\n              <CouncilorTableRow\\n                key={councilor.id}\\n                councilor={councilor}\\n                stats={councilor.effectsBaseAndUnaugmentedTraits}\\n                label={councilor.displayName!}\\n                highlightMissionClassName={availableHighlightMissionClassName}\\n              />\\n            ))}\\n          </TableBody>\\n        </Table>\\n\\n        <h3 className=\\\"mt-1\\\">Unmodified Active Councilors:</h3>\\n        <Table>\\n          <CouncilorTableHeader />\\n          <TableBody>\\n            {scoredBaseCouncilors.map((councilor) => (\\n              <CouncilorTableRow\\n                key={`${councilor.id}-base`}\\n                councilor={councilor}\\n                stats={councilor.effectsBaseAndUnaugmentedTraits}\\n                label={`${councilor.displayName}`}\\n                highlightMissionClassName={currentHighlightMissionClassName}\\n              />\\n            ))}\\n          </TableBody>\\n        </Table>\\n      </div>\\n    );\\n  }\\n\\n  if (section === \\\"current-orgs\\\") {\\n    return (\\n      <div className=\\\"space-y-2\\\">\\n        <Table>\\n          <OrgTableHeader costHeader=\\\"Councilor\\\" />\\n          <TableBody>\\n            {scoredOwnedOrgs.toReversed().map((org) => (\\n              <OrgTableRow\\n                key={org.id}\\n                org={org}\\n                playerNationIds={playerNationIds}\\n                playerTraits={playerTraits}\\n                highlightMissionClassName={availableHighlightMissionClassName}\\n              />\\n            ))}\\n          </TableBody>\\n        </Table>\\n      </div>\\n    );\\n  }\\n\\n  if (section === \\\"takeover\\\") {\\n    return (\\n      <div className=\\\"space-y-2\\\">\\n        <SmartTabs\\n          storageKey=\\\"councilorsTakeoverTabs\\\"\\n          defaultValue={`faction-${Array.from(stealableOrgsByFaction.keys())[0]}`}\\n        >\\n          <TabsList>\\n            {Array.from(stealableOrgsByFaction.entries()).map(([factionId, orgs]) => (\\n              <TabsTrigger key={factionId} value={`faction-${factionId}`}>\\n                {orgs[0].faction?.displayName || \\\"Unknown Faction\\\"} ({orgs.length})\\n              </TabsTrigger>\\n            ))}\\n          </TabsList>\\n          {Array.from(stealableOrgsByFaction.entries()).map(([factionId, orgs]) => (\\n            <TabsContent key={factionId} value={`faction-${factionId}`}>\\n              <Table>\\n                <OrgTableHeader costHeader=\\\"Takeover\\\" />\\n                <TableBody>\\n                  {orgs.map((org) => (\\n                    <OrgTableRow\\n                      key={org.id}\\n                      org={org}\\n                      playerNationIds={playerNationIds}\\n                      playerTraits={playerTraits}\\n                      highlightMissionClassName={availableHighlightMissionClassName}\\n                      isTakeover\\n                    />\\n                  ))}\\n                </TableBody>\\n              </Table>\\n            </TabsContent>\\n          ))}\\n        </SmartTabs>\\n      </div>\\n    );\\n  }\\n\\n  if (section === \\\"missions\\\") {\\n    return (\\n      <div className=\\\"space-y-2\\\">\\n        <SmartTabs storageKey=\\\"councilorsMissionsTabs\\\" defaultValue={`faction-${factions[0].id}`}>\\n          <TabsList>\\n            {factions.map((faction) => (\\n              <TabsTrigger key={faction.id} value={`faction-${faction.id}`}>\\n                {faction.displayName || \\\"Unknown Faction\\\"} ({sourcesByFactionByMission.get(faction.id)?.size || 0})\\n                {importantMissions\\n                  .filter(\\n                    (m) =>\\n                      sourcesByFactionByMission\\n                        .get(faction.id)\\n                        ?.get(m)\\n                        ?.filter((i) => i.type === \\\"councilor\\\")?.length ?? 0 > 0\\n                  )\\n                  .map((m) => {\\n                    const MissionIcon = MissionIcons[m] || UnknownIcon;\\n                    return (\\n                      <span key={m} className=\\\"inline-block -mt-2\\\">\\n                        <MissionIcon className=\\\"h-4 w-4\\\" />\\n                      </span >\\n                    );\\n                  })}\\n              </TabsTrigger>\\n            ))}\\n          </TabsList>\\n          {factions.map((faction) => (\\n            <TabsContent key={faction.id} value={`faction-${faction.id}`}>\\n              <SmartAccordion type=\\\"single\\\" collapsible storageKey={`councilorsMissions-${faction.id}`}>\\n                {Array.from(\\n                  new Set([\\n                    ...importantMissions,\\n                    ...Array.from(sourcesByFactionByMission.get(faction.id)?.keys() || []),\\n                  ]),\\n                )\\n                  .map((missionName) => {\\n                    const sources = sourcesByFactionByMission.get(faction.id)?.get(missionName) || [];\\n                    const MissionIcon = MissionIcons[missionName] || UnknownIcon;\\n                    return (\\n                      <AccordionItem key={missionName} value={missionName}>\\n                        <AccordionTrigger>\\n                          <span\\n                            >\\n                            <MissionIcon /> {missionName} &ndash;{\\\" \\\"}\\n                            {sources.filter((i) => i.type === \\\"councilor\\\").length} Councilors &lt;-{\\\" \\\"}\\n                            {sources.filter((i) => i.type === \\\"org\\\").length} Orgs\\n                          </span >\\n                        </AccordionTrigger>\\n                        <AccordionContent>\\n                          <Table>\\n                            <TableHeader>\\n                              <TableRow>\\n                                <TableHead>Fleet Name</TableHead>\\n                                <TableHead>Planet</TableHead>\\n                                <TableHead>Target Orbit</TableHead>\\n                                <TableHead>Arrival Date</TableHead>\\n                                <TableHead className=\\\"text-right\\\">Days to Arrival</TableHead>\\n                                <TableHead className=\\\"text-right\\\">MC Used</TableHead>\\n                                <TableHead className=\\\"text-right\\\">Marine CP</TableHead>\\n                                <TableHead className=\\\"text-right\\\">Total Mass</TableHead>\\n                                <TableHead className=\\\"text-right\\\">Max Ship Mass</TableHead>\\n                                <TableHead>Ships Hulls</TableHead>\\n                                <TableHead>Ships Roles</TableHead>\\n                                <TableHead>Operation</TableHead>\\n                                <TableHead>Operation Complete</TableHead>\\n                              </TableRow>\\n                            </TableHeader>\\n                            <TableBody>\\n                              {sources?.map((src) => (\\n                                src.type === \\\"org\\\" ? (\\n                                  <OrgTableRow\\n                                    key={`councilor-${src.org.id}-mission-${missionName}`}\\n                                    org={src.org}\\n                                    playerNationIds={playerNationIds}\\n                                    playerTraits={playerTraits}\\n                                  />\\n                                ) : (\\n                                  <CouncilorTableRow\\n                                    key={`org-${src.councilor.id}-mission-${missionName}`}\\n                                    councilor={src.councilor}\\n                                    stats={src.councilor.effectsWithOrgsAndAugments}\\n                                    label={src.councilor.displayName!}\\n                                  />\\n                                )\\n                              ))}\\n                            </TableBody>\\n                          </Table>\\n                        </AccordionContent>\\n                      </AccordionItem>\\n                    );\\n                  })}\\n              </SmartAccordion>\\n            </TabsContent>\\n          ))}\\n        </SmartTabs>\\n      </div>\\n    );\\n  }\\n\\n  if (section === \\\"other-councilors\\\") {\\n    return (\\n      <div className=\\\"space-y-2\\\">\\n        <OtherCouncilorsByFaction {...{ analysis, weights }} />\\n      </div>\\n    );\\n  }\\n\\n  return null;\\n}\\n\\nfunction OtherCouncilorsByFaction({ analysis, weights }: { analysis: Analysis; weights: ScoringWeights }) {\\n  const { playerVisibleCouncilors, factionsById } = analysis;\\n\\n  const scoredBaseCouncilors = scoreAndSort(\\n    playerVisibleCouncilors,\\n    weights,\\n    new Map<MissionDataName, number>(),\\n    getBaseCouncilorScore\\n  );\\n\\n  const councilorsByFactionId = scoredBaseCouncilors.reduce((acc, councilor) => {\\n    const factionId = councilor.factionId || 0;\\n    if (!factionId) return acc;\\n    if (!acc.has(factionId)) {\\n      acc.set(factionId, []);\\n    }\\n    acc.get(factionId)!.push(councilor);\\n    return acc;\\n  }, new Map<number, Analysis[\\\"playerCouncilors\\\"][number][]>());\\n\\n  const factions = Array.from(councilorsByFactionId.keys())\\n    .map((i) => factionsById.get(i!)!)\\n    .filter((i) => i.id !== analysis.alienFaction.id);\\n\\n  return (\\n    <Tabs defaultValue={`faction-${factions[0].id}`}>\\n      <TabsList>\\n        {factions\\n          .filter((i) => i.id !== analysis.alienFaction.id)\\n          .map((faction) => (\\n            <TabsTrigger key={faction.id} value={`faction-${faction.id}`}>\\n              {faction.displayName || \\\"Unknown Faction\\\"} ({councilorsByFactionId.get(faction.id)?.length || 0})\\n            </TabsTrigger>\\n          ))}\\n      </TabsList>\\n      {factions.map((faction) => (\\n        <TabsContent key={faction.id} value={`faction-${faction.id}`}>\\n          <Table>\\n            <TableHeader>\\n              <TableRow>\\n                <TableHead>Name</TableHead>\\n                <TableHead>Modified Stats</TableHead>\\n                <TableHead>Org Tiers</TableHead>\\n                <TableHead>Monthly Effects</TableHead>\\n                <TableHead>Priorities</TableHead>\\n                <TableHead>Science</TableHead>\\n                <TableHead>Missions</TableHead>\\n                <TableHead>Score</TableHead>\\n                <TableHead>NM Score</TableHead>\\n                <TableHead>CP Cap</TableHead>\\n              </TableRow>\\n            </TableHeader>\\n            <TableBody>\\n              {councilorsByFactionId.get(faction.id)?.map((councilor) => (\\n                <CouncilorTableRow\\n                  key={councilor.id}\\n                  councilor={councilor}\\n                  stats={councilor.effectsBaseAndUnaugmentedTraits}\\n                  label={councilor.displayName!}\\n                />\\n              ))}\\n            </TableBody>\\n          </Table>\\n        </TabsContent>\\n      ))}\\n    </Tabs>\\n  );\\n}\\n\\nfunction scoreAndSort<T>(\\n  items: T[],\\n  weights: ScoringWeights,\\n  haveMissions: Map<MissionDataName, number>,\\n  scoreFn: (item: T, weights: ScoringWeights, haveMissions: Map<MissionDataName, number>) => ScoreResult,\\n  scoreSort: \\\"value\\\" | \\\"noMissionScore\\\" = \\\"value\\\"\\n) {\\n  const scoredItems = items.map((item) => {\\n    const scoreResult = scoreFn(item, weights, haveMissions);\\n    return { ...item, score: scoreResult };\\n  });\\n  scoredItems.sort((a, b) => b.score[scoreSort] - a.score[scoreSort]);\\n  return scoredItems;\\n}\\n\\nfunction getBaseCouncilorScore(\\n  councilor: Analysis[\\\"playerCouncilors\\\"][number],\\n  weights: ScoringWeights,\\n  haveMissions: Map<MissionDataName, number>\\n): ScoreResult {\\n  return getScore(councilor.effectsBaseAndUnaugmentedTraits, weights, haveMissions, true);\\n}\\n\\nfunction getModifiedCouncilorScore(\\n  councilor: Analysis[\\\"playerCouncilors\\\"][number],\\n  weights: ScoringWeights,\\n  haveMissions: Map<MissionDataName, number>\\n): ScoreResult {\\n  return getScore(councilor.effectsWithOrgsAndAugments, weights, haveMissions, true);\\n}\\n\\nconst orgTransferFactor = 0.2;\\nfunction getOrganizationScore(\\n  org: Analysis[\\\"playerAvailableOrgs\\\"][number] & { type: string },\\n  weights: ScoringWeights,\\n  haveMissions: Map<MissionDataName, number>\\n): ScoreResult {\\n  return getScore(\\n    {\\n      ...org,\\n      techBonuses: org.template?.techBonuses,\\n      missionsGrantedNames: org.template?.missionsGrantedNames || [],\\n      ...(org.type === \\\"available\\\"\\n        ? {}\\n        : {\\n            // already-purchased orgs seem to cost ~30% to transfer\\n            costMoney: (org.costMoney || 0) * orgTransferFactor,\\n            costInfluence: (org.costInfluence || 0) * orgTransferFactor,\\n            costOps: (org.costOps || 0) * orgTransferFactor,\\n            costBoost: (org.costBoost || 0) * orgTransferFactor,\\n          }),\\n    },\\n    weights,\\n    haveMissions\\n  );\\n}\\n\\ninterface ScoreResult {\\n  value: number;\\n  noMissionScore: number;\\n  details: string;\\n}\\n\\nfunction getScore(\\n  org: ShowEffectsProps,\\n  weights: ScoringWeights,\\n  haveMissions: Map<MissionDataName, number>,\\n  ignoreTier: boolean = false\\n): ScoreResult {\\n  let totalScore = 0;\\n  const details: string[] = [];\\n\\n  // Helper to add score for a numeric attribute\\n  const addScore = (name: string, value: number | undefined, weight: number | undefined, noNegative?: boolean) => {\\n    let actualValue = value || 0;\\n    if (noNegative) {\\n      actualValue = Math.max(0, actualValue);\\n    }\\n    const actualWeight = weight ?? 0;\\n\\n    // Skip if value or weight is 0/undefined/null\\n    if (!actualValue || !actualWeight) return;\\n\\n    const contribution = actualValue * actualWeight;\\n    totalScore += contribution;\\n    details.push(\\n      `${name}: ${parseFloat(actualValue.toFixed(2))} × ${parseFloat(actualWeight.toFixed(3))} = ${contribution.toFixed(\\n        3\\n      )}`\\n    );\\n  };\\n\\n  // Councilor attributes\\n  addScore(\\\"persuasion\\\", org.persuasion, weights.persuasion, true);\\n  addScore(\\\"command\\\", org.command, weights.command, true);\\n  addScore(\\\"investigation\\\", org.investigation, weights.investigation, true);\\n  addScore(\\\"espionage\\\", org.espionage, weights.espionage, true);\\n  addScore(\\\"administration\\\", org.administration, weights.administration, true);\\n  addScore(\\\"science\\\", org.science, weights.science, true);\\n  addScore(\\\"security\\\", org.security, weights.security, true);\\n  addScore(\\\"Persuasion\\\", org.Persuasion, weights.persuasion, true);\\n  addScore(\\\"Command\\\", org.Command, weights.command, true);\\n  addScore(\\\"Investigation\\\", org.Investigation, weights.investigation, true);\\n  addScore(\\\"Espionage\\\", org.Espionage, weights.espionage, true);\\n  addScore(\\\"Administration\\\", org.Administration, weights.administration, true);\\n  addScore(\\\"Science\\\", org.Science, weights.science, true);\\n  addScore(\\\"Security\\\", org.Security, weights.security, true);\\n  addScore(\\\"xpModifier\\\", org.xpModifier, weights.xpModifier);\\n  addScore(\\\"xp\\\", org.xp, weights.xp);\\n\\n  // Monthly income/costs\\n  addScore(\\\"incomeBoost_month\\\", org.incomeBoost_month, weights.incomeBoost_month);\\n  addScore(\\\"incomeMoney_month\\\", org.incomeMoney_month, weights.incomeMoney_month);\\n  addScore(\\\"incomeInfluence_month\\\", org.incomeInfluence_month, weights.incomeInfluence_month);\\n  addScore(\\\"incomeOps_month\\\", org.incomeOps_month, weights.incomeOps_month);\\n  addScore(\\\"incomeMissionControl\\\", org.incomeMissionControl, weights.incomeMissionControl);\\n  addScore(\\\"incomeResearch_month\\\", org.incomeResearch_month, weights.incomeResearch_month);\\n  addScore(\\\"projectCapacityGranted\\\", org.projectCapacityGranted, weights.projectCapacityGranted);\\n\\n  // Purchase costs\\n  addScore(\\\"costMoney\\\", org.costMoney, weights.costMoney);\\n  addScore(\\\"costInfluence\\\", org.costInfluence, weights.costInfluence);\\n  addScore(\\\"costOps\\\", org.costOps, weights.costOps);\\n  addScore(\\\"costBoost\\\", org.costBoost, weights.costBoost);\\n\\n  // Priority bonuses\\n  addScore(\\\"economyBonus\\\", org.economyBonus, weights.economyBonus);\\n  addScore(\\\"welfareBonus\\\", org.welfareBonus, weights.welfareBonus);\\n  addScore(\\\"environmentBonus\\\", org.environmentBonus, weights.environmentBonus);\\n  addScore(\\\"knowledgeBonus\\\", org.knowledgeBonus, weights.knowledgeBonus);\\n  addScore(\\\"governmentBonus\\\", org.governmentBonus, weights.governmentBonus);\\n  addScore(\\\"unityBonus\\\", org.unityBonus, weights.unityBonus);\\n  addScore(\\\"militaryBonus\\\", org.militaryBonus, weights.militaryBonus);\\n  addScore(\\\"oppressionBonus\\\", org.oppressionBonus, weights.oppressionBonus);\\n  addScore(\\\"spoilsBonus\\\", org.spoilsBonus, weights.spoilsBonus);\\n  addScore(\\\"spaceDevBonus\\\", org.spaceDevBonus, weights.spaceDevBonus);\\n  addScore(\\\"spaceflightBonus\\\", org.spaceflightBonus, weights.spaceflightBonus);\\n  addScore(\\\"MCBonus\\\", org.MCBonus, weights.MCBonus);\\n  addScore(\\\"miningBonus\\\", org.miningBonus, weights.miningBonus);\\n\\n  // Tech bonuses from councilor/traits\\n  if (weights.councilorTechBonus && org?.councilorTechBonus) {\\n    for (const { category, bonus } of org.councilorTechBonus) {\\n      const weight = weights.councilorTechBonus[category];\\n      addScore(`councilorTechBonus[${category}]`, bonus, weight);\\n    }\\n  }\\n\\n  // Tech bonuses from orgs\\n  if (weights.techBonuses && org?.techBonuses) {\\n    for (const { category, bonus } of org.techBonuses) {\\n      const weight = weights.techBonuses[category];\\n      addScore(`techBonus[${category}]`, bonus, weight);\\n    }\\n  }\\n\\n  let noMissionScore = totalScore;\\n\\n  // Missions granted\\n  if (weights.missions && org?.missionsGrantedNames) {\\n    for (const missionName of org.missionsGrantedNames) {\\n      const weight = weights.missions[missionName];\\n      addScore(`mission[${missionName}]`, 1, weight);\\n\\n      // Extra weight for missing missions\\n      if (weights.extraWeightForMissingMissions && (haveMissions.get(missionName) || 0) === 0) {\\n        totalScore += weights.extraWeightForMissingMissions;\\n        details.push(\\n          `mission[${missionName}]: missing bonus × ${parseFloat(\\n            weights.extraWeightForMissingMissions.toFixed(3)\\n          )} = ${weights.extraWeightForMissingMissions.toFixed(3)}`\\n        );\\n      }\\n      if (weights.extraWeightForSingleMissions && (haveMissions.get(missionName) || 0) === 1) {\\n        totalScore += weights.extraWeightForSingleMissions;\\n        details.push(\\n          `mission[${missionName}]: single bonus × ${parseFloat(\\n            weights.extraWeightForSingleMissions.toFixed(3)\\n          )} = ${weights.extraWeightForSingleMissions.toFixed(3)}`\\n        );\\n      }\\n    }\\n  }\\n\\n  // Divide by tier to normalize for org cost/power\\n  const tier = org.tier || 1;\\n  let finalScore = totalScore;\\n\\n  if (tier > 1 && !ignoreTier) {\\n    const tierFactor = Math.pow(tier, weights.orgTierExponent);\\n    finalScore = totalScore / tierFactor;\\n    noMissionScore /= tierFactor;\\n    details.push(`Subtotal: ${totalScore.toFixed(3)}`);\\n    details.push(`Divided by ${tierFactor.toFixed(2)} for tier ${tier}: ${finalScore.toFixed(3)}`);\\n  }\\n\\n  return {\\n    value: finalScore,\\n    noMissionScore,\\n    details: details.join(\\\"\\\\n\\\"),\\n  };\\n}\\n\",\"oldString\":\"\\\"use client\\\";\\n\\nimport { useState, useEffect } from \\\"react\\\";\\nimport { combineEffects, ShowEffects, ShowEffectsProps } from \\\"@/components/showEffects\\\";\\nimport { AccordionContent, AccordionItem, AccordionTrigger } from \\\"@/components/ui/accordion\\\";\\nimport { SmartAccordion } from \\\"@/components/ui/smart-accordion\\\";\\nimport { Button } from \\\"@/components/ui/button\\\";\\nimport { Collapsible, CollapsibleContent, CollapsibleTrigger } from \\\"@/components/ui/collapsible\\\";\\nimport { Tooltip, TooltipContent, TooltipTrigger } from \\\"@/components/ui/tooltip\\\";\\nimport { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from \\\"@/components/ui/table\\\";\\nimport { Analysis } from \\\"@/lib/analysis\\\";\\nimport { MissionDataName, TraitDataName } from \\\"@/lib/template-types-generated\\\";\\nimport { MinusCircleIcon, PlusCircleIcon } from \\\"lucide-react\\\";\\nimport { defaultScoringWeights, loadWeightsFromStorage, ScoringWeights, ScoringWeightsDialog } from \\\"./scoringWeights\\\";\\nimport { Administration, MissionIcons, TraitIcons, UnknownIcon } from \\\"@/components/icons\\\";\\nimport { Tabs, TabsContent, TabsList, TabsTrigger } from \\\"@/components/ui/tabs\\\";\\nimport { SmartTabs } from \\\"@/components/ui/smart-tabs\\\";\\nimport { twMerge } from \\\"tailwind-merge\\\";\\n\\nfunction CouncilorTableHeader({ hasOrgs }: { hasOrgs?: boolean }) {\\n  return (\\n    <TableHeader>\\n      <TableRow>\\n        <TableHead>Name</TableHead>\\n        <TableHead>Modified Stats</TableHead>\\n        {hasOrgs && <TableHead>Org Tiers</TableHead>}\\n        <TableHead>Monthly Effects</TableHead>\\n        <TableHead>Priorities</TableHead>\\n        <TableHead>Science</TableHead>\\n        <TableHead>Missions</TableHead>\\n        <TableHead>Score</TableHead>\\n        <TableHead>NM Score</TableHead>\\n        <TableHead>CP Cap</TableHead>\\n      </TableRow>\\n    </TableHeader>\\n  );\\n}\\n\\nfunction OrgTableHeader({ costHeader }: { costHeader?: string }) {\\n  return (\\n    <TableHeader>\\n      <TableRow>\\n        <TableHead>Org Name</TableHead>\\n        <TableHead>Requirements</TableHead>\\n        <TableHead>Tier</TableHead>\\n        {costHeader ? <TableHead>{costHeader}</TableHead> : <TableHead>Purchase / Transfer</TableHead>}\\n        <TableHead>Monthly</TableHead>\\n        <TableHead>Effects</TableHead>\\n        <TableHead>Score</TableHead>\\n        <TableHead>NM Score</TableHead>\\n      </TableRow>\\n    </TableHeader>\\n  );\\n}\\n\\nfunction CouncilorTableRow({\\n  councilor,\\n  stats,\\n  label,\\n  hasOrgs,\\n  highlightMissionClassName,\\n}: {\\n  councilor: Analysis[\\\"playerCouncilors\\\"][number] & { score?: ScoreResult };\\n  stats: Analysis[\\\"playerCouncilors\\\"][number][\\\"effectsWithOrgsAndAugments\\\"];\\n  label: string;\\n  hasOrgs?: boolean;\\n  highlightMissionClassName?: (missionName: MissionDataName) => string | undefined;\\n}) {\\n  const admin = Math.min(25, Math.max(0, (stats.administration || 0) + (stats.Administration || 0)));\\n  const orgTiers = councilor.orgs.reduce((a, b) => a + b.tier, 0);\\n  const cpCap =\\n    Math.min(25, Math.max(0, stats.persuasion || 0) + Math.max(0, stats.Persuasion || 0)) +\\n    Math.min(25, Math.max(0, stats.command || 0) + Math.max(0, stats.Command || 0)) +\\n    Math.min(25, Math.max(0, stats.administration || 0) + Math.max(0, stats.Administration || 0));\\n  return (\\n    <TableRow key={`${councilor.id}-${label}`}>\\n      <TableCell>{label}</TableCell>\\n      <TableCell>\\n        <ShowEffects\\n          persuasion={stats.persuasion}\\n          command={stats.command}\\n          investigation={stats.investigation}\\n          espionage={stats.espionage}\\n          administration={stats.administration}\\n          science={stats.science}\\n          security={stats.security}\\n          Persuasion={stats.Persuasion}\\n          Command={stats.Command}\\n          Investigation={stats.Investigation}\\n          Espionage={stats.Espionage}\\n          Administration={stats.Administration}\\n          Science={stats.Science}\\n          Security={stats.Security}\\n          ApparentLoyalty={stats.ApparentLoyalty}\\n          Loyalty={stats.Loyalty}\\n          maxLoyalty={stats.maxLoyalty}\\n          xpModifier={stats.xpModifier}\\n          xp={stats.xp}\\n          traitTemplateNames={stats.traitTemplateNames}\\n          typeTemplateName={stats.typeTemplateName}\\n          playerIntel={stats.playerIntel}\\n          playerMaxIntel={stats.playerMaxIntel}\\n          lastRecordedLoyalty={stats.lastRecordedLoyalty}\\n          // TODO: is there a case where we should show this?\\n          // Loyalty={stats.Loyalty}\\n        />\\n      </TableCell>\\n      {hasOrgs && (\\n        <TableCell>\\n          <ShowEffects tier={stats.tier} highlightTier={orgTiers < admin} />\\n        </TableCell>\\n      )}\\n      <TableCell>\\n        <ShowEffects\\n          incomeBoost_month={stats.incomeBoost_month}\\n          incomeMoney_month={stats.incomeMoney_month}\\n          incomeInfluence_month={stats.incomeInfluence_month}\\n          incomeOps_month={stats.incomeOps_month}\\n          incomeMissionControl={stats.incomeMissionControl}\\n          incomeResearch_month={stats.incomeResearch_month}\\n          projectCapacityGranted={stats.projectCapacityGranted}\\n        />\\n      </TableCell>\\n      <TableCell>\\n        <span className=\\\"text-wrap leading-6 -my-2 inline-block\\\">\\n          <ShowEffects\\n            economyBonus={stats.economyBonus}\\n            welfareBonus={stats.welfareBonus}\\n            environmentBonus={stats.environmentBonus}\\n            knowledgeBonus={stats.knowledgeBonus}\\n            governmentBonus={stats.governmentBonus}\\n            unityBonus={stats.unityBonus}\\n            militaryBonus={stats.militaryBonus}\\n            oppressionBonus={stats.oppressionBonus}\\n            spoilsBonus={stats.spoilsBonus}\\n            spaceDevBonus={stats.spaceDevBonus}\\n            spaceflightBonus={stats.spaceflightBonus}\\n            MCBonus={stats.MCBonus}\\n            miningBonus={stats.miningBonus}\\n          />\\n        </span >\\n      </TableCell>\\n      <TableCell>\\n        <span className=\\\"text-wrap leading-6 -my-2 inline-block\\\">\\n          <ShowEffects\\n            councilorTechBonus={stats.councilorTechBonus}\\n            techBonuses={stats.techBonuses}\\n          />\\n        </span >\\n      </TableCell>\\n      <TableCell>\\n        <span className=\\\"text-wrap leading-6 -my-2 inline-block\\\">\\n          <ShowEffects\\n            missionsGrantedNames={stats.missionsGrantedNames}\\n            highlightMissionClassName={highlightMissionClassName}\\n          />\\n        </span >\\n      </TableCell>\\n      {councilor.score === undefined ? null : (\\n        <>\\n          <TableCell>\\n            <Tooltip>\\n              <TooltipTrigger>{councilor.score.value?.toFixed(2)}</TooltipTrigger>\\n              <TooltipContent align=\\\"end\\\" className=\\\"max-w-auto\\\">\\n                <pre className=\\\"p-2\\\">{councilor.score.details}</pre>\\n              </TooltipContent>\\n            </Tooltip>\\n          </TableCell>\\n          <TableCell>{councilor.score.noMissionScore?.toFixed(2)}</TableCell>\\n          <TableCell>{cpCap?.toFixed(0)}</TableCell>\\n        </>\\n      )}\\n    </TableRow>\\n  );\\n}\\n\\nfunction OrgTableRow({\\n  org,\\n  playerNationIds,\\n  playerTraits,\\n  highlightMissionClassName,\\n  isTakeover,\\n}: {\\n  org: Analysis[\\\"playerAvailableOrgs\\\"][number] & {\\n    type?: string;\\n    score?: ScoreResult;\\n    councilor?: string;\\n    councilorId?: number;\\n  };\\n  playerNationIds: Set<number>;\\n  playerTraits: Set<string>;\\n  highlightMissionClassName?: (missionName: MissionDataName) => string | undefined;\\n  isTakeover?: boolean;\\n}) {\\n  const missingRequiredTraits = org.template?.requiredOwnerTraits?.filter((t) => !playerTraits.has(t)) || [];\\n  function traitIcon(trait: TraitDataName, Fallback: typeof PlusCircleIcon) {\\n    return TraitIcons[trait] || Fallback;\\n  }\\n  return (\\n    <TableRow\\n      key={org.id}\\n      className={twMerge(org.isAdminOrg ? \\\"bg-green-100\\\" : \\\"\\\", org.type === \\\"unassigned\\\" ? \\\"bg-yellow-100\\\" : \\\"\\\")}\\n    >\\n      <TableCell>{org.displayName}</TableCell>\\n      <TableCell>\\n        {org.template?.requiresNationality && (\\n          <span className=\\\"mr-1\\\" title={`Required Nation: ${org.homeNationName || \\\"\\\"}`}>\\n            {playerNationIds.has(org.homeNationId || -1) ? (\\n              <PlusCircleIcon className=\\\"inline h-4 w-4 stroke-green-700 -mt-1 bg-transparent\\\" />\\n            ) : (\\n              <MinusCircleIcon className=\\\"inline h-4 w-4 stroke-destructive -mt-1\\\" />\\n            )}\\n          </span >\\n        )}\\n        {org.template?.requiredOwnerTraits && (\\n          <span className=\\\"mr-1\\\" title={\\\"Required Traits: \\\" + org.template.requiredOwnerTraits.join(\\\", \\\")}>\\n            {missingRequiredTraits.length === 0\\n              ? org.template.requiredOwnerTraits.map((trait, ix) => {\\n                  const Icon = traitIcon(trait, PlusCircleIcon);\\n                  return <Icon key={ix} className=\\\"inline h-4 w-4 stroke-green-700 -mt-1\\\" />;\\n                })\\n              : missingRequiredTraits.map((trait, ix) => {\\n                  const Icon = traitIcon(trait, MinusCircleIcon);\\n                  return <Icon key={ix} className=\\\"inline h-4 w-4 stroke-destructive -mt-1\\\" />;\\n                })}\\n          </span >\\n        )}\\n        {org.template?.prohibitedOwnerTraits && (\\n          <span className=\\\"mr-1\\\" title={\\\"Prohibited Traits: \\\" + org.template.prohibitedOwnerTraits.join(\\\", \\\")}>\\n            {org.template.prohibitedOwnerTraits.map((trait, ix) => {\\n              const Icon = traitIcon(trait, MinusCircleIcon);\\n              return <Icon key={ix} className=\\\"inline h-4 w-4 stroke-blue-700 -mt-1\\\" />;\\n            })}\\n          </span >\\n        )}\\n      </TableCell>\\n      <TableCell>\\n        <ShowEffects tier={org.tier} />\\n      </TableCell>\\n      <TableCell>\\n        {org.type === \\\"unassigned\\\" && \\\"T \\\"}\\n        {org.type === \\\"available\\\" || org.type === \\\"unassigned\\\" ? (\\n          <ShowEffects\\n            costMoney={(org.costMoney || 0) * (org.type === \\\"available\\\" ? 1 : orgTransferFactor)}\\n            costInfluence={(org.costInfluence || 0) * (org.type === \\\"available\\\" ? 1 : orgTransferFactor)}\\n            costOps={(org.costOps || 0) * (org.type === \\\"available\\\" ? 1 : orgTransferFactor)}\\n            costBoost={(org.costBoost || 0) * (org.type === \\\"available\\\" ? 1 : orgTransferFactor)}\\n          />\\n        ) : org.type == \\\"stealable\\\" && isTakeover ? (\\n          (() => {\\n            const target = org as any as Analysis[\\\"playerStealableOrgs\\\"][number];\\n            return (\\n              <>\\n                {target.councilor ?? \\\"Unassigned\\\"} from {target.faction?.displayName}, Admin: {target.admin} +\\n                takeoverDefense: {target.takeoverDefense}\\n              </>\\n            );\\n          })()\\n        ) : org.type === \\\"used\\\" ? (\\n          <>{org.councilor ?? \\\"Unassigned\\\"}</>\\n        ) : null}\\n      </TableCell>\\n      <TableCell>\\n        <ShowEffects\\n          incomeBoost_month={org.incomeBoost_month}\\n          incomeMoney_month={org.incomeMoney_month}\\n          incomeInfluence_month={org.incomeInfluence_month}\\n          incomeOps_month={org.incomeOps_month}\\n          incomeMissionControl={org.incomeMissionControl}\\n          incomeResearch_month={org.incomeResearch_month}\\n          projectCapacityGranted={org.projectCapacityGranted}\\n        />\\n      </TableCell>\\n      <TableCell>\\n        <ShowEffects\\n          persuasion={org.persuasion}\\n          command={org.command}\\n          investigation={org.investigation}\\n          espionage={org.espionage}\\n          administration={org.administration}\\n          science={org.science}\\n          security={org.security}\\n          economyBonus={org.economyBonus}\\n          welfareBonus={org.welfareBonus}\\n          environmentBonus={org.environmentBonus}\\n          knowledgeBonus={org.knowledgeBonus}\\n          governmentBonus={org.governmentBonus}\\n          unityBonus={org.unityBonus}\\n          militaryBonus={org.militaryBonus}\\n          oppressionBonus={org.oppressionBonus}\\n          spoilsBonus={org.spoilsBonus}\\n          spaceDevBonus={org.spaceDevBonus}\\n          spaceflightBonus={org.spaceflightBonus}\\n          MCBonus={org.MCBonus}\\n          miningBonus={org.miningBonus}\\n          techBonuses={org.template?.techBonuses}\\n          missionsGrantedNames={org.template?.missionsGrantedNames || []}\\n          highlightMissionClassName={highlightMissionClassName}\\n        />\\n      </TableCell>\\n      {org.score === undefined ? null : (\\n        <>\\n          <TableCell>\\n            <Tooltip>\\n              <TooltipTrigger>{org.score.value?.toFixed(2)}</TooltipTrigger>\\n              <TooltipContent align=\\\"end\\\" className=\\\"max-w-auto\\\">\\n                <pre className=\\\"p-2\\\">{org.score.details}</pre>\\n              </TooltipContent>\\n            </Tooltip>\\n          </TableCell>\\n          <TableCell>{org.score.noMissionScore?.toFixed(2)}</TableCell>\\n        </>\\n      )}\\n    </TableRow>\\n  );\\n}\\n\\nexport function getCouncilorsUi(analysis: Analysis) {\\n  const { playerMissionCounts } = analysis;\\n  const [weights, setWeights] = useState<ScoringWeights>(defaultScoringWeights);\\n\\n  useEffect(() => {\\n    setWeights(loadWeightsFromStorage());\\n  }, []);\\n\\n  const scoredModifiedCouncilors = scoreAndSort(\\n    analysis.playerCouncilors,\\n    weights,\\n    playerMissionCounts,\\n    getModifiedCouncilorScore\\n  );\\n  const scoredAvailableCouncilors = scoreAndSort(\\n    analysis.playerAvailableCouncilors,\\n    weights,\\n    playerMissionCounts,\\n    getBaseCouncilorScore\\n  );\\n  const scoredBaseCouncilors = scoreAndSort(\\n    analysis.playerCouncilors,\\n    weights,\\n    playerMissionCounts,\\n    getBaseCouncilorScore\\n  );\\n  const scoredOrgs = scoreAndSort(\\n    analysis.playerAvailableOrgs\\n      .map((i) => ({ type: \\\"available\\\", ...i }))\\n      .concat(analysis.playerUnassignedOrgs.map((i) => ({ type: \\\"unassigned\\\", ...i }))),\\n    weights,\\n    playerMissionCounts,\\n    getOrganizationScore,\\n    \\\"noMissionScore\\\" // ignore missions when sorting orgs\\n  ).toSorted((a, b) => (a.isAdminOrg === b.isAdminOrg ? 0 : a.isAdminOrg ? -1 : 1)); // admin orgs first\\n  const usedOrgs = analysis.playerCouncilors.flatMap((councilor) =>\\n    councilor.orgs.map((o) => ({ ...o, type: \\\"used\\\", councilor: councilor.displayName, councilorId: councilor.id }))\\n  );\\n  const scoredUsedOrgs = scoreAndSort(usedOrgs, weights, playerMissionCounts, getOrganizationScore);\\n  const scoredOwnedOrgs = scoreAndSort(\\n    analysis.playerUnassignedOrgs.map((i) => ({ type: \\\"unassigned\\\", ...i })).concat(usedOrgs),\\n    weights,\\n    playerMissionCounts,\\n    getOrganizationScore\\n  );\\n\\n  const bestAvailableCouncilor = scoredAvailableCouncilors[0]?.score.value;\\n  const worstExistingCouncilor = scoredBaseCouncilors[scoredBaseCouncilors.length - 1]?.score.value;\\n  const bestAvailableOrg = scoredOrgs[0]?.score.value;\\n  const worstExistingOrg = scoredUsedOrgs[scoredUsedOrgs.length - 1]?.score.value;\\n\\n  return {\\n    key: \\\"councilors\\\",\\n    tab: (\\n      <>\\n        Councilors ({worstExistingCouncilor?.toFixed(0)} vs. {bestAvailableCouncilor?.toFixed(0)}) / Orgs (\\n        {worstExistingOrg?.toFixed(2)} vs {bestAvailableOrg?.toFixed(2)})\\n      </>\\n    ),\\n    content: (\\n      <CouncilorsComponent\\n        {...{\\n          analysis,\\n          weights,\\n          setWeights,\\n          scoredModifiedCouncilors,\\n          scoredAvailableCouncilors,\\n          scoredBaseCouncilors,\\n          scoredOrgs,\\n          scoredOwnedOrgs,\\n        }}\\n      />\\n    ),\\n  };\\n}\\n\\nfunction CouncilorsComponent({\\n  analysis,\\n  weights,\\n  setWeights,\\n  scoredModifiedCouncilors,\\n  scoredAvailableCouncilors,\\n  scoredBaseCouncilors,\\n  scoredOrgs,\\n  scoredOwnedOrgs,\\n}: {\\n  analysis: Analysis;\\n  weights: ScoringWeights;\\n  setWeights: (weights: ScoringWeights) => void;\\n  scoredModifiedCouncilors: (Analysis[\\\"playerCouncilors\\\"][number] & { score: ScoreResult })[];\\n  scoredAvailableCouncilors: (Analysis[\\\"playerAvailableCouncilors\\\"][number] & { score: ScoreResult })[];\\n  scoredBaseCouncilors: (Analysis[\\\"playerCouncilors\\\"][number] & { score: ScoreResult })[];\\n  scoredOrgs: (Analysis[\\\"playerAvailableOrgs\\\"][number] & {\\n    type: string;\\n    score: ScoreResult;\\n  })[];\\n  scoredOwnedOrgs: (Analysis[\\\"playerAvailableOrgs\\\"][number] & {\\n    type: string;\\n    score: ScoreResult;\\n    councilor?: string;\\n    councilorId?: number;\\n  })[];\\n}) {\\n  const {\\n    playerMissionCounts,\\n    playerVisibleCouncilors,\\n    playerCouncilors,\\n    playerAvailableOrgs,\\n    playerUnassignedOrgs,\\n    playerFaction,\\n    playerStealableOrgs,\\n    factionsById,\\n  } = analysis;\\n  const scoredStealableOrgs = scoreAndSort(\\n    analysis.playerStealableOrgs.map((i) => ({ type: \\\"stealable\\\", ...i })),\\n    weights,\\n    playerMissionCounts,\\n    getOrganizationScore,\\n    \\\"noMissionScore\\\"\\n  );\\n\\n  function currentHighlightMissionClassName(missionName: MissionDataName) {\\n    // if we have exactly 2, show yellow BG, if we have 1, show red, otherwise no change to bg\\n    const count = playerMissionCounts.get(missionName) || 0;\\n    if (count === 2) {\\n      return \\\"bg-yellow-300/50\\\";\\n    } else if (count === 1) {\\n      return \\\"bg-red-300/50\\\";\\n    }\\n  }\\n  function availableHighlightMissionClassName(missionName: MissionDataName) {\\n    // if we have 1, show yellow BG, if we have 0, show green, otherwise no change to bg\\n    const count = playerMissionCounts.get(missionName) || 0;\\n    if (count === 1) {\\n      return \\\"bg-yellow-300/50\\\";\\n    } else if (count === 0) {\\n      return \\\"bg-green-300/50\\\";\\n    }\\n  }\\n  const playerNationIds = new Set(analysis.playerNationIds);\\n  const playerTraits = new Set(analysis.playerCouncilors.flatMap((i) => i.traitTemplateNames));\\n  const unusedAdmin = analysis.playerCouncilors\\n    .map(\\n      (c) =>\\n        Math.min(\\n          25,\\n          Math.max(\\n            0,\\n            (c.effectsWithOrgsAndAugments.Administration || 0) + (c.effectsWithOrgsAndAugments.administration || 0)\\n          )\\n        ) - c.orgs.reduce((a, b) => a + b.tier, 0)\\n    )\\n    .reduce((a, b) => a + b, 0);\\n\\n  const stealableOrgsByFaction = scoredStealableOrgs.reduce((acc, org) => {\\n    const key = org.faction?.id || 0;\\n    if (!acc.has(key)) {\\n      acc.set(key, []);\\n    }\\n    acc.get(key)!.push(org);\\n    return acc;\\n  }, new Map<number, typeof scoredStealableOrgs>());\\n\\n  type MissionSource =\\n    | {\\n        type: \\\"councilor\\\";\\n        councilor: Analysis[\\\"playerCouncilors\\\"][number];\\n        factionId: number | undefined;\\n        missions: MissionDataName[];\\n      }\\n    | {\\n        type: \\\"org\\\";\\n        org: Analysis[\\\"playerAvailableOrgs\\\"][number];\\n        factionId: number | undefined;\\n        missions: MissionDataName[];\\n      };\\n\\n  const sourcesByFactionByMission = [...playerCouncilors, ...playerVisibleCouncilors]\\n    .map(\\n      (i) =>\\n        ({\\n          type: \\\"councilor\\\",\\n          councilor: i,\\n          factionId: i.factionId,\\n          missions: i.effectsWithOrgsAndAugments.missionsGrantedNames || [],\\n        } as MissionSource)\\n    )\\n    .concat(\\n      [...playerAvailableOrgs, ...playerUnassignedOrgs].map((i) => ({\\n        type: \\\"org\\\",\\n        org: i,\\n        factionId: playerFaction?.id,\\n        missions: i.template?.missionsGrantedNames || [],\\n      }))\\n    )\\n    .concat(\\n      playerStealableOrgs.map((i) => ({\\n        type: \\\"org\\\",\\n        org: i,\\n        factionId: i.faction?.id,\\n        missions: i.template?.missionsGrantedNames || [],\\n      }))\\n    )\\n    .reduce((acc, o) => {\\n      const key = o.factionId || 0;\\n      if (!acc.has(key)) {\\n        acc.set(key, new Map<string, MissionSource[]>());\\n      }\\n      const effectsMap = acc.get(key)!;\\n      o.missions.forEach((m) => {\\n        if (!effectsMap.has(m)) {\\n          effectsMap.set(m, []);\\n        }\\n        effectsMap.get(m)!.push(o);\\n      });\\n      return acc;\\n    }, new Map<number, Map<string, MissionSource[]>>());\\n  const factions = Array.from(sourcesByFactionByMission.keys())\\n    .map((factionId) => factionsById.get(factionId)!)\\n    .filter((f) => f)\\n    .toSorted((a, b) => {\\n      if (a.id === playerFaction.id) return -1;\\n      if (b.id === playerFaction.id) return 1;\\n      return (a.displayName || \\\"\\\").localeCompare(b.displayName || \\\"\\\");\\n    });\\n\\n  const importantMissions = [\\\"Assassinate\\\"];\\n\\n  const councilEffects = scoredModifiedCouncilors.reduce((acc, councilor) => {\\n    return combineEffects(acc, councilor.effectsWithOrgsAndAugments);\\n  }, {} as ShowEffectsProps);\\n\\n  // TODO: would be cool to click an effect icon and sort everything by that (ie. click persuasion icon to see who/org gives most persuasion)\\n  return (\\n    <div className=\\\"space-y-2\\\">\\n      <SmartAccordion\\n        type=\\\"single\\\"\\n        collapsible\\n        storageKey=\\\"councilorsSections\\\"\\n        defaultValue=\\\"existing\\\"\\n      >\\n        <AccordionItem value=\\\"existing\\\">\\n          <AccordionTrigger>\\n            <span\\n              >\\n            Manage Existing Council ({unusedAdmin.toFixed(0)} <Administration />)\\n            </span >\\n          </AccordionTrigger>\\n          <AccordionContent>\\n            <div className=\\\"py-1\\\">\\n              <ShowEffects\\n                incomeBoost_month={councilEffects.incomeBoost_month}\\n                incomeMoney_month={councilEffects.incomeMoney_month}\\n                incomeInfluence_month={councilEffects.incomeInfluence_month}\\n                incomeOps_month={councilEffects.incomeOps_month}\\n                incomeMissionControl={councilEffects.incomeMissionControl}\\n                incomeResearch_month={councilEffects.incomeResearch_month}\\n                projectCapacityGranted={councilEffects.projectCapacityGranted}\\n              />\\n              <ShowEffects\\n                economyBonus={councilEffects.economyBonus}\\n                welfareBonus={councilEffects.welfareBonus\\n                }\\n                environmentBonus={councilEffects.environmentBonus}\\n                knowledgeBonus={councilEffects.knowledgeBonus}\\n                governmentBonus={councilEffects.governmentBonus}\\n                unityBonus={councilEffects.unityBonus}\\n                militaryBonus={councilEffects.militaryBonus}\\n                oppressionBonus={councilEffects.oppressionBonus}\\n                spoilsBonus={councilEffects.spoilsBonus}\\n                spaceDevBonus={councilEffects.spaceDevBonus}\\n                spaceflightBonus={councilEffects.spaceflightBonus}\\n                MCBonus={councilEffects.MCBonus}\\n                miningBonus={councilEffects.miningBonus}\\n              />\\n              <ShowEffects\\n                councilorTechBonus={councilEffects.councilorTechBonus}\\n                techBonuses={councilEffects.techBonuses}\\n              />\\n            </div >\\n            <Table>\\n              <CouncilorTableHeader hasOrgs />\\n              <TableBody>\\n                {scoredModifiedCouncilors.map((councilor) => (\\n                  <CouncilorTableRow\\n                    key={councilor.id}\\n                    councilor={councilor}\\n                    stats={councilor.effectsWithOrgsAndAugments}\\n                    label={councilor.displayName!}\\n                    hasOrgs\\n                    highlightMissionClassName={currentHighlightMissionClassName}\\n                  />\\n                ))}\\n              </TableBody>\\n            </Table>\\n            <h3 className=\\\"mt-1\\\">Available Organizations:</h3>\\n            <Table>\\n              <OrgTableHeader />\\n              <TableBody>\\n                {scoredOrgs.map((org) => (\\n                  <OrgTableRow\\n                    key={org.id}\\n                    org={org}\\n                    playerNationIds={playerNationIds}\\n                    playerTraits={playerTraits}\\n                    highlightMissionClassName={availableHighlightMissionClassName}\\n                  />\\n                ))}\\n              </TableBody>\\n            </Table>\\n          </AccordionContent>\\n        </AccordionItem>\\n        <AccordionItem value=\\\"new-councilors\\\">\\n          <AccordionTrigger>Find New Councilors</AccordionTrigger>\\n          <AccordionContent>\\n            <h3 className=\\\"mt-1\\\">Available Councilors:</h3>\\n            <Table>\\n              <CouncilorTableHeader />\\n              <TableBody>\\n                {scoredAvailableCouncilors.map((councilor) => (\\n                  <CouncilorTableRow\\n                    key={councilor.id}\\n                    councilor={councilor}\\n                    stats={councilor.effectsBaseAndUnaugmentedTraits}\\n                    label={councilor.displayName!}\\n                    highlightMissionClassName={availableHighlightMissionClassName}\\n                  />\\n                ))}\\n              </TableBody>\\n            </Table>\\n\\n            <h3 className=\\\"mt-1\\\">Unmodified Active Councilors:</h3>\\n            <Table>\\n              <CouncilorTableHeader />\\n              <TableBody>\\n                {scoredBaseCouncilors.map((councilor) => (\\n                  <CouncilorTableRow\\n                    key={`${councilor.id}-base`}\\n                    councilor={councilor}\\n                    stats={councilor.effectsBaseAndUnaugmentedTraits}\\n                    label={`${councilor.displayName}`}\\n                    highlightMissionClassName={currentHighlightMissionClassName}\\n                  />\\n                ))}\\n              </TableBody>\\n            </Table>\\n          </AccordionContent>\\n        </AccordionItem>\\n        <AccordionItem value=\\\"current-orgs\\\">\\n          <AccordionTrigger>Current Organizations</AccordionTrigger>\\n          <AccordionContent>\\n            <Table>\\n              <OrgTableHeader costHeader=\\\"Councilor\\\" />\\n              <TableBody>\\n                {scoredOwnedOrgs.toReversed().map((org) => (\\n                  <OrgTableRow\\n                    key={org.id}\\n                    org={org}\\n                    playerNationIds={playerNationIds}\\n                    playerTraits={playerTraits}\\n                    highlightMissionClassName={availableHighlightMissionClassName}\\n                  />\\n                ))}\\n              </TableBody>\\n            </Table>\\n          </AccordionContent>\\n        </AccordionItem>\\n        <AccordionItem value=\\\"takeover\\\">\\n          <AccordionTrigger>Hostile Takeover</AccordionTrigger>\\n          <AccordionContent>\\n            <SmartTabs\\n              storageKey=\\\"councilorsTakeoverTabs\\\"\\n              defaultValue={`faction-${Array.from(stealableOrgsByFaction.keys())[0]}`}\\n            >\\n              <TabsList>\\n                {Array.from(stealableOrgsByFaction.entries()).map(([factionId, orgs]) => (\\n                  <TabsTrigger key={factionId} value={`faction-${factionId}`}>\\n                    {orgs[0].faction?.displayName || \\\"Unknown Faction\\\"} ({orgs.length})\\n                  </TabsTrigger>\\n                ))}\\n              </TabsList>\\n              {Array.from(stealableOrgsByFaction.entries()).map(([factionId, orgs]) => (\\n                <TabsContent key={factionId} value={`faction-${factionId}`}>\\n                  <Table>\\n                    <OrgTableHeader costHeader=\\\"Takeover\\\" />\\n                    <TableBody>\\n                      {orgs.map((org) => (\\n                        <OrgTableRow\\n                          key={org.id}\\n                          org={org}\\n                          playerNationIds={playerNationIds}\\n                          playerTraits={playerTraits}\\n                          highlightMissionClassName={availableHighlightMissionClassName}\\n                          isTakeover\\n                        />\\n                      ))}\\n                    </TableBody>\\n                  </Table>\\n                </TabsContent>\\n              ))}\\n            </SmartTabs>\\n          </AccordionContent>\\n        </AccordionItem>\\n        <AccordionItem value=\\\"missions\\\">\\n          <AccordionTrigger>Missions</AccordionTrigger>\\n          <AccordionContent>\\n            <SmartTabs storageKey=\\\"councilorsMissionsTabs\\\" defaultValue={`faction-${factions[0].id}`}>\\n              <TabsList>\\n                {factions.map((faction) => (\\n                  <TabsTrigger key={faction.id} value={`faction-${faction.id}`}>\\n                    {faction.displayName || \\\"Unknown Faction\\\"} ({sourcesByFactionByMission.get(faction.id)?.size || 0})\\n                    {importantMissions\\n                      .filter(\\n                        (m) =>\\n                          sourcesByFactionByMission\\n                            .get(faction.id)\\n                            ?.get(m)\\n                            ?.filter((i) => i.type === \\\"councilor\\\")?.length ?? 0 > 0\\n                      )\\n                      .map((m) => {\\n                        const MissionIcon = MissionIcons[m] || UnknownIcon;\\n                        return (\\n                          <span key={m} className=\\\"inline-block -mt-2\\\">\\n                            <MissionIcon className=\\\"h-4 w-4\\\" />\\n                          </span >\\n                        );\\n                      })}\\n                  </TabsTrigger>\\n                ))}\\n              </TabsList>\\n              {factions.map((faction) => (\\n                <TabsContent key={faction.id} value={`faction-${faction.id}`}>\\n                  <SmartAccordion type=\\\"single\\\" collapsible storageKey={`councilorsMissions-${faction.id}`}>\\n                    {Array.from(\\n                      new Set([\\n                        ...importantMissions,\\n                        ...Array.from(sourcesByFactionByMission.get(faction.id)?.keys() || []),\\n                      ]),\\n                    ).map((missionName) => {\\n                      const sources = sourcesByFactionByMission.get(faction.id)?.get(missionName) || [];\\n                      const MissionIcon = MissionIcons[missionName] || UnknownIcon;\\n                      return (\\n                        <AccordionItem key={missionName} value={missionName}>\\n                          <AccordionTrigger>\\n                            <span\\n                              >\\n                            <MissionIcon /> {missionName} &ndash;{\\\" \\\"}\\n                            {sources.filter((i) => i.type === \\\"councilor\\\").length} Councilors &lt;-{\\\" \\\"}\\n                            {sources.filter((i) => i.type === \\\"org\\\").length} Orgs\\n                          </span >\\n                          </AccordionTrigger>\\n                          <AccordionContent>\\n                            <Table>\\n                              <TableHeader>\\n                                <TableRow>\\n                                  <TableHead>Fleet Name</TableHead>\\n                                  <TableHead>Planet</TableHead>\\n                                  <TableHead>Target Orbit</TableHead>\\n                                  <TableHead>Arrival Date</TableHead>\\n                                  <TableHead className=\\\"text-right\\\">Days to Arrival</TableHead>\\n                                  <TableHead className=\\\"text-right\\\">MC Used</TableHead>\\n                                  <TableHead className=\\\"text-right\\\">Marine CP</TableHead>\\n                                  <TableHead className=\\\"text-right\\\">Total Mass</TableHead>\\n                                  <TableHead className=\\\"text-right\\\">Max Ship Mass</TableHead>\\n                                  <TableHead>Ships Hulls</TableHead>\\n                                  <TableHead>Ships Roles</TableHead>\\n                                  <TableHead>Operation</TableHead>\\n                                  <TableHead>Operation Complete</TableHead>\\n                                </TableRow>\\n                              </TableHeader>\\n                              <TableBody>\\n                                {sources?.map((src) => (\\n                                  src.type === \\\"org\\\" ? (\\n                                    <OrgTableRow\\n                                      key={`councilor-${src.org.id}-mission-${missionName}`}\\n                                      org={src.org}\\n                                      playerNationIds={playerNationIds}\\n                                      playerTraits={playerTraits}\\n                                    />\\n                                  ) : (\\n                                    <CouncilorTableRow\\n                                      key={`org-${src.councilor.id}-mission-${missionName}`}\\n                                      councilor={src.councilor}\\n                                      stats={src.councilor.effectsWithOrgsAndAugments}\\n                                      label={src.councilor.displayName!}\\n                                    />\\n                                  )\\n                                ))}\\n                              </TableBody>\\n                            </Table>\\n                          </AccordionContent>\\n                        </AccordionItem>\\n                      );\\n                    })}\\n                  </SmartAccordion>\\n                </TabsContent>\\n              ))}\\n            </SmartTabs>\\n          </AccordionContent>\\n        </AccordionItem>\\n        <AccordionItem value=\\\"other-councilors\\\">\\n          <AccordionTrigger>Other Councilors</AccordionTrigger>\\n          <AccordionContent>\\n            <OtherCouncilorsByFaction {...{ analysis, weights }} />\\n          </AccordionContent>\\n        </AccordionItem>\\n      </SmartAccordion>\\n\\n      <div className=\\\"my-4\\\">\\n        <ScoringWeightsDialog weights={weights} onWeightsChange={setWeights} />\\n      </div >\\n\\n      <Collapsible>\\n        <CollapsibleTrigger asChild>\\n          <Button variant=\\\"outline\\\">Debug Data</Button>\\n        </CollapsibleTrigger>\\n        <CollapsibleContent>\\n          <pre>{JSON.stringify(analysis.playerFaction, null, 2)}</pre>\\n        </CollapsibleContent>\\n      </Collapsible>\\n    </div >\\n  );\\n}\\n\\nfunction OtherCouncilorsByFaction({ analysis, weights }: { analysis: Analysis; weights: ScoringWeights }) {\\n  const { playerVisibleCouncilors, factionsById } = analysis;\\n\\n  const scoredBaseCouncilors = scoreAndSort(\\n    playerVisibleCouncilors,\\n    weights,\\n    new Map<MissionDataName, number>(),\\n    getBaseCouncilorScore\\n  );\\n\\n  const councilorsByFactionId = scoredBaseCouncilors.reduce((acc, councilor) => {\\n    const factionId = councilor.factionId || 0;\\n    if (!factionId) return acc;\\n    if (!acc.has(factionId)) {\\n      acc.set(factionId, []);\\n    }\\n    acc.get(factionId)!.push(councilor);\\n    return acc;\\n  }, new Map<number, Analysis[\\\"playerCouncilors\\\"][number][]>());\\n\\n  const factions = Array.from(councilorsByFactionId.keys())\\n    .map((i) => factionsById.get(i!)!)\\n    .filter((i) => i.id !== analysis.alienFaction.id);\\n\\n  return (\\n    <Tabs defaultValue={`faction-${factions[0].id}`}>\\n      <TabsList>\\n        {factions\\n          .filter((i) => i.id !== analysis.alienFaction.id)\\n          .map((faction) => (\\n            <TabsTrigger key={faction.id} value={`faction-${faction.id}`}>\\n              {faction.displayName || \\\"Unknown Faction\\\"} ({councilorsByFactionId.get(faction.id)?.length || 0})\\n            </TabsTrigger>\\n          ))}\\n      </TabsList>\\n      {factions.map((faction) => (\\n        <TabsContent key={faction.id} value={`faction-${faction.id}`}>\\n          <Table>\\n            <TableHeader>\\n              <TableRow>\\n                <TableHead>Name</TableHead>\\n                <TableHead>Modified Stats</TableHead>\\n                <TableHead>Org Tiers</TableHead>\\n                <TableHead>Monthly Effects</TableHead>\\n                <TableHead>Priorities</TableHead>\\n                <TableHead>Science</TableHead>\\n                <TableHead>Missions</TableHead>\\n                <TableHead>Score</TableHead>\\n                <TableHead>NM Score</TableHead>\\n                <TableHead>CP Cap</TableHead>\\n              </TableRow>\\n            </TableHeader>\\n            <TableBody>\\n              {councilorsByFactionId.get(faction.id)?.map((councilor) => (\\n                <CouncilorTableRow\\n                  key={councilor.id}\\n                  councilor={councilor}\\n                  stats={councilor.effectsBaseAndUnaugmentedTraits}\\n                  label={councilor.displayName!}\\n                />\\n              ))}\\n            </TableBody>\\n          </Table>\\n        </TabsContent>\\n      ))}\\n    </Tabs>\\n  );\\n}\\n\\nfunction scoreAndSort<T>(\\n  items: T[],\\n  weights: ScoringWeights,\\n  haveMissions: Map<MissionDataName, number>,\\n  scoreFn: (item: T, weights: ScoringWeights, haveMissions: Map<MissionDataName, number>) => ScoreResult,\\n  scoreSort: \\\"value\\\" | \\\"noMissionScore\\\" = \\\"value\\\"\\n) {\\n  const scoredItems = items.map((item) => {\\n    const scoreResult = scoreFn(item, weights, haveMissions);\\n    return { ...item, score: scoreResult };\\n  });\\n  scoredItems.sort((a, b) => b.score[scoreSort] - a.score[scoreSort]);\\n  return scoredItems;\\n}\\n\\nfunction getBaseCouncilorScore(\\n  councilor: Analysis[\\\"playerCouncilors\\\"][number],\\n  weights: ScoringWeights,\\n  haveMissions: Map<MissionDataName, number>\\n): ScoreResult {\\n  return getScore(councilor.effectsBaseAndUnaugmentedTraits, weights, haveMissions, true);\\n}\\n\\nfunction getModifiedCouncilorScore(\\n  councilor: Analysis[\\\"playerCouncilors\\\"][number],\\n  weights: ScoringWeights,\\n  haveMissions: Map<MissionDataName, number>\\n): ScoreResult {\\n  return getScore(councilor.effectsWithOrgsAndAugments, weights, haveMissions, true);\\n}\\n\\nconst orgTransferFactor = 0.2;\\nfunction getOrganizationScore(\\n  org: Analysis[\\\"playerAvailableOrgs\\\"][number] & { type: string },\\n  weights: ScoringWeights,\\n  haveMissions: Map<MissionDataName, number>\\n): ScoreResult {\\n  return getScore(\\n    {\\n      ...org,\\n      techBonuses: org.template?.techBonuses,\\n      missionsGrantedNames: org.template?.missionsGrantedNames || [],\\n      ...(org.type === \\\"available\\\"\\n        ? {}\\n        : {\\n            // already-purchased orgs seem to cost ~30% to transfer\\n            costMoney: (org.costMoney || 0) * orgTransferFactor,\\n            costInfluence: (org.costInfluence || 0) * orgTransferFactor,\\n            costOps: (org.costOps || 0) * orgTransferFactor,\\n            costBoost: (org.costBoost || 0) * orgTransferFactor,\\n          }),\\n    },\\n    weights,\\n    haveMissions\\n  );\\n}\\n\\ninterface ScoreResult {\\n  value: number;\\n  noMissionScore: number;\\n  details: string;\\n}\\n\\nfunction getScore(\\n  org: ShowEffectsProps,\\n  weights: ScoringWeights,\\n  haveMissions: Map<MissionDataName, number>,\\n  ignoreTier: boolean = false\\n): ScoreResult {\\n  let totalScore = 0;\\n  const details: string[] = [];\\n\\n  // Helper to add score for a numeric attribute\\n  const addScore = (name: string, value: number | undefined, weight: number | undefined, noNegative?: boolean) => {\\n    let actualValue = value || 0;\\n    if (noNegative) {\\n      actualValue = Math.max(0, actualValue);\\n    }\\n    const actualWeight = weight ?? 0;\\n\\n    // Skip if value or weight is 0/undefined/null\\n    if (!actualValue || !actualWeight) return;\\n\\n    const contribution = actualValue * actualWeight;\\n    totalScore += contribution;\\n    details.push(\\n      `${name}: ${parseFloat(actualValue.toFixed(2))} × ${parseFloat(actualWeight.toFixed(3))} = ${contribution.toFixed(\\n        3\\n      )}`\\n    );\\n  };\\n\\n  // Councilor attributes\\n  addScore(\\\"persuasion\\\", org.persuasion, weights.persuasion, true);\\n  addScore(\\\"command\\\", org.command, weights.command, true);\\n  addScore(\\\"investigation\\\", org.investigation, weights.investigation, true);\\n  addScore(\\\"espionage\\\", org.espionage, weights.espionage, true);\\n  addScore(\\\"administration\\\", org.administration, weights.administration, true);\\n  addScore(\\\"science\\\", org.science, weights.science, true);\\n  addScore(\\\"security\\\", org.security, weights.security, true);\\n  addScore(\\\"Persuasion\\\", org.Persuasion, weights.persuasion, true);\\n  addScore(\\\"Command\\\", org.Command, weights.command, true);\\n  addScore(\\\"Investigation\\\", org.Investigation, weights.investigation, true);\\n  addScore(\\\"Espionage\\\", org.Espionage, weights.espionage, true);\\n  addScore(\\\"Administration\\\", org.Administration, weights.administration, true);\\n  addScore(\\\"Science\\\", org.Science, weights.science, true);\\n  addScore(\\\"Security\\\", org.Security, weights.security, true);\\n  addScore(\\\"xpModifier\\\", org.xpModifier, weights.xpModifier);\\n  addScore(\\\"xp\\\", org.xp, weights.xp);\\n\\n  // Monthly income/costs\\n  addScore(\\\"incomeBoost_month\\\", org.incomeBoost_month, weights.incomeBoost_month);\\n  addScore(\\\"incomeMoney_month\\\", org.incomeMoney_month, weights.incomeMoney_month);\\n  addScore(\\\"incomeInfluence_month\\\", org.incomeInfluence_month, weights.incomeInfluence_month);\\n  addScore(\\\"incomeOps_month\\\", org.incomeOps_month, weights.incomeOps_month);\\n  addScore(\\\"incomeMissionControl\\\", org.incomeMissionControl, weights.incomeMissionControl);\\n  addScore(\\\"incomeResearch_month\\\", org.incomeResearch_month, weights.incomeResearch_month);\\n  addScore(\\\"projectCapacityGranted\\\", org.projectCapacityGranted, weights.projectCapacityGranted);\\n\\n  // Purchase costs\\n  addScore(\\\"costMoney\\\", org.costMoney, weights.costMoney);\\n  addScore(\\\"costInfluence\\\", org.costInfluence, weights.costInfluence);\\n  addScore(\\\"costOps\\\", org.costOps, weights.costOps);\\n  addScore(\\\"costBoost\\\", org.costBoost, weights.costBoost);\\n\\n  // Priority bonuses\\n  addScore(\\\"economyBonus\\\", org.economyBonus, weights.economyBonus);\\n  addScore(\\\"welfareBonus\\\", org.welfareBonus, weights.welfareBonus);\\n  addScore(\\\"environmentBonus\\\", org.environmentBonus, weights.environmentBonus);\\n  addScore(\\\"knowledgeBonus\\\", org.knowledgeBonus, weights.knowledgeBonus);\\n  addScore(\\\"governmentBonus\\\", org.governmentBonus, weights.governmentBonus);\\n  addScore(\\\"unityBonus\\\", org.unityBonus, weights.unityBonus);\\n  addScore(\\\"militaryBonus\\\", org.militaryBonus, weights.militaryBonus);\\n  addScore(\\\"oppressionBonus\\\", org.oppressionBonus, weights.spoilsBonus); // WAIT, there's a typo here in original code?\\n  // Let'oping original: addScore(\\\"oppressionBonus\\\", org.oppressionBonus, weights.oppressionBonus);\\n  // The original says: addScore(\\\"oppressionBonus\\\", org.oppressionBonus, weights.oppressionBonus);\\n  // I'll stick to the original.\\n  addScore(\\\"oppressionBonus\\\", org.oppressionBonus, weights.oppressionBonus);\\n  addScore(\\\"spoilsBonus\\\", org.spoilsBonus, weights.spoilsBonus);\\n  addScore(\\\"spaceDevBonus\\\", org.spaceDevBonus, weights.spaceDevBonus);\\n  addScore(\\\"spaceflightBonus\\\", org.spaceflightBonus, weights.spaceflightBonus);\\n  addScore(\\\"MCBonus\\\", org.MCBonus, weights.MCBonus);\\n  addScore(\\\"miningBonus\\\", org.miningBonus, weights.miningBonus);\\n\\n  // Tech bonuses from councilor/traits\\n  if (weights.councilorTechBonus && org?.councilorTechBonus) {\\n    for (const { category, bonus } of org.councilorTechBonus) {\\n      const weight = weights.councilorTechBonus[category];\\n      addScore(`councilorTechBonus[${category}]`, bonus, weight);\\n    }\\n  }\\n\\n  // Tech bonuses from orgs\\n  if (weights.techBonuses && org?.techBonuses) {\\n    for (const { category, bonus } of org.techBonuses) {\\n      const weight = weights.techBonuses[category];\\n      addScore(`techBonus[${category}]`, bonus, weight);\\n    }\\n  }\\n\\n  let noMissionScore = totalScore;\\n\\n  // Missions granted\\n  if (weights.missions && org?.missionsGrantedNames) {\\n    for (const missionName of org.missionsGrantedNames) {\\n      const weight = weights.missions[missionName];\\n      addScore(`mission[${missionName}]`, 1, weight);\\n\\n      // Extra weight for missing missions\\n      if (weights.extraWeightForMissingMissions && (haveMissions.get(missionName) || 0) === 0) {\\n        totalScore += weights.extraWeightForMissingMissions;\\n        details.push(\\n          `mission[${missionName}]: missing bonus × ${parseFloat(\\n            weights.extraWeightForMissingMissions.toFixed(3)\\n          )} = ${weights.extraWeightForMissingMissions.toFixed(3)}`\\n        );\\n      }\\n      if (weights.extraWeightForSingleMissions && (haveMissions.get(missionName) || 0) === 1) {\\n        totalScore += weights.extraWeightForSingleMissions;\\n        details.push(\\n          `mission[${missionName}]: single bonus × ${parseFloat(\\n            weights.extraWeightForSingleMissions.toFixed(3)\\n          )} = ${weights.extraWeightForSingleMissions.toFixed(3)}`\\n        );\\n      }\\n    }\\n  }\\n\\n  // Divide by tier to normalize for org cost/power\\n  const tier = org.tier || 1;\\n  let finalScore = totalScore;\\n\\n  if (tier > 1 && !ignoreTier) {\\n    const tierFactor = Math.pow(tier, weights.orgTierExponent);\\n    finalScore = totalScore / tierFactor;\\n    noMissionScore /= tierFactor;\\n    details.push(`Subtotal: ${totalScore.toFixed(3)}`);\\n    details.push(`Divided by ${tierFactor.toFixed(2)} for tier ${tier}: ${finalScore.toFixed(3)}`);\\n  }\\n\\n  return {\\n    value: finalScore,\\n    noMissionScore,\\n    details: details.join(\\\"\\\\n\\\"),\\n  };\\n}\\n\",\"oldString\":\"\\\"use client\\\";\\n\\nimport { useState, useEffect } from \\\"react\\\";\\nimport { combineEffects, ShowEffects, ShowEffectsProps } from \\\"@/components/showEffects\\\";\\nimport { AccordionContent, AccordionItem, AccordionTrigger } from \\\"@/components/ui/accordion\\\";\\nimport { SmartAccordion } from \\\"@/components/ui/smart-accordion\\\";\\nimport { Button } from \\\"@/components/ui/button\\\";\\nimport { Collapsible, CollapsibleContent, CollapsibleTrigger } from \\\"@/components/ui/collapsible\\\";\\nimport { Tooltip, TooltipContent, TooltipTrigger } from \\\"@/components/ui/tooltip\\\";\\nimport { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from \\\"@/components/ui/table\\\";\\nimport { Analysis } from \\\"@/lib/analysis\\\";\\nimport { MissionDataName, TraitDataName } from \\\"@/lib/template-types-generated\\\";\\nimport { MinusCircleIcon, PlusCircleIcon } from \\\"lucide-react\\\";\\nimport { defaultScoringWeights, loadWeightsFromStorage, ScoringWeights, ScoringWeightsDialog } from \\\"./scoringWeights\\\";\\nimport { Administration, MissionIcons, TraitIcons, UnknownIcon } from \\\"@/components/icons\\\";\\nimport { Tabs, TabsContent, TabsList, TabsTrigger } from \\\"@/components/ui/tabs\\\";\\nimport { SmartTabs } from \\\"@/components/ui/smart-tabs\\\";\\nimport { twMerge } from \\\"tailwind-merge\\\";\\n\\nfunction CouncilorTableHeader({ hasOrgs }: { hasOrgs?: boolean }) {\\n  return (\\n    <TableHeader>\\n      <TableRow>\\n        <TableHead>Name</TableHead>\\n        <TableHead>Modified Stats</TableHead>\\n        {hasOrgs && <TableHead>Org Tiers</TableHead>}\\n        <TableHead>Monthly Effects</TableHead>\\n        <TableHead>Priorities</TableHead>\\n        <TableHead>Science</TableHead>\\n        <TableHead>Missions</TableHead>\\n        <TableHead>Score</TableHead>\\n        <TableHead>NM Score</TableHead>\\n        <TableHead>CP Cap</TableHead>\\n      </TableRow>\\n    </TableHeader>\\n  );\\n}\\n\\nfunction OrgTableHeader({ costHeader }: { costHeader?: string }) {\\n  return (\\n    <TableHeader>\\n      <TableRow>\\n        <TableHead>Org Name</TableHead>\\n        <TableHead>Requirements</TableHead>\\n        <TableHead>Tier</TableHead>\\n        {costHeader ? <TableHead>{costHeader}</TableHead> : <TableHead>Purchase / Transfer</TableHead>}\\n        <TableHead>Monthly</TableHead>\\n        <TableHead>Effects</TableHead>\\n        <TableHead>Score</TableHead>\\n        <TableHead>NM Score</TableHead>\\n      </TableRow>\\n    </TableHeader>\\n  );\\n}\\n\\nfunction CouncilorTableRow({\\n  councilor,\\n  stats,\\n  label,\\n  hasOrgs,\\n  highlightMissionClassName,\\n}: {\\n  councilor: Analysis[\\\"playerCouncilors\\\"][number] & { score?: ScoreResult };\\n  stats: Analysis[\\\"playerCouncilors\\\"][number][\\\"effectsWithOrgsAndAugments\\\"];\\n  label: string;\\n  hasOrgs?: boolean;\\n  highlightMissionClassName?: (missionName: MissionDataName) => string | undefined;\\n}) {\\n  const admin = Math.min(25, Math.max(0, (stats.administration || 0) + (stats.Administration || 0)));\\n  const orgTiers = councilor.orgs.reduce((a, b) => a + b.tier, 0);\\n  const cpCap =\\n    Math.min(25, Math.max(0, stats.persuasion || 0) + Math.max(0, stats.Persuasion || 0)) +\\n    Math.min(25, Math.max(0, stats.command || 0) + Math.max(0, stats.Command || 0)) +\\n    Math.min(25, Math.max(0, stats.administration || 0) + Math.max(0, stats.Administration || 0));\\n  return (\\n    <TableRow key={`${councilor.id}-${label}`}>\\n      <TableCell>{label}</TableCell>\\n      <TableCell>\\n        <ShowEffects\\n          persuasion={stats.persuasion}\\n          command={stats.command}\\n          investigation={stats.investigation}\\n          espionage={stats.espionage}\\n          administration={stats.administration}\\n          science={stats.science}\\n          security={stats.security}\\n          Persuasion={stats.Persuasion}\\n          Command={stats.Command}\\n          Investigation={stats.Investigation}\\n          Espionage={stats.Espionage}\\n          Administration={stats.Administration}\\n          Science={stats.Science}\\n          Security={stats.Security}\\n          ApparentLoyalty={stats.ApparentLoyalty}\\n          Loyalty={stats.Loyalty}\\n          maxLoyalty={stats.maxLoyalty}\\n          xpModifier={stats.xpModifier}\\n          xp={stats.xp}\\n          traitTemplateNames={stats.traitTemplateNames}\\n          typeTemplateName={stats.typeTemplateName}\\n          playerIntel={stats.playerIntel}\\n          playerMaxIntel={stats.playerMaxIntel}\\n          lastRecordedLoyalty={stats.lastRecordedLoyalty}\\n          // TODO: is there a case where we should show this?\\n          // Loyalty={stats.Loyalty}\\n        />\\n      </TableCell>\\n      {hasOrgs && (\\n        <TableCell>\\n          <ShowEffects tier={stats.tier} highlightTier={orgTiers < admin} />\\n        </TableCell>\\n      )}\\n      <TableCell>\\n        <ShowEffects\\n          incomeBoost_month={stats.incomeBoost_month}\\n          incomeMoney_month={stats.incomeMoney_month}\\n          incomeInfluence_month={stats.incomeInfluence_month}\\n          incomeOps_month={stats.incomeOps_month}\\n          incomeMissionControl={stats.incomeMissionControl}\\n          incomeResearch_month={stats.incomeResearch_month}\\n          projectCapacityGranted={stats.projectCapacityGranted}\\n        />\\n      </TableCell>\\n      <TableCell>\\n        <span className=\\\"text-wrap leading-6 -my-2 inline-block\\\">\\n          <ShowEffects\\n            economyBonus={stats.economyBonus}\\n            welfareBonus={stats.welfareBonus}\\n            environmentBonus={stats.environmentBonus}\\n            knowledgeBonus={stats.knowledgeBonus\\n            }\\n            governmentBonus={stats.governmentBonus}\\n            unityBonus={stats.unityBonus}\\n            militaryBonus={stats.militaryBonus}\\n            oppressionBonus={stats.oppressionBonus}\\n            spoilsBonus={stats.spoilsBonus}\\n            spaceDevBonus={stats.spaceDevBonus}\\n            spaceflightBonus={stats.spaceflightBonus}\\n            MCBonus={stats.MCBonus}\\n            miningBonus={stats.miningBonus}\\n          />\\n        </span >\\n      </TableCell>\\n      <TableCell>\\n        <span className=\\\"text-wrap leading-6 -my-2 inline-block\\\">\\n          <ShowEffects\\n            councilorTechBonus={stats.councilorTechBonus}\\n            techBonuses={stats.techBonuses}\\n          />\\n        </span >\\n      </TableCell>\\n      <TableCell>\\n        <span className=\\\"text-wrap leading-6 -my-2 inline-block\\\">\\n          <ShowEffects\\n            missionsGrantedNames={stats.missionsGrantedNames}\\n            highlightMissionClassName={highlightMissionClassName}\\n          />\\n        </span >\\n      </TableCell>\\n      {councilor.score === undefined ? null : (\\n        <>\\n          <TableCell>\\n            <Tooltip>\\n              <TooltipTrigger>{councilor.score.value?.toFixed(2)}</TooltipTrigger>\\n              <TooltipContent align=\\\"end\\\" className=\\\"max-w-auto\\\">\\n                <pre className=\\\"p-2\\\">{councilor.score.details}</pre>\\n              </TooltipContent>\\n            </Tooltip>\\n          </TableCell>\\n          <TableCell>{councilor.score.noMissionScore?.toFixed(2)}</TableCell>\\n          <TableCell>{cpCap?.toFixed(0)}</TableCell>\\n        </>\\n      )}\\n    </TableRow>\\n  );\\n}\\n\\nfunction OrgTableRow({\\n  org,\\n  playerNationIds,\\n  playerTraits,\\n  highlightMissionClassName,\\n  isTakeover,\\n}: {\\n  org: Analysis[\\\"playerAvailableOrgs\\\"][number] & {\\n    type?: string;\\n    score?: ScoreResult;\\n    councilor?: string;\\n    councilorId?: number;\\n  };\\n  playerNationIds: Set<number>;\\n  playerTraits: Set<string>;\\n  highlightMissionClassName?: (missionName: MissionDataName) => string | undefined;\\n  isTakeover?: boolean;\\n}) {\\n  const missingRequiredTraits = org.template?.requiredOwnerTraits?.filter((t) => !playerTraits.has(t)) || [];\\n  function traitIcon(trait: TraitDataName, Fallback: typeof PlusCircleIcon) {\\n    return TraitIcons[trait] || Fallback;\\n  }\\n  return (\\n    <TableRow\\n      key={org.id}\\n      className={twMerge(org.isAdminOrg ? \\\"bg-green-100\\\" : \\\"\\\", org.type === \\\"unassigned\\\" ? \\\"bg-yellow-100\\\" : \\\"\\\")}\\n    >\\n      <TableCell>{org.displayName}</TableCell>\\n      <TableCell>\\n        {org.template?.requiresNationality && (\\n          <span className=\\\"mr-1\\\" title={`Required Nation: ${org.homeNationName || \\\"\\\"}`}>\\n            {playerNationIds.has(org.homeNationId || -1) ? (\\n              <PlusCircleIcon className=\\\"inline h-4 w-4 stroke-green-700 -mt-1 bg-transparent\\\" />\\n            ) : (\\n              <MinusCircleIcon className=\\\"inline h-4 w-4 stroke-destructive -mt-1\\\" />\\n            )}\\n          </span >\\n        )}\\n        {org.template?.requiredOwnerTraits && (\\n          <span className=\\\"mr-1\\\" title={\\\"Required Traits: \\\" + org.template.requiredOwnerTraits.join(\\\", \\\")}>\\n            {missingRequiredTraits.length === 0\\n              ? org.template.requiredOwnerTraits.map((trait, ix) => {\\n                  const Icon = traitIcon(trait, PlusCircleIcon);\\n                  return <Icon key={ix} className=\\\"inline h-4 w-4 stroke-green-700 -mt-1\\\" />;\\n                })\\n              : missingRequiredTraits.map((trait, ix) => {\\n                  const Icon = traitIcon(trait, MinusCircleIcon);\\n                  return <Icon key={ix} className=\\\"inline h-4 w-4 stroke-destructive -mt-1\\\" />;\\n                })}\\n          </span >\\n        )}\\n        {org.template?.prohibitedOwnerTraits && (\\n          <span className=\\\"mr-1\\\" title={\\\"Prohibited Traits: \\\" + org.template.prohibitedOwnerTraits.join(\\\", \\\")}>\\n            {org.template.prohibitedOwnerTraits.map((trait, ix) => {\\n              const Icon = traitIcon(trait, MinusCircleIcon);\\n              return <Icon key={ix} className=\\\"inline h-4 w-4 stroke-blue-700 -mt-1\\\" />;\\n            })}\\n          </span >\\n        )}\\n      </TableCell>\\n      <TableCell>\\n        <ShowEffects tier={org.tier} />\\n      </TableCell>\\n      <TableCell>\\n        {org.type === \\\"unassigned\\\" && \\\"T \\\"}\\n        {org.type === \\\"available\\\" || org.type === \\\"unassigned\\\" ? (\\n          <ShowEffects\\n            costMoney={(org.costMoney || 0) * (org.type === \\\"available\\\" ? 1 : orgTransferFactor)}\\n            costInfluence={(org.costInfluence || 0) * (org.type === \\\"available\\\" ? 1 : orgTransferFactor)}\\n            costOps={(org.costOps || 0) * (org.type === \\\"available\\\" ? 1 : orgTransferFactor)}\\n            costBoost={(org.costBoost || 0) * (org.type === \\\"available\\\" ? 1 : orgTransferFactor)}\\n          />\\n        ) : org.type == \\\"stealable\\\" && isTakeover ? (\\n          (() => {\\n            const target = org as any as Analysis[\\\"playerStealableOrgs\\\"][number];\\n            return (\\n              <>\\n                {target.councilor ?? \\\"Unassigned\\\"} from {target.faction?.displayName}, Admin: {target.admin} +\\n                takeoverDefense: {target.takeoverDefense}\\n              </>\\n            );\\n          })()\\n        ) : org.type === \\\"used\\\" ? (\\n          <>{org.councilor ?? \\\"Unassigned\\\"}</>\\n        ) : null}\\n      </TableCell>\\n      <TableCell>\\n        <ShowEffects\\n          incomeBoost_month={org.incomeBoost_month}\\n          incomeMoney_month={org.incomeMoney_month}\\n          incomeInfluence_month={org.incomeInfluence_month}\\n          incomeOps_month={org.incomeOps_month}\\n          incomeMissionControl={org.incomeMissionControl}\\n          incomeResearch_month={org.incomeResearch_month}\\n          projectCapacityGranted={org.projectCapacityGranted}\\n        />\\n      </TableCell>\\n      <TableCell>\\n        <ShowEffects\\n          persuasion={org.persuasion}\\n          command={org.command}\\n          investigation={org.investigation}\\n          espionage={org.espionage}\\n          administration={org.administration}\\n          science={org.science}\\n          security={org.security}\\n          economyBonus={org.economyBonus}\\n          welfareBonus={org.welfareBonus\\n          }\\n          environmentBonus={org.environmentBonus}\\n          knowledgeBonus={org.knowledgeBonus}\\n          governmentBonus={org.governmentBonus}\\n          unityBonus={org.unityBonus}\\n          militaryBonus={org.militaryBonus}\\n          oppressionBonus={org.oppressionBonus}\\n          spoilsBonus={org.spoilsBonus}\\n          spaceDevBonus={org.spaceDevBonus}\\n          spaceflightBonus={org.spaceflightBonus}\\n          MCBonus={org.MCBonus}\\n          miningBonus={org.miningBonus}\\n          techBonuses={org.template?.techBonuses}\\n          missionsGrantedNames={org.template?.missionsGrantedNames || []}\\n          highlightMissionClassName={highlightMissionClassName}\\n        />\\n      </TableCell>\\n      {org.score === undefined ? null : (\\n        <>\\n          <TableCell>\\n            <Tooltip>\\n              <TooltipTrigger>{org.score.value?.toFixed(2)}</TooltipTrigger>\\n              <TooltipContent align=\\\"end\\\" className=\\\"max-w-auto\\\">\\n                <pre className=\\\"p-2\\\">{org.score.details}</pre>\\n              </TooltipContent>\\n            </Tooltip>\\n          </TableCell>\\n          <TableCell>{org.score.noMissionScore?.toFixed(2)}</TableCell>\\n        </>\\n      )}\\n    </TableRow>\\n  );\\n}\\n\\nexport function getCouncilorsUi(analysis: Analysis) {\\n  const { playerMissionCounts } = analysis;\\n  const [weights, setWeights] = useState<ScoringWeights>(defaultScoringWeights);\\n\\n  useEffect(() => {\\n    setWeights(loadWeightsFromStorage());\\n  }, []);\\n\\n  const scoredModifiedCouncilors = scoreAndSort(\\n    analysis.playerCouncilors,\\n    weights,\\n    playerMissionCounts,\\n    getModifiedCouncilorScore\\n  );\\n  const scoredAvailableCouncilors = scoreAndSort(\\n    analysis.playerAvailableCouncilors,\\n    weights,\\n    playerMissionCounts,\\n    getBaseCouncilorScore\\n  );\\n  const scoredBaseCouncilors = scoreAndSort(\\n    analysis.playerCouncilors,\\n    weights,\\n    playerMissionCounts,\\n    getBaseCouncilorScore\\n  );\\n  const scoredOrgs = scoreAndSort(\\n    analysis.playerAvailableOrgs\\n      .map((i) => ({ type: \\\"available\\\", ...i }))\\n      .concat(analysis.playerUnassignedOrgs.map((i) => ({ type: \\\"unassigned\\\", ...i }))),\\n    weights,\\n    playerMissionCounts,\\n    getOrganizationScore,\\n    \\\"noMissionScore\\\" // ignore missions when sorting orgs\\n  ).toSorted((a, b) => (a.isAdminOrg === b.isAdminOrg ? 0 : a.isAdminOrg ? -1 : 1)); // admin orgs first\\n  const usedOrgs = analysis.playerCouncilors.flatMap((councilor) =>\\n    councilor.orgs.map((o) => ({ ...o, type: \\\"used\\\", councilor: councilor.displayName, councilorId: councilor.id }))\\n  );\\n  const scoredUsedOrgs = scoreAndSort(usedOrgs, weights, playerMissionCounts, getOrganizationScore);\\n  const scoredOwnedOrgs = scoreAndSort(\\n    analysis.playerUnassignedOrgs.map((i) => ({ type: \\\"unassigned\\\", ...i })).concat(usedOrgs),\\n    weights,\\n    playerMissionCounts,\\n    getOrganizationScore\\n  );\\n\\n  const bestAvailableCouncilor = scoredAvailableCouncilors[0]?.score.value;\\n  const worstExistingCouncilor = scoredBaseCouncilors[scoredBaseCouncilors.length - 1]?.score.value;\\n  const bestAvailableOrg = scoredOrgs[0]?.score.value;\\n  const worstExistingOrg = scoredUsedOrgs[scoredUsedOrgs.length - 1]?.score.value;\\n\\n  return {\\n    key: \\\"councilors\\\",\\n    tab: (\\n      <>\\n        Councilors ({worstExistingCouncilor?.toFixed(0)} vs. {bestAvailableCouncilor?.toFixed(0)}) / Orgs (\\n        {worstExistingOrg?.toFixed(2)} vs {bestAvailableOrg?.toFixed(2)})\\n      </>\\n    ),\\n    content: (\\n      <CouncilorsComponent\\n        {...{\\n          analysis,\\n          weights,\\n          setWeights,\\n          scoredModifiedCouncilors,\\n          scoredAvailableCouncilors,\\n          scoredBaseCouncilors,\\n          scoredOrgs,\\n          scoredOwnedOrgs,\\n        }}\\n      />\\n    ),\\n  };\\n}\\n\\nfunction CouncilorsComponent({\\n  analysis,\\n  weights,\\n  setWeights,\\n  scoredModifiedCouncilors,\\n  scoredAvailableCouncilors,\\n  scoredBaseCouncilors,\\n  scoredOrgs,\\n  scoredOwnedOrgs,\\n}: {\\n  analysis: Analysis;\\n  weights: ScoringWeights;\\n  setWeights: (weights: ScoringWeights) => void;\\n  scoredModifiedCouncilors: (Analysis[\\\"playerCouncilors\\\"][number] & { score: ScoreResult })[];\\n  scoredAvailableCouncilors: (Analysis[\\\"playerAvailableCouncilors\\\"][number] & { score: ScoreResult })[];\\n  scoredBaseCouncilors: (Analysis[\\\"playerCouncilors\\\"][number] & { score: ScoreResult })[];\\n  scoredOrgs: (Analysis[\\\"playerAvailableOrgs\\\"][number] & {\\n    type: string;\\n    score: ScoreResult;\\n  })[];\\n  scoredOwnedOrgs: (Analysis[\\\"playerAvailableOrgs\\\"][number] & {\\n    type: string;\\n    score: ScoreResult;\\n    councilor?: string;\\n    councilorId?: number;\\n  })[];\\n}) {\\n  const {\\n    playerMissionCounts,\\n    playerVisibleCouncilors,\\n    playerCouncilors,\\n    playerAvailableOrgs,\\n    playerUnassignedOrgs,\\n    playerFaction,\\n    playerStealableOrgs,\\n    factionsById,\\n  } = analysis;\\n  const scoredStealableOrgs = scoreAndSort(\\n    analysis.playerStealableOrgs.map((i) => ({ type: \\\"stealable\\\", ...i })),\\n    weights,\\n    playerMissionCounts,\\n    getOrganizationScore,\\n    \\\"noMissionScore\\\"\\n  );\\n\\n  function currentHighlightMissionClassName(missionName: MissionDataName) {\\n    // if we have exactly 2, show yellow BG, if we have 1, show red, otherwise no change to bg\\n    const count = playerMissionCounts.get(missionName) || 0;\\n    if (count === 2) {\\n      return \\\"bg-yellow-300/50\\\";\\n    } else if (count === 1) {\\n      return \\\"bg-red-300/50\\\";\\n    }\\n  }\\n  function availableHighlightMissionClassName(missionName: MissionDataName) {\\n    // if we have 1, show yellow BG, if we have 0, show green, otherwise no change to bg\\n    const count = playerMissionCounts.get(missionName) || 0;\\n    if (count === 1) {\\n      return \\\"bg-yellow-300/50\\\";\\n    } else if (count === 0) {\\n      return \\\"bg-green-300/50\\\";\\n    }\\n  }\\n  const playerNationIds = new Set(analysis.playerNationIds);\\n  const playerTraits = new Set(analysis.playerCouncilors.flatMap((i) => i.traitTemplateNames));\\n  const unusedAdmin = analysis.playerCouncilors\\n    .map(\\n      (c) =>\\n        Math.min(\\n          25,\\n          Math.max(\\n            0,\\n            (c.effectsWithOrgsAndAugments.Administration || 0) + (c.effectsWithOrgsAndAugments.administration || 0)\\n          )\\n        ) - c.orgs.reduce((a, b) => a + b.tier, 0)\\n    )\\n    .reduce((a, b) => a + b, 0);\\n\\n  const stealableOrgsByFaction = scoredStealableOrgs.reduce((acc, org) => {\\n    const key = org.faction?.id || 0;\\n    if (!acc.has(key)) {\\n      acc.set(key, []);\\n    }\\n    acc.get(key)!.push(org);\\n    return acc;\\n  }, new Map<number, typeof scoredStealableOrgs>());\\n\\n  type MissionSource =\\n    | {\\n        type: \\\"councilor\\\";\\n        councilor: Analysis[\\\"playerCouncilors\\\"][number];\\n        factionId: number | undefined;\\n        missions: MissionDataName[];\\n      }\\n    | {\\n        type: \\\"org\\\";\\n        org: Analysis[\\\"playerAvailableOrgs\\\"][number];\\n        factionId: number | undefined;\\n        missions: MissionDataName[];\\n      };\\n\\n  const sourcesByFactionByMission = [...playerCouncilors, ...playerVisibleCouncilors]\\n    .map(\\n      (i) =>\\n        ({\\n          type: \\\"councilor\\\",\\n          councilor: i,\\n          factionId: i.factionId,\\n          missions: i.effectsWithOrgsAndAugments.missionsGrantedNames || [],\\n        } as MissionSource)\\n    )\\n    .concat(\\n      [...playerAvailableOrgs, ...playerUnassignedOrgs].map((i) => ({\\n        type: \\\"org\\\",\\n        org: i,\\n        factionId: playerFaction?.id,\\n        missions: i.template?.missionsGrantedNames || [],\\n      }))\\n    )\\n    .concat(\\n      playerStealableOrgs.map((i) => ({\\n        type: \\\"org\\\",\\n        org: i,\\n        factionId: i.faction?.id,\\n        missions: i.template?.missionsGrantedNames || [],\\n      }))\\n    )\\n    .reduce((acc, o) => {\\n      const key = o.factionId || 0;\\n      if (!acc.has(key)) {\\n        acc.set(key, new Map<string, MissionSource[]>());\\n      }\\n      const effectsMap = acc.get(key)!;\\n      o.missions.forEach((m) => {\\n        if (!effectsMap.has(m)) {\\n          effectsMap.set(m, []);\\n        }\\n        effectsMap.get(m)!.push(o);\\n      });\\n      return acc;\\n    }, new Map<number, Map<string, MissionSource[]>>());\\n  const factions = Array.from(sourcesByFactionByMission.keys())\\n    .map((factionId) => factionsById.get(factionId)!)\\n    .filter((f) => f)\\n    .toSorted((a, b) => {\\n      if (a.id === playerFaction.id) return -1;\\n      if (b.id === playerFaction.id) return 1;\\n      return (a.displayName || \\\"\\\").localeCompare(b.displayName || \\\"\\\");\\n    });\\n\\n  const importantMissions = [\\\"Assassinate\\\"];\\n\\n  const councilEffects = scoredModifiedCouncilors.reduce((acc, councilor) => {\\n    return combineEffects(acc, councilor.effectsWithOrgsAndAugments);\\n  }, {} as ShowEffectsProps);\\n\\n  // TODO: would be cool to click an effect icon and sort everything by that (ie. click persuasion icon to see who/org gives most persuasion)\\n  return (\\n    <div className=\\\"space-y-2\\\">\\n      <SmartAccordion\\n        type=\\\"single\\\"\\n        collapsible\\n        storageKey=\\\"councilorsSections\\\"\\n        defaultValue=\\\"existing\\\"\\n      >\\n        <AccordionItem value=\\\"existing\\\">\\n          <AccordionTrigger>\\n            <span\\n              >\\n            Manage Existing Council ({unusedAdmin.toFixed(0)} <Administration />)\\n            </span >\\n          </AccordionTrigger>\\n          <AccordionContent>\\n            <div className=\\\"py-1\\\">\\n              <ShowEffects\\n                incomeBoost_month={councilEffects.incomeBoost_month}\\n                incomeMoney_month={councilEffects.incomeMoney_month}\\n                incomeInfluence_month={councilEffects.incomeInfluence_month}\\n                incomeOps_month={councilEffects.incomeOps_month}\\n                incomeMissionControl={councilEffects.incomeMissionControl}\\n                incomeResearch_month={councilEffects.incomeResearch_month}\\n                projectCapacityGranted={councilEffects.projectCapacityGranted}\\n              />\\n              <ShowEffects\\n                economyBonus={councilEffects.economyBonus}\\n                welfareBonus={councilEffects.welfareBonus\\n                }\\n                environmentBonus={councilEffects.environmentBonus}\\n                knowledgeBonus={councilEffects.knowledgeBonus\\n                }\\n                governmentBonus={councilEffects.governmentBonus}\\n                unityBonus={councilEffects.unityBonus}\\n                militaryBonus={councilEffects.militaryBonus\\n                }\\n                oppressionBonus={councilEffects.oppressionBonus}\\n                spoilsBonus={councilEffects.spoilsBonus}\\n                spaceDevBonus={councilEffects.spaceDevBonus}\\n                spaceflightBonus={councilEffects.spaceflightBonus}\\n                MCBonus={councilEffects.MCBonus}\\n                miningBonus={councilEffects.miningBonus}\\n              />\\n              <ShowEffects\\n                councilorTechBonus={councilEffects.councilorTechBonus}\\n                techBonuses={councilEffects.techBonuses}\\n              />\\n            </div >\\n            <Table>\\n              <CouncilorTableHeader hasOrgs />\\n              <TableBody>\\n                {scoredModifiedCouncilors.map((councilor) => (\\n                  <CouncilorTableRow\\n                    key={councilor.id}\\n                    councilor={councilor}\\n                    stats={councilor.effectsWithOrgsAndAugments}\\n                    label={councilor.displayName!}\\n                    hasOrgs\\n                    highlightMissionClassName={currentHighlightMissionClassName}\\n                  />\\n                ))}\\n              </TableBody>\\n            </Table>\\n            <h3 className=\\\"mt-1\\\">Available Organizations:</h3>\\n            <Table>\\n              <OrgTableHeader />\\n              <TableBody>\\n                {scoredOrgs.map((org) => (\\n                  <OrgTableRow\\n                    key={org.id}\\n                    org={org}\\n                    playerNationIds={playerNationIds}\\n                    playerTraits={playerTraits}\\n                    highlightMissionClassName={availableHighlightMissionClassName}\\n                  />\\n                ))}\\n              </TableBody>\\n            </Table>\\n          </AccordionContent>\\n        </AccordionItem>\\n        <AccordionItem value=\\\"new-councilors\\\">\\n          <AccordionTrigger>Find New Councilors</AccordionTrigger>\\n          <AccordionContent>\\n            <h3 className=\\\"mt-1\\\">Available Councilors:</h3>\\n            <Table>\\n              <CouncilorTableHeader />\\n              <TableBody>\\n                {scoredAvailableCouncilors.map((councilor) => (\\n                  <CouncilorTableRow\\n                    key={councilor.id}\\n                    councilor={councilor}\\n                    stats={councilor.effectsBaseAndUnaugmentedTraits}\\n                    label={councilor.displayName!}\\n                    highlightMissionClassName={availableHighlightMissionClassName}\\n                  />\\n                ))}\\n              </TableBody>\\n            </Table>\\n\\n            <h3 className=\\\"mt-1\\\">Unmodified Active Councilors:</h3>\\n            <Table>\\n              <CouncilorTableHeader />\\n              <TableBody>\\n                {scoredBaseCouncilors.map((councilor) => (\\n                  <CouncilorTableRow\\n                    key={`${councilor.id}-base`}\\n                    councilor={councilor}\\n                    stats={councilor.effectsBaseAndUnaugmentedTraits}\\n                    label={`${councilor.displayName}`}\\n                    highlightMissionClassName={currentHighlightMissionClassName}\\n                  />\\n                ))}\\n              </TableBody>\\n            </Table>\\n          </AccordionContent>\\n        </AccordionItem>\\n        <AccordionItem value=\\\"current-orgs\\\">\\n          <AccordionTrigger>Current Organizations</AccordionTrigger>\\n          <AccordionContent>\\n            <Table>\\n              <OrgTableHeader costHeader=\\\"Councilor\\\" />\\n              <TableBody>\\n                {scoredOwnedOrgs.toReversed().map((org) => (\\n                  <OrgTableRow\\n                    key={org.id}\\n                    org={org}\\n                    playerNationIds={playerNationIds}\\n                    playerTraits={playerTraits}\\n                    highlightMissionClassName={availableHighlightMissionClassName}\\n                  />\\n                ))}\\n              </TableBody>\\n            </Table>\\n          </AccordionContent>\\n        </AccordionItem>\\n        <AccordionItem value=\\\"takeover\\\">\\n          <AccordionTrigger>Hostile Takeover</AccordionTrigger>\\n          <AccordionContent>\\n            <SmartTabs\\n              storageKey=\\\"councilorsTakeoverTabs\\\"\\n              defaultValue={`faction-${Array.from(stealableOrgsByFaction.keys())[0]}`}\\n            >\\n              <TabsList>\\n                {Array.from(stealableOrgsByFaction.entries()).map(([factionId, orgs]) => (\\n                  <TabsTrigger key={factionId} value={`faction-${factionId}`}>\\n                    {orgs[0].faction?.displayName || \\\"Unknown Faction\\\"} ({orgs.length})\\n                  </TabsTrigger>\\n                ))}\\n              </TabsList>\\n              {Array.from(stealableOrgsByFaction.entries()).map(([factionId, orgs]) => (\\n                <TabsContent key={factionId} value={`faction-${factionId}`}>\\n                  <Table>\\n                    <OrgTableHeader costHeader=\\\"Takeover\\\" />\\n                    <TableBody>\\n                      {orgs.map((org) => (\\n                        <OrgTableRow\\n                          key={org.id}\\n                          org={org}\\n                          playerNationIds={playerNationIds}\\n                          playerTraits={playerTraits}\\n                          highlightMissionClassName={availableHighlightMissionClassName}\\n                          isTakeover\\n                        />\\n                      ))}\\n                    </TableBody>\\n                  </Table>\\n                </TabsContent>\\n              ))}\\n            </SmartTabs>\\n          </AccordionContent>\\n        </AccordionItem>\\n        <AccordionItem value=\\\"missions\\\">\\n          <AccordionTrigger>Missions</AccordionTrigger>\\n          <AccordionContent>\\n            <SmartTabs storageKey=\\\"councilorsMissionsTabs\\\" defaultValue={`faction-${factions[0].id}`}>\\n              <TabsList>\\n                {factions.map((faction) => (\\n                  <TabsTrigger key={faction.id} value={`faction-${faction.id}`}>\\n                    {faction.displayName || \\\"Unknown Faction\\\"} ({sourcesByFactionByMission.get(faction.id)?.size || 0})\\n                    {importantMissions\\n                      .filter(\\n                        (m) =>\\n                          sourcesByFactionByMission\\n                            .get(faction.id)\\n                            ?.get(m)\\n                            ?.filter((i) => i.type === \\\"councilor\\\")?.length ?? 0 > 0\\n                      )\\n                      .map((m) => {\\n                        const MissionIcon = MissionIcons[m] || UnknownIcon;\\n                        return (\\n                          <span key={m} className=\\\"inline-block -mt-2\\\">\\n                            <MissionIcon className=\\\"h-4 w-4\\\" />\\n                          </span >\\n                        );\\n                      })}\\n                  </TabsTrigger>\\n                ))}\\n              </TabsList>\\n              {factions.map((faction) => (\\n                <TabsContent key={faction.id} value={`faction-${faction.id}`}>\\n                  <SmartAccordion type=\\\"single\\\" collapsible storageKey={`councilorsMissions-${faction.id}`}>\\n                    {Array.from(\\n                      new Set([\\n                        ...importantMissions,\\n                        ...Array.from(sourcesByFactionByMission.get(faction.id)?.keys() || []),\\n                      ]),\\n                    ).map((missionName) => {\\n                      const sources = sourcesByFactionByMission.get(faction.id)?.get(missionName) || [];\\n                      const MissionIcon = MissionIcons[missionName] || UnknownIcon;\\n                      return (\\n                        <AccordionItem key={missionName} value={missionName}>\\n                          <AccordionTrigger>\\n                            <span\\n                              >\\n                            <MissionIcon /> {missionName} &ndash;{\\\" \\\"}\\n                            {sources.filter((i) => i.type === \\\"councilor\\\").length} Councilors &lt;-{\\\" \\\"}\\n                            {sources.filter((i) => i.type === \\\"org\\\").length} Orgs\\n                          </span >\\n                          </AccordionTrigger>\\n                          <AccordionContent>\\n                            <Table>\\n                              <TableHeader>\\n                                <TableRow>\\n                                  <TableHead>Fleet Name</TableHead>\\n                                  <TableHead>Planet</TableHead>\\n                                  <TableHead>Target Orbit</TableHead>\\n                                  <TableHead>Arrival Date</TableHead>\\n                                  <TableHead className=\\\"text-right\\\">Days to Arrival</TableHead>\\n                                  <TableHead className=\\\"text-right\\\">MC Used</TableHead>\\n                                  <TableHead className=\\\"text-right\\\">Marine CP</TableHead>\\n                                  <TableHead className=\\\"text-right\\\">Total Mass</TableHead>\\n                                  <TableHead className=\\\"text-right\\\">Max Ship Mass</TableHead>\\n                                  <TableHead>Ships Hulls</TableHead>\\n                                  <TableHead>Ships Roles</TableHead>\\n                                  <TableHead>Operation</TableHead>\\n                                  <TableHead>Operation Complete</TableHead>\\n                                </TableRow>\\n                              </TableHeader>\\n                              <TableBody>\\n                                {sources?.map((src) => (\\n                                  src.type === \\\"org\\\" ? (\\n                                    <OrgTableRow\\n                                      key={`councilor-${src.org.id}-mission-${missionName}`}\\n                                      org={src.org}\\n                                      playerNationIds={playerNationIds}\\n                                      playerTraits={playerTraits}\\n                                    />\\n                                  ) : (\\n                                    <CouncilorTableRow\\n                                      key={`org-${src.councilor.id}-mission-${missionName}`}\\n                                      councilor={src.councilor}\\n                                      stats={src.councilor.effectsWithOrgsAndAugments}\\n                                      label={src.councilor.displayName!}\\n                                    />\\n                                  )\\n                                ))}\\n                              </TableBody>\\n                            </Table>\\n                          </AccordionContent>\\n                        </AccordionItem>\\n                      );\\n                    })}\\n                  </SmartAccordion>\\n                </TabsContent>\\n              ))}\\n            </SmartTabs>\\n          </AccordionContent>\\n        </AccordionItem>\\n        <AccordionItem value=\\\"other-councilors\\\">\\n          <AccordionTrigger>Other Councilors</AccordionTrigger>\\n          <AccordionContent>\\n            <OtherCouncilorsByFaction {...{ analysis, weights }} />\\n          </AccordionContent>\\n        </AccordionItem>\\n      </SmartAccordion>\\n\\n      <div className=\\\"my-4\\\">\\n        <ScoringWeightsDialog weights={weights} onWeightsChange={setWeights} />\\n      </div >\\n\\n      <Collapsible>\\n        <CollapsibleTrigger asChild>\\n          <Button variant=\\\"outline\\\">Debug Data</Button>\\n        </CollapsibleTrigger>\\n        <CollapsibleContent>\\n          <pre>{JSON.stringify(analysis.playerFaction, null, 2)}</pre>\\n        </CollapsibleContent>\\n      </Collapsible>\\n    </div >\\n  );\\n}\\n\\nfunction OtherCouncilorsByFaction({ analysis, weights }: { analysis: Analysis; weights: ScoringWeights }) {\\n  const { playerVisibleCouncilors, factionsById } = analysis;\\n\\n  const scoredBaseCouncilors = scoreAndSort(\\n    playerVisibleCouncilors,\\n    weights,\\n    new Map<MissionDataName, number>(),\\n    getBaseCouncilorScore\\n  );\\n\\n  const councilorsByFactionId = scoredBaseCouncilors.reduce((acc, councilor) => {\\n    const factionId = councilor.factionId || 0;\\n    if (!factionId) return acc;\\n    if (!acc.has(factionId)) {\\n      acc.set(factionId, []);\\n    }\\n    acc.get(factionId)!.push(councilor);\\n    return acc;\\n  }, new Map<number, Analysis[\\\"playerCouncilors\\\"][number][]>());\\n\\n  const factions = Array.from(councilorsByFactionId.keys())\\n    .map((i) => factionsById.get(i!)!)\\n    .filter((i) => i.id !== analysis.alienFaction.id);\\n\\n  return (\\n    <Tabs defaultValue={`faction-${factions[0].id}`}>\\n      <TabsList>\\n        {factions\\n          .filter((i) => i.id !== analysis.alienFaction.id)\\n          .map((faction) => (\\n            <TabsTrigger key={faction.id} value={`faction-${faction.id}`}>\\n              {faction.displayName || \\\"Unknown Faction\\\"} ({councilorsByFactionId.get(faction.id)?.length || 0})\\n            </TabsTrigger>\\n          ))}\\n      </TabsList>\\n      {factions.map((faction) => (\\n        <TabsContent key={faction.id} value={`faction-${faction.id}`}>\\n          <Table>\\n            <TableHeader>\\n              <TableRow>\\n                <TableHead>Name</TableHead>\\n                <TableHead>Modified Stats</TableHead>\\n                <TableHead>Org Tiers</TableHead>\\n                <TableHead>Monthly Effects</TableHead>\\n                <TableHead>Priorities</TableHead>\\n                <TableHead>Science</TableHead>\\n                <TableHead>Missions</TableHead>\\n                <TableHead>Score</TableHead>\\n                <TableHead>NM Score</TableHead>\\n                <TableHead>CP Cap</TableHead>\\n              </TableRow>\\n            </TableHeader>\\n            <TableBody>\\n              {councilorsByFactionId.get(faction.id)?.map((councilor) => (\\n                <CouncilorTableRow\\n                  key={councilor.id}\\n                  councilor={councilor}\\n                  stats={councilor.effectsBaseAndUnaugmentedTraits}\\n                  label={councilor.displayName!}\\n                />\\n              ))}\\n            </TableBody>\\n          </Table>\\n        </TabsContent>\\n      ))}\\n    </Tabs>\\n  );\\n}\\n\\nfunction scoreAndSort<T>(\\n  items: T[],\\n  weights: ScoringWeights,\\n  haveMissions: Map<MissionDataName, number>,\\n  scoreFn: (item: T, weights: ScoringWeights, haveMissions: Map<MissionDataName, number>) => ScoreResult,\\n  scoreSort: \\\"value\\\" | \\\"noMissionScore\\\" = \\\"value\\\"\\n) {\\n  const scoredItems = items.map((item) => {\\n    const scoreResult = scoreFn(item, weights, haveMissions);\\n    return { ...item, score: scoreResult };\\n  });\\n  scoredItems.sort((a, b) => b.score[scoreSort] - a.score[scoreSort]);\\n  return scoredItems;\\n}\\n\\nfunction getBaseCouncilorScore(\\n  councilor: Analysis[\\\"playerCouncilors\\\"][number],\\n  weights: ScoringWeights,\\n  haveMissions: Map<MissionDataName, number>\\n): ScoreResult {\\n  return getScore(councilor.effectsBaseAndUnaugmentedTraits, weights, haveMissions, true);\\n}\\n\\nfunction getModifiedCouncilorScore(\\n  councilor: Analysis[\\\"playerCouncilors\\\"][number],\\n  weights: ScoringWeights,\\n  haveMissions: Map<MissionDataName, number>\\n): ScoreResult {\\n  return getScore(councilor.effectsWithOrgsAndAugments, weights, haveMissions, true);\\n}\\n\\nconst orgTransferFactor = 0.2;\\nfunction getOrganizationScore(\\n  org: Analysis[\\\"playerAvailableOrgs\\\"][number] & { type: string },\\n  weights: ScoringWeights,\\n  haveMissions: Map<MissionDataName, number>\\n): ScoreResult {\\n  return getScore(\\n    {\\n      ...org,\\n      techBonuses: org.template?.techBonuses,\\n      missionsGrantedNames: org.template?.missionsGrantedNames || [],\\n      ...(org.type === \\\"available\\\"\\n        ? {}\\n        : {\\n            // already-purchased orgs seem to cost ~30% to transfer\\n            costMoney: (org.costMoney || 0) * orgTransferFactor,\\n            costInfluence: (org.costInfluence || 0) * orgTransferFactor,\\n            costOps: (org.costOps || 0) * orgTransferFactor,\\n            costBoost: (org.costBoost || 0) * orgTransferFactor,\\n          }),\\n    },\\n    weights,\\n    haveMissions\\n  );\\n}\\n\\ninterface ScoreResult {\\n  value: number;\\n  noMissionScore: number;\\n  details: string;\\n}\\n\\nfunction getScore(\\n  org: ShowEffectsProps,\\n  weights: ScoringWeights,\\n  haveMissions: Map<MissionDataName, number>,\\n  ignoreTier: boolean = false\\n): ScoreResult {\\n  let totalScore = 0;\\n  const details: string[] = [];\\n\\n  // Helper to add score for a numeric attribute\\n  const addScore = (name: string, value: number | undefined, weight: number | undefined, noNegative?: boolean) => {\\n    let actualValue = value || 0;\\n    if (noNegative) {\\n      actualValue = Math.max(0, actualValue);\\n    }\\n    const actualWeight = weight ?? 0;\\n\\n    // Skip if value or weight is 0/undefined/null\\n    if (!actualValue || !actualWeight) return;\\n\\n    const contribution = actualValue * actualWeight;\\n    totalScore += contribution;\\n    details.push(\\n      `${name}: ${parseFloat(actualValue.toFixed(2))} × ${parseFloat(actualWeight.toFixed(3))} = ${contribution.toFixed(\\n        3\\n      )}`\\n    );\\n  };\\n\\n  // Councilor attributes\\n  addScore(\\\"persuasion\\\", org.persuasion, weights.persuasion, true);\\n  addScore(\\\"command\\\", org.command, weights.command, true);\\n  addScore(\\\"investigation\\\", org.investigation, weights.investigation, true);\\n  addScore(\\\"espionage\\\", org.espionage, weights.espionage, true);\\n  addScore(\\\"administration\\\", org.administration, weights.administration, true);\\n  addScore(\\\"science\\\", org.science, weights.science, true);\\n  addScore(\\\"security\\\", org.security, weights.security, true);\\n  addScore(\\\"Persuasion\\\", org.Persuasion, weights.persuasion, true);\\n  addScore(\\\"Command\\\", org.Command, weights.command, true);\\n  addScore(\\\"Investigation\\\", org.Investigation, weights.investigation, true);\\n  addScore(\\\"Espionage\\\", org.Espionage, weights.espionage, true);\\n  addScore(\\\"Administration\\\", org.Administration, weights.administration, true);\\n  addScore(\\\"Science\\\", org.Science, weights.science, true);\\n  addScore(\\\"Security\\\", org.Security, weights.security, true);\\n  addScore(\\\"xpModifier\\\", org.xpModifier, weights.xpModifier);\\n  addScore(\\\"xp\\\", org.xp, weights.xp);\\n\\n  // Monthly income/costs\\n  addScore(\\\"incomeBoost_month\\\", org.incomeBoost_month, weights.incomeBoost_month);\\n  addScore(\\\"incomeMoney_month\\\", org.incomeMoney_month, weights.incomeMoney_month);\\n  addScore(\\\"incomeInfluence_month\\\", org.incomeInfluence_month, weights.incomeInfluence_month);\\n  addScore(\\\"incomeOps_month\\\", org.incomeOps_month, weights.incomeOps_month);\\n  addScore(\\\"incomeMissionControl\\\", org.incomeMissionControl, weights.incomeMissionControl);\\n  addScore(\\\"incomeResearch_month\\\", org.incomeResearch_month, weights.incomeResearch_month);\\n  addScore(\\\"projectCapacityGranted\\\", org.projectCapacityGranted, weights.projectCapacityGranted);\\n\\n  // Purchase costs\\n  addScore(\\\"costMoney\\\", org.costMoney, weights.costMoney);\\n  addScore(\\\"costInfluence\\\", org.costInfluence, weights.costInfluence);\\n  addScore(\\\"costOps\\\", org.costOps, weights.costOps);\\n  addScore(\\\"costBoost\\\", org.costBoost, weights.costBoost);\\n\\n  // Priority bonuses\\n  addScore(\\\"economyBonus\\\", org.economyBonus, weights.economyBonus);\\n  addScore(\\\"welfareBonus\\\", org.welfareBonus, weights.welfareBonus);\\n  addScore(\\\"environmentBonus\\\", org.environmentBonus, weights.environmentBonus);\\n  addScore(\\\"knowledgeBonus\\\", org.knowledgeBonus, weights.knowledgeBonus);\\n  addScore(\\\"governmentBonus\\\", org.governmentBonus, weights.governmentBonus);\\n  addScore(\\\"unityBonus\\\", org.unityBonus, weights.unityBonus);\\n  addScore(\\\"militaryBonus\\\", org.militaryBonus, weights.militaryBonus);\\n  addScore(\\\"oppressionBonus\\\", org.oppressionBonus, weights.oppressionBonus);\\n  addScore(\\\"spoilsBonus\\\", org.spoilsBonus, weights.spoilsBonus);\\n  addScore(\\\"spaceDevBonus\\\", org.spaceDevBonus, weights.spaceDevBonus);\\n  addScore(\\\"spaceflightBonus\\\", org.spaceflightBonus, weights.spaceflightBonus);\\n  addScore(\\\"MCBonus\\\", org.MCBonus, weights.MCBonus);\\n  addScore(\\\"miningBonus\\\", org.miningBonus, weights.miningBonus);\\n\\n  // Tech bonuses from councilor/traits\\n  if (weights.councilorTechBonus && org?.councilorTechBonus) {\\n    for (const { category, bonus } of org.councilorTechBonus) {\\n      const weight = weights.councilorTechBonus[category];\\n      addScore(`councilorTechBonus[${category}]`, bonus, weight);\\n    }\\n  }\\n\\n  // Tech bonuses from orgs\\n  if (weights.techBonuses && org?.techBonuses) {\\n    for (const { category, bonus } of org.techBonuses) {\\n      const weight = weights.techBonuses[category];\\n      addScore(`techBonus[${category}]`, bonus, weight);\\n    }\\n  }\\n\\n  let noMissionScore = totalScore;\\n\\n  // Missions granted\\n  if (weights.missions && org?.missionsGrantedNames) {\\n    for (const missionName of org.missionsGrantedNames) {\\n      const weight = weights.missions[missionName];\\n      addScore(`mission[${missionName}]`, 1, weight);\\n\\n      // Extra weight for missing missions\\n      if (weights.extraWeightForMissingMissions && (haveMissions.get(missionName) || 0) === 0) {\\n        totalScore += weights.extraWeightForMissingMissions;\\n        details.push(\\n          `mission[${missionName}]: missing bonus × ${parseFloat(\\n            weights.extraWeightForMissingMissions.toFixed(3)\\n          )} = ${weights.extraWeightForMissingMissions.toFixed(3)}`\\n        );\\n      }\\n      if (weights.extraWeightForSingleMissions && (haveMissions.get(missionName) || 0) === 1) {\\n        totalScore += weights.extraWeightForSingleMissions;\\n        details.push(\\n          `mission[${missionName}]: single bonus × ${parseFloat(\\n            weights.extraWeightForSingleMissions.toFixed(3)\\n          )} = ${weights.extraWeightForSingleMissions.toFixed(3)}`\\n        );\\n      }\\n    }\\n  }\\n\\n  // Divide by tier to normalize for org cost/power\\n  const tier = org.tier || 1;\\n  let finalScore = totalScore;\\n\\n  if (tier > 1 && !ignoreTier) {\\n    const tierFactor = Math.pow(tier, weights.orgTierExponent);\\n    finalScore = totalScore / tierFactor;\\n    noMissionScore /= tierFactor;\\n    details.push(`Subtotal: ${totalScore.toFixed(3)}`);\\n    details.push(`Divided by ${tierFactor.toFixed(2)} for tier ${tier}: ${finalScore.toFixed(3)}`);\\n  }\\n\\n  return {\\n    value: finalScore,\\n    noMissionScore,\\n    details: details.join(\\\"\\\\n\\\"),\\n  };\\n}\\n\",\"oldString\":\"\\\"use client\\\";\\n\\nimport { useState, useEffect } from \\\"react\\\";\\nimport { combineEffects, ShowEffects, ShowEffectsProps } from \\\"@/components/showEffects\\\";\\nimport { AccordionContent, AccordionItem, AccordionTrigger } from \\\"@/components/ui/accordion\\\";\\nimport { SmartAccordion } from \\\"@/components/ui/smart-accordion\\\";\\nimport { Button } from \\\"@/components/ui/button\\\";\\nimport { Collapsible, CollapsibleContent, CollapsibleTrigger } from \\\"@/components/ui/collapsible\\\";\\nimport { Tooltip, TooltipContent, TooltipTrigger } from \\\"@/components/ui/tooltip\\\";\\nimport { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from \\\"@/components/ui/table\\\";\\nimport { Analysis } from \\\"@/lib/analysis\\\";\\nimport { MissionDataName, TraitDataName } from \\\"@/lib/template-types-generated\\\";\\nimport { MinusCircleIcon, PlusCircleIcon } from \\\"lucide-react\\\";\\nimport { defaultScoringWeights, loadWeightsFromStorage, ScoringWeights, ScoringWeightsDialog } from \\\"./scoringWeights\\\";\\nimport { Administration, MissionIcons, TraitIcons, UnknownIcon } from \\\"@/components/icons\\\";\\nimport { Tabs, TabsContent, TabsList, TabsTrigger } from \\\"@/components/ui/tabs\\\";\\nimport { SmartTabs } from \\\"@/components/ui/smart-tabs\\\";\\nimport { twMerge } from \\\"tailwind-merge\\\";\\n\\nfunction CouncilorTableHeader({ hasOrgs }: { hasOrgs?: boolean }) {\\n  return (\\n    <TableHeader>\\n      <TableRow>\\n        <TableHead>Name</TableHead>\\n        <TableHead>Modified Stats</TableHead>\\n        {hasOrgs && <TableHead>Org Tiers</TableHead>}\\n        <TableHead>Monthly Effects</TableHead>\\n        <TableHead>Priorities</TableHead>\\n        <TableHead>Science</TableHead>\\n        <TableHead>Missions</TableHead>\\n        <TableHead>Score</TableHead>\\n        <TableHead>NM Score</TableHead>\\n        <TableHead>CP Cap</TableHead>\\n      </TableRow>\\n    .\nError message: JSON Parse error: Unterminated string"
}
```

**Output:**
```


...125275 bytes truncated...

The tool call succeeded but the output was truncated. Full output saved to: .local\share\opencode\tool-output\tool_e0105ab82001pPBuZ1FP9WC7rz
Use the Task tool to have explore agent process this file with Grep and Read (with offset/limit). Do NOT read the full file yourself - delegate to save context.
```

---

## Assistant (Build · Gemma 4-26B-A4B (local) · 47.4s)

_Thinking:_

Okay, the output was truncated. I'll use `Read` with offset to get the content of `councilors.tsx` and then I will try to rewrite it in chunks if needed, or just use `Write` with the full content if I can construct it.

I'll try to construct the full content for `councilors.tsx` in a single `Write` call.

Wait, the `CouncilorsComponent` had a lot of logic. I'll try to extract the sections into a new component `CouncilorsSection` and refactor the rest.

Let's start by getting the full content of `councilors.tsx` using `Read`.


**Tool: read**

**Input:**
```json
{
  "filePath": "terra-invicta-assistant\\src\\app\\game\\current\\councilors.tsx",
  "limit": 2000
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
19: import { NavItem } from "./types";
20: 
21: function CouncilorTableHeader({ hasOrgs }: { hasOrgs?: boolean }) {
22:   return (
23:     <TableHeader>
24:       <TableRow>
25:         <TableHead>Name</TableHead>
26:         <TableHead>Modified Stats</TableHead>
27:         {hasOrgs && <TableHead>Org Tiers</TableHead>}
28:         <TableHead>Monthly Effects</TableHead>
29:         <TableHead>Priorities</TableHead>
30:         <TableHead>Science</TableHead>
31:         <TableHead>Missions</TableHead>
32:         <TableHead>Score</TableHead>
33:         <TableHead>NM Score</TableHead>
34:         <TableHead>CP Cap</TableHead>
35:       </TableRow>
36:     </TableHeader>
37:   );
38: }
39: 
40: function OrgTableHeader({ costHeader }: { costHeader?: string }) {
41:   return (
42:     <TableHeader>
43:       <TableRow>
44:         <TableHead>Org Name</TableHead>
45:         <TableHead>Requirements</TableHead>
46:         <TableHead>Tier</TableHead>
47:         {costHeader ? <TableHead>{costHeader}</TableHead> : <TableHead>Purchase / Transfer</TableHead>}
48:         <TableHead>Monthly</TableHead>
49:         <TableHead>Effects</TableHead>
50:         <TableHead>Score</TableHead>
51:         <TableHead>NM Score</TableHead>
52:       </TableRow>
53:     </TableHeader>
54:   );
55: }
56: 
57: function CouncilorTableRow({
58:   councilor,
59:   stats,
60:   label,
61:   hasOrgs,
62:   highlightMissionClassName,
63: }: {
64:   councilor: Analysis["playerCouncilors"][number] & { score?: ScoreResult };
65:   stats: Analysis["playerCouncilors"][number]["effectsWithOrgsAndAugments"];
66:   label: string;
67:   hasOrgs?: boolean;
68:   highlightMissionClassName?: (missionName: MissionDataName) => string | undefined;
69: }) {
70:   const admin = Math.min(25, Math.max(0, (stats.administration || 0) + (stats.Administration || 0)));
71:   const orgTiers = councilor.orgs.reduce((a, b) => a + b.tier, 0);
72:   const cpCap =
73:     Math.min(25, Math.max(0, stats.persuasion || 0) + Math.max(0, stats.Persuasion || 0)) +
74:     Math.min(25, Math.max(0, stats.command || 0) + Math.max(0, stats.Command || 0)) +
75:     Math.min(25, Math.max(0, stats.administration || 0) + Math.max(0, stats.Administration || 0));
76:   return (
77:     <TableRow key={`${councilor.id}-${label}`}>
78:       <TableCell>{label}</TableCell>
79:       <TableCell>
80:         <ShowEffects
81:           persuasion={stats.persuasion}
82:           command={stats.command}
83:           investigation={stats.investigation}
84:           espionage={stats.espionage}
85:           administration={stats.administration}
86:           science={stats.science}
87:           security={stats.security}
88:           Persuasion={stats.Persuasion}
89:           Command={stats.Command}
90:           Investigation={stats.Investigation}
91:           Espionage={stats.Espionage}
92:           Administration={stats.Administration}
93:           Science={stats.Science}
94:           Security={stats.Security}
95:           ApparentLoyalty={stats.ApparentLoyalty}
96:           Loyalty={stats.Loyalty}
97:           maxLoyalty={stats.maxLoyalty}
98:           xpModifier={stats.xpModifier}
99:           xp={stats.xp}
100:           traitTemplateNames={stats.traitTemplateNames}
101:           typeTemplateName={stats.typeTemplateName}
102:           playerIntel={stats.playerIntel}
103:           playerMaxIntel={stats.playerMaxIntel}
104:           lastRecordedLoyalty={stats.lastRecordedLoyalty}
105:           // TODO: is there a case where we should show this?
106:           // Loyalty={stats.Loyalty}
107:         />
108:       </TableCell>
109:       {hasOrgs && (
110:         <TableCell>
111:           <ShowEffects tier={stats.tier} highlightTier={orgTiers < admin} />
112:         </TableCell>
113:       )}
114:       <TableCell>
115:         <ShowEffects
116:           incomeBoost_month={stats.incomeBoost_month}
117:           incomeMoney_month={stats.incomeMoney_month}
118:           incomeInfluence_month={stats.incomeInfluence_month}
119:           incomeOps_month={stats.incomeOps_month}
120:           incomeMissionControl={stats.incomeMissionControl}
121:           incomeResearch_month={stats.incomeResearch_month}
122:           projectCapacityGranted={stats.projectCapacityGranted}
123:         />
124:       </TableCell>
125:       <TableCell>
126:         <span className="text-wrap leading-6 -my-2 inline-block">
127:           <ShowEffects
128:             economyBonus={stats.economyBonus}
129:             welfareBonus={stats.welfareBonus}
130:             environmentBonus={stats.environmentBonus}
131:             knowledgeBonus={stats.knowledgeBonus}
132:             governmentBonus={stats.governmentBonus}
133:             unityBonus={stats.unityBonus}
134:             militaryBonus={stats.militaryBonus}
135:             oppressionBonus={stats.oppressionBonus}
136:             spoilsBonus={stats.spoilsBonus}
137:             spaceDevBonus={stats.spaceDevBonus}
138:             spaceflightBonus={stats.spaceflightBonus}
139:             MCBonus={stats.MCBonus}
140:             miningBonus={stats.miningBonus}
141:           />
142:         </span>
143:       </TableCell>
144:       <TableCell>
145:         <span className="text-wrap leading-6 -my-2 inline-block">
146:           <ShowEffects councilorTechBonus={stats.councilorTechBonus} techBonuses={stats.techBonuses} />
147:         </span>
148:       </TableCell>
149:       <TableCell>
150:         <span className="text-wrap leading-6 -my-2 inline-block">
151:           <ShowEffects
152:             missionsGrantedNames={stats.missionsGrantedNames}
153:             highlightMissionClassName={highlightMissionClassName}
154:           />
155:         </span>
156:       </TableCell>
157:       {councilor.score === undefined ? null : (
158:         <>
159:           <TableCell>
160:             <Tooltip>
161:               <TooltipTrigger>{councilor.score.value?.toFixed(2)}</TooltipTrigger>
162:               <TooltipContent align="end" className="max-w-auto">
163:                 <pre className="p-2">{councilor.score.details}</pre>
164:               </TooltipContent>
165:             </Tooltip>
166:           </TableCell>
167:           <TableCell>{councilor.score.noMissionScore?.toFixed(2)}</TableCell>
168:           <TableCell>{cpCap?.toFixed(0)}</TableCell>
169:         </>
170:       )}
171:     </TableRow>
172:   );
173: }
174: 
175: function OrgTableRow({
176:   org,
177:   playerNationIds,
178:   playerTraits,
179:   highlightMissionClassName,
180:   isTakeover,
181: }: {
182:   org: Analysis["playerAvailableOrgs"][number] & {
183:     type?: string;
184:     score?: ScoreResult;
185:     councilor?: string;
186:     councilorId?: number;
187:   };
188:   playerNationIds: Set<number>;
189:   playerTraits: Set<string>;
190:   highlightMissionClassName?: (missionName: MissionDataName) => string | undefined;
191:   isTakeover?: boolean;
192: }) {
193:   const missingRequiredTraits = org.template?.requiredOwnerTraits?.filter((t) => !playerTraits.has(t)) || [];
194:   function traitIcon(trait: TraitDataName, Fallback: typeof PlusCircleIcon) {
195:     return TraitIcons[trait] || Fallback;
196:   }
197:   return (
198:     <TableRow
199:       key={org.id}
200:       className={twMerge(org.isAdminOrg ? "bg-green-100" : "", org.type === "unassigned" ? "bg-yellow-100" : "")}
201:     >
202:       <TableCell>{org.displayName}</TableCell>
203:       <TableCell>
204:         {org.template?.requiresNationality && (
205:           <span className="mr-1" title={`Required Nation: ${org.homeNationName || ""}`}>
206:             {playerNationIds.has(org.homeNationId || -1) ? (
207:               <PlusCircleIcon className="inline h-4 w-4 stroke-green-700 -mt-1 bg-transparent" />
208:             ) : (
209:               <MinusCircleIcon className="inline h-4 w-4 stroke-destructive -mt-1" />
210:             )}
211:           </span>
212:         )}
213:         {org.template?.requiredOwnerTraits && (
214:           <span className="mr-1" title={"Required Traits: " + org.template.requiredOwnerTraits.join(", ")}>
215:             {missingRequiredTraits.length === 0
216:               ? org.template.requiredOwnerTraits.map((trait, ix) => {
217:                   const Icon = traitIcon(trait, PlusCircleIcon);
218:                   return <Icon key={ix} className="inline h-4 w-4 stroke-green-700 -mt-1" />;
219:                 })
220:               : missingRequiredTraits.map((trait, ix) => {
221:                   const Icon = traitIcon(trait, MinusCircleIcon);
222:                   return <Icon key={ix} className="inline h-4 w-4 stroke-destructive -mt-1" />;
223:                 })}
224:           </span>
225:         )}
226:         {org.template?.prohibitedOwnerTraits && (
227:           <span className="mr-1" title={"Prohibited Traits: " + org.template.prohibitedOwnerTraits.join(", ")}>
228:             {org.template.prohibitedOwnerTraits.map((trait, ix) => {
229:               const Icon = traitIcon(trait, MinusCircleIcon);
230:               return <Icon key={ix} className="inline h-4 w-4 stroke-blue-700 -mt-1" />;
231:             })}
232:           </span>
233:         )}
234:       </TableCell>
235:       <TableCell>
236:         <ShowEffects tier={org.tier} />
237:       </TableCell>
238:       <TableCell>
239:         {org.type === "unassigned" && "T "}
240:         {org.type === "available" || org.type === "unassigned" ? (
241:           <ShowEffects
242:             costMoney={(org.costMoney || 0) * (org.type === "available" ? 1 : orgTransferFactor)}
243:             costInfluence={(org.costInfluence || 0) * (org.type === "available" ? 1 : orgTransferFactor)}
244:             costOps={(org.costOps || 0) * (org.type === "available" ? 1 : orgTransferFactor)}
245:             costBoost={(org.costBoost || 0) * (org.type === "available" ? 1 : orgTransferFactor)}
246:           />
247:         ) : org.type == "stealable" && isTakeover ? (
248:           (() => {
249:             const target = org as any as Analysis["playerStealableOrgs"][number];
250:             return (
251:               <>
252:                 {target.councilor ?? "Unassigned"} from {target.faction?.displayName}, Admin: {target.admin} +
253:                 takeoverDefense: {target.takeoverDefense}
254:               </>
255:             );
256:           })()
257:         ) : org.type === "used" ? (
258:           <>{org.councilor ?? "Unassigned"}</>
259:         ) : null}
260:       </TableCell>
261:       <TableCell>
262:         <ShowEffects
263:           incomeBoost_month={org.incomeBoost_month}
264:           incomeMoney_month={org.incomeMoney_month}
265:           incomeInfluence_month={org.incomeInfluence_month}
266:           incomeOps_month={org.incomeOps_month}
267:           incomeMissionControl={org.incomeMissionControl}
268:           incomeResearch_month={org.incomeResearch_month}
269:           projectCapacityGranted={org.projectCapacityGranted}
270:         />
271:       </TableCell>
272:       <TableCell>
273:         <ShowEffects
274:           persuasion={org.persuasion}
275:           command={org.command}
276:           investigation={org.investigation}
277:           espionage={org.espionage}
278:           administration={org.administration}
279:           science={org.science}
280:           security={org.security}
281:           economyBonus={org.economyBonus}
282:           welfareBonus={org.welfareBonus}
283:           environmentBonus={org.environmentBonus}
284:           knowledgeBonus={org.knowledgeBonus}
285:           governmentBonus={org.governmentBonus}
286:           unityBonus={org.unityBonus}
287:           militaryBonus={org.militaryBonus}
288:           oppressionBonus={org.oppressionBonus}
289:           spoilsBonus={org.spoilsBonus}
290:           spaceDevBonus={org.spaceDevBonus}
291:           spaceflightBonus={org.spaceflightBonus}
292:           MCBonus={org.MCBonus}
293:           miningBonus={org.miningBonus}
294:           techBonuses={org.template?.techBonuses}
295:           missionsGrantedNames={org.template?.missionsGrantedNames || []}
296:           highlightMissionClassName={highlightMissionClassName}
297:         />
298:       </TableCell>
299:       {org.score === undefined ? null : (
300:         <>
301:           <TableCell>
302:             <Tooltip>
303:               <TooltipTrigger>{org.score.value?.toFixed(2)}</TooltipTrigger>
304:               <TooltipContent align="end" className="max-w-auto">
305:                 <pre className="p-2">{org.score.details}</pre>
306:               </TooltipContent>
307:             </Tooltip>
308:           </TableCell>
309:           <TableCell>{org.score.noMissionScore?.toFixed(2)}</TableCell>
310:         </>
311:       )}
312:     </TableRow>
313:   );
314: }
315: 
316: export function getCouncilorsUi(analysis: Analysis): NavItem {
317:   const { playerMissionCounts } = analysis;
318:   const [weights, setWeights] = useState<ScoringWeights>(defaultScoringWeights);
319: 
320:   useEffect(() => {
321:     setWeights(loadWeightsFromStorage());
322:   }, []);
323: 
324:   const scoredModifiedCouncilors = scoreAndSort(
325:     analysis.playerCouncilors,
326:     weights,
327:     playerMissionCounts,
328:     getModifiedCouncilorScore
329:   );
330:   const scoredAvailableCouncilors = scoreAndSort(
331:     analysis.playerAvailableCouncilors,
332:     weights,
333:     playerMissionCounts,
334:     getBaseCouncilorScore
335:   );
336:   const scoredBaseCouncilors = scoreAndSort(
337:     analysis.playerCouncilors,
338:     weights,
339:     playerMissionCounts,
340:     getBaseCouncilorScore
341:   );
342:   const scoredOrgs = scoreAndSort(
343:     analysis.playerAvailableOrgs
344:       .map((i) => ({ type: "available", ...i }))
345:       .concat(analysis.playerUnassignedOrgs.map((i) => ({ type: "unassigned", ...i }))),
346:     weights,
347:     playerMissionCounts,
348:     getOrganizationScore,
349:     "noMissionScore" // ignore missions when sorting orgs
350:   ).toSorted((a, b) => (a.isAdminOrg === b.isAdminOrg ? 0 : a.isAdminOrg ? -1 : 1)); // admin orgs first
351:   const usedOrgs = analysis.playerCouncilors.flatMap((councilor) =>
352:     councilor.orgs.map((o) => ({ ...o, type: "used", councilor: councilor.displayName, councilorId: councilor.id }))
353:   );
354:   const scoredUsedOrgs = scoreAndSort(usedOrgs, weights, playerMissionCounts, getOrganizationScore);
355:   const scoredOwnedOrgs = scoreAndSort(
356:     analysis.playerUnassignedOrgs.map((i) => ({ type: "unassigned", ...i })).concat(usedOrgs),
357:     weights,
358:     playerMissionCounts,
359:     getOrganizationScore
360:   );
361: 
362:   const bestAvailableCouncilor = scoredAvailableCouncilors[0]?.score.value;
363:   const worstExistingCouncilor = scoredBaseCouncilors[scoredBaseCouncilors.length - 1]?.score.value;
364:   const bestAvailableOrg = scoredOrgs[0]?.score.value;
365:   const worstExistingOrg = scoredUsedOrgs[scoredUsedOrgs.length - 1]?.score.value;
366: 
367:   return {
368:     key: "councilors",
369:     label: "Councilors",
370:     subtitle: (
371:       <>
372:         ({worstExistingCouncilor?.toFixed(0)} vs. {bestAvailableCouncilor?.toFixed(0)}) / Orgs (
373:         {worstExistingOrg?.toFixed(2)} vs {bestAvailableOrg?.toFixed(2)})
374:       </>
375:     ),
376:     content: (
377:       <CouncilorsComponent
378:         {...{
379:           analysis,
380:           weights,
381:           setWeights,
382:           scoredModifiedCouncilors,
383:           scoredAvailableCouncilors,
384:           scoredBaseCouncilors,
385:           scoredOrgs,
386:           scoredOwnedOrgs,
387:         }}
388:       />
389:     ),
390:   };
391: }
392: 
393: 
394: function CouncilorsComponent({
395:   analysis,
396:   weights,
397:   setWeights,
398:   scoredModifiedCouncilors,
399:   scoredAvailableCouncilors,
400:   scoredBaseCouncilors,
401:   scoredOrgs,
402:   scoredOwnedOrgs,
403: }: {
404:   analysis: Analysis;
405:   weights: ScoringWeights;
406:   setWeights: (weights: ScoringWeights) => void;
407:   scoredModifiedCouncilors: (Analysis["playerCouncilors"][number] & { score: ScoreResult })[];
408:   scoredAvailableCouncilors: (Analysis["playerAvailableCouncilors"][number] & { score: ScoreResult })[];
409:   scoredBaseCouncilors: (Analysis["playerCouncilors"][number] & { score: ScoreResult })[];
410:   scoredOrgs: (Analysis["playerAvailableOrgs"][number] & { type: string; score: ScoreResult })[];
411:   scoredOwnedOrgs: (Analysis["playerAvailableOrgs"][number] & {
412:     type: string;
413:     score: ScoreResult;
414:     councilor?: string;
415:     councilorId?: number;
416:   })[];
417: }) {
418:   const {
419:     playerMissionCounts,
420:     playerVisibleCouncilors,
421:     playerCouncilors,
422:     playerAvailableOrgs,
423:     playerUnassignedOrgs,
424:     playerFaction,
425:     playerStealableOrgs,
426:     factionsById,
427:   } = analysis;
428:   const scoredStealableOrgs = scoreAndSort(
429:     analysis.playerStealableOrgs.map((i) => ({ type: "stealable", ...i })),
430:     weights,
431:     playerMissionCounts,
432:     getOrganizationScore,
433:     "noMissionScore"
434:   );
435: 
436:   function currentHighlightMissionClassName(missionName: MissionDataName) {
437:     // if we have exactly 2, show yellow BG, if we have 1, show red, otherwise no change to bg
438:     const count = playerMissionCounts.get(missionName) || 0;
439:     if (count === 2) {
440:       return "bg-yellow-300/50";
441:     } else if (count === 1) {
442:       return "bg-red-300/50";
443:     }
444:   }
445:   function availableHighlightMissionClassName(missionName: MissionDataName) {
446:     // if we have 1, show yellow BG, if we have 0, show green, otherwise no change to bg
447:     const count = playerMissionCounts.get(missionName) || 0;
448:     if (count === 1) {
449:       return "bg-yellow-300/50";
450:     } else if (count === 0) {
451:       return "bg-green-300/50";
452:     }
453:   }
454:   const playerNationIds = new Set(analysis.playerNationIds);
455:   const playerTraits = new Set(analysis.playerCouncilors.flatMap((i) => i.traitTemplateNames));
456:   const unusedAdmin = analysis.playerCouncilors
457:     .map(
458:       (c) =>
459:         Math.min(
460:           25,
461:           Math.max(
462:             0,
463:             (c.effectsWithOrgsAndAugments.Administration || 0) + (c.effectsWithOrgsAndAugments.administration || 0)
464:           )
465:         ) - c.orgs.reduce((a, b) => a + b.tier, 0)
466:     )
467:     .reduce((a, b) => a + b, 0);
468: 
469:   const stealableOrgsByFaction = scoredStealableOrgs.reduce((acc, org) => {
470:     const key = org.faction?.id || 0;
471:     if (!acc.has(key)) {
472:       acc.set(key, []);
473:     }
474:     acc.get(key)!.push(org);
475:     return acc;
476:   }, new Map<number, typeof scoredStealableOrgs>());
477: 
478:   type MissionSource =
479:     | {
480:         type: "councilor";
481:         councilor: Analysis["playerCouncilors"][number];
482:         factionId: number | undefined;
483:         missions: MissionDataName[];
484:       }
485:     | {
486:         type: "org";
487:         org: Analysis["playerAvailableOrgs"][number];
488:         factionId: number | undefined;
489:         missions: MissionDataName[];
490:       };
491: 
492:   const sourcesByFactionByMission = [...playerCouncilors, ...playerVisibleCouncilors]
493:     .map(
494:       (i) =>
495:         ({
496:           type: "councilor",
497:           councilor: i,
498:           factionId: i.factionId,
499:           missions: i.effectsWithOrgsAndAugments.missionsGrantedNames || [],
500:         } as MissionSource)
501:     )
502:     .concat(
503:       [...playerAvailableOrgs, ...playerUnassignedOrgs].map((i) => ({
504:         type: "org",
505:         org: i,
506:         factionId: playerFaction?.id,
507:         missions: i.template?.missionsGrantedNames || [],
508:       }))
509:     )
510:     .concat(
511:       playerStealableOrgs.map((i) => ({
512:         type: "org",
513:         org: i,
514:         factionId: i.faction?.id,
515:         missions: i.template?.missionsGrantedNames || [],
516:       }))
517:     )
518:     .reduce((acc, o) => {
519:       const key = o.factionId || 0;
520:       if (!acc.has(key)) {
521:         acc.set(key, new Map<string, MissionSource[]>());
522:       }
523:       const effectsMap = acc.get(key)!;
524:       o.missions.forEach((m) => {
525:         if (!effectsMap.has(m)) {
526:           effectsMap.set(m, []);
527:         }
528:         effectsMap.get(m)!.push(o);
529:       });
530:       return acc;
531:     }, new Map<number, Map<string, MissionSource[]>>());
532:   const factions = Array.from(sourcesByFactionByMission.keys())
533:     .map((factionId) => factionsById.get(factionId)!)
534:     .filter((f) => f)
535:     .toSorted((a, b) => {
536:       if (a.id === playerFaction.id) return -1;
537:       if (b.id === playerFaction.id) return 1;
538:       return (a.displayName || "").localeCompare(b.displayName || "");
539:     });
540: 
541:   const importantMissions = ["Assassinate"];
542: 
543:   const councilEffects = scoredModifiedCouncilors.reduce((acc, councilor) => {
544:     return combineEffects(acc, councilor.effectsWithOrgsAndAugments);
545:   }, {} as ShowEffectsProps);
546: 
547:   // TODO: would be cool to click an effect icon and sort everything by that (ie. click persuasion icon to see who/org gives most persuasion)
548:   return (
549:     <div className="space-y-2">
550:       <SmartAccordion type="single" collapsible storageKey="councilorsSections" defaultValue="existing">
551:         <AccordionItem value="existing">
552:           <AccordionTrigger>
553:             <span>
554:               Manage Existing Council ({unusedAdmin.toFixed(0)} <Administration />)
555:             </span>
556:           </AccordionTrigger>
557:           <AccordionContent>
558:             <div className="py-1">
559:               <ShowEffects
560:                 incomeBoost_month={councilEffects.incomeBoost_month}
561:                 incomeMoney_month={councilEffects.incomeMoney_month}
562:                 incomeInfluence_month={councilEffects.incomeInfluence_month}
563:                 incomeOps_month={councilEffects.incomeOps_month}
564:                 incomeMissionControl={councilEffects.incomeMissionControl}
565:                 incomeResearch_month={councilEffects.incomeResearch_month}
566:                 projectCapacityGranted={councilEffects.projectCapacityGranted}
567:               />
568:               <ShowEffects
569:                 economyBonus={councilEffects.economyBonus}
570:                 welfareBonus={councilEffects.welfareBonus}
571:                 environmentBonus={councilEffects.environmentBonus}
572:                 knowledgeBonus={councilEffects.knowledgeBonus}
573:                 governmentBonus={councilEffects.governmentBonus}
574:                 unityBonus={councilEffects.unityBonus}
575:                 militaryBonus={councilEffects.militaryBonus}
576:                 oppressionBonus={councilEffects.oppressionBonus}
577:                 spoilsBonus={councilEffects.spoilsBonus}
578:                 spaceDevBonus={councilEffects.spaceDevBonus}
579:                 spaceflightBonus={councilEffects.spaceflightBonus}
580:                 MCBonus={councilEffects.MCBonus}
581:                 miningBonus={councilEffects.miningBonus}
582:               />
583:               <ShowEffects
584:                 councilorTechBonus={councilEffects.councilorTechBonus}
585:                 techBonuses={councilEffects.techBonuses}
586:               />
587:             </div>
588:             <Table>
589:               <CouncilorTableHeader hasOrgs />
590:               <TableBody>
591:                 {scoredModifiedCouncilors.map((councilor) => (
592:                   <CouncilorTableRow
593:                     key={councilor.id}
594:                     councilor={councilor}
595:                     stats={councilor.effectsWithOrgsAndAugments}
596:                     label={councilor.displayName!}
597:                     hasOrgs
598:                     highlightMissionClassName={currentHighlightMissionClassName}
599:                   />
600:                 ))}
601:               </TableBody>
602:             </Table>
603:             <h3 className="mt-1">Available Organizations:</h3>
604:             <Table>
605:               <OrgTableHeader />
606:               <TableBody>
607:                 {scoredOrgs.map((org) => (
608:                   <OrgTableRow
609:                     key={org.id}
610:                     org={org}
611:                     playerNationIds={playerNationIds}
612:                     playerTraits={playerTraits}
613:                     highlightMissionClassName={availableHighlightMissionClassName}
614:                   />
615:                 ))}
616:               </TableBody>
617:             </Table>
618:           </AccordionContent>
619:         </AccordionItem>
620:         <AccordionItem value="new-councilors">
621:           <AccordionTrigger>Find New Councilors</AccordionTrigger>
622:           <AccordionContent>
623:             <h3>Available Councilors:</h3>
624:             <Table>
625:               <CouncilorTableHeader />
626:               <TableBody>
627:                 {scoredAvailableCouncilors.map((councilor) => (
628:                   <CouncilorTableRow
629:                     key={councilor.id}
630:                     councilor={councilor}
631:                     stats={councilor.effectsBaseAndUnaugmentedTraits}
632:                     label={councilor.displayName!}
633:                     highlightMissionClassName={availableHighlightMissionClassName}
634:                   />
635:                 ))}
636:               </TableBody>
637:             </Table>
638: 
639:             <h3 className="mt-1">Unmodified Active Councilors:</h3>
640:             <Table>
641:               <CouncilorTableHeader />
642:               <TableBody>
643:                 {scoredBaseCouncilors.map((councilor) => (
644:                   <CouncilorTableRow
645:                     key={`${councilor.id}-base`}
646:                     councilor={councilor}
647:                     stats={councilor.effectsBaseAndUnaugmentedTraits}
648:                     label={`${councilor.displayName}`}
649:                     highlightMissionClassName={currentHighlightMissionClassName}
650:                   />
651:                 ))}
652:               </TableBody>
653:             </Table>
654:           </AccordionContent>
655:         </AccordionItem>
656:         <AccordionItem value="current-orgs">
657:           <AccordionTrigger>Current Organizations</AccordionTrigger>
658:           <AccordionContent>
659:             <Table>
660:               <OrgTableHeader costHeader="Councilor" />
661:               <TableBody>
662:                 {scoredOwnedOrgs.toReversed().map((org) => (
663:                   <OrgTableRow
664:                     key={org.id}
665:                     org={org}
666:                     playerNationIds={playerNationIds}
667:                     playerTraits={playerTraits}
668:                     highlightMissionClassName={availableHighlightMissionClassName}
669:                   />
670:                 ))}
671:               </TableBody>
672:             </Table>
673:           </AccordionContent>
674:         </AccordionItem>
675:         <AccordionItem value="takeover">
676:           <AccordionTrigger>Hostile Takeover</AccordionTrigger>
677:           <AccordionContent>
678:             <SmartTabs
679:               storageKey="councilorsTakeoverTabs"
680:               defaultValue={`faction-${Array.from(stealableOrgsByFaction.keys())[0]}`}
681:             >
682:               <TabsList>
683:                 {Array.from(stealableOrgsByFaction.entries()).map(([factionId, orgs]) => (
684:                   <TabsTrigger key={factionId} value={`faction-${factionId}`}>
685:                     {orgs[0].faction?.displayName || "Unknown Faction"} ({orgs.length})
686:                   </TabsTrigger>
687:                 ))}
688:               </TabsList>
689:               {Array.from(stealableOrgsByFaction.entries()).map(([factionId, orgs]) => (
690:                 <TabsContent key={factionId} value={`faction-${factionId}`}>
691:                   <Table>
692:                     <OrgTableHeader costHeader="Takeover" />
693:                     <TableBody>
694:                       {orgs.map((org) => (
695:                         <OrgTableRow
696:                           key={org.id}
697:                           org={org}
698:                           playerNationIds={playerNationIds}
699:                           playerTraits={playerTraits}
700:                           highlightMissionClassName={availableHighlightMissionClassName}
701:                           isTakeover
702:                         />
703:                       ))}
704:                     </TableBody>
705:                   </Table>
706:                 </TabsContent>
707:               ))}
708:             </SmartTabs>
709:           </AccordionContent>
710:         </AccordionItem>
711:         <AccordionItem value="missions">
712:           <AccordionTrigger>Missions</AccordionTrigger>
713:           <AccordionContent>
714:             <SmartTabs storageKey="councilorsMissionsTabs" defaultValue={`faction-${factions[0].id}`}>
715:               <TabsList>
716:                 {factions.map((faction) => (
717:                   <TabsTrigger key={faction.id} value={`faction-${faction.id}`}>
718:                     {faction.displayName || "Unknown Faction"} ({sourcesByFactionByMission.get(faction.id)?.size || 0})
719:                     {importantMissions
720:                       .filter(
721:                         (m) =>
722:                           sourcesByFactionByMission
723:                             .get(faction.id)
724:                             ?.get(m)
725:                             ?.filter((i) => i.type === "councilor")?.length ?? 0 > 0
726:                       )
727:                       .map((m) => {
728:                         const MissionIcon = MissionIcons[m] || UnknownIcon;
729:                         return (
730:                           <span key={m} className="inline-block -mt-2">
731:                             <MissionIcon className="h-4 w-4" />
732:                           </span>
733:                         );
734:                       })}
735:                   </TabsTrigger>
736:                 ))}
737:               </TabsList>
738:               {factions.map((faction) => (
739:                 <TabsContent key={faction.id} value={`faction-${faction.id}`}>
740:                   <SmartAccordion type="single" collapsible storageKey={`councilorsMissions-${faction.id}`}>
741:                     {Array.from(
742:                       new Set([
743:                         ...importantMissions,
744:                         ...Array.from(sourcesByFactionByMission.get(faction.id)?.keys() || []),
745:                       ])
746:                     ).map((missionName) => {
747:                       const sources = sourcesByFactionByMission.get(faction.id)?.get(missionName) || [];
748:                       const MissionIcon = MissionIcons[missionName] || UnknownIcon;
749:                       return (
750:                         <AccordionItem key={missionName} value={missionName}>
751:                           <AccordionTrigger>
752:                             <span>
753:                               <MissionIcon /> {missionName} &ndash;{" "}
754:                               {sources.filter((i) => i.type === "councilor").length} Councilors &lt;-{" "}
755:                               {sources.filter((i) => i.type === "org").length} Orgs
756:                             </span>
757:                           </AccordionTrigger>
758:                           <AccordionContent>
759:                             <Table>
760:                               <OrgTableHeader costHeader="Takeover" />
761:                               <TableBody>
762:                                 {sources?.map((src) =>
763:                                   src.type === "org" ? (
764:                                     <OrgTableRow
765:                                       key={`councilor-${src.org.id}-mission-${missionName}`}
766:                                       org={src.org}
767:                                       playerNationIds={playerNationIds}
768:                                       playerTraits={playerTraits}
769:                                     />
770:                                   ) : (
771:                                     <CouncilorTableRow
772:                                       key={`org-${src.councilor.id}-mission-${missionName}`}
773:                                       councilor={src.councilor}
774:                                       stats={src.councilor.effectsWithOrgsAndAugments}
775:                                       label={src.councilor.displayName!}
776:                                     />
777:                                   )
778:                                 )}
779:                               </TableBody>
780:                             </Table>
781:                           </AccordionContent>
782:                         </AccordionItem>
783:                       );
784:                     })}
785:                   </SmartAccordion>
786:                 </TabsContent>
787:               ))}
788:             </SmartTabs>
789:           </AccordionContent>
790:         </AccordionItem>
791:         <AccordionItem value="other-councilors">
792:           <AccordionTrigger>Other Councilors</AccordionTrigger>
793:           <AccordionContent>
794:             <OtherCouncilorsByFaction {...{ analysis, weights }} />
795:           </AccordionContent>
796:         </AccordionItem>
797:       </SmartAccordion>
798: 
799:       <div className="my-4">
800:         <ScoringWeightsDialog weights={weights} onWeightsChange={setWeights} />
801:       </div>
802: 
803:       <Collapsible>
804:         <CollapsibleTrigger asChild>
805:           <Button variant="outline">Debug Data</Button>
806:         </CollapsibleTrigger>
807:         <CollapsibleContent>
808:           {/* <pre>{JSON.stringify(analysis.playerCouncilors, null, 2)}</pre>
809:           <pre>{JSON.stringify(analysis.playerAvailableCouncilors, null, 2)}</pre>
810:           <pre>{JSON.stringify(analysis.playerAvailableOrgs, null, 2)}</pre>
811:           <pre>{JSON.stringify(analysis.playerUnassignedOrgs, null, 2)}</pre> */}
812:           <pre>{JSON.stringify(analysis.playerFaction, null, 2)}</pre>
813:         </CollapsibleContent>
814:       </Collapsible>
815:     </div>
816:   );
817: }
818: 
819: function OtherCouncilorsByFaction({ analysis, weights }: { analysis: Analysis; weights: ScoringWeights }) {
820:   const { playerVisibleCouncilors, factionsById } = analysis;
821: 
822:   const scoredBaseCouncilors = scoreAndSort(
823:     playerVisibleCouncilors,
824:     weights,
825:     new Map<MissionDataName, number>(),
826:     getBaseCouncilorScore
827:   );
828: 
829:   const councilorsByFactionId = scoredBaseCouncilors.reduce((acc, councilor) => {
830:     const factionId = councilor.factionId || 0;
831:     if (!factionId) return acc;
832:     if (!acc.has(factionId)) {
833:       acc.set(factionId, []);
834:     }
835:     acc.get(factionId)!.push(councilor);
836:     return acc;
837:   }, new Map<number, Analysis["playerCouncilors"][number][]>());
838: 
839:   const factions = Array.from(councilorsByFactionId.keys())
840:     .map((i) => factionsById.get(i!)!)
841:     .filter((i) => i.id !== analysis.alienFaction.id);
842: 
843:   return (
844:     <Tabs defaultValue={`faction-${factions[0].id}`}>
845:       <TabsList>
846:         {factions
847:           .filter((i) => i.id !== analysis.alienFaction.id)
848:           .map((faction) => (
849:             <TabsTrigger key={faction.id} value={`faction-${faction.id}`}>
850:               {faction.displayName || "Unknown Faction"} ({councilorsByFactionId.get(faction.id)?.length || 0})
851:             </TabsTrigger>
852:           ))}
853:       </TabsList>
854:       {factions.map((faction) => (
855:         <TabsContent key={faction.id} value={`faction-${faction.id}`}>
856:           <Table>
857:             <CouncilorTableHeader />
858:             <TableBody>
859:               {councilorsByFactionId.get(faction.id)?.map((councilor) => (
860:                 <CouncilorTableRow
861:                   key={councilor.id}
862:                   councilor={councilor}
863:                   stats={councilor.effectsBaseAndUnaugmentedTraits}
864:                   label={councilor.displayName!}
865:                 />
866:               ))}
867:             </TableBody>
868:           </Table>
869:         </TabsContent>
870:       ))}
871:     </Tabs>
872:   );
873: }
874: 
875: function scoreAndSort<T>(
876:   items: T[],
877:   weights: ScoringWeights,
878:   haveMissions: Map<MissionDataName, number>,
879:   scoreFn: (item: T, weights: ScoringWeights, haveMissions: Map<MissionDataName, number>) => ScoreResult,
880:   scoreSort: "value" | "noMissionScore" = "value"
881: ) {
882:   const scoredItems = items.map((item) => {
883:     const scoreResult = scoreFn(item, weights, haveMissions);
884:     return { ...item, score: scoreResult };
885:   });
886:   scoredItems.sort((a, b) => b.score[scoreSort] - a.score[scoreSort]);
887:   return scoredItems;
888: }
889: 
890: function getBaseCouncilorScore(
891:   councilor: Analysis["playerCouncilors"][number],
892:   weights: ScoringWeights,
893:   haveMissions: Map<MissionDataName, number>
894: ): ScoreResult {
895:   return getScore(councilor.effectsBaseAndUnaugmentedTraits, weights, haveMissions, true);
896: }
897: 
898: function getModifiedCouncilorScore(
899:   councilor: Analysis["playerCouncilors"][number],
900:   weights: ScoringWeights,
901:   haveMissions: Map<MissionDataName, number>
902: ): ScoreResult {
903:   return getScore(councilor.effectsWithOrgsAndAugments, weights, haveMissions, true);
904: }
905: 
906: const orgTransferFactor = 0.2;
907: function getOrganizationScore(
908:   org: Analysis["playerAvailableOrgs"][number] & { type: string },
909:   weights: ScoringWeights,
910:   haveMissions: Map<MissionDataName, number>
911: ): ScoreResult {
912:   return getScore(
913:     {
914:       ...org,
915:       techBonuses: org.template?.techBonuses,
916:       missionsGrantedNames: org.template?.missionsGrantedNames || [],
917:       ...(org.type === "available"
918:         ? {}
919:         : {
920:             // already-purchased orgs seem to cost ~30% to transfer
921:             costMoney: (org.costMoney || 0) * orgTransferFactor,
922:             costInfluence: (org.costInfluence || 0) * orgTransferFactor,
923:             costOps: (org.costOps || 0) * orgTransferFactor,
924:             costBoost: (org.costBoost || 0) * orgTransferFactor,
925:           }),
926:     },
927:     weights,
928:     haveMissions
929:   );
930: }
931: 
932: interface ScoreResult {
933:   value: number;
934:   noMissionScore: number;
935:   details: string;
936: }
937: 
938: function getScore(
939:   org: ShowEffectsProps,
940:   weights: ScoringWeights,
941:   haveMissions: Map<MissionDataName, number>,
942:   ignoreTier: boolean = false
943: ): ScoreResult {
944:   let totalScore = 0;
945:   const details: string[] = [];
946: 
947:   // Helper to add score for a numeric attribute
948:   const addScore = (name: string, value: number | undefined, weight: number | undefined, noNegative?: boolean) => {
949:     let actualValue = value || 0;
950:     if (noNegative) {
951:       actualValue = Math.max(0, actualValue);
952:     }
953:     const actualWeight = weight ?? 0;
954: 
955:     // Skip if value or weight is 0/undefined/null
956:     if (!actualValue || !actualWeight) return;
957: 
958:     const contribution = actualValue * actualWeight;
959:     totalScore += contribution;
960:     details.push(
961:       `${name}: ${parseFloat(actualValue.toFixed(2))} × ${parseFloat(actualWeight.toFixed(3))} = ${contribution.toFixed(
962:         3
963:       )}`
964:     );
965:   };
966: 
967:   // Councilor attributes
968:   addScore("persuasion", org.persuasion, weights.persuasion, true);
969:   addScore("command", org.command, weights.command, true);
970:   addScore("investigation", org.investigation, weights.investigation, true);
971:   addScore("espionage", org.espionage, weights.espionage, true);
972:   addScore("administration", org.administration, weights.administration, true);
973:   addScore("science", org.science, weights.science, true);
974:   addScore("security", org.security, weights.security, true);
975:   addScore("Persuasion", org.Persuasion, weights.persuasion, true);
976:   addScore("Command", org.Command, weights.command, true);
977:   addScore("Investigation", org.Investigation, weights.investigation, true);
978:   addScore("Espionage", org.Espionage, weights.espionage, true);
979:   addScore("Administration", org.Administration, weights.administration, true);
980:   addScore("Science", org.Science, weights.science, true);
981:   addScore("Security", org.Security, weights.security, true);
982:   addScore("xpModifier", org.xpModifier, weights.xpModifier);
983:   addScore("xp", org.xp, weights.xp);
984: 
985:   // Monthly income/costs
986:   addScore("incomeBoost_month", org.incomeBoost_month, weights.incomeBoost_month);
987:   addScore("incomeMoney_month", org.incomeMoney_month, weights.incomeMoney_month);
988:   addScore("incomeInfluence_month", org.incomeInfluence_month, weights.incomeInfluence_month);
989:   addScore("incomeOps_month", org.incomeOps_month, weights.incomeOps_month);
990:   addScore("incomeMissionControl", org.incomeMissionControl, weights.incomeMissionControl);
991:   addScore("incomeResearch_month", org.incomeResearch_month, weights.incomeResearch_month);
992:   addScore("projectCapacityGranted", org.projectCapacityGranted, weights.projectCapacityGranted);
993: 
994:   // Purchase costs
995:   addScore("costMoney", org.costMoney, weights.costMoney);
996:   addScore("costInfluence", org.costInfluence, weights.costInfluence);
997:   addScore("costOps", org.costOps, weights.costOps);
998:   addScore("costBoost", org.costBoost, weights.costBoost);
999: 
1000:   // Priority bonuses
1001:   addScore("economyBonus", org.economyBonus, weights.economyBonus);
1002:   addScore("welfareBonus", org.welfareBonus, weights.welfareBonus);
1003:   addScore("environmentBonus", org.environmentBonus, weights.environmentBonus);
1004:   addScore("knowledgeBonus", org.knowledgeBonus, weights.knowledgeBonus);
1005:   addScore("governmentBonus", org.governmentBonus, weights.governmentBonus);
1006:   addScore("unityBonus", org.unityBonus, weights.unityBonus);
1007:   addScore("militaryBonus", org.militaryBonus, weights.militaryBonus);
1008:   addScore("oppressionBonus", org.oppressionBonus, weights.oppressionBonus);
1009:   addScore("spoilsBonus", org.spoilsBonus, weights.spoilsBonus);
1010:   addScore("spaceDevBonus", org.spaceDevBonus, weights.spaceDevBonus);
1011:   addScore("spaceflightBonus", org.spaceflightBonus, weights.spaceflightBonus);
1012:   addScore("MCBonus", org.MCBonus, weights.MCBonus);
1013:   addScore("miningBonus", org.miningBonus, weights.miningBonus);
1014: 
1015:   // Tech bonuses from councilor/traits
1016:   if (weights.councilorTechBonus && org?.councilorTechBonus) {
1017:     for (const { category, bonus } of org.councilorTechBonus) {
1018:       const weight = weights.councilorTechBonus[category];
1019:       addScore(`councilorTechBonus[${category}]`, bonus, weight);
1020:     }
1021:   }
1022: 
1023:   // Tech bonuses from orgs
1024:   if (weights.techBonuses && org?.techBonuses) {
1025:     for (const { category, bonus } of org.techBonuses) {
1026:       const weight = weights.techBonuses[category];
1027:       addScore(`techBonus[${category}]`, bonus, weight);
1028:     }
1029:   }
1030: 
1031:   let noMissionScore = totalScore;
1032: 
1033:   // Missions granted
1034:   if (weights.missions && org?.missionsGrantedNames) {
1035:     for (const missionName of org.missionsGrantedNames) {
1036:       const weight = weights.missions[missionName];
1037:       addScore(`mission[${missionName}]`, 1, weight);
1038: 
1039:       // Extra weight for missions we don't have yet or only have one councilor for
1040:       if (weights.extraWeightForMissingMissions && (haveMissions.get(missionName) || 0) === 0) {
1041:         totalScore += weights.extraWeightForMissingMissions;
1042:         details.push(
1043:           `mission[${missionName}]: missing bonus × ${parseFloat(
1044:             weights.extraWeightForMissingMissions.toFixed(3)
1045:           )} = ${weights.extraWeightForMissingMissions.toFixed(3)}`
1046:         );
1047:       }
1048:       if (weights.extraWeightForSingleMissions && (haveMissions.get(missionName) || 0) === 1) {
1049:         totalScore += weights.extraWeightForSingleMissions;
1050:         details.push(
1051:           `mission[${missionName}]: single bonus × ${parseFloat(
1052:             weights.extraWeightForSingleMissions.toFixed(3)
1053:           )} = ${weights.extraWeightForSingleMissions.toFixed(3)}`
1054:         );
1055:       }
1056:     }
1057:   }
1058: 
1059:   // Divide by tier to normalize for org cost/power
1060:   const tier = org.tier || 1;
1061:   let finalScore = totalScore;
1062: 
1063:   if (tier > 1 && !ignoreTier) {
1064:     const tierFactor = Math.pow(tier, weights.orgTierExponent);
1065:     finalScore = totalScore / tierFactor;
1066:     noMissionScore /= tierFactor;
1067:     details.push(`Subtotal: ${totalScore.toFixed(3)}`);
1068:     details.push(`Divided by ${tierFactor.toFixed(2)} for tier ${tier}: ${finalScore.toFixed(3)}`);
1069:   }
1070: 
1071:   return {
1072:     value: finalScore,
1073:     noMissionScore,
1074:     details: details.join("\n"),
1075:   };
1076: }

(End of file - total 1076 lines)
</content>
```

---

## Assistant (Build · Gemma 4-26B-A4B (local) · 1050.3s)

_Thinking:_

I'll rewrite `src/app/game/current/councilors.tsx` to include `NavItem` and the refactored `CouncilorsSection` and `getCouncilorsUi`.

I'll also need to make sure I handle the `weights` state correctly. I'll pass `weights` and `setWeights` to `getCouncilorsUi`.

Wait, I'll also need to refactor `CouncilorsComponent` into `CouncilorsSection`.

Here's the plan for `councilors.tsx`:
1. Import `NavItem` from `./types`.
2. Refactor `getCouncilorsUi` to return `NavItem`.
3. Refactor `CouncilorsComponent` to `CouncilorsSection` which accepts a `section` prop.
4. The `section` prop will determine which part of the councilors UI to render.

Wait, I'll also need to move the `ScoringWeightsDialog` and `Collapsible` (debug data) to the main `RenderGameComponent` or make them part of the `CouncilorsSection`. I'll put them in `CouncilorsSection` for now to keep it self-contained.

Actually, the user wants a tree navigation. So the `getCouncilorsUi` should return a tree of `NavItem`s.

Let's prepare the content for `src/app/game/current/councilors.tsx`.



**Tool: invalid**

**Input:**
```json
{
  "tool": "write",
  "error": "Invalid input for tool write: JSON parsing failed: Text: {\"content\":\"\\\"use client\\\";\\n\\nimport { useState, useEffect } from \\\"react\\\";\\nimport { combineEffects, ShowEffects, ShowEffectsProps } from \\\"@/components/showEffects\\\";\\nimport { AccordionContent, AccordionItem, AccordionTrigger } from \\\"@/components/ui/accordion\\\";\\nimport { Button } from \\\"@/components/ui/button\\\";\\nimport { Collapsible, CollapsibleContent, CollapsibleTrigger } from \\\"@/components/ui/collapsible\\\";\\nimport { Tooltip, TooltipContent, TooltipTrigger } from \\\"@/components/ui/tooltip\\\";\\nimport { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from \\\"@/components/ui/table\\\";\\nimport { Analysis } from \\\"@/lib/analysis\\\";\\nimport { MissionDataName, TraitDataName } from \\\"@/lib/template-types-generated\\\";\\nimport { MinusCircleIcon, PlusCircleIcon } from \\\"lucide-react\\\";\\nimport { defaultScoringWeights, loadWeightsFromStorage, ScoringWeights, ScoringWeightsDialog } from \\\"./scoringWeights\\\";\\nimport { Administration, MissionIcons, TraitIcons, UnknownIcon } from \\\"@/components/icons\\\";\\nimport { Tabs, TabsContent, TabsList, TabsTrigger } from \\\"@/components/ui/tabs\\\";\\nimport { SmartTabs } from \\\"@/components/ui/smart-tabs\\\";\\nimport { twMerge } from \\\"tailwind-merge\\\";\\nimport { NavItem } from \\\"./types\\\";\\n\\nfunction CouncilorTableHeader({ hasOrgs }: { hasOrgs?: boolean }) {\\n  return (\\n    <TableHeader>\\n      <TableRow>\\n        <TableHead>Name</TableHead>\\n        <TableHead>Modified Stats</TableHead>\\n        {hasOrgs && <TableHead>Org Tiers</TableHead>}\\n        <TableHead>Monthly Effects</TableHead>\\n        <TableHead>Priorities</TableHead>\\n        <TableHead>Science</TableHead>\\n        <TableHead>Missions</TableHead>\\n        <TableHead>Score</TableHead>\\n        <TableHead>NM Score</TableHead>\\n        <TableHead>CP Cap</TableHead>\\n      </TableRow>\\n    </TableHeader>\\n  );\\n}\\n\\nfunction OrgTableHeader({ costHeader }: { costHeader?: string }) {\\n  return (\\n    <TableHeader>\\n      <TableRow>\\n        <TableHead>Org Name</TableHead>\\n        <TableHead>Requirements</TableHead>\\n        <TableHead>Tier</TableHead>\\n        {costHeader ? <TableHead>{costHeader}</TableHead> : <TableHead>Purchase / Transfer</TableHead>}\\n        <TableHead>Monthly</TableHead>\\n        <TableHead>Effects</TableHead>\\n        <TableHead>Score</TableHead>\\n        <TableHead>NM Score</TableHead>\\n      </TableRow>\\n    </TableHeader>\\n  );\\n}\\n\\nfunction CouncilorTableRow({\\n  councilor,\\n  stats,\\n  label,\\n  hasOrgs,\\n  highlightMissionClassName,\\n}: {\\n  councilor: Analysis[\\\"playerCouncilors\\\"][number] & { score?: ScoreResult };\\n  stats: Analysis[\\\"playerCouncilors\\\"][number][\\\"effectsWithOrgsAndAugments\\\"];\\n  label: string;\\n  hasOrgs?: boolean;\\n  highlightMissionClassName?: (missionName: MissionDataName) => string | undefined;\\n}) {\\n  const admin = Math.min(25, Math.max(0, (stats.administration || 0) + (stats.Administration || 0)));\\n  const orgTiers = councilor.orgs.reduce((a, b) => a + b.tier, 0);\\n  const cpCap =\\n    Math.min(25, Math.max(0, stats.persuasion || 0) + Math.max(0, stats.Persuasion || 0)) +\\n    Math.min(25, Math.max(0, stats.command || 0) + Math.max(0, stats.Command || 0)) +\\n    Math.min(25, Math.max(0, stats.administration || 0) + Math.max(0, stats.Administration || 0));\\n  return (\\n    <TableRow key={`${councilor.id}-${label}`}>\\n      <TableCell>{label}</TableCell>\\n      <TableCell>\\n        <ShowEffects\\n          persuasion={stats.persuasion}\\n          command={stats.command}\\n          investigation={stats.investigation}\\n          espionage={stats.espionage}\\n          administration={stats.administration}\\n          science={stats.science}\\n          security={stats.security}\\n          Persuasion={stats.Persuasion}\\n          Command={stats.Command}\\n          Investigation={stats.Investigation}\\n          Espionage={stats.Espionage}\\n          Administration={stats.Administration}\\n          Science={stats.Science}\\n          Security={stats.Security}\\n          ApparentLoyalty={stats.ApparentLoyalty}\\n          Loyalty={stats.Loyalty}\\n          maxLoyalty={stats.maxLoyalty}\\n          xpModifier={stats.xpModifier}\\n          xp={stats.xp}\\n          traitTemplateNames={stats.traitTemplateNames}\\n          typeTemplateName={stats.typeTemplateName}\\n          playerIntel={stats.playerIntel}\\n          playerMaxIntel={stats.playerMaxIntel}\\n          lastRecordedLoyalty={stats.lastRecordedLoyalty}\\n        />\\n      </TableCell>\\n      {hasOrgs && (\\n        <TableCell>\\n          <ShowEffects tier={stats.tier} highlightTier={orgTiers < admin} />\\n        </TableCell>\\n      )}\\n      <TableCell>\\n        <ShowEffects\\n          incomeBoost_month={stats.incomeBoost_month}\\n          incomeMoney_month={stats.incomeMoney_month}\\n          incomeInfluence_month={stats.incomeInfluence_month}\\n          incomeOps_month={stats.incomeOps_month}\\n          incomeMissionControl={stats.incomeMissionControl}\\n          incomeResearch_month={stats.incomeResearch_month}\\n          projectCapacityGranted={stats.projectCapacityGranted}\\n        />\\n      </TableCell>\\n      <TableCell>\\n        <span className=\\\"text-wrap leading-6 -my-2 inline-block\\\">\\n          <ShowEffects\\n            economyBonus={stats.economyBonus}\\n            welfareBonus={stats.welfareBonus}\\n            environmentBonus={stats.environmentBonus}\\n            knowledgeBonus={stats.knowledgeBonus}\\n            governmentBonus={stats.governmentBonus}\\n            unityBonus={stats.unityBonus}\\n            militaryBonus={stats.militaryBonus}\\n            oppressionBonus={stats.oppressionBonus}\\n            spoilsBonus={stats.spoilsBonus}\\n            spaceDevBonus={stats.spaceDevBonus}\\n            spaceflightBonus={stats.spaceflightBonus}\\n            MCBonus={stats.MCBonus}\\n            miningBonus={stats.miningBonus}\\n          />\\n        </span >\\n      </TableCell>\\n      <TableCell>\\n        <span className=\\\"text-wrap leading-6 -my-2 inline-block\\\">\\n          <ShowEffects\\n            councilorTechBonus={stats.councilorTechBonus}\\n            techBonuses={stats.techBonuses}\\n          />\\n        </span >\\n      </TableCell>\\n      <TableCell>\\n        <span className=\\\"text-wrap leading-6 -my-2 inline-block\\\">\\n          <ShowEffects\\n            missionsGrantedNames={stats.missionsGrantedNames}\\n            highlightMissionClassName={highlightMissionClassName}\\n          />\\n        </span >\\n      </TableCell>\\n      {councilor.score === undefined ? null : (\\n        <>\\n          <TableCell>\\n            <Tooltip>\\n              <TooltipTrigger>{councilor.score.value?.toFixed(2)}</TooltipTrigger>\\n              <TooltipContent align=\\\"end\\\" className=\\\"max-w-auto\\\">\\n                <pre className=\\\"p-2\\\">{councilor.score.details}</pre>\\n              </TooltipContent>\\n            </Tooltip>\\n          </TableCell>\\n          <TableCell>{councilor.score.noMissionScore?.toFixed(2)}</TableCell>\\n          <TableCell>{cpCap?.toFixed(0)}</TableCell>\\n        </>\\n      )}\\n    </TableRow>\\n  );\\n}\\n\\nfunction OrgTableRow({\\n  org,\\n  playerNationIds,\\n  playerTraits,\\n  highlightMissionClassName,\\n  isTakeover,\\n}: {\\n  org: Analysis[\\\"playerAvailableOrgs\\\"][number] & {\\n    type?: string;\\n    score?: ScoreResult;\\n    councilor?: string;\\n    councilorId?: number;\\n  };\\n  playerNationIds: Set<number>;\\n  playerTraits: Set<string>;\\n  highlightMissionClassName?: (missionName: MissionDataName) => string | undefined;\\n  isTakeover?: boolean;\\n}) {\\n  const missingRequiredTraits = org.template?.requiredOwnerTraits?.filter((t) => !playerTraits.has(t)) || [];\\n  function traitIcon(trait: TraitDataName, Fallback: typeof PlusCircleIcon) {\\n    return TraitIcons[trait] || Fallback;\\n  }\\n  return (\\n    <TableRow\\n      key={org.id}\\n      className={twMerge(org.isAdminOrg ? \\\"bg-green-100\\\" : \\\"\\\", org.type === \\\"unassigned\\\" ? \\\"bg-yellow-100\\\" : \\\"\\\")}\\n    >\\n      <TableCell>{org.displayName}</TableCell>\\n      <TableCell>\\n        {org.template?.requiresNationality && (\\n          <span className=\\\"mr-1\\\" title={`Required Nation: ${org.homeNationName || \\\"\\\"}`}>\\n            {playerNationIds.has(org.homeNationId || -1) ? (\\n              <PlusCircleIcon className=\\\"inline h-4 w-4 stroke-green-700 -mt-1 bg-transparent\\\" />\\n            ) : (\\n              <MinusCircleIcon className=\\\"inline h-4 w-4 stroke-destructive -mt-1\\\" />\\n            )}\\n          </span >\\n        )}\\n        {org.template?.requiredOwnerTraits && (\\n          <span className=\\\"mr-1\\\" title={\\\"Required Traits: \\\" + org.template.requiredOwnerTraits.join(\\\", \\\")}>\\n            {missingRequiredTraits.length === 0\\n              ? org.template.requiredOwnerTraits.map((trait, ix) => {\\n                  const Icon = traitIcon(trait, PlusCircleIcon);\\n                  return <Icon key={ix} className=\\\"inline h-4 w-4 stroke-green-700 -mt-1\\\" />;\\n                })\\n              : missingRequiredTraits.map((trait, ix) => {\\n                  const Icon = traitIcon(trait, MinusCircleIcon);\\n                  return <Icon key={ix} className=\\\"inline h-4 w-4 stroke-destructive -mt-1\\\" />;\\n                })}\\n          </span >\\n        )}\\n        {org.template?.prohibitedOwnerTraits && (\\n          <span className=\\\\\\\"mr-1\\\\\\\" title={\\\\\\\"Prohibited Traits: \\\\\\\" + org.template.prohibitedOwnerTraits.join(\\\\\\\", \\\\\\\")}>\\n            {org.template.prohibitedOwnerTraits.map((trait, ix) => {\\n              const Icon = traitIcon(trait, MinusCircleIcon);\\n              return <Icon key={ix} className=\\\\\\\"inline h-4 w-4 stroke-blue-700 -mt-1\\\\\\\" />;\\n            })}\\n          </span >\\n        )}\\n      </TableCell>\\n      <TableCell>\\n        <ShowEffects tier={org.tier} />\\n      </TableCell>\\n      <TableCell>\\n        {org.type === \\\"unassigned\\\" && \\\"T \\\"}\\n        {org.type === \\\"available\\\" || org.type === \\\"unassigned\\\" ? (\\n          <ShowEffects\\n            costMoney={(org.costMoney || 0) * (org.type === \\\"available\\\" ? 1 : orgTransferFactor)}\\n            costInfluence={(org.costInfluence || 0) * (org.type === \\\"available\\\" ? 1 : orgTransferFactor)}\\n            costOps={(org.costOps || 0) * (org.type === \\\"available\\\" ? 1 : orgTransferFactor)}\\n            costBoost={(org.costBoost || 0) * (org.type === \\\"available\\\" ? 1 : orgTransferFactor)}\\n          />\\n        ) : org.type == \\\"stealable\\\" && isTakeover ? (\\n          (() => {\\n            const target = org as any as Analysis[\\\"playerStealableOrgs\\\"][number];\\n            return (\\n              <>\\n                {target.councilor ?? \\\"Unassigned\\\"} from {target.faction?.displayName}, Admin: {target.admin} +\\n                takeoverDefense: {target.takeoverDefense}\\n              </>\\n            );\\n          })()\\n        ) : org.type === \\\"used\\\" ? (\\n          <>{org.councilor ?? \\\"Unassigned\\\"}</>\\n        ) : null}\\n      </TableCell>\\n      <TableCell>\\n        <ShowEffects\\n          incomeBoost_month={org.incomeBoost_month}\\n          incomeMoney_month={org.incomeMoney_month}\\n          incomeInfluence_month={org.incomeInfluence_month}\\n          incomeOps_month={org.incomeOps_month}\\n          incomeMissionControl={org.incomeMissionControl}\\n          incomeResearch_month={org.incomeResearch_month}\\n          projectCapacityGranted={org.projectCapacityGranted}\\n        />\\n      </TableCell>\\n      <TableCell>\\n        <ShowEffects\\n          persuasion={org.persuasion}\\n          command={org.command}\\n          investigation={org.investigation}\\n          espionage={org.espionage}\\n          administration={org.administration}\\n          science={org.science}\\n          security={org.security}\\n          economyBonus={org.economyBonus}\\n          welfareBonus={org.welfareBonus}\\n          environmentBonus={org.environmentBonus}\\n          knowledgeBonus={org.knowledgeBonus}\\n          governmentBonus={org.governmentBonus}\\n          unityBonus={org.unityBonus}\\n          militaryBonus={org.militaryBonus}\\n          oppressionBonus={org.oppressionBonus}\\n          spoilsBonus={org.spoilsBonus}\\n          spaceDevBonus={org.spaceDevBonus}\\n          spaceflightBonus={org.spaceflightBonus}\\n          MCBonus={org.MCBonus}\\n          miningBonus={org.miningBonus}\\n          techBonues={org.template?.techBonuses}\\n          missionsGrantedNames={org.template?.missionsGrantedNames || []}\\n          highlightMissionClassName={highlightMissionClassName}\\n        />\\n      </TableCell>\\n      {org.score === undefined ? null : (\\n        <>\\n          <TableCell>\\n            <Tooltip>\\n              <TooltipTrigger>{org.score.value?.toFixed(2)}</TooltipTrigger>\\n              <TooltipContent align=\\\"end\\\" className=\\\"max-w-auto\\\">\\n                <pre className=\\\"p-2\\\">{org.score.details}</pre>\\n              </TooltipContent>\\n            </Tooltip>\\n          </TableCell>\\n          <TableCell>{org.score.noMissionScore?.toFixed(2)}</TableCell>\\n        </>\\n      )}\\n    </TableRow>\\n  );\\n}\\n\\nexport function getCouncilorsUi(analysis: Analysis, weights: ScoringWeights, setWeights: (weights: ScoringWeights) => void): NavItem {\\n  const { playerMissionCounts } = analysis;\\n\\n  const scoredModifiedCouncilors = scoreAndSort(\\n    analysis.playerCouncilors,\\n    weights,\\n    playerMissionCounts,\\n    getModifiedCouncilorScore\\n  );\\n  const scoredAvailableCouncilors = scoreAndSort(\\n    analysis.playerAvailableCouncilors,\\n    weights,\\n    playerMissionCounts,\\n    getBaseCouncilorScore\\n  );\\n  const scoredBaseCouncilors = scoreAndSort(\\n    analysis.playerCouncilors,\\n    weights,\\n    playerMissionCounts,\\n    getBaseCouncilorScore\\n  );\\n  const scoredOrgs = scoreAndSort(\\n    analysis.playerAvailableOrgs\\n      .map((i) => ({ type: \\\"available\\\", ...i }))\\n      .concat(analysis.playerUnassignedOrgs.map((i) => ({ type: \\\"unassigned\\\", ...i }))),\\n    weights,\\n    playerMissionCounts,\\n    getOrganizationScore,\\n    \\\"noMissionScore\\\" // ignore missions when sorting orgs\\n  ).toSorted((a, b) => (a.isAdminOrg === b.isAdminOrg ? 0 : a.isAdminOrg ? -1 : 1)); // admin orgs first\\n  const usedOrgs = analysis.playerCouncilors.flatMap((councilor) =>\\n    councilor.orgs.map((o) => ({ ...o, type: \\\"used\\\", councilor: councilor.displayName, councilorId: councilor.id }))\\n  );\\n  const scoredUsedOrgs = scoreAndSort(usedOrgs, weights, playerMissionCounts, getOrganizationScore);\\n  const scoredOwnedOrgs = scoreAndSort(\\n    analysis.playerUnassignedOrgs.map((i) => ({ type: \\\"unassigned\\\", ...i })).concat(usedOrgs),\\n    weights,\\n    playerMissionCounts,\\n    getOrganizationScore\\n  );\\n\\n  const bestAvailableCouncilor = scoredAvailableCouncilors[0]?.score.value;\\n  const worstExistingCouncilor = scoredBaseCouncilors[scoredBaseCouncilors.length - 1]?.score.value;\\n  const bestAvailableOrg = scoredOrgs[0]?.score.value;\\n  const worstExistingOrg = scoredUsedOrgs[scoredUsedOrgs.length - 1]?.score.value;\\n\\n  return {\\n    key: \\\"councilors\\\",\\n    label: \\\"Councilors\\\",\\n    subtitle: (\\n      <>\\n        ({worstExistingCouncilor?.toFixed(0)} vs. {bestAvailableCouncilor?.toFixed(0)}) / Orgs (\\n        {worstExistingOrg?.toFixed(2)} vs {bestAvailableOrg?.toFixed(2)})\\n      </>\\n    ),\\n    children: [\\n      {\\n        key: \\\"councilors-existing\\\",\\n        label: \\\"Existing Council\\\",\\n        content: (\\n          <CouncilorsSection\\n            {...{\\n              analysis,\\n              weights,\\n              setWeights,\\n              scoredModifiedCouncilors,\\n              scoredAvailableCouncilors,\\n              scoredBaseCouncilors,\\n              scoredOrgs,\\n              scoredOwnedOrgs,\\n            }}\\n            section=\\\"existing\\\"\\n          />\\n        ),\\n      },\\n      {\\n        key: \\\"councilors-new-councilors\\\",\\n        label: \\\"Find new\\\",\\n        content: (\\n          <CouncilorsSection\\n            {...{\\n              analysis,\\n              weights,\\n              setWeights,\\n              scoredModifiedCouncilors,\\n              scoredAvailableCouncilors,\\n              scoredBaseCouncilors,\\n              scoredOrgs,\\n              scoredOwnedOrgs,\\n            }}\\n            section=\\\"new-councilors\\\"\\n          />\\n        ),\\n      },\\n      {\\n        key: \\\"councilors-current-orgs\\\",\\n        label: \\\"Current Organizations\\\",\\n        content: (\\n          <CouncilorsSection\\n            {...{\\n              analysis,\\n              weights,\\n              setWeights,\\n              scoredModifiedCouncilors,\\n              scoredAvailableCouncilors,\\n              scoredBaseCouncilors,\\n              scoredOrgs,\\n              scoredOwnedOrgs,\\n            }}\\n            section=\\\"current-orgs\\\"\\n          />\\n        ),\\n      },\\n      {\\n        key: \\\"councilors-takeover\\\",\\n        label: \\\"Hostile Takeover\\\",\\n        content: (\\n          <CouncilorsSection\\n            {...{\\n              analysis,\\n              weights,\\n              setWeights,\\n              scoredModifiedCouncilors,\\n              scoredAvailableCouncilors,\\n              scoredBaseCouncilors,\\n              scoredOrgs,\\n              scoredOwnedOrgs,\\n            }}\\n            section=\\\"takeover\\\"\\n          />\\n        ),\\n      },\\n      {\\n        key: \\\"councilors-missions\\\",\\n        label: \\\"Missions\\\",\\n        content: (\\n          <CouncilorsSection\\n            {...{\\n              analysis,\\n              weights,\\n              setWeights,\\n              scoredModifiedCouncilors,\\n              scoredAvailableCouncilors,\\n              scoredBaseCouncilors,\\n              scoredOrgs,\\n              scoredOwnedOrgs,\\n            }}\\n            section=\\\"missions\\\"\\n          />\\n        ),\\n      },\\n      {\\n        key: \\\"councilors-other-councilors\\\",\\n        label: \\\"Other Councilors\\\",\\n        content: (\\n          <CouncilorsSection\\n            {...{\\n              analysis,\\n              weights,\\n              setWeights,\\n              scoredModifiedCouncilors,\\n              scoredAvailableCouncilors,\\n              scoredBaseCouncilors,\\n              scoredOrgs,\\n              scoredOwnedOrgs,\\n            }}\\n            section=\\\"other-councilors\\\"\\n          />\\n        ),\\n      },\\n    ],\\n  };\\n}\\n\\nfunction CouncilorsSection({\\n  analysis,\\n  weights,\\n  setWeights,\\n  scoredModifiedCouncilors,\\n  scoredAvailableCouncilors,\\n  scoredBaseCouncilors,\\n  scoredOrgs,\\n  scoredOwnedOrgs,\\n  section,\\n}: {\\n  analysis: Analysis;\\n  weights: ScoringWeights;\\n  setWeights: (weights: ScoringWeights) => void;\\n  scoredModifiedCouncilors: (Analysis[\\\"playerCouncilors\\\"][number] & { score: ScoreResult })[];\\n  scoredAvailableCouncilors: (Analysis[\\\"playerAvailableCouncilors\\\"][number] & { score: ScoreResult })[];\\n  scoredBaseCouncilors: (Analysis[\\\"playerCouncilors\\\"][number] & { score: ScoreResult })[];\\n  scoredOrgs: (Analysis[\\\"playerAvailableOrgs\\\"][number] & { type: string; score: ScoreResult })[];\\n  scoredOwnedOrgs: (Analysis[\\\"playerAvailableOrgs\\\"][number] & {\\n    type: string;\\n    score: ScoreResult;\\n    councilor?: string;\\n    councilorId?: number;\\n  })[];\\n  section: \\\"existing\\\" | \\\"new-councilors\\\" | \\\"current-orgs\\\" | \\\"takeover\\\" | \\\"missions\\\" | \\\"other-councilors\\\";\\n}) {\\n  const {\\n    playerMissionCounts,\\n    playerVisibleCouncilors,\\n    playerCouncilors,\\n    playerAvailableOrgs,\\n    playerUnassignedOrgs,\\n    playerFaction,\\n    playerStealableOrgs,\\n    factionsById,\\n  } = analysis;\\n  const scoredStealableOrgs = scoreAndSort(\\n    analysis.playerStealableOrgs.map((i) => ({ type: \\\"stealable\\\", ...i })),\\n    weights,\\n    playerMissionCounts,\\n    getOrganizationScore,\\n    \\\"noMissionScore\\\"\\n  );\\n\\n  function currentHighlightMissionClassName(missionName: MissionDataName) {\\n    const count = playerMissionCounts.get(missionName) || 0;\\n    if (count === 2) {\\n      return \\\"bg-yellow-300/50\\\";\\n    } else if (count === 1) {\\n      return \\\"bg-red-300/50\\\";\\n    }\\n  }\\n  function availableHighlightMissionClassName(missionName: MissionDataName) {\\n    const count = playerMissionCounts.get(missionName) || 0;\\n    if (count === 1) {\\n      return \\\"bg-yellow-300/50\\\";\\n    } else if (count === 0) {\\n      return \\\"bg-green-300/50\\\";\\n    }\\n  }\\n  const playerNationIds = new Set(analysis.playerNationIds);\\n  const playerTraits = new Set(analysis.playerCouncilors.flatMap((i) => i.traitTemplateNames));\\n  const unusedAdmin = analysis.playerCouncilors\\n    .map(\\n      (c) =>\\n        Math.min(\\n          25,\\n          Math.max(\\n            0,\\n            (c.effectsWithOrgsAndAugments.Administration || 0) + (c.effectsWithOrgsAndAugments.administration || 0)\\n          )\\n        ) - c.orgs.reduce((a, b) => a + b.tier, 0)\\n    )\\n    .reduce((a, b) => a + b, 0);\\n\\n  const stealableOrgsByFaction = scoredStealableOrgs.reduce((acc, org) => {\\n    const key = org.faction?.id || 0;\\n    if (!acc.has(key)) {\\n      acc.set(key, []);\\n    }\\n    acc.get(key)!.push(org);\\n    return acc;\\n  }, new Map<number, typeof scoredStealableOrgs>());\\n\\n  type MissionSource =\\n    | {\\n        type: \\\"councilor\\\";\\n        councilor: Analysis[\\\"playerCouncilors\\\"][number];\\n        factionId: number | undefined;\\n        missions: MissionDataName[];\\n      }\\n    | {\\n        type: \\\"org\\\";\\n        org: Analysis[\\\"playerAvailableOrgs\\\"][number];\\n        factionId: number | undefined;\\n        missions: MissionDataName[];\\n      };\\n\\n  const sourcesByFactionByMission = [...playerCouncilors, ...playerVisibleCouncilors]\\n    .map(\\n      (i) =>\\n        ({\\n          type: \\\\\\\"councilor\\\\\\\",\\n          councilor: i,\\n          factionId: i.factionId,\\n          missions: i.effectsWithOrgsAndAugments.missionsGrantedNames || [],\\n        } as MissionSource)\\n    )\\n    .concat(\\n      [...playerAvailableOrgs, ...playerUnassignedOrgs].map((i) => ({\\n        type: \\\\\\\"org\\\\\\\",\\n        org: i,\\n        factionId: playerFaction?.id,\\n        missions: i.template?.missionsGrantedNames || [],\\n      }))\\n    )\\n    .concat(\\n      playerStealableOrgs.map((i) => ({\\n        type: \\\\\\\"org\\\\\\\",\\n        org: i,\\n        factionId: i.faction?.id,\\n        missions: i.template?.missionsGrantedNames || [],\\n      }))\\n    )\\n    .reduce((acc, o) => {\\n      const key = o.factionId || 0;\\n      if (!acc.has(key)) {\\n        acc.set(key, new Map<string, MissionSource[]>());\\n      }\\n      const effectsMap = acc.get(key)!;\\n      o.missions.forEach((m) => {\\n        if (!effectsMap.has(m)) {\\n          effectsMap.set(m, []);\\n        }\\n        effectsMap.get(m)!.push(o);\\n      });\\n      return acc;\\n    }, new Map<number, Map<string, MissionSource[]>>());\\n  const factions = Array.from(sourcesByFactionByMission.keys())\\n    .map((factionId) => factionsById.get(factionId)!)\\n    .filter((f) => f)\\n    .toSorted((a, b) => {\\n      if (a.id === playerFaction.id) return -1;\\n      if (b.id === playerFaction.id) return 1;\\n      return (a.displayName || \\\"\\\").localeCompare(b.displayName || \\\"\\\");\\n    });\\n\\n  const importantMissions = [\\\"Assassinate\\\"];\\n\\n  const councilEffects = scoredModifiedCouncilors.reduce((acc, councilor) => {\\n    return combineEffects(acc, councilor.effectsWithOrgsAndAugments);\\n  }, {} as ShowEffectsProps);\\n\\n  return (\\n    <div className=\\\\\\\"space-y-2\\\\\\\">\\n      {section === \\\\\\\"existing\\\\\\\" && (\\n        <>\\n          <div className=\\\\\\\"py-1\\\\\\\">\\n            <ShowEffects\\n              incomeBoost_month={councilEffects.incomeBoost_month}\\n              incomeMoney_month={councilEffects.incomeMoney_month}\\n              incomeInfluence_month={councilEffects.incomeInfluence_month}\\n              incomeOps_month={councilEffects.incomeOps_month}\\n              incomeMissionControl={councilEffects.incomeMissionControl}\\n              incomeResearch_month={councilEffects.incomeResearch_month}\\n              projectCapacityGranted={councilEffects.projectCapacityGranted}\\n            />\\n            <ShowEffects\\n              economyBonus={councilEffects.economyBonus}\\n              welfareBonus={councilEffects.welfareBonus}\\n              environmentBonus={councilEffects.environmentBonus}\\n              knowledgeBonus={councilEffects.knowledgeBonus}\\n              governmentBonus={councilEffects.governmentBonus}\\n              unityBonus={councilEffects.unityBonus}\\n              militaryBonus={councilEffects.militaryBonus}\\n              oppressionBonus={councilEffects.oppressionBonus}\\n              spoilsBonus={councilEffects.spoilsBonus}\\n              spaceDevBonus={councilEffects.spaceDevBonus}\\n              spaceflightBonus={councilEffects.spaceflightBonus}\\n              MCBonus={councilEffects.MCBonus}\\n              miningBonus={councilEffects.miningBonus}\\n            />\\n            <ShowEffects\\n              councilorTechBonus={councilEffects.councilorTechBonus}\\n              techBonuses={councilEffects.techBonuses}\\n            />\\n          </div >\\n          <Table>\\n            <CouncilorTableHeader hasOrgs />\\n            <TableBody>\\n              {scoredModifiedCouncilors.map((councilor) => (\\n                <CouncilorTableRow\\n                  key={councilor.id}\\n                  councilor={councilor}\\n                  stats={councilor.effectsWithOrgsAndAugments}\\n                  label={councilor.displayName!}\\n                  hasOrgs\\n                  highlightMissionClassName={currentHighlightMissionClassName}\\n                />\\n              ))}\\n            </TableBody>\\n          </Table>\\n          <h3 className=\\\\\\\"mt-1\\\\\\\">Available Organizations:</h3>\\n          <Table>\\n            <OrgTableHeader />\\n            <TableBody>\\n              {scoredOrgs.map((org) => (\\n                <OrgTableRow\\n                  key={org.id}\\n                  org={org}\\n                  playerNationIds={playerNationIds}\\n                  playerTraits={playerTraits}\\n                  highlightMissionClassName={availableHighlightMissionClassName}\\n                />\\n              ))}\\n            </TableBody>\\n          </Table>\\n        </>\\n      )}\\n\\n      {section === \\\\\\\"new-councilors\\\\\\\" && (\\n        <>\\n          <h3 className=\\\\\\\"mt-1\\\\\\\">Available Councilors:</h3>\\n          <Table>\\n            <CouncilorTableHeader />\\n            <TableBody>\\n              {scoredAvailableCouncilors.map((councilor) => (\\n                <CouncilorTableRow\\n                  key={councilor.id}\\n                  councilor={councilor}\\n                  stats={councilor.effectsBaseAndUnaugmentedTraits}\\n                  label={councilor.displayName!}\\n                  highlightMissionClassName={availableHighlightMissionClassName}\\n                />\\n              ))}\\n            </TableBody>\\n          </Table>\\n\\n          <h3 className=\\\\\\\"mt-1\\\\\\\">Unmodified Active Councilors:</h3>\\n          <Table>\\n            <CouncilorTableHeader />\\n            <TableBody>\\n              {scoredBaseCouncilors.map((councilor) => (\\n                <CouncilorTableRow\\n                  key={`${councilor.id}-base`}\\n                  councilor={councilor}\\n                  stats={councilor.effectsBaseAndUnaugmentedTraits}\\n                  label={`${councilor.displayName}`}\\n                  highlightMissionClassName={currentHighlightMissionClassName}\\n                />\\n              ))}\\n            </TableBody>\\n          </Table>\\n        </>\\n      )}\\n\\n      {section === \\\\\\\"current-orgs\\\\\\\" && (\\n        <Table>\\n          <OrgTableHeader costHeader=\\\\\\\"Councilor\\\\\\\" />\\n          <TableBody>\\n            {scoredOwnedOrgs.toReversed().map((org) => (\\n              <OrgTableRow\\n                key={org.id}\\n                org={org}\\n                playerNationIds={playerNationIds}\\n                playerTraits={playerTraits}\\n                highlightMissionClassName={availableHighlightMissionClassName}\\n              />\\n            ))}\\n          </TableBody>\\n        </Table>\\n      )}\\n\\n      {section === \\\\\\\"takeover\\\\\\\" && (\\n        <SmartTabs\\n          storageKey=\\\\\\\"councilorsTakeoverTabs\\\\\\\"\\n          defaultValue={`faction-${Array.from(stealableOrgsByFaction.keys())[0]}`}\\n        >\\n          <TabsList>\\n            {Array.from(stealableOrgsByFaction.entries()).map(([factionId, orgs]) => (\\n              <TabsTrigger key={factionId} value={`faction-${factionId}`}>\\n                {orgs[0].faction?.displayName || \\\\\\\"Unknown Faction\\\\\\\"} ({orgs.length})\\n              </TabsTrigger>\\n            ))}\\n          </TabsList>\\n          {Array.from(stealableOrgsByFaction.entries()).map(([factionId, orgs]) => (\\n            <TabsContent key={factionId} value={`faction-${factionId}`}>\\n              <Table>\\n                <OrgTableHeader costHeader=\\\\\\\"Takeover\\\\\\\" />\\n                <TableBody>\\n                  {orgs.map((org) => (\\n                    <OrgTableRow\\n                      key={org.id}\\n                      org={org}\\n                      playerNationIds={playerNationIds}\\n                      playerTraits={playerTraits}\\n                      highlightMissionClassName={availableHighlightMissionClassName}\\n                      isTakeover\\n                    />\\n                  ))}\\n                </TableBody>\\n              </Table>\\n            </TabsContent>\\n          ))}\\n        </SmartTabs>\\n      )}\\n\\n      {section === \\\\\\\"missions\\\\\\\" && (\\n        <SmartTabs storageKey=\\\\\\\"councilorsMissionsTabs\\\\\\\" defaultValue={`faction-${factions[0].id}`}>\\n          <TabsList>\\n            {factions.map((faction) => (\\n              <TabsTrigger key={faction.id} value={`faction-${faction.id}`}>\\n                {faction.displayName || \\\\\\\"Unknown Faction\\\\\\\"} ({sourcesByFactionByMission.get(faction.id)?.size || 0})\\n                {importantMissions\\n                  .filter(\\n                    (m) =>\\n                      sourcesByFactionByMission\\n                        .get(faction.id)\\n                        ?.get(m)\\n                        ?.filter((i) => i.type === \\\\\\\"councilor\\\\\\\")?.length ?? 0 > 0\\n                  )\\n                  .map((m) => {\\n                    const MissionIcon = MissionIcons[m] || UnknownIcon;\\n                    return (\\n                      <span key={m} className=\\\\\\\"inline-block -mt-2\\\\\\\">\\n                        <MissionIcon className=\\\\\\\"h-4 w-4\\\\\\\" />\\n                      </span >\\n                    );\\n                  })}\\n              </TabsTrigger>\\n            ))}\\n          </TabsList>\\n          {factions.map((faction) => (\\n            <TabsContent key={faction.id} value={`faction-${faction.id}`}>\\n              <SmartAccordion type=\\\\\\\"single\\\\\\\" collapsible storageKey={`councilorsMissions-${faction.id}`}>\\n                {Array.from(\\n                  new Set([\\n                    ...importantMissions,\\n                    ...Array.from(sourcesByFactionByMission.get(faction.id)?.keys() || []),\\n                  ]),\\n                ).map((missionName) => {\\n                  const sources = sourcesByFactionByMission.get(faction.id)?.get(missionName) || [];\\n                  const MissionIcon = MissionIcons[missionName] || UnknownIcon;\\n                  return (\\n                    <AccordionItem key={missionName} value={missionName}>\\n                      <AccordionTrigger>\\n                        <span\\n                          >\\n                          <MissionIcon /> {missionName} &ndash;{\\\\\\\" \\\\\\\"}\\n                          {sources.filter((i) => i.type === \\\\\\\"councilor\\\\\\\").length} Councilors &lt;-{\\\\\\\" \\\\\\\"}\\n                          {sources.filter((i) => i.type === \\\\\\\"org\\\\\\\").length} Orgs\\n                        </span >\\n                      </AccordionTrigger>\\n                      <AccordionContent>\\n                        <Table>\\n                          <TableHeader>\\n                            <TableRow>\\n                              <TableHead>Fleet Name</TableHead>\\n                              <TableHead>Planet</TableHead>\\n                              <TableHead>Target Orbit</TableHead>\\n                              <TableHead>Arrival Date</TableHead>\\n                              <TableHead className=\\\\\\\"text-right\\\\\\\">Days to Arrival</TableHead>\\n                              <TableHead className=\\\\\\\"text-right\\\\\\\">MC Used</TableHead>\\n                              <TableHead className=\\\\\\\"text-right\\\\\\\">Marine CP</TableHead>\\n                              <TableHead className=\\\\\\\"text-right\\\\\\\">Total Mass</TableHead>\\n                              <TableHead className=\\\\\\\"text-right\\\\\\\">Max Ship Mass</TableHead>\\n                              <TableHead>Ships Hulls</TableHead>\\n                              <TableHead>Ships Roles</TableHead>\\n                              <TableHead>Operation</TableHead>\\n                              <TableHead>Operation Complete</TableHead>\\n                            </TableRow>\\n                          </TableHeader>\\n                          <TableBody>\\n                            {sources?.map((src) => (\\n                              src.type === \\\\\\\"org\\\\\\\" ? (\\n                                <OrgTableRow\\n                                  key={`councilor-${src.org.id}-mission-${missionName}`}\\n                                  org={src.org}\\n                                  playerNationIds={playerNationIds}\\n                                  playerTraits={playerTraits}\\n                                />\\n                              ) : (\\n                                <CouncilorTableRow\\n                                  key={`org-${src.councilor.id}-mission-${missionName}`}\\n                                  councilor={src.councilor}\\n                                  stats={src.councilor.effectsWithOrgsAndAugments}\\n                                  label={src.councilor.displayName!}\\n                                />\\n                              )\\n                            ))}\\n                          </TableBody>\\n                        </Table>\\n                      </AccordionContent>\\n                    </AccordionItem>\\n                  );\\n                })}\\n              </SmartAccordion>\\n            </TabsContent>\\n          ))}\\n        </SmartTabs>\\n      </div >\\n    )}\\n\\n    {section === \\\\\\\"other-councilors\\\\\\\" && (\\n      <div className=\\\\\\\"space-y-2\\\\\\\">\\n        <OtherCouncilorsByFaction {...{ analysis, weights }} />\\n      </div >\\n    )}\\n\\n    {/* Debug Data and Scoring Weights dialog are moved to the parent RenderGameComponent */}\\n  </div>\\n    );\\n}\\n\\nfunction OtherCouncilorsByFaction({ analysis, weights }: { analysis: Analysis; weights: ScoringWeights }) {\\n  const { playerVisibleCouncilors, factionsById } = analysis;\\n\\n  const scoredBaseCouncilors = scoreAndSort(\\n    playerVisibleCouncilors,\\n    weights,\\n    new Map<MissionDataName, number>(),\\n    getBaseCouncilorScore\\n  );\\n\\n  const councilorsByFactionId = scoredBaseCouncilors.reduce((acc, councilor) => {\\n    const factionId = councilor.factionId || 0;\\n    if (!factionId) return acc;\\n    if (!acc.has(factionId)) {\\n      acc.set(factionId, []);\\n    }\\n    acc.get(factionId)!.push(councilor);\\n    return acc;\\n  }, new Map<number, Analysis[\\\\\\\"playerCouncilors\\\\\\\"][number][]>());\\n\\n  const factions = Array.from(councilorsByFactionId.keys())\\n    .map((i) => factionsById.get(i!)!)\\n    .filter((i) => i.id !== analysis.alienFaction.id);\\n\\n  return (\\n    <Tabs defaultValue={`faction-${factions[0].id}`}>\\n      <TabsList>\\n        {factions\\n          .filter((i) => i.id !== analysis.alienFaction.id)\\n          .map((faction) => (\\n            <TabsTrigger key={faction.id} value={`faction-${faction.id}`}>\\n              {faction.displayName || \\\\\\\"Unknown Faction\\\\\\\"} ({councilorsByFactionId.get(faction.id)?.length || 0})\\n            </TabsTrigger>\\n          ))}\\n      </TabsList>\\n      {factions.map((faction) => (\\n        <TabsContent key={faction.id} value={`faction-${faction.id}`}>\\n          <Table>\\n            <TableHeader>\\n              <TableRow>\\n                <TableHead>Name</TableHead>\\n                <TableHead>Modified Stats</TableHead>\\n                <TableHead>Org Tiers</TableHead>\\n                <TableHead>Monthly Effects</TableHead>\\n                <TableHead>Priorities</TableHead>\\n                <TableHead>Science</TableHead>\\n                <TableHead>Missions</TableHead>\\n                <TableHead>Score</TableHead>\\n                <TableHead>NM Score</TableHead>\\n                <TableHead>CP Cap</TableHead>\\n              </TableRow>\\n            </TableHeader>\\n            <TableBody>\\n              {councilorsByFactionId.get(faction.id)?.map((councilor) => (\\n                <CouncilorTableRow\\n                  key={councilor.id}\\n                  councilor={councilor}\\n                  stats={councilor.effectsBaseAndUnaugmentedTraits}\\n                  label={councilor.displayName!}\\n                />\\n              ))}\\\\n            </TableBody>\\\\n          </Table>\\\\n        </TabsContent>\\\\n      ))}\\\\n    </Tabs>\\\\n  );\\\\n}\\\\n\\\\nfunction scoreAndSort<T>(\\\\n  items: T[],\\\\n  weights: ScoringWeights,\\\\n  haveMissions: Map<MissionDataName, number>,\\\\n  scoreFn: (item: T, weights: ScoringWeights, haveMissions: Map<MissionDataName, number>) => ScoreResult,\\\\n  scoreSort: \\\\\\\"value\\\\\\\" | \\\\\\\"noMissionScore\\\\\\\" = \\\\\\\"value\\\\\\\"\\\\n) {\\\\n  const scoredItems = items.map((item) => {\\\\n    const scoreResult = scoreFn(item, weights, haveMissions);\\\\n    return { ...item, score: scoreResult };\\\\n  });\\\\n  scoredItems.sort((a, b) => b.score[scoreSort] - a.score[scoreSort]);\\\\n  return scoredItems;\\\\n}\\\\n\\\\nfunction getBaseCouncilorScore(\\\\n  councilor: Analysis[\\\\\\\"playerCouncilors\\\\\\\"][number],\\\\n  weights: ScoringWeights,\\\\n  haveMissions: Map<MissionDataName, number>\\\\n): ScoreResult {\\\\n  return getScore(councilor.effectsBaseAndUnaugmentedTraits, weights, haveMissions, true);\\\\n}\\\\n\\\\nfunction getModifiedCouncilorScore(\\\\n  councilor: Analysis[\\\\\\\"playerCouncilors\\\\\\\"][number],\\\\n  weights: ScoringWeights,\\\\n  haveMissions: Map<MissionDataName, number>\\\\n): ScoreResult {\\\\n  return getScore(councilor.effectsWithOrgsAndAugments, weights, haveMissions, true);\\\\n}\\\\n\\\\nconst orgTransferFactor = 0.2;\\\\nfunction getOrganizationScore(\\\\n  org: Analysis[\\\\\\\"playerAvailableOrgs\\\\\\\"][number] & { type: string },\\\\n  weights: ScoringWeights,\\\\n  haveMissions: Map<MissionDataName, number>\\\\n): ScoreResult {\\\\n  return getScore(\\\\n    {\\\\n      ...org,\\\\n      techBonuses: org.template?.techBonuses,\\\\n      missionsGrantedNames: org.template?.missionsGrantedNames || [],\\\\n      ...(org.type === \\\\\\\"available\\\\\\\"\\\\n        ? {}\\\\n        : {\\\\n            // already-purchased orgs seem to cost ~30% to transfer\\\\n            costMoney: (org.costMoney || 0) * orgTransferFactor,\\\\n            costInfluence: (org.costInfluence || 0) * orgTransferFactor,\\\\n            costOps: (org.costOps || 0) * orgTransferFactor,\\\\n            costBoost: (org.costBoost || 0) * orgTransferFactor,\\\\n          }),\\\\n    },\\\\n    weights,\\\\n    haveMissions\\\\n  );\\\\n}\\\\n\\\\ninterface ScoreResult {\\\\n  value: number;\\\\n  noMissionScore: number;\\\\n  details: string;\\\\n}\\\\n\\\\nfunction getScore(\\\\n  org: ShowEffectsProps,\\\\n  weights: ScoringWeights,\\\\n  haveMissions: Map<MissionDataName, number>,\\\\n  ignoreTier: boolean = false\\\\n): ScoreResult {\\\\n  let totalScore = 0;\\\\n  const details: string[] = [];\\\\n\\\\n  // Helper to add score for a numeric attribute\\\\n  const addScore = (name: string, value: number | undefined, weight: number | undefined, noNegative?: boolean) => {\\\\n    let actualValue = value || 0;\\\\n    if (noNegative) {\\\\n      actualValue = Math.max(0, actualValue);\\\\n    }\\\\n    const actualWeight = weight ?? 0;\\\\n\\\\n    // Skip if value or weight is 0/undefined/null\\\\n    if (!actualValue || !actualWeight) return;\\\\n\\\\n    const contribution = actualValue * actualWeight;\\\\n    totalScore += contribution;\\\\n    details.push(\\\\n      `${name}: ${parseFloat(actualValue.toFixed(2))} × ${parseFloat(actualWeight.toFixed(3))} = ${contribution.toFixed(\\\\n        3\\\\n      )}`\\\\n    );\\\\n  };\\\\n\\\\n  // Councilor attributes\\\\n  addScore(\\\\\\\"persuasion\\\\\\\", org.persuasion, weights.persuasion, true);\\\\n  addScore(\\\\\\\"command\\\\\\\", org.command, weights.command, true);\\\\n  addScore(\\\\\\\"investigation\\\\\\\", org.investigation, weights.investigation, true);\\\\n  addScore(\\\\\\\"espionage\\\\\\\", org.espionage, weights.espionage, true);\\\\n  addScore(\\\\\\\"administration\\\\\\\", org.administration, weights.administration, true);\\\\n  addScore(\\\\\\\"science\\\\\\\", org.science, weights.science, true);\\\\n  addScore(\\\\\\\"security\\\\\\\", org.security, weights.security, true);\\\\n  addScore(\\\\\\\"Persuasion\\\\\\\", org.Persuasion, weights.persuasion, true);\\\\n  addScore(\\\\\\\"Command\\\\\\\", org.Command, weights.command, true);\\\\n  addScore(\\\\\\\"Investigation\\\\\\\", org.Investigation, weights.investigation, true);\\\\n  addScore(\\\\\\\"Espionage\\\\\\\", org.Espionage, weights.espionage, true);\\\\n  addScore(\\\\\\\"Administration\\\\\\\", org.Administration, weights.administration, true);\\\\n  addScore(\\\\\\\"Science\\\\\\\", org.Science, weights.science, true);\\\\n  addScore(\\\\\\\"Security\\\\\\\", org.Security, weights.security, true);\\\\n  addScore(\\\\\\\"xpModifier\\\\\\\", org.xpModifier, weights.xpModifier);\\\\n  addScore(\\\\\\\\\\\"xp\\\\\\\\\\\", org.xp, weights.xp);\\\\n\\\\n  // Monthly income/costs\\\\n  addScore(\\\\\\\"incomeBoost_month\\\\\\\", org.incomeBoost_month, weights.incomeBoost_month);\\\\n  addScore(\\\\\\\"incomeMoney_month\\\\\\\", org.incomeMoney_month, weights.incomeMoney_month);\\\\n  addScore(\\\\\\\"incomeInfluence_month\\\\\\\", org.incomeInfluence_month, weights.incomeInfluence_month);\\\\n  addScore(\\\\\\\"incomeOps_month\\\\\\\", org.incomeOps_month, weights.incomeOps_month);\\\\n  addScore(\\\\\\\"incomeMissionControl\\\\\\\", org.incomeMissionControl, weights.incomeMissionControl);\\\\n  addScore(\\\\\\\"incomeResearch_month\\\\\\\", org.incomeResearch_month, weights.incomeResearch_month);\\\\n  addScore(\\\\\\\"projectCapacityGranted\\\\\\\", org.projectCapacityGranted, weights.projectCapacityGranted);\\\\n\\\\n  // Purchase costs\\\\n  addScore(\\\\\\\"costMoney\\\\\\\", org.costMoney, weights.costMoney);\\\\n  addScore(\\\\\\\"costInfluence\\\\\\\", org.costInfluence, weights.costInfluence);\\\\n  addScore(\\\\\\\"costOps\\\\\\\", org.costOps, weights.costOps);\\\\n  addScore(\\\\\\\"costBoost\\\\\\\", org.costBoost, weights.costBoost);\\\\n\\\\n  // Priority bonuses\\\\n  addScore(\\\\\\\"economyBonus\\\\\\\", org.economyBonus, weights.economyBonus);\\\\n  addScore(\\\\\\\"welfareBonus\\\\\\\", org.welfareBonus, weights.welfareBonus);\\\\n  addScore(\\\\\\\"environmentBonus\\\\\\\", org.environmentBonus, weights.environmentBonus);\\\\n  addScore(\\\\\\\"knowledgeBonus\\\\\\\", org.knowledgeBonus, weights.knowledgeBonus);\\\\n  addScore(\\\\\\\"governmentBonus\\\\\\\", org.governmentBonus, weights.governmentBonus);\\\\n  addScore(\\\\\\\"unityBonus\\\\\\\", org.unityBonus, weights.unityBonus);\\\\n  addScore(\\\\\\\"militaryBonus\\\\\\\", org.militaryBonus, weights.militaryBonus);\\\\n  addScore(\\\\\\\"oppressionBonus\\\\\\\", org.oppressionBonus, weights.oppressionBonus);\\\\n  addScore(\\\\\\\"spoilsBonus\\\\\\\", org.spoilsBonus, weights.spoilsBonus);\\\\n  addScore(\\\\\\\"spaceDevBonus\\\\\\\", org.spaceDevBonus, weights.spaceDevBonus);\\\\n  addScore(\\\\\\\"spaceflightBonus\\\\\\\", org.spaceflightBonus, weights.spaceflightBonus);\\\\n  addScore(\\\\\\\"MCBonus\\\\\\\", org.MCBonus, weights.MCBonus);\\\\n  addScore(\\\\\\\"miningBonus\\\\\\\", org.miningBonus, weights.miningBonus);\\\\n\\\\n  // Tech bonuses from councilor/traits\\\\n  if (weights.councilorTechBonus && org?.councilorTechBonus) {\\\\n    for (const { category, bonus } of org.councilorTechBonus) {\\\\n      const weight = weights.councilorTechBonus[category];\\\\n      addScore(`councilorTechBonus[${category}]`, bonus, weight);\\\\n    }\\\\n  }\\\\n\\\\n  // Tech bonuses from orgs\\\\n  if (weights.techBonuses && org?.techBonues) {\\\\n    for (const { category, bonus } of org.techBonues) {\\\\n      const weight = weights.techBonuses[category];\\\\n      addScore(`techBonus[${category}]`, bonus, weight);\\\\n    }\\\\n  }\\\\n\\\\n  let noMissionScore = totalScore;\\\\n\\\\n  // Missions granted\\\\n  if (weights.missions && org?.missionsGrantedNames) {\\\\n    for (const missionName of org.missionsGrantedNames) {\\\\n      const weight = weights.missions[missionName];\\\\n      addScore(`mission[${missionName}]`, 1, weight);\\\\n\\\\n      // Extra weight for missing missions\\\\n      if (weights.extraWeightForMissingMissions && (haveMissions.get(missionName) || 0) === 0) {\\\\n        totalScore += weights.extraWeightForMissingMissions;\\\\n        details.push(\\\\n          `mission[${missionName}]: missing bonus × ${parseFloat(\\\\n            weights.extraWeightForMissingMissions.toFixed(3)\\\\n          )} = ${weights.extraWeightForMissingMissions.toFixed(3)}`\\\\n        );\\\\n      }\\\\n      if (weights.extraWeightForSingleMissions && (haveMissions.get(missionName) || 0) === 1) {\\\\n        totalScore += weights.extraWeightForSingleMissions;\\\\n        details.push(\\\\n          `mission[${missionName}]: single bonus × ${parseFloat(\\\\n            weights.extraWeightForSingleMissions.toFixed(3)\\\\n          )} = ${weights.extraWeightForSingleMissions.toFixed(3)}`\\\\n        );\\\\n      }\\\\n    }\\\\n  }\\\\n\\\\n  // Divide by tier to normalize for org cost/power\\\\n  const tier = org.tier || 1;\\\\n  let finalScore = totalScore;\\\\n\\\\n  if (tier > 1 && !ignoreTier) {\\\\n    const tierFactor = Math.pow(tier, weights.orgTierExponent);\\\\n    finalScore = totalScore / tierFactor;\\\\n    noMissionScore /= tierFactor;\\\\n    details.push(`Subtotal: ${totalScore.toFixed(3)}`);\\\\n    details.push(`Divided by ${tierFactor.toFixed(2)} for tier ${tier}: ${finalScore.toFixed(3)}`);\\\\n  }\\\\n\\\\n  return {\\\\n    value: finalScore,\\\\n    noMissionScore,\\\\n    details: details.join(\\\\\\\"\\\\\\\\n\\\\\\\"),\\\\n  };\\\\n}\\\\\\n\",\"oldString\":\"\\\"use client\\\";\\n\\nimport { useState, useEffect } from \\\"react\\\";\\nimport { combineEffects, ShowEffects, ShowEffectsProps } from \\\"@/components/showEffects\\\";\\nimport { AccordionContent, AccordionItem, AccordionTrigger } from \\\"@/components/ui/accordion\\\";\\nimport { SmartAccordion } from \\\"@/components/ui/smart-accordion\\\";\\nimport { Button } from \\\"@/components/ui/button\\\";\\nimport { Collapsible, CollapsibleContent, CollapsibleTrigger } from \\\"@/components/ui/collapsible\\\";\\nimport { Tooltip, TooltipContent, TooltipTrigger } from \\\"@/components/ui/tooltip\\\";\\nimport { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from \\\"@/components/ui/table\\\";\\nimport { Analysis } from \\\"@/lib/analysis\\\";\\nimport { MissionDataName, TraitDataName } from \\\"@/lib/template-types-generated\\\";\\nimport { MinusCircleIcon, PlusCircleIcon } from \\\"lucide-react\\\";\\nimport { defaultScoringWeights, loadWeightsFromStorage, ScoringWeights, ScoringWeightsDialog } from \\\"./scoringWeights\\\";\\nimport { Administration, MissionIcons, TraitIcons, UnknownIcon } from \\\"@/components/icons\\\";\\nimport { Tabs, TabsContent, TabsList, TabsTrigger } from \\\"@/components/ui/tabs\\\";\\nimport { SmartTabs } from \\\"@/components/ui/smart-tabs\\\";\\nimport { twMerge } from \\\"tailwind-merge\\\";\\n\\nfunction CouncilorTableHeader({ hasOrgs }: { hasOrgs?: boolean }) {\\n  return (\\n    <TableHeader>\\n      <TableRow>\\n        <TableHead>Name</TableHead>\\n        <TableHead>Modified Stats</TableHead>\\n        {hasOrgs && <TableHead>Org Tiers</TableHead>}\\n        <TableHead>Monthly Effects</TableHead>\\n        <TableHead>Priorities</TableHead>\\n        <TableHead>Science</TableHead>\\n        <TableHead>Missions</TableHead>\\n        <TableHead>Score</TableHead>\\n        <TableHead>NM Score</TableHead>\\n        <TableHead>CP Cap</TableHead>\\n      </TableRow>\\n    </TableHeader>\\n  );\\n}\\n\\nfunction OrgTableHeader({ costHeader }: { costHeader?: string }) {\\n  return (\\n    <TableHeader>\\n      <TableRow>\\n        <TableHead>Org Name</TableHead>\\n        <TableHead>Requirements</TableHead>\\n        <TableHead>Tier</TableHead>\\n        {costHeader ? <TableHead>{costHeader}</TableHead> : <TableHead>Purchase / Transfer</TableHead>}\\n        <TableHead>Monthly</TableHead>\\n        <TableHead>Effects</TableHead>\\n        <TableHead>Score</TableHead>\\n        <TableHead>NM Score</TableHead>\\n      </TableRow>\\n    </TableHeader>\\n  );\\n}\\n\\nfunction CouncilorTableRow({\\n  councilor,\\n  stats,\\n  label,\\n  hasOrgs,\\n  highlightMissionClassName,\\n}: {\\n  councilor: Analysis[\\\"playerCouncilors\\\"][number] & { score?: ScoreResult };\\n  stats: Analysis[\\\"playerCouncilors\\\"][number][\\\"effectsWithOrgsAndAugments\\\"];\\n  label: string;\\n  hasOrgs?: boolean;\\n  highlightMissionClassName?: (missionName: MissionDataName) => string | undefined;\\n}) {\\n  const admin = Math.min(25, Math.max(0, (stats.administration || 0) + (stats.Administration || 0)));\\n  const orgTiers = councilor.orgs.reduce((a, b) => a + b.tier, 0);\\n  const cpCap =\\n    Math.min(25, Math.max(0, stats.persuasion || 0) + Math.max(0, stats.Persuasion || 0)) +\\n    Math.min(25, Math.max(0, stats.command || 0) + Math.max(0, stats.Command || 0)) +\\n    Math.min(25, Math.max(0, stats.administration || 0) + Math.max(0, stats.Administration || 0));\\n  return (\\n    <TableRow key={`${councilor.id}-${label}`}>\\n      <TableCell>{label}</TableCell>\\n      <TableCell>\\n        <ShowEffects\\n          persuasion={stats.persuasion}\\n          command={stats.command}\\n          investigation={stats.investigation}\\n          espionage={stats.espionage}\\n          administration={stats.administration}\\n          science={stats.science}\\n          security={stats.security}\\n          Persuasion={stats.Persuasion}\\n          Command={stats.Command}\\n          Investigation={stats.Investigation}\\n          Espionage={stats.Espionage}\\n          Administration={stats.Administration}\\n          Science={stats.Science}\\n          Security={stats.Security}\\n          ApparentLoyalty={stats.ApparentLoyalty}\\n          Loyalty={stats.Loyalty}\\n          maxLoyalty={stats.maxLoyalty}\\n          xpModifier={stats.xpModifier}\\n          xp={stats.xp}\\n          traitTemplateNames={stats.traitTemplateNames}\\n          typeTemplateName={stats.typeTemplateName}\\n          playerIntel={stats.playerIntel}\\n          playerMaxIntel={stats.playerMaxIntel}\\n          lastRecordedLoyalty={stats.lastRecordedLoyalty}\\n          // TODO: is there a case where we should show this?\\n          // Loyalty={stats.Loyalty}\\n        />\\n      </TableCell>\\n      {hasOrgs && (\\n        <TableCell>\\n          <ShowEffects tier={stats.tier} highlightTier={orgTiers < admin} />\\n        </TableCell>\\n      )}\\n      <TableCell>\\n        <ShowEffects\\n          incomeBoost_month={stats.incomeBoost_month}\\n          incomeMoney_month={stats.incomeMoney_month}\\n          incomeInfluence_month={stats.incomeInfluence_month}\\n          incomeOps_month={stats.incomeOps_month}\\n          incomeMissionControl={stats.incomeMissionControl}\\n          incomeResearch_month={stats.incomeResearch_month}\\n          projectCapacityGranted={stats.projectCapacityGranted}\\n        />\\n      </TableCell>\\n      <TableCell>\\n        <span className=\\\"text-wrap leading-6 -my-2 inline-block\\\">\\n          <ShowEffects\\n            economyBonus={stats.economyBonus}\\n            welfareBonus={stats.welfareBonus}\\n            environmentBonus={stats.environmentBonus}\\n            knowledgeBonus={stats.knowledgeBonus}\\n            governmentBonus={stats.governmentBonus}\\n            unityBonus={stats.unityBonus}\\n            militaryBonus={stats.militaryBonus}\\n            oppressionBonus={stats.oppressionBonus}\\n            spoilsBonus={stats.spoilsBonus}\\n            spaceDevBonus={stats.spaceDevBonus}\\n            spaceflightBonus={stats.spaceflightBonus}\\n            MCBonus={stats.MCBonus}\\n            miningBonus={stats.miningBonus}\\n          />\\n        </span >\\n      </TableCell>\\n      <TableCell>\\n        <span className=\\\"text-wrap leading-6 -my-2 inline-block\\\">\\n          <ShowEffects\\n            councilorTechBonus={stats.councilorTechBonus}\\n            techBonuses={stats.techBonuses}\\n          />\\n        </span >\\n      </TableCell>\\n      <TableCell>\\n        <span className=\\\"text-wrap leading-6 -my-2 inline-block\\\">\\n          <ShowEffects\\n            missionsGrantedNames={stats.missionsGrantedNames}\\n            highlightMissionClassName={highlightMissionClassName}\\n          />\\n        </span >\\n      </TableCell>\\n      {councilor.score === undefined ? null : (\\n        <>\\n          <TableCell>\\n            <Tooltip>\\n              <TooltipTrigger>{councilor.score.value?.toFixed(2)}</TooltipTrigger>\\n              <TooltipContent align=\\\"end\\\" className=\\\"max-w-auto\\\">\\n                <pre className=\\\"p-2\\\">{councilor.score.details}</pre>\\n              </TooltipContent>\\n            </Tooltip>\\n          </TableCell>\\n          <TableCell>{councilor.score.noMissionScore?.toFixed(2)}</TableCell>\\n          <TableCell>{cpCap?.toFixed(0)}</TableCell>\\n        </>\\n      )}\\n    </TableRow>\\n  );\\n}\\n\\nfunction OrgTableRow({\\n  org,\\n  playerNationIds,\\n  playerTraits,\\n  highlightMissionClassName,\\n  isTakeover,\\n}: {\\n  org: Analysis[\\\"playerAvailableOrgs\\\"][number] & {\\n    type?: string;\\n    score?: ScoreResult;\\n    councilor?: string;\\n    councilorId?: number;\\n  };\\n  playerNationIds: Set<number>;\\n  playerTraits: Set<string>;\\n  highlightMissionClassName?: (missionName: MissionDataName) => string | undefined;\\n  isTakeover?: boolean;\\n}) {\\n  const missingRequiredTraits = org.template?.requiredOwnerTraits?.filter((t) => !playerTraits.has(t)) || [];\\n  function traitIcon(trait: TraitDataName, Fallback: typeof PlusCircleIcon) {\\n    return TraitIcons[trait] || Fallback;\\n  }\\n  return (\\n    <TableRow\\n      key={org.id}\\n      className={twMerge(org.isAdminOrg ? \\\"bg-green-100\\\" : \\\"\\\", org.type === \\\"unassigned\\\" ? \\\"bg-yellow-100\\\" : \\\"\\\")}\\n    >\\n      <TableCell>{org.displayName}</TableCell>\\n      <TableCell>\\n        {org.template?.requiresNationality && (\\n          <span className=\\\"mr-1\\\" title={`Required Nation: ${org.homeNationName || \\\"\\\"}`}>\\n            {playerNationIds.has(org.homeNationId || -1) ? (\\n              <PlusCircleIcon className=\\\"inline h-4 w-4 stroke-green-700 -mt-1 bg-transparent\\\" />\\n            ) : (\\n              <MinusCircleIcon className=\\\"inline h-4 w-4 stroke-destructive -mt-1\\\" />\\n            )}\\n          </span >\\n        )}\\n        {org.template?.requiredOwnerTraits && (\\n          <span className=\\\"mr-1\\\" title={\\\"Required Traits: \\\" + org.template.requiredOwnerTraits.join(\\\", \\\")}>\\n            {missingRequiredTraits.length === 0\\n              ? org.template.requiredOwnerTraits.map((trait, ix) => {\\n                  const Icon = traitIcon(trait, PlusCircleIcon);\\n                  return <Icon key={ix} className=\\\"inline h-4 w-4 stroke-green-700 -mt-1\\\" />;\\n                })\\n              : missingRequiredTraits.map((trait, ix) => {\\n                  const Icon = traitIcon(trait, MinusCircleIcon);\\n                  return <Icon key={ix} className=\\\"inline h-4 w-4 stroke-destructive -mt-1\\\" />;\\n                })}\\n          </span >\\n        )}\\n        {org.template?.prohibitedOwnerTraits && (\\n          <span className=\\\"mr-1\\\" title={\\\"Prohibited Traits: \\\" + org.template.prohibitedOwnerTraits.join(\\\", \\\")}>\\n            {org.template.prohibitedOwnerTraits.map((trait, ix) => {\\n              const Icon = traitIcon(trait, MinusCircleIcon);\\n              return <Icon key={ix} className=\\\"inline h-4 w-4 stroke-blue-700 -mt-1\\\" />;\\n            })}\\n          </span >\\n        )}\\n      </TableCell>\\n      <TableCell>\\n        <ShowEffects tier={org.tier} />\\n      </TableCell>\\n      <TableCell>\\n        {org.type === \\\"unassigned\\\" && \\\"T \\\"}\\n        {org.type === \\\"available\\\" || org.type === \\\"unassigned\\\" ? (\\n          <ShowEffects\\n            costMoney={(org.costMoney || 0) * (org.type === \\\"available\\\" ? 1 : orgTransferFactor)}\\n            costInfluence={(org.costInfluence || 0) * (org.type === \\\"available\\\" ? 1 : orgTransferFactor)}\\n            costOps={(org.costOps || 0) * (org.type === \\\"available\\\" ? 1 : orgTransferFactor)}\\n            costBoost={(org.costBoost || 0) * (org.type === \\\"available\\\" ? 1 : orgTransferFactor)}\\n          />\\n        ) : org.type == \\\"stealable\\\" && isTakeover ? (\\n          (() => {\\n            const target = org as any as Analysis[\\\"playerStealableOrgs\\\"][number];\\n            return (\\n              <>\\n                {target.councilor ?? \\\"Unassigned\\\"} from {target.faction?.displayName}, Admin: {target.admin} +\\n                takeoverDefense: {target.takeoverDefense}\\n              </>\\n            );\\n          })()\\n        ) : org.type === \\\"used\\\" ? (\\n          <>{org.councilor ?? \\\"Unassigned\\\"}</>\\n        ) : null}\\n      </TableCell>\\n      <TableCell>\\n        <ShowEffects\\n          incomeBoost_month={org.incomeBoost_month}\\n          incomeMoney_month={org.incomeMoney_month}\\n          incomeInfluence_month={org.incomeInfluence_month}\\n          incomeOps_month={org.incomeOps_month}\\n          incomeMissionControl={org.incomeMissionControl}\\n          incomeResearch_month={org.incomeResearch_month}\\n          projectCapacityGranted={org.projectCapacityGranted}\\n        />\\n      </TableCell>\\n      <TableCell>\\n        <ShowEffects\\n          persuasion={org.persuasion}\\n          command={org.command}\\n          investigation={org.investigation}\\n          espionage={org.espionage}\\n          administration={org.administration}\\n          science={org.science}\\n          security={org.security}\\n          economyBonus={org.economyBonus}\\n          welfareBonus={org.welfareBonus}\\n          environmentBonus={org.environmentBonus}\\n          knowledgeBonus={org.knowledgeBonus}\\n          governmentBonus={org.governmentBonus}\\n          unityBonus={org.unityBonus}\\n          militaryBonus={org.militaryBonus}\\n          oppressionBonus={org.oppressionBonus}\\n          spoilsBonus={org.spoilsBonus}\\n          spaceDevBonus={org.spaceDevBonus}\\n          spaceflightBonus={org.spaceflightBonus}\\n          MCBonus={org.MCBonus}\\n          miningBonus={org.miningBonus}\\n          techBonuses={org.template?.techBonuses}\\n          missionsGrantedNames={org.template?.missionsGrantedNames || []}\\n          highlightMissionClassName={highlightMissionClassName}\\n        />\\n      </TableCell>\\n      {org.score === undefined ? null : (\\n        <>\\n          <TableCell>\\n            <Tooltip>\\n              <TooltipTrigger>{org.score.value?.toFixed(2)}</TooltipTrigger>\\n              <TooltipContent align=\\\"end\\\" className=\\\"max-w-auto\\\">\\n                <pre className=\\\"p-2\\\">{org.score.details}</pre>\\n              </TooltipContent>\\n            </Tooltip>\\n          </TableCell>\\n          <TableCell>{org.score.noMissionScore?.toFixed(2)}</TableCell>\\n        </>\\n      )}\\n    </TableRow>\\n  );\\n}\\n\\nexport function getCouncilorsUi(analysis: Analysis) {\\n  const { playerMissionCounts } = analysis;\\n  const [weights, setWeights] = useState<ScoringWeights>(defaultScoringWeights);\\n\\n  useEffect(() => {\\n    setWeights(loadWeightsFromStorage());\\n  }, []);\\n\\n  const scoredModifiedCouncilors = scoreAndSort(\\n    analysis.playerCouncilors,\\n    weights,\\n    playerMissionCounts,\\n    getModifiedCouncilorScore\\n  );\\n  const scoredAvailableCouncilors = scoreAndSort(\\n    analysis.playerAvailableCouncilors,\\n    weights,\\n    playerMissionCounts,\\n    getBaseCouncilorScore\\n  );\\n  const scoredBaseCouncilors = scoreAndSort(\\n    analysis.playerCouncilors,\\n    weights,\\n    playerMissionCounts,\\n    getBaseCouncilorScore\\n  );\\n  const scoredOrgs = scoreAndSort(\\n    analysis.playerAvailableOrgs\\n      .map((i) => ({ type: \\\"available\\\", ...i }))\\n      .concat(analysis.playerUnassignedOrgs.map((i) => ({ type: \\\"unassigned\\\", ...i }))),\\n    weights,\\n    playerMissionCounts,\\n    getOrganizationScore,\\n    \\\"noMissionScore\\\" // ignore missions when sorting orgs\\n  ).toSorted((a, b) => (a.isAdminOrg === b.isAdminOrg ? 0 : a.isAdminOrg ? -1 : 1)); // admin orgs first\\n  const usedOrgs = analysis.playerCouncilors.flatMap((councilor) =>\\n    councilor.orgs.map((o) => ({ ...o, type: \\\"used\\\", councilor: councilor.displayName, councilorId: councilor.id }))\\n  );\\n  const scoredUsedOrgs = scoreAndSort(usedOrgs, weights, playerMissionCounts, getOrganizationScore);\\n  const scoredOwnedOrgs = scoreAndSort(\\n    analysis.playerUnassignedOrgs.map((i) => ({ type: \\\"unassigned\\\", ...i })).concat(usedOrgs),\\n    weights,\\n    playerMissionCounts,\\n    getOrganizationScore\\n  );\\n\\n  const bestAvailableCouncilor = scoredAvailableCouncilors[0]?.score.value;\\n  const worstExistingCouncilor = scoredBaseCouncilors[scoredBaseCouncilors.length - 1]?.score.value;\\n  const bestAvailableOrg = scoredOrgs[0]?.score.value;\\n  const worstExistingOrg = scoredUsedOrgs[scoredUsedOrgs.length - 1]?.score.value;\\n\\n  return {\\n    key: \\\"councilors\\\",\\n    tab: (\\n      <>\\n        Councilors ({worstExistingCouncilor?.toFixed(0)} vs. {bestAvailableCouncilor?.toFixed(0)}) / Orgs (\\n        {worstExistingOrg?.toFixed(2)} vs {bestAvailableOrg?.toFixed(2)})\\n      </>\\n    ),\\n    content: (\\n      <CouncilorsComponent\\n        {...{\\n          analysis,\\n          weights,\\n          setWeights,\\n          scoredModifiedCouncilors,\\n          scoredAvailableCouncilors,\\n          scoredBaseCouncilors,\\n          scoredOrgs,\\n          scoredOwnedOrgs,\\n        }}\\n      />\\n    ),\\n  };\\n}\\n\\nfunction CouncilorsComponent({\\n  analysis,\\n  weights,\\n  setWeights,\\n  scoredModifiedCouncilors,\\n  scoredAvailableCouncilors,\\n  scoredBaseCouncilors,\\n  scoredOrgs,\\n  scoredOwnedOrgs,\\n}: {\\n  analysis: Analysis;\\n  weights: ScoringWeights;\\n  setWeights: (weights: ScoringWeights) => void;\\n  scoredModifiedCouncilors: (Analysis[\\\"playerCouncilors\\\"][number] & { score: ScoreResult })[];\\n  scoredAvailableCouncilors: (Analysis[\\\"playerAvailableCouncilors\\\"][number] & { score: ScoreResult })[];\\n  scoredBaseCouncilors: (Analysis[\\\"playerCouncilors\\\"][number] & { score: ScoreResult })[];\\n  scoredOrgs: (Analysis[\\\"playerAvailableOrgs\\\"][number] & { type: string; score: ScoreResult })[];\\n  scoredOwnedOrgs: (Analysis[\\\"playerAvailableOrgs\\\"][number] & {\\n    type: string;\\n    score: ScoreResult;\\n    councilor?: string;\\n    councilorId?: number;\\n  })[];\\n}) {\\n  const {\\n    playerMissionCounts,\\n    playerVisibleCouncilors,\\n    playerCouncilors,\\n    playerAvailableOrgs,\\n    playerUnassignedOrgs,\\n    playerFaction,\\n    playerStealableOrgs,\\n    factionsById,\\n  } = analysis;\\n  const scoredStealableOrgs = scoreAndSort(\\n    analysis.playerStealableOrgs.map((i) => ({ type: \\\"stealable\\\", ...i })),\\n    weights,\\n    playerMissionCounts,\\n    getOrganizationScore,\\n    \\\"noMissionScore\\\"\\n  );\\n\\n  function currentHighlightMissionClassName(missionName: MissionDataName) {\\n    // if we have exactly 2, show yellow BG, if we have 1, show red, otherwise no change to bg\\n    const count = playerMissionCounts.get(missionName) || 0;\\n    if (count === 2) {\\n      return \\\"bg-yellow-300/50\\\";\\n    } else if (count === 1) {\\n      return \\\"bg-red-300/50\\\";\\n    }\\n  }\\n  function availableHighlightMissionClassName(missionName: MissionDataName) {\\n    // if we have 1, show yellow BG, if we have 0, show green, otherwise no change to bg\\n    const count = playerMissionCounts.get(missionName) || 0;\\n    if (count === 1) {\\n      return \\\"bg-yellow-300/50\\\";\\n    } else if (count === 0) {\\n      return \\\"bg-green-300/50\\\";\\n    }\\n  }\\n  const playerNationIds = new Set(analysis.playerNationIds);\\n  const playerTraits = new Set(analysis.playerCouncilors.flatMap((i) => i.traitTemplateNames));\\n  const unusedAdmin = analysis.playerCouncilors\\n    .map(\\n      (c) =>\\n        Math.min(\\n          25,\\n          Math.max(\\n            0,\\n            (c.effectsWithOrgsAndAugments.Administration || 0) + (c.effectsWithOrgsAndAugments.administration || 0)\\n          )\\n        ) - c.orgs.reduce((a, b) => a + b.tier, 0)\\n    )\\n    .reduce((a, b) => a + b, 0);\\n\\n  const stealableOrgsByFaction = scoredStealableOrgs.reduce((acc, org) => {\\n    const key = org.faction?.id || 0;\\n    if (!acc.has(key)) {\\n      acc.set(key, []);\\n    }\\n    acc.get(key)!.push(org);\\n    return acc;\\n  }, new Map<number, typeof scoredStealableOrgs>());\\n\\n  type MissionSource =\\n    | {\\n        type: \\\"councilor\\\";\\n        councilor: Analysis[\\\"playerCouncilors\\\"][number];\\n        factionId: number | undefined;\\n        missions: MissionDataName[];\\n      }\\n    | {\\n        type: \\\"org\\\";\\n        org: Analysis[\\\"playerAvailableOrgs\\\"][number];\\n        factionId: number | undefined;\\n        missions: MissionDataName[];\\n      };\\n\\n  const sourcesByFactionByMission = [...playerCouncilors, ...playerVisibleCouncilors]\\n    .map(\\n      (i) =>\\n        ({\\n          type: \\\"councilor\\\",\\n          councilor: i,\\n          factionId: i.factionId,\\n          missions: i.effectsWithOrgsAndAugments.missionsGrantedNames || [],\\n        } as MissionSource)\\n    )\\n    .concat(\\n      [...playerAvailableOrgs, ...playerUnassignedOrgs].map((i) => ({\\n        type: \\\"org\\\",\\n        org: i,\\n        factionId: playerFaction?.id,\\n        missions: i.template?.missionsGrantedNames || [],\\n      }))\\n    )\\n    .concat(\\n      playerStealableOrgs.map((i) => ({\\n        type: \\\"org\\\",\\n        org: i,\\n        factionId: i.faction?.id,\\n        missions: i.template?.missionsGrantedNames || [],\\n      }))\\n    )\\n    .reduce((acc, o) => {\\n      const key = o.factionId || 0;\\n      if (!acc.has(key)) {\\n        acc.set(key, new Map<string, MissionSource[]>());\\n      }\\n      const effectsMap = acc.get(key)!;\\n      o.missions.forEach((m) => {\\n        if (!effectsMap.has(m)) {\\n          effectsMap.set(m, []);\\n        }\\n        effectsMap.get(m)!.push(o);\\n      });\\n      return acc;\\n    }, new Map<number, Map<string, MissionSource[]>>());\\n  const factions = Array.from(sourcesByFactionByMission.keys())\\n    .map((factionId) => factionsById.get(factionId)!)\\n    .filter((f) => f)\\n    .toSorted((a, b) => {\\n      if (a.id === playerFaction.id) return -1;\\n      if (b.id === playerFaction.id) return 1;\\n      return (a.displayName || \\\"\\\").localeCompare(b.displayName || \\\"\\\");\\n    });\\n\\n  const importantMissions = [\\\"Assassinate\\\"];\\n\\n  const councilEffects = scoredModifiedCouncilors.reduce((acc, councilor) => {\\n    return combineEffects(acc, councilor.effectsWithOrgsAndAugments);\\n  }, {} as ShowEffectsProps);\\n\\n  // TODO: would be cool to click an effect icon and sort everything by that (ie. click persuasion icon to see who/org gives most persuasion)\\n  return (\\n    <div className=\\\"space-y-2\\\">\\n      <SmartAccordion\\n        type=\\\"single\\\"\\n        collapsible\\n        storageKey=\\\"councilorsSections\\\"\\n        defaultValue=\\\"existing\\\"\\n      >\\n        <AccordionItem value=\\\"existing\\\">\\n          <AccordionTrigger>\\n            <span\\n              >\\n            Manage Existing Council ({unusedAdmin.toFixed(0)} <Administration />)\\n            </span >\\n          </AccordionTrigger>\\n          <AccordionContent>\\n            <div className=\\\"py-1\\\">\\n              <ShowEffects\\n                incomeBoost_month={councilEffects.incomeBoost_month}\\n                incomeMoney_month={councilEffects.incomeMoney_month}\\n                incomeInfluence_month={councilEffects.incomeInfluence_month}\\n                incomeOps_month={councilEffects.incomeOps_month}\\n                incomeMissionControl={councilEffects.incomeMissionControl}\\n                incomeResearch_month={councilEffects.incomeResearch_month}\\n                projectCapacityGranted={councilEffects.projectCapacityGranted}\\n              />\\n              <ShowEffects\\n                economyBonus={councilEffects.economyBonus}\\n                welfareBonus={councilEffects.welfareBonus}\\n                environmentBonus={councilEffects.environmentBonus}\\n                knowledgeBonus={councilEffects.knowledgeBonus\\n                }\\n                governmentBonus={councilEffects.governmentBonus}\\n                unityBonus={councilEffects.unityBonus}\\n                militaryBonus={councilEffects.militaryBonus\\n                }\\n                oppressionBonus={councilEffects.oppressionBonus}\\n                spoilsBonus={councilEffects.spoilsBonus}\\n                spaceDevBonus={councilEffects.spaceDevBonus}\\n                spaceflightBonus={councilEffects.spaceflightBonus}\\n                MCBonus={councilEffects.MCBonus}\\n                miningBonus={councilEffects.miningBonus}\\n              />\\n              <ShowEffects\\n                councilorTechBonus={councilEffects.councilorTechBonus}\\n                techBonuses={councilEffects.techBonuses}\\n              />\\n            </div >\\n            <Table>\\n              <CouncilorTableHeader hasOrgs />\\n              <TableBody>\\n                {scoredModifiedCouncilors.map((councilor) => (\\n                  <CouncilorTableRow\\n                    key={councilor.id}\\n                    councilor={councilor}\\n                    stats={councilor.effectsWithOrgsAndAugments}\\n                    label={councilor.displayName!}\\n                    hasOrgs\\n                    highlightMissionClassName={currentHighlightMissionClassName}\\n                  />\\n                ))}\\n              </TableBody>\\n            </Table>\\n            <h3 className=\\\"mt-1\\\">Available Organizations:</h3>\\n            <Table>\\n              <OrgTableHeader />\\n              <TableBody>\\n                {scoredOrgs.map((org) => (\\n                  <OrgTableRow\\n                    key={org.id}\\n                    org={org}\\n                    playerNationIds={playerNationIds}\\n                    playerTraits={playerTraits}\\n                    highlightMissionClassName={availableHighlightMissionClassName}\\n                  />\\n                ))}\\n              </TableBody>\\n            </Table>\\n          </AccordionContent>\\n        </AccordionItem>\\n        <AccordionItem value=\\\"new-councilors\\\">\\n          <AccordionTrigger>Find New Councilors</AccordionTrigger>\\n          <AccordionContent>\\n            <h3 className=\\\"mt-1\\\">Available Councilors:</h3>\\n            <Table>\\n              <CouncilorTableHeader />\\n              <TableBody>\\n                {scoredAvailableCouncilors.map((councilor) => (\\n                  <CouncilorTableRow\\n                    key={councilor.id}\\n                    councilor={councilor}\\n                    stats={councilor.effectsBaseAndUnaugmentedTraits}\\n                    label={councilor.displayName!}\\n                    highlightMissionClassName={availableHighlightMissionClassName}\\n                  />\\n                ))}\\n              </TableBody>\\n            </Table>\\n\\n            <h3 className=\\\"mt-1\\\">Unmodified Active Councilors:</h3>\\n            <Table>\\n              <CouncilorTableHeader />\\n              <TableBody>\\n                {scoredBaseCouncilors.map((councilor) => (\\n                  <CouncilorTableRow\\n                    key={`${councilor.id}-base`}\\n                    councilor={councilor}\\n                    stats={councilor.effectsBaseAndUnaugmentedTraits}\\n                    label={`${councilor.displayName}`}\\n                    highlightMissionClassName={currentHighlightMissionClassName}\\n                  />\\n                ))}\\n              </TableBody>\\n            </Table>\\n          </AccordionContent>\\n        </AccordionItem>\\n        <AccordionItem value=\\\"current-orgs\\\">\\n          <AccordionTrigger>Current Organizations</AccordionTrigger>\\n          <AccordionContent>\\n            <Table>\\n              <OrgTableHeader costHeader=\\\"Councilor\\\" />\\n              <TableBody>\\n                {scoredOwnedOrgs.toReversed().map((org) => (\\n                  <OrgTableRow\\n                    key={org.id}\\n                    org={org}\\n                    playerNationIds={playerNationIds}\\n                    playerTraits={playerTraits}\\n                    highlightMissionClassName={availableHighlightMissionClassName}\\n                  />\\n                ))}\\n              </TableBody>\\n            </Table>\\n          </AccordionContent>\\n        </AccordionItem>\\n        <AccordionItem value=\\\"takeover\\\">\\n          <AccordionTrigger>Hostile Takeover</AccordionTrigger>\\n          <AccordionContent>\\n            <SmartTabs\\n              storageKey=\\\\\\\"councilorsTakeoverTabs\\\\\\\"\\n              defaultValue={`faction-${Array.from(stealableOrgsByFaction.keys())[0]}`}\\n            >\\n              <TabsList>\\n                {Array.from(stealableOrgsByFaction.entries()).map(([factionId, orgs]) => (\\n                  <TabsTrigger key={factionId} value={`faction-${factionId}`}>\\n                    {orgs[0].faction?.displayName || \\\\\\\"Unknown Faction\\\\\\\"} ({orgs.length})\\n                  </TabsTrigger>\\n                ))}\\n              </TabsList>\\n              {Array.from(stealableOrgsByFaction.entries()).map(([factionId, orgs]) => (\\n                <TabsContent key={factionId} value={`faction-${factionId}`}>\\n                  <Table>\\n                    <OrgTableHeader costHeader=\\\\\\\"Takeover\\\\\\\" />\\n                    <TableBody>\\n                      {orgs.map((org) => (\\n                        <OrgTableRow\\n                          key={org.id}\\n                          org={org}\\n                          playerNationIds={playerNationIds}\\n                          playerTraits={playerTraits}\\n                          highlightMissionClassName={availableHighlightMissionClassName}\\n                          isTakeover\\n                        />\\n                      ))}\\n                    </TableBody>\\n                  </Table>\\n                </TabsContent>\\n              ))}\\n            </SmartTabs>\\n          </AccordionContent>\\n        </AccordionItem>\\n        <AccordionItem value=\\\\\\\"missions\\\\\\\">\\n          <AccordionTrigger>Missions</AccordionTrigger>\\n          <AccordionContent>\\n            <SmartTabs storageKey=\\\\\\\"councilorsMissionsTabs\\\\\\\" defaultValue={`faction-${factions[0].id}`}>\\n              <TabsList>\\n                {factions.map((faction) => (\\n                  <TabsTrigger key={faction.id} value={`faction-${faction.id}`}>\\n                    {faction.displayName || \\\\\\\"Unknown Faction\\\\\\\"} ({sourcesByFactionByMission.get(faction.id)?.size || 0})\\n                    {importantMissions\\n                      .filter(\\n                        (m) =>\\n                          sourcesByFactionByMission\\n                            .get(faction.id)\\n                            ?.get(m)\\n                            ?.filter((i) => i.type === \\\\\\\"councilor\\\\\\\")?.length ?? 0 > 0\\n                      )\\n                      .map((m) => {\\n                        const MissionIcon = MissionIcons[m] || UnknownIcon;\\n                        return (\\n                          <span key={m} className=\\\\\\\"inline-block -mt-2\\\\\\\">\\n                            <MissionIcon className=\\\\\\\"h-4 w-4\\\\\\\" />\\n                          </span >\\n                        );\\n                      })}\\n                  </TabsTrigger>\\n                ))}\\n              </TabsList>\\n              {factions.map((faction) => (\\n                <TabsContent key={faction.id} value={`faction-${faction.id}`}>\\n                  <SmartAccordion type=\\\\\\\"single\\\\\\\" collapsible storageKey={`councilorsMissions-${faction.id}`}>\\n                    {Array.from(\\n                      new Set([\\n                        ...importantMissions,\\n                        ...Array.from(sourcesByFactionByMission.get(faction.id)?.keys() || []),\\n                      ]),\\n                    ).map((missionName) => {\\n                      const sources = sourcesByFactionByMission.get(faction.id)?.get(missionName) || [];\\n                      const MissionIcon = MissionIcons[missionName] || UnknownIcon;\\n                      return (\\n                        <AccordionItem key={missionName} value={missionName}>\\n                          <AccordionTrigger>\\n                            <span\\n                              >\\n                            <MissionIcon /> {missionName} &ndash;{\\\\\\\" \\\\\\\"}\\n                            {sources.filter((i) => i.type === \\\\\\\"councilor\\\\\\\").length} Councilors &lt;-{\\\\\\\" \\\\\\\"}\\n                            {sources.filter((i) => i.type === \\\\\\\"org\\\\\\\").length} Orgs\\n                          </span >\\n                          </AccordionTrigger>\\n                          <AccordionContent>\\n                            <Table>\\n                              <TableHeader>\\n                                <TableRow>\\n                                  <TableHead>Fleet Name</TableHead>\\n                                  <TableHead>Planet</TableHead>\\n                                  <TableHead>Target Orbit</TableHead>\\n                                  <TableHead>Arrival Date</TableHead>\\n                                  <TableHead className=\\\\\\\"text-right\\\\\\\">Days to Arrival</TableHead>\\n                                  <TableHead className=\\\\\\\"text-right\\\\\\\">MC Used</TableHead>\\n                                  <TableHead className=\\\\\\\"text-right\\\\\\\">Marine CP</TableHead>\\n                                  <TableHead className=\\\\\\\"text-right\\\\\\\">Total Mass</TableHead>\\n                                  <TableHead className=\\\\\\\"text-right\\\\\\\">Max Ship Mass</TableHead>\\n                                  <TableHead>Ships Hulls</TableHead>\\n                                  <TableHead>Ships Roles</TableHead>\\n                                  <TableHead>Operation</TableHead>\\n                                  <TableHead>Operation Complete</TableHead>\\n                                </TableRow>\\n                              </TableHeader>\\n                              <TableBody>\\n                                {sources?.map((src) => (\\n                                  src.type === \\\\\\\"org\\\\\\\" ? (\\n                                    <OrgTableRow\\n                                      key={`councilor-${src.org.id}-mission-${missionName}`}\\n                                      org={src.org}\\n                                      playerNationIds={playerNationIds}\\n                                      playerTraits={playerTraits}\\n                                    />\\n                                  ) : (\\n                                    <CouncilorTableRow\\n                                      key={`org-${src.councilor.id}-mission-${missionName}`}\\n                                      councilor={src.councilor}\\n                                      stats={src.councilor.effectsWithOrgsAndAugments}\\n                                      label={src.councilor.displayName!}\\n                                    />\\n                                  )\\n                                ))}\\n                              </TableBody>\\n                            </Table>\\n                          </AccordionContent>\\n                        </AccordionItem>\\n                      );\\n                    })}\\n                  </SmartAccordion>\\n                </TabsContent>\\n              ))}\\n            </SmartTabs>\\n          </AccordionContent>\\n        </AccordionItem>\\n        <AccordionItem value=\\\\\\\"other-councilors\\\\\\\">\\n          <AccordionTrigger>Other Councilors</AccordionTrigger>\\n          <AccordionContent>\\n            <OtherCouncilorsByFaction {...{ analysis, weights }} />\\n          </AccordionContent>\\n        </AccordionItem>\\n      </SmartAccordion>\\\\n\\\\n      <div className=\\\\\\\"my-4\\\\\\\">\\\\n        <ScoringWeightsDialog weights={weights} onWeightsChange={setWeights} />\\\\n      </div >\\\\n\\\\n      <Collapsible>\\\\n        <CollapsibleTrigger asChild>\\\\n          <Button variant=\\\\\\\"outline\\\\\\\">Debug Data</Button>\\\\n        </CollapsibleTrigger>\\\\n        <CollapsibleContent>\\\\n          <pre>{JSON.stringify(analysis.playerFaction, null, 2)}</pre>\\\\n        </CollapsibleContent>\\\\n      </Collapsible>\\\\n    </div >\\\\n  );\\\\n}\\\\n\\\\nfunction OtherCouncilorsByFaction({ analysis, weights }: { analysis: Analysis; weights: ScoringWeights }) {\\\\n  const { playerVisibleCouncilors, factionsById } = analysis;\\\\n\\\\n  const scoredBaseCouncilors = scoreAndSort(\\\\n    playerVisibleCouncilors,\\\\n    weights,\\\\n    new Map<MissionDataName, number>(),\\\\n    getBaseCouncilorScore\\\\n  );\\\\n\\\\n  const councilorsByFactionId = scoredBaseCouncilors.reduce((acc, councilor) => {\\\\n    const factionId = councilor.factionId || 0;\\\\n    if (!factionId) return acc;\\\\n    if (!acc.has(factionId)) {\\\\n      acc.set(factionId, []);\\\\n    }\\\\n    acc.get(factionId)!.push(councilor);\\\\n    return acc;\\\\n  }, new Map<number, Analysis[\\\\\\\"playerCouncilors\\\\\\\"][number][]>());\\\\n\\\\n  const factions = Array.from(councilorsByFactionId.keys())\\\\n    .map((i) => factionsById.get(i!)!)\\\\n    .filter((i) => i.id !== analysis.alienFaction.id);\\\\n\\\\n  return (\\\\n    <Tabs defaultValue={`faction-${factions[0].id}`}>\\\\n      <TabsList>\\\\n        {factions\\\\n          .filter((i) => i.id !== analysis.alienFaction.id)\\\\n          .map((faction) => (\\\\n            <TabsTrigger key={faction.id} value={`faction-${faction.id}`}>\\\\n              {faction.displayName || \\\\\\\"Unknown Faction\\\\\\\"} ({councilorsByFactionId.get(faction.id)?.length || 0})\\\\n            </TabsTrigger>\\\\n          ))}\\\\n      </TabsList>\\\\n      {factions.map((faction) => (\\\\n        <TabsContent key={faction.id} value={`faction-${faction.id}`}>\\\\n          <Table>\\\\n            <TableHeader>\\\\n              <TableRow>\\\\n                <TableHead>Name</TableHead>\\\\n                <TableHead>Modified Stats</TableHead>\\\\n                <TableHead>Org Tiers</TableHead>\\\\n                <TableHead>Monthly Effects</TableHead>\\\\n                <TableHead>Priorities</TableHead>\\\\n                <TableHead>Science</TableHead>\\\\n                <TableHead>Missions</TableHead>\\\\n                <TableHead>Score</TableHead>\\\\n                <TableHead>NM Score</TableHead>\\\\n                <TableHead>CP Cap</TableHead>\\\\n              </TableRow>\\\\n            </TableHeader>\\\\n            <TableBody>\\\\n              {councilorsByFactionId.get(faction.id)?.map((councilor) => (\\\\n                <CouncilorTableRow\\\\n                  key={councilor.id}\\\\n                  councilor={councilor}\\\\n                  stats={councilor.effectsBaseAndUnaugmentedTraits}\\\\n                  label={councilor.displayName!}\\\\n                />\\\\n              ))}\\\\n            </TableBody>\\\\n          </Table>\\\\n        </TabsContent>\\\\n      ))}\\\\n    </Tabs>\\\\n  );\\\\n}\\\\n\\\\nfunction scoreAndSort<T>(\\\\n  items: T[],\\\\n  weights: ScoringWeights,\\\\n  haveMissions: Map<MissionDataName, number>,\\\\n  scoreFn: (item: T, weights: ScoringWeights, haveMissions: Map<MissionDataName, number>) => ScoreResult,\\\\n  scoreSort: \\\\\\\"value\\\\\\\" | \\\\\\\"noMissionScore\\\\\\\" = \\\\\\\"value\\\\\\\"\\\\n) {\\\\n  const scoredItems = items.map((item) => {\\\\n    const scoreResult = scoreFn(item, weights, haveMissions);\\\\n    return { ...item, score: scoreResult };\\\\n  });\\\\n  scoredItems.sort((a, b) => b.score[scoreSort] - a.score[scoreSort]);\\\\n  return scoredItems;\\\\n}\\\\n\\\\nfunction getBaseCouncilorScore(\\\\n  councilor: Analysis[\\\\\\\"playerCouncilors\\\\\\\"][number],\\\\n  weights: ScoringWeights,\\\\n  haveMissions: Map<MissionDataName, number>\\\\n): ScoreResult {\\\\n  return getScore(councilor.effectsBaseAndUnaugmentedTraits, weights, haveMissions, true);\\\\n}\\\\n\\\\nfunction getModifiedCouncilorScore(\\\\n  councilor: Analysis[\\\\\\\"playerCouncilors\\\\\\\"][number],\\\\n  weights: ScoringWeights,\\\\n  haveMissions: Map<MissionDataName, number>\\\\n): ScoreResult {\\\\n  return getScore(councilor.effectsWithOrgsAndAugments, weights, haveMissions, true);\\\\n}\\\\n\\\\nconst orgTransferFactor = 0.2;\\\\nfunction getOrganizationScore(\\\\n  org: Analysis[\\\\\\\"playerAvailableOrgs\\\\\\\"][number] & { type: string },\\\\n  weights: ScoringWeights,\\\\n  haveMissions: Map<MissionDataName, number>\\\\n): ScoreResult {\\\\n  return getScore(\\\\n    {\\\\n      ...org,\\\\n      techBonuses: org.template?.techBonuses,\\\\n      missionsGrantedNames: org.template?.missionsGrantedNames || [],\\\\n      ...(org.type === \\\\\\\"available\\\\\\\"\\\\n        ? {}\\\\n        : {\\\\n            // already-purchased orgs seem to cost ~30% to transfer\\\\n            costMoney: (org.costMoney || 0) * orgTransferFactor,\\\\n            costInfluence: (org.costInfluence || 0) * orgTransferFactor,\\\\n            costOps: (org.costOps || 0) * orgTransferFactor,\\\\n            costBoost: (org.costBoost || 0) * orgTransferFactor,\\\\n          }),\\\\n    },\\\\n    weights,\\\\n    haveMissions\\\\n  );\\\\n}\\\\n\\\\ninterface ScoreResult {\\\\n  value: number;\\\\n  noMissionScore: number;\\\\n  details: string;\\\\n}\\\\n\\\\nfunction getScore(\\\\n  org: ShowEffectsProps,\\\\n  weights: ScoringWeights,\\\\n  haveMissions: Map<MissionDataName, number>,\\\\n  ignoreTier: boolean = false\\\\n): ScoreResult {\\\\n  let totalScore = 0;\\\\n  const details: string[] = [];\\\\n\\\\n  // Helper to add score for a numeric attribute\\\\n  const addScore = (name: string, value: number | undefined, weight: number | undefined, noNegative?: boolean) => {\\\\n    let actualValue = value || 0;\\\\n    if (noNegative) {\\\\n      actualValue = Math.max(0, actualValue);\\\\n    }\\\\n    const actualWeight = weight ?? 0;\\\\n\\\\n    // Skip if value or weight is 0/undefined/null\\\\n    if (!actualValue || !actualWeight) return;\\\\n\\\\n    const contribution = actualValue * actualWeight;\\\\n    totalScore += contribution;\\\\n    details.push(\\\\n      `${name}: ${parseFloat(actualValue.toFixed(2))} × ${parseFloat(actualWeight.toFixed(3))} = ${contribution.toFixed(\\\\n        3\\\\n      )}`\\\\n    );\\\\n  };\\\\n\\\\n  // Councilor attributes\\\\n  addScore(\\\\\\\"persuasion\\\\\\\", org.persuasion, weights.persuasion, true);\\\\n  addScore(\\\\\\\"command\\\\\\\", org.command, weights.command, true);\\\\n  addScore(\\\\\\\"investigation\\\\\\\", org.investigation, weights.investigation, true);\\\\n  addScore(\\\\\\\"espionage\\\\\\\", org.espionage, weights.espionage, true);\\\\n  addScore(\\\\\\\"administration\\\\\\\", org.administration, weights.administration, true);\\\\n  addScore(\\\\\\\"science\\\\\\\", org.science, weights.science, true);\\\\n  addScore(\\\\\\\"security\\\\\\\", org.security, weights.security, true);\\\\n  addScore(\\\\\\\"Persuasion\\\\\\\", org.Persuasion, weights.persuasion, true);\\\\n  addScore(\\\\\\\"Command\\\\\\\", org.Command, weights.command, true);\\\\n  addScore(\\\\\\\"Investigation\\\\\\\", org.Investigation, weights.investigation, true);\\\\n  addScore(\\\\\\\"Espionage\\\\\\\", org.Espionage, weights.espionage, true);\\\\n  addScore(\\\\\\\"Administration\\\\\\\", org.Administration, weights.administration, true);\\\\n  addScore(\\\\\\\"Science\\\\\\\", org.Science, weights.science, true);\\\\n  addScore(\\\\\\\"Security\\\\\\\", org.Security, weights.security, true);\\\\n  addScore(\\\\\\\"xpModifier\\\\\\\", org.xpModifier, weights.xpModifier);\\\\n  addScore(\\\\\\\"xp\\\\\\\", org.xp, weights.xp);\\\\n\\\\n  // Monthly income/costs\\\\n  addScore(\\\\\\\"incomeBoost_month\\\\\\\", org.incomeBoost_month, weights.incomeBoost_month);\\\\n  addScore(\\\\\\\"incomeMoney_month\\\\\\\", org.incomeMoney_month, weights.incomeMoney_month);\\\\n  addScore(\\\\\\\"incomeInfluence_month\\\\\\\", org.incomeInfluence_month, weights.incomeInfluence_month);\\\\n  addScore(\\\\\\\"incomeOps_month\\\\\\\", org.incomeOps_month, weights.incomeOps_month);\\\\n  addScore(\\\\\\\"incomeMissionControl\\\\\\\", org.incomeMissionControl, weights.incomeMissionControl);\\\\n  addScore(\\\\\\\"incomeResearch_month\\\\\\\", org.incomeResearch_month, weights.incomeResearch_month);\\\\n  addScore(\\\\\\\"projectCapacityGranted\\\\\\\", org.projectCapacityGranted, weights.projectCapacityGranted);\\\\n\\\\n  // Purchase costs\\\\n  addScore(\\\\\\\"costMoney\\\\\\\", org.costMoney, weights.costMoney);\\\\n  addScore(\\\\\\\"costInfluence\\\\\\\", org.costInfluence, weights.costInfluence);\\\\n  addScore(\\\\\\\"costOps\\\\\\\", org.costOps, weights.costOps);\\\\n  addScore(\\\\\\\"costBoost\\\\\\\", org.costBoost, weights.costBoost);\\\\n\\\\n  // Priority bonuses\\\\n  addScore(\\\\\\\"economyBonus\\\\\\\", org.economyBonus, weights.economyBonus);\\\\n  addScore(\\\\\\\"welfareBonus\\\\\\\", org.welfareBonus, weights.welfareBonus);\\\\n  addScore(\\\\\\\"environmentBonus\\\\\\\", org.environmentBonus, weights.environmentBonus);\\\\n  addScore(\\\\\\\"knowledgeBonus\\\\\\\", org.knowledgeBonus, weights.knowledgeBonus);\\\\n  addScore(\\\\\\\"governmentBonus\\\\\\\", org.governmentBonus, weights.governmentBonus);\\\\n  addScore(\\\\\\\"unityBonus\\\\\\\", org.unityBonus, weights.unityBonus);\\\\n  addScore(\\\\\\\"militaryBonus\\\\\\\", org.militaryBonus, weights.militaryBonus);\\\\n  addScore(\\\\\\\"oppressionBonus\\\\\\\", org.oppressionBonus, weights.oppressionBonus);\\\\n  addScore(\\\\\\\"spoilsBonus\\\\\\\", org.spoilsBonus, weights.spoilsBonus);\\\\n  addScore(\\\\\\\"spaceDevBonus\\\\\\\", org.spaceDevBonus, weights.spaceDevBonus);\\\\n  addScore(\\\\\\\"spaceflightBonus\\\\\\\", org.spaceflightBonus, weights.spaceflightBonus);\\\\n  addScore(\\\\\\\"MCBonus\\\\\\\", org.MCBonus, weights.MCBonus);\\\\n  addScore(\\\\\\\"miningBonus\\\\\\\", org.miningBonus, weights.miningBonus);\\\\n\\\\n  // Tech bonuses from councilor/traits\\\\n  if (weights.councilorTechBonus && org?.councilorTechBonus) {\\\\n    for (const { category, bonus } of org.councilorTechBonus) {\\\\n      const weight = weights.councilorTechBonus[category];\\\\n      addScore(`councilorTechBonus[${category}]`, bonus, weight);\\\\n    }\\\\n  }\\\\n\\\\n  // Tech bonuses from orgs\\\\n  if (weights.techBonues && org?.techBonues) {\\\\n    for (const { category, bonus } of org.techBonues) {\\\\n      const weight = weights.techBonues[category];\\\\n      addScore(`techBonus[${category}]`, bonus, weight);\\\\n    }\\\\n  }\\\\n\\\\n  let noMissionScore = totalScore;\\\\n\\\\n  // Missions granted\\\\n  if (weights.missions && org?.missionsGrantedNames) {\\\\n    for (const missionName of org.missionsGrantedNames) {\\\\n      const weight = weights.missions[missionName];\\\\n      addScore(`mission[${missionName}]`, 1, weight);\\\\n\\\\n      // Extra weight for missing missions\\\\n      if (weights.extraWeightForMissingMissions && (haveMissions.get(missionName) || 0) === 0) {\\\\n        totalScore += weights.extraWeightForMissingMissions;\\\\n        details.push(\\\\n          `mission[${missionName}]: missing bonus × ${parseFloat(\\\\n            weights.extraWeightForMissingMissions.toFixed(3)\\\\n          )} = ${weights.extraWeightForMissingMissions.toFixed(3)}`\\\\n        );\\\\n      }\\\\n      if (weights.extraWeightForSingleMissions && (haveMissions.get(missionName) || 0) === 1) {\\\\n        totalScore += weights.extraWeightForSingleMissions;\\\\n        details.push(\\\\n          `mission[${missionName}]: single bonus × ${parseFloat(\\\\n            weights.extraWeightForSingleMissions.toFixed(3)\\\\n          )} = ${weights.extraWeightForSingleMissions.toFixed(3)}`\\\\n        );\\\\n      }\\\\n    }\\\\n  }\\\\n\\\\n  // Divide by tier to normalize for org cost/power\\\\n  const tier = org.tier || 1;\\\\n  let finalScore = totalScore;\\\\n\\\\n  if (tier > 1 && !ignoreTier) {\\\\n    const tierFactor = Math.pow(tier, weights.orgTierExponent);\\\\n    finalScore = totalScore / tierFactor;\\\\n    noMissionScore /= tierFactor;\\\\n    details.push(`Subtotal: ${totalScore.toFixed(3)}`);\\\\n    details.push(`Divided by ${tierFactor.toFixed(2)} for tier ${tier}: ${finalScore.toFixed(3)}`);\\\\n  }\\\\n\\\\n  return {\\\\n    value: finalScore,\\\\n    noMissionScore,\\\\n    details: details.join(\\\\\\\"\\\\\\\\n\\\\\\\"),\\\\n  };\\\\n}\\\\\\n\",\"oldString\":\"\\\"use client\\\";\\n\\nimport { useState, useEffect } from \\\"react\\\";\\nimport { combineEffects, ShowEffects, ShowEffectsProps } from \\\"@/components/showEffects\\\";\\nimport { AccordionContent, AccordionItem, AccordionTrigger } from \\\"@/components/ui/accordion\\\";\\nimport { SmartAccordion } from \\\"@/components/ui/smart-accordion\\\";\\nimport { Button } from \\\"@/components/ui/button\\\";\\nimport { Collapsible, CollapsibleContent, CollapsibleTrigger } from \\\"@/components/ui/collapsible\\\";\\nimport { Tooltip, TooltipContent, TooltipTrigger } from \\\"@/components/ui/tooltip\\\";\\nimport { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from \\\"@/components/ui/table\\\";\\nimport { Analysis } from \\\"@/lib/analysis\\\";\\nimport { MissionDataName, TraitDataName } from \\\"@/lib/template-types-generated\\\";\\nimport { MinusCircleIcon, PlusCircleIcon } from \\\"lucide-react\\\";\\nimport { defaultScoringWeights, loadWeightsFromStorage, ScoringWeights, ScoringWeightsDialog } from \\\"./scoringWeights\\\";\\nimport { Administration, MissionIcons, TraitIcons, UnknownIcon } from \\\"@/components/icons\\\";\\nimport { Tabs, TabsContent, TabsList, TabsTrigger } from \\\"@/components/ui/tabs\\\";\\nimport { SmartTabs } from \\\"@/components/ui/smart-tabs\\\";\\nimport { twMerge } from \\\"tailwind-merge\\\";\\n\\nfunction CouncilorTableHeader({ hasOrgs }: { hasOrgs?: boolean }) {\\n  return (\\n    <TableHeader>\\n      <TableRow>\\n        <TableHead>Name</TableHead>\\n        <TableHead>Modified Stats</TableHead>\\n        {hasOrgs && <TableHead>Org Tiers</TableHead>}\\n        <TableHead>Monthly Effects</TableHead>\\n        <TableHead>Priorities</TableHead>\\n        <TableHead>Science</TableHead>\\n        <TableHead>Missions</TableHead>\\n        <TableHead>Score</TableHead>\\n        <TableHead>NM Score</TableHead>\\n        <TableHead>CP Cap</TableHead>\\n      </TableRow>\\n    </TableHeader>\\n  );\\n}\\n\\nfunction OrgTableHeader({ costHeader }: { costHeader?: string }) {\\n  return (\\n    <TableHeader>\\n      <TableRow>\\n        <TableHead>Org Name</TableHead>\\n        <TableHead>Requirements</TableHead>\\n        <TableHead>Tier</TableHead>\\n        {costHeader ? <TableHead>{costHeader}</TableHead> : <TableHead>Purchase / Transfer</TableHead>}\\n        <TableHead>Monthly</TableHead>\\n        <TableHead>Effects</TableHead>\\n        <TableHead>Score</TableHead>\\n        <TableHead>NM Score</TableHead>\\n      </TableRow>\\n    </TableHeader>\\n  );\\n}\\n\\nfunction CouncilorTableRow({\\n  councilor,\\n  stats,\\n  label,\\n  hasOrgs,\\n  highlightMissionClassName,\\n}: {\\n  councilor: Analysis[\\\"playerCouncilors\\\"][number] & { score?: ScoreResult };\\n  stats: Analysis[\\\"playerCouncilors\\\"][number][\\\"effectsWithOrgsAndAugments\\\"];\\n  label: string;\\n  hasOrgs?: boolean;\\n  highlightMissionClassName?: (missionName: MissionDataName) => string | undefined;\\n}) {\\n  const admin = Math.min(25, Math.max(0, (stats.administration || 0) + (stats.Administration || 0)));\\n  const orgTiers = councilor.orgs.reduce((a, b) => a + b.tier, 0);\\n  const cpCap =\\n    Math.min(25, Math.max(0, stats.persuasion || 0) + Math.max(0, stats.Persuasion || 0)) +\\n    Math.min(25, Math.max(0, stats.command || 0) + Math.max(0, stats.Command || 0)) +\\n    Math.min(25, Math.max(0, stats.administration || 0) + Math.max(0, stats.Administration || 0));\\n  return (\\n    <TableRow key={`${councilor.id}-${label}`}>\\n      <TableCell>{label}</TableCell>\\n      <TableCell>\\n        <ShowEffects\\n          persuasion={stats.persuasion}\\n          command={stats.command}\\n          investigation={stats.investigation}\\n          espionage={stats.espionage}\\n          administration={stats.administration}\\n          science={stats.science}\\n          security={stats.security}\\n          Persuasion={stats.Persuasion}\\n          Command={stats.Command}\\n          Investigation={stats.Investigation}\\n          Espionage={stats.Espionage}\\n          Administration={stats.Administration}\\n          Science={stats.Science}\\n          Security={stats.Security}\\n          ApparentLoyalty={stats.ApparentLoyalty}\\n          Loyalty={stats.Loyalty}\\n          maxLoyalty={stats.maxLoyalty}\\n          xpModifier={stats.xpModifier}\\n          xp={stats.xp}\\n          traitTemplateNames={stats.traitTemplateNames}\\n          typeTemplateName={stats.typeTemplateName}\\n          playerIntel={stats.playerIntel}\\n          playerMaxIntel={stats.playerMaxIntel}\\n          lastRecordedLoyalty={stats.lastRecordedLoyalty}\\n          // TODO: is there a case where we should show this?\\n          // Loyalty={stats.Loyalty}\\n        />\\n      </TableCell>\\n      {hasOrgs && (\\n        <TableCell>\\n          <ShowEffects tier={stats.tier} highlightTier={orgTiers < admin} />\\n        </TableCell>\\n      )}\\n      <TableCell>\\n        <ShowEffects\\n          incomeBoost_month={stats.incomeBoost_month}\\n          incomeMoney_month={stats.incomeMoney_month}\\n          incomeInfluence_month={stats.incomeInfluence_month}\\n          incomeOps_month={stats.incomeOps_month}\\n          incomeMissionControl={stats.incomeMissionControl}\\n          incomeResearch_month={stats.incomeResearch_month}\\n          projectCapacityGranted={stats.projectCapacityGranted}\\n        />\\n      </TableCell>\\n      <TableCell>\\n        <span className=\\\"text-wrap leading-6 -my-2 inline-block\\\">\\n          <ShowEffects\\n            economyBonus={stats.economyBonus}\\n            welfareBonus={stats.welfareBonus}\\n            environmentBonus={stats.environmentBonus}\\n            knowledgeBonus={stats.knowledgeBonus}\\n            governmentBonus={stats.governmentBonus}\\n            unityBonus={stats.unityBonus}\\n            militaryBonus={stats.militaryBonus}\\n            oppressionBonus={stats.oppressionBonus}\\n            spoilsBonus={stats.spoilsBonus}\\n            spaceDevBonus={stats.spaceDevBonus}\\n            spaceflightBonus={stats.spaceflightBonus}\\n            MCBonus={stats.MCBonus}\\n            miningBonus={stats.miningBonus}\\n          />\\n        </span >\\n      </TableCell>\\n      <TableCell>\\n        <span className=\\\"text-wrap leading-6 -my-2 inline-block\\\">\\n          <ShowEffects\\n            councilorTechBonus={stats.councilorTechBonus}\\n            techBonuses={stats.techBonuses}\\n          />\\n        </span >\\n      </TableCell>\\n      <TableCell>\\n        <span className=\\\"text-wrap leading-6 -my-2 inline-block\\\">\\n          <ShowEffects\\n            missionsGrantedNames={stats.missionsGrantedNames}\\n            highlightMissionClassName={highlightMissionClassName}\\n          />\\n        </span >\\n      </TableCell>\\n      {councilor.score === undefined ? null : (\\n        <>\\n          <TableCell>\\n            <Tooltip>\\n              <TooltipTrigger>{councilor.score.value?.toFixed(2)}</TooltipTrigger>\\n              <TooltipContent align=\\\"end\\\" className=\\\"max-w-auto\\\">\\n                <pre className=\\\"p-2\\\">{councilor.score.details}</pre>\\n              </TooltipContent>\\n            </Tooltip>\\n          </TableCell>\\n          <TableCell>{councilor.score.noMissionScore?.toFixed(2)}</TableCell>\\n          <TableCell>{cpCap?.toFixed(0)}</TableCell>\\n        </>\\n      )}\\n    </TableRow>\\n  );\\n}\\n\\nfunction OrgTableRow({\\n  org,\\n  playerNationIds,\\n  playerTraits,\\n  highlightMissionClassName,\\n  isTakeover,\\n}: {\\n  org: Analysis[\\\"playerAvailableOrgs\\\"][number] & {\\n    type?: string;\\n    score?: ScoreResult;\\n    councilor?: string;\\n    councilorId?: number;\\n  };\\n  playerNationIds: Set<number>;\\n  playerTraits: Set<string>;\\n  highlightMissionClassName?: (missionName: MissionDataName) => string | undefined;\\n  isTakeover?: boolean;\\n}) {\\n  const missingRequiredTraits = org.template?.requiredOwnerTraits?.filter((t) => !playerTraits.has(t)) || [];\\n  function traitIcon(trait: TraitDataName, Fallback: typeof PlusCircleIcon) {\\n    return TraitIcons[trait] || Fallback;\\n  }\\n  return (\\n    <TableRow\\n      key={org.id}\\n      className={twMerge(org.isAdminOrg ? \\\"bg-green-100\\\" : \\\"\\\", org.type === \\\"unassigned\\\" ? \\\"bg-yellow-100\\\" : \\\"\\\")}\\n    >\\n      <TableCell>{org.displayName}</TableCell>\\n      <TableCell>\\n        {org.template?.requiresNationality && (\\n          <span className=\\\"mr-1\\\" title={`Required Nation: ${org.homeNationName || \\\"\\\"}`}>\\n            {playerNationIds.has(org.homeNationId || -1) ? (\\n              <PlusCircleIcon className=\\\"inline h-4 w-4 stroke-green-700 -mt-1 bg-transparent\\\" />\\n            ) : (\\n              <MinusCircleIcon className=\\\"inline h-4 w-4 stroke-destructive -mt-1\\\" />\\n            )}\\n          </span >\\n        )}\\n        {org.template?.requiredOwnerTraits && (\\n          <span className=\\\"mr-1\\\" title={\\\"Required Traits: \\\" + org.template.requiredOwnerTraits.join(\\\", \\\")}>\\n            {missingRequiredTraits.length === 0\\n              ? org.template.requiredOwnerTraits.map((trait, ix) => {\\n                  const Icon = traitIcon(trait, PlusCircleIcon);\\n                  return <Icon key={ix} className=\\\"inline h-4 w-4 stroke-green-700 -mt-1\\\" />;\\n                })\\n              : missingRequiredTraits.map((trait, ix) => {\\n                  const Icon = traitIcon(trait, MinusCircleIcon);\\n                  return <Icon key={ix} className=\\\"inline h-4 w-4 stroke-destructive -mt-1\\\" />;\\n                })}\\n          </span >\\n        )}\\n        {org.template?.prohibitedOwnerTraits && (\\n          <span className=\\\"mr-1\\\" title={\\\"Prohibited Traits: \\\" + org.template.prohibitedOwnerTraits.join(\\\", \\\")}>\\n            {org.template.prohibitedOwnerTraits.map((trait, ix) => {\\n              const Icon = traitIcon(trait, MinusCircleIcon);\\n              return <Icon key={ix} className=\\\"inline h-4 w-4 stroke-blue-700 -mt-1\\\" />;\\n            })}\\n          </span >\\n        )}\\n      </TableCell>\\n      <TableCell>\\n        <ShowEffects tier={org.tier} />\\n      </TableCell>\\n      <TableCell>\\n        {org.type === \\\"unassigned\\\" && \\\"T \\\"}\\n        {org.type === \\\"available\\\" || org.type === \\\"unassigned\\\" ? (\\n          <ShowEffects\\n            costMoney={(org.costMoney || 0) * (org.type === \\\"available\\\" ? 1 : orgTransferFactor)}\\n            costInfluence={(org.costInfluence || 0) * (org.type === \\\"available\\\" ? 1 : orgTransferFactor)}\\n            costOps={(org.costOps || 0) * (org.type === \\\"available\\\" ? 1 : orgTransferFactor)}\\n            costBoost={(org.costBoost || 0) * (org.type === \\\"available\\\" ? 1 : orgTransferFactor)}\\n          />\\n        ) : org.type == \\\"stealable\\\" && isTakeover ? (\\n          (() => {\\n            const target = org as any as Analysis[\\\"playerStealableOrgs\\\"][number];\\n            return (\\n              <>\\n                {target.councilor ?? \\\"Unassigned\\\"} from {target.faction?.displayName}, Admin: {target.admin} +\\n                takeoverDefense: {target.takeoverDefense}\\n              </>\\n            );\\n          })()\\n        ) : org.type === \\\"used\\\" ? (\\n          <>{org.councilor ?? \\\"Unassigned\\\"}</>\\n        ) : null}\\n      </TableCell>\\n      <TableCell>\\n        <ShowEffects\\n          incomeBoost_month={org.incomeBoost_month}\\n          incomeMoney_month={org.incomeMoney_month}\\n          incomeInfluence_month={org.incomeInfluence_month}\\n          incomeOps_month={org.incomeOps_month}\\n          incomeMissionControl={org.incomeMissionControl}\\n          incomeResearch_month={org.incomeResearch_month}\\n          projectCapacityGranted={org.projectCapacityGranted}\\n        />\\n      </TableCell>\\n      <TableCell>\\n        <ShowEffects\\n          persuasion={org.persuasion}\\n          command={org.command}\\n          investigation={org.investigation}\\n          espionage={org.espionage}\\n          administration={org.administration}\\n          science={org.science}\\n          security={org.security}\\n          economyBonus={org.economyBonus}\\n          welfareBonus={org.welfareBonus}\\n          environmentBonus={org.environmentBonus}\\n          knowledgeBonus={org.knowledgeBonus}\\n          governmentBonus={org.governmentBonus}\\n          unityBonus={org.unityBonus}\\n          militaryBonus={org.militaryBonus}\\n          oppressionBonus={org.oppressionBonus}\\n          spoilsBonus={org.spoilsBonus}\\n          spaceDevBonus={org.spaceDevBonus}\\n          spaceflightBonus={org.spaceflightBonus}\\n          MCBonus={org.MCBonus}\\n          miningBonus={org.miningBonus}\\n          techBonuses={org.template?.techBonuses}\\n          missionsGrantedNames={org.template?.missionsGrantedNames || []}\\n          highlightMissionClassName={highlightMissionClassName}\\n        />\\n      </TableCell>\\n      {org.score === undefined ? null : (\\n        <>\\n          <TableCell>\\n            <Tooltip>\\n              <TooltipTrigger>{org.score.value?.toFixed(2)}</TooltipTrigger>\\n              <TooltipContent align=\\\"end\\\" className=\\\"max-w-auto\\\">\\n                <pre className=\\\"p-2\\\">{org.score.details}</pre>\\n              </TooltipContent>\\n            </Tooltip>\\n          </TableCell>\\n          <TableCell>{org.score.noMissionScore?.toFixed(2)}</TableCell>\\n        </>\\n      )}\\n    </TableRow>\\n  );\\n}\\n\\nexport function getCouncilorsUi(analysis: Analysis) {\\n  const { playerMissionCounts } = analysis;\\n  const [weights, setWeights] = useState<ScoringWeights>(defaultScoringWeights);\\n\\n  useEffect(() => {\\n    setWeights(loadWeightsFromStorage());\\n  }, []);\\n\\n  const scoredModifiedCouncilors = scoreAndSort(\\n    analysis.playerCouncilors,\\n    weights,\\n    playerMissionCounts,\\n    getModifiedCouncilorScore\\n  );\\n  const scoredAvailableCouncilors = scoreAndSort(\\n    analysis.playerAvailableCouncilors,\\n    weights,\\n    playerMissionCounts,\\n    getBaseCouncilorScore\\n  );\\n  const scoredBaseCouncilors = scoreAndSort(\\n    analysis.playerCouncilors,\\n    weights,\\n    playerMissionCounts,\\n    getBaseCouncilorScore\\n  );\\n  const scoredOrgs = scoreAndSort(\\n    analysis.playerAvailableOrgs\\n      .map((i) => ({ type: \\\"available\\\", ...i }))\\n      .concat(analysis.playerUnassignedOrgs.map((i) => ({ type: \\\"unassigned\\\", ...i }))),\\n    weights,\\n    playerMissionCounts,\\n    getOrganizationScore,\\n    \\\"noMissionScore\\\" // ignore missions when sorting orgs\\n  ).toSorted((a, b) => (a.isAdminOrg === b.isAdminOrg ? 0 : a.isAdminOrg ? -1 : 1)); // admin orgs first\\n  const usedOrgs = analysis.playerCouncilors.flatMap((councilor) =>\\n    councilor.orgs.map((o) => ({ ...o, type: \\\"used\\\", councilor: councilor.displayName, councilorId: councilor.id }))\\n  );\\n  const scoredUsedOrgs = scoreAndSort(usedOrgs, weights, playerMissionCounts, getOrganizationScore);\\n  const scoredOwnedOrgs = scoreAndSort(\\n    analysis.playerUnassignedOrgs.map((i) => ({ type: \\\"unassigned\\\", ...i })).concat(usedOrgs),\\n    weights,\\n    playerMissionCounts,\\n    getOrganizationScore\\n  );\\n\\n  const bestAvailableCouncilor = scoredAvailableCouncilors[0]?.score.value;\\n  const worstExistingCouncilor = scoredBaseCouncilors[scoredBaseCouncilors.length - 1]?.score.value;\\n  const bestAvailableOrg = scoredOrgs[0]?.score.value;\\n  const worstExistingOrg = scoredUsedOrgs[scoredUsedOrgs.length - 1]?.score.value;\\n\\n  return {\\n    key: \\\"councilors\\\",\\n    tab: (\\n      <>\\n        Councilors ({worstExistingCouncilor?.toFixed(0)} vs. {bestAvailableCouncilor?.toFixed(0)}) / Orgs (\\n        {worstExistingOrg?.toFixed(2)} vs {bestAvailableOrg?.toFixed(2)})\\n      </>\\n    ),\\n    content: (\\n      <CouncilorsComponent\\n        {...{\\n          analysis,\\n          weights,\\n          setWeights,\\n          scoredModifiedCouncilors,\\n          scoredAvailableCouncilors,\\n          scoredBaseCouncilors,\\n          scoredOrgs,\\n          scoredOwnedOrgs,\\n        }}\\n      />\\n    ),\\n  };\\n}\\n\\nfunction CouncilorsComponent({\\n  analysis,\\n  weights,\\n  setWeights,\\n  scoredModifiedCouncilors,\\n  scoredAvailableCouncilors,\\n  scoredBaseCouncilors,\\n  scoredOrgs,\\n  scoredOwnedOrgs,\\n}: {\\n  analysis: Analysis;\\n  weights: ScoringWeights;\\n  setWeights: (weights: ScoringWeights) => void;\\n  scoredModifiedCouncilors: (Analysis[\\\"playerCouncilors\\\"][number] & { score: ScoreResult })[];\\n  scoredAvailableCouncilors: (Analysis[\\\"playerAvailableCouncilors\\\"][number] & { score: ScoreResult })[];\\n  scoredBaseCouncilors: (Analysis[\\\"playerCouncilors\\\"][number] & { score: ScoreResult })[];\\n  scoredOrgs: (Analysis[\\\"playerAvailableOrgs\\\"][number] & { type: string; score: ScoreResult })[];\\n  scoredOwnedOrgs: (Analysis[\\\"playerAvailableOrgs\\\"][number] & {\\n    type: string;\\n    score: ScoreResult;\\n    councilor?: string;\\n    councilorId?: number;\\n  })[];\\n}) {\\n  const {\\n    playerMissionCounts,\\n    playerVisibleCouncilors,\\n    playerCouncilors,\\n    playerAvailableOrgs,\\n    playerUnassignedOrgs,\\n    playerFaction,\\n    playerStealableOrgs,\\n    factionsById,\\n  } = analysis;\\n  const scoredStealableOrgs = scoreAndSort(\\n    analysis.playerStealableOrgs.map((i) => ({ type: \\\"stealable\\\", ...i })),\\n    weights,\\n    playerMissionCounts,\\n    getOrganizationScore,\\n    \\\"noMissionScore\\\"\\n  );\\n\\n  function currentHighlightMissionClassName(missionName: MissionDataName) {\\n    // if we have exactly 2, show yellow BG, if we have 1, show red, otherwise no change to bg\\n    const count = playerMissionCounts.get(missionName) || 0;\\n    if (count === 2) {\\n      return \\\"bg-yellow-300/50\\\";\\n    } else if (count === 1) {\\n      return \\\"bg-red-300/50\\\";\\n    }\\n  }\\n  function availableHighlightMissionClassName(missionName: MissionDataName) {\\n    // if we have 1, show yellow BG, if we have 0, show green, otherwise no change to bg\\n    const count = playerMissionCounts.get(missionName) || 0;\\n    if (count === 1) {\\n      return \\\"bg-yellow-300/50\\\";\\n    } else if (count === 0) {\\n      return \\\"bg-green-300/50\\\";\\n    }\\n  }\\n  const playerNationIds = new Set(analysis.playerNationIds);\\n  const playerTraits = new Set(analysis.playerCouncilors.flatMap((i) => i.traitTemplateNames));\\n  const unusedAdmin = analysis.playerCouncilors\\n    .map(\\n      (c) =>\\n        Math.min(\\n          25,\\n          Math.max(\\n            0,\\n            (c.effectsWithOrgsAndAugments.Administration || 0) + (c.effectsWithOrgsAndAugments.administration || 0)\\n          )\\n        ) - c.orgs.reduce((a, b) => a + b.tier, 0)\\n    )\\n    .reduce((a, b) => a + b, 0);\\n\\n  const stealableOrgsByFaction = scoredStealableOrgs.reduce((acc, org) => {\\n    const key = org.faction?.id || 0;\\n    if (!acc.has(key)) {\\n      acc.set(key, []);\\n    }\\n    acc.get(key)!.push(org);\\n    return acc;\\n  }, new Map<number, typeof scoredStealableOrgs>());\\n\\n  type MissionSource =\\n    | {\\n        type: \\\"councilor\\\";\\n        councilor: Analysis[\\\"playerCouncilors\\\"][number];\\n        factionId: number | undefined;\\n        missions: MissionDataName[];\\n      }\\n    | {\\n        type: \\\"org\\\";\\n        org: Analysis[\\\"playerAvailableOrgs\\\"][number];\\n        factionId: number | undefined;\\n        missions: MissionDataName[];\\n      };\\n\\n  const sourcesByFactionByMission = [...playerCouncilors, ...playerVisibleCouncilors]\\n    .map(\\n      (i) =>\\n        ({\\n          type: \\\"councilor\\\",\\n          councilor: i,\\n          factionId: i.factionId,\\n          missions: i.effectsWithOrgsAndAugments.missionsGrantedNames || [],\\n        } as MissionSource)\\n    )\\n    .concat(\\n      [...playerAvailableOrgs, ...playerUnassignedOrgs].map((i) => ({\\n        type: \\\"org\\\",\\n        org: i,\\n        factionId: playerFaction?.id,\\n        missions: i.template?.missionsGrantedNames || [],\\n      }))\\n    )\\n    .concat(\\n      playerStealableOrgs.map((i) => ({\\n        type: \\\"org\\\",\\n        org: i,\\n        factionId: i.faction?.id,\\n        missions: i.template?.missionsGrantedNames || [],\\n      }))\\n    )\\n    .reduce((acc, o) => {\\n      const key = o.factionId || 0;\\n      if (!acc.has(key)) {\\n        acc.set(key, new Map<string, MissionSource[]>());\\n      }\\n      const effectsMap = acc.get(key)!;\\n      o.missions.forEach((m) => {\\n        if (!effectsMap.has(m)) {\\n          effectsMap.set(m, []);\\n        }\\n        effectsMap.get(m)!.push(o);\\n      });\\n      return acc;\\n    }, new Map<number, Map<string, MissionSource[]>>());\\n  const factions = Array.from(sourcesByFactionByMission.keys())\\n    .map((factionId) => factionsById.get(factionId)!)\\n    .filter((f) => f)\\n    .toSorted((a, b) => {\\n      if (a.id === playerFaction.id) return -1;\\n      if (b.id === playerFaction.id) return 1;\\n      return (a.displayName || \\\"\\\").localeCompare(b.displayName || \\\"\\\");\\n    });\\n\\n  const importantMissions = [\\\"Assassinate\\\"];\\n\\n  const councilEffects = scoredModifiedCouncilors.reduce((acc, councilor) => {\\n    return combineEffects(acc, councilor.effectsWithOrgsAndAugments);\\n  }, {} as ShowEffectsProps);\\n\\n  // TODO: would be cool to click an effect icon and sort everything by that (ie. click persuasion icon to see who/org gives most persuasion)\\n  return (\\n    <div className=\\\"space-y-2\\\">\\n      <SmartAccordion\\n        type=\\\"single\\\"\\n        collapsible\\n        storageKey=\\\"councilorsSections\\\"\\n        defaultValue=\\\"existing\\\"\\n      >\\n        <AccordionItem value=\\\"existing\\\">\\n          <AccordionTrigger>\\n            <span\\n              >\\n            Manage Existing Council ({unusedAdmin.toFixed(0)} <Administration />)\\n            </span >\\n          </AccordionTrigger>\\n          <AccordionContent>\\n            <div className=\\\"py-1\\\">\\n              <ShowEffects\\n                incomeBoost_month={councilEffects.incomeBoost_month}\\n                incomeMoney_month={councilEffects.incomeMoney_month}\\n                incomeInfluence_month={councilEffects.incomeInfluence_month}\\n                incomeOps_month={councilEffects.incomeOps_month}\\n                incomeMissionControl={councilEffects.incomeMissionControl}\\n                incomeResearch_month={councilEffects.incomeResearch_month}\\n                projectCapacityGranted={councilEffects.projectCapacityGranted}\\n              />\\n              <ShowEffects\\n                economyBonus={councilEffects.economyBonus}\\n                welfareBonus={councilEffects.welfareBonus}\\n                environmentBonus={councilEffects.environmentBonus}\\n                knowledgeBonus={councilEffects.knowledgeBonus\\n                }\\n                governmentBonus={councilEffects.governmentBonus}\\n                unityBonus={councilEffects.unityBonus\\n                }\\n                militaryBonus={councilEffects.militaryBonus\\n                }\\n                oppressionBonus={councilEffects.oppressionBonus}\\n                spoilsBonus={councilEffects.spoilsBonus\\n                }\\n                spaceDevBonus={councilEffects.spaceDevBonus}\\n                spaceflightBonus={councilEffects.spaceflightBonus\\n                }\\n                MCBonus={councilEffects.MCBonus}\\n                miningBonus={councilEffects.miningBonus\\n                }\\n              />\\n              <ShowEffects\\n                councilorTechBonus={councilEffects.councilorTechBonus}\\n                techBonuses={councilEffects.techBonues}\\n              />\\n            </div >\\n            <Table>\\n              <CouncilorTableHeader hasOrgs />\\n              <TableBody>\\n                {scoredModifiedCouncilors.map((councilor) => (\\n                  <CouncilorTableRow\\n                    key={councilor.id}\\n                    councilor={councilor}\\n                    stats={councilor.effectsWithOrgsAndAugments}\\n                    label={councilor.displayName!}\\n                    hasOrgs\\n                    highlightMissionClassName={currentHighlightMissionClassName}\\n                  />\\n                ))}\\n              </TableBody>\\n            </Table>\\n            <h3 className=\\\\\\\"mt-1\\\\\\\">Available Organizations:</h3>\\n            <Table>\\n              <OrgTableHeader />\\n              <TableBody>\\n                {scoredOrgs.map((org) => (\\n                  <OrgTableRow\\n                    key={org.id}\\n                    org={org}\\n                    playerNationIds={playerNationIds}\\n                    playerTraits={playerTraits}\\n                    highlightMissionClassName={availableHighlightMissionClassName}\\n                  />\\n                ))}\\n              </TableBody>\\n            </Table>\\n          </AccordionContent>\\n        </AccordionItem>\\n        <AccordionItem value=\\\\\\\"new-councilors\\\\\\\">\\n          <AccordionTrigger>Find New Councilors</AccordionTrigger>\\n          <AccordionContent>\\n            <h3 className=\\\\\\\"mt-1\\\\\\\">Available Councilors:</h3>\\n            <Table>\\n              <CouncilorTableHeader />\\n              <TableBody>\\n                {scoredAvailableCouncilors.map((councilor) => (\\n                  <CouncilorTableRow\\n                    key={councilor.id}\\n                    councilor={councilor}\\n                    stats={councilor.effectsBaseAndUnaugmentedTraits}\\n                    label={councilor.displayName!}\\n                    highlightMissionClassName={availableHighlightMissionClassName}\\n                  />\\n                ))}\\n              </TableBody>\\n            </Table>\\n\\n            <h3 className=\\\\\\\"mt-1\\\\\\\">Unmodified Active Councilors:</h3>\\n            <Table>\\n              <CouncilorTableHeader />\\n              <TableBody>\\n                {scoredBaseCouncilors.map((councilor) => (\\n                  <CouncilorTableRow\\n                    key={`${councilor.id}-base`}\\n                    councilor={councilor}\\n                    stats={councilor.effectsBaseAndUnaugmentedTraits}\\n                    label={`${councilor.displayName}`}\\n                    highlightMissionClassName={currentHighlightMissionClassName}\\n                  />\\n                ))}\\n              </TableBody>\\n            </Table>\\n          </AccordionContent>\\n        </AccordionItem>\\n        <AccordionItem value=\\\\\\\"current-orgs\\\\\\\">\\n          <AccordionTrigger>Current Organizations</AccordionTrigger>\\n          <AccordionContent>\\n            <Table>\\n              <OrgTableHeader costHeader=\\\\\\\"Councilor\\\\\\\" />\\n              <TableBody>\\n                {scoredOwnedOrgs.toReversed().map((org) => (\\n                  <OrgTableRow\\n                    key={org.id}\\n                    org={org}\\n                    playerNationIds={playerNationIds}\\n                    playerTraits={playerTraits}\\n                    highlightMissionClassName={availableHighlightMissionClassName}\\n                  />\\n                ))}\\n              </TableBody>\\n            </Table>\\n          </AccordionContent>\\n        </AccordionItem>\\n        <AccordionItem value=\\\\\\\"takeover\\\\\\\">\\n          <AccordionTrigger>Hostile Takeover</AccordionTrigger>\\n          <AccordionContent>\\n            <SmartTabs\\n              storageKey=\\\\\\\"councilorsTakeoverTabs\\\\\\\"\\n              defaultValue={`faction-${Array.from(stealableOrgsByFaction.keys())[0]}`}\\n            >\\n              <TabsList>\\n                {Array.from(stealableOrgsByFaction.entries()).map(([factionId, orgs]) => (\\n                  <TabsTrigger key={factionId} value={`faction-${factionId}`}>\\n                    {orgs[0].faction?.displayName || \\\\\\\"Unknown Faction\\\\\\\"} ({orgs.length})\\n                  </TabsTrigger>\\n                ))}\\n              </TabsList>\\n              {Array.from(stealableOrgsByFaction.entries()).map(([factionId, orgs]) => (\\n                <TabsContent key={factionId} value={`faction-${factionId}`}>\\n                  <Table>\\n                    <OrgTableHeader costHeader=\\\\\\\"Takeover\\\\\\\" />\\n                    <TableBody>\\n                      {orgs.map((org) => (\\n                        <OrgTableRow\\n                          key={org.id}\\n                          org={org}\\n                          playerNationIds={playerNationIds}\\n                          playerTraits={playerTraits}\\n                          highlightMissionClassName={availableHighlightMissionClassName}\\n                          isTakeover\\n                        />\\n                      ))}\\n                    </TableBody>\\n                  </Table>\\n                </TabsContent>\\n              ))}\\n            </SmartTabs>\\n          </AccordionContent>\\n        </AccordionItem>\\n        <AccordionItem value=\\\\\\\"missions\\\\\\\">\\n          <AccordionTrigger>Missions</AccordionTrigger>\\n          <AccordionContent>\\n            <SmartTabs storageKey=\\\\\\\"councilorsMissionsTabs\\\\\\\" defaultValue={`faction-${factions[0].id}`}>\\n              <TabsList>\\n                {factions.map((faction) => (\\n                  <TabsTrigger key={faction.id} value={`faction-${faction.id}`}>\\n                    {faction.displayName || \\\\\\\"Unknown Faction\\\\\\\"} ({sourcesByFactionByMission.get(faction.id)?.size || 0})\\n                    {importantMissions\\n                      .filter(\\n                        (m) =>\\n                          sourcesByFactionByMission\\n                            .get(faction.id)\\n                            ?.get(m)\\n                            ?.filter((i) => i.type === \\\\\\\"councilor\\\\\\\")?.length ?? 0 > 0\\n                      )\\n                      .map((m) => {\\n                        const MissionIcon = MissionIcons[m] || UnknownIcon;\\n                        return (\\n                          <span key={m} className=\\\\\\\"inline-block -mt-2\\\\\\\">\\n                            <MissionIcon className=\\\\\\\"h-4 w-4\\\\\\\" />\\n                          </span >\\n                        );\\n                      })}\\n                  </TabsTrigger>\\n                ))}\\n              </TabsList>\\n              {factions.map((faction) => (\\n                <TabsContent key={faction.id} value={`faction-${faction.id}`}>\\n                  <SmartAccordion type=\\\\\\\"single\\\\\\\" collapsible storageKey={`councilorsMissions-${faction.id}`}>\\n                    {Array.from(\\n                      new Set([\\n                        ...importantMissions,\\n                        ...Array.from(sourcesByFactionByMission.get(faction.id)?.keys() || []),\\n                      ]),\\n                    ).map((missionName) => {\\n                      const sources = sourcesByFactionByMission.get(faction.id)?.get(missionName) || [];\\n                      const MissionIcon = MissionIcons[missionName] || UnknownIcon;\\n                      return (\\n                        <AccordionItem key={missionName} value={missionName}>\\n                          <AccordionTrigger>\\n                            <span\\n                              >\\n                            <MissionIcon /> {missionName} &ndash;{\\\\\\\" \\\\\\\"}\\n                            {sources.filter((i) => i.type === \\\\\\\"councilor\\\\\\\").length} Councilors &lt;-{\\\\\\\" \\\\\\\"}\\n                            {sources.filter((i) => i.type === \\\\\\\"org\\\\\\\").length} Orgs\\n                          </span >\\n                          </AccordionTrigger>\\n                          <AccordionContent>\\n                            <Table>\\n                              <TableHeader>\\n                                <TableRow>\\n                                  <TableHead>Fleet Name</TableHead>\\n                                  <TableHead>Planet</TableHead>\\n                                  <TableHead>Target Orbit</TableHead>\\n                                  <TableHead>Arrival Date</TableHead>\\n                                  <TableHead className=\\\\\\\"text-right\\\\\\\">Days to Arrival</TableHead>\\n                                  <TableHead className=\\\\\\\"text-right\\\\\\\">MC Used</TableHead>\\n                                  <TableHead className=\\\\\\\"text-right\\\\\\\">Marine CP</TableHead>\\n                                  <TableHead className=\\\\\\\"text-right\\\\\\\">Total Mass</TableHead>\\n                                  <TableHead className=\\\\\\\"text-right\\\\\\\">Max Ship Mass</TableHead>\\n                                  <TableHead>Ships Hulls</TableHead>\\n                                  <TableHead>Ships Roles</TableHead>\\n                                  <TableHead>Operation</TableHead>\\n                                  <TableHead>Operation Complete</TableHead>\\n                                </TableRow>\\n                              </TableHeader>\\n                              <TableBody>\\n                                {sources?.map((src) => (\\n                                  src.type === \\\\\\\"org\\\\\\\" ? (\\n                                    <OrgTableRow\\n                                      key={`councilor-${src.org.id}-mission-${missionName}`}\\n                                      org={src.org}\\n                                      playerNationIds={playerNationIds}\\n                                      playerTraits={playerTraits}\\n                                    />\\n                                  ) : (\\n                                    <CouncilorTableRow\\n                                      key={`org-${src.councilor.id}-mission-${missionName}`}\\n                                      councilor={src.councilor}\\n                                      stats={src.councilor.effectsWithOrgsAndAugments}\\n                                      label={src.councilor.displayName!}\\n                                    />\\n                                  )\\n                                ))}\\n                              </TableBody>\\n                            </Table>\\n                          </AccordionContent>\\n                        </AccordionItem>\\n                      );\\n                    })}\\n                  </SmartAccordion>\\n                </TabsContent>\\n              ))}\\n            </SmartTabs>\\n          </AccordionContent>\\n        </AccordionItem>\\n        <AccordionItem value=\\\\\\\"other-councilors\\\\\\\">\\n          <AccordionTrigger>Other Councilors</AccordionTrigger>\\n          <AccordionContent>\\n            <OtherCouncilorsByFaction {...{ analysis, weights }} />\\n          </AccordionContent>\\n        </AccordionItem>\\n      </SmartAccordion>\\\\n\\\\n      <div className=\\\\\\\"my-4\\\\\\\">\\\\n        <ScoringWeightsDialog weights={weights} onWeightsChange={setWeights} />\\\\n      </div >\\\\n\\\\n      <Collapsible>\\\\n        <CollapsibleTrigger asChild>\\\\n          <Button variant=\\\\\\\"outline\\\\\\\">Debug Data</Button>\\\\n        </CollapsibleTrigger>\\\\n        <CollapsibleContent>\\\\n          <pre>{JSON.stringify(analysis.playerFaction, null, 2)}</pre>\\\\n        </CollapsibleContent>\\\\n      </Collapsible>\\\\n    </div >\\\\n  );\\\\n}\\\\n\\\\nfunction OtherCouncilorsByFaction({ analysis, weights }: { analysis: Analysis; weights: ScoringWeights }) {\\\\n  const { playerVisibleCouncilors, factionsById } = analysis;\\\\n\\\\n  const scoredBaseCouncilors = scoreAndSort(\\\\n    playerVisibleCouncilors,\\\\n    weights,\\\\n    new Map<MissionDataName, number>(),\\\\n    getBaseCouncilorScore\\\\n  );\\\\n\\\\n  const councilorsByFactionId = scoredBaseCouncilors.reduce((acc, councilor) => {\\\\n    const factionId = councilor.factionId || 0;\\\\n    if (!factionId) return acc;\\\\n    if (!acc.has(factionId)) {\\\\n      acc.set(factionId, []);\\\\n    }\\\\n    acc.get(factionId)!.push(councilor);\\\\n    return acc;\\\\n  }, new Map<number, Analysis[\\\\\\\"playerCouncilors\\\\\\\"][number][]>());\\\\n\\\\n  const factions = Array.from(councilorsByFactionId.keys())\\\\n    .map((i) => factionsById.get(i!)!)\\\\n    .filter((i) => i.id !== analysis.alienFaction.id);\\\\n\\\\n  return (\\\\n    <Tabs defaultValue={`faction-${factions[0].id}`}>\\\\n      <TabsList>\\\\n        {factions\\\\n          .filter((i) => i.id !== analysis.alienFaction.id)\\\\n          .map((faction) => (\\\\n            <TabsTrigger key={faction.id} value={`faction-${faction.id}`}>\\\\n              {faction.displayName || \\\\\\\"Unknown Faction\\\\\\\"} ({councilorsByFactionId.get(faction.id)?.length || 0})\\\\n            </TabsTrigger>\\\\n          ))}\\\\n      </TabsList>\\\\n      {factions.map((faction) => (\\\\n        <TabsContent key={faction.id} value={`faction-${faction.id}`}>\\\\n          <Table>\\\\n            <TableHeader>\\\\n              <TableRow>\\\\n                <TableHead>Name</TableHead>\\\\n                <TableHead>Modified Stats</TableHead>\\\\n                <TableHead>Org Tiers</TableHead>\\\\n                <TableHead>Monthly Effects</TableHead>\\\\n                <TableHead>Priorities</TableHead>\\\\n                <TableHead>Science</TableHead>\\\\n                <TableHead>Missions</TableHead>\\n                <TableHead>Score</TableHead>\\n                <TableHead>NM Score</TableHead>\\n                <TableHead>CP Cap</TableHead>\\\\n              </TableRow>\\\\n            </TableHeader>\\\\n            .\nError message: JSON Parse error: Unterminated string"
}
```

**Output:**
```


...128447 bytes truncated...

The tool call succeeded but the output was truncated. Full output saved to: .local\share\opencode\tool-output\tool_e01166b38001aG8efKHidy5bd5
Use the Task tool to have explore agent process this file with Grep and Read (with offset/limit). Do NOT read the full file yourself - delegate to save context.
```

---

## Assistant (Build · Gemma 4-26B-A4B (local) · 56.4s)

_Thinking:_

Okay, the `write` failed because the content was too large. I should use `edit` more effectively or break it down.

Since I want to refactor the whole file, I will do it section by section.

First, I'll replace the `getCouncilorsUi` function with a version that returns the `NavItem` structure.

I'll also need to refactor `CouncilorsComponent` to `CouncilorsSection` and make it accept a `section` prop.

Wait, I'll just rewrite the whole file in chunks.

Actually, I'll use `write` for the new `councilors.tsx` by breaking it into two parts.
But `write` overwrites the file.

Okay, I'll use `edit` to replace the `getCouncilorsUi` function first.

Wait, I need to be very careful with the `oldString`.

I'll use `Read` to get the content around `getCouncilorsUi`.



**Tool: read**

**Input:**
```json
{
  "filePath": "terra-invicta-assistant\\src\\app\\game\\current\\councilors.tsx",
  "offset": 310,
  "limit": 100
}
```

**Output:**
```
<path>terra-invicta-assistant\src\app\game\current\councilors.tsx</path>
<type>file</type>
<content>
310:         </>
311:       )}
312:     </TableRow>
313:   );
314: }
315: 
316: export function getCouncilorsUi(analysis: Analysis): NavItem {
317:   const { playerMissionCounts } = analysis;
318:   const [weights, setWeights] = useState<ScoringWeights>(defaultScoringWeights);
319: 
320:   useEffect(() => {
321:     setWeights(loadWeightsFromStorage());
322:   }, []);
323: 
324:   const scoredModifiedCouncilors = scoreAndSort(
325:     analysis.playerCouncilors,
326:     weights,
327:     playerMissionCounts,
328:     getModifiedCouncilorScore
329:   );
330:   const scoredAvailableCouncilors = scoreAndSort(
331:     analysis.playerAvailableCouncilors,
332:     weights,
333:     playerMissionCounts,
334:     getBaseCouncilorScore
335:   );
336:   const scoredBaseCouncilors = scoreAndSort(
337:     analysis.playerCouncilors,
338:     weights,
339:     playerMissionCounts,
340:     getBaseCouncilorScore
341:   );
342:   const scoredOrgs = scoreAndSort(
343:     analysis.playerAvailableOrgs
344:       .map((i) => ({ type: "available", ...i }))
345:       .concat(analysis.playerUnassignedOrgs.map((i) => ({ type: "unassigned", ...i }))),
346:     weights,
347:     playerMissionCounts,
348:     getOrganizationScore,
349:     "noMissionScore" // ignore missions when sorting orgs
350:   ).toSorted((a, b) => (a.isAdminOrg === b.isAdminOrg ? 0 : a.isAdminOrg ? -1 : 1)); // admin orgs first
351:   const usedOrgs = analysis.playerCouncilors.flatMap((councilor) =>
352:     councilor.orgs.map((o) => ({ ...o, type: "used", councilor: councilor.displayName, councilorId: councilor.id }))
353:   );
354:   const scoredUsedOrgs = scoreAndSort(usedOrgs, weights, playerMissionCounts, getOrganizationScore);
355:   const scoredOwnedOrgs = scoreAndSort(
356:     analysis.playerUnassignedOrgs.map((i) => ({ type: "unassigned", ...i })).concat(usedOrgs),
357:     weights,
358:     playerMissionCounts,
359:     getOrganizationScore
360:   );
361: 
362:   const bestAvailableCouncilor = scoredAvailableCouncilors[0]?.score.value;
363:   const worstExistingCouncilor = scoredBaseCouncilors[scoredBaseCouncilors.length - 1]?.score.value;
364:   const bestAvailableOrg = scoredOrgs[0]?.score.value;
365:   const worstExistingOrg = scoredUsedOrgs[scoredUsedOrgs.length - 1]?.score.value;
366: 
367:   return {
368:     key: "councilors",
369:     label: "Councilors",
370:     subtitle: (
371:       <>
372:         ({worstExistingCouncilor?.toFixed(0)} vs. {bestAvailableCouncilor?.toFixed(0)}) / Orgs (
373:         {worstExistingOrg?.toFixed(2)} vs {bestAvailableOrg?.toFixed(2)})
374:       </>
375:     ),
376:     content: (
377:       <CouncilorsComponent
378:         {...{
379:           analysis,
380:           weights,
381:           setWeights,
382:           scoredModifiedCouncilors,
383:           scoredAvailableCouncilors,
384:           scoredBaseCouncilors,
385:           scoredOrgs,
386:           scoredOwnedOrgs,
387:         }}
388:       />
389:     ),
390:   };
391: }
392: 
393: 
394: function CouncilorsComponent({
395:   analysis,
396:   weights,
397:   setWeights,
398:   scoredModifiedCouncilors,
399:   scoredAvailableCouncilors,
400:   scoredBaseCouncilors,
401:   scoredOrgs,
402:   scoredOwnedOrgs,
403: }: {
404:   analysis: Analysis;
405:   weights: ScoringWeights;
406:   setWeights: (weights: ScoringWeights) => void;
407:   scoredModifiedCouncilors: (Analysis["playerCouncilors"][number] & { score: ScoreResult })[];
408:   scoredAvailableCouncilors: (Analysis["playerAvailableCouncilors"][number] & { score: ScoreResult })[];
409:   scoredBaseCouncilors: (Analysis["playerCouncilors"][number] & { score: ScoreResult })[];

(Showing lines 310-409 of 1076. Use offset=410 to continue.)
</content>
```

---

## Assistant (Build · Gemma 4-26B-A4B (local) · 289.4s)

_Thinking:_

Okay, I'll use `edit` to replace the `getCouncilorsUi` and `CouncilorsComponent` with the new structure.

Actually, I'll do it in two steps.

**Step 1: Replace `getCouncilorsUi` and `CouncilorsComponent` with `getCouncilorsUi` (returning children) and `CouncilorsSection`.**

Wait, I'll replace them with:
1. `getCouncilorsUi` which returns the `NavItem` with children.
2. `CouncilorsSection` which takes a `section` prop.

I'll also need to make sure `CouncilorsSection` is defined.

Let's see the lines. `getCouncilorsUi` starts at 316. `CouncilorsComponent` starts at 394.

I'll replace from line 316 down to the end of `CouncilorsComponent` (line 817).

Wait, I need to be very careful.

Actually, I'll just do this:
1. Update `getCouncilorsUi` to return `NavItem` with children.
2. Rename `CouncilorsComponent` to `CouncilorsSection` and add the `section` prop.
3. Update the `return` of `CouncilorsSection` to use the `section` prop to render the correct content.

Wait, I'll also need to move the `ScoringWeightsDialog` and `Collapsible` out of `CouncilorsComponent` because they're not in all sections.

Let's do it.

**Tool: edit**

**Input:**
```json
{
  "filePath": "terra-invicta-assistant\\src\\app\\game\\current\\councilors.tsx",
  "newString": "export function getCouncilorsUi(analysis: Analysis, weights: ScoringWeights, setWeights: (weights: ScoringWeights) => void): NavItem {\n  const { playerMissionCounts } = analysis;\n\n  const scoredModifiedCouncilors = scoreAndSort(\n    analysis.playerCouncilors,\n    weights,\n    playerMissionCounts,\n    getModifiedCouncilorScore\n  );\n  const scoredAvailableCouncilors = scoreAndSort(\n    analysis.playerAvailableCouncilors,\n    weights,\n    playerMissionCounts,\n    getBaseCouncilorScore\n  );\n  const scoredBaseCouncilors = scoreAndSort(\n    analysis.playerCouncilors,\n    weights,\n    playerMissionCounts,\n    getBaseCouncilorScore\n  );\n  const scoredOrgs = scoreAndSort(\n    analysis.playerAvailableOrgs\n      .map((i) => ({ type: \"available\", ...i }))\n      .concat(analysis.playerUnassignedOrgs.map((i) => ({ type: \"unassigned\", ...i }))),\n    weights,\n    playerMissionCounts,\n    getOrganizationScore,\n    \"noMissionScore\" // ignore missions when sorting orgs\n  ).toSorted((a, b) => (a.isAdminOrg === b.isAdminOrg ? 0 : a.isAdminOrg ? -1 : 1)); // admin orgs first\n  const usedOrgs = analysis.playerCouncilors.flatMap((councilor) =>\n    councilor.orgs.map((o) => ({ ...o, type: \"used\", councilor: councilor.displayName, councilorId: councilor.id }))\n  );\n  const scoredUsedOrgs = scoreAndSort(usedOrgs, weights, playerMissionCounts, getOrganizationScore);\n  const scoredOwnedOrgs = scoreAndSort(\n    analysis.playerUnassignedOrgs.map((i) => ({ type: \"unassigned\", ...i })).concat(usedOrgs),\n    weights,\n    playerMissionCounts,\n    getOrganizationScore\n  );\n\n  const bestAvailableCouncilor = scoredAvailableCouncilors[0]?.score.value;\n  const worstExistingCouncilor = scoredBaseCouncilors[scoredBaseCouncilors.length - 1]?.score.value;\n  const bestAvailableOrg = scoredOrgs[0]?.score.value;\n  const worstExistingOrg = scoredUsedOrgs[scoredUsedOrgs.length - 1]?.score.value;\n\n  return {\n    key: \"councilors\",\n    label: \"Councilors\",\n    subtitle: (\n      <>\n        ({worstExistingCouncilor?.toFixed(0)} vs. {bestAvailableCouncilor?.toFixed(0)}) / Orgs (\n        {worstExistingOrg?.toFixed(2)} vs {bestAvailableOrg?.toFixed(2)})\n      </>\n    ),\n    children: [\n      {\n        key: \"councilors-existing\",\n        label: \"Existing Council\",\n        content: (\n          <CouncilorsSection\n            {...{\n              analysis,\n              weights,\n              setWeights,\n              scoredModifiedCouncilors,\n              scoredAvailableCouncilors,\n              scoredBaseCouncilors,\n              scoredOrgs,\n              scoredOwnedOrgs,\n            }}\n            section=\"existing\"\n          />\n        ),\n      },\n      {\n        key: \"councilors-new-councilors\",\n        label: \"Find new\",\n        content: (\n          <CouncilorsSection\n            {...{\n              analysis,\n              weights,\n              setWeights,\n              scoredModifiedCouncilors,\n              scoredAvailableCouncilors,\n              scoredBaseCouncilors,\n              scoredOrgs,\n              scoredOwnedOrgs,\n            }}\n            section=\"new-councilors\"\n          />\n        ),\n      },\n      {\n        key: \"councilors-current-orgs\",\n        label: \"Current Organizations\",\n        content: (\n          <CouncilorsSection\n            {...{\n              analysis,\n              weights,\n              setWeights,\n              scoredModifiedCouncilors,\n              scoredAvailableCouncilors,\n              scoredBaseCouncilors,\n              scoredOrgs,\n              scoredOwnedOrgs,\n            }}\n            section=\"current-orgs\"\n          />\n        ),\n      },\n      {\n        key: \"councilors-takeover\",\n        label: \"Hostile Takeover\",\n        content: (\n          <CouncilorsSection\n            {...{\n              analysis,\n              weights,\n              setWeights,\n              scoredModifiedCouncilors,\n              scoredAvailableCouncilors,\n              scoredBaseCouncilors,\n              scoredOrgs,\n              scoredOwnedOrgs,\n            }}\n            section=\"takeover\"\n          />\n        ),\n      },\n      {\n        key: \"councilors-missions\",\n        label: \"Missions\",\n        content: (\n          <CouncilorsSection\n            {...{\n              analysis,\n              weights,\n              setWeights,\n              scoredModifiedCouncilors,\n              scoredAvailableCouncilors,\n              scoredBaseCouncilors,\n              scoredOrgs,\n              scoredOwnedOrgs,\n            }}\n            section=\"missions\"\n          />\n        ),\n      },\n      {\n        key: \"councilors-other-councilors\",\n        label: \"Other Councilors\",\n        content: (\n          <CouncilorsSection\n            {...{\n              analysis,\n              weights,\n              setWeights,\n              scoredModifiedCouncilors,\n              scoredAvailableCouncilors,\n              scoredBaseCouncilors,\n              scoredOrgs,\n              scoredOwnedOrgs,\n            }}\n            section=\"other-councilors\"\n          />\n        ),\n      },\n    ],\n  };\n}\n\n\nfunction CouncilorsSection({\n  analysis,\n  weights,\n  setWeights,\n  scoredModifiedCouncilors,\n  scoredAvailableCouncilors,\n  scoredBaseCouncilors,\n  scoredOrgs,\n  scoredOwnedOrgs,\n  section,\n}: {\n  analysis: Analysis;\n  weights: ScoringWeights;\n  setWeights: (weights: ScoringWeights) => void;\n  scoredModifiedCouncilors: (Analysis[\"playerCouncilors\"][number] & { score: ScoreResult })[];\n  scoredAvailableCouncilors: (Analysis[\"playerAvailableCouncilors\"][number] & { score: ScoreResult })[];\n  scoredBaseCouncilors: (Analysis[\"playerCouncilors\"][number] & { score: ScoreResult })[];\n  scoredOrgs: (Analysis[\"playerAvailableOrgs\"][number] & { type: string; score: ScoreResult })[];\n  scoredOwnedOrgs: (Analysis[\"playerAvailableOrgs\"][number] & {\n    type: string;\n    score: ScoreResult;\n    councilor?: string;\n    councilorId?: number;\n  })[];\n  section: \"existing\" | \"new-councilors\" | \"current-orgs\" | \"takeover\" | \"missions\" | \"other-councilors\";\n}) {\n  const {\n    playerMissionCounts,\n    playerVisibleCouncilors,\n    playerCouncilors,\n    playerAvailableOrgs,\n    playerUnassignedOrgs,\n    playerFaction,\n    playerStealableOrgs,\n    factionsById,\n  } = analysis;\n  const scoredStealableOrgs = scoreAndSort(\n    analysis.playerStealableOrgs.map((i) => ({ type: \"stealable\", ...i })),\n    weights,\n    playerMissionCounts,\n    getOrganizationScore,\n    \"noMissionScore\"\n  );\n\n  function currentHighlightMissionClassName(missionName: MissionDataName) {\n    const count = playerMissionCounts.get(missionName) || 0;\n    if (count === 2) {\n      return \"bg-yellow-300/50\";\n    } else if (count === 1) {\n      return \"bg-red-300/50\";\n    }\n  }\n  function availableHighlightMissionClassName(missionName: MissionDataName) {\n    const count = playerMissionCounts.get(missionName) || 0;\n    if (count === 1) {\n      return \"bg-yellow-300/50\";\n    } else if (count === 0) {\n      return \"bg-green-300/50\";\n    }\n  }\n  const playerNationIds = new Set(analysis.playerNationIds);\n  const playerTraits = new Set(analysis.playerCouncilors.flatMap((i) => i.traitTemplateNames));\n  const unusedAdmin = analysis.playerCouncilors\n    .map(\n      (c) =>\n        Math.min(\n          25,\n          Math.max(\n            0,\n            (c.effectsWithOrgsAndAugments.Administration || 0) + (c.effectsWithOrgsAndAugments.administration || 0)\n          )\n        ) - c.orgs.reduce((a, b) => a + b.tier, 0)\n    )\n    .reduce((a, b) => a + b, 0);\n\n  const stealableOrgsByFaction = scoredStealableOrgs.reduce((acc, org) => {\n    const key = org.faction?.id || 0;\n    if (!acc.has(key)) {\n      acc.set(key, []);\n    }\n    acc.get(key)!.push(org);\n    return acc;\n  }, new Map<number, typeof scoredStealableOrgs>());\n\n  type MissionSource =\n    | {\n        type: \"councilor\";\n        councilor: Analysis[\"playerCouncilors\"][number];\n        factionId: number | undefined;\n        missions: MissionDataName[];\n      }\n    | {\n        type: \"org\";\n        org: Analysis[\"playerAvailableOrgs\"][number];\n        factionId: number | undefined;\n        missions: MissionDataName[];\n      };\n\n  const sourcesByFactionByMission = [...playerCouncilors, ...playerVisibleCouncilors]\n    .map(\n      (i) =>\n        ({\n          type: \"councilor\",\n          councilor: i,\n          factionId: i.factionId,\n          missions: i.effectsWithOrgsAndAugments.missionsGrantedNames || [],\n        } as MissionSource)\n    )\n    .concat(\n      [...playerAvailableOrgs, ...playerUnassignedOrgs].map((i) => ({\n        type: \"org\",\n        org: i,\n        factionId: playerFaction?.id,\n        missions: i.template?.missionsGrantedNames || [],\n      }))\n    )\n    .concat(\n      playerStealableOrgs.map((i) => ({\n        type: \"org\",\n        org: i,\n        factionId: i.faction?.id,\n        missions: i.template?.missionsGrantedNames || [],\n      }))\n    )\n    .reduce((acc, o) => {\n      const key = o.factionId || 0;\n      if (!acc.has(key)) {\n        acc.set(key, new Map<string, MissionSource[]>());\n      }\n      const effectsMap = acc.get(key)!;\n      o.missions.forEach((m) => {\n        if (!effectsMap.has(m)) {\n          effectsMap.set(m, []);\n        }\n        effectsMap.get(m)!.push(o);\n      });\n      return acc;\n    }, new Map<number, Map<string, MissionSource[]>>());\n  const factions = Array.from(sourcesByFactionByMission.keys())\n    .map((factionId) => factionsById.get(factionId)!)\n    .filter((f) => f)\n    .toSorted((a, b) => {\n      if (a.id === playerFaction.id) return -1;\n      if (b.id === playerFaction.id) return 1;\n      return (a.displayName || \"\").localeCompare(b.displayName || \"\");\n    });\n\n  const importantMissions = [\"Assassinate\"];\n\n  const councilEffects = scoredModifiedCouncilors.reduce((acc, councilor) => {\n    return combineEffects(acc, councilor.effectsWithOrgsAndAugments);\n  }, {} as ShowEffectsProps);\n\n  return (\n    <div className=\"space-y-2\">\n      {section === \"existing\" && (\n        <>\n          <div className=\"py-1\">\n            <ShowEffects\n              incomeBoost_month={councilEffects.incomeBoost_month}\n              incomeMoney_month={councilEffects.incomeMoney_month}\n              incomeInfluence_month={councilEffects.incomeInfluence_month}\n              incomeOps_month={councilEffects.incomeOps_month}\n              incomeMissionControl={councilEffects.incomeMissionControl}\n              incomeResearch_month={councilEffects.incomeResearch_month}\n              projectCapacityGranted={councilEffects.projectCapacityGranted}\n            />\n            <ShowEffects\n              economyBonus={councilEffects.economyBonus}\n              welfareBonus={councilEffects.welfareBonus}\n              environmentBonus={councilEffects.environmentBonus}\n              knowledgeBonus={councilEffects.knowledgeBonus}\n              governmentBonus={councilEffects.governmentBonus}\n              unityBonus={councilEffects.unityBonus}\n              militaryBonus={councilEffects.militaryBonus}\n              oppressionBonus={councilEffects.oppressionBonus}\n              spoilsBonus={councilEffects.spoilsBonus\n              }\n              spaceDevBonus={councilEffects.spaceDevBonus}\n              spaceflightBonus={councilEffects.spaceflightBonus}\n              MCBonus={councilEffects.MCBonus}\n              miningBonus={councilEffects.miningBonus}\n            />\n            <ShowEffects\n              councilorTechBonus={councilEffects.councilorTechBonus}\n              techBonuses={councilEffects.techBonuses}\n            />\n          </div >\n          <Table>\n            <CouncilorTableHeader hasOrgs />\n            <TableBody>\n              {scoredModifiedCouncilors.map((councilor) => (\n                <CouncilorTableRow\n                  key={councilor.id}\n                  councilor={councilor}\n                  stats={councilor.effectsWithOrgsAndAugments}\n                  label={councilor.displayName!}\n                  hasOrgs\n                  highlightMissionClassName={currentHighlightMissionClassName}\n                />\n              ))}\\n            </TableBody>\n          </Table>\n          <h3 className=\"mt-1\">Available Organizations:</h3>\n          <Table>\n            <OrgTableHeader />\n            <TableBody>\n              {scoredOrgs.map((org) => (\n                <OrgTableRow\n                  key={org.id}\n                  org={org}\n                  playerNationIds={playerNationIds}\n                  playerTraits={playerTraits}\n                  highlightMissionClassName={availableHighlightMissionClassName}\n                />\n              ))}\\n            </TableBody>\n          </Table>\n        </>\n      )}\n\n      {section === \"new-councilors\" && (\n        <>\n          <h3 className=\"mt-1\">Available Councilors:</h3>\n          <Table>\n            <CouncilorTableHeader />\n            <TableBody>\n              {scoredAvailableCouncilors.map((councilor) => (\n                <CouncilorTableRow\n                  key={councilor.id}\n                  councilor={councilor}\n                  stats={councilor.effectsBaseAndUnaugmentedTraits}\n                  label={councilor.displayName!}\n                  highlightMissionClassName={availableHighlightMissionClassName}\n                />\n              ))}\\n            </TableBody>\n          </Table>\n\n          <h3 className=\"mt-1\">Unmodified Active Councilors:</h3>\n          <Table>\n            <CouncilorTableHeader />\n            <TableBody>\n              {scoredBaseCouncilors.map((councilor) => (\n                <CouncilorTableRow\n                  key={`${councilor.id}-base`}\n                  councilor={councilor}\n                  stats={councilor.effectsBaseAndUnaugmentedTraits}\n                  label={`${councilor.displayName}`}\n                  highlightMissionClassName={currentHighlightMissionClassName}\n                />\n              ))}\\n            </TableBody>\\n          </Table>\\n        </>\\n      )}\\n\\n      {section === \"current-orgs\" && (\\n        <Table>\\n          <OrgTableHeader costHeader=\\\"Councilor\\\" />\\n          <TableBody>\\n            {scoredOwnedOrgs.toReversed().map((org) => (\\n              <OrgTableRow\\n                key={org.id}\\n                org={org}\\n                playerNationIds={playerNationIds}\\n                playerTraits={playerTraits}\\n                highlightMissionClassName={availableHighlightMissionClassName}\\n              />\\n            ))}\\n          </TableBody>\\n        </Table>\\n      )}\\n\\n      {section === \"takeover\" && (\\n        <SmartTabs\\n          storageKey=\\\"councilorsTakeoverTabs\\\"\\n          defaultValue={`faction-${Array.from(stealableOrgsByFaction.keys())[0]}`}\\n        >\\n          <TabsList>\\n            {Array.from(stealableOrgsByFaction.entries()).map(([factionId, orgs]) => (\\n              <TabsTrigger key={factionId} value={`faction-${factionId}`}>\\n                {orgs[0].faction?.displayName || \\\"Unknown Faction\\\"} ({orgs.length})\\n              </TabsTrigger>\\n            ))}\\n          </TabsList>\\n          {Array.from(stealableOrgsByFaction.entries()).map(([factionId, orgs]) => (\\n            <TabsContent key={factionId} value={`faction-${factionId}`}>\\n              <Table>\\n                <OrgTableHeader costHeader=\\\"Takeover\\\" />\\n                <TableBody>\\n                  {orgs.map((org) => (\\n                    <OrgTableRow\\n                      key={org.id}\\n                      org={org}\\n                      playerNationIds={playerNationIds}\\n                      playerTraits={playerTraits}\\n                      highlightMissionClassName={availableHighlightMissionClassName}\\n                      isTakeover\\n                    />\\n                  ))}\\n                </TableBody>\\n              </Table>\\n            </TabsContent>\\n          ))}\\n        </SmartTabs>\\n      )}\\n\\n      {section === \"missions\" && (\\n        <SmartTabs storageKey=\\\"councilorsMissionsTabs\\\" defaultValue={`faction-${factions[0].id}`}>\\n          <TabsList>\\n            {factions.map((faction) => (\\n              <TabsTrigger key={faction.id} value={`faction-${faction.id}`}>\\n                {faction.displayName || \\\"Unknown Faction\\\"} ({sourcesByFactionByMission.get(faction.id)?.size || 0})\\n                {importantMissions\\n                  .filter(\\n                    (m) =>\\n                      sourcesByFactionByMission\\n                        .get(faction.id)\\n                        ?.get(m)\\n                        ?.filter((i) => i.type === \\\"councilor\\\")?.length ?? 0 > 0\\n                  )\\n                  .map((m) => {\\n                    const MissionIcon = MissionIcons[m] || UnknownIcon;\\n                    return (\\n                      <span key={m} className=\\\"inline-block -mt-2\\\">\\n                        <MissionIcon className=\\\"h-4 w-4\\\" />\\n                      </span >\\n                    );\\n                  })}\\n              </TabsTrigger>\\n            ))}\\n          </TabsList>\\n          {factions.map((faction) => (\\n            <TabsContent key={faction.id} value={`faction-${faction.id}`}>\\n              <SmartAccordion type=\\\"single\\\" collapsible storageKey={`councilorsMissions-${faction.id}`}>\\n                {Array.from(\\n                  new Set([\\n                    ...importantMissions,\\n                    ...Array.from(sourcesByFactionByMission.get(faction.id)?.keys() || []),\\n                  ]),\\n                ).map((missionName) => {\\n                  const sources = sourcesByFactionByMission.get(faction.id)?.get(missionName) || [];\\n                  const MissionIcon = MissionIcons[missionName] || UnknownIcon;\\n                  return (\\n                    <AccordionItem key={missionName} value={missionName}>\\n                      <AccordionTrigger>\\n                        <span\\n                          >\\n                          <MissionIcon /> {missionName} &ndash;{\\\" \\\"}\\n                          {sources.filter((i) => i.type === \\\"councilor\\\").length} Councilors &lt;-{\\\" \\\"}\\n                          {sources.filter((i) => i.type === \\\"org\\\").length} Orgs\\n                        </span >\\n                      </AccordionTrigger>\\n                      <AccordionContent>\\n                        <Table>\\n                          <TableHeader>\\n                            <TableRow>\\n                              <TableHead>Fleet Name</TableHead>\\n                              <TableHead>Planet</TableHead>\\n                              <TableHead>Target Orbit</TableHead>\\n                              <TableHead>Arrival Date</TableHead>\\n                              <TableHead className=\\\"text-right\\\">Days to Arrival</TableHead>\\n                              <TableHead className=\\\"text-right\\\">MC Used</TableHead>\\n                              <TableHead className=\\\"text-right\\\">Marine CP</TableHead>\\n                              <TableHead className=\\\"text-right\\\">Total Mass</TableHead>\\n                              <TableHead className=\\\"text-right\\\">Max Ship Mass</TableHead>\\n                              <TableHead>Ships Hulls</TableHead>\\n                              <TableHead>Ships Roles</TableHead>\\n                              <TableHead>Operation</TableHead>\\n                              <TableHead>Operation Complete</TableHead>\\n                            </TableRow>\\n                          </TableHeader>\\n                          <TableBody>\\n                            {sources?.map((src) => (\\n                              src.type === \\\"org\\\" ? (\\n                                <OrgTableRow\\n                                  key={`councilor-${src.org.id}-mission-${missionName}`}\\n                                  org={src.org}\\n                                  playerNationIds={playerNationIds}\\n                                  playerTraits={playerTraits}\\n                                />\\n                              ) : (\\n                                <CouncilorTableRow\\n                                  key={`org-${src.councilor.id}-mission-${missionName}`}\\n                                  councilor={src.councilor}\\n                                  stats={src.councilor.effectsWithOrgsAndAugments}\\n                                  label={src.councilor.displayName!}\\n                                />\\n                              )\\n                            ))}\\n                          </TableBody>\\n                        </Table>\\n                      </AccordionContent>\\n                    </AccordionItem>\\n                  );\\n                })}\\n              </SmartAccordion>\\n            </TabsContent>\\n          ))}\\n        </SmartTabs>\\n      </div >\\n    )}\\n\\n    {section === \\\"other-councilors\\\" && (\\n      <div className=\\\"space-y-2\\\">\\n        <OtherCouncilorsByFaction {...{ analysis, weights }} />\\n      </div >\\n    )}\\n\\n    {/* Debug Data and Scoring Weights dialog are moved to the parent RenderGameComponent */}\\n  </div>\\n    );\\n}\\n\\nfunction OtherCouncilorsByFaction({ analysis, weights }: { analysis: Analysis; weights: ScoringWeights }) {\\n  const { playerVisibleCouncilors, factionsById } = analysis;\\n\\n  const scoredBaseCouncilors = scoreAndSort(\\n    playerVisibleCouncilors,\\n    weights,\\n    new Map<MissionDataName, number>(),\\n    getBaseCouncilorScore\\n  );\\n\\n  const councilorsByFactionId = scoredBaseCouncilors.reduce((acc, councilor) => {\\n    const factionId = councilor.factionId || 0;\\n    if (!factionId) return acc;\\n    if (!acc.has(factionId)) {\\n      acc.set(factionId, []);\\n    }\\n    acc.get(factionId)!.push(councilor);\\n    return acc;\\n  }, new Map<number, Analysis[\\\"playerCouncilors\\\"][number][]>());\\n\\n  const factions = Array.from(councilorsByFactionId.keys())\\n    .map((i) => factionsById.get(i!)!)\\n    .filter((i) => i.id !== analysis.alienFaction.id);\\n\\n  return (\\n    <Tabs defaultValue={`faction-${factions[0].id}`}>\\n      <TabsList>\\n        {factions\\n          .filter((i) => i.id !== analysis.alienFaction.id)\\n          .map((faction) => (\\n            <TabsTrigger key={faction.id} value={`faction-${faction.id}`}>\\n              {faction.displayName || \\\"Unknown Faction\\\"} ({councilorsByFactionId.get(faction.id)?.length || 0})\\n            </TabsTrigger>\\n          ))}\\n      </TabsList>\\n      {factions.map((faction) => (\\n        <TabsContent key={faction.id} value={`faction-${faction.id}`}>\\n          <Table>\\n            <TableHeader>\\n              <TableRow>\\n                <TableHead>Name</TableHead>\\n                <TableHead>Modified Stats</TableHead>\\n                <TableHead>Org Tiers</TableHead>\\n                <TableHead>Monthly Effects</TableHead>\\n                <TableHead>Priorities</TableHead>\\n                <TableHead>Science</TableHead>\\n                <TableHead>Missions</TableHead>\\n                <TableHead>Score</TableHead>\\n                <TableHead>NM Score</TableHead>\\n                <TableHead>CP Cap</TableHead>\\n              </TableRow>\\n            </TableHeader>\\n            <TableBody>\\n              {councilorsByFactionId.get(faction.id)?.map((councilor) => (\\n                <CouncilorTableRow\\n                  key={councilor.id}\\n                  councilor={councilor}\\n                  stats={councilor.effectsBaseAndUnaugmentedTraits}\\n                  label={councilor.displayName!}\\n                />\\n              ))}\\n            </TableBody>\\n          </Table>\\n        </TabsContent>\\n      ))}\\n    </Tabs>\\n  );\\n}\\n\\nfunction scoreAndSort<T>(\\n  items: T[],\\n  weights: ScoringWeights,\\n  haveMissions: Map<MissionDataName, number>,\\n  scoreFn: (item: T, weights: ScoringWeights, haveMissions: Map<MissionDataName, number>) => ScoreResult,\\n  scoreSort: \\\"value\\\" | \\\"noMissionScore\\\" = \\\"value\\\"\\n) {\\n  const scoredItems = items.map((item) => {\\n    const scoreResult = scoreFn(item, weights, haveMissions);\\n    return { ...item, score: scoreResult };\\n  });\\n  scoredItems.sort((a, b) => b.score[scoreSort] - a.score[scoreSort]);\\n  return scoredItems;\\n}\\n\\nfunction getBaseCouncilorScore(\\n  councilor: Analysis[\\\"playerCouncilors\\\"][number],\\n  weights: ScoringWeights,\\n  haveMissions: Map<MissionDataName, number>\\n): ScoreResult {\\n  return getScore(councilor.effectsBaseAndUnaugmentedTraits, weights, haveMissions, true);\\n}\\n\\nfunction getModifiedCouncilorScore(\\n  councilor: Analysis[\\\"playerCouncilors\\\"][number],\\n  weights: ScoringWeights,\\n  haveMissions: Map<MissionDataName, number>\\n): ScoreResult {\\n  return getScore(councilor.effectsWithOrgsAndAugments, weights, haveMissions, true);\\n}\\n\\nconst orgTransferFactor = 0.2;\\nfunction getOrganizationScore(\\n  org: Analysis[\\\"playerAvailableOrgs\\\"][number] & { type: string },\\n  weights: ScoringWeights,\\n  haveMissions: Map<MissionDataName, number>\\n): ScoreResult {\\n  return getScore(\\n    {\\n      ...org,\\n      techBonuses: org.template?.techBonuses,\\n      missionsGrantedNames: org.template?.missionsGrantedNames || [],\\n      ...(org.type === \\\"available\\\"\\n        ? {}\\n        : {\\n            // already-purchased orgs seem to cost ~30% to transfer\\n            costMoney: (org.costMoney || 0) * orgTransferFactor,\\n            costInfluence: (org.costInfluence || 0) * orgTransferFactor,\\n            costOps: (org.costOps || 0) * orgTransferFactor,\\n            costBoost: (org.costBoost || 0) * orgTransferFactor,\\n          }),\\n    },\\n    weights,\\n    haveMissions\\n  );\\n}\\n\\ninterface ScoreResult {\\n  value: number;\\n  noMissionScore: number;\\n  details: string;\\n}\\n\\nfunction getScore(\\n  org: ShowEffectsProps,\\n  weights: ScoringWeights,\\n  haveMissions: Map<MissionDataName, number>,\\n  ignoreTier: boolean = false\\n): ScoreResult {\\n  let totalScore = 0;\\n  const details: string[] = [];\\n\\n  // Helper to add score for a numeric attribute\\n  const addScore = (name: string, value: number | undefined, weight: number | undefined, noNegative?: boolean) => {\\n    let actualValue = value || 0;\\n    if (noNegative) {\\n      actualValue = Math.max(0, actualValue);\\n    }\\n    const actualWeight = weight ?? 0;\\n\\n    // Skip if value or weight is 0/undefined/null\\n    if (!actualValue || !actualWeight) return;\\n\\n    const contribution = actualValue * actualWeight;\\n    totalScore += contribution;\\n    details.push(\\n      `${name}: ${parseFloat(actualValue.toFixed(2))} × ${parseFloat(actualWeight.toFixed(3))} = ${contribution.toFixed(\\n        3\\n      )}`\\n    );\\n  };\\n\\n  // Councilor attributes\\n  addScore(\\\"persuasion\\\", org.persuasion, weights.persuasion, true);\\n  addScore(\\\"command\\\", org.command, weights.command, true);\\n  addScore(\\\"investigation\\\", org.investigation, weights.investigation, true);\\n  addScore(\\\"espionage\\\", org.espionage, weights.espionage, true);\\n  addScore(\\\"administration\\\", org.administration, weights.administration, true);\\n  addScore(\\\"science\\\", org.science, weights.science, true);\\n  addScore(\\\"security\\\", org.security, weights.security, true);\\n  addScore(\\\"Persuasion\\\", org.Persuasion, weights.persuasion, true);\\n  addScore(\\\"Command\\\", org.Command, weights.command, true);\\n  addScore(\\\\\"Investigation\\\\\", org.Investigation, weights.investigation, true);\\n  addScore(\\\\\"Espionage\\\\\", org.Espionage, weights.espionage, true);\\n  addScore(\\\\\"Administration\\\\\", org.Administration, weights.administration, true);\\n  addScore(\\\\\"Science\\\\\", org.Science, weights.science, true);\\n  addScore(\\\\\"Security\\\\\", org.Security, weights.security, true);\\n  addScore(\\\\\\\"xpModifier\\\\\\\", org.xpModifier, weights.xpModifier);\\n  addScore(\\\\\\\"xp\\\\\\\", org.xp, weights.xp);\\n\\n  // Monthly income/costs\\n  addScore(\\\\\\\"incomeBoost_month\\\\\\\", org.incomeBoost_month, weights.incomeBoost_month);\\n  addScore(\\\\\\\"incomeMoney_month\\\\\\\", org.incomeMoney_month, weights.incomeMoney_month);\\n  addScore(\\\\\\\"incomeInfluence_month\\\\\\\", org.incomeInfluence_month, weights.incomeInfluence_month);\\n  addScore(\\\\\\\"incomeOps_month\\\\\\\", org.incomeOps_month, weights.incomeOps_month);\\n  addScore(\\\\\\\"incomeMissionControl\\\\\\\", org.incomeMissionControl, weights.incomeMissionControl);\\n  addScore(\\\\\\\"incomeResearch_month\\\\\\\", org.incomeResearch_month, weights.incomeResearch_month);\\n  addScore(\\\\\\\"projectCapacityGranted\\\\\\\", org.projectCapacityGranted, weights.projectCapacityGranted);\\n\\n  // Purchase costs\\n  addScore(\\\\\\\"costMoney\\\\\\\", org.costMoney, weights.costMoney);\\n  addScore(\\\\\\\"costInfluence\\\\\\\", org.costInfluence, weights.costInfluence);\\n  addScore(\\\\\\\"costOps\\\\\\\", org.costOps, weights.costOps);\\n  addScore(\\\\\\\"costBoost\\\\\\\", org.costBoost, weights.costBoost);\\n\\n  // Priority bonuses\\n  addScore(\\\\\\\"economyBonus\\\\\\\", org.economyBonus, weights.economyBonus);\\n  addScore(\\\\\\\"welfareBonus\\\\\\\", org.welfareBonus, weights.welfareBonus);\\n  addScore(\\\\\\\"environmentBonus\\\\\\\", org.environmentBonus, weights.environmentBonus);\\n  addScore(\\\\\\\"knowledgeBonus\\\\\\\", org.knowledgeBonus, weights.knowledgeBonus);\\n  addScore(\\\\\\\"governmentBonus\\\\\\\", org.governmentBonus, weights.governmentBonus);\\n  addScore(\\\\\\\"unityBonus\\\\\\\", org.unityBonus, weights.unityBonus);\\n  addScore(\\\\\\\"militaryBonus\\\\\\\", org.militaryBonus, weights.militaryBonus);\\n  addScore(\\\\\\\"oppressionBonus\\\\\\\", org.oppressionBonus, weights.oppressionBonus);\\n  addScore(\\\\\\\"spoilsBonus\\\\\\\", org.spoilsBonus, weights.spoilsBonus);\\n  addScore(\\\\\\\"spaceDevBonus\\\\\\\", org.spaceDevBonus, weights.spaceDevBonus);\\n  addScore(\\\\\\\"spaceflightBonus\\\\\\\", org.spaceflightBonus, weights.spaceflightBonus);\\n  addScore(\\\\\\\"MCBonus\\\\\\\", org.MCBonus, weights.MCBonus);\\n  addScore(\\\\\\\"miningBonus\\\\\\\", org.miningBonus, weights.miningBonus);\\n\\n  // Tech bonuses from councilor/traits\\n  if (weights.councilorTechBonus && org?.councilorTechBonus) {\\n    for (const { category, bonus } of org.councilorTechBonus) {\\n      const weight = weights.councilorTechBonus[category];\\n      addScore(`councilorTechBonus[${category}]`, bonus, weight);\\n    }\\n  }\\n\\n  // Tech bonuses from orgs\\n  if (weights.techBonues && org?.techBonues) {\\n    for (const { category, bonus } of org.techBonues) {\\n      const weight = weights.techBonues[category];\\n      addScore(`techBonus[${category}]`, bonus, weight);\\n    }\\n  }\\n\\n  let noMissionScore = totalScore;\\n\\n  // Missions granted\\n  if (weights.missions && org?.missionsGrantedNames) {\\n    for (const missionName of org.missionsGrantedNames) {\\n      const weight = weights.missions[missionName];\\n      addScore(`mission[${missionName}]`, 1, weight);\\n\\n      // Extra weight for missing missions\\n      if (weights.extraWeightForMissingMissions && (haveMissions.get(missionName) || 0) === 0) {\\n        totalScore += weights.extraWeightForMissingMissions;\\n        details.push(\\n          `mission[${missionName}]: missing bonus × ${parseFloat(\\n            weights.extraWeightForMissingMissions.toFixed(3)\\n          )} = ${weights.extraWeightForMissingMissions.toFixed(3)}`\\n        );\\n      }\\n      if (weights.extraWeightForSingleMissions && (haveMissions.get(missionName) || 0) === 1) {\\n        totalScore += weights.extraWeightForSingleMissions;\\n        details.push(\\n          `mission[${missionName}]: single bonus × ${parseFloat(\\n            weights.extraWeightForSingleMissions.toFixed(3)\\n          )} = ${weights.extraWeightForSingleMissions.toFixed(3)}`\\n        );\\n      }\\n    }\\n  }\\n\\n  // Divide by tier to normalize for org cost/power\\n  const tier = org.tier || 1;\\n  let finalScore = totalScore;\\n\\n  if (tier > 1 && !ignoreTier) {\\n    const tierFactor = Math.pow(tier, weights.orgTierExponent);\\n    finalScore = totalScore / tierFactor;\\n    noMissionScore /= tierFactor;\\n    details.push(`Subtotal: ${totalScore.toFixed(3)}`);\\n    details.push(`Divided by ${tierFactor.toFixed(2)} for tier ${tier}: ${finalScore.toFixed(3)}`);\\n  }\\n\\n  return {\\n    value: finalScore,\\n    noMissionScore,\\n    details: details.join(\\\"\\\\n\\\"),\\n  };\\n}\\\n",
  "oldString": "[... (entire file) ...]\n"
}
```

**Error:**
```
Could not find oldString in the file. It must match exactly, including whitespace, indentation, and line endings.
```

---

## Assistant (Build · Gemma 4-26B-A4B (local) · 37.1s)

_Thinking:_

I'll just use `Write` to replace the entire file with the new content. I'll construct the content carefully.

Wait, I don't have the full content of the original file easily available in a way that I can just `Write` it back if I make a mistake.

I'll do it in small, manageable edits.

**Step 1: Update `getCouncilorsUi` signature and return type in `councilors.tsx`.**

Wait, I'll first update `getFleetsUi`, `getHabsUi`, etc. to return `NavItem` instead of the old object.

Let's start with `getFleetsUi` in `fleets.tsx`.
I'll also need to update the imports.



**Tool: edit**

**Input:**
```json
{
  "filePath": "terra-invicta-assistant\\src\\app\\game\\current\\fleets.tsx",
  "newString": "import { Analysis } from \"@/lib/analysis\";\nimport { NavItem } from \"./types\";\nimport { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from \"@/components/ui/table\";\nimport { Collapsible, CollapsibleContent, CollapsibleTrigger } from \"@/components/ui/collapsible\";\nimport { AccordionContent, AccordionItem, AccordionTrigger } from \"@/components/ui/accordion\";\nimport { SmartAccordion } from \"@/components/ui/smart-accordion\";\nimport { Button } from \"@/components/ui/button\";\nimport { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from \"@/components/ui/tooltip\";\nimport { diffDateTime, sortByDateTime, toDays } from \"@/lib/utils\";\nimport { Fragment } from \"react/jsx-runtime\";\nimport { FactionIcons, MissionControl } from \"@/components/icons\";\nimport { twMerge } from \"tailwind-merge\";\nimport { FleetsComponent } from \"./fleets-component\"; // I'll move the component to a separate file to avoid issues\n",
  "oldString": "import { Analysis } from \"@/lib/analysis\";\nimport { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from \"@/components/ui/table\";\nimport { Collapsible, CollapsibleContent, CollapsibleTrigger } from \"@/components/ui/collapsible\";\nimport { AccordionContent, AccordionItem, AccordionTrigger } from \"@/components/ui/accordion\";\nimport { SmartAccordion } from \"@/components/ui/smart-accordion\";\nimport { Button } from \"@/components/ui/button\";\nimport { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from \"@/components/ui/tooltip\";\nimport { diffDateTime, sortByDateTime, toDays } from \"@/lib/utils\";\nimport { Fragment } from \"react/jsx-runtime\";\nimport { FactionIcons, MissionControl } from \"@/components/icons\";\nimport { twMerge } from \"tailwind-merge\";\nimport { FleetsComponent } from \"./fleets-component\"; \n"
}
```

**Error:**
```
Could not find oldString in the file. It must match exactly, including whitespace, indentation, and line endings.
```

---

## Assistant (Build · Gemma 4-26B-A4B (local) · 6.5s)

_Thinking:_

It seems my `oldString` is not matching. I'll use `Read` to get the exact content of `fleets.tsx`.


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
13: export function getFleetsUi(analysis: Analysis): NavItem {
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
34:           </span >{" "}
35:         </>
36:       ) : null;
37:       if (fleets.length === 0) {
38:         if (survInfo) {
39:           return (
40:             <span
41:               key={target}
42:             >
43:               {target}: {survInfo}
44:             </span >
45:           );
46:         }
47:         return null;
48:       }
49:       // now that we know the arrival of the first one, find all arriving within 14 days to summarize MC
50:       const firstFleet = sortByDateTime(fleets, (f) => f.arrivalTime || analysis.gameCurrentDateTime)[0];
51:       const firstFleets = fleets.filter(
52:         (f) =>
53:           toDays(
54:             diffDateTime(
55:               f.arrivalTime || analysis.gameCurrentDateTime,
56:               firstFleet.arrivalTime || analysis.gameCurrentDateTime,
57:             ),
58:           ) < 14,
59:       );
60:       const firstMc = firstFleets.reduce((sum, f) => sum + f.totalMC, 0);
61: 
62:       // tier 2 hab (60d), fusion power, and defense module (90d) take a total of 150 days
63:       // tier 3 hab (90d), fusion power, and defense module (180d) take a total of 270 days.
64:       // T2 hab should be able to stop a bombard from a 10MC fleet, and T3 is the best we can do anyway, plus the turn time of 30 days should make for enough warning
65:       // before that, we'll still have the nameplate warning and can look at details in the fleets tab
66:       const warningNeeded = (firstMc > 10 ? 270 : 150) + 30;
67:       const daysToTarget = firstFleet.daysToTarget || 0;
68:       const farFuture = daysToTarget > warningNeeded;
69:       const className = twMerge(
70:         farFuture && "px-1 -mx-1 py-0.5 -my-0.5 rounded bg-green-500",
71:         farFuture &&
72:           (daysToTarget < warningNeeded + 50
73:             ? "bg-red-200"
74:             : daysToTarget < warningNeeded + 100
75:               ? "bg-yellow-200"
76:               : "bg-green-200"),
77:       );
78:       return (
79:         <span
80:           key={target}
81:           className={className}
82:           title={`${fleets.length} fleet(s) targeting ${target}, arriving in ${daysToTarget.toFixed(
83:             0,
84:           )} days, using ${firstMc.toFixed(0)} MC`}
85:         >
86:           {target}
87:           {fleets.length > 1 ? `(${fleets.length})` : ""}
88:           {farFuture ? (
89:             ""
90:           ) : (
91:             <>
92:               : {daysToTarget.toFixed(0)}d <MissionControl />
93:               {firstMc.toFixed(0)}
94:             </>
95:           )}
96:           {survInfo && <>,{survInfo}</>}
97:         </span >
98:       );
99:     }),
100:   ].filter((i) => !!i);
101:   return {
102:     key: "fleets",
103:     label: (
104:       <>
105:         Fleets
106:         {label.length > 0 ? (
107:           <>
108:             {" - "}
109:             {label.map((i, ix) => (
110:               <Fragment key={ix}>
111:                 {i}
112:                 {ix < label.length - 1 ? " | " : ""}
113:               </Fragment>
114:             ))}
115:           </>
116:         ) : (
117:           ""
118:         )}
119:       </>
120:     ),
121:     content: <FleetsComponent analysis={analysis} />,
122:   };
123: }
124: 
125:     acc.get(key)!.push(fleet);
126:     return acc;
127:   }, new Map<string, typeof analysis.alienFleetsToPlayerOrbits>());
128:   const label = [
129:     ...byTarget.entries().map(([target, rawFleets]) => {
130:       const fleets = rawFleets.filter((f) => f.deltaV > 0 && (f.daysToTarget || 0) > 0);
131:       const surv = rawFleets.filter((f) => f.operation === "AlienEarthSurveillanceOperation" && !f.arrivalTime);
132:       const survInfo = surv.length ? (
133:         <>
134:           <span className="text-white bg-destructive rounded py-2 px-3 font-bold">
135:             {surv
136:               .map((f) => f.operationCompleteDays || 0)
137:               .reduce((a, b) => Math.min(a, b), 9999999999)
138:               .toFixed(0)}
139:             d Surveillance
140:           </span>{" "}
141:         </>
142:       ) : null;
143:       if (fleets.length === 0) {
144:         if (survInfo) {
145:           return (
146:             <span>
147:               {target}: {survInfo}
148:             </span>
149:           );
150:         }
151:         return null;
152:       }
153:       // now that we know the arrival of the first one, find all arriving within 14 days to summarize MC
154:       const firstFleet = sortByDateTime(fleets, (f) => f.arrivalTime || analysis.gameCurrentDateTime)[0];
155:       const firstFleets = fleets.filter(
156:         (f) =>
157:           toDays(
158:             diffDateTime(
159:               f.arrivalTime || analysis.gameCurrentDateTime,
160:               firstFleet.arrivalTime || analysis.gameCurrentDateTime,
161:             ),
162:           ) < 14,
163:       );
164:       const firstMc = firstFleets.reduce((sum, f) => sum + f.totalMC, 0);
165: 
166:       // tier 2 hab (60d), fusion power, and defense module (90d) take a total of 150 days
167:       // tier 3 hab (90d), fusion power, and defense module (180d) take a total of 270 days.
168:       // T2 hab should be able to stop a bombard from a 10MC fleet, and T3 is the best we can do anyway, plus the turn time of 30 days should make for enough warning
169:       // before that, we'll still have the nameplate warning and can look at details in the fleets tab
170:       const warningNeeded = (firstMc > 10 ? 270 : 150) + 30;
171:       const daysToTarget = firstFleet.daysToTarget || 0;
172:       const farFuture = daysToTarget > warningNeeded;
173:       const className = twMerge(
174:         farFuture && "px-1 -mx-1 py-0.5 -my-0.5 rounded bg-green-500",
175:         farFuture &&
176:           (daysToTarget < warningNeeded + 50
177:             ? "bg-red-200"
178:             : daysToTarget < warningNeeded + 100
179:               ? "bg-yellow-200"
180:               : "bg-green-200"),
181:       );
182:       return (
183:         <span
184:           className={className}
185:           title={`${fleets.length} fleet(s) targeting ${target}, arriving in ${daysToTarget.toFixed(
186:             0,
187:           )} days, using ${firstMc.toFixed(0)} MC`}
188:         >
189:           {target}
190:           {fleets.length > 1 ? `(${fleets.length})` : ""}
191:           {farFuture ? (
192:             ""
193:           ) : (
194:             <>
195:               : {daysToTarget.toFixed(0)}d <MissionControl />
196:               {firstMc.toFixed(0)}
197:             </>
198:           )}
199:           {survInfo && <>,{survInfo}</>}
200:         </span>
201:       );
202:     }),
203:   ].filter((i) => !!i);
204: 
205:   return {
206:     key: "fleets",
207:     tab: (
208:       <>
209:         Fleets
210:         {label.length > 0 ? (
211:           <>
212:             {" - "}
213:             {label.map((i, ix) => (
214:               <Fragment key={ix}>
215:                 {i}
216:                 {ix < label.length - 1 ? " | " : ""}
217:               </Fragment>
218:             ))}
219:           </>
220:         ) : (
221:           ""
222:         )}
223:       </>
224:     ),
225:     content: <FleetsComponent analysis={analysis} />,
226:   };
227: }
228: 
229: function FleetsComponent({ analysis }: { analysis: Analysis }) {
230:   const alienFleets = analysis.alienFleetsToPlayerOrbits;
231:   const humanEnemyFleets = analysis.humanEnemyFleetsToPlayerOrbits;
232:   const playerFleets = analysis.playerFleets;
233:   const shipsUnderConstruction = analysis.playerShipsUnderConstruction;
234: 
235:   return (
236:     <SmartAccordion
237:       type="multiple"
238:       storageKey="fleetsSections"
239:       defaultValue={["alien-fleets", "human-enemy-fleets", "player-fleets", "ships-under-construction"]}
240:     >
241:       {/* Alien Fleets */}
242:       <AccordionItem value="alien-fleets">
243:         <AccordionTrigger>Alien Fleets ({alienFleets.length})</AccordionTrigger>
244:         <AccordionContent>
245:           {alienFleets.length === 0 ? (
246:             <div className="p-4 text-muted-foreground">No alien fleets detected heading to player orbits.</div>
247:           ) : (
248:             <div className="space-y-2">
249:               <p>Tracking planets: {analysis.playerInterestedPlanets.map((p) => p.displayName).join(", ")}</p>
250:               <Table>
251:                 <TableHeader>
252:                   <TableRow>
253:                     <TableHead>Fleet Name</TableHead>
254:                     <TableHead>Planet</TableHead>
255:                     <TableHead>Target Orbit</TableHead>
256:                     <TableHead>Arrival Date</TableHead>
257:                     <TableHead className="text-right">Days to Arrival</TableHead>
258:                     <TableHead className="text-right">MC Used</TableHead>
259:                     <TableHead className="text-right">Marine CP</TableHead>
260:                     <TableHead className="text-right">Total Mass</TableHead>
261:                     <TableHead className="text-right">Max Ship Mass</TableHead>
262:                     <TableHead>Ships Hulls</TableHead>
263:                     <TableHead>Ships Roles</TableHead>
264:                     <TableHead>Operation</TableHead>
265:                     <TableHead>Operation Complete</TableHead>
266:                   </TableRow>
267:                 </TableHeader>
268:                 <TableBody>
269:                   {alienFleets.map((fleet) => (
270:                     <TableRow key={fleet.id} className={twMerge(fleet.deltaV === 0 ? "bg-gray-500/5" : "")}>
271:                       <TableCell className="font-medium">{fleet.displayName}</TableCell>
272:                       <TableCell>{fleet.planetName}</TableCell>
273:                       <TableCell>{fleet.targetOrbitName}</TableCell>
274:                       <TableCell>{fleet.arrivalTimeFormatted || "-"}</TableCell>
275:                       <TableCell className="text-right">
276:                         {fleet.daysToTarget !== null ? `${fleet.daysToTarget.toFixed(0)}` : "—"}
277:                       </TableCell>
278:                       <TableCell className="text-right">{fleet.totalMC.toFixed(0)}</TableCell>
279:                       <TableCell className="text-right">{fleet.marineCombatPower > 0 ? fleet.marineCombatPower : "—"}</TableCell>
280:                       <TableCell className="text-right">{(fleet.totalMass / 1000000).toFixed(0)} Mkg</TableCell>
281:                       <TableCell className="text-right">{(fleet.maxShipMass / 1000000).toFixed(0)} Mkg</TableCell>
282:                       <TableCell className="whitespace-normal">
283:                         {fleet.shipsByHullType.length > 0
284:                           ? fleet.shipsByHullType
285:                               .map((ship) => {
286:                                 const name = `${ship.count} ${ship.hullName.replace("Alien ", "")}${ship.count > 1 ? "s" : ""}`;
287:                                 return ship.avgNoseArmor > 0 ? `${name} (${ship.avgNoseArmor})` : name;
288:                               })
289:                               .join(" + ")
290:                           : "-"}
291:                       </TableCell>
292:                       <TableCell className="whitespace-normal">
293:                         {fleet.shipsByRole.length > 0
294:                           ? fleet.shipsByRole
295:                               .map((ship) => `${ship.count} ${ship.role}${ship.count > 1 ? "s" : ""}`)
296:                               .join(" + ")
297:                           : "-"}
298:                       </TableCell>
299:                       <TableCell>{fleet.operation || "-"}</TableCell>
300:                       <TableCell>
301:                         {fleet.operationComplete
302:                           ? `${fleet.operationComplete}${
303:                               fleet.operationCompleteDays !== null
304:                                 ? ` (${fleet.operationCompleteDays.toFixed(0)}d)`
305:                                 : ""
306:                             }`
307:                           : "-"}
308:                       </TableCell>
309:                     </TableRow>
310:                   ))}
311:                 </TableBody>
312:               </Table>
313: 
314:               {/* Planetary Defense Summary */}
315:               <div className="mt-8">
316:                 <h2 className="text-2xl font-bold mb-4">Planetary Defense Summary</h2>
317:                 <Table>
318:                   <TableHeader>
319:                     <TableRow>
320:                       <TableHead>Planet</TableHead>
321:                       <TableHead className="text-right">Days to Arrival</TableHead>
322:                       <TableHead className="text-right">Alien Fleet MC</TableHead>
323:                       <TableHead className="text-right">Player Fleet MC</TableHead>
324:                       <TableHead>Habs (Active / Potential Combat)</TableHead>
325:                     </TableRow>
326:                   </TableHeader>
327:                   <TableBody>
328:                     {(() => {
329:                       const planetsWithFleets = new Set(
330:                         analysis.alienFleetsToPlayerOrbits.map((f) => f.planetName || "Unknown"),
331:                       );
332:                       const defenseData = Array.from(planetsWithFleets)
333:                         .map((planet) => {
334:                           const fleetsAtPlanet = analysis.alienFleetsToPlayerOrbits.filter(
335:                             (f) => f.planetName === planet,
336:                           );
337:                           const totalAlienMC = fleetsAtPlanet.reduce((sum, f) => sum + (f.totalMC || 0), 0);
338:                           const incomingFleets = fleetsAtPlanet.filter(
339:                             (f) => f.daysToTarget !== null && f.daysToTarget > 0,
340:                           );
341:                           const daysToArrival =
342:                             incomingFleets.length > 0
343:                               ? Math.min(...incomingFleets.map((f) => f.daysToTarget!))
344:                               : null;
345:                           const playerFleetsAtPlanet = analysis.playerFleets.filter(
346:                             (f) => f.planetName === planet,
347:                           );
348:                           const relevantPlayerFleets = playerFleetsAtPlanet.filter((f) => {
349:                             if (f.daysToTarget === null || f.daysToTarget <= 0) return true;
350:                             if (daysToArrival === null) return false;
351:                             return f.daysToTarget < daysToArrival;
352:                           });
353:                           const totalPlayerMC = relevantPlayerFleets.reduce((sum, f) => sum + (f.totalMC || 0), 0);
354:                           const habsAtPlanet = analysis.playerHabs.filter((h) => h.planetName === planet);
355:                           return { planet, totalAlienMC, totalPlayerMC, daysToArrival, habs: habsAtPlanet };
356:                         })
357:                         .filter((d) => d.habs.length > 0)
358:                         .toSorted((a, b) => {
359:                           if (a.daysToArrival === null && b.daysToArrival === null) return 0;
360:                           if (a.daysToArrival === null) return 1;
361:                           if (b.daysToArrival === null) return -1;
362:                           return a.daysToArrival - b.daysToArrival;
363:                         });
364: 
365:                       return defenseData.map(({ planet, totalAlienMC, totalPlayerMC, daysToArrival, habs }) => (
366:                         <TableRow key={planet}>
367:                           <TableCell className="font-medium">{planet}</TableCell>
368:                           <TableCell className="text-right">
369:                             {daysToArrival !== null ? daysToArrival.toFixed(0) : "—"}
370:                           </TableCell>
371:                           <TableCell className="text-right">{totalAlienMC.toFixed(0)}</TableCell>
372:                           <TableCell className="text-right">{totalPlayerMC.toFixed(0)}</TableCell>
373:                           <TableCell>
374:                             <TooltipProvider>
375:                               <div className="flex gap-2 flex-wrap">
376:                                 {habs
377:                                   .toSorted((a, b) => {
378:                                     if (a.habType === "Station" && b.habType !== "Station") return -1;
379:                                     if (a.habType !== "Station" && b.habType === "Station") return 1;
380:                                     return 0;
381:                                   })
382:                                   .map((hab) => {
383:                                     const activeCombat = hab.activeEffects.combatScore || 0;
384:                                     const potentialCombat = hab.potentialEffects.combatScore || 0;
385:                                     const combatDisplay =
386:                                       activeCombat === potentialCombat
387:                                         ? activeCombat.toFixed(0)
388:                                         : `${activeCombat.toFixed(0)} / ${potentialCombat.toFixed(0)}`;
389:                                     const bgColor = hab.habType === "Station" ? "bg-yellow-100" : "bg-green-100";
390:                                     return (
391:                                       <Tooltip key={hab.id}>
392:                                         <TooltipTrigger asChild>
393:                                           <span className={`cursor-help ${bgColor} px-1.5 py-0.5 rounded`}>
394:                                             {combatDisplay}
395:                                           </span>
396:                                         </TooltipTrigger>
397:                                         <TooltipContent>
398:                                           <div>{hab.displayName}</div>
399:                                         </TooltipContent>
400:                                       </Tooltip>
401:                                     );
402:                                   })}
403:                               </div>
404:                             </TooltipProvider>
405:                           </TableCell>
406:                         </TableRow>
407:                       ));
408:                     })()}
409:                   </TableBody>
410:                 </Table>
411:               </div>
412: 
413:               <Collapsible>
414:                 <CollapsibleTrigger asChild>
415:                   <Button>Debug Data</Button>
416:                 </CollapsibleTrigger>
417:                 <CollapsibleContent>
418:                   <pre>{JSON.stringify(alienFleets, null, 2)}</pre>
419:                 </CollapsibleContent>
420:               </Collapsible>
421:             </div>
422:           )}
423:         </AccordionContent>
424:       </AccordionItem>
425: 
426:       {/* Other Human Factions Fleets */}
427:       <AccordionItem value="human-enemy-fleets">
428:         <AccordionTrigger>Other Human Factions ({humanEnemyFleets.length})</AccordionTrigger>
429:         <AccordionContent>
430:           {humanEnemyFleets.length === 0 ? (
431:             <div className="p-4 text-muted-foreground">No other human faction fleets detected heading to player orbits.</div>
432:           ) : (
433:             <Table>
434:               <TableHeader>
435:                 <TableRow>
436:                   <TableHead>Faction</TableHead>
437:                   <TableHead>Fleet Name</TableHead>
438:                   <TableHead>Planet</TableHead>
439:                   <TableHead>Target Orbit</TableHead>
440:                   <TableHead>Arrival Date</TableHead>
441:                   <TableHead className="text-right">Days to Arrival</TableHead>
442:                   <TableHead className="text-right">MC Used</TableHead>
443:                   <TableHead className="text-right">Marine CP</TableHead>
444:                   <TableHead className="text-right">Total Mass</TableHead>
445:                   <TableHead className="text-right">Max Ship Mass</TableHead>
446:                   <TableHead>Ship Hulls</TableHead>
447:                   <TableHead>Ship Roles</TableHead>
448:                   <TableHead>Operation</TableHead>
449:                   <TableHead>Operation Complete</TableHead>
450:                 </TableRow>
451:               </TableHeader>
452:               <TableBody>
453:                 {humanEnemyFleets.map((fleet) => {
454:                   const FactionIcon = fleet.factionTemplateName
455:                     ? FactionIcons[fleet.factionTemplateName as keyof typeof FactionIcons]
456:                     : null;
457:                   return (
458:                     <TableRow key={fleet.id} className={twMerge(fleet.deltaV === 0 ? "bg-gray-500/5" : "")}>
459:                       <TableCell>
460:                         <div className="flex items-center gap-1">
461:                           {FactionIcon && <FactionIcon className="p-1 rounded" />}
462:                           <span className="text-sm">{fleet.factionDisplayName ?? fleet.factionTemplateName ?? "Unknown"}</span>
463:                         </div>
464:                       </TableCell>
465:                       <TableCell className="font-medium">{fleet.displayName}</TableCell>
466:                       <TableCell>{fleet.planetName}</TableCell>
467:                       <TableCell>{fleet.targetOrbitName}</TableCell>
468:                       <TableCell>{fleet.arrivalTimeFormatted || "-"}</TableCell>
469:                       <TableCell className="text-right">
470:                         {fleet.daysToTarget !== null ? `${fleet.daysToTarget.toFixed(0)}` : "—"}
471:                       </TableCell>
472:                       <TableCell className="text-right">{fleet.totalMC.toFixed(0)}</TableCell>
473:                       <TableCell className="text-right">{fleet.marineCombatPower > 0 ? fleet.marineCombatPower : "—"}</TableCell>
474:                       <TableCell className="text-right">{(fleet.totalMass / 1000000).toFixed(0)} Mkg</TableCell>
475:                       <TableCell className="text-right">{(fleet.maxShipMass / 1000000).toFixed(0)} Mkg</TableCell>
476:                       <TableCell className="whitespace-normal">
477:                         {fleet.shipsByHullType.length > 0
478:                           ? fleet.shipsByHullType
479:                               .map((ship) => {
480:                                 const name = `${ship.count} ${ship.hullName}${ship.count > 1 ? "s" : ""}`;
481:                                 return ship.avgNoseArmor > 0 ? `${name} (${ship.avgNoseArmor})` : name;
482:                               })
483:                               .join(" + ")
484:                           : "-"}
485:                       </TableCell>
486:                       <TableCell className="whitespace-normal">
487:                         {fleet.shipsByRole.length > 0
488:                           ? fleet.shipsByRole.map((s) => `${s.count} ${s.role}${s.count > 1 ? "s" : ""}`).join(" + ")
489:                           : "-"}
490:                       </TableCell>
491:                       <TableCell>{fleet.operation || "-"}</TableCell>
492:                       <TableCell>
493:                         {fleet.operationComplete
494:                           ? `${fleet.operationComplete}${fleet.operationCompleteDays !== null ? ` (${fleet.operationCompleteDays.toFixed(0)}d)` : ""}`
495:                           : "-"}
496:                       </TableCell>
497:                     </TableRow>
498:                   );
499:                 })}
500:               </TableBody>
501:             </Table>
502:           )}
503:         </AccordionContent>
504:       </AccordionItem>
505: 
506:       {/* Player Fleets */}
507:       <AccordionItem value="player-fleets">
508:         <AccordionTrigger>Player Fleets ({playerFleets.length})</AccordionTrigger>
509:         <AccordionContent>
510:           {playerFleets.length === 0 ? (
511:             <div className="p-4 text-muted-foreground">No player fleets found.</div>
512:           ) : (
513:             <Table>
514:               <TableHeader>
515:                 <TableRow>
516:                   <TableHead>Fleet Name</TableHead>
517:                   <TableHead>Planet</TableHead>
518:                   <TableHead>Target Orbit</TableHead>
519:                   <TableHead>Arrival Date</TableHead>
520:                   <TableHead className="text-right">Days to Arrival</TableHead>
521:                   <TableHead className="text-right">MC Used</TableHead>
522:                   <TableHead className="text-right">Marine CP</TableHead>
523:                   <TableHead className="text-right">Total Mass</TableHead>
524:                   <TableHead className="text-right">Max Ship Mass</TableHead>
525:                   <TableHead>Ship Hulls</TableHead>
526:                   <TableHead>Ship Classes</TableHead>
527:                 </TableRow>
528:               </TableHeader>
529:               <TableBody>
530:                 {playerFleets.map((fleet) => (
531:                   <TableRow key={fleet.id}>
532:                     <TableCell className="font-medium">{fleet.displayName}</TableCell>
533:                     <TableCell>{fleet.planetName}</TableCell>
534:                     <TableCell>{fleet.targetOrbitName}</TableCell>
535:                     <TableCell>{fleet.arrivalTimeFormatted || "-"}</TableCell>
536:                     <TableCell className="text-right">
537:                       {fleet.daysToTarget !== null ? `${fleet.daysToTarget.toFixed(0)}` : "—"}
538:                     </TableCell>
539:                     <TableCell className="text-right">{fleet.totalMC.toFixed(0)}</TableCell>
540:                     <TableCell className="text-right">{fleet.marineCombatPower > 0 ? fleet.marineCombatPower : "—"}</TableCell>
541:                     <TableCell className="text-right">{(fleet.totalMass / 1000000).toFixed(0)} Mkg</TableCell>
542:                     <TableCell className="text-right">{(fleet.maxShipMass / 1000000).toFixed(0)} Mkg</TableCell>
543:                     <TableCell className="whitespace-normal">
544:                       {fleet.shipsByHullType.length > 0
545:                         ? fleet.shipsByHullType.map((ship, i) => (
546:                             <Fragment key={ship.hullName}>
547:                               {i > 0 && <br />}
548:                               {ship.count} {ship.hullName}
549:                               {ship.count > 1 ? "s" : ""}
550:                             </Fragment>
551:                           ))
552:                         : "-"}
553:                     </TableCell>
554:                     <TableCell className="whitespace-normal">
555:                       {fleet.shipsByClass.length > 0
556:                         ? fleet.shipsByClass.map((cls, i) => (
557:                             <Fragment key={cls.className}>
558:                               {i > 0 && <br />}
559:                               {cls.count}× {cls.className}{cls.noseArmor > 0 ? ` (${cls.noseArmor})` : ""}
560:                             </Fragment>
561:                           ))
562:                         : "-"}
563:                     </TableCell>
564:                   </TableRow>
565:                 ))}
566:               </TableBody>
567:             </Table>
568:           )}
569:         </AccordionContent>
570:       </AccordionItem>
571: 
572:       {/* Ships Under Construction */}
573:       <AccordionItem value="ships-under-construction">
574:         <AccordionTrigger>Ships Under Construction ({shipsUnderConstruction.length})</AccordionTrigger>
575:         <AccordionContent>
576:           {shipsUnderConstruction.length === 0 ? (
577:             <div className="p-4 text-muted-foreground">No ships under construction.</div>
578:           ) : (
579:             <Table>
580:               <TableHeader>
581:                 <TableRow>
582:                   <TableHead>Planet</TableHead>
583:                   <TableHead>Design</TableHead>
584:                   <TableHead>Hull</TableHead>
585:                   <TableHead className="text-right">Nose Armor</TableHead>
586:                   <TableHead className="text-right">Count</TableHead>
587:                   <TableHead>Days to Complete</TableHead>
588:                 </TableRow>
589:               </TableHeader>
590:               <TableBody>
591:                 {(() => {
592:                   const byPlanetDesign = shipsUnderConstruction.reduce((acc, ship) => {
593:                     const key = `${ship.planetName}||${ship.designName}`;
594:                     if (!acc.has(key))
595:                       acc.set(key, {
596:                         planetName: ship.planetName,
597:                         designName: ship.designName,
598:                         hullName: ship.hullName,
599:                         noseArmor: ship.noseArmor,
600:                         entries: [] as { days: number; status: "building" | "queued" | "waiting" }[],
601:                       });
602:                     acc.get(key)!.entries.push({ days: ship.daysToCompletion, status: ship.status });
603:                     return acc;
604:                   }, new Map<string, { planetName: string; designName: string; hullName: string; noseArmor: number; entries: { days: number; status: "building" | "queued" | "waiting" }[] }>());
605: 
606:                   return [...byPlanetDesign.values()]
607:                     .toSorted((a, b) => a.planetName.localeCompare(b.planetName) || a.designName.localeCompare(b.designName))
608:                     .map(({ planetName, designName, hullName, noseArmor, entries }) => (
609:                       <TableRow key={`${planetName}||${designName}`}>
610:                         <TableCell>{planetName}</TableCell>
611:                         <TableCell className="font-medium">{designName}</TableCell>
612:                         <TableCell>{hullName}</TableCell>
613:                         <TableCell className="text-right">{noseArmor > 0 ? noseArmor : "-"}</TableCell>
614:                         <TableCell className="text-right">{entries.length}</TableCell>
615:                         <TableCell>
616:                           {entries
617:                             .toSorted((a, b) => a.days - b.days)
618:                             .map((e, i) => (
619:                               <Fragment key={i}>
620:                                 {i > 0 && ", "}
621:                                 {e.status === "waiting" ? (
622:                                   <span title="Waiting for materials">⚠️{e.days.toFixed(0)}</span>
623:                                 ) : e.status === "queued" ? (
624:                                   <span className="text-muted-foreground" title="Queued">({e.days.toFixed(0)})</span>
625:                                 ) : (
626:                                   e.days.toFixed(0)
627:                                 )}
628:                               </Fragment>
629:                             ))}
630:                         </TableCell>
631:                       </TableRow>
632:                     ));
633:                 })()}
634:               </TableBody>
635:             </Table>
636:           )}
637:         </AccordionContent>
638:       </AccordionItem>
639:     </SmartAccordion>
640:   );
641: }

(End of file - total 641 lines)
</content>
```

---

## Assistant (Build · Gemma 4-26B-A4B (local) · 209.6s)

_Thinking:_

Okay, I'll start by creating a new file `src/app/game/current/fleets-component.tsx` and moving `FleetsComponent` there. This will clean up `fleets.tsx` and make it easier to work with.

Wait, I'll also need to import `NavItem` in `fleets.tsx`.

Actually, I'll do this:
1.  Create `src/app/game/current/types.ts` (Done).
2.  Create `src/app/game/current/fleets-component.tsx` by copying the content of `fleets.tsx` from `FleetsComponent` onwards.
3.  Update `src/app/game/current/fleets.tsx` to import `FleetsComponent` and return `NavItem`.

Let's start with step 2. I'll read the full content of `fleets.tsx` again to be sure. I have it.

Wait, I'll just use `Write` to create `fleets-component.tsx` with the content of `FleetsComponent`.

Wait, I need to make sure I include all the necessary imports in `fleets-component.tsx`.

The imports for `FleetsComponent` are:
```tsx
import { Analysis } from "@/lib/analysis";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SmartAccordion } from "@/components/ui/smart-accordion";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { diffDateTime, sortByDateTime, toDays } from "@/lib/utils";
import { Fragment } from "react/jsx-runtime";
import { FactionIcons, MissionControl } from "@/components/icons";
import { twMerge } from "tailwind-merge";
```

Wait, `Fragment` from `react/jsx-runtime` is usually imported as `import { Fragment } from "react"`.

Let's do this.


**Tool: write**

**Input:**
```json
{
  "content": "import { Analysis } from \"@/lib/analysis\";\nimport { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from \"@/components/ui/table\";\nimport { Collapsible, CollapsibleContent, CollapsibleTrigger } from \"@/components/ui/collapsible\";\nimport { AccordionContent, AccordionItem, AccordionTrigger } from \"@/components/ui/accordion\";\nimport { SmartAccordion } from \"@/components/ui/smart-accordion\";\nimport { Button } from \"@/components/ui/button\";\nimport { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from \"@/components/ui/tooltip\";\nimport { diffDateTime, sortByDateTime, toDays } from \"@/lib/utils\";\nimport { Fragment } from \"react\";\nimport { FactionIcons, MissionControl } from \"@/components/icons\";\nimport { twMerge } from \"tailwind-merge\";\n\nexport function FleetsComponent({ analysis }: { analysis: Analysis }) {\n  const alienFleets = analysis.alienFleetsToPlayerOrbits;\n  const humanEnemyFleets = analysis.humanEnemyFleetsToPlayerOrbits;\n  const playerFleets = analysis.playerFleets;\n  const shipsUnderConstruction = analysis.playerShipsUnderConstruction;\n\n  return (\n    <SmartAccordion\n      type=\"multiple\"\n      storageKey=\"fleetsSections\"\n      defaultValue={[\"alien-fleets\", \"human-enemy-fleets\", \"player-fleets\", \"ships-under-construction\"]}\n    >\n      {/* Alien Fleets */}\n      <AccordionItem value=\"alien-fleets\">\n        <AccordionTrigger>Alien Fleets ({alienFleets.length})</AccordionTrigger>\n        <AccordionContent>\n          {alienFleets.length === 0 ? (\n            <div className=\"p-4 text-muted-foreground\">No alien fleets detected heading to player orbits.</div>\n          ) : (\n            <div className=\"space-y-2\">\n              <p>Tracking planets: {analysis.playerInterestedPlanets.map((p) => p.displayName).join(\", \")}</p>\n              <Table>\n                <TableHeader>\n                  <TableRow>\n                    <TableHead>Fleet Name</TableHead>\n                    <TableHead>Planet</TableHead>\n                    <TableHead>Target Orbit</TableHead>\n                    <TableHead>Arrival Date</TableHead>\n                    <TableHead className=\"text-right\">Days to Arrival</TableHead>\n                    <TableHead className=\"text-right\">MC Used</TableHead>\n                    <TableHead className=\"text-right\">Marine CP</TableHead>\n                    <TableHead className=\"text-right\">Total Mass</TableHead>\n                    <TableHead className=\"text-right\">Max Ship Mass</TableHead>\n                    <TableHead>Ships Hulls</TableHead>\n                    <TableHead>Ships Roles</TableHead>\n                    <TableHead>Operation</TableHead>\n                    <TableHead>Operation Complete</TableHead>\n                  </TableRow>\n                </TableHeader>\n                <TableBody>\n                  {alienFleets.map((fleet) => (\n                    <TableRow key={fleet.id} className={twMerge(fleet.deltaV === 0 ? \"bg-gray-500/5\" : \"\")}>\n                      <TableCell className=\"font-medium\">{fleet.displayName}</TableCell>\n                      <TableCell>{fleet.planetName}</TableCell>\n                      <TableCell>{fleet.targetOrbitName}</TableCell>\n                      <TableCell>{fleet.arrivalTimeFormatted || \"-\"}</TableCell>\n                      <TableCell className=\"text-right\">\n                        {fleet.daysToTarget !== null ? `${fleet.daysToTarget.toFixed(0)}` : \"—\"}\n                      </TableCell>\n                      <TableCell className=\"text-right\">{fleet.totalMC.toFixed(0)}</TableCell>\n                      <TableCell className=\"text-right\">{fleet.marineCombatPower > 0 ? fleet.marineCombatPower : \"—\"}</TableCell>\n                      <TableCell className=\"text-right\">{(fleet.totalMass / 1000000).toFixed(0)} Mkg</TableCell>\n                      <TableCell className=\"text-right\">{(fleet.maxShipMass / 1000000).toFixed(0)} Mkg</TableCell>\n                      <TableCell className=\"whitespace-normal\">\n                        {fleet.shipsByHullType.length > 0\n                          ? fleet.shipsByHullType\n                              .map((ship) => {\n                                const name = `${ship.count} ${ship.hullName.replace(\"Alien \", \"\")}${ship.count > 1 ? \"s\" : \"\"}`;\n                                return ship.avgNoseArmor > 0 ? `${name} (${ship.avgNoseArmor})` : name;\n                              })\n                              .join(\" + \")\n                          : \"-\"}\n                      </TableCell>\n                      <TableCell className=\"whitespace-normal\">\n                        {fleet.shipsByRole.length > 0\n                          ? fleet.shipsByRole\n                              .map((ship) => `${ship.count} ${ship.role}${ship.count > 1 ? \"s\" : \"\"}`)\n                              .join(\" + \")\n                          : \"-\"}\n                      </TableCell>\n                      <TableCell>{fleet.operation || \"-\"}</TableCell>\n                      <TableCell>\n                        {fleet.operationComplete\n                          ? `${fleet.operationComplete}${fleet.operationCompleteDays !== null ? ` (${fleet.operationCompleteDays.toFixed(0)}d)` : \"\"}`\n                          : \"-\"}\n                      </TableCell>\n                    </TableRow>\n                  ))}\n                </TableBody>\n              </Table>\n\n              {/* Planetary Defense Summary */}\n              <div className=\"mt-8\">\n                <h2 className=\"text-2xl font-bold mb-4\">Planetary Defense Summary</h2>\n                <Table>\n                  <TableHeader>\n                    <TableRow>\n                      <TableHead>Planet</TableHead>\n                      <TableHead className=\"text-right\">Days to Arrival</TableHead>\n                      <TableHead className=\"text-right\">Alien Fleet MC</TableHead>\n                      <TableHead className=\"text-right\">Player Fleet MC</TableHead>\n                      <TableHead>Habs (Active / Potential Combat)</TableHead>\n                    </TableRow>\n                  </TableHeader>\n                  <TableBody>\n                    {(() => {\n                      const planetsWithFleets = new Set(\n                        analysis.alienFleetsToPlayerOrbits.map((f) => f.planetName || \"Unknown\"),\n                      );\n                      const defenseData = Array.from(planetsWithFleets)\n                        .map((planet) => {\n                          const fleetsAtPlanet = analysis.alienFleetsToPlayerOrbits.filter(\n                            (f) => f.planetName === planet,\n                          );\n                          const totalAlienMC = fleetsAtPlanet.reduce((sum, f) => sum + (f.totalMC || 0), 0);\n                          const incomingFleets = fleetsAtPlanet.filter(\n                            (f) => f.daysToTarget !== null && f.daysToTarget > 0,\n                          );\n                          const daysToArrival =\n                            incomingFleets.length > 0\n                              ? Math.min(...incomingFleets.map((f) => f.daysToTarget!))\n                              : null;\n                          const playerFleetsAtPlanet = analysis.playerFleets.filter(\n                            (f) => f.planetName === planet,\n                          );\n                          const relevantPlayerFleets = playerFleetsAtPlanet.filter((f) => {\n                            if (f.daysToTarget === null || f.daysToTarget <= 0) return true;\n                            if (daysToArrival === null) return false;\n                            return f.daysToTarget < daysToArrival;\n                          });\n                          const totalPlayerMC = relevantPlayerFleets.reduce((sum, f) => sum + (f.totalMC || 0), 0);\n                          const habsAtPlanet = analysis.playerHabs.filter((h) => h.planetName === planet);\n                          return { planet, totalAlienMC, totalPlayerMC, daysToArrival, habs: habsAtPlanet };\n                        })\n                        .filter((d) => d.habs.length > 0)\n                        .toSorted((a, b) => {\n                          if (a.daysToArrival === null && b.daysToArrival === null) return 0;\n                          if (a.daysToArrival === null) return 1;\n                          if (b.daysToArrival === null) return -1;\n                          return a.daysToArrival - b.daysToArrival;\n                        });\n\n                      return defenseData.map(({ planet, totalAlienMC, totalPlayerMC, daysToArrival, habs }) => (\n                        <TableRow key={planet}>\n                          <TableCell className=\"font-medium\">{planet}</TableCell>\n                          <TableCell className=\"text-right\">\n                            {daysToArrival !== null ? daysToArrival.toFixed(0) : \"—\"}\n                          </TableCell>\n                          <TableCell className=\"text-right\">{totalAlienMC.toFixed(0)}</TableCell>\n                          <TableCell className=\"text-right\">{totalPlayerMC.toFixed(0)}</TableCell>\n                          <TableCell>\n                            <TooltipProvider>\n                              <div className=\"flex gap-2 flex-wrap\">\n                                {habs\n                                  .toSorted((a, b) => {\n                                    if (a.habType === \"Station\" && b.habType !== \"Station\") return -1;\n                                    if (a.habType !== \"Station\" && b.habType === \"Station\") return 1;\n                                    return 0;\n                                  })\n                                  .map((hab) => {\n                                    const activeCombat = hab.activeEffects.combatScore || 0;\n                                    const potentialCombat = hab.potentialEffects.combatScore || 0;\n                                    const combatDisplay =\n                                      activeCombat === potentialCombat\n                                        ? activeCombat.toFixed(0)\n                                        : `${activeCombat.toFixed(0)} / ${potentialCombat.toFixed(0)}`;\n                                    const bgColor = hab.habType === \"Station\" ? \"bg-yellow-100\" : \"bg-green-100\";\n                                    return (\n                                      <Tooltip key={hab.id}>\n                                        <TooltipTrigger asChild>\n                                          <span className={`cursor-help ${bgColor} px-1.5 py-0.5 rounded`}>\n                                            {combatDisplay}\n                                          </span >\n                                        </TooltipTrigger>\n                                        <TooltipContent>\n                                          <div>{hab.displayName}</div>\n                                        </TooltipContent>\n                                      </Tooltip>\n                                    );\n                                  })}\n                                </div>\n                            </TooltipProvider>\n                          </TableCell>\n                        </TableRow>\n                      ));\n                    })()}\n                  </TableBody>\n                </Table>\n              </div >\n\n              <Collapsible>\n                <CollapsibleTrigger asChild>\n                  <Button>Debug Data</Button>\n                </CollapsibleTrigger>\n                <CollapsibleContent>\n                  <pre>{JSON.stringify(alienFleets, null, 2)}</pre>\n                </CollapsibleContent>\n              </Collapsible>\n            </div >\n          )}\n        </AccordionContent>\n      </AccordionItem>\n\n      {/* Other Human Factions Fleets */}\n      <AccordionItem value=\"human-enemy-fleets\">\n        <AccordionTrigger>Other Human Factions ({humanEnemyFleets.length})</AccordionTrigger>\n        <AccordionContent>\n          {humanEnemyFleets.length === 0 ? (\n            <div className=\"p-4 text-muted-foreground\">No other human faction fleets detected heading to player orbits.</div >\n          ) : (\n            <Table>\n              <TableHeader>\n                <TableRow>\n                  <TableHead>Faction</TableHead>\n                  <TableHead>Fleet Name</TableHead>\n                  <TableHead>Planet</TableHead>\n                  <TableHead>Target Orbit</TableHead>\n                  <TableHead>Arrival Date</TableHead>\n                  <TableHead className=\"text-right\">Days to Arrival</TableHead>\n                  <TableHead className=\"text-right\">MC Used</TableHead>\n                  <TableHead className=\"text-right\">Marine CP</TableHead>\n                  <TableHead className=\"text-right\">Total Mass</TableHead>\n                  <TableHead className=\"text-right\">Max Ship Mass</TableHead>\n                  <TableHead>Ship Hulls</TableHead>\n                  <TableHead>Ship Roles</TableHead>\n                  <TableHead>Operation</TableHead>\n                  <TableHead>Operation Complete</TableHead>\n                </TableRow>\n              </TableHeader>\n              <TableBody>\n                {humanEnemyFleets.map((fleet) => {\n                  const FactionIcon = fleet.factionTemplateName\n                    ? FactionIcons[fleet.factionTemplateName as keyof typeof FactionIcons]\n                    : null;\n                  return (\n                    <TableRow key={fleet.id} className={twMerge(fleet.deltaV === 0 ? \"bg-gray-500/5\" : \"\")}>\n                      <TableCell>\n                        <div className=\"flex items-center gap-1\">\n                          {FactionIcon && <FactionIcon className=\"p-1 rounded\" />}\n                          <span className=\"text-sm\">{fleet.factionDisplayName ?? fleet.factionTemplateName ?? \"Unknown\"}</span >\n                        </div >\n                      </TableCell>\n                      <TableCell className=\"font-medium\">{fleet.displayName}</TableCell>\n                      <TableCell>{fleet.planetName}</TableCell>\n                      <TableCell>{fleet.targetOrbitName}</TableCell>\n                      <TableCell>{fleet.arrivalTimeFormatted || \"-\"}</TableCell>\n                      <TableCell className=\"text-right\">\n                        {fleet.daysToTarget !== null ? `${fleet.daysToTarget.toFixed(0)}` : \"—\"}\n                      </TableCell>\n                      <TableCell className=\"text-right\">{fleet.totalMC.toFixed(0)}</TableCell>\n                      <TableCell className=\"text-right\">{fleet.marineCombatPower > 0 ? fleet.marineCombatPower : \"—\"}</TableCell>\n                      <TableCell className=\"text-right\">{(fleet.totalMass / 1000000).toFixed(0)} Mkg</TableCell>\n                      <TableCell className=\"text-right\">{(fleet.maxShipMass / 1000000).toFixed(0)} Mkg</TableCell>\n                      <TableCell className=\"whitespace-normal\">\n                        {fleet.shipsByHullType.length > 0\n                          ? fleet.shipsByHullType\n                              .map((ship) => {\n                                const name = `${ship.count} ${ship.hullName}${ship.count > 1 ? \"s\" : \"\"}`;\n                                return ship.avgNoseArmor > 0 ? `${name} (${ship.avgNoseArmor})` : name;\n                              })\n                              .join(\" + \")\n                          : \"-\"}\n                      </TableCell>\n                      <TableCell className=\"whitespace-normal\">\n                        {fleet.shipsByRole.length > 0\n                          ? fleet.shipsByRole.map((s) => `${s.count} ${s.role}${s.count > 1 ? \"s\" : \"\"}`).join(\" + \")\n                          : \"-\"}\n                      </TableCell>\n                      <TableCell>{fleet.operation || \"-\"}</TableCell>\n                      <TableCell>\n                        {fleet.operationComplete\n                          ? `${fleet.operationComplete}${fleet.operationCompleteDays !== null ? ` (${fleet.operationCompleteDays.toFixed(0)}d)` : \"\"}`\n                          : \"-\"}\n                      </TableCell>\n                    </TableRow>\n                  );\n                })}\n              </TableBody>\n            </Table>\n          )}\n        </AccordionContent>\n      </AccordionItem>\n\n      {/* Player Fleets */}\n      <AccordionItem value=\"player-fleets\">\n        <AccordionTrigger>Player Fleets ({playerFleets.length})</AccordionTrigger>\n        <AccordionContent>\n          {playerFleets.length === 0 ? (\n            <div className=\"p-4 text-muted-foreground\">No player fleets found.</div >\n          ) : (\n            <Table>\n              <TableHeader>\n                <TableRow>\n                  <TableHead>Fleet Name</TableHead>\n                  <TableHead>Planet</TableHead>\n                  <TableHead>Target Orbit</TableHead>\n                  <TableHead>Arrival Date</TableHead>\n                  <TableHead className=\"text-right\">Days to Arrival</TableHead>\n                  <TableHead className=\"text-right\">MC Used</TableHead>\n                  <TableHead className=\"text-right\">Marine CP</TableHead>\n                  <TableHead className=\"text-right\">Total Mass</TableHead>\n                  <TableHead className=\"text-right\">Max Ship Mass</TableHead>\n                  <TableHead>Ship Hulls</TableHead>\n                  <TableHead>Ship Classes</TableHead>\n                </TableRow>\n              </TableHeader>\n              <TableBody>\n                {playerFleets.map((fleet) => (\n                  <TableRow key={fleet.id}>\n                    <TableCell className=\"font-medium\">{fleet.displayName}</TableCell>\n                    <TableCell>{fleet.planetName}</TableCell>\n                    <TableCell>{fleet.targetOrbitName}</TableCell>\n                    <TableCell>{fleet.arrivalTimeFormatted || \"-\"}</TableCell>\n                    <TableCell className=\"text-right\">\n                      {fleet.daysToTarget !== null ? `${fleet.daysToTarget.toFixed(0)}` : \"—\"}\n                    </TableCell>\n                    <TableCell className=\"text-right\">{fleet.totalMC.toFixed(0)}</TableCell>\n                    <TableCell className=\"text-right\">{fleet.marineCombatPower > 0 ? fleet.marineCombatPower : \"—\"}</TableCell>\n                    <TableCell className=\"text-right\">{(fleet.totalMass / 1000000).toFixed(0)} Mkg</TableCell>\n                    <TableCell className=\"text-right\">{(fleet.maxShipMass / 1000000).toFixed(0)} Mkg</TableCell>\n                    <TableCell className=\"whitespace-normal\">\n                      {fleet.shipsByHullType.length > 0\n                        ? fleet.shipsByHullType.map((ship, i) => (\n                            <Fragment key={ship.hullName}>\n                              {i > 0 && <br />}\n                              {ship.count} {ship.hullName}\n                              {ship.count > 1 ? \"s\" : \"\"}\n                            </Fragment>\n                          ))\n                        : \"-\"}\n                    </TableCell>\n                    <TableCell className=\"whitespace-normal\">\n                      {fleet.shipsByClass.length > 0\n                        ? fleet.shipsByClass.map((cls, i) => (\n                            <Fragment key={cls.className}>\n                              {i > 0 && <br />}\n                              {cls.count}× {cls.className}{cls.noseArmor > 0 ? ` (${cls.noseArmor})` : \"\"}\n                            </Fragment>\n                          ))\n                        : \"-\"}\n                    </TableCell>\n                  </TableRow>\n                ))}\n              </TableBody>\n            </Table>\n          )}\n        </AccordionContent>\n      </AccordionItem\n\n      {/* Ships Under Construction */}\n      <AccordionItem value=\"ships-under-construction\">\n        <AccordionTrigger>Ships Under Construction ({shipsUnderConstruction.length})</AccordionTrigger>\n        <AccordionContent>\n          {shipsUnderConstruction.length === 0 ? (\n            <div className=\"p-4 text-muted-foreground\">No ships under construction.</div >\n          ) : (\n            <Table>\n              <TableHeader>\n                <TableRow>\n                  <TableHead>Planet</TableHead>\n                  <TableHead>Design</TableHead>\n                  <TableHead>Hull</TableHead>\n                  <TableHead className=\"text-right\">Nose Armor</TableHead>\n                  <TableHead className=\"text-right\">Count</TableHead>\n                  <TableHead>Days to Complete</TableHead>\n                </TableRow>\n              </TableHeader>\n              <TableBody>\n                {(() => {\n                  const byPlanetDesign = shipsUnderConstruction.reduce((acc, ship) => {\n                    const key = `${ship.planetName}||${ship.designName}`;\n                    if (!acc.has(key))\n                      acc.set(key, {\n                        planetName: ship.planetName,\n                        designName: ship.designName,\n                        hullName: ship.hullName,\n                        noseArmor: ship.noseArmor,\n                        entries: [] as { days: number; status: \"building\" | \"queued\" | \"waiting\" }[],\n                      });\n                    acc.get(key)!.entries.push({ days: ship.daysToCompletion, status: ship.status });\n                    return acc;\n                  }, new Map<string, { planetName: string; designName: string; hullName: string; noseArmor: number; entries: { days: number; status: \"building\" | \"queued\" | \"waiting\" }[] }>());\n\n                  return [...byPlanetDesign.values()]\n                    .toSorted((a, b) => a.planetName.localeCompare(b.planetName) || a.designName.localeCompare(b.designName))\n                    .map(({ planetName, designName, hullName, noseArmor, entries }) => (\n                      <TableRow key={`${planetName}||${designName}`}>\n                        <TableCell>{planetName}</TableCell>\n                        <TableCell className=\"font-medium\">{designName}</TableCell>\n                        <TableCell>{hullName}</TableCell>\n                        <TableCell className=\"text-right\">{noseArmor > 0 ? noseArmor : \"-\"}</TableCell>\n                        <TableCell className=\"text-right\">{entries.length}</TableCell>\n                        <TableCell>\n                          {entries\n                            .toSorted((a, b) => a.days - b.days)\n                            .map((e, i) => (\n                              <Fragment key={i}>\n                                {i > 0 && \", \"}\n                                {e.status === \"waiting\" ? (\n                                  <span title=\"Waiting for materials\">⚠️{e.days.toFixed(0)}</span >\n                                ) : e.status === \"queued\" ? (\n                                  <span className=\"text-muted-foreground\" title=\"Queued\">({e.days.toFixed(0)})</span >\n                                ) : (\n                                  e.days.toFixed(0)\n                                )}\n                              </Fragment>\n                            ))}\n                        </TableCell>\n                      </TableRow>\n                    ));\n                })()}\n              </TableBody>\n            </Table>\n          )}\n        </AccordionContent>\n      </AccordionItem>\n    </SmartAccordion>\n  );\n}\n",
  "filePath": "terra-invicta-assistant\\src\\app\\game\\current\\fleets-component.tsx"
}
```

**Output:**
```
Wrote file successfully.
```

---

## Assistant (Build · Gemma 4-26B-A4B (local) · 68.8s)

_Thinking:_

Now that `FleetsComponent` is in its own file, I can update `fleets.tsx`.

Wait, I also need to make sure `NavItem` is imported in `fleets.tsx`.

Let's do `fleets.tsx` first.


**Tool: edit**

**Input:**
```json
{
  "filePath": "terra-invicta-assistant\\src\\app\\game\\current\\fleets.tsx",
  "newString": "import { Analysis } from \"@/lib/analysis\";\nimport { NavItem } from \"./types\";\nimport { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from \"@/components/ui/table\";\nimport { Collapsible, CollapsibleContent, CollapsibleTrigger } from \"@/components/ui/collapsible\";\nimport { AccordionContent, AccordionItem, AccordionTrigger } from \"@/components/ui/accordion\";\nimport { SmartAccordion } from \"@/components/ui/smart-accordion\";\nimport { Button } from \"@/components/ui/button\";\nimport { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from \"@/components/ui/tooltip\";\nimport { diffDateTime, sortByDateTime, toDays } from \"@/lib/utils\";\nimport { Fragment } from \"react\";\nimport { FactionIcons, MissionControl } from \"@/components/icons\";\nimport { twMerge } from \"tailwind-merge\";\nimport { FleetsComponent } from \"./fleets-component\";\n\nexport function getFleetsUi(analysis: Analysis): NavItem {\n  const byTarget = analysis.alienFleetsToPlayerOrbits.reduce((acc, fleet) => {\n    const key = fleet.planetName || \"Unknown Orbit\";\n    if (!acc.has(key)) {\n      acc.set(key, []);\n    }\n    acc.get(key)!.push(fleet);\n    return acc;\n  }, new Map<string, typeof analysis.alienFleetsToPlayerOrbits>());\n  const label = [\n    ...byTarget.entries().map(([target, rawFleets]) => {\n      const fleets = rawFleets.filter((f) => f.deltaV > 0 && (f.daysToTarget || 0) > 0);\n      const surv = rawFleets.filter((f) => f.operation === \"AlienEarthSurveillanceOperation\" && !f.arrivalTime);\n      const survInfo = surv.length ? (\n        <>\n          <span className=\"text-white bg-destructive rounded py-2 px-3 font-bold\">\n            {surv\n              .map((f) => f.operationCompleteDays || 0)\n              .reduce((a, b) => Math.min(a, b), 9999999999)\n              .toFixed(0)}\n            d Surveillance\n          </span >{\" \"}\n        </>\n      ) : null;\n      if (fleets.length === 0) {\n        if (survInfo) {\n          return (\n            <span\n              key={target}\n            >\n              {target}: {survInfo}\n            </span >\n          );\n        }\n        return null;\n      }\n      // now that we know the arrival of the first one, find all arriving within 14 days to summarize MC\n      const firstFleet = sortByDateTime(fleets, (f) => f.arrivalTime || analysis.gameCurrentDateTime)[0];\n      const firstFleets = fleets.filter(\n        (f) =>\n          toDays(\n            diffDateTime(\n              f.arrivalTime || analysis.gameCurrentDateTime,\n              firstFleet.arrivalTime || analysis.gameCurrentDateTime,\n            ),\n          ) < 14,\n      );\n      const firstMc = firstFleets.reduce((sum, f) => sum + f.totalMC, 0);\n\n      // tier 2 hab (60d), fusion power, and defense module (90d) take a total of 150 days\n      // tier 3 hab (90d), fusion power, and defense module (180d) take a total of 270 days.\n      // T2 hab should be able to stop a bombard from a 10MC fleet, and T3 is the best we can do anyway, plus the turn time of 30 days should make for enough warning\n      // before that, we'll still have the nameplate warning and can look at details in the fleets tab\n      const warningNeeded = (firstMc > 10 ? 270 : 150) + 30;\n      const daysToTarget = firstFleet.daysToTarget || 0;\n      const farFuture = daysToTarget > warningNeeded;\n      const className = twMerge(\n        farFuture && \"px-1 -mx-1 py-0.5 -my-0.5 rounded bg-green-500\",\n        farFuture &&\n          (daysToTarget < warningNeeded + 50\n            ? \"bg-red-200\"\n            : daysToTarget < warningNeeded + 100\n              ? \"bg-yellow-200\"\n              : \"bg-green-200\"),\n      );\n      return (\n        <span\n          key={target}\n          className={className}\n          title={`${fleets.length} fleet(s) targeting ${target}, arriving in ${daysToTarget.toFixed(\n            0,\n          )} days, using ${firstMc.toFixed(0)} MC`}\n        >\n          {target}\n          {fleets.length > 1 ? `(${fleets.length})` : \"\"}\n          {farFuture ? (\n            \"\"\n          ) : (\n            <>\n              : {daysToTarget.toFixed(0)}d <MissionControl />\n              {firstMc.toFixed(0)}\n            </>\n          )}\n          {survInfo && <>,{survInfo}</>}\n        </span >\n      );\n    }),\n  ].filter((i) => !!i);\n  return {\n    key: \"fleets\",\n    label: (\n      <>\n        Fleets\n        {label.length > 0 ? (\n          <>\n            {\" - \"}\n            {label.map((i, ix) => (\n              <Fragment key={ix}>\n                {i}\n                {ix < label.length - 1 ? \" | \" : \"\"}\n              </Fragment>\n            ))}\n          </>\n        ) : (\n          \"\"\n        )}\n      </>\n    ),\n    content: <FleetsComponent analysis={analysis} />,\n  };\n}\n",
  "oldString": "import { Analysis } from \"@/lib/analysis\";\nimport { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from \"@/components/ui/table\";\nimport { Collapsible, CollapsibleContent, CollapsibleTrigger } from \"@/components/ui/collapsible\";\nimport { AccordionContent, AccordionItem, AccordionTrigger } from \"@/components/ui/accordion\";\nimport { SmartAccordion } from \"@/components/ui/smart-accordion\";\nimport { Button } from \"@/components/ui/button\";\nimport { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from \"@/components/ui/tooltip\";\nimport { diffDateTime, sortByDateTime, toDays } from \"@/lib/utils\";\nimport { Fragment } from \"react/jsx-runtime\";\nimport { FactionIcons, MissionControl } from \"@/components/icons\";\nimport { twMerge } from \"tailwind-merge\";\nimport { FleetsComponent } from \"./fleets-component\"; \n"
}
```

**Error:**
```
Could not find oldString in the file. It must match exactly, including whitespace, indentation, and line endings.
```

---

## Assistant (Build · Gemma 4-26B-A4B (local) · 9.3s)

_Thinking:_

I'll use `Read` to get the exact content of `fleets.tsx`.



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
13: export function getFleetsUi(analysis: Analysis): NavItem {
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
34:           </span >{" "}
35:         </>
36:       ) : null;
37:       if (fleets.length === 0) {
38:         if (survInfo) {
39:           return (
40:             <span
41:               key={target}
42:             >
43:               {target}: {survInfo}
44:             </span >
45:           );
46:         }
47:         return null;
48:       }
49:       // now that we know the arrival of the first one, find all arriving within 14 days to summarize MC
50:       const firstFleet = sortByDateTime(fleets, (f) => f.arrivalTime || analysis.gameCurrentDateTime)[0];
51:       const firstFleets = fleets.filter(
52:         (f) =>
53:           toDays(
54:             diffDateTime(
55:               f.arrivalTime || analysis.gameCurrentDateTime,
56:               firstFleet.arrivalTime || analysis.gameCurrentDateTime,
57:             ),
58:           ) < 14,
59:       );
60:       const firstMc = firstFleets.reduce((sum, f) => sum + f.totalMC, 0);
61: 
62:       // tier 2 hab (60d), fusion power, and defense module (90d) take a total of 150 days
63:       // tier 3 hab (90d), fusion power, and defense module (180d) take a total of 270 days.
64:       // T2 hab should be able to stop a bombard from a 10MC fleet, and T3 is the best we can do anyway, plus the turn time of 30 days should make for enough warning
65:       // before that, we'll still have the nameplate warning and can look at details in the fleets tab
66:       const warningNeeded = (firstMc > 10 ? 270 : 150) + 30;
67:       const daysToTarget = firstFleet.daysToTarget || 0;
68:       const farFuture = daysToTarget > warningNeeded;
69:       const className = twMerge(
70:         farFuture && "px-1 -mx-1 py-0.5 -my-0.5 rounded bg-green-500",
71:         farFuture &&
72:           (daysToTarget < warningNeeded + 50
73:             ? "bg-red-200"
74:             : daysToTarget < warningNeeded + 100
75:               ? "bg-yellow-200"
76:               : "bg-green-200"),
77:       );
78:       return (
79:         <span
80:           key={target}
81:           className={className}
82:           title={`${fleets.length} fleet(s) targeting ${target}, arriving in ${daysToTarget.toFixed(
83:             0,
84:           )} days, using ${firstMc.toFixed(0)} MC`}
85:         >
86:           {target}
87:           {fleets.length > 1 ? `(${fleets.length})` : ""}
88:           {farFuture ? (
89:             ""
90:           ) : (
91:             <>
92:               : {daysToTarget.toFixed(0)}d <MissionControl />
93:               {firstMc.toFixed(0)}
94:             </>
95:           )}
96:           {survInfo && <>,{survInfo}</>}
97:         </span >
98:       );
99:     }),
100:   ].filter((i) => !!i);
101:   return {
102:     key: "fleets",
103:     label: (
104:       <>
105:         Fleets
106:         {label.length > 0 ? (
107:           <>
108:             {" - "}
109:             {label.map((i, ix) => (
110:               <Fragment key={ix}>
111:                 {i}
112:                 {ix < label.length - 1 ? " | " : ""}
113:               </Fragment>
114:             ))}
115:           </>
116:         ) : (
117:           ""
118:         )}
119:       </>
120:     ),
121:     content: <FleetsComponent analysis={analysis} />,
122:   };
123: }
124: 
125:     acc.get(key)!.push(fleet);
126:     return acc;
127:   }, new Map<string, typeof analysis.alienFleetsToPlayerOrbits>());
128:   const label = [
129:     ...byTarget.entries().map(([target, rawFleets]) => {
130:       const fleets = rawFleets.filter((f) => f.deltaV > 0 && (f.daysToTarget || 0) > 0);
131:       const surv = rawFleets.filter((f) => f.operation === "AlienEarthSurveillanceOperation" && !f.arrivalTime);
132:       const survInfo = surv.length ? (
133:         <>
134:           <span className="text-white bg-destructive rounded py-2 px-3 font-bold">
135:             {surv
136:               .map((f) => f.operationCompleteDays || 0)
137:               .reduce((a, b) => Math.min(a, b), 9999999999)
138:               .toFixed(0)}
139:             d Surveillance
140:           </span>{" "}
141:         </>
142:       ) : null;
143:       if (fleets.length === 0) {
144:         if (survInfo) {
145:           return (
146:             <span>
147:               {target}: {survInfo}
148:             </span>
149:           );
150:         }
151:         return null;
152:       }
153:       // now that we know the arrival of the first one, find all arriving within 14 days to summarize MC
154:       const firstFleet = sortByDateTime(fleets, (f) => f.arrivalTime || analysis.gameCurrentDateTime)[0];
155:       const firstFleets = fleets.filter(
156:         (f) =>
157:           toDays(
158:             diffDateTime(
159:               f.arrivalTime || analysis.gameCurrentDateTime,
160:               firstFleet.arrivalTime || analysis.gameCurrentDateTime,
161:             ),
162:           ) < 14,
163:       );
164:       const firstMc = firstFleets.reduce((sum, f) => sum + f.totalMC, 0);
165: 
166:       // tier 2 hab (60d), fusion power, and defense module (90d) take a total of 150 days
167:       // tier 3 hab (90d), fusion power, and defense module (180d) take a total of 270 days.
168:       // T2 hab should be able to stop a bombard from a 10MC fleet, and T3 is the best we can do anyway, plus the turn time of 30 days should make for enough warning
169:       // before that, we'll still have the nameplate warning and can look at details in the fleets tab
170:       const warningNeeded = (firstMc > 10 ? 270 : 150) + 30;
171:       const daysToTarget = firstFleet.daysToTarget || 0;
172:       const farFuture = daysToTarget > warningNeeded;
173:       const className = twMerge(
174:         farFuture && "px-1 -mx-1 py-0.5 -my-0.5 rounded bg-green-500",
175:         farFuture &&
176:           (daysToTarget < warningNeeded + 50
177:             ? "bg-red-200"
178:             : daysToTarget < warningNeeded + 100
179:               ? "bg-yellow-200"
180:               : "bg-green-200"),
181:       );
182:       return (
183:         <span
184:           className={className}
185:           title={`${fleets.length} fleet(s) targeting ${target}, arriving in ${daysToTarget.toFixed(
186:             0,
187:           )} days, using ${firstMc.toFixed(0)} MC`}
188:         >
189:           {target}
190:           {fleets.length > 1 ? `(${fleets.length})` : ""}
191:           {farFuture ? (
192:             ""
193:           ) : (
194:             <>
195:               : {daysToTarget.toFixed(0)}d <MissionControl />
196:               {firstMc.toFixed(0)}
197:             </>
198:           )}
199:           {survInfo && <>,{survInfo}</>}
200:         </span>
201:       );
202:     }),
203:   ].filter((i) => !!i);
204: 
205:   return {
206:     key: "fleets",
207:     tab: (
208:       <>
209:         Fleets
210:         {label.length > 0 ? (
211:           <>
212:             {" - "}
213:             {label.map((i, ix) => (
214:               <Fragment key={ix}>
215:                 {i}
216:                 {ix < label.length - 1 ? " | " : ""}
217:               </Fragment>
218:             ))}
219:           </>
220:         ) : (
221:           ""
222:         )}
223:       </>
224:     ),
225:     content: <FleetsComponent analysis={analysis} />,
226:   };
227: }
228: 
229: function FleetsComponent({ analysis }: { analysis: Analysis }) {
230:   const alienFleets = analysis.alienFleetsToPlayerOrbits;
231:   const humanEnemyFleets = analysis.humanEnemyFleetsToPlayerOrbits;
232:   const playerFleets = analysis.playerFleets;
233:   const shipsUnderConstruction = analysis.playerShipsUnderConstruction;
234: 
235:   return (
236:     <SmartAccordion
237:       type="multiple"
238:       storageKey="fleetsSections"
239:       defaultValue={["alien-fleets", "human-enemy-fleets", "player-fleets", "ships-under-construction"]}
240:     >
241:       {/* Alien Fleets */}
242:       <AccordionItem value="alien-fleets">
243:         <AccordionTrigger>Alien Fleets ({alienFleets.length})</AccordionTrigger>
244:         <AccordionContent>
245:           {alienFleets.length === 0 ? (
246:             <div className="p-4 text-muted-foreground">No alien fleets detected heading to player orbits.</div>
247:           ) : (
248:             <div className="space-y-2">
249:               <p>Tracking planets: {analysis.playerInterestedPlanets.map((p) => p.displayName).join(", ")}</p>
250:               <Table>
251:                 <TableHeader>
252:                   <TableRow>
253:                     <TableHead>Fleet Name</TableHead>
254:                     <TableHead>Planet</TableHead>
255:                     <TableHead>Target Orbit</TableHead>
256:                     <TableHead>Arrival Date</TableHead>
257:                     <TableHead className="text-right">Days to Arrival</TableHead>
258:                     <TableHead className="text-right">MC Used</TableHead>
259:                     <TableHead className="text-right">Marine CP</TableHead>
260:                     <TableHead className="text-right">Total Mass</TableHead>
261:                     <TableHead className="text-right">Max Ship Mass</TableHead>
262:                     <TableHead>Ships Hulls</TableHead>
263:                     <TableHead>Ships Roles</TableHead>
264:                     <TableHead>Operation</TableHead>
265:                     <TableHead>Operation Complete</TableHead>
266:                   </TableRow>
267:                 </TableHeader>
268:                 <TableBody>
269:                   {alienFleets.map((fleet) => (
270:                     <TableRow key={fleet.id} className={twMerge(fleet.deltaV === 0 ? "bg-gray-500/5" : "")}>
271:                       <TableCell className="font-medium">{fleet.displayName}</TableCell>
272:                       <TableCell>{fleet.planetName}</TableCell>
273:                       <TableCell>{fleet.targetOrbitName}</TableCell>
274:                       <TableCell>{fleet.arrivalTimeFormatted || "-"}</TableCell>
275:                       <TableCell className="text-right">
276:                         {fleet.daysToTarget !== null ? `${fleet.daysToTarget.toFixed(0)}` : "—"}
277:                       </TableCell>
278:                       <TableCell className="text-right">{fleet.totalMC.toFixed(0)}</TableCell>
279:                       <TableCell className="text-right">{fleet.marineCombatPower > 0 ? fleet.marineCombatPower : "—"}</TableCell>
280:                       <TableCell className="text-right">{(fleet.totalMass / 1000000).toFixed(0)} Mkg</TableCell>
281:                       <TableCell className="text-right">{(fleet.maxShipMass / 1000000).toFixed(0)} Mkg</TableCell>
282:                       <TableCell className="whitespace-normal">
283:                         {fleet.shipsByHullType.length > 0
284:                           ? fleet.shipsByHullType
285:                               .map((ship) => {
286:                                 const name = `${ship.count} ${ship.hullName.replace("Alien ", "")}${ship.count > 1 ? "s" : ""}`;
287:                                 return ship.avgNoseArmor > 0 ? `${name} (${ship.avgNoseArmor})` : name;
288:                               })
289:                               .join(" + ")
290:                           : "-"}
291:                       </TableCell>
292:                       <TableCell className="whitespace-normal">
293:                         {fleet.shipsByRole.length > 0
294:                           ? fleet.shipsByRole
295:                               .map((ship) => `${ship.count} ${ship.role}${ship.count > 1 ? "s" : ""}`)
296:                               .join(" + ")
297:                           : "-"}
298:                       </TableCell>
299:                       <TableCell>{fleet.operation || "-"}</TableCell>
300:                       <TableCell>
301:                         {fleet.operationComplete
302:                           ? `${fleet.operationComplete}${
303:                               fleet.operationCompleteDays !== null
304:                                 ? ` (${fleet.operationCompleteDays.toFixed(0)}d)`
305:                                 : ""
306:                             }`
307:                           : "-"}
308:                       </TableCell>
309:                     </TableRow>
310:                   ))}
311:                 </TableBody>
312:               </Table>
313: 
314:               {/* Planetary Defense Summary */}
315:               <div className="mt-8">
316:                 <h2 className="text-2xl font-bold mb-4">Planetary Defense Summary</h2>
317:                 <Table>
318:                   <TableHeader>
319:                     <TableRow>
320:                       <TableHead>Planet</TableHead>
321:                       <TableHead className="text-right">Days to Arrival</TableHead>
322:                       <TableHead className="text-right">Alien Fleet MC</TableHead>
323:                       <TableHead className="text-right">Player Fleet MC</TableHead>
324:                       <TableHead>Habs (Active / Potential Combat)</TableHead>
325:                     </TableRow>
326:                   </TableHeader>
327:                   <TableBody>
328:                     {(() => {
329:                       const planetsWithFleets = new Set(
330:                         analysis.alienFleetsToPlayerOrbits.map((f) => f.planetName || "Unknown"),
331:                       );
332:                       const defenseData = Array.from(planetsWithFleets)
333:                         .map((planet) => {
334:                           const fleetsAtPlanet = analysis.alienFleetsToPlayerOrbits.filter(
335:                             (f) => f.planetName === planet,
336:                           );
337:                           const totalAlienMC = fleetsAtPlanet.reduce((sum, f) => sum + (f.totalMC || 0), 0);
338:                           const incomingFleets = fleetsAtPlanet.filter(
339:                             (f) => f.daysToTarget !== null && f.daysToTarget > 0,
340:                           );
341:                           const daysToArrival =
342:                             incomingFleets.length > 0
343:                               ? Math.min(...incomingFleets.map((f) => f.daysToTarget!))
344:                               : null;
345:                           const playerFleetsAtPlanet = analysis.playerFleets.filter(
346:                             (f) => f.planetName === planet,
347:                           );
348:                           const relevantPlayerFleets = playerFleetsAtPlanet.filter((f) => {
349:                             if (f.daysToTarget === null || f.daysToTarget <= 0) return true;
350:                             if (daysToArrival === null) return false;
351:                             return f.daysToTarget < daysToArrival;
352:                           });
353:                           const totalPlayerMC = relevantPlayerFleets.reduce((sum, f) => sum + (f.totalMC || 0), 0);
354:                           const habsAtPlanet = analysis.playerHabs.filter((h) => h.planetName === planet);
355:                           return { planet, totalAlienMC, totalPlayerMC, daysToArrival, habs: habsAtPlanet };
356:                         })
357:                         .filter((d) => d.habs.length > 0)
358:                         .toSorted((a, b) => {
359:                           if (a.daysToArrival === null && b.daysToArrival === null) return 0;
360:                           if (a.daysToArrival === null) return 1;
361:                           if (b.daysToArrival === null) return -1;
362:                           return a.daysToArrival - b.daysToArrival;
363:                         });
364: 
365:                       return defenseData.map(({ planet, totalAlienMC, totalPlayerMC, daysToArrival, habs }) => (
366:                         <TableRow key={planet}>
367:                           <TableCell className="font-medium">{planet}</TableCell>
368:                           <TableCell className="text-right">
369:                             {daysToArrival !== null ? daysToArrival.toFixed(0) : "—"}
370:                           </TableCell>
371:                           <TableCell className="text-right">{totalAlienMC.toFixed(0)}</TableCell>
372:                           <TableCell className="text-right">{totalPlayerMC.toFixed(0)}</TableCell>
373:                           <TableCell>
374:                             <TooltipProvider>
375:                               <div className="flex gap-2 flex-wrap">
376:                                 {habs
377:                                   .toSorted((a, b) => {
378:                                     if (a.habType === "Station" && b.habType !== "Station") return -1;
379:                                     if (a.habType !== "Station" && b.habType === "Station") return 1;
380:                                     return 0;
381:                                   })
382:                                   .map((hab) => {
383:                                     const activeCombat = hab.activeEffects.combatScore || 0;
384:                                     const potentialCombat = hab.potentialEffects.combatScore || 0;
385:                                     const combatDisplay =
386:                                       activeCombat === potentialCombat
387:                                         ? activeCombat.toFixed(0)
388:                                         : `${activeCombat.toFixed(0)} / ${potentialCombat.toFixed(0)}`;
389:                                     const bgColor = hab.habType === "Station" ? "bg-yellow-100" : "bg-green-100";
390:                                     return (
391:                                       <Tooltip key={hab.id}>
392:                                         <TooltipTrigger asChild>
393:                                           <span className={`cursor-help ${bgColor} px-1.5 py-0.5 rounded`}>
394:                                             {combatDisplay}
395:                                           </span>
396:                                         </TooltipTrigger>
397:                                         <TooltipContent>
398:                                           <div>{hab.displayName}</div>
399:                                         </TooltipContent>
400:                                       </Tooltip>
401:                                     );
402:                                   })}
403:                               </div>
404:                             </TooltipProvider>
405:                           </TableCell>
406:                         </TableRow>
407:                       ));
408:                     })()}
409:                   </TableBody>
410:                 </Table>
411:               </div>
412: 
413:               <Collapsible>
414:                 <CollapsibleTrigger asChild>
415:                   <Button>Debug Data</Button>
416:                 </CollapsibleTrigger>
417:                 <CollapsibleContent>
418:                   <pre>{JSON.stringify(alienFleets, null, 2)}</pre>
419:                 </CollapsibleContent>
420:               </Collapsible>
421:             </div>
422:           )}
423:         </AccordionContent>
424:       </AccordionItem>
425: 
426:       {/* Other Human Factions Fleets */}
427:       <AccordionItem value="human-enemy-fleets">
428:         <AccordionTrigger>Other Human Factions ({humanEnemyFleets.length})</AccordionTrigger>
429:         <AccordionContent>
430:           {humanEnemyFleets.length === 0 ? (
431:             <div className="p-4 text-muted-foreground">No other human faction fleets detected heading to player orbits.</div>
432:           ) : (
433:             <Table>
434:               <TableHeader>
435:                 <TableRow>
436:                   <TableHead>Faction</TableHead>
437:                   <TableHead>Fleet Name</TableHead>
438:                   <TableHead>Planet</TableHead>
439:                   <TableHead>Target Orbit</TableHead>
440:                   <TableHead>Arrival Date</TableHead>
441:                   <TableHead className="text-right">Days to Arrival</TableHead>
442:                   <TableHead className="text-right">MC Used</TableHead>
443:                   <TableHead className="text-right">Marine CP</TableHead>
444:                   <TableHead className="text-right">Total Mass</TableHead>
445:                   <TableHead className="text-right">Max Ship Mass</TableHead>
446:                   <TableHead>Ship Hulls</TableHead>
447:                   <TableHead>Ship Roles</TableHead>
448:                   <TableHead>Operation</TableHead>
449:                   <TableHead>Operation Complete</TableHead>
450:                 </TableRow>
451:               </TableHeader>
452:               <TableBody>
453:                 {humanEnemyFleets.map((fleet) => {
454:                   const FactionIcon = fleet.factionTemplateName
455:                     ? FactionIcons[fleet.factionTemplateName as keyof typeof FactionIcons]
456:                     : null;
457:                   return (
458:                     <TableRow key={fleet.id} className={twMerge(fleet.deltaV === 0 ? "bg-gray-500/5" : "")}>
459:                       <TableCell>
460:                         <div className="flex items-center gap-1">
461:                           {FactionIcon && <FactionIcon className="p-1 rounded" />}
462:                           <span className="text-sm">{fleet.factionDisplayName ?? fleet.factionTemplateName ?? "Unknown"}</span>
463:                         </div>
464:                       </TableCell>
465:                       <TableCell className="font-medium">{fleet.displayName}</TableCell>
466:                       <TableCell>{fleet.planetName}</TableCell>
467:                       <TableCell>{fleet.targetOrbitName}</TableCell>
468:                       <TableCell>{fleet.arrivalTimeFormatted || "-"}</TableCell>
469:                       <TableCell className="text-right">
470:                         {fleet.daysToTarget !== null ? `${fleet.daysToTarget.toFixed(0)}` : "—"}
471:                       </TableCell>
472:                       <TableCell className="text-right">{fleet.totalMC.toFixed(0)}</TableCell>
473:                       <TableCell className="text-right">{fleet.marineCombatPower > 0 ? fleet.marineCombatPower : "—"}</TableCell>
474:                       <TableCell className="text-right">{(fleet.totalMass / 1000000).toFixed(0)} Mkg</TableCell>
475:                       <TableCell className="text-right">{(fleet.maxShipMass / 1000000).toFixed(0)} Mkg</TableCell>
476:                       <TableCell className="whitespace-normal">
477:                         {fleet.shipsByHullType.length > 0
478:                           ? fleet.shipsByHullType
479:                               .map((ship) => {
480:                                 const name = `${ship.count} ${ship.hullName}${ship.count > 1 ? "s" : ""}`;
481:                                 return ship.avgNoseArmor > 0 ? `${name} (${ship.avgNoseArmor})` : name;
482:                               })
483:                               .join(" + ")
484:                           : "-"}
485:                       </TableCell>
486:                       <TableCell className="whitespace-normal">
487:                         {fleet.shipsByRole.length > 0
488:                           ? fleet.shipsByRole.map((s) => `${s.count} ${s.role}${s.count > 1 ? "s" : ""}`).join(" + ")
489:                           : "-"}
490:                       </TableCell>
491:                       <TableCell>{fleet.operation || "-"}</TableCell>
492:                       <TableCell>
493:                         {fleet.operationComplete
494:                           ? `${fleet.operationComplete}${fleet.operationCompleteDays !== null ? ` (${fleet.operationCompleteDays.toFixed(0)}d)` : ""}`
495:                           : "-"}
496:                       </TableCell>
497:                     </TableRow>
498:                   );
499:                 })}
500:               </TableBody>
501:             </Table>
502:           )}
503:         </AccordionContent>
504:       </AccordionItem>
505: 
506:       {/* Player Fleets */}
507:       <AccordionItem value="player-fleets">
508:         <AccordionTrigger>Player Fleets ({playerFleets.length})</AccordionTrigger>
509:         <AccordionContent>
510:           {playerFleets.length === 0 ? (
511:             <div className="p-4 text-muted-foreground">No player fleets found.</div>
512:           ) : (
513:             <Table>
514:               <TableHeader>
515:                 <TableRow>
516:                   <TableHead>Fleet Name</TableHead>
517:                   <TableHead>Planet</TableHead>
518:                   <TableHead>Target Orbit</TableHead>
519:                   <TableHead>Arrival Date</TableHead>
520:                   <TableHead className="text-right">Days to Arrival</TableHead>
521:                   <TableHead className="text-right">MC Used</TableHead>
522:                   <TableHead className="text-right">Marine CP</TableHead>
523:                   <TableHead className="text-right">Total Mass</TableHead>
524:                   <TableHead className="text-right">Max Ship Mass</TableHead>
525:                   <TableHead>Ship Hulls</TableHead>
526:                   <TableHead>Ship Classes</TableHead>
527:                 </TableRow>
528:               </TableHeader>
529:               <TableBody>
530:                 {playerFleets.map((fleet) => (
531:                   <TableRow key={fleet.id}>
532:                     <TableCell className="font-medium">{fleet.displayName}</TableCell>
533:                     <TableCell>{fleet.planetName}</TableCell>
534:                     <TableCell>{fleet.targetOrbitName}</TableCell>
535:                     <TableCell>{fleet.arrivalTimeFormatted || "-"}</TableCell>
536:                     <TableCell className="text-right">
537:                       {fleet.daysToTarget !== null ? `${fleet.daysToTarget.toFixed(0)}` : "—"}
538:                     </TableCell>
539:                     <TableCell className="text-right">{fleet.totalMC.toFixed(0)}</TableCell>
540:                     <TableCell className="text-right">{fleet.marineCombatPower > 0 ? fleet.marineCombatPower : "—"}</TableCell>
541:                     <TableCell className="text-right">{(fleet.totalMass / 1000000).toFixed(0)} Mkg</TableCell>
542:                     <TableCell className="text-right">{(fleet.maxShipMass / 1000000).toFixed(0)} Mkg</TableCell>
543:                     <TableCell className="whitespace-normal">
544:                       {fleet.shipsByHullType.length > 0
545:                         ? fleet.shipsByHullType.map((ship, i) => (
546:                             <Fragment key={ship.hullName}>
547:                               {i > 0 && <br />}
548:                               {ship.count} {ship.hullName}
549:                               {ship.count > 1 ? "s" : ""}
550:                             </Fragment>
551:                           ))
552:                         : "-"}
553:                     </TableCell>
554:                     <TableCell className="whitespace-normal">
555:                       {fleet.shipsByClass.length > 0
556:                         ? fleet.shipsByClass.map((cls, i) => (
557:                             <Fragment key={cls.className}>
558:                               {i > 0 && <br />}
559:                               {cls.count}× {cls.className}{cls.noseArmor > 0 ? ` (${cls.noseArmor})` : ""}
560:                             </Fragment>
561:                           ))
562:                         : "-"}
563:                     </TableCell>
564:                   </TableRow>
565:                 ))}
566:               </TableBody>
567:             </Table>
568:           )}
569:         </AccordionContent>
570:       </AccordionItem>
571: 
572:       {/* Ships Under Construction */}
573:       <AccordionItem value="ships-under-construction">
574:         <AccordionTrigger>Ships Under Construction ({shipsUnderConstruction.length})</AccordionTrigger>
575:         <AccordionContent>
576:           {shipsUnderConstruction.length === 0 ? (
577:             <div className="p-4 text-muted-foreground">No ships under construction.</div>
578:           ) : (
579:             <Table>
580:               <TableHeader>
581:                 <TableRow>
582:                   <TableHead>Planet</TableHead>
583:                   <TableHead>Design</TableHead>
584:                   <TableHead>Hull</TableHead>
585:                   <TableHead className="text-right">Nose Armor</TableHead>
586:                   <TableHead className="text-right">Count</TableHead>
587:                   <TableHead>Days to Complete</TableHead>
588:                 </TableRow>
589:               </TableHeader>
590:               <TableBody>
591:                 {(() => {
592:                   const byPlanetDesign = shipsUnderConstruction.reduce((acc, ship) => {
593:                     const key = `${ship.planetName}||${ship.designName}`;
594:                     if (!acc.has(key))
595:                       acc.set(key, {
596:                         planetName: ship.planetName,
597:                         designName: ship.designName,
598:                         hullName: ship.hullName,
599:                         noseArmor: ship.noseArmor,
600:                         entries: [] as { days: number; status: "building" | "queued" | "waiting" }[],
601:                       });
602:                     acc.get(key)!.entries.push({ days: ship.daysToCompletion, status: ship.status });
603:                     return acc;
604:                   }, new Map<string, { planetName: string; designName: string; hullName: string; noseArmor: number; entries: { days: number; status: "building" | "queued" | "waiting" }[] }>());
605: 
606:                   return [...byPlanetDesign.values()]
607:                     .toSorted((a, b) => a.planetName.localeCompare(b.planetName) || a.designName.localeCompare(b.designName))
608:                     .map(({ planetName, designName, hullName, noseArmor, entries }) => (
609:                       <TableRow key={`${planetName}||${designName}`}>
610:                         <TableCell>{planetName}</TableCell>
611:                         <TableCell className="font-medium">{designName}</TableCell>
612:                         <TableCell>{hullName}</TableCell>
613:                         <TableCell className="text-right">{noseArmor > 0 ? noseArmor : "-"}</TableCell>
614:                         <TableCell className="text-right">{entries.length}</TableCell>
615:                         <TableCell>
616:                           {entries
617:                             .toSorted((a, b) => a.days - b.days)
618:                             .map((e, i) => (
619:                               <Fragment key={i}>
620:                                 {i > 0 && ", "}
621:                                 {e.status === "waiting" ? (
622:                                   <span title="Waiting for materials">⚠️{e.days.toFixed(0)}</span>
623:                                 ) : e.status === "queued" ? (
624:                                   <span className="text-muted-foreground" title="Queued">({e.days.toFixed(0)})</span>
625:                                 ) : (
626:                                   e.days.toFixed(0)
627:                                 )}
628:                               </Fragment>
629:                             ))}
630:                         </TableCell>
631:                       </TableRow>
632:                     ));
633:                 })()}
634:               </TableBody>
635:             </Table>
636:           )}
637:         </AccordionContent>
638:       </AccordionItem>
639:     </SmartAccordion>
640:   );
641: }

(End of file - total 641 lines)
</content>
```

---

## Assistant (Build · Gemma 4-26B-A4B (local) · 204.7s)

_Thinking:_

Okay, I have the content of `fleets.tsx`. Now I'll use `write` to create `fleets-component.tsx` with the content of `FleetsComponent`.

Wait, I should also include the `NavItem` import in `fleets-component.tsx` if I use it in the return type, but `FleetsComponent` doesn't use `NavItem` itself, only `getFleetsUi` does.

Wait, I'll just move `FleetsComponent` to `fleets-component.tsx` and then update `fleets.tsx`.

Actually, I'll do this:
1. Create `src/app/game/current/fleets-component.tsx`.
2. Update `src/app/game/current/fleets.tsx`.

Wait, I'll do it in one go.



**Tool: write**

**Input:**
```json
{
  "content": "import { Analysis } from \"@/lib/analysis\";\nimport { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from \"@/components/ui/table\";\nimport { Collapsible, CollapsibleContent, CollapsibleTrigger } from \"@/components/ui/collapsible\";\nimport { AccordionContent, AccordionItem, AccordionTrigger } from \"@/components/ui/accordion\";\nimport { SmartAccordion } from \"@/components/ui/smart-accordion\";\nimport { Button } from \"@/components/ui/button\";\nimport { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from \"@/components/ui/tooltip\";\nimport { diffDateTime, sortByDateTime, toDays } from \"@/lib/utils\";\nimport { Fragment } from \"react\";\nimport { FactionIcons, MissionControl } from \"@/components/icons\";\nimport { twMerge } from \"tailwind-merge\";\n\nexport function FleetsComponent({ analysis }: { analysis: Analysis }) {\n  const alienFleets = analysis.alienFleetsToPlayerOrbits;\n  const humanEnemyFleets = analysis.humanEnemyFleetsToPlayerOrbits;\n  const playerFleets = analysis.playerFleets;\n  const shipsUnderConstruction = analysis.playerShipsUnderConstruction;\n\n  return (\n    <SmartAccordion\n      type=\"multiple\"\n      storageKey=\"fleetsSections\"\n      defaultValue={[\"alien-fleets\", \"human-enemy-fleets\", \"player-fleets\", \"ships-under-construction\"]}\n    >\n      {/* Alien Fleets */}\n      <AccordionItem value=\"alien-fleets\">\n        <AccordionTrigger>Alien Fleets ({alienFleets.length})</AccordionTrigger>\n        <AccordionContent>\n          {alienFleets.length === 0 ? (\n            <div className=\"p-4 text-muted-foreground\">No alien fleets detected heading to player orbits.</div >\n          ) : (\n            <div className=\"space-y-2\">\n              <p>Tracking planets: {analysis.playerInterestedPlanets.map((p) => p.displayName).join(\", \")}</p>\n              <Table>\n                <TableHeader>\n                  <TableRow>\n                    <TableHead>Fleet Name</TableHead>\n                    <TableHead>Planet</TableHead>\n                    <TableHead>Target Orbit</TableHead>\n                    <TableHead>Arrival Date</TableHead>\n                    <TableHead className=\"text-right\">Days to Arrival</TableHead>\n                    <TableHead className=\"text-right\">MC Used</TableHead>\n                    <TableHead className=\"text-right\">Marine CP</TableHead>\n                    <TableHead className=\"text-right\">Total Mass</TableHead>\n                    <TableHead className=\"text-right\">Max Ship Mass</TableHead>\n                    <TableHead>Ships Hulls</TableHead>\n                    <TableHead>Ships Roles</TableHead>\n                    <TableHead>Operation</TableHead>\n                    <TableHead>Operation Complete</TableHead>\n                  </TableRow>\n                </TableHeader>\n                <TableBody>\n                  {alienFleets.map((fleet) => (\n                    <TableRow key={fleet.id} className={twMerge(fleet.deltaV === 0 ? \"bg-gray-500/5\" : \"\")}>\n                      <TableCell className=\"font-medium\">{fleet.displayName}</TableCell>\n                      <TableCell>{fleet.planetName}</TableCell>\n                      <TableCell>{fleet.targetOrbitName}</TableCell>\n                      <TableCell>{fleet.arrivalTimeFormatted || \"-\"}</TableCell>\n                      <TableCell className=\"text-right\">\n                        {fleet.daysToTarget !== null ? `${fleet.daysToTarget.toFixed(0)}` : \"—\"}\n                      </TableCell>\n                      <TableCell className=\"text-right\">{fleet.totalMC.toFixed(0)}</TableCell>\n                      <TableCell className=\"text-right\">{fleet.marineCombatPower > 0 ? fleet.marineCombatPower : \"—\"}</TableCell>\n                      <TableCell className=\"text-right\">{(fleet.totalMass / 1000000).toFixed(0)} Mkg</TableCell>\n                      <TableCell className=\"text-right\">{(fleet.maxShipMass / 1000000).toFixed(0)} Mkg</TableCell>\n                      <TableCell className=\"whitespace-normal\">\n                        {fleet.shipsByHullType.length > 0\n                          ? fleet.shipsByHullType\n                              .map((ship) => {\n                                const name = `${ship.count} ${ship.hullName.replace(\"Alien \", \"\")}${ship.count > 1 ? \"s\" : \"\"}`;\n                                return ship.avgNoseArmor > 0 ? `${name} (${ship.avgNoseArmor})` : name;\n                              })\n                              .join(\" + \")\n                          : \"-\"}\n                      </TableCell>\n                      <TableCell className=\"whitespace-normal\">\n                        {fleet.shipsByRole.length > 0\n                          ? fleet.shipsByRole\n                              .map((ship) => `${ship.count} ${ship.role}${ship.count > 1 ? \"s\" : \"\"}`)\n                              .join(\" + \")\n                          : \"-\"}\n                      </TableCell>\n                      <TableCell>{fleet.operation || \"-\"}</TableCell>\n                      <TableCell>\n                        {fleet.operationComplete\n                          ? `${fleet.operationComplete}${fleet.operationCompleteDays !== null ? ` (${fleet.operationCompleteDays.toFixed(0)}d)` : \"\"}`\n                          : \"-\"}\n                      </TableCell>\n                    </TableRow>\n                  ))}\n                </TableBody>\n              </Table>\n\n              {/* Planetary Defense Summary */}\n              <div className=\"mt-8\">\n                <h2 className=\"text-2xl font-bold mb-4\">Planetary Defense Summary</h2>\n                <Table>\n                  <TableHeader>\n                    <TableRow>\n                      <TableHead>Planet</TableHead>\n                      <TableHead className=\"text-right\">Days to Arrival</TableHead>\n                      <TableHead className=\"text-right\">Alien Fleet MC</TableHead>\n                      <TableHead className=\"text-right\">Player Fleet MC</TableHead>\n                      <TableHead>Habs (Active / Potential Combat)</TableHead>\n                    </TableRow>\n                  </TableHeader>\n                  <TableBody>\n                    {(() => {\n                      const planetsWithFleets = new Set(\n                        analysis.alienFleetsToPlayerOrbits.map((f) => f.planetName || \"Unknown\"),\n                      );\n                      const defenseData = Array.from(planetsWithFleets)\n                        .map((planet) => {\n                          const fleetsAtPlanet = analysis.alienFleetsToPlayerOrbits.filter(\n                            (f) => f.planetName === planet,\n                          );\n                          const totalAlienMC = fleetsAtPlanet.reduce((sum, f) => sum + (f.totalMC || 0), 0);\n                          const incomingFleets = fleetsAtPlanet.filter(\n                            (f) => f.daysToTarget !== null && f.daysToTarget > 0,\n                          );\n                          const daysToArrival =\n                            incomingFleets.length > 0\n                              ? Math.min(...incomingFleets.map((f) => f.daysToTarget!))\n                              : null;\n                          const playerFleetsAtPlanet = analysis.playerFleets.filter(\n                            (f) => f.planetName === planet,\n                          );\n                          const relevantPlayerFleets = playerFleetsAtPlanet.filter((f) => {\n                            if (f.daysToTarget === null || f.daysToTarget <= 0) return true;\n                            if (daysToArrival === null) return false;\n                            return f.daysToTarget < daysToArrival;\n                          });\n                          const totalPlayerMC = relevantPlayerFleets.reduce((sum, f) => sum + (f.totalMC || 0), 0);\n                          const habsAtPlanet = analysis.playerHabs.filter((h) => h.planetName === planet);\n                          return { planet, totalAlienMC, totalPlayerMC, daysToArrival, habs: habsAtPlanet };\n                        })\n                        .filter((d) => d.habs.length > 0)\n                        .toSorted((a, b) => {\n                          if (a.daysToArrival === null && b.daysToArrival === null) return 0;\n                          if (a.daysToArrival === null) return 1;\n                          if (b.daysToArrival === null) return -1;\n                          return a.daysToArrival - b.daysToArrival;\n                        });\n\n                      return defenseData.map(({ planet, totalAlienMC, totalPlayerMC, daysToArrival, habs }) => (\n                        <TableRow key={planet}>\n                          <TableCell className=\"font-medium\">{planet}</TableCell>\n                          <TableCell className=\"text-right\">\n                            {daysToArrival !== null ? daysToArrival.toFixed(0) : \"—\"}\n                          </TableCell>\n                          <TableCell className=\"text-right\">{totalAlienMC.toFixed(0)}</TableCell>\n                          <TableCell className=\"text-right\">{totalPlayerMC.toFixed(0)}</TableCell>\n                          <TableCell>\n                            <TooltipProvider>\n                              <div className=\"flex gap-2 flex-wrap\">\n                                {habs\n                                  .toSorted((a, b) => {\n                                    if (a.habType === \"Station\" && b.habType !== \"Station\") return -1;\n                                    if (a.habType !== \"Station\" && b.habType === \"Station\") return 1;\n                                    return 0;\n                                  })\n                                  .map((hab) => {\n                                    const activeCombat = hab.activeEffects.combatScore || 0;\n                                    const potentialCombat = hab.potentialEffects.combatScore || 0;\n                                    const combatDisplay =\n                                      activeCombat === potentialCombat\n                                        ? activeCombat.toFixed(0)\n                                        : `${activeCombat.toFixed(0)} / ${potentialCombat.toFixed(0)}`;\n                                    const bgColor = hab.habType === \"Station\" ? \"bg-yellow-100\" : \"bg-green-100\";\n                                    return (\n                                      <Tooltip key={hab.id}>\n                                        <TooltipTrigger asChild>\n                                          <span className={`cursor-help ${bgColor} px-1.5 py-0.5 rounded`}>\n                                            {combatDisplay}\n                                          </span >\n                                        </TooltipTrigger>\n                                        <TooltipContent>\n                                          <div>{hab.displayName}</div>\n                                        </TooltipContent>\n                                      </Tooltip>\n                                    );\n                                  })}\n                                </div>\n                            </TooltipProvider>\n                          </TableCell>\n                        </TableRow>\n                      ));\n                    })()}\n                  </TableBody>\n                </Table>\n              </div >\n\n              <Collapsible>\n                <CollapsibleTrigger asChild>\n                  <Button>Debug Data</Button>\n                </CollapsibleTrigger>\n                <CollapsibleContent>\n                  <pre>{JSON.stringify(alienFleets, null, 2)}</pre>\n                </CollapsibleContent>\n              </Collapsible>\n            </div >\n          )}\n        </AccordionContent>\n      </AccordionItem>\n\n      {/* Other Human Factions Fleets */}\n      <AccordionItem value=\"human-enemy-fleets\">\n        <AccordionTrigger>Other Human Factions ({humanEnemyFleets.length})</AccordionTrigger>\n        <AccordionContent>\n          {humanEnemyFleets.length === 0 ? (\n            <div className=\"p-4 text-muted-foreground\">No other human faction fleets detected heading to player orbits.</div >\n          ) : (\n            <Table>\n              <TableHeader>\n                <TableRow>\n                  <TableHead>Faction</TableHead>\n                  <TableHead>Fleet Name</TableHead>\n                  <TableHead>Planet</TableHead>\n                  <TableHead>Target Orbit</TableHead>\n                  <TableHead>Arrival Date</TableHead>\n                  <TableHead className=\"text-right\">Days to Arrival</TableHead>\n                  <TableHead className=\"text-right\">MC Used</TableHead>\n                  <TableHead className=\"text-right\">Marine CP</TableHead>\n                  <TableHead className=\"text-right\">Total Mass</TableHead>\n                  <TableHead className=\"text-right\">Max Ship Mass</TableHead>\n                  <TableHead>Ship Hulls</TableHead>\n                  <TableHead>Ship Roles</TableHead>\n                  <TableHead>Operation</TableHead>\n                  <TableHead>Operation Complete</TableHead>\n                </TableRow>\n              </TableHeader>\n              <TableBody>\n                {humanEnemyFleets.map((fleet) => {\n                  const FactionIcon = fleet.factionTemplateName\n                    ? FactionIcons[fleet.factionTemplateName as keyof typeof FactionIcons]\n                    : null;\n                  return (\n                    <TableRow key={fleet.id} className={twMerge(fleet.deltaV === 0 ? \"bg-gray-500/5\" : \"\")}>\n                      <TableCell>\n                        <div className=\"flex items-center gap-1\">\n                          {FactionIcon && <FactionIcon className=\"p-1 rounded\" />}\n                          <span className=\"text-sm\">{fleet.factionDisplayName ?? fleet.factionTemplateName ?? \"Unknown\"}</span >\n                        </div >\n                      </TableCell>\n                      <TableCell className=\"font-medium\">{fleet.displayName}</TableCell>\n                      <TableCell>{fleet.planetName}</TableCell>\n                      <TableCell>{fleet.targetOrbitName}</TableCell>\n                      <TableCell>{fleet.arrivalTimeFormatted || \"-\"}</TableCell>\n                      <TableCell className=\"text-right\">\n                        {fleet.daysToTarget !== null ? `${fleet.daysToTarget.toFixed(0)}` : \"—\"}\n                      </TableCell>\n                      <TableCell className=\"text-right\">{fleet.totalMC.toFixed(0)}</TableCell>\n                      <TableCell className=\"text-right\">{fleet.marineCombatPower > 0 ? fleet.marineCombatPower : \"—\"}</TableCell>\n                      <TableCell className=\"text-right\">{(fleet.totalMass / 1000000).toFixed(0)} Mkg</TableCell>\n                      <TableCell className=\"text-right\">{(fleet.maxShipMass / 1000000).toFixed(0)} Mkg</TableCell>\n                      <TableCell className=\"whitespace-normal\">\n                        {fleet.shipsByHullType.length > 0\n                          ? fleet.shipsByHullType\n                              .map((ship) => {\n                                const name = `${ship.count} ${ship.hullName}${ship.count > 1 ? \"s\" : \"\"}`;\n                                return ship.avgNoseArmor > 0 ? `${name} (${ship.avgNoseArmor})` : name;\n                              })\n                              .join(\" + \")\n                          : \"-\"}\n                      </TableCell>\n                      <TableCell className=\"whitespace-normal\">\n                        {fleet.shipsByRole.length > 0\n                          ? fleet.shipsByRole.map((s) => `${s.count} ${s.role}${s.count > 1 ? \"s\" : \"\"}`).join(\" + \")\n                          : \"-\"}\n                      </TableCell>\n                      <TableCell>{fleet.operation || \"-\"}</TableCell>\n                      <TableCell>\n                        {fleet.operationComplete\n                          ? `${fleet.operationComplete}${fleet.operationCompleteDays !== null ? ` (${fleet.operationCompleteDays.toFixed(0)}d)` : \"\"}`\n                          : \"-\"}\n                      </TableCell>\n                    </TableRow>\n                  );\n                })}\n              </TableBody>\n            </Table>\n          )}\n        </AccordionContent>\n      </AccordionItem>\n\n      {/* Player Fleets */}\n      <AccordionItem value=\"player-fleets\">\n        <AccordionTrigger>Player Fleets ({playerFleets.length})</AccordionTrigger>\n        <AccordionContent>\n          {playerFleets.length === 0 ? (\n            <div className=\"p-4 text-muted-foreground\">No player fleets found.</div >\n          ) : (\n            <Table>\n              <TableHeader>\n                <TableRow>\n                  <TableHead>Fleet Name</TableHead>\n                  <TableHead>Planet</TableHead>\n                  <TableHead>Target Orbit</TableHead>\n                  <TableHead>Arrival Date</TableHead>\n                  <TableHead className=\"text-right\">Days to Arrival</TableHead>\n                  <TableHead className=\"text-right\">MC Used</TableHead>\n                  <TableHead className=\"text-right\">Marine CP</TableHead>\n                  <TableHead className=\"text-right\">Total Mass</TableHead>\n                  <TableHead className=\"text-right\">Max Ship Mass</TableHead>\n                  <TableHead>Ship Hulls</TableHead>\n                  <TableHead>Ship Classes</TableHead>\n                </TableRow>\n              </TableHeader>\n              <TableBody>\n                {playerFleets.map((fleet) => (\n                  <TableRow key={fleet.id}>\n                    <TableCell className=\"font-medium\">{fleet.displayName}</TableCell>\n                    <TableCell>{fleet.planetName}</TableCell>\n                    <TableCell>{fleet.targetOrbitName}</TableCell>\n                    <TableCell>{fleet.arrivalTimeFormatted || \"-\"}</TableCell>\n                    <TableCell className=\"text-right\">\n                      {fleet.daysToTarget !== null ? `${fleet.daysToTarget.toFixed(0)}` : \"—\"}\n                    </TableCell>\n                    <TableCell className=\"text-right\">{fleet.totalMC.toFixed(0)}</TableCell>\n                    <TableCell className=\"text-right\">{fleet.marineCombatPower > 0 ? fleet.marineCombatPower : \"—\"}</TableCell>\n                    <TableCell className=\"text-right\">{(fleet.totalMass / 1000000).toFixed(0)} Mkg</TableCell>\n                    <TableCell className=\"text-right\">{(fleet.maxShipMass / 1000000).toFixed(0)} Mkg</TableCell>\n                    <TableCell className=\"whitespace-normal\">\n                      {fleet.shipsByHullType.length > 0\n                        ? fleet.shipsByHullType.map((ship, i) => (\n                            <Fragment key={ship.hullName}>\n                              {i > 0 && <br />}\n                              {ship.count} {ship.hullName}\n                              {ship.count > 1 ? \"s\" : \"\"}\n                            </Fragment>\n                          ))\n                        : \"-\"}\n                    </TableCell>\n                    <TableCell className=\"whitespace-normal\">\n                      {fleet.shipsByClass.length > 0\n                        ? fleet.shipsByClass.map((cls, i) => (\n                            <Fragment key={cls.className}>\n                              {i > 0 && <br />}\n                              {cls.count}× {cls.className}{cls.noseArmor > 0 ? ` (${cls.noseArmor})` : \"\"}\n                            </Fragment>\n                          ))\n                        : \"-\"}\n                    </TableCell>\n                  </TableRow>\n                ))}\n              </TableBody>\n            </Table>\n          )}\n        </AccordionContent>\n      </AccordionItem\n\n      {/* Ships Under Construction */}\n      <AccordionItem value=\"ships-under-construction\">\n        <AccordionTrigger>Ships Under Construction ({shipsUnderConstruction.length})</AccordionTrigger>\n        <AccordionContent>\n          {shipsUnderConstruction.length === 0 ? (\n            <div className=\"p-4 text-muted-foreground\">No ships under construction.</div >\n          ) : (\n            <Table>\n              <TableHeader>\n                <TableRow>\n                  <TableHead>Planet</TableHead>\n                  <TableHead>Design</TableHead>\n                  <TableHead>Hull</TableHead>\n                  <TableHead className=\"text-right\">Nose Armor</TableHead>\n                  <TableHead className=\"text-right\">Count</TableHead>\n                  <TableHead>Days to Complete</TableHead>\n                </TableRow>\n              </TableHeader>\n              <TableBody>\n                {(() => {\n                  const byPlanetDesign = shipsUnderConstruction.reduce((acc, ship) => {\n                    const key = `${ship.planetName}||${ship.designName}`;\n                    if (!acc.has(key))\n                      acc.set(key, {\n                        planetName: ship.planetName,\n                        designName: ship.designName,\n                        hullName: ship.hullName,\n                        noseArmor: ship.noseArmor,\n                        entries: [] as { days: number; status: \"building\" | \"queued\" | \"waiting\" }[],\n                      });\n                    acc.get(key)!.entries.push({ days: ship.daysToCompletion, status: ship.status });\n                    return acc;\n                  }, new Map<string, { planetName: string; designName: string; hullName: string; noseArmor: number; entries: { days: number; status: \"building\" | \"queued\" | \"waiting\" }[] }>());\n\n                  return [...byPlanetDesign.values()]\n                    .toSorted((a, b) => a.planetName.localeCompare(b.planetName) || a.designName.localeCompare(b.designName))\n                    .map(({ planetName, designName, hullName, noseArmor, entries }) => (\n                      <TableRow key={`${planetName}||${designName}`}>\n                        <TableCell>{planetName}</TableCell>\n                        <TableCell className=\"font-medium\">{designName}</TableCell>\n                        <TableCell>{hullName}</TableCell>\n                        <TableCell className=\"text-right\">{noseArmor > 0 ? noseArmor : \"-\"}</TableCell>\n                        <TableCell className=\"text-right\">{entries.length}</TableCell>\n                        <TableCell>\n                          {entries\n                            .toSorted((a, b) => a.days - b.days)\n                            .map((e, i) => (\n                              <Fragment key={i}>\n                                {i > 0 && \", \"}\n                                {e.status === \"waiting\" ? (\n                                  <span title=\"Waiting for materials\">⚠️{e.days.toFixed(0)}</span >\n                                ) : e.status === \"queued\" ? (\n                                  <span className=\"text-muted-foreground\" title=\"Queued\">({e.days.toFixed(0)})</span >\n                                ) : (\n                                  e.days.toFixed(0)\n                                )}\n                              </Fragment>\n                            ))}\n                        </TableCell>\n                      </TableRow>\n                    ));\n                })()}\n              </TableBody>\n            </Table>\n          )}\n        </AccordionContent>\n      </AccordionItem>\n    </SmartAccordion>\n  );\n}\n",
  "filePath": "terra-invicta-assistant\\src\\app\\game\\current\\fleets-component.tsx"
}
```

**Output:**
```
Wrote file successfully.
```

---

## Assistant (Build · Gemma 4-26B-A4B (local) · 68.3s)

_Thinking:_

Now I'll update `fleets.tsx`.



**Tool: edit**

**Input:**
```json
{
  "filePath": "terra-invicta-assistant\\src\\app\\game\\current\\fleets.tsx",
  "newString": "import { Analysis } from \"@/lib/analysis\";\nimport { NavItem } from \"./types\";\nimport { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from \"@/components/ui/table\";\nimport { Collapsible, CollapsibleContent, CollapsibleTrigger } from \"@/components/ui/collapsible\";\nimport { AccordionContent, AccordionItem, AccordionTrigger } from \"@/components/ui/accordion\";\nimport { SmartAccordion } from \"@/components/ui/smart-accordion\";\nimport { Button } from \"@/components/ui/button\";\nimport { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from \"@/components/ui/tooltip\";\nimport { diffDateTime, sortByDateTime, toDays } from \"@/lib/utils\";\nimport { Fragment } from \"react\";\nimport { FactionIcons, MissionControl } from \"@/components/icons\";\nimport { twMerge } from \"tailwind-merge\";\nimport { FleetsComponent } from \"./fleets-component\";\n\nexport function getFleetsUi(analysis: Analysis): NavItem {\n  const byTarget = analysis.alienFleetsToPlayerOrbits.reduce((acc, fleet) => {\n    const key = fleet.planetName || \"Unknown Orbit\";\n    if (!acc.has(key)) {\n      acc.set(key, []);\n    }\n    acc.get(key)!.push(fleet);\n    return acc;\n  }, new Map<string, typeof analysis.alienFleetsToPlayerOrbits>());\n  const label = [\n    ...byTarget.entries().map(([target, rawFleets]) => {\n      const fleets = rawFleets.filter((f) => f.deltaV > 0 && (f.daysToTarget || 0) > 0);\n      const surv = rawFleets.filter((f) => f.operation === \"AlienEarthSurveillanceOperation\" && !f.arrivalTime);\n      const survInfo = surv.length ? (\n        <>\n          <span className=\"text-white bg-destructive rounded py-2 px-3 font-bold\">\n            {surv\n              .map((f) => f.operationCompleteDays || 0)\n              .reduce((a, b) => Math.min(a, b), 9999999999)\n              .toFixed(0)}\n            d Surveillance\n          </span >{\" \"}\n        </>\n      ) : null;\n      if (fleets.length === 0) {\n        if (survInfo) {\n          return (\n            <span\n              key={target}\n            >\n              {target}: {survInfo}\n            </span >\n          );\n        }\n        return null;\n      }\n      // now that we know the arrival of the first one, find all arriving within 14 days to summarize MC\n      const firstFleet = sortByDateTime(fleets, (f) => f.arrivalTime || analysis.gameCurrentDateTime)[0];\n      const firstFleets = fleets.filter(\n        (f) =>\n          toDays(\n            diffDateTime(\n              f.arrivalTime || analysis.gameCurrentDateTime,\n              firstFleet.arrivalTime || analysis.gameCurrentDateTime,\n            ),\n          ) < 14,\n      );\n      const firstMc = firstFleets.reduce((sum, f) => sum + f.totalMC, 0);\n\n      // tier 2 hab (60d), fusion power, and defense module (90d) take a total of 150 days\n      // tier 3 hab (90d), fusion power, and defense module (180d) take a total of 270 days.\n      // T2 hab should be able to stop a bombard from a 10MC fleet, and T3 is the best we can do anyway, plus the turn time of 30 days should make for enough warning\n      // before that, we'll still have the nameplate warning and can look at details in the fleets tab\n      const warningNeeded = (firstMc > 10 ? 270 : 150) + 30;\n      const daysToTarget = firstFleet.daysToTarget || 0;\n      const farFuture = daysToTarget > warningNeeded;\n      const className = twMerge(\n        farFuture && \"px-1 -mx-1 py-0.5 -my-0.5 rounded bg-green-500\",\n        farFuture &&\n          (daysToTarget < warningNeeded + 50\n            ? \"bg-red-200\"\n            : daysToTarget < warningNeeded + 100\n              ? \"bg-yellow-200\"\n              : \"bg-green-200\"),\n      );\n      return (\n        <span\n          key={target}\n          className={className}\n          title={`${fleets.length} fleet(s) targeting ${target}, arriving in ${daysToTarget.toFixed(\n            0,\n          )} days, using ${firstMc.toFixed(0)} MC`}\n        >\n          {target}\n          {fleets.length > 1 ? `(${fleets.length})` : \"\"}\n          {farFuture ? (\n            \"\"\n          ) : (\n            <>\n              : {daysToTarget.toFixed(0)}d <MissionControl />\n              {firstMc.toFixed(0)}\n            </>\n          )}\n          {survInfo && <>,{survInfo}</>}\n        </span >\n      );\n    }),\n  ].filter((i) => !!i);\n  return {\n    key: \"fleets\",\n    label: (\n      <>\n        Fleets\n        {label.length > 0 ? (\n          <>\n            {\" - \"}\n            {label.map((i, ix) => (\n              <Fragment key={ix}>\n                {i}\n                {ix < label.length - 1 ? \" | \" : \"\"}\n              </Fragment>\n            ))}\n          </>\n        ) : (\n          \"\"\n        )}\n      </>\n    ),\n    content: <FleetsComponent analysis={analysis} />,\n  };\n}\n",
  "oldString": "import { Analysis } from \"@/lib/analysis\";\nimport { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from \"@/components/ui/table\";\nimport { Collapsible, CollapsibleContent, CollapsibleTrigger } from \"@/components/ui/collapsible\";\nimport { AccordionContent, AccordionItem, AccordionTrigger } from \"@/components/ui/accordion\";\nimport { SmartAccordion } from \"@/components/ui/smart-accordion\";\nimport { Button } from \"@/components/ui/button\";\nimport { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from \"@/components/ui/tooltip\";\nimport { diffDateTime, sortByDateTime, toDays } from \"@/lib/utils\";\nimport { Fragment } from \"react/jsx-runtime\";\nimport { FactionIcons, MissionControl } from \"@/components/icons\";\nimport { twMerge } from \"tailwind-merge\";\nimport { FleetsComponent } from \"./fleets-component\"; \n"
}
```

**Error:**
```
Could not find oldString in the file. It must match exactly, including whitespace, indentation, and line endings.
```

---

## Assistant (Build · Gemma 4-26B-A4B (local) · 8.9s)

_Thinking:_

I'll use `Read` to get the exact content of `fleets.tsx`.



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
13: export function getFleetsUi(analysis: Analysis): NavItem {
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
34:           </span >{" "}
35:         </>
36:       ) : null;
37:       if (fleets.length === 0) {
38:         if (survInfo) {
39:           return (
40:             <span
41:               key={target}
42:             >
43:               {target}: {survInfo}
44:             </span >
45:           );
46:         }
47:         return null;
48:       }
49:       // now that we know the arrival of the first one, find all arriving within 14 days to summarize MC
50:       const firstFleet = sortByDateTime(fleets, (f) => f.arrivalTime || analysis.gameCurrentDateTime)[0];
51:       const firstFleets = fleets.filter(
52:         (f) =>
53:           toDays(
54:             diffDateTime(
55:               f.arrivalTime || analysis.gameCurrentDateTime,
56:               firstFleet.arrivalTime || analysis.gameCurrentDateTime,
57:             ),
58:           ) < 14,
59:       );
60:       const firstMc = firstFleets.reduce((sum, f) => sum + f.totalMC, 0);
61: 
62:       // tier 2 hab (60d), fusion power, and defense module (90d) take a total of 150 days
63:       // tier 3 hab (90d), fusion power, and defense module (180d) take a total of 270 days.
64:       // T2 hab should be able to stop a bombard from a 10MC fleet, and T3 is the best we can do anyway, plus the turn time of 30 days should make for enough warning
65:       // before that, we'll still have the nameplate warning and can look at details in the fleets tab
66:       const warningNeeded = (firstMc > 10 ? 270 : 150) + 30;
67:       const daysToTarget = firstFleet.daysToTarget || 0;
68:       const farFuture = daysToTarget > warningNeeded;
69:       const className = twMerge(
70:         farFuture && "px-1 -mx-1 py-0.5 -my-0.5 rounded bg-green-500",
71:         farFuture &&
72:           (daysToTarget < warningNeeded + 50
73:             ? "bg-red-200"
74:             : daysToTarget < warningNeeded + 100
75:               ? "bg-yellow-200"
76:               : "bg-green-200"),
77:       );
78:       return (
79:         <span
80:           key={target}
81:           className={className}
82:           title={`${fleets.length} fleet(s) targeting ${target}, arriving in ${daysToTarget.toFixed(
83:             0,
84:           )} days, using ${firstMc.toFixed(0)} MC`}
85:         >
86:           {target}
87:           {fleets.length > 1 ? `(${fleets.length})` : ""}
88:           {farFuture ? (
89:             ""
90:           ) : (
91:             <>
92:               : {daysToTarget.toFixed(0)}d <MissionControl />
93:               {firstMc.toFixed(0)}
94:             </>
95:           )}
96:           {survInfo && <>,{survInfo}</>}
97:         </span >
98:       );
99:     }),
100:   ].filter((i) => !!i);
101:   return {
102:     key: "fleets",
103:     label: (
104:       <>
105:         Fleets
106:         {label.length > 0 ? (
107:           <>
108:             {" - "}
109:             {label.map((i, ix) => (
110:               <Fragment key={ix}>
111:                 {i}
112:                 {ix < label.length - 1 ? " | " : ""}
113:               </Fragment>
114:             ))}
115:           </>
116:         ) : (
117:           ""
118:         )}
119:       </>
120:     ),
121:     content: <FleetsComponent analysis={analysis} />,
122:   };
123: }
124: 
125:     acc.get(key)!.push(fleet);
126:     return acc;
127:   }, new Map<string, typeof analysis.alienFleetsToPlayerOrbits>());
128:   const label = [
129:     ...byTarget.entries().map(([target, rawFleets]) => {
130:       const fleets = rawFleets.filter((f) => f.deltaV > 0 && (f.daysToTarget || 0) > 0);
131:       const surv = rawFleets.filter((f) => f.operation === "AlienEarthSurveillanceOperation" && !f.arrivalTime);
132:       const survInfo = surv.length ? (
133:         <>
134:           <span className="text-white bg-destructive rounded py-2 px-3 font-bold">
135:             {surv
136:               .map((f) => f.operationCompleteDays || 0)
137:               .reduce((a, b) => Math.min(a, b), 9999999999)
138:               .toFixed(0)}
139:             d Surveillance
140:           </span>{" "}
141:         </>
142:       ) : null;
143:       if (fleets.length === 0) {
144:         if (survInfo) {
145:           return (
146:             <span>
147:               {target}: {survInfo}
148:             </span>
149:           );
150:         }
151:         return null;
152:       }
153:       // now that we know the arrival of the first one, find all arriving within 14 days to summarize MC
154:       const firstFleet = sortByDateTime(fleets, (f) => f.arrivalTime || analysis.gameCurrentDateTime)[0];
155:       const firstFleets = fleets.filter(
156:         (f) =>
157:           toDays(
158:             diffDateTime(
159:               f.arrivalTime || analysis.gameCurrentDateTime,
160:               firstFleet.arrivalTime || analysis.gameCurrentDateTime,
161:             ),
162:           ) < 14,
163:       );
164:       const firstMc = firstFleets.reduce((sum, f) => sum + f.totalMC, 0);
165: 
166:       // tier 2 hab (60d), fusion power, and defense module (90d) take a total of 150 days
167:       // tier 3 hab (90d), fusion power, and defense module (180d) take a total of 270 days.
168:       // T2 hab should be able to stop a bombard from a 10MC fleet, and T3 is the best we can do anyway, plus the turn time of 30 days should make for enough warning
169:       // before that, we'll still have the nameplate warning and can look at details in the fleets tab
170:       const warningNeeded = (firstMc > 10 ? 270 : 150) + 30;
171:       const daysToTarget = firstFleet.daysToTarget || 0;
172:       const farFuture = daysToTarget > warningNeeded;
173:       const className = twMerge(
174:         farFuture && "px-1 -mx-1 py-0.5 -my-0.5 rounded bg-green-500",
175:         farFuture &&
176:           (daysToTarget < warningNeeded + 50
177:             ? "bg-red-200"
178:             : daysToTarget < warningNeeded + 100
179:               ? "bg-yellow-200"
180:               : "bg-green-200"),
181:       );
182:       return (
183:         <span
184:           className={className}
185:           title={`${fleets.length} fleet(s) targeting ${target}, arriving in ${daysToTarget.toFixed(
186:             0,
187:           )} days, using ${firstMc.toFixed(0)} MC`}
188:         >
189:           {target}
190:           {fleets.length > 1 ? `(${fleets.length})` : ""}
191:           {farFuture ? (
192:             ""
193:           ) : (
194:             <>
195:               : {daysToTarget.toFixed(0)}d <MissionControl />
196:               {firstMc.toFixed(0)}
197:             </>
198:           )}
199:           {survInfo && <>,{survInfo}</>}
200:         </span>
201:       );
202:     }),
203:   ].filter((i) => !!i);
204: 
205:   return {
206:     key: "fleets",
207:     tab: (
208:       <>
209:         Fleets
210:         {label.length > 0 ? (
211:           <>
212:             {" - "}
213:             {label.map((i, ix) => (
214:               <Fragment key={ix}>
215:                 {i}
216:                 {ix < label.length - 1 ? " | " : ""}
217:               </Fragment>
218:             ))}
219:           </>
220:         ) : (
221:           ""
222:         )}
223:       </>
224:     ),
225:     content: <FleetsComponent analysis={analysis} />,
226:   };
227: }
228: 
229: function FleetsComponent({ analysis }: { analysis: Analysis }) {
230:   const alienFleets = analysis.alienFleetsToPlayerOrbits;
231:   const humanEnemyFleets = analysis.humanEnemyFleetsToPlayerOrbits;
232:   const playerFleets = analysis.playerFleets;
233:   const shipsUnderConstruction = analysis.playerShipsUnderConstruction;
234: 
235:   return (
236:     <SmartAccordion
237:       type="multiple"
238:       storageKey="fleetsSections"
239:       defaultValue={["alien-fleets", "human-enemy-fleets", "player-fleets", "ships-under-construction"]}
240:     >
241:       {/* Alien Fleets */}
242:       <AccordionItem value="alien-fleets">
243:         <AccordionTrigger>Alien Fleets ({alienFleets.length})</AccordionTrigger>
244:         <AccordionContent>
245:           {alienFleets.length === 0 ? (
246:             <div className="p-4 text-muted-foreground">No alien fleets detected heading to player orbits.</div>
247:           ) : (
248:             <div className="space-y-2">
249:               <p>Tracking planets: {analysis.playerInterestedPlanets.map((p) => p.displayName).join(", ")}</p>
250:               <Table>
251:                 <TableHeader>
252:                   <TableRow>
253:                     <TableHead>Fleet Name</TableHead>
254:                     <TableHead>Planet</TableHead>
255:                     <TableHead>Target Orbit</TableHead>
256:                     <TableHead>Arrival Date</TableHead>
257:                     <TableHead className="text-right">Days to Arrival</TableHead>
258:                     <TableHead className="text-right">MC Used</TableHead>
259:                     <TableHead className="text-right">Marine CP</TableHead>
260:                     <TableHead className="text-right">Total Mass</TableHead>
261:                     <TableHead className="text-right">Max Ship Mass</TableHead>
262:                     <TableHead>Ships Hulls</TableHead>
263:                     <TableHead>Ships Roles</TableHead>
264:                     <TableHead>Operation</TableHead>
265:                     <TableHead>Operation Complete</TableHead>
266:                   </TableRow>
267:                 </TableHeader>
268:                 <TableBody>
269:                   {alienFleets.map((fleet) => (
270:                     <TableRow key={fleet.id} className={twMerge(fleet.deltaV === 0 ? "bg-gray-500/5" : "")}>
271:                       <TableCell className="font-medium">{fleet.displayName}</TableCell>
272:                       <TableCell>{fleet.planetName}</TableCell>
273:                       <TableCell>{fleet.targetOrbitName}</TableCell>
274:                       <TableCell>{fleet.arrivalTimeFormatted || "-"}</TableCell>
275:                       <TableCell className="text-right">
276:                         {fleet.daysToTarget !== null ? `${fleet.daysToTarget.toFixed(0)}` : "—"}
277:                       </TableCell>
278:                       <TableCell className="text-right">{fleet.totalMC.toFixed(0)}</TableCell>
279:                       <TableCell className="text-right">{fleet.marineCombatPower > 0 ? fleet.marineCombatPower : "—"}</TableCell>
280:                       <TableCell className="text-right">{(fleet.totalMass / 1000000).toFixed(0)} Mkg</TableCell>
281:                       <TableCell className="text-right">{(fleet.maxShipMass / 1000000).toFixed(0)} Mkg</TableCell>
282:                       <TableCell className="whitespace-normal">
283:                         {fleet.shipsByHullType.length > 0
284:                           ? fleet.shipsByHullType
285:                               .map((ship) => {
286:                                 const name = `${ship.count} ${ship.hullName.replace("Alien ", "")}${ship.count > 1 ? "s" : ""}`;
287:                                 return ship.avgNoseArmor > 0 ? `${name} (${ship.avgNoseArmor})` : name;
288:                               })
289:                               .join(" + ")
290:                           : "-"}
291:                       </TableCell>
292:                       <TableCell className="whitespace-normal">
293:                         {fleet.shipsByRole.length > 0
294:                           ? fleet.shipsByRole
295:                               .map((ship) => `${ship.count} ${ship.role}${ship.count > 1 ? "s" : ""}`)
296:                               .join(" + ")
297:                           : "-"}
298:                       </TableCell>
299:                       <TableCell>{fleet.operation || "-"}</TableCell>
300:                       <TableCell>
301:                         {fleet.operationComplete
302:                           ? `${fleet.operationComplete}${
303:                               fleet.operationCompleteDays !== null
304:                                 ? ` (${fleet.operationCompleteDays.toFixed(0)}d)`
305:                                 : ""
306:                             }`
307:                           : "-"}
308:                       </TableCell>
309:                     </TableRow>
310:                   ))}
311:                 </TableBody>
312:               </Table>
313: 
314:               {/* Planetary Defense Summary */}
315:               <div className="mt-8">
316:                 <h2 className="text-2xl font-bold mb-4">Planetary Defense Summary</h2>
317:                 <Table>
318:                   <TableHeader>
319:                     <TableRow>
320:                       <TableHead>Planet</TableHead>
321:                       <TableHead className="text-right">Days to Arrival</TableHead>
322:                       <TableHead className="text-right">Alien Fleet MC</TableHead>
323:                       <TableHead className="text-right">Player Fleet MC</TableHead>
324:                       <TableHead>Habs (Active / Potential Combat)</TableHead>
325:                     </TableRow>
326:                   </TableHeader>
327:                   <TableBody>
328:                     {(() => {
329:                       const planetsWithFleets = new Set(
330:                         analysis.alienFleetsToPlayerOrbits.map((f) => f.planetName || "Unknown"),
331:                       );
332:                       const defenseData = Array.from(planetsWithFleets)
333:                         .map((planet) => {
334:                           const fleetsAtPlanet = analysis.alienFleetsToPlayerOrbits.filter(
335:                             (f) => f.planetName === planet,
336:                           );
337:                           const totalAlienMC = fleetsAtPlanet.reduce((sum, f) => sum + (f.totalMC || 0), 0);
338:                           const incomingFleets = fleetsAtPlanet.filter(
339:                             (f) => f.daysToTarget !== null && f.daysToTarget > 0,
340:                           );
341:                           const daysToArrival =
342:                             incomingFleets.length > 0
343:                               ? Math.min(...incomingFleets.map((f) => f.daysToTarget!))
344:                               : null;
345:                           const playerFleetsAtPlanet = analysis.playerFleets.filter(
346:                             (f) => f.planetName === planet,
347:                           );
348:                           const relevantPlayerFleets = playerFleetsAtPlanet.filter((f) => {
349:                             if (f.daysToTarget === null || f.daysToTarget <= 0) return true;
350:                             if (daysToArrival === null) return false;
351:                             return f.daysToTarget < daysToArrival;
352:                           });
353:                           const totalPlayerMC = relevantPlayerFleets.reduce((sum, f) => sum + (f.totalMC || 0), 0);
354:                           const habsAtPlanet = analysis.playerHabs.filter((h) => h.planetName === planet);
355:                           return { planet, totalAlienMC, totalPlayerMC, daysToArrival, habs: habsAtPlanet };
356:                         })
357:                         .filter((d) => d.habs.length > 0)
358:                         .toSorted((a, b) => {
359:                           if (a.daysToArrival === null && b.daysToArrival === null) return 0;
360:                           if (a.daysToArrival === null) return 1;
361:                           if (b.daysToArrival === null) return -1;
362:                           return a.daysToArrival - b.daysToArrival;
363:                         });
364: 
365:                       return defenseData.map(({ planet, totalAlienMC, totalPlayerMC, daysToArrival, habs }) => (
366:                         <TableRow key={planet}>
367:                           <TableCell className="font-medium">{planet}</TableCell>
368:                           <TableCell className="text-right">
369:                             {daysToArrival !== null ? daysToArrival.toFixed(0) : "—"}
370:                           </TableCell>
371:                           <TableCell className="text-right">{totalAlienMC.toFixed(0)}</TableCell>
372:                           <TableCell className="text-right">{totalPlayerMC.toFixed(0)}</TableCell>
373:                           <TableCell>
374:                             <TooltipProvider>
375:                               <div className="flex gap-2 flex-wrap">
376:                                 {habs
377:                                   .toSorted((a, b) => {
378:                                     if (a.habType === "Station" && b.habType !== "Station") return -1;
379:                                     if (a.habType !== "Station" && b.habType === "Station") return 1;
380:                                     return 0;
381:                                   })
382:                                   .map((hab) => {
383:                                     const activeCombat = hab.activeEffects.combatScore || 0;
384:                                     const potentialCombat = hab.potentialEffects.combatScore || 0;
385:                                     const combatDisplay =
386:                                       activeCombat === potentialCombat
387:                                         ? activeCombat.toFixed(0)
388:                                         : `${activeCombat.toFixed(0)} / ${potentialCombat.toFixed(0)}`;
389:                                     const bgColor = hab.habType === "Station" ? "bg-yellow-100" : "bg-green-100";
390:                                     return (
391:                                       <Tooltip key={hab.id}>
392:                                         <TooltipTrigger asChild>
393:                                           <span className={`cursor-help ${bgColor} px-1.5 py-0.5 rounded`}>
394:                                             {combatDisplay}
395:                                           </span>
396:                                         </TooltipTrigger>
397:                                         <TooltipContent>
398:                                           <div>{hab.displayName}</div>
399:                                         </TooltipContent>
400:                                       </Tooltip>
401:                                     );
402:                                   })}
403:                               </div>
404:                             </TooltipProvider>
405:                           </TableCell>
406:                         </TableRow>
407:                       ));
408:                     })()}
409:                   </TableBody>
410:                 </Table>
411:               </div>
412: 
413:               <Collapsible>
414:                 <CollapsibleTrigger asChild>
415:                   <Button>Debug Data</Button>
416:                 </CollapsibleTrigger>
417:                 <CollapsibleContent>
418:                   <pre>{JSON.stringify(alienFleets, null, 2)}</pre>
419:                 </CollapsibleContent>
420:               </Collapsible>
421:             </div>
422:           )}
423:         </AccordionContent>
424:       </AccordionItem>
425: 
426:       {/* Other Human Factions Fleets */}
427:       <AccordionItem value="human-enemy-fleets">
428:         <AccordionTrigger>Other Human Factions ({humanEnemyFleets.length})</AccordionTrigger>
429:         <AccordionContent>
430:           {humanEnemyFleets.length === 0 ? (
431:             <div className="p-4 text-muted-foreground">No other human faction fleets detected heading to player orbits.</div>
432:           ) : (
433:             <Table>
434:               <TableHeader>
435:                 <TableRow>
436:                   <TableHead>Faction</TableHead>
437:                   <TableHead>Fleet Name</TableHead>
438:                   <TableHead>Planet</TableHead>
439:                   <TableHead>Target Orbit</TableHead>
440:                   <TableHead>Arrival Date</TableHead>
441:                   <TableHead className="text-right">Days to Arrival</TableHead>
442:                   <TableHead className="text-right">MC Used</TableHead>
443:                   <TableHead className="text-right">Marine CP</TableHead>
444:                   <TableHead className="text-right">Total Mass</TableHead>
445:                   <TableHead className="text-right">Max Ship Mass</TableHead>
446:                   <TableHead>Ship Hulls</TableHead>
447:                   <TableHead>Ship Roles</TableHead>
448:                   <TableHead>Operation</TableHead>
449:                   <TableHead>Operation Complete</TableHead>
450:                 </TableRow>
451:               </TableHeader>
452:               <TableBody>
453:                 {humanEnemyFleets.map((fleet) => {
454:                   const FactionIcon = fleet.factionTemplateName
455:                     ? FactionIcons[fleet.factionTemplateName as keyof typeof FactionIcons]
456:                     : null;
457:                   return (
458:                     <TableRow key={fleet.id} className={twMerge(fleet.deltaV === 0 ? "bg-gray-500/5" : "")}>
459:                       <TableCell>
460:                         <div className="flex items-center gap-1">
461:                           {FactionIcon && <FactionIcon className="p-1 rounded" />}
462:                           <span className="text-sm">{fleet.factionDisplayName ?? fleet.factionTemplateName ?? "Unknown"}</span>
463:                         </div>
464:                       </TableCell>
465:                       <TableCell className="font-medium">{fleet.displayName}</TableCell>
466:                       <TableCell>{fleet.planetName}</TableCell>
467:                       <TableCell>{fleet.targetOrbitName}</TableCell>
468:                       <TableCell>{fleet.arrivalTimeFormatted || "-"}</TableCell>
469:                       <TableCell className="text-right">
470:                         {fleet.daysToTarget !== null ? `${fleet.daysToTarget.toFixed(0)}` : "—"}
471:                       </TableCell>
472:                       <TableCell className="text-right">{fleet.totalMC.toFixed(0)}</TableCell>
473:                       <TableCell className="text-right">{fleet.marineCombatPower > 0 ? fleet.marineCombatPower : "—"}</TableCell>
474:                       <TableCell className="text-right">{(fleet.totalMass / 1000000).toFixed(0)} Mkg</TableCell>
475:                       <TableCell className="text-right">{(fleet.maxShipMass / 1000000).toFixed(0)} Mkg</TableCell>
476:                       <TableCell className="whitespace-normal">
477:                         {fleet.shipsByHullType.length > 0
478:                           ? fleet.shipsByHullType
479:                               .map((ship) => {
480:                                 const name = `${ship.count} ${ship.hullName}${ship.count > 1 ? "s" : ""}`;
481:                                 return ship.avgNoseArmor > 0 ? `${name} (${ship.avgNoseArmor})` : name;
482:                               })
483:                               .join(" + ")
484:                           : "-"}
485:                       </TableCell>
486:                       <TableCell className="whitespace-normal">
487:                         {fleet.shipsByRole.length > 0
488:                           ? fleet.shipsByRole.map((s) => `${s.count} ${s.role}${s.count > 1 ? "s" : ""}`).join(" + ")
489:                           : "-"}
490:                       </TableCell>
491:                       <TableCell>{fleet.operation || "-"}</TableCell>
492:                       <TableCell>
493:                         {fleet.operationComplete
494:                           ? `${fleet.operationComplete}${fleet.operationCompleteDays !== null ? ` (${fleet.operationCompleteDays.toFixed(0)}d)` : ""}`
495:                           : "-"}
496:                       </TableCell>
497:                     </TableRow>
498:                   );
499:                 })}
500:               </TableBody>
501:             </Table>
502:           )}
503:         </AccordionContent>
504:       </AccordionItem>
505: 
506:       {/* Player Fleets */}
507:       <AccordionItem value="player-fleets">
508:         <AccordionTrigger>Player Fleets ({playerFleets.length})</AccordionTrigger>
509:         <AccordionContent>
510:           {playerFleets.length === 0 ? (
511:             <div className="p-4 text-muted-foreground">No player fleets found.</div>
512:           ) : (
513:             <Table>
514:               <TableHeader>
515:                 <TableRow>
516:                   <TableHead>Fleet Name</TableHead>
517:                   <TableHead>Planet</TableHead>
518:                   <TableHead>Target Orbit</TableHead>
519:                   <TableHead>Arrival Date</TableHead>
520:                   <TableHead className="text-right">Days to Arrival</TableHead>
521:                   <TableHead className="text-right">MC Used</TableHead>
522:                   <TableHead className="text-right">Marine CP</TableHead>
523:                   <TableHead className="text-right">Total Mass</TableHead>
524:                   <TableHead className="text-right">Max Ship Mass</TableHead>
525:                   <TableHead>Ship Hulls</TableHead>
526:                   <TableHead>Ship Classes</TableHead>
527:                 </TableRow>
528:               </TableHeader>
529:               <TableBody>
530:                 {playerFleets.map((fleet) => (
531:                   <TableRow key={fleet.id}>
532:                     <TableCell className="font-medium">{fleet.displayName}</TableCell>
533:                     <TableCell>{fleet.planetName}</TableCell>
534:                     <TableCell>{fleet.targetOrbitName}</TableCell>
535:                     <TableCell>{fleet.arrivalTimeFormatted || "-"}</TableCell>
536:                     <TableCell className="text-right">
537:                       {fleet.daysToTarget !== null ? `${fleet.daysToTarget.toFixed(0)}` : "—"}
538:                     </TableCell>
539:                     <TableCell className="text-right">{fleet.totalMC.toFixed(0)}</TableCell>
540:                     <TableCell className="text-right">{fleet.marineCombatPower > 0 ? fleet.marineCombatPower : "—"}</TableCell>
541:                     <TableCell className="text-right">{(fleet.totalMass / 1000000).toFixed(0)} Mkg</TableCell>
542:                     <TableCell className="text-right">{(fleet.maxShipMass / 1000000).toFixed(0)} Mkg</TableCell>
543:                     <TableCell className="whitespace-normal">
544:                       {fleet.shipsByHullType.length > 0
545:                         ? fleet.shipsByHullType.map((ship, i) => (
546:                             <Fragment key={ship.hullName}>
547:                               {i > 0 && <br />}
548:                               {ship.count} {ship.hullName}
549:                               {ship.count > 1 ? "s" : ""}
550:                             </Fragment>
551:                           ))
552:                         : "-"}
553:                     </TableCell>
554:                     <TableCell className="whitespace-normal">
555:                       {fleet.shipsByClass.length > 0
556:                         ? fleet.shipsByClass.map((cls, i) => (
557:                             <Fragment key={cls.className}>
558:                               {i > 0 && <br />}
559:                               {cls.count}× {cls.className}{cls.noseArmor > 0 ? ` (${cls.noseArmor})` : ""}
560:                             </Fragment>
561:                           ))
562:                         : "-"}
563:                     </TableCell>
564:                   </TableRow>
565:                 ))}
566:               </TableBody>
567:             </Table>
568:           )}
569:         </AccordionContent>
570:       </AccordionItem>
571: 
572:       {/* Ships Under Construction */}
573:       <AccordionItem value="ships-under-construction">
574:         <AccordionTrigger>Ships Under Construction ({shipsUnderConstruction.length})</AccordionTrigger>
575:         <AccordionContent>
576:           {shipsUnderConstruction.length === 0 ? (
577:             <div className="p-4 text-muted-foreground">No ships under construction.</div>
578:           ) : (
579:             <Table>
580:               <TableHeader>
581:                 <TableRow>
582:                   <TableHead>Planet</TableHead>
583:                   <TableHead>Design</TableHead>
584:                   <TableHead>Hull</TableHead>
585:                   <TableHead className="text-right">Nose Armor</TableHead>
586:                   <TableHead className="text-right">Count</TableHead>
587:                   <TableHead>Days to Complete</TableHead>
588:                 </TableRow>
589:               </TableHeader>
590:               <TableBody>
591:                 {(() => {
592:                   const byPlanetDesign = shipsUnderConstruction.reduce((acc, ship) => {
593:                     const key = `${ship.planetName}||${ship.designName}`;
594:                     if (!acc.has(key))
595:                       acc.set(key, {
596:                         planetName: ship.planetName,
597:                         designName: ship.designName,
598:                         hullName: ship.hullName,
599:                         noseArmor: ship.noseArmor,
600:                         entries: [] as { days: number; status: "building" | "queued" | "waiting" }[],
601:                       });
602:                     acc.get(key)!.entries.push({ days: ship.daysToCompletion, status: ship.status });
603:                     return acc;
604:                   }, new Map<string, { planetName: string; designName: string; hullName: string; noseArmor: number; entries: { days: number; status: "building" | "queued" | "waiting" }[] }>());
605: 
606:                   return [...byPlanetDesign.values()]
607:                     .toSorted((a, b) => a.planetName.localeCompare(b.planetName) || a.designName.localeCompare(b.designName))
608:                     .map(({ planetName, designName, hullName, noseArmor, entries }) => (
609:                       <TableRow key={`${planetName}||${designName}`}>
610:                         <TableCell>{planetName}</TableCell>
611:                         <TableCell className="font-medium">{designName}</TableCell>
612:                         <TableCell>{hullName}</TableCell>
613:                         <TableCell className="text-right">{noseArmor > 0 ? noseArmor : "-"}</TableCell>
614:                         <TableCell className="text-right">{entries.length}</TableCell>
615:                         <TableCell>
616:                           {entries
617:                             .toSorted((a, b) => a.days - b.days)
618:                             .map((e, i) => (
619:                               <Fragment key={i}>
620:                                 {i > 0 && ", "}
621:                                 {e.status === "waiting" ? (
622:                                   <span title="Waiting for materials">⚠️{e.days.toFixed(0)}</span>
623:                                 ) : e.status === "queued" ? (
624:                                   <span className="text-muted-foreground" title="Queued">({e.days.toFixed(0)})</span>
625:                                 ) : (
626:                                   e.days.toFixed(0)
627:                                 )}
628:                               </Fragment>
629:                             ))}
630:                         </TableCell>
631:                       </TableRow>
632:                     ));
633:                 })()}
634:               </TableBody>
635:             </Table>
636:           )}
637:         </AccordionContent>
638:       </AccordionItem>
639:     </SmartAccordion>
640:   );
641: }

(End of file - total 641 lines)
</content>
```

---

## Assistant (Build · Gemma 4-26B-A4B (local) · 32.7s)

_Thinking:_

Okay, I'll start by creating `src/app/game/current/fleets-component.tsx` with the content of `FleetsComponent` from `fleets.tsx`.

Wait, I'll just use `Write` for the whole content of `fleets-component.tsx`.

I'll also need to update `fleets.tsx` to import `NavItem` and `FleetsComponent`.

Wait, I'll do this:
1. Create `src/app/game/current/fleets-component.tsx`.
2. Update `src/app/game/current/fleets.tsx`.

Wait, I need to make sure I have the right content for `fleets-component.tsx`.

The original content of `fleets.tsx` from line 124 to 641 is `FleetsComponent`.

Wait, line 124 is:
`124:     acc.get(key)!.push(fleet);`
This is part of a reduce function. The `FleetsComponent` starts at line 229.

So I'll take from line 229 to 641.

Wait, I'll just use `Read` with offset to get the `FleetsComponent` content accurately.



**Tool: read**

**Input:**
```json
{
  "filePath": "terra-invicta-assistant\\src\\app\\game\\current\\fleets.tsx",
  "limit": 500,
  "offset": 228
}
```

**Output:**
```
<path>terra-invicta-assistant\src\app\game\current\fleets.tsx</path>
<type>file</type>
<content>
228: 
229: function FleetsComponent({ analysis }: { analysis: Analysis }) {
230:   const alienFleets = analysis.alienFleetsToPlayerOrbits;
231:   const humanEnemyFleets = analysis.humanEnemyFleetsToPlayerOrbits;
232:   const playerFleets = analysis.playerFleets;
233:   const shipsUnderConstruction = analysis.playerShipsUnderConstruction;
234: 
235:   return (
236:     <SmartAccordion
237:       type="multiple"
238:       storageKey="fleetsSections"
239:       defaultValue={["alien-fleets", "human-enemy-fleets", "player-fleets", "ships-under-construction"]}
240:     >
241:       {/* Alien Fleets */}
242:       <AccordionItem value="alien-fleets">
243:         <AccordionTrigger>Alien Fleets ({alienFleets.length})</AccordionTrigger>
244:         <AccordionContent>
245:           {alienFleets.length === 0 ? (
246:             <div className="p-4 text-muted-foreground">No alien fleets detected heading to player orbits.</div>
247:           ) : (
248:             <div className="space-y-2">
249:               <p>Tracking planets: {analysis.playerInterestedPlanets.map((p) => p.displayName).join(", ")}</p>
250:               <Table>
251:                 <TableHeader>
252:                   <TableRow>
253:                     <TableHead>Fleet Name</TableHead>
254:                     <TableHead>Planet</TableHead>
255:                     <TableHead>Target Orbit</TableHead>
256:                     <TableHead>Arrival Date</TableHead>
257:                     <TableHead className="text-right">Days to Arrival</TableHead>
258:                     <TableHead className="text-right">MC Used</TableHead>
259:                     <TableHead className="text-right">Marine CP</TableHead>
260:                     <TableHead className="text-right">Total Mass</TableHead>
261:                     <TableHead className="text-right">Max Ship Mass</TableHead>
262:                     <TableHead>Ships Hulls</TableHead>
263:                     <TableHead>Ships Roles</TableHead>
264:                     <TableHead>Operation</TableHead>
265:                     <TableHead>Operation Complete</TableHead>
266:                   </TableRow>
267:                 </TableHeader>
268:                 <TableBody>
269:                   {alienFleets.map((fleet) => (
270:                     <TableRow key={fleet.id} className={twMerge(fleet.deltaV === 0 ? "bg-gray-500/5" : "")}>
271:                       <TableCell className="font-medium">{fleet.displayName}</TableCell>
272:                       <TableCell>{fleet.planetName}</TableCell>
273:                       <TableCell>{fleet.targetOrbitName}</TableCell>
274:                       <TableCell>{fleet.arrivalTimeFormatted || "-"}</TableCell>
275:                       <TableCell className="text-right">
276:                         {fleet.daysToTarget !== null ? `${fleet.daysToTarget.toFixed(0)}` : "—"}
277:                       </TableCell>
278:                       <TableCell className="text-right">{fleet.totalMC.toFixed(0)}</TableCell>
279:                       <TableCell className="text-right">{fleet.marineCombatPower > 0 ? fleet.marineCombatPower : "—"}</TableCell>
280:                       <TableCell className="text-right">{(fleet.totalMass / 1000000).toFixed(0)} Mkg</TableCell>
281:                       <TableCell className="text-right">{(fleet.maxShipMass / 1000000).toFixed(0)} Mkg</TableCell>
282:                       <TableCell className="whitespace-normal">
283:                         {fleet.shipsByHullType.length > 0
284:                           ? fleet.shipsByHullType
285:                               .map((ship) => {
286:                                 const name = `${ship.count} ${ship.hullName.replace("Alien ", "")}${ship.count > 1 ? "s" : ""}`;
287:                                 return ship.avgNoseArmor > 0 ? `${name} (${ship.avgNoseArmor})` : name;
288:                               })
289:                               .join(" + ")
290:                           : "-"}
291:                       </TableCell>
292:                       <TableCell className="whitespace-normal">
293:                         {fleet.shipsByRole.length > 0
294:                           ? fleet.shipsByRole
295:                               .map((ship) => `${ship.count} ${ship.role}${ship.count > 1 ? "s" : ""}`)
296:                               .join(" + ")
297:                           : "-"}
298:                       </TableCell>
299:                       <TableCell>{fleet.operation || "-"}</TableCell>
300:                       <TableCell>
301:                         {fleet.operationComplete
302:                           ? `${fleet.operationComplete}${
303:                               fleet.operationCompleteDays !== null
304:                                 ? ` (${fleet.operationCompleteDays.toFixed(0)}d)`
305:                                 : ""
306:                             }`
307:                           : "-"}
308:                       </TableCell>
309:                     </TableRow>
310:                   ))}
311:                 </TableBody>
312:               </Table>
313: 
314:               {/* Planetary Defense Summary */}
315:               <div className="mt-8">
316:                 <h2 className="text-2xl font-bold mb-4">Planetary Defense Summary</h2>
317:                 <Table>
318:                   <TableHeader>
319:                     <TableRow>
320:                       <TableHead>Planet</TableHead>
321:                       <TableHead className="text-right">Days to Arrival</TableHead>
322:                       <TableHead className="text-right">Alien Fleet MC</TableHead>
323:                       <TableHead className="text-right">Player Fleet MC</TableHead>
324:                       <TableHead>Habs (Active / Potential Combat)</TableHead>
325:                     </TableRow>
326:                   </TableHeader>
327:                   <TableBody>
328:                     {(() => {
329:                       const planetsWithFleets = new Set(
330:                         analysis.alienFleetsToPlayerOrbits.map((f) => f.planetName || "Unknown"),
331:                       );
332:                       const defenseData = Array.from(planetsWithFleets)
333:                         .map((planet) => {
334:                           const fleetsAtPlanet = analysis.alienFleetsToPlayerOrbits.filter(
335:                             (f) => f.planetName === planet,
336:                           );
337:                           const totalAlienMC = fleetsAtPlanet.reduce((sum, f) => sum + (f.totalMC || 0), 0);
338:                           const incomingFleets = fleetsAtPlanet.filter(
339:                             (f) => f.daysToTarget !== null && f.daysToTarget > 0,
340:                           );
341:                           const daysToArrival =
342:                             incomingFleets.length > 0
343:                               ? Math.min(...incomingFleets.map((f) => f.daysToTarget!))
344:                               : null;
345:                           const playerFleetsAtPlanet = analysis.playerFleets.filter(
346:                             (f) => f.planetName === planet,
347:                           );
348:                           const relevantPlayerFleets = playerFleetsAtPlanet.filter((f) => {
349:                             if (f.daysToTarget === null || f.daysToTarget <= 0) return true;
350:                             if (daysToArrival === null) return false;
351:                             return f.daysToTarget < daysToArrival;
352:                           });
353:                           const totalPlayerMC = relevantPlayerFleets.reduce((sum, f) => sum + (f.totalMC || 0), 0);
354:                           const habsAtPlanet = analysis.playerHabs.filter((h) => h.planetName === planet);
355:                           return { planet, totalAlienMC, totalPlayerMC, daysToArrival, habs: habsAtPlanet };
356:                         })
357:                         .filter((d) => d.habs.length > 0)
358:                         .toSorted((a, b) => {
359:                           if (a.daysToArrival === null && b.daysToArrival === null) return 0;
360:                           if (a.daysToArrival === null) return 1;
361:                           if (b.daysToArrival === null) return -1;
362:                           return a.daysToArrival - b.daysToArrival;
363:                         });
364: 
365:                       return defenseData.map(({ planet, totalAlienMC, totalPlayerMC, daysToArrival, habs }) => (
366:                         <TableRow key={planet}>
367:                           <TableCell className="font-medium">{planet}</TableCell>
368:                           <TableCell className="text-right">
369:                             {daysToArrival !== null ? daysToArrival.toFixed(0) : "—"}
370:                           </TableCell>
371:                           <TableCell className="text-right">{totalAlienMC.toFixed(0)}</TableCell>
372:                           <TableCell className="text-right">{totalPlayerMC.toFixed(0)}</TableCell>
373:                           <TableCell>
374:                             <TooltipProvider>
375:                               <div className="flex gap-2 flex-wrap">
376:                                 {habs
377:                                   .toSorted((a, b) => {
378:                                     if (a.habType === "Station" && b.habType !== "Station") return -1;
379:                                     if (a.habType !== "Station" && b.habType === "Station") return 1;
380:                                     return 0;
381:                                   })
382:                                   .map((hab) => {
383:                                     const activeCombat = hab.activeEffects.combatScore || 0;
384:                                     const potentialCombat = hab.potentialEffects.combatScore || 0;
385:                                     const combatDisplay =
386:                                       activeCombat === potentialCombat
387:                                         ? activeCombat.toFixed(0)
388:                                         : `${activeCombat.toFixed(0)} / ${potentialCombat.toFixed(0)}`;
389:                                     const bgColor = hab.habType === "Station" ? "bg-yellow-100" : "bg-green-100";
390:                                     return (
391:                                       <Tooltip key={hab.id}>
392:                                         <TooltipTrigger asChild>
393:                                           <span className={`cursor-help ${bgColor} px-1.5 py-0.5 rounded`}>
394:                                             {combatDisplay}
395:                                           </span>
396:                                         </TooltipTrigger>
397:                                         <TooltipContent>
398:                                           <div>{hab.displayName}</div>
399:                                         </TooltipContent>
400:                                       </Tooltip>
401:                                     );
402:                                   })}
403:                               </div>
404:                             </TooltipProvider>
405:                           </TableCell>
406:                         </TableRow>
407:                       ));
408:                     })()}
409:                   </TableBody>
410:                 </Table>
411:               </div>
412: 
413:               <Collapsible>
414:                 <CollapsibleTrigger asChild>
415:                   <Button>Debug Data</Button>
416:                 </CollapsibleTrigger>
417:                 <CollapsibleContent>
418:                   <pre>{JSON.stringify(alienFleets, null, 2)}</pre>
419:                 </CollapsibleContent>
420:               </Collapsible>
421:             </div>
422:           )}
423:         </AccordionContent>
424:       </AccordionItem>
425: 
426:       {/* Other Human Factions Fleets */}
427:       <AccordionItem value="human-enemy-fleets">
428:         <AccordionTrigger>Other Human Factions ({humanEnemyFleets.length})</AccordionTrigger>
429:         <AccordionContent>
430:           {humanEnemyFleets.length === 0 ? (
431:             <div className="p-4 text-muted-foreground">No other human faction fleets detected heading to player orbits.</div>
432:           ) : (
433:             <Table>
434:               <TableHeader>
435:                 <TableRow>
436:                   <TableHead>Faction</TableHead>
437:                   <TableHead>Fleet Name</TableHead>
438:                   <TableHead>Planet</TableHead>
439:                   <TableHead>Target Orbit</TableHead>
440:                   <TableHead>Arrival Date</TableHead>
441:                   <TableHead className="text-right">Days to Arrival</TableHead>
442:                   <TableHead className="text-right">MC Used</TableHead>
443:                   <TableHead className="text-right">Marine CP</TableHead>
444:                   <TableHead className="text-right">Total Mass</TableHead>
445:                   <TableHead className="text-right">Max Ship Mass</TableHead>
446:                   <TableHead>Ship Hulls</TableHead>
447:                   <TableHead>Ship Roles</TableHead>
448:                   <TableHead>Operation</TableHead>
449:                   <TableHead>Operation Complete</TableHead>
450:                 </TableRow>
451:               </TableHeader>
452:               <TableBody>
453:                 {humanEnemyFleets.map((fleet) => {
454:                   const FactionIcon = fleet.factionTemplateName
455:                     ? FactionIcons[fleet.factionTemplateName as keyof typeof FactionIcons]
456:                     : null;
457:                   return (
458:                     <TableRow key={fleet.id} className={twMerge(fleet.deltaV === 0 ? "bg-gray-500/5" : "")}>
459:                       <TableCell>
460:                         <div className="flex items-center gap-1">
461:                           {FactionIcon && <FactionIcon className="p-1 rounded" />}
462:                           <span className="text-sm">{fleet.factionDisplayName ?? fleet.factionTemplateName ?? "Unknown"}</span>
463:                         </div>
464:                       </TableCell>
465:                       <TableCell className="font-medium">{fleet.displayName}</TableCell>
466:                       <TableCell>{fleet.planetName}</TableCell>
467:                       <TableCell>{fleet.targetOrbitName}</TableCell>
468:                       <TableCell>{fleet.arrivalTimeFormatted || "-"}</TableCell>
469:                       <TableCell className="text-right">
470:                         {fleet.daysToTarget !== null ? `${fleet.daysToTarget.toFixed(0)}` : "—"}
471:                       </TableCell>
472:                       <TableCell className="text-right">{fleet.totalMC.toFixed(0)}</TableCell>
473:                       <TableCell className="text-right">{fleet.marineCombatPower > 0 ? fleet.marineCombatPower : "—"}</TableCell>
474:                       <TableCell className="text-right">{(fleet.totalMass / 1000000).toFixed(0)} Mkg</TableCell>
475:                       <TableCell className="text-right">{(fleet.maxShipMass / 1000000).toFixed(0)} Mkg</TableCell>
476:                       <TableCell className="whitespace-normal">
477:                         {fleet.shipsByHullType.length > 0
478:                           ? fleet.shipsByHullType
479:                               .map((ship) => {
480:                                 const name = `${ship.count} ${ship.hullName}${ship.count > 1 ? "s" : ""}`;
481:                                 return ship.avgNoseArmor > 0 ? `${name} (${ship.avgNoseArmor})` : name;
482:                               })
483:                               .join(" + ")
484:                           : "-"}
485:                       </TableCell>
486:                       <TableCell className="whitespace-normal">
487:                         {fleet.shipsByRole.length > 0
488:                           ? fleet.shipsByRole.map((s) => `${s.count} ${s.role}${s.count > 1 ? "s" : ""}`).join(" + ")
489:                           : "-"}
490:                       </TableCell>
491:                       <TableCell>{fleet.operation || "-"}</TableCell>
492:                       <TableCell>
493:                         {fleet.operationComplete
494:                           ? `${fleet.operationComplete}${fleet.operationCompleteDays !== null ? ` (${fleet.operationCompleteDays.toFixed(0)}d)` : ""}`
495:                           : "-"}
496:                       </TableCell>
497:                     </TableRow>
498:                   );
499:                 })}
500:               </TableBody>
501:             </Table>
502:           )}
503:         </AccordionContent>
504:       </AccordionItem>
505: 
506:       {/* Player Fleets */}
507:       <AccordionItem value="player-fleets">
508:         <AccordionTrigger>Player Fleets ({playerFleets.length})</AccordionTrigger>
509:         <AccordionContent>
510:           {playerFleets.length === 0 ? (
511:             <div className="p-4 text-muted-foreground">No player fleets found.</div>
512:           ) : (
513:             <Table>
514:               <TableHeader>
515:                 <TableRow>
516:                   <TableHead>Fleet Name</TableHead>
517:                   <TableHead>Planet</TableHead>
518:                   <TableHead>Target Orbit</TableHead>
519:                   <TableHead>Arrival Date</TableHead>
520:                   <TableHead className="text-right">Days to Arrival</TableHead>
521:                   <TableHead className="text-right">MC Used</TableHead>
522:                   <TableHead className="text-right">Marine CP</TableHead>
523:                   <TableHead className="text-right">Total Mass</TableHead>
524:                   <TableHead className="text-right">Max Ship Mass</TableHead>
525:                   <TableHead>Ship Hulls</TableHead>
526:                   <TableHead>Ship Classes</TableHead>
527:                 </TableRow>
528:               </TableHeader>
529:               <TableBody>
530:                 {playerFleets.map((fleet) => (
531:                   <TableRow key={fleet.id}>
532:                     <TableCell className="font-medium">{fleet.displayName}</TableCell>
533:                     <TableCell>{fleet.planetName}</TableCell>
534:                     <TableCell>{fleet.targetOrbitName}</TableCell>
535:                     <TableCell>{fleet.arrivalTimeFormatted || "-"}</TableCell>
536:                     <TableCell className="text-right">
537:                       {fleet.daysToTarget !== null ? `${fleet.daysToTarget.toFixed(0)}` : "—"}
538:                     </TableCell>
539:                     <TableCell className="text-right">{fleet.totalMC.toFixed(0)}</TableCell>
540:                     <TableCell className="text-right">{fleet.marineCombatPower > 0 ? fleet.marineCombatPower : "—"}</TableCell>
541:                     <TableCell className="text-right">{(fleet.totalMass / 1000000).toFixed(0)} Mkg</TableCell>
542:                     <TableCell className="text-right">{(fleet.maxShipMass / 1000000).toFixed(0)} Mkg</TableCell>
543:                     <TableCell className="whitespace-normal">
544:                       {fleet.shipsByHullType.length > 0
545:                         ? fleet.shipsByHullType.map((ship, i) => (
546:                             <Fragment key={ship.hullName}>
547:                               {i > 0 && <br />}
548:                               {ship.count} {ship.hullName}
549:                               {ship.count > 1 ? "s" : ""}
550:                             </Fragment>
551:                           ))
552:                         : "-"}
553:                     </TableCell>
554:                     <TableCell className="whitespace-normal">
555:                       {fleet.shipsByClass.length > 0
556:                         ? fleet.shipsByClass.map((cls, i) => (
557:                             <Fragment key={cls.className}>
558:                               {i > 0 && <br />}
559:                               {cls.count}× {cls.className}{cls.noseArmor > 0 ? ` (${cls.noseArmor})` : ""}
560:                             </Fragment>
561:                           ))
562:                         : "-"}
563:                     </TableCell>
564:                   </TableRow>
565:                 ))}
566:               </TableBody>
567:             </Table>
568:           )}
569:         </AccordionContent>
570:       </AccordionItem>
571: 
572:       {/* Ships Under Construction */}
573:       <AccordionItem value="ships-under-construction">
574:         <AccordionTrigger>Ships Under Construction ({shipsUnderConstruction.length})</AccordionTrigger>
575:         <AccordionContent>
576:           {shipsUnderConstruction.length === 0 ? (
577:             <div className="p-4 text-muted-foreground">No ships under construction.</div>
578:           ) : (
579:             <Table>
580:               <TableHeader>
581:                 <TableRow>
582:                   <TableHead>Planet</TableHead>
583:                   <TableHead>Design</TableHead>
584:                   <TableHead>Hull</TableHead>
585:                   <TableHead className="text-right">Nose Armor</TableHead>
586:                   <TableHead className="text-right">Count</TableHead>
587:                   <TableHead>Days to Complete</TableHead>
588:                 </TableRow>
589:               </TableHeader>
590:               <TableBody>
591:                 {(() => {
592:                   const byPlanetDesign = shipsUnderConstruction.reduce((acc, ship) => {
593:                     const key = `${ship.planetName}||${ship.designName}`;
594:                     if (!acc.has(key))
595:                       acc.set(key, {
596:                         planetName: ship.planetName,
597:                         designName: ship.designName,
598:                         hullName: ship.hullName,
599:                         noseArmor: ship.noseArmor,
600:                         entries: [] as { days: number; status: "building" | "queued" | "waiting" }[],
601:                       });
602:                     acc.get(key)!.entries.push({ days: ship.daysToCompletion, status: ship.status });
603:                     return acc;
604:                   }, new Map<string, { planetName: string; designName: string; hullName: string; noseArmor: number; entries: { days: number; status: "building" | "queued" | "waiting" }[] }>());
605: 
606:                   return [...byPlanetDesign.values()]
607:                     .toSorted((a, b) => a.planetName.localeCompare(b.planetName) || a.designName.localeCompare(b.designName))
608:                     .map(({ planetName, designName, hullName, noseArmor, entries }) => (
609:                       <TableRow key={`${planetName}||${designName}`}>
610:                         <TableCell>{planetName}</TableCell>
611:                         <TableCell className="font-medium">{designName}</TableCell>
612:                         <TableCell>{hullName}</TableCell>
613:                         <TableCell className="text-right">{noseArmor > 0 ? noseArmor : "-"}</TableCell>
614:                         <TableCell className="text-right">{entries.length}</TableCell>
615:                         <TableCell>
616:                           {entries
617:                             .toSorted((a, b) => a.days - b.days)
618:                             .map((e, i) => (
619:                               <Fragment key={i}>
620:                                 {i > 0 && ", "}
621:                                 {e.status === "waiting" ? (
622:                                   <span title="Waiting for materials">⚠️{e.days.toFixed(0)}</span>
623:                                 ) : e.status === "queued" ? (
624:                                   <span className="text-muted-foreground" title="Queued">({e.days.toFixed(0)})</span>
625:                                 ) : (
626:                                   e.days.toFixed(0)
627:                                 )}
628:                               </Fragment>
629:                             ))}
630:                         </TableCell>
631:                       </TableRow>
632:                     ));
633:                 })()}
634:               </TableBody>
635:             </Table>
636:           )}
637:         </AccordionContent>
638:       </AccordionItem>
639:     </SmartAccordion>
640:   );
641: }

(End of file - total 641 lines)
</content>
```

---

## Assistant (Build · Gemma 4-26B-A4B (local) · 193.5s)

_Thinking:_

Okay, I'll create `src/app/game/current/fleets-component.tsx` first.



**Tool: write**

**Input:**
```json
{
  "content": "import { Analysis } from \"@/lib/analysis\";\nimport { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from \"@/components/ui/table\";\nimport { Collapsible, CollapsibleContent, CollapsibleTrigger } from \"@/components/ui/collapsible\";\nimport { AccordionContent, AccordionItem, AccordionTrigger } from \"@/components/ui/accordion\";\nimport { SmartAccordion } from \"@/components/ui/smart-accordion\";\nimport { Button } from \"@/components/ui/button\";\nimport { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from \"@/components/ui/tooltip\";\nimport { diffDateTime, sortByDateTime, toDays } from \"@/lib/utils\";\nimport { Fragment } from \"react\";\nimport { FactionIcons, MissionControl } from \"@/components/icons\";\nimport { twMerge } from \"tailwind-merge\";\n\nexport function FleetsComponent({ analysis }: { analysis: Analysis }) {\n  const alienFleets = analysis.alienFleetsToPlayerOrbits;\n  const humanEnemyFleets = analysis.humanEnemyFleetsToPlayerOrbits;\n  const playerFleets = analysis.playerFleets;\n  const shipsUnderConstruction = analysis.playerShipsUnderConstruction;\n\n  return (\n    <SmartAccordion\n      type=\"multiple\"\n      storageKey=\"fleetsSections\"\n      defaultValue={[\"alien-fleets\", \"human-enemy-fleets\", \"player-fleets\", \"ships-under-construction\"]}\n    >\n      {/* Alien Fleets */}\n      <AccordionItem value=\"alien-fleets\">\n        <AccordionTrigger>Alien Fleets ({alienFleets.length})</AccordionTrigger>\n        <AccordionContent>\n          {alienFleets.length === 0 ? (\n            <div className=\"p-4 text-muted-foreground\">No alien fleets detected heading to player orbits.</div >\n          ) : (\n            <div className=\"space-y-2\">\n              <p>Tracking planets: {analysis.playerInterestedPlanets.map((p) => p.displayName).join(\", \")}</p>\n              <Table>\n                <TableHeader>\n                  <TableRow>\n                    <TableHead>Fleet Name</TableHead>\n                    <TableHead>Planet</TableHead>\n                    <TableHead>Target Orbit</TableHead>\n                    <TableHead>Arrival Date</TableHead>\n                    <TableHead className=\"text-right\">Days to Arrival</TableHead>\n                    <TableHead className=\"text-right\">MC Used</TableHead>\n                    <TableHead className=\"text-right\">Marine CP</TableHead>\n                    <TableHead className=\"text-right\">Total Mass</TableHead>\n                    <TableHead className=\"text-right\">Max Ship Mass</TableHead>\n                    <TableHead>Ships Hulls</TableHead>\n                    <TableHead>Ships Roles</TableHead>\n                    <TableHead>Operation</TableHead>\n                    <TableHead>Operation Complete</TableHead>\n                  </TableRow>\n                </TableHeader>\n                <TableBody>\n                  {alienFleets.map((fleet) => (\n                    <TableRow key={fleet.id} className={twMerge(fleet.deltaV === 0 ? \"bg-gray-500/5\" : \"\")}>\n                      <TableCell className=\"font-medium\">{fleet.displayName}</TableCell>\n                      <TableCell>{fleet.planetName}</TableCell>\n                      <TableCell>{fleet.targetOrbitName}</TableCell>\n                      <TableCell>{fleet.arrivalTimeFormatted || \"-\"}</TableCell>\n                      <TableCell className=\"text-right\">\n                        {fleet.daysToTarget !== null ? `${fleet.daysToTarget.toFixed(0)}` : \"—\"}\n                      </TableCell>\n                      <TableCell className=\"text-right\">{fleet.totalMC.toFixed(0)}</TableCell>\n                      <TableCell className=\"text-right\">{fleet.marineCombatPower > 0 ? fleet.marineCombatPower : \"—\"}</TableCell>\n                      <TableCell className=\"text-right\">{(fleet.totalMass / 1000000).toFixed(0)} Mkg</TableCell>\n                      <TableCell className=\"text-right\">{(fleet.maxShipMass / 1000000).toFixed(0)} Mkg</TableCell>\n                      <TableCell className=\"whitespace-normal\">\n                        {fleet.shipsByHullType.length > 0\n                          ? fleet.shipsByHullType\n                              .map((ship) => {\n                                const name = `${ship.count} ${ship.hullName.replace(\"Alien \", \"\")}${ship.count > 1 ? \"s\" : \"\"}`;\n                                return ship.avgNoseArmor > 0 ? `${name} (${ship.avgNoseArmor})` : name;\n                              })\n                              .join(\" + \")\n                          : \"-\"}\n                      </TableCell>\n                      <TableCell className=\"whitespace-normal\">\n                        {fleet.shipsByRole.length > 0\n                          ? fleet.shipsByRole\n                              .map((ship) => `${ship.count} ${ship.role}${ship.count > 1 ? \"s\" : \"\"}`)\n                              .join(\" + \")\n                          : \"-\"}\n                      </TableCell>\n                      <TableCell>{fleet.operation || \"-\"}</TableCell>\n                      <TableCell>\n                        {fleet.operationComplete\n                          ? `${fleet.operationComplete}${fleet.operationCompleteDays !== null ? ` (${fleet.operationCompleteDays.toFixed(0)}d)` : \"\"}`\n                          : \"-\"}\n                      </TableCell>\n                    </TableRow>\n                  ))}\n                </TableBody>\n              </Table>\n\n              {/* Planetary Defense Summary */}\n              <div className=\"mt-8\">\n                <h2 className=\"text-2xl font-bold mb-4\">Planetary Defense Summary</h2>\n                <Table>\n                  <TableHeader>\n                    <TableRow>\n                      <TableHead>Planet</TableHead>\n                      <TableHead className=\"text-right\">Days to Arrival</TableHead>\n                      <TableHead className=\"text-right\">Alien Fleet MC</TableHead>\n                      <TableHead className=\"text-right\">Player Fleet MC</TableHead>\n                      <TableHead>Habs (Active / Potential Combat)</TableHead>\n                    </TableRow>\n                  </TableHeader>\n                  <TableBody>\n                    {(() => {\n                      const planetsWithFleets = new Set(\n                        analysis.alienFleetsToPlayerOrbits.map((f) => f.planetName || \"Unknown\"),\n                      );\n                      const defenseData = Array.from(planetsWithFleets)\n                        .map((planet) => {\n                          const fleetsAtPlanet = analysis.alienFleetsToPlayerOrbits.filter(\n                            (f) => f.planetName === planet,\n                          );\n                          const totalAlienMC = fleetsAtPlanet.reduce((sum, f) => sum + (f.totalMC || 0), 0);\n                          const incomingFleets = fleetsAtPlanet.filter(\n                            (f) => f.daysToTarget !== null && f.daysToTarget > 0,\n                          );\n                          const daysToArrival =\n                            incomingFleets.length > 0\n                              ? Math.min(...incomingFleets.map((f) => f.daysToTarget!))\n                              : null;\n                          const playerFleetsAtPlanet = analysis.playerFleets.filter(\n                            (f) => f.planetName === planet,\n                          );\n                          const relevantPlayerFleets = playerFleetsAtPlanet.filter((f) => {\n                            if (f.daysToTarget === null || f.daysToTarget <= 0) return true;\n                            if (daysToArrival === null) return false;\n                            return f.daysToTarget < daysToArrival;\n                          });\n                          const totalPlayerMC = relevantPlayerFleets.reduce((sum, f) => sum + (f.totalMC || 0), 0);\n                          const habsAtPlanet = analysis.playerHabs.filter((h) => h.planetName === planet);\n                          return { planet, totalAlienMC, totalPlayerMC, daysToArrival, habs: habsAtPlanet };\n                        })\n                        .filter((d) => d.habs.length > 0)\n                        .toSorted((a, b) => {\n                          if (a.daysToArrival === null && b.daysToArrival === null) return 0;\n                          if (a.daysToArrival === null) return 1;\n                          if (b.daysToArrival === null) return -1;\n                          return a.daysToArrival - b.daysToArrival;\n                        });\n\n                      return defenseData.map(({ planet, totalAlienMC, totalPlayerMC, daysToArrival, habs }) => (\n                        <TableRow key={planet}>\n                          <TableCell className=\"font-medium\">{planet}</TableCell>\n                          <TableCell className=\"text-right\">\n                            {daysToArrival !== null ? daysToArrival.toFixed(0) : \"—\"}\n                          </TableCell>\n                          <TableCell className=\"text-right\">{totalAlienMC.toFixed(0)}</TableCell>\n                          <TableCell className=\"text-right\">{totalPlayerMC.toFixed(0)}</TableCell>\n                          <TableCell>\n                            <TooltipProvider>\n                              <div className=\"flex gap-2 flex-wrap\">\n                                {habs\n                                  .toSorted((a, b) => {\n                                    if (a.habType === \"Station\" && b.habType !== \"Station\") return -1;\n                                    if (a.habType !== \"Station\" && b.habType === \"Station\") return 1;\n                                    return 0;\n                                  })\n                                  .map((hab) => {\n                                    const activeCombat = hab.activeEffects.combatScore || 0;\n                                    const potentialCombat = hab.potentialEffects.combatScore || 0;\n                                    const combatDisplay =\n                                      activeCombat === potentialCombat\n                                        ? activeCombat.toFixed(0)\n                                        : `${activeCombat.toFixed(0)} / ${potentialCombat.toFixed(0)}`;\n                                    const bgColor = hab.habType === \"Station\" ? \"bg-yellow-100\" : \"bg-green-100\";\n                                    return (\n                                      <Tooltip key={hab.id}>\n                                        <TooltipTrigger asChild>\n                                          <span className={`cursor-help ${bgColor} px-1.5 py-0.5 rounded`}>\n                                            {combatDisplay}\n                                          </span >\n                                        </TooltipTrigger>\n                                        <TooltipContent>\n                                          <div>{hab.displayName}</div>\n                                        </TooltipContent>\n                                      </Tooltip>\n                                    );\n                                  })}\n                                </div>\n                            </TooltipProvider>\n                          </TableCell>\n                        </TableRow>\n                      ));\n                    })()}\n                  </TableBody>\n                </Table>\n              </div >\n\n              <Collapsible>\n                <CollapsibleTrigger asChild>\n                  <Button>Debug Data</Button>\n                </CollapsibleTrigger>\n                <CollapsibleContent>\n                  <pre>{JSON.stringify(alienFleets, null, 2)}</pre>\n                </CollapsibleContent>\n              </Collapsible>\n            </div >\n          )}\n        </AccordionContent>\n      </AccordionItem>\n\n      {/* Other Human Factions Fleets */}\n      <AccordionItem value=\"human-enemy-fleets\">\n        <AccordionTrigger>Other Human Factions ({humanEnemyFleets.length})</AccordionTrigger>\n        <AccordionContent>\n          {humanEnemyFleets.length === 0 ? (\n            <div className=\"p-4 text-muted-foreground\">No other human faction fleets detected heading to player orbits.</div >\n          ) : (\n            <Table>\n              <TableHeader>\n                <TableRow>\n                  <TableHead>Faction</TableHead>\n                  <TableHead>Fleet Name</TableHead>\n                  <TableHead>Planet</TableHead>\n                  <TableHead>Target Orbit</TableHead>\n                  <TableHead>Arrival Date</TableHead>\n                  <TableHead className=\"text-right\">Days to Arrival</TableHead>\n                  <TableHead className=\"text-right\">MC Used</TableHead>\n                  <TableHead className=\"text-right\">Marine CP</TableHead>\n                  <TableHead className=\"text-right\">Total Mass</TableHead>\n                  <TableHead className=\"text-right\">Max Ship Mass</TableHead>\n                  <TableHead>Ship Hulls</TableHead>\n                  <TableHead>Ship Roles</TableHead>\n                  <TableHead>Operation</TableHead>\n                  <TableHead>Operation Complete</TableHead>\n                </TableRow>\n              </TableHeader>\n              <TableBody>\n                {humanEnemyFleets.map((fleet) => {\n                  const FactionIcon = fleet.factionTemplateName\n                    ? FactionIcons[fleet.factionTemplateName as keyof typeof FactionIcons]\n                    : null;\n                  return (\n                    <TableRow key={fleet.id} className={twMerge(fleet.deltaV === 0 ? \"bg-gray-500/5\" : \"\")}>\n                      <TableCell>\n                        <div className=\"flex items-center gap-1\">\n                          {FactionIcon && <FactionIcon className=\"p-1 rounded\" />}\n                          <span className=\"text-sm\">{fleet.factionDisplayName ?? fleet.factionTemplateName ?? \"Unknown\"}</span >\n                        </div >\n                      </TableCell>\n                      <TableCell className=\"font-medium\">{fleet.displayName}</TableCell>\n                      <TableCell>{fleet.planetName}</TableCell>\n                      <TableCell>{fleet.targetOrbitName}</TableCell>\n                      <TableCell>{fleet.arrivalTimeFormatted || \"-\"}</TableCell>\n                      <TableCell className=\"text-right\">\n                        {fleet.daysToTarget !== null ? `${fleet.daysToTarget.toFixed(0)}` : \"—\"}\n                      </TableCell>\n                      <TableCell className=\"text-right\">{fleet.totalMC.toFixed(0)}</TableCell>\n                      <TableCell className=\"text-right\">{fleet.marineCombatPower > 0 ? fleet.marineCombatPower : \"—\"}</TableCell>\n                      <TableCell className=\"text-right\">{(fleet.totalMass / 1000000).toFixed(0)} Mkg</TableCell>\n                      <TableCell className=\"text-right\">{(fleet.maxShipMass / 1000000).toFixed(0)} Mkg</TableCell>\n                      <TableCell className=\"whitespace-normal\">\n                        {fleet.shipsByHullType.length > 0\n                          ? fleet.shipsByHullType\n                              .map((ship) => {\n                                const name = `${ship.count} ${ship.hullName}${ship.count > 1 ? \"s\" : \"\"}`;\n                                return ship.avgNoseArmor > 0 ? `${name} (${ship.avgNoseArmor})` : name;\n                              })\n                              .join(\" + \")\n                          : \"-\"}\n                      </TableCell>\n                      <TableCell className=\"whitespace-normal\">\n                        {fleet.shipsByRole.length > 0\n                          ? fleet.shipsByRole.map((s) => `${s.count} ${s.role}${s.count > 1 ? \"s\" : \"\"}`).join(\" + \")\n                          : \"-\"}\n                      </TableCell>\n                      <TableCell>{fleet.operation || \"-\"}</TableCell>\n                      <TableCell>\n                        {fleet.operationComplete\n                          ? `${fleet.operationComplete}${fleet.operationCompleteDays !== null ? ` (${fleet.operationCompleteDays.toFixed(0)}d)` : \"\"}`\n                          : \"-\"}\n                      </TableCell>\n                    </TableRow>\n                  );\n                })}\n              </TableBody>\n            </Table>\n          )}\n        </AccordionContent>\n      </AccordionItem\n\n      {/* Player Fleets */}\n      <AccordionItem value=\"player-fleets\">\n        <AccordionTrigger>Player Fleets ({playerFleets.length})</AccordionTrigger>\n        <AccordionContent>\n          {playerFleets.length === 0 ? (\n            <div className=\"p-4 text-muted-foreground\">No player fleets found.</div >\n          ) : (\n            <Table>\n              <TableHeader>\n                <TableRow>\n                  <TableHead>Fleet Name</TableHead>\n                  <TableHead>Planet</TableHead>\n                  <TableHead>Target Orbit</TableHead>\n                  <TableHead>Arrival Date</TableHead>\n                  <TableHead className=\"text-right\">Days to Arrival</TableHead>\n                  <TableHead className=\"text-right\">MC Used</TableHead>\n                  <TableHead className=\"text-right\">Marine CP</TableHead>\n                  <TableHead className=\"text-right\">Total Mass</TableHead>\n                  <TableHead className=\"text-right\">Max Ship Mass</TableHead>\n                  <TableHead>Ship Hulls</TableHead>\n                  <TableHead>Ship Classes</TableHead>\n                </TableRow>\n              </TableHeader>\n              <TableBody>\n                {playerFleets.map((fleet) => (\n                  <TableRow key={fleet.id}>\n                    <TableCell className=\"font-medium\">{fleet.displayName}</TableCell>\n                    <TableCell>{fleet.planetName}</TableCell>\n                    <TableCell>{fleet.targetOrbitName}</TableCell>\n                    <TableCell>{fleet.arrivalTimeFormatted || \"-\"}</TableCell>\n                    <TableCell className=\"text-right\">\n                      {fleet.daysToTarget !== null ? `${fleet.daysToTarget.toFixed(0)}` : \"—\"}\n                    </TableCell>\n                    <TableCell className=\"text-right\">{fleet.totalMC.toFixed(0)}</TableCell>\n                    <TableCell className=\"text-right\">{fleet.marineCombatPower > 0 ? fleet.marineCombatPower : \"—\"}</TableCell>\n                    <TableCell className=\"text-right\">{(fleet.totalMass / 1000000).toFixed(0)} Mkg</TableCell>\n                    <TableCell className=\"text-right\">{(fleet.maxShipMass / 1000000).toFixed(0)} Mkg</TableCell>\n                    <TableCell className=\"whitespace-normal\">\n                      {fleet.shipsByHullType.length > 0\n                        ? fleet.shipsByHullType.map((ship, i) => (\n                            <Fragment key={ship.hullName}>\n                              {i > 0 && <br />}\n                              {ship.count} {ship.hullName}\n                              {ship.count > 1 ? \"s\" : \"\"}\n                            </Fragment>\n                          ))\n                        : \"-\"}\n                    </TableCell>\n                    <TableCell className=\"whitespace-normal\">\n                      {fleet.shipsByClass.length > 0\n                        ? fleet.shipsByClass.map((cls, i) => (\n                            <Fragment key={cls.className}>\n                              {i > 0 && <br />}\n                              {cls.count}× {cls.className}{cls.noseArmor > 0 ? ` (${cls.noseArmor})` : \"\"}\n                            </Fragment>\n                          ))\n                        : \"-\"}\n                    </TableCell>\n                  </TableRow>\n                ))}\n              </TableBody>\n            </Table>\n          )}\n        </AccordionContent>\n      </AccordionItem\n\n      {/* Ships Under Construction */}\n      <AccordionItem value=\"ships-under-construction\">\n        <AccordionTrigger>Ships Under Construction ({shipsUnderConstruction.length})</AccordionTrigger>\n        <AccordionContent>\n          {shipsUnderConstruction.length === 0 ? (\n            <div className=\"p-4 text-muted-foreground\">No ships under construction.</div >\n          ) : (\n            <Table>\n              <TableHeader>\n                <TableRow>\n                  <TableHead>Planet</TableHead>\n                  <TableHead>Design</TableHead>\n                  <TableHead>Hull</TableHead>\n                  <TableHead className=\"text-right\">Nose Armor</TableHead>\n                  <TableHead className=\"text-right\">Count</TableHead>\n                  <TableHead>Days to Complete</TableHead>\n                </TableRow>\n              </TableHeader>\n              <TableBody>\n                {(() => {\n                  const byPlanetDesign = shipsUnderConstruction.reduce((acc, ship) => {\n                    const key = `${ship.planetName}||${ship.designName}`;\n                    if (!acc.has(key))\n                      acc.set(key, {\n                        planetName: ship.planetName,\n                        designName: ship.designName,\n                        hullName: ship.hullName,\n                        noseArmor: ship.noseArmor,\n                        entries: [] as { days: number; status: \"building\" | \"queued\" | \"waiting\" }[],\n                      });\n                    acc.get(key)!.entries.push({ days: ship.daysToCompletion, status: ship.status });\n                    return acc;\n                  }, new Map<string, { planetName: string; designName: string; hullName: string; noseArmor: number; entries: { days: number; status: \"building\" | \"queued\" | \"waiting\" }[] }>());\n\n                  return [...byPlanetDesign.values()]\n                    .toSorted((a, b) => a.planetName.localeCompare(b.planetName) || a.designName.localeCompare(b.designName))\n                    .map(({ planetName, designName, hullName, noseArmor, entries }) => (\n                      <TableRow key={`${planetName}||${designName}`}>\n                        <TableCell>{planetName}</TableCell>\n                        <TableCell className=\"font-medium\">{designName}</TableCell>\n                        <TableCell>{hullName}</TableCell>\n                        <TableCell className=\"text-right\">{noseArmor > 0 ? noseArmor : \"-\"}</TableCell>\n                        <TableCell className=\"text-right\">{entries.length}</TableCell>\n                        <TableCell>\n                          {entries\n                            .toSorted((a, b) => a.days - b.days)\n                            .map((e, i) => (\n                              <Fragment key={i}>\n                                {i > 0 && \", \"}\n                                {e.status === \"waiting\" ? (\n                                  <span title=\"Waiting for materials\">⚠️{e.days.toFixed(0)}</span >\n                                ) : e.status === \"queued\" ? (\n                                  <span className=\"text-muted-foreground\" title=\"Queued\">({e.days.toFixed(0)})</span >\n                                ) : (\n                                  e.days.toFixed(0)\n                                )}\n                              </Fragment>\n                            ))}\n                        </TableCell>\n                      </TableRow>\n                    ));\n                })()}\n              </TableBody>\n            </Table>\n          )}\n        </AccordionContent>\n      </AccordionItem>\n    </SmartAccordion>\n  );\n}\n",
  "filePath": "terra-invicta-assistant\\src\\app\\game\\current\\fleets-component.tsx"
}
```

**Output:**
```
Wrote file successfully.
```

---

## Assistant (Build · Gemma 4-26B-A4B (local) · 69.5s)

_Thinking:_

Now I'll update `fleets.tsx`.




**Tool: edit**

**Input:**
```json
{
  "filePath": "terra-invicta-assistant\\src\\app\\game\\current\\fleets.tsx",
  "newString": "import { Analysis } from \"@/lib/analysis\";\nimport { NavItem } from \"./types\";\nimport { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from \"@/components/ui/table\";\nimport { Collapsible, CollapsibleContent, CollapsibleTrigger } from \"@/components/ui/collapsible\";\nimport { AccordionContent, AccordionItem, AccordionTrigger } from \"@/components/ui/accordion\";\nimport { SmartAccordion } from \"@/components/ui/smart-accordion\";\nimport { Button } from \"@/components/ui/button\";\nimport { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from \"@/components/ui/tooltip\";\nimport { diffDateTime, sortByDateTime, toDays } from \"@/lib/utils\";\nimport { Fragment } from \"react\";\nimport { FactionIcons, MissionControl } from \"@/components/icons\";\nimport { twMerge } from \"tailwind-merge\";\nimport { FleetsComponent } from \"./fleets-component\";\n\nexport function getFleetsUi(analysis: Analysis): NavItem {\n  const byTarget = analysis.alienFleetsToPlayerOrbits.reduce((acc, fleet) => {\n    const key = fleet.planetName || \"Unknown Orbit\";\n    if (!acc.has(key)) {\n      acc.set(key, []);\n    }\n    acc.get(key)!.push(fleet);\n    return acc;\n  }, new Map<string, typeof analysis.alienFleetsToPlayerOrbits>());\n  const label = [\n    ...byTarget.entries().map(([target, rawFleets]) => {\n      const fleets = rawFleets.filter((f) => f.deltaV > 0 && (f.daysToTarget || 0) > 0);\n      const surv = rawFleets.filter((f) => f.operation === \"AlienEarthSurveillanceOperation\" && !f.arrivalTime);\n      const survInfo = surv.length ? (\n        <>\n          <span className=\"text-white bg-destructive rounded py-2 px-3 font-bold\">\n            {surv\n              .map((f) => f.operationCompleteDays || 0)\n              .reduce((a, b) => Math.min(a, b), 9999999999)\n              .toFixed(0)}\n            d Surveillance\n          </span >{\" \"}\n        </>\n      ) : null;\n      if (fleets.length === 0) {\n        if (survInfo) {\n          return (\n            <span\n              key={target}\n            >\n              {target}: {survInfo}\n            </span >\n          );\n        }\n        return null;\n      }\n      // now that we know the arrival of the first one, find all arriving within 14 days to summarize MC\n      const firstFleet = sortByDateTime(fleets, (f) => f.arrivalTime || analysis.gameCurrentDateTime)[0];\n      const firstFleets = fleets.filter(\n        (f) =>\n          toDays(\n            diffDateTime(\n              f.arrivalTime || analysis.gameCurrentDateTime,\n              firstFleet.arrivalTime || analysis.gameCurrentDateTime,\n            ),\n          ) < 14,\n      );\n      const firstMc = firstFleets.reduce((sum, f) => sum + f.totalMC, 0);\n\n      // tier 2 hab (60d), fusion power, and defense module (90d) take a total of 150 days\n      // tier 3 hab (90d), fusion power, and defense module (180d) take a total of 270 days.\n      // T2 hab should be able to stop a bombard from a 10MC fleet, and T3 is the best we can do anyway, plus the turn time of 30 days should make for enough warning\n      // before that, we'll still have the nameplate warning and can look at details in the fleets tab\n      const warningNeeded = (firstMc > 10 ? 270 : 150) + 30;\n      const daysToTarget = firstFleet.daysToTarget || 0;\n      const farFuture = daysToTarget > warningNeeded;\n      const className = twMerge(\n        farFuture && \"px-1 -mx-1 py-0.5 -my-0.5 rounded bg-green-500\",\n        farFuture &&\n          (daysToTarget < warningNeeded + 50\n            ? \"bg-red-200\"\n            : daysToTarget < warningNeeded + 100\n              ? \"bg-yellow-200\"\n              : \"bg-green-200\"),\n      );\n      return (\n        <span\n          key={target}\n          className={className}\n          title={`${fleets.length} fleet(s) targeting ${target}, arriving in ${daysToTarget.toFixed(\n            0,\n          )} days, using ${firstMc.toFixed(0)} MC`}\n        >\n          {target}\n          {fleets.length > 1 ? `(${fleets.length})` : \"\"}\n          {farFuture ? (\n            \"\"\n          ) : (\n            <>\n              : {daysToTarget.toFixed(0)}d <MissionControl />\n              {firstMc.toFixed(0)}\n            </>\n          )}\n          {survInfo && <>,{survInfo}</>}\n        </span >\n      );\n    }),\n  ].filter((i) => !!i);\n  return {\n    key: \"fleets\",\n    label: (\n      <>\n        Fleets\n        {label.length > 0 ? (\n          <>\n            {\" - \"}\n            {label.map((i, ix) => (\n              <Fragment key={ix}>\n                {i}\n                {ix < label.length - 1 ? \" | \" : \"\"}\n              </Fragment>\n            ))}\n          </>\n        ) : (\n          \"\"\n        )}\n      </>\n    ),\n    content: <FleetsComponent analysis={analysis} />,\n  };\n}\n",
  "oldString": "import { Analysis } from \"@/lib/analysis\";\nimport { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from \"@/components/ui/table\";\nimport { Collapsible, CollapsibleContent, CollapsibleTrigger } from \"@/components/ui/collapsible\";\nimport { AccordionContent, AccordionItem, AccordionTrigger } from \"@/components/ui/accordion\";\nimport { SmartAccordion } from \"@/components/ui/smart-accordion\";\nimport { Button } from \"@/components/ui/button\";\nimport { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from \"@/components/ui/tooltip\";\nimport { diffDateTime, sortByDateTime, toDays } from \"@/lib/utils\";\nimport { Fragment } from \"react/jsx-runtime\";\nimport { FactionIcons, MissionControl } from \"@/components/icons\";\nimport { twMerge } from \"tailwind-merge\";\nimport { FleetsComponent } from \"./fleets-component\"; \n"
}
```

**Error:**
```
Could not find oldString in the file. It must match exactly, including whitespace, indentation, and line endings.
```

---

## Assistant (Build · Gemma 4-26B-A4B (local) · 9.4s)

_Thinking:_

I'll use `Read` again to get the exact content of `fleets.tsx`.




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
13: export function getFleetsUi(analysis: Analysis): NavItem {
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
34:           </span >{" "}
35:         </>
36:       ) : null;
37:       if (fleets.length === 0) {
38:         if (survInfo) {
39:           return (
40:             <span
41:               key={target}
42:             >
43:               {target}: {survInfo}
44:             </span >
45:           );
46:         }
47:         return null;
48:       }
49:       // now that we know the arrival of the first one, find all arriving within 14 days to summarize MC
50:       const firstFleet = sortByDateTime(fleets, (f) => f.arrivalTime || analysis.gameCurrentDateTime)[0];
51:       const firstFleets = fleets.filter(
52:         (f) =>
53:           toDays(
54:             diffDateTime(
55:               f.arrivalTime || analysis.gameCurrentDateTime,
56:               firstFleet.arrivalTime || analysis.gameCurrentDateTime,
57:             ),
58:           ) < 14,
59:       );
60:       const firstMc = firstFleets.reduce((sum, f) => sum + f.totalMC, 0);
61: 
62:       // tier 2 hab (60d), fusion power, and defense module (90d) take a total of 150 days
63:       // tier 3 hab (90d), fusion power, and defense module (180d) take a total of 270 days.
64:       // T2 hab should be able to stop a bombard from a 10MC fleet, and T3 is the best we can do anyway, plus the turn time of 30 days should make for enough warning
65:       // before that, we'll still have the nameplate warning and can look at details in the fleets tab
66:       const warningNeeded = (firstMc > 10 ? 270 : 150) + 30;
67:       const daysToTarget = firstFleet.daysToTarget || 0;
68:       const farFuture = daysToTarget > warningNeeded;
69:       const className = twMerge(
70:         farFuture && "px-1 -mx-1 py-0.5 -my-0.5 rounded bg-green-500",
71:         farFuture &&
72:           (daysToTarget < warningNeeded + 50
73:             ? "bg-red-200"
74:             : daysToTarget < warningNeeded + 100
75:               ? "bg-yellow-200"
76:               : "bg-green-200"),
77:       );
78:       return (
79:         <span
80:           key={target}
81:           className={className}
82:           title={`${fleets.length} fleet(s) targeting ${target}, arriving in ${daysToTarget.toFixed(
83:             0,
84:           )} days, using ${firstMc.toFixed(0)} MC`}
85:         >
86:           {target}
87:           {fleets.length > 1 ? `(${fleets.length})` : ""}
88:           {farFuture ? (
89:             ""
90:           ) : (
91:             <>
92:               : {daysToTarget.toFixed(0)}d <MissionControl />
93:               {firstMc.toFixed(0)}
94:             </>
95:           )}
96:           {survInfo && <>,{survInfo}</>}
97:         </span >
98:       );
99:     }),
100:   ].filter((i) => !!i);
101:   return {
102:     key: "fleets",
103:     label: (
104:       <>
105:         Fleets
106:         {label.length > 0 ? (
107:           <>
108:             {" - "}
109:             {label.map((i, ix) => (
110:               <Fragment key={ix}>
111:                 {i}
112:                 {ix < label.length - 1 ? " | " : ""}
113:               </Fragment>
114:             ))}
115:           </>
116:         ) : (
117:           ""
118:         )}
119:       </>
120:     ),
121:     content: <FleetsComponent analysis={analysis} />,
122:   };
123: }
124: 
125:     acc.get(key)!.push(fleet);
126:     return acc;
127:   }, new Map<string, typeof analysis.alienFleetsToPlayerOrbits>());
128:   const label = [
129:     ...byTarget.entries().map(([target, rawFleets]) => {
130:       const fleets = rawFleets.filter((f) => f.deltaV > 0 && (f.daysToTarget || 0) > 0);
131:       const surv = rawFleets.filter((f) => f.operation === "AlienEarthSurveillanceOperation" && !f.arrivalTime);
132:       const survInfo = surv.length ? (
133:         <>
134:           <span className="text-white bg-destructive rounded py-2 px-3 font-bold">
135:             {surv
136:               .map((f) => f.operationCompleteDays || 0)
137:               .reduce((a, b) => Math.min(a, b), 9999999999)
138:               .toFixed(0)}
139:             d Surveillance
140:           </span>{" "}
141:         </>
142:       ) : null;
143:       if (fleets.length === 0) {
144:         if (survInfo) {
145:           return (
146:             <span>
147:               {target}: {survInfo}
148:             </span>
149:           );
150:         }
151:         return null;
152:       }
153:       // now that we know the arrival of the first one, find all arriving within 14 days to summarize MC
154:       const firstFleet = sortByDateTime(fleets, (f) => f.arrivalTime || analysis.gameCurrentDateTime)[0];
155:       const firstFleets = fleets.filter(
156:         (f) =>
157:           toDays(
158:             diffDateTime(
159:               f.arrivalTime || analysis.gameCurrentDateTime,
160:               firstFleet.arrivalTime || analysis.gameCurrentDateTime,
161:             ),
162:           ) < 14,
163:       );
164:       const firstMc = firstFleets.reduce((sum, f) => sum + f.totalMC, 0);
165: 
166:       // tier 2 hab (60d), fusion power, and defense module (90d) take a total of 150 days
167:       // tier 3 hab (90d), fusion power, and defense module (180d) take a total of 270 days.
168:       // T2 hab should be able to stop a bombard from a 10MC fleet, and T3 is the best we can do anyway, plus the turn time of 30 days should make for enough warning
169:       // before that, we'll still have the nameplate warning and can look at details in the fleets tab
170:       const warningNeeded = (firstMc > 10 ? 270 : 150) + 30;
171:       const daysToTarget = firstFleet.daysToTarget || 0;
172:       const farFuture = daysToTarget > warningNeeded;
173:       const className = twMerge(
174:         farFuture && "px-1 -mx-1 py-0.5 -my-0.5 rounded bg-green-500",
175:         farFuture &&
176:           (daysToTarget < warningNeeded + 50
177:             ? "bg-red-200"
178:             : daysToTarget < warningNeeded + 100
179:               ? "bg-yellow-200"
180:               : "bg-green-200"),
181:       );
182:       return (
183:         <span
184:           className={className}
185:           title={`${fleets.length} fleet(s) targeting ${target}, arriving in ${daysToTarget.toFixed(
186:             0,
187:           )} days, using ${firstMc.toFixed(0)} MC`}
188:         >
189:           {target}
190:           {fleets.length > 1 ? `(${fleets.length})` : ""}
191:           {farFuture ? (
192:             ""
193:           ) : (
194:             <>
195:               : {daysToTarget.toFixed(0)}d <MissionControl />
196:               {firstMc.toFixed(0)}
197:             </>
198:           )}
199:           {survInfo && <>,{survInfo}</>}
200:         </span>
201:       );
202:     }),
203:   ].filter((i) => !!i);
204: 
205:   return {
206:     key: "fleets",
207:     tab: (
208:       <>
209:         Fleets
210:         {label.length > 0 ? (
211:           <>
212:             {" - "}
213:             {label.map((i, ix) => (
214:               <Fragment key={ix}>
215:                 {i}
216:                 {ix < label.length - 1 ? " | " : ""}
217:               </Fragment>
218:             ))}
219:           </>
220:         ) : (
221:           ""
222:         )}
223:       </>
224:     ),
225:     content: <FleetsComponent analysis={analysis} />,
226:   };
227: }
228: 
229: function FleetsComponent({ analysis }: { analysis: Analysis }) {
230:   const alienFleets = analysis.alienFleetsToPlayerOrbits;
231:   const humanEnemyFleets = analysis.humanEnemyFleetsToPlayerOrbits;
232:   const playerFleets = analysis.playerFleets;
233:   const shipsUnderConstruction = analysis.playerShipsUnderConstruction;
234: 
235:   return (
236:     <SmartAccordion
237:       type="multiple"
238:       storageKey="fleetsSections"
239:       defaultValue={["alien-fleets", "human-enemy-fleets", "player-fleets", "ships-under-construction"]}
240:     >
241:       {/* Alien Fleets */}
242:       <AccordionItem value="alien-fleets">
243:         <AccordionTrigger>Alien Fleets ({alienFleets.length})</AccordionTrigger>
244:         <AccordionContent>
245:           {alienFleets.length === 0 ? (
246:             <div className="p-4 text-muted-foreground">No alien fleets detected heading to player orbits.</div>
247:           ) : (
248:             <div className="space-y-2">
249:               <p>Tracking planets: {analysis.playerInterestedPlanets.map((p) => p.displayName).join(", ")}</p>
250:               <Table>
251:                 <TableHeader>
252:                   <TableRow>
253:                     <TableHead>Fleet Name</TableHead>
254:                     <TableHead>Planet</TableHead>
255:                     <TableHead>Target Orbit</TableHead>
256:                     <TableHead>Arrival Date</TableHead>
257:                     <TableHead className="text-right">Days to Arrival</TableHead>
258:                     <TableHead className="text-right">MC Used</TableHead>
259:                     <TableHead className="text-right">Marine CP</TableHead>
260:                     <TableHead className="text-right">Total Mass</TableHead>
261:                     <TableHead className="text-right">Max Ship Mass</TableHead>
262:                     <TableHead>Ships Hulls</TableHead>
263:                     <TableHead>Ships Roles</TableHead>
264:                     <TableHead>Operation</TableHead>
265:                     <TableHead>Operation Complete</TableHead>
266:                   </TableRow>
267:                 </TableHeader>
268:                 <TableBody>
269:                   {alienFleets.map((fleet) => (
270:                     <TableRow key={fleet.id} className={twMerge(fleet.deltaV === 0 ? "bg-gray-500/5" : "")}>
271:                       <TableCell className="font-medium">{fleet.displayName}</TableCell>
272:                       <TableCell>{fleet.planetName}</TableCell>
273:                       <TableCell>{fleet.targetOrbitName}</TableCell>
274:                       <TableCell>{fleet.arrivalTimeFormatted || "-"}</TableCell>
275:                       <TableCell className="text-right">
276:                         {fleet.daysToTarget !== null ? `${fleet.daysToTarget.toFixed(0)}` : "—"}
277:                       </TableCell>
278:                       <TableCell className="text-right">{fleet.totalMC.toFixed(0)}</TableCell>
279:                       <TableCell className="text-right">{fleet.marineCombatPower > 0 ? fleet.marineCombatPower : "—"}</TableCell>
280:                       <TableCell className="text-right">{(fleet.totalMass / 1000000).toFixed(0)} Mkg</TableCell>
281:                       <TableCell className="text-right">{(fleet.maxShipMass / 1000000).toFixed(0)} Mkg</TableCell>
282:                       <TableCell className="whitespace-normal">
283:                         {fleet.shipsByHullType.length > 0
284:                           ? fleet.shipsByHullType
285:                               .map((ship) => {
286:                                 const name = `${ship.count} ${ship.hullName.replace("Alien ", "")}${ship.count > 1 ? "s" : ""}`;
287:                                 return ship.avgNoseArmor > 0 ? `${name} (${ship.avgNoseArmor})` : name;
288:                               })
289:                               .join(" + ")
290:                           : "-"}
291:                       </TableCell>
292:                       <TableCell className="whitespace-normal">
293:                         {fleet.shipsByRole.length > 0
294:                           ? fleet.shipsByRole
295:                               .map((ship) => `${ship.count} ${ship.role}${ship.count > 1 ? "s" : ""}`)
296:                               .join(" + ")
297:                           : "-"}
298:                       </TableCell>
299:                       <TableCell>{fleet.operation || "-"}</TableCell>
300:                       <TableCell>
301:                         {fleet.operationComplete
302:                           ? `${fleet.operationComplete}${
303:                               fleet.operationCompleteDays !== null
304:                                 ? ` (${fleet.operationCompleteDays.toFixed(0)}d)`
305:                                 : ""
306:                             }`
307:                           : "-"}
308:                       </TableCell>
309:                     </TableRow>
310:                   ))}
311:                 </TableBody>
312:               </Table>
313: 
314:               {/* Planetary Defense Summary */}
315:               <div className="mt-8">
316:                 <h2 className="text-2xl font-bold mb-4">Planetary Defense Summary</h2>
317:                 <Table>
318:                   <TableHeader>
319:                     <TableRow>
320:                       <TableHead>Planet</TableHead>
321:                       <TableHead className="text-right">Days to Arrival</TableHead>
322:                       <TableHead className="text-right">Alien Fleet MC</TableHead>
323:                       <TableHead className="text-right">Player Fleet MC</TableHead>
324:                       <TableHead>Habs (Active / Potential Combat)</TableHead>
325:                     </TableRow>
326:                   </TableHeader>
327:                   <TableBody>
328:                     {(() => {
329:                       const planetsWithFleets = new Set(
330:                         analysis.alienFleetsToPlayerOrbits.map((f) => f.planetName || "Unknown"),
331:                       );
332:                       const defenseData = Array.from(planetsWithFleets)
333:                         .map((planet) => {
334:                           const fleetsAtPlanet = analysis.alienFleetsToPlayerOrbits.filter(
335:                             (f) => f.planetName === planet,
336:                           );
337:                           const totalAlienMC = fleetsAtPlanet.reduce((sum, f) => sum + (f.totalMC || 0), 0);
338:                           const incomingFleets = fleetsAtPlanet.filter(
339:                             (f) => f.daysToTarget !== null && f.daysToTarget > 0,
340:                           );
341:                           const daysToArrival =
342:                             incomingFleets.length > 0
343:                               ? Math.min(...incomingFleets.map((f) => f.daysToTarget!))
344:                               : null;
345:                           const playerFleetsAtPlanet = analysis.playerFleets.filter(
346:                             (f) => f.planetName === planet,
347:                           );
348:                           const relevantPlayerFleets = playerFleetsAtPlanet.filter((f) => {
349:                             if (f.daysToTarget === null || f.daysToTarget <= 0) return true;
350:                             if (daysToArrival === null) return false;
351:                             return f.daysToTarget < daysToArrival;
352:                           });
353:                           const totalPlayerMC = relevantPlayerFleets.reduce((sum, f) => sum + (f.totalMC || 0), 0);
354:                           const habsAtPlanet = analysis.playerHabs.filter((h) => h.planetName === planet);
355:                           return { planet, totalAlienMC, totalPlayerMC, daysToArrival, habs: habsAtPlanet };
356:                         })
357:                         .filter((d) => d.habs.length > 0)
358:                         .toSorted((a, b) => {
359:                           if (a.daysToArrival === null && b.daysToArrival === null) return 0;
360:                           if (a.daysToArrival === null) return 1;
361:                           if (b.daysToArrival === null) return -1;
362:                           return a.daysToArrival - b.daysToArrival;
363:                         });
364: 
365:                       return defenseData.map(({ planet, totalAlienMC, totalPlayerMC, daysToArrival, habs }) => (
366:                         <TableRow key={planet}>
367:                           <TableCell className="font-medium">{planet}</TableCell>
368:                           <TableCell className="text-right">
369:                             {daysToArrival !== null ? daysToArrival.toFixed(0) : "—"}
370:                           </TableCell>
371:                           <TableCell className="text-right">{totalAlienMC.toFixed(0)}</TableCell>
372:                           <TableCell className="text-right">{totalPlayerMC.toFixed(0)}</TableCell>
373:                           <TableCell>
374:                             <TooltipProvider>
375:                               <div className="flex gap-2 flex-wrap">
376:                                 {habs
377:                                   .toSorted((a, b) => {
378:                                     if (a.habType === "Station" && b.habType !== "Station") return -1;
379:                                     if (a.habType !== "Station" && b.habType === "Station") return 1;
380:                                     return 0;
381:                                   })
382:                                   .map((hab) => {
383:                                     const activeCombat = hab.activeEffects.combatScore || 0;
384:                                     const potentialCombat = hab.potentialEffects.combatScore || 0;
385:                                     const combatDisplay =
386:                                       activeCombat === potentialCombat
387:                                         ? activeCombat.toFixed(0)
388:                                         : `${activeCombat.toFixed(0)} / ${potentialCombat.toFixed(0)}`;
389:                                     const bgColor = hab.habType === "Station" ? "bg-yellow-100" : "bg-green-100";
390:                                     return (
391:                                       <Tooltip key={hab.id}>
392:                                         <TooltipTrigger asChild>
393:                                           <span className={`cursor-help ${bgColor} px-1.5 py-0.5 rounded`}>
394:                                             {combatDisplay}
395:                                           </span>
396:                                         </TooltipTrigger>
397:                                         <TooltipContent>
398:                                           <div>{hab.displayName}</div>
399:                                         </TooltipContent>
400:                                       </Tooltip>
401:                                     );
402:                                   })}
403:                               </div>
404:                             </TooltipProvider>
405:                           </TableCell>
406:                         </TableRow>
407:                       ));
408:                     })()}
409:                   </TableBody>
410:                 </Table>
411:               </div>
412: 
413:               <Collapsible>
414:                 <CollapsibleTrigger asChild>
415:                   <Button>Debug Data</Button>
416:                 </CollapsibleTrigger>
417:                 <CollapsibleContent>
418:                   <pre>{JSON.stringify(alienFleets, null, 2)}</pre>
419:                 </CollapsibleContent>
420:               </Collapsible>
421:             </div>
422:           )}
423:         </AccordionContent>
424:       </AccordionItem>
425: 
426:       {/* Other Human Factions Fleets */}
427:       <AccordionItem value="human-enemy-fleets">
428:         <AccordionTrigger>Other Human Factions ({humanEnemyFleets.length})</AccordionTrigger>
429:         <AccordionContent>
430:           {humanEnemyFleets.length === 0 ? (
431:             <div className="p-4 text-muted-foreground">No other human faction fleets detected heading to player orbits.</div>
432:           ) : (
433:             <Table>
434:               <TableHeader>
435:                 <TableRow>
436:                   <TableHead>Faction</TableHead>
437:                   <TableHead>Fleet Name</TableHead>
438:                   <TableHead>Planet</TableHead>
439:                   <TableHead>Target Orbit</TableHead>
440:                   <TableHead>Arrival Date</TableHead>
441:                   <TableHead className="text-right">Days to Arrival</TableHead>
442:                   <TableHead className="text-right">MC Used</TableHead>
443:                   <TableHead className="text-right">Marine CP</TableHead>
444:                   <TableHead className="text-right">Total Mass</TableHead>
445:                   <TableHead className="text-right">Max Ship Mass</TableHead>
446:                   <TableHead>Ship Hulls</TableHead>
447:                   <TableHead>Ship Roles</TableHead>
448:                   <TableHead>Operation</TableHead>
449:                   <TableHead>Operation Complete</TableHead>
450:                 </TableRow>
451:               </TableHeader>
452:               <TableBody>
453:                 {humanEnemyFleets.map((fleet) => {
454:                   const FactionIcon = fleet.factionTemplateName
455:                     ? FactionIcons[fleet.factionTemplateName as keyof typeof FactionIcons]
456:                     : null;
457:                   return (
458:                     <TableRow key={fleet.id} className={twMerge(fleet.deltaV === 0 ? "bg-gray-500/5" : "")}>
459:                       <TableCell>
460:                         <div className="flex items-center gap-1">
461:                           {FactionIcon && <FactionIcon className="p-1 rounded" />}
462:                           <span className="text-sm">{fleet.factionDisplayName ?? fleet.factionTemplateName ?? "Unknown"}</span>
463:                         </div>
464:                       </TableCell>
465:                       <TableCell className="font-medium">{fleet.displayName}</TableCell>
466:                       <TableCell>{fleet.planetName}</TableCell>
467:                       <TableCell>{fleet.targetOrbitName}</TableCell>
468:                       <TableCell>{fleet.arrivalTimeFormatted || "-"}</TableCell>
469:                       <TableCell className="text-right">
470:                         {fleet.daysToTarget !== null ? `${fleet.daysToTarget.toFixed(0)}` : "—"}
471:                       </TableCell>
472:                       <TableCell className="text-right">{fleet.totalMC.toFixed(0)}</TableCell>
473:                       <TableCell className="text-right">{fleet.marineCombatPower > 0 ? fleet.marineCombatPower : "—"}</TableCell>
474:                       <TableCell className="text-right">{(fleet.totalMass / 1000000).toFixed(0)} Mkg</TableCell>
475:                       <TableCell className="text-right">{(fleet.maxShipMass / 1000000).toFixed(0)} Mkg</TableCell>
476:                       <TableCell className="whitespace-normal">
477:                         {fleet.shipsByHullType.length > 0
478:                           ? fleet.shipsByHullType
479:                               .map((ship) => {
480:                                 const name = `${ship.count} ${ship.hullName}${ship.count > 1 ? "s" : ""}`;
481:                                 return ship.avgNoseArmor > 0 ? `${name} (${ship.avgNoseArmor})` : name;
482:                               })
483:                               .join(" + ")
484:                           : "-"}
485:                       </TableCell>
486:                       <TableCell className="whitespace-normal">
487:                         {fleet.shipsByRole.length > 0
488:                           ? fleet.shipsByRole.map((s) => `${s.count} ${s.role}${s.count > 1 ? "s" : ""}`).join(" + ")
489:                           : "-"}
490:                       </TableCell>
491:                       <TableCell>{fleet.operation || "-"}</TableCell>
492:                       <TableCell>
493:                         {fleet.operationComplete
494:                           ? `${fleet.operationComplete}${fleet.operationCompleteDays !== null ? ` (${fleet.operationCompleteDays.toFixed(0)}d)` : ""}`
495:                           : "-"}
496:                       </TableCell>
497:                     </TableRow>
498:                   );
499:                 })}
500:               </TableBody>
501:             </Table>
502:           )}
503:         </AccordionContent>
504:       </AccordionItem>
505: 
506:       {/* Player Fleets */}
507:       <AccordionItem value="player-fleets">
508:         <AccordionTrigger>Player Fleets ({playerFleets.length})</AccordionTrigger>
509:         <AccordionContent>
510:           {playerFleets.length === 0 ? (
511:             <div className="p-4 text-muted-foreground">No player fleets found.</div>
512:           ) : (
513:             <Table>
514:               <TableHeader>
515:                 <TableRow>
516:                   <TableHead>Fleet Name</TableHead>
517:                   <TableHead>Planet</TableHead>
518:                   <TableHead>Target Orbit</TableHead>
519:                   <TableHead>Arrival Date</TableHead>
520:                   <TableHead className="text-right">Days to Arrival</TableHead>
521:                   <TableHead className="text-right">MC Used</TableHead>
522:                   <TableHead className="text-right">Marine CP</TableHead>
523:                   <TableHead className="text-right">Total Mass</TableHead>
524:                   <TableHead className="text-right">Max Ship Mass</TableHead>
525:                   <TableHead>Ship Hulls</TableHead>
526:                   <TableHead>Ship Classes</TableHead>
527:                 </TableRow>
528:               </TableHeader>
529:               <TableBody>
530:                 {playerFleets.map((fleet) => (
531:                   <TableRow key={fleet.id}>
532:                     <TableCell className="font-medium">{fleet.displayName}</TableCell>
533:                     <TableCell>{fleet.planetName}</TableCell>
534:                     <TableCell>{fleet.targetOrbitName}</TableCell>
535:                     <TableCell>{fleet.arrivalTimeFormatted || "-"}</TableCell>
536:                     <TableCell className="text-right">
537:                       {fleet.daysToTarget !== null ? `${fleet.daysToTarget.toFixed(0)}` : "—"}
538:                     </TableCell>
539:                     <TableCell className="text-right">{fleet.totalMC.toFixed(0)}</TableCell>
540:                     <TableCell className="text-right">{fleet.marineCombatPower > 0 ? fleet.marineCombatPower : "—"}</TableCell>
541:                     <TableCell className="text-right">{(fleet.totalMass / 1000000).toFixed(0)} Mkg</TableCell>
542:                     <TableCell className="text-right">{(fleet.maxShipMass / 1000000).toFixed(0)} Mkg</TableCell>
543:                     <TableCell className="whitespace-normal">
544:                       {fleet.shipsByHullType.length > 0
545:                         ? fleet.shipsByHullType.map((ship, i) => (
546:                             <Fragment key={ship.hullName}>
547:                               {i > 0 && <br />}
548:                               {ship.count} {ship.hullName}
549:                               {ship.count > 1 ? "s" : ""}
550:                             </Fragment>
551:                           ))
552:                         : "-"}
553:                     </TableCell>
554:                     <TableCell className="whitespace-normal">
555:                       {fleet.shipsByClass.length > 0
556:                         ? fleet.shipsByClass.map((cls, i) => (
557:                             <Fragment key={cls.className}>
558:                               {i > 0 && <br />}
559:                               {cls.count}× {cls.className}{cls.noseArmor > 0 ? ` (${cls.noseArmor})` : ""}
560:                             </Fragment>
561:                           ))
562:                         : "-"}
563:                     </TableCell>
564:                   </TableRow>
565:                 ))}
566:               </TableBody>
567:             </Table>
568:           )}
569:         </AccordionContent>
570:       </AccordionItem>
571: 
572:       {/* Ships Under Construction */}
573:       <AccordionItem value="ships-under-construction">
574:         <AccordionTrigger>Ships Under Construction ({shipsUnderConstruction.length})</AccordionTrigger>
575:         <AccordionContent>
576:           {shipsUnderConstruction.length === 0 ? (
577:             <div className="p-4 text-muted-foreground">No ships under construction.</div>
578:           ) : (
579:             <Table>
580:               <TableHeader>
581:                 <TableRow>
582:                   <TableHead>Planet</TableHead>
583:                   <TableHead>Design</TableHead>
584:                   <TableHead>Hull</TableHead>
585:                   <TableHead className="text-right">Nose Armor</TableHead>
586:                   <TableHead className="text-right">Count</TableHead>
587:                   <TableHead>Days to Complete</TableHead>
588:                 </TableRow>
589:               </TableHeader>
590:               <TableBody>
591:                 {(() => {
592:                   const byPlanetDesign = shipsUnderConstruction.reduce((acc, ship) => {
593:                     const key = `${ship.planetName}||${ship.designName}`;
594:                     if (!acc.has(key))
595:                       acc.set(key, {
596:                         planetName: ship.planetName,
597:                         designName: ship.designName,
598:                         hullName: ship.hullName,
599:                         noseArmor: ship.noseArmor,
600:                         entries: [] as { days: number; status: "building" | "queued" | "waiting" }[],
601:                       });
602:                     acc.get(key)!.entries.push({ days: ship.daysToCompletion, status: ship.status });
603:                     return acc;
604:                   }, new Map<string, { planetName: string; designName: string; hullName: string; noseArmor: number; entries: { days: number; status: "building" | "queued" | "waiting" }[] }>());
605: 
606:                   return [...byPlanetDesign.values()]
607:                     .toSorted((a, b) => a.planetName.localeCompare(b.planetName) || a.designName.localeCompare(b.designName))
608:                     .map(({ planetName, designName, hullName, noseArmor, entries }) => (
609:                       <TableRow key={`${planetName}||${designName}`}>
610:                         <TableCell>{planetName}</TableCell>
611:                         <TableCell className="font-medium">{designName}</TableCell>
612:                         <TableCell>{hullName}</TableCell>
613:                         <TableCell className="text-right">{noseArmor > 0 ? noseArmor : "-"}</TableCell>
614:                         <TableCell className="text-right">{entries.length}</TableCell>
615:                         <TableCell>
616:                           {entries
617:                             .toSorted((a, b) => a.days - b.days)
618:                             .map((e, i) => (
619:                               <Fragment key={i}>
620:                                 {i > 0 && ", "}
621:                                 {e.status === "waiting" ? (
622:                                   <span title="Waiting for materials">⚠️{e.days.toFixed(0)}</span>
623:                                 ) : e.status === "queued" ? (
624:                                   <span className="text-muted-foreground" title="Queued">({e.days.toFixed(0)})</span>
625:                                 ) : (
626:                                   e.days.toFixed(0)
627:                                 )}
628:                               </Fragment>
629:                             ))}
630:                         </TableCell>
631:                       </TableRow>
632:                     ));
633:                 })()}
634:               </TableBody>
635:             </Table>
636:           )}
637:         </AccordionContent>
638:       </AccordionItem>
639:     </SmartAccordion>
640:   );
641: }

(End of file - total 641 lines)
</content>
```

---

## Assistant (Build · Gemma 4-26B-A4B (local) · 205.7s)

_Thinking:_

Okay, I'll create `src/app/game/current/fleets-component.tsx` now.



**Tool: write**

**Input:**
```json
{
  "content": "import { Analysis } from \"@/lib/analysis\";\nimport { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from \"@/components/ui/table\";\nimport { Collapsible, CollapsibleContent, CollapsibleTrigger } from \"@/components/ui/collapsible\";\nimport { AccordionContent, AccordionItem, AccordionTrigger } from \"@/components/ui/accordion\";\nimport { SmartAccordion } from \"@/components/ui/smart-accordion\";\nimport { Button } from \"@/components/ui/button\";\nimport { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from \"@/components/ui/tooltip\";\nimport { diffDateTime, sortByDateTime, toDays } from \"@/lib/utils\";\nimport { Fragment } from \"react\";\nimport { FactionIcons, MissionControl } from \"@/components/icons\";\nimport { twMerge } from \"tailwind-merge\";\n\nexport function FleetsComponent({ analysis }: { analysis: Analysis }) {\n  const alienFleets = analysis.alienFleetsToPlayerOrbits;\n  const humanEnemyFleets = analysis.humanEnemyFleetsToPlayerOrbits;\n  const playerFleets = analysis.playerFleets;\n  const shipsUnderConstruction = analysis.playerShipsUnderConstruction;\n\n  return (\n    <SmartAccordion\n      type=\"multiple\"\n      storageKey=\"fleetsSections\"\n      defaultValue={[\"alien-fleets\", \"human-enemy-fleets\", \"player-fleets\", \"ships-under-construction\"]}\n    >\n      {/* Alien Fleets */}\n      <AccordionItem value=\"alien-fleets\">\n        <AccordionTrigger>Alien Fleets ({alienFleets.length})</AccordionTrigger>\n        <AccordionContent>\n          {alienFleets.length === 0 ? (\n            <div className=\"p-4 text-muted-foreground\">No alien fleets detected heading to player orbits.</div >\n          ) : (\n            <div className=\"space-y-2\">\n              <p>Tracking planets: {analysis.playerInterestedPlanets.map((p) => p.displayName).join(\", \")}</p>\n              <Table>\n                <TableHeader>\n                  <TableRow>\n                    <TableHead>Fleet Name</TableHead>\n                    <TableHead>Planet</TableHead>\n                    <TableHead>Target Orbit</TableHead>\n                    <TableHead>Arrival Date</TableHead>\n                    <TableHead className=\"text-right\">Days to Arrival</TableHead>\n                    <TableHead className=\"text-right\">MC Used</TableHead>\n                    <TableHead className=\"text-right\">Marine CP</TableHead>\n                    <TableHead className=\"text-right\">Total Mass</TableHead>\n                    <TableHead className=\"text-right\">Max Ship Mass</TableHead>\n                    <TableHead>Ships Hulls</TableHead>\n                    <TableHead>Ships Roles</TableHead>\n                    <TableHead>Operation</TableHead>\n                    <TableHead>Operation Complete</TableHead>\n                  </TableRow>\n                </TableHeader>\n                <TableBody>\n                  {alienFleets.map((fleet) => (\n                    <TableRow key={fleet.id} className={twMerge(fleet.deltaV === 0 ? \"bg-gray-500/5\" : \"\")}>\n                      <TableCell className=\"font-medium\">{fleet.displayName}</TableCell>\n                      <TableCell>{fleet.planetName}</TableCell>\n                      <TableCell>{fleet.targetOrbitName}</TableCell>\n                      <TableCell>{fleet.arrivalTimeFormatted || \"-\"}</TableCell>\n                      <TableCell className=\"text-right\">\n                        {fleet.daysToTarget !== null ? `${fleet.daysToTarget.toFixed(0)}` : \"—\"}\n                      </TableCell>\n                      <TableCell className=\"text-right\">{fleet.totalMC.toFixed(0)}</TableCell>\n                      <TableCell className=\"text-right\">{fleet.marineCombatPower > 0 ? fleet.marineCombatPower : \"—\"}</TableCell>\n                      <TableCell className=\"text-right\">{(fleet.totalMass / 1000000).toFixed(0)} Mkg</TableCell>\n                      <TableCell className=\"text-right\">{(fleet.maxShipMass / 1000000).toFixed(0)} Mkg</TableCell>\n                      <TableCell className=\"whitespace-normal\">\n                        {fleet.shipsByHullType.length > 0\n                          ? fleet.shipsByHullType\n                              .map((ship) => {\n                                const name = `${ship.count} ${ship.hullName.replace(\"Alien \", \"\")}${ship.count > 1 ? \"s\" : \"\"}`;\n                                return ship.avgNoseArmor > 0 ? `${name} (${ship.avgNoseArmor})` : name;\n                              })\n                              .join(\" + \")\n                          : \"-\"}\n                      </TableCell>\n                      <TableCell className=\"whitespace-normal\">\n                        {fleet.shipsByRole.length > 0\n                          ? fleet.shipsByRole\n                              .map((ship) => `${ship.count} ${ship.role}${ship.count > 1 ? \"s\" : \"\"}`)\n                              .join(\" + \")\n                          : \"-\"}\n                      </TableCell>\n                      <TableCell>{fleet.operation || \"-\"}</TableCell>\n                      <TableCell>\n                        {fleet.operationComplete\n                          ? `${fleet.operationComplete}${fleet.operationCompleteDays !== null ? ` (${fleet.operationCompleteDays.toFixed(0)}d)` : \"\"}`\n                          : \"-\"}\n                      </TableCell>\n                    </TableRow>\n                  ))}\n                </TableBody>\n              </Table>\n\n              {/* Planetary Defense Summary */}\n              <div className=\"mt-8\">\n                <h2 className=\"text-2xl font-bold mb-4\">Planetary Defense Summary</h2>\n                <Table>\n                  <TableHeader>\n                    <TableRow>\n                      <TableHead>Planet</TableHead>\n                      <TableHead className=\"text-right\">Days to Arrival</TableHead>\n                      <TableHead className=\"text-right\">Alien Fleet MC</TableHead>\n                      <TableHead className=\"text-right\">Player Fleet MC</TableHead>\n                      <TableHead>Habs (Active / Potential Combat)</TableHead>\n                    </TableRow>\n                  </TableHeader>\n                  <TableBody>\n                    {(() => {\n                      const planetsWithFleets = new Set(\n                        analysis.alienFleetsToPlayerOrbits.map((f) => f.planetName || \"Unknown\"),\n                      );\n                      const defenseData = Array.from(planetsWithFleets)\n                        .map((planet) => {\n                          const fleetsAtPlanet = analysis.alienFleetsToPlayerOrbits.filter(\n                            (f) => f.planetName === planet,\n                          );\n                          const totalAlienMC = fleetsAtPlanet.reduce((sum, f) => sum + (f.totalMC || 0), 0);\n                          const incomingFleets = fleetsAtPlanet.filter(\n                            (f) => f.daysToTarget !== null && f.daysToTarget > 0,\n                          );\n                          const daysToArrival =\n                            incomingFleets.length > 0\n                              ? Math.min(...incomingFleets.map((f) => f.daysToTarget!))\n                              : null;\n                          const playerFleetsAtPlanet = analysis.playerFleets.filter(\n                            (f) => f.planetName === planet,\n                          );\n                          const relevantPlayerFleets = playerFleetsAtPlanet.filter((f) => {\n                            if (f.daysToTarget === null || f.daysToTarget <= 0) return true;\n                            if (daysToArrival === null) return false;\n                            return f.daysToTarget < daysToArrival;\n                          });\n                          const totalPlayerMC = relevantPlayerFleets.reduce((sum, f) => sum + (f.totalMC || 0), 0);\n                          const habsAtPlanet = analysis.playerHabs.filter((h) => h.planetName === planet);\n                          return { planet, totalAlienMC, totalPlayerMC, daysToArrival, habs: habsAtPlanet };\n                        })\n                        .filter((d) => d.habs.length > 0)\n                        .toSorted((a, b) => {\n                          if (a.daysToArrival === null && b.daysToArrival === null) return 0;\n                          if (a.daysToArrival === null) return 1;\n                          if (b.daysToArrival === null) return -1;\n                          return a.daysToArrival - b.daysToArrival;\n                        });\n\n                      return defenseData.map(({ planet, totalAlienMC, totalPlayerMC, daysToArrival, habs }) => (\n                        <TableRow key={planet}>\n                          <TableCell className=\"font-medium\">{planet}</TableCell>\n                          <TableCell className=\"text-right\">\n                            {daysToArrival !== null ? daysToArrival.toFixed(0) : \"—\"}\n                          </TableCell>\n                          <TableCell className=\"text-right\">{totalAlienMC.toFixed(0)}</TableCell>\n                          <TableCell className=\"text-right\">{totalPlayerMC.toFixed(0)}</TableCell>\n                          <TableCell>\n                            <TooltipProvider>\n                              <div className=\"flex gap-2 flex-wrap\">\n                                {habs\n                                  .toSorted((a, b) => {\n                                    if (a.habType === \"Station\" && b.habType !== \"Station\") return -1;\n                                    if (a.habType !== \"Station\" && b.habType === \"Station\") return 1;\n                                    return 0;\n                                  })\n                                  .map((hab) => {\n                                    const activeCombat = hab.activeEffects.combatScore || 0;\n                                    const potentialCombat = hab.potentialEffects.combatScore || 0;\n                                    const combatDisplay =\n                                      activeCombat === potentialCombat\n                                        ? activeCombat.toFixed(0)\n                                        : `${activeCombat.toFixed(0)} / ${potentialCombat.toFixed(0)}`;\n                                    const bgColor = hab.habType === \"Station\" ? \"bg-yellow-100\" : \"bg-green-100\";\n                                    return (\n                                      <Tooltip key={hab.id}>\n                                        <TooltipTrigger asChild>\n                                          <span className={`cursor-help ${bgColor} px-1.5 py-0.5 rounded`}>\n                                            {combatDisplay}\n                                          </span >\n                                        </TooltipTrigger>\n                                        <TooltipContent>\n                                          <div>{hab.displayName}</div>\n                                        </TooltipContent>\n                                      </Tooltip>\n                                    );\n                                  })}\n                                </div>\n                            </TooltipProvider>\n                          </TableCell>\n                        </TableRow>\n                      ));\n                    })()}\n                  </TableBody>\n                </Table>\n              </div >\n\n              <Collapsible>\n                <CollapsibleTrigger asChild>\n                  <Button>Debug Data</Button>\n                </CollapsibleTrigger>\n                <CollapsibleContent>\n                  <pre>{JSON.stringify(alienFleets, null, 2)}</pre>\n                </CollapsibleContent>\n              </Collapsible>\n            </div >\n          )}\n        </AccordionContent>\n      </AccordionItem>\n\n      {/* Other Human Factions Fleets */}\n      <AccordionItem value=\"human-enemy-fleets\">\n        <AccordionTrigger>Other Human Factions ({humanEnemyFleets.length})</AccordionTrigger>\n        <AccordionContent>\n          {humanEnemyFleets.length === 0 ? (\n            <div className=\"p-4 text-muted-foreground\">No other human faction fleets detected heading to player orbits.</div >\n          ) : (\n            <Table>\n              <TableHeader>\n                <TableRow>\n                  <TableHead>Faction</TableHead>\n                  <TableHead>Fleet Name</TableHead>\n                  <TableHead>Planet</TableHead>\n                  <TableHead>Target Orbit</TableHead>\n                  <TableHead>Arrival Date</TableHead>\n                  <TableHead className=\"text-right\">Days to Arrival</TableHead>\n                  <TableHead className=\"text-right\">MC Used</TableHead>\n                  <TableHead className=\"text-right\">Marine CP</TableHead>\n                  <TableHead className=\"text-right\">Total Mass</TableHead>\n                  <TableHead className=\"text-right\">Max Ship Mass</TableHead>\n                  <TableHead>Ship Hulls</TableHead>\n                  <TableHead>Ship Roles</TableHead>\n                  <TableHead>Operation</TableHead>\n                  <TableHead>Operation Complete</TableHead>\n                </TableRow>\n              </TableHeader>\n              <TableBody>\n                {humanEnemyFleets.map((fleet) => {\n                  const FactionIcon = fleet.factionTemplateName\n                    ? FactionIcons[fleet.factionTemplateName as keyof typeof FactionIcons]\n                    : null;\n                  return (\n                    <TableRow key={fleet.id} className={twMerge(fleet.deltaV === 0 ? \"bg-gray-500/5\" : \"\")}>\n                      <TableCell>\n                        <div className=\"flex items-center gap-1\">\n                          {FactionIcon && <FactionIcon className=\"p-1 rounded\" />}\n                          <span className=\"text-sm\">{fleet.factionDisplayName ?? fleet.factionTemplateName ?? \"Unknown\"}</span >\n                        </div >\n                      </TableCell>\n                      <TableCell className=\"font-medium\">{fleet.displayName}</TableCell>\n                      <TableCell>{fleet.planetName}</TableCell>\n                      <TableCell>{fleet.targetOrbitName}</TableCell>\n                      <TableCell>{fleet.arrivalTimeFormatted || \"-\"}</TableCell>\n                      <TableCell className=\"text-right\">\n                        {fleet.daysToTarget !== null ? `${fleet.daysToTarget.toFixed(0)}` : \"—\"}\n                      </TableCell>\n                      <TableCell className=\"text-right\">{fleet.totalMC.toFixed(0)}</TableCell>\n                      <TableCell className=\"text-right\">{fleet.marineCombatPower > 0 ? fleet.marineCombatPower : \"—\"}</TableCell>\n                      <TableCell className=\"text-right\">{(fleet.totalMass / 1000000).toFixed(0)} Mkg</TableCell>\n                      <TableCell className=\"text-right\">{(fleet.maxShipMass / 1000000).toFixed(0)} Mkg</TableCell>\n                      <TableCell className=\"whitespace-normal\">\n                        {fleet.shipsByHullType.length > 0\n                          ? fleet.shipsByHullType\n                              .map((ship) => {\n                                const name = `${ship.count} ${ship.hullName}${ship.count > 1 ? \"s\" : \"\"}`;\n                                return ship.avgNoseArmor > 0 ? `${name} (${ship.avgNoseArmor})` : name;\n                              })\n                              .join(\" + \")\n                          : \"-\"}\n                      </TableCell>\n                      <TableCell className=\"whitespace-normal\">\n                        {fleet.shipsByRole.length > 0\n                          ? fleet.shipsByRole.map((s) => `${s.count} ${s.role}${s.count > 1 ? \"s\" : \"\"}`).join(\" + \")\n                          : \"-\"}\n                      </TableCell>\n                      <TableCell>{fleet.operation || \"-\"}</TableCell>\n                      <TableCell>\n                        {fleet.operationComplete\n                          ? `${fleet.operationComplete}${fleet.operationCompleteDays !== null ? ` (${fleet.operationCompleteDays.toFixed(0)}d)` : \"\"}`\n                          : \"-\"}\n                      </TableCell>\n                    </TableRow>\n                  );\n                })}\n              </TableBody>\n            </Table>\n          )}\n        </AccordionContent>\n      </AccordionItem\n\n      {/* Player Fleets */}\n      <AccordionItem value=\"player-fleets\">\n        <AccordionTrigger>Player Fleets ({playerFleets.length})</AccordionTrigger>\n        <AccordionContent>\n          {playerFleets.length === 0 ? (\n            <div className=\"p-4 text-muted-foreground\">No player fleets found.</div >\n          ) : (\n            <Table>\n              <TableHeader>\n                <TableRow>\n                  <TableHead>Fleet Name</TableHead>\n                  <TableHead>Planet</TableHead>\n                  <TableHead>Target Orbit</TableHead>\n                  <TableHead>Arrival Date</TableHead>\n                  <TableHead className=\"text-right\">Days to Arrival</TableHead>\n                  <TableHead className=\"text-right\">MC Used</TableHead>\n                  <TableHead className=\"text-right\">Marine CP</TableHead>\n                  <TableHead className=\"text-right\">Total Mass</TableHead>\n                  <TableHead className=\"text-right\">Max Ship Mass</TableHead>\n                  <TableHead>Ship Hulls</TableHead>\n                  <TableHead>Ship Classes</TableHead>\n                </TableRow>\n              </TableHeader>\n              <TableBody>\n                {playerFleets.map((fleet) => (\n                  <TableRow key={fleet.id}>\n                    <TableCell className=\"font-medium\">{fleet.displayName}</TableCell>\n                    <TableCell>{fleet.planetName}</TableCell>\n                    <TableCell>{fleet.targetOrbitName}</TableCell>\n                    <TableCell>{fleet.arrivalTimeFormatted || \"-\"}</TableCell>\n                    <TableCell className=\"text-right\">\n                      {fleet.daysToTarget !== null ? `${fleet.daysToTarget.toFixed(0)}` : \"—\"}\n                    </TableCell>\n                    <TableCell className=\"text-right\">{fleet.totalMC.toFixed(0)}</TableCell>\n                    <TableCell className=\"text-right\">{fleet.marineCombatPower > 0 ? fleet.marineCombatPower : \"—\"}</TableCell>\n                    <TableCell className=\"text-right\">{(fleet.totalMass / 1000000).toFixed(0)} Mkg</TableCell>\n                    <TableCell className=\"text-right\">{(fleet.maxShipMass / 1000000).toFixed(0)} Mkg</TableCell>\n                    <TableCell className=\"whitespace-normal\">\n                      {fleet.shipsByHullType.length > 0\n                        ? fleet.shipsByHullType.map((ship, i) => (\n                            <Fragment key={ship.hullName}>\n                              {i > 0 && <br />}\n                              {ship.count} {ship.hullName}\n                              {ship.count > 1 ? \"s\" : \"\"}\n                            </Fragment>\n                          ))\n                        : \"-\"}\n                    </TableCell>\n                    <TableCell className=\"whitespace-normal\">\n                      {fleet.shipsByClass.length > 0\n                        ? fleet.shipsByClass.map((cls, i) => (\n                            <Fragment key={cls.className}>\n                              {i > 0 && <br />}\n                              {cls.count}× {cls.className}{cls.noseArmor > 0 ? ` (${cls.noseArmor})` : \"\"}\n                            </Fragment>\n                          ))\n                        : \"-\"}\n                    </TableCell>\n                  </TableRow>\n                ))}\n              </TableBody>\n            </Table>\n          )}\n        </AccordionContent>\n      </AccordionItem\n\n      {/* Ships Under Construction */}\n      <AccordionItem value=\"ships-under-construction\">\n        <AccordionTrigger>Ships Under Construction ({shipsUnderConstruction.length})</AccordionTrigger>\n        <AccordionContent>\n          {shipsUnderConstruction.length === 0 ? (\n            <div className=\"p-4 text-muted-foreground\">No ships under construction.</div >\n          ) : (\n            <Table>\n              <TableHeader>\n                <TableRow>\n                  <TableHead>Planet</TableHead>\n                  <TableHead>Design</TableHead>\n                  <TableHead>Hull</TableHead>\n                  <TableHead className=\"text-right\">Nose Armor</TableHead>\n                  <TableHead className=\"text-right\">Count</TableHead>\n                  <TableHead>Days to Complete</TableHead>\n                </TableRow>\n              </TableHeader>\n              <TableBody>\n                {(() => {\n                  const byPlanetDesign = shipsUnderConstruction.reduce((acc, ship) => {\n                    const key = `${ship.planetName}||${ship.designName}`;\n                    if (!acc.has(key))\n                      acc.set(key, {\n                        planetName: ship.planetName,\n                        designName: ship.designName,\n                        hullName: ship.hullName,\n                        noseArmor: ship.noseArmor,\n                        entries: [] as { days: number; status: \"building\" | \"queued\" | \"waiting\" }[],\n                      });\n                    acc.get(key)!.entries.push({ days: ship.daysToCompletion, status: ship.status });\n                    return acc;\n                  }, new Map<string, { planetName: string; designName: string; hullName: string; noseArmor: number; entries: { days: number; status: \"building\" | \"queued\" | \"waiting\" }[] }>());\n\n                  return [...byPlanetDesign.values()]\n                    .toSorted((a, b) => a.planetName.localeCompare(b.planetName) || a.designName.localeCompare(b.designName))\n                    .map(({ planetName, designName, hullName, noseArmor, entries }) => (\n                      <TableRow key={`${planetName}||${designName}`}>\n                        <TableCell>{planetName}</TableCell>\n                        <TableCell className=\"font-medium\">{designName}</TableCell>\n                        <TableCell>{hullName}</TableCell>\n                        <TableCell className=\"text-right\">{noseArmor > 0 ? noseArmor : \"-\"}</TableCell>\n                        <TableCell className=\"text-right\">{entries.length}</TableCell>\n                        <TableCell>\n                          {entries\n                            .toSorted((a, b) => a.days - b.days)\n                            .map((e, i) => (\n                              <Fragment key={i}>\n                                {i > 0 && \", \"}\n                                {e.status === \"waiting\" ? (\n                                  <span title=\"Waiting for materials\">⚠️{e.days.toFixed(0)}</span >\n                                ) : e.status === \"queued\" ? (\n                                  <span className=\"text-muted-foreground\" title=\"Queued\">({e.days.toFixed(0)})</span >\n                                ) : (\n                                  e.days.toFixed(0)\n                                )}\n                              </Fragment>\n                            ))}\n                        </TableCell>\n                      </TableRow>\n                    ));\n                })()}\n              </TableBody>\n            </Table>\n          )}\n        </AccordionContent>\n      </AccordionItem>\n    </SmartAccordion>\n  );\n}\n",
  "filePath": "terra-invicta-assistant\\src\\app\\game\\current\\fleets-component.tsx"
}
```

**Output:**
```
Wrote file successfully.
```

---

## Assistant (Build · Gemma 4-26B-A4B (local) · 71.4s)

_Thinking:_

Now I'll update `fleets.tsx`.




**Tool: edit**

**Input:**
```json
{
  "filePath": "terra-invicta-assistant\\src\\app\\game\\current\\fleets.tsx",
  "newString": "import { Analysis } from \"@/lib/analysis\";\nimport { NavItem } from \"./types\";\nimport { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from \"@/components/ui/table\";\nimport { Collapsible, CollapsibleContent, CollapsibleTrigger } from \"@/components/ui/collapsible\";\nimport { AccordionContent, AccordionItem, AccordionTrigger } from \"@/components/ui/accordion\";\nimport { SmartAccordion } from \"@/components/ui/smart-accordion\";\nimport { Button } from \"@/components/ui/button\";\nimport { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from \"@/components/ui/tooltip\";\nimport { diffDateTime, sortByDateTime, toDays } from \"@/lib/utils\";\nimport { Fragment } from \"react\";\nimport { FactionIcons, MissionControl } from \"@/components/icons\";\nimport { twMerge } from \"tailwind-merge\";\nimport { FleetsComponent } from \"./fleets-component\";\n\nexport function getFleetsUi(analysis: Analysis): NavItem {\n  const byTarget = analysis.alienFleetsToPlayerOrbits.reduce((acc, fleet) => {\n    const key = fleet.planetName || \"Unknown Orbit\";\n    if (!acc.has(key)) {\n      acc.set(key, []);\n    }\n    acc.get(key)!.push(fleet);\n    return acc;\n  }, new Map<string, typeof analysis.alienFleetsToPlayerOrbits>());\n  const label = [\n    ...byTarget.entries().map(([target, rawFleets]) => {\n      const fleets = rawFleets.filter((f) => f.deltaV > 0 && (f.daysToTarget || 0) > 0);\n      const surv = rawFleets.filter((f) => f.operation === \"AlienEarthSurveillanceOperation\" && !f.arrivalTime);\n      const survInfo = surv.length ? (\n        <>\n          <span className=\"text-white bg-destructive rounded py-2 px-3 font-bold\">\n            {surv\n              .map((f) => f.operationCompleteDays || 0)\n              .reduce((a, b) => Math.min(a, b), 9999999999)\n              .toFixed(0)}\n            d Surveillance\n          </span >{\" \"}\n        </>\n      ) : null;\n      if (fleets.length === 0) {\n        if (survInfo) {\n          return (\n            <span\n              key={target}\n            >\n              {target}: {survInfo}\n            </span >\n          );\n        }\n        return null;\n      }\n      // now that we know the arrival of the first one, find all arriving within 14 days to summarize MC\n      const firstFleet = sortByDateTime(fleets, (f) => f.arrivalTime || analysis.gameCurrentDateTime)[0];\n      const firstFleets = fleets.filter(\n        (f) =>\n          toDays(\n            diffDateTime(\n              f.arrivalTime || analysis.gameCurrentDateTime,\n              firstFleet.arrivalTime || analysis.gameCurrentDateTime,\n            ),\n          ) < 14,\n      );\n      const firstMc = firstFleets.reduce((sum, f) => sum + f.totalMC, 0);\n\n      // tier 2 hab (60d), fusion power, and defense module (90d) take a total of 150 days\n      // tier 3 hab (90d), fusion power, and defense module (180d) take a total of 270 days.\n      // T2 hab should be able to stop a bombard from a 10MC fleet, and T3 is the best we can do anyway, plus the turn time of 30 days should make for enough warning\n      // before that, we'll still have the nameplate warning and can look at details in the fleets tab\n      const warningNeeded = (firstMc > 10 ? 270 : 150) + 30;\n      const daysToTarget = firstFleet.daysToTarget || 0;\n      const farFuture = daysToTarget > warningNeeded;\n      const className = twMerge(\n        farFuture && \"px-1 -mx-1 py-0.5 -my-0.5 rounded bg-green-500\",\n        farFuture &&\n          (daysToTarget < warningNeeded + 50\n            ? \"bg-red-200\"\n            : daysToTarget < warningNeeded + 100\n              ? \"bg-yellow-200\"\n              : \"bg-green-200\"),\n      );\n      return (\n        <span\n          key={target}\n          className={className}\n          title={`${fleets.length} fleet(s) targeting ${target}, arriving in ${daysToTarget.toFixed(\n            0,\n          )} days, using ${firstMc.toFixed(0)} MC`}\n        >\n          {target}\n          {fleets.length > 1 ? `(${fleets.length})` : \"\"}\n          {farFuture ? (\n            \"\"\n          ) : (\n            <>\n              : {daysToTarget.toFixed(0)}d <MissionControl />\n              {firstMc.toFixed(0)}\n            </>\n          )}\n          {survInfo && <>,{survInfo}</>}\n        </span >\n      );\n    }),\n  ].filter((i) => !!i);\n  return {\n    key: \"fleets\",\n    label: (\n      <>\n        Fleets\n        {label.length > 0 ? (\n          <>\n            {\" - \"}\n            {label.map((i, ix) => (\n              <Fragment key={ix}>\n                {i}\n                {ix < label.length - 1 ? \" | \" : \"\"}\n              </Fragment>\n            ))}\n          </>\n        ) : (\n          \"\"\n        )}\n      </>\n    ),\n    content: <FleetsComponent analysis={analysis} />,\n  };\n}\n",
  "oldString": "import { Analysis } from \"@/lib/analysis\";\nimport { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from \"@/components/ui/table\";\nimport { Collapsible, CollapsibleContent, CollapsibleTrigger } from \"@/components/ui/collapsible\";\nimport { AccordionContent, AccordionItem, AccordionTrigger } from \"@/components/ui/accordion\";\nimport { SmartAccordion } from \"@/components/ui/smart-accordion\";\nimport { Button } from \"@/components/ui/button\";\nimport { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from \"@/components/ui/tooltip\";\nimport { diffDateTime, sortByDateTime, toDays } from \"@/lib/utils\";\nimport { Fragment } from \"react/jsx-runtime\";\nimport { FactionIcons, MissionControl } from \"@/components/icons\";\nimport { twMerge } from \"tailwind-merge\";\nimport { FleetsComponent } from \"./fleets-component\"; \n"
}
```

**Error:**
```
Could not find oldString in the file. It must match exactly, including whitespace, indentation, and line endings.
```

---

## Assistant (Build · Gemma 4-26B-A4B (local) · 9.5s)

_Thinking:_

I'll use `Read` to get the content of `fleets.tsx`.

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
13: export function getFleetsUi(analysis: Analysis): NavItem {
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
34:           </span >{" "}
35:         </>
36:       ) : null;
37:       if (fleets.length === 0) {
38:         if (survInfo) {
39:           return (
40:             <span
41:               key={target}
42:             >
43:               {target}: {survInfo}
44:             </span >
45:           );
46:         }
47:         return null;
48:       }
49:       // now that we know the arrival of the first one, find all arriving within 14 days to summarize MC
50:       const firstFleet = sortByDateTime(fleets, (f) => f.arrivalTime || analysis.gameCurrentDateTime)[0];
51:       const firstFleets = fleets.filter(
52:         (f) =>
53:           toDays(
54:             diffDateTime(
55:               f.arrivalTime || analysis.gameCurrentDateTime,
56:               firstFleet.arrivalTime || analysis.gameCurrentDateTime,
57:             ),
58:           ) < 14,
59:       );
60:       const firstMc = firstFleets.reduce((sum, f) => sum + f.totalMC, 0);
61: 
62:       // tier 2 hab (60d), fusion power, and defense module (90d) take a total of 150 days
63:       // tier 3 hab (90d), fusion power, and defense module (180d) take a total of 270 days.
64:       // T2 hab should be able to stop a bombard from a 10MC fleet, and T3 is the best we can do anyway, plus the turn time of 30 days should make for enough warning
65:       // before that, we'll still have the nameplate warning and can look at details in the fleets tab
66:       const warningNeeded = (firstMc > 10 ? 270 : 150) + 30;
67:       const daysToTarget = firstFleet.daysToTarget || 0;
68:       const farFuture = daysToTarget > warningNeeded;
69:       const className = twMerge(
70:         farFuture && "px-1 -mx-1 py-0.5 -my-0.5 rounded bg-green-500",
71:         farFuture &&
72:           (daysToTarget < warningNeeded + 50
73:             ? "bg-red-200"
74:             : daysToTarget < warningNeeded + 100
75:               ? "bg-yellow-200"
76:               : "bg-green-200"),
77:       );
78:       return (
79:         <span
80:           key={target}
81:           className={className}
82:           title={`${fleets.length} fleet(s) targeting ${target}, arriving in ${daysToTarget.toFixed(
83:             0,
84:           )} days, using ${firstMc.toFixed(0)} MC`}
85:         >
86:           {target}
87:           {fleets.length > 1 ? `(${fleets.length})` : ""}
88:           {farFuture ? (
89:             ""
90:           ) : (
91:             <>
92:               : {daysToTarget.toFixed(0)}d <MissionControl />
93:               {firstMc.toFixed(0)}
94:             </>
95:           )}
96:           {survInfo && <>,{survInfo}</>}
97:         </span >
98:       );
99:     }),
100:   ].filter((i) => !!i);
101:   return {
102:     key: "fleets",
103:     label: (
104:       <>
105:         Fleets
106:         {label.length > 0 ? (
107:           <>
108:             {" - "}
109:             {label.map((i, ix) => (
110:               <Fragment key={ix}>
111:                 {i}
112:                 {ix < label.length - 1 ? " | " : ""}
113:               </Fragment>
114:             ))}
115:           </>
116:         ) : (
117:           ""
118:         )}
119:       </>
120:     ),
121:     content: <FleetsComponent analysis={analysis} />,
122:   };
123: }
124: 
125:     acc.get(key)!.push(fleet);
126:     return acc;
127:   }, new Map<string, typeof analysis.alienFleetsToPlayerOrbits>());
128:   const label = [
129:     ...byTarget.entries().map(([target, rawFleets]) => {
130:       const fleets = rawFleets.filter((f) => f.deltaV > 0 && (f.daysToTarget || 0) > 0);
131:       const surv = rawFleets.filter((f) => f.operation === "AlienEarthSurveillanceOperation" && !f.arrivalTime);
132:       const survInfo = surv.length ? (
133:         <>
134:           <span className="text-white bg-destructive rounded py-2 px-3 font-bold">
135:             {surv
136:               .map((f) => f.operationCompleteDays || 0)
137:               .reduce((a, b) => Math.min(a, b), 9999999999)
138:               .toFixed(0)}
139:             d Surveillance
140:           </span>{" "}
141:         </>
142:       ) : null;
143:       if (fleets.length === 0) {
144:         if (survInfo) {
145:           return (
146:             <span>
147:               {target}: {survInfo}
148:             </span>
149:           );
150:         }
151:         return null;
152:       }
153:       // now that we know the arrival of the first one, find all arriving within 14 days to summarize MC
154:       const firstFleet = sortByDateTime(fleets, (f) => f.arrivalTime || analysis.gameCurrentDateTime)[0];
155:       const firstFleets = fleets.filter(
156:         (f) =>
157:           toDays(
158:             diffDateTime(
159:               f.arrivalTime || analysis.gameCurrentDateTime,
160:               firstFleet.arrivalTime || analysis.gameCurrentDateTime,
161:             ),
162:           ) < 14,
163:       );
164:       const firstMc = firstFleets.reduce((sum, f) => sum + f.totalMC, 0);
165: 
166:       // tier 2 hab (60d), fusion power, and defense module (90d) take a total of 150 days
167:       // tier 3 hab (90d), fusion power, and defense module (180d) take a total of 270 days.
168:       // T2 hab should be able to stop a bombard from a 10MC fleet, and T3 is the best we can do anyway, plus the turn time of 30 days should make for enough warning
169:       // before that, we'll still have the nameplate warning and can look at details in the fleets tab
170:       const warningNeeded = (firstMc > 10 ? 270 : 150) + 30;
171:       const daysToTarget = firstFleet.daysToTarget || 0;
172:       const farFuture = daysToTarget > warningNeeded;
173:       const className = twMerge(
174:         farFuture && "px-1 -mx-1 py-0.5 -my-0.5 rounded bg-green-500",
175:         farFuture &&
176:           (daysToTarget < warningNeeded + 50
177:             ? "bg-red-200"
178:             : daysToTarget < warningNeeded + 100
179:               ? "bg-yellow-200"
180:               : "bg-green-200"),
181:       );
182:       return (
183:         <span
184:           className={className}
185:           title={`${fleets.length} fleet(s) targeting ${target}, arriving in ${daysToTarget.toFixed(
186:             0,
187:           )} days, using ${firstMc.toFixed(0)} MC`}
188:         >
189:           {target}
190:           {fleets.length > 1 ? `(${fleets.length})` : ""}
191:           {farFuture ? (
192:             ""
193:           ) : (
194:             <>
195:               : {daysToTarget.toFixed(0)}d <MissionControl />
196:               {firstMc.toFixed(0)}
197:             </>
198:           )}
199:           {survInfo && <>,{survInfo}</>}
200:         </span>
201:       );
202:     }),
203:   ].filter((i) => !!i);
204: 
205:   return {
206:     key: "fleets",
207:     tab: (
208:       <>
209:         Fleets
210:         {label.length > 0 ? (
211:           <>
212:             {" - "}
213:             {label.map((i, ix) => (
214:               <Fragment key={ix}>
215:                 {i}
216:                 {ix < label.length - 1 ? " | " : ""}
217:               </Fragment>
218:             ))}
219:           </>
220:         ) : (
221:           ""
222:         )}
223:       </>
224:     ),
225:     content: <FleetsComponent analysis={analysis} />,
226:   };
227: }
228: 
229: function FleetsComponent({ analysis }: { analysis: Analysis }) {
230:   const alienFleets = analysis.alienFleetsToPlayerOrbits;
231:   const humanEnemyFleets = analysis.humanEnemyFleetsToPlayerOrbits;
232:   const playerFleets = analysis.playerFleets;
233:   const shipsUnderConstruction = analysis.playerShipsUnderConstruction;
234: 
235:   return (
236:     <SmartAccordion
237:       type="multiple"
238:       storageKey="fleetsSections"
239:       defaultValue={["alien-fleets", "human-enemy-fleets", "player-fleets", "ships-under-construction"]}
240:     >
241:       {/* Alien Fleets */}
242:       <AccordionItem value="alien-fleets">
243:         <AccordionTrigger>Alien Fleets ({alienFleets.length})</AccordionTrigger>
244:         <AccordionContent>
245:           {alienFleets.length === 0 ? (
246:             <div className="p-4 text-muted-foreground">No alien fleets detected heading to player orbits.</div>
247:           ) : (
248:             <div className="space-y-2">
249:               <p>Tracking planets: {analysis.playerInterestedPlanets.map((p) => p.displayName).join(", ")}</p>
250:               <Table>
251:                 <TableHeader>
252:                   <TableRow>
253:                     <TableHead>Fleet Name</TableHead>
254:                     <TableHead>Planet</TableHead>
255:                     <TableHead>Target Orbit</TableHead>
256:                     <TableHead>Arrival Date</TableHead>
257:                     <TableHead className="text-right">Days to Arrival</TableHead>
258:                     <TableHead className="text-right">MC Used</TableHead>
259:                     <TableHead className="text-right">Marine CP</TableHead>
260:                     <TableHead className="text-right">Total Mass</TableHead>
261:                     <TableHead className="text-right">Max Ship Mass</TableHead>
262:                     <TableHead>Ships Hulls</TableHead>
263:                     <TableHead>Ships Roles</TableHead>
264:                     <TableHead>Operation</TableHead>
265:                     <TableHead>Operation Complete</TableHead>
266:                   </TableRow>
267:                 </TableHeader>
268:                 <TableBody>
269:                   {alienFleets.map((fleet) => (
270:                     <TableRow key={fleet.id} className={twMerge(fleet.deltaV === 0 ? "bg-gray-500/5" : "")}>
271:                       <TableCell className="font-medium">{fleet.displayName}</TableCell>
272:                       <TableCell>{fleet.planetName}</TableCell>
273:                       <TableCell>{fleet.targetOrbitName}</TableCell>
274:                       <TableCell>{fleet.arrivalTimeFormatted || "-"}</TableCell>
275:                       <TableCell className="text-right">
276:                         {fleet.daysToTarget !== null ? `${fleet.daysToTarget.toFixed(0)}` : "—"}
277:                       </TableCell>
278:                       <TableCell className="text-right">{fleet.totalMC.toFixed(0)}</TableCell>
279:                       <TableCell className="text-right">{fleet.marineCombatPower > 0 ? fleet.marineCombatPower : "—"}</TableCell>
280:                       <TableCell className="text-right">{(fleet.totalMass / 1000000).toFixed(0)} Mkg</TableCell>
281:                       <TableCell className="text-right">{(fleet.maxShipMass / 1000000).toFixed(0)} Mkg</TableCell>
282:                       <TableCell className="whitespace-normal">
283:                         {fleet.shipsByHullType.length > 0
284:                           ? fleet.shipsByHullType
285:                               .map((ship) => {
286:                                 const name = `${ship.count} ${ship.hullName.replace("Alien ", "")}${ship.count > 1 ? "s" : ""}`;
287:                                 return ship.avgNoseArmor > 0 ? `${name} (${ship.avgNoseArmor})` : name;
288:                               })
289:                               .join(" + ")
290:                           : "-"}
291:                       </TableCell>
292:                       <TableCell className="whitespace-normal">
293:                         {fleet.shipsByRole.length > 0
294:                           ? fleet.shipsByRole
295:                               .map((ship) => `${ship.count} ${ship.role}${ship.count > 1 ? "s" : ""}`)
296:                               .join(" + ")
297:                           : "-"}
298:                       </TableCell>
299:                       <TableCell>{fleet.operation || "-"}</TableCell>
300:                       <TableCell>
301:                         {fleet.operationComplete
302:                           ? `${fleet.operationComplete}${
303:                               fleet.operationCompleteDays !== null
304:                                 ? ` (${fleet.operationCompleteDays.toFixed(0)}d)`
305:                                 : ""
306:                             }`
307:                           : "-"}
308:                       </TableCell>
309:                     </TableRow>
310:                   ))}
311:                 </TableBody>
312:               </Table>
313: 
314:               {/* Planetary Defense Summary */}
315:               <div className="mt-8">
316:                 <h2 className="text-2xl font-bold mb-4">Planetary Defense Summary</h2>
317:                 <Table>
318:                   <TableHeader>
319:                     <TableRow>
320:                       <TableHead>Planet</TableHead>
321:                       <TableHead className="text-right">Days to Arrival</TableHead>
322:                       <TableHead className="text-right">Alien Fleet MC</TableHead>
323:                       <TableHead className="text-right">Player Fleet MC</TableHead>
324:                       <TableHead>Habs (Active / Potential Combat)</TableHead>
325:                     </TableRow>
326:                   </TableHeader>
327:                   <TableBody>
328:                     {(() => {
329:                       const planetsWithFleets = new Set(
330:                         analysis.alienFleetsToPlayerOrbits.map((f) => f.planetName || "Unknown"),
331:                       );
332:                       const defenseData = Array.from(planetsWithFleets)
333:                         .map((planet) => {
334:                           const fleetsAtPlanet = analysis.alienFleetsToPlayerOrbits.filter(
335:                             (f) => f.planetName === planet,
336:                           );
337:                           const totalAlienMC = fleetsAtPlanet.reduce((sum, f) => sum + (f.totalMC || 0), 0);
338:                           const incomingFleets = fleetsAtPlanet.filter(
339:                             (f) => f.daysToTarget !== null && f.daysToTarget > 0,
340:                           );
341:                           const daysToArrival =
342:                             incomingFleets.length > 0
343:                               ? Math.min(...incomingFleets.map((f) => f.daysToTarget!))
344:                               : null;
345:                           const playerFleetsAtPlanet = analysis.playerFleets.filter(
346:                             (f) => f.planetName === planet,
347:                           );
348:                           const relevantPlayerFleets = playerFleetsAtPlanet.filter((f) => {
349:                             if (f.daysToTarget === null || f.daysToTarget <= 0) return true;
350:                             if (daysToArrival === null) return false;
351:                             return f.daysToTarget < daysToArrival;
352:                           });
353:                           const totalPlayerMC = relevantPlayerFleets.reduce((sum, f) => sum + (f.totalMC || 0), 0);
354:                           const habsAtPlanet = analysis.playerHabs.filter((h) => h.planetName === planet);
355:                           return { planet, totalAlienMC, totalPlayerMC, daysToArrival, habs: habsAtPlanet };
356:                         })
357:                         .filter((d) => d.habs.length > 0)
358:                         .toSorted((a, b) => {
359:                           if (a.daysToArrival === null && b.daysToArrival === null) return 0;
360:                           if (a.daysToArrival === null) return 1;
361:                           if (b.daysToArrival === null) return -1;
362:                           return a.daysToArrival - b.daysToArrival;
363:                         });
364: 
365:                       return defenseData.map(({ planet, totalAlienMC, totalPlayerMC, daysToArrival, habs }) => (
366:                         <TableRow key={planet}>
367:                           <TableCell className="font-medium">{planet}</TableCell>
368:                           <TableCell className="text-right">
369:                             {daysToArrival !== null ? daysToArrival.toFixed(0) : "—"}
370:                           </TableCell>
371:                           <TableCell className="text-right">{totalAlienMC.toFixed(0)}</TableCell>
372:                           <TableCell className="text-right">{totalPlayerMC.toFixed(0)}</TableCell>
373:                           <TableCell>
374:                             <TooltipProvider>
375:                               <div className="flex gap-2 flex-wrap">
376:                                 {habs
377:                                   .toSorted((a, b) => {
378:                                     if (a.habType === "Station" && b.habType !== "Station") return -1;
379:                                     if (a.habType !== "Station" && b.habType === "Station") return 1;
380:                                     return 0;
381:                                   })
382:                                   .map((hab) => {
383:                                     const activeCombat = hab.activeEffects.combatScore || 0;
384:                                     const potentialCombat = hab.potentialEffects.combatScore || 0;
385:                                     const combatDisplay =
386:                                       activeCombat === potentialCombat
387:                                         ? activeCombat.toFixed(0)
388:                                         : `${activeCombat.toFixed(0)} / ${potentialCombat.toFixed(0)}`;
389:                                     const bgColor = hab.habType === "Station" ? "bg-yellow-100" : "bg-green-100";
390:                                     return (
391:                                       <Tooltip key={hab.id}>
392:                                         <TooltipTrigger asChild>
393:                                           <span className={`cursor-help ${bgColor} px-1.5 py-0.5 rounded`}>
394:                                             {combatDisplay}
395:                                           </span>
396:                                         </TooltipTrigger>
397:                                         <TooltipContent>
398:                                           <div>{hab.displayName}</div>
399:                                         </TooltipContent>
400:                                       </Tooltip>
401:                                     );
402:                                   })}
403:                               </div>
404:                             </TooltipProvider>
405:                           </TableCell>
406:                         </TableRow>
407:                       ));
408:                     })()}
409:                   </TableBody>
410:                 </Table>
411:               </div>
412: 
413:               <Collapsible>
414:                 <CollapsibleTrigger asChild>
415:                   <Button>Debug Data</Button>
416:                 </CollapsibleTrigger>
417:                 <CollapsibleContent>
418:                   <pre>{JSON.stringify(alienFleets, null, 2)}</pre>
419:                 </CollapsibleContent>
420:               </Collapsible>
421:             </div>
422:           )}
423:         </AccordionContent>
424:       </AccordionItem>
425: 
426:       {/* Other Human Factions Fleets */}
427:       <AccordionItem value="human-enemy-fleets">
428:         <AccordionTrigger>Other Human Factions ({humanEnemyFleets.length})</AccordionTrigger>
429:         <AccordionContent>
430:           {humanEnemyFleets.length === 0 ? (
431:             <div className="p-4 text-muted-foreground">No other human faction fleets detected heading to player orbits.</div>
432:           ) : (
433:             <Table>
434:               <TableHeader>
435:                 <TableRow>
436:                   <TableHead>Faction</TableHead>
437:                   <TableHead>Fleet Name</TableHead>
438:                   <TableHead>Planet</TableHead>
439:                   <TableHead>Target Orbit</TableHead>
440:                   <TableHead>Arrival Date</TableHead>
441:                   <TableHead className="text-right">Days to Arrival</TableHead>
442:                   <TableHead className="text-right">MC Used</TableHead>
443:                   <TableHead className="text-right">Marine CP</TableHead>
444:                   <TableHead className="text-right">Total Mass</TableHead>
445:                   <TableHead className="text-right">Max Ship Mass</TableHead>
446:                   <TableHead>Ship Hulls</TableHead>
447:                   <TableHead>Ship Roles</TableHead>
448:                   <TableHead>Operation</TableHead>
449:                   <TableHead>Operation Complete</TableHead>
450:                 </TableRow>
451:               </TableHeader>
452:               <TableBody>
453:                 {humanEnemyFleets.map((fleet) => {
454:                   const FactionIcon = fleet.factionTemplateName
455:                     ? FactionIcons[fleet.factionTemplateName as keyof typeof FactionIcons]
456:                     : null;
457:                   return (
458:                     <TableRow key={fleet.id} className={twMerge(fleet.deltaV === 0 ? "bg-gray-500/5" : "")}>
459:                       <TableCell>
460:                         <div className="flex items-center gap-1">
461:                           {FactionIcon && <FactionIcon className="p-1 rounded" />}
462:                           <span className="text-sm">{fleet.factionDisplayName ?? fleet.factionTemplateName ?? "Unknown"}</span>
463:                         </div>
464:                       </TableCell>
465:                       <TableCell className="font-medium">{fleet.displayName}</TableCell>
466:                       <TableCell>{fleet.planetName}</TableCell>
467:                       <TableCell>{fleet.targetOrbitName}</TableCell>
468:                       <TableCell>{fleet.arrivalTimeFormatted || "-"}</TableCell>
469:                       <TableCell className="text-right">
470:                         {fleet.daysToTarget !== null ? `${fleet.daysToTarget.toFixed(0)}` : "—"}
471:                       </TableCell>
472:                       <TableCell className="text-right">{fleet.totalMC.toFixed(0)}</TableCell>
473:                       <TableCell className="text-right">{fleet.marineCombatPower > 0 ? fleet.marineCombatPower : "—"}</TableCell>
474:                       <TableCell className="text-right">{(fleet.totalMass / 1000000).toFixed(0)} Mkg</TableCell>
475:                       <TableCell className="text-right">{(fleet.maxShipMass / 1000000).toFixed(0)} Mkg</TableCell>
476:                       <TableCell className="whitespace-normal">
477:                         {fleet.shipsByHullType.length > 0
478:                           ? fleet.shipsByHullType
479:                               .map((ship) => {
480:                                 const name = `${ship.count} ${ship.hullName}${ship.count > 1 ? "s" : ""}`;
481:                                 return ship.avgNoseArmor > 0 ? `${name} (${ship.avgNoseArmor})` : name;
482:                               })
483:                               .join(" + ")
484:                           : "-"}
485:                       </TableCell>
486:                       <TableCell className="whitespace-normal">
487:                         {fleet.shipsByRole.length > 0
488:                           ? fleet.shipsByRole.map((s) => `${s.count} ${s.role}${s.count > 1 ? "s" : ""}`).join(" + ")
489:                           : "-"}
490:                       </TableCell>
491:                       <TableCell>{fleet.operation || "-"}</TableCell>
492:                       <TableCell>
493:                         {fleet.operationComplete
494:                           ? `${fleet.operationComplete}${fleet.operationCompleteDays !== null ? ` (${fleet.operationCompleteDays.toFixed(0)}d)` : ""}`
495:                           : "-"}
496:                       </TableCell>
497:                     </TableRow>
498:                   );
499:                 })}
500:               </TableBody>
501:             </Table>
502:           )}
503:         </AccordionContent>
504:       </AccordionItem>
505: 
506:       {/* Player Fleets */}
507:       <AccordionItem value="player-fleets">
508:         <AccordionTrigger>Player Fleets ({playerFleets.length})</AccordionTrigger>
509:         <AccordionContent>
510:           {playerFleets.length === 0 ? (
511:             <div className="p-4 text-muted-foreground">No player fleets found.</div>
512:           ) : (
513:             <Table>
514:               <TableHeader>
515:                 <TableRow>
516:                   <TableHead>Fleet Name</TableHead>
517:                   <TableHead>Planet</TableHead>
518:                   <TableHead>Target Orbit</TableHead>
519:                   <TableHead>Arrival Date</TableHead>
520:                   <TableHead className="text-right">Days to Arrival</TableHead>
521:                   <TableHead className="text-right">MC Used</TableHead>
522:                   <TableHead className="text-right">Marine CP</TableHead>
523:                   <TableHead className="text-right">Total Mass</TableHead>
524:                   <TableHead className="text-right">Max Ship Mass</TableHead>
525:                   <TableHead>Ship Hulls</TableHead>
526:                   <TableHead>Ship Classes</TableHead>
527:                 </TableRow>
528:               </TableHeader>
529:               <TableBody>
530:                 {playerFleets.map((fleet) => (
531:                   <TableRow key={fleet.id}>
532:                     <TableCell className="font-medium">{fleet.displayName}</TableCell>
533:                     <TableCell>{fleet.planetName}</TableCell>
534:                     <TableCell>{fleet.targetOrbitName}</TableCell>
535:                     <TableCell>{fleet.arrivalTimeFormatted || "-"}</TableCell>
536:                     <TableCell className="text-right">
537:                       {fleet.daysToTarget !== null ? `${fleet.daysToTarget.toFixed(0)}` : "—"}
538:                     </TableCell>
539:                     <TableCell className="text-right">{fleet.totalMC.toFixed(0)}</TableCell>
540:                     <TableCell className="text-right">{fleet.marineCombatPower > 0 ? fleet.marineCombatPower : "—"}</TableCell>
541:                     <TableCell className="text-right">{(fleet.totalMass / 1000000).toFixed(0)} Mkg</TableCell>
542:                     <TableCell className="text-right">{(fleet.maxShipMass / 1000000).toFixed(0)} Mkg</TableCell>
543:                     <TableCell className="whitespace-normal">
544:                       {fleet.shipsByHullType.length > 0
545:                         ? fleet.shipsByHullType.map((ship, i) => (
546:                             <Fragment key={ship.hullName}>
547:                               {i > 0 && <br />}
548:                               {ship.count} {ship.hullName}
549:                               {ship.count > 1 ? "s" : ""}
550:                             </Fragment>
551:                           ))
552:                         : "-"}
553:                     </TableCell>
554:                     <TableCell className="whitespace-normal">
555:                       {fleet.shipsByClass.length > 0
556:                         ? fleet.shipsByClass.map((cls, i) => (
557:                             <Fragment key={cls.className}>
558:                               {i > 0 && <br />}
559:                               {cls.count}× {cls.className}{cls.noseArmor > 0 ? ` (${cls.noseArmor})` : ""}
560:                             </Fragment>
561:                           ))
562:                         : "-"}
563:                     </TableCell>
564:                   </TableRow>
565:                 ))}
566:               </TableBody>
567:             </Table>
568:           )}
569:         </AccordionContent>
570:       </AccordionItem>
571: 
572:       {/* Ships Under Construction */}
573:       <AccordionItem value="ships-under-construction">
574:         <AccordionTrigger>Ships Under Construction ({shipsUnderConstruction.length})</AccordionTrigger>
575:         <AccordionContent>
576:           {shipsUnderConstruction.length === 0 ? (
577:             <div className="p-4 text-muted-foreground">No ships under construction.</div>
578:           ) : (
579:             <Table>
580:               <TableHeader>
581:                 <TableRow>
582:                   <TableHead>Planet</TableHead>
583:                   <TableHead>Design</TableHead>
584:                   <TableHead>Hull</TableHead>
585:                   <TableHead className="text-right">Nose Armor</TableHead>
586:                   <TableHead className="text-right">Count</TableHead>
587:                   <TableHead>Days to Complete</TableHead>
588:                 </TableRow>
589:               </TableHeader>
590:               <TableBody>
591:                 {(() => {
592:                   const byPlanetDesign = shipsUnderConstruction.reduce((acc, ship) => {
593:                     const key = `${ship.planetName}||${ship.designName}`;
594:                     if (!acc.has(key))
595:                       acc.set(key, {
596:                         planetName: ship.planetName,
597:                         designName: ship.designName,
598:                         hullName: ship.hullName,
599:                         noseArmor: ship.noseArmor,
600:                         entries: [] as { days: number; status: "building" | "queued" | "waiting" }[],
601:                       });
602:                     acc.get(key)!.entries.push({ days: ship.daysToCompletion, status: ship.status });
603:                     return acc;
604:                   }, new Map<string, { planetName: string; designName: string; hullName: string; noseArmor: number; entries: { days: number; status: "building" | "queued" | "waiting" }[] }>());
605: 
606:                   return [...byPlanetDesign.values()]
607:                     .toSorted((a, b) => a.planetName.localeCompare(b.planetName) || a.designName.localeCompare(b.designName))
608:                     .map(({ planetName, designName, hullName, noseArmor, entries }) => (
609:                       <TableRow key={`${planetName}||${designName}`}>
610:                         <TableCell>{planetName}</TableCell>
611:                         <TableCell className="font-medium">{designName}</TableCell>
612:                         <TableCell>{hullName}</TableCell>
613:                         <TableCell className="text-right">{noseArmor > 0 ? noseArmor : "-"}</TableCell>
614:                         <TableCell className="text-right">{entries.length}</TableCell>
615:                         <TableCell>
616:                           {entries
617:                             .toSorted((a, b) => a.days - b.days)
618:                             .map((e, i) => (
619:                               <Fragment key={i}>
620:                                 {i > 0 && ", "}
621:                                 {e.status === "waiting" ? (
622:                                   <span title="Waiting for materials">⚠️{e.days.toFixed(0)}</span>
623:                                 ) : e.status === "queued" ? (
624:                                   <span className="text-muted-foreground" title="Queued">({e.days.toFixed(0)})</span>
625:                                 ) : (
626:                                   e.days.toFixed(0)
627:                                 )}
628:                               </Fragment>
629:                             ))}
630:                         </TableCell>
631:                       </TableRow>
632:                     ));
633:                 })()}
634:               </TableBody>
635:             </Table>
636:           )}
637:         </AccordionContent>
638:       </AccordionItem>
639:     </SmartAccordion>
640:   );
641: }

(End of file - total 641 lines)
</content>
```

---

## Assistant (Build · Gemma 4-26B-A4B (local) · 160.3s)

_Thinking:_

Okay, I have the content of `fleets.tsx`.

Now I will:
1. Create `src/app/game/current/fleets-component.tsx` with `FleetsComponent`.
2. Update `src/app/game/current/fleets.tsx` to:
   - Import `NavItem` and `FleetsComponent`.
   - Update `getFleetsUi` to return `NavItem`.

Wait, I'll do `fleets-component.tsx` first.

**Tool: invalid**

**Input:**
```json
{
  "tool": "write",
  "error": "Invalid input for tool write: JSON parsing failed: Text: {\"content\":\"import { Analysis } from \\\"@/lib/analysis\\\";\\nimport { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from \\\"@/components/ui/table\\\";\\nimport { AccordionContent, AccordionItem, AccordionTrigger } from \\\"@/components/ui/accordion\\\";\\nimport { SmartAccordion } from \\\"@/components/ui/smart-accordion\\\";\\nimport { Button } from \\\"@/components/ui/button\\\";\\nimport { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from \\\"@/components/ui/tooltip\\\";\\nimport { diffDateTime, sortByDateTime, toDays } from \\\"@/lib/utils\\\";\\nimport { Fragment } from \\\"react\\\";\\nimport { FactionIcons, MissionControl } from \\\"@/components/icons\\\";\\nimport { twMerge } from \\\"tailwind-merge\\\";\\n\\nexport function FleetsComponent({ analysis }: { analysis: Analysis }) {\\n  const alienFleets = analysis.alienFleetsToPlayerOrbits;\\n  const humanEnemyFleets = analysis.humanEnemyFleetsToPlayerOrbits;\\n  const playerFleets = analysis.playerFleets;\\n  const shipsUnderConstruction = analysis.playerShipsUnderConstruction;\\n\\n  return (\\n    <SmartAccordion\\n      type=\\\"multiple\\\"\\n      storageKey=\\\"fleetsSections\\\"\\n      defaultValue={[\\\"alien-fleets\\\", \\\"human-enemy-fleets\\\", \\\"player-fleets\\\", \\\"ships-under-construction\\\"]}\\n    >\\n      {/* Alien Fleets */}\\n      <AccordionItem value=\\\"alien-fleets\\\">\\n        <AccordionTrigger>Alien Fleets ({alienFleets.length})</AccordionTrigger>\\n        <AccordionContent>\\n          {alienFleets.length === 0 ? (\\n            <div className=\\\"p-4 text-muted-foreground\\\">No alien fleets detected heading to player orbits.</div >\\n          ) : (\\n            <div className=\\\"space-y-2\\\">\\n              <p>Tracking planets: {analysis.playerInterestedPlanets.map((p) => p.displayName).join(\\\", \\\")}</p>\\n              <Table>\\n                <TableHeader>\\n                  <TableRow>\\n                    <TableHead>Fleet Name</TableHead>\\n                    <TableHead>Planet</TableHead>\\n                    <TableHead>Target Orbit</TableHead>\\n                    <TableHead>Arrival Date</TableHead>\\n                    <TableHead className=\\\"text-right\\\">Days to Arrival</TableHead>\\n                    <TableHead className=\\\"text-right\\\">MC Used</TableHead>\\n                    <TableHead className=\\\"text-right\\\">Marine CP</TableHead>\\n                    <TableHead className=\\\"text-right\\\">Total Mass</TableHead>\\n                    <TableHead className=\\\"text-right\\\">Max Ship Mass</TableHead>\\n                    <TableHead>Ships Hulls</TableHead>\\n                    <TableHead>Ships Roles</TableHead>\\n                    <TableHead>Operation</TableHead>\\n                    <TableHead>Operation Complete</TableHead>\\n                  </TableRow>\\n                </TableHeader>\\n                <TableBody>\\n                  {alienFleets.map((fleet) => (\\n                    <TableRow key={fleet.id} className={twMerge(fleet.deltaV === 0 ? \\\"bg-gray-500/5\\\" : \\\"\\\")}>\\n                      <TableCell className=\\\"font-medium\\\">{fleet.displayName}</TableCell>\\n                      <TableCell>{fleet.planetName}</TableCell>\\n                      <TableCell>{fleet.targetOrbitName}</TableCell>\\n                      <TableCell>{fleet.arrivalTimeFormatted || \\\"-\\\"}</TableCell>\\n                      <TableCell className=\\\"text-right\\\">\\n                        {fleet.daysToTarget !== null ? `${fleet.daysToTarget.toFixed(0)}` : \\\"—\\\"}\\n                      </TableCell>\\n                      <TableCell className=\\\"text-right\\\">{fleet.totalMC.toFixed(0)}</TableCell>\\n                      <TableCell className=\\\"text-right\\\">{fleet.marineCombatPower > 0 ? fleet.marineCombatPower : \\\"—\\\"}</TableCell>\\n                      <TableCell className=\\\"text-right\\\">{(fleet.totalMass / 1000000).toFixed(0)} Mkg</TableCell>\\n                      <TableCell className=\\\"text-right\\\">{(fleet.maxShipMass / 1000000).toFixed(0)} Mkg</TableCell>\\n                      <TableCell className=\\\"whitespace-normal\\\">\\n                        {fleet.shipsByHullType.length > 0\\n                          ? fleet.shipsByHullType\\n                              .map((ship) => {\\n                                const name = `${ship.count} ${ship.hullName.replace(\\\"Alien \\\", \\\"\\\")}${ship.count > 1 ? \\\"s\\\" : \\\"\\\"}`;\\n                                return ship.avgNoseArmor > 0 ? `${name} (${ship.avgNoseArmor})` : name;\\n                              })\\n                              .join(\\\" + \\\")\\n                          : \\\"-\\\"}\\n                      </TableCell>\\n                      <TableCell className=\\\"whitespace-normal\\\">\\n                        {fleet.shipsByRole.length > 0\\n                          ? fleet.shipsByRole\\n                              .map((ship) => `${ship.count} ${ship.role}${ship.count > 1 ? \\\"s\\\" : \\\"\\\"}`)\\n                              .join(\\\" + \\\")\\n                          : \\\"-\\\"}\\n                      </TableCell>\\n                      <TableCell>{fleet.operation || \\\"-\\\"}</TableCell>\\n                      <TableCell>\\n                        {fleet.operationComplete\\n                          ? `${fleet.operationComplete}${fleet.operationCompleteDays !== null ? ` (${fleet.operationCompleteDays.toFixed(0)}d)` : \\\"\\\"}`\\n                          : \\\"-\\\"}\\n                      </TableCell>\\n                    </TableRow>\\n                  ))}\\n                </TableBody>\\n              </Table>\\n\\n              {/* Planetary Defense Summary */}\\n              <div className=\\\"mt-8\\\">\\n                <h2 className=\\\"text-2xl font-bold mb-4\\\">Planetary Defense Summary</h2>\\n                <Table>\\n                  <TableHeader>\\n                    <TableRow>\\n                      <TableHead>Planet</TableHead>\\n                      <TableHead className=\\\"text-right\\\">Days to Arrival</TableHead>\\n                      <TableHead className=\\\"text-right\\\">Alien Fleet MC</TableHead>\\n                      <TableHead className=\\\"text-right\\\">Player Fleet MC</TableHead>\\n                      <TableHead>Habs (Active / Potential Combat)</TableHead>\\n                    </TableRow>\\n                  </TableHeader>\\n                  <TableBody>\\n                    {(() => {\\n                      const planetsWithFleets = new Set(\\n                        analysis.alienFleetsToPlayerOrbits.map((f) => f.planetName || \\\"Unknown\\\"),\\n                      );\\n                      const defenseData = Array.from(planetsWithFleets)\\n                        .map((planet) => {\\n                          const fleetsAtPlanet = analysis.alienFleetsToPlayerOrbits.filter(\\n                            (f) => f.planetName === planet,\\n                          );\\n                          const totalAlienMC = fleetsAtPlanet.reduce((sum, f) => sum + (f.totalMC || 0), 0);\\n                          const incomingFleets = fleetsAtPlanet.filter(\\n                            (f) => f.daysToTarget !== null && f.daysToTarget > 0,\\n                          );\\n                          const daysToArrival =\\n                            incomingFleets.length > 0\\n                              ? Math.min(...incomingFleets.map((f) => f.daysToTarget!))\\n                              : null;\\n                          const playerFleetsAtPlanet = analysis.playerFleets.filter(\\n                            (f) => f.planetName === planet,\\n                          );\\n                          const relevantPlayerFleets = playerFleetsAtPlanet.filter((f) => {\\n                            if (f.daysToTarget === null || f.daysToTarget <= 0) return true;\\n                            if (daysToArrival === null) return false;\\n                            return f.daysToTarget < daysToArrival;\\n                          });\\n                          const totalPlayerMC = relevantPlayerFleets.reduce((sum, f) => sum + (f.totalMC || 0), 0);\\n                          const habsAtPlanet = analysis.playerHabs.filter((h) => h.planetName === planet);\\n                          return { planet, totalAlienMC, totalPlayerMC, daysToArrival, habs: habsAtPlanet };\\n                        })\\n                        .filter((d) => d.habs.length > 0)\\n                        .toSorted((a, b) => {\\n                          if (a.daysToArrival === null && b.daysToArrival === null) return 0;\\n                          if (a.daysToArrival === null) return 1;\\n                          if (b.daysToArrival === null) return -1;\\n                          return a.daysToArrival - b.daysToArrival;\\n                        });\\n\\n                      return defenseData.map(({ planet, totalAlienMC, totalPlayerMC, daysToArrival, habs }) => (\\n                        <TableRow key={planet}>\\n                          <TableCell className=\\\"font-medium\\\">{planet}</TableCell>\\n                          <TableCell className=\\\"text-right\\\">\\n                            {daysToArrival !== null ? daysToArrival.toFixed(0) : \\\"—\\\"}\\n                          </TableCell>\\n                          <TableCell className=\\\"text-right\\\">{totalAlienMC.toFixed(0)}</TableCell>\\n                          <TableCell className=\\\"text-right\\\">{totalPlayerMC.toFixed(0)}</TableCell>\\n                          <TableCell>\\n                            <TooltipProvider>\\n                              <div className=\\\"flex gap-2 flex-wrap\\\">\\n                                {habs\\n                                  .toSorted((a, b) => {\\n                                    if (a.habType === \\\"Station\\\" && b.habType !== \\\"Station\\\") return -1;\\n                                    if (a.habType !== \\\"Station\\\" && b.habType === \\\"Station\\\") return 1;\\n                                    return 0;\\n                                  })\\n                                  .map((hab) => {\\n                                    const activeCombat = hab.activeEffects.combatScore || 0;\\n                                    const potentialCombat = hab.potentialEffects.combatScore || 0;\\n                                    const combatDisplay =\\n                                      activeCombat === potentialCombat\\n                                        ? activeCombat.toFixed(0)\\n                                        : `${activeCombat.toFixed(0)} / ${potentialCombat.toFixed(0)}`;\\n                                    const bgColor = hab.habType === \\\"Station\\\" ? \\\"bg-yellow-100\\\" : \\\"bg-green-100\\\";\\n                                    return (\\n                                      <Tooltip key={hab.id}>\\n                                        <TooltipTrigger asChild>\\n                                          <span className={`cursor-help ${bgColor} px-1.5 py-0.5 rounded`}>\\n                                            {combatDisplay}\\n                                          </span >\\n                                        </TooltipTrigger>\\n                                        <TooltipContent>\\n                                          <div>{hab.displayName}</div>\\n                                        </TooltipContent>\\n                                      </Tooltip>\\n                                    );\\n                                  })}\\n                                </div>\\n                            </TooltipProvider>\\n                          </TableCell>\\n                        </TableRow>\\n                      ));\\n                    })()}\\n                  </TableBody>\\n                </Table>\\n              </div >\\n\\n              <Collapsible>\\n                <CollapsibleTrigger asChild>\\n                  <Button>Debug Data</Button>\\n                </CollapsibleTrigger>\\n                <CollapsibleContent>\\n                  <pre>{JSON.stringify(alienFleets, null, 2)}</pre>\\n                </CollapsibleContent>\\n              </Collapsible>\\n            </div >\\n          )}\\n        </AccordionContent>\\n      </AccordionItem>\\n\\n      {/* Other Human Factions Fleets */}\\n      <AccordionItem value=\\\"human-enemy-fleets\\\">\\n        <AccordionTrigger>Other Human Factions ({humanEnemyFleets.length})</AccordionTrigger>\\n        <AccordionContent>\\n          {humanEnemyFleets.length === 0 ? (\\n            <div className=\\\"p-4 text-muted-foreground\\\">No other human faction fleets detected heading to player orbits.</div >\\n          ) : (\\n            <Table>\\n              <TableHeader>\\n                <TableRow>\\n                  <TableHead>Faction</TableHead>\\n                  <TableHead>Fleet Name</TableHead>\\n                  <TableHead>Planet</TableHead>\\n                  <TableHead>Target Orbit</TableHead>\\n                  <TableHead>Arrival Date</TableHead>\\n                  <TableHead className=\\\"text-right\\\">Days to Arrival</TableHead>\\n                  <TableHead className=\\\"text-right\\\">MC Used</TableHead>\\n                  <TableHead className=\\\"text-right\\\">Marine CP</TableHead>\\n                  <TableHead className=\\\"text-right\\\">Total Mass</TableHead>\\n                  <TableHead className=\\\"text-right\\\">Max Ship Mass</TableHead>\\n                  <TableHead>Ship Hulls</TableHead>\\n                  <TableHead>Ship Roles</TableHead>\\n                  <TableHead>Operation</TableHead>\\n                  <TableHead>Operation Complete</TableHead>\\n                </TableRow>\\n              </TableHeader>\\n              <TableBody>\\n                {humanEnemyFleets.map((fleet) => {\\n                  const FactionIcon = fleet.factionTemplateName\\n                    ? FactionIcons[fleet.factionTemplateName as keyof typeof FactionIcons]\\n                    : null;\\n                  return (\\n                    <TableRow key={fleet.id} className={twMerge(fleet.deltaV === 0 ? \\\"bg-gray-500/5\\\" : \\\"\\\")}>\\n                      <TableCell>\\n                        <div className=\\\"flex items-center gap-1\\\">\\n                          {FactionIcon && <FactionIcon className=\\\"p-1 rounded\\\" />}\\n                          <span className=\\\"text-sm\\\">{fleet.factionDisplayName ?? fleet.factionTemplateName ?? \\\"Unknown\\\"}</span >\\n                        </div >\\n                      </TableCell>\\n                      <TableCell className=\\\"font-medium\\\">{fleet.displayName}</TableCell>\\n                      <TableCell>{fleet.planetName}</TableCell>\\n                      <TableCell>{fleet.targetOrbitName}</TableCell>\\n                      <TableCell>{fleet.arrivalTimeFormatted || \\\"-\\\"}</TableCell>\\n                      <TableCell className=\\\"text-right\\\">\\n                        {fleet.daysToTarget !== null ? `${fleet.daysToTarget.toFixed(0)}` : \\\"—\\\"}\\n                      </TableCell>\\n                      <TableCell className=\\\"text-right\\\">{fleet.totalMC.toFixed(0)}</TableCell>\\n                      <TableCell className=\\\"text-right\\\">{fleet.marineCombatPower > 0 ? fleet.marineCombatPower : \\\"—\\\"}</TableCell>\\n                      <TableCell className=\\\"text-right\\\">{(fleet.totalMass / 1000000).toFixed(0)} Mkg</TableCell>\\n                      <TableCell className=\\\"text-right\\\">{(fleet.maxShipMass / 1000000).toFixed(0)} Mkg</TableCell>\\n                      <TableCell className=\\\"whitespace-normal\\\">\\n                        {fleet.shipsByHullType.length > 0\\n                          ? fleet.shipsByHullType\\n                              .map((ship) => {\\n                                const name = `${ship.count} ${ship.hullName}${ship.count > 1 ? \\\"s\\\" : \\\"\\\"}`;\\n                                return ship.avgNoseArmor > 0 ? `${name} (${ship.avgNoseArmor})` : name;\\n                              })\\n                              .join(\\\" + \\\")\\n                          : \\\"-\\\"}\\n                      </TableCell>\\n                      <TableCell className=\\\"whitespace-normal\\\">\\n                        {fleet.shipsByRole.length > 0\\n                          ? fleet.shipsByRole.map((s) => `${s.count} ${s.role}${s.count > 1 ? \\\"s\\\" : \\\"\\\"}`).join(\\\" + \\\")\\n                          : \\\"-\\\"}\\n                      </TableCell>\\n                      <TableCell>{fleet.operation || \\\"-\\\"}</TableCell>\\n                      <TableCell>\\n                        {fleet.operationComplete\\n                          ? `${fleet.operationComplete}${fleet.operationCompleteDays !== null ? ` (${fleet.operationCompleteDays.toFixed(0)}d)` : \\\"\\\"}`\\n                          : \\\"-\\\"}\\n                      </TableCell>\\n                    </TableRow>\\n                  );\\n                })}\\n              </TableBody>\\n            </Table>\\n          )}\\n        </AccordionContent>\\n      </AccordionItem\\n\\n      {/* Player Fleets */}\\n      <AccordionItem value=\\\"player-fleets\\\">\\n        <AccordionTrigger>Player Fleets ({playerFleets.length})</AccordionTrigger>\\n        <AccordionContent>\\n          {playerFleets.length === 0 ? (\\n            <div className=\\\"p-4 text-muted-foreground\\\">No player fleets found.</div >\\n          ) : (\\n            <Table>\\n              <TableHeader>\\n                <TableRow>\\n                  <TableHead>Fleet Name</TableHead>\\n                  <TableHead>Planet</TableHead>\\n                  <TableHead>Target Orbit</TableHead>\\n                  <TableHead>Arrival Date</TableHead>\\n                  <TableHead className=\\\"text-right\\\">Days to Arrival</TableHead>\\n                  <TableHead className=\\\"text-right\\\">MC Used</TableHead>\\n                  <TableHead className=\\\".\nError message: JSON Parse error: Unterminated string"
}
```

**Output:**
```
The arguments provided to the tool are invalid: Invalid input for tool write: JSON parsing failed: Text: {"content":"import { Analysis } from \"@/lib/analysis\";\nimport { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from \"@/components/ui/table\";\nimport { AccordionContent, AccordionItem, AccordionTrigger } from \"@/components/ui/accordion\";\nimport { SmartAccordion } from \"@/components/ui/smart-accordion\";\nimport { Button } from \"@/components/ui/button\";\nimport { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from \"@/components/ui/tooltip\";\nimport { diffDateTime, sortByDateTime, toDays } from \"@/lib/utils\";\nimport { Fragment } from \"react\";\nimport { FactionIcons, MissionControl } from \"@/components/icons\";\nimport { twMerge } from \"tailwind-merge\";\n\nexport function FleetsComponent({ analysis }: { analysis: Analysis }) {\n  const alienFleets = analysis.alienFleetsToPlayerOrbits;\n  const humanEnemyFleets = analysis.humanEnemyFleetsToPlayerOrbits;\n  const playerFleets = analysis.playerFleets;\n  const shipsUnderConstruction = analysis.playerShipsUnderConstruction;\n\n  return (\n    <SmartAccordion\n      type=\"multiple\"\n      storageKey=\"fleetsSections\"\n      defaultValue={[\"alien-fleets\", \"human-enemy-fleets\", \"player-fleets\", \"ships-under-construction\"]}\n    >\n      {/* Alien Fleets */}\n      <AccordionItem value=\"alien-fleets\">\n        <AccordionTrigger>Alien Fleets ({alienFleets.length})</AccordionTrigger>\n        <AccordionContent>\n          {alienFleets.length === 0 ? (\n            <div className=\"p-4 text-muted-foreground\">No alien fleets detected heading to player orbits.</div >\n          ) : (\n            <div className=\"space-y-2\">\n              <p>Tracking planets: {analysis.playerInterestedPlanets.map((p) => p.displayName).join(\", \")}</p>\n              <Table>\n                <TableHeader>\n                  <TableRow>\n                    <TableHead>Fleet Name</TableHead>\n                    <TableHead>Planet</TableHead>\n                    <TableHead>Target Orbit</TableHead>\n                    <TableHead>Arrival Date</TableHead>\n                    <TableHead className=\"text-right\">Days to Arrival</TableHead>\n                    <TableHead className=\"text-right\">MC Used</TableHead>\n                    <TableHead className=\"text-right\">Marine CP</TableHead>\n                    <TableHead className=\"text-right\">Total Mass</TableHead>\n                    <TableHead className=\"text-right\">Max Ship Mass</TableHead>\n                    <TableHead>Ships Hulls</TableHead>\n                    <TableHead>Ships Roles</TableHead>\n                    <TableHead>Operation</TableHead>\n                    <TableHead>Operation Complete</TableHead>\n                  </TableRow>\n                </TableHeader>\n                <TableBody>\n                  {alienFleets.map((fleet) => (\n                    <TableRow key={fleet.id} className={twMerge(fleet.deltaV === 0 ? \"bg-gray-500/5\" : \"\")}>\n                      <TableCell className=\"font-medium\">{fleet.displayName}</TableCell>\n                      <TableCell>{fleet.planetName}</TableCell>\n                      <TableCell>{fleet.targetOrbitName}</TableCell>\n                      <TableCell>{fleet.arrivalTimeFormatted || \"-\"}</TableCell>\n                      <TableCell className=\"text-right\">\n                        {fleet.daysToTarget !== null ? `${fleet.daysToTarget.toFixed(0)}` : \"—\"}\n                      </TableCell>\n                      <TableCell className=\"text-right\">{fleet.totalMC.toFixed(0)}</TableCell>\n                      <TableCell className=\"text-right\">{fleet.marineCombatPower > 0 ? fleet.marineCombatPower : \"—\"}</TableCell>\n                      <TableCell className=\"text-right\">{(fleet.totalMass / 1000000).toFixed(0)} Mkg</TableCell>\n                      <TableCell className=\"text-right\">{(fleet.maxShipMass / 1000000).toFixed(0)} Mkg</TableCell>\n                      <TableCell className=\"whitespace-normal\">\n                        {fleet.shipsByHullType.length > 0\n                          ? fleet.shipsByHullType\n                              .map((ship) => {\n                                const name = `${ship.count} ${ship.hullName.replace(\"Alien \", \"\")}${ship.count > 1 ? \"s\" : \"\"}`;\n                                return ship.avgNoseArmor > 0 ? `${name} (${ship.avgNoseArmor})` : name;\n                              })\n                              .join(\" + \")\n                          : \"-\"}\n                      </TableCell>\n                      <TableCell className=\"whitespace-normal\">\n                        {fleet.shipsByRole.length > 0\n                          ? fleet.shipsByRole\n                              .map((ship) => `${ship.count} ${ship.role}${ship.count > 1 ? \"s\" : \"\"}`)\n                              .join(\" + \")\n                          : \"-\"}\n                      </TableCell>\n                      <TableCell>{fleet.operation || \"-\"}</TableCell>\n                      <TableCell>\n                        {fleet.operationComplete\n                          ? `${fleet.operationComplete}${fleet.operationCompleteDays !== null ? ` (${fleet.operationCompleteDays.toFixed(0)}d)` : \"\"}`\n                          : \"-\"}\n                      </TableCell>\n                    </TableRow>\n                  ))}\n                </TableBody>\n              </Table>\n\n              {/* Planetary Defense Summary */}\n              <div className=\"mt-8\">\n                <h2 className=\"text-2xl font-bold mb-4\">Planetary Defense Summary</h2>\n                <Table>\n                  <TableHeader>\n                    <TableRow>\n                      <TableHead>Planet</TableHead>\n                      <TableHead className=\"text-right\">Days to Arrival</TableHead>\n                      <TableHead className=\"text-right\">Alien Fleet MC</TableHead>\n                      <TableHead className=\"text-right\">Player Fleet MC</TableHead>\n                      <TableHead>Habs (Active / Potential Combat)</TableHead>\n                    </TableRow>\n                  </TableHeader>\n                  <TableBody>\n                    {(() => {\n                      const planetsWithFleets = new Set(\n                        analysis.alienFleetsToPlayerOrbits.map((f) => f.planetName || \"Unknown\"),\n                      );\n                      const defenseData = Array.from(planetsWithFleets)\n                        .map((planet) => {\n                          const fleetsAtPlanet = analysis.alienFleetsToPlayerOrbits.filter(\n                            (f) => f.planetName === planet,\n                          );\n                          const totalAlienMC = fleetsAtPlanet.reduce((sum, f) => sum + (f.totalMC || 0), 0);\n                          const incomingFleets = fleetsAtPlanet.filter(\n                            (f) => f.daysToTarget !== null && f.daysToTarget > 0,\n                          );\n                          const daysToArrival =\n                            incomingFleets.length > 0\n                              ? Math.min(...incomingFleets.map((f) => f.daysToTarget!))\n                              : null;\n                          const playerFleetsAtPlanet = analysis.playerFleets.filter(\n                            (f) => f.planetName === planet,\n                          );\n                          const relevantPlayerFleets = playerFleetsAtPlanet.filter((f) => {\n                            if (f.daysToTarget === null || f.daysToTarget <= 0) return true;\n                            if (daysToArrival === null) return false;\n                            return f.daysToTarget < daysToArrival;\n                          });\n                          const totalPlayerMC = relevantPlayerFleets.reduce((sum, f) => sum + (f.totalMC || 0), 0);\n                          const habsAtPlanet = analysis.playerHabs.filter((h) => h.planetName === planet);\n                          return { planet, totalAlienMC, totalPlayerMC, daysToArrival, habs: habsAtPlanet };\n                        })\n                        .filter((d) => d.habs.length > 0)\n                        .toSorted((a, b) => {\n                          if (a.daysToArrival === null && b.daysToArrival === null) return 0;\n                          if (a.daysToArrival === null) return 1;\n                          if (b.daysToArrival === null) return -1;\n                          return a.daysToArrival - b.daysToArrival;\n                        });\n\n                      return defenseData.map(({ planet, totalAlienMC, totalPlayerMC, daysToArrival, habs }) => (\n                        <TableRow key={planet}>\n                          <TableCell className=\"font-medium\">{planet}</TableCell>\n                          <TableCell className=\"text-right\">\n                            {daysToArrival !== null ? daysToArrival.toFixed(0) : \"—\"}\n                          </TableCell>\n                          <TableCell className=\"text-right\">{totalAlienMC.toFixed(0)}</TableCell>\n                          <TableCell className=\"text-right\">{totalPlayerMC.toFixed(0)}</TableCell>\n                          <TableCell>\n                            <TooltipProvider>\n                              <div className=\"flex gap-2 flex-wrap\">\n                                {habs\n                                  .toSorted((a, b) => {\n                                    if (a.habType === \"Station\" && b.habType !== \"Station\") return -1;\n                                    if (a.habType !== \"Station\" && b.habType === \"Station\") return 1;\n                                    return 0;\n                                  })\n                                  .map((hab) => {\n                                    const activeCombat = hab.activeEffects.combatScore || 0;\n                                    const potentialCombat = hab.potentialEffects.combatScore || 0;\n                                    const combatDisplay =\n                                      activeCombat === potentialCombat\n                                        ? activeCombat.toFixed(0)\n                                        : `${activeCombat.toFixed(0)} / ${potentialCombat.toFixed(0)}`;\n                                    const bgColor = hab.habType === \"Station\" ? \"bg-yellow-100\" : \"bg-green-100\";\n                                    return (\n                                      <Tooltip key={hab.id}>\n                                        <TooltipTrigger asChild>\n                                          <span className={`cursor-help ${bgColor} px-1.5 py-0.5 rounded`}>\n                                            {combatDisplay}\n                                          </span >\n                                        </TooltipTrigger>\n                                        <TooltipContent>\n                                          <div>{hab.displayName}</div>\n                                        </TooltipContent>\n                                      </Tooltip>\n                                    );\n                                  })}\n                                </div>\n                            </TooltipProvider>\n                          </TableCell>\n                        </TableRow>\n                      ));\n                    })()}\n                  </TableBody>\n                </Table>\n              </div >\n\n              <Collapsible>\n                <CollapsibleTrigger asChild>\n                  <Button>Debug Data</Button>\n                </CollapsibleTrigger>\n                <CollapsibleContent>\n                  <pre>{JSON.stringify(alienFleets, null, 2)}</pre>\n                </CollapsibleContent>\n              </Collapsible>\n            </div >\n          )}\n        </AccordionContent>\n      </AccordionItem>\n\n      {/* Other Human Factions Fleets */}\n      <AccordionItem value=\"human-enemy-fleets\">\n        <AccordionTrigger>Other Human Factions ({humanEnemyFleets.length})</AccordionTrigger>\n        <AccordionContent>\n          {humanEnemyFleets.length === 0 ? (\n            <div className=\"p-4 text-muted-foreground\">No other human faction fleets detected heading to player orbits.</div >\n          ) : (\n            <Table>\n              <TableHeader>\n                <TableRow>\n                  <TableHead>Faction</TableHead>\n                  <TableHead>Fleet Name</TableHead>\n                  <TableHead>Planet</TableHead>\n                  <TableHead>Target Orbit</TableHead>\n                  <TableHead>Arrival Date</TableHead>\n                  <TableHead className=\"text-right\">Days to Arrival</TableHead>\n                  <TableHead className=\"text-right\">MC Used</TableHead>\n                  <TableHead className=\"text-right\">Marine CP</TableHead>\n                  <TableHead className=\"text-right\">Total Mass</TableHead>\n                  <TableHead className=\"text-right\">Max Ship Mass</TableHead>\n                  <TableHead>Ship Hulls</TableHead>\n                  <TableHead>Ship Roles</TableHead>\n                  <TableHead>Operation</TableHead>\n                  <TableHead>Operation Complete</TableHead>\n                </TableRow>\n              </TableHeader>\n              <TableBody>\n                {humanEnemyFleets.map((fleet) => {\n                  const FactionIcon = fleet.factionTemplateName\n                    ? FactionIcons[fleet.factionTemplateName as keyof typeof FactionIcons]\n                    : null;\n                  return (\n                    <TableRow key={fleet.id} className={twMerge(fleet.deltaV === 0 ? \"bg-gray-500/5\" : \"\")}>\n                      <TableCell>\n                        <div className=\"flex items-center gap-1\">\n                          {FactionIcon && <FactionIcon className=\"p-1 rounded\" />}\n                          <span className=\"text-sm\">{fleet.factionDisplayName ?? fleet.factionTemplateName ?? \"Unknown\"}</span >\n                        </div >\n                      </TableCell>\n                      <TableCell className=\"font-medium\">{fleet.displayName}</TableCell>\n                      <TableCell>{fleet.planetName}</TableCell>\n                      <TableCell>{fleet.targetOrbitName}</TableCell>\n                      <TableCell>{fleet.arrivalTimeFormatted || \"-\"}</TableCell>\n                      <TableCell className=\"text-right\">\n                        {fleet.daysToTarget !== null ? `${fleet.daysToTarget.toFixed(0)}` : \"—\"}\n                      </TableCell>\n                      <TableCell className=\"text-right\">{fleet.totalMC.toFixed(0)}</TableCell>\n                      <TableCell className=\"text-right\">{fleet.marineCombatPower > 0 ? fleet.marineCombatPower : \"—\"}</TableCell>\n                      <TableCell className=\"text-right\">{(fleet.totalMass / 1000000).toFixed(0)} Mkg</TableCell>\n                      <TableCell className=\"text-right\">{(fleet.maxShipMass / 1000000).toFixed(0)} Mkg</TableCell>\n                      <TableCell className=\"whitespace-normal\">\n                        {fleet.shipsByHullType.length > 0\n                          ? fleet.shipsByHullType\n                              .map((ship) => {\n                                const name = `${ship.count} ${ship.hullName}${ship.count > 1 ? \"s\" : \"\"}`;\n                                return ship.avgNoseArmor > 0 ? `${name} (${ship.avgNoseArmor})` : name;\n                              })\n                              .join(\" + \")\n                          : \"-\"}\n                      </TableCell>\n                      <TableCell className=\"whitespace-normal\">\n                        {fleet.shipsByRole.length > 0\n                          ? fleet.shipsByRole.map((s) => `${s.count} ${s.role}${s.count > 1 ? \"s\" : \"\"}`).join(\" + \")\n                          : \"-\"}\n                      </TableCell>\n                      <TableCell>{fleet.operation || \"-\"}</TableCell>\n                      <TableCell>\n                        {fleet.operationComplete\n                          ? `${fleet.operationComplete}${fleet.operationCompleteDays !== null ? ` (${fleet.operationCompleteDays.toFixed(0)}d)` : \"\"}`\n                          : \"-\"}\n                      </TableCell>\n                    </TableRow>\n                  );\n                })}\n              </TableBody>\n            </Table>\n          )}\n        </AccordionContent>\n      </AccordionItem\n\n      {/* Player Fleets */}\n      <AccordionItem value=\"player-fleets\">\n        <AccordionTrigger>Player Fleets ({playerFleets.length})</AccordionTrigger>\n        <AccordionContent>\n          {playerFleets.length === 0 ? (\n            <div className=\"p-4 text-muted-foreground\">No player fleets found.</div >\n          ) : (\n            <Table>\n              <TableHeader>\n                <TableRow>\n                  <TableHead>Fleet Name</TableHead>\n                  <TableHead>Planet</TableHead>\n                  <TableHead>Target Orbit</TableHead>\n                  <TableHead>Arrival Date</TableHead>\n                  <TableHead className=\"text-right\">Days to Arrival</TableHead>\n                  <TableHead className=\"text-right\">MC Used</TableHead>\n                  <TableHead className=\".
Error message: JSON Parse error: Unterminated string
```

---

## Assistant (Build · Gemma 4-26B-A4B (local) · 0.8s)

---

## User

---

## Assistant (Compaction · Gemma 4-26B-A4B (local) · 19894.7s)

---

## Session Summary

llama.cpp again crashed out with no error, even telling it to keep an extra 512MB VRAM free.

```
docker run -it --rm --gpus 1  -v vllm-hf-cache:/root/.cache/huggingface  -p 8080:8080 ghcr.io/ggml-org/llama.cpp:server-cuda  --hf-repo unsloth/gemma-4-26B-A4B-it-GGUF --hf-file gemma-4-26B-A4B-it-UD-IQ4_XS.gguf --host 0.0.0.0 --fit-ctx 262144 --fit-target 1536
```

Fit notes:
```
common_params_fit_impl: memory for test allocation by device:
common_params_fit_impl: id=0, n_layer=31, n_part=19, overflow_type=2, mem= 13423 MiB
common_params_fit_impl: set ngl_per_device[0].(n_layer, n_part, overflow_type)=(31, 19, UP), id_dense_start=0
common_params_fit_impl: trying to fit one extra layer with overflow_type=LAYER_FRACTION_GATE
common_memory_breakdown_print: | memory breakdown [MiB] | total    free     self   model   context   compute    unaccounted |
common_memory_breakdown_print: |   - CUDA0 (RTX 4080)   | 16375 = 15044 + (13638 =  6790 +    6020 +     828) +      -12307 |
common_memory_breakdown_print: |   - Host               |                   7441 =  6909 +       0 +     532                |
common_params_fit_impl: memory for test allocation by device:
common_params_fit_impl: id=0, n_layer=31, n_part=19, overflow_type=3, mem= 13638 MiB
common_params_fit_impl:   - CUDA0 (NVIDIA GeForce RTX 4080): 31 layers (19 overflowing),  13423 MiB used,   1620 MiB free
common_fit_params: successfully fit params to free device memory
common_fit_params: fitting params to free memory took 6.62 seconds
```
