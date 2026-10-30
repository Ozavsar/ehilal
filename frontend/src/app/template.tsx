import { FadeThroughTransition } from "@/components/view-transitions";

// A template remounts when its child segment changes, so the page content exits and enters as a
// whole when the navigation moves between home and the other destinations. (client)/template.tsx
// does the same between the destinations inside that route group.
export default function Template({ children }: { children: React.ReactNode }) {
  return <FadeThroughTransition>{children}</FadeThroughTransition>;
}
