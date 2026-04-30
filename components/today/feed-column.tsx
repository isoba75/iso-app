import { getHeartbeat, getFeedAlerts } from "@/lib/feed";
import { HeartbeatCard } from "@/components/feed/heartbeat-card";
import { AlertCard } from "@/components/feed/alert-card";

export async function FeedColumn() {
  const [heartbeat, alerts] = await Promise.all([
    getHeartbeat(),
    getFeedAlerts(),
  ]);

  return (
    <div className="flex flex-col gap-3">
      <HeartbeatCard data={heartbeat} />
      {alerts.map((alert) => (
        <AlertCard key={alert.id} alert={alert} />
      ))}
    </div>
  );
}
