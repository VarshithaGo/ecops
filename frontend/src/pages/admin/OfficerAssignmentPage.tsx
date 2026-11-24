import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { stationsApi } from '../../api/stationsApi'
import { Station, OfficerAssignment } from '../../types/admin.types'
import { useState } from 'react'
import { C, A, FONT, FIELD_BORDER } from '../../theme'

const label: React.CSSProperties = { display: 'block', fontFamily: FONT.ui, fontSize: 13, fontWeight: 600, color: C.ashes, marginBottom: 6 }
const errText: React.CSSProperties = { fontFamily: FONT.ui, fontSize: 12, color: '#B91C1C', marginTop: 4 }
const inp: React.CSSProperties = { padding: '10px 12px', background: '#fff', color: C.ashes, border: `1.5px solid ${FIELD_BORDER}`, borderRadius: 6, fontFamily: FONT.ui, fontSize: 14, width: '100%', boxSizing: 'border-box', outline: 'none' }
const card: React.CSSProperties = { background: '#fff', border: `1px solid ${C.bark}`, borderRadius: 10, padding: '22px 24px', boxShadow: '0 1px 3px rgba(16,32,44,0.06)' }
const th: React.CSSProperties = { padding: '11px 14px', fontFamily: FONT.ui, fontSize: 12, fontWeight: 700, color: C.charcoal, textAlign: 'left', background: '#F3F6FA', borderBottom: `1px solid ${C.bark}` }
const td: React.CSSProperties = { padding: '11px 14px', fontFamily: FONT.ui, fontSize: 14, color: C.ashes, borderBottom: `1px solid ${C.bark}` }

const RANKS = ['Inspector', 'Sub-Inspector', 'Assistant Sub-Inspector', 'Head Constable', 'Constable']

interface RegForm { firstName: string; lastName: string; rank: string; badgeNumber: string; stationId: string }
const EMPTY: RegForm = { firstName: '', lastName: '', rank: 'Sub-Inspector', badgeNumber: '', stationId: '' }

interface RegResult { username: string; tempPassword: string; officerName: string; badgeNumber: string; stationName: string; stationCode: string }

function apiError(err: unknown): string {
  const e = err as { response?: { data?: { message?: string; error?: string } } }
  return e?.response?.data?.message || e?.response?.data?.error || 'Could not register the officer. Please try again.'
}

