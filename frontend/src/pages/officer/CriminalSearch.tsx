import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { caseApi } from '../../api/caseApi'
import { CriminalRecord } from '../../types/criminal.types'

const C = { angst: '#0A0A0A', kite: '#371E1E', bark: '#33312F', charcoal: '#726E68', ashes: '#B7B4AE' }

const inputStyle: React.CSSProperties = {
  padding: '8px 12px',
  background: C.bark, color: C.ashes,
  border: `2px solid ${C.charcoal}`, borderRadius: 3,
  fontFamily: "'Space Grotesk', system-ui, sans-serif",
  fontSize: 13, width: 150, outline: 'none',
}
const th: React.CSSProperties = {
  padding: '10px 14px',
  fontFamily: 'Anton, Impact, sans-serif',
  fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase',
  color: C.charcoal, textAlign: 'left', background: C.bark,
  borderBottom: `2px solid ${C.charcoal}`,
}
const td: React.CSSProperties = {
  padding: '10px 14px',
  fontFamily: "'Space Grotesk', system-ui, sans-serif",
  fontSize: 13, color: C.ashes,
  borderBottom: `1px solid ${C.bark}`,
}

interface SearchParams { state: string; district: string; area: string; name: string; minAge: string; maxAge: string; role: string }

export function CriminalSearch() {
  const [params, setParams] = useState<SearchParams>({ state: '', district: '', area: '', name: '', minAge: '', maxAge: '', role: '' })
  const [submitted, setSubmitted] = useState<SearchParams | null>(null)

  const { data, isLoading } = useQuery<CriminalRecord[]>({
    queryKey: ['criminals', submitted],
    queryFn: () => caseApi.searchCriminals(Object.fromEntries(Object.entries(submitted!).filter(([, v]) => v !== ''))),
    enabled: !!submitted,
  })

  const focusIn  = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => (e.target.style.borderColor = C.ashes)
  const focusOut = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => (e.target.style.borderColor = C.charcoal)

  const fields: [keyof SearchParams, string][] = [
    ['name', 'Name'], ['state', 'State'], ['district', 'District'],
    ['area', 'Area'], ['minAge', 'Min Age'], ['maxAge', 'Max Age'],
  ]

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1200 }}>
      <h2 style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: 26, letterSpacing: '0.06em', color: C.ashes, margin: 0, marginBottom: 6 }}>
        Criminal Records
      </h2>
      <p style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", color: C.charcoal, fontSize: 13, marginBottom: 24 }}>
        Search the criminal database by name, area, district, or role.
      </p>

      {/* Search form */}
      <form onSubmit={(e) => { e.preventDefault(); setSubmitted({ ...params }) }}
        style={{
          background: `${C.kite}99`, border: `2px solid ${C.charcoal}`,
          borderRadius: 4, padding: '20px 24px', marginBottom: 28,
          backdropFilter: 'blur(8px)',
        }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-end' }}>
          {fields.map(([key, label]) => (
            <div key={key}>
              <label style={{
                display: 'block',
                fontFamily: "'Space Grotesk', system-ui, sans-serif",
                fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase',
                color: C.charcoal, marginBottom: 6,
              }}>{label}</label>
              <input
                value={params[key]}
                onChange={(e) => setParams((p) => ({ ...p, [key]: e.target.value }))}
                style={inputStyle} onFocus={focusIn} onBlur={focusOut}
              />
            </div>
          ))}
          <div>
            <label style={{
              display: 'block',
              fontFamily: "'Space Grotesk', system-ui, sans-serif",
              fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase',
              color: C.charcoal, marginBottom: 6,
            }}>Role</label>
            <select value={params.role} onChange={(e) => setParams((p) => ({ ...p, role: e.target.value }))}
              style={{ ...inputStyle, width: 160 }} onFocus={focusIn} onBlur={focusOut}>
              <option value="">All roles</option>
              <option value="SUSPECT">SUSPECT</option>
              <option value="ACCUSED">ACCUSED</option>
              <option value="WITNESS">WITNESS</option>
              <option value="CONVICTED_PERSON">CONVICTED PERSON</option>
            </select>
          </div>
          <button type="submit" style={{
            padding: '9px 28px',
            fontFamily: 'Anton, Impact, sans-serif', fontSize: 13, letterSpacing: '0.14em',
            background: 'transparent', color: C.ashes,
            border: `2px solid ${C.charcoal}`, borderRadius: 3, cursor: 'pointer',
          }}>
            SEARCH
          </button>
        </div>
      </form>

      {isLoading && (
        <div style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", color: C.charcoal, padding: 16 }}>Searching...</div>
      )}

      {data && (
        <div style={{ border: `2px solid ${C.charcoal}`, borderRadius: 4, overflow: 'hidden', backdropFilter: 'blur(8px)', background: `${C.kite}99` }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={th}>Name</th>
                <th style={th}>Role</th>
                <th style={th}>Age at Crime</th>
                <th style={th}>Gender</th>
                <th style={th}>State / District</th>
                <th style={th}>Crimes</th>
                <th style={th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.map((c) => (
                <tr key={c.id}
                  onMouseEnter={(e) => (e.currentTarget.style.background = `${C.bark}88`)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                  <td style={{ ...td, fontWeight: 700 }}>{c.fullName}</td>
                  <td style={{ ...td, color: C.charcoal }}>{c.role?.replace(/_/g, ' ') ?? '—'}</td>
                  <td style={td}>{c.ageAtCrime ?? '—'}</td>
                  <td style={td}>{c.gender ?? '—'}</td>
                  <td style={{ ...td, color: C.charcoal }}>{c.state}, {c.district}</td>
                  <td style={{ ...td, color: C.charcoal, maxWidth: 200 }}>{c.crimesSummary ?? '—'}</td>
                  <td style={td}>
                    <span style={{
                      color: c.status === 'ARRESTED' ? '#4ade80' : c.status === 'CONVICTED' ? '#a78bfa' : C.charcoal,
                      fontWeight: 600,
                    }}>
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr><td colSpan={7} style={{ ...td, textAlign: 'center', color: C.charcoal, padding: 32 }}>No records found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <style>{`input::placeholder { color: ${C.charcoal}; opacity: 0.6; } select option { background: ${C.bark}; color: ${C.ashes}; }`}</style>
    </div>
  )
}
