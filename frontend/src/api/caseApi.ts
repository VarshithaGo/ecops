import api from './axiosClient'

export const caseApi = {
  // Complaints
  fileComplaint: (data: unknown) => api.post('/complaints', data).then((r) => r.data),
  fileWalkInComplaint: (data: unknown) => api.post('/complaints/walk-in', data).then((r) => r.data),
  listComplaints: () => api.get('/complaints').then((r) => r.data),
  getComplaint: (id: string) => api.get(`/complaints/${id}`).then((r) => r.data),
  categorize: (id: string, data: unknown) =>
    api.put(`/complaints/${id}/categorize`, data).then((r) => r.data),

  // FIRs
  listFirs: () => api.get('/firs').then((r) => r.data),
  getFir: (id: string) => api.get(`/firs/${id}`).then((r) => r.data),
  assignIO: (firId: string, data: unknown) =>
    api.post(`/firs/${firId}/io-assignment`, data).then((r) => r.data),
  getFirIoAssignments: (firId: string) =>
    api.get(`/firs/${firId}/io-assignment`).then((r) => r.data),
  recordMahajar: (firId: string, data: unknown) =>
    api.post(`/firs/${firId}/mahajar`, data).then((r) => r.data),
  getFirMahajar: (firId: string) =>
    api.get(`/firs/${firId}/mahajar`).then((r) => r.data),
  recordSeizure: (firId: string, data: unknown) =>
    api.post(`/firs/${firId}/property`, data).then((r) => r.data),
  getFirProperty: (firId: string) =>
    api.get(`/firs/${firId}/property`).then((r) => r.data),
  updatePropertyStatus: (id: string, status: string) =>
    api.put(`/property/${id}/status`, { status }).then((r) => r.data),
  addCriminal: (firId: string, data: unknown) =>
    api.post(`/firs/${firId}/criminal-records`, data).then((r) => r.data),
  getFirCriminals: (firId: string) =>
    api.get(`/firs/${firId}/criminal-records`).then((r) => r.data),
  fileChargeSheet: (firId: string, data: unknown) =>
    api.post(`/firs/${firId}/charge-sheet`, data).then((r) => r.data),
  getFirChargeSheet: (firId: string) =>
    api.get(`/firs/${firId}/charge-sheet`).then((r) => r.data),
  fileFinalReport: (firId: string, data: unknown) =>
    api.post(`/firs/${firId}/final-report`, data).then((r) => r.data),
  getFirFinalReport: (firId: string) =>
    api.get(`/firs/${firId}/final-report`).then((r) => r.data),
  recordDisposal: (firId: string, data: unknown) =>
    api.post(`/firs/${firId}/court-disposal`, data).then((r) => r.data),
  getFirCourtDisposal: (firId: string) =>
    api.get(`/firs/${firId}/court-disposal`).then((r) => r.data),

  // FIR transfer (Zero FIR)
  transferFir: (firId: string, data: { targetStationCode: string; notes?: string }) =>
    api.put(`/firs/${firId}/transfer`, data).then((r) => r.data),
  recordCourtProduction: (firId: string, courtName: string) =>
    api.put(`/firs/${firId}/court-production`, { courtName }).then((r) => r.data),

  // NCR
  listNcr: () => api.get('/ncr').then((r) => r.data),
  referNcrToMagistrate: (id: string) =>
    api.put(`/ncr/${id}/refer-magistrate`).then((r) => r.data),
  magistrateOrderNcr: (id: string, notes?: string) =>
    api.put(`/ncr/${id}/magistrate-order`, { notes }).then((r) => r.data),

  // Warrants
  requestWarrant: (data: unknown) => api.post('/warrants', data).then((r) => r.data),
  listPendingWarrants: () => api.get('/warrants/pending').then((r) => r.data),
  getFirWarrants: (firId: string) =>
    api.get(`/warrants?firId=${firId}`).then((r) => r.data),
  decideWarrant: (id: string, data: unknown) =>
    api.put(`/warrants/${id}/decision`, data).then((r) => r.data),
  executeWarrant: (id: string) =>
    api.put(`/warrants/${id}/execute`).then((r) => r.data),
  cancelWarrant: (id: string, reason?: string) =>
    api.put(`/warrants/${id}/cancel`, { reason }).then((r) => r.data),

  // Criminal records
  searchCriminals: (params: Record<string, unknown>) =>
    api.get('/criminal-records/search', { params }).then((r) => r.data),
}
