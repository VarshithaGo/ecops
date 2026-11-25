# e-Cops — Project Documentation

A Police Station Management System for the Indian context, implementing the **BNSS 2023 / CrPC** complaint-to-court workflow. Built as Spring Boot microservices behind an API gateway, with Keycloak auth, PostgreSQL per service, and a React + TypeScript frontend. Runs locally on Minikube.

> Companion docs: **[FLOW.md](FLOW.md)** (real-life workflow & roles) · **[BUSINESS_LOGIC.md](BUSINESS_LOGIC.md)** (workflow rules) · **[TESTING.md](TESTING.md)** (test plan + status) · **[QUICKSTART.md](QUICKSTART.md)** (run it).

---

## 1. Architecture

```
Browser (React SPA, Vite)
      │  OIDC login (PKCE)            ┌──────────────┐
      ├─────────────────────────────▶│  Keycloak 24 │ (realm ecops-realm)
      │                               └──────────────┘
      │  /api/v1/*  (Bearer JWT)
      ▼
┌──────────────────┐   validates JWT (issuer + JWKS), routes by path
│  API Gateway     │  (Spring Cloud Gateway)
└──────────────────┘
   │        │        │
   ▼        ▼        ▼
auth-admin  case-service   citizen-service
   │           │              │
   ▼           ▼              ▼
Postgres    Postgres       Postgres     (one DB per service)
```

