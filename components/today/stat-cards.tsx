import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { CheckIcon, CalendarIcon, InboxIcon, ListTodoIcon } from "lucide-react"
import { getCalendarEvents, getTasks, getEmails, googleConfigured } from "@/lib/google"

const MY_TASKS_ID = "MDUwNTMxNTE1ODg2MjgxMDc1Nzc6MDow"
const CLAUDE_ID   = "cmVQNFNHUTdCSXJfX3QzbQ"

function isOverdue(due?: string): boolean {
  if (!due) return false
  return new Date(due) < new Date(new Date().toDateString())
}

function isToday(due?: string): boolean {
  if (!due) return false
  const d = new Date(due).toDateString()
  return d === new Date().toDateString()
}

function formatEventTime(dateTime?: string): string {
  if (!dateTime) return "All day"
  return new Date(dateTime).toLocaleTimeString("fr-FR", {
    hour: "2-digit", minute: "2-digit", timeZone: "Europe/Paris",
  })
}

export async function IsoStatCards() {
  if (!googleConfigured()) return null

  const [events, myTasks, claudeTasks, emails] = await Promise.all([
    getCalendarEvents().catch(() => []),
    getTasks(MY_TASKS_ID).catch(() => []),
    getTasks(CLAUDE_ID).catch(() => []),
    getEmails(20).catch(() => []),
  ])

  // Tasks due today or overdue
  const allTasks = [...myTasks, ...claudeTasks]
  const overdue = allTasks.filter((t) => isOverdue(t.due))
  const dueToday = allTasks.filter((t) => isToday(t.due))
  const tasksDueCount = overdue.length + dueToday.length
  const tasksBadge = overdue.length > 0 ? `${overdue.length} overdue` : "On track"
  const tasksBadgeVariant = overdue.length > 0 ? "destructive" : "outline"

  // Next calendar event
  const nextEvent = events[0] ?? null
  const nextEventTime = nextEvent ? formatEventTime(nextEvent.start.dateTime) : null
  const eventsDetail = events.length === 0
    ? "Nothing scheduled"
    : `${events.length} event${events.length > 1 ? "s" : ""} today`

  // Open items from all tasks (no due date = backlog)
  const openCount = allTasks.length
  const noDueCount = allTasks.filter((t) => !t.due).length

  // Unread emails
  const unreadCount = emails.length

  return (
    <div className="grid grid-cols-2 gap-3 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">

      {/* Tasks due */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Tasks due today</CardDescription>
          <CardTitle className="text-3xl font-bold tabular-nums @[250px]/card:text-4xl">
            {tasksDueCount}
          </CardTitle>
          <CardAction>
            <Badge variant={tasksBadgeVariant as "outline" | "destructive"}>
              <ListTodoIcon className="size-3" />
              {tasksBadge}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground">
            {overdue.length > 0
              ? `${overdue.length} overdue · ${dueToday.length} due today`
              : dueToday.length > 0
              ? `${dueToday.length} due today`
              : "Nothing due today"}
          </div>
        </CardFooter>
      </Card>

      {/* Next event */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Next event</CardDescription>
          <CardTitle className="text-3xl font-bold tabular-nums @[250px]/card:text-4xl">
            {nextEventTime ?? "—"}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <CalendarIcon className="size-3" />
              {eventsDetail}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground truncate w-full">
            {nextEvent ? nextEvent.summary : "Free day"}
          </div>
        </CardFooter>
      </Card>

      {/* Open items */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Open tasks</CardDescription>
          <CardTitle className="text-3xl font-bold tabular-nums @[250px]/card:text-4xl">
            {openCount}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <CheckIcon className="size-3" />
              {noDueCount > 0 ? `${noDueCount} no deadline` : "All dated"}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground">
            {myTasks.length} personal · {claudeTasks.length} Claude
          </div>
        </CardFooter>
      </Card>

      {/* Unread email */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Unread emails</CardDescription>
          <CardTitle className="text-3xl font-bold tabular-nums @[250px]/card:text-4xl">
            {unreadCount}
          </CardTitle>
          <CardAction>
            <Badge variant={unreadCount > 5 ? "destructive" : "outline"}>
              <InboxIcon className="size-3" />
              {unreadCount === 0 ? "Inbox zero" : unreadCount > 5 ? "Needs attention" : "Manageable"}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground">
            {unreadCount === 0 ? "All clear" : `${unreadCount} unread in inbox`}
          </div>
        </CardFooter>
      </Card>

    </div>
  )
}
