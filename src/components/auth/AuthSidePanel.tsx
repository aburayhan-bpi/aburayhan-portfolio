import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, Sparkles, Terminal, Code2 } from "lucide-react";

interface AuthSidePanelProps {
  heading?: string;
  subheading?: string;
}

export function AuthSidePanel({
  heading = "Developer Admin Console",
  subheading = "Manage portfolio projects, blog posts, telemetry data, and direct recruiter messages.",
}: AuthSidePanelProps) {
  return (
    <div className="hidden lg:flex lg:col-span-5 xl:col-span-5 bg-card text-foreground relative flex-col justify-between p-8 xl:p-12 overflow-hidden border-r border-border">
      {/* Ambient background decoration */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_30%_20%,var(--primary)_0%,transparent_60%)]"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-accent/10 blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      {/* Top Brand Link */}
      <div className="relative z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 group cursor-pointer focus:outline-hidden"
          aria-label="Abu Rayhan Portfolio"
        >
          <div className="bg-secondary/80 border border-border px-3 py-1.5 rounded-lg shadow-sm">
            <Image
              src="/logo.svg"
              alt="Abu Rayhan"
              width={140}
              height={35}
              priority
              loading="eager"
              className="h-7 w-auto object-contain"
            />
          </div>
        </Link>
        <span className="block mt-2 text-[11px] font-mono tracking-wide text-muted-foreground uppercase">
          Full-Stack Engineering Workspace
        </span>
      </div>

      {/* Center Value Proposition */}
      <div className="relative z-10 space-y-6 my-auto py-8">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-mono">
          <Sparkles className="w-3.5 h-3.5 text-accent" />
          <span>Restricted Admin Portal</span>
        </div>

        <div className="space-y-2.5">
          <h2 className="text-2xl xl:text-3xl font-bold font-heading tracking-tight leading-tight text-foreground">
            {heading}
          </h2>
          <p className="text-xs xl:text-sm text-muted-foreground leading-relaxed max-w-md">
            {subheading}
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="space-y-3 pt-2">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-secondary border border-border flex items-center justify-center shrink-0">
              <Code2 className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">
                Projects &amp; Case Studies CRUD
              </p>
              <p className="text-[11px] text-muted-foreground leading-tight">
                Create, update, and re-order engineering projects with real-time UI previews.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-secondary border border-border flex items-center justify-center shrink-0">
              <Terminal className="w-4 h-4 text-accent" />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">
                Live Skill Matrix &amp; Highlights
              </p>
              <p className="text-[11px] text-muted-foreground leading-tight">
                Instantly adjust proficiency tags, timeline items, and tech stack categories.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-secondary border border-border flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4 text-success" />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">
                Secure Session Authentication
              </p>
              <p className="text-[11px] text-muted-foreground leading-tight">
                JWT-backed secret admin access with protected route guards and rate limiting.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Marker */}
      <div className="relative z-10 pt-4 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground font-mono">
        <span>Abu Rayhan Portfolio v2.0</span>
        <span className="font-semibold text-foreground">Authorized Access Only</span>
      </div>
    </div>
  );
}
