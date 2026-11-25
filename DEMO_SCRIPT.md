# e-Cops — Demo Script & Rubric Map

## 0. Start (once)
```bash
docker compose -f local/docker-compose.yml down -v && ./run-local.sh
```
Open the URL it prints (e.g. http://localhost:5174). Logins (all `Test@1234`):
`officer_kumar` (Inspector/SHO) · `admin_user` · `magistrate_sharma` · `citizen_test`.

## 1. Live walkthrough (~6–8 min)

1. **Login** — show the branded Keycloak page (crest, eye-toggle), land on the role dashboard.
2. **Admin** (`admin_user`): Officer Assignments → **register an officer** (first name "Ramesh", rank **Constable**) → note the auto-generated `officer_ramesh` / `ramesh@12`. Open **Stations** / **Officer Directory** to show the seeded stations + officers.
3. **Rank gating**: log in as `officer_ramesh` (Constable) → he sees **only Walk-in** (front-desk duty). Contrast with the Inspector.
4. **Officer** (`officer_kumar`, Inspector): header shows rank + station.
   - **Walk-in** (station locked to his) → register → appears in **Complaints Inbox** (scoped to his station).
   - **Categorize** a complaint → **Cognizable → FIR** (or Non-cognizable → NCR + Form 76-A).
   - Open the FIR → **Assign IO** → **Mahajar / seizure / criminal record** → **request arrest warrant**.
   - Dashboard **"Action Required"** (§193 90-day) + floating **§187 24h** notification.
5. **Magistrate** (`magistrate_sharma`): **Warrants** → Issue/Reject (with FIR context); **NCR Referrals** → order investigation; **Officer Directory**.
6. **Back to officer** → **file charge sheet** → **Request court verdict** (random, the *court's* decision) → if guilty, the accused's **criminal record flips to CONVICTED**.
7. **Citizen** (`citizen_test`): **File Complaint** (pick a **language**, write in that language) → **Track** the case through its stages.

## 2. Rubric map

| Criterion | Where it shows |
|---|---|
| **Features + innovation** | Full BNSS complaint→court lifecycle; **rank-based duties**; **auto officer provisioning**; **simulated court verdict**; dual statutory deadline engines (§187/§193) with a live notification; audit timeline |
| **Flow / code walkthrough** | [FLOW.md](FLOW.md); 4 Spring Boot microservices + gateway, `CaseWorkflowService` as the state machine |
| **UI user-friendliness** | Consistent light design system (`theme.ts`), themed Keycloak login, role/rank-aware nav |
| **FR completion** | Complaint, FIR, Zero FIR, NCR, IO, Mahajar, property, criminals, warrants, charge sheet, Final Report A/B/C, court disposal |
| **Modular design** | Per-domain services/DB; gateway auth; reusable FE components (`SectionPanel`, `StateDistrictSelect`, `useCurrentOfficer`, `useCapabilities`) |
| **Exception handling** | `GlobalExceptionHandler` per service; FE inline field errors + API-error banners |
| **Testing** | [TESTING.md](TESTING.md) manual plan + JUnit tests (`DeadlineServiceTest`, `CaseWorkflowServiceTest`) |
| **Validation** | Jakarta Bean Validation on DTOs; FE zod/required/format checks (phone 10-digit, Aadhaar 12-digit, no future dates) |
| **Optimization** | TanStack Query caching; per-station scoping; pessimistic-locked FIR numbering (`FirSequence`) |

## 3. "% from scratch vs AI" (fill in honestly)
State it plainly to the evaluators. A fair framing to adapt:
- **Yours / from scratch:** the domain model & BNSS workflow design, the microservice/DB architecture, the decision of *what* each role does, and the review/integration of every change.
- **AI-assisted:** a large share of the implementation code, the UI redesign, and docs were generated with AI help, then reviewed and corrected by you.
- Put a number you can defend (e.g., "~X% AI-assisted implementation, design & integration our own"). Don't overstate either side.

## 4. Known simplifications (say these up front — it reads as maturity)
- Court verdict is **simulated** (no real court integration).
- **Rank gating is UI-level**; backend is role-level.
- One **criminal record per FIR**, not a shared person history.
