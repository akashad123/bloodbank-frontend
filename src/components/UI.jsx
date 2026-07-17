import { BLOOD_GROUP_COLORS, KERALA_DISTRICTS, BLOOD_GROUPS } from '../utils/constants';
import { Phone, Users, CheckCircle2, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// ─── PageHeader ───────────────────────────────────────────────────────────────
/**
 * Reusable page header component used across ALL user-facing pages.
 * Produces a fixed-height (88px) banner with consistent padding, typography,
 * and alignment so every page feels symmetrical and professionally aligned.
 *
 * Props:
 *  eyebrow   — small all-caps label above the title (e.g. "Dashboard")
 *  title     — main heading text (required)
 *  subtitle  — optional secondary line below title
 *  right     — optional JSX for the right side (buttons, icons, badges)
 *  maxWidth  — Tailwind max-w class (default: "max-w-7xl")
 */
export const PageHeader = ({ eyebrow, title, subtitle, right, maxWidth = 'max-w-7xl' }) => {
  let user = null;
  try {
    const auth = useAuth();
    user = auth?.user;
  } catch (e) {
    // Auth context might not be available in public views
  }

  const isDonor = user?.isQualifiedDonor;
  const isRequester = user?.role === 'requester';
  const isAdmin = user?.role === 'admin';
  const eyebrowColor = isDonor ? 'text-primary' : 'text-slate-600';

  return (
    <div className="page-header">
      <div className={`${maxWidth} py-5 w-full flex items-center justify-between gap-4`}>
        {/* Left: text block */}
        <div className="min-w-0 flex-1">
          {eyebrow && (
            <p className={`text-[10px] font-black uppercase tracking-widest ${eyebrowColor} mb-1 leading-none`}>
              {eyebrow}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-black text-text-primary leading-tight truncate">
              {title}
            </h1>
            {user && (
              isDonor ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-red-150 border border-red-300 text-red-800 text-[10px] font-black tracking-wider uppercase select-none">
                  <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse" />
                  Donor Account
                </span>
              ) : isRequester ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-gray-100 border border-gray-300 text-gray-700 text-[10px] font-black tracking-wider uppercase select-none">
                  <span className="w-1.5 h-1.5 bg-gray-600 rounded-full" />
                  Requester Account
                </span>
              ) : isAdmin ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-primary border border-primary-light text-white text-[10px] font-black tracking-wider uppercase select-none">
                  Admin Account
                </span>
              ) : null
            )}
          </div>
          {subtitle && (
            <p className="text-text-secondary text-xs font-medium mt-0.5 leading-snug">
              {subtitle}
            </p>
          )}
        </div>
        {/* Right: action slot */}
        {right && (
          <div className="flex items-center gap-2 shrink-0">
            {right}
          </div>
        )}
      </div>
    </div>
  );
};

export const BloodGroupBadge = ({ group, size = 'md' }) => {
  const color = BLOOD_GROUP_COLORS[group] || 'bg-primary';
  const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-12 h-12 text-sm', lg: 'w-16 h-16 text-base' };
  return (
    <div className={`${color} ${sizes[size]} flex items-center justify-center text-white font-black border-2 border-black/20 flex-shrink-0`}>
      {group}
    </div>
  );
};

export const StatusBadge = ({ status }) => {
  const map = {
    pending:  'badge-pending',
    assigned: 'badge-approved',   // green — donor assigned
    accepted: 'badge-approved',
    completed: 'badge-approved',
    fulfilled: 'badge-fulfilled',
    cancelled: 'badge-rejected',
  };
  return <span className={`badge ${map[status] || 'badge-pending'}`}>{status}</span>;
};

export const UrgencyBadge = ({ urgency }) => (
  <span className={urgency === 'emergency' ? 'badge badge-emergency' : 'badge badge-normal'}>
    {urgency === 'emergency' ? '🚨 Emergency' : 'Normal'}
  </span>
);

