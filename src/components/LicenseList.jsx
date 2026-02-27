import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Filter, Edit, Trash2, Loader, BarChart3, ShieldCheck, Clock, Users, Package, UserPlus, ChevronDown, ChevronRight, User, ShieldAlert, ShieldX, Download } from 'lucide-react';
import LicenseForm from './LicenseForm';
import DeleteConfirmModal from './DeleteConfirmModal';
import Pagination from './Pagination';
import { getExpiryStatus } from '../utils/warrantyUtils';
import { exportToCSV, formatDateForCSV } from '../utils/csvExport';

const LicenseList = () => {
    const navigate = useNavigate();
    const [licenses, setLicenses] = useState([]);
    const [filteredLicenses, setFilteredLicenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [expiryFilter, setExpiryFilter] = useState('All');
    
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingLicense, setEditingLicense] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedDeleteLicense, setSelectedDeleteLicense] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [expandedRows, setExpandedRows] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [isExporting, setIsExporting] = useState(false);
    const itemsPerPage = 10;

    const toggleRow = (id) => {
        setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const getEmployees = (license) => {
        const assignedTo = license.assignedTo || [];
        return assignedTo
            .filter(a => a.employee !== null)
            .map(a => ({
                _id: a._id || a.employee._id,
                name: a.employee.fullName || `${a.employee.firstName} ${a.employee.lastName}`,
                employeeId: a.employee.employeeId || 'N/A',
                department: a.employee.department || 'N/A',
                assignedAt: new Date(a.assignedDate || license.updatedAt).toLocaleDateString(),
            }));
    };

    const fetchLicenses = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/licenses');
            const data = await response.json();
            if (data.success) {
                setLicenses(data.data);
                setFilteredLicenses(data.data);
            }
        } catch (error) {
            console.error('Error fetching licenses:', error);
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

        if (categoryFilter !== 'All') {
            result = result.filter(license => license.category === categoryFilter);
        }

        if (expiryFilter !== 'All') {
            result = result.filter(license => {
                const status = getExpiryStatus(license.expiryDate);
                if (expiryFilter === 'Active') return status.status === 'active';
                if (expiryFilter === 'Expiring Soon') return status.status === 'expiring';
                if (expiryFilter === 'Expired') return status.status === 'expired';
                if (expiryFilter === 'No Expiry') return status.status === 'none';
                return true;
            });
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
        setCurrentPage(1); // Reset to first page when filters change
    }, [licenses, searchQuery, categoryFilter, expiryFilter]);

    const handleCreateUpdate = async (formData) => {
        try {
            const url = editingLicense
                ? `http://localhost:5000/api/licenses/${editingLicense._id}`
                : 'http://localhost:5000/api/licenses';
            
            const method = editingLicense ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();
            if (data.success) {
                fetchLicenses();
                setIsFormOpen(false);
                setEditingLicense(null);
            } else {
                alert('Error: ' + data.message);
            }
        } catch (error) {
            console.error('Error saving license:', error);
            alert('Failed to save license');
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
            const response = await fetch(`http://localhost:5000/api/licenses/${selectedDeleteLicense._id}`, {
                method: 'DELETE',
            });
            const data = await response.json();
            if (data.success) {
                fetchLicenses();
                setIsDeleteModalOpen(false);
                setSelectedDeleteLicense(null);
            } else {
                alert('Error deleting license: ' + data.message);
            }
        } catch (error) {
            console.error('Error deleting license:', error);
            alert('Failed to delete license');
        } finally {
            setIsDeleting(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Active': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'Expired': return 'bg-red-100 text-red-700 border-red-200';
            case 'Suspended': return 'bg-amber-100 text-amber-700 border-amber-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    // CSV Export Handler
    const handleExportCSV = () => {
        setIsExporting(true);
        try {
            const columns = [
                { key: 'softwareName', header: 'Software Name' },
                { key: 'vendor', header: 'Vendor' },
                { key: 'licenseKey', header: 'License Key' },
                { key: 'category', header: 'Category' },
                { key: 'totalSeats', header: 'Total Seats' },
                { key: 'usedSeats', header: 'Used Seats' },
                { 
                    key: 'utilization', 
                    header: 'Utilization %',
                    accessor: (license) => Math.round((license.usedSeats || 0) / license.totalSeats * 100) || 0
                },
                { key: 'status', header: 'Status' },
                { key: 'purchaseDate', header: 'Purchase Date', accessor: (license) => formatDateForCSV(license.purchaseDate) },
                { key: 'expiryDate', header: 'Expiry Date', accessor: (license) => formatDateForCSV(license.expiryDate) },
                { key: 'cost', header: 'Cost' },
            ];

            const filename = `licenses_export_${new Date().toISOString().split('T')[0]}.csv`;
            exportToCSV(filteredLicenses, columns, filename);
        } catch (error) {
            console.error('Export failed:', error);
        } finally {
            setIsExporting(false);
        }
    };

    // Pagination calculations
    const totalPages = Math.ceil(filteredLicenses.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentLicenses = filteredLicenses.slice(startIndex, endIndex);

    const UtilizationBar = ({ used, total }) => {
        const percentage = Math.min(Math.round((used / total) * 100), 100) || 0;
        let barColor = 'bg-blue-500';
        if (percentage > 90) barColor = 'bg-red-500';
        else if (percentage > 70) barColor = 'bg-amber-500';

        return (
            <div className="w-full">
                <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                    <span>{percentage}% Used</span>
                    <span>{used} / {total}</span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden border border-gray-50">
                    <div 
                        className={`h-full ${barColor} transition-all duration-1000 ease-out rounded-full shadow-sm`}
                        style={{ width: `${percentage}%` }}
                    />
                </div>
            </div>
        );
    };

    return (
        <div className="p-4 md:p-8 bg-gray-50/30 min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Software Licenses</h1>
                    <p className="text-gray-500 mt-1 font-medium">Manage and track software license utilization across the organization.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <button
                        onClick={handleExportCSV}
                        disabled={isExporting || filteredLicenses.length === 0}
                        className="flex items-center justify-center space-x-2 bg-white border-2 border-emerald-500 text-emerald-600 px-6 py-3 rounded-2xl font-bold shadow-sm hover:bg-emerald-50 hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isExporting ? (
                            <Loader className="w-5 h-5 animate-spin" />
                        ) : (
                            <Download className="w-5 h-5" />
                        )}
                        <span>{isExporting ? 'Exporting...' : 'Export CSV'}</span>
                    </button>
                    <button
                        onClick={() => navigate('/licenses/register')}
                        className="flex items-center space-x-2 bg-linear-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-2xl font-bold shadow-xl shadow-blue-100 hover:shadow-blue-200 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 w-full md:w-auto justify-center"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Add New License</span>
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[
                    { label: 'Total Licenses', value: licenses.length, icon: ShieldCheck, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Active Seats', value: licenses.reduce((acc, curr) => acc + (curr.totalSeats - (curr.usedSeats || 0)), 0), icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Expiring Soon', value: licenses.filter(l => new Date(l.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)).length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
                    { label: 'Avg utilization', value: `${Math.round(licenses.reduce((acc, curr) => acc + ((curr.usedSeats || 0) / curr.totalSeats * 100), 0) / (licenses.length || 1))}%`, icon: BarChart3, color: 'text-purple-600', bg: 'bg-purple-50' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                        </div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                        <p className="text-2xl font-extrabold text-gray-900 mt-1">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between px-6">
                <div className="relative w-full md:w-96 group">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-300 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search software, key, or vendor..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all duration-300 font-medium text-gray-800 placeholder:text-gray-300"
                    />
                </div>
                <div className="flex items-center space-x-3 w-full md:w-auto">
                    <div className="flex items-center space-x-2 text-gray-400 px-2">
                        <Filter className="w-5 h-5" />
                        <span className="text-xs font-bold uppercase tracking-widest">Category</span>
                    </div>
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none cursor-pointer transition-all duration-300 font-medium text-gray-800 min-w-[160px]"
                    >
                        <option value="All">All Categories</option>
                        <option value="Operating System">OS</option>
                        <option value="Productivity">Productivity</option>
                        <option value="Graphic Design">Design</option>
                        <option value="Development">Development</option>
                    </select>
                    <select
                        value={expiryFilter}
                        onChange={(e) => setExpiryFilter(e.target.value)}
                        className="px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none cursor-pointer transition-all duration-300 font-medium text-gray-800 min-w-[160px]"
                    >
                        <option value="All">All Expiry</option>
                        <option value="Active">Active</option>
                        <option value="Expiring Soon">Expiring Soon</option>
                        <option value="Expired">Expired</option>
                        <option value="No Expiry">No Expiry</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-4xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center p-20">
                        <Loader className="w-10 h-10 text-blue-500 animate-spin" />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Software & Vendor</th>
                                    <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">License Key</th>
                                    <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Utilization</th>
                                    <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Status</th>
                                    <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Expiry Date</th>
                                    <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {currentLicenses.length > 0 ? (
                                    currentLicenses.map((license, index) => {
                                        const employees = getEmployees(license);
                                        const isExpanded = expandedRows[license._id];
                                        return (
                                        <React.Fragment key={license._id}>
                                        <tr 
                                            className="hover:bg-blue-50/40 transition-colors group cursor-pointer"
                                            onClick={() => toggleRow(license._id)}
                                        >
                                            <td className="px-8 py-6">
                                                <div className="flex items-center space-x-4">
                                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-300 ${
                                                        isExpanded 
                                                            ? 'bg-indigo-100 text-indigo-600 border-indigo-200' 
                                                            : 'bg-indigo-50 text-indigo-600 border-indigo-100 group-hover:bg-white'
                                                    }`}>
                                                        {isExpanded 
                                                            ? <ChevronDown className="w-5 h-5" /> 
                                                            : <Package className="w-6 h-6" />
                                                        }
                                                    </div>
                                                    <div>
                                                        <p 
                                                            className="text-sm font-extrabold text-gray-900 group-hover:text-blue-600 transition-colors cursor-pointer hover:underline decoration-blue-300 underline-offset-2"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                navigate(`/history?license=${encodeURIComponent(license.softwareName)}`);
                                                            }}
                                                            title="View license history"
                                                        >{license.softwareName}</p>
                                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-0.5">{license.vendor || 'Unknown Vendor'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="text-xs font-bold font-mono bg-gray-100 px-3 py-1.5 rounded-xl border border-gray-200 text-gray-600 group-hover:bg-white transition-colors">
                                                    {license.licenseKey}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 max-w-[200px]">
                                                <UtilizationBar used={license.usedSeats || 0} total={license.totalSeats} />
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${getStatusColor(license.status)}`}>
                                                    {license.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                {(() => {
                                                    const expiryStatus = getExpiryStatus(license.expiryDate);
                                                    const Icon = expiryStatus.icon;
                                                    return (
                                                        <div className="flex flex-col gap-2">
                                                            <span 
                                                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 hover:scale-105 w-fit ${
                                                                    expiryStatus.status === 'active' 
                                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                                                                        : expiryStatus.status === 'expiring' 
                                                                        ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' 
                                                                        : expiryStatus.status === 'expired'
                                                                        ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                                                                        : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                                                                }`}
                                                            >
                                                                <Icon className="w-3.5 h-3.5" />
                                                                {expiryStatus.label}
                                                            </span>
                                                            {license.expiryDate && (
                                                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1">
                                                                    <Clock className="w-3 h-3" />
                                                                    {expiryStatus.daysRemaining > 0 
                                                                        ? `${expiryStatus.daysRemaining} days left` 
                                                                        : expiryStatus.daysRemaining < 0
                                                                        ? `Expired ${Math.abs(expiryStatus.daysRemaining)} days ago`
                                                                        : 'Expires today'}
                                                                </span>
                                                            )}
                                                        </div>
                                                    );
                                                })()}
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex items-center justify-end space-x-2 transition-opacity">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate(`/licenses/${license._id}/assign`);
                                                        }}
                                                        className="p-3 text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-2xl hover:bg-emerald-600 hover:text-white hover:border-emerald-600 hover:shadow-lg hover:shadow-emerald-200 transition-all duration-300"
                                                        title="Assign License"
                                                    >
                                                        <UserPlus className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setEditingLicense(license);
                                                            setIsFormOpen(true);
                                                        }}
                                                        className="p-3 text-blue-600 bg-blue-50 border border-blue-100 rounded-2xl hover:bg-blue-600 hover:text-white hover:border-blue-600 hover:shadow-lg hover:shadow-blue-200 transition-all duration-300"
                                                        title="Edit"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteClick(license);
                                                        }}
                                                        className="p-3 text-red-500 bg-red-50 border border-red-100 rounded-2xl hover:bg-red-500 hover:text-white hover:border-red-500 hover:shadow-lg hover:shadow-red-200 transition-all duration-300"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>

                                        {/* Expanded Employee Details */}
                                        {isExpanded && (
                                            <tr>
                                                <td colSpan="6" className="px-0 py-0">
                                                    <div className="bg-linear-to-b from-indigo-50/50 to-white border-t border-indigo-100" style={{ animation: 'slideDown 0.35s ease-out forwards', overflow: 'hidden' }}>
                                                        <div className="px-12 py-5">
                                                            <div className="flex items-center space-x-2 mb-4">
                                                                <Users className="w-4 h-4 text-indigo-500" />
                                                                <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">
                                                                    Assigned Employees ({employees.length})
                                                                </span>
                                                            </div>
                                                            {employees.length > 0 ? (
                                                                <div className="grid gap-3">
                                                                    {employees.map((emp, i) => (
                                                                        <div 
                                                                            key={emp._id}
                                                                            className="flex items-center justify-between bg-white rounded-2xl px-5 py-4 border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all duration-300"
                                                                        >
                                                                            <div className="flex items-center space-x-4">
                                                                                <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                                                                                    {emp.name.split(' ').map(n => n[0]).join('')}
                                                                                </div>
                                                                                <div>
                                                                                    <p className="text-sm font-bold text-gray-900">{emp.name}</p>
                                                                                    <div className="flex items-center space-x-3 mt-0.5">
                                                                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{emp.employeeId}</span>
                                                                                        {emp.department !== 'N/A' && (
                                                                                            <>
                                                                                                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                                                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{emp.department}</span>
                                                                                            </>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex items-center space-x-3">
                                                                                <span className="text-xs font-medium text-gray-400">{emp.assignedAt}</span>
                                                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100">
                                                                                    1 Seat
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <div className="flex items-center space-x-3 bg-white rounded-2xl px-5 py-4 border border-dashed border-gray-200">
                                                                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-300">
                                                                        <User className="w-5 h-5" />
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-sm font-bold text-gray-500">No employees assigned</p>
                                                                        <p className="text-xs text-gray-400 mt-0.5">This license has no active seat assignments yet.</p>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                        </React.Fragment>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center justify-center text-gray-500 space-y-4">
                                                <div className="w-20 h-20 bg-gray-50 rounded-[2.5rem] flex items-center justify-center text-gray-300">
                                                    <Search className="w-10 h-10" />
                                                </div>
                                                <div>
                                                    <p className="text-lg font-bold text-gray-800">No licenses found</p>
                                                    <p className="text-sm font-medium text-gray-400 mt-1">Try adjusting your search or filters to find what you're looking for.</p>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
                
                {/* Pagination */}
                {!loading && filteredLicenses.length > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        itemsPerPage={itemsPerPage}
                        totalItems={filteredLicenses.length}
                        onPageChange={setCurrentPage}
                    />
                )}
            </div>

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
                itemTag={selectedDeleteLicense?.licenseKey}
                isDeleting={isDeleting}
            />

            <style>{`
                @keyframes slideDown {
                    from { opacity: 0; max-height: 0; }
                    to { opacity: 1; max-height: 600px; }
                }
            `}</style>
        </div>
    );
};

export default LicenseList;
