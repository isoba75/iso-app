"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mic, MicOff } from "lucide-react";

// SpeechRecognition typing — minimal vendored types.
interface SpeechRecognitionResult { transcript: string; isFinal: boolean }
interface SpeechRecognitionEvent {
  results: SpeechRecognitionResult[][] & {
    length: number;
    [k: number]: { 0: SpeechRecognitionResult; isFinal: boolean };
  };
}
interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

interface CapturePreviewItem {
  time: string;
  tag: string;
  text: string;
}

export function CaptureClient({ todayCaptures }: { todayCaptures: CapturePreviewItem[] }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [listening, setListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const w = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionInstance;
      webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
    };
    setVoiceSupported(!!(w.SpeechRecognition || w.webkitSpeechRecognition));
  }, []);

  const startVoice = () => {
    const w = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionInstance;
      webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
    };
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) return;
    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = navigator.language || "en-US";
    recognition.onresult = (e) => {
      let finalText = "";
      for (let i = 0; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) finalText += r[0].transcript;
      }
      if (finalText) {
        setText((prev) => (prev ? prev + " " + finalText : finalText).trim());
      }
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  };

  const stopVoice = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  const save = async () => {
    if (!text.trim()) return;
    setStatus("saving");
    try {
      const res = await fetch("/api/github/write", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // No tag — agent classifies. Send literal "Capture" placeholder for the
        // markdown header until triage routine reclassifies on the backend.
        body: JSON.stringify({ text: text.trim(), tag: "Capture" }),
      });
      if (!res.ok) throw new Error();
      setStatus("done");
      setText("");
      setTimeout(() => {
        setStatus("idle");
        router.refresh();
      }, 1200);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  const buttonLabel =
    status === "saving" ? "Saving…" :
    status === "done"   ? "✓ Saved" :
    status === "error"  ? "Error — retry" :
    "Save";

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardContent className="space-y-3 pt-5">
          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="What's on your mind?"
              className="resize-none text-base pr-12 min-h-[160px]"
              rows={7}
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.metaKey) save();
              }}
            />
            {voiceSupported && (
              <button
                type="button"
                onClick={listening ? stopVoice : startVoice}
                className={`absolute bottom-3 right-3 p-2.5 rounded-full transition-all ${
                  listening
                    ? "bg-red-500 text-white animate-pulse"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
                aria-label={listening ? "Stop voice input" : "Start voice input"}
              >
                {listening ? <MicOff className="size-5" /> : <Mic className="size-5" />}
              </button>
            )}
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground">
              {voiceSupported ? "Tap mic for voice · ⌘+Enter to save" : "⌘+Enter to save"}
            </span>
            <Button
              onClick={save}
              disabled={!text.trim() || status === "saving"}
              size="sm"
              className={status === "done" ? "bg-green-600 hover:bg-green-600" : ""}
            >
              {buttonLabel}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground border-t border-border pt-3">
            The triage agent classifies and routes your capture automatically. Just write or speak — no tags needed.
          </p>
        </CardContent>
      </Card>

      {/* Today's captures preview — keep, helpful for quick "did it save?" feedback */}
      {todayCaptures.length > 0 && (
        <Card>
          <CardContent className="pt-5 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">
                Today · {todayCaptures.length} capture{todayCaptures.length > 1 ? "s" : ""}
              </p>
              <span className="text-xs text-muted-foreground">most recent first</span>
            </div>
            {todayCaptures.map((c, i) => (
              <div key={i} className="flex gap-3 py-2 border-b border-border/50 last:border-0">
                <span className="text-xs text-muted-foreground tabular-nums shrink-0 w-12 pt-0.5">
                  {c.time}
                </span>
                <p className="text-sm leading-snug whitespace-pre-wrap break-words flex-1 min-w-0">
                  {c.text}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
