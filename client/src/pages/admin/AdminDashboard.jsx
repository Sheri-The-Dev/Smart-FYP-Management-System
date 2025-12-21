import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users,
  UserPlus,
  Shield,
  Activity,
  TrendingUp,
  AlertCircle,
  FolderOpen,
  Upload,
  Search,
  Database,
} from "lucide-react";
import Header from "../../components/layout/Header";
import Loading from "../../components/common/Loading";
import Button from "../../components/common/Button";
import { getDashboardStats } from "../../services/adminService";
import { getProjectStats } from "../../services/projectService";
import { useToast } from "../../components/common/Toast";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [projectStats, setProjectStats] = useState(null);

  useEffect(() => {
    fetchStats();
    fetchProjectStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await getDashboardStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      toast.error("Failed to load dashboard statistics");
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectStats = async () => {
    try {
      const response = await getProjectStats();
      // Service already returns data object
        setProjectStats(response);
    } catch (error) {
      console.error("Failed to load project statistics:", error);
      // Don't show error toast, as this is not critical
    }
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  const totalUsers =
    stats?.userStats?.reduce((sum, stat) => sum + stat.count, 0) || 0;
  const activeUsers =
    stats?.userStats?.reduce((sum, stat) => sum + stat.active_count, 0) || 0;
  const totalProjects = projectStats?.total || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Manage users, projects, security, and system settings
            </p>
          </div>
          <Button
            variant="primary"
            icon={<UserPlus size={20} />}
            onClick={() => navigate("/admin/users")}
          >
            Create User
          </Button>
        </div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {/* Total Users */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-10 h-10 opacity-80" />
              <TrendingUp className="w-5 h-5 opacity-60" />
            </div>
            <h3 className="text-3xl font-bold mb-1">{totalUsers}</h3>
            <p className="text-blue-100 text-sm">Total Users</p>
            <p className="text-blue-200 text-xs mt-2">
              {activeUsers} active users
            </p>
          </div>

          {/* Total Projects */}
          <div className="bg-gradient-to-br from-[#193869] to-[#234e92] rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <Database className="w-10 h-10 opacity-80" />
              <FolderOpen className="w-5 h-5 opacity-60" />
            </div>
            <h3 className="text-3xl font-bold mb-1">{totalProjects}</h3>
            <p className="text-blue-100 text-sm">Archived Projects</p>
            <p className="text-blue-200 text-xs mt-2">Ready to search</p>
          </div>

          {/* Recent Activities */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <Activity className="w-10 h-10 opacity-80" />
              <AlertCircle className="w-5 h-5 opacity-60" />
            </div>
            <h3 className="text-3xl font-bold mb-1">
              {stats?.recentActivitiesCount || 0}
            </h3>
            <p className="text-green-100 text-sm">Recent Activities</p>
            <p className="text-green-200 text-xs mt-2">Last 7 days</p>
          </div>

          {/* System Status */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <Shield className="w-10 h-10 opacity-80" />
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <h3 className="text-3xl font-bold mb-1">Active</h3>
            <p className="text-purple-100 text-sm">System Status</p>
            <p className="text-purple-200 text-xs mt-2">
              All systems operational
            </p>
          </div>
        </motion.div>

         {/* ADD PROPOSAL STATS WIDGET HERE */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-xl shadow-md p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">Proposal Management</h2>
            <button
              onClick={() => navigate('/admin/proposal-management')}
              className="text-sm text-[#193869] hover:text-[#234e92] font-medium flex items-center gap-1"
            >
              View All
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Manage student proposals, templates, and supervisor assignments
          </p>
          <Button
            variant="primary"
            onClick={() => navigate('/admin/proposal-management')}
            className="w-full sm:w-auto"
          >
            Go to Proposal Management
          </Button>
        </motion.div>

        {/* Users by Role */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-md p-6 mb-8"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            Users by Role
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats?.userStats?.map((stat, index) => (
              <div
                key={stat.role}
                className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">
                    {stat.role}
                  </span>
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
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-md p-6 mb-8"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Manage Users */}
            <button
              onClick={() => navigate("/admin/users")}
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-[#193869] hover:bg-blue-50 transition-all text-left group"
            >
              <Users className="w-8 h-8 text-[#193869] mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-gray-800 mb-1">Manage Users</h3>
              <p className="text-sm text-gray-600">View, create, edit users</p>
            </button>

            {/* Search Projects */}
            <button
              onClick={() => navigate("/projects")}
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-[#193869] hover:bg-blue-50 transition-all text-left group"
            >
              <Search className="w-8 h-8 text-[#193869] mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-gray-800 mb-1">
                Search Projects
              </h3>
              <p className="text-sm text-gray-600">Browse archived projects</p>
            </button>

            {/* Manage Projects */}
            <button
              onClick={() => navigate("/admin/projects")}
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-[#193869] hover:bg-blue-50 transition-all text-left group"
            >
              <FolderOpen className="w-8 h-8 text-[#193869] mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-gray-800 mb-1">
                Manage Projects
              </h3>
              <p className="text-sm text-gray-600">
                Add, edit, delete projects
              </p>
            </button>

            {/* Audit Logs */}
            <button
              onClick={() => navigate("/admin/audit-logs")}
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-[#193869] hover:bg-blue-50 transition-all text-left group"
            >
              <Activity className="w-8 h-8 text-[#193869] mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-gray-800 mb-1">Audit Logs</h3>
              <p className="text-sm text-gray-600">View system activities</p>
            </button>
          </div>
        </motion.div>

        {/* Project Archive Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-br from-[#193869] to-[#234e92] rounded-xl shadow-xl p-8 text-white"
        >
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
              <Database className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">
                Project Archive Management
              </h2>
              <p className="text-blue-100">
                Manage the complete database of archived Final Year Projects
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Total Projects */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <p className="text-blue-200 text-sm mb-1">Total Projects</p>
              <p className="text-3xl font-bold">{totalProjects}</p>
            </div>

            {/* By Year */}
            {projectStats?.byYear && projectStats.byYear.length > 0 && (
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <p className="text-blue-200 text-sm mb-1">Latest Year</p>
                <p className="text-3xl font-bold">
                  {projectStats.byYear[0].year}
                </p>
                <p className="text-blue-200 text-xs mt-1">
                  {projectStats.byYear[0].count} projects
                </p>
              </div>
            )}

            {/* By Department */}
            {projectStats?.byDepartment &&
              projectStats.byDepartment.length > 0 && (
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <p className="text-blue-200 text-sm mb-1">Top Department</p>
                  <p className="text-xl font-bold truncate">
                    {projectStats.byDepartment[0].department}
                  </p>
                  <p className="text-blue-200 text-xs mt-1">
                    {projectStats.byDepartment[0].count} projects
                  </p>
                </div>
              )}
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate("/projects")}
              className="px-6 py-3 bg-white text-[#193869] rounded-lg font-medium hover:bg-blue-50 transition-all flex items-center gap-2"
            >
              <Search className="w-5 h-5" />
              Search Projects
            </button>
            <button
              onClick={() => navigate("/admin/projects")}
              className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-lg font-medium hover:bg-white/30 transition-all flex items-center gap-2 border border-white/30"
            >
              <Upload className="w-5 h-5" />
              Add Projects
            </button>
          </div>
        </motion.div>

        {/* Admin Features Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8 bg-blue-50 rounded-xl shadow-md p-6 border border-blue-100"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Administrator Capabilities
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">
                User Management
              </h3>
              <ul className="space-y-1 text-sm text-gray-700">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-[#193869] rounded-full"></div>
                  <span>Create, edit, and delete user accounts</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-[#193869] rounded-full"></div>
                  <span>Manage user roles and permissions</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-[#193869] rounded-full"></div>
                  <span>Reset user passwords</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">
                Project Archive
              </h3>
              <ul className="space-y-1 text-sm text-gray-700">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-[#193869] rounded-full"></div>
                  <span>Add individual projects or bulk import via CSV</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-[#193869] rounded-full"></div>
                  <span>Edit and delete archived projects</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-[#193869] rounded-full"></div>
                  <span>View project statistics and analytics</span>
                </li>
              </ul>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default AdminDashboard;