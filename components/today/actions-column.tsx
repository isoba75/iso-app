import { Button } from "@/components/ui/button";
import { Pomodoro } from "@/components/pomodoro";
import Link from "next/link";

export function ActionsColumn() {
  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-lg border border-border bg-card p-4">
        <p className="text-xs font-medium text-muted-foreground mb-3">Capture</p>
        <Link href="/capture">
          <Button variant="outline" size="sm" className="w-full text-sm font-normal">
            New capture
          </Button>
        </Link>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <Pomodoro />
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <p className="text-xs font-medium text-muted-foreground mb-3">Missions</p>
        <Link href="/missions">
          <Button variant="outline" size="sm" className="w-full text-sm font-normal">
            View missions
          </Button>
        </Link>
      </div>
    </div>
  );
}
