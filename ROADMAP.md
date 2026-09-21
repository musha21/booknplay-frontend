# BookNPlay Roadmap

Last updated: 2026-09-21

## Product scope

BookNPlay is a multi-sport venue discovery, court booking, and facility-management platform. The frontend contains customer, venue-owner, and administrator portals that communicate with a REST API.

```text
Customer portal       Owner portal          Admin portal
       |                    |                    |
       +--------------------+--------------------+
                            |
                  REST API with JWT auth
                            |
               Backend, database, and storage
```

This roadmap reports the status of this frontend repository. Backend capabilities listed in the API client still require verification against the target backend environment.

## Status legend

- Complete: implemented locally and passing the applicable static/build check.
- In progress: substantial implementation exists, but integration or acceptance testing remains.
- Planned: not yet implemented or only foundational dependencies/assets exist.
- Blocked: cannot be treated as complete until a known problem is resolved.

## Current status

| Area | Status | Evidence / remaining work |
|---|---|---|
| Frontend foundation and design system | Complete | React, Vite, MUI, Tailwind, responsive layouts, theme mode, notifications, and lazy-loaded routes are present. |
| Customer discovery and booking UI | In progress | Main journey is implemented; live API and cross-browser acceptance testing remain. |
| Customer authentication and account | In progress | Login, registration, protected account routes, bookings, profile, favourites, privacy, and help are implemented; live auth validation remains. |
| Payment frontend | In progress | Initiation, status polling, return handling, invoices, and gateway selection exist; real gateway and webhook testing remain. |
| Venue owner portal | In progress | Authentication, onboarding, courts, pricing, calendar, walk-ins, maintenance, earnings, payouts, and profile UI/API clients exist; end-to-end validation remains. |
| Admin portal | In progress | Authentication, dashboard, business, venue, customer, audit, and homepage-management workflows exist; permission and backend validation remain. |
| Production build | Complete | `npm run build` succeeds. |
| Linting | Complete | `npm run lint` succeeds. |
| Automated tests | Blocked | Unit/component tests exist, but Vitest currently hangs instead of terminating reliably. |
| PWA | Planned | A manifest and PWA dependency exist, but service-worker/PWA plugin configuration and offline behavior are not complete. |
| Deployment and operations | Planned | Hosting, CI/CD, monitoring, production environment configuration, and operational runbooks remain. |

## Implemented architecture

### API layer

- `src/lib/axios.js`: shared HTTP client, API base URL, bearer tokens, and refresh behavior.
- `src/api/public.js`: venues, sports, businesses, homepage content, courts, and availability.
- `src/api/auth.js`: customer registration, login, refresh, logout, and profile.
- `src/api/bookings.js`: customer booking creation, lookup, lists, and cancellation.
- `src/api/payments.js`: payment initiation, status, invoices, and PDF downloads.
- `src/api/owner*.js`: owner authentication, business profile, venues, courts, pricing, calendar, maintenance, earnings, and payouts.
- `src/api/admin.js`: admin authentication, dashboard, resources, access controls, commissions, audit data, and homepage publishing.

### State and data access

- Zustand persists authentication state.
- TanStack React Query manages server state and mutations.
- Role-specific route guards protect customer, owner, and admin areas.
- Utility modules normalize API envelopes, venues, businesses, search parameters, booking intent, media URLs, and gateway configuration.

### Existing routes

- Customer: home, search, venue details, slots, checkout, payment return, booking details, and account pages.
- Owner: login, registration, venues, onboarding, courts, calendar, earnings, and profile.
- Admin: login, dashboard, homepage management, businesses, venues, customers, and audit.

## Delivery roadmap

### Phase 1: Stabilize the current beta

- [x] Establish the React/Vite application and branded responsive UI.
- [x] Implement customer, owner, and admin route structures.
- [x] Pass ESLint and the optimized production build.
- [ ] Diagnose and fix the Vitest process hang.
- [ ] Add CI checks for lint, tests, and build.
- [ ] Test all primary flows against a live backend environment.
- [ ] Add route-level error boundaries and consistent API failure states.
- [ ] Complete accessibility, mobile, and browser acceptance testing.

