"use client";

import type React from "react";
import { SIDEBAR_ITEMS, WEBSITE_DETAILS } from "@/lib/constants";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icons } from "../../utils/icons";
import { LogoutButton } from "./LogoutButton";

interface SidebarProps {
  isOpen: boolean;
  isCollapsed: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, isCollapsed, onClose }: SidebarProps) {
  const pathname = usePathname();

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
                {/* LOGO */}
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

          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
            {SIDEBAR_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => onClose()}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors font-medium text-sm ${
                    isActive
                      ? "bg-primary text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/70"
                  } ${isCollapsed ? "lg:justify-center lg:px-2" : ""}`}
                  title={isCollapsed ? item.label : undefined}
                >
                  {getIcon(item.icon)}
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-border">
            <LogoutButton isCollapsed={isCollapsed} />
          </div>
        </div>
      </aside>
    </>
  );
}
