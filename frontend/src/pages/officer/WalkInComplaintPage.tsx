import { useEffect, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { caseApi } from '../../api/caseApi'
import { stationsApi } from '../../api/stationsApi'
import { useNavigate } from 'react-router-dom'
import { useCurrentOfficer } from '../../hooks/useCurrentOfficer'
import { apiError } from '../../utils/apiError'
import { C, A, FONT, FIELD_BORDER, FIELD_BORDER_ERR } from '../../theme'

interface WalkInForm {
  stationId: string
  walkInName: string
  walkInPhone: string
  walkInAddress: string
  description: string
  incidentDate: string
  incidentLocation: string
}

const empty: WalkInForm = {
  stationId: '', walkInName: '', walkInPhone: '', walkInAddress: '',
  description: '', incidentDate: '', incidentLocation: '',
}

type Errors = Partial<Record<keyof WalkInForm, string>>

function validate(f: WalkInForm): Errors {
  const e: Errors = {}
  if (!f.stationId) e.stationId = 'Station is required.'
  if (!f.walkInName.trim()) e.walkInName = "Complainant's name is required."
  if (f.walkInPhone && !/^\d{10}$/.test(f.walkInPhone.trim()))
    e.walkInPhone = 'Phone must be 10 digits.'
  if (!f.incidentDate) e.incidentDate = 'Incident date is required.'
  else if (f.incidentDate > new Date().toISOString().slice(0, 10))
    e.incidentDate = 'Incident date cannot be in the future.'
  if (!f.description.trim()) e.description = 'Description is required.'
  else if (f.description.trim().length < 10)
    e.description = 'Please give at least a brief description (10+ characters).'
  return e
}

function apiErrorMsg(err: unknown): string {
  return apiError(err, 'Could not register the complaint. Please check the details and try again.')
}

const label: React.CSSProperties = { display: 'block', fontFamily: FONT.ui, fontSize: 13, fontWeight: 600, color: C.ashes, marginBottom: 6 }
const errText: React.CSSProperties = { fontFamily: FONT.ui, fontSize: 12, color: '#B91C1C', marginTop: 4 }
const sectionHead: React.CSSProperties = { fontFamily: FONT.ui, fontSize: 13, fontWeight: 700, color: C.ashes, marginBottom: 14, paddingBottom: 8, borderBottom: `1px solid ${C.bark}` }

function inputStyle(error?: boolean): React.CSSProperties {
  return {
    padding: '10px 12px', border: `1.5px solid ${error ? FIELD_BORDER_ERR : FIELD_BORDER}`,
    borderRadius: 6, fontSize: 14, width: '100%', boxSizing: 'border-box',
    background: '#fff', color: C.ashes, fontFamily: FONT.ui, outline: 'none',
  }
}

export function WalkInComplaintPage() {
  const navigate = useNavigate()
  const { stationId, stationName, stationCode, hasAssignment } = useCurrentOfficer()

  const [form, setForm] = useState<WalkInForm>(empty)
  const [errors, setErrors] = useState<Errors>({})
  const [success, setSuccess] = useState<string | null>(null)

  // Pre-fill the officer's own station and lock it.
  useEffect(() => {
    if (stationId) setForm((f) => (f.stationId ? f : { ...f, stationId }))
  }, [stationId])

  // Admins (who may not be tied to one station) still get a picker.
  const { data: stations = [] } = useQuery<Array<{ id: string; stationCode: string; stationName?: string; name?: string }>>({
    queryKey: ['stations'],
    queryFn: stationsApi.list,
    enabled: !hasAssignment,
  })

  const mutation = useMutation({
    mutationFn: (data: WalkInForm) => caseApi.fileWalkInComplaint(data),
    onSuccess: (complaint: { complaintNumber: string }) => {
      setSuccess(complaint.complaintNumber)
      setForm({ ...empty, stationId: stationId ?? '' })
      setErrors({})
    },
  })

  const set = (field: keyof WalkInForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm((f) => ({ ...f, [field]: e.target.value }))
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate(form)
    setErrors(errs)
    if (Object.keys(errs).length === 0) mutation.mutate(form)
  }

  return (
    <div style={{ padding: '32px 24px', maxWidth: 720, margin: '0 auto', fontFamily: FONT.ui }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.01em', color: C.ashes, margin: 0 }}>
          Register walk-in complaint
        </h2>
        <p style={{ color: C.charcoal, fontSize: 14, margin: '6px 0 0' }}>
          For complainants who appear in person without a citizen-portal account (BNSS §173).
        </p>
      </div>

      {success && (
        <div style={{ background: '#ECFDF3', border: '1px solid #ABEFC6', borderRadius: 8, padding: '16px 18px', marginBottom: 24 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#15803D', marginBottom: 4 }}>Complaint registered</div>
          <div style={{ fontSize: 14, color: C.ashes }}>
            Complaint number: <span style={{ fontWeight: 700 }}>{success}</span>
          </div>
          <button onClick={() => navigate('/officer/complaints')}
            style={{ marginTop: 14, padding: '8px 16px', fontSize: 13, fontWeight: 600, background: '#fff', color: C.ashes, border: `1px solid ${C.charcoal}66`, borderRadius: 6, cursor: 'pointer' }}>
            Go to complaints inbox
          </button>
        </div>
      )}

      <form onSubmit={submit} noValidate>
        {/* Station — locked to the officer's own station */}
        <section style={{ marginBottom: 26 }}>
          <div style={sectionHead}>Station</div>
          {hasAssignment ? (
            <div>
              <label style={label}>Registering station</label>
              <div style={{ ...inputStyle(), background: '#F1F4F8', color: C.ashes, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600 }}>{stationName} <span style={{ color: C.charcoal, fontWeight: 400 }}>({stationCode})</span></span>
                <span style={{ fontSize: 11, color: C.charcoal }}>🔒 your station</span>
              </div>
            </div>
          ) : (
            <div>
              <label style={label}>Station *</label>
              <select value={form.stationId} onChange={set('stationId')} style={inputStyle(!!errors.stationId)}>
                <option value="">Select station</option>
                {stations.map((s) => (
                  <option key={s.id} value={s.id}>{s.stationCode} — {s.stationName ?? s.name}</option>
                ))}
              </select>
              {errors.stationId && <div style={errText}>{errors.stationId}</div>}
            </div>
          )}
        </section>

        {/* Complainant */}
        <section style={{ marginBottom: 26 }}>
          <div style={sectionHead}>Complainant details</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={label}>Full name *</label>
              <input value={form.walkInName} onChange={set('walkInName')} style={inputStyle(!!errors.walkInName)} placeholder="e.g. Ramesh Kumar" />
              {errors.walkInName && <div style={errText}>{errors.walkInName}</div>}
            </div>
            <div>
              <label style={label}>Phone</label>
              <input value={form.walkInPhone} onChange={set('walkInPhone')} inputMode="numeric" maxLength={10} style={inputStyle(!!errors.walkInPhone)} placeholder="10-digit mobile" />
              {errors.walkInPhone && <div style={errText}>{errors.walkInPhone}</div>}
            </div>
          </div>
          <div>
            <label style={label}>Address</label>
            <input value={form.walkInAddress} onChange={set('walkInAddress')} style={inputStyle()} placeholder="Residential address" />
          </div>
        </section>

        {/* Incident */}
        <section style={{ marginBottom: 26 }}>
          <div style={sectionHead}>Incident details</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={label}>Incident date *</label>
              <input type="date" max={new Date().toISOString().slice(0, 10)} value={form.incidentDate} onChange={set('incidentDate')} style={inputStyle(!!errors.incidentDate)} />
              {errors.incidentDate && <div style={errText}>{errors.incidentDate}</div>}
            </div>
            <div>
              <label style={label}>Incident location</label>
              <input value={form.incidentLocation} onChange={set('incidentLocation')} style={inputStyle()} placeholder="Where did it occur?" />
            </div>
          </div>
          <div>
            <label style={label}>Description *</label>
            <textarea value={form.description} onChange={set('description')} rows={5}
              style={{ ...inputStyle(!!errors.description), resize: 'vertical', lineHeight: 1.6 }}
              placeholder="Describe the incident as stated by the complainant…" />
            {errors.description && <div style={errText}>{errors.description}</div>}
          </div>
        </section>

        {mutation.isError && (
          <div style={{ background: '#FEF3F2', border: '1px solid #FECDCA', color: '#B91C1C', borderRadius: 8, padding: '12px 16px', fontSize: 13, marginBottom: 16 }}>
            {apiErrorMsg(mutation.error)}
          </div>
        )}

        <button type="submit" disabled={mutation.isPending}
          style={{ padding: '12px 24px', fontSize: 14, fontWeight: 600, background: mutation.isPending ? '#9DB2CC' : A.accent, color: '#fff', border: 'none', borderRadius: 8, cursor: mutation.isPending ? 'not-allowed' : 'pointer' }}>
          {mutation.isPending ? 'Registering…' : 'Register complaint'}
        </button>
      </form>
    </div>
  )
}
