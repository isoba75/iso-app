import { readFile } from "@/lib/github";
import { parseFinanceContext, parseNetWorth } from "@/lib/parsers";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NetWorthChart } from "@/components/finance/net-worth-chart";
import { TrendingDownIcon, TrendingUpIcon } from "lucide-react";

function Row({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
      <div>
        <p className="text-sm">{label}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
      <p className="text-sm font-semibold tabular-nums">{value}</p>
    </div>
  );
}

export default async function FinancePage() {
  const [finCtx, nwRaw] = await Promise.all([
    readFile("Personal Finances/memory/CONTEXT.md").catch(() => ""),
    readFile("Personal Finances/memory/net_worth.md").catch(() => ""),
  ]);

  const f = parseFinanceContext(finCtx);
  const history = parseNetWorth(nwRaw);

  const cashFlowMatch = finCtx.match(/## Monthly Cash Flow[\s\S]*?(?=##|$)/);
  const cashFlowLines = (cashFlowMatch?.[0] ?? "")
    .split("\n")
    .filter((l) => l.includes("|") && !l.includes("---") && !l.includes("Item"))
    .map((l) => {
      const cols = l.split("|").map((c) => c.trim()).filter(Boolean);
      return cols.length >= 2 ? { label: cols[0], amount: cols[1] } : null;
    })
    .filter(Boolean) as { label: string; amount: string }[];

  const income  = cashFlowLines.filter((r) => r.amount.startsWith("+"));
  const expense = cashFlowLines.filter((r) => r.amount.startsWith("−") || r.amount.startsWith("-"));
  const surplus = cashFlowLines.find((r) => r.label.toLowerCase().includes("surplus"));

  return (
    <div className="@container/main flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs @xl/main:grid-cols-3 dark:*:data-[slot=card]:bg-card">
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Net Worth</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {f.netWorth || "—"}
            </CardTitle>
            <CardAction>
              <Badge variant="outline"><TrendingUpIcon />Assets − liabilities</Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="text-sm text-muted-foreground">Updated from CONTEXT.md</CardFooter>
        </Card>

        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Revolut Loan</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {f.revolut.balance || "—"}
            </CardTitle>
            <CardAction>
              <Badge variant="outline"><TrendingDownIcon />Paying down</Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="text-sm text-muted-foreground">{f.revolut.monthly}/mo · Target May 2026</CardFooter>
        </Card>

        <Card className="@container/card">
          <CardHeader>
            <CardDescription>VUAA Start</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {f.vuaaStart || "Jun 2026"}
            </CardTitle>
            <CardAction>
              <Badge variant="outline"><TrendingUpIcon />After Revolut</Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="text-sm text-muted-foreground">Phase 1: ~€1,332/mo</CardFooter>
        </Card>
      </div>

      {/* Chart */}
      {history.length > 0 && (
        <Card>
          <CardHeader><CardDescription>Net Worth History</CardDescription></CardHeader>
          <div className="px-6 pb-4"><NetWorthChart data={history} /></div>
        </Card>
      )}

      {/* Liabilities */}
      <Card>
        <CardHeader><CardDescription>Liabilities</CardDescription></CardHeader>
        <div className="px-6 pb-4">
          <Row label="Revolut loan" value={f.revolut.balance} sub={f.revolut.status} />
          <Row label="SG loan (lost property)" value={f.sg.balance} sub={`${f.sg.monthly}/mo · Ends Oct 2031`} />
          <Row label="SEPU mortgage (Clamart)" value={f.sepu.balance} sub={`${f.sepu.monthly}/mo · Rate 2.8%, ends Oct 2038`} />
        </div>
      </Card>

      {/* Investment plan */}
      <Card>
        <CardHeader><CardDescription>Investment Plan — VUAA</CardDescription></CardHeader>
        <div className="px-6 pb-4">
          <Row label="Phase 1 (after Revolut cleared)" value="~€1,332/mo" />
          <Row label="Phase 2 (from Jun 2027)" value="€2,500/mo" />
          <Row label="Phase 3 (from Nov 2031)" value="€3,500/mo" />
        </div>
      </Card>

      {/* Cash flow */}
      {cashFlowLines.length > 0 && (
        <Card>
          <CardHeader><CardDescription>Monthly Cash Flow</CardDescription></CardHeader>
          <div className="px-6 pb-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">In</p>
                {income.map((r, i) => (
                  <div key={i} className="flex justify-between text-sm py-2 border-b border-border last:border-0">
                    <span className="text-muted-foreground">{r.label}</span>
                    <span className="font-medium tabular-nums">{r.amount}</span>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Out</p>
                {expense.map((r, i) => (
                  <div key={i} className="flex justify-between text-sm py-2 border-b border-border last:border-0">
                    <span className="text-muted-foreground">{r.label}</span>
                    <span className="font-medium tabular-nums text-destructive">{r.amount}</span>
                  </div>
                ))}
              </div>
            </div>
            {surplus && (
              <div className="flex justify-between text-sm font-semibold pt-4 mt-2 border-t border-border">
                <span>Monthly surplus</span>
                <span className="tabular-nums">{surplus.amount}</span>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
