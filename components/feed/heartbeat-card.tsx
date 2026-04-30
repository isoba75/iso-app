import { Badge } from "@/components/ui/badge";
import type { HeartbeatData } from "@/lib/feed";

interface HeartbeatCardProps {
  data: HeartbeatData | null;
}

function formatTimeAgo(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffH = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffH < 1) return "just now";
  if (diffH === 1) return "1h ago";
  if (diffH < 24) return `${diffH}h ago`;
  return "yesterday";
}

export function HeartbeatCard({ data }: HeartbeatCardProps) {
  if (!data) {
    return (
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-medium text-muted-foreground">Heartbeat</span>
          <Badge variant="outline" className="text-[10px] h-4 px-1.5 ml-auto">No data</Badge>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Runs daily at 7am — generates your daily pulse from iso-life context. Set up cloud routines to activate.
        </p>
      </div>
    );
  }

  const timeAgo = data.generatedAt ? formatTimeAgo(new Date(data.generatedAt)) : "today";

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-2 mb-3">
        {!data.isStale && (
          <span
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{ background: "var(--accent-green)" }}
          />
        )}
        <span className="text-xs font-medium text-muted-foreground">Heartbeat</span>
        <span className="text-xs text-muted-foreground ml-auto">{timeAgo}</span>
      </div>
      <p className="text-sm text-foreground leading-relaxed">{data.pulse}</p>
      {data.fullAnalysis && (
        <details className="mt-3">
          <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition select-none">
            Full analysis →
          </summary>
          <div className="mt-2 pt-2 border-t border-border text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {data.fullAnalysis}
          </div>
        </details>
      )}
    </div>
  );
}
