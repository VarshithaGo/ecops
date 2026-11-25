import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { stationsApi } from '../../api/stationsApi'
import { C, A, FONT, FIELD_BORDER } from '../../theme'

const inputStyle: React.CSSProperties = {
  padding: '10px 12px', background: '#fff', color: C.ashes,
  border: `1.5px solid ${FIELD_BORDER}`, borderRadius: 6,
  fontFamily: FONT.ui, fontSize: 14, width: '100%', boxSizing: 'border-box', outline: 'none',
}
const labelStyle: React.CSSProperties = { display: 'block', fontFamily: FONT.ui, fontSize: 13, fontWeight: 600, color: C.ashes, marginBottom: 6 }

// Spring ProblemDetail puts the message in `detail`; other handlers use message/error.
function apiError(e: unknown): string {
  const d = (e as { response?: { data?: { detail?: string; message?: string; error?: string } } })?.response?.data
  return d?.detail || d?.message || d?.error || 'Failed to create station. Check all required fields.'
}

export function AddStationPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [f, setF] = useState({ stationName: '', stationCode: '', address: '', district: '', state: '', jurisdictionArea: '' })
  const [err, setErr] = useState('')
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF((p) => ({ ...p, [k]: e.target.value }))

  const create = useMutation({
    mutationFn: () => stationsApi.create(f),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['stations'] }); navigate('/admin/stations') },
    onError: (e: unknown) => setErr(apiError(e)),
  })

  const canSubmit = f.stationName && f.stationCode && f.address && f.district && f.state

  return (
    <div style={{ maxWidth: 640, margin: '32px auto', padding: '0 24px', fontFamily: FONT.ui }}>
      <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.01em', color: C.ashes, margin: 0 }}>Add Police Station</h2>
      <p style={{ color: C.charcoal, fontSize: 14, margin: '6px 0 20px' }}>
        Register a new station. The station code becomes part of every FIR number registered here, and must be unique.
      </p>

      <div style={{ background: '#fff', border: `1px solid ${C.bark}`, borderRadius: 10, padding: '14px 18px', marginBottom: 24, boxShadow: '0 1px 3px rgba(16,32,44,0.06)' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.ashes, marginBottom: 8 }}>How this data connects</div>
        <ul style={{ fontSize: 13, color: C.charcoal, margin: 0, paddingLeft: 18, lineHeight: 1.9 }}>
          <li>Station code appears in every FIR — e.g. <span style={{ fontFamily: 'monospace', color: C.ashes }}>BLR-HSR</span> → <span style={{ fontFamily: 'monospace', color: C.ashes }}>FIR-BLR-HSR-2026-0001</span></li>
          <li>District / State are used when searching criminal records by location</li>
          <li>Officers must be assigned to a station before they can register FIRs</li>
        </ul>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={labelStyle}>Station name *</label>
          <input value={f.stationName} onChange={set('stationName')} style={inputStyle} placeholder="e.g. HSR Layout Police Station" />
        </div>
        <div>
          <label style={labelStyle}>Station code * <span style={{ color: C.charcoal, fontWeight: 400 }}>(max 20 chars, unique)</span></label>
          <input value={f.stationCode} onChange={(e) => setF((p) => ({ ...p, stationCode: e.target.value.toUpperCase() }))}
            style={inputStyle} placeholder="e.g. BLR-HSR" maxLength={20} />
          <div style={{ fontSize: 12, color: C.charcoal, marginTop: 4 }}>
            FIR format: <span style={{ fontFamily: 'monospace', color: C.ashes }}>FIR-{f.stationCode || 'CODE'}-2026-0001</span>
          </div>
        </div>
        <div>
          <label style={labelStyle}>Address *</label>
          <textarea rows={2} value={f.address} onChange={set('address')} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Street address of the station building" />
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ flex: 1 }}><label style={labelStyle}>District *</label><input value={f.district} onChange={set('district')} style={inputStyle} placeholder="e.g. Bengaluru Urban" /></div>
          <div style={{ flex: 1 }}><label style={labelStyle}>State *</label><input value={f.state} onChange={set('state')} style={inputStyle} placeholder="e.g. Karnataka" /></div>
        </div>
        <div>
          <label style={labelStyle}>Jurisdiction area <span style={{ color: C.charcoal, fontWeight: 400 }}>(optional)</span></label>
          <textarea rows={2} value={f.jurisdictionArea} onChange={set('jurisdictionArea')} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Neighbourhoods covered, e.g. HSR Sector 1–7, Agara" />
        </div>

        {err && <div style={{ background: '#FEF3F2', border: '1px solid #FECDCA', color: '#B91C1C', borderRadius: 8, padding: '10px 14px', fontSize: 13 }}>{err}</div>}

        <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
          <button onClick={() => { setErr(''); create.mutate() }} disabled={!canSubmit || create.isPending}
            style={{ padding: '11px 24px', fontFamily: FONT.ui, fontSize: 14, fontWeight: 600, background: canSubmit ? A.accent : '#9DB2CC', color: '#fff', border: 'none', borderRadius: 8, cursor: canSubmit ? 'pointer' : 'not-allowed' }}>
            {create.isPending ? 'Creating…' : 'Create station'}
          </button>
          <button onClick={() => navigate('/admin/stations')}
            style={{ padding: '11px 20px', fontFamily: FONT.ui, fontSize: 14, fontWeight: 600, background: '#fff', color: C.ashes, border: `1px solid ${C.charcoal}66`, borderRadius: 8, cursor: 'pointer' }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
