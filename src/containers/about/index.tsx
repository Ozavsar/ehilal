import TitleSection from "@/components/TitleSection";
import ExperienceSection from "./sections/ExperienceSection";
import PersonalInfoSection from "./sections/PersonalInfoSection";
import SkillsSection from "./sections/SkillsSection";

export default function AboutContainer() {
  return (
    <main className="flex flex-col sm:pb-20">
      <TitleSection
        backgroundText="resume"
        plainText="about"
        coloredText="me"
      />
      <PersonalInfoSection />
      <span className="my-24 h-[1px] w-1/3 self-center bg-muted" />
      <SkillsSection />
      <span className="my-24 h-[1px] w-1/3 self-center bg-muted" />
      <ExperienceSection />
    </main>
  );
}
