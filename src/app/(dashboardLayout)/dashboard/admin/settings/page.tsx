import Settings from "@/components/dashboard/pages/admin/Settings/Settings";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Site Settings & Profile | Admin Console",
  description: "Configure portfolio profile, live availability, resume, and admin security",
};

export default function AdminSettingsPage() {
  return <Settings />;
}
