import { BarChart3, TrendingUp, HelpCircle, ArrowUpRight, Scale, Receipt } from 'lucide-react';
import React from 'react';
import { Invoice } from '../types';

interface ReportsTabProps {
  invoices: Invoice[];
}

export default function ReportsTab({ invoices }: ReportsTabProps) {
  // Aggregate sales and tax details
  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const totalTaxable = invoices.reduce((sum, inv) => sum + inv.totalTaxable, 0);
  
  const totalCgst = invoices.reduce((sum, inv) => sum + inv.totalCgst, 0);
  const totalSgst = invoices.reduce((sum, inv) => sum + inv.totalSgst, 0);
  const totalIgst = invoices.reduce((sum, inv) => sum + inv.totalIgst, 0);
  
  const totalTaxCollected = totalCgst + totalSgst + totalIgst;
  const draftInvoices = invoices.filter(inv => inv.status === 'Draft').length;
  const activeInvoices = invoices.filter(inv => inv.status === 'Paid' || inv.status === 'Pending').length;

  // Compute real monthly sales data from actual invoice dates
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentYear = new Date().getFullYear();

  const monthlySales = Array.from({ length: 6 }, (_, i) => {
    const monthIdx = i; // Jan–Jun of current year
    const monthInvoices = invoices.filter(inv => {
      const d = new Date(inv.date);
      return d.getFullYear() === currentYear && d.getMonth() === monthIdx;
    });
    const sales = monthInvoices.reduce((s, inv) => s + inv.totalTaxable, 0);
    const tax = monthInvoices.reduce((s, inv) => s + inv.totalCgst + inv.totalSgst + inv.totalIgst, 0);
    return { month: monthNames[monthIdx], sales, tax };
  });

  const maxSales = Math.max(...monthlySales.map(m => m.sales), 10000);

  return (
    <div className="space-y-6 font-sans">
      
      {/* High priority cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 select-none">
        
        {/* Card 1 */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Gross Turnovers</span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-brand-primary">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            <div className="text-xl md:text-2xl font-bold text-brand-gray-dark font-display">
              ₹{totalInvoiced.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </div>
            <p className="text-[10px] text-stone-500 font-medium mt-1">From {invoices.length} general business invoices</p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Taxable value</span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-brand-primary">
              <Scale className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            <div className="text-xl md:text-2xl font-bold text-brand-gray-dark font-display font-mono">
              ₹{totalTaxable.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </div>
            <p className="text-[10px] text-stone-500 font-medium mt-1">Net product/services catalog value</p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">CGST &amp; SGST Collects</span>
            <span className="p-1.5 rounded-lg bg-sky-50 text-brand-secondary">
              <Receipt className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            <div className="text-xl md:text-2xl font-bold text-brand-gray-dark font-display font-mono">
              ₹{(totalCgst + totalSgst).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </div>
            <p className="text-[10px] text-stone-500 mt-1">
              CGST: ₹{totalCgst.toLocaleString('en-IN', { maximumFractionDigits: 0 })} | SGST: ₹{totalSgst.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </p>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">IGST levy Collects</span>
            <span className="p-1.5 rounded-lg bg-[#f0e3f5] text-purple-700">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            <div className="text-xl md:text-2xl font-bold text-brand-gray-dark font-display font-mono">
              ₹{totalIgst.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </div>
            <p className="text-[10px] text-stone-500 font-medium mt-1">Charged on inter-state deliveries</p>
          </div>
        </div>

      </div>

      {/* SVG Sales Trend Chart & Tax split visualization block */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 select-none">
        
        {/* Custom SVG Bar Chart */}
        <div className="lg:col-span-8 bg-white border border-stone-200 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-display text-sm font-extrabold text-brand-gray-dark">GST Revenue &amp; Turnovers</h3>
              <p className="text-[10px] text-stone-400">Monthly gross turnovers vs tax — {currentYear} (Jan–Jun)</p>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-bold">
              <span className="inline-flex items-center gap-1.5 text-[#3d6a00]"><span className="w-2.5 h-2.5 rounded bg-[#3d6a00] inline-block"></span> Turnovers</span>
              <span className="inline-flex items-center gap-1.5 text-brand-secondary"><span className="w-2.5 h-2.5 rounded bg-brand-secondary inline-block"></span> Taxes</span>
            </div>
          </div>

          {/* Bar rendering using visual SVG tags */}
          <div className="relative w-full h-80 pt-4">
            <svg viewBox="0 0 500 240" className="w-full h-full text-stone-200">
              {/* Horizontal Grid Ticks */}
              <line x1="40" y1="20" x2="480" y2="20" stroke="currentColor" strokeDasharray="4 4" strokeWidth="0.5" />
              <line x1="40" y1="70" x2="480" y2="70" stroke="currentColor" strokeDasharray="4 4" strokeWidth="0.5" />
              <line x1="40" y1="120" x2="480" y2="120" stroke="currentColor" strokeDasharray="4 4" strokeWidth="0.5" />
              <line x1="40" y1="170" x2="480" y2="170" stroke="currentColor" strokeDasharray="4 4" strokeWidth="0.5" />
              <line x1="40" y1="210" x2="480" y2="210" stroke="#a8a29e" strokeWidth="0.75" />

              {/* Data rendering */}
              {monthlySales.map((m, idx) => {
                const stepX = 40 + idx * 72 + 20;
                
                // Scale values
                const salesHeight = (m.sales / maxSales) * 160;
                const taxHeight = (m.tax / maxSales) * 160 + 10; // offset slightly for minimum visibility

                return (
                  <g key={m.month}>
                    {/* Double Bars */}
                    {/* Sales Bar */}
                    <rect 
                      x={stepX} 
                      y={210 - salesHeight} 
                      width="18" 
                      height={salesHeight} 
                      fill="#3d6a00" 
                      rx="3" 
                      className="hover:opacity-85 transition-opacity" 
                    />
                    {/* Tax Bar */}
                    <rect 
                      x={stepX + 22} 
                      y={210 - taxHeight} 
                      width="18" 
                      height={taxHeight} 
                      fill="#255dad" 
                      rx="3" 
                      className="hover:opacity-85 transition-opacity" 
                    />

                    {/* Month Label */}
                    <text 
                      x={stepX + 20} 
                      y="228" 
                      fill="#57534e" 
                      fontFamily="Inter" 
                      fontSize="9" 
                      textAnchor="middle" 
                      fontWeight="bold"
                    >
                      {m.month}
                    </text>
                  </g>
                );
              })}

              {/* Y Axis Legend indicators */}
              <text x="32" y="24" fill="#a8a29e" fontFamily="Inter" fontSize="8" textAnchor="end">Max</text>
              <text x="32" y="124" fill="#a8a29e" fontFamily="Inter" fontSize="8" textAnchor="end">50%</text>
              <text x="32" y="214" fill="#a8a29e" fontFamily="Inter" fontSize="8" textAnchor="end">0</text>
            </svg>
          </div>
        </div>

        {/* GST Tax collection splits */}
        <div className="lg:col-span-4 bg-white border border-stone-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-display text-sm font-extrabold text-brand-gray-dark">GST Split (Tax Ledgers)</h3>
            <p className="text-[10px] text-stone-400">Levy divisions for central, state, and integrated channels</p>
          </div>

          <div className="space-y-4 my-6">
            {/* CGST row */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-stone-500">CGST (Central GST)</span>
                <span className="font-bold text-brand-gray-dark font-mono">
                  ₹{totalCgst.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden">
                <div 
                  className="h-full bg-brand-primary" 
                  style={{ width: `${totalTaxCollected > 0 ? (totalCgst / totalTaxCollected) * 100 : 33}%` }}
                ></div>
              </div>
            </div>

            {/* SGST row */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-stone-500">SGST (State GST)</span>
                <span className="font-bold text-brand-gray-dark font-mono">
                  ₹{totalSgst.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden">
                <div 
                  className="h-full bg-brand-primary-light" 
                  style={{ width: `${totalTaxCollected > 0 ? (totalSgst / totalTaxCollected) * 100 : 33}%` }}
                ></div>
              </div>
            </div>

            {/* IGST row */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-stone-500">IGST (Integrated GST)</span>
                <span className="font-bold text-brand-gray-dark font-mono">
                  ₹{totalIgst.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden">
                <div 
                  className="h-full bg-brand-secondary" 
                  style={{ width: `${totalTaxCollected > 0 ? (totalIgst / totalTaxCollected) * 100 : 34}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-stone-50 rounded-xl space-y-1">
            <span className="text-[9px] font-bold text-stone-400 uppercase block tracking-wider">Total tax pool accrued</span>
            <span className="font-display font-extrabold text-lg text-brand-secondary font-mono">
              ₹{totalTaxCollected.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}
