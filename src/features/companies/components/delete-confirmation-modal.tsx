"use client";

import { XIcon } from "@/components/icons";
import { Modal } from "@/components/modal";

import type { Company } from "../types";

interface DeleteConfirmationModalProps {
  company: Company;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteConfirmationModal({
  company,
  isDeleting,
  onClose,
  onConfirm,
}: DeleteConfirmationModalProps) {
  return (
    <Modal onClose={onClose}>
      <div className="text-center">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: "var(--color-danger-subtle)" }}
        >
          <XIcon className="w-6 h-6" style={{ color: "var(--color-danger)" }} />
        </div>
        <h2 className="text-lg font-semibold mb-2" style={{ color: "var(--color-bright)" }}>
          Delete Company
        </h2>
        <p className="mb-6" style={{ color: "var(--color-muted)" }}>
          Are you sure you want to delete{" "}
          <strong style={{ color: "var(--color-text)" }}>{company.name}</strong>? This action cannot
          be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="btn btn-secondary flex-1">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="btn btn-danger flex-1"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
