import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { caseApi } from '../../api/caseApi'
import { Fir } from '../../types/case.types'
import { StatusBadge } from '../../components/StatusBadge'
import { fmtDate } from '../../utils/date'
import { useAuth } from '../../auth/AuthProvider'
import { useMyStation } from '../../hooks/useMyStation'
import { ROLES } from '../../utils/roles'

const C = { angst: '#0A0A0A', kite: '#371E1E', bark: '#33312F', charcoal: '#726E68', ashes: '#B7B4AE' }

const th: React.CSSProperties = {
  padding: '10px 14px',
  fontFamily: 'Anton, Impact, sans-serif',
  fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase',
  color: C.charcoal, textAlign: 'left', background: C.bark,
  borderBottom: `2px solid ${C.charcoal}`,
}
const td: React.CSSProperties = {
  padding: '10px 14px',
  fontFamily: "'Space Grotesk', system-ui, sans-serif",
  fontSize: 13, color: C.ashes,
  borderBottom: `1px solid ${C.bark}`,
}

const CLOSED_STATUSES = ['CLOSED', 'CHARGE_SHEET_FILED', 'FINAL_REPORT_FILED', 'COURT_DISPOSED']

function needsCourtWarning(fir: Fir): boolean {
  if (fir.remandCourtName) return false
  if (CLOSED_STATUSES.includes(fir.status)) return false
  const hrs = (Date.now() - new Date(fir.registeredAt).getTime()) / 3600000
  return hrs >= 24
}

export function FIRList() {
  const { data, isLoading, error } = useQuery<Fir[]>({ queryKey: ['firs'], queryFn: caseApi.listFirs })
  const { roles } = useAuth()
  const { data: myStation } = useMyStation()
  const isAdmin = roles.includes(ROLES.ADMIN)
  const firs = (data ?? []).filter((f) => isAdmin || !myStation || f.stationCode === myStation.stationCode)

  if (isLoading) return <div style={{ padding: 32, fontFamily: "'Space Grotesk', system-ui, sans-serif", color: C.charcoal }}>Loading FIRs...</div>
  if (error)     return <div style={{ padding: 32, fontFamily: "'Space Grotesk', system-ui, sans-serif", color: '#f87171' }}>Error loading FIRs.</div>

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1200 }}>
      <h2 style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: 26, letterSpacing: '0.06em', color: C.ashes, margin: 0, marginBottom: 6 }}>
        FIR Register
      </h2>
      <p style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", color: C.charcoal, fontSize: 13, marginBottom: 24 }}>
        First Information Reports — cognizable offences registered at this station.
      </p>

      <div style={{ border: `2px solid ${C.charcoal}`, borderRadius: 4, overflow: 'hidden', backdropFilter: 'blur(8px)', background: `${C.kite}99` }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={th}>FIR Number</th>
              <th style={th}>Station</th>
              <th style={th}>Sections</th>
              <th style={th}>Accused</th>
              <th style={th}>Status</th>
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
                    fontFamily: 'Anton, Impact, sans-serif',
                    fontSize: 11, letterSpacing: '0.1em',
                    color: C.ashes, textDecoration: 'none',
                    padding: '4px 12px',
                    border: `1.5px solid ${C.charcoal}`, borderRadius: 3,
                  }}>
                    VIEW
                  </Link>
                </td>
              </tr>
            ))}
            {firs.length === 0 && (
              <tr><td colSpan={8} style={{ ...td, textAlign: 'center', color: C.charcoal, padding: 32 }}>No FIRs on record.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
