import { useQuery, useMutation } from '@tanstack/react-query'
import { caseApi } from '../../api/caseApi'
import { ArrestWarrant, Fir } from '../../types/case.types'
import { useState } from 'react'

import { C } from '../../theme'

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
}

function FirContext({ firId }: { firId: string }) {
  const { data: fir, isLoading } = useQuery<Fir>({
    queryKey: ['fir', firId],
    queryFn: () => caseApi.getFir(firId),
  })
  if (isLoading) return (
    <div style={{ padding: '10px 14px', background: `${C.angst}44`, borderRadius: 3, border: `1px solid ${C.bark}` }}>
      <span style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", fontSize: 12, color: C.charcoal }}>Loading FIR details…</span>
    </div>
  )
  if (!fir) return null
  return (
    <div style={{ padding: '12px 16px', background: `${C.angst}44`, borderRadius: 3, border: `1px solid ${C.bark}`, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        <div>
          <div style={lbl}>FIR Number</div>
          <div style={{ ...val, fontFamily: 'monospace', fontWeight: 700 }}>{fir.firNumber}</div>
        </div>
        <div>
          <div style={lbl}>Station</div>
          <div style={{ ...val, fontFamily: 'monospace' }}>{fir.stationCode}</div>
        </div>
        <div style={{ flex: 1, minWidth: 160 }}>
          <div style={lbl}>BNS / IPC Sections</div>
          <div style={{ ...val, fontFamily: 'monospace' }}>{fir.ipcSections}</div>
        </div>
      </div>
      <div>
        <div style={lbl}>Case Narrative</div>
        <div style={val}>{fir.narrative}</div>
      </div>
      {fir.accusedName && (
        <div>
          <div style={lbl}>Accused Name (from FIR)</div>
          <div style={val}>{fir.accusedName}</div>
        </div>
      )}
      {fir.accusedAddress && (
        <div>
          <div style={lbl}>Accused Address</div>
          <div style={val}>{fir.accusedAddress}</div>
        </div>
      )}
    </div>
  )
}

export function WarrantApprovalPage() {
  const { data, isLoading, refetch } = useQuery<ArrestWarrant[]>({
    queryKey: ['warrants-pending'],
    queryFn: caseApi.listPendingWarrants,
  })
  const [selected, setSelected] = useState<ArrestWarrant | null>(null)
  const [notes, setNotes] = useState('')

  const decide = useMutation({
    mutationFn: ({ id, decision }: { id: string; decision: string }) =>
      caseApi.decideWarrant(id, { decision, decisionNotes: notes }),
    onSuccess: () => { refetch(); setSelected(null); setNotes('') },
  })

  if (isLoading) return <div style={{ padding: 32, fontFamily: "'Space Grotesk', system-ui, sans-serif", color: C.charcoal }}>Loading...</div>

  return (
    <div style={{ padding: '32px 40px', maxWidth: 900 }}>
      <h2 style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: 26, letterSpacing: '0.06em', color: C.ashes, margin: 0, marginBottom: 6 }}>
        Pending Arrest Warrants
      </h2>
      <p style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", color: C.charcoal, fontSize: 13, marginBottom: 28 }}>
        Arrest warrant requests submitted by investigating officers awaiting your decision.
      </p>

      {data?.length === 0 && (
        <div style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", color: C.charcoal, padding: 32,
          border: `2px solid ${C.bark}`, borderRadius: 4, textAlign: 'center', backdropFilter: 'blur(8px)', background: `${C.kite}99` }}>
          No pending warrant requests.
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {data?.map((w) => (
          <div key={w.id} style={{
            background: `${C.kite}99`, border: `2px solid ${C.charcoal}`,
            borderRadius: 4, padding: '20px 24px', backdropFilter: 'blur(8px)',
          }}>
            {/* Header: accused name + date */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
              <div style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: 18, letterSpacing: '0.06em', color: C.ashes }}>
                {w.accusedName}
              </div>
              <div style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", fontSize: 11, color: C.charcoal, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Requested {new Date(w.requestedAt).toLocaleDateString('en-IN')}
              </div>
            </div>

            {/* Warrant grounds */}
            <div style={{ marginBottom: 14 }}>
              <div style={lbl}>Grounds for Arrest</div>
              <div style={val}>{w.reason}</div>
            </div>
            {w.accusedDescription && (
              <div style={{ marginBottom: 14 }}>
                <div style={lbl}>Accused Description</div>
                <div style={val}>{w.accusedDescription}</div>
              </div>
            )}

            {/* FIR context */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ ...lbl, marginBottom: 8 }}>FIR Context</div>
              <FirContext firId={w.firId} />
            </div>

            <button
              onClick={() => { setSelected(w); setNotes('') }}
              style={{
                padding: '7px 22px',
                fontFamily: 'Anton, Impact, sans-serif', fontSize: 11, letterSpacing: '0.12em',
                background: 'transparent', color: C.ashes,
                border: `1.5px solid ${C.charcoal}`, borderRadius: 3, cursor: 'pointer',
              }}>
              DECIDE
            </button>
          </div>
        ))}
      </div>

      {selected && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(10,10,10,0.75)',
          backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200,
        }}>
          <div style={{ background: C.kite, border: `2px solid ${C.charcoal}`, borderRadius: 4, padding: 32, minWidth: 460, maxWidth: 540, boxShadow: `0 24px 64px ${C.angst}` }}>
            <h3 style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: 20, letterSpacing: '0.06em', color: C.ashes, margin: '0 0 4px' }}>
              Decide Warrant
            </h3>
            <div style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", fontSize: 13, color: C.charcoal, marginBottom: 16 }}>
              Accused: <span style={{ color: C.ashes, fontWeight: 600 }}>{selected.accusedName}</span>
            </div>
            <div style={{ marginBottom: 6, ...lbl }}>Grounds</div>
            <div style={{ ...val, marginBottom: 20, padding: '8px 12px', background: `${C.angst}44`, borderRadius: 3, border: `1px solid ${C.bark}` }}>
              {selected.reason}
            </div>
            <label style={lbl}>Decision Notes <span style={{ opacity: 0.6 }}>(optional)</span></label>
            <textarea
              placeholder="Enter your reasoning or conditions…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              style={{ ...inputStyle, resize: 'vertical', marginBottom: 20 }}
            />
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => decide.mutate({ id: selected.id, decision: 'ISSUED' })}
                disabled={decide.isPending}
                style={{ padding: '9px 24px', fontFamily: 'Anton, Impact, sans-serif', fontSize: 13, letterSpacing: '0.12em', background: 'transparent', color: '#4ade80', border: '2px solid #4ade80', borderRadius: 3, cursor: 'pointer' }}>
                {decide.isPending ? 'SAVING…' : 'ISSUE WARRANT'}
              </button>
              <button
                onClick={() => decide.mutate({ id: selected.id, decision: 'REJECTED' })}
                disabled={decide.isPending}
                style={{ padding: '9px 24px', fontFamily: 'Anton, Impact, sans-serif', fontSize: 13, letterSpacing: '0.12em', background: 'transparent', color: '#f87171', border: '2px solid #f87171', borderRadius: 3, cursor: 'pointer' }}>
                REJECT
              </button>
              <button onClick={() => setSelected(null)}
                style={{ padding: '9px 20px', fontFamily: 'Anton, Impact, sans-serif', fontSize: 13, letterSpacing: '0.12em', background: 'transparent', color: C.charcoal, border: `2px solid ${C.bark}`, borderRadius: 3, cursor: 'pointer' }}>
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}
      <style>{`textarea::placeholder { color: ${C.charcoal}; opacity: 0.6; }`}</style>
    </div>
  )
}
