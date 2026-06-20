import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { extname, join } from "node:path";
import vm from "node:vm";

const root = process.cwd();
const brandPath = join(root, "content", "brand.ts");

const brandSource = readFileSync(brandPath, "utf8");
const match = brandSource.match(/export const brand = ([\s\S]*?) as const;/);

if (!match) {
  console.error("Could not find `export const brand = ... as const;` in content/brand.ts");
  process.exit(1);
}

const brand = vm.runInNewContext(`(${match[1]})`);

const htmlFiles = readdirSync(root).filter((file) => extname(file) === ".html");

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const organizationSchema = JSON.stringify(
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: brand.chineseName,
    alternateName: brand.name,
    url: brand.contact.website,
    email: brand.contact.email,
    sameAs: [],
  },
  null,
  8,
);

const replaceMeta = (html, title, description) => {
  const safeTitle = escapeHtml(title);
  const safeDescription = escapeHtml(description);

  return html
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${safeTitle}</title>`)
    .replace(/<meta name="title" content="[^"]*" \/>/, `<meta name="title" content="${safeTitle}" />`)
    .replace(/<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${safeDescription}" />`)
    .replace(/<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${safeTitle}" />`)
    .replace(/<meta property="og:description" content="[^"]*" \/>/, `<meta property="og:description" content="${safeDescription}" />`)
    .replace(/<meta name="twitter:title" content="[^"]*" \/>/, `<meta name="twitter:title" content="${safeTitle}" />`)
    .replace(/<meta name="twitter:description" content="[^"]*" \/>/, `<meta name="twitter:description" content="${safeDescription}" />`);
};

const replaceSchema = (html) =>
  html.replace(
    /<script type="application\/ld\+json">\s*[\s\S]*?\s*<\/script>/,
    `<script type="application/ld+json">\n${organizationSchema}\n    </script>`,
  );

const writeHtml = (file, transform) => {
  const filePath = join(root, file);
  const html = readFileSync(filePath, "utf8");
  writeFileSync(filePath, transform(html));
};

for (const file of htmlFiles) {
  writeHtml(file, replaceSchema);
}

writeHtml("index.html", (html) => {
  html = replaceMeta(html, brand.fullName, brand.description);
  html = html
    .replace(/aria-label="SU STUDIO"/, `aria-label="${escapeHtml(brand.name)}"`)
    .replace(/aria-label="SU STUDIO home"/, `aria-label="${escapeHtml(brand.name)} home"`)
    .replace(/<h1><a href="index\.html" aria-label="[^"]*">[\s\S]*?<\/a><\/h1>/, `<h1><a href="index.html" aria-label="${escapeHtml(brand.name)} home">${escapeHtml(brand.name)}</a></h1>`)
    .replace(/<p>how things are seen<\/p>/, `<p>${escapeHtml(brand.concepts.image)}</p>`)
    .replace(/<p>what is not seen<\/p>/, `<p>${escapeHtml(brand.concepts.sound)}</p>`)
    .replace(/<p>structure<\/p>/, `<p>${escapeHtml(brand.concepts.design)}</p>`)
    .replace(
      /<section class="seo-summary" aria-label="Studio services summary">[\s\S]*?<\/section>/,
      `<section class="seo-summary" aria-label="Studio services summary">\n        <div class="wrap">\n          <p lang="zh-Hant">\n            ${escapeHtml(brand.description)}\n          </p>\n        </div>\n      </section>`,
    )
    .replace(/<img class="footer-logo" src="su-logo\.png" alt="[^"]*" \/>/, `<img class="footer-logo" src="su-logo.png" alt="${escapeHtml(brand.name)}" />`)
    .replace(/<span>Image \/ Sound \/ Design<\/span>/, `<span>${escapeHtml(brand.identity.at(-1))}</span>`);
  return html;
});

writeHtml("about.html", (html) => {
  html = replaceMeta(html, `ABOUT｜${brand.fullName}`, brand.shortDescription);
  html = html
    .replace(/<img class="studio-logo" src="su-logo\.png" alt="[^"]*" \/>/, `<img class="studio-logo" src="su-logo.png" alt="${escapeHtml(brand.name)}" />`)
    .replace(/<span>SU STUDIO<\/span>/, `<span>${escapeHtml(brand.name)}</span>`)
    .replace(/<span>Based in [^<]*<\/span>/, `<span>Based in ${escapeHtml(brand.location)}</span>`)
    .replace(
      /<p class="brand-description" lang="zh-Hant">[\s\S]*?<\/p>/,
      `<p class="brand-description" lang="zh-Hant">\n          ${escapeHtml(brand.description)}\n        </p>`,
    )
    .replace(/<a href="mailto:[^"]*">[^<]*<\/a>/, `<a href="mailto:${escapeHtml(brand.contact.email)}">${escapeHtml(brand.contact.email)}</a>`);
  return html;
});

writeHtml("contact.html", (html) => {
  const contactDescription = `聯繫${brand.chineseName}，洽詢${brand.expertise.join("、")}等合作。`;
  html = replaceMeta(html, `CONTACT｜${brand.fullName}`, contactDescription);
  html = html
    .replace(/<p class="contact-brand" lang="zh-Hant">[\s\S]*?<\/p>/, `<p class="contact-brand" lang="zh-Hant">${escapeHtml(brand.chineseName)}</p>`)
    .replace(/<span lang="en">[\s\S]*?<\/span>/, `<span lang="en">${escapeHtml(brand.tagline)}</span>`)
    .replace(/<a href="mailto:[^"]*">[^<]*<\/a>/g, `<a href="mailto:${escapeHtml(brand.contact.email)}">${escapeHtml(brand.contact.email)}</a>`)
    .replace(/formData\.append\("_subject", "[^"]*"\);/, `formData.append("_subject", "專案詢問 - ${escapeHtml(brand.name)}");`);
  return html;
});

console.log("Synced brand content.");
