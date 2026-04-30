"use client";

import { useCurrent } from "./useCurrent";
import { useEffect, useState } from "react";
import { loadAndAnalyzeFile } from "./actions";
import { Loader } from "lucide-react";
import { Analysis } from "@/lib/analysis";
import { RenderGameComponent } from "./component";

// change renderKey to force re-loading the game state, useful for HMR during development when analysis.ts changes
export default function RenderCurrentGame({ renderKey }: { renderKey?: any }) {
  const filename = useCurrent();
  // TODO: tanstackquery?
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  useEffect(() => {
    if (!filename) {
      setAnalysis(null);
      return;
    }
    (async () => {
      let attempts = 0;
      while (true) {
        try {
          const data = await loadAndAnalyzeFile(filename);
          setAnalysis(data);
          return;
        } catch (e) {
          if (attempts >= 5) {
            console.error("Failed to load and analyze file after multiple attempts", e);
            return;
          }
          await new Promise((resolve) => setTimeout(resolve, 1000));
          attempts++;
        }
      }
    })();
  }, [filename, renderKey]);

  if (!analysis) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader className="h-5 w-5 text-muted-foreground animate-spin" />
        <span className="text-xs text-muted-foreground font-medium">Loading game state...</span>
      </div>
    );
  }

  return <RenderGameComponent analysis={analysis} />;
}
