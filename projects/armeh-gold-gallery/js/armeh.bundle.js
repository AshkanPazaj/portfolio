/* Armeh Gold â€” bundled frontend (generated; do not edit) */

/* --- 01-api.js --- */
/* ── API client ───────────────────────────── */
function resolveApiBase() {
  const { protocol, hostname, port } = window.location;
  if (protocol === 'file:') return 'http://localhost:3000';
  const local = hostname === 'localhost' || hostname === '127.0.0.1';
  if (local && port && port !== '3000') return `http://${hostname}:3000`;
  return '';
}

function apiCredentials() {
  return resolveApiBase() ? 'include' : 'same-origin';
}

const ArmehAPI = (function () {
  let useBackend = false;
  let csrfToken = null;

  async function ensureCsrf() {
    if (!useBackend) return null;
    if (csrfToken) return csrfToken;
    const res = await fetch(resolveApiBase() + '/api/auth/csrf', {
      credentials: apiCredentials(),
      cache: 'no-store',
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.token) throw new Error(data.error || 'خطا در دریافت توکن امنیتی.');
    csrfToken = data.token;
    return csrfToken;
  }

  async function request(path, options = {}) {
    const method = (options.method || 'GET').toUpperCase();
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    if (useBackend && method !== 'GET' && method !== 'HEAD')
      headers['X-CSRF-Token'] = await ensureCsrf();

    const res = await fetch(resolveApiBase() + path, {
      credentials: apiCredentials(),
      headers,
      ...options,
      body: options.body != null ? JSON.stringify(options.body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      if (res.status === 403 && useBackend && method !== 'GET' && method !== 'HEAD' && csrfToken) {
        csrfToken = null;
        headers['X-CSRF-Token'] = await ensureCsrf();
        const retry = await fetch(resolveApiBase() + path, {
          credentials: apiCredentials(),
          headers,
          ...options,
          body: options.body != null ? JSON.stringify(options.body) : undefined,
        });
        const retryData = await retry.json().catch(() => ({}));
        if (retry.ok) return retryData;
        const retryErr = new Error(retryData.error || 'خطای سرور');
        retryErr.status = retry.status;
        retryErr.data = retryData;
        throw retryErr;
      }
      const err = new Error(data.error || 'خطای سرور');
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  }

  async function probe() {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(resolveApiBase() + '/api/health', {
        credentials: apiCredentials(),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      const data = await res.json().catch(() => ({}));
      useBackend = res.ok && !!data.ok;
    } catch {
      useBackend = false;
    }
    return useBackend;
  }

  return {
    enabled: () => useBackend,
    ensureCsrf,
    clearCsrf: () => { csrfToken = null; },
    get: path => request(path),
    post: (path, body) => request(path, { method: 'POST', body }),
    put: (path, body) => request(path, { method: 'PUT', body }),
    patch: (path, body) => request(path, { method: 'PATCH', body }),
    delete: path => request(path, { method: 'DELETE' }),
    probe,
  };
})();

let _session = null;
let _productsCache = null;
let _usersCache = [];

function normalizeSession(session) {
  if (!session || typeof session !== 'object') return null;
  const role = session.role ?? session.Role ?? null;
  return {
    ...session,
    role: typeof role === 'string' ? role.toLowerCase() : role,
  };
}

async function refreshSessionFromServer() {
  if (!ArmehAPI.enabled()) return null;
  try {
    const { session } = await ArmehAPI.get('/api/auth/session');
    _session = normalizeSession(session);
    return _session;
  } catch {
    _session = null;
    return null;
  }
}

window.refreshSessionFromServer = refreshSessionFromServer;

function detectProductsLoadMode() {
  const path = window.location.pathname.toLowerCase();
  const coll = path.match(/\/collections\/(\w+)\.html$/);
  if (coll) return { kind: 'collection', key: coll[1] };
  if (path.includes('admin.html')) return { kind: 'full' };
  return { kind: 'summary' };
}

async function loadProductsCatalog() {
  const mode = detectProductsLoadMode();
  try {
    if (mode.kind === 'collection') {
      const { products } = await ArmehAPI.get('/api/products/collection/' + encodeURIComponent(mode.key));
      _productsCache = _productsCache && typeof _productsCache === 'object' ? _productsCache : {};
      _productsCache[mode.key] = products;
      return;
    }
    const q = mode.kind === 'full' ? '?full=true' : '';
    const { products } = await ArmehAPI.get('/api/products' + q);
    _productsCache = products;
  } catch {
    _productsCache = null;
  }
}

async function initBackend() {
  await ArmehAPI.probe();
  if (!ArmehAPI.enabled()) return;

  try {
    await ArmehAPI.ensureCsrf();
  } catch { /* retry on first mutating request */ }

  try {
    const { session } = await ArmehAPI.get('/api/auth/session');
    _session = normalizeSession(session);
  } catch {
    _session = null;
  }

  await loadProductsCatalog();

  if (_session?.role === 'user') {
    try {
      const { items } = await ArmehAPI.get('/api/cart');
      Cart._loadFromServer(items);
    } catch { /* guest cart fallback */ }
  }
}


/* --- 02-auth.js --- */
/* ── Auth ─────────────────────────────────── */
const Auth = (function () {
  const S = 'armeh_session', U = 'armeh_users';
  const sessLocal  = () => JSON.parse(sessionStorage.getItem(S) || 'null');
  const usersLocal = () => JSON.parse(localStorage.getItem(U)  || '[]');
  const saveLocal  = u  => localStorage.setItem(U, JSON.stringify(u));
  const sess  = () => ArmehAPI.enabled() ? _session : sessLocal();
  const users = () => ArmehAPI.enabled() ? _usersCache : usersLocal();
  const save  = u  => { if (!ArmehAPI.enabled()) saveLocal(u); else _usersCache = u; };

  async function refreshUsers() {
    if (!ArmehAPI.enabled() || !Auth.isAdmin()) return;
    const { users: list } = await ArmehAPI.get('/api/users');
    _usersCache = list;
    return list;
  }

  async function fetchCurrentUser() {
    if (!ArmehAPI.enabled() || !_session?.id) return null;
    const { user } = await ArmehAPI.get('/api/users/me');
    return user;
  }

  async function fetchCaptcha() {
    const res = await fetch(resolveApiBase() + '/api/auth/captcha?t=' + Date.now(), {
      method: 'GET',
      credentials: apiCredentials(),
      cache: 'no-store',
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.question) {
      throw new Error(data.error || 'خطا در بارگذاری کد امنیتی.');
    }
    return data;
  }

  async function login(id, pw, captchaAnswer, honeypot) {
    if (!ArmehAPI.enabled())
      return { ok: false, error: 'ورود فقط با اتصال به سرور امکان‌پذیر است.' };
    try {
        const data = await ArmehAPI.post('/api/auth/login', {
          identifier: id,
          password: pw,
          captchaAnswer: captchaAnswer ?? '',
          honeypot: honeypot ?? '',
        });
        _session = normalizeSession(data.session);
        ArmehAPI.clearCsrf();
        if (data.role === 'user') {
          const { items } = await ArmehAPI.get('/api/cart');
          Cart._loadFromServer(items);
        }
        return { ok: true, role: data.role };
      } catch (e) {
        return { ok: false, error: e.data?.error || e.message };
      }
  }

  async function logout() {
    if (ArmehAPI.enabled()) {
      try { await ArmehAPI.post('/api/auth/logout'); } catch { /* ignore */ }
      ArmehAPI.clearCsrf();
      _session = null;
    } else {
      sessionStorage.removeItem(S);
    }
    const inCollections = window.location.pathname.includes('/collections/');
    window.location.href = inCollections ? '../index.html' : 'index.html';
  }

  async function register(data) {
    if (!ArmehAPI.enabled())
      return { ok: false, error: 'ثبت‌نام فقط با اتصال به سرور امکان‌پذیر است.' };
    try {
        const result = await ArmehAPI.post('/api/auth/register', {
          ...data,
          captchaAnswer: data.captchaAnswer ?? '',
          honeypot: data.honeypot ?? '',
        });
        if (result.session) {
          _session = normalizeSession(result.session);
          ArmehAPI.clearCsrf();
          if (result.role === 'user') {
            const { items } = await ArmehAPI.get('/api/cart');
            Cart._loadFromServer(items);
          }
        }
        return { ok: true, role: result.role };
      } catch (e) {
        return { ok: false, error: e.data?.error || e.message };
      }
  }

  async function updateUser(id, data) {
    if (!ArmehAPI.enabled())
      return false;
    const { user, session } = await ArmehAPI.put('/api/users/' + id, data);
      if (session) _session = normalizeSession(session);
      const i = _usersCache.findIndex(u => u.id === id);
      if (i >= 0) _usersCache[i] = user;
      return true;
  }

  async function deleteUser(id) {
    if (!ArmehAPI.enabled()) return;
    const data = await ArmehAPI.delete('/api/users/' + id);
      _usersCache = _usersCache.filter(u => u.id !== id);
      if (data.loggedOut) _session = null;
  }

  async function addOrder(userId, items) {
    if (!ArmehAPI.enabled()) return;
    await ArmehAPI.post('/api/orders', { items });
  }

  async function verifyPassword(password) {
    if (!ArmehAPI.enabled()) return false;
    await ArmehAPI.post('/api/auth/verify-password', { password });
    return true;
  }

  return { login, logout, register, fetchCaptcha, updateUser, deleteUser, addOrder, refreshUsers, fetchCurrentUser, verifyPassword,
           getSession: sess, getUsers: users, saveUsers: save,
           isAdmin: () => {
             const s = sess();
             const role = (s?.role ?? s?.Role ?? '').toString().toLowerCase();
             return role === 'admin';
           },
           isUser:  () => {
             const s = sess();
             const role = (s?.role ?? s?.Role ?? '').toString().toLowerCase();
             return role === 'user';
           },
           isGuest: () => !sess(),
           role:    () => {
             const s = sess();
             return (s?.role ?? s?.Role ?? 'guest').toString().toLowerCase();
           } };
})();



/* --- 03-cart.js --- */
/* ── Cart ─────────────────────────────────── */
const Cart = (function () {
  const key  = () => { const s=Auth.getSession(); return s ? 'armeh_cart_'+(s.id||'admin') : 'armeh_cart_guest'; };
  let _items = null;

  function readLocal() { return JSON.parse(localStorage.getItem(key()) || '[]'); }
  function writeLocal(items) { localStorage.setItem(key(), JSON.stringify(items)); }

  function get() {
    if (ArmehAPI.enabled() && Auth.isUser()) return _items || [];
    return readLocal();
  }

  function _loadFromServer(items) {
    _items = Array.isArray(items) ? items : [];
    updateBadge();
  }

  async function _syncServer(items) {
    if (!ArmehAPI.enabled() || !Auth.isUser()) return items;
    const { items: synced } = await ArmehAPI.put('/api/cart', { items });
    _items = synced;
    return synced;
  }

  async function add(item) {
    if (ArmehAPI.enabled() && Auth.isUser()) {
      const { items } = await ArmehAPI.post('/api/cart/items', item);
      _items = items;
      updateBadge();
      return items;
    }
    const items = readLocal(), ex = items.find(i => i.id === item.id);
    if (ex) ex.qty++; else items.push({ ...item, qty: 1 });
    writeLocal(items); updateBadge(); return items;
  }

  async function remove(id) {
    if (ArmehAPI.enabled() && Auth.isUser()) {
      const { items } = await ArmehAPI.delete('/api/cart/items/' + encodeURIComponent(id));
      _items = items;
      updateBadge();
      return items;
    }
    const items = readLocal().filter(i => i.id !== id);
    writeLocal(items); updateBadge(); return items;
  }

  async function updateQty(id, qty) {
    if (qty <= 0) return remove(id);
    if (ArmehAPI.enabled() && Auth.isUser()) {
      const { items } = await ArmehAPI.patch('/api/cart/items/' + encodeURIComponent(id), { qty });
      _items = items;
      updateBadge();
      return items;
    }
    const items = readLocal(), it = items.find(i => i.id === id);
    if (it) it.qty = qty;
    writeLocal(items); updateBadge(); return items;
  }

  function count() { return get().reduce((s, i) => s + i.qty, 0); }

  async function clear() {
    if (ArmehAPI.enabled() && Auth.isUser()) {
      const { items } = await ArmehAPI.delete('/api/cart');
      _items = items;
      updateBadge();
      return;
    }
    writeLocal([]); updateBadge();
  }

  function updateBadge() {
    document.querySelectorAll('.cart-badge').forEach(b => {
      const c = count(); b.textContent = c > 0 ? c : ''; b.style.display = c > 0 ? 'flex' : 'none';
    });
  }

  return { get, add, remove, updateQty, count, clear, updateBadge, save: writeLocal, _loadFromServer, _syncServer };
})();



/* --- 05-products.js --- */
/* ── Products ─────────────────────────────── */
const DEFAULT_PRODUCT_GENDER = {
  ear1:'women', ear2:'women', ear3:'women', ear4:'women', ear5:'unisex', ear6:'women',
  rin1:'women', rin2:'unisex', rin3:'women', rin4:'unisex', rin5:'men', rin6:'women',
  nec1:'women', nec2:'women', nec3:'women', nec4:'unisex', nec5:'women', nec6:'women',
  ban1:'women', ban2:'women', ban3:'women', ban4:'unisex', ban5:'women', ban6:'women',
  bra1:'women', bra2:'unisex', bra3:'women', bra4:'men', bra5:'unisex', bra6:'women',
  pen1:'unisex', pen2:'unisex', pen3:'women', pen4:'unisex', pen5:'unisex', pen6:'unisex',
  cha1:'men', cha2:'unisex', cha3:'men', cha4:'unisex', cha5:'men', cha6:'unisex',
};

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
    if (p.thumbnail != null && !Array.isArray(p.images)) {
      p.images = p.thumbnail ? [p.thumbnail] : [];
    }
    if (Array.isArray(p.images)) {
      if (p.image && !p.images.length) p.images = [p.image];
    } else {
      p.images = p.image ? [p.image] : [];
    }
    delete p.image;
    if (!Array.isArray(p.images)) p.images = [];
    if (p.karat == null) {
      const m = String(p.material || '');
      if (/۲۴|24/.test(m)) p.karat = 24;
      else if (/۲۱|21/.test(m)) p.karat = 21;
      else p.karat = 18;
    }
    if (p.grossWeight == null) p.grossWeight = 0;
    if (p.stoneWeight == null) p.stoneWeight = 0;
    if (p.netWeight == null) p.netWeight = 0;
    if (p.laborPercent == null && p.laborFee != null && p.laborFee <= 100) p.laborPercent = p.laborFee;
    if (p.laborPercent == null) p.laborPercent = 0;
    if (p.profitPercent == null) p.profitPercent = 0;
    if (p.stonePrice == null) p.stonePrice = 0;
    if (p.barcode == null) p.barcode = '';
    if (!p.gender || !['women', 'men', 'unisex'].includes(String(p.gender).toLowerCase()))
      p.gender = DEFAULT_PRODUCT_GENDER[p.id] || 'unisex';
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
          if (!p.gender || p.gender === 'unisex') {
            const g = DEFAULT_PRODUCT_GENDER[def.id];
            if (g && g !== 'unisex') { p.gender = g; changed = true; }
          }
        } else { all[coll].push(normalizeProduct({ ...def, gender: DEFAULT_PRODUCT_GENDER[def.id] || 'unisex' })); changed = true; }
      });
    });
    if (changed) localStorage.setItem(KEY, JSON.stringify(all));
    return all;
  }
  function getAll() {
    if (ArmehAPI.enabled() && _productsCache) return JSON.parse(JSON.stringify(_productsCache));
    const s = localStorage.getItem(KEY);
    if (s) return mergeDefaults(JSON.parse(s));
    localStorage.setItem(KEY, JSON.stringify(D));
    return JSON.parse(JSON.stringify(D));
  }
  function saveAll(all) {
    if (ArmehAPI.enabled()) _productsCache = all;
    else localStorage.setItem(KEY, JSON.stringify(all));
  }
  async function reloadFromServer(options = {}) {
    if (!ArmehAPI.enabled()) return getAll();
    const full = options.full === true;
    const collection = options.collection;
    if (collection) {
      const { products } = await ArmehAPI.get('/api/products/collection/' + encodeURIComponent(collection));
      const normalized = products.map(p => normalizeProduct({ ...p }));
      if (_productsCache && typeof _productsCache === 'object') {
        _productsCache[collection] = normalized;
      } else {
        _productsCache = { [collection]: normalized };
      }
      return _productsCache;
    }
    const q = full ? '?full=true' : '';
    const { products } = await ArmehAPI.get('/api/products' + q);
    _productsCache = products;
    return products;
  }
  function mergeProduct(product, collection) {
    if (!product || !collection) return;
    normalizeProduct(product);
    if (!_productsCache || typeof _productsCache !== 'object') _productsCache = {};
    if (!Array.isArray(_productsCache[collection])) _productsCache[collection] = [];
    const idx = _productsCache[collection].findIndex(x => x.id === product.id);
    if (idx >= 0) _productsCache[collection][idx] = product;
    else _productsCache[collection].push(product);
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
  function findProduct(id) {
    const all = getAll();
    for (const key of Object.keys(all)) {
      const p = all[key].find(p => p.id === id);
      if (p) return { product:p, collection:key };
    }
    return null;
  }
  async function setAvailability(id, available) {
    if (ArmehAPI.enabled()) {
      await ArmehAPI.patch('/api/products/' + encodeURIComponent(id) + '/availability', { available });
      await reloadFromServer({ full: true });
      return;
    }
    const found = findProduct(id);
    if (!found) return;
    const all = getAll();
    const p = all[found.collection].find(p => p.id === id);
    if (p) { p.available = available; saveAll(all); }
  }
  async function addProduct(collection, data) {
    if (ArmehAPI.enabled()) {
      const { product } = await ArmehAPI.post('/api/products', { ...data, collection });
      await reloadFromServer({ full: true });
      return product;
    }
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
      karat: Number(data.karat) || 18,
      price: Number(data.price) || 0,
      available: data.available !== false,
      images: Array.isArray(data.images) ? data.images.filter(Boolean) : [],
      description: (data.description || '').trim(),
      grossWeight: Number(data.grossWeight ?? data.gross_weight) || 0,
      stoneWeight: Number(data.stoneWeight ?? data.stone_weight) || 0,
      netWeight: Number(data.netWeight ?? data.net_weight) || 0,
      laborPercent: Number(data.laborPercent ?? data.labor_percent) || 0,
      profitPercent: Number(data.profitPercent ?? data.profit_percent) || 0,
      stonePrice: Number(data.stonePrice ?? data.stone_price) || 0,
      barcode: (data.barcode || '').trim(),
      gender: productGender({ gender: data.gender }),
    };
    all[collection].push(product);
    saveAll(all);
    return product;
  }
  async function updateProduct(id, data) {
    if (ArmehAPI.enabled()) {
      await ArmehAPI.put('/api/products/' + encodeURIComponent(id), data);
      await reloadFromServer({ full: true });
      return true;
    }
    const found = findProduct(id);
    if (!found) return false;
    const all = getAll();
    const p = all[found.collection].find(p => p.id === id);
    if (!p) return false;
    if (data.name != null) p.name = data.name.trim();
    if (data.material != null) p.material = data.material.trim();
    if (data.karat != null) p.karat = Number(data.karat) || 18;
    if (data.price != null) p.price = Number(data.price) || 0;
    if (data.available != null) p.available = !!data.available;
    if (data.images !== undefined) p.images = Array.isArray(data.images) ? data.images.filter(Boolean) : [];
    if (data.description !== undefined) p.description = (data.description || '').trim();
    if (data.grossWeight != null || data.gross_weight != null)
      p.grossWeight = Number(data.grossWeight ?? data.gross_weight) || 0;
    if (data.stoneWeight != null || data.stone_weight != null)
      p.stoneWeight = Number(data.stoneWeight ?? data.stone_weight) || 0;
    if (data.netWeight != null || data.net_weight != null)
      p.netWeight = Number(data.netWeight ?? data.net_weight) || 0;
    if (data.laborPercent != null || data.labor_percent != null)
      p.laborPercent = Number(data.laborPercent ?? data.labor_percent) || 0;
    if (data.profitPercent != null || data.profit_percent != null)
      p.profitPercent = Number(data.profitPercent ?? data.profit_percent) || 0;
    if (data.stonePrice != null || data.stone_price != null)
      p.stonePrice = Number(data.stonePrice ?? data.stone_price) || 0;
    if (data.barcode != null) p.barcode = (data.barcode || '').trim();
    if (data.gender != null) p.gender = productGender({ gender: data.gender });
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
  async function deleteProduct(id) {
    if (ArmehAPI.enabled()) {
      await ArmehAPI.delete('/api/products/' + encodeURIComponent(id));
      await reloadFromServer({ full: true });
      return true;
    }
    const found = findProduct(id);
    if (!found) return false;
    const all = getAll();
    all[found.collection] = all[found.collection].filter(p => p.id !== id);
    saveAll(all);
    return true;
  }
  const getCollection = name => (getAll()[name] || []);
  const getAllFlat    = ()   => Object.values(getAll()).flat();
  return {
    getAll, getCollection, setAvailability, getAllFlat, findProduct,
    addProduct, updateProduct, deleteProduct, COLLECTIONS, saveAll, reloadFromServer, mergeProduct,
  };
})();

