import { useState, useEffect } from "react";
import { CartItem, formatINR } from "@/lib/store";
import { db, StoredOrder } from "@/lib/db";
import { sendOrderConfirmationToCustomer, sendNewOrderAlertToAdmin } from "@/lib/email";

declare global { interface Window { Razorpay: any; } }

interface Props {
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  setPage: (page: string) => void;
}
type PaymentMethod = 'razorpay' | 'neft' | 'cheque';

function loadRazorpayScript(): Promise<boolean> {
  return new Promise(resolve => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

const CheckoutPage = ({ cart, setCart, setPage }: Props) => {
  const [step, setStep] = useState(1);
  const [payMethod, setPayMethod] = useState<PaymentMethod>('razorpay');
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState('');

  // Pre-fill from logged-in customer
  const getLoggedCustomer = () => {
    try { return JSON.parse(sessionStorage.getItem('das_customer') || 'null'); } catch { return null; }
  };
  const loggedCustomer = getLoggedCustomer();

  const [form, setForm] = useState({
    name:    loggedCustomer?.name  || '',
    email:   loggedCustomer?.email || '',
    phone:   '', company: '',
    address: '', city: '', state: 'Tamil Nadu', pincode: '', gst: ''
  });

  const total  = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const gstAmt = Math.round(total * 0.18);
  const grand  = total + gstAmt;

  const upd = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  useEffect(() => { loadRazorpayScript(); }, []);

  // ── Build & persist the order ─────────────────────────────────
  const persistOrder = (paymentId: string | null, method: string) => {
    const orderId = 'ORD-' + Date.now();
    const order: StoredOrder = {
      id:          orderId,
      customer:    form.name,
      email:       form.email,
      product:     cart.map(i => `${i.name} ×${i.qty}`).join(', ').substring(0, 80),
      amount:      grand,
      status:      method === 'razorpay' ? 'processing' : 'pending',
      date:        new Date().toISOString().split('T')[0],
      items:       cart.map(i => ({ id: i.id, name: i.name, icon: i.icon, price: i.price, qty: i.qty })),
      customerId:  loggedCustomer?.id || null,
      paymentMethod: method,
      paymentId,
      shippingAddress: `${form.address}, ${form.city}, ${form.state} - ${form.pincode}`,
      gst:         form.gst,
      subtotal:    total,
      gstAmount:   gstAmt,
      grandTotal:  grand,
    };
    db.saveOrderFull(order, form.phone, form.company);

    // Send emails (silently fails if EmailJS not configured yet)
    const emailData = {
      orderId, customerName: form.name, customerEmail: form.email,
      phone: form.phone, company: form.company,
      items: cart.map(i => ({ name: i.name, qty: i.qty, price: i.price })),
      subtotal: total, gstAmount: gstAmt, grandTotal: grand,
      shippingAddress: order.shippingAddress,
      paymentMethod: method, paymentId,
    };
    sendOrderConfirmationToCustomer(emailData);
    sendNewOrderAlertToAdmin(emailData);

    // Save to sessionStorage for success page
    sessionStorage.setItem('das_last_order', JSON.stringify({ orderId, paymentId, amount: grand, customer: form.name, email: form.email }));
  };

  // ── Razorpay flow ─────────────────────────────────────────────
  const handleRazorpay = async () => {
    setPaying(true); setPayError('');
    const loaded = await loadRazorpayScript();
    if (!loaded) { setPayError('Could not load Razorpay. Check internet connection.'); setPaying(false); return; }

    const options = {
      key: (import.meta as any).env?.VITE_RAZORPAY_KEY_ID || 'rzp_test_YOUR_KEY_HERE',
      amount: grand * 100,
      currency: 'INR',
      name: 'DAS Instruments & Solutions',
      description: cart.map(i => `${i.name} ×${i.qty}`).join(', ').substring(0, 255),
      prefill: { name: form.name, email: form.email, contact: form.phone },
      notes: { company: form.company, gst: form.gst, address: form.address },
      theme: { color: '#B11B1B' },
      handler: (response: any) => {
        // ── Razorpay signature verification ──────────────────────
        // In a real production app you MUST verify on a server:
        //   POST /api/verify-payment with { razorpay_payment_id, razorpay_order_id, razorpay_signature }
        //   Server checks: HMAC-SHA256(order_id + "|" + payment_id, key_secret) === signature
        //
        // For now we record the payment_id and mark order as "processing".
        // IMPORTANT: add server verification before shipping high-value goods.
        persistOrder(response.razorpay_payment_id, 'razorpay');
        setCart([]);
        setPage('order-success');
        setPaying(false);
      },
      modal: { ondismiss: () => setPaying(false) }
    };
    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', (r: any) => {
      setPayError(`Payment failed: ${r.error.description}`);
      setPaying(false);
    });
    rzp.open();
  };

  const placeOfflineOrder = () => {
    persistOrder(null, payMethod);
    setCart([]);
    setPage('order-success');
  };

  const handleConfirm = () => {
    if (payMethod === 'razorpay') handleRazorpay(); else placeOfflineOrder();
  };

  const paymentMethods = [
    { id: 'razorpay' as PaymentMethod, label: 'Online Payment (Razorpay)', sub: 'Card, UPI, NetBanking — instant', badge: '✅ Recommended' },
    { id: 'neft'     as PaymentMethod, label: 'Bank Transfer (NEFT / RTGS)', sub: 'Details emailed — 1–2 day processing', badge: null },
    { id: 'cheque'   as PaymentMethod, label: 'Cheque / Demand Draft',       sub: 'Payable to DAS Instruments, Chennai', badge: null },
  ];

  return (
    <div>
      <div className="page-hero">
        <h1 className="font-condensed text-4xl font-bold tracking-wide">Checkout</h1>
        <div className="flex justify-center gap-8 mt-4 flex-wrap">
          {['Shipping','Payment','Confirm'].map((s, i) => (
            <div key={s} className="flex items-center gap-1.5 text-sm" style={{ color: step > i ? 'hsl(var(--gold2))' : 'rgba(255,255,255,0.4)', fontWeight: step === i+1 ? 700 : 400 }}>
              <span className="w-6 h-6 rounded-full inline-flex items-center justify-center text-xs font-bold" style={{
                background: step === i+1 ? 'hsl(var(--gold))' : step > i+1 ? 'hsl(var(--gold2))' : 'rgba(255,255,255,0.2)',
                color: step >= i+1 ? 'hsl(var(--navy))' : 'rgba(255,255,255,0.4)'
              }}>{step > i+1 ? '✓' : i+1}</span>
              {s}
            </div>
          ))}
        </div>
      </div>

      <div className="py-16 px-8 max-w-[1200px] mx-auto">
        <div className="grid gap-8" style={{ gridTemplateColumns:'1fr 340px' }}>
          <div>

            {/* STEP 1 */}
            {step === 1 && (
              <div>
                <div className="form-card">
                  <div className="form-section-title">Shipping Details</div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {[['Full Name *','Dr. Ramesh Kumar','name'],['Email *','you@email.com','email']].map(([l,p,k])=>(
                      <div key={k} className="flex flex-col gap-1">
                        <label className="text-xs font-semibold" style={{ color:'hsl(var(--muted-text))' }}>{l}</label>
                        <input className="das-input" placeholder={p} value={(form as any)[k]} onChange={upd(k)} />
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {[['Phone *','+91 99999 99999','phone'],['Company / Institution','IIT Madras / BPCL','company']].map(([l,p,k])=>(
                      <div key={k} className="flex flex-col gap-1">
                        <label className="text-xs font-semibold" style={{ color:'hsl(var(--muted-text))' }}>{l}</label>
                        <input className="das-input" placeholder={p} value={(form as any)[k]} onChange={upd(k)} />
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col gap-1 mb-4">
                    <label className="text-xs font-semibold" style={{ color:'hsl(var(--muted-text))' }}>Delivery Address *</label>
                    <textarea className="das-input" rows={2} placeholder="Street, Building, Department…" value={form.address} onChange={upd('address')} style={{ resize:'vertical' }} />
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold" style={{ color:'hsl(var(--muted-text))' }}>City</label>
                      <input className="das-input" placeholder="Chennai" value={form.city} onChange={upd('city')} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold" style={{ color:'hsl(var(--muted-text))' }}>State</label>
                      <select className="das-select" value={form.state} onChange={upd('state')}>
                        {['Andhra Pradesh','Assam','Bihar','Chhattisgarh','Delhi','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Odisha','Punjab','Rajasthan','Tamil Nadu','Telangana','Uttar Pradesh','West Bengal'].map(st=>(
                          <option key={st}>{st}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold" style={{ color:'hsl(var(--muted-text))' }}>PIN Code</label>
                      <input className="das-input" placeholder="600001" value={form.pincode} onChange={upd('pincode')} maxLength={6} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold" style={{ color:'hsl(var(--muted-text))' }}>GST Number (optional)</label>
                      <input className="das-input" placeholder="29AAAAA0000A1Z5" value={form.gst} onChange={upd('gst')} />
                    </div>
                  </div>
                </div>
                <button className="btn-primary-das py-3 px-8 text-base" onClick={()=>setStep(2)}
                  disabled={!form.name||!form.email||!form.phone||!form.address}>
                  Continue to Payment →
                </button>
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <div>
                <div className="form-card">
                  <div className="form-section-title">Payment Method</div>
                  {paymentMethods.map(m => (
                    <label key={m.id} className="flex items-start gap-3 p-4 border rounded-lg mb-3 cursor-pointer" style={{
                      borderColor: payMethod===m.id ? 'hsl(var(--navy))' : 'hsl(var(--off2))',
                      background:  payMethod===m.id ? '#f0f4ff' : '#fff',
                      boxShadow:   payMethod===m.id ? '0 0 0 2px hsl(var(--navy) / 0.15)' : 'none'
                    }}>
                      <input type="radio" name="pay" checked={payMethod===m.id} onChange={()=>setPayMethod(m.id)} style={{ accentColor:'hsl(var(--navy))', marginTop:2 }} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm">{m.label}</span>
                          {m.badge && <span style={{ background:'#d4edda', color:'#155724', fontSize:'0.7rem', padding:'1px 8px', borderRadius:20, fontWeight:700 }}>{m.badge}</span>}
                        </div>
                        <div className="text-xs mt-0.5" style={{ color:'hsl(var(--muted-text))' }}>{m.sub}</div>
                      </div>
                    </label>
                  ))}
                  {payMethod==='razorpay' && (
                    <div className="mt-4 p-3 rounded-lg" style={{ background:'hsl(var(--off2))' }}>
                      <div className="text-xs font-semibold mb-2" style={{ color:'hsl(var(--muted-text))' }}>Accepted via Razorpay</div>
                      <div className="flex flex-wrap gap-2">
                        {['💳 Visa/Mastercard','🏦 NetBanking','📱 UPI/GPay','💰 Wallets'].map(b=>(
                          <span key={b} style={{ background:'#fff', border:'1px solid hsl(var(--off2))', borderRadius:6, padding:'3px 10px', fontSize:'0.78rem' }}>{b}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {payMethod==='neft' && (
                    <div className="mt-4 p-4 rounded-lg text-sm" style={{ background:'#fff3cd', color:'#856404' }}>
                      <div className="font-semibold mb-2">Bank Transfer Details (will be emailed)</div>
                      <div style={{ lineHeight:1.8 }}>
                        <div>Bank: <strong>Axis bank</strong></div>
                        <div>A/C Name: <strong>DAS Instruments and Solutions</strong></div>
                        <div>A/C No: <strong>918020013582748</strong></div>
                        <div>IFSC: <strong>UTIB0000082</strong></div>
                      </div>
                      <div className="mt-2 text-xs">Use your Order ID as reference. Order processed after payment confirmation.</div>
                    </div>
                  )}
                </div>
                <div className="flex gap-4">
                  <button className="py-3 px-6 rounded border cursor-pointer" style={{ color:'hsl(var(--navy))', borderColor:'hsl(var(--off2))', background:'transparent' }} onClick={()=>setStep(1)}>← Back</button>
                  <button className="btn-primary-das py-3 px-8 text-base" onClick={()=>setStep(3)}>Review Order →</button>
                </div>
              </div>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <div>
                <div className="form-card">
                  <div className="form-section-title">Order Review</div>
                  <div className="mb-4 pb-4" style={{ borderBottom:'1px solid hsl(var(--off2))' }}>
                    <div className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color:'hsl(var(--muted-text))' }}>Shipping To</div>
                    <div className="text-sm" style={{ lineHeight:1.8 }}>
                      <div className="font-semibold">{form.name}</div>
                      <div>{form.email} · {form.phone}</div>
                      {form.company && <div>{form.company}</div>}
                      <div>{form.address}</div>
                      <div>{form.city}, {form.state} – {form.pincode}</div>
                      {form.gst && <div>GST: {form.gst}</div>}
                    </div>
                    <button className="text-xs font-semibold mt-2" style={{ color:'hsl(var(--navy))', background:'none', border:'none', cursor:'pointer', padding:0 }} onClick={()=>setStep(1)}>Edit ✏️</button>
                  </div>
                  <div className="mb-4">
                    <div className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color:'hsl(var(--muted-text))' }}>Payment</div>
                    <div className="text-sm font-semibold">{paymentMethods.find(m=>m.id===payMethod)?.label}</div>
                    <button className="text-xs font-semibold mt-1" style={{ color:'hsl(var(--navy))', background:'none', border:'none', cursor:'pointer', padding:0 }} onClick={()=>setStep(2)}>Change ✏️</button>
                  </div>
                  <div>
                    <div className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color:'hsl(var(--muted-text))' }}>Items</div>
                    {cart.map(i=>(
                      <div key={i.id} className="flex justify-between py-1.5 text-sm">
                        <span>{i.icon} {i.name} ×{i.qty}</span>
                        <span className="font-semibold">{formatINR(i.price*i.qty)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {payError && <div className="mb-4 p-3 rounded-lg text-sm" style={{ background:'#f8d7da', color:'hsl(var(--danger))' }}>⚠️ {payError}</div>}
                <div className="flex gap-4">
                  <button className="py-3 px-6 rounded border cursor-pointer" style={{ color:'hsl(var(--navy))', borderColor:'hsl(var(--off2))', background:'transparent' }} onClick={()=>setStep(2)}>← Back</button>
                  <button className="btn-success-das py-3 px-8 text-base" onClick={handleConfirm} disabled={paying} style={{ opacity:paying?0.7:1 }}>
                    {paying ? '⏳ Opening payment…' : payMethod==='razorpay' ? `💳 Pay ${formatINR(grand)} with Razorpay` : '✓ Confirm & Place Order'}
                  </button>
                </div>
                {payMethod==='razorpay' && <div className="mt-3 text-xs" style={{ color:'hsl(var(--muted-text))' }}>🔒 Secured by Razorpay · 256-bit SSL · PCI DSS compliant</div>}
              </div>
            )}
          </div>

          {/* Summary sidebar */}
          <div className="order-summary">
            <div className="font-condensed text-base font-bold mb-4" style={{ color:'hsl(var(--navy))' }}>Order Summary</div>
            {cart.map(i=>(
              <div key={i.id} className="flex justify-between py-2 text-sm border-b" style={{ borderColor:'hsl(var(--off2))' }}>
                <div>
                  <div className="font-medium">{i.icon} {i.name.substring(0,24)}{i.name.length>24?'…':''}</div>
                  <div className="text-xs" style={{ color:'hsl(var(--muted-text))' }}>Qty: {i.qty} × {formatINR(i.price)}</div>
                </div>
                <span className="font-semibold ml-2">{formatINR(i.price*i.qty)}</span>
              </div>
            ))}
            <div className="flex justify-between py-2 text-sm border-b mt-1" style={{ borderColor:'hsl(var(--off2))' }}><span>Subtotal</span><span>{formatINR(total)}</span></div>
            <div className="flex justify-between py-2 text-sm border-b" style={{ borderColor:'hsl(var(--off2))' }}><span>GST @ 18%</span><span>{formatINR(gstAmt)}</span></div>
            <div className="flex justify-between py-2 text-sm border-b" style={{ borderColor:'hsl(var(--off2))' }}><span>Shipping</span><span className="font-semibold" style={{ color:'hsl(var(--success))' }}>FREE</span></div>
            <div className="flex justify-between pt-4 font-bold text-lg" style={{ borderTop:'2px solid hsl(var(--navy))', marginTop:4 }}>
              <span>Total</span><span style={{ color:'hsl(var(--navy))' }}>{formatINR(grand)}</span>
            </div>
            <div className="mt-4 text-xs p-3 rounded" style={{ background:'hsl(var(--off2))', color:'hsl(var(--muted-text))', lineHeight:1.7 }}>
              🚚 Delivery in 5–7 business days<br/>
              📄 GST invoice included
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
