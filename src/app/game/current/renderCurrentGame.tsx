"use client";

import { useCurrent } from "./useCurrent";
import { useEffect, useState } from "react";
import { loadAndAnalyzeFile } from "./actions";
import { Loader } from "lucide-react";
import { Analysis } from "@/lib/analysis";
import { RenderGameComponent } from "./component";

export default function RenderCurrentGame() {
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
  }, [filename]);

  if (!analysis) {
    return (
      <div>
        Waiting for game state....
        <Loader />
      </div>
    );
  }

  return <RenderGameComponent analysis={analysis} />;
}
