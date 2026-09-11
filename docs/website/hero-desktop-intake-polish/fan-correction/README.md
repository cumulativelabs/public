> The Founder rejected the cursor-strand visibility assessment below. Its geometry evidence is retained. See the [composited visibility correction and independent-review handoff](cursor-visibility/README.md) for the new candidate.

# Cursor-reaching desktop intake correction

The Founder rejected the preceding interaction: the broad production fan was restored, but the 155px local influence and roughly 21px maximum displacement could not visibly reach a cursor hundreds of pixels left of it. The screenshot supplied with this assignment showed no unmistakable cursor-reaching fibers. That feedback supersedes the historical assessment of the gentle attraction below.

## Current candidate

- Task: visibly reach the far-left desktop cursor while preserving the restored production fan.
- Branch: `codex/hero-desktop-intake-polish-20260911`; existing draft PR #4.
- Substantive commit: `34f62cf9feef658392b0b85ed8ec5855c7f93e54`
- Substantive tree: `674de385a8daf9bba37030e2a4fa8c31869d98a2`
- Parent: `afa0f333fccdfa6ed3b3a31c8407da8de4d893ea`
- Creator validation passed; independent acceptance and Founder visual review remain pending. No merge or production deployment. Remote branch/preview readback is recorded in the draft PR after push.

## What changed visually

A separate interaction-only canvas paints 16 thin orange/pink fibers that bend from selected production starts into a small bundle at the eased cursor. Their initial tangents match the original curves in reverse, their controls vary deterministically, and their tips have a restrained 26px warm glow. The fibers fade along their length and ease away on exit. This layer is behind the unchanged copy scrim, with its own opacity so the old canvas mask does not suppress the distant reach.

The production renderer, all original SVG paths, the original fan fixtures/parity tests and browser parity probe are unchanged. No original start or control is relocated. The core, mark, rings, purple output, copy, site layout, mobile artwork and dependencies are unchanged. Tethers fade out before the cursor enters the original starts, preventing backward loops into the core/output region. Mobile, touch, coarse-pointer, reduced-motion, Save-Data, low-core and no-canvas fallback cases paint no tether; switching to reduced motion while active clears it immediately.

The [first visual pass](cursor-reach/first-pass-upper.png) was visible but too faint/diagonal behind the headline. The final pass increases strand opacity/width modestly and lengthens the handles so the curves relax more smoothly into the cursor. All eight final normal-motion screenshots below were inspected: the cursor bundle is visible, the original broad fan remains, the copy is readable, and the lower bundle has no oversized beam or hotspot.

## Exact cursor-reach evidence

[Rendered stroke instrumentation and measurements](cursor-reach/results.json) record actual `bezierCurveTo` paths submitted to the tether canvas and actually stroked with visible alpha, alongside the eased pointer, original production curves, core/ring geometry and canvas alpha pixels. Coordinates below are viewport CSS pixels; the raw evidence also includes the scene bounds for conversion.

| Engine / viewport | Lower cursor | Upper cursor | Tips within 25px | Maximum tip distance | Exit residual |
| --- | --- | --- | ---: | ---: | ---: |
| Chromium 1440×900 | (120, 711.06) | (150, 221.06) | 16/16 in each | 19.935px | 0 alpha pixels |
| Chromium 1280×800 | (120, 690) | (150, 208.14) | 16/16 in each | 19.935px | 0 alpha pixels |
| WebKit 1440×900 | (120, 711.05) | (150, 221.05) | 16/16 in each | 19.935px | 0 alpha pixels |
| WebKit 1280×800 | (120, 690) | (150, 208.11) | 16/16 in each | 19.935px | 0 alpha pixels |

All 128 tip measurements pass. All 128 joins match production starts and tangents; maximum tangent cross-product error is below 1.8e-11. Active tethers cover 19,986–26,027 canvas pixels with alpha above 20/255. After 100ms outside the hero, 14–28% of active alpha remains; after another 1000ms, zero strokes and zero alpha remain. Original fan/output coordinates and core/rings are exactly unchanged in all eight active cases.

