import { SaveFile } from "../savefile";
import { templates, TechCategory, MissionDataName } from "../templates";

interface Region {
  id: number;
  nationId?: number;
}

interface Nation {
  id: number;
  templateName: string | null;
  displayName: string | null;
}

export interface OrgTemplate {
  dataName: string;
  friendlyName: string;
  orgType: string;
  requiresNationality: boolean;
  allowedOnMarket: boolean;
  requiredOwnerTraits: string[];
  prohibitedOwnerTraits: string[];
  missionsGrantedNames: MissionDataName[];
  grantsMarked: boolean;
  techBonuses: Array<{
    category: TechCategory;
    bonus: number;
  }>;
}

export interface Org {
  id: number;
  displayName: string;
  templateName: string | null;
  template?: OrgTemplate;
  assignedCouncilorId?: number;
  factionOrbitId?: number;
  homeRegionId?: number;
  homeNationId?: number;
  homeNationTemplateName?: string | null;
  homeNationName?: string | null;
  tier?: number;
  takeoverDefense?: number;
  costMoney: number;
  costInfluence: number;
  costOps: number;
  costBoost: number;
  incomeMoney_month: number;
  incomeInfluence_month: number;
  incomeOps_month: number;
  incomeBoost_month: number;
  incomeMissionControl: number;
  incomeResearch_month: number;
  projectCapacityGranted: number;
  persuasion: number;
  command: number;
  investigation: number;
  espionage: number;
  administration: number;
  science: number;
  security: number;
  economyBonus: number;
  welfareBonus: number;
  environmentBonus: number;
  knowledgeBonus: number;
  governmentBonus: number;
  unityBonus: number;
  militaryBonus: number;
  oppressionBonus: number;
  spoilsBonus: number;
  spaceDevBonus: number;
  spaceflightBonus: number;
  MCBonus: number;
  miningBonus: number;
  XPModifier: number;
  isAdminOrg: boolean;
}

export async function loadOrgTemplates(): Promise<Map<string, OrgTemplate>> {
  return new Map(
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
}

export function analyzeOrgs(
  saveFile: SaveFile,
  orgTemplates: Map<string, OrgTemplate>,
  regionsById: Map<number, Region>,
  nationsById: Map<number, Nation>,
): Org[] {
  return saveFile.gamestates["PavonisInteractive.TerraInvicta.TIOrgState"].map(({ Value: org }) => {
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
}
