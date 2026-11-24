import { INDIAN_STATES, districtsOf } from '../data/india'
import { C, FONT, FIELD_BORDER, FIELD_BORDER_ERR } from '../theme'

const labelStyle: React.CSSProperties = {
  display: 'block', fontFamily: FONT.ui, fontSize: 13, fontWeight: 600,
  color: C.ashes, marginBottom: 6,
}

function selectStyle(error?: boolean, disabled?: boolean): React.CSSProperties {
  return {
    width: '100%', boxSizing: 'border-box',
    padding: '10px 12px', borderRadius: 6,
    border: `1.5px solid ${error ? FIELD_BORDER_ERR : FIELD_BORDER}`,
    fontFamily: FONT.ui, fontSize: 14,
    background: disabled ? '#F1F4F8' : '#fff',
    color: disabled ? C.charcoal : C.ashes,
    outline: 'none',
  }
}

const errText: React.CSSProperties = {
  fontFamily: FONT.ui, fontSize: 12, color: '#B91C1C', marginTop: 4,
}

interface Props {
  state: string
  district: string
  onState: (v: string) => void
  onDistrict: (v: string) => void
  required?: boolean
  stateError?: string
  districtError?: string
  disabled?: boolean
}

/** Two dependent dropdowns: pick a state, then a district within that state. */
export function StateDistrictSelect({
  state, district, onState, onDistrict,
  required, stateError, districtError, disabled,
}: Props) {
  const districts = districtsOf(state)

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      <div>
        <label style={labelStyle}>State{required && ' *'}</label>
        <select
          value={state}
          disabled={disabled}
          onChange={(e) => { onState(e.target.value); onDistrict('') }}
          style={selectStyle(!!stateError, disabled)}
        >
          <option value="">Select state</option>
          {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        {stateError && <div style={errText}>{stateError}</div>}
      </div>

      <div>
        <label style={labelStyle}>District{required && ' *'}</label>
        <select
          value={district}
          disabled={disabled || !state}
          onChange={(e) => onDistrict(e.target.value)}
          style={selectStyle(!!districtError, disabled || !state)}
        >
          <option value="">{state ? 'Select district' : 'Select a state first'}</option>
          {districts.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        {districtError && <div style={errText}>{districtError}</div>}
      </div>
    </div>
  )
}