| Engine / viewport | Baseline | Far-left lower | Far-left upper |
| --- | --- | --- | --- |
| Chromium 1440×900 | [Baseline](cursor-reach/chromium-1440-baseline.png) | [Normal motion](cursor-reach/chromium-1440-far-left-lower.png) | [Normal motion](cursor-reach/chromium-1440-far-left-upper.png) |
| Chromium 1280×800 | [Baseline](cursor-reach/chromium-1280-baseline.png) | [Normal motion](cursor-reach/chromium-1280-far-left-lower.png) | [Normal motion](cursor-reach/chromium-1280-far-left-upper.png) |
| WebKit 1440×900 | [Baseline](cursor-reach/webkit-1440-baseline.png) | [Normal motion](cursor-reach/webkit-1440-far-left-lower.png) | [Normal motion](cursor-reach/webkit-1440-far-left-upper.png) |
| WebKit 1280×800 | [Baseline](cursor-reach/webkit-1280-baseline.png) | [Normal motion](cursor-reach/webkit-1280-far-left-lower.png) | [Normal motion](cursor-reach/webkit-1280-far-left-upper.png) |

## Validation of this correction

- `npm run lint`, `npm run typecheck`, `npm test -- --run`, `npm run build`, `npm run validate:build`, and `git diff --check`: passed. **34 tests / eight files.** No dependency changes.
- [Unmodified production parity probe](cursor-reach/fan-parity.json): six cases, 78 fan-width comparisons, zero failures; all 115 static and 86 live originals remain. Existing production-fan geometry/parity unit tests pass unchanged.
- [Cursor reach](cursor-reach/results.json): eight normal-motion cases at 1440×900 and 1280×800, Chromium and WebKit; 16 tips near the cursor in every case; all joins, exit fade/removal and fixed-coordinate assertions pass.
- [Policy coverage](cursor-reach/capability-policy.json): 16 cases, zero failures; reduced motion, Save-Data, low core, touch, mobile, coarse pointer, no-canvas fallback, and active-to-reduced-motion switching in both engines.
- [Alignment/access/motion matrix](cursor-reach/anchor.json): 18 cases, zero failures. All seven viewport sizes plus fallback checks; six permanent rings, fixed core/inlet, no overflow, accessible CTAs and no console/page errors.
- [Cursor mapping](cursor-reach/cursor.json): initial, scrolled and resized mapping checks in both engines. Radius-only pulse collisions remain historical diagnostics, distinct from the six permanent rings.
- [Source switching](cursor-reach/source-switch.json): four cases, zero failures, including delayed mobile artwork and no-canvas fallback.
- [Contrast](cursor-reach/contrast.json): 124 engine/viewport/state combinations and 1,292 text measurements, including both far-left tether positions at all three desktop sizes. Zero failed sampled thresholds. Minimum large text **3.232:1**; normal text **7.936:1**. Sampling does not claim to cover every possible time or pointer position.
- [Static screenshot hashes](cursor-reach/static-comparison.json): all 14 screenshots, including eight phone/tablet cases, are byte-identical to the retained corrected baseline. Those unchanged PNGs remain in `screenshots/` rather than being duplicated here.

Two probe corrections are preserved: the [first probe](cursor-reach/first-pass-probe.json) tried to exit at the bottom-right viewport pixel, which still lies within the taller hero at 1280px; the final probe moves outside the viewport. The [event-rounding probe](cursor-reach/event-rounding-probe.json) compared fractional requested coordinates directly with WebKit's rounded event coordinate; the final probe checks settling against the received event within 0.1px, and requested-coordinate mapping within 0.75px. The 25px rendered-tip requirement never changed. The alignment and older visual helpers now explicitly select the original production canvas because the hero has a second decorative canvas.

Reproduce with the existing external `PLAYWRIGHT_MODULE`, optional browser executable overrides and `HERO_URL`. Run `scripts/hero-tether-browser.mjs` with `TETHER_EVIDENCE_DIR`, plus the retained fan, policy, alignment, cursor, intake, source-switch and contrast helpers. The contrast helper uses the updated test-only `hero-contrast-renderer.ts` bundle, including the actual tether painter.

Next action: review the exact draft preview with the cursor far left of the fan, then obtain separate acceptance QA bound to the substantive commit/tree above. Do not merge or deploy production during this review.

---

## Historical fan restoration evidence

The remaining report describes the preceding candidate. Its geometry restoration is retained; its local-only interaction assessment is superseded by the cursor-reaching correction above.

# Restore the production fan and retain leftward persistence

The previous PR narrowed the visible intake because moving a cubic's start and first control point reshaped its entire span. This correction restores the production SVG paths and live curves unchanged, then prepends tangent-matched continuation segments. The broad original fan remains intact from each original start through convergence.

