import { Outlet } from 'react-router-dom'
import { NavBar } from '../../components/NavBar'

export function AppShell() {
  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      {/* fixed background */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        backgroundImage: 'url(/crime-tape.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }} />
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1,
        background: 'linear-gradient(135deg, rgba(10,10,10,0.92) 0%, rgba(55,30,30,0.80) 50%, rgba(10,10,10,0.92) 100%)',
      }} />

      {/* content */}
      <div style={{ position: 'relative', zIndex: 2, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <NavBar />
        <main style={{ flex: 1 }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
