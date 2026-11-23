import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { stationsApi } from '../../api/stationsApi'

const C = { angst: '#0A0A0A', kite: '#371E1E', bark: '#33312F', charcoal: '#726E68', ashes: '#B7B4AE' }

const inputStyle: React.CSSProperties = {
  padding: '10px 14px', background: C.bark, color: C.ashes,
  border: `2px solid ${C.charcoal}`, borderRadius: 3,
  fontFamily: "'Space Grotesk', system-ui, sans-serif",
  fontSize: 13, width: '100%', boxSizing: 'border-box', outline: 'none',
}
const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: "'Space Grotesk', system-ui, sans-serif",
  fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase',
  color: C.charcoal, marginBottom: 6,
}

export function AddStationPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [f, setF] = useState({ stationName: '', stationCode: '', address: '', district: '', state: '', jurisdictionArea: '' })
  const [apiError, setApiError] = useState('')
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setF((p) => ({ ...p, [k]: e.target.value }))

  const focusIn  = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => (e.target.style.borderColor = C.ashes)
  const focusOut = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => (e.target.style.borderColor = C.charcoal)

  const create = useMutation({
    mutationFn: () => stationsApi.create(f),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['stations'] }); navigate('/admin/stations') },
    onError: (e: unknown) => {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
      setApiError(msg || 'Failed to create station. Check all required fields.')
    },
  })

  const canSubmit = f.stationName && f.stationCode && f.address && f.district && f.state

  return (
    <div style={{ maxWidth: 640, margin: '32px auto', padding: '0 24px' }}>
      <h2 style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: 26, letterSpacing: '0.06em', color: C.ashes, margin: 0, marginBottom: 6 }}>
        Add Police Station
      </h2>
      <p style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", color: C.charcoal, fontSize: 13, marginBottom: 28 }}>
        Register a new station. The station code becomes part of every FIR number registered here.
      </p>

      {/* Info box */}
      <div style={{ background: `${C.kite}99`, border: `2px solid ${C.bark}`, borderRadius: 4, padding: '14px 18px', marginBottom: 28, backdropFilter: 'blur(8px)' }}>
        <div style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.charcoal, marginBottom: 8 }}>How this data connects</div>
        <ul style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", fontSize: 12, color: C.charcoal, margin: 0, paddingLeft: 18, lineHeight: 2 }}>
          <li>Station Code appears in every FIR — e.g. <span style={{ fontFamily: 'monospace', color: C.ashes }}>MH-AND</span> → <span style={{ fontFamily: 'monospace', color: C.ashes }}>FIR-MH-AND-2026-0001</span></li>
          <li>District / State are used when searching criminal records by location</li>
          <li>Officers must be assigned to a station before they can register FIRs</li>
        </ul>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div>
          <label style={labelStyle}>Station Name *</label>
          <input value={f.stationName} onChange={set('stationName')} style={inputStyle} placeholder="e.g. Andheri Police Station" onFocus={focusIn} onBlur={focusOut} />
        </div>
        <div>
          <label style={labelStyle}>Station Code * <span style={{ opacity: 0.6 }}>(max 20 chars)</span></label>
          <input value={f.stationCode} onChange={(e) => setF((p) => ({ ...p, stationCode: e.target.value.toUpperCase() }))}
            style={inputStyle} placeholder="e.g. MH-AND" maxLength={20} onFocus={focusIn} onBlur={focusOut} />
          <div style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", fontSize: 11, color: C.charcoal, marginTop: 4 }}>
            FIR format: <span style={{ fontFamily: 'monospace', color: C.ashes }}>FIR-{f.stationCode || 'CODE'}-2026-0001</span> · Cannot change once FIRs are registered.
          </div>
        </div>
        <div>
          <label style={labelStyle}>Address *</label>
          <textarea rows={2} value={f.address} onChange={set('address')} style={inputStyle} placeholder="Street address of the station building" onFocus={focusIn} onBlur={focusOut} />
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>District *</label>
            <input value={f.district} onChange={set('district')} style={inputStyle} placeholder="e.g. Mumbai Suburban" onFocus={focusIn} onBlur={focusOut} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>State *</label>
            <input value={f.state} onChange={set('state')} style={inputStyle} placeholder="e.g. Maharashtra" onFocus={focusIn} onBlur={focusOut} />
          </div>
        </div>
        <div>
          <label style={labelStyle}>Jurisdiction Area <span style={{ opacity: 0.6 }}>(optional)</span></label>
          <textarea rows={2} value={f.jurisdictionArea} onChange={set('jurisdictionArea')} style={inputStyle}
            placeholder="Neighbourhoods covered by this station, e.g. Andheri West, Versova" onFocus={focusIn} onBlur={focusOut} />
        </div>

        {apiError && <div style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", color: '#f87171', fontSize: 13 }}>{apiError}</div>}

        <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
          <button onClick={() => create.mutate()} disabled={!canSubmit || create.isPending}
            style={{
              padding: '11px 28px', fontFamily: 'Anton, Impact, sans-serif', fontSize: 13, letterSpacing: '0.14em',
              background: 'transparent', color: canSubmit ? C.ashes : C.charcoal,
              border: `2px solid ${canSubmit ? C.charcoal : C.bark}`, borderRadius: 3, cursor: canSubmit ? 'pointer' : 'not-allowed',
            }}>
            {create.isPending ? 'CREATING…' : 'CREATE STATION'}
          </button>
          <button onClick={() => navigate('/admin/stations')}
            style={{ padding: '11px 20px', fontFamily: 'Anton, Impact, sans-serif', fontSize: 13, letterSpacing: '0.14em', background: 'transparent', color: C.charcoal, border: `2px solid ${C.bark}`, borderRadius: 3, cursor: 'pointer' }}>
            CANCEL
          </button>
        </div>
      </div>
      <style>{`input::placeholder, textarea::placeholder { color: ${C.charcoal}; opacity: 0.6; }`}</style>
    </div>
  )
}
