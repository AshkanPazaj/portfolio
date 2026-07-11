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

