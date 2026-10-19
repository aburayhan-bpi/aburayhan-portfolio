import Security from "@/components/dashboard/pages/admin/Security/Security";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Security Console & DDoS Mitigation",
  description: "Enterprise rate limiting, Layer 7 WAF, and bot attack protection.",
};

export default function SecurityPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="h-8 w-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
        </div>
      }
    >
      <Security />
    </Suspense>
  );
}
