"use client";

import { useState, useEffect, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MissionDataName, TechCategory } from "@/lib/template-types-generated";
import { InfoTooltip } from "@/components/infoTooltip";

interface SavedWeightConfigs {
  current: ScoringWeights;
  saved: Record<string, ScoringWeights>;
}

const STORAGE_KEY = "councilorScoringWeights";

export function loadWeightsFromStorage(): ScoringWeights {
  if (typeof window === "undefined") return defaultScoringWeights;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed: SavedWeightConfigs = JSON.parse(stored);
      return parsed.current || defaultScoringWeights;
    }
  } catch (e) {
    console.error("Failed to load scoring weights:", e);
  }
  return defaultScoringWeights;
}

function saveWeightsToStorage(weights: ScoringWeights, savedConfigs: Record<string, ScoringWeights>) {
  if (typeof window === "undefined") return;

  try {
    const data: SavedWeightConfigs = {
      current: weights,
      saved: savedConfigs,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save scoring weights:", e);
  }
}

function loadSavedConfigsFromStorage(): Record<string, ScoringWeights> {
  if (typeof window === "undefined") return {};

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed: SavedWeightConfigs = JSON.parse(stored);
      return parsed.saved || {};
    }
  } catch (e) {
    console.error("Failed to load saved configs:", e);
  }
  return {};
}

function NumberInput({
  label,
  value,
  onChange,
}: {
  label: ReactNode;
  value: number | undefined;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <Label className="text-xs whitespace-nowrap flex-shrink-0" style={{ width: "8rem" }}>
        {label}
      </Label>
      <Input
        type="number"
        step="0.001"
        value={value ?? 0}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="text-sm flex-shrink-0"
        style={{ height: "1.75rem", width: "6rem" }}
      />
    </div>
  );
}

