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
//  STORAGE — Upload product images
// ════════════════════════════════════════════════════════════════
export async function uploadProductImage(file: File): Promise<string> {
  // Use module-level vars (already resolved at runtime)
  if (!SUPABASE_URL || !SUPABASE_ANON) {
    throw new Error('Supabase not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to Vercel environment variables.');
  }

  const ext      = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const fileName = `product_${Date.now()}.${ext}`;
  const bucket   = 'das-product-images';
  const baseUrl  = SUPABASE_URL.replace(/\/$/, '');
  const uploadUrl = `${baseUrl}/storage/v1/object/${bucket}/${fileName}`;

  console.log('Uploading to:', uploadUrl);

  const res = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'apikey':        SUPABASE_ANON,
      'Authorization': `Bearer ${SUPABASE_ANON}`,
      'Content-Type':  file.type || 'image/jpeg',
      'x-upsert':      'true',
    },
    body: file,
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error('Upload error:', errText);
    throw new Error(`Upload failed (${res.status}): ${errText}`);
  }

  const publicUrl = `${baseUrl}/storage/v1/object/public/${bucket}/${fileName}`;
  console.log('Upload success:', publicUrl);
  return publicUrl;
}

export { supaFetch };
