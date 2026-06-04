import React, { useState, useEffect, useRef } from 'react';
import {
  User, Mail, Phone, MapPin, Shield, Building,
  CheckCircle, ArrowRight, CloudUpload, Lock, Eye, EyeOff, KeyRound, Camera, Trash2
} from 'lucide-react';
import { EnterpriseAPI } from '../services/api';

interface UserProfileTabProps {
  ownerName: string;
  companyName: string;
  userAvatar: string;
  onUpdateUser: (ownerName: string, companyName: string, avatarUrl: string) => void;
}

interface UserProfile {
  ownerName: string;
  companyName: string;
  email: string;
  phone: string;
  gstNumber: string;
  address: string;
  avatarUrl: string;
}

export default function UserProfileTab({ ownerName, companyName, userAvatar, onUpdateUser }: UserProfileTabProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<UserProfile>({
    ownerName,
    companyName,
    email: '',
    phone: '',
    gstNumber: '',
    address: '',
    avatarUrl: userAvatar,
  });

  const [avatarPreview, setAvatarPreview] = useState<string>(userAvatar);
  const [isSaving, setIsSaving] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [errorText, setErrorText] = useState('');

  // Password change state
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Load user profile from server on mount
  useEffect(() => {
    const userId = localStorage.getItem('ebt_user_id');
    const email = localStorage.getItem('ebt_user_email') || '';

    if (userId) {
      EnterpriseAPI.getUserProfile(userId)
        .then((user) => {
          const av = user.avatarUrl || '';
          setProfile({
            ownerName: user.ownerName,
            companyName: user.companyName,
            email: user.email,
            phone: user.phone || '',
            gstNumber: user.gstNumber || '',
            address: user.address || '',
            avatarUrl: av,
          });
          setAvatarPreview(av);
        })
        .catch(() => {
          setProfile(prev => ({ ...prev, ownerName, companyName, email, avatarUrl: userAvatar }));
          setAvatarPreview(userAvatar);
        });
    } else {
      setProfile(prev => ({ ...prev, ownerName, companyName, email, avatarUrl: userAvatar }));
      setAvatarPreview(userAvatar);
    }
  }, [ownerName, companyName, userAvatar]);

  const handleChange = (field: keyof UserProfile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  // Avatar upload handler — converts to base64
  const handleAvatarUpload = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Limit to 2MB
    if (file.size > 2 * 1024 * 1024) {
      setErrorText('Image too large. Please use a file under 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      setAvatarPreview(dataUrl);
      setProfile(prev => ({ ...prev, avatarUrl: dataUrl }));
      setErrorText('');
    };
    reader.readAsDataURL(file);
    // Reset so same file can be re-selected
    e.target.value = '';
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview('');
    setProfile(prev => ({ ...prev, avatarUrl: '' }));
  };

  // Get initials fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(n => n[0].toUpperCase())
      .join('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const userId = localStorage.getItem('ebt_user_id');
    if (!userId) {
      setErrorText('User session not found. Please log in again.');
      return;
    }

    setIsSaving(true);
    setErrorText('');

    try {
      const result = await EnterpriseAPI.updateUserProfile(userId, {
        ownerName: profile.ownerName,
        companyName: profile.companyName,
        phone: profile.phone,
        gstNumber: profile.gstNumber,
        address: profile.address,
        avatarUrl: profile.avatarUrl,
      });

      // Update localStorage and parent state (including avatar)
      localStorage.setItem('ebt_logged_in_user', result.user.ownerName);
      localStorage.setItem('ebt_logged_in_company', result.user.companyName);
      localStorage.setItem('ebt_user_avatar', result.user.avatarUrl || '');
      onUpdateUser(result.user.ownerName, result.user.companyName, result.user.avatarUrl || '');

      setIsSaving(false);
      setIsCompleted(true);
      setTimeout(() => setIsCompleted(false), 2500);
    } catch (err: any) {
      setIsSaving(false);
      setErrorText(err.message || 'Failed to save profile. Please try again.');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!currentPassword) {
      setPasswordError('Please enter your current password.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    const email = localStorage.getItem('ebt_user_email') || profile.email;
    setIsSavingPassword(true);

    try {
      await EnterpriseAPI.login(email, currentPassword);
      await EnterpriseAPI.resetPassword(email, newPassword);
      setPasswordSuccess('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordSection(false);
    } catch (err: any) {
      setPasswordError(err.message || 'Current password is incorrect.');
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleAvatarFileChange}
      />

      {/* Header */}
      <section className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-1">
          <h1 className="font-display text-2xl md:text-3xl text-brand-gray-dark font-extrabold">User Profile</h1>
          <span className="self-start sm:self-center bg-brand-primary-light/10 text-brand-primary text-[10px] px-3 py-1 rounded-full uppercase font-bold tracking-wider">
            Account Settings
          </span>
        </div>
        <p className="text-sm text-brand-gray-medium leading-relaxed font-sans font-medium">
          Update your personal details and profile photo. Changes reflect in the navbar immediately.
        </p>
      </section>

      {/* Avatar Card */}
      <div className="bg-white border border-stone-200 rounded-xl p-6 flex flex-col sm:flex-row items-center gap-6 shadow-sm">
        
        {/* Avatar upload area */}
        <div className="relative shrink-0 group">
          <div className="w-20 h-20 rounded-full overflow-hidden ring-4 ring-brand-primary/10 bg-brand-primary/10 flex items-center justify-center">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="User avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl font-extrabold text-brand-primary font-display select-none">
                {getInitials(profile.ownerName || ownerName) || <User className="w-9 h-9" />}
              </span>
            )}
          </div>

          {/* Hover overlay */}
          <button
            type="button"
            onClick={handleAvatarUpload}
            title="Upload photo"
            className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          >
            <Camera className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Info + actions */}
        <div className="flex-1 text-center sm:text-left">
          <p className="font-display font-extrabold text-lg text-brand-gray-dark">{profile.ownerName || 'Your Name'}</p>
          <p className="text-sm text-brand-gray-medium">{profile.companyName || 'Your Company'}</p>
          <p className="text-xs text-stone-400 mt-0.5">{profile.email || 'your@email.com'}</p>

          <div className="flex items-center gap-2 mt-3 justify-center sm:justify-start flex-wrap">
            <button
              type="button"
              onClick={handleAvatarUpload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-white bg-brand-primary rounded-lg hover:bg-brand-primary-light transition-colors cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5" />
              {avatarPreview ? 'Change Photo' : 'Upload Photo'}
            </button>
            {avatarPreview && (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Remove
              </button>
            )}
          </div>
          <p className="text-[10px] text-stone-400 mt-1.5">PNG, JPG up to 2MB. Shows in navbar after saving.</p>
        </div>
      </div>

      {errorText && (
        <div className="p-3 bg-red-50 text-red-600 border border-red-200 text-xs font-medium rounded-lg">
          {errorText}
        </div>
      )}

      {/* Profile Form */}
      <form onSubmit={handleSave} className="bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden font-sans">

        {/* Personal Info */}
        <div className="p-6 md:p-8 border-b border-stone-100">
          <h3 className="font-display text-base font-bold text-brand-gray-dark mb-4">Personal Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-brand-gray-medium">Owner / Full Name</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
                  <User className="w-4 h-4" />
                </span>
                <input
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary text-xs"
                  placeholder="Your full name"
                  required
                  type="text"
                  value={profile.ownerName}
                  onChange={(e) => handleChange('ownerName', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-brand-gray-medium">Company Name</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
                  <Building className="w-4 h-4" />
                </span>
                <input
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary text-xs"
                  placeholder="Your company name"
                  required
                  type="text"
                  value={profile.companyName}
                  onChange={(e) => handleChange('companyName', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-brand-gray-medium">Email Address (read-only)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-stone-100 outline-none text-xs text-stone-400 cursor-not-allowed"
                  type="email"
                  value={profile.email}
                  readOnly
                  disabled
                />
              </div>
              <p className="text-[10px] text-stone-400">Email cannot be changed. Contact support if needed.</p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-brand-gray-medium">Phone Number</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
                  <Phone className="w-4 h-4" />
                </span>
                <input
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary text-xs"
                  placeholder="+91 98765 43210"
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                />
              </div>
            </div>

          </div>
        </div>

        {/* Business Info */}
        <div className="p-6 md:p-8 bg-stone-50/45 border-b border-stone-100">
          <h3 className="font-display text-base font-bold text-brand-gray-dark mb-4">Business Details</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-brand-gray-medium">GST Number (Optional)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
                  <Shield className="w-4 h-4" />
                </span>
                <input
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-white focus:bg-white outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary text-xs uppercase font-mono"
                  placeholder="22AAAAA0000A1Z5"
                  type="text"
                  value={profile.gstNumber}
                  onChange={(e) => handleChange('gstNumber', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-brand-gray-medium">Business Address</label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-stone-400">
                  <MapPin className="w-4 h-4" />
                </span>
                <textarea
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-white focus:bg-white outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary text-xs resize-none"
                  placeholder="Full registered address"
                  rows={2}
                  value={profile.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                />
              </div>
            </div>

          </div>
        </div>

        {/* Form Footer */}
        <div className="bg-stone-50 p-6 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-4 select-none">
          <div className="flex items-center gap-2 text-stone-500 text-xs">
            <CloudUpload className="w-5 h-5 text-brand-primary" />
            <span>Photo &amp; details saved to cloud database</span>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className={`px-8 py-2.5 text-xs font-bold text-white rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
              isCompleted ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-brand-primary hover:bg-brand-primary-light active:scale-95'
            }`}
          >
            {isSaving ? (
              <span className="inline-flex items-center gap-1.5">
                <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            ) : isCompleted ? (
              <>
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Profile Updated!</span>
              </>
            ) : (
              <>
                <span>Save Profile</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>

      </form>

      {/* Change Password */}
      <div className="bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden font-sans">
        <button
          type="button"
          onClick={() => setShowPasswordSection(!showPasswordSection)}
          className="w-full p-6 flex items-center justify-between text-left hover:bg-stone-50 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-lg bg-brand-primary/10 text-brand-primary">
              <Lock className="w-4 h-4" />
            </span>
            <div>
              <p className="text-sm font-bold text-brand-gray-dark">Change Password</p>
              <p className="text-xs text-brand-gray-medium">Update your account password for security</p>
            </div>
          </div>
          <ArrowRight className={`w-4 h-4 text-stone-400 transition-transform ${showPasswordSection ? 'rotate-90' : ''}`} />
        </button>

        {showPasswordSection && (
          <form onSubmit={handlePasswordChange} className="border-t border-stone-100 p-6 space-y-4">

            {passwordError && (
              <div className="p-3 bg-red-50 text-red-600 border border-red-200 text-xs font-medium rounded-lg">
                {passwordError}
              </div>
            )}
            {passwordSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-600 border border-emerald-200 text-xs font-medium rounded-lg flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                {passwordSuccess}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-brand-gray-medium">Current Password</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary text-xs"
                    placeholder="Current password"
                    type={showCurrentPwd ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                  <button type="button" onClick={() => setShowCurrentPwd(!showCurrentPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 cursor-pointer">
                    {showCurrentPwd ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-brand-gray-medium">New Password</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
                    <KeyRound className="w-4 h-4" />
                  </span>
                  <input
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary text-xs"
                    placeholder="New password"
                    type={showNewPwd ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <button type="button" onClick={() => setShowNewPwd(!showNewPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 cursor-pointer">
                    {showNewPwd ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-brand-gray-medium">Confirm New Password</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
                    <KeyRound className="w-4 h-4" />
                  </span>
                  <input
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary text-xs"
                    placeholder="Repeat new password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSavingPassword}
                className="px-6 py-2.5 text-xs font-bold text-white bg-brand-primary rounded-xl shadow-sm hover:bg-brand-primary-light transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                {isSavingPassword ? (
                  <span className="inline-flex items-center gap-1.5">
                    <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </span>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Update Password</span>
                  </>
                )}
              </button>
            </div>

          </form>
        )}
      </div>

    </div>
  );
}
