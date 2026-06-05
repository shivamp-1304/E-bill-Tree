/**
 * E-bill Tree — Production Express Server with PostgreSQL
 * ──────────────────────────────────────────────────────────────────────────────
 * All data is stored in PostgreSQL. JSON file (database.json) is no longer used.
 */
import express, { Request, Response, NextFunction } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

import { pool, initializeDatabase } from "./src/db/pool";
import {
  CompanyProfileRepo, UserRepo, OtpRepo,
  CustomerRepo, ProductRepo, InvoiceRepo, ChallanRepo, EWayBillRepo
} from "./src/db/repositories";

dotenv.config({ path: ".env" });
dotenv.config({ path: "../.env" });

// ─── Logging utility ────────────────────────────────────────────────────────
const log = {
  info: (msg: string) => console.log(`[INFO] ${new Date().toISOString()} - ${msg}`),
  warn: (msg: string) => console.warn(`[WARN] ${new Date().toISOString()} - ${msg}`),
  error: (msg: string, err?: unknown) => console.error(`[ERROR] ${new Date().toISOString()} - ${msg}`, err || ""),
};

// ─── Validation helper ──────────────────────────────────────────────────────
function validateRequired(body: Record<string, unknown>, fields: string[]): string | null {
  for (const field of fields) {
    if (!body[field] || (typeof body[field] === "string" && (body[field] as string).trim() === "")) {
      return `Missing required field: ${field}`;
    }
  }
  return null;
}

