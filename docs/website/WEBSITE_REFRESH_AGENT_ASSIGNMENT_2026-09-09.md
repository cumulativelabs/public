# Agent Assignment — Cumulative Labs Public Website Audit + Refresh

Date: September 9, 2026
Founder intent: Improve the public Cumulative Labs website without exposing private implementation details or disrupting the current critical path.

## First

Read the repository instructions and public website governance before taking action, including at minimum:
- AGENTS.md
- docs/website/PUBLIC_SAFETY.md
- docs/website/PUBLIC_COPY.md
- docs/website/VISUAL_DIRECTION.md
- docs/website/HOMEPAGE_REFRESH_DRAFT_2026-09-09.md

Treat existing public-safety, source-rights, evidence, review, and deployment gates as authoritative. This is a public repository. Do not copy private Cumulative OS material, prompts, architecture, internal repositories, agent structures, evaluations, data sources, infrastructure details, credentials, or codenames into it.

## Mission

Inspect the ACTUAL current public Cumulative Labs website and the implementation in cumulativelabs/public. Determine what should change to make the site clearer, more concrete, more credible, more polished, and easier to understand while preserving the approved Cumulative Labs identity.

The founder has approved exploration/drafting, NOT automatic production deployment.

## Required external/live-site work

Use a real browser against the production site and any canonical/alternate domain that the repository indicates should resolve. Record what actually happens; do not infer live behavior from source alone.

Check:
1. Whether the production site resolves correctly and whether HTTP/HTTPS/www/non-www variants redirect appropriately.
2. Desktop presentation at common widths.
3. Mobile presentation, especially iPhone-sized widths.
4. Hero legibility and whether a new visitor can understand what Cumulative Labs is within roughly the first screen.
5. Navigation, anchors, contact links, and footer behavior.
6. Visual hierarchy, spacing, text density, animation, and whether decorative effects compete with comprehension.
7. Accessibility basics: semantic heading order, keyboard navigation, visible focus, contrast, reduced-motion behavior, accessible labels, touch targets.
8. SEO/public metadata: title, description, canonical, robots, sitemap, favicon, Open Graph/Twitter preview assets, structured data if present/appropriate.
9. Performance: obvious blocking resources, image/asset weight, layout shift, mobile performance, and Core Web Vitals/Lighthouse where tooling permits.
10. Search/indexability of meaningful public content.
11. Broken links, console errors, failed network requests, or obvious deployment/configuration problems.
12. Whether the live site materially differs from the repository source.

Capture evidence for findings: screenshots, measured values, URLs tested, console/network errors, or source references as appropriate. Do not fabricate evidence.

## Messaging/product review

Evaluate the proposed refresh draft against the actual site and current state of Cumulative Labs/League Vector that is PUBLICLY SAFE to describe.

Primary desired visitor understanding:
- Cumulative Labs is the company/research organization.
- It is developing AI research systems around durable, verified knowledge.
- The private research system is underlying research, not a claim of a fully proven autonomous system.
- League Vector is the first applied product/proving ground.
- The work is in development.

Identify any draft wording that is inaccurate, overclaims, exposes private information, or is weaker than the current copy. Propose the smallest correction.

Do NOT publish internal Cumulative OS details simply to make the site more concrete. Concrete public explanation should come from safe concepts, approved product behavior, and demonstrable public examples.

## Concrete-example task

Determine the smallest defensible way to add one tangible example to the homepage.

Preferred order:
A. A real, already-public-safe League Vector capability/example if one exists and can be represented truthfully.
B. Otherwise an explicitly labeled illustrative cumulative-intelligence example.

For any League Vector preview, verify the underlying capability before presenting it as real. Never invent rankings, users, customers, metrics, accuracy, live status, research results, or operational capabilities.

## Implementation task

After the audit, implement a DRAFT refresh on the existing website-refresh-draft-2026-09-09 branch if you have access to it; otherwise create an appropriately named draft branch from current main and clearly report it.

Prefer the smallest coherent implementation that materially improves the site. Do not redesign the stack unnecessarily.

Target structure:
1. Hero
2. What We're Building
3. Why Cumulative Intelligence
4. Our Approach
5. Concrete Public-Safe Example / Product Preview
6. Principles
7. Contact / Closing

Preserve the approved visual identity in VISUAL_DIRECTION.md. Do not copy the internal Cumulative OS console wholesale into the public brand.

Implement responsive behavior and accessibility as part of the same coherent work packet rather than deferring obvious issues.

## Verification

Run all relevant repository tests, linting, type checks, build validation, and asset checks. Add or update tests when the changed behavior warrants them.

Then perform a second browser pass against the local/preview build at desktop and mobile widths. Compare before vs. after for:
- comprehension
- hierarchy
- responsive behavior
- accessibility
- performance regressions
- broken interactions

Do not mark the work complete merely because it builds.

## Independent QA

Do not self-approve production release. Prepare the draft for independent QA/public-safety review. QA must specifically check:
- substantive implementation quality
- handoff completeness
- evidence/support for claims
- state/provenance and whether concept material is being misrepresented as operational
- accidental leakage of private/internal information

## Required handoff to Lead/Founder

Return a concise report containing:
1. LIVE SITE STATUS — exact domains/URLs tested and what resolved.
2. TOP FINDINGS — ordered by impact.
3. WHAT YOU CHANGED — files/sections and why.
4. BEFORE/AFTER — screenshots or other visual evidence at desktop and mobile sizes.
5. PUBLIC CLAIM REVIEW — anything softened, rejected, or requiring founder approval.
6. TECHNICAL QA — tests/build/lint/accessibility/performance results.
7. REMAINING BLOCKERS — only real blockers.
8. RECOMMENDATION — ready for independent QA, needs another implementation pass, or blocked.
9. EXACT BRANCH/COMMIT/PR — durable handoff references.

Do not deploy to production and do not activate/change the custom domain without explicit Founder approval.
