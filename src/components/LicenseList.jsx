import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useToast } from '../context/ToastContext';
import { Search, Plus, Filter, Edit, Trash2, Loader, UserPlus, Download, Award, Clock, AlertCircle, CheckCircle2, XCircle, MoreHorizontal } from 'lucide-react';
import LicenseForm from './LicenseForm';
import DeleteConfirmModal from './DeleteConfirmModal';
import Pagination from './Pagination';
import { getExpiryStatus } from '../utils/warrantyUtils';
import { exportToCSV, formatDateForCSV } from '../utils/csvExport';
import api from '../utils/api';

const LicenseList = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { checkItemAndNotify } = useNotifications();
    const { showToast } = useToast();
    const [licenses, setLicenses] = useState([]);
    const [filteredLicenses, setFilteredLicenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingLicense, setEditingLicense] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedDeleteLicense, setSelectedDeleteLicense] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [isExporting, setIsExporting] = useState(false);
    const itemsPerPage = 5;

    const fetchLicenses = async () => {
        setLoading(true);
        try {
            const response = await api.get('/licenses');
            const data = response.data;
            if (data.success) {
                setLicenses(data.data);
                setFilteredLicenses(data.data);
            }
        } catch (error) {
            console.error('Error fetching licenses:', error);
            showToast('Failed to fetch licenses', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLicenses();
    }, []);

    useEffect(() => {
        let result = [...licenses];
        
        // Sort by updatedAt (descending) to show newest/most recently edited at the top
        result.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

        if (statusFilter !== 'All') {
            result = result.filter(license => license.status === statusFilter);
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(license =>
                license.softwareName.toLowerCase().includes(query) ||
                license.licenseKey.toLowerCase().includes(query) ||
                license.vendor.toLowerCase().includes(query)
            );
        }

        setFilteredLicenses(result);
        setCurrentPage(1);
    }, [licenses, searchQuery, statusFilter]);

    const handleCreateUpdate = async (formData) => {
        try {
            let response;
            if (editingLicense) {
                response = await api.put(`/licenses/${editingLicense._id}`, formData);
            } else {
                response = await api.post('/licenses', formData);
            }

            const data = response.data;
            if (data.success) {
                fetchLicenses();
                setIsFormOpen(false);
                setEditingLicense(null);
                showToast(
                    editingLicense ? 'License updated successfully' : 'New license registered successfully',
                    'success'
                );
                checkItemAndNotify(formData, 'license');
            } else {
                showToast(data.message || 'Operation failed', 'error');
            }
        } catch (error) {
            console.error('Error saving license:', error);
            showToast('Failed to save license. Please try again.', 'error');
        }
    };

    const handleDeleteClick = (license) => {
        setSelectedDeleteLicense(license);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!selectedDeleteLicense) return;

        setIsDeleting(true);
        try {
            const response = await api.delete(`/licenses/${selectedDeleteLicense._id}`);
            const data = response.data;
            if (data.success) {
                fetchLicenses();
                setIsDeleteModalOpen(false);
                setSelectedDeleteLicense(null);
                showToast('License deleted successfully', 'success');
            } else {
                showToast(data.message || 'Error deleting license', 'error');
            }
        } catch (error) {
            console.error('Error deleting license:', error);
            showToast('Failed to delete license. Please try again.', 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    const openEditForm = (license) => {
        setEditingLicense(license);
        setIsFormOpen(true);
    };

    const handleExportCSV = () => {
        setIsExporting(true);
        try {
            const columns = [
                { key: 'softwareName', header: 'Software' },
                { key: 'vendor', header: 'Vendor' },
                { key: 'licenseKey', header: 'License Key' },
                { key: 'totalSeats', header: 'Total Seats' },
                { key: 'usedSeats', header: 'Used Seats' },
                { key: 'licenseType', header: 'Type' },
                { key: 'status', header: 'Status' },
                { 
                    key: 'expirationDate', 
                    header: 'Expiration Date',
                    accessor: (license) => formatDateForCSV(license.expiryDate)
                },
                { 
                    key: 'purchaseDate', 
                    header: 'Purchase Date',
                    accessor: (license) => formatDateForCSV(license.purchaseDate)
                }
            ];

            const filename = `licenses_export_${new Date().toISOString().split('T')[0]}.csv`;
            exportToCSV(filteredLicenses, columns, filename);
        } catch (error) {
            console.error('Export failed:', error);
        } finally {
            setIsExporting(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Active': return 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30';
            case 'Expired': return 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 border-rose-100 dark:border-rose-900/30';
            case 'Pending': return 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-900/30';
            default: return 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-400 border-slate-100 dark:border-dark-border';
        }
    };

    // Pagination
    const totalPages = Math.ceil(filteredLicenses.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentLicenses = filteredLicenses.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="p-8 animate-fade-in-up transition-colors duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-1 bg-brand-primary rounded-full"></div>
                        <span className="text-brand-primary font-bold text-[10px] uppercase tracking-widest">Compliance Registry</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight transition-colors">Software Licenses</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium mt-1 transition-colors">Track utilization, compliance, and renewal cycles across organizational software.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <button
                        onClick={handleExportCSV}
                        disabled={isExporting || filteredLicenses.length === 0}
                        className="flex items-center justify-center space-x-2 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border text-slate-600 dark:text-slate-300 px-6 py-3 rounded-2xl font-bold text-sm shadow-premium hover:shadow-hover hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                        {isExporting ? <Loader className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5 group-hover:scale-110 transition-transform" />}
                        <span>{isExporting ? 'Exporting...' : 'Export CSV'}</span>
                    </button>
                    {['Admin', 'Manager'].includes(user?.role) && (
                        <button
                            onClick={() => {
                                setEditingLicense(null);
                                setIsFormOpen(true);
                            }}
                            className="flex items-center space-x-2 bg-brand-primary text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-premium shadow-indigo-200 dark:shadow-none hover:shadow-hover hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 active:scale-95 w-full md:w-auto justify-center group"
                        >
                            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                            <span>Register License</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-dark-card p-6 rounded-[2rem] shadow-premium dark:shadow-none border border-gray-100 dark:border-dark-border mb-8 flex flex-col md:flex-row gap-6 items-center justify-between transition-colors">
                <div className="relative w-full md:w-96 group">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-500 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search by software name or vendor..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50/50 dark:bg-slate-800/50 border border-transparent dark:border-dark-border rounded-2xl focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/20 focus:border-blue-500 outline-none transition-all duration-300 font-bold text-gray-800 dark:text-white placeholder:text-gray-300 dark:placeholder:text-slate-600"
                    />
                </div>
                <div className="flex items-center space-x-4 w-full md:w-auto">
                    <div className="flex items-center space-x-2 text-gray-400 dark:text-slate-500 px-2 font-bold uppercase tracking-widest text-[10px]">
                        <Filter className="w-4 h-4 text-blue-500" />
                        <span>Sort By</span>
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-6 py-3.5 bg-gray-50/50 dark:bg-slate-800/50 border border-transparent dark:border-dark-border rounded-2xl focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/20 focus:border-blue-500 outline-none cursor-pointer transition-all duration-300 font-bold text-sm text-gray-800 dark:text-white min-w-[160px]"
                    >
                        <option value="All">All Status</option>
                        <option value="Active">Active</option>
                        <option value="Expired">Expired</option>
                        <option value="Pending">Pending</option>
                    </select>
                </div>
            </div>

            {/* Results Count */}
            {!loading && filteredLicenses.length > 0 && (
                <div className="flex justify-end mb-4">
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/30 px-3 py-1 rounded-full border border-slate-100 dark:border-dark-border/20 transition-colors">
                        Page <span className="text-blue-600 dark:text-indigo-400">{currentPage}</span> of <span className="text-slate-900 dark:text-white">{totalPages}</span>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="bg-white dark:bg-dark-card rounded-[2.5rem] shadow-premium dark:shadow-none border border-slate-100 dark:border-dark-border overflow-hidden transition-colors duration-500">
                {loading ? (
                    <div className="flex items-center justify-center p-24">
                        <Loader className="w-10 h-10 text-blue-500 animate-spin" />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-dark-border transition-colors">
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">License Info</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Utilization</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Status</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Expiration</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-dark-border transition-colors">
                                {currentLicenses.length > 0 ? (
                                    currentLicenses.map((license, index) => (
                                        <tr 
                                            key={license._id} 
                                            className="hover:bg-blue-50/40 dark:hover:bg-slate-800/40 transition-all duration-300 group cursor-pointer"
                                            onClick={() => navigate(`/licenses/${license._id}`)}
                                        >
                                            <td className="px-8 py-6">
                                                <div className="flex items-center space-x-4">
                                                    <div className="w-12 h-12 bg-linear-to-tr from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0 group-hover:scale-105 transition-transform duration-500">
                                                        <Award className="w-6 h-6" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-black text-slate-900 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-indigo-400 transition-colors">{license.softwareName}</span>
                                                        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">{license.vendor}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col space-y-2 max-w-[140px]">
                                                    <div className="flex justify-between text-[10px] font-bold">
                                                        <span className="text-slate-400 dark:text-slate-500">SEATS</span>
                                                        <span className="text-slate-900 dark:text-white transition-colors">{license.usedSeats} / {license.totalSeats}</span>
                                                    </div>
                                                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                        <div 
                                                            className={`h-full rounded-full transition-all duration-1000 ${
                                                                (license.usedSeats / license.totalSeats) >= 0.9 ? 'bg-rose-500' : 
                                                                (license.usedSeats / license.totalSeats) >= 0.7 ? 'bg-amber-500' : 'bg-emerald-500'
                                                            }`}
                                                            style={{ width: `${(license.usedSeats / license.totalSeats) * 100}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-colors ${getStatusColor(license.status)}`}>
                                                    {license.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                {(() => {
                                                    const expiry = getExpiryStatus(license.expiryDate);
                                                    const Icon = expiry.icon;
                                                    return (
                                                        <div className={`flex items-center space-x-2 text-sm font-bold transition-colors ${
                                                            expiry.status === 'expired' ? 'text-rose-600 dark:text-rose-400' : 
                                                            expiry.status === 'expiring' ? 'text-amber-600 dark:text-amber-400' : 'text-slate-600 dark:text-slate-300'
                                                        }`}>
                                                            <Icon className="w-4 h-4" />
                                                            <span>{new Date(license.expiryDate).toLocaleDateString()}</span>
                                                        </div>
                                                    );
                                                })()}
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex items-center justify-end space-x-2">
                                                    {['Admin', 'Manager'].includes(user?.role) && (
                                                        <>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    navigate(`/licenses/${license._id}/assign`);
                                                                }}
                                                                className="p-3 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-500 hover:shadow-lg transition-all duration-300 group/btn"
                                                                title="Assign License"
                                                            >
                                                                <UserPlus className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                                                            </button>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    openEditForm(license);
                                                                }}
                                                                className="p-3 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-2xl hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500 hover:shadow-lg transition-all duration-300"
                                                                title="Edit"
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </button>
                                                        </>
                                                    )}
                                                    {user?.role === 'Admin' && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteClick(license);
                                                            }}
                                                            className="p-3 text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-2xl hover:bg-red-500 hover:text-white dark:hover:bg-red-500 hover:shadow-lg transition-all duration-300"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-8 py-32 text-center">
                                            <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 space-y-6">
                                                <div className="w-24 h-24 bg-slate-50 dark:bg-slate-900/50 rounded-[2.5rem] flex items-center justify-center transition-colors">
                                                    <Award className="w-10 h-10" />
                                                </div>
                                                <div>
                                                    <p className="text-xl font-black text-slate-900 dark:text-white transition-colors">No licenses found</p>
                                                    <p className="font-medium mt-2">Scale your inventory by registering new software licenses.</p>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {!loading && filteredLicenses.length > 0 && (
                <div className="mt-10">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        itemsPerPage={itemsPerPage}
                        totalItems={filteredLicenses.length}
                        onPageChange={setCurrentPage}
                    />
                </div>
            )}

            <LicenseForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSubmit={handleCreateUpdate}
                initialData={editingLicense}
            />

            <DeleteConfirmModal 
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete License?"
                itemName={selectedDeleteLicense?.softwareName}
                itemTag={selectedDeleteLicense?.vendor}
                isDeleting={isDeleting}
            />
        </div>
    );
};

export default LicenseList;
