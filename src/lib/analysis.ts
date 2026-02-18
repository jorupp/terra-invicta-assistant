import {
  SaveFile,
  FactionGoal_CaptureNation_Clean,
  FactionGoal_CaptureNation_Dirty,
  FactionGoal_NeutralizeNation,
  FactionGoal_AttackWithFleet,
  FactionGoal_DefendWithFleet,
  FactionGoal_WarOnFaction,
  FactionGoal_InvadeEarth,
  FactionGoal_BuildFullStation,
  FactionGoal_BuildFullBase,
} from "./savefile";
import { MissionDataName, templates } from "./templates";
import { combineEffects, ShowEffectsProps } from "@/components/showEffects";
import { diffDateTime, formatDateTime, noDate, sortByDateTime, toDays } from "./utils";
import { extractCoreData } from "./analysis/core";
import { analyzeCouncilors, loadCouncilorTemplates } from "./analysis/councilors";
import { analyzeOrgs, loadOrgTemplates } from "./analysis/orgs";
import { analyzeFleets, loadShipData, loadSpaceData } from "./analysis/fleets";
import { analyzeRegions, analyzeNations, aggregateFactionNationHistory } from "./analysis/nations";
import { calculatePlayerStealableOrgs, calculatePlayerStealableProjects } from "./analysis/resources";
import { expandAlienGoals } from "./analysis/alien-goals";
import {
  calculatePlayerPlanetsAndBodies,
  calculateAlienFleetsToPlayerOrbits,
  calculatePlayerNationIds,
  calculatePlayerMissionCounts,
  calculateFactionAdminById,
} from "./analysis/player-context";
import { createBuildingSummary } from "./analysis/building-summary";
import { getSolarMultiplier, getMineMultiplier } from "./analysis/hab-utils";
import { processFactions } from "./analysis/factions";

