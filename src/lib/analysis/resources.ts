import { Councilor } from "./councilors";
import { Org } from "./orgs";

export interface StealableOrg extends Org {
  councilorId: number | undefined;
  councilor: string | undefined;
  admin: number | undefined;
  faction: {
    id: number;
    displayName: string;
    templateName: string;
  } | undefined;
}

export interface StealableProject {
  projectName: string;
  factionId: number;
}

export function calculatePlayerStealableOrgs(
  councilors: Councilor[],
  orgs: Org[],
  factions: any[],
  factionsById: Map<number, any>,
  factionAdminById: Map<number, number>,
  playerFactionId: number,
  playerVisibleFactionIds: Set<number>,
): StealableOrg[] {
  const playerVisibleCouncilors = councilors.filter(
    (i) => i.factionId !== playerFactionId && i.playerIntel >= 0.25,
  ); // TODO: figure out exact intel threshold

  const playerStealableOrgs = playerVisibleCouncilors
    .filter((c) => c.playerIntel >= 0.5) // TODO: figure out exact intel threshold for stealing
    .map((c) => [
      ...c.orgs.map((o) => {
        const faction = factionsById.get(c.factionId || -1);
        return {
          ...o,
          councilorId: c.id as number | undefined,
          councilor: c.displayName as string | undefined,
          admin: Math.max(
            0,
            (c.effectsWithOrgsAndAugments.administration || 0) + (c.effectsWithOrgsAndAugments.Administration || 0),
          ) as number | undefined,
          faction: faction && {
            id: faction.id,
            displayName: faction.displayName,
            templateName: faction.templateName,
          },
        };
      }),
    ])
    .flat()
    .concat(
      factions
        .filter((i) => i.id !== playerFactionId)
        .filter((faction) => playerVisibleFactionIds.has(faction.id))
        .flatMap((faction) => {
          const factionOrgs = orgs.filter((org) => faction.unassignedOrgIds.includes(org.id));
          return factionOrgs.map((o) => {
            return {
              ...o,
              councilorId: undefined,
              councilor: undefined,
              admin: faction && factionAdminById.get(faction.id),
              faction: faction && {
                id: faction.id,
                displayName: faction.displayName,
                templateName: faction.templateName,
              },
            };
          });
        }),
    )
    .filter((o) => o.template?.allowedOnMarket);

  return playerStealableOrgs;
}

export function calculatePlayerStealableProjects(
  factions: any[],
  projects: Map<string, any>,
  playerFaction: any,
  alienFaction: any,
  playerVisibleFactionIds: Set<number>,
): StealableProject[] {
  const playerStealableProjects = factions
    .filter((i) => i.id !== alienFaction.id)
    .filter((i) => playerVisibleFactionIds.has(i.id))
    .flatMap((faction) => {
      return faction.finishedProjectNames.map((projectName: string) => ({ projectName, factionId: faction.id }));
    })
    .filter(
      (i) =>
        !playerFaction.availableProjectNames.includes(i.projectName) &&
        !playerFaction.finishedProjectNames.includes(i.projectName),
    )
    .filter((i) => {
      const project = projects.get(i.projectName);
      if (!project) return true;
      if (project.oneTimeGlobally) return false;
      if (project.requiredMilestone && !playerFaction.milestones.includes(project.requiredMilestone)) return false;
      const prereqs = project.prereqs || [];
      if (!prereqs.every((i: string) => !i.startsWith("Project_") || playerFaction.finishedProjectNames.includes(i)))
        return false;
      const factionPrereq = project.factionPrereq || [];
      if (factionPrereq.length === 0) return true;
      return factionPrereq.includes(playerFaction.templateName!);
    });

  return playerStealableProjects;
}
