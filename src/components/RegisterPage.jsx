import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import illustration from '../assets/auth-illustration.png';
import { User, Mail, Lock, ArrowRight, ShieldCheck, Eye, EyeOff, Check, X, Info, ChevronDown, UserCog } from 'lucide-react';

const RegisterPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [strength, setStrength] = useState({ score: 0, label: 'Weak', color: 'bg-slate-200' });
    const [showTooltip, setShowTooltip] = useState(false);

    const { register } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const passwordCriteria = [
        { label: 'At least 8 characters', met: password.length >= 8 },
        { label: 'At least one number', met: /\d/.test(password) },
        { label: 'Upper & lower case letters', met: /[a-z]/.test(password) && /[A-Z]/.test(password) },
        { label: 'At least one special character', met: /[^A-Za-z0-9]/.test(password) },
    ];

    useEffect(() => {
        const metCount = passwordCriteria.filter(c => c.met).length;
        if (password.length === 0) {
            setStrength({ score: 0, label: 'Weak', color: 'bg-slate-200' });
        } else if (metCount <= 1) {
            setStrength({ score: 1, label: 'Weak', color: 'bg-red-500' });
        } else if (metCount <= 3) {
            setStrength({ score: 2, label: 'Average', color: 'bg-yellow-500' });
        } else {
            setStrength({ score: 3, label: 'Strong', color: 'bg-emerald-500' });
        }
    }, [password]);

    const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;
    const isPasswordStrong = passwordCriteria.every(c => c.met);
    const canSubmit = name && email && role && isPasswordStrong && passwordsMatch;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!canSubmit) return;

        setIsSubmitting(true);
        try {
            await register(name, email, password, confirmPassword, role);
            showToast('Account created successfully! Please log in.', 'success');
            navigate('/login');
        } catch (err) {
            showToast(err.message || 'Registration failed', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-dark-bg font-sans overflow-hidden transition-colors duration-500">
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
                    
                    <div className="bg-white/10 backdrop-blur-sm p-2 rounded-4xl border border-white/20 shadow-2xl mb-12 transform hover:scale-[1.02] transition-transform duration-500">
                        <img src={illustration} alt="IT Workspace" className="w-full h-auto rounded-[1.8rem]" />
                    </div>

                    <h2 className="text-4xl font-bold text-white mb-4 leading-tight">Secure Your IT Infrastructure</h2>
                    <p className="text-blue-100 text-lg font-medium opacity-90">
                        Join hundreds of IT professionals managing assets with precision and ease.
                    </p>
                </div>
            </div>

            {/* Right Side: Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 lg:p-20 relative overflow-y-auto">
                <div className="w-full max-w-md">
                    <div className="mb-8">
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-3 tracking-tight transition-colors">Create Account</h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium transition-colors">Elevate your asset management standards today.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="group">
                            <label className="block text-sm font-extrabold text-slate-700 dark:text-slate-300 mb-1.5 ml-1 transition-colors">Full Name</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors">
                                    <User className="w-5 h-5" />
                                </span>
                                <input
                                    type="text"
                                    placeholder="Vatsal Admin"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-dark-border rounded-2xl text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/40 focus:border-indigo-500 transition-all duration-300 shadow-sm"
                                    required
                                />
                            </div>
                        </div>

                        <div className="group">
                            <label className="block text-sm font-extrabold text-slate-700 dark:text-slate-300 mb-1.5 ml-1 transition-colors">Email Address</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors">
                                    <Mail className="w-5 h-5" />
                                </span>
                                <input
                                    type="email"
                                    placeholder="admin@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-dark-border rounded-2xl text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/40 focus:border-indigo-500 transition-all duration-300 shadow-sm"
                                    required
                                />
                            </div>
                        </div>

                        <div className="group">
                            <label className="block text-sm font-extrabold text-slate-700 dark:text-slate-300 mb-1.5 ml-1 transition-colors">Select Role</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors pointer-events-none">
                                    <UserCog className="w-5 h-5" />
                                </span>
                                <select
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    className={`w-full pl-12 pr-10 py-4 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-dark-border rounded-2xl font-semibold focus:outline-none focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/40 focus:border-indigo-500 transition-all duration-300 shadow-sm appearance-none cursor-pointer ${role ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}
                                    required
                                >
                                    <option value="" disabled>Choose your role</option>
                                    <option value="Admin">Admin</option>
                                    <option value="Manager">Manager</option>
                                    <option value="Employee">Employee</option>
                                    <option value="Auditor">Auditor</option>
                                </select>
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                                    <ChevronDown className="w-5 h-5" />
                                </span>
                            </div>
                        </div>

                        <div className="group relative">
                            <div className="flex items-center justify-between mb-1.5 ml-1">
                                <label className="block text-sm font-extrabold text-slate-700 dark:text-slate-300 transition-colors">Create Password</label>
                                <button 
                                    type="button"
                                    onMouseEnter={() => setShowTooltip(true)}
                                    onMouseLeave={() => setShowTooltip(false)}
                                    className="text-slate-400 hover:text-indigo-600 transition-colors"
                                >
                                    <Info className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Tooltip */}
                            {showTooltip && (
                                <div className="absolute right-0 bottom-full mb-4 w-64 bg-white dark:bg-slate-800 border border-slate-100 dark:border-dark-border p-4 rounded-2xl shadow-2xl z-50 animate-fade-in-up">
                                    <div className="absolute -bottom-2 right-4 w-4 h-4 bg-white dark:bg-slate-800 border-b border-r border-slate-100 dark:border-dark-border rotate-45"></div>
                                    <p className="text-xs font-black text-slate-800 dark:text-white mb-3 border-b border-slate-50 dark:border-slate-700 pb-2">Password Requirements:</p>
                                    <ul className="space-y-2">
                                        {passwordCriteria.map((c, i) => (
                                            <li key={i} className={`flex items-center text-[11px] font-bold ${c.met ? 'text-emerald-600 dark:text-emerald-500' : 'text-slate-500 dark:text-slate-400'}`}>
                                                {c.met ? <Check className="w-3.5 h-3.5 mr-2 shrink-0" /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 mr-3 underline-offset-4 ml-1"></div>}
                                                <span className={c.met ? 'line-through opacity-70' : ''}>{c.label}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors">
                                    <Lock className="w-5 h-5" />
                                </span>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-12 py-4 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-dark-border rounded-2xl text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/40 focus:border-indigo-500 transition-all duration-300 shadow-sm"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" /> }
                                </button>
                            </div>

                            {/* Strength Indicator */}
                            <div className="mt-4 px-1">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 transition-colors">Strength: <span className={strength.label === 'Strong' ? 'text-emerald-600 dark:text-emerald-500' : strength.label === 'Average' ? 'text-yellow-600 dark:text-yellow-500' : 'text-red-600 dark:text-red-500'}>{strength.label}</span></span>
                                </div>
                                <div className="flex gap-1.5 h-1.5">
                                    {[1, 2, 3].map((s) => (
                                        <div 
                                            key={s} 
                                            className={`flex-1 rounded-full transition-all duration-500 ${s <= strength.score ? strength.score === 1 ? 'bg-red-500' : strength.score === 2 ? 'bg-yellow-500' : 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'}`}
                                        ></div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="group">
                            <label className="block text-sm font-extrabold text-slate-700 dark:text-slate-300 mb-1.5 ml-1 transition-colors">Confirm Password</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors">
                                    <Lock className="w-5 h-5" />
                                </span>
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className={`w-full pl-12 pr-12 py-4 bg-white dark:bg-slate-800/50 border rounded-2xl text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-4 transition-all duration-300 shadow-sm ${
                                        confirmPassword.length > 0 
                                            ? passwordsMatch 
                                                ? 'border-emerald-200 focus:ring-emerald-100 dark:focus:ring-emerald-900/40 focus:border-emerald-500' 
                                                : 'border-red-200 focus:ring-red-100 dark:focus:ring-red-900/40 focus:border-red-500'
                                            : 'border-slate-200 dark:border-dark-border focus:ring-indigo-100 dark:focus:ring-indigo-900/40 focus:border-indigo-500'
                                    }`}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" /> }
                                </button>
                            </div>
                            {confirmPassword.length > 0 && (
                                <p className={`mt-2 ml-1 text-[11px] font-bold flex items-center transition-colors ${passwordsMatch ? 'text-emerald-600 dark:text-emerald-500' : 'text-red-500 dark:text-red-400'}`}>
                                    {passwordsMatch ? <Check className="w-3.5 h-3.5 mr-1.5" /> : <X className="w-3.5 h-3.5 mr-1.5" />}
                                    {passwordsMatch ? 'Passwords match perfectly' : 'Passwords do not match yet'}
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={!canSubmit || isSubmitting}
                            className={`w-full font-black py-4 rounded-2xl shadow-xl transition-all duration-300 flex items-center justify-center space-x-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group ${
                                canSubmit 
                                    ? 'bg-linear-to-r from-indigo-600 to-blue-600 text-white shadow-indigo-100 dark:shadow-none hover:shadow-hover hover:-translate-y-1 hover:scale-[1.01]' 
                                    : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 shadow-none'
                            }`}
                        >
                            {isSubmitting ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span>Sign Up Now</span>
                                    <ArrowRight className={`w-5 h-5 transition-transform ${canSubmit ? 'group-hover:translate-x-1' : ''}`} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-slate-500 dark:text-slate-400 font-bold transition-colors">
                            Already have an account? <Link to="/login" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">Log In</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
