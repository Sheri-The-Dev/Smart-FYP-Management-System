import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Shield, BookOpen, GraduationCap } from 'lucide-react';
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
        return <GraduationCap className="w-16 h-16 text-[#193869]" />;
      case 'Teacher':
        return <BookOpen className="w-16 h-16 text-[#193869]" />;
      case 'Committee':
        return <Shield className="w-16 h-16 text-[#193869]" />;
      default:
        return <Users className="w-16 h-16 text-[#193869]" />;
    }
  };

  const getRoleMessage = () => {
    switch (user?.role) {
      case 'Student':
        return 'Access your courses, assignments, and grades';
      case 'Teacher':
        return 'Manage your classes, students, and curriculum';
      case 'Committee':
        return 'Review and manage committee tasks';
      default:
        return 'Welcome to your dashboard';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Quick Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-md p-6 border-l-4 border-[#193869]"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Account Status</h3>
            <p className="text-3xl font-bold text-green-600">Active</p>
            <p className="text-sm text-gray-500 mt-2">Your account is in good standing</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-md p-6 border-l-4 border-[#d29538]"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Role</h3>
            <p className="text-3xl font-bold text-[#193869]">{user?.role}</p>
            <p className="text-sm text-gray-500 mt-2">Current access level</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl shadow-md p-6 border-l-4 border-[#234e92]"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Last Login</h3>
            <p className="text-lg font-bold text-gray-700">Just now</p>
            <p className="text-sm text-gray-500 mt-2">Session active</p>
          </motion.div>
        </div>

        {/* Account Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 bg-white rounded-xl shadow-md p-6"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Actions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/change-password')}
              className="bg-white hover:bg-gray-50 rounded-xl shadow-md p-6 text-left transition-all duration-200 border-2 border-transparent hover:border-[#193869]"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#193869] rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Change Password</h3>
                  <p className="text-sm text-gray-600">Update your account password</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => navigate('/profile')}
              className="bg-white hover:bg-gray-50 rounded-xl shadow-md p-6 text-left transition-all duration-200 border-2 border-transparent hover:border-[#193869]"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#d29538] rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">View Profile</h3>
                  <p className="text-sm text-gray-600">See your account details</p>
                </div>
              </div>
            </button>
          </div>
        </motion.div>

        {/* Role-specific content placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8 bg-gradient-to-br from-[#193869] to-[#234e92] rounded-xl shadow-xl p-8 text-white"
        >
          <h2 className="text-2xl font-bold mb-4">Getting Started</h2>
          <p className="text-blue-100 mb-4">
            This is your personal dashboard. Here you can access all the features available to your role as a {user?.role}.
          </p>
          <ul className="list-disc list-inside space-y-2 text-blue-100">
            <li>View and manage your account information</li>
            <li>Change your password anytime</li>
            <li>Access role-specific features</li>
            <li>Stay updated with notifications</li>
          </ul>
        </motion.div>
      </main>
    </div>
  );
};

export default Dashboard;