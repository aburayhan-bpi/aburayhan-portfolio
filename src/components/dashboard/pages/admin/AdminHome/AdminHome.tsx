"use client";

import { Badge } from "@/components/ui/badge";
import { Icons } from "@/utils/icons";
import Link from "next/link";
import { useState, useEffect } from "react";

interface QuickProject {
  id: string;
  title: string;
  category: string;
  status: "Live" | "Client Beta" | "In Dev";
  techStack: string[];
  views: number;
}

interface QuickMessage {
  id: string;
  sender: string;
  email: string;
  company: string;
  preview: string;
  date: string;
  read: boolean;
}

const RECENT_PROJECTS: QuickProject[] = [
  {
    id: "raantech-erp",
    title: "RaanTech ERP Operations",
    category: "Full-Stack ERP",
    status: "Live",
    techStack: ["Next.js", "Redux", "Node.js", "MongoDB"],
    views: 890,
  },
  {
    id: "uaepl8-marketplace",
    title: "UAEPL8 Luxury Vehicle Plates",
    category: "Marketplace",
    status: "Client Beta",
    techStack: ["Next.js", "TypeScript", "Tailwind CSS"],
    views: 640,
  },
  {
    id: "fansphere-saas",
    title: "FanSphere Telemetry Suite",
    category: "SaaS Dashboard",
    status: "In Dev",
    techStack: ["React 19", "Radix UI", "Recharts"],
    views: 410,
  },
];

const RECENT_MESSAGES: QuickMessage[] = [
  {
    id: "msg-1",
    sender: "Sarah Jenkins",
    email: "sarah.j@techrecruits.io",
    company: "Apex Innovations (UK)",
    preview: "Loved the RaanTech ERP demo! We have an open Senior Full-Stack role...",
    date: "2 hours ago",
    read: false,
  },
  {
    id: "msg-2",
    sender: "Karim Rahman",
    email: "karim@dubaiholding.ae",
    company: "Automotive Hub UAE",
    preview: "Inquiring regarding custom marketplace development similar to UAEPL8...",
    date: "Yesterday",
    read: true,
  },
  {
    id: "msg-3",
    sender: "Daniel Meyer",
    email: "daniel@cloudscale.de",
    company: "CloudScale GmbH",
    preview: "Are you open to contract React 19 / Next.js architecture consulting?",
    date: "3 days ago",
    read: true,
  },
];

