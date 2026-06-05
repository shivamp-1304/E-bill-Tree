/**
 * Repository Layer — PostgreSQL data access for all entities
 * ──────────────────────────────────────────────────────────────────────────────
 * Each repository exports pure functions that take the pool and return typed data.
 * The frontend expects camelCase keys, so we transform snake_case from Postgres.
 */
import { pool } from "./pool";

// ─── Row-to-object transformers ─────────────────────────────────────────────
function toCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

function camelizeRow(row: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(row)) {
    out[toCamel(key)] = row[key];
  }
  return out;
}

function camelizeRows(rows: Record<string, unknown>[]): Record<string, unknown>[] {
  return rows.map(camelizeRow);
}

// ─── Company Profile ────────────────────────────────────────────────────────
export const CompanyProfileRepo = {
  async get() {
    const { rows } = await pool.query(`SELECT * FROM company_profiles ORDER BY id LIMIT 1`);
    if (rows.length === 0) return null;
    return camelizeRow(rows[0]);
  },

  async upsert(data: Record<string, unknown>) {
    const existing = await pool.query(`SELECT id FROM company_profiles ORDER BY id LIMIT 1`);
    if (existing.rows.length === 0) {
      const cols = Object.keys(data);
      const vals = Object.values(data);
      const placeholders = cols.map((_, i) => `$${i + 1}`);
      await pool.query(
        `INSERT INTO company_profiles (${cols.map(c => snakeCase(c)).join(",")}) VALUES (${placeholders.join(",")})`,
        vals
      );
    } else {
      const sets = Object.entries(data)
        .filter(([k]) => k !== "id")
        .map(([k], i) => `${snakeCase(k)} = $${i + 1}`);
      const vals = Object.entries(data)
        .filter(([k]) => k !== "id")
        .map(([, v]) => v);
      if (sets.length > 0) {
        sets.push(`updated_at = NOW()`);
        await pool.query(`UPDATE company_profiles SET ${sets.join(", ")} WHERE id = $${vals.length + 1}`, [...vals, existing.rows[0].id]);
      }
    }
    return this.get();
  },
};

