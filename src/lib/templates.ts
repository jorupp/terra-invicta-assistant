import { readFile } from "fs/promises";
import path from "path";
import JSON5 from "json5";

const templateDir = process.env.TEMPLATE_DIR!;
if (!templateDir) {
  throw new Error("TEMPLATE_DIR environment variable is not set.");
}

const cachedTemplates: { [K in keyof templateMap]?: templateMap[K] } = {};
export async function getTemplate<TemplateName extends keyof templateMap, TemplateData extends templateMap[TemplateName]>(filename: TemplateName): Promise<TemplateData> {
    if (cachedTemplates[filename]) {
        return cachedTemplates[filename] as TemplateData;
    }
    const filePath = path.join(templateDir, filename);
    const content = await readFile(filePath, 'utf8');
    try {
        const data: TemplateData = JSON5.parse(content);
        cachedTemplates[filename] = data;
        return data;
    } catch (e) {
        console.error(`Error parsing JSON from file ${filePath}:`, e);
        throw e;
    }
}

export const templates = {
    shipHulls: () => getTemplate('TIShipHullTemplate.json'),
    orgs: () => getTemplate('TIOrgTemplate.json'),
    armies: () => getTemplate('TIArmyTemplate.json'),
    batteries: () => getTemplate('TIBatteryTemplate.json'),
    bilaterals: () => getTemplate('TIBilateralTemplate.json'),
    cinematics2D: () => getTemplate('TI2DCinematicTemplate.json'),
    codexEntries: () => getTemplate('TICodexEntryTemplate.json'),
    councilorAppearances: () => getTemplate('TICouncilorAppearanceTemplate.json'),
    councilors: () => getTemplate('TICouncilorTemplate.json'),
    councilorTypes: () => getTemplate('TICouncilorTypeTemplate.json'),
    councilorVoices: () => getTemplate('TICouncilorVoiceTemplate.json'),
    drives: () => getTemplate('TIDriveTemplate.json'),
    effects: () => getTemplate('TIEffectTemplate.json'),
    factionIdeologies: () => getTemplate('TIFactionIdeologyTemplate.json'),
    factions: () => getTemplate('TIFactionTemplate.json'),
    formations: () => getTemplate('TIFormationTemplate.json'),
    globalConfig: () => getTemplate('TIGlobalConfig.json'),
    guns: () => getTemplate('TIGunTemplate.json'),
    habModules: () => getTemplate('TIHabModuleTemplate.json'),
    habs: () => getTemplate('TIHabTemplate.json'),
    habSchematics: () => getTemplate('TIHabSchematicTemplate.json'),
    habSites: () => getTemplate('TIHabSiteTemplate.json'),
    heatSinks: () => getTemplate('TIHeatSinkTemplate.json'),
    laserWeapons: () => getTemplate('TILaserWeaponTemplate.json'),
    localizations: () => getTemplate('TILocalizationTemplate.json'),
    magneticGuns: () => getTemplate('TIMagneticGunTemplate.json'),
    mapGroupVisualizers: () => getTemplate('TIMapGroupVisualizerTemplate.json'),
    mapRegions: () => getTemplate('TIMapRegionTemplate.json'),
    metas: () => getTemplate('TIMetaTemplate.json'),
    miningProfiles: () => getTemplate('TIMiningProfileTemplate.json'),
    missiles: () => getTemplate('TIMissileTemplate.json'),
    missions: () => getTemplate('TIMissionTemplate.json'),
    narrativeEvents: () => getTemplate('TINarrativeEventTemplate.json'),
    nations: () => getTemplate('TINationTemplate.json'),
    navigables: () => getTemplate('TINavigableTemplate.json'),
    notifications: () => getTemplate('TINotificationTemplate.json'),
    objectives: () => getTemplate('TIObjectiveTemplate.json'),
    officers: () => getTemplate('TIOfficerTemplate.json'),
    orbits: () => getTemplate('TIOrbitTemplate.json'),
    orgIcons: () => getTemplate('TIOrgIconTemplate.json'),
    particleWeapons: () => getTemplate('TIParticleWeaponTemplate.json'),
    plasmaWeapons: () => getTemplate('TIPlasmaWeaponTemplate.json'),
    players: () => getTemplate('TIPlayerTemplate.json'),
    powerPlants: () => getTemplate('TIPowerPlantTemplate.json'),
    priorityPresets: () => getTemplate('TIPriorityPresetTemplate.json'),
    projects: () => getTemplate('TIProjectTemplate.json'),
    radiators: () => getTemplate('TIRadiatorTemplate.json'),
    regions: () => getTemplate('TIRegionTemplate.json'),
    shipArmor: () => getTemplate('TIShipArmorTemplate.json'),
    spaceBodies: () => getTemplate('TISpaceBodyTemplate.json'),
    spaceCombats: () => getTemplate('TISpaceCombatTemplate.json'),
    spaceFleets: () => getTemplate('TISpaceFleetTemplate.json'),
    spaceShips: () => getTemplate('TISpaceShipTemplate.json'),
    startTimes: () => getTemplate('TIStartTimeTemplate.json'),
    techs: () => getTemplate('TITechTemplate.json'),
    timeEvents: () => getTemplate('TITimeEventTemplate.json'),
    traits: () => getTemplate('TITraitTemplate.json'),
    utilityModules: () => getTemplate('TIUtilityModuleTemplate.json'),
    victories: () => getTemplate('TIVictoryTemplate.json'),
}

