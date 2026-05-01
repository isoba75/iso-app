import { readFile } from "@/lib/github";
import { CaptureClient } from "./capture-client";

interface CapturePreviewItem {
  time: string;
  tag: string;
  text: string;
}

// Parse Inbox/captures/YYYY-MM-DD.md format:
// ## HH:MM UTC [Tag]
// content...
function parseTodayCaptures(md: string): CapturePreviewItem[] {
  const items: CapturePreviewItem[] = [];
  const lines = md.split("\n");
  let current: { time: string; tag: string; lines: string[] } | null = null;

  for (const line of lines) {
    const headerMatch = line.match(/^##\s+(\d{2}:\d{2})\s+UTC\s*\[([^\]]+)\]\s*$/);
    if (headerMatch) {
      if (current) {
        items.push({
          time: current.time,
          tag: current.tag,
          text: current.lines.join("\n").trim(),
        });
      }
      current = { time: headerMatch[1], tag: headerMatch[2], lines: [] };
      continue;
    }
    if (current && !line.startsWith("# ") && !line.startsWith("[Triaged:")) {
      current.lines.push(line);
    }
  }
  if (current) {
    items.push({
      time: current.time,
      tag: current.tag,
      text: current.lines.join("\n").trim(),
    });
  }
  // Reverse: newest first.
  return items.reverse().filter((i) => i.text.length > 0);
}

export default async function CapturePage() {
  const date = new Date().toISOString().slice(0, 10);
  // Try the new path first (Inbox/captures/), fall back to old root path.
  // Old path support kept temporarily for backwards compat with captures
  // written before the path fix landed.
  let raw = "";
  try {
    raw = await readFile(`Inbox/captures/${date}.md`);
  } catch {
    try {
      raw = await readFile(`Inbox/${date}.md`);
    } catch {
      // No file today — empty preview.
    }
  }
  const todayCaptures = parseTodayCaptures(raw).slice(0, 10);

  return (
    <div className="@container/main flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold">Capture</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Brain dump → <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">iso-life/Inbox/captures/</code>
        </p>
      </div>
      <CaptureClient todayCaptures={todayCaptures} />
    </div>
  );
}
