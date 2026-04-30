import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TimerIcon, PlayIcon } from "lucide-react";

const routines = [
  { name: "Heartbeat",        schedule: "Daily 7am",     description: "Reads your full context → writes a 3-sentence daily pulse", file: "routines/heartbeat/YYYY-MM-DD.md" },
  { name: "Weekly Review",    schedule: "Sunday 8pm",    description: "Full week summary across finance, projects, and habits",     file: "routines/weekly/YYYY-WW.md" },
  { name: "Mission Runner",   schedule: "Daily 6am",     description: "Runs active missions, writes results with proposals",        file: "missions/results/" },
  { name: "Finance Snapshot", schedule: "Monthly 1st",   description: "Appends net worth row to history file",                     file: "Personal Finances/memory/net_worth.md" },
  { name: "Habit Report",     schedule: "Daily midnight", description: "Aggregates habit completions and calculates streaks",       file: "routines/habit-report/YYYY-MM-DD.md" },
];

export default function RoutinesPage() {
  return (
    <div className="@container/main flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
      <div>
        <h1 className="text-base font-semibold">Routines</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Cloud sub-agents running on schedule via GitHub Actions.
        </p>
      </div>

      <div className="grid gap-3">
        {routines.map((r) => (
          <Card key={r.name}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="rounded-md bg-muted p-1.5 shrink-0">
                    <TimerIcon className="size-3.5 text-muted-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-medium">{r.name}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">{r.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="outline" className="text-[10px] font-mono">{r.schedule}</Badge>
                  <Button size="icon" variant="ghost" className="size-7" disabled>
                    <PlayIcon className="size-3" />
                  </Button>
                </div>
              </div>
              <p className="text-[10px] font-mono text-muted-foreground pl-9">→ {r.file}</p>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
