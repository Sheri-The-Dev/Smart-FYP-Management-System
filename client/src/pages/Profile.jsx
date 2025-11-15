import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Mail, Shield, Calendar, Edit, Phone, Building, 
  BookOpen, Award, Clock, Camera, RefreshCw
} from 'lucide-react';
import Header from '../components/layout/Header';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';
import EditProfileModal from '../components/profile/EditProfileModal';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/common/Toast';
import { getMyProfile, getProfilePictureUrl } from '../services/profileService';

const Profile = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [profilePictureUrl, setProfilePictureUrl] = useState(null);
  const [imageLoadError, setImageLoadError] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  // ============================================
  // ENHANCED: Better profile picture URL handling
  // ============================================
  useEffect(() => {
    console.log('Profile Picture URL Effect Triggered');
    console.log('profileData:', profileData);
    console.log('profileData?.profile_picture:', profileData?.profile_picture);
    
    if (profileData?.profile_picture) {
      const url = getProfilePictureUrl(profileData.profile_picture);
      console.log('Generated URL:', url);
      setProfilePictureUrl(url);
      setImageLoadError(false);
      
      // Test if URL is accessible
      fetch(url, { method: 'HEAD' })
        .then(response => {
          console.log('Image accessibility check:', response.status, response.statusText);
          if (!response.ok) {
            console.error('❌ Image not accessible:', url);
            setImageLoadError(true);
            toast.error(`Failed to load profile picture (${response.status})`);
          } else {
            console.log('✅ Image is accessible:', url);
          }
        })
        .catch(error => {
          console.error('❌ Image fetch error:', error);
          setImageLoadError(true);
          toast.error('Network error loading profile picture');
        });
    } else {
      console.log('No profile picture set');
      setProfilePictureUrl(null);
      setImageLoadError(false);
    }
  }, [profileData]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      console.log('Fetching profile...');
      const response = await getMyProfile();
      console.log('Profile response:', response);
      
      if (response.success) {
        setProfileData(response.data);
        console.log('Profile data set:', response.data);
      } else {
        toast.error('Failed to load profile');
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = () => {
    console.log('Profile update triggered, refetching...');
    fetchProfile();
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

  const getAvailabilityColor = (status) => {
    const colors = {
      Available: 'bg-green-100 text-green-800 border-green-200',
      Busy: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      Unavailable: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // ============================================
  // ENHANCED: Better image error handling
  // ============================================
  const handleImageError = (e) => {
    console.error('❌ Image onError triggered');
    console.error('Image src:', e.target.src);
    console.error('Image alt:', e.target.alt);
    
    e.target.style.display = 'none';
    setProfilePictureUrl(null);
    setImageLoadError(true);
    
    // Only show toast if we expected an image
    if (profileData?.profile_picture) {
      toast.error('Failed to display profile picture');
    }
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  const isTeacher = user?.role === 'Teacher';

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8 flex justify-between items-center"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">My Profile</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Manage your account information</p>
          </div>
          <Button
            variant="outline"
            icon={<RefreshCw size={18} />}
            onClick={fetchProfile}
            className="hidden sm:flex"
          >
            Refresh
          </Button>
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
              {/* Profile Picture */}
              <div className="relative w-32 h-32 mx-auto mb-4">
                {profilePictureUrl && !imageLoadError ? (
                  <img
                    src={profilePictureUrl}
                    alt={profileData?.username}
                    className="w-full h-full rounded-full object-cover border-4 border-[#193869] shadow-lg"
                    onError={handleImageError}
                    onLoad={() => {
                      console.log('✅ Image loaded successfully:', profilePictureUrl);
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#193869] to-[#234e92] rounded-full flex items-center justify-center border-4 border-[#193869] shadow-lg">
                    <User className="w-16 h-16 text-white" />
                  </div>
                )}
                <button
                  onClick={() => setEditModalOpen(true)}
                  className="absolute bottom-0 right-0 w-10 h-10 bg-[#d29538] text-white rounded-full flex items-center justify-center shadow-lg hover:bg-[#b87f2d] transition-colors"
                  title="Edit profile"
                >
                  <Camera size={18} />
                </button>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 break-words">
                {profileData?.username}
              </h2>
              <p className="text-sm text-gray-600 mb-4 break-all">{profileData?.email}</p>

              <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium border ${getRoleBadgeColor(profileData?.role)}`}>
                {profileData?.role}
              </span>

              {isTeacher && profileData?.availability_status && (
                <div className="mt-3">
                  <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium border ${getAvailabilityColor(profileData.availability_status)}`}>
                    {profileData.availability_status}
                  </span>
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4 flex-shrink-0" />
                  <span className="text-xs sm:text-sm">
                    Joined {new Date(profileData?.created_at || Date.now()).toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <Button
                  variant="primary"
                  icon={<Edit size={18} />}
                  onClick={() => setEditModalOpen(true)}
                  className="w-full"
                >
                  Edit Profile
                </Button>
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
                  <span className="text-blue-100">Last Login</span>
                  <span className="font-semibold">
                    {profileData?.last_login ? new Date(profileData.last_login).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column - Profile Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Basic Information */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-6">Basic Information</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Username</label>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <User className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-800 break-all">{profileData?.username}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Email Address</label>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Mail className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-800 break-all">{profileData?.email}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Phone Number</label>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Phone className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      <span className="text-gray-800">{profileData?.phone || 'Not provided'}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Department</label>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Building className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      <span className="text-gray-800">{profileData?.department || 'Not provided'}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Role</label>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Shield className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-800">{profileData?.role}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Teacher-Specific Information */}
            {isTeacher && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-6">Academic Information</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                      <BookOpen className="w-5 h-5" />
                      Research Areas
                    </label>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-gray-800 whitespace-pre-wrap">
                        {profileData?.research_areas || 'Not provided'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                      <Award className="w-5 h-5" />
                      Expertise
                    </label>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-gray-800 whitespace-pre-wrap">
                        {profileData?.expertise || 'Not provided'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                      <Clock className="w-5 h-5" />
                      Availability Status
                    </label>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getAvailabilityColor(profileData?.availability_status)}`}>
                        {profileData?.availability_status || 'Available'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security Section */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Security</h3>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-lg gap-3">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 text-sm sm:text-base">Password</p>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">
                      Last changed {profileData?.updated_at ? new Date(profileData.updated_at).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => window.location.href = '/change-password'}
                    className="w-full sm:w-auto"
                  >
                    Change Password
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        userData={profileData}
        onUpdate={handleProfileUpdate}
      />
    </div>
  );
};

export default Profile;