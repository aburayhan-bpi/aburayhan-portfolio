"use client";

import CustomButton from "@/components/shared/CustomButton";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { WEBSITE_DETAILS } from "@/lib/constants";
import { Icons } from "@/utils/icons";
import { getStatusConfig } from "@/utils/status";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const NAV_LINKS = [
  { name: "About", href: "#about" },
  { name: "Skills", href: "#skills" },
  { name: "Projects", href: "#projects" },
  { name: "Experience", href: "#experience" },
  { name: "Contact", href: "#contact" },
];

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { settings } = useSiteSettings();
  const statusConfig = getStatusConfig(settings.availabilityStatus);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const resumeHref = settings.resumeUrl?.trim() || "/resume.pdf";

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? "border-b border-border/70 bg-background/85 backdrop-blur-md shadow-lg shadow-black/20"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="customContainer mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-18 items-center justify-between">
          {/* Brand Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Image
              src={WEBSITE_DETAILS.SITE_LOGO}
              alt={settings.siteName || WEBSITE_DETAILS.SITE_ONLY_NAME}
              width={160}
              height={40}
              priority
              loading="eager"
              className="h-10 w-auto object-contain"
            />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 rounded-full border border-border/80 bg-secondary/50 px-4 py-1.5 backdrop-blur-md">
            {NAV_LINKS.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground rounded-full hover:bg-white/5"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Right Action Elements */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Live Availability Badge */}
            <div className={`hidden lg:flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium max-w-[210px] truncate ${statusConfig.badgeClass}`}>
              <span className="relative flex h-2 w-2 shrink-0">
                {statusConfig.shouldPing && (
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${statusConfig.pingColor}`} />
                )}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${statusConfig.dotColor}`} />
              </span>
              <span className="truncate">{statusConfig.cleanText}</span>
            </div>

            {/* Resume Button using reusable CustomButton */}
            <CustomButton
              btnText="Get Resume"
              variant="outline"
              size="sm"
              btnLink={resumeHref}
              className="border-border hover:border-primary text-foreground text-xs font-medium h-9"
            />
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-foreground transition-colors hover:bg-secondary"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <Icons.X className="h-5 w-5" />
              ) : (
                <Icons.Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-background/95 px-4 pt-2 pb-6 backdrop-blur-xl animate-in fade-in slide-in-from-top-4 duration-200">
          <nav className="flex flex-col gap-2">
            {NAV_LINKS.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between rounded-lg px-3 py-2.5 text-base font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                {link.name}
                <Icons.ChevronRight className="h-4 w-4 opacity-50" />
              </a>
            ))}
            <div className="pt-3 border-t border-border/70 flex flex-col gap-2">
              <div className="flex items-center gap-2 rounded-lg bg-success/10 px-3 py-2 text-xs font-medium text-success">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                </span>
                <span>{settings.availabilityStatus}</span>
              </div>
              <CustomButton
                btnText="Download Resume (PDF)"
                variant="default"
                size="sm"
                btnLink={resumeHref}
                className="w-full justify-center bg-primary text-white"
              />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
