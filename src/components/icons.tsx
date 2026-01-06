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

const buildIcon = (name: string, src: string, showLightBg?: boolean) => {
  const extraClassName = showLightBg ? 'bg-gray-700 dark:bg-transparent' : 'bg-transparent dark:bg-gray-200';
  const Icon = (props: ComponentProps<"img">) => (
    <span className={twMerge('inline-block rounded radius-4 p-0.5 -m-0.5 -my-1.5', extraClassName, props.className)} title={name}>
      <img src={src} {...props} className={twMerge("h-4 w-4")} />
    </span>
  );
  Icon.DisplayName = name;
  return Icon;
};

export const Currency = buildIcon("Money", "https://wiki.hoodedhorse.com/images/mbhh_ti/8/80/ICO_currency.png");
export const Influence = buildIcon("Influence", "https://wiki.hoodedhorse.com/images/mbhh_ti/3/35/ICO_influence.png");
export const Ops = buildIcon("Ops", "https://wiki.hoodedhorse.com/images/mbhh_ti/a/a7/ICO_ops.png", true);
export const Boost = buildIcon("Boost", "https://wiki.hoodedhorse.com/images/mbhh_ti/1/17/ICO_boost.png");
export const MissionControl = buildIcon("MissionControl", "https://wiki.hoodedhorse.com/images/mbhh_ti/d/da/ICO_mission_control.png");
export const Research = buildIcon("Research", "https://wiki.hoodedhorse.com/images/mbhh_ti/3/36/ICO_research.png");
export const Projects = buildIcon("Projects", "https://wiki.hoodedhorse.com/images/mbhh_ti/6/6b/ICO_projects.png", true);
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
export const TechInformation = buildIcon("Tech: Information Science", "https://wiki.hoodedhorse.com/images/mbhh_ti/0/00/Tech_info_icon.png");
export const TechXeno = buildIcon("Tech: Xeno", "https://wiki.hoodedhorse.com/images/mbhh_ti/5/50/Tech_xeno_icon.png");
export const TechIcons = {
  EnergyScience: TechEnergy,
  MaterialScience: TechMaterial,
  SpaceScience: TechSpace,
  LifeScience: TechLife,
  SocialScience: TechSocial,
  MilitaryScience: TechMilitary,
  InformationScience: TechInformation,
  XenoScience: TechXeno,
  Energy: TechEnergy,
  Material: TechMaterial,
  Space: TechSpace,
  Life: TechLife,
  Social: TechSocial,
  Military: TechMilitary,
  Information: TechInformation,
  Xeno: TechXeno,
};
export const PriorityEconomy = buildIcon("Priority: Economy", "https://wiki.hoodedhorse.com/images/mbhh_ti/9/92/ICO_economy_priority.png");
export const PriorityEnvironment = buildIcon("Priority: Environment", "https://wiki.hoodedhorse.com/images/mbhh_ti/b/b0/ICO_environment_priority.png");
export const PriorityWelfare = buildIcon("Priority: Welfare", "https://wiki.hoodedhorse.com/images/mbhh_ti/6/61/ICO_welfare_priority.png");
export const PriorityKnowledge = buildIcon("Priority: Knowledge", "https://wiki.hoodedhorse.com/images/mbhh_ti/0/00/ICO_knowledge_priority.png");
export const PriorityGovernment = buildIcon("Priority: Government", "https://wiki.hoodedhorse.com/images/mbhh_ti/e/e4/ICO_government_priority.png");
export const PriorityUnity = buildIcon("Priority: Unity", "https://wiki.hoodedhorse.com/images/mbhh_ti/7/7e/ICO_unity_priority.png");
export const PriorityOppression = buildIcon("Priority: Oppression", "https://wiki.hoodedhorse.com/images/mbhh_ti/b/bc/ICO_oppression_priority.png");
export const PrioritySpoils = buildIcon("Priority: Spoils", "https://wiki.hoodedhorse.com/images/mbhh_ti/b/b2/ICO_spoils_priority.png");
export const PriorityMilitary = buildIcon("Priority: Military", "https://wiki.hoodedhorse.com/images/mbhh_ti/a/a6/ICO_military_priority.png");
export const PriorityFunding = buildIcon("Priority: Funding", "https://wiki.hoodedhorse.com/images/mbhh_ti/5/52/ICO_funding_priority.png");
export const PriorityMissionControl = buildIcon("Priority: Mission Control", "https://wiki.hoodedhorse.com/images/mbhh_ti/4/46/ICO_missionControl_priority.png");
export const PriorityBoost = buildIcon("Priority: Boost/Space Program", "https://wiki.hoodedhorse.com/images/mbhh_ti/1/1e/ICO_launchFacilities_Priority.png");
export const MiningBonus = buildIcon("Mining Bonus", "https://wiki.hoodedhorse.com/images/mbhh_ti/f/f7/ICO_core_res.png", true);

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

