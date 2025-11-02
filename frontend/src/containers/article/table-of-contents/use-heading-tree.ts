import { createSlugCounter, getCleanSlug } from "@/lib/utils";

export function useHeadingTree(paragraphs: any[]) {
  const slugCounter = createSlugCounter();

  const headings = paragraphs
    .filter((p) => /^H[1-6]$/.test(p.type))
    .map((p) => ({
      id: getCleanSlug(p.text, slugCounter),
      text: p.text,
      level: Number(p.type.replace("H", "")),
      children: [] as any[],
    }));

  const root: any[] = [];
  const stack: any[] = [];

  headings.forEach((h) => {
    while (stack.length && h.level <= stack[stack.length - 1].level) {
      stack.pop();
    }
    if (stack.length === 0) root.push(h);
    else stack[stack.length - 1].children.push(h);
    stack.push(h);
  });

  return root;
}
