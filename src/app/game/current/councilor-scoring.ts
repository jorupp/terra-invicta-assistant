import type { ShowEffectsProps } from "@/components/showEffects";
import type { MissionDataName } from "@/lib/template-types-generated";
import type { Analysis } from "@/lib/analysis";
import type { ScoringWeights } from "./scoringWeights";

export interface ScoreResult {
  value: number;
  noMissionScore: number;
  details: string;
}

export function scoreAndSort<T>(
  items: T[],
  weights: ScoringWeights,
  haveMissions: Map<MissionDataName, number>,
  scoreFn: (item: T, weights: ScoringWeights, haveMissions: Map<MissionDataName, number>) => ScoreResult,
  scoreSort: "value" | "noMissionScore" = "value"
) {
  const scoredItems = items.map((item) => {
    const scoreResult = scoreFn(item, weights, haveMissions);
    return { ...item, score: scoreResult };
  });
  scoredItems.sort((a, b) => b.score[scoreSort] - a.score[scoreSort]);
  return scoredItems;
}

export function getBaseCouncilorScore(
  councilor: Analysis["playerCouncilors"][number],
  weights: ScoringWeights,
  haveMissions: Map<MissionDataName, number>
): ScoreResult {
  return getScore(councilor.effectsBaseAndUnaugmentedTraits, weights, haveMissions, true);
}

export function getModifiedCouncilorScore(
  councilor: Analysis["playerCouncilors"][number],
  weights: ScoringWeights,
  haveMissions: Map<MissionDataName, number>
): ScoreResult {
  return getScore(councilor.effectsWithOrgsAndAugments, weights, haveMissions, true);
}

export const orgTransferFactor = 0.2;

export function getOrganizationScore(
  org: Analysis["playerAvailableOrgs"][number] & { type: string },
  weights: ScoringWeights,
  haveMissions: Map<MissionDataName, number>
): ScoreResult {
  return getScore(
    {
      ...org,
      techBonuses: org.template?.techBonuses,
      missionsGrantedNames: org.template?.missionsGrantedNames || [],
      ...(org.type === "available"
        ? {}
        : {
            // already-purchased orgs seem to cost ~30% to transfer
            costMoney: (org.costMoney || 0) * orgTransferFactor,
            costInfluence: (org.costInfluence || 0) * orgTransferFactor,
            costOps: (org.costOps || 0) * orgTransferFactor,
            costBoost: (org.costBoost || 0) * orgTransferFactor,
          }),
    },
    weights,
    haveMissions
  );
}

