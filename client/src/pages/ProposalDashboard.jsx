import React, { useState, useEffect } from 'react';
import { Plus, FileText, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import Header from '../components/layout/Header';
import ProposalCard from '../components/proposal/ProposalCard';
import ProposalForm from '../components/proposal/ProposalForm';
import ProposalDetailModal from '../components/proposal/ProposalDetailModal';
import Loading from '../components/common/Loading';
import { useToast } from '../components/common/Toast';
import proposalService from '../services/proposalService';

// ============================================
// PROPOSAL DASHBOARD PAGE (STUDENT) - FIXED
// ============================================
// FIXES: Proper API response handling for proposals
// ============================================

const ProposalDashboard = () => {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [editProposal, setEditProposal] = useState(null);

  const toast = useToast();

  useEffect(() => {
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching proposals...');
      
      const response = await proposalService.getMyProposals();
      console.log('📡 Proposals API Response:', response);
      
      // API interceptor returns { success, data }
      // So response is already { success: true, data: [...proposals...] }
      const proposalsData = response.data || response || [];
      console.log('📋 Extracted proposals:', proposalsData);
      console.log('✅ Found', Array.isArray(proposalsData) ? proposalsData.length : 0, 'proposals');
      
      setProposals(Array.isArray(proposalsData) ? proposalsData : []);
    } catch (error) {
      console.error('❌ Error fetching proposals:', error);
      console.error('Error details:', error.message);
      toast.error(error.message || 'Failed to load proposals');
      setProposals([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (proposalId) => {
    try {
      console.log('🔍 Fetching proposal details for ID:', proposalId);
      const response = await proposalService.getProposalDetails(proposalId);
      console.log('📡 Proposal details response:', response);
      
      const proposalData = response.data || response;
      setSelectedProposal(proposalData);
      setShowDetailModal(true);
    } catch (error) {
      console.error('❌ Error fetching proposal details:', error);
      toast.error(error.message || 'Failed to load proposal details');
    }
  };

  const handleEdit = async (proposalId) => {
    try {
      console.log('✏️ Loading proposal for edit, ID:', proposalId);
      const response = await proposalService.getProposalDetails(proposalId);
      const proposalData = response.data || response;
      setEditProposal(proposalData);
      setShowForm(true);
    } catch (error) {
      console.error('❌ Error loading proposal for edit:', error);
      toast.error(error.message || 'Failed to load proposal');
    }
  };

  const handleDelete = async (proposalId) => {
    if (!confirm('Are you sure you want to delete this draft proposal?')) {
      return;
    }

    try {
      await proposalService.deleteProposal(proposalId);
      toast.success('Proposal deleted successfully');
      fetchProposals();
    } catch (error) {
      console.error('❌ Error deleting proposal:', error);
      toast.error(error.message || 'Failed to delete proposal');
    }
  };

  const handleFormSuccess = () => {
    fetchProposals();
    setEditProposal(null);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditProposal(null);
  };

  const getStatusCounts = () => {
    if (!proposals || !Array.isArray(proposals)) {
      return {
        draft: 0,
        submitted: 0,
        approved: 0,
        rejected: 0,
        revision: 0,
      };
    }

    return {
      draft: proposals.filter(p => p.status === 'draft').length,
      submitted: proposals.filter(p => p.status === 'submitted').length,
      approved: proposals.filter(p => p.status === 'approved').length,
      rejected: proposals.filter(p => p.status === 'rejected').length,
      revision: proposals.filter(p => p.status === 'revision_requested').length,
    };
  };

  if (loading) {
    return <Loading fullScreen text="Loading proposals..." />;
  }

  const statusCounts = getStatusCounts();

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
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                My Proposals
              </h1>
              <p className="text-gray-600">
                Manage your Final Year Project proposals
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={fetchProposals}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-lg font-medium transition-colors shadow-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>

              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#193869] to-[#234e92] hover:from-[#234e92] hover:to-[#193869] text-white rounded-lg font-semibold shadow-lg transition-all transform hover:scale-105"
              >
                <Plus className="w-5 h-5" />
                Create New Proposal
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white rounded-xl border-2 border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{statusCounts.draft}</p>
                  <p className="text-xs text-gray-600 font-medium">Drafts</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border-2 border-blue-200 p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-[#193869]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#193869]">{statusCounts.submitted}</p>
                  <p className="text-xs text-gray-600 font-medium">Submitted</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border-2 border-green-200 p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{statusCounts.approved}</p>
                  <p className="text-xs text-gray-600 font-medium">Approved</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border-2 border-orange-200 p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-[#d29538]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#d29538]">{statusCounts.revision}</p>
                  <p className="text-xs text-gray-600 font-medium">Revisions</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border-2 border-red-200 p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-600">{statusCounts.rejected}</p>
                  <p className="text-xs text-gray-600 font-medium">Rejected</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Proposals Grid */}
        {!proposals || proposals.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-white rounded-xl shadow-sm"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-[#193869] to-[#234e92] rounded-full flex items-center justify-center mx-auto mb-6 opacity-90">
              <FileText className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              No Proposals Yet
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Get started by creating your first proposal. Your drafts and submissions will appear here.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#193869] to-[#234e92] hover:from-[#234e92] hover:to-[#193869] text-white rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
            >
              <Plus className="w-6 h-6" />
              Create Your First Proposal
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {proposals.map((proposal, index) => (
              <motion.div
                key={proposal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <ProposalCard
                  proposal={proposal}
                  onView={handleViewDetails}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  userRole="Student"
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>

      {/* Proposal Form Modal */}
      {showForm && (
        <ProposalForm
          isOpen={showForm}
          onClose={handleCloseForm}
          onSuccess={handleFormSuccess}
          editProposal={editProposal}
        />
      )}

      {/* Proposal Detail Modal */}
      {showDetailModal && (
        <ProposalDetailModal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          proposal={selectedProposal}
        />
      )}
    </div>
  );
};

export default ProposalDashboard;