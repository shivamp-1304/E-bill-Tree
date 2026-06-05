import { Search, Plus, PackageOpen, Trash2, ShieldQuestion, Pencil } from 'lucide-react';
import React, { useState } from 'react';
import { Product } from '../types';

interface ProductsTabProps {
  products: Product[];
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
}

export default function ProductsTab({ products, onAddProduct, onUpdateProduct, onDeleteProduct }: ProductsTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [hsnCode, setHsnCode] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [unit, setUnit] = useState('PCS');
  const [gstRate, setGstRate] = useState<number>(18);

  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.hsnCode.includes(searchTerm)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !hsnCode || price <= 0) {
      alert("Please fill in all product specifications!");
      return;
    }

    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      name,
      hsnCode,
      price: Number(price),
      unit,
      gstRate: Number(gstRate)
    };

    onAddProduct(newProduct);
    setShowAddModal(false);

    // Reset fields
    setName('');
    setHsnCode('');
    setPrice(0);
    setUnit('PCS');
    setGstRate(18);
  };

  const handleEditClick = (prod: Product) => {
    setEditingProduct(prod);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    if (!editingProduct.name || !editingProduct.hsnCode || editingProduct.price <= 0) {
      alert('Please fill in all product specifications!');
      return;
    }
    onUpdateProduct(editingProduct);
    setEditingProduct(null);
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmId) {
      onDeleteProduct(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Search and Action bars */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        
        <div className="relative flex-grow max-w-md">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400">
            <Search className="w-4 h-4" />
          </span>
          <input 
            type="text"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 outline-none text-xs focus:ring-1 focus:ring-brand-primary focus:border-brand-primary placeholder:text-stone-400 bg-white"
            placeholder="Search products by title or HSN system code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <button 
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 bg-brand-primary hover:bg-brand-primary-light text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>

      </div>

      {/* Grid listing */}
      <div className="bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden font-sans">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-stone-400 font-sans space-y-2">
            <PackageOpen className="w-12 h-12 text-stone-300 mx-auto" />
            <p className="text-sm font-semibold">No products found</p>
            <p className="text-xs">Populate catalog elements with customized pricing &amp; tax brackets.</p>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#ebf0e3] border-b border-brand-primary/10 text-brand-gray-dark font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Item Details</th>
                  <th className="p-4">HSN Classification</th>
                  <th className="p-4 text-right">Standard Price</th>
                  <th className="p-4">Measuring Unit</th>
                  <th className="p-4">GST Tax Bracket</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-stone-50/50 transition-colors">
                    
                    {/* Name */}
                    <td className="p-4">
                      <div className="font-semibold text-brand-gray-dark text-xs">{p.name}</div>
                      <div className="text-[10px] text-stone-500 font-mono mt-0.5">SKU: {p.id}</div>
                    </td>

                    {/* HSN Code */}
                    <td className="p-4 font-mono font-semibold text-[#004c6b]">
                      {p.hsnCode}
                    </td>

                    {/* Price with tabular digits */}
                    <td className="p-4 font-mono text-right text-xs font-bold text-brand-gray-dark">
                      ₹{p.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    {/* Unit */}
                    <td className="p-4">
                      <span className="px-2 py-0.5 bg-stone-100 border border-stone-200 text-stone-700 text-[10px] font-bold rounded">
                        {p.unit}
                      </span>
                    </td>

                    {/* GST Rate */}
                    <td className="p-4">
                      <span className={`px-2 py-0.5 font-bold rounded text-[10px] ${
                        p.gstRate >= 18 ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {p.gstRate}% GST
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-center">
                      <div className="flex gap-1.5 justify-center">
                        <button 
                          onClick={() => handleEditClick(p)}
                          className="p-1.5 hover:bg-blue-50 text-stone-400 hover:text-blue-500 rounded-lg transition-colors cursor-pointer inline-flex"
                          title="Edit product"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setDeleteConfirmId(p.id)}
                          className="p-1.5 hover:bg-red-50 text-stone-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer inline-flex"
                          title="Delete product"
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

      {/* Add New Product Modal Overlay */}
      {showAddModal && (
        <div id="add-product-modal" className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg border border-stone-200 w-full max-w-sm overflow-hidden font-sans">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-[#ebf0e3]">
              <h3 className="font-display font-extrabold text-sm text-brand-gray-dark flex items-center gap-2">
                <Plus className="w-4 h-4 text-brand-primary" />
                <span>Add Stock Catalogue Item</span>
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
                <label className="block text-xs font-semibold text-brand-gray-medium">Product / Item Brand Name *</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:ring-1 focus:ring-brand-primary"
                  placeholder="e.g. Electric Solar Panels 100W"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-brand-gray-medium flex items-center gap-1">
                  <span>HSN Classification Code *</span>
                  <ShieldQuestion className="w-3.5 h-3.5 text-stone-400" title="8-digit custom harmonized commodity code in GST" />
                </label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs font-mono"
                  placeholder="e.g. 85044090"
                  required
                  value={hsnCode}
                  onChange={(e) => setHsnCode(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-brand-gray-medium">Standard Price (₹) *</label>
                  <input 
                    type="number" 
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs font-mono"
                    placeholder="0.00"
                    min="1"
                    required
                    value={price || ''}
                    onChange={(e) => setPrice(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-brand-gray-medium">Unit Of Measure *</label>
                  <select 
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:ring-1"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                  >
                    <option value="PCS">PCS (Pieces)</option>
                    <option value="SET">SET (Sets)</option>
                    <option value="NOS">NOS (Numbers)</option>
                    <option value="KG">KG (Kilograms)</option>
                    <option value="BOX">BOX (Boxes)</option>
                    <option value="MTR">MTR (Meters)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-brand-gray-medium">GST Tax rate levy *</label>
                <select 
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:ring-1"
                  value={gstRate}
                  onChange={(e) => setGstRate(Number(e.target.value))}
                >
                  <option value={5}>5% Tax Bracket (Essential goods)</option>
                  <option value={12}>12% Tax Bracket (Standard items)</option>
                  <option value={18}>18% Tax Bracket (Suspension, spare parts)</option>
                  <option value={28}>28% Tax Bracket (Premium/luxury class)</option>
                </select>
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
                  Save Stock Item
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg border border-stone-200 w-full max-w-sm overflow-hidden font-sans">
            <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-blue-50">
              <h3 className="font-display font-extrabold text-sm text-brand-gray-dark flex items-center gap-2">
                <Pencil className="w-4 h-4 text-blue-500" />
                <span>Edit Product</span>
              </h3>
              <button onClick={() => setEditingProduct(null)} className="text-stone-400 hover:text-brand-gray-dark text-lg font-bold cursor-pointer">×</button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-brand-gray-medium">Product Name *</label>
                <input type="text" className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 outline-none" required value={editingProduct.name} onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-brand-gray-medium">HSN Code *</label>
                <input type="text" className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs font-mono outline-none focus:ring-1 focus:ring-blue-500" required value={editingProduct.hsnCode} onChange={(e) => setEditingProduct({ ...editingProduct, hsnCode: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-brand-gray-medium">Price (₹) *</label>
                  <input type="number" className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs font-mono outline-none focus:ring-1" min="1" required value={editingProduct.price || ''} onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })} />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-brand-gray-medium">Unit *</label>
                  <select className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:ring-1" value={editingProduct.unit} onChange={(e) => setEditingProduct({ ...editingProduct, unit: e.target.value })}>
                    <option value="PCS">PCS</option><option value="SET">SET</option><option value="NOS">NOS</option><option value="KG">KG</option><option value="BOX">BOX</option><option value="MTR">MTR</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-brand-gray-medium">GST Rate *</label>
                <select className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:ring-1" value={editingProduct.gstRate} onChange={(e) => setEditingProduct({ ...editingProduct, gstRate: Number(e.target.value) })}>
                  <option value={5}>5%</option><option value={12}>12%</option><option value={18}>18%</option><option value={28}>28%</option>
                </select>
              </div>
              <div className="pt-2 flex justify-end gap-3">
                <button type="button" onClick={() => setEditingProduct(null)} className="px-4 py-2 border border-stone-200 hover:bg-stone-50 rounded-xl text-xs font-bold cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow">Update Product</button>
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
            <h3 className="font-display font-extrabold text-base text-brand-gray-dark">Delete Product?</h3>
            <p className="text-xs text-stone-500">This action cannot be undone. The product will be permanently removed from your catalogue.</p>
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
