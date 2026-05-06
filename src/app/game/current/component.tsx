"use client";

import { Analysis } from "@/lib/analysis";
import { TreeLayout } from "./tree-layout";

export function RenderGameComponent({ analysis }: { analysis: Analysis }) {
  return <TreeLayout analysis={analysis} />;
}
