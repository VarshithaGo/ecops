import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { SectionPanel } from '../../../components/SectionPanel'
import { DetailRow } from '../../../components/DetailRow'
import { ChargeSheet, FinalReport } from '../../../types/case.types'
import { caseApi } from '../../../api/caseApi'
import { useCourtDisposal } from '../../../hooks/useFIRData'
import { C, A, FONT, FIELD_BORDER } from '../../../theme'

const inp: React.CSSProperties = { padding: '10px 12px', background: '#fff', color: C.ashes, border: `1.5px solid ${FIELD_BORDER}`, borderRadius: 6, fontFamily: FONT.ui, fontSize: 14, width: '100%', boxSizing: 'border-box', outline: 'none' }
const lbl: React.CSSProperties = { display: 'block', fontFamily: FONT.ui, fontSize: 13, fontWeight: 600, color: C.ashes, marginBottom: 6 }
const btnPrimary: React.CSSProperties = { padding: '10px 20px', fontFamily: FONT.ui, fontSize: 14, fontWeight: 600, background: A.accent, color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', alignSelf: 'flex-start' }

// Final Report (closure) types. NOTE: standard police convention is
// A = true-but-untraced, B = false, C = mistake/insufficient. Labels below follow
// the project's stated mapping (A = charge sheet, B = false, C = untraced).
const REPORT_TYPES = [
  { value: 'A', label: 'A — Charge sheet (accused found, charges filed)' },
  { value: 'B', label: 'B — False case' },
  { value: 'C', label: 'C — Untraced case (accused not found)' },
]

const VERDICT_COLOR: Record<string, string> = { CONVICTED: '#B91C1C', ACQUITTED: '#15803D', DISCHARGED: '#B45309' }

type FormMode = 'charge-sheet' | 'final-report'
interface Props { firId: string; chargeSheet: ChargeSheet | null; finalReport: FinalReport | null }

export function FinalReportPanel({ firId, chargeSheet, finalReport }: Props) {
  const qc = useQueryClient()
  const [mode, setMode] = useState<FormMode>('charge-sheet')
  const [cs, setCs] = useState({ courtName: '', submissionDate: '', accusedDetails: '', evidenceSummary: '', witnessList: '', sectionsInvoked: '' })
  const [fr, setFr] = useState({ reportType: 'A', courtName: '', submissionDate: '', remarks: '' })
  const setFrField = (k: keyof typeof fr) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setFr((p) => ({ ...p, [k]: e.target.value }))
  const setCsField = (k: keyof typeof cs) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setCs((p) => ({ ...p, [k]: e.target.value }))

  const { data: disposal = null } = useCourtDisposal(firId)

  const fileCs = useMutation({
    mutationFn: () => caseApi.fileChargeSheet(firId, { ...cs, evidenceSummary: cs.evidenceSummary || null, witnessList: cs.witnessList || null }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['fir-chargesheet', firId] }); qc.invalidateQueries({ queryKey: ['fir', firId] }) },
  })
  const fileFr = useMutation({
    mutationFn: () => caseApi.fileFinalReport(firId, fr),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['fir-finalreport', firId] }); qc.invalidateQueries({ queryKey: ['fir', firId] }) },
  })
  const verdict = useMutation({
    mutationFn: () => caseApi.requestCourtVerdict(firId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['fir-disposal', firId] })
      qc.invalidateQueries({ queryKey: ['fir', firId] })
      qc.invalidateQueries({ queryKey: ['fir-criminals', firId] })
    },
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

        {/* Court verdict — decided by the court, not the station */}
        <div style={{ marginTop: 18, paddingTop: 16, borderTop: `1px solid ${C.bark}`, fontFamily: FONT.ui }}>
          {disposal ? (
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.charcoal, marginBottom: 6 }}>Court verdict</div>
              <div style={{ display: 'inline-block', padding: '6px 14px', borderRadius: 8, fontSize: 15, fontWeight: 700, color: VERDICT_COLOR[disposal.outcome] ?? C.ashes, border: `1.5px solid ${VERDICT_COLOR[disposal.outcome] ?? C.charcoal}` }}>
                {disposal.outcome}
              </div>
              <div style={{ fontSize: 13, color: C.charcoal, marginTop: 8 }}>
                {disposal.judgeName} · {disposal.courtName}{disposal.judgmentDate ? ` · ${disposal.judgmentDate}` : ''}
              </div>
              {disposal.outcome === 'CONVICTED'
                ? <div style={{ fontSize: 13, color: '#B91C1C', marginTop: 6 }}>Accused found guilty — criminal records updated to CONVICTED.</div>
                : <div style={{ fontSize: 13, color: '#15803D', marginTop: 6 }}>Accused not convicted — released; they remain non-criminals.</div>}
            </div>
          ) : (
            <div>
              <div style={{ fontSize: 13, color: C.charcoal, marginBottom: 10, lineHeight: 1.5 }}>
                The case has been filed in court. The <strong>verdict is the court's decision</strong>, not the station's — request it below.
              </div>
              {verdict.isError && <div style={{ background: '#FEF3F2', border: '1px solid #FECDCA', color: '#B91C1C', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 10 }}>Could not get the verdict. Try again.</div>}
              <button onClick={() => verdict.mutate()} disabled={verdict.isPending} style={{ ...btnPrimary, background: verdict.isPending ? '#9DB2CC' : A.accent }}>
                {verdict.isPending ? 'Awaiting court…' : 'Request court verdict'}
              </button>
            </div>
          )}
        </div>
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

  const toggle = (m: FormMode, label: string) => (
    <button key={m} onClick={() => setMode(m)}
      style={{ padding: '8px 16px', fontFamily: FONT.ui, fontSize: 13, fontWeight: 600, background: mode === m ? A.accentSoft : '#fff', color: mode === m ? A.accent : C.charcoal, border: `1px solid ${mode === m ? A.accent : C.bark}`, borderRadius: 8, cursor: 'pointer' }}>
      {label}
    </button>
  )

  const addForm = (
    <div style={{ fontFamily: FONT.ui }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {toggle('charge-sheet', 'Charge Sheet')}
        {toggle('final-report', 'Final Report (A/B/C)')}
      </div>

      {mode === 'charge-sheet' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 2 }}><label style={lbl}>Court name</label><input value={cs.courtName} onChange={setCsField('courtName')} style={inp} /></div>
            <div style={{ flex: 1 }}><label style={lbl}>Submission date</label><input type="date" value={cs.submissionDate} onChange={setCsField('submissionDate')} style={inp} /></div>
          </div>
          <div><label style={lbl}>Sections invoked (BNS/IPC)</label><input value={cs.sectionsInvoked} onChange={setCsField('sectionsInvoked')} style={inp} placeholder="e.g. BNS 303(2), 305" /></div>
          <div><label style={lbl}>Offence brief / accused details</label><textarea rows={3} value={cs.accusedDetails} onChange={setCsField('accusedDetails')} style={{ ...inp, resize: 'vertical' }} placeholder="Detailed brief of the offence and the accused" /></div>
          <div><label style={lbl}>Evidence summary <span style={{ color: C.charcoal, fontWeight: 400 }}>(optional)</span></label><textarea rows={2} value={cs.evidenceSummary} onChange={setCsField('evidenceSummary')} style={{ ...inp, resize: 'vertical' }} /></div>
          <div><label style={lbl}>Witness list <span style={{ color: C.charcoal, fontWeight: 400 }}>(optional)</span></label><input value={cs.witnessList} onChange={setCsField('witnessList')} style={inp} /></div>
          <button onClick={() => fileCs.mutate()} disabled={!cs.courtName || !cs.submissionDate || !cs.accusedDetails || !cs.sectionsInvoked || fileCs.isPending} style={{ ...btnPrimary, background: (!cs.courtName || !cs.submissionDate || !cs.accusedDetails || !cs.sectionsInvoked) ? '#9DB2CC' : A.accent }}>
            {fileCs.isPending ? 'Filing…' : 'File charge sheet'}
          </button>
        </div>
      )}

      {mode === 'final-report' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={lbl}>Report type</label>
            <select value={fr.reportType} onChange={setFrField('reportType')} style={inp}>
              {REPORT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 2 }}><label style={lbl}>Court name</label><input value={fr.courtName} onChange={setFrField('courtName')} style={inp} /></div>
            <div style={{ flex: 1 }}><label style={lbl}>Submission date</label><input type="date" value={fr.submissionDate} onChange={setFrField('submissionDate')} style={inp} /></div>
          </div>
          <div><label style={lbl}>Remarks</label><textarea rows={3} value={fr.remarks} onChange={setFrField('remarks')} style={{ ...inp, resize: 'vertical' }} /></div>
          <button onClick={() => fileFr.mutate()} disabled={!fr.courtName || !fr.submissionDate || !fr.remarks || fileFr.isPending} style={{ ...btnPrimary, background: (!fr.courtName || !fr.submissionDate || !fr.remarks) ? '#9DB2CC' : A.accent }}>
            {fileFr.isPending ? 'Filing…' : 'File final report'}
          </button>
        </div>
      )}
    </div>
  )

  return (
    <SectionPanel title="Final Disposition" addLabel="File Report" addForm={addForm} defaultOpen={false}>
      <p style={{ fontFamily: FONT.ui, color: C.charcoal, fontSize: 14 }}>
        No final disposition filed. File a Charge Sheet (case goes to court) or a Final Report (A/B/C).
      </p>
    </SectionPanel>
  )
}
