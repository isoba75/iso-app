import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pomodoro } from "@/components/pomodoro";
import Link from "next/link";

export function ActionsColumn() {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Actions
      </p>
      <Card>
        <CardHeader className="pb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Capture
          </span>
        </CardHeader>
        <CardContent className="pt-0">
          <Link href="/capture">
            <Button variant="outline" size="sm" className="w-full text-xs">
              ✦ New capture →
            </Button>
          </Link>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-4">
          <Pomodoro />
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Missions
          </span>
        </CardHeader>
        <CardContent className="pt-0">
          <Link href="/missions">
            <Button variant="outline" size="sm" className="w-full text-xs">
              ⟶ View missions →
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
