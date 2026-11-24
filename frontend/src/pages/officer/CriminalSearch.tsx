import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { caseApi } from '../../api/caseApi'
import { CriminalRecord } from '../../types/criminal.types'
import { StateDistrictSelect } from '../../components/StateDistrictSelect'
import { C, A, FONT, FIELD_BORDER } from '../../theme'

const label: React.CSSProperties = { display: 'block', fontFamily: FONT.ui, fontSize: 13, fontWeight: 600, color: C.ashes, marginBottom: 6 }
const inp: React.CSSProperties = { padding: '10px 12px', background: '#fff', color: C.ashes, border: `1.5px solid ${FIELD_BORDER}`, borderRadius: 6, fontFamily: FONT.ui, fontSize: 14, width: '100%', boxSizing: 'border-box', outline: 'none' }
const th: React.CSSProperties = { padding: '11px 14px', fontFamily: FONT.ui, fontSize: 12, fontWeight: 700, color: C.charcoal, textAlign: 'left', background: '#F3F6FA', borderBottom: `1px solid ${C.bark}` }
const td: React.CSSProperties = { padding: '11px 14px', fontFamily: FONT.ui, fontSize: 14, color: C.ashes, borderBottom: `1px solid ${C.bark}` }

interface SearchParams { name: string; state: string; district: string; minAge: string; maxAge: string; role: string }
const EMPTY: SearchParams = { name: '', state: '', district: '', minAge: '', maxAge: '', role: '' }

export function CriminalSearch() {
  const [params, setParams] = useState<SearchParams>(EMPTY)
  const [submitted, setSubmitted] = useState<SearchParams>(EMPTY)  // load all on mount

  const { data = [], isLoading, isError } = useQuery<CriminalRecord[]>({
    queryKey: ['criminals', submitted],
    queryFn: () => {
      // role is filtered client-side (the API doesn't support it)
      const apiParams = Object.fromEntries(
        Object.entries(submitted).filter(([k, v]) => v !== '' && k !== 'role'),
      )
      return caseApi.searchCriminals(apiParams)
    },
  })

  const results = submitted.role ? data.filter((c) => c.role === submitted.role) : data

  return (
    <div style={{ padding: '32px 24px', maxWidth: 1120, margin: '0 auto', fontFamily: FONT.ui }}>
      <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.01em', color: C.ashes, margin: 0 }}>Criminal Records</h2>
      <p style={{ color: C.charcoal, fontSize: 14, margin: '6px 0 20px' }}>
        Showing all records. Narrow with the filters below — name is a partial match; state/district are exact.
      </p>

      {/* Filters */}
      <form onSubmit={(e) => { e.preventDefault(); setSubmitted({ ...params }) }}
        style={{ background: '#fff', border: `1px solid ${C.bark}`, borderRadius: 10, padding: '20px 22px', marginBottom: 24, boxShadow: '0 1px 3px rgba(16,32,44,0.06)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div>
            <label style={label}>Name</label>
            <input value={params.name} onChange={(e) => setParams((p) => ({ ...p, name: e.target.value }))} style={inp} placeholder="e.g. Ravi" />
          </div>
          <div>
            <label style={label}>Role</label>
            <select value={params.role} onChange={(e) => setParams((p) => ({ ...p, role: e.target.value }))} style={inp}>
              <option value="">All roles</option>
              <option value="SUSPECT">Suspect</option>
              <option value="ACCUSED">Accused</option>
              <option value="WITNESS">Witness</option>
              <option value="CONVICTED_PERSON">Convicted person</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1 }}>
              <label style={label}>Min age</label>
              <input type="number" min={0} value={params.minAge} onChange={(e) => setParams((p) => ({ ...p, minAge: e.target.value }))} style={inp} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={label}>Max age</label>
              <input type="number" min={0} value={params.maxAge} onChange={(e) => setParams((p) => ({ ...p, maxAge: e.target.value }))} style={inp} />
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <StateDistrictSelect
            state={params.state}
            district={params.district}
            onState={(v) => setParams((p) => ({ ...p, state: v }))}
            onDistrict={(v) => setParams((p) => ({ ...p, district: v }))}
          />
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button type="submit" style={{ padding: '10px 22px', fontSize: 14, fontWeight: 600, background: A.accent, color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
            Search
          </button>
          <button type="button" onClick={() => { setParams(EMPTY); setSubmitted(EMPTY) }}
            style={{ padding: '10px 22px', fontSize: 14, fontWeight: 600, background: '#fff', color: C.ashes, border: `1px solid ${C.charcoal}66`, borderRadius: 8, cursor: 'pointer' }}>
            Reset
          </button>
        </div>
      </form>

      {isLoading && <div style={{ color: C.charcoal, padding: 16 }}>Searching…</div>}
      {isError && <div style={{ color: '#B91C1C', padding: 16 }}>Could not load records. Please try again.</div>}

      {!isLoading && !isError && (
        <div style={{ border: `1px solid ${C.bark}`, borderRadius: 10, overflow: 'hidden', background: '#fff', boxShadow: '0 1px 3px rgba(16,32,44,0.06)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={th}>Name</th><th style={th}>Role</th><th style={th}>Age</th>
                <th style={th}>Gender</th><th style={th}>State / District</th><th style={th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {results.map((c) => (
                <tr key={c.id}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#F7F9FC')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                  <td style={{ ...td, fontWeight: 600 }}>{c.fullName}</td>
                  <td style={{ ...td, color: C.charcoal }}>{c.role?.replace(/_/g, ' ') ?? '—'}</td>
                  <td style={td}>{c.ageAtCrime ?? '—'}</td>
                  <td style={td}>{c.gender ?? '—'}</td>
                  <td style={{ ...td, color: C.charcoal }}>{c.district}, {c.state}</td>
                  <td style={td}>{c.status?.replace(/_/g, ' ')}</td>
                </tr>
              ))}
              {results.length === 0 && (
                <tr><td colSpan={6} style={{ ...td, textAlign: 'center', color: C.charcoal, padding: 32 }}>No records found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
