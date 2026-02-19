import { MissionDataName, TechCategory } from "@/lib/template-types-generated";

export interface ScoringWeights {
  // Councilor attributes
  persuasion?: number;
  command?: number;
  investigation?: number;
  espionage?: number;
  administration?: number;
  science?: number;
  security?: number;
  xpModifier?: number;
  xp?: number;

  // Monthly income/costs
  incomeBoost_month?: number;
  incomeMoney_month?: number;
  incomeInfluence_month?: number;
  incomeOps_month?: number;
  incomeMissionControl?: number;
  incomeResearch_month?: number;
  projectCapacityGranted?: number;

  // Purchase costs (typically negative weights since costs are bad)
  costMoney?: number;
  costInfluence?: number;
  costOps?: number;
  costBoost?: number;

  // Priority bonuses
  economyBonus?: number;
  welfareBonus?: number;
  environmentBonus?: number;
  knowledgeBonus?: number;
  governmentBonus?: number;
  unityBonus?: number;
  militaryBonus?: number;
  oppressionBonus?: number;
  spoilsBonus?: number;
  spaceDevBonus?: number;
  spaceflightBonus?: number;
  MCBonus?: number;
  miningBonus?: number;

  // Tech bonuses (weight per tech category)
  councilorTechBonus?: Partial<Record<TechCategory, number>>;
  techBonuses?: Partial<Record<TechCategory, number>>;

  // Missions (weight per mission name)
  missions?: Partial<Record<MissionDataName, number>>;

  orgTierExponent: number;
  extraWeightForMissingMissions: number;
  extraWeightForSingleMissions: number;
}

const zeroWeights: ScoringWeights = {
  persuasion: 0,
  command: 0,
  investigation: 0,
  espionage: 0,
  administration: 0,
  science: 0,
  security: 0,
  xpModifier: 0,
  xp: 0,
  incomeBoost_month: 0,
  incomeMoney_month: 0,
  incomeInfluence_month: 0,
  incomeOps_month: 0,
  incomeMissionControl: 0,
  incomeResearch_month: 0,
  projectCapacityGranted: 0,
  costMoney: 0,
  costInfluence: 0,
  costOps: 0,
  costBoost: 0,
  economyBonus: 0,
  welfareBonus: 0,
  environmentBonus: 0,
  knowledgeBonus: 0,
  governmentBonus: 0,
  unityBonus: 0,
  militaryBonus: 0,
  oppressionBonus: 0,
  spoilsBonus: 0,
  spaceDevBonus: 0,
  spaceflightBonus: 0,
  MCBonus: 0,
  miningBonus: 0,
  councilorTechBonus: {
    Energy: 0,
    InformationScience: 0,
    LifeScience: 0,
    Materials: 0,
    MilitaryScience: 0,
    SocialScience: 0,
    SpaceScience: 0,
  },
  techBonuses: {
    Energy: 0,
    InformationScience: 0,
    LifeScience: 0,
    Materials: 0,
    MilitaryScience: 0,
    SocialScience: 0,
    SpaceScience: 0,
  },
  missions: {
    Advise: 0,
    Assassinate: 0,
    AssaultAlienAsset: 0,
    AssumeControl: 0,
    BuildFacility: 0,
    Contact: 0,
    ControlSpaceAsset: 0,
    Coup: 0,
    Crackdown: 0,
    DefendInterests: 0,
    Deorbit: 0,
    Detain: 0,
    DetectCouncilActivity: 0,
    Extract: 0,
    GainInfluence: 0,
    GoToGround: 0,
    HostileTakeover: 0,
    Inspire: 0,
    InvestigateAlienActivity: 0,
    InvestigateCouncilor: 0,
    Orbit: 0,
    Propaganda: 0,
    Protect: 0,
    Purge: 0,
    SabotageFacilities: 0,
    SabotageHabModule: 0,
    SabotageProject: 0,
    SeizeSpaceAsset: 0,
    SetNationalPolicy: 0,
    Stabilize: 0,
    StealProject: 0,
    Turn: 0,
    Unrest: 0,
  },
  orgTierExponent: 1,
  extraWeightForMissingMissions: 0,
  extraWeightForSingleMissions: 0,
};

