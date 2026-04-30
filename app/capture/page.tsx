"use client";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

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

  const buttonLabel =
    status === "saving" ? "Saving..." :
    status === "done"   ? "✓ Saved to iso-life" :
    status === "error"  ? "Error — retry" :
    "Save capture";

  return (
    <div className="flex flex-col">
      <div className="@container/main flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6 max-w-2xl">
        <div>
          <h1 className="text-base font-semibold">Capture</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Brain dump → commits to iso-life inbox</p>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">New capture</CardTitle>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {TAGS.map((t) => (
                <button key={t} onClick={() => setTag(t)}>
                  <Badge
                    variant={tag === t ? "default" : "outline"}
                    className="cursor-pointer text-xs"
                  >
                    {t}
                  </Badge>
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="What's on your mind? Ideas, tasks, observations..."
              className="resize-none text-sm"
              rows={6}
              onKeyDown={(e) => e.key === "Enter" && e.metaKey && save()}
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">⌘ + Enter to save</span>
              <Button
                onClick={save}
                disabled={!text.trim() || status === "saving"}
                size="sm"
                className={status === "done" ? "bg-green-600 hover:bg-green-600" : ""}
              >
                {buttonLabel}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>How it works</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground">
              Each capture is appended to{" "}
              <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
                iso-life/Inbox/YYYY-MM-DD.md
              </code>{" "}
              with a timestamp and tag. Claude reads the inbox at the start of each Cowork session.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
