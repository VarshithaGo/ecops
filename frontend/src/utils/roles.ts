export const ROLES = {
  ADMIN: 'ADMIN',
  OFFICER: 'POLICE_OFFICER',
  MAGISTRATE: 'MAGISTRATE',
  CITIZEN: 'CITIZEN',
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]

export function hasRole(userRoles: string[], role: Role): boolean {
  return userRoles.includes(role)
}
