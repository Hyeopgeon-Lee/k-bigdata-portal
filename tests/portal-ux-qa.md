# Whole portal UX QA — 2026-10-04

Baseline: main c64b8e2804b2a3d3160091fdcf6b8560e03af9f2.
Target: seven portal HTML pages only. No external service source changed.

## Automated

`node --test tests/*.test.mjs`: 14 test files passed, 0 failures / skipped.
Includes stable data IDs and service URLs, cross references, practical persistence / SQL / Python execution, delayed reveal boundaries, interview paging / modes / filters, noindex and local resources. New portal-ux test verifies cross navigation, quick actions, practical journey companion, grouped synonyms, folded project steps and shared HTML resources.

## Browser responsive matrix

Local static server: http://127.0.0.1:8765/ . Browser viewport emulation, not physical iOS/Android devices.

| Viewport | Pages checked | Whole-page overflow |
|---|---|---|
|320×568|all seven|none|
|360×800|all seven|none|
|375×812|all seven|none|
|390×844|all seven|none|
|412×915|all seven|none|
|430×932|all seven|none|
|768×1024|all seven|none|
|1024×768|all seven|none|
|1440×900|all seven|none|
|1920×1080|all seven|none|

Detail samples for the matrix: DevOps and information processing engineer. Additional 390px checks: all seven job IDs and four core certificate IDs, no overflow / missing H1. The three home start CTAs fit inside 320×568, 360×800 and 390×844. Menus close on Escape; project and job hash targets open their parent details. Browser console error log: none observed.

## Learning flows

- A: practical daily session opened; answer confirmed before 60 seconds; reveal disabled. Reload preserved answer / confirmation / remaining time. After real elapsed 60 seconds, reveal worked, wrong answer was stored and next problem hid the answer. Existing unit suites cover retry, SQL self grading, draft and storage.
- B: interview home → one question → core answer / keyword chips → another question. Detailed explanation, follow-ups and reference remained independently folded. Ten-question simulation finished with 10 unique questions and completion actions.
- C: DevOps overview → CKA → Docker / Kubernetes / K-PaaS direct documentation links. Existing related interview links retained. Job jump opened folded documentation section.
- D: engineer overview contains practical exam-specific CTA; query parameters remain compatible.
- E: project start CTA → first step disclosure; all original 11 steps retained. Next actions link official docs, jobs, interview and portfolio.
- F: Kubernetes search showed docs, certifications, interviews, jobs and blog groups; first four results per group and expansion controls. Docs list starts at 16, expands to 32; Korean synonym search works.

## Limits

- Operating portal domain has a saved browser access restriction. It was not bypassed. Local source verification does not establish live custom-domain rendering; check the deployed portal separately when access is allowed.
- External service URLs and official-document URLs were preserved; this UX task did not retest every external site's current response.
- Physical Android/iOS keyboard and safe-area behavior need device smoke testing. No new service worker or stale-content cache was introduced.
- Data preserved: 7 roles, 12 certificates, 40 documents, 150 interviews, 220 practical learning questions. These counts are not a claim of 258 verified reconstructed exam questions.
