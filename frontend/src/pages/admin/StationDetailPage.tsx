import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { stationsApi } from '../../api/stationsApi'
import { Station, OfficerAssignment } from '../../types/admin.types'
import { fmtDate, fmtDateTime } from '../../utils/date'
import { C, A, FONT, FIELD_BORDER } from '../../theme'

const inp: React.CSSProperties = { padding: '10px 12px', background: '#fff', color: C.ashes, border: `1.5px solid ${FIELD_BORDER}`, borderRadius: 6, fontFamily: FONT.ui, fontSize: 14, width: '100%', boxSizing: 'border-box', outline: 'none' }
const lbl: React.CSSProperties = { display: 'block', fontFamily: FONT.ui, fontSize: 13, fontWeight: 600, color: C.ashes, marginBottom: 6 }
const th: React.CSSProperties = { padding: '11px 14px', fontFamily: FONT.ui, fontSize: 12, fontWeight: 700, color: C.charcoal, textAlign: 'left', background: '#F3F6FA', borderBottom: `1px solid ${C.bark}` }
const td: React.CSSProperties = { padding: '11px 14px', fontFamily: FONT.ui, fontSize: 14, color: C.ashes, borderBottom: `1px solid ${C.bark}` }
const btnPrimary: React.CSSProperties = { padding: '9px 20px', fontFamily: FONT.ui, fontSize: 14, fontWeight: 600, background: A.accent, color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }
const btnSecondary: React.CSSProperties = { padding: '9px 20px', fontFamily: FONT.ui, fontSize: 14, fontWeight: 600, background: '#fff', color: C.ashes, border: `1px solid ${C.charcoal}66`, borderRadius: 8, cursor: 'pointer' }

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div style={{ display: 'flex', gap: 16, padding: '9px 0', borderBottom: `1px solid ${C.bark}` }}>
      <span style={{ fontFamily: FONT.ui, fontSize: 13, color: C.charcoal, minWidth: 160 }}>{label}</span>
      <span style={{ fontFamily: mono ? 'monospace' : FONT.ui, fontSize: 14, color: C.ashes }}>{value}</span>
    </div>
  )
}

