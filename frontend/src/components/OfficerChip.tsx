import { useQuery } from '@tanstack/react-query'
import api from '../api/axiosClient'
import { OfficerAssignment } from '../types/admin.types'

import { C } from '../theme'

function useOfficerAssignment(keycloakUserId: string | undefined) {
  return useQuery<OfficerAssignment>({
    queryKey: ['officer-assignment', keycloakUserId],
    queryFn: () => api.get(`/assignments/officer/${keycloakUserId}`).then((r) => r.data),
    enabled: !!keycloakUserId,
    staleTime: 5 * 60 * 1000,
  })
}

interface Props {
  keycloakUserId: string | undefined
}

export function OfficerChip({ keycloakUserId }: Props) {
  const { data, isLoading } = useOfficerAssignment(keycloakUserId)

  if (!keycloakUserId) return <span style={{ color: C.charcoal }}>—</span>
  if (isLoading) return <span style={{ color: C.charcoal, fontSize: 12 }}>...</span>
  if (!data) return <span style={{ fontFamily: 'monospace', fontSize: 12, color: C.charcoal }}>{keycloakUserId.slice(0, 8)}…</span>

  return (
    <span style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", fontSize: 13, color: C.ashes }}>
      {data.officerName && <span style={{ fontWeight: 600 }}>{data.officerName} </span>}
      {data.rank && <span style={{ color: C.charcoal }}>· {data.rank} · </span>}
      <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{data.badgeNumber}</span>
      <span style={{ color: C.charcoal, fontSize: 12 }}> ({data.stationCode})</span>
    </span>
  )
}
