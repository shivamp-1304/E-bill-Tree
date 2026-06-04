/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Users, Receipt, FileSpreadsheet, Truck, 
  Settings, LayoutDashboard, CircleUser, LogOut, ChevronRight, Menu, X, Landmark, HeartHandshake, ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { 
  CompanyProfile, Customer, Product, Invoice, Challan, EWayBill, ScreenState, DashboardTab 
} from './types';
import { 
  DEFAULT_COMPANY_PROFILE, DEFAULT_CUSTOMERS, DEFAULT_PRODUCTS, 
  DEFAULT_INVOICES, DEFAULT_CHALLANS, DEFAULT_EWAY_BILLS, 
  getStoredData, setStoredData 
} from './mockData';

// import components
import CoverScreen from './components/CoverScreen';
import AuthScreens from './components/AuthScreens';
import CompaniesSetupTab from './components/CompanySetupTab';
import CustomersTab from './components/CustomersTab';
import ProductsTab from './components/ProductsTab';
import ChallansTab from './components/ChallansTab';
import EWayBillTab from './components/EWayBillTab';
import ReportsTab from './components/ReportsTab';
import InvoicesTab from './components/InvoicesTab';
import DashboardOverview from './components/DashboardOverview';

export default function App() {
  // Navigation & authorization states
  const [screen, setScreen] = useState<ScreenState>('cover');
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Authenticated user details
  const [ownerName, setOwnerName] = useState<string>('Stitch AI Admin');
  const [companyName, setCompanyName] = useState<string>('Acme Corporation Pvt Ltd');

  // Persistence States
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>(DEFAULT_COMPANY_PROFILE);
  const [customers, setCustomers] = useState<Customer[]>(DEFAULT_CUSTOMERS);
  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [invoices, setInvoices] = useState<Invoice[]>(DEFAULT_INVOICES);
  const [challans, setChallans] = useState<Challan[]>(DEFAULT_CHALLANS);
  const [ewayBills, setEwayBills] = useState<EWayBill[]>(DEFAULT_EWAY_BILLS);

  // Load from local storage on mount
  useEffect(() => {
    setCompanyProfile(getStoredData('ebt_company_profile', DEFAULT_COMPANY_PROFILE));
    setCustomers(getStoredData('ebt_customers', DEFAULT_CUSTOMERS));
    setProducts(getStoredData('ebt_products', DEFAULT_PRODUCTS));
    setInvoices(getStoredData('ebt_invoices', DEFAULT_INVOICES));
    setChallans(getStoredData('ebt_challans', DEFAULT_CHALLANS));
    setEwayBills(getStoredData('ebt_eway_bills', DEFAULT_EWAY_BILLS));

    const loggedUser = localStorage.getItem('ebt_logged_in_user');
    const loggedCompany = localStorage.getItem('ebt_logged_in_company');
    if (loggedUser && loggedCompany) {
      setOwnerName(loggedUser);
      setCompanyName(loggedCompany);
      setScreen('dashboard');
    }
  }, []);

  // Sync back to local storage on changes
  const handleSaveProfile = (newProfile: CompanyProfile) => {
    setCompanyProfile(newProfile);
    setCompanyName(newProfile.name);
    setStoredData('ebt_company_profile', newProfile);
  };

  const handleAddCustomer = (cust: Customer) => {
    const updated = [...customers, cust];
    setCustomers(updated);
    setStoredData('ebt_customers', updated);
  };

  const handleDeleteCustomer = (id: string) => {
    const updated = customers.filter(c => c.id !== id);
    setCustomers(updated);
    setStoredData('ebt_customers', updated);
  };

  const handleAddProduct = (prod: Product) => {
    const updated = [...products, prod];
    setProducts(updated);
    setStoredData('ebt_products', updated);
  };

  const handleDeleteProduct = (id: string) => {
    const updated = products.filter(p => p.id !== id);
    setProducts(updated);
    setStoredData('ebt_products', updated);
  };

  const handleAddInvoice = (inv: Invoice) => {
    const updated = [...invoices, inv];
    setInvoices(updated);
    setStoredData('ebt_invoices', updated);
  };

  const handleDeleteInvoice = (id: string) => {
    const updated = invoices.filter(inv => inv.id !== id);
    setInvoices(updated);
    setStoredData('ebt_invoices', updated);
  };

  const handleUpdateInvoiceStatus = (id: string, status: Invoice['status']) => {
    const updated = invoices.map(inv => inv.id === id ? { ...inv, status } : inv);
    setInvoices(updated);
    setStoredData('ebt_invoices', updated);
  };

  const handleAddChallan = (ch: Challan) => {
    const updated = [...challans, ch];
    setChallans(updated);
    setStoredData('ebt_challans', updated);
  };

  const handleDeleteChallan = (id: string) => {
    const updated = challans.filter(ch => ch.id !== id);
    setChallans(updated);
    setStoredData('ebt_challans', updated);
  };

  const handleAddEWayBill = (ew: EWayBill) => {
    const updated = [...ewayBills, ew];
    setEwayBills(updated);
    setStoredData('ebt_eway_bills', updated);
  };

  const handleDeleteEWayBill = (id: string) => {
    const updated = ewayBills.filter(ew => ew.id !== id);
    setEwayBills(updated);
    setStoredData('ebt_eway_bills', updated);
  };

  const handleLoginSuccess = (user: string, company: string) => {
    setOwnerName(user);
    setCompanyName(company);
    localStorage.setItem('ebt_logged_in_user', user);
    localStorage.setItem('ebt_logged_in_company', company);
    setScreen('dashboard');
    setActiveTab('overview');
  };

  const handleLogout = () => {
    localStorage.removeItem('ebt_logged_in_user');
    localStorage.removeItem('ebt_logged_in_company');
    setScreen('login');
    setProfileDropdownOpen(false);
  };

  // Nav Item layout configs
  const navigationItems = [
    { tab: 'overview', label: 'EBT Dashboard', icon: LayoutDashboard },
    { tab: 'invoices', label: 'GST Tax Invoices', icon: Receipt },
    { tab: 'challans', label: 'Delivery Challans', icon: FileSpreadsheet },
    { tab: 'eway-bill', label: 'Transporter eWay', icon: Truck },
    { tab: 'customers', label: 'Customer Directory', icon: Users },
    { tab: 'products', label: 'Stock Catalogue', icon: Settings },
    { tab: 'reports', label: 'EBT Analytics', icon: BarChart3 },
    { tab: 'settings', label: 'Company Profile', icon: Landmark }
  ] as const;

  const currentTabLabel = navigationItems.find(it => it.tab === activeTab)?.label || 'Workspace';

  return (
    <div className="bg-brand-bg text-brand-gray-dark min-h-screen font-sans overflow-x-hidden select-none">
      
      <AnimatePresence mode="wait">
        
        {/* VIEW 1: ENTER COVER / SPLASH */}
        {screen === 'cover' && (
          <motion.div 
            key="cover-screen-motion"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <CoverScreen onEnter={() => setScreen('login')} />
          </motion.div>
        )}

        {/* VIEW 2: AUTH CLUSTER (LOGIN, REGISTER, ETC) */}
        {(screen === 'login' || screen === 'register' || screen === 'forgot-password' || screen === 'verify-otp' || screen === 'reset-password') && (
          <motion.div
            key="auth-screens-motion"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <AuthScreens 
              currentScreen={screen}
              setScreenState={setScreen}
              onLoginSuccess={handleLoginSuccess}
            />
          </motion.div>
        )}

        {/* VIEW 3: AUTHENTICATED WORKSPACE DASHBOARD WRAPPER */}
        {screen === 'dashboard' && (
          <motion.div
            key="dashboard-workspace-motion"
            className="min-h-screen flex flex-col md:flex-row relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            
            {/* LEFT PERSISTENT SIDEBAR DRAWERS */}
            <aside id="sidebar-navigation-box" className="hidden md:flex md:w-64 bg-white border-r border-stone-200 p-6 flex-col justify-between selection:bg-transparent select-none shrink-0 text-sm h-screen sticky top-0">
              
              <div className="space-y-6">
                
                {/* Brand Logo head and name */}
                <div onClick={() => setActiveTab('overview')} className="flex items-center gap-2.5 cursor-pointer pb-4 border-b border-stone-100">
                  <img 
                    alt="EBT Logo" 
                    className="w-10 h-10 object-contain hover:scale-115 transition-transform"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCPW3EceoldRDNKHXhXbK0aGi6nD__kFN-wUrcGj5YS09Bt7cUvMv1Pe6zBeFURZrIU514uVzWj6MY3nWr9g4L73M8mrlAA1-sTN2AiyfkQ_esWu3sf-SAvgGiwiOJKrEYj7jrKuUdt8j6jXXsbyj0g7tEXc877fs3yVTqXo15vcaUqlziZ6L9vciQmi2vU0fu7Iw4p85xc4nj14Un1OoDNDB16outMrTPalbUXz0h0xoh43iFbJZktJNJia0tyjVq80mecpICV-K_f" 
                  />
                  <div>
                    <h2 className="font-display font-extrabold text-[#3d6a00] leading-none mb-1 text-base">E-bill Tree</h2>
                    <span className="text-[10px] text-brand-gray-medium font-bold tracking-wider uppercase">Billing Hub</span>
                  </div>
                </div>

                {/* Navigation menu item buttons */}
                <nav className="space-y-1">
                  {navigationItems.map(({ tab, label, icon: IconComponent }) => (
                    <button
                      key={tab}
                      onClick={() => {
                        setActiveTab(tab);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full px-3.5 py-2.5 rounded-xl font-semibold flex items-center justify-between group transition-all text-xs cursor-pointer ${
                        activeTab === tab 
                          ? 'bg-[#ebf0e3] text-brand-primary font-bold shadow-sm' 
                          : 'text-[#1a1c1e] hover:bg-stone-50'
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <IconComponent className={`w-4.5 h-4.5 group-hover:scale-110 transition-transform ${activeTab === tab ? 'text-brand-primary' : 'text-stone-400'}`} />
                        <span>{label}</span>
                      </span>
                      <ChevronRight className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity ${activeTab === tab ? 'opacity-100 text-brand-primary' : ''}`} />
                    </button>
                  ))}
                </nav>

              </div>

              {/* Sidebar bottom indicator section */}
              <div className="border-t border-stone-100 pt-4 flex items-center justify-between text-stone-500 text-[11px] font-semibold">
                <span className="flex items-center gap-1"><Landmark className="w-3.5 h-3.5 text-stone-400" /> GST 2026 Ready</span>
                <span>• Offline-First</span>
              </div>

            </aside>

            {/* MOBILE NAVIGATION HEADER APLETS */}
            <header className="md:hidden bg-white border-b border-stone-200 px-4 py-3 flex items-center justify-between relative z-40 select-none">
              <div className="flex items-center gap-2">
                <img 
                  alt="EBT Logo" 
                  className="w-8 h-8 object-contain"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCPW3EceoldRDNKHXhXbK0aGi6nD__kFN-wUrcGj5YS09Bt7cUvMv1Pe6zBeFURZrIU514uVzWj6MY3nWr9g4L73M8mrlAA1-sTN2AiyfkQ_esWu3sf-SAvgGiwiOJKrEYj7jrKuUdt8j6jXXsbyj0g7tEXc877fs3yVTqXo15vcaUqlziZ6L9vciQmi2vU0fu7Iw4p85xc4nj14Un1OoDNDB16outMrTPalbUXz0h0xoh43iFbJZktJNJia0tyjVq80mecpICV-K_f" 
                />
                <h2 className="font-display font-extrabold text-brand-primary text-sm lowercase leading-none">E-bill Tree</h2>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-1.5 hover:bg-stone-50 rounded bg-stone-50/50 cursor-pointer text-stone-600"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>

              {/* Mobile Drawer */}
              {mobileMenuOpen && (
                <div className="absolute top-14 left-0 w-full bg-white border-b border-stone-200 shadow-xl p-4 space-y-2 flex flex-col z-50">
                  {navigationItems.map(({ tab, label, icon: IconComponent }) => (
                    <button
                      key={tab}
                      onClick={() => {
                        setActiveTab(tab);
                        setMobileMenuOpen(false);
                      }}
                      className={`px-3.5 py-2 rounded-xl text-left font-semibold text-xs flex items-center gap-3 ${
                        activeTab === tab ? 'bg-stone-100 text-brand-primary' : 'text-stone-700'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                      <span>{label}</span>
                    </button>
                  ))}
                  <button 
                    onClick={handleLogout}
                    className="px-3.5 py-2.5 rounded-xl text-left font-bold text-xs text-red-600 bg-red-50 flex items-center gap-3 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out Account</span>
                  </button>
                </div>
              )}
            </header>

            {/* MAIN WORKSPACE WRAPPER CANVAS */}
            <main id="main-workspace-section" className="flex-grow flex flex-col min-h-screen overflow-x-hidden selection:bg-stone-100 relative">
              
              {/* TOP COMMON BAR METRIC & HEADING & USER AVATAR BADGE */}
              <header className="bg-white/80 backdrop-blur-md border-b border-stone-200/50 px-6 py-4 sticky top-0 z-30 flex items-center justify-between select-none">
                
                <div>
                  <h1 className="font-display font-extrabold text-xs text-zinc-400 tracking-wider uppercase">{currentTabLabel}</h1>
                  <p className="hidden md:block text-[11px] text-stone-500 pt-0.5 font-medium">{companyName || 'Registered Enterprise'}</p>
                </div>

                {/* Hotlinked profile picture and dynamic dropdown indicator */}
                <div className="relative">
                  <div 
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-2.5 p-1.5 hover:bg-stone-50 rounded-full cursor-pointer transition-colors border border-stone-100 bg-stone-50/50"
                  >
                    <img 
                      alt="User profile" 
                      className="w-8 h-8 rounded-full object-cover shrink-0" 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDGBwB2PJjMKe0qf6p-Jtu44XZhgR0POAmlqSEljzh9ADmZCgVwBsSP_GVqyw-8Gkf5LWuESMYaIl-wYigDIDAujWdv6ef7Awxx3qNTa1QSJVIKfinCO7gDnjvfW-xZQFVn13Hgnl8Xxj3RGLPYrRrB1w-UWFXQ9Bfxo9NECS2IwuCv9Nm9pm0CZzuLDitO-xLNotYp6cWD0FV3tCwca--AEzU5ZaN-U-4gmpJwOcTNtFv_Bu9rTHmSfLeMZh2m69lU9b0fWBybXaiq" 
                    />
                    <span className="hidden md:block text-xs font-bold text-[#1a1c1e] pr-2 max-w-[120px] truncate">{ownerName || "Administrator"}</span>
                  </div>

                  {/* Dropdown elements */}
                  {profileDropdownOpen && (
                    <div className="absolute right-0 top-13 w-56 bg-white border border-stone-200 rounded-xl shadow-lg p-3 space-y-1.5 z-40">
                      <div className="px-2 py-1.5 border-b border-stone-100 pb-2">
                        <p className="text-xs font-extrabold text-zinc-700 truncate">{ownerName}</p>
                        <p className="text-[10px] text-zinc-400 truncate">{companyName}</p>
                      </div>

                      <button 
                        onClick={() => {
                          setActiveTab('settings');
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-semibold hover:bg-stone-50 text-stone-700 rounded-lg flex items-center gap-2 cursor-pointer"
                      >
                        <Landmark className="w-4 h-4 text-stone-400" />
                        <span>Manage Profile</span>
                      </button>

                      <button 
                        onClick={handleLogout}
                        className="w-full text-left px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out Account</span>
                      </button>
                    </div>
                  )}
                </div>

              </header>

              {/* INNER PAGES SELECT CANVAS (DYNAMIZED INNER TABS ROUTE) */}
              <div className="p-4 md:p-8 flex-grow">
                {activeTab === 'overview' && (
                  <DashboardOverview 
                    invoices={invoices}
                    customers={customers}
                    ewayBills={ewayBills}
                    onChangeTab={setActiveTab}
                    ownerName={ownerName}
                  />
                )}

                {activeTab === 'invoices' && (
                  <InvoicesTab 
                    invoices={invoices}
                    companyProfile={companyProfile}
                    customers={customers}
                    products={products}
                    onAddInvoice={handleAddInvoice}
                    onDeleteInvoice={handleDeleteInvoice}
                    onUpdateInvoiceStatus={handleUpdateInvoiceStatus}
                  />
                )}

                {activeTab === 'challans' && (
                  <ChallansTab 
                    challans={challans}
                    customers={customers}
                    onAddChallan={handleAddChallan}
                    onDeleteChallan={handleDeleteChallan}
                  />
                )}

                {activeTab === 'eway-bill' && (
                  <EWayBillTab 
                    ewayBills={ewayBills}
                    invoices={invoices}
                    onAddEWayBill={handleAddEWayBill}
                    onDeleteEWayBill={handleDeleteEWayBill}
                  />
                )}

                {activeTab === 'customers' && (
                  <CustomersTab 
                    customers={customers}
                    onAddCustomer={handleAddCustomer}
                    onDeleteCustomer={handleDeleteCustomer}
                  />
                )}

                {activeTab === 'products' && (
                  <ProductsTab 
                    products={products}
                    onAddProduct={handleAddProduct}
                    onDeleteProduct={handleDeleteProduct}
                  />
                )}

                {activeTab === 'reports' && (
                  <ReportsTab 
                    invoices={invoices}
                  />
                )}

                {activeTab === 'settings' && (
                  <CompaniesSetupTab 
                    initialProfile={companyProfile}
                    onSaveProfile={handleSaveProfile}
                    onNextStep={() => setActiveTab('overview')}
                  />
                )}
              </div>

              {/* Main inner workspace static minimal absolute disclaimer */}
              <footer className="py-4 px-6 border-t border-stone-200/40 text-stone-400 font-sans text-[10.5px] select-none z-0 text-center flex justify-between">
                <span>© 2026 E-bill Tree Portal. Secured with GST GSTR standard logs.</span>
                <span className="hidden sm:inline">Certified Secure • Bank-Grade Connection</span>
              </footer>

            </main>

          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
}