export const TierStar = buildIcon("Tier Star", "https://wiki.hoodedhorse.com/images/mbhh_ti/5/52/ICO_mod_star_on.png");

export const MissionAssassinate = buildIcon("Mission: Assassinate", "https://wiki.hoodedhorse.com/images/mbhh_ti/9/98/ICO_assassinate_on.png");
export const MissionAssaultalienasset = buildIcon("Mission: Assault Alien Asset", "https://wiki.hoodedhorse.com/images/mbhh_ti/0/08/ICO_assaultalienasset_on.png");
export const MissionControlspaceasset = buildIcon("Mission: Control Space Asset", "https://wiki.hoodedhorse.com/images/mbhh_ti/e/ed/ICO_controlspaceasset_on.png");
export const MissionCoup = buildIcon("Mission: Coup", "https://wiki.hoodedhorse.com/images/mbhh_ti/1/1c/ICO_coup_on.png");
export const MissionCrackdown = buildIcon("Mission: Crackdown", "https://wiki.hoodedhorse.com/images/mbhh_ti/e/e1/ICO_crackdown_on.png");
export const MissionDetain = buildIcon("Mission: Detain", "https://wiki.hoodedhorse.com/images/mbhh_ti/4/4a/ICO_detain_on.png");
export const MissionExtract = buildIcon("Mission: Extract", "https://wiki.hoodedhorse.com/images/mbhh_ti/2/2c/ICO_extract_on.png");
export const MissionGaininfluence = buildIcon("Mission: Control Nation", "https://wiki.hoodedhorse.com/images/mbhh_ti/b/b4/ICO_gaininfluence_on.png");
export const MissionHostiletakeover = buildIcon("Mission: Hostile Takeover", "https://wiki.hoodedhorse.com/images/mbhh_ti/b/b2/ICO_hostiletakeover_on.png");
export const MissionInspire = buildIcon("Mission: Inspire", "https://wiki.hoodedhorse.com/images/mbhh_ti/5/56/ICO_inspire_on.png");
export const MissionInvestigatecouncilor = buildIcon("Mission: Investigate Councilor", "https://wiki.hoodedhorse.com/images/mbhh_ti/4/4e/ICO_investigatecouncilor_on.png");
export const MissionPropaganda = buildIcon("Mission: Public Campaign", "https://wiki.hoodedhorse.com/images/mbhh_ti/b/b6/ICO_propaganda_on.png");
export const MissionPurge = buildIcon("Mission: Purge", "https://wiki.hoodedhorse.com/images/mbhh_ti/4/4a/ICO_purge_on.png");
export const MissionSabotagefacilities = buildIcon("Mission: Sabotage Facilities", "https://wiki.hoodedhorse.com/images/mbhh_ti/a/ac/ICO_sabotagefacilities_on.png");
export const MissionSabotagehabmodule = buildIcon("Mission: Sabotage Hab Module", "https://wiki.hoodedhorse.com/images/mbhh_ti/4/4e/ICO_sabotagehabmodule_on.png");
export const MissionSabotageproject = buildIcon("Mission: Sabotage Project", "https://wiki.hoodedhorse.com/images/mbhh_ti/a/aa/ICO_sabotageproject_on.png");
export const MissionSeizespaceasset = buildIcon("Mission: Seize Space Asset", "https://wiki.hoodedhorse.com/images/mbhh_ti/b/be/ICO_seizespaceasset_on.png");
export const MissionStabilize = buildIcon("Mission: Stabilize", "https://wiki.hoodedhorse.com/images/mbhh_ti/3/3d/ICO_stabilize_on.png");
export const MissionStealproject = buildIcon("Mission: Steal Project", "https://wiki.hoodedhorse.com/images/mbhh_ti/a/ab/ICO_stealproject_on.png");
export const MissionTurn = buildIcon("Mission: Turn Councilor", "https://wiki.hoodedhorse.com/images/mbhh_ti/3/32/ICO_turn_on.png");
export const MissionUnrest = buildIcon("Mission: Unrest", "https://wiki.hoodedhorse.com/images/mbhh_ti/2/2e/ICO_unrest_on.png");
export const MissionAdvise = buildIcon("Mission: Advise", "https://wiki.hoodedhorse.com/images/mbhh_ti/2/2e/ICO_advise_on.png");
export const MissionContact = buildIcon("Mission: Contact", "https://wiki.hoodedhorse.com/images/mbhh_ti/c/cd/ICO_contact_on.png");
export const MissionDefendInterests = buildIcon("Mission: Defend Interests", "https://wiki.hoodedhorse.com/images/mbhh_ti/c/c2/ICO_defendinterest_on.png");
export const MissionDeorbit = buildIcon("Mission: Deorbit", "https://wiki.hoodedhorse.com/images/mbhh_ti/1/17/ICO_deorbit_on.png");
export const MissionDetectCouncilActivity = buildIcon("Mission: Detectcouncilactivity", "https://wiki.hoodedhorse.com/images/mbhh_ti/a/ac/ICO_detectcouncilactivity_on.png");
export const MissionGotoGround = buildIcon("Mission: Gotoground", "https://wiki.hoodedhorse.com/images/mbhh_ti/3/3a/ICO_gotoground_on.png");
export const MissionInvestigateAlienActivity = buildIcon("Mission: Investigatealienactivity", "https://wiki.hoodedhorse.com/images/mbhh_ti/f/f6/ICO_investigatealienactivity_on.png");
export const MissionOrbit = buildIcon("Mission: Orbit", "https://wiki.hoodedhorse.com/images/mbhh_ti/8/80/ICO_orbit_on.png");
export const MissionProtect = buildIcon("Mission: Protect", "https://wiki.hoodedhorse.com/images/mbhh_ti/2/28/ICO_protect_on.png");
export const MissionSetNationalPolicy = buildIcon("Mission: Set National Policy", "https://wiki.hoodedhorse.com/images/mbhh_ti/f/f9/ICO_setnationalpolicy_on.png");
export const MissionTransfer = buildIcon("Mission: Transfer", "https://wiki.hoodedhorse.com/images/mbhh_ti/6/6d/ICO_transfer_on.png");

