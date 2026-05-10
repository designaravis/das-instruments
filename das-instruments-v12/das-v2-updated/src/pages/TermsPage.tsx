const TermsPage = () => {
  const updated = 'May 2025';
  return (
    <div>
      <div className="page-hero">
        <h1 className="font-condensed text-4xl font-bold tracking-wide">Terms & Conditions</h1>
        <p className="mt-2" style={{ color: 'rgba(255,255,255,0.7)' }}>Last updated: {updated}</p>
      </div>
      <div className="py-16 px-8 max-w-[860px] mx-auto">
        <div className="form-card" style={{ lineHeight: 1.85, fontSize: '0.95rem' }}>

          <p style={{ color: 'hsl(var(--muted-text))', marginBottom: 28 }}>
            These Terms and Conditions ("Terms") govern your use of the DAS Instruments & Solutions website and the purchase of products or services from us. By placing an order or using our website, you agree to be bound by these Terms. Please read them carefully before proceeding.
          </p>

          {[
            {
              title: '1. About Us',
              body: `DAS Instruments & Solutions is a scientific instrument supplier and solutions provider based in Chennai, Tamil Nadu, India. We supply electrochemical workstations, laboratory instruments, industrial controllers, pyrometers, recorders, and related equipment to research institutions, universities, and industries across India.`
            },
            {
              title: '2. Orders & Acceptance',
              body: `2.1 All orders placed through our website constitute an offer to purchase the specified products at the listed price.

2.2 An order is accepted only when we send you a written order confirmation via email. We reserve the right to decline any order for reasons including product unavailability, pricing errors, or suspected fraud.

2.3 For high-value or custom-specification equipment, our sales team may contact you to confirm technical requirements before processing the order.

2.4 Pricing displayed on the website is in Indian Rupees (INR) and is exclusive of GST unless stated otherwise. GST at the applicable rate (currently 18%) will be added at checkout.`
            },
            {
              title: '3. Payment Terms',
              body: `3.1 We accept payment via:
• Online Payment through Razorpay (Credit/Debit Card, UPI, Net Banking, Wallets)
• Bank Transfer (NEFT / RTGS) — order processed after payment receipt confirmation
• Cheque / Demand Draft — payable to "DAS Instruments & Solutions", Chennai

3.2 For institutional and government purchase orders (POs), please contact us at sales@dasinstruments.in.

3.3 All online payments are processed through Razorpay's secure payment gateway. We do not store any card or banking credentials.

3.4 In the event of a payment failure, the order will not be confirmed. Please retry or choose an alternate payment method.`
            },
            {
              title: '4. Delivery & Shipping',
              body: `4.1 We offer pan-India delivery. Standard delivery timelines are 5–10 business days from the date of order confirmation, subject to product availability.

4.2 For imported or custom-order equipment, delivery timelines will be communicated separately by our sales team.

4.3 Shipping is free for all orders unless otherwise stated at checkout.

4.4 We are not responsible for delays caused by logistics partners, natural events, government restrictions, or force majeure circumstances.

4.5 Risk of loss or damage passes to the buyer upon delivery to the shipping address specified in the order.`
            },
            {
              title: '5. Installation & Commissioning',
              body: `5.1 For complex equipment (electrochemical workstations, fuel cell test systems, PLCs, etc.), installation and commissioning services are included or available as an add-on — as specified on the product page.

5.2 Commissioning must be scheduled within 30 days of equipment delivery unless otherwise agreed in writing.

5.3 We are not responsible for damage arising from improper installation carried out by parties other than our authorised engineers.`
            },
            {
              title: '6. Warranty',
              body: `6.1 All products supplied by DAS Instruments carry the manufacturer's standard warranty, typically 12–24 months from the date of delivery or commissioning, whichever is earlier.

6.2 Warranty covers manufacturing defects and component failures under normal use conditions.

6.3 Warranty is void if: the equipment is misused, physically damaged, tampered with, or repaired by unauthorised persons.

6.4 Warranty claims should be raised by emailing support@dasinstruments.in with the order ID, product serial number, and description of the defect.`
            },
            {
              title: '7. Annual Maintenance Contracts (AMC)',
              body: `7.1 AMC services are available for most equipment supplied by us. AMC covers periodic preventive maintenance visits, calibration checks, and priority response to breakdown calls.

7.2 AMC terms, pricing, and coverage scope are agreed separately in writing. Please contact amc@dasinstruments.in for details.`
            },
            {
              title: '8. Intellectual Property',
              body: `All content on this website — including product descriptions, images, logos, and software — is the intellectual property of DAS Instruments & Solutions or its respective suppliers and manufacturers. You may not reproduce, distribute, or commercially exploit any content without our prior written consent.`
            },
            {
              title: '9. Limitation of Liability',
              body: `9.1 To the fullest extent permitted by law, DAS Instruments & Solutions shall not be liable for any indirect, incidental, special, or consequential damages arising from the use of our products or website.

9.2 Our total liability for any claim shall not exceed the invoice value of the product to which the claim relates.

9.3 We do not warrant that the website will be available uninterrupted or error-free.`
            },
            {
              title: '10. Governing Law & Disputes',
              body: `These Terms are governed by and construed in accordance with the laws of India. Any disputes arising from or relating to these Terms or your use of our website shall be subject to the exclusive jurisdiction of the courts in Chennai, Tamil Nadu, India.`
            },
            {
              title: '11. Changes to Terms',
              body: `We reserve the right to update these Terms at any time. Changes will be posted on this page with an updated date. Continued use of our website or services after changes constitutes acceptance of the revised Terms.`
            },
            {
              title: '12. Contact',
              body: `DAS Instruments & Solutions
Chennai, Tamil Nadu, India
Email: info@dasinstruments.in
Phone: +91 88072 43902`
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
export default TermsPage;
