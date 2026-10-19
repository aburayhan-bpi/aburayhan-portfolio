"use client";

import type React from "react";
import {
  SIDEBAR_SECTIONS,
  SidebarItem,
  SidebarSection,
  SidebarSubItem,
  WEBSITE_DETAILS,
} from "@/lib/constants";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Icons } from "../../utils/icons";
import { LogoutButton } from "./LogoutButton";

interface SidebarProps {
  isOpen: boolean;
  isCollapsed: boolean;
  onClose: () => void;
}

function SidebarNavList({
  isCollapsed,
  onClose,
}: {
  isCollapsed: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams?.get("tab") || "firewall";

  // Track accordion expand/collapse state with user overrides
  const [userExpanded, setUserExpanded] = useState<Record<string, boolean>>({});
  const [prevPathname, setPrevPathname] = useState(pathname);

  // When route changes, reset manual toggles so the active route determines expansion
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setUserExpanded({});
  }

  const toggleExpand = (id: string, currentExpanded: boolean, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setUserExpanded((prev) => ({
      ...prev,
      [id]: !currentExpanded,
    }));
  };

  const getIcon = (iconName: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      LayoutDashboard: <Icons.LayoutDashboard className="w-5 h-5" />,
      MonitorPlay: <Icons.MonitorPlay className="w-5 h-5" />,
      Users: <Icons.Users className="w-5 h-5" />,
      Briefcase: <Icons.HiOutlineBriefcase className="w-5 h-5" />,
      CalendarCheck: <Icons.CalendarCheck className="w-5 h-5" />,
      BarChart3: <Icons.BarChart3 className="w-5 h-5" />,
      Shield: <Icons.Shield className="w-5 h-5" />,
      Settings: <Icons.Settings className="w-5 h-5" />,
    };
    return iconMap[iconName] || <Icons.LayoutDashboard className="w-5 h-5" />;
  };

  const getSubIcon = (iconName?: string, isActive?: boolean) => {
    const activeColor = isActive ? "text-primary" : "text-muted-foreground";
    switch (iconName) {
      case "ShieldAlert":
        return <Icons.ShieldAlert className={`w-3.5 h-3.5 ${activeColor}`} />;
      case "ShieldCheck":
        return <Icons.ShieldCheck className={`w-3.5 h-3.5 ${activeColor}`} />;
      case "Shield":
        return <Icons.Shield className={`w-3.5 h-3.5 ${activeColor}`} />;
      case "Activity":
        return <Icons.Activity className={`w-3.5 h-3.5 ${activeColor}`} />;
      default:
        return <Icons.Shield className={`w-3.5 h-3.5 ${activeColor}`} />;
    }
  };

  return (
    <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-3">
      {SIDEBAR_SECTIONS.map((section: SidebarSection, sectionIdx: number) => (
        <div key={section.title} className="space-y-1">
          {/* Section Heading (Hidden in collapsed mode; subtle divider shown instead) */}
          {isCollapsed ? (
            sectionIdx > 0 && (
              <div
                className="my-2 border-t border-border/60 mx-1"
                aria-hidden="true"
              />
            )
          ) : (
            <div className="px-3 pb-1 pt-1.5 first:pt-0">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground/70 select-none">
                {section.title}
              </span>
            </div>
          )}

          {/* Section Items */}
          <div className="space-y-1">
            {section.items.map((item: SidebarItem) => {
              const hasChildren = Boolean(
                item.children && item.children.length > 0,
              );
              const isItemActive = Boolean(
                pathname === item.href ||
                  (hasChildren &&
                    item.children?.some(
                      (c: SidebarSubItem) => pathname === c.href.split("?")[0],
                    )),
              );

              const isExpanded =
                userExpanded[item.id] !== undefined
                  ? userExpanded[item.id]
                  : isItemActive;

              // Collapsed state (icon-only mode)
              if (isCollapsed) {
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => onClose()}
                    className={`flex items-center justify-center px-2 py-2.5 rounded-xl transition-colors font-medium text-sm ${
                      isItemActive
                        ? "bg-primary text-white shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/70"
                    }`}
                    title={item.label}
                  >
                    {getIcon(item.icon)}
                  </Link>
                );
              }

              // Accordion with nested tree-branch children
              if (hasChildren && item.children) {
                return (
                  <div key={item.id} className="space-y-1">
                    {/* Parent Item Header */}
                    <div
                      onClick={(e) => toggleExpand(item.id, isExpanded, e)}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all font-medium text-sm cursor-pointer select-none group ${
                        isItemActive && !isExpanded
                          ? "bg-primary/10 text-primary border border-primary/20"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary/70"
                      }`}
                    >
                      <Link
                        href={item.href}
                        onClick={() => {
                          // On mobile, navigate and close; on desktop allow navigation while keeping tree open
                          if (
                            typeof window !== "undefined" &&
                            window.innerWidth < 1024
                          )
                            onClose();
                        }}
                        className="flex items-center gap-3 min-w-0 flex-1"
                      >
                        <span
                          className={
                            isItemActive
                              ? "text-primary"
                              : "text-muted-foreground"
                          }
                        >
                          {getIcon(item.icon)}
                        </span>
                        <span className="truncate">{item.label}</span>
                      </Link>

                      {/* Chevron Toggle */}
                      <button
                        type="button"
                        onClick={(e) => toggleExpand(item.id, isExpanded, e)}
                        className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                        aria-label={
                          isExpanded ? "Collapse section" : "Expand section"
                        }
                      >
                        <Icons.ChevronDownIcon
                          className={`w-3.5 h-3.5 transition-transform duration-200 ${
                            isExpanded ? "rotate-180 text-foreground" : ""
                          }`}
                        />
                      </button>
                    </div>

                    {/* Collapsible Tree-View Sub-Items */}
                    {isExpanded && (
                      <div className="relative ml-5 pl-3.5 space-y-1 pt-1 pb-1 animate-in fade-in-50 duration-200">
                        {/* Continuous Vertical Guide Line */}
                        <div
                          className="absolute left-0 top-0 bottom-3 w-px bg-border/70"
                          aria-hidden="true"
                        />

                        {item.children.map(
                          (child: SidebarSubItem, cIdx: number) => {
                            const isChildActive =
                              pathname === child.href.split("?")[0] &&
                              (currentTab
                                ? child.tabKey === currentTab
                                : cIdx === 0);

                            return (
                              <div
                                key={child.id}
                                className="relative flex items-center"
                              >
                                {/* Curved Tree-Branch Arch Line */}
                                <span
                                  className={`absolute -left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-4 border-b border-l rounded-bl-md pointer-events-none transition-colors ${
                                    isChildActive
                                      ? "border-primary"
                                      : "border-border/70"
                                  }`}
                                  aria-hidden="true"
                                />

                                {/* Child Nav Link */}
                                <Link
                                  href={child.href}
                                  onClick={() => onClose()}
                                  className={`flex-1 flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all ${
                                    isChildActive
                                      ? "bg-primary/15 text-primary font-semibold shadow-2xs border border-primary/25"
                                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                                  }`}
                                >
                                  <div className="flex items-center gap-2 truncate">
                                    {getSubIcon(child.icon, isChildActive)}
                                    <span className="truncate">
                                      {child.label}
                                    </span>
                                  </div>

                                  {child.tabKey === "firewall" && (
                                    <span
                                      className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0"
                                      title="Firewall active"
                                    />
                                  )}
                                </Link>
                              </div>
                            );
                          },
                        )}
                      </div>
                    )}
                  </div>
                );
              }

              // Standard Single Nav Link
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => onClose()}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-colors font-medium text-sm ${
                    isActive
                      ? "bg-primary text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/70"
                  }`}
                >
                  {getIcon(item.icon)}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

export function Sidebar({ isOpen, isCollapsed, onClose }: SidebarProps) {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-xs lg:hidden z-30"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-screen bg-card border-r border-border transition-all duration-300 z-40 lg:relative lg:z-0 ${
          isOpen ? "w-64" : "-translate-x-full lg:translate-x-0"
        } ${isCollapsed ? "lg:w-20" : "lg:w-64"}`}
      >
        <div className="flex flex-col h-full">
          {/* Logo Header */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-border">
            <div
              className={`flex items-center ${
                isCollapsed ? "lg:justify-center lg:w-full" : ""
              }`}
            >
              <Link
                href="/dashboard/admin"
                className={`flex items-center min-w-0 ${
                  isCollapsed ? "justify-center" : ""
                }`}
              >
                <Image
                  src={WEBSITE_DETAILS.SITE_LOGO}
                  alt={WEBSITE_DETAILS.SITE_ONLY_NAME}
                  width={160}
                  height={44}
                  draggable={false}
                  priority
                  loading="eager"
                  className={`shrink-0 object-contain object-left ${
                    isCollapsed ? "h-8 w-8 object-center" : "h-9 w-32"
                  }`}
                />
              </Link>
            </div>

            <button
              onClick={onClose}
              className="lg:hidden text-muted-foreground hover:text-foreground p-1"
              aria-label="Close sidebar"
            >
              <Icons.X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Body with Suspense for Next.js searchParams safety */}
          <Suspense
            fallback={
              <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 animate-pulse" />
            }
          >
            <SidebarNavList isCollapsed={isCollapsed} onClose={onClose} />
          </Suspense>

          {/* Footer Logout */}
          <div className="p-4 border-t border-border">
            <LogoutButton isCollapsed={isCollapsed} />
          </div>
        </div>
      </aside>
    </>
  );
}
