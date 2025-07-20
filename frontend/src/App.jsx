import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AccessibilityProvider } from './components/common/AccessibilityProvider';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import VerificationForm from './components/auth/VerificationForm';
import StudentDashboard from './components/student/Dashboard';
import ArtisanDashboard from './components/artisan/Dashboard';
import EmployerDashboard from './components/employer/Dashboard';
import AdminDashboard from './components/admin/Dashboard';
import Profile from './components/common/Profile';
import ForgotPasswordForm from './components/auth/ForgotPasswordForm';
import ResetPasswordForm from './components/auth/ResetPasswordForm';
import { UserProvider, useUser } from './context/UserContext';
import Sidebar from './components/common/Sidebar';
import AssessmentView from './components/student/AssessmentView';
import LearningContent from './components/student/LearningContent';
import ProgressTracker from './components/student/ProgressTracker';
import SkillAssessment from './components/artisan/SkillAssessment';
import CertificateView from './components/artisan/CertificateView';
import Portfolio from './components/artisan/Portfolio';
import JobSearch from './components/artisan/JobSearch';
import CandidateSearch from './components/employer/CandidateSearch';
import ApplicationManager from './components/employer/ApplicationManager';
import UserManager from './components/admin/UserManager';
import JobManager from './components/admin/JobManager';
import PaymentManager from './components/admin/PaymentManager';
import 'bootstrap/dist/css/bootstrap.min.css';

function ProtectedRoute({ children }) {
  const { user, loading } = useUser();
  if (loading) return null;
  return user ? children : <Navigate to="/login" />;
}

function DashboardRouter() {
  const { user } = useUser();
  if (!user) return <Navigate to="/login" />;
  switch (user.role) {
    case 'student':
      return <StudentDashboard />;
    case 'artisan':
      return <ArtisanDashboard />;
    case 'employer':
      return <EmployerDashboard />;
    case 'admin':
      return <AdminDashboard />;
    default:
      return <div style={{ textAlign: 'center', marginTop: 40 }}>Unknown role</div>;
  }
}

function ProtectedLayout({ children }) {
  const { user } = useUser();
  return (
    <div style={{ display: 'flex', minHeight: '70vh' }}>
      <Sidebar role={user?.role} />
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
}

function AppRoutes() {
  const { user, login, logout } = useUser();
  const [registered, setRegistered] = React.useState(false);
  const [verified, setVerified] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const resetToken = searchParams.get('token');

  // Redirect to dashboard after login
  const handleLogin = (userData, tokens) => {
    login(userData, tokens);
    navigate('/dashboard');
  };

  return (
    <>
      <Header user={user} onLogout={logout} />
      <main style={{ minHeight: '70vh' }}>
        <Routes>
          <Route path="/" element={<Navigate to={user ? '/dashboard' : '/login'} />} />
          <Route
            path="/login"
            element={
              user ? (
                <Navigate to="/dashboard" />
              ) : (
                <LoginForm onLogin={handleLogin} />
              )
            }
          />
          <Route
            path="/register"
            element={
              registered ? (
                <Navigate to="/verify" />
              ) : (
                <RegisterForm onRegister={() => setRegistered(true)} />
              )
            }
          />
          <Route
            path="/verify"
            element={
              verified ? (
                <Navigate to="/login" />
              ) : (
                <VerificationForm onVerify={() => setVerified(true)} />
              )
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <DashboardRouter />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Profile />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={<ForgotPasswordForm />}
          />
          <Route
            path="/reset-password"
            element={<ResetPasswordForm token={resetToken} />}
          />
          <Route
            path="/assessments"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <AssessmentView />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/content"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <LearningContent />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/progress"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <ProgressTracker />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/skills"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <SkillAssessment />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/certificates"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <CertificateView />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/portfolio"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Portfolio />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/jobs"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <JobSearch />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/candidates"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <CandidateSearch />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/applications"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <ApplicationManager />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <UserManager />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/jobs"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <JobManager />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/payments"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <PaymentManager />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

function App() {
  return (
    <UserProvider>
      <Router>
        <AccessibilityProvider>
          <AppRoutes />
        </AccessibilityProvider>
      </Router>
    </UserProvider>
  );
}

export default App;
