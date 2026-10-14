# BooknPlay Production Roadmap

Last audited: 2026-10-06

## Production Readiness Score

Frontend: 58%  
Backend: 42%  
Database: 25%  
Security: 18%  
Payments: 20%  
Infrastructure: 8%  
Testing: 25%

Overall production readiness: 28%

The score uses an evidence checklist for each area: complete control = 1 point, partial or unverified control = 0.5, and failed or absent control = 0. A critical P0 failure caps its category at 50%. The overall score is the rounded equal-weight average of the seven category scores. A passing build alone does not make an area production-ready.

## Audit Scope and Evidence

This audit covers the current working trees, including uncommitted changes, in both repositories:

- Frontend: `C:\Users\Musharaf\Downloads\booknplay frontend\booknplay-frontend`
- Backend: `C:\Users\Musharaf\Downloads\booknplay\booknplay`
- Intended public domain: `https://booknplay.lk`
- Audit date and timezone: 2026-10-06, Asia/Colombo

No deployment, credential change, production data operation, or application-code change was performed. Live PayHere, SMSLenz, DNS, hosting, physical-device, and browser-farm checks remain **⚠️ NEEDS VERIFICATION**.

### Checks executed

| Check | Result | Evidence |
| --- | --- | --- |
| Frontend production build | ✅ Passed | `npm run build`; no source maps emitted. Largest chunk: `react-apexcharts` 954.13 kB minified / 273.92 kB gzip. |
| Frontend lint | ❌ Failed | `npm run lint`: 5 errors and 2 warnings. |
| Frontend tests | ⚠️ Timed out | `npm test -- --reporter=dot` did not complete within 120 seconds. |
| Frontend production dependency audit | ✅ Passed | `npm audit --omit=dev`: 0 vulnerabilities across 137 production dependencies. |
| Frontend full dependency audit | ❌ Failed | 14 advisories: 1 critical, 10 high, 2 moderate, 1 low; the critical advisory is in the Vitest development toolchain. |
| Backend tests | ❌ Failed | Surefire reports: 116 tests, 3 failures, 5 errors, 0 skipped. |
| Backend test isolation | ❌ Failed | `@SpringBootTest` connected to local MySQL 8.0.42 and Hibernate issued schema-altering statements because no test profile exists. No rollback was attempted. |
| CORS probe | ❌ Failed | A preflight from `https://evil.example` was accepted with `Access-Control-Allow-Credentials: true`. |
| Local public API | ✅ Responded | `GET /api/v1/public/sports` returned HTTP 200. |
| Swagger exposure | ❌ Public | `GET /swagger-ui/index.html` returned HTTP 200 without authentication. |
| Health endpoint | ❌ Not established | No Actuator dependency or production-safe health exposure is configured. |
| Browser/device testing | ⚠️ NEEDS VERIFICATION | No Chrome/Safari/Edge/Android/iPhone matrix was executed. |

# Production Readiness & Launch Roadmap

# 🚨 P0 — MUST FIX BEFORE PRODUCTION

### PROD-P0-001 — Remove and rotate committed secrets

**Area:** Security / Backend / Source Control  
**Status:** ❌ Not Started  
**Priority:** P0  
**Risk:** Critical

**Current situation**

The tracked default backend configuration contains literal database, JWT-signing, mail username, and mail password values. A tracked debug log is also present. Deleting values only from the latest revision would not remove them from Git history.

**Evidence**

- Backend `src/main/resources/application.properties`
- Backend `debug-5b0412.log`
- Backend `.gitignore`

**Problem**

Anyone with repository or history access may be able to use exposed credentials, forge JWTs, access mail, or connect to the database. TRACE bind logging and committed logs increase the chance of personal or authentication data entering source control.

**Required change**

Replace literal secrets with environment or secret-manager references; rotate the database password, JWT secret, and mail credentials; stop tracking the debug log; scan all Git history and artifacts; purge exposed values using a coordinated history-rewrite procedure; and update ignore rules and secret scanning. Never record replacement values in this roadmap.

**Verification**

Secret scanning passes across the full history, the affected credentials have documented rotation timestamps, startup succeeds using injected secrets, old credentials fail, and no tracked file contains a live secret.

### PROD-P0-002 — Introduce strict environment profiles and production URL guards

**Area:** Backend / Frontend / Infrastructure  
**Status:** ❌ Not Started  
**Priority:** P0  
**Risk:** Critical

**Current situation**

There is one backend `application.properties`, no production profile, and several localhost or PayHere sandbox defaults. The frontend silently falls back to `http://localhost:8080/api/v1` when `VITE_API_BASE_URL` is absent. User-facing checkout pages explicitly say “sandbox.”

**Evidence**

- Frontend `src/lib/axios.js`, `src/utils/mediaUrl.js`, `.env.example`
- Frontend `src/pages/CheckoutPage.jsx`, `src/pages/PaymentReturnPage.jsx`, `src/pages/account/HelpPage.jsx`
- Backend `src/main/resources/application.properties`
- Backend `PayHereConfigGuard.java`, `PaymentServiceImpl.java`, `PayHereRefundClientImpl.java`

**Problem**

A production build can call a visitor's localhost, use HTTP from an HTTPS page, or direct money flows to sandbox endpoints. Missing configuration can degrade silently rather than stopping deployment.

**Required change**

Create explicit dev, test, and prod profiles. Keep safe local defaults only in dev. Require production database, JWT, frontend/API origins, upload storage, mail, PayHere, and SMS configuration. Make production startup and the frontend build fail when required values are absent, non-HTTPS, localhost, ngrok, or sandbox values.

**Verification**

The prod profile starts only with a complete production environment; a production frontend build without its API URL fails; repository-wide production scans find no active localhost/ngrok/sandbox dependency; and an HTTPS deployment has no mixed content.

### PROD-P0-003 — Replace automatic schema and startup data mutation with migrations

**Area:** Database / Backend  
**Status:** ❌ Not Started  
**Priority:** P0  
**Risk:** Critical

**Current situation**

Hibernate uses `ddl-auto=update`. Application runners execute raw `ALTER TABLE`, scan and mutate user phones, activate draft/pending venues with courts, and overwrite subscription plan definitions on every startup.

**Evidence**

- Backend `src/main/resources/application.properties`
- `BookingSlotUniqueSchemaFix.java`
- `BookingCustomerNullableSchemaFix.java`
- `UserPhoneBackfillRunner.java`
- `CatalogDataSeeder.java`
- `SubscriptionPlanSeeder.java`

**Problem**

Starting or testing the application can mutate schema and business data without review. Venue approval can be bypassed, admin-edited plan pricing can be overwritten, and failed deployments cannot be reasoned about or rolled back safely.

**Required change**

Adopt Flyway with a baseline of the real schema; convert both schema-fix runners and one-time backfills into versioned, reviewed migrations; set production Hibernate mode to `validate`; remove automatic venue activation; make reference-data seeding idempotent and profile-scoped; and preserve admin-managed plan values unless changed through an explicit migration or admin action.

**Verification**

A copy of production schema upgrades from baseline using Flyway, repeated starts cause no DDL or business-data changes, pending venues remain pending, plan edits survive restarts, and migration rollback/forward-fix procedures are rehearsed.

### PROD-P0-004 — Isolate tests from developer and production databases

**Area:** Testing / Database / CI  
**Status:** ❌ Not Started  
**Priority:** P0  
**Risk:** Critical

**Current situation**

There is no `src/test/resources` database configuration. The Spring context test inherited the default MySQL configuration and issued `ALTER TABLE` statements during this audit.

**Evidence**

- Backend `src/test/java/lk/booknplay/BooknplayApplicationTests.java`
- Backend Surefire report `target/surefire-reports/TEST-lk.booknplay.BooknplayApplicationTests.xml`
- Backend `src/main/resources/application.properties`

**Problem**

An automated test can corrupt a developer, staging, or production-like database. CI cannot be trusted or safely repeated.

**Required change**

Create an isolated test profile using a disposable database with schema behavior matching MySQL where required. Force tests to refuse non-test JDBC URLs, disable production runners in tests, and execute integration tests against an ephemeral MySQL container when dialect accuracy matters.

**Verification**

The complete backend suite runs twice against a newly created disposable database, no external database receives connections or schema changes, and CI destroys the test database after completion.

### PROD-P0-005 — Restrict CORS and public attack surface

**Area:** Security / Backend  
**Status:** ❌ Not Started  
**Priority:** P0  
**Risk:** Critical

**Current situation**

CORS allows every origin pattern with credentials, headers, and mutation methods. Swagger is publicly reachable. The generic webhook route remains public even though its service currently rejects calls.

**Evidence**

- Backend `CorsConfig.java`
- Backend `SecurityConfig.java`
- Backend `PaymentWebhookController.java`
- Read-only preflight probe accepting `https://evil.example`

**Problem**

Untrusted websites can make credentialed cross-origin requests, and public API metadata increases reconnaissance exposure. Broad public webhook routing expands the attack surface.

**Required change**

Allow only `https://booknplay.lk` and explicitly approved HTTPS subdomains in production; keep local origins dev-only; remove unused public webhook routes; restrict or disable Swagger in production; and add automated CORS/security route tests.

**Verification**

Approved origins pass preflight, hostile origins receive no CORS permission, credentialed requests are limited to approved origins, Swagger is unavailable publicly, and only required webhook endpoints remain anonymous.

### PROD-P0-006 — Complete PayHere live configuration and domain verification

**Area:** Payment / Infrastructure  
**Status:** ⚠️ Needs Verification  
**Priority:** P0  
**Risk:** Critical

**Current situation**

Checkout, refund, configuration guidance, and visible UI are designed around PayHere sandbox. Production merchant registration, live keys, live endpoints, and `booknplay.lk` URLs are not represented by a verified production profile.

**Evidence**

- Backend `src/main/resources/application.properties`
- Backend `payhere.sandbox.env.example`
- Backend `PayHereConfigGuard.java`, `PayHereCheckoutController.java`
- Frontend checkout, return, help, and booking hooks

**Problem**

Real payments may fail, be sent to sandbox, or return to unreachable/local URLs. Merchant-secret/domain mismatch will invalidate hashes and callbacks.

**Required change**

Provision and verify the live merchant account and refund API application. Configure live checkout/OAuth/refund endpoints, live merchant ID and secrets, registered domain, HTTPS notify URL, and exact return/cancel URLs. Separate sandbox and live config and copy. Do not place private values in Vite variables.

**Verification**

PayHere confirms the production domain; configuration guards identify live mode; one approved low-value live success, failure, cancellation, duplicate notification, and refund test completes with reconciled records.

### PROD-P0-007 — Make PayHere webhook validation authoritative and idempotent

**Area:** Payment / Backend / Database  
**Status:** ❌ Not Started  
**Priority:** P0  
**Risk:** Critical

**Current situation**

Booking and subscription callbacks verify the PayHere signature but calculate it using the merchant ID supplied by the payload and do not compare callback merchant ID, amount, or currency with stored values. Duplicate-success checks are status-based and transitions are not protected by a row lock/version.

**Evidence**

- Backend `PaymentServiceImpl.processPayHereNotify`
- Backend `OwnerSubscriptionServiceImpl.confirmPayHereNotify`
- Backend `PayHereHash.java`
- Backend `Payment.java`, `SubscriptionPayment.java`

**Problem**

A valid callback for an incorrect amount/currency or an unexpected merchant configuration can confirm a booking or paid plan. Concurrent/replayed callbacks can race and create inconsistent state.

**Required change**

Require the configured merchant ID, parse amounts as decimal minor-safe values, require exact stored amount and currency, validate order ownership and expected current state, lock the payment/order row, store a unique gateway transaction ID and webhook event record, and return idempotent success for exact duplicates while rejecting conflicting replays.

**Verification**

Integration tests cover invalid signature, wrong merchant, under/overpayment, wrong currency, unknown order, duplicate callback, conflicting replay, concurrent callbacks, and success after restart for both bookings and subscriptions.

### PROD-P0-008 — Close the late-webhook double-booking race

**Area:** Booking / Database / Payment  
**Status:** ❌ Not Started  
**Priority:** P0  
**Risk:** Critical

**Current situation**

Booking creation uses serializable transactions, a pessimistic court lock, overlap checks, and customer idempotency. PayHere confirmation does not acquire the same court lock. After a hold expires, a new booking and a late success callback can race. The generated unique key represents the booking envelope, not each discrete selected slot.

**Evidence**

- Backend `BookingServiceImpl.createBooking`
- Backend `OwnerCalendarServiceImpl.createWalkIn`
- Backend `CourtRepository.findByIdWithLock`
- Backend `BookingHoldExpiryJob.java`
- Backend `PaymentServiceImpl.hasCompetingHold` and `confirmPaid`
- Backend `BookingSlotUniqueSchemaFix.java`, `BookingSlot.java`

**Problem**

Concurrent transactions can confirm overlapping bookings, especially for gapped or partially overlapping selections, causing financial and operational harm.

**Required change**

Acquire the same court lock for create, expiry-sensitive confirmation, owner walk-in, and relevant status transitions. Model bookable slot identity in migration-managed columns that support a database uniqueness guarantee for active holds/confirmed bookings. Define how late paid callbacks are atomically failed and queued for refund.

**Verification**

A MySQL concurrency test sends simultaneous customer/customer, customer/walk-in, expired-hold/new-booking, and late-webhook/new-booking attempts; exactly one active reservation remains per court slot and every charged loser has a recoverable refund record.

### PROD-P0-009 — Reconcile cancellation policy and refund semantics

**Area:** Payment / Backend / Frontend / Product  
**Status:** ❌ Not Started  
**Priority:** P0  
**Risk:** Critical

**Current situation**

The frontend promises cancellation within one hour after booking for a full refund and says cancellation is unavailable afterward. It stores `{hoursBeforeDeadline: 1, refundPercentage: 100}`. The backend interprets the hour as one hour before the booking start and then applies the percentage after that deadline, allowing a full refund until play begins. Backend code and tests also support partial refunds while owner UI says PayHere partial refunds are unavailable.

**Evidence**

- Frontend `BookingPolicyForm.jsx`, `bookingPolicy.js`, `CheckoutPage.jsx`, `HelpPage.jsx`
- Backend `CancellationPolicy.java`, `CancellationPolicyRequest.java`
- Backend `BookingServiceImpl.quoteBooking` and `buildCancellationPreview`
- Backend `PayHereRefundCancelTest.java`

**Problem**

Customers, owners, and the payment implementation apply different money rules. This creates incorrect refunds, misleading checkout terms, and legal/support exposure.

**Required change**

Obtain one approved business rule, name every timestamp unambiguously, represent it in one server-authoritative policy model, snapshot it onto each booking, enforce it identically in quote/preview/cancel, and generate all frontend wording from the returned policy. Remove partial-refund behavior if PayHere/business policy does not support it.

**Verification**

Contract tests cover boundary instants, timezone, before/after deadline, no-show, owner cancellation, disabled cancellation, and legacy snapshots; displayed wording and charged/refunded amounts match the same policy.

### PROD-P0-010 — Add durable refund state and recovery

**Area:** Payment / Backend / Operations  
**Status:** ❌ Not Started  
**Priority:** P0  
**Risk:** Critical

**Current situation**

Normal cancellation calls PayHere before persisting cancellation. Conflict refunds do not create a durable refund record, and a failed automatic refund records only a failed payment state. Refund status is stored as free text with no retry scheduling or reconciliation workflow.

**Evidence**

- Backend `BookingServiceImpl.cancelConfirmedBooking`
- Backend `PaymentServiceImpl.failAndRefundConflict`
- Backend `PayHereRefundClientImpl.java`
- Backend `Refund.java`

**Problem**

A timeout after PayHere accepts a refund can leave the platform uncertain, cause a duplicate retry, or lose the obligation to return money. Operations cannot reliably identify or recover failures.

**Required change**

Create a refund state machine (`REQUESTED`, `PROCESSING`, `SUCCEEDED`, `FAILED`, `REQUIRES_RECONCILIATION`), persist the intent before the external call, use a stable idempotency/reference strategy, capture provider responses safely, retry only known-safe failures, and expose failed/reconciliation queues to admin operations.

