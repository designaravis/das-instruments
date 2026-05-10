import { useState } from "react";
import { db } from "@/lib/db";

type LoginMode = 'choose' | 'admin' | 'customer-login' | 'customer-register';

interface LoginPageProps {
  onAdminLogin: () => void;
  onCustomerLogin: (customerId: string, name: string) => void;
  onGoHome: () => void;
}

const InputField = ({ label, type = 'text', placeholder, value, onChange, required = false }: any) => (
  <div className="flex flex-col gap-1 mb-4">
    <label className="text-xs font-semibold" style={{ color: 'hsl(var(--muted-text))' }}>
      {label}{required && ' *'}
    </label>
    <input
      className="das-input"
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
    />
  </div>
);

const LoginPage = ({ onAdminLogin, onCustomerLogin, onGoHome }: LoginPageProps) => {
  const [mode, setMode] = useState<LoginMode>('choose');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Admin form
  const [adminForm, setAdminForm] = useState({ username: '', password: '' });

  // Customer login form
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });

  // Customer register form
  const [regForm, setRegForm] = useState({
    name: '', email: '', phone: '', company: '',
    password: '', confirmPassword: '',
  });

  const reset = (m: LoginMode) => { setMode(m); setError(''); setSuccessMsg(''); };

  // ── Admin login ───────────────────────────────────────────────
  const handleAdminLogin = () => {
    if (!adminForm.username || !adminForm.password) { setError('Enter username and password.'); return; }
    setLoading(true); setError('');
    setTimeout(() => {
      if (db.verifyAdmin(adminForm.username, adminForm.password)) {
        sessionStorage.setItem('das_auth', 'admin');
        onAdminLogin();
      } else {
        setError('Invalid username or password.');
      }
      setLoading(false);
    }, 500);
  };

  // ── Customer login ────────────────────────────────────────────
  const handleCustomerLogin = async () => {
    if (!loginForm.email || !loginForm.password) { setError('Enter email and password.'); return; }
    setLoading(true); setError('');
    try {
      const result = await db.loginCustomer(loginForm.email, loginForm.password);
      if (result.ok && result.customer) {
        sessionStorage.setItem('das_auth', 'customer');
        sessionStorage.setItem('das_customer', JSON.stringify({ id: result.customer.id, name: result.customer.name, email: result.customer.email }));
        onCustomerLogin(result.customer.id, result.customer.name);
      } else {
        setError(result.error || 'Login failed.');
      }
    } catch { setError('Login failed. Please try again.'); }
    finally { setLoading(false); }
  };

  // ── Customer register ─────────────────────────────────────────
  const handleRegister = async () => {
    if (!regForm.name || !regForm.email || !regForm.phone || !regForm.password) {
      setError('Please fill all required fields.'); return;
    }
    if (regForm.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (regForm.password !== regForm.confirmPassword) { setError('Passwords do not match.'); return; }
    setLoading(true); setError('');
    try {
      const result = await db.registerCustomer({
        name: regForm.name, email: regForm.email,
        phone: regForm.phone, company: regForm.company, password: regForm.password,
      });
      if (result.ok && result.customer) {
        setSuccessMsg('Account created! You can now log in.');
        setLoginForm({ email: regForm.email, password: '' });
        setRegForm({ name:'', email:'', phone:'', company:'', password:'', confirmPassword:'' });
        setTimeout(() => { setSuccessMsg(''); reset('customer-login'); }, 1800);
      } else {
        setError(result.error || 'Registration failed.');
      }
    } catch { setError('Registration failed. Please try again.'); }
    finally { setLoading(false); }
  };

  const logoBlock = (
    <div style={{ textAlign:'center', marginBottom:'2rem' }}>
      <div style={{
        width:56, height:56, background:'#fff', borderRadius:12,
        display:'inline-flex', alignItems:'center', justifyContent:'center',
        fontFamily:'var(--font-condensed)', fontWeight:700, fontSize:22,
        color:'hsl(var(--navy))', marginBottom:12
      }}>DAS</div>
      <div style={{ fontFamily:'var(--font-condensed)', fontSize:'1.4rem', fontWeight:700, color:'#fff' }}>
        DAS Instruments & Solutions
      </div>
      <div style={{ color:'rgba(255,255,255,0.55)', fontSize:'0.85rem', marginTop:4 }}>
        Chennai's Scientific Instrument Company
      </div>
    </div>
  );

  return (
    <div style={{
      minHeight:'100vh',
      background:'linear-gradient(135deg, hsl(var(--navy2)) 0%, hsl(var(--navy)) 60%, hsl(var(--navy3)) 100%)',
      display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem',
      position:'relative', overflow:'hidden'
    }}>
      <div style={{ position:'absolute', inset:0, opacity:0.04,
        backgroundImage:'repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%)',
        backgroundSize:'24px 24px' }} />

      <div style={{ position:'relative', width:'100%', maxWidth: mode === 'customer-register' ? 520 : 420 }}>
        {/* Back to Home button */}
        <button
          onClick={onGoHome}
          style={{
            display:'flex', alignItems:'center', gap:6,
            background:'rgba(255,255,255,0.12)', border:'1px solid rgba(255,255,255,0.25)',
            color:'#fff', borderRadius:8, padding:'0.45rem 1rem',
            fontSize:'0.92rem', fontWeight:600, cursor:'pointer', marginBottom:'1.25rem'
          }}
        >
          ← Back to Home
        </button>

        {logoBlock}

        <div style={{ background:'#fff', borderRadius:16, padding:'2rem', boxShadow:'0 24px 80px rgba(0,0,0,0.3)' }}>

          {/* ── CHOOSE ── */}
          {mode === 'choose' && (
            <div>
              <h2 style={{ fontFamily:'var(--font-condensed)', fontSize:'1.5rem', fontWeight:700, color:'hsl(var(--navy))', marginBottom:6 }}>Welcome</h2>
              <p style={{ color:'hsl(var(--muted-text))', fontSize:'0.88rem', marginBottom:'1.5rem' }}>Sign in or create an account</p>
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                <button onClick={() => reset('customer-login')} style={{
                  padding:'1rem 1.5rem', borderRadius:10, border:'2px solid hsl(var(--navy))',
                  background:'transparent', cursor:'pointer', textAlign:'left'
                }}>
                  <div style={{ fontWeight:700, color:'hsl(var(--navy))' }}>🛒 Customer Login</div>
                  <div style={{ color:'hsl(var(--muted-text))', fontSize:'0.8rem', marginTop:2 }}>Sign in to your account to shop & track orders</div>
                </button>
                <button onClick={() => reset('customer-register')} style={{
                  padding:'1rem 1.5rem', borderRadius:10, border:'2px solid hsl(var(--off2))',
                  background:'transparent', cursor:'pointer', textAlign:'left'
                }}>
                  <div style={{ fontWeight:700, color:'hsl(var(--navy))' }}>✨ New Customer? Register</div>
                  <div style={{ color:'hsl(var(--muted-text))', fontSize:'0.8rem', marginTop:2 }}>Create a free account to place orders</div>
                </button>
                <button onClick={() => reset('admin')} style={{
                  padding:'0.75rem 1.5rem', borderRadius:10,
                  border:'1px dashed hsl(var(--off2))',
                  background:'transparent', cursor:'pointer', textAlign:'left'
                }}>
                  <div style={{ fontWeight:600, color:'hsl(var(--muted-text))', fontSize:'0.85rem' }}>👤 Admin Login</div>
                </button>
              </div>
            </div>
          )}

          {/* ── ADMIN LOGIN ── */}
          {mode === 'admin' && (
            <div>
              <button onClick={() => reset('choose')} style={{ background:'none', border:'none', cursor:'pointer', color:'hsl(var(--navy))', fontSize:'0.85rem', fontWeight:600, marginBottom:'1rem', padding:0 }}>← Back</button>
              <h2 style={{ fontFamily:'var(--font-condensed)', fontSize:'1.5rem', fontWeight:700, color:'hsl(var(--navy))', marginBottom:'1.25rem' }}>Admin Login</h2>
              {error && <div style={{ background:'#f8d7da', color:'hsl(var(--danger))', padding:'0.65rem 1rem', borderRadius:8, fontSize:'0.88rem', marginBottom:'1rem' }}>⚠️ {error}</div>}
              <InputField label="Username" placeholder="admin" value={adminForm.username}
                onChange={(e:any) => setAdminForm(f=>({...f, username:e.target.value}))} required />
              <InputField label="Password" type="password" placeholder="••••••••" value={adminForm.password}
                onChange={(e:any) => setAdminForm(f=>({...f, password:e.target.value}))} required />
              <button className="btn-primary-das" style={{ width:'100%', padding:'0.75rem' }}
                onClick={handleAdminLogin} disabled={loading}>
                {loading ? 'Signing in…' : '🔐 Sign in as Admin'}
              </button>
            </div>
          )}

          {/* ── CUSTOMER LOGIN ── */}
          {mode === 'customer-login' && (
            <div>
              <button onClick={() => reset('choose')} style={{ background:'none', border:'none', cursor:'pointer', color:'hsl(var(--navy))', fontSize:'0.85rem', fontWeight:600, marginBottom:'1rem', padding:0 }}>← Back</button>
              <h2 style={{ fontFamily:'var(--font-condensed)', fontSize:'1.5rem', fontWeight:700, color:'hsl(var(--navy))', marginBottom:'1.25rem' }}>Customer Login</h2>
              {error && <div style={{ background:'#f8d7da', color:'hsl(var(--danger))', padding:'0.65rem 1rem', borderRadius:8, fontSize:'0.88rem', marginBottom:'1rem' }}>⚠️ {error}</div>}
              {successMsg && <div style={{ background:'#d4edda', color:'#155724', padding:'0.65rem 1rem', borderRadius:8, fontSize:'0.88rem', marginBottom:'1rem' }}>✅ {successMsg}</div>}
              <InputField label="Email" type="email" placeholder="you@email.com" value={loginForm.email}
                onChange={(e:any) => setLoginForm(f=>({...f, email:e.target.value}))} required />
              <InputField label="Password" type="password" placeholder="••••••••" value={loginForm.password}
                onChange={(e:any) => setLoginForm(f=>({...f, password:e.target.value}))} required />
              <button className="btn-primary-das" style={{ width:'100%', padding:'0.75rem', marginBottom:'1rem' }}
                onClick={handleCustomerLogin} disabled={loading}>
                {loading ? 'Signing in…' : '🛒 Sign In'}
              </button>
              <div style={{ textAlign:'center', fontSize:'0.85rem', color:'hsl(var(--muted-text))' }}>
                No account yet?{' '}
                <span style={{ color:'hsl(var(--navy))', cursor:'pointer', fontWeight:600 }} onClick={() => reset('customer-register')}>
                  Register here →
                </span>
              </div>
            </div>
          )}

          {/* ── CUSTOMER REGISTER ── */}
          {mode === 'customer-register' && (
            <div>
              <button onClick={() => reset('choose')} style={{ background:'none', border:'none', cursor:'pointer', color:'hsl(var(--navy))', fontSize:'0.85rem', fontWeight:600, marginBottom:'1rem', padding:0 }}>← Back</button>
              <h2 style={{ fontFamily:'var(--font-condensed)', fontSize:'1.5rem', fontWeight:700, color:'hsl(var(--navy))', marginBottom:'0.25rem' }}>Create Account</h2>
              <p style={{ color:'hsl(var(--muted-text))', fontSize:'0.85rem', marginBottom:'1.25rem' }}>Free registration — takes 30 seconds</p>
              {error && <div style={{ background:'#f8d7da', color:'hsl(var(--danger))', padding:'0.65rem 1rem', borderRadius:8, fontSize:'0.88rem', marginBottom:'1rem' }}>⚠️ {error}</div>}
              <div className="grid grid-cols-2 gap-x-4">
                <InputField label="Full Name" placeholder="Dr. Ramesh Kumar" value={regForm.name}
                  onChange={(e:any) => setRegForm(f=>({...f, name:e.target.value}))} required />
                <InputField label="Email" type="email" placeholder="you@email.com" value={regForm.email}
                  onChange={(e:any) => setRegForm(f=>({...f, email:e.target.value}))} required />
                <InputField label="Phone" placeholder="+91 99999 99999" value={regForm.phone}
                  onChange={(e:any) => setRegForm(f=>({...f, phone:e.target.value}))} required />
                <InputField label="Company / Institution" placeholder="IIT Madras / BPCL" value={regForm.company}
                  onChange={(e:any) => setRegForm(f=>({...f, company:e.target.value}))} />
                <InputField label="Password (min 6 chars)" type="password" placeholder="••••••••" value={regForm.password}
                  onChange={(e:any) => setRegForm(f=>({...f, password:e.target.value}))} required />
                <InputField label="Confirm Password" type="password" placeholder="••••••••" value={regForm.confirmPassword}
                  onChange={(e:any) => setRegForm(f=>({...f, confirmPassword:e.target.value}))} required />
              </div>
              <button className="btn-primary-das" style={{ width:'100%', padding:'0.75rem', marginBottom:'1rem' }}
                onClick={handleRegister} disabled={loading}>
                {loading ? 'Creating account…' : '✨ Create My Account'}
              </button>
              <div style={{ textAlign:'center', fontSize:'0.85rem', color:'hsl(var(--muted-text))' }}>
                Already registered?{' '}
                <span style={{ color:'hsl(var(--navy))', cursor:'pointer', fontWeight:600 }} onClick={() => reset('customer-login')}>
                  Sign in →
                </span>
              </div>
            </div>
          )}
        </div>
        <div style={{ textAlign:'center', marginTop:'1.5rem', color:'rgba(255,255,255,0.4)', fontSize:'0.78rem' }}>
          © 2025 DAS Instruments & Solutions, Chennai
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
