import Link from "next/link";
import { notFound } from "next/navigation";
import { readFile } from "@/lib/github";
import { parseProjectsIndex, STATUS_DISPLAY } from "@/lib/projects-index";
import { renderMarkdown } from "@/lib/markdown";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeftIcon, ExternalLinkIcon } from "lucide-react";

interface ProjectFile {
  filename: string;
  label: string;
  content: string | null;
}

async function loadProjectFiles(detailPath: string): Promise<{
  overview: string | null;
  next: string | null;
  ideas: string | null;
  decisions: string | null;
  basePath: string;
}> {
  // detailPath is e.g. "Projects/DigiCodal/Overview.md" — strip filename to get base
  const basePath = detailPath.replace(/\/[^/]+\.md$/, "");

  const safeRead = async (path: string): Promise<string | null> => {
    try { return await readFile(path); } catch { return null; }
  };

  const [overview, nextMd, ideas, decisions] = await Promise.all([
    safeRead(`${basePath}/Overview.md`),
    safeRead(`${basePath}/next.md`),
    safeRead(`${basePath}/ideas.md`),
    safeRead(`${basePath}/decisions.md`),
  ]);

  return { overview, next: nextMd, ideas, decisions, basePath };
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const indexMd = await readFile("memory/PROJECTS.md").catch(() => "");
  const all = parseProjectsIndex(indexMd);
  const project = all.find((p) => p.slug === slug);

  if (!project) notFound();

  const detailPath = project.detailPath ?? `Projects/${project.slug}/Overview.md`;
  const files = await loadProjectFiles(detailPath);

  const display = STATUS_DISPLAY[project.status];
  const githubUrl = `https://github.com/isoba75/iso-life/tree/main/${files.basePath}`;

  return (
    <div className="@container/main flex flex-col gap-5 py-4 md:gap-6 md:py-6 px-4 lg:px-6 max-w-3xl">
      {/* Back link */}
      <Link
        href="/projects"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground -ml-1"
      >
        <ChevronLeftIcon className="size-4" />
        Projects
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{project.name}</h1>
          {project.domain && (
            <p className="text-sm text-muted-foreground font-mono mt-1">{project.domain}</p>
          )}
        </div>
        <Badge
          variant={project.status === "active" ? "default" : "outline"}
          className="shrink-0"
        >
          {display.emoji} {display.label}
        </Badge>
      </div>

      {/* Active project: show next.md prominently */}
      {project.status === "active" && files.next && (
        <Card className="border-primary/30">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-base">🎯</span>
              <h2 className="text-base font-semibold">Next</h2>
            </div>
            <div>{renderMarkdown(files.next, { skipH1: true })}</div>
          </CardContent>
        </Card>
      )}

      {/* Overview */}
      {files.overview && (
        <Card>
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-base">📋</span>
              <h2 className="text-base font-semibold">Overview</h2>
            </div>
            <div>{renderMarkdown(files.overview, { skipH1: true })}</div>
          </CardContent>
        </Card>
      )}

      {/* Ideas */}
      {files.ideas && (
        <Card>
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-base">💡</span>
              <h2 className="text-base font-semibold">Ideas & research</h2>
            </div>
            <div>{renderMarkdown(files.ideas, { skipH1: true })}</div>
          </CardContent>
        </Card>
      )}

      {/* Decisions */}
      {files.decisions && (
        <Card>
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-base">📝</span>
              <h2 className="text-base font-semibold">Decisions</h2>
            </div>
            <div>{renderMarkdown(files.decisions, { skipH1: true })}</div>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {!files.overview && !files.next && !files.ideas && !files.decisions && (
        <Card>
          <CardContent className="pt-5 pb-5">
            <p className="text-sm text-muted-foreground">
              No project files found at <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">{files.basePath}/</code>.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Footer link to GitHub */}
      <a
        href={githubUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        View files on GitHub
        <ExternalLinkIcon className="size-3.5" />
      </a>
    </div>
  );
}
