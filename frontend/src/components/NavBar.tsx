import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import { useMyStation } from '../hooks/useMyStation'
import { ROLES } from '../utils/roles'

const C = { angst: '#0A0A0A', bark: '#33312F', charcoal: '#726E68', ashes: '#B7B4AE', kite: '#371E1E' }

const LINKS: { to: string; label: string; roles: string[] }[] = [
  { to: '/admin/stations',     label: 'Stations',          roles: [ROLES.ADMIN] },
  { to: '/admin/assignments',  label: 'Assignments',        roles: [ROLES.ADMIN] },
  { to: '/officer/walk-in',    label: 'Walk-in',            roles: [ROLES.OFFICER] },
  { to: '/officer/complaints', label: 'Complaints',         roles: [ROLES.OFFICER, ROLES.ADMIN] },
  { to: '/officer/firs',       label: 'FIR Register',       roles: [ROLES.OFFICER, ROLES.ADMIN] },
  { to: '/officer/ncr',        label: 'NCR Register',       roles: [ROLES.OFFICER, ROLES.ADMIN] },
  { to: '/officer/criminals',  label: 'Criminal Records',   roles: [ROLES.OFFICER, ROLES.ADMIN] },
  { to: '/magistrate/warrants',label: 'Warrants',           roles: [ROLES.MAGISTRATE] },
  { to: '/magistrate/ncr',     label: 'NCR Referrals',      roles: [ROLES.MAGISTRATE] },
  { to: '/magistrate/officers',label: 'Officers',           roles: [ROLES.MAGISTRATE] },
  { to: '/citizen/file-complaint', label: 'File Complaint', roles: [ROLES.CITIZEN] },
  { to: '/citizen/track',      label: 'Track Cases',        roles: [ROLES.CITIZEN] },
]

export function NavBar() {
  const { roles, logout } = useAuth()
  const location = useLocation()
  const { data: myStation } = useMyStation()
  const visible = LINKS.filter((l) => l.roles.some((r) => roles.includes(r)))

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: C.angst,
      borderBottom: `2px solid ${C.bark}`,
      display: 'flex', alignItems: 'center',
      padding: '0 24px', height: 52,
      boxShadow: `0 4px 16px ${C.angst}`,
    }}>
      <Link to="/" style={{
        fontFamily: 'Anton, Impact, sans-serif',
        fontSize: 20, letterSpacing: '0.06em',
        color: C.ashes, textDecoration: 'none',
        marginRight: 28, whiteSpace: 'nowrap',
        borderRight: `2px solid ${C.bark}`,
        paddingRight: 28,
      }}>
        e-Cops
      </Link>

      <div style={{ display: 'flex', gap: 2, flex: 1, overflowX: 'auto', alignItems: 'center' }}>
        {visible.map((l) => {
          const active = location.pathname === l.to || location.pathname.startsWith(l.to + '/')
          return (
            <Link key={l.to} to={l.to} style={{
              fontFamily: "'Space Grotesk', system-ui, sans-serif",
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: '0.06em',
              color: active ? C.ashes : C.charcoal,
              textDecoration: 'none',
              padding: '5px 12px',
              borderRadius: 3,
              border: active ? `1px solid ${C.charcoal}` : '1px solid transparent',
              background: active ? C.kite : 'transparent',
              whiteSpace: 'nowrap',
              transition: 'all 0.12s',
            }}>
              {l.label}
            </Link>
          )
        })}
      </div>

      {myStation && (
        <div style={{
          marginLeft: 12, textAlign: 'right', whiteSpace: 'nowrap',
          fontFamily: "'Space Grotesk', system-ui, sans-serif",
          borderLeft: `2px solid ${C.bark}`, paddingLeft: 16,
        }}>
          <div style={{ fontSize: 12, color: C.ashes, fontWeight: 600 }}>{myStation.officerName ?? 'Officer'}</div>
          <div style={{ fontSize: 10, color: C.charcoal, letterSpacing: '0.06em' }}>
            {myStation.stationName} · {myStation.stationCode}
          </div>
        </div>
      )}
      <button onClick={logout} style={{
        marginLeft: 16,
        fontFamily: 'Anton, Impact, sans-serif',
        fontSize: 12, letterSpacing: '0.12em',
        padding: '5px 16px',
        background: 'transparent',
        color: C.charcoal,
        border: `1.5px solid ${C.bark}`,
        borderRadius: 3, cursor: 'pointer',
        whiteSpace: 'nowrap',
        transition: 'all 0.12s',
      }}
      onMouseEnter={(e) => { const b = e.target as HTMLButtonElement; b.style.borderColor = C.charcoal; b.style.color = C.ashes }}
      onMouseLeave={(e) => { const b = e.target as HTMLButtonElement; b.style.borderColor = C.bark; b.style.color = C.charcoal }}
      >
        LOGOUT
      </button>
    </nav>
  )
}
