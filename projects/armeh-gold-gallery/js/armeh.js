/* ═══════════════════════════════════════════
   ARMEH GOLD  —  Auth · Cart · Products · UI
   ═══════════════════════════════════════════ */

/* ── Injected shared CSS ── */
(function () {
  const css = `
    .nav { align-items:center; }
    .nav-links {
      display:flex; align-items:center; gap:32px;
      list-style:none; margin:0; padding:0; height:100%;
    }
    .nav-links > li { display:flex; align-items:center; }
    .nav-links a {
      display:inline-flex; align-items:center; justify-content:center;
      line-height:1; min-height:36px; white-space:nowrap;
    }
    .nav-end {
      display:flex; align-items:center; gap:14px;
      order:1; flex-direction:row-reverse; flex-shrink:0;
    }
    .nav-logo { display:flex; align-items:center; line-height:0; }
    .nav-logo-img { display:block; vertical-align:middle; }
    .nav-cart {
      position:relative; display:inline-flex; align-items:center; justify-content:center;
      width:36px; height:36px; flex-shrink:0;
      color:var(--green,#114411); transition:color .2s;
    }
    .nav-cart svg { width:22px; height:22px; display:block; }
    .nav-cart:hover { color:var(--gold-dark,#9a7e28); }
    .nav-search {
      display:inline-flex; align-items:center; justify-content:center;
      width:36px; height:36px; flex-shrink:0;
      color:var(--green,#114411); background:none; border:none; cursor:pointer;
      padding:0; transition:color .2s;
    }
    .nav-search svg { width:22px; height:22px; display:block; }
    .nav-search:hover, .nav-search.active { color:var(--gold-dark,#9a7e28); }
    .search-panel {
      position:fixed; top:76px; left:0; right:0; z-index:98;
      background:rgba(255,255,255,.97); backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px);
      border-bottom:1px solid var(--border,#e0ddd5);
      box-shadow:0 8px 24px rgba(0,0,0,.06);
      padding:16px 40px 20px;
      opacity:0; pointer-events:none; visibility:hidden;
      transition:opacity .2s, visibility .2s;
    }
    .search-panel.open { opacity:1; pointer-events:auto; visibility:visible; }
    .search-panel-inner { max-width:1160px; margin:0 auto; }
    .search-input-wrap { position:relative; }
    .search-input {
      width:100%; padding:12px 44px 12px 16px;
      border:1px solid var(--border,#e0ddd5); border-radius:2px;
      font-family:'Vazirmatn',sans-serif; font-size:14px;
      background:var(--white,#fff); color:var(--text,#1a1a1a);
    }
    .search-input:focus { outline:none; border-color:var(--green,#114411); }
    .search-input-icon {
      position:absolute; top:50%; right:14px; transform:translateY(-50%);
      color:var(--text-muted,#9a9a9a); pointer-events:none; line-height:0;
    }
    .search-input-icon svg { width:18px; height:18px; display:block; }
    .search-results { margin-top:12px; max-height:min(360px,50vh); overflow-y:auto; }
    .search-results:empty { display:none; }
    .search-result-item {
      display:flex; align-items:center; justify-content:space-between; gap:12px;
      padding:12px 14px; border-radius:2px; cursor:pointer;
      border:none; background:none; width:100%; text-align:right;
      font-family:'Vazirmatn',sans-serif; transition:background .15s;
    }
    .search-result-item:hover { background:var(--green-tint,#f2f6f2); }
    .search-result-name { font-size:14px; font-weight:600; color:var(--green-deep,#0c330c); }
    .search-result-meta { font-size:11px; color:var(--text-muted,#9a9a9a); margin-top:2px; }
    .search-result-price { font-size:13px; font-weight:700; color:var(--gold-dark,#9a7e28); flex-shrink:0; direction:ltr; }
    .search-empty { padding:16px; text-align:center; font-size:13px; color:var(--text-muted,#9a9a9a); }
    .search-hint { font-size:12px; color:var(--text-muted,#9a9a9a); margin-top:8px; }
    .cart-badge {
      position:absolute; top:-7px; left:-8px;
      background:var(--gold,#c9a840); color:#fff;
      font-size:9px; font-weight:700; min-width:16px; height:16px;
      border-radius:8px; display:flex; align-items:center;
      justify-content:center; padding:0 3px;
      font-family:'Vazirmatn',sans-serif; line-height:1;
    }
    .nav-logout-btn {
      display:inline-flex; align-items:center; justify-content:center;
      background:none; border:1px solid rgba(192,57,43,.3); cursor:pointer;
      font-family:'Vazirmatn',sans-serif; font-size:13px; font-weight:500;
      color:#c0392b; height:32px; padding:0 12px; border-radius:2px;
      line-height:1; transition:background .2s; flex-shrink:0;
    }
    .nav-logout-btn:hover { background:rgba(192,57,43,.07); }
    .nav-user-name {
      display:inline-flex; align-items:center; line-height:1;
      font-size:13px; font-weight:600; color:var(--green,#114411);
      min-height:36px;
    }
    .nav-admin-link {
      display:inline-flex; align-items:center; line-height:1;
      font-size:13px; font-weight:600; color:var(--green,#114411);
      min-height:36px;
    }
    .nav-icon-link { display:inline-flex; align-items:center; gap:7px; line-height:1; }
    .nav-icon-link svg { width:14px; height:14px; flex-shrink:0; display:block; }
    #nav-logout-li:not([hidden]) { display:flex; align-items:center; gap:10px; }
    #nav-links > li[hidden] { display:none !important; }
    .footer-instagram {
      display:inline-flex; align-items:center; justify-content:center;
      margin-top:14px; color:rgba(201,168,64,0.55); line-height:0;
      transition:color .25s ease, transform .25s ease;
    }
    .footer-instagram:hover { color:var(--gold,#c9a840); transform:scale(1.12); }
    .footer-instagram svg { width:22px; height:22px; display:block; }
    .product-card { position:relative; }
    .product-card[data-available="false"]::after {
      content:'ناموجود'; position:absolute; inset:0;
      background:rgba(250,249,246,.75); display:flex;
      align-items:center; justify-content:center;
      font-size:13px; font-weight:700; color:#888;
      border-radius:3px; pointer-events:none;
    }
    .btn-add-cart {
      display:inline-flex; align-items:center; gap:6px;
      font-size:11px; font-weight:700; letter-spacing:.08em;
      color:var(--green,#114411); border:none; border-bottom:1px solid rgba(17,68,17,.25);
      padding-bottom:2px; background:none; cursor:pointer;
      font-family:'Vazirmatn',sans-serif; transition:gap .2s,border-color .2s,color .2s;
    }
    .btn-add-cart:hover { gap:9px; border-color:var(--green,#114411); }
    .btn-add-cart svg { width:12px; height:12px; flex-shrink:0; }
    .btn-add-cart.added { color:var(--gold-dark,#9a7e28); border-color:var(--gold,#c9a840); }
    .product-card[data-available="false"] .btn-add-cart { pointer-events:none; opacity:.35; }
    .product-price { font-size:14px; font-weight:700; color:var(--gold-dark,#9a7e28); margin-bottom:14px; letter-spacing:.02em; }
    .cart-item-price { font-size:12px; font-weight:600; color:var(--gold-dark,#9a7e28); margin-top:4px; }
    .product-art.has-image { padding:0; overflow:hidden; }
    .product-art.has-image img { width:100%; height:100%; object-fit:cover; display:block; }
    .product-art-placeholder { opacity:.85; }
    .product-art-clickable { cursor:pointer; position:relative; }
    .product-img-count {
      position:absolute; bottom:8px; left:8px;
      background:rgba(17,68,17,.75); color:#fff;
      font-size:10px; font-weight:600; padding:3px 8px; border-radius:2px;
      pointer-events:none;
    }
    .product-name-clickable { cursor:pointer; transition:color .2s; }
    .product-name-clickable:hover { color:var(--green,#114411); }
    .product-card.product-highlight {
      outline:2px solid var(--gold,#c9a840); outline-offset:3px;
      box-shadow:0 0 0 4px rgba(201,168,64,.18);
    }
    .coll-filter-dropdown {
      position:relative; z-index:30; margin-bottom:24px;
      display:flex; justify-content:flex-start;
    }
    .coll-filter-dropdown.is-open,
    .coll-filter-dropdown:has(.coll-filter-menu.open) { z-index:90; }
    .coll-filter-dropdown.reveal,
    .coll-filter-dropdown.reveal.visible { transform:none; }
    .coll-filter-toggle {
      display:inline-flex; align-items:center; gap:8px;
      padding:10px 16px; border:1px solid var(--border,#e0ddd5); border-radius:2px;
      background:var(--white,#fff); cursor:pointer;
      font-family:'Vazirmatn',sans-serif; font-size:13px; font-weight:600;
      color:var(--green-deep,#0c330c); transition:border-color .2s,color .2s,box-shadow .2s;
    }
    .coll-filter-toggle:hover, .coll-filter-toggle.open {
      border-color:var(--green,#114411); color:var(--green,#114411);
    }
    .coll-filter-toggle.open { box-shadow:0 4px 14px rgba(17,68,17,.08); }
    .coll-filter-toggle svg { width:16px; height:16px; flex-shrink:0; display:block; }
    .coll-filter-chevron { transition:transform .2s; opacity:.65; }
    .coll-filter-toggle.open .coll-filter-chevron { transform:rotate(180deg); }
    .coll-filter-badge {
      width:7px; height:7px; border-radius:50%; background:var(--gold,#c9a840); flex-shrink:0;
    }
    .coll-filter-badge[hidden] { display:none; }
    .coll-filter-menu {
      position:absolute; top:calc(100% + 8px); right:0; z-index:1;
      min-width:280px; padding:16px;
      background:var(--white,#fff); border:1px solid var(--border,#e0ddd5);
      border-radius:3px; box-shadow:0 12px 36px rgba(0,0,0,.1);
      opacity:0; visibility:hidden; pointer-events:none;
      transform:translateY(-6px); transition:opacity .2s,transform .2s,visibility .2s;
    }
    .coll-filter-menu.open {
      opacity:1; visibility:visible; pointer-events:auto; transform:translateY(0);
    }
    .coll-filter-group { display:flex; flex-direction:column; gap:6px; margin-bottom:14px; }
    .coll-filter-group:last-of-type { margin-bottom:0; }
    .coll-filter-group label {
      font-size:11px; font-weight:700; letter-spacing:.06em;
      color:var(--green-deep,#0c330c);
    }
    .coll-filter-select {
      width:100%; padding:9px 12px; border:1px solid var(--border,#e0ddd5); border-radius:2px;
      font-family:'Vazirmatn',sans-serif; font-size:13px; color:var(--text,#1a1a1a);
      background:var(--off-white,#faf9f6); outline:none; cursor:pointer;
    }
    .coll-filter-select:focus { border-color:var(--green,#114411); background:var(--white,#fff); }
    .coll-filter-reset {
      width:100%; margin-top:14px; padding:8px 12px;
      border:1px solid var(--border,#e0ddd5); border-radius:2px;
      background:none; font-family:'Vazirmatn',sans-serif; font-size:12px; font-weight:600;
      color:var(--text-dim,#6b6b6b); cursor:pointer; transition:background .2s,color .2s;
    }
    .coll-filter-reset:hover { background:var(--green-tint,#f2f6f2); color:var(--green,#114411); }
    .coll-filter-empty {
      grid-column:1/-1; text-align:center; color:var(--text-muted,#9a9a9a);
      padding:48px 0; font-size:14px;
    }
    .pd-overlay {
      position:fixed; inset:0; z-index:2000;
      background:rgba(12,51,12,.45); backdrop-filter:blur(4px);
      display:flex; align-items:center; justify-content:center;
      padding:24px; opacity:1; transition:opacity .25s;
    }
    .pd-overlay.hidden { display:none; }
    .pd-modal {
      background:var(--white,#fff); border-radius:4px;
      max-width:720px; width:100%; max-height:90vh; overflow:auto;
      position:relative; box-shadow:0 20px 60px rgba(0,0,0,.18);
    }
    .pd-close {
      position:absolute; top:12px; left:12px; z-index:2;
      background:rgba(255,255,255,.9); border:1px solid var(--border,#e0ddd5);
      width:32px; height:32px; border-radius:2px; cursor:pointer;
      font-size:20px; line-height:1; color:var(--text-dim,#6b6b6b);
      display:flex; align-items:center; justify-content:center;
    }
    .pd-close:hover { background:var(--off-white,#faf9f6); color:var(--green,#114411); }
    .pd-gallery { position:relative; background:var(--cream,#faf9f6); border-bottom:1px solid var(--border,#e0ddd5); }
    .pd-slide-wrap { height:320px; display:flex; align-items:center; justify-content:center; overflow:hidden; }
    .pd-slide { max-width:100%; max-height:320px; object-fit:contain; display:block; }
    .pd-placeholder { opacity:.7; }
    .pd-nav {
      position:absolute; top:50%; transform:translateY(-50%);
      width:36px; height:36px; border-radius:2px;
      background:rgba(255,255,255,.92); border:1px solid var(--border,#e0ddd5);
      color:var(--green,#114411); font-size:22px; line-height:1;
      cursor:pointer; display:flex; align-items:center; justify-content:center;
      transition:background .2s,color .2s; z-index:1;
    }
    .pd-nav:hover { background:var(--green,#114411); color:#fff; border-color:var(--green,#114411); }
    .pd-nav:disabled { opacity:.35; cursor:default; pointer-events:none; }
    .pd-prev { right:12px; }
    .pd-next { left:12px; }
    .pd-dots { display:flex; justify-content:center; gap:6px; padding:12px; flex-wrap:wrap; }
    .pd-dot {
      width:7px; height:7px; border-radius:50%; border:none; padding:0;
      background:rgba(17,68,17,.2); cursor:pointer; transition:background .2s,transform .2s;
    }
    .pd-dot.active { background:var(--gold,#c9a840); transform:scale(1.2); }
    .pd-info { padding:24px 28px 28px; }
    .pd-collection { font-size:10px; font-weight:700; letter-spacing:.12em; text-transform:uppercase; color:var(--gold-dark,#9a7e28); margin-bottom:8px; display:block; }
    .pd-name { font-size:1.35rem; font-weight:700; color:var(--green-deep,#0c330c); margin-bottom:10px; line-height:1.35; }
    .pd-material { font-size:13px; color:var(--text-muted,#9a9a9a); margin-bottom:8px; }
    .pd-price { font-size:1.1rem; font-weight:700; color:var(--gold-dark,#9a7e28); margin-bottom:12px; }
    .pd-desc { font-size:13px; color:var(--text-dim,#6b6b6b); line-height:1.85; margin-bottom:16px; }
    .pd-status { font-size:12px; font-weight:600; margin-bottom:18px; }
    .pd-status.available { color:var(--green,#114411); }
    .pd-status.unavailable { color:#c0392b; }
    .pd-add-cart { font-size:13px !important; padding-bottom:3px; }
    .nav-toggle {
      display:none; flex-direction:column; justify-content:center; gap:5px;
      width:32px; height:36px; padding:4px; margin:0;
      background:none; border:none; cursor:pointer; flex-shrink:0; align-self:center;
    }
    .nav-toggle span {
      display:block; height:1.5px; background:var(--text,#1a1a1a); border-radius:1px;
      transition:transform .25s,opacity .25s;
    }
    .nav-toggle span:nth-child(2) { width:75%; }
    .data-table-wrap { width:100%; overflow-x:auto; -webkit-overflow-scrolling:touch; }
    @media (max-width:768px) {
      .nav { padding-left:20px !important; padding-right:20px !important; }
      .nav-links { display:none !important; }
      .nav-links.open {
        display:flex !important; flex-direction:column; align-items:stretch;
        position:absolute; top:76px; left:0; right:0;
        height:auto !important; min-height:0;
        background:var(--white,#fff);
        border-bottom:1px solid var(--border,#e0ddd5);
        padding:20px 24px; gap:18px; box-shadow:0 8px 24px rgba(0,0,0,.06); z-index:99;
      }
      .nav-links.open > li:not([hidden]) { width:100%; display:flex; align-items:center; }
      .nav-links.open a,
      .nav-links.open .nav-admin-link,
      .nav-links.open .nav-user-name,
      .nav-links.open .nav-logout-btn {
        width:100%; min-height:0; justify-content:flex-start;
      }
      .nav-toggle { display:flex !important; }
      #nav-logout-li { flex-direction:column; align-items:flex-start !important; gap:10px; }
      .nav-logo-img { height:38px !important; }
      .nav-end { gap:12px !important; }
      .search-panel { padding:14px 20px 18px; }
      .products { padding:48px 0 64px !important; }
      .coll-filter-menu { left:0; right:0; min-width:0; }
      .products-grid { gap:16px !important; }
      .product-body { padding:18px 16px 16px !important; }
      .product-art { height:min(200px,42vw) !important; }
      .coll-hero { min-height:auto !important; }
      .coll-hero-inner { padding:40px 0 !important; }
      .page-hero { padding:40px 0 32px !important; }
      .page-body { padding:32px 0 48px !important; }
      .cart-layout { grid-template-columns:1fr !important; gap:24px !important; }
      .cart-item { flex-wrap:wrap; padding:14px 16px !important; gap:12px; }
      .cart-item-actions { width:100%; justify-content:space-between; }
      .cart-items-header { padding:14px 16px !important; flex-wrap:wrap; gap:8px; }
      .sidebar-box { padding:18px !important; }
      .section-header { flex-direction:column !important; align-items:flex-start !important; gap:12px; }
      .tab-nav { overflow-x:auto; -webkit-overflow-scrolling:touch; flex-wrap:nowrap; padding-bottom:4px; }
      .modal { margin:0 12px !important; max-width:calc(100vw - 24px) !important; }
      .content { padding-left:20px !important; padding-right:20px !important; }
      .pd-overlay { padding:12px; align-items:center; }
      .pd-modal { max-height:88dvh; }
      .pd-slide-wrap { height:min(280px,45vw); min-height:200px; }
      .pd-slide { max-height:min(280px,45vw); }
      .pd-info { padding:20px; }
      .pd-name { font-size:1.15rem; }
      .pd-nav { width:40px; height:40px; font-size:24px; }
      .pd-prev { right:8px; }
      .pd-next { left:8px; }
      .footer-top {
        grid-template-columns:1fr 1fr 1fr !important;
        gap:20px 12px !important;
        margin-bottom:24px !important;
      }
      .footer-map-box { grid-column:1 / -1 !important; }
      .footer-brand p { font-size:10px; line-height:1.65; max-width:none; }
      .footer-logo-img { height:36px !important; margin-bottom:8px; }
      .footer-col-title { font-size:9px; margin-bottom:10px; letter-spacing:.1em; }
      .footer-links { gap:6px; }
      .footer-links li, .footer-links a { font-size:11px; line-height:1.55; }
      .footer-map iframe { height:160px; }
    }
    @media (max-width:480px) {
      .container { padding-left:16px !important; padding-right:16px !important; }
      .nav { padding-left:16px !important; padding-right:16px !important; }
      .products-grid { grid-template-columns:1fr !important; }
      .checkout-form .form-row { grid-template-columns:1fr !important; }
      .form-row2 { grid-template-columns:1fr !important; }
      .pd-overlay { padding:0; align-items:flex-end; }
      .pd-modal { border-radius:12px 12px 0 0; max-height:92dvh; width:100%; }
      .pd-slide-wrap { height:220px; min-height:180px; }
      .pd-slide { max-height:220px; }
      .pd-close { top:8px; left:8px; }
      .cart-item-info { min-width:0; flex:1 1 100%; }
      .footer-copy { font-size:13px; }
      .footer-top { gap:16px 8px !important; }
      .footer-brand p { font-size:9px; }
      .footer-links li, .footer-links a { font-size:10px; }
      .footer-logo-img { height:32px !important; }
      .hero-left { padding:40px 20px !important; }
      .section { padding:56px 0 !important; }
    }
  `;
  const s = document.createElement('style');
  s.textContent = css;
  document.head.appendChild(s);
})();

