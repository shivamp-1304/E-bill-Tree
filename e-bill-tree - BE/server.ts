import express, { Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

// ─── Database Configuration ────────────────────────────────────────────────
const DB_FILE_PATH = path.join(process.cwd(), "database.json");

// ─── Logging utility ───────────────────────────────────────────────────────
const log = {
  info: (msg: string) => console.log(`[INFO] ${new Date().toISOString()} - ${msg}`),
  warn: (msg: string) => console.warn(`[WARN] ${new Date().toISOString()} - ${msg}`),
  error: (msg: string, err?: unknown) => console.error(`[ERROR] ${new Date().toISOString()} - ${msg}`, err || ""),
};

// Define initial base mock data matching src/mockData.ts
const INITIAL_DB = {
  companyProfile: {
    name: "Acme Corporation Pvt Ltd",
    gstNumber: "22AAAAA0000A1Z5",
    panNumber: "ABCDE1234F",
    address: "Suite 101, Business Park, Tech Zone",
    city: "Mumbai",
    pincode: "400001",
    state: "Maharashtra",
    email: "billing@company.com",
    phone: "+91 98765 43210",
    bankName: "HDFC Bank",
    accountNumber: "50200012345678",
    ifscCode: "HDFC0001234",
    logoUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCPW3EceoldRDNKHXhXbK0aGi6nD__kFN-wUrcGj5YS09Bt7cUvMv1Pe6zBeFURZrIU514uVzWj6MY3nWr9g4L73M8mrlAA1-sTN2AiyfkQ_esWu3sf-SAvgGiwiOJKrEYj7jrKuUdt8j6jXXsbyj0g7tEXc877fs3yVTqXo15vcaUqlziZ6L9vciQmi2vU0fu7Iw4p85xc4nj14Un1OoDNDB16outMrTPalbUXz0h0xoh43iFbJZktJNJia0tyjVq80mecpICV-K_f"
  },
  customers: [
    {
      id: "cust-1",
      name: "Tata Motors Logistics",
      gstNumber: "27AAACT1234A1Z9",
      email: "procurement@tatamotors.com",
      phone: "+91 91234 56789",
      address: "Pimpri Industrial Area, Sector 5",
      city: "Pune",
      state: "Maharashtra",
      pincode: "411018"
    },
    {
      id: "cust-2",
      name: "Reliance Retail Ltd",
      gstNumber: "22AAACR5678F1ZC",
      email: "finance@relianceretail.com",
      phone: "+91 98111 22233",
      address: "Reliance Corporate Park, Ghansoli",
      city: "Navi Mumbai",
      state: "Maharashtra",
      pincode: "400701"
    },
    {
      id: "cust-3",
      name: "Infosys Technologies Ltd",
      gstNumber: "29AAACI9911D1ZX",
      email: "vendor-bills@infosys.com",
      phone: "+91 80285 20261",
      address: "Electronic City, Hosur Road",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560100"
    },
    {
      id: "cust-4",
      name: "Delhivery Express Solutions",
      gstNumber: "07AAACD9090H1ZN",
      email: "accounts@delhivery.com",
      phone: "+91 12467 19500",
      address: "Sector 44, Plot 5",
      city: "Gurugram",
      state: "Delhi",
      pincode: "122003"
    }
  ],
  products: [
    {
      id: "prod-1",
      name: "Heavy Duty Leaf Springs (Set of 4)",
      hsnCode: "73201011",
      price: 18500,
      unit: "SET",
      gstRate: 18
    },
    {
      id: "prod-2",
      name: "Automotive Suspension Shock Absorber",
      hsnCode: "87088000",
      price: 4200,
      unit: "PCS",
      gstRate: 18
    },
    {
      id: "prod-3",
      name: "Eco-Grade Biodegradable Hydraulic Fluid 5L",
      hsnCode: "38112100",
      price: 2450,
      unit: "NOS",
      gstRate: 12
    },
    {
      id: "prod-4",
      name: "Steel Fastener Bolts (Box of 500)",
      hsnCode: "73181500",
      price: 1100,
      unit: "BOX",
      gstRate: 18
    },
    {
      id: "prod-5",
      name: "Heavy Transport Wheel Gaskets (Silicon)",
      hsnCode: "40169300",
      price: 320,
      unit: "PCS",
      gstRate: 5
    },
    {
      id: "prod-6",
      name: "Solar Array Charger Controller 40A",
      hsnCode: "85044090",
      price: 8900,
      unit: "NOS",
      gstRate: 5
    }
  ],
  invoices: [
    {
      id: "inv-1001",
      invoiceNumber: "EBT/24-25/1001",
      date: "2026-05-15",
      dueDate: "2026-06-15",
      customerId: "cust-1",
      customerName: "Tata Motors Logistics",
      customerGst: "27AAACT1234A1Z9",
      customerState: "Maharashtra",
      items: [
        {
          productId: "prod-1",
          productName: "Heavy Duty Leaf Springs (Set of 4)",
          hsnCode: "73201011",
          price: 18500,
          qty: 10,
          unit: "SET",
          gstRate: 18,
          taxableValue: 185000,
          cgstAmount: 16650,
          sgstAmount: 16650,
          igstAmount: 0,
          total: 218300
        },
        {
          productId: "prod-2",
          productName: "Automotive Suspension Shock Absorber",
          hsnCode: "87088000",
          price: 4200,
          qty: 20,
          unit: "PCS",
          gstRate: 18,
          taxableValue: 84000,
          cgstAmount: 7560,
          sgstAmount: 7560,
          igstAmount: 0,
          total: 99120
        }
      ],
      totalTaxable: 269000,
      totalCgst: 24210,
      totalSgst: 24210,
      totalIgst: 0,
      totalAmount: 317420,
      status: "Paid"
    },
    {
      id: "inv-1002",
      invoiceNumber: "EBT/24-25/1002",
      date: "2026-05-28",
      dueDate: "2026-06-28",
      customerId: "cust-3",
      customerName: "Infosys Technologies Ltd",
      customerGst: "29AAACI9911D1ZX",
      customerState: "Karnataka",
      items: [
        {
          productId: "prod-6",
          productName: "Solar Array Charger Controller 40A",
          hsnCode: "85044090",
          price: 8900,
          qty: 15,
          unit: "NOS",
          gstRate: 5,
          taxableValue: 133500,
          cgstAmount: 0,
          sgstAmount: 0,
          igstAmount: 6675,
          total: 140175
        }
      ],
      totalTaxable: 133500,
      totalCgst: 0,
      totalSgst: 0,
      totalIgst: 6675,
      totalAmount: 140175,
      status: "Pending"
    },
    {
      id: "inv-1003",
      invoiceNumber: "EBT/24-25/1003",
      date: "2026-06-02",
      dueDate: "2026-07-02",
      customerId: "cust-2",
      customerName: "Reliance Retail Ltd",
      customerGst: "22AAACR5678F1ZC",
      customerState: "Maharashtra",
      items: [
        {
          productId: "prod-3",
          productName: "Eco-Grade Biodegradable Hydraulic Fluid 5L",
          hsnCode: "38112100",
          price: 2450,
          qty: 50,
          unit: "NOS",
          gstRate: 12,
          taxableValue: 122500,
          cgstAmount: 7350,
          sgstAmount: 7350,
          igstAmount: 0,
          total: 137200
        },
        {
          productId: "prod-5",
          productName: "Heavy Transport Wheel Gaskets (Silicon)",
          hsnCode: "40169300",
          price: 320,
          qty: 100,
          unit: "PCS",
          gstRate: 5,
          taxableValue: 32000,
          cgstAmount: 800,
          sgstAmount: 800,
          igstAmount: 0,
          total: 33600
        }
      ],
      totalTaxable: 154500,
      totalCgst: 8150,
      totalSgst: 8150,
      totalIgst: 0,
      totalAmount: 170800,
      status: "Draft"
    }
  ],
  challans: [
    {
      id: "ch-501",
      challanNumber: "EBT-CH-501",
      date: "2026-05-10",
      customerId: "cust-1",
      customerName: "Tata Motors Logistics",
      items: [
        { productName: "Heavy Duty Leaf Springs (Set of 4)", qty: 8, unit: "SET" },
        { productName: "Automotive Suspension Shock Absorber", qty: 15, unit: "PCS" }
      ],
      purpose: "Sent for Quality Approval / Trail Testing",
      status: "Returned"
    },
    {
      id: "ch-502",
      challanNumber: "EBT-CH-502",
      date: "2026-05-24",
      customerId: "cust-3",
      customerName: "Infosys Technologies Ltd",
      items: [
        { productName: "Solar Array Charger Controller 40A", qty: 25, unit: "NOS" }
      ],
      purpose: "Delivery on Approval Basis",
      status: "Invoiced"
    },
    {
      id: "ch-503",
      challanNumber: "EBT-CH-503",
      date: "2026-06-03",
      customerId: "cust-4",
      customerName: "Delhivery Express Solutions",
      items: [
        { productName: "Heavy Transport Wheel Gaskets (Silicon)", qty: 300, unit: "PCS" }
      ],
      purpose: "Stock Transfer to Logistics Hub",
      status: "Pending"
    }
  ],
  ewayBills: [
    {
      id: "ewb-201",
      ewayBillNumber: "221948271039",
      invoiceId: "inv-1001",
      invoiceNumber: "EBT/24-25/1001",
      vehicleNumber: "MH-12-PQ-9876",
      transporterName: "VRL Logistics Ltd",
      distanceKm: 145,
      status: "Active",
      validUntil: "2026-06-10"
    },
    {
      id: "ewb-202",
      ewayBillNumber: "298711029384",
      invoiceId: "inv-1002",
      invoiceNumber: "EBT/24-25/1002",
      vehicleNumber: "KA-03-MY-4122",
      transporterName: "Safexpress Transport",
      distanceKm: 980,
      status: "Expired",
      validUntil: "2026-05-31"
    }
  ],
  users: [
    {
      id: "user-1",
      ownerName: "Admin User",
      companyName: "Acme Corporation Pvt Ltd",
      email: "admin@ebilltree.com",
      password: "admin123",
      phone: "+91 98765 43210",
      gstNumber: "22AAAAA0000A1Z5",
      address: "Suite 101, Business Park, Tech Zone",
      registeredAt: "2026-01-01T00:00:00.000Z"
    }
  ]
};

// ─── Database helpers ──────────────────────────────────────────────────────
function readDatabase() {
  try {
    if (!fs.existsSync(DB_FILE_PATH)) {
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(INITIAL_DB, null, 2), "utf-8");
      log.info("Database initialized with default data");
      return INITIAL_DB;
    }
    const raw = fs.readFileSync(DB_FILE_PATH, "utf-8");
    return JSON.parse(raw);
  } catch (error) {
    log.error("Failed to read database, returning defaults", error);
    return INITIAL_DB;
  }
}

