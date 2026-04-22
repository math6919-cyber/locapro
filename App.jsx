import { useState, useEffect, useRef } from "react";

const SUPABASE_URL = "https://psntjbjbummjxpqryiaf.supabase.co";
const SUPABASE_KEY = "sb_publishable_l_6RrNb_d48EizniTJXCLQ_VqPKTLgg";

async function sbFetch(path, options = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: options.prefer || "return=representation",
      ...options.headers,
    },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Supabase error");
  }
  return res.status === 204 ? null : res.json();
}

const MOCK_DEVICES = [
  { id: 1, emoji: "📷", name: "Canon EOS R5", category: "Photo & Vidéo", price_per_day: 45, city: "Paris", owner_name: "Marie", description: "Appareil photo mirrorless plein format, parfait état. Livré avec 2 batteries.", rating: 4.9, reviews_count: 12, image_url: null },
  { id: 2, emoji: "🚁", name: "DJI Mini 3 Pro", category: "Drone", price_per_day: 35, city: "Lyon", owner_name: "Thomas", description: "Drone 4K ultra-léger. 3 batteries incluses, étui de transport.", rating: 4.8, reviews_count: 8, image_url: null },
  { id: 3, emoji: "🎮", name: "PlayStation 5", category: "Électronique", price_per_day: 20, city: "Bordeaux", owner_name: "Lucas", description: "PS5 avec 2 manettes et 5 jeux. Parfaite pour un week-end gaming.", rating: 5.0, reviews_count: 21, image_url: null },
  { id: 4, emoji: "🔧", name: "Perceuse Bosch Pro", category: "Outils", price_per_day: 12, city: "Marseille", owner_name: "Jean", description: "Perceuse-visseuse sans fil 18V avec 2 batteries et jeu de forets.", rating: 4.7, reviews_count: 5, image_url: null },
  { id: 5, emoji: "🎸", name: "Gibson Les Paul", category: "Audio", price_per_day: 30, city: "Toulouse", owner_name: "Sophie", description: "Guitare électrique excellent état, avec ampli et câbles inclus.", rating: 4.9, reviews_count: 7, image_url: null },
  { id: 6, emoji: "💻", name: "MacBook Pro M3", category: "Électronique", price_per_day: 55, city: "Nantes", owner_name: "Alex", description: "16 pouces, 36GB RAM, 1TB SSD. Idéal montage vidéo ou design.", rating: 4.8, reviews_count: 14, image_url: null },
];

const MOCK_REVIEWS = {
  1: [{ id: 1, author: "Kevin", rating: 5, comment: "Appareil impeccable, Marie très sympa !", date: "2025-03-10" }],
  2: [{ id: 2, author: "Léa", rating: 5, comment: "Vol parfait, drone en super état.", date: "2025-03-18" }],
};

const CATEGORIES = ["Photo & Vidéo", "Drone", "Électronique", "Outils", "Audio", "Sport", "Autre"];
const EMOJIS = ["📷","🎥","💻","🎮","🔧","🚁","🎸","🎵","⛷️","🏋️","🖨️","📦","🎺","🎻","🏄","🛹"];

const G = {
  bg: "#0a0a0a", surface: "#141414", surface2: "#1c1c1c", surface3: "#242424",
  accent: "#d4f542", accentDark: "#b8d93a", accentGlow: "rgba(212,245,66,0.15)",
  text: "#f5f2ec", muted: "#6b6b6b", border: "#252525",
  danger: "#ff5f5f", success: "#42f5a1", warning: "#f5a742",
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Outfit:wght@300;400;500;600&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${G.bg}; color: ${G.text}; font-family: 'Outfit', sans-serif; }
  ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: ${G.bg}; }
  ::-webkit-scrollbar-thumb { background: ${G.border}; border-radius: 3px; }
  input, textarea, select { font-family: 'Outfit', sans-serif; }
  @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
  @keyframes spin { to { transform: rotate(360deg); } }
  .fade-up { animation: fadeUp 0.4s ease both; }
  .spin { animation: spin 0.8s linear infinite; }
