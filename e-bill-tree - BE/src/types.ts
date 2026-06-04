/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CompanyProfile {
  name: string;
  gstNumber: string;
  panNumber: string;
  address: string;
  city: string;
  pincode: string;
  state: string;
  email: string;
  phone: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  logoUrl?: string;
}

export interface Customer {
  id: string;
  name: string;
  gstNumber?: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export interface Product {
  id: string;
  name: string;
  hsnCode: string;
  price: number;
  unit: string; // e.g., 'PCS', 'KG', 'MTR', 'NOS'
  gstRate: number; // e.g., 5, 12, 18, 28 (%)
}

export interface InvoiceItem {
  productId: string;
  productName: string;
  hsnCode: string;
  price: number;
  qty: number;
  unit: string;
  gstRate: number;
  taxableValue: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  customerId: string;
  customerName: string;
  customerGst?: string;
  customerState: string;
  items: InvoiceItem[];
  totalTaxable: number;
  totalCgst: number;
  totalSgst: number;
  totalIgst: number;
  totalAmount: number;
  status: 'Draft' | 'Paid' | 'Pending' | 'Overdue';
}

export interface Challan {
  id: string;
  challanNumber: string;
  date: string;
  customerId: string;
  customerName: string;
  items: {
    productName: string;
    qty: number;
    unit: string;
  }[];
  purpose: string;
  status: 'Pending' | 'Returned' | 'Invoiced';
}

export interface EWayBill {
  id: string;
  ewayBillNumber: string;
  invoiceId: string;
  invoiceNumber: string;
  vehicleNumber: string;
  transporterName: string;
  distanceKm: number;
  status: 'Active' | 'Expired' | 'Cancelled';
  validUntil: string;
}

export type ScreenState = 
  | 'cover'
  | 'login'
  | 'register'
  | 'forgot-password'
  | 'verify-otp'
  | 'reset-password'
  | 'dashboard';

export type DashboardTab =
  | 'overview'
  | 'customers'
  | 'products'
  | 'invoices'
  | 'challans'
  | 'eway-bill'
  | 'reports'
  | 'settings'
  | 'profile';
