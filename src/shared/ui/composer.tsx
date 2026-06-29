"use client";

import { useState, type ReactNode, useRef, useEffect } from "react";

import { CharCounter } from "@/components/char-counter";
import { CheckIcon, CopyIcon } from "@/components/icons";

export interface ComposerProps {
  value: string;
  onChange: (value: string) => void;
  onPrimaryAction: () => void;
  primaryIcon: ReactNode;
  primaryLabel: string;
  placeholder?: string;
  maxLength?: number;
  showCharCount?: boolean;
  disabled?: boolean;
  isLoading?: boolean;
  extraActions?: ReactNode;
  minRows?: number;
  maxRows?: number;
  onCopy?: () => void;
  hideCopy?: boolean;
  hasError?: boolean;
  errorMessage?: string;
}

export function Composer({
  value,
  onChange,
  onPrimaryAction,
  primaryIcon,
  primaryLabel,
  placeholder = "Type your message...",
  maxLength,
  showCharCount = false,
  disabled = false,
  isLoading = false,
  extraActions,
  minRows = 3,
  maxRows = 8,
  onCopy,
  hideCopy = false,
  hasError = false,
  errorMessage,
}: ComposerProps) {
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isOverLimit = maxLength !== undefined && value.length > maxLength;
  const showError = hasError || isOverLimit;

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";

    const lineHeight = 24;
    const minHeight = minRows * lineHeight;
    const maxHeight = maxRows * lineHeight;

    const newHeight = Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight);
    textarea.style.height = `${newHeight}px`;
  }, [value, minRows, maxRows]);

  const handleCopy = async () => {
    if (onCopy) {
      onCopy();
    } else {
      await navigator.clipboard.writeText(value);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && !disabled && !isLoading && !isOverLimit) {
      e.preventDefault();
      onPrimaryAction();
    }
  };

  return (
    <div className="space-y-1.5">
      <div
        className="relative rounded-xl transition-colors"
        style={{
          backgroundColor: "var(--color-void)",
          border: `1px solid ${showError ? "var(--color-danger)" : "var(--color-edge)"}`,
        }}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full px-4 py-3 pr-12 pb-10 text-sm resize-none bg-transparent focus:outline-none"
          style={{
            color: "var(--color-text)",
            minHeight: `${minRows * 24}px`,
          }}
        />

        {!hideCopy && value.length > 0 && (
          <button
            type="button"
            onClick={handleCopy}
            className="absolute top-2 right-2 p-1.5 rounded-md transition-all hover:bg-white/10 active:scale-95"
            style={{
              color: copied ? "var(--color-success)" : "var(--color-muted)",
            }}
            title={copied ? "Copied!" : "Copy to clipboard"}
          >
            {copied ? (
              <CheckIcon className="w-4 h-4" />
            ) : (
              <CopyIcon className="w-4 h-4" />
            )}
          </button>
        )}

        {showCharCount && maxLength && (
          <div className="absolute bottom-2.5 left-3">
            <CharCounter current={value.length} max={maxLength} />
          </div>
        )}

        <div className="absolute bottom-2 right-2 flex items-center gap-1">
          {extraActions}

          <button
            type="button"
            onClick={onPrimaryAction}
            disabled={disabled || isLoading || isOverLimit}
            className="p-2 rounded-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
            style={{
              backgroundColor: "var(--color-accent)",
              color: "white",
            }}
            title={primaryLabel}
          >
            {isLoading ? (
              <div
                className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
              />
            ) : (
              primaryIcon
            )}
          </button>
        </div>
      </div>

      {showError && errorMessage && (
        <p className="text-xs px-1" style={{ color: "var(--color-danger)" }}>
          {errorMessage}
        </p>
      )}
    </div>
  );
}
