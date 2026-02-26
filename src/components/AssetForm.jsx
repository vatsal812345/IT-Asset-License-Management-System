import React, { useState, useEffect } from 'react';
import { X, Laptop, Monitor, Printer, MousePointer2, Box, Smartphone, Check, Scan, Tablet, Server, Network, FileCode, ChevronDown } from 'lucide-react';
import ImageUpload from './ImageUpload';

const CATEGORIES = [
    { id: 'Laptop', label: 'Laptop', icon: Laptop, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'Desktop', label: 'Desktop', icon: Monitor, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { id: 'Monitor', label: 'Monitor', icon: Monitor, color: 'text-amber-600', bg: 'bg-amber-50' },
    { id: 'Printer', label: 'Printer', icon: Printer, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { id: 'Scanner', label: 'Scanner', icon: Scan, color: 'text-cyan-600', bg: 'bg-cyan-50' },
    { id: 'Phone', label: 'Phone', icon: Smartphone, color: 'text-rose-600', bg: 'bg-rose-50' },
    { id: 'Tablet', label: 'Tablet', icon: Tablet, color: 'text-orange-600', bg: 'bg-orange-50' },
    { id: 'Server', label: 'Server', icon: Server, color: 'text-slate-600', bg: 'bg-slate-50' },
    { id: 'Network Equipment', label: 'Network', icon: Network, color: 'text-violet-600', bg: 'bg-violet-50' },
    { id: 'Accessories', label: 'Accessories', icon: MousePointer2, color: 'text-purple-600', bg: 'bg-purple-50' },
    { id: 'Software', label: 'Software', icon: FileCode, color: 'text-teal-600', bg: 'bg-teal-50' },
    { id: 'Other', label: 'Other', icon: Box, color: 'text-gray-600', bg: 'bg-gray-50' }
];

const AssetForm = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    name: '',
    assetTag: '',
    category: '',
    brand: '',
    model: '',
    serialNumber: '',
    purchaseDate: '',
    status: 'Available',
    location: '',
    imageFile: null,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        purchaseDate: initialData.purchaseDate ? initialData.purchaseDate.split('T')[0] : '',
      });
    } else {
        setFormData({
            name: '',
            assetTag: '',
            category: '',
            brand: '',
            model: '',
            serialNumber: '',
            purchaseDate: '',
            status: 'Available',
            location: '',
            imageFile: null,
        })
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const selectedCategory = CATEGORIES.find(cat => cat.id === formData.category);
  const CategoryIcon = selectedCategory ? selectedCategory.icon : Box;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto animate-scale-in border border-gray-100">
        <div className="flex items-center justify-between p-8 border-b border-gray-50 bg-gray-50/30">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              {initialData ? 'Edit Asset' : 'Add New Asset'}
            </h2>
            <p className="text-sm text-gray-500 mt-1 font-medium">Please fill in the details below to {initialData ? 'update' : 'create'} the asset.</p>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 hover:bg-gray-100 rounded-2xl transition-all duration-200 group border border-transparent hover:border-gray-200"
          >
            <X className="w-5 h-5 text-gray-400 group-hover:text-gray-900" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="mb-6">
            <ImageUpload
              label="Asset Image"
              uploadUrl={initialData ? `https://itam-backend.onrender.com/api/assets/${initialData._id}/image` : null}
              fieldName="image"
              initialImage={initialData ? initialData.imageUrl : null}
              onUploadSuccess={(imageUrl) => {
                setFormData(prev => ({ ...prev, imageUrl: imageUrl }));
              }}
              onFileSelect={(file) => {
                setFormData(prev => ({ ...prev, imageFile: file }));
              }}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Asset Name</label>
              <input
                type="text"
                name="name"
                placeholder="e.g. MacBook Pro M3"
                value={formData.name}
                onChange={handleChange}
                className="w-full h-12 px-5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all duration-300 font-bold text-gray-800 placeholder:text-gray-300"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Asset Tag</label>
              <input
                type="text"
                name="assetTag"
                placeholder="e.g. LAP-101"
                value={formData.assetTag}
                onChange={handleChange}
                className="w-full h-12 px-5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all duration-300 font-bold text-gray-800 placeholder:text-gray-300"
                required
              />
            </div>

            {/* Asset Category Dropdown */}
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Asset Category</label>
              <div className="relative group">
                <div className={`absolute left-5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg ${selectedCategory ? selectedCategory.bg : 'bg-gray-100'} transition-colors pointer-events-none z-10`}>
                  <CategoryIcon className={`w-4 h-4 ${selectedCategory ? selectedCategory.color : 'text-gray-400'}`} />
                </div>
                <select
                  required
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full h-12 pl-14 pr-12 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-bold text-gray-800 appearance-none cursor-pointer"
                >
                  <option value="" disabled>Select Asset Category</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none group-hover:text-blue-500 transition-colors" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Brand</label>
              <input
                type="text"
                name="brand"
                placeholder="e.g. Apple"
                value={formData.brand}
                onChange={handleChange}
                className="w-full h-12 px-5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all duration-300 font-bold text-gray-800 placeholder:text-gray-300"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Model</label>
              <input
                type="text"
                name="model"
                placeholder="e.g. A2941" 
                value={formData.model}
                onChange={handleChange}
                className="w-full h-12 px-5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all duration-300 font-bold text-gray-800 placeholder:text-gray-300"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Serial Number</label>
              <input
                type="text"
                name="serialNumber"
                placeholder="e.g. SN-8231-XJ"
                value={formData.serialNumber}
                onChange={handleChange}
                className="w-full h-12 px-5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all duration-300 font-bold text-gray-800 placeholder:text-gray-300"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Purchase Date</label>
              <input
                type="date"
                name="purchaseDate"
                value={formData.purchaseDate}
                onChange={handleChange}
                className="w-full h-12 px-5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all duration-300 font-bold text-gray-800 cursor-pointer"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Status</label>
              <div className="relative group">
                <select
                  required
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full h-12 px-5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all duration-300 font-bold text-gray-800 appearance-none cursor-pointer"
                >
                  <option value="Available">Available</option>
                  <option value="Assigned">Assigned</option>
                  <option value="Under Repair">Under Repair</option>
                  <option value="Retired">Retired</option>
                </select>
                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none group-hover:text-blue-500 transition-colors" />
              </div>
            </div>
             <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Location</label>
              <input
                type="text"
                name="location"
                placeholder="e.g. Floor 2 - IT Lab"
                value={formData.location}
                onChange={handleChange}
                className="w-full h-12 px-5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all duration-300 font-bold text-gray-800 placeholder:text-gray-300"
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-4 mt-8 pt-6 border-t border-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-3.5 rounded-2xl text-gray-500 font-bold text-sm hover:bg-gray-100 hover:text-gray-900 transition-all duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-8 py-3.5 rounded-2xl bg-linear-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm shadow-xl shadow-blue-100 hover:shadow-blue-200 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {initialData ? 'Update Asset' : 'Save Asset'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default AssetForm;