type templateMap = {
    'TIShipHullTemplate.json': ShipHull[];
    'TIOrgTemplate.json': Org[];
    'TIArmyTemplate.json': Army[];
    'TIBatteryTemplate.json': Battery[];
    'TIBilateralTemplate.json': Bilateral[];
    'TI2DCinematicTemplate.json': Cinematic2D[];
    'TICodexEntryTemplate.json': CodexEntry[];
    'TICouncilorAppearanceTemplate.json': CouncilorAppearance[];
    'TICouncilorTemplate.json': Councilor[];
    'TICouncilorTypeTemplate.json': CouncilorType[];
    'TICouncilorVoiceTemplate.json': CouncilorVoice[];
    'TIDriveTemplate.json': Drive[];
    'TIEffectTemplate.json': Effect[];
    'TIFactionIdeologyTemplate.json': FactionIdeology[];
    'TIFactionTemplate.json': Faction[];
    'TIFormationTemplate.json': Formation[];
    'TIGlobalConfig.json': GlobalConfig;
    'TIGunTemplate.json': Gun[];
    'TIHabModuleTemplate.json': HabModule[];
    'TIHabTemplate.json': Hab[];
    'TIHabSchematicTemplate.json': HabSchematic[];
    'TIHabSiteTemplate.json': HabSite[];
    'TIHeatSinkTemplate.json': HeatSink[];
    'TILaserWeaponTemplate.json': LaserWeapon[];
    'TILocalizationTemplate.json': Localization[];
    'TIMagneticGunTemplate.json': MagneticGun[];
    'TIMapGroupVisualizerTemplate.json': MapGroupVisualizer[];
    'TIMapRegionTemplate.json': MapRegion[];
    'TIMetaTemplate.json': Meta[];
    'TIMiningProfileTemplate.json': MiningProfile[];
    'TIMissileTemplate.json': Missile[];
    'TIMissionTemplate.json': Mission[];
    'TINarrativeEventTemplate.json': NarrativeEvent[];
    'TINationTemplate.json': Nation[];
    'TINavigableTemplate.json': Navigable[];
    'TINotificationTemplate.json': Notification[];
    'TIObjectiveTemplate.json': Objective[];
    'TIOfficerTemplate.json': Officer[];
    'TIOrbitTemplate.json': Orbit[];
    'TIOrgIconTemplate.json': OrgIcon[];
    'TIParticleWeaponTemplate.json': ParticleWeapon[];
    'TIPlasmaWeaponTemplate.json': PlasmaWeapon[];
    'TIPlayerTemplate.json': Player[];
    'TIPowerPlantTemplate.json': PowerPlant[];
    'TIPriorityPresetTemplate.json': PriorityPreset[];
    'TIProjectTemplate.json': Project[];
    'TIRadiatorTemplate.json': Radiator[];
    'TIRegionTemplate.json': Region[];
    'TIShipArmorTemplate.json': ShipArmor[];
    'TISpaceBodyTemplate.json': SpaceBody[];
    'TISpaceCombatTemplate.json': SpaceCombat[];
    'TISpaceFleetTemplate.json': SpaceFleet[];
    'TISpaceShipTemplate.json': SpaceShip[];
    'TIStartTimeTemplate.json': StartTime[];
    'TITechTemplate.json': Tech[];
    'TITimeEventTemplate.json': TimeEvent[];
    'TITraitTemplate.json': Trait[];
    'TIUtilityModuleTemplate.json': UtilityModule[];
    'TIVictoryTemplate.json': Victory[];
};

export interface Org {
    dataName: string;
    friendlyName: string;
    randomized: boolean;
    orgType: string;
    tier: number;
    takeoverDefense: number;
    allowedOnMarket: boolean;
    homeRegionMapTemplateName: string;
    requiresNationality: boolean;
    requiredOwnerTraits: string[];
    prohibitedOwnerTraits: string[];
    affinities: string[];
    costInfluence: number;
    chanceIncomeMoney: number;
    incomeMoney: number;
    chanceIncomeInfluence: number;
    incomeInfluence: number;
    chanceIncomeOps: number;
    incomeOps: number;
    chancePersuasion: number;
    persuasion: number;
    chanceInvestigation: number;
    investigation: number;
    chanceEspionage: number;
    espionage: number;
    chanceAdministration: number;
    administration: number;
    chanceScience: number;
    science: number;
    chanceSecurity: number;
    security: number;
    techBonuses: Array<{
        category: string;
        bonus: number;
    }>;
    missionsGrantedNames: string[];
    grantsMarked: boolean;
    iconResource: string;
}

