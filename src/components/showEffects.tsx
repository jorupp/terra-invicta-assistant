import { CouncilorAttributes, TIOrgState } from "@/lib/savefile";
import { Administration, Boost, Command, Currency, Espionage, Influence, Investigation, Loyalty, MiningBonus, MissionControl, MissionIcons, Ops, Persuasion, PriorityBoost, PriorityEconomy, PriorityEnvironment, PriorityFunding, PriorityGovernment, PriorityKnowledge, PriorityMilitary, PriorityMissionControl, PriorityOppression, PrioritySpoils, PriorityUnity, PriorityWelfare, Projects, Research, Science, Security, TechIcons, TierStar, TraitCriminal, TraitGovernment, UnknownIcon } from "./icons";
import {  CouncilorTypeDataName,  MissionDataName, Org, TechCategory, TraitDataName } from "@/lib/templates";
import { twMerge } from "tailwind-merge";
import { governmentCriminalGroupTraits, typesCanHaveCriminal, typesCanHaveGovernment } from "@/lib/template-types";

export type ShowEffectsProps = Partial<
  { xpModifier: number, xp: number } &
  Pick<Org, 'techBonuses' | 'missionsGrantedNames'> &
  { councilorTechBonus?: Array<{ category: TechCategory; bonus: number }>, traitTemplateNames: TraitDataName[], typeTemplateName: CouncilorTypeDataName } &
  CouncilorAttributes &
    Pick<
      TIOrgState,
      | "tier"
      | "takeoverDefense"
      | "costMoney"
      | "costInfluence"
      | "costOps"
      | "costBoost"
      | "incomeMoney_month"
      | "incomeInfluence_month"
      | "incomeOps_month"
      | "incomeBoost_month"
      | "incomeMissionControl"
      | "incomeResearch_month"
      | "projectCapacityGranted"
      | "persuasion"
      | "command"
      | "investigation"
      | "espionage"
      | "administration"
      | "science"
      | "security"
      | "economyBonus"
      | "welfareBonus"
      | "environmentBonus"
      | "knowledgeBonus"
      | "governmentBonus"
      | "unityBonus"
      | "militaryBonus"
      | "oppressionBonus"
      | "spoilsBonus"
      | "spaceDevBonus"
      | "spaceflightBonus"
      | "MCBonus"
      | "miningBonus"
    >
>;

