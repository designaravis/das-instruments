import { useState } from "react";

type AuthRole = 'none' | 'admin' | 'customer';

interface NavBarProps {
  page: string;
  setPage: (page: string) => void;
  cartCount: number;
  authRole?: AuthRole;
  customerName?: string;
  onLogout?: () => void;
}

const NavBar = ({ page, setPage, cartCount, authRole = 'none', customerName = '', onLogout }: NavBarProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { id: 'home',     label: 'Home' },
    { id: 'products', label: 'Products' },
    { id: 'about',    label: 'About' },
    { id: 'contact',  label: 'Contact' },
  ];

  const handleNav = (id: string) => { setPage(id); setMobileOpen(false); };

  return (
    <nav className={`das-nav${mobileOpen ? ' mobile-nav-open' : ''}`}>
      <div className="nav-logo" onClick={() => handleNav('home')}>
        <img src="/daslogoo.svg" alt="DAS Instruments Logo" className="nav-logo-img" />
      </div>

      <div className="nav-links-desktop flex gap-1 items-center">
        {links.map(l => (
          <div key={l.id} className={`nav-link${page === l.id ? ' active' : ''}`} onClick={() => handleNav(l.id)}>
            {l.label}
          </div>
        ))}
        {authRole === 'admin' && (
          <div className="nav-link" style={{ color: 'hsl(var(--navy))', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600 }} onClick={() => handleNav('admin')}>
            Admin Panel ↗
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {authRole === 'customer' && (
          <button onClick={() => handleNav('my-account')} style={{
            background: 'hsl(var(--off2))', color: 'hsl(var(--navy))', border: 'none',
            borderRadius: 6, padding: '0.35rem 0.75rem', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
            maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
          }}>
            👤 {customerName || 'My Account'}
          </button>
        )}
        {authRole !== 'none' && onLogout && (
          <button onClick={onLogout} style={{ background: 'transparent', color: 'hsl(var(--muted-text))', border: '1px solid hsl(var(--off2))', borderRadius: 6, padding: '0.35rem 0.7rem', fontSize: '0.78rem', fontWeight: 500, cursor: 'pointer' }}>
            Logout
          </button>
        )}
        {authRole === 'none' && (
          <button onClick={() => handleNav('login')} style={{ background: 'transparent', color: 'hsl(var(--navy))', border: '1.5px solid hsl(var(--navy))', borderRadius: 6, padding: '0.35rem 0.8rem', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>
            Login
          </button>
        )}
        <button className="cart-btn" onClick={() => handleNav('cart')}>
          🛒 Cart
          {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
        </button>
        <button
          className="nav-hamburger"
          onClick={() => setMobileOpen(o => !o)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', lineHeight: 1, padding: '4px 6px', color: 'hsl(var(--navy))' }}
          aria-label="Menu"
        >
          {mobileOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile dropdown */}
      <div className="mobile-nav-dropdown">
        {links.map(l => (
          <div key={l.id} className={`nav-link${page === l.id ? ' active' : ''}`} onClick={() => handleNav(l.id)}>
            {l.label}
          </div>
        ))}
        {authRole === 'admin' && (
          <div className="nav-link" style={{ color: 'hsl(var(--navy))', fontWeight: 600 }} onClick={() => handleNav('admin')}>
            Admin Panel ↗
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
