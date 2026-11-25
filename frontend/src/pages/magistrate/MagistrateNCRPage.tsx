import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { caseApi } from '../../api/caseApi'
import { NcrEntry } from '../../types/case.types'
import { Station } from '../../types/admin.types'
import { stationsApi } from '../../api/stationsApi'
import { OfficerChip } from '../../components/OfficerChip'
import { fmtDate } from '../../utils/date'
import { apiError } from '../../utils/apiError'

import { C, A, FONT, FIELD_BORDER } from '../../theme'

const lbl: React.CSSProperties = { fontFamily: FONT.ui, fontSize: 12, fontWeight: 600, color: C.charcoal, marginBottom: 2 }
const val: React.CSSProperties = { fontFamily: FONT.ui, fontSize: 14, color: C.ashes, lineHeight: 1.6 }
const inputStyle: React.CSSProperties = {
  padding: '10px 12px', background: '#fff', color: C.ashes,
  border: `1.5px solid ${FIELD_BORDER}`, borderRadius: 6,
  fontFamily: FONT.ui, fontSize: 14, width: '100%', boxSizing: 'border-box', outline: 'none',
}
const card: React.CSSProperties = { background: '#fff', border: `1px solid ${C.bark}`, borderRadius: 10, padding: '20px 22px', boxShadow: '0 1px 3px rgba(16,32,44,0.06)' }

