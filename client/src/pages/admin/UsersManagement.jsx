import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, UserPlus, Edit, Trash2, Mail, Shield, Eye } from 'lucide-react';
import Header from '../../components/layout/Header';
import Loading from '../../components/common/Loading';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import { useToast } from '../../components/common/Toast';
import { getAllUsers, createUser, deleteUser } from '../../services/adminService';
import { ROLES } from '../../utils/constants';
import { validatePassword, isValidEmail, isValidUsername } from '../../utils/validation';

const UsersManagement = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteModalUser, setDeleteModalUser] = useState(null);

  const [createFormData, setCreateFormData] = useState({
    username: '',
    email: '',
    role: 'Student',
    password: '',
    sendEmail: true
  });
  const [createErrors, setCreateErrors] = useState({});
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [searchTerm, roleFilter]);

  const fetchUsers = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 10,
        search: searchTerm,
        role: roleFilter
      };

      const response = await getAllUsers(params);
      if (response.success) {
        setUsers(response.data.users);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    // Validate
    const errors = {};

    if (!isValidUsername(createFormData.username)) {
      errors.username = 'Username must be 3-50 characters (letters, numbers, -, _)';
    }

    if (!isValidEmail(createFormData.email)) {
      errors.email = 'Invalid email address';
    }

    if (createFormData.password && !createFormData.sendEmail) {
      const passwordValidation = validatePassword(createFormData.password);
      if (!passwordValidation.isValid) {
        errors.password = passwordValidation.errors[0];
      }
    }

    if (Object.keys(errors).length > 0) {
      setCreateErrors(errors);
      return;
    }

    setCreating(true);

    try {
      const userData = {
        username: createFormData.username,
        email: createFormData.email,
        role: createFormData.role,
        sendEmail: createFormData.sendEmail
      };

      if (!createFormData.sendEmail && createFormData.password) {
        userData.password = createFormData.password;
      }

      await createUser(userData);
      toast.success('User created successfully!');
      setShowCreateModal(false);
      resetCreateForm();
      fetchUsers();
    } catch (error) {
      toast.error(error.message || 'Failed to create user');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteModalUser) return;

    try {
      await deleteUser(deleteModalUser.id);
      toast.success('User deleted successfully');
      setDeleteModalUser(null);
      fetchUsers();
    } catch (error) {
      toast.error(error.message || 'Failed to delete user');
    }
  };

  const resetCreateForm = () => {
    setCreateFormData({
      username: '',
      email: '',
      role: 'Student',
      password: '',
      sendEmail: true
    });
    setCreateErrors({});
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      Administrator: 'bg-purple-100 text-purple-800',
      Teacher: 'bg-blue-100 text-blue-800',
      Student: 'bg-green-100 text-green-800',
      Committee: 'bg-yellow-100 text-yellow-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  if (loading && users.length === 0) {
    return <Loading fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Users Management</h1>
            <p className="text-gray-600 mt-1">Create and manage user accounts</p>
          </div>
          <Button
            variant="primary"
            icon={<UserPlus size={20} />}
            onClick={() => setShowCreateModal(true)}
          >
            Create User
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by username or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#193869] focus:border-transparent"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#193869] focus:border-transparent"
            >
              <option value="all">All Roles</option>
              <option value="Student">Student</option>
              <option value="Teacher">Teacher</option>
              <option value="Committee">Committee</option>
              <option value="Administrator">Administrator</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">User</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Role</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Created</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user, index) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-800">{user.username}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.is_active ? (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          className="p-2 text-[#193869] hover:bg-blue-50 rounded-lg transition-colors"
                          title="Reset Password"
                        >
                          <Mail size={18} />
                        </button>
                        <button
                          onClick={() => setDeleteModalUser(user)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete User"
                          disabled={user.role === 'Administrator'}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} users
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => fetchUsers(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() => fetchUsers(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Create User Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            resetCreateForm();
          }}
          title="Create New User"
          size="lg"
        >
          <div className="space-y-4">
            <Input
              label="Username"
              name="username"
              value={createFormData.username}
              onChange={(e) => {
                setCreateFormData(prev => ({ ...prev, username: e.target.value }));
                setCreateErrors(prev => ({ ...prev, username: '' }));
              }}
              error={createErrors.username}
              placeholder="Enter username"
              required
            />

            <Input
              label="Email"
              type="email"
              name="email"
              value={createFormData.email}
              onChange={(e) => {
                setCreateFormData(prev => ({ ...prev, email: e.target.value }));
                setCreateErrors(prev => ({ ...prev, email: '' }));
              }}
              error={createErrors.email}
              placeholder="Enter email address"
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role <span className="text-red-500">*</span>
              </label>
              <select
                value={createFormData.role}
                onChange={(e) => setCreateFormData(prev => ({ ...prev, role: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#193869] focus:border-transparent"
              >
                {Object.values(ROLES).map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
              <input
                type="checkbox"
                id="sendEmail"
                checked={createFormData.sendEmail}
                onChange={(e) => setCreateFormData(prev => ({ ...prev, sendEmail: e.target.checked }))}
                className="w-4 h-4 text-[#193869] rounded focus:ring-[#193869]"
              />
              <label htmlFor="sendEmail" className="text-sm text-gray-700">
                Send account details via email (recommended)
              </label>
            </div>

            {!createFormData.sendEmail && (
              <Input
                label="Temporary Password"
                type="password"
                name="password"
                value={createFormData.password}
                onChange={(e) => {
                  setCreateFormData(prev => ({ ...prev, password: e.target.value }));
                  setCreateErrors(prev => ({ ...prev, password: '' }));
                }}
                error={createErrors.password}
                placeholder="Enter temporary password"
                required
              />
            )}

            <div className="flex gap-3 pt-4">
              <Button
                variant="primary"
                fullWidth
                onClick={handleCreateUser}
                loading={creating}
              >
                Create User
              </Button>
              <Button
                variant="outline"
                fullWidth
                onClick={() => {
                  setShowCreateModal(false);
                  resetCreateForm();
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={!!deleteModalUser}
          onClose={() => setDeleteModalUser(null)}
          title="Delete User"
          size="md"
        >
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 font-medium mb-2">⚠️ Warning: This action cannot be undone!</p>
              <p className="text-red-700 text-sm">
                You are about to delete user <strong>{deleteModalUser?.username}</strong>. All associated data will be permanently removed.
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
                onClick={() => setDeleteModalUser(null)}
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

export default UsersManagement;