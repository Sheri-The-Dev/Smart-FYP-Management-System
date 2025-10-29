import api from './api';

// ==================== USER MANAGEMENT ====================

// Create new user
export const createUser = async (userData) => {
  const response = await api.post('/admin/users', userData);
  return response;
};

// Get all users with filters
export const getAllUsers = async (params = {}) => {
  const queryString = new URLSearchParams(
    Object.entries(params).filter(([_, value]) => value !== undefined && value !== '')
  ).toString();
  
  const response = await api.get(`/admin/users${queryString ? `?${queryString}` : ''}`);
  return response;
};

// Get user by ID
export const getUserById = async (id) => {
  const response = await api.get(`/admin/users/${id}`);
  return response;
};

// Update user
export const updateUser = async (id, userData) => {
  const response = await api.put(`/admin/users/${id}`, userData);
  return response;
};

// Delete user
export const deleteUser = async (id) => {
  const response = await api.delete(`/admin/users/${id}`);
  return response;
};

// ==================== PASSWORD RESET ====================

// Admin request password reset (send email)
export const adminRequestPasswordReset = async (id) => {
  const response = await api.post(`/admin/users/${id}/request-password-reset`);
  return response;
};

// Initiate security challenge
export const initiateSecurityChallenge = async (id) => {
  const response = await api.post(`/admin/users/${id}/initiate-security-challenge`);
  return response;
};

// Get security questions for challenge
export const getSecurityQuestions = async (token) => {
  const response = await api.get(`/admin/security-questions?token=${token}`);
  return response;
};

// Verify security answers
export const verifySecurityAnswers = async (token, answers) => {
  const response = await api.post('/admin/verify-security-answers', { token, answers });
  return response;
};

// Complete password reset after verification
export const completePasswordReset = async (token, newPassword) => {
  const response = await api.post('/admin/complete-password-reset', { token, newPassword });
  return response;
};

// ==================== AUDIT LOGS ====================

// Get audit logs
export const getAuditLogs = async (params = {}) => {
  const queryString = new URLSearchParams(
    Object.entries(params).filter(([_, value]) => value !== undefined && value !== '')
  ).toString();
  
  const response = await api.get(`/admin/audit-logs${queryString ? `?${queryString}` : ''}`);
  return response;
};

// ==================== DASHBOARD STATISTICS ====================

// Get dashboard statistics
export const getDashboardStats = async () => {
  const response = await api.get('/admin/dashboard-stats');
  return response;
};

// ==================== BULK OPERATIONS ====================

// Bulk delete users
export const bulkDeleteUsers = async (userIds) => {
  const response = await api.post('/admin/users/bulk-delete', { userIds });
  return response;
};

// Bulk update user status
export const bulkUpdateUserStatus = async (userIds, isActive) => {
  const response = await api.post('/admin/users/bulk-update-status', { userIds, isActive });
  return response;
};

// ==================== EXPORT FUNCTIONS ====================

// Export users to CSV
export const exportUsers = async (params = {}) => {
  const queryString = new URLSearchParams(
    Object.entries(params).filter(([_, value]) => value !== undefined && value !== '')
  ).toString();
  
  const response = await api.get(`/admin/users/export${queryString ? `?${queryString}` : ''}`, {
    responseType: 'blob'
  });
  return response;
};

// Export audit logs to CSV
export const exportAuditLogs = async (params = {}) => {
  const queryString = new URLSearchParams(
    Object.entries(params).filter(([_, value]) => value !== undefined && value !== '')
  ).toString();
  
  const response = await api.get(`/admin/audit-logs/export${queryString ? `?${queryString}` : ''}`, {
    responseType: 'blob'
  });
  return response;
};
