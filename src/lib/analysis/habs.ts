import { SaveFile } from "../savefile";
import { combineEffects, ShowEffectsProps } from "@/components/showEffects";
import { noDate } from "../utils";
import { getSolarMultiplier, getMineMultipler } from "./hab-helpers";
import type { SpaceBodies } from "./space";
import type { templates } from "../templates";

type HabModuleTemplate = Awaited<ReturnType<typeof templates.habModules>>[0];

type FactionForHabs = {
  id: number;
  unlockedHabModules: Set<string>;
  miningMultipliers: {
    water: number;
    volatiles: number;
    metals: number;
    nobles: number;
    fissiles: number;
  };
};

type CouncilorForMining = {
  factionId: number | undefined;
  effectsWithOrgsAndAugments: { miningBonus?: number };
};

function isImportant(module: { templateName?: string | null }) {
  return (
    module.templateName?.includes("Defense") ||
    module.templateName?.includes("Battlestation") ||
    module.templateName?.includes("Mine") ||
    module.templateName?.includes("Mining") ||
    module.templateName?.includes("Dock") ||
    module.templateName?.includes("Depot") ||
    module.templateName?.includes(" Core")
  );
}

export function processHabInfrastructure(saveFile: SaveFile) {
  const habModules = saveFile.gamestates["PavonisInteractive.TerraInvicta.TIHabModuleState"].map(({ Value: mod }) => ({
    id: mod.ID.value,
    sectorId: mod.sector?.value,
    templateName: mod.templateName,
    displayName: mod.displayName,
    destroyed: mod.destroyed,
    startBuildDate: mod.startBuildDate,
    completionDate: mod.completionDate,
    decomissionDate: mod.decommissionDate,
    powered: mod.powered,
    slot: mod.slot,
    buildCost: mod.buildCost,
  }));
  const habModulesBySectorId = habModules.reduce((acc, mod) => {
    if (!mod.sectorId) return acc;
    if (!acc.has(mod.sectorId)) {
      acc.set(mod.sectorId, []);
    }
    acc.get(mod.sectorId)!.push(mod);
    return acc;
  }, new Map<number, typeof habModules>());
  const habSectors = saveFile.gamestates["PavonisInteractive.TerraInvicta.TISectorState"].map(({ Value: sector }) => ({
    id: sector.ID.value,
    faction: sector.faction?.value,
    habId: sector.hab?.value,
    sectorNum: sector.sectorNum,
    slots: sector.slots,
    exists: sector.exists,
    displayName: sector.displayName,
    habModuleIds: sector.habModules.map((i) => i.value),
    habModules: habModulesBySectorId.get(sector.ID.value) || [],
  }));
  const habSectorsByHabId = habSectors.reduce((acc, sector) => {
    if (!sector.habId) return acc;
    if (!acc.has(sector.habId)) {
      acc.set(sector.habId, []);
    }
    acc.get(sector.habId)!.push(sector);
    return acc;
  }, new Map<number, typeof habSectors>());
  const habSites = saveFile.gamestates["PavonisInteractive.TerraInvicta.TIHabSiteState"].map(
    ({
      Key: { value: id },
      Value: {
        parentBody: { value: parentBodyId },
        water_day,
        volatiles_day,
        metals_day,
        nobles_day,
        fissiles_day,
      },
    }) => ({ id, parentBodyId, water_day, volatiles_day, metals_day, nobles_day, fissiles_day }),
  );
  const habSitesById = new Map<number, (typeof habSites)[0]>(habSites.map((site) => [site.id, site]));

  return { habSectorsByHabId, habSitesById };
}

