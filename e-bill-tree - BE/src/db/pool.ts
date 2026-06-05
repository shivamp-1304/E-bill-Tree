/**
 * PostgreSQL Connection Pool
 * ──────────────────────────────────────────────────────────────────────────────
 * Singleton connection pool using node-postgres (pg).
 * Reads DATABASE_URL from environment or falls back to sensible defaults.
 */
import pg from "pg";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });
dotenv.config({ path: "../.env" }); // Also check root .env

const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgres://localhost:5432/ebilltree";

export const pool = new pg.Pool({
  connectionString: DATABASE_URL,
  max: 10,               // Max connections in pool
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

// Log pool events for observability
pool.on("connect", () => {
  console.log(`[DB] New client connected (total: ${pool.totalCount}, idle: ${pool.idleCount})`);
});
pool.on("error", (err) => {
  console.error("[DB] Unexpected pool error:", err.message);
});

/**
 * Run all database migrations and seed data if tables are empty.
 * Called once at server startup.
 */
export async function initializeDatabase(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await runMigrations(client);
    await seedIfEmpty(client);
    await client.query("COMMIT");
    console.log("[DB] Database initialized successfully");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

// ─── Schema Migrations ──────────────────────────────────────────────────────
async function runMigrations(client: pg.PoolClient): Promise<void> {
  // Enable UUID extension for future use
  await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

  // Company profiles (singleton — one row)
  await client.query(`
    CREATE TABLE IF NOT EXISTS company_profiles (
      id              SERIAL PRIMARY KEY,
      name            VARCHAR(255) NOT NULL,
      gst_number      VARCHAR(50),
      pan_number      VARCHAR(50),
      address         TEXT,
      city            VARCHAR(100),
      pincode         VARCHAR(20),
      state           VARCHAR(100),
      email           VARCHAR(255),
      phone           VARCHAR(50),
      bank_name       VARCHAR(255),
      account_number  VARCHAR(100),
      ifsc_code       VARCHAR(50),
      logo_url        TEXT,
      created_at      TIMESTAMPTZ DEFAULT NOW(),
      updated_at      TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  // Users
  await client.query(`
    CREATE TABLE IF NOT EXISTS users (
      id              VARCHAR(50) PRIMARY KEY,
      owner_name      VARCHAR(255) NOT NULL,
      company_name    VARCHAR(255),
      email           VARCHAR(255) UNIQUE NOT NULL,
      password        VARCHAR(255) NOT NULL,
      phone           VARCHAR(50),
      gst_number      VARCHAR(50),
      address         TEXT,
      avatar_url      TEXT,
      registered_at   TIMESTAMPTZ DEFAULT NOW(),
      created_at      TIMESTAMPTZ DEFAULT NOW(),
      updated_at      TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  // Customers
  await client.query(`
    CREATE TABLE IF NOT EXISTS customers (
      id              VARCHAR(50) PRIMARY KEY,
      name            VARCHAR(255) NOT NULL,
      gst_number      VARCHAR(50),
      email           VARCHAR(255) NOT NULL,
      phone           VARCHAR(50) NOT NULL,
      address         TEXT,
      city            VARCHAR(100),
      state           VARCHAR(100),
      pincode         VARCHAR(20),
      created_at      TIMESTAMPTZ DEFAULT NOW(),
      updated_at      TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  // Products
  await client.query(`
    CREATE TABLE IF NOT EXISTS products (
      id              VARCHAR(50) PRIMARY KEY,
      name            VARCHAR(255) NOT NULL,
      hsn_code        VARCHAR(50) NOT NULL,
      price           NUMERIC(12,2) NOT NULL DEFAULT 0,
      unit            VARCHAR(20) NOT NULL DEFAULT 'PCS',
      gst_rate        NUMERIC(5,2) NOT NULL DEFAULT 18,
      created_at      TIMESTAMPTZ DEFAULT NOW(),
      updated_at      TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  // Invoices (items stored as JSONB)
  await client.query(`
    CREATE TABLE IF NOT EXISTS invoices (
      id              VARCHAR(50) PRIMARY KEY,
      invoice_number  VARCHAR(100) NOT NULL,
      date            DATE NOT NULL,
      due_date        DATE,
      customer_id     VARCHAR(50) REFERENCES customers(id) ON DELETE SET NULL,
      customer_name   VARCHAR(255) NOT NULL,
      customer_gst    VARCHAR(50),
      customer_state  VARCHAR(100),
      items           JSONB NOT NULL DEFAULT '[]'::jsonb,
      total_taxable   NUMERIC(14,2) DEFAULT 0,
      total_cgst      NUMERIC(14,2) DEFAULT 0,
      total_sgst      NUMERIC(14,2) DEFAULT 0,
      total_igst      NUMERIC(14,2) DEFAULT 0,
      total_amount    NUMERIC(14,2) DEFAULT 0,
      status          VARCHAR(20) DEFAULT 'Pending',
      created_at      TIMESTAMPTZ DEFAULT NOW(),
      updated_at      TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  // Challans (items stored as JSONB)
  await client.query(`
    CREATE TABLE IF NOT EXISTS challans (
      id              VARCHAR(50) PRIMARY KEY,
      challan_number  VARCHAR(100) NOT NULL,
      date            DATE NOT NULL,
      customer_id     VARCHAR(50) REFERENCES customers(id) ON DELETE SET NULL,
      customer_name   VARCHAR(255) NOT NULL,
      items           JSONB NOT NULL DEFAULT '[]'::jsonb,
      purpose         TEXT,
      status          VARCHAR(20) DEFAULT 'Pending',
      created_at      TIMESTAMPTZ DEFAULT NOW(),
      updated_at      TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  // E-Way Bills
  await client.query(`
    CREATE TABLE IF NOT EXISTS e_way_bills (
      id                VARCHAR(50) PRIMARY KEY,
      eway_bill_number  VARCHAR(50) NOT NULL,
      invoice_id        VARCHAR(50) REFERENCES invoices(id) ON DELETE CASCADE,
      invoice_number    VARCHAR(100),
      vehicle_number    VARCHAR(50) NOT NULL,
      transporter_name  VARCHAR(255),
      distance_km       INTEGER DEFAULT 0,
      status            VARCHAR(20) DEFAULT 'Active',
      valid_until       DATE,
      created_at        TIMESTAMPTZ DEFAULT NOW(),
      updated_at        TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  // OTP store (temporary codes for auth flows)
  await client.query(`
    CREATE TABLE IF NOT EXISTS otp_store (
      id          SERIAL PRIMARY KEY,
      email       VARCHAR(255) NOT NULL,
      otp         VARCHAR(10) NOT NULL,
      expires_at  BIGINT NOT NULL,
      created_at  TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  // Indexes for common lookups
  await client.query(`CREATE INDEX IF NOT EXISTS idx_invoices_customer ON invoices(customer_id)`);
  await client.query(`CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(date)`);
  await client.query(`CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status)`);
  await client.query(`CREATE INDEX IF NOT EXISTS idx_challans_customer ON challans(customer_id)`);
  await client.query(`CREATE INDEX IF NOT EXISTS idx_eway_bills_invoice ON e_way_bills(invoice_id)`);
  await client.query(`CREATE INDEX IF NOT EXISTS idx_otp_email ON otp_store(email)`);

  console.log("[DB] Migrations complete — all tables verified");
}

// ─── Seed initial data if tables are empty ──────────────────────────────────
async function seedIfEmpty(client: pg.PoolClient): Promise<void> {
  // Company profile
  const cpResult = await client.query(`SELECT COUNT(*) FROM company_profiles`);
  if (Number(cpResult.rows[0].count) === 0) {
    await client.query(
      `INSERT INTO company_profiles (name, gst_number, pan_number, address, city, pincode, state, email, phone, bank_name, account_number, ifsc_code, logo_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
      [
        "Acme Corporation Pvt Ltd", "22AAAAA0000A1Z5", "ABCDE1234F",
        "Suite 101, Business Park, Tech Zone", "Mumbai", "400001", "Maharashtra",
        "billing@company.com", "+91 98765 43210",
        "HDFC Bank", "50200012345678", "HDFC0001234",
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCPW3EceoldRDNKHXhXbK0aGi6nD__kFN-wUrcGj5YS09Bt7cUvMv1Pe6zBeFURZrIU514uVzWj6MY3nWr9g4L73M8mrlAA1-sTN2AiyfkQ_esWu3sf-SAvgGiwiOJKrEYj7jrKuUdt8j6jXXsbyj0g7tEXc877fs3yVTqXo15vcaUqlziZ6L9vciQmi2vU0fu7Iw4p85xc4nj14Un1OoDNDB16outMrTPalbUXz0h0xoh43iFbJZktJNJia0tyjVq80mecpICV-K_f"
      ]
    );
    console.log("[DB] Seeded company profile");
  }

  // Users
  const uResult = await client.query(`SELECT COUNT(*) FROM users`);
  if (Number(uResult.rows[0].count) === 0) {
    await client.query(
      `INSERT INTO users (id, owner_name, company_name, email, password, phone, gst_number, address, registered_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      ["user-1", "Admin User", "Acme Corporation Pvt Ltd", "admin@ebilltree.com", "admin123",
       "+91 98765 43210", "22AAAAA0000A1Z5", "Suite 101, Business Park, Tech Zone", "2026-01-01T00:00:00.000Z"]
    );
    console.log("[DB] Seeded default user");
  }

  // Customers
  const cResult = await client.query(`SELECT COUNT(*) FROM customers`);
  if (Number(cResult.rows[0].count) === 0) {
    const customers = [
      ["cust-1", "Tata Motors Logistics", "27AAACT1234A1Z9", "procurement@tatamotors.com", "+91 91234 56789", "Pimpri Industrial Area, Sector 5", "Pune", "Maharashtra", "411018"],
      ["cust-2", "Reliance Retail Ltd", "22AAACR5678F1ZC", "finance@relianceretail.com", "+91 98111 22233", "Reliance Corporate Park, Ghansoli", "Navi Mumbai", "Maharashtra", "400701"],
      ["cust-3", "Infosys Technologies Ltd", "29AAACI9911D1ZX", "vendor-bills@infosys.com", "+91 80285 20261", "Electronic City, Hosur Road", "Bengaluru", "Karnataka", "560100"],
      ["cust-4", "Delhivery Express Solutions", "07AAACD9090H1ZN", "accounts@delhivery.com", "+91 12467 19500", "Sector 44, Plot 5", "Gurugram", "Delhi", "122003"],
    ];
    for (const c of customers) {
      await client.query(
        `INSERT INTO customers (id, name, gst_number, email, phone, address, city, state, pincode) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        c
      );
    }
    console.log("[DB] Seeded 4 customers");
  }

  // Products
  const pResult = await client.query(`SELECT COUNT(*) FROM products`);
  if (Number(pResult.rows[0].count) === 0) {
    const products = [
      ["prod-1", "Heavy Duty Leaf Springs (Set of 4)", "73201011", 18500, "SET", 18],
      ["prod-2", "Automotive Suspension Shock Absorber", "87088000", 4200, "PCS", 18],
      ["prod-3", "Eco-Grade Biodegradable Hydraulic Fluid 5L", "38112100", 2450, "NOS", 12],
      ["prod-4", "Steel Fastener Bolts (Box of 500)", "73181500", 1100, "BOX", 18],
      ["prod-5", "Heavy Transport Wheel Gaskets (Silicon)", "40169300", 320, "PCS", 5],
      ["prod-6", "Solar Array Charger Controller 40A", "85044090", 8900, "NOS", 5],
    ];
    for (const p of products) {
      await client.query(
        `INSERT INTO products (id, name, hsn_code, price, unit, gst_rate) VALUES ($1,$2,$3,$4,$5,$6)`,
        p
      );
    }
    console.log("[DB] Seeded 6 products");
  }

  // Invoices
  const iResult = await client.query(`SELECT COUNT(*) FROM invoices`);
  if (Number(iResult.rows[0].count) === 0) {
    const invoices = [
      {
        id: "inv-1001", invoice_number: "EBT/24-25/1001", date: "2026-05-15", due_date: "2026-06-15",
        customer_id: "cust-1", customer_name: "Tata Motors Logistics", customer_gst: "27AAACT1234A1Z9", customer_state: "Maharashtra",
        items: [
          { productId: "prod-1", productName: "Heavy Duty Leaf Springs (Set of 4)", hsnCode: "73201011", price: 18500, qty: 10, unit: "SET", gstRate: 18, taxableValue: 185000, cgstAmount: 16650, sgstAmount: 16650, igstAmount: 0, total: 218300 },
          { productId: "prod-2", productName: "Automotive Suspension Shock Absorber", hsnCode: "87088000", price: 4200, qty: 20, unit: "PCS", gstRate: 18, taxableValue: 84000, cgstAmount: 7560, sgstAmount: 7560, igstAmount: 0, total: 99120 }
        ],
        total_taxable: 269000, total_cgst: 24210, total_sgst: 24210, total_igst: 0, total_amount: 317420, status: "Paid"
      },
      {
        id: "inv-1002", invoice_number: "EBT/24-25/1002", date: "2026-05-28", due_date: "2026-06-28",
        customer_id: "cust-3", customer_name: "Infosys Technologies Ltd", customer_gst: "29AAACI9911D1ZX", customer_state: "Karnataka",
        items: [
          { productId: "prod-6", productName: "Solar Array Charger Controller 40A", hsnCode: "85044090", price: 8900, qty: 15, unit: "NOS", gstRate: 5, taxableValue: 133500, cgstAmount: 0, sgstAmount: 0, igstAmount: 6675, total: 140175 }
        ],
        total_taxable: 133500, total_cgst: 0, total_sgst: 0, total_igst: 6675, total_amount: 140175, status: "Pending"
      },
      {
        id: "inv-1003", invoice_number: "EBT/24-25/1003", date: "2026-06-02", due_date: "2026-07-02",
        customer_id: "cust-2", customer_name: "Reliance Retail Ltd", customer_gst: "22AAACR5678F1ZC", customer_state: "Maharashtra",
        items: [
          { productId: "prod-3", productName: "Eco-Grade Biodegradable Hydraulic Fluid 5L", hsnCode: "38112100", price: 2450, qty: 50, unit: "NOS", gstRate: 12, taxableValue: 122500, cgstAmount: 7350, sgstAmount: 7350, igstAmount: 0, total: 137200 },
          { productId: "prod-5", productName: "Heavy Transport Wheel Gaskets (Silicon)", hsnCode: "40169300", price: 320, qty: 100, unit: "PCS", gstRate: 5, taxableValue: 32000, cgstAmount: 800, sgstAmount: 800, igstAmount: 0, total: 33600 }
        ],
        total_taxable: 154500, total_cgst: 8150, total_sgst: 8150, total_igst: 0, total_amount: 170800, status: "Draft"
      }
    ];
    for (const inv of invoices) {
      await client.query(
        `INSERT INTO invoices (id, invoice_number, date, due_date, customer_id, customer_name, customer_gst, customer_state, items, total_taxable, total_cgst, total_sgst, total_igst, total_amount, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
        [inv.id, inv.invoice_number, inv.date, inv.due_date, inv.customer_id, inv.customer_name, inv.customer_gst, inv.customer_state,
         JSON.stringify(inv.items), inv.total_taxable, inv.total_cgst, inv.total_sgst, inv.total_igst, inv.total_amount, inv.status]
      );
    }
    console.log("[DB] Seeded 3 invoices");
  }

  // Challans
  const chResult = await client.query(`SELECT COUNT(*) FROM challans`);
  if (Number(chResult.rows[0].count) === 0) {
    const challans = [
      { id: "ch-501", challan_number: "EBT-CH-501", date: "2026-05-10", customer_id: "cust-1", customer_name: "Tata Motors Logistics", items: [{ productName: "Heavy Duty Leaf Springs (Set of 4)", qty: 8, unit: "SET" }, { productName: "Automotive Suspension Shock Absorber", qty: 15, unit: "PCS" }], purpose: "Sent for Quality Approval / Trail Testing", status: "Returned" },
      { id: "ch-502", challan_number: "EBT-CH-502", date: "2026-05-24", customer_id: "cust-3", customer_name: "Infosys Technologies Ltd", items: [{ productName: "Solar Array Charger Controller 40A", qty: 25, unit: "NOS" }], purpose: "Delivery on Approval Basis", status: "Invoiced" },
      { id: "ch-503", challan_number: "EBT-CH-503", date: "2026-06-03", customer_id: "cust-4", customer_name: "Delhivery Express Solutions", items: [{ productName: "Heavy Transport Wheel Gaskets (Silicon)", qty: 300, unit: "PCS" }], purpose: "Stock Transfer to Logistics Hub", status: "Pending" },
    ];
    for (const ch of challans) {
      await client.query(
        `INSERT INTO challans (id, challan_number, date, customer_id, customer_name, items, purpose, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [ch.id, ch.challan_number, ch.date, ch.customer_id, ch.customer_name, JSON.stringify(ch.items), ch.purpose, ch.status]
      );
    }
    console.log("[DB] Seeded 3 challans");
  }

  // E-Way Bills
  const ewResult = await client.query(`SELECT COUNT(*) FROM e_way_bills`);
  if (Number(ewResult.rows[0].count) === 0) {
    const ewaybills = [
      ["ewb-201", "221948271039", "inv-1001", "EBT/24-25/1001", "MH-12-PQ-9876", "VRL Logistics Ltd", 145, "Active", "2026-06-10"],
      ["ewb-202", "298711029384", "inv-1002", "EBT/24-25/1002", "KA-03-MY-4122", "Safexpress Transport", 980, "Expired", "2026-05-31"],
    ];
    for (const ew of ewaybills) {
      await client.query(
        `INSERT INTO e_way_bills (id, eway_bill_number, invoice_id, invoice_number, vehicle_number, transporter_name, distance_km, status, valid_until) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        ew
      );
    }
    console.log("[DB] Seeded 2 e-way bills");
  }
}
