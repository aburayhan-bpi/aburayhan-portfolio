import ExperienceManagement from "@/components/dashboard/pages/admin/Experience/Experience";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Career & Education CMS | Admin Console",
  description: "Manage professional engineering timeline, roles, achievements, and educational credentials",
};

export default function AdminExperiencePage() {
  return <ExperienceManagement />;
}
