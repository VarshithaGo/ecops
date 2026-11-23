import api from './axiosClient'

export const stationsApi = {
  list: () => api.get('/stations').then((r) => r.data),
  get: (id: string) => api.get(`/stations/${id}`).then((r) => r.data),
  create: (data: unknown) => api.post('/stations', data).then((r) => r.data),
  update: (id: string, data: unknown) => api.put(`/stations/${id}`, data).then((r) => r.data),
  deactivate: (id: string) => api.delete(`/stations/${id}`),
  listZones: (stationId: string) => api.get(`/stations/${stationId}/zones`).then((r) => r.data),
  createZone: (stationId: string, data: unknown) =>
    api.post(`/stations/${stationId}/zones`, data).then((r) => r.data),
  listAssignments: (stationId: string) =>
    api.get(`/assignments?stationId=${stationId}`).then((r) => r.data),
  assign: (data: unknown) => api.post('/assignments', data).then((r) => r.data),
}
