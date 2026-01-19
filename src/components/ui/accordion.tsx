"use client";

import * as React from "react";
import { Accordion as AccordionPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";

function Accordion({ className, ...props }: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      className={cn("overflow-hidden rounded-md border flex w-full flex-col", className)}
      {...props}
    />
  );
}

function AccordionItem({ className, ...props }: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn("data-open:bg-muted/50 not-last:border-b", className)}
      {...props}
    />
  );
}

function AccordionTrigger({ className, children, ...props }: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "**:data-[slot=accordion-trigger-icon]:text-muted-foreground gap-6 p-2 text-left text-xs/relaxed font-medium hover:underline **:data-[slot=accordion-trigger-icon]:ml-auto **:data-[slot=accordion-trigger-icon]:size-4 group/accordion-trigger relative flex flex-1 items-start justify-between border border-transparent transition-all outline-none disabled:pointer-events-none disabled:opacity-50",
          className
        )}
        {...props}
      >
        {children}
        <ChevronDownIcon
          data-slot="accordion-trigger-icon"
          className="pointer-events-none shrink-0 group-aria-expanded/accordion-trigger:hidden"
        />
        <ChevronUpIcon
          data-slot="accordion-trigger-icon"
          className="pointer-events-none hidden shrink-0 group-aria-expanded/accordion-trigger:inline"
        />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

function AccordionContent({ className, children, ...props }: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  const ref = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);

  // Radix Accordion doesnt update height when children updates.
  // We need to manualy add a resize observer on children of the Content component
  // to update the CSS variable height of the content.

  // based on https://github.com/radix-ui/primitives/discussions/2562#discussioncomment-12014729 but using an additional div and MutationObserver
  // not sure if the change was needed due to the structure Shadcn set up or if it's because we're using an accordion-tab-accordion rendering
  React.useEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    let resizeObserver: ResizeObserver | null = null;

    const mutationObserver = new MutationObserver(() => {
      const current = ref.current;
      if (resizeObserver) {
        if (current) return;
        resizeObserver.disconnect();
        resizeObserver = null;
      } else {
        if (!current) return;
        resizeObserver = new ResizeObserver(() => {
          const currentHeight = ref.current?.clientHeight;
          if (currentHeight === undefined) return;

          content.style.cssText = `--radix-accordion-content-height: ${currentHeight}px;`;
        });

        resizeObserver.observe(current);
      }
    });
    mutationObserver.observe(content!, {
      attributes: true,
      attributeFilter: ["data-state"],
      childList: false,
      subtree: false,
    });

    return () => {
      resizeObserver?.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="data-open:animate-accordion-down data-closed:animate-accordion-up px-2 text-xs/relaxed overflow-hidden"
      ref={contentRef}
      {...props}
    >
      <div
        className={cn(
          "pt-0 pb-4 [&_a]:hover:text-foreground h-(--radix-accordion-content-height) [&_a]:underline [&_a]:underline-offset-3 [&_p:not(:last-child)]:mb-4",
          className
        )}
      >
        <div ref={ref}>{children}</div>
      </div>
    </AccordionPrimitive.Content>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
