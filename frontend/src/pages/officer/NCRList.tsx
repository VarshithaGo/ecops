import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { caseApi } from '../../api/caseApi'
import { NcrEntry } from '../../types/case.types'
import { Station } from '../../types/admin.types'
import { stationsApi } from '../../api/stationsApi'
import { StatusBadge } from '../../components/StatusBadge'
import { fmtDate } from '../../utils/date'

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

export function NCRList() {
  const qc = useQueryClient()
  const { data, isLoading, error } = useQuery<NcrEntry[]>({ queryKey: ['ncr'], queryFn: caseApi.listNcr })
  const { data: stations = [] } = useQuery<Station[]>({ queryKey: ['stations'], queryFn: stationsApi.list })
  const stationMap = Object.fromEntries(stations.map((s) => [s.id, s.stationCode]))

  const refer = useMutation({
    mutationFn: (id: string) => caseApi.referNcrToMagistrate(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ncr'] }),
  })

  if (isLoading) return <div style={{ padding: 32, fontFamily: "'Space Grotesk', system-ui, sans-serif", color: C.charcoal }}>Loading NCR entries...</div>
  if (error)     return <div style={{ padding: 32, fontFamily: "'Space Grotesk', system-ui, sans-serif", color: '#f87171' }}>Error loading NCR.</div>

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1100 }}>
      <h2 style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: 26, letterSpacing: '0.06em', color: C.ashes, margin: 0, marginBottom: 6 }}>
        Non-Cognizable Register (NCR)
      </h2>
      <p style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", color: C.charcoal, fontSize: 13, marginBottom: 24, lineHeight: 1.6 }}>
        Non-cognizable offences recorded under BNSS Section 174. Form 76-A issued to complainant; case referred to Magistrate for directions.
      </p>

      <div style={{ border: `2px solid ${C.charcoal}`, borderRadius: 4, overflow: 'hidden', backdropFilter: 'blur(8px)', background: `${C.kite}99` }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={th}>NCR Number</th>
              <th style={th}>Station</th>
              <th style={th}>Form 76-A</th>
              <th style={th}>Status</th>
              <th style={th}>Date</th>
              <th style={th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((ncr) => (
              <tr key={ncr.id}
                onMouseEnter={(e) => (e.currentTarget.style.background = `${C.bark}88`)}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                <td style={{ ...td, fontFamily: 'monospace', fontWeight: 700 }}>{ncr.ncrNumber}</td>
                <td style={{ ...td, fontFamily: 'monospace' }}>{stationMap[ncr.stationId] ?? ncr.stationId.slice(0, 8) + '…'}</td>
                <td style={td}>
                  <span style={{ color: ncr.form76aIssued ? '#4ade80' : '#f87171', fontWeight: 600 }}>
                    {ncr.form76aIssued ? 'Issued' : 'Not issued'}
                  </span>
                </td>
                <td style={td}><StatusBadge status={ncr.status} size="sm" /></td>
                <td style={{ ...td, color: C.charcoal }}>{fmtDate(ncr.createdAt)}</td>
                <td style={td}>
                  {ncr.status === 'OPEN' && (
                    <button
                      onClick={() => refer.mutate(ncr.id)}
                      disabled={refer.isPending}
                      style={{
                        padding: '4px 14px',
                        fontFamily: 'Anton, Impact, sans-serif', fontSize: 11, letterSpacing: '0.1em',
                        background: 'transparent', color: C.ashes,
                        border: `1.5px solid ${C.charcoal}`, borderRadius: 3, cursor: 'pointer',
                      }}>
                      REFER TO MAGISTRATE
                    </button>
                  )}
                  {ncr.status === 'MAGISTRATE_ORDERED' && ncr.magistrateOrderNotes && (
                    <span style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", fontSize: 12, color: C.charcoal, fontStyle: 'italic' }}>
                      {ncr.magistrateOrderNotes.slice(0, 40)}{ncr.magistrateOrderNotes.length > 40 ? '…' : ''}
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {data?.length === 0 && (
              <tr><td colSpan={6} style={{ ...td, textAlign: 'center', color: C.charcoal, padding: 32 }}>No NCR entries.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
