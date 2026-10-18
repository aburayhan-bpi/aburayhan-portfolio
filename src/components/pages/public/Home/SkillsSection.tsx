"use client";

import HeaderTitle from "@/components/shared/HeaderTitle";
import { Icons } from "@/utils/icons";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const SKILL_GROUPS = [
  {
    title: "Core Frontend & Frameworks",
    tagline: "Primary Production Specialization",
    icon: Icons.LayoutDashboard,
    description:
      "Crafting responsive, accessible, and high-velocity web applications using modern React architecture and clean component patterns.",
    skills: [
      "Next.js (App Router)",
      "React.js 19",
      "TypeScript",
      "JavaScript (ES6+)",
      "Redux Toolkit",
      "RTK Query",
      "Tailwind CSS v4",
      "Shadcn UI & Radix",
    ],
  },
  {
    title: "Backend & Data Pipelines",
    tagline: "Full-Stack API Engineering",
    icon: Icons.CiStreamOn,
    description:
      "Designing scalable serverless endpoints, business logic, secure authentication, and data modeling for enterprise products.",
    skills: [
      "Node.js",
      "Express.js",
      "MongoDB & Mongoose",
      "RESTful API Design",
      "JWT Authentication",
      "Firebase",
    ],
  },
  {
    title: "AI Tools & Modern Workflow",
    tagline: "10x Engineering Velocity",
    icon: Icons.BsStars,
    description:
      "Leveraging state-of-the-art AI-augmented developer tooling to accelerate sprint velocity, code quality, and prototyping.",
    skills: [
      "Cursor IDE",
      "GitHub Copilot",
      "Claude 3.7 & ChatGPT",
      "Figma to Code",
      "Git & GitHub Flow",
      "Responsive UI Systems",
    ],
  },
  {
    title: "Currently Exploring & Growth",
    tagline: "Infrastructure & Continuous Learning",
    icon: Icons.Settings,
    description:
      "Expanding system design horizons across relational databases, containerization, and automated deployment pipelines.",
    skills: [
      "PostgreSQL",
      "Prisma ORM",
      "Docker Basics",
      "CI/CD Workflows",
      "International Client Collab",
      "Agile Methodologies",
    ],
  },
];

export const SkillsSection = () => {
  const [skillGroups, setSkillGroups] = useState(SKILL_GROUPS);

  useEffect(() => {
    fetch("/api/v1/skills")
      .then((res) => res.json())
      .then((data) => {
        if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
          const apiSkills = data.data as { name: string; category: string }[];
          
          const frontendSkills = Array.from(
            new Set(
              apiSkills
                .filter((s) => s.category === "Frontend")
                .map((s) => s.name?.trim())
                .filter(Boolean),
            ),
          );
          const backendSkills = Array.from(
            new Set(
              apiSkills
                .filter((s) => s.category === "Backend")
                .map((s) => s.name?.trim())
                .filter(Boolean),
            ),
          );
          const aiSkills = Array.from(
            new Set(
              apiSkills
                .filter((s) => s.category === "AI & Tools")
                .map((s) => s.name?.trim())
                .filter(Boolean),
            ),
          );
          const devopsSkills = Array.from(
            new Set(
              apiSkills
                .filter((s) => s.category === "DevOps & Cloud")
                .map((s) => s.name?.trim())
                .filter(Boolean),
            ),
          );

          const dynamicGroups = [
            {
              ...SKILL_GROUPS[0],
              skills: frontendSkills.length ? frontendSkills : SKILL_GROUPS[0].skills,
            },
            {
              ...SKILL_GROUPS[1],
              skills: backendSkills.length ? backendSkills : SKILL_GROUPS[1].skills,
            },
            {
              ...SKILL_GROUPS[2],
              skills: aiSkills.length ? aiSkills : SKILL_GROUPS[2].skills,
            },
            {
              ...SKILL_GROUPS[3],
              skills: devopsSkills.length ? devopsSkills : SKILL_GROUPS[3].skills,
            },
          ];

          setSkillGroups(dynamicGroups);
        }
      })
      .catch(() => {
        // Fall back quietly to static SKILL_GROUPS
      });
  }, []);

  return (
    <section id="skills" className="py-16 md:py-24 border-t border-border/60 bg-card/10 relative">
      <div className="customContainer mx-auto px-4 sm:px-6 lg:px-8">
        <HeaderTitle
          title="Technical Capabilities & Tech Stack"
          subtitle="Specialized in building scalable, production-grade applications across ERP, SaaS, and marketplace platforms."
          titleColor="white"
          titleSize="xl"
          alignment="center"
          subtitleClassName="text-muted-foreground"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mt-10">
          {skillGroups.map((group, idx) => {
            const Icon = group.icon;
            return (
              <motion.div
                key={group.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: idx * 0.08 }}
                className="group relative rounded-2xl border border-border bg-card/70 p-6 sm:p-8 backdrop-blur-md transition-all hover:border-primary/50 hover:bg-card hover:shadow-xl hover:shadow-black/50 flex flex-col"
              >
                <div>
                  {/* Header with Icon and Tagline */}
                  <div className="flex items-center gap-3.5 mb-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-border/80 bg-secondary/70 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                        {group.title}
                      </h3>
                      <p className="text-xs font-mono text-accent">
                        {group.tagline}
                      </p>
                    </div>
                  </div>

                  {/* Clean readable description */}
                  <p className="text-sm text-muted-foreground leading-relaxed mb-1">
                    {group.description}
                  </p>
                </div>

                {/* Clean, Highly Readable Skill Chips */}
                <div className="flex flex-wrap gap-2 pt-3.5 mt-3 border-t border-border/60">
                  {Array.from(new Set(group.skills)).map((skill, sIdx) => (
                    <span
                      key={`${group.title}-${skill}-${sIdx}`}
                      className="rounded-lg border border-border/80 bg-secondary/50 px-3 py-1.5 text-xs font-medium text-foreground transition-all hover:border-primary/50 hover:bg-secondary"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
