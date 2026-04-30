import { BLOOD_GROUP_COLORS, KERALA_DISTRICTS, BLOOD_GROUPS } from '../utils/constants';

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
    fulfilled: 'badge-fulfilled',
  };
  return <span className={`badge ${map[status] || 'badge-pending'}`}>{status}</span>;
};

export const UrgencyBadge = ({ urgency }) => (
  <span className={urgency === 'emergency' ? 'badge badge-emergency' : 'badge badge-normal'}>
    {urgency === 'emergency' ? '🚨 Emergency' : 'Normal'}
  </span>
);

export const EligibilityBanner = ({ isEligible, daysLeft, lastDonationDate }) => (
  <div className={`px-6 py-4 border-l-4 ${isEligible ? 'border-green-500 bg-green-50' : 'border-yellow-500 bg-yellow-50'}`}>
    <p className="font-semibold text-sm">
      {isEligible ? (
        <span className="text-green-800">✅ You are eligible to donate blood!</span>
      ) : (
        <span className="text-yellow-800">⏳ Not yet eligible — {daysLeft} days remaining</span>
      )}
    </p>
    {lastDonationDate && (
      <p className="text-xs text-text-muted mt-1">
        Last donation: {new Date(lastDonationDate).toLocaleDateString('en-IN')}
      </p>
    )}
  </div>
);

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
