import { SpinnerIcon } from "@/components/icons";

interface CvTextInputProps {
  value: string;
  onChange: (value: string) => void;
  onParse: () => void;
  onSkip: () => void;
  isParsing: boolean;
}

export function CvTextInput({
  value,
  onChange,
  onParse,
  onSkip,
  isParsing,
}: CvTextInputProps) {
  return (
    <div className="space-y-4">
      <div>
        <label
          className="block text-sm font-medium mb-2"
          style={{ color: "var(--color-text)" }}
        >
          Paste your CV or LinkedIn profile text
        </label>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Copy and paste your CV/resume text or LinkedIn profile here..."
          className="w-full h-48 px-4 py-3 rounded-lg text-sm resize-none focus:outline-none focus:ring-2"
          style={{
            backgroundColor: "var(--color-void)",
            color: "var(--color-text)",
            border: "1px solid var(--color-edge)",
          }}
        />
      </div>

      <div className="flex gap-4">
        <button
          type="button"
          onClick={onParse}
          disabled={value.length < 50 || isParsing}
          className="flex-1 px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: "var(--color-accent)",
            color: "white",
          }}
        >
          {isParsing ? (
            <>
              <SpinnerIcon className="w-5 h-5 animate-spin" />
              Parsing...
            </>
          ) : (
            "Parse Text"
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
