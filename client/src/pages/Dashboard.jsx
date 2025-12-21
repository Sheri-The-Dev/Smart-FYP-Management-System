import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Users, 
  Shield, 
  BookOpen, 
  GraduationCap,
  Lock,
  User as UserIcon,
  FolderOpen,
  Search,
  FileText
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Header from '../components/layout/Header';

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect admin to admin dashboard
    if (isAdmin()) {
      navigate('/admin/dashboard');
    }
  }, [isAdmin, navigate]);

  const getRoleIcon = () => {
    switch (user?.role) {
      case 'Student':
        return <GraduationCap className="w-16 h-16 text-white" />;
      case 'Teacher':
        return <BookOpen className="w-16 h-16 text-white" />;
      case 'Committee':
        return <Shield className="w-16 h-16 text-white" />;
      default:
        return <Users className="w-16 h-16 text-white" />;
    }
  };

  const getRoleMessage = () => {
    switch (user?.role) {
      case 'Student':
        return 'Explore archived projects and manage your profile';
      case 'Teacher':
        return 'Search projects and manage your information';
      case 'Committee':
        return 'Access project archive and manage your profile';
      default:
        return 'Welcome to your dashboard';
    }
  };

  const getRoleDescription = () => {
    switch (user?.role) {
      case 'Student':
        return 'Browse through completed Final Year Projects to get inspiration for your own work';
      case 'Teacher':
        return 'Search and review archived FYP projects for reference and guidance';
      case 'Committee':
        return 'Access the complete archive of Final Year Projects for review';
      default:
        return 'Access your personalized dashboard';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-24 h-24 bg-gradient-to-br from-[#193869] to-[#234e92] rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl"
          >
            {getRoleIcon()}
          </motion.div>

          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Welcome back, {user?.username}!
          </h1>
          <p className="text-xl text-gray-600">{getRoleMessage()}</p>
        </motion.div>

        {/* Quick Actions Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
        >
          {/* PROJECT ARCHIVE - Available to ALL users */}
          <motion.button
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/projects')}
            className="bg-gradient-to-br from-[#193869] to-[#234e92] hover:from-[#234e92] hover:to-[#193869] rounded-xl shadow-lg p-8 text-left transition-all duration-300"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <FolderOpen className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Project Archive</h3>
                <p className="text-blue-100 text-sm">Search & Explore</p>
              </div>
            </div>
            <p className="text-white/90 text-sm leading-relaxed">
              Browse completed Final Year Projects by keywords, supervisor, year, department, and technology
            </p>
            <div className="mt-4 flex items-center text-white/80 text-sm">
              <Search className="w-4 h-4 mr-2" />
              <span>Advanced search available</span>
            </div>
          </motion.button>

          {/* SUBMIT PROPOSAL - Students only */}
          {user?.role === 'Student' && (
            <motion.button
              whileHover={{ scale: 1.02, y: -5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/proposals')}
              className="bg-white hover:bg-gray-50 rounded-xl shadow-md p-8 text-left transition-all duration-300 border-2 border-transparent hover:border-[#d29538]"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-[#d29538] rounded-lg flex items-center justify-center">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Submit Proposal</h3>
                  <p className="text-gray-500 text-sm">FYP Proposal</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                Create and submit your Final Year Project proposal for supervisor review
              </p>
            </motion.button>
          )}

          {/* REVIEW PROPOSALS - Teachers only */}
          {user?.role === 'Teacher' && (
            <motion.button
              whileHover={{ scale: 1.02, y: -5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/supervisor/proposals')}
              className="bg-white hover:bg-gray-50 rounded-xl shadow-md p-8 text-left transition-all duration-300 border-2 border-transparent hover:border-[#d29538]"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-[#234e92] rounded-lg flex items-center justify-center">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Review Proposals</h3>
                  <p className="text-gray-500 text-sm">Assigned to You</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                Review and provide feedback on student proposals assigned to you
              </p>
            </motion.button>
          )}

          {/* VIEW PROFILE */}
          <motion.button
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/profile')}
            className="bg-white hover:bg-gray-50 rounded-xl shadow-md p-8 text-left transition-all duration-300 border-2 border-transparent hover:border-[#193869]"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-[#d29538] rounded-lg flex items-center justify-center">
                <UserIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">My Profile</h3>
                <p className="text-gray-500 text-sm">Account Details</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              View and update your personal information, profile picture, and account settings
            </p>
          </motion.button>

          {/* CHANGE PASSWORD */}
          <motion.button
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/change-password')}
            className="bg-white hover:bg-gray-50 rounded-xl shadow-md p-8 text-left transition-all duration-300 border-2 border-transparent hover:border-[#193869]"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">Security</h3>
                <p className="text-gray-500 text-sm">Change Password</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              Update your account password to keep your account secure
            </p>
          </motion.button>
        </motion.div>

        {/* Role-Specific Information Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-md p-8 border border-blue-100"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#193869] to-[#234e92] rounded-lg flex items-center justify-center flex-shrink-0">
              {user?.role === 'Student' && <GraduationCap className="w-6 h-6 text-white" />}
              {user?.role === 'Teacher' && <BookOpen className="w-6 h-6 text-white" />}
              {user?.role === 'Committee' && <Shield className="w-6 h-6 text-white" />}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {user?.role} Dashboard
              </h2>
              <p className="text-gray-700 mb-4">
                {getRoleDescription()}
              </p>
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <h3 className="font-semibold text-gray-800 mb-3">What you can do:</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#193869] rounded-full"></div>
                    <span>Search archived projects by keywords, supervisor, year, and more</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#193869] rounded-full"></div>
                    <span>View complete project details including abstract and technology</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#193869] rounded-full"></div>
                    <span>Use advanced filters with AND/OR operators</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#193869] rounded-full"></div>
                    <span>Manage your profile and account settings</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Getting Started Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8 bg-gradient-to-br from-[#193869] to-[#234e92] rounded-xl shadow-xl p-8 text-white"
        >
          <h2 className="text-2xl font-bold mb-4">Getting Started</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2 text-blue-100">
                📚 Explore Project Archive
              </h3>
              <p className="text-blue-100 text-sm leading-relaxed">
                Click on "Project Archive" to search through hundreds of completed FYP projects. 
                Use keywords, filters, and advanced search to find exactly what you're looking for.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2 text-blue-100">
                👤 Manage Your Profile
              </h3>
              <p className="text-blue-100 text-sm leading-relaxed">
                Keep your profile information up to date. Upload a profile picture, 
                update your contact details, and manage your account security settings.
              </p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Dashboard;