import Messages from "@/components/dashboard/pages/admin/Messages/Messages";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Messages & Leads | Admin Console",
  description: "Read, track, and reply to client inquiries and recruiter leads",
};

export default function AdminMessagesPage() {
  return <Messages />;
}