export interface ShipHull {
    dataName: string;
    friendlyName: string;
    noseHardpoints: number;
    hullHardpoints: number;
    internalModules: number;
    consTier: number;
    maxOfficers: number;
    length_m: number;
    toylength_cm: number;
    width_m: number;
    volume: number;
    thrusterMultiplier: number;
    structuralIntegrity: number;
    mass_tons: number;
    crew: number;
    alien: boolean;
    noShipyardBuild: boolean;
    simpleHull: boolean;
    monthlyIncome_Money: number;
    missionControl: number;
    baseConstructionTime_days: number;
    shipyardyOffset: [number, number, number];
    modelResource: string[];
    combatUIpath: string[];
    path1: string[];
    path2: string[];
    requiredProjectName: string;
    weightedBuildMaterials: {
        volatiles: number;
        metals: number;
        nobleMetals: number;
    };
    shipModuleSlots: Array<{
        moduleSlotType: string;
        x: number;
        y: number;
    }>;
}

export interface Army {
    dataName: string;
    friendlyName: string;
    startRegionStr: string;
    homeRegionStr: string;
    armyType: string;
    deploymentType: string;
    startingStrength: number;
}

export interface Battery {
    dataName: string;
    friendlyName: string;
    grouping: number;
    energyCapacity_GJ: number;
    rechargeRate_GJs: number;
    weightedBuildMaterials: {
        volatiles: number;
        metals: number;
        nobleMetals: number;
        fissiles: number;
        exotics: number;
    };
    crew: number;
    mass_tons: number;
    hp: number;
    iconResource: string;
}

export interface Bilateral {
    dataName: string;
    relationType: string;
    nation1: string;
    nation2: string;
}

export interface CodexEntry {
    dataName: string;
    index: number;
    mainTopic: boolean;
    locPath: string;
}

export interface CouncilorAppearance {
    dataName: string;
    string: string;
    enable: boolean;
    idleVideoYoung: string;
    idleVideoOld: string;
    portraitYoung: string;
    portraitOld: string;
    iconYoung: string;
    iconOld: string;
    allowedGenders: string[];
    allowedAncestries: string[];
    allowedJobNames: string[];
}

export interface Councilor {
    dataName: string;
    randomized: boolean;
    alien: boolean;
    randomizeTraits: boolean;
    allowRandomOnlyTraits: boolean;
    allowedIdeologies: string[];
    debugOnly: boolean;
}

export interface CouncilorType {
    dataName: string;
    friendlyName: string;
    iconStr: string;
    weight: number;
    basePersuasion: number;
    randPersuasion: number;
    baseCommand: number;
    randCommand: number;
    baseEspionage: number;
    randEspionage: number;
    baseInvestigation: number;
    randInvestigation: number;
    baseAdministration: number;
    randAdministration: number;
    baseScience: number;
    randScience: number;
    baseSecurity: number;
    randSecurity: number;
    baseLoyalty: number;
    randLoyalty: number;
    affinities: string[];
    missionNames: string[];
    keyStat: string[];
    antiAffinities: string[];
}

export interface Drive {
    dataName: string;
    friendlyName: string;
    thrusters: number;
    notes: string;
    driveClassification: string;
    requiredProjectName: string;
    thrust_N: number;
    EV_kps: number;
    specificPower_kgMW: number;
    efficiency: number;
    thrustRating_GW: string;
    "req power": string;
    flatMass_tons: number;
    requiredPowerPlant: string;
    thrustCap: number;
    cooling: string;
    powerGen: string;
    weightedBuildMaterials: {
        water: number;
        volatiles: number;
        metals: number;
        exotics: number;
    };
    propellant: string;
    perTankPropellantMaterials: {
        water: number;
        volatiles: number;
        metals: number;
        nobleMetals: number;
        fissiles: number;
        antimatter: number;
        exotics: number;
    };
    iconResource: string;
}

export interface Effect {
    dataName: string;
    operation: string;
    value: number;
    effectTarget: string;
    effectDuration: string;
    stackable: boolean;
    duration_months: number;
    contexts: string[];
}

export interface FactionIdeology {
    dataName: string;
    alien: boolean;
    undecided: boolean;
    sortOrder: number;
    willProxy: number;
    willAppease: number;
    initialReactionGroup: number;
    ideology: string;
    ideologyCoordinates: {
        x: number;
        y: number;
        z: number;
    };
}

