"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff } from "lucide-react";

// Tags reflect current focus discipline (per memory/focus.md).
// "Personal" is the default. Project tags exist for ideas about
// dormant projects (filed silently). "Idea" = potential new project
// (lands in wiki/raw/new-project-ideas.md per Capture Triage when built).
const TAGS = ["Personal", "Finance", "Idea", "DigiBuntu", "PetCalculate", "IsoApp", "Other"] as const;
type Tag = typeof TAGS[number];

// Quick-add chips: one tap pre-fills tag + opens textarea focused.
const QUICK_CHIPS: Array<{ label: string; tag: Tag; emoji: string }> = [
  { label: "Idea",     tag: "Idea",     emoji: "💡" },
  { label: "Task",     tag: "Personal", emoji: "✅" },
  { label: "Note",     tag: "Personal", emoji: "📝" },
  { label: "Finance",  tag: "Finance",  emoji: "💰" },
];

// Auto-detect tag from text content. Runs on each keystroke.
function autoDetectTag(text: string, currentTag: Tag): Tag {
  const lower = text.toLowerCase();
  // URL → likely an Idea/research item
  if (/https?:\/\//.test(text) && currentTag === "Personal") return "Idea";
  // Mentions → tag accordingly (only if user hasn't manually set)
  if (currentTag === "Personal") {
    if (/\bdigibuntu\b/i.test(lower)) return "DigiBuntu";
    if (/\bpetcalculate\b/i.test(lower)) return "PetCalculate";
    if (/\biso[\s-]?app\b/i.test(lower)) return "IsoApp";
    if (/\b(money|euro|€|salary|loan|invest|vuaa|tax)\b/i.test(lower)) return "Finance";
  }
  return currentTag;
}

// SpeechRecognition typing — vendored minimal types so we don't need lib.dom.iterable extras.
interface SpeechRecognitionResult { transcript: string; isFinal: boolean }
interface SpeechRecognitionEvent { results: SpeechRecognitionResult[][] & { length: number; [k: number]: { 0: SpeechRecognitionResult; isFinal: boolean } } }
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
  const [text, setText]     = useState("");
  const [tag, setTag]       = useState<Tag>("Personal");
  const [tagPinned, setTagPinned] = useState(false); // user manually set the tag
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [listening, setListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Detect voice support on mount.
  useEffect(() => {
    const SR = (window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionInstance;
      webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
    }).SpeechRecognition || (window as unknown as {
      webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
    }).webkitSpeechRecognition;
    setVoiceSupported(!!SR);
  }, []);

  // Auto-detect tag from text (only if user hasn't pinned manually).
  useEffect(() => {
    if (!tagPinned && text.length > 3) {
      const detected = autoDetectTag(text, tag);
      if (detected !== tag) setTag(detected);
    }
  }, [text, tag, tagPinned]);

  const setTagManual = (t: Tag) => {
    setTag(t);
    setTagPinned(true);
  };

  const useChip = (chip: typeof QUICK_CHIPS[number]) => {
    setTag(chip.tag);
    setTagPinned(true);
    textareaRef.current?.focus();
  };

  const startVoice = () => {
    const SR = (window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionInstance;
      webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
    }).SpeechRecognition || (window as unknown as {
      webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
    }).webkitSpeechRecognition;
    if (!SR) return;
    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = navigator.language || "en-US";
    recognition.onresult = (e) => {
      let finalText = "";
      for (let i = 0; i < e.results.length; i++) {
        const result = e.results[i];
        if (result.isFinal) finalText += result[0].transcript;
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
        body: JSON.stringify({ text: text.trim(), tag }),
      });
      if (!res.ok) throw new Error();
      setStatus("done");
      setText("");
      setTagPinned(false);
      setTag("Personal");
      setTimeout(() => {
        setStatus("idle");
        router.refresh(); // re-fetch today's captures
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
      {/* Quick chips */}
      <div className="flex flex-wrap gap-2">
        {QUICK_CHIPS.map((c) => (
          <button
            key={c.label}
            onClick={() => useChip(c)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-card hover:bg-muted text-sm transition-all active:scale-95"
          >
            <span className="text-base">{c.emoji}</span>
            <span className="font-medium">{c.label}</span>
          </button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-base">New capture</CardTitle>
            {!tagPinned && text.length > 3 && (
              <span className="text-xs text-muted-foreground">auto-tagged</span>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {TAGS.map((t) => (
              <button key={t} onClick={() => setTagManual(t)}>
                <Badge
                  variant={tag === t ? "default" : "outline"}
                  className="cursor-pointer text-xs h-6 px-2"
                >
                  {t}
                </Badge>
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="What's on your mind?"
              className="resize-none text-base pr-12 min-h-[140px]"
              rows={6}
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.metaKey) save();
              }}
            />
            {voiceSupported && (
              <button
                type="button"
                onClick={listening ? stopVoice : startVoice}
                className={`absolute bottom-3 right-3 p-2 rounded-full transition-all ${
                  listening
                    ? "bg-red-500 text-white animate-pulse"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
                aria-label={listening ? "Stop voice input" : "Start voice input"}
              >
                {listening ? <MicOff className="size-4" /> : <Mic className="size-4" />}
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
        </CardContent>
      </Card>

      {/* Today's captures preview */}
      {todayCaptures.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Today · {todayCaptures.length} capture{todayCaptures.length > 1 ? "s" : ""}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {todayCaptures.map((c, i) => (
              <div key={i} className="flex gap-3 py-2 border-b border-border/50 last:border-0">
                <span className="text-xs text-muted-foreground tabular-nums shrink-0 w-12 pt-0.5">
                  {c.time}
                </span>
                <div className="flex-1 min-w-0">
                  <Badge variant="outline" className="text-xs h-5 px-1.5 mb-1">
                    {c.tag}
                  </Badge>
                  <p className="text-sm leading-snug whitespace-pre-wrap break-words">
                    {c.text}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
