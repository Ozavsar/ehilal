import TitleSection from "@/components/title-section";
import PersonalInfoSection from "./personal-info-section";
import ExperienceSection from "./experience-section";
import SkillsSection from "./skills-section";

export default function AboutContainer() {
  return (
    <main className="container">
      <TitleSection
        backgroundText="resume"
        plainText="about"
        coloredText="me"
      />
      <PersonalInfoSection />
      <span className="mx-auto my-24 flex h-[1px] w-1/3 bg-muted" />
      <SkillsSection />
      <span className="mx-auto my-24 flex h-[1px] w-1/3 bg-muted" />
      <ExperienceSection />
    </main>
  );
}
