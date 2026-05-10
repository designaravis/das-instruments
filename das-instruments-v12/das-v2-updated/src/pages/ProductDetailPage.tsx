import { useState } from "react";
import { Product, VariantOption } from "@/data/products";
import { getCategoryName, formatINR } from "@/lib/store";

interface Props {
  product: Product | null;
  setPage: (page: string) => void;
  addToCart: (p: Product) => void;
}

// Helper: get label string from an option (string or VariantOption)
const optLabel = (opt: string | VariantOption) =>
  typeof opt === 'string' ? opt : opt.label;

// Helper: get price from an option (0 if plain string)
const optPrice = (opt: string | VariantOption) =>
  typeof opt === 'object' && opt.price ? opt.price : 0;

const ProductDetailPage = ({ product, setPage, addToCart }: Props) => {
  const [qty, setQty] = useState(1);
  // Track selected index per variant group
  const [selectedVariants, setSelectedVariants] = useState<number[]>(() =>
    product?.variantGroups ? product.variantGroups.map(() => 0) : []
  );

  if (!product) return null;

  // Calculate extra price from all selected variant options
  const variantPriceAdj = (product.variantGroups || []).reduce((total, grp, gi) => {
    const opt = grp.options[selectedVariants[gi] ?? 0];
    return total + optPrice(opt);
  }, 0);
  const displayPrice = product.price + variantPriceAdj;

  const handleSelectVariant = (groupIdx: number, optIdx: number) => {
    setSelectedVariants(prev => {
      const next = [...prev];
      next[groupIdx] = optIdx;
      return next;
    });
  };

  return (
    <div className="py-16 px-8 max-w-[1200px] mx-auto">
      <div className="flex items-center gap-2 text-sm mb-8" style={{ color: 'hsl(var(--muted-text))' }}>
        <span className="cursor-pointer hover:text-foreground" onClick={() => setPage('home')}>Home</span>
        <span style={{ color: 'hsl(var(--off2))' }}>›</span>
        <span className="cursor-pointer hover:text-foreground" onClick={() => setPage('products')}>Products</span>
        <span style={{ color: 'hsl(var(--off2))' }}>›</span>
        <span className="font-semibold" style={{ color: 'hsl(var(--navy))' }}>{product.name}</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        <div className="detail-img">
          {product.imageUrl
            ? <img src={product.imageUrl} alt={product.name} style={{ width:'100%', height:'100%', objectFit:'contain', borderRadius:12 }} />
            : product.icon}
        </div>
        <div>
          <div className="inline-block px-3 py-1 rounded text-xs font-bold mb-3 tracking-widest" style={{ background: 'hsl(var(--gold3))', color: 'hsl(var(--navy))', fontSize:'0.85rem' }}>
            {getCategoryName(product.category)}
          </div>
          <h1 className="font-condensed text-4xl font-bold leading-tight mb-3 tracking-wide" style={{ color: 'hsl(var(--navy))' }}>
            {product.name}
          </h1>
          <div className="font-condensed text-4xl font-bold mb-5" style={{ color: 'hsl(var(--navy))' }}>
            {formatINR(displayPrice)}
            <small className="text-base font-normal ml-2" style={{ color: 'hsl(var(--muted-text))', fontSize:'1rem' }}>+18% GST</small>
          </div>
          <p className="text-base leading-relaxed mb-6" style={{ color: 'hsl(var(--muted-text))', fontSize:'1rem' }}>{product.desc}</p>
          <div className="mb-4 flex flex-wrap gap-1">
            {product.tags.map(t => (
              <span key={t} className="inline-block text-xs font-semibold px-2 py-0.5 rounded" style={{ background: 'hsl(var(--off2))', color: 'hsl(var(--navy))', fontSize:'0.82rem' }}>{t}</span>
            ))}
          </div>
          <div className="rounded p-4 mb-6" style={{ background: 'hsl(var(--off))' }}>
            {Object.entries(product.specs).map(([k, v]) => (
              <div key={k} className="flex justify-between py-1.5" style={{ borderBottom: '1px solid hsl(var(--off2))', fontSize:'0.95rem' }}>
                <span style={{ color: 'hsl(var(--muted-text))' }}>{k}</span>
                <span className="font-semibold" style={{ color: 'hsl(var(--navy))' }}>{v}</span>
              </div>
            ))}
          </div>
          {product.inStock ? (
            <div>
              {/* ── Variant Tabs ── */}
              {product.variantGroups && product.variantGroups.length > 0 && (
                <div className="mb-5">
                  {product.variantGroups.map((grp, gi) => (
                    <div key={gi} className="mb-4">
                      <div className="text-sm font-semibold mb-2" style={{ color: 'hsl(var(--muted-text))', fontSize:'0.95rem' }}>{grp.name}</div>
                      <div className="flex flex-wrap gap-2">
                        {grp.options.map((opt, oi) => {
                          const isSelected = (selectedVariants[gi] ?? 0) === oi;
                          const pAdj = optPrice(opt);
                          return (
                            <button
                              key={oi}
                              onClick={() => handleSelectVariant(gi, oi)}
                              style={{
                                padding: '6px 16px',
                                borderRadius: 999,
                                border: isSelected ? '2px solid hsl(var(--navy))' : '1.5px solid hsl(var(--off2))',
                                background: isSelected ? 'hsl(var(--navy))' : 'transparent',
                                color: isSelected ? '#fff' : 'hsl(var(--navy))',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                fontWeight: isSelected ? 600 : 400,
                                transition: 'all 0.15s',
                              }}
                            >
                              {optLabel(opt)}{pAdj ? ` (+${formatINR(pAdj)})` : ''}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-4 mb-5">
                <label className="text-sm font-semibold" style={{ color: 'hsl(var(--muted-text))', fontSize:'0.95rem' }}>Quantity</label>
                <div className="qty-ctrl">
                  <button className="qty-btn" onClick={() => setQty(Math.max(1, qty - 1))}>-</button>
                  <span className="qty-num">{qty}</span>
                  <button className="qty-btn" onClick={() => setQty(qty + 1)}>+</button>
                </div>
              </div>
              <button
                className="btn-primary-das w-full py-3 text-base"
                onClick={() => { for (let i = 0; i < qty; i++) addToCart({ ...product, price: displayPrice }); setPage('cart'); }}
              >
                🛒 Add to Cart & Checkout
              </button>
            </div>
          ) : (
            <div className="p-4 rounded font-semibold" style={{ background: '#f8d7da', color: 'hsl(var(--danger))' }}>
              Currently Out of Stock — Contact us to reserve this item
            </div>
          )}
          <div className="mt-6 p-4 rounded leading-relaxed" style={{ background: 'hsl(var(--off))', color: 'hsl(var(--muted-text))', fontSize:'0.95rem' }}>
            📞 Need a custom configuration? Call us at <strong style={{ color: 'hsl(var(--navy))' }}> +91 88072 43902</strong> or email <strong style={{ color: 'hsl(var(--navy))' }}>info@dasinstruments.in</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;