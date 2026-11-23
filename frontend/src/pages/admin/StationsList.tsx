import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { stationsApi } from '../../api/stationsApi'
import { Station } from '../../types/admin.types'

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

export function StationsList() {
  const { data, isLoading, error } = useQuery<Station[]>({ queryKey: ['stations'], queryFn: stationsApi.list })

  if (isLoading) return <div style={{ padding: 32, fontFamily: "'Space Grotesk', system-ui, sans-serif", color: C.charcoal }}>Loading stations...</div>
  if (error)     return <div style={{ padding: 32, fontFamily: "'Space Grotesk', system-ui, sans-serif", color: '#f87171' }}>Error loading stations.</div>

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1100 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: 26, letterSpacing: '0.06em', color: C.ashes, margin: 0, marginBottom: 4 }}>
            Police Stations
          </h2>
          <p style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", color: C.charcoal, fontSize: 13, margin: 0 }}>
            All stations registered in the system.
          </p>
        </div>
        <Link to="/admin/stations/new" style={{ textDecoration: 'none' }}>
          <button style={{
            padding: '9px 24px',
            fontFamily: 'Anton, Impact, sans-serif', fontSize: 13, letterSpacing: '0.14em',
            background: 'transparent', color: C.ashes,
            border: `2px solid ${C.charcoal}`, borderRadius: 3, cursor: 'pointer',
          }}>
            + ADD STATION
          </button>
        </Link>
      </div>

      <div style={{ border: `2px solid ${C.charcoal}`, borderRadius: 4, overflow: 'hidden', backdropFilter: 'blur(8px)', background: `${C.kite}99` }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={th}>Code</th>
              <th style={th}>Name</th>
              <th style={th}>District</th>
              <th style={th}>State</th>
              <th style={th}>Status</th>
              <th style={th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((s) => (
              <tr key={s.id}
                onMouseEnter={(e) => (e.currentTarget.style.background = `${C.bark}88`)}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                <td style={{ ...td, fontFamily: 'monospace', fontWeight: 700 }}>{s.stationCode}</td>
                <td style={td}>{s.stationName}</td>
                <td style={{ ...td, color: C.charcoal }}>{s.district}</td>
                <td style={{ ...td, color: C.charcoal }}>{s.state}</td>
                <td style={td}>
                  <span style={{ color: s.status === 'ACTIVE' ? '#4ade80' : '#f87171', fontWeight: 600 }}>{s.status}</span>
                </td>
                <td style={td}>
                  <Link to={`/admin/stations/${s.id}`} style={{
                    fontFamily: 'Anton, Impact, sans-serif', fontSize: 11, letterSpacing: '0.1em',
                    color: C.ashes, textDecoration: 'none',
                    padding: '4px 12px', border: `1.5px solid ${C.charcoal}`, borderRadius: 3,
                  }}>
                    VIEW
                  </Link>
                </td>
              </tr>
            ))}
            {data?.length === 0 && (
              <tr><td colSpan={6} style={{ ...td, textAlign: 'center', color: C.charcoal, padding: 32 }}>No stations registered.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
