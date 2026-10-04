# 11-role guide QA — 2026-10-04

Baseline main: cbf0ea33bd8fe0a96e1a7e9e6a2817f95cb7e15c.

## Implementation review

Existing 7 IDs, query URLs, shared portal layout and progressive disclosures retained. New IDs: system, qa, mobile, analyst. Four sector groups replace the previous core/associated classification. Each role has at least 3 implementable projects, 5–7 checklist items, interview topics and existing certification references. The seven comparison pairs render six dimensions from the same jobs catalogue, avoiding parallel content copies.

Backend JPA/MyBatis are optional implementation choices; frontend includes TypeScript and one UI framework; cloud specifies one platform and an end-to-end request path; DevOps distinguishes Git from collaboration platforms; data engineering emphasizes quality/idempotency/reprocessing; AI has three optional tracks; cloud-native explains hiring-title variation and optional MSA.

## Automated tests

`node --test tests/*.test.mjs`: 14 files pass. Updated job-guide and portal-redesign assertions permit the four authorized additions while preserving every baseline ID. Tests verify all role/certificate/interview references, 7 comparisons, field coverage, minimum project count, targeted aliases, identity helpers and metadata canonical. Other interview/practical/certificate/document tests continue to pass.

## Browser QA

Local http://127.0.0.1:8765/ via in-app browser viewport emulation.

| Width | List + 11 direct role URLs | Horizontal overflow |
|---|---|---|
|320×568|pass|none|
|360×800|pass|none|
|390×844|pass|none|
|768×1024|pass|none|
|1440×900|pass|none|

60 viewport checks. Every detail had a role-specific title and canonical; visible H1 verified in QA detail. Browser console errors: none observed.

- Quality filter shows QA only; card opens QA and browser back returns the list.
- Server management search includes the system role; expanded automated tests cover SE / QA / SDET / Dart / iOS / Pandas / BI and all aliases.
- AI shows the three folded tracks and the selective-preparation notice.
- System interview jump opens its parent disclosure; Linux link opens actual existing questions, not an invented category.
- Invalid ID displays the existing error notice and the usable list.
- Comparison opens two role cards with 12 total definition rows; mobile has no overflow.
- Shared menu, home navigation, reference links and certificate URLs retained.

## SEO policy and limitations

No sitemap or robots.txt existed in the source. No new indexable sitemap or crawl block was added. jobs.html remains noindex,nofollow under portal policy. Role title/description/canonical/OG and WebPage with Occupation JSON-LD update after JS execution. This does not guarantee indexing or previews in crawlers that do not execute JS; the page is deliberately not indexable.

Operating-domain browser access remains restricted by saved browser policy; it was not bypassed. Local QA and GitHub Pages deployment success must not be presented as a live custom-domain visual check. Physical iOS/Android verification is still a follow-up.

## Source checks

- Flutter architecture/testing: https://docs.flutter.dev/app-architecture and https://docs.flutter.dev/testing
- Playwright test principles: https://playwright.dev/docs/best-practices
- pandas aggregation: https://pandas.pydata.org/docs/user_guide/groupby.html

These are technical learning references, not proof that every employer requires these tools. The official-document hub itself was not expanded with additional libraries or certification types.
