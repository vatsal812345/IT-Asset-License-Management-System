import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { Search, Plus, Filter, Edit, Trash2, Loader, MoreHorizontal, Eye, UserPlus, RotateCcw, Box, ShieldCheck, ShieldAlert, ShieldX, Clock, Download } from 'lucide-react';
import AssetForm from './AssetForm';
import ReturnConfirmModal from './ReturnConfirmModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import Pagination from './Pagination';
import { getExpiryStatus } from '../utils/warrantyUtils';
import { exportToCSV, formatDateForCSV } from '../utils/csvExport';
import getDisplayImageUrl from '../utils/imageUtils';



const AssetList = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
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
    const itemsPerPage = 10;

    const fetchAssets = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/assets');
            const data = await response.json();
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
            const url = editingAsset
                ? `http://localhost:5000/api/assets/${editingAsset._id}`
                : 'http://localhost:5000/api/assets';

            const method = editingAsset ? 'PUT' : 'POST';

            // Create FormData for multipart/form-data request
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

            const response = await fetch(url, {
                method,
                // Brownie point: do NOT set Content-Type header when sending FormData, 
                // the browser will set it automatically with the correct boundary
                body: data,
            });

            const responseData = await response.json();

            if (responseData.success) {
                // Close form first
                setIsFormOpen(false);
                setEditingAsset(null);

                // Show success message
                showToast(
                    editingAsset ? 'Asset updated successfully' : 'New asset added successfully',
                    'success'
                );

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
            const response = await fetch(`http://localhost:5000/api/assets/${selectedDeleteAsset._id}`, {
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
            const response = await fetch(`http://localhost:5000/api/assets/${id}`, {
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
        <div className="p-4 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Assets Inventory</h1>
                    <p className="text-gray-500 mt-1">Manage all your hardware and software assets.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <button
                        onClick={handleExportCSV}
                        disabled={isExporting || filteredAssets.length === 0}
                        className="flex items-center justify-center space-x-2 bg-white border-2 border-emerald-500 text-emerald-600 px-5 py-2.5 rounded-xl font-medium shadow-sm hover:bg-emerald-50 hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isExporting ? (
                            <Loader className="w-5 h-5 animate-spin" />
                        ) : (
                            <Download className="w-5 h-5" />
                        )}
                        <span>{isExporting ? 'Exporting...' : 'Export CSV'}</span>
                    </button>
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
                    <select
                        value={warrantyFilter}
                        onChange={(e) => setWarrantyFilter(e.target.value)}
                        className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-white min-w-[170px] cursor-pointer transition-all duration-200 focus:shadow-md hover:shadow-sm hover:border-emerald-300"
                    >
                        <option value="All">All Warranty</option>
                        <option value="Active">Active</option>
                        <option value="Expiring Soon">Expiring Soon</option>
                        <option value="Expired">Expired</option>
                        <option value="No Warranty">No Warranty</option>
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
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Warranty</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Assigned To</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {currentAssets.length > 0 ? (
                                    currentAssets.map((asset, index) => (
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
                                                            <img src={getDisplayImageUrl(asset.imageUrl)} alt={asset.name} className="w-full h-full object-cover" />
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
                                                {(() => {
                                                    const warrantyStatus = getExpiryStatus(asset.warrantyExpiry);
                                                    const Icon = warrantyStatus.icon;
                                                    return (
                                                        <span
                                                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 hover:scale-105 ${warrantyStatus.status === 'active'
                                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                                                    : warrantyStatus.status === 'expiring'
                                                                        ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                                                                        : warrantyStatus.status === 'expired'
                                                                            ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                                                                            : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                                                                }`}
                                                        >
                                                            <Icon className="w-3.5 h-3.5" />
                                                            {warrantyStatus.label}
                                                        </span>
                                                    );
                                                })()}
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

                {/* Pagination */}
                {!loading && filteredAssets.length > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        itemsPerPage={itemsPerPage}
                        totalItems={filteredAssets.length}
                        onPageChange={setCurrentPage}
                    />
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
                title="Delete Asset?"
                itemName={selectedDeleteAsset?.name}
                itemTag={selectedDeleteAsset?.assetTag}
                isDeleting={isDeleting}
            />
        </div>
    );
};

export default AssetList;
