"use client";

import Image from "next/image";
import HeaderTitle from "@/components/shared/HeaderTitle";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/utils/icons";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface ProjectItem {
  id: string;
  title: string;
  badge: string;
  category: "Full-Stack ERP" | "Marketplace" | "SaaS Dashboard";
  mockUrl: string;
  tagline: string;
  description: string;
  keyFeatures: string[];
  techStack: string[];
  liveUrl?: string;
  githubUrl?: string;
  isPrivateRepo?: boolean;
  imageUrl?: string;
}

const REAL_PROJECTS: ProjectItem[] = [
  {
    id: "raantech-erp",
    title: "RaanTech — Business Operations ERP",
    badge: "Active Development",
    category: "Full-Stack ERP",
    mockUrl: "https://raantech-erp.app/dashboard",
    tagline: "End-to-End Enterprise Resource & Inventory Management Platform",
    description:
      "A comprehensive full-stack ERP architecture engineered to manage inventory, procurement, sales workflows, customer lifecycle, finances, and multi-branch staff administration.",
    keyFeatures: [
      "Product, supplier & purchase tracking with high-speed CSV/Excel data import & export.",
      "Complete customer order lifecycle: returns, refunds, cancellations & automated email notifications.",
      "Granular role-based staff administration (RBAC), audit activity logs & soft-delete data recovery.",
    ],
    techStack: ["Next.js", "TypeScript", "Redux Toolkit", "Node.js", "MongoDB", "Express.js"],
    liveUrl: "https://raantech-demo.dev",
    githubUrl: "https://github.com",
    isPrivateRepo: false,
  },
  {
    id: "uaepl8-marketplace",
    title: "UAEPL8 — Premium Vehicle Plate Marketplace",
    badge: "Client Production",
    category: "Marketplace",
    mockUrl: "https://uaepl8.ae/marketplace",
    tagline: "High-Ticket Automotive Luxury Marketplace for the UAE",
    description:
      "Engineered for high-net-worth clients in the United Arab Emirates to discover, value, and trade premium vehicle registration plates with real-time valuation algorithms and VIP sourcing.",
    keyFeatures: [
      "Multi-facet search & filtering engine by Emirate, digit length, customized letters & plate code.",
      "Automated dynamic plate valuation models and VIP custom plate sourcing requests.",
      "Dedicated buyer & seller interfaces with real-time offer negotiation and admin approvals.",
    ],
    techStack: ["Next.js", "TypeScript", "Redux Toolkit", "Tailwind CSS", "Zod", "Framer Motion"],
    liveUrl: "https://uaepl8.ae",
    githubUrl: "https://github.com",
    isPrivateRepo: true,
  },
  {
    id: "fansphere-saas",
    title: "FanSphere — SaaS-Ready Admin Dashboard",
    badge: "Enterprise Template",
    category: "SaaS Dashboard",
    mockUrl: "https://fansphere.io/admin",
    tagline: "Modular Enterprise Console for Analytics, Marketplaces & Events",
    description:
      "A production-ready, modular dashboard foundation built with reusable component architecture, high-density analytics charts, and strict TypeScript contracts.",
    keyFeatures: [
      "Modular dashboard architecture featuring 30+ reusable UI components and shared design tokens.",
      "Role-Based Access Control (RBAC) with secure session handling and protected route wrappers.",
      "Interactive telemetry charts, paginated data tables, dialog modals, and API-ready RTK hooks.",
    ],
    techStack: ["Next.js", "React 19", "Redux Toolkit", "Radix UI", "Recharts", "Framer Motion"],
    liveUrl: "https://fansphere.dev",
    githubUrl: "https://github.com",
    isPrivateRepo: true,
  },
];

