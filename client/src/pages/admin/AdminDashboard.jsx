import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, UserPlus, Shield, Activity, TrendingUp, AlertCircle } from 'lucide-react';
import Header from '../../components/layout/Header';
import Loading from '../../components/common/Loading';
import Button from '../../components/common/Button';
import { getDashboardStats } from '../../services/adminService';
import { useToast } from '../../components/common/Toast';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await getDashboardStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      toast.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  const totalUsers = stats?.userStats?.reduce((sum, stat) => sum + stat.count, 0) || 0;
  const activeUsers = stats?.userStats?.reduce((sum, stat) => sum + stat.active_count, 0) || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage users, security, and system settings</p>
          </div>
          <Button
            variant="primary"
            icon={<UserPlus size={20} />}
            onClick={() => navigate('/admin/users')}
          >
            Create User
          </Button>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-md p-6 border-l-4 border-[#193869]"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{totalUsers}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-[#193869]" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3">{activeUsers} active accounts</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Recent Logins</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">
                  {stats?.recentActivity?.recentLogins || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3">Last 24 hours</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Failed Logins</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">
                  {stats?.recentActivity?.failedLogins || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3">Last 24 hours</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-md p-6 border-l-4 border-[#d29538]"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">New Users</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">
                  {stats?.recentActivity?.newUsers || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <UserPlus className="w-6 h-6 text-[#d29538]" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3">Last 30 days</p>
          </motion.div>
        </div>

        {/* Users by Role */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-md p-6 mb-8"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-6">Users by Role</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats?.userStats?.map((stat, index) => (
              <div
                key={stat.role}
                className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">{stat.role}</span>
                  <Shield className="w-5 h-5 text-[#193869]" />
                </div>
                <p className="text-2xl font-bold text-gray-800">{stat.count}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {stat.active_count} active
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl shadow-md p-6 mb-8"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/admin/users')}
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-[#193869] hover:bg-blue-50 transition-all text-left group"
            >
              <Users className="w-8 h-8 text-[#193869] mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-gray-800 mb-1">Manage Users</h3>
              <p className="text-sm text-gray-600">View, create, edit, and delete users</p>
            </button>

            <button
              onClick={() => navigate('/admin/audit-logs')}
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-[#193869] hover:bg-blue-50 transition-all text-left group"
            >
              <Activity className="w-8 h-8 text-[#193869] mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-gray-800 mb-1">Audit Logs</h3>
              <p className="text-sm text-gray-600">View system activity and security logs</p>
            </button>

            <button
              onClick={() => navigate('/admin/security')}
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-[#193869] hover:bg-blue-50 transition-all text-left group"
            >
              <Shield className="w-8 h-8 text-[#193869] mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-gray-800 mb-1">Security Settings</h3>
              <p className="text-sm text-gray-600">Configure security policies</p>
            </button>
          </div>
        </motion.div>

        {/* Recent Activity Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-gradient-to-br from-[#193869] to-[#234e92] rounded-xl shadow-xl p-6 text-white"
        >
          <h2 className="text-xl font-bold mb-4">System Health</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-blue-100 text-sm mb-1">Password Resets (7 days)</p>
              <p className="text-2xl font-bold">{stats?.recentActivity?.passwordResets || 0}</p>
            </div>
            <div>
              <p className="text-blue-100 text-sm mb-1">System Status</p>
              <p className="text-2xl font-bold text-green-300">Healthy</p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default AdminDashboard;