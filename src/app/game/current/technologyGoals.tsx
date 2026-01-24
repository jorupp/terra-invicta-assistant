"use client";

import { Gears, TechIcons, UnknownIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Analysis } from "@/lib/analysis";
import { XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";

const STORAGE_KEY = "technologyGoals";

interface TechnologyGoal {
  id: string;
  type: "tech" | "project";
  name: string;
  displayName: string;
}

function loadGoalsFromStorage(): TechnologyGoal[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error("Failed to load technology goals:", e);
  }
  return [];
}

function saveGoalsToStorage(goals: TechnologyGoal[]) {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
  } catch (e) {
    console.error("Failed to save technology goals:", e);
  }
}

export function useTechnologyGoals(analysis: Analysis) {
  const [goals, setGoals] = useState<TechnologyGoal[]>([]);

  useEffect(() => {
    setGoals(loadGoalsFromStorage());
  }, []);

  const addGoal = (type: "tech" | "project", name: string) => {
    const isProject = type === "project";
    const item = isProject ? analysis.projects.get(name) : analysis.techs.get(name);

    if (!item) return;

    const newGoal: TechnologyGoal = {
      id: `${type}-${name}-${Date.now()}`,
      type,
      name,
      displayName: item.friendlyName || name,
    };

    const updatedGoals = [...goals, newGoal];
    setGoals(updatedGoals);
    saveGoalsToStorage(updatedGoals);
  };

  const removeGoal = (id: string) => {
    const updatedGoals = goals.filter((g) => g.id !== id);
    setGoals(updatedGoals);
    saveGoalsToStorage(updatedGoals);
  };

  return { goals, addGoal, removeGoal };
}