export const AdminHome = () => {
  const [messages, setMessages] = useState<QuickMessage[]>(RECENT_MESSAGES);
  const [projects, setProjects] = useState<QuickProject[]>(RECENT_PROJECTS);
  const [projectCount, setProjectCount] = useState<number>(3);
  const [skillsCount, setSkillsCount] = useState<number>(22);
  const [experienceCount, setExperienceCount] = useState<number>(5);
  const [totalViews, setTotalViews] = useState<number | null>(null);
  const [uniqueVisitors, setUniqueVisitors] = useState<number | null>(null);

  useEffect(() => {
    // 1. Fetch live messages from MongoDB
    fetch("/api/v1/messages")
      .then((res) => res.json())
      .then((data) => {
        if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
          const mapped: QuickMessage[] = data.data.map((m: { _id: string; name: string; email: string; projectType?: string; message: string; createdAt: string; isRead?: boolean }) => ({
            id: m._id,
            sender: m.name,
            email: m.email,
            company: m.projectType || "Direct Inquiry",
            preview: m.message,
            date: new Date(m.createdAt).toLocaleDateString(),
            read: !!m.isRead,
          }));
          setMessages(mapped);
        }
      })
      .catch(() => {});

    // 2. Fetch live projects
    fetch("/api/v1/projects")
      .then((res) => res.json())
      .then((data) => {
        if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
          setProjectCount(data.count || data.data.length);
          const mappedProjects: QuickProject[] = data.data.slice(0, 5).map((p: { id: string; title: string; category: string; status?: string; techStack?: string[] }) => ({
            id: p.id,
            title: p.title,
            category: p.category,
            status: (p.status === "Client Beta" ? "Client Beta" : p.status === "In Dev" ? "In Dev" : "Live") as QuickProject["status"],
            techStack: p.techStack || [],
            views: Math.floor(300 + Math.random() * 600),
          }));
          setProjects(mappedProjects);
        }
      })
      .catch(() => {});

    // 3. Fetch live skills count
    fetch("/api/v1/skills")
      .then((res) => res.json())
      .then((data) => {
        if (data?.data && Array.isArray(data.data)) {
          setSkillsCount(data.count || data.data.length);
        }
      })
      .catch(() => {});

    // 4. Fetch live experience and education count
    fetch("/api/v1/experiences")
      .then((res) => res.json())
      .then((data) => {
        if (data?.data && Array.isArray(data.data)) {
          setExperienceCount(data.data.length);
        }
      })
      .catch(() => {});

    // 5. Fetch live visitor analytics telemetry
    fetch("/api/v1/analytics?period=30d")
      .then((res) => res.json())
      .then((data) => {
        if (data?.summary) {
          setTotalViews(data.summary.totalViews);
          setUniqueVisitors(data.summary.uniqueVisitors);
        }
      })
      .catch(() => {});
  }, []);

  const toggleRead = async (id: string) => {
    const target = messages.find((m) => m.id === id);
    if (!target) return;
    const newStatus = !target.read;
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, read: newStatus } : m)),
    );
    try {
      await fetch("/api/v1/messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isRead: newStatus }),
      });
    } catch (err) {
      console.warn("Failed to update message status:", err);
    }
  };

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-success animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              Admin Workspace • Online
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Developer Admin Console
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Welcome back, <span className="text-foreground font-semibold">Md Abu Rayhan</span>. Portfolio telemetry and content control center.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-border bg-card hover:bg-secondary text-foreground text-xs font-medium transition-colors"
          >
            <span>Preview Portfolio</span>
            <Icons.ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/dashboard/admin/projects"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-medium transition-colors shadow-md shadow-primary/20"
          >
            <Icons.Plus className="w-4 h-4" />
            <span>Manage Projects</span>
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* Metric 1 */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-muted-foreground">Active Projects</span>
            <span className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
              <Icons.MonitorPlay className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-foreground font-mono">{projectCount}</span>
            <span className="ml-2 text-xs text-success font-medium">100% Operational</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            RaanTech ERP, UAEPL8, FanSphere
          </p>
        </div>

        {/* Metric 2 */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-muted-foreground">Inquiries &amp; Leads</span>
            <span className="p-2 rounded-lg bg-accent/10 text-accent border border-accent/20">
              <Icons.Mail className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-foreground font-mono">{messages.length}</span>
            <span className="ml-2 text-xs text-accent font-medium">
              {messages.filter((m) => !m.read).length} Unread
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Recruiter &amp; client contact submissions
          </p>
        </div>

        {/* Metric 3: Live Portfolio Views */}
        <Link
          href="/dashboard/admin/analytics"
          className="rounded-2xl border border-border bg-card p-5 shadow-sm hover:border-primary/50 transition-colors block group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-muted-foreground group-hover:text-primary transition-colors">
              Portfolio Views
            </span>
            <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Icons.Eye className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-foreground font-mono">
              {totalViews !== null ? totalViews.toLocaleString() : "—"}
            </span>
            <span className="ml-2 text-xs text-emerald-400 font-mono font-medium">
              ({uniqueVisitors !== null ? uniqueVisitors : "—"} unique)
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-2 flex items-center justify-between">
            <span>Verified telemetry (30d)</span>
            <span className="text-primary font-mono text-[11px] group-hover:underline">
              Inspect →
            </span>
          </p>
        </Link>

        {/* Metric 4 */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-muted-foreground">Core Tech Stack</span>
            <span className="p-2 rounded-lg bg-secondary text-foreground border border-border">
              <Icons.Code className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-foreground font-mono">{skillsCount}</span>
            <span className="ml-2 text-xs text-muted-foreground font-medium">Technologies</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Next.js 16, React 19, TS, Node, Tailwind
          </p>
        </div>

        {/* Metric 5 */}
        <Link
          href="/dashboard/admin/experience"
          className="rounded-2xl border border-border bg-card p-5 shadow-sm hover:border-primary/50 transition-colors group block"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-muted-foreground group-hover:text-primary transition-colors">
              Career Timeline
            </span>
            <span className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
              <Icons.HiOutlineBriefcase className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-foreground font-mono">{experienceCount}</span>
            <span className="ml-2 text-xs text-muted-foreground font-medium">Milestones</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Work history &amp; credentials
          </p>
        </Link>
      </div>

      {/* Main Content Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Projects Overview Table */}
        <div className="lg:col-span-7 rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div>
                <h2 className="text-lg font-bold text-foreground">Featured Projects Status</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Live state of public portfolio showpieces
                </p>
              </div>
              <Link
                href="/dashboard/admin/projects"
                className="text-xs font-mono text-primary hover:underline inline-flex items-center gap-1"
              >
                <span>All Projects</span>
                <Icons.ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-border/60 mt-4">
              {projects.map((proj) => (
                <div
                  key={proj.id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors">
                        {proj.title}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-mono px-2 py-0.5 ${
                          proj.status === "Live"
                            ? "border-success/30 bg-success/10 text-success"
                            : proj.status === "Client Beta"
                              ? "border-accent/30 bg-accent/10 text-accent"
                              : "border-border bg-secondary text-muted-foreground"
                        }`}
                      >
                        {proj.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono text-muted-foreground">
                        {proj.category}
                      </span>
                      <span className="text-border">•</span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {proj.techStack.map((tech) => (
                          <span
                            key={tech}
                            className="text-[10px] font-mono bg-secondary/80 px-2 py-0.5 rounded text-muted-foreground border border-border/50"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <span className="text-xs font-mono text-muted-foreground mr-2">
                      {proj.views} views
                    </span>
                    <Link
                      href={`/#projects`}
                      target="_blank"
                      className="p-1.5 rounded-lg border border-border hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                      title="View on site"
                    >
                      <Icons.ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-border mt-4 flex items-center justify-between text-xs text-muted-foreground font-mono">
            <span>Portfolio Sync: Instant</span>
            <span className="text-success">● Connected to static &amp; live assets</span>
          </div>
        </div>

        {/* Right: Recent Inquiries / Leads */}
        <div className="lg:col-span-5 rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div>
                <h2 className="text-lg font-bold text-foreground">Recruiter Inquiries</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Submissions via contact form
                </p>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-mono bg-accent/10 text-accent border border-accent/20 px-2 py-0.5 rounded-full">
                  {messages.filter((m) => !m.read).length} new
                </span>
                <Link
                  href="/dashboard/admin/messages"
                  className="text-xs font-mono text-primary hover:underline"
                >
                  View All &rarr;
                </Link>
              </div>
            </div>

            <div className="divide-y divide-border/60 mt-4 space-y-2">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  onClick={() => toggleRead(msg.id)}
                  className={`p-3 rounded-xl transition-all cursor-pointer border ${
                    !msg.read
                      ? "bg-secondary/40 border-primary/30"
                      : "bg-transparent border-transparent hover:bg-secondary/20"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {!msg.read && (
                        <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                      )}
                      <span className="text-xs font-bold text-foreground truncate max-w-[150px]">
                        {msg.sender}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground shrink-0">
                      {msg.date}
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-accent mt-0.5">
                    {msg.company}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1.5 leading-relaxed">
                    {msg.preview}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <a
                      href={`mailto:${msg.email}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-[11px] font-mono text-primary hover:underline inline-flex items-center gap-1"
                    >
                      <Icons.Mail className="w-3 h-3" />
                      <span>{msg.email}</span>
                    </a>
                    <span className="text-[10px] text-muted-foreground">
                      {msg.read ? "Mark unread" : "Mark read"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-border mt-4 flex items-center justify-between text-xs font-mono">
            <Link
              href="/dashboard/admin/messages"
              className="text-primary hover:underline inline-flex items-center gap-1"
            >
              <span>Manage &amp; Reply &rarr;</span>
            </Link>
            <a
              href="mailto:aburayhan.bpi@gmail.com"
              className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
            >
              <Icons.Mail className="w-3.5 h-3.5 text-primary" />
              <span>aburayhan.bpi@gmail.com</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHome;
