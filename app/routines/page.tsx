import { listFiles } from "@/lib/github";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TimerIcon, RadioIcon } from "lucide-react";

interface Routine {
  name: string;
  job: string;
  trigger: string;
  triggerType: "schedule" | "api" | "event";
  outputDir: string; // path on iso-life where outputs land
  permissions: "ON" | "OFF";
  permissionsReason: string;
  status: "live" | "spec-only";
}

// Source of truth: memory/schema.md "Active routines + permission settings" table.
// Hard-coded here as a parsed view; sync manually when memory/schema.md changes.
// (Future: parse memory/schema.md directly; for now small enough to mirror.)
const ROUTINES: Routine[] = [
  {
    name: "Memory Lint",
    job: "Weekly memory drift detection — opens PR with proposed fixes",
    trigger: "Every Sunday 19:00 Baghdad",
    triggerType: "schedule",
    outputDir: "routines/memory-lint",
    permissions: "OFF",
    permissionsReason: "PR-based — Iso reviews proposed fixes",
    status: "live",
  },
  {
    name: "Capture Triage",
    job: "Classifies every capture, auto-files or proposes action",
    trigger: "On every capture (HTTP API)",
    triggerType: "api",
    outputDir: "Feed/proposals",
    permissions: "ON",
    permissionsReason: "Writes proposals + auto-files directly to main",
    status: "live",
  },
  {
    name: "Morning Brief",
    job: "Daily 80-word brief — calendar, tasks, active project, finance pulse",
    trigger: "Sun-Thu 06:30 Baghdad",
    triggerType: "schedule",
    outputDir: "Feed/morning-brief",
    permissions: "ON",
    permissionsReason: "Daily one-file write, no review per write",
    status: "live",
  },
];

interface RoutineWithLastRun extends Routine {
  lastRunDate: string | null;
  lastRunFile: string | null;
}

async function getLastRun(outputDir: string): Promise<{ date: string; file: string } | null> {
  try {
    const files = await listFiles(outputDir);
    const dated = files
      .filter((f) => /^\d{4}-\d{2}-\d{2}/.test(f) && f.endsWith(".md"))
      .sort()
      .reverse();
    if (dated.length === 0) return null;
    const latest = dated[0];
    const dateMatch = latest.match(/^(\d{4}-\d{2}-\d{2})/);
    return { date: dateMatch?.[1] ?? latest, file: latest };
  } catch {
    return null;
  }
}

function relativeTime(dateStr: string): string {
  // Best-effort: dateStr may be just YYYY-MM-DD
  const today = new Date().toISOString().slice(0, 10);
  if (dateStr === today) return "today";
  const yesterday = new Date();
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  if (dateStr === yesterday.toISOString().slice(0, 10)) return "yesterday";
  const d = new Date(dateStr + "T00:00:00Z");
  const diffDays = Math.round((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 7) return `${diffDays} days ago`;
  return dateStr;
}

export default async function RoutinesPage() {
  const enriched: RoutineWithLastRun[] = await Promise.all(
    ROUTINES.map(async (r) => {
      const last = await getLastRun(r.outputDir);
      return {
        ...r,
        lastRunDate: last?.date ?? null,
        lastRunFile: last?.file ?? null,
      };
    })
  );

  return (
    <div className="@container/main flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold">Routines</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Autonomous Claude sessions running on the iso-life repo. Configure on{" "}
          <a href="https://claude.ai/code/routines" target="_blank" rel="noreferrer" className="underline">
            claude.ai/code/routines
          </a>.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {enriched.map((r) => (
          <Card key={r.name}>
            <CardContent className="pt-5 pb-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="rounded-lg bg-muted p-2 shrink-0">
                    {r.triggerType === "schedule" ? (
                      <TimerIcon className="size-4 text-muted-foreground" />
                    ) : (
                      <RadioIcon className="size-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-semibold leading-tight">{r.name}</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">{r.job}</p>
                  </div>
                </div>
                <Badge variant={r.status === "live" ? "default" : "outline"} className="shrink-0 text-xs">
                  {r.status === "live" ? "Live" : "Spec only"}
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Trigger</p>
                  <p>{r.trigger}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Last run</p>
                  <p>
                    {r.lastRunDate ? (
                      <>
                        {relativeTime(r.lastRunDate)}{" "}
                        <a
                          href={`https://github.com/isoba75/iso-life/blob/main/${r.outputDir}/${r.lastRunFile}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-muted-foreground underline ml-1"
                        >
                          view
                        </a>
                      </>
                    ) : (
                      <span className="text-muted-foreground">never</span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Output</p>
                  <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">{r.outputDir}/</code>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Permissions</p>
                  <p>
                    Push to main: <span className="font-mono">{r.permissions}</span>
                    <span className="text-xs text-muted-foreground block">{r.permissionsReason}</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        Source of truth: <code className="bg-muted px-1 rounded font-mono">memory/schema.md</code> &quot;Active routines&quot; table.
        Add new routines via the <code className="bg-muted px-1 rounded font-mono">create-routine</code> skill.
      </p>
    </div>
  );
}
