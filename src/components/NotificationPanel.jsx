import React, { useEffect, useRef } from 'react';
import { Bell, BellRing, Shield, ShieldAlert, ShieldX, CheckSquare, RotateCcw, X, AlertTriangle } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

// ─── Notification Bell Button (for navbar) ───
export const NotificationBell = () => {
    const { alertCount, togglePanel, panelOpen } = useNotifications();

    return (
        <button
            onClick={togglePanel}
            className="relative p-2.5 rounded-xl hover:bg-gray-100 transition-all duration-200 group"
            aria-label="Notifications"
        >
            {panelOpen ? (
                <BellRing className="w-5 h-5 text-blue-600 animate-wiggle" />
            ) : (
                <Bell className="w-5 h-5 text-gray-500 group-hover:text-gray-700 transition-colors" />
            )}
            {alertCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-5 h-5 flex items-center justify-center px-1 text-[10px] font-bold text-white bg-red-500 rounded-full shadow-lg shadow-red-200 animate-bounce-subtle">
                    {alertCount > 99 ? '99+' : alertCount}
                </span>
            )}
        </button>
    );
};

// ─── Alert type config ───
const ALERT_CONFIG = {
    warranty_expiring: {
        icon: ShieldAlert,
        iconBg: 'bg-amber-100',
        iconColor: 'text-amber-600',
        borderColor: 'border-l-amber-400',
    },
    warranty_expired: {
        icon: ShieldX,
        iconBg: 'bg-red-100',
        iconColor: 'text-red-600',
        borderColor: 'border-l-red-400',
    },
    license_expiring: {
        icon: ShieldAlert,
        iconBg: 'bg-orange-100',
        iconColor: 'text-orange-600',
        borderColor: 'border-l-orange-400',
    },
    license_expired: {
        icon: ShieldX,
        iconBg: 'bg-red-100',
        iconColor: 'text-red-600',
        borderColor: 'border-l-red-400',
    },
    asset_assigned: {
        icon: CheckSquare,
        iconBg: 'bg-green-100',
        iconColor: 'text-green-600',
        borderColor: 'border-l-green-400',
    },
    asset_returned: {
        icon: RotateCcw,
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600',
        borderColor: 'border-l-blue-400',
    },
};

const CATEGORY_LABELS = {
    warranty_expiring: 'Warranty Expiring Soon',
    warranty_expired: 'Warranty Expired',
    license_expiring: 'License Expiring Soon',
    license_expired: 'License Expired',
    asset_assigned: 'Asset Assigned',
    asset_returned: 'Asset Returned',
};

// ─── Toggle Switch ───
const ToggleSwitch = ({ enabled, onToggle }) => (
    <button
        onClick={onToggle}
        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 ${
            enabled ? 'bg-blue-600 shadow-lg shadow-blue-200' : 'bg-gray-300'
        }`}
        role="switch"
        aria-checked={enabled}
    >
        <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-all duration-300 ${
                enabled ? 'translate-x-6' : 'translate-x-1'
            }`}
        />
    </button>
);

