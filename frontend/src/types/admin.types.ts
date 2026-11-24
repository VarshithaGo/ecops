export interface Station {
  id: string
  stationName: string
  stationCode: string
  address: string
  district: string
  state: string
  jurisdictionArea: string | null
  status: string
  createdAt: string
}

export interface Zone {
  id: string
  stationId: string
  stationName: string
  zoneName: string
  description: string | null
  createdAt: string
}

export interface OfficerAssignment {
  id: string
  keycloakUserId: string
  officerName: string | null
  stationId: string
  stationName: string
  stationCode: string
  zoneId: string | null
  zoneName: string | null
  rank: string | null
  badgeNumber: string
  isActive: boolean
  assignedAt: string
  unassignedAt: string | null
}
