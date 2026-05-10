interface Props { setPage: (page: string) => void; }

const OrderSuccessPage = ({ setPage }: Props) => {
  // Read order details saved by CheckoutPage
  let order: any = null;
  try {
    const raw = sessionStorage.getItem('das_last_order');
    if (raw) order = JSON.parse(raw);
  } catch {}

  const orderId   = order?.orderId   || ('ORD-' + String(Math.floor(Math.random() * 9000 + 1000)));
  const paymentId = order?.paymentId || null;
  const amount    = order?.amount    || 0;
  const email     = order?.email     || '';

  return (
    <div className="py-20 px-8 max-w-[1200px] mx-auto">
      <div className="success-box">
        <div className="success-icon">✓</div>
        <div className="font-condensed text-3xl font-bold mb-2" style={{ color: 'hsl(var(--success))' }}>
          Order Confirmed!
        </div>
        <div className="font-condensed text-lg font-semibold mb-4" style={{ color: 'hsl(var(--navy))' }}>
          {orderId}
        </div>
        <div className="text-base leading-relaxed mb-5" style={{ color: 'hsl(var(--muted-text))' }}>
          Thank you for your purchase! Your order has been received and is being processed.
          {email && <> A confirmation has been sent to <strong>{email}</strong>.</>}
        </div>

        {paymentId && (
          <div className="rounded-lg p-3 mb-4 text-sm text-left" style={{ background: '#d4edda', color: '#155724' }}>
            ✅ Payment successful · <strong>ID: {paymentId}</strong>
          </div>
        )}

        <div className="rounded-lg p-4 text-sm leading-relaxed mb-6 text-left" style={{ background: 'hsl(var(--off))', color: 'hsl(var(--muted-text))' }}>
          <div className="font-semibold mb-2" style={{ color: 'hsl(var(--navy))' }}>What happens next?</div>
          <div>📦 Order processing: <strong>1–2 business days</strong></div>
          <div>🚚 Expected delivery: <strong>5–7 business days</strong></div>
          <div>📧 Confirmation email + invoice sent to your email</div>
          <div>📞 Support queries: <strong>+91 88072 43902</strong></div>
        </div>
        <div className="flex gap-3 justify-center flex-wrap">
          <button className="btn-primary-das" onClick={() => setPage('products')}>Continue Shopping</button>
          <button
            style={{ background: 'transparent', color: 'hsl(var(--navy))', border: '1.5px solid hsl(var(--navy))', borderRadius: 6, padding: '0.65rem 1.5rem', fontWeight: 600, cursor: 'pointer', fontSize: '0.95rem' }}
            onClick={() => setPage('contact')}
          >
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
