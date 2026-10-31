import { FadeThroughTransition } from "@/components/view-transitions";

// The root template keys on "(client)", so fades between this group's pages need a template here.
// <main> sits here so it also wraps the list layouts' titles: the skip link lands before the <h1>.
export default function ClientTemplate({ children }: { children: React.ReactNode }) {
  return (
    <main id="main" className="flex flex-col">
      <FadeThroughTransition>{children}</FadeThroughTransition>
    </main>
  );
}
