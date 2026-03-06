import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Search, Plus, Filter, Edit, Trash2, Loader, User, Mail, Building, ExternalLink, Download, Contact } from 'lucide-react';
import EmployeeForm from './EmployeeForm';
import DeleteConfirmModal from './DeleteConfirmModal';
import Pagination from './Pagination';
import { exportToCSV, formatDateForCSV } from '../utils/csvExport';
import api from '../utils/api';
import { getDisplayImageUrl } from '../utils/imageUtils';

const EmployeeList = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [employees, setEmployees] = useState([]);
    const [filteredEmployees, setFilteredEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedDeleteEmployee, setSelectedDeleteEmployee] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [isExporting, setIsExporting] = useState(false);
    const itemsPerPage = 5;

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const response = await api.get('/employees');
            const data = response.data;
            if (data.success) {
                setEmployees(data.data);
                setFilteredEmployees(data.data);
            }
        } catch (error) {
            console.error('Error fetching employees:', error);
            showToast('Failed to load employee directory', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    useEffect(() => {
        let result = [...employees];

        // Sort by updatedAt (descending) 
        result.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

        if (roleFilter !== 'All') {
            result = result.filter(emp => emp.role === roleFilter);
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(emp =>
                emp.fullName.toLowerCase().includes(query) ||
                emp.email.toLowerCase().includes(query) ||
                emp.employeeId.toLowerCase().includes(query) ||
                emp.department.toLowerCase().includes(query)
            );
        }

        setFilteredEmployees(result);
        setCurrentPage(1);
    }, [employees, searchQuery, roleFilter]);

    const handleCreateUpdate = async (formData) => {
        try {
            const data = new FormData();
            
            // Append all form fields to FormData
            Object.keys(formData).forEach(key => {
                if (key === 'profileImageFile' && formData[key]) {
                    data.append('profileImage', formData[key]);
                } else if (key !== 'profileImage' && key !== 'profileImageFile') {
                    // Only append if value exists to avoid null strings
                    if (formData[key] !== null && formData[key] !== undefined) {
                        data.append(key, formData[key]);
                    }
                }
            });

            const config = {
                headers: { 'Content-Type': 'multipart/form-data' }
            };

            let response;
            if (editingEmployee) {
                response = await api.put(`/employees/${editingEmployee._id}`, data, config);
            } else {
                response = await api.post('/employees', data, config);
            }

            const resData = response.data;
            if (resData.success) {
                fetchEmployees();
                setIsFormOpen(false);
                setEditingEmployee(null);
                showToast(
                    editingEmployee ? 'Profile updated successfully' : 'New employee onboarded successfully',
                    'success'
                );
            } else {
                showToast(resData.message || 'Operation failed', 'error');
            }
        } catch (error) {
            console.error('Error saving employee:', error);
            showToast('Connection failed. Please retry.', 'error');
        }
    };

    const handleDeleteClick = (emp) => {
        setSelectedDeleteEmployee(emp);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!selectedDeleteEmployee) return;

        setIsDeleting(true);
        try {
            const response = await api.delete(`/employees/${selectedDeleteEmployee._id}`);
            const data = response.data;
            if (data.success) {
                fetchEmployees();
                setIsDeleteModalOpen(false);
                setSelectedDeleteEmployee(null);
                showToast('Employee record removed', 'success');
            } else {
                showToast(data.message || 'Error removing record', 'error');
            }
        } catch (error) {
            console.error('Error deleting employee:', error);
            showToast('System error during deletion', 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleExportCSV = () => {
        setIsExporting(true);
        try {
            const columns = [
                { key: 'employeeId', header: 'ID' },
                { key: 'fullName', header: 'Full Name' },
                { key: 'email', header: 'Email' },
                { key: 'department', header: 'Department' },
                { key: 'designation', header: 'Designation' },
                { key: 'role', header: 'System Role' },
                { 
                    key: 'joinDate', 
                    header: 'Join Date',
                    accessor: (emp) => formatDateForCSV(emp.joinDate)
                }
            ];

            const filename = `directory_export_${new Date().toISOString().split('T')[0]}.csv`;
            exportToCSV(filteredEmployees, columns, filename);
        } catch (error) {
            console.error('Export failed:', error);
        } finally {
            setIsExporting(false);
        }
    };

    // Pagination
    const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
    const currentEmployees = filteredEmployees.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="p-8 animate-fade-in-up transition-colors duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-1 bg-brand-primary rounded-full"></div>
                        <span className="text-brand-primary font-bold text-[10px] uppercase tracking-widest">Internal Directory</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight transition-colors">Employees</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium mt-1 transition-colors">Manage organizational access and personnel assignment attributes.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <button
                        onClick={handleExportCSV}
                        disabled={isExporting || filteredEmployees.length === 0}
                        className="flex items-center justify-center space-x-2 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border text-slate-600 dark:text-slate-300 px-6 py-3 rounded-2xl font-bold text-sm shadow-premium hover:shadow-hover hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                        {isExporting ? <Loader className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5 group-hover:scale-110 transition-transform" />}
                        <span>{isExporting ? 'Exporting...' : 'Export Directory'}</span>
                    </button>
                    {user?.role === 'Admin' && (
                        <button
                            onClick={() => {
                                setEditingEmployee(null);
                                setIsFormOpen(true);
                            }}
                            className="flex items-center space-x-2 bg-brand-primary text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-premium shadow-indigo-200 dark:shadow-none hover:shadow-hover hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 active:scale-95 w-full md:w-auto justify-center group"
                        >
                            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                            <span>Register New Employee</span>
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
                        placeholder="Search by name, ID, or department..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50/50 dark:bg-slate-800/50 border border-transparent dark:border-dark-border rounded-2xl focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/20 focus:border-blue-500 outline-none transition-all duration-300 font-bold text-gray-800 dark:text-white placeholder:text-gray-300 dark:placeholder:text-slate-600"
                    />
                </div>
                <div className="flex items-center space-x-4 w-full md:w-auto">
                    <div className="flex items-center space-x-2 text-gray-400 dark:text-slate-500 px-2 font-bold uppercase tracking-widest text-[10px]">
                        <Filter className="w-4 h-4 text-blue-500" />
                        <span>Filter Role</span>
                    </div>
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="px-6 py-3.5 bg-gray-50/50 dark:bg-slate-800/50 border border-transparent dark:border-dark-border rounded-2xl focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/20 focus:border-blue-500 outline-none cursor-pointer transition-all duration-300 font-bold text-sm text-gray-800 dark:text-white min-w-[160px]"
                    >
                        <option value="All">All Roles</option>
                        <option value="Admin">Admin</option>
                        <option value="Manager">Manager</option>
                        <option value="Employee">Employee</option>
                    </select>
                </div>
            </div>

            {/* Results Count */}
            {!loading && filteredEmployees.length > 0 && (
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
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Employee</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">ID / Department</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] text-center">Status</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Contact</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-dark-border transition-colors">
                                {currentEmployees.length > 0 ? (
                                    currentEmployees.map((emp, index) => (
                                        <tr 
                                            key={emp._id} 
                                            className="hover:bg-blue-50/40 dark:hover:bg-slate-800/40 transition-all duration-300 group"
                                        >
                                            <td className="px-8 py-6">
                                                <div className="flex items-center space-x-4">
                                                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-sm font-black shadow-lg shrink-0 group-hover:scale-105 transition-transform duration-500 overflow-hidden bg-linear-to-tr from-blue-500 to-indigo-600">
                                                        {emp.profileImage ? (
                                                            <img 
                                                                src={getDisplayImageUrl(emp.profileImage)} 
                                                                alt={emp.fullName} 
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    e.target.onerror = null;
                                                                    e.target.src = ''; // Clear source to show fallback (initials)
                                                                }}
                                                            />
                                                        ) : (
                                                            <span>{emp.firstName.charAt(0)}{emp.lastName.charAt(0)}</span>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col">

                                                        <span className="text-sm font-black text-slate-900 dark:text-slate-200 transition-colors">{emp.fullName}</span>
                                                        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">{emp.designation}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-black font-mono text-slate-900 dark:text-slate-400 transition-colors uppercase tracking-wider">{emp.employeeId}</span>
                                                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">{emp.department}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex justify-center">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${
                                                        emp.status === 'Active' 
                                                        ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' 
                                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                                                    }`}>
                                                        {emp.status || 'Active'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col space-y-1">
                                                    <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400">
                                                        <Mail className="w-3.5 h-3.5" />
                                                        <span className="text-xs font-bold">{emp.email}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-2 text-slate-400 dark:text-slate-500">
                                                        <Contact className="w-3.5 h-3.5" />
                                                        <span className="text-[10px] font-bold">{emp.phoneNumber || 'No contact info'}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {user?.role === 'Admin' && (
                                                        <>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setEditingEmployee(emp);
                                                                    setIsFormOpen(true);
                                                                }}
                                                                className="p-3 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-2xl hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500 transition-all duration-300"
                                                                title="Edit Profile"
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDeleteClick(emp);
                                                                }}
                                                                className="p-3 text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-2xl hover:bg-red-500 hover:text-white dark:hover:bg-red-500 transition-all duration-300"
                                                                title="Delete Record"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </>
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
                                                    <User className="w-10 h-10" />
                                                </div>
                                                <div>
                                                    <p className="text-xl font-black text-slate-900 dark:text-white transition-colors">No personnel records found</p>
                                                    <p className="font-medium mt-2">Start by onboarding your first team member.</p>
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
            {!loading && filteredEmployees.length > 0 && (
                <div className="mt-10">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        itemsPerPage={itemsPerPage}
                        totalItems={filteredEmployees.length}
                        onPageChange={setCurrentPage}
                    />
                </div>
            )}

            <EmployeeForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSubmit={handleCreateUpdate}
                initialData={editingEmployee}
            />

            <DeleteConfirmModal 
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Remove Employee?"
                itemName={selectedDeleteEmployee?.fullName}
                itemTag={selectedDeleteEmployee?.employeeId}
                isDeleting={isDeleting}
            />
        </div>
    );
};

export default EmployeeList;
