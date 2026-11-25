import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { caseApi } from '../../api/caseApi'
import { Complaint } from '../../types/case.types'
import { Station } from '../../types/admin.types'
import { stationsApi } from '../../api/stationsApi'
import { useState } from 'react'
import { useAuth } from '../../auth/AuthProvider'
import { useCurrentOfficer } from '../../hooks/useCurrentOfficer'
import { useCapabilities } from '../../hooks/useCapabilities'
import { ROLES } from '../../utils/roles'
import { StatusBadge } from '../../components/StatusBadge'
import { OfficerChip } from '../../components/OfficerChip'
import { fmtDate } from '../../utils/date'
import { apiError } from '../../utils/apiError'

import { C, A, FONT, FIELD_BORDER } from '../../theme'

const th: React.CSSProperties = {
  padding: '11px 14px', fontFamily: FONT.ui, fontSize: 12, fontWeight: 700,
  color: C.charcoal, textAlign: 'left', background: '#F3F6FA',
  borderBottom: `1px solid ${C.bark}`,
}
const td: React.CSSProperties = {
  padding: '11px 14px', fontFamily: FONT.ui, fontSize: 14, color: C.ashes,
  borderBottom: `1px solid ${C.bark}`,
}
const editLbl: React.CSSProperties = {
  fontFamily: FONT.ui, fontSize: 12, fontWeight: 600, color: C.charcoal, marginBottom: 4,
}
const editInput: React.CSSProperties = {
  padding: '9px 12px', background: '#fff', color: C.ashes,
  border: `1.5px solid ${FIELD_BORDER}`, borderRadius: 6,
  fontFamily: FONT.ui, fontSize: 14, width: '100%', boxSizing: 'border-box', outline: 'none',
}