/* ── Auth ─────────────────────────────────── */
const Auth = (function () {
  const S = 'armeh_session', U = 'armeh_users';
  const sess  = () => JSON.parse(sessionStorage.getItem(S) || 'null');
  const users = () => JSON.parse(localStorage.getItem(U)  || '[]');
  const save  = u  => localStorage.setItem(U, JSON.stringify(u));

  function login(id, pw) {
    if (id === 'Admin' && pw === '@Armeh2026') {
      sessionStorage.setItem(S, JSON.stringify({ role:'admin', name:'مدیر', username:'Admin' }));
      return { ok:true, role:'admin' };
    }
    const u = users().find(u => u.email === id && u.password === pw);
    if (u) {
      sessionStorage.setItem(S, JSON.stringify({ role:'user', id:u.id, name:u.firstname+' '+u.lastname, email:u.email }));
      return { ok:true, role:'user' };
    }
    return { ok:false, error:'ایمیل یا رمز عبور اشتباه است.' };
  }

  function logout() {
    sessionStorage.removeItem(S);
    const inCollections = window.location.pathname.includes('/collections/');
    window.location.href = inCollections ? '../index.html' : 'index.html';
  }

  function register(data) {
    const list = users();
    if (list.find(u => u.email === data.email)) return { ok:false, error:'این ایمیل قبلاً ثبت شده است.' };
    const u = { ...data, id:Date.now(), role:'user', orders:[], createdAt:new Date().toISOString() };
    list.push(u); save(list);
    return { ok:true };
  }

  function updateUser(id, data) {
    const list = users(), i = list.findIndex(u => u.id === id);
    if (i < 0) return false;
    list[i] = { ...list[i], ...data }; save(list);
    const s = sess();
    if (s && s.id === id)
      sessionStorage.setItem(S, JSON.stringify({ ...s, name:(data.firstname||list[i].firstname)+' '+(data.lastname||list[i].lastname), email:data.email||s.email }));
    return true;
  }

  function deleteUser(id) {
    save(users().filter(u => u.id !== id));
    if (sess()?.id === id) sessionStorage.removeItem(S);
  }

  function addOrder(userId, items) {
    const list = users(), u = list.find(u => u.id === userId);
    if (!u) return;
    if (!u.orders) u.orders = [];
    u.orders.unshift({ id:Date.now(), date:new Date().toISOString(), items, status:'در انتظار بررسی' });
    save(list);
  }

  return { login, logout, register, updateUser, deleteUser, addOrder,
           getSession: sess, getUsers: users, saveUsers: save,
           isAdmin: () => sess()?.role === 'admin',
           isUser:  () => sess()?.role === 'user',
           isGuest: () => !sess(),
           role:    () => sess()?.role || 'guest' };
})();