// initial defaults based on my old scoring system for mid/late game
export const midLate = {
  ...zeroWeights,
  // Councilor attributes - based on my old scoring system
  persuasion: 1,
  command: 1,
  investigation: 0.7,
  espionage: 0.7,
  administration: 0.3,
  science: 0.7,
  security: 0.3,
  xpModifier: -50, // -.1 (quick learner) is worth about 1 level every 2 years, so we want it to be worth 5
  xp: 1 / 20, // 20 xp is worth 1 level

  // Monthly income (valued highly as these compound over time)
  incomeBoost_month: 0.15, // probably should be higher early-game
  incomeMoney_month: 1 / 100,
  incomeInfluence_month: 1 / 60,
  incomeOps_month: 1 / 30,
  incomeMissionControl: 0.1, // probably should be higher early-game
  incomeResearch_month: 1 / 100,
  projectCapacityGranted: 0.3,

  // IMHO, purchase costs are pretty trivial past early-game
  costMoney: 0,
  costInfluence: 0,
  costOps: 0,
  costBoost: 0,

  // Priority bonuses (moderate value for most)
  economyBonus: 10,
  welfareBonus: 10,
  environmentBonus: 10,
  knowledgeBonus: 10,
  governmentBonus: 10,
  unityBonus: 25,
  militaryBonus: 10,
  oppressionBonus: 10,
  spoilsBonus: 40,
  spaceDevBonus: 1, // funding
  spaceflightBonus: 5, // seems to be both "build boost" and "create space program"
  MCBonus: 5, // didn't have this in my old thing - no idea what it's for
  miningBonus: 20,

  // Councilor Tech bonuses - from traits and orgs are easier to get them
  councilorTechBonus: {
    ...zeroWeights.councilorTechBonus,
    Energy: 15,
    InformationScience: 15,
    LifeScience: 15,
    Materials: 15,
    MilitaryScience: 15,
    SocialScience: 15,
    SpaceScience: 15,
  },

  // Org Tech bonuses - from orgs
  techBonuses: {
    ...zeroWeights.techBonuses,
    Energy: 10,
    InformationScience: 10,
    LifeScience: 10,
    Materials: 10,
    MilitaryScience: 10,
    SocialScience: 10,
    SpaceScience: 10,
  },

  missions: {
    ...zeroWeights.missions,
    // Missions (weighted by utility/frequency of use by ClaudeSonnet45)
    // Advise: 2.0,
    // Assassinate: 2.5,
    // AssaultAlienAsset: 2.0,
    // AssumeControl: 3.0,
    // BuildFacility: 1.5,
    // Contact: 1.0,
    // ControlSpaceAsset: 2.5,
    // Coup: 2.5,
    // Crackdown: 1.5,
    // DefendInterests: 2.0,
    // Deorbit: 1.0,
    // Detain: 2.0,
    // DetectCouncilActivity: 1.5,
    // Extract: 2.5,
    // GainInfluence: 2.5,
    // GoToGround: 0.5,
    // HostileTakeover: 2.0,
    // Inspire: 2.0,
    // InvestigateAlienActivity: 1.5,
    // InvestigateCouncilor: 1.5,
    // Orbit: 1.0,
    // Propaganda: 1.5,
    // Protect: 2.0,
    // Purge: 1.5,
    // SabotageFacilities: 2.0,
    // SabotageHabModule: 1.5,
    // SabotageProject: 2.0,
    // SeizeSpaceAsset: 2.0,
    // SetNationalPolicy: 2.5,
    // Stabilize: 2.0,
    // StealProject: 2.5,
    // Turn: 3.0,
    // Unrest: 1.5,

    // from my original scoring system
    Inspire: 10, // rare
    Coup: 2, // bit rare
    AssaultAlienAsset: 2, // bit rare
  },

  orgTierExponent: 0.95, // slight priority to higher tiers since you don't have unlimited org slots
  extraWeightForMissingMissions: 1, // extra weight to get missions you don't have yet
  extraWeightForSingleMissions: 0.5, // extra weight to get missions you only have one of
} satisfies ScoringWeights;
const earlyGame = {
  ...zeroWeights,
  // bunch of guesses here - emphasis on income and persuasion/command for early game
  persuasion: 1.5,
  command: 1,
  investigation: 0.7,
  espionage: 0.7,
  administration: 1,
  science: 0.7,
  security: 0.3,
  xpModifier: -75, // if we can get one of these early, that'd be great
  xp: 1 / 20, // 20 xp is worth 1 level

  incomeBoost_month: 1,
  incomeMoney_month: 1 / 20,
  incomeInfluence_month: 1 / 10,
  incomeOps_month: 1 / 5,
  incomeMissionControl: 1,
  incomeResearch_month: 1 / 30,
  projectCapacityGranted: 0.3,

  costMoney: -1 / 400,
  costInfluence: -1 / 40,
  costOps: -1 / 40,
  costBoost: -1 / 10,

  // Priority bonuses (moderate value for most)
  economyBonus: 10,
  welfareBonus: 10,
  environmentBonus: 10,
  knowledgeBonus: 10,
  governmentBonus: 10,
  unityBonus: 10,
  militaryBonus: 10,
  oppressionBonus: 10,
  spoilsBonus: 20,
  spaceDevBonus: 3, // funding
  spaceflightBonus: 7, // seems to be both "build boost" and "create space program"
  MCBonus: 7,
  miningBonus: 1,

  // Councilor Tech bonuses - from traits (going a bit higher here since we won't have habs online yet) and we should keep these a while
  councilorTechBonus: {
    ...zeroWeights.councilorTechBonus,
    Energy: 20,
    InformationScience: 20,
    LifeScience: 20,
    Materials: 20,
    MilitaryScience: 20,
    SocialScience: 20,
    SpaceScience: 20,
  },

  // Org Tech bonuses - from orgs (going a bit higher here since we won't have habs online yet)
  techBonuses: {
    ...zeroWeights.techBonuses,
    Energy: 15,
    InformationScience: 15,
    LifeScience: 15,
    Materials: 15,
    MilitaryScience: 15,
    SocialScience: 15,
    SpaceScience: 15,
  },

  missions: {
    ...zeroWeights.missions,
    // Missions (weighted by utility/frequency of use by ClaudeSonnet45)
    // Advise: 2.0,
    // Assassinate: 2.5,
    // AssaultAlienAsset: 2.0,
    // AssumeControl: 3.0,
    // BuildFacility: 1.5,
    // Contact: 1.0,
    // ControlSpaceAsset: 2.5,
    // Coup: 2.5,
    // Crackdown: 1.5,
    // DefendInterests: 2.0,
    // Deorbit: 1.0,
    // Detain: 2.0,
    // DetectCouncilActivity: 1.5,
    // Extract: 2.5,
    // GainInfluence: 2.5,
    // GoToGround: 0.5,
    // HostileTakeover: 2.0,
    // Inspire: 2.0,
    // InvestigateAlienActivity: 1.5,
    // InvestigateCouncilor: 1.5,
    // Orbit: 1.0,
    // Propaganda: 1.5,
    // Protect: 2.0,
    // Purge: 1.5,
    // SabotageFacilities: 2.0,
    // SabotageHabModule: 1.5,
    // SabotageProject: 2.0,
    // SeizeSpaceAsset: 2.0,
    // SetNationalPolicy: 2.5,
    // Stabilize: 2.0,
    // StealProject: 2.5,
    // Turn: 3.0,
    // Unrest: 1.5,

    Inspire: 2, // rare - boost this manually if you're having trouble getting it
    Coup: 1.5, // bit rare
    AssaultAlienAsset: 1.5, // bit rare
    // public campaign and control nation are critical early game, but control nation is _really_ common
    GainInfluence: 0.2,
    Propaganda: 3,
  },

  orgTierExponent: 1, // not using up all slots yet, so equal weighting
  extraWeightForMissingMissions: 1.5, // extra weight to get missions you don't have yet
  extraWeightForSingleMissions: 0.5, // extra weight to get missions you only have one of
} satisfies ScoringWeights;

