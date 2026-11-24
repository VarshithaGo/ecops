# e-Cops — Business Logic

Police Station Management System modelled on India's **BNSS 2023** (Bharatiya Nagarik Suraksha Sanhita) / CrPC workflow.

## 1. Roles (Keycloak realm `ecops-realm`)

| Role | Can do |
|---|---|
| `CITIZEN` | Register, file complaints online, track their own cases |
| `POLICE_OFFICER` | Everything for **their own station**: inbox, categorize, FIR/NCR registers, investigation, warrants request |
| `MAGISTRATE` | Decide arrest warrants, order investigation on referred NCRs |
| `ADMIN` | Manage stations + officer assignments; sees all stations' data |

Roles are realm roles in the JWT (`realm_access.roles`); the API gateway validates the token (issuer + JWKS) and each service authorizes with `@PreAuthorize`.

## 2. Station binding & scoping (jurisdiction)

- Every officer has one **active assignment** → a home station (`GET /assignments/officer/{keycloakUserId}` returns stationId/Code/Name, rank, badge).
- **Read scoping:** Complaints, FIR Register and NCR Register are filtered to the officer's home station (`ComplaintsInbox`, `FIRList`, `NCRList`). Admins see all.
- **Write scoping:** A walk-in complaint is always filed against the officer's own station — the station field is auto-filled and **locked** in the UI. Officers cannot create or act on another station's cases because those are never shown to them.
- Enforcement is at the application layer (UI + per-officer assignment). Backend-level query scoping is a documented hardening step.

## 3. Complaint intake → categorization

1. A complaint enters as `FILED`, from either:
   - **Citizen portal** (`POST /complaints`), or
   - **Walk-in** at the station (`POST /complaints/walk-in`, `walkIn=true`, no citizen account needed — BNSS §173).
2. The duty officer reviews their station's inbox and **categorizes** (`PUT /complaints/{id}/categorize`):
   - **Cognizable** → an **FIR** is registered (BNSS). Complaint → `CONVERTED_TO_FIR`.
   - **Non-cognizable** → an **NCR** is logged with **Form 76-A** (BNSS §174). Complaint → `LOGGED_IN_NCR`.
   - **Zero FIR** flag (BNSS §173(1)): if the incident is outside the station's jurisdiction, the FIR is registered anyway and can be **transferred** to the competent station (`PUT /firs/{id}/transfer`).

## 4. FIR lifecycle (cognizable cases)

An FIR supports the full investigation record:
- **IO assignment** — assign an investigating officer (from the station's officers).
- **Mahazar / spot report**, **property seizures** (with chain-of-custody status), **criminal records** (role: SUSPECT / ACCUSED / WITNESS / CONVICTED_PERSON).
- **Arrest warrant request** → goes to a magistrate.
- **Court production (BNSS §187)** — the 24-hour rule: an FIR without a recorded remand court after 24 h is flagged **"24H OVERDUE"** in the register.
- **Disposal:** **Charge Sheet** (evidence sufficient) or **Final Report** type **A** (untraced) / **B** (false) / **C** (insufficient evidence).

## 5. Arrest warrant decision (magistrate)

- Officer requests a warrant with accused + grounds (`POST /warrants`), status `PENDING`.
- The magistrate's page lists pending warrants and, for each, fetches the **full FIR context** (FIR number, BNS sections, incident narrative, accused) so the decision is informed — not just "name + reason".
- Decision (`PUT /warrants/{id}/decision`): **ISSUED** or **REJECTED** (with notes). Officer can then mark **EXECUTED** or **CANCELLED**.

## 6. NCR referral (magistrate)

- OPEN NCR → officer refers it (`PUT /ncr/{id}/refer-magistrate`) → `REFERRED_TO_MAGISTRATE`.
- Magistrate reviews referrals and **orders investigation** (`PUT /ncr/{id}/magistrate-order`) → `MAGISTRATE_ORDERED` (BNSS §174 — magistrate may direct investigation into a non-cognizable offence).

## 7. FIR / case numbering

FIRs use a per-station yearly sequence → `FIR-{STATIONCODE}-{YEAR}-{NNNN}` (e.g. `FIR-BLR-IND-2026-0001`). Complaints: `COMP-{YEAR}-{NNNN}`. NCRs: `NCR-{STATIONCODE}-{YEAR}-{NNNN}`.
