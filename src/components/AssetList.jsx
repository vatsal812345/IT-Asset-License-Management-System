import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { Search, Plus, Filter, Edit, Trash2, Loader, MoreHorizontal, Eye, UserPlus, RotateCcw, Box } from 'lucide-react';
import AssetForm from './AssetForm';
import ReturnConfirmModal from './ReturnConfirmModal';
import DeleteConfirmModal from './DeleteConfirmModal';



const AssetList = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [assets, setAssets] = useState([]);
    const [filteredAssets, setFilteredAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const location = useLocation();
    const [statusFilter, setStatusFilter] = useState('All');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingAsset, setEditingAsset] = useState(null);
    const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
    const [selectedReturnAsset, setSelectedReturnAsset] = useState(null);
    const [isReturning, setIsReturning] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedDeleteAsset, setSelectedDeleteAsset] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchAssets = async () => {
        setLoading(true);
        try {
            const response = await fetch('https://itam-backend.onrender.com/api/assets');
            const data = await response.json();
            if (data.success) {
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

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(asset =>
                asset.name.toLowerCase().includes(query) ||
                asset.assetTag.toLowerCase().includes(query) ||
                (asset.serialNumber && asset.serialNumber.toLowerCase().includes(query))
            );
        }

        setFilteredAssets(result);
    }, [assets, searchQuery, statusFilter]);

    const handleCreateUpdate = async (formData) => {
        try {
            const url = editingAsset
                ? `https://itam-backend.onrender.com/api/assets/${editingAsset._id}`
                : 'https://itam-backend.onrender.com/api/assets';
            
            const method = editingAsset ? 'PUT' : 'POST';

            // Sanitize payload for backend validation requirements
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

            // Store imageFile if it exists
            const imageFile = payload.imageFile;
            delete payload.imageFile;

            // 4. Ensure imageUrl is a string (safeguard against weird API responses/state updates)
            if (payload.imageUrl && typeof payload.imageUrl === 'object') {
                payload.imageUrl = payload.imageUrl.url || payload.imageUrl.imageUrl || '';
            }

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (data.success) {
                // Upload image if selected during creation
                if (!editingAsset && imageFile) {
                    const newAssetId = data.data._id;
                    const uploadUrl = `https://itam-backend.onrender.com/api/assets/${newAssetId}/image`;
                    const imgFormData = new FormData();
                    imgFormData.append('image', imageFile);

                    try {
                        await fetch(uploadUrl, {
                            method: 'POST',
                            body: imgFormData,
                        });
                    } catch (uploadError) {
                        console.error('Error uploading image for new asset:', uploadError);
                        showToast('Asset created but image upload failed', 'warning');
                    }
                }

                fetchAssets(); // Refresh list
                setIsFormOpen(false);
                setEditingAsset(null);
                showToast(
                    editingAsset ? 'Asset updated successfully' : 'New asset added successfully',
                    'success'
                );
            } else {
                showToast(data.message || 'Operation failed', 'error');
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
            const response = await fetch(`https://itam-backend.onrender.com/api/assets/${selectedDeleteAsset._id}`, {
                method: 'DELETE',
            });
            const data = await response.json();
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
            const response = await fetch(`https://itam-backend.onrender.com/api/assets/${id}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify({ 
                    status: 'Available',
                    currentAssignedTo: null,
                    assignedTo: null
                })
            });

            const text = await response.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch (e) {
                throw new Error('Invalid server response');
            }

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
            case 'Available': return 'bg-green-100 text-green-700 border border-green-200';
            case 'Assigned': return 'bg-blue-100 text-blue-700 border border-blue-200';
            case 'Under Repair': return 'bg-orange-100 text-orange-700 border border-orange-200';
            case 'Retired': return 'bg-red-100 text-red-700 border border-red-200';
            default: return 'bg-gray-100 text-gray-700 border border-gray-200';
        }
    };

    return (
        <div className="p-4 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Assets Inventory</h1>
                    <p className="text-gray-500 mt-1">Manage all your hardware and software assets.</p>
                </div>
                <button
                    onClick={() => {
                        setEditingAsset(null);
                        setIsFormOpen(true);
                    }}
                    className="flex items-center space-x-2 bg-linear-to-r from-blue-600 to-blue-500 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-blue-200 hover:shadow-blue-300 hover:scale-105 transition-all duration-200 active:scale-95 w-full md:w-auto justify-center"
                >
                    <Plus className="w-5 h-5" />
                    <span>Add New Asset</span>
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search by tag, name, or serial number..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 focus:shadow-md hover:shadow-sm hover:border-blue-300"
                    />
                </div>
                <div className="flex items-center space-x-3 w-full md:w-auto">
                    <div className="flex items-center space-x-2 text-gray-500">
                        <Filter className="w-5 h-5" />
                        <span className="font-medium">Filter:</span>
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white min-w-[150px] cursor-pointer transition-all duration-200 focus:shadow-md hover:shadow-sm hover:border-blue-300"
                    >
                        <option value="All">All Status</option>
                        <option value="Available">Available</option>
                        <option value="Assigned">Assigned</option>
                        <option value="Under Repair">Under Repair</option>
                        <option value="Retired">Retired</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                        <div className="flex items-center justify-center p-12">
                        <Loader className="w-8 h-8 text-blue-500 animate-spin" />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Asset Tag</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Asset Name</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Assigned To</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredAssets.length > 0 ? (
                                    filteredAssets.map((asset, index) => (
                                        <tr 
                                            key={asset._id} 
                                            className="hover:bg-blue-50/50 transition-all duration-200 group hover:shadow-md cursor-pointer animate-slide-up"
                                            style={{ animationDelay: `${index * 0.05}s` }}
                                            onClick={() => navigate(`/assets/${asset._id}`)}
                                        >
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-medium text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded-md border border-gray-200 group-hover:bg-white group-hover:border-blue-200 transition-colors">{asset.assetTag}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden border border-gray-100 shrink-0">
                                                        {asset.imageUrl ? (
                                                            <img src={asset.imageUrl} alt={asset.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                                <Box className="w-5 h-5" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-semibold text-gray-900">{asset.name}</span>
                                                        <span className="text-xs text-gray-500">{asset.model}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-gray-700 bg-gray-100 px-2 py-1 rounded-full">{asset.category}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(asset.status)}`}>
                                                    {asset.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {asset.currentAssignedTo ? (
                                                    <div className="flex items-center space-x-2">
                                                        <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                                                            {asset.currentAssignedTo.firstName.charAt(0)}{asset.currentAssignedTo.lastName.charAt(0)}
                                                        </div>
                                                        <span className="text-sm text-gray-700 font-medium">{asset.currentAssignedTo.fullName}</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center space-x-2">
                                                        <span className="text-sm text-gray-400 italic">Unassigned</span>
                                                        {asset.status === 'Available' && (
                                                            <button 
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    navigate(`/assets/${asset._id}/assign`);
                                                                }}
                                                                className="p-1 text-blue-500 hover:bg-blue-100 rounded-md transition-colors"
                                                                title="Assign Now"
                                                            >
                                                                <UserPlus className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end space-x-2">
                                                    {asset.status === 'Assigned' && (
                                                        <button
                                                            onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleReturnClick(asset);
                                                                }}
                                                            className="p-2 text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100 hover:shadow-md transition-all duration-200 transform hover:scale-110"
                                                            title="Return Asset"
                                                        >
                                                            <RotateCcw className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate(`/assets/${asset._id}`);
                                                        }}
                                                        className="p-2 text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 hover:shadow-md transition-all duration-200 transform hover:scale-110"
                                                        title="View Details"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            openEditForm(asset);
                                                        }}
                                                        className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 hover:shadow-md transition-all duration-200 transform hover:scale-110"
                                                        title="Edit Asset"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteClick(asset);
                                                        }}
                                                        className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 hover:shadow-md transition-all duration-200 transform hover:scale-110"
                                                        title="Delete Asset"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center justify-center text-gray-500">
                                                <Search className="w-8 h-8 mb-2 text-gray-300" />
                                                <p>No assets found matching your criteria.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

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
                assetName={selectedDeleteAsset?.name}
                assetTag={selectedDeleteAsset?.assetTag}
                isDeleting={isDeleting}
            />
        </div>
    );
};

export default AssetList;
