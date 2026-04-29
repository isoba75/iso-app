import { Card, CardTitle } from "@/components/ui/card";
import {
  googleConfigured,
  getCalendarEvents,
  getTasks,
  getEmails,
  CalendarEvent,
  GTask,
  Email,
} from "@/lib/google";

const MY_TASKS_ID = "MDUwNTMxNTE1ODg2MjgxMDc1Nzc6MDow";
const CLAUDE_ID = "cmVQNFNHUTdCSXJfX3QzbQ";

// ── Helpers ────────────────────────────────────────────────────────────────
function formatTime(dateTime?: string, date?: string): string {
  if (dateTime) {
    return new Date(dateTime).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Europe/Paris",
    });
  }
  return "All day";
}

function formatSender(from: string): string {
  const match = from.match(/^"?([^"<]+)"?\s*</);
  return match ? match[1].trim() : from.replace(/<.*>/, "").trim();
}

function isOverdue(due?: string): boolean {
  if (!due) return false;
  return new Date(due) < new Date(new Date().toDateString());
}

function dayGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function todayLabel(): string {
  return new Date().toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long",
  });
}

// ── Setup prompt ───────────────────────────────────────────────────────────
function SetupPrompt() {
  return (
    <Card>
      <CardTitle>Google not connected</CardTitle>
      <p className="text-sm mb-3" style={{ color: "var(--muted)" }}>
        Run the one-time auth script in Terminal to connect Calendar, Tasks and Gmail:
      </p>
      <code
        className="block text-xs px-3 py-2 rounded-lg font-mono"
        style={{ background: "var(--surface2)", color: "var(--text)" }}
      >
        node ~/Documents/iso-app/scripts/google-auth.mjs
      </code>
      <p className="text-xs mt-2" style={{ color: "var(--muted)" }}>
        Then add the 3 env vars to Vercel and redeploy.
      </p>
    </Card>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────
function EventRow({ event }: { event: CalendarEvent }) {
  const time = formatTime(event.start.dateTime, event.start.date);
  return (
    <a
      href={event.htmlLink}
      target="_blank"
      rel="noopener noreferrer"
      className="flex gap-3 py-2.5 hover:opacity-80 transition"
      style={{ borderBottom: "1px solid var(--border)" }}
    >
      <span className="text-xs w-14 shrink-0 pt-0.5" style={{ color: "var(--muted)" }}>{time}</span>
      <span className="text-sm">{event.summary}</span>
    </a>
  );
}

function TaskRow({ task }: { task: GTask }) {
  const overdue = isOverdue(task.due);
  return (
    <div className="flex gap-2 py-2" style={{ borderBottom: "1px solid var(--border)" }}>
      <span className="mt-0.5 shrink-0" style={{ color: "var(--muted)" }}>□</span>
      <div className="min-w-0">
        <p className="text-sm leading-snug">{task.title}</p>
        {task.due && (
          <p className={`text-xs mt-0.5 ${overdue ? "text-red-400" : ""}`} style={!overdue ? { color: "var(--muted)" } : {}}>
            {overdue ? "⚠ " : ""}
            {new Date(task.due).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
          </p>
        )}
      </div>
    </div>
  );
}

function EmailRow({ email }: { email: Email }) {
  return (
    <a
      href={`https://mail.google.com/mail/u/0/#inbox/${email.threadId}`}
      target="_blank"
      rel="noopener noreferrer"
      className="block py-2.5 hover:opacity-80 transition"
      style={{ borderBottom: "1px solid var(--border)" }}
    >
      <div className="flex justify-between gap-2 mb-0.5">
        <span className="text-sm font-medium truncate">{formatSender(email.from)}</span>
      </div>
      <p className="text-sm truncate">{email.subject}</p>
      <p className="text-xs truncate mt-0.5" style={{ color: "var(--muted)" }}>{email.snippet}</p>
    </a>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────
export default async function TodayPage() {
  if (!googleConfigured()) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Today</h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>{todayLabel()}</p>
        </div>
        <SetupPrompt />
      </div>
    );
  }

  // Load all three in parallel; fail gracefully per source
  const [events, myTasks, claudeTasks, emails] = await Promise.all([
    getCalendarEvents().catch(() => [] as CalendarEvent[]),
    getTasks(MY_TASKS_ID).catch(() => [] as GTask[]),
    getTasks(CLAUDE_ID).catch(() => [] as GTask[]),
    getEmails(8).catch(() => [] as Email[]),
  ]);

  const overdueTasks = myTasks.filter((t) => isOverdue(t.due));
  const todayTasks = myTasks.filter((t) => !isOverdue(t.due));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-sm" style={{ color: "var(--muted)" }}>{todayLabel()}</p>
        <h1 className="text-2xl font-bold">{dayGreeting()}</h1>
      </div>

      {/* Calendar */}
      <Card>
        <CardTitle>Calendar — today</CardTitle>
        {events.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--muted)" }}>No events today</p>
        ) : (
          <div className="-mb-2">
            {events.map((e) => <EventRow key={e.id} event={e} />)}
          </div>
        )}
      </Card>

      {/* Tasks */}
      <Card>
        <CardTitle>Tasks</CardTitle>

        {overdueTasks.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold mb-1 text-red-400">Overdue</p>
            {overdueTasks.map((t) => <TaskRow key={t.id} task={t} />)}
          </div>
        )}

        {todayTasks.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold mb-1" style={{ color: "var(--muted)" }}>My Tasks</p>
            {todayTasks.map((t) => <TaskRow key={t.id} task={t} />)}
          </div>
        )}

        {claudeTasks.length > 0 && (
          <div>
            <p className="text-xs font-semibold mb-1" style={{ color: "var(--muted)" }}>Claude</p>
            {claudeTasks.map((t) => <TaskRow key={t.id} task={t} />)}
          </div>
        )}

        {myTasks.length === 0 && claudeTasks.length === 0 && (
          <p className="text-sm" style={{ color: "var(--muted)" }}>All clear ✓</p>
        )}
      </Card>

      {/* Email */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <CardTitle>Inbox</CardTitle>
          {emails.length > 0 && (
            <a
              href="https://mail.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs"
              style={{ color: "var(--accent)" }}
            >
              Open Gmail →
            </a>
          )}
        </div>
        {emails.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--muted)" }}>Inbox zero ✓</p>
        ) : (
          <div className="-mb-2">
            {emails.map((e) => <EmailRow key={e.id} email={e} />)}
          </div>
        )}
      </Card>
    </div>
  );
}
