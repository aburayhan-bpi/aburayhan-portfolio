import Skills from "@/components/dashboard/pages/admin/Skills/Skills";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Skills & Stack CMS | Admin Console",
  description: "Manage technical engineering skills, stack proficiencies, and categories",
};

export default function AdminSkillsPage() {
  return <Skills />;
}
