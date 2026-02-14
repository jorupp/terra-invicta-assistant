import { readdir, stat } from "fs/promises";
import { join } from "path";
import { loadSaveFile } from "@/lib/savefile";
import { analyzeData } from "@/lib/analysis";
import { RenderGameComponent } from "../current/component";

export default async function StaticCurrentGamePage() {
  const saveGameDir = process.env.SAVE_GAME_DIR;

  if (!saveGameDir) {
    return <div>SAVE_GAME_DIR environment variable not set</div>;
  }

  const files = await readdir(saveGameDir);
  let lastModifiedFile: string | null = null;
  let lastModifiedTime = 0;

  for (const file of files) {
    // Only process .gz and .json files
    if (!file.endsWith(".gz") && !file.endsWith(".json")) {
      continue;
    }
    if (process.env.IGNORE_UNCOMPRESSED_FILES === "true" && file.endsWith(".json")) {
      continue;
    }

    const fullPath = join(saveGameDir, file);
    try {
      const stats = await stat(fullPath);
      if (stats.isFile() && stats.mtimeMs > lastModifiedTime) {
        lastModifiedTime = stats.mtimeMs;
        lastModifiedFile = file;
      }
    } catch (error) {
      // Skip files we can't stat
    }
  }

  if (lastModifiedFile) {
    const data = await loadSaveFile(join(saveGameDir, lastModifiedFile));
    const analysis = await analyzeData(data, lastModifiedFile, new Date(lastModifiedTime));
    return <RenderGameComponent analysis={analysis} />;
  }
  return <div>No save files found</div>;
}
