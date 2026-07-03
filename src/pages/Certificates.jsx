import { useState, useEffect } from 'react';
import { Award, Download, Eye, X, Loader, Calendar, MapPin, Building, Droplet } from 'lucide-react';
import { fetchMyCertificates, markCertificatesSeen } from '../api/certificates';
import { useNotifications } from '../contexts/NotificationContext';
import { LoadingSpinner, EmptyState, PageHeader } from '../components/UI';
import { formatDate } from '../utils/constants';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export default function Certificates() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCert, setActiveCert] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  // Get the badge clear function from notification context
  const { clearCertificateBadge } = useNotifications();

  useEffect(() => {
    const getCertificates = async () => {
      try {
        const { data } = await fetchMyCertificates();
        setCertificates(data.certificates || []);
      } catch (err) {
        console.error('Error fetching certificates:', err);
        setError('Failed to load certificates. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    getCertificates();

    // Mark all certificates as seen and clear the sidebar badge
    markCertificatesSeen().catch(() => {});
    clearCertificateBadge();
  }, [clearCertificateBadge]);

  const handleDownloadPDF = async (cert) => {
    setDownloadingId(cert._id);
    // Give the DOM a tiny moment to render the off-screen template if needed
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    const element = document.getElementById(`cert-pdf-template-${cert._id}`);
    if (!element) {
      setDownloadingId(null);
      return;
    }

    try {
      const canvas = await html2canvas(element, {
        scale: 2, // high quality
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`RedConnect_Certificate_${cert.certificateId}.pdf`);
    } catch (err) {
      console.error('PDF generation failed:', err);
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading) return <LoadingSpinner message="Loading certificates..." />;

  return (
    <div className="min-h-screen bg-gray-50/50">
      <PageHeader
        eyebrow="Recognition"
        title="Donation Certificates"
        subtitle="Lifesaver certificates for your contributions to DYFI Mokeri East MC"
        right={
          <div className="w-10 h-10 bg-primary/10 flex items-center justify-center shrink-0">
            <Award size={20} className="text-primary" />
          </div>
        }
      />

      <div className="max-w-7xl mx-auto px-6 pt-6 pb-6">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6">
            <p className="font-semibold">{error}</p>
          </div>
        )}

        {certificates.length === 0 ? (
          <EmptyState
            icon="🏅"
            title="No Certificates Found"
            description="Your blood donation certificates will be automatically generated here once you complete a donation request and the administrator marks it as fulfilled."
          />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((cert) => (
              <div key={cert._id} className="card bg-white border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow relative">
                <div className="absolute top-4 right-4 bg-primary-50 text-primary px-3 py-1 font-bold text-xs">
                  {cert.bloodGroup}
                </div>

                <div>
                  <Award className="text-primary mb-4" size={28} />
                  <h3 className="font-black text-text-primary mb-1 text-lg">{cert.certificateId}</h3>
                  <p className="text-xs text-text-secondary font-semibold uppercase tracking-wider mb-4">
                    Issued to {cert.donorName}
                  </p>

                  <div className="space-y-2 text-sm text-text-secondary mb-6">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-text-muted shrink-0" />
                      <span>{formatDate(cert.donationDate || cert.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building size={14} className="text-text-muted shrink-0" />
                      <span className="truncate">{cert.hospital}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-text-muted shrink-0" />
                      <span>{cert.district}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 border-t border-gray-100 pt-4 mt-auto">
                  <button
                    onClick={() => setActiveCert(cert)}
                    className="flex-1 flex items-center justify-center gap-1.5 border border-gray-200 hover:bg-gray-50 text-text-primary px-3 py-2 text-xs font-bold transition-colors"
                  >
                    <Eye size={14} /> View
                  </button>
                  <button
                    onClick={() => handleDownloadPDF(cert)}
                    disabled={downloadingId === cert._id}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-primary hover:bg-primary-light text-white px-3 py-2 text-xs font-bold transition-all disabled:opacity-50"
                  >
                    {downloadingId === cert._id ? (
                      <Loader size={14} className="animate-spin" />
                    ) : (
                      <Download size={14} />
                    )}
                    {downloadingId === cert._id ? 'Generating...' : 'Download'}
                  </button>
                </div>

                {/* Hidden Container for high-quality landscape PDF Generation */}
                <div className="absolute top-0 left-0 w-0 h-0 overflow-hidden pointer-events-none select-none">
                  <div
                    id={`cert-pdf-template-${cert._id}`}
                    style={{ width: '842px', height: '595px' }} // Standard landscape A4 ratio at 72 DPI
                    className="bg-white p-8 border-[12px] border-double border-primary/40 flex flex-col justify-between relative box-border text-center text-text-primary font-sans"
                  >
                    {/* Corner ornaments */}
                    <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-primary/60"></div>
                    <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-primary/60"></div>
                    <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-primary/60"></div>
                    <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-primary/60"></div>

                    {/* Header */}
                    <div className="mt-4">
                      <div className="flex items-center justify-center gap-2 text-primary font-black tracking-widest text-lg mb-1">
                        <Droplet size={20} fill="currentColor" />
                        REDCONNECT
                      </div>
                      <p className="text-[10px] text-text-secondary font-bold tracking-widest uppercase">
                        DYFI MOKERI EAST MEGHALA COMMITTEE
                      </p>
                    </div>

                    {/* Main Title */}
                    <div className="my-2">
                      <h2 className="text-3xl font-black text-primary tracking-wide uppercase">
                        Certificate of Appreciation
                      </h2>
                      <div className="w-32 h-0.5 bg-primary/30 mx-auto mt-2"></div>
                    </div>

                    {/* Certificate Body */}
                    <div className="px-12 space-y-4">
                      <p className="text-xs italic text-text-secondary">
                        This certificate is proudly presented to
                      </p>
                      <h3 className="text-2xl font-black text-text-primary uppercase tracking-wider underline decoration-primary/40 decoration-2 underline-offset-8">
                        {cert.donorName}
                      </h3>
                      <p className="text-xs leading-relaxed text-text-secondary max-w-xl mx-auto">
                        in recognition of their noble contribution of donating blood group{' '}
                        <strong className="text-primary">{cert.bloodGroup}</strong> on{' '}
                        <strong>{formatDate(cert.donationDate || cert.createdAt)}</strong> at{' '}
                        <strong>{cert.hospital}</strong>, {cert.district} district.
                      </p>
                      <p className="text-xs font-semibold text-primary/90 max-w-md mx-auto italic">
                        "Your selflessness has given someone another chance at life. Thank you for being a lifesaver."
                      </p>
                    </div>

                    {/* Footer / Signatures */}
                    <div className="mb-4">
                      <div className="grid grid-cols-2 gap-12 max-w-md mx-auto text-center mt-6">
                        <div>
                          <div className="h-6 flex items-end justify-center">
                            <span className="font-serif italic text-text-secondary text-[11px]">RedConnect</span>
                          </div>
                          <div className="w-24 h-[1px] bg-text-muted/40 mx-auto my-1"></div>
                          <p className="text-[9px] font-bold text-text-secondary uppercase tracking-wider">
                            RedConnect Coordinator
                          </p>
                        </div>
                        <div>
                          <div className="h-6 flex items-end justify-center">
                            <span className="font-serif italic text-text-secondary text-[11px]">DYFI Mokeri East</span>
                          </div>
                          <div className="w-24 h-[1px] bg-text-muted/40 mx-auto my-1"></div>
                          <p className="text-[9px] font-bold text-text-secondary uppercase tracking-wider">
                            DYFI Committee President
                          </p>
                        </div>
                      </div>

                      <div className="text-[9px] text-text-muted mt-8 pt-4 border-t border-gray-100 flex justify-between px-4">
                        <span>Certificate ID: <strong>{cert.certificateId}</strong></span>
                        <span>RedConnect Verification: <strong>bloodbank.kerala</strong></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal for viewing Certificate */}
      {activeCert && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-gray-200 w-full max-w-4xl shadow-2xl relative">
            {/* Modal Actions */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
              <span className="font-black text-sm text-text-primary flex items-center gap-1.5">
                <Award size={18} className="text-primary" /> Certificate Preview ({activeCert.certificateId})
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownloadPDF(activeCert)}
                  disabled={downloadingId === activeCert._id}
                  className="bg-primary hover:bg-primary-light text-white px-4 py-1.5 text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  {downloadingId === activeCert._id ? (
                    <Loader size={14} className="animate-spin" />
                  ) : (
                    <Download size={14} />
                  )}
                  {downloadingId === activeCert._id ? 'Generating...' : 'Download PDF'}
                </button>
                <button
                  onClick={() => setActiveCert(null)}
                  className="text-text-muted hover:text-text-primary p-1 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Scrollable container on mobile, certificate is landscape */}
            <div className="p-6 overflow-x-auto flex justify-center bg-gray-100/50">
              {/* Display Certificate inside the Modal */}
              <div
                style={{ width: '800px', height: '565px' }}
                className="bg-white p-8 border-[12px] border-double border-primary/30 flex flex-col justify-between relative shrink-0 text-center text-text-primary font-sans shadow-md"
              >
                {/* Corner ornaments */}
                <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-primary/50"></div>
                <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-primary/50"></div>
                <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-primary/50"></div>
                <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-primary/50"></div>

                {/* Header */}
                <div className="mt-3">
                  <div className="flex items-center justify-center gap-2 text-primary font-black tracking-widest text-lg mb-1">
                    <Droplet size={20} fill="currentColor" />
                    REDCONNECT
                  </div>
                  <p className="text-[10px] text-text-secondary font-bold tracking-widest uppercase">
                    DYFI MOKERI EAST MEGHALA COMMITTEE
                  </p>
                </div>

                {/* Main Title */}
                <div className="my-2">
                  <h2 className="text-3xl font-black text-primary tracking-wide uppercase">
                    Certificate of Appreciation
                  </h2>
                  <div className="w-32 h-0.5 bg-primary/30 mx-auto mt-2"></div>
                </div>

                {/* Certificate Body */}
                <div className="px-12 space-y-4">
                  <p className="text-xs italic text-text-secondary">
                    This certificate is proudly presented to
                  </p>
                  <h3 className="text-2xl font-black text-text-primary uppercase tracking-wider underline decoration-primary/30 decoration-2 underline-offset-8">
                    {activeCert.donorName}
                  </h3>
                  <p className="text-xs leading-relaxed text-text-secondary max-w-xl mx-auto">
                    in recognition of their noble contribution of donating blood group{' '}
                    <strong className="text-primary">{activeCert.bloodGroup}</strong> on{' '}
                    <strong>{formatDate(activeCert.donationDate || activeCert.createdAt)}</strong> at{' '}
                    <strong>{activeCert.hospital}</strong>, {activeCert.district} district.
                  </p>
                  <p className="text-xs font-semibold text-primary/90 max-w-md mx-auto italic">
                    "Your selflessness has given someone another chance at life. Thank you for being a lifesaver."
                  </p>
                </div>

                {/* Footer / Signatures */}
                <div className="mb-2">
                  <div className="grid grid-cols-2 gap-12 max-w-md mx-auto text-center mt-6">
                    <div>
                      <div className="h-6 flex items-end justify-center">
                        <span className="font-serif italic text-text-secondary text-[11px]">RedConnect</span>
                      </div>
                      <div className="w-24 h-[1px] bg-text-muted/40 mx-auto my-1"></div>
                      <p className="text-[9px] font-bold text-text-secondary uppercase tracking-wider">
                        RedConnect Coordinator
                      </p>
                    </div>
                    <div>
                      <div className="h-6 flex items-end justify-center">
                        <span className="font-serif italic text-text-secondary text-[11px]">DYFI Mokeri East</span>
                      </div>
                      <div className="w-24 h-[1px] bg-text-muted/40 mx-auto my-1"></div>
                      <p className="text-[9px] font-bold text-text-secondary uppercase tracking-wider">
                        DYFI Committee President
                      </p>
                    </div>
                  </div>

                  <div className="text-[9px] text-text-muted mt-8 pt-4 border-t border-gray-100 flex justify-between px-4">
                    <span>Certificate ID: <strong>{activeCert.certificateId}</strong></span>
                    <span>RedConnect Verification: <strong>bloodbank.kerala</strong></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