export async function analyzeData(saveFile: SaveFile, fileName: string, lastModified: Date) {
  const {
    player,
    time,
    difficulty,
    mcMaskingTechs,
    projects,
    techs,
    driveLocalization,
    powerPlantLocalization,
    globalTechState,
  } = await extractCoreData(saveFile);

  const gameCurrentDateTimeFormatted = time.formatted;
  const lastMonth = time.lastMonth;

  // Load hab module templates early so we can use them in faction processing
  const habModuleTemplates = (await templates.habModules()).reduce((acc, mod) => {
    acc.set(mod.dataName, mod);
    return acc;
  }, new Map<string, Awaited<ReturnType<typeof templates.habModules>>[0]>());

  // Phase 1: Create upgrade map (old module -> new module)
  const moduleUpgradeMap = new Map<string, string>();
  for (const module of habModuleTemplates.values()) {
    if (module.upgradesFromName) {
      moduleUpgradeMap.set(module.upgradesFromName, module.dataName);
    }
  }

  // Load control points early so we can use them in faction processing
  const controlPoints = saveFile.gamestates["PavonisInteractive.TerraInvicta.TIControlPoint"].map(({ Value: cp }) => ({
    id: cp.ID.value,
    factionId: cp.faction?.value,
    nationId: cp.nation?.value,
    displayName: cp.displayName,
    benefitsDisabled: cp.benefitsDisabled,
    crackdownExpiration: cp.crackdownExpiration,
    defended: cp.defended,
    controlPointPriorities: cp.controlPointPriorities,
  }));

  const { factions, factionsById, shipDesignsByDataName } = processFactions(
    saveFile,
    difficulty,
    mcMaskingTechs,
    projects,
    habModuleTemplates,
    lastMonth,
  );

  const playerFaction = factions.find((faction) => faction.id === player.faction);
  if (!playerFaction) {
    throw new Error("Player faction data not found in save file.");
  }

  const { sol, earth, planets, orbitsById, bodiesById } = await loadSpaceData(saveFile);
  const { shipHulls, shipHullsByDataName, ships, shipsById } = await loadShipData(saveFile, shipDesignsByDataName);
  const fleets = analyzeFleets(
    saveFile,
    time,
    playerFaction.id,
    shipsById,
    shipDesignsByDataName,
    shipHullsByDataName,
    orbitsById,
    bodiesById,
  );
  const fleetsById = new Map<number, (typeof fleets)[0]>(fleets.map((fleet) => [fleet.id, fleet]));
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

  const alienFaction = factions.find((faction) => faction.templateName === "AlienCouncil");
  if (!alienFaction) {
    throw new Error("Alien faction data not found in save file.");
  }

  const { regions, regionsById, regionsByNationId } = analyzeRegions(saveFile);
  const nations = analyzeNations(saveFile, controlPoints, regionsByNationId, playerFaction.id);
  const nationsById = new Map<number, (typeof nations)[0]>(nations.map((nation) => [nation.id, nation]));

  // Build controlPointsByNationId for faction history aggregation
  const controlPointsByNationId = controlPoints.reduce((acc, cp) => {
    if (!cp.nationId) return acc;
    if (!acc.has(cp.nationId)) {
      acc.set(cp.nationId, []);
    }
    acc.get(cp.nationId)!.push(cp);
    return acc;
  }, new Map<number, typeof controlPoints>());

  aggregateFactionNationHistory(saveFile, factions, controlPointsByNationId);

  const orgTemplates = await loadOrgTemplates();
  const orgs = analyzeOrgs(saveFile, orgTemplates, regionsById, nationsById);
  const orgsById = new Map<number, (typeof orgs)[0]>(orgs.map((org) => [org.id, org]));
  const playerUnassignedOrgs = orgs.filter((org) => playerFaction?.unassignedOrgIds.includes(org.id));
  const playerAvailableOrgs = orgs.filter((org) => playerFaction?.availableOrgIds.includes(org.id));

  const { councilorTraitTemplatesByDataName, councilorTypesByDataName } = await loadCouncilorTemplates();

  const councilors = analyzeCouncilors(
    saveFile,
    orgs,
    regionsById,
    playerFaction.id,
    playerFaction.intel,
    playerFaction.highestIntel,
    playerFaction.lastRecordedLoyalty,
    councilorTraitTemplatesByDataName,
    councilorTypesByDataName,
  );
  const playerCouncilors = councilors.filter((councilor) => playerFaction?.councilorIds.includes(councilor.id));

  // Calculate mining bonuses for each faction
  const effectsState = saveFile.gamestates["PavonisInteractive.TerraInvicta.TIEffectsState"][0]?.Value;

  factions.forEach((faction) => {
    if (faction.id !== playerFaction.id) return;
    // Start with base 1% multiplier for each resource
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
        // SpaceMiningBonus is additive with councilor bonuses and can appear multiple times, so we need to loop through all of them
        const spaceMiningEffects = factionEffects.SpaceMiningBonus || [];
        spaceMiningEffects.forEach((effect) => {
          // Extract percentage from effect name like "Effect_SpaceMiningBonus5" = 5%
          const match = effect.match(/Effect_SpaceMiningBonus(\d+)/);
          if (match) {
            spaceMiningMultiplier += parseInt(match[1], 10) / 100;
          }
        });

        // Resource-specific bonuses (15% each), can appear multiple times, and are multiplicative, not additive
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

    // now apply the all-resources modifier
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
          // don't have these wired up to anything yet
          // if (t.specialRules?.includes("LEOBonusAlienDetection"))
          //   effects.miltechBonus = (effects.miltechBonus || 0) + t.specialRulesValue!;
          // if (t.specialRules?.includes("LEOBonusHumanDetection"))
          //   effects.miltechBonus = (effects.miltechBonus || 0) + t.specialRulesValue!;
          // if (t.specialRules?.includes("LEOBonusOppression"))
          //   effects.miltechBonus = (effects.miltechBonus || 0) + t.specialRulesValue!;
          // if (t.specialRules?.includes("LEOBonusPropagandaStrength"))
          //   effects.miltechBonus = (effects.miltechBonus || 0) + t.specialRulesValue!;
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

  const expandedAlienGoals = expandAlienGoals(saveFile, alienFaction, nationsById, habs, fleets, factionsById);

  const playerHabs = habs.filter((hab) => hab.faction === playerFaction.id);
  const playerFleets = fleets.filter((fleet) => fleet.faction === playerFaction.id);

  // Create a map from hab ID to original hab data for looking up inEarthLEO
  const originalHabsById = new Map(
    saveFile.gamestates["PavonisInteractive.TerraInvicta.TIHabState"].map(({ Value: hab }) => [hab.ID.value, hab]),
  );

  // Create building summary: aggregate modules by template across all player habs
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

      // Count all modules (current + future under construction)
      existing.futureCount++;

      // Count only active modules as current
      if (active) {
        existing.currentCount++;
      }

      // Calculate effects for this module
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

      // Add to future effects always
      existing.futureEffects = combineEffects(existing.futureEffects, moduleEffects);

      // Add to current effects only if active
      if (active) {
        existing.currentEffects = combineEffects(existing.currentEffects, moduleEffects);
      }

      buildingSummary.set(templateName, existing);
    }
  }

  const buildingSummaryArray = Array.from(buildingSummary.values()).sort((a, b) =>
    a.friendlyName.localeCompare(b.friendlyName),
  );

  // planets the player cares about: habs, fleet-origin, fleet-destination, fleet-orbiting
  const playerOrbitIds = new Set<number | null | undefined>();
  for (const hab of playerHabs) {
    playerOrbitIds.add(hab.orbitStateId);
  }
  for (const fleet of playerFleets) {
    playerOrbitIds.add(fleet.targetOrbitId);
    playerOrbitIds.add(fleet.originOrbitId);
  }
  const playerBarycenters = new Set<number | null | undefined>(
    saveFile.gamestates["PavonisInteractive.TerraInvicta.TIOrbitState"]
      .filter((orbit) => playerOrbitIds.has(orbit.Key.value))
      .map((i) => i.Value.barycenter.value),
  );
  for (const hab of playerHabs) {
    playerBarycenters.add(habSitesById.get(hab.habSiteId || 0)?.parentBodyId);
  }
  const playerPlanetIds = new Set<number>(
    planets
      .filter((planet) => playerBarycenters.has(planet.Key.value))
      .map((planet) => planet.Value)
      .map((p) => ((p.barycenter?.value ?? sol) === sol ? p.ID.value : p.barycenter!.value)),
  );
  const playerPlanets = planets
    .filter((planet) => playerPlanetIds.has(planet.Key.value))
    .map((p) => p.Value)
    .map((p) => ({
      id: p.ID.value,
      templateName: p.templateName,
      displayName: p.displayName,
      playerTag: p.playerTag,
    }));

  const playerInterestedBodyIds = new Set<number>(
    [...playerPlanetIds]
      .concat(planets.filter((i) => playerPlanetIds.has(i.Value.barycenter?.value ?? 0)).map((i) => i.Key.value))
      .concat([earth]),
  );
  const playerInterestedOrbitIds = new Set<number>(
    saveFile.gamestates["PavonisInteractive.TerraInvicta.TIOrbitState"]
      .filter((orbit) => playerInterestedBodyIds.has(orbit.Value.barycenter.value))
      .map((i) => i.Key.value),
  );
  const playerInterestedPlanets = planets
    .filter((planet) => playerInterestedBodyIds.has(planet.Key.value))
    .map((p) => p.Value);

  const alienFleetsToPlayerOrbits = sortByDateTime(
    fleets
      .filter((fleet) => fleet.faction === alienFaction.id)
      .filter((fleet) => fleet.targetOrbitId && playerInterestedOrbitIds.has(fleet.targetOrbitId)),
    (i) => i.arrivalTime,
  );

  const playerNationIds = new Set<number>(
    controlPoints
      .filter((cp) => cp.factionId === playerFaction.id && cp.nationId)
      .map((cp) => cp.nationId!)
      .concat(playerCouncilors.map((c) => c.homeNationId).filter((id): id is number => !!id)),
  );

  const playerAvailableCouncilors = councilors.filter((councilor) =>
    playerFaction?.availableCouncilorIds.includes(councilor.id),
  );
  const playerMissionCounts = playerCouncilors.reduce((acc, councilor) => {
    const missionNames = councilor.effectsWithOrgsAndAugments.missionsGrantedNames || [];
    for (const missionName of missionNames) {
      acc.set(missionName, (acc.get(missionName) || 0) + 1);
    }
    return acc;
  }, new Map<MissionDataName, number>());
  const factionAdminById = new Map<number, number>(
    factions.map((faction) => {
      // sum of all councilors' admin effects
      const factionCouncilors = councilors.filter((c) => c.factionId === faction.id);
      const totalAdmin = factionCouncilors.reduce((acc, c) => {
        return (
          acc +
          Math.max(
            0,
            (c.effectsWithOrgsAndAugments.administration || 0) + (c.effectsWithOrgsAndAugments.Administration || 0),
          )
        );
      }, 0);
      return [faction.id, totalAdmin / Math.max(1, factionCouncilors.length)];
    }),
  );
  const playerVisibleCouncilors = councilors.filter((i) => i.factionId !== playerFaction.id && i.playerIntel >= 0.25); // TODO: figure out exact intel threshold
  const playerVisibleFactionIds = new Set<number>(
    playerVisibleCouncilors.map((c) => c.factionId).filter((id): id is number => !!id),
  );

  const playerStealableOrgs = calculatePlayerStealableOrgs(
    councilors,
    orgs,
    factions,
    factionsById,
    factionAdminById,
    playerFaction.id,
    playerVisibleFactionIds,
  );

  const playerStealableProjects = calculatePlayerStealableProjects(
    factions,
    projects,
    playerFaction,
    alienFaction,
    playerVisibleFactionIds,
  );

  const allDrives = await templates.drives();
  const drivesByBaseName = new Map<string, (typeof allDrives)[0] & { baseName: string }>();
  for (const drive of allDrives) {
    // Skip disabled drives
    if (drive.disabled) {
      continue;
    }

    // Skip alien drives
    if (drive.requiredProjectName.startsWith("Project_Alien")) {
      continue;
    }

    // Try multiple patterns to remove thruster count suffix
    // Patterns: "_x1", " x1", "x1" at end of dataName or friendlyName
    const baseName = drive.dataName
      .replace(/_x\d+$/, "") // Pattern: Name_x1
      .replace(/\sx\d+$/, "") // Pattern: Name x1
      .replace(/x\d+$/, ""); // Pattern: Namex1

    const existing = drivesByBaseName.get(baseName);
    if (!existing || drive.thrusters > existing.thrusters) {
      drivesByBaseName.set(baseName, { ...drive, baseName });
    }
  }

  function calculateRemainingResearch(targetName: string): {
    techResearchRemaining: number;
    projectResearchRemaining: number;
    requiredTechs: string[];
    requiredProjects: string[];
  } {
    const complete = new Set([...globalTechState.finishedTechsNames, ...playerFaction!.finishedProjectNames]);
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
      ...playerFaction!.currentProjectProgress.map((i) => [i.projectTemplateName, i.accumulatedResearch] as const),
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

  // Load radiators and calculate cooling efficiency (GW per ton)
  const allRadiators = await templates.radiators();
  const availableRadiators = allRadiators.filter((radiator) => {
    if (!radiator.requiredProjectName) return true;
    return playerFaction!.finishedProjectNames.includes(radiator.requiredProjectName);
  });

  // note: this was completely made up by claude-sonnet-4.5 - I told it to guess since I didn't know the formula and I know TI likes to model real-world physics.
  // Calculate GW per ton for each radiator
  // Power dissipated (W) = specificPower_2s_KWkg * 1000 (to convert kW to W) * mass (kg)
  // So for 1 ton (1000 kg): power = specificPower_2s_KWkg * 1000 * 1000 = specificPower_2s_KWkg * 1,000,000 W
  // Convert to GW: GW per ton = specificPower_2s_KWkg * 1,000,000 / 1,000,000,000 = specificPower_2s_KWkg / 1000
  const radiatorsWithEfficiency = availableRadiators.map((radiator) => ({
    ...radiator,
    gwPerTon: radiator.specificPower_2s_KWkg / 1000,
  }));

  // Find the best radiator (highest GW per ton)
  const bestRadiator =
    radiatorsWithEfficiency.length > 0
      ? radiatorsWithEfficiency.reduce((best, current) => {
          return current.gwPerTon > best.gwPerTon ? current : best;
        })
      : undefined;

  // Load power plants and filter to those unlocked by the player
  const allPowerPlants = await templates.powerPlants();
  const availablePowerPlants = allPowerPlants.filter((powerPlant) => {
    if (!powerPlant.requiredProjectName) return true;
    return playerFaction!.finishedProjectNames.includes(powerPlant.requiredProjectName);
  });

  const drives = Array.from(drivesByBaseName.values()).map((drive) => {
    const { techResearchRemaining, projectResearchRemaining, requiredTechs, requiredProjects } =
      calculateRemainingResearch(drive.requiredProjectName);

    const thrustRating = Math.log(drive.thrust_N) / Math.log(4); // log4
    const exhaustRating = Math.log2(drive.EV_kps);
    const overallRating = thrustRating * exhaustRating;

    const project = projects.get(drive.requiredProjectName);
    const unlockChance = project?.factionAvailableChance ?? 100;
    const isProjectComplete = playerFaction!.finishedProjectNames.includes(drive.requiredProjectName);

    // Multiply propellant materials by 10 for per-tank values
    const propellantMaterials = {
      water: drive.perTankPropellantMaterials.water * 10,
      volatiles: drive.perTankPropellantMaterials.volatiles * 10,
      metals: drive.perTankPropellantMaterials.metals * 10,
      nobleMetals: drive.perTankPropellantMaterials.nobleMetals * 10,
      fissiles: drive.perTankPropellantMaterials.fissiles * 10,
      antimatter: drive.perTankPropellantMaterials.antimatter * 10,
    };

    // Calculate how many tanks the player can afford with current resources
    const resourceAmounts = [
      {
        name: "Water",
        tanks: propellantMaterials.water > 0 ? playerFaction!.resources.Water / propellantMaterials.water : Infinity,
      },
      {
        name: "Volatiles",
        tanks:
          propellantMaterials.volatiles > 0
            ? playerFaction!.resources.Volatiles / propellantMaterials.volatiles
            : Infinity,
      },
      {
        name: "Metals",
        tanks: propellantMaterials.metals > 0 ? playerFaction!.resources.Metals / propellantMaterials.metals : Infinity,
      },
      {
        name: "NobleMetals",
        tanks:
          propellantMaterials.nobleMetals > 0
            ? playerFaction!.resources.NobleMetals / propellantMaterials.nobleMetals
            : Infinity,
      },
      {
        name: "Fissiles",
        tanks:
          propellantMaterials.fissiles > 0
            ? playerFaction!.resources.Fissiles / propellantMaterials.fissiles
            : Infinity,
      },
      {
        name: "Antimatter",
        tanks:
          propellantMaterials.antimatter > 0
            ? playerFaction!.resources.Antimatter / propellantMaterials.antimatter
            : Infinity,
      },
    ];

    const limitingResource = resourceAmounts.reduce((min, curr) => (curr.tanks < min.tanks ? curr : min));
    const tanksAffordable = Math.floor(limitingResource.tanks);
    const limitingResourceName = limitingResource.tanks !== Infinity ? limitingResource.name : undefined;

    // Clean up friendly name by removing thruster count suffix
    const displayName = drive.friendlyName
      .replace(/\sx\d+$/, "") // Remove " x6" etc
      .replace(/_x\d+$/, ""); // Remove "_x6" etc

    const driveClassificationDisplayName =
      driveLocalization.get(`TIDriveTemplate.Class.${drive.driveClassification}`) || drive.driveClassification;
    const powerPlantDisplayName = drive.requiredPowerPlant
      ? powerPlantLocalization.get(`TIPowerPlantTemplate.PowerPlantRequirement.${drive.requiredPowerPlant}`) ||
        drive.requiredPowerPlant
      : "";

    // Step 1: Calculate total reactor power required
    // Note: Values like "3,840.096" need comma stripping before parsing
    const thrustRating_GW = parseFloat(drive.thrustRating_GW.replace(/,/g, ""));
    const reqPower_GW = parseFloat(drive["req power"].replace(/,/g, ""));
    // req power already accounts for drive efficiency, so use it directly
    const powerRequiredGW = reqPower_GW;

    // Step 2 & 3: Find eligible reactors and select the appropriate one
    let reactorDebugInfo: string | undefined = undefined;

    let eligibleReactors = availablePowerPlants.filter((reactor) => {
      const powerPlantMatches =
        reactor.powerPlantClass === drive.requiredPowerPlant || drive.requiredPowerPlant === "Any_General";
      const powerSufficient = reactor.maxOutput_GW >= powerRequiredGW;
      return powerPlantMatches && powerSufficient;
    });

    // If no unlocked reactors found, fall back to all reactors (for future drives)
    let useFallback = false;
    if (eligibleReactors.length === 0) {
      useFallback = true;
      eligibleReactors = allPowerPlants.filter((reactor) => {
        const powerPlantMatches =
          reactor.powerPlantClass === drive.requiredPowerPlant || drive.requiredPowerPlant === "Any_General";
        const powerSufficient = reactor.maxOutput_GW >= powerRequiredGW;
        return powerPlantMatches && powerSufficient;
      });
    }

    // Generate debug info if no reactor found
    if (eligibleReactors.length === 0) {
      const matchingTypeReactors = allPowerPlants.filter(
        (reactor) => reactor.powerPlantClass === drive.requiredPowerPlant || drive.requiredPowerPlant === "Any_General",
      );

      if (matchingTypeReactors.length === 0) {
        reactorDebugInfo = `No reactors of required type: ${drive.requiredPowerPlant}`;
      } else {
        const maxAvailablePower = Math.max(...matchingTypeReactors.map((r) => r.maxOutput_GW));
        reactorDebugInfo = `No reactors with sufficient power.\nRequired: ${powerRequiredGW.toFixed(1)} GW\nHighest available (${matchingTypeReactors.find((r) => r.maxOutput_GW === maxAvailablePower)?.friendlyName}): ${maxAvailablePower.toFixed(1)} GW`;
      }
    }

    const bestReactor =
      eligibleReactors.length > 0
        ? eligibleReactors.reduce((best, current) => {
            // For unlocked reactors, use highest efficiency (best case)
            // For future drives, use lowest efficiency (worst case)
            return useFallback
              ? current.efficiency < best.efficiency
                ? current
                : best
              : current.efficiency > best.efficiency
                ? current
                : best;
          })
        : undefined;

    // Calculate reactor and radiator weight
    let reactorTons: number | undefined = undefined;
    let radiatorTons: number | undefined = undefined;
    let reactorAndRadiatorTons: number | undefined = undefined;
    let reactorName: string | undefined = undefined;
    let reactorGW: number | undefined = undefined;
    let reactorGWperTon: number | undefined = undefined;
    let wasteHeatGW: number | undefined = undefined;
    let radiatorName: string | undefined = undefined;
    let radiatorGWperTon: number | undefined = undefined;

    if (bestReactor) {
      reactorName = bestReactor.friendlyName;
      reactorGW = powerRequiredGW;
      reactorGWperTon = bestReactor.specificPower_tGW;

      // Reactor weight = power required / specific power (tons per GW)
      reactorTons = powerRequiredGW / bestReactor.specificPower_tGW;

      // For Calc/Closed cooling drives, add radiator weight
      if ((drive.cooling === "Calc" || drive.cooling === "Closed") && bestRadiator) {
        radiatorName = bestRadiator.friendlyName;
        radiatorGWperTon = bestRadiator.gwPerTon;

        // Step 4: Calculate waste heat using reactor efficiency
        wasteHeatGW = powerRequiredGW * (1 - bestReactor.efficiency);
        radiatorTons = wasteHeatGW / bestRadiator.gwPerTon;
      }

      reactorAndRadiatorTons = reactorTons + (radiatorTons || 0);
    }

    // Calculate resources required (1 resource = 10 tons)
    const reactorResources = reactorTons !== undefined ? reactorTons / 10 : undefined;
    const radiatorResources = radiatorTons !== undefined ? radiatorTons / 10 : undefined;
    const totalResources = reactorAndRadiatorTons !== undefined ? reactorAndRadiatorTons / 10 : undefined;

    // Calculate material breakdown for reactor
    const reactorMaterials =
      bestReactor && reactorResources !== undefined
        ? {
            water: bestReactor.weightedBuildMaterials.water * reactorResources,
            volatiles: bestReactor.weightedBuildMaterials.volatiles * reactorResources,
            metals: bestReactor.weightedBuildMaterials.metals * reactorResources,
            nobleMetals: bestReactor.weightedBuildMaterials.nobleMetals * reactorResources,
          }
        : undefined;

    // Calculate material breakdown for radiator
    const radiatorMaterials =
      bestRadiator && radiatorResources !== undefined
        ? {
            volatiles: bestRadiator.weightedBuildMaterials.volatiles * radiatorResources,
            metals: bestRadiator.weightedBuildMaterials.metals * radiatorResources,
            nobleMetals: bestRadiator.weightedBuildMaterials.nobleMetals * radiatorResources,
            exotics: bestRadiator.weightedBuildMaterials.exotics * radiatorResources,
          }
        : undefined;

    // Calculate hypothetical ship performance
    // Ship: 10,000 tons dry + reactor/radiator + 5,000 tons fuel (50 tanks)
    const dryMass = 10000 + (reactorAndRadiatorTons || 0); // tons
    const fuelMass = 5000; // 50 tanks @ 100 tons each
    const wetMass = dryMass + fuelMass;

    // Delta-V calculation using Tsiolkovsky rocket equation
    const exhaustVelocity = drive.EV_kps * 1000; // Convert km/s to m/s
    const shipDeltaV = exhaustVelocity * Math.log(wetMass / dryMass); // m/s

    // Trip calculation: 5 AU with constant thrust
    const tripDistance = 5 * 149597870700; // 5 AU in meters
    const midpointDistance = tripDistance / 2;

    // Calculate initial acceleration (at full fuel)
    const thrust = drive.thrust_N;
    const initialMass = wetMass * 1000; // Convert tons to kg
    const initialAcceleration = thrust / initialMass; // m/s²
    const accelerationMilliGs = (initialAcceleration / 9.81) * 1000; // Convert to milli-gs

    // Use average mass for trip time calculation
    const avgMass = ((wetMass + dryMass) / 2) * 1000; // Convert tons to kg
    const avgAcceleration = thrust / avgMass; // m/s²

    // For symmetric brachistochrone trajectory (accel to midpoint, then decel)
    // Time to midpoint: t = sqrt(2 * d / a)
    // Velocity at midpoint: v = sqrt(2 * a * d)
    const timeToMidpoint = Math.sqrt((2 * midpointDistance) / avgAcceleration); // seconds
    const velocityAtMidpoint = avgAcceleration * timeToMidpoint; // m/s
    const deltaVNeeded = 2 * velocityAtMidpoint; // m/s (accel + decel)

    // Determine if thrust-limited or deltaV-limited
    let tripTime: number;
    let remainingDeltaV: number;
    let tripType: "thrust-limited" | "deltaV-limited";

    if (deltaVNeeded <= shipDeltaV) {
      // Thrust-limited: have enough fuel, time limited by acceleration
      tripTime = timeToMidpoint * 2; // seconds
      remainingDeltaV = shipDeltaV - deltaVNeeded;
      tripType = "thrust-limited";
    } else {
      // DeltaV-limited: run out of fuel before reaching full speed
      tripType = "deltaV-limited";
      remainingDeltaV = 0;

      // Max velocity we can reach with available deltaV
      const maxVelocity = shipDeltaV / 2; // m/s (half for accel, half for decel)

      // Distance covered during acceleration: d = v²/(2a)
      const accelDistance = (maxVelocity * maxVelocity) / (2 * avgAcceleration);
      const coastDistance = tripDistance - 2 * accelDistance;

      // Time for acceleration phase
      const accelTime = maxVelocity / avgAcceleration;

      if (coastDistance > 0) {
        // Coast phase exists
        const coastTime = coastDistance / maxVelocity;
        tripTime = 2 * accelTime + coastTime;
      } else {
        // No coast phase, pure accel/decel
        tripTime = 2 * accelTime;
      }
    }

    return {
      dataName: drive.dataName,
      friendlyName: displayName,
      thrust_N: drive.thrust_N,
      EV_kps: drive.EV_kps,
      efficiency: drive.efficiency,
      propellant: drive.propellant,
      propellantMaterials,
      requiredProjectName: drive.requiredProjectName,
      requiredPowerPlant: drive.requiredPowerPlant,
      requiredPowerPlantDisplayName: powerPlantDisplayName,
      driveClassification: drive.driveClassification,
      driveClassificationDisplayName,
      thrusters: drive.thrusters,
      cooling: drive.cooling,
      powerRequiredGW,
      thrustRating_GW,
      reqPower_GW,
      reactorEfficiency: bestReactor?.efficiency,
      thrustRating,
      exhaustRating,
      overallRating,
      unlockChance: unlockChance === 100 || isProjectComplete ? undefined : unlockChance,
      tanksAffordable,
      limitingResourceName,
      reactorTons,
      radiatorTons,
      reactorAndRadiatorTons,
      reactorResources,
      radiatorResources,
      totalResources,
      reactorMaterials,
      radiatorMaterials,
      reactorName,
      reactorDebugInfo,
      reactorGW,
      reactorGWperTon,
      wasteHeatGW,
      radiatorName,
      radiatorGWperTon,
      techResearchRemaining,
      projectResearchRemaining,
      requiredTechs,
      requiredProjects,
      shipDeltaV,
      accelerationMilliGs,
      tripTime,
      tripType,
      remainingDeltaV,
    };
  });

  return {
    fileName,
    lastModified,
    gameCurrentDateTime: time.currentDateTime,
    gameCurrentDateTimeFormatted,
    player,
    playerFaction,
    alienFaction,
    expandedAlienGoals,
    playerHabs,
    buildingSummary: buildingSummaryArray,
    playerFleets,
    playerPlanets,
    alienFleetsToPlayerOrbits,
    playerUnassignedOrgs,
    playerAvailableOrgs,
    playerStealableOrgs,
    playerNationIds: [...playerNationIds],
    playerCouncilors,
    playerMissionCounts,
    playerAvailableCouncilors,
    nations,
    factionsById,
    playerInterestedPlanets,
    playerVisibleCouncilors,
    globalTechState,
    techs,
    projects,
    playerStealableProjects,
    drives,
    bestRadiator: bestRadiator
      ? {
          friendlyName: bestRadiator.friendlyName,
          gwPerTon: bestRadiator.gwPerTon,
        }
      : undefined,
  };
}

export type Analysis = Awaited<ReturnType<typeof analyzeData>>;
