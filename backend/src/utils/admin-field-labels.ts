import type { Core, Schema, UID } from "@strapi/strapi";

/**
 * Human-readable labels and help texts for the fields in the admin (content-manager edit and list
 * views). Strapi keeps them in the content-manager view configuration (core store), not in
 * schema.json, so bootstrap writes them on every start.
 *
 * This file is the source of truth for labels: `label` and `description` (and `placeholder` when
 * given) overwrite whatever is stored, so a label changed under "Configure the view" is reset on the
 * next start. Layouts, field sizes, order and every other setting stay as they are, apart from the
 * one-off tidy-up of the theme's edit view below. Copy is Turkish: the site's editor works in
 * Turkish (like src/admin/m3-palette/texts.ts). Descriptions say what the field does on the site,
 * so update them when the frontend changes how a field is used.
 */

export interface FieldLabel {
  label: string;
  description: string;
  placeholder?: string;
}

// Added by Strapi to every type; the content-manager labels them itself
type SystemField =
  | "id"
  | "documentId"
  | "createdAt"
  | "updatedAt"
  | "publishedAt"
  | "createdBy"
  | "updatedBy"
  | "locale"
  | "localizations";

type ApiUid = Extract<UID.ContentType, `api::${string}`>;

// Every attribute of every API content type must have an entry (checked by the compiler)
type LabelMap = {
  [U in ApiUid]: Record<Exclude<Schema.AttributeNames<U>, SystemField>, FieldLabel>;
};

const PAGE_TITLE = {
  page_title: {
    label: "Sayfa başlığı",
    description:
      "Sayfanın üstünde büyük harflerle görünen başlık; birden çok kelimeyse son kelime ana renkte.",
  },
  page_title_background: {
    label: "Arka plan kelimesi",
    description:
      "Başlığın arkasında silik ve çok büyük görünen dekoratif kelime; telefonda gizlenir.",
  },
} satisfies Record<string, FieldLabel>;

const URL_RULE = "http(s):// ile başlamalı.";

