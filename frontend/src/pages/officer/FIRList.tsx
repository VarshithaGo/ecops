import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { caseApi } from '../../api/caseApi'
import { Fir } from '../../types/case.types'
import { StatusBadge } from '../../components/StatusBadge'
import { fmtDate } from '../../utils/date'
import { useAuth } from '../../auth/AuthProvider'
import { useCurrentOfficer } from '../../hooks/useCurrentOfficer'
import { ROLES } from '../../utils/roles'

import { C, A, FONT } from '../../theme'

const th: React.CSSProperties = {
  padding: '11px 14px', fontFamily: FONT.ui, fontSize: 12, fontWeight: 700,
  color: C.charcoal, textAlign: 'left', background: '#F3F6FA',
  borderBottom: `1px solid ${C.bark}`,
}
const td: React.CSSProperties = {
  padding: '11px 14px', fontFamily: FONT.ui, fontSize: 14, color: C.ashes,
  borderBottom: `1px solid ${C.bark}`,
}

const CLOSED_STATUSES = ['CLOSED', 'CHARGE_SHEET_FILED', 'FINAL_REPORT_FILED', 'COURT_DISPOSED']

function needsCourtWarning(fir: Fir): boolean {
  if (fir.remandCourtName) return false
  if (CLOSED_STATUSES.includes(fir.status)) return false
  const hrs = (Date.now() - new Date(fir.registeredAt).getTime()) / 3600000
  return hrs >= 24
}

// BNSS §193 — 90-day charge-sheet deadline (mirrors case-service DeadlineService)
function DeadlineBadge({ fir }: { fir: Fir }) {
  if (CLOSED_STATUSES.includes(fir.status)) {
    return <span style={{ color: C.charcoal, fontSize: 12 }}>—</span>
  }
  const daysElapsed = Math.floor((Date.now() - new Date(fir.registeredAt).getTime()) / 86400000)
  const remaining = 90 - daysElapsed
  const state = remaining < 0 ? 'OVERDUE' : remaining <= 15 ? 'DUE_SOON' : 'ON_TRACK'
  const color = state === 'OVERDUE' ? '#f87171' : state === 'DUE_SOON' ? '#fb923c' : '#4ade80'
  const label = state === 'OVERDUE' ? `${Math.abs(remaining)}d OVERDUE` : `${remaining}d LEFT`
  return (
    <span style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: 10, letterSpacing: '0.08em', color, border: `1px solid ${color}`, borderRadius: 3, padding: '2px 7px', whiteSpace: 'nowrap' }}>
      {label}
    </span>
  )
}

export function FIRList() {
  const { data, isLoading, error } = useQuery<Fir[]>({ queryKey: ['firs'], queryFn: caseApi.listFirs })
  const { roles } = useAuth()
  const { stationCode } = useCurrentOfficer()
  const isAdmin = roles.includes(ROLES.ADMIN)
  // Officers see only their own station's FIRs; admins see all.
  const firs = (data ?? []).filter((f) => isAdmin || !stationCode || f.stationCode === stationCode)

  if (isLoading) return <div style={{ padding: 32, fontFamily: "'Space Grotesk', system-ui, sans-serif", color: C.charcoal }}>Loading FIRs...</div>
  if (error)     return <div style={{ padding: 32, fontFamily: "'Space Grotesk', system-ui, sans-serif", color: '#f87171' }}>Error loading FIRs.</div>

  return (
    <div style={{ padding: '32px 24px', maxWidth: 1160, margin: '0 auto' }}>
      <h2 style={{ fontFamily: FONT.ui, fontSize: 24, fontWeight: 700, letterSpacing: '-0.01em', color: C.ashes, margin: 0, marginBottom: 6 }}>
        FIR Register
      </h2>
      <p style={{ fontFamily: FONT.ui, color: C.charcoal, fontSize: 14, marginBottom: 24 }}>
        First Information Reports — cognizable offences registered at this station.
      </p>

      <div style={{ border: `1px solid ${C.bark}`, borderRadius: 10, overflow: 'hidden', background: '#fff', boxShadow: '0 1px 3px rgba(16,32,44,0.06)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={th}>FIR Number</th>
              <th style={th}>Station</th>
              <th style={th}>Sections</th>
              <th style={th}>Accused</th>
              <th style={th}>Status</th>
              <th style={th}>Deadline</th>
              <th style={th}>Registered</th>
              <th style={th}>Court</th>
              <th style={th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {firs.map((fir) => (
              <tr key={fir.id}
                onMouseEnter={(e) => (e.currentTarget.style.background = `${C.bark}88`)}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                <td style={{ ...td, fontFamily: 'monospace', fontWeight: 700 }}>{fir.firNumber}</td>
                <td style={{ ...td, fontFamily: 'monospace' }}>{fir.stationCode}</td>
                <td style={{ ...td, color: C.charcoal }}>{fir.ipcSections}</td>
                <td style={td}>{fir.accusedName ?? '—'}</td>
                <td style={td}><StatusBadge status={fir.status} size="sm" /></td>
                <td style={td}><DeadlineBadge fir={fir} /></td>
                <td style={{ ...td, color: C.charcoal }}>{fmtDate(fir.registeredAt)}</td>
                <td style={td}>
                  {fir.remandCourtName ? (
                    <span style={{ color: '#4ade80', fontFamily: "'Space Grotesk', system-ui, sans-serif", fontSize: 12 }}>{fir.remandCourtName}</span>
                  ) : needsCourtWarning(fir) ? (
                    <span style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: 10, letterSpacing: '0.1em', color: '#fb923c', border: '1px solid #fb923c', borderRadius: 3, padding: '2px 7px' }}>
                      24H OVERDUE
                    </span>
                  ) : (
                    <span style={{ color: C.charcoal, fontSize: 12 }}>—</span>
                  )}
                </td>
                <td style={td}>
                  <Link to={`/officer/firs/${fir.id}`} style={{
                    fontFamily: FONT.ui, fontSize: 13, fontWeight: 600,
                    color: '#fff', textDecoration: 'none',
                    padding: '6px 14px',
                    background: A.accent, borderRadius: 6,
                  }}>
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {firs.length === 0 && (
              <tr><td colSpan={9} style={{ ...td, textAlign: 'center', color: C.charcoal, padding: 32 }}>No FIRs on record.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
