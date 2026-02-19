import { SaveFile } from "../savefile";
import { templates } from "../templates";
import type { RegionEntry, NationEntry } from "./nations";

export async function processOrgs(
  saveFile: SaveFile,
  regionsById: Map<number, RegionEntry>,
  nationsById: Map<number, NationEntry>,
  playerFaction: { unassignedOrgIds: number[]; availableOrgIds: number[] },
) {
  const orgTemplates = new Map(
    (await templates.orgs()).map((org) => [
      org.dataName,
      {
        dataName: org.dataName,
        friendlyName: org.friendlyName,
        orgType: org.orgType,
        requiresNationality: org.requiresNationality,
        allowedOnMarket: org.allowedOnMarket,
        requiredOwnerTraits: org.requiredOwnerTraits,
        prohibitedOwnerTraits: org.prohibitedOwnerTraits,
        missionsGrantedNames: org.missionsGrantedNames,
        grantsMarked: org.grantsMarked,
        techBonuses: org.techBonuses,
      },
    ]),
  );

  const orgs = saveFile.gamestates["PavonisInteractive.TerraInvicta.TIOrgState"].map(({ Value: org }) => {
    const template = org.templateName ? orgTemplates.get(org.templateName) : undefined;
    const homeRegionId = org.homeRegion?.value;
    const homeNationId = regionsById.get(homeRegionId || -1)?.nationId;
    const homeNation = homeNationId ? nationsById.get(homeNationId) : undefined;
    return {
      id: org.ID.value,
      displayName: org.displayName!,
      templateName: org.templateName,
      template,
      assignedCouncilorId: org.assignedCouncilor?.value,
      factionOrbitId: org.factionOrbit?.value,
      homeRegionId,
      homeNationId,
      homeNationTemplateName: homeNation?.templateName,
      homeNationName: homeNation?.displayName,
      tier: org.tier,
      takeoverDefense: org.takeoverDefense,
      costMoney: org.costMoney,
      costInfluence: org.costInfluence,
      costOps: org.costOps,
      costBoost: org.costBoost,
      incomeMoney_month: org.incomeMoney_month,
      incomeInfluence_month: org.incomeInfluence_month,
      incomeOps_month: org.incomeOps_month,
      incomeBoost_month: org.incomeBoost_month,
      incomeMissionControl: org.incomeMissionControl,
      incomeResearch_month: org.incomeResearch_month,
      projectCapacityGranted: org.projectCapacityGranted,
      persuasion: org.persuasion,
      command: org.command,
      investigation: org.investigation,
      espionage: org.espionage,
      administration: org.administration,
      science: org.science,
      security: org.security,
      economyBonus: org.economyBonus,
      welfareBonus: org.welfareBonus,
      environmentBonus: org.environmentBonus,
      knowledgeBonus: org.knowledgeBonus,
      governmentBonus: org.governmentBonus,
      unityBonus: org.unityBonus,
      militaryBonus: org.militaryBonus,
      oppressionBonus: org.oppressionBonus,
      spoilsBonus: org.spoilsBonus,
      spaceDevBonus: org.spaceDevBonus,
      spaceflightBonus: org.spaceflightBonus,
      MCBonus: org.MCBonus,
      miningBonus: org.miningBonus,
      XPModifier: org.XPModifier,
      isAdminOrg: (org.tier || 0) < (org.administration || 0),
    };
  });
  const playerUnassignedOrgs = orgs.filter((org) => playerFaction.unassignedOrgIds.includes(org.id));
  const playerAvailableOrgs = orgs.filter((org) => playerFaction.availableOrgIds.includes(org.id));

  return { orgs, playerUnassignedOrgs, playerAvailableOrgs };
}

export type OrgEntry = Awaited<ReturnType<typeof processOrgs>>["orgs"][0];
