import { CouncilorAttributes, TIOrgState } from "@/lib/savefile";
import { Administration, Boost, Command, Currency, Espionage, Influence, Investigation, Loyalty, MissionControl, Ops, Persuasion, PriorityBoost, PriorityEconomy, PriorityEnvironment, PriorityFunding, PriorityGovernment, PriorityKnowledge, PriorityMilitary, PriorityMissionControl, PriorityOppression, PrioritySpoils, PriorityUnity, PriorityWelfare, Projects, Research, Science, Security, TechIcons, TierStar } from "./icons";
import { Org } from "@/lib/templates";

export type ShowEffectsProps = Partial<
  Pick<Org, 'techBonuses'> &
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

export const ShowEffects = (props: ShowEffectsProps) => {
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
  const techBonuses = props.techBonuses || [];

  return <>
    {tier > 5 ? <>{tier} <TierStar /> </> : tier > 0 && <>{new Array(tier).fill(0).map((_, i) => <TierStar key={i} />)}</>}
    {/** TODO: how to show takeover defense? */}
    {costMoney !== 0 && <>{costMoney} <Currency/> </>}
    {costInfluence !== 0 && <>{costInfluence} <Influence/></> }
    {costOps !== 0 && <>{costOps} <Ops/> </>}
    {costBoost !== 0 && <>{costBoost} <Boost/> </>}
    {incomeMissionControl !== 0 && <>{incomeMissionControl} <MissionControl/> </>}
    {incomeResearch !== 0 && <>{incomeResearch} <Research/> </>}
    {projectCapacityGranted !== 0 && <>+{projectCapacityGranted} <Projects/> </>}
    {persuasion !== 0 && <>{persuasion} <Persuasion/> </>}
    {command !== 0 && <>{command} <Command/> </>}
    {investigation !== 0 && <>{investigation} <Investigation/> </>}
    {espionage !== 0 && <>{espionage} <Espionage/> </>}
    {administration !== 0 && <>{administration} <Administration/> </>}
    {science !== 0 && <>{science} <Science/> </>}
    {security !== 0 && <>{security} <Security/> </>}
    {apparentLoyalty !== 0 && <>{apparentLoyalty} <Loyalty/> </>}
    {loyalty !== 0 && <>{loyalty} <Loyalty/> </>}
    {priorityEconomyBonus !== 0 && <>{pct(priorityEconomyBonus)} <PriorityEconomy/> </>}
    {priorityWelfareBonus !== 0 && <>{pct(priorityWelfareBonus)} <PriorityWelfare/> </>}
    {priorityEnvironmentBonus !== 0 && <>{pct(priorityEnvironmentBonus)} <PriorityEnvironment/> </>}
    {priorityKnowledgeBonus !== 0 && <>{pct(priorityKnowledgeBonus)} <PriorityKnowledge/> </>}
    {priorityGovernmentBonus !== 0 && <>{pct(priorityGovernmentBonus)} <PriorityGovernment/> </>}
    {priorityUnityBonus !== 0 && <>{pct(priorityUnityBonus)} <PriorityUnity/> </>}
    {priorityMilitaryBonus !== 0 && <>{pct(priorityMilitaryBonus)} <PriorityMilitary/> </>}
    {priorityOppressionBonus !== 0 && <>{pct(priorityOppressionBonus)} <PriorityOppression/> </>}
    {prioritySpoilsBonus !== 0 && <>{pct(prioritySpoilsBonus)} <PrioritySpoils/> </>}
    {priorityFundingBonus !== 0 && <>{pct(priorityFundingBonus)} <PriorityFunding/> </>}
    {priorityBoostBonus !== 0 && <>{pct(priorityBoostBonus)} <PriorityBoost/> </>}
    {priorityMcBonus !== 0 && <>{pct(priorityMcBonus)} <PriorityMissionControl/> </>}
    {miningBonus !== 0 && <>{pct(miningBonus)} <Currency/> </>}

    {techBonuses.length > 0 && <>
      {techBonuses.map(({category, bonus}, index) => {
        const TechIcon = TechIcons[category as keyof typeof TechIcons];
        return TechIcon ? <span key={index}>{pct(bonus)} <TechIcon /> </span> : null;
      })}
    </>}
  </>;
};

export function combineEffects(p1: ShowEffectsProps, p2: ShowEffectsProps): ShowEffectsProps {
  const result: ShowEffectsProps = {...p1};
  for (const key in p2) {
    const k = key as keyof ShowEffectsProps;
    if (k == 'techBonuses') {
      result.techBonuses = [...[...(result.techBonuses || []), ...(p2.techBonuses || [])].reduce((acc, curr) => {
        const key = curr.category;
        const existing = acc.get(key) || 0;
        acc.set(key, existing + curr.bonus);
        return acc;
      }, new Map<string, number>()).entries().map(([category, bonus]) => ({category, bonus}) )];
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