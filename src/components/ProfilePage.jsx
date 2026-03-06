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
    <div className="p-6 md:p-10 max-w-4xl mx-auto animate-fade-in-up transition-colors duration-500">
      <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight transition-colors">User Profile</h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400 font-medium transition-colors">Manage your personal information and preferences.</p>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`px-8 py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all duration-300 flex items-center justify-center ${
            isEditing
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95'
              : 'bg-brand-primary text-white hover:bg-indigo-700 shadow-premium shadow-indigo-100 dark:shadow-none hover:shadow-hover hover:-translate-y-1 active:translate-y-0'
          }`}
        >
          {isEditing ? (
            'Cancel'
          ) : (
            <>
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              <span>Edit Profile</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-dark-card rounded-[2.5rem] p-10 border border-slate-100 dark:border-dark-border shadow-premium text-center relative overflow-hidden transition-all duration-500">
            <div className="absolute top-0 left-0 w-full h-32 bg-linear-to-br from-indigo-500 to-blue-600 opacity-10 dark:opacity-20"></div>
            <div className="relative">
              <div className="relative w-36 h-36 mx-auto mb-8 group">
                <div className="w-full h-full rounded-full border-[6px] border-white dark:border-slate-800 shadow-premium overflow-hidden bg-slate-100 dark:bg-slate-800 transition-colors duration-500">
                  <img
                    src={formData.avatar || 'https://via.placeholder.com/150'}
                    alt="Profile"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
                {isEditing && (
                  <label className="absolute bottom-1 right-1 w-12 h-12 bg-brand-primary text-white rounded-2xl border-4 border-white dark:border-slate-800 shadow-premium flex items-center justify-center cursor-pointer hover:bg-indigo-700 hover:scale-110 transition-all duration-300 animate-fade-in">
                    <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </label>
                )}
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight transition-colors">{formData.name || user?.name}</h3>
              <div className="mt-4 inline-block">
                <span className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-xl border border-indigo-100/50 dark:border-indigo-900/30 transition-colors">
                  {formData.role || user?.role}
                </span>
              </div>
              
              <div className="mt-10 pt-10 border-t border-slate-50 dark:border-dark-border/50 flex justify-around transition-colors">
                <div className="text-center group">
                  <p className="text-3xl font-black text-slate-900 dark:text-white group-hover:text-brand-primary transition-colors">{counts.assets}</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] font-black mt-1">Assets</p>
                </div>
                <div className="text-center group">
                  <p className="text-3xl font-black text-slate-900 dark:text-white group-hover:text-brand-primary transition-colors">{counts.licenses}</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] font-black mt-1">Licenses</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Details Form */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-dark-card rounded-[2.5rem] p-10 border border-slate-100 dark:border-dark-border shadow-premium h-full transition-all duration-500">
            <form onSubmit={handleSubmit} className="h-full flex flex-col">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10 flex-1">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Full Name</label>
                  <input
                    name="name"
                    type="text"
                    readOnly={!isEditing}
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    className={`w-full px-6 py-4.5 rounded-2xl font-bold transition-all duration-300 focus:outline-none ${
                      isEditing
                        ? 'bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-dark-border focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/20 focus:border-brand-primary text-slate-900 dark:text-white'
                        : 'bg-slate-50 dark:bg-slate-800/20 border border-transparent text-slate-700 dark:text-slate-300 cursor-default'
                    }`}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Email Address</label>
                  <input
                    name="email"
                    type="email"
                    readOnly={!isEditing}
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@company.com"
                    className={`w-full px-6 py-4.5 rounded-2xl font-bold transition-all duration-300 focus:outline-none ${
                      isEditing
                        ? 'bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-dark-border focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/20 focus:border-brand-primary text-slate-900 dark:text-white'
                        : 'bg-slate-50 dark:bg-slate-800/20 border border-transparent text-slate-700 dark:text-slate-300 cursor-default'
                    }`}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Account Role</label>
                  <input
                    name="role"
                    type="text"
                    readOnly
                    disabled
                    value={formData.role}
                    className="w-full px-6 py-4.5 rounded-2xl font-bold bg-slate-50/50 dark:bg-slate-800/10 border border-transparent text-slate-400 dark:text-slate-600 cursor-not-allowed transition-colors"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Member Since</label>
                  <div className="px-6 py-4.5 bg-slate-50/50 dark:bg-slate-800/10 border border-transparent text-slate-800 dark:text-slate-300 font-bold rounded-2xl transition-colors">
                    {formatMemberSince(user?.createdAt)}
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="mt-12 pt-8 border-t border-slate-50 dark:border-dark-border/50 flex justify-end transition-colors">
                  <button
                    type="submit"
                    className="px-10 py-4.5 bg-brand-primary text-white font-black text-sm uppercase tracking-widest rounded-2xl hover:bg-indigo-700 shadow-premium shadow-indigo-100 dark:shadow-none hover:shadow-hover hover:-translate-y-1 active:translate-y-0 transition-all duration-300 group flex items-center gap-3"
                  >
                    <span>Save Changes</span>
                    <svg className="w-5 h-5 group-hover:scale-125 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
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
