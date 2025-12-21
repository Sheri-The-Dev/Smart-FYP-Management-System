import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  FileText, 
  Calendar, 
  User, 
  Users, 
  Mail, 
  Phone, 
  Download,
  Clock,
  CheckCircle,
  MessageSquare
} from 'lucide-react';
import ProposalStatusBadge from './ProposalStatusBadge';
import FeedbackPanel from './FeedbackPanel';

const ProposalDetailModal = ({ isOpen, onClose, proposal }) => {
  if (!proposal) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDownloadPDF = () => {
    if (proposal.proposal_pdf) {
      const link = document.createElement('a');
      link.href = `${import.meta.env.VITE_API_URL?.replace('/api', '')}${proposal.proposal_pdf}`;
      link.download = `Proposal_${proposal.id}.pdf`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-[#193869] to-[#234e92] p-6 relative">
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full text-white transition-all"
                >
                  <X className="w-5 h-5" />
                </motion.button>

                <h2 className="text-2xl font-bold text-white pr-12 mb-3">
                  {proposal.project_title}
                </h2>

                <div className="flex flex-wrap items-center gap-4 text-white/90 text-sm">
                  <ProposalStatusBadge status={proposal.status} />
                  <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                    ID: #{proposal.id}
                  </span>
                  {proposal.submission_date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(proposal.submission_date).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                {/* Student & Supervisor Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200">
                    <div className="flex items-center gap-2 text-[#193869] font-semibold mb-3">
                      <User className="w-5 h-5 text-[#d29538]" />
                      <h3>Student</h3>
                    </div>
                    <p className="text-gray-900 font-medium mb-1">{proposal.student_name || 'N/A'}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{proposal.student_email || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200">
                    <div className="flex items-center gap-2 text-[#193869] font-semibold mb-3">
                      <User className="w-5 h-5 text-[#d29538]" />
                      <h3>Supervisor</h3>
                    </div>
                    <p className="text-gray-900 font-medium mb-1">{proposal.supervisor_name || 'Not Assigned'}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{proposal.supervisor_email || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Description Section */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 text-[#193869] font-semibold mb-3">
                    <FileText className="w-5 h-5 text-[#d29538]" />
                    <h3>Project Description</h3>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                    <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                      {proposal.project_description}
                    </p>
                  </div>
                </div>

                {/* Group Members Section */}
                {proposal.members && proposal.members.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 text-[#193869] font-semibold mb-3">
                      <Users className="w-5 h-5 text-[#d29538]" />
                      <h3>Group Members ({proposal.members.length})</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {proposal.members.map((member, index) => (
                        <div
                          key={index}
                          className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-[#193869] to-[#234e92] rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                              {index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-gray-900 mb-1">{member.sap_id}</p>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Mail className="w-4 h-4 flex-shrink-0" />
                                  <span className="truncate">{member.email}</span>
                                </div>
                                {member.phone_number && (
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Phone className="w-4 h-4 flex-shrink-0" />
                                    <span>{member.phone_number}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* PDF Section */}
                {proposal.proposal_pdf && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 text-[#193869] font-semibold mb-3">
                      <FileText className="w-5 h-5 text-[#d29538]" />
                      <h3>Proposal Document</h3>
                    </div>
                    <div className="flex items-center justify-between p-5 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg border border-indigo-200">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-[#193869] to-[#234e92] rounded-lg flex items-center justify-center">
                          <FileText className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">Proposal_{proposal.id}.pdf</p>
                          <p className="text-sm text-gray-600">Click to download</p>
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleDownloadPDF}
                        className="px-4 py-2 bg-gradient-to-r from-[#193869] to-[#234e92] text-white rounded-lg font-medium hover:shadow-lg transition-all flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </motion.button>
                    </div>
                  </div>
                )}

                {/* Feedback Section */}
                {proposal.feedback && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 text-[#193869] font-semibold mb-3">
                      <MessageSquare className="w-5 h-5 text-[#d29538]" />
                      <h3>Supervisor Feedback</h3>
                    </div>
                    <FeedbackPanel
                      feedback={proposal.feedback}
                      supervisorName={proposal.supervisor_name}
                      responseDate={proposal.response_date}
                      status={proposal.status}
                    />
                  </div>
                )}

                {/* Timeline */}
                <div>
                  <div className="flex items-center gap-2 text-[#193869] font-semibold mb-3">
                    <Clock className="w-5 h-5 text-[#d29538]" />
                    <h3>Timeline</h3>
                  </div>
                  <div className="space-y-3">
                    {proposal.created_at && (
                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">Proposal Created</p>
                          <p className="text-sm text-gray-600">{formatDate(proposal.created_at)}</p>
                        </div>
                      </div>
                    )}
                    
                    {proposal.submission_date && (
                      <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="w-10 h-10 bg-gradient-to-r from-[#193869] to-[#234e92] rounded-full flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">Submitted to Supervisor</p>
                          <p className="text-sm text-gray-600">{formatDate(proposal.submission_date)}</p>
                        </div>
                      </div>
                    )}

                    {proposal.response_date && (
                      <div className={`flex items-center gap-3 p-4 rounded-lg border ${
                        proposal.status === 'approved' ? 'bg-green-50 border-green-200' :
                        proposal.status === 'rejected' ? 'bg-red-50 border-red-200' :
                        'bg-orange-50 border-orange-200'
                      }`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          proposal.status === 'approved' ? 'bg-green-600' :
                          proposal.status === 'rejected' ? 'bg-red-600' :
                          'bg-orange-600'
                        }`}>
                          {proposal.status === 'approved' ? (
                            <CheckCircle className="w-5 h-5 text-white" />
                          ) : (
                            <X className="w-5 h-5 text-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">
                            {proposal.status === 'approved' ? 'Approved' : 
                             proposal.status === 'rejected' ? 'Rejected' : 
                             'Revision Requested'}
                          </p>
                          <p className="text-sm text-gray-600">{formatDate(proposal.response_date)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Metadata */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    Last updated: {formatDate(proposal.updated_at || proposal.created_at)}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 bg-gray-50 border-t border-gray-200">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="w-full px-4 py-3 bg-gradient-to-r from-[#193869] to-[#234e92] text-white rounded-lg font-medium hover:shadow-lg transition-all"
                >
                  Close
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ProposalDetailModal;