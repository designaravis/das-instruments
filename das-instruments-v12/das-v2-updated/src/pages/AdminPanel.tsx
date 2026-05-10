import { useState, useEffect } from "react";
import { PRODUCTS, Product } from "@/data/products";
import { CATEGORIES, Category } from "@/data/categories";
import { formatINR } from "@/lib/store";
import { db, StoredOrder } from "@/lib/db";
import { isSupabaseConfigured, uploadProductImage } from "@/lib/supabase";

interface AdminPanelProps { onLogout: () => void; }

const AdminPanel = ({ onLogout }: AdminPanelProps) => {
  const [tab, setTab]         = useState('dashboard');
  const [products, setProducts] = useState<Product[]>(() => {
    try { const s = localStorage.getItem('das_admin_products'); return s ? JSON.parse(s) : PRODUCTS; } catch { return PRODUCTS; }
  });

  const saveProducts = (ps: Product[]) => {
    setProducts(ps);
    localStorage.setItem('das_admin_products', JSON.stringify(ps));
    window.dispatchEvent(new Event('das_products_updated'));
  };

  // ── Live orders — pulls from Supabase if configured ──────────
  const [orders, setOrders] = useState<StoredOrder[]>(() => db.getOrders());
  const [ordersLoading, setOrdersLoading] = useState(false);

  const refreshOrders = async () => {
    setOrdersLoading(true);
    try {
      const data = await db.getOrdersAsync();
      setOrders(data);
    } finally {
      setOrdersLoading(false);
    }
  };

  // Auto-fetch on mount
  useEffect(() => { refreshOrders(); }, []);

  // ── Categories ───────────────────────────────────────────────
  const [categories, setCategories] = useState<Category[]>(() => {
    try { const s = localStorage.getItem('das_admin_categories'); return s ? JSON.parse(s) : CATEGORIES; } catch { return CATEGORIES; }
  });
  const [showCatModal, setShowCatModal] = useState(false);
  const [editCat, setEditCat] = useState<Partial<Category> | null>(null);
  const [catForm, setCatForm] = useState({ name:'', icon:'📦', sub:'' });

  const saveCategories = (cats: Category[]) => {
    setCategories(cats);
    localStorage.setItem('das_admin_categories', JSON.stringify(cats));
    window.dispatchEvent(new Event('das_categories_updated'));
  };

  // ── Products modal ───────────────────────────────────────────
  const [showProdModal, setShowProdModal] = useState(false);
  const [editProduct, setEditProduct] = useState<any>(null);
  const [imageUploading, setImageUploading] = useState(false);

  // ── Admin credentials change ─────────────────────────────────
  const [credForm, setCredForm]   = useState({ currentPwd:'', newUsername:'', newPwd:'', confirmPwd:'' });
  const [credMsg, setCredMsg]     = useState({ type:'', text:'' });

  const handleChangeCreds = () => {
    if (!credForm.currentPwd) { setCredMsg({ type:'error', text:'Enter current password.' }); return; }
    if (credForm.newPwd && credForm.newPwd.length < 6) { setCredMsg({ type:'error', text:'New password must be at least 6 characters.' }); return; }
    if (credForm.newPwd && credForm.newPwd !== credForm.confirmPwd) { setCredMsg({ type:'error', text:'New passwords do not match.' }); return; }
    const res = db.changeAdminCreds(credForm.currentPwd, credForm.newUsername, credForm.newPwd);
    if (res.ok) {
      setCredMsg({ type:'success', text:'Credentials updated! Use new details next login.' });
      setCredForm({ currentPwd:'', newUsername:'', newPwd:'', confirmPwd:'' });
    } else {
      setCredMsg({ type:'error', text: res.error || 'Failed.' });
    }
  };

  const ICONS = ['📦','⚗️','🔬','🎛️','🌡️','📊','⚡','🔋','🪫','🧲','🔧','💡','🖥️','📡','🧪','🏭','⚙️','🔩'];
  const statusColor: Record<string,string> = {
    delivered:'badge-success', processing:'badge-info', shipped:'badge-warn', pending:'badge-danger'
  };

  const navItems = [
    { id:'dashboard', icon:'📊', label:'Dashboard' },
    { id:'orders',    icon:'📦', label:`Orders (${orders.length})` },
    { id:'categories',icon:'📂', label:'Categories' },
    { id:'products',  icon:'🧪', label:'Products' },
    { id:'customers', icon:'👥', label:`Customers (${db.getCustomers().length})` },
    { id:'settings',  icon:'⚙️', label:'Settings' },
  ];

  return (
    <div className="admin-layout">
      <div className="admin-sidebar" style={{ display:'flex', flexDirection:'column' }}>
        <div className="px-6 pb-6 mb-2" style={{ borderBottom:'1px solid rgba(255,255,255,0.1)' }}>
          <div className="font-condensed text-lg font-bold" style={{ color:'hsl(var(--gold2))' }}>DAS Admin</div>
          <div className="text-xs mt-0.5" style={{ color:'rgba(255,255,255,0.4)' }}>Management Portal</div>
        </div>
        <div style={{ flex:1 }}>
          {navItems.map(n=>(
            <div key={n.id} className={`admin-nav-item${tab===n.id?' active':''}`} onClick={()=>{ setTab(n.id); if(n.id==='orders') refreshOrders(); }}>
              <span>{n.icon}</span>{n.label}
            </div>
          ))}
        </div>
        <div style={{ padding:'1rem 1.5rem', borderTop:'1px solid rgba(255,255,255,0.1)' }}>
          <button onClick={onLogout} style={{ background:'rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.7)', border:'none', borderRadius:'6px', padding:'0.5rem 1rem', cursor:'pointer', width:'100%', fontSize:'0.85rem', fontWeight:600 }}>🚪 Logout</button>
        </div>
      </div>

      <div className="admin-content">

        {/* ── DASHBOARD ── */}
        {tab==='dashboard' && (
          <div>
            <div className="mb-8">
              <div className="font-condensed text-3xl font-bold tracking-wide" style={{ color:'hsl(var(--navy))' }}>Dashboard</div>
              <div className="text-sm" style={{ color:'hsl(var(--muted-text))' }}>Welcome back, Admin</div>
            </div>
            <div className="grid grid-cols-4 gap-4 mb-8">
              {[
                { v: '₹'+Math.round(orders.reduce((s,o)=>s+o.grandTotal,0)/100000*100)/100+'L', l:'Total Revenue', t:'All orders' },
                { v: String(orders.length), l:'Total Orders', t:`${orders.filter(o=>o.status==='pending').length} pending` },
                { v: String(products.length), l:'Products', t:`${products.filter(p=>!p.inStock).length} out of stock` },
                { v: String(db.getCustomers().length), l:'Registered Customers', t:'All time' },
              ].map(m=>(
                <div key={m.l} className="metric-card">
                  <div className="font-condensed text-3xl font-bold" style={{ color:'hsl(var(--navy))' }}>{m.v}</div>
                  <div className="text-xs font-medium mt-1" style={{ color:'hsl(var(--muted-text))' }}>{m.l}</div>
                  <div className="text-xs font-semibold mt-1.5" style={{ color:'hsl(var(--success))' }}>{m.t}</div>
                </div>
              ))}
            </div>
            <div className="data-table">
              <div className="p-4 border-b" style={{ borderColor:'hsl(var(--off2))' }}>
                <div className="font-condensed text-base font-bold" style={{ color:'hsl(var(--navy))' }}>Recent Orders</div>
              </div>
              <table><thead><tr>{['Order ID','Customer','Amount','Payment','Status','Date'].map(h=><th key={h}>{h}</th>)}</tr></thead>
                <tbody>{orders.slice(0,10).map(o=>(
                  <tr key={o.id}>
                    <td className="font-semibold" style={{ color:'hsl(var(--steel))', fontSize:'0.78rem' }}>{o.id}</td>
                    <td><div>{o.customer}</div><div className="text-xs" style={{ color:'hsl(var(--muted-text))' }}>{o.email}</div></td>
                    <td className="font-semibold">{formatINR(o.grandTotal)}</td>
                    <td className="text-xs">{o.paymentMethod}{o.paymentId ? <div style={{ color:'hsl(var(--success))', fontSize:'0.7rem' }}>✓ {o.paymentId.substring(0,16)}…</div> : null}</td>
                    <td><span className={statusColor[o.status]||'badge-info'}>{o.status.charAt(0).toUpperCase()+o.status.slice(1)}</span></td>
                    <td>{o.date}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── ORDERS ── */}
        {tab==='orders' && (
          <div>
            <div className="mb-6 flex justify-between items-center">
              <div>
                <div className="font-condensed text-3xl font-bold tracking-wide" style={{ color:'hsl(var(--navy))' }}>Orders</div>
                <div className="text-xs mt-1" style={{ color:'hsl(var(--muted-text))' }}>
                  {isSupabaseConfigured() ? '🟢 Live from Supabase database' : '🟡 Local browser storage — configure Supabase for permanent storage'}
                </div>
              </div>
              <button className="btn-sm-das" onClick={refreshOrders} disabled={ordersLoading}>
                {ordersLoading ? '⏳ Loading…' : '↻ Refresh'}
              </button>
            </div>
            <div className="data-table">
              <table><thead><tr>{['Order ID','Customer','Items','Amount','Payment','Status','Date'].map(h=><th key={h}>{h}</th>)}</tr></thead>
                <tbody>{orders.map(o=>(
                  <tr key={o.id}>
                    <td className="font-semibold" style={{ color:'hsl(var(--steel))', fontSize:'0.78rem' }}>{o.id}</td>
                    <td>
                      <div>{o.customer}</div>
                      <div className="text-xs" style={{ color:'hsl(var(--muted-text))' }}>{o.email}</div>
                      {o.shippingAddress && <div className="text-xs mt-0.5" style={{ color:'hsl(var(--muted-text))' }}>📍 {o.shippingAddress}</div>}
                    </td>
                    <td className="text-xs" style={{ maxWidth:180 }}>
                      {o.items?.length ? o.items.map(i=><div key={i.id}>{i.icon} {i.name} ×{i.qty}</div>) : <span>{o.product}</span>}
                    </td>
                    <td>
                      <div className="font-semibold">{formatINR(o.grandTotal)}</div>
                      <div className="text-xs" style={{ color:'hsl(var(--muted-text))' }}>+GST incl.</div>
                    </td>
                    <td className="text-xs">
                      <div>{o.paymentMethod}</div>
                      {o.paymentId && <div style={{ color:'hsl(var(--success))', fontSize:'0.7rem' }}>✓ {o.paymentId.substring(0,14)}…</div>}
                      {!o.paymentId && o.paymentMethod!=='razorpay' && <div style={{ color:'hsl(var(--danger))', fontSize:'0.7rem' }}>⏳ Awaiting</div>}
                    </td>
                    <td>
                      <select value={o.status} className="das-select" style={{ width:'auto', padding:'2px 6px', fontSize:'0.82rem' }}
                        onChange={e=>{ db.updateOrderStatus(o.id, e.target.value); refreshOrders(); }}>
                        {['pending','processing','shipped','delivered'].map(s=>(
                          <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>
                        ))}
                      </select>
                    </td>
                    <td>{o.date}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── CATEGORIES ── */}
        {tab==='categories' && (
          <div>
            <div className="mb-8 flex justify-between items-start">
              <div>
                <div className="font-condensed text-3xl font-bold tracking-wide" style={{ color:'hsl(var(--navy))' }}>Categories</div>
                <div className="text-sm mt-1" style={{ color:'hsl(var(--muted-text))' }}>Changes reflect live on Homepage & Products page</div>
              </div>
              <button className="btn-primary-das" onClick={()=>{ setEditCat(null); setCatForm({name:'',icon:'📦',sub:''}); setShowCatModal(true); }}>+ Add Category</button>
            </div>
            <div className="grid grid-cols-4 gap-3 mb-8">
              {categories.map(c=>(
                <div key={c.id} style={{ background:'linear-gradient(135deg,hsl(var(--navy2)) 0%,hsl(var(--navy)) 100%)', borderRadius:10, padding:'1rem', color:'#fff' }}>
                  <div style={{ fontSize:'1.8rem', marginBottom:6 }}>{c.icon}</div>
                  <div style={{ fontFamily:'var(--font-condensed)', fontWeight:700, fontSize:'0.95rem' }}>{c.name}</div>
                  <div style={{ fontSize:'0.72rem', color:'rgba(255,255,255,0.6)', marginTop:2 }}>{c.sub}</div>
                  <div style={{ fontSize:'0.72rem', color:'rgba(255,255,255,0.45)', marginTop:6 }}>{products.filter(p=>p.category===c.id).length} products</div>
                </div>
              ))}
            </div>
            <div className="data-table">
              <div className="p-4 border-b" style={{ borderColor:'hsl(var(--off2))' }}>
                <div className="font-condensed text-base font-bold" style={{ color:'hsl(var(--navy))' }}>All Categories ({categories.length})</div>
              </div>
              <table><thead><tr><th>Icon</th><th>Name</th><th>Subtitle</th><th>System ID</th><th>Products</th><th className="text-right">Actions</th></tr></thead>
                <tbody>{categories.map(cat=>(
                  <tr key={cat.id}>
                    <td style={{ fontSize:'1.5rem' }}>{cat.icon}</td>
                    <td className="font-semibold">{cat.name}</td>
                    <td style={{ color:'hsl(var(--muted-text))', fontSize:'0.83rem' }}>{cat.sub}</td>
                    <td><code style={{ background:'hsl(var(--off2))', padding:'2px 6px', borderRadius:4, fontSize:'0.78rem' }}>{cat.id}</code></td>
                    <td><span className="badge-info">{products.filter(p=>p.category===cat.id).length}</span></td>
                    <td className="text-right">
                      <div className="flex gap-2 justify-end">
                        <button className="btn-sm-das" onClick={()=>{ setEditCat(cat); setCatForm({name:cat.name,icon:cat.icon,sub:cat.sub}); setShowCatModal(true); }}>✏️ Edit</button>
                        <button className="btn-danger-das" style={{ padding:'4px 10px' }}
                          onClick={()=>{ if(confirm(`Delete "${cat.name}"?`)) saveCategories(categories.filter(c=>c.id!==cat.id)); }}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
            {showCatModal && (
              <div className="modal-overlay" onClick={e=>{ if((e.target as HTMLElement).className==='modal-overlay') setShowCatModal(false); }}>
                <div className="das-modal" style={{ maxWidth:480 }}>
                  <div className="p-6 border-b flex justify-between items-center" style={{ borderColor:'hsl(var(--off2))' }}>
                    <div className="font-condensed text-xl font-bold" style={{ color:'hsl(var(--navy))' }}>{editCat?'Edit Category':'Add Category'}</div>
                    <button className="text-2xl cursor-pointer bg-transparent border-none leading-none" onClick={()=>setShowCatModal(false)}>✕</button>
                  </div>
                  <div className="p-6">
                    <div className="flex flex-col gap-1 mb-4">
                      <label className="text-sm font-semibold" style={{ color:'hsl(var(--muted-text))' }}>Category Name *</label>
                      <input className="das-input" value={catForm.name} onChange={e=>setCatForm(f=>({...f,name:e.target.value}))} />
                    </div>
                    <div className="flex flex-col gap-1 mb-4">
                      <label className="text-sm font-semibold" style={{ color:'hsl(var(--muted-text))' }}>Subtitle</label>
                      <input className="das-input" value={catForm.sub} onChange={e=>setCatForm(f=>({...f,sub:e.target.value}))} />
                    </div>
                    <div className="flex flex-col gap-1 mb-5">
                      <label className="text-sm font-semibold mb-2" style={{ color:'hsl(var(--muted-text))' }}>Icon</label>
                      <div className="flex flex-wrap gap-2">
                        {ICONS.map(ic=>(
                          <button key={ic} onClick={()=>setCatForm(f=>({...f,icon:ic}))} style={{ fontSize:'1.4rem', padding:'6px 10px', borderRadius:8, cursor:'pointer', border:catForm.icon===ic?'2px solid hsl(var(--navy))':'2px solid hsl(var(--off2))', background:catForm.icon===ic?'hsl(var(--off2))':'transparent' }}>{ic}</button>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button className="btn-primary-das flex-1" disabled={!catForm.name.trim()} onClick={()=>{
                        let updated: Category[];
                        if(editCat?.id) { updated=categories.map(c=>c.id===editCat.id?{...c,...catForm}:c); }
                        else { const id=catForm.name.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,''); updated=[...categories,{id,...catForm}]; }
                        saveCategories(updated); setShowCatModal(false);
                      }}>{editCat?'Save Changes':'Add Category'}</button>
                      <button className="flex-1 rounded border-none cursor-pointer" style={{ background:'hsl(var(--off2))', color:'hsl(var(--muted-text))' }} onClick={()=>setShowCatModal(false)}>Cancel</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── PRODUCTS ── */}
        {tab==='products' && (
          <div>
            <div className="mb-8 flex justify-between items-start">
              <div className="font-condensed text-3xl font-bold tracking-wide" style={{ color:'hsl(var(--navy))' }}>Products</div>
              <button className="btn-primary-das" onClick={()=>{ setEditProduct({id:'',name:'',category:categories[0]?.id||'electrochemical',price:'',desc:'',inStock:true,icon:'🔬',tags:[],specs:{},imageUrl:'',variantGroups:[{name:'Configuration',options:['Standard']},{name:'Warranty',options:['1 Year']},{name:'Accessories',options:['None']},{name:'Shipping',options:['Standard']}]}); setShowProdModal(true); }}>+ Add Product</button>
            </div>
            <div className="data-table">
              <table><thead><tr>{['','Name','Category','Price','Stock','Action Type','Actions'].map(h=><th key={h}>{h}</th>)}</tr></thead>
                <tbody>{products.map(p=>(
                  <tr key={p.id}>
                    <td className="text-2xl">{p.icon}</td>
                    <td className="font-semibold">{p.name}</td>
                    <td>{categories.find(c=>c.id===p.category)?.name||p.category}</td>
                    <td>{formatINR(p.price)}</td>
                    <td><span className={p.inStock?'badge-success':'badge-danger'}>{p.inStock?'In Stock':'Out of Stock'}</span></td>
                    <td>
                      <select
                        className="das-select"
                        style={{ padding:'3px 8px', fontSize:'0.82rem', width:'auto' }}
                        value={p.actionType || 'cart'}
                        onChange={e => saveProducts(products.map(x => x.id===p.id ? {...x, actionType: e.target.value as 'cart'|'enquiry'} : x))}
                      >
                        <option value="cart">🛒 Add to Cart</option>
                        <option value="enquiry">📩 Enquiry Now</option>
                      </select>
                    </td>
                    <td><div className="flex gap-1.5">
                      <button className="btn-sm-das" onClick={()=>{ setEditProduct(p); setShowProdModal(true); }}>Edit</button>
                      <button className="btn-danger-das" onClick={()=>saveProducts(products.filter(x=>x.id!==p.id))}>Del</button>
                    </div></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
            {showProdModal && editProduct && (
              <div className="modal-overlay" onClick={e=>{ if((e.target as HTMLElement).className==='modal-overlay') setShowProdModal(false); }}>
                <div className="das-modal">
                  <div className="p-6 border-b flex justify-between items-center" style={{ borderColor:'hsl(var(--off2))' }}>
                    <div className="font-condensed text-xl font-bold" style={{ color:'hsl(var(--navy))' }}>{editProduct.id?'Edit Product':'Add Product'}</div>
                    <button className="text-2xl cursor-pointer bg-transparent border-none leading-none" onClick={()=>setShowProdModal(false)}>✕</button>
                  </div>
                  <div className="p-6" style={{ maxHeight:'75vh', overflowY:'auto' }}>

                    {/* ── Photo Upload ── */}
                    <div className="flex flex-col gap-1 mb-5">
                      <label className="text-sm font-semibold" style={{ color:'hsl(var(--muted-text))' }}>Product Photo</label>
                      {editProduct.imageUrl && (
                        <div style={{ position:'relative', width:120, height:120, marginBottom:8 }}>
                          <img src={editProduct.imageUrl} alt="Product" style={{ width:120, height:120, objectFit:'cover', borderRadius:8, border:'1px solid hsl(var(--off2))' }} />
                          <button onClick={()=>setEditProduct((p:any)=>({...p,imageUrl:''}))} style={{ position:'absolute', top:4, right:4, background:'hsl(var(--danger))', color:'#fff', border:'none', borderRadius:'50%', width:22, height:22, cursor:'pointer', fontSize:13, lineHeight:1 }}>✕</button>
                        </div>
                      )}
                      <label style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', border:'1.5px dashed hsl(var(--off2))', borderRadius:8, cursor:'pointer', fontSize:'0.9rem', color:'hsl(var(--muted-text))' }}>
                        {imageUploading ? '⏳ Uploading…' : '📷 Click to upload image'}
                        <input type="file" accept="image/*" style={{ display:'none' }} onChange={async e=>{
                          const file = e.target.files?.[0];
                          if (!file) return;
                          if (isSupabaseConfigured()) {
                            setImageUploading(true);
                            try {
                              const url = await uploadProductImage(file);
                              setEditProduct((p:any) => ({...p, imageUrl: url}));
                            } catch(err: any) {
                              console.error('Upload error:', err);
                              alert('Image upload failed:\n' + (err?.message || err));
                            } finally {
                              setImageUploading(false);
                            }
                          } else {
                            // Local fallback
                            const url = URL.createObjectURL(file);
                            setEditProduct((p:any) => ({...p, imageUrl: url}));
                          }
                        }} />
                      </label>
                    </div>

                    {/* ── Basic Fields ── */}
                    {[['Product Name','name','text'],['Price (₹)','price','number'],['Description','desc','text']].map(([l,k,t])=>(
                      <div key={k} className="flex flex-col gap-1 mb-4">
                        <label className="text-sm font-semibold" style={{ color:'hsl(var(--muted-text))' }}>{l}</label>
                        {k==='desc' ? <textarea className="das-input" rows={3} value={editProduct[k]} onChange={e=>setEditProduct((p:any)=>({...p,[k]:e.target.value}))} style={{ fontSize:'0.95rem' }} /> : <input className="das-input" type={t} value={editProduct[k]} onChange={e=>setEditProduct((p:any)=>({...p,[k]:e.target.value}))} style={{ fontSize:'0.95rem' }} />}
                      </div>
                    ))}
                    <div className="flex flex-col gap-1 mb-4">
                      <label className="text-sm font-semibold" style={{ color:'hsl(var(--muted-text))' }}>Category</label>
                      <select className="das-select" value={editProduct.category} onChange={e=>setEditProduct((p:any)=>({...p,category:e.target.value}))} style={{ fontSize:'0.95rem' }}>
                        {categories.map(c=><option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                      </select>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer mb-5" style={{ fontSize:'0.95rem' }}>
                      <input type="checkbox" checked={editProduct.inStock} onChange={e=>setEditProduct((p:any)=>({...p,inStock:e.target.checked}))} style={{ accentColor:'hsl(var(--navy))', width:16, height:16 }} />
                      In Stock
                    </label>

                    {/* ── Button Action Type ── */}
                    <div className="flex flex-col gap-1 mb-5">
                      <label className="text-sm font-semibold" style={{ color:'hsl(var(--muted-text))' }}>Button Action on Product Card</label>
                      <select className="das-select" value={editProduct.actionType || 'cart'} onChange={e=>setEditProduct((p:any)=>({...p,actionType:e.target.value}))} style={{ fontSize:'0.95rem' }}>
                        <option value="cart">🛒 Add to Cart — Customer can add directly to cart</option>
                        <option value="enquiry">📩 Enquiry Now — Customer is directed to Contact page</option>
                      </select>
                    </div>

                    {/* ── Specifications Editor ── */}
                    <div className="mb-5">
                      <div className="text-sm font-semibold mb-3" style={{ color:'hsl(var(--muted-text))' }}>Specifications (shown in product detail box)</div>
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr auto', gap:'6px', marginBottom:6 }}>
                        <span style={{ fontSize:'0.78rem', color:'hsl(var(--muted-text))', fontWeight:600 }}>Parameter</span>
                        <span style={{ fontSize:'0.78rem', color:'hsl(var(--muted-text))', fontWeight:600 }}>Value</span>
                        <span></span>
                      </div>
                      {Object.entries(editProduct.specs||{}).map(([k,v],i)=>(
                        <div key={i} style={{ display:'grid', gridTemplateColumns:'1fr 1fr auto', gap:'6px', marginBottom:6 }}>
                          <input className="das-input" style={{ fontSize:'0.9rem', padding:'5px 8px' }} defaultValue={k} onBlur={e=>{
                            const newSpecs: Record<string,string> = {};
                            Object.entries(editProduct.specs).forEach(([sk,sv],si)=>{ newSpecs[si===i?e.target.value:sk]=sv as string; });
                            setEditProduct((p:any)=>({...p,specs:newSpecs}));
                          }} />
                          <input className="das-input" style={{ fontSize:'0.9rem', padding:'5px 8px' }} defaultValue={v as string} onBlur={e=>{
                            const newSpecs = {...editProduct.specs,[k]:e.target.value};
                            setEditProduct((p:any)=>({...p,specs:newSpecs}));
                          }} />
                          <button onClick={()=>{ const s={...editProduct.specs}; delete s[k]; setEditProduct((p:any)=>({...p,specs:s})); }} style={{ background:'none', border:'1px solid hsl(var(--off2))', borderRadius:6, padding:'0 8px', cursor:'pointer', color:'hsl(var(--danger))', fontSize:14 }}>✕</button>
                        </div>
                      ))}
                      <button onClick={()=>setEditProduct((p:any)=>({...p,specs:{...p.specs,'New Parameter':'Value'}}))} style={{ fontSize:'0.88rem', padding:'5px 12px', background:'none', border:'1.5px dashed hsl(var(--off2))', borderRadius:6, cursor:'pointer', color:'hsl(var(--muted-text))' }}>+ Add Row</button>
                    </div>

                    {/* ── Variant Tabs ── */}
                    <div className="mb-5">
                      <div className="text-sm font-semibold mb-1" style={{ color:'hsl(var(--muted-text))' }}>Variant Tabs (shown above Quantity on product page)</div>
                      <div className="text-xs mb-3" style={{ color:'hsl(var(--muted-text))' }}>Each option can have a price adjustment added to the base price. Leave price as 0 for no change.</div>
                      {(editProduct.variantGroups||[]).map((grp:any, gi:number)=>(
                        <div key={gi} style={{ border:'1px solid hsl(var(--off2))', borderRadius:8, marginBottom:8, overflow:'hidden' }}>
                          <div style={{ background:'hsl(var(--off))', padding:'8px 12px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                            <input defaultValue={grp.name} onBlur={e=>{ const vg=[...(editProduct.variantGroups||[])]; vg[gi]={...vg[gi],name:e.target.value}; setEditProduct((p:any)=>({...p,variantGroups:vg})); }} style={{ background:'none', border:'none', fontWeight:600, fontSize:'0.9rem', color:'hsl(var(--navy))', padding:0, width:140 }} />
                            <button onClick={()=>{ const vg=(editProduct.variantGroups||[]).filter((_:any,i:number)=>i!==gi); setEditProduct((p:any)=>({...p,variantGroups:vg})); }} style={{ background:'none', border:'none', cursor:'pointer', color:'hsl(var(--muted-text))', fontSize:'0.82rem' }}>Remove</button>
                          </div>
                          <div style={{ padding:'10px 12px' }}>
                            {/* Existing options list */}
                            <div style={{ marginBottom:8 }}>
                              {grp.options.map((opt:any, oi:number)=>{
                                const lbl = typeof opt === 'string' ? opt : opt.label;
                                const prc = typeof opt === 'object' ? opt.price : 0;
                                return (
                                  <div key={oi} style={{ display:'flex', alignItems:'center', gap:6, marginBottom:5 }}>
                                    <span style={{ flex:1, padding:'3px 10px', border:'1px solid hsl(var(--off2))', borderRadius:999, fontSize:'0.85rem' }}>{lbl}{prc ? ` (+₹${prc})` : ''}</span>
                                    <button onClick={()=>{ const vg=[...(editProduct.variantGroups||[])]; vg[gi]={...vg[gi],options:vg[gi].options.filter((_:any,i:number)=>i!==oi)}; setEditProduct((p:any)=>({...p,variantGroups:vg})); }} style={{ background:'none', border:'none', cursor:'pointer', fontSize:13, color:'hsl(var(--muted-text))', padding:'0 4px' }}>×</button>
                                  </div>
                                );
                              })}
                            </div>
                            {/* Add new option row: label + price */}
                            <div style={{ display:'grid', gridTemplateColumns:'1fr 90px auto', gap:5 }}>
                              <input id={`opt-label-${gi}`} placeholder="Option name (e.g. Size 20)" className="das-input" style={{ fontSize:'0.85rem', padding:'4px 8px' }} />
                              <input id={`opt-price-${gi}`} placeholder="Price ₹" type="number" min="0" className="das-input" style={{ fontSize:'0.85rem', padding:'4px 8px' }} />
                              <button onClick={()=>{
                                const lInput = document.getElementById(`opt-label-${gi}`) as HTMLInputElement;
                                const pInput = document.getElementById(`opt-price-${gi}`) as HTMLInputElement;
                                const lbl = lInput?.value.trim();
                                const prc = parseInt(pInput?.value||'0')||0;
                                if(!lbl) return;
                                const newOpt = prc > 0 ? { label: lbl, price: prc } : lbl;
                                const vg=[...(editProduct.variantGroups||[])]; vg[gi]={...vg[gi],options:[...vg[gi].options,newOpt]}; setEditProduct((p:any)=>({...p,variantGroups:vg}));
                                if(lInput) lInput.value=''; if(pInput) pInput.value='';
                              }} style={{ background:'hsl(var(--navy))', color:'#fff', border:'none', borderRadius:6, padding:'4px 10px', cursor:'pointer', fontSize:'0.85rem', whiteSpace:'nowrap' }}>+ Add</button>
                            </div>
                          </div>
                        </div>
                      ))}
                      {(editProduct.variantGroups||[]).length < 4 && (
                        <button onClick={()=>{ const vg=[...(editProduct.variantGroups||[]),{name:'New Tab',options:[]}]; setEditProduct((p:any)=>({...p,variantGroups:vg})); }} style={{ fontSize:'0.88rem', padding:'5px 12px', background:'none', border:'1.5px dashed hsl(var(--off2))', borderRadius:6, cursor:'pointer', color:'hsl(var(--muted-text))' }}>+ Add Tab Group</button>
                      )}
                    </div>

                    <div className="flex gap-4">
                      <button className="btn-primary-das flex-1" style={{ fontSize:'0.95rem', padding:'10px' }} onClick={()=>{
                        if(editProduct.id){saveProducts(products.map((p:any)=>p.id===editProduct.id?{...editProduct,price:+editProduct.price}:p));}
                        else{saveProducts([...products,{...editProduct,id:'p'+Date.now(),icon:'🔬',tags:[],price:+editProduct.price}]);}
                        setShowProdModal(false);
                      }}>Save Product</button>
                      <button className="flex-1 rounded border-none cursor-pointer" style={{ background:'hsl(var(--off2))', color:'hsl(var(--muted-text))', fontSize:'0.95rem' }} onClick={()=>setShowProdModal(false)}>Cancel</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── CUSTOMERS ── */}
        {tab==='customers' && (
          <div>
            <div className="mb-8 flex justify-between items-center">
              <div>
                <div className="font-condensed text-3xl font-bold tracking-wide" style={{ color:'hsl(var(--navy))' }}>Customers</div>
                <div className="text-xs mt-1" style={{ color:'hsl(var(--muted-text))' }}>
                  {isSupabaseConfigured() ? '🟢 Live from Supabase database' : '🟡 Local browser storage'}
                </div>
              </div>
            </div>
            <div className="data-table">
              <table><thead><tr>{['Name','Email','Phone','Company','Orders','Registered'].map(h=><th key={h}>{h}</th>)}</tr></thead>
                <tbody>
                  {db.getCustomers().length === 0 && (
                    <tr><td colSpan={6} style={{ textAlign:'center', padding:'2rem', color:'hsl(var(--muted-text))' }}>No registered customers yet</td></tr>
                  )}
                  {db.getCustomers().map(c=>(
                    <tr key={c.id}>
                      <td className="font-semibold">{c.name}</td>
                      <td>{c.email}</td>
                      <td>{c.phone}</td>
                      <td>{c.company||'—'}</td>
                      <td><span className="badge-info">{orders.filter(o=>o.customerId===c.id).length}</span></td>
                      <td>{new Date(c.createdAt).toLocaleDateString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── SETTINGS ── */}
        {tab==='settings' && (
          <div>
            <div className="mb-8"><div className="font-condensed text-3xl font-bold tracking-wide" style={{ color:'hsl(var(--navy))' }}>Settings</div></div>

            {/* ── Database Status ── */}
            <div className="form-card" style={{ borderLeft: `4px solid ${isSupabaseConfigured() ? '#16a34a' : '#f59e0b'}` }}>
              <div className="form-section-title">🗄️ Database Storage</div>
              {isSupabaseConfigured() ? (
                <div className="p-3 rounded text-sm mb-4" style={{ background:'#d4edda', color:'#155724' }}>
                  ✅ <strong>Supabase connected.</strong> All orders, customers, and data are saving permanently to the cloud database. Data is safe across all browsers and devices.
                </div>
              ) : (
                <div className="p-3 rounded text-sm mb-4" style={{ background:'#fff3cd', color:'#856404' }}>
                  ⚠️ <strong>Using browser localStorage only.</strong> Data will be lost if the browser cache is cleared or on a different device. Set up Supabase below to enable permanent cloud storage.
                </div>
              )}
              <div className="text-sm font-semibold mb-3" style={{ color:'hsl(var(--muted-text))' }}>
                Supabase — Free PostgreSQL Database Setup (5 minutes)
              </div>
              <div style={{ lineHeight:2, fontSize:'0.88rem', color:'hsl(var(--muted-text))', marginBottom:16 }}>
                <div>1. Go to <strong>supabase.com</strong> → "Start for free" (no credit card)</div>
                <div>2. Create a new project → choose any region</div>
                <div>3. Go to <strong>Project Settings → API</strong></div>
                <div>4. Copy <strong>Project URL</strong> → add to <code>.env</code> as <code>VITE_SUPABASE_URL</code></div>
                <div>5. Copy <strong>anon/public key</strong> → add to <code>.env</code> as <code>VITE_SUPABASE_ANON_KEY</code></div>
                <div>6. Open <strong>SQL Editor</strong> in Supabase → paste and run the SQL from <code>SUPABASE_SETUP.sql</code> (included in your project)</div>
                <div>7. Rebuild → all data saves permanently to cloud ✅</div>
              </div>
              <div className="flex flex-col gap-1 mb-3">
                <label className="text-sm font-semibold" style={{ color:'hsl(var(--muted-text))' }}>VITE_SUPABASE_URL</label>
                <input className="das-input" placeholder="https://xxxxxxxxxxxx.supabase.co" readOnly style={{ background:'hsl(var(--off2))', color: isSupabaseConfigured() ? '#155724' : undefined }} defaultValue={isSupabaseConfigured() ? '✅ Configured' : ''} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold" style={{ color:'hsl(var(--muted-text))' }}>VITE_SUPABASE_ANON_KEY</label>
                <input className="das-input" type="password" placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9…" readOnly style={{ background:'hsl(var(--off2))' }} defaultValue={isSupabaseConfigured() ? 'configured' : ''} />
              </div>
            </div>
            <div className="form-card">
              <div className="form-section-title">Company Details</div>
              {[['Company Name','DAS Instruments & Solutions'],['Email','info@dasinstruments.in'],['Phone','+91 88072 43902'],['GST Number','33AAAAA0000A1Z5']].map(([l,v])=>(
                <div key={l} className="flex flex-col gap-1 mb-4">
                  <label className="text-sm font-semibold" style={{ color:'hsl(var(--muted-text))' }}>{l}</label>
                  <input className="das-input" defaultValue={v} />
                </div>
              ))}
              <button className="btn-primary-das mt-2">Save Changes</button>
            </div>
            <div className="form-card">
              <div className="form-section-title">Razorpay Integration</div>
              <div className="mb-3 p-3 rounded text-sm" style={{ background:'#fff3cd', color:'#856404' }}>⚠️ Set VITE_RAZORPAY_KEY_ID in your .env file. Never hardcode keys here.</div>
              <div className="flex flex-col gap-1 mb-4">
                <label className="text-sm font-semibold" style={{ color:'hsl(var(--muted-text))' }}>Razorpay Key ID</label>
                <input className="das-input" type="password" placeholder="rzp_live_…" />
              </div>
              <div className="flex flex-col gap-1 mb-4">
                <label className="text-sm font-semibold" style={{ color:'hsl(var(--muted-text))' }}>Webhook Secret</label>
                <input className="das-input" type="password" placeholder="whsec_…" />
              </div>
              <button className="btn-primary-das">Update</button>
            </div>

            {/* ── Admin Credentials — FULLY FUNCTIONAL ── */}
            <div className="form-card">
              <div className="form-section-title">Change Admin Credentials</div>
              {credMsg.text && (
                <div className="mb-4 p-3 rounded text-sm" style={{ background: credMsg.type==='success'?'#d4edda':'#f8d7da', color: credMsg.type==='success'?'#155724':'hsl(var(--danger))' }}>
                  {credMsg.type==='success'?'✅':'⚠️'} {credMsg.text}
                </div>
              )}
              <div className="flex flex-col gap-1 mb-4">
                <label className="text-sm font-semibold" style={{ color:'hsl(var(--muted-text))' }}>Current Password *</label>
                <input className="das-input" type="password" placeholder="Enter current password to verify" value={credForm.currentPwd} onChange={e=>setCredForm(f=>({...f,currentPwd:e.target.value}))} />
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold" style={{ color:'hsl(var(--muted-text))' }}>New Username (leave blank to keep)</label>
                  <input className="das-input" placeholder={db.getAdminCreds().username} value={credForm.newUsername} onChange={e=>setCredForm(f=>({...f,newUsername:e.target.value}))} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold" style={{ color:'hsl(var(--muted-text))' }}>New Password (leave blank to keep)</label>
                  <input className="das-input" type="password" placeholder="Min 6 characters" value={credForm.newPwd} onChange={e=>setCredForm(f=>({...f,newPwd:e.target.value}))} />
                </div>
              </div>
              <div className="flex flex-col gap-1 mb-4">
                <label className="text-sm font-semibold" style={{ color:'hsl(var(--muted-text))' }}>Confirm New Password</label>
                <input className="das-input" type="password" placeholder="Repeat new password" value={credForm.confirmPwd} onChange={e=>setCredForm(f=>({...f,confirmPwd:e.target.value}))} />
              </div>
              <button className="btn-primary-das" onClick={handleChangeCreds}>Update Credentials</button>
            </div>

            {/* Email Notifications */}
            <div className="form-card">
              <div className="form-section-title">📧 Automatic Order Emails</div>
              <div className="p-3 rounded text-sm mb-4" style={{ background:'#d4edda', color:'#155724' }}>
                ✅ <strong>Invoice emails are already built-in.</strong> When a customer places an order, a professional HTML invoice is automatically generated and sent to their email.
              </div>
              <div className="mb-4 p-3 rounded text-sm" style={{ background:'#e8f4fd', color:'#0c4a6e' }}>
                <strong>Current method:</strong> Mail client fallback — the customer's email app opens pre-filled with the invoice. Works with zero configuration.<br/><br/>
                <strong>To send fully automatically</strong> (no click needed), add your <strong>Resend</strong> API key to <code>.env</code>:
              </div>
              <div className="flex flex-col gap-1 mb-4">
                <label className="text-sm font-semibold" style={{ color:'hsl(var(--muted-text))' }}>Resend API Key <span style={{ fontWeight:400 }}>(free — 3,000 emails/month at resend.com)</span></label>
                <input className="das-input" type="password" placeholder="re_xxxxxxxxxxxxxxxx  →  paste into .env as VITE_RESEND_API_KEY" readOnly />
              </div>
              <div className="flex flex-col gap-1 mb-4">
                <label className="text-sm font-semibold" style={{ color:'hsl(var(--muted-text))' }}>From Email <span style={{ fontWeight:400 }}>(verified domain on Resend)</span></label>
                <input className="das-input" placeholder="orders@dasinstruments.in  →  paste into .env as VITE_RESEND_FROM_EMAIL" readOnly />
              </div>
              <div style={{ lineHeight:1.9, fontSize:'0.88rem', color:'hsl(var(--muted-text))' }}>
                <div><strong>Setup (5 min):</strong></div>
                <div>1. Sign up free at <strong>resend.com</strong></div>
                <div>2. Add & verify your domain (e.g. dasinstruments.in)</div>
                <div>3. Create an API key → copy it</div>
                <div>4. Add to <code>.env</code>: <code>VITE_RESEND_API_KEY=re_xxx</code></div>
                <div>5. Add to <code>.env</code>: <code>VITE_RESEND_FROM_EMAIL=orders@dasinstruments.in</code></div>
                <div>6. Rebuild &amp; deploy — emails send automatically on every order ✅</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