/* ── Cart ─────────────────────────────────── */
const Cart = (function () {
  const key  = () => { const s=Auth.getSession(); return s ? 'armeh_cart_'+(s.id||'admin') : 'armeh_cart_guest'; };
  const get  = () => JSON.parse(localStorage.getItem(key()) || '[]');
  const save = items => localStorage.setItem(key(), JSON.stringify(items));

  function add(item) {
    const items=get(), ex=items.find(i=>i.id===item.id);
    if (ex) ex.qty++; else items.push({...item, qty:1});
    save(items); updateBadge(); return items;
  }
  function remove(id)   { const items=get().filter(i=>i.id!==id); save(items); updateBadge(); return items; }
  function updateQty(id,qty) {
    if (qty<=0) return remove(id);
    const items=get(), it=items.find(i=>i.id===id);
    if (it) it.qty=qty; save(items); updateBadge(); return items;
  }
  function count() { return get().reduce((s,i)=>s+i.qty, 0); }
  function clear() { save([]); updateBadge(); }
  function updateBadge() {
    document.querySelectorAll('.cart-badge').forEach(b => {
      const c=count(); b.textContent=c>0?c:''; b.style.display=c>0?'flex':'none';
    });
  }
  return { get, add, remove, updateQty, count, clear, updateBadge, save };
})();