export const MissionIcons: { [key: string]: typeof MissionAssassinate } = {
  Assassinate: MissionAssassinate,
  AssaultAlienAsset: MissionAssaultalienasset,
  ControlSpaceAsset: MissionControlspaceasset,
  Coup: MissionCoup,
  Crackdown: MissionCrackdown,
  Detain: MissionDetain,
  Extract: MissionExtract,
  GainInfluence: MissionGaininfluence,
  HostileTakeover: MissionHostiletakeover,
  Inspire: MissionInspire,
  InvestigateCouncilor: MissionInvestigatecouncilor,
  Propaganda: MissionPropaganda,
  Purge: MissionPurge,
  SabotageFacilities: MissionSabotagefacilities,
  SabotageHabModule: MissionSabotagehabmodule,
  SabotageProject: MissionSabotageproject,
  SeizeSpaceAsset: MissionSeizespaceasset,
  Stabilize: MissionStabilize,
  StealProject: MissionStealproject,
  Turn: MissionTurn,
  Unrest: MissionUnrest,
  Advise: MissionAdvise,
  Contact: MissionContact,
  DefendInterests: MissionDefendInterests,
  Deorbit: MissionDeorbit,
  DetectCouncilActivity: MissionDetectCouncilActivity,
  GotoGround: MissionGotoGround,
  InvestigateAlienActivity: MissionInvestigateAlienActivity,
  Orbit: MissionOrbit,
  Protect: MissionProtect,
  SetNationalPolicy: MissionSetNationalPolicy,
  Transfer: MissionTransfer,
};