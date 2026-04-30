"use client";
import { useState } from "react";
import { Card, CardTitle } from "@/components/ui/card";

const TAGS = ["Finance", "DigiBuntu", "PetCalculate", "IsoApp", "Personal", "Idea"] as const;
type Tag = typeof TAGS[number];
type Mode = "note" | "task";
type Status = "idle" | "saving" | "done" | "error";

export function CaptureForm() {
  const [mode, setMode]     = useState<Mode>("note");
  const [text, setText]     = useState("");
  const [tag, setTag]       = useState<Tag>("Personal");
  const [taskList, setTaskList] = useState<"my" | "claude">("my");
  const [due, setDue]       = useState("");
  const [status, setStatus] = useState<Status>("idle");

  const reset = () => {
    setText("");
    setDue("");
    setTimeout(() => setStatus("idle"), 2500);
  };

  const saveNote = async () => {
    if (!text.trim()) return;
    setStatus("saving");
    try {
      const res = await fetch("/api/github/write", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim(), tag }),
      });
      if (!res.ok) throw new Error();
      setStatus("done");
      reset();
    } catch {
      setStatus("error");
      reset();
    }
  };

  const saveTask = async () => {
    if (!text.trim()) return;
    setStatus("saving");
    try {
      const res = await fetch("/api/google/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: text.trim(),
          list: taskList,
          due: due || undefined,
        }),
      });
      if (!res.ok) throw new Error();
      setStatus("done");
      reset();
    } catch {
      setStatus("error");
      reset();
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.metaKey) {
      mode === "note" ? saveNote() : saveTask();
    }
  };

  const btnLabel = () => {
    if (status === "saving") return "Saving…";
    if (status === "done")   return mode === "note" ? "✓ Saved to iso-life" : "✓ Task created";
    if (status === "error")  return "Error — retry";
    return mode === "note" ? "Save note" : "Create task";
  };

  return (
    <Card>
      {/* Mode toggle */}
      <div
        className="inline-flex rounded-lg p-0.5 mb-5"
        style={{ background: "var(--surface2)" }}
      >
        {(["note", "task"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className="px-4 py-1.5 rounded-md text-sm font-medium transition capitalize"
            style={{
              background: mode === m ? "var(--surface)" : "transparent",
              color: mode === m ? "var(--text)" : "var(--muted)",
              boxShadow: mode === m ? "0 1px 3px rgba(0,0,0,0.12)" : "none",
            }}
          >
            {m === "note" ? "📝 Note" : "☑ Task"}
          </button>
        ))}
      </div>

      {/* Note mode: tag selector */}
      {mode === "note" && (
        <div className="flex flex-wrap gap-2 mb-4">
          {TAGS.map((t) => (
            <button
              key={t}
              onClick={() => setTag(t)}
              className="px-3 py-1 rounded-full text-xs font-medium transition"
              style={{
                background: tag === t ? "var(--accent)" : "var(--surface2)",
                color: tag === t ? "var(--bg)" : "var(--muted)",
              }}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      {/* Task mode: list + due date */}
      {mode === "task" && (
        <div className="flex flex-wrap gap-3 mb-4 items-center">
          <div
            className="inline-flex rounded-lg p-0.5"
            style={{ background: "var(--surface2)" }}
          >
            {(["my", "claude"] as const).map((l) => (
              <button
                key={l}
                onClick={() => setTaskList(l)}
                className="px-3 py-1 rounded-md text-xs font-medium transition"
                style={{
                  background: taskList === l ? "var(--surface)" : "transparent",
                  color: taskList === l ? "var(--text)" : "var(--muted)",
                }}
              >
                {l === "my" ? "My Tasks" : "Claude list"}
              </button>
            ))}
          </div>
          <input
            type="date"
            value={due}
            onChange={(e) => setDue(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-lg border focus:outline-none transition"
            style={{
              background: "var(--surface2)",
              border: "1px solid var(--border)",
              color: due ? "var(--text)" : "var(--muted)",
            }}
          />
        </div>
      )}

      {/* Input */}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={
          mode === "note"
            ? "What's on your mind? Ideas, observations, context…"
            : "Task title…"
        }
        className="w-full rounded-lg p-3 text-sm resize-none focus:outline-none transition"
        style={{
          background: "var(--surface2)",
          border: "1px solid var(--border)",
          color: "var(--text)",
          minHeight: mode === "note" ? "120px" : "56px",
        }}
        rows={mode === "note" ? 5 : 2}
        autoFocus
      />
      <p className="text-xs mt-1 mb-3" style={{ color: "var(--muted)" }}>⌘ + Enter to save</p>

      <button
        onClick={mode === "note" ? saveNote : saveTask}
        disabled={!text.trim() || status === "saving"}
        className="w-full font-semibold py-3 rounded-xl transition disabled:opacity-40"
        style={{ background: "var(--accent)", color: "var(--bg)" }}
      >
        {btnLabel()}
      </button>
    </Card>
  );
}
