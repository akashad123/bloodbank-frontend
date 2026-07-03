import api from './axios';

/**
 * Fetch all certificates for the logged-in donor.
 */
export const fetchMyCertificates = () => api.get('/certificates/my');

/**
 * Fetch a single certificate by its certificateId string (e.g. "DYFI-202506-A3F7").
 */
export const fetchCertificateById = (id) => api.get(`/certificates/${id}`);

/**
 * Fetch the certificate count for the dashboard widget.
 */
export const fetchCertificateCount = () => api.get('/certificates/count');

/**
 * Fetch the count of unseen certificates for the sidebar notification badge.
 * Only relevant for donor accounts.
 */
export const fetchUnseenCertificateCount = () => api.get('/certificates/unseen-count');

/**
 * Mark all of the donor's certificates as seen, clearing the sidebar badge.
 * Should be called when the donor visits the Certificates page.
 */
export const markCertificatesSeen = () => api.put('/certificates/mark-seen');
