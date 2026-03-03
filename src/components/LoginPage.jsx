import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import illustration from '../assets/auth-illustration.png';
import { Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const result = await login(email, password);
            if (result) {
                showToast('Welcome back!', 'success');
                window.location.href = '/';
            }
        } catch (err) {
            showToast(err.message || 'Invalid credentials', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans overflow-hidden">
            {/* Left Side: Illustration & Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-indigo-600 via-blue-600 to-indigo-800 relative items-center justify-center p-12">
                <div className="absolute inset-0 bg-blue-900/10 pointer-events-none"></div>
                
                {/* Decorative circles */}
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
                        <img 
                            src={illustration} 
                            alt="IT Workspace" 
                            className="w-full h-auto rounded-[1.8rem]"
                        />
                    </div>

                    <h2 className="text-4xl font-bold text-white mb-4 leading-tight">Master Your IT Assets</h2>
                    <p className="text-blue-100 text-lg font-medium opacity-90">
                        Log in to manage hardware, licenses, and assignments from a single intuitive dashboard.
                    </p>
                </div>
            </div>

            {/* Right Side: Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 lg:p-20 relative overflow-y-auto">
                <div className="w-full max-w-md">
                    <div className="lg:hidden flex items-center mb-12">
                        <div className="bg-indigo-600 p-2 rounded-xl shadow-lg mr-3">
                            <ShieldCheck className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-black text-slate-900 tracking-tighter">ITAM</span>
                    </div>

                    <div className="mb-10">
                        <h1 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">Welcome Back</h1>
                        <p className="text-slate-500 font-medium">Please enter your details to sign in.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="group">
                            <label className="block text-sm font-extrabold text-slate-700 mb-2 transition-colors group-focus-within:text-indigo-600">
                                Email Address
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                                    <Mail className="w-5 h-5" />
                                </span>
                                <input
                                    type="email"
                                    placeholder="admin@it-corp.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-slate-900 font-semibold focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-300 shadow-sm"
                                    required
                                />
                            </div>
                        </div>

                        <div className="group">
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-extrabold text-slate-700 transition-colors group-focus-within:text-indigo-600">
                                    Password
                                </label>
                                <Link to="/forget-password" title="Forget Password?" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors">Forgot password?</Link>
                            </div>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                                    <Lock className="w-5 h-5" />
                                </span>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-slate-900 font-semibold focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-300 shadow-sm"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-linear-to-r from-indigo-600 to-blue-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-100 hover:shadow-hover hover:-translate-y-1 hover:scale-[1.01] transition-all duration-300 flex items-center justify-center space-x-2 active:scale-95 disabled:opacity-70 group"
                        >
                            {isSubmitting ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span>Sign In</span>
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-12 text-center">
                        <p className="text-slate-500 font-bold">
                            Don't have an admin account? <Link to="/register" className="text-indigo-600 hover:text-indigo-700 transition-colors">Sign Up</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
