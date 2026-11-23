import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { caseApi } from '../../api/caseApi'
import { useQuery } from '@tanstack/react-query'
import { stationsApi } from '../../api/stationsApi'
import { Station } from '../../types/admin.types'
import { Link } from 'react-router-dom'

const C = { angst: '#0A0A0A', kite: '#371E1E', bark: '#33312F', charcoal: '#726E68', ashes: '#B7B4AE' }

const inputStyle: React.CSSProperties = {
  padding: '10px 14px', background: C.bark, color: C.ashes,
  border: `2px solid ${C.charcoal}`, borderRadius: 3,
  fontFamily: "'Space Grotesk', system-ui, sans-serif",
  fontSize: 13, width: '100%', boxSizing: 'border-box', outline: 'none',
}
const labelStyle: React.CSSProperties = {
  display: 'block', fontFamily: "'Space Grotesk', system-ui, sans-serif",
  fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase',
  color: C.charcoal, marginBottom: 6,
}

const schema = z.object({
  stationId: z.string().uuid('Select a station'),
  description: z.string().min(10, 'At least 10 characters'),
  incidentDate: z.string().min(1, 'Required'),
  incidentLocation: z.string().optional(),
})
type FormData = z.infer<typeof schema>

export function FileComplaintPage() {
  const [result, setResult] = useState<{ complaintNumber: string } | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const { data: stations } = useQuery<Station[]>({ queryKey: ['stations'], queryFn: stationsApi.list })
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    setSubmitting(true)
    try { setResult(await caseApi.fileComplaint(data)) } finally { setSubmitting(false) }
  }

  if (result) {
    return (
      <div style={{ padding: '48px 24px', maxWidth: 480, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: 26, letterSpacing: '0.06em', color: C.ashes, marginBottom: 16 }}>
          Complaint Filed
        </div>
        <div style={{ fontFamily: 'monospace', fontSize: 20, color: C.ashes, background: `${C.kite}cc`, border: `2px solid ${C.charcoal}`, borderRadius: 4, padding: '14px 20px', marginBottom: 20 }}>
          {result.complaintNumber}
        </div>
        <p style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", color: C.charcoal, fontSize: 13, lineHeight: 1.7, marginBottom: 24 }}>
          Your complaint has been registered. An officer will review and categorize it shortly. If it involves a cognizable offence, an FIR will be registered and you will receive a free copy.
        </p>
        <Link to="/citizen/track" style={{
          fontFamily: 'Anton, Impact, sans-serif', fontSize: 13, letterSpacing: '0.14em',
          color: C.ashes, textDecoration: 'none',
          padding: '10px 24px', border: `2px solid ${C.charcoal}`, borderRadius: 3,
        }}>
          TRACK YOUR COMPLAINT →
        </Link>
      </div>
    )
  }

  return (
    <div style={{ padding: '32px 24px', maxWidth: 560, margin: '0 auto' }}>
      <h2 style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: 26, letterSpacing: '0.06em', color: C.ashes, margin: 0, marginBottom: 6 }}>
        File a Complaint
      </h2>
      <p style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", color: C.charcoal, fontSize: 13, marginBottom: 28, lineHeight: 1.6 }}>
        Submit a complaint to the police. The duty officer will determine whether it is a cognizable offence (FIR) or non-cognizable.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div>
          <label style={labelStyle}>Police Station *</label>
          <select {...register('stationId')} style={inputStyle}>
            <option value="">— select a station —</option>
            {stations?.map((s) => (
              <option key={s.id} value={s.id}>{s.stationCode} — {s.stationName}, {s.district}</option>
            ))}
          </select>
          {errors.stationId && <div style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", color: '#f87171', fontSize: 12, marginTop: 4 }}>{errors.stationId.message}</div>}
        </div>

        <div>
          <label style={labelStyle}>Description of Incident *</label>
          <textarea {...register('description')} rows={5} style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }} placeholder="Describe what happened…" />
          {errors.description && <div style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", color: '#f87171', fontSize: 12, marginTop: 4 }}>{errors.description.message}</div>}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={labelStyle}>Date of Incident *</label>
            <input type="date" {...register('incidentDate')} style={{ ...inputStyle, colorScheme: 'dark' }} />
            {errors.incidentDate && <div style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", color: '#f87171', fontSize: 12, marginTop: 4 }}>{errors.incidentDate.message}</div>}
          </div>
          <div>
            <label style={labelStyle}>Location <span style={{ opacity: 0.6 }}>(optional)</span></label>
            <input {...register('incidentLocation')} style={inputStyle} placeholder="Where did it occur?" />
          </div>
        </div>

        <button type="submit" disabled={submitting}
          style={{
            marginTop: 4, padding: '12px 0',
            fontFamily: 'Anton, Impact, sans-serif', fontSize: 14, letterSpacing: '0.14em',
            background: 'transparent', color: C.ashes,
            border: `2px solid ${C.charcoal}`, borderRadius: 3, cursor: submitting ? 'not-allowed' : 'pointer',
          }}>
          {submitting ? 'FILING…' : 'FILE COMPLAINT'}
        </button>
      </form>
      <style>{`input::placeholder, textarea::placeholder { color: ${C.charcoal}; opacity: 0.6; } select option { background: ${C.bark}; color: ${C.ashes}; }`}</style>
    </div>
  )
}
