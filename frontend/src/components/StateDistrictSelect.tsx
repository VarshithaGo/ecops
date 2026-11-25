import { useId } from 'react'
import { INDIAN_STATES, districtsOf } from '../data/india'
import { C, FONT, FIELD_BORDER, FIELD_BORDER_ERR } from '../theme'

const labelStyle: React.CSSProperties = {
  display: 'block', fontFamily: FONT.ui, fontSize: 13, fontWeight: 600,
  color: C.ashes, marginBottom: 6,
}

function inputStyle(error?: boolean): React.CSSProperties {
  return {
    width: '100%', boxSizing: 'border-box',
    padding: '10px 12px', borderRadius: 6,
    border: `1.5px solid ${error ? FIELD_BORDER_ERR : FIELD_BORDER}`,
    fontFamily: FONT.ui, fontSize: 14, background: '#fff', color: C.ashes, outline: 'none',
  }
}

const errText: React.CSSProperties = { fontFamily: FONT.ui, fontSize: 12, color: '#B91C1C', marginTop: 4 }

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

/**
 * State + District as searchable, type-ahead comboboxes (native <datalist>).
 * Suggestions filter as you type; the district list narrows to the chosen state —
 * but you can always type your own value, and the district field is never blocked.
 */
export function StateDistrictSelect({
  state, district, onState, onDistrict,
  required, stateError, districtError, disabled,
}: Props) {
  const uid = useId()
  const districts = districtsOf(state)

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      <div>
        <label style={labelStyle}>State{required && ' *'}</label>
        <input
          list={`${uid}-states`}
          value={state}
          disabled={disabled}
          onChange={(e) => { onState(e.target.value); onDistrict('') }}
          placeholder="Type or pick a state"
          style={inputStyle(!!stateError)}
          autoComplete="off"
        />
        <datalist id={`${uid}-states`}>
          {INDIAN_STATES.map((s) => <option key={s} value={s} />)}
        </datalist>
        {stateError && <div style={errText}>{stateError}</div>}
      </div>

      <div>
        <label style={labelStyle}>District{required && ' *'}</label>
        <input
          list={`${uid}-districts`}
          value={district}
          disabled={disabled}
          onChange={(e) => onDistrict(e.target.value)}
          placeholder={state ? 'Type or pick a district' : 'Type a district (pick a state to filter)'}
          style={inputStyle(!!districtError)}
          autoComplete="off"
        />
        <datalist id={`${uid}-districts`}>
          {districts.map((d) => <option key={d} value={d} />)}
        </datalist>
        {districtError && <div style={errText}>{districtError}</div>}
      </div>
    </div>
  )
}
