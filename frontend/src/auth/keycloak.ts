import Keycloak from 'keycloak-js'

const keycloak = new Keycloak({
  url: import.meta.env.VITE_KEYCLOAK_URL ?? 'http://localhost:8085',
  realm: 'ecops-realm',
  clientId: 'ecops-frontend',
})

export default keycloak
