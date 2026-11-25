import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { SectionPanel } from '../../../components/SectionPanel'
import { DetailRow } from '../../../components/DetailRow'
import { StatusBadge } from '../../../components/StatusBadge'
import { ArrestWarrant } from '../../../types/case.types'
import { caseApi } from '../../../api/caseApi'
import { fmtDateTime } from '../../../utils/date'

import { C, A, FONT, FIELD_BORDER } from '../../../theme'
const inp: React.CSSProperties = { padding: '10px 12px', background: '#fff', color: C.ashes, border: `1.5px solid ${FIELD_BORDER}`, borderRadius: 6, fontFamily: FONT.ui, fontSize: 14, width: '100%', boxSizing: 'border-box', outline: 'none' }
const lbl: React.CSSProperties = { display: 'block', fontFamily: FONT.ui, fontSize: 13, fontWeight: 600, color: C.ashes, marginBottom: 6 }

interface Props { firId: string; warrants: ArrestWarrant[]; readOnly?: boolean }

export function WarrantPanel({ firId, warrants, readOnly }: Props) {
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
      <div><label style={lbl}>Accused Description <span style={{ color: C.charcoal, fontWeight: 400 }}>(optional)</span></label><input value={f.accusedDescription} onChange={set('accusedDescription')} style={inp} placeholder="Physical description, alias…" /></div>
      <div><label style={lbl}>Reason for Warrant</label><textarea rows={3} value={f.reason} onChange={set('reason')} style={{ ...inp, resize: 'vertical' }} /></div>
      <button onClick={() => request.mutate()} disabled={!canRequest}
        style={{ padding: '10px 20px', fontFamily: FONT.ui, fontSize: 14, fontWeight: 600, background: canRequest ? A.accent : '#9DB2CC', color: '#fff', border: 'none', borderRadius: 8, cursor: canRequest ? 'pointer' : 'not-allowed', alignSelf: 'flex-start' }}>
        {request.isPending ? 'REQUESTING…' : 'REQUEST WARRANT'}
      </button>
    </div>
  )

  return (
    <SectionPanel title="Arrest Warrants" addLabel={readOnly ? undefined : 'Request Warrant'} addForm={addForm}>
      {warrants.length === 0 ? (
        <p style={{ fontFamily: FONT.ui, color: C.charcoal, fontSize: 14 }}>No warrants issued for this FIR.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {warrants.map((w) => (
            <div key={w.id} style={{ padding: '12px 14px', background: C.angst, borderRadius: 8, border: `1px solid ${C.bark}` }}>
              <DetailRow label="Accused" value={w.accusedName} />
              {w.accusedDescription && <DetailRow label="Description" value={w.accusedDescription} />}
              <DetailRow label="Reason" value={w.reason} />
              <DetailRow label="Status" value={<StatusBadge status={w.status} size="sm" />} />
              <DetailRow label="Requested At" value={fmtDateTime(w.requestedAt)} />
              {w.decidedAt && <DetailRow label="Decided At" value={fmtDateTime(w.decidedAt)} />}
              {w.decisionNotes && <DetailRow label="Notes" value={w.decisionNotes} />}
              {(w.status === 'ISSUED' || w.status === 'PENDING') && !readOnly && (
                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  {w.status === 'ISSUED' && (
                    <button onClick={() => execute.mutate(w.id)} disabled={execute.isPending}
                      style={{ padding: '6px 14px', fontFamily: FONT.ui, fontSize: 12, fontWeight: 600, background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
                      Mark executed
                    </button>
                  )}
                  <button onClick={() => { if (window.confirm('Cancel this warrant?')) cancel.mutate(w.id) }} disabled={cancel.isPending}
                    style={{ padding: '6px 14px', fontFamily: FONT.ui, fontSize: 12, fontWeight: 600, background: '#fff', color: '#B91C1C', border: '1px solid #B91C1C66', borderRadius: 6, cursor: 'pointer' }}>
                    Cancel warrant
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
