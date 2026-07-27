import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export const AccessDeniedRedirect = ({ to = '/dashboard' }) => {
  useEffect(() => {
    toast.error('Access Denied');
  }, []);
  return <Navigate to={to} replace />;
};

const getFullPath = (location) => {
  return location.pathname + location.search + location.hash;
};

export const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="flex items-center justify-center h-screen bg-bg"><div className="text-primary font-bold text-xl animate-pulse">Restoring session...</div></div>;

  if (!user) {
    const fullPath = getFullPath(location);
    if (fullPath && fullPath !== '/' && fullPath !== '/login' && fullPath !== '/register') {
      if (!sessionStorage.getItem('redirect_after_login')) {
        sessionStorage.setItem('redirect_after_login', fullPath);
      }
    }
    return <Navigate to="/login" state={{ from: fullPath }} replace />;
  }

  return <Outlet />;
};

export const AdminRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="flex items-center justify-center h-screen bg-bg"><div className="text-primary font-bold text-xl animate-pulse">Restoring session...</div></div>;

  if (!user) {
    const fullPath = getFullPath(location);
    if (fullPath && fullPath !== '/' && fullPath !== '/login' && fullPath !== '/register') {
      if (!sessionStorage.getItem('redirect_after_login')) {
        sessionStorage.setItem('redirect_after_login', fullPath);
      }
    }
    return <Navigate to="/login" state={{ from: fullPath }} replace />;
  }

  return user.role === 'admin' ? <Outlet /> : <AccessDeniedRedirect to="/dashboard" />;
};

export const DonorRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="flex items-center justify-center h-screen bg-bg"><div className="text-primary font-bold text-xl animate-pulse">Restoring session...</div></div>;

  if (!user) {
    const fullPath = getFullPath(location);
    if (fullPath && fullPath !== '/' && fullPath !== '/login' && fullPath !== '/register') {
      if (!sessionStorage.getItem('redirect_after_login')) {
        sessionStorage.setItem('redirect_after_login', fullPath);
      }
    }
    return <Navigate to="/login" state={{ from: fullPath }} replace />;
  }

  return user.isQualifiedDonor ? <Outlet /> : <AccessDeniedRedirect to="/dashboard" />;
};

export const PublicRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="flex items-center justify-center h-screen bg-bg"><div className="text-primary font-bold text-xl animate-pulse">Restoring session...</div></div>;

  if (user) {
    const fromState = location.state?.from;
    const fromSession = sessionStorage.getItem('redirect_after_login');
    let target = fromState || fromSession;
    if (typeof target === 'object' && target?.pathname) {
      target = target.pathname + (target.search || '') + (target.hash || '');
    }

    // Validate target is a valid internal route (starts with / and not //)
    if (target && typeof target === 'string' && target.startsWith('/') && !target.startsWith('//') && target !== '/login' && target !== '/register') {
      sessionStorage.removeItem('redirect_after_login');
      return <Navigate to={target} replace />;
    }

    return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  }

  return <Outlet />;
};