**Verification**

Tests simulate provider success, rejection, timeout-before-response, timeout-after-acceptance, duplicate cancellation, process crash, and retry; no duplicate refund occurs and every obligation is queryable.

### PROD-P0-011 — Harden authentication, abuse controls, errors, and logs

**Area:** Security / Backend  
**Status:** ❌ Not Started  
**Priority:** P0  
**Risk:** Critical

**Current situation**

OTP generation, hashing, expiry, cooldown, and attempt limits exist, but there is no implemented IP/phone/user rate-limit filter despite Bucket4j dependencies. Password reset does not revoke existing refresh tokens. Refresh tokens are stored plaintext. Generic exception responses can expose internal exception messages, and Hibernate bind values are logged at TRACE.

**Evidence**

- Backend `OtpServiceImpl.java`, `PhoneAuthServiceImpl.java`
- Backend `RefreshToken.java` and auth service implementations
- Backend `GlobalExceptionHandler.java`
- Backend `src/main/resources/application.properties`
- Backend `pom.xml`

**Problem**

Attackers can brute-force or flood public endpoints, retained sessions survive password reset, stolen database tokens can be used directly, and internal/PII values may appear in responses or logs.

**Required change**

Implement distributed rate limits and safe proxy-IP handling; rotate and hash refresh tokens; revoke all sessions after password reset and security-sensitive account changes; return stable public error codes without internal messages; disable SQL/bind logging in production; sanitize authentication/provider logs; and configure explicit CSP, HSTS, Referrer-Policy, frame, and content-type headers at the edge/backend.

**Verification**

Security tests prove rate limits, session revocation, token rotation/reuse detection, safe 4xx/5xx bodies, and absence of passwords, OTPs, tokens, SQL parameters, or secrets from logs.

### PROD-P0-012 — Establish a repeatable, observable, recoverable release platform

**Area:** Infrastructure / Testing / Operations  
**Status:** ❌ Not Started  
**Priority:** P0  
**Risk:** Critical

**Current situation**

There is no Docker/deployment definition, CI workflow, health endpoint, backup configuration, restore evidence, monitoring setup, or documented production rollback. Backend tests fail; frontend lint fails; frontend tests time out.

**Evidence**

- No `.github/workflows`, Dockerfile, Compose, hosting, or migration files in either repository
- Frontend lint/test/build results in this audit
- Backend Surefire reports in this audit
- Backend `pom.xml` has no Actuator dependency

**Problem**

The application cannot be released reproducibly or safely monitored and recovered. Failed checks do not prevent deployment, and there is no proof that data can be restored.

**Required change**

Provision HTTPS frontend/API hosting, private managed MySQL with least privilege and TLS, persistent media storage, automated encrypted backups and restore drills, safe health/readiness endpoints, uptime/error/payment/refund/SMS monitoring, CI gates, immutable artifacts, smoke tests, and a rollback procedure. Fix all failing checks before enabling deployment.

**Verification**

CI passes from a clean clone, deployment uses the same tested artifacts, health and alerts work, a backup restores into an isolated database, smoke tests pass, and a staged rollback restores the prior application without blindly reversing migrations.

# 🟠 P1 — FIX BEFORE OR IMMEDIATELY AFTER LAUNCH

### PROD-P1-001 — Restore clean frontend quality gates

**Area:** Frontend / Testing  
**Status:** ❌ Not Started  
**Priority:** P1  
**Risk:** High

**Current situation**

Lint reports five errors and two warnings, including synchronous state updates in effects, an unused import, and a constant nullish expression. Vitest does not terminate within two minutes. The full npm audit reports 14 development-tool advisories.

**Evidence**

- `LinkPhonePanel.jsx`, `FavouritesPage.jsx`, `AdminPlansPage.jsx`
- `OwnerCalendarPage.jsx`, `OwnerProfilePage.jsx`, `OwnerTeamPage.jsx`
- `package.json`, `package-lock.json`, `src/test/setup.js`

**Problem**

CI cannot provide fast, trustworthy feedback, and test/lint regressions can ship unnoticed.

**Required change**

Fix lint findings, identify the hanging suite/open handle, set bounded test timeouts, upgrade vulnerable dev dependencies without force-fixing, and pin a stable Node/npm version in CI.

**Verification**

Lint, all frontend tests, build, and full audit policy complete reliably from a clean install on Windows and CI Linux.

### PROD-P1-002 — Replace process-local checkout sessions and add provider timeouts

**Area:** Backend / Payment / Reliability  
**Status:** ❌ Not Started  
**Priority:** P1  
**Risk:** High

**Current situation**

PayHere checkout sessions live only in a `ConcurrentHashMap`; restart or multi-instance routing loses them. `RestClient.Builder` has no explicit connect/read timeouts.

**Evidence**

- Backend `PayHereCheckoutStore.java`
- Backend `HttpClientConfig.java`
- Backend `SmsLenzServiceImpl.java`, `PayHereRefundClientImpl.java`

**Problem**

Checkout can break during deployment, and provider calls can occupy request/transaction threads indefinitely.

**Required change**

Persist short-lived checkout state or generate it safely from durable records; make tokens single-purpose and expiring; add bounded provider timeouts; and define retry rules that never duplicate payments/refunds/SMS.

**Verification**

Checkout survives restart and multi-instance routing, expired/replayed tokens fail safely, and provider timeout tests finish within configured limits.

### PROD-P1-003 — Make notifications durable and observable

**Area:** Backend / Notifications  
**Status:** ❌ Not Started  
**Priority:** P1  
**Risk:** High

**Current situation**

Booking SMS/email failures are caught so they do not roll back bookings, but sends are synchronous and failures are only logged. One notification unit test disagrees with current walk-in SMS behavior.

**Evidence**

- Backend `NotificationServiceImpl.java`
- Backend `NotificationServiceImplTest.java`
- Backend `SmsLenzServiceImpl.java`

**Problem**

Slow providers increase API latency, and failed confirmations have no retry or operations queue.

**Required change**

Commit booking/payment state first, enqueue notification jobs after commit, record delivery attempts/status, use bounded retries and dead-letter handling, and resolve the intended walk-in behavior in code and tests.

**Verification**

Booking succeeds when providers are down, failed notifications are visible and retryable, duplicates are suppressed, and the notification suite passes.

### PROD-P1-004 — Secure and externalize media storage

**Area:** Backend / Infrastructure / Security  
**Status:** ❌ Not Started  
**Priority:** P1  
**Risk:** High

**Current situation**

Uploads are stored on local disk, validated only by the client-supplied MIME type, and served publicly. Persistence, backup, malware/content verification, cache policy, and orphan cleanup are not defined.

**Evidence**

- Backend `FileStorageServiceImpl.java`, `WebConfig.java`
- Backend upload controllers and multipart settings

**Problem**

Deployments can lose media, multiple instances can disagree, and disguised or oversized content can create security/availability issues.

**Required change**

Use persistent object storage or a backed shared volume; verify magic bytes and decoded dimensions; re-encode images; set safe content/cache headers; add quotas and lifecycle cleanup; and back up metadata/storage consistently.

**Verification**

Valid images survive redeploys, invalid/polyglot files are rejected, multi-instance reads agree, and restore testing includes media.

### PROD-P1-005 — Review indexes, query bounds, and pagination

**Area:** Database / Performance  
**Status:** ⚠️ Needs Verification  
**Priority:** P1  
**Risk:** High

**Current situation**

Some booking/OTP/quote indexes and paginated APIs exist, but most entity query dimensions have no explicit migration-managed indexes. Calendar, earnings, holds, startup backfills, galleries, payouts, and homepage versions use unbounded lists. Request page size has no documented cap.

**Evidence**

- Backend repositories, especially `BookingRepository.java`, `VenueRepository.java`, and calendar/maintenance repositories
- Backend entity `@Table` declarations
- `spring.jpa.open-in-view=false`

**Problem**

Data growth may cause scans, memory spikes, lock contention, and public API abuse.

**Required change**

Capture real query plans; add only indexes justified by predicates and ordering; cap page size/date ranges; batch hold expiry/backfills; review N+1 behavior; and load-test representative data volumes.

**Verification**

EXPLAIN plans use intended indexes, endpoints enforce bounds, query counts are measured, and p95 latency meets an agreed capacity target.

### PROD-P1-006 — Improve frontend failure handling and session containment

**Area:** Frontend / Security / UX  
**Status:** 🟡 In Progress  
**Priority:** P1  
**Risk:** High

**Current situation**

Axios has a timeout, refresh queue, and 401 flow; checkout handles conflict/gone errors. Other status/network behavior is page-specific. Access and refresh tokens are duplicated in persisted Zustand and localStorage, increasing XSS exposure.

**Evidence**

- Frontend `src/lib/axios.js`, `src/stores/authStore.js`, `src/lib/queryClient.js`
- Frontend hooks and mutation handlers

**Problem**

Users receive inconsistent retry/error experiences, and any successful XSS can steal long-lived tokens.

**Required change**

Centralize safe error normalization for 400/403/404/409/410/422/429/5xx/network/timeout cases; add an application error boundary and offline messaging; remove duplicate token stores; and evaluate secure, SameSite, HttpOnly refresh cookies with short-lived in-memory access tokens.

**Verification**

Automated UI tests cover each error class and token expiry; private cached data clears on logout/role change; refresh tokens are not browser-script readable if cookie migration is adopted.

### PROD-P1-007 — Reduce frontend payload and image weight

**Area:** Frontend / Performance  
**Status:** ❌ Not Started  
**Priority:** P1  
**Risk:** Medium

**Current situation**

Route lazy loading exists, but the chart chunk is 954.13 kB minified. Shipped images include a 2.1 MB hero, 1.6 MB banner, and 604 kB logo; duplicate source images also exist.

**Evidence**

- Build output from 2026-10-06
- Frontend `src/assets/brand`
- `HomePage.jsx`, `MobileAppBanner.jsx`, `BrandLogo.jsx`

**Problem**

Mobile users face slow first render, unnecessary bandwidth, and layout/performance degradation.

**Required change**

Convert responsive imagery to AVIF/WebP, provide dimensions/srcset, remove unused duplicates, lazy-load below-the-fold images, and isolate charts to reports routes or replace oversized chart dependencies where justified.

**Verification**

Bundle warnings are resolved or budgeted, representative mobile Lighthouse runs meet agreed LCP/CLS targets, and visual regression tests pass.

### PROD-P1-008 — Complete SEO, accessibility, responsive, and browser verification

**Area:** Frontend / QA  
**Status:** ⚠️ Needs Verification  
**Priority:** P1  
**Risk:** Medium

**Current situation**

The base page has a title, description, favicon, and manifest, and inspected image tags have alt attributes. There is no wildcard 404 route, canonical/OpenGraph metadata, robots.txt, or sitemap. Modal focus, keyboard operation, contrast, responsive layouts, and target browsers were not fully tested.

**Evidence**

- Frontend `index.html`, `public`, `src/App.jsx`
- Frontend page/layout/dialog components

**Problem**

Public discovery and essential user flows may fail for assistive technology, small screens, Safari, or direct invalid URLs.

**Required change**

Add a real 404 route, canonical/OG metadata, robots and sitemap strategy; run automated and manual accessibility checks; verify focus restoration/live announcements; and execute the critical flows on Chrome, Edge, Safari, Android, iPhone, mobile, tablet, and desktop.

**Verification**

Browser/device evidence is recorded, critical WCAG issues are closed, keyboard-only booking works, and public metadata validates against the production domain.

### PROD-P1-009 — Define supported map/geocoding operations

**Area:** Frontend / External Services / Privacy  
**Status:** ⚠️ Needs Verification  
**Priority:** P1  
**Risk:** Medium

**Current situation**

Google Maps SDK/API keys are not used. Venue management uses Leaflet, public OpenStreetMap tiles, browser-side Nominatim requests, and marker images from unpkg; venue detail provides outbound Google Maps links.

**Evidence**

- Frontend `LocationPicker.jsx`
- Frontend `venue.js`, `VenueDetailPage.jsx`
- `leaflet` and `react-leaflet` dependencies

**Problem**

Public community services/CDNs may not meet production traffic, attribution, rate, privacy, or availability requirements.

**Required change**

Review OSM tile and Nominatim usage policies, choose a production provider or controlled proxy, add request throttling/cache/error fallback, self-host marker assets, preserve attribution, and document data/privacy behavior.

**Verification**

Provider approval/plan and quotas are documented, rate limits are respected, attribution is visible, and map entry degrades gracefully during provider failure.

### PROD-P1-010 — Complete dependency, legal, and operational review

**Area:** Security / Legal / Operations  
**Status:** ⚠️ Needs Verification  
**Priority:** P1  
**Risk:** High

**Current situation**

Production npm dependencies currently audit clean, but no backend CVE scanner or automated dependency policy is configured. The UI has help/privacy-control screens and placeholder-looking contact information, but no reviewed Terms, Privacy Policy, Refund Policy, Cookie position, or SMS/email consent record.

**Evidence**

- Frontend/backend dependency manifests
- Frontend `Footer.jsx`, `PrivacyPage.jsx`, `HelpPage.jsx`
- No CI dependency-scanning workflow

**Problem**

Known vulnerable libraries can go unnoticed, and launch may lack approved user disclosures and support procedures.

**Required change**

Add automated npm and Maven/OWASP dependency review with triage; establish update ownership; replace placeholder contact data; obtain legal/operations review for Terms, Privacy, cancellation/refund wording, consent, cookies, support, incidents, disputes, and data-retention procedures.

**Verification**

Dependency reports meet policy, exceptions have owners/expiry, approved legal pages are publicly reachable, consent evidence is retained, and support escalation is tested.

# 🟡 P2 — POST-LAUNCH IMPROVEMENTS

### PROD-P2-001 — Add evidence-driven caching

**Area:** Performance  
**Status:** ❌ Not Started  
**Priority:** P2  
**Risk:** Medium

**Current situation**

React Query provides short client caching, but backend/public catalog and homepage caching are not measured or defined.

**Evidence**

- Frontend `queryClient.js`
- Backend public search/homepage services

**Problem**

Read-heavy traffic may create avoidable database load.

**Required change**

Measure hot queries, then add bounded application/HTTP caching with explicit invalidation. Do not introduce Redis until multi-instance measurements justify it.

**Verification**

Cache hit rate, invalidation correctness, and p95 latency improve without serving stale booking availability.

### PROD-P2-002 — Expand observability and business telemetry

**Area:** Operations / Product  
**Status:** ❌ Not Started  
**Priority:** P2  
**Risk:** Medium

**Current situation**

There are application logs and admin audit records, but no trace correlation, SLOs, or funnel metrics.

**Evidence**

- Backend logging and `AdminAuditLog`
- No metrics/tracing configuration

**Problem**

Root cause and product drop-off analysis will remain slow.

**Required change**

Add correlation IDs, structured events, safe tracing, SLO dashboards, and privacy-reviewed funnel metrics for search-to-book, payment, refund, and notification outcomes.

**Verification**

An operator can trace a booking reference through API, webhook, refund, and notification events without exposing personal or secret values.

### PROD-P2-003 — Establish capacity and resilience baselines

**Area:** Performance / QA  
**Status:** ❌ Not Started  
**Priority:** P2  
**Risk:** Medium

**Current situation**

No repeatable load or soak tests define initial capacity.

**Evidence**

- Frontend `package.json`
- Backend `pom.xml`
- No k6, Gatling, JMeter, or equivalent load-test assets in either repository

**Problem**

Scaling thresholds and failure behavior are unknown.

**Required change**

Create safe staged tests for availability reads, simultaneous bookings, login/OTP, webhook bursts, database pool exhaustion, and provider latency; document initial concurrency and alert thresholds.

**Verification**

Capacity results are reproducible and include saturation, recovery, and zero-double-booking evidence.

### PROD-P2-004 — Complete the PWA only if product requirements justify it

**Area:** Frontend  
**Status:** ❌ Not Started  
**Priority:** P2  
**Risk:** Low

**Current situation**

A manifest and PWA dependency exist, but the plugin is not registered.

**Evidence**

