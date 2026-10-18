import Analytics from "@/components/dashboard/pages/admin/Analytics/Analytics";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Visitor Analytics & Traffic Intelligence",
  description: "Real-time cookieless visitor intelligence and traffic breakdown.",
};

export default function AnalyticsPage() {
  return <Analytics />;
}
