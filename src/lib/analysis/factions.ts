import { SaveFile } from "../savefile";
import { sortByDateTime, diffDateTime, toDays, formatDateTime } from "../utils";

export function processFactions(
  saveFile: SaveFile,
  difficulty: string,
  mcMaskingTechs: Set<string>,
  projects: Map<string, any>,
  habModuleTemplates: Map<string, any>,
  lastMonth: any,
) {
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
      .filter((i: any) => i.effects?.some((ii: string) => ii.startsWith("Effect_LaunchFacilitiesPriorityBonus")) && !i.repeatable)
      .map(({ friendlyName, techCategory, researchCost, dataName }) => ({
        friendlyName,
        techCategory,
        researchCost,
        dataName,
      }));
    const availableCPProjects = availableProjects
      .filter((i: any) => i.effects?.some((ii: string) => ii.startsWith("Effect_ControlPointMaintenanceBonus")) && !i.repeatable)
      .map(({ friendlyName, techCategory, researchCost, dataName, effects }) => {
        // Extract the CP bonus from the effect string (e.g., "Effect_ControlPointMaintenanceBonus10" -> 10)
        const cpEffect = effects?.find((e: string) => e.startsWith("Effect_ControlPointMaintenanceBonus"));
        const cpBonus = cpEffect ? parseInt(cpEffect.replace("Effect_ControlPointMaintenanceBonus", "") || "0") : 0;

        // Find current progress for this project
        const progress = faction.currentProjectProgress.find((p: any) => p.projectTemplateName === dataName);

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
      .filter((i: any) => i.effects?.some((ii: string) => ii.startsWith("Effect_MaxOrgBonus")) && !i.repeatable)
      .map(({ friendlyName, techCategory, researchCost, dataName, effects }) => {
        // Extract the org bonus from the effect string (e.g., "Effect_MaxOrgBonus1" -> 1)
        const orgEffect = effects?.find((e: string) => e.startsWith("Effect_MaxOrgBonus"));
        const orgBonus = orgEffect ? parseInt(orgEffect.replace("Effect_MaxOrgBonus", "") || "0") : 0;

        return {
          friendlyName,
          techCategory,
          researchCost,
          dataName,
          orgBonus,
        };
      });
    const availableExpandNationProjects = availableProjects
      .filter(
        (i: any) =>
          i.effects?.some(
            (ii: string) =>
              ii.startsWith("Effect_UnlockExpandEconomyTier") ||
              ii.startsWith("Effect_UnlockExpandKnowledgeTier") ||
              ii.startsWith("Effect_UnlockExpandMilitaryTier") ||
              ii.startsWith("Effect_UnlockExpandWelfareTier") ||
              ii.startsWith("Effect_UnlockExpandUnityTier"),
          ) && !i.repeatable,
      )
      .map(({ friendlyName, techCategory, researchCost, dataName, requiredNationTier }: any) => {
        // Find current progress for this project
        const progress = faction.currentProjectProgress.find((p: any) => p.projectTemplateName === dataName);

        return {
          friendlyName,
          techCategory,
          researchCost,
          dataName,
          currentProgress: progress?.accumulatedResearch || 0,
          requiresNation: requiredNationTier || "",
        };
      });

    return {
      id: faction.ID.value,
      templateName: faction.templateName,
      displayName: faction.displayName,
      ideology: (faction as any).ideology || "",
      color: (faction as any).color || "",
      councilorIds: faction.councilors.map((i) => i.value),
      availableCouncilorIds: faction.availableCouncilors.map((i) => i.value),
      unassignedOrgIds: faction.unassignedOrgs.map((i) => i.value),
      availableOrgIds: faction.availableOrgs.map((i) => i.value),
      intel: new Map((faction.intel || []).map((i) => [i.Key.value, i.Value])),
      highestIntel: new Map((faction.highestIntel || []).map((i) => [i.Key.value, i.Value])),
      lastRecordedLoyalty: new Map((faction.lastRecordedLoyalty || []).map((i) => [i.Key.value, i.Value])),
      currentProjectProgress: faction.currentProjectProgress,
      finishedProjectNames: faction.finishedProjectNames,
      milestones: faction.milestones,
      shipDesigns: faction.shipDesigns.map((design: any) => ({
        dataName: design.dataName,
        shipHull: design.hullName,
        weapons: design.weapons,
        utilities: design.utilities,
      })),
      currentTransactionSummary: [
        ...Object.entries(faction.Transactions)
          .flatMap(([source, transactions]) =>
            transactions.map((t) => ({
              source,
              resource: t.Resource,
              amount: t.Amount,
              date: t.Date,
            })),
          )
          .filter((t) => toDays(diffDateTime(t.date, lastMonth)) < 30)
          .reduce(
            (acc, t) => {
              const key = `${t.source}||${t.resource}`;
              const existing = acc.get(key) || { source: t.source, resource: t.resource, amount: 0 };
              existing.amount += t.amount;
              acc.set(key, existing);
              return acc;
            },
            new Map<string, { source: string; resource: string; amount: number }>(),
          )
          .values(),
      ],
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
          .reduce(
            (acc, t) => {
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
            },
            new Map<
              string,
              { source: string; resource: string; amount: number; transactions: { date: string; amount: number }[] }
            >(),
          )
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
  const shipDesignsByDataName = new Map<string, (typeof factions)[0]["shipDesigns"][0]>(
    factions.flatMap((faction) => faction.shipDesigns).map((design) => [design.dataName, design]),
  );

  return { factions, factionsById, shipDesignsByDataName };
}
