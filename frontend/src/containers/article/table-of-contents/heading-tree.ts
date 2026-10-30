import { createSlugCounter, getCleanSlug } from "@/lib/utils";
import type { IMediumParagraph } from "@/types";

export interface IHeading {
  name: string; // Medium paragraph name
  id: string;
  text: string;
  level: number;
}

export interface IHeadingNode {
  id: string;
  text: string;
  level: number;
  children: IHeadingNode[];
}

const HEADING_TYPE = /^H([1-6])$/;

// Headings in document order with unique ids (repeated texts get -2, -3... suffixes)
export function getHeadings(paragraphs: IMediumParagraph[]): IHeading[] {
  const slugCounter = createSlugCounter();
  return paragraphs.flatMap((p) => {
    const level = HEADING_TYPE.exec(p.type)?.[1];
    return level
      ? [
          {
            name: p.name,
            id: getCleanSlug(p.text, slugCounter),
            text: p.text,
            level: Number(level),
          },
        ]
      : [];
  });
}

// Nests each heading under the closest previous heading of a higher level
export function buildHeadingTree(headings: IHeading[]): IHeadingNode[] {
  const root: IHeadingNode[] = [];
  const stack: IHeadingNode[] = [];

  for (const { id, text, level } of headings) {
    const node: IHeadingNode = { id, text, level, children: [] };
    let parent = stack.at(-1);
    while (parent && level <= parent.level) {
      stack.pop();
      parent = stack.at(-1);
    }
    if (parent) parent.children.push(node);
    else root.push(node);
    stack.push(node);
  }

  return root;
}
