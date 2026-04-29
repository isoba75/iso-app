"use client";
import { useState } from "react";
import { Card, CardTitle } from "@/components/ui/card";

const TAGS = ["Finance", "DigiBuntu", "PetCalculate", "IsoApp", "Personal", "Idea"] as const;
type Tag = typeof TAGS[number];

export default function CapturePage() {
  const [text, setText]     = useState("");
  const [tag, setTag]       = useState<Tag>("Personal");
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");

  const save = async () => {
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
      setText("");
      setTimeout(() => setStatus("idle"), 2500);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Capture</h1>
        <p className="text-[var(--muted)] text-sm mt-1">Brain dump → commits to iso-life</p>
      </div>

      <Card>
        <CardTitle>New capture</CardTitle>

        {/* Tag selector */}
        <div className="flex flex-wrap gap-2 mb-4">
          {TAGS.map((t) => (
            <button
              key={t}
              onClick={() => setTag(t)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                tag === t
                  ? "bg-[#7dd870] text-black"
                  : "bg-[var(--surface2)] text-[var(--muted)] hover:text-[#e8e8e8]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Text input */}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What's on your mind? Ideas, tasks, observations..."
          className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-lg p-3 text-sm text-[#e8e8e8] placeholder:text-[var(--muted)] resize-none focus:outline-none focus:border-[#7dd870] transition"
          rows={6}
          onKeyDown={(e) => e.key === "Enter" && e.metaKey && save()}
        />
        <p className="text-[var(--muted)] text-xs mt-1">⌘ + Enter to save</p>

        <button
          onClick={save}
          disabled={!text.trim() || status === "saving"}
          className="mt-3 w-full bg-[#7dd870] text-black font-semibold py-2.5 rounded-lg hover:opacity-90 disabled:opacity-40 transition"
        >
          {status === "saving" ? "Saving..." : status === "done" ? "✓ Saved to iso-life" : status === "error" ? "Error — retry" : "Save capture"}
        </button>
      </Card>

      <Card>
        <CardTitle>How it works</CardTitle>
        <p className="text-sm text-[var(--muted)]">
          Each capture is appended to <code className="text-[var(--accent)] bg-[var(--surface2)] px-1 rounded">iso-life/Inbox/YYYY-MM-DD.md</code> with a timestamp and tag. Claude reads the inbox at the start of each session and processes your notes.
        </p>
      </Card>
    </div>
  );
}
