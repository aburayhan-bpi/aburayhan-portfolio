import AdminHome from "@/components/dashboard/pages/admin/AdminHome/AdminHome";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Console | Md Abu Rayhan",
  description: "Administrative workspace and portfolio content management system",
};

export default function AdminPage() {
  return <AdminHome />;
}
