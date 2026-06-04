import { 
  Building, ShieldCheck, Mail, Phone, MapPin, Lock, 
  Sparkles, CloudUpload, ArrowRight, Library, CheckCircle
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { CompanyProfile } from '../types';

interface CompanySetupTabProps {
  initialProfile: CompanyProfile;
  onSaveProfile: (profile: CompanyProfile) => void;
  onNextStep?: () => void;
}

export default function CompanySetupTab({ initialProfile, onSaveProfile, onNextStep }: CompanySetupTabProps) {
  const [profile, setProfile] = useState<CompanyProfile>({ ...initialProfile });
  const [logoPreview, setLogoPreview] = useState<string | null>(initialProfile.logoUrl || null);
  const [isSaving, setIsSaving] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Sync state if initialProfile changes
  useEffect(() => {
    setProfile({ ...initialProfile });
    if (initialProfile.logoUrl) {
      setLogoPreview(initialProfile.logoUrl);
    }
  }, [initialProfile]);

  const handleChange = (field: keyof CompanyProfile, value: string) => {
    const updated = { ...profile, [field]: value };
    setProfile(updated);
  };

  const handleLogoUploadClick = () => {
    // Simulated upload
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setLogoPreview(reader.result as string);
          setProfile(prev => ({ ...prev, logoUrl: reader.result as string }));
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const triggerSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    setTimeout(() => {
      onSaveProfile(profile);
      setIsSaving(false);
      setIsCompleted(true);
      
      setTimeout(() => {
        setIsCompleted(false);
        if (onNextStep) {
          onNextStep();
        }
      }, 1500);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      
      {/* Step Header */}
      <section className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-1">
          <h1 className="font-display text-2xl md:text-3xl text-brand-gray-dark font-extrabold">Company Profile</h1>
          <span className="self-start sm:self-center bg-brand-primary-light/10 text-brand-primary text-[10px] px-3 py-1 rounded-full uppercase font-bold tracking-wider">
            Step 1 of 3
          </span>
        </div>
        <p className="text-sm text-brand-gray-medium leading-relaxed font-sans font-medium">
          Complete your profile to start generating professional invoices and managing GST compliance.
        </p>
      </section>

      {/* Main Form Box */}
      <form onSubmit={triggerSave} id="company-setup-form" className="bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden font-sans">
        
        {/* Section 1: Company Branding & General */}
        <div className="p-6 md:p-8 border-b border-stone-100">
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Logo upload slot */}
            <div className="w-full lg:w-1/3 space-y-3">
              <h3 className="font-display text-base font-bold text-brand-gray-dark">Company Branding</h3>
              <p className="text-xs text-brand-gray-medium">Upload your company logo for professional-looking invoices.</p>
              
              <div 
                onClick={handleLogoUploadClick}
                className="aspect-square w-40 mx-auto lg:mx-0 rounded-xl border-2 border-dashed border-stone-200 hover:border-brand-primary flex flex-col items-center justify-center bg-stone-50 hover:bg-stone-50/50 transition-colors cursor-pointer group p-2 text-center"
              >
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain rounded-lg" />
                ) : (
                  <>
                    <span className="p-3 rounded-full bg-white shadow-sm text-stone-500 group-hover:text-brand-primary transition-colors">
                      <Building className="w-6 h-6" />
                    </span>
                    <span className="mt-2 text-xs font-semibold text-brand-gray-medium group-hover:text-brand-primary transition-colors">Upload Logo</span>
                    <p className="text-[9px] text-stone-400 mt-1">PNG, JPG (Max 5MB)</p>
                  </>
                )}
              </div>
            </div>

            {/* General business inputs */}
            <div className="w-full lg:w-2/3 space-y-4">
              <h3 className="font-display text-base font-bold text-brand-gray-dark">General Information</h3>
              
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-brand-gray-medium">Registered Company Name</label>
                <div className="relative">
                  <input 
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary text-xs"
                    placeholder="e.g. Acme Corporation Pvt Ltd" 
                    required 
                    type="text"
                    value={profile.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-brand-gray-medium">GST Number</label>
                  <input 
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary text-xs font-mono uppercase"
                    placeholder="22AAAAA0000A1Z5" 
                    required 
                    type="text"
                    value={profile.gstNumber}
                    onChange={(e) => {
                      const val = e.target.value;
                      handleChange('gstNumber', val);
                      // Auto-extract PAN from GST if valid pattern
                      if (val.length >= 12) {
                        const extractedPan = val.substring(2, 12);
                        if (/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i.test(extractedPan)) {
                          handleChange('panNumber', extractedPan.toUpperCase());
                        }
                      }
                    }}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-brand-gray-medium">PAN Number</label>
                  <input 
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary text-xs font-mono uppercase"
                    placeholder="ABCDE1234F" 
                    required 
                    type="text"
                    value={profile.panNumber || ''}
                    onChange={(e) => handleChange('panNumber', e.target.value)}
                  />
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* Section 2: Billing Address & Contact */}
        <div className="p-6 md:p-8 bg-stone-50/45 border-b border-stone-100">
          <h3 className="font-display text-base font-bold mb-4 text-brand-gray-dark">Billing Address & Contact</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-brand-gray-medium">Full Address</label>
                <textarea 
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white focus:bg-white outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary text-xs resize-none"
                  placeholder="Suite 101, Business Park, Tech Zone" 
                  required 
                  rows={3}
                  value={profile.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-brand-gray-medium">City</label>
                  <input 
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white focus:bg-white outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary text-xs"
                    placeholder="Mumbai" 
                    required 
                    type="text"
                    value={profile.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-brand-gray-medium">Pincode</label>
                  <input 
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white focus:bg-white outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary text-xs font-mono"
                    placeholder="400001" 
                    required 
                    type="text"
                    value={profile.pincode}
                    onChange={(e) => handleChange('pincode', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-brand-gray-medium">State</label>
                <select 
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white focus:bg-white outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary text-xs"
                  value={profile.state}
                  onChange={(e) => handleChange('state', e.target.value)}
                >
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                  <option value="Gujarat">Gujarat</option>
                </select>
              </div>

            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-brand-gray-medium">Contact Email</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input 
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-white focus:bg-white outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary text-xs"
                    placeholder="billing@company.com" 
                    required 
                    type="email"
                    value={profile.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-brand-gray-medium">Phone Number</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
                    <Phone className="w-4 h-4" />
                  </span>
                  <input 
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-white focus:bg-white outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary text-xs"
                    placeholder="+91 98765 43210" 
                    required 
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                  />
                </div>
              </div>

              <div className="bg-brand-primary-light/5 p-4 rounded-xl border border-brand-primary-light/10 flex items-start gap-3 mt-4">
                <Sparkles className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
                <p className="text-[11px] text-[#2d5000] leading-normal font-sans">
                  These business details will automatically format your GST/tax rate classes and will show in the invoice footers.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Section 3: Bank Details */}
        <div className="p-6 md:p-8">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="font-display text-base font-bold text-brand-gray-dark">Bank Details</h3>
            <span className="bg-brand-secondary/10 text-brand-secondary text-[8px] px-2 py-0.5 rounded font-bold tracking-wider flex items-center gap-1 uppercase">
              <Lock className="w-2.5 h-2.5" /> Secure
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-brand-gray-medium">Bank Name</label>
              <input 
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary text-xs"
                placeholder="HDFC Bank" 
                required 
                type="text"
                value={profile.bankName}
                onChange={(e) => handleChange('bankName', e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-brand-gray-medium">Account Number</label>
              <input 
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary text-xs font-mono"
                placeholder="•••• •••• •••• 1234" 
                required 
                type="text"
                value={profile.accountNumber}
                onChange={(e) => handleChange('accountNumber', e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-brand-gray-medium">IFSC Code</label>
              <input 
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary text-xs font-mono uppercase"
                placeholder="HDFC0001234" 
                required 
                type="text"
                value={profile.ifscCode}
                onChange={(e) => handleChange('ifscCode', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Form Footer Actions */}
        <div className="bg-stone-50 p-6 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-4 select-none">
          <div className="flex items-center gap-2 text-stone-500 text-xs">
            <CloudUpload className="w-5 h-5 text-brand-primary" />
            <span>Draft autosaved</span>
          </div>
          
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <button 
              type="button"
              onClick={() => {
                if (onNextStep) onNextStep();
              }}
              className="flex-1 sm:flex-none px-6 py-2.5 text-xs font-semibold text-stone-600 hover:text-brand-gray-dark hover:bg-stone-100/50 rounded-xl transition-all cursor-pointer text-center"
            >
              Skip for Now
            </button>
            <button 
              type="submit"
              disabled={isSaving}
              className={`flex-grow sm:flex-none px-8 py-2.5 text-xs font-bold text-white rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isCompleted ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-brand-primary hover:bg-brand-primary-light active:scale-95'
              }`}
            >
              {isSaving ? (
                <span className="inline-flex items-center gap-1.5">
                  <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : isCompleted ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Setup Complete</span>
                </>
              ) : (
                <>
                  <span>Save &amp; Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>

      </form>

      {/* Trust Signals Block matching user's Image 6 design blueprint */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 select-none">
        <div className="flex items-center gap-3 p-4 bg-stone-50 border border-stone-200/50 rounded-xl">
          <span className="p-2.5 rounded-xl bg-white shadow-sm text-brand-primary">
            <ShieldCheck className="w-6 h-6" />
          </span>
          <div>
            <h4 className="text-xs font-bold text-brand-gray-dark">Bank-Grade Security</h4>
            <p className="text-[10px] text-brand-gray-medium">Encrypted &amp; protected connection logs.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-stone-50 border border-stone-200/50 rounded-xl">
          <span className="p-2.5 rounded-xl bg-white shadow-sm text-brand-primary">
            <CheckCircle className="w-6 h-6" />
          </span>
          <div>
            <h4 className="text-xs font-bold text-brand-gray-dark">GST Compliant</h4>
            <p className="text-[10px] text-brand-gray-medium">Automated GSTIN validation algorithms.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-stone-50 border border-stone-200/50 rounded-xl">
          <span className="p-2.5 rounded-xl bg-white shadow-sm text-brand-primary">
            <Library className="w-6 h-6" />
          </span>
          <div>
            <h4 className="text-xs font-bold text-brand-gray-dark">Cloud Sync Enabled</h4>
            <p className="text-[10px] text-brand-gray-medium">Access synced statements instantly anywhere.</p>
          </div>
        </div>
      </div>

    </div>
  );
}
