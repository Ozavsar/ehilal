import { experienceData } from "@/config/constants/data";
import ExperienceCard from "./components/experience-card";

export default function ExperienceSection() {
  return (
    <section className="flex flex-col gap-10 px-4 pb-24">
      <h2 className="text-center text-3xl font-bold uppercase">
        Experience & Education
      </h2>
      <div className="grid-auto-rows-min grid grid-cols-1 gap-10 sm:grid-cols-2">
        {experienceData.map((experience, i) => (
          <ExperienceCard
            key={i}
            title={experience.title}
            company={experience.company}
            duration={experience.duration}
            description={experience.description}
            type={experience.type}
          />
        ))}
      </div>
    </section>
  );
}
