import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { SectionPanel } from '../../../components/SectionPanel'
import { DetailRow } from '../../../components/DetailRow'
import { StatusBadge } from '../../../components/StatusBadge'
import { StateDistrictSelect } from '../../../components/StateDistrictSelect'
import { CriminalRecord } from '../../../types/criminal.types'
import { caseApi } from '../../../api/caseApi'
import { C, A, FONT, FIELD_BORDER } from '../../../theme'

const inp: React.CSSProperties = { padding: '10px 12px', background: '#fff', color: C.ashes, border: `1.5px solid ${FIELD_BORDER}`, borderRadius: 6, fontFamily: FONT.ui, fontSize: 14, width: '100%', boxSizing: 'border-box', outline: 'none' }
const lbl: React.CSSProperties = { display: 'block', fontFamily: FONT.ui, fontSize: 13, fontWeight: 600, color: C.ashes, marginBottom: 6 }
const errText: React.CSSProperties = { fontFamily: FONT.ui, fontSize: 12, color: '#B91C1C', marginTop: 4 }

interface Props { firId: string; criminals: CriminalRecord[] }

function apiError(err: unknown): string {
  const e = err as { response?: { data?: { message?: string; error?: string } } }
  return e?.response?.data?.message || e?.response?.data?.error || 'Could not save the record. Please try again.'
}

export function CriminalPanel({ firId, criminals }: Props) {
  const qc = useQueryClient()
  const [f, setF] = useState({ fullName: '', dob: '', ageAtCrime: '', gender: '', state: '', district: '', area: '', aadhaarRef: '', role: 'SUSPECT' })
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF((p) => ({ ...p, [k]: e.target.value }))

  const aadhaarError = !!f.aadhaarRef && !/^\d{12}$/.test(f.aadhaarRef.trim())
  const ageError = !!f.ageAtCrime && (Number(f.ageAtCrime) < 0 || Number(f.ageAtCrime) > 120)

  const add = useMutation({
    mutationFn: () => caseApi.addCriminal(firId, { fullName: f.fullName.trim(), dob: f.dob || null, ageAtCrime: f.ageAtCrime ? Number(f.ageAtCrime) : null, gender: f.gender || null, state: f.state, district: f.district, area: f.area || null, aadhaarRef: f.aadhaarRef || null, role: f.role }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['fir-criminals', firId] }); setF({ fullName: '', dob: '', ageAtCrime: '', gender: '', state: '', district: '', area: '', aadhaarRef: '', role: 'SUSPECT' }) },
  })

  const canAdd = !!f.fullName.trim() && !!f.state && !!f.district && !aadhaarError && !ageError && !add.isPending

  const addForm = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontFamily: FONT.ui }}>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 2 }}><label style={lbl}>Full name *</label><input value={f.fullName} onChange={set('fullName')} style={inp} placeholder="Name as recorded" /></div>
        <div style={{ flex: 1 }}>
          <label style={lbl}>Role</label>
          <select value={f.role} onChange={set('role')} style={inp}>
            <option value="SUSPECT">Suspect</option>
            <option value="ACCUSED">Accused</option>
            <option value="WITNESS">Witness</option>
            <option value="CONVICTED_PERSON">Convicted person</option>
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label style={lbl}>Gender</label>
          <select value={f.gender} onChange={set('gender')} style={inp}>
            <option value="">—</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1 }}><label style={lbl}>Date of birth</label><input type="date" max={new Date().toISOString().slice(0, 10)} value={f.dob} onChange={set('dob')} style={inp} /></div>
        <div style={{ flex: 1 }}>
          <label style={lbl}>Age at crime</label>
          <input type="number" min={0} max={120} value={f.ageAtCrime} onChange={set('ageAtCrime')} style={{ ...inp, borderColor: ageError ? '#B91C1C' : FIELD_BORDER }} />
          {ageError && <div style={errText}>Enter a valid age (0–120).</div>}
        </div>
      </div>

      {/* State -> District dependent dropdowns */}
      <StateDistrictSelect
        state={f.state}
        district={f.district}
        onState={(v) => setF((p) => ({ ...p, state: v }))}
        onDistrict={(v) => setF((p) => ({ ...p, district: v }))}
        required
      />

      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1 }}><label style={lbl}>Area <span style={{ color: C.charcoal, fontWeight: 400 }}>(optional)</span></label><input value={f.area} onChange={set('area')} style={inp} placeholder="Locality / landmark" /></div>
        <div style={{ flex: 1 }}>
          <label style={lbl}>Aadhaar ref <span style={{ color: C.charcoal, fontWeight: 400 }}>(optional)</span></label>
          <input value={f.aadhaarRef} onChange={set('aadhaarRef')} inputMode="numeric" maxLength={12} style={{ ...inp, borderColor: aadhaarError ? '#B91C1C' : FIELD_BORDER }} placeholder="12-digit number" />
          {aadhaarError && <div style={errText}>Aadhaar must be 12 digits.</div>}
        </div>
      </div>

      {add.isError && (
        <div style={{ background: '#FEF3F2', border: '1px solid #FECDCA', color: '#B91C1C', borderRadius: 8, padding: '10px 14px', fontSize: 13 }}>
          {apiError(add.error)}
        </div>
      )}

      <button onClick={() => add.mutate()} disabled={!canAdd}
        style={{ padding: '10px 20px', fontFamily: FONT.ui, fontSize: 14, fontWeight: 600, background: canAdd ? A.accent : '#9DB2CC', color: '#fff', border: 'none', borderRadius: 8, cursor: canAdd ? 'pointer' : 'not-allowed', alignSelf: 'flex-start' }}>
        {add.isPending ? 'Saving…' : 'Add criminal record'}
      </button>
    </div>
  )

  return (
    <SectionPanel title="Criminal Records" addLabel="Add Criminal Record" addForm={addForm}>
      {criminals.length === 0 ? (
        <p style={{ fontFamily: FONT.ui, color: C.charcoal, fontSize: 14 }}>No criminal records linked to this FIR.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {criminals.map((c) => (
            <div key={c.id} style={{ padding: '12px 14px', background: C.angst, borderRadius: 8, border: `1px solid ${C.bark}` }}>
              <DetailRow label="Name" value={c.fullName} />
              <DetailRow label="Role" value={c.role.replace(/_/g, ' ')} />
              {c.gender && <DetailRow label="Gender" value={c.gender} />}
              {c.dob && <DetailRow label="DOB" value={c.dob} />}
              {c.ageAtCrime !== null && <DetailRow label="Age at Crime" value={c.ageAtCrime} />}
              <DetailRow label="Location" value={`${c.district}, ${c.state}`} />
              {c.area && <DetailRow label="Area" value={c.area} />}
              {c.aadhaarRef && <DetailRow label="Aadhaar Ref" value={c.aadhaarRef} mono />}
              <DetailRow label="Status" value={<StatusBadge status={c.status} size="sm" />} />
            </div>
          ))}
        </div>
      )}
    </SectionPanel>
  )
}
