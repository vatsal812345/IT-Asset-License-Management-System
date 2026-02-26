import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Building2, Briefcase, Calendar, CheckCircle2, AlertCircle, Loader, ChevronDown } from 'lucide-react';
import ImageUpload from './ImageUpload';

const EmployeeForm = ({ isOpen, onClose, onSubmit, initialData }) => {
    const [formData, setFormData] = useState({
        employeeId: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        department: '',
        designation: '',
        joiningDate: new Date().toISOString().split('T')[0],
        status: 'Active',
        profileImageFile: null
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                joiningDate: initialData.joiningDate ? initialData.joiningDate.split('T')[0] : new Date().toISOString().split('T')[0],
            });
        } else {
            setFormData({
                employeeId: '',
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                department: '',
                designation: '',
                joiningDate: new Date().toISOString().split('T')[0],
                status: 'Active',
                profileImageFile: null
            });
        }
    }, [initialData, isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 animate-scale-up">
                {/* Header */}
                <div className="p-8 pb-4 relative">
                    <button
                        onClick={onClose}
                        className="absolute right-8 top-8 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
                    >
                        <X className="w-6 h-6" />
                    </button>
                    <div className="flex items-center space-x-3 mb-2">
                        <div className="p-2 bg-blue-50 rounded-xl">
                            <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">HR Management</span>
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                        {initialData ? 'Update Employee' : 'Add New Employee'}
                    </h2>
                    <p className="text-gray-500 mt-1 font-medium">Enter employee details to maintain your organization records.</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 pt-4 space-y-6 overflow-y-auto max-h-[70vh]">
                    <div className="mb-6">
                        <ImageUpload
                            label="Profile Picture"
                            fieldName="profileImage"
                            initialImage={initialData ? initialData.profileImage : null}
                            onFileSelect={(file) => {
                                setFormData(prev => ({ ...prev, profileImageFile: file }));
                            }}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Employee ID */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Employee ID</label>
                            <input
                                required
                                type="text"
                                value={formData.employeeId}
                                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                                placeholder="e.g. EMP007"
                                className="w-full h-12 px-5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-bold text-gray-800"
                            />
                        </div>

                        {/* Status */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="w-full h-12 px-5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-bold text-gray-800"
                            >
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                                {/* <option value="On Leave">On Leave</option>
                                <option value="Terminated">Terminated</option> */}
                            </select>
                        </div>

                        {/* First Name */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">First Name</label>
                            <input
                                required
                                type="text"
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                placeholder="e.g. Shah"
                                className="w-full h-12 px-5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-bold text-gray-800"
                            />
                        </div>

                        {/* Last Name */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Last Name</label>
                            <input
                                required
                                type="text"
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                placeholder="e.g. Jeet"
                                className="w-full h-12 px-5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-bold text-gray-800"
                            />
                        </div>

                        {/* Email */}
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    required
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="e.g. shah.jeet@company.com"
                                    className="w-full h-12 pl-12 pr-5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-bold text-gray-800"
                                />
                            </div>
                        </div>

                        {/* Phone */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                            <div className="relative">
                                <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="e.g. +1-555-1107"
                                    className="w-full h-12 pl-12 pr-5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-bold text-gray-800"
                                />
                            </div>
                        </div>

                        {/* Joining Date */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Joining Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                <input
                                    required
                                    type="date"
                                    value={formData.joiningDate}
                                    onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                                    className="w-full h-12 pl-12 pr-5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-bold text-gray-800 cursor-pointer"
                                />
                            </div>
                        </div>

                        {/* Department */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Department</label>
                            <div className="relative group">
                                <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors pointer-events-none z-10" />
                                <select
                                    required
                                    value={formData.department}
                                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                    className="w-full h-12 pl-12 pr-12 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-bold text-gray-800 appearance-none cursor-pointer"
                                >
                                    <option value="" disabled>Select Department</option>
                                    <option value="IT">IT</option>
                                    <option value="HR">HR</option>
                                    <option value="Finance">Finance</option>
                                    <option value="Marketing">Marketing</option>
                                    <option value="Sales">Sales</option>
                                    <option value="Operations">Operations</option>
                                    <option value="Engineering">Engineering</option>
                                    <option value="Design">Design</option>
                                    <option value="Customer Support">Customer Support</option>
                                    <option value="Administration">Administration</option>
                                    <option value="Other">Other</option>
                                </select>
                                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none group-hover:text-blue-500 transition-colors" />
                            </div>
                        </div>

                        {/* Designation */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Designation</label>
                            <div className="relative">
                                <Briefcase className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    required
                                    type="text"
                                    value={formData.designation}
                                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                                    placeholder="e.g. Accountant"
                                    className="w-full h-12 pl-12 pr-5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-bold text-gray-800"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end space-x-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-8 py-3.5 bg-white text-gray-500 rounded-2xl font-bold text-sm hover:bg-gray-50 transition-all border border-gray-100"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-10 py-3.5 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-blue-100 hover:shadow-blue-200 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
                        >
                            <CheckCircle2 className="w-5 h-5" />
                            <span>{initialData ? 'Update Employee' : 'Create Employee'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EmployeeForm;

