# 02 — Backend

Spring Boot API for BookNPlay. Artifact: `lk.booknplay:booknplay` (Java 17, Spring Boot 3.4.x).

## Stack

| Layer | Choice |
|-------|--------|
| Runtime | Java 17 |
| Framework | Spring Boot Web + Security + Validation + Mail |
| Persistence | Spring Data JPA / Hibernate → MySQL |
| Auth | JWT (jjwt), BCrypt, refresh tokens |
| Docs | springdoc OpenAPI (`/swagger-ui.html`) |
| Rate / cache | Bucket4j, Caffeine |
| Payments | PayHere (checkout page + notify webhook + refund API) |
| SMS | SMSlenz OTP |
| PDF | OpenPDF (invoices) |

Default server port: **8080**. Context API prefix: **`/api/v1`**.

## Package layout

| Package | Responsibility |
|---------|----------------|
| `controller.*` | HTTP endpoints by portal |
| `service` / `service.impl` | Domain workflows |
| `repository` | JPA repositories |
| `entity` | Tables / aggregates |
| `dto.request` / `dto.response` | API contracts |
| `security.jwt` / `security.filter` | Token issue/validate + filter |
| `config` | `SecurityConfig`, CORS, etc. |
| `exception` | `BadRequestException`, `ResourceNotFoundException`, … |

## Controllers by area

### Public

| Controller | Base path | Notes |
|------------|-----------|-------|
| `PublicVenueController` | `/api/v1/public` | Homepage, businesses, venues, courts, sports, promotions, reviews |
| `AvailabilityController` | `/api/v1/public/availability` | Court/date availability |
| `PayHereCheckoutController` | `/api/v1/public/payhere` | HTML checkout by token |
| `PayHereReturnController` | `/api/v1/public/payhere` | Return / cancel browser callbacks |

### Auth (shared OTP)

| Controller | Base path |
|------------|-----------|
| `OtpAuthController` | `/api/v1/auth` — OTP request/verify, phone register, password forgot/reset |
| `UserPhoneController` | `/api/v1/user/phone` — link phone (authenticated customer) |

### Customer

| Controller | Base path |
|------------|-----------|
| `CustomerAuthController` | `/api/v1/customer/auth` |
| `CustomerController` | `/api/v1/customer/profile` |
| `BookingController` | `/api/v1/customer/bookings` |
| `PaymentController` | `/api/v1/customer/payments` |

### Owner

| Controller | Base path |
|------------|-----------|
| `OwnerAuthController` | `/api/v1/owner/auth` |
| `OwnerBusinessController` | `/api/v1/owner/business` |
| `OwnerVenueController` | `/api/v1/owner` (venues, media, hours, cancellation policy) |
| `OwnerCourtController` | `/api/v1/owner` (courts, pricing) |
| `OwnerCalendarController` | `/api/v1/owner` (calendar, walk-in, maintenance, blocked slots) |
| `OwnerPortalController` | `/api/v1/owner` (bookings, payments, refunds, customers, sports, promotions, settings, reviews, activity) |
| `OwnerDashboardController` | `/api/v1/owner/dashboard` |
| `OwnerEarningsController` | `/api/v1/owner` (earnings, payouts) |
| `OwnerStaffController` | `/api/v1/owner/staff` |
| `OwnerSubscriptionController` | `/api/v1/owner/subscription` |

### Admin

| Controller | Base path |
|------------|-----------|
| `AdminAuthController` | `/api/v1/admin/auth` |
| `AdminPlatformController` | `/api/v1/admin` (dashboard, businesses, venues, plans, audit) |
| `AdminPayoutController` | `/api/v1/admin` (payouts, bank verification, payout config) |
| `AdminHomepageController` | `/api/v1/admin/homepage` |
| `CustomerAdminController` | `/api/v1/admin/customers` |

### Webhooks

| Controller | Base path |
|------------|-----------|
| `PayHereWebhookController` | `/api/v1/webhook/payhere/notify` |
| `PaymentWebhookController` | `/api/v1/webhook/payment/{gateway}` |

## Security (`SecurityConfig`)

- Stateless sessions; CSRF disabled; CORS enabled
- JWT filter before `UsernamePasswordAuthenticationFilter`
- Unauthenticated 401 (so clients can refresh); wrong role → 403
- Role matchers:
  - `SUPER_ADMIN` → `/api/v1/admin/**`
  - `BUSINESS_OWNER` or `STAFF` → `/api/v1/owner/**`
  - `CUSTOMER` → `/api/v1/customer/**`, `/api/v1/user/phone/**`
- Permit-all: public APIs, webhooks, selected auth/login/refresh/logout, Swagger, uploads

## Notable services (implementation layer)

Examples of core service implementations (not exhaustive):

| Service impl | Concern |
|--------------|---------|
| `AuthServiceImpl` / `OwnerAuthServiceImpl` / `AdminAuthServiceImpl` / `PhoneAuthServiceImpl` | Role-specific auth |
| `PublicSearchServiceImpl` | Venue discovery |
| `PaymentServiceImpl` | Payment initiate / status / PayHere |
| `PayoutSettlementServiceImpl` | Admin payout settle |
| `OwnerPortalServiceImpl` | Owner bookings/payments/refunds aggregations |
| `OwnerEarningsServiceImpl` | Earnings and payout summaries |
| `NotificationServiceImpl` | Email/SMS notifications |

## Integrations

| Integration | Config keys (names only) | Purpose |
|-------------|--------------------------|---------|
| MySQL | `spring.datasource.*` | Primary store |
| JWT | `jwt.secret`, `jwt.access-token-expiry-ms`, `jwt.refresh-token-expiry-ms` | Tokens |
| PayHere | `payhere.merchant-id`, `payhere.merchant-secret`, `payhere.app-id`, `payhere.app-secret`, `payhere.notify-url`, `payhere.return-url`, `payhere.cancel-url`, `payhere.checkout-url` | Checkout + refunds |
| App URLs | `app.base-url` | Absolute links / checkout host |
| SMSlenz | `smslenz.user-id`, `smslenz.api-key`, `smslenz.sender-id` | OTP |
| Mail | `spring.mail.*` | Transactional email |

Local overrides belong in gitignored `application-local.properties` or OS env. See example files `payhere.sandbox.env.example` and `smslenz.env.example` in the backend repo.

## Running locally

```bash
cd booknplay   # backend root
./mvnw spring-boot:run
```

Requires MySQL database `booknplay` (DDL auto-update is configured for local). Swagger: `http://localhost:8080/swagger-ui.html`.

## Tests

Backend includes service/repository tests under `src/test/java`. Run with `./mvnw test`.
