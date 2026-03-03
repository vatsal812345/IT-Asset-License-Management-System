import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../utils/api';

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || '',
    avatar: user?.avatar || '',
  });

  const [counts, setCounts] = useState({ assets: 0, licenses: 0 });

  // Sync formData with user context when it updates (critical for persistence across navs)
  React.useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || user.fullName || '',
        email: user.email || '',
        role: user.role || '',
        avatar: user.avatar || '',
      });
    }
  }, [user]);

  React.useEffect(() => {
    const fetchCounts = async () => {
      try {
        const statsRes = await api.get('/dashboard/stats');
        const statsData = statsRes.data;
        const licensesRes = await api.get('/licenses');
        const licensesData = licensesRes.data;
        
        setCounts({
          assets: statsData.success ? statsData.data.assets.total : 0,
          licenses: licensesData.success ? licensesData.data.length : 0
        });
      } catch (err) {
        console.error('Failed to fetch profile stats:', err);
      }
    };
    fetchCounts();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, you would upload to a server
      // Here we use a FileReader to preview it locally
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(formData);
      setIsEditing(false);
      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update profile', 'error');
    }
  };

  const getOrdinalSuffix = (day) => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1:  return "st";
      case 2:  return "nd";
      case 3:  return "rd";
      default: return "th";
    }
  };

  const formatMemberSince = (dateString) => {
    if (!dateString) return 'March 2026';
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'long' });
    const year = date.getFullYear();
    return `${day}${getOrdinalSuffix(day)} ${month} ${year}`;
  };

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto animate-fadeIn">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">User Profile</h1>
          <p className="mt-1 text-slate-500">Manage your personal information and preferences.</p>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`px-6 py-2.5 rounded-xl font-semibold transition-all duration-200 flex items-center ${
            isEditing
              ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100'
          }`}
        >
          {isEditing ? (
            'Cancel'
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Edit Profile
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-24 bg-linear-to-r from-indigo-500 to-blue-500 opacity-10"></div>
            <div className="relative">
              <div className="relative w-32 h-32 mx-auto mb-6">
                <div className="w-full h-full rounded-full border-4 border-white shadow-xl overflow-hidden bg-slate-100">
                  <img
                    src={formData.avatar || 'https://via.placeholder.com/150'}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                {isEditing && (
                  <label className="absolute bottom-0 right-0 w-10 h-10 bg-indigo-600 rounded-full border-4 border-white shadow-lg flex items-center justify-center cursor-pointer hover:bg-indigo-700 transition-colors duration-200">
                    <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </label>
                )}
              </div>
              <h3 className="text-xl font-bold text-slate-800">{formData.name || user?.name}</h3>
              <p className="text-indigo-600 font-medium badge bg-indigo-50 px-3 py-1 rounded-full mt-2 inline-block">
                {formData.role || user?.role}
              </p>
              <div className="mt-8 pt-8 border-t border-slate-50 flex justify-around">
                <div className="text-center">
                  <p className="text-2xl font-bold text-slate-800">{counts.assets}</p>
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Assets</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-slate-800">{counts.licenses}</p>
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Licenses</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Details Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm h-full">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-2 ml-1">Full Name</label>
                  <input
                    name="name"
                    type="text"
                    readOnly={!isEditing}
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-4 py-3.5 rounded-xl transition-all duration-200 focus:outline-none ${
                      isEditing
                        ? 'bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500'
                        : 'bg-slate-50 border-0 cursor-default'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-2 ml-1">Email Address</label>
                  <input
                    name="email"
                    type="email"
                    readOnly={!isEditing}
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-3.5 rounded-xl transition-all duration-200 focus:outline-none ${
                      isEditing
                        ? 'bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500'
                        : 'bg-slate-50 border-0 cursor-default'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-2 ml-1">Role</label>
                  <input
                    name="role"
                    type="text"
                    readOnly={!isEditing}
                    value={formData.role}
                    onChange={handleChange}
                    className={`w-full px-4 py-3.5 rounded-xl transition-all duration-200 focus:outline-none ${
                      isEditing
                        ? 'bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500'
                        : 'bg-slate-50 border-0 cursor-default'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-2 ml-1">Member Since</label>
                  <p className="px-4 py-3.5 bg-slate-50 text-slate-700 font-medium rounded-xl">
                    {formatMemberSince(user?.createdAt)}
                  </p>
                </div>
              </div>

              {isEditing && (
                <div className="flex justify-end pt-4 border-t border-slate-50">
                  <button
                    type="submit"
                    className="px-8 py-3.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all duration-200 shadow-lg shadow-indigo-100"
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
