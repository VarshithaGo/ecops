import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { caseApi } from '../../api/caseApi'
import { NcrEntry } from '../../types/case.types'
import { Station, OfficerAssignment } from '../../types/admin.types'
import { stationsApi } from '../../api/stationsApi'
import { StatusBadge } from '../../components/StatusBadge'
import { OfficerChip } from '../../components/OfficerChip'
import { fmtDate } from '../../utils/date'
import { apiError } from '../../utils/apiError'
import { useAuth } from '../../auth/AuthProvider'
import { useCurrentOfficer } from '../../hooks/useCurrentOfficer'
import { useCapabilities } from '../../hooks/useCapabilities'
import { ROLES } from '../../utils/roles'
import { C, A, FONT, FIELD_BORDER } from '../../theme'

const th: React.CSSProperties = {
  padding: '11px 14px', fontFamily: FONT.ui, fontSize: 12, fontWeight: 700,
  color: C.charcoal, textAlign: 'left', background: '#F3F6FA',
  borderBottom: `1px solid ${C.bark}`,
}
const td: React.CSSProperties = {
  padding: '11px 14px', fontFamily: FONT.ui, fontSize: 14, color: C.ashes,
  borderBottom: `1px solid ${C.bark}`, verticalAlign: 'top',
}
const lbl: React.CSSProperties = { fontFamily: FONT.ui, fontSize: 12, fontWeight: 600, color: C.charcoal, marginBottom: 4 }
const inputStyle: React.CSSProperties = {
  padding: '9px 12px', background: '#fff', color: C.ashes,
  border: `1.5px solid ${FIELD_BORDER}`, borderRadius: 6,
  fontFamily: FONT.ui, fontSize: 14, width: '100%', boxSizing: 'border-box', outline: 'none',
}
const btnPrimary = (disabled = false): React.CSSProperties => ({
  padding: '6px 14px', fontFamily: FONT.ui, fontSize: 13, fontWeight: 600,
  background: disabled ? '#9DB2CC' : A.accent, color: '#fff',
  border: 'none', borderRadius: 6, cursor: disabled ? 'not-allowed' : 'pointer',
})

const OUTCOMES = [
  { val: 'PROSECUTION_REPORT', label: 'File report to Magistrate (prosecution)', desc: 'Offence made out — report filed under BNSS §193; Magistrate takes cognizance.' },
  { val: 'NO_OFFENCE',         label: 'Close — no offence made out',            desc: 'Closure/negative report. Enquiry found nothing to prosecute.' },
  { val: 'ESCALATED_TO_FIR',   label: 'Escalate to FIR (cognizable found)',     desc: 'BNSS §174(4): a cognizable element surfaced — an FIR is registered from this complaint.' },
]

