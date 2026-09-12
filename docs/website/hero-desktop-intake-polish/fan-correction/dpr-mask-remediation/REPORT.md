# Retina mask correction — implementation evidence

**Implementation checks passed locally; independent acceptance and remote preview verification are pending. Release remains held.**

Substantive commit `b624a80334aa4cecb1030aaee8ba52fd5d533cf8`, tree `bb9a0d5f6ed9959494e501df3be7e6df2fcc6a7a`, parent/starting candidate `97ea04ee7c1e80e5a047c278807b593131dbabd3`. Only product change: eight added CSS lines in `src/styles/hero-visual-v2.css`. Evidence commit follows the substantive commit; its immutable identity is supplied in the remote readback handoff.

The PNG mask uses density-scaled bitmap dimensions, while `mask-size:auto` treated those pixels as CSS pixels. At DPR2 the observed 2393×1387 bitmap covered a 1595.0625×924.921875 CSS canvas incorrectly. Standard/WebKit `mask-size:100% 100%`, `mask-position:0 0`, `mask-origin:border-box`, and `mask-repeat:no-repeat` now map the entire bitmap onto that canvas. Relative sizing also follows CSS resize without depending on a particular device density. Rendering, brightness, opacity, 16-thread geometry, original fan, core/rings/output, copy, CTA behavior and policies are unchanged.

## Reproduction and native pixels

[Failed independent predecessor](https://github.com/cumulativelabs/public/blob/e083c1f5c9e1ec78a53c45448bce8baede1b4390/qa/pr4-release-97ea04e-20260911/REPORT.md) and [controller measurement qualification](https://github.com/cumulativelabs/public/blob/e083c1f5c9e1ec78a53c45448bce8baede1b4390/qa/pr4-release-97ea04e-20260911/CONTROLLER_READBACK.md) remain intact. Its preliminary eight-state sampler mixed CSS/device coordinates and is diagnostic only; its native confirmation independently supports FAIL. All four required predecessor files were read back byte-for-byte from that exact remote commit.

Fresh normal-motion, fonts-ready DPR2 captures reproduce failures in both Chromium and WebKit at 1440×900 pointer (120,711), center x150, and 1280×800 center x280. [Before measurements](before/results.json) and ordinary center/upper/lower PNGs retain displaced cutouts and lettering crossings.

[Corrected density measurements](after/results.json) cover 16 states across DPR 1, 1.25, 1.5, 2 and 3 in both engines, including the three required reproduction positions and Retina upper cursor. Every sampled corrected measurement passes its applicable threshold:

| Glyph category | Lowest sampled ratio | Required |
| --- | ---: | ---: |
| Body | 9.729:1 | 4.5:1 |
| Support | 7.260:1 | 4.5:1 |
| Large headline | 3.246:1 | 3:1 |

The [sampler](probes/contrast.mjs) freezes callbacks only after actual rendering settles, captures paired text-visible/text-hidden composited pixels, and obtains gradient foreground from the page's own exposed gradient. It derives separate x/y native ratios from PNG dimensions and CSS capture dimensions, never a hard-coded DPR. Opaque glyph interiors use inferred coverage 0.95–1.05; DPR1 eyebrow has no opaque interiors and uses 0.5–1.05 coverage. Body/support/headline have opaque samples. Rectangle and thin-glyph results remain recorded rather than discarded. Before captures use full-page native PNGs; corrected captures use viewport-native PNGs to bound evidence size. The corresponding [before sampler](probes/contrast-before.mjs) is retained. Neither changes the mask or renderer under test.

Coverage is finite, not all-state accessibility certification. One paired native text/background example per engine and phase plus ordinary center/upper/lower examples are public; the complete fresh capture set is retained in the task owner's execution archive. No unchanged predecessor image collection is duplicated.

## Preserved behavior

- [Build checks](checks/results.json): npm ci, lint, typecheck, 34 tests/eight files, build, validate:build and diff check exit 0. Existing package manifests and lockfile unchanged. npm emitted esbuild/fsevents allowScripts notices; build succeeded.
- [Regression exits](regression/exits.json): seven requested viewports in Chromium/WebKit; matrix 18 cases, policy 16, tether eight, fan six pass. Original 115 static paths and 86 live curves remain; production fan slices meet the unchanged 0.001px tolerance. All 16 tips satisfy the unchanged 25px reach criterion and tangent tests. No overflow, CTA obstruction or observed console/hydration errors. Reduced motion, touch/coarse pointer, no-JS/no-Canvas, hidden/offscreen and other capability gates pass.
- [Fresh-page transitions](regression/transitions-corrected.json): eight scroll, desktop→tablet→desktop, loaded-font reload and supported Chromium density transitions pass pointer mapping and sampled contrast. The [initial harness output](regression/transitions-initial.json) is retained: reusing a callback-frozen page made its later WebKit pointer check invalid. No product fix was made for this test defect. The fresh-page rerun freezes only after each complete interaction. Chromium page-scale spot is pinch emulation, not desktop browser zoom; WebKit live density switching is not supported by this harness.
- Eight reduced-motion mobile/tablet PNG comparisons are byte-identical to the predecessor at 768×1024, 430×932, 390×844 and 320×568. Menu traversal, trapping, Escape and focus restoration pass. The inherited WebKit reduced-motion entry-focus nit remains separate; no navigation rewrite.
- [Composited Retina visibility](visibility/visibility.json): 12 paired shown/hidden states in both engines, 1440 and 1280, center/upper/lower. Native coordinates derive from actual PNG dimensions. Distinct qualifying samples: joins 9–13, gaps 8–16, near 1–15 and ≥32px-back samples 4–10, with the existing 2:1 local luminance and 1.3:1 ridge criteria. Counts vary with lettering/buttons/overlap; these are finite visible samples, not a claim that every strand is unobscured everywhere. All states have 16 tips within 25px. Ordinary screenshots visually confirm aligned glyph protection, continuous visible strands outside letters/buttons, unchanged broad fan/core/purple output and approved brightness.

No runtime performance improvement is claimed. Hidden/offscreen pause passes; physical devices, battery, field performance, exhaustive fonts/zoom and every cursor position are untested. Public-copy/privacy review finds no new claims, dependencies, telemetry, assets, accounts or hosting changes. Private control sources and local personal paths are excluded from this public package.

## Handoff

[HANDOFF.json](HANDOFF.json) records exact identities and separate work, evidence, handoff and provenance states. Corrected preview/readback and one separately executed independent QA remain pending at this evidence commit. The owner must bind QA to the exact persisted replacement commit/tree and newly verified noindex preview, supply the failed predecessor and its qualification, and preserve QA's verdict on a QA-only branch. Controller registration remains pending. No merge or production deployment is authorized here.
