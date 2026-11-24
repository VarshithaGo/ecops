import { useState, useEffect } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { caseApi } from '../../api/caseApi'
import { stationsApi } from '../../api/stationsApi'
import { Station } from '../../types/admin.types'
import { useMyStation } from '../../hooks/useMyStation'
import { useNavigate } from 'react-router-dom'

const C = { angst: '#0A0A0A', kite: '#371E1E', bark: '#33312F', charcoal: '#726E68', ashes: '#B7B4AE' }

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

const inputStyle: React.CSSProperties = {
  padding: '10px 14px',
  border: `2px solid ${C.charcoal}`,
  borderRadius: 3,
  fontSize: 13,
  width: '100%',
  boxSizing: 'border-box',
  background: C.bark,
  color: C.ashes,
  fontFamily: "'Space Grotesk', system-ui, sans-serif",
  outline: 'none',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: "'Space Grotesk', system-ui, sans-serif",
  fontSize: 11,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: C.charcoal,
  marginBottom: 6,
}

const sectionHeadStyle: React.CSSProperties = {
  fontFamily: 'Anton, Impact, sans-serif',
  fontSize: 13,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: C.ashes,
  marginBottom: 14,
  paddingBottom: 8,
  borderBottom: `1px solid ${C.bark}`,
}