export interface Faction {
    dataName: string;
    friendlyName: string;
    color: {
        r: number;
        g: number;
        b: number;
        a: number;
    };
    colorIntensity: number;
    backgroundColor: string;
    playerMood: number;
    encMood: number;
    ideologyName: string;
    victoryTemplateName: string;
    winningOrg: string;
    spaceOrg: string;
    isAlien: boolean;
    activePlayerAllowed: boolean;
    allowedSoleAntiAlien: boolean;
    defaultAntiAlien: boolean;
    difficulty: number;
    tutorialAllowed: boolean;
    hullSkinBase: string;
    armySkinBase: string;
    leaderDataname: string;
    defaultPresetName: string;
    hullIndex_default: number;
    hullIndex_chem: number;
    hullIndex_electric: number;
    hullIndex_fission: number;
    hullIndex_fusion: number;
    hullIndex_amat: number;
    councilIcon64: string;
    councilIcon64_ui: string;
    councilIcon128: string;
    councilIcon128_ui: string;
    councilIcon256: string;
    councilIcon256_ui: string;
    armyIcon: string;
    fleetIcon: string;
    stationIcon: string;
    baseIcon: string;
    habSectorIcon: string;
    genericCouncilorIcon: string;
    shipMaterialBundlePath: string;
    cursorPath: string;
    cinematicsPath: string;
    gradientPath: string;
    winMissionPath: string;
    fanfarePath: string;
    smallShipNameListIdx: string;
    mediumShipNameListIdx: string;
    largeShipNameListIdx: string;
    habNameListIdx: string;
    guaranteedMissions: string[][];
    AIValues: Array<Record<string, number>>;
    baseAnnualIncomes: Array<{
        resource: string;
        value: number;
    }>;
    startingResources: Array<{
        resource: string;
        value: number;
    }>;
    firstTechNames: string[];
    winnerTechNames: string[];
    habPreferences: Record<string, number>;
}

export interface Formation {
    dataName: string;
    disable: boolean;
    AICombatBaseWeight: number;
    AIMaximumAllowedShips: number;
    patternShift: boolean;
    clampXpos: boolean;
    clampYpos: boolean;
    useZoffset: boolean;
    resetIdx: number;
    pos: Array<{
        x: number;
        y: number;
        z: number;
    }>;
}

export interface Gun {
    dataName: string;
    friendlyName: string;
    mount: string;
    requiredProjectName: string;
    crew: number;
    attackMode: boolean;
    defenseMode: boolean;
    baseWeaponMass_tons: number;
    cooldown_s: number;
    salvo_shots: number;
    intraSalvoCooldown_s: number;
    efficiency: number;
    flatChipping: number;
    magazine: number;
    ammoMass_kg: number;
    muzzleVelocity_kps: number;
    bombardmentValue: number;
    warheadMass_kg: number;
    targetingRange_km: number;
    pivotRange_deg: number;
    isPointDefenseTargetable: boolean;
    weightedBuildMaterials: {
        volatiles: number;
        metals: number;
        nobleMetals: number;
    };
    ammoMaterials: {
        volatiles: number;
        metals: number;
    };
    iconResource: string;
    modelResource: string;
    effectResource: string;
    shotModelResource: string;
    fireSoundFXResource: string;
    impactVisualFXResource: string;
    impactSoundFXResource: string;
    damage_MJ: number;
}

export interface HabModule {
    dataName: string;
    friendlyName: string;
    coreModule: boolean;
    habType: string;
    onePerHab: boolean;
    automated: boolean;
    allowsShipConstruction: boolean;
    allowsResupply: boolean;
    mine: boolean;
    noBuild: boolean;
    destroyed: boolean;
    tier: number;
    requiredProjectName: string;
    crew: number;
    power: number;
    baseMass_tons: number;
    buildTime_Days: number;
    constructionTimeModifier: number;
    miningModifier: number;
    controlPointCapacity: number;
    techBonuses: any[];
    specialRules: string[];
    specialRulesValue: number;
    supportMaterials_month: {
        money: number;
        boost: number;
        volatiles: number;
        metals: number;
        nobleMetals: number;
    };
    weightedBuildMaterials: {
        water: number;
        volatiles: number;
        metals: number;
        nobleMetals: number;
    };
    baseIconResource: string;
    stationIconResource: string;
    stationModelResource: string;
    stationDestructionResource: string;
    alertWorthy: boolean;
    alienModule: boolean;
    objectiveModule: boolean;
    disable: boolean;
}

export interface Hab {
    dataName: string;
    friendlyName: string;
    habType: string;
    tier: number;
    habSite: string;
    alien: boolean;
    orbitTemplateName: string;
    meanAnomalyAtEpoch_Deg: number;
    epoch_floatJYears: number;
    sectors: Array<{
        faction: string;
        habModuleNames: string[];
    }>;
}

export interface HabSite {
    friendlyName: string;
    dataName: string;
    parentBodyName: string;
    X: number;
    Y: number;
    latitude: number;
    longitude: number;
    miningProfileName: string;
    backgroundPath: string;
    fabricatedData: string;
    Density: number;
}

