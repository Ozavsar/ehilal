// Editor-facing (Turkish) copy of the palette field
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
  candidatesHint: "Bir renge tıklayınca seed rengi olur.",
  candidatesEmpty: "Fotoğrafı seçip kaydedin. Aday renkler kaydettikten sonra burada görünür.",
  candidatesStale: "Fotoğraf değişti. Yeni aday renkler kaydedince hesaplanır.",
  candidateSelected: "seçili",
  choiceTitle: "Önizlemede seçtiğiniz renk",
  choiceApply: "Uygula",
  choiceDismiss: "Yoksay",
  noSeed: "Geçerli bir seed rengi seçin (#RRGGBB).",
  notGenerated: "Palet henüz üretilmedi. Kaydedince üretilecek.",
  unsaved: "Kaydedilmemiş değişiklik var. Kaydedince palet yeniden üretilir.",
  previewNote:
    "Renkleri sitede denemek için Önizleme'yi (Open preview) açın. Üstteki araç çubuğundan rengi ve varyantı canlı değiştirip \"Strapi'ye aktar\" ile buraya getirebilirsiniz.",
  saveNote: "Kaydet (Save) paleti üretir, Yayınla (Publish) sitede yayına alır.",
} as const;
