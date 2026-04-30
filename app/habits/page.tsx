import { SiteHeader } from "@/components/site-header";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ActivityIcon } from "lucide-react";

export default function HabitsPage() {
  return (
    <div className="flex flex-col">
      <div className="hidden md:block">
        <SiteHeader title="Habits" />
      </div>
      <div className="@container/main flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-semibold">Habits</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Daily habit tracking with streaks and heatmaps.
            </p>
          </div>
          <Button size="sm" disabled>+ New Habit</Button>
        </div>

        <Card className="border-dashed">
          <CardHeader className="flex flex-col items-center text-center py-12">
            <div className="rounded-full bg-muted p-3 mb-3">
              <ActivityIcon className="size-5 text-muted-foreground" />
            </div>
            <CardTitle className="text-base font-medium">No habits configured</CardTitle>
            <CardDescription className="max-w-sm mt-1">
              Define your daily habits, check in each day, and track streaks over time. Data stored as markdown in iso-life.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
