"use client";

import { AppConfirmDialog } from "@/components/shared/AppConfirmDialog";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Icons } from "@/utils/icons";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export interface AdminMessage {
  _id: string;
  name: string;
  email: string;
  projectType: string;
  message: string;
  isRead: boolean;
  isReplied?: boolean;
  repliedAt?: string;
  replyMessage?: string;
  createdAt: string;
  updatedAt: string;
}

const SMART_TEMPLATES = [
  {
    label: "💼 Schedule 15-min Call",
    text: "Hi {{name}},\n\nThank you for reaching out through my portfolio! I would love to learn more about the opportunity and your team. Would you be open to a brief 15-20 minute introductory call this week?\n\nPlease feel free to propose a few times that suit your schedule best.\n\nBest regards,\nMd Abu Rayhan\nFrontend Developer",
  },
  {
    label: "💻 Project Scope & Estimates",
    text: "Hi {{name}},\n\nThank you for contacting me regarding your {{projectType}} project! I've reviewed your brief and I'm very interested in helping bring this to life.\n\nCould you share a bit more detail on your target launch timeline and any specific technical requirements or UI preferences you have in mind?\n\nLooking forward to collaborating!\n\nBest regards,\nMd Abu Rayhan\nFrontend Developer",
  },
  {
    label: "🤝 General Inquiry Response",
    text: "Hi {{name}},\n\nThank you for your message! I've received your inquiry and wanted to acknowledge it right away.\n\nI will review the details and get back to you shortly. In the meantime, feel free to explore my latest live production case studies on my portfolio.\n\nWarm regards,\nMd Abu Rayhan\nFrontend Developer",
  },
];

