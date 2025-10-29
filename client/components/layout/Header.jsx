import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LogOut, 
  User, 
  Settings, 
  Shield, 
  Menu, 
  X,
  ChevronDown,
  Lock,
  LayoutDashboard,
  Users as UsersIcon,
  Activity
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../common/Toast';

const Header = () => {
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();
  const toast = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      Administrator: 'bg-purple-100 text-purple-700 border-purple-200',
      Teacher: 'bg-blue-100 text-blue-700 border-blue-200',
      Student: 'bg-green-100 text-green-700 border-green-200',
      Committee: 'bg-yellow-100 text-yellow-700 border-yellow-200'
    };
    return colors[role] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center flex-shrink-0">
            <Link to="/dashboard" className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-[#193869] to-[#234e92] rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg sm:text-xl font-bold text-gray-800 whitespace-nowrap">FYP Auth System</h1>
                <p className="text-xs text-gray-500">Secure Authentication</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
            {isAdmin() && (
              <>
                <Link
                  to="/admin/dashboard"
                  className="px-3 lg:px-4 py-2 text-sm font-medium text-gray-700 hover:text-[#193869] hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="hidden lg:inline">Dashboard</span>
                </Link>
                <Link
                  to="/admin/users"
                  className="px-3 lg:px-4 py-2 text-sm font-medium text-gray-700 hover:text-[#193869] hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
                >
                  <UsersIcon className="w-4 h-4" />
                  <span className="hidden lg:inline">Users</span>
                </Link>
                <Link
                  to="/admin/audit-logs"
                  className="px-3 lg:px-4 py-2 text-sm font-medium text-gray-700 hover:text-[#193869] hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Activity className="w-4 h-4" />
                  <span className="hidden lg:inline">Logs</span>
                </Link>
              </>
            )}

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center space-x-2 lg:space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-[#193869] to-[#234e92] rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-semibold">
                    {user?.username?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="text-left hidden lg:block">
                  <p className="text-sm font-medium text-gray-800 truncate max-w-[120px]">{user?.username}</p>
                  <p className="text-xs text-gray-500">{user?.role}</p>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-gray-500 transition-transform flex-shrink-0 ${
                    profileDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <AnimatePresence>
                {profileDropdownOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setProfileDropdownOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50"
                    >
                      <div className="px-4 py-3 border-b border-gray-200">
                        <p className="text-sm font-semibold text-gray-800 truncate">{user?.username}</p>
                        <p className="text-xs text-gray-500 mt-1 truncate">{user?.email}</p>
                        <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(user?.role)}`}>
                          {user?.role}
                        </span>
                      </div>

                      <div className="py-2">
                        <Link
                          to="/profile"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          <User className="w-4 h-4 flex-shrink-0" />
                          <span>My Profile</span>
                        </Link>
                        
                        <Link
                          to="/change-password"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          <Lock className="w-4 h-4 flex-shrink-0" />
                          <span>Change Password</span>
                        </Link>

                        {isAdmin() && (
                          <Link
                            to="/admin/settings"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          >
                            <Settings className="w-4 h-4 flex-shrink-0" />
                            <span>Settings</span>
                          </Link>
                        )}
                      </div>

                      <div className="border-t border-gray-200 pt-2">
                        <button
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            handleLogout();
                          }}
                          className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4 flex-shrink-0" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-gray-200 py-4 overflow-hidden"
            >
              <div className="space-y-2">
                {/* User Info */}
                <div className="px-4 py-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#193869] to-[#234e92] rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-semibold text-lg">
                        {user?.username?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{user?.username}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                  </div>
                  <span className={`inline-block mt-3 px-3 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(user?.role)}`}>
                    {user?.role}
                  </span>
                </div>

                {isAdmin() && (
                  <>
                    <Link
                      to="/admin/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
                      <span>Admin Dashboard</span>
                    </Link>
                    <Link
                      to="/admin/users"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <UsersIcon className="w-5 h-5 flex-shrink-0" />
                      <span>Users Management</span>
                    </Link>
                    <Link
                      to="/admin/audit-logs"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Activity className="w-5 h-5 flex-shrink-0" />
                      <span>Audit Logs</span>
                    </Link>
                    <div className="border-t border-gray-200 my-2"></div>
                  </>
                )}

                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
                  <span>Dashboard</span>
                </Link>

                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <User className="w-5 h-5 flex-shrink-0" />
                  <span>My Profile</span>
                </Link>

                <Link
                  to="/change-password"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Lock className="w-5 h-5 flex-shrink-0" />
                  <span>Change Password</span>
                </Link>

                <div className="border-t border-gray-200 my-2"></div>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-5 h-5 flex-shrink-0" />
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
};

export default Header;