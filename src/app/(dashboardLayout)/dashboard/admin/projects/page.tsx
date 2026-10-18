import Projects from "@/components/dashboard/pages/admin/Projects/Projects";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects Management | Admin Console",
  description: "Manage portfolio projects, case studies, live demos and repositories",
};

export default function AdminProjectsPage() {
  return <Projects />;
}
