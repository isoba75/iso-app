import { SiteHeader } from "@/components/site-header";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TargetIcon } from "lucide-react";

export default function MissionsPage() {
  return (
    <div className="flex flex-col">
      <div className="hidden md:block">
        <SiteHeader title="Missions" />
      </div>
      <div className="@container/main flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-semibold">Missions</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Autonomous Claude sub-agents that run in the cloud and report back.
            </p>
          </div>
          <Button size="sm" disabled>+ New Mission</Button>
        </div>

        <Card className="border-dashed">
          <CardHeader className="flex flex-col items-center text-center py-12">
            <div className="rounded-full bg-muted p-3 mb-3">
              <TargetIcon className="size-5 text-muted-foreground" />
            </div>
            <CardTitle className="text-base font-medium">No missions yet</CardTitle>
            <CardDescription className="max-w-sm mt-1">
              Create a mission in plain English — Claude runs it on schedule, writes results to iso-life, and surfaces proposals here for approval.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
