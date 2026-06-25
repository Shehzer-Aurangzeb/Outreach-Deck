import type { Metadata } from "next";

import { CompaniesView } from "@/features/companies/components/companies-view";

export const metadata: Metadata = {
  title: "Companies",
};

export default function CompaniesPage() {
  return <CompaniesView />;
}
