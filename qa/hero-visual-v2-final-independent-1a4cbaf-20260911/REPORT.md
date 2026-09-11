# Hero v2 — final independent QA

**QA_VERDICT: PASS_WITH_NITS. MERGE_RECOMMENDATION: YES, subject to Founder approval.**

The exact candidate passes the bounded independent release assessment. The former tablet seam and missing contrast evidence are resolved. No material visual, interaction, accessibility, performance, privacy/security, or provenance regression was found. One inherited WebKit reduced-motion menu-entry focus limitation remains non-blocking for this hero release. No product source was modified and no merge or production deployment was performed.

Task: `CL-HERO-FINAL-INDEPENDENT-QA-20260911-001`. Role: independent QA, separate from implementation. This report records completed QA substance; remote persistence and registry completion are separately evidenced by the subsequent readback receipt. Local report existence alone is not durable completion.

## Exact identity

| Item | Verified value |
| --- | --- |
| Repository / target | `cumulativelabs/public` / `hero-visual-v2` |
| Final head | `1a4cbaf9f8e9cf8a88a5091abb23f34fb2c97ce6` |
| Final tree | `db5099c970456f44b414cc1dea52243cf19d519c` |
| Substantive source | `e7540c4c443415249cecba7d77731f329ff1fcb5` |
| Source tree | `4a405a1cd16e8d1a20ab7106e27bbeb0387f34c4` |
| Source parent | `8ad80c7e9e0ada7c9b831ab2266d18fa6042ad1a` |
| Main baseline | `2c3f238b9e6e0c991655d5eb93f99bd6c8fb815e` |
| Immutable preview | https://db4b833b.cumulative-labs.pages.dev/ |
| PR | https://github.com/cumulativelabs/public/pull/3 — draft, open, unmerged |

The single commit after the substantive source changes only remediation reports/evidence. Its application/runtime diff is empty. Local and remote commit/tree/parent agree. Main and the target branch remained at the specified identities at final provenance readback. [Checkout evidence](checkout-verification.json), [remote evidence](remote-provenance.json).

All nine compared responses—HTML, JS, CSS, both artwork SVGs, both official logos, and two favicon assets—returned HTTP 200 and byte-identical SHA-256 values to the fresh build. Preview HTML has `X-Robots-Tag: noindex`. This establishes runtime identity beyond URL or title; provider deployment metadata was not queried. The webmanifest/robots/config files were not included in this nine-file equality assertion. [Full identity record](hosted-identity.json).

Local AGENTS.md and current remote startup, completion, registry architecture and Core source/config/template were read before substantive testing. The immutable control/main commits and rule-source hash are retained in a private control receipt; private governance text and repository paths are intentionally excluded here. Prior failed QA and remediation evidence were read as leads and left unchanged. [Prior evidence hashes](prior-evidence-hashes.json).

## Commands and browser coverage

Fresh `npm ci` with a temporary cache, `npm run lint`, `npm run typecheck`, `npm test -- --run`, `npm run build`, `npm run validate:build`, and `git diff --check` all exited 0. Tests: 29 passed across six files. Node v26.8.2, npm 11.19.1. The exact baseline was independently extracted and built with the unchanged locked dependencies. [Command results and logs](logs/command-results.json), [baseline build log](logs/baseline-build.log).

Chromium 151.0.7922.34 and WebKit 26.6 on macOS ran against both the fresh static build and immutable preview at **1440×900, 1280×800, 1024×768, 768×1024, 430×932, 390×844 and 320×568**. Each origin's expanded matrix has 18 records, including fallback/supplemental cases; both have zero assertion failures and zero recorded console/page/hydration errors. Browser emulation is not physical-device or Safari.app certification. [Local results](local/browser-results.json), [preview results](immutable/browser-results.json), [versions/requests](network-versions.json).

The existing browser harnesses were read, audited, and independently executed with output redirected into this new QA directory. They are reused instruments, not owner-result acceptance. New QA probes independently challenge both delayed-source directions and automatic menu entry; contrast uses new times and pointer locations. Source/harness hashes support reproduction. A radius-only ring test was deliberately not used: permanent rings require the gradient/source-over style in addition to geometry, distinguishing the transient pink pulse.

## Visual and interaction judgment

All four complete viewport overview sheets were inspected, with full-resolution review of desktop, 1024px, 768px, phone, focused controls, and unavailable-plate fallback captures. [Preview Chromium overview](review/immutable-chromium-overview.png), [Preview WebKit overview](review/immutable-webkit-overview.png).

At **768×1024**, the old hard internal vertical boundary at the left of the artwork is absent in both engines and both origins. The plate now fades into the dark hero; the C, six permanent rings, orange intake and purple output share a coherent center/axis. The right-weighted tablet composition is intentional and does not expose a hard rectangle. The normal section boundary below the artwork remains. This conclusion is based on actual pixels, not only bounding boxes. [Chromium tablet](immutable/after-chromium-768x1024.png), [WebKit tablet](immutable/after-webkit-768x1024.png).

