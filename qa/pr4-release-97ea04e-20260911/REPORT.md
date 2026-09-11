# Independent PR4 release QA

**QA_VERDICT: FAIL. MERGE_RECOMMENDATION: DO_NOT_MERGE.** One new release-blocking text-readability regression at DPR 2. The approved strand brightness and cursor behavior are not being reconsidered. No candidate source or tests were changed.

Candidate `97ea04ee7c1e80e5a047c278807b593131dbabd3`, tree `c0c592b283f03b53a032962accb005bc868c743f`; target `codex/hero-desktop-intake-polish-20260911`. Substantive commit `57aaffc659db7f2a2f3242fdfb14a89e066024cb`, tree `a34ad881a83ce3433fc6bb21987ae52183f8b662`, parent `875695ca36f14eaf9f4045a402ab47f76c37a86a`. Candidate parent is the substantive commit. Production comparison: `5c254645479892fdeed1bff4799b7c89f375e810`.

## Release blocker PR4-QA-01

At DPR 2, the glyph/CTA mask has **2393×1387 bitmap pixels on a 1595.0625×924.921875 CSS-pixel canvas**, with computed `mask-size: auto`. The source scales the mask for device pixels and assigns its PNG without specifying the mask's CSS size (`src/components/HeroKnowledgeField.tsx:140–190`). Actual screenshots show displaced cutouts in whitespace and unprotected lettering. Fonts are loaded; the problem occurs before scrolling and persists after resize/scroll. Uppercase handling and font-readiness refresh work at DPR 1 but do not correct the mask's DPR sizing.

Reproduce in either engine: fresh 1440×900 CSS viewport, deviceScaleFactor 2, normal motion, pointer (120,711), settle 1.3 seconds. Center x150 and 1280×800 center x280 also reproduce it. No renderer replacement or proposed fix was injected.

Native-pixel, paired text-visible/text-hidden compositor captures confirm the new contrast failure:

| Engine / build | Body minimum | Support minimum |
| --- | ---: | ---: |
| Chromium production | 12.598:1 | 9.689:1 |
| Chromium candidate | **1.875:1** | **1.418:1** |
| WebKit production | 12.661:1 | 9.698:1 |
| WebKit candidate | **1.883:1** | **1.393:1** |

Both normal-text thresholds are 4.5:1. These are sampled glyph interiors, not empty text rectangles or antialiased edges: the reported worst native body/support samples have full coverage. Headline samples also fail their 3:1 threshold. All eight bounded DPR2 states fail, while the identical native confirmation method produces no failed measurements on the exact production baseline. This is a release-blocking accessibility regression, not an art preference.

Evidence: [native measurements](native-confirmation.json), [paired native PNGs](native-confirmation/), [DPR2 measurements](dpr-contrast-results.json), [ordinary-size DPR2 reproduction](dpr-contrast/chromium-1280-center280.png), [hosted DPR2 screenshot](supplemental/webkit-hosted-dpr2.png). Reproduction probes and reviewed pixel samplers are in this evidence directory.

## Other acceptance results

- **Build:** npm ci passed on network-enabled retry after sandbox DNS failed (exit 1, 70.72s). Lint, typecheck, 34 tests/eight files, build, validate:build and diff check each exit 0. [Exit codes](build-results.json), [logs](logs/). npm reports one low and one high advisory; package manifests/lockfile are identical to production. No dependency remediation was attempted.
- **Exact assets/origins:** all 13 manifest entries match the rebuilt candidate and immutable `https://a8683876.cumulative-labs.pages.dev/` byte for byte. JS `index-CIZ7VDhw.js` SHA256 `1dd37278f64a22e0082efd6ac5de5abfc75e850e53a9793e102821d9bb466162`; CSS `index-BYjBqNig.css` SHA256 `09342af51004da8a14dc0759331851ad8911455eff7e5fe228fe0add3b7bf2cc`. Full [hash manifest](asset-manifest-verification.json), [hosted readback](hosted-assets.json). Local candidate `http://127.0.0.1:4317/`; exact baseline `http://127.0.0.1:4318/`. Preview has noindex; local built HTML and live production `https://cumulativelabs.com/` do not. [Headers](final-probes.json).
- **Browser matrix:** Chromium 151.0.7922.34 and WebKit 26.6 at all seven requested viewports. Eighteen alignment/fallback cases, 16 capability-policy cases and eight reach/exit cases pass. No overflow or page/console/hydration errors observed. Reduced-motion, touch, coarse-pointer, low-core, Save-Data, hidden/offscreen pause and no-canvas/no-JS gates pass. CTA hit targets and first keyboard traversal pass; #work click navigates and scrolls. [Matrix](matrix/browser-results.json), [policy](policy/results.json), [reach](tether/results.json), [keyboard assessment](keyboard-assessment.json).
- **Real compositor at DPR1:** visually inspected both engines at x150/x280, intake edge, upper/lower, mobile/fallback and resize/scroll. Eighteen hosted shown/hidden cases contain at least 10 distinct visible join, nine gap and seven near-cursor filament samples under the reviewed visibility target. Broad fan/core/rings/output remain stable. Ten actual-runtime contrast states / 130 measurements pass: minimum large 3.301:1, normal 8.129:1. [Visibility](visibility/visibility.json), [live contrast and supplemental checks](supplemental-results.json).
- **Mobile/performance:** all eight reduced-motion phone/tablet screenshots are byte-identical to the exact production build. Chromium two-second active sample: candidate 25.45ms scripting/second, 38 draw frames/second, normal quality; baseline 30.10ms/second, 56 frames/second. Both have zero measured layout shifts/layout calls in the windows and zero hidden/offscreen draws. This is a bounded headless observation, not proof of improved performance, battery life or field performance.
- **Source/privacy/public claims:** reviewed production and previous-candidate deltas. No dependency, telemetry or public-copy change. Desktop SVG grows by 16,344 bytes for intake continuations; all original SVG elements/attributes remain present. No large new runtime asset. Changed public text/artifacts were scanned for private paths, control names and common secret patterns: no findings. Candidate tracked files remain unmodified. [Source/privacy](privacy-source-review.json), [baseline](baseline-source-review.json), [final status](candidate-status.json).

## Inherited nit and coverage limits

WebKit reduced-motion menu entry leaves focus on BODY on both exact production and candidate. Traversal and Escape/restoration work. This is the independently reproduced inherited nonblocking nit, separate from PR4-QA-01. [Pointer-open comparison](menu-pointer-entry.json).

Coverage is finite. Axe reports no violations in two hosted spots but leaves color contrast incomplete; that does not override pixel evidence or guarantee all-state accessibility. Contrast uses real application rendering, freezes callbacks after settling, then changes only text visibility/gradient exposure for paired pixel measurements. Native DPR2 confirmation avoids downsampling uncertainty. No physical-device, exhaustive browser/zoom/font, battery or field certification. The initial CTA helper counted a second traversal because its stop condition compared CSS-uppercase presentation to mixed-case textContent; raw output and corrected first-traversal assessment are retained, and no product keyboard defect is inferred from that harness error.

**LOCAL_COMPLETE + QA_COMPLETE (FAIL).** Controller should persist/read back this evidence, hold merge and route PR4-QA-01 for separately authorized remediation and fresh exact-candidate QA. Remote readback is **PENDING_CONTROLLER**. QA did not commit, push, mutate the PR, merge, deploy or publish. This handoff is local-only.
