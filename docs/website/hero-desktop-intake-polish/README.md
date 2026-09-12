# Desktop hero intake persistence

**Superseded visual candidate:** the Founder rejected this version because it narrowed the production fan. See the [fan correction and current validation](fan-correction/README.md). The evidence below remains the historical record for `9a6067c`.

The orange/pink intake now enters continuously from off-screen left, retaining the existing convergence and purple output. This is a desktop-only extension of the existing SVG and canvas strands.

## Candidate

- Branch: `codex/hero-desktop-intake-polish-20260911`
- Substantive commit: `7a10bc0c3cf5c6dd3423f2167555e8f0a49bae82`
- Substantive tree: `889c87a786533614ff47fe89190e3d85a489a0ab`
- Parent / production-main baseline: `5c254645479892fdeed1bff4799b7c89f375e810`
- State: implementation committed; creator validation passed; Founder review pending. Independent acceptance QA has not been performed. No merge or production deployment is authorized or performed.

## Cause and change

The desktop SVG clipped its field at native x=420 and began its 115 intake paths at approximately x=435–605. Canvas intake began only 470–550 scene units left of the core. These extents made the field appear to originate near the center.

The SVG now extends those same paths beyond its left edge, expands the existing field clip, and fades the incoming paths gradually. Only the start and first control-point x coordinates change; final control points, endpoints, path count, widths and authored opacities remain unchanged. All other artwork elements are identical. The canvas extends its existing desktop intake by 650 scene units and retains its final control points and inlet. Mobile receives zero extension.

The existing copy scrim retains its opacity behind text. Its left edge now fades over six rem so the newly visible strands do not reveal a rectangular cutoff. No copy, navigation, CTA layout, logo geometry, permanent rings, purple output, contact behavior, or unrelated sections changed.

Implementation files:

- `public/visuals/hero-nexus-anchored-desktop.svg`
- `src/components/HeroKnowledgeField.tsx`
- `src/styles/hero-visual-v2.css`
- `src/visuals/drawKnowledgeScene.ts`
- `src/visuals/knowledgeScene.ts`

Validation helpers: `scripts/hero-intake-browser.mjs` captures settled comparisons; `scripts/hero-contrast-browser.mjs` now passes the desktop extension to its direct renderer calls.

## Validation

All requested commands passed: `npm ci`, `npm run lint`, `npm run typecheck`, `npm test -- --run` (29 tests / 6 files), `npm run build`, `npm run validate:build`, and `git diff --check`.

- [Alignment matrix](probes/anchor.json): 18 cases, zero failures. All seven sizes in Chromium and WebKit, plus fallback cases. Checks cover actual artwork/core/inlet alignment, exactly six permanent rings, CTA reachability, overflow, console/page errors, motion policy, pointer mapping, and responsive geometry.
- [Cursor measurements](probes/cursor.json): active response before/after scroll and resize in both engines; maximum curve-coordinate changes 6.14–7.48 CSS px, pointer mapping error under 0.05 px, unchanged logo rectangles, six permanent rings. Radius-only pulse collisions recorded by the older helper are diagnostic; its style-qualified permanent-ring counts remain six.
- [Contrast samples](probes/contrast.json): 112 engine/viewport/state combinations, 1,136 text measurements, zero failed sampled thresholds. Lowest large-text ratio 3.207:1 (threshold 3:1); normal-text ratio 7.936:1 (threshold 4.5:1). Samples cover 0, 3, 8, 14, 28 and 56 seconds, pointer response, and static rendering. This is sampled evidence, not proof for every possible time and pointer position.
- [Mobile/tablet comparison](probes/mobile-comparison.json): all eight before/after PNG pairs at 768, 430, 390 and 320 pixels are byte-identical. The mobile SVG is unchanged.
- [Artwork invariants](probes/artwork-invariants.json): all 115 updated paths retain their final control points and endpoints; every other artwork element remains identical.
- Settled visual review: intake reaches the far-left viewport edge at all three desktop sizes, copy remains readable, and there is no hard plate/scrim edge, CTA obstruction, alignment drift, extra output, or detached hotspot.

Two preliminary browser observations are retained. An [early WebKit screenshot](probes/early-webkit-1280x800.png) painted two text elements black; the settled production-build capture and all contrast states rendered correctly without a product-code change. The [initial source-switch probe](probes/source-switch-initial.json) failed one held-image assertion after WebKit had already selected the correct loaded mobile source. The [isolated rerun](probes/source-switch-isolated.json) passed all four live/fallback cases, including delayed loading and cached reversals. No stale desktop image was observed in the final checks.

## Screenshots

Before: untouched production-main baseline. After: production build of the substantive candidate. Both use reduced motion and device scale factor 1 to make comparisons deterministic; final captures wait for fonts and settling. Interactive and normal-motion validation is separate above.

| Viewport | Chromium before | Chromium after | WebKit before | WebKit after |
| --- | --- | --- | --- | --- |
| 1440×900 | [Before](before/chromium-1440x900.png) | [After](after/chromium-1440x900.png) | [Before](before/webkit-1440x900.png) | [After](after/webkit-1440x900.png) |
| 1280×800 | [Before](before/chromium-1280x800.png) | [After](after/chromium-1280x800.png) | [Before](before/webkit-1280x800.png) | [After](after/webkit-1280x800.png) |
| 1024×768 | [Before](before/chromium-1024x768.png) | [After](after/chromium-1024x768.png) | [Before](before/webkit-1024x768.png) | [After](after/webkit-1024x768.png) |
| 768×1024 | [Before](before/chromium-768x1024.png) | [After](after/chromium-768x1024.png) | [Before](before/webkit-768x1024.png) | [After](after/webkit-768x1024.png) |
| 430×932 | [Before](before/chromium-430x932.png) | [After](after/chromium-430x932.png) | [Before](before/webkit-430x932.png) | [After](after/webkit-430x932.png) |
| 390×844 | [Before](before/chromium-390x844.png) | [After](after/chromium-390x844.png) | [Before](before/webkit-390x844.png) | [After](after/webkit-390x844.png) |
| 320×568 | [Before](before/chromium-320x568.png) | [After](after/chromium-320x568.png) | [Before](before/webkit-320x568.png) | [After](after/webkit-320x568.png) |

Run the capture helper with external `PLAYWRIGHT_MODULE`, optional `CHROMIUM_EXECUTABLE` / `WEBKIT_EXECUTABLE`, `HERO_URL`, and a new `INTAKE_EVIDENCE_DIR`. The existing alignment, cursor, source-switch and contrast helpers accept their documented evidence-directory environment variables. Do not overwrite retained baseline evidence.

Next action: Founder visual review of this exact candidate and the branch preview, followed by separately authorized acceptance/release steps. No child agents were launched.
