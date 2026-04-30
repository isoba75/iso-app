import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function MissionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Missions</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Autonomous Claude sub-agents that run in the cloud and report back.
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
            Create missions in plain English. Claude runs them on schedule, writes results to iso-life, and surfaces proposals here for your approval.
          </p>
          <Button disabled className="mt-4 text-xs" size="sm">+ New Mission</Button>
        </CardContent>
      </Card>
    </div>
  );
}