export const ADMIN_FIELD_LABELS: LabelMap = {
  "api::home-page.home-page": {
    greeting: {
      label: "Karşılama başlığı",
      description: "Ana sayfada ana renkte görünen büyük karşılama başlığı; boşsa gösterilmez.",
    },
    introduction: {
      label: "Tanıtım metni",
      description:
        "Karşılama başlığının altındaki paragraf; altında iletişim butonu ve sosyal bağlantılar yer alır.",
    },
    hero_image: {
      label: "Profil fotoğrafı",
      description:
        "Ana sayfanın ana görseli; telefonda yuvarlak, geniş ekranda dikey (4:5) kırpılır.",
    },
  },
  "api::blog-page.blog-page": PAGE_TITLE,
  "api::conferences-page.conferences-page": PAGE_TITLE,
  "api::courses-page.courses-page": PAGE_TITLE,
  "api::videos-page.videos-page": PAGE_TITLE,
  "api::contact-page.contact-page": {
    ...PAGE_TITLE,
    title: {
      label: "Giriş başlığı",
      description: "Sayfa başlığının altında, iletişim kanallarının üstünde görünen başlık.",
    },
    description: {
      label: "Giriş metni",
      description: "Giriş başlığının altında görünen kısa açıklama.",
    },
    form_recipient_email: {
      label: "Form alıcısı",
      description: "İletişim formundan gelen mesajların gönderildiği adres; sitede görünmez.",
      placeholder: "ad@ornek.com",
    },
  },
  "api::not-found-page.not-found-page": {
    image: {
      label: "Astronot görseli",
      description:
        "404 sayfasında yuvarlak kask camının içinde görünen görsel; kareye yakın bir görsel seçin.",
    },
  },
  "api::site-setting.site-setting": {
    site_name: {
      label: "Site adı",
      description:
        'Sekme başlıklarının sonunda ("… | Site adı") ve paylaşım önizlemelerinde görünen ad.',
    },
    job_title: {
      label: "Unvan",
      description:
        'Ana sayfa başlığında ("Site adı | Unvan"), ana sayfadaki büyük başlıkta ve uygulama adında görünür.',
    },
    site_description: {
      label: "Site açıklaması",
      description:
        "Kendi açıklaması olmayan sayfaların varsayılan açıklaması; site bilgisinde ve uygulama tanımında kullanılır.",
    },
    default_og_image: {
      label: "Varsayılan paylaşım görseli",
      description:
        "Kendi görseli olmayan sayfalar (ör. ana sayfa) paylaşılınca görünür, 1200×630; boşsa otomatik banner.",
    },
    twitter_handle: {
      label: "X kullanıcı adı",
      description: "X paylaşım kartlarında site ve yazar olarak gösterilen hesap.",
      placeholder: "@kullaniciadi",
    },
    twitter_user_id: {
      label: "X kullanıcı kimliği",
      description:
        "X hesabının sayısal kimliği (yalnızca rakam); paylaşım kartı etiketlerinde kullanılır, görünmez.",
    },
    karakod_url: {
      label: "Karakod web sitesi",
      description: `Ana sayfadaki bağlantılar arasında Karakod simgesinin açtığı adres; ${URL_RULE}`,
      placeholder: "https://karakod.io/",
    },
    karakod_linkedin_url: {
      label: "Karakod LinkedIn sayfası",
      description: `İletişim sayfasındaki "Connect with Us" bağlantısının adresi; ${URL_RULE}`,
      placeholder: "https://www.linkedin.com/company/…",
    },
    legalifi_url: {
      label: "Legalifi web sitesi",
      description: `Ana sayfadaki bağlantılar arasında Legalifi logosunun açtığı adres; ${URL_RULE}`,
      placeholder: "https://legalifi.io/",
    },
  },
  "api::social-media-link.social-media-link": {
    twitter_x: {
      label: "X (Twitter) profili",
      description:
        "Profil adresi; ana sayfadaki simgelerde ve iletişim sayfasında @kullanıcı adıyla görünür.",
      placeholder: "https://x.com/kullaniciadi",
    },
    linkedin: {
      label: "LinkedIn profili",
      description:
        "Profil adresi (linkedin.com/in/…); ana sayfadaki simgelerde ve iletişim sayfasında görünür.",
      placeholder: "https://www.linkedin.com/in/ad-soyad",
    },
    email: {
      label: "E-posta adresi",
      description:
        'İletişim sayfasında "Mail Me" bağlantısıyla gösterilen adres; form mesajları buraya gitmez.',
      placeholder: "ad@ornek.com",
    },
    youtube: {
      label: "YouTube kanalı",
      description:
        "Kanal adresi (youtube.com/@…); ana sayfadaki simgelerde ve iletişim sayfasında görünür.",
      placeholder: "https://www.youtube.com/@kanal",
    },
    instagram: {
      label: "Instagram profili",
      description:
        "Profil adresi; ana sayfadaki simgelerde ve iletişim sayfasında görünür, boşsa gösterilmez.",
      placeholder: "https://www.instagram.com/kullaniciadi",
    },
    medium: {
      label: "Medium profili",
      description:
        "Profil adresi (medium.com/@…); ana sayfadaki simgelerde ve Google'ın profil eşleştirmesinde kullanılır.",
      placeholder: "https://medium.com/@kullaniciadi",
    },
    substack: {
      label: "Substack yayını",
      description:
        "Yayın adresi (….substack.com); ana sayfadaki simgelerde ve Google'ın profil eşleştirmesinde kullanılır.",
      placeholder: "https://kullaniciadi.substack.com",
    },
    udemy: {
      label: "Udemy eğitmen profili",
      description:
        "Eğitmen profili (udemy.com/user/…); ana sayfadaki simgelerde ve Google'ın profil eşleştirmesinde kullanılır.",
      placeholder: "https://www.udemy.com/user/kullaniciadi/",
    },
  },
  "api::conference.conference": {
    title: {
      label: "Etkinlik adı",
      description: "Konferans kartında tarihin altında görünen başlık.",
    },
    location: {
      label: "Yer",
      description: "Kartın altındaki konum etiketi; uzunsa kısaltılır.",
      placeholder: "İstanbul, Türkiye",
    },
    date: {
      label: "Tarih",
      description:
        "Kartta gösterilen etkinlik tarihi; konferanslar en yeniden eskiye bu tarihe göre sıralanır.",
    },
    images: {
      label: "Fotoğraflar",
      description:
        "Kartta kaydırılabilir galeri olarak görünür, tıklayınca tam ekran açılır; ilk fotoğraf kapaktır.",
    },
  },
  "api::video.video": {
    title: {
      label: "Video başlığı",
      description: "Video kartında görünen başlık; iki satırdan uzunsa kısaltılır.",
    },
    description: {
      label: "Açıklama",
      description: "Kartta başlığın altında görünen kısa metin; iki satırdan uzunsa kısaltılır.",
    },
    url: {
      label: "Video adresi",
      description:
        "Kart tıklanınca açılan adres; YouTube videosuysa kanal listesindeki kopyasının yerini alır.",
      placeholder: "https://www.youtube.com/watch?v=…",
    },
    thumbnail: {
      label: "Kapak görseli",
      description:
        "Kartın 16:9 görseli; boşsa YouTube kapağı, o da yoksa varsayılan görsel kullanılır.",
    },
    publish_date: {
      label: "Yayın tarihi",
      description:
        "Kartta gösterilen tarih; videolar öne çıkanlardan sonra en yeniden eskiye sıralanır.",
    },
    isFeatured: {
      label: "Öne çıkan",
      description: 'Açıksa video listenin başına alınır ve kartta "Featured" etiketi görünür.',
    },
  },
  "api::theme.theme": {
    source_type: {
      label: "Palet kaynağı",
      description: "Palet bir renkten (color) mi, fotoğraftan (image) mı üretilsin.",
    },
    seed_color: {
      label: "Ana renk (seed)",
      description:
        "Paletin üretildiği renk (#RRGGBB); fotoğraf kaynağında aday renklerden biri seçilir.",
    },
    source_image: {
      label: "Kaynak fotoğraf",
      description:
        'Kaynak "image" iken renklerin okunduğu fotoğraf; aday renkler kaydedince hesaplanır.',
    },
    variant: {
      label: "Palet varyantı",
      description:
        "Paletin ana renkten nasıl türetileceği (Material 3); her varyantın açıklaması önizlemede.",
    },
    palette: {
      label: "Renk paleti",
      description:
        "Kaydedince otomatik üretilir; yayınlanınca sitenin bütün renkleri buradan gelir. Renkleri Önizleme'de deneyin.",
    },
    image_candidates: {
      label: "Fotoğraftan çıkan renkler",
      description:
        "Kaydedince fotoğraftan otomatik çıkarılır; önizlemede tıklanarak seçilir, elle düzenlenmez.",
    },
    primaryDark: {
      label: "Eski koyu tema rengi",
      description: "Eski renk alanı; site ve palet artık kullanmıyor.",
    },
    primaryLight: {
      label: "Eski açık tema rengi",
      description:
        "Eski renk alanı; site artık kullanmıyor, yalnızca paleti olmayan eski kayıtlara ana renk olur.",
    },
  },
};

