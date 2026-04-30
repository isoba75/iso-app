import { auth } from "@/auth";
import { createTask } from "@/lib/google";
import { NextRequest, NextResponse } from "next/server";

const MY_TASKS_ID  = "MDUwNTMxNTE1ODg2MjgxMDc1Nzc6MDow";
const CLAUDE_ID    = "cmVQNFNHUTdCSXJfX3QzbQ";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, notes, due, list } = await req.json();
  if (!title?.trim()) return NextResponse.json({ error: "Empty title" }, { status: 400 });

  const listId = list === "claude" ? CLAUDE_ID : MY_TASKS_ID;
  const task = await createTask(listId, title.trim(), notes?.trim(), due);
  return NextResponse.json({ ok: true, task });
}
