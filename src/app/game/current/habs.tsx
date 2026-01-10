"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Analysis } from "@/lib/analysis";
import { formatDateTime, noDate } from "@/lib/utils";

function HabHeader() {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>Name</TableHead>
        <TableHead>Most important upcoming completion</TableHead>
        <TableHead>Alerts</TableHead>
      </TableRow>
    </TableHeader>
  );
}

function HabTableRow({ hab, time }: { hab: Analysis["playerHabs"][0]; time: string }) {
  const { highlightedCompletion, emptyModuleCount, missingMine } = hab;

  return (
    <TableRow key={hab.id}>
      <TableCell>{hab.displayName}</TableCell>
      <TableCell>
        {highlightedCompletion && (
          <>
            {highlightedCompletion.templateName} in {highlightedCompletion.daysToCompletion?.toFixed(0)} days
          </>
        )}
      </TableCell>
      <TableCell>
        {emptyModuleCount > 0 && <>{emptyModuleCount} empty slots </>}
        {missingMine && <span className="bg-yellow-300 text-black p-1 rounded">Missing Mine </span>}
      </TableCell>
    </TableRow>
  );
}

export function getHabsUi(analysis: Analysis) {
  const { playerHabs } = analysis;
  const missingMines = playerHabs.filter((h) => h.missingMine);
  const nextCompletion = playerHabs
    .map((i) => i.highlightedCompletion)
    .filter((i) => i)
    .toSorted((a, b) => {
      return a.daysToCompletion < b.daysToCompletion ? -1 : 1;
    })[0];

  // can't use a tooltip for this because it's in the button that is the tab label, which would be nested buttons and cause hydration issues
  const missingMinesTitle =
    missingMines.length > 0 ? `Missing mines: ${missingMines.map((h) => h.displayName).join(", ")}` : "";

  return {
    key: "habs",
    tab: (
      <>
        Habs ({playerHabs.length}){nextCompletion && <> {nextCompletion.daysToCompletion?.toFixed(0)}d</>}
        {missingMines.length > 0 && (
          <>
            {" "}
            <span className="bg-yellow-300 text-black p-1 rounded" title={missingMinesTitle}>
              M
            </span>
          </>
        )}
      </>
    ),
    content: (
      <HabsComponent
        {...{
          analysis,
        }}
      />
    ),
  };
}

function HabsComponent({ analysis }: { analysis: Analysis }) {
  const { playerHabs } = analysis;
  const time = formatDateTime(analysis.gameCurrentDateTime);

  return (
    <>
      <Accordion type="single" collapsible defaultValue="habs">
        <AccordionItem value="habs">
          <AccordionTrigger>
            <span>Manage Habs</span>
          </AccordionTrigger>
          <AccordionContent>
            <Table>
              <HabHeader />
              <TableBody>
                {playerHabs.map((hab) => (
                  <HabTableRow hab={hab} key={hab.id} time={time} />
                ))}
              </TableBody>
            </Table>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Collapsible>
        <CollapsibleTrigger asChild>
          <Button variant="outline">Debug Data</Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <pre>{JSON.stringify(analysis.playerHabs, null, 2)}</pre>
        </CollapsibleContent>
      </Collapsible>
    </>
  );
}
