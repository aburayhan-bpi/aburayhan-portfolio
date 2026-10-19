import CustomButton from "@/components/shared/CustomButton";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { Badge } from "@/components/ui/badge";
import { copyToClipboard } from "@/lib/clipboard";
import { Icons } from "@/utils/icons";
import { getStatusConfig } from "@/utils/status";
import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";

export const HeroSection = () => {
  const [activeTab, setActiveTab] = useState<"architect" | "stack">("architect");
  const [copied, setCopied] = useState(false);
  const { settings } = useSiteSettings();
  const statusConfig = getStatusConfig(settings.availabilityStatus);

  const codeSnippet = `// ${settings.siteName || "Abu Rayhan"} • Frontend Developer
const developer: DeveloperProfile = {
  name: "${settings.siteName || "Abu Rayhan"}",
  role: "${settings.tagline || "Frontend Developer"}",
  location: "${settings.location || "Dhaka, Bangladesh (Remote-Ready)"}",
  specialization: [
    "Next.js App Router & React Architecture",
    "Tailwind CSS, Radix UI & Design Systems",
    "TypeScript & High-Performance Web UI",
    "RESTful API Integration & Client State"
  ],
  availableForHire: true,
  buildPhilosophy: "High-Performance, Zero-Fluff, Type-Safe"
};

export default developer;`;

  const handleCopy = async () => {
    const success = await copyToClipboard(codeSnippet);
    if (success) {
      setCopied(true);
      toast.success("Developer profile code copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error("Failed to copy code snippet");
    }
  };

  return (
    <section id="about" className="relative pt-12 pb-16 md:pt-20 md:pb-24 overflow-hidden">
      {/* Precision 1px subtle background grid lines (Anti-AI handcrafted feel) */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black_70%,transparent_100%)] opacity-25 pointer-events-none" />

      <div className="customContainer mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          {/* Left Column: Text & Value Proposition */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="lg:col-span-7 space-y-6 text-left"
          >
            {/* Live Status Pill */}
            <div className={`inline-flex items-center gap-2.5 rounded-full border px-3.5 py-1.5 backdrop-blur-md ${statusConfig.badgeClass}`}>
              <span className="relative flex h-2.5 w-2.5">
                {statusConfig.shouldPing && (
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${statusConfig.pingColor}`} />
                )}
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${statusConfig.dotColor}`} />
              </span>
              <span className={`text-xs font-mono font-medium ${statusConfig.textColor}`}>
                {statusConfig.cleanText}
              </span>
              <span className="text-border/80">•</span>
              <span className="text-xs font-mono text-muted-foreground">{settings.location}</span>
            </div>

            {/* Direct & Authentic High-Hierarchy Headline for Rank-1 Google SEO */}
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-[4rem] font-extrabold tracking-tight text-foreground leading-[1.08]">
                Hi, I&apos;m{" "}
                <span className="bg-gradient-to-r from-accent via-primary to-primary bg-clip-text text-transparent">
                  {settings.siteName || "Abu Rayhan"}
                </span>
                .
                <span className="block text-2xl sm:text-3xl lg:text-4xl font-semibold text-muted-foreground mt-2">
                  {settings.tagline || "Frontend Developer"}
                </span>
              </h1>
            </div>

            {/* Direct & Authentic Engineering Bio from Resume */}
            <p className="text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed">
              {settings.bio || "Frontend Developer with experience in React.js, Next.js, TypeScript, Redux Toolkit, and RTK Query. Building clean, responsive interfaces and practical web applications."}
            </p>

            {/* Core Tech Stack Badges (Clean & Focused) */}
            <div className="flex flex-wrap gap-2 pt-1">
              {["Next.js", "TypeScript", "React.js", "Redux Toolkit", "RTK Query", "Node.js", "MongoDB"].map(
                (skill) => (
                  <Badge
                    key={skill}
                    variant="outline"
                    className="border-border/80 bg-secondary/50 text-muted-foreground hover:text-foreground font-mono text-xs px-2.5 py-1"
                  >
                    {skill}
                  </Badge>
                )
              )}
            </div>

            {/* Action Buttons using reusable CustomButton */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <CustomButton
                btnText="Explore Projects"
                variant="default"
                size="lg"
                btnLink="#projects"
                className="bg-primary hover:bg-primary-dark text-primary-foreground shadow-lg shadow-primary/25 font-medium px-6 h-11"
              />
              <CustomButton
                btnText="Let's Talk"
                variant="outline"
                size="lg"
                btnLink="#contact"
                className="border-border hover:border-primary text-foreground font-medium px-6 h-11"
              />
              
              {/* Quick Socials */}
              <div className="flex items-center gap-2 pl-2">
                <a
                  href={settings.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  title="GitHub Profile"
                  className="p-2.5 rounded-lg border border-border bg-card text-muted-foreground hover:text-primary hover:border-primary transition-colors"
                >
                  <Icons.FaGithub className="h-5 w-5" />
                </a>
                <a
                  href={settings.linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  title="LinkedIn Profile"
                  className="p-2.5 rounded-lg border border-border bg-card text-muted-foreground hover:text-primary hover:border-primary transition-colors"
                >
                  <Icons.FaLinkedin className="h-5 w-5" />
                </a>
                {settings.leetcodeUrl && (
                  <a
                    href={settings.leetcodeUrl}
                    target="_blank"
                    rel="noreferrer"
                    title="LeetCode Problem-Solving Profile"
                    className="p-2.5 rounded-lg border border-border bg-card text-muted-foreground hover:text-amber-400 hover:border-amber-400/50 transition-colors"
                  >
                    <Icons.SiLeetcode className="h-5 w-5" />
                  </a>
                )}
                {settings.blogUrl && (
                  <a
                    href={settings.blogUrl}
                    target="_blank"
                    rel="noreferrer"
                    title="Technical Blog & Articles"
                    className="p-2.5 rounded-lg border border-border bg-card text-muted-foreground hover:text-sky-400 hover:border-sky-400/50 transition-colors"
                  >
                    <Icons.LuBookOpen className="h-5 w-5" />
                  </a>
                )}
              </div>
            </div>
          </motion.div>

          {/* Right Column: Handcrafted Engineering Terminal (Authentic Artifact) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
            className="lg:col-span-5"
          >
            <div className="relative rounded-2xl border border-border bg-card/90 shadow-2xl shadow-black/60 backdrop-blur-xl overflow-hidden">
              {/* Window Header */}
              <div className="flex items-center justify-between border-b border-border/80 bg-secondary/40 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-destructive/80 inline-block" />
                  <span className="h-3 w-3 rounded-full bg-accent/80 inline-block" />
                  <span className="h-3 w-3 rounded-full bg-success/80 inline-block" />
                  <span className="ml-2 font-mono text-xs text-muted-foreground">
                    rayhan@dev-box: ~
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setActiveTab("architect")}
                    className={`font-mono text-xs px-2.5 py-1 rounded transition-colors ${
                      activeTab === "architect"
                        ? "bg-primary/20 text-accent font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    developer.ts
                  </button>
                  <button
                    onClick={() => setActiveTab("stack")}
                    className={`font-mono text-xs px-2.5 py-1 rounded transition-colors ${
                      activeTab === "stack"
                        ? "bg-primary/20 text-accent font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    metrics.json
                  </button>
                  <button
                    onClick={handleCopy}
                    title="Copy snippet"
                    className="ml-2 p-1 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {copied ? (
                      <Icons.CheckCircle className="h-3.5 w-3.5 text-success" />
                    ) : (
                      <Icons.Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Terminal Code Window */}
              <div className="p-5 font-mono text-xs leading-relaxed overflow-x-auto text-muted-foreground">
                {activeTab === "architect" ? (
                  <pre className="text-left font-mono">
                    <code>
                      <span className="text-primary">const</span>{" "}
                      <span className="text-accent font-semibold">developer</span> = &#123;{"\n"}
                      {"  "}name: <span className="text-success">&quot;{settings.siteName || "Abu Rayhan"}&quot;</span>,{"\n"}
                      {"  "}role: <span className="text-success">&quot;{settings.tagline || "Frontend Developer"}&quot;</span>,{"\n"}
                      {"  "}expYears: <span className="text-primary">{settings.yearsOfExperience || 5}+</span>,{"\n"}
                      {"  "}stack: [&#39;Next.js&#39;, &#39;TypeScript&#39;, &#39;Node.js&#39;, &#39;MongoDB&#39;],{"\n"}
                      {"  "}status: <span className="text-success">&quot;{settings.availabilityStatus || "🟢 Available for Work"}&quot;</span>,{"\n"}
                      {"  "}philosophy: <span className="text-accent">&quot;Clean Architecture &gt; Buzzwords&quot;</span>
                      {"\n"}&#125;;
                    </code>
                  </pre>
                ) : (
                  <pre className="text-left font-mono">
                    <code>
                      &#123;{"\n"}
                      {"  "}&quot;uptime&quot;: <span className="text-success">&quot;99.98%&quot;</span>,{"\n"}
                      {"  "}&quot;performanceScore&quot;: <span className="text-success">&quot;98/100 Lighthouse&quot;</span>,{"\n"}
                      {"  "}&quot;projectsDelivered&quot;: <span className="text-primary">{settings.completedProjectsCount || 45}+</span>,{"\n"}
                      {"  "}&quot;codeQuality&quot;: <span className="text-accent">&quot;Strict TypeScript &amp; Zod&quot;</span>,{"\n"}
                      {"  "}&quot;responseRate&quot;: <span className="text-success">&quot;{settings.responseTime || "< 2 hours"}&quot;</span>{"\n"}
                      &#125;
                    </code>
                  </pre>
                )}
              </div>

              {/* Terminal Footer Status Bar */}
              <div className="flex items-center justify-between border-t border-border/80 bg-secondary/30 px-4 py-2 font-mono text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-success" />
                  Terminal Online
                </span>
                <span>UTF-8 • Next.js 16.4</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
