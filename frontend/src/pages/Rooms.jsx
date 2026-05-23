import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const ROOM_COLORS = ["#7C3AED","#EC4899","#F59E0B","#10B981","#3B82F6","#EF4444","#8B5CF6","#06B6D4"];
const getRoomColor = (name) => ROOM_COLORS[name.charCodeAt(0) % ROOM_COLORS.length];

export default function Rooms() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    axios.get("/api/rooms").then(({ data }) => setRooms(data))
      .catch(() => setError("Failed to load rooms"))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault(); setError("");
    try {
      const { data } = await axios.post("/api/rooms", form);
      setRooms([data, ...rooms]);
      setForm({ name: "", description: "" });
      setShowCreate(false);
    } catch (err) { setError(err.response?.data?.message || "Failed to create room"); }
  };

  const filtered = rooms.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={s.page}>
      {/* Sidebar */}
      <div style={s.sidebar}>
        <div style={s.sidebarTop}>
          <div style={s.sidebarBrand}>
            <div style={s.sidebarIcon}>⚡</div>
            <span style={s.sidebarName}>NexChat</span>
          </div>
          <div style={s.userCard}>
            <div style={s.userAvatar}>{user?.name?.charAt(0).toUpperCase()}</div>
            <div>
              <p style={s.userName}>{user?.name}</p>
              <p style={s.userStatus}>🟢 Online</p>
            </div>
          </div>
          <div style={s.sidebarSection}>CHANNELS ({rooms.length})</div>
          <div style={s.channelList}>
            {rooms.slice(0,8).map(r => (
              <div key={r._id} style={s.channelItem} onClick={() => navigate(`/chat/${r._id}`)}>
                <span style={{color: getRoomColor(r.name), fontWeight:700}}>#</span>
                <span style={s.channelName}>{r.name}</span>
              </div>
            ))}
          </div>
        </div>
        <button style={s.logoutBtn} onClick={logout}>← Sign Out</button>
      </div>

      {/* Main */}
      <div style={s.main}>
        {/* Top bar */}
        <div style={s.topbar}>
          <div>
            <h1 style={s.pageTitle}>All Channels</h1>
            <p style={s.pageSubtitle}>{rooms.length} channels available</p>
          </div>
          <button style={s.createBtn} onClick={() => setShowCreate(!showCreate)}>
            {showCreate ? "✕ Cancel" : "+ New Channel"}
          </button>
        </div>

        {/* Create form */}
        {showCreate && (
          <div style={s.createBox}>
            <h3 style={s.createTitle}>✨ Create a new channel</h3>
            {error && <div style={s.error}>⚠️ {error}</div>}
            <form onSubmit={handleCreate} style={s.createForm}>
              <input style={s.input} placeholder="channel-name" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} required />
              <input style={s.input} placeholder="Description (optional)" value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })} />
              <button style={s.submitBtn}>Create Channel →</button>
            </form>
          </div>
        )}

        {/* Search */}
        <div style={s.searchWrap}>
          <span style={s.searchIcon}>🔍</span>
          <input style={s.searchInput} placeholder="Search channels…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {/* Room Grid */}
        {loading ? (
          <div style={s.empty}>Loading channels…</div>
        ) : filtered.length === 0 ? (
          <div style={s.empty}>No channels found. Create one!</div>
        ) : (
          <div style={s.grid}>
            {filtered.map(room => {
              const color = getRoomColor(room.name);
              return (
                <div key={room._id} style={s.card} onClick={() => navigate(`/chat/${room._id}`)}>
                  <div style={{...s.cardHeader, background: `linear-gradient(135deg, ${color}22, ${color}11)`, borderBottom:`3px solid ${color}`}}>
                    <div style={{...s.roomIconBig, background:color}}>
                      {room.name.charAt(0).toUpperCase()}
                    </div>
                    <div style={{...s.hashBadge, color, border:`1px solid ${color}33`}}>#</div>
                  </div>
                  <div style={s.cardBody}>
                    <p style={s.roomName}>#{room.name}</p>
                    {room.description && <p style={s.roomDesc}>{room.description}</p>}
                    <div style={s.cardMeta}>
                      <span style={s.metaTag}>👤 {room.members.length} members</span>
                      <span style={s.metaTag}>by {room.creator?.name}</span>
                    </div>
                    <div style={{...s.joinBtn, background:color}}>Join Channel →</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <style>{`
        div[style*="card"]:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(0,0,0,0.1) !important; }
        div[style*="channelItem"]:hover { background: rgba(124,58,237,0.1) !important; }
      `}</style>
    </div>
  );
}

const s = {
  page: { display:"flex", height:"100vh", fontFamily:"'Plus Jakarta Sans', sans-serif", background:"#F3F0FF" },
  sidebar: { width:"240px", background:"linear-gradient(180deg, #1e1b4b 0%, #312e81 100%)", display:"flex", flexDirection:"column", justifyContent:"space-between", padding:"0 0 20px 0", flexShrink:0 },
  sidebarTop: { flex:1, overflow:"auto" },
  sidebarBrand: { display:"flex", alignItems:"center", gap:"10px", padding:"20px 16px 16px", borderBottom:"1px solid rgba(255,255,255,0.08)" },
  sidebarIcon: { width:"32px", height:"32px", background:"linear-gradient(135deg,#7C3AED,#EC4899)", borderRadius:"10px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1rem" },
  sidebarName: { fontSize:"1.1rem", fontWeight:800, color:"#fff" },
  userCard: { display:"flex", alignItems:"center", gap:"10px", padding:"14px 16px", margin:"8px", borderRadius:"12px", background:"rgba(255,255,255,0.06)" },
  userAvatar: { width:"34px", height:"34px", borderRadius:"10px", background:"linear-gradient(135deg,#7C3AED,#EC4899)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, color:"#fff", fontSize:"0.9rem", flexShrink:0 },
  userName: { fontSize:"0.85rem", fontWeight:700, color:"#fff" },
  userStatus: { fontSize:"0.72rem", color:"rgba(255,255,255,0.5)", marginTop:"2px" },
  sidebarSection: { fontSize:"0.68rem", fontWeight:700, color:"rgba(255,255,255,0.4)", letterSpacing:"1px", padding:"16px 16px 8px" },
  channelList: { padding:"0 8px" },
  channelItem: { display:"flex", alignItems:"center", gap:"8px", padding:"8px 10px", borderRadius:"8px", cursor:"pointer", transition:"background 0.15s" },
  channelName: { fontSize:"0.88rem", color:"rgba(255,255,255,0.7)", fontWeight:500, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" },
  logoutBtn: { margin:"0 12px", background:"rgba(255,255,255,0.06)", border:"none", borderRadius:"10px", padding:"10px", color:"rgba(255,255,255,0.5)", cursor:"pointer", fontSize:"0.82rem", fontWeight:600, fontFamily:"inherit" },
  main: { flex:1, overflow:"auto", padding:"28px 32px" },
  topbar: { display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:"24px" },
  pageTitle: { fontSize:"1.8rem", fontWeight:800, color:"#1a1a2e", letterSpacing:"-0.5px" },
  pageSubtitle: { color:"#6b7280", fontSize:"0.9rem", marginTop:"4px" },
  createBtn: { background:"linear-gradient(135deg,#7C3AED,#EC4899)", color:"#fff", border:"none", borderRadius:"12px", padding:"11px 20px", fontWeight:700, cursor:"pointer", fontSize:"0.9rem", fontFamily:"inherit", whiteSpace:"nowrap" },
  createBox: { background:"#fff", borderRadius:"16px", padding:"24px", marginBottom:"24px", border:"2px solid #ede9fe", boxShadow:"0 4px 20px rgba(124,58,237,0.08)" },
  createTitle: { fontWeight:700, color:"#1a1a2e", marginBottom:"16px" },
  createForm: { display:"flex", gap:"10px", flexWrap:"wrap" },
  input: { flex:1, minWidth:"160px", border:"2px solid #e5e7eb", borderRadius:"10px", padding:"11px 14px", fontSize:"0.9rem", color:"#1a1a2e", outline:"none", fontFamily:"inherit" },
  submitBtn: { background:"linear-gradient(135deg,#7C3AED,#EC4899)", color:"#fff", border:"none", borderRadius:"10px", padding:"11px 20px", fontWeight:700, cursor:"pointer", fontFamily:"inherit" },
  error: { background:"#fff1f2", color:"#e11d48", padding:"10px 14px", borderRadius:"10px", marginBottom:"14px", fontSize:"0.88rem" },
  searchWrap: { display:"flex", alignItems:"center", gap:"10px", background:"#fff", border:"2px solid #e5e7eb", borderRadius:"12px", padding:"10px 16px", marginBottom:"24px" },
  searchIcon: { fontSize:"1rem" },
  searchInput: { flex:1, border:"none", outline:"none", fontSize:"0.95rem", color:"#1a1a2e", fontFamily:"inherit", background:"transparent" },
  empty: { textAlign:"center", color:"#9ca3af", padding:"60px 0", fontSize:"1rem" },
  grid: { display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(240px, 1fr))", gap:"16px" },
  card: { background:"#fff", borderRadius:"16px", overflow:"hidden", cursor:"pointer", transition:"all 0.2s", boxShadow:"0 2px 8px rgba(0,0,0,0.06)" },
  cardHeader: { padding:"20px", display:"flex", alignItems:"center", justifyContent:"space-between" },
  roomIconBig: { width:"44px", height:"44px", borderRadius:"12px", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:"1.2rem", color:"#fff" },
  hashBadge: { width:"28px", height:"28px", borderRadius:"8px", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:"1rem", background:"rgba(255,255,255,0.8)" },
  cardBody: { padding:"16px" },
  roomName: { fontWeight:700, color:"#1a1a2e", fontSize:"1rem", marginBottom:"6px" },
  roomDesc: { color:"#6b7280", fontSize:"0.82rem", lineHeight:1.5, marginBottom:"10px" },
  cardMeta: { display:"flex", gap:"8px", flexWrap:"wrap", marginBottom:"12px" },
  metaTag: { background:"#f3f4f6", color:"#6b7280", fontSize:"0.75rem", padding:"3px 8px", borderRadius:"6px", fontWeight:500 },
  joinBtn: { color:"#fff", borderRadius:"8px", padding:"8px 14px", fontSize:"0.82rem", fontWeight:700, textAlign:"center" },
};
