import { CartItem, formatINR, getCategoryName } from "@/lib/store";

interface Props {
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  setPage: (page: string) => void;
}

const CartPage = ({ cart, setCart, setPage }: Props) => {
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const gst = total * 0.18;

  if (cart.length === 0) return (
    <div className="py-16 px-8 max-w-[1200px] mx-auto text-center" style={{ color: 'hsl(var(--muted-text))' }}>
      <div className="text-5xl mb-4">🛒</div>
      <div className="font-condensed text-xl font-bold mb-2" style={{ color: 'hsl(var(--navy))' }}>Your cart is empty</div>
      <div>Add some instruments to get started</div>
      <button className="btn-primary-das mt-6" onClick={() => setPage('products')}>Browse Products</button>
    </div>
  );

  return (
    <div>
      <div className="page-hero">
        <h1 className="font-condensed text-4xl font-bold tracking-wide">Shopping Cart</h1>
        <p className="mt-2" style={{ color: 'rgba(255,255,255,0.7)' }}>{cart.length} items in your cart</p>
      </div>
      <div className="py-16 px-8 max-w-[1200px] mx-auto">
        <div className="grid gap-8" style={{ gridTemplateColumns: '1fr 340px' }}>
          <div>
            {cart.map(item => (
              <div key={item.id} className="cart-item">
                <div className="w-[72px] h-[72px] rounded flex items-center justify-center text-3xl flex-shrink-0 border" style={{ background: 'hsl(var(--off))', borderColor: 'hsl(var(--off2))' }}>
                  {item.icon}
                </div>
                <div className="flex-1">
                  <div className="font-condensed text-base font-bold" style={{ color: 'hsl(var(--navy))' }}>{item.name}</div>
                  <div className="text-xs" style={{ color: 'hsl(var(--muted-text))' }}>{getCategoryName(item.category)}</div>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="qty-ctrl">
                      <button className="qty-btn" onClick={() => setCart(c => c.map(i => i.id === item.id && i.qty > 1 ? { ...i, qty: i.qty - 1 } : i))}>-</button>
                      <span className="qty-num">{item.qty}</span>
                      <button className="qty-btn" onClick={() => setCart(c => c.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i))}>+</button>
                    </div>
                  </div>
                </div>
                <div className="font-condensed text-xl font-bold" style={{ color: 'hsl(var(--navy))' }}>{formatINR(item.price * item.qty)}</div>
                <button className="text-xl cursor-pointer bg-transparent border-none p-1" style={{ color: 'hsl(var(--danger))' }} onClick={() => setCart(c => c.filter(i => i.id !== item.id))}>✕</button>
              </div>
            ))}
          </div>
          <div className="order-summary">
            <div className="font-condensed text-lg font-bold mb-5" style={{ color: 'hsl(var(--navy))' }}>Order Summary</div>
            <div className="flex justify-between py-2 text-sm border-b" style={{ borderColor: 'hsl(var(--off2))' }}>
              <span>Subtotal</span><span>{formatINR(total)}</span>
            </div>
            <div className="flex justify-between py-2 text-sm border-b" style={{ borderColor: 'hsl(var(--off2))' }}>
              <span>GST (18%)</span><span>{formatINR(Math.round(gst))}</span>
            </div>
            <div className="flex justify-between py-2 text-sm border-b" style={{ borderColor: 'hsl(var(--off2))' }}>
              <span>Shipping</span><span style={{ color: 'hsl(var(--success))' }}>Free</span>
            </div>
            <div className="flex justify-between pt-4 mt-2 font-bold text-lg" style={{ borderTop: '2px solid hsl(var(--navy))', color: 'hsl(var(--navy))' }}>
              <span>Total</span><span>{formatINR(Math.round(total + gst))}</span>
            </div>
            <button className="btn-primary-das w-full mt-6 py-3 text-base" onClick={() => setPage('checkout')}>Proceed to Checkout →</button>
            <button
              className="w-full mt-3 py-2 rounded border cursor-pointer text-sm"
              style={{ background: 'none', borderColor: 'hsl(var(--off2))', color: 'hsl(var(--muted-text))' }}
              onClick={() => setPage('products')}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
