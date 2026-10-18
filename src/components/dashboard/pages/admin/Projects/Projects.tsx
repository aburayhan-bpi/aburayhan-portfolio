"use client";

import { AppCheckbox } from "@/components/shared/AppCheckbox";
import { AppConfirmDialog } from "@/components/shared/AppConfirmDialog";
import { AppSelect } from "@/components/shared/AppSelect";
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
import { Upload } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const CATEGORY_OPTIONS = [
  { value: "Full-Stack ERP", label: "Full-Stack ERP" },
  { value: "Marketplace", label: "Marketplace" },
  { value: "SaaS Dashboard", label: "SaaS Dashboard" },
  { value: "Mobile App", label: "Mobile App" },
];

const STATUS_OPTIONS = [
  { value: "Live", label: "Live" },
  { value: "Client Beta", label: "Client Beta" },
  { value: "In Dev", label: "In Dev" },
  { value: "Archived", label: "Archived" },
];

export interface AdminProject {
  id: string;
  title: string;
  category: "Full-Stack ERP" | "Marketplace" | "SaaS Dashboard" | "Mobile App";
  status: "Live" | "Client Beta" | "In Dev" | "Archived";
  tagline: string;
  description: string;
  techStack: string[];
  imageUrl?: string;
  liveUrl?: string;
  githubUrl?: string;
  featured: boolean;
  views: number;
}

const INITIAL_PROJECTS: AdminProject[] = [
  {
    id: "raantech-erp",
    title: "RaanTech — Business Operations ERP",
    category: "Full-Stack ERP",
    status: "Live",
    tagline: "End-to-End Enterprise Resource & Inventory Management Platform",
    description:
      "A comprehensive full-stack ERP architecture engineered to manage inventory, procurement, sales workflows, customer lifecycle, finances, and multi-branch staff administration.",
    techStack: [
      "Next.js",
      "TypeScript",
      "Redux Toolkit",
      "Node.js",
      "MongoDB",
      "Express.js",
    ],
    liveUrl: "https://raantech-demo.dev",
    githubUrl: "https://github.com",
    featured: true,
    views: 890,
  },
  {
    id: "uaepl8-marketplace",
    title: "UAEPL8 — Premium Vehicle Plate Marketplace",
    category: "Marketplace",
    status: "Client Beta",
    tagline: "High-Ticket Automotive Luxury Marketplace for the UAE",
    description:
      "Engineered for high-net-worth clients in the United Arab Emirates to discover, value, and trade premium vehicle registration plates with real-time valuation algorithms and VIP sourcing.",
    techStack: [
      "Next.js",
      "TypeScript",
      "Redux Toolkit",
      "Tailwind CSS",
      "Zod",
      "Framer Motion",
    ],
    liveUrl: "https://uaepl8.ae",
    githubUrl: "https://github.com",
    featured: true,
    views: 640,
  },
  {
    id: "fansphere-saas",
    title: "FanSphere — SaaS-Ready Admin Dashboard",
    category: "SaaS Dashboard",
    status: "In Dev",
    tagline: "Modular Enterprise Console for Analytics, Marketplaces & Events",
    description:
      "A production-ready, modular dashboard foundation built with reusable component architecture, high-density analytics charts, and strict TypeScript contracts.",
    techStack: [
      "Next.js",
      "React 19",
      "Redux Toolkit",
      "Radix UI",
      "Recharts",
      "Framer Motion",
    ],
    liveUrl: "https://fansphere.dev",
    githubUrl: "https://github.com",
    featured: true,
    views: 410,
  },
];

