import { Link, useNavigate } from 'react-router-dom';
import { Bell, LogOut, User, Droplets, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/requests', label: 'Blood Requests' },
    { to: '/notifications', label: 'Notifications' },
    { to: '/chatbot', label: 'AI Assistant' },
    { to: '/profile', label: 'Profile' },
  ];

  const adminLinks = [
    { to: '/admin', label: 'Dashboard' },
    { to: '/admin/requests', label: 'Requests' },
    { to: '/admin/users', label: 'Donors' },
  ];

  const links = isAdmin ? adminLinks : userLinks;

  return (
    <nav className="bg-text-primary text-white sticky top-0 z-50 border-b-4 border-primary">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to={isAdmin ? '/admin' : '/dashboard'} className="flex items-center gap-2 font-black text-lg tracking-tight">
            <Droplets className="text-primary" size={24} fill="currentColor" />
            <span>
              RED<span className="text-primary">CONNECT</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* District Badge */}
            {user && (
              <span className="hidden md:block text-xs bg-primary/20 border border-primary/40 text-primary-light px-2 py-1 font-medium">
                {user.district}
              </span>
            )}

            {/* Notifications Bell */}
            <Link to="/notifications" className="relative p-2 hover:bg-white/10 transition-colors">
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="notification-dot text-xs">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-white/10 transition-colors text-gray-300 hover:text-white"
              title="Logout"
            >
              <LogOut size={20} />
            </button>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 hover:bg-white/10 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden border-t border-white/10"
          >
            <div className="px-4 py-2 space-y-1">
              {links.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="block px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {user && (
                <div className="px-3 py-2 text-xs text-primary-light border-t border-white/10 mt-2 pt-2">
                  {user.district} · {user.bloodGroup}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
