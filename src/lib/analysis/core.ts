import { SaveFile } from "../savefile";
import { templates } from "../templates";
import { localizations } from "../localization";
import { formatDateTime } from "../utils";

export interface Player {
  id: number;
  faction: number;
  templateName: string | null;
  displayName: string | null;
}

export interface GameTime {
  currentDateTime: {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    second: number;
    millisecond: number;
  };
  lastMonth: {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    second: number;
    millisecond: number;
  };
  formatted: string;
}

export interface CoreData {
  player: Player;
  time: GameTime;
  difficulty: string;
  mcMaskingTechs: Set<string>;
  projects: Map<
    string,
    Awaited<ReturnType<typeof templates.projects>>[0] & {
      displayName?: string;
      summary?: string;
      description?: string;
    }
  >;
  techs: Map<
    string,
    Awaited<ReturnType<typeof templates.techs>>[0] & {
      displayName?: string;
      summary?: string;
      description?: string;
      quote?: string;
    }
  >;
  driveLocalization: Awaited<ReturnType<typeof localizations.drive>>;
  powerPlantLocalization: Awaited<ReturnType<typeof localizations.powerPlant>>;
  globalTechState: {
    techProgress: {
      techTemplateName: string;
      accumulatedResearch: number;
      factionContributions: Map<number, number>;
    }[];
    finishedTechsNames: string[];
  };
}

export async function extractCoreData(saveFile: SaveFile): Promise<CoreData> {
  // MC Masking Technologies
  const mcMaskingTechs = new Set(
    (await templates.projects())
      .filter((i) => i.effects?.some((e) => e === "Effect_MCUsageMasking"))
      .map((i) => i.dataName),
  );

  // Metadata
  const metadata = saveFile.gamestates["PavonisInteractive.TerraInvicta.TIMetadataState"][0].Value;
  const { difficulty } = metadata;

  // Time
  const timeState = saveFile.gamestates["PavonisInteractive.TerraInvicta.TITimeState"][0].Value;
  const lastMonth = {
    ...timeState.currentDateTime,
    month: timeState.currentDateTime.month === 1 ? 12 : timeState.currentDateTime.month - 1,
    year: timeState.currentDateTime.month === 1 ? timeState.currentDateTime.year - 1 : timeState.currentDateTime.year,
  };
  const time: GameTime = {
    currentDateTime: timeState.currentDateTime,
    lastMonth,
    formatted: formatDateTime(timeState.currentDateTime),
  };

  // Global Tech State
  const globalTechState = (() => {
    const rawGlobalTechState = saveFile.gamestates["PavonisInteractive.TerraInvicta.TIGlobalResearchState"][0].Value;
    return {
      finishedTechsNames: rawGlobalTechState.finishedTechsNames as string[],
      techProgress: rawGlobalTechState.techProgress.map(
        (tp: {
          techTemplateName: string;
          accumulatedResearch: number;
          factionContributions: { Key: { value: number }; Value: number }[];
        }) => ({
          techTemplateName: tp.techTemplateName,
          accumulatedResearch: tp.accumulatedResearch,
          factionContributions: tp.factionContributions.reduce((acc, curr) => {
            acc.set(curr.Key.value, curr.Value);
            return acc;
          }, new Map<number, number>()),
        }),
      ),
    };
  })();

  // Player
  const playerState = saveFile.gamestates["PavonisInteractive.TerraInvicta.TIPlayerState"].find(
    (i) => !i.Value.isAI,
  )?.Value;
  if (!playerState) {
    throw new Error("Player data not found in save file.");
  }
  const player: Player = {
    id: playerState.ID.value,
    faction: playerState.faction.value,
    templateName: playerState.templateName,
    displayName: playerState.displayName,
  };

  // Load and localize projects
  const projectLocalization = await localizations.project();
  async function getProjectLocalization(name: string) {
    return {
      displayName: projectLocalization.get(`TIProjectTemplate.displayName.${name}`),
      summary: projectLocalization.get(`TIProjectTemplate.summary.${name}`),
      description: projectLocalization.get(`TIProjectTemplate.description.${name}`),
    };
  }
  const projects = await (
    await templates.projects()
  ).reduce(async (acc, project) => {
    const map = await acc;
    map.set(project.dataName, { ...project, ...(await getProjectLocalization(project.dataName)) });
    return map;
  }, Promise.resolve(new Map<string, Awaited<ReturnType<typeof templates.projects>>[0] & { displayName?: string; summary?: string; description?: string }>()));

  // Load and localize techs
  const techLocalization = await localizations.tech();
  async function getTechLocalization(name: string) {
    return {
      displayName: techLocalization.get(`TITechTemplate.displayName.${name}`),
      summary: techLocalization.get(`TITechTemplate.summary.${name}`),
      description: techLocalization.get(`TITechTemplate.description.${name}`),
      quote: techLocalization.get(`TITechTemplate.quote.${name}`),
    };
  }
  const techs = await (
    await templates.techs()
  ).reduce(async (acc, tech) => {
    const map = await acc;
    map.set(tech.dataName, { ...tech, ...(await getTechLocalization(tech.dataName)) });
    return map;
  }, Promise.resolve(new Map<string, Awaited<ReturnType<typeof templates.techs>>[0] & { displayName?: string; summary?: string; description?: string; quote?: string }>()));

  // Drive and power plant localizations
  const driveLocalization = await localizations.drive();
  const powerPlantLocalization = await localizations.powerPlant();

  return {
    player,
    time,
    difficulty,
    mcMaskingTechs,
    projects,
    techs,
    driveLocalization,
    powerPlantLocalization,
    globalTechState,
  };
}