/* -------------------------------------------------------------------------------------------------
 * View configuration (shape of @strapi/content-manager services/utils/configuration/*)
 * -----------------------------------------------------------------------------------------------*/

interface EditMetadata {
  label?: string;
  description?: string | null;
  placeholder?: string | null;
  visible?: boolean;
  editable?: boolean;
  mainField?: string;
}

interface FieldMetadata {
  edit: EditMetadata;
  list: { label?: string; searchable?: boolean; sortable?: boolean };
}

export interface EditLayoutField {
  name: string;
  size: number;
}

export interface ViewConfiguration {
  settings: Record<string, unknown>;
  metadatas: Record<string, FieldMetadata>;
  layouts: { list: string[]; edit: EditLayoutField[][] };
  [key: string]: unknown;
}

export interface MergeResult {
  config: ViewConfiguration;
  changed: boolean;
}

// The stored configuration is plain JSON
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

/**
 * The configuration with the labels applied: edit label / description / placeholder (placeholder
 * only when given) and list label. Fields without stored metadata are skipped. Doesn't mutate
 * `config`; `changed` is false when everything already matched.
 */
export function mergeFieldLabels(
  config: ViewConfiguration,
  labels: Record<string, FieldLabel>,
): MergeResult {
  const next = clone(config);
  let changed = false;
  const set = <T extends object, K extends keyof T>(target: T, key: K, value: T[K] | undefined) => {
    if (value === undefined || target[key] === value) return;
    target[key] = value;
    changed = true;
  };

  for (const [field, { label, description, placeholder }] of Object.entries(labels)) {
    const meta = next.metadatas?.[field];
    if (!meta) continue;
    meta.edit ??= {};
    meta.list ??= {};
    set(meta.edit, "label", label);
    set(meta.edit, "description", description);
    set(meta.edit, "placeholder", placeholder);
    set(meta.list, "label", label);
  }

  return { config: next, changed };
}

/* -------------------------------------------------------------------------------------------------
 * Theme edit view
 * -----------------------------------------------------------------------------------------------*/

const THEME_UID = "api::theme.theme";
const MAX_ROW_SIZE = 12;

// Content-manager default sizes (field-sizes.js): json is full width, the rest half
const THEME_FIELD_SIZES: Record<string, number> = {
  source_type: 6,
  seed_color: 6,
  source_image: 6,
  variant: 6,
  palette: 12,
  image_candidates: 12,
  primaryDark: 6,
  primaryLight: 6,
};