export function NCRList() {
  const qc = useQueryClient()
  const { data, isLoading, error } = useQuery<NcrEntry[]>({ queryKey: ['ncr'], queryFn: caseApi.listNcr })
  const { data: stations = [] } = useQuery<Station[]>({ queryKey: ['stations'], queryFn: stationsApi.list })
  const stationMap = Object.fromEntries(stations.map((s) => [s.id, s.stationCode]))
  const { roles, userId } = useAuth()
  const { stationId: myStationId } = useCurrentOfficer()
  const { can } = useCapabilities()
  const isAdmin = roles.includes(ROLES.ADMIN)
  // Officers see only their own station's NCRs; admins see all. (Server also scopes officers.)
  const ncrs = (data ?? []).filter((n) => isAdmin || !myStationId || n.stationId === myStationId)

  // Officers at this station, for the "assign IO" picker.
  const { data: stationOfficers = [] } = useQuery<OfficerAssignment[]>({
    queryKey: ['station-officers', myStationId],
    queryFn: () => stationsApi.listAssignments(myStationId!),
    enabled: !!myStationId,
  })

  const refer = useMutation({
    mutationFn: (id: string) => caseApi.referNcrToMagistrate(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ncr'] }),
  })

  // Begin investigation
  const [beginFor, setBeginFor] = useState<NcrEntry | null>(null)
  const [ioOfficerId, setIoOfficerId] = useState('')
  const begin = useMutation({
    mutationFn: (id: string) => caseApi.beginNcrInvestigation(id, ioOfficerId || userId || undefined),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['ncr'] }); setBeginFor(null) },
  })

  // Close investigation
  const [closeFor, setCloseFor] = useState<NcrEntry | null>(null)
  const [outcome, setOutcome] = useState('PROSECUTION_REPORT')
  const [findings, setFindings] = useState('')
  const close = useMutation({
    mutationFn: (id: string) => caseApi.closeNcr(id, { outcome, findings: findings || undefined }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ncr'] })
      qc.invalidateQueries({ queryKey: ['firs'] })
      setCloseFor(null)
    },
  })

  if (isLoading) return <div style={{ padding: 32, fontFamily: FONT.ui, color: C.charcoal }}>Loading NCR entries...</div>
  if (error)     return <div style={{ padding: 32, fontFamily: FONT.ui, color: '#B91C1C' }}>Error loading NCR.</div>

  return (
    <div style={{ padding: '32px 24px', maxWidth: 1180, margin: '0 auto' }}>
      <h2 style={{ fontFamily: FONT.ui, fontSize: 24, fontWeight: 700, letterSpacing: '-0.01em', color: C.ashes, margin: 0, marginBottom: 6 }}>
        Non-Cognizable Register (NCR)
      </h2>
      <p style={{ fontFamily: FONT.ui, color: C.charcoal, fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
        Non-cognizable offences recorded under BNSS §174. Police may investigate only after a Magistrate's order (§174(2)); once ordered,
        the station deputes an IO (§174(3)) and closes the case with a report — or escalates to an FIR if a cognizable element surfaces (§174(4)).
      </p>

      <div style={{ border: `1px solid ${C.bark}`, borderRadius: 10, overflow: 'hidden', background: '#fff', boxShadow: '0 1px 3px rgba(16,32,44,0.06)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={th}>NCR Number</th>
              <th style={th}>Complaint</th>
              {isAdmin && <th style={th}>Station</th>}
              <th style={th}>Status</th>
              <th style={th}>Investigation</th>
              <th style={th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {ncrs.map((ncr) => (
              <tr key={ncr.id}
                onMouseEnter={(e) => (e.currentTarget.style.background = `${C.bark}88`)}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                <td style={{ ...td, fontFamily: 'monospace', fontWeight: 700 }}>
                  {ncr.ncrNumber}
                  <div style={{ fontFamily: FONT.ui, fontWeight: 400, fontSize: 12, color: C.charcoal, marginTop: 2 }}>
                    {fmtDate(ncr.createdAt)}
                  </div>
                </td>
                <td style={{ ...td, maxWidth: 320 }}>
                  <div style={{ color: C.ashes }}>{ncr.complaintDescription ?? '—'}</div>
                  <div style={{ fontSize: 12, color: C.charcoal, marginTop: 3 }}>
                    {ncr.complainantName ? `Complainant: ${ncr.complainantName}` : ''}
                    {ncr.incidentLocation ? ` · ${ncr.incidentLocation}` : ''}
                  </div>
                </td>
                {isAdmin && <td style={{ ...td, fontFamily: 'monospace' }}>{stationMap[ncr.stationId] ?? ncr.stationId.slice(0, 8) + '…'}</td>}
                <td style={td}><StatusBadge status={ncr.status} size="sm" /></td>
                <td style={{ ...td, maxWidth: 240 }}>
                  {ncr.assignedIoOfficerId && (
                    <div style={{ marginBottom: 4 }}>
                      <span style={{ fontSize: 12, color: C.charcoal }}>IO: </span>
                      <OfficerChip keycloakUserId={ncr.assignedIoOfficerId} />
                    </div>
                  )}
                  {ncr.magistrateOrderNotes && (
                    <div style={{ fontSize: 12, color: C.charcoal, fontStyle: 'italic' }}>
                      Order: {ncr.magistrateOrderNotes}
                    </div>
                  )}
                  {ncr.outcome && ncr.outcome !== 'ESCALATED_TO_FIR' && (
                    <div style={{ fontSize: 12, color: C.ashes }}>
                      Outcome: {ncr.outcome === 'PROSECUTION_REPORT' ? 'Report filed (prosecution)' : 'Closed — no offence'}
                    </div>
                  )}
                  {ncr.status === 'ESCALATED_TO_FIR' && ncr.escalatedFirId && (
                    <Link to={`/officer/firs/${ncr.escalatedFirId}`} style={{ fontSize: 12, color: A.accent, fontWeight: 600 }}>
                      → View escalated FIR
                    </Link>
                  )}
                </td>
                <td style={td}>
                  {ncr.status === 'OPEN' && can('CATEGORIZE') && (
                    <button onClick={() => refer.mutate(ncr.id)} disabled={refer.isPending} style={btnPrimary(refer.isPending)}>
                      Refer to magistrate
                    </button>
                  )}
                  {ncr.status === 'MAGISTRATE_ORDERED' && can('INVESTIGATE') && (
                    <button onClick={() => { setBeginFor(ncr); setIoOfficerId(userId || '') }} style={btnPrimary()}>
                      Begin investigation
                    </button>
                  )}
                  {ncr.status === 'UNDER_INVESTIGATION' && can('INVESTIGATE') && (
                    <button onClick={() => { setCloseFor(ncr); setOutcome('PROSECUTION_REPORT'); setFindings('') }} style={btnPrimary()}>
                      Close / file report
                    </button>
                  )}
                  {ncr.status === 'REFERRED_TO_MAGISTRATE' && (
                    <span style={{ fontSize: 12, color: C.charcoal, fontStyle: 'italic' }}>Awaiting Magistrate's order</span>
                  )}
                </td>
              </tr>
            ))}
            {ncrs.length === 0 && (
              <tr><td colSpan={isAdmin ? 6 : 5} style={{ ...td, textAlign: 'center', color: C.charcoal, padding: 32 }}>No NCR entries.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Begin investigation modal */}
      {beginFor && (
        <Modal onClose={() => setBeginFor(null)} title="Begin investigation">
          <p style={{ fontFamily: FONT.ui, fontSize: 13, color: C.charcoal, margin: '0 0 16px', lineHeight: 1.6 }}>
            The Magistrate has ordered investigation of <b style={{ color: C.ashes }}>{beginFor.ncrNumber}</b> under BNSS §174(2).
            Depute an investigating officer at this station to take it up (§174(3) — cognizable-case powers, no arrest without warrant).
          </p>
          {beginFor.magistrateOrderNotes && (
            <div style={{ marginBottom: 16, padding: '10px 12px', background: C.angst, borderRadius: 8, border: `1px solid ${C.bark}` }}>
              <div style={{ ...lbl, marginBottom: 4 }}>Magistrate's order</div>
              <div style={{ fontFamily: FONT.ui, fontSize: 14, color: C.ashes }}>{beginFor.magistrateOrderNotes}</div>
            </div>
          )}
          <label style={lbl}>Investigating officer</label>
          <select value={ioOfficerId} onChange={(e) => setIoOfficerId(e.target.value)} style={{ ...inputStyle, margin: '6px 0 20px' }}>
            <option value={userId ?? ''}>Myself</option>
            {stationOfficers
              .filter((o) => o.keycloakUserId !== userId)
              .map((o) => (
                <option key={o.keycloakUserId} value={o.keycloakUserId}>
                  {o.officerName ?? o.badgeNumber}{o.rank ? ` · ${o.rank}` : ''} ({o.badgeNumber})
                </option>
              ))}
          </select>
          {begin.isError && <ErrText>{apiError(begin.error, 'Could not begin investigation.')}</ErrText>}
          <ModalActions
            onCancel={() => setBeginFor(null)}
            onConfirm={() => begin.mutate(beginFor.id)}
            confirmLabel={begin.isPending ? 'Starting…' : 'Begin investigation'}
            pending={begin.isPending}
          />
        </Modal>
      )}

      {/* Close investigation modal */}
      {closeFor && (
        <Modal onClose={() => setCloseFor(null)} title="Close investigation">
          <p style={{ fontFamily: FONT.ui, fontSize: 13, color: C.charcoal, margin: '0 0 16px', lineHeight: 1.6 }}>
            Record the outcome of the enquiry into <b style={{ color: C.ashes }}>{closeFor.ncrNumber}</b>.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
            {OUTCOMES.map((o) => (
              <label key={o.val} style={{
                display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer',
                padding: '10px 14px', borderRadius: 6,
                border: `1.5px solid ${outcome === o.val ? A.accent : C.bark}`,
                background: outcome === o.val ? `${A.accent}0D` : 'transparent',
              }}>
                <input type="radio" checked={outcome === o.val} onChange={() => setOutcome(o.val)} style={{ marginTop: 3, accentColor: A.accent }} />
                <div style={{ fontFamily: FONT.ui, fontSize: 13, color: C.ashes }}>
                  <span style={{ fontWeight: 700 }}>{o.label}</span>
                  <span style={{ color: C.charcoal }}> — {o.desc}</span>
                </div>
              </label>
            ))}
          </div>
          <label style={lbl}>Investigation findings {outcome === 'ESCALATED_TO_FIR' ? '(grounds for the cognizable offence)' : '(optional)'}</label>
          <textarea rows={4} value={findings} onChange={(e) => setFindings(e.target.value)}
            placeholder="Summarise the enquiry, statements recorded, and the basis for this outcome…"
            style={{ ...inputStyle, resize: 'vertical', margin: '6px 0 20px' }} />
          {close.isError && <ErrText>{apiError(close.error, 'Could not close the investigation.')}</ErrText>}
          <ModalActions
            onCancel={() => setCloseFor(null)}
            onConfirm={() => close.mutate(closeFor.id)}
            confirmLabel={close.isPending ? 'Saving…' : (outcome === 'ESCALATED_TO_FIR' ? 'Escalate to FIR' : 'Close case')}
            pending={close.isPending}
          />
        </Modal>
      )}
    </div>
  )
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(16,32,44,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 16 }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', border: `1px solid ${C.bark}`, borderRadius: 12, padding: 32, width: 560, maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 60px rgba(16,32,44,0.30)' }}>
        <h3 style={{ fontFamily: FONT.ui, fontSize: 20, fontWeight: 700, color: C.ashes, margin: '0 0 12px' }}>{title}</h3>
        {children}
      </div>
    </div>
  )
}

function ModalActions({ onCancel, onConfirm, confirmLabel, pending }: { onCancel: () => void; onConfirm: () => void; confirmLabel: string; pending: boolean }) {
  return (
    <div style={{ display: 'flex', gap: 12 }}>
      <button onClick={onConfirm} disabled={pending} style={{ padding: '10px 22px', fontFamily: FONT.ui, fontSize: 14, fontWeight: 600, background: pending ? '#9DB2CC' : A.accent, color: '#fff', border: 'none', borderRadius: 8, cursor: pending ? 'not-allowed' : 'pointer' }}>
        {confirmLabel}
      </button>
      <button onClick={onCancel} style={{ padding: '10px 22px', fontFamily: FONT.ui, fontSize: 14, fontWeight: 600, background: '#fff', color: C.ashes, border: `1px solid ${C.charcoal}66`, borderRadius: 8, cursor: 'pointer' }}>
        Cancel
      </button>
    </div>
  )
}

function ErrText({ children }: { children: React.ReactNode }) {
  return <p style={{ fontFamily: FONT.ui, color: '#B91C1C', fontSize: 13, margin: '0 0 14px' }}>{children}</p>
}
