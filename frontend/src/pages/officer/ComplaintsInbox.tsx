import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { caseApi } from '../../api/caseApi'
import { Complaint } from '../../types/case.types'
import { useState } from 'react'
import { useAuth } from '../../auth/AuthProvider'
import { useCurrentOfficer } from '../../hooks/useCurrentOfficer'
import { ROLES } from '../../utils/roles'
import { StatusBadge } from '../../components/StatusBadge'
import { fmtDate } from '../../utils/date'

import { C, A, FONT } from '../../theme'

const th: React.CSSProperties = {
  padding: '11px 14px', fontFamily: FONT.ui, fontSize: 12, fontWeight: 700,
  color: C.charcoal, textAlign: 'left', background: '#F3F6FA',
  borderBottom: `1px solid ${C.bark}`,
}
const td: React.CSSProperties = {
  padding: '11px 14px', fontFamily: FONT.ui, fontSize: 14, color: C.ashes,
  borderBottom: `1px solid ${C.bark}`,
}

export function ComplaintsInbox() {
  const { data, isLoading } = useQuery<Complaint[]>({ queryKey: ['complaints'], queryFn: caseApi.listComplaints })
  const qc = useQueryClient()
  const [selected, setSelected] = useState<string | null>(null)
  const [offenseType, setOffenseType] = useState('COGNIZABLE')
  const [isZeroFir, setIsZeroFir] = useState(false)
  const { userId, roles } = useAuth()
  const { stationId: myStationId } = useCurrentOfficer()
  const isAdmin = roles.includes(ROLES.ADMIN)
  // Officers see only complaints at their own station; admins see all.
  const complaints = (data ?? []).filter((c) => isAdmin || !myStationId || c.stationId === myStationId)

  const categorize = useMutation({
    mutationFn: ({ id, offenseType, isZeroFir }: { id: string; offenseType: string; isZeroFir: boolean }) =>
      caseApi.categorize(id, { offenseType, assignedOfficerId: userId, isZeroFir }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['complaints'] })
      qc.invalidateQueries({ queryKey: ['firs'] })
      setSelected(null)
      setIsZeroFir(false)
    },
  })

  if (isLoading) return (
    <div style={{ padding: 32, fontFamily: "'Space Grotesk', system-ui, sans-serif", color: C.charcoal }}>Loading...</div>
  )

  return (
    <div style={{ padding: '32px 24px', maxWidth: 1100, margin: '0 auto' }}>
      <h2 style={{ fontFamily: FONT.ui, fontSize: 24, fontWeight: 700, letterSpacing: '-0.01em', color: C.ashes, margin: 0, marginBottom: 6 }}>
        Complaints Inbox
      </h2>
      <p style={{ fontFamily: FONT.ui, color: C.charcoal, fontSize: 14, marginBottom: 24 }}>
        Incoming complaints awaiting categorization as FIR (cognizable) or NCR (non-cognizable).
      </p>

      <div style={{ border: `1px solid ${C.bark}`, borderRadius: 10, overflow: 'hidden', background: '#fff', boxShadow: '0 1px 3px rgba(16,32,44,0.06)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={th}>Number</th>
              <th style={th}>Incident Date</th>
              <th style={th}>Description</th>
              <th style={th}>Status</th>
              <th style={th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {complaints.map((c) => (
              <tr key={c.id} style={{ background: 'transparent' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = `${C.bark}88`)}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                <td style={{ ...td, fontFamily: 'monospace', fontWeight: 700 }}>{c.complaintNumber}</td>
                <td style={td}>{fmtDate(c.incidentDate)}</td>
                <td style={{ ...td, color: C.charcoal }}>{c.description.substring(0, 60)}{c.description.length > 60 ? '…' : ''}</td>
                <td style={td}><StatusBadge status={c.status} size="sm" /></td>
                <td style={td}>
                  {c.status === 'FILED' && (
                    <button
                      onClick={() => { setSelected(c.id); setOffenseType('COGNIZABLE'); setIsZeroFir(false) }}
                      style={{
                        padding: '6px 14px', fontFamily: FONT.ui,
                        fontSize: 13, fontWeight: 600,
                        background: A.accent, color: '#fff',
                        border: 'none', borderRadius: 6, cursor: 'pointer',
                      }}>
                      Categorize
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {complaints.length === 0 && (
              <tr><td colSpan={5} style={{ ...td, textAlign: 'center', color: C.charcoal, padding: 32 }}>No complaints.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Categorize modal */}
      {selected && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(10,10,10,0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200,
        }}>
          <div style={{
            background: '#fff', border: `1px solid ${C.bark}`,
            borderRadius: 12, padding: 32, minWidth: 460, maxWidth: 540,
            boxShadow: '0 24px 60px rgba(16,32,44,0.30)',
          }}>
            <h3 style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: 20, letterSpacing: '0.06em', color: C.ashes, margin: '0 0 8px' }}>
              Categorize Offense
            </h3>
            <p style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", color: C.charcoal, fontSize: 13, marginBottom: 20, lineHeight: 1.6 }}>
              Determine whether this offense is cognizable (FIR mandatory) or non-cognizable (NCR entry + Form 76-A, refer to Magistrate under BNSS 174).
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
              {[
                { val: 'COGNIZABLE',     label: 'Cognizable',     desc: 'FIR mandatory (BNSS 173), free copy to complainant' },
                { val: 'NON_COGNIZABLE', label: 'Non-Cognizable', desc: 'NCR entry + Form 76-A, direct to Magistrate (BNSS 174)' },
              ].map(({ val, label, desc }) => (
                <label key={val} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer',
                  padding: '10px 14px', borderRadius: 3,
                  border: `1.5px solid ${offenseType === val ? C.ashes : C.bark}`,
                  background: offenseType === val ? `${C.bark}` : 'transparent',
                }}>
                  <input type="radio" value={val} checked={offenseType === val}
                    onChange={() => setOffenseType(val)} style={{ marginTop: 2, accentColor: C.ashes }} />
                  <div style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", fontSize: 13, color: C.ashes }}>
                    <span style={{ fontWeight: 700 }}>{label}</span>
                    <span style={{ color: C.charcoal }}> — {desc}</span>
                  </div>
                </label>
              ))}
            </div>

            {offenseType === 'COGNIZABLE' && (
              <label style={{
                display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer',
                padding: '10px 14px', borderRadius: 3, marginBottom: 16,
                border: `1.5px solid ${isZeroFir ? C.charcoal : C.bark}`,
                background: isZeroFir ? C.bark : 'transparent',
              }}>
                <input type="checkbox" checked={isZeroFir} onChange={(e) => setIsZeroFir(e.target.checked)}
                  style={{ marginTop: 2, accentColor: C.ashes }} />
                <div style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", fontSize: 13, color: C.ashes, lineHeight: 1.5 }}>
                  <span style={{ fontWeight: 700 }}>Register as Zero FIR</span>
                  <span style={{ color: C.charcoal }}> — incident occurred outside this station's jurisdiction (BNSS 173(1)). Transfer to competent station required after registration.</span>
                </div>
              </label>
            )}

            {categorize.isError && (
              <p style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", color: '#f87171', fontSize: 13, marginBottom: 12 }}>
                {(categorize.error as Error)?.message ?? 'Categorization failed.'}
              </p>
            )}

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => categorize.mutate({ id: selected, offenseType, isZeroFir })}
                disabled={categorize.isPending}
                style={{
                  padding: '10px 22px', fontFamily: FONT.ui, fontSize: 14, fontWeight: 600,
                  background: categorize.isPending ? '#9DB2CC' : A.accent, color: '#fff',
                  border: 'none', borderRadius: 8, cursor: categorize.isPending ? 'not-allowed' : 'pointer',
                }}>
                {categorize.isPending ? 'Processing…' : 'Confirm'}
              </button>
              <button onClick={() => setSelected(null)}
                style={{
                  padding: '10px 22px', fontFamily: FONT.ui, fontSize: 14, fontWeight: 600,
                  background: '#fff', color: C.ashes,
                  border: `1px solid ${C.charcoal}66`, borderRadius: 8, cursor: 'pointer',
                }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
