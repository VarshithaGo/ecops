import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { caseApi } from '../../api/caseApi'
import { useQuery } from '@tanstack/react-query'
import { stationsApi } from '../../api/stationsApi'
import { Station } from '../../types/admin.types'
import { Link } from 'react-router-dom'
import { C, A, FONT, FIELD_BORDER } from '../../theme'

const inputStyle: React.CSSProperties = {
  padding: '10px 12px', background: '#fff', color: C.ashes,
  border: `1.5px solid ${FIELD_BORDER}`, borderRadius: 6,
  fontFamily: FONT.ui, fontSize: 14, width: '100%', boxSizing: 'border-box', outline: 'none',
}
const labelStyle: React.CSSProperties = { display: 'block', fontFamily: FONT.ui, fontSize: 13, fontWeight: 600, color: C.ashes, marginBottom: 6 }
const errStyle: React.CSSProperties = { fontFamily: FONT.ui, color: '#B91C1C', fontSize: 12, marginTop: 4 }

const LANGUAGES = ['English', 'हिन्दी (Hindi)', 'ಕನ್ನಡ (Kannada)', 'தமிழ் (Tamil)', 'తెలుగు (Telugu)', 'मराठी (Marathi)', 'বাংলা (Bengali)', 'اردو (Urdu)', 'Other']

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
  const [language, setLanguage] = useState('English')
  const { data: stations } = useQuery<Station[]>({ queryKey: ['stations'], queryFn: stationsApi.list })
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    setSubmitting(true)
    // Citizens may write in any language; tag it so the officer knows.
    const description = language === 'English' ? data.description : `[${language}] ${data.description}`
    try { setResult(await caseApi.fileComplaint({ ...data, description })) } finally { setSubmitting(false) }
  }

  if (result) {
    return (
      <div style={{ padding: '48px 24px', maxWidth: 480, margin: '0 auto', textAlign: 'center', fontFamily: FONT.ui }}>
        <div style={{ fontSize: 24, fontWeight: 700, color: C.ashes, marginBottom: 16 }}>Complaint filed</div>
        <div style={{ fontFamily: 'monospace', fontSize: 20, fontWeight: 700, color: C.ashes, background: '#ECFDF3', border: '1px solid #ABEFC6', borderRadius: 8, padding: '14px 20px', marginBottom: 20 }}>
          {result.complaintNumber}
        </div>
        <p style={{ color: C.charcoal, fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>
          Your complaint has been registered. An officer will review and categorize it shortly. If it is a cognizable offence, an FIR will be registered and you will receive a free copy.
        </p>
        <Link to="/citizen/track" style={{ fontFamily: FONT.ui, fontSize: 14, fontWeight: 600, color: '#fff', textDecoration: 'none', padding: '11px 22px', background: A.accent, borderRadius: 8 }}>
          Track your complaint →
        </Link>
      </div>
    )
  }

  return (
    <div style={{ padding: '32px 24px', maxWidth: 560, margin: '0 auto', fontFamily: FONT.ui }}>
      <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.01em', color: C.ashes, margin: 0 }}>File a Complaint</h2>
      <p style={{ color: C.charcoal, fontSize: 14, margin: '6px 0 24px', lineHeight: 1.6 }}>
        Submit a complaint to the police. The duty officer will determine whether it is a cognizable offence (FIR) or non-cognizable. You may write it in any language.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div>
          <label style={labelStyle}>Police station *</label>
          <select {...register('stationId')} style={inputStyle}>
            <option value="">— select a station —</option>
            {stations?.map((s) => <option key={s.id} value={s.id}>{s.stationCode} — {s.stationName}, {s.district}</option>)}
          </select>
          {errors.stationId && <div style={errStyle}>{errors.stationId.message}</div>}
        </div>

        <div>
          <label style={labelStyle}>Language of complaint</label>
          <select value={language} onChange={(e) => setLanguage(e.target.value)} style={inputStyle}>
            {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>

        <div>
          <label style={labelStyle}>Description of incident *</label>
          <textarea {...register('description')} rows={5} style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }} placeholder="Describe what happened — in your own language…" />
          {errors.description && <div style={errStyle}>{errors.description.message}</div>}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={labelStyle}>Date of incident *</label>
            <input type="date" max={new Date().toISOString().slice(0, 10)} {...register('incidentDate')} style={inputStyle} />
            {errors.incidentDate && <div style={errStyle}>{errors.incidentDate.message}</div>}
          </div>
          <div>
            <label style={labelStyle}>Location <span style={{ color: C.charcoal, fontWeight: 400 }}>(optional)</span></label>
            <input {...register('incidentLocation')} style={inputStyle} placeholder="Where did it occur?" />
          </div>
        </div>

        <button type="submit" disabled={submitting}
          style={{ marginTop: 4, padding: '12px 0', fontFamily: FONT.ui, fontSize: 15, fontWeight: 600, background: submitting ? '#9DB2CC' : A.accent, color: '#fff', border: 'none', borderRadius: 8, cursor: submitting ? 'not-allowed' : 'pointer' }}>
          {submitting ? 'Filing…' : 'File complaint'}
        </button>
      </form>
    </div>
  )
}
