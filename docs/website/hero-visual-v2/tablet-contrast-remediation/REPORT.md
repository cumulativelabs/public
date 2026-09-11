# Hero v2 — tablet seam and contrast remediation

Implementation owner handoff — **independent retest required; prior independent FAIL is preserved.** No acceptance, merge, or production release is claimed.

- Task: `CL-HERO-TABLET-CONTRAST-REMEDIATION-20260911-001`.
- Branch: `hero-visual-v2`; draft PR [#3](https://github.com/cumulativelabs/public/pull/3).
- Substantive commit: `25e508b8301ecdc474821cc805095b68409819f4`; tree `f6ae72efc1de33370eabe7f100a45da8a2c78a3a`; parent/starting commit `2a6905b6656052fe4cbadf64fc2e1d6ef223f771` (starting tree `b92a8feac29e14656e15048461a32449a16f2212`).
- Main remained `2c3f238b9e6e0c991655d5eb93f99bd6c8fb815e` at startup and source push.
- Source commit/tree/parent were directly read back through the remote Git API after a fast-forward push. The report is a subsequent evidence-only commit. Its exact containing commit/tree and full report-byte readback are recorded in the [final-head receipt](https://github.com/cumulativelabs/public/pull/3#issuecomment-5634224458), avoiding a self-referential commit hash inside these files. Controller registration/reconciliation remains **PENDING**.
- Immutable source preview: <https://9a5c0834.cumulative-labs.pages.dev/>. CI and branch-preview checks succeeded. Browser fetch returned HTML and all eight checked image/JS/CSS assets byte-identical to the local production build, HTTP 200 with noindex headers. Plain Python HTTP retrieval initially returned 403; browser transport succeeded. See [preview bytes](evidence/preview-readback.json).

## Reproduction and smallest correction

Before editing, a fresh locked-dependency production build reproduced QA-VIS-001 in Chromium and WebKit at 768×1024: plate x=260.107 / 259.789, width=504.531 CSS px. The bright intake was cut along a vertical internal edge under the CTA. [Bounds](evidence/before.json), [Chromium before](evidence/before-chromium-768.png), [WebKit before](evidence/before-webkit-768.png). Prior independent report/handoff and supplemental/cursor evidence were read without modification; [source hashes](evidence/prior-qa-identity.json) preserve their identity without publishing private/local source metadata.

The capped phone plate, right-aligned mark, and shared container clipping explain those pixels. A 431–780px horizontal mask now fades the **entire existing coordinate plane**, reaching full opacity at 18% and fading only its final 4% at the right. Neither geometry nor SVGs moved. The C, six permanent rings, intake hotspot and condensed purple output retain their shared center/axis. No new ring system, image positioning, panel, asset or renderer was introduced. [Hosted after](evidence/preview-webkit-768.png).

Contrast work established a separate real defect: before the copy scrim, solid glyph samples at 1024px reached 1.221:1 for the gradient headline, 1.976:1 for body, and 3.869:1 for support. See [diagnostic raw measurements](evidence/contrast-diagnostic/contrast-results.json) and [frozen actual render](evidence/contrast-diagnostic/webkit-1024-t8.png). A desktop-only (`min-width:781px`) dark scrim behind copy now softens the crossing light without covering the C/core/output. Its feathered edges extend beyond the copy bounds. Text colors and wording are unchanged. [Desktop after](evidence/preview-chromium-1024.png).

Focused hero actions and the skip link also receive a dark backing around the pink outline, preventing bright underlying artwork/header content from eroding its contrast. This affects keyboard focus only. At 430px and below the unfocused approved phone artwork, layout, colors, dense amber input and powerful purple output are unchanged. [Phone after](evidence/preview-webkit-390.png).

## Quantitative contrast

[W3C SC 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) requires 4.5:1 for ordinary text and 3:1 for large text (24 CSS px, or approximately 18.67px bold). Ratios are compared without rounding. Authored colors, rather than antialiased edge colors, determine foreground contrast. [W3C SC 1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html) sets 3:1 for necessary control/state graphics against adjacent colors; identifying text can make a separate decorative button boundary unnecessary.

The external-browser harness bundles **the live** `drawKnowledgeScene` and `createKnowledgeScene`, pauses autonomous scheduling, and redraws into the existing Canvas using its existing pixel transform and DOM-derived shared layout. It freezes t=0, 3, 8, 14, 28 and 56 seconds, t=8 with full pointer strength near the intake, and t=28 static mode. Both engines cover all seven requested viewports: **112 state/viewport/engine combinations**. These are reproducible renderer states, not claimed to be exhaustive maxima over all time or pointer positions.

For each state, paired full-page screenshots retain actual backgrounds, SVGs, canvas compositing, scrim, CTA fills and CSS opacity while hiding text. Solid foreground comes from computed CSS. Gradient foreground comes from the browser-painted gradient expanded out of text clipping. Contrast uses sRGB linearization and `(Llighter+.05)/(Ldarker+.05)`. Ordinary text samples every pixel in its text-node line rectangles, a conservative bound that includes whitespace. For the gradient, only solid glyph interiors are assessed: paired actual-text pixels identify at least 95% coverage, but foreground remains the full gradient color, not the antialiased screenshot color. The raw rectangular gradient-panel edges include unpainted pixels and are explicitly excluded from the assessment. [Derived assessment and exact worst RGB/coordinates](evidence/contrast-summary.json), [unaltered raw state records](evidence/contrast-final/contrast-results.json).

| Text | Font size / weight | Minimum assessed ratio | AA threshold |
| --- | --- | ---: | ---: |
| Eyebrow | 10.4–11.2px / 400 | 11.058 | 4.5 |
| White headline, first line | 36.8–74.88px / 450 | 17.023 | 3 |
| White headline, second line | 36.8–74.88px / 450 | 18.891 | 3 |
| Gradient headline | 36.8–74.88px / 450 | 3.232 | 3 |
| Body | 16–17.6px / 400 | 11.492 | 4.5 |
| Support | 14.4–14.88px / 400 | 7.936 | 4.5 |
| Primary CTA label | 11.52px / 700 | 17.294 | 4.5 |
| Secondary CTA label | 11.52px / 700 | 9.479 | 4.5 |
| Desktop navigation | 11.68px / 700 | 15.601 | 4.5 |

All assessed samples meet their threshold. **This is measured coverage, not an all-state guarantee or independent accessibility acceptance.** The gradient retains modest headroom; independent QA should challenge it with additional pointer/time locations. The final focus-only CSS does not affect the unfocused contrast run. No full-page zoom, screen-reader, physical-device or color-profile certification is claimed. Axe incomplete results were not converted into a pass.

Keyboard focus measurements at 1440, 1024, 768 and 390px use computed foreground against outline/text/icon-hidden composited screenshots, with transitions frozen. Minimum outline ratio: **6.603:1**; focused navigation/control text including mobile ordinals: **7.542:1**; menu icons: **18.176:1**. The dark focused-only backing is included in the adjacent background measurement. [Raw records](evidence/focus-verified/focus-results.json), [phone focused CTA](evidence/focus-verified/webkit-390-CTA-secondary.png), [focused menu close](evidence/focus-verified/webkit-768-menu-close.png). Normal decorative button border contrast is not asserted to meet 3:1; high-contrast labels identify the actions.

## Browser regression and preserved limitations

The compiled site ran in Chromium 151.0.7922.34 and WebKit 26.6 at 1440×900, 1280×800, 1024×768, 768×1024, 430×932, 390×844 and 320×568, plus no-JS/no-Canvas cases: [18-case matrix](evidence/matrix-final/browser-results.json), no assertion failures or console/page/hydration errors. Final focus-only styling was checked separately after that normal-composition matrix. The immutable preview was freshly inspected in both engines at 768, 1024 and 390px after byte verification.

The resize sequence 767→779→780→781→820→780→430 was checked in both engines. [Results](evidence/tablet-final/tablet-results.json) and corresponding screenshots show the intentional stacked-to-desktop transition without an internal plate boundary. Images were visually reviewed alongside before/after tablet, desktop and phone renders. No horizontal overflow, CTA hit obstruction, detached hotspot, second output, duplicate permanent rings or logo shift was observed. At 320px the actions/core require scrolling, as before.

Focused cursor instrumentation before the contrast-only additions found mapping errors below 0.045px per axis after scroll and resize, six settled permanent gradient rings, unchanged logo bounds, and approximately 6.9–8.7px curve-control response. Final matrix pointer checks also passed. [Cursor records](evidence/cursor/cursor-followup.json). The original radius-only false failures remain in prior QA; the repaired assertion requires the permanent source-over gradient style as well as the unchanged radius tolerance. It does not count the transient pink propagation pulse as a seventh permanent ring.

Reduced-motion, synthetic hidden-document/offscreen pauses, Save-Data and two-core gates, and no-JS/no-Canvas visual composition were checked. Static capability tests produced no additional draws and stable canvas bytes. Native background suspension, prolonged economy adaptation and no-JS menu operation are not certified. Fallback uses the existing six SVG rings and remains visible/aligned.

Mobile Escape/focus return passed. Chromium Tab and macOS WebKit **Option-Tab** traverse the menu and wrap after explicit close-button focus. Two initial focus-measurement runs lost the WebKit target with plain Tab; raw failures remain separately classified in [evidence stages](evidence/evidence-stages.json). The harness now rejects BODY targets and freezes transitions instead of producing misleading ratios. This is the bounded guardrail for those two operational failures, pending independent reuse verification.

A separate [starting/candidate comparison](evidence/menu-focus-comparison.json) found automatic close-button focus in normal motion in both engines, but WebKit with reduced motion left focus on BODY in **both** the unchanged starting build and candidate. Escape still returned focus. This inherited navigation limitation was not silently fixed or waived; it needs separate independent adjudication. Focus contrast measurements explicitly focused the close control before traversal and do not prove automatic entry focus in that case.

## Commands and bounded cost

`npm ci` succeeded with the unchanged lockfile and a temporary cache. `npm run lint`, `npm run typecheck`, `npm test -- --run` (29 tests / 6 files), `npm run build`, `npm run validate:build` and `git diff --check` all exited 0. [Install/first commands](evidence/commands/results.json), [final commands](evidence/commands-final/results.json). No dependencies changed; inherited Vite/esbuild advisories remain outside this task.

[Asset bytes/hashes](evidence/asset-weights.json): JS remains 229,084 bytes; CSS rises from 66,474 to 67,228 bytes (+754). Both SVG artwork assets are byte-unchanged. [Performance comparison](evidence/performance-results.json) used three alternating fresh contexts per viewport, two-second windows, same local machine, no CPU/network throttling. Median starting→candidate script ms/sec: 1440px 15.314→15.050; 768px 17.054→17.065; 390px 14.806→15.390. Median LCP: 100→104ms, 60→60ms, 52→52ms respectively. Every CLS sample was zero; rendered main-content text matched. Cadence remained approximately 31.3, 29.9 and 13.4 draws/sec. No material regression is established by these short noisy samples; raster/GPU/compositor cost, battery and physical low-end-device behavior remain unmeasured.

## Scope, persistence and next action

Application changes are 23 lines of hero CSS. Copy, structure, controls, renderer logic, brand/art assets, dependencies, authentication, hosting and DNS configuration are unchanged. Browser harnesses and this public-safe evidence are task-specific. No claims, metrics, data feed, analytics or external runtime requests were added. Public-source review excludes private governance text, local paths and local machine identifiers. Git author metadata uses the authenticated public noreply identity. Historical owner and independent QA evidence was not overwritten.

**QA_STATE:** independent retest required on `25e508b8301ecdc474821cc805095b68409819f4` / `f6ae72efc1de33370eabe7f100a45da8a2c78a3a`; no self-approval. **CONTROLLER_REGISTRATION:** PENDING. **MERGE_STATE:** NOT MERGED. **DEPLOYMENT_STATE:** NOT DEPLOYED (production). **PUBLICATION_STATE:** no production publication; only authorized branch-preview/source persistence. Report/readback completion is distinct from QA and release.

Exact-state independent QA assignment (controller dispatch only): retrieve this report and the final-head receipt; verify `25e508b8301ecdc474821cc805095b68409819f4` / `f6ae72efc1de33370eabe7f100a45da8a2c78a3a` and its parent, or the evidence-only descendant with an identical application subtree. Reproduce the prior tablet failure against the retained before evidence; test the new 768px mask and 767/779/780/781/820 transition in both engines, all seven viewport sizes, actual C/ring/port alignment, phone preservation, cursor after scroll/resize, static/fallback modes and controls. Independently challenge the composited contrast methodology and gradient’s 3.232 minimum, focused indicators, and the inherited reduced-motion WebKit entry-focus limitation. Preserve new raw failures, bind a separate PASS/FAIL/BLOCKED verdict to the exact candidate, and do not modify it during QA. Founder release decision waits for that result. No agent was dispatched by this worker.
