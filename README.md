# e-Cops — Police Station Management System

e-Cops digitizes the lifecycle of a criminal case in an Indian police station — from
a citizen's complaint through investigation to the court's verdict — modeled on the
**Bharatiya Nagarik Suraksha Sanhita (BNSS), 2023**. It is built as a set of Spring
Boot microservices behind an API gateway, with a React single-page frontend and
Keycloak for identity.

> **Status:** academic full-stack project. Runs locally with Docker + JDK 21 + Node
> (see [Running locally](#running-locally)). A Kubernetes/minikube deployment also
> exists under `k8s/`.

---

## The workflow it models

| Stage | What happens | Who |
|---|---|---|
| **Complaint** | A crime is reported — online by a citizen, or as a walk-in at the station. | Citizen / Officer |
| **Categorize** | The duty officer classifies it: **cognizable** (serious) or **non-cognizable** (minor). | Officer |
| **FIR** | A cognizable offence becomes a **First Information Report**; the complainant is entitled to a free copy. A **Zero FIR** is registered when the crime falls outside the station's jurisdiction and is transferred later (BNSS §173). | Officer |
| **NCR** | A non-cognizable offence is logged as a **Non-Cognizable Report** (Form 76-A) and referred to a magistrate (BNSS §174). | Officer / Magistrate |
| **Investigation** | An **Investigating Officer** is assigned; they record **Mahajar** (spot inspection), seize property, and add criminal records. | Officer |
| **Warrant** | The IO requests an arrest warrant; a magistrate issues or rejects it. | Officer / Magistrate |
| **Disposition** | The case closes with a **charge sheet** (charges filed) or a **Final Report** (A = true/charges, B = false, C = no evidence). | Officer |
| **Court** | The court records its **disposal** (verdict). | Court |

**Statutory safeguards enforced in the UI:** the 24-hour production rule (BNSS §187)
and the 90-day charge-sheet deadline (BNSS §193), with a live case audit trail and a
role-aware dashboard that surfaces cases approaching or past their deadline.

## Roles

| Role | Can do |
|---|---|
| **Citizen** | File complaints online, track their own cases. |
| **Police Officer** | Register walk-ins, categorize complaints, run investigations, request warrants, file charge sheets / final reports. |
| **Magistrate** | Decide warrant requests, order NCR investigations. |
| **Admin** | Manage stations, zones, and officer assignments (plus all officer actions). |

---

## Architecture

```
          ┌───────────────┐        ┌──────────────────────┐
Browser ─▶│  React (Vite) │ ─────▶ │  API Gateway (8080)  │ ── JWT verify, forwards
  :5173   │   + Keycloak  │        │  Spring Cloud Gateway│    X-User-Id / -Roles
          └───────────────┘        └──────────┬───────────┘
                   ▲                           │
                   │ OIDC login                ├──▶ auth-admin-service (8081)  → auth_admin_db
          ┌────────┴────────┐                  ├──▶ case-service      (8082)  → case_db
          │ Keycloak (8085) │                  └──▶ citizen-service   (8083)  → citizen_db
          └─────────────────┘
```

Each backend service is an OAuth2 resource server validating Keycloak JWTs. The
gateway injects `X-User-Id` / `X-User-Roles` headers that services trust for the
caller's identity. Service-to-service calls use an internal shared secret.
`case-service` and the others manage their schema with **Flyway** migrations.

Diagrams: see [`diagrams/`](diagrams/) (`architecture.drawio`, `er-*.drawio`).

---

## Running locally

**Prerequisites:** Docker, JDK 21 (set `JAVA_HOME`), Node 18+, Maven.

```bash
# From the repo root — first time only, make the script executable:
chmod +x run-local.sh

# Then, every time, just:
./run-local.sh
```

The script prints the frontend URL when it starts. It uses **http://localhost:5173**,
but if that port is busy (e.g. another project is already running there) it
automatically picks the next free port in 5173–5183 and prints that instead — log in
at whatever URL it shows. The Keycloak realm whitelists that whole port range, so
login works on any of them.

Log in with any of:

| Username | Password | Role |
|---|---|---|
| `officer_kumar` | `Test@1234` | Police Officer |
| `admin_user` | `Test@1234` | Admin |
| `magistrate_sharma` | `Test@1234` | Magistrate |
| `citizen_test` | `Test@1234` | Citizen |

Keycloak admin console: http://localhost:8085 (`admin` / `admin123`).

### What the script does

1. `docker compose -f local/docker-compose.yml up -d` — one Postgres (exposed on
   5433/5434/5435, one database per service) and Keycloak in dev mode, importing
   [`local/import/ecops-realm.json`](local/import/ecops-realm.json) (roles, clients,
   the four users above).
2. Picks a free frontend port (5173–5183) and runs the API gateway on **8090** (the
   port the Vite dev-server proxies `/api` to).
3. Boots `auth-admin-service`, `citizen-service`, `case-service`, `api-gateway`
   (`mvn spring-boot:run`), then the Vite dev server.

Stop services with Ctrl-C; stop the containers with
`docker compose -f local/docker-compose.yml down` (add `-v` to wipe the database).

### First-run demo data

`case-service` seeds a few back-dated FIRs on first boot (`DemoSeeder`) so the
dashboard "Action Required" panel and the BNSS §193 deadline banner are immediately
visible. To exercise the **live** complaint → FIR flow end to end, first log in as
`admin_user` and create a station and assign `officer_kumar` to it (Officer
Assignments), so the officer can register FIRs at that station.

---

## Repository layout

```
api-gateway/         Spring Cloud Gateway — routing, JWT, header forwarding
auth-admin-service/  Stations, zones, officer assignments, user shadow
case-service/        Complaints, FIR/NCR, investigation, warrants, reports, audit
citizen-service/     Citizen registration (mock Aadhaar), Keycloak user creation
frontend/            React + Vite + TanStack Query SPA
local/               docker-compose, DB init, Keycloak realm import (local dev)
k8s/                 Kubernetes manifests (minikube deployment)
diagrams/            Architecture + ER diagrams (draw.io)
```
