import { ReactNode } from "react";

export interface NavItem {
  key: string;
  label: string;
  subtitle?: ReactNode;
  children?: NavItem[];
  content?: ReactNode;
}