export interface HeatSink {
    dataName: string;
    displayName: string;
    heatCapacity_GJ: number;
    mass_tons: number;
    requiredProjectName: string;
    crew: number;
    weightedBuildMaterials: {
        water: number;
    };
    iconResource: string;
}

export interface LaserWeapon {
    dataName: string;
    friendlyName: string;
    mount: string;
    crew: number;
    sortOrder: number;
    requiredProjectName: string;
    attackMode: boolean;
    defenseMode: boolean;
    hp: number;
    baseWeaponMass_tons: number;
    cooldown_s: number;
    efficiency: number;
    shotPower_MJ: number;
    wavelength_nm: number;
    mirrorRadius_cm: number;
    beam_quality: number;
    jitter_Rad: number;
    bombardmentValue: number;
    targetingRange_km: number;
    pivotRange_deg: number;
    isPointDefenseTargetable: boolean;
    weightedBuildMaterials: {
        volatiles: number;
        metals: number;
        nobleMetals: number;
    };
    iconResource: string;
    modelResource: string;
    effectResource: string;
    fireSoundFXResource: string;
}

export interface MagneticGun {
    dataName: string;
    friendlyName: string;
    mount: string;
    crew: number;
    sort: number;
    requiredProjectName: string;
    attackMode: boolean;
    defenseMode: boolean;
    baseWeaponMass_tons: number;
    cooldown_s: number;
    efficiency: number;
    flatChipping: number;
    magazine: number;
    ammoMass_kg: number;
    muzzleVelocity_kps: number;
    warheadMass_kg: number;
    bombardmentValue: number;
    targetingRange_km: number;
    pivotRange_deg: number;
    isPointDefenseTargetable: boolean;
    weightedBuildMaterials: {
        volatiles: number;
        metals: number;
        nobleMetals: number;
    };
    ammoMaterials: {
        volatiles: number;
        metals: number;
        nobleMetals: number;
    };
    iconResource: string;
    modelResource: string;
    shotModelResource: string;
    impactVisualFXResource: string;
    fireSoundFXResource: string;
    impactSoundFXResource: string;
}

export interface Missile {
    dataName: string;
    friendlyName: string;
    mount: string;
    crew: number;
    requiredProjectName: string;
    attackMode: boolean;
    defenseMode: boolean;
    warheadClass: string;
    "Rocket Thrust": number;
    EV_kps: number;
    acceleration_g: number;
    deltaV_kps: number;
    baseWeaponMass_tons: number;
    cooldown_s: number;
    salvo_shots: number;
    intraSalvoCooldown_s: number;
    efficiency: number;
    flatChipping: number;
    magazine: number;
    ammoMass_kg: number;
    fuelMass_kg: number;
    systemMass_kg: number;
    warheadMass_kg: number;
    flatDamage_MJ: number;
    thrustRamp_s: number;
    rotation_degps: number;
    turnRamp_s: number;
    maneuver_angle: number;
    bombardmentValue: number;
    targetingRange_km: number;
    pivotRange_deg: number;
    isPointDefenseTargetable: boolean;
    weightedBuildMaterials: {
        volatiles: number;
        metals: number;
    };
    ammoMaterials: {
        volatiles: number;
        metals: number;
        nobleMetals: number;
    };
    iconResource: string;
    modelResource: string;
    shotModelResource: string;
    impactVisualFXResource: string;
    fireSoundFXResource: string;
    impactSoundFXResource: string;
    notes: string;
}

export interface Mission {
    dataName: string;
    friendlyName: string;
    disable: boolean;
    baseMission: boolean;
    persistentEffect: boolean;
    noise: number[];
    hate: number[];
    specialPost: boolean;
    permanentAssignment: boolean;
    XPonSuccess: number;
    sortOrder: number;
    missionContext: string;
    utilityScore: number;
    UIalertEnemyOnFail: boolean;
    AIDoubleUpAllowed: boolean;
    maximumTargetOptionCount: number;
    resolutionOrder: number;
    allowedForAutoDefense: boolean;
    resolutionMethod: any;
    attackerContexts: string[];
    defenderContexts: string[];
    conditions: any[];
    movementRule: string;
    targetEffects: any[];
    councilorEffects: any[];
    target: any;
    cost: any;
    knowledgeProject: string;
    missionIconImagePath: string;
    targetingMethodType: string;
    completedIllustrationResource: string[];
}

export interface NarrativeEvent {
    dataName: string;
    year: number;
    baseWeight: number;
    altBaseWeight: any;
    targetConditions: any[];
    targetWeightModifiers: any[];
    possibleSecondaryStateDataNames: string[];
    secondaryStateConditions: any[];
    secondaryWeightModifiers: any[];
    eventOptions: any[];
}

export interface Nation {
    friendlyName: string;
    dataName: string;
    flagResource: string;
    color32: {
        r: number;
        g: number;
        b: number;
    };
    color: {
        r: number;
        g: number;
        b: number;
        a: number;
    };
    popGrowthModifier: number;
    initialPriorityPreset: string[];
    tankSeries: string[];
}

