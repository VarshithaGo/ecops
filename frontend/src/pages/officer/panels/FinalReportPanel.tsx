import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { SectionPanel } from '../../../components/SectionPanel'
import { DetailRow } from '../../../components/DetailRow'
import { ChargeSheet, FinalReport } from '../../../types/case.types'
import { caseApi } from '../../../api/caseApi'

import { C } from '../../../theme'
const inp: React.CSSProperties = { padding: '10px 14px', background: C.bark, color: C.ashes, border: `2px solid ${C.charcoal}`, borderRadius: 3, fontFamily: "'Space Grotesk', system-ui, sans-serif", fontSize: 13, width: '100%', boxSizing: 'border-box', outline: 'none', colorScheme: 'dark' }
const lbl: React.CSSProperties = { display: 'block', fontFamily: "'Space Grotesk', system-ui, sans-serif", fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.charcoal, marginBottom: 6 }

const REPORT_TYPES = [
  { value: 'A', label: 'A — Untraced (accused not found)' },
  { value: 'B', label: 'B — False complaint' },
  { value: 'C', label: 'C — Lack of evidence' },
]

type FormMode = 'charge-sheet' | 'final-report'

interface Props { firId: string; chargeSheet: ChargeSheet | null; finalReport: FinalReport | null }

export function FinalReportPanel({ firId, chargeSheet, finalReport }: Props) {
  const qc = useQueryClient()
  const [mode, setMode] = useState<FormMode>('charge-sheet')
  const [cs, setCs] = useState({ courtName: '', submissionDate: '', accusedDetails: '', evidenceSummary: '', witnessList: '', sectionsInvoked: '' })
  const [fr, setFr] = useState({ reportType: 'A', courtName: '', submissionDate: '', remarks: '' })
  const setFrField = (k: keyof typeof fr) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setFr((p) => ({ ...p, [k]: e.target.value }))
  const setCsField = (k: keyof typeof cs) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setCs((p) => ({ ...p, [k]: e.target.value }))

  const fileCs = useMutation({
    mutationFn: () => caseApi.fileChargeSheet(firId, { ...cs, evidenceSummary: cs.evidenceSummary || null, witnessList: cs.witnessList || null }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['fir-chargesheet', firId] }); qc.invalidateQueries({ queryKey: ['fir', firId] }) },
  })
  const fileFr = useMutation({
    mutationFn: () => caseApi.fileFinalReport(firId, fr),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['fir-finalreport', firId] }); qc.invalidateQueries({ queryKey: ['fir', firId] }) },
  })

  if (chargeSheet) {
    return (
      <SectionPanel title="Final Disposition — Charge Sheet Filed" defaultOpen>
        <DetailRow label="Court" value={chargeSheet.courtName} />
        <DetailRow label="Submission Date" value={chargeSheet.submissionDate} />
        <DetailRow label="Sections Invoked" value={chargeSheet.sectionsInvoked} mono />
        <DetailRow label="Accused Details" value={chargeSheet.accusedDetails} />
        {chargeSheet.evidenceSummary && <DetailRow label="Evidence Summary" value={chargeSheet.evidenceSummary} />}
        {chargeSheet.witnessList && <DetailRow label="Witness List" value={chargeSheet.witnessList} />}
      </SectionPanel>
    )
  }

  if (finalReport) {
    const typeDesc = REPORT_TYPES.find((t) => t.value === finalReport.reportType)?.label ?? finalReport.reportType
    return (
      <SectionPanel title="Final Disposition — Final Report Filed" defaultOpen>
        <DetailRow label="Report Type" value={typeDesc} />
        <DetailRow label="Court" value={finalReport.courtName} />
        <DetailRow label="Submission Date" value={finalReport.submissionDate} />
        <DetailRow label="Remarks" value={finalReport.remarks} />
      </SectionPanel>
    )
  }

  const addForm = (
    <div>
      {/* Mode toggle */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {(['charge-sheet', 'final-report'] as FormMode[]).map((m) => (
          <button key={m} onClick={() => setMode(m)}
            style={{ padding: '7px 16px', fontFamily: 'Anton, Impact, sans-serif', fontSize: 11, letterSpacing: '0.1em', background: 'transparent', color: mode === m ? C.ashes : C.charcoal, border: `2px solid ${mode === m ? C.charcoal : C.bark}`, borderRadius: 3, cursor: 'pointer' }}>
            {m === 'charge-sheet' ? 'CHARGE SHEET' : 'FINAL REPORT (A/B/C)'}
          </button>
        ))}
      </div>

      {mode === 'charge-sheet' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 2 }}><label style={lbl}>Court Name</label><input value={cs.courtName} onChange={setCsField('courtName')} style={inp} /></div>
            <div style={{ flex: 1 }}><label style={lbl}>Submission Date</label><input type="date" value={cs.submissionDate} onChange={setCsField('submissionDate')} style={inp} /></div>
          </div>
          <div><label style={lbl}>Sections Invoked (IPC/BNSS)</label><input value={cs.sectionsInvoked} onChange={setCsField('sectionsInvoked')} style={inp} placeholder="e.g. 302, 307 IPC" /></div>
          <div><label style={lbl}>Accused Details</label><textarea rows={2} value={cs.accusedDetails} onChange={setCsField('accusedDetails')} style={{ ...inp, resize: 'vertical' }} /></div>
          <div><label style={lbl}>Evidence Summary <span style={{ opacity: 0.6 }}>(optional)</span></label><textarea rows={2} value={cs.evidenceSummary} onChange={setCsField('evidenceSummary')} style={{ ...inp, resize: 'vertical' }} /></div>
          <div><label style={lbl}>Witness List <span style={{ opacity: 0.6 }}>(optional)</span></label><input value={cs.witnessList} onChange={setCsField('witnessList')} style={inp} /></div>
          <button onClick={() => fileCs.mutate()} disabled={!cs.courtName || !cs.submissionDate || !cs.accusedDetails || !cs.sectionsInvoked || fileCs.isPending}
            style={{ padding: '9px 20px', fontFamily: 'Anton, Impact, sans-serif', fontSize: 11, letterSpacing: '0.12em', background: 'transparent', color: C.ashes, border: `2px solid ${C.charcoal}`, borderRadius: 3, cursor: 'pointer', alignSelf: 'flex-start' }}>
            {fileCs.isPending ? 'FILING…' : 'FILE CHARGE SHEET'}
          </button>
        </div>
      )}

      {mode === 'final-report' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={lbl}>Report Type</label>
            <select value={fr.reportType} onChange={setFrField('reportType')} style={inp}>
              {REPORT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 2 }}><label style={lbl}>Court Name</label><input value={fr.courtName} onChange={setFrField('courtName')} style={inp} /></div>
            <div style={{ flex: 1 }}><label style={lbl}>Submission Date</label><input type="date" value={fr.submissionDate} onChange={setFrField('submissionDate')} style={inp} /></div>
          </div>
          <div><label style={lbl}>Remarks</label><textarea rows={3} value={fr.remarks} onChange={setFrField('remarks')} style={{ ...inp, resize: 'vertical' }} /></div>
          <button onClick={() => fileFr.mutate()} disabled={!fr.courtName || !fr.submissionDate || !fr.remarks || fileFr.isPending}
            style={{ padding: '9px 20px', fontFamily: 'Anton, Impact, sans-serif', fontSize: 11, letterSpacing: '0.12em', background: 'transparent', color: '#f87171', border: '2px solid #f87171', borderRadius: 3, cursor: 'pointer', alignSelf: 'flex-start' }}>
            {fileFr.isPending ? 'FILING…' : 'FILE FINAL REPORT'}
          </button>
        </div>
      )}
      <style>{`input::placeholder, textarea::placeholder { color: ${C.charcoal}; opacity: 0.6; } select option { background: ${C.bark}; color: ${C.ashes}; }`}</style>
    </div>
  )

  return (
    <SectionPanel title="Final Disposition" addLabel="File Report" addForm={addForm} defaultOpen={false}>
      <p style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", color: C.charcoal, fontSize: 13 }}>
        No final disposition filed. File a Charge Sheet or Final Report (A/B/C).
      </p>
    </SectionPanel>
  )
}
