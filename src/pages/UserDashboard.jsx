import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Clock, CheckCircle, AlertTriangle, Users, Droplets, Award, Phone, ClipboardList, Bell, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { BloodGroupBadge, EligibilityBanner, StatusBadge, UrgencyBadge, LoadingSpinner, PageHeader } from '../components/UI';
import api from '../api/axios';
import { timeAgo, formatDate } from '../utils/constants';
import toast from 'react-hot-toast';

export default function UserDashboard() {
  const { user } = useAuth();
  const [eligibility, setEligibility] = useState(null);
  const [requests, setRequests] = useState([]);
  const [requestsTotal, setRequestsTotal] = useState(0);
  const [certCount, setCertCount] = useState(0);
  const [assignedRequests, setAssignedRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const isDonor = user?.role === 'donor';

  const fetchAssigned = async () => {
    try {
      const { data } = await api.get('/requests/assigned');
      setAssignedRequests(data.requests ?? []);
    } catch (err) {
      console.error('[Dashboard] assigned fetch error:', err.message);
    }
  };

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [eRes, rRes, cRes, aRes] = await Promise.all([
          api.get('/users/eligibility'),
          api.get('/requests/my?limit=100'),
          api.get('/certificates/count'),
          api.get('/requests/assigned'),
        ]);
        setEligibility(eRes.data);
        setRequests(rRes.data.requests ?? []);
        setRequestsTotal(rRes.data.total ?? 0);
        setCertCount(cRes.data.count ?? 0);
        setAssignedRequests(aRes.data.requests ?? []);
      } catch (err) {
        console.error('[Dashboard] fetch error:', err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleAccept = async (reqId) => {
    try {
      await api.put(`/requests/${reqId}/accept`);
      toast.success('Request accepted! Please contact the requester.');
      await fetchAssigned();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to accept request');
    }
  };

  const handleReject = async (reqId) => {
    if (!confirm('Are you sure you want to reject this donation assignment?')) return;
    try {
      await api.put(`/requests/${reqId}/reject`);
      toast.success('Assignment rejected.');
      await fetchAssigned();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject request');
    }
  };

  const handleComplete = async (reqId) => {
    if (!confirm('Mark this blood donation as completed? This will alert the admins for verification.')) return;
    try {
      await api.put(`/requests/${reqId}/complete`);
      toast.success('Marked as completed! Awaiting admin verification.');
      await fetchAssigned();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update request');
    }
  };

  const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const assignedCount = requests.filter(r => r.status === 'assigned' || r.status === 'accepted' || r.status === 'completed').length;
  const fulfilledCount = requests.filter(r => r.status === 'fulfilled').length;

  const colors = isDonor ? {
    text: 'text-primary',
    bg: 'bg-primary',
    hoverBg: 'hover:bg-primary-dark',
    border: 'border-primary',
    lightBg: 'bg-primary-50',
    lightBorder: 'border-primary-100',
    btn: 'btn-primary',
    accentBadge: 'border-primary bg-primary-50/30',
    recentHover: 'hover:border-primary',
    sidebarActive: 'bg-primary-50 text-primary'
  } : {
    text: 'text-slate-700',
    bg: 'bg-slate-700',
    hoverBg: 'hover:bg-slate-800',
    border: 'border-slate-700',
    lightBg: 'bg-slate-50',
    lightBorder: 'border-slate-200',
    btn: 'bg-slate-700 text-white hover:bg-slate-800 transition-colors uppercase tracking-wider font-semibold text-sm px-6 py-3 focus:outline-none focus:ring-2 focus:ring-slate-700 focus:ring-offset-2',
    accentBadge: 'border-slate-500 bg-slate-50',
    recentHover: 'hover:border-slate-600',
    sidebarActive: 'bg-slate-50 text-slate-700'
  };

  const statsItems = isDonor
    ? [
        { label: 'Blood Group', value: user?.bloodGroup || '—', icon: Droplets, accent: true },
        { label: 'Eligibility', value: (() => {
          const map = {
            'Eligible to Donate': 'Eligible',
            'Waiting Period Active': 'Waiting',
            'Eligibility Unknown': 'Unknown',
            'Pending Screening': 'Pending',
            'Screening Failed': 'Ineligible'
          };
          return map[user?.donorStatus] || 'Pending';
        })(), icon: CheckCircle, accent: eligibility?.isEligible },
        { label: 'Days Since', value: eligibility?.daysSinceDonation ?? '—', icon: Clock },
        { label: 'Certificates', value: certCount, icon: Award },
        { label: 'District', value: user?.district?.slice(0, 8) + (user?.district?.length > 8 ? '…' : '') || '—', icon: Users },
      ]
    : [
        { label: 'Total Requests', value: requestsTotal, icon: ClipboardList, accent: true },
        { label: 'Pending Approval', value: pendingCount, icon: Clock },
        { label: 'Donors Assigned', value: assignedCount, icon: CheckCircle },
        { label: 'Fulfilled Requests', value: fulfilledCount, icon: Award },
        { label: 'District', value: user?.district?.slice(0, 8) + (user?.district?.length > 8 ? '…' : '') || '—', icon: Users },
      ];

  const quickActions = isDonor
    ? [
        { to: '/chatbot', title: 'AI Assistant', desc: 'Ask RedConnect AI', icon: AlertTriangle, primary: true },
        { to: '/certificates', title: 'Certificates', desc: 'Download my certificates', icon: Award },
        { to: '/notifications', title: 'Notifications', desc: 'Check your alerts', icon: Bell },
        { to: '/profile', title: 'My Profile', desc: 'Manage your account', icon: User }
      ]
    : [
        { to: '/requests/new', title: 'New Blood Request', desc: 'Create an urgent request', icon: Plus, primary: true },
        { to: '/requests', title: 'View My Requests', desc: 'Manage your active requests', icon: Droplets },
        { to: '/notifications', title: 'Notifications', desc: 'Check your alerts', icon: Bell }
      ];

  if (loading) return <><LoadingSpinner message="Loading dashboard..." /></>;

  return (
    <div className="min-h-screen bg-gray-50/50">
      
      <PageHeader
        eyebrow="Dashboard"
        title={`Welcome, ${user?.name?.split(' ')[0] ?? ''}`}
        subtitle={[user?.district, isDonor ? user?.bloodGroup : null].filter(Boolean).join('  ·  ')}
      />

      <div className="max-w-7xl mx-auto px-6 pt-6 pb-8 space-y-6">
        
        {/* Dynamic Welcome Card */}
        <motion.div variants={fadeUp} initial="hidden" animate="show">
          {isDonor ? (
            <div className="relative overflow-hidden bg-gradient-to-r from-red-50 to-white border border-red-100 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6" style={{ borderRadius: '0' }}>
              {/* Left: icon and text */}
              <div className="flex items-start gap-4">
                <div className="p-3 bg-red-50 text-primary shrink-0 animate-pulse" style={{ borderRadius: '0' }}>
                  <Droplets size={32} fill="currentColor" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary">DONOR DASHBOARD</span>
                  <h2 className="text-xl font-black text-text-primary uppercase tracking-tight">Thank you for being a lifesaver</h2>
                  <p className="text-text-secondary text-sm leading-relaxed max-w-xl">
                    Your readiness to donate blood saves lives. Keep your details updated, track your eligibility status below, and view any assigned donation requests.
                  </p>
                  {/* Certificate highlights */}
                  {certCount > 0 ? (
                    <div className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-red-800 bg-red-50 px-2.5 py-1 border border-red-200" style={{ borderRadius: '0' }}>
                      🏆 You have earned {certCount} donation certificate{certCount > 1 ? 's' : ''}!
                      <Link to="/certificates" className="underline hover:text-red-950 ml-1">View & Download</Link>
                    </div>
                  ) : (
                    <p className="text-xs text-text-muted mt-2">No certificates earned yet. Complete your assigned donations to receive recognition certificates.</p>
                  )}
                </div>
              </div>
              {/* Right: eligibility summary */}
              <div className="shrink-0 w-full md:w-auto bg-white border border-gray-150 p-4 min-w-[220px]" style={{ borderRadius: '0' }}>
                <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1.5">Your Eligibility Status</p>
                <p className="text-sm font-bold text-text-primary">{user?.donorStatus || 'Pending Pre-screening'}</p>
                <p className="text-xs text-text-secondary mt-1">
                  {eligibility?.isEligible 
                    ? "✅ Ready to donate today" 
                    : `⏳ Waiting period active (${eligibility?.daysUntilEligible || 0} days remaining)`
                  }
                </p>
              </div>
            </div>
          ) : (
            <div className="relative overflow-hidden bg-gradient-to-r from-slate-50 to-white border border-gray-200 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6" style={{ borderRadius: '0' }}>
              {/* Left: icon and text */}
              <div className="flex items-start gap-4">
                <div className="p-3 bg-slate-50 text-slate-700 shrink-0" style={{ borderRadius: '0' }}>
                  <ClipboardList size={32} />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">REQUESTER PANEL</span>
                  <h2 className="text-xl font-black text-text-primary uppercase tracking-tight">Emergency blood request support</h2>
                  <p className="text-text-secondary text-sm leading-relaxed max-w-xl">
                    Need blood for yourself or a loved one? Create an urgent request below and our system will match you with eligible, verified donors in your area.
                  </p>
                  {/* Request tracking focus & active status */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-gray-200 text-xs font-bold text-text-primary" style={{ borderRadius: '0' }}>
                      📊 Active Requests: {requestsTotal}
                    </span>
                    {pendingCount > 0 && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-250 text-xs font-bold text-amber-800" style={{ borderRadius: '0' }}>
                        ⏳ Pending Admin Approval: {pendingCount}
                      </span>
                    )}
                    {assignedCount > 0 && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 border border-green-200 text-xs font-bold text-green-700" style={{ borderRadius: '0' }}>
                        🤝 Donors Assigned: {assignedCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {/* Right: support info */}
              <div className="shrink-0 w-full md:w-auto bg-white border border-gray-150 p-4 min-w-[220px]" style={{ borderRadius: '0' }}>
                <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1.5">Direct Helpdesk</p>
                <p className="text-xs font-bold text-text-primary">DYFI Mokeri East MC</p>
                <p className="text-xs text-text-secondary mt-1">Rahul Tacholi: 9946709455</p>
                <p className="text-xs text-text-secondary">Abhinav PP: 8606839418</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Assigned Blood Donations - Donor Only */}
        {isDonor && assignedRequests.length > 0 && (
          <motion.div variants={fadeUp} initial="hidden" animate="show" className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-6 bg-primary" />
              <h2 className="text-xl font-black text-text-primary">Donation Requests Assigned to You</h2>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {assignedRequests.map((req) => (
                <div
                  key={req._id}
                  className="bg-white p-5 shadow-sm border border-gray-200 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4"
                  style={{ borderRadius: '0', borderLeft: '4px solid #C8102E' }}
                >
                  <div className="flex items-start gap-4 min-w-0 flex-1">
                    <BloodGroupBadge group={req.bloodGroup} size="md" />
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-base text-text-primary">{req.hospital}</span>
                        <UrgencyBadge urgency={req.urgency} />
                        <StatusBadge status={req.status} />
                      </div>
                      <p className="text-xs text-text-secondary font-medium">📍 District: {req.district}</p>
                      <p className="text-xs text-text-muted">
                        Requested by <strong className="text-text-secondary">{req.createdBy?.name || 'Requester'}</strong> &bull; {req.units} unit(s)
                      </p>
                      
                      {/* Show admin coordination contacts if accepted/completed */}
                      {(req.status === 'accepted' || req.status === 'completed') && (
                        <div className="mt-3 bg-gray-50 p-3 border border-gray-150 text-xs">
                          <p className="font-black text-text-primary uppercase tracking-wider mb-2">📞 Coordinate with Admin Team:</p>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            {[
                              { name: 'Rahul Tacholi', phone: '9946709455' },
                              { name: 'Abhinav PP', phone: '8606839418' },
                              { name: 'Shinantu', phone: '8086849291' }
                            ].map((admin) => (
                              <div key={admin.phone} className="bg-white p-2 border border-gray-200 flex items-center justify-between">
                                <div className="min-w-0">
                                  <p className="font-bold text-text-primary truncate">{admin.name}</p>
                                  <p className="text-[10px] text-text-muted mt-0.5">{admin.phone}</p>
                                </div>
                                <a
                                  href={`tel:${admin.phone}`}
                                  className="bg-primary text-white font-black px-2 py-1 text-[10px] hover:bg-primary-dark transition-colors shrink-0"
                                >
                                  Call
                                </a>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-stretch justify-end md:self-center">
                    <Link
                      to={`/requests/${req._id}`}
                      className="text-xs font-bold border border-gray-200 px-3 py-2 bg-gray-50 hover:bg-gray-100 transition-colors"
                      style={{ borderRadius: '0' }}
                    >
                      View Details
                    </Link>

                    {req.status === 'assigned' && (
                      <>
                        <button
                          onClick={() => handleAccept(req._id)}
                          className="text-xs font-bold bg-green-600 text-white px-4 py-2 hover:bg-green-700 transition-colors"
                          style={{ borderRadius: '0' }}
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleReject(req._id)}
                          className="text-xs font-bold bg-red-600 text-white px-4 py-2 hover:bg-red-700 transition-colors"
                          style={{ borderRadius: '0' }}
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {req.status === 'accepted' && (
                      <button
                        onClick={() => handleComplete(req._id)}
                        className="text-xs font-bold bg-primary text-white px-4 py-2 hover:bg-primary-dark transition-colors flex items-center gap-1"
                        style={{ borderRadius: '0' }}
                      >
                        ✓ Mark Completed
                      </button>
                    )}

                    {req.status === 'completed' && (
                      <span className="text-xs font-bold bg-yellow-100 text-yellow-800 px-3 py-2">
                        Awaiting Verification
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Quick Stats */}
        <motion.div
          variants={{ show: { transition: { staggerChildren: 0.1 } } }}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 md:grid-cols-5 gap-4"
        >
          {statsItems.map((stat, i) => (
            <motion.div key={i} variants={fadeUp} className={`card flex flex-col justify-between ${stat.accent ? `${colors.accentBadge} border` : ''}`}>
              <stat.icon size={20} className={stat.accent ? `${colors.text} mb-3` : 'text-text-muted mb-3'} />
              <div>
                <p className="text-2xl font-black text-text-primary tracking-tight">{stat.value}</p>
                <p className="text-xs font-semibold text-text-secondary mt-1 uppercase tracking-wider">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className={`grid grid-cols-1 ${quickActions.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2 lg:grid-cols-4'} gap-4`}
        >
          {quickActions.map((action, i) => {
            const Icon = action.icon;
            const linkClass = action.primary
              ? "bg-primary text-white p-6 shadow-md hover:shadow-lg hover:bg-primary-dark hover:-translate-y-1 transition-all duration-300 flex items-center gap-4 group"
              : "bg-white border border-gray-100 shadow-sm p-6 flex items-center gap-4 group transition-all duration-300 hover:bg-primary hover:text-white hover:border-primary hover:-translate-y-1 hover:shadow-md";
            const iconBg = action.primary
              ? "p-3 bg-white/20 group-hover:bg-white/30 transition-colors"
              : "p-3 bg-primary-50 text-primary transition-colors duration-300 group-hover:bg-white/20";
            const iconColor = action.primary
              ? "text-white"
              : "text-primary group-hover:text-white transition-colors duration-300";
            const titleClass = action.primary
              ? "font-bold text-base mb-1"
              : "font-bold text-base text-text-primary group-hover:text-white transition-colors duration-300 mb-1";
            const descClass = action.primary
              ? "text-xs text-white/80"
              : "text-xs text-text-secondary group-hover:text-white/80 transition-colors duration-300";

            return (
              <Link key={i} to={action.to} className={linkClass}>
                <div className={iconBg}>
                  <Icon size={24} className={iconColor} />
                </div>
                <div>
                  <p className={titleClass}>{action.title}</p>
                  <p className={descClass}>{action.desc}</p>
                </div>
              </Link>
            );
          })}
        </motion.div>

        {/* Recent Requests - Requester Only */}
        {!isDonor && (
          <motion.div variants={fadeUp} initial="hidden" animate="show">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-black">Your Recent Requests</h2>
              <Link to="/requests" className={`${colors.text} text-sm font-semibold hover:underline`}>View All →</Link>
            </div>

            {requests.length === 0 ? (
              <div className="card text-center py-12 text-text-muted">
                <Droplets size={40} className="mx-auto text-bg-darker mb-3" />
                <p className="font-semibold">You haven't created any requests</p>
                <p className="text-sm mt-1">Create a new blood request if needed</p>
              </div>
            ) : (
              <div className="space-y-3">
                {requests.slice(0, 5).map((req) => (
                  <Link key={req._id} to={`/requests/${req._id}`} className={`card w-full overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-3 hover:${colors.border} transition-colors group`}>
                    <div className="flex items-start gap-3 flex-1 min-w-0 w-full">
                      <BloodGroupBadge group={req.bloodGroup} size="md" />
                      <div className="flex-1 min-w-0 flex flex-col gap-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-bold text-sm md:text-base break-words text-text-primary">{req.hospital}</p>
                          <UrgencyBadge urgency={req.urgency} />
                          <span className={`badge ${
                            req.status === 'pending' ? 'badge-pending' :
                            req.status === 'fulfilled' ? 'badge-fulfilled' : 'badge-approved'
                          }`}>
                            {req.status}
                          </span>
                        </div>
                        <p className="text-xs text-text-secondary">📍 {req.district} &bull; {req.units} unit(s) &bull; {timeAgo(req.createdAt)}</p>
                        
                        {/* Donor Assignment Status Tracker */}
                        {req.assignedDonor && (
                          <div className="mt-2 text-xs font-semibold text-text-secondary bg-gray-50 p-2.5 border border-gray-150 inline-flex items-center gap-2 max-w-max">
                            {req.status === 'assigned' && <span>🟢 Donor Assigned: <strong className="text-text-primary">{req.assignedDonor.name}</strong></span>}
                            {req.status === 'accepted' && <span>🤝 Donor Ready: <strong className="text-text-primary">{req.assignedDonor.name}</strong> accepted and is coordinating.</span>}
                            {req.status === 'completed' && <span>🏆 Donation Completed: Awaiting admin confirmation.</span>}
                            {req.status === 'fulfilled' && <span>🎉 Request Fulfilled by <strong className="text-text-primary">{req.assignedDonor.name}</strong></span>}
                          </div>
                        )}
                        {req.status === 'pending' && (
                          <p className="text-[11px] font-medium text-amber-700 mt-1">⏳ Awaiting verification by {req.district} district admin</p>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
