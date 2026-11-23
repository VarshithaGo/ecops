import axios from 'axios'
import api from './axiosClient'

export const citizenApi = {
  register: (data: unknown) =>
    axios.post('/api/v1/citizens/register', data).then((r) => r.data),
  getMyProfile: () =>
    api.get('/citizens/me').then((r) => r.data),
  searchCitizens: (params: { name?: string; aadhaarRef?: string }) =>
    api.get('/citizens/search', { params }).then((r) => r.data),
}
