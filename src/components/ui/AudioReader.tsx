"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Volume2, VolumeX, Play, Pause, Square } from "lucide-react";

interface AudioReaderProps {
  text: string;
  title?: string;
}

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/p>/gi, " ")
    .replace(/<\/h[1-6]>/gi, ". ")
    .replace(/<\/li>/gi, ". ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

type Status = "idle" | "playing" | "paused";

export default function AudioReader({ text, title }: AudioReaderProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [supported, setSupported] = useState(true);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setSupported(false);
    }
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  const handlePlay = useCallback(() => {
    if (status === "paused") {
      window.speechSynthesis.resume();
      setStatus("playing");
      return;
    }

    window.speechSynthesis.cancel();
    const clean = stripHtml(text);
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.volume = 1;
    utterance.onend = () => setStatus("idle");
    utterance.onerror = () => setStatus("idle");
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setStatus("playing");
  }, [status, text]);

  const handlePause = useCallback(() => {
    window.speechSynthesis.pause();
    setStatus("paused");
  }, []);

  const handleStop = useCallback(() => {
    window.speechSynthesis.cancel();
    setStatus("idle");
  }, []);

  if (!supported) return null;

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-card border border-border rounded-xl mb-6">
      <Volume2 className="h-4 w-4 text-primary shrink-0" />
      <span className="text-sm font-medium text-foreground flex-1">
        {title ? `Listen to "${title}"` : "Listen to Story"}
      </span>

      <div className="flex items-center gap-1">
        {status === "idle" && (
          <button
            onClick={handlePlay}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-xs font-medium rounded-lg hover:bg-primary-hover transition-colors"
            aria-label="Play audio"
          >
            <Play className="h-3.5 w-3.5" />
            Play
          </button>
        )}

        {status === "playing" && (
          <>
            <button
              onClick={handlePause}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-foreground text-xs font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Pause audio"
            >
              <Pause className="h-3.5 w-3.5" />
              Pause
            </button>
            <button
              onClick={handleStop}
              className="p-1.5 text-muted hover:text-foreground hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="Stop audio"
            >
              <Square className="h-3.5 w-3.5" />
            </button>
          </>
        )}

        {status === "paused" && (
          <>
            <button
              onClick={handlePlay}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-xs font-medium rounded-lg hover:bg-primary-hover transition-colors"
              aria-label="Resume audio"
            >
              <Play className="h-3.5 w-3.5" />
              Resume
            </button>
            <button
              onClick={handleStop}
              className="p-1.5 text-muted hover:text-foreground hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="Stop audio"
            >
              <VolumeX className="h-3.5 w-3.5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
