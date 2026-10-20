# Home desktop row alignment QA — 2026-10-20

- Desktop (>900px): start spans schedule/highlights rows; search and personal shortcuts share the final row. Wrappers use display:contents only on desktop. Actions grow with their shared rows.
- DOM order remains schedule, start, search, highlights, personal; <=900px keeps the existing grouped layout.
- Public schedule code, API, 30-minute cache, private calendar filtering, registration and deletion are unchanged. CSS cache version bumped.
- Local Chrome headless browser: 360/390/430/768/1280 passed; no horizontal overflow; desktop lower edges align within 2px; 16px gap below actions; schedule precedes actions on narrow screens; 2 visible events <=767px, 3 otherwise; published-only mock verified.
- Browser interactions: favorites add/persist across reload/remove, keyboard tabs, SQL search, actual calendar date-link navigation passed. No page errors. Five full-page screenshots inspected at desktop/mobile representative sizes.
- node --test tests/portal-dashboard.test.mjs tests/schedule-*.test.mjs: 4/4 passed, including public-only integration and registration/deletion protection.
- Broader node --test tests/*.test.mjs: 37 passed, 8 failed. Unmodified HEAD 2dc5755 reproduces the same 8 failures (analytics 2, content-cleanup, docs-hub, job-guide, performance-architecture, portal-redesign, portal-ux). These pre-existing unrelated failures were not changed.
- Browser uses mocked public events for deterministic preview counts; no live calendar events were created or deleted.
