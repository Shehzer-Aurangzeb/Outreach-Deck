"use client";

import { useState, useMemo } from "react";

import { Modal } from "@/components/modal";
import { UploadIcon, CheckIcon, XIcon } from "@/components/icons";

import type { CreateCompanyInput, Tier } from "../types";

interface CsvImportModalProps {
  onClose: () => void;
  onImport: (companies: CreateCompanyInput[]) => Promise<{ created: number; skipped: number }>;
}

function parseTier(value: string): Tier {
  const normalized = value.toLowerCase().trim();
  if (normalized === "large" || normalized === "big") return "LARGE";
  if (normalized === "consultancy" || normalized === "agency" || normalized === "consulting") return "CONSULTANCY";
  return "MID";
}

function parseCsvLine(line: string): { name: string; city: string; tier: Tier } | null {
  const parts = line.split(",").map((p) => p.trim().replace(/^["']|["']$/g, ""));
  if (parts.length < 1 || !parts[0]) return null;

  return {
    name: parts[0],
    city: parts[1] ?? "",
    tier: parseTier(parts[2] ?? "mid"),
  };
}

export function CsvImportModal({ onClose, onImport }: CsvImportModalProps) {
  const [csvText, setCsvText] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [result, setResult] = useState<{ created: number; skipped: number } | null>(null);

  const parsed = useMemo(() => {
    if (!csvText.trim()) return [];
    const lines = csvText.trim().split("\n");
    const firstLine = lines[0]?.toLowerCase() ?? "";
    const hasHeader = firstLine.includes("company") || firstLine.includes("name");
    const dataLines = hasHeader ? lines.slice(1) : lines;
    return dataLines.map(parseCsvLine).filter((c): c is NonNullable<typeof c> => c !== null);
  }, [csvText]);

  const handleImport = async () => {
    if (parsed.length === 0) return;
    setIsImporting(true);
    try {
      const result = await onImport(parsed);
      setResult(result);
    } finally {
      setIsImporting(false);
    }
  };

  if (result) {
    return (
      <Modal onClose={onClose}>
        <div className="text-center py-4">
          <div
            className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{ backgroundColor: "var(--color-success-subtle)" }}
          >
            <CheckIcon className="w-6 h-6" style={{ color: "var(--color-success)" }} />
          </div>
          <h2 className="text-lg font-semibold mb-2" style={{ color: "var(--color-bright)" }}>
            Import Complete
          </h2>
          <p className="text-sm mb-4" style={{ color: "var(--color-muted)" }}>
            <strong style={{ color: "var(--color-success)" }}>{result.created}</strong> companies added
            {result.skipped > 0 && (
              <>, <strong style={{ color: "var(--color-warning)" }}>{result.skipped}</strong> skipped (duplicates)</>
            )}
          </p>
          <button onClick={onClose} className="btn btn-primary">
            Done
          </button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal onClose={onClose}>
      <h2 className="text-lg font-semibold mb-1" style={{ color: "var(--color-bright)" }}>
        Import Companies from CSV
      </h2>
      <p className="text-sm mb-4" style={{ color: "var(--color-muted)" }}>
        Paste CSV data with columns: <code className="text-xs px-1 py-0.5 rounded" style={{ backgroundColor: "var(--color-raised)" }}>name, city, tier</code>
      </p>

      <textarea
        value={csvText}
        onChange={(e) => setCsvText(e.target.value)}
        placeholder={`Shopify, Ottawa, large\nCoveo, Montreal, mid\nCGI, Montreal, consultancy`}
        className="input min-h-40 font-mono text-sm resize-y"
        autoFocus
      />

      {parsed.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-medium mb-2" style={{ color: "var(--color-text)" }}>
            Preview ({parsed.length} companies)
          </p>
          <div
            className="max-h-50 overflow-y-auto rounded-lg border text-sm"
            style={{ borderColor: "var(--color-edge)", backgroundColor: "var(--color-raised)" }}
          >
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: "var(--color-base)", borderBottom: "1px solid var(--color-edge)" }}>
                  <th className="text-left px-3 py-2 font-medium" style={{ color: "var(--color-muted)" }}>Name</th>
                  <th className="text-left px-3 py-2 font-medium" style={{ color: "var(--color-muted)" }}>City</th>
                  <th className="text-left px-3 py-2 font-medium" style={{ color: "var(--color-muted)" }}>Tier</th>
                </tr>
              </thead>
              <tbody>
                {parsed.slice(0, 10).map((c, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid var(--color-edge)" }}>
                    <td className="px-3 py-2" style={{ color: "var(--color-text)" }}>{c.name}</td>
                    <td className="px-3 py-2" style={{ color: "var(--color-muted)" }}>{c.city || "—"}</td>
                    <td className="px-3 py-2" style={{ color: "var(--color-muted)" }}>{c.tier}</td>
                  </tr>
                ))}
                {parsed.length > 10 && (
                  <tr>
                    <td colSpan={3} className="px-3 py-2 text-center" style={{ color: "var(--color-ghost)" }}>
                      ...and {parsed.length - 10} more
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="flex gap-3 mt-6">
        <button onClick={onClose} className="btn btn-secondary flex-1">
          Cancel
        </button>
        <button
          onClick={handleImport}
          disabled={parsed.length === 0 || isImporting}
          className="btn btn-primary flex-1 flex items-center justify-center gap-2"
        >
          <UploadIcon className="w-4 h-4" />
          {isImporting ? "Importing..." : `Import ${parsed.length} Companies`}
        </button>
      </div>
    </Modal>
  );
}
