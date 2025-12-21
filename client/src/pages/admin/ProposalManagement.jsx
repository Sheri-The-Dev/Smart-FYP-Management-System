import React, { useState, useEffect } from 'react';
import { Upload, Download, FileText, TrendingUp, Users, Clock, CheckCircle, XCircle, Trash2, RefreshCw, File } from 'lucide-react';
import { motion } from 'framer-motion';
import Header from '../../components/layout/Header';
import ProposalDetailModal from '../../components/proposal/ProposalDetailModal';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import { useToast } from '../../components/common/Toast';
import proposalService from '../../services/proposalService';

// ============================================
// ADMIN PROPOSAL MANAGEMENT PAGE - ENHANCED
// ============================================
// FIXED: Template display and management
// FIXED: Data access from API responses
// ============================================

const ProposalManagement = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [analytics, setAnalytics] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [currentTemplate, setCurrentTemplate] = useState(null);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [templateFile, setTemplateFile] = useState(null);
  const [templateName, setTemplateName] = useState('');

  useEffect(() => {
    fetchAnalytics();
    if (activeTab === 'proposals') {
      fetchProposals();
    }
    if (activeTab === 'templates') {
      fetchCurrentTemplate();
    }
  }, [activeTab]);

  const toast = useToast();

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await proposalService.getProposalAnalytics();
      const analyticsData = response.data || response;
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const fetchProposals = async () => {
    try {
      const response = await proposalService.getAllProposals();
      const proposalsData = response.data || response || [];
      setProposals(Array.isArray(proposalsData) ? proposalsData : []);
    } catch (error) {
      console.error('Error fetching proposals:', error);
      toast.error('Failed to load proposals');
      setProposals([]);
    }
  };

  const fetchCurrentTemplate = async () => {
    try {
      const response = await proposalService.getCurrentTemplate();
      const templateData = response.data || response;
      setCurrentTemplate(templateData);
    } catch (error) {
      // 404 is expected if no template exists
      if (error.response?.status !== 404) {
        console.error('Error fetching template:', error);
      }
      setCurrentTemplate(null);
    }
  };

  const handleViewDetails = async (proposalId) => {
    try {
      const response = await proposalService.getProposalDetails(proposalId);
      const proposalData = response.data || response;
      setSelectedProposal(proposalData);
      setShowDetailModal(true);
    } catch (error) {
      console.error('Error loading proposal details:', error);
      toast.error('Failed to load proposal details');
    }
  };

  const handleViewLogs = async (proposalId) => {
    try {
      const response = await proposalService.getProposalActivityLogs(proposalId);
      const logsData = response.data || response;
      setActivityLogs(logsData.logs || []);
      setSelectedProposal(logsData.proposal || null);
      setShowLogsModal(true);
    } catch (error) {
      console.error('Error loading activity logs:', error);
      toast.error('Failed to load activity logs');
    }
  };

  const handleTemplateUpload = async () => {
    if (!templateFile) {
      toast.error('Please select a file');
      return;
    }

    try {
      setUploading(true);
      await proposalService.uploadTemplate(templateFile, templateName || 'Proposal Template');
      toast.success('Template uploaded successfully');
      setShowTemplateModal(false);
      setTemplateFile(null);
      setTemplateName('');
      fetchCurrentTemplate(); // Refresh to show new template
    } catch (error) {
      console.error('Template upload error:', error);
      toast.error('Failed to upload template');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteTemplate = async () => {
    if (!currentTemplate) return;

    if (!window.confirm('Are you sure you want to delete this template? Students will not be able to download it.')) {
      return;
    }

    try {
      setDeleting(true);
      await proposalService.deleteTemplate(currentTemplate.id);
      toast.success('Template deleted successfully');
      setCurrentTemplate(null);
    } catch (error) {
      console.error('Template delete error:', error);
      toast.error('Failed to delete template');
    } finally {
      setDeleting(false);
    }
  };

  const handleReplaceTemplate = () => {
    setShowTemplateModal(true);
  };

  const handleDownloadTemplate = async () => {
    if (!currentTemplate) return;

    try {
      const blob = await proposalService.downloadTemplate();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = currentTemplate.template_name || 'Proposal_Template.pdf';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Template downloaded');
    } catch (error) {
      console.error('Template download error:', error);
      toast.error('Failed to download template');
    }
  };

  if (loading && !analytics) {
    return <Loading fullScreen text="Loading analytics..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Proposal Management
          </h1>
          <p className="text-gray-600">
            System overview and administrative controls
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex gap-4">
            {['overview', 'proposals', 'templates'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 px-2 font-medium text-sm transition-colors border-b-2 ${
                  activeTab === tab
                    ? 'border-[#193869] text-[#193869]'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && analytics && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-br from-[#193869] to-[#234e92] rounded-xl p-6 text-white"
              >
                <FileText className="w-10 h-10 mb-3 opacity-80" />
                <p className="text-3xl font-bold mb-1">{analytics.total || 0}</p>
                <p className="text-blue-100 text-sm">Total Proposals</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl p-6 border-2 border-blue-200"
              >
                <Clock className="w-10 h-10 mb-3 text-[#193869]" />
                <p className="text-3xl font-bold text-[#193869] mb-1">
                  {analytics.byStatus?.find(s => s.status === 'submitted')?.count || 0}
                </p>
                <p className="text-gray-600 text-sm">Pending Review</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl p-6 border-2 border-green-200"
              >
                <CheckCircle className="w-10 h-10 mb-3 text-green-600" />
                <p className="text-3xl font-bold text-green-600 mb-1">
                  {analytics.byStatus?.find(s => s.status === 'approved')?.count || 0}
                </p>
                <p className="text-gray-600 text-sm">Approved</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl p-6 border-2 border-orange-200"
              >
                <TrendingUp className="w-10 h-10 mb-3 text-[#d29538]" />
                <p className="text-3xl font-bold text-[#d29538] mb-1">
                  {analytics.avgResponseTime || 0}
                </p>
                <p className="text-gray-600 text-sm">Avg. Response (days)</p>
              </motion.div>
            </div>

            {/* Status Breakdown */}
            {analytics.byStatus && analytics.byStatus.length > 0 && (
              <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  Proposals by Status
                </h2>
                <div className="space-y-3">
                  {analytics.byStatus.map((item, index) => {
                    const statusConfig = {
                      draft: { color: 'gray', label: 'Draft' },
                      submitted: { color: 'blue', label: 'Submitted' },
                      approved: { color: 'green', label: 'Approved' },
                      rejected: { color: 'red', label: 'Rejected' },
                      revision_requested: { color: 'orange', label: 'Revision Requested' }
                    };
                    
                    const config = statusConfig[item.status] || { color: 'gray', label: item.status };
                    const percentage = analytics.total > 0 ? (item.count / analytics.total * 100).toFixed(1) : 0;

                    return (
                      <div key={index} className="relative">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700 capitalize">
                            {config.label}
                          </span>
                          <span className="text-sm font-semibold text-gray-900">
                            {item.count} ({percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full bg-${config.color}-500`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Supervisor Statistics */}
            {analytics.bySupervisor && analytics.bySupervisor.length > 0 && (
              <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  Supervisor Statistics
                </h2>
                <div className="space-y-3">
                  {analytics.bySupervisor.filter(s => s.proposal_count > 0).map((supervisor, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{supervisor.supervisor_name}</span>
                        <span className="text-sm font-semibold text-[#193869]">
                          {supervisor.proposal_count} total
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="text-green-600">✓ {supervisor.approved_count} approved</span>
                        <span className="text-red-600">✗ {supervisor.rejected_count} rejected</span>
                        <span className="text-blue-600">○ {supervisor.pending_count} pending</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Submissions */}
            {analytics.recentSubmissions && analytics.recentSubmissions.length > 0 && (
              <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  Recent Submissions (Last 30 Days)
                </h2>
                <div className="space-y-2">
                  {analytics.recentSubmissions.map((item, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <span className="text-sm text-gray-600">
                        {new Date(item.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        {item.count} {item.count === 1 ? 'submission' : 'submissions'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Proposals Tab */}
        {activeTab === 'proposals' && (
          <div className="space-y-4">
            {!proposals || proposals.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border-2 border-gray-200">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No proposals found</p>
              </div>
            ) : (
              proposals.map((proposal) => (
                <div
                  key={proposal.id}
                  className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-[#193869] transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        {proposal.project_title}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                        <span>Student: {proposal.student_name}</span>
                        <span>•</span>
                        <span>Supervisor: {proposal.supervisor_name || 'Not assigned'}</span>
                        <span>•</span>
                        <span className="capitalize">{proposal.status.replace('_', ' ')}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewDetails(proposal.id)}
                        className="px-4 py-2 bg-[#193869] hover:bg-[#234e92] text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => handleViewLogs(proposal.id)}
                        className="px-4 py-2 bg-white hover:bg-gray-50 text-[#193869] border border-[#193869] rounded-lg text-sm font-medium transition-colors"
                      >
                        View Logs
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Templates Tab - ENHANCED */}
        {activeTab === 'templates' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Proposal Template Management
              </h2>
              <p className="text-gray-600 mb-6">
                Upload a proposal template that students can download when creating their proposals.
              </p>
              
              {/* Current Template Display */}
              {currentTemplate ? (
                <div className="space-y-4">
                  {/* Template Info Card */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-14 h-14 bg-green-600 rounded-lg flex items-center justify-center">
                          <File className="w-7 h-7 text-white" />
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                          {currentTemplate.template_name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3">
                          Uploaded on {new Date(currentTemplate.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                        
                        {/* Action Buttons */}
                        <div className="flex items-center gap-3">
                          <button
                            onClick={handleDownloadTemplate}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-[#193869] hover:bg-[#234e92] text-white rounded-lg text-sm font-medium transition-colors"
                          >
                            <Download className="w-4 h-4" />
                            Download
                          </button>
                          
                          <button
                            onClick={handleReplaceTemplate}
                            disabled={deleting}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-[#d29538] hover:bg-[#b8802f] text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                          >
                            <RefreshCw className="w-4 h-4" />
                            Replace
                          </button>
                          
                          <button
                            onClick={handleDeleteTemplate}
                            disabled={deleting}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                          >
                            <Trash2 className="w-4 h-4" />
                            {deleting ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Info Box */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <FileText className="w-5 h-5 text-[#193869] flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-gray-700">
                        <p className="font-medium text-[#193869] mb-1">Template Active</p>
                        <p>Students can now download this template when creating proposals.</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* No Template Message */}
                  <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No Template Uploaded Yet
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      Upload a proposal template to help students structure their proposals correctly. Students will be able to download it from the proposal form.
                    </p>
                    
                    <button
                      onClick={() => setShowTemplateModal(true)}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#193869] to-[#234e92] hover:from-[#234e92] hover:to-[#193869] text-white rounded-lg font-semibold transition-all"
                    >
                      <Upload className="w-5 h-5" />
                      Upload Template
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Detail Modal */}
      {showDetailModal && (
        <ProposalDetailModal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          proposal={selectedProposal}
        />
      )}

      {/* Activity Logs Modal */}
      <Modal
        isOpen={showLogsModal}
        onClose={() => setShowLogsModal(false)}
        size="xl"
        title="Activity Logs"
      >
        <div className="space-y-4">
          {selectedProposal && (
            <p className="text-sm text-gray-600 pb-4 border-b border-gray-200">
              {selectedProposal.project_title}
            </p>
          )}
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {activityLogs && activityLogs.length > 0 ? (
              activityLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-medium text-gray-900">{log.action}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>User: {log.username} ({log.user_role})</p>
                    {log.ip_address && <p>IP: {log.ip_address}</p>}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No activity logs found
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end pt-4 border-t border-gray-200">
            <Button
              variant="secondary"
              onClick={() => setShowLogsModal(false)}
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* Template Upload Modal */}
      <Modal
        isOpen={showTemplateModal}
        onClose={() => !uploading && setShowTemplateModal(false)}
        title={currentTemplate ? "Replace Proposal Template" : "Upload Proposal Template"}
      >
        <div className="space-y-4">
          {currentTemplate && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Uploading a new template will replace the current one. Students will only be able to download the new template.
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Template Name
            </label>
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="e.g., FYP Proposal Template 2024"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#193869] focus:border-transparent"
              disabled={uploading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              PDF File
            </label>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setTemplateFile(e.target.files[0])}
              className="w-full text-sm text-gray-600
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-semibold
                file:bg-[#193869] file:text-white
                hover:file:bg-[#234e92]
                file:cursor-pointer cursor-pointer"
              disabled={uploading}
            />
            <p className="text-xs text-gray-500 mt-1">Only PDF files are allowed</p>
          </div>

          {templateFile && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <File className="w-4 h-4 text-green-600" />
                <p className="text-sm text-green-700 font-medium">
                  {templateFile.name}
                </p>
                <span className="text-xs text-green-600 ml-auto">
                  ({(templateFile.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button
            variant="secondary"
            onClick={() => {
              setShowTemplateModal(false);
              setTemplateFile(null);
              setTemplateName('');
            }}
            disabled={uploading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleTemplateUpload}
            disabled={!templateFile || uploading}
            loading={uploading}
            icon={<Upload className="w-5 h-5" />}
          >
            {currentTemplate ? 'Replace Template' : 'Upload Template'}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default ProposalManagement;