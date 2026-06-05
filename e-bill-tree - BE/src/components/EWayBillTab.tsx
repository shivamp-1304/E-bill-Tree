import { Search, Plus, Truck, AlertTriangle, CheckCircle, Trash2, Pencil } from 'lucide-react';
import React, { useState } from 'react';
import { EWayBill, Invoice } from '../types';

interface EWayBillTabProps {
  ewayBills: EWayBill[];
  invoices: Invoice[];
  onAddEWayBill: (ewayBill: EWayBill) => void;
  onUpdateEWayBill: (ewayBill: EWayBill) => void;
  onDeleteEWayBill: (id: string) => void;
}

export default function EWayBillTab({ ewayBills, invoices, onAddEWayBill, onUpdateEWayBill, onDeleteEWayBill }: EWayBillTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEWayBill, setEditingEWayBill] = useState<EWayBill | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form states
  const [invoiceId, setInvoiceId] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [transporterName, setTransporterName] = useState('');
  const [distanceKm, setDistanceKm] = useState(100);

  const filtered = ewayBills.filter(ew => 
    ew.ewayBillNumber.includes(searchTerm) ||
    ew.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ew.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceId || !vehicleNumber || !transporterName) {
      alert("Specify invoice, vehicle number, and transport company!");
      return;
    }

    const selectedInvoice = invoices.find(inv => inv.id === invoiceId);
    if (!selectedInvoice) return;

    // eWay Bill number length: 12-digit number sequence
    const uniqueDigits = Math.floor(1000000000 + Math.random() * 9000000000);
    const mockEwayNum = `22${uniqueDigits}`;

    const date = new Date();
    date.setDate(date.getDate() + 3); // Valid for 3 days
    const validUntil = date.toISOString().split('T')[0];

    const newEway: EWayBill = {
      id: `ewb-${Date.now()}`,
      ewayBillNumber: mockEwayNum,
      invoiceId: selectedInvoice.id,
      invoiceNumber: selectedInvoice.invoiceNumber,
      vehicleNumber: vehicleNumber.toUpperCase().trim(),
      transporterName,
      distanceKm: Number(distanceKm),
      status: 'Active',
      validUntil
    };

    onAddEWayBill(newEway);
    setShowAddModal(false);

    // Reset fields
    setInvoiceId('');
    setVehicleNumber('');
    setTransporterName('');
    setDistanceKm(100);
  };

  // Edit handlers
  const handleEditClick = (ew: EWayBill) => {
    setEditingEWayBill({ ...ew });
    setInvoiceId(ew.invoiceId);
    setVehicleNumber(ew.vehicleNumber);
    setTransporterName(ew.transporterName);
    setDistanceKm(ew.distanceKm);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEWayBill || !vehicleNumber || !transporterName) return;

    const updated: EWayBill = {
      ...editingEWayBill,
      vehicleNumber: vehicleNumber.toUpperCase().trim(),
      transporterName,
      distanceKm: Number(distanceKm)
    };

    onUpdateEWayBill(updated);
    setEditingEWayBill(null);
    setVehicleNumber('');
    setTransporterName('');
    setDistanceKm(100);
  };

  const handleConfirmDelete = (id: string) => {
    onDeleteEWayBill(id);
    setDeleteConfirmId(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Alert banner about requirements */}
      <div className="p-4 bg-[#f1f5e8] border border-brand-primary-light/20 rounded-xl text-xs text-[#2c5100] flex items-start gap-3 select-none font-sans font-medium">
        <Truck className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">E-Way Bill Compliance Notice</p>
          <p className="mt-1 leading-normal">
            E-Way bill generation is mandatory for transit of goods worth more than ₹50,000 in India. Ensure the motor vehicle license number plate matches the physically assigned vehicle.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between font-sans">
        
        <div className="relative flex-grow max-w-md">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400">
            <Search className="w-4 h-4" />
          </span>
          <input 
            type="text"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 outline-none text-xs focus:ring-1 focus:ring-brand-primary focus:border-brand-primary placeholder:text-stone-400 bg-white"
            placeholder="Search eWay Bills by number, invoice reference, or vehicle..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <button 
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 bg-brand-primary hover:bg-brand-primary-light text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Generate E-Way Bill</span>
        </button>

      </div>

      {/* Main Grid table */}
      <div className="bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden font-sans">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-stone-400 font-sans space-y-2">
            <Truck className="w-12 h-12 text-stone-300 mx-auto animate-bounce" />
            <p className="text-sm font-semibold">No E-Way bills generated yet</p>
            <p className="text-xs">Bind your active product invoices onto electronic transporter way slips.</p>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#ebf0e3] border-b border-brand-primary/10 text-brand-gray-dark font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Waybill Number</th>
                  <th className="p-4">Linked Invoice</th>
                  <th className="p-4">Vehicle Details</th>
                  <th className="p-4">Transporter Name</th>
                  <th className="p-4 text-right">Distance (Km)</th>
                  <th className="p-4">Valid Until</th>
                  <th className="p-4">Access Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filtered.map((ew) => (
                  <tr key={ew.id} className="hover:bg-stone-50/50 transition-colors">
                    
                    {/* Waybill num */}
                    <td className="p-4 font-bold text-brand-secondary font-mono tracking-wider dark:text-brand-secondary text-xs">
                      {ew.ewayBillNumber}
                    </td>

                    {/* Linked Invoice */}
                    <td className="p-4">
                      <div className="font-semibold text-brand-gray-dark text-xs">{ew.invoiceNumber}</div>
                      <div className="text-[10px] text-zinc-400 font-mono">ID: {ew.invoiceId}</div>
                    </td>

                    {/* Vehicle */}
                    <td className="p-4 font-mono font-semibold text-stone-700 bg-stone-50 border-r border-stone-100/50 text-[11px] px-2.5 py-1 text-center rounded max-w-[120px]">
                      {ew.vehicleNumber}
                    </td>

                    {/* Transporter */}
                    <td className="p-4 text-xs font-medium text-brand-gray-medium">
                      {ew.transporterName}
                    </td>

                    {/* Distance */}
                    <td className="p-4 font-mono text-right text-brand-gray-dark font-semibold">
                      {ew.distanceKm} km
                    </td>

                    {/* Valid date */}
                    <td className="p-4 font-mono text-[10.5px] text-brand-gray-medium">
                      {ew.validUntil}
                    </td>

                    {/* Status badge */}
                    <td className="p-4">
                      {ew.status === 'Active' ? (
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold rounded text-[10px] inline-flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-emerald-500" /> ACTIVE
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 font-bold rounded text-[10px] inline-flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-amber-500" /> EXPIRED
                        </span>
                      )}
                    </td>

                    {/* Actions edit + delete */}
                    <td className="p-4 text-center">
                      <div className="flex gap-1.5 justify-center items-center">
                        <button 
                          onClick={() => handleEditClick(ew)}
                          className="p-1.5 hover:bg-amber-50 text-stone-400 hover:text-amber-600 rounded-lg cursor-pointer"
                          title="Edit E-Way Bill"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => setDeleteConfirmId(ew.id)}
                          className="p-1.5 hover:bg-stone-100 text-stone-400 hover:text-red-500 rounded-lg cursor-pointer"
                          title="Delete E-Way Bill"
                        >
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
        <div id="add-eway-modal" className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg border border-stone-200 w-full max-w-sm overflow-hidden font-sans">
            
            <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-[#ebf0e3]">
              <h3 className="font-display font-extrabold text-sm text-brand-gray-dark flex items-center gap-2">
                <Truck className="w-4 h-4 text-brand-primary" />
                <span>Issue E-Way Bill</span>
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
                <label className="block text-xs font-semibold text-brand-gray-medium">Select Approved Invoice *</label>
                <select 
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:ring-1 focus:ring-brand-primary focus:border-brand-primary outline-none"
                  required
                  value={invoiceId}
                  onChange={(e) => setInvoiceId(e.target.value)}
                >
                  <option value="">-- Choose Invoice (Unassigned only) --</option>
                  {invoices.map(inv => {
                    // Check if waybill already exists for this invoice
                    const alreadyBound = ewayBills.some(ew => ew.invoiceId === inv.id);
                    if (alreadyBound) return null;
                    return (
                      <option key={inv.id} value={inv.id}>{inv.invoiceNumber} - ₹{inv.totalAmount.toLocaleString('en-IN')}</option>
                    );
                  })}
                </select>
                {invoices.length === 0 && <span className="text-[10px] text-zinc-400 block pt-0.5">Please generate a valid approved invoice first.</span>}
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-brand-gray-medium">Transporter Name *</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:ring-1 focus:ring-brand-primary"
                  placeholder="e.g. VRL Logistics Ltd"
                  required
                  value={transporterName}
                  onChange={(e) => setTransporterName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-brand-gray-medium">Vehicle License No *</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs font-mono uppercase"
                    placeholder="e.g. MH-12-PQ-9876"
                    required
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#1a1c1e]">Sway Distance (Km) *</label>
                  <input 
                    type="number" 
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs font-mono"
                    placeholder="100"
                    min="1"
                    required
                    value={distanceKm || ''}
                    onChange={(e) => setDistanceKm(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3 select-none">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-stone-200 hover:bg-stone-50 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-brand-primary hover:bg-brand-primary-light text-white rounded-xl text-xs font-bold cursor-pointer shadow"
                >
                  Generate Waybill
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingEWayBill && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg border border-stone-200 w-full max-w-sm overflow-hidden font-sans">
            <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-[#ebf0e3]">
              <h3 className="font-display font-extrabold text-sm text-brand-gray-dark flex items-center gap-2">
                <Pencil className="w-4 h-4 text-brand-primary" />
                <span>Edit E-Way Bill</span>
              </h3>
              <button onClick={() => setEditingEWayBill(null)} className="text-stone-400 hover:text-brand-gray-dark font-bold text-lg cursor-pointer">×</button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-brand-gray-medium">Invoice Reference</label>
                <input type="text" className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs bg-stone-50" value={editingEWayBill.invoiceNumber} disabled />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-brand-gray-medium">Transporter Name *</label>
                <input type="text" className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs" required value={transporterName} onChange={(e) => setTransporterName(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-brand-gray-medium">Vehicle License No *</label>
                  <input type="text" className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs font-mono uppercase" required value={vehicleNumber} onChange={(e) => setVehicleNumber(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-brand-gray-medium">Distance (Km) *</label>
                  <input type="number" className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs font-mono" min="1" required value={distanceKm || ''} onChange={(e) => setDistanceKm(Number(e.target.value))} />
                </div>
              </div>
              <div className="pt-2 flex justify-end gap-3">
                <button type="button" onClick={() => setEditingEWayBill(null)} className="px-4 py-2 border border-stone-200 hover:bg-stone-50 rounded-xl text-xs font-bold cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-brand-primary hover:bg-brand-primary-light text-white rounded-xl text-xs font-bold cursor-pointer shadow">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg border border-stone-200 w-full max-w-sm p-6 space-y-4 font-sans">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-50 rounded-full"><Trash2 className="w-5 h-5 text-red-500" /></div>
              <div>
                <h3 className="font-bold text-sm text-brand-gray-dark">Delete E-Way Bill?</h3>
                <p className="text-xs text-stone-500">This action cannot be undone.</p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteConfirmId(null)} className="px-4 py-2 border border-stone-200 hover:bg-stone-50 rounded-xl text-xs font-bold cursor-pointer">Cancel</button>
              <button onClick={() => handleConfirmDelete(deleteConfirmId)} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold cursor-pointer">Delete</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
