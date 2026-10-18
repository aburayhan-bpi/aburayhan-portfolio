"use client";

import { WEBSITE_DETAILS } from "@/lib/constants";
import { logout } from "@/redux/features/user/authSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Icons } from "../../utils/icons";

interface HeaderProps {
  onMenuClick: () => void;
  sidebarOpen: boolean;
  isCollapsed: boolean;
  onCollapseToggle: () => void;
}

export function Header({
  onMenuClick,
  sidebarOpen,
  isCollapsed,
  onCollapseToggle,
}: HeaderProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    router.replace("/login");
    router.refresh();
    toast.success("Logout successful!");
  };

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 lg:px-6 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <div className="lg:hidden rounded-md px-1">
          <Link
            href="/dashboard/admin"
            className="flex items-center justify-center font-bold"
          >
            <Image
              src={WEBSITE_DETAILS.SITE_LOGO}
              alt={WEBSITE_DETAILS.SITE_ONLY_NAME}
              width={110}
              height={32}
              draggable={false}
              priority
              loading="eager"
              className="shrink-0 h-7 w-auto object-contain"
            />
          </Link>
        </div>

        <button
          onClick={onMenuClick}
          className="lg:hidden text-muted-foreground hover:text-foreground p-2 rounded-lg bg-secondary/60 transition-colors"
          aria-label="Toggle menu"
        >
          {sidebarOpen ? (
            <Icons.TbLayoutSidebarLeftCollapseFilled className="w-5 h-5" />
          ) : (
            <Icons.TbLayoutSidebarRightCollapseFilled className="w-5 h-5" />
          )}
        </button>

        <button
          onClick={onCollapseToggle}
          className="hidden lg:flex text-muted-foreground hover:text-foreground p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
          aria-label="Toggle sidebar collapse"
        >
          {isCollapsed ? (
            <Icons.TbLayoutSidebarRightCollapseFilled className="w-5 h-5" />
          ) : (
            <Icons.TbLayoutSidebarLeftCollapseFilled className="w-5 h-5" />
          )}
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-muted-foreground">
          <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
          <span>Admin Workspace • Abu Rayhan</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Quick link back to live site */}
        <Link
          href="/"
          target="_blank"
          className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg border border-border bg-secondary/40 hover:bg-secondary transition-colors"
        >
          <span>View Live Portfolio</span>
          <Icons.ExternalLink className="w-3.5 h-3.5" />
        </Link>

        {/* User Profile dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2.5 p-1 rounded-full border border-border hover:border-primary/50 transition-colors"
            aria-label="User menu"
          >
            <div className="h-8 w-8 rounded-full bg-primary/20 text-primary border border-primary/30 flex items-center justify-center font-bold text-xs font-mono">
              AR
            </div>
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-card border border-border text-foreground rounded-xl shadow-2xl overflow-hidden z-50">
              <div className="p-3.5 border-b border-border bg-secondary/30">
                <p className="text-sm font-semibold text-foreground">
                  {user?.firstName ? `${user.firstName} ${user.lastName ?? ""}` : "Md Abu Rayhan"}
                </p>
                <p className="text-xs text-muted-foreground font-mono truncate">
                  {user?.email || "aburayhan.bpi@gmail.com"}
                </p>
                <span className="inline-block mt-1.5 px-2 py-0.5 rounded text-[10px] font-mono bg-primary/10 text-primary border border-primary/20">
                  Administrator
                </span>
              </div>

              <div className="p-1.5 space-y-1">
                <Link
                  href="/dashboard/admin"
                  onClick={() => setShowDropdown(false)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  <Icons.LayoutDashboard className="w-4 h-4 text-primary" />
                  <span>Overview</span>
                </Link>

                <Link
                  href="/dashboard/admin/projects"
                  onClick={() => setShowDropdown(false)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  <Icons.MonitorPlay className="w-4 h-4 text-accent" />
                  <span>Manage Projects</span>
                </Link>

                <Link
                  href="/dashboard/admin/settings"
                  onClick={() => setShowDropdown(false)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  <Icons.Settings className="w-4 h-4 text-purple-400" />
                  <span>Site Settings</span>
                </Link>

                <Link
                  href="/"
                  target="_blank"
                  onClick={() => setShowDropdown(false)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  <Icons.ExternalLink className="w-4 h-4 text-success" />
                  <span>Open Portfolio</span>
                </Link>
              </div>

              <div className="p-1.5 border-t border-border">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Icons.LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
