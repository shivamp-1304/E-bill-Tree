import { Search, Plus, FileSpreadsheet, Trash2, Pencil } from 'lucide-react';
import React, { useState } from 'react';
import { Challan, Customer } from '../types';

interface ChallansTabProps {
  challans: Challan[];
  customers: Customer[];
  onAddChallan: (challan: Challan) => void;
  onUpdateChallan: (challan: Challan) => void;
  onDeleteChallan: (id: string) => void;
}

export default function ChallansTab({ challans, customers, onAddChallan, onUpdateChallan, onDeleteChallan }: ChallansTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingChallan, setEditingChallan] = useState<Challan | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form states
  const [customerId, setCustomerId] = useState('');
  const [productName, setProductName] = useState('');
  const [qty, setQty] = useState(1);
  const [unit, setUnit] = useState('PCS');
  const [purpose, setPurpose] = useState('Sent for approval / Sale on return basis');
  const [status, setStatus] = useState<'Pending' | 'Returned' | 'Invoiced'>('Pending');

  const filtered = challans.filter(ch => 
    ch.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ch.challanNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId || !productName || qty <= 0) {
      alert("Please choose a valid customer and specify items!");
      return;
    }

    const selectedCustomer = customers.find(c => c.id === customerId);
    if (!selectedCustomer) return;

    const newChallan: Challan = {
      id: `ch-${Date.now()}`,
      challanNumber: `EBT-CH-${Math.floor(100 + Math.random() * 900)}`,
      date: new Date().toISOString().split('T')[0],
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      items: [
        { productName, qty: Number(qty), unit }
      ],
      purpose,
      status
    };

    onAddChallan(newChallan);
    setShowAddModal(false);

    // Reset fields
    setCustomerId('');
    setProductName('');
    setQty(1);
    setUnit('PCS');
    setPurpose('Sent for approval / Sale on return basis');
    setStatus('Pending');
  };

  const handleEditClick = (ch: Challan) => {
    setEditingChallan(ch);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingChallan) return;
    onUpdateChallan(editingChallan);
    setEditingChallan(null);
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmId) {
      onDeleteChallan(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Action panel */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        <div className="relative flex-grow max-w-md">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400">
            <Search className="w-4 h-4" />
          </span>
          <input 
            type="text"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 outline-none text-xs focus:ring-1 focus:ring-brand-primary focus:border-brand-primary placeholder:text-stone-400 bg-white"
            placeholder="Search delivery challans..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <button 
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 bg-[#3d6a00] hover:bg-brand-primary-light text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer shrink-0 animate-fade-in"
        >
          <Plus className="w-4 h-4" />
          <span>New Delivery Challan</span>
        </button>
      </div>

      {/* Main Challan Listing */}
      <div className="bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden font-sans">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-stone-400 space-y-2">
            <FileSpreadsheet className="w-12 h-12 text-stone-300 mx-auto" />
            <p className="text-sm font-semibold">No delivery challans registered</p>
            <p className="text-xs">Create temporary dispatch notes easily for goods transport.</p>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#ebf0e3] border-b border-brand-primary/10 text-brand-gray-dark font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Challan No &amp; Date</th>
                  <th className="p-4">Client Receiver</th>
                  <th className="p-4">Dispatched Commodities</th>
                  <th className="p-4">Purpose / Remarks</th>
                  <th className="p-4">E-Way Link Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filtered.map((ch) => (
                  <tr key={ch.id} className="hover:bg-stone-50/50 transition-colors">
                    
                    <td className="p-4">
                      <div className="font-bold text-brand-secondary font-mono text-xs">{ch.challanNumber}</div>
                      <div className="text-[10px] text-zinc-400 font-mono mt-1">{ch.date}</div>
                    </td>

                    <td className="p-4">
                      <div className="font-semibold text-brand-gray-dark text-xs">{ch.customerName}</div>
                      <div className="text-[10px] text-zinc-400">ID: {ch.customerId}</div>
                    </td>

                    <td className="p-4">
                      <div className="space-y-1">
                        {ch.items.map((it, i) => (
                          <div key={i} className="text-xs font-semibold text-brand-gray-medium">
                            {it.qty} {it.unit} × {it.productName}
                          </div>
                        ))}
                      </div>
                    </td>

                    <td className="p-4 text-stone-600 max-w-xs truncate" title={ch.purpose}>
                      {ch.purpose}
                    </td>

                    <td className="p-4">
                      <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full inline-block ${
                        ch.status === 'Invoiced' ? 'bg-emerald-50 text-emerald-700' :
                        ch.status === 'Returned' ? 'bg-zinc-100 text-zinc-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {ch.status}
                      </span>
                    </td>

                    <td className="p-4 text-center">
                      <div className="flex gap-1.5 justify-center">
                        <button onClick={() => handleEditClick(ch)} className="p-1.5 hover:bg-blue-50 text-stone-400 hover:text-blue-500 rounded-lg cursor-pointer" title="Edit challan">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteConfirmId(ch.id)} className="p-1.5 hover:bg-stone-100 rounded-lg text-stone-400 hover:text-red-500 cursor-pointer" title="Delete dispatch">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div id="add-challan-modal" className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg border border-stone-200 w-full max-w-sm overflow-hidden font-sans">
            
            <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-[#ebf0e3]">
              <h3 className="font-display font-bold text-sm text-brand-gray-dark flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-brand-primary" />
                <span>Create Delivery Challan</span>
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-stone-400 hover:text-brand-gray-dark font-bold text-lg cursor-pointer"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-brand-gray-medium">Select Consignee Client *</label>
                <select 
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:ring-1 focus:ring-brand-primary"
                  required
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                >
                  <option value="">-- Choose Client --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-brand-gray-medium">Item Details *</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs"
                  placeholder="e.g. Prototype Spring Dampeners Steel"
                  required
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-brand-gray-medium">Dispatch Qty *</label>
                  <input 
                    type="number" 
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs font-mono"
                    min="1"
                    required
                    value={qty || ''}
                    onChange={(e) => setQty(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-brand-gray-medium">Unit Of Measure *</label>
                  <select 
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                  >
                    <option value="PCS">PCS</option>
                    <option value="SET">SET</option>
                    <option value="NOS">NOS</option>
                    <option value="BOX">BOX</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-brand-gray-medium">Purpose in GSTR *</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs"
                  placeholder="e.g. Sent for trail testing assembly line"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-brand-gray-medium">Status flag</label>
                <select 
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:ring-1 focus:ring-brand-primary"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                >
                  <option value="Pending">Pending (Dispatched)</option>
                  <option value="Returned">Returned (Consigned back)</option>
                  <option value="Invoiced">Invoiced (Billed successfully)</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-3 select-none">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-stone-200 hover:bg-stone-50 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-brand-primary hover:bg-brand-primary-light text-white rounded-xl text-xs font-bold cursor-pointer shadow"
                >
                  Create Challan
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Edit Challan Modal */}
      {editingChallan && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg border border-stone-200 w-full max-w-sm overflow-hidden font-sans">
            <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-blue-50">
              <h3 className="font-display font-bold text-sm text-brand-gray-dark flex items-center gap-2"><Pencil className="w-4 h-4 text-blue-500" /><span>Edit Challan</span></h3>
              <button onClick={() => setEditingChallan(null)} className="text-stone-400 hover:text-brand-gray-dark font-bold text-lg cursor-pointer">×</button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-brand-gray-medium">Customer</label>
                <select className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs" value={editingChallan.customerId} onChange={(e) => { const c = customers.find(cu => cu.id === e.target.value); if (c) setEditingChallan({ ...editingChallan, customerId: c.id, customerName: c.name }); }}>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-brand-gray-medium">Items (product name)</label>
                <input type="text" className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs" value={editingChallan.items[0]?.productName || ''} onChange={(e) => { const items = [...editingChallan.items]; items[0] = { ...items[0], productName: e.target.value }; setEditingChallan({ ...editingChallan, items }); }} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-brand-gray-medium">Qty</label>
                  <input type="number" className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs font-mono" min="1" value={editingChallan.items[0]?.qty || 1} onChange={(e) => { const items = [...editingChallan.items]; items[0] = { ...items[0], qty: Number(e.target.value) }; setEditingChallan({ ...editingChallan, items }); }} />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-brand-gray-medium">Unit</label>
                  <select className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs" value={editingChallan.items[0]?.unit || 'PCS'} onChange={(e) => { const items = [...editingChallan.items]; items[0] = { ...items[0], unit: e.target.value }; setEditingChallan({ ...editingChallan, items }); }}>
                    <option value="PCS">PCS</option><option value="SET">SET</option><option value="NOS">NOS</option><option value="BOX">BOX</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-brand-gray-medium">Purpose</label>
                <input type="text" className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs" value={editingChallan.purpose} onChange={(e) => setEditingChallan({ ...editingChallan, purpose: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-brand-gray-medium">Status</label>
                <select className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs" value={editingChallan.status} onChange={(e) => setEditingChallan({ ...editingChallan, status: e.target.value as any })}>
                  <option value="Pending">Pending</option><option value="Returned">Returned</option><option value="Invoiced">Invoiced</option>
                </select>
              </div>
              <div className="pt-2 flex justify-end gap-3">
                <button type="button" onClick={() => setEditingChallan(null)} className="px-4 py-2 border border-stone-200 hover:bg-stone-50 rounded-xl text-xs font-semibold cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow">Update Challan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg border border-stone-200 w-full max-w-sm p-6 font-sans text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto"><Trash2 className="w-6 h-6 text-red-500" /></div>
            <h3 className="font-display font-extrabold text-base text-brand-gray-dark">Delete Challan?</h3>
            <p className="text-xs text-stone-500">This action cannot be undone.</p>
            <div className="flex gap-3 justify-center pt-2">
              <button onClick={() => setDeleteConfirmId(null)} className="px-5 py-2 border border-stone-200 hover:bg-stone-50 rounded-xl text-xs font-bold cursor-pointer">Cancel</button>
              <button onClick={handleConfirmDelete} className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow">Delete</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
