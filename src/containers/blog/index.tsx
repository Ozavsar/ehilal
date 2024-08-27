import puppeteer, { Page } from "puppeteer";
import { MEDIUM_USER_URL } from "@/config/constants";
import { IArticlePreview } from "@/config/types";
import ArticleCard from "./components/ArticleCard";
import TitleSection from "@/components/TitleSection";

const articles = [
  {
    title: "İngilizce Öğrenme Yolculuğu!",
    url: "https://medium.com/@Elifhilalumucu/i%CC%87ngilizce-%C3%B6%C4%9Frenme-yolculu%C4%9Fu-2d471b1ce728?source=user_profile---------0----------------------------",
    image: "https://miro.medium.com/v2/1*_ZjmjTkYUkUIuYj3WlreNQ.png",
    description: "Selaaaaam! Yine ben :)",
  },
  {
    title: "Kripto Varlık Düzenlemesi: Detaylı Bakış📚",
    url: "https://medium.com/@Elifhilalumucu/kripto-varl%C4%B1k-kanunu-detayl%C4%B1-bak%C4%B1%C5%9F-54ec2acc0e40?source=user_profile---------1----------------------------",
    image: "https://miro.medium.com/v2/da:true/0*h7I6CYG8OtW0amni",
    description:
      "👉 Disclaimer: All opinions are the author’s own. Görüşlerim şahsıma aittir, çalıştığım hiçbir kurumu veya kuruluşu temsilen yazmıyorum.",
  },
  {
    title: "TWAP & VWAP Fiyat Algoritmaları",
    url: "https://medium.com/@Elifhilalumucu/twap-vwap-fiyat-algoritmalar%C4%B1-04a5851e1561?source=user_profile---------2----------------------------",
    image: "https://miro.medium.com/v2/1*othzDhQ1fT38k_tufB2d2w.png",
    description:
      "Merhaba sevgili okurlarım. Size belki daha önce karşılaşmadığınız veya az karşılaştığınız bir konu ile geldim.",
  },
  /*   {
    title: "Veri Gizliliği: Homomorphic Şifreleme Nedir?🔑",
    url: "https://medium.com/@Elifhilalumucu/veri-gizlili%C4%9Fi-homomorphic-%C5%9Fifreleme-nedir-bf7f25d0ddff?source=user_profile---------3----------------------------",
    image: "https://miro.medium.com/v2/1*04EJ2BNmlF3RlPgGco4kRw.jpeg",
    description:
      "👉 Disclaimer: All opinions are the author’s own. Görüşlerim şahsıma aittir, çalıştığım hiçbir kurumu veya kuruluşu temsilen yazmıyorum.",
  },
  {
    title: "Blockchain ve Web3 Start-upları: Yatırım, Hibe ve Fon Rehberi 🎨",
    url: "https://medium.com/@Elifhilalumucu/blockchain-ve-web3-start-uplar%C4%B1-yat%C4%B1r%C4%B1m-hibe-ve-fon-rehberi-f59402230476?source=user_profile---------4----------------------------",
    image: "https://miro.medium.com/v2/1*btPusF-ZRqB4lntUdpqHOw.jpeg",
    description:
      "👉 Disclaimer: All opinions are the author’s own. Görüşlerim şahsıma aittir, çalıştığım hiçbir kurumu veya kuruluşu temsilen yazmıyorum.",
  },
  {
    title: "Dünyanın En İyi Üniversitelerinde Farklı Bir Kariyer 🐛",
    url: "https://medium.com/@Elifhilalumucu/d%C3%BCnyan%C4%B1n-en-i%CC%87yi-%C3%BCniversitelerinde-farkl%C4%B1-bir-kariyer-c507e769997e?source=user_profile---------5----------------------------",
    image: "https://miro.medium.com/v2/1*T8ewcPxAxYz12hIoHFbGSA.jpeg",
    description:
      "Değerli arkadaşlarım, öncelikle sizlere gönülden bir merhaba diyeyim. YouTube videomda bahsettiğim projeleri yazı şeklinde de sizlere…",
  },
  {
    title:
      "🚨 Yerelden Globale: Uluslararası Stajler ve Programlarla Edinilen Kişisel Kazanımlar 🌻",
    url: "https://medium.com/@Elifhilalumucu/yerelden-globale-uluslararas%C4%B1-stajler-ve-programlarla-edinilen-ki%C5%9Fisel-kazan%C4%B1mlar-266da5c47713?source=user_profile---------10----------------------------",
    image: "https://miro.medium.com/v2/da:true/0*EAC3Mc-6XS1XLJLx",
    description:
      "Merhabaaa, yine uzun süredir yazmayı planladığım ancak bir türlü fırsat bulup da uzun uzun yazamadığım bir yazı bu.😊 Ben Elif Hilal! 🔮…",
  },
  {
    title: "Understanding HotStuff and Byzantine Fault Tolerance 🤖",
    url: "https://medium.com/@Elifhilalumucu/understanding-hotstuff-and-byzantine-fault-tolerance-393ca878173f?source=user_profile---------11----------------------------",
    image: "https://miro.medium.com/v2/1*BJdYYiaLfB3L4N4pGVQenA.jpeg",
    description: "Disclaimer: All opinions of the author are their own",
  },
  {
    title: "🌻 a16z “State of Crypto 2023” Report 🧵",
    url: "https://medium.com/@Elifhilalumucu/about-the-a16z-state-of-crypto-2023-report-ff40528f345e?source=user_profile---------12----------------------------",
    image: "https://miro.medium.com/v2/da:true/0*D-EpLT4aFYC-L3pD",
    description: "Hi again😊",
  },
  {
    title: "🌻 a16z “State of Crypto 2023” Raporuna Dair 🧵",
    url: "https://medium.com/@Elifhilalumucu/a16z-state-of-crypto-2023-raporuna-dair-8f0880409b4c?source=user_profile---------13----------------------------",
    image: "https://miro.medium.com/v2/da:true/0*Od-SWbKudlH6FNvz",
    description:
      "Merhaba değerli okuyucularım. Ben Elif Hilal! 🔮 🙂 Yazdığım yazılar çalıştığım şirketlerden bağımsız bir şekilde kendi fikirlerim ve…",
  },
  {
    title: "Bitcoin Ordinalleri ve NFT’ler🌻",
    url: "https://medium.com/@Elifhilalumucu/bitcoin-ordinalleri-7c5f68cc1ac1?source=user_profile---------14----------------------------",
    image: "https://miro.medium.com/v2/da:true/0*0TCVonXniwrH96aA",
    description:
      "Ben Elif Hilal! 🔮 Aranızda beni tanımayan veya ilk defa ismimi duyanlar varsa, kendimi tanıtmak için buraya bir link bırakayım. Bence…",
  },
  {
    title: "🌻 My Cryptography Guide 🎨",
    url: "https://medium.com/@Elifhilalumucu/my-cryptography-guide-2dfc9ba06420?source=user_profile---------15----------------------------",
    image: "https://miro.medium.com/v2/1*a8OMS7CdfsbKPYi0ZG3qBA.jpeg",
    description: "Hello everyone😊",
  },
  {
    title: "🎨 Detailed Zero Knowledge and Layer 2 Guide 🎃",
    url: "https://medium.com/@Elifhilalumucu/detailed-zero-knowledge-and-layer-2-guide-c8b10636a307?source=user_profile---------16----------------------------",
    image: "https://miro.medium.com/v2/1*2l53tMstik1EwqmlBP3lxw.jpeg",
    description: "Hello everyone😊",
  },
  {
    title: "📌 What Are the Steps That Make an NFT Project Successful? ✅",
    url: "https://medium.com/@Elifhilalumucu/what-are-the-steps-that-make-an-nft-project-successful-938fef94f8e0?source=user_profile---------17----------------------------",
    image: "https://miro.medium.com/v2/1*7QWwr_1o7eXcQnqMe_pAyA.jpeg",
    description: "Hello, my dear readers😊",
  },
  {
    title: "📌 Bir NFT Projesini Başarılı Yapan Adımlar Neler? ✅",
    url: "https://medium.com/@Elifhilalumucu/bir-nft-projesini-ba%C5%9Far%C4%B1l%C4%B1-yapan-ad%C4%B1mlar-neler-d773a80fafb2?source=user_profile---------18----------------------------",
    image: "https://miro.medium.com/v2/1*ZHfONmAJtBNIv2Q6QIxTWw@2x.jpeg",
    description: "Merhabaaaaa değerli okuyucularım😊",
  },
  {
    title: "NFTs and Dynamic NFTs (dNFT) Guide 📚🗽 (all about NFT’s)",
    url: "https://medium.com/@Elifhilalumucu/nfts-and-dynamic-nfts-dnft-guide-all-about-nfts-ed4eb2f3647e?source=user_profile---------19----------------------------",
    image: "https://miro.medium.com/v2/da:true/0*M1du3amx_d9MYXBA",
    description:
      "Hello, my dear readers 🎃 I am Elif Hilal🔮 first of all, thank you for reading my articles. If there are any of you who do not know me or…",
  },
  {
    title: "Purdue’den Blockchain’e Dair Öğrendiklerim Serisi#4 Kriptografi🎃",
    url: "https://medium.com/@Elifhilalumucu/purdueden-blockchain-e-dair-%C3%B6%C4%9Frendiklerim-serisi-4-kriptografi-479005cf9737?source=user_profile---------20----------------------------",
    image: "https://miro.medium.com/v2/1*530whOOFVvPQbqaO8tL5ew.jpeg",
    description:
      "Selllaaammm değerli okuyucularım😊 , ben Elif Hilal! 🔮 öncelikle yazılarımı okuduğunuz için teşekkür ederim. Aranızda beni tanımayan veya…",
  },
  {
    title: "Detaylı Zero Knowledge (ZK) ve Layer- 2 Rehberi 📸",
    url: "https://medium.com/@Elifhilalumucu/detayl%C4%B1-zero-knowledge-zk-ve-layer-2-rehberi-2d2861b5c118?source=user_profile---------21----------------------------",
    image: "https://miro.medium.com/v2/1*ki5GFTdLL4sthyGqF9pxhg.jpeg",
    description:
      "Merhabaa değerli okuyucularım😊 , ben Elif Hilal! 🔮 Yine , yine ve yeniden ben! Öncelikle yazılarımı okuduğunuz için sizlere teşekkür…",
  },
  {
    title: "Purdue’den Blockchain’e Dair Öğrendiklerim Serisi#2 🎃",
    url: "https://medium.com/@Elifhilalumucu/purdueden-blockchain-e-dair-%C3%B6%C4%9Frendiklerim-serisi-2-1e435b01be08?source=user_profile---------22----------------------------",
    image: "https://miro.medium.com/v2/1*kX4-3h7b1mA6nQBb40h_qg.jpeg",
    description:
      "Selllaaammm değerli okuyucularım😊 , ben Elif Hilal! 🔮 öncelikle yazılarımı okuduğunuz için teşekkür ederim. Aranızda beni tanımayan veya…",
  },
  {
    title: "NFT’ler ve Dinamik NFT’ler (dNFT) Rehberi 📚🗽",
    url: "https://medium.com/@Elifhilalumucu/nftler-ve-dinamik-nft-ler-dnft-rehberi-4ffe7dbb0279?source=user_profile---------23----------------------------",
    image: "https://miro.medium.com/v2/da:true/0*arq89vCR80w5xagF",
    description:
      "Merhaba değerli okuyucularım.Ben Elif Hilal! 🔮 öncelikle yazılarımı okuduğunuz için teşekkür ederim.Aranızda beni tanımayan veya ilk defa…",
  },
  {
    title: "Purdue’den Blockchain’e Dair Öğrendiklerim Serisi#1 🎃",
    url: "https://medium.com/@Elifhilalumucu/purdueden-blockchain-e-dair-%C3%B6%C4%9Frendiklerim-serisi-1-b3355b47f3d8?source=user_profile---------24----------------------------",
    image: "https://miro.medium.com/v2/1*mSQPY4-W1wX5O-alBIa6_A.jpeg",
    description:
      "Merhaba değerli okuyucularım,ben Elif Hilal! 🔮 öncelikle yazılarımı okuduğunuz için teşekkür ederim. Aranızda beni tanımayan veya ilk defa…",
  },
  {
    title:
      "Polygon Blockchaini üzerinde Dinamik NFT’ler Nasıl Oluşturulur ? 💫",
    url: "https://medium.com/@Elifhilalumucu/polygon-blockchaini-%C3%BCzerinde-dinamik-nftler-nas%C4%B1l-olu%C5%9Fturulur-43f4403b23ce?source=user_profile---------25----------------------------",
    image: "https://miro.medium.com/v2/da:true/0*kwxt5cFmEvp5ZzYg",
    description:
      "Selam değerli arkadaşlarım ve okuyucularım.👯‍♀️ Ben Elif Hilal! 🔮 Blockchain teknolojisi, akıllı sözleşmeler, web3 ve hukuk alanlarında…",
  },
  {
    title: "💭Akıllı Sözleşmeleri Hukuki Yapımıza Nasıl Entegre Ederiz? 🛠️",
    url: "https://medium.com/@Elifhilalumucu/ak%C4%B1ll%C4%B1-s%C3%B6zle%C5%9Fmeleri-hukuki-yap%C4%B1m%C4%B1za-nas%C4%B1l-entegre-ederiz-%EF%B8%8F-4eb462537a33?source=user_profile---------26----------------------------",
    image: "https://miro.medium.com/v2/da:true/0*ITXRs-LSnIUZUx8_",
    description: "Selam değerli arkadaşlarım ve okuyucularım.👯‍♀️",
  },
  {
    title:
      "Solidity Programlama Dili ile Akıllı Sözleşmeye “Merhaba Dünya” Yazalım 👻",
    url: "https://medium.com/@Elifhilalumucu/solidity-programlama-dili-ile-ak%C4%B1ll%C4%B1-s%C3%B6zle%C5%9Fmeye-merhaba-d%C3%BCnya-yazal%C4%B1m-31e457b8cc01?source=user_profile---------27----------------------------",
    image: "https://miro.medium.com/v2/da:true/0*4aeFgEpRAQzOYJl2",
    description:
      "Selam değerli arkadaşlarım ve okuyucularım.👯‍♀️Ben Elif Hilal! Blockchain teknolojisi, akıllı sözleşmeler, web3 ve hukuk alanlarında…",
  },
  {
    title: "Zero-Knowledge (Sıfır Bilgi) Blockchain Projeleri",
    url: "https://medium.com/@Elifhilalumucu/zero-knowledge-s%C4%B1f%C4%B1r-bilgi-blockchain-projeleri-1172f790a075?source=user_profile---------29----------------------------",
    image: "https://miro.medium.com/v2/da:true/0*VdYKIVLZSGwViG3Y",
    description:
      "Selam! 🙂 Zero-knowledge teknolojisini eminim ki duymuşsunuzdur. Bu yazımda bu teknolojinin nasıl kullanıldığına ve örneklerine…",
  },
  {
    title: "Blockchain: Worldwide Regulations and Case Studies Series #1",
    url: "https://medium.com/@Elifhilalumucu/blockchain-worldwide-regulations-and-case-studies-series-1-1288132ff56e?source=user_profile---------33----------------------------",
    image: "https://miro.medium.com/v2/da:true/0*2Y5-6wN52j922wfV",
    description:
      "Hi friends! 👯‍♀️ My name is Elif Hilal! I produce content in the fields of blockchain, software, smart contracts, and law. If you are…",
  },
  {
    title: "📌 Blockchain: Dünyadan Regülasyonlar ve Örnek Davalar Serisi #4",
    url: "https://medium.com/@Elifhilalumucu/blockchin-d%C3%BCnyadan-reg%C3%BClasyonlar-ve-%C3%B6rnek-davalar-serisi-4-b011c97f2e2b?source=user_profile---------34----------------------------",
    image: "https://miro.medium.com/v2/da:true/0*51TVa7zUyKH25yyu.gif",
    description:
      "Selam değerli arkadaşlarım, en son bir önceki yazımda sizlere bazı uluslararası Blokzincir ve ICO davalarından söz etmiştim. Örneğin…",
  },
  {
    title: "Blockchain: Dünyadan Regülasyonlar ve Örnek Davalar Serisi #3",
    url: "https://medium.com/@Elifhilalumucu/blockchin-d%C3%BCnyadan-reg%C3%BClasyonlar-ve-%C3%B6rnek-davalar-serisi-3-1d859f81147f?source=user_profile---------35----------------------------",
    image: "https://miro.medium.com/v2/da:true/0*qMM_YUfQ7nezVdFr",
    description:
      "Merhabaaa arkadaşlar! Blokzincir ve Dünyadan Regülasyonlar serisinin 3. yazısı ile devam ediyorum. Daha önceki yazılarda ABD’de SEC, AB’de…",
  },
  {
    title: "Blockchain: Dünyadan Regülasyonlar ve Örnek Davalar Serisi #2",
    url: "https://medium.com/@Elifhilalumucu/blockchin-d%C3%BCnyadan-reg%C3%BClasyonlar-ve-%C3%B6rnek-davalar-serisi-2-32dff425a5cc?source=user_profile---------36----------------------------",
    image: "https://miro.medium.com/v2/da:true/0*I7075TKyqW8k1_XJ",
    description:
      "Başlattığım bu seriye devam edeceğimi söylemiştim 🙂 Şimdi serinin ikinci yazısını okumak üzeresiniz. Umarım heyecanlısınızdır, değilseniz…",
  },
  {
    title: "Blockchain: Dünyadan Regülasyonlar ve Örnek Davalar Serisi #1",
    url: "https://medium.com/@Elifhilalumucu/blockchin-d%C3%BCnyadan-reg%C3%BClasyonlar-ve-%C3%B6rnek-davalar-serisi-1-62dfda5df6fb?source=user_profile---------37----------------------------",
    image: "https://miro.medium.com/v2/da:true/0*h-x9ZzoROcsKqf9e",
    description:
      "Seeellaaam arkadaşlar! 👯‍♀️ Hazırsanız muhteşem bir konuyu anlatacağım sizlere. Bu uzun bir seri olacağı için ve aktarmak istediğim çok…",
  },
  {
    title: "Overview of Web3 😊",
    url: "https://medium.com/@Elifhilalumucu/overview-of-web3-30e23e93094e?source=user_profile---------38----------------------------",
    image: "https://miro.medium.com/v2/da:true/0*riRQU1QGmelJxXjZ",
    description: "Hello,",
  },
  {
    title: "Smart Contract Developer Nasıl Olunur?",
    url: "https://medium.com/@Elifhilalumucu/smart-contract-developer-nas%C4%B1l-olunur-27f9ed5f3f13?source=user_profile---------40----------------------------",
    description:
      "Şu anda, dünya üzerinde dönüşüm etkisi yaratan teknolojiyle çalışma fırsatından, yetenek pazarındaki akıllı sözleşme geliştiricilerine…",
  },
  {
    title: "Blockchain Introductory Guide ♫",
    url: "https://medium.com/@Elifhilalumucu/blockchain-introductory-guide-29e671566db9?source=user_profile---------48----------------------------",
    image: "https://miro.medium.com/v2/1*xdgExC2_nJwtHOO8UDTLFQ.jpeg",
    description:
      "Hello friends, I have been working on this article for a long time and I finished it today. ♥ I was asked a lot of questions about this…",
  },
  {
    title: "BLOCKCHAIN’E GİRİŞ REHBERİ ☻☺",
    url: "https://medium.com/@Elifhilalumucu/blockchaine-gi%CC%87ri%CC%87%C5%9F-rehberi%CC%87-78cbb82ef631?source=user_profile---------49----------------------------",
    image: "https://miro.medium.com/v2/1*xdgExC2_nJwtHOO8UDTLFQ.jpeg",
    description:
      "Merhabaaaaalar! Kemerleri bağlayın arkadaşlar, sizlerle uzun bir Blockchain yolculuğuna çıkıyoruz ♥ Uzun zamandır düşünüyordum ve bugün…",
  }, */
];

