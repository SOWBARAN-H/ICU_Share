import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { EvaluatorToolbar } from './components/EvaluatorToolbar';
import { ProtectedRoute } from './components/ProtectedRoute';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { HowItWorksPage } from './pages/public/HowItWorksPage';
import { ClinicalImpactPage } from './pages/public/ClinicalImpactPage';
import { PortalSelectorPage } from './pages/public/PortalSelectorPage';

// User / Ambulance Portal Pages
import { UserLoginPage, UserSignupPage } from './pages/user/UserAuthPages';
import { UserDashboardPage } from './pages/user/UserDashboardPage';
import { HospitalDetailPage } from './pages/user/HospitalDetailPage';
import { BookBedPage } from './pages/user/BookBedPage';
import { UserBookingsPage } from './pages/user/UserBookingsPage';
import { UserNotificationsPage } from './pages/user/UserNotificationsPage';
import { RouteNavigationPage } from './pages/user/RouteNavigationPage';

// Hospital Command Center Pages
import { HospitalLoginPage, HospitalSignupPage } from './pages/hospital/HospitalAuthPages';
import { HospitalDashboardPage } from './pages/hospital/HospitalDashboardPage';
import { HospitalBedsPage } from './pages/hospital/HospitalBedsPage';
import { HospitalBookingsPage } from './pages/hospital/HospitalBookingsPage';
import { HospitalNotificationsPage } from './pages/hospital/HospitalNotificationsPage';
import { HospitalSettingsPage } from './pages/hospital/HospitalSettingsPage';

export const App = () => {
  return (
    <div className="app-container">
      {/* Universal Telemetry Navigation */}
      <Navbar />

      {/* Main Page Routed View */}
      <main className="main-content">
        <Routes>
          {/* Public Portal Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/clinical-impact" element={<ClinicalImpactPage />} />
          <Route path="/portal" element={<PortalSelectorPage />} />

          {/* User / Ambulance Portal Auth */}
          <Route path="/user/login" element={<UserLoginPage />} />
          <Route path="/user/signup" element={<UserSignupPage />} />

          {/* Protected User Portal Routes */}
          <Route path="/user/dashboard" element={<ProtectedRoute role="user"><UserDashboardPage /></ProtectedRoute>} />
          <Route path="/user/hospital/:hospitalId" element={<ProtectedRoute role="user"><HospitalDetailPage /></ProtectedRoute>} />
          <Route path="/user/book/:hospitalId" element={<ProtectedRoute role="user"><BookBedPage /></ProtectedRoute>} />
          <Route path="/user/bookings" element={<ProtectedRoute role="user"><UserBookingsPage /></ProtectedRoute>} />
          <Route path="/user/notifications" element={<ProtectedRoute role="user"><UserNotificationsPage /></ProtectedRoute>} />
          <Route path="/user/route/:hospitalId" element={<ProtectedRoute role="user"><RouteNavigationPage /></ProtectedRoute>} />

          {/* Hospital Command Center Auth */}
          <Route path="/hospital/login" element={<HospitalLoginPage />} />
          <Route path="/hospital/signup" element={<HospitalSignupPage />} />

          {/* Protected Hospital Command Center Routes */}
          <Route path="/hospital/dashboard" element={<ProtectedRoute role="hospital"><HospitalDashboardPage /></ProtectedRoute>} />
          <Route path="/hospital/beds" element={<ProtectedRoute role="hospital"><HospitalBedsPage /></ProtectedRoute>} />
          <Route path="/hospital/bookings" element={<ProtectedRoute role="hospital"><HospitalBookingsPage /></ProtectedRoute>} />
          <Route path="/hospital/notifications" element={<ProtectedRoute role="hospital"><HospitalNotificationsPage /></ProtectedRoute>} />
          <Route path="/hospital/settings" element={<ProtectedRoute role="hospital"><HospitalSettingsPage /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Evaluator Quick Testing Floating Toolbar */}
      <EvaluatorToolbar />
    </div>
  );
};
export default App;
