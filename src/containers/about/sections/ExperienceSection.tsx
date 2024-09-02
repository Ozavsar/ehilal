import ExperienceCard from "../components/ExperienceCard";

const experienceData = [
  {
    title: "Software Engineer",
    company: "Google",
    duration: "2020 - Present",
    description:
      "Working on the Google Search team to improve the search experience for users.",
    type: "work",
  },
  {
    title: "Software Engineer",
    company: "Google",
    duration: "2020 - Present",
    description:
      "Working on the Google Search team to improve the search experience for users.",
    type: "education",
  },
  {
    title: "Software Engineer",
    company: "Google",
    duration: "2020 - Present",
    description:
      "Working on the Google Search team to improve the search experience for users.",
    type: "work",
  },
  {
    title: "Software Engineer",
    company: "Facebook",
    duration: "2018 - 2020",
    description:
      "Worked on the Facebook Ads team to improve ad targeting and delivery.",

    type: "education",
  },
  {
    title: "Software Engineer",
    company: "Microsoft",
    duration: "2016 - 2018",
    description:
      "Worked on the Microsoft Office team to improve the user experience of Word.",
    type: "work",
  },
  {
    title: "Software Engineer",
    company: "Microsoft",
    duration: "2016 - 2018",
    description:
      "Worked on the Microsoft Office team to improve the user experience of Word.",
    type: "education",
  },
];

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
