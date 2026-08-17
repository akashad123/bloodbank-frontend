import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ProtectedRoute, AdminRoute, PublicRoute, DonorRoute } from './components/ProtectedRoute';
import Layout from './components/Layout';
import NetworkStatus from './components/NetworkStatus';
import ProfileCompletionModal from './components/ProfileCompletionModal';
import PageLoader from './components/PageLoader';
import ErrorBoundary from './components/ErrorBoundary';

// ── Public Pages (Lazy Loaded) ────────────────────────────────────────────────
const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));

// ── User Portal Pages (Lazy Loaded) ───────────────────────────────────────────
const UserDashboard = lazy(() => import('./pages/UserDashboard'));
const Profile = lazy(() => import('./pages/Profile'));
const RequestList = lazy(() => import('./pages/RequestList'));
const CreateRequest = lazy(() => import('./pages/CreateRequest'));
const EditRequest = lazy(() => import('./pages/EditRequest'));
const RequestDetail = lazy(() => import('./pages/RequestDetail'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Chatbot = lazy(() => import('./pages/Chatbot'));
const Certificates = lazy(() => import('./pages/Certificates'));

// ── Admin Portal Pages (Lazy Loaded) ──────────────────────────────────────────
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminRequests = lazy(() => import('./pages/AdminRequests'));
const AdminUsers = lazy(() => import('./pages/AdminUsers'));
const AdminUserManagement = lazy(() => import('./pages/AdminUserManagement'));
const AdminHospitals = lazy(() => import('./pages/AdminHospitals'));
const AdminContacts = lazy(() => import('./pages/AdminContacts'));

function AppRoutes() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public — redirect to dashboard if already logged in */}
          <Route element={<PublicRoute />}>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Protected — any logged-in user — wrapped in sidebar Layout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard"      element={<UserDashboard />} />
              <Route path="/profile"        element={<Profile />} />
              <Route path="/notifications"  element={<Notifications />} />
              
              {/* Shared Request Detail (Donors view assigned donations, Requesters view created requests) */}
              <Route path="/requests/:id"   element={<RequestDetail />} />

              {/* All Users can Request Blood */}
              <Route path="/requests"       element={<RequestList />} />
              <Route path="/requests/new"   element={<CreateRequest />} />
              <Route path="/create-request" element={<Navigate to="/requests/new" replace />} />
              <Route path="/requests/:id/edit" element={<EditRequest />} />
              
              {/* Donor Only Routes */}
              <Route element={<DonorRoute />}>
                <Route path="/chatbot"        element={<Chatbot />} />
                <Route path="/certificates"   element={<Certificates />} />
              </Route>
            </Route>
          </Route>

          <Route element={<AdminRoute />}>
            <Route element={<Layout />}>
              <Route path="/admin"          element={<AdminDashboard />} />
              <Route path="/admin/requests" element={<AdminRequests />} />
              <Route path="/admin/users"    element={<AdminUsers />} />
              <Route path="/admin/manage-users" element={<AdminUserManagement />} />
              <Route path="/admin/hospitals" element={<AdminHospitals />} />
              <Route path="/admin/contacts" element={<AdminContacts />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <NetworkStatus />
          <ProfileCompletionModal />
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                borderRadius: '0',
                border: '1px solid #E9ECEF',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                fontWeight: '500',
                color: '#1A1A1A',
              },
              success: {
                style: { borderLeft: '4px solid #22c55e' },
              },
              error: {
                style: { borderLeft: '4px solid #C8102E' },
              },
            }}
          />
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