export function calculateMiningBonuses(
  saveFile: SaveFile,
  factions: FactionForHabs[],
  councilors: CouncilorForMining[],
  playerFactionId: number,
) {
  const effectsState = saveFile.gamestates["PavonisInteractive.TerraInvicta.TIEffectsState"][0]?.Value;

  factions.forEach((faction) => {
    if (faction.id !== playerFactionId) return;
    let waterMultiplier = 1;
    let volatilesMultiplier = 1;
    let metalsMultiplier = 1;
    let noblesMultiplier = 1;
    let fissilesMultiplier = 1;

    // 1. Add councilor mining bonuses (applies to all resources)
    const factionCouncilors = councilors.filter((c) => c.factionId === faction.id);
    let spaceMiningMultiplier =
      factionCouncilors.reduce((sum, c) => sum + (c.effectsWithOrgsAndAugments.miningBonus || 0), 0) + 1;

    // 2. Add faction effects from TIEffectsState
    if (effectsState?.factionEffectsNames) {
      const factionEffects = effectsState.factionEffectsNames.find((kv) => kv.Key.value === faction.id)?.Value;

      if (factionEffects) {
        const spaceMiningEffects = factionEffects.SpaceMiningBonus || [];
        spaceMiningEffects.forEach((effect) => {
          const match = effect.match(/Effect_SpaceMiningBonus(\d+)/);
          if (match) {
            spaceMiningMultiplier += parseInt(match[1], 10) / 100;
          }
        });

        waterMultiplier *= Math.pow(
          1.15,
          factionEffects.MiningWaterBonus?.filter((e) => e === "Effect_MiningWaterBonus").length || 0,
        );
        volatilesMultiplier *= Math.pow(
          1.15,
          factionEffects.MiningVolatilesBonus?.filter((e) => e === "Effect_MiningVolatilesBonus").length || 0,
        );
        metalsMultiplier *= Math.pow(
          1.15,
          factionEffects.MiningMetalsBonus?.filter((e) => e === "Effect_MiningMetalsBonus").length || 0,
        );
        noblesMultiplier *= Math.pow(
          1.15,
          factionEffects.MiningNoblesBonus?.filter((e) => e === "Effect_MiningNoblesBonus").length || 0,
        );
        fissilesMultiplier *= Math.pow(
          1.15,
          factionEffects.MiningFissilesBonus?.filter((e) => e === "Effect_MiningFissilesBonus").length || 0,
        );
      }
    }

    waterMultiplier *= spaceMiningMultiplier;
    volatilesMultiplier *= spaceMiningMultiplier;
    metalsMultiplier *= spaceMiningMultiplier;
    noblesMultiplier *= spaceMiningMultiplier;
    fissilesMultiplier *= spaceMiningMultiplier;

    faction.miningMultipliers = {
      water: waterMultiplier,
      volatiles: volatilesMultiplier,
      metals: metalsMultiplier,
      nobles: noblesMultiplier,
      fissiles: fissilesMultiplier,
    };
  });
}

