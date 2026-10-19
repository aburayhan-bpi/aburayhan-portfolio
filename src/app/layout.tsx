import { AnalyticsBeacon } from "@/components/shared/AnalyticsBeacon";
import { CustomToaster } from "@/components/shared/CustomToaster";
import { fontBengali, fontSans } from "@/lib/fonts";
import ReduxProvider from "@/redux/ReduxProvider";
import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/siteUrl";
import "./globals.css";

const baseUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Abu Rayhan | Frontend Developer",
    template: "%s | Abu Rayhan",
  },
  description:
    "Official portfolio of Abu Rayhan — Frontend Developer specialized in high-performance Next.js applications, responsive user interfaces, and modern web products.",
  keywords: [
    "Md Abu Rayhan",
    "Abu Rayhan",
    "Abu Rayhan Frontend Developer",
    "Abu Rayhan Developer",
    "Abu Rayhan Portfolio",
    "Abu Rayhan Web Developer",
    "Abu Rayhan Bogura",
    "Abu Rayhan Sherpur",
    "Bogura Polytechnic Institute Abu Rayhan",
    "SM Technology Abu Rayhan",
    "RaanTech ERP Abu Rayhan",
    "UAEPL8 Abu Rayhan",
    "FanSphere Abu Rayhan",
    "Frontend Developer Bangladesh",
    "Next.js Developer Bangladesh",
    "React.js Developer Dhaka",
    "Redux Toolkit RTK Query Specialist",
    "TypeScript Tailwind CSS Developer",
  ],
  authors: [{ name: "Md Abu Rayhan", url: baseUrl }],
  creator: "Md Abu Rayhan",
  publisher: "Md Abu Rayhan",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  alternates: {
    canonical: baseUrl,
  },
  openGraph: {
    type: "profile",
    locale: "en_US",
    url: baseUrl,
    title: "Abu Rayhan | Frontend Developer",
    description:
      "Official portfolio of Abu Rayhan — Frontend Developer specialized in building high-performance Next.js applications and responsive web systems.",
    siteName: "Abu Rayhan Portfolio",
    images: [
      {
        url: "/logo.svg",
        width: 1200,
        height: 630,
        alt: "Abu Rayhan • Frontend Developer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Abu Rayhan | Frontend Developer",
    description:
      "Frontend Developer specialized in high-performance Next.js architectures, modern web interfaces, and TypeScript.",
    images: ["/logo.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`
          ${fontSans.variable}
          ${fontBengali.variable}
          antialiased
        `}
      >
        <ReduxProvider>
          <div className="min-h-screen">
            <AnalyticsBeacon />
            <CustomToaster />
            {children}
          </div>
        </ReduxProvider>
      </body>
    </html>
  );
}
