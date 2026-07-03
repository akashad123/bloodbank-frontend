import api from './axios';

/**
 * Hospital API helpers
 * ─────────────────────────────────────────────────────────────────
 * Public functions are used in blood request forms.
 * Admin functions require a logged-in admin token.
 * ─────────────────────────────────────────────────────────────────
 */

// ─── Public ──────────────────────────────────────────────────────

/**
 * Fetch active hospitals for a specific district.
 * Used in CreateRequest / EditRequest dropdowns.
 */
export const fetchHospitalsByDistrict = (district) =>
  api.get(`/hospitals/${encodeURIComponent(district)}`);

// ─── Admin ───────────────────────────────────────────────────────

/**
 * Fetch ALL hospitals (active + inactive) in the admin's own district.
 */
export const fetchAdminHospitals = () => api.get('/hospitals/admin/my');

/**
 * Create a new hospital in the admin's district.
 * @param {{ name, address, phone, email?, status? }} data
 */
export const createHospital = (data) => api.post('/hospitals/admin', data);

/**
 * Update an existing hospital. District cannot be changed.
 * @param {string} id  MongoDB _id
 * @param {{ name?, address?, phone?, email?, status? }} data
 */
export const updateHospital = (id, data) => api.put(`/hospitals/admin/${id}`, data);

/**
 * Soft-delete a hospital (sets isDeleted = true).
 * @param {string} id  MongoDB _id
 */
export const deleteHospital = (id) => api.delete(`/hospitals/admin/${id}`);
