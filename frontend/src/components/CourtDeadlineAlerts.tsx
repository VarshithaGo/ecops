import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { caseApi } from '../api/caseApi'
import { Fir } from '../types/case.types'
import { useAuth } from '../auth/AuthProvider'
import { useMyStation } from '../hooks/useMyStation'
import { ROLES } from '../utils/roles'

const C = { angst: '#0A0A0A', kite: '#371E1E', bark: '#33312F', charcoal: '#726E68', ashes: '#B7B4AE' }
const CLOSED = ['CLOSED', 'CHARGE_SHEET_FILED', 'FINAL_REPORT_FILED', 'COURT_DISPOSED']

interface Alert { fir: Fir; hours: number; overdue: boolean }

// BNSS §187 — an arrested person must be produced before a magistrate within 24h.
// Flags FIRs at the officer's station with no recorded court production that are past / nearing 24h.
export function CourtDeadlineAlerts() {
  const { roles } = useAuth()
  const { data: myStation } = useMyStation()
  const [open, setOpen] = useState(true)
  const isOfficer = roles.includes(ROLES.OFFICER)

  const { data: firs = [] } = useQuery<Fir[]>({
    queryKey: ['firs'],
    queryFn: caseApi.listFirs,
    enabled: isOfficer,
    refetchInterval: 60_000,
  })

  if (!isOfficer) return null

  const now = Date.now()
  const alerts: Alert[] = firs
    .filter((f) => (!myStation || f.stationCode === myStation.stationCode))
    .filter((f) => !f.remandCourtName && !CLOSED.includes(f.status))
    .map((f) => ({ fir: f, hours: (now - new Date(f.registeredAt).getTime()) / 3.6e6 }))
    .filter((a) => a.hours >= 18)
    .map((a) => ({ ...a, overdue: a.hours >= 24 }))
    .sort((x, y) => y.hours - x.hours)

  if (alerts.length === 0) return null
  const overdueCount = alerts.filter((a) => a.overdue).length

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} title="Court deadline alerts"
        style={{ position: 'fixed', top: 64, right: 16, zIndex: 90, padding: '8px 12px', background: overdueCount ? '#7f1d1d' : '#78350f', color: C.ashes, border: `2px solid ${overdueCount ? '#f87171' : '#fb923c'}`, borderRadius: 24, cursor: 'pointer', fontFamily: 'Anton, Impact, sans-serif', fontSize: 12, letterSpacing: '0.08em', boxShadow: `0 4px 16px ${C.angst}` }}>
        ⚠ {alerts.length} COURT ALERT{alerts.length > 1 ? 'S' : ''}
      </button>
    )
  }

  return (
    <div style={{ position: 'fixed', top: 64, right: 16, zIndex: 90, width: 320, maxHeight: '75vh', overflowY: 'auto',
      background: `${C.kite}f2`, border: `2px solid ${overdueCount ? '#f87171' : '#fb923c'}`, borderRadius: 6, backdropFilter: 'blur(10px)', boxShadow: `0 8px 32px ${C.angst}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderBottom: `1px solid ${C.bark}`, position: 'sticky', top: 0, background: `${C.kite}f2` }}>
        <span style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: 12, letterSpacing: '0.1em', color: overdueCount ? '#f87171' : '#fb923c' }}>
          ⚠ COURT DEADLINES ({alerts.length})
        </span>
        <button onClick={() => setOpen(false)} style={{ background: 'transparent', border: 'none', color: C.charcoal, cursor: 'pointer', fontSize: 16, lineHeight: 1 }}>×</button>
      </div>
      <div style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", fontSize: 10.5, color: C.charcoal, lineHeight: 1.5, padding: '0 4px 4px' }}>
          BNSS §187 — produce the accused before a magistrate within 24h. Record the court on each FIR once produced.
        </div>
        {alerts.map(({ fir, hours, overdue }) => (
          <Link key={fir.id} to={`/officer/firs/${fir.id}`} style={{ textDecoration: 'none' }}>
            <div style={{ padding: '9px 11px', background: `${C.angst}66`, border: `1px solid ${overdue ? '#f87171' : '#fb923c'}`, borderRadius: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color: C.ashes }}>{fir.firNumber}</span>
                <span style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: 9, letterSpacing: '0.08em', color: overdue ? '#f87171' : '#fb923c', border: `1px solid ${overdue ? '#f87171' : '#fb923c'}`, borderRadius: 3, padding: '1px 6px' }}>
                  {overdue ? `${Math.floor(hours)}H OVERDUE` : `DUE IN ${Math.max(0, Math.ceil(24 - hours))}H`}
                </span>
              </div>
              <div style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", fontSize: 11.5, color: C.charcoal, marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {fir.accusedName ?? 'Accused unknown'} · {fir.ipcSections}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
