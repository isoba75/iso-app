import { readFile } from "@/lib/github";
import { parseProjectOverview } from "@/lib/parsers";
import { Card, CardTitle } from "@/components/ui/card";

interface ProjectCardProps {
  project: ReturnType<typeof parseProjectOverview>;
  accent: string;
}

function ProjectCard({ project, accent }: ProjectCardProps) {
  const statusColor = project.status.toLowerCase().includes("active")
    ? "text-[#7dd870]"
    : "text-[#888]";
  return (
    <Card>
      <div className="flex items-start justify-between mb-3">
        <h2 className="font-bold text-base">{project.name}</h2>
        <span className={`text-xs font-semibold ${statusColor}`}>
          {project.status.split("—")[0].trim()}
        </span>
      </div>
      <p className="text-sm text-[#888] mb-4 leading-relaxed">
        {project.what.split("\n")[0]}
      </p>
      {project.goal && (
        <div className="mb-4">
          <p className="text-xs text-[#555] uppercase tracking-wider mb-1">Goal</p>
          <p className="text-sm text-[#e8e8e8]">{project.goal.split("\n")[0]}</p>
        </div>
      )}
      {project.openProblems.length > 0 && (
        <div>
          <p className="text-xs text-[#555] uppercase tracking-wider mb-2">Open problems</p>
          <ul className="space-y-1.5">
            {project.openProblems.map((p, i) => (
              <li key={i} className="text-xs text-[#aaa] flex gap-2">
                <span style={{ color: accent }}>→</span>
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
    { data: parseProjectOverview(digibuntuRaw, "DigiBuntu"),   accent: "#e87d7d" },
    { data: parseProjectOverview(petcalcRaw,   "PetCalculate"), accent: "#7db8e8" },
    { data: parseProjectOverview(isoappRaw,    "IsoApp"),       accent: "#7dd870" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Projects</h1>
      <div className="grid md:grid-cols-3 gap-4">
        {projects.map(({ data, accent }) => (
          <ProjectCard key={data.name} project={data} accent={accent} />
        ))}
      </div>
    </div>
  );
}