`;

const Stars = ({ rating, size = 14 }) => {
  const full = Math.floor(rating);
  return <span style={{ fontSize: size, letterSpacing: 1 }}>{"★".repeat(full)}{"☆".repeat(5 - full)}</span>;
};

const Badge = ({ children, color = G.accent }) => (
  <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 100, background: color + "18", border: `1px solid ${color}40`, color, fontSize: 11, fontWeight: 600, letterSpacing: "0.06em" }}>{children}</span>
);

const Spinner = () => (
  <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
    <div className="spin" style={{ width: 28, height: 28, border: `3px solid ${G.border}`, borderTopColor: G.accent, borderRadius: "50%" }} />
  </div>
);

const Toast = ({ msg, type, show }) => (
  <div style={{ position: "fixed", bottom: 28, left: "50%", transform: `translateX(-50%) translateY(${show ? 0 : 80}px)`, transition: "transform 0.4s cubic-bezier(0.34,1.56,0.64,1)", background: G.surface2, border: `1px solid ${type === "success" ? G.success + "50" : type === "error" ? G.danger + "50" : G.border}`, color: type === "success" ? G.success : type === "error" ? G.danger : G.text, padding: "12px 24px", borderRadius: 14, fontWeight: 500, fontSize: 14, boxShadow: "0 20px 60px rgba(0,0,0,0.6)", zIndex: 9999, whiteSpace: "nowrap" }}>{msg}</div>
);

function useToast() {
  const [toast, setToast] = useState({ msg: "", type: "", show: false });
  const show = (msg, type = "success") => {
    setToast({ msg, type, show: true });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 3200);
  };
  return [toast, show];
}

function Btn({ children, onClick, variant = "primary", size = "md", fullWidth, disabled, style = {} }) {
  const base = { display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "'Outfit', sans-serif", fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer", border: "none", transition: "all 0.2s", opacity: disabled ? 0.5 : 1, width: fullWidth ? "100%" : "auto", borderRadius: size === "sm" ? 8 : 12, padding: size === "sm" ? "6px 14px" : size === "lg" ? "14px 32px" : "10px 22px", fontSize: size === "sm" ? 13 : size === "lg" ? 16 : 14, ...style };
  const variants = { primary: { background: G.accent, color: "#000" }, ghost: { background: "transparent", color: G.text, border: `1px solid ${G.border}` }, danger: { background: G.danger + "18", color: G.danger, border: `1px solid ${G.danger}40` }, success: { background: G.success + "18", color: G.success, border: `1px solid ${G.success}40` } };
  return <button style={{ ...base, ...variants[variant] }} onClick={disabled ? undefined : onClick}>{children}</button>;
}

function Input({ label, ...props }) {
  const [focus, setFocus] = useState(false);
  const isTextarea = props.as === "textarea";
  const isSelect = props.as === "select";
  const Tag = isTextarea ? "textarea" : isSelect ? "select" : "input";
  const { as, ...rest } = props;
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: G.muted, marginBottom: 6, letterSpacing: "0.05em", textTransform: "uppercase" }}>{label}</label>}
      <Tag {...rest} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)} style={{ width: "100%", padding: "10px 14px", background: G.surface2, border: `1px solid ${focus ? G.accent : G.border}`, borderRadius: 10, color: G.text, fontSize: 14, outline: "none", resize: isTextarea ? "vertical" : undefined, minHeight: isTextarea ? 100 : undefined, transition: "border-color 0.2s", ...props.style }} />
    </div>
  );
}

function Modal({ open, onClose, title, children, maxWidth = 560 }) {
  useEffect(() => { if (open) document.body.style.overflow = "hidden"; else document.body.style.overflow = ""; return () => { document.body.style.overflow = ""; }; }, [open]);
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, animation: "fadeIn 0.2s ease" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: G.surface, border: `1px solid ${G.border}`, borderRadius: 20, width: "100%", maxWidth, maxHeight: "90vh", overflow: "auto", animation: "fadeUp 0.3s ease" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: `1px solid ${G.border}` }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700 }}>{title}</div>
          <button onClick={onClose} style={{ background: "none", border: `1px solid ${G.border}`, borderRadius: 8, color: G.muted, cursor: "pointer", width: 32, height: 32, fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  );
}

function AuthModal({ open, onClose, onAuth }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [toast, showToast] = useToast();
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const submit = async () => {
    if (!form.email || !form.password) { showToast("Remplis tous les champs", "error"); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    const user = { id: Date.now(), name: form.name || form.email.split("@")[0], email: form.email };
    localStorage.setItem("locapro_user", JSON.stringify(user));
    onAuth(user); onClose();
    showToast(mode === "login" ? "Bienvenue !" : "Compte créé !", "success");
    setLoading(false);
  };
  return (
    <>
      <Modal open={open} onClose={onClose} title={mode === "login" ? "Connexion" : "Créer un compte"} maxWidth={420}>
        <div style={{ display: "flex", background: G.surface2, borderRadius: 10, padding: 4, marginBottom: 24 }}>
          {["login", "register"].map(m => <button key={m} onClick={() => setMode(m)} style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, background: mode === m ? G.accent : "transparent", color: mode === m ? "#000" : G.muted, transition: "all 0.2s" }}>{m === "login" ? "Connexion" : "Inscription"}</button>)}
        </div>
        {mode === "register" && <Input label="Prénom" placeholder="Ton prénom" value={form.name} onChange={set("name")} />}
        <Input label="Email" type="email" placeholder="ton@email.com" value={form.email} onChange={set("email")} />
        <Input label="Mot de passe" type="password" placeholder="••••••••" value={form.password} onChange={set("password")} />
        <Btn onClick={submit} fullWidth size="lg" disabled={loading}>{loading ? "..." : mode === "login" ? "Se connecter" : "Créer mon compte"}</Btn>
      </Modal>
      <Toast {...toast} />
    </>
  );
}

function DeviceCard({ device, onBook, onView }) {
  const [hov, setHov] = useState(false);
  return (
    <div onClick={() => onView(device)} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{ background: G.surface, border: `1px solid ${hov ? G.accent + "50" : G.border}`, borderRadius: 18, overflow: "hidden", cursor: "pointer", transform: hov ? "translateY(-5px)" : "none", transition: "all 0.3s" }}>
      <div style={{ height: 180, background: `linear-gradient(135deg, ${G.surface2}, ${G.surface3})`, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
        <span style={{ fontSize: 64 }}>{device.emoji}</span>
        <div style={{ position: "absolute", top: 12, left: 12 }}><Badge>{device.category}</Badge></div>
        <div style={{ position: "absolute", top: 12, right: 12, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", borderRadius: 8, padding: "4px 10px", fontSize: 13, fontWeight: 700 }}>{device.price_per_day}€<span style={{ fontWeight: 400, color: G.muted }}>/j</span></div>
      </div>
      <div style={{ padding: "16px 18px" }}>
        <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{device.name}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: G.muted, marginBottom: 8 }}>
          <span>📍 {device.city}</span><span style={{ width: 3, height: 3, borderRadius: "50%", background: G.border }} /><span>Par {device.owner_name}</span>
        </div>
        {device.rating && <div style={{ marginBottom: 10 }}><span style={{ color: G.warning, fontSize: 12 }}><Stars rating={device.rating} size={12} /></span> <span style={{ fontSize: 12, color: G.muted }}>{device.rating} ({device.reviews_count} avis)</span></div>}
        <p style={{ fontSize: 12, color: G.muted, marginBottom: 14, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{device.description}</p>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn onClick={e => { e.stopPropagation(); onBook(device); }} fullWidth size="sm">Réserver</Btn>
          <Btn onClick={e => { e.stopPropagation(); onView(device); }} variant="ghost" size="sm">Détails</Btn>
        </div>
      </div>
    </div>
  );
}

function DeviceDetailModal({ device, open, onClose, onBook }) {
  const reviews = MOCK_REVIEWS[device?.id] || [];
  if (!device) return null;
  return (
    <Modal open={open} onClose={onClose} title={device.name} maxWidth={620}>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start", marginBottom: 20, background: G.surface2, borderRadius: 14, padding: 16 }}>
        <div style={{ width: 72, height: 72, background: G.surface3, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, flexShrink: 0 }}>{device.emoji}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 16 }}>{device.name}</div>
          <div style={{ fontSize: 13, color: G.muted, marginTop: 4 }}>📍 {device.city} · Par <strong style={{ color: G.text }}>{device.owner_name}</strong></div>
          {device.rating && <div style={{ marginTop: 6 }}><span style={{ color: G.warning }}><Stars rating={device.rating} /></span> <span style={{ fontSize: 12, color: G.muted }}>{device.rating} ({device.reviews_count} avis)</span></div>}
        </div>
        <div style={{ textAlign: "right" }}><div style={{ fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 800, color: G.accent }}>{device.price_per_day}€</div><div style={{ fontSize: 12, color: G.muted }}>par jour</div></div>
      </div>
      <p style={{ fontSize: 14, color: G.text, lineHeight: 1.7, marginBottom: 20 }}>{device.description}</p>
      {reviews.length > 0 && <div style={{ marginBottom: 20 }}>{reviews.map(r => <div key={r.id} style={{ background: G.surface2, borderRadius: 12, padding: 14, marginBottom: 8 }}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><strong style={{ fontSize: 13 }}>{r.author}</strong><span style={{ color: G.warning, fontSize: 12 }}><Stars rating={r.rating} size={12} /></span></div><p style={{ fontSize: 13, color: G.muted }}>{r.comment}</p></div>)}</div>}
      <Btn onClick={() => { onClose(); onBook(device); }} fullWidth size="lg">📅 Réserver cet appareil</Btn>
    </Modal>
  );
}

function BookingModal({ device, open, onClose, user, showToast }) {
  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState({ start: "", end: "", name: user?.name || "", email: user?.email || "", message: "" });
  const [loading, setLoading] = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const days = form.start && form.end ? Math.ceil((new Date(form.end) - new Date(form.start)) / 86400000) : 0;
  const total = days > 0 && device ? days * device.price_per_day : 0;
  const confirm = async () => {
    if (!form.start || !form.end || !form.name || !form.email) { showToast("Remplis tous les champs", "error"); return; }
    if (days <= 0) { showToast("Dates invalides", "error"); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false); onClose();
    showToast(`🎉 Réservation envoyée ! ${device.owner_name} vous contactera sous 24h.`, "success");
  };
  if (!device) return null;
  return (
    <Modal open={open} onClose={onClose} title="Réserver l'appareil">
      <div style={{ display: "flex", gap: 12, alignItems: "center", background: G.surface2, borderRadius: 12, padding: 14, marginBottom: 20 }}>
        <span style={{ fontSize: 36 }}>{device.emoji}</span>
        <div><div style={{ fontWeight: 600 }}>{device.name}</div><div style={{ fontSize: 13, color: G.muted }}>Par {device.owner_name} · {device.city}</div><div style={{ color: G.accent, fontWeight: 700, marginTop: 2 }}>{device.price_per_day}€/jour</div></div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Input label="Date début" type="date" min={today} value={form.start} onChange={set("start")} />
        <Input label="Date fin" type="date" min={form.start || today} value={form.end} onChange={set("end")} />
      </div>
      <Input label="Prénom" placeholder="Prénom" value={form.name} onChange={set("name")} />
      <Input label="Email" type="email" placeholder="ton@email.com" value={form.email} onChange={set("email")} />
      <Input label="Message" as="textarea" placeholder="Présentez-vous..." value={form.message} onChange={set("message")} />
      {total > 0 && <div style={{ background: G.accentGlow, border: `1px solid ${G.accent}30`, borderRadius: 12, padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}><div><div style={{ fontSize: 12, color: G.muted }}>Total estimé</div><div style={{ fontSize: 12, color: G.muted }}>{days} jour{days > 1 ? "s" : ""} × {device.price_per_day}€</div></div><div style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, color: G.accent }}>{total}€</div></div>}
      <div style={{ display: "flex", gap: 10 }}>
        <Btn variant="ghost" onClick={onClose} style={{ flex: 1 }}>Annuler</Btn>
        <Btn onClick={confirm} disabled={loading} style={{ flex: 2 }}>{loading ? "⏳ Envoi..." : "✓ Confirmer"}</Btn>
      </div>
    </Modal>
  );
}

function AddDeviceModal({ open, onClose, user, onAdded, showToast }) {
  const [form, setForm] = useState({ name: "", category: "", price_per_day: "", city: "", description: "", emoji: "📷" });
  const [loading, setLoading] = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const submit = async () => {
    if (!form.name || !form.category || !form.price_per_day || !form.city) { showToast("Remplis tous les champs", "error"); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    const newDev = { ...form, id: Date.now(), price_per_day: parseFloat(form.price_per_day), owner_name: user?.name || "Moi", rating: null, reviews_count: 0, image_url: null };
    onAdded(newDev); setLoading(false); onClose();
    showToast("🎉 Annonce publiée !", "success");
    setForm({ name: "", category: "", price_per_day: "", city: "", description: "", emoji: "📷" });
  };
  return (
    <Modal open={open} onClose={onClose} title="Publier un appareil">
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: G.muted, marginBottom: 8, textTransform: "uppercase" }}>Icône</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{EMOJIS.map(e => <button key={e} onClick={() => setForm(f => ({ ...f, emoji: e }))} style={{ width: 42, height: 42, borderRadius: 9, border: `2px solid ${form.emoji === e ? G.accent : G.border}`, background: form.emoji === e ? G.accentGlow : G.surface2, fontSize: 20, cursor: "pointer" }}>{e}</button>)}</div>
      </div>
      <Input label="Nom *" placeholder="Ex: Canon EOS R5..." value={form.name} onChange={set("name")} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div><label style={{ display: "block", fontSize: 12, fontWeight: 500, color: G.muted, marginBottom: 6, textTransform: "uppercase" }}>Catégorie *</label><select value={form.category} onChange={set("category")} style={{ width: "100%", padding: "10px 14px", background: G.surface2, border: `1px solid ${G.border}`, borderRadius: 10, color: G.text, fontSize: 14, outline: "none", marginBottom: 16 }}><option value="">Choisir...</option>{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
        <Input label="Prix/jour (€) *" type="number" min="1" placeholder="25" value={form.price_per_day} onChange={set("price_per_day")} />
      </div>
      <Input label="Ville *" placeholder="Paris..." value={form.city} onChange={set("city")} />
      <Input label="Description" as="textarea" placeholder="État, accessoires..." value={form.description} onChange={set("description")} />
      <Btn onClick={submit} fullWidth size="lg" disabled={loading}>{loading ? "Publication..." : "✓ Publier"}</Btn>
    </Modal>
  );
}

const MOCK_CONVS = [
  { id: 1, with: "Marie", device: "Canon EOS R5", last: "Super, à samedi alors !", time: "10:32", unread: 1 },
  { id: 2, with: "Thomas", device: "DJI Mini 3 Pro", last: "Le drone est disponible.", time: "Hier", unread: 0 },
];
const MOCK_MSGS = { 1: [{ id: 1, from: "Marie", text: "Bonjour ! Le Canon est disponible le weekend du 5.", time: "10:15" }, { id: 2, from: "me", text: "Parfait ! Je peux venir le samedi matin ?", time: "10:28" }, { id: 3, from: "Marie", text: "Super, à samedi alors !", time: "10:32" }] };

function MessagesPage() {
  const [selected, setSelected] = useState(null);
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState(MOCK_MSGS);
  const send = () => { if (!input.trim() || !selected) return; setMsgs(m => ({ ...m, [selected]: [...(m[selected] || []), { id: Date.now(), from: "me", text: input, time: "maintenant" }] })); setInput(""); };
  return (
    <div style={{ display: "flex", height: "calc(100vh - 65px)" }}>
      <div style={{ width: 300, borderRight: `1px solid ${G.border}`, overflow: "auto", flexShrink: 0 }}>
        <div style={{ padding: "20px 16px", borderBottom: `1px solid ${G.border}`, fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700 }}>Messages</div>
        {MOCK_CONVS.map(c => <div key={c.id} onClick={() => setSelected(c.id)} style={{ padding: "14px 16px", cursor: "pointer", borderBottom: `1px solid ${G.border}`, background: selected === c.id ? G.surface : "transparent" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}><strong style={{ fontSize: 14 }}>{c.with}</strong><span style={{ fontSize: 11, color: G.muted }}>{c.time}</span></div>
          <div style={{ fontSize: 12, color: G.muted, marginBottom: 4 }}>{c.device}</div>
          <div style={{ fontSize: 13, color: c.unread ? G.text : G.muted }}>{c.last}</div>
        </div>)}
      </div>
      {selected ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${G.border}`, fontWeight: 600 }}>{MOCK_CONVS.find(c => c.id === selected)?.with}</div>
          <div style={{ flex: 1, overflow: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
            {(msgs[selected] || []).map(m => <div key={m.id} style={{ display: "flex", justifyContent: m.from === "me" ? "flex-end" : "flex-start" }}><div style={{ background: m.from === "me" ? G.accent : G.surface2, color: m.from === "me" ? "#000" : G.text, padding: "10px 14px", borderRadius: 14, maxWidth: "65%", fontSize: 14 }}>{m.text}</div></div>)}
          </div>
          <div style={{ padding: "12px 16px", borderTop: `1px solid ${G.border}`, display: "flex", gap: 10 }}>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Écrire..." style={{ flex: 1, padding: "10px 14px", background: G.surface2, border: `1px solid ${G.border}`, borderRadius: 10, color: G.text, fontSize: 14, outline: "none" }} />
            <Btn onClick={send}>Envoyer</Btn>
          </div>
        </div>
      ) : <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: G.muted, flexDirection: "column", gap: 12 }}><span style={{ fontSize: 48 }}>💬</span><div>Sélectionne une conversation</div></div>}
    </div>
  );
}

