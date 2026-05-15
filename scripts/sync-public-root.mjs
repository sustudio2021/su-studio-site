import { copyFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const rootPublicFiles = ["robots.txt", "sitemap.xml"];

for (const file of rootPublicFiles) {
  const source = join(root, "public", file);
  const target = join(root, file);

  if (!existsSync(source)) {
    throw new Error(`Missing public asset: public/${file}`);
  }

  copyFileSync(source, target);
}

console.log("Synced public root files.");
