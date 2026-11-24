import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { caseApi } from '../api/caseApi'
import { Fir } from '../types/case.types'
import { useAuth } from '../auth/AuthProvider'
import { useCurrentOfficer } from '../hooks/useCurrentOfficer'
import { ROLES } from '../utils/roles'
import { C, FONT } from '../theme'

const CLOSED = ['CLOSED', 'CHARGE_SHEET_FILED', 'FINAL_REPORT_FILED', 'COURT_DISPOSED']
const RED = '#B91C1C'
const AMBER = '#B45309'

interface Alert { fir: Fir; hours: number; overdue: boolean }

/**
 * App-wide notification for BNSS §187 — an arrested person must be produced before
 * a magistrate within 24h. Flags FIRs at the officer's station with no recorded
 * court production that are past / nearing 24h. Floating, collapsible, polls hourly.
 */
export function CourtDeadlineAlerts() {
  const { roles } = useAuth()
  const { stationCode } = useCurrentOfficer()
  const [open, setOpen] = useState(true)
  const isOfficer = roles.includes(ROLES.OFFICER)

  const { data: firs = [] } = useQuery<Fir[]>({
    queryKey: ['firs'], queryFn: caseApi.listFirs, enabled: isOfficer, refetchInterval: 60_000,
  })

  if (!isOfficer) return null

  const now = Date.now()
  const alerts: Alert[] = firs
    .filter((f) => !stationCode || f.stationCode === stationCode)
    .filter((f) => !f.remandCourtName && !CLOSED.includes(f.status))
    .map((f) => ({ fir: f, hours: (now - new Date(f.registeredAt).getTime()) / 3.6e6 }))
    .filter((a) => a.hours >= 18)
    .map((a) => ({ ...a, overdue: a.hours >= 24 }))
    .sort((x, y) => y.hours - x.hours)

  if (alerts.length === 0) return null
  const overdueCount = alerts.filter((a) => a.overdue).length
  const accent = overdueCount ? RED : AMBER

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} title="Court deadline alerts"
        style={{ position: 'fixed', top: 68, right: 16, zIndex: 90, padding: '9px 14px', background: accent, color: '#fff', border: 'none', borderRadius: 24, cursor: 'pointer', fontFamily: FONT.ui, fontSize: 13, fontWeight: 700, boxShadow: '0 6px 18px rgba(16,32,44,0.25)' }}>
        ⚠ {alerts.length} court alert{alerts.length > 1 ? 's' : ''}
      </button>
    )
  }

  return (
    <div style={{ position: 'fixed', top: 68, right: 16, zIndex: 90, width: 330, maxHeight: '75vh', overflowY: 'auto',
      background: '#fff', border: `1px solid ${C.bark}`, borderTop: `3px solid ${accent}`, borderRadius: 10, boxShadow: '0 10px 32px rgba(16,32,44,0.22)', fontFamily: FONT.ui }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderBottom: `1px solid ${C.bark}`, position: 'sticky', top: 0, background: '#fff' }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: accent }}>⚠ Court deadlines ({alerts.length})</span>
        <button onClick={() => setOpen(false)} style={{ background: 'transparent', border: 'none', color: C.charcoal, cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>×</button>
      </div>
      <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontSize: 11.5, color: C.charcoal, lineHeight: 1.5, padding: '0 4px 4px' }}>
          BNSS §187 — produce the accused before a magistrate within 24h. Record the court on each FIR once produced.
        </div>
        {alerts.map(({ fir, hours, overdue }) => {
          const col = overdue ? RED : AMBER
          return (
            <Link key={fir.id} to={`/officer/firs/${fir.id}`} style={{ textDecoration: 'none' }}>
              <div style={{ padding: '10px 12px', background: C.angst, border: `1px solid ${col}55`, borderLeft: `3px solid ${col}`, borderRadius: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: 12.5, fontWeight: 700, color: C.ashes }}>{fir.firNumber}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: col, border: `1px solid ${col}`, borderRadius: 4, padding: '2px 7px' }}>
                    {overdue ? `${Math.floor(hours)}h overdue` : `due in ${Math.max(0, Math.ceil(24 - hours))}h`}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: C.charcoal, marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {fir.accusedName ?? 'Accused unknown'} · {fir.ipcSections}
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