Desktop copy and actions stay readable with a softened background. No detached hotspot, second output, duplicate permanent ring system, horizontal overflow, CTA obstruction, obvious plate rectangle or new clipping was seen. Phone retains the dense amber input and purple output composition; remediation does not change phone geometry or artwork. At 320×568, scrolling is needed to see the actions and core, as expected for the content height; both actions remain reachable. [Phone](immutable/after-webkit-390x844.png), [320px scrolled](webkit-320-scrolled.png).

Breakpoints 767/779/780/781/820 and desktop↔tablet sequences were exercised in both engines. Fresh contexts held the newly selected image response in **both directions**, with Canvas and no-Canvas fallback; repeated cached switches followed. Independent rAF records found zero frames where a visible plate's source belonged to the wrong breakpoint. Held-response screenshots show coherent live or SVG-ring fallback without the stale plate, then correct artwork after release. This is observed coverage, not a mathematical guarantee about every browser scheduling interleave. [Independent probe and frame records](extra/results.json), [harness](independent-switch-menu.mjs), [additional switch results](switch/results.json), [breakpoint/static results](tablet/tablet-results.json).

Cursor response was perceptible and restrained in before/after captures: curve coordinates changed while the C bounds remained exactly fixed. Mapping errors stayed below 0.045 CSS px after scroll and resize; six permanent gradient rings remained centered. Synthetic hidden-document and offscreen pause passed; reduced motion, Save-Data and two-core modes stopped drawing and retained stable pixels. No-JS and no-Canvas initial visual/content fallback remained coherent. No-JS menu operation is inherited as unavailable because navigation depends on React handlers; it is not claimed to work. [Cursor records](cursor/cursor-followup.json), [cursor captures](cursor/screenshots/), [fallback/static cases](tablet/tablet-results.json).

## Contrast and keyboard accessibility

The independent contrast run measured **140 state/viewport/engine combinations**: all seven sizes, both engines, at t=0, 1.7, 9.3, 19.7, 37.2, 73.1 seconds; three additional full-strength pointer states at t=11.1, 23.5 and 41.8 with different positions around the intake/core/output; and static t=28. The live renderer was freshly bundled, autonomous drawing paused, and the current canvas redrawn deterministically using its existing transform and DOM layout. CSS compositing, scrim, image opacity, masks and CTA fills remained active.

Paired screenshots preserve actual text and text-hidden composited backgrounds. Solid foreground colors come from computed authored CSS, with alpha composited where applicable. The gradient is sampled from the browser-painted unclipped gradient, **only at actual glyph interiors** whose text/background/gradient coverage is 95–105%; empty line-box and antialiased edge pixels do not establish gradient minima. Solid text scans conservatively include every text-line rectangle pixel. WCAG relative luminance uses sRGB linearization and `(Lmax+.05)/(Lmin+.05)`, without rounding for pass/fail. [Reproducible harness](independent-contrast.mjs), [raw records](contrast/contrast-results.json), [worst locations/RGB/states](contrast-summary.json).

| Text/control | Font size / weight | Observed minimum | AA threshold |
| --- | --- | ---: | ---: |
| Eyebrow | 10.4–11.2px / 400 | 10.8427 | 4.5 |
| White headline line 1 | 36.8–74.88px / 450 | 17.0231 | 3 |
| White headline line 2 | 36.8–74.88px / 450 | 18.8910 | 3 |
| Gradient headline | 36.8–74.88px / 450 | **3.2075** | 3 |
| Body | 16–17.6px / 400 | 11.4924 | 4.5 |
| Support | 14.4–14.88px / 400 | 7.9358 | 4.5 |
| Primary CTA label | 11.52px / 700 | 17.2944 | 4.5 |
| Secondary CTA label | 11.52px / 700 | 9.4788 | 4.5 |
| Desktop navigation | 11.68px / 700 | 15.6008 | 4.5 |
| Focus indicator with backing | 2px outline | 6.6026 | 3 |
| Focused header/menu/control text | Exact per-control sizes in raw records | 7.5418 | 4.5 conservative |
| Header/menu icons | Authored solid icon color | 18.1764 | 3 |

The worst gradient interior is WebKit 1024px, t=41.8 with pointer, at (389,354): foreground RGB(140,43,224), background RGB(16,15,23), coverage 0.9943. It meets the large-text threshold with modest headroom. All independent samples passed. The bounded sample set, coverage across complete responsive layouts, and stable dark scrim provide sufficient evidence for this release; an all-time/all-pointer/all-device guarantee is **not** claimed.

Thresholds follow [W3C text contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html), [non-text contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html), and [visible focus](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html). High-contrast labels identify the actions; decorative unfocused border contrast is not asserted as a necessary 3:1 control boundary.

Focus was measured at 1440, 1024, 768 and 390px in both engines against outline/text/icon-hidden screenshots while retaining the focused dark backing. Every measured target had `:focus-visible`. Actual keyboard traversal used Chromium Tab and macOS WebKit Option-Tab. Focused hero actions remain conspicuous against bright artwork. The dedicated contrast harness explicitly focuses menu close; **it is not evidence of automatic entry focus**. [Focus measurements](focus/focus-results.json), [WebKit desktop CTA](focus/webkit-1440-CTA-primary.png), [phone secondary CTA](focus/chromium-390-CTA-secondary.png).

