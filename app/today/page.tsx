import { Suspense } from "react";
import { googleConfigured } from "@/lib/google";
import { DayColumn } from "@/components/today/day-column";
import { FeedColumn } from "@/components/today/feed-column";
import { ActionsColumn } from "@/components/today/actions-column";
import { IsoStatCards } from "@/components/today/stat-cards";
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent } from "@/components/ui/card";

function SetupPrompt() {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-sm font-semibold mb-2">Google not connected</p>
        <p className="text-sm text-muted-foreground mb-3">
          Run the one-time auth script in Terminal:
        </p>
        <code className="block text-xs px-3 py-2 rounded-lg font-mono bg-muted text-foreground">
          node ~/Documents/iso-app/scripts/google-auth.mjs
        </code>
        <p className="text-xs mt-2 text-muted-foreground">
          Then add Google env vars to Vercel and redeploy.
        </p>
      </CardContent>
    </Card>
  );
}

function ColumnSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />
      ))}
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />
      ))}
    </div>
  );
}

export default async function TodayPage() {
  const configured = googleConfigured();

  return (
    <div className="flex flex-col">
      {/* Header — desktop only */}
      <div className="hidden md:block">
        <SiteHeader title="Today" />
      </div>

      <div className="@container/main flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        {/* Stat cards row */}
        <Suspense fallback={<CardSkeleton />}>
          <IsoStatCards />
        </Suspense>

        {/* Desktop: 3-column grid */}
        <div className="hidden md:grid grid-cols-[272px_1fr_220px] gap-6 px-4 lg:px-6">
          <div className="flex flex-col gap-4">
            <Suspense fallback={<ColumnSkeleton />}>
              {configured ? <DayColumn /> : <SetupPrompt />}
            </Suspense>
          </div>
          <div className="flex flex-col gap-4">
            <Suspense fallback={<ColumnSkeleton />}>
              <FeedColumn />
            </Suspense>
          </div>
          <div className="flex flex-col gap-4">
            <ActionsColumn />
          </div>
        </div>

        {/* Mobile: single column scroll */}
        <div className="flex md:hidden flex-col gap-4">
          <Suspense fallback={<ColumnSkeleton />}>
            {configured ? <DayColumn /> : <SetupPrompt />}
          </Suspense>
          <Suspense fallback={<ColumnSkeleton />}>
            <FeedColumn />
          </Suspense>
          <ActionsColumn />
        </div>
      </div>
    </div>
  );
}
