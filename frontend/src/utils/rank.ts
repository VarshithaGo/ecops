import { ROLES } from './roles'

// What an officer can do, gated by their rank (set by the admin when registering).
export type Capability = 'WALKIN' | 'CATEGORIZE' | 'INVESTIGATE' | 'DISPOSE' | 'ASSIGN_IO'

const DESK: Capability[] = ['WALKIN']                                             // Constable, Head Constable
const INVESTIGATOR: Capability[] = ['WALKIN', 'CATEGORIZE', 'INVESTIGATE', 'DISPOSE'] // ASI, Sub-Inspector
const COMMAND: Capability[] = [...INVESTIGATOR, 'ASSIGN_IO']                        // Inspector (SHO)

/**
 * Resolve an officer's capabilities from their role + rank.
 * - Admin: everything.
 * - Inspector (SHO): everything incl. assigning the Investigating Officer.
 * - Sub-Inspector / Assistant Sub-Inspector: categorize, investigate, dispose.
 * - Constable / Head Constable (front desk): walk-in complaints only.
 */
export function capabilitiesFor(roles: string[], rank: string | undefined): Set<Capability> {
  if (roles.includes(ROLES.ADMIN)) return new Set(COMMAND)
  if (!roles.includes(ROLES.OFFICER)) return new Set()
  const r = (rank ?? '').toLowerCase()
  if (r.includes('inspector') && !r.includes('sub') && !r.includes('assistant')) return new Set(COMMAND)
  if (r.includes('sub-inspector') || r.includes('assistant')) return new Set(INVESTIGATOR)
  return new Set(DESK)
}
