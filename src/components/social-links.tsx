import { LinkedinIcon } from "lucide-react";
import XIcon from "@/assets/icons/x-icon";
import { Button } from "./ui/button";
import appRoutes from "@/config/constants/app-routes";

const socialLinkContents = [
  {
    href: appRoutes.SOCIAL.X,
    icon: XIcon,
  },
  {
    href: appRoutes.SOCIAL.LINKEDIN,
    icon: LinkedinIcon,
  },
];

export default function SocialLinks() {
  return (
    <div className="flex gap-2 sm:gap-4">
      {socialLinkContents.map(({ href, icon: Icon }) => (
        <a href={href} target="_blank" rel="noopener noreferrer">
          <Button
            key={href}
            aria-label={href}
            className="size-14 border border-primary text-primary hover:text-foreground"
            variant="circle"
          >
            <Icon className="size-14" />
          </Button>
        </a>
      ))}
    </div>
  );
}
