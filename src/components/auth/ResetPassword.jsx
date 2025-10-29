import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { useNavigate, useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { validatePassword } from '../../utils/validation';
import { authAPI } from '../../services/api';

const ResetPassword = () => {
  const [loading, setLoading] = useState(false);
  const { token } = useParams();
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors } } = useForm();

  const password = watch('password');

  const onSubmit = async (data) => {
    // Validate password (FR1.1.6)
    const passwordValidation = validatePassword(data.password);
    if (!passwordValidation.isValid) {
      toast.error(passwordValidation.errors[0]);
      return;
    }

    setLoading(true);
    try {
      await authAPI.resetPassword(token, data.password);
      toast.success('Password reset successful! Please login with your new password.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg"
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Reset Password
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          id="password"
          type="password"
          label="New Password"
          placeholder="Enter your new password"
          {...register('password', { required: 'Password is required' })}
          error={errors.password?.message}
        />

        <Input
          id="confirmPassword"
          type="password"
          label="Confirm New Password"
          placeholder="Re-enter your new password"
          {...register('confirmPassword', { 
            required: 'Please confirm password',
            validate: value => value === password || 'Passwords do not match'
          })}
          error={errors.confirmPassword?.message}
        />

        <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded">
          Password must contain:
          <ul className="list-disc list-inside mt-1">
            <li>At least 8 characters</li>
            <li>One uppercase letter</li>
            <li>One lowercase letter</li>
            <li>One number</li>
            <li>One special character</li>
          </ul>
        </div>

        <Button type="submit" loading={loading}>
          Reset Password
        </Button>

        <p className="text-center text-sm text-gray-600">
          Remember your password?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">
            Back to Login
          </Link>
        </p>
      </form>
    </motion.div>
  );
};

export default ResetPassword;