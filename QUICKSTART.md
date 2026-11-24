# e-Cops Quick Start

Live cloud deployment — **Vercel** (frontend) + **Render** (services + Keycloak) + **Neon** (database).

## Live app

**https://frontend-five-red-70.vercel.app**

> **First load is slow (~2–3 min).** Render's free tier and the Neon database both sleep after inactivity.
> Before a demo, open the app once and let it finish loading — that wakes everything. After that it's fast
> for the session. If a page shows "Failed…" or an empty dropdown on the very first try, the service was
> still waking — just retry.

---

## Credentials

All passwords: `Test@1234`

### Police officers (each sees only their own station's cases)

| Username        | Name          | Station                    |
|-----------------|---------------|----------------------------|
| officer_kumar   | Ravi Kumar    | Indiranagar (BLR-IND)      |
| officer_desai   | Anjali Desai  | Indiranagar (BLR-IND)      |
| officer_dpsharm | Deepak Sharma | Koramangala (BLR-KOR)      |
| officer_pillai  | Meera Pillai  | Koramangala (BLR-KOR)      |
| officer_nair    | Suresh Nair   | Hoskote (BLR-HSK)          |
| officer_begum   | Fatima Begum  | Hoskote (BLR-HSK)          |

> The seeded FIRs / complaints / NCRs are at **Indiranagar**, so log in as **officer_kumar** to see
> populated data. Koramangala and Hoskote start empty — register a walk-in there to populate them.

### Other roles

| Username          | Role       |
|-------------------|------------|
| admin_user        | ADMIN      |
| magistrate_sharma | MAGISTRATE |
| citizen_test      | CITIZEN    |

---

## Service URLs (Render)

| Service      | URL                                        |
|--------------|--------------------------------------------|
| Frontend     | https://frontend-five-red-70.vercel.app    |
| API Gateway  | https://ecops-api-gateway.onrender.com     |
| Keycloak     | https://ecops-keycloak.onrender.com        |
| auth-admin   | https://ecops-auth-admin.onrender.com      |
| case-service | https://ecops-case.onrender.com            |
| citizen      | https://ecops-citizen.onrender.com         |

Keycloak admin console: https://ecops-keycloak.onrender.com/admin (login set during deployment — not stored in this repo).

---

## Warm-up before a demo

Open these once (any browser tab) ~3 min before demoing to wake all services + the database:

- https://ecops-keycloak.onrender.com/realms/master
- https://ecops-api-gateway.onrender.com/actuator/health
- https://ecops-auth-admin.onrender.com/actuator/health
- https://ecops-case.onrender.com/actuator/health
- https://ecops-citizen.onrender.com/actuator/health

Then open the app and log in.

---

## Local development (optional)

The frontend can run locally against the live Render backend:

```bash
cd frontend
npm install
npm run dev   # http://localhost:5173
```

`vercel.json` proxies `/api` to the Render gateway; `localhost:5173` is already a registered
Keycloak redirect URI, so login works locally too.
