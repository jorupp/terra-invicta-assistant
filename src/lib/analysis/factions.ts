import { SaveFile } from "../savefile";
import { templates } from "../templates";
import { diffDateTime, formatDateTime, sortByDateTime, toDays } from "../utils";
import { analyzeNations } from "./nations";
import { analyzeResearch } from "./research";

export interface AnalyzeFactionArgs {
  projects: Awaited<ReturnType<typeof analyzeResearch>>["projects"];
  controlPoints: ReturnType<typeof analyzeNations>["controlPoints"];
  habModuleTemplates: Map<string, Awaited<ReturnType<typeof templates.habModules>>[0]>;
  playerFactionId: number;
}

export async function analyzeFactions(
  saveFile: SaveFile,
  { projects, controlPoints, habModuleTemplates, playerFactionId }: AnalyzeFactionArgs,
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
  const shipDesignsByDataName = new Map<string, (typeof factions)[0]["shipDesigns"][0]>(
    factions.flatMap((faction) => faction.shipDesigns).map((design) => [design.dataName, design]),
  );
  return { factions, factionsById, playerFaction, shipDesignsByDataName };
}
