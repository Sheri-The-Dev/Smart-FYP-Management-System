import React, { useState, useEffect } from 'react';
import { Users, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import proposalService from '../../services/proposalService';

// ============================================
// SUPERVISOR SELECTOR COMPONENT - FIXED
// ============================================
// Displays available supervisors with workload info
// Shows availability status
// FIXES: API response handling, better error messages
// ============================================

const SupervisorSelector = ({ value, onChange, error }) => {
  const [supervisors, setSupervisors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    fetchSupervisors();
  }, []);

  const fetchSupervisors = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching supervisors from API...');
      
      const response = await proposalService.getAvailableSupervisors();
      console.log('📡 Full API Response:', response);
      
      // The API interceptor in api.js returns response.data
      // So response is already { success: true, data: [...supervisors...] }
      const supervisorsData = response.data || response || [];
      
      console.log('👥 Extracted supervisors:', supervisorsData);
      console.log('✅ Found', Array.isArray(supervisorsData) ? supervisorsData.length : 0, 'supervisors');
      
      if (!Array.isArray(supervisorsData)) {
        console.warn('⚠️ Supervisors data is not an array:', typeof supervisorsData);
        setSupervisors([]);
      } else {
        setSupervisors(supervisorsData);
      }
      
      setFetchError(null);
    } catch (err) {
      console.error('❌ Error fetching supervisors:', err);
      console.error('Error message:', err.message);
      console.error('Error response:', err.response);
      
      const errorMessage = err.message || 'Failed to load supervisors. Please try again.';
      setFetchError(errorMessage);
      setSupervisors([]);
    } finally {
      setLoading(false);
    }
  };

  const getAvailabilityStatus = (supervisor) => {
    if (!supervisor.is_accepting_proposals) {
      return {
        text: 'Not Accepting',
        icon: XCircle,
        color: 'text-red-600',
        bgColor: 'bg-red-50'
      };
    }

    const availableSlots = supervisor.available_slots;
    
    if (availableSlots <= 0) {
      return {
        text: 'Full',
        icon: XCircle,
        color: 'text-red-600',
        bgColor: 'bg-red-50'
      };
    } else if (availableSlots <= 2) {
      return {
        text: `${availableSlots} slot${availableSlots > 1 ? 's' : ''} left`,
        icon: AlertCircle,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50'
      };
    } else {
      return {
        text: `${availableSlots} slots available`,
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-50'
      };
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Supervisor <span className="text-red-500">*</span>
        </label>
        <div className="space-y-3">
          <div className="h-24 bg-gray-200 rounded-lg"></div>
          <div className="h-24 bg-gray-200 rounded-lg"></div>
          <div className="h-24 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="rounded-lg border border-red-300 bg-red-50 p-4">
        <h4 className="text-sm font-semibold text-red-800 mb-2">Error Loading Supervisors</h4>
        <p className="text-sm text-red-700 mb-3">{fetchError}</p>
        <button
          type="button"
          onClick={fetchSupervisors}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Select Supervisor <span className="text-red-500">*</span>
      </label>

      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
        {!supervisors || supervisors.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <Users className="w-16 h-16 mx-auto mb-3 text-gray-400" />
            <h4 className="text-lg font-semibold text-gray-700 mb-1">No Supervisors Available</h4>
            <p className="text-sm text-gray-500 mb-3">
              There are currently no supervisors accepting proposals.
            </p>
            <button
              type="button"
              onClick={fetchSupervisors}
              className="text-sm text-[#193869] hover:text-[#234e92] font-medium"
            >
              Refresh List
            </button>
          </div>
        ) : (
          supervisors.map((supervisor) => {
            const status = getAvailabilityStatus(supervisor);
            const StatusIcon = status.icon;
            const isDisabled = !supervisor.is_accepting_proposals || supervisor.available_slots <= 0;
            const isSelected = value === supervisor.id;

            return (
              <div
                key={supervisor.id}
                onClick={() => !isDisabled && onChange(supervisor.id)}
                className={`
                  p-4 rounded-lg border-2 transition-all duration-200
                  ${isSelected
                    ? 'border-[#193869] bg-blue-50 shadow-md'
                    : isDisabled
                    ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                    : 'border-gray-200 hover:border-[#234e92] hover:bg-gray-50 cursor-pointer hover:shadow-sm'
                  }
                `}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900 text-base">
                        {supervisor.username}
                      </h4>
                      {isSelected && (
                        <CheckCircle className="w-5 h-5 text-[#193869]" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {supervisor.email}
                    </p>
                  </div>

                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    {status.text}
                  </div>
                </div>

                {/* Workload bar */}
                <div>
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-1.5">
                    <span className="font-medium">Workload</span>
                    <span className="font-semibold">{supervisor.current_supervisees}/{supervisor.max_supervisees} students</span>
                  </div>
                  <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#193869] to-[#234e92] transition-all duration-300"
                      style={{
                        width: `${Math.min((supervisor.current_supervisees / supervisor.max_supervisees) * 100, 100)}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600 font-medium">{error}</p>
      )}

      {/* Legend */}
      {supervisors && supervisors.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-gray-700 flex items-center flex-wrap gap-x-3 gap-y-1">
            <span className="flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-green-600" />
              <span className="font-medium">Available</span>
            </span>
            <span className="flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 text-orange-600" />
              <span className="font-medium">Limited</span>
            </span>
            <span className="flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5 text-red-600" />
              <span className="font-medium">Unavailable</span>
            </span>
          </p>
        </div>
      )}
    </div>
  );
};

export default SupervisorSelector;