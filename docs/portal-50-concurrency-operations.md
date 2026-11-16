# Portal concurrent-user readiness — 2026-11-16

## What is deployed
- Single portal-auth browser module version across common pages and admin pages; reuse of authorized user ID in in-page modules. Server-side RLS / session enforcement remains authoritative.
- Periodic visibility access checks deduplicated and limited to three-minute timer polling, with a one-minute minimum interval.
- Learning attempts inserted in batches of up to 25 using `ON CONFLICT DO NOTHING` on `(user_id,client_attempt_id)`. The browser's Web Locks API serializes queue operations between tabs and applies jittered exponential retry; no valid event is discarded to enforce the 500-record limit.
- `public-calendar-cache` Edge Function (unauthenticated **public data only**) fetches and filters a published projection of Google Apps Script events, reuses a five-minute in-process snapshot and coalesces simultaneous upstream calls. It falls back to a one-hour-old *last verified public* snapshot only when upstream fails. Normal browsers use the Edge gateway; post-registration administrator confirmation still contacts the direct source.
- Shared published alumni API payloads cached for 30 seconds per warm isolate and in-flight requests coalesced; detail profile lookup by indexed `user_id` or legacy ID. Faculty summary calls for the same grade/period are coalesced.
- Admin homepage shows protected Postgres connection and error metrics. HTTP 429/502/503 must be reviewed in Supabase Gateway Logs and are **not inferred** from DB counters.
- Five targeted foreign-key indexes and defense-in-depth RLS added for private academic status history.

## Monitoring
- [Admin health](https://portal.k-bigdata.kr/admin/index.html): connections, active queries, attempts, email failures and study errors. Refresh every five minutes while the admin tab is open.
- [Supabase API logs](https://supabase.com/dashboard/project/zjsindkakjfzmjgrkaou/logs/edge-logs): HTTP 429, 502 and 503, including origin time.
- [Supabase reports](https://supabase.com/dashboard/project/zjsindkakjfzmjgrkaou/reports/database): DB connections and database metrics.

## Staging-only 50-user performance exercise
The k6 scenario is located at `tests/load/staging-50-users.js`. It must **never** run with live student credentials or against `portal.k-bigdata.kr` or production Supabase project `zjsindkakjfzmjgrkaou`. The script blocks these hosts.
1. Provision an isolated staging portal URL and isolated staging Supabase project containing disposable, approved student records. Do not copy real student PII into staging.
2. Configure the repository's GitHub Actions secrets: `STAGING_BASE_URL`, `STAGING_SUPABASE_URL`, `STAGING_SUPABASE_ANON_KEY` (publishable), and `STAGING_TEST_USERS_JSON` (JSON array of at least 50 distinct `{email,password}` test accounts).
3. Open Actions → **Staging 50-user load validation** → Run workflow; tick `confirm_staging_only` and select 10, 25, 50, or 75 concurrent users.
4. Stages ramp from 10 through 25 to the selected level, hold nine minutes, then ramp down. The scenario tests static pages, login, portal session, reading progress, idempotent batched attempt writes, room schedule, study start/end and public calendar.
5. Candidate acceptance criteria: no duplicate attempts/reservations; no unrecoverable write loss; HTTP errors <1%; p95 under 1 second; p99 under 3 seconds at 50 VUs. Interpret failures against staging infrastructure capacity.

## Remaining external deployment dependency
The Apps Script `doPost` remains a separately deployed public calendar registration endpoint. Although browser **reads** are now cached, it cannot be made truly administrator-only by hiding the UI or gating calls from the portal. Restricting writes requires **re-deploying** the external Google Apps Script with a server-verifiable authentication token, then moving authenticated mutations to a Supabase Edge Function. Do not claim this endpoint is secured until that deployment is independently verified.

## Rollback
- Student/static UI: revert the frontend merge commit through a reviewed PR; keep the non-destructive DB indexes and RLS.
- Calendar: restore the prior `js/schedule.js` and `js/home-schedule.js` code and pages' versioned script URLs; the original Apps Script endpoint remains independently deployed.
- Learning queue: restore previous client code while preserving pending `localStorage` records. **Do not clear storage or rewrite `learning_attempts`**, since the unique client attempt IDs support safe replay.
- Admin summary DB function is additive; removing it is not necessary to roll back the UI.
