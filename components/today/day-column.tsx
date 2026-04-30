import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  getCalendarEvents,
  getTasks,
  CalendarEvent,
  GTask,
} from "@/lib/google";

const MY_TASKS_ID = "MDUwNTMxNTE1ODg2MjgxMDc1Nzc6MDow";
const CLAUDE_ID = "cmVQNFNHUTdCSXJfX3QzbQ";

function formatTime(dateTime?: string): string {
  if (dateTime) {
    return new Date(dateTime).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Europe/Paris",
    });
  }
  return "All day";
}

function isOverdue(due?: string): boolean {
  if (!due) return false;
  return new Date(due) < new Date(new Date().toDateString());
}

function todayLabel(): string {
  return new Date().toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long",
  });
}

function dayGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function EventRow({ event }: { event: CalendarEvent }) {
  return (
    <a
      href={event.htmlLink}
      target="_blank"
      rel="noopener noreferrer"
      className="flex gap-3 py-2 hover:opacity-80 transition border-b border-border last:border-0"
    >
      <span className="text-xs w-14 shrink-0 pt-0.5 text-muted-foreground font-mono">
        {formatTime(event.start.dateTime)}
      </span>
      <span className="text-sm">{event.summary}</span>
    </a>
  );
}

function TaskRow({ task }: { task: GTask }) {
  const overdue = isOverdue(task.due);
  return (
    <div className="flex gap-2 py-2 border-b border-border last:border-0">
      <span className="mt-0.5 shrink-0 text-muted-foreground">□</span>
      <div className="min-w-0">
        <p className="text-sm leading-snug">{task.title}</p>
        {task.due && (
          <p className={`text-xs mt-0.5 ${overdue ? "text-red-400" : "text-muted-foreground"}`}>
            {overdue ? "⚠ " : ""}
            {new Date(task.due).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
          </p>
        )}
      </div>
    </div>
  );
}

export async function DayColumn() {
  const [events, myTasks, claudeTasks] = await Promise.all([
    getCalendarEvents().catch(() => [] as CalendarEvent[]),
    getTasks(MY_TASKS_ID).catch(() => [] as GTask[]),
    getTasks(CLAUDE_ID).catch(() => [] as GTask[]),
  ]);

  const overdueTasks = myTasks.filter((t) => isOverdue(t.due));
  const todayTasks = myTasks.filter((t) => !isOverdue(t.due));

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-xs text-muted-foreground">{todayLabel()}</p>
        <h1 className="text-xl font-bold">{dayGreeting()}</h1>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Today</span>
            {events.length > 0 && (
              <Badge variant="outline" className="text-[10px]">{events.length}</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {events.length === 0 ? (
            <p className="text-sm text-muted-foreground">No events</p>
          ) : (
            <div>{events.slice(0, 4).map((e) => <EventRow key={e.id} event={e} />)}</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tasks</span>
            {overdueTasks.length > 0 && (
              <Badge variant="destructive" className="text-[10px]">{overdueTasks.length} overdue</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {overdueTasks.length > 0 && (
            <div className="mb-3">{overdueTasks.map((t) => <TaskRow key={t.id} task={t} />)}</div>
          )}
          {todayTasks.length > 0 && (
            <div className="mb-3">
              <p className="text-[10px] font-semibold text-muted-foreground mb-1">MY TASKS</p>
              {todayTasks.map((t) => <TaskRow key={t.id} task={t} />)}
            </div>
          )}
          {claudeTasks.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground mb-1">CLAUDE</p>
              {claudeTasks.map((t) => <TaskRow key={t.id} task={t} />)}
            </div>
          )}
          {myTasks.length === 0 && claudeTasks.length === 0 && (
            <p className="text-sm text-muted-foreground">All clear ✓</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
