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
