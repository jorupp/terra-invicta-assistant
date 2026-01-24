"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Analysis } from "@/lib/analysis";
import { XIcon } from "lucide-react";
import { useEffect, useState } from "react";

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

export function TechnologyGoalsList({ goals, onRemove }: { goals: TechnologyGoal[]; onRemove: (id: string) => void }) {
  if (goals.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No technology goals set. Click the button above to add some.</p>
    );
  }

  return (
    <ul className="space-y-1">
      {goals.map((goal) => (
        <li key={goal.id} className="flex items-center justify-between p-2 border rounded">
          <span className="text-sm">
            <span className="font-medium">{goal.type === "tech" ? "Tech" : "Project"}:</span> {goal.displayName}
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
  );
}
