# Cumulative Labs website refresh — implementation handoff

Date: September 9, 2026. Recommendation: **Ready for independent QA**.

This is an implementation-agent report, not independent QA or approval to release. No deployment, merge, custom-domain activation, or domain configuration change was performed.

## 1. Live site status

Tested with real Chrome navigation and separate curl requests. HTTP measurements are in [http-audit.json](evidence/refresh-2026-09-09/http-audit.json).

| Exact URL | Observed result |
| --- | --- |
| `https://cumulativelabs.com/` | Resolves; valid TLS; HTTP 200; homepage renders. |
| `http://cumulativelabs.com/` | One HTTP redirect to the HTTPS non-www homepage; final 200. |
| `https://www.cumulativelabs.com/` | Resolves and negotiates TLS, but returns Cloudflare 522. Browser screenshot captured. |
| `http://www.cumulativelabs.com/` | curl receives 522 without redirect; Chrome upgrades to HTTPS and also displays 522. Browser upgrade is not evidence of a server redirect. |
| `https://cumulativelabs.com/robots.txt` | 200; allows ordinary search crawling, with additional Cloudflare-managed directives and bot exclusions. |
| `https://cumulativelabs.com/sitemap.xml` | 200; contains the canonical homepage. |
| `https://cumulativelabs.com/site.webmanifest` | 200; valid manifest response. |
| `https://cumulativelabs.com/favicons/favicon.svg` | 200; official symbol. |
| `https://cumulativelabs.com/favicons/apple-touch-icon.png` | 200; 180 × 180; visually checked. |
| `https://cumulativelabs.com/og/cumulative-labs-og.jpg` | 200; 1200 × 630; existing artwork is visibly pixelated and cropped. |

Canonical metadata remains `https://cumulativelabs.com`. The contact domain is an email destination, not an additional website host established by this repository.

The sampled live HTML, JavaScript, CSS, both brand SVGs, and sitemap are byte-identical to the build from draft base `4e514b8ee0fb4349a89efcddcfe10adbb225a124`. See [hash comparison](evidence/refresh-2026-09-09/baseline-source-comparison.json). Live robots differs through Cloudflare-managed additions. Lighthouse also observed a Cloudflare analytics script not present in the repository build. This comparison identifies sampled application bytes, not an independently verified deployment commit.

## 2. Top findings, ordered by impact

1. **The www host fails.** Existing visitors using that hostname receive 522. Remediation needs a separately approved production configuration action.
2. **The first screen is abstract.** Live supporting copy does not identify AI research or League Vector. Product explanation follows two philosophical sections. Some wording implies recurring improvement without demonstrated public evidence.
3. **Body text and hierarchy are too compressed.** Live desktop work and contrast text becomes very small; the Principles H2 is hidden. On mobile, substantial empty hero space separates explanation from actions. Static cards add twelve unnecessary keyboard stops.
4. **The social preview is damaged.** The correctly sized JPEG still contains pixelated, truncated artwork. HTTP success and dimensions alone did not establish asset quality.
5. **Initial content depends on JavaScript.** The baseline HTML contains an empty root. It is crawlable for rendering search engines, but the document alone does not contain the homepage text.
6. **Live mobile lab performance warrants improvement.** Lighthouse measured 59 performance, 1,390 ms blocking time, and 3.1 s LCP. No layout shift or console errors were measured. This is a lab observation, not field Core Web Vitals.

## 3. What changed

- `src/content/site.ts`, `src/App.tsx`, and section components: implemented Hero → Work → Why Cumulative → Approach → Example → Principles → Contact. Copy states development status and distinguishes the company, underlying research, and applied product.
- `src/sections/ExampleSection.tsx`: static, ordered hypothetical route-review example, labeled before the scenario and again in its caption. No simulated activity or invented product output.
- `src/styles/homepage-refresh.css`: content-sized sections, readable body sizes, restrained borders, responsive cards, and actions adjacent to mobile hero copy. Existing foundations remain; the scoped refresh stylesheet owns the draft adjustments.
- `HeroSection.tsx`, `MissionSection.tsx`, `WorkSection.tsx`, `ClosingManifesto.tsx`: retained the official hero symbol and brand gradient; reduced three atmospheric fields to one compact, non-pointer-interactive hero field; removed decorative product charts and repeated closing effects.
- `SiteHeader.tsx`: background and closed-menu inert handling, focus entry after the menu transition, and existing Escape/focus-wrap behavior preserved. Static cards removed from the tab sequence; skip link targets a focusable main; closing now uses a footer landmark; Principles H2 is visible.
- `scripts/prerender.mjs`, `src/main.tsx`, `package.json`: build-time HTML rendering with client hydration. Uses existing Vite/React dependencies; opens no server and adds no runtime service. Metadata descriptions now use measured development language.
- `assets/raster/cumulative-labs-og.*`: replaced the damaged social JPEG with a sharp, approved-color composition using the unchanged official SVG geometry. Kept editable SVG and existing base64 delivery convention; no font files or new project dependencies. [Asset provenance](../../assets/raster/README.md).
- `App.test.tsx`, `validate-build.mjs`: check section ordering, concept disclaimer, static HTML content, landmarks, and closed navigation state. `lint.mjs` now applies contact-address uniqueness to application source, while retaining other scans over documentation and assets; the saved draft already quoted the address, which made the former cross-document count fail.
- `PUBLIC_COPY.md` and README: current draft copy and build behavior recorded. Original proposal and all safety/release rules retained.

