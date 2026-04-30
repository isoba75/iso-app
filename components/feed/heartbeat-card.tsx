import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Heartbeat
            </span>
            <Badge variant="outline" className="text-[10px]">No data yet</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Heartbeat runs daily at 7am. Run it manually from Routines to generate today&apos;s pulse.
          </p>
        </CardContent>
      </Card>
    );
  }

  const timeAgo = data.generatedAt ? formatTimeAgo(new Date(data.generatedAt)) : "today";

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          {!data.isStale && (
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ background: "var(--accent-green, #7dd870)" }}
            />
          )}
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Heartbeat
          </span>
          <span className="text-xs text-muted-foreground ml-auto">{timeAgo}</span>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-relaxed">{data.pulse}</p>
        {data.fullAnalysis && (
          <details className="mt-3">
            <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition">
              Full analysis ↓
            </summary>
            <div className="mt-2 text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap border-t border-border pt-2">
              {data.fullAnalysis}
            </div>
          </details>
        )}
      </CardContent>
    </Card>
  );
}
