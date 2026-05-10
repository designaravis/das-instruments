import { useState, useEffect } from "react";
import { CATEGORIES, Category } from "@/data/categories";
import { PRODUCTS } from "@/data/products";
import { Product } from "@/data/products";
import ProductCard from "@/components/ProductCard";

interface HomePageProps {
  setPage: (page: string) => void;
  setSelectedCat: (cat: string) => void;
  setSelectedProduct: (p: Product) => void;
  addToCart: (p: Product) => void;
}

const HomePage = ({ setPage, setSelectedCat, setSelectedProduct, addToCart }: HomePageProps) => {
  // Live-sync categories from admin panel changes
  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem('das_admin_categories');
      return saved ? JSON.parse(saved) : CATEGORIES;
    } catch { return CATEGORIES; }
  });
  const [liveProducts, setLiveProducts] = useState<Product[]>(() => {
    try { const s = localStorage.getItem('das_admin_products'); return s ? JSON.parse(s) : PRODUCTS; } catch { return PRODUCTS; }
  });

  useEffect(() => {
    const syncAll = () => {
      try { const s = localStorage.getItem('das_admin_categories'); if (s) setCategories(JSON.parse(s)); } catch {}
      try { const s = localStorage.getItem('das_admin_products'); if (s) setLiveProducts(JSON.parse(s)); } catch {}
    };
    window.addEventListener('storage', syncAll);
    window.addEventListener('das_categories_updated', syncAll);
    window.addEventListener('das_products_updated', syncAll);
    return () => {
      window.removeEventListener('storage', syncAll);
      window.removeEventListener('das_categories_updated', syncAll);
      window.removeEventListener('das_products_updated', syncAll);
    };
  }, []);

  const featured = liveProducts.filter(p => ['p1', 'p5', 'p7', 'p10'].includes(p.id));
  const stats = [
    { n: '500+', l: 'Products Sold' },
    { n: '200+', l: 'Research Clients' },
    { n: '15+', l: 'Years Experience' },
    { n: '24/7', l: 'Technical Support' },
  ];

  return (
    <div>
      {/* Hero */}
      <div className="das-hero">
        <div className="relative z-10">
          <div className="font-condensed text-sm tracking-[0.2em] mb-4 font-medium" style={{ color: 'hsl(var(--gold2))' }}>
            Chennai's Premier Scientific Instrument Company
          </div>
          <h1 className="font-condensed font-bold leading-[1.05] mb-6 tracking-wide" style={{ fontSize: 'clamp(2.2rem, 5vw, 3.8rem)' }}>
            Precision Instruments for<br />
            <span style={{ color: 'hsl(var(--gold2))' }}>Research & Industry</span>
          </h1>
          <p className="text-base mb-8 max-w-[560px] mx-auto leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)' }}>
            From electrochemical workstations to industrial automation — trusted by IITs, NITs, and Fortune 500 companies across India.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button className="btn-primary-das" onClick={() => setPage('products')}>Explore Products</button>
            <button className="btn-outline-das" onClick={() => setPage('contact')}>Get a Quote</button>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="stats-bar">
        {stats.map(s => (
          <div key={s.l} className="stat-item">
            <div className="font-condensed text-2xl font-bold" style={{ color: 'hsl(var(--text-main))' }}>{s.n}</div>
            <div className="text-xs tracking-widest mt-0.5" style={{ color: 'hsl(var(--muted-text))' }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Categories — live-synced with admin panel */}
      <div className="py-16 px-8 max-w-[1200px] mx-auto">
        <div className="mb-10">
          <div className="section-label">Product Lines</div>
          <div className="section-title">Browse by Category</div>
          <div className="mt-2 text-sm leading-relaxed max-w-[500px]" style={{ color: 'hsl(var(--muted-text))' }}>
            From electrochemical research to heavy industrial automation
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map(c => (
            <div key={c.id} className="cat-card" onClick={() => { setSelectedCat(c.id); setPage('products'); }}>
              <div className="text-3xl mb-3">{c.icon}</div>
              <div className="font-condensed text-base font-semibold mb-1 tracking-wide" style={{ color: '#fff' }}>{c.name}</div>
              <div className="text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>{c.sub}</div>
              <div className="mt-4 text-xs" style={{ color: 'hsl(var(--gold2))' }}>
                {liveProducts.filter(p => p.category === c.id).length} products →
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Products */}
      <div className="py-16 px-8" style={{ background: '#fff' }}>
        <div className="max-w-[1200px] mx-auto">
          <div className="mb-10">
            <div className="section-label">Featured</div>
            <div className="section-title">Popular Products</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {featured.map(p => (
              <ProductCard key={p.id} product={p} setSelectedProduct={setSelectedProduct} setPage={setPage} addToCart={addToCart} />
            ))}
          </div>
        </div>
      </div>

      {/* Why DAS */}
      <div className="py-16 px-8 max-w-[1200px] mx-auto">
        <div className="mb-10">
          <div className="section-label">Why Choose Us</div>
          <div className="section-title">The DAS Advantage</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {[
            { icon: '🔬', t: 'Research Grade', d: 'Equipment meets IEC & ISO standards, trusted by premier institutions.' },
            { icon: '🛠️', t: 'AMC & Support', d: 'Annual maintenance contracts with onsite support across South India.' },
            { icon: '🚀', t: 'Fast Delivery', d: 'Pan-India delivery within 5–7 business days.' },
            { icon: '📞', t: 'Expert Consultation', d: 'Free application support from qualified application engineers.' },
          ].map(f => (
            <div key={f.t} className="bg-white rounded-xl p-6" style={{ boxShadow: 'var(--shadow-sm)', borderTop: '3px solid hsl(var(--gold))' }}>
              <div className="text-3xl mb-3">{f.icon}</div>
              <div className="font-condensed text-base font-bold mb-1" style={{ color: 'hsl(var(--navy))' }}>{f.t}</div>
              <div className="text-sm leading-relaxed" style={{ color: 'hsl(var(--muted-text))' }}>{f.d}</div>
            </div>
          ))}
        </div>
      </div>

      {/* About Us teaser */}
      <div className="py-16 px-8" style={{ background: 'hsl(var(--off2))' }}>
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="section-label">About Us</div>
            <div className="section-title mb-4">Who We Are</div>
            <p className="text-sm leading-relaxed mb-4" style={{ color: 'hsl(var(--muted-text))' }}>
              DAS Instruments & Solutions is Chennai's premier supplier of scientific instruments and industrial automation systems. Since 2009, we have served IITs, NITs, research labs, hospitals, and Fortune 500 companies across India.
            </p>
            <p className="text-sm leading-relaxed mb-6" style={{ color: 'hsl(var(--muted-text))' }}>
              We provide end-to-end solutions — from consultation and procurement to installation, calibration, and ongoing AMC support.
            </p>
            <button className="btn-primary-das" onClick={() => setPage('about')}>Learn More →</button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { n: '15+', l: 'Years in Business' },
              { n: '500+', l: 'Products Available' },
              { n: '200+', l: 'Research Clients' },
              { n: 'Pan India', l: 'Service Coverage' },
            ].map(s => (
              <div key={s.l} className="bg-white rounded-xl p-5 text-center" style={{ boxShadow: 'var(--shadow-sm)' }}>
                <div className="font-condensed text-2xl font-bold" style={{ color: 'hsl(var(--navy))' }}>{s.n}</div>
                <div className="text-xs mt-1" style={{ color: 'hsl(var(--muted-text))' }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact teaser */}
      <div className="py-16 px-8" style={{ background: 'hsl(var(--navy2))' }}>
        <div className="max-w-[800px] mx-auto text-center">
          <div className="section-label" style={{ color: 'rgba(255,255,255,0.6)' }}>Get In Touch</div>
          <div className="font-condensed text-3xl font-bold mb-4" style={{ color: '#fff' }}>Ready to Talk?</div>
          <p className="text-sm leading-relaxed mb-8" style={{ color: 'rgba(255,255,255,0.65)' }}>
            Have questions about our products or need a custom quote? Our team in Chennai is ready to help.
          </p>
          <div className="flex flex-wrap justify-center gap-6 mb-8 text-sm" style={{ color: 'rgba(255,255,255,0.75)' }}>
            <span>📞 +91 88072 43902</span>
            <span>✉️ info@dasinstruments.in</span>
            <span>📍 Chennai, Tamil Nadu</span>
          </div>
          <button className="btn-primary-das" style={{ background: '#fff', color: 'hsl(var(--navy))' }} onClick={() => setPage('contact')}>
            Contact Us →
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