export const ShowEffects = (props: ShowEffectsProps & { highlightMissionClassName?: (missionName: MissionDataName) => string | undefined, highlightTier?: boolean }) => {
  const tier = props.tier || 0;
  const takeoverDefense = props.takeoverDefense || 0;
  const costMoney = (props.costMoney || 0) + (props.incomeMoney_month || 0);
  const costInfluence = (props.costInfluence || 0) + (props.incomeInfluence_month || 0);
  const costOps = (props.costOps || 0) + (props.incomeOps_month || 0);
  const costBoost = (props.costBoost || 0) + (props.incomeBoost_month || 0);
  const incomeMissionControl = props.incomeMissionControl || 0;
  const incomeResearch = props.incomeResearch_month || 0;
  const projectCapacityGranted = props.projectCapacityGranted || 0;
  const persuasion = (props.persuasion || 0) + (props.Persuasion || 0);
  const command = (props.command || 0) + (props.Command || 0);
  const investigation = (props.investigation || 0) + (props.Investigation || 0);
  const espionage = (props.espionage || 0) + (props.Espionage || 0);
  const administration = (props.administration || 0) + (props.Administration || 0);
  const science = (props.science || 0) + (props.Science || 0);
  const security = (props.security || 0) + (props.Security || 0);
  const apparentLoyalty = props.ApparentLoyalty || 0;
  const loyalty = props.Loyalty || 0;
  const xpModifier = props.xpModifier || 0;
  const xp = props.xp || 0;
  const priorityEconomyBonus = props.economyBonus || 0;
  const priorityWelfareBonus = props.welfareBonus || 0;
  const priorityEnvironmentBonus = props.environmentBonus || 0;
  const priorityKnowledgeBonus = props.knowledgeBonus || 0;
  const priorityGovernmentBonus = props.governmentBonus || 0;
  const priorityUnityBonus = props.unityBonus || 0;
  const priorityMilitaryBonus = props.militaryBonus || 0;
  const priorityOppressionBonus = props.oppressionBonus || 0;
  const prioritySpoilsBonus = props.spoilsBonus || 0;
  const priorityFundingBonus = props.spaceDevBonus || 0;
  const priorityMcBonus = props.MCBonus || 0;
  const priorityBoostBonus = props.spaceflightBonus || 0;
  const miningBonus = props.miningBonus || 0;
  const councilorTechBonus = props.councilorTechBonus || [];
  const techBonuses = props.techBonuses || [];
  const missionsGrantedNames = props.missionsGrantedNames || [];
  const spacer = <span className="mx-0.5"> </span>;
  const isGovernment = (props.traitTemplateNames || []).includes("Government");
  const canHaveGovernment = props.typeTemplateName && typesCanHaveGovernment.includes(props.typeTemplateName) && 
    !(props.traitTemplateNames || []).some(t => governmentCriminalGroupTraits.includes(t));
  const isCriminal = (props.traitTemplateNames || []).includes("Criminal");
  const canHaveCriminal = props.typeTemplateName && typesCanHaveCriminal.includes(props.typeTemplateName) &&
    !(props.traitTemplateNames || []).some(t => governmentCriminalGroupTraits.includes(t));

  return <>
    {(tier > 3 || props.highlightTier)
      ? <span className={twMerge(props.highlightTier ? "bg-green-300 rounded p-1 pr-0" : undefined)}>{tier} <TierStar />{spacer}</span>
      : tier > 0 && <>{new Array(tier).fill(0).map((_, i) => <TierStar key={i} />)}{spacer}</>}
    {/** TODO: how to show takeover defense? */}
    {costMoney !== 0 && <><Currency/> {costMoney}{spacer}</>}
    {costInfluence !== 0 && <><Influence/> {costInfluence}{spacer}</>}
    {costOps !== 0 && <><Ops/> {costOps}{spacer}</>}
    {costBoost !== 0 && <><Boost/> {costBoost}{spacer}</>}
    {incomeMissionControl !== 0 && <><MissionControl/> {incomeMissionControl}{spacer}</>}
    {incomeResearch !== 0 && <><Research/> {incomeResearch}{spacer}</>}
    {projectCapacityGranted !== 0 && <><Projects/> {projectCapacityGranted}{spacer}</>}
    {persuasion !== 0 && <><Persuasion/> {persuasion}{spacer}</>}
    {command !== 0 && <><Command/> {command}{spacer}</>}
    {investigation !== 0 && <><Investigation/> {investigation}{spacer}</>}
    {espionage !== 0 && <><Espionage/> {espionage}{spacer}</>}
    {administration !== 0 && <><Administration/> {administration}{spacer}</>}
    {science !== 0 && <><Science/> {science}{spacer}</>}
    {security !== 0 && <><Security/> {security}{spacer}</>}
    {apparentLoyalty !== 0 && <><Loyalty/> {apparentLoyalty}{spacer}</>}
    {loyalty !== 0 && <><Loyalty/> {loyalty}{spacer}</>}
    {xpModifier !== 0 && <>{pct(xpModifier)} XP {spacer}</>}
    {xp !== 0 && <><span className={twMerge((1 + (xpModifier || 0)) * 20 <= xp ? 'bg-green-300 rounded px-1' : null)}>{xp} XP</span>{spacer}</>}
    {isGovernment ? <><TraitGovernment /> {spacer}</> : canHaveGovernment && <><TraitGovernment strokeClass="stroke-yellow-500" /> {spacer}</>}
    {isCriminal ? <><TraitCriminal /> {spacer}</> : canHaveCriminal && <><TraitCriminal strokeClass="stroke-yellow-500" /> {spacer}</>}

    {priorityEconomyBonus !== 0 && <><PriorityEconomy/> {pct(priorityEconomyBonus)}{spacer}</>}
    {priorityWelfareBonus !== 0 && <><PriorityWelfare/> {pct(priorityWelfareBonus)}{spacer}</>}
    {priorityEnvironmentBonus !== 0 && <><PriorityEnvironment/> {pct(priorityEnvironmentBonus)}{spacer}</>}
    {priorityKnowledgeBonus !== 0 && <><PriorityKnowledge/> {pct(priorityKnowledgeBonus)}{spacer}</>}
    {priorityGovernmentBonus !== 0 && <><PriorityGovernment/> {pct(priorityGovernmentBonus)}{spacer}</>}
    {priorityUnityBonus !== 0 && <><PriorityUnity/> {pct(priorityUnityBonus)}{spacer}</>}
    {priorityMilitaryBonus !== 0 && <><PriorityMilitary/> {pct(priorityMilitaryBonus)}{spacer}</>}
    {priorityOppressionBonus !== 0 && <><PriorityOppression/> {pct(priorityOppressionBonus)}{spacer}</>}
    {prioritySpoilsBonus !== 0 && <><PrioritySpoils/> {pct(prioritySpoilsBonus)}{spacer}</>}
    {priorityFundingBonus !== 0 && <><PriorityFunding/> {pct(priorityFundingBonus)}{spacer}</>}
    {priorityBoostBonus !== 0 && <><PriorityBoost/> {pct(priorityBoostBonus)}{spacer}</>}
    {priorityMcBonus !== 0 && <><PriorityMissionControl/> {pct(priorityMcBonus)}{spacer}</>}
    {miningBonus !== 0 && <><MiningBonus/> {pct(miningBonus)}{spacer}</>}

    {councilorTechBonus.length > 0 && <>
      {councilorTechBonus.map(({category, bonus}, index) => {
        const TechIcon = TechIcons[category as keyof typeof TechIcons];
        if (!TechIcon) {
          console.log("Unknown tech category:", category);
          return <span key={index}>{pct(bonus)} <UnknownIcon className="border-green-500 border" title={`Unknown: ${category}`} />{spacer}</span>;
        }
        return <span key={index}>{pct(bonus)} <TechIcon className="border-green-500 border" />{spacer}</span>;
      })}
    </>}

    {techBonuses.length > 0 && <>
      {techBonuses.map(({category, bonus}, index) => {
        const TechIcon = TechIcons[category as keyof typeof TechIcons];
        if (!TechIcon) {
          console.log("Unknown tech category:", category);
          return <span key={index}>{pct(bonus)} <UnknownIcon title={`Unknown: ${category}`} />{spacer}</span>;
        }
        return <span key={index}>{pct(bonus)} <TechIcon />{spacer}</span>;
      })}
    </>}

    {missionsGrantedNames.length > 0 && <>
      {missionsGrantedNames.map((mission, index) => {
        const MissionIcon = MissionIcons[mission as keyof typeof MissionIcons];
        if (!MissionIcon) {
          console.log("Unknown mission name:", mission);
          return <span key={index}><UnknownIcon title={`Unknown: ${mission}`} />{spacer}</span>;
        }
        return <span key={index}><MissionIcon className={props.highlightMissionClassName?.(mission)} />{spacer}</span>;
      })}
    </>}
  </>;
};

