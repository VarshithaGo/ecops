import { useAuth } from '../auth/AuthProvider'
import { useCurrentOfficer } from './useCurrentOfficer'
import { capabilitiesFor, Capability } from '../utils/rank'

/** Rank-aware capabilities for the logged-in user. `can('CATEGORIZE')` etc. */
export function useCapabilities() {
  const { roles } = useAuth()
  const { rank } = useCurrentOfficer()
  const caps = capabilitiesFor(roles, rank ?? undefined)
  return { can: (c: Capability) => caps.has(c), rank }
}