/* ── Products ─────────────────────────────── */
const Products = (function () {
  const KEY = 'armeh_products';
  const D = {
    earrings:  [{id:'ear1',name:'گوشواره آویز طلایی',collection:'earrings',collectionName:'گوشواره',material:'طلای ۱۸ عیار',price:12500000,available:true},{id:'ear2',name:'گوشواره حلقه طلایی',collection:'earrings',collectionName:'گوشواره',material:'طلای ۱۸ عیار',price:9800000,available:true},{id:'ear3',name:'گوشواره گوی نگین‌دار',collection:'earrings',collectionName:'گوشواره',material:'طلای ۱۸ عیار',price:15200000,available:true},{id:'ear4',name:'گوشواره آویز بلند',collection:'earrings',collectionName:'گوشواره',material:'طلای ۲۱ عیار',price:18500000,available:true},{id:'ear5',name:'گوشواره حلقه فانتزی',collection:'earrings',collectionName:'گوشواره',material:'طلای ۱۸ عیار',price:11200000,available:true},{id:'ear6',name:'گوشواره آویز دو قسمتی',collection:'earrings',collectionName:'گوشواره',material:'طلای ۱۸ عیار',price:14800000,available:true}],
    rings:     [{id:'rin1',name:'انگشتر نگین‌دار کلاسیک',collection:'rings',collectionName:'انگشتر',material:'طلای ۱۸ عیار',price:28500000,available:true},{id:'rin2',name:'انگشتر ساده طلایی',collection:'rings',collectionName:'انگشتر',material:'طلای ۱۸ عیار',price:15800000,available:true},{id:'rin3',name:'انگشتر فانتزی سه نگین',collection:'rings',collectionName:'انگشتر',material:'طلای ۱۸ عیار',price:32400000,available:true},{id:'rin4',name:'انگشتر طرح لوزی',collection:'rings',collectionName:'انگشتر',material:'طلای ۲۱ عیار',price:35200000,available:true},{id:'rin5',name:'انگشتر دو رنگ طلایی',collection:'rings',collectionName:'انگشتر',material:'طلای ۱۸ عیار',price:22800000,available:true},{id:'rin6',name:'انگشتر جواهر چند نگین',collection:'rings',collectionName:'انگشتر',material:'طلای ۱۸ عیار',price:41500000,available:true}],
    necklaces: [{id:'nec1',name:'گردنبد آویز کلاسیک',collection:'necklaces',collectionName:'گردنبد',material:'طلای ۱۸ عیار',price:38500000,available:true},{id:'nec2',name:'گردنبد زنجیر ظریف',collection:'necklaces',collectionName:'گردنبد',material:'طلای ۱۸ عیار',price:32800000,available:true},{id:'nec3',name:'گردنبد آویز قلب',collection:'necklaces',collectionName:'گردنبد',material:'طلای ۱۸ عیار',price:36200000,available:true},{id:'nec4',name:'گردنبد لایه‌ای دو رشته',collection:'necklaces',collectionName:'گردنبد',material:'طلای ۱۸ عیار',price:45200000,available:true},{id:'nec5',name:'گردنبد آویز لوزی نگین',collection:'necklaces',collectionName:'گردنبد',material:'طلای ۲۱ عیار',price:42800000,available:true},{id:'nec6',name:'گردنبد آویز دایره نگین',collection:'necklaces',collectionName:'گردنبد',material:'طلای ۱۸ عیار',price:39500000,available:true}],
    bangles:   [{id:'ban1',name:'النگو ساده طلایی',collection:'bangles',collectionName:'النگو',material:'طلای ۱۸ عیار',price:52000000,available:true},{id:'ban2',name:'النگو نگین‌دار',collection:'bangles',collectionName:'النگو',material:'طلای ۱۸ عیار',price:58500000,available:true},{id:'ban3',name:'النگو پنج نگین',collection:'bangles',collectionName:'النگو',material:'طلای ۱۸ عیار',price:62400000,available:true},{id:'ban4',name:'النگو طرح‌دار کلاسیک',collection:'bangles',collectionName:'النگو',material:'طلای ۲۱ عیار',price:55800000,available:true},{id:'ban5',name:'النگو دستی ضخیم',collection:'bangles',collectionName:'النگو',material:'طلای ۱۸ عیار',price:68500000,available:true},{id:'ban6',name:'النگو فانتزی دو رنگ',collection:'bangles',collectionName:'النگو',material:'طلای ۱۸ عیار',price:61200000,available:true}],
    bracelets: [{id:'bra1',name:'دستبند تنیس طلایی',collection:'bracelets',collectionName:'دستبند',material:'طلای ۱۸ عیار',price:28500000,available:true},{id:'bra2',name:'دستبند زنجیری ظریف',collection:'bracelets',collectionName:'دستبند',material:'طلای ۱۸ عیار',price:22800000,available:true},{id:'bra3',name:'دستبند نگین‌دار سه نگین',collection:'bracelets',collectionName:'دستبند',material:'طلای ۱۸ عیار',price:35200000,available:true},{id:'bra4',name:'دستبند ساده دو رنگ',collection:'bracelets',collectionName:'دستبند',material:'طلای ۲۱ عیار',price:26800000,available:true},{id:'bra5',name:'دستبند کلاسیک ضخیم',collection:'bracelets',collectionName:'دستبند',material:'طلای ۱۸ عیار',price:38500000,available:true},{id:'bra6',name:'دستبند فانتزی طرح‌دار',collection:'bracelets',collectionName:'دستبند',material:'طلای ۱۸ عیار',price:31200000,available:true}],
    pendants:  [{id:'pen1',name:'آویز لوزی کلاسیک',collection:'pendants',collectionName:'آویز تک',material:'طلای ۱۸ عیار',price:11200000,available:true},{id:'pen2',name:'آویز دایره نگین‌دار',collection:'pendants',collectionName:'آویز تک',material:'طلای ۱۸ عیار',price:14800000,available:true},{id:'pen3',name:'آویز قلب با تاج',collection:'pendants',collectionName:'آویز تک',material:'طلای ۱۸ عیار',price:16200000,available:true},{id:'pen4',name:'آویز لوزی با مرکز نگین',collection:'pendants',collectionName:'آویز تک',material:'طلای ۲۱ عیار',price:19500000,available:true},{id:'pen5',name:'آویز ستاره طلایی',collection:'pendants',collectionName:'آویز تک',material:'طلای ۱۸ عیار',price:12800000,available:true},{id:'pen6',name:'آویز بیضی مدرن',collection:'pendants',collectionName:'آویز تک',material:'طلای ۱۸ عیار',price:13800000,available:true}],
    chains:    [{id:'cha1',name:'زنجیر فیگارو طلایی',collection:'chains',collectionName:'زنجیر تک',material:'طلای ۱۸ عیار',price:28200000,available:true},{id:'cha2',name:'زنجیر کارتیه ظریف',collection:'chains',collectionName:'زنجیر تک',material:'طلای ۱۸ عیار',price:24500000,available:true},{id:'cha3',name:'زنجیر هرینگبون',collection:'chains',collectionName:'زنجیر تک',material:'طلای ۱۸ عیار',price:26800000,available:true},{id:'cha4',name:'زنجیر طناب دوبل',collection:'chains',collectionName:'زنجیر تک',material:'طلای ۱۸ عیار',price:31200000,available:true},{id:'cha5',name:'زنجیر ساده با خامه',collection:'chains',collectionName:'زنجیر تک',material:'طلای ۲۱ عیار',price:35800000,available:true},{id:'cha6',name:'زنجیر فانتزی مرکز‌دار',collection:'chains',collectionName:'زنجیر تک',material:'طلای ۱۸ عیار',price:29500000,available:true}],
  };
  function normalizeProduct(p) {
    if (Array.isArray(p.images)) {
      if (p.image && !p.images.length) p.images = [p.image];
    } else {
      p.images = p.image ? [p.image] : [];
    }
    delete p.image;
    if (!Array.isArray(p.images)) p.images = [];
    return p;
  }
  function mergeDefaults(all) {
    let changed = false;
    Object.keys(all).forEach(coll => {
      (all[coll] || []).forEach(p => {
        const hadLegacy = p.image != null || !Array.isArray(p.images);
        normalizeProduct(p);
        if (hadLegacy) changed = true;
      });
    });
    Object.keys(D).forEach(coll => {
      if (!all[coll]) all[coll] = [];
      D[coll].forEach(def => {
        const p = all[coll].find(x => x.id === def.id);
        if (p) {
          if (p.price == null) { p.price = def.price; changed = true; }
        } else { all[coll].push(normalizeProduct({ ...def })); changed = true; }
      });
    });
    if (changed) localStorage.setItem(KEY, JSON.stringify(all));
    return all;
  }
  function getAll() {
    const s = localStorage.getItem(KEY);
    if (s) return mergeDefaults(JSON.parse(s));
    localStorage.setItem(KEY, JSON.stringify(D));
    return JSON.parse(JSON.stringify(D));
  }
  const COLLECTIONS = {
    earrings:  { key:'earrings',  name:'گوشواره' },
    rings:     { key:'rings',     name:'انگشتر' },
    necklaces: { key:'necklaces', name:'گردنبد' },
    bangles:   { key:'bangles',   name:'النگو' },
    bracelets: { key:'bracelets', name:'دستبند' },
    pendants:  { key:'pendants',  name:'آویز تک' },
    chains:    { key:'chains',    name:'زنجیر تک' },
  };
  function saveAll(all) { localStorage.setItem(KEY, JSON.stringify(all)); }
  function findProduct(id) {
    const all = getAll();
    for (const key of Object.keys(all)) {
      const p = all[key].find(p => p.id === id);
      if (p) return { product:p, collection:key };
    }
    return null;
  }
  function setAvailability(id, available) {
    const found = findProduct(id);
    if (!found) return;
    const all = getAll();
    const p = all[found.collection].find(p => p.id === id);
    if (p) { p.available = available; saveAll(all); }
  }
  function addProduct(collection, data) {
    const all = getAll();
    if (!all[collection]) all[collection] = [];
    const meta = COLLECTIONS[collection] || { name: collection };
    const prefix = collection.slice(0, 3);
    const product = {
      id: prefix + Date.now(),
      name: data.name.trim(),
      collection,
      collectionName: meta.name,
      material: (data.material || 'طلای ۱۸ عیار').trim(),
      price: Number(data.price) || 0,
      available: data.available !== false,
      images: Array.isArray(data.images) ? data.images.filter(Boolean) : [],
      description: (data.description || '').trim(),
    };
    all[collection].push(product);
    saveAll(all);
    return product;
  }
  function updateProduct(id, data) {
    const found = findProduct(id);
    if (!found) return false;
    const all = getAll();
    const p = all[found.collection].find(p => p.id === id);
    if (!p) return false;
    if (data.name != null) p.name = data.name.trim();
    if (data.material != null) p.material = data.material.trim();
    if (data.price != null) p.price = Number(data.price) || 0;
    if (data.available != null) p.available = !!data.available;
    if (data.images !== undefined) p.images = Array.isArray(data.images) ? data.images.filter(Boolean) : [];
    if (data.description !== undefined) p.description = (data.description || '').trim();
    if (data.collection && data.collection !== found.collection && COLLECTIONS[data.collection]) {
      all[found.collection] = all[found.collection].filter(x => x.id !== id);
      p.collection = data.collection;
      p.collectionName = COLLECTIONS[data.collection].name;
      if (!all[data.collection]) all[data.collection] = [];
      all[data.collection].push(p);
    }
    saveAll(all);
    return true;
  }
  function deleteProduct(id) {
    const found = findProduct(id);
    if (!found) return false;
    const all = getAll();
    all[found.collection] = all[found.collection].filter(p => p.id !== id);
    saveAll(all);
    return true;
  }
  const getCollection = name => (getAll()[name] || []);
  const getAllFlat    = ()   => Object.values(getAll()).flat();
  return { getAll, getCollection, setAvailability, getAllFlat, findProduct, addProduct, updateProduct, deleteProduct, COLLECTIONS, saveAll };
})();

