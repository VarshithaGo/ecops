import { useState, ReactNode } from 'react'
import { C, A, FONT } from '../theme'

interface SectionPanelProps {
  title: string
  count?: number
  children: ReactNode
  addLabel?: string
  addForm?: ReactNode
  defaultOpen?: boolean
}

export function SectionPanel({ title, children, addLabel, addForm, defaultOpen = true }: SectionPanelProps) {
  const [open, setOpen] = useState(defaultOpen)
  const [showForm, setShowForm] = useState(false)

  return (
    <div style={{ border: `1px solid ${C.bark}`, borderRadius: 10, marginBottom: 16, overflow: 'hidden', background: '#fff', boxShadow: '0 1px 3px rgba(16,32,44,0.06)', fontFamily: FONT.ui }}>
      <div onClick={() => setOpen((v) => !v)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', background: '#F7F9FC', cursor: 'pointer', userSelect: 'none', borderBottom: open ? `1px solid ${C.bark}` : 'none' }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: C.ashes }}>{title}</span>
        <span style={{ fontSize: 12, color: C.charcoal }}>{open ? '▲' : '▼'}</span>
      </div>

      {open && (
        <div style={{ padding: '16px 20px' }}>
          {children}
          {addLabel && (
            <div style={{ marginTop: 14 }}>
              {!showForm ? (
                <button onClick={(e) => { e.stopPropagation(); setShowForm(true) }}
                  style={{ padding: '9px 18px', fontFamily: FONT.ui, fontSize: 14, fontWeight: 600, background: A.accent, color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
                  + {addLabel}
                </button>
              ) : (
                <div style={{ marginTop: 12, padding: '18px 20px', background: C.angst, borderRadius: 8, border: `1px solid ${C.bark}` }}>
                  {addForm}
                  <button onClick={() => setShowForm(false)}
                    style={{ marginTop: 10, fontFamily: FONT.ui, fontSize: 13, color: C.charcoal, background: 'none', border: 'none', cursor: 'pointer' }}>
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
