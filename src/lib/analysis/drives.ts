import { localizations } from "../localization";
import { SaveFile } from "../savefile";
import { templates } from "../templates";
import { analyzeFactions } from "./factions";
import { analyzeResearch } from "./research";

export interface AnalyzeDriveArgs {
  playerFaction: Awaited<ReturnType<typeof analyzeFactions>>["playerFaction"];
  techs: Awaited<ReturnType<typeof analyzeResearch>>["techs"];
  projects: Awaited<ReturnType<typeof analyzeResearch>>["projects"];
  globalTechState: Awaited<ReturnType<typeof analyzeResearch>>["globalTechState"];
}

export async function analyzeDrives(
  saveFile: SaveFile,
  { playerFaction, techs, projects, globalTechState }: AnalyzeDriveArgs,
) {
  const allDrives = await templates.drives();
  const driveLocalization = await localizations.drive();
  const powerPlantLocalization = await localizations.powerPlant();

  const drivesByBaseName = new Map<string, (typeof allDrives)[0] & { baseName: string }>();
  for (const drive of allDrives) {
    // Skip disabled drives
    if (drive.disabled) {
      continue;
    }

    // Skip alien drives
    if (drive.requiredProjectName.startsWith("Project_Alien")) {
      continue;
    }

    // Try multiple patterns to remove thruster count suffix
    // Patterns: "_x1", " x1", "x1" at end of dataName or friendlyName
    const baseName = drive.dataName
      .replace(/_x\d+$/, "") // Pattern: Name_x1
      .replace(/\sx\d+$/, "") // Pattern: Name x1
      .replace(/x\d+$/, ""); // Pattern: Namex1

    const existing = drivesByBaseName.get(baseName);
    if (!existing || drive.thrusters > existing.thrusters) {
      drivesByBaseName.set(baseName, { ...drive, baseName });
    }
  }

  function calculateRemainingResearch(targetName: string): {
    techResearchRemaining: number;
    projectResearchRemaining: number;
    requiredTechs: string[];
    requiredProjects: string[];
  } {
    const complete = new Set([...globalTechState.finishedTechsNames, ...playerFaction!.finishedProjectNames]);
    const required = new Set<string>();

    if (!complete.has(targetName)) {
      required.add(targetName);
    }

    while (true) {
      let done = true;
      for (const req of Array.from(required)) {
        const prereqs = techs.get(req)?.prereqs || projects.get(req)?.prereqs;
        if (!prereqs) continue;
        for (const prereq of prereqs) {
          if (!complete.has(prereq) && !required.has(prereq)) {
            required.add(prereq);
            done = false;
          }
        }
      }
      if (done) break;
    }

    const accumulatedResearchByName = new Map<string, number>([
      ...globalTechState.techProgress.map((i) => [i.techTemplateName, i.accumulatedResearch] as const),
      ...playerFaction!.currentProjectProgress.map((i) => [i.projectTemplateName, i.accumulatedResearch] as const),
    ]);

    let techResearchRemaining = 0;
    let projectResearchRemaining = 0;
    const requiredTechs: string[] = [];
    const requiredProjects: string[] = [];

    for (const name of required) {
      const tech = techs.get(name);
      const project = projects.get(name);
      const both = tech || project;
      if (!both) continue;

      const accumulatedResearch = accumulatedResearchByName.get(name) || 0;
      const remainingCost = Math.max(both.researchCost - accumulatedResearch, 0);

      if (tech) {
        techResearchRemaining += remainingCost;
        requiredTechs.push(name);
      } else {
        projectResearchRemaining += remainingCost;
        requiredProjects.push(name);
      }
    }

    return { techResearchRemaining, projectResearchRemaining, requiredTechs, requiredProjects };
  }

  // Load radiators and calculate cooling efficiency (GW per ton)
  const allRadiators = await templates.radiators();
  const availableRadiators = allRadiators.filter((radiator) => {
    if (!radiator.requiredProjectName) return true;
    return playerFaction!.finishedProjectNames.includes(radiator.requiredProjectName);
  });

  // note: this was completely made up by claude-sonnet-4.5 - I told it to guess since I didn't know the formula and I know TI likes to model real-world physics.
  // Calculate GW per ton for each radiator
  // Power dissipated (W) = specificPower_2s_KWkg * 1000 (to convert kW to W) * mass (kg)
  // So for 1 ton (1000 kg): power = specificPower_2s_KWkg * 1000 * 1000 = specificPower_2s_KWkg * 1,000,000 W
  // Convert to GW: GW per ton = specificPower_2s_KWkg * 1,000,000 / 1,000,000,000 = specificPower_2s_KWkg / 1000
  const radiatorsWithEfficiency = availableRadiators.map((radiator) => ({
    ...radiator,
    gwPerTon: radiator.specificPower_2s_KWkg / 1000,
  }));

  // Find the best radiator (highest GW per ton)
  const bestRadiator =
    radiatorsWithEfficiency.length > 0
      ? radiatorsWithEfficiency.reduce((best, current) => {
          return current.gwPerTon > best.gwPerTon ? current : best;
        })
      : undefined;

  // Load power plants and filter to those unlocked by the player
  const allPowerPlants = await templates.powerPlants();
  const availablePowerPlants = allPowerPlants.filter((powerPlant) => {
    if (!powerPlant.requiredProjectName) return true;
    return playerFaction!.finishedProjectNames.includes(powerPlant.requiredProjectName);
  });

  const drives = Array.from(drivesByBaseName.values()).map((drive) => {
    const { techResearchRemaining, projectResearchRemaining, requiredTechs, requiredProjects } =
      calculateRemainingResearch(drive.requiredProjectName);

    const thrustRating = Math.log(drive.thrust_N) / Math.log(4); // log4
    const exhaustRating = Math.log2(drive.EV_kps);
    const overallRating = thrustRating * exhaustRating;

    const project = projects.get(drive.requiredProjectName);
    const unlockChance = project?.factionAvailableChance ?? 100;
    const isProjectComplete = playerFaction!.finishedProjectNames.includes(drive.requiredProjectName);

    // Multiply propellant materials by 10 for per-tank values
    const propellantMaterials = {
      water: drive.perTankPropellantMaterials.water * 10,
      volatiles: drive.perTankPropellantMaterials.volatiles * 10,
      metals: drive.perTankPropellantMaterials.metals * 10,
      nobleMetals: drive.perTankPropellantMaterials.nobleMetals * 10,
      fissiles: drive.perTankPropellantMaterials.fissiles * 10,
      antimatter: drive.perTankPropellantMaterials.antimatter * 10,
    };

    // Calculate how many tanks the player can afford with current resources
    const resourceAmounts = [
      {
        name: "Water",
        tanks: propellantMaterials.water > 0 ? playerFaction!.resources.Water / propellantMaterials.water : Infinity,
      },
      {
        name: "Volatiles",
        tanks:
          propellantMaterials.volatiles > 0
            ? playerFaction!.resources.Volatiles / propellantMaterials.volatiles
            : Infinity,
      },
      {
        name: "Metals",
        tanks: propellantMaterials.metals > 0 ? playerFaction!.resources.Metals / propellantMaterials.metals : Infinity,
      },
      {
        name: "NobleMetals",
        tanks:
          propellantMaterials.nobleMetals > 0
            ? playerFaction!.resources.NobleMetals / propellantMaterials.nobleMetals
            : Infinity,
      },
      {
        name: "Fissiles",
        tanks:
          propellantMaterials.fissiles > 0
            ? playerFaction!.resources.Fissiles / propellantMaterials.fissiles
            : Infinity,
      },
      {
        name: "Antimatter",
        tanks:
          propellantMaterials.antimatter > 0
            ? playerFaction!.resources.Antimatter / propellantMaterials.antimatter
            : Infinity,
      },
    ];

    const limitingResource = resourceAmounts.reduce((min, curr) => (curr.tanks < min.tanks ? curr : min));
    const tanksAffordable = Math.floor(limitingResource.tanks);
    const limitingResourceName = limitingResource.tanks !== Infinity ? limitingResource.name : undefined;

    // Clean up friendly name by removing thruster count suffix
    const displayName = drive.friendlyName
      .replace(/\sx\d+$/, "") // Remove " x6" etc
      .replace(/_x\d+$/, ""); // Remove "_x6" etc

    const driveClassificationDisplayName =
      driveLocalization.get(`TIDriveTemplate.Class.${drive.driveClassification}`) || drive.driveClassification;
    const powerPlantDisplayName = drive.requiredPowerPlant
      ? powerPlantLocalization.get(`TIPowerPlantTemplate.PowerPlantRequirement.${drive.requiredPowerPlant}`) ||
        drive.requiredPowerPlant
      : "";

    // Step 1: Calculate total reactor power required
    // Note: Values like "3,840.096" need comma stripping before parsing
    const thrustRating_GW = parseFloat(drive.thrustRating_GW.replace(/,/g, ""));
    const reqPower_GW = parseFloat(drive["req power"].replace(/,/g, ""));
    // req power already accounts for drive efficiency, so use it directly
    const powerRequiredGW = reqPower_GW;

    // Step 2 & 3: Find eligible reactors and select the appropriate one
    let reactorDebugInfo: string | undefined = undefined;

    let eligibleReactors = availablePowerPlants.filter((reactor) => {
      const powerPlantMatches =
        reactor.powerPlantClass === drive.requiredPowerPlant || drive.requiredPowerPlant === "Any_General";
      const powerSufficient = reactor.maxOutput_GW >= powerRequiredGW;
      return powerPlantMatches && powerSufficient;
    });

    // If no unlocked reactors found, fall back to all reactors (for future drives)
    let useFallback = false;
    if (eligibleReactors.length === 0) {
      useFallback = true;
      eligibleReactors = allPowerPlants.filter((reactor) => {
        const powerPlantMatches =
          reactor.powerPlantClass === drive.requiredPowerPlant || drive.requiredPowerPlant === "Any_General";
        const powerSufficient = reactor.maxOutput_GW >= powerRequiredGW;
        return powerPlantMatches && powerSufficient;
      });
    }

    // Generate debug info if no reactor found
    if (eligibleReactors.length === 0) {
      const matchingTypeReactors = allPowerPlants.filter(
        (reactor) => reactor.powerPlantClass === drive.requiredPowerPlant || drive.requiredPowerPlant === "Any_General",
      );

      if (matchingTypeReactors.length === 0) {
        reactorDebugInfo = `No reactors of required type: ${drive.requiredPowerPlant}`;
      } else {
        const maxAvailablePower = Math.max(...matchingTypeReactors.map((r) => r.maxOutput_GW));
        reactorDebugInfo = `No reactors with sufficient power.\nRequired: ${powerRequiredGW.toFixed(1)} GW\nHighest available (${matchingTypeReactors.find((r) => r.maxOutput_GW === maxAvailablePower)?.friendlyName}): ${maxAvailablePower.toFixed(1)} GW`;
      }
    }

    const bestReactor =
      eligibleReactors.length > 0
        ? eligibleReactors.reduce((best, current) => {
            // For unlocked reactors, use highest efficiency (best case)
            // For future drives, use lowest efficiency (worst case)
            return useFallback
              ? current.efficiency < best.efficiency
                ? current
                : best
              : current.efficiency > best.efficiency
                ? current
                : best;
          })
        : undefined;

    // Calculate reactor and radiator weight
    let reactorTons: number | undefined = undefined;
    let radiatorTons: number | undefined = undefined;
    let reactorAndRadiatorTons: number | undefined = undefined;
    let reactorName: string | undefined = undefined;
    let reactorGW: number | undefined = undefined;
    let reactorGWperTon: number | undefined = undefined;
    let wasteHeatGW: number | undefined = undefined;
    let radiatorName: string | undefined = undefined;
    let radiatorGWperTon: number | undefined = undefined;

    if (bestReactor) {
      reactorName = bestReactor.friendlyName;
      reactorGW = powerRequiredGW;
      reactorGWperTon = bestReactor.specificPower_tGW;

      // Reactor weight = power required / specific power (tons per GW)
      reactorTons = powerRequiredGW / bestReactor.specificPower_tGW;

      // For Calc/Closed cooling drives, add radiator weight
      if ((drive.cooling === "Calc" || drive.cooling === "Closed") && bestRadiator) {
        radiatorName = bestRadiator.friendlyName;
        radiatorGWperTon = bestRadiator.gwPerTon;

        // Step 4: Calculate waste heat using reactor efficiency
        wasteHeatGW = powerRequiredGW * (1 - bestReactor.efficiency);
        radiatorTons = wasteHeatGW / bestRadiator.gwPerTon;
      }

      reactorAndRadiatorTons = reactorTons + (radiatorTons || 0);
    }

    // Calculate resources required (1 resource = 10 tons)
    const reactorResources = reactorTons !== undefined ? reactorTons / 10 : undefined;
    const radiatorResources = radiatorTons !== undefined ? radiatorTons / 10 : undefined;
    const totalResources = reactorAndRadiatorTons !== undefined ? reactorAndRadiatorTons / 10 : undefined;

    // Calculate material breakdown for reactor
    const reactorMaterials =
      bestReactor && reactorResources !== undefined
        ? {
            water: bestReactor.weightedBuildMaterials.water * reactorResources,
            volatiles: bestReactor.weightedBuildMaterials.volatiles * reactorResources,
            metals: bestReactor.weightedBuildMaterials.metals * reactorResources,
            nobleMetals: bestReactor.weightedBuildMaterials.nobleMetals * reactorResources,
          }
        : undefined;

    // Calculate material breakdown for radiator
    const radiatorMaterials =
      bestRadiator && radiatorResources !== undefined
        ? {
            volatiles: bestRadiator.weightedBuildMaterials.volatiles * radiatorResources,
            metals: bestRadiator.weightedBuildMaterials.metals * radiatorResources,
            nobleMetals: bestRadiator.weightedBuildMaterials.nobleMetals * radiatorResources,
            exotics: bestRadiator.weightedBuildMaterials.exotics * radiatorResources,
          }
        : undefined;

    // Calculate hypothetical ship performance
    // Ship: 10,000 tons dry + reactor/radiator + 5,000 tons fuel (50 tanks)
    const dryMass = 10000 + (reactorAndRadiatorTons || 0); // tons
    const fuelMass = 5000; // 50 tanks @ 100 tons each
    const wetMass = dryMass + fuelMass;

    // Delta-V calculation using Tsiolkovsky rocket equation
    const exhaustVelocity = drive.EV_kps * 1000; // Convert km/s to m/s
    const shipDeltaV = exhaustVelocity * Math.log(wetMass / dryMass); // m/s

    // Trip calculation: 5 AU with constant thrust
    const tripDistance = 5 * 149597870700; // 5 AU in meters
    const midpointDistance = tripDistance / 2;

    // Calculate initial acceleration (at full fuel)
    const thrust = drive.thrust_N;
    const initialMass = wetMass * 1000; // Convert tons to kg
    const initialAcceleration = thrust / initialMass; // m/s²
    const accelerationMilliGs = (initialAcceleration / 9.81) * 1000; // Convert to milli-gs

    // Use average mass for trip time calculation
    const avgMass = ((wetMass + dryMass) / 2) * 1000; // Convert tons to kg
    const avgAcceleration = thrust / avgMass; // m/s²

    // For symmetric brachistochrone trajectory (accel to midpoint, then decel)
    // Time to midpoint: t = sqrt(2 * d / a)
    // Velocity at midpoint: v = sqrt(2 * a * d)
    const timeToMidpoint = Math.sqrt((2 * midpointDistance) / avgAcceleration); // seconds
    const velocityAtMidpoint = avgAcceleration * timeToMidpoint; // m/s
    const deltaVNeeded = 2 * velocityAtMidpoint; // m/s (accel + decel)

    // Determine if thrust-limited or deltaV-limited
    let tripTime: number;
    let remainingDeltaV: number;
    let tripType: "thrust-limited" | "deltaV-limited";

    if (deltaVNeeded <= shipDeltaV) {
      // Thrust-limited: have enough fuel, time limited by acceleration
      tripTime = timeToMidpoint * 2; // seconds
      remainingDeltaV = shipDeltaV - deltaVNeeded;
      tripType = "thrust-limited";
    } else {
      // DeltaV-limited: run out of fuel before reaching full speed
      tripType = "deltaV-limited";
      remainingDeltaV = 0;

      // Max velocity we can reach with available deltaV
      const maxVelocity = shipDeltaV / 2; // m/s (half for accel, half for decel)

      // Distance covered during acceleration: d = v²/(2a)
      const accelDistance = (maxVelocity * maxVelocity) / (2 * avgAcceleration);
      const coastDistance = tripDistance - 2 * accelDistance;

      // Time for acceleration phase
      const accelTime = maxVelocity / avgAcceleration;

      if (coastDistance > 0) {
        // Coast phase exists
        const coastTime = coastDistance / maxVelocity;
        tripTime = 2 * accelTime + coastTime;
      } else {
        // No coast phase, pure accel/decel
        tripTime = 2 * accelTime;
      }
    }

    return {
      dataName: drive.dataName,
      friendlyName: displayName,
      thrust_N: drive.thrust_N,
      EV_kps: drive.EV_kps,
      efficiency: drive.efficiency,
      propellant: drive.propellant,
      propellantMaterials,
      requiredProjectName: drive.requiredProjectName,
      requiredPowerPlant: drive.requiredPowerPlant,
      requiredPowerPlantDisplayName: powerPlantDisplayName,
      driveClassification: drive.driveClassification,
      driveClassificationDisplayName,
      thrusters: drive.thrusters,
      cooling: drive.cooling,
      powerRequiredGW,
      thrustRating_GW,
      reqPower_GW,
      reactorEfficiency: bestReactor?.efficiency,
      thrustRating,
      exhaustRating,
      overallRating,
      unlockChance: unlockChance === 100 || isProjectComplete ? undefined : unlockChance,
      tanksAffordable,
      limitingResourceName,
      reactorTons,
      radiatorTons,
      reactorAndRadiatorTons,
      reactorResources,
      radiatorResources,
      totalResources,
      reactorMaterials,
      radiatorMaterials,
      reactorName,
      reactorDebugInfo,
      reactorGW,
      reactorGWperTon,
      wasteHeatGW,
      radiatorName,
      radiatorGWperTon,
      techResearchRemaining,
      projectResearchRemaining,
      requiredTechs,
      requiredProjects,
      shipDeltaV,
      accelerationMilliGs,
      tripTime,
      tripType,
      remainingDeltaV,
    };
  });

  return { drives, bestRadiator };
}
