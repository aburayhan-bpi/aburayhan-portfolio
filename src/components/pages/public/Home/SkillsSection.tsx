"use client";

import HeaderTitle from "@/components/shared/HeaderTitle";
import { Icons } from "@/utils/icons";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

import { SerializedSkill } from "@/lib/server/portfolioData";

const CATEGORY_META = [
  {
    category: "Frontend",
    title: "Core Frontend & Frameworks",
    tagline: "Primary Production Specialization",
    icon: Icons.LayoutDashboard,
    description:
      "Crafting responsive, accessible, and high-velocity web applications using modern React architecture and clean component patterns.",
  },
  {
    category: "Backend",
    title: "Backend & Data Pipelines",
    tagline: "Serverless & API Integration",
    icon: Icons.CiStreamOn,
    description:
      "Designing scalable serverless endpoints, business logic, secure authentication, and data modeling for enterprise products.",
  },
  {
    category: "AI & Tools",
    title: "AI Tools & Modern Workflow",
    tagline: "10x Engineering Velocity",
    icon: Icons.BsStars,
    description:
      "Leveraging state-of-the-art AI-augmented developer tooling to accelerate sprint velocity, code quality, and prototyping.",
  },
  {
    category: "DevOps & Cloud",
    title: "Currently Exploring & Growth",
    tagline: "Infrastructure & Continuous Learning",
    icon: Icons.Settings,
    description:
      "Expanding system design horizons across relational databases, containerization, and automated deployment pipelines.",
  },
];

function buildSkillGroups(skillsList: { name: string; category: string }[]) {
  return CATEGORY_META.map((cat) => ({
    title: cat.title,
    tagline: cat.tagline,
    icon: cat.icon,
    description: cat.description,
    skills: Array.from(
      new Set(
        skillsList
          .filter((s) => s.category === cat.category)
          .map((s) => s.name?.trim())
          .filter(Boolean),
      ),
    ),
  }));
}

interface SkillsSectionProps {
  initialSkills?: SerializedSkill[];
}

export const SkillsSection = ({ initialSkills }: SkillsSectionProps) => {
  const [skillGroups, setSkillGroups] = useState(() =>
    buildSkillGroups(initialSkills || []),
  );

  useEffect(() => {
    fetch("/api/v1/skills")
      .then((res) => res.json())
      .then((data) => {
        if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
          setSkillGroups(buildSkillGroups(data.data));
        }
      })
      .catch(() => {});
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
