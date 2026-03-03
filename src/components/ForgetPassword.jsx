import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Mail, ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react';
import illustration from '../assets/auth-illustration.png';

const ForgetPassword = () => {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { requestPasswordReset } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await requestPasswordReset(email);
            showToast('Verification code sent to your email!', 'success');
            navigate('/verify-code');
        } catch (err) {
            showToast(err.message || 'Failed to send reset code', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

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

                    <h2 className="text-4xl font-bold text-white mb-4 leading-tight">Secure Password Recovery</h2>
                    <p className="text-blue-100 text-lg font-medium opacity-90">
                        Don't worry, we'll help you get back to managing your assets in no time.
                    </p>
                </div>
            </div>

            {/* Right Side: Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 lg:p-20 relative overflow-y-auto">
                <div className="w-full max-w-md">
                    <Link to="/login" className="inline-flex items-center text-slate-500 font-bold hover:text-indigo-600 transition-colors mb-12 group">
                        <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Back to Login
                    </Link>

                    <div className="mb-10">
                        <h1 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">Forgot Password?</h1>
                        <p className="text-slate-500 font-medium whitespace-pre-line">
                            Enter the email address associated with your account and we'll send you a recovery code.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="group">
                            <label className="block text-sm font-extrabold text-slate-700 mb-2 ml-1">Email Address</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                                    <Mail className="w-5 h-5" />
                                </span>
                                <input
                                    type="email"
                                    placeholder="admin@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-slate-900 font-semibold focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-300 shadow-sm"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting || !email}
                            className={`w-full font-black py-4 rounded-2xl shadow-xl transition-all duration-300 flex items-center justify-center space-x-2 active:scale-95 disabled:opacity-50 group ${
                                email 
                                    ? 'bg-linear-to-r from-indigo-600 to-blue-600 text-white shadow-indigo-100 hover:shadow-hover hover:-translate-y-1 hover:scale-[1.01]' 
                                    : 'bg-slate-200 text-slate-500 shadow-none'
                            }`}
                        >
                            {isSubmitting ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span>Send Reset Code</span>
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-12 p-6 bg-blue-50/50 border border-blue-100 rounded-2xl">
                        <p className="text-sm text-blue-700 font-bold text-center">
                            Can't access your email? Contact your system administrator for manual recovery.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgetPassword;
