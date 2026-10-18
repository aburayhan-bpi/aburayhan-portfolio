"use client";

import { AppConfirmDialog } from "@/components/shared/AppConfirmDialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Icons } from "@/utils/icons";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

export interface ExperienceItem {
  _id: string;
  category: "experience" | "education";
  title: string;
  organization: string;
  period: string;
  location?: string;
  type: string;
  description?: string;
  highlights: string[];
  tech: string[];
  order: number;
  createdAt?: string;
}

const DEFAULT_FORM_DATA = {
  category: "experience" as "experience" | "education",
  title: "",
  organization: "",
  period: "",
  location: "",
  type: "Full-Time",
  description: "",
  highlights: [] as string[],
  tech: [] as string[],
  order: 0,
};

export const ExperienceManagement = () => {
  const [activeTab, setActiveTab] = useState<"experience" | "education">("experience");
  const [items, setItems] = useState<ExperienceItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ExperienceItem | null>(null);
  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Chip input state for highlights & tech
  const [highlightInput, setHighlightInput] = useState("");
  const [techInput, setTechInput] = useState("");

  // Delete State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<ExperienceItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchItems = async () => {
    try {
      const res = await fetch("/api/v1/experiences");
      const resData = await res.json();
      if (res.ok && resData.success && Array.isArray(resData.data)) {
        setItems(resData.data);
      }
    } catch {
      // Ignore
    }
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/v1/experiences");
      const resData = await res.json();
      if (res.ok && resData.success && Array.isArray(resData.data)) {
        setItems(resData.data);
      } else {
        toast.error("Failed to load experience records");
      }
    } catch {
      toast.error("Network error fetching experiences");
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetch("/api/v1/experiences")
      .then((res) => res.json())
      .then((resData) => {
        if (resData?.data && Array.isArray(resData.data)) {
          setItems(resData.data);
        }
      })
      .catch(() => {
        toast.error("Failed to load experience records");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const handleOpenAddModal = (category: "experience" | "education") => {
    setEditingItem(null);
    setFormData({
      ...DEFAULT_FORM_DATA,
      category,
      type: category === "experience" ? "Full-Time" : "Professional Certification",
    });
    setHighlightInput("");
    setTechInput("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: ExperienceItem) => {
    setEditingItem(item);
    setFormData({
      category: item.category,
      title: item.title,
      organization: item.organization,
      period: item.period,
      location: item.location || "",
      type: item.type,
      description: item.description || "",
      highlights: item.highlights || [],
      tech: item.tech || [],
      order: item.order || 0,
    });
    setHighlightInput("");
    setTechInput("");
    setIsModalOpen(true);
  };

  const handleAddHighlight = () => {
    if (!highlightInput.trim()) return;
    setFormData((prev) => ({
      ...prev,
      highlights: [...prev.highlights, highlightInput.trim()],
    }));
    setHighlightInput("");
  };

  const handleRemoveHighlight = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      highlights: prev.highlights.filter((_, i) => i !== idx),
    }));
  };

  const handleAddTech = () => {
    if (!techInput.trim()) return;
    const clean = techInput.trim();
    if (!formData.tech.includes(clean)) {
      setFormData((prev) => ({
        ...prev,
        tech: [...prev.tech, clean],
      }));
    }
    setTechInput("");
  };

  const handleRemoveTech = (chip: string) => {
    setFormData((prev) => ({
      ...prev,
      tech: prev.tech.filter((t) => t !== chip),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.organization.trim() || !formData.period.trim()) {
      toast.error("Title, organization, and time period are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const url = "/api/v1/experiences";
      const method = editingItem ? "PUT" : "POST";
      const payload = editingItem
        ? { _id: editingItem._id, ...formData }
        : formData;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();
      if (res.ok && resData.success) {
        toast.success(
          editingItem
            ? "Record updated successfully!"
            : "New entry published successfully!"
        );
        setIsModalOpen(false);
        fetchItems();
      } else {
        toast.error(resData.error || "Failed to save record");
      }
    } catch {
      toast.error("Network error while submitting record");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/v1/experiences?id=${itemToDelete._id}`, {
        method: "DELETE",
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        toast.success("Entry removed successfully");
        setDeleteDialogOpen(false);
        setItemToDelete(null);
        fetchItems();
      } else {
        toast.error(resData.error || "Failed to delete item");
      }
    } catch {
      toast.error("Network error deleting item");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredItems = items.filter((item) => item.category === activeTab);

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
              Admin
            </Link>
            <span className="text-xs text-muted-foreground">/</span>
            <span className="text-xs font-mono text-primary font-medium">
              Career &amp; Education
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Career Journey &amp; Education CMS
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Manage your professional engineering timeline, roles, achievements, and educational credentials.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleManualRefresh}
            disabled={isRefreshing || isLoading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-border bg-card hover:bg-secondary text-foreground text-xs font-mono font-medium transition-colors cursor-pointer disabled:opacity-50"
            title="Reload from database"
          >
            <Icons.RefreshCw
              className={`w-3.5 h-3.5 text-primary ${
                isRefreshing ? "animate-spin" : ""
              }`}
            />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => handleOpenAddModal(activeTab)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-mono font-medium transition-all shadow-md shadow-primary/20 cursor-pointer"
          >
            <Icons.Plus className="w-4 h-4" />
            <span>
              {activeTab === "experience" ? "Add Work Experience" : "Add Credential"}
            </span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-card/80 border border-border rounded-2xl w-fit shadow-xs">
        <button
          type="button"
          onClick={() => setActiveTab("experience")}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-medium transition-all cursor-pointer ${
            activeTab === "experience"
              ? "bg-primary text-white shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
          }`}
        >
          <Icons.HiOutlineBriefcase className="w-4 h-4" />
          <span>Work Experience ({items.filter((i) => i.category === "experience").length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("education")}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-medium transition-all cursor-pointer ${
            activeTab === "education"
              ? "bg-primary text-white shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
          }`}
        >
          <Icons.GiNotebook className="w-4 h-4" />
          <span>Education &amp; Credentials ({items.filter((i) => i.category === "education").length})</span>
        </button>
      </div>

      {/* Content List */}
      {isLoading ? (
        <div className="py-20 text-center space-y-3">
          <Icons.RefreshCw className="w-8 h-8 text-primary animate-spin mx-auto" />
          <p className="text-xs font-mono text-muted-foreground">
            Loading career milestones from database...
          </p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center bg-card/40 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center mx-auto text-muted-foreground">
            {activeTab === "experience" ? (
              <Icons.HiOutlineBriefcase className="w-6 h-6" />
            ) : (
              <Icons.GiNotebook className="w-6 h-6" />
            )}
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">
              No {activeTab === "experience" ? "work experiences" : "credentials"} found
            </h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              Add your first {activeTab === "experience" ? "job role" : "degree or certification"} to showcase on the homepage.
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleOpenAddModal(activeTab)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-medium cursor-pointer"
          >
            <Icons.Plus className="w-4 h-4" />
            <span>Add Now</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item._id}
              className="rounded-2xl border border-border bg-card p-6 sm:p-7 transition-all hover:border-primary/40 hover:shadow-lg space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary text-xs">
                      {item.type}
                    </Badge>
                    <span className="text-xs font-mono text-muted-foreground">
                      {item.period}
                    </span>
                    {item.location && (
                      <span className="text-xs font-mono text-muted-foreground/80">
                        • {item.location}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-foreground">{item.title}</h3>
                  <p className="text-sm font-semibold text-sky-400">{item.organization}</p>
                </div>

                {/* Edit & Delete Actions */}
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(item)}
                    className="p-2 rounded-lg border border-border bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer transition-colors"
                    title="Edit Record"
                  >
                    <Icons.Edit className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setItemToDelete(item);
                      setDeleteDialogOpen(true);
                    }}
                    className="p-2 rounded-lg border border-border bg-secondary/50 text-destructive/80 hover:text-destructive hover:bg-destructive/10 cursor-pointer transition-colors"
                    title="Delete Record"
                  >
                    <Icons.Trash className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Description */}
              {item.description && (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              )}

              {/* Highlights */}
              {Array.isArray(item.highlights) && item.highlights.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-mono font-medium text-foreground">Key Highlights:</h4>
                  <ul className="space-y-1.5 text-xs text-muted-foreground">
                    {item.highlights.map((h, hIdx) => (
                      <li key={hIdx} className="flex items-start gap-2">
                        <Icons.CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tech Stack */}
              {Array.isArray(item.tech) && item.tech.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-3 border-t border-border/60">
                  {item.tech.map((t, tIdx) => (
                    <span
                      key={tIdx}
                      className="px-2.5 py-1 rounded-md bg-secondary border border-border/70 text-xs font-mono text-muted-foreground"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Responsive Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Sticky Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-border bg-card/95 backdrop-blur-md">
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  {editingItem ? "Edit Record" : `Add New ${formData.category === "experience" ? "Work Experience" : "Credential"}`}
                </h3>
                <p className="text-xs font-mono text-muted-foreground mt-0.5">
                  Update details shown on the public portfolio.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer"
              >
                <Icons.X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-muted-foreground mb-1.5">
                      {formData.category === "experience" ? "Job Title / Role *" : "Title / Degree *"}
                    </label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder={formData.category === "experience" ? "e.g. Frontend Developer" : "e.g. Diploma in Engineering"}
                      required
                      className="bg-secondary/40 border-border"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-muted-foreground mb-1.5">
                      {formData.category === "experience" ? "Company / Organization *" : "Institution / Academy *"}
                    </label>
                    <Input
                      value={formData.organization}
                      onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                      placeholder={formData.category === "experience" ? "e.g. SM Technology" : "e.g. Bogura Polytechnic Institute"}
                      required
                      className="bg-secondary/40 border-border"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-muted-foreground mb-1.5">
                      Time Period *
                    </label>
                    <Input
                      value={formData.period}
                      onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                      placeholder="e.g. July 2025 – Present"
                      required
                      className="bg-secondary/40 border-border"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-muted-foreground mb-1.5">
                      Badge / Type *
                    </label>
                    <Input
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      placeholder="e.g. Full-Time, Remote, Certification"
                      required
                      className="bg-secondary/40 border-border"
                    />
                  </div>

                  {formData.category === "experience" && (
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-mono text-muted-foreground mb-1.5">
                        Location &amp; Work Model
                      </label>
                      <Input
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="e.g. Dhaka, Bangladesh • Remote / Hybrid"
                        className="bg-secondary/40 border-border"
                      />
                    </div>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-mono text-muted-foreground mb-1.5">
                    Description / Overview
                  </label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief summary of skills acquired or responsibilities handled..."
                    rows={3}
                    className="bg-secondary/40 border-border"
                  />
                </div>

                {/* Highlights (Bullet Points) */}
                {formData.category === "experience" && (
                  <div className="space-y-3 pt-2 border-t border-border">
                    <label className="block text-xs font-mono text-muted-foreground">
                      Key Highlights &amp; Achievements
                    </label>
                    <div className="flex gap-2">
                      <Input
                        value={highlightInput}
                        onChange={(e) => setHighlightInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddHighlight();
                          }
                        }}
                        placeholder="e.g. Engineered production web apps using Next.js and RTK..."
                        className="bg-secondary/40 border-border flex-1"
                      />
                      <button
                        type="button"
                        onClick={handleAddHighlight}
                        className="px-4 py-2 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground text-xs font-medium border border-border cursor-pointer shrink-0"
                      >
                        Add Bullet
                      </button>
                    </div>

                    {formData.highlights.length > 0 && (
                      <div className="space-y-2 pt-1">
                        {formData.highlights.map((h, idx) => (
                          <div
                            key={idx}
                            className="flex items-start justify-between gap-2 p-2.5 rounded-lg bg-secondary/30 border border-border text-xs text-muted-foreground"
                          >
                            <span className="flex-1 leading-relaxed">{h}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveHighlight(idx)}
                              className="text-destructive/80 hover:text-destructive p-0.5 cursor-pointer"
                            >
                              <Icons.X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Technologies */}
                {formData.category === "experience" && (
                  <div className="space-y-3 pt-2 border-t border-border">
                    <label className="block text-xs font-mono text-muted-foreground">
                      Tech Stack Chips
                    </label>
                    <div className="flex gap-2">
                      <Input
                        value={techInput}
                        onChange={(e) => setTechInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddTech();
                          }
                        }}
                        placeholder="e.g. Next.js, TypeScript, RTK Query..."
                        className="bg-secondary/40 border-border flex-1"
                      />
                      <button
                        type="button"
                        onClick={handleAddTech}
                        className="px-4 py-2 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground text-xs font-medium border border-border cursor-pointer shrink-0"
                      >
                        Add Chip
                      </button>
                    </div>

                    {formData.tech.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {formData.tech.map((t) => (
                          <span
                            key={t}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-secondary border border-border text-xs font-mono text-foreground"
                          >
                            <span>{t}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveTech(t)}
                              className="text-muted-foreground hover:text-destructive cursor-pointer"
                            >
                              <Icons.X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Sticky Footer */}
              <div className="sticky bottom-0 z-10 flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-card/95 backdrop-blur-md">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-border hover:bg-secondary text-foreground text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-medium shadow-md shadow-primary/20 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : editingItem ? "Update Entry" : "Save Entry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal using Radix AppConfirmDialog */}
      <AppConfirmDialog
        isOpen={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Timeline Entry"
        description={`Are you sure you want to permanently remove "${itemToDelete?.title}" at ${itemToDelete?.organization}? This action cannot be undone.`}
        confirmText={isDeleting ? "Deleting..." : "Delete Entry"}
        cancelText="Cancel"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default ExperienceManagement;
