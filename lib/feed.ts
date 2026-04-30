import { readFile } from "@/lib/github";

export interface HeartbeatData {
  pulse: string;
  fullAnalysis: string;
  generatedAt: string;
  isStale: boolean;
}

export interface FeedAlert {
  id: string;
  message: string;
  type: "finance" | "project" | "task";
}

export async function getHeartbeat(): Promise<HeartbeatData | null> {
  const today = new Date().toISOString().split("T")[0];
  const path = `routines/heartbeat/${today}.md`;

  try {
    const raw = await readFile(path);
    if (!raw) return null;

    const fmMatch = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!fmMatch) return null;

    const frontmatter = fmMatch[1];
    const body = fmMatch[2].trim();

    const generatedAt = frontmatter.match(/generated_at:\s*(.+)/)?.[1]?.trim() ?? "";
    const isStale = generatedAt
      ? Date.now() - new Date(generatedAt).getTime() > 4 * 60 * 60 * 1000
      : true;

    const [pulse, ...rest] = body.split("\n\n");
    const fullAnalysis = rest.join("\n\n");

    return { pulse, fullAnalysis, generatedAt, isStale };
  } catch {
    return null;
  }
}

export async function getFeedAlerts(): Promise<FeedAlert[]> {
  return [];
}
