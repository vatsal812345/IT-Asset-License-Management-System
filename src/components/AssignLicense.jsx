import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import {
    X,
    Calendar as CalendarIcon,
    ChevronDown,
    Loader,
    AlertCircle,
    CheckCircle2,
    ShieldCheck,
    ArrowLeft
} from 'lucide-react';
import EmployeeAutocomplete from './EmployeeAutocomplete';
import api from '../utils/api';

const AssignLicense = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [license, setLicense] = useState(null);
    const [selectedLicenseId, setSelectedLicenseId] = useState(id || '');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [availableLicenses, setAvailableLicenses] = useState([]);
    const [isEmployeeSelected, setIsEmployeeSelected] = useState(false);

    const [formData, setFormData] = useState({
        employeeName: '',
        employeeId: '',
        assignedToId: '',
        department: '',
        assignmentDate: new Date().toISOString().split('T')[0],
        notes: ''
    });

    const fetchLicenses = async () => {
        try {
            const licensesRes = await api.get('/licenses');
            const licensesData = licensesRes.data;
            if (licensesData.success) {
                const available = licensesData.data.filter(l => l.status === 'Active' && (l.totalSeats - (l.usedSeats || 0)) > 0 || l._id === id);
                setAvailableLicenses(available);
                if (id) {
                    const current = available.find(l => l._id === id);
                    if (current) setSelectedLicenseId(current._id);
                }
            }
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLicenses();
    }, [id]);

    const handleEmployeeSelect = (employee) => {
        if (employee) {
            setFormData({
                ...formData,
                employeeName: `${employee.firstName} ${employee.lastName}`,
                employeeId: employee.employeeId,
                assignedToId: employee._id,
                department: employee.department
            });
            setIsEmployeeSelected(true);
        } else {
            setFormData({
                ...formData,
                employeeName: '',
                employeeId: '',
                assignedToId: '',
                department: ''
            });
            setIsEmployeeSelected(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!selectedLicenseId) {
            showToast('Please select a software license', 'error');
            return;
        }
        if (!formData.assignedToId) {
            showToast('Please select an employee', 'error');
            return;
        }

        setSubmitting(true);
        try {
            const response = await api.post('/licenses/assign', {
                licenseId: selectedLicenseId,
                employeeId: formData.assignedToId,
                assignmentDate: formData.assignmentDate,
                notes: formData.notes
            });

            const data = response.data;

            if (data.success) {
                showToast('License assigned successfully', 'success');

                // Reset Form
                setFormData({
                    employeeName: '',
                    employeeId: '',
                    assignedToId: '',
                    department: '',
                    assignmentDate: new Date().toISOString().split('T')[0],
                    notes: ''
                });
                setSelectedLicenseId('');
                setIsEmployeeSelected(false);

                // Re-fetch licenses to update counts in UI (dropdown)
                fetchLicenses();
            } else {
                showToast(data.message || 'Assignment failed', 'error');
            }
        } catch (err) {
            console.error('Error assigning license:', err);
            showToast('Failed to connect to server. Please try again.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-dark-bg transition-colors">
            <Loader className="w-10 h-10 text-blue-500 animate-spin" />
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex flex-col items-center justify-center p-4 transition-colors duration-500 font-sans">
            <div className="bg-white dark:bg-dark-card w-full max-w-4xl rounded-[2.5rem] shadow-2xl dark:shadow-none overflow-hidden border border-gray-100 dark:border-dark-border flex flex-col transition-colors">
                <div className="p-10 pb-4">
                    <div className="flex items-center space-x-5 mb-6">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-3 bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-2xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-all shadow-sm group"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                        </button>
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl transition-colors">
                                <ShieldCheck className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest transition-colors">Provisioning</span>
                        </div>
                    </div>
                    <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight transition-colors">Assign License</h1>
                    <p className="text-gray-500 dark:text-slate-400 mt-2 font-medium transition-colors">Provision software seats to organization employees.</p>
                </div>

                <form onSubmit={handleSubmit} className="p-10 pt-4 space-y-8">
                    {/* License Selection */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest ml-1 transition-colors">Select Software License</label>
                        <div className="relative group">
                            <select
                                value={selectedLicenseId}
                                onChange={(e) => setSelectedLicenseId(e.target.value)}
                                className="w-full h-14 pl-5 pr-12 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-dark-border rounded-2xl appearance-none focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/40 focus:border-blue-500 outline-none transition-all font-bold text-gray-800 dark:text-white transition-colors"
                            >
                                <option value="" disabled>Select a license with available seats</option>
                                {availableLicenses.map(l => (
                                    <option key={l._id} value={l._id}>{l.softwareName} ({l.licenseKey}) - {l.totalSeats - (l.usedSeats || 0)} left</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 group-hover:text-blue-500 transition-colors pointer-events-none" />
                        </div>
                    </div>

                    {/* Employee Autocomplete & ID */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest ml-1 transition-colors">Employee Name</label>
                            <EmployeeAutocomplete
                                onSelect={handleEmployeeSelect}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest ml-1 transition-colors">Employee ID</label>
                            <input
                                readOnly
                                type="text"
                                value={formData.employeeId}
                                placeholder="Auto-filled from selection"
                                className="w-full h-14 px-5 bg-gray-100 dark:bg-slate-900/50 border border-gray-200 dark:border-dark-border rounded-2xl outline-none font-bold text-gray-500 dark:text-slate-600 cursor-not-allowed transition-colors"
                            />
                        </div>
                    </div>

                    {/* Department & Date */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest ml-1 transition-colors">Department</label>
                            <input
                                readOnly
                                type="text"
                                value={formData.department}
                                placeholder="Auto-filled from selection"
                                className="w-full h-14 px-5 bg-gray-100 dark:bg-slate-900/50 border border-gray-200 dark:border-dark-border rounded-2xl outline-none font-bold text-gray-500 dark:text-slate-600 cursor-not-allowed transition-colors"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest ml-1 transition-colors">Assignment Date</label>
                            <input
                                type="date"
                                value={formData.assignmentDate}
                                onChange={(e) => setFormData({ ...formData, assignmentDate: e.target.value })}
                                className="w-full h-14 px-5 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-dark-border rounded-2xl focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/40 focus:border-blue-500 outline-none transition-all font-bold text-gray-800 dark:text-white cursor-pointer color-scheme-dark transition-colors"
                            />
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest ml-1 transition-colors">Notes</label>
                        <textarea
                            rows="3"
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="Add any specific licensing notes or hardware restrictions..."
                            className="w-full p-5 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-dark-border rounded-2xl focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/40 focus:border-blue-500 outline-none transition-all font-medium resize-none text-gray-800 dark:text-white transition-colors"
                        />
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-end gap-4 pt-4 pb-4">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="px-8 py-4 bg-white dark:bg-dark-card text-gray-500 dark:text-slate-400 rounded-2xl font-bold text-sm hover:bg-gray-100 dark:hover:bg-slate-800 transition-all border border-gray-100 dark:border-dark-border transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting || !isEmployeeSelected}
                            className={`px-10 py-4 rounded-2xl font-bold text-sm shadow-xl transition-all flex items-center gap-2 ${submitting || !isEmployeeSelected
                                    ? 'bg-gray-300 dark:bg-slate-800 text-gray-500 dark:text-slate-600 cursor-not-allowed shadow-none'
                                    : 'bg-linear-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 text-white shadow-blue-100 dark:shadow-none hover:shadow-blue-200 hover:scale-[1.02] active:scale-[0.98]'
                                }`}
                        >
                            {submitting ? <Loader className="w-5 h-5 animate-spin" /> : (
                                <>
                                    <CheckCircle2 className="w-5 h-5" />
                                    <span>Assign License</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AssignLicense;
