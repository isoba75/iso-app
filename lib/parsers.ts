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

  // VUAA start — try multiple phrasings (canonical, legacy, reverse)
  let vuaaStart = "—";
  const candidates: RegExp[] = [
    // Canonical: "~Jun 2026: VUAA starts at ~€1,027/month"
    /(~?\s*[A-Z][a-z]+\s+\d{4}):\s*VUAA starts?\s+at/,
    // Legacy: "VUAA starts Jun 2026" or "VUAA starts? Month YYYY"
    /VUAA starts?\s+([A-Z][a-z]+\s+\d{4})/,
    // Schedule line: "Jan 2027: €2,500/month" inside VUAA section
    /VUAA[\s\S]{0,200}?\b([A-Z][a-z]+\s+\d{4})\b\s*:?\s*€/,
    // Parenthetical: "VUAA ... €X/month (Jun 2026)"
    /VUAA[^€\n]*€[\d,]+\/month[^(]*\(([^)]+)\)/,
  ];
  for (const re of candidates) {
    const m = md.match(re);
    if (m && m[1]) {
      vuaaStart = m[1].trim().replace(/^~\s*/, "~");
      break;
    }
  }

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

// Strip markdown formatting from inline text
function stripMd(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")    // bold
    .replace(/\*(.+?)\*/g, "$1")        // italic
    .replace(/`(.+?)`/g, "$1")          // code
    .replace(/\[(.+?)\]\(.+?\)/g, "$1") // links
    .trim();
}

export function parseProjectOverview(md: string, name: string): ProjectOverview {
  const section = (heading: string) => {
    const m = md.match(new RegExp(`## ${heading}\\s*\\n([^#]+)`, "i"));
    return m ? stripMd(m[1].trim()) : "";
  };

  // Goal can also live as **Goal:** inline frontmatter (IsoApp style)
  let goal = section("Goal");
  if (!goal) {
    const inline = md.match(/\*\*Goal:\*\*\s*(.+)/i);
    if (inline) goal = stripMd(inline[1]);
  }

  // Status: same — may be inline **Status:**
  let status = section("Status");
  if (!status) {
    const inline = md.match(/\*\*Status:\*\*\s*(.+)/i);
    if (inline) status = stripMd(inline[1]);
  }

  // Open problems: handle numbered lists, dashes, and checkbox bullets
  const openRaw = section("Open Problems") || "";
  const openProblems = openRaw
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.match(/^(\d+\.|-|\*)\s/))
    .map((l) => {
      // Remove list marker
      let clean = l.replace(/^(\d+\.|[-*])\s+/, "");
      // Remove checkbox prefix
      clean = clean.replace(/^\[([ xX])\]\s*/, "");
      // Strip markdown
      clean = stripMd(clean);
      // Take only the headline before any em-dash explanation
      const dashSplit = clean.split(/\s+—\s+/);
      return dashSplit[0].trim();
    })
    .filter(Boolean)
    .slice(0, 4);

  return {
    name,
    what: section("What It Is") || section("What it is") || section("What"),
    goal,
    status,
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
