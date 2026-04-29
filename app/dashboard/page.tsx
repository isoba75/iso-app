import { readFile, listFiles } from "@/lib/github";
import { parseFinanceContext, parseDailyLog } from "@/lib/parsers";
import { Card, CardTitle } from "@/components/ui/card";

function Alert({ text, color }: { text: string; color: string }) {
  return (
    <div className={`text-xs px-3 py-1.5 rounded-full border ${color}`}>{text}</div>
  );
}

function StatBlock({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div>
      <div className="text-[var(--muted)] text-xs uppercase tracking-wider mb-1">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
      {sub && <div className="text-[var(--muted)] text-xs mt-0.5">{sub}</div>}
    </div>
  );
}

export default async function DashboardPage() {
  // Load data from iso-life in parallel
  const [finCtx, logFiles] = await Promise.all([
    readFile("Personal Finances/memory/CONTEXT.md").catch(() => ""),
    listFiles("01 Daily Logs").catch(() => [] as string[]),
  ]);

  // Get latest log
  const latestLog = logFiles
    .filter((f) => f.startsWith("[C]") && f.endsWith(".md"))
    .sort()
    .at(-1);
  const logContent = latestLog
    ? await readFile(`01 Daily Logs/${latestLog}`).catch(() => "")
    : "";

  const finance = parseFinanceContext(finCtx);
  const log = parseDailyLog(logContent);

  // Build alerts
  const alerts: { text: string; color: string }[] = [];
  if (finCtx.includes("advance") && finCtx.includes("expected"))
    alerts.push({ text: "⏳ Salary advance pending — check week of May 6", color: "border-yellow-700 text-yellow-400 bg-yellow-950/30" });
  if (finCtx.includes("June") || finCtx.includes("juin"))
    alerts.push({ text: "📋 Tax deadline — file before Jun 4", color: "border-orange-700 text-orange-400 bg-orange-950/30" });
  if ((logFiles.filter((f) => !f.startsWith("[C]") && f.endsWith(".md")).length) > 0)
    alerts.push({ text: "📥 Inbox items waiting", color: "border-blue-700 text-blue-400 bg-blue-950/30" });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Command Centre</h1>
        <p className="text-[var(--muted)] text-sm mt-1">{log.date || "iso-life"}</p>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {alerts.map((a, i) => <Alert key={i} {...a} />)}
        </div>
      )}

      {/* Key stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><StatBlock label="Net Worth" value={finance.netWorth} /></Card>
        <Card><StatBlock label="Revolut" value={finance.revolut.balance} sub={finance.revolut.status} /></Card>
        <Card><StatBlock label="Monthly Income" value={finance.salary} sub="net EUR" /></Card>
        <Card><StatBlock label="VUAA Start" value={finance.vuaaStart || "Jun 2026"} sub="investment begins" /></Card>
      </div>

      {/* Last session */}
      {log.workedOn.length > 0 && (
        <Card>
          <CardTitle>Last session</CardTitle>
          <ul className="space-y-1">
            {log.workedOn.map((item, i) => (
              <li key={i} className="text-sm text-[var(--muted)] before:content-['→_'] before:text-[var(--muted)]">{item}</li>
            ))}
          </ul>
          {log.startHere && (
            <p className="text-sm text-[var(--accent)] mt-3 pt-3 border-t border-[var(--border)]">
              ▸ {log.startHere}
            </p>
          )}
        </Card>
      )}

      {/* Open items */}
      {log.stillOpen.length > 0 && (
        <Card>
          <CardTitle>Still open</CardTitle>
          <ul className="space-y-1.5">
            {log.stillOpen.map((item, i) => (
              <li key={i} className="text-sm text-[var(--muted)] flex gap-2">
                <span className="text-[var(--muted)] mt-0.5">□</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
