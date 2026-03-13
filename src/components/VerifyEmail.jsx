import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ShieldCheck, ArrowRight, ArrowLeft, Smartphone, Mail } from 'lucide-react';
import illustration from '../assets/auth-illustration.png';

const VerifyEmail = () => {
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isResending, setIsResending] = useState(false);
    
    const inputRefs = useRef([]);
    const { verifyEmail, resendOtp } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const email = localStorage.getItem('verify_email');

    useEffect(() => {
        if (!email) {
            navigate('/register');
        }
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, [email, navigate]);

    const handleChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;

        const newCode = [...code];
        newCode[index] = value.slice(-1);
        setCode(newCode);

        if (value && index < 5) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const data = e.clipboardData.getData('text').slice(0, 6);
        if (!/^\d+$/.test(data)) return;

        const newCode = [...code];
        data.split('').forEach((char, i) => {
            if (i < 6) newCode[i] = char;
        });
        setCode(newCode);
        
        const lastIndex = Math.min(data.length - 1, 5);
        inputRefs.current[lastIndex]?.focus();
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        const fullCode = code.join('');
        if (fullCode.length < 6) return;

        setIsSubmitting(true);
        try {
            await verifyEmail(fullCode);
            showToast('Email verified successfully! You can now log in.', 'success');
            navigate('/login');
        } catch (err) {
            showToast(err.message || 'Invalid verification code', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResend = async () => {
        setIsResending(true);
        try {
            await resendOtp();
            showToast('New verification code sent to your email.', 'success');
        } catch (err) {
            showToast(err.message || 'Failed to resend code', 'error');
        } finally {
            setIsResending(false);
        }
    };

    const isFullCode = code.every(digit => digit !== '');

    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-dark-bg font-sans overflow-hidden transition-colors duration-500">
            <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-indigo-600 via-blue-600 to-indigo-800 relative items-center justify-center p-12">
                <div className="absolute inset-0 bg-blue-900/10 pointer-events-none"></div>
                <div className="relative z-10 max-w-lg text-center">
                    <div className="flex items-center justify-center space-x-3 mb-12">
                        <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl border border-white/30 shadow-xl">
                            <ShieldCheck className="w-10 h-10 text-white" />
                        </div>
                        <span className="text-4xl font-black text-white tracking-tighter">ITAM</span>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm p-2 rounded-[2rem] border border-white/20 shadow-2xl mb-12 transform hover:scale-[1.02] transition-transform duration-500">
                        <img src={illustration} alt="IT Workspace" className="w-full h-auto rounded-[1.8rem]" />
                    </div>
                    <h2 className="text-4xl font-bold text-white mb-4 leading-tight">Final Step!</h2>
                    <p className="text-blue-100 text-lg font-medium opacity-90">
                        Verify your email to activate your account and access your workspace.
                    </p>
                </div>
            </div>

            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 lg:p-20 relative">
                <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <Link to="/register" className="inline-flex items-center text-slate-500 dark:text-slate-400 font-bold hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mb-12 group">
                        <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Back to Register
                    </Link>

                    <div className="mb-10">
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">Verify Email</h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">
                            We've sent a 6-digit code to <span className="text-indigo-600 dark:text-indigo-400 font-bold">{email}</span>
                        </p>
                    </div>

                    <form onSubmit={handleVerify} className="space-y-8">
                        <div className="flex justify-between gap-2 md:gap-4">
                            {code.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => (inputRefs.current[index] = el)}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    onPaste={handlePaste}
                                    className="w-full aspect-square text-center text-3xl font-black text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-800/50 border-2 border-slate-200 dark:border-dark-border rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/40 focus:border-indigo-500 transition-all duration-300"
                                />
                            ))}
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting || !isFullCode}
                            className={`w-full font-black py-4 rounded-2xl shadow-xl transition-all duration-300 flex items-center justify-center space-x-2 active:scale-95 disabled:opacity-50 group ${
                                isFullCode 
                                    ? 'bg-linear-to-r from-indigo-600 to-blue-600 text-white hover:shadow-hover hover:-translate-y-1' 
                                    : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                            }`}
                        >
                            {isSubmitting ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <Smartphone className="w-5 h-5" />
                                    <span>Verify & Activate</span>
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-12 text-center text-slate-500 dark:text-slate-400 font-medium">
                        <p className="mb-4">Didn't receive the code?</p>
                        <button 
                            onClick={handleResend}
                            disabled={isResending}
                            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-black px-6 py-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl transition-all duration-200 hover:bg-indigo-100 disabled:opacity-50"
                        >
                            {isResending ? 'Resending...' : 'Resend Code'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;
