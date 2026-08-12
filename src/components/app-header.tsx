"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { MenuIcon, XIcon, PlusIcon } from "@/components/icons";
import { QuickAddModal } from "@/features/quick-add";

import { DesktopNav } from "./header/desktop-nav";
import { Logo } from "./header/logo";
import { MobileMenu } from "./header/mobile-menu";
import { UserMenu } from "./header/user-menu";

interface AppHeaderClientProps {
  userEmail: string;
}

export function AppHeaderClient({ userEmail }: AppHeaderClientProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setQuickAddOpen(true);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <header
        className="sticky top-0 z-50"
        style={{
          backgroundColor: "var(--color-base)",
          borderBottom: "1px solid var(--color-edge)",
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="h-14 flex items-center justify-between">
            <Logo />
            <DesktopNav pathname={pathname} />

            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={() => setQuickAddOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all"
                style={{
                  backgroundColor: "var(--color-accent)",
                  color: "var(--color-base)",
                }}
              >
                <PlusIcon className="w-4 h-4" />
                <span>Quick Add</span>
                <kbd
                  className="hidden lg:inline-block ml-1 px-1.5 py-0.5 rounded text-xs"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.2)",
                  }}
                >
                  ⌘K
                </kbd>
              </button>
              <UserMenu userEmail={userEmail} />
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg transition-colors"
              style={{ color: "var(--color-muted)" }}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <XIcon className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <MobileMenu
        pathname={pathname}
        userEmail={userEmail}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {quickAddOpen && (
        <QuickAddModal
          onClose={() => setQuickAddOpen(false)}
          onSuccess={(id) => {
            setQuickAddOpen(false);
            router.push(`/pipeline?contact=${id}`);
          }}
        />
      )}
    </>
  );
}
