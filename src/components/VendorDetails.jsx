import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Building2, 
    Mail, 
    Phone, 
    MapPin, 
    Star, 
    ChevronLeft, 
    History, 
    Package, 
    ShieldCheck, 
    ExternalLink,
    Calendar,
    DollarSign,
    User,
    Loader
} from 'lucide-react';
import api from '../utils/api';

const VendorDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('assets');

    useEffect(() => {
        const fetchVendorDetails = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/vendors/${id}`);
                if (response.data.success) {
                    setData(response.data.data);
                }
            } catch (error) {
                console.error('Error fetching vendor details:', error);
                alert('Failed to load vendor details');
            } finally {
                setLoading(false);
            }
        };
        fetchVendorDetails();
    }, [id]);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-dark-bg">
                <Loader className="w-10 h-10 text-brand-primary animate-spin" />
            </div>
        );
    }

    if (!data) return <div className="p-8 text-center text-slate-500 font-bold uppercase tracking-widest">Vendor Not Found</div>;

    const { vendor, purchaseHistory } = data;

    return (
        <div className="p-4 md:p-8 animate-fade-in">
            <button 
                onClick={() => navigate('/vendors')}
                className="flex items-center gap-2 text-slate-500 hover:text-brand-primary transition-colors font-bold uppercase tracking-[0.15em] text-[10px] mb-8 group"
            >
                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back to Database
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                {/* Vendor Identity Card */}
                <div className="lg:col-span-2 bg-white dark:bg-dark-card rounded-3xl shadow-premium border border-slate-50 dark:border-dark-border p-8 md:p-10 relative overflow-hidden group">
                    <div className="relative z-10">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                            <div className="flex items-start gap-6">
                                <div className="w-20 h-20 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-brand-primary flex items-center justify-center shadow-sm group-hover:rotate-3 transition-transform duration-500">
                                    <Building2 className="w-10 h-10" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{vendor.vendorName}</h1>
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${
                                            vendor.status === 'Active' 
                                            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' 
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                                        }`}>
                                            {vendor.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium">
                                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                        <span className="text-sm font-bold">{vendor.rating || 3} / 5 Rating</span>
                                        <span className="text-slate-300 mx-2">•</span>
                                        <span className="text-xs font-bold uppercase tracking-widest">Member Since {new Date(vendor.createdAt).getFullYear()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4">Contact Information</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 group/item">
                                        <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center text-slate-400 group-hover/item:text-brand-primary transition-colors">
                                            <User className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Representative</p>
                                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{vendor.contactPerson || 'Not Assigned'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 group/item">
                                        <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center text-slate-400 group-hover/item:text-brand-primary transition-colors">
                                            <Mail className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Email Address</p>
                                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{vendor.email || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 group/item">
                                        <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center text-slate-400 group-hover/item:text-brand-primary transition-colors">
                                            <Phone className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Phone Number</p>
                                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{vendor.phone || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4">Business Details</h3>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-4 group/item">
                                        <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center text-slate-400 group-hover/item:text-brand-primary transition-colors">
                                            <MapPin className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Address</p>
                                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">{vendor.address || 'No address provided'}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-3">Services Provided</p>
                                        <div className="flex flex-wrap gap-2">
                                            {vendor.servicesProvided?.length > 0 ? vendor.servicesProvided.map((service, idx) => (
                                                <span key={idx} className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/10 text-brand-primary text-[10px] font-black rounded-lg border border-indigo-100 dark:border-indigo-900/30 uppercase tracking-widest">
                                                    {service}
                                                </span>
                                            )) : (
                                                <span className="text-xs text-slate-400 italic">None listed</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Decoration */}
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-50/20 dark:bg-indigo-900/5 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-1000"></div>
                </div>

                {/* Quick Stats Sidebar */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-dark-card rounded-3xl shadow-premium border border-slate-50 dark:border-dark-border p-6 font-bold uppercase tracking-widest">
                        <p className="text-[10px] text-slate-400 mb-4">Analytics Overview</p>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 text-center">
                                <p className="text-2xl text-slate-900 dark:text-white mb-1">{purchaseHistory.assets.length}</p>
                                <p className="text-[8px] text-slate-400">Total Assets</p>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 text-center">
                                <p className="text-2xl text-slate-900 dark:text-white mb-1">{purchaseHistory.licenses.length}</p>
                                <p className="text-[8px] text-slate-400">Total Licenses</p>
                            </div>
                            <div className="col-span-2 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl p-4 text-center border border-emerald-100 dark:border-emerald-900/20">
                                <p className="text-xs text-emerald-600 mb-1">Total Investment</p>
                                <p className="text-xl text-emerald-700 dark:text-emerald-400">
                                    ${(purchaseHistory.assets.reduce((sum, a) => sum + (a.purchaseCost || 0), 0) + 
                                       purchaseHistory.licenses.reduce((sum, l) => sum + (l.cost || 0), 0)).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Purchase History Section */}
            <div className="bg-white dark:bg-dark-card rounded-3xl shadow-premium border border-slate-50 dark:border-dark-border overflow-hidden">
                <div className="p-6 md:p-8 border-b border-slate-50 dark:border-dark-border flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 flex items-center justify-center">
                            <History className="w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Purchase History</h2>
                    </div>
                    
                    <div className="flex bg-slate-50 dark:bg-slate-800/80 p-1.5 rounded-2xl">
                        <button 
                            onClick={() => setActiveTab('assets')}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === 'assets' ? 'bg-white dark:bg-dark-card text-brand-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <Package className="w-4 h-4" />
                            ASSETS
                        </button>
                        <button 
                            onClick={() => setActiveTab('licenses')}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === 'licenses' ? 'bg-white dark:bg-dark-card text-brand-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <ShieldCheck className="w-4 h-4" />
                            LICENSES
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto min-h-[300px]">
                    {activeTab === 'assets' ? (
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                                    <th className="text-left py-4 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Asset Name</th>
                                    <th className="text-center py-4 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Purchase Date</th>
                                    <th className="text-center py-4 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cost</th>
                                    <th className="text-left py-4 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Assigned User</th>
                                    <th className="text-right py-4 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Link</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-dark-border">
                                {purchaseHistory.assets.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="py-20 text-center">
                                            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No Assets Purchased from this Vendor</p>
                                        </td>
                                    </tr>
                                ) : purchaseHistory.assets.map((asset) => (
                                    <tr key={asset._id} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/30 transition-colors group">
                                        <td className="py-5 px-8">
                                            <div>
                                                <p className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-brand-primary transition-colors">{asset.name}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{asset.assetTag}</p>
                                            </div>
                                        </td>
                                        <td className="py-5 px-8 text-center font-bold text-slate-600 dark:text-slate-400 text-xs">
                                            {asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td className="py-5 px-8 text-center font-black text-emerald-600 text-sm">
                                            ${asset.purchaseCost?.toLocaleString() || '0'}
                                        </td>
                                        <td className="py-5 px-8">
                                            {asset.currentAssignedTo ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-dark-bg flex items-center justify-center text-[10px] font-bold text-slate-500">
                                                        {asset.currentAssignedTo.firstName[0]}{asset.currentAssignedTo.lastName[0]}
                                                    </div>
                                                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                                                        {asset.currentAssignedTo.firstName} {asset.currentAssignedTo.lastName}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">In Stock</span>
                                            )}
                                        </td>
                                        <td className="py-5 px-8 text-right">
                                            <button onClick={() => navigate(`/assets/${asset._id}`)} className="text-slate-400 hover:text-brand-primary transition-colors">
                                                <ExternalLink className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                                    <th className="text-left py-4 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Software Name</th>
                                    <th className="text-center py-4 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Purchase Date</th>
                                    <th className="text-center py-4 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cost</th>
                                    <th className="text-center py-4 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Seats</th>
                                    <th className="text-right py-4 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Link</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-dark-border">
                                {purchaseHistory.licenses.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="py-20 text-center">
                                            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No Licenses Purchased from this Vendor</p>
                                        </td>
                                    </tr>
                                ) : purchaseHistory.licenses.map((license) => (
                                    <tr key={license._id} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/30 transition-colors group">
                                        <td className="py-5 px-8">
                                            <div>
                                                <p className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-brand-primary transition-colors">{license.softwareName}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{license.licenseType}</p>
                                            </div>
                                        </td>
                                        <td className="py-5 px-8 text-center font-bold text-slate-600 dark:text-slate-400 text-xs">
                                            {license.purchaseDate ? new Date(license.purchaseDate).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td className="py-5 px-8 text-center font-black text-emerald-600 text-sm">
                                            ${license.cost?.toLocaleString() || '0'}
                                        </td>
                                        <td className="py-5 px-8 text-center font-bold text-slate-600 dark:text-slate-400 text-xs">
                                            {license.usedSeats} / {license.totalSeats}
                                        </td>
                                        <td className="py-5 px-8 text-right">
                                            <button onClick={() => navigate(`/licenses`)} className="text-slate-400 hover:text-brand-primary transition-colors">
                                                <ExternalLink className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VendorDetails;
