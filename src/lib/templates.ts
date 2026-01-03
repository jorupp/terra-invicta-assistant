import { readFile } from "fs/promises";
import path from "path";

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
    const data: TemplateData = JSON.parse(content);
    cachedTemplates[filename] = data;
    return data;
}

export const templates = {
    shipHulls: () => getTemplate('TIShipHullTemplate.json'),
    orgs: () => getTemplate('TIOrgTemplate.json'),
}

type templateMap = {
    'TIShipHullTemplate.json': ShipHull[]
    'TIOrgTemplate.json': Org[],
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
