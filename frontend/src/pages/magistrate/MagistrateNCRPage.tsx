import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { caseApi } from '../../api/caseApi'
import { NcrEntry } from '../../types/case.types'
import { Station } from '../../types/admin.types'
import { stationsApi } from '../../api/stationsApi'
import { fmtDate } from '../../utils/date'

const C = { angst: '#0A0A0A', kite: '#371E1E', bark: '#33312F', charcoal: '#726E68', ashes: '#B7B4AE' }

const lbl: React.CSSProperties = {
  fontFamily: "'Space Grotesk', system-ui, sans-serif",
  fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase',
  color: C.charcoal, marginBottom: 2,
}
const val: React.CSSProperties = {
  fontFamily: "'Space Grotesk', system-ui, sans-serif",
  fontSize: 13, color: C.ashes, lineHeight: 1.6,
}
const inputStyle: React.CSSProperties = {
  padding: '10px 14px', background: C.bark, color: C.ashes,
  border: `2px solid ${C.charcoal}`, borderRadius: 3,
  fontFamily: "'Space Grotesk', system-ui, sans-serif",
  fontSize: 13, width: '100%', boxSizing: 'border-box', outline: 'none',
  colorScheme: 'dark',
}

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
        <div style={{
          fontFamily: "'Space Grotesk', system-ui, sans-serif", color: C.charcoal,
          padding: 32, border: `2px solid ${C.bark}`, borderRadius: 4,
          textAlign: 'center', backdropFilter: 'blur(8px)', background: `${C.kite}99`,
        }}>
          No NCR referrals pending your review.
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {referred.map((ncr) => (
          <div key={ncr.id} style={{
            background: `${C.kite}99`, border: `2px solid ${C.charcoal}`,
            borderRadius: 4, padding: '20px 24px', backdropFilter: 'blur(8px)',
          }}>
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
                <div style={lbl}>Form 76-A Issued</div>
                <div style={{ ...val, color: ncr.form76aIssued ? '#4ade80' : C.charcoal }}>
                  {ncr.form76aIssued ? 'Yes' : 'No'}
                </div>
              </div>
              <div>
                <div style={lbl}>Status</div>
                <div style={{ ...val, fontFamily: 'monospace', letterSpacing: '0.06em', color: '#fbbf24' }}>
                  REFERRED TO MAGISTRATE
                </div>
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
              style={{
                padding: '7px 22px',
                fontFamily: 'Anton, Impact, sans-serif', fontSize: 11, letterSpacing: '0.12em',
                background: 'transparent', color: C.ashes,
                border: `1.5px solid ${C.charcoal}`, borderRadius: 3, cursor: 'pointer',
              }}>
              ORDER INVESTIGATION
            </button>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selected && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(10,10,10,0.75)',
          backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200,
        }}>
          <div style={{ background: C.kite, border: `2px solid ${C.charcoal}`, borderRadius: 4, padding: 32, minWidth: 460, maxWidth: 540, boxShadow: `0 24px 64px ${C.angst}` }}>
            <h3 style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: 20, letterSpacing: '0.06em', color: C.ashes, margin: '0 0 4px' }}>
              Order Investigation
            </h3>
            <div style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", fontSize: 13, color: C.charcoal, marginBottom: 16 }}>
              NCR: <span style={{ color: C.ashes, fontFamily: 'monospace', fontWeight: 700 }}>{selected.ncrNumber}</span>
            </div>
            {selected.remarks && (
              <div style={{ marginBottom: 16, padding: '8px 12px', background: `${C.angst}44`, borderRadius: 3, border: `1px solid ${C.bark}` }}>
                <div style={{ ...lbl, marginBottom: 4 }}>Officer Remarks</div>
                <div style={val}>{selected.remarks}</div>
              </div>
            )}
            <label style={lbl}>Order Notes <span style={{ opacity: 0.6, fontFamily: "'Space Grotesk', system-ui, sans-serif", fontSize: 10 }}>(optional)</span></label>
            <textarea
              placeholder="Enter your directions to the investigating officer…"
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              rows={4}
              style={{ ...inputStyle, resize: 'vertical', marginBottom: 20 }}
            />
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => orderInvestigation.mutate(selected.id)}
                disabled={orderInvestigation.isPending}
                style={{ padding: '9px 24px', fontFamily: 'Anton, Impact, sans-serif', fontSize: 13, letterSpacing: '0.12em', background: 'transparent', color: '#4ade80', border: '2px solid #4ade80', borderRadius: 3, cursor: 'pointer' }}>
                {orderInvestigation.isPending ? 'ORDERING…' : 'ORDER INVESTIGATION'}
              </button>
              <button onClick={() => setSelected(null)}
                style={{ padding: '9px 20px', fontFamily: 'Anton, Impact, sans-serif', fontSize: 13, letterSpacing: '0.12em', background: 'transparent', color: C.charcoal, border: `2px solid ${C.bark}`, borderRadius: 3, cursor: 'pointer' }}>
                CANCEL
              </button>
            </div>
            {orderInvestigation.isError && (
              <div style={{ marginTop: 12, fontFamily: "'Space Grotesk', system-ui, sans-serif", fontSize: 12, color: '#f87171' }}>
                Failed to submit order. Please try again.
              </div>
            )}
          </div>
        </div>
      )}
      <style>{`textarea::placeholder { color: ${C.charcoal}; opacity: 0.6; }`}</style>
    </div>
  )
}