// ─── Server bootstrap ───────────────────────────────────────────────────────
async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // ─── Global middleware ────────────────────────────────────────────────────
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

  // ═══════════════════════════════════════════════════════════════════════════
  // API: Return entire database in one call (for frontend initial load)
  // ═══════════════════════════════════════════════════════════════════════════
  app.get("/api/db", async (_req, res) => {
    try {
      const [companyProfile, customers, products, invoices, challans, ewayBills] = await Promise.all([
        CompanyProfileRepo.get(),
        CustomerRepo.getAll(),
        ProductRepo.getAll(),
        InvoiceRepo.getAll(),
        ChallanRepo.getAll(),
        EWayBillRepo.getAll(),
      ]);

      res.json({
        companyProfile: companyProfile || {
          name: "", gstNumber: "", panNumber: "", address: "", city: "", pincode: "",
          state: "", email: "", phone: "", bankName: "", accountNumber: "", ifscCode: "", logoUrl: ""
        },
        customers,
        products,
        invoices,
        challans,
        ewayBills,
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Failed to load database state." });
    }
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // API: Company Profile
  // ═══════════════════════════════════════════════════════════════════════════
  app.post("/api/company-profile", async (req, res) => {
    try {
      const err = validateRequired(req.body, ["name", "email"]);
      if (err) return res.status(400).json({ error: err });

      const profile = await CompanyProfileRepo.upsert(req.body);
      log.info(`Company profile updated: ${req.body.name}`);
      res.json({ success: true, companyProfile: profile });
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Failed to update company profile." });
    }
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // API: Authentication endpoints
  // ═══════════════════════════════════════════════════════════════════════════

  // Register new user
  app.post("/api/auth/register", async (req, res) => {
    try {
      const err = validateRequired(req.body, ["ownerName", "companyName", "email", "password"]);
      if (err) return res.status(400).json({ error: err });

      const existing = await UserRepo.findByEmail(req.body.email);
      if (existing) {
        return res.status(409).json({ error: "User with this email already exists" });
      }

      const newUser = await UserRepo.create({
        id: "user-" + Date.now(),
        ownerName: req.body.ownerName,
        companyName: req.body.companyName,
        email: req.body.email,
        password: req.body.password,
        phone: req.body.phone || "",
        gstNumber: req.body.gstNumber || "",
        address: req.body.address || "",
        registeredAt: new Date().toISOString(),
      });

      // Generate OTP for verification
      const otp = String(Math.floor(100000 + Math.random() * 900000));
      await OtpRepo.create(req.body.email, otp, Date.now() + 600000);

      log.info(`User registered: ${req.body.ownerName} (${req.body.email})`);
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
  app.post("/api/auth/login", async (req, res) => {
    try {
      const err = validateRequired(req.body, ["email", "password"]);
      if (err) return res.status(400).json({ error: err });

      const user = await UserRepo.findByEmail(req.body.email) as any;
      if (!user || user.password !== req.body.password) {
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
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const err = validateRequired(req.body, ["email"]);
      if (err) return res.status(400).json({ error: err });

      const user = await UserRepo.findByEmail(req.body.email);
      if (!user) {
        return res.status(404).json({ error: "No account found with this email" });
      }

      const otp = String(Math.floor(100000 + Math.random() * 900000));
      await OtpRepo.create(req.body.email, otp, Date.now() + 600000);

      log.info(`OTP generated for: ${req.body.email}`);
      res.json({ success: true, email: req.body.email, otp, message: "OTP sent successfully" });
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Failed to send OTP." });
    }
  });

  // Verify OTP
  app.post("/api/auth/verify-otp", async (req, res) => {
    try {
      const err = validateRequired(req.body, ["email", "otp"]);
      if (err) return res.status(400).json({ error: err });

      const result = await OtpRepo.verify(req.body.email, req.body.otp);
      if (!result.valid) {
        return res.status(400).json({ error: result.reason });
      }

      log.info(`OTP verified for: ${req.body.email}`);
      res.json({ success: true, message: "OTP verified successfully" });
    } catch (e: any) {
      res.status(500).json({ error: e.message || "OTP verification failed." });
    }
  });

  // Reset password
  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const err = validateRequired(req.body, ["email", "password"]);
      if (err) return res.status(400).json({ error: err });

      const user = await UserRepo.findByEmail(req.body.email);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      await UserRepo.updatePassword(req.body.email, req.body.password);
      log.info(`Password reset for: ${req.body.email}`);
      res.json({ success: true, message: "Password reset successfully" });
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Password reset failed." });
    }
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // API: User Profile
  // ═══════════════════════════════════════════════════════════════════════════
  app.put("/api/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updated = await UserRepo.update(id, req.body);
      if (!updated) return res.status(404).json({ error: "User not found" });

      const { password: _, ...safeUser } = updated as any;
      log.info(`User profile updated: ${(updated as any).ownerName} (${id})`);
      res.json({ success: true, user: safeUser });
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Failed to update user profile." });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await UserRepo.findById(req.params.id) as any;
      if (!user) return res.status(404).json({ error: "User not found" });

      const { password: _, ...safeUser } = user;
      res.json(safeUser);
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Failed to fetch user profile." });
    }
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // API: Customers CRUD
  // ═══════════════════════════════════════════════════════════════════════════
  app.post("/api/customers", async (req, res) => {
    try {
      const err = validateRequired(req.body, ["name", "email", "phone"]);
      if (err) return res.status(400).json({ error: err });

      const customer = await CustomerRepo.upsert(req.body);
      log.info(`Customer saved: ${req.body.name} (${customer.id})`);
      res.status(201).json(customer);
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Failed to add customer." });
    }
  });

  app.put("/api/customers/:id", async (req, res) => {
    try {
      const customer = await CustomerRepo.update(req.params.id, req.body);
      if (!customer) return res.status(404).json({ error: "Customer not found" });

      log.info(`Customer updated: ${(customer as any).name} (${req.params.id})`);
      res.json(customer);
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Failed to update customer." });
    }
  });

  app.delete("/api/customers/:id", async (req, res) => {
    try {
      await CustomerRepo.delete(req.params.id);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Failed to delete customer." });
    }
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // API: Products CRUD
  // ═══════════════════════════════════════════════════════════════════════════
  app.post("/api/products", async (req, res) => {
    try {
      const err = validateRequired(req.body, ["name", "hsnCode", "price"]);
      if (err) return res.status(400).json({ error: err });

      const product = await ProductRepo.upsert(req.body);
      log.info(`Product saved: ${req.body.name} (${product.id})`);
      res.status(201).json(product);
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Failed to add product." });
    }
  });

  app.put("/api/products/:id", async (req, res) => {
    try {
      const product = await ProductRepo.update(req.params.id, req.body);
      if (!product) return res.status(404).json({ error: "Product not found" });

      log.info(`Product updated: ${(product as any).name} (${req.params.id})`);
      res.json(product);
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Failed to update product." });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      await ProductRepo.delete(req.params.id);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Failed to delete product." });
    }
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // API: Invoices CRUD
  // ═══════════════════════════════════════════════════════════════════════════
  app.post("/api/invoices", async (req, res) => {
    try {
      const err = validateRequired(req.body, ["customerId", "customerName", "items"]);
      if (err) return res.status(400).json({ error: err });
      if (!Array.isArray(req.body.items) || req.body.items.length === 0) {
        return res.status(400).json({ error: "Invoice must contain at least one item" });
      }

      const invoice = await InvoiceRepo.upsert(req.body);
      log.info(`Invoice saved: ${req.body.invoiceNumber} (${invoice.id})`);
      res.status(201).json(invoice);
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Failed to create invoice." });
    }
  });

  app.put("/api/invoices/:id", async (req, res) => {
    try {
      const invoice = await InvoiceRepo.update(req.params.id, req.body);
      if (!invoice) return res.status(404).json({ error: "Invoice not found" });

      log.info(`Invoice updated: ${(invoice as any).invoiceNumber} (${req.params.id})`);
      res.json(invoice);
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Failed to update invoice." });
    }
  });

  app.put("/api/invoices/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      await InvoiceRepo.updateStatus(req.params.id, status);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Failed to update status." });
    }
  });

  app.delete("/api/invoices/:id", async (req, res) => {
    try {
      await InvoiceRepo.delete(req.params.id);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Failed to delete invoice." });
    }
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // API: Challans CRUD
  // ═══════════════════════════════════════════════════════════════════════════
  app.post("/api/challans", async (req, res) => {
    try {
      const err = validateRequired(req.body, ["customerId", "customerName", "items"]);
      if (err) return res.status(400).json({ error: err });
      if (!Array.isArray(req.body.items) || req.body.items.length === 0) {
        return res.status(400).json({ error: "Challan must contain at least one item" });
      }

      const challan = await ChallanRepo.upsert(req.body);
      log.info(`Challan saved: ${(challan as any).challanNumber} (${challan.id})`);
      res.status(201).json(challan);
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Failed to create challan." });
    }
  });

  app.put("/api/challans/:id", async (req, res) => {
    try {
      const challan = await ChallanRepo.update(req.params.id, req.body);
      if (!challan) return res.status(404).json({ error: "Challan not found" });

      log.info(`Challan updated: ${(challan as any).challanNumber} (${req.params.id})`);
      res.json(challan);
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Failed to update challan." });
    }
  });

  app.delete("/api/challans/:id", async (req, res) => {
    try {
      await ChallanRepo.delete(req.params.id);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Failed to delete challan." });
    }
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // API: E-Way Bills CRUD
  // ═══════════════════════════════════════════════════════════════════════════
  app.post("/api/eway-bills", async (req, res) => {
    try {
      const err = validateRequired(req.body, ["invoiceId", "invoiceNumber", "vehicleNumber", "transporterName"]);
      if (err) return res.status(400).json({ error: err });

      const ewayBill = await EWayBillRepo.upsert(req.body);
      log.info(`E-Way Bill saved: ${(ewayBill as any).ewayBillNumber} (${ewayBill.id})`);
      res.status(201).json(ewayBill);
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Failed to save e-way bill." });
    }
  });

  app.put("/api/eway-bills/:id", async (req, res) => {
    try {
      const ewayBill = await EWayBillRepo.update(req.params.id, req.body);
      if (!ewayBill) return res.status(404).json({ error: "E-Way Bill not found" });

      log.info(`E-Way Bill updated: ${(ewayBill as any).ewayBillNumber} (${req.params.id})`);
      res.json(ewayBill);
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Failed to update e-way bill." });
    }
  });

  app.delete("/api/eway-bills/:id", async (req, res) => {
    try {
      await EWayBillRepo.delete(req.params.id);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Failed to delete ewaybill." });
    }
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // API: Health check
  // ═══════════════════════════════════════════════════════════════════════════
  app.get("/api/health", async (_req, res) => {
    try {
      const { rows } = await pool.query("SELECT NOW() as time");
      res.json({
        status: "ok",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        database: "connected",
        dbTime: rows[0].time,
      });
    } catch {
      res.json({
        status: "degraded",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        database: "disconnected",
      });
    }
  });

  // Global error handler
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    log.error("Unhandled error", err);
    res.status(500).json({ error: "Internal server error" });
  });

  // ─── Vite middle-layer or static build serving ────────────────────────────
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // ─── Initialize DB then start listening ───────────────────────────────────
  await initializeDatabase();

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`E-bill Tree backend server started securely on port ${PORT}`);
    console.log(`Database: PostgreSQL at ${process.env.DATABASE_URL || "postgres://localhost:5432/ebilltree"}`);
  });
}

// ─── Graceful shutdown ──────────────────────────────────────────────────────
process.on("SIGTERM", async () => {
  console.log("[Server] SIGTERM received, shutting down gracefully...");
  await pool.end();
  process.exit(0);
});
process.on("SIGINT", async () => {
  console.log("[Server] SIGINT received, closing connections...");
  await pool.end();
  process.exit(0);
});

startServer().catch((err) => {
  console.error("[Server] Failed to start:", err);
  process.exit(1);
});
