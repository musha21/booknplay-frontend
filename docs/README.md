# BookNPlay Technical Review Documentation

Internal engineering documentation for company technical review. Covers the React frontend (`booknplay-frontend`) and Spring Boot backend (`booknplay`).

## How to use this set

| Order | Doc | Audience focus |
|------|-----|----------------|
| 1 | [01 — System overview](./01-system-overview.md) | Product domains, architecture, repo map |
| 2 | [02 — Backend](./02-backend.md) | Spring Boot modules, controllers, security, integrations |
| 3 | [03 — Frontend](./03-frontend.md) | React structure, state, hooks, routing |
| 4 | [04 — Portal features](./04-portal-features.md) | Customer / Owner / Admin feature matrices |
| 5 | [05 — Customer & owner flows](./05-customer-owner-flows.md) | End-to-end flows with Mermaid |
| 6 | [06 — API, auth & payments](./06-api-auth-payments.md) | API surface, JWT/OTP, PayHere |
| 7 | [07 — Data model](./07-data-model.md) | Core entities and relationships |
| 8 | [08 — Ops & config](./08-ops-config.md) | Env vars, local run, gaps |

## Repositories

| Repo | Path (this machine) | Stack |
|------|---------------------|-------|
| Frontend | `booknplay-frontend` | React 19, Vite 8, MUI, Tailwind, TanStack Query, Zustand |
| Backend | sibling `../booknplay/booknplay` (or `Downloads/booknplay/booknplay`) | Spring Boot 3.4, Java 17, MySQL, JWT, PayHere |

API base path: `/api/v1` (frontend `VITE_API_BASE_URL` defaults to `http://localhost:8080/api/v1`).

OpenAPI UI (when API is running): `http://localhost:8080/swagger-ui.html`

## Review checklist

1. Confirm portal feature matrices match live routes in `src/App.jsx`.
2. Walk customer booking and owner onboarding flows in [05](./05-customer-owner-flows.md).
3. Verify auth role boundaries and payment webhook path in [06](./06-api-auth-payments.md).
4. Check local env and known gaps in [08](./08-ops-config.md) before release discussions.

## Documentation rules

- Sourced from current code, not aspirational roadmap claims alone.
- Env var **names** only — never commit real secrets into these docs.
- Update this set when portals, payment, or auth contracts change.
