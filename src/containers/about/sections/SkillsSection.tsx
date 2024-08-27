"use client";
import { Progress } from "@/components/ui/progress";

const skills = [
  { title: "React", value: 90 },
  { title: "TypeScript", value: 80 },
  { title: "Node.js", value: 70 },
  { title: "GraphQL", value: 60 },
  { title: "Docker", value: 50 },
  { title: "Kubernetes", value: 40 },
];

export default function SkillsSection() {
  return (
    <section className="flex flex-col gap-10">
      <h2 className="text-center text-3xl font-bold uppercase">Skills</h2>
      <div className="grid grid-cols-2 gap-4">
        {skills.map((skill) => (
          <Progress
            key={skill.title}
            title={skill.title}
            value={skill.value}
            getValueLabel={(value) => `${value}%`}
          />
        ))}
      </div>
    </section>
  );
}