export function processHabs(
  saveFile: SaveFile,
  habSitesById: ReturnType<typeof processHabInfrastructure>["habSitesById"],
  habSectorsByHabId: ReturnType<typeof processHabInfrastructure>["habSectorsByHabId"],
  bodiesById: SpaceBodies["bodiesById"],
  orbitsById: SpaceBodies["orbitsById"],
  factionsById: Map<number, FactionForHabs>,
  habModuleTemplates: Map<string, HabModuleTemplate>,
  moduleUpgradeMap: Map<string, string>,
  gameCurrentDateTimeFormatted: string,
) {
  const habs = saveFile.gamestates["PavonisInteractive.TerraInvicta.TIHabState"]
    .map(({ Value: hab }) => {
      const tier = hab.tier;
      const site = habSitesById.get(hab.habSite?.value || 0);
      const body = site ? bodiesById.get(site.parentBodyId) : null;
      
      // For orbital stations, get the body from the orbit's barycenter
      let orbitBody = null;
      if (!body && hab.orbitState?.value) {
        const orbit = orbitsById.get(hab.orbitState.value);
        if (orbit) {
          orbitBody = bodiesById.get(orbit.barycenterId);
        }
      }
      
      const effectiveBody = body || orbitBody;

      // Determine planet name (parent body for moons, body itself for planets, but stop at Sol)
      let planetName = effectiveBody?.displayName || "Unknown";
      if (effectiveBody) {
        let currentBody = effectiveBody;
        while (currentBody.barycenterId && currentBody.barycenterId !== 0) {
          const parent = bodiesById.get(currentBody.barycenterId);
          if (parent && parent.templateName !== "Sol") {
            currentBody = parent;
          } else {
            break;
          }
        }
        planetName = currentBody.displayName || "Unknown";
      }

      const solarMirrorBonus = effectiveBody ? effectiveBody.solarMirrorBonusByFactionId.get(hab.faction.value) || 0 : 0;
      const solarMultiplier = getSolarMultiplier(site?.id || hab.orbitState?.value);
      const mineMultipler = getMineMultipler(site?.parentBodyId);

      // there's probably some data to indicate which sectors are populated for a given tier + habType (shrug)
      const validSectors = new Set(
        tier === 1 ? [0] : tier === 2 ? (hab.habType === "Station" ? [0, 2, 4] : [0, 1, 2]) : [0, 1, 2, 3, 4],
      );
      const sectors = (habSectorsByHabId.get(hab.ID.value) || []).filter(
        (s) => s.exists && validSectors.has(s.sectorNum),
      );
      const modules = sectors
        .flatMap((s) => s.habModules)
        .map((m) => ({ ...m, template: habModuleTemplates.get(m.templateName!) }));
      const empty = modules.filter((m) => m.destroyed || m.startBuildDate === noDate);
      const underConstruction = modules.filter((m) => m.completionDate >= gameCurrentDateTimeFormatted && !m.destroyed);
      const maxCompletionDate = underConstruction.reduce((acc, curr) => {
        if (curr.completionDate > acc) {
          return curr.completionDate;
        }
        return acc;
      }, gameCurrentDateTimeFormatted);
      const maxDaysToCompletion = maxCompletionDate
        ? (new Date(maxCompletionDate).getTime() - new Date(gameCurrentDateTimeFormatted).getTime()) /
          (1000 * 60 * 60 * 24)
        : null;
      const highlightedCompletions = underConstruction
        .toSorted((a, b) => {
          if (isImportant(a) && !isImportant(b)) return -1;
          if (!isImportant(a) && isImportant(b)) return 1;
          return a.completionDate.localeCompare(b.completionDate);
        })
        .map((completion) => ({
          ...completion,
          daysToCompletion:
            (new Date(completion.completionDate).getTime() - new Date(gameCurrentDateTimeFormatted).getTime()) /
            (1000 * 60 * 60 * 24),
        }))
        .filter((i, ix) => ix === 0 || isImportant(i));
      const nonEmpty = modules.filter((m) => !m.destroyed && m.startBuildDate !== noDate);
      const mine = nonEmpty.filter((m) => m.template?.miningModifier);
      const isBase = hab.habType === "Base";
      const missingMine = isBase && mine.length === 0;
      const moduleTemplates = modules
        .filter((i) => !i.destroyed)
        .map((i) => {
          const template = habModuleTemplates.get(i.templateName!)!;
          return {
            active:
              (i.powered && (i.completionDate === noDate || i.completionDate <= gameCurrentDateTimeFormatted)) ||
              template?.coreModule ||
              false,
            template,
          };
        })
        .filter((i) => i.template);
      const moduleBonuses = moduleTemplates.map(({ active, template: t }) => {
        const {
          techBonuses,
          incomeInfluence_month,
          incomeMoney_month,
          incomeOps_month,
          incomeProjects,
          incomeResearch_month,
          supportMaterials_month,
          missionControl,
        } = t;

        const effects: ShowEffectsProps = {
          techBonuses,
          incomeBoost_month: -(supportMaterials_month?.boost || 0),
          incomeMissionControl: missionControl,
          incomeInfluence_month,
          incomeMoney_month,
          incomeOps_month,
          projectCapacityGranted: incomeProjects,
          incomeResearch_month,
        };
        if (hab.inEarthLEO) {
          if (t.controlPointCapacity) {
            effects.controlPoints = t.controlPointCapacity;
          }
          if (t.incomeProjects) {
            effects.projectCapacityGranted = t.incomeProjects;
          }
          if (t.specialRules?.includes("LEOBonusEconomy"))
            effects.economyBonus = (effects.economyBonus || 0) + t.specialRulesValue!;
          if (t.specialRules?.includes("LEOBonusEnvironment"))
            effects.environmentBonus = (effects.environmentBonus || 0) + t.specialRulesValue!;
          if (t.specialRules?.includes("LEOBonusGovernment"))
            effects.governmentBonus = (effects.governmentBonus || 0) + t.specialRulesValue!;
          if (t.specialRules?.includes("LEOBonusKnowledge"))
            effects.knowledgeBonus = (effects.knowledgeBonus || 0) + t.specialRulesValue!;
          if (t.specialRules?.includes("LEOBonusLaunchFacilities"))
            effects.spaceflightBonus = (effects.spaceflightBonus || 0) + t.specialRulesValue!;
          if (t.specialRules?.includes("LEOBonusMissionControl"))
            effects.MCBonus = (effects.MCBonus || 0) + t.specialRulesValue!;
          if (t.specialRules?.includes("LEOBonusOppression"))
            effects.oppressionBonus = (effects.oppressionBonus || 0) + t.specialRulesValue!;
          if (t.specialRules?.includes("LEOBonusWelfare"))
            effects.welfareBonus = (effects.welfareBonus || 0) + t.specialRulesValue!;
          if (t.specialRules?.includes("LEOBonusArmyCombatValue"))
            effects.miltechBonus = (effects.miltechBonus || 0) + t.specialRulesValue!;
        }
        return { active, effects };
      });
      const activeEffects = moduleBonuses
        .filter((i) => i.active)
        .reduce<ShowEffectsProps>((acc, curr) => combineEffects(acc, curr.effects), {});
      const potentialEffects = moduleBonuses.reduce<ShowEffectsProps>(
        (acc, curr) => combineEffects(acc, curr.effects),
        {},
      );
      const defenseModules = moduleTemplates.map(({ active, template: t }) => {
        if (t.spaceCombatModule) {
          return { active, tier: t.tier || 1 };
        }
      });
      const activeDefense = defenseModules
        .filter((m) => m?.active)
        .map((m) => Math.pow(10, m!.tier - 1))
        .reduce((a, b) => a + b, 0);
      activeEffects.combatScore = activeDefense;
      const potentialDefense = defenseModules
        .filter((m) => m)
        .map((m) => Math.pow(10, m!.tier - 1))
        .reduce((a, b) => a + b, 0);
      potentialEffects.combatScore = potentialDefense;

      const power = moduleTemplates.map(({ active, template: t }) => {
        const basePower = t.power || 0;
        const specialRules = t.specialRules || [];
        if (specialRules.includes("Solar_Power_Variable_Output")) {
          if (!solarMultiplier) {
            return { active, power: 0, isSolar: true };
          }
          const power = basePower * (solarMultiplier || 0) + solarMirrorBonus * t.tier;

          return { active, power, isSolar: true };
        }
        if (specialRules.includes("Cost_Scales_With_Gravity")) {
          return { active, power: basePower * mineMultipler, isSolar: false };
        }

        return { active, power: basePower, isSolar: false };
      });

      const activePower = Math.round(power.filter(({ active }) => active).reduce((a, b) => a + b.power, 0));
      const futurePower = Math.round(power.reduce((a, b) => a + b.power, 0));
      const hasSolar = power.some((p) => p.isSolar);

      // Phase 3: Calculate if any power modules can be safely upgraded
      const habFaction = factionsById.get(hab.faction.value);
      let canUpgradePower = false;

      if (habFaction) {
        const activePowerModules = moduleTemplates
          .map(({ active, template: t }, index) => ({
            active,
            template: t,
            actualPower: power[index].power,
          }))
          .filter(
            ({ active, template, actualPower }) =>
              active && actualPower > 0 && template.dataName && moduleUpgradeMap.has(template.dataName),
          );

        for (const { template, actualPower } of activePowerModules) {
          const upgradeName = moduleUpgradeMap.get(template.dataName);
          if (upgradeName && habFaction.unlockedHabModules.has(upgradeName)) {
            const powerAfterUpgrade = activePower - actualPower;
            if (powerAfterUpgrade >= 0) {
              canUpgradePower = true;
              break;
            }
          }
        }
      }

      let canUpgradeCombat = false;

      if (habFaction) {
        const combatModulesNotReady = moduleTemplates.some(
          ({ active, template }) => template.spaceCombatModule && !active,
        );

        if (!combatModulesNotReady) {
          const activeCombatModules = moduleTemplates.filter(
            ({ active, template }) =>
              active && template.spaceCombatModule && template.dataName && moduleUpgradeMap.has(template.dataName),
          );

          for (const { template } of activeCombatModules) {
            const upgradeName = moduleUpgradeMap.get(template.dataName);
            if (upgradeName && habFaction.unlockedHabModules.has(upgradeName)) {
              canUpgradeCombat = true;
              break;
            }
          }
        }
      }

      let canUpgradeFarm = false;

      if (habFaction) {
        const totalCrewNeeded = moduleTemplates.reduce((sum, { template }) => sum + (template.crew || 0), 0);

        const totalCrewSupported = moduleTemplates
          .filter(({ template }) => template.specialRules?.includes("Farm"))
          .reduce((sum, { template }) => sum + (template.specialRulesValue || 0), 0);

        if (totalCrewNeeded > totalCrewSupported) {
          const upgradableFarms = moduleTemplates.filter(
            ({ template }) =>
              template.specialRules?.includes("Farm") && template.dataName && moduleUpgradeMap.has(template.dataName),
          );

          for (const { template } of upgradableFarms) {
            const upgradeName = moduleUpgradeMap.get(template.dataName);
            if (upgradeName && habFaction.unlockedHabModules.has(upgradeName)) {
              canUpgradeFarm = true;
              break;
            }
          }
        }
      }

      let canUpgradeFactory = false;

      if (habFaction) {
        const factoryModules = nonEmpty
          .map((m) => ({
            module: m,
            template: habModuleTemplates.get(m.templateName!),
          }))
          .filter(({ template }) => template?.specialRules?.includes("CanFoundTier1Habs"));

        const modulesUnderConstruction = underConstruction.length;

        const safeToUpgradeWithOtherFactory = factoryModules.length >= 2;
        const safeToUpgradeNoConstruction = modulesUnderConstruction === 0;
        const safeToUpgrade = safeToUpgradeWithOtherFactory || safeToUpgradeNoConstruction;

        if (safeToUpgrade) {
          const upgradableFactories = factoryModules.filter(
            ({ template }) => template?.dataName && moduleUpgradeMap.has(template.dataName),
          );

          for (const { template } of upgradableFactories) {
            if (!template) continue;
            const upgradeName = moduleUpgradeMap.get(template.dataName);
            if (upgradeName && habFaction.unlockedHabModules.has(upgradeName)) {
              const upgradeTemplate = habModuleTemplates.get(upgradeName);
              if (upgradeTemplate && upgradeTemplate.tier <= hab.tier) {
                canUpgradeFactory = true;
                break;
              }
            }
          }
        }
      }

      let canUpgradeMining = false;
      let miningUpgradeInfo: { upgradeName: string; factoryName: string; factoryTier: number } | null = null;

      if (habFaction) {
        const maxFactoryTier = Math.max(
          0,
          ...[...habModuleTemplates.values()]
            .filter(
              (t) => t.specialRules?.includes("CanFoundTier1Habs") && habFaction.unlockedHabModules.has(t.dataName),
            )
            .map((t) => t.tier),
        );

        const bestConstructedFactory = nonEmpty
          .map((m) => ({
            module: m,
            template: habModuleTemplates.get(m.templateName!),
          }))
          .filter(
            ({ template }) => template?.specialRules?.includes("CanFoundTier1Habs") && template.tier === maxFactoryTier,
          )
          .map(({ template }) => template)
          .filter((t): t is NonNullable<typeof t> => t !== undefined)[0];

        const miningModules = moduleTemplates.filter(
          ({ template }) =>
            template.miningModifier &&
            template.miningModifier > 0 &&
            template.dataName &&
            moduleUpgradeMap.has(template.dataName),
        );

        for (const { template } of miningModules) {
          const upgradeName = moduleUpgradeMap.get(template.dataName);
          if (upgradeName && habFaction.unlockedHabModules.has(upgradeName)) {
            const upgradeTemplate = habModuleTemplates.get(upgradeName);
            if (upgradeTemplate && upgradeTemplate.tier <= hab.tier) {
              if (upgradeTemplate.tier === 3) {
                if (bestConstructedFactory) {
                  canUpgradeMining = true;
                  miningUpgradeInfo = {
                    upgradeName: upgradeTemplate.friendlyName,
                    factoryName: bestConstructedFactory.friendlyName,
                    factoryTier: bestConstructedFactory.tier,
                  };
                  break;
                }
              } else {
                canUpgradeMining = true;
                miningUpgradeInfo = {
                  upgradeName: upgradeTemplate.friendlyName,
                  factoryName: bestConstructedFactory?.friendlyName || "No factory",
                  factoryTier: bestConstructedFactory?.tier || 0,
                };
                break;
              }
            }
          }
        }
      }

      const upgradeableModuleNames: string[] = [];

      if (habFaction) {
        const allUpgradableModules = moduleTemplates.filter(
          ({ template }) => template.dataName && moduleUpgradeMap.has(template.dataName),
        );

        for (const { template } of allUpgradableModules) {
          const upgradeName = moduleUpgradeMap.get(template.dataName);
          if (upgradeName && habFaction.unlockedHabModules.has(upgradeName)) {
            const upgradeTemplate = habModuleTemplates.get(upgradeName);
            if (upgradeTemplate && upgradeTemplate.tier <= hab.tier) {
              const isPower = template.power && template.power > 0;
              const isCombat = template.spaceCombatModule;
              const isFarm = template.specialRules?.includes("Farm");
              const isFactory = template.specialRules?.includes("CanFoundTier1Habs");
              const isMining = template.miningModifier && template.miningModifier > 0;

              if (!isPower && !isCombat && !isFarm && !isFactory && !isMining) {
                if (!upgradeableModuleNames.includes(upgradeTemplate.friendlyName)) {
                  upgradeableModuleNames.push(upgradeTemplate.friendlyName);
                }
              }
            }
          }
        }
      }

      const activeFactories = moduleTemplates.filter(
        ({ active, template }) => active && template.specialRules?.includes("CanFoundTier1Habs"),
      );

      const highestActiveFactoryTier =
        activeFactories.length > 0 ? Math.max(...activeFactories.map(({ template }) => template.tier)) : 0;

      const highestActiveFactoryCount = activeFactories.filter(
        ({ template }) => template.tier === highestActiveFactoryTier,
      ).length;

      const hasUnnecessaryFactory = activeFactories.length > 0 && underConstruction.length === 0;

      const constructedFactories = nonEmpty.filter((m) => {
        const template = habModuleTemplates.get(m.templateName!);
        return template?.specialRules?.includes("CanFoundTier1Habs");
      });

      const highestConstructedFactoryTier =
        constructedFactories.length > 0
          ? Math.max(
              ...constructedFactories.map((m) => {
                const template = habModuleTemplates.get(m.templateName!);
                return template?.tier || 0;
              }),
            )
          : 0;

      const highestConstructedFactoryCount = constructedFactories.filter((m) => {
        const template = habModuleTemplates.get(m.templateName!);
        return template?.tier === highestConstructedFactoryTier;
      }).length;

      const isAutomated = moduleTemplates.some(({ template }) => template.automated === true);

      let operationsCenterTier = 0;
      let needsOperationsCenterUpgrade = false;

      if (!isAutomated && habFaction) {
        const currentOperationsCenter = moduleTemplates.find(({ template }) => (template.missionControl ?? 0) > 0);
        operationsCenterTier = currentOperationsCenter?.template?.tier || 0;

        const bestUnlockedOperationsCenter = Array.from(habModuleTemplates.values())
          .filter(
            (template) =>
              (template.missionControl ?? 0) > 0 &&
              template.tier <= hab.tier &&
              habFaction.unlockedHabModules.has(template.dataName),
          )
          .reduce<(typeof habModuleTemplates extends Map<string, infer T> ? T : never) | null>((best, module) => {
            if (!best || module.tier > best.tier) {
              return module;
            }
            return best;
          }, null as any);

        if (bestUnlockedOperationsCenter && bestUnlockedOperationsCenter.tier > operationsCenterTier) {
          needsOperationsCenterUpgrade = true;
        }
      }

      let adminTowerTier = 0;
      let needsAdminTowerUpgrade = false;

      if (hab.inEarthLEO && habFaction) {
        const currentAdminTower = moduleTemplates.find(({ template }) => (template.controlPointCapacity ?? 0) > 0);
        adminTowerTier = currentAdminTower?.template?.tier || 0;

        const bestUnlockedAdminTower = Array.from(habModuleTemplates.values())
          .filter(
            (template) =>
              (template.controlPointCapacity ?? 0) > 0 && habFaction.unlockedHabModules.has(template.dataName),
          )
          .reduce<(typeof habModuleTemplates extends Map<string, infer T> ? T : never) | null>((best, module) => {
            if (!best || module.tier > best.tier) {
              return module;
            }
            return best;
          }, null as any);

        if (bestUnlockedAdminTower && bestUnlockedAdminTower.tier > adminTowerTier) {
          needsAdminTowerUpgrade = true;
        }
      }

      type MineEffects = {
        water_month: number;
        volatiles_month: number;
        metals_month: number;
        nobles_month: number;
        fissiles_month: number;
        miningModifier: number;
      };

      const currentMine = mine[0];
      const currentMineModifier = currentMine?.template?.miningModifier || 1;

      const mineTier = currentMine?.template?.tier || 0;
      const isMineActive =
        currentMine?.powered &&
        (currentMine.completionDate === noDate || currentMine.completionDate <= gameCurrentDateTimeFormatted);
      const isMineComplete =
        currentMine &&
        (currentMine.completionDate === noDate || currentMine.completionDate <= gameCurrentDateTimeFormatted);

      const miningMultipliers = habFaction?.miningMultipliers || {
        water: 1,
        volatiles: 1,
        metals: 1,
        nobles: 1,
        fissiles: 1,
      };

      const miningDaysPerMonth = 365.25 / 12;

      const currentMineEffects: MineEffects = {
        water_month:
          isMineActive && site
            ? site.water_day * currentMineModifier * miningDaysPerMonth * miningMultipliers.water
            : 0,
        volatiles_month:
          isMineActive && site
            ? site.volatiles_day * currentMineModifier * miningDaysPerMonth * miningMultipliers.volatiles
            : 0,
        metals_month:
          isMineActive && site
            ? site.metals_day * currentMineModifier * miningDaysPerMonth * miningMultipliers.metals
            : 0,
        nobles_month:
          isMineActive && site
            ? site.nobles_day * currentMineModifier * miningDaysPerMonth * miningMultipliers.nobles
            : 0,
        fissiles_month:
          isMineActive && site
            ? site.fissiles_day * currentMineModifier * miningDaysPerMonth * miningMultipliers.fissiles
            : 0,
        miningModifier: currentMineModifier,
      };

      const currentMinePoweredEffects: MineEffects = {
        water_month:
          isMineComplete && site
            ? site.water_day * currentMineModifier * miningDaysPerMonth * miningMultipliers.water
            : 0,
        volatiles_month:
          isMineComplete && site
            ? site.volatiles_day * currentMineModifier * miningDaysPerMonth * miningMultipliers.volatiles
            : 0,
        metals_month:
          isMineComplete && site
            ? site.metals_day * currentMineModifier * miningDaysPerMonth * miningMultipliers.metals
            : 0,
        nobles_month:
          isMineComplete && site
            ? site.nobles_day * currentMineModifier * miningDaysPerMonth * miningMultipliers.nobles
            : 0,
        fissiles_month:
          isMineComplete && site
            ? site.fissiles_day * currentMineModifier * miningDaysPerMonth * miningMultipliers.fissiles
            : 0,
        miningModifier: currentMineModifier,
      };

      const bestUnlockedMine = habFaction
        ? [...habModuleTemplates.values()]
            .filter(
              (module) =>
                module.miningModifier &&
                module.miningModifier > 0 &&
                module.habType === hab.habType &&
                module.tier <= hab.tier &&
                habFaction.unlockedHabModules.has(module.dataName),
            )
            .reduce<typeof habModuleTemplates extends Map<string, infer T> ? T : never | null>((best, module) => {
              if (!best || module.miningModifier > best.miningModifier) {
                return module;
              }
              return best;
            }, null as any)
        : null;

      const bestMineModifier = bestUnlockedMine?.miningModifier || 1;
      const bestMineEffects: MineEffects = {
        water_month: site ? site.water_day * bestMineModifier * miningDaysPerMonth * miningMultipliers.water : 0,
        volatiles_month: site
          ? site.volatiles_day * bestMineModifier * miningDaysPerMonth * miningMultipliers.volatiles
          : 0,
        metals_month: site ? site.metals_day * bestMineModifier * miningDaysPerMonth * miningMultipliers.metals : 0,
        nobles_month: site ? site.nobles_day * bestMineModifier * miningDaysPerMonth * miningMultipliers.nobles : 0,
        fissiles_month: site
          ? site.fissiles_day * bestMineModifier * miningDaysPerMonth * miningMultipliers.fissiles
          : 0,
        miningModifier: bestMineModifier,
      };

      return {
        id: hab.ID.value,
        faction: hab.faction.value,
        displayName: hab.displayName,
        habSiteId: hab.habSite?.value,
        orbitStateId: hab.orbitState?.value,
        habType: hab.habType,
        tier: hab.tier,
        sectorIds: sectors.map((i) => i.id),
        sectors: sectors,
        emptyModuleCount: empty.length,
        underConstructionModuleCount: underConstruction.length,
        highlightedCompletions,
        missingMine,
        finderSortOverride: hab.finderSortOverride,
        activeEffects,
        potentialEffects,
        moduleTemplates,
        site,
        mine: mine[0],
        maxCompletionDate,
        maxDaysToCompletion,
        solarMultiplier,
        solarMirrorBonus,
        activePower,
        futurePower,
        hasSolar,
        canUpgradePower,
        canUpgradeCombat,
        canUpgradeFarm,
        canUpgradeFactory,
        canUpgradeMining,
        miningUpgradeInfo,
        upgradeableModuleNames,
        currentMineEffects,
        currentMinePoweredEffects,
        bestMineEffects,
        highestActiveFactoryTier,
        highestActiveFactoryCount,
        highestConstructedFactoryTier,
        highestConstructedFactoryCount,
        hasUnnecessaryFactory,
        mineTier,
        isAutomated,
        operationsCenterTier,
        needsOperationsCenterUpgrade,
        adminTowerTier,
        needsAdminTowerUpgrade,
        planetName,
      };
    })
    .toSorted((a, b) =>
      a.finderSortOverride === b.finderSortOverride ? 0 : a.finderSortOverride < b.finderSortOverride ? -1 : 1,
    );

  return habs;
}

