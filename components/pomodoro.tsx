"use client";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

type Mode = "work" | "break" | "long-break";

const DURATIONS: Record<Mode, number> = {
  "work": 25 * 60,
  "break": 5 * 60,
  "long-break": 15 * 60,
};

const MODE_LABELS: Record<Mode, string> = {
  "work": "Focus",
  "break": "Break",
  "long-break": "Long break",
};

export function Pomodoro() {
  const [mode, setMode] = useState<Mode>("work");
  const [seconds, setSeconds] = useState(DURATIONS["work"]);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);

  const total = DURATIONS[mode];
  const progress = ((total - seconds) / total) * 100;

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const complete = useCallback(() => {
    setRunning(false);
    if (mode === "work") {
      const next = sessions + 1;
      setSessions(next);
      const nextMode = next % 4 === 0 ? "long-break" : "break";
      setMode(nextMode);
      setSeconds(DURATIONS[nextMode]);
    } else {
      setMode("work");
      setSeconds(DURATIONS["work"]);
    }
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      new Notification(mode === "work" ? "Focus session complete!" : "Break over — back to work");
    }
  }, [mode, sessions]);

  useEffect(() => {
    if (!running) return;
    if (seconds === 0) { complete(); return; }
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [running, seconds, complete]);

  const reset = () => { setRunning(false); setSeconds(DURATIONS[mode]); };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{MODE_LABELS[mode]}</span>
        {sessions > 0 && (
          <span className="text-xs text-muted-foreground">{sessions} done</span>
        )}
      </div>
      <div className="text-2xl font-mono font-semibold text-center tracking-tight">
        {formatTime(seconds)}
      </div>
      <Progress value={progress} className="h-0.5 bg-muted" />
      <div className="flex gap-2 pt-1">
        <Button
          size="sm"
          variant={running ? "outline" : "default"}
          className="flex-1 text-sm font-normal"
          onClick={() => setRunning((r) => !r)}
        >
          {running ? "Pause" : "Start"}
        </Button>
        <Button size="sm" variant="ghost" className="text-sm text-muted-foreground" onClick={reset}>
          Reset
        </Button>
      </div>
    </div>
  );
}
