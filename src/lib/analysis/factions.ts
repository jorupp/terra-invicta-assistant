import { SaveFile } from "../savefile";
import { templates } from "../templates";
import { diffDateTime, formatDateTime, sortByDateTime, toDays } from "../utils";
import { analyzeNations } from "./nations";
import { analyzeOrgs } from "./orgs";
import { analyzeResearch } from "./research";

export interface AnalyzeFactionArgs {
  projects: Awaited<ReturnType<typeof analyzeResearch>>["projects"];
  controlPoints: ReturnType<typeof analyzeNations>["controlPoints"];
  habModuleTemplates: Map<string, Awaited<ReturnType<typeof templates.habModules>>[0]>;
  playerFactionId: number;
  allNationStates: ReturnType<typeof analyzeNations>["allNationStates"];
  controlPointsByNationId: ReturnType<typeof analyzeNations>["controlPointsByNationId"];
}

export async function analyzeFactions(
  saveFile: SaveFile,
  {
    projects,
    controlPoints,
    habModuleTemplates,
    playerFactionId,
    allNationStates,
    controlPointsByNationId,
  }: AnalyzeFactionArgs,
) {
  const time = saveFile.gamestates["PavonisInteractive.TerraInvicta.TITimeState"][0].Value;
  const lastMonth = {
    ...time.currentDateTime,
    month: time.currentDateTime.month === 1 ? 12 : time.currentDateTime.month - 1,
    year: time.currentDateTime.month === 1 ? time.currentDateTime.year - 1 : time.currentDateTime.year,
  };

  // TODO: maybe could come from `projects`?
  const mcMaskingTechs = new Set(
    (await templates.projects())
      .filter((i) => i.effects?.some((e) => e === "Effect_MCUsageMasking"))
      .map((i) => i.dataName),
  );
  const metadata = saveFile.gamestates["PavonisInteractive.TerraInvicta.TIMetadataState"][0].Value;
  const { difficulty } = metadata;
  const factions = saveFile.gamestates["PavonisInteractive.TerraInvicta.TIFactionState"].map(({ Value: faction }) => {
    const mcMultiplier =
      (difficulty === "Cinematic"
        ? 0.05
        : difficulty === "Normal"
          ? 0.3
          : difficulty === "Veteran"
            ? 0.6
            : difficulty === "Brutal"
              ? 1
              : 9999) * Math.pow(0.8, faction.finishedProjectNames.filter((name) => mcMaskingTechs.has(name)).length);
    const mcDailyTransactions = sortByDateTime(
      faction.Transactions["Daily Income"]?.filter((i) => i.Resource === "MissionControl"),
      (i) => i.Date,
    );
    const mcCurrentLimit =
      mcDailyTransactions.length > 0 ? mcDailyTransactions[mcDailyTransactions.length - 1].Amount : 0;
    const availableProjects = faction.availableProjectNames
      .map((name) => projects.get(name))
      .filter((i): i is NonNullable<typeof i> => !!i);
    const availableBoostProjects = availableProjects
      .filter((i) => i.effects?.some((ii) => ii.startsWith("Effect_LaunchFacilitiesPriorityBonus")) && !i.repeatable)
      .map(({ friendlyName, techCategory, researchCost, dataName }) => ({
        friendlyName,
        techCategory,
        researchCost,
        dataName,
      }));
    const availableCPProjects = availableProjects
      .filter((i) => i.effects?.some((ii) => ii.startsWith("Effect_ControlPointMaintenanceBonus")) && !i.repeatable)
      .map(({ friendlyName, techCategory, researchCost, dataName, effects }) => {
        // Extract the CP bonus from the effect string (e.g., "Effect_ControlPointMaintenanceBonus10" -> 10)
        const cpEffect = effects?.find((e) => e.startsWith("Effect_ControlPointMaintenanceBonus"));
        const cpBonus = cpEffect ? parseInt(cpEffect.replace("Effect_ControlPointMaintenanceBonus", "") || "0") : 0;

        // Find current progress for this project
        const progress = faction.currentProjectProgress.find((p) => p.projectTemplateName === dataName);

        return {
          friendlyName,
          techCategory,
          researchCost,
          dataName,
          cpBonus,
          currentProgress: progress?.accumulatedResearch || 0,
        };
      });
    const availableMaxOrgProjects = availableProjects
      .filter((i) => i.effects?.some((ii) => ii.startsWith("Effect_IncreaseMaxAvailableOrgs")) && !i.repeatable)
      .map(({ friendlyName, techCategory, researchCost, dataName }) => ({
        friendlyName,
        techCategory,
        researchCost,
        dataName,
      }));

    // Get nations where this faction has at least one control point by checking controlPoints directly
    const factionControlledNationTemplateNames = new Set(
      saveFile.gamestates["PavonisInteractive.TerraInvicta.TINationState"]
        .filter((nationEntry) => {
          const nationId = nationEntry.Value.ID.value;
          // Check if this faction has any control points in this nation
          return controlPoints.some((cp) => cp.nationId === nationId && cp.factionId === faction.ID.value);
        })
        .map((nationEntry) => nationEntry.Value.templateName),
    );

    const availableExpandNationProjects = availableProjects
      .filter((project) => {
        // Must have AI_projectRole of "ExpandNation"
        if (project.AI_projectRole !== "ExpandNation") return false;

        // Must have requiresNation field
        if (!project.requiresNation) return false;

        // Faction must have at least one CP in the required nation
        return factionControlledNationTemplateNames.has(project.requiresNation);
      })
      .map(({ friendlyName, techCategory, researchCost, dataName, requiresNation }) => {
        // Find current progress for this project
        const progress = faction.currentProjectProgress.find((p) => p.projectTemplateName === dataName);

        return {
          friendlyName,
          techCategory,
          researchCost,
          dataName,
          requiresNation: requiresNation!,
          currentProgress: progress?.accumulatedResearch || 0,
        };
      });

    return {
      id: faction.ID.value,
      templateName: faction.templateName,
      displayName: faction.displayName,
      techNameContributionHistory: faction.techNameContributionHistory,
      unlockedVictoryObjective: faction.unlockedVictoryObjective,
      finishedProjectNames: faction.finishedProjectNames,
      currentProjectProgress: faction.currentProjectProgress,
      atrocities: faction.atrocities,
      milestones: faction.milestones,
      missionControlUsage: faction.missionControlUsage,
      passiveTechSlot: faction.PassiveTechSlot,
      councilorIds: faction.councilors.map((i) => i.value),
      turnedCouncilorIds: faction.turnedCouncilors.map((i) => i.value),
      unassignedOrgIds: faction.unassignedOrgs.map((i) => i.value),
      availableOrgIds: faction.availableOrgs.map((i) => i.value),
      availableCouncilorIds: faction.availableCouncilors.map((i) => i.value),
      shipDesigns: faction.shipDesigns.map((i) => ({
        hullName: i.hullName,
        noseArmor: i.noseArmor,
        lateralArmor: i.lateralArmor,
        tailArmor: i.tailArmor,
        dataName: i.dataName,
        friendlyName: i.friendlyName,
        displayName: i._displayName,
        role: i.role,
      })),
      intel: new Map((faction.intel || []).map((i) => [i.Key.value, i.Value])),
      highestIntel: new Map((faction.highestIntel || []).map((i) => [i.Key.value, i.Value])),
      lastRecordedLoyalty: new Map(
        Array.isArray(faction.lastRecordedLoyalty)
          ? faction.lastRecordedLoyalty.map((i) => [i.Key.value, i.Value])
          : [],
      ),
      monthlyTransactionSummary: [
        ...Object.entries(faction.Transactions)
          .flatMap(([source, transactions]) =>
            transactions.map((t) => ({
              source,
              resource: t.Resource,
              amount: t.Amount,
              date: t.Date,
            })),
          )
          .filter((t) => toDays(diffDateTime(lastMonth, t.date)) < 0)
          .reduce((acc, t) => {
            const key = `${t.source}||${t.resource}`;
            const existing = acc.get(key) || {
              source: t.source,
              resource: t.resource,
              amount: 0,
              transactions: [] as { date: string; amount: number }[],
            };
            existing.amount += t.amount;

            // Track individual transactions for Exotics and Antimatter
            if ((t.resource === "Exotics" || t.resource === "Antimatter") && t.amount > 0) {
              existing.transactions.push({ date: formatDateTime(t.date), amount: t.amount });
            }

            acc.set(key, existing);
            return acc;
          }, new Map<string, { source: string; resource: string; amount: number; transactions: { date: string; amount: number }[] }>())
          .values(),
      ],
      permaAbandonedNationIds: faction.permaAbandonedNations.map((i) => i.value),
      mcUsage: faction.missionControlUsage,
      mcCurrentLimit,
      mcHateFloor: Math.floor(faction.missionControlUsage * mcMultiplier),
      mcAlienWarLimit: 50 / mcMultiplier,
      availableBoostProjects,
      availableCPProjects,
      availableMaxOrgProjects,
      availableExpandNationProjects,
      availableProjectNames: faction.availableProjectNames,
      missedProjects: faction.missedProjects || [],
      potentialProjects: (faction.activeProjectTriggers || []).map((i) => i.projectTemplateName),
      resources: faction.resources,
      // Phase 2: Track unlocked hab modules for this faction
      unlockedHabModules: new Set(
        [...habModuleTemplates.values()]
          .filter(
            (module) =>
              !module.requiredProjectName || faction.finishedProjectNames.includes(module.requiredProjectName),
          )
          .map((module) => module.dataName),
      ),
      factionHate: new Map((faction.factionHate || []).map((i) => [i.Key.value, i.Value])),
      assessedAlienHateOfMe: faction.assessedAlienHateOfMe,
      lastDateOfFixedAlienHate: faction.lastDateOfFixedAlienHate,
      defaultPriorityPresetTemplateName: faction.defaultPriorityPresetTemplateName,
      alienInvestigations: faction.alienInvestigations,
      factionGoals: faction.factionGoals,
      nationHistory: {
        historyMissionControl: [] as number[],
        historyBoost: [] as number[],
        currentBoost: 0,
        currentMC: 0,
        boostMonthlyChange: 0,
        mcMonthlyChange: 0,
      },
      miningMultipliers: {
        water: 1,
        volatiles: 1,
        metals: 1,
        nobles: 1,
        fissiles: 1,
      },
    };
  });
  const factionsById = new Map<number, (typeof factions)[0]>(factions.map((faction) => [faction.id, faction]));

  const playerFaction = factions.find((faction) => faction.id === playerFactionId);
  if (!playerFaction) {
    throw new Error("Player faction data not found in save file.");
  }

  const alienFaction = factions.find((faction) => faction.templateName === "AlienCouncil");
  if (!alienFaction) {
    throw new Error("Alien faction data not found in save file.");
  }

  for (const faction of factions) {
    // Find all nations where this faction has at least one control point
    const controlledNationsWithCPs: Array<{
      nation: (typeof allNationStates)[0];
      factionCPs: number;
      totalCPs: number;
    }> = [];

    for (const nationState of allNationStates) {
      const nationId = nationState.ID.value;
      const controlPoints = controlPointsByNationId.get(nationId) || [];

      // Count how many CPs this faction has in this nation
      const factionCPCount = controlPoints.filter((cp) => cp.factionId === faction.id).length;

      if (factionCPCount > 0) {
        controlledNationsWithCPs.push({
          nation: nationState,
          factionCPs: factionCPCount,
          totalCPs: controlPoints.length,
        });
      }
    }

    // Aggregate histories across all controlled nations
    if (controlledNationsWithCPs.length > 0) {
      // Find the maximum history length
      const maxMCLength = Math.max(
        ...controlledNationsWithCPs.map((n) => (n.nation.historyMissionControl || []).length),
      );
      const maxBoostLength = Math.max(...controlledNationsWithCPs.map((n) => (n.nation.historyBoost || []).length));

      // Sum up histories across all nations, weighted by faction's share of CPs
      faction.nationHistory.historyMissionControl = Array.from({ length: maxMCLength }, (_, index) => {
        return controlledNationsWithCPs.reduce((sum, { nation, factionCPs, totalCPs }) => {
          const history = nation.historyMissionControl || [];
          const value = history[index] || 0;
          // Divide by total CPs and multiply by faction's CPs to get this faction's share
          return sum + (value / totalCPs) * factionCPs;
        }, 0);
      });

      faction.nationHistory.historyBoost = Array.from({ length: maxBoostLength }, (_, index) => {
        return controlledNationsWithCPs.reduce((sum, { nation, factionCPs, totalCPs }) => {
          const history = nation.historyBoost || [];
          const value = history[index] || 0;
          // Divide by total CPs and multiply by faction's CPs to get this faction's share
          return sum + (value / totalCPs) * factionCPs;
        }, 0);
      });

      // Calculate summary statistics
      const historyBoost = faction.nationHistory.historyBoost;
      const historyMC = faction.nationHistory.historyMissionControl;

      faction.nationHistory.currentBoost = historyBoost.length > 0 ? historyBoost[0] : 0;
      faction.nationHistory.currentMC = historyMC.length > 0 ? historyMC[0] : 0;

      faction.nationHistory.boostMonthlyChange =
        historyBoost.length > 0 ? historyBoost[0] - (historyBoost[historyBoost.length - 1] || 0) : 0;
      faction.nationHistory.mcMonthlyChange =
        historyMC.length > 0 ? historyMC[0] - (historyMC[historyMC.length - 1] || 0) : 0;
    }
  }

  return { factions, factionsById, playerFaction, alienFaction };
}

export interface PostProcessFactionArgs {
  factions: Awaited<ReturnType<typeof analyzeFactions>>["factions"];
  playerFaction: Awaited<ReturnType<typeof analyzeFactions>>["playerFaction"];
  councilors: Awaited<ReturnType<typeof analyzeOrgs>>["councilors"];
}

export function postProcessFactions(
  saveFile: SaveFile,
  { factions, playerFaction, councilors }: PostProcessFactionArgs,
) {
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
}
