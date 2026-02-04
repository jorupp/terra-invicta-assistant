"use client";

import { Accordion } from "@/components/ui/accordion";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import * as React from "react";
import { Accordion as AccordionPrimitive } from "radix-ui";

type SmartAccordionSingleProps = Omit<React.ComponentProps<typeof AccordionPrimitive.Root> & { type: "single" }, "value" | "onValueChange" | "defaultValue"> & {
  storageKey: string;
  defaultValue?: string;
};

type SmartAccordionMultipleProps = Omit<React.ComponentProps<typeof AccordionPrimitive.Root> & { type: "multiple" }, "value" | "onValueChange" | "defaultValue"> & {
  storageKey: string;
  defaultValue?: string[];
};

type SmartAccordionProps = SmartAccordionSingleProps | SmartAccordionMultipleProps;

/**
 * An Accordion component that persists the open/closed state to localStorage.
 * Multiple instances with the same storageKey will stay in sync.
 */
export function SmartAccordion({ storageKey, defaultValue, children, ...props }: SmartAccordionProps) {
  const [value, setValue] = useLocalStorage(storageKey, defaultValue || (props.type === "multiple" ? [] : ""));

  return (
    <Accordion value={value as any} onValueChange={setValue as any} {...props}>
      {children}
    </Accordion>
  );
}
