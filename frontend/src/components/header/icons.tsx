import {
  LuContact,
  LuHouse,
  LuNotebookPen,
  LuPresentation,
  LuVideo,
} from "react-icons/lu";
import { SiUdemy } from "react-icons/si";

export const ICONS: Record<string, React.JSX.Element> = {
  conference: <LuPresentation className="size-5 sm:size-6" />,
  blog: <LuNotebookPen className="size-5 sm:size-6" />,
  contact: <LuContact className="size-5 sm:size-6" />,
  course: <SiUdemy className="size-5 sm:size-6" />,
  video: <LuVideo className="size-5 sm:size-6" />,
  home: <LuHouse className="size-5 sm:size-6" />,
};
