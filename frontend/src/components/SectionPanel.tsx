import { useState, ReactNode } from 'react'

const C = { angst: '#0A0A0A', kite: '#371E1E', bark: '#33312F', charcoal: '#726E68', ashes: '#B7B4AE' }

interface SectionPanelProps {
  title: string
  count?: number
  children: ReactNode
  addLabel?: string
  addForm?: ReactNode
  defaultOpen?: boolean
}

export function SectionPanel({ title, count, children, addLabel, addForm, defaultOpen = true }: SectionPanelProps) {
  const [open, setOpen] = useState(defaultOpen)
  const [showForm, setShowForm] = useState(false)

  return (
    <div style={{ border: `2px solid ${C.charcoal}`, borderRadius: 4, marginBottom: 16, overflow: 'hidden', backdropFilter: 'blur(8px)', background: `${C.kite}99` }}>
      <div onClick={() => setOpen((v) => !v)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', background: C.bark, cursor: 'pointer', userSelect: 'none', borderBottom: open ? `2px solid ${C.charcoal}` : 'none' }}>
        <span style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: 14, letterSpacing: '0.08em', color: C.ashes }}>
          {title}
        </span>
        <span style={{ fontSize: 11, color: C.charcoal }}>{open ? '▲' : '▼'}</span>
      </div>

      {open && (
        <div style={{ padding: '16px 20px' }}>
          {children}
          {addLabel && (
            <div style={{ marginTop: 14 }}>
              {!showForm ? (
                <button onClick={(e) => { e.stopPropagation(); setShowForm(true) }}
                  style={{ padding: '8px 20px', fontFamily: 'Anton, Impact, sans-serif', fontSize: 11, letterSpacing: '0.12em', background: 'transparent', color: C.ashes, border: `2px solid ${C.charcoal}`, borderRadius: 3, cursor: 'pointer' }}>
                  + {addLabel.toUpperCase()}
                </button>
              ) : (
                <div style={{ marginTop: 12, padding: '18px 20px', background: `${C.angst}bb`, borderRadius: 4, border: `2px solid ${C.bark}` }}>
                  {addForm}
                  <button onClick={() => setShowForm(false)}
                    style={{ marginTop: 10, fontFamily: "'Space Grotesk', system-ui, sans-serif", fontSize: 12, color: C.charcoal, background: 'none', border: 'none', cursor: 'pointer' }}>
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
