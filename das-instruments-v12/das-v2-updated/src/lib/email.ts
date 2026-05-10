// ═══════════════════════════════════════════════════════════════════
//  DAS Instruments — Automatic Order Invoice Email
//
//  How it works (zero backend needed):
//  ─────────────────────────────────────────────────────────────────
//  When a customer places an order, this module:
//    1. Builds a professional HTML invoice (stored as a data: URL)
//    2. Opens the customer's default mail app via mailto: with all
//       order details pre-filled in the body (plain-text fallback)
//    3. Also opens a pre-filled mailto: for the admin alert
//
//  To send emails AUTOMATICALLY (no click needed), configure one of:
//  ─────────────────────────────────────────────────────────────────
//  Option A — Resend (recommended, free 3000 emails/month):
//    1. Sign up at https://resend.com
//    2. Add & verify your domain
//    3. Create an API key
//    4. Add to .env:  VITE_RESEND_API_KEY=re_xxxxxxxx
//    5. Set RESEND_FROM_EMAIL below
//
//  Option B — Any SMTP (via a Netlify/Vercel serverless function)
//    Point VITE_EMAIL_API_ENDPOINT to your function URL
// ═══════════════════════════════════════════════════════════════════

const EMAIL_CONFIG = {
  // ── Resend (auto-send) ──────────────────────────────────────────
  RESEND_API_KEY:   (import.meta as any).env?.VITE_RESEND_API_KEY   || '',
  RESEND_FROM_EMAIL:(import.meta as any).env?.VITE_RESEND_FROM_EMAIL || 'orders@dasinstruments.in',

  // ── Admin notification email ────────────────────────────────────
  ADMIN_EMAIL: 'info@dasinstruments.in',

  // ── Company branding ────────────────────────────────────────────
  COMPANY_NAME:  'DAS Instruments & Solutions',
  COMPANY_PHONE: '+91 88072 43902',
  COMPANY_EMAIL: 'info@dasinstruments.in',
  COMPANY_ADDR:  'Chennai, Tamil Nadu, India',
  COMPANY_GST:   '33AAAAA0000A1Z5',
  COMPANY_WEB:   'www.dasinstruments.in',
};

export interface OrderEmailData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  phone: string;
  company: string;
  items: Array<{ name: string; qty: number; price: number }>;
  subtotal: number;
  gstAmount: number;
  grandTotal: number;
  shippingAddress: string;
  paymentMethod: string;
  paymentId: string | null;
}

function inr(n: number) {
  return '₹' + n.toLocaleString('en-IN');
}

