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
    { to: '/certificates', label: 'Certificates' },
    { to: '/profile', label: 'Profile' },
  ];

  const adminLinks = [
    { to: '/admin', label: 'Dashboard' },
    { to: '/admin/requests', label: 'Requests' },
    { to: '/admin/users', label: 'Donors' },
  ];

  const isDonor = user?.isQualifiedDonor;
  const filteredUserLinks = userLinks.filter(item => {
    if (item.to === '/certificates' || item.to === '/chatbot') {
      return isDonor;
    }
    return true;
  });
  const links = isAdmin ? adminLinks : filteredUserLinks;

  return (
    <nav className="bg-white/90 backdrop-blur-md text-text-primary sticky top-0 z-50 border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to={isAdmin ? '/admin' : '/dashboard'} className="flex items-center gap-1.5 sm:gap-2 font-black text-base sm:text-lg tracking-tight shrink-0">
            <Droplets className="text-primary shrink-0" size={24} fill="currentColor" />
            <span className="flex items-center gap-1.5 sm:gap-2 whitespace-nowrap">
              <span>RED<span className="text-primary">CONNECT</span></span>
              <span className="text-[8px] sm:text-[10px] font-bold text-gray-400 tracking-widest border-l-2 border-primary/50 pl-1.5 sm:pl-2">DYFI MOKERI EAST</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-2">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="px-3 py-2 text-sm font-semibold text-text-secondary hover:text-primary hover:bg-primary-50 transition-all duration-300"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* District Badge */}
            {user && (
              <span className="hidden md:block text-xs bg-primary-50 border border-primary-100 text-primary px-3 py-1.5 font-bold">
                {user.district}
              </span>
            )}

            {/* Notifications Bell */}
            <Link to="/notifications" className="relative p-2.5 hover:bg-primary-50 transition-all duration-300 text-text-secondary hover:text-primary">
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="notification-dot text-[10px]">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="p-2.5 hover:bg-red-50 transition-all duration-300 text-text-secondary hover:text-red-600"
              title="Logout"
            >
              <LogOut size={20} />
            </button>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2.5 hover:bg-primary-50 transition-all duration-300 text-text-secondary hover:text-primary"
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
            className="md:hidden overflow-hidden bg-white border-t border-gray-100 shadow-md"
          >
            <div className="px-4 py-3 space-y-2">
              {links.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="block px-4 py-3 text-sm font-semibold text-text-secondary hover:text-primary hover:bg-primary-50 transition-all duration-300"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {user && (
                <div className="px-4 py-3 text-xs text-primary font-bold bg-primary-50 mt-2">
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
