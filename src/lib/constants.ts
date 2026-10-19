export interface SidebarSubItem {
  id: string;
  label: string;
  href: string;
  icon?: string;
  tabKey?: string;
}

export interface SidebarItem {
  id: string;
  label: string;
  href: string;
  icon: string;
  roles: string[];
  children?: SidebarSubItem[];
}

export interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

export const SIDEBAR_SECTIONS: SidebarSection[] = [
  {
    title: "Portfolio CMS",
    items: [
      {
        id: "admin-dashboard",
        label: "Overview",
        href: "/dashboard/admin",
        icon: "LayoutDashboard",
        roles: ["ADMIN", "SUPER_ADMIN"],
      },
      {
        id: "admin-projects",
        label: "Projects",
        href: "/dashboard/admin/projects",
        icon: "MonitorPlay",
        roles: ["ADMIN", "SUPER_ADMIN"],
      },
      {
        id: "admin-skills",
        label: "Skills & Stack",
        href: "/dashboard/admin/skills",
        icon: "Users",
        roles: ["ADMIN", "SUPER_ADMIN"],
      },
      {
        id: "admin-experience",
        label: "Experience & Education",
        href: "/dashboard/admin/experience",
        icon: "Briefcase",
        roles: ["ADMIN", "SUPER_ADMIN"],
      },
    ],
  },
  {
    title: "Audience & Growth",
    items: [
      {
        id: "admin-messages",
        label: "Messages & Leads",
        href: "/dashboard/admin/messages",
        icon: "CalendarCheck",
        roles: ["ADMIN", "SUPER_ADMIN"],
      },
      {
        id: "admin-analytics",
        label: "Visitor Analytics",
        href: "/dashboard/admin/analytics",
        icon: "BarChart3",
        roles: ["ADMIN", "SUPER_ADMIN"],
      },
    ],
  },
  {
    title: "System & Infrastructure",
    items: [
      {
        id: "admin-security",
        label: "Security & DDoS",
        href: "/dashboard/admin/security",
        icon: "Shield",
        roles: ["ADMIN", "SUPER_ADMIN"],
        children: [
          {
            id: "sec-firewall",
            label: "Firewall & WAF",
            href: "/dashboard/admin/security?tab=firewall",
            icon: "ShieldAlert",
            tabKey: "firewall",
          },
          {
            id: "sec-blacklist",
            label: "IP Blacklist",
            href: "/dashboard/admin/security?tab=blacklist",
            icon: "Shield",
            tabKey: "blacklist",
          },
          {
            id: "sec-whitelist",
            label: "IP Whitelist",
            href: "/dashboard/admin/security?tab=whitelist",
            icon: "ShieldCheck",
            tabKey: "whitelist",
          },
          {
            id: "sec-logs",
            label: "Incident Logs",
            href: "/dashboard/admin/security?tab=logs",
            icon: "Activity",
            tabKey: "logs",
          },
        ],
      },
      {
        id: "admin-settings",
        label: "Site Settings",
        href: "/dashboard/admin/settings",
        icon: "Settings",
        roles: ["ADMIN", "SUPER_ADMIN"],
      },
    ],
  },
];

export const SIDEBAR_ITEMS: SidebarItem[] = SIDEBAR_SECTIONS.flatMap(
  (section) => section.items,
);

// website details for Abu Rayhan's Portfolio
export const WEBSITE_DETAILS = {
  SITE_NAME: "Abu Rayhan | Full-Stack Software Engineer & UI/UX Designer",
  SITE_ONLY_NAME: "Abu Rayhan",
  SITE_TITLE: "Abu Rayhan",
  SITE_TAGLINE: "Full-Stack Software Engineer & UI/UX Designer",
  SITE_DESCRIPTION:
    "Portfolio of Abu Rayhan — Senior Full-Stack Web Developer & UI/UX Designer specialized in scalable Next.js architectures, modern APIs, and high-performance digital products.",
  SITE_DESC: "Full-Stack Software Engineer & UI/UX Designer",
  SITE_DASHBOARD_TITLE: "Abu Rayhan • Admin Console",
  SITE_DASHBOARD_SUBTITLE: "Portfolio Content & Project Management",
  SITE_LOGO: "/logo.svg",
  SITE_ICON: "/icon.svg",
  AVATAR1: "/placeholder/avatar1.jpg",
  AVATAR2: "/placeholder/avatar2.jpg",
};

export const paginationLimit = 25;
