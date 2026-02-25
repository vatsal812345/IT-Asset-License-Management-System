import React, { useState, useEffect, useRef } from 'react';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const Toast = ({ id, message, type, onClose }) => {
    const [isClosing, setIsClosing] = useState(false);
    const timerRef = useRef(null);
    const startTimeRef = useRef(null);
    const remainingTimeRef = useRef(3000);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose(id);
        }, 300); // Match toast-out animation duration
    };

    const startTimer = () => {
        startTimeRef.current = Date.now();
        timerRef.current = setTimeout(handleClose, remainingTimeRef.current);
    };

    const pauseTimer = () => {
        clearTimeout(timerRef.current);
        remainingTimeRef.current -= Date.now() - startTimeRef.current;
    };

    useEffect(() => {
        startTimer();
        return () => clearTimeout(timerRef.current);
    }, []);

    const icons = {
        success: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
        error: <AlertCircle className="w-5 h-5 text-red-500" />,
        info: <Info className="w-5 h-5 text-blue-500" />,
        warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
    };

    const configs = {
        success: {
            bg: 'bg-white',
            border: 'border-emerald-100',
            shadow: 'shadow-emerald-100',
            accent: 'bg-emerald-500',
        },
        error: {
            bg: 'bg-white',
            border: 'border-red-100',
            shadow: 'shadow-red-100',
            accent: 'bg-red-500',
        },
        info: {
            bg: 'bg-white',
            border: 'border-blue-100',
            shadow: 'shadow-blue-100',
            accent: 'bg-blue-500',
        },
        warning: {
            bg: 'bg-white',
            border: 'border-amber-100',
            shadow: 'shadow-amber-100',
            accent: 'bg-amber-500',
        },
    };

    const config = configs[type] || configs.success;

    return (
        <div
            onMouseEnter={pauseTimer}
            onMouseLeave={startTimer}
            className={`
                relative flex items-center min-w-[320px] max-w-md p-4 mb-3 
                rounded-2xl border ${config.border} ${config.bg} ${config.shadow} shadow-2xl
                transition-all duration-300 pointer-events-auto
                ${isClosing ? 'animate-toast-out' : 'animate-toast-in'}
            `}
        >
            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${config.accent} rounded-l-2xl`} />
            
            <div className="flex items-center space-x-3 flex-1">
                <div className="shrink-0">
                    {icons[type] || icons.success}
                </div>
                <div className="flex-1 mr-2 text-sm font-bold text-gray-800">
                    {message}
                </div>
            </div>

            <button 
            onClick={handleClose}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};

export default Toast;
