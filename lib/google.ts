import { cache } from "react";

// ── Token exchange ─────────────────────────────────────────────────────────
export const getAccessToken = cache(async (): Promise<string> => {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
      grant_type: "refresh_token",
    }),
    cache: "no-store",
  });
  const data = await res.json();
  if (!data.access_token) throw new Error("Failed to get Google access token");
  return data.access_token;
});

export function googleConfigured() {
  return !!(
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_REFRESH_TOKEN
  );
}

// ── Calendar ───────────────────────────────────────────────────────────────
export interface CalendarEvent {
  id: string;
  summary: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  location?: string;
  htmlLink: string;
}

export async function getCalendarEvents(): Promise<CalendarEvent[]> {
  const token = await getAccessToken();
  const now = new Date();
  const start = new Date(now); start.setHours(0, 0, 0, 0);
  const end = new Date(now); end.setHours(23, 59, 59, 999);

  const url = new URL("https://www.googleapis.com/calendar/v3/calendars/primary/events");
  url.searchParams.set("timeMin", start.toISOString());
  url.searchParams.set("timeMax", end.toISOString());
  url.searchParams.set("singleEvents", "true");
  url.searchParams.set("orderBy", "startTime");
  url.searchParams.set("maxResults", "10");

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: 300 },
  });
  const data = await res.json();
  return data.items || [];
}

// ── Tasks ──────────────────────────────────────────────────────────────────
export interface GTask {
  id: string;
  title: string;
  due?: string;
  notes?: string;
  status: "needsAction" | "completed";
}

export async function getTasks(listId: string): Promise<GTask[]> {
  const token = await getAccessToken();
  const url = new URL(`https://tasks.googleapis.com/tasks/v1/lists/${listId}/tasks`);
  url.searchParams.set("showCompleted", "false");
  url.searchParams.set("showHidden", "false");
  url.searchParams.set("maxResults", "20");

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: 60 },
  });
  const data = await res.json();
  return (data.items || []).filter((t: GTask) => t.status === "needsAction");
}

export async function createTask(
  listId: string,
  title: string,
  notes?: string,
  due?: string
): Promise<GTask> {
  const token = await getAccessToken();
  const body: Record<string, string> = { title };
  if (notes) body.notes = notes;
  if (due) body.due = new Date(due).toISOString();

  const res = await fetch(
    `https://tasks.googleapis.com/tasks/v1/lists/${listId}/tasks`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );
  if (!res.ok) throw new Error(`createTask failed: ${res.status}`);
  return res.json();
}

// ── Gmail ──────────────────────────────────────────────────────────────────
export interface Email {
  id: string;
  threadId: string;
  from: string;
  subject: string;
  snippet: string;
  date: string;
}

function headerValue(headers: { name: string; value: string }[], name: string) {
  return headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value ?? "";
}

export async function getEmails(maxResults = 8): Promise<Email[]> {
  const token = await getAccessToken();

  // Get unread message IDs
  const listRes = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=is:unread in:inbox&maxResults=${maxResults}`,
    { headers: { Authorization: `Bearer ${token}` }, next: { revalidate: 120 } }
  );
  const listData = await listRes.json();
  const messages: { id: string; threadId: string }[] = listData.messages || [];
  if (!messages.length) return [];

  const emails = await Promise.all(
    messages.map(async ({ id, threadId }) => {
      const msgRes = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`,
        { headers: { Authorization: `Bearer ${token}` }, next: { revalidate: 120 } }
      );
      const msg = await msgRes.json();
      const headers = msg.payload?.headers ?? [];
      return {
        id,
        threadId,
        from: headerValue(headers, "From"),
        subject: headerValue(headers, "Subject"),
        snippet: (msg.snippet ?? "").replace(/&#39;/g, "'").replace(/&amp;/g, "&"),
        date: headerValue(headers, "Date"),
      } as Email;
    })
  );
  return emails;
}
