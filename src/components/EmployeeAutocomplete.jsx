import React, { useState, useEffect, useRef } from 'react';
import { Search, User, Loader, X } from 'lucide-react';
import api from '../utils/api';

const EmployeeAutocomplete = ({ onSelect, initialData }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const dropdownRef = useRef(null);
    const debounceTimer = useRef(null);

    useEffect(() => {
        if (initialData) {
            setQuery(`${initialData.firstName} ${initialData.lastName}`);
            setSelectedEmployee(initialData);
        }
    }, [initialData]);

    // Handle clicking outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchEmployees = async (searchTerm) => {
        if (!searchTerm || searchTerm.length < 1) {
            setResults([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const response = await api.get('/employees');
            const data = response.data;

            if (data.success) {
                const searchLower = searchTerm.toLowerCase();
                const filtered = data.data.filter(emp =>
                    emp.firstName.toLowerCase().includes(searchLower) ||
                    emp.lastName.toLowerCase().includes(searchLower) ||
                    emp.employeeId.toLowerCase().includes(searchLower) ||
                    `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchLower)
                );
                setResults(filtered);
                setIsOpen(true);
            }
        } catch (error) {
            console.error('Error fetching employees:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        setQuery(value);
        setSelectedEmployee(null); // Clear selection if typing continues

        // Reset results if empty
        if (!value.trim()) {
            setResults([]);
            setIsOpen(false);
            return;
        }

        // Debounce API calls
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => {
            fetchEmployees(value);
        }, 300);
    };

    const handleSelect = (employee) => {
        setSelectedEmployee(employee);
        setQuery(`${employee.firstName} ${employee.lastName}`);
        setIsOpen(false);
        onSelect(employee);
    };

    const highlightText = (text, highlight) => {
        if (!highlight.trim()) return <span>{text}</span>;
        const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
        return (
            <span>
                {parts.map((part, i) =>
                    part.toLowerCase() === highlight.toLowerCase() ? (
                        <span key={i} className="text-blue-600 font-extrabold">{part}</span>
                    ) : (
                        <span key={i}>{part}</span>
                    )
                )}
            </span>
        );
    };

    return (
        <div className="relative w-full" ref={dropdownRef}>
            <div className="relative group">
                <input
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    onFocus={() => query.trim() && results.length > 0 && setIsOpen(true)}
                    placeholder="e.g. John Doe or EMP123"
                    className={`w-full h-14 pl-12 pr-10 bg-gray-50 border ${isOpen ? 'border-blue-500 ring-4 ring-blue-200' : 'border-gray-200'} rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-bold text-gray-800 placeholder:text-gray-300 `}
                />
                <Search className={`absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 ${isOpen ? 'text-blue-500' : 'text-gray-400'} transition-colors`} />
                {loading && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <Loader className="w-5 h-5 text-blue-500 animate-spin" />
                    </div>
                )}
                {!loading && query && (
                    <button
                        onClick={() => { setQuery(''); setResults([]); onSelect(null); }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full transition-colors"
                    >
                        <X className="w-4 h-4 text-gray-400" />
                    </button>
                )}
            </div>

            {/* Dropdown results */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-slide-up">
                    {results.length > 0 ? (
                        <div className="max-h-64 overflow-y-auto">
                            {results.map((emp) => (
                                <div
                                    key={emp._id}
                                    onClick={() => handleSelect(emp)}
                                    className="p-4 flex items-center space-x-4 hover:bg-blue-50 cursor-pointer transition-colors border-b border-gray-50 last:border-0"
                                >
                                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 border border-blue-200 shrink-0">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-extrabold text-gray-900 truncate">
                                            {highlightText(`${emp.firstName} ${emp.lastName}`, query)}
                                        </div>
                                        <div className="flex items-center space-x-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                            <span>{highlightText(emp.employeeId, query)}</span>
                                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                            <span>{emp.department}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center">
                            <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 mx-auto mb-3">
                                <Search className="w-6 h-6" />
                            </div>
                            <p className="text-sm font-bold text-gray-800">No employee found</p>
                            <p className="text-xs font-medium text-gray-400 mt-1">Try a different name or ID</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default EmployeeAutocomplete;
