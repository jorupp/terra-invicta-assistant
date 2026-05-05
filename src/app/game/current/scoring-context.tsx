"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { ScoringWeights, defaultScoringWeights } from "./scoringWeights";

interface ScoringState {
  weights: ScoringWeights;
  setWeights: (w: ScoringWeights) => void;
}

const ScoringContext = createContext<ScoringState | null>(null);

export function ScoringProvider({ children }: { children: ReactNode }) {
  const [weights, setWeights] = useState<ScoringWeights>(() => defaultScoringWeights);
  return (
    <ScoringContext.Provider value={{ weights, setWeights }}>
      {children}
    </ScoringContext.Provider>
  );
}

export function useScoring() {
  const ctx = useContext(ScoringContext);
  if (!ctx) throw new Error("useScoring must be used within ScoringProvider");
  return ctx;
}