export const EligibilityBanner = ({ eligibility }) => {
  if (!eligibility) return null;
  const isEligible = eligibility.isEligible;
  
  return (
    <div className={`p-4 border shadow-sm ${isEligible ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
      <div className="flex items-center gap-2 mb-1">
        {isEligible ? <CheckCircle2 size={16} className="text-green-600" /> : <Clock size={16} className="text-yellow-600" />}
        <span className="font-bold text-sm tracking-widest uppercase">
          {eligibility.badgeText}
        </span>
      </div>
      
      <div className="mt-3 text-sm flex flex-col gap-1.5">
        <p className="flex justify-between max-w-sm">
          <span className="text-text-muted font-bold">Status:</span>
          <span className={`font-black ${isEligible ? 'text-green-700' : 'text-yellow-700'}`}>
            {eligibility.status}
          </span>
        </p>
        
        {!isEligible && eligibility.status === 'Waiting Period Active' && (
          <>
            <p className="flex justify-between max-w-sm">
              <span className="text-text-muted font-bold">Next Eligible Date:</span>
              <span className="font-bold text-text-primary">{eligibility.nextEligibleDate}</span>
            </p>
            <p className="flex justify-between max-w-sm">
              <span className="text-text-muted font-bold">Days Remaining:</span>
              <span className="font-bold text-text-primary">{eligibility.daysRemaining}</span>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export const LoadingSpinner = ({ message = 'Loading...' }) => (
  <div className="flex flex-col items-center justify-center py-16 gap-3">
    <div className="w-8 h-8 border-4 border-bg-darker border-t-primary animate-spin" />
    <p className="text-text-muted text-sm">{message}</p>
  </div>
);

export const EmptyState = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
    {icon && <div className="text-5xl">{icon}</div>}
    <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
    {description && <p className="text-text-muted text-sm max-w-sm">{description}</p>}
    {action}
  </div>
);

export const DistrictSelector = ({ value, onChange, className = '', required = false, label = 'District' }) => (
  <div>
    <label className="label">{label}</label>
    <select value={value} onChange={onChange} required={required} className={`select ${className}`}>
      <option value="">Select District</option>
      {KERALA_DISTRICTS.map((d) => (
        <option key={d} value={d}>{d}</option>
      ))}
    </select>
  </div>
);

export const BloodGroupSelector = ({ value, onChange, className = '', required = false, label = 'Blood Group' }) => (
  <div>
    <label className="label">{label}</label>
    <select value={value} onChange={onChange} required={required} className={`select ${className}`}>
      <option value="">Select Blood Group</option>
      {BLOOD_GROUPS.map((bg) => (
        <option key={bg} value={bg}>{bg}</option>
      ))}
    </select>
  </div>
);

export const AnalyticsCard = ({ title, value, subtitle, icon: Icon, accent = false }) => (
  <div className={`card flex items-center gap-4 ${accent ? 'border-l-4 border-l-primary' : ''}`}>
    {Icon && (
      <div className={`p-3 ${accent ? 'bg-primary/10' : 'bg-bg-dark'}`}>
        <Icon size={20} className={accent ? 'text-primary' : 'text-text-secondary'} />
      </div>
    )}
    <div>
      <p className="label">{title}</p>
      <p className="text-3xl font-black text-text-primary">{value}</p>
      {subtitle && <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>}
    </div>
  </div>
);

export const CoordinatorContactCard = () => (
  <div className="bg-white border border-gray-150 p-5 shadow-sm relative overflow-hidden" style={{ borderRadius: '0', borderLeft: '4px solid #C8102E' }}>
    <div className="flex items-start gap-4">
      <div className="p-3 bg-red-50 text-primary shrink-0" style={{ borderRadius: '0' }}>
        <Users size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-black text-sm text-text-primary">Contact DYFI Coordinators</h3>
        <p className="text-xs text-text-secondary mt-1 mb-4 leading-relaxed font-medium">
          For privacy and security reasons, direct donor/requester contact details are hidden. Please coordinate through DYFI Mokeri East MC volunteers.
        </p>
      </div>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
      {[
        { name: 'Rahul Tacholi', phone: '9946709455' },
        { name: 'Abhinav PP', phone: '8606839418' },
        { name: 'Shinantu', phone: '8086849291' }
      ].map((admin) => (
        <div key={admin.phone} className="bg-gray-50 p-2.5 border border-gray-200 flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <p className="font-bold text-xs text-text-primary truncate">{admin.name}</p>
            <p className="text-[10px] text-text-muted mt-0.5">{admin.phone}</p>
          </div>
          <a
            href={`tel:${admin.phone}`}
            className="bg-primary hover:bg-primary-dark text-white font-black p-2 hover:shadow-sm transition-all duration-200 shrink-0"
            style={{ borderRadius: '0' }}
            title={`Call ${admin.name}`}
          >
            <Phone size={12} />
          </a>
        </div>
      ))}
    </div>
  </div>
);
