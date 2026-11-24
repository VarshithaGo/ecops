import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { SectionPanel } from '../../../components/SectionPanel'
import { DetailRow } from '../../../components/DetailRow'
import { StatusBadge } from '../../../components/StatusBadge'
import { OfficerChip } from '../../../components/OfficerChip'
import { IoAssignment } from '../../../types/case.types'
import { OfficerAssignment, Station } from '../../../types/admin.types'
import { caseApi } from '../../../api/caseApi'
import { stationsApi } from '../../../api/stationsApi'
import { fmtDateTime } from '../../../utils/date'

import { C } from '../../../theme'

interface Props {
  firId: string
  assignments: IoAssignment[]
  stationCode: string
}

export function IOAssignmentPanel({ firId, assignments, stationCode }: Props) {
  const qc = useQueryClient()
  const [selectedId, setSelectedId] = useState('')

  // Resolve station code → UUID
  const { data: stations = [] } = useQuery<Station[]>({
    queryKey: ['stations'],
    queryFn: stationsApi.list,
    staleTime: 10 * 60 * 1000,
  })
  const station = stations.find((s) => s.stationCode === stationCode)

  // Load all active officers at this station
  const { data: stationOfficers = [] } = useQuery<OfficerAssignment[]>({
    queryKey: ['station-officers', station?.id],
    queryFn: () => stationsApi.listAssignments(station!.id),
    enabled: !!station?.id,
    select: (list) => list.filter((o) => o.isActive),
  })

  const assign = useMutation({
    mutationFn: () => caseApi.assignIO(firId, { ioOfficerId: selectedId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['fir-io', firId] })
      qc.invalidateQueries({ queryKey: ['fir', firId] })
      setSelectedId('')
    },
  })

  const form = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div>
        <label style={{ display: 'block', fontFamily: "'Space Grotesk', system-ui, sans-serif", fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.charcoal, marginBottom: 6 }}>
          Select Investigating Officer
        </label>
        <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}
          style={{ padding: '10px 14px', background: C.bark, color: C.ashes, border: `2px solid ${C.charcoal}`, borderRadius: 3, fontFamily: "'Space Grotesk', system-ui, sans-serif", fontSize: 13, width: '100%', outline: 'none' }}>
          <option value="">— choose an officer —</option>
          {stationOfficers.map((o) => (
            <option key={o.keycloakUserId} value={o.keycloakUserId}>
              {o.badgeNumber}{o.rank ? ` · ${o.rank}` : ''}{o.officerName ? ` · ${o.officerName}` : ''}
            </option>
          ))}
        </select>
        {station && stationOfficers.length === 0 && (
          <div style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", fontSize: 11, color: C.charcoal, marginTop: 6 }}>
            No active officers found at {stationCode}.
          </div>
        )}
      </div>
      <button onClick={() => assign.mutate()} disabled={!selectedId || assign.isPending}
        style={{ padding: '9px 20px', fontFamily: 'Anton, Impact, sans-serif', fontSize: 11, letterSpacing: '0.12em', background: 'transparent', color: selectedId ? C.ashes : C.charcoal, border: `2px solid ${selectedId ? C.charcoal : C.bark}`, borderRadius: 3, cursor: selectedId ? 'pointer' : 'not-allowed', alignSelf: 'flex-start' }}>
        {assign.isPending ? 'ASSIGNING…' : 'ASSIGN IO'}
      </button>
      <style>{`select option { background: ${C.bark}; color: ${C.ashes}; }`}</style>
    </div>
  )

  return (
    <SectionPanel title="Investigating Officer (IO)" count={assignments.length} addLabel="Assign IO" addForm={form}>
      {assignments.length === 0 ? (
        <p style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", color: C.charcoal, fontSize: 13 }}>No IO assigned yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {assignments.map((a) => (
            <div key={a.id} style={{ padding: '10px 14px', background: `${C.angst}66`, borderRadius: 3, border: `1px solid ${C.bark}` }}>
              <DetailRow label="IO Officer" value={<OfficerChip keycloakUserId={a.ioOfficerId} />} />
              <DetailRow label="Assigned By" value={<OfficerChip keycloakUserId={a.assignedByOfficerId} />} />
              <DetailRow label="Assigned At" value={fmtDateTime(a.assignedAt)} />
              <DetailRow label="Status" value={<StatusBadge status={a.status} size="sm" />} />
            </div>
          ))}
        </div>
      )}
    </SectionPanel>
  )
}
