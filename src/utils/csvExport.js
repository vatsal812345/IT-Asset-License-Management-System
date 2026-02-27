/**
 * Utility function to convert array of objects to CSV format
 * @param {Array} data - Array of objects to export
 * @param {Array} columns - Array of column definitions {key: 'fieldName', header: 'Column Header'}
 * @param {String} filename - Name of the CSV file to download
 */
export const exportToCSV = (data, columns, filename = 'export.csv') => {
    if (!data || data.length === 0) {
        alert('No data to export');
        return;
    }

    try {
        // Create CSV headers
        const headers = columns.map(col => col.header).join(',');

        // Create CSV rows
        const rows = data.map(item => {
            return columns.map(col => {
                let value = col.accessor ? col.accessor(item) : item[col.key] || '';
                
                // Handle special characters and commas in CSV
                if (typeof value === 'string') {
                    // Remove line breaks
                    value = value.replace(/\n/g, ' ').replace(/\r/g, '');
                    
                    // Escape double quotes
                    value = value.replace(/"/g, '""');
                    
                    // Wrap in quotes if contains comma, quotes, or is a string
                    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
                        value = `"${value}"`;
                    }
                }
                
                return value;
            }).join(',');
        });

        // Combine headers and rows
        const csv = [headers, ...rows].join('\n');

        // Create blob and download
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        if (link.download !== undefined) {
            // Create a link and trigger download
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
    } catch (error) {
        console.error('Error exporting to CSV:', error);
        alert('Failed to export data. Please try again.');
    }
};

/**
 * Format date for CSV export
 * @param {String|Date} date - Date to format
 * @returns {String} Formatted date string
 */
export const formatDateForCSV = (date) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'Invalid Date';
    return d.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
};

/**
 * Sanitize value for CSV (remove special characters that might break formatting)
 * @param {any} value - Value to sanitize
 * @returns {String} Sanitized value
 */
export const sanitizeForCSV = (value) => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value).replace(/[\n\r]+/g, ' ').trim();
};
