import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function HabitsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Habits</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Daily habit tracking with streaks and heatmaps.
        </p>
      </div>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Coming in Phase B</span>
            <Badge variant="outline" className="text-[10px]">Soon</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Track daily habits, see your streaks, and check in from mobile. Data stored in iso-life as markdown.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