export function combineEffects(p1: ShowEffectsProps, p2: ShowEffectsProps): ShowEffectsProps {
  const result: ShowEffectsProps = {...p1};
  for (const key in p2) {
    const k = key as keyof ShowEffectsProps;
    if (k === 'councilorTechBonus') {
      result.councilorTechBonus = [...[...(result.councilorTechBonus || []), ...(p2.councilorTechBonus || [])].reduce((acc, curr) => {
        const key = curr.category;
        const existing = acc.get(key) || 0;
        acc.set(key, existing + curr.bonus);
        return acc;
      }, new Map<TechCategory, number>()).entries().map(([category, bonus]) => ({category, bonus}) )];
    }
    else if (k === 'techBonuses') {
      result.techBonuses = [...[...(result.techBonuses || []), ...(p2.techBonuses || [])].reduce((acc, curr) => {
        const key = curr.category;
        const existing = acc.get(key) || 0;
        acc.set(key, existing + curr.bonus);
        return acc;
      }, new Map<TechCategory, number>()).entries().map(([category, bonus]) => ({category, bonus}) )];
    }
    else if (k === 'missionsGrantedNames') {
      result.missionsGrantedNames = [...new Set([...(result.missionsGrantedNames || []), ...(p2.missionsGrantedNames || [])])];
    }
    else if (k === 'traitTemplateNames') {
      result.traitTemplateNames = [...new Set([...(result.traitTemplateNames || []), ...(p2.traitTemplateNames || [])])];
    }
    else if (k === 'typeTemplateName') {
      result.typeTemplateName = result.typeTemplateName || p2.typeTemplateName;
    }
    else if (typeof p2[k] === "number") {
      result[k] = (result[k] || 0) + (p2[k] || 0);
    }
  }
  return result;
}

function pct(value: number) {
  return (value * 100).toFixed(0) + "%";
}