import { existsSync, readFileSync, readdirSync } from "node:fs";
import { extname, join } from "node:path";

const root = process.cwd();
const htmlFiles = readdirSync(root).filter((file) => extname(file) === ".html");
const cleanUrlTargets = new Map(
  htmlFiles.map((file) => [`/${file.replace(/\.html$/, "")}`, file]),
);
const localTargets = new Set([
  ...htmlFiles,
  "archive-style.css",
  "og-cover.jpg",
  "public/og-cover.jpg",
  "public/robots.txt",
  "public/sitemap.xml",
  "robots.txt",
  "sitemap.xml",
  "su-logo.png",
]);

const referencedLocalFiles = new Set();
const missing = [];

for (const file of htmlFiles) {
  const html = readFileSync(join(root, file), "utf8");
  const matches = html.matchAll(/\b(?:href|src)=["']([^"']+)["']/g);

  for (const match of matches) {
    const value = match[1];
    if (
      value.startsWith("http://") ||
      value.startsWith("https://") ||
      value.startsWith("mailto:") ||
      value.startsWith("tel:") ||
      value.startsWith("/_vercel/") ||
      value.startsWith("#")
    ) {
      continue;
    }

    const target = value.split("#")[0].split("?")[0];
    if (!target) continue;
    const normalizedTarget = cleanUrlTargets.get(target) || target.replace(/^\//, "");

    referencedLocalFiles.add(normalizedTarget);
    if (!existsSync(join(root, normalizedTarget))) {
      missing.push(`${file} -> ${target}`);
    }
  }
}

for (const file of localTargets) {
  if (!existsSync(join(root, file))) {
    missing.push(file);
  }
}

if (missing.length > 0) {
  console.error("Missing local references:");
  for (const item of missing) console.error(`- ${item}`);
  process.exit(1);
}

console.log(`Verified ${htmlFiles.length} HTML files.`);
console.log(`Checked ${referencedLocalFiles.size} local references.`);
