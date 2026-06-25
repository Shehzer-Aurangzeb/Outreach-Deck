"use client";

import { useState } from "react";

import { CheckIcon, CopyIcon } from "@/components/icons";

interface QueryBoxProps {
  query: string;
}

export function QueryBox({ query }: QueryBoxProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(query);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      className="rounded-lg p-3 font-mono text-xs leading-relaxed cursor-pointer select-all transition-colors hover:bg-[var(--color-raised)] relative group/query"
      onClick={handleCopy}
      style={{
        backgroundColor: "var(--color-void)",
        color: "var(--color-text)",
        border: "1px solid var(--color-edge)",
      }}
      title="Click to copy"
    >
      <span className="line-clamp-3">{query}</span>
      <div
        className="absolute top-2 right-2 opacity-0 group-hover/query:opacity-100 transition-opacity"
        style={{ color: "var(--color-muted)" }}
      >
        {copied ? (
          <CheckIcon className="w-4 h-4" style={{ color: "var(--color-success)" }} />
        ) : (
          <CopyIcon className="w-4 h-4" />
        )}
      </div>
    </div>
  );
}
