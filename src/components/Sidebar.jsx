import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Droplets, LayoutDashboard, Droplet, Bell, Bot,
  User, Users, ClipboardList, LogOut, X, Award, Building2,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';

/* ── Navigation config ── */
const USER_NAV = [
  { to: '/dashboard',     label: 'Dashboard',      icon: LayoutDashboard },
  { to: '/requests',      label: 'Blood Requests',  icon: Droplet },
  { to: '/notifications', label: 'Notifications',   icon: Bell },
  { to: '/chatbot',       label: 'AI Assistant',    icon: Bot },
  { to: '/certificates',  label: 'Certificates',    icon: Award },
  { to: '/profile',       label: 'Profile',         icon: User },
];

const ADMIN_NAV = [
  { to: '/admin',           label: 'Dashboard',       icon: LayoutDashboard, exact: true },
  { to: '/admin/requests',  label: 'Manage Requests', icon: ClipboardList,   exact: false },
  { to: '/admin/users',     label: 'Manage Donors',   icon: Users,           exact: false },
  { to: '/admin/hospitals', label: 'Hospitals',        icon: Building2,       exact: false },
];

/**
 * Determine whether a nav link is currently active.
 * Exact links require an exact pathname match.
 * Non-exact links match if the pathname starts with the link's `to`.
 */
function isNavActive(pathname, to, exact) {
  return exact ? pathname === to : pathname.startsWith(to);
}

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout, isAdmin } = useAuth();
  const { unreadCount, unreadCertificatesCount } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  const isDonor = user?.isQualifiedDonor;
  const filteredUserNav = USER_NAV.filter(item => {
    if (item.to === '/certificates' || item.to === '/chatbot') {
      return isDonor;
    }
    return true;
  });
  const nav = isAdmin ? ADMIN_NAV : filteredUserNav;

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
        className={`fixed top-0 left-0 h-full w-60 z-40 flex flex-col transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{
          /* Admin: deep charcoal | User: clean white */
          background: isAdmin ? '#111111' : '#FFFFFF',
          borderRight: isAdmin ? '1px solid rgba(255,255,255,0.08)' : '1px solid #F3F3F3',
          boxShadow: isAdmin ? '4px 0 24px rgba(0,0,0,0.35)' : '2px 0 8px rgba(0,0,0,0.04)',
        }}
      >
        {/* ── Header ── */}
        <div
          className="flex items-center justify-between px-4 py-7 min-h-[60px]"
          style={{
            borderBottom: isAdmin ? '1px solid rgba(255,255,255,0.08)' : '1px solid #F3F3F3',
          }}
        >
          <Link
            to={isAdmin ? '/admin' : '/dashboard'}
            onClick={onClose}
            className="flex items-center gap-1.5"
            style={{ textDecoration: 'none' }}
          >
            <Droplets size={20} fill="currentColor" style={{ color: '#B03030' }} className="shrink-0" />
            <span className="flex items-center gap-1.5 ">
              <span
                className="font-black text-base tracking-tight"
                style={{ color: isAdmin ? '#FFFFFF' : '#111111' }}
              >
                RED<span style={{ color: '#B03030' }}>CONNECT</span>
              </span>
              <span
                className="text-[9px] font-bold tracking-widest pl-1.5"
                style={{
                  color: isAdmin ? '#666666' : '#AAAAAA',
                  borderLeft: '2px solid rgba(176,48,48,0.40)',
                }}
              >
                DYFI MOKERI EAST
              </span>
            </span>
          </Link>

          {/* Close — mobile only */}
          <button
            onClick={onClose}
            className="lg:hidden p-1 transition-colors"
            style={{ color: isAdmin ? '#666666' : '#AAAAAA' }}
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Nav links ── */}
        <nav className="flex-1 py-2 overflow-y-auto">
          {nav.map(({ to, label, icon: Icon, exact }) => {
            const hasBadge = label === 'Notifications' && unreadCount > 0;
            const hasCertBadge = label === 'Certificates' && unreadCertificatesCount > 0;
            /* Determine active state using useLocation instead of NavLink render-prop */
            const userExact = to === '/dashboard';
            const active = isAdmin
              ? isNavActive(location.pathname, to, exact ?? false)
              : isNavActive(location.pathname, to, userExact);

            if (isAdmin) {
              /* ── Admin nav item: dark charcoal theme ── */
              return (
                <Link
                  key={to}
                  to={to}
                  onClick={onClose}
                  className="relative flex items-center gap-3 mx-2 my-0.5 px-3 py-2.5 text-sm font-semibold transition-all duration-300"
                  style={{
                    textDecoration: 'none',
                    color: active ? '#FFFFFF' : '#888888',
                    background: active ? 'rgba(255,255,255,0.09)' : 'transparent',
                  }}
                  onMouseEnter={e => {
                    if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                    if (!active) e.currentTarget.style.color = '#DDDDDD';
                  }}
                  onMouseLeave={e => {
                    if (!active) e.currentTarget.style.background = 'transparent';
                    if (!active) e.currentTarget.style.color = '#888888';
                  }}
                >
                  {/* Left red accent bar for active admin item */}
                  {active && (
                    <span
                      className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[3px]"
                      style={{ background: '#B03030' }}
                    />
                  )}
                  <Icon size={18} strokeWidth={2.5} className="flex-shrink-0" />
                  <span className="flex-1">{label}</span>
                  {hasBadge && (
                    <span className="flex items-center justify-center w-5 h-5 bg-primary text-white text-[10px] font-black rounded-full">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                  {hasCertBadge && (
                    <span className="flex items-center justify-center w-5 h-5 bg-primary text-white text-[10px] font-black rounded-full">
                      {unreadCertificatesCount > 9 ? '9+' : unreadCertificatesCount}
                    </span>
                  )}
                </Link>
              );
            }

            /* ── User nav item: existing red-accent style ── */
            return (
              <Link
                key={to}
                to={to}
                onClick={onClose}
                className={`flex items-center gap-3 mx-2 my-1 px-3 py-2.5 text-sm font-semibold transition-all duration-300 ${
                  active
                    ? 'bg-primary-50 text-primary'
                    : 'text-text-secondary hover:bg-primary-50 hover:text-primary'
                }`}
                style={{ textDecoration: 'none' }}
              >
                <Icon size={18} strokeWidth={2.5} className="flex-shrink-0" />
                <span className="flex-1">{label}</span>
                {hasBadge && (
                  <span className="flex items-center justify-center w-5 h-5 bg-primary text-white text-[10px] font-black rounded-full">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
                {hasCertBadge && (
                  <span className="flex items-center justify-center w-5 h-5 bg-primary text-white text-[10px] font-black rounded-full">
                    {unreadCertificatesCount > 9 ? '9+' : unreadCertificatesCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* ── Sign out ── */}
        <div
          className="p-4"
          style={{ borderTop: isAdmin ? '1px solid rgba(255,255,255,0.08)' : '1px solid #F3F3F3' }}
        >
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-all duration-300"
            style={{ color: isAdmin ? '#888888' : '#777777' }}
            onMouseEnter={e => {
              e.currentTarget.style.background = isAdmin ? 'rgba(220,38,38,0.15)' : 'rgba(220,38,38,0.06)';
              e.currentTarget.style.color = '#DC2626';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = isAdmin ? '#888888' : '#777777';
            }}
          >
            <LogOut size={18} strokeWidth={2.5} className="flex-shrink-0" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
