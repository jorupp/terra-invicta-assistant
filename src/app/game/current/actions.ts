"use server";

import { basename, join } from "path";
import { analyzeData, Analysis } from "@/lib/analysis";
import { loadSaveFile } from "@/lib/savefile";

const saveGameDir = process.env.SAVE_GAME_DIR!;
if (!saveGameDir) {
  throw new Error("SAVE_GAME_DIR environment variable is not set.");
}

export async function loadAndAnalyzeFile(fileName: string): Promise<Analysis> {
  // Prevent path traversal attacks by only using the basename
  const safeFileName = basename(fileName);

  // Construct the full path
  const filePath = join(saveGameDir, safeFileName);

  // Load and analyze the save file
  const data = await loadSaveFile(filePath);
  const analysis = await analyzeData(data);

  return analysis;
}
