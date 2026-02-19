export interface RemainingResearch {
  techResearchRemaining: number;
  projectResearchRemaining: number;
  requiredTechs: string[];
  requiredProjects: string[];
}

export function calculateRemainingResearch(
  targetName: string,
  globalTechState: {
    finishedTechsNames: string[];
    techProgress: { techTemplateName: string; accumulatedResearch: number }[];
  },
  playerFaction: {
    finishedProjectNames: string[];
    currentProjectProgress: { projectTemplateName: string; accumulatedResearch: number }[];
  },
  techs: Map<string, { prereqs?: string[]; researchCost: number }>,
  projects: Map<string, { prereqs?: string[]; researchCost: number }>,
): RemainingResearch {
  const complete = new Set([...globalTechState.finishedTechsNames, ...playerFaction.finishedProjectNames]);
  const required = new Set<string>();

  if (!complete.has(targetName)) {
    required.add(targetName);
  }

  while (true) {
    let done = true;
    for (const req of Array.from(required)) {
      const prereqs = techs.get(req)?.prereqs || projects.get(req)?.prereqs;
      if (!prereqs) continue;
      for (const prereq of prereqs) {
        if (!complete.has(prereq) && !required.has(prereq)) {
          required.add(prereq);
          done = false;
        }
      }
    }
    if (done) break;
  }

  const accumulatedResearchByName = new Map<string, number>([
    ...globalTechState.techProgress.map((i) => [i.techTemplateName, i.accumulatedResearch] as const),
    ...playerFaction.currentProjectProgress.map((i) => [i.projectTemplateName, i.accumulatedResearch] as const),
  ]);

  let techResearchRemaining = 0;
  let projectResearchRemaining = 0;
  const requiredTechs: string[] = [];
  const requiredProjects: string[] = [];

  for (const name of required) {
    const tech = techs.get(name);
    const project = projects.get(name);
    const both = tech || project;
    if (!both) continue;

    const accumulatedResearch = accumulatedResearchByName.get(name) || 0;
    const remainingCost = Math.max(both.researchCost - accumulatedResearch, 0);

    if (tech) {
      techResearchRemaining += remainingCost;
      requiredTechs.push(name);
    } else {
      projectResearchRemaining += remainingCost;
      requiredProjects.push(name);
    }
  }

  return { techResearchRemaining, projectResearchRemaining, requiredTechs, requiredProjects };
}