export const Projects = () => {
  const [projects, setProjects] = useState<AdminProject[]>(INITIAL_PROJECTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<AdminProject | null>(
    null,
  );

  // Accessible Confirm Delete Modal State (Zero Native Alerts)
  const [projectToDelete, setProjectToDelete] = useState<AdminProject | null>(
    null,
  );

  // Form State
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] =
    useState<AdminProject["category"]>("Full-Stack ERP");
  const [formStatus, setFormStatus] =
    useState<AdminProject["status"]>("In Dev");
  const [formTagline, setFormTagline] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formTechInput, setFormTechInput] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [formLiveUrl, setFormLiveUrl] = useState("");
  const [formGithubUrl, setFormGithubUrl] = useState("");
  const [formFeatured, setFormFeatured] = useState(true);

  // Load from MongoDB on mount
  useEffect(() => {
    let ignore = false;
    fetch("/api/v1/projects")
      .then((res) => res.json())
      .then((data) => {
        if (
          !ignore &&
          data?.data &&
          Array.isArray(data.data) &&
          data.data.length > 0
        ) {
          setProjects(data.data);
        }
      })
      .catch(() => {});

    return () => {
      ignore = true;
    };
  }, []);

  const [isReloading, setIsReloading] = useState(false);

  const reloadProjects = async () => {
    try {
      const res = await fetch("/api/v1/projects");
      const data = await res.json();
      if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
        setProjects(data.data);
      }
    } catch {
      // Retain static cache
    }
  };

  const handleManualReload = async () => {
    setIsReloading(true);
    try {
      await reloadProjects();
    } finally {
      setIsReloading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (PNG, JPG, WebP)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size must be under 5MB");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setIsUploadingImage(true);
    try {
      const res = await fetch("/api/v1/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.success && data.url) {
        setFormImageUrl(data.url);
        toast.success("Screenshot uploaded to Cloudinary!");
      } else {
        toast.error(data.error || "Upload failed");
      }
    } catch {
      toast.error("Network error during Cloudinary upload");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const resetForm = () => {
    setEditingProject(null);
    setFormTitle("");
    setFormCategory("Full-Stack ERP");
    setFormStatus("In Dev");
    setFormTagline("");
    setFormDescription("");
    setFormTechInput("");
    setFormImageUrl("");
    setFormLiveUrl("");
    setFormGithubUrl("");
    setFormFeatured(true);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (project: AdminProject) => {
    setEditingProject(project);
    setFormTitle(project.title);
    setFormCategory(project.category);
    setFormStatus(project.status);
    setFormTagline(project.tagline);
    setFormDescription(project.description);
    setFormTechInput(project.techStack.join(", "));
    setFormImageUrl(project.imageUrl || "");
    setFormLiveUrl(project.liveUrl || "");
    setFormGithubUrl(project.githubUrl || "");
    setFormFeatured(project.featured);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      toast.error("Project title is required");
      return;
    }

    const techArray = formTechInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const projectPayload = {
      title: formTitle,
      category: formCategory,
      status: formStatus,
      tagline: formTagline,
      description: formDescription,
      techStack: techArray.length ? techArray : ["Next.js", "TypeScript"],
      imageUrl: formImageUrl,
      liveUrl: formLiveUrl,
      githubUrl: formGithubUrl,
      featured: formFeatured,
    };

    if (editingProject) {
      try {
        const res = await fetch(`/api/v1/projects/${editingProject.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(projectPayload),
        });
        const resData = await res.json();
        if (res.ok && resData.success) {
          toast.success("Project updated in database");
          reloadProjects();
        } else {
          toast.error(resData.error || "Failed to update project");
        }
      } catch {
        toast.error("Network error while updating project");
      }
    } else {
      try {
        const res = await fetch("/api/v1/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(projectPayload),
        });
        const resData = await res.json();
        if (res.ok && resData.success) {
          toast.success("New project persisted to MongoDB");
          reloadProjects();
        } else {
          toast.error(resData.error || "Failed to add project");
        }
      } catch {
        toast.error("Network error while creating project");
      }
    }

    setIsModalOpen(false);
    resetForm();
  };

  // Called after confirmation in the custom AlertDialog
  const confirmDeleteProject = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/projects/${id}`, {
        method: "DELETE",
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        toast.success("Project permanently deleted from MongoDB");
        reloadProjects();
      } else {
        toast.error(resData.error || "Failed to delete project");
      }
    } catch {
      toast.error("Network error while deleting project");
    }
  };

  const toggleFeatured = async (id: string) => {
    const current = projects.find((p) => p.id === id);
    if (!current) return;

    try {
      const res = await fetch(`/api/v1/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: !current.featured }),
      });
      if (res.ok) {
        setProjects((prev) =>
          prev.map((p) => (p.id === id ? { ...p, featured: !p.featured } : p)),
        );
        toast.success("Featured status updated in database");
      }
    } catch {
      toast.error("Failed to update status");
    }
  };

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.techStack.some((t) =>
        t.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    const matchesCategory =
      categoryFilter === "All" || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Link
              href="/dashboard/admin"
              className="text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
            >
              Console
            </Link>
            <span className="text-xs text-muted-foreground font-mono">/</span>
            <span className="text-xs font-mono text-primary font-semibold">
              Projects CRUD
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Portfolio Projects Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create, edit, toggle visibility, and configure featured case
            studies.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleManualReload}
            disabled={isReloading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-border bg-card hover:bg-secondary text-foreground text-xs font-mono font-medium transition-colors cursor-pointer disabled:opacity-50"
            title="Reload from MongoDB database"
          >
            <Icons.RefreshCw
              className={`w-3.5 h-3.5 text-primary ${isReloading ? "animate-spin" : ""}`}
            />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-medium transition-colors shadow-md shadow-primary/20 cursor-pointer"
          >
            <Icons.Plus className="w-4 h-4" />
            <span>Add New Project</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-card border border-border p-4 rounded-2xl">
        <div className="relative flex-1 max-w-md">
          <Icons.Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by title, stack, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-secondary/50 border border-border rounded-xl text-xs text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary h-10"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {["All", "Full-Stack ERP", "Marketplace", "SaaS Dashboard"].map(
            (cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                  categoryFilter === cat
                    ? "bg-primary text-white border border-primary"
                    : "bg-secondary/40 text-muted-foreground hover:text-foreground border border-border"
                }`}
              >
                {cat}
              </button>
            ),
          )}
        </div>
      </div>

      {/* Projects Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-secondary/40 border-b border-border text-muted-foreground font-mono uppercase text-[10px]">
              <tr>
                <th className="py-3.5 px-4 font-semibold">
                  Project Title &amp; Details
                </th>
                <th className="py-3.5 px-4 font-semibold">Category</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold">Featured</th>
                <th className="py-3.5 px-4 font-semibold">Tech Stack</th>
                <th className="py-3.5 px-4 font-semibold text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredProjects.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-12 text-center text-muted-foreground"
                  >
                    No projects found matching the criteria.
                  </td>
                </tr>
              ) : (
                filteredProjects.map((project) => (
                  <tr
                    key={project.id}
                    className="hover:bg-secondary/20 transition-colors group"
                  >
                    {/* Title */}
                    <td className="py-4 px-4 max-w-xs">
                      <div className="flex items-center gap-3">
                        {project.imageUrl && (
                          <div className="h-9 w-13 rounded-lg border border-border overflow-hidden shrink-0 bg-secondary/80">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={project.imageUrl}
                              alt={project.title}
                              className="w-full h-full object-cover object-top"
                            />
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="font-bold text-foreground group-hover:text-primary transition-colors truncate">
                            {project.title}
                          </div>
                          <div className="text-[11px] text-muted-foreground truncate mt-0.5 font-mono">
                            {project.tagline}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="font-mono text-[11px] text-foreground">
                        {project.category}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-mono px-2 py-0.5 ${
                          project.status === "Live"
                            ? "border-success/30 bg-success/10 text-success"
                            : project.status === "Client Beta"
                              ? "border-accent/30 bg-accent/10 text-accent"
                              : "border-border bg-secondary text-muted-foreground"
                        }`}
                      >
                        {project.status}
                      </Badge>
                    </td>

                    {/* Featured */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleFeatured(project.id)}
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono transition-colors ${
                          project.featured
                            ? "bg-primary/10 text-primary border border-primary/20"
                            : "bg-secondary text-muted-foreground border border-border"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            project.featured
                              ? "bg-primary"
                              : "bg-muted-foreground"
                          }`}
                        />
                        <span>
                          {project.featured ? "Featured" : "Standard"}
                        </span>
                      </button>
                    </td>

                    {/* Tech Stack */}
                    <td className="py-4 px-4 max-w-xs">
                      <div className="flex flex-wrap gap-1">
                        {project.techStack.slice(0, 3).map((t) => (
                          <span
                            key={t}
                            className="text-[10px] font-mono bg-secondary px-1.5 py-0.5 rounded text-muted-foreground border border-border/50"
                          >
                            {t}
                          </span>
                        ))}
                        {project.techStack.length > 3 && (
                          <span className="text-[10px] font-mono text-muted-foreground">
                            +{project.techStack.length - 3}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {project.liveUrl && (
                          <a
                            href={project.liveUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg border border-border hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                            title="Live URL"
                          >
                            <Icons.ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <button
                          onClick={() => handleOpenEdit(project)}
                          className="p-1.5 rounded-lg border border-border hover:bg-primary/10 hover:border-primary/30 text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                          title="Edit Project"
                        >
                          <Icons.Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setProjectToDelete(project)}
                          className="p-1.5 rounded-lg border border-border hover:bg-destructive/10 hover:border-destructive/30 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                          title="Delete Project"
                        >
                          <Icons.Trash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Accessible Radix UI Dialog for Add / Edit Project */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-xl bg-card border border-border text-foreground sm:rounded-2xl p-0 flex flex-col max-h-[calc(100dvh-2rem)] sm:max-h-[88vh] overflow-hidden shadow-2xl">
          <DialogHeader className="p-5 sm:p-6 pb-4 border-b border-border shrink-0 bg-card z-10 text-left">
            <DialogTitle className="text-lg font-bold text-foreground">
              {editingProject
                ? "Edit Project Details"
                : "Create New Engineering Project"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              Configure project metadata, release status, and portfolio
              visibility.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handleSave}
            className="flex flex-col flex-1 overflow-hidden"
          >
            {/* Scrollable Form Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
              <div>
                <label className="block text-xs font-mono text-muted-foreground mb-1">
                  Project Title *
                </label>
                <Input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. RaanTech — Business Operations ERP"
                  className="w-full bg-secondary/50 border-border text-xs text-foreground placeholder:text-muted-foreground h-10 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-mono text-muted-foreground">
                    Category
                  </label>
                  <AppSelect
                    value={formCategory}
                    onValueChange={(val) =>
                      setFormCategory(val as AdminProject["category"])
                    }
                    options={CATEGORY_OPTIONS}
                    placeholder="Select Category"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-mono text-muted-foreground">
                    Release Status
                  </label>
                  <AppSelect
                    value={formStatus}
                    onValueChange={(val) =>
                      setFormStatus(val as AdminProject["status"])
                    }
                    options={STATUS_OPTIONS}
                    placeholder="Select Status"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-muted-foreground mb-1">
                  Tagline / Subheading
                </label>
                <Input
                  type="text"
                  value={formTagline}
                  onChange={(e) => setFormTagline(e.target.value)}
                  placeholder="e.g. End-to-End Enterprise Resource & Inventory Management Platform"
                  className="w-full bg-secondary/50 border-border text-xs text-foreground placeholder:text-muted-foreground h-10 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-muted-foreground mb-1">
                  Description
                </label>
                <Textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Comprehensive summary of engineering architecture, problem solved, and technical achievements."
                  className="w-full bg-secondary/50 border-border text-xs text-foreground placeholder:text-muted-foreground resize-none rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-muted-foreground mb-1">
                  Technologies (comma separated)
                </label>
                <Input
                  type="text"
                  value={formTechInput}
                  onChange={(e) => setFormTechInput(e.target.value)}
                  placeholder="Next.js, TypeScript, Node.js, MongoDB"
                  className="w-full bg-secondary/50 border-border text-xs text-foreground placeholder:text-muted-foreground h-10 rounded-xl"
                />
              </div>

              {/* Cloudinary Screenshot Image Uploader */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono text-muted-foreground">
                  Project UI Screenshot (Cloudinary Live Upload)
                </label>

                {formImageUrl ? (
                  <div className="relative rounded-xl border border-border bg-secondary/30 p-2 overflow-hidden">
                    <div className="relative h-44 w-full rounded-lg overflow-hidden border border-border bg-card">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={formImageUrl}
                        alt="Project screenshot preview"
                        className="w-full h-full object-cover object-top"
                      />
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-border/50 text-xs">
                      <span className="text-[11px] font-mono text-success truncate max-w-70">
                        ✓ {formImageUrl}
                      </span>
                      <button
                        type="button"
                        onClick={() => setFormImageUrl("")}
                        className="text-xs text-destructive hover:underline font-mono cursor-pointer"
                      >
                        Remove Image
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="relative border-2 border-dashed border-border/80 hover:border-primary/60 rounded-xl p-5 text-center bg-secondary/20 hover:bg-secondary/40 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isUploadingImage}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    />
                    <div className="flex flex-col items-center gap-1.5 pointer-events-none">
                      {isUploadingImage ? (
                        <>
                          <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          <span className="text-xs font-mono text-primary">
                            Uploading to Cloudinary...
                          </span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-5 h-5 text-muted-foreground" />
                          <span className="text-xs font-medium text-foreground">
                            Click to upload real project interface screenshot
                          </span>
                          <span className="text-[10px] font-mono text-muted-foreground">
                            PNG, JPG, WebP (Max 5MB) • Hosted on Cloudinary
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                )}

                <div className="pt-1">
                  <Input
                    type="url"
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    placeholder="Or paste direct screenshot URL (https://...)"
                    className="w-full bg-secondary/40 border-border text-[11px] text-foreground placeholder:text-muted-foreground h-8.5 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-muted-foreground mb-1">
                    Live Demo URL
                  </label>
                  <Input
                    type="url"
                    value={formLiveUrl}
                    onChange={(e) => setFormLiveUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-secondary/50 border-border text-xs text-foreground placeholder:text-muted-foreground h-10 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-muted-foreground mb-1">
                    GitHub / Source URL
                  </label>
                  <Input
                    type="url"
                    value={formGithubUrl}
                    onChange={(e) => setFormGithubUrl(e.target.value)}
                    placeholder="https://github.com/..."
                    className="w-full bg-secondary/50 border-border text-xs text-foreground placeholder:text-muted-foreground h-10 rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-2">
                <AppCheckbox
                  id="featuredCheck"
                  checked={formFeatured}
                  onCheckedChange={(checked) => setFormFeatured(checked)}
                  label="Feature prominently on public homepage"
                />
              </div>
            </div>

            {/* Sticky Action Footer */}
            <div className="p-4 sm:p-5 border-t border-border bg-card/95 backdrop-blur-xs flex items-center justify-end gap-3 shrink-0 z-10">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-border bg-secondary/50 hover:bg-secondary text-foreground hover:text-foreground text-xs font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-medium transition-colors shadow-md shadow-primary/20 cursor-pointer"
              >
                {editingProject ? "Update Project" : "Add Project"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Accessible Radix UI AlertDialog for Delete Confirmation (Zero Native Alerts) */}
      <AppConfirmDialog
        isOpen={!!projectToDelete}
        onOpenChange={(open) => !open && setProjectToDelete(null)}
        title="Delete Project Confirmation"
        description={`Are you sure you want to permanently delete "${projectToDelete?.title || ""}"? This document will be permanently removed from MongoDB Atlas. This action cannot be undone.`}
        confirmText="Confirm Delete"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={() => {
          if (projectToDelete) {
            confirmDeleteProject(projectToDelete.id);
            setProjectToDelete(null);
          }
        }}
      />
    </div>
  );
};

export default Projects;