## Exact candidate and references

- Branch: `codex/hero-desktop-intake-polish-20260911`; existing draft PR #4 only.
- Substantive commit: `27a555b79bffa94eaf5656ec37f49935f3a60d17`
- Substantive tree: `970297408dd47cea0e60c42f911be8e23783d592`
- Parent / rejected PR reference: `9a6067c4720d23f6b32341e27224816d1b9d53df`
- Production visual reference: `5c254645479892fdeed1bff4799b7c89f375e810`
- Creator validation passed. Independent acceptance and Founder visual review remain pending. No merge or production deployment.

## Implementation

All 115 original SVG intake paths remain verbatim, including their colors, widths, opacities, controls, endpoints, and original clipping. Each new segment joins at its own old start with a matching tangent. A short tangent handle preserves the join while the extra leftward span flattens farther away; this avoids stray diagonal extrapolations. The new segments fade at the far left. No existing fan geometry is relocated.

All 86 original canvas curves are restored to production coordinates. Their continuation is prepended to the draw path. Original moving nodes and pulses therefore also remain on their production trajectories. The existing text scrim, core, C, six permanent rings, purple output, mobile artwork, copy, CTA layout and contact behavior remain unchanged by this correction.

Mouse attraction **ships** on the new desktop live continuation controls. The existing 155 CSS-pixel influence radius gives a nearby subset of strands a gentle response, with weaker influence farther away. A separate exponentially eased attractor follows the mouse and uses the existing strength easing to settle back. Its added deformation does not affect the original curve controls or output. The static fan stays fixed underneath. Mobile has zero continuation length; touch events and existing reduced-motion/Save-Data/low-core gates prevent attraction.

Production changes: `public/visuals/hero-nexus-anchored-desktop.svg`, `src/components/HeroKnowledgeField.tsx`, `src/visuals/drawKnowledgeScene.ts`.

Regression support: `src/visuals/fixtures/production-intake.json`, `src/visuals/intakeFan.test.ts`, `scripts/hero-fan-browser.mjs`, and `scripts/hero-intake-policy-browser.mjs`. The fixture records the immutable production path data, not values copied from the corrected candidate.

## Fan-width parity

**Passed.** The browser probe checks five static and eight live x-slices at each of the three desktop sizes in both engines: 78 comparisons. All original fan spans match production within 0.001 CSS px; all 115 static paths and 86 live curves are present. Unit tests additionally verify verbatim static paths, live curve coordinates within 1e-8 scene units, matching join tangents, and a continuation-inclusive envelope no narrower than production.

Native artwork spans illustrate the rejected regression and its correction ([measurements](probes/reference-spans.json)):

| Native x | Production span | Rejected PR span | Corrected original span | Parity |
| --- | ---: | ---: | ---: | ---: |
| 550 | 548.925 | 349.493 | 548.925 | 100% |
| 650 | 523.894 | 284.494 | 523.894 | 100% |
| 750 | 420.376 | 221.275 | 420.376 | 100% |
| 850 | 276.848 | 152.438 | 276.848 | 100% |
| 950 | 115.505 | 69.148 | 115.505 | 100% |

[Actual browser geometry and attraction measurements](probes/fan-parity.json) bind these checks to the rendered layout. The original span is the compared region; new continuations occupy only the region before each strand's original start.

## Validation results

