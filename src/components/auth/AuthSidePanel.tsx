import { Code2, ShieldCheck, Zap } from "lucide-react";

interface AuthSidePanelProps {
  heading?: string;
  subheading?: string;
}

export function AuthSidePanel({
  heading = "Engineering Workspace",
  subheading = "Architecting modern, scalable web applications with clean code, responsive design, and intuitive user experiences.",
}: AuthSidePanelProps) {
  return (
    <div className="hidden lg:flex lg:col-span-5 xl:col-span-5 bg-card text-foreground relative flex-col justify-between p-8 xl:p-12 overflow-hidden lg:border-l border-border">
      {/* Ambient background decoration */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_30%_20%,var(--primary)_0%,transparent_60%)]"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-accent/10 blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      {/* Top Status Indicator */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/80 border border-border text-[11px] font-mono text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Engineering Portal</span>
        </div>
        <span className="text-[11px] font-mono text-muted-foreground/70">Production</span>
      </div>

      {/* Center Overview */}
      <div className="relative z-10 space-y-6 my-auto py-8">
        <div className="space-y-2">
          <h2 className="text-2xl xl:text-3xl font-bold font-heading tracking-tight leading-tight text-foreground">
            {heading}
          </h2>
          <p className="text-xs xl:text-sm text-muted-foreground leading-relaxed max-w-md">
            {subheading}
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="space-y-3.5 pt-2">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-secondary border border-border flex items-center justify-center shrink-0">
              <Code2 className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">
                Projects &amp; Case Studies
              </p>
              <p className="text-[11px] text-muted-foreground leading-tight">
                Showcasing modern web applications, scalable architectures, and interactive experiences.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-secondary border border-border flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4 text-accent" />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">
                Performance &amp; Accessibility
              </p>
              <p className="text-[11px] text-muted-foreground leading-tight">
                Optimized Core Web Vitals, ultra-fast asset delivery, and responsive layouts across all devices.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-secondary border border-border flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">
                Security &amp; Clean Code
              </p>
              <p className="text-[11px] text-muted-foreground leading-tight">
                Type-safe API endpoints, robust authentication, and enterprise-grade code quality.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Marker */}
      <div className="relative z-10 pt-4 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground font-mono">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-primary" />
          <span>Secure Authentication</span>
        </span>
        <span>Md Abu Rayhan</span>
      </div>
    </div>
  );
}
