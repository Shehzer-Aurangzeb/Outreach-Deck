import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { AppHeaderClient } from "@/components/app-header";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  // Server-side auth guard (§6 of Architecture)
  if (!user) {
    redirect("/login");
  }

  // Get current path to exempt /profile from the profile gate
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";
  const isProfilePage = pathname === "/profile" || pathname.startsWith("/profile/");

  // Profile gate: ensure user has completed their profile
  // Exception: allow access to /profile route for setup
  if (!isProfilePage) {
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });

    if (!profile) {
      redirect("/profile");
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-void)" }}>
      <AppHeaderClient userEmail={user.email ?? "User"} />
      
      {/* Main content */}
      <main className="px-4 sm:px-6 py-6">
        {children}
      </main>
    </div>
  );
}
