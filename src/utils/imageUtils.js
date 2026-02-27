// Image URL utilities for handling both local and cloud storage

const BACKEND_URL = 'http://localhost:5000';

/**
 * Converts an image URL to a displayable format.
 * Handles both:
 * - Cloudinary URLs (https://res.cloudinary.com/...)
 * - Local file paths (C:/Users/.../uploads/assets/...)
 * 
 * @param {string} imageUrl - The image URL from the API
 * @returns {string|null} - A valid URL for display, or null if invalid
 */
export const getDisplayImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    
    // If it's already an HTTP/HTTPS URL (like Cloudinary), return as-is
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        return imageUrl;
    }
    
    // If it's a data URL (base64), return as-is
    if (imageUrl.startsWith('data:')) {
        return imageUrl;
    }
    
    // Handle local file paths - extract the relative path from uploads folder
    // Patterns like: C:/Users/.../uploads/assets/filename.jpg
    // or: /uploads/assets/filename.jpg
    const uploadsMatch = imageUrl.match(/uploads[/\\](.+)$/i);
    if (uploadsMatch) {
        const relativePath = uploadsMatch[1].replace(/\\/g, '/');
        return `${BACKEND_URL}/uploads/${relativePath}`;
    }
    
    // If it's just a filename, assume it's in uploads/assets
    if (!imageUrl.includes('/') && !imageUrl.includes('\\')) {
        return `${BACKEND_URL}/uploads/assets/${imageUrl}`;
    }
    
    // Fallback: return the original URL
    return imageUrl;
};

export default getDisplayImageUrl;