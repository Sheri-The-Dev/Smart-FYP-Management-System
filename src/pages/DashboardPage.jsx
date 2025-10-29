import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';

const DashboardPage = () => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Welcome, {user?.name}!
        </h1>
        <p className="text-gray-600">
          Role: <span className="font-semibold capitalize">{user?.role}</span>
        </p>
        <p className="text-gray-600">
          Department: <span className="font-semibold">{user?.department}</span>
        </p>
        
        {user?.role === 'supervisor' && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Supervisor Info</h3>
            <p className="text-sm text-gray-700">
              Availability: <span className="capitalize">{user?.availability || 'Not set'}</span>
            </p>
            {user?.researchAreas && user.researchAreas.length > 0 && (
              <p className="text-sm text-gray-700 mt-1">
                Research Areas: {user.researchAreas.join(', ')}
              </p>
            )}
          </div>
        )}

        <div className="mt-6 p-4 bg-green-50 rounded-lg">
          <p className="text-sm text-green-800">
            ✓ Authentication module is working correctly!
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardPage;