// Writes the website's fallback palette (frontend/src/config/default-palette.json), used when
// Strapi has no published theme palette or can't be reached. Same generator as the theme save
// (src/utils/m3-palette.ts), run from its compiled output: `yarn palette:default [seed] [variant]`.
// No Strapi app is loaded.
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const backend = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const target = path.resolve(backend, "../frontend/src/config/default-palette.json");
const [seed = "#bf2821", variant = "tonal_spot"] = process.argv.slice(2);

// Compile just the generator to a temporary folder inside node_modules, so its packages resolve
const cache = path.join(backend, "node_modules/.cache");
mkdirSync(cache, { recursive: true });
const outDir = mkdtempSync(path.join(cache, "palette-default-"));
try {
  execFileSync(
    process.execPath,
    [
      createRequire(import.meta.url).resolve("typescript/bin/tsc"),
      path.join(backend, "src/utils/m3-palette.ts"),
      ...["--outDir", outDir, "--module", "commonjs", "--target", "es2019"],
      ...["--esModuleInterop", "--skipLibCheck", "--moduleResolution", "node"],
    ],
    { stdio: "inherit" },
  );
  const { generatePalette } = createRequire(import.meta.url)(path.join(outDir, "m3-palette.js"));
  const palette = generatePalette({ seed, variant });
  writeFileSync(target, JSON.stringify(palette, null, 2) + "\n");
  console.info(`Wrote ${path.relative(backend, target)} (seed ${palette.source.seed}, ${variant})`);
} finally {
  rmSync(outDir, { recursive: true, force: true });
}
