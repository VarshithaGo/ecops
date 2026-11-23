export interface CriminalRecord {
  id: string
  firId: string
  fullName: string
  dob: string | null
  ageAtCrime: number | null
  gender: string | null
  state: string
  district: string
  area: string | null
  aadhaarRef: string | null
  photoUrl: string | null
  crimesSummary: string | null
  status: string
  role: string
  createdAt: string
}
