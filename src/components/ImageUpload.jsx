import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Loader2, Image as ImageIcon, CheckCircle2, AlertCircle } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { getDisplayImageUrl } from '../utils/imageUtils';

const ImageUpload = ({ 
    uploadUrl, 
    onUploadSuccess, 
    onFileSelect, 
    initialImage, 
    label = "Profile Picture",
    fieldName = "file" // Default field name
}) => {
    const [dragActive, setDragActive] = useState(false);
    const [preview, setPreview] = useState(initialImage ? getDisplayImageUrl(initialImage) : null);
    const [uploading, setUploading] = useState(false);
    const [fileName, setFileName] = useState('');
    const fileInputRef = useRef(null);
    const { showToast } = useToast();

    // Sync preview with initialImage when it changes from outside
    React.useEffect(() => {
        if (initialImage) {
            setPreview(getDisplayImageUrl(initialImage));
        }
    }, [initialImage]);

    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    const validateAndPreview = (file) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (!allowedTypes.includes(file.type)) {
            showToast('Please upload a JPEG, PNG, or WebP image', 'error');
            return false;
        }

        if (file.size > maxSize) {
            showToast('Image size must be less than 5MB', 'error');
            return false;
        }
        
        setFileName(file.name);
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target.result);
        reader.readAsDataURL(file);
        return true;
    };

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            if (validateAndPreview(file)) {
                if (uploadUrl) {
                    uploadFile(file);
                } else if (onFileSelect) {
                    onFileSelect(file);
                }
            }
        }
    }, []);

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (validateAndPreview(file)) {
                if (uploadUrl) {
                    uploadFile(file);
                } else if (onFileSelect) {
                    onFileSelect(file);
                }
            }
        }
    };

    const uploadFile = async (file) => {
        setUploading(true);
        const formData = new FormData();
        formData.append(fieldName, file);

        try {
            const response = await fetch(uploadUrl, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (data.success) {
                showToast('Image uploaded successfully', 'success');
                if (onUploadSuccess) {
                    // Normalize the URL from the response
                    const url = typeof data.data === 'string' 
                        ? data.data 
                        : (data.data?.url || data.data?.imageUrl || data.url);
                    onUploadSuccess(url);
                }
            } else {
                showToast(data.message || 'Upload failed', 'error');
            }
        } catch (error) {
            console.error('Upload error:', error);
            showToast('Failed to upload image. Please check your connection.', 'error');
        } finally {
            setUploading(false);
        }
    };

    const removeImage = (e) => {
        e.stopPropagation();
        setPreview(null);
        setFileName('');
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (onFileSelect) onFileSelect(null);
    };

    const onButtonClick = () => {
        fileInputRef.current.click();
    };

    return (
        <div className="w-full space-y-4">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">{label}</label>
            
            <div 
                className={`relative group flex flex-col items-center justify-center w-full min-h-[200px] rounded-4xl border-2 border-dashed transition-all duration-500 overflow-hidden cursor-pointer
                    ${dragActive 
                        ? 'border-blue-500 bg-blue-50/50 scale-[1.01] shadow-xl shadow-blue-100/50' 
                        : 'border-gray-200 bg-gray-50/50 hover:border-blue-400 hover:bg-white hover:shadow-lg hover:shadow-gray-100/50'
                    }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={onButtonClick}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleChange}
                />

                {preview ? (
                    <div className="relative w-full h-full flex flex-col items-center p-6 animate-scale-up">
                        <div className="relative group/preview">
                            <img 
                                src={preview} 
                                alt="Preview" 
                                className="max-h-48 rounded-2xl shadow-2xl object-cover ring-4 ring-white group-hover:ring-blue-50 transition-all duration-300" 
                            />
                            {!uploading && (
                                <button
                                    onClick={removeImage}
                                    className="absolute -top-3 -right-3 p-2 bg-white text-red-500 rounded-full shadow-lg border border-red-50 hover:bg-red-50 hover:scale-110 active:scale-95 transition-all opacity-0 group-hover/preview:opacity-100 z-10"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                        {fileName && (
                            <p className="mt-4 text-xs font-bold text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-100 truncate max-w-[200px]">
                                {fileName}
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center p-10 space-y-4 text-center">
                        <div className={`p-5 rounded-2xl transition-all duration-500 
                            ${dragActive ? 'bg-blue-500 text-white animate-bounce' : 'bg-white text-gray-400 group-hover:text-blue-500 group-hover:scale-110 shadow-sm'}`}>
                            <Upload className="w-8 h-8" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-extrabold text-gray-800">
                                Drag & Drop or <span className="text-blue-600">Click to Upload</span>
                            </p>
                            <p className="text-xs font-medium text-gray-400">JPG, PNG, WebP up to 5MB</p>
                        </div>
                    </div>
                )}

                {/* Loading Overlay */}
                {uploading && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm animate-fade-in">
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-blue-100 rounded-full"></div>
                            <div className="absolute top-0 w-16 h-16 border-4 border-t-blue-600 rounded-full animate-spin"></div>
                            <ImageIcon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-blue-600 animate-pulse" />
                        </div>
                        <p className="mt-4 text-sm font-bold text-blue-600 animate-pulse">Uploading Image...</p>
                    </div>
                )}

                {/* Border Glow Effect */}
                <div className={`absolute inset-0 pointer-events-none transition-opacity duration-500 bg-linear-to-br from-blue-500/5 to-transparent
                    ${dragActive || preview ? 'opacity-100' : 'opacity-0'}`} 
                />
            </div>
        </div>
    );
};

export default ImageUpload;
