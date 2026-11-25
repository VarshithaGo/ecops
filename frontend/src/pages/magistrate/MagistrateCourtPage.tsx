import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { caseApi } from '../../api/caseApi'
import { Fir, CourtDisposal } from '../../types/case.types'
import { CriminalRecord } from '../../types/criminal.types'
import { Station } from '../../types/admin.types'
import { stationsApi } from '../../api/stationsApi'
import { StatusBadge } from '../../components/StatusBadge'
import { apiError } from '../../utils/apiError'
import { C, A, FONT, FIELD_BORDER } from '../../theme'

const lbl: React.CSSProperties = { fontFamily: FONT.ui, fontSize: 12, fontWeight: 600, color: C.charcoal, marginBottom: 2 }
const val: React.CSSProperties = { fontFamily: FONT.ui, fontSize: 14, color: C.ashes, lineHeight: 1.6 }
const card: React.CSSProperties = { background: '#fff', border: `1px solid ${C.bark}`, borderRadius: 10, padding: '20px 22px', boxShadow: '0 1px 3px rgba(16,32,44,0.06)' }
const input: React.CSSProperties = { padding: '10px 12px', background: '#fff', color: C.ashes, border: `1.5px solid ${FIELD_BORDER}`, borderRadius: 6, fontFamily: FONT.ui, fontSize: 14, width: '100%', boxSizing: 'border-box', outline: 'none' }

const VERDICTS = [
  { val: 'CONVICTED',  label: 'Convicted (guilty)',   desc: 'Accused found guilty — record becomes CONVICTED; a sentence is passed.' },
  { val: 'ACQUITTED',  label: 'Acquitted',            desc: 'Accused not guilty — released.' },
  { val: 'DISCHARGED', label: 'Discharged',           desc: 'Insufficient grounds to proceed — released.' },
]

export function MagistrateCourtPage() {
  const { data: firs = [], isLoading } = useQuery<Fir[]>({ queryKey: ['firs'], queryFn: caseApi.listFirs })
  const { data: stations = [] } = useQuery<Station[]>({ queryKey: ['stations'], queryFn: stationsApi.list })
  const stationMap = Object.fromEntries(stations.map((s) => [s.id, s.stationCode]))

  const pending = firs.filter((f) => f.status === 'CHARGE_SHEET_FILED')
  const decided = firs.filter((f) => f.status === 'COURT_DISPOSED')

  if (isLoading) return <div style={{ padding: 32, fontFamily: FONT.ui, color: C.charcoal }}>Loading court cases…</div>

  return (
    <div style={{ padding: '32px 24px', maxWidth: 920, margin: '0 auto', fontFamily: FONT.ui }}>
      <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.01em', color: C.ashes, margin: 0 }}>Court — Verdicts & Bail</h2>
      <p style={{ color: C.charcoal, fontSize: 14, margin: '6px 0 24px' }}>
        Charge-sheeted cases before the court. Grant bail to an arrested accused, or pronounce the verdict — the accused's record
        is updated to CONVICTED (guilty) or RELEASED (acquitted / discharged).
      </p>

      {pending.length === 0 && (
        <div style={{ ...card, color: C.charcoal, textAlign: 'center', padding: 32 }}>No cases awaiting a verdict.</div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {pending.map((f) => <CaseCard key={f.id} fir={f} stationCode={stationMap[f.stationId] ?? f.stationCode} />)}
      </div>

      {decided.length > 0 && (
        <>
          <div style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.charcoal, margin: '32px 0 12px' }}>
            Recently decided
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {decided.map((f) => <DecidedRow key={f.id} fir={f} stationCode={stationMap[f.stationId] ?? f.stationCode} />)}
          </div>
        </>
      )}
    </div>
  )
}

