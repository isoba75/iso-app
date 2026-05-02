// Parses memory/PROJECTS.md (the canonical index) into structured project records.
// PROJECTS.md is the source of truth for status (Active / Dormant / Killed / Not-a-Project / Corporate Vehicle).

export type ProjectStatus = "active" | "dormant" | "killed" | "not-a-project" | "corporate-vehicle" | "substrate";

export interface ProjectIndexEntry {
  name: string;
  slug: string; // URL-safe; matches folder name in Projects/
  status: ProjectStatus;
  domain?: string;
  summary: string; // short text from the row
  detailPath?: string; // e.g. "Projects/DigiCodal/Overview.md"
  archived?: boolean; // true if killed (folder is in Projects/_archived/)
}

function slugify(name: string): string {
  // Match the actual folder names — most are PascalCase or simple words.
  // Special cases:
  if (name === "CryptoSignal + TradeBuntu") return "CryptoTrading";
  return name.replace(/\s+/g, "");
}

function stripMd(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .trim();
}

// Each section in PROJECTS.md has a heading + a markdown table.
// We parse table rows under specific headings.
function extractSection(md: string, headingPattern: RegExp): string {
  const lines = md.split("\n");
  const out: string[] = [];
  let inSection = false;
  for (const line of lines) {
    if (line.startsWith("## ")) {
      if (inSection) break; // next section ends current
      if (headingPattern.test(line)) {
        inSection = true;
        continue;
      }
    }
    if (inSection) out.push(line);
  }
  return out.join("\n");
}

function parseTableRows(sectionText: string): string[][] {
  // Returns an array of rows, each row being array of cell strings.
  // Skips the header row and separator row.
  const rows: string[][] = [];
  const lines = sectionText.split("\n").map((l) => l.trim());
  let pastSeparator = false;
  for (const line of lines) {
    if (!line.startsWith("|")) continue;
    if (/^\|\s*-+/.test(line)) {
      pastSeparator = true;
      continue;
    }
    if (!pastSeparator) continue; // skip header
    const cells = line
      .split("|")
      .slice(1, -1)
      .map((c) => c.trim());
    if (cells.length > 0) rows.push(cells);
  }
  return rows;
}

export function parseProjectsIndex(md: string): ProjectIndexEntry[] {
  const projects: ProjectIndexEntry[] = [];

  // Active section
  const activeRows = parseTableRows(extractSection(md, /Active Project/i));
  for (const row of activeRows) {
    const [name, domain, status, detail] = row;
    const cleanName = stripMd(name);
    projects.push({
      name: cleanName,
      slug: slugify(cleanName),
      status: "active",
      domain: domain ? stripMd(domain) : undefined,
      summary: stripMd(status).slice(0, 240),
      detailPath: detail.match(/`Projects\/[^`]+`/)?.[0]?.replace(/`/g, ""),
    });
  }

  // Dormant section
  const dormantRows = parseTableRows(extractSection(md, /Dormant Projects/i));
  for (const row of dormantRows) {
    const [name, domain, revivalCriteria, detail] = row;
    const cleanName = stripMd(name);
    projects.push({
      name: cleanName,
      slug: slugify(cleanName),
      status: "dormant",
      domain: domain ? stripMd(domain) : undefined,
      summary: `Revival: ${stripMd(revivalCriteria)}`.slice(0, 240),
      detailPath: detail.match(/`Projects\/[^`]+`/)?.[0]?.replace(/`/g, ""),
    });
  }

  // Killed section — different table shape (no domain column)
  const killedRows = parseTableRows(extractSection(md, /Killed Projects/i));
  for (const row of killedRows) {
    const [name, reason] = row;
    const cleanName = stripMd(name);
    projects.push({
      name: cleanName,
      slug: slugify(cleanName),
      status: "killed",
      summary: stripMd(reason),
      archived: true,
      detailPath: `Projects/_archived/${slugify(cleanName)}/Overview.md`,
    });
  }

  // Not-a-Project section
  const notRows = parseTableRows(extractSection(md, /Not-A-Project/i));
  for (const row of notRows) {
    const [name, reason, detail] = row;
    const cleanName = stripMd(name);
    projects.push({
      name: cleanName,
      slug: slugify(cleanName),
      status: "not-a-project",
      summary: stripMd(reason),
      detailPath: detail.match(/`Projects\/[^`]+`/)?.[0]?.replace(/`/g, ""),
    });
  }

  // Corporate Vehicle section
  const cvRows = parseTableRows(extractSection(md, /Corporate Vehicle/i));
  for (const row of cvRows) {
    const [name, notes] = row;
    const cleanName = stripMd(name);
    projects.push({
      name: cleanName,
      slug: slugify(cleanName),
      status: "corporate-vehicle",
      summary: stripMd(notes).slice(0, 240),
      detailPath: notes.match(/`Projects\/[^`]+`/)?.[0]?.replace(/`/g, ""),
    });
  }

  return projects;
}

export const STATUS_DISPLAY: Record<ProjectStatus, { label: string; emoji: string }> = {
  "active": { label: "Active", emoji: "⭐" },
  "dormant": { label: "Dormant", emoji: "💤" },
  "killed": { label: "Killed", emoji: "🪦" },
  "not-a-project": { label: "Not a project", emoji: "📌" },
  "corporate-vehicle": { label: "Corporate vehicle", emoji: "🏢" },
  "substrate": { label: "Substrate", emoji: "🧱" },
};
