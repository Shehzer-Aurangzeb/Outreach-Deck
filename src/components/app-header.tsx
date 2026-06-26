"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";

import { MenuIcon, XIcon } from "@/components/icons";

import { DesktopNav } from "./header/desktop-nav";
import { Logo } from "./header/logo";
import { MobileMenu } from "./header/mobile-menu";
import { UserMenu } from "./header/user-menu";

interface AppHeaderClientProps {
  userEmail: string;
}

export function AppHeaderClient({ userEmail }: AppHeaderClientProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
            <UserMenu userEmail={userEmail} />

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
    </>
  );
}