export interface Navigable {
    dataName: string;
    lagrangeValue: string;
    relatedObject: string;
    effectToExplore: string;
    positionCalculator: any;
    symbolTexture: string;
    orbits: string[];
    maxHabSize: number;
}

export interface Objective {
    dataName: string;
    objectiveType: string;
    starter: boolean;
    isChildObjective: boolean;
    NewAIValuesIndex: number;
    resourcesGranted: any[];
}

export interface Officer {
    dataName: string;
    spawnChance: number;
    spawnEventType: string;
    location: string;
    sortOrder: number;
    baseIconPath: string;
    requirements: Array<{
        requirement: string;
        value: number;
    }>;
    effects: Array<{
        level: number;
        effect: string;
        value: number;
    }>;
}

export interface Orbit {
    "builder name": string;
    dataName: string;
    "friendly name": string;
    barycenterName: string;
    orbitIndex: string;
    irradiatedMultiplier: number;
    interfaceOrbit: boolean;
    radialOrbit: boolean;
    stationCapacity: number;
    semiMajorAxisRange_km: number;
    eccentricity: number;
    inclination_Deg: number;
    inclinationRange_Deg: number;
    longAscendingNode_Deg: number;
    argPeriapsis_Deg: number;
    mass: number;
    "barycenter hill radius": string;
    "hill order of magnitude": number;
}

export interface ParticleWeapon {
    dataName: string;
    displayName: string;
    mount: string;
    crew: number;
    requiredProjectName: string;
    attackMode: boolean;
    defenseMode: boolean;
    baseWeaponMass_tons: number;
    cooldown_s: number;
    efficiency: number;
    shotPower_MJ: number;
    heatFraction: number;
    xRayFraction: number;
    baryonFraction: number;
    bombardmentValue: number;
    targetingRange_km: number;
    lensRadius_cm: number;
    dispersionModel: string;
    doublingRange_km: number;
    pivotRange_deg: number;
    isPointDefenseTargetable: boolean;
    weightedBuildMaterials: {
        water: number;
        volatiles: number;
        metals: number;
        nobleMetals: number;
    };
    iconResource: string;
    effectResource: string;
    modelResource: string;
}

export interface PlasmaWeapon {
    dataName: string;
    displayName: string;
    mount: string;
    requiredProjectName: string;
    crew: number;
    sort: number;
    attackMode: boolean;
    defenseMode: boolean;
    baseWeaponMass_tons: number;
    cooldown_s: number;
    efficiency: number;
    flatChipping: number;
    chargingEnergy_GJ: number;
    magazine: number;
    ammoMass_kg: number;
    muzzleVelocity_kps: number;
    bombardmentValue: number;
    targetingRange_km: number;
    pivotRange_deg: number;
    isPointDefenseTargetable: boolean;
    warheadMass_kg: number;
    weightedBuildMaterials: {
        volatiles: number;
        metals: number;
        nobleMetals: number;
    };
    iconResource: string;
    modelResource: string;
    shotModelResource: string;
    impactVisualFXResource: string;
    fireSoundFXResource: string;
    impactSoundFXResource: string;
    expectedDamage_MJ: number;
}

export interface PowerPlant {
    dataName: string;
    friendlyName: string;
    maxOutput_GW: number;
    specificPower_tGW: number;
    powerPlantClass: string;
    efficiency: number;
    crew: number;
    weightedBuildMaterials: {
        water: number;
        volatiles: number;
        metals: number;
        nobleMetals: number;
    };
    iconResource: string;
}

export interface Project {
    friendlyName: string;
    dataName: string;
    techCategory: string;
    AI_techRole: string;
    researchCost: number;
    oneTimeGlobally: boolean;
    repeatable: boolean;
    factionPrereq: string[];
    factionAvailableChance: number;
    initialUnlockChance: number;
    deltaUnlockChance: number;
    maxUnlockChance: number;
    resourcesGranted: any[];
}

export interface Radiator {
    dataName: string;
    friendlyName: string;
    specificMass_2s_kgm2: number;
    specificPower_2s_KWkg: number;
    operatingTemp_K: number;
    emissivity: number;
    vulnerability: number;
    collector: boolean;
    crew: number;
    weightedBuildMaterials: {
        volatiles: number;
        metals: number;
        nobleMetals: number;
        exotics: number;
    };
    iconResource: string;
    combatUIpath: string;
    radiatorType: string;
}

export interface Region {
    dataName: string;
    mapRegionName: string;
    primaryCity: string;
    sortNation: string;
    population_Millions: number;
    annualPopGrowthModifier: number;
    mineCapable: boolean;
    environment: string;
    boostPerYear_tons: number;
    missionControl: number;
    worldOcean: string;
    asi: number;
    language: string;
    acc_asi: string;
    asiPersonal: string[];
    asiFamily: string[];
    asiWeight: number[];
    illustrationPathStrs: string[];
    occupationValue: number;
    nuclearDetonations: number;
}

