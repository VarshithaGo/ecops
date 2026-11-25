import { useQuery } from '@tanstack/react-query'
import { stationsApi } from '../api/stationsApi'
import { useAuth } from '../auth/AuthProvider'
import { OfficerAssignment } from '../types/admin.types'

/**
 * The logged-in officer's station assignment (set by an admin). Drives the
 * station shown in the header and pre-filled + locked on complaint forms.
 * Returns `undefined` while loading or if the user has no assignment
 * (e.g. a citizen, or an officer not yet assigned to a station).
 */
export function useCurrentOfficer() {
  const { userId, roles } = useAuth()
  const enabled = !!userId && (roles.includes('POLICE_OFFICER') || roles.includes('ADMIN'))

  const query = useQuery<OfficerAssignment>({
    queryKey: ['my-assignment', userId],
    queryFn: () => stationsApi.myAssignment(userId!),
    enabled,
    retry: false,           // a missing assignment 404s — don't hammer it
    staleTime: 5 * 60 * 1000,
  })

  return {
    assignment: query.data,
    stationId: query.data?.stationId,
    stationName: query.data?.stationName,
    stationCode: query.data?.stationCode,
    officerName: query.data?.officerName,
    rank: query.data?.rank,
    isLoading: query.isLoading && enabled,
    hasAssignment: !!query.data,
  }
}
