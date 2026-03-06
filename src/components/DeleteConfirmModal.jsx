import React from 'react';
import { X, Trash2 } from 'lucide-react';

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, title = "Delete Asset?", itemName, itemTag, isDeleting }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 dark:bg-black/80 backdrop-blur-md p-4 animate-fade-in transition-all duration-500">
            <div 
                className="bg-white/95 dark:bg-dark-card backdrop-blur-xl rounded-[2.5rem] shadow-premium w-full max-w-md overflow-hidden animate-scale-in border border-red-50 dark:border-red-900/20 flex flex-col transition-colors duration-500"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header with Icon */}
                <div className="relative p-10 text-center">
                    <button 
                        onClick={onClose}
                        className="absolute right-6 top-6 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all duration-300 group border border-transparent hover:border-red-100 dark:hover:border-red-900/30"
                    >
                        <X className="w-5 h-5 text-red-300 group-hover:text-red-600 dark:group-hover:text-red-400" />
                    </button>

                    <div className="mx-auto w-24 h-24 bg-red-50 dark:bg-red-900/10 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-sm">
                        <Trash2 className="w-12 h-12 text-red-500 animate-bounce-subtle" />
                    </div>

                    <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-3 tracking-tight transition-colors">{title}</h2>
                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed px-4 font-medium transition-colors">
                        Are you sure you want to remove <span className="font-extrabold text-slate-900 dark:text-white">{itemName}</span> <span className="text-slate-400 dark:text-slate-500 text-xs font-mono">[{itemTag}]</span>? 
                    </p>
                    <div className="mt-4 p-3 bg-red-50/50 dark:bg-red-900/10 rounded-2xl inline-block border border-red-100/50 dark:border-red-900/20">
                        <p className="text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-widest">This action is permanent</p>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-10 bg-red-50/30 dark:bg-red-950/10 backdrop-blur-sm flex flex-col sm:flex-row gap-4 border-t border-red-50 dark:border-red-900/20 transition-colors duration-500">
                    <button
                        onClick={onClose}
                        className="flex-1 px-8 py-4.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition-all duration-300 active:scale-95"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="flex-1 px-8 py-4.5 rounded-2xl bg-red-600 text-white font-bold text-sm shadow-premium shadow-red-100 dark:shadow-none hover:bg-red-700 hover:shadow-hover hover:-translate-y-1 active:translate-y-0 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed group"
                    >
                        {isDeleting ? (
                            <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Trash2 className="w-5 h-5 group-hover:scale-125 transition-transform duration-300" />
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
