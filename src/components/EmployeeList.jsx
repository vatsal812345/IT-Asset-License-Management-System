
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { Search, Plus, Filter, Edit, Trash2, Loader, Users, Mail, Phone, Building2, Briefcase, UserPlus, Eye, Download } from 'lucide-react';
import EmployeeForm from './EmployeeForm';
import DeleteConfirmModal from './DeleteConfirmModal';
import Pagination from './Pagination';
import { exportToCSV, formatDateForCSV } from '../utils/csvExport';
import getDisplayImageUrl from '../utils/imageUtils';


const EmployeeList = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [employees, setEmployees] = useState([]);
    const [filteredEmployees, setFilteredEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [deptFilter, setDeptFilter] = useState('All');

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedDeleteEmployee, setSelectedDeleteEmployee] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [isExporting, setIsExporting] = useState(false);
    const itemsPerPage = 10;

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/employees');
            const data = await response.json();
            if (data.success) {
                setEmployees(data.data);
                setFilteredEmployees(data.data);
            }
        } catch (error) {
            console.error('Error fetching employees:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    useEffect(() => {
        let result = [...employees];

        // Sort by updatedAt (descending) to show newest/most recently edited at the top
        result.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

        if (deptFilter !== 'All') {
            result = result.filter(emp => emp.department === deptFilter);
        }
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(emp =>
                emp.firstName.toLowerCase().includes(query) ||
                emp.lastName.toLowerCase().includes(query) ||
                emp.employeeId.toLowerCase().includes(query) ||
                emp.email.toLowerCase().includes(query)
            );
        }
        setFilteredEmployees(result);
        setCurrentPage(1); // Reset to first page when filters change
    }, [employees, searchQuery, deptFilter]);

    const handleCreateUpdate = async (formData) => {
        try {
            const url = editingEmployee
                ? `http://localhost:5000/api/employees/${editingEmployee._id}`
                : 'http://localhost:5000/api/employees';

            const method = editingEmployee ? 'PUT' : 'POST';

            // Extract the file (stored as profileImageFile by EmployeeForm)
            const imageFile = formData.profileImageFile || null;

            let response;

            if (imageFile) {
                // ── Send as multipart/form-data so Multer can receive req.file ──
                const payload = new FormData();

                // Append every scalar field
                const scalarFields = { ...formData };
                delete scalarFields.profileImageFile; // don't double-send the file
                // profileImage may already be a Cloudinary URL on update; skip if sending file
                delete scalarFields.profileImage;

                for (const [key, value] of Object.entries(scalarFields)) {
                    if (value !== null && value !== undefined) {
                        payload.append(key, value);
                    }
                }

                // Append the actual file under the field name Multer expects
                payload.append('profileImage', imageFile);

                response = await fetch(url, { method, body: payload });
            } else {
                // ── No new file — send as JSON ──
                const body = { ...formData };
                delete body.profileImageFile;

                // Safeguard: ensure profileImage is a plain string
                if (body.profileImage && typeof body.profileImage === 'object') {
                    body.profileImage = body.profileImage.url || body.profileImage.profileImage || '';
                }

                response = await fetch(url, {
                    method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body),
                });
            }

            const data = await response.json();
            if (data.success) {
                fetchEmployees();
                setIsFormOpen(false);
                setEditingEmployee(null);
                showToast(
                    editingEmployee
                        ? 'Employee updated successfully'
                        : 'New employee created successfully',
                    'success'
                );
            } else {
                showToast(data.message || 'Operation failed', 'error');
            }
        } catch (error) {
            console.error('Error saving employee:', error);
            showToast('Failed to save employee. Please try again.', 'error');
        }
    };

    const handleDeleteClick = (employee) => {
        setSelectedDeleteEmployee(employee);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!selectedDeleteEmployee) return;
        setIsDeleting(true);
        try {
            const response = await fetch(`http://localhost:5000/api/employees/${selectedDeleteEmployee._id}`, {
                method: 'DELETE',
            });
            const data = await response.json();
            if (data.success) {
                fetchEmployees();
                setIsDeleteModalOpen(false);
                setSelectedDeleteEmployee(null);
                showToast('Employee deleted successfully', 'success');
            } else {
                showToast(data.message || 'Error deleting employee', 'error');
            }
        } catch (error) {
            console.error('Error deleting employee:', error);
            showToast('Failed to delete employee. Please try again.', 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Active': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'Inactive': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'On Leave': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Terminated': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    // CSV Export Handler
    const handleExportCSV = () => {
        setIsExporting(true);
        try {
            const columns = [
                { key: 'employeeId', header: 'Employee ID' },
                { key: 'firstName', header: 'First Name' },
                { key: 'lastName', header: 'Last Name' },
                { key: 'email', header: 'Email' },
                { key: 'phone', header: 'Phone' },
                { key: 'department', header: 'Department' },
                { key: 'designation', header: 'Designation' },
                { key: 'status', header: 'Status' },
                { key: 'joiningDate', header: 'Joining Date', accessor: (emp) => formatDateForCSV(emp.joiningDate) },
            ];

            const filename = `employees_export_${new Date().toISOString().split('T')[0]}.csv`;
            exportToCSV(filteredEmployees, columns, filename);
        } catch (error) {
            console.error('Export failed:', error);
        } finally {
            setIsExporting(false);
        }
    };

    // Pagination calculations
    const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentEmployees = filteredEmployees.slice(startIndex, endIndex);

    const departments = ['All', ...new Set(employees.map(emp => emp.department))];

    return (
        <div className="p-4 md:p-8 bg-gray-50/30 min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Organization Employees</h1>
                    <p className="text-gray-500 mt-1 font-medium">Manage and track all employees within the organization.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <button
                        onClick={handleExportCSV}
                        disabled={isExporting || filteredEmployees.length === 0}
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
                        onClick={() => {
                            setEditingEmployee(null);
                            setIsFormOpen(true);
                        }}
                        className="flex items-center space-x-2 bg-linear-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-2xl font-bold shadow-xl shadow-blue-100 hover:shadow-blue-200 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 w-full md:w-auto justify-center"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Add New Employee</span>
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between px-6">
                <div className="relative w-full md:w-96 group">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-300 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search by ID, name, or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all duration-300 font-medium text-gray-800 placeholder:text-gray-300"
                    />
                </div>
                <div className="flex items-center space-x-3 w-full md:w-auto">
                    <div className="flex items-center space-x-2 text-gray-400 px-2">
                        <Filter className="w-5 h-5" />
                        <span className="text-xs font-bold uppercase tracking-widest">Department</span>
                    </div>
                    <select
                        value={deptFilter}
                        onChange={(e) => setDeptFilter(e.target.value)}
                        className="px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none cursor-pointer transition-all duration-300 font-medium text-gray-800 min-w-[160px]"
                    >
                        {departments.map(dept => (
                            <option key={dept} value={dept}>{dept}</option>
                        ))}
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
                                    <th className="px-8 py-5 text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em]">Employee</th>
                                    <th className="px-8 py-5 text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em]">Contact & ID</th>
                                    <th className="px-8 py-5 text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em]">Dept & Role</th>
                                    <th className="px-8 py-5 text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em]">Status</th>
                                    <th className="px-8 py-5 text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em]">Joining Date</th>
                                    <th className="px-8 py-5 text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em] text-right">Actions</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-50">
                                {currentEmployees.length > 0 ? (
                                    currentEmployees.map((emp, index) => (
                                        <tr
                                            key={emp._id}
                                            className="hover:bg-blue-50/40 transition-colors group cursor-pointer"
                                        >
                                            <td className="px-8 py-6">
                                                <div className="flex items-center space-x-4">
                                                    <div className="w-12 h-12 bg-blue-50 rounded-2xl overflow-hidden flex items-center justify-center text-blue-600 border border-blue-100 group-hover:bg-white transition-colors shrink-0">
                                                        {emp.profileImage ? (
                                                            <img src={getDisplayImageUrl(emp.profileImage)} alt={emp.fullName} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span className="text-lg font-bold">{emp.firstName.charAt(0)}{emp.lastName.charAt(0)}</span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-extrabold text-gray-900 group-hover:text-blue-600 transition-colors">{emp.firstName} {emp.lastName}</p>
                                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-0.5">{emp.employeeId}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col space-y-1">
                                                    <div className="flex items-center space-x-2 text-xs font-bold text-gray-600">
                                                        <Mail className="w-3 h-3 text-gray-400" />
                                                        <span>{emp.email}</span>
                                                    </div>
                                                    {emp.phone && (
                                                        <div className="flex items-center space-x-2 text-xs font-bold text-gray-400">
                                                            <Phone className="w-3 h-3" />
                                                            <span>{emp.phone}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col">
                                                    <div className="flex items-center space-x-2 text-sm font-bold text-gray-700">
                                                        <Building2 className="w-4 h-4 text-gray-300" />
                                                        <span>{emp.department}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-2 text-xs text-gray-400 font-medium mt-1">
                                                        <Briefcase className="w-3 h-3" />
                                                        <span>{emp.designation}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${getStatusColor(emp.status)}`}>
                                                    {emp.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="text-sm font-bold text-gray-700">{new Date(emp.joiningDate).toLocaleDateString()}</span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex items-center justify-end space-x-2 transition-opacity">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setEditingEmployee(emp);
                                                            setIsFormOpen(true);
                                                        }}
                                                        className="p-3 text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-2xl hover:bg-indigo-600 hover:text-white hover:border-indigo-600 hover:shadow-lg hover:shadow-indigo-200 transition-all duration-300"
                                                        title="View"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setEditingEmployee(emp);
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
                                                            handleDeleteClick(emp);
                                                        }}
                                                        className="p-3 text-red-500 bg-red-50 border border-red-100 rounded-2xl hover:bg-red-500 hover:text-white hover:border-red-500 hover:shadow-lg hover:shadow-red-200 transition-all duration-300"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center justify-center text-gray-500 space-y-4">
                                                <div className="w-20 h-20 bg-gray-50 rounded-[2.5rem] flex items-center justify-center text-gray-300">
                                                    <Users className="w-10 h-10" />
                                                </div>
                                                <div>
                                                    <p className="text-lg font-bold text-gray-800">No employees found</p>
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
                {!loading && filteredEmployees.length > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        itemsPerPage={itemsPerPage}
                        totalItems={filteredEmployees.length}
                        onPageChange={setCurrentPage}
                    />
                )}
            </div>

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
                title="Delete Employee?"
                itemName={`${selectedDeleteEmployee?.firstName} ${selectedDeleteEmployee?.lastName}`}
                itemTag={selectedDeleteEmployee?.employeeId}
                isDeleting={isDeleting}
            />
        </div>
    );
};

export default EmployeeList;
