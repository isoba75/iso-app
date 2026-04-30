// TEMP: visual preview only — delete after screenshot
import { DayColumn } from "@/components/today/day-column";
import { FeedColumn } from "@/components/today/feed-column";
import { ActionsColumn } from "@/components/today/actions-column";
import { Suspense } from "react";

function Skeleton() {
  return <div className="flex flex-col gap-4">{[1,2,3].map(i => <div key={i} className="h-24 rounded-lg bg-muted animate-pulse" />)}</div>;
}

export default function PreviewPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Fake sidebar + header */}
      <div className="flex h-screen">
        <div className="w-[200px] border-r border-border bg-card flex flex-col shrink-0">
          <div className="h-12 border-b border-border px-4 flex items-center">
            <span className="text-sm font-semibold">iso<span className="text-green-600">·</span>life</span>
          </div>
          <nav className="p-2 flex flex-col gap-0.5 pt-2 text-sm">
            {["Today","Finance","Projects","Capture","Missions","Habits"].map(l => (
              <div key={l} className={`px-3 py-1.5 rounded-md cursor-pointer ${l === "Today" ? "bg-muted font-medium" : "text-muted-foreground"}`}>{l}</div>
            ))}
          </nav>
        </div>
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="h-12 border-b border-border px-4 flex items-center gap-3 bg-background shrink-0">
            <div className="w-4 h-4 bg-muted rounded" />
            <div className="h-4 w-px bg-border" />
          </header>
          <div className="flex-1 overflow-auto p-6">
            <div className="grid grid-cols-[272px_1fr_220px] gap-6">
              <Suspense fallback={<Skeleton />}>
                <DayColumn />
              </Suspense>
              <Suspense fallback={<Skeleton />}>
                <FeedColumn />
              </Suspense>
              <ActionsColumn />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
