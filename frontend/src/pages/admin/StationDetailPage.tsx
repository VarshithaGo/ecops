import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { stationsApi } from '../../api/stationsApi'
import { Station, OfficerAssignment } from '../../types/admin.types'
import { fmtDate, fmtDateTime } from '../../utils/date'

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

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div style={{ display: 'flex', gap: 16, padding: '8px 0', borderBottom: `1px solid ${C.bark}` }}>
      <span style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.charcoal, minWidth: 160 }}>{label}</span>
      <span style={{ fontFamily: mono ? 'monospace' : "'Space Grotesk', system-ui, sans-serif", fontSize: 13, color: C.ashes }}>{value}</span>
    </div>
  )
}

export function StationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data: station, isLoading, error } = useQuery<Station>({
    queryKey: ['station', id],
    queryFn: () => stationsApi.get(id!),
    enabled: !!id,
  })

  const { data: assignments = [] } = useQuery<OfficerAssignment[]>({
    queryKey: ['station-assignments', id],
    queryFn: () => stationsApi.listAssignments(id!),
    enabled: !!id,
  })

  const deactivate = useMutation({
    mutationFn: () => stationsApi.deactivate(id!),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['stations'] }); navigate('/admin/stations') },
  })

  if (isLoading) return <div style={{ padding: 32, fontFamily: "'Space Grotesk', system-ui, sans-serif", color: C.charcoal }}>Loading station...</div>
  if (error || !station) return <div style={{ padding: 32, fontFamily: "'Space Grotesk', system-ui, sans-serif", color: '#f87171' }}>Station not found.</div>

  const active = assignments.filter((a) => a.isActive)
  const inactive = assignments.filter((a) => !a.isActive)

  return (
    <div style={{ maxWidth: 820, margin: '32px auto', padding: '0 24px' }}>

      {/* Header card */}
      <div style={{ background: `${C.kite}99`, border: `2px solid ${C.charcoal}`, borderRadius: 4, padding: '24px 28px', marginBottom: 24, backdropFilter: 'blur(8px)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: 24, letterSpacing: '0.06em', color: C.ashes, margin: 0, marginBottom: 4 }}>
              {station.stationName}
            </h2>
            <span style={{ fontFamily: 'monospace', fontSize: 13, color: C.charcoal }}>{station.stationCode}</span>
          </div>
          <span style={{
            fontFamily: 'Anton, Impact, sans-serif', fontSize: 10, letterSpacing: '0.14em',
            padding: '4px 12px', borderRadius: 3,
            color: station.status === 'ACTIVE' ? '#4ade80' : '#f87171',
            border: `1.5px solid ${station.status === 'ACTIVE' ? '#4ade80' : '#f87171'}`,
          }}>
            {station.status}
          </span>
        </div>

        <Row label="Address" value={station.address} />
        <Row label="District" value={station.district} />
        <Row label="State" value={station.state} />
        {station.jurisdictionArea && <Row label="Jurisdiction Area" value={station.jurisdictionArea} />}
        <Row label="FIR Format" value={`FIR-${station.stationCode}-${new Date().getFullYear()}-XXXX`} mono />
        <Row label="Created" value={fmtDate(station.createdAt)} />

        {station.status === 'ACTIVE' && (
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid ${C.bark}` }}>
            <button
              onClick={() => {
                if (window.confirm(`Deactivate ${station.stationName}? It will no longer accept new complaints or FIRs.`)) {
                  deactivate.mutate()
                }
              }}
              disabled={deactivate.isPending}
              style={{
                padding: '8px 20px',
                fontFamily: 'Anton, Impact, sans-serif', fontSize: 12, letterSpacing: '0.12em',
                background: 'transparent', color: '#f87171',
                border: '2px solid #f87171', borderRadius: 3, cursor: 'pointer',
              }}>
              {deactivate.isPending ? 'DEACTIVATING…' : 'DEACTIVATE STATION'}
            </button>
          </div>
        )}
      </div>

      {/* Assignments table */}
      <div style={{ background: `${C.kite}99`, border: `2px solid ${C.charcoal}`, borderRadius: 4, overflow: 'hidden', backdropFilter: 'blur(8px)' }}>
        <div style={{ padding: '16px 20px', borderBottom: `2px solid ${C.charcoal}`, display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: 13, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.ashes }}>
            Officer Assignments
          </span>
          <span style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", fontSize: 12, color: C.charcoal }}>
            {active.length} active
          </span>
        </div>

        {assignments.length === 0 ? (
          <div style={{ padding: 32, fontFamily: "'Space Grotesk', system-ui, sans-serif", fontSize: 13, color: C.charcoal, textAlign: 'center' }}>
            No officers assigned to this station.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={th}>Badge</th>
                <th style={th}>Rank</th>
                <th style={th}>Status</th>
                <th style={th}>Assigned</th>
              </tr>
            </thead>
            <tbody>
              {[...active, ...inactive].map((a) => (
                <tr key={a.id} style={{ opacity: a.isActive ? 1 : 0.5 }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = `${C.bark}88`)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                  <td style={{ ...td, fontFamily: 'monospace', fontWeight: 700 }}>{a.badgeNumber}</td>
                  <td style={{ ...td, color: C.charcoal }}>{a.rank ?? '—'}</td>
                  <td style={td}>
                    <span style={{ color: a.isActive ? '#4ade80' : '#f87171', fontWeight: 600 }}>{a.isActive ? 'ACTIVE' : 'INACTIVE'}</span>
                  </td>
                  <td style={{ ...td, color: C.charcoal }}>{fmtDateTime(a.assignedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
