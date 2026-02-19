import { combineEffects, ShowEffectsProps } from "@/components/showEffects";
import { MissionDataName } from "../templates";

export interface CouncilorTraitTemplate {
  dataName: string;
  friendlyName: string;
  xpCost?: number;
  xpModifier?: number;
  upgradesFrom?: string;
  boostCost?: number;
  opsCost?: number;
  detectionEspBonus?: number;
  incomeBoost?: number;
  incomeInfluence?: number;
  incomeMoney?: number;
  incomeResearch?: number;
  priorityBonuses?: { priority?: string; bonus?: number }[];
  statMods?: { stat?: string; operation?: string; strValue?: string; condition?: any }[];
  techBonuses?: any;
  missionsGrantedNames?: MissionDataName[];
  tags?: string[];
}

export interface CouncilorOrg {
  template?: { techBonuses?: any; missionsGrantedNames?: MissionDataName[] };
  [key: string]: any;
}

export function computeCouncilorEffects(
  attributes: ShowEffectsProps,
  traitTemplates: CouncilorTraitTemplate[],
  councilorOrgs: CouncilorOrg[],
): { effectsBaseAndUnaugmentedTraits: ShowEffectsProps; effectsWithOrgsAndAugments: ShowEffectsProps } {
  function addTraits(effects: ShowEffectsProps, traits: CouncilorTraitTemplate[]): ShowEffectsProps {
    // Add trait effects
    let finalEffects = traits.reduce<ShowEffectsProps>(
      (acc, trait) => {
        return combineEffects(acc, {
          incomeMoney_month: trait?.incomeMoney,
          incomeBoost_month: trait?.incomeBoost,
          incomeInfluence_month: trait?.incomeInfluence,
          incomeResearch_month: trait?.incomeResearch,
          councilorTechBonus: trait?.techBonuses,
          missionsGrantedNames: trait?.missionsGrantedNames,
          xpModifier: trait?.xpModifier,
        });
      },
      { ...effects },
    );

    // Apply trait statMods and priorityBonuses
    for (const trait of traits) {
      for (const { stat, operation, strValue, condition } of trait.statMods || []) {
        if (stat && strValue && !condition && operation === "Additive") {
          (finalEffects as any)[stat] = ((finalEffects as any)[stat] || 0) + Number(strValue);
        }
        if (stat === "Loyalty" && strValue && !condition && operation === "Additive") {
          (finalEffects as any)["maxLoyalty"] = ((finalEffects as any)["maxLoyalty"] || 0) + Number(strValue);
        }
      }
      for (const { priority, bonus } of trait.priorityBonuses || []) {
        if (priority && bonus) {
          const key = `${priority[0].toLowerCase()}${priority.substring(1)}Bonus` as keyof ShowEffectsProps;
          (finalEffects as any)[key] = ((finalEffects as any)[key] || 0) + bonus;
        }
      }
    }
    for (const trait of traits) {
      for (const { stat, operation, strValue, condition } of trait.statMods || []) {
        if (stat && strValue && !condition && operation === "SetToAnotherAttribute") {
          (finalEffects as any)[stat] = (finalEffects as any)[strValue] || 0;
        }
      }
    }
    return finalEffects;
  }

  // Start with base attributes
  const effectsBaseAndUnaugmentedTraits = addTraits(
    { ...attributes, maxLoyalty: 25 },
    traitTemplates.filter((t) => !(t.tags || []).includes("Augmented")),
  );

  const effectsWithAugments = addTraits(
    effectsBaseAndUnaugmentedTraits,
    traitTemplates.filter((t) => (t.tags || []).includes("Augmented")),
  );

  // Add org effects to create the full effects value
  const effectsWithOrgsAndAugments = councilorOrgs.reduce<ShowEffectsProps>((acc, org) => {
    return combineEffects(acc, {
      ...org,
      techBonuses: org.template?.techBonuses,
      missionsGrantedNames: org.template?.missionsGrantedNames,
    });
  }, effectsWithAugments);

  return { effectsBaseAndUnaugmentedTraits, effectsWithOrgsAndAugments };
}