export const Messages = () => {
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"all" | "unread" | "replied">(
    "all",
  );

  // Modal State for Viewing & Replying
  const [selectedMessage, setSelectedMessage] = useState<AdminMessage | null>(
    null,
  );
  const [replyText, setReplyText] = useState<string>("");
  const [replySubject, setReplySubject] = useState<string>("");
  const [isSendingReply, setIsSendingReply] = useState<boolean>(false);

  // Modal State for Delete Confirmation (Zero Native Alerts)
  const [messageToDelete, setMessageToDelete] = useState<AdminMessage | null>(
    null,
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/v1/messages");
      const resData = await res.json();
      if (res.ok && resData?.data) {
        setMessages(resData.data);
      } else {
        toast.error("Failed to refresh messages");
      }
    } catch {
      toast.error("Network error while refreshing");
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetch("/api/v1/messages")
      .then((res) => res.json())
      .then((resData) => {
        if (resData?.data) {
          setMessages(resData.data);
        }
      })
      .catch(() => {
        toast.error("Failed to load messages from server");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const handleOpenViewModal = async (msg: AdminMessage) => {
    setSelectedMessage(msg);
    setReplySubject(
      `Re: Inquiry regarding ${msg.projectType || "Project"} — Md Abu Rayhan`,
    );
    setReplyText("");

    // Auto mark as read if unread
    if (!msg.isRead) {
      try {
        await fetch("/api/v1/messages", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: msg._id, isRead: true }),
        });
        setMessages((prev) =>
          prev.map((m) => (m._id === msg._id ? { ...m, isRead: true } : m)),
        );
      } catch {
        // Silent catch for auto-read
      }
    }
  };

  const toggleReadStatus = async (msg: AdminMessage, e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = !msg.isRead;
    try {
      const res = await fetch("/api/v1/messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: msg._id, isRead: newStatus }),
      });
      if (res.ok) {
        setMessages((prev) =>
          prev.map((m) =>
            m._id === msg._id ? { ...m, isRead: newStatus } : m,
          ),
        );
        toast.success(newStatus ? "Marked as read" : "Marked as unread");
      }
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleApplyTemplate = (tpl: (typeof SMART_TEMPLATES)[0]) => {
    if (!selectedMessage) return;
    const personalized = tpl.text
      .replace(
        /{{name}}/g,
        selectedMessage.name.split(" ")[0] || selectedMessage.name,
      )
      .replace(
        /{{projectType}}/g,
        selectedMessage.projectType || "your project",
      );
    setReplyText(personalized);
  };

  const handleSendInAppReply = async () => {
    if (!selectedMessage || !replyText.trim()) {
      toast.error("Please enter a reply message first");
      return;
    }

    setIsSendingReply(true);
    try {
      const res = await fetch("/api/v1/messages/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messageId: selectedMessage._id,
          subject: replySubject,
          replyText: replyText.trim(),
        }),
      });

      const resData = await res.json();
      if (res.ok && resData.success) {
        toast.success(`Reply email delivered to ${selectedMessage.email}`);
        setMessages((prev) =>
          prev.map((m) =>
            m._id === selectedMessage._id
              ? {
                  ...m,
                  isRead: true,
                  isReplied: true,
                  repliedAt: new Date().toISOString(),
                  replyMessage: replyText.trim(),
                }
              : m,
          ),
        );
        setSelectedMessage(null);
      } else {
        toast.error(resData.error || "Failed to send email");
      }
    } catch {
      toast.error("Network error while sending reply");
    } finally {
      setIsSendingReply(false);
    }
  };

  const handleOpenInGmail = () => {
    if (!selectedMessage) return;
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
      selectedMessage.email,
    )}&su=${encodeURIComponent(replySubject)}&body=${encodeURIComponent(
      replyText || `Hi ${selectedMessage.name},\n\nThank you for reaching out!`,
    )}`;
    window.open(gmailUrl, "_blank", "noopener,noreferrer");

    // Also mark as replied locally
    fetch("/api/v1/messages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: selectedMessage._id, isRead: true }),
    });
  };

  const confirmDeleteMessage = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/messages?id=${id}`, {
        method: "DELETE",
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        toast.success("Inquiry permanently deleted from database");
        setMessages((prev) => prev.filter((m) => m._id !== id));
      } else {
        toast.error(resData.error || "Failed to delete message");
      }
    } catch {
      toast.error("Network error while deleting");
    }
  };

  // Filtered dataset
  const filteredMessages = messages.filter((m) => {
    const query = searchQuery.toLowerCase();
    const matchesQuery =
      m.name.toLowerCase().includes(query) ||
      m.email.toLowerCase().includes(query) ||
      m.projectType.toLowerCase().includes(query) ||
      m.message.toLowerCase().includes(query);

    if (!matchesQuery) return false;
    if (activeTab === "unread") return !m.isRead;
    if (activeTab === "replied") return !!m.isReplied;
    return true;
  });

  const unreadCount = messages.filter((m) => !m.isRead).length;
  const repliedCount = messages.filter((m) => m.isReplied).length;

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Link
              href="/dashboard/admin"
              className="text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
            >
              Admin
            </Link>
            <span className="text-xs text-muted-foreground">/</span>
            <span className="text-xs font-mono text-primary font-medium">
              Messages &amp; Leads
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Recruiter Leads &amp; Inquiries
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Read inbound client inquiries, track response status, and reply
            directly from your portfolio console.
          </p>
        </div>

        {/* Refresh & Stats Summary Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-border bg-card hover:bg-secondary text-foreground text-xs font-mono font-medium transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh Inquiries"
          >
            <Icons.RefreshCw
              className={`w-3.5 h-3.5 text-primary ${
                isRefreshing ? "animate-spin" : ""
              }`}
            />
            <span>Refresh</span>
          </button>

          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-border bg-card">
            <span className="h-2 w-2 rounded-full bg-primary" />
            <span className="text-xs font-mono text-foreground font-semibold">
              {messages.length} Total
            </span>
          </div>
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-border bg-card">
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-xs font-mono text-amber-500 font-semibold">
              {unreadCount} Unread
            </span>
          </div>
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-border bg-card">
            <span className="h-2 w-2 rounded-full bg-success" />
            <span className="text-xs font-mono text-success font-semibold">
              {repliedCount} Replied
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-secondary/60 rounded-xl border border-border w-fit">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
              activeTab === "all"
                ? "bg-primary text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            All ({messages.length})
          </button>
          <button
            onClick={() => setActiveTab("unread")}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
              activeTab === "unread"
                ? "bg-primary text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            Unread ({unreadCount})
          </button>
          <button
            onClick={() => setActiveTab("replied")}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
              activeTab === "replied"
                ? "bg-primary text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            Replied ({repliedCount})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by recruiter, email, project..."
            className="pl-9 bg-card border-border text-xs text-foreground placeholder:text-muted-foreground h-10 rounded-xl"
          />
        </div>
      </div>

      {/* Inquiries Table / Cards Container */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
            <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-mono">
              Loading recruiter leads from database...
            </span>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <Icons.Mail className="w-10 h-10 mx-auto mb-3 opacity-40 text-primary" />
            <p className="text-sm font-medium text-foreground">
              No inquiries match your criteria
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              New submissions from the portfolio contact form will automatically
              arrive here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-secondary/40 text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold">
                    Sender &amp; Contact
                  </th>
                  <th className="py-3.5 px-4 font-semibold">
                    Project Category
                  </th>
                  <th className="py-3.5 px-4 font-semibold">Message Preview</th>
                  <th className="py-3.5 px-4 font-semibold">Received</th>
                  <th className="py-3.5 px-4 font-semibold text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredMessages.map((msg) => {
                  const initials = msg.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();

                  return (
                    <tr
                      key={msg._id}
                      onClick={() => handleOpenViewModal(msg)}
                      className={`group transition-colors hover:bg-secondary/30 cursor-pointer ${
                        !msg.isRead ? "bg-primary/5" : ""
                      }`}
                    >
                      {/* Status Badges */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {!msg.isRead && (
                            <span
                              className="h-2 w-2 rounded-full bg-primary shrink-0 animate-pulse"
                              title="Unread"
                            />
                          )}
                          {msg.isReplied ? (
                            <Badge
                              variant="outline"
                              className="bg-success/10 text-success border-success/30 font-mono text-[10px]"
                            >
                              ✓ Replied
                            </Badge>
                          ) : !msg.isRead ? (
                            <Badge
                              variant="outline"
                              className="bg-primary/10 text-primary border-primary/30 font-mono text-[10px]"
                            >
                              New
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="bg-secondary text-muted-foreground border-border font-mono text-[10px]"
                            >
                              Read
                            </Badge>
                          )}
                        </div>
                      </td>

                      {/* Sender Info */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                            {initials || "RE"}
                          </div>
                          <div>
                            <div className="font-semibold text-foreground group-hover:text-primary transition-colors text-xs">
                              {msg.name}
                            </div>
                            <div className="text-[11px] font-mono text-muted-foreground mt-0.5">
                              {msg.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Project Category */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="text-[11px] font-mono bg-secondary/80 px-2 py-0.5 rounded-md border border-border/70 text-foreground">
                          {msg.projectType || "General"}
                        </span>
                      </td>

                      {/* Message Preview */}
                      <td className="py-4 px-4 max-w-xs">
                        <p className="text-xs text-muted-foreground line-clamp-1 group-hover:text-foreground transition-colors">
                          {msg.message}
                        </p>
                      </td>

                      {/* Received Date */}
                      <td className="py-4 px-4 whitespace-nowrap text-[11px] font-mono text-muted-foreground">
                        {new Date(msg.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => toggleReadStatus(msg, e)}
                            className="p-1.5 rounded-lg border border-border hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                            title={msg.isRead ? "Mark unread" : "Mark read"}
                          >
                            <Icons.CheckCircle
                              className={`w-3.5 h-3.5 ${msg.isRead ? "text-primary" : ""}`}
                            />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenViewModal(msg);
                            }}
                            className="p-1.5 rounded-lg border border-border hover:bg-primary/10 hover:border-primary/30 text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                            title="Read & Reply"
                          >
                            <Icons.Mail className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setMessageToDelete(msg);
                            }}
                            className="p-1.5 rounded-lg border border-border hover:bg-destructive/10 hover:border-destructive/30 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                            title="Delete Inquiry"
                          >
                            <Icons.Trash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* Smart Inquiry Reader & Direct In-App Email Reply Dialog Modal             */}
      {/* Strictly responsive with fixed header, scrollable body, and fixed footer   */}
      {/* ========================================================================= */}
      <Dialog
        open={!!selectedMessage}
        onOpenChange={(open) => !open && setSelectedMessage(null)}
      >
        <DialogContent className="max-w-2xl bg-card border border-border text-foreground sm:rounded-2xl p-0 flex flex-col max-h-[calc(100dvh-2rem)] sm:max-h-[88vh] overflow-hidden shadow-2xl">
          {/* Pinned Sticky Header */}
          <DialogHeader className="p-5 sm:p-6 pb-4 border-b border-border shrink-0 bg-card z-10 text-left">
            <div className="flex items-start justify-between gap-3">
              <div>
                <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                  <span>Inquiry from {selectedMessage?.name}</span>
                  {selectedMessage?.isReplied && (
                    <Badge
                      variant="outline"
                      className="bg-success/10 text-success border-success/30 font-mono text-[10px]"
                    >
                      Replied ✓
                    </Badge>
                  )}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-1 flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-primary">
                    {selectedMessage?.email}
                  </span>
                  <span>•</span>
                  <span>
                    Category: <strong>{selectedMessage?.projectType}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Received:{" "}
                    {selectedMessage?.createdAt
                      ? new Date(selectedMessage.createdAt).toLocaleString()
                      : ""}
                  </span>
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Scrollable Modal Body */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
            {/* Original Inbound Message Card */}
            <div className="space-y-2">
              <label className="block text-xs font-mono text-muted-foreground uppercase tracking-wider">
                Original Message
              </label>
              <div className="rounded-xl border border-border bg-secondary/30 p-4.5 text-xs text-foreground leading-relaxed whitespace-pre-wrap select-text">
                {selectedMessage?.message}
              </div>
            </div>

            {/* Previous Reply Notice if already replied */}
            {selectedMessage?.isReplied && selectedMessage?.replyMessage && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-success font-semibold flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-success" />
                    Sent Reply
                  </span>
                  <span className="text-muted-foreground text-[11px]">
                    {selectedMessage.repliedAt
                      ? new Date(selectedMessage.repliedAt).toLocaleString()
                      : ""}
                  </span>
                </div>
                <div className="rounded-xl border border-success/30 bg-success/5 p-4 text-xs text-foreground/90 whitespace-pre-wrap leading-relaxed">
                  {selectedMessage.replyMessage}
                </div>
              </div>
            )}

            {/* Smart 1-Click Templates */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-mono text-muted-foreground uppercase tracking-wider">
                  Smart Response Templates
                </label>
                <span className="text-[11px] font-mono text-muted-foreground">
                  Click to insert
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {SMART_TEMPLATES.map((tpl, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleApplyTemplate(tpl)}
                    className="px-3 py-1.5 rounded-lg border border-border/80 bg-secondary/50 hover:bg-secondary text-foreground hover:text-foreground text-xs font-mono transition-colors cursor-pointer"
                  >
                    {tpl.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Reply Subject */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-muted-foreground">
                Email Subject
              </label>
              <Input
                type="text"
                value={replySubject}
                onChange={(e) => setReplySubject(e.target.value)}
                placeholder="Re: Project Inquiry — Md Abu Rayhan"
                className="w-full bg-secondary/40 border-border text-xs text-foreground placeholder:text-muted-foreground h-10 rounded-xl"
              />
            </div>

            {/* Reply Textarea */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-muted-foreground">
                Compose Reply to {selectedMessage?.name} (via
                aburayhan.bpi@gmail.com)
              </label>
              <Textarea
                rows={5}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={`Hi ${selectedMessage?.name.split(" ")[0] || ""},\n\nThank you for reaching out! ...`}
                className="w-full bg-secondary/40 border-border text-xs text-foreground placeholder:text-muted-foreground resize-none rounded-xl"
              />
            </div>
          </div>

          {/* Pinned Sticky Footer */}
          <div className="p-4 sm:p-5 border-t border-border bg-card/95 backdrop-blur-xs flex items-center justify-between gap-3 shrink-0 z-10 flex-wrap">
            {/* Quick Gmail Web Option */}
            <button
              type="button"
              onClick={handleOpenInGmail}
              className="px-3.5 py-2.5 rounded-xl border border-border bg-secondary/50 hover:bg-secondary text-foreground hover:text-foreground text-xs font-medium transition-colors cursor-pointer inline-flex items-center gap-1.5"
              title="Open draft in Gmail web app"
            >
              <Icons.ExternalLink className="w-3.5 h-3.5 text-primary" />
              <span>Open in Gmail Web</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedMessage(null)}
                className="px-4 py-2.5 rounded-xl border border-border bg-secondary/50 hover:bg-secondary text-foreground hover:text-foreground text-xs font-medium transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                disabled={isSendingReply || !replyText.trim()}
                onClick={handleSendInAppReply}
                className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark disabled:opacity-50 text-white text-xs font-medium transition-all shadow-md shadow-primary/20 cursor-pointer inline-flex items-center gap-2"
              >
                {isSendingReply ? (
                  <>
                    <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Sending via SMTP...</span>
                  </>
                ) : (
                  <>
                    <Icons.Mail className="w-3.5 h-3.5" />
                    <span>Send In-App Email Reply</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* Permanent Delete Confirmation Dialog (Zero Native Browser Alerts)         */}
      {/* ========================================================================= */}
      <AppConfirmDialog
        isOpen={!!messageToDelete}
        onOpenChange={(open) => !open && setMessageToDelete(null)}
        title="Delete Inquiry Confirmation"
        description={`Are you sure you want to permanently delete the inquiry from "${messageToDelete?.name || ""}" (${messageToDelete?.email || ""})? This document will be completely removed from MongoDB Atlas.`}
        confirmText="Confirm Delete"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={() => {
          if (messageToDelete) {
            confirmDeleteMessage(messageToDelete._id);
            setMessageToDelete(null);
          }
        }}
      />
    </div>
  );
};

export default Messages;
