import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { SectionPanel } from '../../../components/SectionPanel'
import { DetailRow } from '../../../components/DetailRow'
import { OfficerChip } from '../../../components/OfficerChip'
import { MahajarReport } from '../../../types/case.types'
import { caseApi } from '../../../api/caseApi'

import { C, A, FONT, FIELD_BORDER } from '../../../theme'
const inp: React.CSSProperties = { padding: '10px 12px', background: '#fff', color: C.ashes, border: `1.5px solid ${FIELD_BORDER}`, borderRadius: 6, fontFamily: FONT.ui, fontSize: 14, width: '100%', boxSizing: 'border-box', outline: 'none' }
const lbl: React.CSSProperties = { display: 'block', fontFamily: FONT.ui, fontSize: 13, fontWeight: 600, color: C.ashes, marginBottom: 6 }
const btn = (enabled: boolean): React.CSSProperties => ({ padding: '10px 20px', fontFamily: FONT.ui, fontSize: 14, fontWeight: 600, background: enabled ? A.accent : '#9DB2CC', color: '#fff', border: 'none', borderRadius: 8, cursor: enabled ? 'pointer' : 'not-allowed', alignSelf: 'flex-start' })

interface Props { firId: string; reports: MahajarReport[] }

export function MahajarPanel({ firId, reports }: Props) {
  const qc = useQueryClient()
  const [f, setF] = useState({ visitDate: '', locationDescription: '', witnessNames: '', witnessStatement: '', observations: '' })
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF((p) => ({ ...p, [k]: e.target.value }))

  const record = useMutation({
    mutationFn: () => caseApi.recordMahajar(firId, f),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['fir-mahajar', firId] }); setF({ visitDate: '', locationDescription: '', witnessNames: '', witnessStatement: '', observations: '' }) },
  })

  const addForm = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div><label style={lbl}>Date of Visit</label><input type="date" value={f.visitDate} onChange={set('visitDate')} style={inp} /></div>
      <div><label style={lbl}>Location Description</label><textarea rows={2} value={f.locationDescription} onChange={set('locationDescription')} style={{ ...inp, resize: 'vertical' }} /></div>
      <div><label style={lbl}>Witness Names <span style={{ color: C.charcoal, fontWeight: 400 }}>(optional)</span></label><input value={f.witnessNames} onChange={set('witnessNames')} style={inp} placeholder="Comma-separated names" /></div>
      <div><label style={lbl}>Witness Statement <span style={{ color: C.charcoal, fontWeight: 400 }}>(optional)</span></label><textarea rows={3} value={f.witnessStatement} onChange={set('witnessStatement')} style={{ ...inp, resize: 'vertical' }} placeholder="What the witness(es) stated at the scene…" /></div>
      <div><label style={lbl}>Observations</label><textarea rows={3} value={f.observations} onChange={set('observations')} style={{ ...inp, resize: 'vertical' }} /></div>
      <button onClick={() => record.mutate()} disabled={!f.visitDate || !f.locationDescription || !f.observations || record.isPending} style={btn(!(!f.visitDate || !f.locationDescription || !f.observations || record.isPending))}>
        {record.isPending ? 'SAVING…' : 'SAVE MAHAZAR'}
      </button>
    </div>
  )

  return (
    <SectionPanel title="Mahazar (Scene Inspection)" addLabel="Record Mahazar" addForm={addForm}>
      {reports.length === 0 ? (
        <p style={{ fontFamily: FONT.ui, color: C.charcoal, fontSize: 14 }}>No scene inspections recorded.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {reports.map((r) => (
            <div key={r.id} style={{ padding: '12px 14px', background: C.angst, borderRadius: 8, border: `1px solid ${C.bark}` }}>
              <DetailRow label="Visit Date" value={r.visitDate} />
              <DetailRow label="Location" value={r.locationDescription} />
              {r.witnessNames && <DetailRow label="Witnesses" value={r.witnessNames} />}
              {r.witnessStatement && <DetailRow label="Witness Statement" value={r.witnessStatement} />}
              <DetailRow label="Observations" value={r.observations} />
              <DetailRow label="Investigating Officer" value={<OfficerChip keycloakUserId={r.ioOfficerId} />} />
            </div>
          ))}
        </div>
      )}
    </SectionPanel>
  )
}
