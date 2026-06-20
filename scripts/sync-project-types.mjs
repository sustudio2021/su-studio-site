import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { extname, join } from "node:path";
import vm from "node:vm";

const root = process.cwd();
const source = readFileSync(join(root, "content", "project-types.ts"), "utf8");

const projectTypesMatch = source.match(/export const projectTypes = ([\s\S]*?) as const;/);
const contentTypesMatch = source.match(/export const contentTypes = ([\s\S]*?) as const;/);

if (!projectTypesMatch || !contentTypesMatch) {
  console.error("Could not read project type definitions.");
  process.exit(1);
}

const projectTypes = vm.runInNewContext(`(${projectTypesMatch[1]})`);
const contentTypes = vm.runInNewContext(`(${contentTypesMatch[1]})`);
const workHtml = readFileSync(join(root, "work.html"), "utf8");

const rootArchives = readdirSync(root)
  .filter((file) => extname(file) === ".html" && file.startsWith("archive-"));

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const detectContentTypes = (html) => {
  const types = [];
  if (html.includes('id="youtube"')) types.push("youtube");
  if (html.includes('id="shorts"')) types.push("shorts");
  if (html.includes('id="podcast"')) types.push("podcast");
  if (html.includes('id="project"')) types.push("project");
  return types;
};

const contentTypeLinks = (types) =>
  types
    .map((type) => `<a class="archive-meta-link" href="#${type}">${escapeHtml(contentTypes[type])}</a>`)
    .join(" / ");

const extractYearFromWork = (archive) => {
  const pattern = new RegExp(`<a class="project-card" href="${archive}"[\\s\\S]*?<div class="archive-meta">\\s*<span>([\\s\\S]*?)<\\/span>`);
  return workHtml.match(pattern)?.[1]?.replace(/<[^>]*>/g, "").trim() || "";
};

const extractYear = (html, archive) => {
  const currentMeta = html.match(/<span><span class="archive-meta-label">Year<\/span>([\s\S]*?)<\/span>/)?.[1]?.trim();
  if (currentMeta && !currentMeta.includes("archive-meta-label") && !currentMeta.includes("&lt;")) {
    return currentMeta.replace(/<[^>]*>/g, "").trim();
  }

  return extractYearFromWork(archive) || html.match(/<div class="archive-meta">\s*<span>([\s\S]*?)<\/span>/)?.[1]?.replace(/<[^>]*>/g, "").trim() || "";
};

const workCategoryLabel = (categories) => {
  if (categories.includes("project")) return "FULL PRODUCTION / PROJECT";

  const parts = [];
  if (categories.includes("youtube")) parts.push("YOUTUBE");
  if (categories.includes("shorts")) parts.push("SHORTS");
  if (categories.includes("podcast")) parts.push("PODCAST");

  return `PRODUCTION SUPPORT / ${parts.join(" / ")}`;
};

for (const archive of rootArchives) {
  const filePath = join(root, archive);
  let html = readFileSync(filePath, "utf8");
  const types = detectContentTypes(html);

  if (types.length === 0) continue;

  const year = extractYear(html, archive);
  const projectType = types.includes("project") ? projectTypes.fullProduction : projectTypes.productionSupport;
  const meta = `          <div class="archive-meta">
            <span>${escapeHtml(year)}</span>
            <span>${escapeHtml(projectType.name)}</span>
            <span class="archive-meta-categories">${contentTypeLinks(types)}</span>
          </div>
          <p class="archive-description" lang="zh-Hant">${escapeHtml(projectType.chineseDescription || "")}</p>
          <p class="archive-description archive-description-en" lang="en">${escapeHtml(projectType.shortDescription || projectType.description)}</p>`;

  html = html.replace(
    /          <div class="archive-meta">[\s\S]*?<\/div>(?:\n\s*<p class="archive-description[^>]*>[\s\S]*?<\/p>)*/m,
    meta,
  );

  writeFileSync(filePath, html);
}

const workPath = join(root, "work.html");
let work = readFileSync(workPath, "utf8");

work = work.replace(
  /<a class="project-card" href="[^"]+" data-categories="([^"]*)"[\s\S]*?<\/a>/g,
  (card, categories) => {
    if (!/\b(?:youtube|shorts|podcast|project)\b/.test(categories)) return card;

    return card.replace(
      /<span class="category">[\s\S]*?<\/span>/,
      `<span class="category">${escapeHtml(workCategoryLabel(categories))}</span>`,
    );
  },
);

writeFileSync(workPath, work);

console.log("Synced project type metadata.");
