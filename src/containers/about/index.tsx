import PersonalInfoSection from "./sections/PersonalInfoSection";
import TitleSection from "./sections/TitleSection";

export default function AboutContainer() {
  return (
    <main className="flex flex-col">
      <TitleSection />
      <PersonalInfoSection />
    </main>
  );
}
