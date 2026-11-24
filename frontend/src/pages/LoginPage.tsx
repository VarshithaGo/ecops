import keycloak from '../auth/keycloak'
import { A, FONT } from '../theme'

function Crest() {
  return (
    <div style={{
      width: 64, height: 64, borderRadius: 16,
      background: A.accent,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      margin: '0 auto 18px',
      boxShadow: '0 6px 18px rgba(28,78,128,0.35)',
    }}>
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
        {/* shield */}
        <path d="M12 2.5 4.5 5.5v6c0 4.6 3.1 8.3 7.5 9.9 4.4-1.6 7.5-5.3 7.5-9.9v-6L12 2.5Z"
          fill="#fff" fillOpacity="0.95" />
        {/* star */}
        <path d="M12 7.3l1.2 2.5 2.8.4-2 2 .5 2.8-2.5-1.3-2.5 1.3.5-2.8-2-2 2.8-.4L12 7.3Z"
          fill={A.accent} />
      </svg>
    </div>
  )
}

export function LoginPage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
      fontFamily: FONT.ui,
      background: `linear-gradient(135deg, #16406A 0%, ${A.accent} 55%, #2C6AA6 100%)`,
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 16,
        padding: '40px 40px 32px',
        width: '100%', maxWidth: 400,
        textAlign: 'center',
        boxShadow: '0 24px 60px rgba(16,32,44,0.30)',
      }}>
        <Crest />

        <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em', color: '#16202C' }}>
          e-Cops
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#1C4E80', marginTop: 4 }}>
          Bengaluru City Police
        </div>
        <div style={{ fontSize: 13, color: '#5A6676', marginTop: 2 }}>
          Virtual Police Station
        </div>

        <div style={{ borderTop: '1px solid #E3E8EE', margin: '26px 0 22px' }} />

        <button
          onClick={() => keycloak.login({ redirectUri: window.location.origin + '/' })}
          style={{
            width: '100%', padding: '13px 0',
            background: A.accent, color: '#fff',
            border: 'none', borderRadius: 8,
            fontSize: 15, fontWeight: 600, cursor: 'pointer',
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = A.accentHover }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = A.accent }}
        >
          Sign in
        </button>

        <div style={{ fontSize: 12, color: '#8A94A1', marginTop: 16, lineHeight: 1.5 }}>
          Authorised personnel only · BNSS 2023<br />
          Government of Karnataka
        </div>
      </div>
    </div>
  )
}
