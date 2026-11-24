import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../auth/AuthProvider'
import api from '../api/axiosClient'

export interface MyAssignment {
  keycloakUserId: string
  officerName: string | null
  stationId: string
  stationName: string
  stationCode: string
  rank: string | null
  badgeNumber: string
  isActive: boolean
}

// Resolves the currently logged-in officer's station assignment.
export function useMyStation() {
  const { userId, roles } = useAuth()
  const isOfficer = roles.includes('POLICE_OFFICER')
  return useQuery<MyAssignment | null>({
    queryKey: ['my-assignment', userId],
    queryFn: () =>
      api
        .get(`/assignments/officer/${userId}`)
        .then((r) => r.data)
        .catch(() => null),
    enabled: !!userId && isOfficer,
    staleTime: 5 * 60 * 1000,
  })
}
