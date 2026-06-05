import { Search, Plus, UserPlus, Mail, Phone, MapPin, Building, Trash2, Pencil } from 'lucide-react';
import React, { useState } from 'react';
import { Customer } from '../types';

interface CustomersTabProps {
  customers: Customer[];
  onAddCustomer: (customer: Customer) => void;
  onUpdateCustomer: (customer: Customer) => void;
  onDeleteCustomer: (id: string) => void;
}

export default function CustomersTab({ customers, onAddCustomer, onUpdateCustomer, onDeleteCustomer }: CustomersTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Maharashtra');
  const [pincode, setPincode] = useState('');

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.gstNumber && c.gstNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone) {
      alert("Please fill in all required fields!");
      return;
    }

    const newCustomer: Customer = {
      id: `cust-${Date.now()}`,
      name,
      gstNumber: gstNumber.toUpperCase().trim(),
      email,
      phone,
      address,
      city,
      state,
      pincode
    };

    onAddCustomer(newCustomer);
    setShowAddModal(false);

    // Reset fields
    setName('');
    setGstNumber('');
    setEmail('');
    setPhone('');
    setAddress('');
    setCity('');
    setState('Maharashtra');
    setPincode('');
  };

  // Open edit modal with pre-filled data
  const handleEditClick = (cust: Customer) => {
    setEditingCustomer(cust);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;
    if (!editingCustomer.name || !editingCustomer.email || !editingCustomer.phone) {
      alert('Please fill in all required fields!');
      return;
    }
    onUpdateCustomer(editingCustomer);
    setEditingCustomer(null);
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmId) {
      onDeleteCustomer(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Search and Action header banner */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        
        <div className="relative flex-grow max-w-md">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400">
            <Search className="w-4 h-4" />
          </span>
          <input 
            type="text"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 outline-none text-xs focus:ring-1 focus:ring-brand-primary focus:border-brand-primary placeholder:text-stone-400 bg-white"
            placeholder="Search customers by name, email, or GSTIN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <button 
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 bg-brand-primary hover:bg-brand-primary-light text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Customer</span>
        </button>

      </div>

      {/* Main client gallery/list */}
      <div className="bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden font-sans">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-stone-400 font-sans space-y-2">
            <UserPlus className="w-12 h-12 text-stone-300 mx-auto" />
            <p className="text-sm font-semibold">No customers found</p>
            <p className="text-xs">Add standard business buyers to sync with invoices.</p>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#ebf0e3] border-b border-brand-primary/10 text-brand-gray-dark font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Customer Details</th>
                  <th className="p-4">GSTIN &amp; State</th>
                  <th className="p-4">Contact Info</th>
                  <th className="p-4">Corporate Address</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-stone-50/50 transition-colors">
                    
                    {/* Name detail */}
                    <td className="p-4">
                      <div className="font-semibold text-brand-gray-dark text-xs">{c.name}</div>
                      <div className="text-[10px] text-stone-500 font-mono mt-0.5">UID: {c.id}</div>
                    </td>

                    {/* GSTIN and Area state */}
                    <td className="p-4">
                      <div className="font-mono bg-stone-100 px-2 py-0.5 rounded text-[10.5px] font-semibold text-[#004c6b] w-fit">
                        {c.gstNumber || "RETAIL / UNREGISTERED"}
                      </div>
                      <div className="text-[10px] text-brand-gray-medium font-medium mt-1">State: {c.state}</div>
                    </td>

                    {/* Contacts */}
                    <td className="p-4 space-y-1 text-stone-600">
                      <div className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-stone-400 shrink-0" /> {c.email}</div>
                      <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" /> {c.phone}</div>
                    </td>

                    {/* Business address physical */}
                    <td className="p-4 text-stone-600 max-w-xs">
                      <div className="truncate flex items-start gap-1"><MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" /> {c.address}</div>
                      <div className="text-[10px] text-stone-500 ml-5">{c.city}, {c.pincode}</div>
                    </td>

                    {/* Core action bars */}
                    <td className="p-4 text-center">
                      <div className="flex gap-1.5 justify-center">
                        <button 
                          onClick={() => handleEditClick(c)}
                          className="p-1.5 hover:bg-blue-50 text-stone-400 hover:text-blue-500 rounded-lg transition-colors cursor-pointer inline-flex"
                          title="Edit customer"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setDeleteConfirmId(c.id)}
                          className="p-1.5 hover:bg-red-50 text-stone-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer inline-flex"
                          title="Delete customer"
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

      {/* Add New Customer Modal Overlay */}
      {showAddModal && (
        <div id="add-customer-modal" className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg border border-stone-200 w-full max-w-md overflow-hidden font-sans">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-[#ebf0e3]">
              <h3 className="font-display font-extrabold text-sm text-brand-gray-dark flex items-center gap-2">
                <Plus className="w-4 h-4 text-brand-primary" />
                <span>Add Customer Registry</span>
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-stone-400 hover:text-brand-gray-dark text-lg font-bold cursor-pointer"
              >
                ×
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-brand-gray-medium">Company / Customer Name *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"><Building className="w-4 h-4" /></span>
                  <input 
                    type="text" 
                    className="w-full pl-9 pr-3 py-2 border border-stone-200 rounded-xl text-xs focus:ring-1 focus:ring-brand-primary focus:border-brand-primary outline-none"
                    placeholder="e.g. Tata Steel Plant"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-brand-gray-medium">GSTIN (Optional)</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs uppercase focus:ring-1 focus:ring-brand-primary focus:border-brand-primary outline-none font-mono"
                    placeholder="27AAACT1234A..."
                    value={gstNumber}
                    onChange={(e) => setGstNumber(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-brand-gray-medium">State *</label>
                  <select 
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:ring-1 focus:ring-brand-primary"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
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

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-brand-gray-medium">Email Address *</label>
                  <input 
                    type="email" 
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:ring-1"
                    placeholder="name@buyer.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-brand-gray-medium">Phone Number *</label>
                  <input 
                    type="tel" 
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:ring-1"
                    placeholder="+91 XXXXX XXXXX"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-brand-gray-medium">Detailed Address</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs"
                  placeholder="Plot No 4, Industrial GIDC Phase 3"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-brand-gray-medium">City</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs"
                    placeholder="Ahmedabad"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-brand-gray-medium">Pincode</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs"
                    placeholder="380001"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3 select-none">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-stone-200 hover:bg-stone-50 rounded-xl text-xs font-bold font-sans cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-brand-primary hover:bg-brand-primary-light text-white rounded-xl text-xs font-bold font-sans cursor-pointer shadow"
                >
                  Save Buyer
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {editingCustomer && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg border border-stone-200 w-full max-w-md overflow-hidden font-sans">
            <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-blue-50">
              <h3 className="font-display font-extrabold text-sm text-brand-gray-dark flex items-center gap-2">
                <Pencil className="w-4 h-4 text-blue-500" />
                <span>Edit Customer</span>
              </h3>
              <button onClick={() => setEditingCustomer(null)} className="text-stone-400 hover:text-brand-gray-dark text-lg font-bold cursor-pointer">×</button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-brand-gray-medium">Company / Customer Name *</label>
                <input type="text" className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 outline-none" required value={editingCustomer.name} onChange={(e) => setEditingCustomer({ ...editingCustomer, name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-brand-gray-medium">GSTIN</label>
                  <input type="text" className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs uppercase font-mono outline-none focus:ring-1 focus:ring-blue-500" value={editingCustomer.gstNumber || ''} onChange={(e) => setEditingCustomer({ ...editingCustomer, gstNumber: e.target.value.toUpperCase() })} />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-brand-gray-medium">State *</label>
                  <select className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:ring-1" value={editingCustomer.state} onChange={(e) => setEditingCustomer({ ...editingCustomer, state: e.target.value })}>
                    <option value="Maharashtra">Maharashtra</option><option value="Karnataka">Karnataka</option><option value="Delhi">Delhi</option><option value="Tamil Nadu">Tamil Nadu</option><option value="Uttar Pradesh">Uttar Pradesh</option><option value="Gujarat">Gujarat</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-brand-gray-medium">Email *</label>
                  <input type="email" className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:ring-1" required value={editingCustomer.email} onChange={(e) => setEditingCustomer({ ...editingCustomer, email: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-brand-gray-medium">Phone *</label>
                  <input type="tel" className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:ring-1" required value={editingCustomer.phone} onChange={(e) => setEditingCustomer({ ...editingCustomer, phone: e.target.value })} />
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-brand-gray-medium">Address</label>
                <input type="text" className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs" value={editingCustomer.address} onChange={(e) => setEditingCustomer({ ...editingCustomer, address: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-brand-gray-medium">City</label>
                  <input type="text" className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs" value={editingCustomer.city} onChange={(e) => setEditingCustomer({ ...editingCustomer, city: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-brand-gray-medium">Pincode</label>
                  <input type="text" className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs" value={editingCustomer.pincode} onChange={(e) => setEditingCustomer({ ...editingCustomer, pincode: e.target.value })} />
                </div>
              </div>
              <div className="pt-2 flex justify-end gap-3">
                <button type="button" onClick={() => setEditingCustomer(null)} className="px-4 py-2 border border-stone-200 hover:bg-stone-50 rounded-xl text-xs font-bold cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow">Update Customer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg border border-stone-200 w-full max-w-sm p-6 font-sans text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="font-display font-extrabold text-base text-brand-gray-dark">Delete Customer?</h3>
            <p className="text-xs text-stone-500">This action cannot be undone. The customer will be permanently removed from your registry.</p>
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
