// ═══════════════════════════════════════════════════════════════════
//  DAS Instruments — Database Layer
//  ✅ Supabase is PRIMARY storage — all reads/writes go to Supabase
//  💾 localStorage is only used as a session cache for speed
// ═══════════════════════════════════════════════════════════════════

import { ORDERS_DATA, Order } from '@/data/orders';
import {
  isSupabaseConfigured,
  supaOrders, supaCustomers, supaProducts, supaCategories, supaSettings, supaAdminCreds,
  SupaOrder, SupaCustomer, SupaProduct, SupaCategory, SupaSetting,
} from './supabase';
import { PRODUCTS, Product } from '@/data/products';
import { CATEGORIES, Category } from '@/data/categories';

// ── Types ────────────────────────────────────────────────────────
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  passwordHash: string;
  createdAt: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  gst?: string;
}

export interface StoredOrder extends Order {
  items: Array<{ id: string; name: string; icon: string; price: number; qty: number }>;
  customerId: string | null;
  paymentMethod: string;
  paymentId: string | null;
  shippingAddress: string;
  gst: string;
  subtotal: number;
  gstAmount: number;
  grandTotal: number;
}

export interface AdminCreds {
  username: string;
  passwordHash: string;
}

export const hashPwd = (p: string) => btoa(unescape(encodeURIComponent(p)));
export const checkPwd = (plain: string, hash: string) => hashPwd(plain) === hash;

const KEYS = {
  ORDERS:    'das_orders',
  CUSTOMERS: 'das_customers',
  ADMIN:     'das_admin_creds',
  SESSION:   'das_auth',
};

// ── Shape converters ─────────────────────────────────────────────
function supaToOrder(r: SupaOrder): StoredOrder {
  return {
    id: r.id,
    customer: r.customer_name,
    email: r.customer_email,
    product: (r.items || []).map((i: any) => `${i.name} ×${i.qty}`).join(', ').substring(0, 80),
    amount: r.grand_total,
    status: r.status,
    date: r.order_date,
    items: r.items || [],
    customerId: r.customer_id,
    paymentMethod: r.payment_method,
    paymentId: r.payment_id,
    shippingAddress: r.shipping_address,
    gst: r.gst_number,
    subtotal: r.subtotal,
    gstAmount: r.gst_amount,
    grandTotal: r.grand_total,
  };
}

function supaToCustomer(r: SupaCustomer): Customer {
  return {
    id: r.id, name: r.name, email: r.email, phone: r.phone,
    company: r.company, passwordHash: r.password_hash,
    createdAt: r.created_at || new Date().toISOString(),
    address: r.address, city: r.city, state: r.state,
    pincode: r.pincode, gst: r.gst,
  };
}

// ── Cache helpers (localStorage = speed cache only) ──────────────
function cacheGet<T>(key: string, fallback: T): T {
  try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : fallback; } catch { return fallback; }
}
function cacheSet(key: string, val: any) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

