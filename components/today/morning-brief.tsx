import { readFile } from "@/lib/github";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Renders today's Morning Brief from iso-life.
 * File path: Feed/morning-brief/YYYY-MM-DD.md (UTC date — same as routine)
 *
 * Falls back gracefully if no brief exists (early morning before 06:30 routine,
 * weekends Fri/Sat when routine doesn't run, or any failure to read).
 */

interface BriefData {
  bodyMarkdown: string;
  generatedAt?: string;
  weekday?: string;
}

function parseFrontmatter(raw: string): BriefData {
  // Extract YAML frontmatter and body
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { bodyMarkdown: raw };
  const [, frontmatter, body] = match;
  const generatedAt = frontmatter.match(/generated_at:\s*(.+)/)?.[1]?.trim();
  const weekday = frontmatter.match(/weekday:\s*(.+)/)?.[1]?.trim();
  return { bodyMarkdown: body.trim(), generatedAt, weekday };
}

/**
 * Minimal markdown renderer — handles only the format Morning Brief produces:
 * # H1 (skipped, redundant with card title), ## H2 sections, bullet lists,
 * line breaks, optional emphasis. We avoid pulling in a heavy markdown lib.
 */
function renderMarkdown(md: string): React.ReactNode {
  const lines = md.split("\n");
  const blocks: React.ReactNode[] = [];
  let currentList: string[] | null = null;

  const flushList = () => {
    if (currentList && currentList.length > 0) {
      blocks.push(
        <ul key={`ul-${blocks.length}`} className="space-y-1.5 ml-4 list-disc text-sm marker:text-muted-foreground">
          {currentList.map((item, i) => (
            <li key={i} className="leading-relaxed">{item}</li>
          ))}
        </ul>
      );
    }
    currentList = null;
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      continue;
    }
    if (trimmed.startsWith("# ")) {
      // Skip H1 — card has its own title
      continue;
    }
    if (trimmed.startsWith("## ")) {
      flushList();
      const title = trimmed.slice(3);
      blocks.push(
        <h3 key={`h-${blocks.length}`} className="text-sm font-semibold mt-3 mb-1.5">
          {title}
        </h3>
      );
      continue;
    }
    if (trimmed.startsWith("- ")) {
      if (!currentList) currentList = [];
      currentList.push(trimmed.slice(2));
      continue;
    }
    flushList();
    // Plain paragraph
    blocks.push(
      <p key={`p-${blocks.length}`} className="text-sm leading-relaxed mb-2">
        {trimmed}
      </p>
    );
  }
  flushList();
  return blocks;
}

function todayDateUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

function previousDateUTC(daysBack: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - daysBack);
  return d.toISOString().slice(0, 10);
}

export async function MorningBrief() {
  // Try today first, fall back up to 2 days back (handles weekend gaps,
  // routine failure, or user reading before today's brief is generated).
  let raw = "";
  let actualDate = "";

  for (let daysBack = 0; daysBack <= 2; daysBack++) {
    const date = daysBack === 0 ? todayDateUTC() : previousDateUTC(daysBack);
    try {
      raw = await readFile(`Feed/morning-brief/${date}.md`);
      actualDate = date;
      break;
    } catch {
      // continue
    }
  }

  if (!raw) {
    // No brief found — show empty state
    return (
      <Card>
        <CardContent className="pt-5 pb-5">
          <p className="text-sm font-semibold mb-1">Brief — pending</p>
          <p className="text-xs text-muted-foreground">
            Morning Brief routine runs at 06:30 Baghdad on weekdays. Today&apos;s brief will appear here once generated.
          </p>
        </CardContent>
      </Card>
    );
  }

  const data = parseFrontmatter(raw);
  const isStale = actualDate !== todayDateUTC();

  return (
    <Card className="border-primary/20">
      <CardContent className="pt-5 pb-5">
        <div className="flex items-baseline justify-between mb-2 gap-2">
          <h2 className="text-base font-semibold">
            ☀️ Brief{data.weekday ? ` — ${data.weekday}` : ""}
          </h2>
          {isStale && (
            <span className="text-xs text-muted-foreground">
              from {actualDate}
            </span>
          )}
        </div>
        <div className="text-foreground">{renderMarkdown(data.bodyMarkdown)}</div>
      </CardContent>
    </Card>
  );
}
