"use client";

import { useEffect } from "react";
import Link from "next/link";

import { LogOutIcon } from "@/components/icons";

import { NAV_ITEMS } from "./constants";

interface MobileMenuProps {
  pathname: string;
  userEmail: string;
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMenu({ pathname, userEmail, isOpen, onClose }: MobileMenuProps) {
  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`md:hidden fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Menu Panel */}
      <div
        className={`md:hidden fixed top-14 left-0 right-0 z-50 transition-all duration-300 ease-out ${
          isOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"
        }`}
        style={{
          backgroundColor: "var(--color-base)",
          borderBottom: "1px solid var(--color-edge)",
          boxShadow: isOpen ? "0 4px 20px rgba(0, 0, 0, 0.3)" : "none",
        }}
      >
        <div className="px-4 py-3 space-y-1 max-h-[calc(100vh-3.5rem)] overflow-y-auto">
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
    </>
  );
}