/* ── Price helpers ────────────────────────── */
function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function formatPrice(amount) {
  if (amount == null) return '—';
  return Number(amount).toLocaleString('fa-IR') + ' تومان';
}
function resolveItemPrice(item) {
  if (item.price != null) return item.price;
  const p = Products.getAllFlat().find(p => p.id === item.id);
  return p?.price || 0;
}

/* ── Image helper ─────────────────────────── */
function compressImage(file, maxW, quality) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxW / img.width);
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const PRODUCT_PLACEHOLDER_SVG = `<svg class="product-art-placeholder" width="90" height="90" viewBox="0 0 140 140" fill="none"><circle cx="70" cy="70" r="44" stroke="#114411" stroke-width="2.5"/><circle cx="70" cy="70" r="28" stroke="rgba(201,168,64,.4)" stroke-width="1.5" stroke-dasharray="4 3"/></svg>`;

function getProductImages(p) {
  if (!p) return [];
  if (Array.isArray(p.images) && p.images.length) return p.images.filter(Boolean);
  if (p.image) return [p.image];
  return [];
}

function getPrimaryImage(p) {
  return getProductImages(p)[0] || null;
}

function productArtHtml(p) {
  const img = getPrimaryImage(p);
  if (img) return `<img src="${img}" alt="${escHtml(p.name)}" />`;
  return PRODUCT_PLACEHOLDER_SVG;
}

