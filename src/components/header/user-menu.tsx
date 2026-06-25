interface UserMenuProps {
  userEmail: string;
}

export function UserMenu({ userEmail }: UserMenuProps) {
  return (
    <div className="hidden md:flex items-center gap-4">
      <div className="flex items-center gap-2">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium"
          style={{
            backgroundColor: "var(--color-accent-subtle)",
            color: "var(--color-accent)",
          }}
        >
          {userEmail.charAt(0).toUpperCase()}
        </div>
        <span className="text-sm max-w-[150px] truncate" style={{ color: "var(--color-muted)" }}>
          {userEmail}
        </span>
      </div>
      <form action="/api/auth/signout" method="POST">
        <button
          type="submit"
          className="text-sm px-3 py-1.5 rounded transition-colors hover:bg-[var(--color-raised)]"
          style={{ color: "var(--color-muted)" }}
        >
          Sign out
        </button>
      </form>
    </div>
  );
}