function writeDatabase(data: typeof INITIAL_DB) {
  try {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (error) {
    log.error("Failed to write database", error);
    return false;
  }
}

// ─── Validation helpers ────────────────────────────────────────────────────
function validateRequired(body: Record<string, unknown>, fields: string[]): string | null {
  for (const field of fields) {
    if (!body[field] || (typeof body[field] === "string" && (body[field] as string).trim() === "")) {
      return `Missing required field: ${field}`;
    }
  }
  return null;
}

// ─── Server bootstrap ──────────────────────────────────────────────────────
async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // ─── Global middleware ───────────────────────────────────────────────────
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true }));

  // CORS for FE dev server
  app.use((_req: Request, res: Response, next: NextFunction) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (_req.method === "OPTIONS") return res.sendStatus(204);
    next();
  });

  // Request logging
  app.use((req: Request, _res: Response, next: NextFunction) => {
    if (req.path.startsWith("/api")) {
      log.info(`${req.method} ${req.path}`);
    }
    next();
  });

  // Ensure database is initialized
  readDatabase();

  // API 1: Return entire compiled database in one call
  app.get("/api/db", (req, res) => {
    try {
      const db = readDatabase();
      res.json(db);
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Failed to load database state." });
    }
  });

  // API 2: Configure enterprise Company Profile details
  app.post("/api/company-profile", (req, res) => {
    try {
      const err = validateRequired(req.body, ["name", "email"]);
      if (err) return res.status(400).json({ error: err });

      const db = readDatabase();
      db.companyProfile = { ...db.companyProfile, ...req.body };
      writeDatabase(db);
      log.info(`Company profile updated: ${db.companyProfile.name}`);
      res.json({ success: true, companyProfile: db.companyProfile });
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Failed to update company profile." });
    }
  });

  // API: Authentication endpoints
  // Register new user
  app.post("/api/auth/register", (req, res) => {
    try {
      const err = validateRequired(req.body, ["ownerName", "companyName", "email", "password"]);
      if (err) return res.status(400).json({ error: err });

      const db = readDatabase();
      if (!db.users) db.users = [];

      // Check if user already exists
      const existing = db.users.find((u: any) => u.email === req.body.email);
      if (existing) {
        return res.status(409).json({ error: "User with this email already exists" });
      }

      const newUser = {
        id: "user-" + Date.now(),
        ownerName: req.body.ownerName,
        companyName: req.body.companyName,
        email: req.body.email,
        password: req.body.password,
        phone: req.body.phone || "",
        gstNumber: req.body.gstNumber || "",
        address: req.body.address || "",
        registeredAt: new Date().toISOString(),
      };
      db.users.push(newUser);
      writeDatabase(db);
      log.info(`User registered: ${newUser.ownerName} (${newUser.email})`);

      // Generate OTP for verification
      const otp = String(Math.floor(100000 + Math.random() * 900000));
      if (!db._otpStore) db._otpStore = {};
      db._otpStore[newUser.email] = { otp, expiresAt: Date.now() + 600000 };
      writeDatabase(db);

      res.status(201).json({
        success: true,
        userId: newUser.id,
        email: newUser.email,
        otp,
        message: "Registration successful. OTP sent to email.",
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Registration failed." });
    }
  });

  // Login
  app.post("/api/auth/login", (req, res) => {
    try {
      const err = validateRequired(req.body, ["email", "password"]);
      if (err) return res.status(400).json({ error: err });

      const db = readDatabase();
      if (!db.users) db.users = [];

      const user = db.users.find((u: any) => u.email === req.body.email && u.password === req.body.password);
      if (!user) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      log.info(`User logged in: ${user.ownerName} (${user.email})`);
      res.json({
        success: true,
        userId: user.id,
        ownerName: user.ownerName,
        companyName: user.companyName,
        email: user.email,
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Login failed." });
    }
  });

  // Forgot password - send OTP
  app.post("/api/auth/forgot-password", (req, res) => {
    try {
      const err = validateRequired(req.body, ["email"]);
      if (err) return res.status(400).json({ error: err });

      const db = readDatabase();
      if (!db.users) db.users = [];

      const user = db.users.find((u: any) => u.email === req.body.email);
      if (!user) {
        return res.status(404).json({ error: "No account found with this email" });
      }

      const otp = String(Math.floor(100000 + Math.random() * 900000));
      if (!db._otpStore) db._otpStore = {};
      db._otpStore[req.body.email] = { otp, expiresAt: Date.now() + 600000 };
      writeDatabase(db);

      log.info(`OTP generated for: ${req.body.email}`);
      res.json({ success: true, email: req.body.email, otp, message: "OTP sent successfully" });
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Failed to send OTP." });
    }
  });

  // Verify OTP
  app.post("/api/auth/verify-otp", (req, res) => {
    try {
      const err = validateRequired(req.body, ["email", "otp"]);
      if (err) return res.status(400).json({ error: err });

      const db = readDatabase();
      const otpData = db._otpStore?.[req.body.email];
      if (!otpData) {
        return res.status(400).json({ error: "No OTP found for this email" });
      }
      if (otpData.expiresAt < Date.now()) {
        delete db._otpStore[req.body.email];
        writeDatabase(db);
        return res.status(400).json({ error: "OTP has expired" });
      }
      if (otpData.otp !== req.body.otp) {
        return res.status(400).json({ error: "Invalid OTP" });
      }

      delete db._otpStore[req.body.email];
      writeDatabase(db);
      log.info(`OTP verified for: ${req.body.email}`);
      res.json({ success: true, message: "OTP verified successfully" });
    } catch (e: any) {
      res.status(500).json({ error: e.message || "OTP verification failed." });
    }
  });

  // Reset password
  app.post("/api/auth/reset-password", (req, res) => {
    try {
      const err = validateRequired(req.body, ["email", "password"]);
      if (err) return res.status(400).json({ error: err });

      const db = readDatabase();
      if (!db.users) db.users = [];

      const userIdx = db.users.findIndex((u: any) => u.email === req.body.email);
      if (userIdx === -1) {
        return res.status(404).json({ error: "User not found" });
      }

      db.users[userIdx].password = req.body.password;
      writeDatabase(db);
      log.info(`Password reset for: ${req.body.email}`);
      res.json({ success: true, message: "Password reset successfully" });
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Password reset failed." });
    }
  });

  // API 3: Customers management
  app.post("/api/customers", (req, res) => {
    try {
      const err = validateRequired(req.body, ["name", "email", "phone"]);
      if (err) return res.status(400).json({ error: err });

      const db = readDatabase();
      const newCustomer = { ...req.body };
      if (!newCustomer.id) {
        newCustomer.id = "cust-" + Date.now();
      }
      db.customers = [...db.customers.filter(c => c.id !== newCustomer.id), newCustomer];
      writeDatabase(db);
      log.info(`Customer saved: ${newCustomer.name} (${newCustomer.id})`);
      res.status(201).json(newCustomer);
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Failed to add customer." });
    }
  });

  app.delete("/api/customers/:id", (req, res) => {
    try {
      const db = readDatabase();
      const { id } = req.params;
      db.customers = db.customers.filter(c => c.id !== id);
      writeDatabase(db);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Failed to delete customer." });
    }
  });

  // API 4: Stock catalogue/products management
  app.post("/api/products", (req, res) => {
    try {
      const err = validateRequired(req.body, ["name", "hsnCode", "price"]);
      if (err) return res.status(400).json({ error: err });

      const db = readDatabase();
      const newProduct = { ...req.body };
      if (!newProduct.id) {
        newProduct.id = "prod-" + Date.now();
      }
      db.products = [...db.products.filter(p => p.id !== newProduct.id), newProduct];
      writeDatabase(db);
      log.info(`Product saved: ${newProduct.name} (${newProduct.id})`);
      res.status(201).json(newProduct);
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Failed to add product." });
    }
  });

  app.delete("/api/products/:id", (req, res) => {
    try {
      const db = readDatabase();
      const { id } = req.params;
      db.products = db.products.filter(p => p.id !== id);
      writeDatabase(db);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Failed to delete product." });
    }
  });

  // API 5: Tax Invoices endpoints
  app.post("/api/invoices", (req, res) => {
    try {
      const err = validateRequired(req.body, ["customerId", "customerName", "items"]);
      if (err) return res.status(400).json({ error: err });
      if (!Array.isArray(req.body.items) || req.body.items.length === 0) {
        return res.status(400).json({ error: "Invoice must contain at least one item" });
      }

      const db = readDatabase();
      const newInvoice = { ...req.body };
      if (!newInvoice.id) {
        newInvoice.id = "inv-" + Date.now();
      }
      db.invoices = [...db.invoices.filter(i => i.id !== newInvoice.id), newInvoice];
      writeDatabase(db);
      log.info(`Invoice saved: ${newInvoice.invoiceNumber} (${newInvoice.id})`);
      res.status(201).json(newInvoice);
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Failed to create invoice." });
    }
  });

  app.delete("/api/invoices/:id", (req, res) => {
    try {
      const db = readDatabase();
      const { id } = req.params;
      db.invoices = db.invoices.filter(i => i.id !== id);
      // Clean up orphaned waybills linked to deleted invoice
      db.ewayBills = db.ewayBills.filter(ew => ew.invoiceId !== id);
      writeDatabase(db);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Failed to delete invoice." });
    }
  });

  app.put("/api/invoices/:id/status", (req, res) => {
    try {
      const db = readDatabase();
      const { id } = req.params;
      const { status } = req.body;
      db.invoices = db.invoices.map(inv => inv.id === id ? { ...inv, status } : inv);
      writeDatabase(db);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Failed to update status." });
    }
  });

  // API 6: Delivery Challans 
  app.post("/api/challans", (req, res) => {
    try {
      const err = validateRequired(req.body, ["customerId", "customerName", "items"]);
      if (err) return res.status(400).json({ error: err });
      if (!Array.isArray(req.body.items) || req.body.items.length === 0) {
        return res.status(400).json({ error: "Challan must contain at least one item" });
      }

      const db = readDatabase();
      const newChallan = { ...req.body };
      if (!newChallan.id) {
        newChallan.id = "ch-" + Date.now();
      }
      if (!newChallan.challanNumber) {
        newChallan.challanNumber = "EBT-CH-" + Date.now().toString().slice(-6);
      }
      db.challans = [...db.challans.filter(ch => ch.id !== newChallan.id), newChallan];
      writeDatabase(db);
      log.info(`Challan saved: ${newChallan.challanNumber} (${newChallan.id})`);
      res.status(201).json(newChallan);
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Failed to create challan." });
    }
  });

  app.delete("/api/challans/:id", (req, res) => {
    try {
      const db = readDatabase();
      const { id } = req.params;
      db.challans = db.challans.filter(ch => ch.id !== id);
      writeDatabase(db);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Failed to delete challan." });
    }
  });

  // API 7: Transporter eWayBills
  app.post("/api/eway-bills", (req, res) => {
    try {
      const err = validateRequired(req.body, ["invoiceId", "invoiceNumber", "vehicleNumber", "transporterName"]);
      if (err) return res.status(400).json({ error: err });

      const db = readDatabase();
      const newEWayBill = { ...req.body };
      if (!newEWayBill.id) {
        newEWayBill.id = "ewb-" + Date.now();
      }
      if (!newEWayBill.ewayBillNumber) {
        newEWayBill.ewayBillNumber = String(Math.floor(Math.random() * 900000000000) + 100000000000);
      }
      if (!newEWayBill.validUntil) {
        const validDate = new Date();
        validDate.setDate(validDate.getDate() + 7);
        newEWayBill.validUntil = validDate.toISOString().split("T")[0];
      }
      if (!newEWayBill.status) {
        newEWayBill.status = "Active";
      }
      db.ewayBills = [...db.ewayBills.filter(ew => ew.id !== newEWayBill.id), newEWayBill];
      writeDatabase(db);
      log.info(`E-Way Bill saved: ${newEWayBill.ewayBillNumber} (${newEWayBill.id})`);
      res.status(201).json(newEWayBill);
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Failed to save e-way bill." });
    }
  });

  app.delete("/api/eway-bills/:id", (req, res) => {
    try {
      const db = readDatabase();
      const { id } = req.params;
      db.ewayBills = db.ewayBills.filter(ew => ew.id !== id);
      writeDatabase(db);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Failed to delete ewaybill." });
    }
  });

  // API: Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", uptime: process.uptime(), timestamp: new Date().toISOString() });
  });

  // Global error handler
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    log.error("Unhandled error", err);
    res.status(500).json({ error: "Internal server error" });
  });

  // Vite middle-layer orchestration or static build index asset serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`E-bill Tree backend server started securely on port ${PORT}`);
  });
}

startServer();