export function OfficerAssignmentPage() {
  const qc = useQueryClient()
  const { data: stations = [], isLoading } = useQuery<Station[]>({ queryKey: ['stations'], queryFn: stationsApi.list })
  const [selectedStation, setSelectedStation] = useState<string>('')

  const { data: assignments = [], isLoading: loadingAssignments } = useQuery<OfficerAssignment[]>({
    queryKey: ['assignments', selectedStation],
    queryFn: () => stationsApi.listAssignments(selectedStation),
    enabled: !!selectedStation,
  })

  const [form, setForm] = useState<RegForm>(EMPTY)
  const [errors, setErrors] = useState<Partial<Record<keyof RegForm, string>>>({})
  const [result, setResult] = useState<RegResult | null>(null)
  const set = (k: keyof RegForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value })); setErrors((p) => ({ ...p, [k]: undefined }))
  }

  const register = useMutation({
    mutationFn: (data: RegForm) => stationsApi.registerOfficer(data) as Promise<RegResult>,
    onSuccess: (res) => {
      setResult(res); setForm(EMPTY)
      qc.invalidateQueries({ queryKey: ['assignments'] })
    },
  })

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const errs: Partial<Record<keyof RegForm, string>> = {}
    if (!form.firstName.trim()) errs.firstName = 'First name is required.'
    if (!form.badgeNumber.trim()) errs.badgeNumber = 'Badge number is required.'
    if (!form.stationId) errs.stationId = 'Select a station.'
    setErrors(errs)
    if (Object.keys(errs).length === 0) { setResult(null); register.mutate(form) }
  }

  if (isLoading) return <div style={{ padding: 32, fontFamily: FONT.ui, color: C.charcoal }}>Loading stations…</div>

  return (
    <div style={{ padding: '32px 24px', maxWidth: 1000, margin: '0 auto', fontFamily: FONT.ui }}>
      <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.01em', color: C.ashes, margin: 0 }}>Officer Assignments</h2>
      <p style={{ color: C.charcoal, fontSize: 14, margin: '6px 0 24px' }}>
        Register an officer and assign them to a station. A login is created automatically.
      </p>

      {/* Register officer */}
      <div style={{ ...card, marginBottom: 28 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: C.ashes, marginBottom: 16 }}>Register &amp; assign officer</div>

        {result && (
          <div style={{ background: '#ECFDF3', border: '1px solid #ABEFC6', borderRadius: 8, padding: '16px 18px', marginBottom: 18 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#15803D', marginBottom: 8 }}>
              Officer registered — share these credentials
            </div>
            <div style={{ fontSize: 14, color: C.ashes, lineHeight: 1.8 }}>
              <div><strong>{result.officerName}</strong> · {result.badgeNumber} · {result.stationName} ({result.stationCode})</div>
              <div>Username: <code style={{ background: '#fff', padding: '2px 8px', borderRadius: 4, border: `1px solid ${C.bark}`, fontWeight: 700 }}>{result.username}</code></div>
              <div>Password: <code style={{ background: '#fff', padding: '2px 8px', borderRadius: 4, border: `1px solid ${C.bark}`, fontWeight: 700 }}>{result.tempPassword}</code></div>
            </div>
          </div>
        )}

        <form onSubmit={submit} noValidate>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={label}>First name *</label>
              <input value={form.firstName} onChange={set('firstName')} style={inp} placeholder="e.g. Kumar" />
              {errors.firstName && <div style={errText}>{errors.firstName}</div>}
              <div style={{ fontSize: 12, color: C.charcoal, marginTop: 4 }}>
                Login will be <code>officer_{(form.firstName.trim().toLowerCase().replace(/[^a-z0-9]/g, '') || 'name')}</code>, password <code>{(form.firstName.trim().toLowerCase().replace(/[^a-z0-9]/g, '') || 'name')}@12</code>
              </div>
            </div>
            <div>
              <label style={label}>Last name</label>
              <input value={form.lastName} onChange={set('lastName')} style={inp} placeholder="(optional)" />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 18 }}>
            <div>
              <label style={label}>Rank</label>
              <select value={form.rank} onChange={set('rank')} style={inp}>
                {RANKS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label style={label}>Badge number *</label>
              <input value={form.badgeNumber} onChange={set('badgeNumber')} style={inp} placeholder="e.g. KA-BLR-0007" />
              {errors.badgeNumber && <div style={errText}>{errors.badgeNumber}</div>}
            </div>
            <div>
              <label style={label}>Station *</label>
              <select value={form.stationId} onChange={set('stationId')} style={inp}>
                <option value="">Select station</option>
                {stations.map((s) => <option key={s.id} value={s.id}>{s.stationCode} — {s.stationName}</option>)}
              </select>
              {errors.stationId && <div style={errText}>{errors.stationId}</div>}
            </div>
          </div>

          {register.isError && (
            <div style={{ background: '#FEF3F2', border: '1px solid #FECDCA', color: '#B91C1C', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 14 }}>
              {apiError(register.error)}
            </div>
          )}

          <button type="submit" disabled={register.isPending}
            style={{ padding: '10px 22px', fontSize: 14, fontWeight: 600, background: register.isPending ? '#9DB2CC' : A.accent, color: '#fff', border: 'none', borderRadius: 8, cursor: register.isPending ? 'not-allowed' : 'pointer' }}>
            {register.isPending ? 'Registering…' : 'Register officer'}
          </button>
        </form>
      </div>

      {/* View assignments by station */}
      <div style={{ marginBottom: 16 }}>
        <label style={label}>View officers at station</label>
        <select value={selectedStation} onChange={(e) => setSelectedStation(e.target.value)} style={{ ...inp, maxWidth: 360 }}>
          <option value="">— choose a station —</option>
          {stations.map((s) => <option key={s.id} value={s.id}>{s.stationCode} — {s.stationName}</option>)}
        </select>
      </div>

      {selectedStation && (
        <div style={{ border: `1px solid ${C.bark}`, borderRadius: 10, overflow: 'hidden', background: '#fff', boxShadow: '0 1px 3px rgba(16,32,44,0.06)' }}>
          {loadingAssignments ? (
            <div style={{ padding: 24, color: C.charcoal }}>Loading assignments…</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr><th style={th}>Badge</th><th style={th}>Name</th><th style={th}>Rank</th><th style={th}>Since</th><th style={th}>Active</th></tr>
              </thead>
              <tbody>
                {assignments.map((a) => (
                  <tr key={a.id}>
                    <td style={{ ...td, fontFamily: 'monospace', fontWeight: 700 }}>{a.badgeNumber}</td>
                    <td style={td}>{a.officerName ?? '—'}</td>
                    <td style={{ ...td, color: C.charcoal }}>{a.rank ?? '—'}</td>
                    <td style={{ ...td, color: C.charcoal }}>{new Date(a.assignedAt).toLocaleDateString('en-IN')}</td>
                    <td style={td}><span style={{ color: a.isActive ? '#15803D' : '#B91C1C', fontWeight: 600 }}>{a.isActive ? 'Yes' : 'No'}</span></td>
                  </tr>
                ))}
                {assignments.length === 0 && (
                  <tr><td colSpan={5} style={{ ...td, textAlign: 'center', color: C.charcoal, padding: 32 }}>No assignments for this station.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}
