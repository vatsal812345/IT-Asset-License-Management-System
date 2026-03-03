import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ShieldCheck, ArrowRight, ArrowLeft, Smartphone, Eye, EyeOff, Lock, CheckCircle2, XCircle } from 'lucide-react';
import illustration from '../assets/auth-illustration.png';

const VerifyCode = () => {
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    
    // New Password States
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [strength, setStrength] = useState({ score: 0, label: 'Weak', color: 'bg-slate-200' });
    
    const inputRefs = useRef([]);
    const { verifyResetCode, resetPassword } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const resetEmail = localStorage.getItem('reset_email');

    useEffect(() => {
        // Initial focus
        if (inputRefs.current[0] && !isVerified) {
            inputRefs.current[0].focus();
        }
    }, [isVerified]);

    const calculateStrength = (pass) => {
        let score = 0;
        if (pass.length >= 8) score++;
        if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score++;
        if (/[0-9]/.test(pass)) score++;
        if (/[^A-Za-z0-9]/.test(pass)) score++;

        if (score <= 1) return { score, label: 'Weak', color: 'bg-red-500' };
        if (score <= 3) return { score, label: 'Medium', color: 'bg-yellow-500' };
        return { score, label: 'Strong', color: 'bg-green-500' };
    };

    const handlePasswordChange = (e) => {
        const val = e.target.value;
        setNewPassword(val);
        setStrength(calculateStrength(val));
    };

    const handleChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;

        const newCode = [...code];
        newCode[index] = value.slice(-1); // Take only last digit
        setCode(newCode);

        // Move focus forward
        if (value && index < 5) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (index, e) => {
        // Move focus backward on backspace
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
        
        // Focus the last or first empty
        const lastIndex = Math.min(data.length, 5);
        inputRefs.current[lastIndex].focus();
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        const fullCode = code.join('');
        if (fullCode.length < 6) return;

        setIsSubmitting(true);
        try {
            await verifyResetCode(fullCode);
            showToast('Recovery verified! Please set your new password.', 'success');
            setIsVerified(true);
        } catch (err) {
            showToast(err.message || 'Invalid verification code', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReset = async (e) => {
        e.preventDefault();
        if (strength.score < 4 || newPassword !== confirmPassword) return;

        setIsSubmitting(true);
        try {
            await resetPassword(resetEmail, newPassword);
            showToast('Password reset successfully!', 'success');
            navigate('/login');
        } catch (err) {
            showToast(err.message || 'Failed to reset password', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const isFullCode = code.every(digit => digit !== '');
    const passwordsMatch = newPassword && confirmPassword && newPassword === confirmPassword;
    const canReset = strength.score >= 4 && passwordsMatch;

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans overflow-hidden">
            {/* Left Side: Illustration & Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-indigo-600 via-blue-600 to-indigo-800 relative items-center justify-center p-12">
                <div className="absolute inset-0 bg-blue-900/10 pointer-events-none"></div>
                <div className="absolute top-20 left-20 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 right-20 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl"></div>

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

                    <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
                        {isVerified ? "Secure Your Account" : "Verify Your Account"}
                    </h2>
                    <p className="text-blue-100 text-lg font-medium opacity-90">
                        {isVerified 
                            ? "Create a powerful new password to protect your workspace."
                            : "Check your inbox for the recovery code. Enter it here to regain full access."}
                    </p>
                </div>
            </div>

            {/* Right Side: Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 lg:p-20 relative overflow-y-auto">
                <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {!isVerified ? (
                        <>
                            <Link to="/forget-password" className="inline-flex items-center text-slate-500 font-bold hover:text-indigo-600 transition-colors mb-12 group">
                                <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                                Change Email
                            </Link>

                            <div className="mb-10">
                                <h1 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">Security Check</h1>
                                <p className="text-slate-500 font-medium whitespace-pre-line">
                                    We've sent a 6-digit code to your email.
                                </p>
                            </div>

                            <form onSubmit={handleVerify} className="space-y-8">
                                <div className="flex justify-between gap-2 md:gap-4 p-1">
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
                                            className="w-full aspect-square text-center text-3xl font-black text-indigo-600 bg-white border-2 border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-300 shadow-sm outline-none"
                                        />
                                    ))}
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting || !isFullCode}
                                    className={`w-full font-black py-4 rounded-2xl shadow-xl transition-all duration-300 flex items-center justify-center space-x-2 active:scale-95 disabled:opacity-50 group ${
                                        isFullCode 
                                            ? 'bg-linear-to-r from-indigo-600 to-blue-600 text-white shadow-indigo-100 hover:shadow-hover hover:-translate-y-1 hover:scale-[1.01]' 
                                            : 'bg-slate-200 text-slate-500 shadow-none'
                                    }`}
                                >
                                    {isSubmitting ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <Smartphone className="w-5 h-5 mr-1" />
                                            <span>Verify Code</span>
                                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </form>

                            <div className="mt-12 text-center text-slate-500 font-medium">
                                <p className="mb-4">Didn't receive the code?</p>
                                <button className="text-indigo-600 hover:text-indigo-700 font-black px-6 py-3 bg-indigo-50 rounded-xl transition-all duration-200 hover:bg-indigo-100 active:scale-95">
                                    Resend Code
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="animate-in fade-in zoom-in-95 duration-500">
                            <div className="mb-10 text-center lg:text-left">
                                <h1 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">Set New Password</h1>
                                <p className="text-slate-500 font-medium">
                                    Your identity is verified. Now create a strong password.
                                </p>
                            </div>

                            <form onSubmit={handleReset} className="space-y-6">
                                <div className="space-y-4">
                                    <div className="group">
                                        <label className="block text-sm font-extrabold text-slate-700 mb-2 ml-1">New Password</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                                                <Lock className="w-5 h-5" />
                                            </span>
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                value={newPassword}
                                                onChange={handlePasswordChange}
                                                className="w-full pl-12 pr-12 py-4 bg-white border border-slate-200 rounded-2xl text-slate-900 font-semibold focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-300 shadow-sm"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                            >
                                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Strength Indicator */}
                                    {newPassword && (
                                        <div className="px-1 space-y-2">
                                            <div className="flex justify-between items-center text-xs font-black uppercase tracking-wider">
                                                <span className="text-slate-400">Security Strength</span>
                                                <span className={strength.label === 'Strong' ? 'text-green-600' : strength.label === 'Medium' ? 'text-yellow-600' : 'text-red-600'}>
                                                    {strength.label}
                                                </span>
                                            </div>
                                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex gap-1">
                                                {[1, 2, 3, 4].map((step) => (
                                                    <div 
                                                        key={step}
                                                        className={`h-full flex-1 transition-all duration-500 ${
                                                            step <= strength.score ? strength.color : 'bg-slate-200'
                                                        }`}
                                                    />
                                                ))}
                                            </div>
                                            
                                            {/* Password suggestions */}
                                            <div className="grid grid-cols-2 gap-2 mt-3">
                                                {[
                                                    { test: newPassword.length >= 8, label: 'Min 8 chars' },
                                                    { test: /[A-Z]/.test(newPassword), label: 'Upper case' },
                                                    { test: /[0-9]/.test(newPassword), label: 'Include number' },
                                                    { test: /[^A-Za-z0-9]/.test(newPassword), label: 'Special char' }
                                                ].map((req, i) => (
                                                    <div key={i} className={`flex items-center space-x-2 text-[11px] font-bold ${req.test ? 'text-green-600' : 'text-slate-400'}`}>
                                                        {req.test ? <CheckCircle2 className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border-2 border-slate-200" />}
                                                        <span>{req.label}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="group">
                                        <label className="block text-sm font-extrabold text-slate-700 mb-2 ml-1">Confirm Password</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                                                <Lock className="w-5 h-5" />
                                            </span>
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className={`w-full pl-12 pr-12 py-4 bg-white border border-slate-200 rounded-2xl text-slate-900 font-semibold focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-300 shadow-sm ${
                                                    confirmPassword && !passwordsMatch ? 'border-red-300 ring-4 ring-red-50' : 
                                                    confirmPassword && passwordsMatch ? 'border-green-300 ring-4 ring-green-50' : ''
                                                }`}
                                                required
                                            />
                                            {confirmPassword && (
                                                <span className="absolute right-4 top-1/2 -translate-y-1/2">
                                                    {passwordsMatch ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-red-500" />}
                                                </span>
                                            )}
                                        </div>
                                        {confirmPassword && !passwordsMatch && (
                                            <p className="text-xs text-red-500 font-bold mt-2 ml-1">Passwords do not match</p>
                                        )}
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting || !canReset}
                                    className={`w-full font-black py-4 rounded-2xl shadow-xl transition-all duration-300 flex items-center justify-center space-x-2 active:scale-95 disabled:opacity-50 group ${
                                        canReset 
                                            ? 'bg-linear-to-r from-indigo-600 to-blue-600 text-white shadow-indigo-100 hover:shadow-hover hover:-translate-y-1 hover:scale-[1.01]' 
                                            : 'bg-slate-200 text-slate-500 shadow-none'
                                    }`}
                                >
                                    {isSubmitting ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <ShieldCheck className="w-5 h-5 mr-1" />
                                            <span>Reset Password</span>
                                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VerifyCode;