Exit criteria: lint, tests, and build pass in CI; critical customer and authentication flows pass end-to-end.

### Phase 2: Complete customer booking and payments

- [x] Implement venue search, detail, availability, and slot-selection interfaces.
- [x] Implement authenticated checkout and booking-management interfaces.
- [x] Implement payment initiation, return-state handling, polling, and invoice clients.
- [ ] Verify slot holds, expiry, concurrency, cancellation, and retry scenarios end-to-end.
- [ ] Integrate a real payment provider in sandbox mode.
- [ ] Verify signed backend webhooks, duplicate callbacks, failed payments, and refunds.
- [ ] Add transactional email/SMS notifications for authentication and bookings.

Exit criteria: a customer can complete, verify, cancel, and retrieve a booking safely using the selected sandbox gateway.

### Phase 3: Validate the venue owner portal

- [x] Implement owner authentication and protected navigation.
- [x] Implement business profile and image upload clients.
- [x] Implement venue onboarding and location selection.
- [x] Implement courts, operating hours, pricing rules, and cancellation policies.
- [x] Implement calendar, walk-in booking, maintenance, and blocked-slot clients.
- [x] Implement earnings summaries and payout history.
- [ ] Validate uploads, map coordinates, complex pricing, and operating-hour edge cases.
- [ ] Validate booking status changes and calendar concurrency against the backend.
- [ ] Add complete form-level and integration test coverage.

Exit criteria: an owner can onboard a venue and manage its day-to-day operation without manual database changes.

### Phase 4: Validate and extend the admin portal

- [x] Implement admin authentication, layout, and protected routes.
- [x] Implement dashboard and resource views for businesses, venues, customers, and audit data.
- [x] Implement business access, commission, and venue-status clients.
- [x] Implement homepage draft, publish, version, and restore workflows.
- [ ] Verify role permissions and unauthorized-access handling.
- [ ] Complete venue approval/KYC review workflows.
- [ ] Add refund/dispute management and financial settlement workflows.
- [ ] Add platform analytics, GMV, booking trends, and sport/location reporting.
- [ ] Add integration and audit-log acceptance tests.

Exit criteria: administrators can safely operate the platform with traceable, permission-controlled actions.

### Phase 5: Advanced product capabilities

- [ ] Configure installable PWA behavior and offline fallbacks.
- [ ] Add push notifications and booking reminders.
- [ ] Add customer reviews and ratings.
- [ ] Add community matchmaking and open games.
- [ ] Add real-time availability updates using WebSockets or server-sent events.
- [ ] Add richer favourites, recommendations, and personalized discovery.

### Phase 6: Production readiness and deployment

- [ ] Define production environment variables and secret-management rules.
- [ ] Deploy the frontend to the selected hosting platform.
- [ ] Deploy and secure the backend, database, and media storage.
- [ ] Configure HTTPS, CORS, CSP, caching, and SPA route rewrites.
- [ ] Add error tracking, logs, metrics, uptime checks, and alerting.
- [ ] Add database backups and disaster-recovery procedures.
- [ ] Run performance, security, load, and recovery tests.
- [ ] Document release, rollback, support, and incident-response procedures.

Exit criteria: the system is observable, recoverable, secured, and deployable through a repeatable release process.

## Immediate priorities

1. Fix the Vitest hang and establish a reliable CI quality gate.
2. Run customer, owner, and admin flows against the live backend.
3. Complete payment sandbox and webhook verification.
4. Resolve authorization and data-validation defects found during integration testing.
5. Prepare a staging deployment for stakeholder acceptance testing.

## Release definition

The frontend can be called production-ready only when:

- lint, automated tests, and production build pass in CI;
- customer, owner, and admin critical paths pass end-to-end;
- authorization is enforced by both frontend guards and backend permissions;
- real payment and webhook failure modes are verified;
- production monitoring, backups, rollback, and support procedures exist;
- no release-blocking accessibility, security, or responsive-layout defects remain.
