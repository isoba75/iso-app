import { getHeartbeat, getFeedAlerts } from "@/lib/feed";
import { HeartbeatCard } from "@/components/feed/heartbeat-card";
import { AlertCard } from "@/components/feed/alert-card";

export async function FeedColumn() {
  const [heartbeat, alerts] = await Promise.all([
    getHeartbeat(),
    getFeedAlerts(),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Feed
      </p>
      <HeartbeatCard data={heartbeat} />
      {alerts.map((alert) => (
        <AlertCard key={alert.id} alert={alert} />
      ))}
      {alerts.length === 0 && !heartbeat && (
        <p className="text-xs text-muted-foreground">
          No alerts. Routines will surface updates here.
        </p>
      )}
    </div>
  );
}
