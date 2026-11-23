export interface Complaint {
  id: string
  complaintNumber: string
  citizenKeycloakId: string
  stationId: string
  description: string
  incidentDate: string
  offenseType: string | null
  status: string
  createdAt: string
}

export interface Fir {
  id: string
  firNumber: string
  stationId: string
  stationCode: string
  ipcSections: string
  narrative: string
  accusedName: string | null
  accusedAddress: string | null
  registeredByOfficerId: string
  status: string
  freeCopyIssued: boolean
  registeredAt: string
  isZeroFir: boolean
  transferredToStationCode: string | null
  transferredAt: string | null
  transferNotes: string | null
  remandCourtName: string | null
  producedAtCourtAt: string | null
}

export interface IoAssignment {
  id: string
  firId: string
  ioOfficerId: string
  assignedByOfficerId: string
  status: string
  assignedAt: string
}

export interface MahajarReport {
  id: string
  firId: string
  ioOfficerId: string
  visitDate: string
  locationDescription: string
  witnessNames: string | null
  observations: string
  createdAt: string
}

export interface PropertySeizure {
  id: string
  firId: string
  propertyDescription: string
  quantity: number
  seizedByOfficerId: string
  seizureDate: string
  storageLocation: string | null
  status: string
  createdAt: string
}

export interface NcrEntry {
  id: string
  ncrNumber: string
  stationId: string
  form76aIssued: boolean
  remarks: string | null
  status: string
  createdAt: string
  magistrateId: string | null
  magistrateOrderNotes: string | null
  magistrateOrderedAt: string | null
}

export interface ArrestWarrant {
  id: string
  firId: string
  accusedName: string
  accusedDescription: string | null
  reason: string
  status: string
  decisionNotes: string | null
  requestedAt: string
  decidedAt: string | null
}

export interface ChargeSheet {
  id: string
  firId: string
  courtName: string
  submissionDate: string
  accusedDetails: string
  evidenceSummary: string | null
  witnessList: string | null
  sectionsInvoked: string
  status: string
}

export interface FinalReport {
  id: string
  firId: string
  reportType: 'A' | 'B' | 'C'
  courtName: string
  submissionDate: string
  remarks: string
  status: string
}

export interface CourtDisposal {
  id: string
  firId: string
  courtName: string
  judgeName: string | null
  outcome: string
  judgmentDate: string | null
  remarks: string | null
}
