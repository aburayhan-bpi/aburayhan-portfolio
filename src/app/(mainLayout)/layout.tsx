import Footer from "@/components/shared/Footer";
import Navbar from "@/components/shared/Navbar";
import { ScrollToTop } from "@/components/shared/ScrollToTop";
import { SiteSettingsProvider } from "@/context/SiteSettingsContext";
import type React from "react";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SiteSettingsProvider>
      <div className="min-h-screen flex flex-col bg-background text-foreground font-sans relative">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <ScrollToTop />
      </div>
    </SiteSettingsProvider>
  );
}
