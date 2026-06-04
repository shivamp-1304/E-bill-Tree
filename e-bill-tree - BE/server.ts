import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

// Define the database shape matching our schema
const DB_FILE_PATH = path.join(process.cwd(), "database.json");

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
  ]
};

// Helper to read database
function readDatabase() {
  try {
    if (!fs.existsSync(DB_FILE_PATH)) {
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(INITIAL_DB, null, 2), "utf-8");
      return INITIAL_DB;
    }
    const raw = fs.readFileSync(DB_FILE_PATH, "utf-8");
    return JSON.parse(raw);
  } catch (error) {
    console.error("Error reading database file, returning initial values", error);
    return INITIAL_DB;
  }
}

// Helper to write database
function writeDatabase(data: typeof INITIAL_DB) {
  try {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing to database file", error);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parsers
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

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
      const db = readDatabase();
      db.companyProfile = req.body;
      writeDatabase(db);
      res.json({ success: true, companyProfile: db.companyProfile });
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Failed to update company profile." });
    }
  });

  // API 3: Customers management
  app.post("/api/customers", (req, res) => {
    try {
      const db = readDatabase();
      const newCustomer = req.body;
      if (!newCustomer.id) {
        newCustomer.id = "cust-" + Date.now();
      }
      db.customers = [...db.customers.filter(c => c.id !== newCustomer.id), newCustomer];
      writeDatabase(db);
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
      const db = readDatabase();
      const newProduct = req.body;
      if (!newProduct.id) {
        newProduct.id = "prod-" + Date.now();
      }
      db.products = [...db.products.filter(p => p.id !== newProduct.id), newProduct];
      writeDatabase(db);
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
      const db = readDatabase();
      const newInvoice = req.body;
      if (!newInvoice.id) {
        newInvoice.id = "inv-" + Date.now();
      }
      db.invoices = [...db.invoices.filter(i => i.id !== newInvoice.id), newInvoice];
      writeDatabase(db);
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
      const db = readDatabase();
      const newChallan = req.body;
      if (!newChallan.id) {
        newChallan.id = "ch-" + Date.now();
      }
      db.challans = [...db.challans.filter(ch => ch.id !== newChallan.id), newChallan];
      writeDatabase(db);
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
      const db = readDatabase();
      const newEWayBill = req.body;
      if (!newEWayBill.id) {
        newEWayBill.id = "ewb-" + Date.now();
      }
      db.ewayBills = [...db.ewayBills.filter(ew => ew.id !== newEWayBill.id), newEWayBill];
      writeDatabase(db);
      res.status(201).json(newEWayBill);
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Failed parallel ewaybill write." });
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
