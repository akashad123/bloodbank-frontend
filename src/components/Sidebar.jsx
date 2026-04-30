import { NavLink, useNavigate } from 'react-router-dom';
import {
  Droplets, LayoutDashboard, Droplet, Bell, Bot,
  User, Users, ClipboardList, LogOut, X,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';

const USER_NAV = [
  { to: '/dashboard',     label: 'Dashboard',     icon: LayoutDashboard },
  { to: '/requests',      label: 'Blood Requests', icon: Droplet },
  { to: '/notifications', label: 'Notifications',  icon: Bell },
  { to: '/chatbot',       label: 'AI Assistant',   icon: Bot },
  { to: '/profile',       label: 'Profile',        icon: User },
];

const ADMIN_NAV = [
  { to: '/admin',          label: 'Dashboard',       icon: LayoutDashboard },
  { to: '/admin/requests', label: 'Manage Requests', icon: ClipboardList },
  { to: '/admin/users',    label: 'Manage Donors',   icon: Users },
];

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout, isAdmin } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const nav = isAdmin ? ADMIN_NAV : USER_NAV;

  const handleLogout = () => {
    logout();
    navigate('/login');
    onClose();
  };

  return (
    <>
      {/* ── Mobile overlay — only visible on small screens when open ── */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          aria-hidden="true"
        />
      )}

      {/*
       * ── Sidebar panel ──
       *
       * IMPORTANT: All classes must be complete static strings so Tailwind
       * JIT can detect them at build time. Do NOT split into array.join().
       *
       * fixed top-0 left-0 h-full w-60 z-40   → always positioned left
       * transform transition-transform duration-300  → enables slide animation
       * lg:translate-x-0                        → ALWAYS visible on desktop
       * translate-x-0 / -translate-x-full       → mobile open/close state
       */}
      <aside
        className={`fixed top-0 left-0 h-full w-60 z-40 flex flex-col bg-[#111111] border-r-4 border-[#CD0000] transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-4 border-b border-white/10 min-h-[60px]">
          <NavLink
            to={isAdmin ? '/admin' : '/dashboard'}
            onClick={onClose}
            className="flex items-center gap-2"
            style={{ textDecoration: 'none' }}
          >
            <Droplets size={20} color="#CD0000" fill="#CD0000" />
            <span className="text-white font-black text-base tracking-tight">
              RED<span style={{ color: '#CD0000' }}>CONNECT</span>
            </span>
          </NavLink>

          {/* Close — mobile only */}
          <button
            onClick={onClose}
            className="lg:hidden text-gray-500 hover:text-white transition-colors p-1"
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>


        {/* ── Nav links ── */}
        <nav className="flex-1 py-2 overflow-y-auto">
          {nav.map(({ to, label, icon: Icon }) => {
            const hasBadge = label === 'Notifications' && unreadCount > 0;
            return (
              <NavLink
                key={to}
                to={to}
                end={to === '/admin' || to === '/dashboard'}
                onClick={onClose}
                style={{ textDecoration: 'none' }}
                className={({ isActive }) =>
                  `flex items-center gap-3 mx-2 my-0.5 px-3 py-2.5 text-[13.5px] font-medium transition-colors duration-150 border-l-[3px] ${
                    isActive
                      ? 'bg-[#CD0000] text-white border-[#ff5555]'
                      : 'text-gray-400 border-transparent hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                <Icon size={17} strokeWidth={2} className="flex-shrink-0" />
                <span className="flex-1">{label}</span>
                {hasBadge && (
                  <span className="flex items-center justify-center w-5 h-5 bg-white text-[#CD0000] text-[10px] font-black rounded-full">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* ── Sign out ── */}
        <div className="p-2 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-[13.5px] font-medium text-gray-400 hover:bg-white/5 hover:text-white transition-colors duration-150"
          >
            <LogOut size={17} strokeWidth={2} className="flex-shrink-0" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
