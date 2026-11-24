import { useParams, Link } from 'react-router-dom'
import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  useFIR, useIoAssignments, useMahajar, usePropertySeizures,
  useFIRWarrants, useFIRCriminals, useChargeSheet, useFinalReport, useFIRAudit,
} from '../../hooks/useFIRData'
import { StatusBadge } from '../../components/StatusBadge'
import { DetailRow } from '../../components/DetailRow'
import { OfficerChip } from '../../components/OfficerChip'
import { CaseTimeline } from '../../components/CaseTimeline'
import { fmtDateTime } from '../../utils/date'
import { caseApi } from '../../api/caseApi'
import { IOAssignmentPanel } from './panels/IOAssignmentPanel'
import { MahajarPanel } from './panels/MahajarPanel'
import { PropertyPanel } from './panels/PropertyPanel'
import { WarrantPanel } from './panels/WarrantPanel'
import { CriminalPanel } from './panels/CriminalPanel'
import { FinalReportPanel } from './panels/FinalReportPanel'

import { C } from '../../theme'

const inputStyle: React.CSSProperties = {
  padding: '10px 14px', background: C.bark, color: C.ashes,
  border: `2px solid ${C.charcoal}`, borderRadius: 3,
  fontFamily: "'Space Grotesk', system-ui, sans-serif",
  fontSize: 13, width: '100%', boxSizing: 'border-box', outline: 'none',
}

