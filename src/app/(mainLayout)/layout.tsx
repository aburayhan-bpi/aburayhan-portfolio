import Footer from "@/components/shared/Footer";
import Navbar from "@/components/shared/Navbar";
import { SiteSettingsProvider } from "@/context/SiteSettingsContext";
import type React from "react";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SiteSettingsProvider>
      <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </SiteSettingsProvider>
  );
}
