import React from 'react';
import { X, RotateCcw } from 'lucide-react';

const ReturnConfirmModal = ({ isOpen, onClose, onConfirm, assetName, assetTag, isReturning }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 dark:bg-black/80 backdrop-blur-md p-4 animate-fade-in transition-all duration-500">
            <div 
                className="bg-white/95 dark:bg-dark-card backdrop-blur-xl rounded-[2.5rem] shadow-premium w-full max-w-md overflow-hidden animate-scale-in border border-white/50 dark:border-dark-border flex flex-col transition-colors duration-500"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header with Icon */}
                <div className="relative p-10 text-center">
                    <button 
                        onClick={onClose}
                        className="absolute right-6 top-6 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all duration-300 group border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                    >
                        <X className="w-5 h-5 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white" />
                    </button>

                    <div className="mx-auto w-24 h-24 bg-amber-50 dark:bg-amber-900/20 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-sm">
                        <RotateCcw className="w-12 h-12 text-amber-500 animate-pulse" />
                    </div>

                    <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-3 tracking-tight transition-colors">Return Asset?</h2>
                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed px-4 font-medium transition-colors">
                        Are you sure you want to mark <span className="font-extrabold text-slate-900 dark:text-white">{assetName}</span> <span className="text-slate-400 dark:text-slate-500 text-xs font-mono">[{assetTag}]</span> as returned? 
                    </p>
                    <div className="mt-4 p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl inline-block border border-blue-100/50 dark:border-blue-900/20">
                        <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">Available for reassignment</p>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-10 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm flex flex-col sm:flex-row gap-4 border-t border-slate-100 dark:border-dark-border transition-colors duration-500">
                    <button
                        onClick={onClose}
                        className="flex-1 px-8 py-4.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition-all duration-300 active:scale-95"
                    >
                        Discard
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isReturning}
                        className="flex-1 px-8 py-4.5 rounded-2xl bg-brand-primary text-white font-bold text-sm shadow-premium shadow-indigo-100 dark:shadow-none hover:shadow-hover hover:-translate-y-1 active:translate-y-0 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed group"
                    >
                        {isReturning ? (
                            <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <RotateCcw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-700" />
                                <span>Confirm Return</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReturnConfirmModal;
