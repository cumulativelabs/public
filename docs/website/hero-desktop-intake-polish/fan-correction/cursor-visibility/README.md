# Cursor strands: composited visibility correction

Task **CL-HERO-CURSOR-VISIBILITY-20260911-001**, “Hero v2 - make cursor strands clearly visible.” Implementation/remediation verification only. **Founder preview review REQUIRED; independent acceptance QA REQUIRED.** PR #4 remains draft. No merge or production deployment is authorized by this result. Controller registration remains pending.

## Candidate and rejected baseline

- Branch: `codex/hero-desktop-intake-polish-20260911`.
- Substantive commit: `57aaffc659db7f2a2f3242fdfb14a89e066024cb`.
- Substantive tree: `a34ad881a83ce3433fc6bb21987ae52183f8b662`.
- Parent / starting HEAD: `875695ca36f14eaf9f4045a402ab47f76c37a86a`; starting tree `d71df51f843d200603a3c7a7949e7a55c8cb5887`.
- Production geometry reference: `5c254645479892fdeed1bff4799b7c89f375e810`.
- Rejected preview: <https://c62e56c7.cumulative-labs.pages.dev/>. Its public build assets were byte-identical to the locally rebuilt starting commit, and responses carried `noindex`: [identity](before/identity-summary.json), [asset readback](before/identity.json).
- The enclosing documentation commit is a handoff-only descendant of the substantive candidate. Its exact HEAD/tree and remote report readback are recorded in draft PR #4's terminal receipt; this avoids embedding a commit's own hash in its contents.

The starting tree was clean, the remote branch/PR matched the assignment, and no competing writer for this workspace was observed. The branch was checked again before persistence. Prior cursor-reach evidence remains intact. The Founder's faintness report is a real visibility defect; neither geometric reach nor raw canvas alpha contradicted it.

## Root cause and bounded correction

The tether canvas was inside the artwork stacking context, beneath the copy's broad `#030811d9` scrim. Its own 0.9 opacity and gradient fading to 0.10 at the join and 0.45 at the cursor compounded that suppression. Horizontal activation also faded before the production fan starts, weakening intermediate positions. Unmasked canvas pixels were therefore insufficient evidence of what a person could see.

Only the desktop interaction canvas now composites above the unchanged broad scrim. Copy remains above it, with a glyph-shaped canvas mask and approximately 2px protection around actual lettering, plus full CTA-surface protection. Mask placement uses rendered character positions, loaded fonts, and CSS uppercase transformation. It updates on resize/font readiness. Negative space between and around letters stays available to the strands. Mobile/tablet retain the canvas in its original artwork plane; inactive desktop interaction is removed from compositing.

The existing 16 cursor curves, tips and follow/settle geometry remain. Their thin 0.9–1.55px centers retain strong color at both ends; the halo is reduced from 5px/0.18 to 4px/0.10. The same selected existing intake curves receive a coincident highlight that joins continuously into the fan and fades toward the already-bright inlet. No original path/control is moved. Activation eases across a 70-scene-pixel interval overlapping the old starts instead of disappearing before the gap. The 26px cursor glow is unchanged.

The broad static fan, C/core/rings, purple output, public copy, CTAs and layout are unchanged. No dependency was added. Pointer events remain non-intercepting. Existing touch, reduced-motion, Save-Data, low-core, coarse-pointer, hidden/offscreen and fallback gates remain.

## Ordinary page evidence and composited measurements

These are unbrightened viewport PNGs at device scale 1, after normal-motion settling. Each visible/hidden pair freezes the same scene and changes only tether CSS visibility. No transparent-canvas image or alpha count is used to establish visibility.

| Viewport | Rejected, x=280 at intake height | Corrected, same position | Corrected far-left, x=150 |
| --- | --- | --- | --- |
| 1440×900 | [Before](before/chromium-1440-center280.png) | [After](after/chromium-1440-center280.png) | [After](after/chromium-1440-center150.png) |
| 1280×800 | [Before](before/chromium-1280-center280.png) | [After](after/chromium-1280-center280.png) | [After](after/chromium-1280-center150.png) |
| 1024×768 | [Before](before/chromium-1024-center280.png) | [After](after/chromium-1024-center280.png) | [After](after/chromium-1024-center150.png) |

