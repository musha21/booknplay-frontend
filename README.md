# BookNPlay Frontend

BookNPlay is a multi-sport venue discovery and booking application. This repository contains the React frontend for three experiences:

- customers searching for venues, selecting slots, paying, and managing bookings;
- venue owners onboarding facilities and managing courts, calendars, pricing, and earnings;
- administrators managing businesses, venues, customers, audits, and homepage content.

The application is currently in beta development. The production build and lint checks pass, while live backend integration, payment gateway verification, automated test reliability, and deployment remain in progress. See [ROADMAP.md](./ROADMAP.md) for the detailed status.

## Tech stack

- React 19 and React Router
- Vite 8
- Material UI and Tailwind CSS
- TanStack React Query
- Zustand
- Axios
- React Hook Form
- Day.js and MUI date pickers
- Leaflet and React Leaflet
- Vitest and Testing Library

## Prerequisites

- Node.js 20 or later
- npm
- The BookNPlay backend API for live data and authenticated workflows

The example configuration expects the backend at `http://localhost:8080/api/v1`.

## Getting started

```bash
git clone <repository-url>
cd booknplay-frontend
npm install
```

Copy `.env.example` to `.env`, then adjust the values for your environment:

```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
VITE_PAYMENT_GATEWAY=DUMMY
```

Start the development server:

```bash
npm run dev
```

Vite prints the local URL, normally `http://localhost:5173`.

## Available commands

| Command | Purpose |
|---|---|
| `npm run dev` | Start the Vite development server |
| `npm run build` | Create an optimized production build in `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint across the project |
| `npm test` | Run the Vitest test suite once |
| `npm run test:watch` | Run Vitest in watch mode |

Current verification note: `npm run build` and `npm run lint` pass. The Vitest process currently does not terminate reliably in this environment and must be fixed before CI can treat tests as a release gate.

## Application areas

### Customer portal

- venue and business discovery;
- sport, location, date, and name search;
- venue details and court availability;
- slot selection and booking checkout;
- configurable payment initiation and payment-return handling;
- booking details, upcoming bookings, and history;
- customer profile, favourites, privacy, and help pages.

### Venue owner portal

- owner registration, login, and protected routes;
- business profile and image management;
- multi-step venue onboarding with location selection;
- court, operating-hours, pricing, and cancellation-policy management;
- booking calendar, walk-ins, maintenance, and blocked slots;
- earnings summaries and payout history;
- owner profile and password management.

### Admin portal

- admin login and protected routes;
- dashboard summary;
- business access and commission controls;
- venue status management;
- customer and audit views;
- homepage draft, publish, version, and restore workflows.

## Project structure

```text
src/
  api/          API modules for customer, owner, admin, and public endpoints
  components/   Shared UI, layouts, route guards, and feature components
  constants/    Shared API-related constants and types
  hooks/        React Query and authentication hooks
  lib/          Axios and query-client configuration
  motion/       Shared animation variants
  pages/        Customer, account, owner, and admin route pages
  stores/       Persistent Zustand authentication state
  test/         Test environment setup
  theme/        MUI theme and light/dark mode context
  utils/        Data normalization, formatting, search, and payment helpers
```

Routes are lazy-loaded where practical. Authentication guards separate customer, owner, and admin areas.

## API and authentication

The shared Axios client uses `VITE_API_BASE_URL`, attaches the active bearer token, and handles authentication refresh behavior. The frontend expects REST endpoints grouped under:

- `/public/*`
- `/customer/*`
- `/owner/*`
- `/admin/*`

Customer, owner, and admin sessions use role-specific protected routes. Test all three roles against the target backend before release.

## Payments

`VITE_PAYMENT_GATEWAY` selects the gateway sent during payment initiation. The checked-in example uses `DUMMY` for local development. A real provider, return flow, backend webhook verification, and failure/retry scenarios must be validated in a sandbox before production.

## Release checklist

Before deploying a production release:

1. Make the Vitest suite terminate consistently and pass in CI.
2. Complete end-to-end testing against the deployed backend.
3. Verify authentication refresh and authorization for every role.
4. Complete payment-provider sandbox and webhook testing.
5. Configure production environment variables, HTTPS, monitoring, and error reporting.
6. Run accessibility, responsive-layout, and browser smoke tests.

## Documentation

- [Technical review docs (frontend + backend)](./docs/README.md) — system overview, portal features, customer/owner flows, API/auth/payments, data model, ops
- [Project roadmap and implementation status](./ROADMAP.md)
- [Design system](./DESIGN.md)