- Frontend `public/manifest.webmanifest`, `package.json`, `vite.config.js`

**Problem**

The project carries partial PWA expectations without defined offline behavior.

**Required change**

Decide whether installability is required. If enabled, never cache authenticated booking/payment responses as durable truth, add update UX, and test offline/upgrade behavior.

**Verification**

PWA audits pass and stale cached data cannot confirm availability or payment.

### PROD-P2-005 — Improve media delivery and edge caching

**Area:** Frontend / Infrastructure  
**Status:** ❌ Not Started  
**Priority:** P2  
**Risk:** Low

**Current situation**

Images are delivered as original local/static files with no transformation pipeline.

**Evidence**

- Frontend `src/assets/brand`
- Backend `FileStorageServiceImpl.java`, `WebConfig.java`

**Problem**

Bandwidth and image rendering will become inefficient as venue media grows.

**Required change**

Add derivative sizes, modern formats, immutable object keys, CDN caching, and safe deletion/versioning after persistent storage is established.

**Verification**

Device-appropriate images are served with high cache hit rates and no broken historical booking/venue references.

### PROD-P2-006 — Extend end-to-end regression coverage

**Area:** QA  
**Status:** ❌ Not Started  
**Priority:** P2  
**Risk:** Medium

**Current situation**

Unit/component tests exist, but there is no browser E2E suite spanning all portals and external-service simulators.

**Evidence**

- Frontend `src/pages/auth/LoginPage.test.jsx`, `src/utils/otpAuth.test.js`
- Backend `pom.xml`, `target/surefire-reports`
- No Playwright/Cypress suite

**Problem**

Cross-system contract regressions require manual discovery.

**Required change**

Add deterministic E2E coverage for customer, owner/staff, admin, booking conflict, payment notify, cancellation/refund, and notification status using disposable infrastructure and provider simulators.

**Verification**

Critical E2E scenarios run in CI, publish artifacts on failure, and never use live payment/SMS credentials.

### PROD-P2-007 — Refine non-blocking customer and operator UX

**Area:** Frontend / Product
**Status:** ❌ Not Started
**Priority:** P2
**Risk:** Low

**Current situation**

Core customer, owner, and administrator journeys exist, but lower-severity usability polish has not been prioritized from production telemetry or structured user research.

**Evidence**

- Frontend `src/App.jsx`, `src/pages/HomePage.jsx`, `src/pages/owner/OwnerCalendarPage.jsx`, `src/pages/admin/AdminDashboardPage.jsx`
- No repository evidence of a production UX-feedback pipeline, experiment framework, or documented post-launch usability backlog

**Problem**

Minor friction, empty-state clarity, perceived latency, contextual help, and operator efficiency issues can accumulate after launch even when critical flows remain functional.

**Required change**

Use privacy-safe analytics, support themes, and usability studies to prioritize non-blocking improvements such as skeleton/empty states, saved preferences, clearer progress and recovery cues, contextual help, and reduced repetitive operator input. Keep booking, payment, accessibility, and security correctness ahead of cosmetic experiments.

**Verification**

Each change has a measured hypothesis, accessibility review, regression coverage, and post-release result; experiments do not alter authoritative prices, availability, payment, refund, or authorization decisions.

# Frontend Production Checklist

- [x] Production build succeeds locally
- [x] Route-level lazy loading is present
- [x] Central Axios client, timeout, JWT refresh queue, and role-specific refresh paths exist
- [x] Customer, owner/staff, and admin route guards exist
- [x] Production source maps are not emitted by the audited build
- [ ] Production API URL is explicitly configured and HTTPS
- [ ] Production build fails instead of falling back to localhost
- [ ] Sandbox wording and behavior are removed from live UI
- [ ] Full lint passes with zero errors
- [ ] Frontend tests complete and pass within a bounded time
- [ ] No browser-exposed backend secret exists
- [ ] Status-specific error and network/offline states are verified
- [ ] Payment return polls only authoritative backend state
- [ ] 404 route exists
- [ ] Canonical, OpenGraph, robots, and sitemap requirements are complete
- [ ] Large bundles and images meet performance budgets
- [ ] Accessibility checks pass
- [ ] Mobile, tablet, and desktop layouts pass
- [ ] Chrome, Edge, Safari, Android, and iPhone Safari pass

# Backend Production Checklist

- [ ] Production profile configured and fail-fast
- [ ] Production secrets externalized and rotated
- [ ] Hibernate production mode is `validate`
- [ ] Runtime DDL and unsafe startup mutations removed
- [ ] CORS restricted to approved origins
- [x] Access tokens expire after 15 minutes
- [x] Refresh-token records can be revoked on logout
- [x] Route families enforce customer, owner/staff, and admin roles
- [x] Customer booking ownership checks exist
- [x] Owner business/venue/court ownership checks exist
- [ ] Refresh tokens are hashed, rotated, and revoked after password reset
- [ ] DTO validation and pagination limits are complete
- [ ] Global exception responses are production-safe
- [ ] SQL bind and sensitive logging are disabled
- [ ] Distributed rate limits are active
- [ ] Swagger is restricted in production
- [ ] Explicit security-header policy is verified
- [ ] PayHere production flow is verified
- [ ] Refund recovery workflow is verified
- [ ] SMSLenz production sender/account and failure behavior are verified
- [ ] Safe health/readiness endpoints are enabled
- [ ] Backend tests pass against an isolated disposable database

# Payment Launch Checklist

- [ ] PayHere live account approved
- [ ] Live merchant ID configured as a secret-managed backend value
- [ ] Live merchant secret configured and matched to the registered domain
- [ ] Refund API app ID/app secret configured
- [ ] `booknplay.lk` production domain registered with PayHere
- [ ] Live checkout endpoint configured
- [ ] HTTPS notify URL registered and publicly reachable
- [ ] HTTPS return URL configured
- [ ] HTTPS cancel URL configured
- [x] Checkout hash generation has unit coverage
- [x] Client redirect is not treated as payment proof
- [ ] Webhook checks configured merchant ID
- [ ] Webhook checks exact stored amount and currency
- [ ] Webhook transaction/order reference is unique
- [ ] Webhook processing is row-locked and idempotent
- [ ] Duplicate/conflicting webhook test passes
- [ ] Successful live payment test passes
- [ ] Failed payment test passes
- [ ] Cancelled payment test passes
- [ ] Late webhook/expired hold test passes
- [ ] Full refund test passes
- [ ] Failed/unknown-outcome refund recovery test passes
- [ ] Subscription payment webhook receives the same validation

# Database Launch Checklist

- [ ] Private production MySQL provisioned
- [ ] Application uses a least-privilege non-root account
- [ ] Database TLS enabled where available
- [ ] Flyway baseline and migrations reviewed
- [ ] `ddl-auto=validate` in production
- [ ] Foreign keys verified against the real migrated schema
- [ ] Booking/payment/refund/idempotency unique constraints verified
- [ ] Slot-level active-booking uniqueness verified under concurrency
- [ ] Query-driven indexes reviewed with EXPLAIN
- [ ] Page sizes, date ranges, and batch jobs bounded
- [ ] Hikari pool sized and monitored
- [ ] Automated encrypted backups configured
- [ ] Backup retention and off-site policy approved
- [ ] Point-in-time recovery requirement decided
- [ ] Restore into an isolated environment completed and timed
- [ ] Production initialization creates no demo/test data

# Security Checklist

- [ ] Committed secrets removed from current tree and history
- [ ] Exposed credentials rotated
- [ ] Secret scanning blocks future commits
- [x] Passwords and OTPs are BCrypt-hashed
- [x] OTP expiry, cooldown, and attempt limits exist
- [ ] OTP/login/password-reset IP and identity rate limits exist
- [ ] JWT secret is strong, externalized, and rotated safely
- [ ] Refresh tokens are hashed and rotated
- [ ] Password reset revokes active sessions
- [x] Backend role rules exist
- [x] Customer and owner ownership checks exist in audited core services
- [ ] Cross-role and cross-tenant integration tests pass
- [ ] CORS denies unapproved origins
- [ ] TLS and HSTS are active
- [ ] CSP, Referrer-Policy, frame, and content-type headers are verified
- [ ] Swagger/Actuator exposure is restricted
- [ ] Error responses expose no stack trace, SQL, path, or class details
- [ ] Logs contain no password, OTP, JWT, refresh token, auth header, secret, or SQL bind value
- [ ] Upload content is decoded/validated and safely served
- [ ] Frontend and backend dependency policies pass

# Production Environment Variable Inventory

Values must be supplied through the deployment secret/config system. This inventory intentionally contains names only.

## Frontend variables

| Variable | Secret | Required | Environments | Purpose |
| --- | --- | --- | --- | --- |
| `VITE_API_BASE_URL` | No | Yes | Development / Production | REST API base; production must be HTTPS and must not use localhost. |
| `VITE_PAYMENT_GATEWAY` | No | Yes | Development / Production | Public gateway selector; production must be locked to the approved live gateway. |
| `VITE_OWNER_SUBSCRIPTIONS` | No | Optional | Development / Production | Public feature flag for owner billing UI. |

All `VITE_*` values are browser-visible. Never place merchant, JWT, database, SMS, or mail secrets in them.

## Existing backend environment variables

| Variable | Secret | Required | Environments | Purpose |
| --- | --- | --- | --- | --- |
| `BOOKNPLAY_ADMIN_EMAIL` | Sensitive | Bootstrap only | Controlled initialization | Initial super-admin identity. |
| `BOOKNPLAY_ADMIN_PASSWORD` | Yes | Bootstrap only | Controlled initialization | Initial super-admin password; remove after bootstrap. |
| `BOOKNPLAY_BOOKING_HOLD_EXPIRY_INTERVAL_MS` | No | Optional | Development / Production | Hold-expiry job interval. |
| `BOOKNPLAY_BOOKING_HOLD_TTL_MINUTES` | No | Yes | Development / Production | Unpaid hold lifetime. |
| `BOOKNPLAY_FRONTEND_URL` | No | Yes | Development / Production | Approved frontend URL. |
| `BOOKNPLAY_PAYMENTS_MODE` | No | Yes | Development / Production | Payment mode; production must fail on dummy/sandbox mode. |
| `BOOKNPLAY_SUBSCRIPTION_CANCEL_URL` | No | Yes when subscriptions enabled | Development / Production | Owner subscription cancel return. |
| `BOOKNPLAY_SUBSCRIPTION_RETURN_URL` | No | Yes when subscriptions enabled | Development / Production | Owner subscription success return. |
| `PAYHERE_APP_ID` | Yes | Yes for refunds | Sandbox / Production | PayHere refund API application ID. |
| `PAYHERE_APP_SECRET` | Yes | Yes for refunds | Sandbox / Production | PayHere refund API application secret. |
| `PAYHERE_CANCEL_URL` | No | Yes | Sandbox / Production | Customer checkout cancel URL. |
| `PAYHERE_CHECKOUT_URL` | No | Yes | Sandbox / Production | PayHere checkout endpoint. |
| `PAYHERE_MERCHANT_ID` | Sensitive | Yes | Sandbox / Production | Merchant identifier. |
| `PAYHERE_MERCHANT_SECRET` | Yes | Yes | Sandbox / Production | Checkout/webhook signing secret. |
| `PAYHERE_NOTIFY_URL` | No | Yes | Sandbox / Production | Public HTTPS webhook URL. |
| `PAYHERE_OAUTH_TOKEN_URL` | No | Yes for refunds | Sandbox / Production | Refund OAuth endpoint. |
| `PAYHERE_REFUND_URL` | No | Yes for refunds | Sandbox / Production | Refund endpoint. |
| `PAYHERE_RETURN_URL` | No | Yes | Sandbox / Production | Customer checkout return URL. |
| `SMSLENZ_API_KEY` | Yes | Yes for SMS | Development / Production | SMS provider API key. |
| `SMSLENZ_SENDER_ID` | Sensitive | Yes for SMS | Development / Production | Approved production sender ID. |
| `SMSLENZ_USER_ID` | Sensitive | Yes for SMS | Development / Production | SMS provider account identifier. |

## Backend properties requiring external production overrides

Spring Boot relaxed binding allows the following deployment names even though the current file uses literals. Mark them required in the production profile.

| Variable | Secret | Required | Purpose |
| --- | --- | --- | --- |
| `SPRING_PROFILES_ACTIVE` | No | Yes | Must select `prod` in production. |
| `SPRING_DATASOURCE_URL` | Sensitive | Yes | Private production MySQL JDBC URL with TLS. |
| `SPRING_DATASOURCE_USERNAME` | Sensitive | Yes | Least-privilege application user. |
| `SPRING_DATASOURCE_PASSWORD` | Yes | Yes | Database password. |
| `JWT_SECRET` | Yes | Yes | Strong Base64 signing key. |
| `SPRING_MAIL_USERNAME` | Sensitive | Optional if email disabled | SMTP identity. |
| `SPRING_MAIL_PASSWORD` | Yes | Optional if email disabled | SMTP credential. |
| `APP_BASE_URL` | No | Yes | Public HTTPS backend origin. |
| `APP_UPLOAD_DIR` | No | Yes if filesystem storage retained | Persistent storage mount; object storage is preferred. |
| `SERVER_PORT` | No | Optional | Internal service port. |

# Production URL Audit

- Frontend production risk: API/media fallbacks use `http://localhost:8080`; must fail closed for production.
- Frontend development-only references: README, tests, and `.env.example` may retain clearly labeled localhost values.
- Frontend production risk: customer checkout/help/return copy explicitly says PayHere sandbox.
- Backend production risk: application defaults contain localhost frontend/API URLs and PayHere sandbox checkout/refund/OAuth endpoints.
- Backend development-only references: sandbox example and tests may retain clearly labeled localhost/sandbox values.
- No active ngrok URL was found in application defaults, but comments/examples describe ngrok for development.
- No `vercel.app` dependency was found.
- All live origins must be HTTPS; do not permit production HTTP API/media calls.

# Recommended Production Architecture

```text
Users and PayHere
        |
      HTTPS
        |
CDN / WAF / reverse proxy
  |                     |
  |                     +--> api.booknplay.lk
  |                              |
  +--> booknplay.lk              v
       static frontend      Spring Boot modular monolith
                                   |
                  +----------------+----------------+
                  |                |                |
            Private MySQL   Persistent object   Monitoring/logs
                               storage
                                   |
                  +----------------+----------------+
                  |                |                |
               PayHere         SMSLenz          SMTP email
```

Keep BooknPlay as a modular monolith. Use one production API deployment initially unless measured availability/capacity requires multiple instances. If multiple instances are used, all checkout/idempotency/job state must be durable and scheduled jobs must be coordinated.

# Backup, Recovery, and Monitoring

## Backup and recovery tasks

- [ ] Automated MySQL backups scheduled
- [ ] Backup encryption and access controls configured
- [ ] Retention policy approved
- [ ] Off-site/independent copy configured
- [ ] Point-in-time recovery requirement and binlog retention decided
- [ ] Media storage backup/versioning configured
- [ ] Restore runbook names owners and credentials process
- [ ] Full restore into an isolated environment completed
- [ ] Recovery point objective and recovery time objective measured

## Monitoring and alerting tasks

- [ ] Frontend and API uptime
- [ ] Health/readiness endpoint without sensitive detail
- [ ] API p50/p95/p99 latency and HTTP 5xx rate
- [ ] Database availability, storage, slow queries, and connection pool
- [ ] CPU, memory, disk, and process restarts
- [ ] Booking conflict and hold-expiry rates
- [ ] PayHere webhook failures, invalid signatures, and reconciliation backlog
- [ ] Refund failure/reconciliation backlog
- [ ] SMS/email failures and provider latency
- [ ] Authentication failures and rate-limit events
- [ ] Backup failures and last successful restore drill

# CI/CD Checklist

- [ ] Pull requests install from lockfiles on pinned Java and Node versions
- [ ] Frontend lint, tests, build, and production dependency audit pass
- [ ] Backend unit/integration tests run only against disposable databases
- [ ] Backend dependency/CVE scan passes policy
- [ ] Secret scanning runs on commits and history-sensitive changes
- [ ] Flyway migrations apply to a clean and previous-version database
- [ ] Immutable frontend/backend artifacts are built once
- [ ] Deployment requires protected-environment approval
- [ ] Production secrets are injected by the platform
- [ ] Post-deploy smoke tests and automatic alert checks run
- [ ] Failed deployment stops rollout and preserves the previous artifact

