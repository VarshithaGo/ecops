import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { SectionPanel } from '../../../components/SectionPanel'
import { DetailRow } from '../../../components/DetailRow'
import { StatusBadge } from '../../../components/StatusBadge'
import { CriminalRecord } from '../../../types/criminal.types'
import { caseApi } from '../../../api/caseApi'

const C = { angst: '#0A0A0A', bark: '#33312F', charcoal: '#726E68', ashes: '#B7B4AE' }
const inp: React.CSSProperties = { padding: '10px 14px', background: C.bark, color: C.ashes, border: `2px solid ${C.charcoal}`, borderRadius: 3, fontFamily: "'Space Grotesk', system-ui, sans-serif", fontSize: 13, width: '100%', boxSizing: 'border-box', outline: 'none', colorScheme: 'dark' }
const lbl: React.CSSProperties = { display: 'block', fontFamily: "'Space Grotesk', system-ui, sans-serif", fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.charcoal, marginBottom: 6 }

interface Props { firId: string; criminals: CriminalRecord[] }

export function CriminalPanel({ firId, criminals }: Props) {
  const qc = useQueryClient()
  const [f, setF] = useState({ fullName: '', dob: '', ageAtCrime: '', gender: '', state: '', district: '', area: '', aadhaarRef: '', role: 'SUSPECT' })
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF((p) => ({ ...p, [k]: e.target.value }))

  const add = useMutation({
    mutationFn: () => caseApi.addCriminal(firId, { fullName: f.fullName, dob: f.dob || null, ageAtCrime: f.ageAtCrime ? Number(f.ageAtCrime) : null, gender: f.gender || null, state: f.state, district: f.district, area: f.area || null, aadhaarRef: f.aadhaarRef || null, role: f.role }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['fir-criminals', firId] }); setF({ fullName: '', dob: '', ageAtCrime: '', gender: '', state: '', district: '', area: '', aadhaarRef: '', role: 'SUSPECT' }) },
  })

  const canAdd = f.fullName && f.state && f.district && !add.isPending

  const addForm = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 2 }}><label style={lbl}>Full Name</label><input value={f.fullName} onChange={set('fullName')} style={inp} /></div>
        <div style={{ flex: 1 }}>
          <label style={lbl}>Role</label>
          <select value={f.role} onChange={set('role')} style={inp}>
            <option value="SUSPECT">SUSPECT</option>
            <option value="ACCUSED">ACCUSED</option>
            <option value="WITNESS">WITNESS</option>
            <option value="CONVICTED_PERSON">CONVICTED PERSON</option>
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label style={lbl}>Gender</label>
          <select value={f.gender} onChange={set('gender')} style={inp}>
            <option value="">—</option>
            <option value="MALE">MALE</option>
            <option value="FEMALE">FEMALE</option>
            <option value="OTHER">OTHER</option>
          </select>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1 }}><label style={lbl}>Date of Birth</label><input type="date" value={f.dob} onChange={set('dob')} style={inp} /></div>
        <div style={{ flex: 1 }}><label style={lbl}>Age at Crime</label><input type="number" min={0} value={f.ageAtCrime} onChange={set('ageAtCrime')} style={inp} /></div>
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1 }}><label style={lbl}>State</label><input value={f.state} onChange={set('state')} style={inp} /></div>
        <div style={{ flex: 1 }}><label style={lbl}>District</label><input value={f.district} onChange={set('district')} style={inp} /></div>
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1 }}><label style={lbl}>Area <span style={{ opacity: 0.6 }}>(optional)</span></label><input value={f.area} onChange={set('area')} style={inp} /></div>
        <div style={{ flex: 1 }}><label style={lbl}>Aadhaar Ref <span style={{ opacity: 0.6 }}>(optional)</span></label><input value={f.aadhaarRef} onChange={set('aadhaarRef')} style={inp} /></div>
      </div>
      <button onClick={() => add.mutate()} disabled={!canAdd}
        style={{ padding: '9px 20px', fontFamily: 'Anton, Impact, sans-serif', fontSize: 11, letterSpacing: '0.12em', background: 'transparent', color: canAdd ? C.ashes : C.charcoal, border: `2px solid ${canAdd ? C.charcoal : C.bark}`, borderRadius: 3, cursor: canAdd ? 'pointer' : 'not-allowed', alignSelf: 'flex-start' }}>
        {add.isPending ? 'SAVING…' : 'ADD CRIMINAL RECORD'}
      </button>
      <style>{`select option { background: ${C.bark}; color: ${C.ashes}; }`}</style>
    </div>
  )

  return (
    <SectionPanel title="Criminal Records" addLabel="Add Criminal Record" addForm={addForm}>
      {criminals.length === 0 ? (
        <p style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", color: C.charcoal, fontSize: 13 }}>No criminal records linked to this FIR.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {criminals.map((c) => (
            <div key={c.id} style={{ padding: '10px 14px', background: `${C.angst}66`, borderRadius: 3, border: `1px solid ${C.bark}` }}>
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
