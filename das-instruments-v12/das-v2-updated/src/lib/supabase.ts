// ═══════════════════════════════════════════════════════════════════
//  DAS Instruments — Supabase Client
//
//  Supabase is a free hosted PostgreSQL database.
//  All orders, customers, and admin data are stored permanently
//  in the cloud — accessible from any device, any browser.
//
//  FREE TIER: 500MB storage, unlimited reads/writes, never expires.
//
//  SETUP (5 minutes):
//  ──────────────────
//  1. Go to https://supabase.com → "Start for free"
//  2. Create a new project (choose any region near India)
//  3. Go to Project Settings → API
//  4. Copy "Project URL" → paste as VITE_SUPABASE_URL in .env
//  5. Copy "anon/public" key → paste as VITE_SUPABASE_ANON_KEY in .env
//  6. Go to SQL Editor → run the SQL from README_SUPABASE.sql
//  7. Rebuild & deploy — all data now saves to the cloud ✅
// ═══════════════════════════════════════════════════════════════════

const SUPABASE_URL  = (import.meta as any).env?.VITE_SUPABASE_URL   || '';
const SUPABASE_ANON = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = () =>
  Boolean(SUPABASE_URL && SUPABASE_ANON && SUPABASE_URL !== 'YOUR_SUPABASE_URL');

// ── Tiny fetch wrapper — no SDK dependency needed ────────────────
async function supaFetch(
  path: string,
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE' = 'GET',
  body?: object,
  params?: Record<string, string>
): Promise<any> {
  const url = new URL(`${SUPABASE_URL}/rest/v1/${path}`);
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), {
    method,
    headers: {
      'apikey':        SUPABASE_ANON,
      'Authorization': `Bearer ${SUPABASE_ANON}`,
      'Content-Type':  'application/json',
      'Prefer':        method === 'POST' ? 'return=representation' : 'return=minimal',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Supabase ${method} /${path} failed: ${err}`);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

// ════════════════════════════════════════════════════════════════
//  ORDERS
// ════════════════════════════════════════════════════════════════
export interface SupaOrder {
  id: string;
  customer_name: string;
  customer_email: string;
  phone: string;
  company: string;
  items: any[];
  subtotal: number;
  gst_amount: number;
  grand_total: number;
  shipping_address: string;
  gst_number: string;
  payment_method: string;
  payment_id: string | null;
  status: string;
  order_date: string;
  customer_id: string | null;
  created_at?: string;
}

export const supaOrders = {
  async getAll(): Promise<SupaOrder[]> {
    return supaFetch('das_orders', 'GET', undefined, {
      select: '*',
      order: 'created_at.desc',
    });
  },

  async insert(order: Omit<SupaOrder, 'created_at'>): Promise<SupaOrder> {
    const [row] = await supaFetch('das_orders', 'POST', order);
    return row;
  },

  async updateStatus(id: string, status: string): Promise<void> {
    await supaFetch('das_orders', 'PATCH', { status }, { id: `eq.${id}` });
  },

  async getByCustomer(customerId: string): Promise<SupaOrder[]> {
    return supaFetch('das_orders', 'GET', undefined, {
      select: '*',
      customer_id: `eq.${customerId}`,
      order: 'created_at.desc',
    });
  },
};

// ════════════════════════════════════════════════════════════════
//  CUSTOMERS
// ════════════════════════════════════════════════════════════════
export interface SupaCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  password_hash: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  gst?: string;
  created_at?: string;
}

export const supaCustomers = {
  async getAll(): Promise<SupaCustomer[]> {
    return supaFetch('das_customers', 'GET', undefined, { select: '*' });
  },

  async getByEmail(email: string): Promise<SupaCustomer | null> {
    const rows = await supaFetch('das_customers', 'GET', undefined, {
      select: '*',
      email: `eq.${email.toLowerCase()}`,
      limit: '1',
    });
    return rows?.[0] || null;
  },

  async getById(id: string): Promise<SupaCustomer | null> {
    const rows = await supaFetch('das_customers', 'GET', undefined, {
      select: '*',
      id: `eq.${id}`,
      limit: '1',
    });
    return rows?.[0] || null;
  },

  async insert(customer: Omit<SupaCustomer, 'created_at'>): Promise<SupaCustomer> {
    const [row] = await supaFetch('das_customers', 'POST', customer);
    return row;
  },

  async update(id: string, updates: Partial<SupaCustomer>): Promise<void> {
    await supaFetch('das_customers', 'PATCH', updates, { id: `eq.${id}` });
  },
};


// ════════════════════════════════════════════════════════════════
//  PRODUCTS
// ════════════════════════════════════════════════════════════════
export interface SupaProduct {
  id: string; category: string; name: string; icon: string;
  image_url: string; price: number; desc?: string; description?: string;
  specs: Record<string, string>; tags: string[];
  in_stock: boolean; action_type: 'cart' | 'enquiry';
  variant_groups: any[]; sort_order: number;
  created_at?: string; updated_at?: string;
}
export const supaProducts = {
  async getAll(): Promise<SupaProduct[]> {
    return supaFetch('das_products', 'GET', undefined, { select: '*', order: 'sort_order.asc' });
  },
  async insert(p: any): Promise<SupaProduct> {
    const [row] = await supaFetch('das_products', 'POST', { ...p, updated_at: new Date().toISOString() });
    return row;
  },
  async update(id: string, p: any): Promise<void> {
    await supaFetch('das_products', 'PATCH', { ...p, updated_at: new Date().toISOString() }, { id: `eq.${id}` });
  },
  async remove(id: string): Promise<void> {
    await supaFetch('das_products', 'DELETE', undefined, { id: `eq.${id}` });
  },
};

// ════════════════════════════════════════════════════════════════
//  CATEGORIES
// ════════════════════════════════════════════════════════════════
export interface SupaCategory {
  id: string; name: string; icon: string; sub: string; sort_order: number;
  created_at?: string; updated_at?: string;
}
export const supaCategories = {
  async getAll(): Promise<SupaCategory[]> {
    return supaFetch('das_categories', 'GET', undefined, { select: '*', order: 'sort_order.asc' });
  },
  async insert(c: Omit<SupaCategory, 'created_at'|'updated_at'>): Promise<SupaCategory> {
    const [row] = await supaFetch('das_categories', 'POST', { ...c, updated_at: new Date().toISOString() });
    return row;
  },
  async update(id: string, c: Partial<SupaCategory>): Promise<void> {
    await supaFetch('das_categories', 'PATCH', { ...c, updated_at: new Date().toISOString() }, { id: `eq.${id}` });
  },
  async remove(id: string): Promise<void> {
    await supaFetch('das_categories', 'DELETE', undefined, { id: `eq.${id}` });
  },
};

// ════════════════════════════════════════════════════════════════
//  SETTINGS
// ════════════════════════════════════════════════════════════════
export interface SupaSetting {
  key: string; value: string; updated_at?: string;
}
export const supaSettings = {
  async getAll(): Promise<SupaSetting[]> {
    return supaFetch('das_settings', 'GET', undefined, { select: '*' });
  },
  async upsert(key: string, value: string): Promise<void> {
    const SUPABASE_URL  = (import.meta as any).env?.VITE_SUPABASE_URL   || '';
    const SUPABASE_ANON = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';
    const res = await fetch(`${SUPABASE_URL}/rest/v1/das_settings`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON, 'Authorization': `Bearer ${SUPABASE_ANON}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates,return=minimal',
      },
      body: JSON.stringify({ key, value, updated_at: new Date().toISOString() }),
    });
    if (!res.ok) { const e = await res.text(); throw new Error(e); }
  },
};

