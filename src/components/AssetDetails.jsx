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
    <div className="flex items-start space-x-4 p-5 bg-white rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-50/50 transition-all duration-300 group">
        <div className={`p-3 rounded-xl bg-gray-50 group-hover:bg-blue-50 transition-colors ${color}`}>
            <Icon className="w-5 h-5" />
        </div>
        <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</p>
            <p className="text-base font-bold text-gray-800 mt-1">{value || 'N/A'}</p>
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
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <Loader className="w-10 h-10 text-blue-500 animate-spin" />
            </div>
        );
    }

    if (error || !asset) {
        return (
            <div className="flex flex-col h-screen items-center justify-center bg-gray-50 p-4 text-center">
                <div className="bg-red-50 p-4 rounded-full mb-4">
                    <AlertCircle className="w-12 h-12 text-red-500" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{error || 'Asset Not Found'}</h1>
                <button
                    onClick={() => navigate('/assets')}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Back to Inventory</span>
                </button>
            </div>
        );
    }

    const getStatusStyles = (status) => {
        switch (status) {
            case 'Available': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'Assigned': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'Under Repair': return 'bg-orange-50 text-orange-600 border-orange-100';
            default: return 'bg-gray-50 text-gray-600 border-gray-100';
        }
    };

    return (
        <div className="p-4 md:p-8 bg-gray-50/30 min-h-screen">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div className="flex items-center space-x-5">
                        <button
                            onClick={() => navigate('/assets')}
                            className="p-3 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 transition-all shadow-sm group"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                        </button>
                        <div>
                            <div className="flex items-center space-x-2 text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                                <Link to="/assets" className="hover:text-blue-600 transition-colors">Assets</Link>
                                <ChevronRight className="w-4 h-4" />
                                <span className="text-gray-500">Details</span>
                            </div>
                            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{asset.name}</h1>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        {user?.role !== 'Auditor' && (
                            <>
                                <button
                                    onClick={() => setIsEditModalOpen(true)}
                                    className="flex items-center space-x-2 bg-white border border-gray-100 text-gray-700 px-6 py-3 rounded-2xl font-bold text-sm shadow-sm hover:bg-gray-50 transition-all hover:border-gray-200"
                                >
                                    <Edit className="w-4 h-4" />
                                    <span>Edit Asset</span>
                                </button>
                                <button
                                    onClick={() => setIsDeleteModalOpen(true)}
                                    className="p-3 bg-white border border-red-50 text-red-500 rounded-2xl hover:bg-red-50 transition-all shadow-sm group"
                                    title="Delete Asset"
                                >
                                    <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                </button>
                                {asset.status === 'Available' && (
                                    <button
                                        onClick={() => navigate(`/assets/${asset._id}/assign`)}
                                        className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-blue-100 hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] transition-all"
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
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                                <h2 className="text-lg font-bold text-gray-800">Asset Image</h2>
                            </div>
                            <div className="p-8">
                                {user?.role !== 'Auditor' ? (
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
                                ) : (
                                    <div className="flex justify-center p-4">
                                        <img
                                            src={asset.imageUrl || 'https://via.placeholder.com/300?text=No+Image'}
                                            alt={asset.name}
                                            className="max-h-64 rounded-2xl shadow-sm"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                                <h2 className="text-lg font-bold text-gray-800">General Information</h2>
                                <span className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest border ${getStatusStyles(asset.status)}`}>
                                    {asset.status}
                                </span>
                            </div>
                            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <DetailItem icon={Tag} label="Asset Tag" value={asset.assetTag} color="text-blue-600" />
                                <DetailItem icon={Box} label="Category" value={asset.category} color="text-purple-600" />
                                <DetailItem icon={Hash} label="Serial Number" value={asset.serialNumber} color="text-indigo-600" />
                                <DetailItem icon={Info} label="Model" value={asset.model} color="text-pink-600" />
                                <DetailItem icon={Calendar} label="Purchase Date" value={new Date(asset.purchaseDate).toLocaleDateString()} color="text-emerald-600" />
                                <DetailItem icon={MapPin} label="Location" value={asset.location} color="text-amber-600" />
                            </div>
                        </div>

                        {/* Warranty Information Card */}
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                                <h2 className="text-lg font-bold text-gray-800">Warranty Information</h2>
                            </div>
                            <div className="p-8">
                                {(() => {
                                    const warrantyStatus = getExpiryStatus(asset.warrantyExpiry);
                                    const Icon = warrantyStatus.icon;

                                    return (
                                        <div className={`rounded-2xl border-2 p-6 transition-all duration-300 ${warrantyStatus.status === 'active'
                                            ? 'bg-emerald-50 border-emerald-200'
                                            : warrantyStatus.status === 'expiring'
                                                ? 'bg-amber-50 border-amber-200'
                                                : warrantyStatus.status === 'expired'
                                                    ? 'bg-red-50 border-red-200'
                                                    : 'bg-gray-50 border-gray-200'
                                            }`}>
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-3 rounded-xl ${warrantyStatus.status === 'active'
                                                        ? 'bg-emerald-100'
                                                        : warrantyStatus.status === 'expiring'
                                                            ? 'bg-amber-100'
                                                            : warrantyStatus.status === 'expired'
                                                                ? 'bg-red-100'
                                                                : 'bg-gray-100'
                                                        }`}>
                                                        <Icon className={`w-6 h-6 ${warrantyStatus.status === 'active'
                                                            ? 'text-emerald-600'
                                                            : warrantyStatus.status === 'expiring'
                                                                ? 'text-amber-600'
                                                                : warrantyStatus.status === 'expired'
                                                                    ? 'text-red-600'
                                                                    : 'text-gray-500'
                                                            }`} />
                                                    </div>
                                                    <div>
                                                        <h3 className={`text-lg font-bold ${warrantyStatus.status === 'active'
                                                            ? 'text-emerald-900'
                                                            : warrantyStatus.status === 'expiring'
                                                                ? 'text-amber-900'
                                                                : warrantyStatus.status === 'expired'
                                                                    ? 'text-red-900'
                                                                    : 'text-gray-700'
                                                            }`}>
                                                            {warrantyStatus.label}
                                                        </h3>
                                                        <p className={`text-sm font-medium ${warrantyStatus.status === 'active'
                                                            ? 'text-emerald-700'
                                                            : warrantyStatus.status === 'expiring'
                                                                ? 'text-amber-700'
                                                                : warrantyStatus.status === 'expired'
                                                                    ? 'text-red-700'
                                                                    : 'text-gray-500'
                                                            }`}>
                                                            {asset.warrantyExpiry
                                                                ? `Expires: ${new Date(asset.warrantyExpiry).toLocaleDateString()}`
                                                                : 'No warranty information available'}
                                                        </p>
                                                    </div>
                                                </div>
                                                {warrantyStatus.daysRemaining !== null && (
                                                    <div className={`px-4 py-2 rounded-full font-bold text-sm ${warrantyStatus.status === 'active'
                                                        ? 'bg-emerald-100 text-emerald-700'
                                                        : warrantyStatus.status === 'expiring'
                                                            ? 'bg-amber-100 text-amber-700'
                                                            : 'bg-red-100 text-red-700'
                                                        }`}>
                                                        {warrantyStatus.daysRemaining > 0
                                                            ? `${warrantyStatus.daysRemaining} days left`
                                                            : `Expired ${Math.abs(warrantyStatus.daysRemaining)} days ago`}
                                                    </div>
                                                )}
                                            </div>
                                            {asset.purchaseDate && asset.warrantyExpiry && (
                                                <div className="mt-4 pt-4 border-t border-current border-opacity-20">
                                                    <div className="flex items-center gap-2 text-sm font-medium opacity-75">
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
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                                <h2 className="text-lg font-bold text-gray-800">Current Assignment</h2>
                            </div>
                            <div className="p-8">
                                {asset.currentAssignedTo ? (
                                    <div className="flex items-center gap-8">
                                        <div className="w-24 h-24 rounded-3xl bg-blue-600 flex items-center justify-center text-white text-3xl font-bold shadow-xl shadow-blue-100">
                                            {asset.currentAssignedTo.firstName.charAt(0)}{asset.currentAssignedTo.lastName.charAt(0)}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-2xl font-bold text-gray-900">{asset.currentAssignedTo.fullName}</h3>
                                            <p className="text-gray-500 font-medium">{asset.currentAssignedTo.email}</p>
                                            <div className="mt-4 flex items-center gap-6">
                                                <div className="flex items-center text-xs text-gray-400 font-bold uppercase tracking-widest">
                                                    <Clock className="w-4 h-4 mr-2" />
                                                    Since: {new Date(asset.updatedAt).toLocaleDateString()}
                                                </div>
                                                <div className="flex items-center text-xs text-gray-400 font-bold uppercase tracking-widest">
                                                    <Tag className="w-4 h-4 mr-2" />
                                                    Condition: Excellent
                                                </div>
                                            </div>
                                        </div>
                                        {user?.role !== 'Auditor' && (
                                            <button
                                                onClick={handleReturnClick}
                                                className="bg-white border border-red-100 text-red-600 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-red-50 transition-all active:scale-95 flex items-center gap-2"
                                            >
                                                <RotateCcw className="w-4 h-4" />
                                                Unassign
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-10">
                                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <User className="w-8 h-8 text-gray-300" />
                                        </div>
                                        <p className="text-gray-800 font-bold text-lg">Unassigned</p>
                                        <p className="text-gray-400 text-sm mt-1">This asset is ready to be assigned.</p>
                                        {user?.role !== 'Auditor' && (
                                            <button
                                                onClick={() => navigate(`/assets/${asset._id}/assign`)}
                                                className="mt-6 bg-blue-600 text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
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
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                                <h2 className="text-lg font-bold text-gray-800">History</h2>
                            </div>
                            <div className="p-6 space-y-8 relative">
                                <div className="absolute left-9 top-10 bottom-10 w-px bg-gray-100" />
                                <div className="flex gap-4 relative">
                                    <div className="w-6 h-6 rounded-full bg-blue-500 border-4 border-white shadow-sm z-10" />
                                    <div>
                                        <p className="text-sm font-bold text-gray-800">Status Changed</p>
                                        <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-bold">{new Date(asset.updatedAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 relative">
                                    <div className="w-6 h-6 rounded-full bg-gray-200 border-4 border-white shadow-sm z-10" />
                                    <div>
                                        <p className="text-sm font-bold text-gray-800">Asset Registered</p>
                                        <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-bold">{new Date(asset.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-linear-to-br from-indigo-600 to-blue-700 rounded-3xl p-8 text-white shadow-xl shadow-blue-100">
                            <Wrench className="w-10 h-10 mb-6 opacity-40 text-white" />
                            <h3 className="text-xl font-bold mb-2">Maintenance Required?</h3>
                            <p className="text-blue-100 text-sm mb-8 leading-relaxed">If this asset needs repair or scheduled maintenance, you can mark it as 'Under Repair'.</p>
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
