import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Box, 
    CheckCircle, 
    User, 
    Wrench, 
    Loader, 
    ArrowUpRight, 
    Plus, 
    UserPlus, 
    Clock,
    Tag,
    History,
    ShieldCheck,
    ShieldAlert,
    ShieldX,
    BarChart3,
    Activity,
    Smartphone,
    Monitor,
    Laptop,
    AlertTriangle,
    AlertCircle,
    CheckCircle2,
    XCircle
} from 'lucide-react';
import { 
    PieChart, 
    Pie, 
    Cell, 
    ResponsiveContainer, 
    Tooltip, 
    Legend,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid
} from 'recharts';
import { getExpiryStatus, calculateExpiryStats } from '../utils/warrantyUtils';
import AssetForm from './AssetForm';

//header cards
const StatCard = ({ title, value, icon: Icon, color, onClick }) => (
  <div 
    onClick={onClick}
    className="bg-white p-8 rounded-3xl shadow-premium border border-slate-50 flex flex-col gap-6 transition-all duration-500 hover:shadow-hover hover:-translate-y-2 cursor-pointer group relative overflow-hidden"
  >
    <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-indigo-50/50 to-transparent rounded-full -mr-16 -mt-16 transition-transform duration-700 group-hover:scale-150"></div>
    
    <div className={`w-14 h-14 rounded-2xl ${color.bg} flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 relative z-10`}>
      <Icon className={`w-7 h-7 ${color.text}`} />
    </div>
    
    <div className="relative z-10">
      <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">{title}</p>
      <div className="flex items-baseline gap-2">
        <p className="text-4xl font-black text-slate-900 tracking-tight group-hover:text-brand-primary transition-colors duration-300">{value}</p>
        <ArrowUpRight className="w-5 h-5 text-indigo-200 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0" />
      </div>
    </div>
  </div>
);

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalAssets: 0,
        available: 0,
        assigned: 0,
        underRepair: 0,
        totalLicenses: 0,
        expiringLicenses: 0
    });
    const [warrantyStats, setWarrantyStats] = useState({
        assets: { active: 0, expiring: 0, expired: 0, noDate: 0 },
        licenses: { active: 0, expiring: 0, expired: 0, noDate: 0 }
    });
    const [expiringItems, setExpiringItems] = useState({ assets: [], licenses: [] });
    const [licenseStats, setLicenseStats] = useState([]);
    const [recentActivities, setRecentActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAssetFormOpen, setIsAssetFormOpen] = useState(false);
    const navigate = useNavigate();

    const fetchData = async () => {
        try {
            const statsRes = await fetch('http://localhost:5000/api/dashboard/stats');
            const statsData = await statsRes.json();
            
            if (statsData.success) {
                setStats({
                    totalAssets: statsData.data.assets.total || 0,
                    available: statsData.data.assets.byStatus.Available || 0,
                    assigned: statsData.data.assets.byStatus.Assigned || 0,
                    underRepair: statsData.data.assets.byStatus['Under Repair'] || 0,
                });
            }

            const licensesRes = await fetch('http://localhost:5000/api/licenses');
            const licensesData = await licensesRes.json();
            if (licensesData.success) {
                const total = licensesData.data.length;
                const expiring = licensesData.data.filter(l => new Date(l.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)).length;
                setStats(prev => ({
                    ...prev,
                    totalLicenses: total,
                    expiringLicenses: expiring
                }));
                // Get top 3 utilized licenses
                const utilized = [...licensesData.data]
                    .sort((a, b) => ((b.usedSeats || 0) / b.totalSeats) - ((a.usedSeats || 0) / a.totalSeats))
                    .slice(0, 4);
                setLicenseStats(utilized);
            }

            const assetsRes = await fetch('http://localhost:5000/api/assets');
            const assetsData = await assetsRes.json();
            if (assetsData.success) {
                const sorted = [...assetsData.data]
                    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
                    .slice(0, 5);
                setRecentActivities(sorted);
                
                // Calculate warranty statistics for assets
                const assetWarrantyStats = calculateExpiryStats(assetsData.data, 'warrantyExpiry');
                setWarrantyStats(prev => ({ ...prev, assets: assetWarrantyStats }));
                
                // Get expiring assets
                const expiringAssets = assetsData.data
                    .filter(asset => {
                        const status = getExpiryStatus(asset.warrantyExpiry);
                        return status.status === 'expiring';
                    })
                    .slice(0, 5);
                setExpiringItems(prev => ({ ...prev, assets: expiringAssets }));
            }
            
            // Calculate license expiry statistics
            if (licensesData.success) {
                const licenseExpiryStats = calculateExpiryStats(licensesData.data, 'expiryDate');
                setWarrantyStats(prev => ({ ...prev, licenses: licenseExpiryStats }));
                
                // Get expiring licenses
                const expiringLicenses = licensesData.data
                    .filter(license => {
                        const status = getExpiryStatus(license.expiryDate);
                        return status.status === 'expiring';
                    })
                    .slice(0, 5);
                setExpiringItems(prev => ({ ...prev, licenses: expiringLicenses }));
            }
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError('Error connecting to server');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCardClick = (title) => {
        let statusFilter = 'All';
        switch (title) {
            case 'Available': statusFilter = 'Available'; break;
            case 'Assigned': statusFilter = 'Assigned'; break;
            case 'Under Repair': statusFilter = 'Under Repair'; break;
            default: statusFilter = 'All';
        }
        navigate('/assets', { state: { statusFilter } });
    };

    const handleCreateAsset = async (formData) => {
        try {
            const response = await fetch('http://localhost:5000/api/assets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await response.json();
            if (data.success) {
                setIsAssetFormOpen(false);
                fetchData();
            } else {
                alert('Error creating asset: ' + data.message);
            }
        } catch (error) {
            console.error('Error saving asset:', error);
            alert('Failed to save asset');
        }
    };

    const statCards = [
        { title: "Total Assets", value: stats.totalAssets, icon: Box, color: { bg: "bg-blue-50", text: "text-blue-600" } },
        { title: "Available", value: stats.available, icon: CheckCircle, color: { bg: "bg-emerald-50", text: "text-emerald-600" } },
        { title: "Assigned", value: stats.assigned, icon: UserPlus, color: { bg: "bg-purple-50", text: "text-purple-600" } },
        { title: "Under Repair", value: stats.underRepair, icon: Wrench, color: { bg: "bg-orange-50", text: "text-orange-600" } },
        { title: "Total Licenses", value: stats.totalLicenses, icon: ShieldCheck, color: { bg: "bg-indigo-50", text: "text-indigo-600" } },
        { title: "Expiring Soon", value: stats.expiringLicenses, icon: Clock, color: { bg: "bg-amber-50", text: "text-amber-600" } },
    ];

    if (loading && !stats.totalAssets) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <Loader className="w-10 h-10 text-blue-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-8 bg-gray-50/50 min-h-screen animate-fade-in-up">
            <header className="mb-12">
                <div className="flex items-center gap-3 mb-2">
                   <div className="w-8 h-1 bg-brand-primary rounded-full"></div>
                   <h2 className="text-brand-primary font-bold text-xs uppercase tracking-[0.2em]">System Overview</h2>
                </div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">IT Asset & License Management System </h1>
                <p className="text-slate-500 font-medium mt-1 uppercase text-[10px] tracking-widest">Real-time IT Asset Intelligence & Monitoring</p>
            </header>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-12">
                {statCards.map((stat, index) => (
                    <div key={index} className="animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                        <StatCard {...stat} onClick={() => stat.title.includes('License') || stat.title === 'Expiring Soon' ? navigate('/licenses') : handleCardClick(stat.title)} />
                    </div>
                ))}
            </div>

            {/* Warranty / Expiry Alerts Section */}
            {(expiringItems.assets.length > 0 || expiringItems.licenses.length > 0) && (
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl shadow-lg p-6 mb-10 animate-slide-up">
                    <div className="flex items-center gap-3 mb-6">
                        <AlertTriangle className="w-6 h-6 text-amber-600" />
                        <h2 className="text-xl font-bold text-amber-900">Warranty & Expiry Alerts</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Expiring Assets */}
                        {expiringItems.assets.length > 0 && (
                            <div className="bg-white rounded-xl p-5 shadow-sm border border-amber-100">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                        <ShieldAlert className="w-5 h-5 text-amber-600" />
                                        Expiring Assets ({expiringItems.assets.length})
                                    </h3>
                                    <button 
                                        onClick={() => navigate('/assets')}
                                        className="text-xs font-bold text-amber-600 hover:text-amber-700 uppercase tracking-widest"
                                    >
                                        View All
                                    </button>
                                </div>
                                <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                                    {expiringItems.assets.map(asset => {
                                        const status = getExpiryStatus(asset.warrantyExpiry);
                                        return (
                                            <div 
                                                key={asset._id} 
                                                className="p-3 rounded-lg border border-gray-100 hover:border-amber-200 hover:shadow-md transition-all duration-200 cursor-pointer group"
                                                onClick={() => navigate(`/assets/${asset._id}`)}
                                            >
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="flex-1">
                                                        <p className="font-semibold text-gray-800 text-sm group-hover:text-amber-700 transition-colors">
                                                            {asset.name}
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {asset.assetTag} • {asset.category}
                                                        </p>
                                                    </div>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                        status.status === 'expired' 
                                                            ? 'bg-red-100 text-red-700' 
                                                            : 'bg-amber-100 text-amber-700'
                                                    }`}>
                                                        {status.label}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-3 h-3 text-gray-400" />
                                                    <span className="text-xs text-gray-600">
                                                        {status.daysRemaining > 0 
                                                            ? `${status.daysRemaining} days remaining` 
                                                            : `Expired ${Math.abs(status.daysRemaining)} days ago`}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Expiring Licenses */}
                        {expiringItems.licenses.length > 0 && (
                            <div className="bg-white rounded-xl p-5 shadow-sm border border-amber-100">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                        <ShieldAlert className="w-5 h-5 text-amber-600" />
                                        Expiring Licenses ({expiringItems.licenses.length})
                                    </h3>
                                    <button 
                                        onClick={() => navigate('/licenses')}
                                        className="text-xs font-bold text-amber-600 hover:text-amber-700 uppercase tracking-widest"
                                    >
                                        View All
                                    </button>
                                </div>
                                <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                                    {expiringItems.licenses.map(license => {
                                        const status = getExpiryStatus(license.expiryDate);
                                        return (
                                            <div 
                                                key={license._id} 
                                                className="p-3 rounded-lg border border-gray-100 hover:border-amber-200 hover:shadow-md transition-all duration-200 cursor-pointer group"
                                                onClick={() => navigate('/licenses')}
                                            >
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="flex-1">
                                                        <p className="font-semibold text-gray-800 text-sm group-hover:text-amber-700 transition-colors">
                                                            {license.softwareName}
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {license.vendor} • {license.licenseKey?.slice(0, 8)}...
                                                        </p>
                                                    </div>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                        status.status === 'expired' 
                                                            ? 'bg-red-100 text-red-700' 
                                                            : 'bg-amber-100 text-amber-700'
                                                    }`}>
                                                        {status.label}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-3 h-3 text-gray-400" />
                                                    <span className="text-xs text-gray-600">
                                                        {status.daysRemaining > 0 
                                                            ? `${status.daysRemaining} days remaining` 
                                                            : `Expired ${Math.abs(status.daysRemaining)} days ago`}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* License Utilization */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[400px]">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        License Utilization
                        </h2>
                        <button onClick={() => navigate('/licenses')} className="text-blue-600 text-xs font-bold uppercase tracking-widest hover:underline transition-all">View All</button>
                    </div>
                    
                    <div className="space-y-6">
                        {licenseStats.length > 0 ? (
                            licenseStats.map((license, index) => {
                                const used = license.usedSeats || 0;
                                const total = license.totalSeats || 1;
                                const percentage = Math.round((used / total) * 100);
                                
                                // Enhanced Color and Gradient Logic
                                let gradientClass = 'from-emerald-400 to-teal-500';
                                let badgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-100';
                                let glowColor = 'rgba(16, 185, 129, 0.4)';
                                
                                if (percentage > 80) {
                                    gradientClass = 'from-rose-500 to-red-600';
                                    badgeClass = 'bg-red-50 text-red-700 border-red-100';
                                    glowColor = 'rgba(239, 68, 68, 0.4)';
                                } else if (percentage > 60) {
                                    gradientClass = 'from-amber-400 to-orange-500';
                                    badgeClass = 'bg-amber-50 text-amber-700 border-amber-100';
                                    glowColor = 'rgba(245, 158, 11, 0.4)';
                                }

                                return (
                                    <div 
                                        key={license._id} 
                                        className="p-5 rounded-2xl border border-slate-50 hover:border-indigo-100 hover:shadow-xl hover:scale-[1.02] transition-all duration-500 group relative bg-white overflow-hidden"
                                    >
                                        <div className="flex justify-between items-start mb-4 relative z-10">
                                            <div>
                                                <h3 className="text-sm font-black text-slate-800 group-hover:text-indigo-600 transition-colors duration-300 flex items-center gap-2">
                                                    {license.softwareName}
                                                </h3>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.15em] mt-0.5">{license.vendor}</p>
                                            </div>
                                            <div className={`px-3 py-1 rounded-full border ${badgeClass} text-[10px] font-black tracking-wider shadow-sm animate-pulse-subtle`}>
                                                {percentage}% USED
                                            </div>
                                        </div>
                                        
                                        <div className="relative pt-1 z-10">
                                            <div className="flex mb-2.5 items-center justify-between">
                                                <div>
                                                    <span className="text-[9px] font-black inline-block py-1 px-2.5 uppercase rounded-full text-indigo-600 bg-indigo-50/50 border border-indigo-100/50 tracking-widest">
                                                        UTILIZATION
                                                    </span>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-[11px] font-black text-slate-600">
                                                        {used} <span className="text-slate-300 mx-0.5">/</span> {total} <span className="text-[9px] text-slate-400 uppercase tracking-tighter ml-0.5 font-bold">Seats</span>
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            <div className="relative h-3 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-50 shadow-inner">
                                                {/* Animated Bar */}
                                                <div 
                                                    style={{ 
                                                        width: `${percentage}%`,
                                                        boxShadow: `0 0 15px ${glowColor}`
                                                    }} 
                                                    className={`absolute top-0 left-0 h-full bg-linear-to-r ${gradientClass} rounded-full transition-all duration-1000 ease-in-out group-hover:brightness-110`}
                                                >
                                                    {/* Shimmer Effect */}
                                                    <div className="absolute inset-0 w-full h-full bg-size-[30px_30px] bg-linear-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                                                    
                                                    {/* Striped pattern overlay */}
                                                    <div className="absolute inset-0 opacity-20 bg-[linear-gradient(45deg,rgba(255,255,255,.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,.15)_50%,rgba(255,255,255,.15)_75%,transparent_75%,transparent)] bg-size-[1rem_1rem]"></div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Background Decoration */}
                                        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-slate-50 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 scale-0 group-hover:scale-150 z-0"></div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                <ShieldAlert className="w-10 h-10 text-slate-300 mx-auto mb-3 opacity-50" />
                                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No Active Licenses</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Asset Distribution Chart */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col min-h-[400px]">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        Asset Distribution
                    </h2>
                    <div className="flex-1 min-h-[250px] w-full items-center justify-center flex">
                        <ResponsiveContainer width="100%" height={280}>
                            <PieChart>
                                <Pie
                                    data={[
                                        { name: 'Available', value: stats.available, color: '#10b981' },
                                        { name: 'Assigned', value: stats.assigned, color: '#3b82f6' },
                                        { name: 'Under Repair', value: stats.underRepair, color: '#f59e0b' }
                                    ]}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {[
                                        { name: 'Available', color: '#10b981' },
                                        { name: 'Assigned', color: '#3b82f6' },
                                        { name: 'Under Repair', color: '#f59e0b' }
                                    ].map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                />
                                <Legend verticalAlign="bottom" height={36}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-4">
                         <div className="text-center">
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Available</p>
                            <p className="text-lg font-bold text-emerald-600">{stats.available}</p>
                         </div>
                         <div className="text-center border-x border-gray-100">
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Assigned</p>
                            <p className="text-lg font-bold text-blue-600">{stats.assigned}</p>
                         </div>
                         <div className="text-center">
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Repair</p>
                            <p className="text-lg font-bold text-amber-600">{stats.underRepair}</p>
                         </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity Feed */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col lg:col-span-2 min-h-[400px]">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                             Recent Activity Feed
                        </h2>
                        <button onClick={() => navigate('/history')} className="text-blue-600 text-xs font-bold uppercase tracking-widest hover:underline transition-all">View All History</button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4 max-h-[500px]">
                        {recentActivities.length > 0 ? (
                            recentActivities.map((activity, index) => {
                                // Determine activity type and icon
                                let typeLabel = "Asset Updated";
                                let typeIcon = Activity;
                                let iconColor = "bg-blue-50 text-blue-600";
                                let actionMessage = "";

                                if (activity.status === 'Assigned') {
                                    typeLabel = "Asset Assigned";
                                    typeIcon = UserPlus;
                                    iconColor = "bg-purple-50 text-purple-600";
                                    actionMessage = `Asset ${activity.name} was assigned to an employee.`;
                                } else if (activity.status === 'Available') {
                                    typeLabel = "Asset Returned";
                                    typeIcon = CheckCircle;
                                    iconColor = "bg-emerald-50 text-emerald-600";
                                    actionMessage = `Asset ${activity.name} is now available.`;
                                } else if (activity.status === 'Under Repair') {
                                    typeLabel = "Maintenance";
                                    typeIcon = Wrench;
                                    iconColor = "bg-orange-50 text-orange-600";
                                    actionMessage = `Asset ${activity.name} sent for repair.`;
                                } else {
                                    actionMessage = `Asset ${activity.name} was updated.`;
                                }

                                const Icon = typeIcon;
                                const timeAgo = new Date(activity.updatedAt).toLocaleString();

                                return (
                                    <div key={activity._id} className="flex gap-4 p-5 rounded-2xl hover:bg-white hover:shadow-premium transition-all duration-300 border border-transparent hover:border-slate-50 group animate-slide-up" style={{ animationDelay: `${index * 0.05}s` }}>
                                        <div className={`w-14 h-14 rounded-2xl overflow-hidden flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform duration-500 ${activity.image ? 'p-0.5 bg-slate-50' : iconColor}`}>
                                            {activity.image ? (
                                                <img src={activity.image} alt={activity.name} className="w-full h-full object-cover rounded-xl" />
                                            ) : (
                                                <Icon className="w-6 h-6" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <h4 className="text-sm font-bold text-slate-800 mb-1 group-hover:text-brand-primary transition-colors">{typeLabel}</h4>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                                    <Clock className="w-3 h-3 text-indigo-400" />
                                                    {timeAgo}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-500 line-clamp-1">{actionMessage}</p>
                                            <div className="mt-3 flex items-center gap-3">
                                                <span className="text-[10px] font-bold bg-slate-50 text-slate-500 px-2.5 py-1 rounded-lg uppercase tracking-wider">{activity.assetTag}</span>
                                                <button onClick={(e) => { e.stopPropagation(); navigate(`/assets/${activity._id}`); }} className="text-[10px] font-bold text-brand-primary hover:tracking-widest transition-all duration-300 uppercase">View Record →</button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center py-20 text-gray-400">
                                <Activity className="w-12 h-12 mx-auto mb-4 opacity-10" />
                                <p>No recent activity found.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
                    <h2 className="text-xl font-bold text-gray-800 mb-8 font-extrabold uppercase tracking-tight">
                        Quick Actions
                    </h2>
                    <div className="grid grid-cols-1 gap-4">
                        <button 
                            onClick={() => navigate('/licenses/register')}
                            className="w-full bg-blue-600 text-white px-6 py-4 rounded-xl font-bold text-sm shadow-lg shadow-blue-100 hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-between group"
                        >
                            <span>Register License</span>
                            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                        </button>
                        <button 
                            onClick={() => setIsAssetFormOpen(true)}
                            className="w-full bg-indigo-600 text-white px-6 py-4 rounded-xl font-bold text-sm shadow-lg shadow-indigo-100 hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-between group"
                        >
                            <span>Add Asset</span>
                            <Monitor className="w-5 h-5 transition-bounce" />
                        </button>
                        <button 
                            onClick={() => navigate('/licenses')}
                            className="w-full bg-emerald-600 text-white px-6 py-4 rounded-xl font-bold text-sm shadow-lg shadow-emerald-100 hover:bg-emerald-700 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-between group"
                        >
                            <span>Manage Licenses</span>
                            <ShieldCheck className="w-5 h-5 transition-transform" />
                        </button>
                        <button 
                            onClick={() => navigate('/licenses/any/assign')}
                            className="w-full bg-purple-600 text-white px-6 py-4 rounded-xl font-bold text-sm shadow-lg shadow-purple-100 hover:bg-purple-700 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-between group"
                        >
                            <span>Assign License</span>
                            <UserPlus className="w-5 h-5 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #cbd5e1;
                }
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                .animate-shimmer {
                    animation: shimmer 2s infinite linear;
                }
                @keyframes pulse-subtle {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.05); opacity: 0.9; }
                }
                .animate-pulse-subtle {
                    animation: pulse-subtle 3s infinite ease-in-out;
                }
                @keyframes slide-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-slide-up {
                    animation: slide-up 0.5s ease-out forwards;
                }
                .transition-bounce:hover {
                    animation: bounce 0.5s infinite;
                }
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-3px); }
                }
            `}</style>

            <AssetForm 
                isOpen={isAssetFormOpen}
                onClose={() => setIsAssetFormOpen(false)}
                onSubmit={handleCreateAsset}
            />
        </div>
    );
};

export default Dashboard;
