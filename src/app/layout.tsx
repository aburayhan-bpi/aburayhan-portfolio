import { AnalyticsBeacon } from "@/components/shared/AnalyticsBeacon";
import { CustomToaster } from "@/components/shared/CustomToaster";
import { WEBSITE_DETAILS } from "@/lib/constants";
import { fontBengali, fontSans } from "@/lib/fonts";
import ReduxProvider from "@/redux/ReduxProvider";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: WEBSITE_DETAILS.SITE_NAME,
    template: `%s | ${WEBSITE_DETAILS.SITE_ONLY_NAME}`,
  },
  description: WEBSITE_DETAILS.SITE_DESCRIPTION,
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
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
