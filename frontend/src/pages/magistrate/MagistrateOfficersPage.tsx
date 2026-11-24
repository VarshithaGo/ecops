import { useQuery } from '@tanstack/react-query'
import { stationsApi } from '../../api/stationsApi'
import { caseApi } from '../../api/caseApi'
import { OfficerAssignment } from '../../types/admin.types'
import { Fir } from '../../types/case.types'
import { StatusBadge } from '../../components/StatusBadge'
import { C, FONT } from '../../theme'

function durationBetween(fromISO: string, toISO: string | null): string {
  const from = new Date(fromISO).getTime()
  const to = toISO ? new Date(toISO).getTime() : Date.now()
  const days = Math.max(0, Math.round((to - from) / 8.64e7))
  if (days < 31) return `${days} day${days === 1 ? '' : 's'}`
  const months = Math.round(days / 30.4)
  if (months < 12) return `${months} month${months === 1 ? '' : 's'}`
  return `${(days / 365).toFixed(1)} years`
}

const lbl: React.CSSProperties = { fontFamily: FONT.ui, fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: C.charcoal, marginBottom: 4 }

export function MagistrateOfficersPage() {
  const { data: assignments = [], isLoading, error } = useQuery<OfficerAssignment[]>({
    queryKey: ['all-assignments'], queryFn: stationsApi.listAllAssignments,
  })
  const { data: firs = [] } = useQuery<Fir[]>({ queryKey: ['firs'], queryFn: caseApi.listFirs })

  if (isLoading) return <div style={{ padding: 32, fontFamily: FONT.ui, color: C.charcoal }}>Loading officers…</div>
  if (error) return <div style={{ padding: 32, fontFamily: FONT.ui, color: '#B91C1C' }}>Error loading officers.</div>

  const byOfficer = new Map<string, OfficerAssignment[]>()
  assignments.forEach((a) => { const arr = byOfficer.get(a.keycloakUserId) ?? []; arr.push(a); byOfficer.set(a.keycloakUserId, arr) })
  const casesByOfficer = new Map<string, Fir[]>()
  firs.forEach((f) => { const arr = casesByOfficer.get(f.registeredByOfficerId) ?? []; arr.push(f); casesByOfficer.set(f.registeredByOfficerId, arr) })

  const officers = [...byOfficer.entries()].map(([uid, list]) => {
    const current = list.find((a) => a.isActive)
    const previous = list.filter((a) => !a.isActive).sort((x, y) => new Date(y.assignedAt).getTime() - new Date(x.assignedAt).getTime())
    const name = list.find((a) => a.officerName)?.officerName ?? '—'
    return { uid, name, current, previous, cases: casesByOfficer.get(uid) ?? [] }
  }).sort((a, b) => a.name.localeCompare(b.name))

  return (
    <div style={{ padding: '32px 24px', maxWidth: 1000, margin: '0 auto', fontFamily: FONT.ui }}>
      <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.01em', color: C.ashes, margin: 0 }}>Officer Directory</h2>
      <p style={{ color: C.charcoal, fontSize: 14, margin: '6px 0 24px' }}>
        All police officers — current and previous postings, tenure, and the cases they have registered.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {officers.map((o) => (
          <div key={o.uid} style={{ background: '#fff', border: `1px solid ${C.bark}`, borderRadius: 10, padding: '20px 22px', boxShadow: '0 1px 3px rgba(16,32,44,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
              <div>
                <div style={{ fontSize: 17, fontWeight: 700, color: C.ashes }}>{o.name}</div>
                <div style={{ fontSize: 13, color: C.charcoal }}>{o.current ? `${o.current.rank ?? 'Officer'} · ${o.current.badgeNumber}` : 'Unassigned'}</div>
              </div>
              {o.current && (
                <div style={{ textAlign: 'right' }}>
                  <div style={lbl}>Current Station</div>
                  <div style={{ fontSize: 14, color: '#15803D', fontWeight: 600 }}>{o.current.stationName} ({o.current.stationCode})</div>
                  <div style={{ fontSize: 12, color: C.charcoal }}>{durationBetween(o.current.assignedAt, null)} here</div>
                </div>
              )}
            </div>

            {o.previous.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={lbl}>Previous Postings</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {o.previous.map((p) => (
                    <div key={p.id} style={{ fontSize: 13, color: C.ashes }}>
                      {p.stationName} ({p.stationCode}) · {p.rank ?? '—'} ·{' '}
                      <span style={{ color: C.charcoal }}>{durationBetween(p.assignedAt, p.unassignedAt)}
                        {p.unassignedAt ? ` (until ${new Date(p.unassignedAt).toLocaleDateString('en-IN')})` : ''}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <div style={lbl}>Cases Registered ({o.cases.length})</div>
              {o.cases.length === 0 ? (
                <div style={{ fontSize: 13, color: C.charcoal }}>No cases registered.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
                  {o.cases.map((f) => (
                    <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', padding: '7px 10px', background: C.angst, borderRadius: 6, border: `1px solid ${C.bark}` }}>
                      <span style={{ fontFamily: 'monospace', fontSize: 12.5, fontWeight: 700, color: C.ashes }}>{f.firNumber}</span>
                      <span style={{ fontFamily: 'monospace', fontSize: 11.5, color: C.charcoal }}>{f.ipcSections}</span>
                      <span style={{ fontSize: 12.5, color: C.charcoal, flex: 1, minWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {f.accusedName ?? 'Accused unknown'}
                      </span>
                      <StatusBadge status={f.status} size="sm" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {officers.length === 0 && (
          <div style={{ color: C.charcoal, padding: 32, textAlign: 'center', border: `1px solid ${C.bark}`, borderRadius: 10, background: '#fff' }}>No officers found.</div>
        )}
      </div>
    </div>
  )
}