// ════════════════════════════════════════════════════════════════
//  DB — All reads/writes go to Supabase first
// ════════════════════════════════════════════════════════════════
export const db = {

  // ── ORDERS ────────────────────────────────────────────────────
  getOrders(): StoredOrder[] {
    // Returns cache immediately (for instant render)
    return cacheGet(KEYS.ORDERS, []);
  },

  async getOrdersAsync(): Promise<StoredOrder[]> {
    if (isSupabaseConfigured()) {
      try {
        const rows = await supaOrders.getAll();
        const orders = rows.map(supaToOrder);
        cacheSet(KEYS.ORDERS, orders);   // update cache
        return orders;
      } catch (e) { console.warn('Supabase getOrders failed:', e); }
    }
    return cacheGet(KEYS.ORDERS, []);
  },

  async saveOrderAsync(order: StoredOrder, phone = '', company = ''): Promise<void> {
    // Save to Supabase first
    if (isSupabaseConfigured()) {
      const row: SupaOrder = {
        id: order.id, customer_name: order.customer, customer_email: order.email,
        phone, company, items: order.items, subtotal: order.subtotal,
        gst_amount: order.gstAmount, grand_total: order.grandTotal,
        shipping_address: order.shippingAddress, gst_number: order.gst,
        payment_method: order.paymentMethod, payment_id: order.paymentId,
        status: order.status, order_date: order.date, customer_id: order.customerId,
      };
      try {
        await supaOrders.insert(row);
        console.log('✅ Order saved to Supabase:', order.id);
      } catch (e) { console.warn('⚠️ Supabase order save failed:', e); }
    }
    // Update cache
    const orders = cacheGet<StoredOrder[]>(KEYS.ORDERS, []);
    orders.unshift(order);
    cacheSet(KEYS.ORDERS, orders);
  },

  // Keep sync version for backward compatibility
  saveOrder(order: StoredOrder): void {
    this.saveOrderAsync(order);
  },
  saveOrderFull(order: StoredOrder, phone: string, company: string): void {
    this.saveOrderAsync(order, phone, company);
  },

  async updateOrderStatus(id: string, status: string): Promise<void> {
    // Supabase first
    if (isSupabaseConfigured()) {
      try {
        await supaOrders.updateStatus(id, status);
      } catch (e) { console.warn('Supabase status update failed:', e); }
    }
    // Update cache
    const orders = cacheGet<StoredOrder[]>(KEYS.ORDERS, []);
    const idx = orders.findIndex(o => o.id === id);
    if (idx !== -1) { orders[idx].status = status; cacheSet(KEYS.ORDERS, orders); }
  },

  async getOrdersByCustomerAsync(customerId: string): Promise<StoredOrder[]> {
    if (isSupabaseConfigured()) {
      try {
        const rows = await supaOrders.getByCustomer(customerId);
        return rows.map(supaToOrder);
      } catch (e) { console.warn('Supabase getOrdersByCustomer failed:', e); }
    }
    return cacheGet<StoredOrder[]>(KEYS.ORDERS, []).filter(o => o.customerId === customerId);
  },

  getOrdersByCustomer(customerId: string): StoredOrder[] {
    return cacheGet<StoredOrder[]>(KEYS.ORDERS, []).filter(o => o.customerId === customerId);
  },

  // ── CUSTOMERS ─────────────────────────────────────────────────
  getCustomers(): Customer[] {
    return cacheGet(KEYS.CUSTOMERS, []);
  },

  async getCustomersAsync(): Promise<Customer[]> {
    if (isSupabaseConfigured()) {
      try {
        const rows = await supaCustomers.getAll();
        const customers = rows.map(supaToCustomer);
        cacheSet(KEYS.CUSTOMERS, customers);
        return customers;
      } catch (e) { console.warn('Supabase getCustomers failed:', e); }
    }
    return cacheGet(KEYS.CUSTOMERS, []);
  },

  async loadCustomersAsync(): Promise<void> {
    await this.getCustomersAsync();
  },

  async registerCustomer(data: Omit<Customer, 'id'|'createdAt'|'passwordHash'> & { password: string }): Promise<{ ok: boolean; error?: string; customer?: Customer }> {
    // Check duplicate in Supabase first
    if (isSupabaseConfigured()) {
      try {
        const existing = await supaCustomers.getByEmail(data.email);
        if (existing) return { ok: false, error: 'An account with this email already exists.' };
      } catch {}
    } else {
      const cached = cacheGet<Customer[]>(KEYS.CUSTOMERS, []);
      if (cached.find(c => c.email.toLowerCase() === data.email.toLowerCase())) {
        return { ok: false, error: 'An account with this email already exists.' };
      }
    }

    const customer: Customer = {
      id: 'cust_' + Date.now(), name: data.name,
      email: data.email.toLowerCase(), phone: data.phone,
      company: data.company, passwordHash: hashPwd(data.password),
      createdAt: new Date().toISOString(),
    };

    // Save to Supabase
    if (isSupabaseConfigured()) {
      try {
        await supaCustomers.insert({
          id: customer.id, name: customer.name, email: customer.email,
          phone: customer.phone, company: customer.company,
          password_hash: customer.passwordHash,
        });
        console.log('✅ Customer saved to Supabase:', customer.email);
      } catch (e) { console.warn('⚠️ Supabase customer save failed:', e); }
    }

    // Update cache
    const customers = cacheGet<Customer[]>(KEYS.CUSTOMERS, []);
    customers.push(customer);
    cacheSet(KEYS.CUSTOMERS, customers);
    return { ok: true, customer };
  },

  async loginCustomer(email: string, password: string): Promise<{ ok: boolean; error?: string; customer?: Customer }> {
    // Try Supabase first for latest data
    if (isSupabaseConfigured()) {
      try {
        const row = await supaCustomers.getByEmail(email.toLowerCase());
        if (!row) return { ok: false, error: 'No account found with this email.' };
        if (!checkPwd(password, row.password_hash)) return { ok: false, error: 'Incorrect password.' };
        const customer = supaToCustomer(row);
        // Update cache with fresh data
        const customers = cacheGet<Customer[]>(KEYS.CUSTOMERS, []);
        const idx = customers.findIndex(c => c.id === customer.id);
        if (idx !== -1) customers[idx] = customer; else customers.push(customer);
        cacheSet(KEYS.CUSTOMERS, customers);
        return { ok: true, customer };
      } catch (e) { console.warn('Supabase login failed, using cache:', e); }
    }
    // Fallback to cache
    const customer = cacheGet<Customer[]>(KEYS.CUSTOMERS, []).find(c => c.email === email.toLowerCase());
    if (!customer) return { ok: false, error: 'No account found with this email.' };
    if (!checkPwd(password, customer.passwordHash)) return { ok: false, error: 'Incorrect password.' };
    return { ok: true, customer };
  },

  async updateCustomerProfile(id: string, updates: Partial<Customer>): Promise<void> {
    // Supabase first
    if (isSupabaseConfigured()) {
      try {
        await supaCustomers.update(id, {
          name: updates.name, phone: updates.phone, company: updates.company,
          address: updates.address, city: updates.city, state: updates.state,
          pincode: updates.pincode, gst: updates.gst,
        });
      } catch (e) { console.warn('Supabase profile update failed:', e); }
    }
    // Update cache
    const customers = cacheGet<Customer[]>(KEYS.CUSTOMERS, []);
    const idx = customers.findIndex(c => c.id === id);
    if (idx !== -1) { customers[idx] = { ...customers[idx], ...updates }; cacheSet(KEYS.CUSTOMERS, customers); }
  },

  async changeCustomerPassword(id: string, oldPwd: string, newPwd: string): Promise<{ ok: boolean; error?: string }> {
    const customers = cacheGet<Customer[]>(KEYS.CUSTOMERS, []);
    const customer = customers.find(c => c.id === id);
    if (!customer) return { ok: false, error: 'Account not found.' };
    if (!checkPwd(oldPwd, customer.passwordHash)) return { ok: false, error: 'Current password is incorrect.' };
    const newHash = hashPwd(newPwd);
    // Supabase first
    if (isSupabaseConfigured()) {
      try { await supaCustomers.update(id, { password_hash: newHash }); } catch (e) { console.warn('Supabase password update failed:', e); }
    }
    // Update cache
    customer.passwordHash = newHash;
    cacheSet(KEYS.CUSTOMERS, customers);
    return { ok: true };
  },

  // ── PRODUCTS ──────────────────────────────────────────────────
  async getProductsAsync(): Promise<Product[]> {
    if (isSupabaseConfigured()) {
      try {
        const rows: SupaProduct[] = await supaProducts.getAll();
        if (rows && rows.length > 0) {
          const products = rows.map(r => ({
            id: r.id, category: r.category, name: r.name, icon: r.icon,
            imageUrl: r.image_url || undefined, price: r.price,
            desc: (r as any).description || r.desc || '',
            specs: r.specs || {}, tags: r.tags || [],
            inStock: r.in_stock, actionType: r.action_type || 'cart',
            variantGroups: r.variant_groups || [],
          }));
          cacheSet('das_admin_products', products);
          return products;
        }
      } catch (e) { console.warn('Supabase getProducts failed:', e); }
    }
    return cacheGet('das_admin_products', PRODUCTS);
  },

  async upsertProductAsync(product: Product, isNew: boolean): Promise<void> {
    if (!isSupabaseConfigured()) return;
    const row: any = {
      id: product.id, category: product.category, name: product.name,
      icon: product.icon || '📦', image_url: product.imageUrl || '',
      price: product.price, description: product.desc,
      specs: product.specs || {}, tags: product.tags || [],
      in_stock: product.inStock, action_type: product.actionType || 'cart',
      variant_groups: (product as any).variantGroups || [], sort_order: Date.now(),
    };
    try {
      if (isNew) await supaProducts.insert(row);
      else await supaProducts.update(product.id, row);
      console.log('✅ Product saved to Supabase:', product.id);
    } catch (e) { console.warn('⚠️ Product save failed:', e); }
  },

  async deleteProductAsync(id: string): Promise<void> {
    if (!isSupabaseConfigured()) return;
    try { await supaProducts.remove(id); console.log('✅ Product deleted:', id); }
    catch (e) { console.warn('⚠️ Product delete failed:', e); }
  },

  // ── CATEGORIES ────────────────────────────────────────────────
  async getCategoriesAsync(): Promise<Category[]> {
    if (isSupabaseConfigured()) {
      try {
        const rows: SupaCategory[] = await supaCategories.getAll();
        if (rows && rows.length > 0) {
          const cats = rows.map(r => ({ id: r.id, name: r.name, icon: r.icon, sub: r.sub }));
          cacheSet('das_admin_categories', cats);
          return cats;
        }
      } catch (e) { console.warn('Supabase getCategories failed:', e); }
    }
    return cacheGet('das_admin_categories', CATEGORIES);
  },

  async upsertCategoryAsync(cat: Category, isNew: boolean): Promise<void> {
    if (!isSupabaseConfigured()) return;
    const row: Omit<SupaCategory, 'created_at'|'updated_at'> = {
      id: cat.id, name: cat.name, icon: cat.icon, sub: cat.sub, sort_order: Date.now(),
    };
    try {
      if (isNew) await supaCategories.insert(row);
      else await supaCategories.update(cat.id, row);
      console.log('✅ Category saved to Supabase:', cat.id);
    } catch (e) { console.warn('⚠️ Category save failed:', e); }
  },

  async deleteCategoryAsync(id: string): Promise<void> {
    if (!isSupabaseConfigured()) return;
    try { await supaCategories.remove(id); } catch (e) { console.warn('⚠️ Category delete failed:', e); }
  },

  // ── SETTINGS ──────────────────────────────────────────────────
  async getSettingsAsync(): Promise<Record<string, string>> {
    if (isSupabaseConfigured()) {
      try {
        const rows: SupaSetting[] = await supaSettings.getAll();
        if (rows && rows.length > 0) {
          const obj: Record<string, string> = {};
          rows.forEach(r => { obj[r.key] = r.value; });
          cacheSet('das_settings', obj);
          return obj;
        }
      } catch (e) { console.warn('Supabase getSettings failed:', e); }
    }
    return cacheGet('das_settings', {});
  },

  async saveSettingAsync(key: string, value: string): Promise<void> {
    // Supabase first
    if (isSupabaseConfigured()) {
      try { await supaSettings.upsert(key, value); console.log('✅ Setting saved:', key); }
      catch (e) { console.warn('⚠️ Setting save failed:', e); }
    }
    // Update cache
    const settings = cacheGet<Record<string, string>>('das_settings', {});
    settings[key] = value;
    cacheSet('das_settings', settings);
  },

  // ── ADMIN CREDENTIALS ─────────────────────────────────────────
  getAdminCreds(): AdminCreds {
    try {
      const raw = localStorage.getItem(KEYS.ADMIN);
      return raw ? JSON.parse(raw) : { username: 'admin', passwordHash: hashPwd('admin123') };
    } catch { return { username: 'admin', passwordHash: hashPwd('admin123') }; }
  },

  verifyAdmin(username: string, password: string): boolean {
    const creds = this.getAdminCreds();
    return creds.username === username && checkPwd(password, creds.passwordHash);
  },

  changeAdminCreds(currentPwd: string, newUsername: string, newPwd: string): { ok: boolean; error?: string } {
    return this.changeAdminCredsAndSync(currentPwd, newUsername, newPwd);
  },

  changeAdminCredsAndSync(currentPwd: string, newUsername: string, newPwd: string): { ok: boolean; error?: string } {
    const creds = this.getAdminCreds();
    if (!checkPwd(currentPwd, creds.passwordHash)) return { ok: false, error: 'Current password is incorrect.' };
    const updated: AdminCreds = {
      username: newUsername || creds.username,
      passwordHash: newPwd ? hashPwd(newPwd) : creds.passwordHash,
    };
    localStorage.setItem(KEYS.ADMIN, JSON.stringify(updated));
    if (isSupabaseConfigured()) {
      supaAdminCreds.save(updated.username, updated.passwordHash)
        .then(() => console.log('✅ Admin creds synced to Supabase'))
        .catch(e => console.warn('⚠️ Admin creds sync failed:', e));
    }
    return { ok: true };
  },
};