export default function FIRDetail() {
  const { id } = useParams<{ id: string }>()
  const firId = id!
  const qc = useQueryClient()

  const { data: fir, isLoading: firLoading, error: firError } = useFIR(firId)
  const { data: ioAssignments = [] } = useIoAssignments(firId)
  const { data: mahajarReports = [] } = useMahajar(firId)
  const { data: seizures = [] } = usePropertySeizures(firId)
  const { data: warrants = [] } = useFIRWarrants(firId)
  const { data: criminals = [] } = useFIRCriminals(firId)
  const { data: chargeSheet = null } = useChargeSheet(firId)
  const { data: finalReport = null } = useFinalReport(firId)
  const { data: auditEvents = [] } = useFIRAudit(firId)

  const [transferCode, setTransferCode] = useState('')
  const [transferNotes, setTransferNotes] = useState('')
  const [courtName, setCourtName] = useState('')

  const transfer = useMutation({
    mutationFn: () => caseApi.transferFir(firId, { targetStationCode: transferCode, notes: transferNotes }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['fir', firId] }); setTransferCode(''); setTransferNotes('') },
  })

  const recordCourt = useMutation({
    mutationFn: () => caseApi.recordCourtProduction(firId, courtName),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['fir', firId] }); setCourtName('') },
  })

  if (firLoading) return <div style={{ padding: 32, fontFamily: "'Space Grotesk', system-ui, sans-serif", color: C.charcoal }}>Loading FIR...</div>
  if (firError || !fir) return <div style={{ padding: 32, fontFamily: "'Space Grotesk', system-ui, sans-serif", color: '#f87171' }}>Failed to load FIR.</div>

  // BNSS §193 charge-sheet deadline (computed client-side; mirrors case-service DeadlineService)
  const CLOSED = ['CHARGE_SHEET_FILED', 'FINAL_REPORT_FILED', 'COURT_DISPOSED', 'CLOSED']
  const daysElapsed = Math.floor((Date.now() - new Date(fir.registeredAt).getTime()) / 86400000)
  const daysRemaining = 90 - daysElapsed
  const deadlineOpen = !CLOSED.includes(fir.status)
  const deadlineState = !deadlineOpen ? 'CLOSED' : daysRemaining < 0 ? 'OVERDUE' : daysRemaining <= 15 ? 'DUE_SOON' : 'ON_TRACK'
  const deadlineColor = deadlineState === 'OVERDUE' ? '#f87171' : deadlineState === 'DUE_SOON' ? '#fb923c' : '#4ade80'

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ marginBottom: 16 }}>
        <Link to="/officer/firs" style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", fontSize: 13, color: C.charcoal, textDecoration: 'none' }}>
          ← Back to FIR List
        </Link>
      </div>

      {/* BNSS §193 charge-sheet deadline banner */}
      {deadlineOpen && (deadlineState === 'OVERDUE' || deadlineState === 'DUE_SOON') && (
        <div style={{ border: `2px solid ${deadlineColor}`, background: `${deadlineColor}14`, borderRadius: 4, padding: '14px 18px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: 11, letterSpacing: '0.1em', color: deadlineColor, border: `1.5px solid ${deadlineColor}`, borderRadius: 3, padding: '3px 9px', whiteSpace: 'nowrap' }}>
            {deadlineState === 'OVERDUE' ? 'CHARGE SHEET OVERDUE' : 'DEADLINE APPROACHING'}
          </span>
          <span style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", fontSize: 13, color: C.ashes, lineHeight: 1.5 }}>
            BNSS §193 — investigation is on day <strong>{daysElapsed}</strong> of the 90-day charge-sheet limit.{' '}
            {deadlineState === 'OVERDUE'
              ? <span style={{ color: deadlineColor, fontWeight: 600 }}>{Math.abs(daysRemaining)} day(s) past the statutory deadline.</span>
              : <span style={{ color: deadlineColor, fontWeight: 600 }}>{daysRemaining} day(s) remaining.</span>}
          </span>
        </div>
      )}

      {/* FIR Summary Card */}
      <div style={{ background: `${C.kite}cc`, border: `2px solid ${C.charcoal}`, borderRadius: 4, padding: '24px 28px', marginBottom: 20, backdropFilter: 'blur(8px)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <h2 style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: 22, letterSpacing: '0.06em', color: C.ashes, margin: 0 }}>
              {fir.firNumber}
            </h2>
            {fir.isZeroFir && (
              <span style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: 10, letterSpacing: '0.12em', padding: '3px 10px', borderRadius: 3, color: '#fb923c', border: '1.5px solid #fb923c' }}>
                ZERO FIR
              </span>
            )}
          </div>
          <StatusBadge status={fir.status} />
        </div>
        <span style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", fontSize: 12, color: C.charcoal, display: 'block', marginBottom: 20 }}>
          Registered {fmtDateTime(fir.registeredAt)}
        </span>

        <div style={{ borderTop: `1px solid ${C.bark}`, paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <DetailRow label="Station" value={fir.stationCode} mono />
          <DetailRow label="BNS/IPC Sections" value={fir.ipcSections} mono />
          <DetailRow label="Narrative" value={fir.narrative} />
          {fir.accusedName && <DetailRow label="Accused" value={fir.accusedName} />}
          {fir.accusedAddress && <DetailRow label="Accused Address" value={fir.accusedAddress} />}
          <DetailRow label="Registered By" value={<OfficerChip keycloakUserId={fir.registeredByOfficerId} />} />
          <DetailRow label="Free Copy Issued" value={fir.freeCopyIssued ? 'Yes' : 'Pending'} />
          {fir.remandCourtName && <DetailRow label="Court Production" value={fir.remandCourtName} />}
        </div>

        {/* Court production — 24-hour rule (BNSS 187) */}
        {!fir.remandCourtName && (
          <div style={{ marginTop: 20, borderTop: `1px solid ${C.bark}`, paddingTop: 16 }}>
            {(() => {
              const hrs = (Date.now() - new Date(fir.registeredAt).getTime()) / 3600000
              return hrs > 24 ? (
                <p style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", fontSize: 13, color: '#fb923c', margin: '0 0 14px', fontWeight: 600 }}>
                  BNSS 187 — Arrested person must be produced before a magistrate within 24 hours. Record the court name below.
                </p>
              ) : null
            })()}
            <div style={{ display: 'flex', gap: 10, maxWidth: 420, alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontFamily: "'Space Grotesk', system-ui, sans-serif", fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.charcoal, marginBottom: 6 }}>
                  Court Name (BNSS 187)
                </label>
                <input value={courtName} onChange={(e) => setCourtName(e.target.value)} placeholder="e.g. JMFC Bangalore Urban" style={inputStyle} />
              </div>
              <button onClick={() => recordCourt.mutate()} disabled={!courtName || recordCourt.isPending}
                style={{ padding: '10px 18px', fontFamily: 'Anton, Impact, sans-serif', fontSize: 11, letterSpacing: '0.1em', background: 'transparent', color: courtName ? C.ashes : C.charcoal, border: `2px solid ${courtName ? C.charcoal : C.bark}`, borderRadius: 3, cursor: courtName ? 'pointer' : 'not-allowed', whiteSpace: 'nowrap' }}>
                {recordCourt.isPending ? 'SAVING…' : 'RECORD COURT'}
              </button>
            </div>
          </div>
        )}

        {fir.isZeroFir && (
          <div style={{ marginTop: 20, borderTop: `1px solid ${C.bark}`, paddingTop: 16 }}>
            {fir.transferredToStationCode ? (
              <div style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", fontSize: 13, color: C.charcoal }}>
                <span style={{ color: '#4ade80', fontWeight: 600 }}>Transferred</span> to{' '}
                <span style={{ fontFamily: 'monospace', color: C.ashes, fontWeight: 700 }}>{fir.transferredToStationCode}</span>
                {fir.transferNotes && <span> — {fir.transferNotes}</span>}
              </div>
            ) : (
              <div>
                <p style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", fontSize: 13, color: '#fb923c', margin: '0 0 14px', fontWeight: 600 }}>
                  Zero FIR — transfer to competent station required (BNSS 173(1))
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 420 }}>
                  <div>
                    <label style={{ display: 'block', fontFamily: "'Space Grotesk', system-ui, sans-serif", fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.charcoal, marginBottom: 6 }}>
                      Competent Station Code *
                    </label>
                    <input value={transferCode} onChange={(e) => setTransferCode(e.target.value.toUpperCase())} placeholder="e.g. BLR-KOR" style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontFamily: "'Space Grotesk', system-ui, sans-serif", fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.charcoal, marginBottom: 6 }}>
                      Transfer Notes
                    </label>
                    <input value={transferNotes} onChange={(e) => setTransferNotes(e.target.value)} placeholder="Reason for transfer" style={inputStyle} />
                  </div>
                  <button onClick={() => transfer.mutate()} disabled={!transferCode || transfer.isPending}
                    style={{ padding: '9px 20px', fontFamily: 'Anton, Impact, sans-serif', fontSize: 11, letterSpacing: '0.12em', background: 'transparent', color: '#fb923c', border: '2px solid #fb923c', borderRadius: 3, cursor: 'pointer', alignSelf: 'flex-start' }}>
                    {transfer.isPending ? 'TRANSFERRING…' : 'TRANSFER FIR'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <IOAssignmentPanel firId={firId} assignments={ioAssignments} stationCode={fir.stationCode} />
      <MahajarPanel firId={firId} reports={mahajarReports} />
      <PropertyPanel firId={firId} seizures={seizures} />
      <WarrantPanel firId={firId} warrants={warrants} />
      <CriminalPanel firId={firId} criminals={criminals} />
      <FinalReportPanel firId={firId} chargeSheet={chargeSheet} finalReport={finalReport} />
      <CaseTimeline events={auditEvents} />
      <style>{`input::placeholder, textarea::placeholder { color: ${C.charcoal}; opacity: 0.6; }`}</style>
    </div>
  )
}
