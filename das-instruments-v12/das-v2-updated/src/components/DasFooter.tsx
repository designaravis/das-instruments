interface FooterProps {
  setPage: (page: string) => void;
}

const DasFooter = ({ setPage }: FooterProps) => {
  return (
    <footer className="das-footer">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-[1200px] mx-auto mb-8">
        <div>
          <div className="nav-logo" style={{ marginBottom: 12, cursor: 'pointer' }} onClick={() => setPage('home')}>
            <img src="/daslogoo.svg" alt="DAS Instruments Logo" style={{ height: 44, width: 'auto' }} />
          </div>
          <p className="text-sm leading-relaxed mt-3" style={{ color: 'rgba(255,255,255,0.55)' }}>
            Chennai's premier supplier of electrochemical workstations, lab instruments, and industrial automation systems. Serving research institutions and industries since 2009.
          </p>
        </div>
        <div>
          <div className="footer-col-title">Products</div>
          {['Electrochemical', 'Lab Instruments', 'Controllers', 'Pyrometers', 'Recorders', 'Thyristors', 'Fuel Cell', 'Battery'].map(l => (
            <div key={l} className="footer-link" onClick={() => setPage('products')}>{l}</div>
          ))}
        </div>
        <div>
          <div className="footer-col-title">Company</div>
          <div className="footer-link" onClick={() => setPage('about')}>About Us</div>
          <div className="footer-link" onClick={() => setPage('contact')}>Contact</div>
          <div className="footer-link" onClick={() => setPage('contact')}>Support</div>
          <div className="footer-link" onClick={() => setPage('contact')}>AMC Services</div>
          <div style={{ marginTop: 16 }}>
            <div className="footer-col-title">Legal</div>
            <div className="footer-link" onClick={() => setPage('privacy')}>Privacy Policy</div>
            <div className="footer-link" onClick={() => setPage('terms')}>Terms & Conditions</div>
            <div className="footer-link" onClick={() => setPage('refund')}>Refund Policy</div>
          </div>
        </div>
        <div>
          <div className="footer-col-title">Contact</div>
          <div className="text-sm" style={{ lineHeight: 2, color: 'rgba(255,255,255,0.55)' }}>
            <div>📍 Chennai, Tamil Nadu</div>
            <div>📞 +91 88072 43902</div>
            <div>✉️ info@dasinstruments.in</div>
            <div>🕐 Mon–Sat 9AM–6PM</div>
          </div>
          <div style={{ marginTop: 16 }}>
            <a href="https://wa.me/918807243902" target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#25D366', color: '#fff', padding: '7px 14px', borderRadius: 6, fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none' }}>
              <svg viewBox="0 0 24 24" style={{ width: 16, height: 16, fill: '#fff' }}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              WhatsApp Us
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 pt-5 max-w-[1200px] mx-auto" style={{ color: 'rgba(255,255,255,0.35)' }}>
        <div className="flex flex-wrap justify-between items-center gap-3 text-xs">
          <div>© 2025 DAS Instruments & Solutions. All rights reserved. | Chennai, Tamil Nadu, India | GST: 33AAAAA0000A1Z5</div>
          <div className="flex gap-4">
            <span className="cursor-pointer hover:text-white transition-colors" onClick={() => setPage('privacy')}>Privacy Policy</span>
            <span className="cursor-pointer hover:text-white transition-colors" onClick={() => setPage('terms')}>Terms & Conditions</span>
            <span className="cursor-pointer hover:text-white transition-colors" onClick={() => setPage('refund')}>Refund Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default DasFooter;
