import { analyzeData } from "@/lib/analysis";
import { loadSaveFile } from "@/lib/savefile";
import CurrentGameComponent from "./component";

const currentGamePath = process.env.CURRENT_GAME!;
if (!currentGamePath) {
  throw new Error("CURRENT_GAME environment variable is not set.");
}

export default async function CurrentGamePage() {
  // TODO: eventually, we'll refactor this to identify the "current" game via an API call w/ EventEmitter, then call an API to get this analysis
  const data = await loadSaveFile(currentGamePath);
  const analysis = await analyzeData(data);
  return <CurrentGameComponent analysis={analysis} />;
}