// ─── Users ──────────────────────────────────────────────────────────────────
export const UserRepo = {
  async findByEmail(email: string) {
    const { rows } = await pool.query(`SELECT * FROM users WHERE email = $1`, [email]);
    return rows.length > 0 ? camelizeRow(rows[0]) : null;
  },

  async findById(id: string) {
    const { rows } = await pool.query(`SELECT * FROM users WHERE id = $1`, [id]);
    return rows.length > 0 ? camelizeRow(rows[0]) : null;
  },

  async create(data: Record<string, unknown>) {
    const { rows } = await pool.query(
      `INSERT INTO users (id, owner_name, company_name, email, password, phone, gst_number, address, registered_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [data.id, data.ownerName, data.companyName, data.email, data.password,
       data.phone || "", data.gstNumber || "", data.address || "", data.registeredAt || new Date().toISOString()]
    );
    return camelizeRow(rows[0]);
  },

  async update(id: string, data: Record<string, unknown>) {
    const sets = Object.entries(data)
      .filter(([k]) => k !== "id" && k !== "password" && k !== "email")
      .map(([k], i) => `${snakeCase(k)} = $${i + 1}`);
    const vals = Object.entries(data)
      .filter(([k]) => k !== "id" && k !== "password" && k !== "email")
      .map(([, v]) => v);
    if (sets.length === 0) return this.findById(id);
    sets.push(`updated_at = NOW()`);
    await pool.query(`UPDATE users SET ${sets.join(", ")} WHERE id = $${vals.length + 1}`, [...vals, id]);
    return this.findById(id);
  },

  async updatePassword(email: string, password: string) {
    await pool.query(`UPDATE users SET password = $1, updated_at = NOW() WHERE email = $2`, [password, email]);
  },

  async getAll() {
    const { rows } = await pool.query(`SELECT * FROM users ORDER BY registered_at`);
    return camelizeRows(rows);
  },
};

// ─── OTP Store ──────────────────────────────────────────────────────────────
export const OtpRepo = {
  async create(email: string, otp: string, expiresAt: number) {
    await pool.query(`INSERT INTO otp_store (email, otp, expires_at) VALUES ($1,$2,$3)`, [email, otp, expiresAt]);
  },

  async verify(email: string, otp: string) {
    const { rows } = await pool.query(
      `SELECT * FROM otp_store WHERE email = $1 ORDER BY created_at DESC LIMIT 1`,
      [email]
    );
    if (rows.length === 0) return { valid: false, reason: "No OTP found for this email" };
    const record = rows[0];
    if (Number(record.expires_at) < Date.now()) {
      await pool.query(`DELETE FROM otp_store WHERE email = $1`, [email]);
      return { valid: false, reason: "OTP has expired" };
    }
    if (record.otp !== otp) return { valid: false, reason: "Invalid OTP" };
    await pool.query(`DELETE FROM otp_store WHERE email = $1`, [email]);
    return { valid: true };
  },

  async cleanup(email: string) {
    await pool.query(`DELETE FROM otp_store WHERE email = $1`, [email]);
  },
};

// ─── Customers ──────────────────────────────────────────────────────────────
export const CustomerRepo = {
  async getAll() {
    const { rows } = await pool.query(`SELECT * FROM customers ORDER BY name`);
    return camelizeRows(rows);
  },

  async findById(id: string) {
    const { rows } = await pool.query(`SELECT * FROM customers WHERE id = $1`, [id]);
    return rows.length > 0 ? camelizeRow(rows[0]) : null;
  },

  async upsert(data: Record<string, unknown>) {
    const id = data.id || `cust-${Date.now()}`;
    const { rows } = await pool.query(
      `INSERT INTO customers (id, name, gst_number, email, phone, address, city, state, pincode)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       ON CONFLICT (id) DO UPDATE SET
         name=EXCLUDED.name, gst_number=EXCLUDED.gst_number, email=EXCLUDED.email,
         phone=EXCLUDED.phone, address=EXCLUDED.address, city=EXCLUDED.city,
         state=EXCLUDED.state, pincode=EXCLUDED.pincode, updated_at=NOW()
       RETURNING *`,
      [id, data.name, data.gstNumber || null, data.email, data.phone,
       data.address || "", data.city || "", data.state || "", data.pincode || ""]
    );
    return camelizeRow(rows[0]);
  },

  async update(id: string, data: Record<string, unknown>) {
    const sets: string[] = [];
    const vals: unknown[] = [];
    const fieldMap: Record<string, string> = {
      name: "name", gstNumber: "gst_number", email: "email", phone: "phone",
      address: "address", city: "city", state: "state", pincode: "pincode"
    };
    for (const [camelKey, colName] of Object.entries(fieldMap)) {
      if (data[camelKey] !== undefined) {
        vals.push(data[camelKey]);
        sets.push(`${colName} = $${vals.length}`);
      }
    }
    if (sets.length === 0) return this.findById(id);
    sets.push(`updated_at = NOW()`);
    vals.push(id);
    const { rows } = await pool.query(
      `UPDATE customers SET ${sets.join(", ")} WHERE id = $${vals.length} RETURNING *`,
      vals
    );
    return rows.length > 0 ? camelizeRow(rows[0]) : null;
  },

  async delete(id: string) {
    await pool.query(`DELETE FROM customers WHERE id = $1`, [id]);
  },
};

// ─── Products ───────────────────────────────────────────────────────────────
export const ProductRepo = {
  async getAll() {
    const { rows } = await pool.query(`SELECT * FROM products ORDER BY name`);
    return camelizeRows(rows);
  },

  async findById(id: string) {
    const { rows } = await pool.query(`SELECT * FROM products WHERE id = $1`, [id]);
    return rows.length > 0 ? camelizeRow(rows[0]) : null;
  },

  async upsert(data: Record<string, unknown>) {
    const id = data.id || `prod-${Date.now()}`;
    const { rows } = await pool.query(
      `INSERT INTO products (id, name, hsn_code, price, unit, gst_rate)
       VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (id) DO UPDATE SET
         name=EXCLUDED.name, hsn_code=EXCLUDED.hsn_code, price=EXCLUDED.price,
         unit=EXCLUDED.unit, gst_rate=EXCLUDED.gst_rate, updated_at=NOW()
       RETURNING *`,
      [id, data.name, data.hsnCode, data.price || 0, data.unit || "PCS", data.gstRate || 18]
    );
    return camelizeRow(rows[0]);
  },

  async update(id: string, data: Record<string, unknown>) {
    const sets: string[] = [];
    const vals: unknown[] = [];
    const fieldMap: Record<string, string> = {
      name: "name", hsnCode: "hsn_code", price: "price", unit: "unit", gstRate: "gst_rate"
    };
    for (const [camelKey, colName] of Object.entries(fieldMap)) {
      if (data[camelKey] !== undefined) {
        vals.push(data[camelKey]);
        sets.push(`${colName} = $${vals.length}`);
      }
    }
    if (sets.length === 0) return this.findById(id);
    sets.push(`updated_at = NOW()`);
    vals.push(id);
    const { rows } = await pool.query(
      `UPDATE products SET ${sets.join(", ")} WHERE id = $${vals.length} RETURNING *`,
      vals
    );
    return rows.length > 0 ? camelizeRow(rows[0]) : null;
  },

  async delete(id: string) {
    await pool.query(`DELETE FROM products WHERE id = $1`, [id]);
  },
};

// ─── Invoices ───────────────────────────────────────────────────────────────
export const InvoiceRepo = {
  async getAll() {
    const { rows } = await pool.query(`SELECT * FROM invoices ORDER BY date DESC`);
    return camelizeRows(rows);
  },

  async findById(id: string) {
    const { rows } = await pool.query(`SELECT * FROM invoices WHERE id = $1`, [id]);
    return rows.length > 0 ? camelizeRow(rows[0]) : null;
  },

  async getCount() {
    const { rows } = await pool.query(`SELECT COUNT(*) FROM invoices`);
    return Number(rows[0].count);
  },

  async upsert(data: Record<string, unknown>) {
    const id = data.id || `inv-${Date.now()}`;
    const { rows } = await pool.query(
      `INSERT INTO invoices (id, invoice_number, date, due_date, customer_id, customer_name, customer_gst, customer_state, items, total_taxable, total_cgst, total_sgst, total_igst, total_amount, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
       ON CONFLICT (id) DO UPDATE SET
         invoice_number=EXCLUDED.invoice_number, date=EXCLUDED.date, due_date=EXCLUDED.due_date,
         customer_id=EXCLUDED.customer_id, customer_name=EXCLUDED.customer_name, customer_gst=EXCLUDED.customer_gst,
         customer_state=EXCLUDED.customer_state, items=EXCLUDED.items, total_taxable=EXCLUDED.total_taxable,
         total_cgst=EXCLUDED.total_cgst, total_sgst=EXCLUDED.total_sgst, total_igst=EXCLUDED.total_igst,
         total_amount=EXCLUDED.total_amount, status=EXCLUDED.status, updated_at=NOW()
       RETURNING *`,
      [id, data.invoiceNumber, data.date, data.dueDate || null,
       data.customerId, data.customerName, data.customerGst || null, data.customerState || "",
       JSON.stringify(data.items || []),
       data.totalTaxable || 0, data.totalCgst || 0, data.totalSgst || 0, data.totalIgst || 0,
       data.totalAmount || 0, data.status || "Pending"]
    );
    return camelizeRow(rows[0]);
  },

  async update(id: string, data: Record<string, unknown>) {
    const sets: string[] = [];
    const vals: unknown[] = [];
    const fieldMap: Record<string, string> = {
      invoiceNumber: "invoice_number", date: "date", dueDate: "due_date",
      customerId: "customer_id", customerName: "customer_name", customerGst: "customer_gst",
      customerState: "customer_state", totalTaxable: "total_taxable", totalCgst: "total_cgst",
      totalSgst: "total_sgst", totalIgst: "total_igst", totalAmount: "total_amount", status: "status"
    };
    for (const [camelKey, colName] of Object.entries(fieldMap)) {
      if (data[camelKey] !== undefined) {
        vals.push(data[camelKey]);
        sets.push(`${colName} = $${vals.length}`);
      }
    }
    // Handle items JSONB separately
    if (data.items !== undefined) {
      vals.push(JSON.stringify(data.items));
      sets.push(`items = $${vals.length}`);
    }
    if (sets.length === 0) return this.findById(id);
    sets.push(`updated_at = NOW()`);
    vals.push(id);
    const { rows } = await pool.query(
      `UPDATE invoices SET ${sets.join(", ")} WHERE id = $${vals.length} RETURNING *`,
      vals
    );
    return rows.length > 0 ? camelizeRow(rows[0]) : null;
  },

  async updateStatus(id: string, status: string) {
    await pool.query(`UPDATE invoices SET status = $1, updated_at = NOW() WHERE id = $2`, [status, id]);
  },

  async delete(id: string) {
    // Cascade deletes e_way_bills via FK constraint
    await pool.query(`DELETE FROM invoices WHERE id = $1`, [id]);
  },
};

// ─── Challans ───────────────────────────────────────────────────────────────
export const ChallanRepo = {
  async getAll() {
    const { rows } = await pool.query(`SELECT * FROM challans ORDER BY date DESC`);
    return camelizeRows(rows);
  },

  async findById(id: string) {
    const { rows } = await pool.query(`SELECT * FROM challans WHERE id = $1`, [id]);
    return rows.length > 0 ? camelizeRow(rows[0]) : null;
  },

  async upsert(data: Record<string, unknown>) {
    const id = data.id || `ch-${Date.now()}`;
    const challanNumber = data.challanNumber || `EBT-CH-${Date.now().toString().slice(-6)}`;
    const { rows } = await pool.query(
      `INSERT INTO challans (id, challan_number, date, customer_id, customer_name, items, purpose, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       ON CONFLICT (id) DO UPDATE SET
         challan_number=EXCLUDED.challan_number, date=EXCLUDED.date, customer_id=EXCLUDED.customer_id,
         customer_name=EXCLUDED.customer_name, items=EXCLUDED.items, purpose=EXCLUDED.purpose,
         status=EXCLUDED.status, updated_at=NOW()
       RETURNING *`,
      [id, challanNumber, data.date, data.customerId, data.customerName,
       JSON.stringify(data.items || []), data.purpose || "", data.status || "Pending"]
    );
    return camelizeRow(rows[0]);
  },

  async update(id: string, data: Record<string, unknown>) {
    const sets: string[] = [];
    const vals: unknown[] = [];
    const fieldMap: Record<string, string> = {
      challanNumber: "challan_number", date: "date", customerId: "customer_id",
      customerName: "customer_name", purpose: "purpose", status: "status"
    };
    for (const [camelKey, colName] of Object.entries(fieldMap)) {
      if (data[camelKey] !== undefined) {
        vals.push(data[camelKey]);
        sets.push(`${colName} = $${vals.length}`);
      }
    }
    if (data.items !== undefined) {
      vals.push(JSON.stringify(data.items));
      sets.push(`items = $${vals.length}`);
    }
    if (sets.length === 0) return this.findById(id);
    sets.push(`updated_at = NOW()`);
    vals.push(id);
    const { rows } = await pool.query(
      `UPDATE challans SET ${sets.join(", ")} WHERE id = $${vals.length} RETURNING *`,
      vals
    );
    return rows.length > 0 ? camelizeRow(rows[0]) : null;
  },

  async delete(id: string) {
    await pool.query(`DELETE FROM challans WHERE id = $1`, [id]);
  },
};

// ─── E-Way Bills ────────────────────────────────────────────────────────────
export const EWayBillRepo = {
  async getAll() {
    const { rows } = await pool.query(`SELECT * FROM e_way_bills ORDER BY created_at DESC`);
    return camelizeRows(rows);
  },

  async findById(id: string) {
    const { rows } = await pool.query(`SELECT * FROM e_way_bills WHERE id = $1`, [id]);
    return rows.length > 0 ? camelizeRow(rows[0]) : null;
  },

  async upsert(data: Record<string, unknown>) {
    const id = data.id || `ewb-${Date.now()}`;
    const ewayBillNumber = data.ewayBillNumber || String(Math.floor(Math.random() * 900000000000) + 100000000000);
    const validUntil = data.validUntil || (() => { const d = new Date(); d.setDate(d.getDate() + 7); return d.toISOString().split("T")[0]; })();
    const status = data.status || "Active";

    const { rows } = await pool.query(
      `INSERT INTO e_way_bills (id, eway_bill_number, invoice_id, invoice_number, vehicle_number, transporter_name, distance_km, status, valid_until)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       ON CONFLICT (id) DO UPDATE SET
         eway_bill_number=EXCLUDED.eway_bill_number, invoice_id=EXCLUDED.invoice_id,
         invoice_number=EXCLUDED.invoice_number, vehicle_number=EXCLUDED.vehicle_number,
         transporter_name=EXCLUDED.transporter_name, distance_km=EXCLUDED.distance_km,
         status=EXCLUDED.status, valid_until=EXCLUDED.valid_until, updated_at=NOW()
       RETURNING *`,
      [id, ewayBillNumber, data.invoiceId, data.invoiceNumber,
       data.vehicleNumber, data.transporterName, data.distanceKm || 0, status, validUntil]
    );
    return camelizeRow(rows[0]);
  },

  async update(id: string, data: Record<string, unknown>) {
    const sets: string[] = [];
    const vals: unknown[] = [];
    const fieldMap: Record<string, string> = {
      ewayBillNumber: "eway_bill_number", invoiceId: "invoice_id", invoiceNumber: "invoice_number",
      vehicleNumber: "vehicle_number", transporterName: "transporter_name",
      distanceKm: "distance_km", status: "status", validUntil: "valid_until"
    };
    for (const [camelKey, colName] of Object.entries(fieldMap)) {
      if (data[camelKey] !== undefined) {
        vals.push(data[camelKey]);
        sets.push(`${colName} = $${vals.length}`);
      }
    }
    if (sets.length === 0) return this.findById(id);
    sets.push(`updated_at = NOW()`);
    vals.push(id);
    const { rows } = await pool.query(
      `UPDATE e_way_bills SET ${sets.join(", ")} WHERE id = $${vals.length} RETURNING *`,
      vals
    );
    return rows.length > 0 ? camelizeRow(rows[0]) : null;
  },

  async delete(id: string) {
    await pool.query(`DELETE FROM e_way_bills WHERE id = $1`, [id]);
  },
};

// ─── Helpers ────────────────────────────────────────────────────────────────
function snakeCase(str: string): string {
  return str.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
}
