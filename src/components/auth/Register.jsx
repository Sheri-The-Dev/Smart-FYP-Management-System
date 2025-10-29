import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { validatePassword } from '../../utils/validation';
import { authAPI } from '../../services/api';

const Register = () => {
  const [loading, setLoading] = useState(false);
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
      await authAPI.register(data);
      toast.success('Registration successful! Please login.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
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
        Create Account
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
          id="username"
          label="Username"
          placeholder="Choose a username"
          {...register('username', { 
            required: 'Username is required',
            minLength: { value: 3, message: 'Username must be at least 3 characters' }
          })}
          error={errors.username?.message}
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
          id="password"
          type="password"
          label="Password"
          placeholder="Create a strong password"
          {...register('password', { required: 'Password is required' })}
          error={errors.password?.message}
        />

        <Input
          id="confirmPassword"
          type="password"
          label="Confirm Password"
          placeholder="Re-enter your password"
          {...register('confirmPassword', { 
            required: 'Please confirm password',
            validate: value => value === password || 'Passwords do not match'
          })}
          error={errors.confirmPassword?.message}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Role
          </label>
          <select
            {...register('role', { required: 'Role is required' })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[44px]"
          >
            <option value="">Select Role</option>
            <option value="student">Student</option>
            <option value="supervisor">Supervisor</option>
            <option value="committee">Committee Member</option>
            <option value="admin">Administrator</option>
          </select>
          {errors.role && (
            <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
          )}
        </div>

        <Input
          id="department"
          label="Department"
          placeholder="Enter your department"
          {...register('department', { required: 'Department is required' })}
          error={errors.department?.message}
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
          Register
        </Button>

        <p className="text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">
            Login here
          </Link>
        </p>
      </form>
    </motion.div>
  );
};

export default Register;