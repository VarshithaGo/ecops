import { useState, useRef, useMemo } from 'react'
import { BNS_SECTIONS } from '../data/bnsSections'
import { C, A, FONT, FIELD_BORDER } from '../theme'

const lbl: React.CSSProperties = { display: 'block', fontFamily: FONT.ui, fontSize: 13, fontWeight: 600, color: C.ashes, marginBottom: 6 }

interface Props {
  value: string                       // comma-separated, e.g. "BNS 303, BNS 318"
  onChange: (v: string) => void
  label?: string
}

/**
 * Searchable multi-select for BNS/IPC sections used on a charge sheet.
 * - Type to search by BNS code, offence title, or IPC number.
 * - Click a suggestion to add it; selected sections show as removable chips.
 * - You can still type a custom value (e.g. a subsection "BNS 303(2)") and press Enter —
 *   manual entry is never blocked.
 */
export function SectionSelect({ value, onChange, label = 'Sections invoked (BNS / IPC)' }: Props) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const selected = value.split(',').map((s) => s.trim()).filter(Boolean)

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase()
    return BNS_SECTIONS
      .filter((s) => !selected.includes(s.code))
      .filter((s) => !q
        || s.code.toLowerCase().includes(q)
        || s.title.toLowerCase().includes(q)
        || s.ipc.toLowerCase().includes(q))
      .slice(0, 8)
  }, [query, selected])

  const commit = (list: string[]) => onChange(list.join(', '))

  const add = (code: string) => {
    const token = code.trim()
    if (!token || selected.includes(token)) { setQuery(''); return }
    commit([...selected, token])
    setQuery('')
  }
  const remove = (code: string) => commit(selected.filter((s) => s !== code))

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (suggestions.length > 0 && query.trim()) add(suggestions[0].code)
      else if (query.trim()) add(query)              // custom entry (e.g. "BNS 303(2)")
    } else if (e.key === 'Backspace' && !query && selected.length) {
      remove(selected[selected.length - 1])
    }
  }

  return (
    <div>
      <label style={lbl}>{label}</label>

      {/* Selected chips */}
      {selected.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
          {selected.map((code) => {
            const meta = BNS_SECTIONS.find((s) => s.code === code)
            return (
              <span key={code} style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '4px 6px 4px 10px', borderRadius: 6,
                background: `${A.accent}12`, border: `1px solid ${A.accent}55`,
                fontFamily: FONT.ui, fontSize: 13, color: C.ashes,
              }}>
                <span style={{ fontWeight: 700 }}>{code}</span>
                {meta && <span style={{ color: C.charcoal }}>· {meta.title}</span>}
                <button type="button" onClick={() => remove(code)} aria-label={`Remove ${code}`}
                  style={{ border: 'none', background: 'transparent', color: C.charcoal, cursor: 'pointer', fontSize: 15, lineHeight: 1, padding: '0 2px' }}>
                  ×
                </button>
              </span>
            )
          })}
        </div>
      )}

      {/* Search input + dropdown */}
      <div style={{ position: 'relative' }}>
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          onBlur={() => { blurTimer.current = setTimeout(() => setOpen(false), 150) }}
          onKeyDown={onKeyDown}
          placeholder="Search BNS code, offence or IPC — e.g. theft, 303, 420"
          autoComplete="off"
          style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: 6, border: `1.5px solid ${FIELD_BORDER}`, fontFamily: FONT.ui, fontSize: 14, background: '#fff', color: C.ashes, outline: 'none' }}
        />
        {open && suggestions.length > 0 && (
          <div
            onMouseDown={() => { if (blurTimer.current) clearTimeout(blurTimer.current) }}
            style={{ position: 'absolute', zIndex: 20, top: 'calc(100% + 4px)', left: 0, right: 0, background: '#fff', border: `1px solid ${C.bark}`, borderRadius: 8, boxShadow: '0 8px 24px rgba(16,32,44,0.14)', maxHeight: 260, overflowY: 'auto' }}>
            {suggestions.map((s) => (
              <button key={s.code} type="button" onClick={() => add(s.code)}
                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '9px 12px', border: 'none', borderBottom: `1px solid ${C.bark}`, background: '#fff', cursor: 'pointer', fontFamily: FONT.ui }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#F3F6FA')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#fff')}>
                <span style={{ fontWeight: 700, color: C.ashes, fontSize: 14 }}>{s.code}</span>
                <span style={{ color: C.ashes, fontSize: 14 }}> · {s.title}</span>
                <span style={{ color: C.charcoal, fontSize: 12 }}>  (IPC {s.ipc})</span>
              </button>
            ))}
          </div>
        )}
      </div>
      <div style={{ fontFamily: FONT.ui, fontSize: 12, color: C.charcoal, marginTop: 4 }}>
        Pick from the list, or type a custom section (incl. a subsection like “BNS 303(2)”) and press Enter.
      </div>
    </div>
  )
}
