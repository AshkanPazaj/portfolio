/* ═══════════════════════════════════════════
   ARMEH GOLD  —  Auth · Cart · Products · UI
   ═══════════════════════════════════════════ */

/* ── Injected shared CSS ── */
(function () {
  const css = `
    .nav-end { display:flex; align-items:center; gap:16px; order:1; flex-direction:row-reverse; }
    .nav-cart { position:relative; display:flex; align-items:center; color:var(--green,#114411); transition:color .2s; }
    .nav-cart svg { width:22px; height:22px; }
    .nav-cart:hover { color:var(--gold-dark,#9a7e28); }
    .cart-badge {
      position:absolute; top:-7px; left:-8px;
      background:var(--gold,#c9a840); color:#fff;
      font-size:9px; font-weight:700; min-width:16px; height:16px;
      border-radius:8px; display:flex; align-items:center;
      justify-content:center; padding:0 3px;
      font-family:'Vazirmatn',sans-serif; line-height:1;
    }
    .nav-logout-btn {
      background:none; border:1px solid rgba(192,57,43,.3); cursor:pointer;
      font-family:'Vazirmatn',sans-serif; font-size:12px; font-weight:500;
      color:#c0392b; padding:4px 10px; border-radius:2px;
      transition:background .2s;
    }
    .nav-logout-btn:hover { background:rgba(192,57,43,.07); }
    .nav-user-name { font-size:13px; font-weight:600; color:var(--green,#114411); }
    .nav-admin-link { font-size:13px; font-weight:600; color:var(--green,#114411); }
    #nav-logout-li { align-items:center; gap:8px; }
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
  function mergeDefaults(all) {
    let changed = false;
    Object.keys(D).forEach(coll => {
      if (!all[coll]) all[coll] = [];
      D[coll].forEach(def => {
        const p = all[coll].find(x => x.id === def.id);
        if (p) {
          if (p.price == null) { p.price = def.price; changed = true; }
        } else { all[coll].push({ ...def }); changed = true; }
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
      image: data.image || null,
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
    if (data.image !== undefined) p.image = data.image;
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

function productArtHtml(p) {
  if (p.image) return `<img src="${p.image}" alt="${p.name}" />`;
  return PRODUCT_PLACEHOLDER_SVG;
}

function buildProductCard(p, collectionKey) {
  const cartSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>`;
  const art = p.image
    ? `<img src="${p.image}" alt="${escHtml(p.name)}" />`
    : PRODUCT_PLACEHOLDER_SVG;
  return `
    <div class="product-card reveal" data-id="${escHtml(p.id)}" data-available="${p.available}">
      <div class="product-art${p.image ? ' has-image' : ''}">${art}</div>
      <div class="product-body">
        <div class="product-name">${escHtml(p.name)}</div>
        <div class="product-material">${escHtml(p.material)}</div>
        <div class="product-price">${formatPrice(p.price)}</div>
        <button class="btn-add-cart" onclick="addToCart(this,'${collectionKey}')">افزودن به سبد ${cartSvg}</button>
      </div>
    </div>`;
}

function renderCollectionPage(collectionKey) {
  const grid = document.getElementById('products-grid');
  if (!grid) return applyAvailability(collectionKey);
  const products = Products.getCollection(collectionKey);
  grid.innerHTML = products.length
    ? products.map(p => buildProductCard(p, collectionKey)).join('')
    : '<p style="grid-column:1/-1;text-align:center;color:var(--text-muted);padding:48px 0">محصولی در این مجموعه ثبت نشده است.</p>';
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => { if (e.isIntersecting) { setTimeout(() => e.target.classList.add('visible'), i * 60); obs.unobserve(e.target); } });
  }, { threshold: 0.08 });
  grid.querySelectorAll('.reveal').forEach(el => obs.observe(el));
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
    if (art && p.image) {
      art.classList.add('has-image');
      if (!art.querySelector('img')) art.innerHTML = `<img src="${p.image}" alt="${p.name}" />`;
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

/* ── Nav init ─────────────────────────────── */
function initNav() {
  Cart.updateBadge();
  const s       = Auth.getSession();
  const loginLi  = document.getElementById('nav-login-li');
  const adminLi  = document.getElementById('nav-admin-li');
  const logoutLi = document.getElementById('nav-logout-li');
  if (loginLi)  loginLi.style.display  = s ? 'none' : 'list-item';
  if (adminLi)  adminLi.style.display  = (s?.role === 'admin') ? 'list-item' : 'none';
  if (logoutLi) logoutLi.style.display = s ? 'flex' : 'none';
  const profileLink = document.getElementById('nav-profile-link');
  if (profileLink) {
    const showProfile = s?.role === 'user';
    profileLink.style.display = showProfile ? '' : 'none';
    if (showProfile) profileLink.textContent = s.name;
  }
}

/* ── Bootstrap ───────────────────────────── */
document.addEventListener('DOMContentLoaded', function () {
  initNav();

  const nav = document.getElementById('nav');
  if (nav) window.addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 10), { passive:true });

  const toggle = document.getElementById('nav-toggle');
  const links  = document.getElementById('nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      links.classList.toggle('open');
    });
  }

  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => { if (e.isIntersecting) { setTimeout(() => e.target.classList.add('visible'), i*60); obs.unobserve(e.target); } });
  }, { threshold:0.08 });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));

  document.querySelectorAll('#year, .footer-year').forEach(el => el.textContent = new Date().getFullYear());
});
