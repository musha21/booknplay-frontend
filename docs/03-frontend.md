# 03 — Frontend

React SPA for BookNPlay customer, owner, and admin experiences. Package: `booknplay-frontend`.

## Stack

| Concern | Library |
|---------|---------|
| UI runtime | React 19 |
| Bundler | Vite 8 |
| Routing | React Router 7 (`createBrowserRouter`) |
| Server state | TanStack React Query 5 |
| Client auth state | Zustand (persisted) |
| HTTP | Axios (`src/lib/axios.js`) |
| Forms / dates | React Hook Form, Day.js, MUI X Date Pickers |
| UI | MUI 9 + Tailwind 3 |
| Maps | Leaflet / React Leaflet + Google Maps JS loader |
| Charts | ApexCharts |
| Motion | Motion / GSAP (selected surfaces) |
| Tests | Vitest + Testing Library |
| Toasts | Sonner |

## Directory map

```text
src/
  api/           Domain API modules
  components/    layout/, home/, maps/, owner/, ui/, …
  constants/     Sports, API types
  hooks/         useAuth, useVenues, useBookings, useOwner, useAdmin
  lib/           axios, googleMaps, queryClient, signOut
  pages/         auth, customer, account, owner/, admin/
  stores/        authStore, favoritesStore
  theme/         MUI theme + light/dark
  utils/         bookingIntent, paymentStatus, venue, searchParams, …
```

## API modules (`src/api/`)

| Module | Backend prefix |
|--------|----------------|
| `public.js` | `/public/*` |
| `auth.js` | `/customer/auth/*`, `/auth/*` OTP helpers |
| `bookings.js` | `/customer/bookings/*` |
| `payments.js` | `/customer/payments/*` |
| `ownerAuth.js` | `/owner/auth/*` |
| `ownerBusiness.js` | `/owner/business/*`, password |
| `ownerVenues.js` | venues, courts, pricing, hours, policy |
| `ownerCalendar.js` | calendar, walk-in, maintenance, blocks |
| `ownerPortal.js` | bookings, payments, refunds, promotions, … |
| `ownerEarnings.js` | earnings / payouts |
| `ownerStaff.js` | `/owner/staff` |
| `ownerSubscription.js` | `/owner/subscription` |
| `admin.js` | `/admin/*` |

Axios `baseURL` = `VITE_API_BASE_URL` (default `http://localhost:8080/api/v1`). On 401, the client refreshes using a role-specific refresh path (`customer` / `owner` / `admin`) then retries; hard failure redirects to the matching login page.

## State & hooks

| Piece | Role |
|-------|------|
| `stores/authStore.js` | Persisted `accessToken`, `refreshToken`, `user`, `role` |
| `stores/favoritesStore.js` | Local favourites |
| `hooks/useAuth.js` | Login/register/logout mutations |
| `hooks/useVenues.js` | Public venue + availability queries |
| `hooks/useBookings.js` | Holds, lists, cancel, payment status |
| `hooks/useOwner.js` | Owner dashboard/venue/calendar queries & mutations |
| `hooks/useAdmin.js` | Admin dashboard and resource mutations |

## Routing & guards

Router is declared in `src/App.jsx`.

| Guard | Protects |
|-------|----------|
| `ProtectedRoute` | Customer checkout, payment return, booking detail, `/account/*` |
| `OwnerProtectedRoute` | `/owner/*` (except public owner auth pages) |
| `AdminProtectedRoute` | `/admin/*` (except `/admin/login`) |

Layouts:

- `Layout` — customer shell (navbar, scroll manager)
- `OwnerLayout` — owner nav / page chrome
- `AdminLayout` — admin nav

Pages are lazy-loaded where practical (`React.lazy` + `Suspense` + `RouteLoader`).

### Customer routes (summary)

| Path | Page |
|------|------|
| `/` | `HomePage` |
| `/venues/:venueId/slots` | `ChooseSlotPage` |
| `/checkout`, `/checkout/:bookingId` | `CheckoutPage` |
| `/payment/return` | `PaymentReturnPage` |
| `/bookings/:bookingId` | `BookingDetailPage` |
| `/account/*` | Upcoming, history, favourites, profile, privacy, help |
| `/auth/*` | Login, register, phone-register, forgot-password |

Legacy `/search` redirects; `/venues/:venueId` redirects to `slots`.

### Owner routes (summary)

Auth: `/owner/login`, `/owner/register`, `/owner/forgot-password`.

Protected: dashboard, venues (+ onboard/edit/courts/calendar/policy), courts hub, sports, bookings, calendar hub, walk-in, availability, blocked slots, maintenance, pricing, promotions, customers, payments, refunds, earnings, reports, team, settings, reviews, billing (+ return), profile.

### Admin routes (summary)

Auth: `/admin/login`.

Protected: dashboard, homepage, businesses, payouts, plans, venues, customers, audit.

## Theming & UX

- Brand tokens align with navy / lime customer experience (`DESIGN.md`)
- Light/dark via theme mode context
- Owner portal uses shared `OwnerPage` / `OwnerPageHeader` / `OwnerSection` primitives

## Local commands

```bash
npm install
cp .env.example .env   # then edit
npm run dev            # http://localhost:5173
npm run build
npm run lint
npm test
```

See [08-ops-config.md](./08-ops-config.md) for env vars and known gaps.
