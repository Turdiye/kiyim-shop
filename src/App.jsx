import React, { useState, useMemo, useRef } from "react";
import {
  ShoppingBag,
  X,
  Plus,
  Minus,
  Check,
  ArrowLeft,
  Copy,
  ShieldCheck,
  Truck,
  Sparkles,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */

const CATEGORIES = ["Все", "Футболки", "Худи", "Джинсы", "Куртки", "Платья", "Обувь"];

const PRODUCTS = [
  { id: 1, name: "Футболка «Oq Bulut»", category: "Футболки", price: 1200, img: "https://cdn-sh1.vigbo.com/shops/29284289774ec1fd75c5107112ab3dcb/products/21755365/images/3-3e62ddb9b6190141fe92cfdd59d5b6f9.jpg", sizes: ["S", "M", "L", "XL"] },
  { id: 2, name: "Худи «Registon»", category: "Худи", price: 2800, img: "https://mos-poshiv.ru/upload/webp/100/upload/iblock/988/qdvxoyr57k3lcx2j50t3uitig68ecoo8.webp", sizes: ["S", "M", "L", "XL"] },
  { id: 3, name: "Джинсы «Farg'ona»", category: "Джинсы", price: 2600, img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSEUVjtBJL8S1Ie3lieVwOYCNdv15hZyUwlNAnzlu27m9SDzUJoEa1mE6M&s=10", sizes: ["28", "30", "32", "34"] },
  { id: 4, name: "Куртка «Chorsu»", category: "Куртки", price: 3000, img: "https://olcha.uz/image/675x900/products/wxhbpIHEwInHl0lAeYn1s6klMuUROP5KMH0KesNtgIjCNgAAloaS8vXErZl8.jpg", sizes: ["S", "M", "L"] },
  { id: 5, name: "Платье «Zarafshon»", category: "Платья", price: 2400, img: "https://files.glamourboutique.uz/originals/121дип70.jpg", sizes: ["XS", "S", "M"] },
  { id: 6, name: "Кроссовки «Yurish»", category: "Обувь", price: 2900, img: "https://respect-shoes.ru/upload/iblock/14e/owzr7qaw4tkh2vnpcs2jthzwcs3yxc2k.JPG", sizes: ["38", "40", "42", "44"] },
  { id: 7, name: "Футболка «Ipak Yo'li»", category: "Футболки", price: 1400, img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR0yb9p0bqjdi7yMrwYgZDZyIB3qIhlTosOr728tMLF8xPJkgD9upe1Sug&s=10", sizes: ["S", "M", "L", "XL"] },
  { id: 8, name: "Худи «Tumanli Tong»", category: "Худи", price: 2700, img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRa-mEukcef2ggv892fOi_tBnOdCn5WVWlrCSBn7nCXV672X_QsjBcj48I&s=10", sizes: ["M", "L", "XL"] },
  { id: 9, name: "Платье «Baxmal»", category: "Платья", price: 2300, img: "https://static.lichishop.ru/imo/transform/profile=middle/product/52461/2f4132d0bfcb2750390ba32b9d6fc8e1.jpg", sizes: ["XS", "S", "M", "L"] },
  { id: 10, name: "Куртка «Qorako'l»", category: "Куртки", price: 3000, img: "https://imgcdn.loverepublic.ru/upload/images/54505/5450511111_50_4.jpg", sizes: ["M", "L", "XL"] },
  { id: 11, name: "Джинсы «Zomin»", category: "Джинсы", price: 2500, img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSBRm4JQeTLSXLEPxGXrIGETAULg67ObASM83YM8xWYhAuaup1qwH5gVWnJ&s=10", sizes: ["28", "30", "32", "34", "36"] },
  { id: 12, name: "Кроссовки «Chopqir»", category: "Обувь", price: 2800, img: "https://respect-shoes.ru/upload/iblock/74e/25sqrb5bejkidixriwmhrd9yepc41ic3.JPG", sizes: ["38", "39", "40", "41", "42"] },
];

const fmt = (n) => n.toLocaleString("ru-RU") + " сум";

/* ------------------------------------------------------------------ */
/* Telegram-уведомления о заказах                                     */
/* Настраиваются через .env (см. .env.example)                        */
/* ------------------------------------------------------------------ */

const TG_TOKEN = import.meta.env.VITE_TG_BOT_TOKEN;
const TG_CHAT_ID = import.meta.env.VITE_TG_CHAT_ID;
const TG_CONFIGURED = Boolean(TG_TOKEN && TG_CHAT_ID);

function buildOrderMessage({ orderId, items, form, subtotal, delivery, total }) {
  const lines = items
    .map((c) => `• ${c.product.name} (${c.size}) × ${c.qty} — ${fmt(c.product.price * c.qty)}`)
    .join("\n");
  return [
    `🛍 Новый заказ ${orderId}`,
    "",
    lines,
    "",
    `Товары: ${fmt(subtotal)}`,
    `Доставка: ${fmt(delivery)}`,
    `Итого: ${fmt(total)}`,
    "",
    `👤 ${form.name}`,
    `📞 ${form.phone}`,
    `🏙 ${form.city}`,
    `📍 ${form.address}`,
    "",
    "Оплата: P2P-перевод — проверь поступление на карту перед отправкой заказа.",
  ].join("\n");
}

async function sendTelegramNotification(text) {
  const res = await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: TG_CHAT_ID, text }),
  });
  if (!res.ok) throw new Error("Telegram request failed: " + res.status);
}

/* ------------------------------------------------------------------ */
/* App                                                                 */
/* ------------------------------------------------------------------ */

export default function App() {
  const [category, setCategory] = useState("Все");
  const [cart, setCart] = useState([]); // {id, size, qty}
  const [drawer, setDrawer] = useState(null); // null | 'cart' | 'form' | 'pay' | 'done'
  const [pendingSize, setPendingSize] = useState({});
  const [form, setForm] = useState({ name: "", phone: "", city: "Ташкент", address: "" });
  const [agreed, setAgreed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [orderId] = useState(() => "KY-" + Math.floor(100000 + Math.random() * 900000));
  const [notifyStatus, setNotifyStatus] = useState(null); // null | 'sending' | 'sent' | 'failed' | 'not-configured'
  const catalogRef = useRef(null);

  const filtered = useMemo(
    () => (category === "Все" ? PRODUCTS : PRODUCTS.filter((p) => p.category === category)),
    [category]
  );

  const cartDetailed = cart.map((c) => ({ ...c, product: PRODUCTS.find((p) => p.id === c.id) }));
  const totalQty = cart.reduce((s, c) => s + c.qty, 0);
  const subtotal = cartDetailed.reduce((s, c) => s + c.product.price * c.qty, 0);
  const delivery = subtotal > 0 ? 500 : 0;
  const total = subtotal + delivery;

  const addToCart = (product) => {
    const size = pendingSize[product.id] || product.sizes[0];
    setCart((prev) => {
      const existing = prev.find((c) => c.id === product.id && c.size === size);
      if (existing) {
        return prev.map((c) => (c === existing ? { ...c, qty: c.qty + 1 } : c));
      }
      return [...prev, { id: product.id, size, qty: 1 }];
    });
    setDrawer("cart");
  };

  const changeQty = (id, size, delta) => {
    setCart((prev) =>
      prev
        .map((c) => (c.id === id && c.size === size ? { ...c, qty: c.qty + delta } : c))
        .filter((c) => c.qty > 0)
    );
  };

  const removeItem = (id, size) => {
    setCart((prev) => prev.filter((c) => !(c.id === id && c.size === size)));
  };

  const closeDrawer = () => setDrawer(null);

  // ⚠️ Замени на свой настоящий номер карты Uzcard/Humo — сейчас здесь заглушка
  const cardNumber = "8600 0604 0455 1468";
  const copyCard = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const canSubmitForm = form.name.trim() && form.phone.trim() && form.address.trim();

  const finishOrder = async () => {
    const snapshot = cartDetailed;

    if (!TG_CONFIGURED) {
      setNotifyStatus("not-configured");
      setDrawer("done");
      setCart([]);
      setAgreed(false);
      return;
    }

    setNotifyStatus("sending");
    try {
      const text = buildOrderMessage({ orderId, items: snapshot, form, subtotal, delivery, total });
      await sendTelegramNotification(text);
      setNotifyStatus("sent");
    } catch (err) {
      console.error("Не удалось отправить заказ в Telegram:", err);
      setNotifyStatus("failed");
    }
    setDrawer("done");
    setCart([]);
    setAgreed(false);
  };

  const scrollToCatalog = () => {
    catalogRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="kiyim">
      <style>{`
        .kiyim {
          --bg: #17151f;
          --surface: #211e2b;
          --surface-2: #2a2635;
          --line: #38334667;
          --gold: #c6a15b;
          --gold-soft: #e4cd97;
          --brick: #a8452f;
          --brick-soft: #c4614a;
          --cream: #f3ede2;
          --muted: #948da3;
          background: var(--bg);
          color: var(--cream);
          font-family: 'Manrope', sans-serif;
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
        }
        .kiyim * { box-sizing: border-box; }
        .kiyim .serif { font-family: 'Fraunces', serif; }
        .kiyim .mono { font-family: 'JetBrains Mono', monospace; }

        /* ---------- header ---------- */
        .kiyim-header {
          position: sticky; top: 0; z-index: 40;
          display: flex; align-items: center; justify-content: space-between;
          padding: 18px 5vw;
          background: rgba(23,21,31,0.86);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid var(--line);
        }
        .kiyim-logo { display:flex; flex-direction:column; line-height:1; cursor:pointer; }
        .kiyim-logo b { font-family:'Fraunces', serif; font-style:italic; font-size:26px; letter-spacing:0.5px; color: var(--cream); }
        .kiyim-logo span { font-family:'JetBrains Mono', monospace; font-size:10px; letter-spacing:3px; color: var(--gold); margin-top:2px; }
        .cart-btn {
          position: relative; display:flex; align-items:center; gap:8px;
          background: var(--surface-2); border: 1px solid var(--line); color: var(--cream);
          padding: 10px 16px; border-radius: 999px; cursor:pointer; font-size:14px;
          transition: border-color .2s ease, transform .15s ease;
        }
        .cart-btn:hover { border-color: var(--gold); transform: translateY(-1px); }
        .cart-badge {
          position:absolute; top:-6px; right:-6px; background: var(--brick); color:#fff;
          font-size:11px; font-family:'JetBrains Mono',monospace; min-width:18px; height:18px;
          border-radius:50%; display:flex; align-items:center; justify-content:center; padding:0 4px;
        }

        /* ---------- hero ---------- */
        .hero { padding: 72px 5vw 56px; position:relative; }
        .hero-eyebrow {
          font-family:'JetBrains Mono',monospace; font-size:11px; letter-spacing:3px; color: var(--gold);
          display:flex; align-items:center; gap:8px; margin-bottom: 18px; text-transform:uppercase;
        }
        .hero-eyebrow::before { content:''; width:26px; height:1px; background: var(--gold); display:inline-block; }
        .hero h1 {
          font-family:'Fraunces', serif; font-weight:500; font-size: clamp(34px, 6vw, 68px);
          line-height:1.04; max-width: 820px; margin:0 0 20px;
          color: var(--cream);
        }
        .hero h1 em { color: var(--brick-soft); font-style: italic; }
        .hero p.lead { max-width:520px; color: var(--muted); font-size:16px; line-height:1.6; margin-bottom:32px; }
        .hero-cta {
          background: var(--gold); color:#1c1a24; border:none; padding:14px 26px; border-radius:999px;
          font-weight:700; font-size:14px; cursor:pointer; letter-spacing:.3px;
          transition: transform .15s ease, box-shadow .15s ease;
        }
        .hero-cta:hover { transform: translateY(-2px); box-shadow: 0 10px 24px -8px rgba(198,161,91,.5); }
        .hero-strip {
          margin-top:56px; display:flex; gap:28px; flex-wrap:wrap; color: var(--muted); font-size:13px;
          border-top:1px solid var(--line); padding-top:20px;
        }
        .hero-strip div { display:flex; align-items:center; gap:8px; }
        .hero-strip svg { color: var(--gold); width:16px; height:16px; }

        /* ---------- categories ---------- */
        .chips {
          display:flex; gap:10px; padding: 0 5vw 28px; overflow-x:auto; scrollbar-width:none;
        }
        .chips::-webkit-scrollbar{ display:none; }
        .chip {
          flex: 0 0 auto; padding: 9px 18px; border-radius:999px; border:1px solid var(--line);
          background: var(--surface); color: var(--muted); font-size:13px; cursor:pointer; white-space:nowrap;
          transition: all .15s ease;
        }
        .chip.active { background: var(--brick); border-color: var(--brick); color:#fff; }
        .chip:hover:not(.active) { border-color: var(--gold); color: var(--cream); }

        /* ---------- grid ---------- */
        .grid {
          display:grid; grid-template-columns: repeat(4, 1fr); gap:26px; padding: 0 5vw 90px;
        }
        @media (max-width: 1100px) { .grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 760px) { .grid { grid-template-columns: repeat(2, 1fr); gap:16px; } }
        @media (max-width: 460px) { .grid { grid-template-columns: 1fr; } }

        .card {
          background: var(--surface); border:1px solid var(--line); border-radius:14px; overflow:hidden;
          display:flex; flex-direction:column; position:relative;
        }
        .card-img-wrap { position:relative; aspect-ratio: 4/5; overflow:hidden; background:#000; }
        .card-img-wrap img { width:100%; height:100%; object-fit:cover; transition: transform .5s ease; }
        .card:hover .card-img-wrap img { transform: scale(1.06); }

        .price-tag {
          position:absolute; top:14px; right:-8px; background: var(--gold-soft); color:#1c1a24;
          font-family:'JetBrains Mono',monospace; font-size:13px; font-weight:700;
          padding:6px 14px 6px 18px; transform: rotate(-4deg); box-shadow: 0 4px 10px rgba(0,0,0,.35);
          border-radius: 2px;
        }
        .price-tag::before {
          content:''; position:absolute; left:6px; top:50%; transform: translateY(-50%);
          width:6px; height:6px; border-radius:50%; background: var(--surface);
        }

        .card-body { padding: 16px 16px 18px; display:flex; flex-direction:column; gap:10px; flex:1; }
        .card-cat { font-size:11px; letter-spacing:2px; text-transform:uppercase; color: var(--gold); font-family:'JetBrains Mono',monospace; }
        .card-name { font-family:'Fraunces', serif; font-size:19px; color: var(--cream); line-height:1.2; }
        .size-row { display:flex; gap:6px; flex-wrap:wrap; margin-top:auto; }
        .size-btn {
          border:1px solid var(--line); background:transparent; color: var(--muted); font-size:12px;
          padding:5px 10px; border-radius:6px; cursor:pointer; font-family:'JetBrains Mono',monospace;
        }
        .size-btn.active { border-color: var(--gold); color: var(--gold); background: rgba(198,161,91,0.08); }
        .add-btn {
          margin-top:10px; background: transparent; border:1px solid var(--gold); color: var(--gold);
          padding:10px; border-radius:8px; font-size:13px; font-weight:700; cursor:pointer; letter-spacing:.3px;
          transition: background .15s ease, color .15s ease;
        }
        .add-btn:hover { background: var(--gold); color:#1c1a24; }

        /* ---------- footer ---------- */
        .kiyim-footer {
          border-top:1px solid var(--line); padding: 36px 5vw; display:flex; justify-content:space-between;
          flex-wrap:wrap; gap:16px; color: var(--muted); font-size:13px;
        }
        .kiyim-footer b.serif { color: var(--cream); font-size:18px; font-style:italic; }

        /* ---------- overlay + drawer ---------- */
        .overlay {
          position:fixed; inset:0; background: rgba(10,9,14,0.6); z-index:50;
          animation: fade .2s ease;
        }
        @keyframes fade { from{opacity:0} to{opacity:1} }
        .drawer {
          position:fixed; top:0; right:0; bottom:0; width:420px; max-width:100vw;
          background: var(--surface); z-index:51; display:flex; flex-direction:column;
          box-shadow: -20px 0 60px rgba(0,0,0,.4);
          animation: slidein .25s cubic-bezier(.2,.8,.2,1);
        }
        @keyframes slidein { from{ transform:translateX(100%);} to{ transform:translateX(0);} }
        .drawer-head {
          display:flex; align-items:center; justify-content:space-between; padding:20px 22px;
          border-bottom:1px solid var(--line);
        }
        .drawer-head h3 { font-family:'Fraunces', serif; font-size:22px; margin:0; display:flex; align-items:center; gap:10px; }
        .icon-btn { background:transparent; border:none; color: var(--muted); cursor:pointer; padding:6px; border-radius:8px; }
        .icon-btn:hover { color: var(--cream); background: var(--surface-2); }
        .drawer-body { padding: 18px 22px; overflow-y:auto; flex:1; display:flex; flex-direction:column; gap:16px; }
        .drawer-foot { padding: 18px 22px; border-top:1px solid var(--line); }

        .cart-line { display:flex; gap:12px; border-bottom:1px solid var(--line); padding-bottom:14px; }
        .cart-line img { width:64px; height:80px; object-fit:cover; border-radius:8px; flex-shrink:0; }
        .cart-line-info { flex:1; display:flex; flex-direction:column; gap:6px; }
        .cart-line-top { display:flex; justify-content:space-between; gap:8px; }
        .cart-line-name { font-family:'Fraunces', serif; font-size:15px; }
        .cart-line-meta { color: var(--muted); font-size:12px; font-family:'JetBrains Mono',monospace; }
        .qty-row { display:flex; align-items:center; gap:10px; margin-top:4px; }
        .qty-row button {
          width:26px; height:26px; border-radius:6px; border:1px solid var(--line); background: var(--surface-2);
          color: var(--cream); cursor:pointer; display:flex; align-items:center; justify-content:center;
        }
        .qty-row span { font-family:'JetBrains Mono',monospace; font-size:13px; min-width:16px; text-align:center; }
        .remove-link { background:none; border:none; color: var(--brick-soft); font-size:12px; cursor:pointer; padding:0; align-self:flex-start; }

        .empty-cart { text-align:center; color: var(--muted); padding: 60px 10px; display:flex; flex-direction:column; align-items:center; gap:14px; }

        .totals-row { display:flex; justify-content:space-between; font-size:14px; color: var(--muted); margin-bottom:6px; }
        .totals-row.grand { color: var(--cream); font-size:18px; font-family:'Fraunces', serif; margin-top:10px; padding-top:10px; border-top:1px solid var(--line); }
        .primary-btn {
          width:100%; background: var(--brick); color:#fff; border:none; padding:14px; border-radius:10px;
          font-weight:700; font-size:14px; cursor:pointer; margin-top:14px; letter-spacing:.3px;
          transition: background .15s ease, transform .15s ease;
        }
        .primary-btn:hover:not(:disabled) { background: var(--brick-soft); transform: translateY(-1px); }
        .primary-btn:disabled { opacity:.4; cursor:not-allowed; }
        .ghost-btn {
          width:100%; background: transparent; color: var(--cream); border:1px solid var(--line); padding:12px;
          border-radius:10px; font-size:13px; cursor:pointer; margin-top:8px;
        }
        .ghost-btn:hover { border-color: var(--gold); }

        .back-row { display:flex; align-items:center; gap:8px; color: var(--muted); font-size:13px; cursor:pointer; margin-bottom:4px; }
        .back-row:hover { color: var(--cream); }

        .field { display:flex; flex-direction:column; gap:6px; }
        .field label { font-size:12px; color: var(--muted); font-family:'JetBrains Mono',monospace; letter-spacing:.5px; }
        .field input, .field textarea {
          background: var(--surface-2); border:1px solid var(--line); border-radius:8px; padding:11px 12px;
          color: var(--cream); font-family:'Manrope',sans-serif; font-size:14px; outline:none;
        }
        .field input:focus, .field textarea:focus { border-color: var(--gold); }

        .pay-card {
          background: linear-gradient(135deg, var(--surface-2), #221f2c); border:1px solid var(--line);
          border-radius:14px; padding:20px; display:flex; flex-direction:column; gap:12px;
        }
        .pay-card .bank { display:flex; justify-content:space-between; align-items:center; font-size:12px; color: var(--muted); font-family:'JetBrains Mono',monospace; letter-spacing:1px; }
        .pay-card .number { font-family:'JetBrains Mono',monospace; font-size:22px; letter-spacing:2px; color: var(--gold-soft); display:flex; align-items:center; justify-content:space-between; }
        .copy-chip { background: var(--surface); border:1px solid var(--line); color: var(--cream); font-size:11px; padding:6px 10px; border-radius:999px; cursor:pointer; display:flex; align-items:center; gap:6px; }
        .copy-chip:hover { border-color: var(--gold); }
        .pay-card .holder { font-size:13px; color: var(--muted); }

        .steps { display:flex; gap:6px; margin-bottom:4px; }
        .step-dot { height:3px; flex:1; border-radius:3px; background: var(--line); }
        .step-dot.done { background: var(--gold); }

        .agree-row { display:flex; align-items:flex-start; gap:10px; font-size:13px; color: var(--muted); cursor:pointer; }
        .agree-row input { margin-top:3px; accent-color: var(--gold); }

        .success-wrap { text-align:center; padding: 30px 10px; display:flex; flex-direction:column; align-items:center; gap:16px; }
        .success-icon { width:64px; height:64px; border-radius:50%; background: var(--gold); display:flex; align-items:center; justify-content:center; color:#1c1a24; }
        .order-code { font-family:'JetBrains Mono',monospace; letter-spacing:2px; color: var(--gold-soft); font-size:15px; background: var(--surface-2); padding:8px 16px; border-radius:8px; }

        @media (max-width: 480px) {
          .drawer { width:100vw; }
          .hero { padding: 56px 6vw 40px; }
        }
      `}</style>

      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,500;0,600;1,500&family=Manrope:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');`}</style>

      {/* ---------------- Header ---------------- */}
      <header className="kiyim-header">
        <div className="kiyim-logo" onClick={scrollToCatalog}>
          <b>KIYIM.UZ</b>
          <span>ODATIY EMAS · TASHKENT</span>
        </div>
        <button className="cart-btn" onClick={() => setDrawer("cart")}>
          <ShoppingBag size={18} />
          Корзина
          {totalQty > 0 && <span className="cart-badge">{totalQty}</span>}
        </button>
      </header>

      {/* ---------------- Hero ---------------- */}
      <section className="hero">
        <div className="hero-eyebrow">Коллекция «Шёлковый путь» · 2026</div>
        <h1>
          Одежда, которую <em>выбираешь</em><br />не по каталогу, а по себе.
        </h1>
        <p className="lead">
          Плотный хлопок, честные швы и цены без наценки посредников.
          Оплата — прямым переводом, без комиссий банка.
        </p>
        <button className="hero-cta" onClick={scrollToCatalog}>Смотреть каталог</button>

        <div className="hero-strip">
          <div><Truck size={16} /> Доставка по Ташкенту — 500 сум</div>
          <div><ShieldCheck size={16} /> Оплата P2P-переводом на карту</div>
          <div><Sparkles size={16} /> Новая партия каждую неделю</div>
        </div>
      </section>

      {/* ---------------- Categories ---------------- */}
      <div className="chips" ref={catalogRef}>
        {CATEGORIES.map((c) => (
          <button key={c} className={"chip" + (category === c ? " active" : "")} onClick={() => setCategory(c)}>
            {c}
          </button>
        ))}
      </div>

      {/* ---------------- Grid ---------------- */}
      <section className="grid">
        {filtered.map((p) => {
          const selectedSize = pendingSize[p.id] || p.sizes[0];
          return (
            <div className="card" key={p.id}>
              <div className="card-img-wrap">
                <img src={p.img} alt={p.name} loading="lazy" />
                <div className="price-tag">{fmt(p.price)}</div>
              </div>
              <div className="card-body">
                <div className="card-cat">{p.category}</div>
                <div className="card-name">{p.name}</div>
                <div className="size-row">
                  {p.sizes.map((s) => (
                    <button
                      key={s}
                      className={"size-btn" + (selectedSize === s ? " active" : "")}
                      onClick={() => setPendingSize((prev) => ({ ...prev, [p.id]: s }))}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <button className="add-btn" onClick={() => addToCart(p)}>Добавить в корзину</button>
              </div>
            </div>
          );
        })}
      </section>

      {/* ---------------- Footer ---------------- */}
      <footer className="kiyim-footer">
        <b className="serif">KIYIM.UZ</b>
        <div>Ташкент, Узбекистан · Пн–Вс, 10:00–20:00</div>
        <div>Портфолио-проект · демо-магазин</div>
      </footer>

      {/* ---------------- Overlay + Drawer ---------------- */}
      {drawer && (
        <div className="overlay" onClick={closeDrawer}>
          <div className="drawer" onClick={(e) => e.stopPropagation()}>

            {/* CART STEP */}
            {drawer === "cart" && (
              <>
                <div className="drawer-head">
                  <h3><ShoppingBag size={20} /> Корзина</h3>
                  <button className="icon-btn" onClick={closeDrawer}><X size={20} /></button>
                </div>
                <div className="drawer-body">
                  {cartDetailed.length === 0 ? (
                    <div className="empty-cart">
                      <ShoppingBag size={40} strokeWidth={1} />
                      <div>Корзина пока пуста</div>
                      <button className="ghost-btn" onClick={closeDrawer} style={{marginTop:0}}>Выбрать товары</button>
                    </div>
                  ) : (
                    cartDetailed.map((c) => (
                      <div className="cart-line" key={c.id + c.size}>
                        <img src={c.product.img} alt={c.product.name} />
                        <div className="cart-line-info">
                          <div className="cart-line-top">
                            <div className="cart-line-name">{c.product.name}</div>
                            <button className="remove-link" onClick={() => removeItem(c.id, c.size)}>убрать</button>
                          </div>
                          <div className="cart-line-meta">размер {c.size} · {fmt(c.product.price)}</div>
                          <div className="qty-row">
                            <button onClick={() => changeQty(c.id, c.size, -1)}><Minus size={13} /></button>
                            <span>{c.qty}</span>
                            <button onClick={() => changeQty(c.id, c.size, 1)}><Plus size={13} /></button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {cartDetailed.length > 0 && (
                  <div className="drawer-foot">
                    <div className="totals-row"><span>Товары</span><span>{fmt(subtotal)}</span></div>
                    <div className="totals-row"><span>Доставка</span><span>{fmt(delivery)}</span></div>
                    <div className="totals-row grand"><span>Итого</span><span>{fmt(total)}</span></div>
                    <button className="primary-btn" onClick={() => setDrawer("form")}>Оформить заказ</button>
                  </div>
                )}
              </>
            )}

            {/* CONTACT FORM STEP */}
            {drawer === "form" && (
              <>
                <div className="drawer-head">
                  <h3>Данные для доставки</h3>
                  <button className="icon-btn" onClick={closeDrawer}><X size={20} /></button>
                </div>
                <div className="drawer-body">
                  <div className="steps"><div className="step-dot done" /><div className="step-dot" /><div className="step-dot" /></div>
                  <div className="back-row" onClick={() => setDrawer("cart")}><ArrowLeft size={14} /> Назад в корзину</div>
                  <div className="field">
                    <label>Имя и фамилия</label>
                    <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Например, Дилноза Каримова" />
                  </div>
                  <div className="field">
                    <label>Телефон</label>
                    <input type="tel" inputMode="numeric" value={form.phone} onChange={(e) =>  setForm({ ...form, phone: e.target.value })} placeholder="998 90 123 45 67"/>
                  </div>
                  <div className="field">
                    <label>Город</label>
                    <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                  </div>
                  <div className="field">
                    <label>Адрес доставки</label>
                    <textarea rows={3} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Улица, дом, квартира, ориентир" />
                  </div>
                </div>
                <div className="drawer-foot">
                  <div className="totals-row grand" style={{marginBottom:4}}><span>К оплате</span><span>{fmt(total)}</span></div>
                  <button className="primary-btn" disabled={!canSubmitForm} onClick={() => setDrawer("pay")}>Перейти к оплате</button>
                </div>
              </>
            )}

            {/* PAYMENT STEP */}
            {drawer === "pay" && (
              <>
                <div className="drawer-head">
                  <h3>Оплата переводом</h3>
                  <button className="icon-btn" onClick={closeDrawer}><X size={20} /></button>
                </div>
                <div className="drawer-body">
                  <div className="steps"><div className="step-dot done" /><div className="step-dot done" /><div className="step-dot" /></div>
                  <div className="back-row" onClick={() => setDrawer("form")}><ArrowLeft size={14} /> Назад к данным</div>

                  <div className="pay-card">
                    <div className="bank">UZCARD / HUMO<span>P2P-перевод</span></div>
                    <div className="number">
                      {cardNumber}
                      <button
                        className="copy-chip"
                        onClick={() => { navigator.clipboard?.writeText(cardNumber.replace(/\s/g, "")); copyCard(); }}
                      >
                        {copied ? <Check size={13} /> : <Copy size={13} />} {copied ? "Скопировано" : "Копировать"}
                      </button>
                    </div>
                    <div className="holder">Получатель: KIYIM UZ SHOP · назначение платежа: заказ {orderId}</div>
                  </div>

                  <div className="field">
                    <label>Сумма к переводу</label>
                    <input readOnly value={fmt(total)} />
                  </div>

                  <p style={{fontSize:13, color:"var(--muted)", lineHeight:1.6}}>
                    Переведите указанную сумму на карту выше и отметьте, что оплата отправлена.
                    Заказ уходит в обработку сразу после подтверждения — менеджер свяжется по указанному телефону для сверки.
                  </p>

                  <label className="agree-row">
                    <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
                    Я перевёл(а) {fmt(total)} на указанную карту и готов(а) подтвердить заказ
                  </label>
                </div>
                <div className="drawer-foot">
                  <button
                    className="primary-btn"
                    disabled={!agreed || notifyStatus === "sending"}
                    onClick={finishOrder}
                  >
                    {notifyStatus === "sending" ? "Отправляем..." : "Подтвердить заказ"}
                  </button>
                </div>
              </>
            )}

            {/* SUCCESS STEP */}
            {drawer === "done" && (
              <>
                <div className="drawer-head">
                  <h3>Готово</h3>
                  <button className="icon-btn" onClick={closeDrawer}><X size={20} /></button>
                </div>
                <div className="drawer-body">
                  <div className="success-wrap">
                    <div className="success-icon"><Check size={30} /></div>
                    <div className="serif" style={{fontSize:22}}>Заказ принят!</div>
                    <div style={{color:"var(--muted)", fontSize:14, maxWidth:280}}>
                      Мы проверим перевод и свяжемся с вами по телефону {form.phone || "—"} для подтверждения доставки в {form.city}.
                    </div>
                    <div className="order-code">Номер заказа {orderId}</div>
                    {notifyStatus === "sent" && (
                      <div style={{ fontSize: 12, color: "var(--gold)" }}>✅ Менеджер получил заказ в Telegram</div>
                    )}
                    {notifyStatus === "failed" && (
                      <div style={{ fontSize: 12, color: "var(--brick-soft)" }}>
                        ⚠️ Не удалось отправить уведомление, свяжитесь с менеджером напрямую
                      </div>
                    )}
                    {notifyStatus === "not-configured" && (
                      <div style={{ fontSize: 12, color: "var(--muted)" }}>
                        Telegram-бот не настроен — заполните .env (см. README)
                      </div>
                    )}
                    <button className="ghost-btn" onClick={closeDrawer}>Продолжить покупки</button>
                  </div>
                </div>
              </>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