export function ComplaintsInbox() {
  const { data, isLoading } = useQuery<Complaint[]>({ queryKey: ['complaints'], queryFn: caseApi.listComplaints })
  const qc = useQueryClient()
  const [selected, setSelected] = useState<string | null>(null)
  const [offenseType, setOffenseType] = useState('COGNIZABLE')
  const [isZeroFir, setIsZeroFir] = useState(false)
  const [editing, setEditing] = useState<Complaint | null>(null)
  const [form, setForm] = useState({ walkInName: '', walkInPhone: '', walkInAddress: '', description: '', incidentDate: '', incidentLocation: '' })
  const { userId, roles } = useAuth()
  const { stationId: myStationId } = useCurrentOfficer()
  const { can } = useCapabilities()
  const isAdmin = roles.includes(ROLES.ADMIN)
  const { data: stations = [] } = useQuery<Station[]>({ queryKey: ['stations'], queryFn: stationsApi.list })
  const stationMap = Object.fromEntries(stations.map((s) => [s.id, s.stationCode]))
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

  const update = useMutation({
    mutationFn: (id: string) =>
      caseApi.updateComplaint(id, {
        walkInName: form.walkInName || null,
        walkInPhone: form.walkInPhone || null,
        walkInAddress: form.walkInAddress || null,
        description: form.description,
        incidentDate: form.incidentDate,
        incidentLocation: form.incidentLocation || null,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['complaints'] })
      setEditing(null)
    },
  })

  function openEdit(c: Complaint) {
    setForm({
      walkInName: c.walkInName ?? '',
      walkInPhone: c.walkInPhone ?? '',
      walkInAddress: c.walkInAddress ?? '',
      description: c.description ?? '',
      incidentDate: c.incidentDate ?? '',
      incidentLocation: c.incidentLocation ?? '',
    })
    setEditing(c)
  }

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
              <th style={th}>Complainant</th>
              <th style={th}>Incident Date</th>
              <th style={th}>Description</th>
              {isAdmin && <th style={th}>Station</th>}
              {isAdmin && <th style={th}>Filed by</th>}
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
                <td style={td}>{c.walkInName ?? (c.citizenKeycloakId ? 'Citizen portal' : '—')}</td>
                <td style={td}>{fmtDate(c.incidentDate)}</td>
                <td style={{ ...td, color: C.charcoal }}>{c.description.substring(0, 60)}{c.description.length > 60 ? '…' : ''}</td>
                {isAdmin && <td style={{ ...td, fontFamily: 'monospace' }}>{stationMap[c.stationId] ?? c.stationId.slice(0, 8) + '…'}</td>}
                {isAdmin && <td style={td}>{c.registeredByOfficerId ? <OfficerChip keycloakUserId={c.registeredByOfficerId} /> : <span style={{ color: C.charcoal }}>Online</span>}</td>}
                <td style={td}><StatusBadge status={c.status} size="sm" /></td>
                <td style={td}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {c.status === 'FILED' && (
                      <button
                        onClick={() => openEdit(c)}
                        style={{
                          padding: '6px 14px', fontFamily: FONT.ui,
                          fontSize: 13, fontWeight: 600,
                          background: '#fff', color: A.accent,
                          border: `1px solid ${A.accent}`, borderRadius: 6, cursor: 'pointer',
                        }}>
                        Edit
                      </button>
                    )}
                    {c.status === 'FILED' && can('CATEGORIZE') && (
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
                  </div>
                </td>
              </tr>
            ))}
            {complaints.length === 0 && (
              <tr><td colSpan={isAdmin ? 8 : 6} style={{ ...td, textAlign: 'center', color: C.charcoal, padding: 32 }}>No complaints.</td></tr>
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
              <p style={{ fontFamily: FONT.ui, color: '#B91C1C', fontSize: 13, marginBottom: 12 }}>
                {apiError(categorize.error, 'Categorization failed.')}
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

      {/* Edit modal */}
      {editing && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(16,32,44,0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 16,
        }}>
          <div style={{
            background: '#fff', border: `1px solid ${C.bark}`,
            borderRadius: 12, padding: 32, width: 520, maxWidth: '100%',
            maxHeight: '90vh', overflowY: 'auto',
            boxShadow: '0 24px 60px rgba(16,32,44,0.30)',
          }}>
            <h3 style={{ fontFamily: FONT.ui, fontSize: 20, fontWeight: 700, color: C.ashes, margin: '0 0 4px' }}>
              Edit complaint
            </h3>
            <p style={{ fontFamily: FONT.ui, color: C.charcoal, fontSize: 13, margin: '0 0 20px' }}>
              {editing.complaintNumber} — correct the details before it is categorized. Once categorized, a complaint can no longer be edited.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', gap: 12 }}>
                <label style={{ flex: 1 }}>
                  <div style={editLbl}>Complainant name</div>
                  <input style={editInput} value={form.walkInName}
                    onChange={(e) => setForm({ ...form, walkInName: e.target.value })} />
                </label>
                <label style={{ width: 160 }}>
                  <div style={editLbl}>Phone</div>
                  <input style={editInput} value={form.walkInPhone}
                    onChange={(e) => setForm({ ...form, walkInPhone: e.target.value })} />
                </label>
              </div>

              <label>
                <div style={editLbl}>Complainant address</div>
                <input style={editInput} value={form.walkInAddress}
                  onChange={(e) => setForm({ ...form, walkInAddress: e.target.value })} />
              </label>

              <div style={{ display: 'flex', gap: 12 }}>
                <label style={{ width: 180 }}>
                  <div style={editLbl}>Incident date</div>
                  <input type="date" style={editInput} value={form.incidentDate}
                    onChange={(e) => setForm({ ...form, incidentDate: e.target.value })} />
                </label>
                <label style={{ flex: 1 }}>
                  <div style={editLbl}>Incident location</div>
                  <input style={editInput} value={form.incidentLocation}
                    onChange={(e) => setForm({ ...form, incidentLocation: e.target.value })} />
                </label>
              </div>

              <label>
                <div style={editLbl}>Description</div>
                <textarea rows={4} style={{ ...editInput, resize: 'vertical' }} value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </label>
            </div>

            {update.isError && (
              <p style={{ fontFamily: FONT.ui, color: '#B91C1C', fontSize: 13, margin: '14px 0 0' }}>
                {apiError(update.error, 'Could not save changes.')}
              </p>
            )}

            <div style={{ display: 'flex', gap: 12, marginTop: 22 }}>
              <button
                onClick={() => update.mutate(editing.id)}
                disabled={update.isPending || !form.description.trim() || !form.incidentDate}
                style={{
                  padding: '10px 22px', fontFamily: FONT.ui, fontSize: 14, fontWeight: 600,
                  background: (update.isPending || !form.description.trim() || !form.incidentDate) ? '#9DB2CC' : A.accent, color: '#fff',
                  border: 'none', borderRadius: 8,
                  cursor: (update.isPending || !form.description.trim() || !form.incidentDate) ? 'not-allowed' : 'pointer',
                }}>
                {update.isPending ? 'Saving…' : 'Save changes'}
              </button>
              <button onClick={() => setEditing(null)}
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
