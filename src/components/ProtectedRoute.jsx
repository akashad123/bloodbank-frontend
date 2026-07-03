import { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export const AccessDeniedRedirect = ({ to = '/dashboard' }) => {
  useEffect(() => {
    toast.error('Access Denied');
  }, []);
  return <Navigate to={to} replace />;
};

export const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen bg-bg"><div className="text-primary font-bold text-xl animate-pulse">Loading...</div></div>;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export const AdminRoute = () => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen bg-bg"><div className="text-primary font-bold text-xl animate-pulse">Loading...</div></div>;
  if (!user) return <Navigate to="/login" replace />;
  return user.role === 'admin' ? <Outlet /> : <AccessDeniedRedirect to="/dashboard" />;
};

export const DonorRoute = () => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen bg-bg"><div className="text-primary font-bold text-xl animate-pulse">Loading...</div></div>;
  if (!user) return <Navigate to="/login" replace />;
  return user.role === 'donor' ? <Outlet /> : <AccessDeniedRedirect to="/dashboard" />;
};

export const RequesterRoute = () => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen bg-bg"><div className="text-primary font-bold text-xl animate-pulse">Loading...</div></div>;
  if (!user) return <Navigate to="/login" replace />;
  return user.role === 'requester' ? <Outlet /> : <AccessDeniedRedirect to="/dashboard" />;
};

export const PublicRoute = () => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen bg-bg"><div className="text-primary font-bold text-xl animate-pulse">Loading...</div></div>;
  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  return <Outlet />;
};
