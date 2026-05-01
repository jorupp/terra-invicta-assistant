import { Analysis } from "@/lib/analysis";
import { SmartAccordion } from "@/components/ui/smart-accordion";
import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { ContentPanel } from "./tree-nav";
import { Rocket, Calculator } from "lucide-react";

export function getDrivesContentPanels(analysis: Analysis): ContentPanel[] {
  return [
    {
      key: "drives-table",
      label: "Drive Systems",
      icon: Rocket,
      source: "drives",
      content: <div className="text-sm text-muted-foreground">Drive systems data available via analysis.drives</div>,
    },
    {
      key: "drive-calculator",
      label: "Drive Calculator",
      icon: Calculator,
      source: "drives",
      content: <div className="text-sm text-muted-foreground">Drive calculator interface</div>,
    },
  ];
}

export function getDrivesUi(analysis: Analysis) {
  return {
    key: "drives",
    tab: "Drives",
    content: (
      <SmartAccordion type="multiple" storageKey="drives-accordion" defaultValue={["drive-table", "drive-calculator"]}>
        <AccordionItem value="drive-table">
          <AccordionTrigger>Drive Systems</AccordionTrigger>
          <AccordionContent>
            <div className="text-sm text-muted-foreground">Drive systems data available via analysis.drives</div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="drive-calculator">
          <AccordionTrigger>Drive Calculator</AccordionTrigger>
          <AccordionContent>
            <div className="text-sm text-muted-foreground">Drive calculator interface</div>
          </AccordionContent>
        </AccordionItem>
      </SmartAccordion>
    ),
  };
}