# Deployment Checklist

## Pre-deployment

- [ ] All P0 tasks completed and independently reviewed
- [ ] Clean-clone CI is green
- [ ] Live configuration inventory is complete without values in source control
- [ ] Database migration and backup are reviewed
- [ ] Restore drill is current
- [ ] DNS, TLS, CORS, headers, and PayHere domain registration verified
- [ ] Monitoring, on-call contacts, support, and status communication ready
- [ ] Launch window and rollback owner confirmed

## Deployment

- [ ] Capture current application versions and database migration version
- [ ] Create/verify pre-deployment backup
- [ ] Apply forward-compatible migrations once
- [ ] Deploy backend immutable artifact with prod profile
- [ ] Verify readiness before routing traffic
- [ ] Deploy frontend immutable artifact with production API URL
- [ ] Purge only required CDN assets
- [ ] Confirm scheduled jobs run on the intended instance(s)

## Smoke Tests

- [ ] Execute the full production smoke test below
- [ ] Verify logs/metrics contain correlation references but no secrets/PII leakage
- [ ] Confirm no localhost, ngrok, sandbox, mixed-content, or CORS errors
- [ ] Confirm payment, refund, notification, owner, and admin dashboards agree

## Post-deployment

- [ ] Monitor 5xx, latency, DB connections, webhooks, refunds, and notifications
- [ ] Reconcile the approved live payment/refund tests
- [ ] Confirm backups continue after schema change
- [ ] Record deployed commits/artifacts, migration version, checks, and approvers
- [ ] Remove temporary bootstrap credentials and test records safely

## Rollback

- [ ] Stop rollout and new traffic to the failing version
- [ ] Preserve logs, metrics, webhook payload references, and migration state
- [ ] Restore the previous application artifact
- [ ] Do not blindly roll back database migrations
- [ ] Check backward compatibility before routing the previous application
- [ ] Prefer a reviewed forward-fix for migrated data/schema
- [ ] Restore a database backup only for confirmed data corruption with explicit approval
- [ ] Re-run smoke tests and reconcile payments/webhooks received during the incident

# Production Smoke Test

Use dedicated approved production test identities and a low-value real/live payment only after PayHere authorizes it.

1. Open `https://booknplay.lk` on desktop and mobile.
2. Confirm TLS, security headers, canonical URL, and no mixed content.
3. Register a new customer by phone.
4. Verify OTP delivery and ensure OTP never appears in logs.
5. Log in and refresh the page to verify session behavior.
6. Search for a production-approved venue.
7. Open the venue and verify map/address/media fallback.
8. Select a sport and court.
9. Select a future date and available discrete slot(s).
10. Open checkout and verify server-authoritative total and cancellation wording.
11. Create the booking and confirm a `PENDING` hold appears once.
12. Attempt the same slot concurrently from a second account and confirm rejection.
13. Complete the approved live PayHere payment.
14. Confirm the browser return page waits for backend state.
15. Confirm one signed webhook is stored/processed.
16. Replay the same webhook and confirm no duplicate state, invoice, or notification.
17. Confirm booking is `CONFIRMED` and payment is `SUCCESS` with the exact amount/currency.
18. Confirm the customer booking detail and invoice are accessible only to that customer.
19. Verify booking confirmation SMS and email if enabled.
20. Verify the owner calendar shows the booking for the correct business/court.
21. Create a non-overlapping walk-in booking and verify expected SMS/cash behavior.
22. Verify staff cannot open owner-only earnings, billing, team, or profile operations through direct API calls.
23. Verify another business cannot read or mutate the venue/court/booking.
24. Verify admin visibility and an audited admin mutation with a reason.
25. Test an eligible cancellation and confirm the displayed policy matches the persisted snapshot.
26. Confirm one refund record, provider reference, payment state, and booking state.
27. Retry cancellation and confirm no duplicate refund.
28. Test a declined/cancelled payment and confirm the hold expires safely.
29. Verify hostile-origin CORS, invalid JWT, oversized upload, and rate-limit responses.
30. Confirm dashboards, alerts, logs, backup status, and support escalation are operational.

# Rollback Plan

```text
New version fails
        |
        v
Stop rollout and preserve evidence
        |
        v
Remove failing instances from traffic
        |
        v
Check current Flyway version and backward compatibility
        |
        +--> Compatible: restore previous immutable application artifact
        |
        +--> Not compatible: keep traffic stopped and apply reviewed forward-fix
        |
        v
Restore database backup only for confirmed corruption and explicit approval
        |
        v
Reconcile payments/webhooks/refunds received during the incident
        |
        v
Run smoke tests, restore traffic gradually, and monitor
```

Do not use destructive Git/database commands as a rollback mechanism. Maintain at least the previous known-good frontend and backend artifacts and document migration compatibility in every release.

# Legal and Operational Launch Review

- [ ] Privacy Policy reviewed for customer, owner, analytics, location, and provider data
- [ ] Terms & Conditions reviewed
- [ ] Cancellation and Refund Policy matches implemented server behavior
- [ ] SMS/email consent and opt-out requirements reviewed
- [ ] Cookie/local-storage position reviewed
- [ ] PayHere wording and merchant/support details approved
- [ ] Real support email, phone, hours, escalation, and dispute procedure published
- [ ] Data retention/deletion and account requests documented
- [ ] Incident response and breach-notification responsibilities assigned
- [ ] Demo users, test businesses, test venues, sandbox payments, and bootstrap credentials excluded from production

# Historical Development Roadmap

> The material below is preserved from the pre-audit development roadmap. Statements about passing tests, dummy/sandbox payments, permission enforcement, and release readiness reflect earlier snapshots and are superseded by the production audit above. Preserve it as implementation history, not current launch evidence.

Last updated: 2026-10-03

This roadmap is the technical execution plan for the BooknPlay frontend in this repository. The Spring Boot API lives beside it at `C:\Users\Musharaf\Downloads\booknplay\booknplay`. On 2026-09-24, the production build and all 34 automated tests passed. Changed-file lint passes; the full lint command is blocked only by the existing Fast Refresh export error in `src/components/auth/SportsEquipment.jsx`. The Vitest setup currently fails before tests run (`afterEach` in `src/test/setup.js`).

## Project Status

BooknPlay is a multi-tenant sports venue discovery, booking, and management platform with three portals: customer, business owner, and platform admin.

This repository is the React frontend only. It expects the Spring Boot API at `VITE_API_BASE_URL` (example: `http://localhost:8080/api/v1`). That API is the sibling project `C:\Users\Musharaf\Downloads\booknplay\booknplay`. Contract notes below use that code, not only `src/constants/apiTypes.js`.


| Area                                  | Status      | Evidence / remaining work                                                                                                                                                                                        |
| ------------------------------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Frontend foundation and design system | Complete    | React 19, Vite 8, MUI 9, Tailwind 3, Motion, theme mode, Sonner, and lazy routes are present.                                                                                                                    |
| Customer discovery and booking UI     | In progress | Home, venue detail, slot selection, server-quote checkout, and cancellation-preview UI exist. Search is locked to Kandy. Quote returns `quoteId` and pay-now is still the full slot total. Confirm sends that `quoteId` plus contact details. Dummy confirm copies the current business cancellation fields onto the booking. |
| Customer authentication and account   | In progress | Login, registration, protected account routes, bookings, profile, privacy, and help exist. Favourites stays an empty state because no favourites API exists. Customer and owner password-reset screens exist. |
| Payment frontend                      | In progress | Local checkout uses dummy mode. Quote and confirm require `booknplay.payments.mode=DUMMY` and `booknplay.payments.dummy-enabled=true`; those are the API defaults. Confirm records a `DUMMY` payment as `SUCCESS` and does not call a gateway. A real sandbox gateway is still open. |
| Venue owner portal                    | In progress | Calendar is the `/owner` home for live venues; Overview is Venues; collapsible side nav; bookable-spaces rename + how-it-works; walk-ins are guest-only (`WALK_IN`, null `customer_id`, no `payments` row; `paymentStatus` may be null); Team page with custom staff permissions + `maxStaff` plan seats; Reports analytics hub (ApexCharts + sub-nav); Billing usage meters (venues/staff). Auth, onboarding, booking-policy, pricing, maintenance, earnings, payouts, profile, trial→paid plans, and plan-driven commission (trial 0%) remain. Cancel policy saves `hoursBeforeDeadline: 1` and `refundPercentage: 100` (or `{0,0}` when off). Policy is per business, not per venue. |
| Admin portal                          | In progress | Auth, dashboard, businesses, venues, customers, audit, and homepage publishing exist. Permission enforcement is client-side only.                                                                                |
| Production build                      | Complete    | `npm run build` succeeded as of 2026-09-24.                                                                                                                                                                      |
| Linting                               | In progress | Changed-file lint passes. Full lint has one existing `react-refresh/only-export-components` error in `SportsEquipment.jsx`.                                                                                      |
| Automated tests                       | In progress | All 34 tests pass. Normalize the slower Windows runner configuration in CI. Checkout quotes and booking-policy calculations now have regression coverage.                                                        |
| PWA                                   | Planned     | `public/manifest.webmanifest` and `vite-plugin-pwa` exist. `vite.config.js` does not register the plugin.                                                                                                        |
| Backend, database, and deployment     | In progress | Sibling repo `C:\Users\Musharaf\Downloads\booknplay\booknplay`. Quote, confirm, cancellation preview, and policy-based cancel are implemented. Walk-in create (`createWalkIn`) saves the booking only (no payment row); owner cancel of `WALK_IN` skips PayHere; online PayHere create unchanged. A versioned per-venue policy, broader gateway refunds, and deployment are still open. |


### Status legend

- Complete: implemented in this frontend. Live backend acceptance may still be open.
- In progress: substantial UI and API client exist; integration or a known contract gap remains.
- Planned: not implemented, or only a dependency or placeholder exists.
- Blocked: cannot be treated as done until the named problem is resolved.

### Priority legend

- P0 Critical: security, broken auth, cross-tenant access, double booking, payment integrity, build failures.
- P1 Core product: onboarding, venues, sports and resources, availability, booking, checkout, business calendar.
- P2 Product quality: notifications, reviews, promotions, reporting, broader search, advanced pricing.
- P3 Polish: animation, visual refinement, convenience features.

## Current Architecture

```text
Customer portal       Owner portal          Admin portal
       |                    |                    |
       +--------------------+--------------------+
                            |
              Axios client with JWT refresh
                            |
         Spring Boot REST API  /api/v1
                            |
        Database, storage, and webhooks
        (not in this repository)
```

### Frontend stack

- Framework and build: React 19, React Router 7, Vite 8.
- Styling: Material UI 9, Tailwind CSS 3, design tokens in `DESIGN.md`, `src/index.css`, and `tailwind.config.js`.
- Motion: `motion` (Motion for React), with `useReducedMotion` on several customer components and reduced-motion rules in `src/index.css`.
- Server state: TanStack React Query (`src/lib/queryClient.js`).
- Client auth state: Zustand persist (`src/stores/authStore.js`).
- HTTP: Axios (`src/lib/axios.js`), base URL from `VITE_API_BASE_URL`.
- Forms: React Hook Form is installed. Most auth, checkout, and owner forms use controlled state.
- Dates and maps: Day.js, MUI X Date Pickers, Leaflet, React Leaflet.
- Feedback: Sonner toasts.
- Tests: Vitest and Testing Library. `vite.config.js` sets jsdom.

### API clients

- `src/lib/axios.js`: bearer token, refresh queue, role-specific refresh paths.
- `src/api/public.js`: venues, sports, businesses, homepage, courts, availability.
- `src/api/auth.js`: customer register, login, refresh, logout, profile.
- `src/api/bookings.js`: quote, create, lookup, lists, upcoming, history, cancellation preview, and cancel.
- `src/api/payments.js`: initiate, status, invoice, PDF.
- `src/api/ownerAuth.js`, `src/api/ownerBusiness.js`, `src/api/ownerVenues.js`, `src/api/ownerCalendar.js`, `src/api/ownerEarnings.js`, `src/api/ownerSubscription.js`.
- `src/api/admin.js`: admin auth, dashboard, businesses, venues, customers, audit, homepage publishing, business subscription override, subscription plan catalog GET/PUT.
- `src/constants/apiTypes.js`: documented enums and request shapes. Comment says these mirror Spring Boot DTOs. Treat them as the contract until the backend repo is opened.
- Feature flag: `VITE_OWNER_SUBSCRIPTIONS` (default true). Set `false` to hide owner billing UI.

### Owner platform subscription (Phase 1 + Phase 2 entitlements)

New businesses receive a free **90-day TRIAL** on `POST /owner/auth/register` (backend auto-creates). After trial, owners subscribe to STARTER / GROWTH / PRO.

