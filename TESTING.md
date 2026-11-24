# e-Cops — Testing Guide & Status

> **Honest status:** There is **no automated test suite** in the repo yet (`src/test` is empty).
> All testing so far has been **manual + API-level** (curl against the gateway) during development.
> This document is a practical manual test plan; the "Status" column states what has actually been exercised.
>
> ✅ exercised during build · 🟡 partially / quick to run · ❌ not yet done

## How to run these tests
- App: http://localhost:5173 · Gateway: http://localhost:8090 · Keycloak: http://localhost:8085
- Users (all `Test@1234`): `officer_kumar` (Koramangala / BLR-KOR), `admin_user`, `magistrate_sharma`, `citizen_test`. Officers registered via the admin screen log in as `officer_<firstname>` / `<firstname>@12`.

## 1. Functional testing (per module) — ✅ mostly
| Module | Test | Status |
|---|---|---|
| Auth/login | Each role logs in, lands on its dashboard | ✅ token + role verified via API |
| Complaints inbox | Officer sees their station's `FILED` complaints | ✅ scoping verified (8 IND shown, 2 KOR hidden) |
| Categorize | Cognizable → FIR; non-cognizable → NCR | 🟡 run in UI |
| Walk-in | Register complaint → number returned | ✅ created COMP-2026-0010 |
| FIR register | List, open detail, IO/Mahazar/property/criminal/warrant/report | 🟡 run in UI |
| NCR register | List, refer to magistrate | 🟡 |
| Criminal search | By name/area/district/role | ✅ list returns |
| Magistrate warrants | See pending + FIR context, ISSUE/REJECT | ✅ FIR context fix verified |
| Magistrate NCR | See referrals, order investigation | 🟡 |

## 2. Positive cases — ✅
- Valid walk-in (all required fields) → `201` + complaint number.
- Valid login → JWT with correct `realm_access.roles`.
- Officer opens an FIR at their station → full detail loads.

## 3. Negative cases — 🟡
- ✅ Auth without PKCE `code_challenge` → rejected (`invalid_request`).
- ✅ Direct password grant on public client when disabled → `400`.
- Run next: categorize a complaint twice (second should be rejected), open a non-existent FIR id → `404` (ProblemDetail), request warrant with empty grounds → blocked.

## 4. Form validation — 🟡
- Backend: Jakarta Bean Validation (`@NotBlank`, `@NotNull`, `@Size`, `@Pattern`, `@Email`, `@Valid`) on request DTOs → invalid body returns `400` with field messages.
- Frontend: required fields on name/date/description; phone `pattern="[0-9]{10}"`.
- Test: submit walk-in with blank name (blocked), 3-digit phone (blocked).

## 5. Role-based access — ✅
- ✅ POLICE_OFFICER token carries `POLICE_OFFICER`; gateway + `@PreAuthorize` enforce per-endpoint roles.
- ✅ Magistrate FIR read was `403` before the fix, `200` after (proves role gating is real).
- Test in UI: log in as `citizen_test`, try to open `/officer/firs` → blocked by `ProtectedRoute`.

## 6. End-to-end workflow — ✅ (data path) / 🟡 (full UI journey)
- ✅ login → gateway JWT validation → service → Postgres → data returned (verified for FIRs, stations, walk-in).
- Full journey to run in UI: citizen files complaint → officer categorizes → FIR → IO assigned → warrant requested → magistrate issues → charge sheet filed.

## 7. API testing — ✅
Exercised via curl against the gateway: `/firs`, `/firs/{id}`, `/stations`, `/complaints/walk-in`, `/assignments/officer/{id}`, `/ncr`, token endpoints. All returned expected codes/payloads.

## 8. Database consistency — ✅
- ✅ Row counts verified (3 FIRs / 9 complaints / 3 NCR / 7 criminals).
- ✅ FK integrity after the Keycloak-ID remap (officer_assignments, firs.registered_by, etc. all resolve).
- ✅ Station split verified (2 officers each at BLR-IND/KOR/HSK).
- Flyway migrations are versioned (V1…Vn) and validated on each service start.

## 9. Error handling / edge cases — 🟡
- ✅ Each service has a `GlobalExceptionHandler` (`@RestControllerAdvice`) returning RFC-7807 `ProblemDetail`: `404` not-found, `400` bad-request/validation, `409` conflict.
- ✅ Frontend handles the stations call failing (loading + "waking up" + retry).
- To run: stop a service and confirm graceful UI error; duplicate badge number → `409`.

## 10. UI navigation & usability — ❌ (the main gap)
Cannot be automated here (needs a human in a browser). **Do this manually:**
- Log in as each role; click every nav item; confirm only permitted items appear.
- Check forms are readable (dark theme), buttons give feedback, success/error states show.
- Verify the navbar shows the officer's name + station.

## Recommended next step for real coverage
Add JUnit + Spring Boot `@WebMvcTest`/`@DataJpaTest` for the services and a Playwright/Cypress smoke test for the UI. None exist yet.
