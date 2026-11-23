import { useQuery } from '@tanstack/react-query'
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

export function OfficerAssignmentPage() {
  const { data: stations, isLoading } = useQuery<Station[]>({ queryKey: ['stations'], queryFn: stationsApi.list })
  const [selectedStation, setSelectedStation] = useState<string>('')

  const { data: assignments, isLoading: loadingAssignments } = useQuery<OfficerAssignment[]>({
    queryKey: ['assignments', selectedStation],
    queryFn: () => stationsApi.listAssignments(selectedStation),
    enabled: !!selectedStation,
  })

  if (isLoading) return <div style={{ padding: 32, fontFamily: "'Space Grotesk', system-ui, sans-serif", color: C.charcoal }}>Loading stations...</div>

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1000 }}>
      <h2 style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: 26, letterSpacing: '0.06em', color: C.ashes, margin: 0, marginBottom: 6 }}>
        Officer Assignments
      </h2>
      <p style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", color: C.charcoal, fontSize: 13, marginBottom: 28 }}>
        View officers assigned to each station.
      </p>

      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', fontFamily: "'Space Grotesk', system-ui, sans-serif", fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.charcoal, marginBottom: 8 }}>
          Select Station
        </label>
        <select value={selectedStation} onChange={(e) => setSelectedStation(e.target.value)}
          style={{ padding: '10px 14px', background: C.bark, color: C.ashes, border: `2px solid ${C.charcoal}`, borderRadius: 3, fontFamily: "'Space Grotesk', system-ui, sans-serif", fontSize: 13, minWidth: 320, outline: 'none' }}>
          <option value="">— choose a station —</option>
          {stations?.map((s) => (
            <option key={s.id} value={s.id}>{s.stationCode} — {s.stationName}</option>
          ))}
        </select>
      </div>

      {selectedStation && (
        <div style={{ border: `2px solid ${C.charcoal}`, borderRadius: 4, overflow: 'hidden', backdropFilter: 'blur(8px)', background: `${C.kite}99` }}>
          {loadingAssignments ? (
            <div style={{ padding: 24, fontFamily: "'Space Grotesk', system-ui, sans-serif", color: C.charcoal }}>Loading assignments...</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={th}>Badge</th>
                  <th style={th}>Name</th>
                  <th style={th}>Rank</th>
                  <th style={th}>Zone</th>
                  <th style={th}>Since</th>
                  <th style={th}>Active</th>
                </tr>
              </thead>
              <tbody>
                {assignments?.map((a) => (
                  <tr key={a.id}
                    onMouseEnter={(e) => (e.currentTarget.style.background = `${C.bark}88`)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                    <td style={{ ...td, fontFamily: 'monospace', fontWeight: 700 }}>{a.badgeNumber}</td>
                    <td style={td}>{(a as OfficerAssignment & { officerName?: string }).officerName ?? '—'}</td>
                    <td style={{ ...td, color: C.charcoal }}>{a.rank ?? '—'}</td>
                    <td style={{ ...td, color: C.charcoal }}>{a.zoneName ?? '—'}</td>
                    <td style={{ ...td, color: C.charcoal }}>{new Date(a.assignedAt).toLocaleDateString('en-IN')}</td>
                    <td style={td}>
                      <span style={{ color: a.isActive ? '#4ade80' : '#f87171', fontWeight: 600 }}>{a.isActive ? 'Yes' : 'No'}</span>
                    </td>
                  </tr>
                ))}
                {assignments?.length === 0 && (
                  <tr><td colSpan={6} style={{ ...td, textAlign: 'center', color: C.charcoal, padding: 32 }}>No assignments for this station.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      )}
      <style>{`select option { background: ${C.bark}; color: ${C.ashes}; }`}</style>
    </div>
  )
}