export function StationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data: station, isLoading, error } = useQuery<Station>({
    queryKey: ['station', id], queryFn: () => stationsApi.get(id!), enabled: !!id,
  })
  const { data: assignments = [] } = useQuery<OfficerAssignment[]>({
    queryKey: ['station-assignments', id], queryFn: () => stationsApi.listAssignments(id!), enabled: !!id,
  })

  const deactivate = useMutation({
    mutationFn: () => stationsApi.deactivate(id!),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['stations'] }); navigate('/admin/stations') },
  })

  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ stationName: '', stationCode: '', address: '', district: '', state: '', jurisdictionArea: '' })
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const update = useMutation({
    mutationFn: () => stationsApi.update(id!, { ...form, jurisdictionArea: form.jurisdictionArea || null }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['station', id] }); qc.invalidateQueries({ queryKey: ['stations'] }); setEditing(false) },
  })

  const startEdit = (s: Station) => {
    setForm({ stationName: s.stationName, stationCode: s.stationCode, address: s.address, district: s.district, state: s.state, jurisdictionArea: s.jurisdictionArea ?? '' })
    setEditing(true)
  }

  if (isLoading) return <div style={{ padding: 32, fontFamily: FONT.ui, color: C.charcoal }}>Loading station…</div>
  if (error || !station) return <div style={{ padding: 32, fontFamily: FONT.ui, color: '#B91C1C' }}>Station not found.</div>

  const active = assignments.filter((a) => a.isActive)
  const inactive = assignments.filter((a) => !a.isActive)
  const canSave = form.stationName && form.stationCode && form.address && form.district && form.state

  return (
    <div style={{ maxWidth: 840, margin: '32px auto', padding: '0 24px', fontFamily: FONT.ui }}>
      <div style={{ background: '#fff', border: `1px solid ${C.bark}`, borderRadius: 10, padding: '24px 26px', marginBottom: 24, boxShadow: '0 1px 3px rgba(16,32,44,0.06)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.01em', color: C.ashes, margin: 0 }}>{station.stationName}</h2>
            <span style={{ fontFamily: 'monospace', fontSize: 13, color: C.charcoal }}>{station.stationCode}</span>
          </div>
          <span style={{ fontFamily: FONT.ui, fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 6, color: station.status === 'ACTIVE' ? '#15803D' : '#B91C1C', border: `1px solid ${station.status === 'ACTIVE' ? '#15803D' : '#B91C1C'}` }}>
            {station.status}
          </span>
        </div>

        {!editing ? (
          <>
            <Row label="Address" value={station.address} />
            <Row label="District" value={station.district} />
            <Row label="State" value={station.state} />
            {station.jurisdictionArea && <Row label="Jurisdiction area" value={station.jurisdictionArea} />}
            <Row label="FIR format" value={`FIR-${station.stationCode}-${new Date().getFullYear()}-XXXX`} mono />
            <Row label="Created" value={fmtDate(station.createdAt)} />
            <div style={{ marginTop: 18, paddingTop: 16, borderTop: `1px solid ${C.bark}`, display: 'flex', gap: 10 }}>
              <button onClick={() => startEdit(station)} style={btnSecondary}>Edit station</button>
              {station.status === 'ACTIVE' && (
                <button onClick={() => { if (window.confirm(`Deactivate ${station.stationName}? It will no longer accept new complaints or FIRs.`)) deactivate.mutate() }}
                  disabled={deactivate.isPending}
                  style={{ ...btnSecondary, color: '#B91C1C', borderColor: '#B91C1C66' }}>
                  {deactivate.isPending ? 'Deactivating…' : 'Deactivate station'}
                </button>
              )}
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 2 }}><label style={lbl}>Station name</label><input style={inp} value={form.stationName} onChange={set('stationName')} /></div>
              <div style={{ flex: 1 }}><label style={lbl}>Station code</label><input style={{ ...inp, fontFamily: 'monospace' }} value={form.stationCode} onChange={set('stationCode')} maxLength={20} /></div>
            </div>
            <div><label style={lbl}>Address</label><input style={inp} value={form.address} onChange={set('address')} /></div>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}><label style={lbl}>District</label><input style={inp} value={form.district} onChange={set('district')} /></div>
              <div style={{ flex: 1 }}><label style={lbl}>State</label><input style={inp} value={form.state} onChange={set('state')} /></div>
            </div>
            <div><label style={lbl}>Jurisdiction area</label><input style={inp} value={form.jurisdictionArea} onChange={set('jurisdictionArea')} /></div>
            <div style={{ fontFamily: 'monospace', fontSize: 12, color: C.charcoal }}>New FIR format: FIR-{form.stationCode || '…'}-{new Date().getFullYear()}-XXXX</div>
            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <button onClick={() => update.mutate()} disabled={update.isPending || !canSave} style={{ ...btnPrimary, background: canSave ? A.accent : '#9DB2CC' }}>
                {update.isPending ? 'Saving…' : 'Save changes'}
              </button>
              <button onClick={() => setEditing(false)} style={btnSecondary}>Cancel</button>
            </div>
            {update.isError && <div style={{ fontSize: 13, color: '#B91C1C' }}>Update failed — check the values and try again.</div>}
          </div>
        )}
      </div>

      <div style={{ background: '#fff', border: `1px solid ${C.bark}`, borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 3px rgba(16,32,44,0.06)' }}>
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.bark}`, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: C.ashes }}>Officer Assignments</span>
          <span style={{ fontSize: 13, color: C.charcoal }}>{active.length} active</span>
        </div>
        {assignments.length === 0 ? (
          <div style={{ padding: 32, fontSize: 14, color: C.charcoal, textAlign: 'center' }}>No officers assigned to this station.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr><th style={th}>Badge</th><th style={th}>Name</th><th style={th}>Rank</th><th style={th}>Status</th><th style={th}>Assigned</th></tr></thead>
            <tbody>
              {[...active, ...inactive].map((a) => (
                <tr key={a.id} style={{ opacity: a.isActive ? 1 : 0.55 }}>
                  <td style={{ ...td, fontFamily: 'monospace', fontWeight: 700 }}>{a.badgeNumber}</td>
                  <td style={td}>{a.officerName ?? '—'}</td>
                  <td style={{ ...td, color: C.charcoal }}>{a.rank ?? '—'}</td>
                  <td style={td}><span style={{ color: a.isActive ? '#15803D' : '#B91C1C', fontWeight: 600 }}>{a.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td style={{ ...td, color: C.charcoal }}>{fmtDateTime(a.assignedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
