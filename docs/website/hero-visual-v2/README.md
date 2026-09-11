# Hero visual v2 — Founder visual review

Status: implementation-owner checks passed; Founder inspection required before independent QA. This is not an independent-QA approval or production authorization.

Branch: `hero-visual-v2`. Baseline: `2c3f238b9e6e0c991655d5eb93f99bd6c8fb815e`, the deployed homepage refresh. No production merge, deployment command, Cloudflare configuration change, or DNS change is part of this work.

## Visual evidence

| View | Before | Candidate |
| --- | --- | --- |
| Desktop 1440 × 900 | [Production](evidence/production-desktop-1440.png) | [Hero v2](evidence/v2-chromium-1440x900.png) |
| Mobile 390 × 844 | [Production, WebKit](evidence/production-mobile-390.png) | [Hero v2, WebKit](evidence/v2-webkit-390x844.png) |
| 430-class iPhone | [Production, 430 × 844](evidence/production-mobile-430.png) | [Hero v2, 430 × 932](evidence/v2-webkit-430x932.png) |
| Desktop pointer | [Before movement](evidence/cursor-before.png) | [After movement](evidence/cursor-after.png) |

The 390 comparison uses identical viewport dimensions. The 430 evidence has different viewport heights, explicitly identified above. Browser screenshots emulate mobile devices; they are not captures from a physical iPhone.

The full seven-size matrix is in [evidence](evidence). Narrative snapshots at [3 seconds](evidence/story-03-seconds.png), [12 seconds](evidence/story-12-seconds.png), and [30 seconds](evidence/story-30-seconds.png) show connections accumulating without a reset loop.

## Confirmed production cursor root cause

`HeroSection` passed `compact` to `VisualField`. Its interactivity condition explicitly required `!compact`. The scatter phase itself supported interaction, but the compact flag prevented it from running, regardless of desktop mouse capability.

On both production and the identical local baseline build, the hero received 45 pointer events. Its bounds and event registration were valid, fine-pointer detection was true, and reduced motion was false. Nevertheless, the renderer stayed in `static` mode, never activated the pointer state, and produced an identical canvas before and after the sweep. The canvas SHA-256 was `e9c0e1b471eb830b7c9aa620d8d998ee8eaa1df8b7e1c11f8ea581ab8296a2cd` in both states. [Raw reproduction record](evidence/baseline-browser.json).

The lower opacity also made the original field quiet, but did not cause this complete absence of interaction. No evidence implicated blocked events, a z-index interception, or an incorrect bounding rectangle.

## Implementation

The hero now uses `HeroKnowledgeField`; the legacy `VisualField` is unchanged. Hero layout/density no longer determines interaction eligibility. A capable mouse or pen can interact with the field; touch alone does not simulate a cursor.

Founder-selected Nexus refinement: the unchanged official nested-C asset is now the stable center of a bidirectional signal field. Amber evidence streams converge into the core from the left; challenged alternatives can fade; supported relationships persist; and the retained side resolves into more coherent pink-to-purple structure that future work extends from. Fine vertical filaments, sparse evidence clusters, moving packets, and restrained core rings add depth without turning the hero into telemetry or stock neural-network art. This is deterministic conceptual storytelling, not a display of research measurements or operational activity.

The visual remains deliberately bounded: deterministic stream families, sparse evidence clusters, and a fixed number of particles/filaments; no all-pairs network, WebGL, video, new runtime image assets, visualization package, or dependency addition. Thin disciplined strokes and restrained additive highlights replace the previous wave system.

Desktop interaction uses a 155 CSS-pixel neighborhood, smooth falloff, and a maximum 21-pixel displacement parameter. Evidence yields more than the stable archive; the official mark does not move. Nearby links respond with their endpoints and a restrained brightness lift. Browser instrumentation measured approximately 14.98–15.10 CSS pixels of evidence-node movement, not merely a changed DOM attribute. Scrolled coordinate error stayed below 0.05 CSS pixels in the six desktop cases.

Mobile uses a shallow, right-offset composition with a larger visible mark and evidence flowing across the lower field. The same copy and CTA geometry remain. At 390 × 844, WebKit hero height decreased from 780.69 to 739.88 pixels, a 40.81-pixel reduction. Ambient color is restrained behind the copy and CTA region; the more legible structure sits below the controls. At 320 pixels, the longer copy still requires scrolling to reach both actions; this is not hidden or clipped.

## Motion and rendering policy

The canvas maintains its own visible-time narrative. Retained relationships do not disappear in a repeating reset. Static modes show the accumulated composition immediately.

Fine-pointer interaction wakes the renderer immediately. Autonomous mobile rendering runs at lower cadence than desktop. Animation is canceled when offscreen or when the document is hidden; resumption does not advance the story through the hidden interval. Reduced motion, Save-Data, and a reported two-core-or-lower device use a static composition. Sustained expensive draws trigger an economy cadence. Device capability changes and reduced-motion changes are handled without remounting.

