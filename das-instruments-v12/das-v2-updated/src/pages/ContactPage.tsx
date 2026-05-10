import { useState } from "react";

const RESEND_API_KEY  = (import.meta as any).env?.VITE_RESEND_API_KEY   || '';
const RESEND_FROM     = (import.meta as any).env?.VITE_RESEND_FROM_EMAIL || 'enquiries@dasinstruments.in';
const ADMIN_EMAIL     = 'info@dasinstruments.in';

async function sendEnquiryEmail(form: { name: string; email: string; phone: string; subject: string; message: string }): Promise<boolean> {
  if (!RESEND_API_KEY) return false;
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <div style="background:#b11b1b;padding:24px 32px;">
        <div style="font-size:22px;font-weight:900;color:#fff;letter-spacing:0.04em;">DAS Instruments</div>
        <div style="font-size:12px;color:rgba(255,255,255,0.7);margin-top:2px;">New Website Enquiry</div>
      </div>
      <div style="padding:28px 32px;background:#fff;border:1px solid #eee;">
        <table style="width:100%;font-size:14px;border-collapse:collapse;">
          <tr><td style="padding:8px 0;color:#888;width:120px;">Name</td><td style="padding:8px 0;font-weight:600;color:#222;">${form.name}</td></tr>
          <tr><td style="padding:8px 0;color:#888;">Email</td><td style="padding:8px 0;color:#1a6fb5;">${form.email}</td></tr>
          <tr><td style="padding:8px 0;color:#888;">Phone</td><td style="padding:8px 0;">${form.phone || '—'}</td></tr>
          <tr><td style="padding:8px 0;color:#888;">Subject</td><td style="padding:8px 0;">${form.subject || '—'}</td></tr>
        </table>
        <div style="margin-top:16px;padding:16px;background:#f9f9f9;border-radius:8px;border-left:4px solid #b11b1b;">
          <div style="font-size:12px;font-weight:700;text-transform:uppercase;color:#b11b1b;margin-bottom:8px;">Message</div>
          <div style="font-size:14px;color:#444;line-height:1.7;">${form.message.replace(/\n/g, '<br>')}</div>
        </div>
        <div style="margin-top:20px;font-size:12px;color:#aaa;">Received from dasinstruments.in contact form · ${new Date().toLocaleString('en-IN')}</div>
      </div>
    </div>`;
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: `DAS Instruments Website <${RESEND_FROM}>`, to: [ADMIN_EMAIL], reply_to: form.email, subject: `Website Enquiry: ${form.subject || 'General'} — ${form.name}`, html }),
    });
    return res.ok;
  } catch { return false; }
}

const ContactPage = () => {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const upd = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const send = async () => {
    if (!form.name || !form.email || !form.message) return;
    setSending(true);
    await sendEnquiryEmail(form);
    setSending(false);
    setSent(true);
  };

  return (
    <div>
      <div className="page-hero">
        <h1 className="font-condensed text-4xl font-bold tracking-wide">Contact Us</h1>
        <p className="mt-2" style={{ color: 'rgba(255,255,255,0.7)' }}>We'd love to hear from you — inquiry, support, or quote</p>
      </div>
      <div className="py-16 px-8 max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="contact-info-card">
            <div className="font-condensed text-xl font-bold mb-6" style={{ color: 'hsl(var(--gold2))' }}>Get in Touch</div>
            {[
              { icon: '📍', label: 'Address', val: 'Chennai, Tamil Nadu, India' },
              { icon: '📞', label: 'Phone', val: '+91 88072 43902' },
              { icon: '✉️', label: 'Email', val: 'info@dasinstruments.in' },
              { icon: '🕐', label: 'Working Hours', val: 'Mon–Sat: 9:00 AM – 6:00 PM' },
            ].map(r => (
              <div key={r.label} className="flex gap-3 mb-5 items-start">
                <div className="contact-icon">{r.icon}</div>
                <div className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.8)' }}>
                  <strong className="block text-xs tracking-widest uppercase font-condensed mb-0.5" style={{ color: '#fff' }}>{r.label}</strong>
                  {r.val}
                </div>
              </div>
            ))}
            <div className="mt-6 pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.15)' }}>
              <div className="text-xs tracking-widest font-semibold mb-3" style={{ color: 'rgba(255,255,255,0.5)' }}>QUICK CONTACTS</div>
              {['Sales: sales@dasinstruments.in', 'Support: support@dasinstruments.in', 'AMC: amc@dasinstruments.in'].map(e => (
                <div key={e} className="text-sm py-0.5" style={{ color: 'rgba(255,255,255,0.65)' }}>{e}</div>
              ))}
            </div>
          </div>
          <div>
            {sent ? (
              <div className="success-box" style={{ boxShadow: 'var(--shadow-sm)' }}>
                <div className="success-icon">✓</div>
                <div className="font-condensed text-3xl font-bold mb-3" style={{ color: 'hsl(var(--success))' }}>Message Sent!</div>
                <p style={{ color: 'hsl(var(--muted-text))' }}>Thank you, we'll get back to you within 24 hours.</p>
                <button className="btn-primary-das mt-6" onClick={() => setSent(false)}>Send Another</button>
              </div>
            ) : (
              <div className="form-card">
                <div className="form-section-title">Send a Message</div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold" style={{ color: 'hsl(var(--muted-text))' }}>Name *</label>
                    <input className="das-input" placeholder="Your name" value={form.name} onChange={upd('name')} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold" style={{ color: 'hsl(var(--muted-text))' }}>Email *</label>
                    <input className="das-input" type="email" placeholder="you@email.com" value={form.email} onChange={upd('email')} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold" style={{ color: 'hsl(var(--muted-text))' }}>Phone</label>
                    <input className="das-input" placeholder="+91 99999 99999" value={form.phone} onChange={upd('phone')} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold" style={{ color: 'hsl(var(--muted-text))' }}>Subject</label>
                    <select className="das-select" value={form.subject} onChange={upd('subject')}>
                      <option value="">Select…</option>
                      {['Product Enquiry', 'Request Quote', 'Technical Support', 'AMC Request', 'General'].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex flex-col gap-1 mb-4">
                  <label className="text-xs font-semibold" style={{ color: 'hsl(var(--muted-text))' }}>Message *</label>
                  <textarea className="das-input" rows={4} placeholder="Describe your requirement, product of interest, or question…" value={form.message} onChange={upd('message')} style={{ resize: 'vertical' }} />
                </div>
                <button className="btn-primary-das py-3 px-8" onClick={send} disabled={!form.name || !form.email || !form.message || sending}>
                  {sending ? '⏳ Sending…' : 'Send Message →'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
