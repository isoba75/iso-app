import { readFile, listFiles } from "@/lib/github";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface Proposal {
  id: string;
  routine: string;
  classification: string;
  confidence: number;
  status: string;
  generated_at: string;
  title: string;
  body: string;
  filename: string;
}

function parseProposal(filename: string, raw: string): Proposal | null {
  const fmMatch = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!fmMatch) return null;
  const [, frontmatter, body] = fmMatch;

  const get = (key: string) => frontmatter.match(new RegExp(`^${key}:\\s*(.+)$`, "m"))?.[1]?.trim() ?? "";

  const titleMatch = body.match(/^#\s+(.+)$/m);

  return {
    id: get("id"),
    routine: get("routine"),
    classification: get("classification"),
    confidence: parseFloat(get("confidence")) || 0,
    status: get("status"),
    generated_at: get("generated_at"),
    title: titleMatch?.[1]?.trim() ?? filename,
    body: body.trim(),
    filename,
  };
}

function classificationBadge(c: string): { label: string; variant: "default" | "outline" | "destructive" | "secondary" } {
  if (c.startsWith("active-project")) return { label: "Active Project", variant: "default" };
  if (c.startsWith("dormant-")) return { label: "Dormant", variant: "secondary" };
  if (c.startsWith("killed-")) return { label: "Killed Variant", variant: "outline" };
  if (c === "new-idea") return { label: "New Idea", variant: "secondary" };
  if (c === "personal-task") return { label: "Personal Task", variant: "default" };
  if (c === "finance-pending") return { label: "Finance", variant: "secondary" };
  if (c === "substrate-feedback") return { label: "Substrate", variant: "outline" };
  if (c === "reference") return { label: "Reference", variant: "outline" };
  if (c === "ambiguous") return { label: "Needs Review", variant: "destructive" };
  return { label: c, variant: "outline" };
}

function renderBody(md: string): React.ReactNode {
  // Skip the H1 title (already rendered above)
  const lines = md.split("\n");
  const blocks: React.ReactNode[] = [];
  let i = 0;
  let titleSeen = false;

  while (i < lines.length) {
    const line = lines[i].trim();
    if (!line) { i++; continue; }

    if (line.startsWith("# ") && !titleSeen) {
      titleSeen = true;
      i++;
      continue;
    }
    if (line.startsWith("## ")) {
      blocks.push(
        <h4 key={`h-${i}`} className="text-sm font-semibold mt-3 mb-1.5">{line.slice(3)}</h4>
      );
      i++;
      continue;
    }
    if (line.startsWith("> ")) {
      // Quoted capture text
      const quoted: string[] = [line.slice(2)];
      i++;
      while (i < lines.length && lines[i].trim().startsWith("> ")) {
        quoted.push(lines[i].trim().slice(2));
        i++;
      }
      blocks.push(
        <blockquote key={`q-${i}`} className="text-sm italic border-l-2 border-muted pl-3 text-muted-foreground my-2">
          {quoted.join(" ")}
        </blockquote>
      );
      continue;
    }
    if (line.startsWith("- ")) {
      const items: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("- ")) {
        items.push(lines[i].trim().slice(2));
        i++;
      }
      blocks.push(
        <ul key={`u-${i}`} className="list-disc ml-5 space-y-1 text-sm">
          {items.map((it, j) => <li key={j}>{it}</li>)}
        </ul>
      );
      continue;
    }
    blocks.push(
      <p key={`p-${i}`} className="text-sm leading-relaxed mb-2">{line}</p>
    );
    i++;
  }
  return blocks;
}

async function loadProposals(): Promise<Proposal[]> {
  try {
    const files = await listFiles("Feed/proposals");
    const mdFiles = files.filter((f) => f.endsWith(".md") && f !== ".gitkeep");
    if (mdFiles.length === 0) return [];

    const proposals = await Promise.all(
      mdFiles.map(async (f) => {
        try {
          const raw = await readFile(`Feed/proposals/${f}`);
          return parseProposal(f, raw);
        } catch {
          return null;
        }
      })
    );

    return (proposals.filter(Boolean) as Proposal[])
      .sort((a, b) => b.generated_at.localeCompare(a.generated_at));
  } catch {
    return [];
  }
}

async function loadActiveIdeas(): Promise<{ project: string; content: string } | null> {
  // Read active project from PROJECTS.md, then load its ideas.md
  try {
    const projects = await readFile("memory/PROJECTS.md");
    // Find active project — line in form "| **<Name>** | <domain> | **ACTIVE..."
    const activeMatch = projects.match(/\|\s*\*\*([A-Z][A-Za-z]+)\*\*\s*\|[^|]*\|\s*\*\*ACTIVE/);
    if (!activeMatch) return null;
    const project = activeMatch[1];
    const ideas = await readFile(`Projects/${project}/ideas.md`);
    return { project, content: ideas };
  } catch {
    return null;
  }
}

export default async function FeedPage() {
  const [proposals, activeIdeas] = await Promise.all([
    loadProposals(),
    loadActiveIdeas(),
  ]);

  return (
    <div className="@container/main flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold">Feed</h1>
        <p className="text-sm text-muted-foreground mt-1">
          What the agent surfaced for you. Auto-filed ideas land in <Link href="https://github.com/isoba75/iso-life/tree/main/Projects" className="underline" target="_blank">project folders</Link>; uncertain items land here as proposals.
        </p>
      </div>

      {/* Pending proposals */}
      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold flex items-center gap-2">
          📋 Pending proposals
          <Badge variant="outline">{proposals.length}</Badge>
        </h2>

        {proposals.length === 0 ? (
          <Card>
            <CardContent className="pt-5 pb-5">
              <p className="text-sm text-muted-foreground">
                No pending proposals. The Capture Triage routine auto-files most things directly.
              </p>
            </CardContent>
          </Card>
        ) : (
          proposals.map((p) => {
            const cls = classificationBadge(p.classification);
            return (
              <Card key={p.id || p.filename}>
                <CardContent className="pt-5 pb-5">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-base font-semibold leading-snug">{p.title}</h3>
                    <Badge variant={cls.variant} className="shrink-0 text-xs">
                      {cls.label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                    <span>{p.routine}</span>
                    <span>·</span>
                    <span>{Math.round(p.confidence * 100)}% confidence</span>
                    <span>·</span>
                    <span>{new Date(p.generated_at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}</span>
                  </div>
                  <div>{renderBody(p.body)}</div>
                </CardContent>
              </Card>
            );
          })
        )}
      </section>

      {/* Active project ideas */}
      {activeIdeas && (
        <section className="flex flex-col gap-3">
          <h2 className="text-base font-semibold flex items-center gap-2">
            ⭐ {activeIdeas.project} — auto-filed ideas
          </h2>
          <Card>
            <CardContent className="pt-5 pb-5">
              <div>{renderBody(activeIdeas.content)}</div>
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}