## 4. Before / after evidence

All screenshots show real website rendering. Desktop is 1440 × 900; primary mobile is 390 × 844, an iPhone-sized Chrome viewport, not physical Safari hardware. Additional draft views cover 320, 768, and 1024 px widths.

| View | Live before | Local draft after |
| --- | --- | --- |
| Desktop hero | [Before](evidence/refresh-2026-09-09/before-desktop.png) | [After](evidence/refresh-2026-09-09/after-desktop.png) |
| Mobile hero | [Before](evidence/refresh-2026-09-09/before-mobile.png) | [After](evidence/refresh-2026-09-09/after-mobile.png) |
| Mobile work | [Before](evidence/refresh-2026-09-09/before-mobile-work.png) | [After](evidence/refresh-2026-09-09/after-mobile-work.png) |
| Social preview | [Before](evidence/refresh-2026-09-09/before-og.jpg) | [After](evidence/refresh-2026-09-09/after-og.jpg) |

[Desktop work](evidence/refresh-2026-09-09/after-desktop-work.png), [baseline narrative](evidence/refresh-2026-09-09/before-desktop-narrative.png), [Desktop example](evidence/refresh-2026-09-09/after-desktop-example.png), [mobile example](evidence/refresh-2026-09-09/after-mobile-example.png), [mobile footer](evidence/refresh-2026-09-09/after-mobile-footer.png), [desktop full page](evidence/refresh-2026-09-09/after-desktop-full.png), [mobile full page](evidence/refresh-2026-09-09/after-mobile-full.png), and [www failure](evidence/refresh-2026-09-09/www-522.png) are retained beside the reports.

The draft makes the company and product relationship explicit, replaces repeated abstract copy with a readable example, and removes the mobile gap before actions. Comprehension improvement is an implementation assessment; no user study was performed.

## 5. Public claim review

| Material | Decision and basis |
| --- | --- |
| “Improves every future cycle” in hero/metadata | Replaced with “developing” and “designed to”; intended knowledge reuse is not represented as proven improvement. |
| Draft rankings/player-analysis statement | Softened to an in-development dynasty fantasy football product focused on evidence, uncertainty, and changing player value. No available ranking feed or product access is promised. |
| Real League Vector preview | Not used. The public README describes an analyzer, but the reviewed material did not establish an approved, demonstrated cumulative-learning example or rights-cleared player preview suitable for this homepage. No underlying proprietary material was transferred. |
| Concrete illustration | Hypothetical route-review story with conditional language and date limits. It demonstrates an idea, not an operational system. |
| Private research-system detail | Kept to the approved high-level purpose. Removed the draft's unnecessary public discussion of withholding implementation details. |
| Closing prediction and “Cycle complete” footer | Recast as a research direction and “Research in progress. Built for the long term.” No completed operation is implied. |
| Contact address | Existing centralized destination retained. No new mailbox, test email, or delivery claim. |
| Logo/social assets | Existing official symbol reused without geometry changes. New composition needs independent visual review like all other draft assets. |

Source authority is the six required governance/draft documents at the verified starting branch. The implementation and generated output were manually reviewed against PUBLIC_SAFETY.md and scanned for common secret patterns and prohibited private identifiers; no findings in authored application source/output. Automated scans are supplementary, not declassification authority. Independent copy/privacy review and Founder release approval remain mandatory.

## 6. Technical QA

[Exact command transcript](evidence/refresh-2026-09-09/verification.txt): lint, typecheck, 14 tests in 4 files, build, and production validation all passed. Baseline tests were 13/13. Final build uses the unchanged dependency lockfile. Asset generation recreates both raster files; the replacement OG is 1200 × 630, 40,305 bytes. The Apple touch icon remains 180 × 180. No external font requests or new media dependencies.

| Mobile Lighthouse 12.8.2 | Live before | Local draft after |
| --- | --- | --- |
| Performance | 59 | 100 |
| Accessibility | 100 | 100 |
| Best practices | 96 | 100 |
| SEO | 92 | 100 |
| First contentful paint | 2.1 s | 1.3 s |
| Largest contentful paint | 3.1 s | 1.6 s |
| Total blocking time | 1,390 ms | 0 ms |
| Cumulative layout shift | 0 | 0 |

