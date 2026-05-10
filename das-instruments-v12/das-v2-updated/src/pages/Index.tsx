import { useState, useEffect } from "react";
import { Product } from "@/data/products";
import { CartItem } from "@/lib/store";
import NavBar from "@/components/NavBar";
import DasFooter from "@/components/DasFooter";
import DasToast from "@/components/DasToast";
import HomePage from "@/pages/HomePage";
import ProductsPage from "@/pages/ProductsPage";
import ProductDetailPage from "@/pages/ProductDetailPage";
import CartPage from "@/pages/CartPage";
import CheckoutPage from "@/pages/CheckoutPage";
import OrderSuccessPage from "@/pages/OrderSuccessPage";
import AboutPage from "@/pages/AboutPage";
import ContactPage from "@/pages/ContactPage";
import AdminPanel from "@/pages/AdminPanel";
import LoginPage from "@/pages/LoginPage";
import MyAccountPage from "@/pages/MyAccountPage";
import PrivacyPage from "@/pages/PrivacyPage";
import TermsPage from "@/pages/TermsPage";
import RefundPage from "@/pages/RefundPage";

type AuthRole = 'none' | 'admin' | 'customer';

const Index = () => {
  const [auth, setAuth] = useState<AuthRole>(() => {
    const s = sessionStorage.getItem('das_auth');
    if (s === 'admin') return 'admin';
    if (s === 'customer') return 'customer';
    return 'none';
  });
  const [customerName, setCustomerName] = useState<string>(() => {
    try { return JSON.parse(sessionStorage.getItem('das_customer') || '{}')?.name || ''; } catch { return ''; }
  });

  const [page, setPage]                       = useState('home');
  const [cart, setCart]                       = useState<CartItem[]>([]);
  const [selectedCat, setSelectedCat]         = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [toast, setToast]                     = useState({ show: false, msg: '' });
  const [pendingPage, setPendingPage]         = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast({ show: true, msg });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 2500);
  };

  const addToCart = (product: Product) => {
    setCart(c => {
      const ex = c.find(i => i.id === product.id);
      if (ex) return c.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...c, { ...product, qty: 1 }];
    });
    showToast(product.name + ' added to cart');
  };

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const handleSetPage = (p: string) => {
    if (p === 'admin' && auth !== 'admin') { setPendingPage('admin'); setPage('login'); return; }
    if (p === 'my-account' && auth !== 'customer') { setPendingPage('my-account'); setPage('login'); return; }
    setPage(p);
    window.scrollTo(0, 0);
  };

  const handleAdminLogin = () => {
    sessionStorage.setItem('das_auth', 'admin');
    setAuth('admin'); setPage(pendingPage || 'admin'); setPendingPage(null);
  };

  const handleCustomerLogin = (customerId: string, name: string) => {
    setAuth('customer'); setCustomerName(name);
    setPage(pendingPage || 'home'); setPendingPage(null);
    showToast(`Welcome back, ${name}!`);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('das_auth');
    sessionStorage.removeItem('das_customer');
    setAuth('none'); setCustomerName('');
    setPage('home');
    showToast('Signed out successfully');
  };

  const isAdmin = page === 'admin' && auth === 'admin';

  // Hidden admin access: Ctrl + Shift + A
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        handleSetPage('admin');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [auth]);

  return (
    <div>
      {page === 'login' && (
        <LoginPage onAdminLogin={handleAdminLogin} onCustomerLogin={handleCustomerLogin} onGoHome={() => setPage('home')} />
      )}
      {page !== 'login' && (
        <>
          <NavBar page={page} setPage={handleSetPage} cartCount={cartCount} authRole={auth} customerName={customerName} onLogout={handleLogout} />
          {!isAdmin && (
            <div>
              {page === 'home'           && <HomePage setPage={handleSetPage} setSelectedCat={setSelectedCat} setSelectedProduct={setSelectedProduct} addToCart={addToCart} />}
              {page === 'products'       && <ProductsPage selectedCat={selectedCat} setSelectedCat={setSelectedCat} setSelectedProduct={setSelectedProduct} setPage={handleSetPage} addToCart={addToCart} />}
              {page === 'product-detail' && <ProductDetailPage product={selectedProduct} setPage={handleSetPage} addToCart={addToCart} />}
              {page === 'cart'           && <CartPage cart={cart} setCart={setCart} setPage={handleSetPage} />}
              {page === 'checkout'       && <CheckoutPage cart={cart} setCart={setCart} setPage={handleSetPage} />}
              {page === 'order-success'  && <OrderSuccessPage setPage={handleSetPage} />}
              {page === 'about'          && <AboutPage />}
              {page === 'contact'        && <ContactPage />}
              {page === 'my-account'     && <MyAccountPage setPage={handleSetPage} onLogout={handleLogout} />}
              {page === 'privacy'        && <PrivacyPage />}
              {page === 'terms'          && <TermsPage />}
              {page === 'refund'         && <RefundPage />}
              <DasFooter setPage={handleSetPage} />
            </div>
          )}
          {isAdmin && <AdminPanel onLogout={handleLogout} />}
          <DasToast msg={toast.msg} show={toast.show} />

          {/* WhatsApp Floating Button — always visible */}
          <a
            className="whatsapp-fab"
            href="https://wa.me/918807243902?text=Hello%20DAS%20Instruments%2C%20I%20would%20like%20to%20enquire%20about%20your%20products."
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat on WhatsApp"
          >
            <span className="whatsapp-fab-tooltip">Chat with us</span>
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </a>
        </>
      )}
    </div>
  );
};

export default Index;
