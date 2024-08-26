"use client";
import { Progress } from "@/components/ui/progress";

export default function SkillsSection() {
  return (
    <section className="container w-full">
      <h1 className="pb-4 text-center text-3xl font-bold uppercase">Skills</h1>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <Progress
          title="React"
          value={90}
          getValueLabel={(value) => `${value}%`}
        />
        <Progress title="TypeScript" value={80} />
        <Progress title="Node.js" value={70} />
        <Progress title="GraphQL" value={60} />
        <Progress title="Docker" value={50} />
        <Progress title="Kubernetes" value={40} />
      </div>
    </section>
  );
}
