import React, { useState, useEffect } from 'react';
import { Search, Loader, RefreshCcw, RotateCcw, AlertCircle, User } from 'lucide-react';
import api from '../utils/api';

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
            const response = await api.get('/assets');
            const data = response.data;
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
            const response = await api.put(`/assets/${assetId}`, {
                status: 'Available',
                currentAssignedTo: null,
                assignedTo: null // For backend compatibility
            });

            const data = response.data;

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
        <div className="p-4 md:p-8 bg-gray-50/30 dark:bg-dark-bg min-h-screen transition-colors duration-500 font-sans">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight transition-colors">Return Assets</h1>
                        <p className="text-gray-500 dark:text-slate-400 mt-2 font-medium transition-colors">Easily return assigned assets to the available inventory.</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-dark-card p-6 rounded-[2rem] shadow-premium dark:shadow-none border border-slate-100 dark:border-dark-border mb-10 flex flex-col md:flex-row gap-4 transition-colors">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-500 group-focus-within:text-blue-500 transition-colors w-5 h-5 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search by asset or employee..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-slate-800/50 border border-transparent dark:border-dark-border rounded-2xl focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/20 focus:border-blue-500 outline-none transition-all duration-300 font-bold text-gray-800 dark:text-white placeholder:text-gray-300 dark:placeholder:text-slate-600"
                        />
                    </div>
                    <button
                        onClick={fetchAssignedAssets}
                        className="flex items-center justify-center space-x-3 bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border text-slate-600 dark:text-slate-300 px-8 py-4 rounded-2xl font-bold text-sm shadow-premium hover:shadow-hover hover:-translate-y-1 transition-all duration-300 active:scale-95 transition-colors"
                    >
                        <RefreshCcw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        <span>Refresh List</span>
                    </button>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="flex items-center justify-center p-32">
                        <Loader className="w-12 h-12 text-blue-500 animate-spin" />
                    </div>
                ) : filteredAssets.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredAssets.map((asset, index) => (
                            <div key={asset._id} 
                                className="bg-white dark:bg-dark-card p-8 rounded-[2.5rem] border border-slate-100 dark:border-dark-border shadow-premium hover:shadow-premium-hover hover:-translate-y-2 transition-all duration-500 group animate-slide-up"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <div className="flex justify-between items-start mb-8">
                                    <div className="p-4 bg-blue-50 dark:bg-slate-800 rounded-2xl group-hover:bg-blue-600 dark:group-hover:bg-blue-500 transition-colors duration-500 shadow-sm">
                                        <RotateCcw className="w-6 h-6 text-blue-600 dark:text-slate-400 group-hover:text-white transition-colors duration-500" />
                                    </div>
                                    <span className="text-[10px] font-black font-mono text-gray-400 dark:text-slate-500 bg-gray-50/50 dark:bg-slate-800/30 px-3 py-1.5 rounded-full uppercase tracking-widest border border-slate-50 dark:border-dark-border/20 transition-colors">
                                        {asset.assetTag}
                                    </span>
                                </div>

                                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 transition-colors tracking-tight">{asset.name}</h3>
                                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6 transition-colors">{asset.category}</p>

                                <div className="flex items-center space-x-4 p-5 bg-gray-50/50 dark:bg-slate-800/20 rounded-2xl mb-8 group-hover:bg-white dark:group-hover:bg-slate-800/40 transition-all border border-transparent group-hover:border-slate-100 dark:group-hover:border-dark-border/50">
                                    <div className="w-12 h-12 rounded-full bg-linear-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-black shadow-lg">
                                        {asset.currentAssignedTo?.firstName[0]}{asset.currentAssignedTo?.lastName[0]}
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-0.5">Assigned To</p>
                                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{asset.currentAssignedTo?.fullName}</p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleReturnClick(asset)}
                                    disabled={returningId === asset._id}
                                    className="w-full py-4.5 bg-brand-primary text-white rounded-2xl font-black text-sm shadow-premium shadow-indigo-100 dark:shadow-none hover:shadow-hover hover:-translate-y-1 active:translate-y-0 transition-all duration-300 flex items-center justify-center space-x-3 disabled:opacity-70 disabled:cursor-not-allowed group/btn"
                                >
                                    {returningId === asset._id ? (
                                        <Loader className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            <RotateCcw className="w-5 h-5 group-hover/btn:rotate-180 transition-transform duration-500" />
                                            <span>Return to Inventory</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white dark:bg-dark-card rounded-[3rem] p-32 flex flex-col items-center justify-center text-center shadow-premium dark:shadow-none border border-slate-50 dark:border-dark-border transition-colors">
                        <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-sm">
                            <AlertCircle className="w-12 h-12 text-slate-200 dark:text-slate-700" />
                        </div>
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Clean Inventory</h3>
                        <p className="text-gray-400 dark:text-slate-500 mt-4 max-w-sm font-medium leading-relaxed">All tracked assets are currently in-stock or no assignments match your active search.</p>
                        <button
                            onClick={() => setSearchQuery('')}
                            className="mt-10 px-8 py-3 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-primary hover:text-white transition-all duration-300"
                        >
                            Reset Search
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
