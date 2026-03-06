import React, { useState, useEffect } from 'react';
import { X, Building2, User, Mail, Phone, MapPin, Star, Plus, Minus } from 'lucide-react';

const VendorForm = ({ isOpen, onClose, onSubmit, initialData }) => {
    const [formData, setFormData] = useState({
        vendorName: '',
        contactPerson: '',
        email: '',
        phone: '',
        address: '',
        servicesProvided: [''],
        rating: 3,
        status: 'Active'
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                vendorName: initialData.vendorName || '',
                contactPerson: initialData.contactPerson || '',
                email: initialData.email || '',
                phone: initialData.phone || '',
                address: initialData.address || '',
                servicesProvided: initialData.servicesProvided?.length > 0 ? [...initialData.servicesProvided] : [''],
                rating: initialData.rating || 3,
                status: initialData.status || 'Active'
            });
        } else {
            setFormData({
                vendorName: '',
                contactPerson: '',
                email: '',
                phone: '',
                address: '',
                servicesProvided: [''],
                rating: 3,
                status: 'Active'
            });
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleAddService = () => {
        setFormData(prev => ({ ...prev, servicesProvided: [...prev.servicesProvided, ''] }));
    };

    const handleRemoveService = (index) => {
        const newServices = formData.servicesProvided.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, servicesProvided: newServices.length > 0 ? newServices : [''] }));
    };

    const handleServiceChange = (index, value) => {
        const newServices = [...formData.servicesProvided];
        newServices[index] = value;
        setFormData(prev => ({ ...prev, servicesProvided: newServices }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Clean up empty services
        const cleanedData = {
            ...formData,
            servicesProvided: formData.servicesProvided.filter(s => s.trim() !== '')
        };
        onSubmit(cleanedData);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 overflow-y-auto">
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            
            <div className="relative bg-white dark:bg-dark-card w-full max-w-2xl rounded-[2.5rem] shadow-2xl border border-slate-50 dark:border-dark-border animate-zoom-in overflow-hidden">
                <header className="px-8 py-6 border-b border-slate-50 dark:border-dark-border flex items-center justify-between bg-white dark:bg-dark-card sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-brand-primary flex items-center justify-center">
                            <Building2 className="w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">
                            {initialData ? 'Update Vendor' : 'Register Vendor'}
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-xl transition-all">
                        <X className="w-6 h-6" />
                    </button>
                </header>

                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <Building2 className="w-3 h-3" /> Vendor Name *
                            </label>
                            <input 
                                required
                                type="text"
                                value={formData.vendorName}
                                onChange={(e) => setFormData(prev => ({ ...prev, vendorName: e.target.value }))}
                                className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-brand-primary/30 rounded-2xl outline-none transition-all text-sm font-bold text-slate-900 dark:text-white"
                                placeholder="Enter vendor company name"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <User className="w-3 h-3" /> Contact Person
                            </label>
                            <input 
                                type="text"
                                value={formData.contactPerson}
                                onChange={(e) => setFormData(prev => ({ ...prev, contactPerson: e.target.value }))}
                                className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-brand-primary/30 rounded-2xl outline-none transition-all text-sm font-bold text-slate-900 dark:text-white"
                                placeholder="Name of representative"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <Mail className="w-3 h-3" /> Business Email
                            </label>
                            <input 
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-brand-primary/30 rounded-2xl outline-none transition-all text-sm font-bold text-slate-900 dark:text-white"
                                placeholder="contact@vendor.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <Phone className="w-3 h-3" /> Support Phone
                            </label>
                            <input 
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-brand-primary/30 rounded-2xl outline-none transition-all text-sm font-bold text-slate-900 dark:text-white"
                                placeholder="+1 (555) 000-0000"
                            />
                        </div>
                    </div>

                    {/* Address & Status */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <MapPin className="w-3 h-3" /> Office Address
                            </label>
                            <input 
                                type="text"
                                value={formData.address}
                                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                                className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-brand-primary/30 rounded-2xl outline-none transition-all text-sm font-bold text-slate-900 dark:text-white"
                                placeholder="Corporate headquarters"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                Status
                            </label>
                            <select 
                                value={formData.status}
                                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                                className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-brand-primary/30 rounded-2xl outline-none transition-all text-sm font-bold text-slate-900 dark:text-white"
                            >
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>
                    </div>

                    {/* Services (Dynamic Array) */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Services Provided</label>
                            <button 
                                type="button"
                                onClick={handleAddService}
                                className="text-[10px] font-black text-brand-primary uppercase tracking-widest hover:underline"
                            >
                                + Add Service
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {formData.servicesProvided.map((service, index) => (
                                <div key={index} className="relative group/service">
                                    <input 
                                        type="text"
                                        value={service}
                                        onChange={(e) => handleServiceChange(index, e.target.value)}
                                        className="w-full pl-5 pr-12 py-3 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-brand-primary/30 rounded-xl outline-none transition-all text-xs font-bold text-slate-700 dark:text-slate-200"
                                        placeholder="e.g. Cloud Hosting"
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => handleRemoveService(index)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-300 hover:text-red-500 transition-colors"
                                    >
                                        <Minus className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Rating */}
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Internal Rating</label>
                        <div className="flex items-center gap-4">
                            {[1, 2, 3, 4, 5].map((num) => (
                                <button
                                    key={num}
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, rating: num }))}
                                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                                        formData.rating >= num 
                                        ? 'bg-amber-400 text-white shadow-lg shadow-amber-100 dark:shadow-none' 
                                        : 'bg-slate-50 dark:bg-slate-800 text-slate-300'
                                    }`}
                                >
                                    <Star className={`w-6 h-6 ${formData.rating >= num ? 'fill-white' : ''}`} />
                                </button>
                            ))}
                            <span className="text-sm font-black text-slate-400 ml-2 tracking-widest uppercase">{formData.rating} of 5</span>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="pt-4 border-t border-slate-50 dark:border-dark-border flex items-center justify-end gap-4">
                        <button 
                            type="button"
                            onClick={onClose}
                            className="px-8 py-3.5 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            className="px-10 py-3.5 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-2xl font-black text-sm tracking-widest uppercase shadow-xl shadow-indigo-100 dark:shadow-none transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            {initialData ? 'Save Changes' : 'Create Vendor'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default VendorForm;