function buildInvoiceHTML(data: OrderEmailData): string {
  const orderDate = new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'long', year:'numeric' });
  const itemRows = data.items.map(i => `
    <tr>
      <td style="padding:10px 14px;border-bottom:1px solid #f0f0f0;font-size:14px;color:#222;">${i.name}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #f0f0f0;text-align:center;font-size:14px;color:#555;">${i.qty}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #f0f0f0;text-align:right;font-size:14px;color:#555;">${inr(i.price)}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #f0f0f0;text-align:right;font-size:14px;font-weight:600;color:#222;">${inr(i.price * i.qty)}</td>
    </tr>`).join('');

  const payLabel: Record<string, string> = {
    razorpay: 'Online Payment (Razorpay)',
    neft:     'Bank Transfer (NEFT/RTGS)',
    cheque:   'Cheque / Demand Draft',
  };

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Order Confirmation – ${data.orderId}</title></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:32px 0;">
<tr><td align="center">
<table width="620" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

  <!-- Header -->
  <tr><td style="background:linear-gradient(135deg,#8b0000 0%,#b11b1b 100%);padding:32px 40px;">
    <table width="100%"><tr>
      <td><div style="font-size:26px;font-weight:900;color:#fff;letter-spacing:0.04em;">DAS</div>
          <div style="font-size:13px;color:rgba(255,255,255,0.8);margin-top:2px;">${EMAIL_CONFIG.COMPANY_NAME}</div></td>
      <td align="right"><div style="font-size:11px;color:rgba(255,255,255,0.65);line-height:1.8;">
        📞 ${EMAIL_CONFIG.COMPANY_PHONE}<br>
        ✉️ ${EMAIL_CONFIG.COMPANY_EMAIL}<br>
        🌐 ${EMAIL_CONFIG.COMPANY_WEB}
      </div></td>
    </tr></table>
  </td></tr>

  <!-- Order confirmed banner -->
  <tr><td style="background:#f9f9f9;padding:20px 40px;border-bottom:1px solid #eee;">
    <table width="100%"><tr>
      <td><div style="font-size:20px;font-weight:700;color:#222;">✅ Order Confirmed!</div>
          <div style="font-size:13px;color:#777;margin-top:4px;">Thank you for your order. We'll process it right away.</div></td>
      <td align="right">
        <div style="font-size:11px;color:#999;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;">Order ID</div>
        <div style="font-size:16px;font-weight:800;color:#b11b1b;">${data.orderId}</div>
        <div style="font-size:11px;color:#999;margin-top:4px;">${orderDate}</div>
      </td>
    </tr></table>
  </td></tr>

  <!-- Body -->
  <tr><td style="padding:32px 40px;">

    <!-- Customer greeting -->
    <p style="font-size:15px;color:#333;margin:0 0 20px;">Dear <strong>${data.customerName}</strong>,</p>
    <p style="font-size:14px;color:#555;line-height:1.7;margin:0 0 28px;">
      Thank you for choosing <strong>${EMAIL_CONFIG.COMPANY_NAME}</strong>. Your order has been successfully placed and our team will be in touch shortly to confirm delivery timelines and arrange dispatch.
    </p>

    <!-- Order items table -->
    <div style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#b11b1b;margin-bottom:10px;">Order Summary</div>
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eee;border-radius:8px;overflow:hidden;margin-bottom:24px;">
      <thead>
        <tr style="background:#f9f9f9;">
          <th style="padding:10px 14px;text-align:left;font-size:12px;color:#888;font-weight:600;text-transform:uppercase;">Product</th>
          <th style="padding:10px 14px;text-align:center;font-size:12px;color:#888;font-weight:600;text-transform:uppercase;">Qty</th>
          <th style="padding:10px 14px;text-align:right;font-size:12px;color:#888;font-weight:600;text-transform:uppercase;">Unit Price</th>
          <th style="padding:10px 14px;text-align:right;font-size:12px;color:#888;font-weight:600;text-transform:uppercase;">Amount</th>
        </tr>
      </thead>
      <tbody>${itemRows}</tbody>
    </table>

    <!-- Totals -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr><td style="padding:4px 0;font-size:13px;color:#666;">Subtotal</td><td align="right" style="font-size:13px;color:#555;">${inr(data.subtotal)}</td></tr>
      <tr><td style="padding:4px 0;font-size:13px;color:#666;">GST (18%)</td><td align="right" style="font-size:13px;color:#555;">${inr(data.gstAmount)}</td></tr>
      <tr><td colspan="2" style="padding:4px 0;"><hr style="border:none;border-top:2px solid #eee;margin:8px 0;"></td></tr>
      <tr>
        <td style="font-size:16px;font-weight:800;color:#222;">Total Amount</td>
        <td align="right" style="font-size:20px;font-weight:900;color:#b11b1b;">${inr(data.grandTotal)}</td>
      </tr>
    </table>

    <!-- Order details grid -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr>
        <td width="50%" valign="top" style="padding-right:16px;">
          <div style="background:#f9f9f9;border-radius:8px;padding:16px;">
            <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#b11b1b;margin-bottom:8px;">Shipping To</div>
            <div style="font-size:13px;color:#444;line-height:1.7;">${data.shippingAddress}</div>
            ${data.company ? `<div style="font-size:12px;color:#888;margin-top:4px;">🏢 ${data.company}</div>` : ''}
          </div>
        </td>
        <td width="50%" valign="top">
          <div style="background:#f9f9f9;border-radius:8px;padding:16px;">
            <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#b11b1b;margin-bottom:8px;">Payment Details</div>
            <div style="font-size:13px;color:#444;line-height:1.7;">${payLabel[data.paymentMethod] || data.paymentMethod}</div>
            ${data.paymentId ? `<div style="font-size:12px;color:#2e7d32;margin-top:4px;">✅ Paid · ID: ${data.paymentId.substring(0,20)}</div>` : `<div style="font-size:12px;color:#e65100;margin-top:4px;">⏳ Awaiting payment — details will follow</div>`}
          </div>
        </td>
      </tr>
    </table>

    <!-- What happens next -->
    <div style="background:#fff8e1;border-left:4px solid #f59e0b;border-radius:0 8px 8px 0;padding:16px 20px;margin-bottom:28px;">
      <div style="font-size:13px;font-weight:700;color:#b45309;margin-bottom:8px;">What happens next?</div>
      <div style="font-size:13px;color:#555;line-height:1.9;">
        1. Our team will review your order and confirm availability<br>
        2. You'll receive a call/email within 1 business day<br>
        3. We'll coordinate delivery, installation & commissioning<br>
        4. For urgent enquiries call <strong>${EMAIL_CONFIG.COMPANY_PHONE}</strong>
      </div>
    </div>

    <p style="font-size:14px;color:#555;line-height:1.7;margin:0 0 8px;">
      If you have any questions regarding your order, please contact us with your Order ID <strong style="color:#b11b1b;">${data.orderId}</strong>.
    </p>
    <p style="font-size:14px;color:#555;margin:0;">
      Warm regards,<br>
      <strong style="color:#222;">The DAS Instruments Team</strong>
    </p>
  </td></tr>

  <!-- Footer -->
  <tr><td style="background:#222;padding:20px 40px;">
    <div style="font-size:11px;color:rgba(255,255,255,0.4);text-align:center;line-height:1.8;">
      ${EMAIL_CONFIG.COMPANY_NAME} · ${EMAIL_CONFIG.COMPANY_ADDR}<br>
      GST: ${EMAIL_CONFIG.COMPANY_GST} · ${EMAIL_CONFIG.COMPANY_EMAIL} · ${EMAIL_CONFIG.COMPANY_PHONE}<br>
      <span style="font-size:10px;">This is an automated order confirmation. Please do not reply to this email.</span>
    </div>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

