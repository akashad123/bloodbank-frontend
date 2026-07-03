import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Phone, Trash2, Edit, UserPlus, Check, Award, AlertTriangle, ArrowRight } from 'lucide-react';
import { BloodGroupBadge, StatusBadge, UrgencyBadge, LoadingSpinner, PageHeader } from '../components/UI';
import AssignDonorModal from '../components/AssignDonorModal';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { formatDate, timeAgo } from '../utils/constants';

const STEPS = ['pending', 'assigned', 'accepted', 'completed', 'fulfilled'];

export default function RequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [assignModal, setAssignModal] = useState(null);

  const fetchRequestDetail = async () => {
    try {
      const { data } = await api.get(`/requests/${id}`);
      setRequest(data.request);
    } catch {
      toast.error('Request not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequestDetail();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm('Delete this request?')) return;
    try {
      await api.delete(`/requests/${id}`);
      toast.success('Request deleted');
      navigate('/requests');
    } catch {
      toast.error('Could not delete request');
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    setActionLoading(newStatus);
    try {
      await api.put(`/requests/${id}/status`, { status: newStatus });
      toast.success(`Request marked as ${newStatus}!`);
      await fetchRequestDetail();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update request status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleVerifyCompletion = async () => {
    setActionLoading('fulfilled');
    try {
      await api.put(`/requests/${id}/verify`);
      toast.success('Donation verified and request fulfilled successfully!');
      await fetchRequestDetail();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to verify donation completion');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <LoadingSpinner message="Loading request details..." />;
  if (!request) return <div className="p-8 text-center text-text-muted">Request not found</div>;

  const isOwner = request.createdBy?._id === user?._id;
  const isAdmin = user?.role === 'admin';

  // Helper functions for status timeline
  const currentStepIdx = STEPS.indexOf(request.status);
  const getTimelineProgress = () => {
    if (currentStepIdx === -1) return 0;
    return (currentStepIdx / (STEPS.length - 1)) * 100;
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12">
      {assignModal && (
        <AssignDonorModal
          request={assignModal}
          onClose={() => setAssignModal(null)}
          onAssigned={fetchRequestDetail}
        />
      )}

      <PageHeader
        eyebrow={request.urgency === 'emergency' ? '🚨 Emergency Request' : 'Blood Request'}
        title={`${request.bloodGroup} Blood Needed`}
        subtitle={`${request.hospital}  ·  ${request.district}  ·  Status: ${request.status}`}
        maxWidth="max-w-4xl"
        right={
          <div className="w-10 h-10 bg-primary/10 border border-primary/20 flex items-center justify-center font-black text-primary text-sm shrink-0">
            {request.bloodGroup}
          </div>
        }
      />

      {/* Status Timeline */}
      <div className="max-w-4xl mx-auto px-6 mt-6">
        <div className="bg-white border border-gray-150 p-6 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-4">Request Progress</p>
          <div className="relative flex items-center justify-between w-full">
            {/* Background Line */}
            <div className="absolute left-0 right-0 top-4 h-[3px] bg-gray-100 -z-10" />
            {/* Active Highlight Line */}
            <div
              className="absolute left-0 top-4 h-[3px] bg-primary transition-all duration-500 ease-out -z-10"
              style={{ width: `${getTimelineProgress()}%` }}
            />

            {STEPS.map((step, idx) => {
              const isActive = idx <= currentStepIdx;
              const isCurrent = request.status === step;
              return (
                <div key={step} className="flex flex-col items-center flex-1 relative">
                  {/* Step Node */}
                  <div
                    className={`w-9 h-9 flex items-center justify-center font-bold text-xs border-2 transition-all duration-300 ${
                      isCurrent
                        ? 'bg-primary border-primary text-white scale-110 shadow-md shadow-primary/20'
                        : isActive
                        ? 'bg-primary border-primary text-white'
                        : 'bg-white border-gray-200 text-text-muted'
                    }`}
                    style={{ borderRadius: '50%' }}
                  >
                    {isCurrent && step === 'fulfilled' ? '🏆' : idx + 1}
                  </div>
                  {/* Step Label */}
                  <span
                    className={`text-[9px] font-black uppercase tracking-wider mt-2 text-center transition-all duration-300 ${
                      isCurrent ? 'text-primary font-black scale-105' : isActive ? 'text-text-primary' : 'text-text-muted'
                    }`}
                  >
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-6 grid md:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white border border-gray-100 p-6 md:p-8 rounded-2xl shadow-sm">
            <h2 className="font-black text-xl mb-6 border-b border-gray-100 pb-4 text-text-primary">Request Details</h2>
            <div className="grid grid-cols-2 gap-6">
              {[
                { label: 'Blood Group', value: request.bloodGroup },
                { label: 'Units Required', value: `${request.units} unit(s)` },
                { label: 'Hospital', value: request.hospital },
                { label: 'District', value: request.district },
                { label: 'Urgency', value: request.urgency.charAt(0).toUpperCase() + request.urgency.slice(1) },
                { label: 'Status', value: request.status.charAt(0).toUpperCase() + request.status.slice(1) },
                { label: 'Posted', value: timeAgo(request.createdAt) },
                { label: 'By', value: request.createdBy?.name || 'Unknown' },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">{label}</p>
                  <p className="font-bold text-sm md:text-base text-text-primary">{value}</p>
                </div>
              ))}
            </div>
            {request.additionalInfo && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Additional Info</p>
                <p className="text-sm text-text-secondary leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
                  {request.additionalInfo}
                </p>
              </div>
            )}
          </div>

          {/* Matched Donors (admin view) */}
          {isAdmin && request.matchedDonors?.length > 0 && (
            <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm">
              <h2 className="font-black text-lg mb-4 border-b border-gray-100 pb-3 text-text-primary">
                Matched Donors ({request.matchedDonors.length})
              </h2>
              <div className="space-y-3">
                {request.matchedDonors.map((donor) => (
                  <div key={donor._id} className="flex items-center justify-between bg-gray-50 border border-gray-100 p-4 rounded-xl">
                    <div className="flex items-center gap-4">
                      <BloodGroupBadge group={donor.bloodGroup} size="sm" />
                      <div>
                        <p className="font-bold text-sm text-text-primary">{donor.name}</p>
                        <p className="text-xs text-text-secondary font-medium">{donor.district}</p>
                      </div>
                    </div>
                    <a
                      href={`tel:${donor.phone}`}
                      className="flex items-center gap-1.5 text-primary text-sm font-bold bg-primary-50 px-3 py-1.5 rounded-lg hover:bg-primary hover:text-white transition-colors"
                    >
                      <Phone size={14} /> Call
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Contact & Actions Sidebar */}
        <div className="space-y-6">
          {/* 🚨 ADMIN ACTION PANEL 🚨 */}
          {isAdmin && (
            <div
              className="bg-white p-6 shadow-sm border border-gray-200 transition-all duration-200 relative overflow-hidden"
              style={{
                borderRadius: '0',
                borderTop: '3px solid #B03030',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              }}
            >
              <div
                className="px-4 py-2 mb-4 text-xs font-black uppercase tracking-wider text-white bg-black inline-block"
                style={{ borderRadius: 0 }}
              >
                Admin Panel
              </div>

              <div className="space-y-4">
                {/* Current Action Indicators */}
                <div className="bg-gray-50 border border-gray-150 p-4">
                  <p className="text-[9px] font-black uppercase tracking-widest text-text-muted">Workflow Stage</p>
                  <p className="font-bold text-xs text-text-primary uppercase mt-1 flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-primary animate-pulse" style={{ borderRadius: '50%' }} />
                    {request.status}
                  </p>
                  {request.assignedDonor && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-[9px] font-black uppercase tracking-widest text-text-muted">Assigned Donor</p>
                      <p className="font-bold text-xs mt-1 text-text-primary">{request.assignedDonor.name}</p>
                      <p className="text-[11px] text-text-secondary mt-0.5">{request.assignedDonor.phone}</p>
                    </div>
                  )}
                </div>

                {/* State-based Action Buttons */}
                <div className="space-y-2">
                  {request.status === 'pending' && (
                    <button
                      onClick={() => setAssignModal(request)}
                      disabled={actionLoading}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 text-xs uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      style={{ borderRadius: 0 }}
                    >
                      <UserPlus size={14} /> Assign Donor
                    </button>
                  )}

                  {request.status === 'assigned' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus('accepted')}
                        disabled={actionLoading}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 text-xs uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                        style={{ borderRadius: 0 }}
                      >
                        {actionLoading === 'accepted' ? 'Processing...' : '✓ Mark Accepted'}
                      </button>
                      <button
                        onClick={() => setAssignModal(request)}
                        disabled={actionLoading}
                        className="w-full border-2 border-primary text-primary hover:bg-primary-50 font-bold py-2.5 text-xs uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        style={{ borderRadius: 0 }}
                      >
                        <UserPlus size={14} /> Change Donor
                      </button>
                    </>
                  )}

                  {request.status === 'accepted' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus('completed')}
                        disabled={actionLoading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 text-xs uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                        style={{ borderRadius: 0 }}
                      >
                        {actionLoading === 'completed' ? 'Processing...' : '✓ Mark Donation Completed'}
                      </button>
                      <button
                        onClick={() => setAssignModal(request)}
                        disabled={actionLoading}
                        className="w-full border-2 border-primary text-primary hover:bg-primary-50 font-bold py-2.5 text-xs uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        style={{ borderRadius: 0 }}
                      >
                        <UserPlus size={14} /> Change Donor
                      </button>
                    </>
                  )}

                  {request.status === 'completed' && (
                    <div className="space-y-2">
                      <button
                        onClick={() => handleVerifyCompletion()}
                        disabled={actionLoading}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 text-xs uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                        style={{ borderRadius: 0 }}
                      >
                        {actionLoading === 'fulfilled' ? 'Verifying...' : '✅ Mark Request Fulfilled'}
                      </button>
                      <button
                        onClick={() => handleVerifyCompletion()}
                        disabled={actionLoading}
                        className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 text-xs uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                        style={{ borderRadius: 0 }}
                      >
                        <Award size={14} /> Generate Certificate
                      </button>
                    </div>
                  )}

                  {request.status === 'fulfilled' && (
                    <div className="bg-green-50 border border-green-200 p-4 text-center">
                      <p className="text-green-800 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1">
                        <Check size={14} strokeWidth={3} /> Request Fulfilled
                      </p>
                      <p className="text-[10px] text-green-600 mt-1 leading-relaxed">
                        This request is fully verified. The donor certificate has been issued.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Contact Details Card */}
          {isAdmin || isOwner ? (
            <div className="bg-primary-50 border border-primary-100 p-6 shadow-sm relative overflow-hidden" style={{ borderRadius: '0' }}>
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Phone size={64} className="text-primary" />
              </div>
              <h3 className="font-black text-lg mb-4 text-text-primary relative z-10">Contact</h3>
              <p className="font-bold text-sm text-text-primary relative z-10">{request.contactName}</p>
              <a
                href={`tel:${request.contactPhone}`}
                className="inline-flex items-center gap-2 text-primary bg-white px-4 py-2 shadow-sm font-bold text-sm mt-3 hover:-translate-y-0.5 hover:shadow-md transition-all relative z-10"
                style={{ borderRadius: '0' }}
              >
                <Phone size={16} /> {request.contactPhone}
              </a>
            </div>
          ) : (
            <div className="bg-primary-50 border border-primary-100 p-6 shadow-sm relative overflow-hidden" style={{ borderRadius: '0' }}>
              <h3 className="font-black text-lg mb-4 text-text-primary">Admin Coordination</h3>
              <p className="text-xs text-text-secondary mb-4 font-medium leading-relaxed">
                For privacy and safety, direct contact details are hidden. Please coordinate through the admin team:
              </p>
              <div className="space-y-3">
                {[
                  { name: 'Rahul Tacholi', phone: '9946709455' },
                  { name: 'Abhinav PP', phone: '8606839418' },
                  { name: 'Shinantu', phone: '8086849291' },
                ].map((admin) => (
                  <div key={admin.phone} className="bg-white p-3 border border-gray-150 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm text-text-primary">{admin.name}</p>
                      <p className="text-xs text-text-secondary mt-0.5">{admin.phone}</p>
                    </div>
                    <a
                      href={`tel:${admin.phone}`}
                      className="bg-primary text-white font-bold p-2 text-xs hover:bg-primary-dark transition-colors shrink-0"
                      style={{ borderRadius: '0' }}
                    >
                      <Phone size={12} />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Admin note */}
          {request.adminNote && (
            <div className="bg-yellow-50 border border-yellow-250 p-5 rounded-2xl shadow-sm">
              <p className="text-xs font-bold uppercase tracking-widest text-yellow-700 mb-2">Admin Note</p>
              <p className="text-sm font-medium text-yellow-900">{request.adminNote}</p>
            </div>
          )}

          {/* Owner actions */}
          {isOwner && request.status === 'pending' && (
            <div className="space-y-2">
              <Link to={`/requests/${id}/edit`} className="btn-outline w-full py-3 flex items-center justify-center gap-2 text-sm">
                <Edit size={16} /> Edit Request
              </Link>
              <button onClick={handleDelete} className="btn-danger w-full py-3 flex items-center justify-center gap-2 text-sm">
                <Trash2 size={16} /> Delete Request
              </button>
            </div>
          )}

          {/* Donor actions */}
          {request.assignedDonor?._id === user?._id && (
            <div className="space-y-2">
              <div className="bg-white border border-gray-150 p-5 shadow-sm" style={{ borderRadius: '0' }}>
                <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Your Assignment</p>

                {request.status === 'assigned' && (
                  <div className="flex flex-col gap-2">
                    <p className="text-xs text-text-secondary font-medium mb-2">
                      You are assigned as the donor. Please accept or reject this assignment.
                    </p>
                    <button
                      onClick={async () => {
                        try {
                          await api.put(`/requests/${id}/accept`);
                          toast.success('Assignment accepted!');
                          await fetchRequestDetail();
                        } catch {
                          toast.error('Failed to accept');
                        }
                      }}
                      className="bg-green-600 text-white font-bold py-2.5 w-full text-xs hover:bg-green-700 transition-colors"
                      style={{ borderRadius: '0' }}
                    >
                      Accept Assignment
                    </button>
                    <button
                      onClick={async () => {
                        if (!confirm('Reject this assignment?')) return;
                        try {
                          await api.put(`/requests/${id}/reject`);
                          toast.success('Assignment rejected.');
                          navigate('/dashboard');
                        } catch {
                          toast.error('Failed to reject');
                        }
                      }}
                      className="bg-red-600 text-white font-bold py-2.5 w-full text-xs hover:bg-red-700 transition-colors"
                      style={{ borderRadius: '0' }}
                    >
                      Reject Assignment
                    </button>
                  </div>
                )}

                {request.status === 'accepted' && (
                  <div className="flex flex-col gap-2">
                    <p className="text-xs text-text-secondary font-medium mb-2">
                      You accepted this assignment. Contact the requester to coordinate, then mark completed.
                    </p>
                    <button
                      onClick={async () => {
                        if (!confirm('Mark this blood donation as completed?')) return;
                        try {
                          await api.put(`/requests/${id}/complete`);
                          toast.success('Donation marked as completed!');
                          await fetchRequestDetail();
                        } catch {
                          toast.error('Failed to mark completed');
                        }
                      }}
                      className="bg-primary text-white font-bold py-2.5 w-full text-xs hover:bg-primary-dark transition-colors"
                      style={{ borderRadius: '0' }}
                    >
                      ✓ Mark Donation Completed
                    </button>
                  </div>
                )}

                {request.status === 'completed' && (
                  <p className="text-xs font-bold text-yellow-700 bg-yellow-50 p-3 border border-yellow-250 leading-relaxed">
                    Donation marked completed. Awaiting Admin verification.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
