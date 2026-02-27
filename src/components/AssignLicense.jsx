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
    ShieldCheck
} from 'lucide-react';
import EmployeeAutocomplete from './EmployeeAutocomplete';

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
            const licensesRes = await fetch('http://localhost:5000/api/licenses');
            const licensesData = await licensesRes.json();
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
            const response = await fetch('http://localhost:5000/api/licenses/assign', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    licenseId: selectedLicenseId,
                    employeeId: formData.assignedToId,
                    assignmentDate: formData.assignmentDate,
                    notes: formData.notes
                }),
            });

            const data = await response.json();
            
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
        <div className="flex h-screen items-center justify-center">
            <Loader className="w-10 h-10 text-blue-500 animate-spin" />
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 flex flex-col">
                <div className="p-10 pb-4">
                    <div className="flex items-center space-x-3 mb-2">
                        <div className="p-2 bg-indigo-50 rounded-xl">
                            <ShieldCheck className="w-6 h-6 text-indigo-600" />
                        </div>
                        <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Provisioning</span>
                    </div>
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Assign License</h1>
                    <p className="text-gray-500 mt-2 font-medium">Provision software seats to organization employees.</p>
                </div>

                <form onSubmit={handleSubmit} className="p-10 pt-4 space-y-8">
                    {/* License Selection */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Select Software License</label>
                        <div className="relative group">
                            <select 
                                value={selectedLicenseId}
                                onChange={(e) => setSelectedLicenseId(e.target.value)}
                                className="w-full h-14 pl-5 pr-12 bg-gray-50 border border-gray-200 rounded-2xl appearance-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none font-bold text-gray-800"
                            >
                                <option value="" disabled>Select a license with available seats</option>
                                {availableLicenses.map(l => (
                                    <option key={l._id} value={l._id}>{l.softwareName} ({l.licenseKey}) - {l.totalSeats - (l.usedSeats || 0)} left</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-blue-500 transition-colors pointer-events-none" />
                        </div>
                    </div>

                    {/* Employee Autocomplete & ID */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Employee Name</label>
                            <EmployeeAutocomplete 
                                onSelect={handleEmployeeSelect}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Employee ID</label>
                            <input 
                                readOnly
                                type="text"
                                value={formData.employeeId}
                                placeholder="Auto-filled from selection"
                                className="w-full h-14 px-5 bg-gray-100 border border-gray-200 rounded-2xl outline-none font-bold text-gray-500 cursor-not-allowed"
                            />
                        </div>
                    </div>

                    {/* Department & Date */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Department</label>
                            <input 
                                readOnly
                                type="text"
                                value={formData.department}
                                placeholder="Auto-filled from selection"
                                className="w-full h-14 px-5 bg-gray-100 border border-gray-200 rounded-2xl outline-none font-bold text-gray-500 cursor-not-allowed"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Assignment Date</label>
                            <input 
                                type="date"
                                value={formData.assignmentDate}
                                onChange={(e) => setFormData({...formData, assignmentDate: e.target.value})}
                                className="w-full h-14 px-5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-bold text-gray-800 cursor-pointer"
                            />
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Notes</label>
                        <textarea 
                            rows="3"
                            value={formData.notes}
                            onChange={(e) => setFormData({...formData, notes: e.target.value})}
                            placeholder="Add any specific licensing notes or hardware restrictions..."
                            className="w-full p-5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium resize-none text-gray-800"
                        />
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-end gap-4 pt-4 pb-4">
                        <button 
                            type="button"
                            onClick={() => navigate(-1)}
                            className="px-8 py-4 bg-white text-gray-500 rounded-2xl font-bold text-sm hover:bg-gray-100 transition-all border border-gray-100"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            disabled={submitting || !isEmployeeSelected}
                            className={`px-10 py-4 rounded-2xl font-bold text-sm shadow-xl transition-all flex items-center gap-2 ${
                                submitting || !isEmployeeSelected 
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                : 'bg-linear-to-r from-blue-600 to-indigo-600 text-white shadow-blue-100 hover:shadow-blue-200 hover:scale-[1.02] active:scale-[0.98]'
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