[Before measurement](evidence/refresh-2026-09-09/lighthouse-before.json) and [final application measurement](evidence/refresh-2026-09-09/lighthouse-after.json) include timestamps, configuration, audits, and network entries. Production and localhost have different network/edge conditions; these numbers do not establish a production uplift or field CWV pass. The social-image replacement followed the final Lighthouse run and does not change the application HTML/JS/CSS hashes or page-load resources.

The live SEO deduction was the scanner's unrecognized Cloudflare `Content-Signal` directive; this is not evidence that ordinary search indexing is prohibited. No robots, canonical, sitemap, or edge settings were changed. Actual search-index inclusion, Search Console state, and field INP/CWV were not measured.

[Build manifest](evidence/refresh-2026-09-09/build-manifest.json) records exact hashes and weights. JavaScript remains approximately 223.5 kB raw / 70.2 kB gzip. CSS grows from 51.8 to 63.5 kB raw (about +2.0 kB gzip); HTML grows from 2.2 to 40.3 kB raw (about +8.4 kB gzip) to include complete content. These are intentional payload costs, not a claim that every asset got smaller.

Browser checks:

- No horizontal document overflow at measured 320, 390, 1024, and 1440 px; tablet composition also inspected at 768 px. Work, example, and footer were inspected on desktop/mobile.
- All rendered hash destinations resolve to actual elements. Work navigation moves to the intended section. Mobile navigation opens, confines Tab/Shift+Tab, closes via Escape, restores its trigger, and closes when following Work. Skip link has a visible 2 px outline and moves focus to main.
- One H1; visible H2 section hierarchy; footer landmark; decorative logo/fields hidden from assistive technology. Contact links retain the same mailto destination; no email was sent and mailbox delivery was not tested.
- Primary actions are about 50–52 px high, menu controls 48 px, and header/footer actions at least 44 px. Body text is 16 px on mobile; supporting text 14.4 px. Main secondary-text palette measures at least 9.48:1 against midnight. Large gradient text's purple endpoint is about 3.15:1 against midnight; gradient/ambient contrast still merits visual QA. Automated Lighthouse accessibility has no failing audits; it is not a complete accessibility certification.
- No console errors or failed application requests were observed on the non-www live page or draft. The live host variant failure is recorded separately. No hydration errors appeared in the production preview.
- Reduced-motion CSS is present in the delivered stylesheet and the component responds to the media query; tests verify the fallback. Actual OS reduced-motion emulation and physical iPhone/Safari testing were not completed. Independent QA must exercise these, including opening navigation with reduced motion enabled. Do not describe those unperformed checks as passes.
- `npm audit` reports existing development-tool advisories: one high-severity Vite entry and one low-severity esbuild entry. Dependencies were not upgraded in this scoped website change. These are not findings of a deployed static-site exploit; track tooling maintenance separately.

Reproduce using Node 20.19+ and the lockfile: `npm ci`, `npm run lint`, `npm run typecheck`, `npm test -- --run`, `npm run build`, `npm run validate:build`, then `npm run preview`. Lighthouse command: `npx lighthouse@12.8.2 URL --chrome-flags='--headless' --only-categories=performance,accessibility,best-practices,seo --output=json`.

## 7. Remaining blockers

No blocker to independent review. Production release remains gated on independent implementation/copy/privacy/asset QA and explicit Founder approval. The www 522 issue is a separate production configuration blocker for that hostname, requiring approved remediation and re-test. Neither mailbox changes nor a real product preview are prerequisites for this draft.

## 8. Recommendation and independent QA assignment

**Ready for independent QA.** Review the exact implementation commit below without treating this report as an independent verdict. QA must separately record:

1. Substantive implementation quality: hierarchy, responsiveness, keyboard behavior, motion, HTML rendering/hydration, and social asset quality.
2. Handoff reliability: retrieve the branch, compare the build hashes, reproduce commands, and check evidence labels and limitations.
3. Support for public claims: trace copy to approved public documents; reject any implied proven improvement or available ranking capability.
4. State/provenance: distinguish live baseline, local draft, implementation commit, and evidence commit; no deployment is implied.
5. Concept-versus-operation: the hypothetical example must remain unmistakably illustrative in every layout and in HTML/social metadata.
6. Public safety: inspect the complete diff and generated output for private information, unapproved names, credentials, or assets without appropriate rights.

Include physical Safari/iPhone, reduced-motion interaction, and independent review of the final asset before recommending release. QA does not grant deployment authority.

## 9. Durable state

- Repository: `cumulativelabs/public`.
- Existing branch: `website-refresh-draft-2026-09-09`.
- Starting draft SHA: `4e514b8ee0fb4349a89efcddcfe10adbb225a124` (clean checkout).
- Main observed for review base: `993734d9712bc17eb65b338b3bab3ef9631af55f`.
- Implementation commit: `f74db63931452a845f2c9799d8774b0034ba6ad4`.
- This handoff and evidence are stored in a subsequent documentation commit on the same retained branch. The PR head identifies that commit. No production workflow or domain file changed.
