import React, { useState, useEffect } from 'react';
import { X, Wrench, Calendar, DollarSign, Clock, Search, Save } from 'lucide-react';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';

const MaintenanceForm = ({ isOpen, onClose, record, onSuccess, defaultAssetId = null }) => {
    const [formData, setFormData] = useState({
        assetId: defaultAssetId || '',
        vendorId: '',
        issueDescription: '',
        maintenanceType: 'Repair',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        serviceCost: '',
        status: 'Pending',
        notes: ''
    });
    
    const [assets, setAssets] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();

    // Reset form when opened or record changes
    useEffect(() => {
        if (isOpen) {
            if (record) {
                setFormData({
                    assetId: record.assetId?._id || record.assetId || '',
                    vendorId: record.vendorId?._id || record.vendorId || '',
                    issueDescription: record.issueDescription || '',
                    maintenanceType: record.maintenanceType || 'Repair',
                    startDate: record.startDate ? new Date(record.startDate).toISOString().split('T')[0] : '',
                    endDate: record.endDate ? new Date(record.endDate).toISOString().split('T')[0] : '',
                    serviceCost: record.serviceCost || '',
                    status: record.status || 'Pending',
                    notes: record.notes || ''
                });
            } else {
                setFormData({
                    assetId: defaultAssetId || '',
                    vendorId: '',
                    issueDescription: '',
                    maintenanceType: 'Repair',
                    startDate: new Date().toISOString().split('T')[0],
                    endDate: '',
                    serviceCost: '',
                    status: 'Pending',
                    notes: ''
                });
            }
            fetchOptions();
        }
    }, [isOpen, record, defaultAssetId]);

    const fetchOptions = async () => {
        try {
            const [assetsRes, vendorsRes] = await Promise.all([
                api.get('/assets'),
                api.get('/vendors')
            ]);
            
            if (assetsRes.data.success) {
                setAssets(assetsRes.data.data);
            }
            if (vendorsRes.data.success) {
                setVendors(vendorsRes.data.data.vendors || vendorsRes.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching options:', error);
            showToast('Failed to load assets and vendors', 'error');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Formatting payload
            const payload = { ...formData };
            if (!payload.endDate) delete payload.endDate;
            if (payload.serviceCost) payload.serviceCost = Number(payload.serviceCost);

            let response;
            if (record && !record.isVirtual) {
                response = await api.put(`/maintenance/${record._id}`, payload);
            } else {
                response = await api.post('/maintenance', payload);
            }

            if (response.data.success) {
                showToast((record && !record.isVirtual) ? 'Maintenance record updated' : 'Maintenance logged successfully', 'success');
                onSuccess();
                onClose();
            } else {
                showToast(response.data.message || 'Error processing request', 'error');
            }
        } catch (error) {
            console.error('Error saving maintenance:', error);
            showToast(error.response?.data?.message || 'Failed to save maintenance record', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-white dark:bg-dark-card w-full max-w-2xl rounded-2xl shadow-xl flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-gray-100 dark:border-dark-border flex justify-between items-center shrink-0">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Wrench className="w-5 h-5 text-blue-500" />
                        {record ? 'Edit Maintenance Record' : 'Log Maintenance'}
                    </h2>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                    <form id="maintenance-form" onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Asset *</label>
                                <select 
                                    name="assetId" 
                                    value={formData.assetId} 
                                    onChange={handleChange}
                                    required
                                    disabled={!!defaultAssetId && !record}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:text-white disabled:opacity-50"
                                >
                                    <option value="">Select Asset...</option>
                                    {assets.map(asset => (
                                        <option key={asset._id} value={asset._id}>{asset.name} ({asset.assetTag})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Vendor *</label>
                                <select 
                                    name="vendorId" 
                                    value={formData.vendorId} 
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:text-white"
                                >
                                    <option value="">Select Vendor...</option>
                                    {vendors.map(vendor => (
                                        <option key={vendor._id} value={vendor._id}>{vendor.vendorName || vendor.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Maintenance Type *</label>
                                <select 
                                    name="maintenanceType" 
                                    value={formData.maintenanceType} 
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:text-white"
                                >
                                    <option value="Repair">Repair</option>
                                    <option value="Preventive">Preventive</option>
                                    <option value="Upgrade">Upgrade</option>
                                    <option value="Inspection">Inspection</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Status *</label>
                                <select 
                                    name="status" 
                                    value={formData.status} 
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:text-white"
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Completed">Completed</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                                    <Calendar className="w-4 h-4" /> Start Date *
                                </label>
                                <input 
                                    type="date" 
                                    name="startDate" 
                                    value={formData.startDate} 
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:text-white"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                                    <Calendar className="w-4 h-4" /> End Date
                                </label>
                                <input 
                                    type="date" 
                                    name="endDate" 
                                    value={formData.endDate} 
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:text-white"
                                />
                            </div>

                            <div className="col-span-1 md:col-span-2 space-y-2">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                                    <DollarSign className="w-4 h-4" /> Service Cost *
                                </label>
                                <input 
                                    type="number" 
                                    step="0.01"
                                    min="0"
                                    name="serviceCost" 
                                    value={formData.serviceCost} 
                                    onChange={handleChange}
                                    required
                                    placeholder="0.00"
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:text-white"
                                />
                            </div>

                            <div className="col-span-1 md:col-span-2 space-y-2">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Issue Description *</label>
                                <textarea 
                                    name="issueDescription" 
                                    value={formData.issueDescription} 
                                    onChange={handleChange}
                                    required
                                    rows="3"
                                    placeholder="Describe the issue or reason for maintenance..."
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:text-white resize-none"
                                ></textarea>
                            </div>

                            <div className="col-span-1 md:col-span-2 space-y-2">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Notes (Optional)</label>
                                <textarea 
                                    name="notes" 
                                    value={formData.notes} 
                                    onChange={handleChange}
                                    rows="2"
                                    placeholder="Any additional notes or observations..."
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:text-white resize-none"
                                ></textarea>
                            </div>
                        </div>
                    </form>
                </div>

                <div className="p-6 border-t border-gray-100 dark:border-dark-border flex justify-end gap-3 shrink-0">
                    <button 
                        type="button" 
                        onClick={onClose}
                        className="px-6 py-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl font-medium transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit" 
                        form="maintenance-form"
                        disabled={loading}
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-sm transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading ? 'Saving...' : (
                            <>
                                <Save className="w-4 h-4" /> Save Record
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MaintenanceForm;
