"use client";

import HeaderTitle from "@/components/shared/HeaderTitle";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/utils/icons";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface WorkExperienceItem {
  _id?: string;
  category?: "experience" | "education";
  title?: string;
  role?: string;
  organization?: string;
  company?: string;
  period: string;
  location?: string;
  type: string;
  description?: string;
  highlights?: string[];
  tech?: string[];
  order?: number;
}

interface EducationItem {
  _id?: string;
  category?: "experience" | "education";
  title: string;
  organization?: string;
  institution?: string;
  period: string;
  type: string;
  description?: string;
  order?: number;
}

import { SerializedExperience } from "@/lib/server/portfolioData";

interface ExperienceSectionProps {
  initialExperiences?: SerializedExperience[];
}

export const ExperienceSection = ({ initialExperiences }: ExperienceSectionProps) => {
  const initialExpList = (initialExperiences || []).filter(
    (item) => item.category === "experience"
  ) as WorkExperienceItem[];

  const initialEduList = (initialExperiences || []).filter(
    (item) => item.category === "education"
  ) as EducationItem[];

  const [experiences, setExperiences] = useState<WorkExperienceItem[]>(initialExpList);
  const [educationCerts, setEducationCerts] = useState<EducationItem[]>(initialEduList);

  useEffect(() => {
    fetch("/api/v1/experiences")
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success && Array.isArray(resData.data) && resData.data.length > 0) {
          const expList = resData.data.filter(
            (item: WorkExperienceItem) => item.category === "experience"
          );
          const eduList = resData.data.filter(
            (item: EducationItem) => item.category === "education"
          );

          if (expList.length > 0) setExperiences(expList);
          if (eduList.length > 0) setEducationCerts(eduList);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section id="experience" className="py-16 md:py-24 border-t border-border/60 bg-card/10 relative">
      <div className="customContainer mx-auto px-4 sm:px-6 lg:px-8">
        <HeaderTitle
          title="Career Journey & Education"
          subtitle="A track record of shipping production code, international client collaboration, and continuous technical growth."
          titleColor="white"
          titleSize="xl"
          alignment="center"
          subtitleClassName="text-muted-foreground"
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 mt-10 items-start">
          {/* Left Column: Work Experience Timeline */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-2.5 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/30 text-primary">
                <Icons.HiOutlineBriefcase className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">
                  Work Experience
                </h3>
                <p className="text-xs font-mono text-muted-foreground">
                  Professional Software Engineering Career
                </p>
              </div>
            </div>

            <div className="relative pl-6 sm:pl-8 border-l border-border/80 space-y-8">
              {experiences.map((exp, idx) => {
                const org = exp.organization || exp.company;
                const role = exp.title || exp.role;
                return (
                  <motion.div
                    key={exp._id || `${org}-${idx}`}
                    initial={{ opacity: 0, x: -15 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35, delay: idx * 0.1 }}
                    className="relative group"
                  >
                    {/* Glowing Node Dot */}
                    <span className="absolute -left-[31px] sm:-left-[39px] top-2 flex h-4 w-4 items-center justify-center rounded-full bg-background border-2 border-primary">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    </span>

                    <div className="rounded-2xl border border-border bg-card/70 p-6 sm:p-8 backdrop-blur-md transition-all hover:border-primary/50 hover:bg-card hover:shadow-xl hover:shadow-black/50">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <div>
                          <h4 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                            {role}
                          </h4>
                          <p className="text-sm font-semibold text-sky-400">
                            {org}
                          </p>
                        </div>
                        <div className="flex sm:flex-col sm:items-end gap-2">
                          <Badge
                            variant="outline"
                            className="border-primary/30 bg-primary/10 text-primary font-mono text-xs"
                          >
                            {exp.type}
                          </Badge>
                          <span className="font-mono text-xs text-muted-foreground">
                            {exp.period}
                          </span>
                        </div>
                      </div>

                      {exp.location && (
                        <p className="text-xs font-mono text-muted-foreground/80 mb-5">
                          {exp.location}
                        </p>
                      )}

                      {/* Relaxed Bullets Spacing for Clean Information Density */}
                      {Array.isArray(exp.highlights) && exp.highlights.length > 0 && (
                        <ul className="space-y-3.5 mb-6 text-sm text-muted-foreground">
                          {exp.highlights.map((item: string, hIdx: number) => (
                            <li key={hIdx} className="flex items-start gap-3">
                              <Icons.CheckCircle className="h-4 w-4 text-emerald-400 shrink-0 mt-1" />
                              <span className="leading-relaxed">{item}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      {/* Focused Tech Chips */}
                      {Array.isArray(exp.tech) && exp.tech.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-4 border-t border-border/60">
                          {exp.tech.map((t: string, tIdx: number) => (
                            <span
                              key={`${org}-${t}-${tIdx}`}
                              className="rounded-lg bg-secondary/70 border border-border/60 px-2.5 py-1 font-mono text-xs text-muted-foreground"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Education & Professional Certifications */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center gap-2.5 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
                <Icons.GiNotebook className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">
                  Education &amp; Credentials
                </h3>
                <p className="text-xs font-mono text-muted-foreground">
                  Academic Background &amp; Certifications
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {educationCerts.map((item, cIdx) => {
                const institution = item.organization || item.institution;
                return (
                  <motion.div
                    key={item._id || `${item.title}-${cIdx}`}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35, delay: cIdx * 0.08 }}
                    className="rounded-xl border border-border bg-card/70 p-5 sm:p-6 backdrop-blur-md transition-all hover:border-primary/40 hover:bg-card"
                  >
                    <div className="flex items-start justify-between gap-3 mb-1.5">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-primary font-semibold">
                        {item.type}
                      </span>
                      <span className="font-mono text-xs text-muted-foreground">
                        {item.period}
                      </span>
                    </div>

                    <h5 className="text-base font-bold text-foreground mb-1">
                      {item.title}
                    </h5>
                    <p className="text-xs font-mono text-sky-400/90 mb-2">
                      {institution}
                    </p>
                    {item.description && (
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