export function getScore(
  org: ShowEffectsProps,
  weights: ScoringWeights,
  haveMissions: Map<MissionDataName, number>,
  ignoreTier: boolean = false
): ScoreResult {
  let totalScore = 0;
  const details: string[] = [];

  // Helper to add score for a numeric attribute
  const addScore = (name: string, value: number | undefined, weight: number | undefined, noNegative?: boolean) => {
    let actualValue = value || 0;
    if (noNegative) {
      actualValue = Math.max(0, actualValue);
    }
    const actualWeight = weight ?? 0;

    // Skip if value or weight is 0/undefined/null
    if (!actualValue || !actualWeight) return;

    const contribution = actualValue * actualWeight;
    totalScore += contribution;
    details.push(
      `${name}: ${parseFloat(actualValue.toFixed(2))} × ${parseFloat(actualWeight.toFixed(3))} = ${contribution.toFixed(
        3
      )}`
    );
  };

  // Councilor attributes
  addScore("persuasion", org.persuasion, weights.persuasion, true);
  addScore("command", org.command, weights.command, true);
  addScore("investigation", org.investigation, weights.investigation, true);
  addScore("espionage", org.espionage, weights.espionage, true);
  addScore("administration", org.administration, weights.administration, true);
  addScore("science", org.science, weights.science, true);
  addScore("security", org.security, weights.security, true);
  addScore("Persuasion", org.Persuasion, weights.persuasion, true);
  addScore("Command", org.Command, weights.command, true);
  addScore("Investigation", org.Investigation, weights.investigation, true);
  addScore("Espionage", org.Espionage, weights.espionage, true);
  addScore("Administration", org.Administration, weights.administration, true);
  addScore("Science", org.Science, weights.science, true);
  addScore("Security", org.Security, weights.security, true);
  addScore("xpModifier", org.xpModifier, weights.xpModifier);
  addScore("xp", org.xp, weights.xp);

  // Monthly income/costs
  addScore("incomeBoost_month", org.incomeBoost_month, weights.incomeBoost_month);
  addScore("incomeMoney_month", org.incomeMoney_month, weights.incomeMoney_month);
  addScore("incomeInfluence_month", org.incomeInfluence_month, weights.incomeInfluence_month);
  addScore("incomeOps_month", org.incomeOps_month, weights.incomeOps_month);
  addScore("incomeMissionControl", org.incomeMissionControl, weights.incomeMissionControl);
  addScore("incomeResearch_month", org.incomeResearch_month, weights.incomeResearch_month);
  addScore("projectCapacityGranted", org.projectCapacityGranted, weights.projectCapacityGranted);

  // Purchase costs
  addScore("costMoney", org.costMoney, weights.costMoney);
  addScore("costInfluence", org.costInfluence, weights.costInfluence);
  addScore("costOps", org.costOps, weights.costOps);
  addScore("costBoost", org.costBoost, weights.costBoost);

  // Priority bonuses
  addScore("economyBonus", org.economyBonus, weights.economyBonus);
  addScore("welfareBonus", org.welfareBonus, weights.welfareBonus);
  addScore("environmentBonus", org.environmentBonus, weights.environmentBonus);
  addScore("knowledgeBonus", org.knowledgeBonus, weights.knowledgeBonus);
  addScore("governmentBonus", org.governmentBonus, weights.governmentBonus);
  addScore("unityBonus", org.unityBonus, weights.unityBonus);
  addScore("militaryBonus", org.militaryBonus, weights.militaryBonus);
  addScore("oppressionBonus", org.oppressionBonus, weights.oppressionBonus);
  addScore("spoilsBonus", org.spoilsBonus, weights.spoilsBonus);
  addScore("spaceDevBonus", org.spaceDevBonus, weights.spaceDevBonus);
  addScore("spaceflightBonus", org.spaceflightBonus, weights.spaceflightBonus);
  addScore("MCBonus", org.MCBonus, weights.MCBonus);
  addScore("miningBonus", org.miningBonus, weights.miningBonus);

  // Tech bonuses from councilor/traits
  if (weights.councilorTechBonus && org?.councilorTechBonus) {
    for (const { category, bonus } of org.councilorTechBonus) {
      const weight = weights.councilorTechBonus[category];
      addScore(`councilorTechBonus[${category}]`, bonus, weight);
    }
  }

  // Tech bonuses from orgs
  if (weights.techBonuses && org?.techBonuses) {
    for (const { category, bonus } of org.techBonuses) {
      const weight = weights.techBonuses[category];
      addScore(`techBonus[${category}]`, bonus, weight);
    }
  }

  let noMissionScore = totalScore;

  // Missions granted
  if (weights.missions && org?.missionsGrantedNames) {
    for (const missionName of org.missionsGrantedNames) {
      const weight = weights.missions[missionName];
      addScore(`mission[${missionName}]`, 1, weight);

      // Extra weight for missions we don't have yet or only have one councilor for
      if (weights.extraWeightForMissingMissions && (haveMissions.get(missionName) || 0) === 0) {
        totalScore += weights.extraWeightForMissingMissions;
        details.push(
          `mission[${missionName}]: missing bonus × ${parseFloat(
            weights.extraWeightForMissingMissions.toFixed(3)
          )} = ${weights.extraWeightForMissingMissions.toFixed(3)}`
        );
      }
      if (weights.extraWeightForSingleMissions && (haveMissions.get(missionName) || 0) === 1) {
        totalScore += weights.extraWeightForSingleMissions;
        details.push(
          `mission[${missionName}]: single bonus × ${parseFloat(
            weights.extraWeightForSingleMissions.toFixed(3)
          )} = ${weights.extraWeightForSingleMissions.toFixed(3)}`
        );
      }
    }
  }

  // Divide by tier to normalize for org cost/power
  const tier = org.tier || 1;
  let finalScore = totalScore;

  if (tier > 1 && !ignoreTier) {
    const tierFactor = Math.pow(tier, weights.orgTierExponent);
    finalScore = totalScore / tierFactor;
    noMissionScore /= tierFactor;
    details.push(`Subtotal: ${totalScore.toFixed(3)}`);
    details.push(`Divided by ${tierFactor.toFixed(2)} for tier ${tier}: ${finalScore.toFixed(3)}`);
  }

  return {
    value: finalScore,
    noMissionScore,
    details: details.join("\n"),
  };
}
