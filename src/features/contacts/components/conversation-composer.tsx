"use client";

import { useState, useEffect, useRef, useCallback } from "react";

import { CheckIcon, MessageSquareIcon, MicIcon, MicOffIcon, SendIcon, SparklesIcon } from "@/components/icons";
import { useToast } from "@/components/toast";
import { Composer } from "@/shared/ui/composer";
import { useSpeechRecognition } from "@/shared/hooks/use-speech-recognition";

type ComposerMode = "log" | "draft";

interface ConversationComposerProps {
  theirReply: string;
  onTheirReplyChange: (value: string) => void;
  onLogTheirReply: () => void;
  myDraft: string;
  onMyDraftChange: (value: string) => void;
  onDraftReply: () => void;
  onMarkSent: () => void;
  isGeneratingReply: boolean;
  isLogging: boolean;
  hasMessages: boolean;
  error: string | null;
}

export function ConversationComposer({
  theirReply,
  onTheirReplyChange,
  onLogTheirReply,
  myDraft,
  onMyDraftChange,
  onDraftReply,
  onMarkSent,
  isGeneratingReply,
  isLogging,
  hasMessages,
  error,
}: ConversationComposerProps) {
  const { addToast } = useToast();
  const [mode, setMode] = useState<ComposerMode>("draft");
  const myDraftRef = useRef(myDraft);

  useEffect(() => {
    myDraftRef.current = myDraft;
  }, [myDraft]);

  const handleSpeechResult = useCallback((transcript: string) => {
    const current = myDraftRef.current;
    onMyDraftChange(current ? `${current} ${transcript}` : transcript);
  }, [onMyDraftChange]);

  const handleSpeechError = useCallback((err: string) => {
    if (err === "not-allowed") {
      addToast("Microphone blocked. Check browser permissions.", "error");
    } else if (err === "no-speech") {
      addToast("No speech detected. Try again.", "info");
    } else if (err === "network") {
      addToast("Can't reach speech servers. Check your internet connection.", "error");
    } else if (err === "audio-capture") {
      addToast("No microphone found. Check your audio devices.", "error");
    } else {
      addToast(`Voice input error: ${err}`, "error");
    }
  }, [addToast]);

  const { isListening, isSupported, isBlocked, toggleListening } = useSpeechRecognition({
    onResult: handleSpeechResult,
    onError: handleSpeechError,
    continuous: true,
    silenceTimeout: 15000,
  });

  useEffect(() => {
    if (mode !== "draft" && isListening) {
      toggleListening();
    }
  }, [mode, isListening, toggleListening]);

  const openPermissionHelp = () => {
    const isChrome = /Chrome/.test(navigator.userAgent) && !/Edg/.test(navigator.userAgent);
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    const isFirefox = /Firefox/.test(navigator.userAgent);
    const isEdge = /Edg/.test(navigator.userAgent);
    const isArc = /Arc/.test(navigator.userAgent);

    let instructions = "";
    if (isArc) {
      instructions = "Click the site icon in the address bar → Permissions → Microphone → Allow";
    } else if (isChrome) {
      instructions = "Click the lock/tune icon in the address bar → Site settings → Microphone → Allow";
    } else if (isEdge) {
      instructions = "Click the lock icon in the address bar → Permissions for this site → Microphone → Allow";
    } else if (isSafari) {
      instructions = "Safari menu → Settings → Websites → Microphone → Find this site → Allow";
    } else if (isFirefox) {
      instructions = "Click the lock icon in the address bar → Clear permission for Microphone, then try again";
    } else {
      instructions = "Go to your browser settings → Privacy/Site Settings → Microphone → Allow this site";
    }

    alert(`To enable voice input:\n\n${instructions}\n\nThen refresh the page.`);
  };

  const micButton = isSupported ? (
    isBlocked ? (
      <button
        type="button"
        onClick={openPermissionHelp}
        className="p-2 rounded-lg transition-all hover:scale-105 active:scale-95"
        style={{
          backgroundColor: "var(--color-danger-subtle)",
          color: "var(--color-danger)",
        }}
        title="Microphone blocked — click for help"
      >
        <MicOffIcon className="w-4 h-4" />
      </button>
    ) : (
      <button
        type="button"
        onClick={toggleListening}
        className={`p-2 rounded-lg transition-all hover:scale-105 active:scale-95 ${isListening ? "animate-pulse" : ""}`}
        style={{
          backgroundColor: isListening ? "var(--color-danger)" : "var(--color-raised)",
          color: isListening ? "white" : "var(--color-muted)",
        }}
        title={isListening ? "Stop recording" : "Voice input"}
      >
        {isListening ? (
          <MicOffIcon className="w-4 h-4" />
        ) : (
          <MicIcon className="w-4 h-4" />
        )}
      </button>
    )
  ) : null;

  return (
    <div
      className="p-4 space-y-3"
      style={{
        borderTop: "1px solid var(--color-edge)",
        backgroundColor: "var(--color-base)",
      }}
    >
      <div className="flex items-center justify-between">
        <div
          className="inline-flex rounded-lg p-0.5"
          style={{ backgroundColor: "var(--color-void)" }}
        >
          <button
            onClick={() => setMode("log")}
            className="px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5"
            style={{
              backgroundColor: mode === "log" ? "var(--color-raised)" : "transparent",
              color: mode === "log" ? "var(--color-info)" : "var(--color-muted)",
            }}
          >
            <MessageSquareIcon className="w-3.5 h-3.5" />
            Log their reply
          </button>
          <button
            onClick={() => setMode("draft")}
            className="px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5"
            style={{
              backgroundColor: mode === "draft" ? "var(--color-raised)" : "transparent",
              color: mode === "draft" ? "var(--color-accent)" : "var(--color-muted)",
            }}
          >
            <SparklesIcon className="w-3.5 h-3.5" />
            Draft my reply
          </button>
        </div>

        {mode === "draft" && (
          <button
            onClick={onDraftReply}
            disabled={isGeneratingReply || !hasMessages}
            className="px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-1.5"
            style={{
              backgroundColor: "var(--color-accent)",
              color: "white",
            }}
          >
            <SparklesIcon className="w-3.5 h-3.5" />
            {isGeneratingReply ? "Drafting..." : "AI Draft"}
          </button>
        )}
      </div>

      {error && (
        <div
          className="text-xs p-2 rounded-lg"
          style={{
            backgroundColor: "var(--color-danger-subtle)",
            color: "var(--color-danger)",
          }}
        >
          {error}
        </div>
      )}

      {mode === "log" ? (
        <Composer
          value={theirReply}
          onChange={onTheirReplyChange}
          onPrimaryAction={onLogTheirReply}
          primaryIcon={<SendIcon className="w-4 h-4" />}
          primaryLabel="Log their reply"
          placeholder="Paste their message here..."
          isLoading={isLogging}
          disabled={!theirReply.trim()}
          hideCopy
          minRows={2}
          maxRows={5}
        />
      ) : (
        <Composer
          value={myDraft}
          onChange={onMyDraftChange}
          onPrimaryAction={onMarkSent}
          primaryIcon={<CheckIcon className="w-4 h-4" />}
          primaryLabel="Mark Sent"
          placeholder="Describe what you want, then hit AI Draft — or type/record directly..."
          isLoading={isLogging}
          disabled={!myDraft.trim()}
          minRows={2}
          maxRows={5}
          extraActions={micButton}
        />
      )}
    </div>
  );
}
