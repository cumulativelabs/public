# Cumulative Labs Public Website

This repository contains the public website for Cumulative Labs. It is a static Vite, React, and TypeScript project with handcrafted CSS and lightweight SVG/CSS motion.

## Local development

Use Node.js 20.19 or newer.

```bash
npm ci
npm run dev
```

Available checks:

```bash
npm run lint
npm run typecheck
npm test -- --run
npm run build
npm run validate:build
npm run preview
```

## Public content and design

- Editable homepage content and metadata: `src/content/site.ts`
- Public-copy record: `docs/website/PUBLIC_COPY.md`
- Visual direction: `docs/website/VISUAL_DIRECTION.md`
- Public-safety rules: `docs/website/PUBLIC_SAFETY.md`
- Production web assets: `public/brand/`
- Favicon assets: `public/favicons/`
- Social-preview image: `public/og/`

## Updating public information

Change the public contact address only in `src/content/site.ts`. Header, closing, and footer contact links all derive from that configuration.

System status labels are also defined in `src/content/site.ts`. Keep status language factual, restrained, and consistent with the actual public state of the work.

## Review and deployment

Do not implement features directly on `main`. All changes require pull-request review before merge. Production deployment and custom-domain activation require explicit Founder approval.
