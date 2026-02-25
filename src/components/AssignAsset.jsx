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
    Box,
    UserPlus,
    Clock,
    Tag
} from 'lucide-react';
import EmployeeAutocomplete from './EmployeeAutocomplete';

const AssignAsset = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [selectedAssetId, setSelectedAssetId] = useState(id || '');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [availableAssets, setAvailableAssets] = useState([]);
    const [isEmployeeSelected, setIsEmployeeSelected] = useState(false);

    const [formData, setFormData] = useState({
        employeeName: '',
        employeeId: '',
        department: '',
        assignedToId: '', // Added to store internal _id
        assignmentDate: new Date().toISOString().split('T')[0],
        notes: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const assetsRes = await fetch('https://itam-backend.onrender.com/api/assets');
                const assetsData = await assetsRes.json();
                if (assetsData.success) {
                    const available = assetsData.data.filter(a => a.status === 'Available' || a._id === id);
                    setAvailableAssets(available);
                    if (id && id !== 'any') {
                        const current = available.find(a => a._id === id);
                        if (current) setSelectedAssetId(current._id);
                    }                                                                
                }
            } catch (err) {
                console.error('Error fetching data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleEmployeeSelect = (employee) => {
        if (employee) {
            setFormData({
                ...formData,
                employeeName: `${employee.firstName} ${employee.lastName}`,
                employeeId: employee.employeeId,
                department: employee.department,
                assignedToId: employee._id // Store MongoDB _id
            });
            setIsEmployeeSelected(true);
        } else {
            setFormData({
                ...formData,
                employeeName: '',
                employeeId: '',
                department: '',
                assignedToId: ''
            });
            setIsEmployeeSelected(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedAssetId || selectedAssetId === 'any') return alert('Please select an asset');
        if (!formData.assignedToId) return alert('Please select an employee');
        
        setSubmitting(true);
        try {
            // Using the new centralized assignments endpoint
            const response = await fetch(`https://itam-backend.onrender.com/api/assignments/assign`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    assetId: selectedAssetId, // Include assetId explicitly
                    employeeId: formData.assignedToId, // Changed from assignedTo to employeeId
                    notes: formData.notes,
                    assignmentDate: formData.assignmentDate
                }),
            });

            const data = await response.json();
            if (data.success) {
                showToast('Asset assigned successfully', 'success');
                // Return to asset list or details
                navigate('/assets');
            } else {
                showToast(data.message || 'Assignment failed', 'error');
            }
        } catch (err) {
            console.error('Error assigning asset:', err);
            showToast('Failed to connect to server. Please try again.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="flex h-screen items-center justify-center bg-gray-50">
            <Loader className="w-10 h-10 text-blue-500 animate-spin" />
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 flex flex-col">
                <div className="p-10 pb-4">
                    <div className="flex items-center space-x-3 mb-2">
                        <div className="p-2 bg-blue-50 rounded-xl">
                            <UserPlus className="w-6 h-6 text-blue-600" />
                        </div>
                        <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Asset Management</span>
                    </div>
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Assign Asset</h1>
                    <p className="text-gray-500 mt-2 font-medium">Link hardware assets to organization employees.</p>
                </div>

                <form onSubmit={handleSubmit} className="p-10 pt-4 space-y-8">
                    {/* Select Asset */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Select Hardware Asset</label>
                        <div className="relative group">
                            <select 
                                value={selectedAssetId}
                                onChange={(e) => setSelectedAssetId(e.target.value)}
                                className="w-full h-14 pl-12 pr-12 bg-gray-50 border border-gray-200 rounded-2xl appearance-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none font-bold text-gray-800"
                            >
                                <option value="" disabled>Select an available asset</option>
                                <option value="any" disabled>Choose from inventory</option>
                                {availableAssets.map(a => (
                                    <option key={a._id} value={a._id}>{a.name} ({a.assetTag})</option>
                                ))}
                            </select>
                            <Box className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors pointer-events-none" />
                            <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-blue-500 transition-colors pointer-events-none" />
                        </div>
                    </div>

                    {/* Employee Selection */}
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
                                placeholder="Auto-filled"
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
                                placeholder="Auto-filled"
                                className="w-full h-14 px-5 bg-gray-100 border border-gray-200 rounded-2xl outline-none font-bold text-gray-500 cursor-not-allowed"
                            />
                        </div>
                        <div className="space-y-2 relative">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Assignment Date</label>
                            <div className="relative">
                                <input 
                                    type="date"
                                    value={formData.assignmentDate}
                                    onChange={(e) => setFormData({...formData, assignmentDate: e.target.value})}
                                    className="w-full h-14 px-5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-bold text-gray-800"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Notes</label>
                        <textarea 
                            rows="3"
                            value={formData.notes}
                            onChange={(e) => setFormData({...formData, notes: e.target.value})}
                            placeholder="Add hardware condition, setup notes, or special instructions..."
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
                            disabled={submitting || !isEmployeeSelected || !selectedAssetId}
                            className={`px-10 py-4 rounded-2xl font-bold text-sm shadow-xl transition-all flex items-center gap-2 ${
                                submitting || !isEmployeeSelected || !selectedAssetId
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                : 'bg-linear-to-r from-blue-600 to-indigo-600 text-white shadow-blue-100 hover:shadow-blue-200 hover:scale-[1.02] active:scale-[0.98]'
                            }`}
                        >
                            {submitting ? <Loader className="w-5 h-5 animate-spin" /> : (
                                <>
                                    <CheckCircle2 className="w-5 h-5" />
                                    <span>Assign Asset</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AssignAsset;