// ─── Notification Panel (dropdown) ───
const NotificationPanel = () => {
    const { enabled, alerts, alertCount, panelOpen, closePanel, toggleNotifications, permissionState } = useNotifications();
    const panelRef = useRef(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (panelRef.current && !panelRef.current.contains(e.target)) {
                // Check if click was on the bell button
                const bellBtn = e.target.closest('[aria-label="Notifications"]');
                if (!bellBtn) closePanel();
            }
        };
        if (panelOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [panelOpen, closePanel]);

    // Close on Escape
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') closePanel();
        };
        if (panelOpen) document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, [panelOpen, closePanel]);

    if (!panelOpen) return null;

    const dangerAlerts = alerts.filter(a => a.category === 'danger');
    const warningAlerts = alerts.filter(a => a.category === 'warning');
    const infoAlerts = alerts.filter(a => a.category === 'info');

    // Group alerts by type
    const groupedAlerts = {};
    alerts.forEach(alert => {
        if (!groupedAlerts[alert.type]) {
            groupedAlerts[alert.type] = [];
        }
        groupedAlerts[alert.type].push(alert);
    });

    const notificationTypes = [
        { key: 'warranty_expiring', label: 'Warranty Expiring Soon', desc: 'Assets with warranty expiring within 30 days', emoji: '⚠️' },
        { key: 'license_expired', label: 'License Expired', desc: 'Software licenses that have expired', emoji: '🚨' },
        { key: 'license_expiring', label: 'License Expiring Soon', desc: 'Software licenses expiring within 30 days', emoji: '⚠️' },
        { key: 'asset_assigned', label: 'Asset Assigned', desc: 'When an asset is assigned to an employee', emoji: '✅' },
        { key: 'asset_returned', label: 'Asset Returned', desc: 'When an asset is returned by an employee', emoji: '🔄' },
    ];

    return (
        <div
            ref={panelRef}
            className="absolute right-0 top-full mt-2 w-95 max-h-[85vh] bg-white rounded-2xl shadow-2xl border border-gray-200/80 overflow-hidden z-9999 animate-panel-in"
        >
            {/* Header */}
            <div className="bg-linear-to-r from-blue-600 via-blue-700 to-purple-700 px-6 py-5 text-white">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                            <Bell className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg leading-tight">Browser Notifications</h3>
                            <p className="text-blue-200 text-xs mt-0.5">Manage your alert preferences</p>
                        </div>
                    </div>
                    <button onClick={closePanel} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Scrollable content */}
            <div className="overflow-y-auto max-h-[calc(85vh-80px)] custom-scroll">
                {/* Toggle Section */}
                <div className="px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${enabled ? 'bg-green-100' : 'bg-gray-100'}`}>
                                {enabled ? '✅' : '🔕'}
                            </div>
                            <div>
                                <p className="font-semibold text-gray-800 text-sm">{enabled ? 'Enabled' : 'Disabled'}</p>
                                <p className="text-xs text-gray-500">
                                    {enabled ? 'Receiving notifications for important events' : 'Notifications are turned off'}
                                </p>
                            </div>
                        </div>
                        <ToggleSwitch enabled={enabled} onToggle={toggleNotifications} />
                    </div>

                    {permissionState === 'denied' && (
                        <div className="mt-3 p-2.5 bg-red-50 rounded-lg border border-red-200">
                            <p className="text-xs text-red-600 font-medium">
                                ⚠️ Browser notifications are blocked. Please allow them in your browser settings.
                            </p>
                        </div>
                    )}
                </div>

                {/* Active Alerts Badge */}
                {alertCount > 0 && (
                    <div className="mx-6 mt-4 mb-2 flex items-center justify-between bg-linear-to-r from-purple-50 to-blue-50 rounded-xl px-4 py-3 border border-purple-100">
                        <div>
                            <p className="text-sm font-bold text-purple-800">Active Alerts</p>
                            <p className="text-xs text-purple-600">{alertCount} items require attention</p>
                        </div>
                        <span className="w-9 h-9 flex items-center justify-center bg-red-500 text-white font-bold text-sm rounded-full shadow-lg shadow-red-200">
                            {alertCount}
                        </span>
                    </div>
                )}

                {/* "You'll be notified about" */}
                <div className="px-6 py-4">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-4">You'll be notified about:</p>
                    <div className="space-y-2">
                        {notificationTypes.map(({ key, label, desc, emoji }) => {
                            const config = ALERT_CONFIG[key];
                            const Icon = config?.icon || AlertTriangle;
                            const count = groupedAlerts[key]?.length || 0;
                            return (
                                <div
                                    key={key}
                                    className={`flex items-start gap-3 p-3.5 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all duration-200 ${
                                        count > 0 ? 'bg-white' : 'bg-gray-50/50'
                                    }`}
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${config?.iconBg || 'bg-gray-100'}`}>
                                        <Icon className={`w-5 h-5 ${config?.iconColor || 'text-gray-500'}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <p className="font-semibold text-gray-800 text-sm">{label}</p>
                                            {count > 0 && (
                                                <span className="ml-2 px-2 py-0.5 text-[10px] font-bold bg-red-100 text-red-600 rounded-full">
                                                    {count}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{desc}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Active Alert Details - Expiring/Expired items */}
                {(dangerAlerts.length > 0 || warningAlerts.length > 0) && enabled && (
                    <div className="px-6 pb-4">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-3">Alert Details:</p>
                        <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1 custom-scroll">
                            {[...dangerAlerts, ...warningAlerts].slice(0, 15).map(alert => {
                                const config = ALERT_CONFIG[alert.type] || {};
                                const Icon = config.icon || AlertTriangle;
                                return (
                                    <div
                                        key={alert.id}
                                        className={`flex items-start gap-2.5 p-2.5 rounded-lg border-l-[3px] bg-gray-50 hover:bg-white transition-colors ${config.borderColor || 'border-l-gray-300'}`}
                                    >
                                        <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${config.iconColor || 'text-gray-500'}`} />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs font-semibold text-gray-700 truncate">{alert.title}</p>
                                            <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">{alert.message}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/50">
                    <p className="text-[10px] text-gray-400 text-center tracking-wide">
                        Notifications are checked every 5 minutes
                    </p>
                </div>
            </div>

            {/* Inline styles for animations */}
            <style>{`
                @keyframes panel-in {
                    from { opacity: 0; transform: translateY(-8px) scale(0.97); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .animate-panel-in {
                    animation: panel-in 0.2s ease-out;
                }
                @keyframes wiggle {
                    0%, 100% { transform: rotate(0deg); }
                    25% { transform: rotate(-10deg); }
                    50% { transform: rotate(10deg); }
                    75% { transform: rotate(-5deg); }
                }
                .animate-wiggle {
                    animation: wiggle 0.5s ease-in-out;
                }
                @keyframes bounce-subtle {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                }
                .animate-bounce-subtle {
                    animation: bounce-subtle 2s infinite;
                }
                .custom-scroll::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scroll::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scroll::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
                .custom-scroll::-webkit-scrollbar-thumb:hover {
                    background: #cbd5e1;
                }
            `}</style>
        </div>
    );
};

export default NotificationPanel;
