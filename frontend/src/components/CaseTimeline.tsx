import { AuditEvent } from '../types/case.types'
import { OfficerChip } from './OfficerChip'
import { fmtDateTime } from '../utils/date'

import { C } from '../theme'

// Friendly label + accent colour per audit action.
const ACTION_META: Record<string, { label: string; color: string }> = {
  COMPLAINT_FILED: { label: 'Complaint filed (online)', color: '#2563eb' },
  COMPLAINT_FILED_WALKIN: { label: 'Walk-in complaint filed', color: '#2563eb' },
  FIR_REGISTERED: { label: 'FIR registered', color: '#2563eb' },
  ZERO_FIR_REGISTERED: { label: 'Zero FIR registered', color: '#fb923c' },
  NCR_LOGGED: { label: 'NCR logged (Form 76-A)', color: '#7c3aed' },
  IO_ASSIGNED: { label: 'Investigating Officer assigned', color: '#d97706' },
  MAHAJAR_RECORDED: { label: 'Mahajar (spot inspection) recorded', color: '#d97706' },
  PROPERTY_SEIZED: { label: 'Property seized', color: '#d97706' },
  CRIMINAL_RECORD_ADDED: { label: 'Criminal record added', color: '#d97706' },
  WARRANT_REQUESTED: { label: 'Arrest warrant requested', color: '#d97706' },
  WARRANT_ISSUED: { label: 'Arrest warrant issued', color: '#16a34a' },
  WARRANT_REJECTED: { label: 'Arrest warrant rejected', color: '#dc2626' },
  WARRANT_EXECUTED: { label: 'Arrest warrant executed', color: '#7c3aed' },
  WARRANT_CANCELLED: { label: 'Arrest warrant cancelled', color: '#6b7280' },
  COURT_PRODUCTION_RECORDED: { label: 'Accused produced before court (BNSS §187)', color: '#7c3aed' },
  ZERO_FIR_TRANSFERRED: { label: 'Zero FIR transferred', color: '#fb923c' },
  CHARGE_SHEET_FILED: { label: 'Charge sheet filed', color: '#16a34a' },
  FINAL_REPORT_FILED: { label: 'Final report filed', color: '#7c3aed' },
  COURT_DISPOSAL_RECORDED: { label: 'Court disposal recorded', color: '#16a34a' },
}

function meta(action: string) {
  return ACTION_META[action] ?? { label: action.replace(/_/g, ' '), color: C.charcoal }
}

function Actor({ ev }: { ev: AuditEvent }) {
  if (ev.actorId && (ev.actorRole === 'POLICE_OFFICER' || ev.actorRole === 'MAGISTRATE')) {
    return <OfficerChip keycloakUserId={ev.actorId} />
  }
  if (ev.actorRole === 'CITIZEN') {
    return <span style={{ color: C.charcoal, fontSize: 12 }}>Citizen</span>
  }
  return <span style={{ color: C.charcoal, fontSize: 12 }}>{ev.actorRole ?? 'System'}</span>
}

export function CaseTimeline({ events }: { events: AuditEvent[] }) {
  return (
    <div style={{ background: `${C.kite}cc`, border: `2px solid ${C.charcoal}`, borderRadius: 4, padding: '22px 26px', marginBottom: 20, backdropFilter: 'blur(8px)' }}>
      <div style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: 16, letterSpacing: '0.08em', color: C.ashes, marginBottom: 4 }}>
        CASE TIMELINE
      </div>
      <div style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", fontSize: 12, color: C.charcoal, marginBottom: 20 }}>
        Full audit trail — every recorded action on this case, in order.
      </div>

      {events.length === 0 ? (
        <div style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", fontSize: 13, color: C.charcoal }}>
          No recorded activity yet.
        </div>
      ) : (
        <div style={{ position: 'relative', paddingLeft: 8 }}>
          {events.map((ev, i) => {
            const m = meta(ev.action)
            const isLast = i === events.length - 1
            return (
              <div key={ev.id} style={{ display: 'flex', gap: 14, position: 'relative' }}>
                {/* Dot + connector */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                  <div style={{ width: 11, height: 11, borderRadius: '50%', background: m.color, marginTop: 4, boxShadow: `0 0 0 3px ${C.kite}` }} />
                  {!isLast && <div style={{ width: 2, flex: 1, background: C.bark, minHeight: 24 }} />}
                </div>
                {/* Content */}
                <div style={{ paddingBottom: isLast ? 0 : 20, flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', alignItems: 'baseline' }}>
                    <span style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", fontSize: 14, fontWeight: 600, color: m.color }}>
                      {m.label}
                    </span>
                    <span style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", fontSize: 11, color: C.charcoal }}>
                      {fmtDateTime(ev.createdAt)}
                    </span>
                  </div>
                  {(ev.fromStatus || ev.toStatus) && (
                    <div style={{ fontFamily: 'monospace', fontSize: 11, color: C.charcoal, marginTop: 3 }}>
                      {ev.fromStatus ?? '—'} → <span style={{ color: C.ashes }}>{ev.toStatus ?? '—'}</span>
                    </div>
                  )}
                  {ev.details && (
                    <div style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", fontSize: 12.5, color: C.ashes, marginTop: 4, lineHeight: 1.5 }}>
                      {ev.details}
                    </div>
                  )}
                  <div style={{ marginTop: 5 }}>
                    <Actor ev={ev} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
