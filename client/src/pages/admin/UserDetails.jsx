import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, User, Mail, Shield, Calendar, Clock, 
  Activity, Trash2, Edit, RefreshCw, Key 
} from 'lucide-react';
import Header from '../../components/layout/Header';
import Loading from '../../components/common/Loading';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { useToast } from '../../components/common/Toast';
import { 
  getUserById, 
  updateUser, 
  deleteUser, 
  adminRequestPasswordReset,
  initiateSecurityChallenge 
} from '../../services/adminService';

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchUserDetails();
  }, [id]);

  const fetchUserDetails = async () => {
    setLoading(true);
    try {
      const response = await getUserById(id);
      if (response.success) {
        setUser(response.data);
        setEditFormData({
          email: response.data.email,
          role: response.data.role,
          is_active: response.data.is_active
        });
      }
    } catch (error) {
      toast.error('Failed to load user details');
      navigate('/admin/users');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async () => {
    setUpdating(true);
    try {
      await updateUser(id, editFormData);
      toast.success('User updated successfully');
      setShowEditModal(false);
      fetchUserDetails();
    } catch (error) {
      toast.error(error.message || 'Failed to update user');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteUser = async () => {
    try {
      await deleteUser(id);
      toast.success('User deleted successfully');
      navigate('/admin/users');
    } catch (error) {
      toast.error(error.message || 'Failed to delete user');
    }
  };

  const handlePasswordReset = async () => {
    try {
      await adminRequestPasswordReset(id);
      toast.success('Password reset email sent');
    } catch (error) {
      toast.error(error.message || 'Failed to send reset email');
    }
  };

  const handleSecurityChallenge = async () => {
    try {
      const response = await initiateSecurityChallenge(id);
      if (response.success) {
        toast.success('Security challenge sent to user');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to initiate security challenge');
    }
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      Administrator: 'bg-purple-100 text-purple-800 border-purple-200',
      Teacher: 'bg-blue-100 text-blue-800 border-blue-200',
      Student: 'bg-green-100 text-green-800 border-green-200',
      Committee: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };
    return colors[role] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          icon={<ArrowLeft size={20} />}
          onClick={() => navigate('/admin/users')}
          className="mb-6"
        >
          Back to Users
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - User Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Info Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-md p-6"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#193869] to-[#234e92] rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800">{user.username}</h1>
                    <p className="text-gray-600">{user.email}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    icon={<Edit size={18} />}
                    onClick={() => setShowEditModal(true)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    icon={<Trash2 size={18} />}
                    onClick={() => setShowDeleteModal(true)}
                    disabled={user.role === 'Administrator'}
                  >
                    Delete
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <Shield size={16} />
                    Role
                  </label>
                  <span className={`inline-block mt-2 px-4 py-2 rounded-lg text-sm font-medium border ${getRoleBadgeColor(user.role)}`}>
                    {user.role}
                  </span>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <Activity size={16} />
                    Status
                  </label>
                  {user.is_active ? (
                    <span className="inline-block mt-2 px-4 py-2 rounded-lg text-sm font-medium bg-green-100 text-green-800 border border-green-200">
                      Active
                    </span>
                  ) : (
                    <span className="inline-block mt-2 px-4 py-2 rounded-lg text-sm font-medium bg-red-100 text-red-800 border border-red-200">
                      Inactive
                    </span>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <Calendar size={16} />
                    Created
                  </label>
                  <p className="text-lg text-gray-800 mt-2">
                    {new Date(user.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <Clock size={16} />
                    Last Login
                  </label>
                  <p className="text-lg text-gray-800 mt-2">
                    {user.last_login 
                      ? new Date(user.last_login).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : 'Never'}
                  </p>
                </div>

                {user.created_by_username && (
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-600">Created By</label>
                    <p className="text-lg text-gray-800 mt-2">{user.created_by_username}</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-md p-6"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Activity size={20} />
                Recent Activity
              </h2>

              {user.recentActivity && user.recentActivity.length > 0 ? (
                <div className="space-y-3">
                  {user.recentActivity.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="w-2 h-2 bg-[#193869] rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{activity.action}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(activity.created_at).toLocaleString()} • {activity.ip_address}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No recent activity</p>
              )}
            </motion.div>
          </div>

          {/* Right Column - Actions */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl shadow-md p-6"
            >
              <h2 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h2>

              <div className="space-y-3">
                <Button
                  variant="outline"
                  fullWidth
                  icon={<Mail size={18} />}
                  onClick={handlePasswordReset}
                >
                  Send Password Reset
                </Button>

                {user.has_security_questions > 0 && (
                  <Button
                    variant="outline"
                    fullWidth
                    icon={<Key size={18} />}
                    onClick={handleSecurityChallenge}
                  >
                    Security Challenge
                  </Button>
                )}

                <Button
                  variant="outline"
                  fullWidth
                  icon={<RefreshCw size={18} />}
                  onClick={fetchUserDetails}
                >
                  Refresh Data
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-[#193869] to-[#234e92] rounded-xl shadow-xl p-6 text-white"
            >
              <h3 className="font-bold mb-3">Account Information</h3>
              <div className="space-y-2 text-sm text-blue-100">
                <p>• User ID: #{user.id}</p>
                <p>• Account Age: {Math.floor((new Date() - new Date(user.created_at)) / (1000 * 60 * 60 * 24))} days</p>
                <p>• Security Questions: {user.has_security_questions > 0 ? 'Set' : 'Not set'}</p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Edit Modal */}
        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title="Edit User"
          size="md"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={editFormData.email}
                onChange={(e) => setEditFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#193869] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <select
                value={editFormData.role}
                onChange={(e) => setEditFormData(prev => ({ ...prev, role: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#193869] focus:border-transparent"
              >
                <option value="Student">Student</option>
                <option value="Teacher">Teacher</option>
                <option value="Committee">Committee</option>
                <option value="Administrator">Administrator</option>
              </select>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                id="is_active"
                checked={editFormData.is_active}
                onChange={(e) => setEditFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                className="w-4 h-4 text-[#193869] rounded focus:ring-[#193869]"
              />
              <label htmlFor="is_active" className="text-sm text-gray-700">
                Account is active
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="primary"
                fullWidth
                onClick={handleUpdateUser}
                loading={updating}
              >
                Save Changes
              </Button>
              <Button
                variant="outline"
                fullWidth
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>

        {/* Delete Modal */}
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Delete User"
          size="md"
        >
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 font-medium mb-2">⚠️ Warning: This action cannot be undone!</p>
              <p className="text-red-700 text-sm">
                You are about to permanently delete <strong>{user.username}</strong>. All associated data will be removed.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="danger"
                fullWidth
                onClick={handleDeleteUser}
              >
                Delete User
              </Button>
              <Button
                variant="outline"
                fullWidth
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      </main>
    </div>
  );
};

export default UserDetails;