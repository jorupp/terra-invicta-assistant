"use client";

import { Tabs } from "@/components/ui/tabs";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import * as React from "react";
import { Tabs as TabsPrimitive } from "radix-ui";

interface SmartTabsProps extends Omit<React.ComponentProps<typeof TabsPrimitive.Root>, "value" | "onValueChange" | "defaultValue"> {
  storageKey: string;
  defaultValue: string;
}

/**
 * A Tabs component that persists the selected tab to localStorage.
 * Multiple instances with the same storageKey will stay in sync.
 */
export function SmartTabs({ storageKey, defaultValue, children, ...props }: SmartTabsProps) {
  const [value, setValue] = useLocalStorage(storageKey, defaultValue);

  return (
    <Tabs value={value} onValueChange={setValue} {...props}>
      {children}
    </Tabs>
  );
}
