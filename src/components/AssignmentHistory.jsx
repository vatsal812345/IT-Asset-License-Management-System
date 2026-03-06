import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Loader, RefreshCw, AlertCircle, Monitor, KeyRound, ChevronDown, ChevronRight, Users, User } from 'lucide-react';
import api from '../utils/api';

const AssignmentHistory = () => {
    const [searchParams] = useSearchParams();
    const [activeView, setActiveView] = useState('assets');
    const [assignments, setAssignments] = useState([]);
    const [licenseData, setLicenseData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedRows, setExpandedRows] = useState({});

    // Check if navigated from License List with a specific license filter
    useEffect(() => {
        const licenseFilter = searchParams.get('license');
        if (licenseFilter) {
            setActiveView('licenses');
            setSearchQuery(licenseFilter);
        }
    }, [searchParams]);

    const fetchAssetHistory = async () => {
        setLoading(true);
        try {
            const response = await api.get('/assets');
            const data = response.data;

            if (data.success) {
                const historyData = data.data.filter(a => a.currentAssignedTo).map(a => ({
                    _id: a._id,
                    assetName: a.name,
                    assetTag: a.assetTag,
                    employeeName: a.currentAssignedTo.fullName,
                    date: new Date(a.updatedAt).toLocaleDateString(),
                    status: 'Assigned',
                    type: 'assignment'
                }));

                setAssignments(historyData);
            }
        } catch (error) {
            console.error('Error fetching asset history:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchLicenseHistory = async () => {
        setLoading(true);
        try {
            const response = await api.get('/licenses');
            const data = response.data;

            if (data.success) {
                // Store full license objects for utilization and expandable rows
                const processed = data.data.map(license => {
                    const assignedTo = license.assignedTo || [];
                    const usedSeats = license.usedSeats || 0;
                    const totalSeats = license.totalSeats || 1;
                    const percentage = Math.min(Math.round((usedSeats / totalSeats) * 100), 100);

                    // Extract employee info from assignedTo array
                    const employees = assignedTo
                        .filter(assignment => assignment.employee !== null)
                        .map(assignment => {
                            const emp = assignment.employee;
                            return {
                                _id: assignment._id || emp._id || Math.random().toString(),
                                name: emp.fullName || `${emp.firstName} ${emp.lastName}`,
                                employeeId: emp.employeeId || 'N/A',
                                department: emp.department || 'N/A',
                                assignedAt: new Date(assignment.assignedDate || license.updatedAt).toLocaleDateString(),
                            };
                        });

                    return {
                        _id: license._id,
                        licenseName: license.softwareName,
                        licenseKey: license.licenseKey,
                        vendor: license.vendor || 'Unknown',
                        status: license.status || 'Active',
                        usedSeats,
                        totalSeats,
                        percentage,
                        employees,
                        date: new Date(license.purchaseDate || license.createdAt || license.updatedAt).toLocaleDateString(),
                    };
                });
                setLicenseData(processed);
            }
        } catch (error) {
            console.error('Error fetching license history:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = () => {
        if (activeView === 'assets') {
            fetchAssetHistory();
        } else {
            fetchLicenseHistory();
        }
    };

    useEffect(() => {
        fetchAssetHistory();
    }, []);

    useEffect(() => {
        if (activeView === 'assets') {
            fetchAssetHistory();
        } else {
            fetchLicenseHistory();
        }
    }, [activeView]);

    const toggleRow = (id) => {
        setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const filteredAssetHistory = assignments.filter(item =>
        item.assetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.assetTag.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.employeeName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredLicenseHistory = licenseData.filter(item =>
        item.licenseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.licenseKey.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.vendor.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Utilization Bar Component
    const UtilizationBar = ({ used, total, percentage }) => {
        let barColor = 'bg-blue-500';
        if (percentage > 90) barColor = 'bg-red-500';
        else if (percentage > 70) barColor = 'bg-amber-500';

        return (
            <div className="w-full min-w-[120px]">
                <div className="flex justify-between text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
                    <span>{percentage}% Used</span>
                    <span>{used} / {total}</span>
                </div>
                <div className="h-2 w-full bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden border border-gray-50 dark:border-slate-700">
                    <div
                        className={`h-full ${barColor} rounded-full shadow-sm`}
                        style={{
                            width: `${percentage}%`,
                            transition: 'width 1s ease-out'
                        }}
                    />
                </div>
            </div>
        );
    };

    const getStatusBadge = (status) => {
        const styles = {
            'Active': 'bg-emerald-50 text-emerald-600 border border-emerald-100',
            'Expired': 'bg-red-50 text-red-600 border border-red-100',
            'Suspended': 'bg-yellow-50 text-yellow-600 border border-yellow-100',
            'Assigned': 'bg-amber-50 text-amber-600 border border-amber-100',
        };
        return styles[status] || 'bg-gray-50 text-gray-600 border border-gray-100';
    };

    return (
        <div className="p-4 md:p-8 bg-gray-50/30 dark:bg-dark-bg min-h-screen">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Assignment History</h1>
                        <p className="text-gray-500 dark:text-slate-400 mt-1">Track all asset movements, assignments, and returns.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Toggle Buttons */}
                        <div className="flex items-center bg-gray-100 dark:bg-slate-800 rounded-xl p-1">
                            <button
                                onClick={() => { setActiveView('assets'); setSearchQuery(''); }}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${activeView === 'assets'
                                        ? 'bg-white dark:bg-dark-card text-blue-600 dark:text-brand-primary shadow-sm'
                                        : 'text-gray-500 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-300'
                                    }`}
                            >
                                <Monitor className="w-4 h-4" />
                                <span>Asset History</span>
                            </button>
                            <button
                                onClick={() => { setActiveView('licenses'); setSearchQuery(''); }}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${activeView === 'licenses'
                                        ? 'bg-white dark:bg-dark-card text-indigo-600 dark:text-brand-primary shadow-sm'
                                        : 'text-gray-500 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-300'
                                    }`}
                            >
                                <KeyRound className="w-4 h-4" />
                                <span>License History</span>
                            </button>
                        </div>
                        <button
                            onClick={handleRefresh}
                            className="flex items-center space-x-2 bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border text-gray-600 dark:text-slate-300 px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:bg-gray-50 dark:hover:bg-slate-800 transition-all"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            <span>Refresh</span>
                        </button>
                    </div>
                </div>

                {/* Search */}
                <div className="bg-white dark:bg-dark-card p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border mb-8">
                    <div className="relative w-full">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder={activeView === 'assets'
                                ? 'Search by asset name, tag, or employee...'
                                : 'Search by license name, key, or vendor...'}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-indigo-500 dark:text-white outline-none transition-all placeholder:dark:text-slate-500"
                        />
                    </div>
                </div>

                {/* Content Area */}
                <div className="transition-all duration-500 ease-in-out">
                    {/* ========== ASSET HISTORY TABLE ========== */}
                    {activeView === 'assets' && (
                        <div className="bg-white dark:bg-dark-card rounded-3xl shadow-sm border border-gray-100 dark:border-dark-border overflow-hidden animate-fadeIn">
                            {loading ? (
                                <div className="flex items-center justify-center p-20">
                                    <Loader className="w-10 h-10 text-blue-500 animate-spin" />
                                </div>
                            ) : filteredAssetHistory.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50/50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-dark-border">
                                                <th className="px-8 py-5 text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">Asset</th>
                                                <th className="px-8 py-5 text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">Assigned To</th>
                                                <th className="px-8 py-5 text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">Date</th>
                                                <th className="px-8 py-5 text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                                            {filteredAssetHistory.map((item, index) => (
                                                <tr
                                                    key={index}
                                                    className="hover:bg-blue-50/30 dark:hover:bg-slate-800/30 transition-all duration-300 group cursor-default"
                                                >
                                                    <td className="px-8 py-5">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-bold text-gray-900 dark:text-white">{item.assetName}</span>
                                                            <span className="text-xs font-mono text-blue-600 dark:text-brand-primary bg-blue-50 dark:bg-slate-800 px-2 py-0.5 rounded w-fit mt-1">{item.assetTag}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <div className="flex items-center space-x-3">
                                                            <div className="w-8 h-8 rounded-full bg-linear-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                                                                {item.employeeName.split(' ').map(n => n[0]).join('')}
                                                            </div>
                                                            <span className="text-sm font-semibold text-gray-800 dark:text-slate-200">{item.employeeName}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <span className="text-sm text-gray-500 dark:text-slate-500 font-medium">{item.date}</span>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusBadge(item.status)}`}>
                                                            {item.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center p-20 text-center">
                                    <div className="w-16 h-16 bg-gray-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                        <AlertCircle className="w-8 h-8 text-gray-300 dark:text-slate-600" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">No Asset History Found</h3>
                                    <p className="text-gray-400 dark:text-slate-500 text-sm mt-1 max-w-xs">There are no asset assignment or return records matching your current filter.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ========== LICENSE HISTORY TABLE ========== */}
                    {activeView === 'licenses' && (
                        <div className="bg-white dark:bg-dark-card rounded-3xl shadow-sm border border-gray-100 dark:border-dark-border overflow-hidden animate-fadeIn">
                            {loading ? (
                                <div className="flex items-center justify-center p-20">
                                    <Loader className="w-10 h-10 text-indigo-500 animate-spin" />
                                </div>
                            ) : filteredLicenseHistory.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50/50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-dark-border">
                                                <th className="px-4 py-5 w-10"></th>
                                                <th className="px-4 py-5 text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">License</th>
                                                <th className="px-6 py-5 text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">Utilization</th>
                                                <th className="px-6 py-5 text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">Assigned To</th>
                                                <th className="px-6 py-5 text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">Date</th>
                                                <th className="px-6 py-5 text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                                            {filteredLicenseHistory.map((license, index) => (
                                                <React.Fragment key={license._id}>
                                                    {/* Main License Row */}
                                                    <tr
                                                        className="hover:bg-indigo-50/30 dark:hover:bg-slate-800/30 transition-all duration-300 group cursor-pointer"
                                                        onClick={() => toggleRow(license._id)}
                                                    >
                                                        {/* Expand/Collapse Icon */}
                                                        <td className="px-4 py-5">
                                                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-300 ${expandedRows[license._id]
                                                                    ? 'bg-indigo-100 dark:bg-slate-700 text-indigo-600 dark:text-brand-primary'
                                                                    : 'bg-gray-50 dark:bg-slate-800 text-gray-400 group-hover:bg-indigo-50 dark:group-hover:bg-slate-700 group-hover:text-indigo-500 dark:group-hover:text-brand-primary'
                                                                }`}>
                                                                {expandedRows[license._id]
                                                                    ? <ChevronDown className="w-4 h-4" />
                                                                    : <ChevronRight className="w-4 h-4" />
                                                                }
                                                            </div>
                                                        </td>
                                                        {/* License Name & Key */}
                                                        <td className="px-4 py-5">
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-brand-primary transition-colors">{license.licenseName}</span>
                                                                <span className="text-xs font-mono text-indigo-600 dark:text-brand-primary bg-indigo-50 dark:bg-slate-800 px-2 py-0.5 rounded w-fit mt-1">{license.licenseKey}</span>
                                                            </div>
                                                        </td>
                                                        {/* Utilization */}
                                                        <td className="px-6 py-5">
                                                            <UtilizationBar
                                                                used={license.usedSeats}
                                                                total={license.totalSeats}
                                                                percentage={license.percentage}
                                                            />
                                                        </td>
                                                        {/* Assigned To Summary */}
                                                        <td className="px-6 py-5">
                                                            {license.employees.length > 0 ? (
                                                                <div className="flex items-center space-x-2">
                                                                    <div className="w-8 h-8 rounded-full bg-linear-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                                                                        {license.employees[0].name.split(' ').map(n => n[0]).join('')}
                                                                    </div>
                                                                    <div className="flex flex-col">
                                                                        <span className="text-sm font-semibold text-gray-700 dark:text-slate-300">{license.employees[0].name}</span>
                                                                        {license.employees.length > 1 && (
                                                                            <span className="text-[10px] font-bold text-indigo-500 dark:text-brand-primary">+{license.employees.length - 1} more</span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="flex items-center space-x-2">
                                                                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-400 dark:text-slate-500">
                                                                        <Users className="w-4 h-4" />
                                                                    </div>
                                                                    <span className="text-sm font-medium text-gray-400 dark:text-slate-500">Unassigned</span>
                                                                </div>
                                                            )}
                                                        </td>
                                                        {/* Date */}
                                                        <td className="px-6 py-5">
                                                            <span className="text-sm text-gray-500 dark:text-slate-500 font-medium">{license.date}</span>
                                                        </td>
                                                        {/* Status */}
                                                        <td className="px-6 py-5">
                                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusBadge(license.status)}`}>
                                                                {license.status}
                                                            </span>
                                                        </td>
                                                    </tr>

                                                    {/* Expanded Employee Details */}
                                                    {expandedRows[license._id] && (
                                                        <tr>
                                                            <td colSpan="6" className="px-0 py-0">
                                                                <div className="bg-linear-to-b from-indigo-50/50 to-white dark:from-slate-800/50 dark:to-dark-card border-t border-indigo-100 dark:border-slate-700 animate-slideDown">
                                                                    <div className="px-12 py-5">
                                                                        <div className="flex items-center space-x-2 mb-4">
                                                                            <Users className="w-4 h-4 text-indigo-500 dark:text-brand-primary" />
                                                                            <span className="text-xs font-bold text-indigo-600 dark:text-brand-primary uppercase tracking-widest">
                                                                                Assigned Employees ({license.employees.length})
                                                                            </span>
                                                                        </div>
                                                                        {license.employees.length > 0 ? (
                                                                            <div className="grid gap-3">
                                                                                {license.employees.map((emp, i) => (
                                                                                    <div
                                                                                        key={emp._id}
                                                                                        className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-2xl px-5 py-4 border border-gray-100 dark:border-dark-border shadow-sm hover:shadow-md hover:border-indigo-100 dark:hover:border-slate-700 transition-all duration-300"
                                                                                        style={{ animationDelay: `${i * 80}ms` }}
                                                                                    >
                                                                                        <div className="flex items-center space-x-4">
                                                                                            <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                                                                                                {emp.name.split(' ').map(n => n[0]).join('')}
                                                                                            </div>
                                                                                            <div>
                                                                                                <p className="text-sm font-bold text-gray-900 dark:text-white">{emp.name}</p>
                                                                                                <div className="flex items-center space-x-3 mt-0.5">
                                                                                                    <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">{emp.employeeId}</span>
                                                                                                    {emp.department !== 'N/A' && (
                                                                                                        <>
                                                                                                            <span className="w-1 h-1 bg-gray-300 dark:bg-slate-600 rounded-full"></span>
                                                                                                            <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">{emp.department}</span>
                                                                                                        </>
                                                                                                    )}
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                        <div className="flex items-center space-x-3">
                                                                                            <span className="text-xs font-medium text-gray-400 dark:text-slate-500">{emp.assignedAt}</span>
                                                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50">
                                                                                                1 Seat
                                                                                            </span>
                                                                                        </div>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        ) : (
                                                                            <div className="flex items-center space-x-3 bg-white dark:bg-slate-800 rounded-2xl px-5 py-4 border border-dashed border-gray-200 dark:border-slate-700">
                                                                                <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-slate-900 flex items-center justify-center text-gray-300 dark:text-slate-600">
                                                                                    <User className="w-5 h-5" />
                                                                                </div>
                                                                                <div>
                                                                                    <p className="text-sm font-bold text-gray-500 dark:text-white">No employees assigned</p>
                                                                                    <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">This license has no active seat assignments yet.</p>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </React.Fragment>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center p-20 text-center">
                                    <div className="w-16 h-16 bg-gray-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                        <AlertCircle className="w-8 h-8 text-gray-300 dark:text-slate-600" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">No License History Found</h3>
                                    <p className="text-gray-400 dark:text-slate-500 text-sm mt-1 max-w-xs">There are no license records matching your current filter.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Animations */}
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.4s ease-out forwards;
                }
                @keyframes slideDown {
                    from { opacity: 0; max-height: 0; }
                    to { opacity: 1; max-height: 600px; }
                }
                .animate-slideDown {
                    animation: slideDown 0.35s ease-out forwards;
                    overflow: hidden;
                }
            `}</style>
        </div>
    );
};

export default AssignmentHistory;
