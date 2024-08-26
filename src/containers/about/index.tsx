import ExperienceSection from "./sections/ExperienceSection";
import PersonalInfoSection from "./sections/PersonalInfoSection";
import SkillsSection from "./sections/SkillsSection";
import TitleSection from "./sections/TitleSection";

export default function AboutContainer() {
  return (
    <main className="flex flex-col sm:pb-20">
      <TitleSection />
      <PersonalInfoSection />
      <span className="my-24 h-[1px] w-1/3 self-center bg-muted" />
      <SkillsSection />
      <span className="my-24 h-[1px] w-1/3 self-center bg-muted" />
      <ExperienceSection />
    </main>
  );
}
