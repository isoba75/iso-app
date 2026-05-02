import Link from "next/link";
import { readFile } from "@/lib/github";
import { parseProjectsIndex, STATUS_DISPLAY, type ProjectStatus } from "@/lib/projects-index";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function ProjectCard({ name, slug, summary, domain, status }: {
  name: string;
  slug: string;
  summary: string;
  domain?: string;
  status: ProjectStatus;
}) {
  const display = STATUS_DISPLAY[status];
  const isActive = status === "active";
  return (
    <Link href={`/projects/${slug}`} className="block">
      <Card className={`transition hover:bg-muted/30 ${isActive ? "border-primary/40" : ""}`}>
        <CardContent className="pt-5 pb-5">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="text-base font-semibold leading-tight">{name}</h3>
            <Badge variant={isActive ? "default" : "outline"} className="shrink-0 text-xs">
              {display.emoji} {display.label}
            </Badge>
          </div>
          {domain && (
            <p className="text-xs text-muted-foreground font-mono mb-2">{domain}</p>
          )}
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
            {summary}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

function Section({ title, count, children }: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  if (count === 0) return null;
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-base font-semibold flex items-center gap-2">
        {title}
        <Badge variant="outline">{count}</Badge>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {children}
      </div>
    </section>
  );
}

export default async function ProjectsPage() {
  const md = await readFile("memory/PROJECTS.md").catch(() => "");
  const all = parseProjectsIndex(md);

  const active = all.filter((p) => p.status === "active");
  const dormant = all.filter((p) => p.status === "dormant");
  const corporate = all.filter((p) => p.status === "corporate-vehicle");
  const notProject = all.filter((p) => p.status === "not-a-project");
  const killed = all.filter((p) => p.status === "killed");

  return (
    <div className="@container/main flex flex-col gap-6 py-4 md:gap-8 md:py-6 px-4 lg:px-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-semibold">Projects</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Source: <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">memory/PROJECTS.md</code>.
          Lifecycle rules in <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">memory/focus.md</code>.
        </p>
      </div>

      <Section title="⭐ Active" count={active.length}>
        {active.map((p) => <ProjectCard key={p.slug} {...p} />)}
      </Section>

      <Section title="💤 Dormant" count={dormant.length}>
        {dormant.map((p) => <ProjectCard key={p.slug} {...p} />)}
      </Section>

      <Section title="🏢 Corporate vehicle" count={corporate.length}>
        {corporate.map((p) => <ProjectCard key={p.slug} {...p} />)}
      </Section>

      <Section title="📌 Not a project" count={notProject.length}>
        {notProject.map((p) => <ProjectCard key={p.slug} {...p} />)}
      </Section>

      <Section title="🪦 Killed" count={killed.length}>
        {killed.map((p) => <ProjectCard key={p.slug} {...p} />)}
      </Section>

      {all.length === 0 && (
        <Card>
          <CardContent className="pt-5 pb-5">
            <p className="text-sm text-muted-foreground">
              Could not load <code className="font-mono">memory/PROJECTS.md</code>. Check GitHub access.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
