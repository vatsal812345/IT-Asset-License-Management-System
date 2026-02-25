import React from 'react';
import { X, Trash2, AlertCircle } from 'lucide-react';

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, assetName, assetTag, isDeleting }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4 transition-all duration-300">
            <div 
                className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in transform transition-all border border-red-50"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header with Icon */}
                <div className="relative p-8 text-center border-b border-gray-50 bg-white">
                    <button 
                        onClick={onClose}
                        className="absolute right-6 top-6 p-2 hover:bg-gray-100 rounded-full transition-colors group"
                    >
                        <X className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                    </button>

                    <div className="mx-auto w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mb-6 animate-bounce-subtle">
                        <Trash2 className="w-10 h-10 text-red-500" />
                    </div>

                    <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Delete Asset?</h2>
                    <p className="text-gray-500 leading-relaxed px-4">
                        Are you sure you want to delete <span className="font-bold text-gray-800">{assetName}</span> ({assetTag})? This action is permanent and cannot be undone.
                    </p>
                </div>

                {/* Footer Actions */}
                <div className="p-8 bg-gray-50/50 flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-6 py-4 rounded-2xl bg-white border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-100 hover:border-gray-300 transition-all active:scale-95"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="flex-1 px-6 py-4 rounded-2xl bg-red-600 text-white font-bold text-sm shadow-xl shadow-red-100 hover:bg-red-700 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                        {isDeleting ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Trash2 className="w-4 h-4" />
                                <span>Confirm Delete</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmModal;
