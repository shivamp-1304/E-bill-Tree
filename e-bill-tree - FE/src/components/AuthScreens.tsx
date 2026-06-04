import { 
  Building, User, ShieldCheck, Mail, Phone, MapPin, Lock, 
  KeyRound, ArrowRight, Eye, EyeOff, Shield, HeartHandshake, CheckCircle
} from 'lucide-react';
import React, { useState } from 'react';
import { ScreenState } from '../types';
import { EnterpriseAPI } from '../services/api';

interface AuthScreensProps {
  currentScreen: ScreenState;
  setScreenState: (screen: ScreenState) => void;
  onLoginSuccess: (ownerName: string, companyName: string) => void;
}

export default function AuthScreens({ currentScreen, setScreenState, onLoginSuccess }: AuthScreensProps) {
  // Input states
  const [companyName, setCompanyName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorText, setErrorText] = useState('');
  const [successText, setSuccessText] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Temporary storage during step-wise flow (e.g. email targeted during verification)
  const [targetContact, setTargetContact] = useState('admin@ebilltree.com');
  const [generatedOtp, setGeneratedOtp] = useState('');

  // Verify OTP local state
  const [otp, setOtp] = useState(['', '', '', '', '', '']);

  // Handle register submission -> goes to OTP verification
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !ownerName || !email || !password) {
      setErrorText("Please fill out all required fields.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorText("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    setErrorText('');

    try {
      const result = await EnterpriseAPI.register({
        ownerName, companyName, email, password, phone, gstNumber, address
      });
      setGeneratedOtp(result.otp);
      setTargetContact(email);
      setSuccessText(`Account created! OTP sent to ${email}`);
      setScreenState('verify-otp');
    } catch (err: any) {
      setErrorText(err.message || "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Login submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorText("Please enter your credentials.");
      return;
    }

    setIsSubmitting(true);
    setErrorText('');

    try {
      const result = await EnterpriseAPI.login(email, password);
      localStorage.setItem('ebt_logged_in_user', result.ownerName);
      localStorage.setItem('ebt_logged_in_company', result.companyName);
      localStorage.setItem('ebt_user_email', result.email);
      localStorage.setItem('ebt_user_id', result.userId);
      onLoginSuccess(result.ownerName, result.companyName);
    } catch (err: any) {
      setErrorText(err.message || "Login failed. Please check your credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Send OTP
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorText("Please provide your registered email.");
      return;
    }
    setIsSubmitting(true);
    setErrorText('');

    try {
      const result = await EnterpriseAPI.forgotPassword(email);
      setGeneratedOtp(result.otp);
      setTargetContact(email);
      setSuccessText(`OTP sent to ${email}`);
      setScreenState('verify-otp');
    } catch (err: any) {
      setErrorText(err.message || "Failed to send OTP.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Verify OTP -> goes to reset password
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setErrorText("Please enter the complete 6-digit OTP.");
      return;
    }
    setIsSubmitting(true);
    setErrorText('');

    try {
      await EnterpriseAPI.verifyOtp(targetContact, otpString);
      setSuccessText("OTP verified successfully!");
      setScreenState('reset-password');
    } catch (err: any) {
      setErrorText(err.message || "OTP verification failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Reset Password -> returns to Login
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password !== confirmPassword) {
      setErrorText("Passwords must be valid and identical.");
      return;
    }
    setIsSubmitting(true);
    setErrorText('');

    try {
      await EnterpriseAPI.resetPassword(targetContact, password);
      setSuccessText("Password reset successfully! Please login.");
      setScreenState('login');
    } catch (err: any) {
      setErrorText(err.message || "Password reset failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpChange = (value: string, idx: number) => {
    if (/^[0-9]?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[idx] = value;
      setOtp(newOtp);
      // Auto focus next input
      if (value && idx < 5) {
        const nextInput = document.getElementById(`otp-${idx + 1}`);
        nextInput?.focus();
      }
    }
  };

  const brandingLeftPanel = () => {
    const mainIdentityUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuDsxHboPD_-07VCWd_v19FL8zYElMnyBg_HmaJcnaah0Hyx2L0NbeHsN-kVLQ0i5e9Na7lNKWm5pvgAZhk7th8rXKkRO6ur8yYuQAcIlNzl80oWwEReAp8SUFK1xyO1bLEDcixl0ofCnqf-63ONnrBNDuZDREfDiuZ1cBTJ3gPngyFmaLi2gISVIfxdQyAWX1-aV_P-Wqmg7QIO5TECBT6oQvXpiZCsqKQ2wZ1OOQeoWQDvc6N1ZaqB5RiwuLk4Wj68bb5u8TPkxwRR";

    return (
      <div className="hidden md:flex md:col-span-5 bg-stone-50 select-none flex-col items-center justify-center p-12 relative overflow-hidden border-r border-stone-200">
        <div className="relative group">
          <div className="w-80 h-80 relative z-10">
            <img 
              alt="E-bill Tree Brand Identity" 
              className="w-full h-full object-contain" 
              src={mainIdentityUrl} 
            />
          </div>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-48 h-8 bg-black/5 blur-xl rounded-full"></div>
        </div>
        <div className="mt-8 text-center space-y-4 max-w-sm">
          <h2 className="font-display text-2xl font-bold tracking-tight text-brand-gray-dark">
            Digital Growth for Modern Finance
          </h2>
          <p className="font-sans text-sm text-brand-gray-medium leading-relaxed">
            Streamline your invoicing, e-way bills, and financial reporting with our dependable e-billing portal.
          </p>
        </div>
        <div className="absolute bottom-10 flex gap-6 text-brand-gray-medium/60 font-sans text-xs font-semibold">
          <span>Trusted by 10k+ Businesses</span>
          <span>•</span>
          <span>ISO Certified Security</span>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-brand-bg text-brand-gray-dark min-h-screen flex items-center justify-center p-4 md:p-8 relative">
      
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-1/3 h-1/2 bg-brand-primary/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-1/4 h-1/3 bg-brand-secondary/5 rounded-full blur-[100px]"></div>
        <div className="absolute inset-0 leaf-pattern"></div>
      </div>

      <main className="relative z-10 w-full max-w-[1100px] grid grid-cols-1 md:grid-cols-12 min-h-[680px] bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-200">
        
        {brandingLeftPanel()}

        {/* Form Container Right Side */}
        <div className="col-span-1 md:col-span-7 flex flex-col justify-center p-6 md:p-12 bg-white">
          <div className="max-w-md w-full mx-auto space-y-6">

            {/* Back Button for non-root screens */}
            {(currentScreen === 'forgot-password' || currentScreen === 'verify-otp' || currentScreen === 'reset-password') && (
              <button 
                onClick={() => setScreenState('login')}
                className="text-xs font-semibold text-brand-secondary hover:underline cursor-pointer inline-flex items-center gap-1"
              >
                ← Back to Login
              </button>
            )}

            {errorText && (
              <div id="auth-error-alert" className="p-3 bg-red-50 text-red-600 border border-red-200 text-xs font-medium rounded-lg">
                {errorText}
              </div>
            )}

            {successText && (
              <div id="auth-success-alert" className="p-3 bg-emerald-50 text-emerald-600 border border-emerald-200 text-xs font-medium rounded-lg">
                {successText}
              </div>
            )}

            {generatedOtp && currentScreen === 'verify-otp' && (
              <div className="p-3 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-medium rounded-lg">
                <strong>Simulated OTP:</strong> {generatedOtp} <span className="text-amber-500">(for demo purposes)</span>
              </div>
            )}

            {/* SCREEN 1: LOGIN */}
            {currentScreen === 'login' && (
              <div id="login-container">
                <div className="mb-6">
                  <h3 className="font-display text-2xl md:text-3xl text-brand-gray-dark mb-1 font-extrabold">Welcome Back</h3>
                  <p className="text-sm text-brand-gray-medium">Access your portal and manage your financial ecosystem.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                  {/* Email / Mobile input */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-brand-gray-medium" htmlFor="identifier">
                      Email / Mobile number
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400">
                        <User className="w-4 h-4" />
                      </span>
                      <input 
                        className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-1 focus:ring-brand-primary focus:border-brand-primary outline-none transition-all text-sm font-sans"
                        id="identifier" 
                        name="identifier" 
                        placeholder="Enter email or phone" 
                        required 
                        type="text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-brand-gray-medium" htmlFor="password">
                      Password
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400">
                        <Lock className="w-4 h-4" />
                      </span>
                      <input 
                        className="w-full pl-11 pr-11 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-1 focus:ring-brand-primary focus:border-brand-primary outline-none transition-all text-sm font-sans"
                        id="password" 
                        name="password" 
                        placeholder="Enter password" 
                        required 
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button 
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-brand-gray-dark transition-colors cursor-pointer"
                        onClick={() => setShowPassword(!showPassword)} 
                        type="button"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember and Forgot password link */}
                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input type="checkbox" className="w-4 h-4 rounded border-stone-300 text-brand-primary focus:ring-brand-primary" />
                      <span className="text-xs text-brand-gray-medium group-hover:text-brand-gray-dark select-none">Remember me</span>
                    </label>
                    <button 
                      type="button" 
                      onClick={() => setScreenState('forgot-password')}
                      className="text-xs font-semibold text-brand-secondary hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>

                  {/* Submit Login Button */}
                  <button 
                    disabled={isSubmitting}
                    className="w-full bg-brand-primary text-white font-semibold text-sm py-3.5 rounded-xl shadow-sm hover:shadow active:scale-98 transition-all pointer-events-auto cursor-pointer flex items-center justify-center gap-2"
                    type="submit"
                  >
                    {isSubmitting ? (
                      <span className="inline-flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Logging in...
                      </span>
                    ) : (
                      "Login"
                    )}
                  </button>
                </form>

                {/* Switch to register */}
                <div className="mt-8 text-center pt-2">
                  <p className="text-xs text-brand-gray-medium">
                    Don't have an account? 
                    <button 
                      onClick={() => setScreenState('register')} 
                      className="text-brand-primary font-bold hover:underline ml-1 cursor-pointer"
                    >
                      Register
                    </button>
                  </p>
                </div>

                {/* Extra Trust signals */}
                <div className="mt-8 pt-6 border-t border-stone-100 grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-stone-500">
                    <ShieldCheck className="w-5 h-5 text-brand-primary" />
                    <span className="text-xs font-semibold text-brand-gray-medium">Secure Access</span>
                  </div>
                  <div className="flex items-center gap-2 text-stone-500">
                    <HeartHandshake className="w-5 h-5 text-brand-primary" />
                    <span className="text-xs font-semibold text-brand-gray-medium">24/7 Support</span>
                  </div>
                </div>
              </div>
            )}


            {/* SCREEN 2: REGISTER (CREATE ACCOUNT) */}
            {currentScreen === 'register' && (
              <div id="register-container" className="space-y-4">
                <div>
                  <h3 className="font-display text-2xl font-extrabold mb-1">Create Account</h3>
                  <p className="text-xs text-brand-gray-medium">Start your 14-day free trial today. No credit card required.</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-3.5">
                  
                  {/* Company Name */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-brand-gray-medium">
                      Company Name *
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400">
                        <Building className="w-4 h-4" />
                      </span>
                      <input 
                        className="w-full pl-11 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:ring-1 focus:ring-brand-primary focus:border-brand-primary outline-none text-xs"
                        placeholder="Enter your registered business name" 
                        required 
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Twin Columns: Owner Name & GST */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-brand-gray-medium">Owner Name *</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400">
                          <User className="w-4 h-4" />
                        </span>
                        <input 
                          className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:ring-1 focus:ring-brand-primary focus:border-brand-primary outline-none text-xs"
                          placeholder="Full name" 
                          required 
                          type="text"
                          value={ownerName}
                          onChange={(e) => setOwnerName(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-brand-gray-medium">GST Number (Optional)</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400">
                          <Shield className="w-4 h-4" />
                        </span>
                        <input 
                          className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:ring-1 focus:ring-brand-primary focus:border-brand-primary outline-none text-xs uppercase"
                          placeholder="22AAAAA0000A1Z5" 
                          type="text"
                          value={gstNumber}
                          onChange={(e) => setGstNumber(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Twin Columns: Business Email & Mobile */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-brand-gray-medium">Business Email *</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400">
                          <Mail className="w-4 h-4" />
                        </span>
                        <input 
                          className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:ring-1 focus:ring-brand-primary focus:border-brand-primary outline-none text-xs"
                          placeholder="name@company.com" 
                          required 
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-brand-gray-medium">Mobile Number</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400">
                          <Phone className="w-4 h-4" />
                        </span>
                        <input 
                          className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:ring-1 focus:ring-brand-primary focus:border-brand-primary outline-none text-xs"
                          placeholder="+91 98765 43210" 
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Business Address */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-brand-gray-medium">Business Address</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400">
                        <MapPin className="w-4 h-4" />
                      </span>
                      <input 
                        className="w-full pl-11 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:ring-1 focus:ring-brand-primary focus:border-brand-primary outline-none text-xs"
                        placeholder="Full registered office address" 
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Twin Columns: Pass & Confirm Pass */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-brand-gray-medium">Password *</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400">
                          <Lock className="w-4 h-4" />
                        </span>
                        <input 
                          className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:ring-1 focus:ring-brand-primary focus:border-brand-primary outline-none text-xs"
                          placeholder="Password" 
                          required 
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-brand-gray-medium">Confirm Password *</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400">
                          <KeyRound className="w-4 h-4" />
                        </span>
                        <input 
                          className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:ring-1 focus:ring-brand-primary focus:border-brand-primary outline-none text-xs"
                          placeholder="Repeat password" 
                          required 
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* T&C checkbox */}
                  <div className="flex items-center gap-2 pt-1">
                    <input type="checkbox" required className="w-4 h-4 rounded border-stone-300 text-brand-primary focus:ring-brand-primary" />
                    <span className="text-xs text-brand-gray-medium select-none">
                      I agree to the <span className="text-brand-primary hover:underline font-semibold cursor-pointer">Terms of Service</span> and <span className="text-brand-primary hover:underline font-semibold cursor-pointer">Privacy Policy</span>.
                    </span>
                  </div>

                  {/* Register and submit button */}
                  <button 
                    disabled={isSubmitting}
                    className="w-full bg-[#3d6a00] hover:bg-brand-primary-light text-white font-semibold text-sm py-3 rounded-xl shadow-sm active:scale-97 transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
                    type="submit"
                  >
                    <span>Register</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                {/* Back to Login link */}
                <div className="text-center">
                  <p className="text-xs text-brand-gray-medium">
                    Already have an account? 
                    <button 
                      onClick={() => setScreenState('login')} 
                      className="text-brand-secondary font-bold hover:underline ml-1 cursor-pointer"
                    >
                      Log In
                    </button>
                  </p>
                </div>
              </div>
            )}


            {/* SCREEN 3: FORGOT PASSWORD */}
            {currentScreen === 'forgot-password' && (
              <div id="forgot-password-container" className="space-y-6">
                <div className="text-center space-y-2">
                  <div className="mx-auto w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                    <KeyRound className="w-6 h-6" />
                  </div>
                  <h3 className="font-display text-xl font-extrabold text-brand-gray-dark">Forgot Password?</h3>
                  <p className="text-xs text-brand-gray-medium leading-relaxed max-w-sm mx-auto">
                    Enter your registered email or mobile number. We'll send a one-time password (OTP) to reset your account.
                  </p>
                </div>

                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-brand-gray-medium">Email or Mobile Number</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400">
                        <Mail className="w-4 h-4" />
                      </span>
                      <input 
                        className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-1 focus:ring-brand-primary focus:border-brand-primary outline-none text-xs"
                        placeholder="e.g. john@example.com or +1 234..." 
                        required 
                        type="text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <span className="text-[10px] text-zinc-400 block pt-0.5">Standard messaging rates may apply for SMS.</span>
                  </div>

                  <button 
                    disabled={isSubmitting}
                    className="w-full bg-[#76bc21] hover:bg-brand-primary text-white font-semibold text-sm py-3.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-98"
                    type="submit"
                  >
                    <span>Send OTP</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}


            {/* SCREEN 4: VERIFY OTP IDENTITY */}
            {currentScreen === 'verify-otp' && (
              <div id="verify-otp-container" className="space-y-6">
                <div className="text-center space-y-2">
                  <div className="mx-auto w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h3 className="font-display text-xl font-extrabold text-brand-gray-dark">Verify Identity</h3>
                  <p className="text-xs text-brand-gray-medium leading-relaxed max-w-sm mx-auto">
                    We've sent a 6-digit verification code to <span className="font-semibold text-brand-secondary">{targetContact || 'admin@ebilltree.com'}</span>. Please enter it below.
                  </p>
                </div>

                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  {/* OTP inputs */}
                  <div className="flex justify-between gap-2 max-w-xs mx-auto">
                    {otp.map((value, idx) => (
                      <input 
                        key={idx}
                        id={`otp-${idx}`}
                        className="w-12 h-12 text-center bg-stone-50 border border-stone-200 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary rounded-xl font-bold text-lg outline-none"
                        maxLength={1}
                        type="text"
                        value={value}
                        onChange={(e) => handleOtpChange(e.target.value, idx)}
                        onKeyDown={(e) => {
                          if (e.key === 'Backspace' && !value && idx > 0) {
                            const prevInput = document.getElementById(`otp-${idx - 1}`);
                            prevInput?.focus();
                          }
                        }}
                      />
                    ))}
                  </div>

                  <button 
                    className="w-full bg-brand-primary hover:bg-brand-primary-light text-white font-semibold text-sm py-3.5 rounded-xl shadow cursor-pointer flex items-center justify-center gap-2 active:scale-98"
                    type="submit"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Verify Account</span>
                  </button>
                </form>

                <div className="text-center">
                  <p className="text-xs text-brand-gray-medium">
                    Didn't receive the code? 
                    <button 
                      onClick={() => alert("Simulated: A new 6-digit code has been delivered to your device.")}
                      className="text-brand-secondary hover:underline font-bold ml-1 cursor-pointer"
                    >
                      Resend OTP
                    </button>
                  </p>
                </div>

                <div className="text-center text-[11px] text-zinc-400 font-sans border-t border-stone-100 pt-4">
                  Secured by E-bill Encryption
                </div>
              </div>
            )}


            {/* SCREEN 5: RESET PASSWORD */}
            {currentScreen === 'reset-password' && (
              <div id="reset-password-container" className="space-y-6">
                <div className="text-center space-y-2">
                  <div className="mx-auto w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                    <KeyRound className="w-6 h-6" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-brand-gray-dark">Reset your password</h3>
                  <p className="text-xs text-brand-gray-medium leading-relaxed max-w-sm mx-auto">
                    Please choose a strong password that you haven't used before for this portal.
                  </p>
                </div>

                <form onSubmit={handleResetPassword} className="space-y-4">
                  
                  {/* New Password */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-brand-gray-medium">New Password</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400">
                        <Lock className="w-3.5 h-3.5" />
                      </span>
                      <input 
                        className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-1 focus:ring-brand-primary focus:border-brand-primary outline-none text-xs"
                        placeholder="••••••••" 
                        required 
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                    {/* Visual strength indicators aligned with reset-password screen styling details */}
                    <div className="flex gap-1 pt-1.5">
                      <span className="h-1 flex-grow bg-emerald-500 rounded-full"></span>
                      <span className="h-1 flex-grow bg-emerald-500 rounded-full"></span>
                      <span className="h-1 flex-grow bg-emerald-300 rounded-full"></span>
                      <span className="h-1 flex-grow bg-stone-300 rounded-full font-mono"></span>
                    </div>
                    <span className="text-[10px] text-zinc-400 block pt-1">Minimum 8 characters with numbers and symbols.</span>
                  </div>

                  {/* Confirm password */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-brand-gray-medium">Confirm Password</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400">
                        <Shield className="w-3.5 h-3.5" />
                      </span>
                      <input 
                        className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-1 focus:ring-brand-primary focus:border-brand-primary outline-none text-xs"
                        placeholder="••••••••" 
                        required 
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                  </div>

                  <button 
                    className="w-full bg-brand-primary hover:bg-brand-primary-light text-white font-semibold text-sm py-3.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow active:scale-98"
                    type="submit"
                  >
                    <span>Reset password</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                </form>

                <div className="flex items-center justify-center gap-4 text-xs font-medium text-brand-gray-medium pt-2">
                  <span className="flex items-center gap-1"><ShieldCheck className="w-4 h-4 text-brand-primary" /> SSL SECURE</span>
                  <span className="h-3 w-[1px] bg-stone-300"></span>
                  <span className="flex items-center gap-1"><Lock className="w-4 h-4 text-brand-primary" /> AES-256 BIT</span>
                </div>
              </div>
            )}

          </div>
        </div>

      </main>

      {/* Mini disclaimer footer absolute on page bottom */}
      <footer className="fixed bottom-0 left-0 w-full py-4 px-6 border-t border-stone-200/40 text-stone-500 font-sans text-xs bg-white/75 flex justify-between items-center select-none z-0">
        <div>© 2026 E-bill Tree. All rights reserved.</div>
        <div className="flex gap-4">
          <a href="#" className="hover:underline">Privacy Policy</a>
          <a href="#" className="hover:underline">Terms of Service</a>
          <a href="#" className="hover:underline">Help Center</a>
        </div>
      </footer>
    </div>
  );
}
