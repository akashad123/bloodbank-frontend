import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ProtectedRoute, AdminRoute, PublicRoute, DonorRoute } from './components/ProtectedRoute';
import Layout from './components/Layout';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import Profile from './pages/Profile';
import RequestList from './pages/RequestList';
import CreateRequest from './pages/CreateRequest';
import EditRequest from './pages/EditRequest';
import RequestDetail from './pages/RequestDetail';
import Notifications from './pages/Notifications';
import Chatbot from './pages/Chatbot';
import Certificates from './pages/Certificates';
import AdminDashboard from './pages/AdminDashboard';
import AdminRequests from './pages/AdminRequests';
import AdminUsers from './pages/AdminUsers';
import AdminUserManagement from './pages/AdminUserManagement';
import AdminHospitals from './pages/AdminHospitals';
import AdminContacts from './pages/AdminContacts';

function AppRoutes() {
  return (
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
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
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
