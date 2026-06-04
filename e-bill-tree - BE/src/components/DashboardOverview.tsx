import { 
  TrendingUp, Users, ShieldAlert, Truck, Sparkles, 
  ArrowRight, CreditCard, ShieldCheck, FileCheck2, Clock 
} from 'lucide-react';
import React from 'react';
import { Invoice, Customer, EWayBill } from '../types';

interface DashboardOverviewProps {
  invoices: Invoice[];
  customers: Customer[];
  ewayBills: EWayBill[];
  onChangeTab: (tab: any) => void;
  ownerName: string;
}

export default function DashboardOverview({ invoices, customers, ewayBills, onChangeTab, ownerName }: DashboardOverviewProps) {
  
  // Calculate metric aggregators
  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const paidInvoices = invoices.filter(inv => inv.status === 'Paid');
  const pendingInvoices = invoices.filter(inv => inv.status === 'Pending');
  
  const totalPaid = paidInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const totalPending = pendingInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);

  const activeEways = ewayBills.filter(ew => ew.status === 'Active').length;

  return (
    <div className="space-y-6 select-none font-sans">
      
      {/* Dynamic Greetings banner with leaf pattern */}
      <div className="p-6 md:p-8 bg-stone-50 border border-stone-200/50 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 relative overflow-hidden">
        <div className="relative z-10 space-y-1 text-center md:text-left">
          <h2 className="font-display font-extrabold text-2xl text-brand-gray-dark flex items-center gap-2 justify-center md:justify-start">
            <span>Welcome,</span>
            <span className="text-brand-primary font-black underline decoration-brand-primary-light/55 decoration-4">{ownerName || "Grower Elite"}</span>
          </h2>
          <p className="text-xs text-brand-gray-medium max-w-md font-medium leading-relaxed font-sans">
            Your e-billing ecosystem is completely synced and secure. Create invoices, monitor challans, or review tax compliance from the dashboard.
          </p>
        </div>
        
        {/* Quick action buttons */}
        <div className="relative z-10 flex gap-3 select-none flex-wrap shrink-0">
          <button 
            onClick={() => onChangeTab('invoices')}
            className="px-5 py-2.5 bg-brand-primary hover:bg-brand-primary-light text-white font-bold text-xs rounded-xl shadow cursor-pointer transition-all active:scale-95 flex items-center gap-1.5"
          >
            <span>Issue Invoice</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          
          <button 
            onClick={() => onChangeTab('settings')}
            className="px-5 py-2.5 bg-white border border-stone-200 hover:bg-stone-50 text-stone-600 font-bold text-xs rounded-xl shadow-sm cursor-pointer hover:border-brand-primary transition-colors flex items-center gap-1.5"
          >
            <span>Profile Wizard</span>
          </button>
        </div>

        {/* Backdrop visual sparkles */}
        <div className="absolute top-1/2 -translate-y-1/2 right-12 w-48 h-48 bg-brand-primary/5 rounded-full blur-2xl pointer-events-none"></div>
      </div>

      {/* KPI Metrix card list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1 */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm flex items-center gap-4 hover:shadow transition-shadow">
          <span className="p-3 rounded-xl bg-brand-primary/10 text-brand-primary">
            <TrendingUp className="w-6 h-6" />
          </span>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#a8a29e] block">Gross Revenue</span>
            <span className="text-xl font-bold text-brand-gray-dark font-display font-mono">
              ₹{totalInvoiced.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm flex items-center gap-4 hover:shadow transition-shadow">
          <span className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
            <FileCheck2 className="w-6 h-6" />
          </span>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#a8a29e] block">Paid Invoices</span>
            <span className="text-xl font-bold text-brand-gray-dark font-display font-mono">
              ₹{totalPaid.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm flex items-center gap-4 hover:shadow transition-shadow">
          <span className="p-3 rounded-xl bg-amber-50 text-amber-600">
            <Clock className="w-6 h-6" />
          </span>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#a8a29e] block">Outstanding Tax</span>
            <span className="text-xl font-bold text-brand-gray-dark font-display font-mono">
              ₹{totalPending.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm flex items-center gap-4 hover:shadow transition-shadow">
          <span className="p-3 rounded-xl bg-sky-50 text-brand-secondary">
            <Truck className="w-6 h-6" />
          </span>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#a8a29e] block">Waybills Issued</span>
            <span className="text-xl font-extrabold text-brand-gray-dark font-display font-mono">
              {ewayBills.length} <span className="text-xs text-brand-gray-medium font-semibold">({activeEways} Active)</span>
            </span>
          </div>
        </div>

      </div>

      {/* Split section: Recent activities and compliance checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 select-none font-sans">
        
        {/* Clean list of recent invoices */}
        <div className="lg:col-span-8 bg-white border border-stone-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="font-display text-sm font-extrabold text-brand-gray-dark mb-1">Recent Invoices</h3>
            <p className="text-[10px] text-stone-400">Your latest issued customer bills with transaction status states.</p>
          </div>

          <div className="space-y-3.5 flex-grow">
            {invoices.slice(0, 4).map((inv) => (
              <div 
                key={inv.id} 
                onClick={() => onChangeTab('invoices')}
                className="p-3 border border-stone-100 bg-stone-50 hover:bg-stone-50/50 hover:border-brand-primary rounded-xl cursor-pointer transition-colors flex items-center justify-between font-sans"
              >
                <div className="flex items-center gap-3">
                  <span className="p-2 bg-white rounded-lg text-brand-secondary border border-stone-150">
                    <CreditCard className="w-4 h-4" />
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-brand-gray-dark">{inv.customerName}</h4>
                    <span className="text-[10px] text-zinc-400 font-mono italic block mt-0.5">{inv.invoiceNumber} • Date: {inv.date}</span>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xs font-bold font-mono text-stone-700">₹{inv.totalAmount.toLocaleString('en-IN')}</p>
                  <span className={`text-[9px] font-bold mt-1 inline-block ${
                    inv.status === 'Paid' ? 'text-emerald-600 bg-emerald-100/40 px-1 py-0.5 rounded' : 'text-amber-600 bg-amber-100/40 px-1 py-0.5 rounded'
                  }`}>
                    {inv.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Compliance widget matching layout specs */}
        <div className="lg:col-span-4 bg-white border border-stone-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-display text-sm font-extrabold text-brand-gray-dark mb-1">Compliance Check</h3>
            <p className="text-[10px] text-stone-400 font-sans">Mandatory guidelines to keep your GSTR books active.</p>
          </div>

          <div className="space-y-4 my-6 font-sans">
            
            <div className="flex gap-2.5 items-start">
              <span className="p-1 rounded-full bg-emerald-50 text-brand-primary mt-0.5"><ShieldCheck className="w-4 h-4" /></span>
              <div>
                <h4 className="text-xs font-bold text-brand-gray-dark">GSTIN Validated</h4>
                <p className="text-[10px] text-zinc-400">Your profile GST is structure-checked and aligned.</p>
              </div>
            </div>

            <div className="flex gap-2.5 items-start">
              <span className="p-1 rounded-full bg-emerald-50 text-brand-primary mt-0.5"><ShieldCheck className="w-4 h-4" /></span>
              <div>
                <h4 className="text-xs font-bold text-brand-gray-dark">HSN Codes Linked</h4>
                <p className="text-[10px] text-zinc-400">All commodities bound with standard harmonized codes.</p>
              </div>
            </div>

            <div className="flex gap-2.5 items-start">
              <span className="p-1 rounded-full bg-amber-50 text-amber-600 mt-0.5"><ShieldAlert className="w-4 h-4" /></span>
              <div>
                <h4 className="text-xs font-bold text-brand-gray-dark">E-Way Bills Audited</h4>
                <p className="text-[10px] text-zinc-400">Ensure vehicle license numbers match physically.</p>
              </div>
            </div>

          </div>

          <div className="p-4 bg-[#f8faf2] border border-[#76bc21]/15 rounded-xl flex items-start gap-2">
            <Sparkles className="w-3.5 h-3.5 text-brand-primary shrink-0 mt-0.5" />
            <span className="text-[10px] text-[#2c5100] font-sans font-medium">Auto-generated GSTR 1 &amp; GSTR 3B summaries.</span>
          </div>
        </div>

      </div>

    </div>
  );
}
