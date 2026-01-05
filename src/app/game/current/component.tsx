"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Analysis } from "@/lib/analysis";
import { getCouncilorsUi } from "./councilors";
import { getFleetsUi } from "./fleets";
import { useCurrent } from "./useCurrent";
import { useEffect, useState } from "react";
import { loadAndAnalyzeFile } from "./actions";
import { Loader } from "lucide-react";

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
      const data = await loadAndAnalyzeFile(filename);
      setAnalysis(data);
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
  const tabs = [getCouncilorsUi(analysis), getFleetsUi(analysis)];
  return (
    <div>
      <h2>
        Game: {analysis.fileName} ({analysis.lastModified?.toLocaleString()})
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
