import React, { useState, useEffect } from 'react';
import { X, Calendar, Hash, Tag, Globe, Package } from 'lucide-react';

const LicenseForm = ({ isOpen, onClose, onSubmit, initialData }) => {
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

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                purchaseDate: initialData.purchaseDate ? initialData.purchaseDate.split('T')[0] : '',
                expiryDate: initialData.expiryDate ? initialData.expiryDate.split('T')[0] : '',
            });
        } else {
            setFormData({
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
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 animate-fade-in">
            <div className="bg-white/95 backdrop-blur-xl rounded-[2.5rem] shadow-premium w-full max-w-2xl max-h-[95vh] overflow-hidden animate-scale-in border border-white/50 flex flex-col">
                <div className="flex items-center justify-between p-8 border-b border-slate-100 bg-slate-50/50 backdrop-blur-sm shrink-0">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-2 h-2 bg-brand-primary rounded-full animate-pulse"></div>
                            <span className="text-brand-primary font-bold text-[10px] uppercase tracking-widest leading-none">Software Compliance</span>
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
                            {initialData ? 'Update License' : 'Register Software'}
                        </h2>
                        <p className="text-sm text-slate-500 mt-1 font-medium">Maintain enterprise compliance and utilization records.</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 hover:bg-slate-100/80 rounded-2xl transition-all duration-300 group border border-transparent hover:border-slate-200"
                    >
                        <X className="w-5 h-5 text-slate-400 group-hover:text-slate-900" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Software Name</label>
                            <input
                                type="text"
                                name="softwareName"
                                placeholder="e.g. Adobe Creative Cloud"
                                value={formData.softwareName}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all duration-300 font-medium text-gray-800 placeholder:text-gray-300"
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">License Key / ID</label>
                            <input
                                type="text"
                                name="licenseKey"
                                placeholder="e.g. XXXX-XXXX-XXXX-XXXX"
                                value={formData.licenseKey}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all duration-300 font-medium text-gray-800 placeholder:text-gray-300"
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Vendor</label>
                            <input
                                type="text"
                                name="vendor"
                                placeholder="e.g. Adobe"
                                value={formData.vendor}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all duration-300 font-medium text-gray-800 placeholder:text-gray-300"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">License Type</label>
                            <div className="relative group">
                                <select
                                    name="licenseType"
                                    value={formData.licenseType}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all duration-300 font-medium text-gray-800 appearance-none cursor-pointer"
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
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Category</label>
                            <div className="relative group">
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all duration-300 font-medium text-gray-800 appearance-none cursor-pointer"
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
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Platform</label>
                            <div className="relative group">
                                <select
                                    name="platform"
                                    value={formData.platform}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all duration-300 font-medium text-gray-800 appearance-none cursor-pointer"
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
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Total Seats / Users</label>
                            <input
                                type="number"
                                name="totalSeats"
                                placeholder="e.g. 50"
                                value={formData.totalSeats}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all duration-300 font-medium text-gray-800 placeholder:text-gray-300"
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Status</label>
                            <div className="relative group">
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all duration-300 font-medium text-gray-800 appearance-none cursor-pointer"
                                >
                                    <option value="Active">Active</option>
                                    <option value="Expired">Expired</option>
                                    <option value="Suspended">Suspended</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Purchase Date</label>
                            <input
                                type="date"
                                name="purchaseDate"
                                value={formData.purchaseDate}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all duration-300 font-medium text-gray-800 cursor-pointer"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Expiry Date</label>
                            <input
                                type="date"
                                name="expiryDate"
                                value={formData.expiryDate}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all duration-300 font-medium text-gray-800 cursor-pointer"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-end space-x-4 p-8 border-t border-slate-100 bg-slate-50/50 backdrop-blur-sm shrink-0">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-8 py-3.5 rounded-2xl text-slate-500 font-bold text-sm hover:bg-slate-100 hover:text-slate-900 transition-all duration-300"
                        >
                            Discard
                        </button>
                        <button
                            type="submit"
                            className="px-10 py-3.5 rounded-2xl bg-brand-primary text-white font-bold text-sm shadow-premium shadow-indigo-100 hover:shadow-hover hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 group flex items-center gap-2"
                        >
                            <span>{initialData ? 'Update Record' : 'Register License'}</span>
                            <CheckCircle2 className="w-4 h-4 group-hover:scale-125 transition-transform" />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LicenseForm;
