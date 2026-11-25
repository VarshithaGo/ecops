# e-Cops — Real-Life Workflow & Role Guide

How a case moves through an Indian police station under **BNSS 2023**, and how e-Cops models it. Companion to [PROJECT_DOCUMENTATION.md](PROJECT_DOCUMENTATION.md) and [BUSINESS_LOGIC.md](BUSINESS_LOGIC.md).

## Who's who

| Real life | App role | Does |
|---|---|---|
| Complainant | **Citizen** | Files a complaint (online), tracks their cases, entitled to a free FIR copy |
| Duty officer / Station House Officer (Inspector) | **Police Officer** (rank Inspector) | Categorizes complaints, registers FIR/NCR, **assigns the Investigating Officer** |
| Investigating Officer (Sub-Inspector / ASI) | **Police Officer** (rank SI/ASI) | Runs the investigation: Mahajar, seizure, criminal records, warrant request, charge sheet |
| Front desk (Constable / Head Constable) | **Police Officer** (rank Constable/HC) | Records **walk-in** complaints |
| Judicial Magistrate (JMFC) | **Magistrate** | Issues/rejects arrest warrants, orders NCR investigations (independent legal check) |
| The Court | *simulated* | Tries the case; the **only** authority that can convict |
| Department HQ | **Admin** | Creates stations, registers & assigns officers |

## The flow, step by step

| # | Step | What happens | App screen / endpoint |
|---|---|---|---|
| 1 | **Complaint** | Walk-in (front desk records it) or online (citizen) | Walk-in Complaint · File Complaint |
| 2 | **Categorize** | Officer classifies by law: **cognizable** (serious — police may act without a magistrate) vs **non-cognizable** (minor — needs a magistrate's order) | Complaints Inbox → Categorize (`PUT /complaints/{id}/categorize`) |
| 3a | **FIR** | Cognizable → **First Information Report** (BNSS §173). Mandatory; sets criminal law in motion; free copy to complainant. *Zero FIR* if out of jurisdiction → transfer | FIR Register |
| 3b | **NCR** | Non-cognizable → logged + **Form 76-A** (BNSS §174), referred to the magistrate | NCR Register → Refer to Magistrate |
| 4 | **Assign IO** | The SHO assigns an Investigating Officer | FIR detail → Assign IO (Inspector only) |
| 5 | **Investigate** | Mahajar (spot inspection), seize property, record suspects/accused (still *accused*, not criminals), request an arrest warrant | FIR detail panels |
| 6 | **Magistrate** | Issues/rejects warrants; authorizes remand — accused produced within **24h** (BNSS §187); orders NCR investigations | Warrants · NCR Referrals |
| 7 | **Conclude** (≤ ~90 days, BNSS §193) | **Charge sheet** (enough evidence → court) or **Final Report** (A/B/C closure) | FIR detail → Final Disposition |
| 8 | **Trial & verdict** | The **court** decides. An accused becomes a convicted criminal **only if found guilty**; else acquitted | "Request court verdict" (simulated random outcome) |

## Why the FIR matters
It's the legal trigger for a cognizable offence — mandatory, time-stamped, numbered, and the document the entire case (charge sheet, trial) is built on. Without it, police have no legal basis to investigate a cognizable crime, and the complainant loses their right to a free record of it.

## Two statutory clocks e-Cops enforces
- **§187 — 24 hours** to produce an arrested person before a magistrate → the floating court-deadline **notification**.
- **§193 — ~90 days** to file the charge sheet → the dashboard **"Action Required"** panel + the FIR banner.

## Where the app simplifies reality
- The real rank hierarchy (Inspector/SHO vs Sub-Inspector/IO vs Constable) is **one `POLICE_OFFICER` role gated by rank**, not separate roles.
- The **court is simulated** (random verdict) — there is no real court integration.
- **Rank gating is enforced in the UI**; backend endpoints are role-level.
- A person appears as a **separate criminal record per FIR**, not one master identity with a case history.
