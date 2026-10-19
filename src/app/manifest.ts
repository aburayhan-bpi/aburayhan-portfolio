import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Abu Rayhan | Frontend Developer",
    short_name: "Abu Rayhan",
    description:
      "Official portfolio of Abu Rayhan — Frontend Developer specialized in Next.js, React, and TypeScript.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0d14",
    theme_color: "#0a0d14",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
