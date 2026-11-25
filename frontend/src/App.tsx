import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './auth/AuthProvider'
import { ProtectedRoute } from './auth/ProtectedRoute'
import { AppShell } from './pages/shared/AppShell'
import { Dashboard } from './pages/shared/Dashboard'
import { StationsList } from './pages/admin/StationsList'
import { OfficerAssignmentPage } from './pages/admin/OfficerAssignmentPage'
import { AddStationPage } from './pages/admin/AddStationPage'
import { StationDetailPage } from './pages/admin/StationDetailPage'
import { ComplaintsInbox } from './pages/officer/ComplaintsInbox'
import { FIRList } from './pages/officer/FIRList'
import FIRDetail from './pages/officer/FIRDetail'
import { NCRList } from './pages/officer/NCRList'
import { CriminalSearch } from './pages/officer/CriminalSearch'
import { WalkInComplaintPage } from './pages/officer/WalkInComplaintPage'
import { WarrantApprovalPage } from './pages/magistrate/WarrantApprovalPage'
import { MagistrateNCRPage } from './pages/magistrate/MagistrateNCRPage'
import { MagistrateCourtPage } from './pages/magistrate/MagistrateCourtPage'
import { MagistrateOfficersPage } from './pages/magistrate/MagistrateOfficersPage'
import { RegisterPage } from './pages/citizen/RegisterPage'
import { FileComplaintPage } from './pages/citizen/FileComplaintPage'
import { TrackCasePage } from './pages/citizen/TrackCasePage'
import { ROLES } from './utils/roles'

const qc = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={qc}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public — no nav bar */}
            <Route path="/register" element={<RegisterPage />} />

            {/* Authenticated — all wrapped in AppShell (sticky nav bar) */}
            <Route element={<AppShell />}>
              <Route path="/" element={
                <ProtectedRoute roles={[]}>
                  <Dashboard />
                </ProtectedRoute>
              } />

              {/* Admin */}
              <Route path="/admin/stations" element={
                <ProtectedRoute roles={[ROLES.ADMIN]}>
                  <StationsList />
                </ProtectedRoute>
              } />
              <Route path="/admin/stations/new" element={
                <ProtectedRoute roles={[ROLES.ADMIN]}>
                  <AddStationPage />
                </ProtectedRoute>
              } />
              <Route path="/admin/stations/:id" element={
                <ProtectedRoute roles={[ROLES.ADMIN]}>
                  <StationDetailPage />
                </ProtectedRoute>
              } />
              <Route path="/admin/assignments" element={
                <ProtectedRoute roles={[ROLES.ADMIN]}>
                  <OfficerAssignmentPage />
                </ProtectedRoute>
              } />

              {/* Officer */}
              <Route path="/officer/complaints" element={
                <ProtectedRoute roles={[ROLES.OFFICER, ROLES.ADMIN]}>
                  <ComplaintsInbox />
                </ProtectedRoute>
              } />
              <Route path="/officer/firs" element={
                <ProtectedRoute roles={[ROLES.OFFICER, ROLES.ADMIN]}>
                  <FIRList />
                </ProtectedRoute>
              } />
              <Route path="/officer/firs/:id" element={
                <ProtectedRoute roles={[ROLES.OFFICER, ROLES.ADMIN]}>
                  <FIRDetail />
                </ProtectedRoute>
              } />
              <Route path="/officer/ncr" element={
                <ProtectedRoute roles={[ROLES.OFFICER, ROLES.ADMIN]}>
                  <NCRList />
                </ProtectedRoute>
              } />
              <Route path="/officer/criminals" element={
                <ProtectedRoute roles={[ROLES.OFFICER, ROLES.ADMIN]}>
                  <CriminalSearch />
                </ProtectedRoute>
              } />
              <Route path="/officer/walk-in" element={
                <ProtectedRoute roles={[ROLES.OFFICER, ROLES.ADMIN]}>
                  <WalkInComplaintPage />
                </ProtectedRoute>
              } />

              {/* Magistrate */}
              <Route path="/magistrate/warrants" element={
                <ProtectedRoute roles={[ROLES.MAGISTRATE]}>
                  <WarrantApprovalPage />
                </ProtectedRoute>
              } />
              <Route path="/magistrate/ncr" element={
                <ProtectedRoute roles={[ROLES.MAGISTRATE]}>
                  <MagistrateNCRPage />
                </ProtectedRoute>
              } />
              <Route path="/magistrate/court" element={
                <ProtectedRoute roles={[ROLES.MAGISTRATE]}>
                  <MagistrateCourtPage />
                </ProtectedRoute>
              } />
              <Route path="/magistrate/officers" element={
                <ProtectedRoute roles={[ROLES.MAGISTRATE]}>
                  <MagistrateOfficersPage />
                </ProtectedRoute>
              } />

              {/* Citizen */}
              <Route path="/citizen/file-complaint" element={
                <ProtectedRoute roles={[ROLES.CITIZEN]}>
                  <FileComplaintPage />
                </ProtectedRoute>
              } />
              <Route path="/citizen/track" element={
                <ProtectedRoute roles={[ROLES.CITIZEN]}>
                  <TrackCasePage />
                </ProtectedRoute>
              } />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
