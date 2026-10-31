import { FadeThroughTransition } from "@/components/view-transitions";

// Remounts when the child segment changes: fade-through between home and the (client) group
export default function Template({ children }: { children: React.ReactNode }) {
  return <FadeThroughTransition>{children}</FadeThroughTransition>;
}