**Platform booking commission is plan-driven.** Each `SubscriptionPlan` stores `commissionPercent` (admin-editable). Defaults: TRIAL **0%**, paid plans **10%**. On trial create, checkout activation, and admin force-plan, the plan rate is copied onto `Business.commissionPercent` (earnings use the business field). Admins can still override commission per business.

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/owner/subscription` | Current business subscription (+ `limits`, `usage`) |
| GET | `/owner/subscription/plans` | Paid plan catalog (includes limit + commission fields) |
| POST | `/owner/subscription/checkout` | `{ planCode, billingInterval }` → `{ paymentId, paymentUrl, status }` |
| GET | `/owner/subscription/payments/:id` | Poll subscription payment |
| PATCH | `/admin/businesses/:id/subscription` | Admin extend trial / force plan (`reason` required; syncs plan commission) |
| PATCH | `/admin/businesses/:id/commission` | Per-business commission override |
| GET | `/admin/subscription-plans` | Admin list all plans (incl. TRIAL) with limits + commission |
| PUT | `/admin/subscription-plans/:code` | Admin edit prices, commission, entitlements (`reason` required; `features` string or array) |
| GET | `/admin/dashboard` | Platform KPIs + `subscriptionByPlan`, trial/paid/expired counts |

**Default entitlements (admin-editable):** TRIAL ≈ Growth capacity (5 venues, reports + advanced, **0% commission**); STARTER 1 venue, no reports, 10% commission; GROWTH 5 venues + reports, 10%; PRO unlimited + advanced reports, 10%. Mutate blocked with HTTP 403 `code: PLAN_LIMIT`. Reports API uses `view=reports` on earnings summary; ranges over 31 days need advanced reports.

Frontend surfaces: `/owner/billing` (usage + plans + commission), `/owner/billing/return`, `/admin` (subscription analytics charts), `/admin/plans`, trial banner, soft-lock on mutate routes when expired, venue/court/walk-in/reports upgrade CTAs. Staff inherit business subscription status but cannot open Billing.

### Routes

Defined in `src/App.jsx`.

- Customer: `/`, `/venues/:venueId`, `/venues/:venueId/slots`, `/checkout`, `/checkout/:bookingId`, `/payment/return`, `/bookings/:bookingId`, `/account/*`.
- `/search` redirects through `src/components/layout/LegacySearchRedirect.jsx` to the Kandy homepage. The standalone `SearchResultsPage.jsx` was removed.
- Owner: `/owner/login`, `/owner/register`, `/owner`, `/owner/venues/new`, `/owner/venues/:venueId/courts`, `/owner/venues/:venueId/calendar`, `/owner/venues/:venueId/booking-policy`, `/owner/earnings`, `/owner/reports`, `/owner/billing`, `/owner/billing/return`, `/owner/profile`.
- Admin: `/admin/login`, `/admin`, `/admin/homepage`, `/admin/businesses`, `/admin/plans`, `/admin/venues`, `/admin/customers`, `/admin/audit`.

### Domain model used by the client

Business and venue are separate.

- One owner business: `PUT /owner/business`.
- Many venues: `GET/POST /owner/venues`, `POST /owner/venues/onboard`.
- Sport catalog: `GET /public/sports`. Each court stores `sportId` and `sportName`.
- The bookable unit is **Court**. Onboarding display words (Court, Pitch, Table, Lane, Pool Table) only name courts such as `Pitch A`. Do not rename the entity unless the backend model changes.
- Venue location fields used by the client: formatted address, city, latitude, longitude (`src/components/owner/LocationPicker.jsx`). Province and district are not in the client.
- Operating hours are per venue. The live cancellation policy is per business (`hoursBeforeDeadline`, `refundPercentage`). Product rule when cancel is on: 1 hour from booking creation for a full refund; after that cancel is closed (not hours-before-play-start; PayHere cannot partial-refund). Pricing rules are per court (`dayOfWeek`, `startTime`, `endTime`, `price`). Customer checkout reads only the server quote.
- Availability is requested as `GET /public/availability?courtId&date`. Slots include `available`, `price`, and `reason` (`BOOKED`, `MAINTENANCE`, `CLOSED`, `BLOCKED`). The frontend does not store a global court status of booked.
- Booking create body: `{ courtId, sportId, date, startTime, endTime }`.
- Documented booking statuses: `PENDING`, `CONFIRMED`, `CANCELLED`, `COMPLETED`, `NO_SHOW`.
- Documented payment statuses: `PENDING`, `COMPLETED`, `FAILED`, `REFUNDED`, `PARTIAL`.
- Roles the client understands: `CUSTOMER`, `BUSINESS_OWNER`, `STAFF`, `SUPER_ADMIN`. `STAFF` passes the owner route guard and receives the full owner UI.

### Booking path

Home or venue card → venue detail → slot page → login when the user is not a customer → checkout → `POST /customer/bookings` → `POST /customer/payments/initiate/:bookingId` → gateway URL or `/payment/return` polling.

Owner walk-ins use `POST /owner/bookings/walk-in`. Verified sibling-API contract:

- `BookingSource.WALK_IN`, `customer_id` null, `guestName` / `guestPhone` (mirrored to `contactName` / `contactPhone`), status `CONFIRMED`.
- No `payments` row is inserted; response `paymentStatus` may be null. Cash/offline settlement stays with the venue.
- Online customer bookings still set `customer_id` and create a PayHere `Payment`.
- Overlap and conflict rejection share the same backend rules as customer create (see Phase 8). Owner status/cancel must tolerate a missing Customer and Payment.

## Completed Features

Frontend UI and clients below exist. They are not certified against a live backend.

- [x] React, Vite, MUI, Tailwind, theme mode, toasts, and lazy routes.
- [x] Customer, owner, and admin route trees with role guards.
- [x] Homepage fed by `/public/homepage`, sports, businesses, and venues.
- [x] Venue detail and a 7-day slot picker that reads backend availability.
- [x] Customer, owner, and admin login and registration screens.
- [x] Authenticated checkout, booking lists, booking detail, and cancel client.
- [x] Payment initiation, return page, status polling, and invoice download client.
- [x] Owner business profile, image upload, and password change client.
- [x] Multi-step venue onboarding with map location, sports, named spaces, hours, price, amenities, and rules.
- [x] Court create, update, delete, and weekday pricing grid.
- [x] Owner day calendar with resource columns, walk-in, blocked time, and maintenance.
- [x] Owner earnings summary, daily earnings, and payout list clients.
- [x] Admin dashboard, business access, commission, venue status, customers, audit, and homepage draft, publish, and restore.
- [x] Production build, changed-file lint, and 34 automated tests verified on 2026-09-24.
- [x] Interim checkout policy guard removes the unsupported deposit choice and universal refund promise.
- [x] Role-specific logout revokes the refresh token, then clears both token stores.
- [x] Checkout quote and cancellation preview are served by the Spring Boot booking API. Cancel uses the same policy calculation.
- [x] Owner walk-in create persists a guest booking only (no PayHere/cash `payments` row). Owner cancel of walk-ins uses refund `NONE` and does not require Customer or Payment.

## In Progress

- Customer discovery is limited to Kandy (`LAUNCH_CITY` in `src/utils/searchParams.js`).
- Checkout creates one booking for a continuous block of time. A gap is refused before any booking is created. Confirm uses the server quote id and contact details, not a client-calculated amount.
- Payment return accepts `PaymentStatus` plus `SUCCESS`, `PAID`, `INITIATED`, and `PROCESSING` via `src/utils/paymentStatus.js`.
- Owner overview shows venue counts, setup progress, and today’s booking count and gross from `GET /owner/earnings/summary`. It does not calculate occupancy.
- Owner calendar is a single day.
- Favourites page has no API.
- Logout calls the role logout endpoint when a refresh token exists, then clears local state even if that request fails.
- Automated tests pass with `--pool=threads --no-file-parallelism --maxWorkers=1 --no-isolate`; the package script and CI still need this reliable configuration.

## Known Problems

- The live cancellation policy stores only `hoursBeforeDeadline` and `refundPercentage` on the business. The owner editor is on/off only: on → `{1, 100}` (1 hour after booking, full refund); off → `{0, 0}`. Advance payment, a fixed fee, no-show rules, policy versions, and a snapshot on the booking are not persisted. `POST /owner/venues/onboard` ignores a nested `cancellationPolicy`.
- Owner policy read is `GET /owner/cancellation-policy`. Save is `PUT /owner/venues/:venueId/cancellation-policy`, but the stored row is still one policy per business. Partial refund percentages are not offered (PayHere limitation).
- “Forgot password?” on the customer and owner login pages links to `/account/help`.
- Customer password length check is 6 characters in `src/pages/auth/RegisterPage.jsx`.
- Help copy names PayHere while `.env.example` sets `VITE_PAYMENT_GATEWAY=DUMMY`.
- Access and refresh tokens live in `localStorage` under `accessToken`, `refreshToken`, and `booknplay-auth`. One pair is shared by all roles.
- Tenant isolation cannot be proven from this frontend repository alone. Double-booking overlap for customer create and walk-in is covered by sibling-API tests (`BookingOverlapRepositoryTest`); the client still treats the server as authority.

## Technical Debt

- Duplicate customer login hooks: `useAuth` and `useLogin` / `useRegister` in `src/hooks/useAuth.js`.
- Large mixed pages: `src/pages/owner/OwnerOnboardingPage.jsx`, `src/pages/CheckoutPage.jsx`, `src/index.css`.
- Owner nav is denser than early debt notes: Calendar is the `/owner` home for live venues; Overview is Venues; Team, Reports, and Billing sit alongside Earnings and Profile. Courts / bookable spaces remain venue-scoped.
- Customer UI says “court” even when onboarding named a pitch, table, or lane.
- `vite-plugin-pwa` is installed and unused.
- React Hook Form is installed and mostly unused.
- Admin resource pages send a fixed audit reason string.
- Receipt download failures only call `console.error` in `src/pages/BookingDetailPage.jsx`.
- Working tree contains uncommitted homepage, theme, and search work. Keep that work when continuing.

## Phase 1 — Critical Fixes

Frontend contract fixes. Do this before visual polish and before treating checkout as trustworthy.

- [x] Align payment-return statuses with the documented payment enum
  - Completed: 2026-09-23. `classifyPaymentStatus` in `src/utils/paymentStatus.js` accepts `PENDING`, `COMPLETED`, `FAILED`, `REFUNDED`, `PARTIAL`, and the earlier labels `SUCCESS`, `PAID`, `INITIATED`, and `PROCESSING`. The return page polls only while the status is pending.
  - Priority: Critical
  - Area: Frontend
  - Dependencies: Confirm the live backend status strings if the backend repo or a running API is available. Until then, accept both the documented enum and the labels the return page already handles.
  - Relevant files: `src/pages/PaymentReturnPage.jsx`, `src/constants/apiTypes.js`, `src/utils/paymentStatus.js`, `src/api/payments.js`, `src/hooks/useBookings.js`
  - Implementation notes: Confirmed states are `COMPLETED`, `SUCCESS`, and `PAID`. In-progress states are `PENDING`, `INITIATED`, and `PROCESSING`. `REFUNDED` and `PARTIAL` have their own messages. `FAILED` and unknown values keep the retry panel.
  - Acceptance criteria:
    - A `COMPLETED` or `SUCCESS` payment shows the confirmed state.
    - `PENDING`, `INITIATED`, and `PROCESSING` keep polling.
    - `FAILED` shows the retry state.
    - `REFUNDED` and `PARTIAL` have an explicit message and do not look like a fresh failure with no explanation.

- [x] Pay every booking created at checkout, or allow only one consecutive range
  - Completed: 2026-09-23. Checkout creates one booking for a continuous block and starts payment for that booking only. A gap is rejected in the slot picker and again before create.
  - Priority: Critical
  - Area: Frontend
  - Dependencies: Booking create response shape from `POST /customer/bookings`.
  - Relevant files: `src/pages/CheckoutPage.jsx`, `src/pages/ChooseSlotPage.jsx`, `src/hooks/useBookings.js`, `src/api/bookings.js`, `src/api/payments.js`, `src/utils/bookingIntent.js`
  - Implementation notes: Consecutive slots on one court merge into one start and end. A gap never calls `createBooking`. If payment fails after the booking exists, a second click pays that same booking instead of creating another.
  - Acceptance criteria:
    - Every created booking either has its own payment attempt or is never created.
    - The customer can see which bookings were reserved if more than one is created.
    - A failed create stops later creates and tells the customer the slot may have been taken.

- [x] Remove unsupported deposit and fixed-refund claims until the venue policy quote exists
  - Completed: 2026-09-24. Checkout now shows only the full booking total and neutral venue-policy copy. Help no longer states a universal deadline or refund. The booking body and payment initiation remain server-driven.
  - Priority: Critical
  - Area: Frontend / UX
  - Dependencies: The venue booking-policy section below. This task is the interim guard. The policy feature is the lasting fix.
  - Relevant files: `src/pages/CheckoutPage.jsx`, `src/pages/account/HelpPage.jsx`, `src/api/ownerVenues.js`
  - Implementation notes: Removed `paymentType`, the local 30% calculation, balance display, fixed booking-fee claim, and universal refund wording. Checkout now renders those figures only from `POST /customer/bookings/quote`. `src/pages/CheckoutPolicy.test.jsx` covers the display and confirms the booking body contains no policy amounts.
  - Acceptance criteria:
    - Checkout displays pay-now and balance only when the server quote returns them.
    - Help and checkout do not promise a 6-hour full refund unless that rule is in the quote.

- [x] Revoke refresh tokens on logout
  - Completed: 2026-09-24. Customer, owner, and admin sign-out call their logout endpoint when a refresh token exists, then clear `accessToken`, `refreshToken`, and `booknplay-auth` even if the request fails.
  - Priority: Critical
  - Area: Frontend / Security
  - Dependencies: `POST /customer/auth/logout`, `POST /owner/auth/logout`, `POST /admin/auth/logout`.
  - Relevant files: `src/hooks/useAuth.js`, `src/api/auth.js`, `src/api/ownerAuth.js`, `src/api/admin.js`, `src/stores/authStore.js`, `src/components/layout/Navbar.jsx`, `src/components/layout/OwnerLayout.jsx`, `src/components/layout/AdminLayout.jsx`
  - Implementation notes: `src/lib/signOut.js` posts the refresh token to the role logout route, then `authStore.logout` removes both token stores. Navbar, owner sidebar, admin sidebar, and `useAuth` all use that helper. Logout requests set `skipAuthRefresh` so a 401 does not start a token refresh.
  - Acceptance criteria:
    - Customer, owner, and admin sign-out each call their logout endpoint when a refresh token exists.
    - Both token stores are empty after sign-out.
    - A failed logout request still leaves the browser signed out.

## Phase 2 — Core Architecture

- [x] Open the Spring Boot repository before changing booking or tenant rules
  - Completed: 2026-09-25. API project is `C:\Users\Musharaf\Downloads\booknplay\booknplay`.
  - Priority: Critical
  - Area: Backend / Database
  - Dependencies: Location of the BooknPlay API project.
  - Relevant files: `src/constants/apiTypes.js`, `src/api/bookings.js`, `src/api/public.js`, `README.md`
  - Implementation notes: Booking, quote, cancellation preview, cancel, and the business cancellation policy are mapped to `src/api`. Remaining mismatches are under Known Problems: the policy DTO is two fields, not the editor’s advance and no-show cards, and a booking does not store a policy snapshot.
  - Acceptance criteria:
    - The backend repo is identified and its booking, availability, payment, and authorization code is mapped to the clients in `src/api`.
    - Any contract mismatch is added under Known Problems with the real backend file.

- [x] Keep Court as the bookable entity until the backend introduces a resource type
  - Completed: 2026-09-25. The UI now derives Court, Pitch, Table, Pool Table, or Lane from a future `courtType` or the confirmed sport catalog while all requests continue to use `courtId` and the existing court endpoints.
  - Priority: High
  - Area: Frontend / Backend
  - Dependencies: Backend court and sport model.
  - Relevant files: `src/constants/apiTypes.js`, `src/api/ownerVenues.js`, `src/pages/owner/OwnerOnboardingPage.jsx`, `src/pages/owner/OwnerCourtsPage.jsx`
  - Implementation notes: `src/utils/courtResource.js` centralizes display labels and prefers `court.courtType` when available. Onboarding and the customer and owner booking flows use those labels, but `CourtResponse`, owner mutations, availability, booking intents, and calendar operations retain the backend court contract.
  - Acceptance criteria:
    - New UI uses the resource word from onboarding or `court.courtType` when the API returns it.
    - Requests still use `courtId` and the existing court endpoints.

- [x] Normalize venue status values in the client
  - Completed: 2026-09-25. The frontend contract now matches the backend enum, admin options come from the shared status list, and owner live and pending counts use shared classifiers.
  - Priority: High
  - Area: Frontend
  - Dependencies: Backend venue status enum.
  - Relevant files: `src/constants/apiTypes.js`, `src/pages/admin/AdminResourcePages.jsx`, `src/pages/owner/OwnerVenuesPage.jsx`
  - Implementation notes: The confirmed backend enum is `DRAFT`, `PENDING_APPROVAL`, `APPROVED`, `ACTIVE`, `REJECTED`, `SUSPENDED`, `INACTIVE`, and `DELETED`. Live means `APPROVED` or `ACTIVE`; pending setup/review means `DRAFT` or `PENDING_APPROVAL`.
  - Acceptance criteria:
    - Admin status options match the backend enum.
    - Owner live and pending counts use that same list.

## Phase 3 — Authentication & Authorization

Roles in the client today:


| Role           | View                           | Create                           | Update                                    | Delete                  | Approve      | Cancel                           | Refund | Manage                                  |
| -------------- | ------------------------------ | -------------------------------- | ----------------------------------------- | ----------------------- | ------------ | -------------------------------- | ------ | --------------------------------------- |
| CUSTOMER       | Own bookings, public venues    | Own bookings and payments        | Own profile                               | —                       | —            | Own bookings via cancel endpoint | —      | Own account                             |
| BUSINESS_OWNER | Own venues, calendar, earnings | Venues, courts, walk-ins, blocks | Business, courts, pricing, booking status | Courts                  | —            | Booking status patch             | —      | Own business                            |
| STAFF          | Same owner UI as the owner     | Same as owner in the UI          | Same as owner in the UI                   | Same as owner in the UI | —            | Same as owner in the UI          | —      | No separate staff permissions in the UI |
| SUPER_ADMIN    | Platform lists and audit       | Homepage publish                 | Business access, commission, venue status | —                       | Venue status | —                                | —      | Homepage and business access            |


Backend must enforce these limits. Frontend guards only hide routes.

- [x] Add customer and owner password reset only when the API exists
  - Completed: 2026-09-25. Added `requestPasswordReset` and `requestOwnerPasswordReset` API endpoints, created `/auth/forgot-password` and `/owner/forgot-password` recovery screens, and updated login pages to point to dedicated recovery flows instead of help FAQ.
  - Priority: High
  - Area: Frontend
  - Dependencies: Backend reset endpoints.
  - Relevant files: `src/pages/auth/LoginPage.jsx`, `src/pages/owner/OwnerLoginPage.jsx`, `src/pages/auth/ForgotPasswordPage.jsx`, `src/pages/owner/OwnerForgotPasswordPage.jsx`, `src/api/auth.js`, `src/api/ownerAuth.js`
  - Implementation notes: Reset request screens handle submission, loading states, and user feedback cleanly with unit test coverage.
  - Acceptance criteria:
    - Login no longer sends “Forgot password?” to the FAQ.
    - Password reset pages accept email, confirm request status, and return to sign in.

- [x] Separate STAFF permissions from BUSINESS_OWNER in the owner UI
  - Completed: 2026-09-25. Restricted `STAFF` users from accessing earnings (`/owner/earnings`), business profile (`/owner/profile`), or venue creation (`/owner/venues/new`). Filtered owner sidebar links and added path guards.
  - Priority: High
  - Area: Frontend / Security
  - Dependencies: Backend permission claims for `STAFF`.
  - Relevant files: `src/components/layout/OwnerProtectedRoute.jsx`, `src/components/layout/OwnerLayout.jsx`, `src/pages/owner/OwnerVenuesPage.jsx`, `src/hooks/useOwner.js`
  - Implementation notes: `OwnerProtectedRoute` redirects `STAFF` sessions attempting to open restricted owner routes back to `/owner`. Navigation links and venue creation actions are hidden for staff.
  - Acceptance criteria:
    - A `STAFF` session cannot open owner earnings or edit the business profile from the nav.
    - A `BUSINESS_OWNER` session still reaches onboarding, courts, calendar, earnings, and profile.

- [x] Review shared token storage
  - Completed: 2026-09-25. Refactored `authStore.js` and `axios.js` to ensure single-source-of-truth token persistence and store synchronization.
  - Priority: High
  - Area: Security
  - Dependencies: Phase 1 logout task.
  - Relevant files: `src/stores/authStore.js`, `src/lib/axios.js`
  - Implementation notes: Token set and clear operations synchronously update `accessToken`, `refreshToken`, and Zustand persisted auth state (`booknplay-auth`). Interceptor refresh updates store state atomically without raw manual JSON manipulation.
  - Acceptance criteria:
    - Refresh uses the token and role from the auth store snapshot.
    - Signing into a new account or logging out cleanly clears all stored keys.

## Phase 4 — Business Onboarding

Owner registration already tells the user the next step is business details, a venue, sports, and courts. The venue wizard steps are Sports, Location, Hours, Pricing, Amenities, Rules, Preview.

- [x] Show setup progress from the venue payload
  - Completed: 2026-09-25. Implemented `calculateVenueSetup` utility ([venueSetup.js](file:///c:/Users/Musharaf/Downloads/booknplay%20frontend/booknplay-frontend/src/utils/venueSetup.js)) to derive setup completion percentage and interactive checklist across location, courts, operating hours, pricing grid, and booking policy.
  - Priority: High
  - Area: Frontend / UX
  - Dependencies: `setupPercent` or derived criteria on `GET /owner/venues`.
  - Relevant files: `src/pages/owner/OwnerVenuesPage.jsx`, `src/utils/venueSetup.js`, `src/utils/venueSetup.test.js`
  - Implementation notes: Incomplete venues render a setup progress card with a checklist and single-click navigation to the first incomplete step.
  - Acceptance criteria:
    - A new owner sees which of business profile, venue, sport, bookable spaces, and publish state are done.
    - The primary action opens the next incomplete step.

- [x] Verify the onboard payload against the backend
  - Completed: 2026-09-25. Enhanced wizard step validation in [OwnerOnboardingPage.jsx](file:///c:/Users/Musharaf/Downloads/booknplay%20frontend/booknplay-frontend/src/pages/owner/OwnerOnboardingPage.jsx) including operating hours ranges and price thresholds, and mapped backend 400 error field responses to wizard steps.
  - Priority: High
  - Area: Frontend / Backend
  - Dependencies: `POST /owner/venues/onboard` DTO.
  - Relevant files: `src/pages/owner/OwnerOnboardingPage.jsx`, `src/api/ownerVenues.js`, `src/components/owner/LocationPicker.jsx`, `src/pages/owner/OwnerOnboarding.test.jsx`
  - Implementation notes: `onboardVenue` payload validation covers sport selections, location, valid hour intervals, non-zero prices, and policy parameters with automated unit tests.
  - Acceptance criteria:
    - A successful onboard response creates the venue, its courts, hours, and prices without a second manual save.
    - Field errors from the API are shown on the wizard step that owns them.

## Phase 5 — Venue Management

- [x] Keep customer discovery pointed at venue locations
  - Completed: 2026-09-25. Venue cards and detail pages prominently present playable venue addresses and city locations via shared venueDisplayAddress helper, while business operators are cleanly labeled via venueOperatorName without overwriting venue location.
  - Priority: High
  - Area: Frontend
  - Dependencies: Public venue list fields `city`, `address`, `latitude`, `longitude`.
  - Relevant files: `src/pages/HomePage.jsx`, `src/pages/VenueDetailPage.jsx`, `src/utils/venue.js`, `src/api/public.js`
  - Implementation notes: Search results should stay venue cards. Business headquarters must not replace the playable address. Venue detail already shows venue address and city.
  - Acceptance criteria:
    - Venue cards and detail pages show the venue address returned by the API.
    - Business name can appear as the operator without replacing the venue location.

- [x] Support more than the launch city when the API allows it
  - Completed: 2026-09-25. Added centralized Kandy regional towns and areas (Katugastota, Peradeniya, Kundasale, Digana/Pallekele, Tennekumbura, Ampitiya, Akurana, Madawala, Watapuluwa, Nittawela, Polgolla, Kiribathkumbura, Gelioya/Gampola) to search dropdown and destination cards, wired dynamic city query to GET /public/venues, added widen/clear filters empty states, and maintained legacy /search compatibility.
  - Priority: Medium
  - Area: Frontend
  - Dependencies: `GET /public/venues` city filter.
  - Relevant files: `src/utils/searchParams.js`, `src/components/layout/LegacySearchRedirect.jsx`, `src/components/layout/NavSearchBar.jsx`, `src/pages/HomePage.jsx`
  - Implementation notes: `LAUNCH_CITY` is `Kandy`, legacy `/search` forces that city, and the standalone results page has been removed. When nationwide discovery launches, remove the forced city and enable location selection in the homepage flow rather than restoring duplicate results UI.
  - Acceptance criteria:
    - A city chosen in search is sent to `GET /public/venues`.
    - Empty results explain that no venues matched and offer a way to widen the search.
    - Legacy `/search` links remain compatible while discovery uses one canonical homepage venue section.


## Phase 6 — Sports & Resources

- [x] Show sport-specific space names to customers
  - Completed: 2026-09-25. Venue detail and slot selection now render sport-specific icons (soccer for pitch/football, cricket for net/court, pool for lane/swim, table/casino for pool/table-tennis) and accurate resource labels and sport names rather than describing all spaces generically as courts with tennis icons.
  - Priority: Medium
  - Area: Frontend / UX
  - Dependencies: Court name and sport name already returned on the venue.
  - Relevant files: `src/pages/VenueDetailPage.jsx`, `src/pages/ChooseSlotPage.jsx`, `src/pages/owner/OwnerOnboardingPage.jsx`
  - Implementation notes: Onboarding names spaces `Court A`, `Pitch A`, `Table A`, `Lane A`, or `Pool Table A`. Customer pages still label the section “Courts” and use a tennis icon for every sport. Prefer `court.name` and `court.sportName` as the visible identity.
  - Acceptance criteria:
    - Venue detail and slot selection show each space’s name and sport.
    - A pitch, table, or lane is not described only as a court when its name says otherwise.

- [x] Keep pricing rules on the court
  - Completed: 2026-09-25. The owner pricing grid calls replacePricing directly with supported dayOfWeek, startTime, endTime, and price rules. The customer slot picker displays slot.price directly from the server availability API.
  - Priority: Medium
  - Area: Frontend
  - Dependencies: `GET/PUT /owner/courts/:courtId/pricing`.
  - Relevant files: `src/pages/owner/OwnerCourtsPage.jsx`, `src/api/ownerVenues.js`
  - Implementation notes: The grid is weekday start, end, and price. That can later hold peak and weekend rows without a new booking calculator in the frontend. Slot price must stay the `price` returned by availability.
  - Acceptance criteria:
    - Saving the grid calls `replacePricing` with the rules the API already accepts.
    - The slot picker displays `slot.price` from availability, not a locally recomputed rate.


## Phase 7 — Availability Engine

Availability is derived on the server. The client only renders slots.

- [x] Confirm which booking and block states make a slot unavailable
  - Completed: 2026-09-26. Documented the AvailabilitySlotReason enum and derivation rules in apiTypes.js (CONFIRMED/COMPLETED -> BOOKED, PENDING/holds -> HELD, blocks -> BLOCKED, maintenance -> MAINTENANCE, non-operating -> CLOSED). Added availability.js utilities for standardized reason resolution and label mapping, maintaining court isolation.
  - Priority: Critical
  - Area: Backend
  - Dependencies: Backend availability service. Not in this repo.
  - Relevant files: `src/hooks/useVenues.js`, `src/constants/apiTypes.js`, `src/pages/ChooseSlotPage.jsx`, `src/pages/owner/OwnerCalendarPage.jsx`
  - Implementation notes: Customer slots expose `available` and `reason`. Owner calendar maps `AVAILABLE`, `BOOKED`, `HELD`, `BLOCKED`, and `MAINTENANCE`, and treats any unavailable slot without a reason as booked. Closed slots use the documented reason `CLOSED`. Record the backend rule: which of `PENDING`, `CONFIRMED`, holds, blocks, and maintenance overlap a resource.
  - Acceptance criteria:
    - Documented rule lists the statuses that block a court for an overlapping interval.
    - Customer and owner UIs show the same reason for the same slot.
    - A booked court does not mark sibling courts unavailable.

- [x] Refresh availability before checkout submit
  - Completed: 2026-09-26. Configured availability staleTime (15s), enabled immediate quote/availability refresh on 409 conflict, surfaced exact backend conflict error message on the checkout banner, and added a direct action button allowing the customer to return to slot selection with the same venue, court, and date.
  - Priority: High
  - Area: Frontend
  - Dependencies: Phase 1 checkout task.
  - Relevant files: `src/hooks/useVenues.js`, `src/pages/ChooseSlotPage.jsx`, `src/pages/CheckoutPage.jsx`
  - Implementation notes: Availability `staleTime` is 15 seconds. Checkout can sit longer. On submit failure, surface the API message. The current fallback already says the slot may have been taken.
  - Acceptance criteria:
    - A conflict response shows the server message when present.
    - The customer can return to the slot page with the same venue, court, and date.


## Phase 8 — Booking Engine

- [x] Treat the backend as the authority for overlaps
  - Priority: Critical
  - Area: Backend / Database
  - Dependencies: Backend repository.
  - Relevant files: `src/api/bookings.js`, `src/api/ownerCalendar.js`, `src/pages/CheckoutPage.jsx`, `src/pages/owner/OwnerCalendarPage.jsx`
  - Implementation notes: Customer quote, dummy confirm, and owner walk-in share `existsOverlappingBooking`. That check returns matching booking ids, and the court lock disables follow-on locking, so a free slot is not rejected with a server 500. `BookingOverlapRepositoryTest` saves a confirmed 10:00–11:00 booking and rejects a 10:30–11:30 customer create and walk-in with `COURT_ALREADY_BOOKED`. A later slot is allowed, and a cancelled booking does not block the partial overlap. The court row stays `ACTIVE`.
  - Acceptance criteria:
    - Two overlapping confirms for the same court are rejected by the server.
    - A walk-in for an occupied slot returns the same class of conflict as a customer booking.
    - Automated backend tests cover the overlap. Frontend tests can cover payload shaping only.

- [x] Separate ONLINE and WALK_IN booking contracts (no walk-in Payment row)
  - Completed: 2026-10-03 (sibling Spring Boot).
  - Priority: Critical
  - Area: Backend / Database
  - Dependencies: Backend repository. Frontend walk-in client already posts guest name/phone.
  - Relevant files: sibling `OwnerCalendarServiceImpl`, `BookingServiceImpl`, `PaymentServiceImpl`; frontend `src/api/ownerCalendar.js`, `src/pages/owner/OwnerCalendarPage.jsx`
  - Implementation notes: `createWalkIn` saves `BookingSource.WALK_IN` with null customer, guest/contact fields, `CONFIRMED`, and priced `BookingSlot`s — it does **not** call `paymentRepository.save`. Response `paymentStatus` is null. Owner cancel uses `cancelBookingAsOwner` with walk-in branch (`refundMode` `NONE`, no PayHere). `PaymentServiceImpl` rejects `WALK_IN` for PayHere initiate/confirm. Online create still attaches customer + PayHere `Payment`.
  - Acceptance criteria:
    - Walk-in HTTP success persists booking with null `customer_id` and no `payments` insert.
    - Online booking still creates a PayHere payment with customer set.
    - Owner calendar shows the walk-in; cancel/status updates do not NPE on missing Customer or Payment.

- [x] Surface hold expiry when the API returns it
  - Priority: High
  - Area: Frontend
  - Dependencies: Booking response fields for hold expiry. Not present on `BookingResponse` in `src/constants/apiTypes.js`.
  - Relevant files: `src/constants/apiTypes.js`, `src/pages/CheckoutPage.jsx`, `src/pages/BookingDetailPage.jsx`
  - Implementation notes: Dummy confirm returns `CONFIRMED`. The quote expires after 10 minutes (`expiresAt`); the booking response has no hold-expiry field, so checkout shows no countdown. A quote or confirm conflict keeps the server message and returns to that venue’s slot page. Booking detail still prints `booking.status`.
  - Acceptance criteria:
    - Pending bookings show status text.
    - An expiry time is shown only when the API provides one.
    - Paying after expiry shows the server error and sends the customer back to slot selection.

## Phase 9 — Customer Experience

Target path: discover → venue → sport → resource → time → book → pay → play.

- [x] Keep the booking handoff through login
  - Priority: High
  - Area: Frontend
  - Dependencies: Phase 1 checkout fixes.
  - Relevant files: `src/utils/bookingIntent.js`, `src/pages/ChooseSlotPage.jsx`, `src/pages/CheckoutPage.jsx`, `src/components/layout/ProtectedRoute.jsx`, `src/hooks/useAuth.js`
  - Implementation notes: Slot selection saves a session intent and returns to checkout after customer login or registration with the same court, date, and slots. Forgot-password and Player links keep that router state. Owner and admin sessions are sent to customer login and do not enter checkout.
  - Acceptance criteria:
    - A guest who picks a slot and registers lands on checkout with the same court, date, and slots.
    - An owner or admin session is not treated as a customer on checkout routes.

- [x] Implement favourites only when an API exists
  - Priority: Low
  - Area: Frontend
  - Dependencies: A customer favourites endpoint. None is present under `src/api` or the Spring Boot API.
  - Relevant files: `src/pages/account/FavouritesPage.jsx`, `src/App.jsx`
  - Implementation notes: No favourites endpoint exists, so the page stays an empty state and does not list or remove saved venues.
  - Acceptance criteria:
    - The page does not pretend venues are saved.
    - When an endpoint exists, the page lists saved venues and can remove one.

## Phase 10 — Business Dashboard

- [x] Add operational KPIs that the earnings and calendar APIs already return
  - Completed: 2026-09-27. Overview reads `bookingCount` and `gross` from `GET /owner/earnings/summary` for today. It does not calculate occupancy. Staff still see the booking count; revenue stays on the owner view because staff cannot open earnings.
  - Priority: High
  - Area: Frontend
  - Dependencies: `GET /owner/venues/:venueId/calendar`, `GET /owner/earnings/summary`.
  - Relevant files: `src/pages/owner/OwnerVenuesPage.jsx`, `src/pages/owner/OwnerCalendarPage.jsx`, `src/api/ownerEarnings.js`, `src/components/owner/OwnerDashboardUi.jsx`
  - Implementation notes: Venue, live-venue, and bookable-space counts stay. Today’s bookings and today’s revenue replace the old “calendar access” status. Loading skeletons cover the venue list and the earnings cards. A business with no venues still gets the empty state, Create venue, and no Open calendar button.
  - Acceptance criteria:
    - Overview shows today’s booking count and revenue when the API returns them.
    - Loading and empty states exist for a business with no venues.
    - Quick actions still include create venue and open calendar.

- [x] Add a stable courts entry for the selected venue
  - Completed: 2026-09-27. Courts sits next to Calendar when the URL contains a venue id. With no venue, an owner sees Create venue, or “Choose a venue above to open Calendar and Courts” when venues already exist.
  - Priority: Medium
  - Area: Frontend / UX
  - Dependencies: Selected venue id already parsed in `OwnerLayout`.
  - Relevant files: `src/components/layout/OwnerLayout.jsx`, `src/pages/owner/OwnerCourtsPage.jsx`
  - Implementation notes: Calendar and Courts both use the venue id already parsed in `OwnerLayout`. The venue id `new` does not count as a selected venue.
  - Acceptance criteria:
    - With a venue selected, Calendar and Courts are both in the owner nav.
    - With no venue, the nav points the owner to create or choose a venue.

## Phase 11 — Payments

- [x] Verify payment status on the server before showing success
  - Completed: 2026-09-27. The return page classifies `GET /customer/payments/:bookingId` only. Checkout router state and the return query string cannot mark a payment confirmed. A pending status that includes `paymentUrl` is the only redirect. Dummy confirm still lands here after the status endpoint reports `SUCCESS`.
  - Priority: Critical
  - Area: Frontend
  - Dependencies: Phase 1 status mapping. Webhook verification stays in the backend.
  - Relevant files: `src/pages/PaymentReturnPage.jsx`, `src/utils/paymentGateway.js`, `src/api/payments.js`, `.env.example`
  - Implementation notes: The return page already polls `GET /customer/payments/:bookingId` and redirects to `paymentUrl` when present. It must not treat the return query string alone as proof of payment. `VITE_PAYMENT_GATEWAY` defaults to `DUMMY`.
  - Acceptance criteria:
    - Confirmation UI follows the payment status endpoint.
    - Dummy gateway still completes the local path.
    - A missing `bookingId` shows an error with a link back to account bookings.

- [ ] Integrate a sandbox gateway after the contract is stable
  - Priority: High
  - Area: Frontend / Backend
  - Dependencies: Backend webhook verification and the Phase 1 payment fixes.
  - Relevant files: `src/utils/paymentGateway.js`, `src/pages/CheckoutPage.jsx`, `src/pages/account/HelpPage.jsx`, `.env.example`
  - Implementation notes: Help text names the configured development gateway. PayHere stays out of the copy because `PaymentServiceImpl` accepts only `DUMMY` and `processWebhook` rejects every call. Do not hard-code merchant secrets. Sandbox success, failure, and duplicate return stay open until webhook signing exists in the backend.
  - Acceptance criteria:
    - Sandbox success, failure, and duplicate return are exercised.
    - Webhook signing is verified in the backend, not in the browser.
    - Help text names only the gateway that is configured.

## Phase 12 — Platform Administration

- [ ] Confirm admin mutations send a real reason
  - Priority: Medium
  - Area: Frontend
  - Dependencies: Admin audit API already accepts `reason`.
  - Relevant files: `src/pages/admin/AdminResourcePages.jsx`, `src/api/admin.js`
  - Implementation notes: Suspend, enable, and venue status changes send the fixed string `Changed in admin portal`. Ask for a short reason when the action is destructive.
  - Acceptance criteria:
    - Suspend, enable, and status change require a non-empty reason.
    - The audit list shows that reason.

- [ ] Add refund and dispute tools only with backend support
  - Priority: Medium
  - Area: Frontend / Backend
  - Dependencies: Refund endpoints. Payment status `REFUNDED` and `PARTIAL` exist in the client types. No admin refund client exists.
  - Relevant files: `src/api/admin.js`, `src/pages/admin/AdminDashboardPage.jsx`, `src/constants/apiTypes.js`
  - Implementation notes: Do not add a refund button that only changes local state.
  - Acceptance criteria:
    - Admin can record a refund only through an API that updates payment status.
    - The booking and payment views show `REFUNDED` or `PARTIAL` from the server.

## Phase 13 — Notifications

- [ ] Add booking notifications when the backend sends them
  - Priority: Medium
  - Area: Backend
  - Dependencies: Email or SMS provider in the backend. No notification client exists in `src/api`.
  - Relevant files: `src/pages/CheckoutPage.jsx`, `src/pages/PaymentReturnPage.jsx`
  - Implementation notes: Checkout asks for a phone “for SMS booking confirmations” but does not send the phone on the booking payload. Remove that promise until SMS exists, or send the phone only if the DTO accepts it.
  - Acceptance criteria:
    - The UI does not promise SMS or email that the API does not send.
    - When templates exist, confirmed and cancelled bookings trigger one notification each.

## Phase 14 — Reviews & Promotions

- [ ] Leave reviews and customer promotions unimplemented until APIs exist
  - Priority: Low
  - Area: Frontend
  - Dependencies: Review and promotion endpoints. Homepage `ownerPromotion` is CMS content, not a discount engine.
  - Relevant files: `src/pages/HomePage.jsx`, `src/pages/admin/AdminHomepagePage.jsx`
  - Implementation notes: Do not add star ratings or coupon fields that post nowhere.
  - Acceptance criteria:
    - Homepage promotion remains the published CMS section.
    - A review UI is added only with a create and list API.

## Phase 15 — Analytics & Reporting

- [x] Owner reports from earnings summary series
  - Completed: 2026-10-01. `/owner/reports` shows 7-day / 30-day / month presets, KPIs, SVG booking+net trend, daily table, and CSV download from `GET /owner/earnings/summary`. Overview adds a 7-day sparkline and View reports CTA. Staff cannot open Reports.
  - Priority: Medium
  - Area: Frontend
  - Dependencies: `GET /owner/earnings/summary` daily series.
  - Relevant files: `src/pages/owner/OwnerReportsPage.jsx`, `src/components/owner/EarningsTrendChart.jsx`, `src/utils/ownerReports.js`, `src/pages/owner/OwnerVenuesPage.jsx`
  - Implementation notes: No new chart library. Occupancy and per-court breakdown stay out until the API returns them.
  - Acceptance criteria:
    - Owners open Reports and switch date presets.
    - CSV downloads the visible daily rows.
    - STAFF is redirected away from `/owner/reports`.

- [ ] Use the admin dashboard fields already returned
  - Priority: Medium
  - Area: Frontend
  - Dependencies: `GET /admin/dashboard`.
  - Relevant files: `src/pages/admin/AdminDashboardPage.jsx`, `src/hooks/useAdmin.js`, `src/pages/owner/OwnerEarningsPage.jsx`
  - Implementation notes: Admin overview shows customers, businesses, venues, bookings, gross value, and a pending-venue count. Owner earnings already has summary, daily, and payouts. Add charts only after those payloads include series data.
  - Acceptance criteria:
    - Dashboard numbers match the dashboard payload, including zero.
    - Pending venues link to the venue list.
    - Owner earnings states handle an empty payout list.

## Phase 16 — UI/UX Polish

Do this after Phase 1. Follow `DESIGN.md`. Do not restyle the brand.

- [ ] Apply resource language and status text consistently
  - Priority: Medium
  - Area: UX
  - Dependencies: Phase 6.
  - Relevant files: `DESIGN.md`, `src/pages/ChooseSlotPage.jsx`, `src/pages/VenueDetailPage.jsx`, `src/pages/owner/OwnerCalendarPage.jsx`
  - Implementation notes: Calendar already pairs color with labels for available, booked, held, blocked, and maintenance. Customer slots should do the same for unavailable reasons. Keep 44px targets and visible focus.
  - Acceptance criteria:
    - Unavailable slots expose a text reason.
    - Status is never color alone.
    - Reduced motion still disables decorative movement.

- [ ] Split oversized pages only when editing them for a functional fix
  - Priority: Low
  - Area: Frontend
  - Dependencies: The functional phase that touches the file.
  - Relevant files: `src/pages/owner/OwnerOnboardingPage.jsx`, `src/pages/CheckoutPage.jsx`, `src/index.css`
  - Implementation notes: Extract a step or a payment section when a Phase 1 or Phase 4 change makes the file harder to follow. Do not rewrite these files for structure alone.
  - Acceptance criteria:
    - Behavior after an extraction matches the previous flow.
    - Existing class names and theme tokens stay intact.

## Phase 17 — Security

- [ ] Audit backend authorization for venue, court, and booking ids
  - Priority: Critical
  - Area: Backend / Security
  - Dependencies: Backend repository.
  - Relevant files: `src/api/ownerVenues.js`, `src/api/ownerCalendar.js`, `src/api/bookings.js`, `src/components/layout/ProtectedRoute.jsx`, `src/components/layout/OwnerProtectedRoute.jsx`, `src/components/layout/AdminProtectedRoute.jsx`
  - Implementation notes: The client sends ids from the URL. Route guards check the role stored in Zustand. An owner must not read another business’s venue by changing `venueId`. A customer must not read another customer’s booking by changing `bookingId`.
  - Acceptance criteria:
    - Backend tests reject cross-tenant reads and writes with 403 or 404.
    - Frontend guards remain in place and are not treated as the security boundary.

- [ ] Keep secrets in the environment
  - Priority: High
  - Area: Security / DevOps
  - Dependencies: None in the frontend beyond `.env.example`.
  - Relevant files: `.env.example`, `src/lib/axios.js`, `src/utils/paymentGateway.js`
  - Implementation notes: The example file contains only the API base URL and `DUMMY` gateway. Do not commit live keys.
  - Acceptance criteria:
    - `.env` stays untracked.
    - Gateway merchant secrets are absent from the frontend bundle.

## Phase 18 — Testing

- [ ] Normalize the passing Vitest configuration in `npm test` and CI
  - Priority: High
  - Area: Frontend
  - Dependencies: None.
  - Relevant files: `vite.config.js`, `src/test/setup.js`, `package.json`, `src/utils/bookingIntent.test.js`, `src/utils/searchParams.test.js`, `src/utils/apiData.test.js`, `src/utils/venue.test.js`, `src/utils/business.test.js`
  - Implementation notes: All 30 tests passed on 2026-09-24 with `npx vitest run --pool=threads --no-file-parallelism --maxWorkers=1 --no-isolate`. Apply the stable pool/isolation settings to the package script or Vitest config, then use the same command in CI.
  - Acceptance criteria:
    - `npm test` exits with a pass status.
    - Existing unit tests still pass.
    - Tests cover payment status mapping, continuous booking payloads, and the checkout policy guard.

- [ ] Add booking and auth tests after the backend is available
  - Priority: High
  - Area: Backend
  - Dependencies: Phase 8 and Phase 17.
  - Relevant files: `src/api/bookings.js`, `src/api/auth.js`
  - Implementation notes: Prioritize overlap, tenant isolation, cancel, and payment verification over visual component tests.
  - Acceptance criteria:
    - Concurrent overlapping bookings for one court produce one success.
    - A foreign `venueId` or `bookingId` is rejected.

## Phase 19 — Performance

- [ ] Keep public venue queries bounded
  - Priority: Medium
  - Area: Frontend
  - Dependencies: Pagination fields on `GET /public/venues`.
  - Relevant files: `src/hooks/useVenues.js`, `src/utils/searchParams.js`, `src/pages/HomePage.jsx`
  - Implementation notes: Kandy search already sends `size`. Homepage venue queries should keep a page size. Availability stays per court and date.
  - Acceptance criteria:
    - Venue lists request a bounded page size.
    - Slot queries run only after a court id and date exist.

- [ ] Confirm route-level code splitting stays intact
  - Priority: Low
  - Area: Frontend
  - Dependencies: None.
  - Relevant files: `src/App.jsx`, `vite.config.js`
  - Implementation notes: Pages are `lazy()`. Avoid eager imports of owner and admin pages into the customer bundle.
  - Acceptance criteria:
    - `npm run build` still succeeds.
    - Owner and admin pages are separate chunks.

## Phase 20 — Production Deployment

- [ ] Add CI for lint, test, and build
  - Priority: High
  - Area: DevOps
  - Dependencies: Phase 18 Vitest fix.
  - Relevant files: `package.json`, `eslint.config.js`, `vite.config.js`
  - Implementation notes: No CI workflow is in this repository. Add one after tests exit reliably.
  - Acceptance criteria:
    - Pull requests run lint, `npm test`, and `npm run build`.
    - A failed check blocks merge.

- [ ] Prepare hosting, environment, and observability
  - Priority: High
  - Area: DevOps
  - Dependencies: Chosen host and the backend deployment.
  - Relevant files: `.env.example`, `README.md`, `public/manifest.webmanifest`, `vite.config.js`
  - Implementation notes: SPA fallback, HTTPS, and CORS belong with the host and the API. Wire `vite-plugin-pwa` only if offline support is actually required. Error tracking is not installed.
  - Acceptance criteria:
    - Production `VITE_API_BASE_URL` and `VITE_PAYMENT_GATEWAY` are documented without secret values.
    - The hosted app serves client routes on refresh.
    - Backend backups, webhook verification, and uptime checks are tracked in the backend plan.

## Venue booking, advance payment, and cancellation policy

Owner editing, checkout quote, and cancellation preview are implemented against the live two-field policy. Advance settings, no-show rules, a per-venue policy, a booking snapshot, and gateway refunds are still open. Gateway refund timing and payout settlement stay out of scope.

### What exists today

- Venue creation is one wizard in `src/pages/owner/OwnerOnboardingPage.jsx`, including a Booking & Cancellation step. `POST /owner/venues/onboard` still ignores a nested `cancellationPolicy`. The Rules step remains house rules, not the refund policy.
- The venue policy screen saves through `PUT /owner/venues/:venueId/cancellation-policy`. The Spring DTO accepts only `hoursBeforeDeadline` and `refundPercentage`. Read is `GET /owner/cancellation-policy`. The row is one policy per business.
- Customer checkout calls `POST /customer/bookings/quote` with `courtId`, `sportId`, `date`, `startTime`, and `endTime`. The response includes `quoteId`, `expiresAt`, total, pay now, balance, deadline, and late-cancellation text. Pay now is the full slot total. Confirm is `POST /customer/bookings` with `Idempotency-Key`, `quoteId`, and contact details. Local dummy mode confirms the booking, marks payment `SUCCESS`, and copies the current business cancellation fields onto the booking. Quote and confirm return 400 when dummy mode is off.
- `src/pages/account/HelpPage.jsx` directs customers to venue-specific terms without promising a fixed cancellation deadline or refund.
- Cancel opens a preview from `GET /customer/bookings/:id/cancellation-preview`, then `POST /customer/bookings/:id/cancel`. Product expectation: eligible only within 1 hour of `booking.createdAt`, refund equals amount paid (`REFUNDED` via PayHere full refund). Outside that window cancel is ineligible. Partial refunds are not supported. Backend must measure the window from booking time, not play start.
- Documented booking statuses in `src/constants/apiTypes.js`: `PENDING`, `CONFIRMED`, `CANCELLED`, `COMPLETED`, `NO_SHOW`.
- Documented payment statuses: `PENDING`, `COMPLETED`, `FAILED`, `REFUNDED`, `PARTIAL`.
- Payment initiate is `POST /customer/payments/initiate/:bookingId`. The client does not send an amount. That is the correct direction: the server prices the charge.
- Policies are per venue, which matches “one business, many venues”. Courts stay the bookable unit. Do not store a separate advance rule per court in the first version.

### Where the owner step goes

Keep the current wizard order. Insert **Booking & Cancellation** after Pricing and before Amenities.

Sports → Location → Hours → Pricing → Booking & Cancellation → Amenities → Rules → Preview

Pricing stays first so the live example can use the lowest sport price already entered on that step. Amenities and house rules stay separate from money. Preview repeats pay-now, balance, free-cancel deadline, and no-show outcome before publish.

Editing an existing venue uses the same two cards on a venue policy screen opened from the venue card on `src/pages/owner/OwnerVenuesPage.jsx`, next to Manage. Reuse `PUT /owner/venues/:venueId/cancellation-policy` if the backend can extend that resource. Add a GET for the same path. Do not add a second policy URL until the backend shows that this resource cannot hold payment rules.

### Owner cards

Card 1, payment settings:

- Require advance payment.
- Advance type: percentage of the booking total, or a fixed LKR amount.
- Percentage choices: 25, 30, 50, 100, or a custom percent from 1 to 100.
- Fixed amount in LKR, greater than 0.
- Remaining balance: pay at the venue, or pay online before the booking start. No third method exists in the client.
- Live example from the pricing step, or LKR 4,000 when no price is entered yet. Show booking price, pay now, and remaining. Example at 30% of 4,000: pay now LKR 1,200, remaining LKR 2,800.

Card 2, cancellation:

- Allow customer cancellation.
- Free cancellation within 1 hour of booking for a full refund of the amount paid (PayHere full refund only).
- After that hour from booking: customer cannot cancel.
- No partial refund %, fixed LKR fee, or hours-before-play-start control in the live editor.

When cancellation is off, the deadline and fee fields stay hidden and checkout says the booking cannot be cancelled by the customer.

### Money rules

The backend is the only calculator. Checkout, the owner example, and the cancel dialog display server numbers. The client may mirror the formula for the owner’s live example and must replace those figures with the server response before publish and before pay.

Use decimal money or integer cents. LKR has two decimal places. Do not use binary floating point for persisted amounts. Percentage results round half-up to the minor unit.

Bases, so a percent is never ambiguous:

- An advance percent applies to the **booking total**.
- A fixed advance is `min(fixed amount, booking total)`.
- Pay now is 0 when advance is not required. The whole total then follows the remaining-balance method.
- Pay now equals the total when the advance is 100% or the fixed advance covers the total. Remaining is 0.
- A cancellation percent applies to the **amount already paid** on that booking, not to the unpaid balance and not to the original total.
- A fixed cancellation fee is a currency amount.
- `refundAmount = max(0, eligiblePaidAmount - cancellationFee)`.
- The fee retained is `eligiblePaidAmount - refundAmount`.
- “Full refund” and “refund amount paid” both refund the amount already paid. They do not refund a balance the customer has not paid.
- “Refund advance payment” refunds only the advance portion of what was paid, and never more than the amount paid.

Worked example: total LKR 4,000, advance 25%, customer paid LKR 1,000. A 50% fee on the amount paid retains LKR 500 and refunds LKR 500.

### Cancellation time

Store the deadline on the booking when the booking is confirmed.

`deadline = booking start date and start time minus freeCancellationHours`

Booking on 25 September at 5:00 PM with a 12-hour rule has a deadline of 25 September at 5:00 AM. Use the venue local time. The customer UI formats that instant. It does not ask the customer to subtract the hours.

After the deadline, the after-deadline fee applies. A no-show uses the no-show rule, not the late-cancel fee.

The first version edits one free window and one after-deadline outcome. Store them as an ordered list of windows (`hoursBeforeStart`, fee type, fee value) so a later version can add the 12-hour / 6-hour / under-6-hour bands without a new calculator.

### Policy snapshot

Confirming a booking copies the venue policy version onto that booking, including the resolved pay-now rule, balance method, cancellation flag, windows, no-show rule, and the computed deadline.

A later edit to the venue policy applies only to bookings confirmed after the edit. A booking made under a 24-hour rule keeps that snapshot when the venue changes to 12 hours.

### Booking and payment states

Keep the existing booking statuses. Do not add a parallel set.


| Need                             | Use                                                                                                                              |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Awaiting payment                 | Booking `PENDING` plus payment `PENDING`                                                                                         |
| Slot accepted                    | Booking `CONFIRMED`                                                                                                              |
| Advance paid, balance still due  | Booking `CONFIRMED`, with `amountPaid` below `totalAmount`. Payment `PARTIAL` already means a partial charge on the return page. |
| Total paid                       | Booking `CONFIRMED` or later `COMPLETED`, with `amountPaid` covering `totalAmount`                                               |
| Customer cancelled               | Booking `CANCELLED`                                                                                                              |
| Refund still processing          | Refund record `PENDING`. Booking stays `CANCELLED`.                                                                              |
| Part of the paid amount returned | Refund record for that amount. Payment `PARTIAL` when the charge is only partly returned.                                        |
| Eligible paid amount returned    | Payment `REFUNDED`                                                                                                               |
| Customer did not arrive          | Booking `NO_SHOW`, already in `src/constants/apiTypes.js`                                                                        |
| Played                           | Booking `COMPLETED`                                                                                                              |


Skip `PENDING_PAYMENT`, `PARTIALLY_PAID`, `FULLY_PAID`, `CANCELLATION_REQUESTED`, `REFUND_PENDING`, and `PARTIALLY_REFUNDED` as booking statuses. Those are either the pairs above or a refund record. Add a refund record rather than overloading the booking row. The owner marks `NO_SHOW` from the existing booking status update, `PATCH /owner/bookings/:bookingId/status`.

### API

Confirm the live cancellation-policy DTO before coding. Extend the existing owner resource when it can carry this payload.

- `GET` and `PUT /owner/venues/:venueId/cancellation-policy` for the two cards. The owner client already has the PUT.
- Include the same object on `POST /owner/venues/onboard` when that DTO can accept it, so the wizard does not need a second save. If it cannot, call the PUT with the new venue id from the onboard response.
- `POST /customer/bookings/quote` with `courtId`, `sportId`, `date`, `startTime`, and `endTime`. Response includes `quoteId`, `expiresAt`, `paymentMode`, `slots`, `totalAmount`, `payNow`, `balanceDue`, `balanceCollection`, `cancellationAllowed`, `cancellationDeadline`, `afterDeadlineSummary`, and `noShowSummary`. There is no `policyVersion`.
- Create booking is `POST /customer/bookings` with header `Idempotency-Key` and body `quoteId` plus contact. The browser does not submit pay-now or refund figures. The server prices from the stored quote.
- Initiate payment stays `POST /customer/payments/initiate/:bookingId`. The charge amount is the server `payNow`.
- `GET /customer/bookings/:id/cancellation-preview` returns `eligible`, `amountPaid`, `cancellationFee`, `refundAmount`, `refundMethod`, `deadline`, and a message when cancellation is closed.
- Cancel stays `POST /customer/bookings/:id/cancel`. The server recalculates the preview and rejects the call when the customer is ineligible. The response includes the refund figures actually applied.
- Refund progress stays on `GET /customer/payments/:bookingId`, which already returns `REFUNDED` and `PARTIAL`.

Owner and customer ids in the URL are not proof of ownership. The backend checks the signed-in user, then the business, then the venue, then the policy. A customer can preview and cancel only a booking whose `customerId` is theirs.

### Customer UI

Checkout replaces the local full-versus-30% radios with the quote:

- Booking total
- Pay now
- Remaining, labeled with pay at venue or pay online before the start
- Free-cancellation deadline as a date and time, or a line that cancellation is not available
- After the deadline, the fee in plain language
- No-show outcome

Confirm stays disabled until the quote returns a `quoteId`. A consumed, expired, or repriced quote shows the server message and sends the customer back to slot selection. A slot that is already booked, blocked, or outside opening hours returns that conflict instead of the disabled-checkout error.

The cancel dialog on `src/pages/BookingDetailPage.jsx` loads the preview first:

- Amount paid
- Cancellation fee
- Refund amount
- Refund method: original payment method
- Keep booking, and confirm cancellation

Confirm calls the existing cancel endpoint. The dialog shows the preview error when the deadline has passed or the venue disallows cancellation, and it hides confirm in that case.

### Implementation tasks

- [ ] Extend the venue policy contract and snapshot it onto the booking
  - Priority: Critical
  - Area: Backend / Database
  - Dependencies: Spring Boot repository. Map `PUT /owner/venues/:venueId/cancellation-policy` before adding a new path.
  - Relevant files: `src/api/ownerVenues.js`, `src/constants/apiTypes.js`, `src/api/bookings.js`
  - Implementation notes: Persist one current policy per venue and a version each time it changes. On confirm, copy that version onto the booking with the computed deadline and the pay-now amounts. Use decimal or minor-unit money. Authorize owner writes by business ownership of the venue.
  - Acceptance criteria:
    - Two venues in one business can store different advance and cancellation rules.
    - An owner cannot read or write another business’s policy.
    - A booking keeps the policy version it was confirmed with after the venue policy changes.
    - Refund and pay-now amounts from the client are ignored.

- [x] Add the Booking & Cancellation step to venue setup and a later edit screen
  - Frontend completed: 2026-09-24. Onboarding now includes the step after Pricing, and each venue has a version-aware policy editor linked from its card and owner navigation. Live persistence remains dependent on the Spring Boot DTO.
  - Priority: High
  - Area: Frontend / UX
  - Dependencies: The policy contract above.
  - Relevant files: `src/pages/owner/OwnerOnboardingPage.jsx`, `src/pages/owner/OwnerVenuesPage.jsx`, `src/api/ownerVenues.js`, `src/components/layout/OwnerLayout.jsx`
  - Implementation notes: Insert the step after Pricing. Two cards, as specified above. The live example uses the pricing-step amount and labels itself as an illustration until save returns the stored policy. Add a policy action on the venue card for later edits. House rules stay on the Rules step.
  - Acceptance criteria:
    - A new venue can be published with advance and cancellation choices included.
    - An existing venue can open the same cards and save them through the policy endpoint.
    - Invalid percents, zero fixed amounts, and negative hours are rejected before save.

- [x] Show the server quote at checkout
  - Completed: 2026-09-25. `POST /customer/bookings/quote` is on `BookingController`. Checkout blocks confirmation until it succeeds and renders the server total, pay-now amount, balance, deadline, and late-cancellation text. Pay now is the full slot total until advance rules are stored.
  - Priority: Critical
  - Area: Frontend
  - Dependencies: `POST /customer/bookings/quote`.
  - Relevant files: `src/pages/CheckoutPage.jsx`, `src/api/bookings.js`, `src/pages/account/HelpPage.jsx`
  - Implementation notes: Replace the interim full-total/neutral-copy guard when the quote is wired. Display total, pay now, remaining, deadline, after-deadline fee, and no-show text from the quote. Initiate payment still sends only the booking id.
  - Acceptance criteria:
    - Confirm & Pay charges the quoted pay-now amount.
    - The customer sees the deadline in local date and time before paying.
    - Help text no longer states a universal 6-hour full refund.

- [x] Preview and confirm cancellation from the server
  - Completed: 2026-09-25. `GET /customer/bookings/:id/cancellation-preview` and cancel share one calculator in `BookingServiceImpl`. The dialog shows paid, fee, refund, and method, and hides confirm when `eligible` is false. Gateway refund execution and a no-show snapshot rule remain open.
  - Priority: Critical
  - Area: Frontend / Backend
  - Dependencies: `GET /customer/bookings/:id/cancellation-preview` and the existing cancel endpoint.
  - Relevant files: `src/pages/BookingDetailPage.jsx`, `src/api/bookings.js`, `src/hooks/useBookings.js`
  - Implementation notes: Open the dialog with the preview figures. Confirm sends no amounts. Recalculate on the server at cancel time so a deadline that passed while the dialog was open is rejected.
  - Acceptance criteria:
    - The dialog shows amount paid, fee, refund, and original payment method before cancel.
    - The refund never exceeds the amount paid and is never negative.
    - A customer cannot preview or cancel another customer’s booking.
    - A no-show follows the no-show rule on the booking snapshot.

## Immediate priorities

1. Extend the cancellation policy beyond `hoursBeforeDeadline` and `refundPercentage` so advance payment, a fixed fee, and no-show rules persist, then snapshot that version onto each booking.
2. Make `POST /owner/venues/onboard` store the policy, and keep later edits from changing bookings already confirmed.
3. Move the passing Vitest settings into `npm test` and CI, and fix the `src/test/setup.js` suite error plus the `SportsEquipment.jsx` lint error.
4. Run customer, owner, and admin flows against `C:\Users\Musharaf\Downloads\booknplay\booknplay`.
5. Sandbox the real payment gateway only after the status contract is confirmed. Local development defaults to `DUMMY` with dummy payments enabled, so quote and confirm work without a gateway. Refund execution is still a local payment-status update, not a gateway call.

## Release definition

The product is production-ready when:

- lint, tests, and the production build pass in CI;
- a customer can discover a venue, hold a slot, pay, and see the server-confirmed booking;
- an owner can onboard a venue and manage the same slots through the calendar, including walk-ins;
- an admin can suspend a business and approve a venue with an audit reason;
- authorization is enforced by the backend for every venue, court, and booking id;
- payment success follows server verification, including failed and duplicate callbacks;
- monitoring, backups, rollback, and support steps exist for the API and the frontend.

---

## Production Audit Totals

- P0 launch blockers: **12**
- P1 pre-launch reliability and quality issues: **10**
- P2 post-launch improvements: **7**
- Readiness: **28%**

# Production GO / NO-GO Checklist

Production launch is permitted only when every item below is checked and the evidence is attached to the release record.

- [ ] All P0 issues are completed, independently reviewed, and verified in the production-like environment.
- [ ] The frontend production build, lint gate, and bounded test suite all pass in CI.
- [ ] All backend tests pass against an isolated test database without touching development or production data.
- [ ] The production database uses reviewed Flyway migrations; startup schema mutation and data overwrite jobs are disabled.
- [ ] A production backup has completed and a restore drill has passed with recorded RPO and RTO results.
- [ ] The frontend, API, callbacks, and media paths use valid HTTPS endpoints and trusted certificates.
- [ ] Required environment variables are supplied by the approved secret manager and fail-fast validation passes.
- [ ] No production bundle or runtime configuration contains localhost, loopback, private-development, ngrok, or sandbox fallbacks.
- [ ] Authentication, password reset, session revocation, token rotation, and logout behavior pass the security test plan.
- [ ] Customer, owner, and administrator authorization checks pass for every object identifier and role boundary.
- [ ] Concurrent booking and late-webhook tests prove that a discrete court slot cannot be confirmed twice.
- [ ] PayHere live merchant payment, return, cancel, notify, signature, amount, currency, duplicate, and replay scenarios pass.
- [ ] Cancellation wording and backend enforcement match, and refund retries, failures, reconciliation, and operator visibility pass.
- [ ] SMSLenz OTP and notification delivery, throttling, retry, failure, and support flows pass with production credentials.
- [ ] Health checks, alerting, dashboards, structured logs, audit events, and on-call ownership are active.
- [ ] The deployment rollback rehearsal succeeds for frontend, API, database migrations, and configuration.
- [ ] Launch-day smoke tests pass on approved desktop and mobile browsers and are signed off by product, engineering, security, and operations.

## Launch Decision

**Status: 🔴 NO-GO**

The actual remaining launch blockers are:

1. Committed database, JWT, and mail credentials have not been rotated and purged; the tracked debug log also remains in scope for removal.
2. Production profiles, externalized configuration, fail-fast validation, and safe production origins/endpoints are not established.
3. Database evolution and startup mutation remain unsafe, and backend tests are neither isolated nor passing.
4. PayHere is not live-ready: merchant and URL configuration needs verification, callback validation is incomplete, and sandbox behavior remains.
5. Booking confirmation does not share the court-locking boundary, and migration-backed discrete-slot integrity protection is absent.
6. Cancellation semantics conflict across frontend and backend, while refunds lack durable states, idempotent recovery, and reconciliation.
7. Distributed rate limits and several production security controls are missing; CORS accepts hostile credentialed origins.
8. Frontend lint and bounded tests do not pass; backend reports 116 tests with 3 failures and 5 errors.
9. HTTPS hosting, private managed MySQL, persistent media storage, monitoring, verified backups, CI/CD, and rehearsed rollback are not ready.
10. Live PayHere, SMSLenz, DNS, real-device/browser, and production operational checks remain **⚠️ NEEDS VERIFICATION**.

**Final production decision: 🔴 NO-GO until every P0 item and every checklist gate above is verified.**
