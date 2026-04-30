import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const routines = [
  { name: "Heartbeat", schedule: "Daily 7am", description: "Reads your full context → writes a 3-sentence daily pulse", file: "routines/heartbeat/YYYY-MM-DD.md" },
  { name: "Weekly Review", schedule: "Sunday 8pm", description: "Full week summary across finance, projects, and habits", file: "routines/weekly/YYYY-WW.md" },
  { name: "Mission Runner", schedule: "Daily 6am", description: "Runs active missions, writes results with proposals", file: "missions/results/" },
  { name: "Finance Snapshot", schedule: "Monthly 1st", description: "Appends net worth row to history file", file: "Personal Finances/memory/net_worth.md" },
  { name: "Habit Report", schedule: "Daily midnight", description: "Aggregates habit completions and calculates streaks", file: "routines/habit-report/YYYY-MM-DD.md" },
];

export default function RoutinesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Routines</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Cloud sub-agents that run on schedule via GitHub Actions.
        </p>
      </div>
      <div className="grid gap-3">
        {routines.map((r) => (
          <Card key={r.name}>
            <CardHeader className="pb-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">{r.name}</span>
                <Badge variant="outline" className="text-[10px] font-mono">{r.schedule}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-2">{r.description}</p>
              <p className="text-[10px] font-mono text-muted-foreground mb-3">→ {r.file}</p>
              <Button disabled size="sm" variant="outline" className="text-xs">
                Run now (Phase C)
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
