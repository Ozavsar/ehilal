import Link from "next/link";
import Image from "next/image";
import { IArticlePreview } from "@/config/types";

const ArticleCard = ({ image, title, url, description }: IArticlePreview) => {
  return (
    <li className="row-span-2 grid grid-rows-subgrid gap-0 overflow-hidden rounded-[5px] border border-muted">
      <div className="h-72 w-full overflow-hidden border-b-8 border-primary">
        <Link href={`/blog/${url}`}>
          <Image
            src={image}
            alt={title}
            width={800}
            height={800}
            objectFit="cover"
            className="h-72 w-full border-b-8 border-primary object-cover transition-transform duration-300 hover:scale-110"
          />
        </Link>
      </div>
      <div className="row-span-3 flex flex-col justify-between bg-muted p-4">
        <div>
          <Link href={`/blog/${url}`}>
            <h2 className="text-lg font-bold">{title}</h2>
          </Link>
          <p className="dark:text-white/50">{description}</p>
        </div>
        <Link href={`/blog/${url}`}>
          <span className="mt-4 text-blue-500 hover:underline">Read more</span>
        </Link>
      </div>
    </li>
  );
};

export default ArticleCard;
