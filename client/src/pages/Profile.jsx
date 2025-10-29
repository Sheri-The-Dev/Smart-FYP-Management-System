import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Shield, Calendar, Edit, Save, X } from 'lucide-react';
import Header from '../components/layout/Header';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/common/Toast';
import { getProfile } from '../services/authService';

const Profile = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    username: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await getProfile();
      if (response.success) {
        setProfileData(response.data);
        setFormData({
          email: response.data.email,
          username: response.data.username
        });
      }
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    toast.info('Profile update functionality coming soon');
    setEditing(false);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">My Profile</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Manage your account information</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-xl shadow-md p-6 text-center">
              <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-[#193869] to-[#234e92] rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 break-words">
                {user?.username}
              </h2>
              <p className="text-sm text-gray-600 mb-4 break-all">{user?.email}</p>

              <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium border ${getRoleBadgeColor(user?.role)}`}>
                {user?.role}
              </span>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4 flex-shrink-0" />
                  <span className="text-xs sm:text-sm">
                    Joined {new Date(user?.created_at || Date.now()).toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6 bg-gradient-to-br from-[#193869] to-[#234e92] rounded-xl shadow-md p-6 text-white"
            >
              <h3 className="font-bold mb-3 text-sm sm:text-base">Account Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="text-blue-100">Status</span>
                  <span className="font-semibold">Active</span>
                </div>
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="text-blue-100">Security</span>
                  <span className="font-semibold">Verified</span>
                </div>
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="text-blue-100">Sessions</span>
                  <span className="font-semibold">1 Active</span>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column - Profile Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800">Account Information</h3>
                {!editing ? (
                  <Button
                    variant="outline"
                    icon={<Edit size={18} />}
                    onClick={() => setEditing(true)}
                    className="w-full sm:w-auto"
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button
                      variant="primary"
                      icon={<Save size={18} />}
                      onClick={handleSave}
                      className="flex-1 sm:flex-initial"
                    >
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      icon={<X size={18} />}
                      onClick={() => setEditing(false)}
                      className="flex-1 sm:flex-initial"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {editing ? (
                  <>
                    <Input
                      label="Username"
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                      icon={<User size={20} />}
                      disabled
                    />

                    <Input
                      label="Email Address"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      icon={<Mail size={20} />}
                    />
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">Username</label>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <User className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        <span className="text-gray-800 break-all">{user?.username}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">Email Address</label>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Mail className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        <span className="text-gray-800 break-all">{user?.email}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">Role</label>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Shield className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        <span className="text-gray-800">{user?.role}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">Account Created</label>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Calendar className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        <span className="text-gray-800 text-sm sm:text-base">
                          {new Date(user?.created_at || Date.now()).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Security Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6 bg-white rounded-xl shadow-md p-4 sm:p-6"
            >
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Security</h3>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-lg gap-3">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 text-sm sm:text-base">Password</p>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">Last changed 30 days ago</p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => window.location.href = '/change-password'}
                    className="w-full sm:w-auto"
                  >
                    Change Password
                  </Button>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-lg gap-3">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 text-sm sm:text-base">Two-Factor Authentication</p>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">Add an extra layer of security</p>
                  </div>
                  <Button variant="outline" disabled className="w-full sm:w-auto">
                    Coming Soon
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Profile;