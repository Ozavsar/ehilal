import { IArticlePreview } from "@/config/types";
import Image from "next/image";
import Link from "next/link";

const ArticleCard = ({ image, title, url, description }: IArticlePreview) => {
  return (
    <Link href={url}>
      <div className="relative flex flex-col items-center justify-start border-b border-gray-200 p-4">
        <Image
          fill
          src={image}
          alt={title}
          className="h-auto w-full rounded-full object-contain"
        />
        <div className="ml-4 flex flex-col">
          <h3 className="text-lg font-semibold">{title}</h3>
          {description && <p className="text-sm">{description}</p>}
        </div>
      </div>
    </Link>
  );
};

export default ArticleCard;
