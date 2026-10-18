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
import { Icons } from "@/utils/icons";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export interface AdminSkill {
  _id: string;
  name: string;
  category: "Frontend" | "Backend" | "AI & Tools" | "DevOps & Cloud";
  proficiency?: number;
  experienceYears?: number;
  featured: boolean;
  order: number;
  createdAt: string;
}

const CATEGORY_OPTIONS = [
  { value: "Frontend", label: "Frontend & Frameworks" },
  { value: "Backend", label: "Backend & Data Pipelines" },
  { value: "AI & Tools", label: "AI Tools & Modern Workflow" },
  { value: "DevOps & Cloud", label: "DevOps, Cloud & Architecture" },
];

export const Skills = () => {
  const [skills, setSkills] = useState<AdminSkill[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingSkill, setEditingSkill] = useState<AdminSkill | null>(null);
  const [formName, setFormName] = useState<string>("");
  const [formCategory, setFormCategory] =
    useState<AdminSkill["category"]>("Frontend");
  const [formProficiency, setFormProficiency] = useState<number>(90);
  const [formExperience, setFormExperience] = useState<number>(3);
  const [formFeatured, setFormFeatured] = useState<boolean>(true);

  // Modal State for Delete Confirmation (Zero Native Alerts)
  const [skillToDelete, setSkillToDelete] = useState<AdminSkill | null>(null);

  const reloadSkills = async () => {
    try {
      const res = await fetch("/api/v1/skills");
      const resData = await res.json();
      if (res.ok && Array.isArray(resData?.data)) {
        setSkills(resData.data);
      }
    } catch {
      // Retain existing state
    }
  };

  useEffect(() => {
    fetch("/api/v1/skills")
      .then((res) => res.json())
      .then((resData) => {
        if (resData?.data && Array.isArray(resData.data)) {
          setSkills(resData.data);
        }
      })
      .catch(() => {
        toast.error("Failed to load skills from database");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await reloadSkills();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingSkill(null);
    setFormName("");
    setFormCategory("Frontend");
    setFormProficiency(90);
    setFormExperience(3);
    setFormFeatured(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (s: AdminSkill) => {
    setEditingSkill(s);
    setFormName(s.name);
    setFormCategory(s.category);
    setFormProficiency(s.proficiency || 90);
    setFormExperience(s.experienceYears || 3);
    setFormFeatured(!!s.featured);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.error("Skill name is required");
      return;
    }

    const payload = {
      name: formName.trim(),
      category: formCategory,
      proficiency: Number(formProficiency) || 90,
      experienceYears: Number(formExperience) || 3,
      featured: formFeatured,
    };

    if (editingSkill) {
      try {
        const res = await fetch("/api/v1/skills", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingSkill._id, ...payload }),
        });
        const resData = await res.json();
        if (res.ok && resData.success) {
          toast.success("Skill updated in MongoDB Atlas");
          setSkills((prev) =>
            prev.map((s) => (s._id === editingSkill._id ? resData.data : s)),
          );
          setIsModalOpen(false);
        } else {
          toast.error(resData.error || "Failed to update skill");
        }
      } catch {
        toast.error("Network error while updating");
      }
    } else {
      try {
        const res = await fetch("/api/v1/skills", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const resData = await res.json();
        if (res.ok && resData.success) {
          toast.success("New skill added to portfolio database");
          setSkills((prev) => [...prev, resData.data]);
          setIsModalOpen(false);
        } else {
          toast.error(resData.error || "Failed to create skill");
        }
      } catch {
        toast.error("Network error while creating");
      }
    }
  };

  const confirmDeleteSkill = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/skills?id=${id}`, {
        method: "DELETE",
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        toast.success("Skill permanently removed");
        setSkills((prev) => prev.filter((s) => s._id !== id));
      } else {
        toast.error(resData.error || "Failed to delete skill");
      }
    } catch {
      toast.error("Network error while deleting");
    }
  };

  // Filter skills
  const filteredSkills = skills.filter((s) => {
    const matchesSearch = s.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || s.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    "All",
    "Frontend",
    "Backend",
    "AI & Tools",
    "DevOps & Cloud",
  ];

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
              Skills &amp; Stack
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Technical Stack &amp; Skills CMS
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Manage your engineering technologies, proficiencies, and categories
            synced live to your portfolio.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-border bg-card hover:bg-secondary text-foreground text-xs font-mono font-medium transition-colors cursor-pointer disabled:opacity-50"
            title="Reload from MongoDB"
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
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-medium transition-colors shadow-md shadow-primary/20 cursor-pointer"
          >
            <Icons.Plus className="w-4 h-4" />
            <span>Add New Skill</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-secondary/60 rounded-xl border border-border flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-primary text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search technology..."
            className="pl-9 bg-card border-border text-xs text-foreground placeholder:text-muted-foreground h-10 rounded-xl"
          />
        </div>
      </div>

      {/* Skills Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
          <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono">
            Loading technical stack from database...
          </span>
        </div>
      ) : filteredSkills.length === 0 ? (
        <div className="p-12 rounded-2xl border border-border bg-card text-center text-muted-foreground">
          <Icons.Code className="w-10 h-10 mx-auto mb-3 opacity-40 text-primary" />
          <p className="text-sm font-medium text-foreground">
            No technologies match your filter
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Click &quot;Add New Skill&quot; to insert technologies to this
            category.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSkills.map((skill) => (
            <div
              key={skill._id}
              className="group relative rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-black/40 flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <h3 className="font-bold text-foreground text-sm group-hover:text-primary transition-colors">
                      {skill.name}
                    </h3>
                    <Badge
                      variant="outline"
                      className="text-[10px] font-mono border-primary/20 bg-primary/5 text-primary"
                    >
                      {skill.category}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(skill)}
                      className="p-1.5 rounded-lg border border-border hover:bg-primary/10 hover:border-primary/30 text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                      title="Edit Skill"
                    >
                      <Icons.Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setSkillToDelete(skill)}
                      className="p-1.5 rounded-lg border border-border hover:bg-destructive/10 hover:border-destructive/30 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                      title="Delete Skill"
                    >
                      <Icons.Trash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Proficiency Bar & Experience */}
              <div className="space-y-2 pt-2 border-t border-border/60">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-muted-foreground">Proficiency</span>
                  <span className="text-foreground font-semibold">
                    {skill.proficiency || 90}%
                  </span>
                </div>
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-linear-to-r from-primary to-accent transition-all duration-500 rounded-full"
                    style={{ width: `${skill.proficiency || 90}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground pt-1">
                  <span>Exp: {skill.experienceYears || 3}+ years</span>
                  {skill.featured && (
                    <span className="text-success font-medium">★ Featured</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* Accessible Radix UI Dialog for Add / Edit Skill                           */}
      {/* Strictly responsive with fixed header, scrollable body, and fixed footer   */}
      {/* ========================================================================= */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg bg-card border border-border text-foreground sm:rounded-2xl p-0 flex flex-col max-h-[calc(100dvh-2rem)] sm:max-h-[88vh] overflow-hidden shadow-2xl">
          <DialogHeader className="p-5 sm:p-6 pb-4 border-b border-border shrink-0 bg-card z-10 text-left">
            <DialogTitle className="text-lg font-bold text-foreground">
              {editingSkill
                ? "Edit Technology Skill"
                : "Add New Technology Skill"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              Configure technology proficiency, engineering stack category, and
              portfolio visibility.
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
                  Technology Name *
                </label>
                <Input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Next.js 16, GraphQL, Redis, AWS"
                  className="w-full bg-secondary/50 border-border text-xs text-foreground placeholder:text-muted-foreground h-10 rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-mono text-muted-foreground">
                  Stack Category *
                </label>
                <AppSelect
                  value={formCategory}
                  onValueChange={(val) =>
                    setFormCategory(val as AdminSkill["category"])
                  }
                  options={CATEGORY_OPTIONS}
                  placeholder="Select Category"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-muted-foreground mb-1">
                    Proficiency (%): {formProficiency}%
                  </label>
                  <Input
                    type="number"
                    min={10}
                    max={100}
                    value={formProficiency}
                    onChange={(e) => setFormProficiency(Number(e.target.value))}
                    className="w-full bg-secondary/50 border-border text-xs text-foreground placeholder:text-muted-foreground h-10 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-muted-foreground mb-1">
                    Experience (Years)
                  </label>
                  <Input
                    type="number"
                    min={0}
                    max={25}
                    value={formExperience}
                    onChange={(e) => setFormExperience(Number(e.target.value))}
                    className="w-full bg-secondary/50 border-border text-xs text-foreground placeholder:text-muted-foreground h-10 rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-2">
                <AppCheckbox
                  id="skillFeaturedCheck"
                  checked={formFeatured}
                  onCheckedChange={(checked) => setFormFeatured(checked)}
                  label="Display as featured skill on public portfolio"
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
                {editingSkill ? "Update Skill" : "Add Skill"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* Accessible Radix UI AlertDialog for Delete Confirmation (Zero Native Alerts) */}
      {/* ========================================================================= */}
      <AppConfirmDialog
        isOpen={!!skillToDelete}
        onOpenChange={(open) => !open && setSkillToDelete(null)}
        title="Delete Technology Skill"
        description={`Are you sure you want to remove "${skillToDelete?.name || ""}" from your technical capabilities? This will be removed from MongoDB Atlas.`}
        confirmText="Confirm Delete"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={() => {
          if (skillToDelete) {
            confirmDeleteSkill(skillToDelete._id);
            setSkillToDelete(null);
          }
        }}
      />
    </div>
  );
};

export default Skills;
