import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Clock, CheckCircle, AlertTriangle, Users, Droplets, Award, Phone, ClipboardList, Bell, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { BloodGroupBadge, EligibilityBanner, StatusBadge, UrgencyBadge, LoadingSpinner, PageHeader } from '../components/UI';
import api from '../api/axios';
import { timeAgo, formatDate } from '../utils/constants';
import { calculateEligibility } from '../utils/eligibility';
import toast from 'react-hot-toast';

export default function UserDashboard() {
  const { user } = useAuth();
  const isDonor = user?.isQualifiedDonor;
  const eligibility = calculateEligibility(user);
  const [requests, setRequests] = useState([]);
  const [requestsTotal, setRequestsTotal] = useState(0);
  const [certCount, setCertCount] = useState(0);
  const [assignedRequests, setAssignedRequests] = useState([]);
  const [loading, setLoading] = useState(true);


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
        const [rRes, cRes, aRes] = await Promise.all([
          api.get('/requests/my?limit=100'),
          api.get('/certificates/count'),
          api.get('/requests/assigned'),
        ]);
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
        { to: '/chatbot', title: 'AI Assistant', desc: 'Ask RedConnect AI', icon: AlertTriangle },
        { to: '/requests/new', title: 'New Request', desc: 'Create a blood request', icon: Plus, primary: user?.isEligibleToDonate },
        { to: '/requests', title: 'My Requests', desc: 'Manage your requests', icon: ClipboardList },
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

        {isDonor && eligibility.status === 'Waiting Period Active' && (
          <motion.div variants={fadeUp} className="mb-8">
            <div className="bg-amber-50 border-2 border-amber-400 p-6 shadow-sm flex items-start gap-4">
              <div className="w-12 h-12 bg-amber-100 flex items-center justify-center shrink-0">
                <AlertTriangle size={24} className="text-amber-600" />
              </div>
              <div>
                <h3 className="text-amber-800 font-black text-lg">WAITING PERIOD ACTIVE</h3>
                <p className="text-amber-700 font-medium mt-1">
                  You are currently in the post-donation waiting period. You will become eligible to donate again on <strong>{eligibility.nextEligibleDate}</strong>.
                </p>
                <p className="text-amber-800 font-bold mt-2">Days Remaining: {eligibility.daysRemaining}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Quick Stats */}
        <motion.div
          variants={{ show: { transition: { staggerChildren: 0.1 } } }}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
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
          className={`grid grid-cols-1 ${quickActions.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2 lg:grid-cols-3'} gap-4`}
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

        {/* Recent Requests - All Users */}

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
      </div>
    </div>
  );
}
