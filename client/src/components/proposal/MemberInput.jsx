import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import Input from '../common/Input';

// ============================================
// MEMBER INPUT COMPONENT
// ============================================
// Dynamic input fields for group members
// Allows adding/removing rows
// ============================================

const MemberInput = ({ members, onChange, errors = {} }) => {
  
  // Add new member row
  const handleAddMember = () => {
    onChange([
      ...members,
      { sap_id: '', email: '', phone_number: '' }
    ]);
  };

  // Remove member row
  const handleRemoveMember = (index) => {
    if (members.length === 1) {
      return; // Must have at least one member
    }
    const newMembers = members.filter((_, i) => i !== index);
    onChange(newMembers);
  };

  // Update member field
  const handleMemberChange = (index, field, value) => {
    const newMembers = [...members];
    newMembers[index] = {
      ...newMembers[index],
      [field]: value
    };
    onChange(newMembers);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Group Members <span className="text-red-500">*</span>
        </label>
        <button
          type="button"
          onClick={handleAddMember}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-[#193869] hover:bg-[#234e92] rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Member
        </button>
      </div>

      <div className="space-y-4">
        {members.map((member, index) => (
          <div
            key={index}
            className="p-4 bg-gray-50 border border-gray-200 rounded-lg"
          >
            <div className="flex items-start justify-between mb-3">
              <h4 className="text-sm font-semibold text-gray-700">
                Member {index + 1}
              </h4>
              {members.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveMember(index)}
                  className="text-red-600 hover:text-red-700 transition-colors"
                  title="Remove member"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* SAP ID */}
              <div>
                <Input
                  label="SAP ID"
                  type="text"
                  value={member.sap_id}
                  onChange={(e) => handleMemberChange(index, 'sap_id', e.target.value)}
                  placeholder="e.g., 12345"
                  required
                  error={errors[`members.${index}.sap_id`]}
                />
              </div>

              {/* Email */}
              <div>
                <Input
                  label="Email"
                  type="email"
                  value={member.email}
                  onChange={(e) => handleMemberChange(index, 'email', e.target.value)}
                  placeholder="student@example.com"
                  required
                  error={errors[`members.${index}.email`]}
                />
              </div>

              {/* Phone Number */}
              <div>
                <Input
                  label="Phone Number"
                  type="tel"
                  value={member.phone_number}
                  onChange={(e) => handleMemberChange(index, 'phone_number', e.target.value)}
                  placeholder="+92 300 1234567"
                  error={errors[`members.${index}.phone_number`]}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Info message */}
      <p className="text-sm text-gray-500">
        You can add up to 10 group members. At least one member is required.
      </p>
    </div>
  );
};

export default MemberInput;