- `npm run lint`, `npm run typecheck`, `npm test -- --run`, `npm run build`, `npm run validate:build`, and `git diff --check`: passed. **32 tests across seven files.**
- [Alignment/access/motion matrix](probes/anchor.json): **18 cases, zero failures** in Chromium and WebKit. Includes all requested sizes, six permanent rings, anchored inlet/C, no horizontal overflow, reachable CTAs, fallback behavior, and zero console/page errors.
- [Attraction and parity](probes/fan-parity.json): **six desktop cases, zero failures**. A local subset of 46–52 of 86 continuation curves responds. Maximum measured control-coordinate change 14.10–14.43 px; early changes are smaller than settled active changes. Returning the mouse outside the hero leaves less than 0.001 px residual. Original fan and output coordinates remain fixed at the tested left-side pointer locations; C rectangles are identical.
- [Capability policy](probes/capability-policy.json): **eight cases, zero failures**. Reduced motion, Save-Data and low-core canvases remain pixel-identical after pointer movement. Touch does not activate the pointer.
- [Cursor mapping](probes/cursor.json): initial, scrolled, and resized mapping errors remain below 0.05 CSS px in both engines. C remains fixed and all six permanent rings persist. The helper's radius-only pulse collisions are diagnostic, not additional permanent rings.
- [Contrast](probes/contrast.json): **112 state/viewport/engine combinations and 1,136 text measurements**, zero failed sampled thresholds. Minimum large-text ratio **3.232:1** against 3:1; normal-text ratio **7.936:1** against 4.5:1. Samples cover six animation times, pointer response, and static mode; they do not prove every possible time or pointer position.
- [Source switching](probes/source-switch.json): **four cases, zero failures**. Delayed mobile artwork, cached reverse/repeat transitions, and live/no-canvas fallback remain safe.
- [Phone/tablet comparison](probes/mobile-comparison.json): all eight screenshots at **768×1024, 430×932, 390×844, and 320×568** are byte-identical to both production and the preceding PR candidate.
- Visual inspection of the actual 1440×900, 1280×800 and 1024×768 screenshots in both engines confirmed the broad production fan, continuous left entry, preserved readability, no hard plate edge, no detached hotspot/double output, and unobstructed CTAs.

One discarded local iteration used long backward tangent extrapolation, which produced stray diagonals; its [screenshot](probes/discarded-long-tangent.png) is retained. It was replaced by bounded tangent handles before the substantive commit. One test initially imposed an arbitrary fewer-than-half subset limit; the 155px influence radius legitimately reached 49 of 86 curves at that test location. The corrected assertion verifies a proper subset, local extension-only movement, fixed original/output curves, and no mobile extension. All final local assertions pass. The [first remote CI run](https://github.com/cumulativelabs/public/actions/runs/34633377046) subsequently exposed a cross-runtime `Math.sin` last-bit difference of about 1.82e-11 in one fixture coordinate. The test now compares canvas coordinates/envelopes within 1e-8 scene units; SVG preservation remains verbatim and the browser tolerance remains 0.001 CSS px. This test-only portability correction leaves the rendered candidate unchanged.

## Desktop visual comparisons

The first two columns are retained immutable production and rejected-PR references. Corrected images use the final production build, reduced motion, and device scale factor 1. Normal-motion interaction is checked separately above.

| Engine / viewport | Production | Rejected PR | Corrected | Attraction |
| --- | --- | --- | --- | --- |
| Chromium 1440×900 | [Main](../before/chromium-1440x900.png) | [Previous](../after/chromium-1440x900.png) | [Corrected](screenshots/chromium-1440x900.png) | [Mouse](screenshots/chromium-1440-attraction.png) |
| Chromium 1280×800 | [Main](../before/chromium-1280x800.png) | [Previous](../after/chromium-1280x800.png) | [Corrected](screenshots/chromium-1280x800.png) | [Mouse](screenshots/chromium-1280-attraction.png) |
| Chromium 1024×768 | [Main](../before/chromium-1024x768.png) | [Previous](../after/chromium-1024x768.png) | [Corrected](screenshots/chromium-1024x768.png) | [Mouse](screenshots/chromium-1024-attraction.png) |
| WebKit 1440×900 | [Main](../before/webkit-1440x900.png) | [Previous](../after/webkit-1440x900.png) | [Corrected](screenshots/webkit-1440x900.png) | [Mouse](screenshots/webkit-1440-attraction.png) |
| WebKit 1280×800 | [Main](../before/webkit-1280x800.png) | [Previous](../after/webkit-1280x800.png) | [Corrected](screenshots/webkit-1280x800.png) | [Mouse](screenshots/webkit-1280-attraction.png) |
| WebKit 1024×768 | [Main](../before/webkit-1024x768.png) | [Previous](../after/webkit-1024x768.png) | [Corrected](screenshots/webkit-1024x768.png) | [Mouse](screenshots/webkit-1024-attraction.png) |

All four phone/tablet dimensions for both engines are retained in [screenshots](screenshots/). Existing browser helpers use `PLAYWRIGHT_MODULE`, optional executable overrides, and `HERO_URL`; the new probes use `FAN_EVIDENCE_DIR` and `POLICY_EVIDENCE_DIR`. No browser dependency was added to the application.

Next action: Founder visual review of this exact candidate. Confirm the original broad fan with leftward persistence and the gentle desktop continuation response. Record any remaining visual correction against the candidate identity; do not merge or deploy production during review.
