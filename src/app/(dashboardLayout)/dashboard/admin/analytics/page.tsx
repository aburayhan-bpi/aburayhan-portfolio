import Analytics from "@/components/dashboard/pages/admin/Analytics/Analytics";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Visitor Analytics & Traffic Intelligence",
  description: "Real-time cookieless visitor intelligence and traffic breakdown.",
};

export default function AnalyticsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-muted-foreground font-mono animate-pulse">
          Loading visitor analytics...
        </div>
      }
    >
      <Analytics />
    </Suspense>
  );
}

