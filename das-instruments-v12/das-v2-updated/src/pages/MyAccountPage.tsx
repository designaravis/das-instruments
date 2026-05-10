import { useState } from "react";
import { db, StoredOrder } from "@/lib/db";
import { formatINR } from "@/lib/store";

interface Props { setPage: (p: string) => void; onLogout: () => void; }

const MyAccountPage = ({ setPage, onLogout }: Props) => {
  const getCustomer = () => {
    try { return JSON.parse(sessionStorage.getItem('das_customer') || 'null'); } catch { return null; }
  };
  const session = getCustomer();
  const customer = session ? db.getCustomers().find(c => c.id === session.id) : null;

  const [tab, setTab] = useState('orders');
  const [profileForm, setProfileForm] = useState({
    name:    customer?.name    || '',
    phone:   customer?.phone   || '',
    company: customer?.company || '',
    address: customer?.address || '',
    city:    customer?.city    || '',
    state:   customer?.state   || '',
    pincode: customer?.pincode || '',
    gst:     customer?.gst     || '',
  });
  const [pwdForm, setPwdForm] = useState({ current:'', newPwd:'', confirm:'' });
  const [msg, setMsg] = useState({ type:'', text:'' });

  const orders: StoredOrder[] = customer ? db.getOrdersByCustomer(customer.id) : [];

  const statusColor: Record<string,string> = {
    delivered:'badge-success', processing:'badge-info', shipped:'badge-warn', pending:'badge-danger'
  };

  const saveProfile = () => {
    if (!customer) return;
    db.updateCustomerProfile(customer.id, profileForm);
    // update session name
    const sess = getCustomer();
    sessionStorage.setItem('das_customer', JSON.stringify({ ...sess, name: profileForm.name }));
    setMsg({ type:'success', text:'Profile updated successfully.' });
    setTimeout(() => setMsg({type:'',text:''}), 3000);
  };

  const changePassword = () => {
    if (!customer) return;
    if (!pwdForm.current)  { setMsg({ type:'error', text:'Enter current password.' }); return; }
    if (pwdForm.newPwd.length < 6) { setMsg({ type:'error', text:'New password must be 6+ characters.' }); return; }
    if (pwdForm.newPwd !== pwdForm.confirm) { setMsg({ type:'error', text:'Passwords do not match.' }); return; }
    const res = db.changeCustomerPassword(customer.id, pwdForm.current, pwdForm.newPwd);
    if (res.ok) { setMsg({ type:'success', text:'Password changed successfully.' }); setPwdForm({current:'',newPwd:'',confirm:''}); }
    else        { setMsg({ type:'error', text: res.error || 'Failed.' }); }
    setTimeout(() => setMsg({type:'',text:''}), 3000);
  };

  if (!customer) return (
    <div className="py-20 px-8 max-w-[600px] mx-auto text-center">
      <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>🔒</div>
      <div className="font-condensed text-2xl font-bold mb-3" style={{ color:'hsl(var(--navy))' }}>Not signed in</div>
      <button className="btn-primary-das" onClick={() => setPage('login')}>Sign In</button>
    </div>
  );

  const tabs = [
    { id:'orders',  label:'My Orders',   icon:'📦' },
    { id:'profile', label:'Profile',      icon:'👤' },
    { id:'security',label:'Security',     icon:'🔒' },
  ];

  return (
    <div>
      <div className="page-hero">
        <h1 className="font-condensed text-4xl font-bold tracking-wide">My Account</h1>
        <div className="mt-2" style={{ color:'rgba(255,255,255,0.7)' }}>Welcome, {customer.name}</div>
      </div>

      <div className="py-12 px-8 max-w-[1100px] mx-auto">
        <div className="grid gap-8" style={{ gridTemplateColumns:'220px 1fr' }}>
          {/* Sidebar */}
          <div>
            <div className="form-card" style={{ padding:'1.25rem' }}>
              <div style={{ textAlign:'center', marginBottom:'1rem' }}>
                <div style={{ width:64, height:64, borderRadius:'50%', background:'hsl(var(--navy))', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-condensed)', fontWeight:700, fontSize:'1.5rem', margin:'0 auto 0.75rem' }}>
                  {customer.name.charAt(0).toUpperCase()}
                </div>
                <div className="font-semibold text-sm">{customer.name}</div>
                <div className="text-xs" style={{ color:'hsl(var(--muted-text))' }}>{customer.email}</div>
              </div>
              {tabs.map(t=>(
                <div key={t.id} onClick={()=>setTab(t.id)} style={{
                  padding:'0.6rem 0.9rem', borderRadius:8, cursor:'pointer', marginBottom:4, display:'flex', gap:8, alignItems:'center',
                  background: tab===t.id ? 'hsl(var(--off2))' : 'transparent',
                  color: tab===t.id ? 'hsl(var(--navy))' : 'hsl(var(--muted-text))',
                  fontWeight: tab===t.id ? 600 : 400, fontSize:'0.88rem'
                }}>
                  <span>{t.icon}</span>{t.label}
                </div>
              ))}
              <div style={{ borderTop:'1px solid hsl(var(--off2))', marginTop:'1rem', paddingTop:'1rem' }}>
                <button onClick={onLogout} style={{ width:'100%', background:'transparent', border:'1px solid hsl(var(--off2))', color:'hsl(var(--danger))', borderRadius:6, padding:'0.5rem', cursor:'pointer', fontSize:'0.85rem', fontWeight:600 }}>
                  🚪 Sign Out
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div>
            {msg.text && (
              <div className="mb-4 p-3 rounded text-sm" style={{ background: msg.type==='success'?'#d4edda':'#f8d7da', color: msg.type==='success'?'#155724':'hsl(var(--danger))' }}>
                {msg.type==='success'?'✅':'⚠️'} {msg.text}
              </div>
            )}

            {/* ORDERS */}
            {tab==='orders' && (
              <div>
                <div className="font-condensed text-2xl font-bold mb-5" style={{ color:'hsl(var(--navy))' }}>My Orders</div>
                {orders.length === 0 ? (
                  <div className="form-card text-center" style={{ padding:'3rem' }}>
                    <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>🛒</div>
                    <div className="font-condensed text-xl font-bold mb-2" style={{ color:'hsl(var(--navy))' }}>No orders yet</div>
                    <div className="text-sm mb-4" style={{ color:'hsl(var(--muted-text))' }}>Browse our products and place your first order</div>
                    <button className="btn-primary-das" onClick={()=>setPage('products')}>Browse Products</button>
                  </div>
                ) : (
                  <div className="data-table">
                    <table><thead><tr>{['Order ID','Items','Total','Payment','Status','Date'].map(h=><th key={h}>{h}</th>)}</tr></thead>
                      <tbody>{orders.map(o=>(
                        <tr key={o.id}>
                          <td className="font-semibold" style={{ fontSize:'0.78rem', color:'hsl(var(--steel))' }}>{o.id}</td>
                          <td className="text-xs">
                            {o.items?.length ? o.items.map(i=><div key={i.id}>{i.icon} {i.name} ×{i.qty}</div>) : <span>{o.product}</span>}
                          </td>
                          <td className="font-semibold">{formatINR(o.grandTotal)}</td>
                          <td className="text-xs">
                            <div>{o.paymentMethod}</div>
                            {o.paymentId && <div style={{ color:'hsl(var(--success))', fontSize:'0.7rem' }}>✓ Paid</div>}
                            {!o.paymentId && <div style={{ color:'hsl(var(--danger))', fontSize:'0.7rem' }}>⏳ Pending</div>}
                          </td>
                          <td><span className={statusColor[o.status]||'badge-info'}>{o.status.charAt(0).toUpperCase()+o.status.slice(1)}</span></td>
                          <td>{o.date}</td>
                        </tr>
                      ))}</tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* PROFILE */}
            {tab==='profile' && (
              <div>
                <div className="font-condensed text-2xl font-bold mb-5" style={{ color:'hsl(var(--navy))' }}>Profile Details</div>
                <div className="form-card">
                  <div className="form-section-title">Personal Information</div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {[['Full Name','name','text'],['Phone','phone','tel'],['Company / Institution','company','text'],['GST Number (optional)','gst','text']].map(([l,k,t])=>(
                      <div key={k} className="flex flex-col gap-1">
                        <label className="text-xs font-semibold" style={{ color:'hsl(var(--muted-text))' }}>{l}</label>
                        <input className="das-input" type={t} value={(profileForm as any)[k]} onChange={e=>setProfileForm(f=>({...f,[k]:e.target.value}))} />
                      </div>
                    ))}
                  </div>
                  <div className="form-section-title">Default Shipping Address</div>
                  <div className="flex flex-col gap-1 mb-4">
                    <label className="text-xs font-semibold" style={{ color:'hsl(var(--muted-text))' }}>Address</label>
                    <textarea className="das-input" rows={2} value={profileForm.address} onChange={e=>setProfileForm(f=>({...f,address:e.target.value}))} />
                  </div>
                  <div className="grid grid-cols-3 gap-4 mb-2">
                    {[['City','city'],['State','state'],['PIN Code','pincode']].map(([l,k])=>(
                      <div key={k} className="flex flex-col gap-1">
                        <label className="text-xs font-semibold" style={{ color:'hsl(var(--muted-text))' }}>{l}</label>
                        <input className="das-input" value={(profileForm as any)[k]} onChange={e=>setProfileForm(f=>({...f,[k]:e.target.value}))} />
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <div className="text-xs mb-2" style={{ color:'hsl(var(--muted-text))' }}>
                      📧 Email: <strong>{customer.email}</strong> (cannot be changed)
                    </div>
                    <button className="btn-primary-das" onClick={saveProfile}>Save Profile</button>
                  </div>
                </div>
              </div>
            )}

            {/* SECURITY */}
            {tab==='security' && (
              <div>
                <div className="font-condensed text-2xl font-bold mb-5" style={{ color:'hsl(var(--navy))' }}>Security</div>
                <div className="form-card">
                  <div className="form-section-title">Change Password</div>
                  {[['Current Password','current','password'],['New Password (min 6)','newPwd','password'],['Confirm New Password','confirm','password']].map(([l,k,t])=>(
                    <div key={k} className="flex flex-col gap-1 mb-4">
                      <label className="text-xs font-semibold" style={{ color:'hsl(var(--muted-text))' }}>{l}</label>
                      <input className="das-input" type={t} value={(pwdForm as any)[k]} onChange={e=>setPwdForm(f=>({...f,[k]:e.target.value}))} />
                    </div>
                  ))}
                  <button className="btn-primary-das" onClick={changePassword}>Change Password</button>
                </div>
                <div className="form-card">
                  <div className="form-section-title">Account Info</div>
                  <div className="text-sm" style={{ lineHeight:2, color:'hsl(var(--muted-text))' }}>
                    <div>Account ID: <code style={{ background:'hsl(var(--off2))', padding:'1px 6px', borderRadius:4 }}>{customer.id}</code></div>
                    <div>Registered: <strong>{new Date(customer.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })}</strong></div>
                    <div>Email: <strong>{customer.email}</strong></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyAccountPage;
