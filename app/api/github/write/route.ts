import { auth } from "@/auth";
import { readFile, writeFile } from "@/lib/github";
import { fireRoutine } from "@/lib/routines";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { text, tag } = await req.json();
  if (!text?.trim()) return NextResponse.json({ error: "Empty text" }, { status: 400 });

  const date = new Date().toISOString().slice(0, 10);
  const time = new Date().toISOString().slice(11, 16) + " UTC";
  // Captures land in Inbox/captures/ per iso-life convention (memory/schema.md, 2026-05-01)
  const path = `Inbox/captures/${date}.md`;

  // Append to existing file or create new
  let existing = "";
  try { existing = await readFile(path); } catch {}

  const entry = `\n## ${time} [${tag}]\n\n${text.trim()}\n`;
  const newContent = existing
    ? existing + entry
    : `# Inbox — ${date}\n${entry}`;

  await writeFile(path, newContent, `capture: ${tag} — ${date}`);

  // Fire the Capture Triage routine.
  // NOTE: Vercel serverless functions kill async work after response returns,
  // so we must await the fire-call. We give it a short timeout (3s) so a
  // slow Anthropic API never blocks the user's capture beyond that.
  // The /fire endpoint itself just queues the run — should respond fast.
  const triageUrl = process.env.TRIAGE_ROUTINE_URL;
  console.log(`[capture] triageUrl present: ${!!triageUrl}, token present: ${!!process.env.ANTHROPIC_ROUTINE_TOKEN}`);
  const fireResult = await Promise.race([
    fireRoutine(triageUrl, `[${tag}] ${text.trim()}`),
    new Promise<{ ok: false; reason: string }>((resolve) =>
      setTimeout(() => resolve({ ok: false, reason: "timeout_3s" }), 3000)
    ),
  ]).catch((e) => ({ ok: false as const, reason: `exception: ${String(e)}` }));
  console.log(`[capture] fire result:`, fireResult);

  return NextResponse.json({ ok: true, path, triage: fireResult });
}
