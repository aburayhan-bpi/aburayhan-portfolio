"use client";

import { useSiteSettings } from "@/context/SiteSettingsContext";
import { WEBSITE_DETAILS } from "@/lib/constants";
import { Icons } from "@/utils/icons";
import Image from "next/image";
import Link from "next/link";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { settings } = useSiteSettings();

  const socialLinks = [
    {
      name: "GitHub",
      href: settings.githubUrl || "https://github.com",
      icon: Icons.FaGithub,
    },
    {
      name: "LinkedIn",
      href: settings.linkedinUrl || "https://linkedin.com",
      icon: Icons.FaLinkedin,
    },
    ...(settings.twitterUrl
      ? [
          {
            name: "Twitter / X",
            href: settings.twitterUrl,
            icon: Icons.FaTwitter,
          },
        ]
      : []),
    ...(settings.leetcodeUrl
      ? [
          {
            name: "LeetCode",
            href: settings.leetcodeUrl,
            icon: Icons.SiLeetcode,
          },
        ]
      : []),
    ...(settings.blogUrl
      ? [
          {
            name: "Technical Blog",
            href: settings.blogUrl,
            icon: Icons.LuBookOpen,
          },
        ]
      : []),
    {
      name: "Email",
      href: `mailto:${settings.primaryEmail || "aburayhan.bpi@gmail.com"}`,
      icon: Icons.Mail,
    },
  ];

  return (
    <footer className="border-t border-border bg-card/40 backdrop-blur-sm">
      <div className="customContainer mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center justify-between">
          {/* Brand Info */}
          <div className="md:col-span-6 space-y-4">
            <Link href="/" className="inline-block">
              <Image
                src={WEBSITE_DETAILS.SITE_LOGO}
                alt={settings.siteName || WEBSITE_DETAILS.SITE_ONLY_NAME}
                width={150}
                height={38}
                loading="eager"
                className="h-9 w-auto object-contain"
              />
            </Link>
            <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
              {settings.bio ||
                "Frontend Developer specializing in Next.js, React, modern web UI, and high-performance digital products. Available for global remote opportunities and consulting."}
            </p>
            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Based in {settings.location || "Sherpur, Bogura, Bangladesh (UTC+6)"}</span>
            </div>
          </div>

          {/* Quick Links & Socials */}
          <div className="md:col-span-6 flex flex-col md:items-end justify-between gap-6">
            <div className="flex items-center gap-3">
              {socialLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={item.name}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-all hover:border-primary hover:text-primary hover:bg-primary/10 hover:scale-105 active:scale-95"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-muted-foreground">
              <a href="#about" className="hover:text-foreground transition-colors">
                About
              </a>
              <a href="#skills" className="hover:text-foreground transition-colors">
                Skills
              </a>
              <a href="#projects" className="hover:text-foreground transition-colors">
                Projects
              </a>
              <a href="#experience" className="hover:text-foreground transition-colors">
                Experience
              </a>
              <a href="#contact" className="hover:text-foreground transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>
            © {currentYear} {settings.siteName || "Abu Rayhan"}. Handcrafted with Next.js &amp; Tailwind CSS.
          </p>
          <p className="font-mono text-muted-foreground/80">
            Engineered with high performance &amp; accessibility.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
