import puppeteer from "puppeteer";
import { MEDIUM_USER_URL } from "@/config/constants";
import { IArticlePreview } from "@/config/types";
import ArticleCard from "./components/ArticleCard";

const articles = [
  {
    title: "İngilizce Öğrenme Yolculuğu!",
    url: "https://medium.com/@Elifhilalumucu?source=user_profile---------0----------------------------",
    image: "https://miro.medium.com/v2/1*_ZjmjTkYUkUIuYj3WlreNQ.png",
    description: "Selaaaaam! Yine ben :)",
  },
  {
    title: "Kripto Varlık Düzenlemesi: Detaylı Bakış📚",
    url: "https://medium.com/@Elifhilalumucu?source=user_profile---------1----------------------------",
    image: "https://miro.medium.com/v2/da:true/0*h7I6CYG8OtW0amni",
    description:
      "👉 Disclaimer: All opinions are the author’s own. Görüşlerim şahsıma aittir, çalıştığım hiçbir kurumu veya kuruluşu temsilen yazmıyorum.",
  },
  {
    title: "TWAP & VWAP Fiyat Algoritmaları",
    url: "https://medium.com/@Elifhilalumucu?source=user_profile---------2----------------------------",
    image: "https://miro.medium.com/v2/1*othzDhQ1fT38k_tufB2d2w.png",
    description:
      "Merhaba sevgili okurlarım. Size belki daha önce karşılaşmadığınız veya az karşılaştığınız bir konu ile geldim.",
  },
  {
    title: "Veri Gizliliği: Homomorphic Şifreleme Nedir?🔑",
    url: "https://medium.com/@Elifhilalumucu?source=user_profile---------3----------------------------",
    image: "https://miro.medium.com/v2/1*04EJ2BNmlF3RlPgGco4kRw.jpeg",
    description:
      "👉 Disclaimer: All opinions are the author’s own. Görüşlerim şahsıma aittir, çalıştığım hiçbir kurumu veya kuruluşu temsilen yazmıyorum.",
  },
  {
    title: "Blockchain ve Web3 Start-upları: Yatırım, Hibe ve Fon Rehberi 🎨",
    url: "https://medium.com/@Elifhilalumucu?source=user_profile---------4----------------------------",
    image: "https://miro.medium.com/v2/1*btPusF-ZRqB4lntUdpqHOw.jpeg",
    description:
      "👉 Disclaimer: All opinions are the author’s own. Görüşlerim şahsıma aittir, çalıştığım hiçbir kurumu veya kuruluşu temsilen yazmıyorum.",
  },
  {
    title: "Dünyanın En İyi Üniversitelerinde Farklı Bir Kariyer 🐛",
    url: "https://medium.com/@Elifhilalumucu?source=user_profile---------5----------------------------",
    image: "https://miro.medium.com/v2/1*T8ewcPxAxYz12hIoHFbGSA.jpeg",
    description:
      "Değerli arkadaşlarım, öncelikle sizlere gönülden bir merhaba diyeyim. YouTube videomda bahsettiğim projeleri yazı şeklinde de sizlere…",
  },
  {
    title: "Comprehensive Chainlink Functions Guide🧵",
    url: "https://medium.com/@Elifhilalumucu?source=user_profile---------6----------------------------",
    image: "https://miro.medium.com/v2/da:true/0*XPENdcJRKILGXc5R",
    description: "👉 Disclaimer: All opinions are the author’s own.",
  },
  {
    title: "Comprehensive Real-World Assets Guide: RWAs🧵",
    url: "https://medium.com/@Elifhilalumucu?source=user_profile---------7----------------------------",
    image: "https://miro.medium.com/v2/0*vuBtb3Ebrel1uvWi.png",
    description: "👉 Disclaimer: All opinions of the author are their own",
  },
  {
    title: "CCIP (Cross-Chain Interoperability Protocol) Guide🧵🛠️",
    url: "https://medium.com/@Elifhilalumucu?source=user_profile---------8----------------------------",
    image: "https://miro.medium.com/v2/0*RHZDcbJu2JO2PZCy.png",
  },
  {
    title: "CCIP (Cross-Chain Interoperability Protocol) Rehberi 🧵🛠️",
    url: "https://medium.com/@Elifhilalumucu?source=user_profile---------9----------------------------",
    image: "https://miro.medium.com/v2/0*bdi2N05YaHHJAhel.gif",
    description:
      "Merhabaaa, yine uzun süredir yazmayı planladığım ancak bir türlü fırsat bulup da uzun uzun yazamadığım bir yazı bu. Özellikle ETH CC…",
  },
];

export default async function BlogContainer() {
  /* const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(MEDIUM_USER_URL, { waitUntil: "networkidle2" });

  const articles = await page.evaluate(() => {
    const articleElements = document.querySelectorAll("article");
    const articleList: IArticlePreview[] = [];

    articleElements.forEach((article) => {
      const titleElement = article.querySelector("h2");
      const linkElement = article.querySelector("a");
      const imageElement = article.querySelectorAll("img")[1];
      const descriptionElement = article.querySelector("h3");
      const 

      if (titleElement && linkElement) {
        articleList.push({
          title: titleElement.innerText,
          url: linkElement.href,
          image: imageElement?.src.replace(/\/resize:fill:\d+:\d+\//, '/'),
          description: descriptionElement?.innerText,
        });
      }
    });

    return articleList;
  });

  await browser.close(); */

  return (
    <main>
      <div className="from-brand-dark to-brand-light bg-gradient-radial flex h-screen w-screen items-center justify-center">
        <h1 className="text-4xl font-bold">Blog Page</h1>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard key={article.url} {...article} />
          ))}
        </div>
      </div>
    </main>
  );
}
