"use client";

import { Accordion } from "@/components/ui/accordion";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { cn } from "@/lib/utils";
import * as React from "react";
import { Accordion as AccordionPrimitive } from "radix-ui";

type SmartAccordionSingleProps = Omit<React.ComponentProps<typeof AccordionPrimitive.Root> & { type: "single" }, "value" | "onValueChange" | "defaultValue"> & {
  storageKey: string;
  defaultValue?: string;
  focusValue?: string;
};

type SmartAccordionMultipleProps = Omit<React.ComponentProps<typeof AccordionPrimitive.Root> & { type: "multiple" }, "value" | "onValueChange" | "defaultValue"> & {
  storageKey: string;
  defaultValue?: string[];
  focusValue?: string;
};

type SmartAccordionProps = SmartAccordionSingleProps | SmartAccordionMultipleProps;

/**
 * An Accordion component that persists the open/closed state to localStorage.
 * Multiple instances with the same storageKey will stay in sync.
 */
export function SmartAccordion({ storageKey, defaultValue, focusValue, children, ...props }: SmartAccordionProps) {
  const [value, setValue] = useLocalStorage(storageKey, defaultValue || (props.type === "multiple" ? [] : ""));
  const focusedValue = props.type === "multiple" ? (focusValue ? [focusValue] : undefined) : focusValue;

  return (
    <Accordion
      {...props}
      value={(focusValue ? focusedValue : value) as any}
      onValueChange={focusValue ? () => undefined : (setValue as any)}
      className={cn(
        props.className,
        focusValue &&
          "[&>[data-slot=accordion-item][data-state=closed]]:hidden [&>[data-slot=accordion-item]>[data-slot=accordion-trigger-wrapper]]:hidden",
      )}
    >
      {children}
    </Accordion>
  );
}
