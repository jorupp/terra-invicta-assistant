import { SaveFile } from "../savefile";
import { getSolarMultiplier, getMineMultiplier } from "./hab-utils";
import { formatDateTime, noDate } from "../utils";
import type { ShowEffectsProps } from "../effects";

function combineEffects(a: ShowEffectsProps, b: ShowEffectsProps): ShowEffectsProps {
  return {
    incomeMoney_month: (a.incomeMoney_month || 0) + (b.incomeMoney_month || 0),
    incomeBoost_month: (a.incomeBoost_month || 0) + (b.incomeBoost_month || 0),
    incomeInfluence_month: (a.incomeInfluence_month || 0) + (b.incomeInfluence_month || 0),
    incomeResearch_month: (a.incomeResearch_month || 0) + (b.incomeResearch_month || 0),
    councilorTechBonus: [...(a.councilorTechBonus || []), ...(b.councilorTechBonus || [])],
    missionsGrantedNames: [...(a.missionsGrantedNames || []), ...(b.missionsGrantedNames || [])],
    xpModifier: (a.xpModifier || 1) * (b.xpModifier || 1),
    persuasion: (a.persuasion || 0) + (b.persuasion || 0),
    investigation: (a.investigation || 0) + (b.investigation || 0),
    espionage: (a.espionage || 0) + (b.espionage || 0),
    command: (a.command || 0) + (b.command || 0),
    administration: (a.administration || 0) + (b.administration || 0),
    science: (a.science || 0) + (b.science || 0),
    security: (a.security || 0) + (b.security || 0),
    miningBonus: (a.miningBonus || 0) + (b.miningBonus || 0),
    energytechBonus: (a.energytechBonus || 0) + (b.energytechBonus || 0),
    miltechBonus: (a.miltechBonus || 0) + (b.miltechBonus || 0),
    combatScore: (a.combatScore || 0) + (b.combatScore || 0),
  };
}

