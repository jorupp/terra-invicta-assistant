"use server";

import { basename, join } from "path";
import { analyzeData, Analysis } from "@/lib/analysis";
import { loadSaveFile } from "@/lib/savefile";
import { stat } from "fs/promises";

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
  const statResult = await stat(filePath);
  if (!statResult.isFile()) {
    throw new Error("The specified file does not exist.");
  }
  const data = await loadSaveFile(filePath);
  const analysis = await analyzeData(data, safeFileName, statResult.mtime);

  return analysis;
}
