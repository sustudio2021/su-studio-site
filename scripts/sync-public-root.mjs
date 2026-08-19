import { copyFileSync, cpSync, existsSync } from "node:fs";
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

const podcastAssetsSource = join(root, "public", "podcast-assets");
const podcastAssetsTarget = join(root, "podcast-assets");

if (existsSync(podcastAssetsSource)) {
  cpSync(podcastAssetsSource, podcastAssetsTarget, { recursive: true });
}

console.log("Synced public root files.");
