import {
  SaveFile,
  FactionGoal_CaptureNation_Clean,
  FactionGoal_CaptureNation_Dirty,
  FactionGoal_NeutralizeNation,
  FactionGoal_AttackWithFleet,
  FactionGoal_DefendWithFleet,
  FactionGoal_WarOnFaction,
  FactionGoal_InvadeEarth,
  FactionGoal_BuildFullStation,
  FactionGoal_BuildFullBase,
} from "../savefile";
import { analyzeFactions } from "./factions";
import { analyzeFleets } from "./fleets";
import { analyzeHabs } from "./habs";
import { analyzeHabSites } from "./habSites";
import { analyzeNations } from "./nations";
import { analyzePlanets } from "./planets";

export interface AnalyzeAlienGoalsArgs {
  factionsById: Awaited<ReturnType<typeof analyzeFactions>>["factionsById"];
  alienFaction: Awaited<ReturnType<typeof analyzeFactions>>["alienFaction"];
  nationsById: ReturnType<typeof analyzeNations>["nationsById"];
  habs: ReturnType<typeof analyzeHabs>["habs"];
  bodiesById: ReturnType<typeof analyzePlanets>["bodiesById"];
  orbitsById: ReturnType<typeof analyzePlanets>["orbitsById"];
  fleets: Awaited<ReturnType<typeof analyzeFleets>>["fleets"];
}