export function MagistrateNCRPage() {
  const qc = useQueryClient()
  const { data: allNcr = [], isLoading, error } = useQuery<NcrEntry[]>({
    queryKey: ['ncr'],
    queryFn: caseApi.listNcr,
  })
  const { data: stations = [] } = useQuery<Station[]>({ queryKey: ['stations'], queryFn: stationsApi.list })
  const stationMap = Object.fromEntries(stations.map((s) => [s.id, s.stationCode]))

  const referred = allNcr.filter((n) => n.status === 'REFERRED_TO_MAGISTRATE')

  const [selected, setSelected] = useState<NcrEntry | null>(null)
  const [orderNotes, setOrderNotes] = useState('')

  const orderInvestigation = useMutation({
    mutationFn: (id: string) => caseApi.magistrateOrderNcr(id, orderNotes || undefined),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ncr'] })
      setSelected(null)
      setOrderNotes('')
    },
  })

  if (isLoading) return (
    <div style={{ padding: 32, fontFamily: "'Space Grotesk', system-ui, sans-serif", color: C.charcoal }}>
      Loading NCR referrals…
    </div>
  )
  if (error) return (
    <div style={{ padding: 32, fontFamily: "'Space Grotesk', system-ui, sans-serif", color: '#f87171' }}>
      Error loading NCR referrals.
    </div>
  )

  return (
    <div style={{ padding: '32px 40px', maxWidth: 900 }}>
      <h2 style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: 26, letterSpacing: '0.06em', color: C.ashes, margin: 0, marginBottom: 6 }}>
        NCR Referrals
      </h2>
      <p style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", color: C.charcoal, fontSize: 13, marginBottom: 28, lineHeight: 1.6 }}>
        Non-cognizable offences referred to you for directions under BNSS Section 174. Order investigation as required.
      </p>

      {referred.length === 0 && (
        <div style={{ ...card, color: C.charcoal, padding: 32, textAlign: 'center' }}>
          No NCR referrals pending your review.
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {referred.map((ncr) => (
          <div key={ncr.id} style={card}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
              <div style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: 18, letterSpacing: '0.06em', color: C.ashes }}>
                {ncr.ncrNumber}
              </div>
              <div style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", fontSize: 11, color: C.charcoal, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Referred {fmtDate(ncr.createdAt)}
              </div>
            </div>

            {/* Detail grid */}
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 14 }}>
              <div>
                <div style={lbl}>Station</div>
                <div style={{ ...val, fontFamily: 'monospace' }}>{stationMap[ncr.stationId] ?? ncr.stationId.slice(0, 8) + '…'}</div>
              </div>
              <div>
                <div style={lbl}>Referred by</div>
                <div style={val}><OfficerChip keycloakUserId={ncr.recordedByOfficerId ?? undefined} /></div>
              </div>
              <div>
                <div style={lbl}>Form 76-A Issued</div>
                <div style={{ ...val, color: ncr.form76aIssued ? '#15803D' : C.charcoal }}>
                  {ncr.form76aIssued ? 'Yes' : 'No'}
                </div>
              </div>
            </div>

            {/* What the complaint is about — the Magistrate must see this before ordering */}
            <div style={{ marginBottom: 14, padding: '12px 16px', background: C.angst, borderRadius: 8, border: `1px solid ${C.bark}` }}>
              <div style={lbl}>Complaint</div>
              <div style={val}>{ncr.complaintDescription ?? '—'}</div>
              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginTop: 10 }}>
                {ncr.complainantName && <div><div style={lbl}>Complainant</div><div style={val}>{ncr.complainantName}</div></div>}
                {ncr.incidentDate && <div><div style={lbl}>Incident date</div><div style={val}>{fmtDate(ncr.incidentDate)}</div></div>}
                {ncr.incidentLocation && <div><div style={lbl}>Location</div><div style={val}>{ncr.incidentLocation}</div></div>}
                {ncr.complaintNumber && <div><div style={lbl}>Complaint no.</div><div style={{ ...val, fontFamily: 'monospace' }}>{ncr.complaintNumber}</div></div>}
              </div>
            </div>

            {ncr.remarks && (
              <div style={{ marginBottom: 14 }}>
                <div style={lbl}>Officer Remarks</div>
                <div style={{ ...val, padding: '8px 12px', background: `${C.angst}44`, borderRadius: 3, border: `1px solid ${C.bark}` }}>
                  {ncr.remarks}
                </div>
              </div>
            )}

            <button
              onClick={() => { setSelected(ncr); setOrderNotes('') }}
              style={{ padding: '9px 22px', fontFamily: FONT.ui, fontSize: 14, fontWeight: 600, background: A.accent, color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
              Order investigation
            </button>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selected && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(16,32,44,0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 16,
        }}>
          <div style={{ background: '#fff', border: `1px solid ${C.bark}`, borderRadius: 12, padding: 32, minWidth: 460, maxWidth: 540, boxShadow: '0 24px 60px rgba(16,32,44,0.30)' }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: C.ashes, margin: '0 0 4px', fontFamily: FONT.ui }}>
              Order Investigation
            </h3>
            <div style={{ fontFamily: FONT.ui, fontSize: 14, color: C.charcoal, marginBottom: 16 }}>
              NCR: <span style={{ color: C.ashes, fontFamily: 'monospace', fontWeight: 700 }}>{selected.ncrNumber}</span>
            </div>
            <div style={{ marginBottom: 16, padding: '10px 12px', background: C.angst, borderRadius: 8, border: `1px solid ${C.bark}` }}>
              <div style={{ ...lbl, marginBottom: 4 }}>Complaint</div>
              <div style={val}>{selected.complaintDescription ?? '—'}</div>
              <div style={{ fontSize: 12, color: C.charcoal, marginTop: 6 }}>
                {selected.complainantName ? `${selected.complainantName}` : ''}
                {selected.incidentLocation ? ` · ${selected.incidentLocation}` : ''}
              </div>
            </div>
            {selected.remarks && (
              <div style={{ marginBottom: 16, padding: '10px 12px', background: C.angst, borderRadius: 8, border: `1px solid ${C.bark}` }}>
                <div style={{ ...lbl, marginBottom: 4 }}>Officer Remarks</div>
                <div style={val}>{selected.remarks}</div>
              </div>
            )}
            <label style={lbl}>Order notes <span style={{ fontWeight: 400 }}>(optional)</span></label>
            <textarea
              placeholder="Enter your directions to the investigating officer…"
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              rows={4}
              style={{ ...inputStyle, resize: 'vertical', margin: '6px 0 20px' }}
            />
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => orderInvestigation.mutate(selected.id)}
                disabled={orderInvestigation.isPending}
                style={{ padding: '10px 22px', fontFamily: FONT.ui, fontSize: 14, fontWeight: 600, background: '#15803D', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
                {orderInvestigation.isPending ? 'Ordering…' : 'Order investigation'}
              </button>
              <button onClick={() => setSelected(null)}
                style={{ padding: '10px 20px', fontFamily: FONT.ui, fontSize: 14, fontWeight: 600, background: '#fff', color: C.ashes, border: `1px solid ${C.charcoal}66`, borderRadius: 8, cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
            {orderInvestigation.isError && (
              <div style={{ marginTop: 12, fontFamily: FONT.ui, fontSize: 13, color: '#B91C1C' }}>
                {apiError(orderInvestigation.error, 'Failed to submit order. Please try again.')}
              </div>
            )}
          </div>
        </div>
      )}
      <style>{`textarea::placeholder { color: ${C.charcoal}; opacity: 0.6; }`}</style>
    </div>
  )
}
