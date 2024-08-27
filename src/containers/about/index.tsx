import TitleSection from "@/components/TitleSection";
import ExperienceSection from "./sections/ExperienceSection";
import PersonalInfoSection from "./sections/PersonalInfoSection";
import SkillsSection from "./sections/SkillsSection";

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
