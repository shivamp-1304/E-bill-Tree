import { 
  Search, Plus, Receipt, FileText, CheckCircle, Clock, 
  Trash2, Eye, Printer, ShoppingBag, Landmark, ArrowRight, X 
} from 'lucide-react';
import React, { useState } from 'react';
import { Invoice, CompanyProfile, Customer, Product, InvoiceItem } from '../types';

interface InvoicesTabProps {
  invoices: Invoice[];
  companyProfile: CompanyProfile;
  customers: Customer[];
  products: Product[];
  onAddInvoice: (invoice: Invoice) => void;
  onDeleteInvoice: (id: string) => void;
  onUpdateInvoiceStatus: (id: string, status: Invoice['status']) => void;
}

export default function InvoicesTab({
  invoices,
  companyProfile,
  customers,
  products,
  onAddInvoice,
  onDeleteInvoice,
  onUpdateInvoiceStatus
}: InvoicesTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  
  // Views
  const [viewState, setViewState] = useState<'list' | 'create'>('list');
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);

  // Form states (Invoice Creator)
  const [customerId, setCustomerId] = useState('');
  const [selectedItems, setSelectedItems] = useState<{ product: Product; qty: number }[]>([]);
  const [selectedProductVal, setSelectedProductVal] = useState('');
  const [productQty, setProductQty] = useState(1);
  const [statusFlag, setStatusFlag] = useState<Invoice['status']>('Pending');
  const [dueDateOffsetDays, setDueDateOffsetDays] = useState(30);

  const filtered = invoices.filter(inv => {
    const matchesSearch = inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          inv.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddProductRow = () => {
    if (!selectedProductVal) return;
    const prod = products.find(p => p.id === selectedProductVal);
    if (!prod) return;

    // Check if duplicate, then add
    const index = selectedItems.findIndex(it => it.product.id === prod.id);
    if (index >= 0) {
      const updated = [...selectedItems];
      updated[index].qty += Number(productQty);
      setSelectedItems(updated);
    } else {
      setSelectedItems([...selectedItems, { product: prod, qty: Number(productQty) }]);
    }

    setSelectedProductVal('');
    setProductQty(1);
  };

  const handleRemoveProductRow = (idx: number) => {
    setSelectedItems(selectedItems.filter((_, i) => i !== idx));
  };

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) {
      alert("Please select a target customer!");
      return;
    }
    if (selectedItems.length === 0) {
      alert("Please add at least one physical/service item to the invoice!");
      return;
    }

    const client = customers.find(c => c.id === customerId);
    if (!client) return;

    // Is it an intra-state (same state) transaction?
    const isSameState = client.state.toLowerCase().trim() === companyProfile.state.toLowerCase().trim();

    // Compile items
    let totalTaxable = 0;
    let totalCgst = 0;
    let totalSgst = 0;
    let totalIgst = 0;

    const finalItems: InvoiceItem[] = selectedItems.map(({ product, qty }) => {
      const taxableValue = product.price * qty;
      let cgstAmount = 0;
      let sgstAmount = 0;
      let igstAmount = 0;

      if (isSameState) {
        // CGST SGST (each gets half the total rate)
        cgstAmount = (taxableValue * product.gstRate) / 200;
        sgstAmount = cgstAmount;
      } else {
        // IGST
        igstAmount = (taxableValue * product.gstRate) / 100;
      }

      totalTaxable += taxableValue;
      totalCgst += cgstAmount;
      totalSgst += sgstAmount;
      totalIgst += igstAmount;

      const itemTotal = taxableValue + cgstAmount + sgstAmount + igstAmount;

      return {
        productId: product.id,
        productName: product.name,
        hsnCode: product.hsnCode,
        price: product.price,
        qty,
        unit: product.unit,
        gstRate: product.gstRate,
        taxableValue,
        cgstAmount,
        sgstAmount,
        igstAmount,
        total: itemTotal
      };
    });

    const totalAmount = totalTaxable + totalCgst + totalSgst + totalIgst;
    
    // Auto increment number
    const nextNum = 1001 + invoices.length;
    
    const invoiceDate = new Date().toISOString().split('T')[0];
    const due = new Date();
    due.setDate(due.getDate() + dueDateOffsetDays);
    const dueDate = due.toISOString().split('T')[0];

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: `EBT/24-25/${nextNum}`,
      date: invoiceDate,
      dueDate,
      customerId: client.id,
      customerName: client.name,
      customerGst: client.gstNumber,
      customerState: client.state,
      items: finalItems,
      totalTaxable,
      totalCgst,
      totalSgst,
      totalIgst,
      totalAmount,
      status: statusFlag
    };

    onAddInvoice(newInvoice);
    setViewState('list');

    // Reset Form
    setCustomerId('');
    setSelectedItems([]);
  };

  const calculateIntrastate = (clientState: string) => {
    return clientState.toLowerCase().trim() === companyProfile.state.toLowerCase().trim();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 font-sans">
      
      {viewState === 'list' ? (
        <div className="space-y-4">
          
          {/* Header Action Row */}
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
            <div className="flex flex-wrap items-center gap-2">
              {['All', 'Paid', 'Pending', 'Draft', 'Overdue'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={`px-4 py-2 font-semibold text-xs rounded-xl transition-all select-none cursor-pointer border ${
                    statusFilter === tab 
                      ? 'bg-[#3d6a00] text-white border-brand-primary' 
                      : 'bg-white text-[#1a1c1e] hover:bg-stone-50 border-stone-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                setViewState('create');
                setSelectedItems([]);
              }}
              className="px-5 py-2.5 bg-brand-primary hover:bg-brand-primary-light text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Invoice</span>
            </button>
          </div>

          {/* Search bar helper */}
          <div className="relative max-w-md w-full">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400">
              <Search className="w-4 h-4" />
            </span>
            <input 
              type="text"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 outline-none text-xs focus:ring-1 focus:ring-brand-primary focus:border-brand-primary placeholder:text-stone-400 bg-white"
              placeholder="Search invoices by serial, or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Data List table */}
          <div className="bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden select-none">
            {filtered.length === 0 ? (
              <div className="p-12 text-center text-stone-400 space-y-2">
                <Receipt className="w-12 h-12 text-stone-300 mx-auto" />
                <p className="text-sm font-semibold">No invoices found</p>
                <p className="text-xs">Adjust your lookup criteria or generate a tax statement.</p>
              </div>
            ) : (
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#ebf0e3] border-b border-brand-primary/10 text-brand-gray-dark font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-4">Serial / Date</th>
                      <th className="p-4">Billed Consignee</th>
                      <th className="p-4">Tax Structure Type</th>
                      <th className="p-4 text-right">Taxable (₹)</th>
                      <th className="p-4 text-right">Total Invoice Net (₹)</th>
                      <th className="p-4">Payment Status</th>
                      <th className="p-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 font-sans">
                    {filtered.map((inv) => {
                      const isIntraState = calculateIntrastate(inv.customerState);
                      const totalCgstSgst = inv.totalCgst + inv.totalSgst;
                      
                      return (
                        <tr key={inv.id} className="hover:bg-stone-50/50 transition-colors">
                          
                          {/* Invoice Serial Details */}
                          <td className="p-4">
                            <div className="font-bold text-brand-secondary font-mono text-xs">{inv.invoiceNumber}</div>
                            <div className="text-[10px] text-zinc-400 font-mono mt-1">Date: {inv.date}</div>
                          </td>

                          {/* Client Receiver */}
                          <td className="p-4">
                            <div className="font-semibold text-brand-gray-dark text-xs">{inv.customerName}</div>
                            <div className="text-[10px] text-zinc-400 mt-0.5">GST: {inv.customerGst || 'RETAIL BUYER'}</div>
                          </td>

                          {/* CGST + SGST vs IGST */}
                          <td className="p-4">
                            <div className="font-medium text-brand-gray-medium text-xs">
                              {isIntraState ? 'Intrastate (CGST+SGST)' : 'Interstate (IGST)'}
                            </div>
                            <div className="text-[10px] text-zinc-400 font-mono mt-1">
                              {isIntraState 
                                ? `Tax pool: ₹${totalCgstSgst.toLocaleString('en-IN', { maximumFractionDigits: 1 })}` 
                                : `Tax pool: ₹${inv.totalIgst.toLocaleString('en-IN', { maximumFractionDigits: 1 })}`
                              }
                            </div>
                          </td>

                          {/* Pure Taxable Amount */}
                          <td className="p-4 text-right font-mono font-semibold text-stone-600 text-xs">
                            ₹{inv.totalTaxable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>

                          {/* Absolute Aggregated Net */}
                          <td className="p-4 text-right font-mono font-bold text-[#1a1c1e] text-xs">
                            ₹{inv.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>

                          {/* Payment State */}
                          <td className="p-4">
                            <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full inline-flex items-center gap-1 ${
                              inv.status === 'Paid' ? 'bg-emerald-50 text-emerald-700' :
                              inv.status === 'Pending' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-700'
                            }`}>
                              {inv.status === 'Paid' ? <CheckCircle className="w-3 h-3 text-emerald-500" /> : <Clock className="w-3 h-3 text-amber-500" />}
                              <span>{inv.status}</span>
                            </span>
                          </td>

                          {/* Quick Actions Viewer */}
                          <td className="p-4 text-center">
                            <div className="flex gap-2 justify-center items-center">
                              <button 
                                onClick={() => setViewingInvoice(inv)}
                                className="p-1.5 hover:bg-zinc-100 text-[#00658d] hover:text-brand-secondary rounded-lg cursor-pointer"
                                title="View Tax Invoice Slip"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              
                              <button 
                                onClick={() => onDeleteInvoice(inv.id)}
                                className="p-1.5 hover:bg-red-50 text-stone-400 hover:text-red-500 rounded-lg cursor-pointer"
                                title="Delete statement"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>

                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        
        /* ---------------- INVOICE GENERATOR VIEW FORM ---------------- */
        <div id="invoice-creator-container" className="bg-stone-50 p-6 border border-stone-200 rounded-xl space-y-6">
          <div className="flex items-center justify-between border-b border-stone-200/50 pb-4 select-none">
            <div>
              <h2 className="font-display text-lg font-extrabold text-brand-gray-dark">GST Invoice Customizer</h2>
              <p className="text-[10px] text-stone-400">Prepare tax invoices immediately with state tax formulas.</p>
            </div>
            <button 
              onClick={() => setViewState('list')}
              className="px-4 py-2 hover:bg-stone-100 border border-stone-200 rounded-xl text-xs font-bold text-stone-600 cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleCreateInvoice} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              
              {/* Select target buyer details */}
              <div className="space-y-1 md:col-span-2">
                <label className="block text-xs font-semibold text-brand-gray-medium">Target Customer Billed *</label>
                <select 
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-xs"
                  required
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                >
                  <option value="">-- Choose Target Consignee --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.state})</option>
                  ))}
                </select>
              </div>

              {/* Due offsets */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-brand-gray-medium">Net Due Limit *</label>
                <select 
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-xs"
                  value={dueDateOffsetDays}
                  onChange={(e) => setDueDateOffsetDays(Number(e.target.value))}
                >
                  <option value={15}>Net 15 (15 Days)</option>
                  <option value={30}>Net 30 (30 Days)</option>
                  <option value={45}>Net 45 (45 Days)</option>
                  <option value={60}>Net 60 (60 Days)</option>
                </select>
              </div>

              {/* Status */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-brand-gray-medium">Approved Status State *</label>
                <select 
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-xs"
                  value={statusFlag}
                  onChange={(e) => setStatusFlag(e.target.value as any)}
                >
                  <option value="Pending">Pending Approval</option>
                  <option value="Paid">Paid Settlement</option>
                  <option value="Draft">Draft Outline</option>
                </select>
              </div>

            </div>

            {/* PRODUCT SELECTOR SUB FORM PART */}
            <div className="p-4 bg-white border border-stone-200 rounded-xl space-y-4">
              <h3 className="text-xs font-bold font-display text-brand-gray-dark flex items-center gap-1.5 uppercase tracking-wide">
                <ShoppingBag className="w-4 h-4 text-brand-primary" /> Detail Entry Grid
              </h3>
              
              <div className="flex flex-col sm:flex-row gap-3 items-end">
                <div className="flex-grow space-y-1">
                  <label className="block text-[10px] font-bold text-stone-400 uppercase">Select Commodity Item</label>
                  <select 
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white text-xs"
                    value={selectedProductVal}
                    onChange={(e) => setSelectedProductVal(e.target.value)}
                  >
                    <option value="">-- Choose Stock Product Item --</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name} - ₹{p.price}/U ({p.gstRate}% GST)</option>
                    ))}
                  </select>
                </div>

                <div className="w-24 space-y-1">
                  <label className="block text-[10px] font-bold text-stone-400 uppercase">Quantity</label>
                  <input 
                    type="number" 
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs text-center focus:outline-none"
                    min="1"
                    value={productQty}
                    onChange={(e) => setProductQty(Number(e.target.value))}
                  />
                </div>

                <button 
                  type="button"
                  onClick={handleAddProductRow}
                  className="px-5 py-2.5 bg-brand-primary hover:bg-brand-primary-light text-white text-xs font-bold rounded-xl shadow cursor-pointer select-none"
                >
                  Add Row
                </button>
              </div>

              {/* Active selections list */}
              {selectedItems.length > 0 && (
                <div className="border border-stone-100 rounded-lg overflow-hidden mt-3 selection:bg-transparent">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#fcfdfa] border-b border-stone-100 text-stone-500 font-bold uppercase text-[9px]">
                      <tr>
                        <th className="p-3">Product Name / HSN</th>
                        <th className="p-3 text-right">Standard Rate</th>
                        <th className="p-3 text-center">Qty / Unit</th>
                        <th className="p-3 text-right">Taxable Net</th>
                        <th className="p-3">GST Bracket</th>
                        <th className="p-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {selectedItems.map((item, idx) => (
                        <tr key={idx} className="hover:bg-stone-50/50">
                          <td className="p-3">
                            <p className="font-semibold text-brand-gray-dark">{item.product.name}</p>
                            <span className="text-[10px] text-[#00658d] font-mono">HSN: {item.product.hsnCode}</span>
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-stone-700">
                            ₹{item.product.price.toLocaleString('en-IN')}
                          </td>
                          <td className="p-3 text-center font-semibold text-stone-600">
                            {item.qty} {item.product.unit}
                          </td>
                          <td className="p-3 text-right font-mono font-extrabold text-stone-800">
                            ₹{(item.product.price * item.qty).toLocaleString('en-IN')}
                          </td>
                          <td className="p-3">
                            <span className="px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-amber-50 text-amber-700">
                              {item.product.gstRate}% GST
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <button 
                              type="button"
                              onClick={() => handleRemoveProductRow(idx)}
                              className="p-1 hover:bg-red-50 text-stone-400 hover:text-red-500 rounded cursor-pointer"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

            </div>

            {/* Bottom Actions and Submit */}
            <div className="pt-4 flex justify-end gap-3 select-none">
              <button 
                type="button" 
                onClick={() => setViewState('list')}
                className="px-6 py-2.5 border border-stone-200 hover:bg-stone-100 rounded-xl text-xs font-bold text-stone-600 cursor-pointer"
              >
                Discard Form
              </button>
              <button 
                type="submit" 
                className="px-8 py-2.5 bg-[#3d6a00] hover:bg-brand-primary-light text-white font-extrabold text-xs rounded-xl shadow cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Compile Invoice</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </form>
        </div>
      )}


      {/* ---------------- GST PRINT TAX INVOICE MODAL SHEET ---------------- */}
      {viewingInvoice && (
        <div id="print-tax-invoice-sheet" className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-6 z-50 print:bg-white overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-stone-200 w-full max-w-[850px] overflow-hidden my-auto max-h-[95vh] flex flex-col font-sans print:max-h-full print:shadow-none print:border-none">
            
            {/* Modal action bar (hidden during browser window active print trigger!) */}
            <div className="p-4 bg-stone-100/80 border-b border-stone-200 flex items-center justify-between z-10 print:hidden select-none">
              <div className="flex items-center gap-1.5 text-brand-secondary font-bold text-xs uppercase">
                <FileText className="w-5 h-5 text-brand-secondary" />
                <span>GST Tax Invoice Viewer</span>
              </div>
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={handlePrint}
                  className="px-4 py-2 bg-brand-primary hover:bg-brand-primary-light text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow"
                >
                  <Printer className="w-4 h-4" /> Print / Save PDF
                </button>
                <button 
                  onClick={() => setViewingInvoice(null)}
                  className="p-1.5 bg-white border border-stone-200 text-stone-600 hover:bg-stone-50 rounded-lg cursor-pointer"
                  title="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* PRINT SHEETS LAYOUT CANVAS */}
            <div className="p-6 md:p-10 bg-white text-brand-gray-dark overflow-y-auto custom-scrollbar flex-grow print:p-0 print:overflow-visible">
              
              <div className="space-y-8 print:space-y-4">
                
                {/* Header branding block */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="space-y-2">
                    <img src={companyProfile.logoUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuCPW3EceoldRDNKHXhXbK0aGi6nD__kFN-wUrcGj5YS09Bt7cUvMv1Pe6zBeFURZrIU514uVzWj6MY3nWr9g4L73M8mrlAA1-sTN2AiyfkQ_esWu3sf-SAvgGiwiOJKrEYj7jrKuUdt8j6jXXsbyj0g7tEXc877fs3yVTqXo15vcaUqlziZ6L9vciQmi2vU0fu7Iw4p85xc4nj14Un1OoDNDB16outMrTPalbUXz0h0xoh43iFbJZktJNJia0tyjVq80mecpICV-K_f"} alt="Company Logo" className="h-12 w-auto object-contain shrink-0" />
                    <h2 className="font-display font-extrabold text-lg text-brand-gray-dark leading-none">{companyProfile.name}</h2>
                    <p className="text-[10px] text-brand-gray-medium max-w-sm">{companyProfile.address}, {companyProfile.city}, {companyProfile.pincode} - {companyProfile.state}</p>
                    <div className="text-[9.5px] text-stone-600 font-medium space-y-0.5">
                      <p>GSTIN: <span className="font-mono font-bold">{companyProfile.gstNumber}</span></p>
                      <p>PAN: <span className="font-mono font-bold">{companyProfile.panNumber}</span></p>
                      <p>Email: <span>{companyProfile.email}</span> | Phone: <span>{companyProfile.phone}</span></p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right space-y-1 sm:self-start bg-stone-50 p-4 border border-stone-200/50 rounded-xl print:bg-white print:border-none print:p-0">
                    <h1 className="font-display font-extrabold text-[#3d6a00] text-xl uppercase tracking-wider">Tax Invoice</h1>
                    <div className="text-xs font-semibold text-brand-gray-dark font-mono bg-stone-100 select-all px-2.5 py-1 rounded inline-block print:bg-white print:p-0">
                      {viewingInvoice.invoiceNumber}
                    </div>
                    <div className="text-[10px] text-zinc-500 font-sans pt-1 font-medium space-y-0.5">
                      <p>Invoice Date: <span className="font-mono text-stone-700">{viewingInvoice.date}</span></p>
                      <p>Due Date: <span className="font-mono text-stone-700">{viewingInvoice.dueDate}</span></p>
                      <p>Place of Supply: <span className="font-bold text-brand-secondary">{viewingInvoice.customerState}</span></p>
                    </div>
                  </div>
                </div>

                {/* Receiver Bill To block */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-b border-stone-150 py-4 font-sans select-none print:grid-cols-2 print:gap-2">
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest block font-sans">Billed Consignee (Buyer)</span>
                    <p className="font-bold text-xs text-[#1a1c1e]">{viewingInvoice.customerName}</p>
                    <p className="text-[10px] text-stone-600 max-w-xs">{customers.find(c => c.id === viewingInvoice.customerId)?.address || 'GIDC Industrial belt'}</p>
                    <p className="text-[10px] text-stone-600">State: <span className="font-semibold">{viewingInvoice.customerState}</span></p>
                    <p className="text-[10px] text-stone-800">GSTIN: <span className="font-mono font-bold text-[#00658d]">{viewingInvoice.customerGst || 'RETAIL BUYER'}</span></p>
                  </div>

                  <div className="space-y-1 md:text-right print:text-right">
                    <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest block font-sans">Freight Shipping Route</span>
                    <p className="text-[10px] text-stone-600">Ship To: Same as Billing address</p>
                    <p className="text-[10px] text-stone-600">Consignment Code: <span className="font-mono font-bold">GST-DEL-{viewingInvoice.id.slice(-6).toUpperCase()}</span></p>
                    <p className="text-[10px] text-stone-500">Method: Roadway transport transit cleared</p>
                  </div>
                </div>

                {/* Items table */}
                <div className="border border-stone-200/80 rounded-xl overflow-hidden print:border-none">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#ebf0e3] border-b border-brand-primary/10 text-brand-gray-dark font-bold uppercase tracking-wider text-[9px] print:bg-white print:border-b-2">
                      <tr>
                        <th className="p-3"># Particulars</th>
                        <th className="p-3">HSN Code</th>
                        <th className="p-3 text-right">Standard Rate</th>
                        <th className="p-3 text-center font-sans">Qty</th>
                        <th className="p-3 text-right">Taxable Net</th>
                        
                        {/* Calculate Intrastate Splits conditional headers */}
                        {calculateIntrastate(viewingInvoice.customerState) ? (
                          <>
                            <th className="p-3 text-right">CGST</th>
                            <th className="p-3 text-right">SGST</th>
                          </>
                        ) : (
                          <th className="p-3 text-right">IGST</th>
                        )}
                        <th className="p-3 text-right">Total Net (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 font-sans">
                      {viewingInvoice.items.map((item, i) => (
                        <tr key={i} className="align-top hover:bg-stone-50/50 print:bg-white text-[10.5px]">
                          <td className="p-3 font-medium text-brand-gray-dark">
                            <div>{item.productName}</div>
                          </td>
                          
                          <td className="p-3 font-mono text-brand-secondary text-[10px]">{item.hsnCode}</td>
                          
                          <td className="p-3 text-right font-mono">₹{item.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                          <td className="p-3 text-center font-bold">{item.qty} {item.unit}</td>
                          <td className="p-3 text-right font-mono">₹{item.taxableValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                          
                          {/* Intrastate vs Interstate columns */}
                          {calculateIntrastate(viewingInvoice.customerState) ? (
                            <>
                              <td className="p-3 text-right font-mono text-stone-500">
                                <div>₹{item.cgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                                <span className="text-[8px] block font-sans">({item.gstRate / 2}%)</span>
                              </td>
                              <td className="p-3 text-right font-mono text-stone-500">
                                <div>₹{item.sgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                                <span className="text-[8px] block font-sans font-sans">({item.gstRate / 2}%)</span>
                              </td>
                            </>
                          ) : (
                            <td className="p-3 text-right font-mono text-stone-500">
                              <div>₹{item.igstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                              <span className="text-[8px] block font-sans">({item.gstRate}%)</span>
                            </td>
                          )}

                          <td className="p-3 text-right font-mono font-bold text-brand-gray-dark">
                            ₹{item.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals split panel */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-4 pt-4 border-t border-stone-200/80 font-sans print:flex-row">
                  
                  {/* Bank Details section */}
                  <div className="p-4 bg-stone-50 border border-stone-200/50 rounded-xl max-w-sm selection:bg-transparent font-sans space-y-1 flex-1 print:bg-white print:border-none print:p-0">
                    <h3 className="text-[9px] font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1">
                      <Landmark className="w-3 h-3 text-brand-primary" /> Bank-Transfer Remittance
                    </h3>
                    <div className="text-[10px] text-stone-600 font-medium space-y-0.5 pt-1">
                      <p>Preferred Beneficiary: <span className="font-bold text-brand-secondary">{companyProfile.name}</span></p>
                      <p>Account Value: <span className="font-mono font-bold">{companyProfile.accountNumber}</span></p>
                      <p>Remittance Code (IFSC): <span className="font-mono font-bold">{companyProfile.ifscCode}</span></p>
                      <p>Bank Location: <span className="font-semibold text-brand-gray-dark">{companyProfile.bankName}</span></p>
                    </div>
                  </div>

                  {/* Calculations breakdown sheet */}
                  <div className="w-full md:w-80 space-y-2 select-none print:w-72">
                    <div className="flex justify-between text-xs text-stone-500 font-medium font-sans">
                      <span>Aggregate Taxable:</span>
                      <span className="font-mono font-semibold">₹{viewingInvoice.totalTaxable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>

                    {calculateIntrastate(viewingInvoice.customerState) ? (
                      <>
                        <div className="flex justify-between text-xs text-stone-500 font-medium font-sans">
                          <span>CGST Collects:</span>
                          <span className="font-mono font-semibold">₹{viewingInvoice.totalCgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between text-xs text-stone-500 font-medium font-sans">
                          <span>SGST Collects:</span>
                          <span className="font-mono font-semibold">₹{viewingInvoice.totalSgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex justify-between text-xs text-stone-500 font-medium font-sans">
                        <span>IGST Collects:</span>
                        <span className="font-mono font-semibold">₹{viewingInvoice.totalIgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      </div>
                    )}

                    <div className="h-[1px] bg-stone-200 my-1"></div>

                    <div className="flex justify-between text-sm text-brand-gray-dark font-extrabold font-sans">
                      <span className="text-[#3d6a00]">Total Invoice net:</span>
                      <span className="font-mono text-brand-secondary font-extrabold">₹{viewingInvoice.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <span className="text-[8.5px] text-zinc-400 block pt-1 text-right italic font-medium">All valuations computed in GSTR formats.</span>
                  </div>

                </div>

                {/* Signature footers */}
                <div className="pt-8 flex justify-between items-end border-t border-dashed border-stone-200 text-zinc-400 text-[10px] select-none uppercase tracking-wider font-semibold font-sans print:pt-4">
                  <div>
                    <p className="text-zinc-300">SYSTEM STAMP SECURED</p>
                    <p className="text-[8px] text-stone-400/80 font-mono lower font-sans">ID: EBT-STAMP-{viewingInvoice.id}</p>
                  </div>
                  
                  <div className="text-right space-y-4 font-sans">
                    <div className="text-[9px] text-[#3d6a00] font-bold flex items-center gap-1 justify-end">
                      <CheckCircle className="w-3.5 h-3.5" /> Digitally Verified Signatory
                    </div>
                    <p className="text-stone-800 text-xs font-bold leading-none">{companyProfile.name}</p>
                    <p className="text-[9px] text-stone-400 leading-none">Authorized Representative Signature</p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
