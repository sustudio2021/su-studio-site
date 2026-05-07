# SU STUDIO Site

Minimal static website for SU STUDIO.

## Structure

- `index.html` - Homepage
- `work.html` - Work archive index
- `archive-*.html` - Client archive pages
- `about.html` - About page
- `contact.html` - Contact page
- `archive-style.css` - Shared archive page styles
- `su-logo.png` - Studio logo asset

## Local Check

```bash
npm run check
```

This verifies that local page links and asset references resolve before deployment.

## Vercel

This is a static site. In Vercel:

- Framework Preset: `Other`
- Build Command: `npm run build`
- Output Directory: leave empty
- Install Command: leave default or empty

Push this folder to:

```text
https://github.com/sustudio2021/su-studio-site
```

Then import the repository in Vercel.
