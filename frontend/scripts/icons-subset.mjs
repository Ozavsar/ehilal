/**
 * Downloads the Material Symbols Rounded subset for `src/components/icon-names.ts` into
 * src/app/fonts/ (woff2 + manifest). `--check` fails, without network, when the font no longer
 * matches the registry. FILL stays variable (0..1) so <Icon filled> works with the same file.
 */
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const REGISTRY = resolve(ROOT, "src/components/icon-names.ts");
const OUTPUT = resolve(ROOT, "src/app/fonts/material-symbols-rounded.woff2");
const MANIFEST = resolve(ROOT, "src/app/fonts/material-symbols-rounded.json");

// Axis names alphabetical with lowercase first; the values after `@` follow the same order
const AXES = "opsz,wght,FILL,GRAD@24,400,0..1,0";

// Google Fonts only serves woff2 to user agents it knows support it
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";

/** Reads the names from the ICON_NAMES literal without executing TypeScript. */
function readIconNames() {
  const source = readFileSync(REGISTRY, "utf8");
  const block = source.match(/export const ICON_NAMES = \[([\s\S]*?)\] as const/);
  if (!block) throw new Error(`No ICON_NAMES array found in ${REGISTRY}`);

  const names = [...block[1].matchAll(/"([a-z0-9_]+)"/g)].map((m) => m[1]);
  if (names.length === 0) throw new Error("The icon registry is empty.");

  const duplicates = names.filter((n, i) => names.indexOf(n) !== i);
  if (duplicates.length > 0) {
    throw new Error(`Duplicate icon names: ${[...new Set(duplicates)].join(", ")}`);
  }
  const unsorted = names.find((n, i) => i > 0 && n < names[i - 1]);
  if (unsorted) throw new Error(`Keep the registry sorted: "${unsorted}" is out of order.`);
  return names;
}

function check(names) {
  if (!existsSync(OUTPUT) || !existsSync(MANIFEST)) {
    throw new Error("No icon font built yet. Run `yarn icons:subset`.");
  }
  const manifest = JSON.parse(readFileSync(MANIFEST, "utf8"));
  const added = names.filter((n) => !manifest.icons.includes(n));
  const removed = manifest.icons.filter((n) => !names.includes(n));
  if (added.length > 0 || removed.length > 0 || manifest.axes !== AXES) {
    const parts = [];
    if (added.length > 0) parts.push(`missing from the font: ${added.join(", ")}`);
    if (removed.length > 0) parts.push(`no longer in the registry: ${removed.join(", ")}`);
    if (manifest.axes !== AXES) parts.push(`axes changed (${manifest.axes} → ${AXES})`);
    throw new Error(
      `The icon font is out of date (${parts.join("; ")}). Run \`yarn icons:subset\`.`,
    );
  }
  process.stdout.write(`Icon font is up to date: ${names.length} icons.\n`);
}

async function build(names) {
  const cssUrl =
    `https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:${AXES}` +
    `&icon_names=${names.join(",")}&display=block`;
  const cssResponse = await fetch(cssUrl, { headers: { "User-Agent": UA } });
  if (!cssResponse.ok) {
    throw new Error(`Google Fonts returned ${cssResponse.status} for the stylesheet.`);
  }
  const css = await cssResponse.text();

  // Subsets come from a query-string URL (/l/font?kit=…), so the format is checked separately
  const fontUrl = css.match(/src:\s*url\((https:\/\/[^)]+)\)/)?.[1];
  if (!fontUrl || !/format\(['"]?woff2/.test(css)) {
    throw new Error(`No woff2 source in the Google Fonts response:\n${css.slice(0, 300)}`);
  }

  const fontResponse = await fetch(fontUrl, { headers: { "User-Agent": UA } });
  if (!fontResponse.ok) throw new Error(`Font download failed with ${fontResponse.status}.`);
  const font = Buffer.from(await fontResponse.arrayBuffer());

  const previous = existsSync(OUTPUT) ? statSync(OUTPUT).size : 0;
  mkdirSync(dirname(OUTPUT), { recursive: true });
  writeFileSync(OUTPUT, font);
  writeFileSync(MANIFEST, `${JSON.stringify({ axes: AXES, icons: names }, null, 2)}\n`);

  const kb = (n) => `${(n / 1024).toFixed(1)} KB`;
  const was = previous ? ` (was ${kb(previous)})` : "";
  process.stdout.write(
    `material-symbols-rounded.woff2: ${names.length} icons, ${kb(font.length)}${was}\n`,
  );
}

const names = readIconNames();
if (process.argv.includes("--check")) check(names);
else await build(names);
