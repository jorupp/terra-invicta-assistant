import { analyzeData } from "@/lib/analysis";
import { loadSaveFile } from "@/lib/savefile";

const currentGamePath = process.env.CURRENT_GAME!;
if (!currentGamePath) {
  throw new Error("CURRENT_GAME environment variable is not set.");
}

export default async function DebugGame() {
  const data = await loadSaveFile(currentGamePath);
  const analysis = await analyzeData(data);
  return (
    <div>
      <h1>Debug Templates</h1>
      <p>This is a debug page for templates.</p>
      <pre>{JSON.stringify(analysis, null, 2)}</pre>
    </div>
  );
}
