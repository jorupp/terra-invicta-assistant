import { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

// import { Beaker, DollarSign, LucideProps, Rocket, SatelliteDish, Settings, Sword, TowerControl } from "lucide-react";

// const config = (props: Omit<LucideProps, "ref">, className?: string) => ({
//   ...props,
//   className: twMerge("inline h-4 w-4 -mt-1", className, props.className),
// });

// export const Money = (props: Omit<LucideProps, "ref">) => <DollarSign {...config(props)} />;
// export const Influence = (props: Omit<LucideProps, "ref">) => <TowerControl {...config(props)} />;
// export const Ops = (props: Omit<LucideProps, "ref">) => <Sword {...config(props)} />;
// export const Boost = (props: Omit<LucideProps, "ref">) => <Rocket {...config(props)} />;
// export const Research = (props: Omit<LucideProps, "ref">) => <Beaker {...config(props)} />;
// export const MissionControl = (props: Omit<LucideProps, "ref">) => <SatelliteDish {...config(props)} />;
// export const Gears = (props: Omit<LucideProps, "ref">) => <Settings {...config(props)} />;
// export const ProjectCapacity = Gears;

// export const Persuasion = (props: Omit<LucideProps, "ref">) => <DollarSign {...config(props)} />;

const buildIcon = (name: string, src: string) => {
  const Icon = (props: ComponentProps<"img">) => (
    <img src={src} title={name} {...props} className={twMerge("inline h-4 w-4 -mt-1", props.className)} />
  );
  Icon.DisplayName = name;
  return Icon;
};

export const Currency = buildIcon("Money", "https://wiki.hoodedhorse.com/images/mbhh_ti/8/80/ICO_currency.png");
export const Influence = buildIcon("Influence", "https://wiki.hoodedhorse.com/images/mbhh_ti/3/35/ICO_influence.png");
export const Ops = buildIcon("Ops", "https://wiki.hoodedhorse.com/images/mbhh_ti/a/a7/ICO_ops.png");
export const Boost = buildIcon("Boost", "https://wiki.hoodedhorse.com/images/mbhh_ti/1/17/ICO_boost.png");
export const MissionControl = buildIcon("MissionControl", "https://wiki.hoodedhorse.com/images/mbhh_ti/d/da/ICO_mission_control.png");
export const Research = buildIcon("Research", "https://wiki.hoodedhorse.com/images/mbhh_ti/3/36/ICO_research.png");
export const Projects = buildIcon("Projects", "https://wiki.hoodedhorse.com/images/mbhh_ti/6/6b/ICO_projects.png");
export const Gears = Projects;
export const ControlPoint = buildIcon("ControlPoint", "https://wiki.hoodedhorse.com/images/mbhh_ti/f/f9/ICO_ControlPoint_empty.png");
export const Water = buildIcon("Water", "https://wiki.hoodedhorse.com/images/mbhh_ti/9/90/ICO_water.png");
export const Volatiles = buildIcon("Volatiles", "https://wiki.hoodedhorse.com/images/mbhh_ti/c/cc/ICO_volatiles.png");
export const Metals = buildIcon("Metals", "https://wiki.hoodedhorse.com/images/mbhh_ti/a/a3/ICO_metal.png");
export const Nobles = buildIcon("Nobles", "https://wiki.hoodedhorse.com/images/mbhh_ti/9/95/ICO_metal_noble.png");
export const Fissiles = buildIcon("Fissiles", "https://wiki.hoodedhorse.com/images/mbhh_ti/d/db/ICO_fissile.png");
export const Exotics = buildIcon("Exotics", "https://wiki.hoodedhorse.com/images/mbhh_ti/a/a6/ICO_exotics.png");
export const Antimatter = buildIcon("Antimatter", "https://wiki.hoodedhorse.com/images/mbhh_ti/3/38/ICO_antimatter.png");
export const Persuasion = buildIcon("Persuasion", "https://wiki.hoodedhorse.com/images/mbhh_ti/4/4c/ICO_persuasion.png");
export const Investigation = buildIcon("Investigation", "https://wiki.hoodedhorse.com/images/mbhh_ti/7/77/ICO_investigation.png");
export const Espionage = buildIcon("Espionage", "https://wiki.hoodedhorse.com/images/mbhh_ti/5/56/ICO_espionage.png");
export const Command = buildIcon("Command", "https://wiki.hoodedhorse.com/images/mbhh_ti/f/fe/ICO_command.png");
export const Administration = buildIcon("Administration", "https://wiki.hoodedhorse.com/images/mbhh_ti/2/22/ICO_administration.png");
export const Science = buildIcon("Science", "https://wiki.hoodedhorse.com/images/mbhh_ti/3/34/ICO_science.png");
export const Security = buildIcon("Security", "https://wiki.hoodedhorse.com/images/mbhh_ti/4/45/ICO_security.png");
export const Loyalty = buildIcon("Loyalty", "https://wiki.hoodedhorse.com/images/mbhh_ti/5/5e/ICO_loyalty.png");
export const TechEnergy = buildIcon("Tech: Energy", "https://wiki.hoodedhorse.com/images/mbhh_ti/a/af/Tech_energy_icon.png");
export const TechMaterial = buildIcon("Tech: Material", "https://wiki.hoodedhorse.com/images/mbhh_ti/d/dd/Tech_material_icon.png");
export const TechSpace = buildIcon("Tech: Space", "https://wiki.hoodedhorse.com/images/mbhh_ti/d/d1/Tech_space_icon.png");
export const TechLife = buildIcon("Tech: Life", "https://wiki.hoodedhorse.com/images/mbhh_ti/b/b5/Tech_life_icon.png");
export const TechSocial = buildIcon("Tech: Social", "https://wiki.hoodedhorse.com/images/mbhh_ti/d/dc/Tech_social_icon.png");
export const TechMilitary = buildIcon("Tech: Military", "https://wiki.hoodedhorse.com/images/mbhh_ti/9/9c/Tech_military_icon.png");
export const TechInfo = buildIcon("Tech: Info", "https://wiki.hoodedhorse.com/images/mbhh_ti/0/00/Tech_info_icon.png");
export const TechXeno = buildIcon("Tech: Xeno", "https://wiki.hoodedhorse.com/images/mbhh_ti/5/50/Tech_xeno_icon.png");
export const PriorityEconomy = buildIcon("Priority: Economy", "https://wiki.hoodedhorse.com/images/mbhh_ti/9/92/ICO_economy_priority.png");
export const PriorityEnvironment = buildIcon("Priority: Environment", "https://wiki.hoodedhorse.com/images/mbhh_ti/8/8e/ICO_environment_priority.png");
export const PriorityWelfare = buildIcon("Priority: Welfare", "https://wiki.hoodedhorse.com/images/mbhh_ti/6/61/ICO_welfare_priority.png");
export const PriorityKnowledge = buildIcon("Priority: Knowledge", "https://wiki.hoodedhorse.com/images/mbhh_ti/0/00/ICO_knowledge_priority.png");
export const PriorityGovernment = buildIcon("Priority: Government", "https://wiki.hoodedhorse.com/images/mbhh_ti/e/e4/ICO_government_priority.png");
export const PriorityUnity = buildIcon("Priority: Unity", "https://wiki.hoodedhorse.com/images/mbhh_ti/7/7e/ICO_unity_priority.png");
export const PriorityOppression = buildIcon("Priority: Oppression", "https://wiki.hoodedhorse.com/images/mbhh_ti/b/bc/ICO_oppression_priority.png");
export const PrioritySpoils = buildIcon("Priority: Spoils", "https://wiki.hoodedhorse.com/images/mbhh_ti/b/b2/ICO_spoils_priority.png");
export const PriorityMilitary = buildIcon("Priority: Military", "https://wiki.hoodedhorse.com/images/mbhh_ti/a/a6/ICO_military_priority.png");
export const MiningBonus = buildIcon("Mining Bonus", "https://wiki.hoodedhorse.com/images/mbhh_ti/f/f7/ICO_core_res.png");

export const FactionResist = buildIcon("Resist", "https://wiki.hoodedhorse.com/images/mbhh_ti/d/d4/FAC_ResistCouncil_128.png");
export const FactionSubmit = buildIcon("Submit", "https://wiki.hoodedhorse.com/images/mbhh_ti/0/0a/FAC_SubmitCouncil_128.png");
export const FactionExploit = buildIcon("Exploit", "https://wiki.hoodedhorse.com/images/mbhh_ti/e/e8/FAC_ExploitCouncil_128.png");
export const FactionEscape = buildIcon("Escape", "https://wiki.hoodedhorse.com/images/mbhh_ti/d/d4/FAC_EscapeCouncil_128.png");
export const FactionCooperate = buildIcon("Cooperate", "https://wiki.hoodedhorse.com/images/mbhh_ti/6/67/FAC_CooperateCouncil_128.png");
export const FactionDestroy = buildIcon("Destroy", "https://wiki.hoodedhorse.com/images/mbhh_ti/6/6e/FAC_DestroyCouncil_128.png");
export const FactionAppease = buildIcon("Appease", "https://wiki.hoodedhorse.com/images/mbhh_ti/6/67/FAC_AppeaseCouncil_128.png");
export const FactionAlien = buildIcon("Alien", "https://wiki.hoodedhorse.com/images/mbhh_ti/2/21/FAC_AlienCouncil_128.png");
export const FactionIcons: { [key: string]: typeof FactionResist } = {
  Resist: FactionResist,
  Submit: FactionSubmit,
  Exploit: FactionExploit,
  Escape: FactionEscape,
  Cooperate: FactionCooperate,
  Destroy: FactionDestroy,
  Appease: FactionAppease,
  Alien: FactionAlien,
  ResistCouncil: FactionResist,
  SubmitCouncil: FactionSubmit,
  ExploitCouncil: FactionExploit,
  EscapeCouncil: FactionEscape,
  CooperateCouncil: FactionCooperate,
  DestroyCouncil: FactionDestroy,
  AppeaseCouncil: FactionAppease,
  AlienCouncil: FactionAlien,
};

export const TierStar = buildIcon("Tier Star", "https://wiki.hoodedhorse.com/images/mbhh_ti/1/11/ICO_mod_star_on.png");