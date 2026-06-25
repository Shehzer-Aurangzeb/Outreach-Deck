import { useRef, useCallback, useState } from "react";

import { DocumentIcon, SpinnerIcon, UploadIcon } from "@/components/icons";

interface CvPdfUploadProps {
  selectedFile: File | null;
  onFileSelect: (file: File | null) => void;
  onExtract: () => void;
  onSkip: () => void;
  isExtracting: boolean;
}

export function CvPdfUpload({
  selectedFile,
  onFileSelect,
  onExtract,
  onSkip,
  isExtracting,
}: CvPdfUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      const file = e.dataTransfer.files[0];
      if (file && file.type === "application/pdf") {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleFileChange}
        className="hidden"
      />
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className="relative h-48 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors"
        style={{
          borderColor: dragActive
            ? "var(--color-accent)"
            : selectedFile
              ? "var(--color-success)"
              : "var(--color-edge)",
          backgroundColor: dragActive
            ? "var(--color-accent-subtle)"
            : selectedFile
              ? "var(--color-success-subtle)"
              : "var(--color-void)",
        }}
      >
        {selectedFile ? (
          <>
            <DocumentIcon
              className="w-12 h-12 mb-3"
              style={{ color: "var(--color-success)" }}
            />
            <p className="font-medium" style={{ color: "var(--color-bright)" }}>
              {selectedFile.name}
            </p>
            <p className="text-sm mt-1" style={{ color: "var(--color-muted)" }}>
              {(selectedFile.size / 1024).toFixed(1)} KB
            </p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onFileSelect(null);
              }}
              className="mt-2 text-sm transition-colors"
              style={{ color: "var(--color-muted)" }}
            >
              Remove
            </button>
          </>
        ) : (
          <>
            <UploadIcon
              className="w-12 h-12 mb-3"
              style={{ color: "var(--color-ghost)" }}
            />
            <p className="font-medium" style={{ color: "var(--color-bright)" }}>
              {dragActive ? "Drop your PDF here" : "Drop your CV or click to upload"}
            </p>
            <p className="text-sm mt-1" style={{ color: "var(--color-ghost)" }}>
              PDF only, max 5MB
            </p>
          </>
        )}
      </div>

      <div className="flex gap-4">
        <button
          type="button"
          onClick={onExtract}
          disabled={!selectedFile || isExtracting}
          className="flex-1 px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: "var(--color-accent)",
            color: "white",
          }}
        >
          {isExtracting ? (
            <>
              <SpinnerIcon className="w-5 h-5 animate-spin" />
              Extracting...
            </>
          ) : (
            "Extract Profile"
          )}
        </button>
        <button
          type="button"
          onClick={onSkip}
          className="px-4 py-3 rounded-lg font-medium transition-colors"
          style={{
            backgroundColor: "var(--color-surface)",
            color: "var(--color-text)",
          }}
        >
          Fill manually
        </button>
      </div>
    </div>
  );
}