// ── Try Resend API first, fall back to mailto ────────────────────
async function sendViaResend(to: string, subject: string, html: string): Promise<boolean> {
  const key = EMAIL_CONFIG.RESEND_API_KEY;
  if (!key) return false;
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: `DAS Instruments <${EMAIL_CONFIG.RESEND_FROM_EMAIL}>`,
        to: [to],
        subject,
        html,
      }),
    });
    if (res.ok) { console.log('Email sent via Resend to', to); return true; }
    console.warn('Resend error:', await res.text());
    return false;
  } catch (err) {
    console.warn('Resend failed:', err);
    return false;
  }
}

// ── mailto fallback — opens mail client with plain-text invoice ──
function sendViaMailto(data: OrderEmailData): void {
  const orderDate = new Date().toLocaleDateString('en-IN');
  const itemLines = data.items.map(i => `  • ${i.name} × ${i.qty}  =  ${inr(i.price * i.qty)}`).join('\n');
  const payLabel: Record<string, string> = {
    razorpay: 'Online Payment (Razorpay)',
    neft: 'Bank Transfer (NEFT/RTGS)',
    cheque: 'Cheque / Demand Draft',
  };
  const subject = encodeURIComponent(`Order Confirmation – ${data.orderId} | DAS Instruments`);
  const body = encodeURIComponent(
`Dear ${data.customerName},

Thank you for your order with DAS Instruments & Solutions!

─────────────────────────────────────
ORDER DETAILS
─────────────────────────────────────
Order ID     : ${data.orderId}
Order Date   : ${orderDate}
Customer     : ${data.customerName}${data.company ? ` (${data.company})` : ''}
Phone        : ${data.phone}

ITEMS ORDERED:
${itemLines}

─────────────────────────────────────
Subtotal     : ${inr(data.subtotal)}
GST (18%)    : ${inr(data.gstAmount)}
TOTAL        : ${inr(data.grandTotal)}
─────────────────────────────────────

Shipping To  : ${data.shippingAddress}
Payment      : ${payLabel[data.paymentMethod] || data.paymentMethod}
${data.paymentId ? `Payment ID   : ${data.paymentId}` : 'Status       : Awaiting payment — we will send bank details shortly'}

WHAT HAPPENS NEXT?
1. Our team will confirm availability within 1 business day
2. We will coordinate delivery and installation
3. For urgent queries, call us at ${EMAIL_CONFIG.COMPANY_PHONE}

─────────────────────────────────────
${EMAIL_CONFIG.COMPANY_NAME}
${EMAIL_CONFIG.COMPANY_ADDR}
GST: ${EMAIL_CONFIG.COMPANY_GST}
📞 ${EMAIL_CONFIG.COMPANY_PHONE}
✉️ ${EMAIL_CONFIG.COMPANY_EMAIL}
🌐 ${EMAIL_CONFIG.COMPANY_WEB}
─────────────────────────────────────`
  );
  // Open mailto — customer's mail app will send it
  window.open(`mailto:${data.customerEmail}?subject=${subject}&body=${body}`, '_blank');
}

