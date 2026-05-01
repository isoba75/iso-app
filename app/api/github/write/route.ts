import { auth } from "@/auth";
import { readFile, writeFile } from "@/lib/github";
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
  return NextResponse.json({ ok: true, path });
}
