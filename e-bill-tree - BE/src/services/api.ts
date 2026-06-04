import { CompanyProfile, Customer, Product, Invoice, Challan, EWayBill } from '../types';

export interface DBPayload {
  companyProfile: CompanyProfile;
  customers: Customer[];
  products: Product[];
  invoices: Invoice[];
  challans: Challan[];
  ewayBills: EWayBill[];
}

/**
 * Enterprise API helper services for Express communication
 */
export const EnterpriseAPI = {
  /**
   * Fetches the entire synced dashboard database state.
   */
  async fetchInitialData(): Promise<DBPayload> {
    const res = await fetch('/api/db');
    if (!res.ok) {
      throw new Error('Failed to synchronize database from server');
    }
    return res.json();
  },

  /**
   * Saves or updates the primary enterprise company profile info.
   */
  async saveCompanyProfile(profile: CompanyProfile): Promise<CompanyProfile> {
    const res = await fetch('/api/company-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });
    if (!res.ok) {
      throw new Error('Failed to update company profile');
    }
    const data = await res.json();
    return data.companyProfile;
  },

  /**
   * Saves or updates a customer in the registry.
   */
  async saveCustomer(customer: Customer): Promise<Customer> {
    const res = await fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customer),
    });
    if (!res.ok) {
      throw new Error('Failed to save customer');
    }
    return res.json();
  },

  /**
   * Deletes a customer in the registry by ID.
   */
  async deleteCustomer(id: string): Promise<boolean> {
    const res = await fetch(`/api/customers/${id}`, {
      method: 'DELETE',
    });
    return res.ok;
  },

  /**
   * Saves or updates a product in the stock catalogue.
   */
  async saveProduct(product: Product): Promise<Product> {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    if (!res.ok) {
      throw new Error('Failed to save product');
    }
    return res.json();
  },

  /**
   * Deletes a product in the catalogue by ID.
   */
  async deleteProduct(id: string): Promise<boolean> {
    const res = await fetch(`/api/products/${id}`, {
      method: 'DELETE',
    });
    return res.ok;
  },

  /**
   * Saves or updates a tax invoice.
   */
  async saveInvoice(invoice: Invoice): Promise<Invoice> {
    const res = await fetch('/api/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invoice),
    });
    if (!res.ok) {
      throw new Error('Failed to save tax invoice');
    }
    return res.json();
  },

  /**
   * Deletes a tax invoice by ID.
   */
  async deleteInvoice(id: string): Promise<boolean> {
    const res = await fetch(`/api/invoices/${id}`, {
      method: 'DELETE',
    });
    return res.ok;
  },

  /**
   * Updates an invoice payment/processing status.
   */
  async updateInvoiceStatus(id: string, status: Invoice['status']): Promise<boolean> {
    const res = await fetch(`/api/invoices/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    return res.ok;
  },

  /**
   * Saves or updates a delivery challan.
   */
  async saveChallan(challan: Challan): Promise<Challan> {
    const res = await fetch('/api/challans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(challan),
    });
    if (!res.ok) {
      throw new Error('Failed to save delivery challan');
    }
    return res.json();
  },

  /**
   * Deletes a delivery challan by ID.
   */
  async deleteChallan(id: string): Promise<boolean> {
    const res = await fetch(`/api/challans/${id}`, {
      method: 'DELETE',
    });
    return res.ok;
  },

  /**
   * Saves or updates an active transporter e-way bill.
   */
  async saveEWayBill(ewayBill: EWayBill): Promise<EWayBill> {
    const res = await fetch('/api/eway-bills', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ewayBill),
    });
    if (!res.ok) {
      throw new Error('Failed to save transporter e-way bill');
    }
    return res.json();
  },

  /**
   * Deletes/cancels an active transporter e-way bill.
   */
  async deleteEWayBill(id: string): Promise<boolean> {
    const res = await fetch(`/api/eway-bills/${id}`, {
      method: 'DELETE',
    });
    return res.ok;
  },

  // ─── Authentication APIs ────────────────────────────────────────────────

  async register(data: { ownerName: string; companyName: string; email: string; password: string; phone?: string; gstNumber?: string; address?: string }): Promise<{ success: boolean; userId: string; email: string; otp: string }> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Registration failed');
    }
    return res.json();
  },

  async login(email: string, password: string): Promise<{ success: boolean; userId: string; ownerName: string; companyName: string; email: string }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Login failed');
    }
    return res.json();
  },

  async forgotPassword(email: string): Promise<{ success: boolean; email: string; otp: string }> {
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to send OTP');
    }
    return res.json();
  },

  async verifyOtp(email: string, otp: string): Promise<{ success: boolean }> {
    const res = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'OTP verification failed');
    }
    return res.json();
  },

  async resetPassword(email: string, password: string): Promise<{ success: boolean }> {
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Password reset failed');
    }
    return res.json();
  },

  // ─── User Profile APIs ──────────────────────────────────────────────────

  async getUserProfile(userId: string): Promise<{ id: string; ownerName: string; companyName: string; email: string; phone: string; gstNumber: string; address: string; avatarUrl?: string; registeredAt: string }> {
    const res = await fetch(`/api/users/${userId}`);
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to fetch user profile');
    }
    return res.json();
  },

  async updateUserProfile(userId: string, data: { ownerName?: string; companyName?: string; phone?: string; gstNumber?: string; address?: string; avatarUrl?: string }): Promise<{ success: boolean; user: { id: string; ownerName: string; companyName: string; email: string; phone: string; gstNumber: string; address: string; avatarUrl?: string } }> {
    const res = await fetch(`/api/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update user profile');
    }
    return res.json();
  },
};