export interface ShipArmor {
    dataName: string;
    friendlyName: string;
    weightedBuildMaterials: {
        volatiles: number;
        metals: number;
        nobleMetals: number;
        exotics: number;
    };
    xRayHalfValue_cm: number;
    baryonicHalfValue_cm: number;
    density_kgm3: number;
    heatofVaporization_MJkg: number;
    specialties: Array<{
        armorSpecialty: string;
        value: number;
    }>;
    iconResource: string;
}

export interface SpaceBody {
    dataName: string;
    friendlyName: string;
    friendlyDiameter: number;
    modelResource: string;
    modelScale: number;
    symbolTexture: string;
    objectType: string;
    irradiatedMultiplier: number;
    atmosphere: string;
    semiMajorAxis_AU: number;
    equatorialRadius_km: number;
    oblateness: number;
    mass_kg: number;
    density_gcm3: number;
    rotationPeriod_strHours: string;
    angularDiameterMultiplier: number;
    maxHabSize: number;
    numAltModels: number;
    altModels: any[];
}

export interface SpaceFleet {
    dataName: string;
    friendlyName: string;
    factionName: string;
    formationSpacing: string;
    formationName: string;
    formationFocus: string;
    formationConcentration: string;
    shipsInFleet: Array<{
        shipTemplateName: string;
    }>;
    orbitTemplateName: string;
    meanAnomalyAtEpoch_Deg: number;
}

export interface StartTime {
    dataName: string;
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    second: number;
    bonusMoney: number;
    bonusInfluence: number;
    bonusOps: number;
    bonusBoost: number;
    bonusMissionControl: number;
    bonusWater: number;
    bonusVolatiles: number;
    bonusMetals: number;
    bonusNobles: number;
    bonusFissiles: number;
    bonusAntimatter: number;
    bonusExotics: number;
    initialCrashdownRegionTemplateName: string;
    initialAtmosphericCO2_ppm: number;
    initialAtmosphericCH4_ppm: number;
    initialAtmosphericN2O_ppm: number;
    initialStratosphericAerosols_ppm: number;
    initialGlobalSeaLevelAnomaly_cm: number;
    initialLooseNukes: number;
    globalStartingGDPScaling: number;
    distributeFactionlessHabsAndFleets: boolean;
    startingTechs: string[];
}

export interface Tech {
    friendlyName: string;
    dataName: string;
    techCategory: string;
    AI_techRole: string;
    AI_criticalTech: boolean;
    endGameTech: boolean;
    researchCost: number;
    prereqs: string[];
    effects: string[];
}

export interface Trait {
    dataName: string;
    friendlyName: string;
    grouping?: number;
    tags?: string[];
    easilyVisible?: boolean;
    XPCost?: number;
    upgradesFrom?: string;
    opsCost?: number;
    boostCost?: number;
    incomeBoost?: number;
    incomeMoney?: number;
    incomeInfluence?: number;
    incomeResearch?: number;
    detectionEspBonus?: number;
    rerollTrait?: string;
    rerollTraitBonus?: number;
    statMods: Array<{
        stat?: string;
        operation?: string;
        strValue?: string;
        condition?: {
            $type?: string;
            sign?: string;
            strValue?: string;
            strIdx?: string;
        };
    }>;
    techBonuses: Array<{
        category: string;
        bonus: number;
    }>;
    priorityBonuses: Array<{
        priority: string;
        bonus: number;
    }>;
    baseChance: number;
    classChance?: Array<{
        councilorClass: string;
        chance?: number;
    }>;
    missionsGrantedNames: string[];
}

export interface UtilityModule {
    dataName: string;
    friendlyName: string;
    crew: number;
    mass_tons: number;
    grouping: number;
    requiredProjectName: string;
    minConsTier: number;
    powerRequirement_MW: number;
    weightedBuildMaterials: {
        water: number;
        volatiles: number;
        metals: number;
        nobleMetals: number;
    };
    specialModuleRules: string[];
    iconResource: string;
}

export interface Victory {
    dataName: string;
    victoryEffect: string;
    victoryConditions: Array<{
        conditionType: string;
        value: number;
    }>;
}

export interface Cinematic2D {
    dataName: string;
    textSequences: number;
    textTimeStamp1: number;
    textTimeStamp2: number;
    textTimeStamp3: number;
    textTimeStamp4: number;
    textTimeStamp5: number;
    textTimeStamp6: number;
    textTimeStamp7: number;
    textTimeStamp8: number;
    textTimeStamp9: number;
    textTimeStamp10: number;
    textTimeStamp11: number | null;
    textTimeStamp12: number | null;
    textTimeStamp13: number | null;
    textTimeStamp14: number | null;
    textTimeStamp15: string;
    textTimeStamp16: string;
    textTimeStamp17: string;
    textTimeStamp18: string;
    textTimeStamp19: string;
    textTimeStamp20: string;
}