// Generated on save (shown by the palette preview) or legacy. Hidden fields stay in the form values:
// the edit view builds them from the document, not from the layout, so the palette input still reads
// `image_candidates`.
const THEME_HIDDEN_FIELDS = ["image_candidates", "primaryDark", "primaryLight"];

const THEME_EDIT_LAYOUT: string[][] = [
  ["source_type", "seed_color"],
  ["source_image", "variant"],
  ["palette"],
];

// Rows as the content-manager fills them: left to right, a new row when the next field doesn't fit
function packRows(fields: EditLayoutField[]): EditLayoutField[][] {
  const rows: EditLayoutField[][] = [];
  let width = MAX_ROW_SIZE;
  for (const field of fields) {
    if (width + field.size > MAX_ROW_SIZE) {
      rows.push([]);
      width = 0;
    }
    rows[rows.length - 1]?.push(field);
    width += field.size;
  }
  return rows;
}

const sameLayout = (a: EditLayoutField[][], b: EditLayoutField[][]) =>
  JSON.stringify(a) === JSON.stringify(b);

/**
 * True when the edit layout is still the one Strapi generated: every theme field once, default
 * sizes, rows filled in order. Anything else was arranged by hand and is left alone.
 */
export function isGeneratedThemeLayout(edit: EditLayoutField[][]): boolean {
  const fields = edit.flat();
  const names = new Set(fields.map((field) => field.name));
  const expected = Object.keys(THEME_FIELD_SIZES);
  return (
    fields.length === expected.length &&
    names.size === expected.length &&
    fields.every((field) => THEME_FIELD_SIZES[field.name] === field.size) &&
    sameLayout(packRows(fields), edit)
  );
}

/**
 * Tidies the theme's generated edit view once: source fields first, the palette preview on its own
 * full-width row after the variant, generated and legacy fields hidden. A layout arranged by hand
 * (including this one, so later runs do nothing) is kept as it is.
 */
export function tidyThemeEditView(config: ViewConfiguration): MergeResult {
  const edit = config.layouts?.edit;
  if (!Array.isArray(edit) || !isGeneratedThemeLayout(edit)) return { config, changed: false };

  const next = clone(config);
  next.layouts.edit = THEME_EDIT_LAYOUT.map((row) =>
    row.map((name) => ({ name, size: THEME_FIELD_SIZES[name] ?? MAX_ROW_SIZE })),
  );
  for (const name of THEME_HIDDEN_FIELDS) {
    const meta = next.metadatas?.[name];
    if (meta) meta.edit = { ...meta.edit, visible: false };
  }
  return { config: next, changed: true };
}

/* -------------------------------------------------------------------------------------------------
 * Bootstrap
 * -----------------------------------------------------------------------------------------------*/

// The part of the content-manager "content-types" service used here (services/content-types.js)
interface ContentTypesService {
  findContentType(uid: string): { uid: string } | null | undefined;
  findConfiguration(contentType: { uid: string }): Promise<ViewConfiguration>;
  updateConfiguration(
    contentType: { uid: string },
    configuration: ViewConfiguration,
  ): Promise<unknown>;
}

const errorMessage = (error: unknown) => (error instanceof Error ? error.message : String(error));

/**
 * Writes the labels into the stored view configurations. Idempotent (nothing is written when they
 * already match) and never throws: a failing type is logged and left as it is. Call in bootstrap(),
 * which runs after the content-manager has synced the configurations with the schemas.
 */
export async function applyAdminFieldLabels(strapi: Core.Strapi): Promise<void> {
  let service: ContentTypesService;
  try {
    service = strapi.plugin("content-manager").service("content-types") as ContentTypesService;
  } catch (error) {
    strapi.log.warn(`Admin field labels: content-manager unavailable: ${errorMessage(error)}`);
    return;
  }

  let updated = 0;
  for (const [uid, labels] of Object.entries(ADMIN_FIELD_LABELS)) {
    try {
      const contentType = service.findContentType(uid);
      if (!contentType) continue;

      let { config, changed } = mergeFieldLabels(
        await service.findConfiguration(contentType),
        labels,
      );
      if (uid === THEME_UID) {
        const tidied = tidyThemeEditView(config);
        config = tidied.config;
        changed = changed || tidied.changed;
      }
      if (!changed) continue;

      await service.updateConfiguration(contentType, config);
      updated += 1;
    } catch (error) {
      strapi.log.warn(`Admin field labels: ${uid} left as is: ${errorMessage(error)}`);
    }
  }
  if (updated > 0) strapi.log.info(`Admin field labels: updated ${updated} content type(s)`);
}
