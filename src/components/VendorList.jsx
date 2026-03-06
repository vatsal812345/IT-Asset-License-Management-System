import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Plus, 
    Search, 
    Building2, 
    Mail, 
    Phone, 
    Star, 
    MoreVertical, 
    Edit2, 
    Trash2, 
    ExternalLink,
    Filter,
    ChevronLeft,
    ChevronRight,
    Loader
} from 'lucide-react';
import api from '../utils/api';
import Pagination from './Pagination';
import VendorForm from './VendorForm';
import DeleteConfirmModal from './DeleteConfirmModal';

const VendorList = () => {
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
    const [statusFilter, setStatusFilter] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const navigate = useNavigate();

    const fetchVendors = async (page = 1) => {
        try {
            setLoading(true);
            const response = await api.get('/vendors', {
                params: {
                    page,
                    limit: pagination.limit,
                    search,
                    status: statusFilter
                }
            });
            if (response.data.success) {
                setVendors(response.data.data.vendors);
                setPagination(response.data.data.pagination);
            }
        } catch (error) {
            console.error('Error fetching vendors:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchVendors(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [search, statusFilter]);

    const handlePageChange = (newPage) => {
        fetchVendors(newPage);
    };

    const handleEdit = (vendor) => {
        setSelectedVendor(vendor);
        setIsFormOpen(true);
    };

    const handleDelete = (vendor) => {
        setSelectedVendor(vendor);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        try {
            const response = await api.delete(`/vendors/${selectedVendor._id}`);
            if (response.data.success) {
                fetchVendors(pagination.page);
                setIsDeleteModalOpen(false);
            }
        } catch (error) {
            console.error('Error deleting vendor:', error);
            alert('Failed to delete vendor');
        }
    };

    const handleFormSubmit = async (formData) => {
        try {
            let response;
            if (selectedVendor) {
                response = await api.put(`/vendors/${selectedVendor._id}`, formData);
            } else {
                response = await api.post('/vendors', formData);
            }

            if (response.data.success) {
                setIsFormOpen(false);
                fetchVendors(selectedVendor ? pagination.page : 1);
            }
        } catch (error) {
            console.error('Error saving vendor:', error);
            alert('Failed to save vendor');
        }
    };

    return (
        <div className="p-4 md:p-8 animate-fade-in">
            <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-1 bg-brand-primary rounded-full"></div>
                        <h2 className="text-brand-primary font-bold text-xs uppercase tracking-[0.2em]">Management</h2>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Vendors Database</h1>
                </div>
                <button 
                    onClick={() => { setSelectedVendor(null); setIsFormOpen(true); }}
                    className="flex items-center justify-center gap-2 bg-brand-primary hover:bg-brand-primary/90 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                    <Plus className="w-5 h-5" />
                    <span>Add Vendor</span>
                </button>
            </header>

            <div className="bg-white dark:bg-dark-card rounded-3xl shadow-premium border border-slate-50 dark:border-dark-border overflow-hidden mb-8">
                {/* Search and Filters */}
                <div className="p-6 border-b border-slate-50 dark:border-dark-border flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-primary transition-colors" />
                        <input 
                            type="text" 
                            placeholder="Search vendor by name..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-transparent focus:border-brand-primary/30 rounded-2xl outline-none transition-all text-slate-900 dark:text-white font-medium"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <Filter className="w-5 h-5 text-slate-400" />
                        <select 
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-slate-50 dark:bg-slate-800/50 border border-transparent focus:border-brand-primary/30 rounded-2xl px-4 py-3.5 outline-none transition-all text-slate-900 dark:text-white font-bold text-sm"
                        >
                            <option value="">All Status</option>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                                <th className="text-left py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Vendor Info</th>
                                <th className="text-left py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Person</th>
                                <th className="text-left py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Details</th>
                                <th className="text-center py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Rating</th>
                                <th className="text-center py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="text-right py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-dark-border">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="py-20 text-center">
                                        <Loader className="w-10 h-10 text-brand-primary animate-spin mx-auto mb-4" />
                                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Vendors...</p>
                                    </td>
                                </tr>
                            ) : vendors.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="py-20 text-center">
                                        <Building2 className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No Vendors Found</p>
                                    </td>
                                </tr>
                            ) : vendors.map((vendor) => (
                                <tr key={vendor._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                                    <td className="py-5 px-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-brand-primary flex items-center justify-center font-bold">
                                                <Building2 className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 dark:text-white group-hover:text-brand-primary transition-colors cursor-pointer" onClick={() => navigate(`/vendors/${vendor._id}`)}>
                                                    {vendor.vendorName}
                                                </p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide mt-0.5">ID: {vendor._id.slice(-6).toUpperCase()}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-5 px-6">
                                        <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">{vendor.contactPerson || 'N/A'}</p>
                                    </td>
                                    <td className="py-5 px-6">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                                <Mail className="w-3 h-3" />
                                                <span>{vendor.email || 'No Email'}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                                <Phone className="w-3 h-3" />
                                                <span>{vendor.phone || 'No Phone'}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-5 px-6">
                                        <div className="flex items-center justify-center gap-1">
                                            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{vendor.rating || 3}</span>
                                        </div>
                                    </td>
                                    <td className="py-5 px-6">
                                        <div className="flex justify-center">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${
                                                vendor.status === 'Active' 
                                                ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' 
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                                            }`}>
                                                {vendor.status}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-5 px-6">
                                        <div className="flex items-center justify-end gap-2">
                                            <button 
                                                onClick={() => handleEdit(vendor)}
                                                className="p-2 hover:bg-brand-primary/10 text-slate-400 hover:text-brand-primary rounded-lg transition-colors"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(vendor)}
                                                className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => navigate(`/vendors/${vendor._id}`)}
                                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 dark:text-slate-500 rounded-lg transition-colors"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer / Pagination */}
                <div className="p-6 border-t border-slate-50 dark:border-dark-border flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Showing {vendors.length} of {pagination.total} vendors
                    </p>
                    <Pagination 
                        currentPage={pagination.page}
                        totalPages={pagination.pages}
                        onPageChange={handlePageChange}
                    />
                </div>
            </div>

            <VendorForm 
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSubmit={handleFormSubmit}
                initialData={selectedVendor}
            />

            <DeleteConfirmModal 
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Deactivate Vendor"
                message={`Are you sure you want to set ${selectedVendor?.vendorName} as Inactive?`}
            />
        </div>
    );
};

export default VendorList;
