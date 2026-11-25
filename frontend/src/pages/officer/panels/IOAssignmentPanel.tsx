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

import { C, A, FONT, FIELD_BORDER } from '../../../theme'

interface Props {
  firId: string
  assignments: IoAssignment[]
  stationCode: string
  readOnly?: boolean
}

export function IOAssignmentPanel({ firId, assignments, stationCode, readOnly }: Props) {
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontFamily: FONT.ui }}>
      <div>
        <label style={{ display: 'block', fontFamily: FONT.ui, fontSize: 13, fontWeight: 600, color: C.ashes, marginBottom: 6 }}>
          Select Investigating Officer
        </label>
        <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}
          style={{ padding: '10px 12px', background: '#fff', color: C.ashes, border: `1.5px solid ${FIELD_BORDER}`, borderRadius: 6, fontFamily: FONT.ui, fontSize: 14, width: '100%', boxSizing: 'border-box', outline: 'none' }}>
          <option value="">— choose an officer —</option>
          {stationOfficers.map((o) => (
            <option key={o.keycloakUserId} value={o.keycloakUserId}>
              {o.badgeNumber}{o.rank ? ` · ${o.rank}` : ''}{o.officerName ? ` · ${o.officerName}` : ''}
            </option>
          ))}
        </select>
        {station && stationOfficers.length === 0 && (
          <div style={{ fontFamily: FONT.ui, fontSize: 12, color: C.charcoal, marginTop: 6 }}>
            No active officers found at {stationCode}.
          </div>
        )}
      </div>
      <button onClick={() => assign.mutate()} disabled={!selectedId || assign.isPending}
        style={{ padding: '10px 20px', fontFamily: FONT.ui, fontSize: 14, fontWeight: 600, background: selectedId ? A.accent : '#9DB2CC', color: '#fff', border: 'none', borderRadius: 8, cursor: selectedId ? 'pointer' : 'not-allowed', alignSelf: 'flex-start' }}>
        {assign.isPending ? 'Assigning…' : 'Assign IO'}
      </button>
    </div>
  )

  return (
    <SectionPanel title="Investigating Officer (IO)" count={assignments.length} addLabel={readOnly ? undefined : 'Assign IO'} addForm={form}>
      {assignments.length === 0 ? (
        <p style={{ fontFamily: FONT.ui, color: C.charcoal, fontSize: 14 }}>No IO assigned yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {assignments.map((a) => (
            <div key={a.id} style={{ padding: '12px 14px', background: C.angst, borderRadius: 8, border: `1px solid ${C.bark}` }}>
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
