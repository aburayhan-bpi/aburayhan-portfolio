"use client";

import { ChevronUp } from "lucide-react";
import React, { useEffect, useState } from "react";

/**
 * ScrollToTop Component
 * A sleek floating button with dynamic circular scroll progress ring and smooth return-to-top interaction.
 */
export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;

      if (totalHeight > 0) {
        const progress = Math.min(100, Math.max(0, (scrollY / totalHeight) * 100));
        setScrollProgress(progress);
      }

      // Show after scrolling 300px
      setIsVisible(scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // SVG Circular progress mathematics (radius = 18, circumference = 2 * PI * 18 ≈ 113.1)
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scrollProgress / 100) * circumference;

  return (
    <div
      className={`fixed bottom-6 right-6 z-40 transition-all duration-300 ${
        isVisible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-4 pointer-events-none"
      }`}
    >
      <button
        type="button"
        onClick={scrollToTop}
        className="relative w-11 h-11 rounded-full bg-card/85 backdrop-blur-md border border-border/70 hover:border-primary/50 text-foreground hover:text-primary shadow-lg hover:shadow-primary/10 transition-all duration-200 flex items-center justify-center cursor-pointer group active:scale-95"
        aria-label="Scroll to top of page"
        title="Scroll to top"
      >
        {/* Dynamic Circular Progress Ring */}
        <svg
          className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
          viewBox="0 0 44 44"
        >
          {/* Background track circle */}
          <circle
            cx="22"
            cy="22"
            r={radius}
            className="stroke-secondary/80 fill-transparent"
            strokeWidth="2"
          />
          {/* Progress circle */}
          <circle
            cx="22"
            cy="22"
            r={radius}
            className="stroke-primary fill-transparent transition-[stroke-dashoffset] duration-150 ease-out"
            strokeWidth="2"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>

        {/* Up Arrow Icon with hover elevation */}
        <ChevronUp className="w-4 h-4 transition-transform duration-200 group-hover:-translate-y-0.5 text-foreground group-hover:text-primary" />
      </button>
    </div>
  );
}

export default ScrollToTop;
