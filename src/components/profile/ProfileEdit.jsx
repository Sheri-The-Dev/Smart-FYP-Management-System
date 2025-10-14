import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { profileAPI } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

const ProfileEdit = () => {
  const [loading, setLoading] = useState(false);
  const { user, updateUser } = useAuth();
  const { register, handleSubmit, formState: { errors }, setValue } = useForm();

  useEffect(() => {
    if (user) {
      setValue('name', user.name);
      setValue('email', user.email);
      setValue('department', user.department);
      setValue('contact', user.contact || '');
      if (user.role === 'supervisor') {
        setValue('researchAreas', user.researchAreas?.join(', ') || '');
        setValue('availability', user.availability || 'available');
      }
    }
  }, [user, setValue]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Process research areas for supervisors
      if (user.role === 'supervisor' && data.researchAreas) {
        data.researchAreas = data.researchAreas.split(',').map(area => area.trim());
      }

      const response = await profileAPI.updateProfile(data);
      updateUser(response.data.user);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg"
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Edit Profile
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          id="name"
          label="Full Name"
          placeholder="Enter your full name"
{...register('name', { required: 'Name is required' })}
error={errors.name?.message}
/>
<Input
      id="email"
      type="email"
      label="Email"
      placeholder="your.email@example.com"
      {...register('email', { 
        required: 'Email is required',
        pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' }
      })}
      error={errors.email?.message}
    />

    <Input
      id="contact"
      label="Contact Number"
      placeholder="Enter your contact number"
      {...register('contact')}
      error={errors.contact?.message}
    />

    <Input
      id="department"
      label="Department"
      placeholder="Enter your department"
      {...register('department', { required: 'Department is required' })}
      error={errors.department?.message}
    />

    {/* Supervisor-specific fields (FR1.2.2, FR1.2.3) */}
    {user?.role === 'supervisor' && (
      <>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Research Areas (comma-separated)
          </label>
          <textarea
            {...register('researchAreas')}
            placeholder="e.g., Machine Learning, Web Development, Mobile Apps"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Availability Status
          </label>
          <select
            {...register('availability')}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[44px]"
          >
            <option value="available">Available</option>
            <option value="limited">Limited Availability</option>
            <option value="unavailable">Unavailable</option>
          </select>
        </div>
      </>
    )}

    <div className="flex gap-4 pt-4">
      <Button type="submit" loading={loading}>
        Save Changes
      </Button>
      <Button 
        type="button" 
        variant="secondary"
        onClick={() => window.history.back()}
      >
        Cancel
      </Button>
    </div>
  </form>
</motion.div>
);
};
export default ProfileEdit;