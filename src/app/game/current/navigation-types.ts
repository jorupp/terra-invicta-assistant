import type { ReactNode } from "react";

export interface GameNavigationItem {
  key: string;
  label: ReactNode;
  subtitle?: ReactNode;
  content: ReactNode;
}

export interface GameNavigationGroup {
  key: string;
  label: ReactNode;
  subtitle?: ReactNode;
  items: GameNavigationItem[];
}
