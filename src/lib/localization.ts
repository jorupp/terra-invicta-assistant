import { readFile } from "fs/promises";
import path from "path";

const localizationDir = process.env.LOCALIZATION_DIR!;
if (!localizationDir) {
  throw new Error("LOCALIZATION_DIR environment variable is not set.");
}

const cachedLocalizations: { [filename: string]: Localization } = {};
export async function getLocalization<LocalizationName extends string>(
  filename: LocalizationName
): Promise<Localization> {
  if (cachedLocalizations[filename]) {
    return cachedLocalizations[filename] as Localization;
  }
  const filePath = path.join(localizationDir, filename);
  const content = await readFile(filePath, "utf8");
  try {
    // TODO: parse
    const data: Localization = content.split(/\r?\n/).reduce((map, line) => {
      const [key, ...rest] = line.split("=");
      if (key) {
        map.set(key, rest.join("="));
      }
      return map;
    }, new Map<string, string>());
    cachedLocalizations[filename] = data;
    return data;
  } catch (e) {
    console.error(`Error parsing localization data from file ${filePath}:`, e);
    throw e;
  }
}

export const localizations = {
  army: () => getLocalization("TIArmyTemplate.en"),
};

export type Localization = Map<string, string>;