export function createBuildingSummary(
  playerHabs: ReturnType<typeof processHabs>,
  saveFile: SaveFile,
) {
  const originalHabsById = new Map(
    saveFile.gamestates["PavonisInteractive.TerraInvicta.TIHabState"].map(({ Value: hab }) => [hab.ID.value, hab]),
  );

  const buildingSummary = new Map<
    string,
    {
      templateName: string;
      friendlyName: string;
      currentCount: number;
      futureCount: number;
      currentEffects: ShowEffectsProps;
      futureEffects: ShowEffectsProps;
    }
  >();

  for (const hab of playerHabs) {
    const originalHab = originalHabsById.get(hab.id);
    if (!originalHab) continue;

    for (const { active, template } of hab.moduleTemplates) {
      const templateName = template.dataName;
      if (!templateName) continue;

      const existing = buildingSummary.get(templateName) || {
        templateName,
        friendlyName: template.friendlyName || templateName,
        currentCount: 0,
        futureCount: 0,
        currentEffects: {},
        futureEffects: {},
      };

      existing.futureCount++;

      if (active) {
        existing.currentCount++;
      }

      const {
        techBonuses,
        incomeInfluence_month,
        incomeMoney_month,
        incomeOps_month,
        incomeProjects,
        incomeResearch_month,
        supportMaterials_month,
        missionControl,
      } = template;

      const moduleEffects: ShowEffectsProps = {
        techBonuses,
        incomeBoost_month: -(supportMaterials_month?.boost || 0),
        incomeMissionControl: missionControl,
        incomeInfluence_month,
        incomeMoney_month: (incomeMoney_month || 0) - (supportMaterials_month?.money || 0),
        incomeOps_month,
        projectCapacityGranted: incomeProjects,
        incomeResearch_month,
        volatiles: -(supportMaterials_month?.volatiles || 0),
        metals: -(supportMaterials_month?.metals || 0),
        nobles: -(supportMaterials_month?.nobleMetals || 0),
      };

      if (originalHab.inEarthLEO) {
        if (template.controlPointCapacity) {
          moduleEffects.controlPoints = template.controlPointCapacity;
        }
        if (template.incomeProjects) {
          moduleEffects.projectCapacityGranted = template.incomeProjects;
        }
        if (template.specialRules?.includes("LEOBonusEconomy"))
          moduleEffects.economyBonus = (moduleEffects.economyBonus || 0) + template.specialRulesValue!;
        if (template.specialRules?.includes("LEOBonusEnvironment"))
          moduleEffects.environmentBonus = (moduleEffects.environmentBonus || 0) + template.specialRulesValue!;
        if (template.specialRules?.includes("LEOBonusGovernment"))
          moduleEffects.governmentBonus = (moduleEffects.governmentBonus || 0) + template.specialRulesValue!;
        if (template.specialRules?.includes("LEOBonusKnowledge"))
          moduleEffects.knowledgeBonus = (moduleEffects.knowledgeBonus || 0) + template.specialRulesValue!;
        if (template.specialRules?.includes("LEOBonusLaunchFacilities"))
          moduleEffects.spaceflightBonus = (moduleEffects.spaceflightBonus || 0) + template.specialRulesValue!;
        if (template.specialRules?.includes("LEOBonusMissionControl"))
          moduleEffects.MCBonus = (moduleEffects.MCBonus || 0) + template.specialRulesValue!;
        if (template.specialRules?.includes("LEOBonusOppression"))
          moduleEffects.oppressionBonus = (moduleEffects.oppressionBonus || 0) + template.specialRulesValue!;
        if (template.specialRules?.includes("LEOBonusWelfare"))
          moduleEffects.welfareBonus = (moduleEffects.welfareBonus || 0) + template.specialRulesValue!;
        if (template.specialRules?.includes("LEOBonusArmyCombatValue"))
          moduleEffects.miltechBonus = (moduleEffects.miltechBonus || 0) + template.specialRulesValue!;
      }

      existing.futureEffects = combineEffects(existing.futureEffects, moduleEffects);

      if (active) {
        existing.currentEffects = combineEffects(existing.currentEffects, moduleEffects);
      }

      buildingSummary.set(templateName, existing);
    }
  }

  return Array.from(buildingSummary.values()).sort((a, b) =>
    a.friendlyName.localeCompare(b.friendlyName),
  );
}

export type HabEntry = ReturnType<typeof processHabs>[0];
