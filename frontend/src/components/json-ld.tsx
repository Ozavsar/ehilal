// Characters that could end the <script> element or break it as inline JS, as JSON escapes.
// Strapi and Medium text ends up in the data, so "</script>" in a title must stay text.
const UNSAFE_CHARACTERS = /[<>&\u2028\u2029]/g;
const escapeCharacter = (char: string) => `\\u${char.charCodeAt(0).toString(16).padStart(4, "0")}`;

export function serializeJsonLd(data: object): string {
  return JSON.stringify(data).replace(UNSAFE_CHARACTERS, escapeCharacter);
}

/**
 * Schema.org structured data, server-rendered as <script type="application/ld+json"> (a plain
 * script tag: it is data, not code for next/script). Build the data with the helpers in
 * lib/metadata.ts.
 */
export default function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
