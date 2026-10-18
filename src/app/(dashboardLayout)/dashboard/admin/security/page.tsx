import Security from "@/components/dashboard/pages/admin/Security/Security";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Security Console & DDoS Mitigation",
  description: "Enterprise rate limiting, Layer 7 WAF, and bot attack protection.",
};

export default function SecurityPage() {
  return <Security />;
}
