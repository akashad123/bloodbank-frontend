import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Clock, CheckCircle, AlertTriangle, Users, Droplets } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { BloodGroupBadge, EligibilityBanner, StatusBadge, UrgencyBadge, LoadingSpinner } from '../components/UI';
import api from '../api/axios';
import { timeAgo, formatDate } from '../utils/constants';

export default function UserDashboard() {
  const { user } = useAuth();
  const [eligibility, setEligibility] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [eRes, rRes] = await Promise.all([
          api.get('/users/eligibility'),
          api.get('/requests/my?limit=5'),
        ]);
        setEligibility(eRes.data);
        console.log('[Dashboard] requests:', rRes.data);
        setRequests(rRes.data.requests ?? []);
      } catch (err) {
        console.error('[Dashboard] fetch error:', err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  if (loading) return <><LoadingSpinner message="Loading dashboard..." /></>;

  return (
    <div className="min-h-screen bg-bg">
      
      <div className="page-header">
        <div className="max-w-7xl mx-auto">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Dashboard</p>
            <h1 className="text-3xl font-black">Welcome, {user?.name?.split(' ')[0]}</h1>
            <p className="text-gray-400 text-sm mt-1">{user?.district} · {user?.bloodGroup}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Eligibility Banner */}
        {eligibility && (
          <motion.div variants={fadeUp} initial="hidden" animate="show">
            <EligibilityBanner
              isEligible={eligibility.isEligible}
              daysLeft={eligibility.daysUntilEligible}
              lastDonationDate={eligibility.lastDonationDate}
            />
          </motion.div>
        )}

        {/* Quick Stats */}
        <motion.div
          variants={{ show: { transition: { staggerChildren: 0.1 } } }}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { label: 'Blood Group', value: user?.bloodGroup, icon: Droplets, accent: true },
            { label: 'Eligibility', value: eligibility?.isEligible ? 'Eligible' : 'Not Yet', icon: CheckCircle, accent: eligibility?.isEligible },
            { label: 'Days Since', value: eligibility?.daysSinceDonation ?? '—', icon: Clock },
            { label: 'District', value: user?.district?.slice(0, 8) + (user?.district?.length > 8 ? '…' : ''), icon: Users },
          ].map((stat, i) => (
            <motion.div key={i} variants={fadeUp} className={`card ${stat.accent ? 'border-l-4 border-l-primary' : ''}`}>
              <stat.icon size={16} className={stat.accent ? 'text-primary mb-2' : 'text-text-muted mb-2'} />
              <p className="text-2xl font-black text-text-primary">{stat.value}</p>
              <p className="text-xs text-text-muted mt-0.5">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" className="grid md:grid-cols-3 gap-4">
          <Link to="/requests/new" className="card-sharp flex items-center gap-4 hover:shadow-sharp transition-all duration-200 group">
            <div className="p-3 bg-primary group-hover:bg-primary-dark transition-colors">
              <Plus size={20} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-sm">New Blood Request</p>
              <p className="text-xs text-text-muted">Create an urgent request</p>
            </div>
          </Link>
          <Link to="/requests" className="card flex items-center gap-4 hover:border-primary transition-colors group">
            <div className="p-3 bg-bg-dark group-hover:bg-primary/10 transition-colors">
              <Droplets size={20} className="text-primary" />
            </div>
            <div>
              <p className="font-bold text-sm">View My Requests</p>
              <p className="text-xs text-text-muted">Manage your active requests</p>
            </div>
          </Link>
          <Link to="/chatbot" className="card flex items-center gap-4 hover:border-primary transition-colors group">
            <div className="p-3 bg-bg-dark group-hover:bg-primary/10 transition-colors">
              <AlertTriangle size={20} className="text-primary" />
            </div>
            <div>
              <p className="font-bold text-sm">AI Assistant</p>
              <p className="text-xs text-text-muted">Ask RedConnect AI</p>
            </div>
          </Link>
        </motion.div>

        {/* Recent Requests */}
        <motion.div variants={fadeUp} initial="hidden" animate="show">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black">Your Recent Requests</h2>
            <Link to="/requests" className="text-primary text-sm font-semibold hover:underline">View All →</Link>
          </div>

          {requests.length === 0 ? (
            <div className="card text-center py-12 text-text-muted">
              <Droplets size={40} className="mx-auto text-bg-darker mb-3" />
              <p className="font-semibold">You haven't created any requests</p>
              <p className="text-sm mt-1">Create a new blood request if needed</p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((req) => (
                <Link key={req._id} to={`/requests/${req._id}`} className="card w-full overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-primary transition-colors group">
                  <div className="flex items-start gap-3 flex-1 min-w-0 w-full">
                    <BloodGroupBadge group={req.bloodGroup} size="md" />
                    <div className="flex-1 min-w-0 flex flex-col gap-1">
                      <p className="font-bold text-sm md:text-base break-words">{req.hospital}</p>
                      <div className="flex flex-wrap gap-2 mb-1">
                        <UrgencyBadge urgency={req.urgency} />
                      </div>
                      <p className="text-xs text-gray-500">{req.district}</p>
                      <p className="text-xs text-text-muted whitespace-nowrap overflow-hidden text-ellipsis">
                        {req.units} unit(s) &bull; {timeAgo(req.createdAt)}
                      </p>
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