async function autoScroll(page: Page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 100; // Scroll distance
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve({});
        }
      }, 100);
    });
  });
}

export default async function BlogContainer() {
  /*   const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(MEDIUM_USER_URL, { waitUntil: "networkidle2" });

  await autoScroll(page); // Perform auto-scrolling to load more articles

  const articles = await page.evaluate(() => {
    const articleElements = document.querySelectorAll("article");
    const articleList: IArticlePreview[] = [];

    articleElements.forEach((article) => {
      const titleElement = article.querySelector("h2");
      const linkElements = article.querySelectorAll("a");
      const imageElement = article.querySelectorAll("img")[1];
      const descriptionElement = article.querySelector("h3");

      let validUrl = null;

      linkElements.forEach((link) => {
        if (link.href.startsWith("https://medium.com/@Elifhilalumucu/")) {
          validUrl = link.href;
        }
      });

      if (titleElement && validUrl) {
        articleList.push({
          title: titleElement.innerText,
          url: validUrl,
          image: imageElement?.src.replace(/\/resize:fill:\d+:\d+\//, "/"),
          description: descriptionElement?.innerText,
        });
      }
    });

    return articleList;
  });

  await browser.close();

  console.log(articles); */

  return (
    <main className="container flex flex-col sm:pb-20">
      <TitleSection plainText="my" coloredText="blog" backgroundText="posts" />
      <ul className="grid gap-6 sm:px-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
        {articles.map((article) => (
          <ArticleCard key={article.url} {...article} />
        ))}
      </ul>
    </main>
  );
}
