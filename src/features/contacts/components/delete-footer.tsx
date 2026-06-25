"use client";

import { useState } from "react";

import { TrashIcon } from "@/components/icons";

interface DeleteFooterProps {
  contactName: string;
  updatedAt: Date;
  onDelete: () => void;
  isDeleting: boolean;
}

export function DeleteFooter({
  contactName,
  updatedAt,
  onDelete,
  isDeleting,
}: DeleteFooterProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div
      className="px-5 py-4 flex justify-between items-center"
      style={{
        backgroundColor: "var(--color-raised)",
        borderTop: "1px solid var(--color-edge)",
      }}
    >
      {!showConfirm ? (
        <button
          onClick={() => setShowConfirm(true)}
          className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg transition-colors hover:bg-[var(--color-danger-subtle)]"
          style={{ color: "var(--color-danger)" }}
        >
          <TrashIcon className="w-4 h-4" />
          <span>Delete</span>
        </button>
      ) : (
        <div className="flex items-center gap-2">
          <span className="text-xs" style={{ color: "var(--color-danger)" }}>
            Delete {contactName}?
          </span>
          <button
            onClick={onDelete}
            disabled={isDeleting}
            className="text-xs px-3 py-1.5 rounded-lg transition-all hover:scale-[1.02]"
            style={{
              backgroundColor: "var(--color-danger)",
              color: "white",
            }}
          >
            {isDeleting ? "..." : "Yes"}
          </button>
          <button
            onClick={() => setShowConfirm(false)}
            className="text-xs px-3 py-1.5 rounded-lg transition-colors"
            style={{
              backgroundColor: "var(--color-void)",
              color: "var(--color-text)",
            }}
          >
            Cancel
          </button>
        </div>
      )}
      <span className="text-xs" style={{ color: "var(--color-ghost)" }}>
        Updated {new Date(updatedAt).toLocaleDateString()}
      </span>
    </div>
  );
}
