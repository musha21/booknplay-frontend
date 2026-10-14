# 08 — Ops & Config

Local run, environment variables, verification commands, and known gaps for company technical review.

---

## Local run (two processes)

### Backend

```bash
cd path/to/booknplay          # Spring Boot repo
# Ensure MySQL is up with database booknplay
# Configure application-local.properties or OS env (gitignored)
./mvnw spring-boot:run
```

- API: `http://localhost:8080`
- Swagger: `http://localhost:8080/swagger-ui.html`
- OpenAPI JSON: `http://localhost:8080/v3/api-docs`

### Frontend

```bash
cd path/to/booknplay-frontend
cp .env.example .env
npm install
npm run dev
```

- App: `http://localhost:5173`

PayHere local notify typically needs a tunnel (ngrok) pointed at `/api/v1/webhook/payhere/notify`. See backend `payhere.sandbox.env.example`.

---

## Frontend environment (names only)

From `.env.example`:

| Variable | Purpose |
|----------|---------|
| `VITE_API_BASE_URL` | API root, e.g. `http://localhost:8080/api/v1` |
| `VITE_PAYMENT_GATEWAY` | Gateway code sent on initiate (e.g. `PAYHERE`) |
| `VITE_OWNER_SUBSCRIPTIONS` | `true`/`false` — show owner billing UI |
| `VITE_GOOGLE_MAPS_JS_KEY` | Maps JavaScript API (+ Places New if shared) |
| `VITE_GOOGLE_PLACES_KEY` | Optional Places alias |
| `VITE_GOOGLE_GEOCODING_KEY` | Geocoding for pins |

Restrict Google keys by HTTP referrer (`localhost:5173`, production domains). Never put PayHere merchant secrets in Vite env.

### Frontend scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Vite dev server |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview build |
| `npm run lint` | ESLint |
| `npm test` | Vitest once |
| `npm run test:watch` | Vitest watch |

---

## Backend environment (names only)

Prefer gitignored `application-local.properties` and/or OS env. Example templates:

- `payhere.sandbox.env.example`
- `smslenz.env.example`

| Area | Property / env names |
|------|----------------------|
| DB | `spring.datasource.url`, `username`, `password` |
| JWT | `jwt.secret`, `jwt.access-token-expiry-ms`, `jwt.refresh-token-expiry-ms` |
| Mail | `spring.mail.host`, `port`, `username`, `password` |
| App | `app.base-url`, `server.port` |
| PayHere | `payhere.merchant-id`, `merchant-secret`, `app-id`, `app-secret`, `notify-url`, `return-url`, `cancel-url`, `checkout-url` |
| SMS | `smslenz.user-id`, `api-key`, `sender-id` (or `SMSLENZ_*` env overrides) |

**Security note for reviewers:** ensure production secrets are not committed. Local property files and `.env` must remain gitignored. Rotate any credentials that were ever checked into shared configs.

### Backend commands

| Command | Purpose |
|---------|---------|
| `./mvnw spring-boot:run` | Run API |
| `./mvnw test` | Unit / service tests |
| `./mvnw -DskipTests package` | Build jar |

---

## Role smoke checklist

| Role | Login path | Minimal smoke |
|------|------------|---------------|
| Customer | `/auth/login` | Search → slots → checkout → PayHere sandbox → booking detail |
| Owner | `/owner/login` | Onboard venue → court → pricing → calendar → walk-in |
| Admin | `/admin/login` | Venue status → homepage publish → payout generate |

Also verify token refresh: wait for access expiry or force 401 and confirm silent refresh for each role.

---

## Known gaps / review risks

Captured from current frontend README and architecture review (validate against latest CI before release):

1. **E2E against deployed backend** — still a release gate; exercise all three portals.
2. **Payment sandbox** — notify URL, return URLs, deposit vs full pay, cancel path, refund API keys.
3. **Automated tests** — frontend Vitest reliability / CI termination has been a known concern; confirm current suite status before treating tests as a merge gate.
4. **DB migrations** — local `ddl-auto=update` is not a production migration strategy.
5. **Media storage** — local `/uploads` may need object storage for multi-instance deploy.
6. **Secrets hygiene** — keep merchant/SMS/JWT secrets out of git; use secret manager in prod.
7. **Monitoring** — error reporting / uptime not covered in this docs set; track separately for launch.

---

## Release checklist (condensed)

1. Frontend `build` + `lint` green; backend tests green.
2. Auth refresh + authorization for customer, owner, staff, admin.
3. PayHere sandbox notify + return + refund path verified.
4. Owner submit → admin approve → customer can book live venue.
5. Admin payout settle with bank verification.
6. Production env vars, HTTPS, backups, and monitoring configured.

---

## Doc map

- Architecture → [01-system-overview.md](./01-system-overview.md)
- Portal features → [04-portal-features.md](./04-portal-features.md)
- Flows → [05-customer-owner-flows.md](./05-customer-owner-flows.md)
- API / auth / pay → [06-api-auth-payments.md](./06-api-auth-payments.md)
