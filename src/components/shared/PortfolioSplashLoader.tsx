"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export function PortfolioSplashLoader() {
  const [loading, setLoading] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(10);

  useEffect(() => {
    let active = true;

    // Check if user already saw the splash during this session
    const hasSeenSplash = typeof window !== "undefined" && sessionStorage.getItem("portfolio_splash_seen");

    if (hasSeenSplash) {
      const dismissTimer = setTimeout(() => {
        if (active) setLoading(false);
      }, 0);
      return () => {
        active = false;
        clearTimeout(dismissTimer);
      };
    }

    const progressInterval = setInterval(() => {
      if (!active) return;
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + Math.floor(Math.random() * 25 + 15);
      });
    }, 120);

    const timer = setTimeout(() => {
      if (active) {
        setLoading(false);
        if (typeof window !== "undefined") {
          sessionStorage.setItem("portfolio_splash_seen", "true");
        }
      }
    }, 850);

    return () => {
      active = false;
      clearInterval(progressInterval);
      clearTimeout(timer);
    };
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          key="portfolio-splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.35, ease: "easeInOut" } }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#090A0F] text-foreground select-none"
        >
          {/* Subtle Ambient Background Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.08)_0%,transparent_60%)] pointer-events-none" />

          {/* Central Logo Container */}
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="relative flex flex-col items-center gap-5 z-10"
          >
            {/* Glowing Icon */}
            <div className="relative">
              <div className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 opacity-30 blur-lg animate-pulse" />
              <div className="relative h-16 w-16 rounded-2xl border border-border/80 bg-card/90 p-2 shadow-2xl flex items-center justify-center">
                <Image
                  src="/icon.svg"
                  alt="Abu Rayhan"
                  width={48}
                  height={48}
                  priority
                  className="h-10 w-10 object-contain"
                />
              </div>
            </div>

            {/* Typography */}
            <div className="text-center space-y-1">
              <h2 className="text-xl font-bold tracking-tight text-slate-100 font-sans">
                Abu <span className="bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent">Rayhan</span>
              </h2>
              <p className="text-[11px] font-mono tracking-widest text-muted-foreground uppercase">
                Frontend Developer
              </p>
            </div>

            {/* Progress Bar & Telemetry */}
            <div className="w-48 space-y-2 pt-2">
              <div className="h-1 w-full bg-secondary/80 rounded-full overflow-hidden border border-border/40">
                <motion.div
                  className="h-full bg-gradient-to-r from-sky-400 to-blue-600 rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: `${Math.min(progress, 100)}%` }}
                  transition={{ ease: "easeOut", duration: 0.2 }}
                />
              </div>
              <div className="flex justify-between items-center text-[10px] font-mono text-muted-foreground/70">
                <span>SYSTEM_READY</span>
                <span>{Math.min(progress, 100)}%</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
