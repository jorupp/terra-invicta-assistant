import { localizations } from "../localization";
import { SaveFile } from "../savefile";
import { templates } from "../templates";

export async function analyzeResearch(saveFile: SaveFile) {
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

  const globalTechState = (() => {
    const globalTechState = saveFile.gamestates["PavonisInteractive.TerraInvicta.TIGlobalResearchState"][0].Value;
    return {
      ...globalTechState,
      techProgress: globalTechState.techProgress.map((tp) => ({
        ...tp,
        factionContributions: tp.factionContributions.reduce((acc, curr) => {
          acc.set(curr.Key.value, curr.Value);
          return acc;
        }, new Map<number, number>()),
      })),
    };
  })();

  return { projects, techs, globalTechState };
}
