import TitleSection from "@/components/TitleSection";
import Editor from "./components/Editor";

export default function WriteContainer() {
  return (
    <main className="container">
      <TitleSection
        coloredText="Article"
        backgroundText="Editor"
        plainText="Write"
      />
      <div>
        <Editor />
      </div>
    </main>
  );
}
