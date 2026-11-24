import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { SectionPanel } from '../../../components/SectionPanel'
import { DetailRow } from '../../../components/DetailRow'
import { StatusBadge } from '../../../components/StatusBadge'
import { PropertySeizure } from '../../../types/case.types'
import { caseApi } from '../../../api/caseApi'

import { C } from '../../../theme'
const inp: React.CSSProperties = { padding: '10px 14px', background: C.bark, color: C.ashes, border: `2px solid ${C.charcoal}`, borderRadius: 3, fontFamily: "'Space Grotesk', system-ui, sans-serif", fontSize: 13, width: '100%', boxSizing: 'border-box', outline: 'none', colorScheme: 'dark' }
const lbl: React.CSSProperties = { display: 'block', fontFamily: "'Space Grotesk', system-ui, sans-serif", fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.charcoal, marginBottom: 6 }

const STATUSES = ['IN_CUSTODY', 'RETURNED', 'COURT_PRODUCED', 'DISPOSED']

interface Props { firId: string; seizures: PropertySeizure[] }

export function PropertyPanel({ firId, seizures }: Props) {
  const qc = useQueryClient()
  const [f, setF] = useState({ propertyDescription: '', quantity: '1', seizureDate: '', storageLocation: '' })
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF((p) => ({ ...p, [k]: e.target.value }))

  const add = useMutation({
    mutationFn: () => caseApi.recordSeizure(firId, { ...f, quantity: Number(f.quantity), storageLocation: f.storageLocation || null }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['fir-property', firId] }); setF({ propertyDescription: '', quantity: '1', seizureDate: '', storageLocation: '' }) },
  })

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => caseApi.updatePropertyStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['fir-property', firId] }),
  })

  const canAdd = f.propertyDescription && f.seizureDate && !add.isPending

  const addForm = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div><label style={lbl}>Property Description</label><textarea rows={2} value={f.propertyDescription} onChange={set('propertyDescription')} style={{ ...inp, resize: 'vertical' }} /></div>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <label style={lbl}>Quantity</label>
          <input type="number" min={1} value={f.quantity} onChange={set('quantity')} style={inp} />
        </div>
        <div style={{ flex: 2 }}>
          <label style={lbl}>Seizure Date</label>
          <input type="date" value={f.seizureDate} onChange={set('seizureDate')} style={inp} />
        </div>
      </div>
      <div><label style={lbl}>Storage Location <span style={{ opacity: 0.6 }}>(optional)</span></label><input value={f.storageLocation} onChange={set('storageLocation')} style={inp} /></div>
      <button onClick={() => add.mutate()} disabled={!canAdd}
        style={{ padding: '9px 20px', fontFamily: 'Anton, Impact, sans-serif', fontSize: 11, letterSpacing: '0.12em', background: 'transparent', color: canAdd ? C.ashes : C.charcoal, border: `2px solid ${canAdd ? C.charcoal : C.bark}`, borderRadius: 3, cursor: canAdd ? 'pointer' : 'not-allowed', alignSelf: 'flex-start' }}>
        {add.isPending ? 'SAVING…' : 'RECORD SEIZURE'}
      </button>
      <style>{`input::placeholder, textarea::placeholder { color: ${C.charcoal}; opacity: 0.6; }`}</style>
    </div>
  )

  return (
    <SectionPanel title="Property Seizures" addLabel="Record Seizure" addForm={addForm}>
      {seizures.length === 0 ? (
        <p style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", color: C.charcoal, fontSize: 13 }}>No property seizures recorded.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {seizures.map((ps) => (
            <div key={ps.id} style={{ padding: '10px 14px', background: `${C.angst}66`, borderRadius: 3, border: `1px solid ${C.bark}` }}>
              <DetailRow label="Description" value={ps.propertyDescription} />
              <DetailRow label="Quantity" value={ps.quantity} />
              <DetailRow label="Seizure Date" value={ps.seizureDate} />
              {ps.storageLocation && <DetailRow label="Storage Location" value={ps.storageLocation} />}
              <DetailRow label="Status" value={<StatusBadge status={ps.status} size="sm" />} />
              <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {STATUSES.filter((s) => s !== ps.status).map((s) => (
                  <button key={s} onClick={() => updateStatus.mutate({ id: ps.id, status: s })} disabled={updateStatus.isPending}
                    style={{ padding: '4px 12px', fontFamily: 'Anton, Impact, sans-serif', fontSize: 10, letterSpacing: '0.1em', background: 'transparent', color: C.charcoal, border: `1.5px solid ${C.bark}`, borderRadius: 3, cursor: 'pointer' }}>
                    → {s.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </SectionPanel>
  )
}
