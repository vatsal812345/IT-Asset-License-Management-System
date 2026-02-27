import React, { useState, useEffect } from 'react';
import { Search, Loader, RefreshCcw, RotateCcw, AlertCircle, User } from 'lucide-react';

import ReturnConfirmModal from './ReturnConfirmModal';

const ReturnAsset = () => {
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [returningId, setReturningId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState(null);

    const fetchAssignedAssets = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/assets');
            const data = await response.json();
            if (data.success) {
                // Filter only assigned assets
                const assigned = data.data.filter(asset => asset.status === 'Assigned');
                setAssets(assigned);
            }
        } catch (error) {
            console.error('Error fetching assigned assets:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAssignedAssets();
    }, []);

    const handleReturnClick = (asset) => {
        setSelectedAsset(asset);
        setIsModalOpen(true);
    };

    const confirmReturn = async () => {
        if (!selectedAsset) return;
        
        const assetId = selectedAsset._id;
        setReturningId(assetId);
        try {
            // First, try the general asset update since we know it works for editing
            const response = await fetch(`http://localhost:5000/api/assets/${assetId}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify({ 
                    status: 'Available',
                    currentAssignedTo: null,
                    assignedTo: null // For backend compatibility
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
                setAssets(assets.filter(a => a._id !== assetId));
                setIsModalOpen(false);
                setSelectedAsset(null);
                // alert('Asset returned successfully!');
            } else {
                alert('Error: ' + (data.message || 'Unknown error occurred'));
            }
        } catch (error) {
            console.error('Error returning asset:', error);
            alert('Failed to return asset: ' + error.message);
        } finally {
            setReturningId(null);
        }
    };

    const filteredAssets = assets.filter(asset => 
        asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.assetTag.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (asset.currentAssignedTo?.fullName.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="p-4 md:p-8 bg-gray-50/30 min-h-screen">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Return Assets</h1>
                        <p className="text-gray-500 mt-1">Easily return assigned assets to the available inventory.</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by asset or employee..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                    </div>
                    <button 
                        onClick={fetchAssignedAssets}
                        className="flex items-center justify-center space-x-2 bg-white border border-gray-100 text-gray-600 px-6 py-3 rounded-xl font-bold text-sm shadow-sm hover:bg-gray-50 transition-all"
                    >
                        <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        <span>Refresh List</span>
                    </button>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="flex items-center justify-center p-20">
                        <Loader className="w-10 h-10 text-blue-500 animate-spin" />
                    </div>
                ) : filteredAssets.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredAssets.map((asset) => (
                            <div key={asset._id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="p-3 bg-blue-50 rounded-2xl group-hover:bg-blue-600 transition-colors duration-300">
                                        <RotateCcw className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors duration-300" />
                                    </div>
                                    <span className="text-xs font-mono font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-full uppercase tracking-wider">{asset.assetTag}</span>
                                </div>
                                
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{asset.name}</h3>
                                
                                <div className="flex items-center space-x-3 p-4 bg-gray-50/50 rounded-2xl mb-6">
                                    <div className="w-10 h-10 rounded-full bg-linear-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                                        {asset.currentAssignedTo?.firstName[0]}{asset.currentAssignedTo?.lastName[0]}
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Assigned To</p>
                                        <p className="text-sm font-bold text-gray-800">{asset.currentAssignedTo?.fullName}</p>
                                    </div>
                                </div>

                                <button 
                                    onClick={() => handleReturnClick(asset)}
                                    disabled={returningId === asset._id}
                                    className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-blue-100 hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
                                >
                                    {returningId === asset._id ? (
                                        <Loader className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            <RotateCcw className="w-4 h-4" />
                                            <span>Return Asset</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl p-20 flex flex-col items-center justify-center text-center shadow-sm border border-gray-100">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                            <AlertCircle className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800">No Assigned Assets Found</h3>
                        <p className="text-gray-400 mt-2 max-w-sm">All assets are currently in stock or no records match your search criteria.</p>
                        <button 
                            onClick={() => setSearchQuery('')}
                            className="mt-8 text-blue-600 font-bold hover:underline"
                        >
                            Clear search
                        </button>
                    </div>
                )}
            </div>

            <ReturnConfirmModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={confirmReturn}
                assetName={selectedAsset?.name}
                assetTag={selectedAsset?.assetTag}
                isReturning={returningId !== null}
            />
        </div>
    );
};

export default ReturnAsset;
