// Editor-facing copy of the palette field. The site's editor works in Turkish, so the copy is Turkish.
import type { Variant } from "./palette";

export const VARIANT_INFO: Record<Variant, { name: string; description: string }> = {
  tonal_spot: {
    name: "Tonal Spot",
    description:
      "Material Theme Builder varsayılanı. Seed'in tonunu korur, doygunluğu düşürür. Sakin ve dengeli.",
  },
  vibrant: {
    name: "Vibrant",
    description: "En doygun primary. Enerjik.",
  },
  expressive: {
    name: "Expressive",
    description:
      "Tonları bilerek kaydırır. Primary seed'den bambaşka bir renge dönebilir (ör. kırmızı maviye).",
  },
  fidelity: {
    name: "Fidelity",
    description:
      "Seed'e en sadık olanı: primary container seed'in kendisi. Tertiary karşıt renk. MTB'deki \"Color match\".",
  },
  content: {
    name: "Content",
    description:
      "Fidelity gibi, ama tertiary yakın tonlardan seçilir. Fotoğraftan palet için tasarlandı.",
  },
  neutral: {
    name: "Neutral",
    description: "Neredeyse gri, renk çok hafif. Minimal.",
  },
  rainbow: {
    name: "Rainbow",
    description: "Renk yalnızca vurgularda, yüzeyler tamamen gri.",
  },
  fruit_salad: {
    name: "Fruit Salad",
    description: "Primary'nin tonunu kaydırır (ör. kırmızı pembe-mora döner). Eğlenceli.",
  },
  monochrome: {
    name: "Monochrome",
    description: "Seed'i yok sayar: siyah, beyaz ve gri.",
  },
};

export const TEXT = {
  variant: "Varyant",
  candidatesTitle: "Fotoğraftan çıkan aday renkler",
  candidatesHint: "Bir renge tıklayınca seed rengi olur ve önizleme hemen güncellenir.",
  candidatesEmpty: "Fotoğrafı seçip kaydedin. Aday renkler kaydettikten sonra burada görünür.",
  candidatesStale: "Fotoğraf değişti. Yeni aday renkler kaydedince hesaplanır.",
  candidateSelected: "seçili",
  standardContrast: "Standart",
  highContrast: "Yüksek kontrast",
  showAllRoles: "Bütün rolleri göster",
  showKeyRoles: "Ana rolleri göster",
  light: "Açık tema",
  dark: "Koyu tema",
  noSeed: "Önizleme için geçerli bir seed rengi seçin (#RRGGBB).",
  showingStored: "Seed rengi geçersiz; kayıtlı palet gösteriliyor.",
  notGenerated: "Palet henüz üretilmedi. Kaydedince üretilecek.",
  unsaved: "Önizleme kaydedilmemiş değişiklikleri gösteriyor.",
  saveNote:
    "Önizleme tarayıcıda hesaplanır. Saklanan palet Kaydet (Save) ile güncellenir, sitede Yayınla (Publish) ile yayına girer.",
  sample: {
    title: "Başlık",
    body: "İkincil metin ve",
    link: "bir bağlantı",
    filled: "Dolu buton",
    tonal: "Tonal buton",
    outlined: "Çerçeveli",
    chip: "Öne çıkan",
    cardTitle: "Kart başlığı",
    cardBody: "Kart metni",
    fieldLabel: "E-posta",
    fieldValue: "ad@ornek.com",
    fieldError: "Geçerli bir e-posta girin",
  },
} as const;
