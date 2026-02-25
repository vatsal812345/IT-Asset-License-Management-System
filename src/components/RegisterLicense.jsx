import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Tag, Globe, Package, Calendar, Hash, CheckCircle2 } from 'lucide-react';

const RegisterLicense = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        softwareName: '',
        licenseKey: '',
        vendor: '',
        totalSeats: '',
        purchaseDate: '',
        expiryDate: '',
        category: '',
        licenseType: '',
        platform: '',
        status: 'Active',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch('https://itam-backend.onrender.com/api/licenses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();
            if (data.success) {
                navigate('/licenses');
            } else {
                alert('Error: ' + data.message);
            }
        } catch (error) {
            console.error('Error saving license:', error);
            alert('Failed to save license');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 md:p-8 bg-gray-50/30 min-h-screen">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center space-x-5 mb-10">
                    <button 
                        onClick={() => navigate('/licenses')}
                        className="p-3 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 transition-all shadow-sm group"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    </button>
                    <div>
                        <div className="flex items-center space-x-2 text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                            <span className="hover:text-blue-600 transition-colors cursor-pointer" onClick={() => navigate('/licenses')}>Licenses</span>
                            <span className="text-gray-300">/</span>
                            <span className="text-gray-500">Register New</span>
                        </div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Register License</h1>
                    </div>
                </div>

                <div className="bg-white rounded-[2.5rem] shadow-xl shadow-blue-50/50 border border-gray-100 overflow-hidden outline-none">
                    <div className="p-8 md:p-12">
                        <form onSubmit={handleSubmit} className="space-y-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Software Name</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                                            <Package className="w-5 h-5" />
                                        </div>
                                        <input
                                            type="text"
                                            name="softwareName"
                                            placeholder="e.g. Adobe Creative Cloud"
                                            value={formData.softwareName}
                                            onChange={handleChange}
                                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all duration-300 font-bold text-gray-800 placeholder:text-gray-300"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">License Key / ID</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                                            <Hash className="w-5 h-5" />
                                        </div>
                                        <input
                                            type="text"
                                            name="licenseKey"
                                            placeholder="e.g. XXXX-XXXX-XXXX-XXXX"
                                            value={formData.licenseKey}
                                            onChange={handleChange}
                                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all duration-300 font-bold text-gray-800 placeholder:text-gray-300"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Vendor</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                                            <Globe className="w-5 h-5" />
                                        </div>
                                        <input
                                            type="text"
                                            name="vendor"
                                            placeholder="e.g. Adobe"
                                            value={formData.vendor}
                                            onChange={handleChange}
                                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all duration-300 font-bold text-gray-800 placeholder:text-gray-300"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">License Type</label>
                                    <div className="relative group">
                                        <select
                                            name="licenseType"
                                            value={formData.licenseType}
                                            onChange={handleChange}
                                            className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all duration-300 font-bold text-gray-800 appearance-none cursor-pointer"
                                            required
                                        >
                                            <option value="">Select Type</option>
                                            <option value="Perpetual">Perpetual</option>
                                            <option value="Subscription">Subscription</option>
                                            <option value="Trial">Trial</option>
                                            <option value="OEM">OEM</option>
                                            <option value="Open Source">Open Source</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Category</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors pointer-events-none">
                                            <Tag className="w-5 h-5" />
                                        </div>
                                        <select
                                            name="category"
                                            value={formData.category}
                                            onChange={handleChange}
                                            className="w-full pl-12 pr-10 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all duration-300 font-bold text-gray-800 appearance-none cursor-pointer"
                                        >
                                            <option value="">Select Category</option>
                                            <option value="Productivity">Productivity</option>
                                            <option value="Security">Security</option>
                                            <option value="Development">Development</option>
                                            <option value="Design">Design</option>
                                            <option value="Communication">Communication</option>
                                            <option value="Database">Database</option>
                                            <option value="Analytics">Analytics</option>
                                            <option value="Other">Other</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Platform</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors pointer-events-none">
                                            <Globe className="w-5 h-5" />
                                        </div>
                                        <select
                                            name="platform"
                                            value={formData.platform}
                                            onChange={handleChange}
                                            className="w-full pl-12 pr-10 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all duration-300 font-bold text-gray-800 appearance-none cursor-pointer"
                                        >
                                            <option value="">Select Platform</option>
                                            <option value="Windows">Windows</option>
                                            <option value="macOS">macOS</option>
                                            <option value="Linux">Linux</option>
                                            <option value="Web">Web</option>
                                            <option value="Cross-Platform">Cross-Platform</option>
                                            <option value="Other">Other</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Total Seats / Users</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                                            <ShieldCheck className="w-5 h-5" />
                                        </div>
                                        <input
                                            type="number"
                                            name="totalSeats"
                                            placeholder="e.g. 50"
                                            value={formData.totalSeats}
                                            onChange={handleChange}
                                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all duration-300 font-bold text-gray-800 placeholder:text-gray-300"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Status</label>
                                    <div className="relative group">
                                        <select
                                            name="status"
                                            value={formData.status}
                                            onChange={handleChange}
                                            className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all duration-300 font-bold text-gray-800 appearance-none cursor-pointer"
                                        >
                                            <option value="Active">Active</option>
                                            <option value="Expired">Expired</option>
                                            <option value="Suspended">Suspended</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Purchase Date</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                                            <Calendar className="w-5 h-5" />
                                        </div>
                                        <input
                                            type="date"
                                            name="purchaseDate"
                                            value={formData.purchaseDate}
                                            onChange={handleChange}
                                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all duration-300 font-bold text-gray-800 cursor-pointer"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Expiry Date</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                                            <Calendar className="w-5 h-5" />
                                        </div>
                                        <input
                                            type="date"
                                            name="expiryDate"
                                            value={formData.expiryDate}
                                            onChange={handleChange}
                                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all duration-300 font-bold text-gray-800 cursor-pointer"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row items-center justify-end gap-4 pt-10 border-t border-gray-50">
                                <button
                                    type="button"
                                    onClick={() => navigate('/licenses')}
                                    className="w-full md:w-auto px-10 py-4 rounded-2xl text-gray-500 font-bold text-sm hover:bg-gray-100 hover:text-gray-900 transition-all duration-300 order-2 md:order-1"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full md:w-auto px-10 py-4 rounded-2xl bg-linear-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm shadow-xl shadow-blue-100 hover:shadow-blue-200 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed order-1 md:order-2"
                                >
                                    {loading ? (
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    ) : (
                                        <CheckCircle2 className="w-5 h-5" />
                                    )}
                                    <span>{loading ? 'Registering...' : 'Register License'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterLicense;