export interface CouncilorVoice {
    dataName: string;
    voiceActor: string;
    enable: boolean;
    language: string;
    accent: string;
    gender: string;
    index: number;
}

export interface GlobalConfig {
    dataName: string;
    quotes: number;
    strategyLayerSpeedSettings: any[];
    combatLayerSpeedSettings: number[];
    dontStopBimonthlyMissions: boolean;
    useSiteNameWhenNamingBases: boolean;
    immediateNewsAlert: boolean;
    verboseStatDescriptions: boolean;
    missionDifficultyModifier: number;
    eventManagerQueueProcessTime: number;
    nationalInvestmentArmyFactorHome: number;
    nationalInvestmentArmyFactorAway: number;
    nationalInvestmentNavyFactor: number;
    prohibitCapitalShenanigans: boolean;
    [key: string]: any;
}

export interface HabSchematic {
    dataName: string;
    relativeValue: number;
    decisions: string[];
    preferences: Record<string, number>;
}

export interface Localization {
    dataName: string;
    friendlyName: string;
    active: boolean;
    core: boolean;
    requiresFontChange: string | null;
    largeLineHeight: boolean;
    headlineFontPath: string;
}

export interface MapGroupVisualizer {
    dataName: string;
    mapGroupLabel: string;
    mapGroupControlType: string;
    groupScale: number;
    highPriorityScaleAppearanceThreshold: number;
    lowPriorityScaleAppearanceThreshold: number;
    sortingValue: number;
}

export interface MapRegion {
    dataName: string;
    friendlyNationName: string;
    terrain: string;
    supraRegion: string;
    coast: string;
    latitude: number;
    longitude: number;
    boostLatitude: number;
    area_km2: number;
    visualId: number;
    oilId: number;
}

export interface Meta {
    dataName: string;
    friendlyName: string;
    templateType: string;
    templateNames: string[];
}

export interface MiningProfile {
    dataName: string;
    friendlyName: string;
    modifyBySize: boolean;
    descriptor: string;
    modelValue: number;
    water_mean: number;
    water_width: number;
    water_min: number;
    water_jump: number;
    volatiles_mean: number;
    volatiles_width: number;
    volatiles_min: number;
    volatiles_jump: number;
    metals_mean: number;
    metals_width: number;
    metals_min: number;
    metals_jump: number;
    nobles_mean: number;
    nobles_width: number;
    nobles_min: number;
    nobles_jump: number;
    fissiles_mean: number;
    fissiles_width: number;
    fissiles_min: number;
    fissiles_jump: number;
}

export interface Notification {
    dataName: string;
    alertHammerLoc: string;
    disable: boolean;
    allowAnyChanges: boolean;
    allowAlertChanges: boolean;
    alertAudience: string;
    firstAlertOverride: boolean;
    newsFeedAudience: string;
    timerAudience: string;
    summaryAudience: {
        audience: string;
        category: string;
    };
    stacking: string;
}

export interface OrgIcon {
    dataName: string;
    path: string;
    minTier: number;
    maxTier: number;
    primaryOrgType: string;
    allowedOrgTypes: string[];
}

export interface Player {
    dataName: string;
    council: string;
}

export interface PriorityPreset {
    dataName: string;
    friendlyName: string;
    nationalAIOption: boolean;
    factionName: string;
    economySetting: number;
    knowledgeSetting: number;
    governmentSetting: number;
    spaceProgramSetting: number;
    initSpaceProgramSetting: number;
    boostSetting: number;
    missionControlSetting: number;
    militarySetting: number;
    armySetting: number;
    navySetting: number;
    initNuclearWeaponsSetting: number;
    nuclearProgramSetting: number;
    spaceDefenseSetting: number;
    stoSetting: number;
}

export interface SpaceCombat {
    dataName: string;
    displayName: string;
    active: boolean;
    fleetNames: string[];
}

export interface SpaceShip {
    dataName: string;
    friendlyName: string;
    factionName: string;
    hullAppearanceIndex: number;
    hideInSkirmish: boolean;
    role: string;
    hullName: string;
    driveName: string;
    powerPlantName: string;
    radiatorName: string;
    propellantTanks: number;
    noseArmor: {
        materialName: string;
        armorValue: number;
    };
    lateralArmor: {
        materialName: string;
        armorValue: number;
    };
    tailArmor: {
        materialName: string;
        armorValue: number;
    };
    moduleTemplateEntries: Array<{
        moduleName: string;
        slot?: number;
    }>;
    hullWeaponTemplateEntries: Array<{
        moduleName: string;
        slot?: number;
    }>;
    noseWeaponTemplateEntries: Array<{
        moduleName: string;
        slot?: number;
    }>;
    fireModeTemplateEntries: any[];
}

export interface TimeEvent {
    dataName: string;
    [key: string]: any;
}