**Stack:** Java 21, Spring Boot 3.3.5, Spring Cloud Gateway, Spring Security (OAuth2 resource server), Keycloak 24, PostgreSQL 16, Flyway (versioned migrations), React 18 + TypeScript + Vite, TanStack Query, keycloak-js, Axios, React Router. Orchestrated on Kubernetes (Minikube); 9 pods (4 services + gateway + 4 Postgres incl. Keycloak's).

**Service responsibilities**
| Service | Port | Owns |
|---|---|---|
| api-gateway | 8080 | JWT validation, routing, CORS |
| auth-admin-service | 8081 | Stations, officer assignments, user shadow |
| case-service | 8082 | Complaints, FIRs, NCRs, warrants, criminal records, investigation records |
| citizen-service | 8083 | Citizen registration, citizen-facing complaint filing |

---

## 2. Features

**Citizen**
- Self-registration and OIDC login.
- File a complaint online; track status of own complaints and resulting FIR/NCR.

**Police officer (station-scoped)**
- Walk-in complaint intake (no citizen account needed — BNSS §173).
- Complaints inbox limited to their station; categorize → **FIR** (cognizable) or **NCR** (non-cognizable).
- **FIR register:** IO assignment, Mahazar/spot report, property seizures, criminal records, arrest-warrant requests, charge sheet / final report (A/B/C), court-production (BNSS §187) tracking.
- **NCR register:** Form 76-A, refer to magistrate (BNSS §174).
- Criminal records search by name / area / district / role.

**Magistrate**
- Decide arrest warrants with **full FIR context** (sections + incident narrative + accused), ISSUE/REJECT.
- Review referred NCRs and order investigation.

**Admin**
- Manage stations and officer→station assignments across the system.

### Significant / innovative features
1. **Jurisdiction-aware RBAC** — officers automatically see and act on **only their station's** cases; walk-in registration is locked to their own station. Goes beyond plain role checks to real station-scoping.
2. **Statute-accurate workflow** — cognizable/non-cognizable routing, Form 76-A, Zero FIR (§173(1)) with transfer, A/B/C final reports, and the **24-hour court-production rule (§187)** surfaced as an "overdue" flag.
3. **Informed warrant decisions** — the magistrate screen pulls the originating FIR's narrative and BNS sections so arrests aren't approved on a one-line reason.
4. **Per-station FIR numbering** with a yearly sequence (`FIR-BLR-IND-2026-0001`).

---

## 3. Code / flow walkthrough

**Login:** SPA uses keycloak-js (`check-sso`, PKCE S256). On success the access token (with `realm_access.roles`) is attached by an Axios interceptor to every `/api/v1/*` call; a 401 triggers silent token refresh.

**Request lifecycle (e.g. open an FIR):**
1. `FIRDetail` calls `caseApi.getFir(id)` → `GET /api/v1/firs/{id}` with Bearer token.
2. **Gateway** validates the JWT (issuer = Keycloak realm, signature via JWKS) and routes to case-service.
3. case-service `@PreAuthorize("hasAnyRole(...)")` authorizes, repository loads the entity, returns JSON.
4. TanStack Query caches the result; the component renders via shared components.

**Categorize → FIR:** `ComplaintsInbox` → `PUT /complaints/{id}/categorize` → case-service creates an FIR (cognizable) or NCR (non-cognizable), updates complaint status, assigns the next per-station FIR sequence number.

**Station scoping:** `useMyStation()` resolves the officer's assignment once per session; list pages filter rows to that station; the walk-in form fixes the station to it.

---

## 4. Functional requirements — completion

| FR | Status |
|---|---|
| Citizen registration + login | ✅ |
| Online + walk-in complaint intake | ✅ |
| Cognizable→FIR / non-cognizable→NCR categorization | ✅ |
| Zero FIR + inter-station transfer | ✅ |
| FIR investigation records (IO, Mahazar, property, criminals) | ✅ |
| Arrest warrant request → magistrate decision | ✅ |
| NCR Form 76-A + magistrate referral/order | ✅ |
| Charge sheet / Final report A·B·C | ✅ |
| 24-hour court production tracking (§187) | ✅ |
| Criminal records search | ✅ |
| Station & officer-assignment admin | ✅ |
| Per-station data scoping & registration | ✅ |
| Automated test suite | ❌ (manual/API testing only — see TESTING.md) |
| Backend-level (query) station enforcement | 🟡 (UI-enforced; backend hardening pending) |

---

## 5. Design & modularization
- **Microservices by domain** (auth/stations, cases, citizens) with **database-per-service** — independent schemas and Flyway histories.
- **Single gateway** centralizes auth and routing; services stay focused.
- **Frontend**: reusable components (`SectionPanel`, `DetailRow`, `OfficerChip`, `StatusBadge`, `NavBar`), data hooks (`useFIRData`, `useMyStation`), per-domain API clients (`caseApi`, `stationsApi`, `citizenApi`), typed models. Consistent dark theme + typography (Anton / Space Grotesk).

## 6. Exception handling
Each service has a `@RestControllerAdvice` **`GlobalExceptionHandler`** returning RFC-7807 `ProblemDetail`:
- `EntityNotFoundException` → **404**, `IllegalArgumentException` → **400**, `IllegalStateException` → **409**, bean-validation errors → **400** with field detail.
Frontend surfaces failures as user-facing states (e.g. stations "waking up / retry", "Failed to register — try again") rather than blank screens.

## 7. Validation
- **Backend:** Jakarta Bean Validation on request DTOs — `@NotBlank` (44), `@Valid` (20), `@Size` (11), `@NotNull` (9), `@Pattern`, `@Email`; invalid payloads rejected with `400` + messages.
- **Frontend:** required fields, typed inputs (date/number/tel), phone pattern, disabled submit while pending.

## 8. Optimization
- **DB indexes** on hot columns (FK `fir_id` across sub-tables, `arrest_warrants.status`, `criminal_records(full_name)`, `(state,district)`, `age_at_crime`, `aadhaar_ref`, `complaints.citizen_keycloak_id`, officer-assignment lookups).
- **Client caching** via TanStack Query (`staleTime`, query keys) to avoid refetches; `useMyStation` cached 5 min.
- **Lazy JWT** refresh; **multi-stage Docker** builds (small JRE runtime images).

## 9. UI / usability
- Role-aware navbar (only permitted sections shown) with the signed-in officer's **name + station**.
- Dark, high-contrast theme; branded Keycloak login page (custom `ecops-theme`).
- Loading / empty / error states on async data; inline validation; confirmation and success banners.
- Known gap: formal cross-browser usability pass is manual (see TESTING.md §10).

## 10. Deployment
Local Kubernetes (Minikube): namespace `ecops`, 9 pods, Flyway auto-migrates on service start, Keycloak realm/users/theme provisioned via `deploy-seed/local-setup.sh`. See **QUICKSTART.md**. (A cloud variant — Vercel + Render + Neon — was also built and lives under `docker/render/` and `.github/workflows/`, but Minikube is the active target.)
