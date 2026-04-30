import { readFile } from "@/lib/github";
import { parseProjectOverview } from "@/lib/parsers";
import { SiteHeader } from "@/components/site-header";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function ProjectCard({ project }: { project: ReturnType<typeof parseProjectOverview> }) {
  const isActive = project.status.toLowerCase().includes("active");
  const statusLabel = project.status.split("—")[0].trim();

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">{project.name}</CardTitle>
          <Badge variant={isActive ? "default" : "outline"} className="shrink-0 text-[10px]">
            {statusLabel}
          </Badge>
        </div>
        <CardDescription className="line-clamp-3 leading-relaxed">
          {project.what.split("\n")[0]}
        </CardDescription>
      </CardHeader>

      {project.goal && (
        <div className="px-6 pb-3">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Goal</p>
          <p className="text-sm">{project.goal.split("\n")[0]}</p>
        </div>
      )}

      {project.openProblems.length > 0 && (
        <div className="px-6 pb-4 mt-auto">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Open</p>
          <ul className="space-y-1">
            {project.openProblems.slice(0, 3).map((p, i) => (
              <li key={i} className="text-xs text-muted-foreground flex gap-2">
                <span className="shrink-0">·</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}

export default async function ProjectsPage() {
  const [digibuntuRaw, petcalcRaw, isoappRaw] = await Promise.all([
    readFile("Projects/DigiBuntu/Overview.md").catch(() => ""),
    readFile("Projects/PetCalculate/Overview.md").catch(() => ""),
    readFile("Projects/IsoApp/Overview.md").catch(() => ""),
  ]);

  const projects = [
    parseProjectOverview(digibuntuRaw,   "DigiBuntu"),
    parseProjectOverview(petcalcRaw,     "PetCalculate"),
    parseProjectOverview(isoappRaw,      "IsoApp"),
  ];

  return (
    <div className="flex flex-col">
      <div className="hidden md:block">
        <SiteHeader title="Projects" />
      </div>

      <div className="@container/main flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
        <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-3">
          {projects.map((p) => (
            <ProjectCard key={p.name} project={p} />
          ))}
        </div>
      </div>
    </div>
  );
}
