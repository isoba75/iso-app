import { readFile } from "@/lib/github";
import { parseFinanceContext, parseNetWorth } from "@/lib/parsers";
import { Card, CardTitle } from "@/components/ui/card";
import { NetWorthChart } from "@/components/finance/net-worth-chart";

interface LoanRowProps { name: string; balance: string; monthly: string; note?: string; highlight?: boolean }
function LoanRow({ name, balance, monthly, note, highlight }: LoanRowProps) {
  return (
    <div className={`flex items-center justify-between py-3 border-b border-[#1e1e1e] last:border-0 ${highlight ? "text-yellow-400" : ""}`}>
      <div>
        <div className="text-sm font-medium">{name}</div>
        {note && <div className="text-xs text-[var(--muted)] mt-0.5">{note}</div>}
      </div>
      <div className="text-right">
        <div className="text-sm font-bold">{balance}</div>
        <div className="text-xs text-[var(--muted)]">{monthly}/mo</div>
      </div>
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

  // Extract cash flow items manually from markdown
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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Finance Hub</h1>

      {/* Net worth + chart */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardTitle>Net Worth</CardTitle>
          <div className="text-4xl font-bold text-[var(--accent)]">{f.netWorth}</div>
          <div className="text-xs text-[var(--muted)] mt-1">assets − liabilities</div>
        </Card>
        <Card>
          <CardTitle>History</CardTitle>
          {history.length > 0
            ? <NetWorthChart data={history} />
            : <p className="text-sm text-[var(--muted)]">No snapshots yet</p>}
        </Card>
      </div>

      {/* Loans */}
      <Card>
        <CardTitle>Liabilities</CardTitle>
        <LoanRow name="Revolut loan" balance={f.revolut.balance} monthly={f.revolut.monthly} note={f.revolut.status} highlight={f.revolut.status.includes("Clearing")} />
        <LoanRow name="SG loan (lost property)" balance={f.sg.balance} monthly={f.sg.monthly} note="Ends Oct 2031" />
        <LoanRow name="SEPU mortgage (Clamart)" balance={f.sepu.balance} monthly={f.sepu.monthly} note="Rate 2.8%, ends Oct 2038" />
      </Card>

      {/* VUAA milestone */}
      <Card>
        <CardTitle>Investment Plan</CardTitle>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-[var(--muted)]">VUAA start</span>
            <span className="text-[var(--accent)] font-semibold">{f.vuaaStart || "Jun 2026"}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[var(--muted)]">Monthly contribution (Phase 1)</span>
            <span>~€1,332/mo</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[var(--muted)]">Monthly contribution (from Jun 2027)</span>
            <span>€2,500/mo</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[var(--muted)]">Monthly contribution (from Nov 2031)</span>
            <span>€3,500/mo</span>
          </div>
        </div>
      </Card>

      {/* Cash flow */}
      {cashFlowLines.length > 0 && (
        <Card>
          <CardTitle>Monthly Cash Flow</CardTitle>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-[var(--muted)] mb-2">IN</p>
              {income.map((r, i) => (
                <div key={i} className="flex justify-between text-sm py-1.5 border-b border-[#1e1e1e] last:border-0">
                  <span className="text-[var(--muted)]">{r.label}</span>
                  <span className="text-[var(--accent)]">{r.amount}</span>
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs text-[var(--muted)] mb-2">OUT</p>
              {expense.map((r, i) => (
                <div key={i} className="flex justify-between text-sm py-1.5 border-b border-[#1e1e1e] last:border-0">
                  <span className="text-[var(--muted)]">{r.label}</span>
                  <span className="text-[#e87d7d]">{r.amount}</span>
                </div>
              ))}
            </div>
          </div>
          {surplus && (
            <div className="flex justify-between text-sm font-bold pt-3 mt-3 border-t border-[var(--border)]">
              <span>Monthly surplus</span>
              <span className="text-[var(--accent)]">{surplus.amount}</span>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