function DashboardPage({ devices, myIds, onDelete, onAdd, user }) {
  const mine = devices.filter(d => myIds.includes(d.id));
  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 20px" }} className="fade-up">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div><h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 26, fontWeight: 800 }}>Mon tableau de bord</h2><p style={{ color: G.muted, fontSize: 14, marginTop: 4 }}>Bonjour, {user?.name} 👋</p></div>
        <Btn onClick={onAdd}>+ Publier</Btn>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 28 }}>
        {[{ label: "Annonces actives", value: mine.length, icon: "📦" }, { label: "En location", value: 0, icon: "🔑" }, { label: "Revenus/jour", value: `${mine.reduce((a, d) => a + d.price_per_day, 0)}€`, icon: "💰" }].map(s => <div key={s.label} style={{ background: G.surface, border: `1px solid ${G.border}`, borderRadius: 14, padding: "18px 20px" }}><div style={{ fontSize: 24, marginBottom: 8 }}>{s.icon}</div><div style={{ fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 800, color: G.accent }}>{s.value}</div><div style={{ fontSize: 12, color: G.muted, marginTop: 2 }}>{s.label}</div></div>)}
      </div>
      {mine.length === 0 ? <div style={{ textAlign: "center", padding: "48px 0", color: G.muted }}><div style={{ fontSize: 48, marginBottom: 12 }}>📭</div><div style={{ fontSize: 16, color: G.text, marginBottom: 20 }}>Aucune annonce</div><Btn onClick={onAdd}>+ Publier un appareil</Btn></div>
        : <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{mine.map(d => <div key={d.id} style={{ background: G.surface, border: `1px solid ${G.border}`, borderRadius: 14, padding: "16px 18px", display: "flex", alignItems: "center", gap: 14 }}><span style={{ fontSize: 32 }}>{d.emoji}</span><div style={{ flex: 1 }}><div style={{ fontWeight: 600 }}>{d.name}</div><div style={{ fontSize: 12, color: G.muted, marginTop: 2 }}>📍 {d.city} · {d.price_per_day}€/jour</div></div><Btn variant="danger" size="sm" onClick={() => onDelete(d.id)}>Supprimer</Btn></div>)}</div>}
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState("explore");
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("locapro_user") || "null"));
  const [devices, setDevices] = useState(MOCK_DEVICES);
  const [myIds, setMyIds] = useState(() => JSON.parse(localStorage.getItem("locapro_mine") || "[]"));
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [authOpen, setAuthOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [bookDevice, setBookDevice] = useState(null);
  const [viewDevice, setViewDevice] = useState(null);
  const [toast, showToast] = useToast();

  const logout = () => { localStorage.removeItem("locapro_user"); setUser(null); showToast("Déconnecté", "success"); };
  const filtered = devices.filter(d => { const s = search.toLowerCase(); return (!s || d.name.toLowerCase().includes(s) || d.city.toLowerCase().includes(s)) && (!catFilter || d.category === catFilter); });
  const addDevice = (dev) => { setDevices(ds => [dev, ...ds]); setMyIds(ids => { const n = [...ids, dev.id]; localStorage.setItem("locapro_mine", JSON.stringify(n)); return n; }); };
  const deleteDevice = (id) => { setDevices(ds => ds.filter(d => d.id !== id)); setMyIds(ids => { const n = ids.filter(i => i !== id); localStorage.setItem("locapro_mine", JSON.stringify(n)); return n; }); showToast("Annonce supprimée", "success"); };
  const openBook = (dev) => { if (!user) { setAuthOpen(true); return; } setBookDevice(dev); };

  const NAV = [{ id: "explore", label: "Explorer", icon: "🔍" }, { id: "messages", label: "Messages", icon: "💬" }, { id: "dashboard", label: "Mes annonces", icon: "📦" }];

  return (
    <>
      <style>{css}</style>
      <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(10,10,10,0.92)", backdropFilter: "blur(20px)", borderBottom: `1px solid ${G.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", height: 65 }}>
        <div onClick={() => setPage("explore")} style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, cursor: "pointer" }}><span style={{ color: G.accent }}>Loca</span>Pro</div>
        <div style={{ display: "flex", background: G.surface2, borderRadius: 12, padding: 4, gap: 2 }}>
          {NAV.map(n => <button key={n.id} onClick={() => { if (n.id !== "explore" && !user) { setAuthOpen(true); return; } setPage(n.id); }} style={{ padding: "7px 16px", borderRadius: 9, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, background: page === n.id ? G.accent : "transparent", color: page === n.id ? "#000" : G.muted }}>{n.icon} {n.label}</button>)}
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <Btn onClick={() => { if (!user) { setAuthOpen(true); return; } setAddOpen(true); }} size="sm">+ Publier</Btn>
          {user ? <><div style={{ width: 32, height: 32, borderRadius: "50%", background: G.accent, color: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13 }}>{user.name[0].toUpperCase()}</div><Btn variant="ghost" size="sm" onClick={logout}>Déco</Btn></> : <Btn variant="ghost" size="sm" onClick={() => setAuthOpen(true)}>Connexion</Btn>}
        </div>
      </nav>

      {page === "explore" && (
        <div>
          <div style={{ textAlign: "center", padding: "64px 20px 48px", maxWidth: 800, margin: "0 auto" }} className="fade-up">
            <div style={{ display: "inline-block", background: G.accentGlow, border: `1px solid ${G.accent}40`, color: G.accent, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "5px 14px", borderRadius: 100, marginBottom: 28 }}>🔑 Location entre particuliers</div>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(2.4rem, 6vw, 4rem)", fontWeight: 800, lineHeight: 1.05, letterSpacing: "-0.04em", marginBottom: 20 }}>Louez <em style={{ fontStyle: "italic", color: G.accent }}>n'importe quel</em><br />appareil, partout</h1>
            <p style={{ fontSize: 16, color: G.muted, maxWidth: 500, margin: "0 auto 32px", lineHeight: 1.7 }}>Caméras, outils, drones, consoles… Publiez ce qui dort chez vous ou trouvez ce qu'il vous faut.</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <Btn onClick={() => { if (!user) setAuthOpen(true); else setAddOpen(true); }} size="lg">Mettre en location</Btn>
              <Btn variant="ghost" size="lg">Parcourir les annonces</Btn>
            </div>
          </div>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px 60px" }}>
            <div style={{ display: "flex", gap: 12, marginBottom: 28, flexWrap: "wrap" }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍  Rechercher..." style={{ flex: 1, minWidth: 220, padding: "11px 16px", background: G.surface, border: `1px solid ${G.border}`, borderRadius: 12, color: G.text, fontSize: 14, outline: "none" }} />
              <select value={catFilter} onChange={e => setCatFilter(e.target.value)} style={{ padding: "11px 16px", background: G.surface, border: `1px solid ${G.border}`, borderRadius: 12, color: G.text, fontSize: 14, outline: "none", cursor: "pointer" }}>
                <option value="">Toutes catégories</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
              {filtered.map((d, i) => <div key={d.id} className="fade-up" style={{ animationDelay: `${i * 0.05}s` }}><DeviceCard device={d} onBook={openBook} onView={setViewDevice} /></div>)}
              {filtered.length === 0 && <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "60px 0", color: G.muted }}><div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div><div>Aucun résultat</div></div>}
            </div>
          </div>
        </div>
      )}

      {page === "messages" && <MessagesPage />}
      {page === "dashboard" && <DashboardPage devices={devices} myIds={myIds} onDelete={deleteDevice} onAdd={() => setAddOpen(true)} user={user} />}

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} onAuth={setUser} />
      <AddDeviceModal open={addOpen} onClose={() => setAddOpen(false)} user={user} onAdded={addDevice} showToast={showToast} />
      <DeviceDetailModal device={viewDevice} open={!!viewDevice} onClose={() => setViewDevice(null)} onBook={openBook} />
      <BookingModal device={bookDevice} open={!!bookDevice} onClose={() => setBookDevice(null)} user={user} showToast={showToast} />
      <Toast {...toast} />
    </>
  );
}
