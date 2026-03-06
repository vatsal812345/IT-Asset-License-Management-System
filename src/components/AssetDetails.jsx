import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ArrowLeft,
    Box,
    Calendar,
    Tag,
    Hash,
    MapPin,
    Info,
    User,
    History,
    UserPlus,
    Edit,
    Loader,
    ChevronRight,
    CheckCircle2,
    AlertCircle,
    Clock,
    Wrench,
    XCircle,
    Mail,
    Smartphone,
    RotateCcw,
    Trash2,
    ShieldCheck,
    ShieldAlert,
    ShieldX
} from 'lucide-react';

import ReturnConfirmModal from './ReturnConfirmModal';
import AssetForm from './AssetForm';
import DeleteConfirmModal from './DeleteConfirmModal';
import ImageUpload from './ImageUpload';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getExpiryStatus } from '../utils/warrantyUtils';
import api from '../utils/api';


const DetailItem = ({ icon: Icon, label, value, color = "text-gray-500" }) => (
    <div className="flex items-start space-x-4 p-5 bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border hover:border-blue-200 dark:hover:border-indigo-500 hover:shadow-lg hover:shadow-blue-50/50 dark:hover:shadow-indigo-900/20 transition-all duration-300 group">
        <div className={`p-3 rounded-xl bg-gray-50 dark:bg-slate-800 group-hover:bg-blue-50 dark:group-hover:bg-indigo-600 transition-colors ${color}`}>
            <Icon className="w-5 h-5 group-hover:dark:text-white transition-colors" />
        </div>
        <div>
            <p className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">{label}</p>
            <p className="text-base font-bold text-gray-800 dark:text-white mt-1">{value || 'N/A'}</p>
        </div>
    </div>
);

const AssetDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { showToast } = useToast();
    const [asset, setAsset] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
    const [isReturning, setIsReturning] = useState(false);

    const handleReturnClick = () => {
        setIsReturnModalOpen(true);
    };

    const confirmReturn = async () => {
        setIsReturning(true);
        try {
            const response = await api.put(`/assets/${id}`, {
                status: 'Available',
                currentAssignedTo: null,
                assignedTo: null
            });

            const data = response.data;

            if (data.success) {
                setAsset({ ...asset, status: 'Available', currentAssignedTo: null });
                setIsReturnModalOpen(false);
                showToast('Asset returned successfully', 'success');
            } else {
                showToast(data.message || 'Error returning asset', 'error');
            }
        } catch (error) {
            console.error('Error returning asset:', error);
            showToast('Failed to return asset: ' + error.message, 'error');
        } finally {
            setIsReturning(false);
        }
    };

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchAssetDetails = async () => {
        try {
            const response = await api.get(`/assets/${id}`);
            const data = response.data;
            if (data.success) {
                console.log('Fetched asset details:', data.data); // Debug log
                console.log('Warranty Expiry Date:', data.data.warrantyExpiry); // Specific warranty log
                setAsset(data.data);
            } else {
                setError('Asset not found');
            }
        } catch (err) {
            console.error('Error fetching asset details:', err);
            setError('Failed to load asset details');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAssetDetails();
    }, [id]);

    const handleEditSubmit = async (formData) => {
        try {
            // Sanitize payload for backend validation requirements (as in AssetList.jsx)
            const payload = { ...formData };

            // 1. Remove internal metadata
            delete payload.__v;
            delete payload.createdAt;
            delete payload.updatedAt;
            delete payload.history;
            delete payload._id;

            // 2. Ensure assignment fields are just IDs (if populated)
            if (payload.currentAssignedTo && typeof payload.currentAssignedTo === 'object') {
                payload.currentAssignedTo = payload.currentAssignedTo._id;
            }
            if (payload.assignedTo && typeof payload.assignedTo === 'object') {
                payload.assignedTo = payload.assignedTo._id;
            }

            // 3. Status consistency: if NOT Assigned, clear assignedTo fields
            if (payload.status !== 'Assigned') {
                payload.currentAssignedTo = null;
                payload.assignedTo = null;
            }

            // 4. Ensure imageUrl is a string (safeguard)
            if (payload.imageUrl && typeof payload.imageUrl === 'object') {
                payload.imageUrl = payload.imageUrl.url || payload.imageUrl.imageUrl || '';
            }

            // 5. Ensure warrantyExpiry is included (if provided)
            if (payload.warrantyExpiry === '') {
                delete payload.warrantyExpiry; // Remove empty string, let backend handle null
            }

            console.log('Updating asset with payload:', payload); // Debug log

            const response = await api.put(`/assets/${id}`, payload);
            const data = response.data;

            if (data.success) {
                setIsEditModalOpen(false);
                showToast('Asset updated successfully', 'success');
                // Refresh with slight delay to ensure backend has processed
                setTimeout(() => {
                    fetchAssetDetails();
                }, 300);
            } else {
                showToast(data.message || 'Error updating asset', 'error');
            }
        } catch (error) {
            console.error('Error updating asset:', error);
            showToast('Failed to update asset', 'error');
        }
    };

    const confirmDelete = async () => {
        setIsDeleting(true);
        try {
            const response = await api.delete(`/assets/${id}`);
            const data = response.data;
            if (data.success) {
                showToast('Asset deleted successfully', 'success');
                navigate('/assets');
            } else {
                showToast(data.message || 'Error deleting asset', 'error');
            }
        } catch (error) {
            console.error('Error deleting asset:', error);
            showToast('Failed to delete asset', 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-dark-bg transition-colors">
                <Loader className="w-10 h-10 text-blue-500 dark:text-indigo-500 animate-spin" />
            </div>
        );
    }

    if (error || !asset) {
        return (
            <div className="flex flex-col h-screen items-center justify-center bg-gray-50 dark:bg-dark-bg p-4 text-center transition-colors">
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-full mb-4">
                    <AlertCircle className="w-12 h-12 text-red-500 dark:text-red-400" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{error || 'Asset Not Found'}</h1>
                <button
                    onClick={() => navigate('/assets')}
                    className="flex items-center space-x-2 bg-blue-600 dark:bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-blue-700 dark:hover:bg-indigo-700 transition-all"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Back to Inventory</span>
                </button>
            </div>
        );
    }

    const getStatusStyles = (status) => {
        switch (status) {
            case 'Available': return 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50';
            case 'Assigned': return 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/50';
            case 'Under Repair': return 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-orange-100 dark:border-orange-900/50';
            default: return 'bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-slate-400 border-gray-100 dark:border-slate-700';
        }
    };

    return (
        <div className="p-4 md:p-8 bg-gray-50/30 dark:bg-dark-bg min-h-screen transition-colors">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div className="flex items-center space-x-5">
                        <button
                            onClick={() => navigate('/assets')}
                            className="p-3 bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-2xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-all shadow-sm group"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-indigo-400 transition-colors" />
                        </button>
                        <div>
                            <div className="flex items-center space-x-2 text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1">
                                <Link to="/assets" className="hover:text-blue-600 dark:hover:text-indigo-400 transition-colors">Assets</Link>
                                <ChevronRight className="w-4 h-4" />
                                <span className="text-gray-500 dark:text-slate-400">Details</span>
                            </div>
                            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">{asset.name}</h1>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        {user?.role !== 'Auditor' && (
                            <>
                                <button
                                    onClick={() => setIsEditModalOpen(true)}
                                    className="flex items-center space-x-2 bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border text-gray-700 dark:text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-sm hover:bg-gray-50 dark:hover:bg-slate-800 transition-all hover:border-gray-200 dark:hover:border-slate-700"
                                >
                                    <Edit className="w-4 h-4" />
                                    <span>Edit Asset</span>
                                </button>
                                <button
                                    onClick={() => setIsDeleteModalOpen(true)}
                                    className="p-3 bg-white dark:bg-dark-card border border-red-50 dark:border-red-900/20 text-red-500 rounded-2xl hover:bg-red-50 dark:hover:bg-red-900/10 transition-all shadow-sm group"
                                    title="Delete Asset"
                                >
                                    <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                </button>
                                {asset.status === 'Available' && (
                                    <button
                                        onClick={() => navigate(`/assets/${asset._id}/assign`)}
                                        className="flex items-center space-x-2 bg-blue-600 dark:bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-blue-100 dark:shadow-none hover:bg-blue-700 dark:hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                    >
                                        <UserPlus className="w-5 h-5" />
                                        <span>Assign Asset</span>
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: General Info */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white dark:bg-dark-card rounded-3xl shadow-sm border border-gray-100 dark:border-dark-border overflow-hidden">
                            <div className="p-6 border-b border-gray-100 dark:border-dark-border bg-gray-50/50 dark:bg-slate-800/50 flex items-center justify-between">
                                <h2 className="text-lg font-bold text-gray-800 dark:text-white">Asset Image</h2>
                            </div>
                            <div className="p-8">
                                {user?.role !== 'Auditor' ? (
                                    <div className="dark:text-white">
                                        <ImageUpload
                                            label="Upload Asset Image"
                                            uploadUrl={`/assets/${id}/image`}
                                            fieldName="image"
                                            initialImage={asset.imageUrl}
                                            onUploadSuccess={(imageUrl) => {
                                                setAsset(prev => ({ ...prev, imageUrl: imageUrl }));
                                                fetchAssetDetails();
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <div className="flex justify-center p-4">
                                        <img
                                            src={asset.imageUrl || 'https://via.placeholder.com/300?text=No+Image'}
                                            alt={asset.name}
                                            className="max-h-64 rounded-2xl shadow-sm border dark:border-dark-border"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-white dark:bg-dark-card rounded-3xl shadow-sm border border-gray-100 dark:border-dark-border overflow-hidden">
                            <div className="p-6 border-b border-gray-100 dark:border-dark-border bg-gray-50/50 dark:bg-slate-800/50 flex items-center justify-between">
                                <h2 className="text-lg font-bold text-gray-800 dark:text-white">General Information</h2>
                                <span className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest border ${getStatusStyles(asset.status)}`}>
                                    {asset.status}
                                </span>
                            </div>
                            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <DetailItem icon={Tag} label="Asset Tag" value={asset.assetTag} color="text-blue-600 dark:text-blue-400" />
                                <DetailItem icon={Box} label="Category" value={asset.category} color="text-purple-600 dark:text-purple-400" />
                                <DetailItem icon={Hash} label="Serial Number" value={asset.serialNumber} color="text-indigo-600 dark:text-indigo-400" />
                                <DetailItem icon={Info} label="Model" value={asset.model} color="text-pink-600 dark:text-pink-400" />
                                <DetailItem icon={Calendar} label="Purchase Date" value={new Date(asset.purchaseDate).toLocaleDateString()} color="text-emerald-600 dark:text-emerald-400" />
                                <DetailItem icon={MapPin} label="Location" value={asset.location} color="text-amber-600 dark:text-amber-400" />
                            </div>
                        </div>

                        {/* Warranty Information Card */}
                        <div className="bg-white dark:bg-dark-card rounded-3xl shadow-sm border border-gray-100 dark:border-dark-border overflow-hidden">
                            <div className="p-6 border-b border-gray-100 dark:border-dark-border bg-gray-50/50 dark:bg-slate-800/50">
                                <h2 className="text-lg font-bold text-gray-800 dark:text-white">Warranty Information</h2>
                            </div>
                            <div className="p-8">
                                {(() => {
                                    const warrantyStatus = getExpiryStatus(asset.warrantyExpiry);
                                    const Icon = warrantyStatus.icon;

                                    return (
                                        <div className={`rounded-2xl border-2 p-6 transition-all duration-300 ${warrantyStatus.status === 'active'
                                            ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/50'
                                            : warrantyStatus.status === 'expiring'
                                                ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800/50'
                                                : warrantyStatus.status === 'expired'
                                                    ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800/50'
                                                    : 'bg-gray-50 dark:bg-slate-800/50 border-gray-200 dark:border-slate-700/50'
                                            }`}>
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-3 rounded-xl ${warrantyStatus.status === 'active'
                                                        ? 'bg-emerald-100 dark:bg-emerald-900/30'
                                                        : warrantyStatus.status === 'expiring'
                                                            ? 'bg-amber-100 dark:bg-amber-900/30'
                                                            : warrantyStatus.status === 'expired'
                                                                ? 'bg-red-100 dark:bg-red-900/30'
                                                                : 'bg-gray-100 dark:bg-slate-800'
                                                        }`}>
                                                        <Icon className={`w-6 h-6 ${warrantyStatus.status === 'active'
                                                            ? 'text-emerald-600 dark:text-emerald-400'
                                                            : warrantyStatus.status === 'expiring'
                                                                ? 'text-amber-600 dark:text-amber-400'
                                                                : warrantyStatus.status === 'expired'
                                                                    ? 'text-red-600 dark:text-red-400'
                                                                    : 'text-gray-500 dark:text-slate-500'
                                                            }`} />
                                                    </div>
                                                    <div>
                                                        <h3 className={`text-lg font-bold ${warrantyStatus.status === 'active'
                                                            ? 'text-emerald-900 dark:text-emerald-300'
                                                            : warrantyStatus.status === 'expiring'
                                                                ? 'text-amber-900 dark:text-amber-300'
                                                                : warrantyStatus.status === 'expired'
                                                                    ? 'text-red-900 dark:text-red-300'
                                                                    : 'text-gray-700 dark:text-slate-300'
                                                            }`}>
                                                            {warrantyStatus.label}
                                                        </h3>
                                                        <p className={`text-sm font-medium ${warrantyStatus.status === 'active'
                                                            ? 'text-emerald-700 dark:text-emerald-500'
                                                            : warrantyStatus.status === 'expiring'
                                                                ? 'text-amber-700 dark:text-amber-500'
                                                                : warrantyStatus.status === 'expired'
                                                                    ? 'text-red-700 dark:text-red-500'
                                                                    : 'text-gray-500 dark:text-slate-500'
                                                            }`}>
                                                            {asset.warrantyExpiry
                                                                ? `Expires: ${new Date(asset.warrantyExpiry).toLocaleDateString()}`
                                                                : 'No warranty information available'}
                                                        </p>
                                                    </div>
                                                </div>
                                                {warrantyStatus.daysRemaining !== null && (
                                                    <div className={`px-4 py-2 rounded-full font-bold text-sm ${warrantyStatus.status === 'active'
                                                        ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                                                        : warrantyStatus.status === 'expiring'
                                                            ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300'
                                                            : 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'
                                                        }`}>
                                                        {warrantyStatus.daysRemaining > 0
                                                            ? `${warrantyStatus.daysRemaining} days left`
                                                            : `Expired ${Math.abs(warrantyStatus.daysRemaining)} days ago`}
                                                    </div>
                                                )}
                                            </div>
                                            {asset.purchaseDate && asset.warrantyExpiry && (
                                                <div className="mt-4 pt-4 border-t border-current border-opacity-20">
                                                    <div className="flex items-center gap-2 text-sm font-medium opacity-75 dark:text-slate-400">
                                                        <Calendar className="w-4 h-4" />
                                                        <span>Purchase Date: {new Date(asset.purchaseDate).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>

                        {/* Assignment Card */}
                        <div className="bg-white dark:bg-dark-card rounded-3xl shadow-sm border border-gray-100 dark:border-dark-border overflow-hidden">
                            <div className="p-6 border-b border-gray-100 dark:border-dark-border bg-gray-50/50 dark:bg-slate-800/50">
                                <h2 className="text-lg font-bold text-gray-800 dark:text-white">Current Assignment</h2>
                            </div>
                            <div className="p-8">
                                {asset.currentAssignedTo ? (
                                    <div className="flex items-center gap-8">
                                        <div className="w-24 h-24 rounded-3xl bg-blue-600 dark:bg-indigo-600 flex items-center justify-center text-white text-3xl font-bold shadow-xl shadow-blue-100 dark:shadow-none">
                                            {asset.currentAssignedTo.firstName.charAt(0)}{asset.currentAssignedTo.lastName.charAt(0)}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{asset.currentAssignedTo.fullName}</h3>
                                            <p className="text-gray-500 dark:text-slate-400 font-medium">{asset.currentAssignedTo.email}</p>
                                            <div className="mt-4 flex items-center gap-6">
                                                <div className="flex items-center text-xs text-gray-400 dark:text-slate-500 font-bold uppercase tracking-widest">
                                                    <Clock className="w-4 h-4 mr-2" />
                                                    Since: {new Date(asset.updatedAt).toLocaleDateString()}
                                                </div>
                                                <div className="flex items-center text-xs text-gray-400 dark:text-slate-500 font-bold uppercase tracking-widest">
                                                    <Tag className="w-4 h-4 mr-2" />
                                                    Condition: Excellent
                                                </div>
                                            </div>
                                        </div>
                                        {user?.role !== 'Auditor' && (
                                            <button
                                                onClick={handleReturnClick}
                                                className="bg-white dark:bg-dark-card border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-red-50 dark:hover:bg-red-900/10 transition-all active:scale-95 flex items-center gap-2"
                                            >
                                                <RotateCcw className="w-4 h-4" />
                                                Unassign
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-10">
                                        <div className="w-16 h-16 bg-gray-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <User className="w-8 h-8 text-gray-300 dark:text-slate-600" />
                                        </div>
                                        <p className="text-gray-800 dark:text-white font-bold text-lg">Unassigned</p>
                                        <p className="text-gray-400 dark:text-slate-500 text-sm mt-1">This asset is ready to be assigned.</p>
                                        {user?.role !== 'Auditor' && (
                                            <button
                                                onClick={() => navigate(`/assets/${asset._id}/assign`)}
                                                className="mt-6 bg-blue-600 dark:bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg shadow-blue-100 dark:shadow-none hover:bg-blue-700 dark:hover:bg-indigo-700 transition-all active:scale-95"
                                            >
                                                Assign Now
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right: History & Actions */}
                    <div className="space-y-8">
                        <div className="bg-white dark:bg-dark-card rounded-3xl shadow-sm border border-gray-100 dark:border-dark-border overflow-hidden">
                            <div className="p-6 border-b border-gray-100 dark:border-dark-border bg-gray-50/50 dark:bg-slate-800/50">
                                <h2 className="text-lg font-bold text-gray-800 dark:text-white">History</h2>
                            </div>
                            <div className="p-6 space-y-8 relative">
                                <div className="absolute left-9 top-10 bottom-10 w-px bg-gray-100 dark:bg-slate-800" />
                                <div className="flex gap-4 relative">
                                    <div className="w-6 h-6 rounded-full bg-blue-500 dark:bg-indigo-500 border-4 border-white dark:border-dark-card shadow-sm z-10" />
                                    <div>
                                        <p className="text-sm font-bold text-gray-800 dark:text-white">Status Changed</p>
                                        <p className="text-xs text-gray-400 dark:text-slate-500 mt-1 uppercase tracking-widest font-bold">{new Date(asset.updatedAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 relative">
                                    <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-slate-700 border-4 border-white dark:border-dark-card shadow-sm z-10" />
                                    <div>
                                        <p className="text-sm font-bold text-gray-800 dark:text-white">Asset Registered</p>
                                        <p className="text-xs text-gray-400 dark:text-slate-500 mt-1 uppercase tracking-widest font-bold">{new Date(asset.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-linear-to-br from-indigo-600 to-blue-700 dark:from-indigo-700 dark:to-indigo-900 rounded-3xl p-8 text-white shadow-xl shadow-blue-100 dark:shadow-none">
                            <Wrench className="w-10 h-10 mb-6 opacity-40 text-white" />
                            <h3 className="text-xl font-bold mb-2">Maintenance Required?</h3>
                            <p className="text-blue-100 dark:text-indigo-200 text-sm mb-8 leading-relaxed">If this asset needs repair or scheduled maintenance, you can mark it as 'Under Repair'.</p>
                            <button className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white py-3 rounded-2xl text-sm font-bold transition-all border border-white/20">
                                Schedule Maintenance
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <ReturnConfirmModal
                isOpen={isReturnModalOpen}
                onClose={() => setIsReturnModalOpen(false)}
                onConfirm={confirmReturn}
                assetName={asset?.name}
                assetTag={asset?.assetTag}
                isReturning={isReturning}
            />

            <AssetForm
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSubmit={handleEditSubmit}
                initialData={asset}
            />

            <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Asset?"
                itemName={asset?.name}
                itemTag={asset?.assetTag}
                isDeleting={isDeleting}
            />
        </div>
    );
};

export default AssetDetails;
