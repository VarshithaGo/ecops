import axios from 'axios'
import keycloak from '../auth/keycloak'

const api = axios.create({
  baseURL: '/api/v1',
})

api.interceptors.request.use((config) => {
  if (keycloak.token) {
    config.headers.Authorization = `Bearer ${keycloak.token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      await keycloak.updateToken(30)
      err.config.headers.Authorization = `Bearer ${keycloak.token}`
      return api.request(err.config)
    }
    return Promise.reject(err)
  }
)

export default api
