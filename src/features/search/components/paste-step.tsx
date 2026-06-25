"use client";

import { useRef, useEffect } from "react";

import { ClipboardIcon, SparklesIcon } from "@/components/icons";

interface PasteStepProps {
  rawText: string;
  onRawTextChange: (text: string) => void;
  onExtract: () => void;
  isParsing: boolean;
}

export function PasteStep({ rawText, onRawTextChange, onExtract, isParsing }: PasteStepProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 mb-4">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: "var(--color-info-subtle)" }}
        >
          <ClipboardIcon className="w-5 h-5" style={{ color: "var(--color-info)" }} />
        </div>
        <div>
          <h3 className="font-medium" style={{ color: "var(--color-bright)" }}>
            Paste their LinkedIn profile
          </h3>
          <p className="text-sm mt-0.5" style={{ color: "var(--color-muted)" }}>
            Copy everything from their profile page (name, about, experience) and paste below. AI
            will organize it for you.
          </p>
        </div>
      </div>

      <textarea
        ref={textareaRef}
        value={rawText}
        onChange={(e) => onRawTextChange(e.target.value)}
        rows={12}
        placeholder={`Paste the full LinkedIn profile here...

Example:
Sarah Chen
Senior Software Engineer at Stripe
San Francisco Bay Area • 500+ connections

About
Passionate about building scalable systems...

Experience
Senior Software Engineer
Stripe • 2 yrs
...`}
        className="w-full px-4 py-3 rounded-xl text-sm resize-none transition-colors"
        style={{
          backgroundColor: "var(--color-void)",
          color: "var(--color-text)",
          border: "1px solid var(--color-edge)",
          fontFamily: "var(--font-mono, monospace)",
        }}
      />

      <button
        onClick={onExtract}
        disabled={isParsing || rawText.trim().length < 20}
        className="w-full h-12 rounded-xl font-medium disabled:opacity-50 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
        style={{
          backgroundColor: "var(--color-accent)",
          color: "white",
        }}
      >
        <SparklesIcon className="w-5 h-5" />
        {isParsing ? "Extracting..." : "Extract Profile Info"}
      </button>
    </div>
  );
}
