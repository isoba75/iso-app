import { Suspense } from "react";
import Link from "next/link";
import { googleConfigured } from "@/lib/google";
import { DayColumn } from "@/components/today/day-column";
import { MorningBrief } from "@/components/today/morning-brief";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function SetupPrompt() {
  return (
    <Card>
      <CardContent className="pt-5 pb-5">
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

function BriefSkeleton() {
  return <div className="h-48 rounded-xl bg-muted animate-pulse" />;
}

function ColumnSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
      ))}
    </div>
  );
}

export default async function TodayPage() {
  const configured = googleConfigured();

  return (
    <div className="@container/main flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6 max-w-3xl">
      {/* Morning Brief — the daily entry point */}
      <Suspense fallback={<BriefSkeleton />}>
        <MorningBrief />
      </Suspense>

      {/* Schedule + tasks (real Google data) */}
      <Suspense fallback={<ColumnSkeleton />}>
        {configured ? <DayColumn /> : <SetupPrompt />}
      </Suspense>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/capture">
          <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-1">
            <span className="text-base">✦</span>
            <span className="text-sm font-medium">Capture</span>
          </Button>
        </Link>
        <Link href="/feed">
          <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-1">
            <span className="text-base">📋</span>
            <span className="text-sm font-medium">Feed</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
