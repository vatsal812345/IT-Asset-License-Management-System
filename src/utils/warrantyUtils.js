// Warranty & Expiry Tracking Utilities
import { ShieldCheck, ShieldAlert, ShieldX, Clock } from 'lucide-react';

/**
 * Calculate warranty/expiry status based on date
 * @param {string} expiryDate - The expiry date to check
 * @returns {object} Status object with status, label, color, icon, daysRemaining
 */
export const getExpiryStatus = (expiryDate) => {
    if (!expiryDate) {
        return {
            status: 'none',
            label: 'No Date',
            color: 'bg-gray-100 text-gray-600 border-gray-200',
            bgColor: 'bg-gray-50',
            textColor: 'text-gray-600',
            icon: Clock,
            daysRemaining: null,
        };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0);
    
    const daysRemaining = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

    if (daysRemaining < 0) {
        return {
            status: 'expired',
            label: 'Expired',
            sublabel: `${Math.abs(daysRemaining)} days ago`,
            color: 'bg-red-100 text-red-700 border-red-300',
            bgColor: 'bg-red-50',
            textColor: 'text-red-600',
            iconColor: 'text-red-500',
            icon: ShieldX,
            daysRemaining,
        };
    } else if (daysRemaining <= 30) {
        return {
            status: 'expiring',
            label: 'Expiring Soon',
            sublabel: `${daysRemaining} days left`,
            color: 'bg-orange-100 text-orange-700 border-orange-300',
            bgColor: 'bg-orange-50',
            textColor: 'text-orange-600',
            iconColor: 'text-orange-500',
            icon: ShieldAlert,
            daysRemaining,
        };
    } else {
        return {
            status: 'active',
            label: 'Active',
            sublabel: `${daysRemaining} days left`,
            color: 'bg-green-100 text-green-700 border-green-300',
            bgColor: 'bg-green-50',
            textColor: 'text-green-600',
            iconColor: 'text-green-500',
            icon: ShieldCheck,
            daysRemaining,
        };
    }
};

/**
 * Calculate expiry statistics from a list of items
 * @param {array} items - Array of items with expiryDate or warrantyExpiryDate
 * @param {string} dateField - Field name for expiry date ('expiryDate' or 'warrantyExpiryDate')
 * @returns {object} Statistics object
 */
export const calculateExpiryStats = (items, dateField = 'expiryDate') => {
    const stats = {
        total: items.length,
        active: 0,
        expiring: 0,
        expired: 0,
        noDate: 0,
    };

    items.forEach(item => {
        const status = getExpiryStatus(item[dateField]);
        
        switch (status.status) {
            case 'active':
                stats.active++;
                break;
            case 'expiring':
                stats.expiring++;
                break;
            case 'expired':
                stats.expired++;
                break;
            case 'none':
                stats.noDate++;
                break;
            default:
                break;
        }
    });

    return stats;
};

/**
 * Get items expiring soon (within 30 days)
 * @param {array} items - Array of items
 * @param {string} dateField - Field name for expiry date
 * @returns {array} Filtered items
 */
export const getExpiringSoonItems = (items, dateField = 'expiryDate') => {
    return items.filter(item => {
        const status = getExpiryStatus(item[dateField]);
        return status.status === 'expiring';
    });
};

/**
 * Get expired items
 * @param {array} items - Array of items
 * @param {string} dateField - Field name for expiry date
 * @returns {array} Filtered items
 */
export const getExpiredItems = (items, dateField = 'expiryDate') => {
    return items.filter(item => {
        const status = getExpiryStatus(item[dateField]);
        return status.status === 'expired';
    });
};
