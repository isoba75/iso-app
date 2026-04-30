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
      hour: "2-digit", minute: "2-digit", timeZone: "Europe/Paris",
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

function SectionHeader({ label, count }: { label: string; count?: number }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border mb-1">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {count !== undefined && count > 0 && (
        <Badge variant="outline" className="text-[10px] h-4 px-1.5">{count}</Badge>
      )}
    </div>
  );
}

function EventRow({ event }: { event: CalendarEvent }) {
  return (
    <a
      href={event.htmlLink}
      target="_blank"
      rel="noopener noreferrer"
      className="flex gap-3 py-2 hover:bg-muted/50 -mx-1 px-1 rounded transition border-b border-border/50 last:border-0"
    >
      <span className="text-xs w-12 shrink-0 pt-0.5 text-muted-foreground tabular-nums">
        {formatTime(event.start.dateTime)}
      </span>
      <span className="text-sm text-foreground">{event.summary}</span>
    </a>
  );
}

function TaskRow({ task }: { task: GTask }) {
  const overdue = isOverdue(task.due);
  return (
    <div className="flex gap-2.5 py-2 border-b border-border/50 last:border-0">
      <span className="mt-0.5 shrink-0 text-muted-foreground text-xs">○</span>
      <div className="min-w-0">
        <p className="text-sm text-foreground leading-snug">{task.title}</p>
        {task.due && (
          <p className={`text-xs mt-0.5 ${overdue ? "text-red-500" : "text-muted-foreground"}`}>
            {overdue ? "Overdue · " : ""}
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
    <div className="flex flex-col gap-6">
      <div className="pt-1">
        <p className="text-xs text-muted-foreground">{todayLabel()}</p>
        <h1 className="text-lg font-semibold text-foreground mt-0.5">{dayGreeting()}</h1>
      </div>

      <div>
        <SectionHeader label="Schedule" count={events.length} />
        {events.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2">No events today</p>
        ) : (
          <div>{events.slice(0, 5).map((e) => <EventRow key={e.id} event={e} />)}</div>
        )}
      </div>

      <div>
        <SectionHeader label="Tasks" count={overdueTasks.length > 0 ? undefined : todayTasks.length + claudeTasks.length} />
        {overdueTasks.length > 0 && (
          <div className="mb-3">
            <p className="text-[10px] font-medium text-red-500 uppercase tracking-wider mb-1">Overdue</p>
            {overdueTasks.map((t) => <TaskRow key={t.id} task={t} />)}
          </div>
        )}
        {todayTasks.length > 0 && (
          <div className="mb-3">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">My Tasks</p>
            {todayTasks.map((t) => <TaskRow key={t.id} task={t} />)}
          </div>
        )}
        {claudeTasks.length > 0 && (
          <div>
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Claude</p>
            {claudeTasks.map((t) => <TaskRow key={t.id} task={t} />)}
          </div>
        )}
        {myTasks.length === 0 && claudeTasks.length === 0 && (
          <p className="text-sm text-muted-foreground py-2">All clear</p>
        )}
      </div>
    </div>
  );
}
