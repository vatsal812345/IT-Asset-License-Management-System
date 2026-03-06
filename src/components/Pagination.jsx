import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ 
    currentPage, 
    totalPages, 
    itemsPerPage, 
    totalItems, 
    onPageChange 
}) => {
    const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    // Generate page numbers to display
    const getPageNumbers = () => {
        const pages = [];
        const maxPagesToShow = 5;

        if (totalPages <= maxPagesToShow) {
            // Show all pages if total pages is less than max
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Show first few pages around current page
            if (currentPage <= 3) {
                // Near the beginning
                for (let i = 1; i <= Math.min(4, totalPages); i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                // Near the end
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) {
                    pages.push(i);
                }
            } else {
                // In the middle
                pages.push(1);
                
                if (currentPage > 3) {
                    pages.push('...');
                }
                
                pages.push(currentPage - 1);
                pages.push(currentPage);
                pages.push(currentPage + 1);
                
                if (currentPage < totalPages - 2) {
                    pages.push('...');
                }
                
                pages.push(totalPages);
            }
        }

        return pages;
    };

    const pageNumbers = getPageNumbers();

    return (
        <div className="bg-gradient-to-r from-gray-50 to-white dark:from-slate-900 dark:to-dark-card border-t border-gray-200 dark:border-dark-border px-6 py-5 flex items-center justify-center gap-4">
            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center gap-2">
                    {/* Previous Button */}
                    <button
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`px-4 py-2 rounded-full font-medium text-sm transition-all duration-200 flex items-center gap-2 ${
                            currentPage === 1
                                ? 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-600 cursor-not-allowed'
                                : 'bg-white dark:bg-dark-card text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 shadow-sm hover:shadow-md dark:border dark:border-dark-border'
                        }`}
                    >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Previous</span>
                    </button>

                    {/* Page Numbers */}
                    <div className="flex items-center gap-2">
                        {pageNumbers.map((page, index) => {
                            if (page === '...') {
                                return (
                                    <span
                                        key={`ellipsis-${index}`}
                                        className="px-2 text-gray-500 font-semibold"
                                    >
                                        ...
                                    </span>
                                );
                            }

                            return (
                                <button
                                    key={page}
                                    onClick={() => onPageChange(page)}
                                    className={`min-w-10 h-10 rounded-full font-semibold text-sm transition-all duration-300 ${
                                        currentPage === page
                                            ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40 scale-110'
                                            : 'bg-transparent text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800'
                                    }`}
                                >
                                    {page}
                                </button>
                            );
                        })}
                    </div>

                    {/* Next Button */}
                    <button
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`px-4 py-2 rounded-full font-medium text-sm transition-all duration-200 flex items-center gap-2 ${
                            currentPage === totalPages
                                ? 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-600 cursor-not-allowed'
                                : 'bg-white dark:bg-dark-card text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 shadow-sm hover:shadow-md dark:border dark:border-dark-border'
                        }`}
                    >
                        <span>Next</span>
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default Pagination;
