const RefundPage = () => {
  const updated = 'May 2025';
  return (
    <div>
      <div className="page-hero">
        <h1 className="font-condensed text-4xl font-bold tracking-wide">Refund & Return Policy</h1>
        <p className="mt-2" style={{ color: 'rgba(255,255,255,0.7)' }}>Last updated: {updated}</p>
      </div>
      <div className="py-16 px-8 max-w-[860px] mx-auto">
        <div className="form-card" style={{ lineHeight: 1.85, fontSize: '0.95rem' }}>

          <div className="p-4 rounded-lg mb-8" style={{ background: 'hsl(var(--off2))', borderLeft: '4px solid hsl(var(--navy))' }}>
            <div className="font-condensed font-bold mb-1" style={{ color: 'hsl(var(--navy))' }}>Our Commitment</div>
            <div style={{ color: 'hsl(var(--muted-text))', fontSize: '0.92rem' }}>
              At DAS Instruments & Solutions, we stand behind every product we supply. If something is not right, we will work with you to resolve it — through replacement, repair, or refund — depending on the situation.
            </div>
          </div>

          {[
            {
              title: '1. Eligibility for Return',
              body: `You may request a return under the following conditions:

• Dead-on-Arrival (DOA): The product arrives non-functional or physically damaged.
• Wrong Product Delivered: A product different from what was ordered was shipped.
• Significant Defect: The product has a manufacturing defect that prevents normal operation, and the defect was present at the time of delivery.

Returns are NOT accepted for:
• Products damaged due to improper use, mishandling, or external causes after delivery.
• Custom-order or import-on-demand equipment (unless DOA).
• Products from which the original seal or packaging has been broken without our prior instruction.
• Consumables (electrodes, chemicals, expendable parts) once opened.`
            },
            {
              title: '2. Return Window',
              body: `2.1 Return requests must be raised within 7 days of delivery for standard products.

2.2 For equipment requiring installation and commissioning, the return window begins from the date of commissioning (or 30 days after delivery if commissioning has not been scheduled, whichever is earlier).

2.3 Requests raised after the applicable window will not be eligible for return or refund, but may still be addressed under the product warranty.`
            },
            {
              title: '3. How to Raise a Return Request',
              body: `To initiate a return:

1. Email support@dasinstruments.in with subject line: "Return Request – [Order ID]"
2. Include: your Order ID, product name, description of the issue, and photographs or video evidence of the defect/damage.
3. Our support team will respond within 2 business days with instructions.
4. Do not ship any product back to us without receiving a Return Authorisation Number (RAN) from our team.

Unauthorised returns (without a RAN) will not be accepted and we will not be responsible for any loss or damage during transit.`
            },
            {
              title: '4. Return Shipping',
              body: `4.1 If the return is due to our error (wrong product, DOA, or manufacturing defect), we will arrange and bear the cost of return pickup from your location.

4.2 If the product is being returned for any other approved reason, the customer is responsible for safe packaging and return shipping costs.

4.3 All returned products must be packed in their original packaging with all accessories, manuals, and documentation included.`
            },
            {
              title: '5. Refund Process',
              body: `5.1 Once we receive and inspect the returned product, we will notify you of the outcome within 5 business days.

5.2 If the return is approved:
• Razorpay payments: Refund processed to the original payment source within 7–10 business days.
• NEFT / Bank Transfer: Refund processed to the bank account details provided by you within 7 business days.
• Cheque payments: A crossed cheque in favour of the customer will be issued within 10 business days.

5.3 GST paid on the original order will be refunded proportionately as per applicable GST rules.

5.4 Shipping charges (if any were paid) are non-refundable unless the return is due to our error.`
            },
            {
              title: '6. Replacement',
              body: `In many cases, we may offer a direct replacement of the defective unit rather than a refund, particularly for:

• DOA equipment where a replacement unit is available in stock.
• Equipment under warranty where the defect is covered.

We will always discuss both options — replacement and refund — with you and proceed as per your preference, subject to stock availability.`
            },
            {
              title: '7. Cancellation Policy',
              body: `7.1 Orders may be cancelled without charge within 24 hours of placement, provided the order has not yet been dispatched.

7.2 For import-on-demand or custom-order equipment where procurement has already been initiated, cancellation may not be possible. In such cases, a cancellation fee may apply — we will inform you of this before confirming any such order.

7.3 To cancel an order, email info@dasinstruments.in with your Order ID and reason for cancellation.`
            },
            {
              title: '8. Warranty vs. Return',
              body: `Returns (this policy) apply within 7 days of delivery for the specific conditions listed above.

For defects that appear after 7 days but within the warranty period, please refer to the Warranty section of our Terms & Conditions. Warranty claims are handled through our technical support team and may result in repair, replacement of defective components, or unit replacement — but not necessarily a monetary refund.`
            },
            {
              title: '9. Consumer Rights',
              body: `This policy is in addition to and does not limit your rights under the Consumer Protection Act, 2019 and the Consumer Protection (E-Commerce) Rules, 2020. If you feel your consumer rights have not been adequately addressed, you may approach the National Consumer Disputes Redressal Commission (NCDRC) or the relevant State Consumer Forum.`
            },
            {
              title: '10. Contact for Returns & Refunds',
              body: `DAS Instruments & Solutions — Support Team
Email: support@dasinstruments.in
Phone: +91 88072 43902
Working Hours: Monday – Saturday, 9:00 AM – 6:00 PM IST`
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
export default RefundPage;
