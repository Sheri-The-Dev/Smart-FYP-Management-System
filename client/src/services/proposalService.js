import api from './api';
import axios from 'axios';
import { API_BASE_URL, STORAGE_KEYS } from '../utils/constants';

// ============================================
// PROPOSAL SERVICE - FIXED FOR BLOB DOWNLOADS
// ============================================
// All API calls for proposal management
// FIXED: Direct axios call for blob downloads (bypasses interceptor)
// ============================================

const proposalService = {
  
  // ============================================
  // STUDENT APIs
  // ============================================
  
  // Create new proposal (draft)
  createProposal: async (proposalData) => {
    const response = await api.post('/proposals/create', proposalData);
    return response;
  },

  // Get my proposals
  getMyProposals: async () => {
    const response = await api.get('/proposals/my-proposals');
    return response;
  },

  // Get proposal details
  getProposalDetails: async (proposalId) => {
    const response = await api.get(`/proposals/${proposalId}`);
    return response;
  },

  // Update proposal
  updateProposal: async (proposalId, updateData) => {
    const response = await api.put(`/proposals/${proposalId}`, updateData);
    return response;
  },

  // Upload proposal PDF
  uploadProposalPDF: async (proposalId, file) => {
    const formData = new FormData();
    formData.append('proposal_pdf', file);
    
    const response = await api.post(`/proposals/${proposalId}/upload-pdf`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  },

  // Submit proposal to supervisor
  submitProposal: async (proposalId) => {
    const response = await api.post(`/proposals/${proposalId}/submit`);
    return response;
  },

  // Delete proposal
  deleteProposal: async (proposalId) => {
    const response = await api.delete(`/proposals/${proposalId}`);
    return response;
  },

  // ============================================
  // SUPERVISOR APIs
  // ============================================
  
  // Get proposals assigned to supervisor
  getSupervisorProposals: async (status = null) => {
    const params = status ? { status } : {};
    const response = await api.get('/proposals/supervisor/assigned', { params });
    return response;
  },

  // Approve proposal
  approveProposal: async (proposalId) => {
    const response = await api.post(`/proposals/${proposalId}/approve`);
    return response;
  },

  // Reject proposal
  rejectProposal: async (proposalId, feedback) => {
    const response = await api.post(`/proposals/${proposalId}/reject`, { feedback });
    return response;
  },

  // Request revision
  requestRevision: async (proposalId, feedback) => {
    const response = await api.post(`/proposals/${proposalId}/request-revision`, { feedback });
    return response;
  },

  // ============================================
  // COMMON APIs
  // ============================================
  
  // Get available supervisors
  getAvailableSupervisors: async () => {
    const response = await api.get('/proposals/supervisors/available');
    return response;
  },

  // Download proposal template - FIXED: Uses direct axios to get blob
  downloadTemplate: async () => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    
    const response = await axios.get(`${API_BASE_URL}/proposals/templates/download`, {
      responseType: 'blob',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
    });
    
    // Return the actual blob, not response.data
    return response.data;
  },

  // ============================================
  // ADMIN APIs
  // ============================================
  
  // Upload proposal template
  uploadTemplate: async (file, templateName) => {
    const formData = new FormData();
    formData.append('template', file);
    formData.append('template_name', templateName);
    
    const response = await api.post('/proposals/templates/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  },

  // Delete template
  deleteTemplate: async (templateId) => {
    const response = await api.delete(`/proposals/templates/${templateId}`);
    return response;
  },

  // Get all proposals (admin)
  getAllProposals: async (filters = {}) => {
    const response = await api.get('/proposals/admin/all', { params: filters });
    return response;
  },

  // Get proposal analytics
  getProposalAnalytics: async () => {
    const response = await api.get('/proposals/admin/analytics');
    return response;
  },

  // Get proposal activity logs
  getProposalActivityLogs: async (proposalId) => {
    const response = await api.get(`/proposals/admin/activity-logs/${proposalId}`);
    return response;
  },

  // Get current active template
  getCurrentTemplate: async () => {
    const response = await api.get('/proposals/templates/current');
    return response;
  },
};

export default proposalService;