A dynamic reduced-motion transition issue found during Chromium testing was corrected by updating cached capability state in the media-query change handler. The final browser run verifies both entering and leaving reduced motion, no canvas changes while reduced motion is active, and no running hero CSS animations.

The scene is `aria-hidden`, has no focusable visual content, and does not intercept pointer events. The SVG fallback is prerendered, deterministic, and visible when JavaScript or Canvas is unavailable. Bounds are measured in CSS pixels and adjusted for offset, scroll, and scaling; backing-store pixel ratio is separately capped.

## Validation results

All requested commands returned exit code 0: `npm ci`, `npm run lint`, `npm run typecheck`, `npm test -- --run`, `npm run build`, `npm run validate:build`, and `git diff --check`. The unit suite contains 23 passing tests across five files, including nine new scene/interaction/fallback tests. [Command output](evidence/build-results.json).

The final browser matrix passed 22 cases with no failures: all seven viewports in both Chromium and WebKit, plus no-JavaScript, no-Canvas, Save-Data, and low-core cases in each engine. Viewports: 1440 × 900, 1280 × 800, 1024 × 768, 768 × 1024, 430 × 932, 390 × 844, and 320 × 568. [Detailed browser results](evidence/browser-results.json).

Checks cover actual pointer displacement, stable core, scrolled coordinates, CTA hit testing, horizontal overflow, anchors, mobile menu opening, Escape, focus restoration, navigation closing, reduced motion, offscreen pause, visibility-handler pause/resume, and console/page errors. No console or hydration errors were recorded. The visibility-handler test dispatches a synthetic hidden-document transition; it is not a physical device suspend test.

Additional checks exercise viewport resizing and a synthetic expensive-draw condition. [Supplemental results](evidence/supplemental-browser.json).

## Performance evidence and limits

Baseline JavaScript was 223.33 kB / 70.35 kB gzip; v2 is 221.69 kB / 69.79 kB gzip. CSS changed from 63.51 kB / 13.41 kB gzip to 65.41 kB / 13.81 kB gzip. Combined compressed JavaScript and CSS are slightly smaller. No dependency, official brand asset, or runtime media file changed.

A three-trial alternating local comparison used fresh Chromium contexts at 1440 and 390 pixels. All samples recorded zero CLS. Median LCP was 180 → 72 ms on desktop and 56 → 44 ms on mobile. These short local samples show no observed loading regression; they do not establish a field speed improvement. [All samples and method](evidence/performance-results.json).

The old compact canvas was static. The new autonomous scene has a real idle rendering cost: median measured script time was approximately 7.19 ms per wall-clock second on desktop and 3.00 ms per second on the mobile-emulated viewport. Observed idle cadence was about 30 and 13.5 draws per second respectively on this machine. These are observed schedules, not guaranteed device frame rates. Instrumented p95 draw times in the main browser matrix were at most 2 ms; the renderer switches to its economy cadence when sustained cost is higher.

These measurements are from a Mac running headless desktop browser engines. There is no physical-iPhone battery test, field Core Web Vitals dataset, cellular-network assessment, Firefox run, or real-device thermal certification. Founder review on an actual iPhone and desktop remains required.

`npm ci` reported two existing dependency advisories: one high severity in Vite and one low severity in esbuild. Package manifests and the lockfile are unchanged from the baseline. This visual branch does not remediate those tooling advisories and must not be described as a clean dependency-security audit. Local preview servers were bound to loopback only.

## Public claims and privacy

The complete main-content text is identical between the baseline and v2 in the comparison harness. The approved content source, metadata, navigation, footer, official logo files, dependency files, and Cloudflare/DNS configuration are unchanged. No public claims, invented research metrics, new analytics, personal information, credentials, private repository references, or internal research material were added. The scene has no network data source; local pointer positions are used only to render the visual and are not transmitted or persisted.

## Reproduction

Run the normal npm checks from the repository root. Build the baseline separately and serve it on loopback port 4180; serve the candidate production build on loopback port 4179. The browser tools are external audit tooling, not application dependencies.

`PLAYWRIGHT_MODULE` can point to an externally installed Playwright ES module. `CHROMIUM_EXECUTABLE` and `WEBKIT_EXECUTABLE` can select installed compatible browser binaries. Set `HERO_URL` and `BASELINE_URL` to override the default local URLs. Run `node scripts/hero-v2-browser.mjs` for the matrix and `node scripts/hero-v2-performance.mjs` for the local comparison. These scripts overwrite the corresponding evidence outputs.

## Review gate

Open the branch preview on an iPhone and desktop. Move the cursor deliberately through the small evidence nodes and the surrounding archive, then let the scene run for about 30 seconds. Confirm that the composition feels more intentional, that the interaction is perceptible but calm, and that the mobile lower area earns its space. Visual preference is not certified by these automated checks.

Founder review: **REQUIRED**. Independent QA: **NOT STARTED**. Merge: **NOT MERGED**. Production deployment: **NOT DEPLOYED**. The exact pushed commit, tree, hosted preview verification, and review link are recorded in the pull-request handoff.
