import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { caseApi } from '../../api/caseApi'
import { NcrEntry } from '../../types/case.types'
import { Station } from '../../types/admin.types'
import { stationsApi } from '../../api/stationsApi'
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

export function NCRList() {
  const qc = useQueryClient()
  const { data, isLoading, error } = useQuery<NcrEntry[]>({ queryKey: ['ncr'], queryFn: caseApi.listNcr })
  const { data: stations = [] } = useQuery<Station[]>({ queryKey: ['stations'], queryFn: stationsApi.list })
  const stationMap = Object.fromEntries(stations.map((s) => [s.id, s.stationCode]))
  const { roles } = useAuth()
  const { stationId: myStationId } = useCurrentOfficer()
  const isAdmin = roles.includes(ROLES.ADMIN)
  // Officers see only their own station's NCRs; admins see all.
  const ncrs = (data ?? []).filter((n) => isAdmin || !myStationId || n.stationId === myStationId)

  const refer = useMutation({
    mutationFn: (id: string) => caseApi.referNcrToMagistrate(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ncr'] }),
  })

  if (isLoading) return <div style={{ padding: 32, fontFamily: "'Space Grotesk', system-ui, sans-serif", color: C.charcoal }}>Loading NCR entries...</div>
  if (error)     return <div style={{ padding: 32, fontFamily: "'Space Grotesk', system-ui, sans-serif", color: '#f87171' }}>Error loading NCR.</div>

  return (
    <div style={{ padding: '32px 24px', maxWidth: 1100, margin: '0 auto' }}>
      <h2 style={{ fontFamily: FONT.ui, fontSize: 24, fontWeight: 700, letterSpacing: '-0.01em', color: C.ashes, margin: 0, marginBottom: 6 }}>
        Non-Cognizable Register (NCR)
      </h2>
      <p style={{ fontFamily: FONT.ui, color: C.charcoal, fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
        Non-cognizable offences recorded under BNSS Section 174. Form 76-A issued to complainant; case referred to Magistrate for directions.
      </p>

      <div style={{ border: `1px solid ${C.bark}`, borderRadius: 10, overflow: 'hidden', background: '#fff', boxShadow: '0 1px 3px rgba(16,32,44,0.06)' }}>
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
            {ncrs.map((ncr) => (
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
                        padding: '6px 14px', fontFamily: FONT.ui, fontSize: 13, fontWeight: 600,
                        background: A.accent, color: '#fff',
                        border: 'none', borderRadius: 6, cursor: 'pointer',
                      }}>
                      Refer to magistrate
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
            {ncrs.length === 0 && (
              <tr><td colSpan={6} style={{ ...td, textAlign: 'center', color: C.charcoal, padding: 32 }}>No NCR entries.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
