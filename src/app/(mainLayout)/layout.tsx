import Footer from "@/components/shared/Footer";
import Navbar from "@/components/shared/Navbar";
import { PortfolioSplashLoader } from "@/components/shared/PortfolioSplashLoader";
import { ScrollToTop } from "@/components/shared/ScrollToTop";
import { SiteSettingsProvider } from "@/context/SiteSettingsContext";
import { getPortfolioServerData } from "@/lib/server/portfolioData";
import type React from "react";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const data = await getPortfolioServerData();

  return (
    <SiteSettingsProvider initialSettings={data.settings}>
      <PortfolioSplashLoader />
      <div className="min-h-screen flex flex-col bg-background text-foreground font-sans relative">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <ScrollToTop />
      </div>
    </SiteSettingsProvider>
  );
}
