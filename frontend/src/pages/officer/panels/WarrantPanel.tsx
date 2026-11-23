import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { SectionPanel } from '../../../components/SectionPanel'
import { DetailRow } from '../../../components/DetailRow'
import { StatusBadge } from '../../../components/StatusBadge'
import { ArrestWarrant } from '../../../types/case.types'
import { caseApi } from '../../../api/caseApi'
import { fmtDateTime } from '../../../utils/date'

const C = { angst: '#0A0A0A', bark: '#33312F', charcoal: '#726E68', ashes: '#B7B4AE' }
const inp: React.CSSProperties = { padding: '10px 14px', background: C.bark, color: C.ashes, border: `2px solid ${C.charcoal}`, borderRadius: 3, fontFamily: "'Space Grotesk', system-ui, sans-serif", fontSize: 13, width: '100%', boxSizing: 'border-box', outline: 'none' }
const lbl: React.CSSProperties = { display: 'block', fontFamily: "'Space Grotesk', system-ui, sans-serif", fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.charcoal, marginBottom: 6 }

interface Props { firId: string; warrants: ArrestWarrant[] }

export function WarrantPanel({ firId, warrants }: Props) {
  const qc = useQueryClient()
  const [f, setF] = useState({ accusedName: '', accusedDescription: '', reason: '' })
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF((p) => ({ ...p, [k]: e.target.value }))

  const request = useMutation({
    mutationFn: () => caseApi.requestWarrant({ ...f, firId, accusedDescription: f.accusedDescription || null }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['fir-warrants', firId] }); setF({ accusedName: '', accusedDescription: '', reason: '' }) },
  })
  const execute = useMutation({
    mutationFn: (warrantId: string) => caseApi.executeWarrant(warrantId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['fir-warrants', firId] }),
  })
  const cancel = useMutation({
    mutationFn: (warrantId: string) => caseApi.cancelWarrant(warrantId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['fir-warrants', firId] }),
  })

  const canRequest = f.accusedName && f.reason && !request.isPending

  const addForm = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div><label style={lbl}>Accused Name</label><input value={f.accusedName} onChange={set('accusedName')} style={inp} /></div>
      <div><label style={lbl}>Accused Description <span style={{ opacity: 0.6 }}>(optional)</span></label><input value={f.accusedDescription} onChange={set('accusedDescription')} style={inp} placeholder="Physical description, alias…" /></div>
      <div><label style={lbl}>Reason for Warrant</label><textarea rows={3} value={f.reason} onChange={set('reason')} style={{ ...inp, resize: 'vertical' }} /></div>
      <button onClick={() => request.mutate()} disabled={!canRequest}
        style={{ padding: '9px 20px', fontFamily: 'Anton, Impact, sans-serif', fontSize: 11, letterSpacing: '0.12em', background: 'transparent', color: canRequest ? C.ashes : C.charcoal, border: `2px solid ${canRequest ? C.charcoal : C.bark}`, borderRadius: 3, cursor: canRequest ? 'pointer' : 'not-allowed', alignSelf: 'flex-start' }}>
        {request.isPending ? 'REQUESTING…' : 'REQUEST WARRANT'}
      </button>
      <style>{`input::placeholder, textarea::placeholder { color: ${C.charcoal}; opacity: 0.6; }`}</style>
    </div>
  )

  return (
    <SectionPanel title="Arrest Warrants" addLabel="Request Warrant" addForm={addForm}>
      {warrants.length === 0 ? (
        <p style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", color: C.charcoal, fontSize: 13 }}>No warrants issued for this FIR.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {warrants.map((w) => (
            <div key={w.id} style={{ padding: '10px 14px', background: `${C.angst}66`, borderRadius: 3, border: `1px solid ${C.bark}` }}>
              <DetailRow label="Accused" value={w.accusedName} />
              {w.accusedDescription && <DetailRow label="Description" value={w.accusedDescription} />}
              <DetailRow label="Reason" value={w.reason} />
              <DetailRow label="Status" value={<StatusBadge status={w.status} size="sm" />} />
              <DetailRow label="Requested At" value={fmtDateTime(w.requestedAt)} />
              {w.decidedAt && <DetailRow label="Decided At" value={fmtDateTime(w.decidedAt)} />}
              {w.decisionNotes && <DetailRow label="Notes" value={w.decisionNotes} />}
              {(w.status === 'ISSUED' || w.status === 'PENDING') && (
                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  {w.status === 'ISSUED' && (
                    <button onClick={() => execute.mutate(w.id)} disabled={execute.isPending}
                      style={{ padding: '5px 14px', fontFamily: 'Anton, Impact, sans-serif', fontSize: 10, letterSpacing: '0.1em', background: 'transparent', color: '#a78bfa', border: '1.5px solid #a78bfa', borderRadius: 3, cursor: 'pointer' }}>
                      MARK EXECUTED
                    </button>
                  )}
                  <button onClick={() => { if (window.confirm('Cancel this warrant?')) cancel.mutate(w.id) }} disabled={cancel.isPending}
                    style={{ padding: '5px 14px', fontFamily: 'Anton, Impact, sans-serif', fontSize: 10, letterSpacing: '0.1em', background: 'transparent', color: '#f87171', border: '1.5px solid #f87171', borderRadius: 3, cursor: 'pointer' }}>
                    CANCEL WARRANT
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </SectionPanel>
  )
}
