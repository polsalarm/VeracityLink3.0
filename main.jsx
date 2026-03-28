import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './frontend/pages/landing_page'
import StudentProfile from './frontend/pages/student_profile'
import UniversityAdminDashboard from './frontend/pages/university_dashboard_admin'
import AdminLogin from './frontend/pages/admin_login'
import VerificationPortal from './frontend/pages/verification_portal'

import RegistrationPage from './frontend/pages/registration_page'
import RegistrationGate from './frontend/components/RegistrationGate'
import DocumentationPage from './frontend/pages/documentation_page'

import { StellarWalletProvider } from './frontend/context/StellarWalletProvider'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <StellarWalletProvider>
      <BrowserRouter>
        <RegistrationGate>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/register" element={<RegistrationPage />} />
            <Route path="/profile" element={<StudentProfile />} />
            <Route path="/admin" element={<UniversityAdminDashboard />} />
            <Route path="/login" element={<AdminLogin />} />
            <Route path="/verify" element={<VerificationPortal />} />
            <Route path="/docs" element={<DocumentationPage />} />
          </Routes>
        </RegistrationGate>
      </BrowserRouter>
    </StellarWalletProvider>
  </React.StrictMode>,
)
