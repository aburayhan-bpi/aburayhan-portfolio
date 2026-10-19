import CustomButton from "@/components/shared/CustomButton";
import HeaderTitle from "@/components/shared/HeaderTitle";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Icons } from "@/utils/icons";
import { useState } from "react";
import { toast } from "sonner";

import { copyToClipboard } from "@/lib/clipboard";

const PROJECT_TYPES = [
  "Frontend Web App",
  "Frontend / Next.js",
  "Enterprise ERP / SaaS",
  "Marketplace Platform",
  "Full-Time Role",
];

export const ContactSection = () => {
  const { settings } = useSiteSettings();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    projectType: "Frontend Web App",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const emailToUse = settings.primaryEmail || "aburayhan.bpi@gmail.com";

  const handleCopyEmail = async () => {
    const success = await copyToClipboard(emailToUse);
    if (success) {
      setCopiedEmail(true);
      toast.success(`Email copied to clipboard: ${emailToUse}`);
      setTimeout(() => setCopiedEmail(false), 2500);
    } else {
      toast.error("Failed to copy email");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in your name, email, and message.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/v1/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(
          "Thank you! Your message has been sent to Abu Rayhan. Will get back to you shortly."
        );
        setFormData({
          name: "",
          email: "",
          projectType: "Frontend Web App",
          subject: "",
          message: "",
        });
      } else {
        toast.error(data.error || "Failed to send message. Please try again.");
      }
    } catch {
      toast.error("Network error. Please try again or email directly.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-16 md:py-24 border-t border-border/60 relative">
      <div className="customContainer mx-auto px-4 sm:px-6 lg:px-8">
        <HeaderTitle
          title="Let's Connect & Work Together"
          subtitle="Interested in hiring, collaborating on a project, or discussing an open frontend role? Reach out directly."
          titleColor="white"
          titleSize="xl"
          alignment="center"
          subtitleClassName="text-muted-foreground"
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 mt-10 items-start">
          {/* Left Column: Direct Info & Availability */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-2xl border border-border bg-card/70 p-6 sm:p-8 backdrop-blur-md space-y-6">
              <div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Direct Contact
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Available for full-time engineering roles, high-impact contract work, 
                  and international client collaborations.
                </p>
              </div>

              <div className="space-y-4 pt-2">
                {/* 1-Click Copy Email Card */}
                <div className="group rounded-xl border border-border/80 bg-secondary/40 p-3.5 transition-all hover:border-primary/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary">
                      <Icons.Mail className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[11px] font-mono text-muted-foreground">Email Address</p>
                      <a
                        href={`mailto:${settings.primaryEmail || "aburayhan.bpi@gmail.com"}`}
                        className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                      >
                        {settings.primaryEmail || "aburayhan.bpi@gmail.com"}
                      </a>
                    </div>
                  </div>

                  <button
                    onClick={handleCopyEmail}
                    type="button"
                    title="Copy Email"
                    className="p-2 rounded-lg border border-border/60 bg-card hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {copiedEmail ? (
                      <Icons.CheckCircle className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <Icons.Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {/* Phone & WhatsApp */}
                <div className="rounded-xl border border-border/80 bg-secondary/40 p-3.5 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    <Icons.BiSupport className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[11px] font-mono text-muted-foreground">Phone &amp; WhatsApp</p>
                    <a
                      href={`tel:${settings.whatsapp?.replace(/[\s-]/g, "") || "+8801719857898"}`}
                      className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                    >
                      {settings.whatsapp || "+880 171 985 7898"}
                    </a>
                  </div>
                </div>

                {/* Location & Timezone */}
                <div className="rounded-xl border border-border/80 bg-secondary/40 p-3.5 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                    <Icons.MapPin className="h-4 w-4 text-foreground" />
                  </div>
                  <div>
                    <p className="text-[11px] font-mono text-muted-foreground">Location</p>
                    <p className="text-sm font-medium text-foreground">
                      {settings.location || "Sherpur, Bogura, Bangladesh (UTC+6)"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Note */}
              <div className="pt-2 border-t border-border/70 flex items-center gap-2 font-mono text-xs text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Typical response time: {settings.responseTime || "Under 2 hours"}</span>
              </div>
            </div>
          </div>

          {/* Right Column: High-Tech Project Inquiry Form */}
          <div className="lg:col-span-7">
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl border border-border bg-card/70 p-6 sm:p-8 backdrop-blur-md space-y-5"
            >
              {/* Project Type Selectors */}
              <div>
                <label className="block text-xs font-mono text-muted-foreground mb-2">
                  What are you interested in discussing?
                </label>
                <div className="flex flex-wrap gap-2">
                  {PROJECT_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({ ...formData, projectType: type })}
                      className={`rounded-lg px-3 py-1.5 text-xs font-mono transition-all ${
                        formData.projectType === type
                          ? "bg-primary text-white border border-primary shadow-sm"
                          : "border border-border/80 bg-secondary/40 text-muted-foreground hover:text-foreground hover:bg-secondary"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-muted-foreground mb-1.5">
                    Your Name *
                  </label>
                  <Input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g. Alex Morgan"
                    className="w-full rounded-xl border border-border bg-secondary/40 px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-1 focus-visible:ring-primary h-11"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-muted-foreground mb-1.5">
                    Email Address *
                  </label>
                  <Input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="alex@company.com"
                    className="w-full rounded-xl border border-border bg-secondary/40 px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-1 focus-visible:ring-primary h-11"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-muted-foreground mb-1.5">
                  Subject
                </label>
                <Input
                  type="text"
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  placeholder="New Project / Full-Time Engineering Opportunity"
                  className="w-full rounded-xl border border-border bg-secondary/40 px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-1 focus-visible:ring-primary h-11"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-muted-foreground mb-1.5">
                  Message *
                </label>
                <Textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  placeholder="Briefly describe your project goals, scope, or timeline..."
                  className="w-full rounded-xl border border-border bg-secondary/40 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-1 focus-visible:ring-primary resize-none"
                />
              </div>

              <div className="pt-2">
                <CustomButton
                  btnText={loading ? "Sending..." : "Send Message"}
                  variant="default"
                  size="lg"
                  loading={loading}
                  className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-white font-medium px-8 h-11 shadow-lg shadow-primary/20"
                />
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
