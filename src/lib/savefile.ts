import { readFile, writeFile } from "fs/promises";
import { join } from "path";
import { gunzipSync } from "zlib";
import type { MissionDataName, TraitDataName, CouncilorTypeDataName, HabSchematicDataName } from "./templates";

export async function loadSaveFile(filePath: string): Promise<SaveFile> {
  const start = Date.now();

  const buffer = await readFile(filePath);
  console.log(`Loaded save file in ${Date.now() - start}ms`);

  const decompressed = gunzipSync(buffer);
  let content = decompressed.toString("utf8");
  console.log(`Loaded and decompressed save file in ${Date.now() - start}ms`);

  // for some reason, there's an extra character at the start of the file - charcode 65279
  // once we strip that, JSON.parse works fine and is _much_ faster than JSON5.parse().
  while (content[0] !== "{" && content.length > 0) {
    content = content.substring(1);
  }

  // this file can also contain +/-Infinity values (though maybe that's caused by 0.4.90 -> RC25 migration), which we need to fix:
  content = content.replace(/": -Infinity/g, '": -1e+300');
  content = content.replace(/": Infinity/g, '": 1e+300');

  try {
    const rawData = JSON.parse(content);
    console.log(`Loaded, decompressed, and parsed save file in ${Date.now() - start}ms`);

    // some data is shared via $id and $ref, we need to resolve those references - common for arrivalTime for fleet trajectories
    const sharedItems = findSharedItems(rawData);
    return fixReferences<SaveFile>(rawData, sharedItems);
  } catch (e) {
    console.error(`Error parsing JSON from file ${filePath}:`, e);

    const dumpJsonError = process.env.DUMP_JSON_ERROR;
    if (dumpJsonError) {
      // Write cleaned content to temp file for inspection
      const debugFile = join(process.cwd(), dumpJsonError);
      await writeFile(debugFile, content, "utf8");
      console.error(`\nCleaned content written to: ${debugFile}`);
    }

    throw e;
  }
}

function findSharedItems(obj: any, sharedItems: Map<string, any> = new Map()): Map<string, any> {
  if (!obj) return sharedItems;
  if (typeof obj === "object") {
    if (obj["$id"]) {
      sharedItems.set(obj["$id"], obj);
    }
    for (const key in obj) {
      const value = obj[key];
      findSharedItems(value, sharedItems);
    }
  } else if (Array.isArray(obj)) {
    obj.forEach((item) => findSharedItems(item, sharedItems));
  }
  return sharedItems;
}

function fixReferences<T>(obj: any, sharedItems: Map<string, any>): T {
  if (!obj) return obj;
  if (typeof obj === "object") {
    if (obj["$ref"]) {
      return sharedItems.get(obj["$ref"]);
    }
    for (const key in obj) {
      const value = obj[key];
      const newValue = fixReferences(value, sharedItems);
      if (newValue !== value) {
        obj[key] = newValue;
      }
    }
  } else if (Array.isArray(obj)) {
    for (var i = 0; i < obj.length; i++) {
      const value = obj[i];
      const newValue = fixReferences(value, sharedItems);
      if (newValue !== value) {
        obj[i] = newValue;
      }
    }
  }
  return obj;
}

// Base types
export interface IDValue {
  value: number;
}

export interface DateTime {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  millisecond: number;
}

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface KeyValuePair<K, V> {
  Key: K;
  Value: V;
}

export interface BaseState {
  archived: boolean;
  ID: IDValue;
  exists: boolean;
  finderSortOverride: number;
  templateName: string | null;
  displayName: string | null;
  $type: string;
}

// Metadata State
export interface TIMetadataState extends BaseState {
  playerFactionName: string;
  gameTimeString: string;
  difficulty: string;
  playedWithMods: boolean;
  customDifficulty: boolean;
  selectedFactionsForScenario: string[];
  researchSpeedMultiplier: string;
  controlPointMaintenanceFreebieBonus: string;
  controlPointMaintenanceFreebieBonusAI: string;
  missionControlBonus: string;
  missionControlBonusAI: string;
  alienProgressionSpeed: string;
  miningProductivityMultiplier: string;
  nationalIPMultiplier: string;
  averageMonthlyEvents: string;
  playerFactionIconPath: string;
  playerFactionGradientPath: string;
  lastCompletedObjectiveArtPath: string;
  lastCompletedObjectiveName: string;
}

// Space Body State
export interface TISpaceBodyState extends BaseState {
  nations: IDValue[];
  habSites: IDValue[];
  currentModelResource: string;
  playerTag: string;
  solarMirrorBonus: KeyValuePair<IDValue, number>[];
  maxHabTier: number;
  orbits: IDValue[];
  HohmannDates: Record<string, unknown>;
  epoch_DateTime: DateTime;
  _rnd_rotationOffset_Deg: number;
  globalPosition: Vector3;
  barycenter: IDValue | null;
}

// Time State
export interface TITimeState extends BaseState {
  daysInCampaign: number;
  currentQuarterSinceStart: number;
  masterMetaTemplateName: string;
  scenarioMetaTemplateName: string;
  currentDateTime: DateTime;
}

// Lagrange Point State
export interface TILagrangePointState extends BaseState {
  secondaryObject: IDValue;
  maxHabTier: number;
  orbits: IDValue[];
  HohmannDates: Record<string, unknown>;
  epoch_DateTime: DateTime;
  _rnd_rotationOffset_Deg: number | null;
  globalPosition: Vector3;
  barycenter: IDValue | null;
}

// Region State
export interface TIRegionState extends BaseState {
  nation: IDValue;
  leadOccupier: IDValue | null;
  occupations: KeyValuePair<IDValue, number>[];
  populationInMillions: number;
  antiSpaceDefenses: boolean;
  underBombardment: boolean;
  isCounterfiring: boolean;
  alienFacility: IDValue;
  alienActivity: IDValue;
  alienLanding: IDValue;
  alienCrashdown: IDValue;
  xenoforming: IDValue;
  annualPopGrowthModifier: number;
  isBeingAnnexed: boolean;
  annexingArmy: IDValue | null;
  annexationBeginDate: DateTime | null;
  annexationDaysLeft: number;
  adjacencies: KeyValuePair<IDValue, string>[];
  missionControl: number;
  boostPerYear_dekatons: number;
  coreEconomicRegion: boolean;
  resourceRegion: boolean;
  oilRegion: boolean;
  colonyRegion: boolean;
  permanentlyDecolonized: boolean;
  nuclearDetonations: number;
  oceanType: string;
  numSTOFighters: number;
  STOFighterCooldownExpiry: DateTime[];
  spaceFacilities: (IDValue & { $type: string })[];
  boostFacility: IDValue;
  missionControlFacility: IDValue;
  spaceDefenseFacility: IDValue;
  armies: IDValue[];
  abductions: number;
  originalColony: IDValue | null;
  accumulatedCoreEconomyRegionTriggers: number;
  accumulatedCoreOilRegionTriggers: number;
  accumulatedCoreMiningRegionTriggers: number;
  accumulatedDecolonizeTriggers: number;
  accumulatedDecontaminateTriggers: number;
  gameStateSubjectCreated: boolean;
}

// Nation State
export interface TINationState extends BaseState {
  capital: IDValue | null;
  originalCapital: IDValue | null;
  regions: IDValue[];
  allies: IDValue[];
  rivals: IDValue[];
  claims: IDValue[];
  numOilRegions_dailyCache: number;
  numMiningRegions_dailyCache: number;
  numCoreEconomicRegions_dailyCache: number;
  baseInvestmentPoints_month: number;
  controlPoints: IDValue[];
  StartOfTurnNativeControlPoints: number;
  inequality: number;
  education: number;
  democracy: number;
  cohesion: number;
  unrest: number;
  militaryTechLevel: number;
  GDP: number;
  missionControl: number;
  boostPerYear_dekatons: number;
  // [key: string]: unknown;
}

// Control Point
export interface TIControlPoint extends BaseState {
  nation: IDValue;
  faction: IDValue | null;
  benefitsDisabled: boolean;
  defended: boolean;
  crackdownExpiration: DateTime | null;
  defendExpiration: DateTime | null;
  controlPointType: string;
  totalWeightsForControlPoint: number;
  numPrioritiesWithWeight: number;
  positionInNation: number;
  controlPointPriorities: Record<string, number>;
  gameStateSubjectCreated: boolean;
}

// Councilor State
export interface CouncilorAttributes {
  Persuasion: number;
  Investigation: number;
  Espionage: number;
  Command: number;
  Administration: number;
  Science: number;
  Security: number;
  Loyalty: number;
  ApparentLoyalty: number;
}

export interface LocationIllustration {
  illustrationPath: string;
  offset: number;
}

export interface TICouncilorState extends BaseState {
  faction: IDValue | null;
  agentForFaction: IDValue | null;
  autofailMissionsValue: number;
  protectingTarget: IDValue | null;
  location: IDValue & { $type: string };
  recruitDate: DateTime | null;
  detainedReleaseDate: DateTime | null;
  traitTemplateNames: TraitDataName[];
  learnedMissionsTemplateNames: MissionDataName[];
  attributes: CouncilorAttributes;
  knowsIveBeenSeenBy: IDValue[];
  activeMission: IDValue | null;
  completedMission: IDValue | null;
  priorMissionTemplateName: MissionDataName | null;
  priorMissionTarget: IDValue | null;
  repeatOrder: boolean;
  permanentAssignment: boolean;
  permanentDefenseMode: boolean;
  missionsExcludedFromDefenseMode: MissionDataName[];
  personalName: string;
  familyName: string;
  typeTemplateName: CouncilorTypeDataName;
  homeRegion: IDValue;
  possibleFaction: IDValue | null;
  detainingFaction: IDValue | null;
  orgs: IDValue[];
  priorLocation: IDValue | null;
  preMissionPhaseLocation: IDValue | null;
  locationIllustration: LocationIllustration;
  dateBorn: DateTime;
  gender: string;
  ancestry: string;
  status: string;
  everBeenAvailable: boolean;
  appearanceTemplateName: string;
  voiceTemplateName: string | null;
  XP: number;
  imBeingTargeted: boolean;
  targetedLastTurn: boolean;
  assassinations: KeyValuePair<IDValue, number>[];
  gameStateSubjectCreated: boolean;
}

// Faction State
export interface ResourceCost {
  resource: string;
  value: number;
}

export interface ResourcesCost {
  resourceCosts: ResourceCost[];
}

export interface Transaction {
  Resource: string;
  Amount: number;
  Date: DateTime;
}

export interface ShipyardQueueItem {
  shipDesignTemplateName: string;
  startDate: DateTime;
  shipyard: IDValue;
  daysToCompletion: number;
  resourcesCost: ResourcesCost;
}

export interface ShipDesign {
  factionName: string;
  hullName: string;
  driveName: string;
  powerPlantName: string;
  radiatorName: string;
  propellantTanks: number;
  refitIteration: number;
  noseArmor: { materialName: string; armorValue: number };
  lateralArmor: { materialName: string; armorValue: number };
  tailArmor: { materialName: string; armorValue: number };
  moduleTemplateEntries: { moduleName: string; slot: number }[];
  hullWeaponTemplateEntries: { moduleName: string; slot: number }[];
  noseWeaponTemplateEntries: { moduleName: string; slot: number }[];
  fireModeTemplateEntries: unknown[];
  role: string;
  hasDisplayName: boolean;
  _unnormalizedCombatValue: number;
  hullAppearanceIndex: number;
  hideInSkirmish: boolean;
  isIncompleteDesign: boolean;
  nation: IDValue | null;
  dataName: string;
  friendlyName: string | null;
  disable: boolean;
  _displayName: string;
}

export interface TIFactionState extends BaseState {
  nShipyardQueues: KeyValuePair<IDValue, ShipyardQueueItem[]>[];
  techNameContributionHistory: Record<string, number>;
  unlockedVictoryObjective: boolean;
  finishedProjectNames: string[];
  orgProjectSlotUnlocked: boolean;
  habProjectSlotUnlocked: boolean;
  atrocities: number;
  milestones: string[];
  factionOperationCompleteName: string;
  plannedPolicies: string[];
  missionControlUsage: number;
  PassiveTechSlot: number;
  LastObjectiveProjectCompletionDate: DateTime;
  player: IDValue;
  councilors: IDValue[];
  turnedCouncilors: IDValue[];
  knownSpies: IDValue[];
  intelSharingFactions: IDValue[];
  unassignedOrgs: IDValue[];
  fleets: IDValue[];
  habSectors: IDValue[];
  availableOrgs: IDValue[];
  availableCouncilors: IDValue[];
  shipDesigns: ShipDesign[];
  shipDesignCount: number;
  shipRefitDesigns: unknown[];
  shipRefitDesignNames: string[];
  obsoleteShipDesigns: unknown[];
  habDesigns: unknown[];
  savedHabDesigns: unknown[];
  customPresets: unknown[];
  defaultPriorityPresetTemplateName: string;
  defaultHullAppearanceIndex: number;
  nextRefitNumber: number;
  shipsBuiltInClass: Record<string, number>;

  // Intel-related
  intel: KeyValuePair<IDValue & { $type: string }, number>[];
  highestIntel: KeyValuePair<IDValue & { $type: string }, number>[];

  // AI & Strategy
  aiValues: unknown;
  AISavingTarget: number;
  AIReviewProjects: unknown;
  initialAINationGoals: unknown;
  factionGoals: IDValue[];
  focusGoal: IDValue | null;
  factionEarlyToDoList: unknown[];
  factionLateToDoList: unknown[];
  currentRiskAversion: number;
  crazyIvan: boolean;

  // Combat & Military
  CombatLogs: unknown[];
  Kills: unknown[];
  HabDestructionLog: unknown[];
  LocalTransferDVLog: unknown[];
  SolarTransferDVLog: unknown[];
  armies: IDValue[];
  armiesLost: number;
  desiredShipClass: string;
  desiredStaticFleetFraction: number;
  fleetWetMassDuringHighestShipMaintainence: number;

  // Resources & Economy
  resources: Record<string, number>;
  baseIncomes_year: Record<string, number>;
  boostAccounts: KeyValuePair<IDValue, number>[];
  globalResearchPurse: number;
  Transactions: Record<string, Transaction[]>;
  resourceIncomeDeficiencies: Record<string, number>;
  dailyResourceTransfers: unknown[];
  cachedSTOFighterMinimumBoost: number;
  cachedYearlyRevenue: Record<string, number>;
  highestRecordedExpenditurePerDay: number;
  lastMonthsSpoils: number;
  lastWeeksSpoils: number;
  thisMonthsCumulativeSpoils: number;
  thisWeeksCumulativeSpoils: number;

  // Faction Relations
  factionHate: KeyValuePair<IDValue, number>[];
  factionFleetsEncountered: KeyValuePair<IDValue, IDValue[]>[];
  assessedAlienHateOfMe: number;
  mostPowerfulHumanEnemy: IDValue | null;
  perceivedEnemyFleetStrengthFactors: Record<string, number>;
  alienProxyNeedsHelp: boolean;
  aliensRemoved: boolean;
  factionAssassinations: KeyValuePair<IDValue, number>[];
  internalCouncilorSuspicion: KeyValuePair<IDValue, number>[];
  lastRecordedLoyalty: KeyValuePair<IDValue, number>[];

  // Projects & Tech
  availableProjectNames: string[];
  currentProjectProgress: {
    projectTemplateName: string;
    accumulatedResearch: number;
    slot: number;
    completed: boolean;
  }[];
  favoredProjects: string[];
  hiddenProjects: string[];
  missedProjects: string[];
  sabotagedProjects: string[];
  activeProjectTriggers: { projectTemplateName: string; monthlyTriggerValue: number }[];
  researchWeights: Record<string, number>;
  longtermTechTarget: string | null;
  techRaceSlot: number;
  lastTechRaceDate: DateTime | null;

  // Control Points & Nations
  controlPoints: IDValue[];
  lostControlPoints: IDValue[];
  majorCPTrouble: IDValue[];
  minorCPTrouble: IDValue[];
  history_CPCapOverageByDay: number[];
  history_MCCapOverageByDay: number[];
  permaAbandonedNations: IDValue[];
  specialRegionAdjacencies: unknown[];

  // Habs & Space
  primaryHab: IDValue | null;
  updateHabPlanningFlag: boolean;

  // Ships
  updateShipDesignsFlag: boolean;
  lastUnaffordableShipShipyard: IDValue | null;
  obsoletedShipParts: string[];

  // Notifications & UI
  showAlerts: boolean;
  showMonthlyIncomesInTopBarAndIntel: boolean;
  showObsoleteParts: boolean;
  showRegularNotifications: boolean;
  showSummaryLogs: boolean;
  showTimerNotifications: boolean;
  notificationOverrides: Record<string, boolean>;
  checkNotificationOverrides: boolean;
  alertSpaceTimerNotifications: unknown[];
  defaultFleetArrivalAlert: boolean;
  defaultFleetArrivalAlert_Earth: boolean;
  defaultFleetArrivalAlienModifier: number;
  defaultFleetArrivalAlienModifier_Earth: number;
  mapColorationStyle: string;

  // Alien-related
  alienInvestigations: KeyValuePair<IDValue, unknown>[];
  knownAlienSites: IDValue[];
  highestSpaceStrengthSinceLastAlienKnockdown: number;
  lastDateOfFixedAlienHate: DateTime | null;
  abductions: number;

  // Misc
  councilorsGenerated: boolean;
  objectiveNames: string[];
  knowsWinCondition: boolean;
  numAtrocitiesByCause: Record<string, number>;
  selfAssessement: unknown;
  thisTurnsReveralScore: number;
  alarms: unknown[];
  ignoreContacts: boolean;
  ignoreInterstateDiplomacy: boolean;
}

// Player State
export interface TIPlayerState extends BaseState {
  isAI: boolean;
  faction: IDValue;
  name: string;
  bugReportMessage: string;
}

// Army State
export interface ArmyOperation {
  operationDataName: string;
  target: IDValue & { $type: string };
  startDate: DateTime;
  completionDate: DateTime;
}

export interface TIArmyState extends BaseState {
  currentRegion: IDValue;
  embarkDate: DateTime | null;
  destinationSeaDate: DateTime | null;
  huntingXenofauna: boolean;
  armyDamageEventName: string;
  armyStatusUpdateEventName: string;
  armyOperationCompleteEventName: string;
  faction: IDValue | null;
  homeRegion: IDValue;
  priorRegion: IDValue | null;
  deploymentType: string;
  strength: number;
  controlPointIdx: number;
  createdFromTemplate: boolean;
  currentOperations: ArmyOperation[];
  operationTarget: IDValue | null;
  destroyed: boolean;
  armyType: string;
  gameStateSubjectCreated: boolean;
  displayNameWithArticle: string;
  AI_targetEnemyRegion: IDValue | null;
  destinationQueue: IDValue[];
}

// Org State
export interface TIOrgState extends BaseState {
  orgIconTemplateName: string | null;
  orgIconPath: string;
  displayNameWithArticle: string;
  applyingBonuses: boolean;
  assignedCouncilor: IDValue | null;
  factionOrbit: IDValue | null;
  homeRegion: IDValue;
  tier: number;
  takeoverDefense: number;
  costMoney: number;
  costInfluence: number;
  costOps: number;
  costBoost: number;
  incomeMoney_month: number;
  incomeInfluence_month: number;
  incomeOps_month: number;
  incomeBoost_month: number;
  incomeMissionControl: number;
  incomeResearch_month: number;
  projectCapacityGranted: number;
  persuasion: number;
  command: number;
  investigation: number;
  espionage: number;
  administration: number;
  science: number;
  security: number;
  economyBonus: number;
  welfareBonus: number;
  environmentBonus: number;
  knowledgeBonus: number;
  governmentBonus: number;
  unityBonus: number;
  militaryBonus: number;
  oppressionBonus: number;
  spoilsBonus: number;
  spaceDevBonus: number;
  spaceflightBonus: number;
  MCBonus: number;
  miningBonus: number;
  XPModifier: number;
  gameStateSubjectCreated: boolean;
}

// Orbit State
export interface TIOrbitState extends BaseState {
  amat_ugpy: number;
  assetsInOrbit: IDValue[];
  pendingHabs: number;
  destroyedAssets: number;
  interfaceOrbit: boolean;
  gameStateSubjectCreated: boolean;
  barycenter: IDValue & { $type: string };
}

// Hab Site State
export interface TIHabSiteState extends BaseState {
  parentBody: IDValue;
  hab: IDValue | null;
  landedFleets: IDValue[];
  water_day: number;
  volatiles_day: number;
  metals_day: number;
  nobles_day: number;
  fissiles_day: number;
  latitude: number;
  longitude: number;
  pendingHab: boolean;
  gameStateSubjectCreated: boolean;
  positionOffsetDueToIrregularBody: Vector3;
  barycenter: IDValue | null;
}

// Hab State
export interface RingStruct {
  NE: boolean;
  NW: boolean;
  SE: boolean;
  SW: boolean;
}

export interface ConnStruct {
  C42: boolean;
  C16: boolean;
  C36: boolean;
  C46: boolean;
  C56: boolean;
  C76: boolean;
}

export interface Quaternion {
  x: number;
  y: number;
  z: number;
  w: number;
}

export interface TIHabState extends BaseState {
  habType: "Station" | "Base";
  tier: number;
  advisingCouncilors: IDValue[];
  dockedFleets: IDValue[];
  ringStruct: RingStruct;
  connStruct: ConnStruct;
  underAssault: boolean;
  coreDefendExpiration: DateTime | null;
  createdFromTemplate: boolean;
  inEarthLEO: boolean;
  staticHab: boolean;
  underBombardment: boolean;
  sectors: IDValue[];
  districts: IDValue[] | null;
  habSite: IDValue | null;
  councilorsOnBoard: IDValue[];
  officersOnBoard: IDValue[];
  customHabIconResource: string;
  anyCoreCompleted: boolean;
  coreDefended: boolean;
  gameStateSubjectCreated: boolean;
  _dockedShipAbovePositions: {
    _width: number;
    _height: number;
    _depth: number;
    _worldPosition: Vector3;
    _worldRotation: Quaternion;
    _itemList: (IDValue | null)[];
  };
  habSchematicTemplateName: HabSchematicDataName | null;
  HabSchematicAssignedDate: DateTime | null;
  habSchematic: IDValue | null;
  conflictFleets: IDValue[];
  FarmProvidedResources: string[];
  faction: IDValue;
  orbitState: IDValue | null;
  inCombat: boolean;
  _meanAnomalyAtEpoch_Rad: number;
  _epoch_JYears: number;
  epoch_DateTime: DateTime;
  _rnd_rotationOffset_Deg: number | null;
  globalPosition: Vector3;
  barycenter: IDValue & { $type: string };
}

// Hab Module State
export interface ModuleBuildCost {
  resourceCosts: ResourceCost[];
  completionTime_days: number;
}

export interface TIHabModuleState extends BaseState {
  constructionCompleted: boolean;
  completionDate: string;
  decommissioning: boolean;
  decommissionDate: string;
  powered: boolean;
  slot: number;
  sector: IDValue;
  destroyed: boolean;
  defenseWeaponTemplateName: string | null;
  defenseWeaponTemplateName_gun: string | null;
  defenseWeaponTemplateName_plasma: string | null;
  _spaceCombatValue: number;
  priorModuleTemplateName: string;
  priorModuleCompleted: boolean;
  priorModuleCompletionDate: DateTime | null;
  abilityCooldownEnds: DateTime | null;
  armorChipped: number;
  C0: boolean;
  N1: boolean;
  N2: boolean;
  E1: boolean;
  E2: boolean;
  W1: boolean;
  W2: boolean;
  S1: boolean;
  S2: boolean;
  buildCost: ModuleBuildCost | null;
  shipyardAllowPayFromEarth: boolean;
  lastTimeFiredAtShip: DateTime | null;
  baseBuildDuration_days: number;
  appliedBuildConstructionBonus: number;
  startBuildDate: string;
  destroyedTime: DateTime | null;
}

// Space Fleet State
export interface FleetFormation {
  patternDataName: string | null;
  spacing: string;
  concentration: string;
  focus: string;
}

export interface TrajectorySegmentBase {
  startTime: DateTime;
  barycenter: IDValue & { $type: string };
  isImpulse: boolean;
  isTorch: boolean;
  isOrbitPhasing: boolean;
  $type: string;
}

export interface MicrothrustSegment extends TrajectorySegmentBase {
  endTime: DateTime;
  interruptible: boolean;
  epochTime: DateTime;
  eccentricity: number;
  ascendingNode_rad: number;
  inclination_rad: number;
  argP_rad: number;
  initialVelocity_mps: number;
  initialMeanAnomaly_rad: number;
  fleetCruiseAcceleration_mps2: number;
}

type TrajectorySegment = MicrothrustSegment | (TrajectorySegmentBase & Record<string, unknown>);

interface FleetTrajectoryData {
  initialDeltaV_mps: number;
}

interface FleetLogEntry {
  Label: string;
  Date: DateTime;
  Location: (IDValue & { $type: string }) | null;
  GoalType: string;
  GoalTarget: (IDValue & { $type: string }) | null;
  GoalTargetFaction: IDValue | null;
  ShipCount: number;
  FuelMass_dekatons: number;
}

interface WaitingToInitiateCombatData {
  // [key: string]: unknown;
}

export interface TISpaceFleetState extends BaseState {
  ships: IDValue[];
  formation: FleetFormation;
  savedFormation: FleetFormation;
  trajectory: {
    Segments: TrajectorySegment[];
    commonBarycenter: IDValue & { $type: string };
    originOrbit: IDValue;
    destinationOrbit: IDValue;
    destinationFleet: IDValue | null;
    prevDestinationFleet: IDValue | null;
    destinationStation: IDValue | null;
    destination: IDValue & { $type: string };
    destinationFleetTrajectory: unknown | null;
    fleetCruiseAcceleration_mps2: number;
    boostDV_mps: number;
    decelDV_mps: number;
    assignedTime: DateTime;
    launchTime: DateTime;
    arrivalTime: DateTime;
    launchPosition: Vector3;
    destinationPosition: Vector3;
    aerocapture: boolean;
    flyby: boolean;
    resupplyOnArrival: boolean;
    interceptTrajectory: boolean;
    duration: string;
    fleetAsSpaceFleetState: IDValue;
    launched: boolean;
    involuntary: boolean;
    collisionTarget: IDValue | null;
    exitsSolarSystem: boolean;
    originalDestinationSunOrbiter: IDValue | null;
    destinationOrbitMeanAnomalyAtEpoch: number | null;
    destinationOrbitEpoch: DateTime | null;
    nextTrajectory: unknown | null;
    loiterDuration_s: number;
    prepositionDuration_s: number;
    boostDuration_s: number;
    coastDuration_s: number;
    decelDuration_s: number;
    captureDuration_s: number;
    distanceToDestinationHillSphere_m: number;
    DV_targetFleet_mps: number;
    $type: string;
  } | null;
  propellantSharingPlan: unknown | null;
  inAccelerationPhase: boolean;
  inDecelerationPhase: boolean;
  unavailableForOperations: boolean;
  returnToOperationsTime: DateTime | null;
  huntingXenofauna: boolean;
  bombardmentTarget: IDValue | null;
  fleetOperationCompleteName: string;
  homeport: IDValue | null;
  barycenter: IDValue & { $type: string };
  dockOffset: Vector3;
  proposedTrajectories: unknown | null;
  displayNameByFaction: KeyValuePair<IDValue, string>[];
  currentOperations: {
    operationDataName: string;
    startDate?: DateTime;
    completionDate?: DateTime;
  }[];
  dockedLocation: (IDValue & { $type: string }) | null;
  _fleetTrajectoryData: FleetTrajectoryData | null;
  combatState: unknown | null;
  parentFleet: IDValue | null;
  alwaysShowOrbitTrailDuringTransfer: boolean;
  AI_FailedAttackEnemyStrength: Record<string, number>;
  unreachableLocations: IDValue[];
  gameStateSubjectCreated: boolean;
  dummyFleet: boolean;
  bombardmentAltitude_km: number;
  timeOfLastFireMission: DateTime | null;
  delayedTransferAbortNotification: unknown | null;
  campaignStartLocation: (IDValue & { $type: string }) | null;
  endBombardmentReason: string;
  bombardmentTargetBracketStatus: string;
  firstHitFromBombardmentRun: boolean;
  officerTransferPlan: unknown | null;
  waitingToInitiateCombatDatas: WaitingToInitiateCombatData[] | null;
  Logs: FleetLogEntry[];
  faction: IDValue;
  orbitState: IDValue | null;
  inCombat: boolean;
  _meanAnomalyAtEpoch_Rad: number;
  _epoch_JYears: number;
  epoch_DateTime: DateTime;
  _rnd_rotationOffset_Deg: number | null;
  globalPosition: Vector3;
}

// Space Ship State
export interface ShipModuleSlot {
  moduleTemplateName: string;
  slotIndex: number;
  $id: string;
  $ref?: string;
}

export interface ShipArmor {
  maxArmor: number;
  armorValue: number;
  chippedPct: number;
}

export interface TISpaceShipState extends BaseState {
  cruiseAcceleration_mps2: number;
  combatAcceleration_mps2: number;
  currentDeltaV_kps: number;
  currentMaxDeltaV_kps: number;
  currentMass_kg: number;
  angular_acceleration_rads2: number;
  max_angular_velocity_rad_s: number;
  missionControlConsumption: number;
  radiatorsExtending: boolean;
  radiatorsRetracting: boolean;
  radiatorsExtended: boolean;
  accumulatedHeat_GJ: number;
  currentHeatSinkCapacity_GJ: number;
  thrustersActive: boolean;
  canSuicide: boolean;
  combatAIControl: boolean;
  disengageFromCombat: boolean;
  hasDisengaged: boolean;
  isDamageControlSuspended: boolean;
  combatPrimaryTarget: IDValue | null;
  combatManeuverTarget: IDValue | null;
  ammo: KeyValuePair<ShipModuleSlot, number>[];
  fleet: IDValue;
  fleetFormationOffset: Vector3;
  propulsionValuesDataDirty: boolean;
  launchDate: DateTime;
  lastRefitDate: DateTime | null;
  homeRegion: IDValue | null;
  noseWeapons: ShipModuleSlot[];
  hullWeapons: ShipModuleSlot[];
  utilityModules: ShipModuleSlot[];
  activeCombatManeuvers: string | null;
  armor: {
    Nose: ShipArmor;
    Left: ShipArmor;
    Right: ShipArmor;
    Tail: ShipArmor;
  };
  propellant_tons: number;
  kills: string[];
  officers: IDValue[];
  damagedSystems: Record<string, number>;
  damagedParts: { module: ShipModuleSlot; damage: number }[];
  damagePoints: Vector3[];
  prevPartsBeingRepaired: ShipModuleSlot[];
  // [key: string]: unknown;
}

// Mission State
export interface TIMissionState extends BaseState {
  resources: number;
  resolveTimeAssigned: boolean;
  startTime: DateTime | null;
  resolveTime: DateTime | null;
  target: IDValue & { $type: string };
  councilor: IDValue;
  missionOutcome: string;
}

// Global Research State
export interface TechProgress {
  techTemplateName: string;
  accumulatedResearch: number;
  factionContributions: KeyValuePair<IDValue, number>[];
  selector: IDValue | null;
}

export interface TIGlobalResearchState extends BaseState {
  finishedTechsNames: string[];
  finishedOneTimeOnlyProjectNames: string[];
  techProgress: TechProgress[];
  // [key: string]: unknown;
}

// Global Values State
export interface ResourceMarketValues {
  Water: number;
  Volatiles: number;
  Metals: number;
  NobleMetals: number;
  Fissiles: number;
  Antimatter: number;
  Exotics: number;
}

export interface MaxGlobalExpectedHabSiteProduction {
  Water: number;
  Volatiles: number;
  Metals: number;
  NobleMetals: number;
  Fissiles: number;
}

export interface CO2Sources {
  SpoilsPriority: number;
  EnvironmentPriority: number;
  Nations: number;
  NaturalRemoval: number;
  Xenoforming: number;
  Effect: number;
}

export interface CustomFactionText {
  customDisplayName: string;
  customAdjective: string;
  customLeaderAddress: string;
  customFleetNameBase: string;
  customSmallShipNameListIdx: string | null;
  customMediumShipNameListIdx: string | null;
  customLargeShipNameListIdx: string | null;
  customHabNameListIdx: string | null;
}

export interface ScenarioCustomizations {
  usingCustomizations: boolean;
  customDifficulty: boolean;
  customFactionText: Record<string, CustomFactionText>;
  customFactionStartingNationGroup: Record<string, string[]>;
  startingCouncilorProfessions: string[];
  skipStartingCouncilors: boolean[];
  usePlayerCountryForStartingCouncilor: boolean;
  variableProjectUnlocks: boolean;
  showTriggeredProjects: boolean;
  addAlienAssaultCarrierFleet: boolean;
  otherFactionStartingNations: boolean;
  selectedFactionsForScenario: string[];
  researchSpeedMultiplier: number;
  controlPointMaintenanceFreebieBonus: number;
  controlPointMaintenanceFreebieBonusAI: number;
  missionControlBonus: number;
  missionControlBonusAI: number;
  alienProgressionSpeed: number;
  miningProductivityMultiplier: number;
  nationalIPMultiplier: number;
  averageMonthlyEvents: number;
  cinematicCombatRealismDV: boolean;
  cinematicCombatRealismScale: boolean;
  miningRatePlayer: number;
  miningRateHumanAI: number;
  miningRateAlien: number;
  habConstructionSpeedPlayer: number;
  habConstructionSpeedHumanAI: number;
  habConstructionSpeedAlien: number;
  shipConstructionSpeedPlayer: number;
  shipConstructionSpeedHumanAI: number;
  shipConstructionSpeedAlien: number;
}

export interface TIGlobalValuesState extends BaseState {
  earthAtmosphericCO2_ppm: number;
  earthAtmosphericCH4_ppm: number;
  earthAtmosphericN2O_ppm: number;
  stratosphericAerosols_ppm: number;
  globalSeaLevelAnomaly_cm: number;
  initialSustainabilityMin: number;
  nuclearStrikes: number;
  looseNukes: number;
  difficulty: number;
  bestGlobalHumanMiltech: number;
  controlPointMaintenanceFreebies: number;
  campaignStartVersion: string;
  latestSaveVersion: string;
  realWorldCampaignStart: DateTime;
  maxGlobalExpectedHabSiteProduction_day: MaxGlobalExpectedHabSiteProduction;
  gameStateSubjectCreated: boolean;
  resourceMarketValues: ResourceMarketValues;
  pastEarthAtmosphericCO2_ppm: number[];
  pastEarthAtmosphericCH4_ppm: number[];
  pastEarthAtmosphericN2O_ppm: number[];
  globalSeaLevelRise1Triggered: boolean;
  globalSeaLevelRise2Triggered: boolean;
  endOfOil: boolean;
  CO2SourcesRecord_ppm: CO2Sources;
  CH4SourcesRecord_ppm: CO2Sources;
  N2OSourcesRecord_ppm: CO2Sources;
  scenarioCustomizations: ScenarioCustomizations;
  // [key: string]: unknown;
}

// Space Facility States
export interface TILaunchFacilityState extends BaseState {
  spaceFacilityType: string;
  region: IDValue;
  gameStateSubjectCreated: boolean;
}

export interface TIMissionControlFacilityState extends BaseState {
  spaceFacilityType: string;
  region: IDValue;
  gameStateSubjectCreated: boolean;
}

export interface TISpaceDefensesFacilityState extends BaseState {
  weaponTemplateName: string | null;
  lastTimeFired: DateTime | null;
  spaceFacilityType: string;
  region: IDValue;
  gameStateSubjectCreated: boolean;
}

// Alien-related Region States
export interface TIRegionAlienFacilityState extends BaseState {
  built: boolean;
  currentHP: number;
  region: IDValue;
  gameStateSubjectCreated: boolean;
}

export interface TIRegionAlienActivityState extends BaseState {
  alienMissionsDetected: KeyValuePair<IDValue, string[]>[];
  region: IDValue;
  gameStateSubjectCreated: boolean;
}

export interface TIRegionUFOLandingState extends BaseState {
  landingPresent: boolean;
  deployingArmy: boolean;
  supportingArmyBuildup: boolean;
  currentHP: number;
  region: IDValue;
  gameStateSubjectCreated: boolean;
}

export interface TIRegionUFOCrashdownState extends BaseState {
  crashdownPresent: boolean;
  crashdownTime: DateTime | null;
  region: IDValue;
  gameStateSubjectCreated: boolean;
}

export interface TIRegionXenoformingState extends BaseState {
  xenoformingLevel: number;
  region: IDValue;
  gameStateSubjectCreated: boolean;
}

// Sector State
export interface TISectorState extends BaseState {
  faction: IDValue;
  sectorNum: number;
  hab: IDValue;
  habModules: IDValue[];
  slots: number;
}

// Federation State
export interface TIFederationState extends BaseState {
  members: IDValue[];
  federationName: string;
  flagResource: string;
  displayNameWithArticle: string;
  displayNameWithArticleCapitalized: string;
  adjective: string;
  lastAttemptToLeaveDarkFederation: KeyValuePair<IDValue, DateTime>[];
}

// Mission Phase State
export interface TIMissionPhaseState extends BaseState {
  phaseActive: boolean;
  newCampaignStart: boolean;
  factionsSignallingComplete: IDValue[];
}

// Effects State
export interface TIEffectsState extends BaseState {
  factionEffectsNames: KeyValuePair<IDValue, Record<string, string[]>>[];
  // [key: string]: unknown;
}

// Historical Data State
export interface TIHistoricalData extends BaseState {
  Data: KeyValuePair<IDValue & { $type: string }, Record<string, KeyValuePair<DateTime, number>[]>>[];
  // [key: string]: unknown;
}

// Time Event State
export interface TITimeEvent extends BaseState {
  triggerTime: DateTime;
  eventObjectID: IDValue;
  eventObject2ID: IDValue;
  eventDataTemplateName: string | null;
  eventName: string;
  repeatType: string;
  timeStep: number;
  stopClock: boolean;
  pauseTime: boolean;
  combatEvent: boolean;
  isComplete: boolean;
  repeatChangeTriggered: boolean[] | null;
  startMonth: number;
}

// Notification and Prompt Queue States
export interface Color {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface NotificationSummary {
  templateName: string;
  itemSummary: string;
  dateTimeString: string;
  iconResource: string;
  iconBackgroundResource: string | null;
  backgroundColor: Color;
  outcome: string;
  gotoGameState: (IDValue & { $type: string }) | null;
  alienRelated: boolean;
  dateTime: DateTime;
  timerFactions: IDValue[];
  newsFeedFactions: IDValue[];
  summaryLogFactions: IDValue[];
  $id?: string;
}

export interface TINotificationQueueState extends BaseState {
  notificationSummaryQueue: NotificationSummary[];
}

export interface PromptItem {
  actingState: IDValue & { $type: string };
  promptingGameState: IDValue & { $type: string };
  relatedGameState: (IDValue & { $type: string }) | null;
  name: string;
  value: number;
}

export interface TIPromptQueueState extends BaseState {
  activePlayerNationPromptList: PromptItem[];
  activePlayerFactionPromptList: PromptItem[];
  nationList: PromptItem[];
  factionList: PromptItem[];
  gameStateSubjectCreated: boolean;
}

// Faction Goal types
export interface FactionGoalBase extends BaseState {
  importance: number;
  faction: IDValue;
  assignedDate: DateTime;
  objectiveTemplateName: string | null;
  subsequentGoals: string[] | null;
}

export interface FactionGoal_FoundBase extends FactionGoalBase {
  site: IDValue;
  setAsPrimaryHab: boolean;
  requiredModuleNames: string[];
  assignedFleet: IDValue;
  resupplyHab: IDValue | null;
  flyByLocation: IDValue | null;
  learnedPerformanceRequirements: Record<string, number>;
  pendingFleets: IDValue[];
  dynamicAttackTarget: IDValue | null;
}

export interface FactionGoal_BuildMiningBase extends FactionGoalBase {
  hab: IDValue;
  specialtyModuleDataNames: string[] | null;
}

export interface FactionGoal_SurveilEarth extends FactionGoalBase {
  assignedFleet: IDValue;
  resupplyHab: IDValue | null;
  flyByLocation: IDValue | null;
  learnedPerformanceRequirements: Record<string, number>;
  pendingFleets: IDValue[];
  dynamicAttackTarget: IDValue | null;
}

export interface FactionGoal_TransportCouncilorsWithFleet extends FactionGoalBase {
  councilorDestination: IDValue & { $type: string };
  assignedCouncilors: IDValue[];
  assignedFleet: IDValue;
  resupplyHab: IDValue | null;
  flyByLocation: IDValue | null;
  learnedPerformanceRequirements: Record<string, number>;
  pendingFleets: IDValue[];
  dynamicAttackTarget: IDValue | null;
}

export interface FactionGoal_BuildFullStation extends FactionGoalBase {
  hab: IDValue;
  specialtyModuleDataNames: string[] | null;
}

export interface FactionGoal_CaptureNation_Clean extends FactionGoalBase {
  nation: IDValue;
}

export interface FactionGoal_DefendWithFleet extends FactionGoalBase {
  defendTarget: IDValue & { $type: string };
  forceHullTemplateName: string;
  EarmarkedFleetMC: number;
  assignedFleet: IDValue | null;
  resupplyHab: IDValue | null;
  flyByLocation: IDValue | null;
  learnedPerformanceRequirements: Record<string, number>;
  pendingFleets: IDValue[];
  dynamicAttackTarget: IDValue | null;
}

export interface FactionGoal_JoinFleet extends FactionGoalBase {
  targetFleet: IDValue;
  targetFleetGoal: IDValue | null;
  assignedFleet: IDValue;
  resupplyHab: IDValue | null;
  flyByLocation: IDValue | null;
  learnedPerformanceRequirements: Record<string, number>;
  pendingFleets: IDValue[];
  dynamicAttackTarget: IDValue | null;
}

export interface FactionGoal_SpaceifyNation extends FactionGoalBase {
  nation: IDValue;
}

export interface SaveFile {
  currentID: IDValue;
  gamestates: {
    "PavonisInteractive.TerraInvicta.TIMetadataState": KeyValuePair<IDValue, TIMetadataState>[];
    "PavonisInteractive.TerraInvicta.TISpaceBodyState": KeyValuePair<IDValue, TISpaceBodyState>[];
    "PavonisInteractive.TerraInvicta.TILagrangePointState": KeyValuePair<IDValue, TILagrangePointState>[];
    "PavonisInteractive.TerraInvicta.TITimeState": KeyValuePair<IDValue, TITimeState>[];
    "PavonisInteractive.TerraInvicta.TIRegionState": KeyValuePair<IDValue, TIRegionState>[];
    "PavonisInteractive.TerraInvicta.TILaunchFacilityState": KeyValuePair<IDValue, TILaunchFacilityState>[];
    "PavonisInteractive.TerraInvicta.TIMissionControlFacilityState": KeyValuePair<
      IDValue,
      TIMissionControlFacilityState
    >[];
    "PavonisInteractive.TerraInvicta.TISpaceDefensesFacilityState": KeyValuePair<
      IDValue,
      TISpaceDefensesFacilityState
    >[];
    "PavonisInteractive.TerraInvicta.TIRegionAlienFacilityState": KeyValuePair<IDValue, TIRegionAlienFacilityState>[];
    "PavonisInteractive.TerraInvicta.TIRegionAlienActivityState": KeyValuePair<IDValue, TIRegionAlienActivityState>[];
    "PavonisInteractive.TerraInvicta.TIRegionUFOLandingState": KeyValuePair<IDValue, TIRegionUFOLandingState>[];
    "PavonisInteractive.TerraInvicta.TIRegionUFOCrashdownState": KeyValuePair<IDValue, TIRegionUFOCrashdownState>[];
    "PavonisInteractive.TerraInvicta.TIRegionXenoformingState": KeyValuePair<IDValue, TIRegionXenoformingState>[];
    "PavonisInteractive.TerraInvicta.TINationState": KeyValuePair<IDValue, TINationState>[];
    "PavonisInteractive.TerraInvicta.TIControlPoint": KeyValuePair<IDValue, TIControlPoint>[];
    "PavonisInteractive.TerraInvicta.TIArmyState": KeyValuePair<IDValue, TIArmyState>[];
    "PavonisInteractive.TerraInvicta.TICouncilorState": KeyValuePair<IDValue, TICouncilorState>[];
    "PavonisInteractive.TerraInvicta.TISpaceFleetState": KeyValuePair<IDValue, TISpaceFleetState>[];
    "PavonisInteractive.TerraInvicta.TIOrgState": KeyValuePair<IDValue, TIOrgState>[];
    "PavonisInteractive.TerraInvicta.TIHabState": KeyValuePair<IDValue, TIHabState>[];
    "PavonisInteractive.TerraInvicta.TITimeEvent": KeyValuePair<IDValue, TITimeEvent>[];
    "PavonisInteractive.TerraInvicta.TIFactionState": KeyValuePair<IDValue, TIFactionState>[];
    "PavonisInteractive.TerraInvicta.TIPlayerState": KeyValuePair<IDValue, TIPlayerState>[];
    "PavonisInteractive.TerraInvicta.TIOrbitState": KeyValuePair<IDValue, TIOrbitState>[];
    "PavonisInteractive.TerraInvicta.TIHabSiteState": KeyValuePair<IDValue, TIHabSiteState>[];
    "PavonisInteractive.TerraInvicta.TISpaceShipState": KeyValuePair<IDValue, TISpaceShipState>[];
    "PavonisInteractive.TerraInvicta.TISectorState": KeyValuePair<IDValue, TISectorState>[];
    "PavonisInteractive.TerraInvicta.TIHabModuleState": KeyValuePair<IDValue, TIHabModuleState>[];
    "PavonisInteractive.TerraInvicta.TIFederationState": KeyValuePair<IDValue, TIFederationState>[];
    "PavonisInteractive.TerraInvicta.TIMissionPhaseState": KeyValuePair<IDValue, TIMissionPhaseState>[];
    "PavonisInteractive.TerraInvicta.TINotificationQueueState": KeyValuePair<IDValue, TINotificationQueueState>[];
    "PavonisInteractive.TerraInvicta.TIEffectsState": KeyValuePair<IDValue, TIEffectsState>[];
    "PavonisInteractive.TerraInvicta.TIGlobalResearchState": KeyValuePair<IDValue, TIGlobalResearchState>[];
    "PavonisInteractive.TerraInvicta.TIGlobalValuesState": KeyValuePair<IDValue, TIGlobalValuesState>[];
    "PavonisInteractive.TerraInvicta.TIPromptQueueState": KeyValuePair<IDValue, TIPromptQueueState>[];
    TIHistoricalData: KeyValuePair<IDValue, TIHistoricalData>[];
    "PavonisInteractive.TerraInvicta.FactionGoal_FoundBase": KeyValuePair<IDValue, FactionGoal_FoundBase>[];
    "PavonisInteractive.TerraInvicta.FactionGoal_SurveilEarth": KeyValuePair<IDValue, FactionGoal_SurveilEarth>[];
    "PavonisInteractive.TerraInvicta.FactionGoal_TransportCouncilorsWithFleet": KeyValuePair<
      IDValue,
      FactionGoal_TransportCouncilorsWithFleet
    >[];
    "PavonisInteractive.TerraInvicta.FactionGoal_BuildFullStation": KeyValuePair<
      IDValue,
      FactionGoal_BuildFullStation
    >[];
    "PavonisInteractive.TerraInvicta.FactionGoal_CaptureNation_Clean": KeyValuePair<
      IDValue,
      FactionGoal_CaptureNation_Clean
    >[];
    "PavonisInteractive.TerraInvicta.TIMissionState": KeyValuePair<IDValue, TIMissionState>[];
    "PavonisInteractive.TerraInvicta.FactionGoal_DefendWithFleet": KeyValuePair<IDValue, FactionGoal_DefendWithFleet>[];
    "PavonisInteractive.TerraInvicta.FactionGoal_BuildMiningBase": KeyValuePair<IDValue, FactionGoal_BuildMiningBase>[];
    "PavonisInteractive.TerraInvicta.FactionGoal_JoinFleet": KeyValuePair<IDValue, FactionGoal_JoinFleet>[];
    "PavonisInteractive.TerraInvicta.FactionGoal_SpaceifyNation": KeyValuePair<IDValue, FactionGoal_SpaceifyNation>[];
    // [key: string]: KeyValuePair<IDValue, BaseState>[];
  };
}