function isImportant(module: { templateName: string | null; destroyed: boolean; startBuildDate: any }) {
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

export function analyzeHabs(
  saveFile: SaveFile,
  habSitesById: Map<number, any>,
  bodiesById: Map<number, any>,
  orbitsById: Map<number, any>,
  habModulesBySectorId: Map<number, any[]>,
  habModuleTemplates: Map<string, any>,
  factions: any[],
  factionsById: Map<number, any>,
  playerFactionId: number,
  projects: Map<string, any>,
  habSectorsByHabId: Map<number, any[]>,
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
      const mineMultipler = getMineMultiplier(site?.parentBodyId);

      // there's probably some data to indicate which sectors are populated for a given tier + habType (shrug)
      const validSectors = new Set(
        hab.tier === 0
          ? []
          : hab.tier === 1
            ? [0]
            : hab.tier === 2
              ? [0, 1, 2]
              : hab.tier === 3
                ? [0, 1, 2, 3, 4, 5]
                : hab.tier === 4
                  ? [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
                  : hab.tier === 5
                    ? [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
                    : [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
      );

      const sectorModules = hab.sectors
        .map((sector: { value: number }) => {
          const modules = habModulesBySectorId.get(sector.value) || [];
          return { sectorId: sector.value, modules };
        })
        .filter((sector: { sectorId: number }) => validSectors.has(sector.sectorId));

      const hasBoostAvailable = sectorModules.some((sector: { modules: any[] }) =>
        sector.modules.some((module) => module.templateName === "LaunchFacilities"),
      );

      // 1. Power tracking
      const habPowerConsumption = sectorModules
        .flatMap((sector: { modules: any[] }) => sector.modules)
        .reduce((sum, module) => {
          if (module.templateName === "AdminComplexT4") {
            const moduleTemplate = habModuleTemplates.get(module.templateName);
            const moduleConsumption = moduleTemplate?.powerConsumed_kW || 0;
            return sum + moduleConsumption;
          }
          return sum;
        }, 0);

      const habPowerGeneration = sectorModules
        .flatMap((sector: { modules: any[] }) => sector.modules)
        .reduce((sum, module) => {
          const moduleTemplate = habModuleTemplates.get(module.templateName);
          const powerProduced = moduleTemplate?.powerProduced_kW || 0;
          return sum + powerProduced;
        }, 0);

      const maxGeneration = sectorModules
        .flatMap((sector: { modules: any[] }) => sector.modules)
        .reduce(
          (acc, module) => {
            const moduleTemplate = habModuleTemplates.get(module.templateName);
            const solarProduction = moduleTemplate?.solarPowerProduced_kW || 0;
            const nuclearProduction = moduleTemplate?.powerProduced_kW || 0;
            return {
              solar: acc.solar + solarProduction,
              nuclear: acc.nuclear + nuclearProduction,
            };
          },
          { solar: 0, nuclear: 0 },
        );

      // Total solar generation with multiplier and mirror bonus
      const totalSolarGeneration = maxGeneration.solar * (solarMultiplier + solarMirrorBonus);

      const solarGeneration = Math.max(0, totalSolarGeneration - habPowerConsumption);
      const nuclearGeneration = Math.max(0, maxGeneration.nuclear);

      // Estimate maximum solar capacity (what would be generated if all consumption was met)
      const estimatedMaxSolarCapacity = maxGeneration.solar * (solarMultiplier + solarMirrorBonus);

      // 2. Factory, growth, and mining tracking
      const habFactories = sectorModules
        .flatMap((sector: { modules: any[] }) => sector.modules)
        .filter((module) => {
          const template = habModuleTemplates.get(module.templateName);
          return template?.habFactoryProduced || template?.shipFactoryProduced;
        })
        .map((module) => {
          const template = habModuleTemplates.get(module.templateName);
          const habFactory = template?.habFactoryProduced || 0;
          const shipFactory = template?.shipFactoryProduced || 0;
          return {
            templateName: module.templateName,
            habFactory,
            shipFactory,
            powered: module.powered,
          };
        });

      const habGrowth = sectorModules
        .flatMap((sector: { modules: any[] }) => sector.modules)
        .filter((module) => {
          const template = habModuleTemplates.get(module.templateName);
          return template?.populationGrowth;
        })
        .map((module) => {
          const template = habModuleTemplates.get(module.templateName);
          return {
            templateName: module.templateName,
            populationGrowth: template?.populationGrowth || 0,
            powered: module.powered,
          };
        });

      const habMining = sectorModules
        .flatMap((sector: { modules: any[] }) => sector.modules)
        .filter((module) => {
          const template = habModuleTemplates.get(module.templateName);
          return template?.miningModifier && template.miningModifier > 0;
        })
        .map((module) => {
          const template = habModuleTemplates.get(module.templateName);
          return {
            templateName: module.templateName,
            miningModifier: template?.miningModifier || 0,
            powered: module.powered,
          };
        });

      const activeFactories = habFactories.filter((f) => f.powered);
      const activeGrowth = habGrowth.filter((g) => g.powered);
      const activeMining = habMining.filter((m) => m.powered);

      // 3. Upgrades detection
      const readyForSectorUpgrade = hab.tier < 6;
      const modulesWithReadyUpgrades = sectorModules
        .flatMap((sector: { modules: any[] }) => sector.modules)
        .filter((module) => {
          const upgradeTier = parseInt(module.templateName.slice(-2).replace("T", ""));
          const newName = module.templateName.slice(0, -2) + "T" + (upgradeTier + 1);
          const newRequiredProject = habModuleTemplates.get(newName)?.requiredProjectName;
          const upgradeable =
            upgradeTier < 4 && (!newRequiredProject || hab.finishedProjectNames?.includes(newRequiredProject));
          return upgradeable;
        })
        .map((module) => module.templateName);

      // 4. Track the 'next' power/mining/factory module that can be built
      const habFaction = factionsById.get(hab.faction.value);

      // Best unlocked factory effects
      const nextHabModuleName = habFaction
        ? [...habModuleTemplates.values()]
            .filter(
              (module) =>
                (module.habFactoryProduced || module.shipFactoryProduced) &&
                module.habType === hab.habType &&
                module.tier <= hab.tier &&
                habFaction.unlockedHabModules.has(module.dataName),
            )
            .sort((a, b) => {
              const aFactory = a.habFactoryProduced || a.shipFactoryProduced || 0;
              const bFactory = b.habFactoryProduced || b.shipFactoryProduced || 0;
              return bFactory - aFactory;
            })[0]?.dataName
        : null;

      const nextHabModule = nextHabModuleName ? habModuleTemplates.get(nextHabModuleName) : null;

      const canAffordUpgrade =
        nextHabModuleName &&
        nextHabModule &&
        hab.resources &&
        hab.resources.buildingMaterials >= nextHabModule.buildCost.buildingMaterials &&
        hab.resources.money >= nextHabModule.buildCost.money;

      // Check if the next hab module is unlocked
      const thisModuleUnlocked = nextHabModuleName && habFaction?.unlockedHabModules.has(nextHabModuleName);

      // 4a. Best unlocked solar power effects
      const nextModuleName = habFaction
        ? [...habModuleTemplates.values()]
            .filter(
              (module) =>
                module.solarPowerProduced_kW &&
                module.solarPowerProduced_kW > 0 &&
                module.habType === hab.habType &&
                module.tier <= hab.tier &&
                habFaction.unlockedHabModules.has(module.dataName),
            )
            .sort((a, b) => {
              const aSolar = a.solarPowerProduced_kW || 0;
              const bSolar = b.solarPowerProduced_kW || 0;
              return bSolar - aSolar;
            })[0]?.dataName
        : null;

      const nextModule = nextModuleName ? habModuleTemplates.get(nextModuleName) : null;

      // 4b. Best unlocked growth effects
      const newMilestone = habFaction
        ? [...habModuleTemplates.values()]
            .filter(
              (module) =>
                module.populationGrowth &&
                module.populationGrowth > 0 &&
                module.habType === hab.habType &&
                module.tier <= hab.tier &&
                habFaction.unlockedHabModules.has(module.dataName),
            )
            .sort((a, b) => {
              const aGrowth = a.populationGrowth || 0;
              const bGrowth = b.populationGrowth || 0;
              return bGrowth - aGrowth;
            })[0]
        : null;

      // Calculate population capacity
      const populationCapacity = sectorModules.reduce(
        (acc, sector: { modules: any[] }) => {
          return (
            acc +
            sector.modules.reduce((sectorSum, module) => {
              const template = habModuleTemplates.get(module.templateName);
              const capacity = template?.population || 0;
              const growth = template?.populationGrowth || 0;
              return sectorSum + capacity + growth;
            }, 0)
          );
        },
        hab.population * 0.5,
      );

      const currentPopulation = hab.population;

      // Build a map of module template names to counts
      const currentModules = sectorModules
        .flatMap((sector: { modules: any[] }) => sector.modules)
        .reduce(
          (acc, module) => {
            acc[module.templateName] = (acc[module.templateName] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>,
        );

      // Calculate required power and water for the best unlocked growth module
      const requiredPower = newMilestone ? newMilestone.powerConsumed_kW || 0 : 0;
      const requiredWater = newMilestone ? newMilestone.waterConsumed_day || 0 : 0;

      // Determine if we need to upgrade the AdminComplex module
      const currentAdminModule = sectorModules
        .flatMap((sector: { modules: any[] }) => sector.modules)
        .find((module) => module.templateName.startsWith("AdminComplex"));
      const upgradeTier = currentAdminModule
        ? parseInt(currentAdminModule.templateName.slice(-2).replace("T", ""))
        : 0;
      const newName = currentAdminModule
        ? currentAdminModule.templateName.slice(0, -2) + "T" + (upgradeTier + 1)
        : null;
      const newRequiredProject = newName ? habModuleTemplates.get(newName)?.requiredProjectName : null;
      const modulesWithReadyUpgrades2 = newRequiredProject ? projects.get(newRequiredProject) : null;

      // Water tracking
      const waterProductionDay = sectorModules
        .flatMap((sector: { modules: any[] }) => sector.modules)
        .reduce((sum, module) => {
          const moduleTemplate = habModuleTemplates.get(module.templateName);
          const waterProduced = moduleTemplate?.waterProduced_day || 0;
          return sum + waterProduced;
        }, 0);

      const waterConsumptionDay = sectorModules
        .flatMap((sector: { modules: any[] }) => sector.modules)
        .reduce((sum, module) => {
          const moduleTemplate = habModuleTemplates.get(module.templateName);
          const waterConsumed = moduleTemplate?.waterConsumed_day || 0;
          return sum + waterConsumed;
        }, 0);

      const waterBalance = waterProductionDay - waterConsumptionDay;

      const miningDaysPerMonth = 30.4167;
      const miningMultipliers = habFaction
        ? habFaction.miningMultipliers
        : { water: 1, volatiles: 1, metals: 1, nobles: 1, fissiles: 1 };

      // Calculate best mine modifier currently in use
      const currentMineModifier = Math.max(
        ...sectorModules
          .flatMap((sector: { modules: any[] }) => sector.modules)
          .map((module) => {
            const template = habModuleTemplates.get(module.templateName);
            return module.powered ? template?.miningModifier || 0 : 0;
          }),
        0,
      );

      const habMineProduction = site
        ? {
            water:
              site.water_day && currentMineModifier
                ? site.water_day * currentMineModifier * miningDaysPerMonth * miningMultipliers.water
                : 0,
            volatiles:
              site.volatiles_day && currentMineModifier
                ? site.volatiles_day * currentMineModifier * miningDaysPerMonth * miningMultipliers.volatiles
                : 0,
            metals:
              site.metals_day && currentMineModifier
                ? site.metals_day * currentMineModifier * miningDaysPerMonth * miningMultipliers.metals
                : 0,
            nobles:
              site.nobles_day && currentMineModifier
                ? site.nobles_day * currentMineModifier * miningDaysPerMonth * miningMultipliers.nobles
                : 0,
            fissiles:
              site.fissiles_day && currentMineModifier
                ? site.fissiles_day * currentMineModifier * miningDaysPerMonth * miningMultipliers.fissiles
                : 0,
            miningModifier: currentMineModifier,
          }
        : {
            water: 0,
            volatiles: 0,
            metals: 0,
            nobles: 0,
            fissiles: 0,
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
            .sort((a, b) => {
              const aMine = a.miningModifier || 0;
              const bMine = b.miningModifier || 0;
              return bMine - aMine;
            })[0]
        : null;

      const potentialHabMineProduction = site
        ? {
            water:
              site.water_day && bestUnlockedMine?.miningModifier
                ? site.water_day * bestUnlockedMine.miningModifier * miningDaysPerMonth * miningMultipliers.water
                : 0,
            volatiles:
              site.volatiles_day && bestUnlockedMine?.miningModifier
                ? site.volatiles_day * bestUnlockedMine.miningModifier * miningDaysPerMonth * miningMultipliers.volatiles
                : 0,
            metals:
              site.metals_day && bestUnlockedMine?.miningModifier
                ? site.metals_day * bestUnlockedMine.miningModifier * miningDaysPerMonth * miningMultipliers.metals
                : 0,
            nobles:
              site.nobles_day && bestUnlockedMine?.miningModifier
                ? site.nobles_day * bestUnlockedMine.miningModifier * miningDaysPerMonth * miningMultipliers.nobles
                : 0,
            fissiles:
              site.fissiles_day && bestUnlockedMine?.miningModifier
                ? site.fissiles_day * bestUnlockedMine.miningModifier * miningDaysPerMonth * miningMultipliers.fissiles
                : 0,
            miningModifier: bestUnlockedMine?.miningModifier || 0,
          }
        : {
            water: 0,
            volatiles: 0,
            metals: 0,
            nobles: 0,
            fissiles: 0,
            miningModifier: 0,
          };

      // 4. Site details
      const siteDetails = site
        ? {
            water: site.water_day || 0,
            volatiles: site.volatiles_day || 0,
            metals: site.metals_day || 0,
            nobles: site.nobles_day || 0,
            fissiles: site.fissiles_day || 0,
          }
        : null;

      // Determine if the hab needs AdminTower upgrade due to over-capacity or no admin at all
      const needsAdminTowerUpgrade =
        currentPopulation > populationCapacity * 1.2 ||
        (!currentAdminModule && currentPopulation > populationCapacity * 0.5);

      // Priority sorting (higher numbers = higher priority)
      const finderSortOverride =
        hab.faction.value === playerFactionId
          ? needsAdminTowerUpgrade
            ? "01"
            : currentPopulation > populationCapacity * 0.9
              ? "02"
              : waterBalance < 0
                ? "03"
                : nuclearGeneration === 0 && solarGeneration === 0
                  ? "04"
                  : activeMining.length === 0 && site && (site.water_day || site.volatiles_day || site.metals_day)
                    ? "05"
                    : modulesWithReadyUpgrades.length > 0
                      ? "06"
                      : canAffordUpgrade
                        ? "07"
                        : "99"
          : "99";

      // Get full sector details for this hab
      const sectors = habSectorsByHabId.get(hab.ID.value) || [];
      const modules = sectors
        .flatMap((s) => s.habModules)
        .map((m: any) => ({ ...m, template: habModuleTemplates.get(m.templateName!) }));
      
      const empty = modules.filter((m: any) => m.destroyed || m.startBuildDate === noDate);
      const emptyModuleCount = empty.length;
      
      const underConstruction = modules.filter((m: any) => m.completionDate >= gameCurrentDateTimeFormatted && !m.destroyed);
      const maxCompletionDate = underConstruction.reduce((acc: string | null, curr: any) => {
        if (!acc) return formatDateTime(curr.completionDate);
        return curr.completionDate > acc ? formatDateTime(curr.completionDate) : acc;
      }, null);
      
      const maxDaysToCompletion = maxCompletionDate
        ? (new Date(maxCompletionDate).getTime() - new Date(gameCurrentDateTimeFormatted).getTime()) / (1000 * 60 * 60 * 24)
        : null;
      
      const highlightedCompletions = underConstruction
        .toSorted((a: any, b: any) => {
          if (isImportant(a) && !isImportant(b)) return -1;
          if (!isImportant(a) && isImportant(b)) return 1;
          return a.completionDate.localeCompare(b.completionDate);
        })
        .map((m: any) => ({
          completionDate: formatDateTime(m.completionDate),
          displayName: m.displayName,
          templateName: m.templateName,
          daysToCompletion: (new Date(m.completionDate).getTime() - new Date(gameCurrentDateTimeFormatted).getTime()) / (1000 * 60 * 60 * 24),
        }))
        .filter((i: any, ix: number) => ix === 0 || isImportant(i));
      
      const nonEmpty = modules.filter((m: any) => !m.destroyed && m.startBuildDate !== noDate);
      const mine = nonEmpty.filter((m: any) => m.template?.miningModifier);
      const isBase = hab.habType === "Base";
      const missingMine = isBase && mine.length === 0;
      
      // Calculate module bonuses (activeEffects and potentialEffects)
      const moduleTemplates = modules
        .filter((i: any) => !i.destroyed)
        .map((i: any) => {
          const template = habModuleTemplates.get(i.templateName!)!;
          return {
            active: i.completionDate < gameCurrentDateTimeFormatted && i.startBuildDate !== noDate,
            template,
          };
        });
      
      const moduleBonuses = moduleTemplates.map(({ active, template: t }) => {
        const effects: ShowEffectsProps = {};
        if (t.incomeBoost_month) effects.incomeBoost_month = t.incomeBoost_month;
        if (t.incomeInfluence_month) effects.incomeInfluence_month = t.incomeInfluence_month;
        if (t.incomeResearch_month) effects.incomeResearch_month = t.incomeResearch_month;
        if (t.incomeMoney_month) effects.incomeMoney_month = t.incomeMoney_month;
        if (t.techBonuses) effects.councilorTechBonus = t.techBonuses;
        if (t.miningBonus) effects.miningBonus = t.miningBonus;
        return { active, effects };
      });
      
      const activeEffects = moduleBonuses
        .filter((i) => i.active)
        .reduce<ShowEffectsProps>((acc, curr) => combineEffects(acc, curr.effects), {});
      
      const potentialEffects = moduleBonuses.reduce<ShowEffectsProps>(
        (acc, curr) => combineEffects(acc, curr.effects),
        {},
      );
      
      // Calculate defense/combat scores
      const defenseModules = moduleTemplates.map(({ active, template: t }) => {
        if (t.spaceCombatModule) {
          return { active, tier: t.tier };
        }
        return null;
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
      
      // Simplified upgrade flags (can be enhanced later with full logic from git history)
      const hasUnnecessaryFactory = activeFactories.length > 0 && underConstruction.length === 0;
      const canUpgradePower = false;
      const canUpgradeCombat = false;
      const canUpgradeFarm = false;
      const canUpgradeFactory = false;
      const canUpgradeMining = false;
      const miningUpgradeInfo: { upgradeName: string; factoryName: string; factoryTier: number } | null = null as any;
      const bestMineEffects = null;

      return {
        id: hab.ID.value,
        displayName: hab.displayName,
        faction: hab.faction.value,
        tier,
        habType: hab.habType,
        siteId: hab.habSite?.value,
        habSiteId: hab.habSite?.value,
        orbitId: hab.orbitState?.value,
        orbitStateId: hab.orbitState?.value,
        population: currentPopulation,
        populationCapacity,
        resources: hab.resources,
        finishedProjectNames: hab.finishedProjectNames || [],
        sectorModules,
        hasBoostAvailable,
        habPowerConsumption,
        habPowerGeneration,
        solarGeneration,
        nuclearGeneration,
        estimatedMaxSolarCapacity,
        waterProductionDay,
        waterConsumptionDay,
        waterBalance,
        habFactories,
        activeFactories,
        habGrowth,
        activeGrowth,
        habMining,
        activeMining,
        habMineProduction,
        potentialHabMineProduction,
        siteDetails,
        readyForSectorUpgrade,
        modulesWithReadyUpgrades,
        nextHabModuleName,
        nextHabModule,
        canAffordUpgrade,
        thisModuleUnlocked,
        nextModuleName,
        nextModule,
        newMilestone,
        currentModules,
        requiredPower,
        requiredWater,
        finderSortOverride,
        currentAdminModule,
        modulesWithReadyUpgrades2,
        needsAdminTowerUpgrade,
        planetName,
        highlightedCompletions,
        emptyModuleCount,
        missingMine,
        activeEffects,
        potentialEffects,
        maxDaysToCompletion,
        hasUnnecessaryFactory,
        canUpgradePower,
        canUpgradeCombat,
        canUpgradeFarm,
        canUpgradeFactory,
        canUpgradeMining,
        miningUpgradeInfo,
        site,
        bestMineEffects,
      };
    })
    .toSorted((a, b) =>
      a.finderSortOverride === b.finderSortOverride ? 0 : a.finderSortOverride < b.finderSortOverride ? -1 : 1,
    );

  return habs;
}
