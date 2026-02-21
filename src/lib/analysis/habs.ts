import { combineEffects, ShowEffectsProps } from "@/components/showEffects";
import { SaveFile } from "../savefile";
import { templates } from "../templates";
import { noDate } from "../utils";
import { analyzeHabSites } from "./habSites";
import { analyzePlanets } from "./planets";
import { analyzeFactions } from "./factions";

export interface AnalyzeHabArgs {
  habSitesById: ReturnType<typeof analyzeHabSites>["habSitesById"];
  bodiesById: ReturnType<typeof analyzePlanets>["bodiesById"];
  orbitsById: ReturnType<typeof analyzePlanets>["orbitsById"];
  habModuleTemplates: Map<string, Awaited<ReturnType<typeof templates.habModules>>[0]>;
  gameCurrentDateTimeFormatted: string;
  factionsById: Awaited<ReturnType<typeof analyzeFactions>>["factionsById"];
}

export function analyzeHabs(
  saveFile: SaveFile,
  {
    habSitesById,
    bodiesById,
    orbitsById,
    habModuleTemplates,
    gameCurrentDateTimeFormatted,
    factionsById,
  }: AnalyzeHabArgs,
) {
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

  function isImportant(module: (typeof habModules)[0]) {
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

  // Phase 1: Create upgrade map (old module -> new module)
  const moduleUpgradeMap = new Map<string, string>();
  for (const module of habModuleTemplates.values()) {
    if (module.upgradesFromName) {
      moduleUpgradeMap.set(module.upgradesFromName, module.dataName);
    }
  }

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

      const solarMirrorBonus = effectiveBody
        ? effectiveBody.solarMirrorBonusByFactionId.get(hab.faction.value) || 0
        : 0;
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
          if (t.specialRules?.includes("LEOBonusAlienDetection"))
            effects.alienDetection = (effects.alienDetection || 0) + t.tier!;
          if (t.specialRules?.includes("LEOBonusHumanDetection"))
            effects.humanDetection = (effects.humanDetection || 0) + t.tier!;
          if (t.specialRules?.includes("LEOBonusPropagandaStrength"))
            effects.publicCampaignStrength = (effects.publicCampaignStrength || 0) + t.tier!;
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
      // *very* ballparking this - mostly to allow comparing stations to each other, not to _actually_ estimate the game's combat score (or any kind of real combat effectiveness)
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
          return { active, power: basePower * mineMultipler, isSolar: false }; // overestimate for now
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
        // Get all active power-producing modules that can be upgraded
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

        // Check if any module can be safely upgraded
        for (const { template, actualPower } of activePowerModules) {
          const upgradeName = moduleUpgradeMap.get(template.dataName);
          if (upgradeName && habFaction.unlockedHabModules.has(upgradeName)) {
            // Check if base still has enough power with this module offline
            const powerAfterUpgrade = activePower - actualPower;
            if (powerAfterUpgrade >= 0) {
              canUpgradePower = true;
              break;
            }
          }
        }
      }

      // Calculate if any combat modules can be upgraded
      let canUpgradeCombat = false;

      if (habFaction) {
        // Check if any space combat modules are under construction or unpowered
        const combatModulesNotReady = moduleTemplates.some(
          ({ active, template }) => template.spaceCombatModule && !active,
        );

        // Only check for upgrades if all combat modules are active
        if (!combatModulesNotReady) {
          // Get all active combat modules that can be upgraded
          const activeCombatModules = moduleTemplates.filter(
            ({ active, template }) =>
              active && template.spaceCombatModule && template.dataName && moduleUpgradeMap.has(template.dataName),
          );

          // Check if any combat module has an unlocked upgrade
          for (const { template } of activeCombatModules) {
            const upgradeName = moduleUpgradeMap.get(template.dataName);
            if (upgradeName && habFaction.unlockedHabModules.has(upgradeName)) {
              canUpgradeCombat = true;
              break;
            }
          }
        }
      }

      // Calculate if any farms can be upgraded due to crew needs
      let canUpgradeFarm = false;

      if (habFaction) {
        // Calculate total crew needed by all modules (including unpowered and under construction)
        const totalCrewNeeded = moduleTemplates.reduce((sum, { template }) => sum + (template.crew || 0), 0);

        // Calculate total crew supported by existing farms (including unpowered and under construction)
        const totalCrewSupported = moduleTemplates
          .filter(({ template }) => template.specialRules?.includes("Farm"))
          .reduce((sum, { template }) => sum + (template.specialRulesValue || 0), 0);

        // Only check for farm upgrades if crew needed exceeds crew supported
        if (totalCrewNeeded > totalCrewSupported) {
          // Get all farms that can be upgraded
          const upgradableFarms = moduleTemplates.filter(
            ({ template }) =>
              template.specialRules?.includes("Farm") && template.dataName && moduleUpgradeMap.has(template.dataName),
          );

          // Check if any farm has an unlocked upgrade
          for (const { template } of upgradableFarms) {
            const upgradeName = moduleUpgradeMap.get(template.dataName);
            if (upgradeName && habFaction.unlockedHabModules.has(upgradeName)) {
              canUpgradeFarm = true;
              break;
            }
          }
        }
      }

      // Calculate if any factories can be upgraded
      let canUpgradeFactory = false;

      if (habFaction) {
        // Get all constructed factory modules at this hab (not just active ones)
        const factoryModules = nonEmpty
          .map((m) => ({
            module: m,
            template: habModuleTemplates.get(m.templateName!),
          }))
          .filter(({ template }) => template?.specialRules?.includes("CanFoundTier1Habs"));

        // Count how many modules are currently under construction
        const modulesUnderConstruction = underConstruction.length;

        // Determine if it's safe to upgrade a factory
        // Option A: At least one OTHER constructed factory that is not currently being constructed/upgraded
        const safeToUpgradeWithOtherFactory = factoryModules.length >= 2;

        // Option B: No other modules currently being constructed/upgraded
        const safeToUpgradeNoConstruction = modulesUnderConstruction === 0;

        const safeToUpgrade = safeToUpgradeWithOtherFactory || safeToUpgradeNoConstruction;

        if (safeToUpgrade) {
          // Get all factories that can be upgraded
          const upgradableFactories = factoryModules.filter(
            ({ template }) => template?.dataName && moduleUpgradeMap.has(template.dataName),
          );

          // Check if any factory has an unlocked upgrade with appropriate tier
          for (const { template } of upgradableFactories) {
            if (!template) continue;
            const upgradeName = moduleUpgradeMap.get(template.dataName);
            if (upgradeName && habFaction.unlockedHabModules.has(upgradeName)) {
              const upgradeTemplate = habModuleTemplates.get(upgradeName);
              // Check if the upgrade tier is not higher than the hab tier
              if (upgradeTemplate && upgradeTemplate.tier <= hab.tier) {
                canUpgradeFactory = true;
                break;
              }
            }
          }
        }
      }

      // Calculate if any mining modules can be upgraded
      let canUpgradeMining = false;
      let miningUpgradeInfo: { upgradeName: string; factoryName: string; factoryTier: number } | null = null;

      if (habFaction) {
        // Find the highest tier factory that the faction has unlocked
        const maxFactoryTier = Math.max(
          0,
          ...[...habModuleTemplates.values()]
            .filter(
              (t) => t.specialRules?.includes("CanFoundTier1Habs") && habFaction.unlockedHabModules.has(t.dataName),
            )
            .map((t) => t.tier),
        );

        // Find the best constructed factory at this hab (not just active)
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

        // Get all mining modules that can be upgraded
        const miningModules = moduleTemplates.filter(
          ({ template }) =>
            template.miningModifier &&
            template.miningModifier > 0 &&
            template.dataName &&
            moduleUpgradeMap.has(template.dataName),
        );

        // Check if any mining module can be upgraded
        for (const { template } of miningModules) {
          const upgradeName = moduleUpgradeMap.get(template.dataName);
          if (upgradeName && habFaction.unlockedHabModules.has(upgradeName)) {
            const upgradeTemplate = habModuleTemplates.get(upgradeName);
            if (upgradeTemplate && upgradeTemplate.tier <= hab.tier) {
              // For tier 3 upgrades, require max tier factory to be constructed
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
                // For other tiers, always allow
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

      // Collect all other upgradeable modules (generic case)
      const upgradeableModuleNames: string[] = [];

      if (habFaction) {
        // Get all modules that can be upgraded
        const allUpgradableModules = moduleTemplates.filter(
          ({ template }) => template.dataName && moduleUpgradeMap.has(template.dataName),
        );

        // Check each module for valid upgrades
        for (const { template } of allUpgradableModules) {
          const upgradeName = moduleUpgradeMap.get(template.dataName);
          if (upgradeName && habFaction.unlockedHabModules.has(upgradeName)) {
            const upgradeTemplate = habModuleTemplates.get(upgradeName);
            // Check if the upgrade tier is not higher than the hab tier
            if (upgradeTemplate && upgradeTemplate.tier <= hab.tier) {
              // Only add if we haven't already flagged this via specific upgrade types
              const isPower = template.power && template.power > 0;
              const isCombat = template.spaceCombatModule;
              const isFarm = template.specialRules?.includes("Farm");
              const isFactory = template.specialRules?.includes("CanFoundTier1Habs");
              const isMining = template.miningModifier && template.miningModifier > 0;

              if (!isPower && !isCombat && !isFarm && !isFactory && !isMining) {
                // Add the upgrade target name if not already in the list
                if (!upgradeableModuleNames.includes(upgradeTemplate.friendlyName)) {
                  upgradeableModuleNames.push(upgradeTemplate.friendlyName);
                }
              }
            }
          }
        }
      }

      // Calculate active factory information
      const activeFactories = moduleTemplates.filter(
        ({ active, template }) => active && template.specialRules?.includes("CanFoundTier1Habs"),
      );

      const highestActiveFactoryTier =
        activeFactories.length > 0 ? Math.max(...activeFactories.map(({ template }) => template.tier)) : 0;

      const highestActiveFactoryCount = activeFactories.filter(
        ({ template }) => template.tier === highestActiveFactoryTier,
      ).length;

      // Check for unnecessary factories (active factory with no construction)
      const hasUnnecessaryFactory = activeFactories.length > 0 && underConstruction.length === 0;

      // Calculate constructed factory information (for upgrades and other checks)
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

      // Check if hab is automated
      const isAutomated = moduleTemplates.some(({ template }) => template.automated === true);

      // Track Operations Center (missionControl > 0) for non-automated habs
      let operationsCenterTier = 0;
      let needsOperationsCenterUpgrade = false;

      if (!isAutomated && habFaction) {
        const currentOperationsCenter = moduleTemplates.find(({ template }) => (template.missionControl ?? 0) > 0);
        operationsCenterTier = currentOperationsCenter?.template?.tier || 0;

        // Find highest unlocked Operations Center that is <= hab tier
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

      // Track AdminTower (controlPointCapacity > 0) for LEO habs
      let adminTowerTier = 0;
      let needsAdminTowerUpgrade = false;

      if (hab.inEarthLEO && habFaction) {
        const currentAdminTower = moduleTemplates.find(({ template }) => (template.controlPointCapacity ?? 0) > 0);
        adminTowerTier = currentAdminTower?.template?.tier || 0;

        // Find highest unlocked AdminTower
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

      // Calculate mine effects
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

      // Track mine tier (including inactive/under construction)
      const mineTier = currentMine?.template?.tier || 0;
      const isMineActive =
        currentMine?.powered &&
        (currentMine.completionDate === noDate || currentMine.completionDate <= gameCurrentDateTimeFormatted);
      const isMineComplete =
        currentMine &&
        (currentMine.completionDate === noDate || currentMine.completionDate <= gameCurrentDateTimeFormatted);

      // Get faction mining bonuses
      const miningMultipliers = habFaction?.miningMultipliers || {
        water: 1,
        volatiles: 1,
        metals: 1,
        nobles: 1,
        fissiles: 1,
      };

      const miningDaysPerMonth = 365.25 / 12; // attempt to match in-game monthly calculation

      // 1. Current mine effects (0 if unpowered or under construction)
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

      // 2. Current mine effects if powered (0 if under construction)
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

      // 3. Best unlocked mine effects
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
  return { habs };
}

function getSolarMultiplier(id: number | undefined): number | undefined {
  if (!id) return undefined;

  // TODO: find something in data files or something to drive this - or maybe it's dynamic based on semi-major axis + latitude???
  // anyway for now, just hard-code
  switch (id) {
    case 4834:
    case 4835:
    case 4838:
    case 4840:
      return 3.34;
    case 4841:
      return 4.98;
    case 4847:
      return 0.762;
    case 4846:
      return 0.773;
    case 4855:
      return 0.781;
    case 4885:
    case 4886:
    case 4889:
    case 4891:
    case 4896:
    case 4875:
    case 4884:
    case 4877:
    case 4894:
    case 4887:
    case 4897:
    case 4880:
    case 4895:
    case 4882:
    case 4879:
    case 4874:
    case 4876:
    case 4837:
    case 4836:
    case 4839:
      return 0.162; // all the mars surface ones
    case 4830:
      return 6.04; // Low Mercury
    case 4855:
      return 0.781; // Low Luna
  }

  return undefined;
}

function getMineMultipler(id: number | undefined): number {
  if (!id) return 2;

  // TODO: find something in data files or something to drive this - or maybe it's dynamic based on distance + gravity???
  // some from https://wiki.hoodedhorse.com/Terra_Invicta/Habs
  switch (id) {
    // some random asteroids/comets
    case 166:
    case 186:
    case 117:
    case 167:
    case 108:
    case 247:
    case 238:
    case 373:
    case 200:
    case 236:
    case 220:
      return 0.5077;
    case 6: // Luna
      return 0.5077;
    case 7: // Mars
      return 0.9342;
    case 102: // Ceres
      return 0.7699;
    case 3: // Mercury
      return 1.9641;
    // case 1: // Callisto
    //   return 0.9123;
    // case 1: // Io
    //   return 1.4960;
    // case 1: // Titan
    //   return 0.8865;
    // case 1: // Pluto
    //   return 1.5029 ;
  }

  return 2;
}
