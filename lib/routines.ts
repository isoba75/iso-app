// Lightweight helper for firing Claude Code routines via HTTP API trigger.
// Designed to be fire-and-forget: never blocks the calling endpoint, never
// fails the user's primary action. If env vars are missing or the routine
// fails, the caller proceeds normally.

interface FireResult {
  ok: boolean;
  reason?: string;
  sessionUrl?: string;
}

/**
 * Fire a Claude Code routine by URL. Reads token from env.
 * - Returns silently with { ok: false, reason } if env missing.
 * - Logs to console on failure but never throws.
 */
export async function fireRoutine(
  routineUrl: string | undefined,
  text: string
): Promise<FireResult> {
  const token = process.env.ANTHROPIC_ROUTINE_TOKEN;

  if (!routineUrl || !token) {
    return { ok: false, reason: "not_configured" };
  }

  try {
    const res = await fetch(routineUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        "anthropic-beta": "experimental-cc-routine-2026-04-01",
      },
      body: JSON.stringify({ text }),
    });

    if (!res.ok) {
      console.warn(`[routines] fire failed: ${res.status} ${await res.text().catch(() => "")}`);
      return { ok: false, reason: `http_${res.status}` };
    }

    const data = (await res.json().catch(() => ({}))) as { session_url?: string };
    return { ok: true, sessionUrl: data.session_url };
  } catch (err) {
    console.warn(`[routines] fire threw:`, err);
    return { ok: false, reason: "exception" };
  }
}
