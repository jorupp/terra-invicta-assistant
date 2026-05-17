"use client";

import { Analysis } from "@/lib/analysis";
import { GameLayout } from "./gameLayout";

export function RenderGameComponent({ analysis }: { analysis: Analysis }) {
  return <GameLayout analysis={analysis} />;
}