const GENDER_OPTIONS = ['women', 'men', 'unisex'];
const GENDER_LABELS = { women: 'زنانه', men: 'مردانه', unisex: 'مشترک' };
let genderPageMode = null;

function productGender(p) {
  const g = String(p?.gender || 'unisex').toLowerCase();
  return GENDER_LABELS[g] ? g : 'unisex';
}

function genderLabel(value) {
  return GENDER_LABELS[productGender({ gender: value })] || GENDER_LABELS.unisex;
}

function matchesGenderFilter(p, filter) {
  if (!filter || filter === 'all') return true;
  const g = productGender(p);
  if (filter === 'unisex') return g === 'unisex';
  if (filter === 'women' || filter === 'men') return g === filter || g === 'unisex';
  return g === filter;
}



/* --- 06-product-display.js --- */
/* ── Price helpers ────────────────────────── */
function escHtml(s) {
  if (s == null) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function safeImageUrl(url) {
  if (!url) return '';
  const s = String(url).trim();
  if (/^data:image\/(jpeg|jpg|png|webp);base64,/i.test(s)) return s;
  if (/^\/[a-zA-Z0-9/_.-]+$/.test(s)) return s;
  return '';
}

function formatPrice(amount) {
  if (amount == null) return '-';
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
  let list = [];
  if (Array.isArray(p.images) && p.images.length) list = p.images.filter(Boolean);
  else if (p.thumbnail) list = [p.thumbnail];
  else if (p.image) list = [p.image];
  return list.map(safeImageUrl).filter(Boolean);
}

function getProductImageCount(p) {
  if (!p) return 0;
  if (p.imageCount != null) return Number(p.imageCount) || 0;
  return getProductImages(p).length;
}

function productImgTag(src, alt, lazy) {
  const attrs = lazy !== false
    ? ' loading="lazy" decoding="async" fetchpriority="low"'
    : ' fetchpriority="high" decoding="async"';
  return `<img src="${escHtml(src)}" alt="${escHtml(alt)}"${attrs} />`;
}

function getPrimaryImage(p) {
  return getProductImages(p)[0] || null;
}

function productArtHtml(p) {
  const img = getPrimaryImage(p);
  if (img) return productImgTag(img, p.name);
  return PRODUCT_PLACEHOLDER_SVG;
}

function buildProductCard(p, collectionKey) {
  const cartSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>`;
  const primary = getPrimaryImage(p);
  const art = primary
    ? productImgTag(primary, p.name)
    : PRODUCT_PLACEHOLDER_SVG;
  const imgCount = getProductImageCount(p);
  const badge = imgCount > 1 ? `<span class="product-img-count">${imgCount} تصویر</span>` : '';
  return `
    <div class="product-card reveal" data-id="${escHtml(p.id)}" data-collection="${escHtml(collectionKey)}" data-available="${p.available}">
      <div class="product-art product-art-clickable${primary ? ' has-image' : ''}" onclick="openProductDetail('${escHtml(p.id)}','${escHtml(collectionKey)}')" role="button" tabindex="0" aria-label="مشاهده جزئیات ${escHtml(p.name)}">${art}${badge}</div>
      <div class="product-body">
        <div class="product-name product-name-clickable" onclick="openProductDetail('${escHtml(p.id)}','${escHtml(collectionKey)}')" role="button" tabindex="0">${escHtml(p.name)}</div>
        <div class="product-material">${escHtml(p.material)} · ${escHtml(genderLabel(p.gender))}</div>
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
  const path = window.location.pathname;
  if (isOnCollectionPage(coll)) {
    focusProductOnPage(productId, coll);
    return;
  }
  if (/\/women\.html$/i.test(path) && matchesGenderFilter(found.product, 'women')) {
    focusProductOnPage(productId, coll);
    return;
  }
  if (/\/men\.html$/i.test(path) && matchesGenderFilter(found.product, 'men')) {
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
const collFilterState = { karat: 'all', gender: 'all', nameSort: 'none', priceSort: 'none' };

function getProductsForPage(collectionKey) {
  if (genderPageMode) {
    return Products.getAllFlat().filter(p => matchesGenderFilter(p, genderPageMode));
  }
  return Products.getCollection(collectionKey);
}

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
  if (collFilterState.gender !== 'all') {
    list = list.filter(p => matchesGenderFilter(p, collFilterState.gender));
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
  grid.innerHTML = products.map(p => buildProductCard(p, p.collection || collectionKey)).join('');
  observeRevealElements(grid);
}

function applyCollectionFilters(collectionKey) {
  const all = getProductsForPage(collectionKey);
  const filtered = filterAndSortProducts(all);
  const emptyAll = genderPageMode
    ? !Products.getAllFlat().some(p => matchesGenderFilter(p, genderPageMode))
    : !Products.getCollection(collectionKey).length;
  renderCollectionGrid(collectionKey, filtered, emptyAll);
  updateCollectionFilterBadge();
}

function updateCollectionFilterBadge() {
  const badge = document.querySelector('.coll-filter-badge');
  if (!badge) return;
  const active = collFilterState.karat !== 'all' || collFilterState.gender !== 'all'
    || collFilterState.nameSort !== 'none' || collFilterState.priceSort !== 'none';
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
  collFilterState.gender = 'all';
  collFilterState.nameSort = 'none';
  collFilterState.priceSort = 'none';
  const karatSel = document.getElementById('filter-karat');
  const genderSel = document.getElementById('filter-gender');
  const nameSel = document.getElementById('filter-name');
  const priceSel = document.getElementById('filter-price');
  if (karatSel) karatSel.value = 'all';
  if (genderSel) genderSel.value = 'all';
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
  const genderOptions = ['<option value="all">همه جنسیت‌ها</option>']
    .concat(GENDER_OPTIONS.map(g => `<option value="${g}">${GENDER_LABELS[g]}</option>`))
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
        <label for="filter-gender">جنسیت</label>
        <select id="filter-gender" class="coll-filter-select" aria-label="فیلتر جنسیت">${genderOptions}</select>
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
  wrap.querySelector('#filter-gender').addEventListener('change', e => {
    collFilterState.gender = e.target.value;
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
  genderPageMode = null;
  const grid = document.getElementById('products-grid');
  if (!grid) return applyAvailability(collectionKey);
  collFilterState.karat = 'all';
  collFilterState.gender = 'all';
  collFilterState.nameSort = 'none';
  collFilterState.priceSort = 'none';
  ensureCollectionFilters(collectionKey);
  const karatSel = document.getElementById('filter-karat');
  const genderSel = document.getElementById('filter-gender');
  const nameSel = document.getElementById('filter-name');
  const priceSel = document.getElementById('filter-price');
  if (karatSel) karatSel.value = 'all';
  if (genderSel) genderSel.value = 'all';
  if (nameSel) nameSel.value = 'none';
  if (priceSel) priceSel.value = 'none';
  closeCollectionFilterMenu();
  applyCollectionFilters(collectionKey);
  handleProductDeepLink(collectionKey);
}

function renderGenderPage(genderKey) {
  genderPageMode = genderKey;
  const grid = document.getElementById('products-grid');
  if (!grid) return;
  collFilterState.karat = 'all';
  collFilterState.gender = 'all';
  collFilterState.nameSort = 'none';
  collFilterState.priceSort = 'none';
  ensureCollectionFilters('__gender__');
  const karatSel = document.getElementById('filter-karat');
  const genderSel = document.getElementById('filter-gender');
  const nameSel = document.getElementById('filter-name');
  const priceSel = document.getElementById('filter-price');
  if (karatSel) karatSel.value = 'all';
  if (genderSel) genderSel.value = 'all';
  if (nameSel) nameSel.value = 'none';
  if (priceSel) priceSel.value = 'none';
  closeCollectionFilterMenu();
  applyCollectionFilters('__gender__');
  const productId = new URLSearchParams(window.location.search).get('product');
  if (productId) {
    const found = Products.findProduct(productId);
    if (found && matchesGenderFilter(found.product, genderKey)) {
      setTimeout(() => {
        focusProductOnPage(productId, found.collection);
        history.replaceState(null, '', window.location.pathname);
      }, 120);
    }
  }
}



/* --- 04-product-specs.js --- */
/* ── Product spec helpers ─────────────────── */
const MATERIAL_FROM_KARAT = { 18: 'طلای ۱۸ عیار', 21: 'طلای ۲۱ عیار', 24: 'طلای ۲۴ عیار' };

function materialFromKarat(k) {
  return MATERIAL_FROM_KARAT[Number(k)] || MATERIAL_FROM_KARAT[18];
}

function formatWeightGrams(value) {
  if (value == null || value === '') return '-';
  const n = Number(value);
  if (!Number.isFinite(n)) return '-';
  return n.toLocaleString('fa-IR', { maximumFractionDigits: 3 }) + ' گرم';
}

function formatPercent(value) {
  if (value == null || value === '') return '-';
  const n = Number(value);
  if (!Number.isFinite(n)) return '-';
  return n.toLocaleString('fa-IR', { maximumFractionDigits: 2 }) + '٪';
}

function productSpecRows(p) {
  return [
    { label: 'کد محصول', value: p.barcode || '-', ltr: true },
    { label: 'مجموعه', value: p.collectionName || '-' },
    { label: 'عیار', value: KARAT_LABELS[p.karat] || materialFromKarat(p.karat) },
    { label: 'جنسیت', value: genderLabel(p.gender) },
    { label: 'وزن کل', value: formatWeightGrams(p.gross_weight ?? p.grossWeight) },
    { label: 'وزن سنگ', value: formatWeightGrams(p.stone_weight ?? p.stoneWeight) },
    { label: 'وزن خالص طلا', value: formatWeightGrams(p.net_weight ?? p.netWeight) },
    { label: 'درصد اجرت ساخت', value: formatPercent(p.laborPercent ?? p.labor_percent ?? p.laborFee) },
    { label: 'درصد سود', value: formatPercent(p.profit_percent ?? p.profitPercent) },
    { label: 'قیمت نگین', value: formatPrice(p.stone_price ?? p.stonePrice) },
  ];
}

function renderProductSpecsHtml(p) {
  return productSpecRows(p).map(row =>
    `<div class="pd-spec"><dt>${escHtml(row.label)}</dt><dd${row.ltr ? ' style="font-family:monospace"' : ''}>${escHtml(row.value)}</dd></div>`
  ).join('');
}



/* --- 08-collection-actions.js --- */
/* ── Collection page helpers ─────────────── */
function addToCart(btn, collectionKey) {
  const card = btn.closest('.product-card');
  const id   = card?.dataset?.id;
  const coll = card?.dataset?.collection || collectionKey;
  let p = null;
  if (id) {
    p = Products.findProduct(id)?.product;
  } else {
    p = Products.getCollection(collectionKey).find(p => p.id === id)
      || Products.getCollection(collectionKey).find(p => p.name === card.querySelector('.product-name')?.textContent.trim());
  }
  if (!p || p.available === false) return;
  Cart.add({ id:p.id, name:p.name, collection:coll, collectionName:p.collectionName, material:p.material, price:p.price });
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
      if (!art.querySelector('img')) art.innerHTML = productImgTag(primary, p.name);
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



/* --- 07-nav.js --- */
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



/* --- 09-nav-init.js --- */
/* ── Nav init ─────────────────────────────── */
const NAV_ICONS = {
  collections: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>',
  women: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M12 12v10"/><path d="M8 18h8"/></svg>',
  men: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="10" cy="14" r="5"/><path d="M19 5l-5.5 5.5"/><path d="M15 5h4v4"/></svg>',
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
  about: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
  login: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'
};

function addNavIcon(link, icon) {
  if (!link || link.querySelector('svg')) return;
  link.classList.add('nav-icon-link');
  link.insertAdjacentHTML('afterbegin', icon);
}

function isNavHomeLink(a) {
  if (!a) return false;
  const text = a.textContent.trim();
  const href = a.getAttribute('href') || '';
  if (text === 'خانه') return true;
  return /^(?:\.\.\/)?index\.html$/.test(href);
}

function ensureNavHomePosition() {
  const links = document.getElementById('nav-links');
  if (!links) return;
  const homeLi = [...links.querySelectorAll(':scope > li')].find(li => isNavHomeLink(li.querySelector(':scope > a')));
  if (!homeLi) return;
  homeLi.id = 'nav-home-li';
  if (links.firstElementChild !== homeLi) links.prepend(homeLi);
}

function ensureNavGenderLinks() {
  const links = document.getElementById('nav-links');
  if (!links || links.querySelector('a[href*="women.html"]')) return;
  const inCollections = window.location.pathname.includes('/collections/');
  const base = inCollections ? '../' : '';
  const anchor = links.querySelector('a[href*="collections"]')?.parentElement
    || links.querySelector('a[href="#collections"]')?.parentElement;
  const womenLi = document.createElement('li');
  womenLi.id = 'nav-women-li';
  womenLi.innerHTML = `<a href="${base}women.html">زنانه</a>`;
  const menLi = document.createElement('li');
  menLi.id = 'nav-men-li';
  menLi.innerHTML = `<a href="${base}men.html">مردانه</a>`;
  if (anchor) {
    anchor.insertAdjacentElement('afterend', menLi);
    anchor.insertAdjacentElement('afterend', womenLi);
  } else {
    links.insertBefore(menLi, links.firstChild);
    links.insertBefore(womenLi, links.firstChild);
  }
}

function initNav() {
  ensureNavGenderLinks();
  ensureNavHomePosition();
  Cart.updateBadge();
  const s       = Auth.getSession();
  const loginLi  = document.getElementById('nav-login-li');
  const adminLi  = document.getElementById('nav-admin-li');
  const logoutLi = document.getElementById('nav-logout-li');

  document.querySelectorAll('#nav-links > li > a').forEach(link => {
    const href = link.getAttribute('href') || '';
    const text = link.textContent.trim();
    if (href.includes('women.html') || text === 'زنانه') addNavIcon(link, NAV_ICONS.women);
    else if (href.includes('men.html') || text === 'مردانه') addNavIcon(link, NAV_ICONS.men);
    else if (href.includes('#collections') || text === 'مجموعه‌ها') addNavIcon(link, NAV_ICONS.collections);
    else if (isNavHomeLink(link)) addNavIcon(link, NAV_ICONS.home);
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



/* --- 10-product-modal.js --- */
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
        <dl class="pd-specs" aria-label="مشخصات محصول"></dl>
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

async function openProductDetail(id, collectionKey) {
  let p = Products.getCollection(collectionKey).find(x => x.id === id);
  if (!p && ArmehAPI.enabled()) {
    try {
      const data = await ArmehAPI.get('/api/products/' + encodeURIComponent(id));
      if (data?.product) {
        Products.mergeProduct(data.product, data.collection || collectionKey);
        p = data.product;
        collectionKey = data.collection || collectionKey;
      }
    } catch {
      return;
    }
  }
  if (!p) return;

  let images = getProductImages(p);
  const imageCount = getProductImageCount(p);
  if (imageCount > images.length && ArmehAPI.enabled()) {
    try {
      const data = await ArmehAPI.get('/api/products/' + encodeURIComponent(id));
      if (data?.product) {
        Products.mergeProduct(data.product, data.collection || collectionKey);
        p = data.product;
        images = getProductImages(p);
      }
    } catch { /* use thumbnail only */ }
  }

  initProductDetail();
  pdState = { id, collectionKey, images, index: 0, product: p };
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
    wrap.innerHTML = `<img class="pd-slide" src="${escHtml(imgs[pdState.index])}" alt="${escHtml(pdState.product.name)}" />`;
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
  const specsEl = ov.querySelector('.pd-specs');
  if (specsEl) specsEl.innerHTML = renderProductSpecsHtml(p);
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



/* --- 11-gold-price.js --- */
/* ── Nav gold price (server cache + TGJU fallback) ─ */
const TGJU_GOLD18_WIDGET = 'https://api.tgju.org/v1/widget/tmp?keys=137121';
const TGJU_GOLD18_AJAX = [
  'https://call2.tgju.org/ajax.json',
  'https://call5.tgju.org/ajax.json',
];
const TGJU_GOLD18_URL = 'https://www.tgju.org/profile/geram18';
const GOLD_PRICE_REFRESH_MS = 5 * 60 * 1000;

function formatGoldTickerToman(toman) {
  const value = Number(toman);
  if (!Number.isFinite(value) || value <= 0) return null;
  return value.toLocaleString('fa-IR') + ' تومان';
}

function parseTgjuWidgetPrice(data) {
  const indicator = data?.response?.indicators?.[0];
  if (!indicator?.p) return null;
  const rial = Number(String(indicator.p).replace(/,/g, ''));
  if (!Number.isFinite(rial) || rial <= 0) return null;
  return formatGoldTickerToman(Math.round(rial / 10));
}

function parseTgjuAjaxPrice(data) {
  const p = data?.current?.geram18?.p;
  if (p == null) return null;
  const rial = Number(String(p).replace(/,/g, ''));
  if (!Number.isFinite(rial) || rial <= 0) return null;
  return formatGoldTickerToman(Math.round(rial / 10));
}

function parseApiGoldPrice(data) {
  const g = data?.prices?.geram18;
  if (!g) return null;
  if (g.toman != null) return formatGoldTickerToman(g.toman);
  if (g.rial != null) return formatGoldTickerToman(Math.round(Number(g.rial) / 10));
  return null;
}

const GOLD_PRICE_FETCH_MS = 8000;

async function fetchWithTimeout(url, options = {}, ms = GOLD_PRICE_FETCH_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function fetchGoldPriceFromApi() {
  const base = typeof resolveApiBase === 'function' ? resolveApiBase() : '';
  const res = await fetchWithTimeout(base + '/api/gold-price', {
    credentials: typeof apiCredentials === 'function' ? apiCredentials() : 'same-origin',
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  const data = await res.json();
  const formatted = parseApiGoldPrice(data);
  if (!formatted) throw new Error('missing price');
  return formatted;
}

async function fetchGoldPriceFromTgjuWidget() {
  const res = await fetchWithTimeout(TGJU_GOLD18_WIDGET, { cache: 'no-store' });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  const data = await res.json();
  const formatted = parseTgjuWidgetPrice(data);
  if (!formatted) throw new Error('missing price');
  return formatted;
}

async function fetchGoldPriceFromTgjuAjax() {
  let lastError;
  for (const url of TGJU_GOLD18_AJAX) {
    try {
      const res = await fetchWithTimeout(url, { cache: 'no-store' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      const formatted = parseTgjuAjaxPrice(data);
      if (!formatted) throw new Error('missing price');
      return formatted;
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError || new Error('TGJU ajax unavailable');
}

async function fetchNavGoldPriceText() {
  const sources = [
    fetchGoldPriceFromApi,
    fetchGoldPriceFromTgjuWidget,
    fetchGoldPriceFromTgjuAjax,
  ];
  let lastError;
  for (const load of sources) {
    try {
      const text = await load();
      if (text) return text;
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError || new Error('gold price unavailable');
}

function getOrCreateNavCenter(nav) {
  let center = document.getElementById('nav-center');
  if (!center) {
    center = document.createElement('div');
    center.id = 'nav-center';
    center.className = 'nav-center';
    const toggle = nav.querySelector('.nav-toggle');
    if (toggle) nav.insertBefore(center, toggle);
    else nav.appendChild(center);
  }
  return center;
}

function initNavGoldPrice() {
  const nav = document.getElementById('nav');
  if (!nav) return;

  const center = getOrCreateNavCenter(nav);
  let ticker = document.getElementById('nav-gold-ticker');
  if (!ticker) {
    ticker = document.createElement('a');
    ticker.id = 'nav-gold-ticker';
    ticker.className = 'nav-gold-ticker is-loading';
    ticker.href = TGJU_GOLD18_URL;
    ticker.target = '_blank';
    ticker.rel = 'noopener noreferrer';
    ticker.title = 'قیمت لحظه‌ای طلای ۱۸ عیار، منبع: tgju.org';
    ticker.setAttribute('aria-label', 'قیمت لحظه‌ای طلای ۱۸ عیار از tgju.org');
    ticker.innerHTML = `
      <span class="nav-gold-label">طلای ۱۸</span>
      <span class="nav-gold-value" aria-live="polite">در حال بارگذاری…</span>`;
    center.appendChild(ticker);
  } else if (ticker.parentElement !== center) {
    center.appendChild(ticker);
  }

  const valueEl = ticker.querySelector('.nav-gold-value');
  if (!valueEl) return;

  if (ticker._goldRefreshTimer) {
    refreshGoldPrice();
    return;
  }

  let refreshing = false;

  async function refreshGoldPrice() {
    if (refreshing) return;
    refreshing = true;
    ticker.classList.add('is-loading');
    ticker.classList.remove('is-error');
    try {
      valueEl.textContent = await fetchNavGoldPriceText();
      ticker.classList.remove('is-error');
    } catch {
      valueEl.textContent = window.innerWidth <= 480 ? '-' : 'قیمت در دسترس نیست';
      ticker.classList.add('is-error');
    } finally {
      ticker.classList.remove('is-loading');
      refreshing = false;
    }
  }

  ticker._goldRefreshFn = refreshGoldPrice;
  refreshGoldPrice();
  ticker._goldRefreshTimer = setInterval(refreshGoldPrice, GOLD_PRICE_REFRESH_MS);
}

function refreshNavGoldPrice() {
  const ticker = document.getElementById('nav-gold-ticker');
  if (ticker?._goldRefreshFn) ticker._goldRefreshFn();
  else initNavGoldPrice();
}

function bootNavGoldPrice() {
  if (!document.getElementById('nav')) return;
  initNavGoldPrice();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootNavGoldPrice);
} else {
  bootNavGoldPrice();
}

window.addEventListener('load', function () {
  refreshNavGoldPrice();
});


/* --- 12-search.js --- */
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



/* --- 13-footer.js --- */
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



/* --- 14-intro.js --- */
/* ── Intro splash (homepage) ──────────────── */
function dismissIntroSplash() {
  const splash = document.getElementById('introSplash');
  if (!splash || splash.classList.contains('gone')) return;
  splash.classList.add('gone');
  document.documentElement.style.overflow = '';
  document.querySelectorAll('.reveal:not(.visible)').forEach(el => el.classList.add('visible'));
}

function initIntroSplash() {
  if (window.__armehSplashInit) return;
  window.__armehSplashInit = true;

  const splash = document.getElementById('introSplash');
  if (!splash) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || sessionStorage.getItem('armeh_intro_seen')) {
    dismissIntroSplash();
    sessionStorage.setItem('armeh_intro_seen', '1');
    return;
  }

  document.documentElement.style.overflow = 'hidden';
  const failSafe = setTimeout(() => {
    dismissIntroSplash();
    sessionStorage.setItem('armeh_intro_seen', '1');
  }, 5000);

  setTimeout(() => {
    splash.style.transition = 'opacity 0.8s ease';
    splash.style.opacity = '0';
    setTimeout(() => {
      clearTimeout(failSafe);
      dismissIntroSplash();
      sessionStorage.setItem('armeh_intro_seen', '1');
    }, 850);
  }, 2600);
}

function initRevealAnimations() {
  if (window.__armehRevealInit) return;
  window.__armehRevealInit = true;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (!e.isIntersecting) return;
      setTimeout(() => e.target.classList.add('visible'), i * 60);
      obs.unobserve(e.target);
    });
  }, { threshold: 0.08 });

  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));

  setTimeout(() => {
    document.querySelectorAll('.reveal:not(.visible)').forEach(el => el.classList.add('visible'));
  }, 2500);
}



/* --- 15-bootstrap.js --- */
/* ── Bootstrap ───────────────────────────── */
function armehBoot() {
  if (window.__armehBootDone) return;
  window.__armehBootDone = true;

  if (!document.getElementById('introSplash') || sessionStorage.getItem('armeh_intro_seen')) {
    document.documentElement.style.overflow = '';
  }
  initIntroSplash();
  initRevealAnimations();
  initNavSearch();
  initMobileNav();
  initProductDetail();
  initFooterInstagram();

  const nav = document.getElementById('nav');
  if (nav) window.addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 10), { passive: true });

  document.querySelectorAll('#year, .footer-year').forEach(el => el.textContent = new Date().getFullYear());

  function bootNavAndGold() {
    initNav();
    refreshNavGoldPrice();
  }

  bootNavAndGold();

  if (window.armehReady) {
    window.armehReady.then(function () {
      bootNavAndGold();
      Cart.updateBadge();
      const collMatch = window.location.pathname.match(/\/collections\/(\w+)\.html$/i);
      if (collMatch) renderCollectionPage(collMatch[1]);
      else if (/\/women\.html$/i.test(window.location.pathname)) renderGenderPage('women');
      else if (/\/men\.html$/i.test(window.location.pathname)) renderGenderPage('men');
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', armehBoot);
} else {
  armehBoot();
}

