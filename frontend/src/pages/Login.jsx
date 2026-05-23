import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const { data } = await axios.post("/api/auth/login", form);
      login(data.user, data.token);
      navigate("/rooms");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally { setLoading(false); }
  };

  return (
    <div style={s.page}>
      {/* Left panel */}
      <div style={s.left}>
        <div style={s.leftInner}>
          <div style={s.brand}>
            <div style={s.brandIcon}>⚡</div>
            <span style={s.brandName}>NexChat</span>
          </div>
          <h1 style={s.heroTitle}>Connect.<br/>Collaborate.<br/>Create.</h1>
          <p style={s.heroSub}>Real-time messaging for teams and communities that move fast.</p>
          <div style={s.bubbles}>
            <div style={{...s.bubble, ...s.b1}}>👋 Hey team, standups at 10!</div>
            <div style={{...s.bubble, ...s.b2}}>🚀 Just shipped the new feature!</div>
            <div style={{...s.bubble, ...s.b3}}>✅ Great work everyone!</div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div style={s.right}>
        <div style={s.card}>
          <div style={s.cardBrand}>
            <div style={s.cardIcon}>⚡</div>
            <span style={s.cardBrandName}>NexChat</span>
          </div>
          <h2 style={s.title}>Welcome back!</h2>
          <p style={s.subtitle}>Sign in to your workspace</p>

          {error && (
            <div style={s.error}>
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={s.field}>
              <label style={s.label}>Email address</label>
              <input style={s.input} name="email" type="email" placeholder="you@example.com"
                value={form.email} onChange={handleChange} required />
            </div>
            <div style={s.field}>
              <label style={s.label}>Password</label>
              <input style={s.input} name="password" type="password" placeholder="••••••••"
                value={form.password} onChange={handleChange} required />
            </div>
            <button style={{...s.btn, opacity: loading ? 0.7 : 1}} disabled={loading}>
              {loading ? "Signing in…" : "Sign In →"}
            </button>
          </form>

          <div style={s.divider}><span>New to NexChat?</span></div>
          <Link to="/register" style={s.registerLink}>Create a free account</Link>
        </div>
      </div>

      <style>{`
        @keyframes float1 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes float2 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes float3 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        input:focus { border-color: #7C3AED !important; box-shadow: 0 0 0 3px rgba(124,58,237,0.15) !important; outline: none; }
        button:hover { transform: translateY(-1px); box-shadow: 0 8px 25px rgba(124,58,237,0.4) !important; }
      `}</style>
    </div>
  );
}

const s = {
  page: { display:"flex", minHeight:"100vh", fontFamily:"'Plus Jakarta Sans', sans-serif" },
  left: { flex:1, background:"linear-gradient(135deg, #7C3AED 0%, #EC4899 50%, #F59E0B 100%)", display:"flex", alignItems:"center", justifyContent:"center", padding:"60px 40px", position:"relative", overflow:"hidden" },
  leftInner: { maxWidth:"420px", position:"relative", zIndex:1 },
  brand: { display:"flex", alignItems:"center", gap:"10px", marginBottom:"48px" },
  brandIcon: { width:"40px", height:"40px", background:"rgba(255,255,255,0.2)", borderRadius:"12px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.2rem", backdropFilter:"blur(10px)" },
  brandName: { fontSize:"1.4rem", fontWeight:800, color:"#fff", letterSpacing:"-0.5px" },
  heroTitle: { fontSize:"3.2rem", fontWeight:800, color:"#fff", lineHeight:1.15, marginBottom:"20px", letterSpacing:"-1px" },
  heroSub: { fontSize:"1.05rem", color:"rgba(255,255,255,0.85)", lineHeight:1.6, marginBottom:"48px" },
  bubbles: { display:"flex", flexDirection:"column", gap:"12px" },
  bubble: { background:"rgba(255,255,255,0.15)", backdropFilter:"blur(20px)", border:"1px solid rgba(255,255,255,0.25)", borderRadius:"16px", padding:"12px 18px", color:"#fff", fontSize:"0.9rem", fontWeight:500, width:"fit-content" },
  b1: { animation:"float1 3s ease-in-out infinite" },
  b2: { animation:"float2 3.5s ease-in-out infinite", marginLeft:"20px" },
  b3: { animation:"float3 2.8s ease-in-out infinite", marginLeft:"40px" },
  right: { width:"480px", display:"flex", alignItems:"center", justifyContent:"center", padding:"40px 32px", background:"#FAFBFF" },
  card: { width:"100%", maxWidth:"380px" },
  cardBrand: { display:"flex", alignItems:"center", gap:"8px", marginBottom:"36px" },
  cardIcon: { width:"34px", height:"34px", background:"linear-gradient(135deg, #7C3AED, #EC4899)", borderRadius:"10px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1rem" },
  cardBrandName: { fontSize:"1.2rem", fontWeight:800, background:"linear-gradient(135deg, #7C3AED, #EC4899)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" },
  title: { fontSize:"1.8rem", fontWeight:800, color:"#1a1a2e", marginBottom:"6px", letterSpacing:"-0.5px" },
  subtitle: { color:"#6b7280", fontSize:"0.95rem", marginBottom:"28px" },
  error: { background:"#fff1f2", border:"1px solid #fecdd3", color:"#e11d48", padding:"12px 16px", borderRadius:"12px", marginBottom:"20px", fontSize:"0.88rem", display:"flex", alignItems:"center", gap:"8px" },
  field: { marginBottom:"18px" },
  label: { display:"block", fontSize:"0.85rem", fontWeight:600, color:"#374151", marginBottom:"7px" },
  input: { width:"100%", border:"2px solid #e5e7eb", borderRadius:"12px", padding:"13px 16px", fontSize:"0.95rem", color:"#1a1a2e", background:"#fff", transition:"all 0.2s" },
  btn: { width:"100%", background:"linear-gradient(135deg, #7C3AED, #EC4899)", color:"#fff", border:"none", borderRadius:"12px", padding:"14px", fontSize:"1rem", fontWeight:700, cursor:"pointer", marginTop:"8px", transition:"all 0.2s", letterSpacing:"0.3px" },
  divider: { textAlign:"center", margin:"24px 0", color:"#9ca3af", fontSize:"0.85rem" },
  registerLink: { display:"block", textAlign:"center", color:"#7C3AED", fontWeight:700, fontSize:"0.95rem", textDecoration:"none", padding:"12px", border:"2px solid #ede9fe", borderRadius:"12px", transition:"all 0.2s" },
};