[Before states](before/states.json) cover 21 Chromium cases on the exact rejected preview. [After states](after/states.json) cover 42 cases in Chromium and WebKit: all three desktop sizes, x=120/150/280/400 at inlet height, 20px left of the fan's left envelope, and upper/lower positions. Every screenshot filename, requested pointer, actual eased/event state, canvas bounds and rendered stroke activation is recorded. Chromium center heights are 431.0625, 418.140625 and 397.46875px; just-outside-fan x positions are 456.0404, 362.2591 and 222.6446px respectively. WebKit rounding is retained in the raw records.

[Composited before measurements](before/visibility.json) found **zero qualifying center-height filaments at every sampled desktop x position**. [Final measurements](after/visibility.json) find, across all **40 active cases**, **9–13 distinct qualifying join samples, 8–16 across the gap, and 3–14 near the cursor**. Each qualifies at ≥2:1 shown/hidden local luminance contrast and ≥1.3:1 against a lateral pixel 3px away, so a broad glow alone cannot qualify. Coincident samples within 2px are not counted as separate filaments. This is an authored visibility target, **not a WCAG requirement**.

Example actual final-page filament-center samples, Chromium, x=150 at intake height:

| Viewport | Region | Pixel (x,y) | Filament/background | Lateral ridge |
| --- | --- | --- | ---: | ---: |
| 1440×900 | Join | 491,228 | 4.049:1 | 4.049:1 |
| 1440×900 | Gap | 381,306 | 6.052:1 | 6.045:1 |
| 1440×900 | Near cursor | 184,427 | 7.996:1 | 2.629:1 |
| 1280×800 | Gap | 311,292 | 5.950:1 | 5.986:1 |
| 1280×800 | Near cursor | 184,413 | 8.771:1 | 2.969:1 |
| 1024×768 | Gap | 205,285 | 6.063:1 | 6.081:1 |
| 1024×768 | Near cursor | 180,381 | 5.484:1 | 5.484:1 |

Sampling excludes pixels within 22px of the mouse and bright underlying text/art. Join/gap samples use curve parameters .08/.45. The retained fixed .85 sample sometimes falls inside the excluded compact bundle or beneath text; some such cases have fewer than three qualifying samples, and 1024/x=280 has none eligible there. A separately reported near-cursor sample steps backward from each tip to the first center ≥32px from the mouse; all active cases meet the distinct-filament target there. At 1024/x=400, the pointer is inside the original fan and the tethers are intentionally inactive in both engines. These two cases are not counted as visibility passes. Individual occluded/antialiased samples can remain below target; the report does not claim every pixel or every strand passes.

## Regression verification

