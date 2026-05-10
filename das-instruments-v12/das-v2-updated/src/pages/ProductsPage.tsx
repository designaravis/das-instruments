import { useState, useEffect } from "react";
import { CATEGORIES, Category } from "@/data/categories";
import { PRODUCTS, Product } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import { useSearchParams } from "react-router-dom";

interface Props {
  selectedCat: string | null;
  setSelectedCat: (cat: string | null) => void;
  setSelectedProduct: (p: Product) => void;
  setPage: (page: string) => void;
  addToCart: (p: Product) => void;
}

const ProductsPage = ({ selectedCat, setSelectedCat, setSelectedProduct, setPage, addToCart }: Props) => {
  const [liveCategories, setLiveCategories] = useState<Category[]>(() => {
    try { const s = localStorage.getItem('das_admin_categories'); return s ? JSON.parse(s) : CATEGORIES; } catch { return CATEGORIES; }
  });
  const [liveProducts, setLiveProducts] = useState<Product[]>(() => {
    try { const s = localStorage.getItem('das_admin_products'); return s ? JSON.parse(s) : PRODUCTS; } catch { return PRODUCTS; }
  });
  useEffect(() => {
    const sync = () => {
      try { const s = localStorage.getItem('das_admin_categories'); if (s) setLiveCategories(JSON.parse(s)); } catch {}
      try { const s = localStorage.getItem('das_admin_products'); if (s) setLiveProducts(JSON.parse(s)); } catch {}
    };
    window.addEventListener('storage', sync);
    window.addEventListener('das_categories_updated', sync);
    window.addEventListener('das_products_updated', sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('das_categories_updated', sync);
      window.removeEventListener('das_products_updated', sync);
    };
  }, []);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('default');
  const [cats, setCats] = useState<string[]>(selectedCat ? [selectedCat] : []);
  const [maxPrice, setMaxPrice] = useState(600000);

  useEffect(() => { if (selectedCat) setCats([selectedCat]); }, [selectedCat]);

  let prods = liveProducts.filter(p => {
    const matchCat = cats.length === 0 || cats.includes(p.category);
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.desc.toLowerCase().includes(search.toLowerCase());
    const matchPrice = p.price <= maxPrice;
    return matchCat && matchSearch && matchPrice;
  });

  if (sort === 'price-asc') prods = [...prods].sort((a, b) => a.price - b.price);
  else if (sort === 'price-desc') prods = [...prods].sort((a, b) => b.price - a.price);
  else if (sort === 'name') prods = [...prods].sort((a, b) => a.name.localeCompare(b.name));

  const toggleCat = (id: string) => setCats(cs => cs.includes(id) ? cs.filter(c => c !== id) : [...cs, id]);

  return (
    <div>
      <div className="page-hero">
        <h1 className="font-condensed text-4xl font-bold tracking-wide">All Products</h1>
        <p className="mt-2" style={{ color: 'rgba(255,255,255,0.7)' }}>{liveProducts.length} instruments for research & industry</p>
      </div>
      <div className="py-16 px-8 max-w-[1200px] mx-auto">
        <div className="grid gap-8" style={{ gridTemplateColumns: '240px 1fr' }}>
          {/* Sidebar */}
          <div className="filters-panel">
            <div className="font-condensed text-base font-bold mb-4 tracking-wide" style={{ color: 'hsl(var(--navy))' }}>🔍 Filter Products</div>
            <div className="mb-5">
              <label className="text-xs font-semibold tracking-widest uppercase block mb-2" style={{ color: 'hsl(var(--muted-text))' }}>Search</label>
              <input className="das-input" placeholder="Type to search…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="mb-5">
              <label className="text-xs font-semibold tracking-widest uppercase block mb-2" style={{ color: 'hsl(var(--muted-text))' }}>Sort By</label>
              <select className="das-select" value={sort} onChange={e => setSort(e.target.value)}>
                <option value="default">Default</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name">Name A-Z</option>
              </select>
            </div>
            <div className="mb-5">
              <label className="text-xs font-semibold tracking-widest uppercase block mb-2" style={{ color: 'hsl(var(--muted-text))' }}>Category</label>
              {liveCategories.map(c => (
                <label key={c.id} className="flex items-center gap-2 py-1 cursor-pointer text-sm">
                  <input type="checkbox" checked={cats.includes(c.id)} onChange={() => toggleCat(c.id)} style={{ accentColor: 'hsl(var(--navy))' }} />
                  {c.icon} {c.name}
                </label>
              ))}
            </div>
            <div className="mb-5">
              <label className="text-xs font-semibold tracking-widest uppercase block mb-2" style={{ color: 'hsl(var(--muted-text))' }}>
                Max Price: ₹{maxPrice.toLocaleString('en-IN')}
              </label>
              <input type="range" className="w-full" min={5000} max={600000} step={5000} value={maxPrice} onChange={e => setMaxPrice(+e.target.value)} style={{ accentColor: 'hsl(var(--navy))' }} />
            </div>
            <button
              className="w-full py-2 rounded text-sm font-semibold border-none cursor-pointer"
              style={{ background: 'hsl(var(--off2))', color: 'hsl(var(--navy))' }}
              onClick={() => { setCats([]); setSearch(''); setSort('default'); setMaxPrice(600000); setSelectedCat(null); }}
            >
              Clear Filters
            </button>
          </div>
          {/* Grid */}
          <div>
            <div className="mb-4 text-sm" style={{ color: 'hsl(var(--muted-text))' }}>{prods.length} products found</div>
            {prods.length === 0 ? (
              <div className="text-center py-16" style={{ color: 'hsl(var(--muted-text))' }}>
                <div className="text-5xl mb-4">🔍</div>
                <div className="font-condensed text-xl font-bold mb-2" style={{ color: 'hsl(var(--navy))' }}>No products found</div>
                <div>Try adjusting your filters</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {prods.map(p => (
                  <ProductCard key={p.id} product={p} setSelectedProduct={setSelectedProduct} setPage={setPage} addToCart={addToCart} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
