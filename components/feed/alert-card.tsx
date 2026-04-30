import { Card, CardContent } from "@/components/ui/card";
import type { FeedAlert } from "@/lib/feed";

interface AlertCardProps {
  alert: FeedAlert;
}

export function AlertCard({ alert }: AlertCardProps) {
  return (
    <Card className="border-l-2 border-l-red-500">
      <CardContent className="py-3 px-4">
        <p className="text-sm">{alert.message}</p>
      </CardContent>
    </Card>
  );
}
