import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { getExpiryStatus } from '../utils/warrantyUtils';

const NotificationContext = createContext(null);

const POLL_INTERVAL = 5 * 60 * 1000; // 5 minutes
const STORAGE_KEY = 'itam_notifications_enabled';
const NOTIFIED_KEY = 'itam_notified_ids';

export const NotificationProvider = ({ children }) => {
    const [enabled, setEnabled] = useState(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored === null ? false : stored === 'true';
    });
    const [alerts, setAlerts] = useState([]);
    const [panelOpen, setPanelOpen] = useState(false);
    const [permissionState, setPermissionState] = useState(
        typeof Notification !== 'undefined' ? Notification.permission : 'default'
    );
    const intervalRef = useRef(null);
    const previousAlertsRef = useRef(new Set());

    // Get already-notified IDs from localStorage
    const getNotifiedIds = useCallback(() => {
        try {
            const stored = localStorage.getItem(NOTIFIED_KEY);
            return stored ? new Set(JSON.parse(stored)) : new Set();
        } catch {
            return new Set();
        }
    }, []);

    const saveNotifiedIds = useCallback((ids) => {
        localStorage.setItem(NOTIFIED_KEY, JSON.stringify([...ids]));
    }, []);

    // Request browser notification permission
    const requestPermission = useCallback(async () => {
        if (typeof Notification === 'undefined') return false;
        if (Notification.permission === 'granted') {
            setPermissionState('granted');
            return true;
        }
        if (Notification.permission === 'denied') {
            setPermissionState('denied');
            return false;
        }
        const result = await Notification.requestPermission();
        setPermissionState(result);
        return result === 'granted';
    }, []);

    // Send a browser notification
    const sendBrowserNotification = useCallback((title, body, icon = '⚠️') => {
        if (typeof Notification === 'undefined') return;
        if (Notification.permission !== 'granted') return;
        
        try {
            const notification = new Notification(title, {
                body,
                icon: '/vite.svg',
                tag: `${title}-${body}-${Date.now()}`,
                requireInteraction: false,
            });
            setTimeout(() => notification.close(), 10000);
        } catch (e) {
            // Fallback for environments where Notification constructor fails (e.g. some mobile browsers)
            if (navigator.serviceWorker?.ready) {
                navigator.serviceWorker.ready.then(reg => {
                    reg.showNotification(title, { body, icon: '/vite.svg' });
                }).catch(() => {});
            }
            console.warn('Browser notification failed:', e);
        }
    }, []);

    // Fetch data and build alert list
    const fetchAlerts = useCallback(async () => {
        try {
            const [assetsRes, licensesRes] = await Promise.all([
                fetch('http://localhost:5000/api/assets'),
                fetch('http://localhost:5000/api/licenses'),
            ]);
            const assetsData = await assetsRes.json();
            const licensesData = await licensesRes.json();

            const newAlerts = [];

            // Check asset warranties
            if (assetsData.success) {
                assetsData.data.forEach(asset => {
                    const status = getExpiryStatus(asset.warrantyExpiry);
                    if (status.status === 'expiring') {
                        newAlerts.push({
                            id: `asset-expiring-${asset._id}`,
                            type: 'warranty_expiring',
                            title: 'Warranty Expiring Soon',
                            message: `${asset.name} (${asset.assetTag}) - warranty expires in ${status.daysRemaining} days`,
                            icon: '⚠️',
                            category: 'warning',
                            timestamp: new Date().toISOString(),
                        });
                    }
                    if (status.status === 'expired') {
                        newAlerts.push({
                            id: `asset-expired-${asset._id}`,
                            type: 'warranty_expired',
                            title: 'Warranty Expired',
                            message: `${asset.name} (${asset.assetTag}) - warranty expired ${Math.abs(status.daysRemaining)} days ago`,
                            icon: '🔴',
                            category: 'danger',
                            timestamp: new Date().toISOString(),
                        });
                    }
                    // Asset assigned/returned
                    if (asset.status === 'Assigned') {
                        newAlerts.push({
                            id: `asset-assigned-${asset._id}`,
                            type: 'asset_assigned',
                            title: 'Asset Assigned',
                            message: `${asset.name} (${asset.assetTag}) is currently assigned`,
                            icon: '✅',
                            category: 'info',
                            timestamp: asset.updatedAt || new Date().toISOString(),
                        });
                    }
                });
            }

            // Check license expiry
            if (licensesData.success) {
                licensesData.data.forEach(license => {
                    const status = getExpiryStatus(license.expiryDate);
                    if (status.status === 'expiring') {
                        newAlerts.push({
                            id: `license-expiring-${license._id}`,
                            type: 'license_expiring',
                            title: 'License Expiring Soon',
                            message: `${license.softwareName} (${license.vendor}) - expires in ${status.daysRemaining} days`,
                            icon: '⚠️',
                            category: 'warning',
                            timestamp: new Date().toISOString(),
                        });
                    }
                    if (status.status === 'expired') {
                        newAlerts.push({
                            id: `license-expired-${license._id}`,
                            type: 'license_expired',
                            title: 'License Expired',
                            message: `${license.softwareName} (${license.vendor}) - expired ${Math.abs(status.daysRemaining)} days ago`,
                            icon: '🔴',
                            category: 'danger',
                            timestamp: new Date().toISOString(),
                        });
                    }
                });
            }

            // Only send browser notifications for NEW alerts
            if (enabled && permissionState === 'granted') {
                const notifiedIds = getNotifiedIds();
                const currentIds = new Set(newAlerts.map(a => a.id));
                
                newAlerts.forEach(alert => {
                    if (!notifiedIds.has(alert.id) && !previousAlertsRef.current.has(alert.id)) {
                        sendBrowserNotification(alert.title, alert.message);
                    }
                });

                // Save all current alert ids as notified
                const merged = new Set([...notifiedIds, ...currentIds]);
                // Clean up old IDs that are no longer active
                const cleaned = new Set([...merged].filter(id => currentIds.has(id)));
                saveNotifiedIds(cleaned);
                previousAlertsRef.current = currentIds;
            }

            setAlerts(newAlerts);
        } catch (err) {
            console.error('Failed to fetch notification data:', err);
        }
    }, [enabled, permissionState, sendBrowserNotification, getNotifiedIds, saveNotifiedIds]);

    // Toggle notifications
    const toggleNotifications = useCallback(async () => {
        if (!enabled) {
            const granted = await requestPermission();
            if (granted) {
                setEnabled(true);
                localStorage.setItem(STORAGE_KEY, 'true');
            }
        } else {
            setEnabled(false);
            localStorage.setItem(STORAGE_KEY, 'false');
        }
    }, [enabled, requestPermission]);

    // Polling
    useEffect(() => {
        // Always fetch alerts for badge count, regardless of enabled state
        fetchAlerts();

        intervalRef.current = setInterval(fetchAlerts, POLL_INTERVAL);
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [fetchAlerts]);

    // When enabled changes and is turned on, clear notified cache to re-trigger
    useEffect(() => {
        if (enabled) {
            localStorage.removeItem(NOTIFIED_KEY);
            previousAlertsRef.current = new Set();
            fetchAlerts();
        }
    }, [enabled]);

    // Immediately check a single item after create/update and fire browser notification
    // This always attempts to notify (even if toggle is off) since the user just performed an action
    const checkItemAndNotify = useCallback(async (item, type = 'asset') => {
        const dateField = type === 'license' ? 'expiryDate' : 'warrantyExpiry';
        const nameField = type === 'license' ? 'softwareName' : 'name';
        const tagField = type === 'license' ? 'vendor' : 'assetTag';
        const status = getExpiryStatus(item[dateField]);

        let title = null;
        let msg = null;

        if (status.status === 'expiring') {
            title = type === 'license' ? 'License Expiring Soon' : 'Warranty Expiring Soon';
            msg = `${item[nameField]} (${item[tagField]}) - expires in ${status.daysRemaining} day${status.daysRemaining !== 1 ? 's' : ''}`;
        } else if (status.status === 'expired') {
            title = type === 'license' ? 'License Expired' : 'Warranty Expired';
            msg = `${item[nameField]} (${item[tagField]}) - expired ${Math.abs(status.daysRemaining)} day${Math.abs(status.daysRemaining) !== 1 ? 's' : ''} ago`;
        }

        if (title && msg) {
            // Try to get permission if not already granted
            let canNotify = permissionState === 'granted';
            if (!canNotify) {
                canNotify = await requestPermission();
            }
            if (canNotify) {
                sendBrowserNotification(title, msg);
            }
        }

        // Refresh the full alerts list so badge updates
        setTimeout(fetchAlerts, 500);
    }, [permissionState, requestPermission, sendBrowserNotification, fetchAlerts]);

    const togglePanel = useCallback(() => setPanelOpen(prev => !prev), []);
    const closePanel = useCallback(() => setPanelOpen(false), []);

    const alertCount = alerts.filter(a => a.category === 'warning' || a.category === 'danger').length;

    return (
        <NotificationContext.Provider
            value={{
                enabled,
                alerts,
                alertCount,
                panelOpen,
                permissionState,
                toggleNotifications,
                togglePanel,
                closePanel,
                fetchAlerts,
                checkItemAndNotify,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};
