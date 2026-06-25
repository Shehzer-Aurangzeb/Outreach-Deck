"use client";

import { useEffect, useRef, useState } from "react";

import { SearchIcon, XIcon } from "@/components/icons";
import { useDebounce } from "@/shared/hooks/use-debounce";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
  debounceMs = 300,
}: SearchInputProps) {
  const [localValue, setLocalValue] = useState(value);
  const debouncedValue = useDebounce(localValue, debounceMs);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync debounced value back to parent
  useEffect(() => {
    if (debouncedValue !== value) {
      onChange(debouncedValue);
    }
  }, [debouncedValue, onChange, value]);

  // Sync external value changes (e.g., clear filters)
  useEffect(() => {
    if (value !== localValue && value === "") {
      setLocalValue("");
    }
  }, [value, localValue]);

  // Keyboard shortcut (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape" && inputRef.current === document.activeElement) {
        setLocalValue("");
        inputRef.current?.blur();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleClear = () => {
    setLocalValue("");
    onChange("");
  };

  return (
    <div className="relative flex-1">
      <SearchIcon
        className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none w-4 h-4"
        style={{ color: "var(--color-ghost)" }}
      />
      <input
        ref={inputRef}
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        className="input pl-10 pr-20 w-full"
        style={{ height: "44px" }}
      />
      {localValue ? (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-[var(--color-raised)]"
          style={{ color: "var(--color-muted)" }}
          aria-label="Clear search"
        >
          <XIcon className="w-4 h-4" />
        </button>
      ) : (
        <kbd
          className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded text-xs font-mono"
          style={{
            backgroundColor: "var(--color-raised)",
            color: "var(--color-ghost)",
            border: "1px solid var(--color-edge)",
          }}
        >
          ⌘K
        </kbd>
      )}
    </div>
  );
}
