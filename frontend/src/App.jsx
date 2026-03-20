import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import CookieBanner from './components/CookieBanner'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import HomePage from './pages/HomePage'
import BookingPage from './pages/BookingPage'
import ProfilePage from './pages/ProfilePage'
import AdminPage from './pages/AdminPage'
import LandingPage from './pages/LandingPage'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'
import CookiePolicyPage from './pages/CookiePolicyPage'
import VerifyEmailPage from './pages/VerifyEmailPage'

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-dvh bg-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />
  return children
}

export default function App() {
  const { user, loading } = useAuth()

  return (
    <div className="min-h-dvh bg-bg bg-opale-gradient">
      {user && <Navbar />}
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
        <Route path="/register" element={user ? <Navigate to="/" replace /> : <RegisterPage />} />
        <Route path="/recupera-password" element={user ? <Navigate to="/" replace /> : <ForgotPasswordPage />} />
        <Route path="/reset-password" element={user ? <Navigate to="/" replace /> : <ResetPasswordPage />} />
        <Route path="/verifica-email" element={<VerifyEmailPage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/cookie" element={<CookiePolicyPage />} />
        <Route path="/" element={
          loading ? (
            <div className="min-h-dvh bg-bg flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : user ? (
            <HomePage />
          ) : (
            <LandingPage />
          )
        } />
        <Route path="/prenota" element={<ProtectedRoute><BookingPage /></ProtectedRoute>} />
        <Route path="/profilo" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute adminOnly><AdminPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <CookieBanner />
    </div>
  )
}
