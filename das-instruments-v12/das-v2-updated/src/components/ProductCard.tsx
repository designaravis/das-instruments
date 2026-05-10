import { Product } from "@/data/products";
import { getCategoryName, formatINR } from "@/lib/store";

interface ProductCardProps {
  product: Product;
  setSelectedProduct: (p: Product) => void;
  setPage: (page: string) => void;
  addToCart: (p: Product) => void;
}

const ProductCard = ({ product, setSelectedProduct, setPage, addToCart }: ProductCardProps) => {
  const isEnquiry = product.actionType === 'enquiry';

  const handleEnquiry = () => {
    setPage('contact');
  };

  return (
    <div className="prod-card">
      <div className="prod-img">
        {product.imageUrl
          ? <img src={product.imageUrl} alt={product.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
          : product.icon}
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <div className="text-xs tracking-widest font-semibold mb-1 uppercase" style={{ color: 'hsl(var(--steel))', fontSize:'0.8rem' }}>
          {getCategoryName(product.category)}
        </div>
        <div className="font-condensed text-lg font-bold mb-1 leading-tight" style={{ color: 'hsl(var(--navy))', fontSize:'1.1rem' }}>
          {product.name}
        </div>
        <div className="mb-3 flex-1 leading-relaxed" style={{ color: 'hsl(var(--muted-text))', fontSize:'0.92rem' }}>
          {product.desc.substring(0, 80)}…
        </div>
        <div className="font-condensed font-bold mb-3" style={{ color: 'hsl(var(--navy))', fontSize:'1.4rem' }}>
          {formatINR(product.price)}
          <small className="font-normal ml-1" style={{ color: 'hsl(var(--muted-text))', fontSize:'0.85rem' }}> +GST</small>
        </div>
        {!product.inStock && (
          <div className="font-semibold mb-2" style={{ color: 'hsl(var(--danger))', fontSize:'0.9rem' }}>Out of Stock</div>
        )}
        <div className="flex gap-2 mt-auto">
          {isEnquiry ? (
            <button
              className="btn-navy flex-1"
              onClick={handleEnquiry}
              style={{ fontSize:'0.92rem', background: 'hsl(210 60% 35%)' }}
            >
              📩 Enquiry Now
            </button>
          ) : (
            <button
              className="btn-navy flex-1"
              disabled={!product.inStock}
              onClick={() => addToCart(product)}
              style={{ fontSize:'0.92rem' }}
            >
              {product.inStock ? 'Add to Cart' : 'Unavailable'}
            </button>
          )}
          <button
            className="font-medium px-3 py-2 rounded border"
            style={{ background: 'hsl(var(--off))', color: 'hsl(var(--navy))', borderColor: 'hsl(var(--off2))', fontSize:'0.92rem' }}
            onClick={() => { setSelectedProduct(product); setPage('product-detail'); }}
          >
            View
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