function CaseCard({ fir, stationCode }: { fir: Fir; stationCode: string }) {
  const qc = useQueryClient()
  const { data: accused = [] } = useQuery<CriminalRecord[]>({
    queryKey: ['fir-criminals', fir.id], queryFn: () => caseApi.getFirCriminals(fir.id),
  })
  const [modal, setModal] = useState(false)
  const [outcome, setOutcome] = useState('CONVICTED')
  const [judge, setJudge] = useState('')
  const [sentence, setSentence] = useState('')

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['firs'] })
    qc.invalidateQueries({ queryKey: ['fir-criminals', fir.id] })
    qc.invalidateQueries({ queryKey: ['fir-disposal', fir.id] })
    qc.invalidateQueries({ queryKey: ['fir', fir.id] })
  }

  const bail = useMutation({
    mutationFn: () => caseApi.grantBail(fir.id),
    onSuccess: invalidate,
  })
  const verdict = useMutation({
    mutationFn: () => caseApi.recordCourtVerdict(fir.id, { outcome, judgeName: judge || undefined, sentence: sentence || undefined }),
    onSuccess: () => { invalidate(); setModal(false) },
  })

  const anyArrested = accused.some((a) => a.status === 'ARRESTED')

  return (
    <div style={card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
        <div>
          <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 16, color: C.ashes }}>{fir.firNumber}</span>
          <span style={{ color: C.charcoal, fontSize: 13 }}> · {stationCode}</span>
        </div>
        <StatusBadge status={fir.status} size="sm" />
      </div>
      <div style={{ marginBottom: 10 }}><div style={lbl}>BNS / IPC sections</div><div style={{ ...val, fontFamily: 'monospace' }}>{fir.ipcSections}</div></div>
      <div style={{ marginBottom: 12 }}><div style={lbl}>Narrative</div><div style={val}>{fir.narrative}</div></div>

      <div style={{ marginBottom: 14 }}>
        <div style={lbl}>Accused</div>
        {accused.length === 0 ? (
          <div style={{ ...val, color: C.charcoal }}>No accused on record.</div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
            {accused.map((a) => (
              <span key={a.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 10px', border: `1px solid ${C.bark}`, borderRadius: 8, background: C.angst }}>
                <span style={{ fontSize: 13, color: C.ashes, fontWeight: 600 }}>{a.fullName}</span>
                <StatusBadge status={a.status} size="sm" />
              </span>
            ))}
          </div>
        )}
      </div>

      {(bail.isError || verdict.isError) && (
        <div style={{ background: '#FEF3F2', border: '1px solid #FECDCA', color: '#B91C1C', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 12 }}>
          {apiError(bail.error || verdict.error, 'Action failed.')}
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <button onClick={() => setModal(true)}
          style={{ padding: '9px 20px', fontFamily: FONT.ui, fontSize: 14, fontWeight: 600, background: A.accent, color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
          Pronounce verdict
        </button>
        <button onClick={() => bail.mutate()} disabled={!anyArrested || bail.isPending}
          title={anyArrested ? '' : 'No arrested accused on this case'}
          style={{ padding: '9px 20px', fontFamily: FONT.ui, fontSize: 14, fontWeight: 600, background: '#fff', color: anyArrested ? '#0891b2' : C.charcoal, border: `1px solid ${anyArrested ? '#0891b2' : C.bark}`, borderRadius: 8, cursor: anyArrested ? 'pointer' : 'not-allowed' }}>
          {bail.isPending ? 'Granting…' : 'Grant bail'}
        </button>
      </div>

      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(16,32,44,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 16 }}>
          <div style={{ background: '#fff', border: `1px solid ${C.bark}`, borderRadius: 12, padding: 32, width: 540, maxWidth: '100%', boxShadow: '0 24px 60px rgba(16,32,44,0.30)' }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: C.ashes, margin: '0 0 4px' }}>Pronounce verdict — {fir.firNumber}</h3>
            <p style={{ color: C.charcoal, fontSize: 13, margin: '0 0 16px' }}>The court's decision; it updates every accused on this case.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
              {VERDICTS.map((v) => (
                <label key={v.val} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', padding: '10px 14px', borderRadius: 6, border: `1.5px solid ${outcome === v.val ? A.accent : C.bark}`, background: outcome === v.val ? `${A.accent}0D` : 'transparent' }}>
                  <input type="radio" checked={outcome === v.val} onChange={() => setOutcome(v.val)} style={{ marginTop: 3, accentColor: A.accent }} />
                  <div style={{ fontSize: 13, color: C.ashes }}><span style={{ fontWeight: 700 }}>{v.label}</span><span style={{ color: C.charcoal }}> — {v.desc}</span></div>
                </label>
              ))}
            </div>
            <label style={lbl}>Presiding judge <span style={{ fontWeight: 400 }}>(optional)</span></label>
            <input value={judge} onChange={(e) => setJudge(e.target.value)} placeholder="e.g. Hon'ble Judge R. Menon" style={{ ...input, margin: '4px 0 14px' }} />
            {outcome === 'CONVICTED' && (
              <>
                <label style={lbl}>Sentence</label>
                <input value={sentence} onChange={(e) => setSentence(e.target.value)} placeholder="e.g. 3 years rigorous imprisonment + fine" style={{ ...input, margin: '4px 0 16px' }} />
              </>
            )}
            {verdict.isError && <div style={{ background: '#FEF3F2', border: '1px solid #FECDCA', color: '#B91C1C', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 14 }}>{apiError(verdict.error, 'Could not record the verdict.')}</div>}
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => verdict.mutate()} disabled={verdict.isPending}
                style={{ padding: '10px 22px', fontFamily: FONT.ui, fontSize: 14, fontWeight: 600, background: verdict.isPending ? '#9DB2CC' : A.accent, color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
                {verdict.isPending ? 'Recording…' : 'Record verdict'}
              </button>
              <button onClick={() => setModal(false)}
                style={{ padding: '10px 22px', fontFamily: FONT.ui, fontSize: 14, fontWeight: 600, background: '#fff', color: C.ashes, border: `1px solid ${C.charcoal}66`, borderRadius: 8, cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function DecidedRow({ fir, stationCode }: { fir: Fir; stationCode: string }) {
  const { data: disposal = null } = useQuery<CourtDisposal | null>({
    queryKey: ['fir-disposal', fir.id],
    queryFn: () => caseApi.getFirCourtDisposal(fir.id).catch(() => null),
  })
  const color: Record<string, string> = { CONVICTED: '#B91C1C', ACQUITTED: '#15803D', DISCHARGED: '#B45309' }
  return (
    <div style={{ ...card, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', padding: '14px 18px' }}>
      <span><span style={{ fontFamily: 'monospace', fontWeight: 700, color: C.ashes }}>{fir.firNumber}</span><span style={{ color: C.charcoal, fontSize: 13 }}> · {stationCode}</span></span>
      {disposal && (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontWeight: 700, color: color[disposal.outcome] ?? C.ashes, border: `1.5px solid ${color[disposal.outcome] ?? C.charcoal}`, borderRadius: 8, padding: '3px 12px', fontSize: 13 }}>{disposal.outcome}</span>
          <span style={{ fontSize: 12, color: C.charcoal }}>{disposal.judgeName}{disposal.judgmentDate ? ` · ${disposal.judgmentDate}` : ''}</span>
        </span>
      )}
    </div>
  )
}
