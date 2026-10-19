"use client";

import { ContactSection } from "./ContactSection";
import { ExperienceSection } from "./ExperienceSection";
import { HeroSection } from "./HeroSection";
import { ProjectsSection } from "./ProjectsSection";
import { SkillsSection } from "./SkillsSection";

import { PortfolioServerData } from "@/lib/server/portfolioData";

interface HomeProps {
  initialData?: PortfolioServerData;
}

const Home = ({ initialData }: HomeProps) => {
  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection />
      <SkillsSection initialSkills={initialData?.skills} />
      <ProjectsSection initialProjects={initialData?.projects} />
      <ExperienceSection initialExperiences={initialData?.experiences} />
      <ContactSection />
    </div>
  );
};

export default Home;
