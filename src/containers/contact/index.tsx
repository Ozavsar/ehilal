import CustomButton from "@/components/CustomButton";
import { Home } from "lucide-react";

export default function ContactContainer() {
  return (
    <main>
      <div className="from-brand-dark to-brand-light flex h-screen w-screen items-center justify-center bg-gradient-radial">
        <h1 className="text-4xl font-bold">Contact Page</h1>
        <CustomButton text="Click me" icon={Home}  />
      </div>
    </main>
  );
}
