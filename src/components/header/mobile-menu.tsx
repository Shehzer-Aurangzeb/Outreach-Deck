"use client";

import Link from "next/link";

import { LogOutIcon } from "@/components/icons";

import { NAV_ITEMS } from "./constants";

interface MobileMenuProps {
  pathname: string;
  userEmail: string;
  onClose: () => void;
}

export function MobileMenu({ pathname, userEmail, onClose }: MobileMenuProps) {
  return (
    <div
      className="md:hidden border-t animate-fade-in"
      style={{
        backgroundColor: "var(--color-base)",
        borderColor: "var(--color-edge)",
      }}
    >
      <div className="px-4 py-3 space-y-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors"
              style={{
                backgroundColor: isActive ? "var(--color-accent-subtle)" : "transparent",
                color: isActive ? "var(--color-accent)" : "var(--color-text)",
              }}
            >
              <Icon className="w-5 h-5" />
              {label}
            </Link>
          );
        })}

        {/* Mobile User Section */}
        <div className="mt-3 pt-3 border-t" style={{ borderColor: "var(--color-edge)" }}>
          <div className="flex items-center gap-3 px-3 py-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
              style={{
                backgroundColor: "var(--color-accent-subtle)",
                color: "var(--color-accent)",
              }}
            >
              {userEmail.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm truncate flex-1" style={{ color: "var(--color-text)" }}>
              {userEmail}
            </span>
          </div>
          <form action="/api/auth/signout" method="POST" className="mt-2">
            <button
              type="submit"
              className="w-full text-left flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors hover:bg-[var(--color-raised)]"
              style={{ color: "var(--color-danger)" }}
            >
              <LogOutIcon className="w-5 h-5" />
              Sign out
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
