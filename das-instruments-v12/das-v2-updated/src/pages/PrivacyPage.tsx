const PrivacyPage = () => {
  const updated = 'May 2025';
  return (
    <div>
      <div className="page-hero">
        <h1 className="font-condensed text-4xl font-bold tracking-wide">Privacy Policy</h1>
        <p className="mt-2" style={{ color: 'rgba(255,255,255,0.7)' }}>Last updated: {updated}</p>
      </div>
      <div className="py-16 px-8 max-w-[860px] mx-auto">
        <div className="form-card" style={{ lineHeight: 1.85, fontSize: '0.95rem', color: 'hsl(var(--text-main))' }}>

          <p style={{ color: 'hsl(var(--muted-text))', marginBottom: 28 }}>
            DAS Instruments & Solutions ("we", "us", or "our"), located in Chennai, Tamil Nadu, India, operates the website dasinstruments.in. This Privacy Policy explains how we collect, use, disclose, and safeguard your personal information when you visit our website or place an order with us. By using our website, you consent to the practices described below.
          </p>

          {[
            {
              title: '1. Information We Collect',
              body: `We collect the following types of personal information:
              
• Identity & Contact Data: Full name, email address, phone number, company or institution name.
• Shipping & Billing Data: Delivery address, city, state, PIN code, and GST number (if provided).
• Transaction Data: Details of products purchased, order amounts, payment method, and Razorpay payment reference IDs.
• Technical Data: IP address, browser type, device information, and pages visited — collected automatically via analytics tools.
• Communications Data: Messages submitted through our Contact form.

We do not store credit card numbers, CVVs, or UPI PINs. All payment processing is handled securely by Razorpay, a PCI DSS-compliant payment gateway.`
            },
            {
              title: '2. How We Use Your Information',
              body: `We use your personal information to:

• Process and fulfil your orders, including delivery coordination and installation scheduling.
• Send order confirmation emails and GST invoices.
• Respond to enquiries submitted via the Contact form or WhatsApp.
• Notify you of order status updates (processing, shipped, delivered).
• Improve our website and product catalogue based on usage patterns.
• Comply with applicable legal obligations under Indian law.

We do not use your information for unsolicited marketing without your explicit consent.`
            },
            {
              title: '3. Sharing of Information',
              body: `We do not sell or rent your personal data to third parties. We may share your information with:

• Razorpay: For secure payment processing. Razorpay's privacy policy governs their use of your payment data.
• Resend / Email Service Providers: To deliver transactional emails (order confirmations, invoices).
• Supabase: Our cloud database provider, which stores order and customer records in secure servers.
• Logistics Partners: Courier and freight companies who require your shipping address to deliver your order.
• Legal Authorities: When required by Indian law, court order, or government regulation.

All third-party service providers are contractually obligated to handle your data securely.`
            },
            {
              title: '4. Data Retention',
              body: `We retain your personal data for as long as necessary to fulfil the purposes for which it was collected, including:

• Order records: 7 years (as required under the GST Act and Companies Act for financial records).
• Customer account data: Until you request deletion.
• Contact form submissions: 12 months.

You may request deletion of your account and associated personal data at any time by emailing info@dasinstruments.in.`
            },
            {
              title: '5. Cookies & Analytics',
              body: `We use Google Analytics to understand how visitors use our website. Google Analytics collects anonymised data including pages visited, time spent, and device type. This data does not personally identify you.

You can opt out of Google Analytics tracking by installing the Google Analytics Opt-out Browser Add-on available at tools.google.com/dlpage/gaoptout.

We may use essential session cookies to maintain your cart and login state. These are necessary for the website to function and cannot be disabled.`
            },
            {
              title: '6. Data Security',
              body: `We implement appropriate technical and organisational measures to protect your personal data against unauthorised access, alteration, disclosure, or destruction. These include:

• HTTPS encryption on all web pages.
• Secure cloud database with row-level security (Supabase / PostgreSQL).
• Payment processing exclusively via Razorpay's PCI DSS-compliant systems.

No method of transmission over the internet is 100% secure. While we strive to protect your data, we cannot guarantee absolute security.`
            },
            {
              title: '7. Your Rights',
              body: `Under the Information Technology Act, 2000 and the Digital Personal Data Protection Act, 2023, you have the right to:

• Access the personal data we hold about you.
• Request correction of inaccurate or incomplete data.
• Request deletion of your personal data (subject to legal retention obligations).
• Withdraw consent for data processing at any time.

To exercise any of these rights, email us at info@dasinstruments.in with the subject line "Data Request". We will respond within 30 days.`
            },
            {
              title: '8. Children\'s Privacy',
              body: `Our website and services are intended for business and institutional customers. We do not knowingly collect personal information from individuals under the age of 18. If you believe we have inadvertently collected such data, please contact us immediately.`
            },
            {
              title: '9. Changes to This Policy',
              body: `We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated "Last updated" date. Continued use of our website after changes constitutes acceptance of the revised policy.`
            },
            {
              title: '10. Contact Us',
              body: `If you have any questions about this Privacy Policy or how we handle your data, please contact:

DAS Instruments & Solutions
Chennai, Tamil Nadu, India
Email: info@dasinstruments.in
Phone: +91 88072 43902
Working Hours: Monday – Saturday, 9:00 AM – 6:00 PM`
            },
          ].map(s => (
            <div key={s.title} style={{ marginBottom: 28 }}>
              <div className="font-condensed font-bold text-lg mb-2" style={{ color: 'hsl(var(--navy))' }}>{s.title}</div>
              <div style={{ color: 'hsl(var(--muted-text))', whiteSpace: 'pre-line' }}>{s.body}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default PrivacyPage;