- [Reach/exit](cursor-reach.json): eight retained cases pass; 16 cursor tips settle within 25px, with eased exit and zero residual. Expanded measurements also have 16 tips in each of the 40 active cases; maximum requested-pointer distance **20.590px**, including event rounding. Coincident inlet highlight endpoints are distinguished from cursor tips.
- [Fan parity](fan-parity.json): six cases, 78 original span comparisons, zero failures. All 115 static paths and 86 original live curves remain; original C/ring/output coordinates remain fixed. Selected interaction highlights use the existing intake controls.
- [Alignment](alignment.json): 18 cases, zero failures, all seven viewports in both engines; six permanent rings, fixed core/inlet, no overflow, accessible CTAs and no browser errors. [Mapping](cursor-mapping.json) retains scroll/resize verification. Radius-only pulse collisions remain diagnostics, not extra permanent rings.
- [Policy](capability-policy.json): 16 cases, zero failures. [Source switching](source-switch.json): four cases, zero failures, including delayed artwork and no-canvas fallback.
- [Static hashes](static-comparison.json): **14/14 byte-identical** to the identity-verified starting preview, including **8/8 mobile/tablet** at 768×1024, 430×932, 390×844 and 320×568. The retained historical static screenshots also match. [Repeated WebKit phone comparison](repeat-static.json) independently repeats the exact match three times.
- [Contrast](contrast.json): **154 states / 1,682 text measurements**, zero failed sampled thresholds; minimum applicable large text **3.232:1**, normal text **5.809:1**. Includes expanded center/edge/upper/lower tether crossings. Paired composited screenshots locate glyph interiors; thin text without opaque interiors uses ≥50% coverage samples. Conservative rectangle minima are retained, but rectangles containing deliberately visible negative-space strands are not treated as glyphs. These samples do not certify every possible pointer/time or physical display.
- [Build checks](build-results.json): `npm ci`, lint, typecheck, **34 tests / eight files**, build, validate:build and diff check pass. [Exact public build hashes](build-manifest.json) bind hosted verification to this build. Existing npm audit advisories are disclosed in the build record; dependencies were not changed.
- [Transition/performance](transition-performance.json): both engines cross the activation boundary in 10-scene-pixel steps without a discontinuous switch; maximum successive opacity change is about 0.20 over the authored smooth fade. Chromium active two-second windows record approximately 23–27ms scripting per second, 31–46 rendered tether frames per second, and no economy downgrade. Local headless measurements under concurrent verification load are not battery, physical-device or field-performance certification.

## Retained rejected work and lesson

[Word-sized mask](rejected-local/word-mask.png) made the strands bright but erased too much whitespace. [Unhighlighted joins](rejected-local/join-discontinuity.png) exposed an abrupt connection into the dim original fan. [Initial contrast evidence](rejected-local/contrast.json) retains the failed uppercase-mask/rectangle assessment; the final mask follows displayed uppercase glyphs. [Initial static mismatch](rejected-local/static-comparison.json) retains the mobile positioning/compositing regression. The fixes were narrowed to glyph protection, continuous selected highlights, desktop-only stacking and the original mobile plane. These records do not represent accepted candidates.

The recurring lesson is that geometric reach and raw alpha passed while visible output failed, first in the local-attraction assessment and again in the cursor-reach assessment. The durable guardrail here is the reusable **final-page visible/hidden pair with thin-center contrast and ordinary-size visual inspection**, exercised against both the failed predecessor and this correction. No new infrastructure project or acceptance authority is implied.

## Hosted preview and reproduction

[Verified substantive preview](https://1570114f.cumulative-labs.pages.dev/) maps to commit `57aaffc659db7f2a2f3242fdfb14a89e066024cb`. [Hosted assets](hosted/identity.json) match every local public build asset and carry `noindex`. [Six hosted paired cursor cases](hosted/visibility.json), x=150/280 at all three desktop sizes, also meet the distinct-filament target. Remote CI validation and automatic preview build succeeded.

Reuse external `PLAYWRIGHT_MODULE`, `CHROMIUM_EXECUTABLE`, `WEBKIT_EXECUTABLE` and `HERO_URL`. Capture with `VISIBILITY_EVIDENCE_DIR=<new directory> node scripts/hero-visibility-browser.mjs`, then run `node scripts/hero-visibility-measure.mjs <directory>`. Existing tether, fan, policy, alignment, cursor, source-switch, intake and contrast helpers remain reusable; bundle `scripts/hero-contrast-renderer.ts` as the `ContrastRenderer` IIFE for the contrast helper. No test HUD is added to production.

## Handoff and independent review

See [HANDOFF.json](HANDOFF.json) for separated implementation, persistence, preview, QA and release states. The controller owns organizational registration and its readback; those remain pending. A branch push alone is not full organizational durable completion.

A separate acceptance reviewer must bind the review to substantive commit `57aaffc659db7f2a2f3242fdfb14a89e066024cb` / tree `a34ad881a83ce3433fc6bb21987ae52183f8b662`, confirm the preview's build hashes, inspect ordinary screenshots and live center-height interaction, independently check glyph contrast/visibility, and record a persisted verdict. The reviewer must not silently remediate this candidate. Founder review is also required. Neither review has been performed by this implementation owner. Keep PR #4 draft; do not merge or deploy production.
