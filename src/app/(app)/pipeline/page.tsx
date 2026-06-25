import type { Metadata } from "next";

import { PipelineView } from "@/features/contacts/components/pipeline-view";

export const metadata: Metadata = {
  title: "Pipeline",
};

export default function PipelinePage() {
  return (
    <main className="px-6 py-8 h-[calc(100vh-4rem)]">
      <PipelineView />
    </main>
  );
}
