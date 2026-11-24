import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { stationsApi } from '../../api/stationsApi'
import { Station, OfficerAssignment } from '../../types/admin.types'
import { useState } from 'react'

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
const inp: React.CSSProperties = { padding: '9px 12px', background: C.bark, color: C.ashes, border: `2px solid ${C.charcoal}`, borderRadius: 3, fontFamily: "'Space Grotesk', system-ui, sans-serif", fontSize: 13, width: '100%', boxSizing: 'border-box', outline: 'none' }
const lbl: React.CSSProperties = { display: 'block', fontFamily: "'Space Grotesk', system-ui, sans-serif", fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.charcoal, marginBottom: 5 }

const RANKS = ['Inspector', 'Sub-Inspector', 'Head Constable', 'Constable', 'Assistant Sub-Inspector']

export function OfficerAssignmentPage() {
  const qc = useQueryClient()
  const { data: stations, isLoading } = useQuery<Station[]>({ queryKey: ['stations'], queryFn: stationsApi.list })
  const [selectedStation, setSelectedStation] = useState<string>('')

  const { data: assignments, isLoading: loadingAssignments } = useQuery<OfficerAssignment[]>({
    queryKey: ['assignments', selectedStation],
    queryFn: () => stationsApi.listAssignments(selectedStation),
    enabled: !!selectedStation,
  })

  // Pool of all currently-active officers across every station (for the reassign dropdown).
  const { data: allOfficers = [] } = useQuery<OfficerAssignment[]>({
    queryKey: ['all-officers', stations?.length ?? 0],
    enabled: !!stations?.length,
    queryFn: async () => {
      const lists = await Promise.all(stations!.map((s) => stationsApi.listAssignments(s.id)))
      const byOfficer = new Map<string, OfficerAssignment>()
      lists.flat().filter((a) => a.isActive).forEach((a) => byOfficer.set(a.keycloakUserId, a))
      return [...byOfficer.values()]
    },
  })

  const [form, setForm] = useState({ keycloakUserId: '', rank: '', badgeNumber: '' })
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const assign = useMutation({
    mutationFn: () => stationsApi.assign({ keycloakUserId: form.keycloakUserId, stationId: selectedStation, rank: form.rank || null, badgeNumber: form.badgeNumber }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['assignments'] })
      qc.invalidateQueries({ queryKey: ['all-officers'] })
      qc.invalidateQueries({ queryKey: ['my-assignment'] })
      setForm({ keycloakUserId: '', rank: '', badgeNumber: '' })
    },
  })

  const selected = stations?.find((s) => s.id === selectedStation)
  const canAssign = form.keycloakUserId && form.badgeNumber && selectedStation && !assign.isPending

  if (isLoading) return <div style={{ padding: 32, fontFamily: "'Space Grotesk', system-ui, sans-serif", color: C.charcoal }}>Loading stations...</div>

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1000 }}>
      <h2 style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: 26, letterSpacing: '0.06em', color: C.ashes, margin: 0, marginBottom: 6 }}>
        Officer Assignments
      </h2>
      <p style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", color: C.charcoal, fontSize: 13, marginBottom: 28 }}>
        View officers at each station, and assign or reassign an officer to a station.
      </p>

      <div style={{ marginBottom: 24 }}>
        <label style={lbl}>Select Station</label>
        <select value={selectedStation} onChange={(e) => setSelectedStation(e.target.value)}
          style={{ ...inp, minWidth: 320, width: 'auto' }}>
          <option value="">— choose a station —</option>
          {stations?.map((s) => (
            <option key={s.id} value={s.id}>{s.stationCode} — {s.stationName}</option>
          ))}
        </select>
      </div>

      {selectedStation && (
        <>
          <div style={{ border: `2px solid ${C.charcoal}`, borderRadius: 4, overflow: 'hidden', backdropFilter: 'blur(8px)', background: `${C.kite}99`, marginBottom: 24 }}>
            {loadingAssignments ? (
              <div style={{ padding: 24, fontFamily: "'Space Grotesk', system-ui, sans-serif", color: C.charcoal }}>Loading assignments...</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={th}>Badge</th><th style={th}>Name</th><th style={th}>Rank</th><th style={th}>Since</th><th style={th}>Active</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments?.map((a) => (
                    <tr key={a.id}
                      onMouseEnter={(e) => (e.currentTarget.style.background = `${C.bark}88`)}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                      <td style={{ ...td, fontFamily: 'monospace', fontWeight: 700 }}>{a.badgeNumber}</td>
                      <td style={td}>{a.officerName ?? '—'}</td>
                      <td style={{ ...td, color: C.charcoal }}>{a.rank ?? '—'}</td>
                      <td style={{ ...td, color: C.charcoal }}>{new Date(a.assignedAt).toLocaleDateString('en-IN')}</td>
                      <td style={td}><span style={{ color: a.isActive ? '#4ade80' : '#f87171', fontWeight: 600 }}>{a.isActive ? 'Yes' : 'No'}</span></td>
                    </tr>
                  ))}
                  {assignments?.length === 0 && (
                    <tr><td colSpan={5} style={{ ...td, textAlign: 'center', color: C.charcoal, padding: 32 }}>No assignments for this station.</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Assign / reassign form */}
          <div style={{ border: `2px solid ${C.charcoal}`, borderRadius: 4, padding: '20px 24px', backdropFilter: 'blur(8px)', background: `${C.kite}99` }}>
            <div style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: 14, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.ashes, marginBottom: 4 }}>
              Assign officer to {selected?.stationCode}
            </div>
            <p style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", fontSize: 12, color: C.charcoal, margin: '0 0 16px' }}>
              Moving an officer here deactivates their current assignment and makes this their active station.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div style={{ flex: 2, minWidth: 220 }}>
                <label style={lbl}>Officer</label>
                <select value={form.keycloakUserId} onChange={set('keycloakUserId')} style={inp}>
                  <option value="">— select officer —</option>
                  {allOfficers.map((o) => (
                    <option key={o.keycloakUserId} value={o.keycloakUserId}>
                      {o.officerName ?? o.badgeNumber} (currently {o.stationCode})
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ flex: 1, minWidth: 150 }}>
                <label style={lbl}>Rank</label>
                <select value={form.rank} onChange={set('rank')} style={inp}>
                  <option value="">— rank —</option>
                  {RANKS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div style={{ flex: 1, minWidth: 150 }}>
                <label style={lbl}>Badge Number</label>
                <input value={form.badgeNumber} onChange={set('badgeNumber')} style={{ ...inp, fontFamily: 'monospace' }} placeholder={`${selected?.stationCode}-003`} maxLength={50} />
              </div>
              <button onClick={() => assign.mutate()} disabled={!canAssign}
                style={{ padding: '10px 22px', fontFamily: 'Anton, Impact, sans-serif', fontSize: 12, letterSpacing: '0.12em', background: 'transparent', color: canAssign ? '#4ade80' : C.charcoal, border: `2px solid ${canAssign ? '#4ade80' : C.bark}`, borderRadius: 3, cursor: canAssign ? 'pointer' : 'not-allowed', whiteSpace: 'nowrap' }}>
                {assign.isPending ? 'ASSIGNING…' : 'ASSIGN'}
              </button>
            </div>
            {assign.isError && <div style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", fontSize: 12, color: '#f87171', marginTop: 12 }}>Assign failed — the badge number may already be in use. Try a unique badge.</div>}
            {assign.isSuccess && <div style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", fontSize: 12, color: '#4ade80', marginTop: 12 }}>Officer assigned to {selected?.stationCode}.</div>}
          </div>
        </>
      )}
      <style>{`select option { background: ${C.bark}; color: ${C.ashes}; } input::placeholder { color: ${C.charcoal}; opacity: 0.6; }`}</style>
    </div>
  )
}
