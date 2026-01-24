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
  battery: () => getLocalization("TIBatteryTemplate.en"),
  cinematics: () => getLocalization("TICinematicsTemplate.en"),
  condition: () => getLocalization("TICondition.en"),
  councilor: () => getLocalization("TICouncilorTemplate.en"),
  councilorType: () => getLocalization("TICouncilorTypeTemplate.en"),
  councilorVoice: () => getLocalization("TICouncilorVoiceTemplate.en"),
  drive: () => getLocalization("TIDriveTemplate.en"),
  effect: () => getLocalization("TIEffectTemplate.en"),
  factionIdeology: () => getLocalization("TIFactionIdeologyTemplate.en"),
  faction: () => getLocalization("TIFactionTemplate.en"),
  formation: () => getLocalization("TIFormationTemplate.en"),
  gun: () => getLocalization("TIGunTemplate.en"),
  habModule: () => getLocalization("TIHabModuleTemplate.en"),
  habSite: () => getLocalization("TIHabSiteTemplate.en"),
  hab: () => getLocalization("TIHabTemplate.en"),
  heatSink: () => getLocalization("TIHeatSinkTemplate.en"),
  laserWeapon: () => getLocalization("TILaserWeaponTemplate.en"),
  localization: () => getLocalization("TILocalizationTemplate.en"),
  magneticGun: () => getLocalization("TIMagneticGunTemplate.en"),
  meta: () => getLocalization("TIMetaTemplate.en"),
  miningProfile: () => getLocalization("TIMiningProfileTemplate.en"),
  missile: () => getLocalization("TIMissileTemplate.en"),
  mission: () => getLocalization("TIMissionTemplate.en"),
  narrativeEvent: () => getLocalization("TINarrativeEventTemplate.en"),
  nation: () => getLocalization("TINationTemplate.en"),
  navigable: () => getLocalization("TINavigableTemplate.en"),
  notification: () => getLocalization("TINotificationTemplate.en"),
  objective: () => getLocalization("TIObjectiveTemplate.en"),
  officer: () => getLocalization("TIOfficerTemplate.en"),
  operation: () => getLocalization("TIOperationTemplate.en"),
  orbit: () => getLocalization("TIOrbitTemplate.en"),
  org: () => getLocalization("TIOrgTemplate.en"),
  particleWeapon: () => getLocalization("TIParticleWeaponTemplate.en"),
  plasmaWeapon: () => getLocalization("TIPlasmaWeaponTemplate.en"),
  policy: () => getLocalization("TIPolicyTemplate.en"),
  powerPlant: () => getLocalization("TIPowerPlantTemplate.en"),
  priorityPreset: () => getLocalization("TIPriorityPresetTemplate.en"),
  project: () => getLocalization("TIProjectTemplate.en"),
  radiator: () => getLocalization("TIRadiatorTemplate.en"),
  region: () => getLocalization("TIRegionTemplate.en"),
  resourceCost: () => getLocalization("TIResourceCost.en"),
  shipArmor: () => getLocalization("TIShipArmorTemplate.en"),
  shipCommand: () => getLocalization("TIShipCommandTemplate.en"),
  shipHull: () => getLocalization("TIShipHullTemplate.en"),
  spaceBody: () => getLocalization("TISpaceBodyTemplate.en"),
  tech: () => getLocalization("TITechTemplate.en"),
  trait: () => getLocalization("TITraitTemplate.en"),
  utilityModule: () => getLocalization("TIUtilityModuleTemplate.en"),
  victory: () => getLocalization("TIVictoryTemplate.en"),
  uiArmy: () => getLocalization("UIArmy.en"),
  uiCodex: () => getLocalization("UICodex.en"),
  uiCouncil: () => getLocalization("UICouncil.en"),
  uiCouncilor: () => getLocalization("UICouncilor.en"),
  uiCouncilorChat: () => getLocalization("UICouncilorChat.en"),
  uiFleets: () => getLocalization("UIFleets.en"),
  uiGeneralControls: () => getLocalization("UIGeneralControls.en"),
  uiGlobal: () => getLocalization("UIGlobal.en"),
  uiHabs: () => getLocalization("UIHabs.en"),
  uiIntel: () => getLocalization("UIIntel.en"),
  uiMarkers: () => getLocalization("UIMarkers.en"),
  uiMissionPhase: () => getLocalization("UIMissionPhase.en"),
  uiNation: () => getLocalization("UINation.en"),
  uiNations: () => getLocalization("UINations.en"),
  uiNotifications: () => getLocalization("UINotifications.en"),
  uiObjectives: () => getLocalization("UIObjectives.en"),
  uiOperations: () => getLocalization("UIOperations.en"),
  uiOptions: () => getLocalization("UIOptions.en"),
  uiScience: () => getLocalization("UIScience.en"),
  uiSpace: () => getLocalization("UISpace.en"),
  uiSpaceCombat: () => getLocalization("UISpaceCombat.en"),
  uiStartScreen: () => getLocalization("UIStartScreen.en"),
};

export type Localization = Map<string, string>;
