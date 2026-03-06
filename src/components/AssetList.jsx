import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNotifications } from '../context/NotificationContext';
import { Search, Plus, Filter, Edit, Trash2, Loader, MoreHorizontal, Eye, UserPlus, RotateCcw, Box, ShieldCheck, ShieldAlert, ShieldX, Clock, Download } from 'lucide-react';
import AssetForm from './AssetForm';
import ReturnConfirmModal from './ReturnConfirmModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import Pagination from './Pagination';
import { getExpiryStatus } from '../utils/warrantyUtils';
import { exportToCSV, formatDateForCSV } from '../utils/csvExport';
import getDisplayImageUrl from '../utils/imageUtils';
import api from '../utils/api';



const AssetList = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { showToast } = useToast();
    const { checkItemAndNotify } = useNotifications();
    const [assets, setAssets] = useState([]);
    const [filteredAssets, setFilteredAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const location = useLocation();
    const [statusFilter, setStatusFilter] = useState('All');
    const [warrantyFilter, setWarrantyFilter] = useState('All');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingAsset, setEditingAsset] = useState(null);
    const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
    const [selectedReturnAsset, setSelectedReturnAsset] = useState(null);
    const [isReturning, setIsReturning] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedDeleteAsset, setSelectedDeleteAsset] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [isExporting, setIsExporting] = useState(false);
    const itemsPerPage = 5;

    const fetchAssets = async () => {
        setLoading(true);
        try {
            const response = await api.get('/assets');
            const data = response.data;
            if (data.success) {
                console.log('Fetched assets from API:', data.data); // Debug log
                // Log warranty dates specifically
                data.data.forEach(asset => {
                    if (asset.warrantyExpiry) {
                        console.log(`Asset ${asset.assetTag} warranty:`, asset.warrantyExpiry);
                    }
                });
                setAssets(data.data);
                setFilteredAssets(data.data);
            }
        } catch (error) {
            console.error('Error fetching assets:', error);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchAssets();
        if (location.state?.statusFilter) {
            setStatusFilter(location.state.statusFilter);
            // Verify if we need to clear state to avoid persistent filter on refresh (optional, usually good UX to keep it)
        }
    }, [location.state]);

    useEffect(() => {
        let result = [...assets];

        // Sort by updatedAt (descending) to show newest/most recently edited at the top
        result.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

        if (statusFilter !== 'All') {
            result = result.filter(asset => asset.status === statusFilter);
        }

        if (warrantyFilter !== 'All') {
            result = result.filter(asset => {
                const status = getExpiryStatus(asset.warrantyExpiry);
                if (warrantyFilter === 'Active') return status.status === 'active';
                if (warrantyFilter === 'Expiring Soon') return status.status === 'expiring';
                if (warrantyFilter === 'Expired') return status.status === 'expired';
                if (warrantyFilter === 'No Warranty') return status.status === 'none';
                return true;
            });
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(asset =>
                asset.name.toLowerCase().includes(query) ||
                asset.assetTag.toLowerCase().includes(query) ||
                (asset.serialNumber && asset.serialNumber.toLowerCase().includes(query))
            );
        }

        setFilteredAssets(result);
        setCurrentPage(1); // Reset to first page when filters change
    }, [assets, searchQuery, statusFilter, warrantyFilter]);

    const handleCreateUpdate = async (formData) => {
        try {
            const data = new FormData();

            // Store imageFile if it exists and remove it from formData
            const imageFile = formData.imageFile;

            // Loop through formData and append to data
            Object.keys(formData).forEach(key => {
                if (key === 'imageFile') return; // Skip imageFile, we append it separately as 'image'

                let value = formData[key];

                // 1. Skip internal metadata
                if (['__v', 'createdAt', 'updatedAt', 'history', '_id'].includes(key)) return;

                // 2. Ensure assignment fields are just IDs (if populated)
                if ((key === 'currentAssignedTo' || key === 'assignedTo') && value && typeof value === 'object') {
                    value = value._id;
                }

                // 3. Status consistency: if NOT Assigned, clear assignedTo fields
                if (formData.status !== 'Assigned' && (key === 'currentAssignedTo' || key === 'assignedTo')) {
                    value = null;
                }

                // 4. Ensure imageUrl is a string (safeguard against weird API responses/state updates)
                if (key === 'imageUrl' && value && typeof value === 'object') {
                    value = value.url || value.imageUrl || '';
                }

                // 5. Ensure warrantyExpiry is handled (if empty string, don't append or set to null)
                if (key === 'warrantyExpiry' && value === '') return;

                // Append value to FormData (handle nulls as empty string or skip)
                if (value !== null && value !== undefined) {
                    data.append(key, value);
                }
            });

            // Append image if selected
            if (imageFile) {
                data.append('image', imageFile);
            }

            console.log('Sending FormData to backend'); // Debug log

            let response;
            if (editingAsset) {
                response = await api.put(`/assets/${editingAsset._id}`, data);
            } else {
                response = await api.post('/assets', data);
            }

            const responseData = response.data;

            if (responseData.success) {
                // Close form first
                setIsFormOpen(false);
                setEditingAsset(null);

                // Show success message
                showToast(
                    editingAsset ? 'Asset updated successfully' : 'New asset added successfully',
                    'success'
                );

                // Immediately check and notify for warranty expiry
                checkItemAndNotify(formData, 'asset');

                // Refresh data with slight delay to ensure backend has processed the update
                setTimeout(() => {
                    fetchAssets();
                }, 300);
            } else {
                showToast(responseData.message || 'Operation failed', 'error');
            }
        } catch (error) {
            console.error('Error saving asset:', error);
            showToast('Failed to save asset. Please try again.', 'error');
        }
    };

    const handleDeleteClick = (asset) => {
        setSelectedDeleteAsset(asset);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!selectedDeleteAsset) return;

        setIsDeleting(true);
        try {
            const response = await api.delete(`/assets/${selectedDeleteAsset._id}`);
            const data = response.data;
            if (data.success) {
                fetchAssets(); // Refresh list
                setIsDeleteModalOpen(false);
                setSelectedDeleteAsset(null);
                showToast('Asset deleted successfully', 'success');
            } else {
                showToast(data.message || 'Error deleting asset', 'error');
            }
        } catch (error) {
            console.error('Error deleting asset:', error);
            showToast('Failed to delete asset. Please try again.', 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleReturnClick = (asset) => {
        setSelectedReturnAsset(asset);
        setIsReturnModalOpen(true);
    };

    const confirmReturn = async () => {
        if (!selectedReturnAsset) return;

        setIsReturning(true);
        const id = selectedReturnAsset._id;
        try {
            const response = await api.put(`/assets/${id}`, {
                status: 'Available',
                currentAssignedTo: null,
                assignedTo: null
            });

            const data = response.data;

            if (data.success) {
                fetchAssets();
                setIsReturnModalOpen(false);
                setSelectedReturnAsset(null);
                showToast('Asset returned successfully', 'success');
            } else {
                showToast(data.message || 'Unknown error occurred', 'error');
            }
        } catch (error) {
            console.error('Error returning asset:', error);
            showToast('Failed to return asset: ' + error.message, 'error');
        } finally {
            setIsReturning(false);
        }
    };

    const openEditForm = (asset) => {
        setEditingAsset(asset);
        setIsFormOpen(true);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Available': return 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30';
            case 'Assigned': return 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/30';
            case 'Under Repair': return 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-900/30';
            case 'Retired': return 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 border-rose-100 dark:border-rose-900/30';
            default: return 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-400 border-slate-100 dark:border-dark-border';
        }
    };

    // CSV Export Handler
    const handleExportCSV = () => {
        setIsExporting(true);
        try {
            const columns = [
                { key: 'assetTag', header: 'Asset Tag' },
                { key: 'name', header: 'Asset Name' },
                { key: 'category', header: 'Category' },
                { key: 'model', header: 'Model' },
                { key: 'manufacturer', header: 'Manufacturer' },
                { key: 'serialNumber', header: 'Serial Number' },
                { key: 'status', header: 'Status' },
                {
                    key: 'currentAssignedTo',
                    header: 'Assigned To',
                    accessor: (asset) => asset.currentAssignedTo ? asset.currentAssignedTo.fullName : 'Unassigned'
                },
                {
                    key: 'warrantyExpiry',
                    header: 'Warranty Expiry',
                    accessor: (asset) => formatDateForCSV(asset.warrantyExpiry)
                },
                { key: 'purchaseDate', header: 'Purchase Date', accessor: (asset) => formatDateForCSV(asset.purchaseDate) },
                { key: 'purchaseCost', header: 'Purchase Cost' },
                { key: 'location', header: 'Location' },
            ];

            const filename = `assets_export_${new Date().toISOString().split('T')[0]}.csv`;
            exportToCSV(filteredAssets, columns, filename);
        } catch (error) {
            console.error('Export failed:', error);
        } finally {
            setIsExporting(false);
        }
    };

    // Pagination calculations
    const totalPages = Math.ceil(filteredAssets.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentAssets = filteredAssets.slice(startIndex, endIndex);

    return (
        <div className="p-4 md:p-8 animate-fade-in-up transition-colors duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 md:mb-12">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-1 bg-brand-primary rounded-full"></div>
                        <span className="text-brand-primary font-bold text-[8px] md:text-[10px] uppercase tracking-widest">Global Inventory</span>
                    </div>
                    <h1 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight transition-colors">Assets Management</h1>
                    <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1 transition-colors">Enterprise-grade tracking for all managed hardware resources.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <button
                        onClick={handleExportCSV}
                        disabled={isExporting || filteredAssets.length === 0}
                        className="flex items-center justify-center space-x-2 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border text-slate-600 dark:text-slate-300 px-4 md:px-6 py-3 rounded-2xl font-bold text-sm shadow-premium hover:shadow-hover hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                        {isExporting ? (
                            <Loader className="w-5 h-5 animate-spin" />
                        ) : (
                            <Download className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        )}
                        <span>{isExporting ? 'Generating...' : 'Export Data'}</span>
                    </button>
                    {['Admin', 'Manager'].includes(user?.role) && (
                        <button
                            onClick={() => {
                                setEditingAsset(null);
                                setIsFormOpen(true);
                            }}
                            className="flex items-center space-x-2 bg-brand-primary text-white px-4 md:px-6 py-3 rounded-2xl font-bold text-sm shadow-premium shadow-indigo-200 dark:shadow-none hover:shadow-hover hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 active:scale-95 w-full md:w-auto justify-center group"
                        >
                            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                            <span>Register New Asset</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-dark-card p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] shadow-premium dark:shadow-none border border-gray-100 dark:border-dark-border mb-8 flex flex-col lg:flex-row gap-4 md:gap-6 items-center justify-between transition-colors">
                <div className="relative w-full lg:w-96 group">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-500 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search assets..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50/50 dark:bg-slate-800/50 border border-transparent dark:border-dark-border rounded-2xl focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/20 focus:border-blue-500 outline-none transition-all duration-300 font-bold text-sm text-gray-800 dark:text-white placeholder:text-gray-300 dark:placeholder:text-slate-600"
                    />
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
                    <div className="hidden sm:flex items-center space-x-2 text-gray-400 dark:text-slate-500 px-2 font-bold uppercase tracking-widest text-[10px]">
                        <Filter className="w-4 h-4 text-blue-500" />
                        <span>Filter</span>
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full sm:w-auto px-6 py-3 bg-gray-50/50 dark:bg-slate-800/50 border border-transparent dark:border-dark-border rounded-2xl focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/20 focus:border-blue-500 outline-none cursor-pointer transition-all duration-300 font-bold text-xs md:text-sm text-gray-800 dark:text-white min-w-[140px]"
                    >
                        <option value="All">All Status</option>
                        <option value="Available">Available</option>
                        <option value="Assigned">Assigned</option>
                        <option value="Under Repair">Under Repair</option>
                        <option value="Retired">Retired</option>
                    </select>
                    <select
                        value={warrantyFilter}
                        onChange={(e) => setWarrantyFilter(e.target.value)}
                        className="w-full sm:w-auto px-6 py-3 bg-gray-50/50 dark:bg-slate-800/50 border border-transparent dark:border-dark-border rounded-2xl focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-emerald-100 dark:focus:ring-emerald-900/20 focus:border-emerald-500 outline-none cursor-pointer transition-all duration-300 font-bold text-xs md:text-sm text-gray-800 dark:text-white min-w-[150px]"
                    >
                        <option value="All">All Warranty</option>
                        <option value="Active">Active</option>
                        <option value="Expiring Soon">Expiring Soon</option>
                        <option value="Expired">Expired</option>
                        <option value="No Warranty">No Warranty</option>
                    </select>
                </div>
            </div>

            {/* Results Count */}
            {!loading && filteredAssets.length > 0 && (
                <div className="flex justify-end mb-4">
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/30 px-3 py-1 rounded-full border border-slate-100 dark:border-dark-border/20 transition-colors">
                        Page <span className="text-blue-600 dark:text-indigo-400">{currentPage}</span> of <span className="text-slate-900 dark:text-white">{totalPages}</span>
                    </div>
                </div>
            )}

            {/* Table wrapper for horizontal scroll */}
            <div className="bg-white dark:bg-dark-card rounded-[1.5rem] md:rounded-[2.5rem] shadow-premium dark:shadow-none border border-slate-100 dark:border-dark-border overflow-hidden transition-colors duration-500">

                {loading ? (
                    <div className="flex items-center justify-center p-24">
                        <Loader className="w-10 h-10 text-blue-500 animate-spin" />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-dark-border transition-colors">
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Asset Tag</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Asset Name</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Category</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Status</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Warranty</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Assigned To</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-dark-border transition-colors">
                                {currentAssets.length > 0 ? (
                                    currentAssets.map((asset, index) => (
                                        <tr
                                            key={asset._id}
                                            className="hover:bg-blue-50/40 dark:hover:bg-slate-800/40 transition-all duration-300 group cursor-pointer"
                                            onClick={() => navigate(`/assets/${asset._id}`)}
                                        >
                                            <td className="px-8 py-6">
                                                <span className="text-xs font-black font-mono text-gray-900 dark:text-slate-200 bg-gray-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-dark-border group-hover:bg-white dark:group-hover:bg-slate-700 transition-colors uppercase tracking-widest">{asset.assetTag}</span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center space-x-4">
                                                    <div className="w-12 h-12 bg-gray-100 dark:bg-slate-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-dark-border shrink-0 transition-colors group-hover:scale-105 duration-500">
                                                        {asset.imageUrl ? (
                                                            <img src={getDisplayImageUrl(asset.imageUrl)} alt={asset.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-slate-600">
                                                                <Box className="w-6 h-6" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-black text-slate-900 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-indigo-400 transition-colors">{asset.name}</span>
                                                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">{asset.model}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="text-[10px] font-black text-slate-500 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/50 px-3 py-1.5 rounded-xl uppercase tracking-widest transition-colors">{asset.category}</span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-colors ${getStatusColor(asset.status)}`}>
                                                    {asset.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                {(() => {
                                                    const warrantyStatus = getExpiryStatus(asset.warrantyExpiry);
                                                    const Icon = warrantyStatus.icon;
                                                    return (
                                                        <span
                                                            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-black uppercase tracking-widest border transition-all duration-300 group/warranty ${warrantyStatus.status === 'active'
                                                                ? 'bg-emerald-50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30'
                                                                : warrantyStatus.status === 'expiring'
                                                                    ? 'bg-amber-50 dark:bg-amber-900/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/30'
                                                                    : warrantyStatus.status === 'expired'
                                                                        ? 'bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/30'
                                                                        : 'bg-gray-50 dark:bg-slate-800/50 text-gray-500 dark:text-slate-500 border-gray-200 dark:border-dark-border'
                                                                }`}
                                                        >
                                                            <Icon className={`w-3.5 h-3.5 group-hover/warranty:scale-125 transition-transform duration-500`} />
                                                            <span className="text-[9px]">{warrantyStatus.label}</span>
                                                        </span>
                                                    );
                                                })()}
                                            </td>
                                            <td className="px-8 py-6">
                                                {asset.currentAssignedTo ? (
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-8 h-8 rounded-xl bg-linear-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center text-[10px] font-black shadow-lg">
                                                            {asset.currentAssignedTo.firstName.charAt(0)}{asset.currentAssignedTo.lastName.charAt(0)}
                                                        </div>
                                                        <span className="text-sm text-slate-700 dark:text-slate-300 font-bold group-hover:text-blue-600 dark:group-hover:text-indigo-400 transition-colors">{asset.currentAssignedTo.fullName}</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center space-x-3">
                                                        <span className="text-xs font-bold text-slate-300 dark:text-slate-700 italic tracking-wider transition-colors">UNASSIGNED</span>
                                                        {asset.status === 'Available' && ['Admin', 'Manager'].includes(user?.role) && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    navigate(`/assets/${asset._id}/assign`);
                                                                }}
                                                                className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl transition-all duration-300 hover:scale-110"
                                                                title="Quick Assign"
                                                            >
                                                                <UserPlus className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex items-center justify-end space-x-2">
                                                    {['Admin', 'Manager'].includes(user?.role) && (
                                                        <>
                                                            {asset.status === 'Assigned' && (
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleReturnClick(asset);
                                                                    }}
                                                                    className="p-3 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-500 hover:shadow-lg transition-all duration-300 group/ret"
                                                                    title="Return Asset"
                                                                >
                                                                    <RotateCcw className="w-4 h-4 group-hover/ret:rotate-180 transition-transform duration-500" />
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    openEditForm(asset);
                                                                }}
                                                                className="p-3 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-2xl hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500 hover:shadow-lg transition-all duration-300"
                                                                title="Edit"
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </button>
                                                        </>
                                                    )}
                                                    {user?.role === 'Admin' && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteClick(asset);
                                                            }}
                                                            className="p-3 text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-2xl hover:bg-red-500 hover:text-white dark:hover:bg-red-500 hover:shadow-lg transition-all duration-300"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="px-8 py-32 text-center">
                                            <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 space-y-6">
                                                <div className="w-24 h-24 bg-slate-50 dark:bg-slate-900/50 rounded-[2.5rem] flex items-center justify-center transition-colors">
                                                    <Search className="w-10 h-10" />
                                                </div>
                                                <div>
                                                    <p className="text-xl font-black text-slate-900 dark:text-white transition-colors">No assets discovered</p>
                                                    <p className="font-medium mt-2 max-w-xs mx-auto">Try refining your discovery parameters or search query.</p>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {!loading && filteredAssets.length > 0 && (
                <div className="mt-10">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        itemsPerPage={itemsPerPage}
                        totalItems={filteredAssets.length}
                        onPageChange={setCurrentPage}
                    />
                </div>
            )}

            <AssetForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSubmit={handleCreateUpdate}
                initialData={editingAsset}
            />

            <ReturnConfirmModal
                isOpen={isReturnModalOpen}
                onClose={() => setIsReturnModalOpen(false)}
                onConfirm={confirmReturn}
                assetName={selectedReturnAsset?.name}
                assetTag={selectedReturnAsset?.assetTag}
                isReturning={isReturning}
            />

            <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Asset?"
                itemName={selectedDeleteAsset?.name}
                itemTag={selectedDeleteAsset?.assetTag}
                isDeleting={isDeleting}
            />
        </div>
    );
};

export default AssetList;