export function ScoringWeightsDialog({
  weights,
  onWeightsChange,
}: {
  weights: ScoringWeights;
  onWeightsChange: (weights: ScoringWeights) => void;
}) {
  const [open, setOpen] = useState(false);
  const [editedWeights, setEditedWeights] = useState<ScoringWeights>(weights);
  const [savedConfigs, setSavedConfigs] = useState<Record<string, ScoringWeights>>({});
  const [selectedConfig, setSelectedConfig] = useState<string>("");
  const [newConfigName, setNewConfigName] = useState("");

  useEffect(() => {
    setEditedWeights(weights);
  }, [weights]);

  useEffect(() => {
    if (open) {
      setSavedConfigs(loadSavedConfigsFromStorage());
    }
  }, [open]);

  const handleSave = () => {
    if (newConfigName.trim()) {
      const updated = { ...savedConfigs, [newConfigName.trim()]: editedWeights };
      setSavedConfigs(updated);
      saveWeightsToStorage(editedWeights, updated);
      setNewConfigName("");
      setSelectedConfig(newConfigName.trim());
    }
  };

  const handleLoad = () => {
    if (selectedConfig) {
      const config = prebuiltScoringWeights[selectedConfig] || savedConfigs[selectedConfig];
      if (config) {
        setEditedWeights(config);
      }
    }
  };

  const handleApply = () => {
    onWeightsChange(editedWeights);
    saveWeightsToStorage(editedWeights, savedConfigs);
    setOpen(false);
  };

  const handleDelete = () => {
    if (selectedConfig && !prebuiltScoringWeights[selectedConfig] && savedConfigs[selectedConfig]) {
      const updated = { ...savedConfigs };
      delete updated[selectedConfig];
      setSavedConfigs(updated);
      saveWeightsToStorage(editedWeights, updated);
      setSelectedConfig("");
    }
  };

  const updateWeight = (key: keyof ScoringWeights, value: number) => {
    setEditedWeights({ ...editedWeights, [key]: value });
  };

  const updateCouncilorTechBonus = (category: TechCategory, value: number) => {
    setEditedWeights({
      ...editedWeights,
      councilorTechBonus: { ...editedWeights.councilorTechBonus, [category]: value },
    });
  };

  const updateTechBonus = (category: TechCategory, value: number) => {
    setEditedWeights({
      ...editedWeights,
      techBonuses: { ...editedWeights.techBonuses, [category]: value },
    });
  };

  const updateMissionWeight = (mission: MissionDataName, value: number) => {
    setEditedWeights({
      ...editedWeights,
      missions: { ...editedWeights.missions, [mission]: value },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Configure Scoring</Button>
      </DialogTrigger>
      <DialogContent
        className="w-screen max-w-screen-2xl max-h-screen overflow-y-auto"
        style={{ maxWidth: "1400px", width: "95vw", maxHeight: "90vh" }}
      >
        <DialogHeader>
          <DialogTitle>Configure Scoring Weights</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {/* Save/Load Controls */}
          <div className="flex gap-2 items-center border-b pb-4">
            <Label className="whitespace-nowrap">Load Saved Configuration</Label>
            <div className="flex-1">
              <Select value={selectedConfig} onValueChange={setSelectedConfig}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a saved configuration" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(prebuiltScoringWeights).map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                  {Object.keys(savedConfigs).length > 0 && Object.keys(prebuiltScoringWeights).length > 0 && (
                    <SelectItem key="__separator__" value="__separator__" disabled>
                      ──────────
                    </SelectItem>
                  )}
                  {Object.keys(savedConfigs).map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleLoad} disabled={!selectedConfig}>
              Load
            </Button>
            <Button
              onClick={handleDelete}
              variant="destructive"
              disabled={!selectedConfig || !!prebuiltScoringWeights[selectedConfig]}
            >
              Delete
            </Button>
          </div>

          <div className="flex gap-2 items-center border-b pb-4 mt-4">
            <Label className="whitespace-nowrap">Save Current Configuration</Label>
            <div className="flex-1">
              <Input
                placeholder="Enter configuration name"
                value={newConfigName}
                onChange={(e) => setNewConfigName(e.target.value)}
              />
            </div>
            <Button onClick={handleSave} disabled={!newConfigName.trim()}>
              Save
            </Button>
          </div>

          <div className="grid gap-x-8 gap-y-3 items-start" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
            {/* Column 1 */}
            <div className="space-y-3">
              {/* Councilor Attributes */}
              <div>
                <h3 className="font-semibold mb-1.5 text-sm">Councilor Attributes</h3>
                <div className="space-y-1">
                  <NumberInput
                    label="Persuasion"
                    value={editedWeights.persuasion}
                    onChange={(v) => updateWeight("persuasion", v)}
                  />
                  <NumberInput
                    label="Command"
                    value={editedWeights.command}
                    onChange={(v) => updateWeight("command", v)}
                  />
                  <NumberInput
                    label="Investigation"
                    value={editedWeights.investigation}
                    onChange={(v) => updateWeight("investigation", v)}
                  />
                  <NumberInput
                    label="Espionage"
                    value={editedWeights.espionage}
                    onChange={(v) => updateWeight("espionage", v)}
                  />
                  <NumberInput
                    label="Administration"
                    value={editedWeights.administration}
                    onChange={(v) => updateWeight("administration", v)}
                  />
                  <NumberInput
                    label="Science"
                    value={editedWeights.science}
                    onChange={(v) => updateWeight("science", v)}
                  />
                  <NumberInput
                    label="Security"
                    value={editedWeights.security}
                    onChange={(v) => updateWeight("security", v)}
                  />
                  <NumberInput
                    label={
                      <>
                        XP Modifier{" "}
                        <InfoTooltip>
                          Assuming 4 XP per mission and 24 missions/year, this means a Quick Learner councilor would
                          gain about 1 extra level every ~2 years, so <code>-50</code> makes Quick Learner worth about 5
                          points over a ~10-year period (and Striver worth 10 points over the same period).
                        </InfoTooltip>
                      </>
                    }
                    value={editedWeights.xpModifier}
                    onChange={(v) => updateWeight("xpModifier", v)}
                  />
                  <NumberInput label="Raw XP" value={editedWeights.xp} onChange={(v) => updateWeight("xp", v)} />
                </div>
              </div>

              {/* Monthly Income */}
              <div>
                <h3 className="font-semibold mb-1.5 text-sm">Monthly Income</h3>
                <div className="space-y-1">
                  <NumberInput
                    label="Boost"
                    value={editedWeights.incomeBoost_month}
                    onChange={(v) => updateWeight("incomeBoost_month", v)}
                  />
                  <NumberInput
                    label="Money"
                    value={editedWeights.incomeMoney_month}
                    onChange={(v) => updateWeight("incomeMoney_month", v)}
                  />
                  <NumberInput
                    label="Influence"
                    value={editedWeights.incomeInfluence_month}
                    onChange={(v) => updateWeight("incomeInfluence_month", v)}
                  />
                  <NumberInput
                    label="Ops"
                    value={editedWeights.incomeOps_month}
                    onChange={(v) => updateWeight("incomeOps_month", v)}
                  />
                  <NumberInput
                    label="Mission Control"
                    value={editedWeights.incomeMissionControl}
                    onChange={(v) => updateWeight("incomeMissionControl", v)}
                  />
                  <NumberInput
                    label="Research"
                    value={editedWeights.incomeResearch_month}
                    onChange={(v) => updateWeight("incomeResearch_month", v)}
                  />
                  <NumberInput
                    label="Project Capacity"
                    value={editedWeights.projectCapacityGranted}
                    onChange={(v) => updateWeight("projectCapacityGranted", v)}
                  />
                </div>
              </div>

              {/* Purchase Costs */}
              <div>
                <h3 className="font-semibold mb-1.5 text-sm">Purchase Costs</h3>
                <div className="space-y-1">
                  <NumberInput
                    label="Money Cost"
                    value={editedWeights.costMoney}
                    onChange={(v) => updateWeight("costMoney", v)}
                  />
                  <NumberInput
                    label="Influence Cost"
                    value={editedWeights.costInfluence}
                    onChange={(v) => updateWeight("costInfluence", v)}
                  />
                  <NumberInput
                    label="Ops Cost"
                    value={editedWeights.costOps}
                    onChange={(v) => updateWeight("costOps", v)}
                  />
                  <NumberInput
                    label="Boost Cost"
                    value={editedWeights.costBoost}
                    onChange={(v) => updateWeight("costBoost", v)}
                  />
                </div>
              </div>
            </div>

            {/* Column 2 */}
            <div className="space-y-3">
              {/* Priority Bonuses */}
              <div>
                <h3 className="font-semibold mb-1.5 text-sm">Priority Bonuses</h3>
                <div className="space-y-1">
                  <NumberInput
                    label="Economy"
                    value={editedWeights.economyBonus}
                    onChange={(v) => updateWeight("economyBonus", v)}
                  />
                  <NumberInput
                    label="Welfare"
                    value={editedWeights.welfareBonus}
                    onChange={(v) => updateWeight("welfareBonus", v)}
                  />
                  <NumberInput
                    label="Environment"
                    value={editedWeights.environmentBonus}
                    onChange={(v) => updateWeight("environmentBonus", v)}
                  />
                  <NumberInput
                    label="Knowledge"
                    value={editedWeights.knowledgeBonus}
                    onChange={(v) => updateWeight("knowledgeBonus", v)}
                  />
                  <NumberInput
                    label="Government"
                    value={editedWeights.governmentBonus}
                    onChange={(v) => updateWeight("governmentBonus", v)}
                  />
                  <NumberInput
                    label="Unity"
                    value={editedWeights.unityBonus}
                    onChange={(v) => updateWeight("unityBonus", v)}
                  />
                  <NumberInput
                    label="Military"
                    value={editedWeights.militaryBonus}
                    onChange={(v) => updateWeight("militaryBonus", v)}
                  />
                  <NumberInput
                    label="Oppression"
                    value={editedWeights.oppressionBonus}
                    onChange={(v) => updateWeight("oppressionBonus", v)}
                  />
                  <NumberInput
                    label="Spoils"
                    value={editedWeights.spoilsBonus}
                    onChange={(v) => updateWeight("spoilsBonus", v)}
                  />
                  <NumberInput
                    label="Space Dev"
                    value={editedWeights.spaceDevBonus}
                    onChange={(v) => updateWeight("spaceDevBonus", v)}
                  />
                  <NumberInput
                    label="Spaceflight"
                    value={editedWeights.spaceflightBonus}
                    onChange={(v) => updateWeight("spaceflightBonus", v)}
                  />
                  <NumberInput
                    label="MC Bonus"
                    value={editedWeights.MCBonus}
                    onChange={(v) => updateWeight("MCBonus", v)}
                  />
                  <NumberInput
                    label="Mining"
                    value={editedWeights.miningBonus}
                    onChange={(v) => updateWeight("miningBonus", v)}
                  />
                </div>
              </div>

              {/* Tech Bonuses (from Councilor/Traits) */}
              <div>
                <h3 className="font-semibold mb-1.5 text-sm">Councilor Tech Bonuses</h3>
                <div className="space-y-1">
                  {[
                    "Energy",
                    "InformationScience",
                    "LifeScience",
                    "Materials",
                    "MilitaryScience",
                    "SocialScience",
                    "SpaceScience",
                  ].map((cat) => (
                    <NumberInput
                      key={cat}
                      label={cat}
                      value={editedWeights.councilorTechBonus?.[cat as TechCategory]}
                      onChange={(v) => updateCouncilorTechBonus(cat as TechCategory, v)}
                    />
                  ))}
                </div>
              </div>

              {/* Tech Bonuses (from Orgs) */}
              <div>
                <h3 className="font-semibold mb-1.5 text-sm">Org Tech Bonuses</h3>
                <div className="space-y-1">
                  {[
                    "Energy",
                    "InformationScience",
                    "LifeScience",
                    "Materials",
                    "MilitaryScience",
                    "SocialScience",
                    "SpaceScience",
                  ].map((cat) => (
                    <NumberInput
                      key={cat}
                      label={cat}
                      value={editedWeights.techBonuses?.[cat as TechCategory]}
                      onChange={(v) => updateTechBonus(cat as TechCategory, v)}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Column 3 */}
            <div className="space-y-3">
              {/* Mission Weights */}
              <div>
                <h3 className="font-semibold mb-1.5 text-sm">Mission Weights</h3>
                <div className="space-y-1">
                  {Object.keys(editedWeights.missions || {}).map((mission) => (
                    <NumberInput
                      key={mission}
                      label={mission}
                      value={editedWeights.missions?.[mission as MissionDataName]}
                      onChange={(v) => updateMissionWeight(mission as MissionDataName, v)}
                    />
                  ))}
                </div>
              </div>

              {/* Other Settings */}
              <div>
                <h3 className="font-semibold mb-1.5 text-sm">Other Settings</h3>
                <div className="space-y-1">
                  <NumberInput
                    label="Org Tier Exponent"
                    value={editedWeights.orgTierExponent}
                    onChange={(v) => updateWeight("orgTierExponent", v)}
                  />
                  <NumberInput
                    label="Missing Mission Wt"
                    value={editedWeights.extraWeightForMissingMissions}
                    onChange={(v) => updateWeight("extraWeightForMissingMissions", v)}
                  />
                  <NumberInput
                    label="Single Mission Wt"
                    value={editedWeights.extraWeightForSingleMissions}
                    onChange={(v) => updateWeight("extraWeightForSingleMissions", v)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleApply}>Apply</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

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

// initial defaults based on my old scoring system for mid/late game
export const prebuiltScoringWeights: Record<string, ScoringWeights> = {
  "Preconfigured: Default": {
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
      Energy: 10,
      InformationScience: 10,
      LifeScience: 10,
      Materials: 10,
      MilitaryScience: 10,
      SocialScience: 10,
      SpaceScience: 10,
    },

    missions: {
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
  },
  "Preconfigured: Early Game": {
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
      Energy: 15,
      InformationScience: 15,
      LifeScience: 15,
      Materials: 15,
      MilitaryScience: 15,
      SocialScience: 15,
      SpaceScience: 15,
    },

    missions: {
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
  },
};

export const defaultScoringWeights = prebuiltScoringWeights["Preconfigured: Default"];
