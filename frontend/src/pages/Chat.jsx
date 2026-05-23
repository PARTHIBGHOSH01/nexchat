import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import socket from "../socket";
import { useAuth } from "../context/AuthContext";

const COLORS = ["#7C3AED","#EC4899","#F59E0B","#10B981","#3B82F6","#EF4444","#8B5CF6","#06B6D4"];
const getColor = (name) => name ? COLORS[name.charCodeAt(0) % COLORS.length] : COLORS[0];

export default function Chat() {
  const { roomId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [room, setRoom] = useState(null);
  const [typingUser, setTypingUser] = useState("");
  const bottomRef = useRef(null);
  const typingTimer = useRef(null);

  const scrollToBottom = () => bottomRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => {
    axios.get("/api/rooms").then(({ data }) => {
      const r = data.find(r => r._id === roomId);
      if (r) setRoom(r);
    });
    axios.get(`/api/messages/${roomId}`).then(({ data }) => {
      setMessages(data);
      setTimeout(scrollToBottom, 100);
    });
    socket.connect();
    socket.emit("user_online", user._id);
    socket.emit("join_room", roomId);
    socket.on("receive_message", (msg) => {
      setMessages(prev => [...prev, msg]);
      setTimeout(scrollToBottom, 50);
    });
    socket.on("user_typing", ({ userName }) => setTypingUser(userName));
    socket.on("user_stop_typing", () => setTypingUser(""));
    return () => {
      socket.emit("leave_room", roomId);
      socket.off("receive_message");
      socket.off("user_typing");
      socket.off("user_stop_typing");
      socket.disconnect();
    };
  }, [roomId]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    socket.emit("send_message", { roomId, senderId: user._id, senderName: user.name, text: text.trim() });
    socket.emit("stop_typing", { roomId });
    clearTimeout(typingTimer.current);
    setText("");
  };

  const handleTyping = (e) => {
    setText(e.target.value);
    socket.emit("typing", { roomId, userName: user.name });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => socket.emit("stop_typing", { roomId }), 1500);
  };

  const formatTime = (d) => new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const isMe = (msg) => msg.sender === user._id || msg.sender?._id === user._id;

  const roomColor = getColor(room?.name || "");

  // Group messages by date
  const groupedMessages = messages.reduce((acc, msg) => {
    const date = new Date(msg.createdAt).toLocaleDateString("en-US", { weekday:"long", month:"long", day:"numeric" });
    if (!acc[date]) acc[date] = [];
    acc[date].push(msg);
    return acc;
  }, {});

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={{...s.header, borderBottom:`3px solid ${roomColor}`}}>
        <div style={s.headerLeft}>
          <button style={s.backBtn} onClick={() => navigate("/rooms")}>←</button>
          <div style={{...s.roomDot, background:roomColor}}>#</div>
          <div>
            <p style={s.roomTitle}>{room?.name || "Loading…"}</p>
            {room?.description && <p style={s.roomDesc}>{room.description}</p>}
          </div>
        </div>
        <div style={s.headerRight}>
          <div style={s.memberCount}>👥 {room?.members?.length || 0} members</div>
        </div>
      </div>

      {/* Messages */}
      <div style={s.messages}>
        {messages.length === 0 && (
          <div style={s.emptyChat}>
            <div style={{...s.emptyChatIcon, background:roomColor}}>#{room?.name?.charAt(0).toUpperCase()}</div>
            <p style={s.emptyChatTitle}>Welcome to #{room?.name}!</p>
            <p style={s.emptyChatSub}>This is the start of the channel. Say hello! 👋</p>
          </div>
        )}

        {Object.entries(groupedMessages).map(([date, msgs]) => (
          <div key={date}>
            <div style={s.dateDivider}><span style={s.dateLabel}>{date}</span></div>
            {msgs.map((msg, i) => {
              const mine = isMe(msg);
              const color = getColor(msg.senderName);
              return (
                <div key={msg._id || i} style={{...s.msgRow, flexDirection: mine ? "row-reverse" : "row"}}>
                  <div style={{...s.msgAvatar, background:color}}>
                    {msg.senderName?.charAt(0).toUpperCase()}
                  </div>
                  <div style={{maxWidth:"65%"}}>
                    <div style={{...s.msgMeta, textAlign: mine ? "right" : "left"}}>
                      <span style={{...s.msgSender, color}}>{mine ? "You" : msg.senderName}</span>
                      <span style={s.msgTime}>{formatTime(msg.createdAt)}</span>
                    </div>
                    <div style={{...s.msgBubble, ...(mine ? {...s.bubbleMe, background:roomColor} : s.bubbleThem)}}>
                      {msg.text}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        {typingUser && (
          <div style={s.typingRow}>
            <div style={s.typingDots}>
              <span/><span/><span/>
            </div>
            <span style={s.typingText}>{typingUser} is typing…</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={s.inputArea}>
        <form style={s.inputForm} onSubmit={handleSend}>
          <div style={s.inputWrap}>
            <input style={s.input} placeholder={`Message #${room?.name || "channel"}…`}
              value={text} onChange={handleTyping} autoFocus />
            <button style={{...s.sendBtn, background: text.trim() ? roomColor : "#e5e7eb", cursor: text.trim() ? "pointer" : "default"}}
              type="submit" disabled={!text.trim()}>
              ➤
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }
        div[style*="typingDots"] span { display:inline-block; width:7px; height:7px; borderRadius:50%; background:#9ca3af; margin:0 2px; animation:bounce 1.2s infinite; }
        div[style*="typingDots"] span:nth-child(2){animation-delay:.2s}
        div[style*="typingDots"] span:nth-child(3){animation-delay:.4s}
        input:focus { outline:none; box-shadow:0 0 0 3px rgba(124,58,237,0.15); }
      `}</style>
    </div>
  );
}

const s = {
  page: { display:"flex", flexDirection:"column", height:"100vh", fontFamily:"'Plus Jakarta Sans', sans-serif", background:"#F3F0FF" },
  header: { display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 24px", background:"#fff", boxShadow:"0 2px 8px rgba(0,0,0,0.06)" },
  headerLeft: { display:"flex", alignItems:"center", gap:"12px" },
  backBtn: { background:"#f3f4f6", border:"none", borderRadius:"10px", width:"36px", height:"36px", cursor:"pointer", fontSize:"1.1rem", display:"flex", alignItems:"center", justifyContent:"center" },
  roomDot: { width:"36px", height:"36px", borderRadius:"10px", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, color:"#fff", fontSize:"1rem" },
  roomTitle: { fontWeight:700, fontSize:"1.05rem", color:"#1a1a2e" },
  roomDesc: { fontSize:"0.78rem", color:"#9ca3af", marginTop:"2px" },
  headerRight: { display:"flex", gap:"12px", alignItems:"center" },
  memberCount: { background:"#f3f0ff", color:"#7C3AED", padding:"6px 12px", borderRadius:"10px", fontSize:"0.82rem", fontWeight:600 },
  messages: { flex:1, overflowY:"auto", padding:"20px 24px", display:"flex", flexDirection:"column", gap:"4px" },
  emptyChat: { display:"flex", flexDirection:"column", alignItems:"center", padding:"60px 0", gap:"12px" },
  emptyChatIcon: { width:"64px", height:"64px", borderRadius:"20px", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:"1.5rem", color:"#fff" },
  emptyChatTitle: { fontSize:"1.2rem", fontWeight:700, color:"#1a1a2e" },
  emptyChatSub: { color:"#9ca3af", fontSize:"0.9rem" },
  dateDivider: { display:"flex", justifyContent:"center", margin:"16px 0 12px" },
  dateLabel: { background:"#fff", border:"1px solid #e5e7eb", color:"#9ca3af", fontSize:"0.75rem", fontWeight:600, padding:"4px 12px", borderRadius:"20px" },
  msgRow: { display:"flex", gap:"10px", alignItems:"flex-start", marginBottom:"8px" },
  msgAvatar: { width:"34px", height:"34px", borderRadius:"10px", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, color:"#fff", fontSize:"0.85rem", flexShrink:0, marginTop:"2px" },
  msgMeta: { display:"flex", alignItems:"center", gap:"8px", marginBottom:"4px" },
  msgSender: { fontSize:"0.82rem", fontWeight:700 },
  msgTime: { fontSize:"0.72rem", color:"#9ca3af" },
  msgBubble: { padding:"10px 14px", borderRadius:"14px", fontSize:"0.92rem", lineHeight:1.6, wordBreak:"break-word" },
  bubbleMe: { color:"#fff", borderTopRightRadius:"4px" },
  bubbleThem: { background:"#fff", color:"#1a1a2e", border:"1px solid #e5e7eb", borderTopLeftRadius:"4px" },
  typingRow: { display:"flex", alignItems:"center", gap:"10px", padding:"8px 4px" },
  typingDots: { display:"flex", alignItems:"center" },
  typingText: { fontSize:"0.82rem", color:"#9ca3af", fontStyle:"italic" },
  inputArea: { padding:"16px 24px", background:"#fff", borderTop:"1px solid #e5e7eb" },
  inputForm: { width:"100%" },
  inputWrap: { display:"flex", gap:"10px", background:"#f9fafb", borderRadius:"14px", border:"2px solid #e5e7eb", padding:"6px 6px 6px 16px", alignItems:"center" },
  input: { flex:1, border:"none", background:"transparent", fontSize:"0.95rem", color:"#1a1a2e", fontFamily:"'Plus Jakarta Sans', sans-serif", outline:"none", padding:"6px 0" },
  sendBtn: { width:"38px", height:"38px", borderRadius:"10px", border:"none", color:"#fff", fontSize:"1rem", display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.2s", flexShrink:0 },
};
