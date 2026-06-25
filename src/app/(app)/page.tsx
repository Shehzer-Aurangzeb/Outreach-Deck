import type { Metadata } from "next";

import { TodayView } from "@/features/search/components/today-view";

export const metadata: Metadata = {
  title: "Today",
};

export default function TodayPage() {
  return (
    <main className="px-6 py-8">
      <TodayView />
    </main>
  );
}

