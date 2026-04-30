// Parse key figures from Personal Finances/memory/CONTEXT.md
export interface FinanceContext {
  netWorth: string;
  revolut: { balance: string; monthly: string; status: string };
  sg: { balance: string; monthly: string };
  sepu: { balance: string; monthly: string };
  salary: string;
  vuaaStart: string;
  advanceStatus: string;
  lastSessionSummary: string;
}

export function parseFinanceContext(md: string): FinanceContext {
  const line = (pattern: RegExp) => {
    const m = md.match(pattern);
    return m ? m[1].trim() : "—";
  };

  // Net worth
  const nwMatch = md.match(/\*\*Net worth[^*]*\*\*[:\s~€]*([\d,]+)/);
  const netWorth = nwMatch ? `€${nwMatch[1]}` : line(/Net worth[^€]*€([\d,]+)/);

  // Liabilities table rows
  const revolut = {
    balance: line(/Revolut[^|]+\|\s*\*{0,2}(€[\d,\.]+)/),
    monthly: line(/Revolut[^|]+\|[^|]+\|\s*(€[\d,\.]+)/),
    status: md.includes("CLEARING") ? "Clearing with advance" : md.includes("cleared") ? "Cleared ✓" : "Active",
  };
  const sg = {
    balance: line(/SG loan[^|]+\|\s*(€[\d,\.]+)/),
    monthly: line(/SG loan[^|]+\|[^|]+\|\s*(€[\d,\.]+)/),
  };
  const sepu = {
    balance: line(/SEPU[^|]+\|\s*(€[\d,\.]+)/),
    monthly: "€2,677.90",
  };

  // Salary
  const salaryMatch = md.match(/UN salary.*?[+€]([\d,\.]+)\s*EUR/);
  const salary = salaryMatch ? `€${salaryMatch[1]}` : "€8,392";

  // VUAA start
  const vuaaMatch = md.match(/VUAA[^€\n]*€[\d,]+\/month[^(]*\(([^)]+)\)/);
  const vuaaStart = vuaaMatch ? vuaaMatch[1] : line(/VUAA starts? ([A-Z][a-z]+ \d{4})/);

  // Advance status
  const advanceStatus = md.includes("CLEARING WITH ADVANCE") || md.includes("advance")
    ? line(/advance[^.]*funds expected[^.]*\./)
    : "—";

  // Last session summary
  const summaryMatch = md.match(/## Last Session Summary\n([^\n#]+)/);
  const lastSessionSummary = summaryMatch ? summaryMatch[1].trim() : "";

  return { netWorth, revolut, sg, sepu, salary, vuaaStart, advanceStatus, lastSessionSummary };
}

// Parse net worth history table
export interface NetWorthSnapshot {
  date: string;
  sepu: string;
  sg: string;
  crypto: string;
}

export function parseNetWorth(md: string): NetWorthSnapshot[] {
  const rows = md.match(/\|\s*(\d{4}-\d{2}-\d{2})[^|]*\|([^|]*)\|([^|]*)\|([^|]*)\|/g) ?? [];
  return rows.map((row) => {
    const cols = row.split("|").map((c) => c.trim()).filter(Boolean);
    return { date: cols[0], sepu: cols[1], sg: cols[2], crypto: cols[3] };
  });
}

// Parse a project Overview.md
export interface ProjectOverview {
  name: string;
  what: string;
  goal: string;
  status: string;
  openProblems: string[];
}

export function parseProjectOverview(md: string, name: string): ProjectOverview {
  const section = (heading: string) => {
    const m = md.match(new RegExp(`## ${heading}\\s*\\n([^#]+)`));
    return m ? m[1].trim() : "";
  };
  const openProblems = (section("Open Problems") || "")
    .split("\n")
    .filter((l) => l.match(/^\d+\.|^-/))
    .map((l) => l.replace(/^\d+\.\s*\*{0,2}|^-\s*/g, "").split("—")[0].trim())
    .slice(0, 4);

  return {
    name,
    what: section("What It Is") || section("What"),
    goal: section("Goal"),
    status: section("Status"),
    openProblems,
  };
}

// Parse memory/hot.md — the hot cache (primary session state)
export interface HotCache {
  updatedDate: string;
  focus: string;
  openItems: string[];
  lastSessionDate: string;
  lastSessionBullets: string[];
  financialPulse: string;
  nextFinancialAction: string;
  inboxFlags: string[];
}

export function parseHotCache(md: string): HotCache {
  const section = (heading: string) => {
    const m = md.match(new RegExp(`## ${heading}[^\n]*\n([^#]+)`));
    return m ? m[1].trim() : "";
  };
  const bullets = (text: string) =>
    text.split("\n").filter((l) => l.match(/^[-*]|\*\*/)).map((l) => l.replace(/^[-*]\s*\*{0,2}/, "").trim()).filter(Boolean);

  const updatedMatch = md.match(/Updated:\s*(\d{4}-\d{2}-\d{2})/);
  const lastSessionMatch = md.match(/## Last Session \((\d{4}-\d{2}-\d{2})\)/);
  const pulse = section("Financial Pulse");
  const nextMatch = pulse.match(/Next[^:]*:\s*(.+)/);

  return {
    updatedDate: updatedMatch ? updatedMatch[1] : "",
    focus: section("Focus This Session"),
    openItems: bullets(section("Open / Pending")),
    lastSessionDate: lastSessionMatch ? lastSessionMatch[1] : "",
    lastSessionBullets: bullets(section(`Last Session \\(${lastSessionMatch?.[1] ?? ".*"}\\)`)),
    financialPulse: pulse.split("\n")[0] ?? "",
    nextFinancialAction: nextMatch ? nextMatch[1].trim() : "",
    inboxFlags: bullets(section("Inbox Flags")),
  };
}

// Parse the last daily log for open items + recommendation
export interface DailyLog {
  workedOn: string[];
  stillOpen: string[];
  startHere: string;
  date: string;
}

export function parseDailyLog(md: string): DailyLog {
  const section = (heading: string) =>
    (md.match(new RegExp(`## ${heading}\\s*\\n([^#]+)`)) ?? [])[1]?.trim() ?? "";
  const bullets = (text: string) =>
    text.split("\n").filter((l) => l.match(/^[-*]|\*\*/)).map((l) => l.replace(/^[-*]\s*\*{0,2}/, "").trim()).filter(Boolean);
  const dateMatch = md.match(/date:\s*(\d{4}-\d{2}-\d{2})/);
  return {
    date: dateMatch ? dateMatch[1] : "",
    workedOn: bullets(section("What We Worked On")).slice(0, 4),
    stillOpen: bullets(section("Still Open")).slice(0, 5),
    startHere: section("Start Here Tomorrow"),
  };
}
