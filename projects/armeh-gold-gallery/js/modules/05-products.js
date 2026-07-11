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