// ════════════════════════════════════════════════════════════════
//  ADMIN CREDENTIALS
// ════════════════════════════════════════════════════════════════
export const supaAdminCreds = {
  async save(username: string, passwordHash: string): Promise<void> {
    await supaSettings.upsert('admin_username', username);
    await supaSettings.upsert('admin_password_hash', passwordHash);
  },
  async get(): Promise<{ username: string; passwordHash: string } | null> {
    try {
      const rows = await supaSettings.getAll();
      const u = rows.find(r => r.key === 'admin_username')?.value;
      const p = rows.find(r => r.key === 'admin_password_hash')?.value;
      if (u && p) return { username: u, passwordHash: p };
    } catch {}
    return null;
  },
};

// ════════════════════════════════════════════════════════════════
//  STORAGE — Upload product images
// ════════════════════════════════════════════════════════════════
export async function uploadProductImage(file: File): Promise<string> {
  const SUPABASE_URL  = (import.meta as any).env?.VITE_SUPABASE_URL   || '';
  const SUPABASE_ANON = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';
  const ext      = file.name.split('.').pop() || 'jpg';
  const fileName = `product_${Date.now()}.${ext}`;
  const bucket   = 'das-product-images';
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${bucket}/${fileName}`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_ANON, 'Authorization': `Bearer ${SUPABASE_ANON}`,
      'Content-Type': file.type, 'x-upsert': 'true',
    },
    body: file,
  });
  if (!res.ok) { const err = await res.text(); throw new Error(`Image upload failed: ${err}`); }
  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${fileName}`;
}

export { supaFetch };
