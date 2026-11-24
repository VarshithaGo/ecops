import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { SectionPanel } from '../../../components/SectionPanel'
import { DetailRow } from '../../../components/DetailRow'
import { OfficerChip } from '../../../components/OfficerChip'
import { MahajarReport } from '../../../types/case.types'
import { caseApi } from '../../../api/caseApi'

import { C } from '../../../theme'
const inp: React.CSSProperties = { padding: '10px 14px', background: C.bark, color: C.ashes, border: `2px solid ${C.charcoal}`, borderRadius: 3, fontFamily: "'Space Grotesk', system-ui, sans-serif", fontSize: 13, width: '100%', boxSizing: 'border-box', outline: 'none', colorScheme: 'dark' }
const lbl: React.CSSProperties = { display: 'block', fontFamily: "'Space Grotesk', system-ui, sans-serif", fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.charcoal, marginBottom: 6 }
const btn = (enabled: boolean): React.CSSProperties => ({ padding: '9px 20px', fontFamily: 'Anton, Impact, sans-serif', fontSize: 11, letterSpacing: '0.12em', background: 'transparent', color: enabled ? C.ashes : C.charcoal, border: `2px solid ${enabled ? C.charcoal : C.bark}`, borderRadius: 3, cursor: enabled ? 'pointer' : 'not-allowed', alignSelf: 'flex-start' })

interface Props { firId: string; reports: MahajarReport[] }

export function MahajarPanel({ firId, reports }: Props) {
  const qc = useQueryClient()
  const [f, setF] = useState({ visitDate: '', locationDescription: '', witnessNames: '', observations: '' })
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF((p) => ({ ...p, [k]: e.target.value }))

  const record = useMutation({
    mutationFn: () => caseApi.recordMahajar(firId, f),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['fir-mahajar', firId] }); setF({ visitDate: '', locationDescription: '', witnessNames: '', observations: '' }) },
  })

  const addForm = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div><label style={lbl}>Date of Visit</label><input type="date" value={f.visitDate} onChange={set('visitDate')} style={inp} /></div>
      <div><label style={lbl}>Location Description</label><textarea rows={2} value={f.locationDescription} onChange={set('locationDescription')} style={{ ...inp, resize: 'vertical' }} /></div>
      <div><label style={lbl}>Witness Names <span style={{ opacity: 0.6 }}>(optional)</span></label><input value={f.witnessNames} onChange={set('witnessNames')} style={inp} placeholder="Comma-separated names" /></div>
      <div><label style={lbl}>Observations</label><textarea rows={3} value={f.observations} onChange={set('observations')} style={{ ...inp, resize: 'vertical' }} /></div>
      <button onClick={() => record.mutate()} disabled={!f.visitDate || !f.locationDescription || !f.observations || record.isPending} style={btn(!(!f.visitDate || !f.locationDescription || !f.observations || record.isPending))}>
        {record.isPending ? 'SAVING…' : 'SAVE MAHAZAR'}
      </button>
      <style>{`input::placeholder, textarea::placeholder { color: ${C.charcoal}; opacity: 0.6; }`}</style>
    </div>
  )

  return (
    <SectionPanel title="Mahazar (Scene Inspection)" addLabel="Record Mahazar" addForm={addForm}>
      {reports.length === 0 ? (
        <p style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", color: C.charcoal, fontSize: 13 }}>No scene inspections recorded.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {reports.map((r) => (
            <div key={r.id} style={{ padding: '10px 14px', background: `${C.angst}66`, borderRadius: 3, border: `1px solid ${C.bark}` }}>
              <DetailRow label="Visit Date" value={r.visitDate} />
              <DetailRow label="Location" value={r.locationDescription} />
              {r.witnessNames && <DetailRow label="Witnesses" value={r.witnessNames} />}
              <DetailRow label="Observations" value={r.observations} />
              <DetailRow label="Investigating Officer" value={<OfficerChip keycloakUserId={r.ioOfficerId} />} />
            </div>
          ))}
        </div>
      )}
    </SectionPanel>
  )
}
