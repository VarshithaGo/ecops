import { Outlet } from 'react-router-dom'
import { NavBar } from '../../components/NavBar'
import { CourtDeadlineAlerts } from '../../components/CourtDeadlineAlerts'
import { C } from '../../theme'

export function AppShell() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: C.angst }}>
      <NavBar />
      <CourtDeadlineAlerts />
      <main style={{ flex: 1, width: '100%' }}>
        {/* Centered content band so pages don't pin to the left edge. */}
        <div style={{ maxWidth: 1160, margin: '0 auto', width: '100%' }}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}
