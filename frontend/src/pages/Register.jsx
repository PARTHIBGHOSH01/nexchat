import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const { data } = await axios.post("/api/auth/register", form);
      login(data.user, data.token);
      navigate("/rooms");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally { setLoading(false); }
  };

  return (
    <div style={s.page}>
      <div style={s.left}>
        <div style={s.leftInner}>
          <div style={s.brand}>
            <div style={s.brandIcon}>⚡</div>
            <span style={s.brandName}>NexChat</span>
          </div>
          <h1 style={s.heroTitle}>Your team<br/>chat. Reinvented.</h1>
          <p style={s.heroSub}>Join thousands of teams already using NexChat to communicate faster and build together.</p>
          <div style={s.stats}>
            <div style={s.stat}><span style={s.statNum}>10K+</span><span style={s.statLabel}>Active Users</span></div>
            <div style={s.statDivider}/>
            <div style={s.stat}><span style={s.statNum}>500+</span><span style={s.statLabel}>Chat Rooms</span></div>
            <div style={s.statDivider}/>
            <div style={s.stat}><span style={s.statNum}>99.9%</span><span style={s.statLabel}>Uptime</span></div>
          </div>
        </div>
      </div>

      <div style={s.right}>
        <div style={s.card}>
          <div style={s.cardBrand}>
            <div style={s.cardIcon}>⚡</div>
            <span style={s.cardBrandName}>NexChat</span>
          </div>
          <h2 style={s.title}>Create account</h2>
          <p style={s.subtitle}>Free forever. No credit card needed.</p>

          {error && <div style={s.error}><span>⚠️</span> {error}</div>}

          <form onSubmit={handleSubmit}>
            <div style={s.field}>
              <label style={s.label}>Display name</label>
              <input style={s.input} name="name" type="text" placeholder="What should we call you?"
                value={form.name} onChange={handleChange} required />
            </div>
            <div style={s.field}>
              <label style={s.label}>Email address</label>
              <input style={s.input} name="email" type="email" placeholder="you@example.com"
                value={form.email} onChange={handleChange} required />
            </div>
            <div style={s.field}>
              <label style={s.label}>Password</label>
              <input style={s.input} name="password" type="password" placeholder="Min. 6 characters"
                value={form.password} onChange={handleChange} required minLength={6} />
            </div>
            <button style={{...s.btn, opacity: loading ? 0.7 : 1}} disabled={loading}>
              {loading ? "Creating account…" : "Get Started Free →"}
            </button>
          </form>

          <div style={s.divider}><span>Already have an account?</span></div>
          <Link to="/login" style={s.loginLink}>Sign in instead</Link>
        </div>
      </div>

      <style>{`
        input:focus { border-color: #7C3AED !important; box-shadow: 0 0 0 3px rgba(124,58,237,0.15) !important; outline: none; }
        button:hover { transform: translateY(-1px); box-shadow: 0 8px 25px rgba(124,58,237,0.4) !important; }
      `}</style>
    </div>
  );
}

const s = {
  page: { display:"flex", minHeight:"100vh", fontFamily:"'Plus Jakarta Sans', sans-serif" },
  left: { flex:1, background:"linear-gradient(135deg, #0F172A 0%, #1e1b4b 50%, #312e81 100%)", display:"flex", alignItems:"center", justifyContent:"center", padding:"60px 40px" },
  leftInner: { maxWidth:"420px" },
  brand: { display:"flex", alignItems:"center", gap:"10px", marginBottom:"48px" },
  brandIcon: { width:"40px", height:"40px", background:"rgba(124,58,237,0.3)", borderRadius:"12px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.2rem", border:"1px solid rgba(124,58,237,0.4)" },
  brandName: { fontSize:"1.4rem", fontWeight:800, color:"#fff" },
  heroTitle: { fontSize:"3rem", fontWeight:800, color:"#fff", lineHeight:1.2, marginBottom:"20px", letterSpacing:"-1px" },
  heroSub: { fontSize:"1rem", color:"rgba(255,255,255,0.65)", lineHeight:1.7, marginBottom:"48px" },
  stats: { display:"flex", alignItems:"center", gap:"24px", background:"rgba(255,255,255,0.05)", borderRadius:"16px", padding:"20px 24px", border:"1px solid rgba(255,255,255,0.1)" },
  stat: { display:"flex", flexDirection:"column", gap:"4px" },
  statNum: { fontSize:"1.5rem", fontWeight:800, color:"#a78bfa" },
  statLabel: { fontSize:"0.75rem", color:"rgba(255,255,255,0.5)", fontWeight:500 },
  statDivider: { width:"1px", height:"40px", background:"rgba(255,255,255,0.1)" },
  right: { width:"480px", display:"flex", alignItems:"center", justifyContent:"center", padding:"40px 32px", background:"#FAFBFF" },
  card: { width:"100%", maxWidth:"380px" },
  cardBrand: { display:"flex", alignItems:"center", gap:"8px", marginBottom:"32px" },
  cardIcon: { width:"34px", height:"34px", background:"linear-gradient(135deg, #7C3AED, #EC4899)", borderRadius:"10px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1rem" },
  cardBrandName: { fontSize:"1.2rem", fontWeight:800, background:"linear-gradient(135deg, #7C3AED, #EC4899)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" },
  title: { fontSize:"1.8rem", fontWeight:800, color:"#1a1a2e", marginBottom:"6px", letterSpacing:"-0.5px" },
  subtitle: { color:"#6b7280", fontSize:"0.9rem", marginBottom:"28px" },
  error: { background:"#fff1f2", border:"1px solid #fecdd3", color:"#e11d48", padding:"12px 16px", borderRadius:"12px", marginBottom:"20px", fontSize:"0.88rem", display:"flex", alignItems:"center", gap:"8px" },
  field: { marginBottom:"16px" },
  label: { display:"block", fontSize:"0.85rem", fontWeight:600, color:"#374151", marginBottom:"7px" },
  input: { width:"100%", border:"2px solid #e5e7eb", borderRadius:"12px", padding:"13px 16px", fontSize:"0.95rem", color:"#1a1a2e", background:"#fff", transition:"all 0.2s" },
  btn: { width:"100%", background:"linear-gradient(135deg, #7C3AED, #EC4899)", color:"#fff", border:"none", borderRadius:"12px", padding:"14px", fontSize:"1rem", fontWeight:700, cursor:"pointer", marginTop:"8px", transition:"all 0.2s" },
  divider: { textAlign:"center", margin:"22px 0", color:"#9ca3af", fontSize:"0.85rem" },
  loginLink: { display:"block", textAlign:"center", color:"#7C3AED", fontWeight:700, fontSize:"0.95rem", textDecoration:"none", padding:"12px", border:"2px solid #ede9fe", borderRadius:"12px" },
};