**Inherited nit QA-NIT-001:** WebKit with reduced motion leaves focus on BODY when the menu opens, for both mouse and Enter activation. Independently built production main exhibits exactly the same behavior; normal motion and Chromium focus close automatically. Without manually focusing any menu element, the next Option-Tab reaches the close button with visible focus, subsequent traversal stays in the menu, Escape restores the opener, and activating Work closes the menu, clears inert and reaches `#work`. Header/navigation source is unchanged. This merits separate navigation maintenance but does not block this hero release: no new regression, no keyboard trap and controls remain reachable/visible. Screen-reader announcement behavior was not certified. [Baseline/candidate adjudication evidence](extra/results.json).

## Cost, claims, privacy and scope

Three alternating fresh-context samples per viewport, two-second windows, with other QA browser runs finished, compared exact baseline and candidate:

| Median | Baseline 1440 | Candidate 1440 | Baseline 768 | Candidate 768 | Baseline 390 | Candidate 390 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Local LCP ms | 140 | 104 | 72 | 60 | 52 | 48 |
| CLS | 0 | 0 | 0 | 0 | 0 | 0 |
| Hero draws/sec | 0 | 30.88 | 0 | 29.94 | 0 | 13.45 |
| Script ms/sec | 0.167 | 14.969 | 0.146 | 17.034 | 0.151 | 14.196 |

Every CLS sample was zero. Local LCP did not regress. Animation adds real recurring work versus the static baseline; measured cadence exceeds the nominal desktop 24fps scheduler setting. The observed absolute script cost is bounded and the static/pause gates work, so no material release-blocking performance regression is established. Script timing excludes much raster/GPU/compositor cost; no field CWV, slow-network/CPU certification, physical-device battery or thermal claim is made. [Raw results](performance-results.json), [summary](performance-summary.json).

JS rises 223,329→229,638 bytes (+6,309; gzip +2,421), CSS 63,505→67,307 (+3,802; gzip +725). Added desktop/mobile SVGs are 46,830/33,265 bytes (gzip 8,691/6,161). Responsive selection loads the relevant plate. Dependencies and lockfile are unchanged; npm ci reports two inherited tooling advisories, which this QA does not remediate or represent as a clean dependency certificate. [Asset hashes/weights](asset-weights.json).

Baseline→candidate scope is hero rendering, art, styles, tests/browser instruments and evidence. Remediation-only application changes are the image-readiness effect and focused CSS mask/scrim/backing changes; drawing/scheduler, copy, assets and controls are unchanged in that remediation. `src/content/site.ts`, header/navigation, package manifests, index source and tracked hosting/workflow files are unchanged. Rendered main text matched baseline in every performance pair. No fabricated research-data implication, metrics or public claims were introduced; the artwork is decorative, with no live data feed.

Changed text-file screening found no credential-format strings, home-directory paths or private-repository references; reviewed runtime code adds no analytics, storage, external fetches or pointer transmission. Recorded application requests were same-origin static resources. No Cloudflare/DNS changes appear in the diff and none were performed by QA; provider account audit history was not queried. [Scope/security review](scope-security-review.json), [readable baseline source diff](logs/baseline-source.diff) (blank context whitespace normalized; [exact raw gzip](logs/baseline-source.diff.gz)), [remediation diff](logs/remediation-source.diff).

## Handoff

No blocking defects found. The sole nit is the independently reproduced inherited WebKit menu focus limitation. Remaining limits: finite animation sampling, headless browser emulation, no exhaustive high-zoom/screen-reader/physical-device audit, synthetic hidden/Save-Data/core-count gates, no native background/battery/thermal certification, and no provider account history audit.

QA artifacts are separate from the product branch. Evidence-packaging failures are retained: nested diff whitespace and command-log EOF blank lines failed staging checks; repository `*.log` ignores also omitted command logs from the initial push. These did not affect product QA. Exact collected logs/diff are retained as gzip; readable copies normalize whitespace. Explicit QA-only force-add and every-file/index-blob equality close the packaging gaps; remote equality is required before completion. The two whitespace occurrences and proposed reusable guard are recorded in [packaging recovery](logs/persistence-packaging-recovery.json), with [initial missing-log readback](logs/persistence-readback-first.json). Preserve the prior FAIL and all remediation lineage. The evidence branch is based on production main and adds only this QA directory, avoiding any rewrite of `hero-visual-v2`. Publication of QA evidence is distinct from product release. Consult the subsequent exact remote readback receipt for report commit/tree/hash and registry reconciliation.

**NEXT_ACTION:** Founder may review the exact candidate and independent evidence for merge approval. Track QA-NIT-001 separately. No remediation or repeat QA is required solely to reconcile persistence; any new runtime-affecting candidate invalidates this verdict's applicability.

**MERGE_STATE: NOT MERGED. DEPLOYMENT_STATE: NOT DEPLOYED. DEPLOYMENT_RECOMMENDATION: Founder decision only; do not deploy.**
