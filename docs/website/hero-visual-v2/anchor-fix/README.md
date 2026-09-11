# Nexus alignment correction

Founder review remains required. This is an implementation-owner correction, not independent QA or authorization to merge/deploy production.

## Reproduced defect

The previous `b12a9a1` candidate was served by the branch preview. Its SVG artwork still used full-hero `object-fit: cover` positioning while Canvas and the logo used the mark container. On the 390 × 844 WebKit reproduction, the art center was 19.34 CSS pixels above the actual logo. Removing the SVG circles did not align its inlet glow or output stream. Adding CSS box-shadow rings also introduced a second ring renderer. The former zero-offset assertion compared two DOM boxes and did not prove visible-layer alignment.

[Measured reproduction](before.json) · [Before mobile](before-mobile.png)

## Correction

The complete visual now lives inside the real mark's coordinate plane. Both responsive SVG plates have explicit native anchor/port metadata and deterministic dimensions, not viewport-cover cropping. Canvas derives its scale from that same rendered plane. The artwork's native intake and exit are mapped to symmetric scene ports at −76 and +76 units on the logo's horizontal axis. The centered primary rings have one active renderer: Canvas, with an equivalent SVG fallback when JavaScript or Canvas is unavailable. The added CSS box-shadow rings are removed.

Intake curves end at the shared left port; the narrow output originates at the shared right port. Core rendering uses source-over compositing so the central disc masks underlying detail rather than adding another translucent layer. The design, density direction, copy, CTA arrangement, brand asset, header, and subsequent sections are retained. The art filenames changed to prevent reuse of the former cached plate URLs.

## Evidence and checks

[Corrected mobile, matching scrolled view](after-mobile-scrolled.png) · [390 × 844 WebKit](after-webkit-390x844.png) · [Desktop](after-chromium-1440x900.png)

The regression harness measures the projected center of the actual SVG artwork, its actual inlet-glow coordinates, all six Canvas ring draw calls, the official logo image, and the no-JavaScript/no-Canvas fallback. It does not infer success solely from a shared container. Browser subpixel rounding is allowed within 0.5 CSS pixels; this is deliberately not reported as universal pixel-exact alignment.

The seven specified sizes were exercised in Chromium and WebKit, plus no-JavaScript and no-Canvas cases in each: 18 cases. Additional checks cover scrolling, pointer movement, CTA hit testing, changing copy height, orientation changes, larger hero body text, reduced motion, visibility-handler pause, offscreen pause, and mobile-menu Escape/focus restoration. Synthetic browser changes are identified as tests, not physical-device measurements.

[Browser measurements](browser-results.json) · [Build/check output](build-results.json)

Final local result: all 18 browser cases passed with no console/page errors or normal-viewport horizontal overflow. Maximum initial-view art-to-logo offset: 0.218 CSS pixels; maximum measured painted-ring-to-logo offset: 0.011 CSS pixels. All seven requested npm/git checks passed; 29 unit tests passed across six files, including six geometry/rendering tests.

No dependencies, public claims, copy, official brand files, Cloudflare settings, or DNS were changed. Physical-device battery/thermal behavior and final visual acceptance remain unverified; mobile results use browser emulation. Existing baseline dependency advisories are not remediated by this alignment patch.

**Founder review: REQUIRED. Independent QA: NOT STARTED. Merge: NOT MERGED. Production: NOT DEPLOYED.** The exact pushed commit and verified hosted preview are recorded in the draft PR handoff.