function TechnologyGoalsDialogContent({
  analysis,
  goals,
  onAdd,
  onRemove,
}: {
  analysis: Analysis;
  goals: TechnologyGoal[];
  onAdd: (type: "tech" | "project", name: string) => void;
  onRemove: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<"tech" | "project">("tech");
  const [selectedName, setSelectedName] = useState<string>("");

  const handleAdd = () => {
    if (!selectedName) return;
    onAdd(selectedType, selectedName);
    setSelectedName("");
  };

  const techOptions = Array.from(analysis.techs.values())
    .map((tech) => ({
      name: tech.dataName,
      displayName: tech.friendlyName || tech.dataName,
    }))
    .sort((a, b) => a.displayName.localeCompare(b.displayName));

  const projectOptions = Array.from(analysis.projects.values())
    .map((project) => ({
      name: project.dataName,
      displayName: project.friendlyName || project.dataName,
    }))
    .sort((a, b) => a.displayName.localeCompare(b.displayName));

  const availableOptions = selectedType === "tech" ? techOptions : projectOptions;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Set Technology Goals</Button>
      </DialogTrigger>
      <DialogContent className="md:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Technology Goals</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold">Current Goals</h3>
            {goals.length === 0 ? (
              <p className="text-sm text-muted-foreground">No goals set yet.</p>
            ) : (
              <ul className="space-y-1">
                {goals.map((goal) => (
                  <li key={goal.id} className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">
                      <span className="font-medium">{goal.type === "tech" ? "Tech" : "Project"}:</span>{" "}
                      {goal.displayName}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemove(goal.id)}
                      className="h-6 w-6 p-0"
                      title="Remove goal"
                    >
                      <XIcon className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="space-y-2 border-t pt-4">
            <h3 className="font-semibold">Add New Goal</h3>
            <div className="flex gap-2">
              <Select value={selectedType} onValueChange={(v: "tech" | "project") => setSelectedType(v)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tech">Technology</SelectItem>
                  <SelectItem value="project">Project</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedName} onValueChange={setSelectedName}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder={`Select a ${selectedType}...`} />
                </SelectTrigger>
                <SelectContent>
                  {availableOptions.map((option) => (
                    <SelectItem key={option.name} value={option.name}>
                      {option.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button onClick={handleAdd} disabled={!selectedName}>
                Add
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function TechnologyGoalsDialog({
  analysis,
  goals,
  onAdd,
  onRemove,
}: {
  analysis: Analysis;
  goals: TechnologyGoal[];
  onAdd: (type: "tech" | "project", name: string) => void;
  onRemove: (id: string) => void;
}) {
  return <TechnologyGoalsDialogContent analysis={analysis} goals={goals} onAdd={onAdd} onRemove={onRemove} />;
}

export function TechnologyGoalsList({
  goals,
  onRemove,
  analysis,
}: {
  goals: TechnologyGoal[];
  onRemove: (id: string) => void;
  analysis: Analysis;
}) {
  if (goals.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No technology goals set. Click the button above to add some.</p>
    );
  }
  return goals.map((goal) =>
    analysis.globalTechState.finishedTechsNames.includes(goal.name) ||
    analysis.playerFaction.finishedProjectNames.includes(goal.name) ? null : (
      <Card key={goal.id} className="mb-2">
        <CardHeader>
          <CardTitle>{goal.displayName}</CardTitle>
        </CardHeader>
        <CardContent>
          <TechnologyGoalsDisplay key={goal.id} goals={[goal]} onRemove={onRemove} analysis={analysis} />
        </CardContent>
      </Card>
    )
  );
}

function buildTechsList(goals: TechnologyGoal[], analysis: Analysis) {
  const availableProjects = new Set(analysis.playerFaction.availableProjectNames);
  const complete = new Set([
    ...analysis.globalTechState.finishedTechsNames,
    ...analysis.playerFaction.finishedProjectNames,
  ]);
  const goalsByName = new Map(goals.map((g) => [g.name, g]));
  const required = new Map<string, number>();

  for (const goal of goalsByName.keys()) {
    if (!complete.has(goal)) {
      required.set(goal, 0);
    }
  }

  while (true) {
    let done = true;
    for (const req of Array.from(required.keys())) {
      const prereqs = analysis.techs.get(req)?.prereqs || analysis.projects.get(req)?.prereqs;
      if (!prereqs) continue;
      for (const prereq of prereqs) {
        if (!complete.has(prereq)) {
          if (!required.has(prereq)) {
            required.set(prereq, required.get(req)! + 1);
            done = false;
          } else {
            const existing = required.get(prereq)!;
            const candidate = required.get(req)! + 1;
            if (candidate > existing) {
              required.set(prereq, candidate);
              done = false;
            }
          }
        }
      }
    }
    if (done) break;
  }

  const accumulatedResearchByName = new Map<string, number>([
    ...analysis.globalTechState.techProgress.map((i) => [i.techTemplateName, i.accumulatedResearch] as const),
    ...analysis.playerFaction.currentProjectProgress.map(
      (i) => [i.projectTemplateName, i.accumulatedResearch] as const
    ),
  ]);

  const techs = Array.from(required.keys())
    .map((name) => {
      const order = required.get(name)!;
      const tech = analysis.techs.get(name);
      const project = analysis.projects.get(name);
      const both = tech || project;
      const researchCost = both?.researchCost || 0;
      const accumulatedResearch = accumulatedResearchByName.get(name) || 0;
      const remainingCost = Math.max(researchCost - accumulatedResearch, 0);
      const prereqs = both?.prereqs
        ?.map((i) => analysis.techs.get(i) || analysis.projects.get(i))
        .filter((i): i is NonNullable<typeof i> => !!i)
        .filter((i) => !complete.has(i.dataName))
        .map((i) => i.friendlyName);
      return {
        isTech: !!tech,
        name,
        techCategory: both?.techCategory,
        friendlyName: both?.friendlyName || name,
        displayName: both?.displayName,
        summary: both?.summary,
        description: both?.description,
        quote: tech?.quote,
        researchCost,
        accumulatedResearch,
        remainingCost,
        order,
        prereqs,
      };
    })
    .toSorted((a, b) => {
      if (a.order !== b.order) {
        return b.order - a.order;
      }
      return a.remainingCost - b.remainingCost;
    });

  return techs;
}

function TechnologyGoalsDisplay({
  goals,
  onRemove,
  analysis,
}: {
  goals: TechnologyGoal[];
  onRemove: (id: string) => void;
  analysis: Analysis;
}) {
  if (goals.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No technology goals set. Click the button above to add some.</p>
    );
  }

  const goalsByName = new Map(goals.map((g) => [g.name, g]));
  const availableProjects = new Set(analysis.playerFaction.availableProjectNames);
  const techs = buildTechsList(goals, analysis);

  return (
    <ul className="space-y-1">
      {techs.map((tech) => {
        const goal = goalsByName.get(tech.name)?.id;
        const Icon = tech.techCategory ? TechIcons[tech.techCategory] || UnknownIcon : UnknownIcon;
        return (
          <li key={tech.name} title={tech.prereqs?.join(", ")}>
            {process.env.NEXT_PUBLIC_TECH_TREE_VIEWER ? (
              <a
                href={process.env.NEXT_PUBLIC_TECH_TREE_VIEWER + "#/" + tech.name}
                target="_blank"
                rel="noreferrer"
                className="underline hover:text-primary mr-2"
              >
                View
              </a>
            ) : null}
            {tech.isTech ? (
              <span className="px-2 mr-1" />
            ) : (
              <span className={twMerge("mr-1", availableProjects.has(tech.name) ? "" : "opacity-30")}>
                <Gears />
              </span>
            )}
            <span className="mr-1">
              <Icon />
            </span>
            {tech.displayName ?? tech.friendlyName} ({tech.accumulatedResearch.toFixed(0)}/
            {tech.researchCost.toFixed(0)})
            {goal && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemove(goal)}
                className="h-6 w-6 p-0"
                title="Remove goal"
              >
                <XIcon className="h-4 w-4" />
              </Button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