export const ProjectsSection = () => {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [projects, setProjects] = useState<ProjectItem[]>(REAL_PROJECTS);
  const { settings } = useSiteSettings();

  useEffect(() => {
    fetch("/api/v1/projects")
      .then((res) => res.json())
      .then((data) => {
        if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
          const mapped: ProjectItem[] = data.data.map((p: {
            id: string;
            title: string;
            status?: string;
            category: "Full-Stack ERP" | "Marketplace" | "SaaS Dashboard";
            mockUrl?: string;
            tagline: string;
            description: string;
            keyFeatures?: string[];
            techStack?: string[];
            liveUrl?: string;
            githubUrl?: string;
            isPrivateRepo?: boolean;
            imageUrl?: string;
          }) => ({
            id: p.id,
            title: p.title,
            badge: p.status === "Live" ? "Active Development" : (p.status || "Live"),
            category: p.category,
            mockUrl: p.mockUrl || `https://${p.id}.app`,
            tagline: p.tagline,
            description: p.description,
            keyFeatures: p.keyFeatures || [],
            techStack: p.techStack || [],
            liveUrl: p.liveUrl,
            githubUrl: p.githubUrl,
            isPrivateRepo: !!p.isPrivateRepo,
            imageUrl: p.imageUrl,
          }));
          setProjects(mapped);
        }
      })
      .catch((err) => {
        console.warn("Using default static projects cache:", err);
      });
  }, []);

  const categories = ["All", "Full-Stack ERP", "Marketplace", "SaaS Dashboard"];

  const trackProjectClick = (projectId: string, action: string) => {
    try {
      const timeZone =
        typeof Intl !== "undefined"
          ? Intl.DateTimeFormat().resolvedOptions().timeZone
          : "";
      const payload = JSON.stringify({
        path: `/projects/${projectId}`,
        referrer: `Project Action: ${action}`,
        timeZone,
      });

      if (typeof fetch !== "undefined") {
        fetch("/api/v1/analytics/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload,
          keepalive: true,
        }).catch(() => {});
      } else if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
        navigator.sendBeacon(
          "/api/v1/analytics/track",
          new Blob([payload], { type: "application/json" }),
        );
      }
    } catch {}
  };

  const filteredProjects =
    activeCategory === "All"
      ? projects
      : projects.filter((p) => p.category === activeCategory);

  return (
    <section id="projects" className="py-16 md:py-24 relative">
      <div className="customContainer mx-auto px-4 sm:px-6 lg:px-8">
        <HeaderTitle
          title="Featured Engineering Projects"
          subtitle="Real-world production applications, enterprise platforms, and client systems."
          titleColor="white"
          titleSize="xl"
          alignment="center"
          subtitleClassName="text-muted-foreground"
        />

        {/* Filter Pills */}
        <div className="flex items-center justify-center gap-2 mt-6 mb-12 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-4 py-1.5 text-xs font-mono font-medium transition-all ${
                activeCategory === cat
                  ? "bg-primary text-white shadow-lg shadow-primary/25 border border-primary"
                  : "border border-border/80 bg-card/60 text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Projects Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project, idx) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: idx * 0.1 }}
              className="group flex flex-col justify-between rounded-2xl border border-border bg-card/70 overflow-hidden backdrop-blur-md transition-all hover:border-primary/60 hover:bg-card hover:shadow-2xl hover:shadow-black/70"
            >
              {/* Window Frame Mockup Header */}
              <div className="border-b border-border bg-secondary/50 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500/70 inline-block" />
                  <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/70 inline-block" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70 inline-block" />
                </div>
                {/* Mock Address Bar */}
                <div className="rounded bg-black/40 px-3 py-0.5 text-[10px] font-mono text-muted-foreground/80 truncate max-w-[210px]">
                  {project.mockUrl}
                </div>
                <div className="h-2.5 w-2.5 opacity-0" />
              </div>

              {/* ⭐ Realistic Visual Application Interface Preview / Cloudinary Screenshot */}
              {project.imageUrl ? (
                <div className="h-44 w-full border-b border-border/80 relative overflow-hidden bg-background">
                  <Image
                    src={project.imageUrl}
                    alt={project.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              ) : project.id === "raantech-erp" ? (
                <div className="h-44 bg-background border-b border-border/80 p-3.5 flex flex-col justify-between font-mono text-[10px] select-none relative overflow-hidden">
                  <div className="flex items-center justify-between pb-2 border-b border-border/60">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-primary" />
                      <span className="font-semibold text-foreground text-[11px]">RaanTech Business Suite</span>
                    </div>
                    <span className="text-success bg-success/10 px-1.5 py-0.5 rounded text-[9px] border border-success/20">
                      Live Sync
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 my-1">
                    <div className="bg-secondary/40 rounded p-1.5 border border-border/60">
                      <span className="text-muted-foreground block text-[9px]">Inventory Value</span>
                      <span className="text-foreground font-bold text-[11px]">৳ 1,480,200</span>
                    </div>
                    <div className="bg-secondary/40 rounded p-1.5 border border-border/60">
                      <span className="text-muted-foreground block text-[9px]">Orders Fulfilled</span>
                      <span className="text-success font-bold text-[11px]">99.2%</span>
                    </div>
                    <div className="bg-secondary/40 rounded p-1.5 border border-border/60">
                      <span className="text-muted-foreground block text-[9px]">Suppliers</span>
                      <span className="text-accent font-bold text-[11px]">48 Verified</span>
                    </div>
                  </div>
                  <div className="bg-background/80 rounded p-2 border border-border/60 flex items-center justify-between text-[9.5px]">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground font-mono">SKU-8921</span>
                      <span className="text-foreground truncate max-w-[130px]">Enterprise Server Node</span>
                    </div>
                    <span className="text-success bg-success/10 px-1.5 py-0.5 rounded text-[9px]">In Stock [240]</span>
                  </div>
                </div>
              ) : project.id === "uaepl8-marketplace" ? (
                <div className="h-44 bg-gradient-to-br from-background via-card to-secondary/30 border-b border-border/80 p-3.5 flex flex-col justify-between font-mono select-none relative overflow-hidden">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-muted-foreground">VIP Number Plate Auction</span>
                    <span className="text-accent bg-accent/10 px-1.5 py-0.5 rounded text-[9px] border border-accent/20">
                      Dubai RTA Verified
                    </span>
                  </div>
                  {/* Luxury UAE Embossed Plate Mockup */}
                  <div className="mx-auto my-1 flex items-center bg-soft-white text-black px-6 py-2 rounded-lg border-2 border-accent/80 shadow-lg shadow-black/40">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-center border-r border-black/30 pr-3 leading-none">
                        <span className="font-sans font-black text-[12px] tracking-wider text-destructive">DUBAI</span>
                        <span className="text-[8.5px] font-bold text-black/70">دبي</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <span className="font-sans font-black text-xl text-black">D</span>
                        <span className="font-sans font-extrabold text-2xl tracking-tight text-black">7</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[10px] bg-secondary/40 rounded px-2.5 py-1.5 border border-border/60">
                    <span className="text-muted-foreground">Market Valuation:</span>
                    <span className="text-success font-bold text-[11px]">AED 1,450,000</span>
                  </div>
                </div>
              ) : project.id === "fansphere-saas" ? (
                <div className="h-44 bg-background border-b border-border/80 p-3.5 flex flex-col justify-between font-mono text-[10px] select-none relative overflow-hidden">
                  <div className="flex items-center justify-between pb-2 border-b border-border/60">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-primary" />
                      <span className="font-semibold text-foreground text-[11px]">FanSphere Telemetry Suite</span>
                    </div>
                    <span className="text-accent bg-accent/10 px-1.5 py-0.5 rounded text-[9px] border border-accent/20">
                      Uptime 99.98%
                    </span>
                  </div>
                  {/* Live Telemetry Bar Charts Mockup */}
                  <div className="flex items-end justify-between gap-1.5 h-16 px-2 my-1 bg-background/80 rounded border border-border/60 pt-2">
                    {[45, 65, 85, 55, 95, 75, 100, 80, 90, 70, 85, 95].map((val, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                        <div
                          className="w-full rounded-t bg-gradient-to-t from-primary to-accent opacity-85"
                          style={{ height: `${val}%` }}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-[9.5px] text-muted-foreground px-1">
                    <span>Throughput: <strong className="text-foreground">14.2k req/s</strong></span>
                    <span>P99 Latency: <strong className="text-success">38ms</strong></span>
                  </div>
                </div>
              ) : (
                <div className="h-44 bg-background border-b border-border/80 p-4 flex flex-col items-center justify-center text-center font-mono text-xs text-muted-foreground select-none relative overflow-hidden">
                  <div className="rounded-full bg-primary/10 border border-primary/20 p-3 mb-2 text-primary">
                    <Icons.Code className="h-6 w-6" />
                  </div>
                  <span className="font-semibold text-foreground text-xs">{project.title}</span>
                  <span className="text-[10px] text-muted-foreground/80 mt-1">{project.category}</span>
                </div>
              )}

              {/* Card Body */}
              <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
                <div>
                  {/* Category & Status Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <Badge
                      variant="outline"
                      className="border-primary/30 bg-primary/10 text-primary font-mono text-[11px] px-2.5 py-0.5"
                    >
                      {project.category}
                    </Badge>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 border border-success/30 px-2.5 py-0.5 text-[10px] font-mono text-success">
                      <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                      {project.badge}
                    </span>
                  </div>

                  {/* Title & Tagline */}
                  <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors mb-2">
                    {project.title}
                  </h3>
                  <p className="text-xs font-mono text-accent mb-3">
                    {project.tagline}
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                    {project.description}
                  </p>

                  {/* Bullet Highlights */}
                  <div className="space-y-2 mb-6 rounded-xl border border-border/60 bg-secondary/30 p-3.5 text-xs text-muted-foreground">
                    <p className="font-mono text-[11px] font-semibold text-foreground/90 uppercase tracking-wide">
                      Key Highlights:
                    </p>
                    {project.keyFeatures.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2">
                        <Icons.CheckCircle className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
                        <span className="leading-snug">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tech Stack & Action Links */}
                <div>
                  {/* Clean, Readable Tech Chips (Reduced Clutter) */}
                  <div className="flex flex-wrap gap-1.5 mb-6 pt-4 border-t border-border/70">
                    {Array.from(new Set(project.techStack)).map((tech, tIdx) => (
                      <span
                        key={`${project.id}-${tech}-${tIdx}`}
                        className="rounded-lg bg-secondary/70 border border-border/60 px-2.5 py-1 font-mono text-xs text-muted-foreground"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-3">
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => trackProjectClick(project.id, "live_preview")}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-medium py-2.5 px-3 transition-colors shadow-md shadow-primary/20"
                      >
                        <span>Live Preview</span>
                        <Icons.ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => trackProjectClick(project.id, "source_code")}
                        title={
                          project.isPrivateRepo
                            ? "Client Project (Demo / Access upon request)"
                            : "Source Code"
                        }
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-card hover:bg-secondary text-foreground text-xs font-medium py-2.5 px-3.5 transition-colors"
                      >
                        <Icons.FaGithub className="h-4 w-4" />
                        <span>{project.isPrivateRepo ? "Code (Client)" : "Source"}</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Link to GitHub */}
        <div className="mt-14 text-center">
          <a
            href={settings.githubUrl || "https://github.com"}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm font-mono text-muted-foreground hover:text-primary transition-colors group"
          >
            <span>Explore more open-source repositories &amp; code on GitHub</span>
            <Icons.ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>
        </div>
      </div>
    </section>
  );
};