// ── Public API ───────────────────────────────────────────────────
export async function sendOrderConfirmationToCustomer(data: OrderEmailData): Promise<boolean> {
  const subject = `Order Confirmation – ${data.orderId} | DAS Instruments & Solutions`;
  const html = buildInvoiceHTML(data);

  // Try Resend (automatic, zero-click) first
  const sent = await sendViaResend(data.customerEmail, subject, html);

  // If Resend not configured, open mail client as fallback
  if (!sent) {
    sendViaMailto(data);
  }

  return sent;
}

export async function sendNewOrderAlertToAdmin(data: OrderEmailData): Promise<boolean> {
  const subject = `🛒 New Order ${data.orderId} – ${data.customerName} – ${inr(data.grandTotal)}`;
  const html = `
    <h2 style="color:#b11b1b;">New Order Received</h2>
    <p><strong>Order ID:</strong> ${data.orderId}<br>
    <strong>Customer:</strong> ${data.customerName} (${data.customerEmail})<br>
    <strong>Phone:</strong> ${data.phone}<br>
    <strong>Company:</strong> ${data.company || 'N/A'}<br>
    <strong>Total:</strong> ${inr(data.grandTotal)}<br>
    <strong>Payment:</strong> ${data.paymentMethod}${data.paymentId ? ` ✅ ${data.paymentId}` : ' ⏳ Offline'}<br>
    <strong>Ship to:</strong> ${data.shippingAddress}</p>
    <h3>Items:</h3>
    <ul>${data.items.map(i => `<li>${i.name} × ${i.qty} = ${inr(i.price * i.qty)}</li>`).join('')}</ul>
    <hr><p>Subtotal: ${inr(data.subtotal)} | GST: ${inr(data.gstAmount)} | <strong>Total: ${inr(data.grandTotal)}</strong></p>
  `;
  const sent = await sendViaResend(EMAIL_CONFIG.ADMIN_EMAIL, subject, html);
  if (!sent) console.log('Admin alert: Resend not configured. Add VITE_RESEND_API_KEY to .env to enable.');
  return sent;
}