function buildProductCard(p, collectionKey) {
  const cartSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>`;
  const primary = getPrimaryImage(p);
  const art = primary
    ? `<img src="${primary}" alt="${escHtml(p.name)}" />`
    : PRODUCT_PLACEHOLDER_SVG;
  const imgCount = getProductImages(p).length;
  const badge = imgCount > 1 ? `<span class="product-img-count">${imgCount} تصویر</span>` : '';
  return `
    <div class="product-card reveal" data-id="${escHtml(p.id)}" data-collection="${escHtml(collectionKey)}" data-available="${p.available}">
      <div class="product-art product-art-clickable${primary ? ' has-image' : ''}" onclick="openProductDetail('${escHtml(p.id)}','${escHtml(collectionKey)}')" role="button" tabindex="0" aria-label="مشاهده جزئیات ${escHtml(p.name)}">${art}${badge}</div>
      <div class="product-body">
        <div class="product-name product-name-clickable" onclick="openProductDetail('${escHtml(p.id)}','${escHtml(collectionKey)}')" role="button" tabindex="0">${escHtml(p.name)}</div>
        <div class="product-material">${escHtml(p.material)}</div>
        <div class="product-price">${formatPrice(p.price)}</div>
        <button class="btn-add-cart" onclick="event.stopPropagation();addToCart(this,'${collectionKey}')">افزودن به سبد ${cartSvg}</button>
      </div>
    </div>`;
}

function getCollectionPagePath(collectionKey) {
  const inCollections = window.location.pathname.includes('/collections/');
  return inCollections ? `${collectionKey}.html` : `collections/${collectionKey}.html`;
}

function isOnCollectionPage(collectionKey) {
  return new RegExp(`/collections/${collectionKey}\\.html$`, 'i').test(window.location.pathname);
}

let productHighlightHandler = null;

function isProductHighlightDismissClick(e) {
  if (e.target.closest('.product-card.product-highlight')) return false;
  if (e.target.closest('#product-detail-overlay')) return false;
  if (e.target.closest('#search-panel')) return false;
  if (e.target.closest('#nav-search-btn')) return false;
  return true;
}

function setProductHighlight(card) {
  clearProductHighlight();
  if (!card) return;
  card.classList.add('visible', 'product-highlight');
  const dismiss = e => {
    if (!isProductHighlightDismissClick(e)) return;
    clearProductHighlight();
  };
  productHighlightHandler = dismiss;
  setTimeout(() => {
    document.addEventListener('click', dismiss);
    document.addEventListener('touchend', dismiss);
  }, 0);
}

function clearProductHighlight() {
  document.querySelectorAll('.product-card.product-highlight').forEach(c => c.classList.remove('product-highlight'));
  if (productHighlightHandler) {
    document.removeEventListener('click', productHighlightHandler);
    document.removeEventListener('touchend', productHighlightHandler);
    productHighlightHandler = null;
  }
}

function focusProductOnPage(productId, collectionKey) {
  const card = document.querySelector(`.product-card[data-id="${productId}"]`);
  if (card) {
    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setProductHighlight(card);
  }
  openProductDetail(productId, collectionKey);
}

function navigateToProduct(productId, collectionKey) {
  const found = Products.findProduct(productId);
  if (!found) return;
  const coll = found.collection;
  if (isOnCollectionPage(coll)) {
    focusProductOnPage(productId, coll);
    return;
  }
  window.location.href = `${getCollectionPagePath(coll)}?product=${encodeURIComponent(productId)}`;
}

function handleProductDeepLink(collectionKey) {
  const productId = new URLSearchParams(window.location.search).get('product');
  if (!productId) return;
  const found = Products.findProduct(productId);
  if (!found || found.collection !== collectionKey) return;
  setTimeout(() => {
    focusProductOnPage(productId, collectionKey);
    history.replaceState(null, '', window.location.pathname);
  }, 120);
}

const KARAT_OPTIONS = [18, 21, 24];
const KARAT_LABELS = { 18: '۱۸ عیار', 21: '۲۱ عیار', 24: '۲۴ عیار' };
const collFilterState = { karat: 'all', nameSort: 'none', priceSort: 'none' };

function extractKarat(material) {
  const m = String(material || '');
  if (/۲۴|24/.test(m)) return 24;
  if (/۲۱|21/.test(m)) return 21;
  if (/۱۸|18/.test(m)) return 18;
  return null;
}

function filterAndSortProducts(products) {
  let list = [...products];
  if (collFilterState.karat !== 'all') {
    const k = Number(collFilterState.karat);
    list = list.filter(p => extractKarat(p.material) === k);
  }
  const { nameSort, priceSort } = collFilterState;
  if (nameSort !== 'none' || priceSort !== 'none') {
    list.sort((a, b) => {
      if (priceSort === 'low') {
        const byPrice = (Number(a.price) || 0) - (Number(b.price) || 0);
        if (byPrice !== 0) return byPrice;
      } else if (priceSort === 'high') {
        const byPrice = (Number(b.price) || 0) - (Number(a.price) || 0);
        if (byPrice !== 0) return byPrice;
      }
      if (nameSort === 'asc') return (a.name || '').localeCompare(b.name || '', 'fa');
      if (nameSort === 'desc') return (b.name || '').localeCompare(a.name || '', 'fa');
      return 0;
    });
  }
  return list;
}

function observeRevealElements(root) {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('visible'), i * 60);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.08 });
  (root || document).querySelectorAll('.reveal:not(.visible)').forEach(el => obs.observe(el));
}

function renderCollectionGrid(collectionKey, products, emptyAll) {
  const grid = document.getElementById('products-grid');
  if (!grid) return;
  if (!products.length) {
    grid.innerHTML = emptyAll
      ? '<p class="coll-filter-empty">محصولی در این مجموعه ثبت نشده است.</p>'
      : '<p class="coll-filter-empty">محصولی با این فیلتر یافت نشد.</p>';
    return;
  }
  grid.innerHTML = products.map(p => buildProductCard(p, collectionKey)).join('');
  observeRevealElements(grid);
}

function applyCollectionFilters(collectionKey) {
  const all = Products.getCollection(collectionKey);
  const filtered = filterAndSortProducts(all);
  renderCollectionGrid(collectionKey, filtered, !all.length);
  updateCollectionFilterBadge();
}

function updateCollectionFilterBadge() {
  const badge = document.querySelector('.coll-filter-badge');
  if (!badge) return;
  const active = collFilterState.karat !== 'all' || collFilterState.nameSort !== 'none' || collFilterState.priceSort !== 'none';
  badge.hidden = !active;
}

function closeCollectionFilterMenu() {
  const wrap = document.getElementById('collection-filters');
  const toggle = document.querySelector('.coll-filter-toggle');
  const menu = document.getElementById('coll-filter-menu');
  if (!toggle || !menu) return;
  toggle.classList.remove('open');
  toggle.setAttribute('aria-expanded', 'false');
  menu.classList.remove('open');
  if (wrap) wrap.classList.remove('is-open');
}

function resetCollectionFilters(collectionKey) {
  collFilterState.karat = 'all';
  collFilterState.nameSort = 'none';
  collFilterState.priceSort = 'none';
  const karatSel = document.getElementById('filter-karat');
  const nameSel = document.getElementById('filter-name');
  const priceSel = document.getElementById('filter-price');
  if (karatSel) karatSel.value = 'all';
  if (nameSel) nameSel.value = 'none';
  if (priceSel) priceSel.value = 'none';
  applyCollectionFilters(collectionKey);
}

const FILTER_ICON_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>';
const CHEVRON_SVG = '<svg class="coll-filter-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>';

function ensureCollectionFilters(collectionKey) {
  const grid = document.getElementById('products-grid');
  if (!grid || document.getElementById('collection-filters')) return;

  const karatOptions = ['<option value="all">همه عیارها</option>']
    .concat(KARAT_OPTIONS.map(k => `<option value="${k}">${KARAT_LABELS[k]}</option>`))
    .join('');

  const wrap = document.createElement('div');
  wrap.id = 'collection-filters';
  wrap.className = 'coll-filter-dropdown reveal';
  wrap.innerHTML = `
    <button type="button" class="coll-filter-toggle" aria-expanded="false" aria-controls="coll-filter-menu">
      ${FILTER_ICON_SVG}
      <span>فیلتر و مرتب‌سازی</span>
      <span class="coll-filter-badge" hidden aria-hidden="true"></span>
      ${CHEVRON_SVG}
    </button>
    <div class="coll-filter-menu" id="coll-filter-menu" role="region" aria-label="فیلتر محصولات">
      <div class="coll-filter-group">
        <label for="filter-karat">عیار</label>
        <select id="filter-karat" class="coll-filter-select" aria-label="فیلتر عیار">${karatOptions}</select>
      </div>
      <div class="coll-filter-group">
        <label for="filter-name">مرتب‌سازی نام</label>
        <select id="filter-name" class="coll-filter-select" aria-label="مرتب‌سازی بر اساس نام">
          <option value="none">پیش‌فرض</option>
          <option value="asc">الف – ی</option>
          <option value="desc">ی – الف</option>
        </select>
      </div>
      <div class="coll-filter-group">
        <label for="filter-price">مرتب‌سازی قیمت</label>
        <select id="filter-price" class="coll-filter-select" aria-label="مرتب‌سازی بر اساس قیمت">
          <option value="none">پیش‌فرض</option>
          <option value="low">کم به زیاد</option>
          <option value="high">زیاد به کم</option>
        </select>
      </div>
      <button type="button" class="coll-filter-reset">بازنشانی فیلترها</button>
    </div>`;
  grid.parentNode.insertBefore(wrap, grid);
  observeRevealElements(wrap.parentNode);

  const toggle = wrap.querySelector('.coll-filter-toggle');
  const menu = wrap.querySelector('#coll-filter-menu');

  toggle.addEventListener('click', e => {
    e.stopPropagation();
    const open = menu.classList.contains('open');
    if (open) closeCollectionFilterMenu();
    else {
      toggle.classList.add('open');
      toggle.setAttribute('aria-expanded', 'true');
      menu.classList.add('open');
      wrap.classList.add('is-open');
    }
  });

  wrap.querySelector('#filter-karat').addEventListener('change', e => {
    collFilterState.karat = e.target.value;
    applyCollectionFilters(collectionKey);
  });
  wrap.querySelector('#filter-name').addEventListener('change', e => {
    collFilterState.nameSort = e.target.value;
    applyCollectionFilters(collectionKey);
  });
  wrap.querySelector('#filter-price').addEventListener('change', e => {
    collFilterState.priceSort = e.target.value;
    applyCollectionFilters(collectionKey);
  });
  wrap.querySelector('.coll-filter-reset').addEventListener('click', () => {
    resetCollectionFilters(collectionKey);
  });

  if (!wrap.dataset.outsideBound) {
    wrap.dataset.outsideBound = '1';
    document.addEventListener('click', e => {
      if (!menu.classList.contains('open')) return;
      if (e.target.closest('#collection-filters')) return;
      closeCollectionFilterMenu();
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeCollectionFilterMenu();
    });
  }
}

function renderCollectionPage(collectionKey) {
  const grid = document.getElementById('products-grid');
  if (!grid) return applyAvailability(collectionKey);
  collFilterState.karat = 'all';
  collFilterState.nameSort = 'none';
  collFilterState.priceSort = 'none';
  ensureCollectionFilters(collectionKey);
  const karatSel = document.getElementById('filter-karat');
  const nameSel = document.getElementById('filter-name');
  const priceSel = document.getElementById('filter-price');
  if (karatSel) karatSel.value = 'all';
  if (nameSel) nameSel.value = 'none';
  if (priceSel) priceSel.value = 'none';
  closeCollectionFilterMenu();
  applyCollectionFilters(collectionKey);
  handleProductDeepLink(collectionKey);
}

/* ── Collection page helpers ─────────────── */
function addToCart(btn, collectionKey) {
  const card = btn.closest('.product-card');
  const id   = card?.dataset?.id;
  const p    = id ? Products.getCollection(collectionKey).find(p => p.id === id) : null;
  if (!p || p.available === false) return;
  Cart.add({ id:p.id, name:p.name, collection:collectionKey, collectionName:p.collectionName, material:p.material, price:p.price });
  const svg = btn.querySelector('svg') ? btn.querySelector('svg').outerHTML : '';
  btn.classList.add('added');
  btn.innerHTML = '✓ افزوده شد';
  setTimeout(() => { btn.classList.remove('added'); btn.innerHTML = 'افزودن به سبد ' + svg; }, 1600);
}

function applyAvailability(collectionKey) {
  const products = Products.getCollection(collectionKey);
  document.querySelectorAll('.product-card').forEach(card => {
    const id = card.dataset.id;
    const p  = id ? products.find(p => p.id === id) : products.find(p => p.name === card.querySelector('.product-name')?.textContent.trim());
    if (!p) return;
    if (!card.dataset.id) card.dataset.id = p.id;
    card.dataset.available = String(p.available);
    const art = card.querySelector('.product-art');
    const primary = getPrimaryImage(p);
    if (art && primary) {
      art.classList.add('has-image');
      if (!art.querySelector('img')) art.innerHTML = `<img src="${primary}" alt="${p.name}" />`;
    }
    let priceEl = card.querySelector('.product-price');
    if (!priceEl) {
      priceEl = document.createElement('div');
      priceEl.className = 'product-price';
      const material = card.querySelector('.product-material');
      if (material) material.insertAdjacentElement('afterend', priceEl);
    }
    priceEl.textContent = formatPrice(p.price);
    const nameEl = card.querySelector('.product-name');
    if (nameEl) nameEl.textContent = p.name;
    const matEl = card.querySelector('.product-material');
    if (matEl) matEl.textContent = p.material;
  });
}

/* ── Mobile nav ───────────────────────────── */
function initMobileNav() {
  const nav = document.getElementById('nav');
  const links = document.getElementById('nav-links');
  if (!nav || !links) return;
  let toggle = document.getElementById('nav-toggle');
  if (!toggle) {
    toggle = document.createElement('button');
    toggle.className = 'nav-toggle';
    toggle.id = 'nav-toggle';
    toggle.type = 'button';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-controls', 'nav-links');
    toggle.setAttribute('aria-label', 'باز کردن منو');
    toggle.innerHTML = '<span></span><span></span><span></span>';
    nav.appendChild(toggle);
  }
  if (toggle.dataset.bound) return;
  toggle.dataset.bound = '1';
  toggle.addEventListener('click', () => {
    const searchPanel = document.getElementById('search-panel');
    const searchBtn = document.getElementById('nav-search-btn');
    if (searchPanel?.classList.contains('open')) {
      searchPanel.classList.remove('open');
      searchBtn?.classList.remove('active');
      searchBtn?.setAttribute('aria-expanded', 'false');
      const si = searchPanel.querySelector('.search-input');
      const sr = searchPanel.querySelector('.search-results');
      if (si) si.value = '';
      if (sr) sr.innerHTML = '';
    }
    const open = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!open));
    links.classList.toggle('open', !open);
  });
  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      toggle.setAttribute('aria-expanded', 'false');
      links.classList.remove('open');
    });
  });
  document.addEventListener('click', e => {
    if (!links.classList.contains('open')) return;
    if (e.target.closest('#nav')) return;
    toggle.setAttribute('aria-expanded', 'false');
    links.classList.remove('open');
  });
}

/* ── Nav init ─────────────────────────────── */
const NAV_ICONS = {
  collections: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>',
  about: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
  login: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'
};

function addNavIcon(link, icon) {
  if (!link || link.querySelector('svg')) return;
  link.classList.add('nav-icon-link');
  link.insertAdjacentHTML('afterbegin', icon);
}

function initNav() {
  Cart.updateBadge();
  const s       = Auth.getSession();
  const loginLi  = document.getElementById('nav-login-li');
  const adminLi  = document.getElementById('nav-admin-li');
  const logoutLi = document.getElementById('nav-logout-li');

  document.querySelectorAll('#nav-links > li > a').forEach(link => {
    const href = link.getAttribute('href') || '';
    const text = link.textContent.trim();
    if (href.includes('#collections') || text === 'مجموعه‌ها') addNavIcon(link, NAV_ICONS.collections);
    else if (href.includes('#about') || text === 'درباره ما') addNavIcon(link, NAV_ICONS.about);
  });

  if (loginLi) {
    loginLi.hidden = !!s;
    loginLi.style.removeProperty('display');
    addNavIcon(loginLi.querySelector('a'), NAV_ICONS.login);
  }
  if (adminLi) {
    adminLi.hidden = s?.role !== 'admin';
    adminLi.style.removeProperty('display');
  }
  if (logoutLi) {
    logoutLi.hidden = !s;
    logoutLi.style.removeProperty('display');
  }
  const profileLink = document.getElementById('nav-profile-link');
  if (profileLink) {
    const showProfile = s?.role === 'user';
    profileLink.style.display = showProfile ? '' : 'none';
    if (showProfile) profileLink.textContent = s.name;
  }
}

/* ── Product detail modal ─────────────────── */
let pdState = { index: 0, images: [], product: null, collectionKey: '' };

function initProductDetail() {
  if (document.getElementById('product-detail-overlay')) return;
  const cartSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>`;
  const overlay = document.createElement('div');
  overlay.id = 'product-detail-overlay';
  overlay.className = 'pd-overlay hidden';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.innerHTML = `
    <div class="pd-modal">
      <button type="button" class="pd-close" aria-label="بستن">×</button>
      <div class="pd-gallery">
        <button type="button" class="pd-nav pd-prev" aria-label="تصویر قبلی">‹</button>
        <div class="pd-slide-wrap"></div>
        <button type="button" class="pd-nav pd-next" aria-label="تصویر بعدی">›</button>
        <div class="pd-dots"></div>
      </div>
      <div class="pd-info">
        <span class="pd-collection"></span>
        <h2 class="pd-name"></h2>
        <p class="pd-material"></p>
        <p class="pd-price"></p>
        <p class="pd-desc"></p>
        <p class="pd-status"></p>
        <button type="button" class="btn-add-cart pd-add-cart">افزودن به سبد ${cartSvg}</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  overlay.querySelector('.pd-close').addEventListener('click', closeProductDetail);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeProductDetail(); });
  overlay.querySelector('.pd-prev').addEventListener('click', () => pdGo(-1));
  overlay.querySelector('.pd-next').addEventListener('click', () => pdGo(1));
  document.addEventListener('keydown', pdKeydown);
  let touchX = 0;
  const gallery = overlay.querySelector('.pd-gallery');
  gallery.addEventListener('touchstart', e => { touchX = e.changedTouches[0].screenX; }, { passive: true });
  gallery.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].screenX - touchX;
    if (dx < -45) pdGo(1);
    else if (dx > 45) pdGo(-1);
  }, { passive: true });
}

function pdKeydown(e) {
  const ov = document.getElementById('product-detail-overlay');
  if (!ov || ov.classList.contains('hidden')) return;
  if (e.key === 'Escape') closeProductDetail();
  if (e.key === 'ArrowRight') pdGo(-1);
  if (e.key === 'ArrowLeft') pdGo(1);
}

function openProductDetail(id, collectionKey) {
  const p = Products.getCollection(collectionKey).find(x => x.id === id);
  if (!p) return;
  initProductDetail();
  pdState = { id, collectionKey, images: getProductImages(p), index: 0, product: p };
  const ov = document.getElementById('product-detail-overlay');
  ov.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  renderProductDetail();
}

function closeProductDetail() {
  const ov = document.getElementById('product-detail-overlay');
  if (ov) ov.classList.add('hidden');
  document.body.style.overflow = '';
}

function pdGo(delta) {
  if (pdState.images.length < 2) return;
  pdState.index = (pdState.index + delta + pdState.images.length) % pdState.images.length;
  renderProductDetailSlide();
}

function pdGoTo(i) {
  if (!pdState.images.length) return;
  pdState.index = i;
  renderProductDetailSlide();
}

function renderProductDetailSlide() {
  const ov = document.getElementById('product-detail-overlay');
  if (!ov) return;
  const wrap = ov.querySelector('.pd-slide-wrap');
  const imgs = pdState.images;
  const multi = imgs.length > 1;
  const prev = ov.querySelector('.pd-prev');
  const next = ov.querySelector('.pd-next');
  prev.style.display = multi ? 'flex' : 'none';
  next.style.display = multi ? 'flex' : 'none';
  if (!imgs.length) {
    wrap.innerHTML = PRODUCT_PLACEHOLDER_SVG.replace('class="product-art-placeholder"', 'class="pd-placeholder"');
  } else {
    wrap.innerHTML = `<img class="pd-slide" src="${imgs[pdState.index]}" alt="${escHtml(pdState.product.name)}" />`;
  }
  const dots = ov.querySelector('.pd-dots');
  if (!multi) { dots.innerHTML = ''; dots.style.display = 'none'; return; }
  dots.style.display = 'flex';
  dots.innerHTML = imgs.map((_, i) =>
    `<button type="button" class="pd-dot${i === pdState.index ? ' active' : ''}" aria-label="تصویر ${(i + 1).toLocaleString('fa-IR')}" onclick="pdGoTo(${i})"></button>`
  ).join('');
}

function renderProductDetail() {
  const ov = document.getElementById('product-detail-overlay');
  const p = pdState.product;
  if (!ov || !p) return;
  ov.querySelector('.pd-collection').textContent = p.collectionName || '';
  ov.querySelector('.pd-name').textContent = p.name;
  ov.querySelector('.pd-material').textContent = p.material;
  ov.querySelector('.pd-price').textContent = formatPrice(p.price);
  const descEl = ov.querySelector('.pd-desc');
  if (p.description) { descEl.textContent = p.description; descEl.style.display = 'block'; }
  else { descEl.textContent = ''; descEl.style.display = 'none'; }
  const status = ov.querySelector('.pd-status');
  const avail = p.available !== false;
  status.textContent = avail ? 'موجود در فروشگاه' : 'ناموجود';
  status.className = 'pd-status ' + (avail ? 'available' : 'unavailable');
  const btn = ov.querySelector('.pd-add-cart');
  btn.classList.remove('added');
  btn.disabled = !avail;
  btn.style.opacity = avail ? '' : '0.4';
  btn.style.pointerEvents = avail ? '' : 'none';
  btn.onclick = () => { if (avail) addToCart(btn, pdState.collectionKey); };
  renderProductDetailSlide();
}

/* ── Nav search ───────────────────────────── */
const SEARCH_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>';

function initNavSearch() {
  if (/\/admin\.html$/i.test(window.location.pathname) || document.getElementById('admin-body')) return;
  const nav = document.getElementById('nav');
  const navEnd = document.querySelector('.nav-end');
  if (!nav || !navEnd) return;

  let btn = document.getElementById('nav-search-btn');
  if (!btn) {
    btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'nav-search-btn';
    btn.className = 'nav-search';
    btn.setAttribute('aria-label', 'جستجو');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', 'search-panel');
    btn.innerHTML = SEARCH_SVG;
    const cart = navEnd.querySelector('.nav-cart');
    if (cart) navEnd.insertBefore(btn, cart);
    else navEnd.appendChild(btn);
  }

  let panel = document.getElementById('search-panel');
  if (!panel) {
    panel = document.createElement('div');
    panel.id = 'search-panel';
    panel.className = 'search-panel';
    panel.setAttribute('role', 'search');
    panel.innerHTML = `
      <div class="search-panel-inner">
        <div class="search-input-wrap">
          <input type="search" class="search-input" placeholder="جستجوی محصول، مجموعه یا جنس..." autocomplete="off" aria-label="جستجو" />
          <span class="search-input-icon">${SEARCH_SVG}</span>
        </div>
        <p class="search-hint">نام محصول یا مجموعه را وارد کنید</p>
        <div class="search-results" aria-live="polite"></div>
      </div>`;
    nav.insertAdjacentElement('afterend', panel);
  }

  if (btn.dataset.bound) return;
  btn.dataset.bound = '1';

  const input = panel.querySelector('.search-input');
  const results = panel.querySelector('.search-results');
  const hint = panel.querySelector('.search-hint');

  function closeSearch() {
    btn.classList.remove('active');
    btn.setAttribute('aria-expanded', 'false');
    panel.classList.remove('open');
    input.value = '';
    results.innerHTML = '';
    if (hint) hint.style.display = '';
  }

  function openSearch() {
    const links = document.getElementById('nav-links');
    const toggle = document.getElementById('nav-toggle');
    if (links?.classList.contains('open')) {
      links.classList.remove('open');
      toggle?.setAttribute('aria-expanded', 'false');
    }
    btn.classList.add('active');
    btn.setAttribute('aria-expanded', 'true');
    panel.classList.add('open');
    setTimeout(() => input.focus(), 80);
  }

  btn.addEventListener('click', e => {
    e.stopPropagation();
    panel.classList.contains('open') ? closeSearch() : openSearch();
  });

  function runSearch(query) {
    const q = query.trim();
    if (!q) {
      results.innerHTML = '';
      if (hint) hint.style.display = '';
      return;
    }
    if (hint) hint.style.display = 'none';
    const matches = Products.getAllFlat().filter(p =>
      (p.name && p.name.includes(q)) ||
      (p.collectionName && p.collectionName.includes(q)) ||
      (p.material && p.material.includes(q))
    ).slice(0, 12);

    if (!matches.length) {
      results.innerHTML = '<p class="search-empty">نتیجه‌ای یافت نشد</p>';
      return;
    }

    results.innerHTML = matches.map(p => `
      <button type="button" class="search-result-item" data-id="${escHtml(p.id)}" data-coll="${escHtml(p.collection)}">
        <div>
          <div class="search-result-name">${escHtml(p.name)}</div>
          <div class="search-result-meta">${escHtml(p.collectionName || '')} · ${escHtml(p.material || '')}</div>
        </div>
        <span class="search-result-price">${escHtml(formatPrice(p.price))}</span>
      </button>`).join('');

    results.querySelectorAll('.search-result-item').forEach(el => {
      el.addEventListener('click', () => {
        closeSearch();
        navigateToProduct(el.dataset.id, el.dataset.coll);
      });
    });
  }

  let debounce;
  input.addEventListener('input', () => {
    clearTimeout(debounce);
    debounce = setTimeout(() => runSearch(input.value), 180);
  });

  input.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeSearch();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && panel.classList.contains('open')) closeSearch();
  });

  document.addEventListener('click', e => {
    if (!panel.classList.contains('open')) return;
    if (e.target.closest('#search-panel') || e.target.closest('#nav-search-btn')) return;
    closeSearch();
  });
}

/* ── Footer Instagram ─────────────────────── */
const INSTAGRAM_SVG = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>';

function initFooterInstagram() {
  document.querySelectorAll('.footer-brand').forEach(brand => {
    if (brand.querySelector('.footer-instagram')) return;
    const tagline = brand.querySelector('p');
    if (!tagline) return;
    const link = document.createElement('a');
    link.href = 'https://www.instagram.com/armehgoldgallery/';
    link.className = 'footer-instagram';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.setAttribute('aria-label', 'اینستاگرام گالری طلای آرمه');
    link.innerHTML = INSTAGRAM_SVG;
    tagline.insertAdjacentElement('afterend', link);
  });
}

/* ── Intro splash (homepage) ──────────────── */
function initIntroSplash() {
  const splash  = document.getElementById('introSplash');
  const logoImg = document.getElementById('introLogoImg');
  if (!splash || !logoImg) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    splash.classList.add('gone');
    return;
  }

  if (sessionStorage.getItem('armeh_intro_seen')) {
    splash.classList.add('gone');
    return;
  }

  document.documentElement.style.overflow = 'hidden';

  setTimeout(() => {
    splash.style.transition = 'opacity 0.8s ease';
    splash.style.opacity = '0';
    setTimeout(() => {
      splash.classList.add('gone');
      document.documentElement.style.overflow = '';
      sessionStorage.setItem('armeh_intro_seen', '1');
    }, 850);
  }, 2600);
}

/* ── Bootstrap ───────────────────────────── */
document.addEventListener('DOMContentLoaded', function () {
  initIntroSplash();
  initNav();
  initNavSearch();
  initMobileNav();
  initProductDetail();
  initFooterInstagram();

  const nav = document.getElementById('nav');
  if (nav) window.addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 10), { passive:true });

  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => { if (e.isIntersecting) { setTimeout(() => e.target.classList.add('visible'), i*60); obs.unobserve(e.target); } });
  }, { threshold:0.08 });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));

  document.querySelectorAll('#year, .footer-year').forEach(el => el.textContent = new Date().getFullYear());
});