export function WalkInComplaintPage() {
  const [form, setForm] = useState<WalkInForm>(empty)
  const [success, setSuccess] = useState<string | null>(null)
  const navigate = useNavigate()

  const { data: stations = [], isLoading: stationsLoading, isError: stationsError, refetch: refetchStations } =
    useQuery<Station[]>({
      queryKey: ['stations'],
      queryFn: stationsApi.list,
    })
  const activeStations = stations.filter((s) => s.status === 'ACTIVE')
  const { data: myStation } = useMyStation()

  // Default the station to the logged-in officer's own station once known.
  useEffect(() => {
    if (myStation?.stationId && !form.stationId) {
      setForm((f) => ({ ...f, stationId: myStation.stationId }))
    }
  }, [myStation, form.stationId])

  const mutation = useMutation({
    mutationFn: (data: WalkInForm) => caseApi.fileWalkInComplaint(data),
    onSuccess: (complaint: { complaintNumber: string }) => {
      setSuccess(complaint.complaintNumber)
      setForm(empty)
    },
  })

  const set = (field: keyof WalkInForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }))

  const focusIn  = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    (e.target.style.borderColor = C.ashes)
  const focusOut = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    (e.target.style.borderColor = C.charcoal)

  return (
    <div style={{ padding: '32px 40px', maxWidth: 720 }}>

      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{
          fontFamily: 'Anton, Impact, sans-serif',
          fontSize: 26, letterSpacing: '0.06em',
          color: C.ashes, margin: 0, marginBottom: 6,
        }}>
          Register Walk-in Complaint
        </h2>
        <p style={{
          fontFamily: "'Space Grotesk', system-ui, sans-serif",
          color: C.charcoal, fontSize: 13, margin: 0,
        }}>
          For complainants who appear in person without a citizen portal account (BNSS 173).
        </p>
      </div>

      {/* Success banner */}
      {success && (
        <div style={{
          background: `${C.kite}cc`,
          border: `2px solid ${C.charcoal}`,
          borderRadius: 3, padding: '16px 20px', marginBottom: 28,
        }}>
          <div style={{
            fontFamily: 'Anton, Impact, sans-serif',
            fontSize: 15, letterSpacing: '0.08em', color: C.ashes, marginBottom: 4,
          }}>
            Complaint Registered
          </div>
          <div style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", color: C.charcoal, fontSize: 13 }}>
            Complaint number: <span style={{ color: C.ashes, fontWeight: 700 }}>{success}</span>
          </div>
          <button
            onClick={() => navigate('/officer/complaints')}
            style={{
              marginTop: 14, padding: '7px 20px',
              fontFamily: 'Anton, Impact, sans-serif',
              fontSize: 12, letterSpacing: '0.12em',
              background: 'transparent', color: C.ashes,
              border: `1.5px solid ${C.charcoal}`, borderRadius: 3, cursor: 'pointer',
            }}>
            GO TO COMPLAINTS INBOX
          </button>
        </div>
      )}

      <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(form) }}>

        {/* Station */}
        <section style={{ marginBottom: 28 }}>
          <div style={sectionHeadStyle}>Station</div>
          {stationsLoading ? (
            <div style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", color: C.charcoal, fontSize: 13, padding: '10px 0' }}>
              Loading stations… (services may take a moment to wake up on first use)
            </div>
          ) : stationsError ? (
            <div style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", color: '#fb923c', fontSize: 13 }}>
              Couldn’t load stations — the server may be waking up.{' '}
              <button type="button" onClick={() => refetchStations()}
                style={{ background: 'transparent', border: `1px solid ${C.charcoal}`, color: C.ashes, borderRadius: 3, padding: '2px 10px', cursor: 'pointer', fontFamily: 'inherit' }}>
                Retry
              </button>
            </div>
          ) : activeStations.length === 0 ? (
            <div style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", color: C.charcoal, fontSize: 13 }}>
              No active stations found.
            </div>
          ) : (
            <select value={form.stationId} onChange={set('stationId')} required
              style={{ ...inputStyle }}
              onFocus={focusIn} onBlur={focusOut}>
              <option value="" style={{ background: C.bark, color: C.charcoal }}>Select station</option>
              {activeStations.map((s) => (
                <option key={s.id} value={s.id} style={{ background: C.bark, color: C.ashes }}>
                  {s.stationCode} — {s.stationName}
                </option>
              ))}
            </select>
          )}
        </section>

        {/* Complainant Details */}
        <section style={{ marginBottom: 28 }}>
          <div style={sectionHeadStyle}>Complainant Details</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>Full Name *</label>
              <input value={form.walkInName} onChange={set('walkInName')} required
                style={inputStyle} placeholder="e.g. Ramesh Kumar"
                onFocus={focusIn} onBlur={focusOut} />
            </div>
            <div>
              <label style={labelStyle}>Phone</label>
              <input value={form.walkInPhone} onChange={set('walkInPhone')}
                type="tel" pattern="[0-9]{10}" title="Enter a 10-digit phone number" inputMode="numeric" maxLength={10}
                style={inputStyle} placeholder="e.g. 9876543210"
                onFocus={focusIn} onBlur={focusOut} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Address</label>
            <input value={form.walkInAddress} onChange={set('walkInAddress')}
              style={inputStyle} placeholder="Residential address"
              onFocus={focusIn} onBlur={focusOut} />
          </div>
        </section>

        {/* Incident Details */}
        <section style={{ marginBottom: 28 }}>
          <div style={sectionHeadStyle}>Incident Details</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>Incident Date *</label>
              <input type="date" value={form.incidentDate} onChange={set('incidentDate')} required
                style={{ ...inputStyle, colorScheme: 'dark' }}
                onFocus={focusIn} onBlur={focusOut} />
            </div>
            <div>
              <label style={labelStyle}>Incident Location</label>
              <input value={form.incidentLocation} onChange={set('incidentLocation')}
                style={inputStyle} placeholder="Where did it occur?"
                onFocus={focusIn} onBlur={focusOut} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Description *</label>
            <textarea
              value={form.description} onChange={set('description')} required
              rows={5}
              style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
              placeholder="Describe the incident in detail as stated by the complainant…"
              onFocus={focusIn} onBlur={focusOut}
            />
          </div>
        </section>

        {mutation.isError && (
          <div style={{
            fontFamily: "'Space Grotesk', system-ui, sans-serif",
            color: '#f87171', fontSize: 13, marginBottom: 16,
          }}>
            Failed to register complaint. Please try again.
          </div>
        )}

        <button
          type="submit"
          disabled={mutation.isPending}
          style={{
            padding: '12px 32px',
            fontFamily: 'Anton, Impact, sans-serif',
            fontSize: 14, letterSpacing: '0.14em',
            background: 'transparent',
            color: mutation.isPending ? C.charcoal : C.ashes,
            border: `2px solid ${mutation.isPending ? C.bark : C.charcoal}`,
            borderRadius: 3, cursor: mutation.isPending ? 'not-allowed' : 'pointer',
          }}>
          {mutation.isPending ? 'REGISTERING…' : 'REGISTER COMPLAINT'}
        </button>

      </form>

      {/* inject placeholder colour for dark inputs */}
      <style>{`
        input::placeholder, textarea::placeholder { color: ${C.charcoal}; opacity: 0.75; }
        select option { background: ${C.bark}; color: ${C.ashes}; }
      `}</style>
    </div>
  )
}
