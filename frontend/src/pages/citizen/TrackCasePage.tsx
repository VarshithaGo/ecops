import { useQuery } from '@tanstack/react-query'
import { caseApi } from '../../api/caseApi'
import { Complaint, Fir } from '../../types/case.types'

import { C } from '../../theme'

const STATUS_STEP: Record<string, number> = {
  FILED: 0, CATEGORIZED: 1, CONVERTED_TO_FIR: 2, LOGGED_IN_NCR: 2, CLOSED: 3, REJECTED: 3,
}
const FIR_STATUS_STEP: Record<string, number> = {
  REGISTERED: 0, UNDER_INVESTIGATION: 1, CHARGE_SHEET_FILED: 2, FINAL_REPORT_FILED: 2, CLOSED: 3,
}

export function TrackCasePage() {
  const { data: complaints, isLoading: loadingComplaints } = useQuery<Complaint[]>({ queryKey: ['my-complaints'], queryFn: caseApi.listComplaints })
  const { data: firs, isLoading: loadingFirs } = useQuery<Fir[]>({ queryKey: ['my-firs'], queryFn: caseApi.listFirs })

  return (
    <div style={{ padding: '32px 40px', maxWidth: 860 }}>
      <h2 style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: 26, letterSpacing: '0.06em', color: C.ashes, margin: 0, marginBottom: 6 }}>
        My Cases
      </h2>
      <p style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", color: C.charcoal, fontSize: 13, marginBottom: 32 }}>
        Track the status of your filed complaints and registered FIRs.
      </p>

      {/* Complaints */}
      <section style={{ marginBottom: 40 }}>
        <div style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: 13, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.ashes, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span>My Complaints</span>
          <div style={{ flex: 1, height: 1, background: C.bark }} />
        </div>
        {loadingComplaints ? (
          <div style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", color: C.charcoal }}>Loading...</div>
        ) : complaints?.length === 0 ? (
          <div style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", color: C.charcoal, padding: 24, border: `2px solid ${C.bark}`, borderRadius: 4, textAlign: 'center', background: `${C.kite}99` }}>No complaints filed yet.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {complaints?.map((c) => (
              <div key={c.id} style={{ background: `${C.kite}99`, border: `2px solid ${C.charcoal}`, borderRadius: 4, padding: '18px 22px', backdropFilter: 'blur(8px)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <span style={{ fontFamily: 'monospace', fontWeight: 700, color: C.ashes }}>{c.complaintNumber}</span>
                    <span style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", fontSize: 12, color: C.charcoal }}>
                      {new Date(c.createdAt).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                  <StatusPill status={c.status} />
                </div>
                <p style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", fontSize: 13, color: C.charcoal, margin: '0 0 14px', lineHeight: 1.6 }}>{c.description}</p>
                <WorkflowStepper steps={['Filed', 'Categorized', 'FIR / NCR', 'Closed']} current={STATUS_STEP[c.status] ?? 0} />
                {c.offenseType && (
                  <div style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", marginTop: 10, fontSize: 12, color: C.charcoal }}>
                    Classified as: <span style={{ color: C.ashes, fontWeight: 600 }}>{c.offenseType.replace(/_/g, ' ')}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* FIRs */}
      <section>
        <div style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: 13, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.ashes, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span>FIRs</span>
          <div style={{ flex: 1, height: 1, background: C.bark }} />
        </div>
        {loadingFirs ? (
          <div style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", color: C.charcoal }}>Loading...</div>
        ) : firs?.length === 0 ? (
          <div style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", color: C.charcoal, padding: 24, border: `2px solid ${C.bark}`, borderRadius: 4, textAlign: 'center', background: `${C.kite}99` }}>No FIRs registered.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {firs?.map((f) => (
              <div key={f.id} style={{ background: `${C.kite}99`, border: `2px solid ${C.charcoal}`, borderRadius: 4, padding: '18px 22px', backdropFilter: 'blur(8px)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <span style={{ fontFamily: 'monospace', fontWeight: 700, color: C.ashes, fontSize: 15 }}>{f.firNumber}</span>
                  <StatusPill status={f.status} />
                </div>
                <div style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", fontSize: 12, color: C.charcoal, marginBottom: 4 }}>
                  Sections: <span style={{ fontFamily: 'monospace', color: C.ashes }}>{f.ipcSections}</span>
                </div>
                {f.accusedName && (
                  <div style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", fontSize: 12, color: C.charcoal, marginBottom: 10 }}>
                    Accused: <span style={{ color: C.ashes, fontWeight: 600 }}>{f.accusedName}</span>
                  </div>
                )}
                <WorkflowStepper steps={['Registered', 'Under Investigation', 'Report Filed', 'Concluded']} current={FIR_STATUS_STEP[f.status] ?? 0} />
                <div style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", fontSize: 12, color: C.charcoal, marginTop: 10 }}>
                  Free copy: <span style={{ color: f.freeCopyIssued ? '#4ade80' : '#f87171', fontWeight: 600 }}>{f.freeCopyIssued ? 'Issued' : 'Pending (legal right)'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function StatusPill({ status }: { status: string }) {
  const colors: Record<string, string> = {
    FILED: C.charcoal, CATEGORIZED: '#d97706', CONVERTED_TO_FIR: '#4ade80',
    LOGGED_IN_NCR: '#a78bfa', CLOSED: C.charcoal, REJECTED: '#f87171',
    REGISTERED: C.charcoal, UNDER_INVESTIGATION: '#d97706',
    CHARGE_SHEET_FILED: '#4ade80', FINAL_REPORT_FILED: '#a78bfa',
  }
  const color = colors[status] ?? C.charcoal
  return (
    <span style={{
      fontFamily: 'Anton, Impact, sans-serif',
      fontSize: 10, letterSpacing: '0.1em',
      padding: '3px 10px', borderRadius: 3,
      border: `1px solid ${color}`,
      color,
    }}>
      {status.replace(/_/g, ' ')}
    </span>
  )
}

function WorkflowStepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {steps.map((step, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'none' }}>
          <div style={{
            width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
            background: i <= current ? C.charcoal : C.bark,
            border: `2px solid ${i <= current ? C.ashes : C.bark}`,
            color: i <= current ? C.ashes : C.charcoal,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: 700, fontFamily: "'Space Grotesk', system-ui, sans-serif",
          }}>
            {i < current ? '✓' : i + 1}
          </div>
          <span style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", fontSize: 10, color: i <= current ? C.ashes : C.charcoal, marginLeft: 4, marginRight: i < steps.length - 1 ? 4 : 0, whiteSpace: 'nowrap' }}>
            {step}
          </span>
          {i < steps.length - 1 && (
            <div style={{ flex: 1, height: 1, background: i < current ? C.charcoal : C.bark, margin: '0 4px' }} />
          )}
        </div>
      ))}
    </div>
  )
}
