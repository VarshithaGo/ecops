import { useQuery, useMutation } from '@tanstack/react-query'
import { caseApi } from '../../api/caseApi'
import { ArrestWarrant, Fir } from '../../types/case.types'
import { useState } from 'react'
import { apiError } from '../../utils/apiError'
import { C, A, FONT, FIELD_BORDER } from '../../theme'

const lbl: React.CSSProperties = { fontFamily: FONT.ui, fontSize: 12, fontWeight: 600, color: C.charcoal, marginBottom: 2 }
const val: React.CSSProperties = { fontFamily: FONT.ui, fontSize: 14, color: C.ashes, lineHeight: 1.6 }
const inputStyle: React.CSSProperties = { padding: '10px 12px', background: '#fff', color: C.ashes, border: `1.5px solid ${FIELD_BORDER}`, borderRadius: 6, fontFamily: FONT.ui, fontSize: 14, width: '100%', boxSizing: 'border-box', outline: 'none' }

function FirContext({ firId }: { firId: string }) {
  const { data: fir, isLoading } = useQuery<Fir>({ queryKey: ['fir', firId], queryFn: () => caseApi.getFir(firId) })
  if (isLoading) return <div style={{ padding: '10px 14px', background: C.angst, borderRadius: 8, border: `1px solid ${C.bark}`, fontSize: 13, color: C.charcoal }}>Loading FIR details…</div>
  if (!fir) return null
  return (
    <div style={{ padding: '12px 16px', background: C.angst, borderRadius: 8, border: `1px solid ${C.bark}`, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        <div><div style={lbl}>FIR Number</div><div style={{ ...val, fontFamily: 'monospace', fontWeight: 700 }}>{fir.firNumber}</div></div>
        <div><div style={lbl}>Station</div><div style={{ ...val, fontFamily: 'monospace' }}>{fir.stationCode}</div></div>
        <div style={{ flex: 1, minWidth: 160 }}><div style={lbl}>BNS / IPC Sections</div><div style={{ ...val, fontFamily: 'monospace' }}>{fir.ipcSections}</div></div>
      </div>
      <div><div style={lbl}>Case Narrative</div><div style={val}>{fir.narrative}</div></div>
      {fir.accusedName && <div><div style={lbl}>Accused Name (from FIR)</div><div style={val}>{fir.accusedName}</div></div>}
      {fir.accusedAddress && <div><div style={lbl}>Accused Address</div><div style={val}>{fir.accusedAddress}</div></div>}
    </div>
  )
}

export function WarrantApprovalPage() {
  const { data, isLoading, refetch } = useQuery<ArrestWarrant[]>({ queryKey: ['warrants-pending'], queryFn: caseApi.listPendingWarrants })
  const [selected, setSelected] = useState<ArrestWarrant | null>(null)
  const [notes, setNotes] = useState('')

  const decide = useMutation({
    mutationFn: ({ id, decision }: { id: string; decision: string }) => caseApi.decideWarrant(id, { decision, decisionNotes: notes }),
    onSuccess: () => { refetch(); setSelected(null); setNotes('') },
  })

  if (isLoading) return <div style={{ padding: 32, fontFamily: FONT.ui, color: C.charcoal }}>Loading…</div>

  return (
    <div style={{ padding: '32px 24px', maxWidth: 900, margin: '0 auto', fontFamily: FONT.ui }}>
      <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.01em', color: C.ashes, margin: 0 }}>Pending Arrest Warrants</h2>
      <p style={{ color: C.charcoal, fontSize: 14, margin: '6px 0 24px' }}>
        Arrest-warrant requests submitted by investigating officers awaiting your decision.
      </p>

      {data?.length === 0 && (
        <div style={{ color: C.charcoal, padding: 32, border: `1px solid ${C.bark}`, borderRadius: 10, textAlign: 'center', background: '#fff' }}>
          No pending warrant requests.
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {data?.map((w) => (
          <div key={w.id} style={{ background: '#fff', border: `1px solid ${C.bark}`, borderRadius: 10, padding: '20px 22px', boxShadow: '0 1px 3px rgba(16,32,44,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.ashes }}>{w.accusedName}</div>
              <div style={{ fontSize: 12, color: C.charcoal }}>Requested {new Date(w.requestedAt).toLocaleDateString('en-IN')}</div>
            </div>
            <div style={{ marginBottom: 14 }}><div style={lbl}>Grounds for Arrest</div><div style={val}>{w.reason}</div></div>
            {w.accusedDescription && <div style={{ marginBottom: 14 }}><div style={lbl}>Accused Description</div><div style={val}>{w.accusedDescription}</div></div>}
            <div style={{ marginBottom: 16 }}><div style={{ ...lbl, marginBottom: 8 }}>FIR Context</div><FirContext firId={w.firId} /></div>
            <button onClick={() => { setSelected(w); setNotes('') }}
              style={{ padding: '9px 22px', fontFamily: FONT.ui, fontSize: 14, fontWeight: 600, background: A.accent, color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
              Decide
            </button>
          </div>
        ))}
      </div>

      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(16,32,44,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 16 }}>
          <div style={{ background: '#fff', border: `1px solid ${C.bark}`, borderRadius: 12, padding: 32, minWidth: 460, maxWidth: 540, boxShadow: '0 24px 60px rgba(16,32,44,0.30)' }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: C.ashes, margin: '0 0 4px' }}>Decide warrant</h3>
            <div style={{ fontSize: 14, color: C.charcoal, marginBottom: 16 }}>
              Accused: <span style={{ color: C.ashes, fontWeight: 600 }}>{selected.accusedName}</span>
            </div>
            <div style={{ ...lbl, marginBottom: 6 }}>Grounds</div>
            <div style={{ ...val, marginBottom: 20, padding: '10px 12px', background: C.angst, borderRadius: 8, border: `1px solid ${C.bark}` }}>{selected.reason}</div>
            <label style={lbl}>Decision notes <span style={{ fontWeight: 400 }}>(optional)</span></label>
            <textarea placeholder="Enter your reasoning or conditions…" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
              style={{ ...inputStyle, resize: 'vertical', margin: '6px 0 20px' }} />
            {decide.isError && <div style={{ background: '#FEF3F2', border: '1px solid #FECDCA', color: '#B91C1C', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 16 }}>{apiError(decide.error, 'Could not record the decision.')}</div>}
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => decide.mutate({ id: selected.id, decision: 'ISSUED' })} disabled={decide.isPending}
                style={{ padding: '10px 22px', fontFamily: FONT.ui, fontSize: 14, fontWeight: 600, background: '#15803D', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
                {decide.isPending ? 'Saving…' : 'Issue warrant'}
              </button>
              <button onClick={() => decide.mutate({ id: selected.id, decision: 'REJECTED' })} disabled={decide.isPending}
                style={{ padding: '10px 22px', fontFamily: FONT.ui, fontSize: 14, fontWeight: 600, background: '#fff', color: '#B91C1C', border: '1px solid #B91C1C66', borderRadius: 8, cursor: 'pointer' }}>
                Reject
              </button>
              <button onClick={() => setSelected(null)}
                style={{ padding: '10px 20px', fontFamily: FONT.ui, fontSize: 14, fontWeight: 600, background: '#fff', color: C.ashes, border: `1px solid ${C.charcoal}66`, borderRadius: 8, cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
