"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Analysis } from "@/lib/analysis";
import { getCouncilorsUi } from "./councilors";
import { getFleetsUi } from "./fleets";
import { useCurrent } from "./useCurrent";
import { useEffect, useState } from "react";
import { loadAndAnalyzeFile } from "./actions";
import { Loader } from "lucide-react";
import { getHabsUi } from "./habs";
import { getResourcesUi } from "./resources";

export default function CurrentGameComponent() {
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

function RenderGameComponent({ analysis }: { analysis: Analysis }) {
  const tabs = [getCouncilorsUi(analysis), getFleetsUi(analysis), getHabsUi(analysis), getResourcesUi(analysis)];
  return (
    <div>
      <h2>
        Game: {analysis.fileName} ({analysis.lastModified?.toLocaleString()}) - Game date:{" "}
        {analysis.gameCurrentDateTimeFormatted.split(" ")[0]}
      </h2>
      <h3>Faction: {analysis.playerFaction.displayName}</h3>

      <Tabs defaultValue={tabs[0].key}>
        <TabsList>
          {tabs.map((tab) => (
            <TabsTrigger key={tab.key} value={tab.key}>
              {tab.tab}
            </TabsTrigger>
          ))}
        </TabsList>
        {tabs.map((tab) => (
          <TabsContent key={tab.key} value={tab.key} className="mt-4">
            {tab.content}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