const earlyInvestigate = {
  ...earlyGame,
  investigation: Math.max(earlyGame.investigation, 1) * 2,
  espionage: Math.max(earlyGame.espionage, 1) * 1.5,
  missions: {
    ...earlyGame.missions,
    InvestigateAlienActivity: Math.max(earlyGame.missions?.InvestigateAlienActivity || 0, 1) * 1.5,
    InvestigateCouncilor: Math.max(earlyGame.missions?.InvestigateCouncilor || 0, 1) * 3,
    Crackdown: Math.max(earlyGame.missions?.Crackdown || 0, 1) * 3,
    Purge: Math.max(earlyGame.missions?.Purge || 0, 1) * 1.5,
  },
} satisfies ScoringWeights;

const earlyPurge = {
  ...earlyGame,
  investigation: Math.max(earlyGame.investigation, 1) * 1.5,
  espionage: Math.max(earlyGame.espionage, 1) * 2,
  missions: {
    ...earlyGame.missions,
    InvestigateCouncilor: Math.max(earlyGame.missions?.InvestigateCouncilor || 0, 1) * 1.5,
    Crackdown: Math.max(earlyGame.missions?.Crackdown || 0, 1) * 1.5,
    Purge: Math.max(earlyGame.missions?.Purge || 0, 1) * 3,
  },
} satisfies ScoringWeights;

export const prebuiltScoringWeights: Record<string, ScoringWeights> = {
  "Preconfigured: Default": midLate,
  "Preconfigured: Early Game": earlyGame,
  "Preconfigured: Early Game (Investigate Focus)": earlyInvestigate,
  "Preconfigured: Early Game (Purge Focus)": earlyPurge,
};

export const defaultScoringWeights = prebuiltScoringWeights["Preconfigured: Default"];