export function analyzeAlienGoals(
  saveFile: SaveFile,
  { factionsById, alienFaction, nationsById, habs, bodiesById, orbitsById, fleets }: AnalyzeAlienGoalsArgs,
) {
  // Expand alien faction goals with details
  type ExpandedGoal = {
    id: number;
    importance: number;
    type: string;
    nation?: { id: number; displayName: string };
    hab?: { id: number; displayName: string; bodyName?: string };
    attackTargetFleet?: { id: number; displayName: string };
    assignedFleet?: { id: number; displayName: string };
    pendingFleets?: { id: number; displayName: string }[];
    enemyFaction?: { id: number; displayName: string };
    attackTarget?: { id: number; displayName: string; type: string };
  };

  const expandedAlienGoals: ExpandedGoal[] = [];

  // Helper functions to safely get typed goal states
  const getCaptureNationClean = (goalId: number): FactionGoal_CaptureNation_Clean | undefined => {
    return (saveFile.gamestates as any)["PavonisInteractive.TerraInvicta.FactionGoal_CaptureNation_Clean"]?.find(
      (g: any) => g.Value?.ID?.value === goalId,
    )?.Value as FactionGoal_CaptureNation_Clean | undefined;
  };
  const getCaptureNationDirty = (goalId: number): FactionGoal_CaptureNation_Dirty | undefined => {
    return (saveFile.gamestates as any)["PavonisInteractive.TerraInvicta.FactionGoal_CaptureNation_Dirty"]?.find(
      (g: any) => g.Value?.ID?.value === goalId,
    )?.Value as FactionGoal_CaptureNation_Dirty | undefined;
  };
  const getNeutralizeNation = (goalId: number): FactionGoal_NeutralizeNation | undefined => {
    return (saveFile.gamestates as any)["PavonisInteractive.TerraInvicta.FactionGoal_NeutralizeNation"]?.find(
      (g: any) => g.Value?.ID?.value === goalId,
    )?.Value as FactionGoal_NeutralizeNation | undefined;
  };
  const getAttackWithFleet = (goalId: number): FactionGoal_AttackWithFleet | undefined => {
    return (saveFile.gamestates as any)["PavonisInteractive.TerraInvicta.FactionGoal_AttackWithFleet"]?.find(
      (g: any) => g.Value?.ID?.value === goalId,
    )?.Value as FactionGoal_AttackWithFleet | undefined;
  };
  const getDefendWithFleet = (goalId: number): FactionGoal_DefendWithFleet | undefined => {
    return (saveFile.gamestates as any)["PavonisInteractive.TerraInvicta.FactionGoal_DefendWithFleet"]?.find(
      (g: any) => g.Value?.ID?.value === goalId,
    )?.Value as FactionGoal_DefendWithFleet | undefined;
  };
  const getWarOnFaction = (goalId: number): FactionGoal_WarOnFaction | undefined => {
    return (saveFile.gamestates as any)["PavonisInteractive.TerraInvicta.FactionGoal_WarOnFaction"]?.find(
      (g: any) => g.Value?.ID?.value === goalId,
    )?.Value as FactionGoal_WarOnFaction | undefined;
  };
  const getInvadeEarth = (goalId: number): FactionGoal_InvadeEarth | undefined => {
    return (saveFile.gamestates as any)["PavonisInteractive.TerraInvicta.FactionGoal_InvadeEarth"]?.find(
      (g: any) => g.Value?.ID?.value === goalId,
    )?.Value as FactionGoal_InvadeEarth | undefined;
  };
  const getBuildFullStation = (goalId: number): FactionGoal_BuildFullStation | undefined => {
    return (saveFile.gamestates as any)["PavonisInteractive.TerraInvicta.FactionGoal_BuildFullStation"]?.find(
      (g: any) => g.Value?.ID?.value === goalId,
    )?.Value as FactionGoal_BuildFullStation | undefined;
  };
  const getBuildFullBase = (goalId: number): FactionGoal_BuildFullBase | undefined => {
    return (saveFile.gamestates as any)["PavonisInteractive.TerraInvicta.FactionGoal_BuildFullBase"]?.find(
      (g: any) => g.Value?.ID?.value === goalId,
    )?.Value as FactionGoal_BuildFullBase | undefined;
  };

  // Process each goal type
  if (alienFaction.factionGoals) {
    // CaptureNationClean
    alienFaction.factionGoals.CaptureNationClean?.forEach((goalRef) => {
      const goal = getCaptureNationClean(goalRef.value);
      if (goal?.nation) {
        const nation = nationsById.get(goal.nation.value);
        if (nation) {
          expandedAlienGoals.push({
            id: goalRef.value,
            importance: goal.importance,
            type: "Capture Nation Clean",
            nation: { id: nation.id, displayName: nation.displayName || "Unknown" },
          });
        }
      }
    });

    // CaptureNationDirty
    alienFaction.factionGoals.CaptureNationDirty?.forEach((goalRef) => {
      const goal = getCaptureNationDirty(goalRef.value);
      if (goal?.nation) {
        const nation = nationsById.get(goal.nation.value);
        if (nation) {
          expandedAlienGoals.push({
            id: goalRef.value,
            importance: goal.importance,
            type: "Capture Nation Dirty",
            nation: { id: nation.id, displayName: nation.displayName || "Unknown" },
          });
        }
      }
    });

    // NeutralizeNation
    alienFaction.factionGoals.NeutralizeNation?.forEach((goalRef) => {
      const goal = getNeutralizeNation(goalRef.value);
      if (goal?.nation) {
        const nation = nationsById.get(goal.nation.value);
        if (nation) {
          expandedAlienGoals.push({
            id: goalRef.value,
            importance: goal.importance,
            type: "Neutralize Nation",
            nation: { id: nation.id, displayName: nation.displayName || "Unknown" },
          });
        }
      }
    });

    // AttackWithFleet
    alienFaction.factionGoals.AttackWithFleet?.forEach((goalRef) => {
      const goal = getAttackWithFleet(goalRef.value);
      if (goal) {
        const expanded: ExpandedGoal = {
          id: goalRef.value,
          importance: goal.importance,
          type: "Attack With Fleet",
        };

        if (goal.attackTarget) {
          // Check if it's a fleet or hab
          const targetFleet = fleets.find((f) => f.id === goal.attackTarget.value);
          if (targetFleet) {
            expanded.attackTargetFleet = {
              id: targetFleet.id,
              displayName: targetFleet.displayName || "Unknown",
            };
          } else {
            const targetHab = habs.find((h) => h.id === goal.attackTarget.value);
            if (targetHab) {
              expanded.attackTarget = {
                id: targetHab.id,
                displayName: targetHab.displayName || "Unknown",
                type: "Hab",
              };
            }
          }
        }

        if (goal.assignedFleet) {
          const assignedFleet = fleets.find((f) => f.id === goal.assignedFleet!.value);
          if (assignedFleet) {
            expanded.assignedFleet = {
              id: assignedFleet.id,
              displayName: assignedFleet.displayName || "Unknown",
            };
          }
        }

        if (goal.pendingFleets && goal.pendingFleets.length > 0) {
          expanded.pendingFleets = goal.pendingFleets
            .map((fleetRef) => {
              const fleet = fleets.find((f) => f.id === fleetRef.value);
              return fleet ? { id: fleet.id, displayName: fleet.displayName || "Unknown" } : null;
            })
            .filter((f): f is { id: number; displayName: string } => f !== null);
        }

        if (goal.enemyFaction) {
          const enemy = factionsById.get(goal.enemyFaction.value);
          if (enemy) {
            expanded.enemyFaction = { id: enemy.id, displayName: enemy.displayName || "Unknown" };
          }
        }

        expandedAlienGoals.push(expanded);
      }
    });

    // DefendWithFleet
    alienFaction.factionGoals.DefendWithFleet?.forEach((goalRef) => {
      const goal = getDefendWithFleet(goalRef.value);
      if (goal) {
        const expanded: ExpandedGoal = {
          id: goalRef.value,
          importance: goal.importance,
          type: "Defend With Fleet",
        };

        if (goal.hab) {
          const hab = habs.find((h) => h.id === goal.hab.value);
          if (hab) {
            expanded.hab = { id: hab.id, displayName: hab.displayName || "Unknown" };
          }
        }

        if (goal.assignedFleet) {
          const assignedFleet = fleets.find((f) => f.id === goal.assignedFleet!.value);
          if (assignedFleet) {
            expanded.assignedFleet = {
              id: assignedFleet.id,
              displayName: assignedFleet.displayName || "Unknown",
            };
          }
        }

        if (goal.pendingFleets && goal.pendingFleets.length > 0) {
          expanded.pendingFleets = goal.pendingFleets
            .map((fleetRef) => {
              const fleet = fleets.find((f) => f.id === fleetRef.value);
              return fleet ? { id: fleet.id, displayName: fleet.displayName || "Unknown" } : null;
            })
            .filter((f): f is { id: number; displayName: string } => f !== null);
        }

        expandedAlienGoals.push(expanded);
      }
    });

    // WarOnFaction
    alienFaction.factionGoals.WarOnFaction?.forEach((goalRef) => {
      const goal = getWarOnFaction(goalRef.value);
      if (goal) {
        const expanded: ExpandedGoal = {
          id: goalRef.value,
          importance: goal.importance,
          type: "War On Faction",
        };

        if (goal.targetFaction) {
          const enemy = factionsById.get(goal.targetFaction.value);
          if (enemy) {
            expanded.enemyFaction = { id: enemy.id, displayName: enemy.displayName || "Unknown" };
          }
        }

        expandedAlienGoals.push(expanded);
      }
    });

    // InvadeEarth
    alienFaction.factionGoals.InvadeEarth?.forEach((goalRef) => {
      const goal = getInvadeEarth(goalRef.value);
      if (goal) {
        const expanded: ExpandedGoal = {
          id: goalRef.value,
          importance: goal.importance,
          type: "Invade Earth",
        };

        if (goal.assignedFleet) {
          const assignedFleet = fleets.find((f) => f.id === goal.assignedFleet!.value);
          if (assignedFleet) {
            expanded.assignedFleet = {
              id: assignedFleet.id,
              displayName: assignedFleet.displayName || "Unknown",
            };
          }
        }

        if (goal.pendingFleets && goal.pendingFleets.length > 0) {
          expanded.pendingFleets = goal.pendingFleets
            .map((fleetRef) => {
              const fleet = fleets.find((f) => f.id === fleetRef.value);
              return fleet ? { id: fleet.id, displayName: fleet.displayName || "Unknown" } : null;
            })
            .filter((f): f is { id: number; displayName: string } => f !== null);
        }

        expandedAlienGoals.push(expanded);
      }
    });

    // BuildFullStation
    alienFaction.factionGoals.BuildFullStation?.forEach((goalRef) => {
      const goal = getBuildFullStation(goalRef.value);
      if (goal?.hab) {
        const hab = habs.find((h) => h.id === goal.hab.value);
        if (hab) {
          let bodyName: string | undefined;
          if (hab.site) {
            // Surface base/station - use site's parentBodyId
            bodyName = bodiesById.get(hab.site.parentBodyId)?.displayName ?? undefined;
          } else if (hab.orbitStateId) {
            // Orbital station - use orbit's barycenter
            const orbit = orbitsById.get(hab.orbitStateId);
            if (orbit) {
              bodyName = bodiesById.get(orbit.barycenterId)?.displayName ?? undefined;
            }
          }
          expandedAlienGoals.push({
            id: goalRef.value,
            importance: goal.importance,
            type: "Build Full Station",
            hab: { id: hab.id, displayName: hab.displayName || "Unknown", bodyName },
          });
        }
      }
    });

    // BuildFullBase
    alienFaction.factionGoals.BuildFullBase?.forEach((goalRef) => {
      const goal = getBuildFullBase(goalRef.value);
      if (goal?.hab) {
        const hab = habs.find((h) => h.id === goal.hab.value);
        if (hab) {
          let bodyName: string | undefined;
          if (hab.site) {
            // Surface base - use site's parentBodyId
            bodyName = bodiesById.get(hab.site.parentBodyId)?.displayName ?? undefined;
          } else if (hab.orbitStateId) {
            // Orbital base - use orbit's barycenter
            const orbit = orbitsById.get(hab.orbitStateId);
            if (orbit) {
              bodyName = bodiesById.get(orbit.barycenterId)?.displayName ?? undefined;
            }
          }
          expandedAlienGoals.push({
            id: goalRef.value,
            importance: goal.importance,
            type: "Build Full Base",
            hab: { id: hab.id, displayName: hab.displayName || "Unknown", bodyName },
          });
        }
      }
    });
  }

  // Sort by importance descending
  expandedAlienGoals.sort((a, b) => b.importance - a.importance);

  return { expandedAlienGoals };
}
