import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Wrench, Calendar, DollarSign, Clock, MoreVertical, X, CheckSquare, RefreshCw, FileText } from 'lucide-react';
import api from '../utils/api';
import MaintenanceForm from './MaintenanceForm';
import { useToast } from '../context/ToastContext';

const Maintenance = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const { showToast } = useToast();

    const fetchRecords = async () => {
        setLoading(true);
        try {
            const [maintenanceRes, assetsRes] = await Promise.all([
                api.get('/maintenance'),
                api.get('/assets')
            ]);
            
            let allMaintenance = [];
            if (maintenanceRes.data.success) {
                allMaintenance = maintenanceRes.data.data;
            }
            
            let allAssets = [];
            if (assetsRes.data.success) {
                allAssets = assetsRes.data.data;
            }

            const activeAssetIds = new Set(
                allMaintenance
                    .filter(r => r.status === 'Pending' || r.status === 'In Progress')
                    .map(r => r.assetId?._id || r.assetId)
            );

            const virtualRecords = allAssets
                .filter(asset => asset.status === 'Under Repair' && !activeAssetIds.has(asset._id))
                .map(asset => ({
                    _id: `virtual-${asset._id}`,
                    assetId: asset,
                    maintenanceType: 'Repair',
                    issueDescription: 'Asset marked as Under Repair. Please log details.',
                    vendorId: null,
                    serviceCost: 0,
                    status: 'Pending',
                    isVirtual: true
                }));

            setRecords([...virtualRecords, ...allMaintenance]);
        } catch (error) {
            console.error('Error fetching maintenance:', error);
            showToast('Error loading maintenance records', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecords();
    }, []);

    const handleEdit = (record) => {
        setEditingRecord(record);
        setIsFormOpen(true);
    };

    const handleDelete = async (id) => {
        if (id.startsWith('virtual-')) {
             showToast('Cannot delete auto-generated record. Change asset status directly.', 'error');
             return;
        }
        if (!window.confirm('Are you sure you want to delete this maintenance record?')) return;
        try {
            const response = await api.delete(`/maintenance/${id}`);
            if (response.data.success) {
                showToast('Maintenance record deleted successfully', 'success');
                fetchRecords();
            } else {
                showToast(response.data.message || 'Failed to delete record', 'error');
            }
        } catch (error) {
            console.error('Error deleting maintenance:', error);
            showToast('Error deleting maintenance record', 'error');
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Completed': return 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/50';
            case 'In Progress': return 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/50';
            case 'Pending': return 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/50';
            default: return 'bg-gray-50 text-gray-600 border-gray-100 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'Repair': return <Wrench className="w-4 h-4 text-orange-500" />;
            case 'Preventive': return <CheckSquare className="w-4 h-4 text-blue-500" />;
            case 'Upgrade': return <Plus className="w-4 h-4 text-purple-500" />;
            case 'Inspection': return <Search className="w-4 h-4 text-emerald-500" />;
            default: return <Wrench className="w-4 h-4 text-gray-500" />;
        }
    };

    const filteredRecords = records.filter(record => 
        (record.status !== 'Completed') &&
        (statusFilter === '' || record.status === statusFilter) &&
        (
            (record.assetId?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (record.vendorId?.vendorName || record.vendorId?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (record.issueDescription || '').toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const completedRecords = records.filter(record => record.status === 'Completed' && !record.isVirtual);

    return (
        <div className="p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Maintenance Tracking</h1>
                        <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">Manage asset repairs, upgrades, and inspections</p>
                    </div>
                    <button
                        onClick={() => { setEditingRecord(null); setIsFormOpen(true); }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-medium shadow-sm transition-all flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Log Maintenance
                    </button>
                </div>

                <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border p-4 flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by asset, vendor, or issue..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                    </div>
                    <div className="flex gap-2">
                        <div className="flex items-center gap-2 px-3 sm:px-4 py-2.5 border border-gray-200 dark:border-dark-border rounded-xl bg-white dark:bg-dark-card focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
                            <Filter className="w-4 h-4 text-gray-500 dark:text-slate-400" />
                            <select 
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="bg-transparent border-none outline-none text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer sm:w-28"
                            >
                                <option value="">All Active</option>
                                <option value="Pending">Pending</option>
                                <option value="In Progress">In Progress</option>
                            </select>
                        </div>
                        <button onClick={fetchRecords} className="p-2.5 border border-gray-200 dark:border-dark-border rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>

                <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-dark-border">
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Asset</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Type & Issue</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Vendor</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Cost</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
                                {loading && records.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-8 text-center text-gray-500 dark:text-slate-400">
                                            Loading records...
                                        </td>
                                    </tr>
                                ) : filteredRecords.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-8 text-center text-gray-500 dark:text-slate-400">
                                            No maintenance records found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredRecords.map((record) => (
                                        <tr key={record._id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900 dark:text-white">{record.assetId?.name || 'Unknown Asset'}</div>
                                                <div className="text-xs text-gray-500 dark:text-slate-400 mt-1">{record.assetId?.assetTag}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 font-medium text-gray-900 dark:text-white">
                                                    {getTypeIcon(record.maintenanceType)}
                                                    {record.maintenanceType}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-slate-400 mt-1 max-w-[200px] truncate" title={record.issueDescription}>
                                                    {record.issueDescription}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-700 dark:text-gray-300">{record.vendorId?.vendorName || record.vendorId?.name || 'Unknown Vendor'}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1 font-medium text-gray-900 dark:text-white">
                                                    <DollarSign className="w-4 h-4 text-gray-400" />
                                                    {record.serviceCost?.toLocaleString() || '0'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusStyle(record.status)}`}>
                                                    {record.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => handleEdit(record)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                                                        <Wrench className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => handleDelete(record._id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Completed Maintenance Bill Summary */}
                {completedRecords.length > 0 && (
                    <div className="pt-8 space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
                                <FileText className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Completed Repairs & Bills</h2>
                                <p className="text-sm text-gray-500 dark:text-slate-400">Invoice summary for finished maintenance</p>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {completedRecords.map(record => {
                                const start = new Date(record.startDate);
                                const end = record.endDate ? new Date(record.endDate) : new Date();
                                const downtime = Math.ceil((end - start) / (1000 * 60 * 60)); // hours
                                
                                return (
                                    <div key={record._id} className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border overflow-hidden relative group hover:border-emerald-200 dark:hover:border-emerald-500/30 transition-all">
                                        <div className="absolute top-0 right-0 p-4">
                                            <span className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase">
                                                Paid
                                            </span>
                                        </div>
                                        <div className="p-6 border-b border-gray-50 dark:border-dark-border/50 bg-gray-50/50 dark:bg-slate-800/30">
                                            <p className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1">Invoice</p>
                                            <h3 className="font-bold text-gray-900 dark:text-white text-lg truncate pr-16">{record.assetId?.name || 'Asset'}</h3>
                                            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-slate-600"></div>
                                                {record.vendorId?.vendorName || record.vendorId?.name || 'In-House'}
                                            </p>
                                        </div>
                                        <div className="p-6 space-y-4">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-500 dark:text-slate-400 flex items-center gap-2"><Calendar className="w-4 h-4"/> Started</span>
                                                <span className="font-semibold text-gray-900 dark:text-white">{start.toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-500 dark:text-slate-400 flex items-center gap-2"><Calendar className="w-4 h-4"/> Finished</span>
                                                <span className="font-semibold text-gray-900 dark:text-white">{record.endDate ? end.toLocaleDateString() : 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-500 dark:text-slate-400 flex items-center gap-2"><Clock className="w-4 h-4"/> Downtime</span>
                                                <span className="font-semibold text-gray-900 dark:text-white">{downtime} Hrs</span>
                                            </div>
                                            <div className="pt-4 mt-2 border-t border-gray-100 dark:border-dark-border flex justify-between items-center">
                                                <span className="text-gray-500 dark:text-slate-400 text-sm font-bold uppercase tracking-widest">Total Cost</span>
                                                <span className="text-xl font-black text-gray-900 dark:text-white flex items-center">
                                                    <DollarSign className="w-5 h-5 text-gray-400" />
                                                    {record.serviceCost?.toLocaleString() || '0'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            <MaintenanceForm 
                isOpen={isFormOpen} 
                onClose={() => setIsFormOpen(false)} 
                record={editingRecord}
                onSuccess={fetchRecords}
            />
        </div>
    );
};

export default Maintenance;
