import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 group">
      <div
        className="w-8 h-8 flex items-center justify-center transition-transform group-hover:scale-105"
        style={{
          backgroundColor: "var(--color-accent-subtle)",
          borderRadius: "var(--radius-md)",
        }}
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          style={{ color: "var(--color-accent)" }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
          />
        </svg>
      </div>
      <span
        className="font-semibold hidden sm:block"
        style={{
          fontFamily: "var(--font-display)",
          color: "var(--color-bright)",
        }}
      >
        Outreach Deck
      </span>
    </Link>
  );
}
